import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Appliance, Household, Member


@pytest.mark.asyncio
async def test_create_household_success(client: AsyncClient, db_session: AsyncSession):
    payload = {
        "name": "Baker Street Flat",
        "timezone": "Europe/London",
        "nickname": "Sherlock",
        "pin": "1234",
    }
    response = await client.post("/api/v1/households", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "household" in data
    assert "member" in data

    household_data = data["household"]
    assert household_data["name"] == "Baker Street Flat"
    assert household_data["timezone"] == "Europe/London"
    assert len(household_data["invite_code"]) == 6
    assert household_data["invite_code"].isalnum()
    assert household_data["invite_code"].isupper()

    member_data = data["member"]
    assert member_data["nickname"] == "Sherlock"
    assert member_data["role"] == "admin"
    assert member_data["status"] == "active"
    assert member_data["household_id"] == household_data["id"]

    # Verify database state & appliance seeding
    hh_id = uuid.UUID(household_data["id"])
    household_stmt = select(Household).where(Household.id == hh_id)
    res = await db_session.execute(household_stmt)
    hh = res.scalar_one_or_none()
    assert hh is not None

    appliances_stmt = select(Appliance).where(Appliance.household_id == hh_id)
    res = await db_session.execute(appliances_stmt)
    appliances = res.scalars().all()
    appliance_names = {app.name for app in appliances}
    assert appliance_names == {"Dishwasher", "Washer", "Dryer"}
    for app in appliances:
        if app.name == "Dishwasher":
            assert app.current_state == "dirty"
        else:
            assert app.current_state == "empty"


@pytest.mark.asyncio
async def test_create_household_without_pin(client: AsyncClient, db_session: AsyncSession):
    payload = {
        "name": "No Pin Flat",
        "nickname": "John",
    }
    response = await client.post("/api/v1/households", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert data["household"]["name"] == "No Pin Flat"
    assert data["household"]["timezone"] == "UTC"
    assert data["member"]["nickname"] == "John"
    assert data["member"]["role"] == "admin"

    # Member in DB has no pin_hash
    mem_id = uuid.UUID(data["member"]["id"])
    member_stmt = select(Member).where(Member.id == mem_id)
    res = await db_session.execute(member_stmt)
    member = res.scalar_one_or_none()
    assert member is not None
    assert member.pin_hash is None


@pytest.mark.asyncio
async def test_create_household_invalid_pin(client: AsyncClient):
    payload = {
        "name": "Bad Pin House",
        "nickname": "Admin",
        "pin": "123",  # PIN must be 4 digits
    }
    response = await client.post("/api/v1/households", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_join_household_success(client: AsyncClient, db_session: AsyncSession):
    # First create a household
    create_res = await client.post(
        "/api/v1/households",
        json={"name": "221B Baker St", "nickname": "Sherlock"},
    )
    assert create_res.status_code == 201
    hh = create_res.json()["household"]
    invite_code = hh["invite_code"]

    # Join as Watson
    join_payload = {
        "invite_code": invite_code,
        "nickname": "Watson",
        "pin": "4321",
    }
    response = await client.post("/api/v1/households/join", json=join_payload)
    assert response.status_code in (200, 201)
    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["member"]["nickname"] == "Watson"
    assert data["member"]["role"] == "member"
    assert data["member"]["status"] == "active"
    assert data["member"]["household_id"] == hh["id"]
    assert data["household"]["id"] == hh["id"]

    # Verify Watson is in DB
    watson_id = uuid.UUID(data["member"]["id"])
    member_stmt = select(Member).where(Member.id == watson_id)
    res = await db_session.execute(member_stmt)
    watson = res.scalar_one_or_none()
    assert watson is not None
    assert watson.pin_hash is not None


@pytest.mark.asyncio
async def test_join_household_invalid_invite_code(client: AsyncClient):
    join_payload = {
        "invite_code": "XXXXXX",
        "nickname": "Intruder",
    }
    response = await client.post("/api/v1/households/join", json=join_payload)
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_join_household_duplicate_nickname(client: AsyncClient):
    create_res = await client.post(
        "/api/v1/households",
        json={"name": "Duplicate Test House", "nickname": "Sherlock"},
    )
    assert create_res.status_code == 201
    invite_code = create_res.json()["household"]["invite_code"]

    join_payload = {
        "invite_code": invite_code,
        "nickname": "Sherlock",
    }
    response = await client.post("/api/v1/households/join", json=join_payload)
    assert response.status_code == 400
    assert "already" in response.json()["detail"].lower()

