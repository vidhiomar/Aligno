from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_manager, get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.checkin import (
    AchievementCreate,
    AchievementListResponse,
    AchievementRead,
    AchievementUpdateRequest,
    ManagerCheckinCreate,
    ManagerCheckinRead,
    TeamProgressResponse,
)
from app.services.checkin_service import CheckinService

router = APIRouter(tags=["checkins"])


@router.get("/achievements", response_model=AchievementListResponse)
async def get_my_achievements(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> AchievementListResponse:
    updates = await CheckinService(db).list_my_achievements(current_user)
    return AchievementListResponse(updates=updates)


@router.post("/achievements", response_model=AchievementRead)
async def create_achievement(
    payload: AchievementCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> AchievementRead:
    return await CheckinService(db).create_achievement(payload, current_user)


@router.get("/achievements/{goal_id}", response_model=AchievementListResponse)
async def get_goal_achievements(
    goal_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> AchievementListResponse:
    updates = await CheckinService(db).list_goal_achievements(goal_id, current_user)
    return AchievementListResponse(updates=updates)


@router.put("/achievements/{achievement_id}", response_model=AchievementRead)
async def update_achievement(
    achievement_id: int,
    payload: AchievementUpdateRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> AchievementRead:
    return await CheckinService(db).update_achievement(achievement_id, payload, current_user)


@router.post("/checkins/{achievement_id}", response_model=ManagerCheckinRead)
async def create_manager_checkin(
    achievement_id: int,
    payload: ManagerCheckinCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_manager)],
) -> ManagerCheckinRead:
    return await CheckinService(db).create_manager_checkin(achievement_id, payload, current_user)


@router.get("/checkins/team", response_model=TeamProgressResponse)
async def get_team_progress(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_manager)],
) -> TeamProgressResponse:
    updates = await CheckinService(db).list_team_progress(current_user)
    return TeamProgressResponse(updates=updates)
