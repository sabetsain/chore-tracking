import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Chore, ChoreAssignment, ChoreLog


@pytest.mark.asyncio
async def test_unclaim_chore_when_rotation_inactive(client: AsyncClient, db_session: AsyncSession):
    # Setup household with solo member Alice (admin)
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Unclaim House", "nickname": "Alice"},
    )
    alice_token = hh_res.json()["access_token"]
    alice_id = hh_res.json()["member"]["id"]

    # Alice creates chore while rotation is inactive (default)
    chore_res = await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={"title": "Clean Garage", "effort_weight": 3},
    )
    assert chore_res.status_code == 201

    # Assignments for current week has member_id = None
    week_str = "2026-08-23"
    assign_res = await client.get(
        f"/api/v1/chores/assignments?week_start_date={week_str}",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assert assign_res.status_code == 200
    assignment_id = assign_res.json()[0]["id"]
    assert assign_res.json()[0]["member_id"] is None

    # Up for grabs has 1 chore
    grabs_res = await client.get(
        f"/api/v1/chores/up-for-grabs?week_start_date={week_str}",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assert len(grabs_res.json()) == 1

    # Alice claims the chore
    claim_res = await client.post(
        f"/api/v1/chores/assignments/{assignment_id}/claim",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assert claim_res.status_code == 200
    assert claim_res.json()["member_id"] == alice_id

    # Up for grabs is now empty
    grabs_res2 = await client.get(
        f"/api/v1/chores/up-for-grabs?week_start_date={week_str}",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assert len(grabs_res2.json()) == 0

    # Alice unclaims the chore
    unclaim_res = await client.post(
        f"/api/v1/chores/assignments/{assignment_id}/unclaim",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assert unclaim_res.status_code == 200
    assert unclaim_res.json()["member_id"] is None

    # Up for grabs has the chore again
    grabs_res3 = await client.get(
        f"/api/v1/chores/up-for-grabs?week_start_date={week_str}",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assert len(grabs_res3.json()) == 1
    assert grabs_res3.json()[0]["id"] == assignment_id

    # Verify DB
    db_assign = await db_session.get(ChoreAssignment, uuid.UUID(assignment_id))
    assert db_assign.member_id is None


@pytest.mark.asyncio
async def test_unclaim_by_non_owner_non_admin_returns_403(client: AsyncClient):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Perms House", "nickname": "Alice"},
    )
    alice_token = hh_res.json()["access_token"]
    invite_code = hh_res.json()["household"]["invite_code"]

    # Bob and Charlie join (role = member)
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

    # Alice creates chore
    await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={"title": "Mow Lawn", "effort_weight": 4},
    )

    assign_res = await client.get(
        "/api/v1/chores/assignments?week_start_date=2026-08-23",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assignment_id = assign_res.json()[0]["id"]

    # Bob claims it
    await client.post(
        f"/api/v1/chores/assignments/{assignment_id}/claim",
        headers={"Authorization": f"Bearer {bob_token}"},
    )

    # Charlie attempts to unclaim Bob's chore -> 403 Forbidden
    unclaim_res = await client.post(
        f"/api/v1/chores/assignments/{assignment_id}/unclaim",
        headers={"Authorization": f"Bearer {charlie_token}"},
    )
    assert unclaim_res.status_code == 403
    assert "Only assigned member or admin" in unclaim_res.json()["detail"]


@pytest.mark.asyncio
async def test_admin_can_unclaim_other_member_chore_when_rotation_inactive(client: AsyncClient):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Admin Unclaim House", "nickname": "Alice"},
    )
    alice_token = hh_res.json()["access_token"]
    invite_code = hh_res.json()["household"]["invite_code"]

    join_bob = await client.post(
        "/api/v1/households/join",
        json={"invite_code": invite_code, "nickname": "Bob"},
    )
    bob_token = join_bob.json()["access_token"]

    # Alice creates chore
    await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={"title": "Dust Bookshelves", "effort_weight": 1},
    )

    assign_res = await client.get(
        "/api/v1/chores/assignments?week_start_date=2026-08-23",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assignment_id = assign_res.json()[0]["id"]

    # Bob claims it
    await client.post(
        f"/api/v1/chores/assignments/{assignment_id}/claim",
        headers={"Authorization": f"Bearer {bob_token}"},
    )

    # Admin Alice unclaims Bob's chore
    unclaim_res = await client.post(
        f"/api/v1/chores/assignments/{assignment_id}/unclaim",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assert unclaim_res.status_code == 200
    assert unclaim_res.json()["member_id"] is None


@pytest.mark.asyncio
async def test_unclaim_when_rotation_is_active_returns_400(client: AsyncClient):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Active Rotation House", "nickname": "Alice"},
    )
    alice_token = hh_res.json()["access_token"]
    invite_code = hh_res.json()["household"]["invite_code"]

    join_bob = await client.post(
        "/api/v1/households/join",
        json={"invite_code": invite_code, "nickname": "Bob"},
    )
    bob_token = join_bob.json()["access_token"]

    await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={"title": "Wash Dishes", "effort_weight": 2},
    )

    # Activate rotation
    await client.post(
        "/api/v1/chores/rotation/activate",
        headers={"Authorization": f"Bearer {alice_token}"},
    )

    assign_res = await client.get(
        "/api/v1/chores/assignments?week_start_date=2026-08-23",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assignment = assign_res.json()[0]
    assignment_id = assignment["id"]
    assigned_token = bob_token if assignment["member_id"] == join_bob.json()["member"]["id"] else alice_token

    # Attempt to unclaim while rotation is active -> 400 Bad Request
    unclaim_res = await client.post(
        f"/api/v1/chores/assignments/{assignment_id}/unclaim",
        headers={"Authorization": f"Bearer {assigned_token}"},
    )
    assert unclaim_res.status_code == 400
    assert "Cannot unclaim chores when cyclical chore rotation is active" in unclaim_res.json()["detail"]


@pytest.mark.asyncio
async def test_unclaim_completed_chore_returns_400(client: AsyncClient):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Completed Unclaim House", "nickname": "Alice"},
    )
    alice_token = hh_res.json()["access_token"]

    await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={"title": "Clean Windows", "effort_weight": 2},
    )

    assign_res = await client.get(
        "/api/v1/chores/assignments?week_start_date=2026-08-23",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assignment_id = assign_res.json()[0]["id"]

    # Alice claims
    await client.post(
        f"/api/v1/chores/assignments/{assignment_id}/claim",
        headers={"Authorization": f"Bearer {alice_token}"},
    )

    # Alice completes
    await client.post(
        f"/api/v1/chores/assignments/{assignment_id}/complete",
        headers={"Authorization": f"Bearer {alice_token}"},
    )

    # Alice attempts to unclaim completed chore -> 400 Bad Request
    unclaim_res = await client.post(
        f"/api/v1/chores/assignments/{assignment_id}/unclaim",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assert unclaim_res.status_code == 400
    assert "Cannot unclaim a completed or non-pending chore" in unclaim_res.json()["detail"]


@pytest.mark.asyncio
async def test_patch_chore_updates_fields(client: AsyncClient, db_session: AsyncSession):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Chore Edit House", "nickname": "Alice"},
    )
    alice_token = hh_res.json()["access_token"]

    create_res = await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={
            "title": "Old Title",
            "description": "Old description",
            "effort_weight": 1,
            "completion_type": "single_weekly",
        },
    )
    assert create_res.status_code == 201
    chore_id = create_res.json()["id"]

    # Patch chore with updated fields
    patch_res = await client.patch(
        f"/api/v1/chores/{chore_id}",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={
            "title": "New Title",
            "description": "New detailed description",
            "effort_weight": 4,
            "completion_type": "continuous_duty",
        },
    )
    assert patch_res.status_code == 200
    data = patch_res.json()
    assert data["title"] == "New Title"
    assert data["description"] == "New detailed description"
    assert data["effort_weight"] == 4
    assert data["completion_type"] == "continuous_duty"

    # Verify DB
    db_chore = await db_session.get(Chore, uuid.UUID(chore_id))
    assert db_chore.title == "New Title"
    assert db_chore.effort_weight == 4
    assert db_chore.completion_type == "continuous_duty"


@pytest.mark.asyncio
async def test_delete_chore_cascades_assignments_and_logs(client: AsyncClient, db_session: AsyncSession):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Cascade Delete House", "nickname": "Alice"},
    )
    alice_token = hh_res.json()["access_token"]

    # Create chore A and chore B
    chore_a_res = await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={"title": "Chore A To Delete", "effort_weight": 2, "completion_type": "continuous_duty"},
    )
    chore_a_id = chore_a_res.json()["id"]

    chore_b_res = await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={"title": "Chore B To Keep", "effort_weight": 3},
    )
    chore_b_id = chore_b_res.json()["id"]

    week_str = "2026-08-23"
    assign_res = await client.get(
        f"/api/v1/chores/assignments?week_start_date={week_str}",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assignments = assign_res.json()
    assert len(assignments) == 2
    asg_a = next(a for a in assignments if a["chore_id"] == chore_a_id)
    asg_b = next(a for a in assignments if a["chore_id"] == chore_b_id)

    # Claim chore A and add a log to chore A
    await client.post(
        f"/api/v1/chores/assignments/{asg_a['id']}/claim",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    log_res = await client.post(
        f"/api/v1/chores/assignments/{asg_a['id']}/log",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={"note": "Emptied recycling bin"},
    )
    assert log_res.status_code == 201
    log_id = log_res.json()["id"]

    # Delete Chore A
    del_res = await client.delete(
        f"/api/v1/chores/{chore_a_id}",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assert del_res.status_code == 204

    # Verify Chore A, its assignment, and its log are gone from DB
    assert await db_session.get(Chore, uuid.UUID(chore_a_id)) is None
    assert await db_session.get(ChoreAssignment, uuid.UUID(asg_a["id"])) is None
    assert await db_session.get(ChoreLog, uuid.UUID(log_id)) is None

    # Verify Chore B and its assignment are intact (Option B preservation)
    assert await db_session.get(Chore, uuid.UUID(chore_b_id)) is not None
    assert await db_session.get(ChoreAssignment, uuid.UUID(asg_b["id"])) is not None
