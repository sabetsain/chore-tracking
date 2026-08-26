import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_login_with_household_id_and_correct_pin(client: AsyncClient):
    create_res = await client.post(
        "/api/v1/households",
        json={"name": "Auth Flat", "nickname": "Alice", "pin": "5678"},
    )
    assert create_res.status_code == 201
    hh_id = create_res.json()["household"]["id"]

    login_res = await client.post(
        "/api/v1/auth/login",
        json={"household_id": hh_id, "nickname": "Alice", "pin": "5678"},
    )
    assert login_res.status_code == 200
    data = login_res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["member"]["nickname"] == "Alice"
    assert data["household"]["id"] == hh_id


@pytest.mark.asyncio
async def test_login_with_invite_code_and_correct_pin(client: AsyncClient):
    create_res = await client.post(
        "/api/v1/households",
        json={"name": "Invite Code Flat", "nickname": "Bob", "pin": "9999"},
    )
    assert create_res.status_code == 201
    invite_code = create_res.json()["household"]["invite_code"]

    login_res = await client.post(
        "/api/v1/auth/login",
        json={"invite_code": invite_code, "nickname": "Bob", "pin": "9999"},
    )
    assert login_res.status_code == 200
    data = login_res.json()
    assert "access_token" in data
    assert data["member"]["nickname"] == "Bob"


@pytest.mark.asyncio
async def test_login_without_pin_for_unprotected_member(client: AsyncClient):
    create_res = await client.post(
        "/api/v1/households",
        json={"name": "No Pin Flat", "nickname": "Charlie"},
    )
    assert create_res.status_code == 201
    hh_id = create_res.json()["household"]["id"]

    login_res = await client.post(
        "/api/v1/auth/login",
        json={"household_id": hh_id, "nickname": "Charlie"},
    )
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()


@pytest.mark.asyncio
async def test_login_with_incorrect_pin(client: AsyncClient):
    create_res = await client.post(
        "/api/v1/households",
        json={"name": "Wrong Pin Flat", "nickname": "Dave", "pin": "1111"},
    )
    assert create_res.status_code == 201
    hh_id = create_res.json()["household"]["id"]

    login_res = await client.post(
        "/api/v1/auth/login",
        json={"household_id": hh_id, "nickname": "Dave", "pin": "2222"},
    )
    assert login_res.status_code == 401
    assert "invalid" in login_res.json()["detail"].lower()


@pytest.mark.asyncio
async def test_login_missing_pin_when_required(client: AsyncClient):
    create_res = await client.post(
        "/api/v1/households",
        json={"name": "Missing Pin Flat", "nickname": "Eve", "pin": "1234"},
    )
    assert create_res.status_code == 201
    hh_id = create_res.json()["household"]["id"]

    login_res = await client.post(
        "/api/v1/auth/login",
        json={"household_id": hh_id, "nickname": "Eve"},
    )
    assert login_res.status_code == 401


@pytest.mark.asyncio
async def test_get_current_member_me_authenticated(client: AsyncClient):
    create_res = await client.post(
        "/api/v1/households",
        json={"name": "Me Test Flat", "nickname": "Frank"},
    )
    assert create_res.status_code == 201
    token = create_res.json()["access_token"]
    hh_id = create_res.json()["household"]["id"]

    me_res = await client.get(
        "/api/v1/members/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["nickname"] == "Frank"
    assert me_data["role"] == "admin"
    assert me_data["status"] == "active"
    assert me_data["household"]["id"] == hh_id
    assert me_data["household"]["name"] == "Me Test Flat"


@pytest.mark.asyncio
async def test_get_current_member_me_unauthenticated(client: AsyncClient):
    response = await client.get("/api/v1/members/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_current_member_me_invalid_token(client: AsyncClient):
    response = await client.get(
        "/api/v1/members/me",
        headers={"Authorization": "Bearer not.a.valid.jwt.token"},
    )
    assert response.status_code == 401
