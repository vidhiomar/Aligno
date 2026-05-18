from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.achievement import AchievementUpdate
from app.models.checkin import ManagerCheckin
from app.models.goal import GoalStatus
from app.models.user import User
from app.repositories.checkin_repository import CheckinRepository
from app.schemas.checkin import AchievementCreate, AchievementUpdateRequest, ManagerCheckinCreate
from app.services.progress_service import calculate_progress
from app.services.quarter_service import QuarterService


class CheckinService:
    def __init__(self, db: AsyncSession) -> None:
        self.repository = CheckinRepository(db)
        self.quarter_service = QuarterService()

    async def create_achievement(self, payload: AchievementCreate, current_user: User) -> AchievementUpdate:
        self.quarter_service.ensure_active_quarter(payload.quarter)
        goal = await self.repository.get_goal_for_employee(payload.goal_id, current_user.id)
        if goal is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
        if goal.status != GoalStatus.APPROVED.value:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Only approved goals can receive achievement updates",
            )

        existing = await self.repository.get_existing_achievement(payload.goal_id, payload.quarter)
        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This goal already has an update for the selected quarter",
            )

        progress_score = calculate_progress(goal.uom_type, goal.target, payload.actual_value)
        achievement = AchievementUpdate(
            goal_id=goal.id,
            quarter=payload.quarter,
            planned_value=goal.target,
            actual_value=payload.actual_value,
            progress_score=progress_score,
            status=payload.status,
            employee_comment=payload.employee_comment,
        )
        created = await self.repository.create_achievement(achievement)
        await self._sync_shared_achievement(created, goal, current_user)
        return created

    async def list_goal_achievements(self, goal_id: int, current_user: User) -> list[AchievementUpdate]:
        return await self.repository.list_goal_achievements(goal_id, current_user.id)

    async def list_my_achievements(self, current_user: User) -> list[AchievementUpdate]:
        return await self.repository.list_employee_achievements(current_user.id)

    async def update_achievement(
        self,
        achievement_id: int,
        payload: AchievementUpdateRequest,
        current_user: User,
    ) -> AchievementUpdate:
        achievement = await self.repository.get_achievement_by_id(achievement_id)
        if achievement is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found")
        if achievement.goal is None or achievement.goal.employee_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Achievement access denied")

        self.quarter_service.ensure_active_quarter(achievement.quarter)
        achievement.actual_value = payload.actual_value
        achievement.employee_comment = payload.employee_comment
        achievement.status = payload.status
        achievement.progress_score = calculate_progress(
            achievement.goal.uom_type,
            achievement.planned_value,
            payload.actual_value,
        )
        updated = await self.repository.save_achievement(achievement)
        await self._sync_shared_achievement(updated, achievement.goal, current_user)
        return updated

    async def create_manager_checkin(
        self,
        achievement_id: int,
        payload: ManagerCheckinCreate,
        reviewer: User,
    ) -> ManagerCheckin:
        achievement = await self.repository.get_achievement_by_id(achievement_id)
        if achievement is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found")
        if achievement.goal is None or achievement.goal.employee is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
        if reviewer.role == "manager" and achievement.goal.employee.manager_id != reviewer.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Check-in access denied")

        checkin = ManagerCheckin(
            achievement_id=achievement.id,
            manager_comment=payload.manager_comment.strip(),
            reviewed_by=reviewer.id,
        )
        return await self.repository.create_manager_checkin(checkin)

    async def list_team_progress(self, reviewer: User) -> list[AchievementUpdate]:
        return await self.repository.list_team_achievements(reviewer)

    async def _sync_shared_achievement(
        self,
        source_achievement: AchievementUpdate,
        source_goal,
        current_user: User,
    ) -> None:
        if not source_goal.shared_goal_group_id:
            return
        if source_goal.primary_owner_id and source_goal.primary_owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the primary owner can update shared goal achievements",
            )

        linked_goals = await self.repository.list_goals_by_shared_group(source_goal.shared_goal_group_id)
        for linked_goal in linked_goals:
            if linked_goal.id == source_goal.id:
                continue

            existing = await self.repository.get_existing_achievement(
                linked_goal.id,
                source_achievement.quarter,
            )
            if existing:
                existing.planned_value = linked_goal.target
                existing.actual_value = source_achievement.actual_value
                existing.progress_score = source_achievement.progress_score
                existing.status = source_achievement.status
                existing.employee_comment = source_achievement.employee_comment
                await self.repository.save_achievement(existing)
            else:
                await self.repository.create_achievement(
                    AchievementUpdate(
                        goal_id=linked_goal.id,
                        quarter=source_achievement.quarter,
                        planned_value=linked_goal.target,
                        actual_value=source_achievement.actual_value,
                        progress_score=source_achievement.progress_score,
                        status=source_achievement.status,
                        employee_comment=source_achievement.employee_comment,
                    ),
                )
