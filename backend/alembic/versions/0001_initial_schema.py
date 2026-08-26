"""Initial schema for household coordination app

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-08-25 21:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. households
    op.create_table(
        "households",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("invite_code", sa.String(length=6), nullable=False),
        sa.Column("timezone", sa.String(length=50), server_default="UTC", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("invite_code", name="uq_household_invite_code"),
    )
    op.create_index("ix_households_invite_code", "households", ["invite_code"], unique=True)

    # 2. members
    op.create_table(
        "members",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("household_id", sa.UUID(), nullable=False),
        sa.Column("nickname", sa.String(length=50), nullable=False),
        sa.Column("pin_hash", sa.String(length=255), nullable=True),
        sa.Column("role", sa.String(length=20), server_default="member", nullable=False),
        sa.Column("status", sa.String(length=20), server_default="active", nullable=False),
        sa.Column("away_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("role IN ('admin', 'member')", name="ck_member_role"),
        sa.CheckConstraint("status IN ('active', 'away')", name="ck_member_status"),
        sa.ForeignKeyConstraint(["household_id"], ["households.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("household_id", "nickname", name="uq_household_member_nickname"),
    )
    op.create_index("ix_members_household_id", "members", ["household_id"], unique=False)

    # 3. chores
    op.create_table(
        "chores",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("household_id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("effort_weight", sa.Integer(), server_default="1", nullable=False),
        sa.Column("completion_type", sa.String(length=30), server_default="single_weekly", nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("effort_weight >= 1 AND effort_weight <= 5", name="ck_chore_effort_weight"),
        sa.CheckConstraint("completion_type IN ('single_weekly', 'continuous_duty')", name="ck_chore_completion_type"),
        sa.ForeignKeyConstraint(["household_id"], ["households.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_chores_household_id", "chores", ["household_id"], unique=False)

    # 4. chore_assignments
    op.create_table(
        "chore_assignments",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("chore_id", sa.UUID(), nullable=False),
        sa.Column("member_id", sa.UUID(), nullable=True),
        sa.Column("week_start_date", sa.Date(), nullable=False),
        sa.Column("status", sa.String(length=20), server_default="pending", nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_by_member_id", sa.UUID(), nullable=True),
        sa.CheckConstraint("status IN ('pending', 'completed', 'skipped', 'swapped')", name="ck_assignment_status"),
        sa.ForeignKeyConstraint(["chore_id"], ["chores.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["member_id"], ["members.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["completed_by_member_id"], ["members.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_chore_assignments_chore_id", "chore_assignments", ["chore_id"], unique=False)
    op.create_index("ix_chore_assignments_member_id", "chore_assignments", ["member_id"], unique=False)
    op.create_index("ix_chore_assignments_week_start_date", "chore_assignments", ["week_start_date"], unique=False)

    # 5. chore_logs
    op.create_table(
        "chore_logs",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("assignment_id", sa.UUID(), nullable=False),
        sa.Column("actor_member_id", sa.UUID(), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("logged_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["assignment_id"], ["chore_assignments.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["actor_member_id"], ["members.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_chore_logs_assignment_id", "chore_logs", ["assignment_id"], unique=False)
    op.create_index("ix_chore_logs_actor_member_id", "chore_logs", ["actor_member_id"], unique=False)

    # 6. appliances
    op.create_table(
        "appliances",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("household_id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("type", sa.String(length=30), server_default="custom", nullable=False),
        sa.Column("current_state", sa.String(length=30), server_default="empty", nullable=False),
        sa.Column("state_updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_by_member_id", sa.UUID(), nullable=True),
        sa.CheckConstraint("current_state IN ('empty', 'dirty', 'running', 'clean_needs_emptying')", name="ck_appliance_current_state"),
        sa.ForeignKeyConstraint(["household_id"], ["households.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["updated_by_member_id"], ["members.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_appliances_household_id", "appliances", ["household_id"], unique=False)

    # 7. appliance_state_logs
    op.create_table(
        "appliance_state_logs",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("appliance_id", sa.UUID(), nullable=False),
        sa.Column("from_state", sa.String(length=30), nullable=False),
        sa.Column("to_state", sa.String(length=30), nullable=False),
        sa.Column("trigger_source", sa.String(length=30), server_default="manual", nullable=False),
        sa.Column("actor_member_id", sa.UUID(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["appliance_id"], ["appliances.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["actor_member_id"], ["members.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_appliance_state_logs_appliance_id", "appliance_state_logs", ["appliance_id"], unique=False)

    # 8. push_subscriptions
    op.create_table(
        "push_subscriptions",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("member_id", sa.UUID(), nullable=False),
        sa.Column("household_id", sa.UUID(), nullable=False),
        sa.Column("endpoint", sa.Text(), nullable=False),
        sa.Column("p256dh_key", sa.Text(), nullable=False),
        sa.Column("auth_key", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["household_id"], ["households.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["member_id"], ["members.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_push_subscriptions_household_id", "push_subscriptions", ["household_id"], unique=False)
    op.create_index("ix_push_subscriptions_member_id", "push_subscriptions", ["member_id"], unique=False)


def downgrade() -> None:
    op.drop_table("push_subscriptions")
    op.drop_table("appliance_state_logs")
    op.drop_table("appliances")
    op.drop_table("chore_logs")
    op.drop_table("chore_assignments")
    op.drop_table("chores")
    op.drop_table("members")
    op.drop_table("households")
