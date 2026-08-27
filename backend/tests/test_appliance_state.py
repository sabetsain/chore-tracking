import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Appliance, ApplianceStateLog


@pytest.mark.asyncio
async def test_appliance_sequential_state_transitions(client: AsyncClient, db_session: AsyncSession):
    # Setup household
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "State House", "nickname": "Alice"},
    )
    token = hh_res.json()["access_token"]
    alice_id = hh_res.json()["member"]["id"]

    # List appliances to get Dishwasher ID
    list_res = await client.get(
        "/api/v1/appliances",
        headers={"Authorization": f"Bearer {token}"},
    )
    dishwasher = next(a for a in list_res.json() if a["name"] == "Dishwasher")
    app_id = dishwasher["id"]
    assert dishwasher["current_state"] == "empty"

    # 1. Transition: empty -> dirty
    res1 = await client.post(
        f"/api/v1/appliances/{app_id}/state",
        headers={"Authorization": f"Bearer {token}"},
        json={"to_state": "dirty"},
    )
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["current_state"] == "dirty"
    assert data1["updated_by_member_id"] == alice_id
    assert data1["updated_by_member"]["nickname"] == "Alice"

    # 2. Transition: dirty -> running
    res2 = await client.post(
        f"/api/v1/appliances/{app_id}/state",
        headers={"Authorization": f"Bearer {token}"},
        json={"to_state": "running"},
    )
    assert res2.status_code == 200
    assert res2.json()["current_state"] == "running"

    # 3. Transition: running -> clean_needs_emptying
    res3 = await client.post(
        f"/api/v1/appliances/{app_id}/state",
        headers={"Authorization": f"Bearer {token}"},
        json={"to_state": "clean_needs_emptying"},
    )
    assert res3.status_code == 200
    assert res3.json()["current_state"] == "clean_needs_emptying"

    # 4. Transition: clean_needs_emptying -> empty
    res4 = await client.post(
        f"/api/v1/appliances/{app_id}/state",
        headers={"Authorization": f"Bearer {token}"},
        json={"to_state": "empty"},
    )
    assert res4.status_code == 200
    assert res4.json()["current_state"] == "empty"

    # Verify state logs in DB
    stmt = (
        select(ApplianceStateLog)
        .where(ApplianceStateLog.appliance_id == uuid.UUID(app_id))
        .order_by(ApplianceStateLog.created_at.asc())
    )
    logs = (await db_session.execute(stmt)).scalars().all()
    assert len(logs) == 4
    assert logs[0].from_state == "empty" and logs[0].to_state == "dirty"
    assert logs[1].from_state == "dirty" and logs[1].to_state == "running"
    assert logs[2].from_state == "running" and logs[2].to_state == "clean_needs_emptying"
    assert logs[3].from_state == "clean_needs_emptying" and logs[3].to_state == "empty"
    for log in logs:
        assert log.trigger_source == "manual"
        assert str(log.actor_member_id) == alice_id


@pytest.mark.asyncio
async def test_appliance_invalid_transition_without_force_fails(client: AsyncClient):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Invalid State House", "nickname": "Alice"},
    )
    token = hh_res.json()["access_token"]

    list_res = await client.get(
        "/api/v1/appliances",
        headers={"Authorization": f"Bearer {token}"},
    )
    app_id = list_res.json()[0]["id"]

    # Attempt empty -> clean_needs_emptying without force -> 400
    res = await client.post(
        f"/api/v1/appliances/{app_id}/state",
        headers={"Authorization": f"Bearer {token}"},
        json={"to_state": "clean_needs_emptying"},
    )
    assert res.status_code == 400
    assert "Invalid state transition" in res.json()["detail"]

    # Attempt empty -> empty (same state) -> 400
    res3 = await client.post(
        f"/api/v1/appliances/{app_id}/state",
        headers={"Authorization": f"Bearer {token}"},
        json={"to_state": "empty"},
    )
    assert res3.status_code == 400


