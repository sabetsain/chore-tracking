import uuid
from datetime import date, timedelta
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import ChoreAssignment


@pytest.mark.asyncio
async def test_weekly_rotation_round_robin(client: AsyncClient, db_session: AsyncSession):
    # Setup household with 3 members: Alice, Bob, Charlie
    create_res = await client.post(
        "/api/v1/households",
        json={"name": "Rotation House", "nickname": "Alice"},
    )
    admin_token = create_res.json()["access_token"]
    invite_code = create_res.json()["household"]["invite_code"]

    join_bob = await client.post(
        "/api/v1/households/join",
        json={"invite_code": invite_code, "nickname": "Bob"},
    )
    bob_id = join_bob.json()["member"]["id"]

    join_charlie = await client.post(
        "/api/v1/households/join",
        json={"invite_code": invite_code, "nickname": "Charlie"},
    )
    charlie_id = join_charlie.json()["member"]["id"]
    alice_id = create_res.json()["member"]["id"]

    # Create 3 chores
    c1_res = await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"title": "Dishes", "effort_weight": 2},
    )
    c2_res = await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"title": "Vacuum", "effort_weight": 3},
    )
    c3_res = await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"title": "Trash", "effort_weight": 1},
    )
    c1_id = c1_res.json()["id"]
    c2_id = c2_res.json()["id"]
    c3_id = c3_res.json()["id"]

    week1 = "2026-08-23"  # Sunday
    week2 = "2026-08-30"  # Next Sunday

    # Week 1 assignments
    res_w1 = await client.get(
        f"/api/v1/chores/assignments?week_start_date={week1}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_w1.status_code == 200
    w1_assignments = {a["chore_id"]: a["member_id"] for a in res_w1.json()}
    assert len(w1_assignments) == 3
    assert w1_assignments[c1_id] == alice_id
    assert w1_assignments[c2_id] == bob_id
    assert w1_assignments[c3_id] == charlie_id

    # Week 2 assignments - rotated round-robin
    res_w2 = await client.get(
        f"/api/v1/chores/assignments?week_start_date={week2}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_w2.status_code == 200
    w2_assignments = {a["chore_id"]: a["member_id"] for a in res_w2.json()}
    assert len(w2_assignments) == 3
    assert w2_assignments[c1_id] == bob_id
    assert w2_assignments[c2_id] == charlie_id
    assert w2_assignments[c3_id] == alice_id


@pytest.mark.asyncio
async def test_weekly_rotation_skips_away_member(client: AsyncClient):
    # Setup household with Alice, Bob, Charlie
    create_res = await client.post(
        "/api/v1/households",
        json={"name": "Skip Away House", "nickname": "Alice"},
    )
    admin_token = create_res.json()["access_token"]
    alice_id = create_res.json()["member"]["id"]
    invite_code = create_res.json()["household"]["invite_code"]

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
    charlie_id = join_charlie.json()["member"]["id"]

    # 1 Chore
    c1_res = await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"title": "Bathroom Cleaning", "effort_weight": 4},
    )
    c1_id = c1_res.json()["id"]

    week1 = "2026-08-23"
    week2 = "2026-08-30"

    # Week 1: assigned to Alice
    res_w1 = await client.get(
        f"/api/v1/chores/assignments?week_start_date={week1}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_w1.status_code == 200
    assert res_w1.json()[0]["member_id"] == alice_id

    # Bob sets status to 'away' before Week 2
    await client.patch(
        "/api/v1/members/me/status",
        headers={"Authorization": f"Bearer {bob_token}"},
        json={"status": "away"},
    )

    # Week 2: Next in round-robin after Alice was Bob, but Bob is away -> skips to Charlie
    res_w2 = await client.get(
        f"/api/v1/chores/assignments?week_start_date={week2}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_w2.status_code == 200
    assert res_w2.json()[0]["member_id"] == charlie_id


@pytest.mark.asyncio
async def test_weekly_rotation_all_away_sets_member_none(client: AsyncClient):
    create_res = await client.post(
        "/api/v1/households",
        json={"name": "All Away House", "nickname": "SoloAlice"},
    )
    admin_token = create_res.json()["access_token"]

    # Alice sets away
    await client.patch(
        "/api/v1/members/me/status",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"status": "away"},
    )

    await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"title": "Dusting", "effort_weight": 1},
    )

    week1 = "2026-08-23"
    res_w1 = await client.get(
        f"/api/v1/chores/assignments?week_start_date={week1}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_w1.status_code == 200
    assignments = res_w1.json()
    assert len(assignments) == 1
    assert assignments[0]["member_id"] is None
    assert assignments[0]["status"] == "pending"


@pytest.mark.asyncio
async def test_weekly_rotation_idempotent(client: AsyncClient, db_session: AsyncSession):
    create_res = await client.post(
        "/api/v1/households",
        json={"name": "Idempotent House", "nickname": "Alice"},
    )
    admin_token = create_res.json()["access_token"]

    await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"title": "Mop Floor", "effort_weight": 2},
    )

    week1 = "2026-08-23"
    # Call twice
    res1 = await client.get(
        f"/api/v1/chores/assignments?week_start_date={week1}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    res2 = await client.get(
        f"/api/v1/chores/assignments?week_start_date={week1}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res1.status_code == 200
    assert res2.status_code == 200
    assert res1.json()[0]["id"] == res2.json()[0]["id"]

    # Verify only 1 record in DB
    all_assign = await db_session.execute(select(ChoreAssignment))
    assert len(all_assign.scalars().all()) == 1


@pytest.mark.asyncio
async def test_get_assignments_default_current_week(client: AsyncClient):
    create_res = await client.post(
        "/api/v1/households",
        json={"name": "Current Week House", "nickname": "Alice"},
    )
    admin_token = create_res.json()["access_token"]

    await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"title": "Daily Kitchen Wipe", "effort_weight": 2},
    )

    # Calling without week_start_date
    res = await client.get(
        "/api/v1/chores/assignments",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    # Check that week_start_date is a Sunday
    assigned_date = date.fromisoformat(data[0]["week_start_date"])
    # Sunday has weekday() == 6 in Python
    assert assigned_date.weekday() == 6
