import uuid
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.routing import APIRoute
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import Member
from app.schemas import (
    ChoreAssignmentOut, ChoreCreate, ChoreLogCreate, ChoreLogOut,
    ChoreOut, ChoreReassignRequest, ChoreSwapRequest, ChoreUpdate,
)
from app.security import get_current_member
from app.services import chore_service
from app.services.chore_service import ChoreNotFoundError, ChorePermissionError, ChoreValidationError


class ChoreRoute(APIRoute):
    def get_route_handler(self):
        handler = super().get_route_handler()
        async def custom_handler(request: Request) -> Response:
            try:
                return await handler(request)
            except ChoreNotFoundError as e:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
            except ChoreValidationError as e:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
            except ChorePermissionError as e:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
        return custom_handler


router = APIRouter(prefix="/api/v1/chores", tags=["chores"], route_class=ChoreRoute)

@router.post("/rotation/activate", response_model=list[ChoreAssignmentOut])
async def activate_rotation(m: Member = Depends(get_current_member), db: AsyncSession = Depends(get_db)):
    return await chore_service.activate_chore_rotation(db=db, household=m.household_id)
@router.post("/rotation/deactivate", response_model=list[ChoreAssignmentOut])
async def deactivate_rotation(m: Member = Depends(get_current_member), db: AsyncSession = Depends(get_db)):
    return await chore_service.deactivate_chore_rotation(db=db, household=m.household_id)
@router.post("/rotation/reshuffle", response_model=list[ChoreAssignmentOut])
async def reshuffle_rotation(m: Member = Depends(get_current_member), db: AsyncSession = Depends(get_db)):
    return await chore_service.reshuffle_chore_rotation(db=db, household=m.household_id)
@router.get("/assignments", response_model=list[ChoreAssignmentOut])
async def get_weekly_assignments(week_start_date: Optional[date] = None, m: Member = Depends(get_current_member), db: AsyncSession = Depends(get_db)):
    return await chore_service.get_weekly_assignments(db=db, household_id=m.household_id, week_start_date=week_start_date)
@router.get("/up-for-grabs", response_model=list[ChoreAssignmentOut])
async def get_up_for_grabs_chores(week_start_date: Optional[date] = None, m: Member = Depends(get_current_member), db: AsyncSession = Depends(get_db)):
    return await chore_service.get_up_for_grabs_chores(db=db, household_id=m.household_id, week_start_date=week_start_date)
@router.post("/assignments/{assignment_id}/claim", response_model=ChoreAssignmentOut)
async def claim_chore_assignment(assignment_id: uuid.UUID, m: Member = Depends(get_current_member), db: AsyncSession = Depends(get_db)):
    return await chore_service.claim_chore(db=db, household_id=m.household_id, assignment_id=assignment_id, member_id=m.id)
@router.post("/assignments/{assignment_id}/unclaim", response_model=ChoreAssignmentOut)
async def unclaim_chore_assignment(assignment_id: uuid.UUID, m: Member = Depends(get_current_member), db: AsyncSession = Depends(get_db)):
    return await chore_service.unclaim_chore(db=db, household_id=m.household_id, assignment_id=assignment_id, current_member=m)
@router.post("/assignments/{assignment_id}/complete", response_model=ChoreAssignmentOut)
async def complete_chore_assignment(assignment_id: uuid.UUID, m: Member = Depends(get_current_member), db: AsyncSession = Depends(get_db)):
    return await chore_service.complete_chore(db=db, household_id=m.household_id, assignment_id=assignment_id, current_member=m)
@router.post("/assignments/{assignment_id}/uncomplete", response_model=ChoreAssignmentOut)
async def uncomplete_chore_assignment(assignment_id: uuid.UUID, m: Member = Depends(get_current_member), db: AsyncSession = Depends(get_db)):
    return await chore_service.uncomplete_chore(db=db, household_id=m.household_id, assignment_id=assignment_id, current_member=m)
@router.patch("/assignments/{assignment_id}/reassign", response_model=ChoreAssignmentOut)
async def reassign_chore_assignment(assignment_id: uuid.UUID, data: ChoreReassignRequest, m: Member = Depends(get_current_member), db: AsyncSession = Depends(get_db)):
    return await chore_service.reassign_chore(db=db, household_id=m.household_id, assignment_id=assignment_id, current_member=m, target_member_id=data.member_id)
@router.post("/assignments/{assignment_id}/swap", response_model=ChoreAssignmentOut)
async def swap_chore_assignments(assignment_id: uuid.UUID, data: ChoreSwapRequest, m: Member = Depends(get_current_member), db: AsyncSession = Depends(get_db)):
    return await chore_service.swap_chore(db=db, household_id=m.household_id, assignment_id=assignment_id, current_member=m, data=data)
@router.post("/assignments/{assignment_id}/log", response_model=ChoreLogOut, status_code=status.HTTP_201_CREATED)
async def log_chore_duty(assignment_id: uuid.UUID, data: ChoreLogCreate, m: Member = Depends(get_current_member), db: AsyncSession = Depends(get_db)):
    return await chore_service.log_duty(db=db, household_id=m.household_id, assignment_id=assignment_id, current_member=m, data=data)
@router.get("/assignments/{assignment_id}/logs", response_model=list[ChoreLogOut])
async def get_chore_logs(assignment_id: uuid.UUID, m: Member = Depends(get_current_member), db: AsyncSession = Depends(get_db)):
    return await chore_service.get_chore_logs(db=db, household_id=m.household_id, assignment_id=assignment_id)
@router.post("", response_model=ChoreOut, status_code=status.HTTP_201_CREATED)
async def create_chore(data: ChoreCreate, m: Member = Depends(get_current_member), db: AsyncSession = Depends(get_db)):
    return await chore_service.create_chore(db=db, household_id=m.household_id, data=data)
@router.get("", response_model=list[ChoreOut])
async def list_chores(is_active: Optional[bool] = None, m: Member = Depends(get_current_member), db: AsyncSession = Depends(get_db)):
    return await chore_service.list_chores(db=db, household_id=m.household_id, is_active=is_active)
@router.get("/{chore_id}", response_model=ChoreOut)
async def get_chore(chore_id: uuid.UUID, m: Member = Depends(get_current_member), db: AsyncSession = Depends(get_db)):
    return await chore_service.get_chore(db=db, household_id=m.household_id, chore_id=chore_id)
@router.patch("/{chore_id}", response_model=ChoreOut)
async def update_chore(chore_id: uuid.UUID, data: ChoreUpdate, m: Member = Depends(get_current_member), db: AsyncSession = Depends(get_db)):
    return await chore_service.update_chore(db=db, household_id=m.household_id, chore_id=chore_id, data=data)
@router.delete("/{chore_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chore(chore_id: uuid.UUID, m: Member = Depends(get_current_member), db: AsyncSession = Depends(get_db)):
    await chore_service.delete_chore(db=db, household_id=m.household_id, chore_id=chore_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
