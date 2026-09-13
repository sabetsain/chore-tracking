import uuid
from datetime import date, datetime, timedelta, timezone
from typing import Optional, Union
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Chore, ChoreAssignment, ChoreLog, Household, Member
from app.schemas import (
    ChoreAssignmentOut,
    ChoreCreate,
    ChoreLogCreate,
    ChoreLogOut,
    ChoreOut,
    ChoreSwapRequest,
    ChoreUpdate,
)
from app.websocket import ws_manager


class ChoreNotFoundError(Exception):
    pass


class ChoreValidationError(Exception):
    pass


class ChorePermissionError(Exception):
    pass


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


async def _resolve_household(db: AsyncSession, household: Union[Household, uuid.UUID]) -> Household:
    if isinstance(household, Household):
        return household
    hh = await db.get(Household, household)
    if not hh:
        raise ChoreNotFoundError("Household not found")
    return hh


async def get_or_generate_weekly_assignments(
    db: AsyncSession,
    household_id: uuid.UUID,
    week_start_date: date,
) -> list[ChoreAssignment]:
    household = await db.get(Household, household_id)
    is_rotation_active = household.chore_rotation_active if household else False

    chore_stmt = (
        select(Chore)
        .where(Chore.household_id == household_id, Chore.is_active == True)
        .order_by(Chore.created_at.asc(), Chore.id.asc())
    )
    chore_res = await db.execute(chore_stmt)
    active_chores = list(chore_res.scalars().all())

    member_stmt = (
        select(Member)
        .where(Member.household_id == household_id)
        .order_by(Member.created_at.asc(), Member.id.asc())
    )
    member_res = await db.execute(member_stmt)
    all_members = list(member_res.scalars().all())
    active_members = [m for m in all_members if m.status == "active"]
    N = len(active_members)

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


# --- Chore Template CRUD Operations ---


async def list_chores(
    db: AsyncSession,
    household_id: uuid.UUID,
    is_active: Optional[bool] = None,
) -> list[Chore]:
    stmt = select(Chore).where(Chore.household_id == household_id)
    if is_active is not None:
        stmt = stmt.where(Chore.is_active == is_active)
    stmt = stmt.order_by(Chore.created_at.asc())
    res = await db.execute(stmt)
    return list(res.scalars().all())


async def create_chore(
    db: AsyncSession,
    household_id: uuid.UUID,
    data: ChoreCreate,
) -> Chore:
    chore = Chore(
        household_id=household_id,
        title=data.title,
        description=data.description,
        effort_weight=data.effort_weight,
        completion_type=data.completion_type,
        is_active=True,
    )
    db.add(chore)
    await db.commit()
    await db.refresh(chore)

    # Auto-provision assignment for the active current week
    await get_or_generate_weekly_assignments(
        db=db,
        household_id=chore.household_id,
        week_start_date=get_current_week_start(),
    )

    await ws_manager.broadcast(
        household_id=chore.household_id,
        event="CHORE_UPDATED",
        data={"action": "created", "chore": ChoreOut.model_validate(chore).model_dump(mode="json")},
    )
    return chore


async def get_chore(
    db: AsyncSession,
    household_id: uuid.UUID,
    chore_id: uuid.UUID,
) -> Chore:
    stmt = select(Chore).where(
        Chore.id == chore_id,
        Chore.household_id == household_id,
    )
    res = await db.execute(stmt)
    chore = res.scalar_one_or_none()
    if not chore:
        raise ChoreNotFoundError("Chore not found in this household")
    return chore


async def update_chore(
    db: AsyncSession,
    household_id: uuid.UUID,
    chore_id: uuid.UUID,
    data: ChoreUpdate,
) -> Chore:
    chore = await get_chore(db, household_id, chore_id)

    if data.title is not None:
        chore.title = data.title
    if data.description is not None:
        chore.description = data.description
    if data.effort_weight is not None:
        chore.effort_weight = data.effort_weight
    if data.completion_type is not None:
        chore.completion_type = data.completion_type
    if data.is_active is not None:
        chore.is_active = data.is_active

    await db.commit()
    await db.refresh(chore)
    await ws_manager.broadcast(
        household_id=chore.household_id,
        event="CHORE_UPDATED",
        data={"action": "updated", "chore": ChoreOut.model_validate(chore).model_dump(mode="json")},
    )
    return chore


