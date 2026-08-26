from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Appliance, Household, Member
from app.schemas import AuthResponse, HouseholdCreate, HouseholdJoin, InviteCodeResponse
from app.security import create_access_token, generate_invite_code, require_admin

router = APIRouter(prefix="/api/v1/households", tags=["households"])


@router.post("", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def create_household(
    data: HouseholdCreate,
    db: AsyncSession = Depends(get_db),
):
    # Generate unique 6-character invite code
    invite_code = None
    for _ in range(10):
        code = generate_invite_code()
        existing = await db.execute(select(Household).where(Household.invite_code == code))
        if not existing.scalar_one_or_none():
            invite_code = code
            break

    if not invite_code:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate unique invite code",
        )

    household = Household(
        name=data.name,
        timezone=data.timezone,
        invite_code=invite_code,
    )
    db.add(household)
    await db.flush()

    pin_hash = None
    if data.pin:
        from app.security import get_pin_hash
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

    # Auto-seed default appliances
    default_appliances = [
        Appliance(
            household_id=household.id,
            name="Dishwasher",
            type="dishwasher",
            current_state="empty",
        ),
        Appliance(
            household_id=household.id,
            name="Washer",
            type="washer",
            current_state="empty",
        ),
        Appliance(
            household_id=household.id,
            name="Dryer",
            type="dryer",
            current_state="empty",
        ),
    ]
    db.add_all(default_appliances)
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


@router.post("/join", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def join_household(
    data: HouseholdJoin,
    db: AsyncSession = Depends(get_db),
):
    code = data.invite_code.strip().upper()
    hh_stmt = select(Household).where(Household.invite_code == code)
    res = await db.execute(hh_stmt)
    household = res.scalar_one_or_none()

    if not household:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Household not found with provided invite code",
        )

    # Check for duplicate nickname in the household
    nickname = data.nickname.strip()
    dup_stmt = select(Member).where(
        Member.household_id == household.id,
        Member.nickname == nickname,
    )
    dup_res = await db.execute(dup_stmt)
    if dup_res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nickname is already in use in this household",
        )

    pin_hash = None
    if data.pin:
        from app.security import get_pin_hash
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


@router.patch("/invite-code", response_model=InviteCodeResponse, status_code=status.HTTP_200_OK)
async def regenerate_invite_code(
    current_member: Member = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    hh_stmt = select(Household).where(Household.id == current_member.household_id)
    res = await db.execute(hh_stmt)
    household = res.scalar_one_or_none()
    if not household:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Household not found",
        )

    new_invite_code = None
    for _ in range(10):
        code = generate_invite_code()
        if code != household.invite_code:
            existing = await db.execute(select(Household).where(Household.invite_code == code))
            if not existing.scalar_one_or_none():
                new_invite_code = code
                break

    if not new_invite_code:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate new invite code",
        )

    household.invite_code = new_invite_code
    await db.commit()
    return InviteCodeResponse(invite_code=new_invite_code)

