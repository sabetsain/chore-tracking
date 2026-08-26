import uuid
from datetime import date, datetime, timezone
import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy import event
from sqlalchemy.engine import Engine

from app.database import Base
from app.models import (
    Household,
    Member,
    Chore,
    ChoreAssignment,
    ChoreLog,
    Appliance,
    ApplianceStateLog,
    PushSubscription,
)


@pytest.mark.asyncio
async def test_create_household_and_defaults(db_session: AsyncSession):
    household = Household(
        name="Baker Street Flat",
        invite_code="BAKER1",
    )
    db_session.add(household)
    await db_session.commit()
    await db_session.refresh(household)

    assert isinstance(household.id, uuid.UUID)
    assert household.name == "Baker Street Flat"
    assert household.invite_code == "BAKER1"
    assert household.timezone == "UTC"
    assert household.created_at is not None


@pytest.mark.asyncio
async def test_household_invite_code_unique(db_session: AsyncSession):
    h1 = Household(name="House 1", invite_code="DUPL01")
    h2 = Household(name="House 2", invite_code="DUPL01")
    db_session.add(h1)
    await db_session.commit()

    db_session.add(h2)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()


@pytest.mark.asyncio
async def test_create_member_and_constraints(db_session: AsyncSession):
    household = Household(name="Apartment 4B", invite_code="APT4B1")
    db_session.add(household)
    await db_session.commit()

    member = Member(
        household_id=household.id,
        nickname="Alice",
        pin_hash="$2b$12$dummyhashforalicepin123456",
        role="admin",
        status="active",
    )
    db_session.add(member)
    await db_session.commit()
    await db_session.refresh(member)

    assert isinstance(member.id, uuid.UUID)
    assert member.household_id == household.id
    assert member.nickname == "Alice"
    assert member.role == "admin"
    assert member.status == "active"
    assert member.away_until is None
    assert member.created_at is not None

    # Test unique nickname per household
    duplicate_member = Member(
        household_id=household.id,
        nickname="Alice",
        role="member",
    )
    db_session.add(duplicate_member)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()


@pytest.mark.asyncio
async def test_member_role_and_status_check_constraints(db_session: AsyncSession):
    household = Household(name="Test House", invite_code="TEST01")
    db_session.add(household)
    await db_session.commit()
    household_id = household.id

    # Invalid role
    invalid_role_member = Member(
        household_id=household_id,
        nickname="Bob",
        role="superadmin",
    )
    db_session.add(invalid_role_member)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()

    # Invalid status
    invalid_status_member = Member(
        household_id=household_id,
        nickname="Charlie",
        role="member",
        status="vacation",
    )
    db_session.add(invalid_status_member)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()


@pytest.mark.asyncio
async def test_create_chore_and_constraints(db_session: AsyncSession):
    household = Household(name="Chore House", invite_code="CHOR01")
    db_session.add(household)
    await db_session.commit()
    household_id = household.id

    chore = Chore(
        household_id=household_id,
        title="Take Out Trash",
        description="Empty kitchen & recycling bins",
        effort_weight=2,
        completion_type="continuous_duty",
        is_active=True,
    )
    db_session.add(chore)
    await db_session.commit()
    await db_session.refresh(chore)

    assert isinstance(chore.id, uuid.UUID)
    assert chore.effort_weight == 2
    assert chore.completion_type == "continuous_duty"
    assert chore.is_active is True

    # Invalid effort weight (< 1 or > 5)
    invalid_chore = Chore(
        household_id=household_id,
        title="Invalid Weight",
        effort_weight=6,
        completion_type="single_weekly",
    )
    db_session.add(invalid_chore)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()

    # Invalid completion type
    invalid_type_chore = Chore(
        household_id=household_id,
        title="Invalid Type",
        effort_weight=3,
        completion_type="biweekly",
    )
    db_session.add(invalid_type_chore)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()


