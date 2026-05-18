from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.goal import Goal
from app.models.user import User


class ManagerRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list_submitted_goals(self, reviewer: User) -> list[Goal]:
        statement = (
            select(Goal)
            .options(selectinload(Goal.employee))
            .join(User, Goal.employee_id == User.id)
            .where(Goal.status == "submitted")
            .order_by(Goal.submitted_at.desc().nullslast(), Goal.created_at.desc())
        )

        if reviewer.role == "manager":
            statement = statement.where(User.manager_id == reviewer.id)

        result = await self.db.execute(statement)
        return list(result.scalars().all())

    async def list_employee_goals(self, employee_id: int, reviewer: User) -> list[Goal]:
        statement = (
            select(Goal)
            .options(selectinload(Goal.employee))
            .join(User, Goal.employee_id == User.id)
            .where(Goal.employee_id == employee_id)
            .order_by(Goal.created_at.desc())
        )

        if reviewer.role == "manager":
            statement = statement.where(User.manager_id == reviewer.id)

        result = await self.db.execute(statement)
        return list(result.scalars().all())

    async def list_employee_goals_unscoped(self, employee_id: int) -> list[Goal]:
        result = await self.db.execute(
            select(Goal)
            .options(selectinload(Goal.employee))
            .where(Goal.employee_id == employee_id)
            .order_by(Goal.created_at.desc()),
        )
        return list(result.scalars().all())

    async def get_reviewable_goal(self, goal_id: int, reviewer: User) -> Goal | None:
        statement = (
            select(Goal)
            .options(selectinload(Goal.employee))
            .join(User, Goal.employee_id == User.id)
            .where(Goal.id == goal_id)
        )

        if reviewer.role == "manager":
            statement = statement.where(User.manager_id == reviewer.id)

        result = await self.db.execute(statement)
        return result.scalar_one_or_none()

    async def save(self, goal: Goal) -> Goal:
        await self.db.commit()
        await self.db.refresh(goal)
        return goal
