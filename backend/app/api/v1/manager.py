from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_manager
from app.db.session import get_db
from app.models.user import User
from app.schemas.goal import GoalUpdate
from app.schemas.goal import GoalRead
from app.schemas.manager import ManagerGoalListResponse, ManagerReviewCommentRequest, ManagerReviewRequest
from app.services.manager_service import ManagerService

router = APIRouter(prefix="/manager", tags=["manager"])


@router.get("/goals", response_model=ManagerGoalListResponse)
async def get_manager_goals(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_manager)],
) -> ManagerGoalListResponse:
    goals = await ManagerService(db).list_pending_goals(current_user)
    return ManagerGoalListResponse(goals=goals)


@router.get("/goals/{employee_id}", response_model=ManagerGoalListResponse)
async def get_employee_goals(
    employee_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_manager)],
) -> ManagerGoalListResponse:
    goals = await ManagerService(db).list_employee_goals(employee_id, current_user)
    return ManagerGoalListResponse(goals=goals)


@router.post("/goals/{goal_id}/approve", response_model=GoalRead)
async def approve_goal(
    goal_id: int,
    payload: ManagerReviewRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_manager)],
) -> GoalRead:
    return await ManagerService(db).approve_goal(goal_id, current_user, payload.comment)


@router.patch("/goals/{goal_id}", response_model=GoalRead)
async def update_goal_inline(
    goal_id: int,
    payload: GoalUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_manager)],
) -> GoalRead:
    return await ManagerService(db).update_goal_inline(goal_id, current_user, payload)


@router.post("/goals/{goal_id}/rework", response_model=GoalRead)
async def rework_goal(
    goal_id: int,
    payload: ManagerReviewCommentRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_manager)],
) -> GoalRead:
    return await ManagerService(db).send_goal_for_rework(goal_id, current_user, payload.comment)


@router.post("/goals/{goal_id}/reject", response_model=GoalRead)
async def reject_goal(
    goal_id: int,
    payload: ManagerReviewCommentRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_manager)],
) -> GoalRead:
    return await ManagerService(db).reject_goal(goal_id, current_user, payload.comment)
