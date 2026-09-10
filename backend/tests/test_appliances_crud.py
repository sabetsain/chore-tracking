import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Appliance


@pytest.mark.asyncio
async def test_list_appliances_default_seeded(client: AsyncClient):
    # Create household
    create_hh = await client.post(
        "/api/v1/households",
        json={"name": "Appliance House", "nickname": "Alice"},
    )
    assert create_hh.status_code == 201
    token = create_hh.json()["access_token"]
    hh_id = create_hh.json()["household"]["id"]

    # List appliances
    res = await client.get(
        "/api/v1/appliances",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    appliances = res.json()
    assert len(appliances) == 3

    names = [a["name"] for a in appliances]
    assert "Dishwasher" in names
    assert "Washer" in names
    assert "Dryer" in names

    for app in appliances:
        assert app["household_id"] == hh_id
        assert app["state_updated_at"] is not None
        assert "id" in app
        assert app["type"] in ["dishwasher", "washer", "dryer"]
        assert app["timer_enabled"] is True

    app_map = {a["name"]: a for a in appliances}
    assert app_map["Dishwasher"]["current_state"] == "dirty"
    assert app_map["Dishwasher"]["state_step_1"] == "dirty"
    assert app_map["Dishwasher"]["state_step_2"] == "running"
    assert app_map["Dishwasher"]["state_step_3"] == "needs_attention"
    assert app_map["Dishwasher"]["default_timer_minutes"] == 60
    assert app_map["Dishwasher"]["next_state"] == "running"

    assert app_map["Washer"]["current_state"] == "empty"
    assert app_map["Washer"]["state_step_1"] == "empty"
    assert app_map["Washer"]["state_step_2"] == "running"
    assert app_map["Washer"]["state_step_3"] == "needs_attention"
    assert app_map["Washer"]["default_timer_minutes"] == 45
    assert app_map["Washer"]["next_state"] == "running"


@pytest.mark.asyncio
async def test_create_custom_appliance_success(client: AsyncClient, db_session: AsyncSession):
    create_hh = await client.post(
        "/api/v1/households",
        json={"name": "Custom Appliance House", "nickname": "Bob"},
    )
    token = create_hh.json()["access_token"]
    member_id = create_hh.json()["member"]["id"]
    hh_id = create_hh.json()["household"]["id"]

    payload = {
        "name": "Espresso Machine",
        "type": "custom",
    }
    res = await client.post(
        "/api/v1/appliances",
        headers={"Authorization": f"Bearer {token}"},
        json=payload,
    )
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Espresso Machine"
    assert data["type"] == "custom"
    assert data["current_state"] == "empty"
    assert data["household_id"] == hh_id
    assert data["state_updated_at"] is not None
    assert data["updated_by_member_id"] == member_id
    assert data["updated_by_member"] is not None
    assert data["updated_by_member"]["nickname"] == "Bob"

    # Verify in DB
    app_id = uuid.UUID(data["id"])
    db_app = await db_session.get(Appliance, app_id)
    assert db_app is not None
    assert db_app.name == "Espresso Machine"
    assert db_app.current_state == "empty"


@pytest.mark.asyncio
async def test_create_custom_appliance_default_type(client: AsyncClient):
    create_hh = await client.post(
        "/api/v1/households",
        json={"name": "Default Type House", "nickname": "Charlie"},
    )
    token = create_hh.json()["access_token"]

    payload = {"name": "Robovac"}
    res = await client.post(
        "/api/v1/appliances",
        headers={"Authorization": f"Bearer {token}"},
        json=payload,
    )
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Robovac"
    assert data["type"] == "custom"
    assert data["current_state"] == "empty"


@pytest.mark.asyncio
async def test_list_appliances_cross_household_isolation(client: AsyncClient):
    # Household 1
    h1 = await client.post(
        "/api/v1/households",
        json={"name": "House 1", "nickname": "User1"},
    )
    token1 = h1.json()["access_token"]

    # Household 2
    h2 = await client.post(
        "/api/v1/households",
        json={"name": "House 2", "nickname": "User2"},
    )
    token2 = h2.json()["access_token"]

    # Add custom appliance to House 1
    await client.post(
        "/api/v1/appliances",
        headers={"Authorization": f"Bearer {token1}"},
        json={"name": "H1 Air Fryer"},
    )

    # Add custom appliance to House 2
    await client.post(
        "/api/v1/appliances",
        headers={"Authorization": f"Bearer {token2}"},
        json={"name": "H2 Blender"},
    )

    # House 1 list: 3 default + 1 custom = 4
    res1 = await client.get(
        "/api/v1/appliances",
        headers={"Authorization": f"Bearer {token1}"},
    )
    assert res1.status_code == 200
    apps1 = res1.json()
    assert len(apps1) == 4
    names1 = [a["name"] for a in apps1]
    assert "H1 Air Fryer" in names1
    assert "H2 Blender" not in names1

    # House 2 list: 3 default + 1 custom = 4
    res2 = await client.get(
        "/api/v1/appliances",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert res2.status_code == 200
    apps2 = res2.json()
    assert len(apps2) == 4
    names2 = [a["name"] for a in apps2]
    assert "H2 Blender" in names2
    assert "H1 Air Fryer" not in names2


@pytest.mark.asyncio
async def test_appliances_unauthenticated_returns_401(client: AsyncClient):
    res_get = await client.get("/api/v1/appliances")
    assert res_get.status_code == 401

    res_post = await client.post("/api/v1/appliances", json={"name": "Test"})
    assert res_post.status_code == 401


@pytest.mark.asyncio
async def test_create_custom_appliance_with_cycle_steps_and_timer(client: AsyncClient):
    create_hh = await client.post(
        "/api/v1/households",
        json={"name": "Espresso House", "nickname": "Barista"},
    )
    token = create_hh.json()["access_token"]

    payload = {
        "name": "Espresso Machine",
        "icon": "coffee",
        "cycle_steps": ["empty", "running", "needs_attention"],
        "timer_enabled": True,
        "default_timer_minutes": 15,
    }
    res = await client.post(
        "/api/v1/appliances",
        headers={"Authorization": f"Bearer {token}"},
        json=payload,
    )
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Espresso Machine"
    assert data["type"] == "coffee"
    assert data["icon"] == "coffee"
    assert data["state_step_1"] == "empty"
    assert data["state_step_2"] == "running"
    assert data["state_step_3"] == "needs_attention"
    assert data["state_step_4"] is None
    assert data["state_step_5"] is None
    assert data["current_state"] == "empty"
    assert data["next_state"] == "running"
    assert data["timer_enabled"] is True
    assert data["default_timer_minutes"] == 15


@pytest.mark.asyncio
async def test_create_custom_appliance_invalid_steps_fails(client: AsyncClient):
    create_hh = await client.post(
        "/api/v1/households",
        json={"name": "Bad Steps House", "nickname": "Tester"},
    )
    token = create_hh.json()["access_token"]

    # Only 1 step (< 2)
    res_one = await client.post(
        "/api/v1/appliances",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Bad 1", "cycle_steps": ["empty"]},
    )
    assert res_one.status_code == 422

    # Invalid state string
    res_bad = await client.post(
        "/api/v1/appliances",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Bad 2", "cycle_steps": ["empty", "exploding"]},
    )
    assert res_bad.status_code == 422


@pytest.mark.asyncio
async def test_update_appliance_put_success_and_auto_reset(client: AsyncClient):
    create_hh = await client.post(
        "/api/v1/households",
        json={"name": "Edit App House", "nickname": "Alice"},
    )
    token = create_hh.json()["access_token"]

    # Create appliance
    c_res = await client.post(
        "/api/v1/appliances",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Robovac",
            "icon": "bot",
            "cycle_steps": ["empty", "running", "needs_attention"],
            "timer_enabled": True,
            "default_timer_minutes": 30,
        },
    )
    app_id = c_res.json()["id"]

    # Start running
    run_res = await client.post(
        f"/api/v1/appliances/{app_id}/state",
        headers={"Authorization": f"Bearer {token}"},
        json={"to_state": "running", "timer_duration_minutes": 30},
    )
    assert run_res.status_code == 200
    assert run_res.json()["current_state"] == "running"
    assert run_res.json()["timer_duration_minutes"] == 30

    # PUT update: modify cycle steps to ['dirty', 'running', 'clean']
    put_res = await client.put(
        f"/api/v1/appliances/{app_id}",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Super Robovac",
            "cycle_steps": ["dirty", "running", "clean"],
            "default_timer_minutes": 45,
        },
    )
    assert put_res.status_code == 200
    updated = put_res.json()
    assert updated["name"] == "Super Robovac"
    assert updated["state_step_1"] == "dirty"
    assert updated["state_step_2"] == "running"
    assert updated["state_step_3"] == "clean"
    # Auto-resets current_state to new step 1 and clears timers!
    assert updated["current_state"] == "dirty"
    assert updated["timer_duration_minutes"] is None
    assert updated["timer_started_at"] is None
    assert updated["timer_ends_at"] is None
    assert updated["default_timer_minutes"] == 45
    assert updated["next_state"] == "running"


@pytest.mark.asyncio
async def test_update_appliance_cross_household_returns_404(client: AsyncClient):
    h1 = await client.post("/api/v1/households", json={"name": "H1", "nickname": "U1"})
    t1 = h1.json()["access_token"]
    h2 = await client.post("/api/v1/households", json={"name": "H2", "nickname": "U2"})
    t2 = h2.json()["access_token"]

    app1 = (await client.get("/api/v1/appliances", headers={"Authorization": f"Bearer {t1}"})).json()[0]

    put_res = await client.put(
        f"/api/v1/appliances/{app1['id']}",
        headers={"Authorization": f"Bearer {t2}"},
        json={"name": "Hacked Name"},
    )
    assert put_res.status_code == 404

