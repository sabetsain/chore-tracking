from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Household, Member
from app.schemas import AuthResponse, LoginRequest
from app.security import create_access_token, verify_pin

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/login", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def login(
    data: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    if not data.household_id and not data.invite_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either household_id or invite_code must be provided",
        )

    if data.household_id:
        hh_stmt = select(Household).where(Household.id == data.household_id)
    else:
        code = data.invite_code.strip().upper()
        hh_stmt = select(Household).where(Household.invite_code == code)

    res = await db.execute(hh_stmt)
    household = res.scalar_one_or_none()
    if not household:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Household not found",
        )

    member_stmt = select(Member).where(
        Member.household_id == household.id,
        Member.nickname == data.nickname.strip(),
    )
    m_res = await db.execute(member_stmt)
    member = m_res.scalar_one_or_none()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in this household",
        )

    if member.pin_hash:
        if not data.pin or not verify_pin(data.pin, member.pin_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid PIN",
                headers={"WWW-Authenticate": "Bearer"},
            )

    access_token = create_access_token(
        data={
            "sub": str(member.id),
            "household_id": str(household.id),
            "role": member.role,
        }
    )

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        member=member,
        household=household,
    )
