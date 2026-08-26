import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import ChoreAssignment


@pytest.mark.asyncio
async def test_swap_chore_assignments_success(client: AsyncClient, db_session: AsyncSession):
    # Setup household with Alice and Bob
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Swap House", "nickname": "Alice"},
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

    # Alice creates 2 chores: "Dishes" and "Mop"
    c1_res = await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={"title": "Dishes", "effort_weight": 2},
    )
    c2_res = await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={"title": "Mop", "effort_weight": 3},
    )
    c1_id = c1_res.json()["id"]
    c2_id = c2_res.json()["id"]

    week_str = "2026-08-23"
    assign_res = await client.get(
        f"/api/v1/chores/assignments?week_start_date={week_str}",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    assignments = {a["chore_id"]: a for a in assign_res.json()}
    dishes_assign = assignments[c1_id]
    mop_assign = assignments[c2_id]

    assert dishes_assign["member_id"] == alice_id
    assert mop_assign["member_id"] == bob_id

    # Alice initiates swap: swap her Dishes assignment with Bob's Mop assignment
    swap_res = await client.post(
        f"/api/v1/chores/assignments/{dishes_assign['id']}/swap",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={"target_assignment_id": mop_assign["id"]},
    )
    assert swap_res.status_code == 200
    updated_dishes = swap_res.json()
    assert updated_dishes["member_id"] == bob_id

    # Verify Bob now has Dishes and Alice has Mop
    db_dishes = await db_session.get(ChoreAssignment, uuid.UUID(dishes_assign["id"]))
    db_mop = await db_session.get(ChoreAssignment, uuid.UUID(mop_assign["id"]))
    assert str(db_dishes.member_id) == bob_id
    assert str(db_mop.member_id) == alice_id


@pytest.mark.asyncio
async def test_swap_chore_same_assignment_fails(client: AsyncClient):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Same Swap House", "nickname": "Alice"},
    )
    alice_token = hh_res.json()["access_token"]

    await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={"title": "Dishes", "effort_weight": 2},
    )

    assign_res = await client.get(
        "/api/v1/chores/assignments?week_start_date=2026-08-23",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    a_id = assign_res.json()[0]["id"]

    swap_res = await client.post(
        f"/api/v1/chores/assignments/{a_id}/swap",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={"target_assignment_id": a_id},
    )
    assert swap_res.status_code == 400


@pytest.mark.asyncio
async def test_swap_chore_different_weeks_fails(client: AsyncClient):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Diff Weeks House", "nickname": "Alice"},
    )
    alice_token = hh_res.json()["access_token"]
    invite_code = hh_res.json()["household"]["invite_code"]

    await client.post(
        "/api/v1/households/join",
        json={"invite_code": invite_code, "nickname": "Bob"},
    )

    await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={"title": "Dishes", "effort_weight": 2},
    )

    # Week 1 assignment
    w1_res = await client.get(
        "/api/v1/chores/assignments?week_start_date=2026-08-23",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    w1_id = w1_res.json()[0]["id"]

    # Week 2 assignment
    w2_res = await client.get(
        "/api/v1/chores/assignments?week_start_date=2026-08-30",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    w2_id = w2_res.json()[0]["id"]

    # Attempt to swap week 1 with week 2
    swap_res = await client.post(
        f"/api/v1/chores/assignments/{w1_id}/swap",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={"target_assignment_id": w2_id},
    )
    assert swap_res.status_code == 400


@pytest.mark.asyncio
async def test_swap_completed_chore_fails(client: AsyncClient):
    hh_res = await client.post(
        "/api/v1/households",
        json={"name": "Comp Swap House", "nickname": "Alice"},
    )
    alice_token = hh_res.json()["access_token"]
    invite_code = hh_res.json()["household"]["invite_code"]

    await client.post(
        "/api/v1/households/join",
        json={"invite_code": invite_code, "nickname": "Bob"},
    )

    await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={"title": "Dishes", "effort_weight": 2},
    )
    await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={"title": "Mop", "effort_weight": 3},
    )

    assign_res = await client.get(
        "/api/v1/chores/assignments?week_start_date=2026-08-23",
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    a1_id = assign_res.json()[0]["id"]
    a2_id = assign_res.json()[1]["id"]

    # Complete a1
    await client.post(
        f"/api/v1/chores/assignments/{a1_id}/complete",
        headers={"Authorization": f"Bearer {alice_token}"},
    )

    # Attempt swap
    swap_res = await client.post(
        f"/api/v1/chores/assignments/{a1_id}/swap",
        headers={"Authorization": f"Bearer {alice_token}"},
        json={"target_assignment_id": a2_id},
    )
    assert swap_res.status_code == 400


@pytest.mark.asyncio
async def test_swap_cross_household_returns_404(client: AsyncClient):
    # Household 1
    h1 = await client.post("/api/v1/households", json={"name": "H1", "nickname": "User1"})
    token1 = h1.json()["access_token"]
    await client.post("/api/v1/chores", headers={"Authorization": f"Bearer {token1}"}, json={"title": "H1 Chore"})
    a1_res = await client.get("/api/v1/chores/assignments?week_start_date=2026-08-23", headers={"Authorization": f"Bearer {token1}"})
    a1_id = a1_res.json()[0]["id"]

    # Household 2
    h2 = await client.post("/api/v1/households", json={"name": "H2", "nickname": "User2"})
    token2 = h2.json()["access_token"]
    await client.post("/api/v1/chores", headers={"Authorization": f"Bearer {token2}"}, json={"title": "H2 Chore"})
    a2_res = await client.get("/api/v1/chores/assignments?week_start_date=2026-08-23", headers={"Authorization": f"Bearer {token2}"})
    a2_id = a2_res.json()[0]["id"]

    swap_res = await client.post(
        f"/api/v1/chores/assignments/{a1_id}/swap",
        headers={"Authorization": f"Bearer {token1}"},
        json={"target_assignment_id": a2_id},
    )
    assert swap_res.status_code == 404
