import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Appliance, ApplianceStateLog


@pytest.mark.asyncio
async def test_sensor_event_starts_cycle_from_empty(client: AsyncClient, db_session: AsyncSession):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Sensor House", "nickname": "Alice"},
    )
    token = hh_res.json()["access_token"]

    list_res = await client.get(
        "/api/v1/appliances",
        headers={"Authorization": f"Bearer {token}"},
    )
    washer = next(a for a in list_res.json() if a["name"] == "Washer")
    app_id = washer["id"]
    assert washer["current_state"] == "empty"

    # Send sensor webhook event (> 50W) without auth
    res = await client.post(
        f"/api/v1/appliances/{app_id}/sensor-event",
        json={"power_watts": 85.5, "device_id": "smart_plug_washer"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["current_state"] == "running"
    assert data["updated_by_member_id"] is None

    # Verify log in DB
    stmt = (
        select(ApplianceStateLog)
        .where(ApplianceStateLog.appliance_id == uuid.UUID(app_id))
    )
    logs = (await db_session.execute(stmt)).scalars().all()
    assert len(logs) == 1
    assert logs[0].from_state == "empty"
    assert logs[0].to_state == "running"
    assert logs[0].trigger_source == "sensor_webhook"
    assert logs[0].actor_member_id is None


@pytest.mark.asyncio
async def test_sensor_event_starts_cycle_from_dirty(client: AsyncClient, db_session: AsyncSession):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Sensor Dirty House", "nickname": "Alice"},
    )
    token = hh_res.json()["access_token"]

    list_res = await client.get(
        "/api/v1/appliances",
        headers={"Authorization": f"Bearer {token}"},
    )
    dishwasher = next(a for a in list_res.json() if a["name"] == "Dishwasher")
    app_id = dishwasher["id"]
    assert dishwasher["current_state"] == "dirty"

    # Sensor detects high power > 50W from dirty state
    res = await client.post(
        f"/api/v1/appliances/{app_id}/sensor-event",
        json={"power_watts": 1200.0},
    )
    assert res.status_code == 200
    assert res.json()["current_state"] == "running"

    # Verify logs
    stmt = (
        select(ApplianceStateLog)
        .where(ApplianceStateLog.appliance_id == uuid.UUID(app_id))
        .order_by(ApplianceStateLog.created_at.asc())
    )
    logs = (await db_session.execute(stmt)).scalars().all()
    assert len(logs) == 1
    assert logs[0].from_state == "dirty"
    assert logs[0].to_state == "running"
    assert logs[0].trigger_source == "sensor_webhook"
    assert logs[0].actor_member_id is None


@pytest.mark.asyncio
async def test_sensor_event_completes_cycle_from_running(client: AsyncClient, db_session: AsyncSession):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Sensor Complete House", "nickname": "Alice"},
    )
    token = hh_res.json()["access_token"]

    list_res = await client.get(
        "/api/v1/appliances",
        headers={"Authorization": f"Bearer {token}"},
    )
    dryer = next(a for a in list_res.json() if a["name"] == "Dryer")
    app_id = dryer["id"]

    # Transition to running with required timer
    await client.post(
        f"/api/v1/appliances/{app_id}/state",
        headers={"Authorization": f"Bearer {token}"},
        json={"to_state": "running", "timer_duration_minutes": 45},
    )

    # Sensor detects cycle completion (< 5W)
    res = await client.post(
        f"/api/v1/appliances/{app_id}/sensor-event",
        json={"power_watts": 1.5, "device_id": "plug_dryer"},
    )
    assert res.status_code == 200
    assert res.json()["current_state"] == "needs_attention"

    # Verify log
    stmt = (
        select(ApplianceStateLog)
        .where(ApplianceStateLog.appliance_id == uuid.UUID(app_id))
        .order_by(ApplianceStateLog.created_at.asc())
    )
    logs = (await db_session.execute(stmt)).scalars().all()
    assert len(logs) == 2
    assert logs[0].from_state == "empty"
    assert logs[0].to_state == "running"
    assert logs[1].from_state == "running"
    assert logs[1].to_state == "needs_attention"
    assert logs[1].trigger_source == "sensor_webhook"
    assert logs[1].actor_member_id is None


@pytest.mark.asyncio
async def test_sensor_event_ignored_when_no_threshold_met(client: AsyncClient, db_session: AsyncSession):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Sensor Ignore House", "nickname": "Alice"},
    )
    token = hh_res.json()["access_token"]

    list_res = await client.get(
        "/api/v1/appliances",
        headers={"Authorization": f"Bearer {token}"},
    )
    dishwasher = next(a for a in list_res.json() if a["name"] == "Dishwasher")
    app_id = dishwasher["id"]
    assert dishwasher["current_state"] == "dirty"

    # Low power reading (20W, not > 50W, and not running)
    res1 = await client.post(
        f"/api/v1/appliances/{app_id}/sensor-event",
        json={"power_watts": 20.0},
    )
    assert res1.status_code == 200
    assert res1.json()["current_state"] == "dirty"

    # Zero power reading (0.0W < 5W, but state is dirty, not running)
    res2 = await client.post(
        f"/api/v1/appliances/{app_id}/sensor-event",
        json={"power_watts": 0.0},
    )
    assert res2.status_code == 200
    assert res2.json()["current_state"] == "dirty"

    # No state transition logs should exist
    stmt = (
        select(ApplianceStateLog)
        .where(ApplianceStateLog.appliance_id == uuid.UUID(app_id))
    )
    logs = (await db_session.execute(stmt)).scalars().all()
    assert len(logs) == 0


@pytest.mark.asyncio
async def test_sensor_event_appliance_not_found_returns_404(client: AsyncClient):
    random_id = uuid.uuid4()
    res = await client.post(
        f"/api/v1/appliances/{random_id}/sensor-event",
        json={"power_watts": 100.0},
    )
    assert res.status_code == 404
    assert res.json()["detail"] == "Appliance not found"


@pytest.mark.asyncio
async def test_sensor_event_validation_negative_power(client: AsyncClient):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Sensor Validation House", "nickname": "Alice"},
    )
    token = hh_res.json()["access_token"]

    list_res = await client.get(
        "/api/v1/appliances",
        headers={"Authorization": f"Bearer {token}"},
    )
    app_id = list_res.json()[0]["id"]

    res = await client.post(
        f"/api/v1/appliances/{app_id}/sensor-event",
        json={"power_watts": -10.0},
    )
    assert res.status_code == 422