async def delete_chore(
    db: AsyncSession,
    household_id: uuid.UUID,
    chore_id: uuid.UUID,
) -> None:
    chore = await get_chore(db, household_id, chore_id)
    await db.delete(chore)
    await db.commit()
    await ws_manager.broadcast(
        household_id=household_id,
        event="CHORE_UPDATED",
        data={"action": "deleted", "chore_id": str(chore_id)},
    )


# --- Assignment Operations ---


async def get_weekly_assignments(
    db: AsyncSession,
    household_id: uuid.UUID,
    week_start_date: Optional[date] = None,
) -> list[ChoreAssignment]:
    target_date = get_current_week_start(week_start_date)
    return await get_or_generate_weekly_assignments(
        db=db,
        household_id=household_id,
        week_start_date=target_date,
    )


async def get_up_for_grabs_chores(
    db: AsyncSession,
    household_id: uuid.UUID,
    week_start_date: Optional[date] = None,
) -> list[ChoreAssignment]:
    assignments = await get_weekly_assignments(db, household_id, week_start_date)
    up_for_grabs: list[ChoreAssignment] = []
    for a in assignments:
        if a.status == "pending":
            if a.member_id is None:
                up_for_grabs.append(a)
            elif a.member and a.member.status == "away":
                up_for_grabs.append(a)
    return up_for_grabs


async def claim_chore(
    db: AsyncSession,
    household_id: uuid.UUID,
    assignment_id: uuid.UUID,
    member_id: uuid.UUID,
) -> ChoreAssignment:
    stmt = (
        select(ChoreAssignment)
        .join(Chore, ChoreAssignment.chore_id == Chore.id)
        .where(
            ChoreAssignment.id == assignment_id,
            Chore.household_id == household_id,
        )
    )
    res = await db.execute(stmt)
    assignment = res.scalar_one_or_none()
    if not assignment:
        raise ChoreNotFoundError("Chore assignment not found in this household")

    if assignment.status != "pending":
        raise ChoreValidationError("Cannot claim a completed or non-pending chore")

    assignment.member_id = member_id
    await db.commit()
    await db.refresh(assignment)
    await ws_manager.broadcast(
        household_id=household_id,
        event="CHORE_UPDATED",
        data={"action": "claimed", "assignment": ChoreAssignmentOut.model_validate(assignment).model_dump(mode="json")},
    )
    return assignment


async def unclaim_chore(
    db: AsyncSession,
    household_id: uuid.UUID,
    assignment_id: uuid.UUID,
    current_member: Member,
) -> ChoreAssignment:
    stmt = (
        select(ChoreAssignment)
        .join(Chore, ChoreAssignment.chore_id == Chore.id)
        .where(
            ChoreAssignment.id == assignment_id,
            Chore.household_id == household_id,
        )
    )
    res = await db.execute(stmt)
    assignment = res.scalar_one_or_none()
    if not assignment:
        raise ChoreNotFoundError("Chore assignment not found in this household")

    if assignment.status != "pending":
        raise ChoreValidationError("Cannot unclaim a completed or non-pending chore")

    household = await db.get(Household, household_id)
    if not household:
        raise ChoreNotFoundError("Household not found")

    if household.chore_rotation_active:
        raise ChoreValidationError("Cannot unclaim chores when cyclical chore rotation is active; use reassignment or swap instead")

    if assignment.member_id != current_member.id and current_member.role != "admin":
        raise ChorePermissionError("Only assigned member or admin can unclaim this chore")

    assignment.member_id = None
    await db.commit()
    await db.refresh(assignment)
    await ws_manager.broadcast(
        household_id=household_id,
        event="CHORE_UPDATED",
        data={"action": "unclaimed", "assignment": ChoreAssignmentOut.model_validate(assignment).model_dump(mode="json")},
    )
    return assignment


