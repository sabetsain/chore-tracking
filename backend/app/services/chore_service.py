import uuid
from datetime import date, timedelta
from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Chore, ChoreAssignment, Household, Member


def get_current_week_start(d: Optional[date] = None) -> date:
    if d is None:
        d = date.today()
    # Sunday is week start date: Sunday is weekday 6, Monday is 0
    days_since_sunday = (d.weekday() + 1) % 7
    return d - timedelta(days=days_since_sunday)


EPOCH_DATE = date(2026, 1, 4)


def partition_chores_lpt(
    active_chores: list[Chore],
    active_members: list[Member],
    week_start_date: date,
) -> dict[uuid.UUID, uuid.UUID]:
    N = len(active_members)
    if N == 0:
        return {}

    sorted_chores = sorted(
        active_chores,
        key=lambda c: (-c.effort_weight, c.created_at, c.id),
    )

    buckets: list[list[Chore]] = [[] for _ in range(N)]
    bucket_weights = [0 for _ in range(N)]

    for chore in sorted_chores:
        b = min(range(N), key=lambda idx: (bucket_weights[idx], idx))
        buckets[b].append(chore)
        bucket_weights[b] += chore.effort_weight

    week_index = (week_start_date - EPOCH_DATE).days // 7
    chore_to_member: dict[uuid.UUID, uuid.UUID] = {}

    for b in range(N):
        assignee = active_members[(b - week_index) % N]
        for chore in buckets[b]:
            chore_to_member[chore.id] = assignee.id

    return chore_to_member


async def get_or_generate_weekly_assignments(
    db: AsyncSession,
    household_id: uuid.UUID,
    week_start_date: date,
) -> list[ChoreAssignment]:
    household = await db.get(Household, household_id)
    is_rotation_active = household.chore_rotation_active if household else False

    # 1. Fetch all active chores for the household
    chore_stmt = (
        select(Chore)
        .where(Chore.household_id == household_id, Chore.is_active == True)
        .order_by(Chore.created_at.asc(), Chore.id.asc())
    )
    chore_res = await db.execute(chore_stmt)
    active_chores = list(chore_res.scalars().all())

    # 2. Fetch all members for the household, sorted by created_at.asc(), id.asc()
    member_stmt = (
        select(Member)
        .where(Member.household_id == household_id)
        .order_by(Member.created_at.asc(), Member.id.asc())
    )
    member_res = await db.execute(member_stmt)
    all_members = list(member_res.scalars().all())
    active_members = [m for m in all_members if m.status == "active"]
    N = len(active_members)

    # 3. Fetch existing assignments for this week
    existing_stmt = (
        select(ChoreAssignment)
        .join(Chore, ChoreAssignment.chore_id == Chore.id)
        .where(
            Chore.household_id == household_id,
            ChoreAssignment.week_start_date == week_start_date,
        )
    )
    existing_res = await db.execute(existing_stmt)
    existing_assignments = list(existing_res.scalars().all())
    assigned_chore_ids = {a.chore_id for a in existing_assignments}

    created_any = False
    newly_assigned: list[tuple[uuid.UUID, str]] = []

    if not is_rotation_active or N == 0:
        for chore in active_chores:
            if chore.id not in assigned_chore_ids:
                new_assignment = ChoreAssignment(
                    chore_id=chore.id,
                    member_id=None,
                    week_start_date=week_start_date,
                    status="pending",
                )
                db.add(new_assignment)
                created_any = True
    else:
        chore_to_member = partition_chores_lpt(active_chores, active_members, week_start_date)
        for chore in active_chores:
            if chore.id not in assigned_chore_ids:
                assigned_member_id = chore_to_member.get(chore.id)
                new_assignment = ChoreAssignment(
                    chore_id=chore.id,
                    member_id=assigned_member_id,
                    week_start_date=week_start_date,
                    status="pending",
                )
                db.add(new_assignment)
                created_any = True
                if assigned_member_id:
                    newly_assigned.append((assigned_member_id, chore.title))

    if created_any:
        await db.commit()
        db.expire_all()
        from app.services.push_service import notify_member_chore_assignment
        for mem_id, title in newly_assigned:
            await notify_member_chore_assignment(db=db, member_id=mem_id, chore_title=title)

    # Return all weekly assignments ordered by Chore.created_at.asc(), Chore.id.asc()
    res_stmt = (
        select(ChoreAssignment)
        .options(
            selectinload(ChoreAssignment.member),
            selectinload(ChoreAssignment.chore),
            selectinload(ChoreAssignment.completed_by_member),
        )
        .execution_options(populate_existing=True)
        .join(Chore, ChoreAssignment.chore_id == Chore.id)
        .where(
            Chore.household_id == household_id,
            ChoreAssignment.week_start_date == week_start_date,
        )
        .order_by(Chore.created_at.asc(), Chore.id.asc())
    )
    final_res = await db.execute(res_stmt)
    return list(final_res.scalars().all())


