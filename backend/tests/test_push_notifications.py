import uuid
from unittest.mock import MagicMock, patch
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models import Household, Member, PushSubscription
from app.services.push_service import (
    notify_household_appliance_clean,
    notify_member_chore_assignment,
    send_push_notification,
)


async def create_test_member_and_household(db_session: AsyncSession) -> tuple[Household, Member]:
    hh = Household(name="Test House", invite_code="TEST99")
    db_session.add(hh)
    await db_session.flush()
    mem = Member(household_id=hh.id, nickname="TestMember", role="member", status="active")
    db_session.add(mem)
    await db_session.commit()
    await db_session.refresh(hh)
    await db_session.refresh(mem)
    return hh, mem


@pytest.mark.asyncio
async def test_get_vapid_public_key(client: AsyncClient):
    with patch.object(settings, "VAPID_PUBLIC_KEY", "test_public_vapid_key_123"):
        res = await client.get("/api/v1/push/vapid-public-key")
        assert res.status_code == 200
        assert res.json() == {"public_key": "test_public_vapid_key_123"}


@pytest.mark.asyncio
async def test_subscribe_unauthenticated(client: AsyncClient):
    res = await client.post(
        "/api/v1/push/subscribe",
        json={
            "endpoint": "https://updates.push.services.mozilla.com/wpush/v2/gAAAAAB",
            "keys": {
                "p256dh": "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DKM",
                "auth": "tBHItJI5svbpez7KI4CCXg",
            },
        },
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_subscribe_and_unsubscribe_push(client: AsyncClient, db_session: AsyncSession):
    # 1. Create household and member
    res = await client.post(
        "/api/v1/households",
        json={"name": "Push House", "nickname": "Alice"},
    )
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    member_id = uuid.UUID(res.json()["member"]["id"])
    household_id = uuid.UUID(res.json()["household"]["id"])

    endpoint = "https://fcm.googleapis.com/fcm/send/sample-token-12345"
    p256dh = "BFxO4u8qO9v3K6i_key"
    auth = "auth_secret_key_1"

    # 2. Subscribe with nested keys object
    sub_res = await client.post(
        "/api/v1/push/subscribe",
        json={
            "endpoint": endpoint,
            "keys": {
                "p256dh": p256dh,
                "auth": auth,
            },
        },
        headers=headers,
    )
    assert sub_res.status_code in [200, 201]

    # Verify stored in DB
    stmt = select(PushSubscription).where(PushSubscription.endpoint == endpoint)
    db_res = await db_session.execute(stmt)
    sub = db_res.scalar_one_or_none()
    assert sub is not None
    assert sub.member_id == member_id
    assert sub.household_id == household_id
    assert sub.p256dh_key == p256dh
    assert sub.auth_key == auth

    # 3. Subscribe again (updates existing subscription)
    sub_res2 = await client.post(
        "/api/v1/push/subscribe",
        json={
            "endpoint": endpoint,
            "p256dh_key": "updated_p256dh",
            "auth_key": "updated_auth",
        },
        headers=headers,
    )
    assert sub_res2.status_code in [200, 201]

    # 4. Unsubscribe
    unsub_res = await client.request(
        "DELETE",
        "/api/v1/push/unsubscribe",
        json={"endpoint": endpoint},
        headers=headers,
    )
    assert unsub_res.status_code in [200, 204]

    # Verify removed from DB
    db_res_after = await db_session.execute(stmt)
    assert db_res_after.scalar_one_or_none() is None


@pytest.mark.asyncio
async def test_push_service_missing_vapid_keys_graceful(db_session: AsyncSession):
    hh, mem = await create_test_member_and_household(db_session)

    # Missing VAPID keys shouldn't throw error
    with patch.object(settings, "VAPID_PRIVATE_KEY", ""), patch.object(settings, "VAPID_PUBLIC_KEY", ""):
        sub = PushSubscription(
            member_id=mem.id,
            household_id=hh.id,
            endpoint="https://example.com/push/123",
            p256dh_key="key",
            auth_key="auth",
        )
        db_session.add(sub)
        await db_session.commit()

        result = await send_push_notification(
            db=db_session,
            subscription=sub,
            payload={"title": "Test", "body": "Message"},
        )
        assert result is False


@pytest.mark.asyncio
async def test_push_service_dispatches_webpush(db_session: AsyncSession):
    hh, mem = await create_test_member_and_household(db_session)

    sub = PushSubscription(
        member_id=mem.id,
        household_id=hh.id,
        endpoint="https://example.com/push/active",
        p256dh_key="p256dh_sample",
        auth_key="auth_sample",
    )
    db_session.add(sub)
    await db_session.commit()

    with patch.object(settings, "VAPID_PRIVATE_KEY", "sample_private_key"), \
         patch.object(settings, "VAPID_PUBLIC_KEY", "sample_public_key"), \
         patch("app.services.push_service.webpush") as mock_webpush:
        
        await notify_household_appliance_clean(
            db=db_session,
            household_id=hh.id,
            appliance_name="Dishwasher",
        )

        assert mock_webpush.called
        call_kwargs = mock_webpush.call_args.kwargs
        assert call_kwargs["subscription_info"]["endpoint"] == "https://example.com/push/active"
        assert "Dishwasher" in call_kwargs["data"]
        assert call_kwargs["vapid_private_key"] == "sample_private_key"


@pytest.mark.asyncio
async def test_push_service_removes_expired_subscription_on_410(db_session: AsyncSession):
    from pywebpush import WebPushException

    hh, mem = await create_test_member_and_household(db_session)

    sub = PushSubscription(
        member_id=mem.id,
        household_id=hh.id,
        endpoint="https://example.com/push/expired",
        p256dh_key="p256dh_sample",
        auth_key="auth_sample",
    )
    db_session.add(sub)
    await db_session.commit()

    mock_response = MagicMock()
    mock_response.status_code = 410
    mock_error = WebPushException("Push subscription has expired", response=mock_response)

    with patch.object(settings, "VAPID_PRIVATE_KEY", "sample_private_key"), \
         patch.object(settings, "VAPID_PUBLIC_KEY", "sample_public_key"), \
         patch("app.services.push_service.webpush", side_effect=mock_error):
        
        await send_push_notification(
            db=db_session,
            subscription=sub,
            payload={"title": "Test", "body": "Expired"},
        )

        # Verify subscription was deleted from DB
        stmt = select(PushSubscription).where(PushSubscription.endpoint == "https://example.com/push/expired")
        res = await db_session.execute(stmt)
        assert res.scalar_one_or_none() is None


@pytest.mark.asyncio
async def test_appliance_clean_triggers_push_dispatch(client: AsyncClient, db_session: AsyncSession):
    res = await client.post(
        "/api/v1/households",
        json={"name": "Push Trigger House", "nickname": "Alice"},
    )
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    household_id = uuid.UUID(res.json()["household"]["id"])
    member_id = uuid.UUID(res.json()["member"]["id"])

    # Add push subscription
    sub = PushSubscription(
        member_id=member_id,
        household_id=household_id,
        endpoint="https://example.com/push/user-alice",
        p256dh_key="p256dh_alice",
        auth_key="auth_alice",
    )
    db_session.add(sub)
    await db_session.commit()

    # Get washing machine
    appliances_res = await client.get("/api/v1/appliances", headers=headers)
    washer = next(a for a in appliances_res.json() if a["type"] == "washer")
    washer_id = washer["id"]

    # Transition washer to running
    await client.post(
        f"/api/v1/appliances/{washer_id}/state",
        json={"to_state": "running"},
        headers=headers,
    )

    with patch.object(settings, "VAPID_PRIVATE_KEY", "sample_private_key"), \
         patch.object(settings, "VAPID_PUBLIC_KEY", "sample_public_key"), \
         patch("app.services.push_service.webpush") as mock_webpush:
        
        # Transition running -> clean_needs_emptying
        finish_res = await client.post(
            f"/api/v1/appliances/{washer_id}/state",
            json={"to_state": "clean_needs_emptying"},
            headers=headers,
        )
        assert finish_res.status_code == 200
        assert mock_webpush.called
        data_str = mock_webpush.call_args.kwargs["data"]
        assert "Washer" in data_str or "clean" in data_str.lower()


@pytest.mark.asyncio
async def test_chore_assignment_triggers_push_notification(client: AsyncClient, db_session: AsyncSession):
    res = await client.post(
        "/api/v1/households",
        json={"name": "Chore Push House", "nickname": "Alice"},
    )
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    household_id = uuid.UUID(res.json()["household"]["id"])
    member_id = uuid.UUID(res.json()["member"]["id"])

    # Create chore
    await client.post(
        "/api/v1/chores",
        json={"title": "Take Out Trash", "effort_weight": 1},
        headers=headers,
    )

    # Add push subscription for Alice
    sub = PushSubscription(
        member_id=member_id,
        household_id=household_id,
        endpoint="https://example.com/push/user-alice-chore",
        p256dh_key="p256dh_chore",
        auth_key="auth_chore",
    )
    db_session.add(sub)
    await db_session.commit()

    with patch.object(settings, "VAPID_PRIVATE_KEY", "sample_private_key"), \
         patch.object(settings, "VAPID_PUBLIC_KEY", "sample_public_key"), \
         patch("app.services.push_service.webpush") as mock_webpush:
        
        # Request assignments for week (generates new assignments)
        assign_res = await client.get(
            "/api/v1/chores/assignments?week_start_date=2026-10-04",
            headers=headers,
        )
        assert assign_res.status_code == 200
        assert mock_webpush.called
        data_str = mock_webpush.call_args.kwargs["data"]
        assert "Trash" in data_str or "chore" in data_str.lower()
