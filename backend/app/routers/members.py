import uuid
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.routing import APIRoute
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import Member
from app.schemas import MemberMeOut, MemberOut, MemberStatusUpdate
from app.security import get_current_member, require_admin
from app.services import household_service
from app.services.household_service import HouseholdNotFoundError, MemberNotFoundError


class MemberRoute(APIRoute):
    def get_route_handler(self):
        handler = super().get_route_handler()
        async def custom_handler(request: Request) -> Response:
            try:
                return await handler(request)
            except (HouseholdNotFoundError, MemberNotFoundError) as e:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        return custom_handler


router = APIRouter(prefix="/api/v1/members", tags=["members"], route_class=MemberRoute)

@router.get("/me", response_model=MemberMeOut, status_code=status.HTTP_200_OK)
async def get_me(current_member: Member = Depends(get_current_member), db: AsyncSession = Depends(get_db)):
    return await household_service.get_me(db=db, current_member=current_member)

@router.patch("/me/status", response_model=MemberOut, status_code=status.HTTP_200_OK)
async def update_my_status(data: MemberStatusUpdate, current_member: Member = Depends(get_current_member), db: AsyncSession = Depends(get_db)):
    return await household_service.update_member_status(db=db, current_member=current_member, data=data)

@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_member(member_id: uuid.UUID, current_member: Member = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    await household_service.delete_member(db=db, household_id=current_member.household_id, member_id=member_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
