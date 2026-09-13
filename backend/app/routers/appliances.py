import uuid
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.routing import APIRoute
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import Member
from app.schemas import ApplianceCreate, ApplianceOut, ApplianceStateLogOut, ApplianceStateUpdate, ApplianceUpdate
from app.security import get_current_member
from app.services import appliance_service
from app.services.appliance_service import (
    ApplianceNotFoundError, AppliancePermissionError, ApplianceTransitionError, ApplianceValidationError,
)


class ApplianceRoute(APIRoute):
    def get_route_handler(self):
        handler = super().get_route_handler()
        async def custom_handler(request: Request) -> Response:
            try:
                return await handler(request)
            except ApplianceNotFoundError as e:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
            except (ApplianceTransitionError, ApplianceValidationError) as e:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
            except AppliancePermissionError as e:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
        return custom_handler


router = APIRouter(prefix="/api/v1/appliances", tags=["appliances"], route_class=ApplianceRoute)

@router.get("", response_model=list[ApplianceOut])
async def list_appliances(m: Member = Depends(get_current_member), db: AsyncSession = Depends(get_db)):
    return await appliance_service.list_appliances(db=db, household_id=m.household_id)

@router.post("", response_model=ApplianceOut, status_code=status.HTTP_201_CREATED)
async def create_appliance(data: ApplianceCreate, m: Member = Depends(get_current_member), db: AsyncSession = Depends(get_db)):
    return await appliance_service.create_appliance(db=db, household_id=m.household_id, member_id=m.id, data=data)

@router.get("/{appliance_id}", response_model=ApplianceOut)
async def get_appliance(appliance_id: uuid.UUID, m: Member = Depends(get_current_member), db: AsyncSession = Depends(get_db)):
    return await appliance_service.get_appliance(db=db, household_id=m.household_id, appliance_id=appliance_id)

@router.post("/{appliance_id}/state", response_model=ApplianceOut)
async def update_appliance_state(appliance_id: uuid.UUID, data: ApplianceStateUpdate, m: Member = Depends(get_current_member), db: AsyncSession = Depends(get_db)):
    return await appliance_service.transition_appliance_state(
        db=db, household_id=m.household_id, member_id=m.id, appliance_id=appliance_id,
        to_state=data.to_state, force=data.force, timer_minutes=data.timer_duration_minutes,
    )

@router.post("/{appliance_id}/reset", response_model=ApplianceOut)
async def reset_appliance(appliance_id: uuid.UUID, m: Member = Depends(get_current_member), db: AsyncSession = Depends(get_db)):
    return await appliance_service.reset_appliance(db=db, household_id=m.household_id, member_id=m.id, appliance_id=appliance_id)

@router.put("/{appliance_id}", response_model=ApplianceOut)
async def update_appliance(appliance_id: uuid.UUID, data: ApplianceUpdate, m: Member = Depends(get_current_member), db: AsyncSession = Depends(get_db)):
    return await appliance_service.update_appliance(db=db, household_id=m.household_id, member_id=m.id, appliance_id=appliance_id, data=data)

@router.get("/{appliance_id}/history", response_model=list[ApplianceStateLogOut])
async def get_appliance_history(appliance_id: uuid.UUID, m: Member = Depends(get_current_member), db: AsyncSession = Depends(get_db)):
    return await appliance_service.get_appliance_history(db=db, household_id=m.household_id, appliance_id=appliance_id)
