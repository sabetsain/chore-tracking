"""Custom appliance engine migration

Revision ID: 0003_custom_appliance_engine
Revises: 0002_add_chore_rotation_active
Create Date: 2026-09-08 20:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "0003_custom_appliance_engine"
down_revision: Union[str, None] = "0002_add_chore_rotation_active"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Drop the legacy check constraint and add step slots + timer columns
    with op.batch_alter_table("appliances", recreate="auto") as batch_op:
        batch_op.drop_constraint("ck_appliance_current_state", type_="check")
        batch_op.add_column(
            sa.Column("state_step_1", sa.String(length=30), server_default="empty", nullable=False)
        )
        batch_op.add_column(
            sa.Column("state_step_2", sa.String(length=30), server_default="running", nullable=False)
        )
        batch_op.add_column(
            sa.Column("state_step_3", sa.String(length=30), nullable=True)
        )
        batch_op.add_column(
            sa.Column("state_step_4", sa.String(length=30), nullable=True)
        )
        batch_op.add_column(
            sa.Column("state_step_5", sa.String(length=30), nullable=True)
        )
        batch_op.add_column(
            sa.Column("timer_enabled", sa.Boolean(), server_default=sa.false(), nullable=False)
        )
        batch_op.add_column(
            sa.Column("default_timer_minutes", sa.Integer(), nullable=True)
        )
        batch_op.add_column(
            sa.Column("timer_duration_minutes", sa.Integer(), nullable=True)
        )
        batch_op.add_column(
            sa.Column("timer_started_at", sa.DateTime(timezone=True), nullable=True)
        )
        batch_op.add_column(
            sa.Column("timer_ends_at", sa.DateTime(timezone=True), nullable=True)
        )

    # 2. Backfill existing appliances
    # Migrate any active state 'clean_needs_emptying' to 'needs_attention'
    op.execute(
        sa.text("UPDATE appliances SET current_state = 'needs_attention' WHERE current_state = 'clean_needs_emptying'")
    )
    # Washer and Dryer backfill: 3-step cycle, timer 45m
    op.execute(
        sa.text(
            "UPDATE appliances SET state_step_1 = 'empty', state_step_2 = 'running', "
            "state_step_3 = 'needs_attention', timer_enabled = true, default_timer_minutes = 45 "
            "WHERE type IN ('washer', 'dryer')"
        )
    )
    # Dishwasher backfill: 3-step cycle, timer 60m
    op.execute(
        sa.text(
            "UPDATE appliances SET state_step_1 = 'dirty', state_step_2 = 'running', "
            "state_step_3 = 'needs_attention', timer_enabled = true, default_timer_minutes = 60 "
            "WHERE type = 'dishwasher'"
        )
    )
    # If a dishwasher had current_state = 'empty', migrate to 'dirty' to be a valid step
    op.execute(
        sa.text(
            "UPDATE appliances SET current_state = 'dirty' "
            "WHERE type = 'dishwasher' AND current_state = 'empty'"
        )
    )
    # Custom / other appliances backfill
    op.execute(
        sa.text(
            "UPDATE appliances SET state_step_1 = 'empty', state_step_2 = 'running', "
            "state_step_3 = 'needs_attention', timer_enabled = false "
            "WHERE type NOT IN ('washer', 'dryer', 'dishwasher') AND (state_step_3 IS NULL OR state_step_3 = '')"
        )
    )

    # 3. Add new check constraints once data is backfilled
    with op.batch_alter_table("appliances", recreate="auto") as batch_op:
        batch_op.create_check_constraint(
            "ck_appliance_current_state_in_steps",
            "current_state IN (state_step_1, state_step_2, COALESCE(state_step_3, state_step_1), COALESCE(state_step_4, state_step_1), COALESCE(state_step_5, state_step_1))",
        )
        batch_op.create_check_constraint(
            "ck_appliance_canonical_states",
            "state_step_1 IN ('empty', 'dirty', 'running', 'needs_attention', 'clean') AND "
            "state_step_2 IN ('empty', 'dirty', 'running', 'needs_attention', 'clean') AND "
            "(state_step_3 IS NULL OR state_step_3 IN ('empty', 'dirty', 'running', 'needs_attention', 'clean')) AND "
            "(state_step_4 IS NULL OR state_step_4 IN ('empty', 'dirty', 'running', 'needs_attention', 'clean')) AND "
            "(state_step_5 IS NULL OR state_step_5 IN ('empty', 'dirty', 'running', 'needs_attention', 'clean'))",
        )


def downgrade() -> None:
    with op.batch_alter_table("appliances", recreate="auto") as batch_op:
        batch_op.drop_constraint("ck_appliance_current_state_in_steps", type_="check")
        batch_op.drop_constraint("ck_appliance_canonical_states", type_="check")
        batch_op.create_check_constraint(
            "ck_appliance_current_state",
            "current_state IN ('empty', 'dirty', 'running', 'clean_needs_emptying')",
        )
        batch_op.drop_column("timer_ends_at")
        batch_op.drop_column("timer_started_at")
        batch_op.drop_column("timer_duration_minutes")
        batch_op.drop_column("default_timer_minutes")
        batch_op.drop_column("timer_enabled")
        batch_op.drop_column("state_step_5")
        batch_op.drop_column("state_step_4")
        batch_op.drop_column("state_step_3")
        batch_op.drop_column("state_step_2")
        batch_op.drop_column("state_step_1")