async def complete_chore(
    db: AsyncSession,
    household_id: uuid.UUID,
    assignment_id: uuid.UUID,
    current_member: Member,
) -> ChoreAssignment:
    stmt = (
        select(ChoreAssignment)
        .join(Chore, ChoreAssignment.chore_id == Chore.id)
        .where(
            ChoreAssignment.id == assignment_id,
            Chore.household_id == household_id,
        )
    )
    res = await db.execute(stmt)
    assignment = res.scalar_one_or_none()
    if not assignment:
        raise ChoreNotFoundError("Chore assignment not found in this household")

    if assignment.member_id is not None and assignment.member_id != current_member.id and current_member.role != "admin":
        raise ChorePermissionError("Only assigned member or admin can complete this chore")

    assignment.status = "completed"
    assignment.completed_at = datetime.now(timezone.utc)
    assignment.completed_by_member_id = current_member.id

    await db.commit()
    await db.refresh(assignment)
    await ws_manager.broadcast(
        household_id=household_id,
        event="CHORE_UPDATED",
        data={"action": "completed", "assignment": ChoreAssignmentOut.model_validate(assignment).model_dump(mode="json")},
    )
    return assignment


async def uncomplete_chore(
    db: AsyncSession,
    household_id: uuid.UUID,
    assignment_id: uuid.UUID,
    current_member: Member,
) -> ChoreAssignment:
    stmt = (
        select(ChoreAssignment)
        .join(Chore, ChoreAssignment.chore_id == Chore.id)
        .where(
            ChoreAssignment.id == assignment_id,
            Chore.household_id == household_id,
        )
    )
    res = await db.execute(stmt)
    assignment = res.scalar_one_or_none()
    if not assignment:
        raise ChoreNotFoundError("Chore assignment not found in this household")

    if assignment.member_id is not None and assignment.member_id != current_member.id and current_member.role != "admin":
        raise ChorePermissionError("Only assigned member or admin can uncomplete this chore")

    assignment.status = "pending"
    assignment.completed_at = None
    assignment.completed_by_member_id = None

    await db.commit()
    await db.refresh(assignment)
    await ws_manager.broadcast(
        household_id=household_id,
        event="CHORE_UPDATED",
        data={"action": "uncompleted", "assignment": ChoreAssignmentOut.model_validate(assignment).model_dump(mode="json")},
    )
    return assignment


async def reassign_chore(
    db: AsyncSession,
    household_id: uuid.UUID,
    assignment_id: uuid.UUID,
    current_member: Member,
    target_member_id: uuid.UUID,
) -> ChoreAssignment:
    stmt = (
        select(ChoreAssignment)
        .join(Chore, ChoreAssignment.chore_id == Chore.id)
        .where(
            ChoreAssignment.id == assignment_id,
            Chore.household_id == household_id,
        )
    )
    res = await db.execute(stmt)
    assignment = res.scalar_one_or_none()
    if not assignment:
        raise ChoreNotFoundError("Chore assignment not found in this household")

    target_member = await db.scalar(
        select(Member).where(
            Member.id == target_member_id,
            Member.household_id == household_id,
        )
    )
    if not target_member:
        raise ChoreNotFoundError("Target member not found in this household")

    assignment.member_id = target_member_id

    await db.commit()
    await db.refresh(assignment)
    await ws_manager.broadcast(
        household_id=household_id,
        event="CHORE_UPDATED",
        data={"action": "reassigned", "assignment": ChoreAssignmentOut.model_validate(assignment).model_dump(mode="json")},
    )
    return assignment


