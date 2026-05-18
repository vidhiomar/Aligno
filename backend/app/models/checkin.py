from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ManagerCheckin(Base):
    __tablename__ = "manager_checkins"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    achievement_id: Mapped[int] = mapped_column(
        ForeignKey("achievement_updates.id"),
        nullable=False,
        index=True,
    )
    manager_comment: Mapped[str] = mapped_column(Text, nullable=False)
    reviewed_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    reviewed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    achievement = relationship("AchievementUpdate", back_populates="manager_checkins")
    reviewer = relationship("User")
