import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Appliance, ApplianceStateLog
from app.schemas import ApplianceCreate, ApplianceOut, ApplianceUpdate
from app.services.push_service import notify_household_appliance_clean
from app.websocket import ws_manager


class ApplianceNotFoundError(Exception):
    pass


class ApplianceTransitionError(Exception):
    pass


class ApplianceValidationError(Exception):
    pass


class AppliancePermissionError(Exception):
    pass


async def list_appliances(
    db: AsyncSession,
    household_id: uuid.UUID,
) -> list[Appliance]:
    stmt = (
        select(Appliance)
        .where(Appliance.household_id == household_id)
        .order_by(Appliance.name.asc())
    )
    res = await db.execute(stmt)
    return list(res.scalars().all())


async def create_appliance(
    db: AsyncSession,
    household_id: uuid.UUID,
    member_id: Optional[uuid.UUID],
    data: ApplianceCreate,
) -> Appliance:
    appliance = Appliance(
        household_id=household_id,
        name=data.name,
        type=data.icon or data.type or "custom",
        state_step_1=data.state_step_1 or "empty",
        state_step_2=data.state_step_2 or "running",
        state_step_3=data.state_step_3,
        state_step_4=data.state_step_4,
        state_step_5=data.state_step_5,
        current_state=data.state_step_1 or "empty",
        timer_enabled=data.timer_enabled,
        default_timer_minutes=data.default_timer_minutes,
        updated_by_member_id=member_id,
    )
    db.add(appliance)
    await db.commit()
    await db.refresh(appliance)
    await ws_manager.broadcast(
        household_id=appliance.household_id,
        event="APPLIANCE_STATE_CHANGED",
        data=ApplianceOut.model_validate(appliance).model_dump(mode="json"),
    )
    return appliance


async def get_appliance(
    db: AsyncSession,
    household_id: uuid.UUID,
    appliance_id: uuid.UUID,
) -> Appliance:
    stmt = select(Appliance).where(
        Appliance.id == appliance_id,
        Appliance.household_id == household_id,
    )
    res = await db.execute(stmt)
    appliance = res.scalar_one_or_none()
    if not appliance:
        raise ApplianceNotFoundError("Appliance not found in this household")
    return appliance


async def transition_appliance_state(
    db: AsyncSession,
    household_id: uuid.UUID,
    member_id: Optional[uuid.UUID],
    appliance_id: uuid.UUID,
    to_state: str,
    force: bool = False,
    timer_minutes: Optional[int] = None,
) -> Appliance:
    appliance = await get_appliance(db, household_id, appliance_id)
    ordered_steps = appliance.get_ordered_steps()

    # Normalize aliases: clean_needs_emptying <-> needs_attention
    target_to_state = to_state
    if target_to_state == "clean_needs_emptying" and "needs_attention" in ordered_steps:
        target_to_state = "needs_attention"

    normalized_current = appliance.current_state
    if normalized_current == "clean_needs_emptying" and "needs_attention" in ordered_steps:
        normalized_current = "needs_attention"

    if target_to_state == normalized_current:
        raise ApplianceTransitionError(f"Appliance is already in state '{to_state}'")

    expected_next = appliance.get_next_state(normalized_current)
    if not force:
        if target_to_state != expected_next:
            raise ApplianceTransitionError(
                f"Invalid state transition from '{appliance.current_state}' to '{to_state}'. "
                f"Expected next state: '{expected_next}'. Use force=true to override."
            )

    now = datetime.now(timezone.utc)

    # Timer validation when entering 'running'
    if target_to_state == "running" and appliance.timer_enabled:
        if not timer_minutes or timer_minutes <= 0:
            raise ApplianceValidationError(
                "Timer duration in minutes is required when starting an appliance with timers enabled."
            )
        appliance.timer_duration_minutes = timer_minutes
        appliance.timer_started_at = now
        appliance.timer_ends_at = now + timedelta(minutes=timer_minutes)
    else:
        appliance.timer_duration_minutes = None
        appliance.timer_started_at = None
        appliance.timer_ends_at = None

    from_state = appliance.current_state
    appliance.current_state = target_to_state
    appliance.state_updated_at = now
    appliance.updated_by_member_id = member_id

    state_log = ApplianceStateLog(
        appliance_id=appliance.id,
        from_state=from_state,
        to_state=target_to_state,
        trigger_source="manual",
        actor_member_id=member_id,
        created_at=now,
    )
    db.add(state_log)

    await db.commit()
    await db.refresh(appliance)
    await ws_manager.broadcast(
        household_id=appliance.household_id,
        event="APPLIANCE_STATE_CHANGED",
        data=ApplianceOut.model_validate(appliance).model_dump(mode="json"),
    )

    if appliance.current_state in ("clean_needs_emptying", "needs_attention"):
        await notify_household_appliance_clean(
            db=db,
            household_id=appliance.household_id,
            appliance_name=appliance.name,
        )

    return appliance


