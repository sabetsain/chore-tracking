import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import ChoreAssignment


@pytest.mark.asyncio
async def test_up_for_grabs_pool_and_claim_unassigned(client: AsyncClient, db_session: AsyncSession):
    # Setup household with solo member Alice
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Grabs House", "nickname": "Alice"},
    )
    alice_token = hh_res.json()["access_token"]
    invite_code = hh_res.json()["household"]["invite_code"]

    # Alice sets away so rotation generates assignment with member_id = None
    await client.patch(
        "/api/v1/members/me/status",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={"status": "away"},
    )

    # Alice creates chore
    await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={"title": "Clean Balcony", "effort_weight": 2},
    )

    week_str = "2026-08-23"
    # Ensure assignments are initialized for the week
    await client.get(
        f"/api/v1/chores/assignments?week_start_date={week_str}",
        headers={"Authorization": f"Bearer {alice_token}"},
    )

    # Bob joins household
    join_bob = await client.post(
        "/api/v1/households/join",
        json={"invite_code": invite_code, "nickname": "Bob"},
    )
    bob_token = join_bob.json()["access_token"]
    bob_id = join_bob.json()["member"]["id"]

    # Bob checks up for grabs pool
    pool_res = await client.get(
        f"/api/v1/chores/up-for-grabs?week_start_date={week_str}",
        headers={"Authorization": f"Bearer {bob_token}"},
    )
    assert pool_res.status_code == 200
    pool = pool_res.json()
    assert len(pool) == 1
    assert pool[0]["chore"]["title"] == "Clean Balcony"
    assert pool[0]["member_id"] is None
    assignment_id = pool[0]["id"]

    # Bob claims the chore
    claim_res = await client.post(
        f"/api/v1/chores/assignments/{assignment_id}/claim",
        headers={"Authorization": f"Bearer {bob_token}"},
    )
    assert claim_res.status_code == 200
    claim_data = claim_res.json()
    assert claim_data["member_id"] == bob_id
    assert claim_data["member"]["nickname"] == "Bob"

    # Pool should now be empty
    pool_res2 = await client.get(
        f"/api/v1/chores/up-for-grabs?week_start_date={week_str}",
        headers={"Authorization": f"Bearer {bob_token}"},
    )
    assert pool_res2.status_code == 200
    assert len(pool_res2.json()) == 0

    # Verify DB
    db_assign = await db_session.get(ChoreAssignment, uuid.UUID(assignment_id))
    assert str(db_assign.member_id) == bob_id


@pytest.mark.asyncio
async def test_up_for_grabs_pool_includes_away_member_chores(client: AsyncClient):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Away Pool House", "nickname": "Alice"},
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

    # Create chore
    await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={"title": "Take Out Recycling", "effort_weight": 1},
    )

    week_str = "2026-08-23"
    # Generate assignment while Bob is active -> assigned to Bob (week_index=33, 33%2=1)
    assign_res = await client.get(
        f"/api/v1/chores/assignments?week_start_date={week_str}",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assignment_id = assign_res.json()[0]["id"]
    assert assign_res.json()[0]["member_id"] == bob_id

    # Pool is empty initially
    p1 = await client.get(
        f"/api/v1/chores/up-for-grabs?week_start_date={week_str}",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assert len(p1.json()) == 0

    # Bob goes away mid-week
    await client.patch(
        "/api/v1/members/me/status",
        headers={"Authorization": f"Bearer {bob_token}"},
        json={"status": "away"},
    )

    # Now Bob's chore shows up in the Up for Grabs pool
    p2 = await client.get(
        f"/api/v1/chores/up-for-grabs?week_start_date={week_str}",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assert len(p2.json()) == 1
    assert p2.json()[0]["id"] == assignment_id

    # Alice claims it
    claim_res = await client.post(
        f"/api/v1/chores/assignments/{assignment_id}/claim",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assert claim_res.status_code == 200
    assert claim_res.json()["member_id"] == alice_id



@pytest.mark.asyncio
async def test_claim_completed_chore_fails(client: AsyncClient):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Completed House", "nickname": "Alice"},
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
        json={"title": "Wash Oven", "effort_weight": 4},
    )

    assign_res = await client.get(
        "/api/v1/chores/assignments?week_start_date=2026-08-23",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assignment_id = assign_res.json()[0]["id"]

    # Complete the assignment
    await client.post(
        f"/api/v1/chores/assignments/{assignment_id}/complete",
        headers={"Authorization": f"Bearer {alice_token}"},
    )

    # Bob attempts to claim completed chore
    claim_res = await client.post(
        f"/api/v1/chores/assignments/{assignment_id}/claim",
        headers={"Authorization": f"Bearer {bob_token}"},
    )
    assert claim_res.status_code == 400


@pytest.mark.asyncio
async def test_up_for_grabs_cross_household_returns_404(client: AsyncClient):
    # Household 1
    h1 = await client.post("/api/v1/households", json={"name": "H1", "nickname": "User1"})
    token1 = h1.json()["access_token"]
    await client.post("/api/v1/chores", headers={"Authorization": f"Bearer {token1}"}, json={"title": "H1 Chore"})
    a1_res = await client.get("/api/v1/chores/assignments?week_start_date=2026-08-23", headers={"Authorization": f"Bearer {token1}"})
    a1_id = a1_res.json()[0]["id"]

    # Household 2
    h2 = await client.post("/api/v1/households", json={"name": "H2", "nickname": "User2"})
    token2 = h2.json()["access_token"]

    claim_res = await client.post(
        f"/api/v1/chores/assignments/{a1_id}/claim",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert claim_res.status_code == 404
