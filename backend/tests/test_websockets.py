import uuid
import pytest
from fastapi import WebSocketDisconnect
from fastapi.testclient import TestClient
from httpx import AsyncClient

from app.main import app
from app.websocket import ws_manager


@pytest.mark.asyncio
async def test_ws_connection_rejected_without_token():
    household_id = uuid.uuid4()
    client = TestClient(app)
    with pytest.raises(WebSocketDisconnect) as exc_info:
        with client.websocket_connect(f"/api/v1/ws/{household_id}"):
            pass
    assert exc_info.value.code == 1008


@pytest.mark.asyncio
async def test_ws_connection_rejected_with_invalid_token():
    household_id = uuid.uuid4()
    client = TestClient(app)
    with pytest.raises(WebSocketDisconnect) as exc_info:
        with client.websocket_connect(f"/api/v1/ws/{household_id}?token=invalid.jwt.token"):
            pass
    assert exc_info.value.code == 1008


@pytest.mark.asyncio
async def test_ws_connection_rejected_for_wrong_household(client: AsyncClient):
    # Create Household A
    res_a = await client.post(
        "/api/v1/households",
        json={"name": "House A", "nickname": "Alice"},
    )
    token_a = res_a.json()["access_token"]
    
    # Create Household B
    res_b = await client.post(
        "/api/v1/households",
        json={"name": "House B", "nickname": "Bob"},
    )
    household_b_id = res_b.json()["household"]["id"]

    # Try to connect with token A to household B
    test_client = TestClient(app)
    with pytest.raises(WebSocketDisconnect) as exc_info:
        with test_client.websocket_connect(f"/api/v1/ws/{household_b_id}?token={token_a}"):
            pass
    assert exc_info.value.code == 1008


@pytest.mark.asyncio
async def test_ws_connection_accepted_for_valid_household(client: AsyncClient):
    res = await client.post(
        "/api/v1/households",
        json={"name": "My House", "nickname": "Alice"},
    )
    data = res.json()
    token = data["access_token"]
    household_id = data["household"]["id"]

    test_client = TestClient(app)
    with test_client.websocket_connect(f"/api/v1/ws/{household_id}?token={token}") as ws:
        # Connected successfully
        assert ws is not None


class MockWebSocket:
    def __init__(self):
        self.messages = []

    async def send_json(self, data):
        self.messages.append(data)


@pytest.mark.asyncio
async def test_ws_broadcast_appliance_state_changed(client: AsyncClient):
    res = await client.post(
        "/api/v1/households",
        json={"name": "Smart House", "nickname": "Alice"},
    )
    token = res.json()["access_token"]
    household_id = uuid.UUID(res.json()["household"]["id"])
    headers = {"Authorization": f"Bearer {token}"}

    # Register mock websocket connection for this household
    mock_ws = MockWebSocket()
    ws_manager.active_connections[household_id] = {mock_ws}

    # Get dishwasher id
    appliances_res = await client.get("/api/v1/appliances", headers=headers)
    dishwasher = next(a for a in appliances_res.json() if a["type"] == "dishwasher")
    dishwasher_id = dishwasher["id"]

    # Update state: dirty -> running
    update_res = await client.post(
        f"/api/v1/appliances/{dishwasher_id}/state",
        json={"to_state": "running", "timer_duration_minutes": 60},
        headers=headers,
    )
    assert update_res.status_code == 200

    # Verify event broadcast
    assert len(mock_ws.messages) >= 1
    event = mock_ws.messages[-1]
    assert event["event"] == "APPLIANCE_STATE_CHANGED"
    assert event["data"]["current_state"] == "running"
    assert event["data"]["id"] == dishwasher_id

    # Clean up
    ws_manager.disconnect(household_id, mock_ws)


@pytest.mark.asyncio
async def test_ws_broadcast_sensor_event(client: AsyncClient):
    res = await client.post(
        "/api/v1/households",
        json={"name": "Sensor House", "nickname": "Alice"},
    )
    token = res.json()["access_token"]
    household_id = uuid.UUID(res.json()["household"]["id"])
    headers = {"Authorization": f"Bearer {token}"}

    mock_ws = MockWebSocket()
    ws_manager.active_connections[household_id] = {mock_ws}

    appliances_res = await client.get("/api/v1/appliances", headers=headers)
    washer = next(a for a in appliances_res.json() if a["type"] == "washer")
    washer_id = washer["id"]

    # Ingest power > 50W -> running
    sensor_res = await client.post(
        f"/api/v1/appliances/{washer_id}/sensor-event",
        json={"power_watts": 120.0},
    )
    assert sensor_res.status_code == 200

    assert len(mock_ws.messages) >= 1
    event = mock_ws.messages[-1]
    assert event["event"] == "APPLIANCE_STATE_CHANGED"
    assert event["data"]["current_state"] == "running"

    ws_manager.disconnect(household_id, mock_ws)


