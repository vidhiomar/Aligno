from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.audit import AuditLog
from app.models.goal import Goal, GoalStatus


class GoalRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, goal_id: int) -> Goal | None:
        result = await self.db.execute(
            select(Goal).options(selectinload(Goal.employee)).where(Goal.id == goal_id),
        )
        return result.scalar_one_or_none()

    async def list_approved_for_employee(self, employee_id: int) -> list[Goal]:
        result = await self.db.execute(
            select(Goal)
            .options(selectinload(Goal.employee))
            .where(
                Goal.employee_id == employee_id,
                Goal.status == GoalStatus.APPROVED.value,
            )
            .order_by(Goal.created_at.desc()),
        )
        return list(result.scalars().all())

    async def list_for_employee(self, employee_id: int) -> list[Goal]:
        result = await self.db.execute(
            select(Goal)
            .options(selectinload(Goal.employee))
            .where(Goal.employee_id == employee_id)
            .order_by(Goal.created_at.desc()),
        )
        return list(result.scalars().all())

    async def count_for_employee(self, employee_id: int) -> int:
        result = await self.db.execute(select(Goal.id).where(Goal.employee_id == employee_id))
        return len(result.scalars().all())

    async def create(self, goal: Goal) -> Goal:
        self.db.add(goal)
        await self.db.commit()
        await self.db.refresh(goal)
        return goal

    async def create_many(self, goals: list[Goal]) -> list[Goal]:
        self.db.add_all(goals)
        await self.db.commit()
        for goal in goals:
            await self.db.refresh(goal)
        return goals

    async def save(self, goal: Goal) -> Goal:
        await self.db.commit()
        await self.db.refresh(goal)
        return goal

    async def add_audit_logs(self, logs: list[AuditLog]) -> None:
        self.db.add_all(logs)

    async def delete(self, goal: Goal) -> None:
        await self.db.delete(goal)
        await self.db.commit()
