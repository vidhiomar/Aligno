from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.achievement import AchievementUpdate
from app.models.checkin import ManagerCheckin
from app.models.goal import Goal, GoalStatus
from app.models.user import User


class CheckinRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_goal_for_employee(self, goal_id: int, employee_id: int) -> Goal | None:
        result = await self.db.execute(
            select(Goal)
            .options(selectinload(Goal.employee))
            .where(Goal.id == goal_id, Goal.employee_id == employee_id),
        )
        return result.scalar_one_or_none()

    async def list_goals_by_shared_group(self, shared_goal_group_id: str) -> list[Goal]:
        result = await self.db.execute(
            select(Goal)
            .options(selectinload(Goal.employee))
            .where(Goal.shared_goal_group_id == shared_goal_group_id),
        )
        return list(result.scalars().all())

    async def get_existing_achievement(self, goal_id: int, quarter: str) -> AchievementUpdate | None:
        result = await self.db.execute(
            select(AchievementUpdate).where(
                AchievementUpdate.goal_id == goal_id,
                AchievementUpdate.quarter == quarter,
            ),
        )
        return result.scalar_one_or_none()

    async def create_achievement(self, achievement: AchievementUpdate) -> AchievementUpdate:
        self.db.add(achievement)
        await self.db.commit()
        return await self.get_achievement_by_id(achievement.id)  # type: ignore[return-value]

    async def get_achievement_by_id(self, achievement_id: int) -> AchievementUpdate | None:
        result = await self.db.execute(
            select(AchievementUpdate)
            .options(
                selectinload(AchievementUpdate.goal).selectinload(Goal.employee),
                selectinload(AchievementUpdate.manager_checkins),
            )
            .where(AchievementUpdate.id == achievement_id),
        )
        return result.scalar_one_or_none()

    async def list_goal_achievements(self, goal_id: int, employee_id: int) -> list[AchievementUpdate]:
        result = await self.db.execute(
            select(AchievementUpdate)
            .options(
                selectinload(AchievementUpdate.goal).selectinload(Goal.employee),
                selectinload(AchievementUpdate.manager_checkins),
            )
            .join(Goal, AchievementUpdate.goal_id == Goal.id)
            .where(Goal.id == goal_id, Goal.employee_id == employee_id)
            .order_by(AchievementUpdate.created_at.desc()),
        )
        return list(result.scalars().all())

    async def list_employee_achievements(self, employee_id: int) -> list[AchievementUpdate]:
        result = await self.db.execute(
            select(AchievementUpdate)
            .options(
                selectinload(AchievementUpdate.goal).selectinload(Goal.employee),
                selectinload(AchievementUpdate.manager_checkins),
            )
            .join(Goal, AchievementUpdate.goal_id == Goal.id)
            .where(Goal.employee_id == employee_id)
            .order_by(AchievementUpdate.created_at.desc()),
        )
        return list(result.scalars().all())

    async def list_team_achievements(self, reviewer: User) -> list[AchievementUpdate]:
        statement = (
            select(AchievementUpdate)
            .options(
                selectinload(AchievementUpdate.goal).selectinload(Goal.employee),
                selectinload(AchievementUpdate.manager_checkins),
            )
            .join(Goal, AchievementUpdate.goal_id == Goal.id)
            .join(User, Goal.employee_id == User.id)
            .where(Goal.status == GoalStatus.APPROVED.value)
            .order_by(AchievementUpdate.updated_at.desc())
        )

        if reviewer.role == "manager":
            statement = statement.where(User.manager_id == reviewer.id)

        result = await self.db.execute(statement)
        return list(result.scalars().all())

    async def save_achievement(self, achievement: AchievementUpdate) -> AchievementUpdate:
        await self.db.commit()
        return await self.get_achievement_by_id(achievement.id)  # type: ignore[return-value]

    async def create_manager_checkin(self, checkin: ManagerCheckin) -> ManagerCheckin:
        self.db.add(checkin)
        await self.db.commit()
        await self.db.refresh(checkin)
        return checkin
