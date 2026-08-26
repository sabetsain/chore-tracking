import uuid
from datetime import date, timedelta
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Chore, ChoreAssignment, Member


def get_current_week_start(d: Optional[date] = None) -> date:
    if d is None:
        d = date.today()
    # Sunday is week start date: Sunday is weekday 6, Monday is 0
    days_since_sunday = (d.weekday() + 1) % 7
    return d - timedelta(days=days_since_sunday)


async def get_or_generate_weekly_assignments(
    db: AsyncSession,
    household_id: uuid.UUID,
    week_start_date: date,
) -> list[ChoreAssignment]:
    # 1. Fetch all active chores for the household
    chore_stmt = (
        select(Chore)
        .where(Chore.household_id == household_id, Chore.is_active == True)
        .order_by(Chore.created_at.asc(), Chore.id.asc())
    )
    chore_res = await db.execute(chore_stmt)
    active_chores = chore_res.scalars().all()

    # 2. Fetch existing assignments for this week
    existing_stmt = (
        select(ChoreAssignment)
        .join(Chore, ChoreAssignment.chore_id == Chore.id)
        .where(
            Chore.household_id == household_id,
            ChoreAssignment.week_start_date == week_start_date,
        )
    )
    existing_res = await db.execute(existing_stmt)
    existing_assignments = existing_res.scalars().all()
    assigned_chore_ids = {a.chore_id for a in existing_assignments}

    # 3. Fetch all members for the household
    member_stmt = (
        select(Member)
        .where(Member.household_id == household_id)
        .order_by(Member.created_at.asc(), Member.id.asc())
    )
    member_res = await db.execute(member_stmt)
    all_members = member_res.scalars().all()

    # Map member id to index
    member_index_map = {m.id: idx for idx, m in enumerate(all_members)}

    created_any = False
    newly_assigned = []
    for chore_idx, chore in enumerate(active_chores):
        if chore.id in assigned_chore_ids:
            continue

        # Look for the most recent prior assignment for this chore
        prior_stmt = (
            select(ChoreAssignment)
            .where(
                ChoreAssignment.chore_id == chore.id,
                ChoreAssignment.week_start_date < week_start_date,
            )
            .order_by(ChoreAssignment.week_start_date.desc())
            .limit(1)
        )
        prior_res = await db.execute(prior_stmt)
        prior_assignment = prior_res.scalar_one_or_none()

        start_index = 0
        if len(all_members) > 0:
            if prior_assignment and prior_assignment.member_id and prior_assignment.member_id in member_index_map:
                prior_idx = member_index_map[prior_assignment.member_id]
                start_index = (prior_idx + 1) % len(all_members)
            else:
                start_index = chore_idx % len(all_members)

        # Round-robin scan for the first active member
        assigned_member = None
        if len(all_members) > 0:
            for offset in range(len(all_members)):
                cand_idx = (start_index + offset) % len(all_members)
                candidate = all_members[cand_idx]
                if candidate.status == "active":
                    assigned_member = candidate
                    break

        new_assignment = ChoreAssignment(
            chore_id=chore.id,
            member_id=assigned_member.id if assigned_member else None,
            week_start_date=week_start_date,
            status="pending",
        )
        db.add(new_assignment)
        created_any = True
        if assigned_member:
            newly_assigned.append((assigned_member.id, chore.title))

    if created_any:
        await db.commit()
        from app.services.push_service import notify_member_chore_assignment
        for mem_id, title in newly_assigned:
            await notify_member_chore_assignment(db=db, member_id=mem_id, chore_title=title)

    # Return all assignments for the week ordered consistently
    res_stmt = (
        select(ChoreAssignment)
        .join(Chore, ChoreAssignment.chore_id == Chore.id)
        .where(
            Chore.household_id == household_id,
            ChoreAssignment.week_start_date == week_start_date,
        )
        .order_by(Chore.created_at.asc(), Chore.id.asc())
    )
    final_res = await db.execute(res_stmt)
    return list(final_res.scalars().all())