@pytest.mark.asyncio
async def test_ws_broadcast_chore_events(client: AsyncClient):
    res = await client.post(
        "/api/v1/households",
        json={"name": "Chore House", "nickname": "Alice"},
    )
    token = res.json()["access_token"]
    household_id = uuid.UUID(res.json()["household"]["id"])
    headers = {"Authorization": f"Bearer {token}"}

    mock_ws = MockWebSocket()
    ws_manager.active_connections[household_id] = {mock_ws}

    # 1. Create chore
    chore_res = await client.post(
        "/api/v1/chores",
        json={"title": "Mop Kitchen", "effort_weight": 2},
        headers=headers,
    )
    assert chore_res.status_code == 201
    assert any(m["event"] == "CHORE_UPDATED" for m in mock_ws.messages)

    # 2. Get assignments and complete
    assign_res = await client.get("/api/v1/chores/assignments", headers=headers)
    assignment_id = assign_res.json()[0]["id"]

    mock_ws.messages.clear()
    comp_res = await client.post(
        f"/api/v1/chores/assignments/{assignment_id}/complete",
        headers=headers,
    )
    assert comp_res.status_code == 200
    assert len(mock_ws.messages) >= 1
    assert mock_ws.messages[-1]["event"] == "CHORE_UPDATED"

    # 3. Log chore duty
    mock_ws.messages.clear()
    log_res = await client.post(
        f"/api/v1/chores/assignments/{assignment_id}/log",
        json={"note": "Cleaned thoroughly"},
        headers=headers,
    )
    assert log_res.status_code == 201
    assert len(mock_ws.messages) >= 1
    assert mock_ws.messages[-1]["event"] == "CHORE_UPDATED"

    ws_manager.disconnect(household_id, mock_ws)


@pytest.mark.asyncio
async def test_ws_broadcast_member_status_changed(client: AsyncClient):
    res = await client.post(
        "/api/v1/households",
        json={"name": "Member House", "nickname": "Alice"},
    )
    token = res.json()["access_token"]
    household_id = uuid.UUID(res.json()["household"]["id"])
    headers = {"Authorization": f"Bearer {token}"}

    mock_ws = MockWebSocket()
    ws_manager.active_connections[household_id] = {mock_ws}

    status_res = await client.patch(
        "/api/v1/members/me/status",
        json={"status": "away", "away_until": "2026-09-01T00:00:00Z"},
        headers=headers,
    )
    assert status_res.status_code == 200

    assert len(mock_ws.messages) >= 1
    event = mock_ws.messages[-1]
    assert event["event"] == "MEMBER_STATUS_CHANGED"
    assert event["data"]["status"] == "away"

    ws_manager.disconnect(household_id, mock_ws)


@pytest.mark.asyncio
async def test_ws_household_isolation(client: AsyncClient):
    # Household 1
    res1 = await client.post(
        "/api/v1/households",
        json={"name": "House 1", "nickname": "Alice"},
    )
    token1 = res1.json()["access_token"]
    hh1_id = uuid.UUID(res1.json()["household"]["id"])
    headers1 = {"Authorization": f"Bearer {token1}"}

    # Household 2
    res2 = await client.post(
        "/api/v1/households",
        json={"name": "House 2", "nickname": "Bob"},
    )
    token2 = res2.json()["access_token"]
    hh2_id = uuid.UUID(res2.json()["household"]["id"])

    mock_ws1 = MockWebSocket()
    mock_ws2 = MockWebSocket()
    ws_manager.active_connections[hh1_id] = {mock_ws1}
    ws_manager.active_connections[hh2_id] = {mock_ws2}

    # Trigger action in Household 1
    status_res = await client.patch(
        "/api/v1/members/me/status",
        json={"status": "away"},
        headers=headers1,
    )
    assert status_res.status_code == 200

    # Household 1 received event
    assert len(mock_ws1.messages) == 1
    assert mock_ws1.messages[0]["event"] == "MEMBER_STATUS_CHANGED"

    # Household 2 received NOTHING
    assert len(mock_ws2.messages) == 0

    ws_manager.disconnect(hh1_id, mock_ws1)
    ws_manager.disconnect(hh2_id, mock_ws2)
