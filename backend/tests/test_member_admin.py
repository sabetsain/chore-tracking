import uuid
from datetime import datetime, timezone, timedelta
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Household, Member


@pytest.mark.asyncio
async def test_update_member_status_to_away(client: AsyncClient, db_session: AsyncSession):
    create_res = await client.post(
        "/api/v1/households",
        json={"name": "Away Test House", "nickname": "Sam"},
    )
    token = create_res.json()["access_token"]
    member_id = uuid.UUID(create_res.json()["member"]["id"])

    away_time = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    status_res = await client.patch(
        "/api/v1/members/me/status",
        headers={"Authorization": f"Bearer {token}"},
        json={"status": "away", "away_until": away_time},
    )
    assert status_res.status_code == 200
    data = status_res.json()
    assert data["status"] == "away"
    assert data["away_until"] is not None

    # Check DB
    m = await db_session.get(Member, member_id)
    assert m.status == "away"
    assert m.away_until is not None


@pytest.mark.asyncio
async def test_update_member_status_back_to_active(client: AsyncClient, db_session: AsyncSession):
    create_res = await client.post(
        "/api/v1/households",
        json={"name": "Active Test House", "nickname": "Sam"},
    )
    token = create_res.json()["access_token"]
    member_id = uuid.UUID(create_res.json()["member"]["id"])

    # First set away
    await client.patch(
        "/api/v1/members/me/status",
        headers={"Authorization": f"Bearer {token}"},
        json={"status": "away"},
    )

    # Now set active
    status_res = await client.patch(
        "/api/v1/members/me/status",
        headers={"Authorization": f"Bearer {token}"},
        json={"status": "active"},
    )
    assert status_res.status_code == 200
    data = status_res.json()
    assert data["status"] == "active"
    assert data["away_until"] is None

    m = await db_session.get(Member, member_id)
    assert m.status == "active"
    assert m.away_until is None


@pytest.mark.asyncio
async def test_update_member_status_invalid(client: AsyncClient):
    create_res = await client.post(
        "/api/v1/households",
        json={"name": "Invalid Status House", "nickname": "Sam"},
    )
    token = create_res.json()["access_token"]

    status_res = await client.patch(
        "/api/v1/members/me/status",
        headers={"Authorization": f"Bearer {token}"},
        json={"status": "vacation"},
    )
    assert status_res.status_code == 422


@pytest.mark.asyncio
async def test_regenerate_invite_code_as_admin(client: AsyncClient, db_session: AsyncSession):
    create_res = await client.post(
        "/api/v1/households",
        json={"name": "Invite Regen House", "nickname": "AdminUser"},
    )
    token = create_res.json()["access_token"]
    hh_id = uuid.UUID(create_res.json()["household"]["id"])
    old_code = create_res.json()["household"]["invite_code"]

    regen_res = await client.patch(
        "/api/v1/households/invite-code",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert regen_res.status_code == 200
    new_code = regen_res.json()["invite_code"]
    assert len(new_code) == 6
    assert new_code != old_code

    # Verify old code fails to join
    old_join_res = await client.post(
        "/api/v1/households/join",
        json={"invite_code": old_code, "nickname": "NewPerson1"},
    )
    assert old_join_res.status_code == 404

    # Verify new code succeeds
    new_join_res = await client.post(
        "/api/v1/households/join",
        json={"invite_code": new_code, "nickname": "NewPerson2"},
    )
    assert new_join_res.status_code in (200, 201)


@pytest.mark.asyncio
async def test_regenerate_invite_code_as_member_forbidden(client: AsyncClient):
    create_res = await client.post(
        "/api/v1/households",
        json={"name": "Forbidden Invite House", "nickname": "AdminUser"},
    )
    invite_code = create_res.json()["household"]["invite_code"]

    join_res = await client.post(
        "/api/v1/households/join",
        json={"invite_code": invite_code, "nickname": "RegularMember"},
    )
    member_token = join_res.json()["access_token"]

    regen_res = await client.patch(
        "/api/v1/households/invite-code",
        headers={"Authorization": f"Bearer {member_token}"},
    )
    assert regen_res.status_code == 403
    assert "admin" in regen_res.json()["detail"].lower()


@pytest.mark.asyncio
async def test_delete_member_as_admin_success(client: AsyncClient, db_session: AsyncSession):
    create_res = await client.post(
        "/api/v1/households",
        json={"name": "Kick Member House", "nickname": "AdminBoss"},
    )
    admin_token = create_res.json()["access_token"]
    invite_code = create_res.json()["household"]["invite_code"]

    join_res = await client.post(
        "/api/v1/households/join",
        json={"invite_code": invite_code, "nickname": "BadRoommate"},
    )
    roommate_id = uuid.UUID(join_res.json()["member"]["id"])

    del_res = await client.delete(
        f"/api/v1/members/{roommate_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert del_res.status_code in (200, 204)

    # Ensure roommate is no longer in DB
    m = await db_session.get(Member, roommate_id)
    assert m is None


@pytest.mark.asyncio
async def test_delete_member_as_member_forbidden(client: AsyncClient):
    create_res = await client.post(
        "/api/v1/households",
        json={"name": "Member Kick House", "nickname": "AdminBoss"},
    )
    admin_id = create_res.json()["member"]["id"]
    invite_code = create_res.json()["household"]["invite_code"]

    join_res = await client.post(
        "/api/v1/households/join",
        json={"invite_code": invite_code, "nickname": "Roommate"},
    )
    roommate_token = join_res.json()["access_token"]

    del_res = await client.delete(
        f"/api/v1/members/{admin_id}",
        headers={"Authorization": f"Bearer {roommate_token}"},
    )
    assert del_res.status_code == 403


@pytest.mark.asyncio
async def test_delete_nonexistent_member_returns_404(client: AsyncClient):
    create_res = await client.post(
        "/api/v1/households",
        json={"name": "404 Member House", "nickname": "AdminBoss"},
    )
    admin_token = create_res.json()["access_token"]
    fake_id = uuid.uuid4()

    del_res = await client.delete(
        f"/api/v1/members/{fake_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert del_res.status_code == 404


@pytest.mark.asyncio
async def test_delete_member_cross_household_returns_404(client: AsyncClient):
    # Household 1
    create_res1 = await client.post(
        "/api/v1/households",
        json={"name": "House 1", "nickname": "Admin1"},
    )
    admin1_token = create_res1.json()["access_token"]

    # Household 2
    create_res2 = await client.post(
        "/api/v1/households",
        json={"name": "House 2", "nickname": "Admin2"},
    )
    invite_code2 = create_res2.json()["household"]["invite_code"]

    join_res2 = await client.post(
        "/api/v1/households/join",
        json={"invite_code": invite_code2, "nickname": "Roommate2"},
    )
    roommate2_id = join_res2.json()["member"]["id"]

    # Admin 1 attempts to delete Roommate 2
    del_res = await client.delete(
        f"/api/v1/members/{roommate2_id}",
        headers={"Authorization": f"Bearer {admin1_token}"},
    )
    assert del_res.status_code == 404
