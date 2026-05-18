"""goal sheet shared goals

Revision ID: 20260518_0004
Revises: 20260518_0003
Create Date: 2026-05-18
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260518_0004"
down_revision: Union[str, None] = "20260518_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("goals") as batch_op:
        batch_op.add_column(sa.Column("thrust_area", sa.String(length=255), nullable=True))
        batch_op.add_column(
            sa.Column("uom_type", sa.String(length=32), nullable=False, server_default="numeric"),
        )
        batch_op.add_column(sa.Column("shared_goal_group_id", sa.String(length=64), nullable=True))
        batch_op.add_column(sa.Column("shared_source_goal_id", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("primary_owner_id", sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            "fk_goals_shared_source_goal_id_goals",
            "goals",
            ["shared_source_goal_id"],
            ["id"],
        )
        batch_op.create_foreign_key(
            "fk_goals_primary_owner_id_users",
            "users",
            ["primary_owner_id"],
            ["id"],
        )
        batch_op.create_index("ix_goals_shared_goal_group_id", ["shared_goal_group_id"])


def downgrade() -> None:
    with op.batch_alter_table("goals") as batch_op:
        batch_op.drop_index("ix_goals_shared_goal_group_id")
        batch_op.drop_constraint("fk_goals_primary_owner_id_users", type_="foreignkey")
        batch_op.drop_constraint("fk_goals_shared_source_goal_id_goals", type_="foreignkey")
        batch_op.drop_column("primary_owner_id")
        batch_op.drop_column("shared_source_goal_id")
        batch_op.drop_column("shared_goal_group_id")
        batch_op.drop_column("uom_type")
        batch_op.drop_column("thrust_area")
