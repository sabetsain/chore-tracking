import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import ChoreAssignment, ChoreLog


@pytest.mark.asyncio
async def test_complete_single_weekly_chore(client: AsyncClient, db_session: AsyncSession):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Complete House", "nickname": "Alice"},
    )
    alice_token = hh_res.json()["access_token"]
    alice_id = hh_res.json()["member"]["id"]
    invite_code = hh_res.json()["household"]["invite_code"]

    join_bob = await client.post(
        "/api/v1/households/join",
        json={"invite_code": invite_code, "nickname": "Bob"},
    )
    bob_token = join_bob.json()["access_token"]
    bob_id = join_bob.json()["member"]["id"]

    # Create single weekly chore
    c_res = await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={"title": "Deep Clean Fridge", "completion_type": "single_weekly", "effort_weight": 4},
    )

    # Get weekly assignments (assigned to Alice)
    week_str = "2026-08-23"
    assign_res = await client.get(
        f"/api/v1/chores/assignments?week_start_date={week_str}",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assignment = assign_res.json()[0]
    assignment_id = assignment["id"]
    assert assignment["status"] == "pending"
    assert assignment["completed_at"] is None
    assert assignment["completed_by_member_id"] is None

    # Bob completes the chore
    comp_res = await client.post(
        f"/api/v1/chores/assignments/{assignment_id}/complete",
        headers={"Authorization": f"Bearer {bob_token}"},
    )
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert comp_data["status"] == "completed"
    assert comp_data["completed_at"] is not None
    assert comp_data["completed_by_member_id"] == bob_id
    assert comp_data["completed_by_member"]["nickname"] == "Bob"

    # Verify DB
    db_assign = await db_session.get(ChoreAssignment, uuid.UUID(assignment_id))
    assert db_assign.status == "completed"
    assert db_assign.completed_by_member_id == uuid.UUID(bob_id)


@pytest.mark.asyncio
async def test_log_continuous_duty_chore(client: AsyncClient, db_session: AsyncSession):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Duty House", "nickname": "Alice"},
    )
    alice_token = hh_res.json()["access_token"]
    alice_id = hh_res.json()["member"]["id"]

    # Create continuous duty chore
    c_res = await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={"title": "Empty Kitchen Trash", "completion_type": "continuous_duty", "effort_weight": 1},
    )

    assign_res = await client.get(
        "/api/v1/chores/assignments?week_start_date=2026-08-23",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assignment_id = assign_res.json()[0]["id"]

    # Log 1st instance
    log1_res = await client.post(
        f"/api/v1/chores/assignments/{assignment_id}/log",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={"note": "Emptied morning trash and replaced liner"},
    )
    assert log1_res.status_code == 201
    log1_data = log1_res.json()
    assert log1_data["assignment_id"] == assignment_id
    assert log1_data["actor_member_id"] == alice_id
    assert log1_data["note"] == "Emptied morning trash and replaced liner"
    assert log1_data["actor_member"]["nickname"] == "Alice"
    assert "logged_at" in log1_data

    # Log 2nd instance without note
    log2_res = await client.post(
        f"/api/v1/chores/assignments/{assignment_id}/log",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={},
    )
    assert log2_res.status_code == 201
    log2_data = log2_res.json()
    assert log2_data["note"] is None

    # Fetch logs list
    logs_res = await client.get(
        f"/api/v1/chores/assignments/{assignment_id}/logs",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assert logs_res.status_code == 200
    logs = logs_res.json()
    assert len(logs) == 2

    # Verify assignment status remains pending for continuous duties
    db_assign = await db_session.get(ChoreAssignment, uuid.UUID(assignment_id))
    assert db_assign.status == "pending"


@pytest.mark.asyncio
async def test_complete_and_log_cross_household_returns_404(client: AsyncClient):
    # Household 1
    h1 = await client.post("/api/v1/households", json={"name": "H1", "nickname": "User1"})
    token1 = h1.json()["access_token"]
    await client.post("/api/v1/chores", headers={"Authorization": f"Bearer {token1}"}, json={"title": "H1 Chore"})
    a1_res = await client.get("/api/v1/chores/assignments?week_start_date=2026-08-23", headers={"Authorization": f"Bearer {token1}"})
    a1_id = a1_res.json()[0]["id"]

    # Household 2
    h2 = await client.post("/api/v1/households", json={"name": "H2", "nickname": "User2"})
    token2 = h2.json()["access_token"]

    # Attempt cross-household complete
    comp_res = await client.post(
        f"/api/v1/chores/assignments/{a1_id}/complete",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert comp_res.status_code == 404

    # Attempt cross-household log
    log_res = await client.post(
        f"/api/v1/chores/assignments/{a1_id}/log",
        headers={"Authorization": f"Bearer {token2}"},
        json={"note": "Hacking log"},
    )
    assert log_res.status_code == 404

    # Attempt cross-household get logs
    get_logs_res = await client.get(
        f"/api/v1/chores/assignments/{a1_id}/logs",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert get_logs_res.status_code == 404