@pytest.mark.asyncio
async def test_chore_assignment_and_logs(db_session: AsyncSession):
    household = Household(name="Duty House", invite_code="DUTY01")
    db_session.add(household)
    await db_session.commit()

    member = Member(household_id=household.id, nickname="David", role="member")
    chore = Chore(
        household_id=household.id,
        title="Deep Clean Bathroom",
        effort_weight=4,
        completion_type="single_weekly",
    )
    db_session.add_all([member, chore])
    await db_session.commit()

    assignment = ChoreAssignment(
        chore_id=chore.id,
        member_id=member.id,
        week_start_date=date(2026, 8, 24),
        status="pending",
    )
    db_session.add(assignment)
    await db_session.commit()
    await db_session.refresh(assignment)

    assert assignment.status == "pending"
    assert assignment.completed_at is None
    assert assignment.completed_by_member_id is None

    # Complete assignment
    assignment.status = "completed"
    assignment.completed_at = datetime.now(timezone.utc)
    assignment.completed_by_member_id = member.id
    await db_session.commit()

    # Add chore log
    chore_log = ChoreLog(
        assignment_id=assignment.id,
        actor_member_id=member.id,
        note="Cleaned shower, toilet and mopped floor",
    )
    db_session.add(chore_log)
    await db_session.commit()
    await db_session.refresh(chore_log)

    assert isinstance(chore_log.id, uuid.UUID)
    assert chore_log.assignment_id == assignment.id
    assert chore_log.actor_member_id == member.id
    assert chore_log.logged_at is not None

    # Test assignment status check constraint
    invalid_assignment = ChoreAssignment(
        chore_id=chore.id,
        member_id=member.id,
        week_start_date=date(2026, 8, 24),
        status="in_progress",
    )
    db_session.add(invalid_assignment)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()


@pytest.mark.asyncio
async def test_appliance_and_state_logs(db_session: AsyncSession):
    household = Household(name="Appliance House", invite_code="APPL01")
    db_session.add(household)
    await db_session.commit()

    member = Member(household_id=household.id, nickname="Emma", role="member")
    db_session.add(member)
    await db_session.commit()

    appliance = Appliance(
        household_id=household.id,
        name="Dishwasher",
        type="dishwasher",
        current_state="empty",
        updated_by_member_id=member.id,
    )
    db_session.add(appliance)
    await db_session.commit()
    await db_session.refresh(appliance)

    assert appliance.current_state == "empty"
    assert appliance.type == "dishwasher"
    assert appliance.updated_by_member_id == member.id

    # Appliance state log
    state_log = ApplianceStateLog(
        appliance_id=appliance.id,
        from_state="empty",
        to_state="dirty",
        trigger_source="manual",
        actor_member_id=member.id,
    )
    db_session.add(state_log)
    await db_session.commit()
    await db_session.refresh(state_log)

    assert state_log.from_state == "empty"
    assert state_log.to_state == "dirty"
    assert state_log.trigger_source == "manual"
    assert state_log.actor_member_id == member.id

    # Test appliance state constraint
    invalid_appliance = Appliance(
        household_id=household.id,
        name="Dryer",
        type="dryer",
        current_state="broken",
    )
    db_session.add(invalid_appliance)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()


@pytest.mark.asyncio
async def test_push_subscription(db_session: AsyncSession):
    household = Household(name="Push House", invite_code="PUSH01")
    db_session.add(household)
    await db_session.commit()

    member = Member(household_id=household.id, nickname="Frank", role="member")
    db_session.add(member)
    await db_session.commit()

    push_sub = PushSubscription(
        household_id=household.id,
        member_id=member.id,
        endpoint="https://fcm.googleapis.com/fcm/send/sample-token-12345",
        p256dh_key="BNcRdreALRF8M+sampleP256Key=",
        auth_key="sampleAuthKey123=",
    )
    db_session.add(push_sub)
    await db_session.commit()
    await db_session.refresh(push_sub)

    assert isinstance(push_sub.id, uuid.UUID)
    assert push_sub.household_id == household.id
    assert push_sub.member_id == member.id
    assert push_sub.endpoint.startswith("https://")
    assert push_sub.created_at is not None


