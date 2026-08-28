"""Add chore_rotation_active to households

Revision ID: 0002_add_chore_rotation_active
Revises: 0001_initial_schema
Create Date: 2026-08-27 23:25:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0002_add_chore_rotation_active"
down_revision: Union[str, None] = "0001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "households",
        sa.Column(
            "chore_rotation_active",
            sa.Boolean(),
            server_default="false",
            nullable=False,
        ),
    )


def downgrade() -> None:
    with op.batch_alter_table("households") as batch_op:
        batch_op.drop_column("chore_rotation_active")