@pytest.mark.asyncio
async def test_appliance_forced_state_transition(client: AsyncClient):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Force State House", "nickname": "Alice"},
    )
    token = hh_res.json()["access_token"]

    list_res = await client.get(
        "/api/v1/appliances",
        headers={"Authorization": f"Bearer {token}"},
    )
    app_id = list_res.json()[0]["id"]
    # Currently "empty"

    # Force transition empty -> clean_needs_emptying
    res = await client.post(
        f"/api/v1/appliances/{app_id}/state",
        headers={"Authorization": f"Bearer {token}"},
        json={"to_state": "clean_needs_emptying", "force": True},
    )
    assert res.status_code == 200
    assert res.json()["current_state"] == "clean_needs_emptying"


@pytest.mark.asyncio
async def test_appliance_state_history(client: AsyncClient):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "History House", "nickname": "Alice"},
    )
    token_alice = hh_res.json()["access_token"]
    invite_code = hh_res.json()["household"]["invite_code"]

    # Join Bob
    bob_res = await client.post(
        "/api/v1/households/join",
        json={"invite_code": invite_code, "nickname": "Bob"},
    )
    token_bob = bob_res.json()["access_token"]

    list_res = await client.get(
        "/api/v1/appliances",
        headers={"Authorization": f"Bearer {token_alice}"},
    )
    app_id = list_res.json()[0]["id"]

    # Alice sets dirty
    await client.post(
        f"/api/v1/appliances/{app_id}/state",
        headers={"Authorization": f"Bearer {token_alice}"},
        json={"to_state": "dirty"},
    )

    # Bob sets running
    await client.post(
        f"/api/v1/appliances/{app_id}/state",
        headers={"Authorization": f"Bearer {token_bob}"},
        json={"to_state": "running"},
    )

    # Fetch history
    hist_res = await client.get(
        f"/api/v1/appliances/{app_id}/history",
        headers={"Authorization": f"Bearer {token_alice}"},
    )
    assert hist_res.status_code == 200
    logs = hist_res.json()
    assert len(logs) == 2

    # Verify logs have actor details
    # Order should be descending (most recent first)
    assert logs[0]["from_state"] == "dirty"
    assert logs[0]["to_state"] == "running"
    assert logs[0]["trigger_source"] == "manual"
    assert logs[0]["actor_member"]["nickname"] == "Bob"

    assert logs[1]["from_state"] == "empty"
    assert logs[1]["to_state"] == "dirty"
    assert logs[1]["trigger_source"] == "manual"
    assert logs[1]["actor_member"]["nickname"] == "Alice"


@pytest.mark.asyncio
async def test_appliance_state_cross_household_returns_404(client: AsyncClient):
    h1 = await client.post(
        "/api/v1/households",
        json={"name": "Cross State 1", "nickname": "User1"},
    )
    token1 = h1.json()["access_token"]

    h2 = await client.post(
        "/api/v1/households",
        json={"name": "Cross State 2", "nickname": "User2"},
    )
    token2 = h2.json()["access_token"]

    apps1 = (await client.get("/api/v1/appliances", headers={"Authorization": f"Bearer {token1}"})).json()
    app1_id = apps1[0]["id"]

    # User 2 tries to update User 1's appliance state
    res = await client.post(
        f"/api/v1/appliances/{app1_id}/state",
        headers={"Authorization": f"Bearer {token2}"},
        json={"to_state": "dirty"},
    )
    assert res.status_code == 404

    # User 2 tries to get history of User 1's appliance
    hist_res = await client.get(
        f"/api/v1/appliances/{app1_id}/history",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert hist_res.status_code == 404


@pytest.mark.asyncio
async def test_washer_and_dryer_transitions_skip_dirty(client: AsyncClient, db_session: AsyncSession):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Laundry House", "nickname": "Alice"},
    )
    token = hh_res.json()["access_token"]

    list_res = await client.get(
        "/api/v1/appliances",
        headers={"Authorization": f"Bearer {token}"},
    )
    appliances = list_res.json()
    washer = next(a for a in appliances if a["type"] == "washer")
    dryer = next(a for a in appliances if a["type"] == "dryer")

    # Washer: empty -> running (Start Cycle directly)
    res_washer_run = await client.post(
        f"/api/v1/appliances/{washer['id']}/state",
        headers={"Authorization": f"Bearer {token}"},
        json={"to_state": "running"},
    )
    assert res_washer_run.status_code == 200
    assert res_washer_run.json()["current_state"] == "running"

    # Washer: running -> clean_needs_emptying
    res_washer_clean = await client.post(
        f"/api/v1/appliances/{washer['id']}/state",
        headers={"Authorization": f"Bearer {token}"},
        json={"to_state": "clean_needs_emptying"},
    )
    assert res_washer_clean.status_code == 200
    assert res_washer_clean.json()["current_state"] == "clean_needs_emptying"

    # Washer: clean_needs_emptying -> empty
    res_washer_empty = await client.post(
        f"/api/v1/appliances/{washer['id']}/state",
        headers={"Authorization": f"Bearer {token}"},
        json={"to_state": "empty"},
    )
    assert res_washer_empty.status_code == 200
    assert res_washer_empty.json()["current_state"] == "empty"

    # Dryer: empty -> running (Start Cycle directly)
    res_dryer_run = await client.post(
        f"/api/v1/appliances/{dryer['id']}/state",
        headers={"Authorization": f"Bearer {token}"},
        json={"to_state": "running"},
    )
    assert res_dryer_run.status_code == 200
    assert res_dryer_run.json()["current_state"] == "running"


