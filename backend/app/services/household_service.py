import uuid
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Household, Member
from app.schemas import (
    AuthResponse, HouseholdCreate, HouseholdJoin, InviteCodeResponse,
    MemberMeOut, MemberOut, MemberStatusUpdate, LoginRequest,
)
from app.security import create_access_token, generate_invite_code, get_pin_hash, verify_pin
from app.services import appliance_service
from app.websocket import ws_manager


class HouseholdNotFoundError(Exception):
    pass


class MemberNotFoundError(Exception):
    pass


class NicknameConflictError(Exception):
    pass


class InvalidCredentialsError(Exception):
    pass


class InviteCodeGenerationError(Exception):
    pass


async def create_household(
    db: AsyncSession,
    data: HouseholdCreate,
) -> AuthResponse:
    invite_code = None
    for _ in range(10):
        code = generate_invite_code()
        existing = await db.execute(select(Household).where(Household.invite_code == code))
        if not existing.scalar_one_or_none():
            invite_code = code
            break

    if not invite_code:
        raise InviteCodeGenerationError("Failed to generate unique invite code")

    household = Household(
        name=data.name,
        timezone=data.timezone,
        invite_code=invite_code,
    )
    db.add(household)
    await db.flush()

    pin_hash = None
    if data.pin:
        pin_hash = get_pin_hash(data.pin)

    member = Member(
        household_id=household.id,
        nickname=data.nickname,
        pin_hash=pin_hash,
        role="admin",
        status="active",
    )
    db.add(member)
    await db.flush()

    await appliance_service.seed_default_appliances(db, household.id)
    await db.commit()
    await db.refresh(household)
    await db.refresh(member)

    access_token = create_access_token(
        data={
            "sub": str(member.id),
            "household_id": str(household.id),
            "role": member.role,
        }
    )

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        member=member,
        household=household,
    )


async def join_household(
    db: AsyncSession,
    data: HouseholdJoin,
) -> AuthResponse:
    code = data.invite_code.strip().upper()
    hh_stmt = select(Household).where(Household.invite_code == code)
    res = await db.execute(hh_stmt)
    household = res.scalar_one_or_none()

    if not household:
        raise HouseholdNotFoundError("Household not found with provided invite code")

    nickname = data.nickname.strip()
    dup_stmt = select(Member).where(
        Member.household_id == household.id,
        Member.nickname == nickname,
    )
    dup_res = await db.execute(dup_stmt)
    if dup_res.scalar_one_or_none():
        raise NicknameConflictError("Nickname is already in use in this household")

    pin_hash = None
    if data.pin:
        pin_hash = get_pin_hash(data.pin)

    member = Member(
        household_id=household.id,
        nickname=nickname,
        pin_hash=pin_hash,
        role="member",
        status="active",
    )
    db.add(member)
    await db.commit()
    await db.refresh(member)

    access_token = create_access_token(
        data={
            "sub": str(member.id),
            "household_id": str(household.id),
            "role": member.role,
        }
    )

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        member=member,
        household=household,
    )


async def regenerate_invite_code(
    db: AsyncSession,
    household_id: uuid.UUID,
) -> InviteCodeResponse:
    hh_stmt = select(Household).where(Household.id == household_id)
    res = await db.execute(hh_stmt)
    household = res.scalar_one_or_none()
    if not household:
        raise HouseholdNotFoundError("Household not found")

    new_invite_code = None
    for _ in range(10):
        code = generate_invite_code()
        if code != household.invite_code:
            existing = await db.execute(select(Household).where(Household.invite_code == code))
            if not existing.scalar_one_or_none():
                new_invite_code = code
                break

    if not new_invite_code:
        raise InviteCodeGenerationError("Failed to generate new invite code")

    household.invite_code = new_invite_code
    await db.commit()
    return InviteCodeResponse(invite_code=new_invite_code)


async def login_member(
    db: AsyncSession,
    data: LoginRequest,
) -> AuthResponse:
    if not data.household_id and not data.invite_code:
        raise ValueError("Either household_id or invite_code must be provided")

    if data.household_id:
        hh_stmt = select(Household).where(Household.id == data.household_id)
    else:
        code = data.invite_code.strip().upper()
        hh_stmt = select(Household).where(Household.invite_code == code)

    res = await db.execute(hh_stmt)
    household = res.scalar_one_or_none()
    if not household:
        raise HouseholdNotFoundError("Household not found")

    member_stmt = select(Member).where(
        Member.household_id == household.id,
        Member.nickname == data.nickname.strip(),
    )
    m_res = await db.execute(member_stmt)
    member = m_res.scalar_one_or_none()
    if not member:
        raise MemberNotFoundError("Member not found in this household")

    if member.pin_hash:
        if not data.pin or not verify_pin(data.pin, member.pin_hash):
            raise InvalidCredentialsError("Invalid PIN")

    access_token = create_access_token(
        data={
            "sub": str(member.id),
            "household_id": str(household.id),
            "role": member.role,
        }
    )

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        member=member,
        household=household,
    )


async def get_me(
    db: AsyncSession,
    current_member: Member,
) -> MemberMeOut:
    hh_stmt = select(Household).where(Household.id == current_member.household_id)
    res = await db.execute(hh_stmt)
    household = res.scalar_one_or_none()
    if not household:
        raise HouseholdNotFoundError("Household not found")

    return MemberMeOut(
        id=current_member.id,
        household_id=current_member.household_id,
        nickname=current_member.nickname,
        role=current_member.role,
        status=current_member.status,
        away_until=current_member.away_until,
        created_at=current_member.created_at,
        household=household,
    )


async def update_member_status(
    db: AsyncSession,
    current_member: Member,
    data: MemberStatusUpdate,
) -> Member:
    current_member.status = data.status
    if data.status == "away":
        current_member.away_until = data.away_until
    else:
        current_member.away_until = None

    await db.commit()
    await db.refresh(current_member)
    await ws_manager.broadcast(
        household_id=current_member.household_id,
        event="MEMBER_STATUS_CHANGED",
        data=MemberOut.model_validate(current_member).model_dump(mode="json"),
    )
    return current_member


async def delete_member(
    db: AsyncSession,
    household_id: uuid.UUID,
    member_id: uuid.UUID,
) -> None:
    stmt = select(Member).where(
        Member.id == member_id,
        Member.household_id == household_id,
    )
    res = await db.execute(stmt)
    member_to_delete = res.scalar_one_or_none()
    if not member_to_delete:
        raise MemberNotFoundError("Member not found in this household")

    await db.delete(member_to_delete)
    await db.commit()
    await ws_manager.broadcast(
        household_id=household_id,
        event="MEMBER_STATUS_CHANGED",
        data={"action": "deleted", "member_id": str(member_id)},
    )
