import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Chore


@pytest.mark.asyncio
async def test_create_chore_success(client: AsyncClient, db_session: AsyncSession):
    # Setup household and member
    create_hh = await client.post(
        "/api/v1/households",
        json={"name": "Chore House", "nickname": "Alice"},
    )
    token = create_hh.json()["access_token"]
    hh_id = uuid.UUID(create_hh.json()["household"]["id"])

    # Create a single_weekly chore
    payload = {
        "title": "Clean Kitchen",
        "description": "Wipe counters and mop floor",
        "effort_weight": 3,
        "completion_type": "single_weekly",
    }
    response = await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {token}"},
        json=payload,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Clean Kitchen"
    assert data["description"] == "Wipe counters and mop floor"
    assert data["effort_weight"] == 3
    assert data["completion_type"] == "single_weekly"
    assert data["is_active"] is True
    assert data["household_id"] == str(hh_id)
    assert "id" in data

    # Verify chore in DB
    chore_id = uuid.UUID(data["id"])
    db_chore = await db_session.get(Chore, chore_id)
    assert db_chore is not None
    assert db_chore.title == "Clean Kitchen"


@pytest.mark.asyncio
async def test_create_chore_continuous_duty(client: AsyncClient):
    create_hh = await client.post(
        "/api/v1/households",
        json={"name": "Chore House 2", "nickname": "Alice"},
    )
    token = create_hh.json()["access_token"]

    payload = {
        "title": "Take Out Trash",
        "effort_weight": 1,
        "completion_type": "continuous_duty",
    }
    response = await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {token}"},
        json=payload,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["completion_type"] == "continuous_duty"
    assert data["effort_weight"] == 1
    assert data["description"] is None


@pytest.mark.asyncio
async def test_create_chore_validation_effort_weight(client: AsyncClient):
    create_hh = await client.post(
        "/api/v1/households",
        json={"name": "Weight Test House", "nickname": "Alice"},
    )
    token = create_hh.json()["access_token"]

    # Effort weight > 5
    res = await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "Heavy Chore", "effort_weight": 6},
    )
    assert res.status_code == 422

    # Effort weight < 1
    res = await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "Zero Chore", "effort_weight": 0},
    )
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_create_chore_validation_invalid_completion_type(client: AsyncClient):
    create_hh = await client.post(
        "/api/v1/households",
        json={"name": "Type Test House", "nickname": "Alice"},
    )
    token = create_hh.json()["access_token"]

    res = await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "Chore", "completion_type": "monthly_duty"},
    )
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_list_chores_scoped_to_household(client: AsyncClient):
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

    # Add chores to House 1
    await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {token1}"},
        json={"title": "H1 Chore A", "effort_weight": 2},
    )
    await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {token1}"},
        json={"title": "H1 Chore B", "effort_weight": 4},
    )

    # Add chore to House 2
    await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {token2}"},
        json={"title": "H2 Chore A", "effort_weight": 1},
    )

    # List chores as User 1
    res1 = await client.get(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {token1}"},
    )
    assert res1.status_code == 200
    chores1 = res1.json()
    assert len(chores1) == 2
    titles1 = {c["title"] for c in chores1}
    assert titles1 == {"H1 Chore A", "H1 Chore B"}

    # List chores as User 2
    res2 = await client.get(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert res2.status_code == 200
    chores2 = res2.json()
    assert len(chores2) == 1
    assert chores2[0]["title"] == "H2 Chore A"


@pytest.mark.asyncio
async def test_patch_chore_success(client: AsyncClient, db_session: AsyncSession):
    hh = await client.post(
        "/api/v1/households",
        json={"name": "Patch House", "nickname": "Alice"},
    )
    token = hh.json()["access_token"]

    create_res = await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "Original Title", "effort_weight": 2},
    )
    chore_id = create_res.json()["id"]

    patch_res = await client.patch(
        f"/api/v1/chores/{chore_id}",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Updated Title",
            "description": "New description",
            "effort_weight": 5,
            "completion_type": "continuous_duty",
            "is_active": False,
        },
    )
    assert patch_res.status_code == 200
    data = patch_res.json()
    assert data["title"] == "Updated Title"
    assert data["description"] == "New description"
    assert data["effort_weight"] == 5
    assert data["completion_type"] == "continuous_duty"
    assert data["is_active"] is False

    # Check DB
    db_chore = await db_session.get(Chore, uuid.UUID(chore_id))
    assert db_chore.title == "Updated Title"
    assert db_chore.is_active is False


