from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class UserCreate(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)
    role: Literal["employee", "manager", "admin"] = "employee"
    manager_id: int | None = None


class UserRead(BaseModel):
    id: int
    email: str
    full_name: str | None
    role: str
    manager_id: int | None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
