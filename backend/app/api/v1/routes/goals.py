from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.goal import (
    GoalCreate,
    GoalListResponse,
    GoalRead,
    GoalSubmitResponse,
    GoalUpdate,
    SharedGoalCreate,
)
from app.services.goal_service import GoalService

router = APIRouter(prefix="/goals", tags=["goals"])


@router.get("", response_model=GoalListResponse)
async def get_my_goals(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> GoalListResponse:
    goals = await GoalService(db).list_my_goals(current_user)
    return GoalListResponse(goals=goals)


@router.post("", response_model=GoalRead, status_code=status.HTTP_201_CREATED)
async def create_goal(
    payload: GoalCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> GoalRead:
    return await GoalService(db).create_goal(payload, current_user)


@router.post("/submit", response_model=GoalSubmitResponse)
async def submit_goal_sheet(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> GoalSubmitResponse:
    goals = await GoalService(db).submit_goal_sheet(current_user)
    return GoalSubmitResponse(goals=goals, total_weightage=sum(goal.weightage for goal in goals))


@router.post("/shared", response_model=GoalListResponse, status_code=status.HTTP_201_CREATED)
async def create_shared_goal(
    payload: SharedGoalCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> GoalListResponse:
    goals = await GoalService(db).create_shared_goal(payload, current_user)
    return GoalListResponse(goals=goals)


@router.get("/approved", response_model=GoalListResponse)
async def get_approved_goals(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> GoalListResponse:
    goals = await GoalService(db).list_my_approved_goals(current_user)
    return GoalListResponse(goals=goals)


@router.patch("/{goal_id}", response_model=GoalRead)
async def update_goal(
    goal_id: int,
    payload: GoalUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> GoalRead:
    return await GoalService(db).update_goal(goal_id, payload, current_user)


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    goal_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> None:
    await GoalService(db).delete_goal(goal_id, current_user)