@pytest.mark.asyncio
async def test_washer_and_dryer_reject_dirty_state(client: AsyncClient):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Reject Dirty House", "nickname": "Alice"},
    )
    token = hh_res.json()["access_token"]

    list_res = await client.get(
        "/api/v1/appliances",
        headers={"Authorization": f"Bearer {token}"},
    )
    washer = next(a for a in list_res.json() if a["type"] == "washer")
    dryer = next(a for a in list_res.json() if a["type"] == "dryer")

    # Washer empty -> dirty should fail
    res_washer = await client.post(
        f"/api/v1/appliances/{washer['id']}/state",
        headers={"Authorization": f"Bearer {token}"},
        json={"to_state": "dirty"},
    )
    assert res_washer.status_code == 400
    assert "Invalid state transition" in res_washer.json()["detail"]

    # Dryer empty -> dirty should fail
    res_dryer = await client.post(
        f"/api/v1/appliances/{dryer['id']}/state",
        headers={"Authorization": f"Bearer {token}"},
        json={"to_state": "dirty"},
    )
    assert res_dryer.status_code == 400
    assert "Invalid state transition" in res_dryer.json()["detail"]


@pytest.mark.asyncio
async def test_dishwasher_transition_clean_to_dirty(client: AsyncClient, db_session: AsyncSession):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Dishwasher Cycle House", "nickname": "Alice"},
    )
    token = hh_res.json()["access_token"]

    list_res = await client.get(
        "/api/v1/appliances",
        headers={"Authorization": f"Bearer {token}"},
    )
    dishwasher = next(a for a in list_res.json() if a["type"] == "dishwasher")
    app_id = dishwasher["id"]

    # 1. empty -> dirty
    res1 = await client.post(
        f"/api/v1/appliances/{app_id}/state",
        headers={"Authorization": f"Bearer {token}"},
        json={"to_state": "dirty"},
    )
    assert res1.status_code == 200

    # 2. dirty -> running
    res2 = await client.post(
        f"/api/v1/appliances/{app_id}/state",
        headers={"Authorization": f"Bearer {token}"},
        json={"to_state": "running"},
    )
    assert res2.status_code == 200

    # 3. running -> clean_needs_emptying
    res3 = await client.post(
        f"/api/v1/appliances/{app_id}/state",
        headers={"Authorization": f"Bearer {token}"},
        json={"to_state": "clean_needs_emptying"},
    )
    assert res3.status_code == 200

    # 4. clean_needs_emptying -> dirty (Directly emptied back to dirty for new load)
    res4 = await client.post(
        f"/api/v1/appliances/{app_id}/state",
        headers={"Authorization": f"Bearer {token}"},
        json={"to_state": "dirty"},
    )
    assert res4.status_code == 200
    assert res4.json()["current_state"] == "dirty"