async def swap_chore(
    db: AsyncSession,
    household_id: uuid.UUID,
    assignment_id: uuid.UUID,
    current_member: Member,
    data: ChoreSwapRequest,
) -> ChoreAssignment:
    if assignment_id == data.target_assignment_id:
        raise ChoreValidationError("Cannot swap an assignment with itself")

    stmt1 = (
        select(ChoreAssignment)
        .join(Chore, ChoreAssignment.chore_id == Chore.id)
        .where(
            ChoreAssignment.id == assignment_id,
            Chore.household_id == household_id,
        )
    )
    res1 = await db.execute(stmt1)
    assignment1 = res1.scalar_one_or_none()
    if not assignment1:
        raise ChoreNotFoundError("Source chore assignment not found in this household")

    stmt2 = (
        select(ChoreAssignment)
        .join(Chore, ChoreAssignment.chore_id == Chore.id)
        .where(
            ChoreAssignment.id == data.target_assignment_id,
            Chore.household_id == household_id,
        )
    )
    res2 = await db.execute(stmt2)
    assignment2 = res2.scalar_one_or_none()
    if not assignment2:
        raise ChoreNotFoundError("Target chore assignment not found in this household")

    if assignment1.week_start_date != assignment2.week_start_date:
        raise ChoreValidationError("Assignments must be in the same week to swap")

    if assignment1.status != "pending" or assignment2.status != "pending":
        raise ChoreValidationError("Cannot swap completed or non-pending chore assignments")

    assignment1.member_id, assignment2.member_id = assignment2.member_id, assignment1.member_id

    await db.commit()
    await db.refresh(assignment1)
    await db.refresh(assignment2)
    await ws_manager.broadcast(
        household_id=household_id,
        event="CHORE_UPDATED",
        data={"action": "swapped", "assignment": ChoreAssignmentOut.model_validate(assignment1).model_dump(mode="json")},
    )
    return assignment1


async def log_duty(
    db: AsyncSession,
    household_id: uuid.UUID,
    assignment_id: uuid.UUID,
    current_member: Member,
    data: ChoreLogCreate,
) -> ChoreLog:
    stmt = (
        select(ChoreAssignment)
        .join(Chore, ChoreAssignment.chore_id == Chore.id)
        .where(
            ChoreAssignment.id == assignment_id,
            Chore.household_id == household_id,
        )
    )
    res = await db.execute(stmt)
    assignment = res.scalar_one_or_none()
    if not assignment:
        raise ChoreNotFoundError("Chore assignment not found in this household")

    chore_log = ChoreLog(
        assignment_id=assignment.id,
        actor_member_id=current_member.id,
        note=data.note,
    )
    db.add(chore_log)
    await db.commit()
    await db.refresh(chore_log)
    await ws_manager.broadcast(
        household_id=household_id,
        event="CHORE_UPDATED",
        data={"action": "logged", "log": ChoreLogOut.model_validate(chore_log).model_dump(mode="json")},
    )
    return chore_log


async def get_chore_logs(
    db: AsyncSession,
    household_id: uuid.UUID,
    assignment_id: uuid.UUID,
) -> list[ChoreLog]:
    stmt = (
        select(ChoreAssignment)
        .join(Chore, ChoreAssignment.chore_id == Chore.id)
        .where(
            ChoreAssignment.id == assignment_id,
            Chore.household_id == household_id,
        )
    )
    res = await db.execute(stmt)
    assignment = res.scalar_one_or_none()
    if not assignment:
        raise ChoreNotFoundError("Chore assignment not found in this household")

    log_stmt = (
        select(ChoreLog)
        .where(ChoreLog.assignment_id == assignment.id)
        .order_by(ChoreLog.logged_at.desc())
    )
    log_res = await db.execute(log_stmt)
    return list(log_res.scalars().all())


# --- Rotation Operations ---


async def activate_chore_rotation(
    db: AsyncSession,
    household: Union[Household, uuid.UUID],
) -> list[ChoreAssignment]:
    household_obj = await _resolve_household(db, household)
    household_id = household_obj.id
    household_obj.chore_rotation_active = True
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
    household: Union[Household, uuid.UUID],
) -> list[ChoreAssignment]:
    household_obj = await _resolve_household(db, household)
    household_id = household_obj.id
    household_obj.chore_rotation_active = False
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
    household: Union[Household, uuid.UUID],
) -> list[ChoreAssignment]:
    household_obj = await _resolve_household(db, household)
    household_id = household_obj.id
    is_active = household_obj.chore_rotation_active
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
