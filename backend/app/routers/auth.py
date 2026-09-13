from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.routing import APIRoute
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas import AuthResponse, LoginRequest
from app.services import household_service
from app.services.household_service import (
    HouseholdNotFoundError, InvalidCredentialsError, MemberNotFoundError,
)


class AuthRoute(APIRoute):
    def get_route_handler(self):
        handler = super().get_route_handler()
        async def custom_handler(request: Request) -> Response:
            try:
                return await handler(request)
            except (HouseholdNotFoundError, MemberNotFoundError) as e:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
            except InvalidCredentialsError as e:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e), headers={"WWW-Authenticate": "Bearer"})
            except ValueError as e:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
        return custom_handler


router = APIRouter(prefix="/api/v1/auth", tags=["auth"], route_class=AuthRoute)

@router.post("/login", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    return await household_service.login_member(db=db, data=data)
