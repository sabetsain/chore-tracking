from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models import Member, PushSubscription
from app.schemas import (
    PushSubscriptionCreate,
    PushSubscriptionDelete,
    PushSubscriptionOut,
    VapidPublicKeyResponse,
)
from app.security import get_current_member

router = APIRouter(prefix="/api/v1/push", tags=["push"])


@router.get("/vapid-public-key", response_model=VapidPublicKeyResponse, status_code=status.HTTP_200_OK)
async def get_vapid_public_key():
    return VapidPublicKeyResponse(public_key=settings.VAPID_PUBLIC_KEY)


@router.post("/subscribe", response_model=PushSubscriptionOut, status_code=status.HTTP_201_CREATED)
async def subscribe(
    data: PushSubscriptionCreate,
    current_member: Member = Depends(get_current_member),
    db: AsyncSession = Depends(get_db),
):
    p256dh = data.p256dh_key or (data.keys.p256dh if data.keys else None)
    auth = data.auth_key or (data.keys.auth if data.keys else None)

    if not p256dh or not auth:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="p256dh and auth encryption keys are required",
        )

    stmt = select(PushSubscription).where(PushSubscription.endpoint == data.endpoint)
    res = await db.execute(stmt)
    subscription = res.scalar_one_or_none()

    if subscription:
        subscription.member_id = current_member.id
        subscription.household_id = current_member.household_id
        subscription.p256dh_key = p256dh
        subscription.auth_key = auth
    else:
        subscription = PushSubscription(
            member_id=current_member.id,
            household_id=current_member.household_id,
            endpoint=data.endpoint,
            p256dh_key=p256dh,
            auth_key=auth,
        )
        db.add(subscription)

    await db.commit()
    await db.refresh(subscription)
    return subscription


@router.delete("/unsubscribe", status_code=status.HTTP_204_NO_CONTENT)
async def unsubscribe(
    data: Optional[PushSubscriptionDelete] = None,
    current_member: Member = Depends(get_current_member),
    db: AsyncSession = Depends(get_db),
):
    stmt = delete(PushSubscription).where(PushSubscription.member_id == current_member.id)
    if data and data.endpoint:
        stmt = stmt.where(PushSubscription.endpoint == data.endpoint)

    await db.execute(stmt)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
