"""add quarterly checkins

Revision ID: 20260518_0003
Revises: 20260518_0002
Create Date: 2026-05-18
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260518_0003"
down_revision: Union[str, None] = "20260518_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "achievement_updates",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("goal_id", sa.Integer(), nullable=False),
        sa.Column("quarter", sa.String(length=2), nullable=False),
        sa.Column("planned_value", sa.String(length=255), nullable=True),
        sa.Column("actual_value", sa.String(length=255), nullable=True),
        sa.Column("progress_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="not_started"),
        sa.Column("employee_comment", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["goal_id"], ["goals.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("goal_id", "quarter", name="uq_achievement_goal_quarter"),
    )
    op.create_index(op.f("ix_achievement_updates_goal_id"), "achievement_updates", ["goal_id"])
    op.create_index(op.f("ix_achievement_updates_id"), "achievement_updates", ["id"])
    op.create_index(op.f("ix_achievement_updates_quarter"), "achievement_updates", ["quarter"])
    op.create_index(op.f("ix_achievement_updates_status"), "achievement_updates", ["status"])

    op.create_table(
        "manager_checkins",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("achievement_id", sa.Integer(), nullable=False),
        sa.Column("manager_comment", sa.Text(), nullable=False),
        sa.Column("reviewed_by", sa.Integer(), nullable=False),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["achievement_id"], ["achievement_updates.id"]),
        sa.ForeignKeyConstraint(["reviewed_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_manager_checkins_achievement_id"), "manager_checkins", ["achievement_id"])
    op.create_index(op.f("ix_manager_checkins_id"), "manager_checkins", ["id"])


def downgrade() -> None:
    op.drop_index(op.f("ix_manager_checkins_id"), table_name="manager_checkins")
    op.drop_index(op.f("ix_manager_checkins_achievement_id"), table_name="manager_checkins")
    op.drop_table("manager_checkins")
    op.drop_index(op.f("ix_achievement_updates_status"), table_name="achievement_updates")
    op.drop_index(op.f("ix_achievement_updates_quarter"), table_name="achievement_updates")
    op.drop_index(op.f("ix_achievement_updates_id"), table_name="achievement_updates")
    op.drop_index(op.f("ix_achievement_updates_goal_id"), table_name="achievement_updates")
    op.drop_table("achievement_updates")
