import uuid
from datetime import date, datetime, timezone
from typing import Optional



from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import UUID

from app.database import Base


class Household(Base):
    __tablename__ = "households"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    invite_code: Mapped[str] = mapped_column(
        String(6), unique=True, nullable=False, index=True
    )
    timezone: Mapped[str] = mapped_column(
        String(50), nullable=False, default="UTC", server_default="UTC"
    )
    chore_rotation_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
    )


    # Relationships
    members: Mapped[list["Member"]] = relationship(
        "Member",
        back_populates="household",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    chores: Mapped[list["Chore"]] = relationship(
        "Chore",
        back_populates="household",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    appliances: Mapped[list["Appliance"]] = relationship(
        "Appliance",
        back_populates="household",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    push_subscriptions: Mapped[list["PushSubscription"]] = relationship(
        "PushSubscription",
        back_populates="household",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class Member(Base):
    __tablename__ = "members"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    household_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("households.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    nickname: Mapped[str] = mapped_column(String(50), nullable=False)
    pin_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(
        String(20), nullable=False, default="member", server_default="member"
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="active", server_default="active"
    )
    away_until: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
    )


    __table_args__ = (
        UniqueConstraint("household_id", "nickname", name="uq_household_member_nickname"),
        CheckConstraint("role IN ('admin', 'member')", name="ck_member_role"),
        CheckConstraint("status IN ('active', 'away')", name="ck_member_status"),
    )

    # Relationships
    household: Mapped["Household"] = relationship(
        "Household", back_populates="members", lazy="selectin"
    )
    chore_assignments: Mapped[list["ChoreAssignment"]] = relationship(
        "ChoreAssignment",
        foreign_keys="ChoreAssignment.member_id",
        back_populates="member",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    completed_assignments: Mapped[list["ChoreAssignment"]] = relationship(
        "ChoreAssignment",
        foreign_keys="ChoreAssignment.completed_by_member_id",
        back_populates="completed_by_member",
        lazy="selectin",
    )
    chore_logs: Mapped[list["ChoreLog"]] = relationship(
        "ChoreLog",
        back_populates="actor_member",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    appliance_state_logs: Mapped[list["ApplianceStateLog"]] = relationship(
        "ApplianceStateLog",
        back_populates="actor_member",
        lazy="selectin",
    )
    push_subscriptions: Mapped[list["PushSubscription"]] = relationship(
        "PushSubscription",
        back_populates="member",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class Chore(Base):
    __tablename__ = "chores"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    household_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("households.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    effort_weight: Mapped[int] = mapped_column(
        Integer, nullable=False, default=1, server_default="1"
    )
    completion_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="single_weekly",
        server_default="single_weekly",
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default="true"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
    )

    __table_args__ = (
        CheckConstraint(
            "effort_weight >= 1 AND effort_weight <= 5",
            name="ck_chore_effort_weight",
        ),
        CheckConstraint(
            "completion_type IN ('single_weekly', 'continuous_duty')",
            name="ck_chore_completion_type",
        ),
    )

    # Relationships
    household: Mapped["Household"] = relationship(
        "Household", back_populates="chores", lazy="selectin"
    )
    assignments: Mapped[list["ChoreAssignment"]] = relationship(
        "ChoreAssignment",
        back_populates="chore",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class ChoreAssignment(Base):
    __tablename__ = "chore_assignments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    chore_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("chores.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    member_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("members.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    week_start_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="pending", server_default="pending"
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    completed_by_member_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("members.id", ondelete="SET NULL"),
        nullable=True,
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'completed', 'skipped', 'swapped')",
            name="ck_assignment_status",
        ),
    )

    # Relationships
    chore: Mapped["Chore"] = relationship(
        "Chore", back_populates="assignments", lazy="selectin"
    )
    member: Mapped[Optional["Member"]] = relationship(
        "Member",
        foreign_keys=[member_id],
        back_populates="chore_assignments",
        lazy="selectin",
    )
    completed_by_member: Mapped[Optional["Member"]] = relationship(
        "Member",
        foreign_keys=[completed_by_member_id],
        back_populates="completed_assignments",
        lazy="selectin",
    )
    logs: Mapped[list["ChoreLog"]] = relationship(
        "ChoreLog",
        back_populates="assignment",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class ChoreLog(Base):
    __tablename__ = "chore_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    assignment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("chore_assignments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    actor_member_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("members.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    logged_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relationships
    assignment: Mapped["ChoreAssignment"] = relationship(
        "ChoreAssignment", back_populates="logs", lazy="selectin"
    )
    actor_member: Mapped["Member"] = relationship(
        "Member", back_populates="chore_logs", lazy="selectin"
    )


class Appliance(Base):
    __tablename__ = "appliances"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    household_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("households.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(
        String(30), nullable=False, default="custom", server_default="custom"
    )
    current_state: Mapped[str] = mapped_column(
        String(30), nullable=False, default="empty", server_default="empty"
    )
    state_updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_by_member_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("members.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Step slots (2 to 5 steps)
    state_step_1: Mapped[str] = mapped_column(
        String(30), nullable=False, default="empty", server_default="empty"
    )
    state_step_2: Mapped[str] = mapped_column(
        String(30), nullable=False, default="running", server_default="running"
    )
    state_step_3: Mapped[Optional[str]] = mapped_column(
        String(30), nullable=True
    )
    state_step_4: Mapped[Optional[str]] = mapped_column(
        String(30), nullable=True
    )
    state_step_5: Mapped[Optional[str]] = mapped_column(
        String(30), nullable=True
    )

    # Timer columns
    timer_enabled: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )
    default_timer_minutes: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True
    )
    timer_duration_minutes: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True
    )
    timer_started_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    timer_ends_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    __table_args__ = (
        CheckConstraint(
            "current_state IN (state_step_1, state_step_2, COALESCE(state_step_3, state_step_1), COALESCE(state_step_4, state_step_1), COALESCE(state_step_5, state_step_1))",
            name="ck_appliance_current_state_in_steps",
        ),
        CheckConstraint(
            "state_step_1 IN ('empty', 'dirty', 'running', 'needs_attention', 'clean') AND "
            "state_step_2 IN ('empty', 'dirty', 'running', 'needs_attention', 'clean') AND "
            "(state_step_3 IS NULL OR state_step_3 IN ('empty', 'dirty', 'running', 'needs_attention', 'clean')) AND "
            "(state_step_4 IS NULL OR state_step_4 IN ('empty', 'dirty', 'running', 'needs_attention', 'clean')) AND "
            "(state_step_5 IS NULL OR state_step_5 IN ('empty', 'dirty', 'running', 'needs_attention', 'clean'))",
            name="ck_appliance_canonical_states",
        ),
    )

    def get_ordered_steps(self) -> list[str]:
        steps = [
            self.state_step_1,
            self.state_step_2,
            self.state_step_3,
            self.state_step_4,
            self.state_step_5,
        ]
        return [s for s in steps if s]

    def get_next_state(self, current: Optional[str] = None) -> str:
        steps = self.get_ordered_steps()
        if not steps:
            return "empty"
        target = current if current is not None else self.current_state
        if target == "clean_needs_emptying" and "needs_attention" in steps:
            target = "needs_attention"
        if target not in steps:
            return steps[0]
        idx = steps.index(target)
        return steps[(idx + 1) % len(steps)]

    # Relationships
    household: Mapped["Household"] = relationship(
        "Household", back_populates="appliances", lazy="selectin"
    )
    updated_by_member: Mapped[Optional["Member"]] = relationship(
        "Member", foreign_keys=[updated_by_member_id], lazy="selectin"
    )
    state_logs: Mapped[list["ApplianceStateLog"]] = relationship(
        "ApplianceStateLog",
        back_populates="appliance",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class ApplianceStateLog(Base):
    __tablename__ = "appliance_state_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    appliance_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("appliances.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    from_state: Mapped[str] = mapped_column(String(30), nullable=False)
    to_state: Mapped[str] = mapped_column(String(30), nullable=False)
    trigger_source: Mapped[str] = mapped_column(
        String(30), nullable=False, default="manual", server_default="manual"
    )
    actor_member_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("members.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
    )

    # Relationships
    appliance: Mapped["Appliance"] = relationship(
        "Appliance", back_populates="state_logs", lazy="selectin"
    )
    actor_member: Mapped[Optional["Member"]] = relationship(
        "Member", back_populates="appliance_state_logs", lazy="selectin"
    )


class PushSubscription(Base):
    __tablename__ = "push_subscriptions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    member_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("members.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    household_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("households.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    endpoint: Mapped[str] = mapped_column(Text, nullable=False)
    p256dh_key: Mapped[str] = mapped_column(Text, nullable=False)
    auth_key: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relationships
    member: Mapped["Member"] = relationship(
        "Member", back_populates="push_subscriptions", lazy="selectin"
    )
    household: Mapped["Household"] = relationship(
        "Household", back_populates="push_subscriptions", lazy="selectin"
    )
