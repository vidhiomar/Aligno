from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

GoalStatus = Literal["draft", "submitted", "approved", "rework", "rejected"]
UomType = Literal["numeric", "percent", "timeline", "zero_based"]


class GoalEmployee(BaseModel):
    id: int
    email: str
    full_name: str | None

    model_config = ConfigDict(from_attributes=True)


class GoalRead(BaseModel):
    id: int
    employee_id: int
    title: str
    thrust_area: str | None
    description: str | None
    target: str | None
    uom: str | None
    uom_type: UomType
    weightage: int
    status: GoalStatus
    is_locked: bool
    manager_comment: str | None
    submitted_at: datetime | None
    reviewed_at: datetime | None
    reviewed_by: int | None
    approved_at: datetime | None
    shared_goal_group_id: str | None
    shared_source_goal_id: int | None
    primary_owner_id: int | None
    created_at: datetime
    employee: GoalEmployee | None = None

    model_config = ConfigDict(from_attributes=True)


class GoalListResponse(BaseModel):
    goals: list[GoalRead]


class GoalCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    thrust_area: str | None = Field(default=None, max_length=255)
    description: str | None = None
    target: str | None = Field(default=None, max_length=255)
    uom: str | None = Field(default=None, max_length=64)
    uom_type: UomType = "numeric"
    weightage: int = Field(ge=10, le=100)


class GoalUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    thrust_area: str | None = Field(default=None, max_length=255)
    description: str | None = None
    target: str | None = Field(default=None, max_length=255)
    uom: str | None = Field(default=None, max_length=64)
    uom_type: UomType | None = None
    weightage: int | None = Field(default=None, ge=10, le=100)


class GoalSubmitResponse(BaseModel):
    goals: list[GoalRead]
    total_weightage: int


class SharedGoalCreate(BaseModel):
    employee_ids: list[int] = Field(min_length=1, max_length=100)
    primary_owner_id: int
    title: str = Field(min_length=1, max_length=255)
    thrust_area: str | None = Field(default=None, max_length=255)
    description: str | None = None
    target: str | None = Field(default=None, max_length=255)
    uom: str | None = Field(default=None, max_length=64)
    uom_type: UomType = "numeric"
    weightage: int = Field(ge=10, le=100)
