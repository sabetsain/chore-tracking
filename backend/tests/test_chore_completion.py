import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import ChoreAssignment, ChoreLog


@pytest.mark.asyncio
async def test_complete_by_assigned_member_success(client: AsyncClient, db_session: AsyncSession):
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

    # Activate rotation
    await client.post("/api/v1/chores/rotation/activate", headers={"Authorization": f"Bearer {alice_token}"})

    # Create single weekly chore
    c_res = await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={"title": "Deep Clean Fridge", "completion_type": "single_weekly", "effort_weight": 4},
    )

    # Week 2026-08-23: Alice gets assigned chore
    week_str = "2026-08-23"
    assign_res = await client.get(
        f"/api/v1/chores/assignments?week_start_date={week_str}",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assignment = assign_res.json()[0]
    assignment_id = assignment["id"]
    assigned_member_id = assignment["member_id"]

    token_to_use = alice_token if assigned_member_id == alice_id else bob_token
    expected_member_id = alice_id if assigned_member_id == alice_id else bob_id

    comp_res = await client.post(
        f"/api/v1/chores/assignments/{assignment_id}/complete",
        headers={"Authorization": f"Bearer {token_to_use}"},
    )
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert comp_data["status"] == "completed"
    assert comp_data["completed_at"] is not None
    assert comp_data["completed_by_member_id"] == expected_member_id

    # Verify DB
    db_assign = await db_session.get(ChoreAssignment, uuid.UUID(assignment_id))
    assert db_assign.status == "completed"
    assert db_assign.completed_by_member_id == uuid.UUID(expected_member_id)


@pytest.mark.asyncio
async def test_complete_by_non_assigned_non_admin_fails_403(client: AsyncClient):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Auth House", "nickname": "Alice"},
    )
    alice_token = hh_res.json()["access_token"]
    alice_id = hh_res.json()["member"]["id"]
    invite_code = hh_res.json()["household"]["invite_code"]

    join_bob = await client.post(
        "/api/v1/households/join",
        json={"invite_code": invite_code, "nickname": "Bob"},
    )
    bob_token = join_bob.json()["access_token"]

    join_charlie = await client.post(
        "/api/v1/households/join",
        json={"invite_code": invite_code, "nickname": "Charlie"},
    )
    charlie_token = join_charlie.json()["access_token"]
    charlie_id = join_charlie.json()["member"]["id"]

    # Activate rotation
    await client.post("/api/v1/chores/rotation/activate", headers={"Authorization": f"Bearer {alice_token}"})

    # 1 chore: assigned to Alice (week 2026-08-23)
    await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={"title": "Scrub Sinks", "effort_weight": 3},
    )

    assign_res = await client.get(
        "/api/v1/chores/assignments?week_start_date=2026-08-23",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assignment = assign_res.json()[0]
    assignment_id = assignment["id"]
    # Ensure it's assigned to Alice
    assert assignment["member_id"] == alice_id

    # Bob (non-admin, not assignee) attempts to complete Alice's chore -> 403
    comp_res = await client.post(
        f"/api/v1/chores/assignments/{assignment_id}/complete",
        headers={"Authorization": f"Bearer {bob_token}"},
    )
    assert comp_res.status_code == 403
    assert "Only assigned member or admin can complete this chore" in comp_res.json()["detail"]


@pytest.mark.asyncio
async def test_complete_by_admin_even_if_assigned_to_other(client: AsyncClient):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Admin Comp House", "nickname": "Alice"},
    )
    alice_token = hh_res.json()["access_token"]
    alice_id = hh_res.json()["member"]["id"]
    invite_code = hh_res.json()["household"]["invite_code"]

    join_bob = await client.post(
        "/api/v1/households/join",
        json={"invite_code": invite_code, "nickname": "Bob"},
    )
    bob_id = join_bob.json()["member"]["id"]

    # Activate rotation
    await client.post("/api/v1/chores/rotation/activate", headers={"Authorization": f"Bearer {alice_token}"})

    # Create 2 chores: c1 (weight 3), c2 (weight 2)
    # In week 2026-08-23 (%2=1): Bucket 0 (c1) -> Bob, Bucket 1 (c2) -> Alice
    c1 = (await client.post("/api/v1/chores", headers={"Authorization": f"Bearer {alice_token}"}, json={"title": "Mow Lawn", "effort_weight": 3})).json()

    assign_res = await client.get(
        "/api/v1/chores/assignments?week_start_date=2026-08-23",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assignment = next(a for a in assign_res.json() if a["chore_id"] == c1["id"])
    assert assignment["member_id"] == bob_id

    # Alice (admin) completes Bob's chore -> 200 OK
    comp_res = await client.post(
        f"/api/v1/chores/assignments/{assignment['id']}/complete",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assert comp_res.status_code == 200
    assert comp_res.json()["status"] == "completed"
    assert comp_res.json()["completed_by_member_id"] == alice_id


@pytest.mark.asyncio
async def test_uncomplete_by_assigned_member_and_admin(client: AsyncClient, db_session: AsyncSession):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Uncomplete House", "nickname": "Alice"},
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

    join_charlie = await client.post(
        "/api/v1/households/join",
        json={"invite_code": invite_code, "nickname": "Charlie"},
    )
    charlie_token = join_charlie.json()["access_token"]
    charlie_id = join_charlie.json()["member"]["id"]

    # Activate rotation
    await client.post("/api/v1/chores/rotation/activate", headers={"Authorization": f"Bearer {alice_token}"})

    # 1 chore: assigned to Alice (week 2026-08-23, %3=0, Bucket 0 -> Alice)
    await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={"title": "Wash Windows", "effort_weight": 2},
    )

    assign_res = await client.get(
        "/api/v1/chores/assignments?week_start_date=2026-08-23",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assignment = assign_res.json()[0]
    assignment_id = assignment["id"]
    assert assignment["member_id"] == alice_id

    # 1. Alice completes chore
    comp_res = await client.post(
        f"/api/v1/chores/assignments/{assignment_id}/complete",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assert comp_res.status_code == 200
    assert comp_res.json()["status"] == "completed"

    # 2. Charlie (non-admin, not assignee) tries to uncomplete -> 403
    charlie_uncomp = await client.post(
        f"/api/v1/chores/assignments/{assignment_id}/uncomplete",
        headers={"Authorization": f"Bearer {charlie_token}"},
    )
    assert charlie_uncomp.status_code == 403
    assert "Only assigned member or admin can uncomplete this chore" in charlie_uncomp.json()["detail"]

    # 3. Bob (non-admin, not assignee) tries to uncomplete -> 403
    bob_uncomp = await client.post(
        f"/api/v1/chores/assignments/{assignment_id}/uncomplete",
        headers={"Authorization": f"Bearer {bob_token}"},
    )
    assert bob_uncomp.status_code == 403
    assert "Only assigned member or admin can uncomplete this chore" in bob_uncomp.json()["detail"]

    # 4. Alice (assignee & admin) uncompletes -> 200 OK
    uncomp_res = await client.post(
        f"/api/v1/chores/assignments/{assignment_id}/uncomplete",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assert uncomp_res.status_code == 200
    data = uncomp_res.json()
    assert data["status"] == "pending"
    assert data["completed_at"] is None
    assert data["completed_by_member_id"] is None

    # Verify DB
    db_assign = await db_session.get(ChoreAssignment, uuid.UUID(assignment_id))
    assert db_assign.status == "pending"
    assert db_assign.completed_at is None
    assert db_assign.completed_by_member_id is None



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

    # Attempt cross-household uncomplete
    uncomp_res = await client.post(
        f"/api/v1/chores/assignments/{a1_id}/uncomplete",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert uncomp_res.status_code == 404

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