async def activate_chore_rotation(
    db: AsyncSession,
    household: Household,
) -> list[ChoreAssignment]:
    household_id = household.id
    household.chore_rotation_active = True
    week_start_date = get_current_week_start()

    chore_stmt = (
        select(Chore)
        .where(Chore.household_id == household_id, Chore.is_active == True)
        .order_by(Chore.created_at.asc(), Chore.id.asc())
    )
    active_chores = list((await db.execute(chore_stmt)).scalars().all())

    member_stmt = (
        select(Member)
        .where(Member.household_id == household_id)
        .order_by(Member.created_at.asc(), Member.id.asc())
    )
    all_members = list((await db.execute(member_stmt)).scalars().all())
    active_members = [m for m in all_members if m.status == "active"]

    existing_stmt = (
        select(ChoreAssignment)
        .join(Chore, ChoreAssignment.chore_id == Chore.id)
        .where(
            Chore.household_id == household_id,
            ChoreAssignment.week_start_date == week_start_date,
        )
    )
    existing_assignments = list((await db.execute(existing_stmt)).scalars().all())
    assigned_chore_map = {a.chore_id: a for a in existing_assignments}

    chore_to_member = partition_chores_lpt(active_chores, active_members, week_start_date)
    newly_assigned: list[tuple[uuid.UUID, str]] = []

    for chore in active_chores:
        target_member_id = chore_to_member.get(chore.id)
        if chore.id in assigned_chore_map:
            assignment = assigned_chore_map[chore.id]
            if assignment.status == "pending":
                assignment.member_id = target_member_id
                if target_member_id:
                    newly_assigned.append((target_member_id, chore.title))
        else:
            new_assignment = ChoreAssignment(
                chore_id=chore.id,
                member_id=target_member_id,
                week_start_date=week_start_date,
                status="pending",
            )
            db.add(new_assignment)
            if target_member_id:
                newly_assigned.append((target_member_id, chore.title))

    await db.commit()

    from app.services.push_service import notify_member_chore_assignment
    for mem_id, title in newly_assigned:
        await notify_member_chore_assignment(db=db, member_id=mem_id, chore_title=title)

    from app.websocket import ws_manager
    await ws_manager.broadcast(
        household_id=household_id,
        event="CHORE_ROTATION_CHANGED",
        data={"household_id": str(household_id), "chore_rotation_active": True},
    )
    await ws_manager.broadcast(
        household_id=household_id,
        event="CHORE_UPDATED",
        data={"action": "rotation_activated"},
    )

    res_stmt = (
        select(ChoreAssignment)
        .options(
            selectinload(ChoreAssignment.member),
            selectinload(ChoreAssignment.chore),
            selectinload(ChoreAssignment.completed_by_member),
        )
        .execution_options(populate_existing=True)
        .join(Chore, ChoreAssignment.chore_id == Chore.id)
        .where(
            Chore.household_id == household_id,
            ChoreAssignment.week_start_date == week_start_date,
        )
        .order_by(Chore.created_at.asc(), Chore.id.asc())
    )
    final_res = await db.execute(res_stmt)
    return list(final_res.scalars().all())