@pytest.mark.asyncio
async def test_cascade_deletes(db_session: AsyncSession):
    household = Household(name="Cascade House", invite_code="CASC01")
    db_session.add(household)
    await db_session.commit()

    member = Member(household_id=household.id, nickname="Grace", role="admin")
    chore = Chore(
        household_id=household.id,
        title="Vacuum Living Room",
        effort_weight=2,
        completion_type="single_weekly",
    )
    appliance = Appliance(
        household_id=household.id,
        name="Washing Machine",
        type="washer",
        current_state="empty",
    )
    db_session.add_all([member, chore, appliance])
    await db_session.commit()

    assignment = ChoreAssignment(
        chore_id=chore.id,
        member_id=member.id,
        week_start_date=date(2026, 8, 24),
        status="pending",
    )
    db_session.add(assignment)
    await db_session.commit()

    chore_log = ChoreLog(
        assignment_id=assignment.id,
        actor_member_id=member.id,
        note="Completed early",
    )
    state_log = ApplianceStateLog(
        appliance_id=appliance.id,
        from_state="empty",
        to_state="running",
        trigger_source="manual",
        actor_member_id=member.id,
    )
    push_sub = PushSubscription(
        household_id=household.id,
        member_id=member.id,
        endpoint="https://push.service.com/sub/123",
        p256dh_key="key",
        auth_key="auth",
    )
    db_session.add_all([chore_log, state_log, push_sub])
    await db_session.commit()

    # Deleting household should cascade delete members, chores, assignments, chore_logs, appliances, state_logs, push_subs
    await db_session.delete(household)
    await db_session.commit()

    members = (await db_session.execute(select(Member))).scalars().all()
    chores = (await db_session.execute(select(Chore))).scalars().all()
    assignments = (await db_session.execute(select(ChoreAssignment))).scalars().all()
    chore_logs = (await db_session.execute(select(ChoreLog))).scalars().all()
    appliances = (await db_session.execute(select(Appliance))).scalars().all()
    state_logs = (await db_session.execute(select(ApplianceStateLog))).scalars().all()
    push_subs = (await db_session.execute(select(PushSubscription))).scalars().all()

    assert len(members) == 0
    assert len(chores) == 0
    assert len(assignments) == 0
    assert len(chore_logs) == 0
    assert len(appliances) == 0
    assert len(state_logs) == 0
    assert len(push_subs) == 0


@pytest.mark.asyncio
async def test_relationships_navigation(db_session: AsyncSession):
    household = Household(name="Rel House", invite_code="RELS01")
    db_session.add(household)
    await db_session.commit()

    member = Member(household_id=household.id, nickname="Hank", role="admin")
    chore = Chore(household_id=household.id, title="Dishes", effort_weight=1)
    appliance = Appliance(household_id=household.id, name="Dryer", type="dryer")
    db_session.add_all([member, chore, appliance])
    await db_session.commit()

    assignment = ChoreAssignment(
        chore_id=chore.id,
        member_id=member.id,
        week_start_date=date(2026, 8, 24),
    )
    db_session.add(assignment)
    await db_session.commit()

    log = ChoreLog(assignment_id=assignment.id, actor_member_id=member.id, note="Done")
    app_log = ApplianceStateLog(
        appliance_id=appliance.id,
        from_state="empty",
        to_state="dirty",
        trigger_source="manual",
        actor_member_id=member.id,
    )
    sub = PushSubscription(
        household_id=household.id,
        member_id=member.id,
        endpoint="https://example.com/sub",
        p256dh_key="k",
        auth_key="a",
    )
    db_session.add_all([log, app_log, sub])
    await db_session.commit()

    # Re-fetch household with eager/joined relations or test relationship backrefs
    result = (
        await db_session.execute(
            select(Household).where(Household.id == household.id)
        )
    ).scalar_one()

    # In async SQLAlchemy, eager loading or lazy='selectin' on relationships allows direct attribute access
    assert len(result.members) == 1
    assert result.members[0].nickname == "Hank"
    assert len(result.chores) == 1
    assert result.chores[0].title == "Dishes"
    assert len(result.appliances) == 1
    assert result.appliances[0].name == "Dryer"
    assert len(result.push_subscriptions) == 1

    # Assignment relations
    assignment_res = (
        await db_session.execute(
            select(ChoreAssignment).where(ChoreAssignment.id == assignment.id)
        )
    ).scalar_one()
    assert assignment_res.chore.title == "Dishes"
    assert assignment_res.member.nickname == "Hank"
    assert len(assignment_res.logs) == 1
    assert assignment_res.logs[0].note == "Done"
