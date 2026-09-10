import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Appliance, ApplianceStateLog, Member
from app.schemas import (
    ApplianceCreate,
    ApplianceOut,
    ApplianceStateLogOut,
    ApplianceStateUpdate,
    ApplianceUpdate,
    SensorEventCreate,
)
from app.security import get_current_member
from app.services.push_service import notify_household_appliance_clean
from app.websocket import ws_manager

router = APIRouter(prefix="/api/v1/appliances", tags=["appliances"])


@router.get("", response_model=list[ApplianceOut], status_code=status.HTTP_200_OK)
async def list_appliances(
    current_member: Member = Depends(get_current_member),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Appliance)
        .where(Appliance.household_id == current_member.household_id)
        .order_by(Appliance.name.asc())
    )
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("", response_model=ApplianceOut, status_code=status.HTTP_201_CREATED)
async def create_appliance(
    data: ApplianceCreate,
    current_member: Member = Depends(get_current_member),
    db: AsyncSession = Depends(get_db),
):
    appliance = Appliance(
        household_id=current_member.household_id,
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
        updated_by_member_id=current_member.id,
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


@router.post("/{appliance_id}/state", response_model=ApplianceOut, status_code=status.HTTP_200_OK)
async def update_appliance_state(
    appliance_id: uuid.UUID,
    data: ApplianceStateUpdate,
    current_member: Member = Depends(get_current_member),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Appliance).where(
        Appliance.id == appliance_id,
        Appliance.household_id == current_member.household_id,
    )
    res = await db.execute(stmt)
    appliance = res.scalar_one_or_none()
    if not appliance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appliance not found in this household",
        )

    ordered_steps = appliance.get_ordered_steps()

    # Normalize aliases: clean_needs_emptying <-> needs_attention
    target_to_state = data.to_state
    if target_to_state == "clean_needs_emptying" and "needs_attention" in ordered_steps:
        target_to_state = "needs_attention"

    normalized_current = appliance.current_state
    if normalized_current == "clean_needs_emptying" and "needs_attention" in ordered_steps:
        normalized_current = "needs_attention"

    if target_to_state == normalized_current:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Appliance is already in state '{data.to_state}'",
        )

    expected_next = appliance.get_next_state(normalized_current)
    if not data.force:
        if target_to_state != expected_next:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Invalid state transition from '{appliance.current_state}' to '{data.to_state}'. "
                    f"Expected next state: '{expected_next}'. Use force=true to override."
                ),
            )

    now = datetime.now(timezone.utc)

    # Timer validation when entering 'running'
    if target_to_state == "running" and appliance.timer_enabled:
        if not data.timer_duration_minutes or data.timer_duration_minutes <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Timer duration in minutes is required when starting an appliance with timers enabled.",
            )
        appliance.timer_duration_minutes = data.timer_duration_minutes
        appliance.timer_started_at = now
        appliance.timer_ends_at = now + timedelta(minutes=data.timer_duration_minutes)
    else:
        appliance.timer_duration_minutes = None
        appliance.timer_started_at = None
        appliance.timer_ends_at = None

    from_state = appliance.current_state
    appliance.current_state = target_to_state
    appliance.state_updated_at = now
    appliance.updated_by_member_id = current_member.id

    state_log = ApplianceStateLog(
        appliance_id=appliance.id,
        from_state=from_state,
        to_state=target_to_state,
        trigger_source="manual",
        actor_member_id=current_member.id,
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


@router.post("/{appliance_id}/reset", response_model=ApplianceOut, status_code=status.HTTP_200_OK)
async def reset_appliance(
    appliance_id: uuid.UUID,
    current_member: Member = Depends(get_current_member),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Appliance).where(
        Appliance.id == appliance_id,
        Appliance.household_id == current_member.household_id,
    )
    res = await db.execute(stmt)
    appliance = res.scalar_one_or_none()
    if not appliance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appliance not found in this household",
        )

    now = datetime.now(timezone.utc)
    from_state = appliance.current_state
    reset_state = appliance.state_step_1

    appliance.current_state = reset_state
    appliance.state_updated_at = now
    appliance.updated_by_member_id = current_member.id
    appliance.timer_started_at = None
    appliance.timer_ends_at = None
    appliance.timer_duration_minutes = None

    state_log = ApplianceStateLog(
        appliance_id=appliance.id,
        from_state=from_state,
        to_state=reset_state,
        trigger_source="reset",
        actor_member_id=current_member.id,
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


@router.put("/{appliance_id}", response_model=ApplianceOut, status_code=status.HTTP_200_OK)
async def update_appliance(
    appliance_id: uuid.UUID,
    data: ApplianceUpdate,
    current_member: Member = Depends(get_current_member),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Appliance).where(
        Appliance.id == appliance_id,
        Appliance.household_id == current_member.household_id,
    )
    res = await db.execute(stmt)
    appliance = res.scalar_one_or_none()
    if not appliance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appliance not found in this household",
        )

    now = datetime.now(timezone.utc)
    if data.name is not None:
        appliance.name = data.name
    if data.icon is not None or data.type is not None:
        appliance.type = data.icon or data.type
    if data.timer_enabled is not None:
        appliance.timer_enabled = data.timer_enabled
    if data.default_timer_minutes is not None:
        appliance.default_timer_minutes = data.default_timer_minutes

    # Check if steps were provided and changed
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

            # Auto-reset current_state to new step 1 and clear timer
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
                actor_member_id=current_member.id,
                created_at=now,
            )
            db.add(state_log)

    appliance.updated_by_member_id = current_member.id
    await db.commit()
    await db.refresh(appliance)

    await ws_manager.broadcast(
        household_id=appliance.household_id,
        event="APPLIANCE_STATE_CHANGED",
        data=ApplianceOut.model_validate(appliance).model_dump(mode="json"),
    )
    return appliance


