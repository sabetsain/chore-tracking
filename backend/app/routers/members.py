import uuid
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Household, Member
from app.schemas import MemberMeOut, MemberOut, MemberStatusUpdate
from app.security import get_current_member, require_admin
from app.websocket import ws_manager

router = APIRouter(prefix="/api/v1/members", tags=["members"])


@router.get("/me", response_model=MemberMeOut, status_code=status.HTTP_200_OK)
async def get_me(
    current_member: Member = Depends(get_current_member),
    db: AsyncSession = Depends(get_db),
):
    hh_stmt = select(Household).where(Household.id == current_member.household_id)
    res = await db.execute(hh_stmt)
    household = res.scalar_one_or_none()
    if not household:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Household not found",
        )

    return MemberMeOut(
        id=current_member.id,
        household_id=current_member.household_id,
        nickname=current_member.nickname,
        role=current_member.role,
        status=current_member.status,
        away_until=current_member.away_until,
        created_at=current_member.created_at,
        household=household,
    )


@router.patch("/me/status", response_model=MemberOut, status_code=status.HTTP_200_OK)
async def update_my_status(
    data: MemberStatusUpdate,
    current_member: Member = Depends(get_current_member),
    db: AsyncSession = Depends(get_db),
):
    current_member.status = data.status
    if data.status == "away":
        current_member.away_until = data.away_until
    else:
        current_member.away_until = None

    await db.commit()
    await db.refresh(current_member)
    await ws_manager.broadcast(
        household_id=current_member.household_id,
        event="MEMBER_STATUS_CHANGED",
        data=MemberOut.model_validate(current_member).model_dump(mode="json"),
    )
    return current_member


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_member(
    member_id: uuid.UUID,
    current_member: Member = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Member).where(
        Member.id == member_id,
        Member.household_id == current_member.household_id,
    )
    res = await db.execute(stmt)
    member_to_delete = res.scalar_one_or_none()
    if not member_to_delete:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in this household",
        )

    await db.delete(member_to_delete)
    await db.commit()
    await ws_manager.broadcast(
        household_id=current_member.household_id,
        event="MEMBER_STATUS_CHANGED",
        data={"action": "deleted", "member_id": str(member_id)},
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
