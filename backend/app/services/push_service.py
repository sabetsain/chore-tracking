import json
import logging
from typing import Any, Optional
import uuid
from pywebpush import WebPushException, webpush
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models import PushSubscription

logger = logging.getLogger(__name__)


def create_appliance_payload(appliance_name: str, message: Optional[str] = None) -> dict[str, Any]:
    return {
        "title": f"{appliance_name} Finished",
        "body": message or f"{appliance_name} cycle completed - clean items need emptying.",
        "tag": f"appliance-{appliance_name.lower().replace(' ', '-')}",
        "data": {
            "type": "appliance_state",
            "appliance_name": appliance_name,
        },
    }


def create_chore_payload(chore_title: str, message: Optional[str] = None) -> dict[str, Any]:
    return {
        "title": "New Chore Assignment",
        "body": message or f"You are assigned to '{chore_title}' this week.",
        "tag": f"chore-{chore_title.lower().replace(' ', '-')}",
        "data": {
            "type": "chore_assignment",
            "chore_title": chore_title,
        },
    }


async def send_push_notification(
    db: AsyncSession,
    subscription: PushSubscription,
    payload: dict[str, Any],
) -> bool:
    if not settings.VAPID_PRIVATE_KEY or not settings.VAPID_PUBLIC_KEY:
        logger.info("VAPID keys not configured; skipping push dispatch.")
        return False

    sub_info = {
        "endpoint": subscription.endpoint,
        "keys": {
            "p256dh": subscription.p256dh_key,
            "auth": subscription.auth_key,
        },
    }

    try:
        webpush(
            subscription_info=sub_info,
            data=json.dumps(payload),
            vapid_private_key=settings.VAPID_PRIVATE_KEY,
            vapid_claims={"sub": f"mailto:{settings.VAPID_CLAIMS_EMAIL}"},
        )
        return True
    except WebPushException as e:
        status_code = getattr(e.response, "status_code", None) if e.response is not None else None
        if status_code in [404, 410]:
            logger.warning(f"Push subscription expired ({status_code}). Removing {subscription.endpoint}.")
            try:
                await db.delete(subscription)
                await db.commit()
            except Exception as db_err:
                logger.error(f"Error removing expired subscription: {db_err}")
        else:
            logger.error(f"WebPushException sending notification: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error sending push notification: {e}")
        return False


async def notify_household_appliance_clean(
    db: AsyncSession,
    household_id: uuid.UUID,
    appliance_name: str,
    message: Optional[str] = None,
) -> None:
    stmt = select(PushSubscription).where(PushSubscription.household_id == household_id)
    res = await db.execute(stmt)
    subscriptions = res.scalars().all()
    payload = create_appliance_payload(appliance_name, message=message)
    for sub in subscriptions:
        await send_push_notification(db, sub, payload)


async def notify_member_chore_assignment(
    db: AsyncSession,
    member_id: uuid.UUID,
    chore_title: str,
    message: Optional[str] = None,
) -> None:
    stmt = select(PushSubscription).where(PushSubscription.member_id == member_id)
    res = await db.execute(stmt)
    subscriptions = res.scalars().all()
    payload = create_chore_payload(chore_title, message=message)
    for sub in subscriptions:
        await send_push_notification(db, sub, payload)