@router.get("/{appliance_id}/history", response_model=list[ApplianceStateLogOut], status_code=status.HTTP_200_OK)
async def get_appliance_history(
    appliance_id: uuid.UUID,
    current_member: Member = Depends(get_current_member),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Appliance).where(
        Appliance.id == appliance_id,
        Appliance.household_id == current_member.household_id,
    )
    res = await db.execute(stmt)
    appliance = res.scalar_one_or_none()
    if not appliance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appliance not found in this household",
        )

    log_stmt = (
        select(ApplianceStateLog)
        .where(ApplianceStateLog.appliance_id == appliance.id)
        .order_by(ApplianceStateLog.created_at.desc())
    )
    log_res = await db.execute(log_stmt)
    return log_res.scalars().all()


@router.post("/{appliance_id}/sensor-event", response_model=ApplianceOut, status_code=status.HTTP_200_OK)
async def ingest_sensor_event(
    appliance_id: uuid.UUID,
    data: SensorEventCreate,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Appliance).where(Appliance.id == appliance_id)
    res = await db.execute(stmt)
    appliance = res.scalar_one_or_none()
    if not appliance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appliance not found",
        )

    new_state: Optional[str] = None
    if appliance.current_state in ["dirty", "empty"] and data.power_watts > 50:
        new_state = "running"
    elif appliance.current_state == "running" and data.power_watts < 5:
        new_state = appliance.get_next_state("running")

    if new_state is not None:
        now = datetime.now(timezone.utc)
        from_state = appliance.current_state
        appliance.current_state = new_state
        appliance.state_updated_at = now
        appliance.updated_by_member_id = None
        if new_state != "running":
            appliance.timer_started_at = None
            appliance.timer_ends_at = None
            appliance.timer_duration_minutes = None

        state_log = ApplianceStateLog(
            appliance_id=appliance.id,
            from_state=from_state,
            to_state=new_state,
            trigger_source="sensor_webhook",
            actor_member_id=None,
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
        if new_state in ("clean_needs_emptying", "needs_attention"):
            await notify_household_appliance_clean(
                db=db,
                household_id=appliance.household_id,
                appliance_name=appliance.name,
            )

    return appliance