async def deactivate_chore_rotation(
    db: AsyncSession,
    household: Household,
) -> list[ChoreAssignment]:
    household_id = household.id
    household.chore_rotation_active = False
    week_start_date = get_current_week_start()

    existing_stmt = (
        select(ChoreAssignment)
        .join(Chore, ChoreAssignment.chore_id == Chore.id)
        .where(
            Chore.household_id == household_id,
            ChoreAssignment.week_start_date == week_start_date,
            ChoreAssignment.status == "pending",
        )
    )
    pending_assignments = list((await db.execute(existing_stmt)).scalars().all())
    for assignment in pending_assignments:
        assignment.member_id = None

    await db.commit()

    from app.websocket import ws_manager
    await ws_manager.broadcast(
        household_id=household_id,
        event="CHORE_ROTATION_CHANGED",
        data={"household_id": str(household_id), "chore_rotation_active": False},
    )
    await ws_manager.broadcast(
        household_id=household_id,
        event="CHORE_UPDATED",
        data={"action": "rotation_deactivated"},
    )

    res_stmt = (
        select(ChoreAssignment)
        .options(
            selectinload(ChoreAssignment.member),
            selectinload(ChoreAssignment.chore),
            selectinload(ChoreAssignment.completed_by_member),
        )
        .execution_options(populate_existing=True)
        .join(Chore, ChoreAssignment.chore_id == Chore.id)
        .where(
            Chore.household_id == household_id,
            ChoreAssignment.week_start_date == week_start_date,
        )
        .order_by(Chore.created_at.asc(), Chore.id.asc())
    )
    final_res = await db.execute(res_stmt)
    return list(final_res.scalars().all())


async def reshuffle_chore_rotation(
    db: AsyncSession,
    household: Household,
) -> list[ChoreAssignment]:
    household_id = household.id
    is_active = household.chore_rotation_active
    week_start_date = get_current_week_start()

    chore_stmt = (
        select(Chore)
        .where(Chore.household_id == household_id, Chore.is_active == True)
        .order_by(Chore.created_at.asc(), Chore.id.asc())
    )
    active_chores = list((await db.execute(chore_stmt)).scalars().all())

    member_stmt = (
        select(Member)
        .where(Member.household_id == household_id)
        .order_by(Member.created_at.asc(), Member.id.asc())
    )
    all_members = list((await db.execute(member_stmt)).scalars().all())
    active_members = [m for m in all_members if m.status == "active"]

    existing_stmt = (
        select(ChoreAssignment)
        .join(Chore, ChoreAssignment.chore_id == Chore.id)
        .where(
            Chore.household_id == household_id,
            ChoreAssignment.week_start_date == week_start_date,
        )
    )
    existing_assignments = list((await db.execute(existing_stmt)).scalars().all())
    assigned_chore_map = {a.chore_id: a for a in existing_assignments}

    chore_to_member = partition_chores_lpt(active_chores, active_members, week_start_date)

    for chore in active_chores:
        target_member_id = chore_to_member.get(chore.id)
        if chore.id in assigned_chore_map:
            assignment = assigned_chore_map[chore.id]
            if assignment.status == "pending":
                assignment.member_id = target_member_id
        else:
            new_assignment = ChoreAssignment(
                chore_id=chore.id,
                member_id=target_member_id,
                week_start_date=week_start_date,
                status="pending",
            )
            db.add(new_assignment)

    await db.commit()

    from app.websocket import ws_manager
    await ws_manager.broadcast(
        household_id=household_id,
        event="CHORE_ROTATION_CHANGED",
        data={"household_id": str(household_id), "chore_rotation_active": is_active},
    )
    await ws_manager.broadcast(
        household_id=household_id,
        event="CHORE_UPDATED",
        data={"action": "rotation_reshuffled"},
    )

    res_stmt = (
        select(ChoreAssignment)
        .options(
            selectinload(ChoreAssignment.member),
            selectinload(ChoreAssignment.chore),
            selectinload(ChoreAssignment.completed_by_member),
        )
        .execution_options(populate_existing=True)
        .join(Chore, ChoreAssignment.chore_id == Chore.id)
        .where(
            Chore.household_id == household_id,
            ChoreAssignment.week_start_date == week_start_date,
        )
        .order_by(Chore.created_at.asc(), Chore.id.asc())
    )
    final_res = await db.execute(res_stmt)
    return list(final_res.scalars().all())