@pytest.mark.asyncio
async def test_patch_chore_cross_household_returns_404(client: AsyncClient):
    h1 = await client.post(
        "/api/v1/households",
        json={"name": "Cross House 1", "nickname": "User1"},
    )
    token1 = h1.json()["access_token"]

    h2 = await client.post(
        "/api/v1/households",
        json={"name": "Cross House 2", "nickname": "User2"},
    )
    token2 = h2.json()["access_token"]

    create_res = await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {token1}"},
        json={"title": "H1 Chore", "effort_weight": 2},
    )
    chore_id = create_res.json()["id"]

    # User 2 attempts to patch User 1's chore
    patch_res = await client.patch(
        f"/api/v1/chores/{chore_id}",
        headers={"Authorization": f"Bearer {token2}"},
        json={"title": "Hacked Title"},
    )
    assert patch_res.status_code == 404


@pytest.mark.asyncio
async def test_delete_chore_success(client: AsyncClient, db_session: AsyncSession):
    hh = await client.post(
        "/api/v1/households",
        json={"name": "Delete House", "nickname": "Alice"},
    )
    token = hh.json()["access_token"]

    create_res = await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "To Be Deleted", "effort_weight": 1},
    )
    chore_id = create_res.json()["id"]

    del_res = await client.delete(
        f"/api/v1/chores/{chore_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert del_res.status_code == 204

    # Verify not in DB
    db_chore = await db_session.get(Chore, uuid.UUID(chore_id))
    assert db_chore is None


@pytest.mark.asyncio
async def test_delete_chore_cross_household_returns_404(client: AsyncClient):
    h1 = await client.post(
        "/api/v1/households",
        json={"name": "Del Cross House 1", "nickname": "User1"},
    )
    token1 = h1.json()["access_token"]

    h2 = await client.post(
        "/api/v1/households",
        json={"name": "Del Cross House 2", "nickname": "User2"},
    )
    token2 = h2.json()["access_token"]

    create_res = await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {token1}"},
        json={"title": "H1 Chore", "effort_weight": 2},
    )
    chore_id = create_res.json()["id"]

    # User 2 attempts to delete User 1's chore
    del_res = await client.delete(
        f"/api/v1/chores/{chore_id}",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert del_res.status_code == 404


@pytest.mark.asyncio
async def test_chore_unauthenticated_returns_401(client: AsyncClient):
    res = await client.get("/api/v1/chores")
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_create_chore_auto_generates_weekly_assignment(client: AsyncClient):
    # Setup household with member
    create_hh = await client.post(
        "/api/v1/households",
        json={"name": "Auto Assign House", "nickname": "Alice"},
    )
    token = create_hh.json()["access_token"]
    alice_id = create_hh.json()["member"]["id"]

    # Create a new chore
    res = await client.post(
        "/api/v1/chores",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Clean Refrigerator",
            "description": "Throw out expired food",
            "effort_weight": 2,
            "completion_type": "single_weekly",
        },
    )
    assert res.status_code == 201
    chore_id = res.json()["id"]

    # Verify that assignments for the current week now include this newly created chore
    asg_res = await client.get(
        "/api/v1/chores/assignments",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert asg_res.status_code == 200
    assignments = asg_res.json()
    new_asg = next((a for a in assignments if a["chore_id"] == chore_id), None)
    assert new_asg is not None
    assert new_asg["status"] == "pending"
    assert new_asg["member_id"] == alice_id
    assert new_asg["chore"]["title"] == "Clean Refrigerator"

