from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.routing import APIRoute
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import Member
from app.schemas import AuthResponse, HouseholdCreate, HouseholdJoin, InviteCodeResponse
from app.security import require_admin
from app.services import household_service
from app.services.household_service import (
    HouseholdNotFoundError, InviteCodeGenerationError, NicknameConflictError,
)


class HouseholdRoute(APIRoute):
    def get_route_handler(self):
        handler = super().get_route_handler()
        async def custom_handler(request: Request) -> Response:
            try:
                return await handler(request)
            except HouseholdNotFoundError as e:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
            except NicknameConflictError as e:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
            except InviteCodeGenerationError as e:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
        return custom_handler


router = APIRouter(prefix="/api/v1/households", tags=["households"], route_class=HouseholdRoute)

@router.post("", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def create_household(data: HouseholdCreate, db: AsyncSession = Depends(get_db)):
    return await household_service.create_household(db=db, data=data)

@router.post("/join", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def join_household(data: HouseholdJoin, db: AsyncSession = Depends(get_db)):
    return await household_service.join_household(db=db, data=data)

@router.patch("/invite-code", response_model=InviteCodeResponse, status_code=status.HTTP_200_OK)
async def regenerate_invite_code(current_member: Member = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    return await household_service.regenerate_invite_code(db=db, household_id=current_member.household_id)
