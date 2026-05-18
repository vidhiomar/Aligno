from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.goal import GoalRead

Quarter = Literal["Q1", "Q2", "Q3", "Q4"]
ProgressStatus = Literal["not_started", "on_track", "completed"]


class AchievementCreate(BaseModel):
    goal_id: int
    quarter: Quarter
    actual_value: str | None = Field(default=None, max_length=255)
    status: ProgressStatus = "not_started"
    employee_comment: str | None = Field(default=None, max_length=2000)


class AchievementUpdateRequest(BaseModel):
    actual_value: str | None = Field(default=None, max_length=255)
    status: ProgressStatus
    employee_comment: str | None = Field(default=None, max_length=2000)


class ManagerCheckinCreate(BaseModel):
    manager_comment: str = Field(min_length=1, max_length=2000)


class ManagerCheckinRead(BaseModel):
    id: int
    achievement_id: int
    manager_comment: str
    reviewed_by: int
    reviewed_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AchievementRead(BaseModel):
    id: int
    goal_id: int
    quarter: Quarter
    planned_value: str | None
    actual_value: str | None
    progress_score: float
    status: ProgressStatus
    employee_comment: str | None
    created_at: datetime
    updated_at: datetime
    goal: GoalRead | None = None
    manager_checkins: list[ManagerCheckinRead] = []

    model_config = ConfigDict(from_attributes=True)


class AchievementListResponse(BaseModel):
    updates: list[AchievementRead]


class TeamProgressResponse(BaseModel):
    updates: list[AchievementRead]
