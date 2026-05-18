from pydantic import BaseModel, Field, field_validator

from app.schemas.goal import GoalRead


class ManagerReviewRequest(BaseModel):
    comment: str | None = Field(default=None, max_length=2000)

    @field_validator("comment")
    @classmethod
    def strip_optional_comment(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip()
        return stripped or None


class ManagerReviewCommentRequest(BaseModel):
    comment: str = Field(min_length=1, max_length=2000)

    @field_validator("comment")
    @classmethod
    def require_comment(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Manager comment is required")
        return stripped


class ManagerGoalListResponse(BaseModel):
    goals: list[GoalRead]