async def reset_appliance(
    db: AsyncSession,
    household_id: uuid.UUID,
    member_id: Optional[uuid.UUID],
    appliance_id: uuid.UUID,
) -> Appliance:
    appliance = await get_appliance(db, household_id, appliance_id)

    now = datetime.now(timezone.utc)
    from_state = appliance.current_state
    reset_state = appliance.state_step_1

    appliance.current_state = reset_state
    appliance.state_updated_at = now
    appliance.updated_by_member_id = member_id
    appliance.timer_started_at = None
    appliance.timer_ends_at = None
    appliance.timer_duration_minutes = None

    state_log = ApplianceStateLog(
        appliance_id=appliance.id,
        from_state=from_state,
        to_state=reset_state,
        trigger_source="reset",
        actor_member_id=member_id,
        created_at=now,
    )
    db.add(state_log)

    await db.commit()
    await db.refresh(appliance)
    await ws_manager.broadcast(
        household_id=appliance.household_id,
        event="APPLIANCE_STATE_CHANGED",
        data=ApplianceOut.model_validate(appliance).model_dump(mode="json"),
    )
    return appliance


async def update_appliance(
    db: AsyncSession,
    household_id: uuid.UUID,
    member_id: Optional[uuid.UUID],
    appliance_id: uuid.UUID,
    data: ApplianceUpdate,
) -> Appliance:
    appliance = await get_appliance(db, household_id, appliance_id)

    now = datetime.now(timezone.utc)
    if data.name is not None:
        appliance.name = data.name
    if data.icon is not None or data.type is not None:
        appliance.type = data.icon or data.type
    if data.timer_enabled is not None:
        appliance.timer_enabled = data.timer_enabled
    if data.default_timer_minutes is not None:
        appliance.default_timer_minutes = data.default_timer_minutes

    new_step_1 = data.state_step_1 if data.state_step_1 is not None else appliance.state_step_1
    new_step_2 = data.state_step_2 if data.state_step_2 is not None else appliance.state_step_2
    new_step_3 = data.state_step_3 if data.state_step_3 is not None else (appliance.state_step_3 if data.cycle_steps is None else None)
    new_step_4 = data.state_step_4 if data.state_step_4 is not None else (appliance.state_step_4 if data.cycle_steps is None else None)
    new_step_5 = data.state_step_5 if data.state_step_5 is not None else (appliance.state_step_5 if data.cycle_steps is None else None)

    if (
        data.cycle_steps is not None
        or data.state_step_1 is not None
        or data.state_step_2 is not None
        or data.state_step_3 is not None
        or data.state_step_4 is not None
        or data.state_step_5 is not None
    ):
        new_ordered = [s for s in [new_step_1, new_step_2, new_step_3, new_step_4, new_step_5] if s]
        current_ordered = appliance.get_ordered_steps()
        if new_ordered != current_ordered:
            appliance.state_step_1 = new_step_1
            appliance.state_step_2 = new_step_2
            appliance.state_step_3 = new_step_3
            appliance.state_step_4 = new_step_4
            appliance.state_step_5 = new_step_5

            from_state = appliance.current_state
            appliance.current_state = new_step_1
            appliance.state_updated_at = now
            appliance.timer_started_at = None
            appliance.timer_ends_at = None
            appliance.timer_duration_minutes = None

            state_log = ApplianceStateLog(
                appliance_id=appliance.id,
                from_state=from_state,
                to_state=new_step_1,
                trigger_source="config_reset",
                actor_member_id=member_id,
                created_at=now,
            )
            db.add(state_log)

    appliance.updated_by_member_id = member_id
    await db.commit()
    await db.refresh(appliance)

    await ws_manager.broadcast(
        household_id=appliance.household_id,
        event="APPLIANCE_STATE_CHANGED",
        data=ApplianceOut.model_validate(appliance).model_dump(mode="json"),
    )
    return appliance


async def get_appliance_history(
    db: AsyncSession,
    household_id: uuid.UUID,
    appliance_id: uuid.UUID,
    limit: int = 50,
) -> list[ApplianceStateLog]:
    appliance = await get_appliance(db, household_id, appliance_id)
    stmt = (
        select(ApplianceStateLog)
        .where(ApplianceStateLog.appliance_id == appliance.id)
        .order_by(ApplianceStateLog.created_at.desc())
        .limit(limit)
    )
    res = await db.execute(stmt)
    return list(res.scalars().all())


async def seed_default_appliances(
    db: AsyncSession,
    household_id: uuid.UUID,
) -> list[Appliance]:
    default_appliances = [
        Appliance(
            household_id=household_id,
            name="Dishwasher",
            type="dishwasher",
            state_step_1="dirty",
            state_step_2="running",
            state_step_3="needs_attention",
            current_state="dirty",
            timer_enabled=True,
            default_timer_minutes=60,
        ),
        Appliance(
            household_id=household_id,
            name="Washer",
            type="washer",
            state_step_1="empty",
            state_step_2="running",
            state_step_3="needs_attention",
            current_state="empty",
            timer_enabled=True,
            default_timer_minutes=45,
        ),
        Appliance(
            household_id=household_id,
            name="Dryer",
            type="dryer",
            state_step_1="empty",
            state_step_2="running",
            state_step_3="needs_attention",
            current_state="empty",
            timer_enabled=True,
            default_timer_minutes=45,
        ),
    ]
    db.add_all(default_appliances)
    return default_appliances
