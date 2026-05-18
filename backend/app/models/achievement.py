from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Quarter(str, Enum):
    Q1 = "Q1"
    Q2 = "Q2"
    Q3 = "Q3"
    Q4 = "Q4"


class ProgressStatus(str, Enum):
    NOT_STARTED = "not_started"
    ON_TRACK = "on_track"
    COMPLETED = "completed"


class AchievementUpdate(Base):
    __tablename__ = "achievement_updates"
    __table_args__ = (UniqueConstraint("goal_id", "quarter", name="uq_achievement_goal_quarter"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    goal_id: Mapped[int] = mapped_column(ForeignKey("goals.id"), nullable=False, index=True)
    quarter: Mapped[str] = mapped_column(String(2), nullable=False, index=True)
    planned_value: Mapped[str | None] = mapped_column(String(255), nullable=True)
    actual_value: Mapped[str | None] = mapped_column(String(255), nullable=True)
    progress_score: Mapped[float] = mapped_column(default=0, nullable=False)
    status: Mapped[str] = mapped_column(
        String(32),
        default=ProgressStatus.NOT_STARTED.value,
        nullable=False,
        index=True,
    )
    employee_comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    goal = relationship("Goal")
    manager_checkins = relationship("ManagerCheckin", back_populates="achievement")
