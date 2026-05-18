from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.goal import Goal, GoalStatus
from app.models.user import User
from app.repositories.manager_repository import ManagerRepository
from app.schemas.goal import GoalUpdate


class ManagerService:
    def __init__(self, db: AsyncSession) -> None:
        self.repository = ManagerRepository(db)

    async def list_pending_goals(self, reviewer: User) -> list[Goal]:
        return await self.repository.list_submitted_goals(reviewer)

    async def list_employee_goals(self, employee_id: int, reviewer: User) -> list[Goal]:
        return await self.repository.list_employee_goals(employee_id, reviewer)

    async def update_goal_inline(self, goal_id: int, reviewer: User, payload: GoalUpdate) -> Goal:
        goal = await self.repository.get_reviewable_goal(goal_id, reviewer)
        if goal is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
        if goal.status == GoalStatus.APPROVED.value or goal.is_locked:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Approved goals cannot be edited by manager",
            )

        update_data = payload.model_dump(exclude_unset=True)
        allowed_fields = {"target", "weightage", "uom", "uom_type"}
        blocked_fields = set(update_data) - allowed_fields
        if blocked_fields:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Managers can only edit target, UoM, and weightage during review",
            )

        for field, value in update_data.items():
            setattr(goal, field, value)
        return await self.repository.save(goal)

    async def approve_goal(self, goal_id: int, reviewer: User, comment: str | None = None) -> Goal:
        goal = await self._get_submitted_goal(goal_id, reviewer)
        await self._validate_employee_submitted_sheet(goal.employee_id)
        now = datetime.now(UTC)
        goal.status = GoalStatus.APPROVED.value
        goal.is_locked = True
        goal.manager_comment = comment
        goal.reviewed_at = now
        goal.reviewed_by = reviewer.id
        goal.approved_at = now
        return await self.repository.save(goal)

    async def send_goal_for_rework(self, goal_id: int, reviewer: User, comment: str) -> Goal:
        goal = await self._get_submitted_goal(goal_id, reviewer)
        goal.status = GoalStatus.REWORK.value
        goal.is_locked = False
        goal.manager_comment = comment
        goal.reviewed_at = datetime.now(UTC)
        goal.reviewed_by = reviewer.id
        goal.approved_at = None
        return await self.repository.save(goal)

    async def reject_goal(self, goal_id: int, reviewer: User, comment: str) -> Goal:
        goal = await self._get_submitted_goal(goal_id, reviewer)
        goal.status = GoalStatus.REJECTED.value
        goal.manager_comment = comment
        goal.reviewed_at = datetime.now(UTC)
        goal.reviewed_by = reviewer.id
        goal.approved_at = None
        return await self.repository.save(goal)

    async def _get_submitted_goal(self, goal_id: int, reviewer: User) -> Goal:
        goal = await self.repository.get_reviewable_goal(goal_id, reviewer)
        if goal is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
        if goal.status == GoalStatus.APPROVED.value:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Approved goals cannot be reviewed again",
            )
        if goal.status != GoalStatus.SUBMITTED.value:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Only submitted goals can be reviewed",
            )
        return goal

    async def _validate_employee_submitted_sheet(self, employee_id: int) -> None:
        goals = [
            goal
            for goal in await self.repository.list_employee_goals_unscoped(employee_id)
            if goal.status != GoalStatus.REJECTED.value
        ]
        if not goals:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="No submitted goals found")
        if len(goals) > 8:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A goal sheet can contain a maximum of 8 goals")
        if any(goal.weightage < 10 for goal in goals):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Each goal must have at least 10% weightage")
        if sum(goal.weightage for goal in goals) != 100:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Total submitted goal weightage must equal 100%")
