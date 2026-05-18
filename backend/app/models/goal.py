from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class GoalStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    REWORK = "rework"
    REJECTED = "rejected"


class UomType(str, Enum):
    NUMERIC = "numeric"
    PERCENT = "percent"
    TIMELINE = "timeline"
    ZERO_BASED = "zero_based"


class Goal(Base):
    __tablename__ = "goals"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    thrust_area: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    target: Mapped[str | None] = mapped_column(String(255), nullable=True)
    uom: Mapped[str | None] = mapped_column(String(64), nullable=True)
    uom_type: Mapped[str] = mapped_column(String(32), default=UomType.NUMERIC.value, nullable=False)
    weightage: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(
        String(32),
        default=GoalStatus.DRAFT.value,
        nullable=False,
        index=True,
    )
    is_locked: Mapped[bool] = mapped_column(default=False, nullable=False)
    manager_comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    reviewed_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    shared_goal_group_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    shared_source_goal_id: Mapped[int | None] = mapped_column(ForeignKey("goals.id"), nullable=True)
    primary_owner_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    employee = relationship("User", foreign_keys=[employee_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    shared_source_goal = relationship("Goal", remote_side=[id], foreign_keys=[shared_source_goal_id])
    primary_owner = relationship("User", foreign_keys=[primary_owner_id])
