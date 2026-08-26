import uuid
from datetime import datetime, timezone
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
    SensorEventCreate,
)
from app.security import get_current_member
from app.services.push_service import notify_household_appliance_clean
from app.websocket import ws_manager

router = APIRouter(prefix="/api/v1/appliances", tags=["appliances"])

ALLOWED_TRANSITIONS: dict[str, list[str]] = {
    "empty": ["dirty"],
    "dirty": ["running"],
    "running": ["clean_needs_emptying"],
    "clean_needs_emptying": ["empty"],
}


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
        type=data.type,
        current_state="empty",
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

    if data.to_state == appliance.current_state:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Appliance is already in state '{data.to_state}'",
        )

    if not data.force:
        allowed = ALLOWED_TRANSITIONS.get(appliance.current_state, [])
        if data.to_state not in allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Invalid state transition from '{appliance.current_state}' to '{data.to_state}'. "
                    f"Allowed transitions: {allowed}. Use force=true to override."
                ),
            )

    now = datetime.now(timezone.utc)
    from_state = appliance.current_state
    appliance.current_state = data.to_state
    appliance.state_updated_at = now
    appliance.updated_by_member_id = current_member.id

    state_log = ApplianceStateLog(
        appliance_id=appliance.id,
        from_state=from_state,
        to_state=data.to_state,
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

    if appliance.current_state == "clean_needs_emptying":
        await notify_household_appliance_clean(
            db=db,
            household_id=appliance.household_id,
            appliance_name=appliance.name,
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
        new_state = "clean_needs_emptying"

    if new_state is not None:
        now = datetime.now(timezone.utc)
        from_state = appliance.current_state
        appliance.current_state = new_state
        appliance.state_updated_at = now
        appliance.updated_by_member_id = None

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
        if new_state == "clean_needs_emptying":
            await notify_household_appliance_clean(
                db=db,
                household_id=appliance.household_id,
                appliance_name=appliance.name,
            )

    return appliance
