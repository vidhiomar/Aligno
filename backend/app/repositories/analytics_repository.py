from sqlalchemy import Float, case, cast, func, literal, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.achievement import AchievementUpdate, ProgressStatus
from app.models.goal import Goal, GoalStatus
from app.models.user import User


class AnalyticsRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def count_employee_goals(self, employee_id: int, status_value: str | None = None) -> int:
        statement = select(func.count(Goal.id)).where(Goal.employee_id == employee_id)
        if status_value:
            statement = statement.where(Goal.status == status_value)
        return int(await self.db.scalar(statement) or 0)

    async def count_employee_completed_updates(self, employee_id: int) -> int:
        statement = (
            select(func.count(AchievementUpdate.id))
            .join(Goal, AchievementUpdate.goal_id == Goal.id)
            .where(
                Goal.employee_id == employee_id,
                AchievementUpdate.status == ProgressStatus.COMPLETED.value,
            )
        )
        return int(await self.db.scalar(statement) or 0)

    async def employee_average_progress(self, employee_id: int) -> float:
        statement = (
            select(func.coalesce(func.avg(AchievementUpdate.progress_score), 0))
            .join(Goal, AchievementUpdate.goal_id == Goal.id)
            .where(Goal.employee_id == employee_id)
        )
        return round(float(await self.db.scalar(statement) or 0), 2)

    async def employee_status_distribution(self, employee_id: int) -> list[tuple[str, int]]:
        result = await self.db.execute(
            select(Goal.status, func.count(Goal.id))
            .where(Goal.employee_id == employee_id)
            .group_by(Goal.status),
        )
        return [(status, int(count)) for status, count in result.all()]

    async def employee_quarterly_trends(self, employee_id: int) -> list[tuple[str, float, int, int]]:
        result = await self.db.execute(
            select(
                AchievementUpdate.quarter,
                func.coalesce(func.avg(AchievementUpdate.progress_score), 0),
                func.sum(case((AchievementUpdate.status == ProgressStatus.COMPLETED.value, 1), else_=0)),
                func.count(AchievementUpdate.id),
            )
            .join(Goal, AchievementUpdate.goal_id == Goal.id)
            .where(Goal.employee_id == employee_id)
            .group_by(AchievementUpdate.quarter)
            .order_by(AchievementUpdate.quarter),
        )
        return [(quarter, round(float(avg), 2), int(completed or 0), int(total)) for quarter, avg, completed, total in result.all()]

    async def team_size(self, manager_id: int) -> int:
        return int(
            await self.db.scalar(select(func.count(User.id)).where(User.manager_id == manager_id)) or 0,
        )

    async def count_team_goals(self, manager_id: int, status_value: str | None = None) -> int:
        statement = (
            select(func.count(Goal.id))
            .join(User, Goal.employee_id == User.id)
            .where(User.manager_id == manager_id)
        )
        if status_value:
            statement = statement.where(Goal.status == status_value)
        return int(await self.db.scalar(statement) or 0)

    async def team_average_progress(self, manager_id: int) -> float:
        statement = (
            select(func.coalesce(func.avg(AchievementUpdate.progress_score), 0))
            .join(Goal, AchievementUpdate.goal_id == Goal.id)
            .join(User, Goal.employee_id == User.id)
            .where(User.manager_id == manager_id)
        )
        return round(float(await self.db.scalar(statement) or 0), 2)

    async def team_checkin_counts(self, manager_id: int) -> tuple[int, int]:
        approved_goals = await self.count_team_goals(manager_id, GoalStatus.APPROVED.value)
        statement = (
            select(func.count(func.distinct(AchievementUpdate.goal_id)))
            .join(Goal, AchievementUpdate.goal_id == Goal.id)
            .join(User, Goal.employee_id == User.id)
            .where(User.manager_id == manager_id)
        )
        checked_in = int(await self.db.scalar(statement) or 0)
        return checked_in, approved_goals

    async def team_status_distribution(self, manager_id: int) -> list[tuple[str, int]]:
        result = await self.db.execute(
            select(Goal.status, func.count(Goal.id))
            .join(User, Goal.employee_id == User.id)
            .where(User.manager_id == manager_id)
            .group_by(Goal.status),
        )
        return [(status, int(count)) for status, count in result.all()]

    async def team_performance(self, manager_id: int) -> list[tuple[int, str, float, float, int]]:
        completed_count = func.sum(case((AchievementUpdate.status == ProgressStatus.COMPLETED.value, 1), else_=0))
        total_count = func.count(AchievementUpdate.id)
        result = await self.db.execute(
            select(
                User.id,
                func.coalesce(User.full_name, User.email),
                func.coalesce(func.avg(AchievementUpdate.progress_score), 0),
                case((total_count > 0, (cast(completed_count, Float) / cast(total_count, Float)) * 100), else_=0),
                total_count,
            )
            .join(Goal, Goal.employee_id == User.id)
            .join(AchievementUpdate, AchievementUpdate.goal_id == Goal.id)
            .where(User.manager_id == manager_id)
            .group_by(User.id, User.full_name, User.email),
        )
        return [
            (int(user_id), employee, round(float(avg), 2), round(float(rate), 2), int(total))
            for user_id, employee, avg, rate, total in result.all()
        ]

    async def team_heatmap(self, manager_id: int) -> list[tuple[str, str, str]]:
        result = await self.db.execute(
            select(
                func.coalesce(User.full_name, User.email),
                AchievementUpdate.quarter,
                AchievementUpdate.status,
            )
            .join(Goal, Goal.employee_id == User.id)
            .join(AchievementUpdate, AchievementUpdate.goal_id == Goal.id)
            .where(User.manager_id == manager_id)
            .order_by(User.full_name, AchievementUpdate.quarter),
        )
        return [(employee, quarter, status) for employee, quarter, status in result.all()]

    async def total_employees(self) -> int:
        return int(await self.db.scalar(select(func.count(User.id)).where(User.role == "employee")) or 0)

    async def active_goals(self) -> int:
        return int(await self.db.scalar(select(func.count(Goal.id)).where(Goal.status != GoalStatus.REJECTED.value)) or 0)

    async def org_goal_count(self, status_value: str | None = None) -> int:
        statement = select(func.count(Goal.id))
        if status_value:
            statement = statement.where(Goal.status == status_value)
        return int(await self.db.scalar(statement) or 0)

    async def org_completion_counts(self) -> tuple[int, int]:
        total = int(await self.db.scalar(select(func.count(AchievementUpdate.id))) or 0)
        completed = int(
            await self.db.scalar(
                select(func.count(AchievementUpdate.id)).where(
                    AchievementUpdate.status == ProgressStatus.COMPLETED.value,
                ),
            )
            or 0,
        )
        return completed, total

    async def org_status_distribution(self) -> list[tuple[str, int]]:
        result = await self.db.execute(select(Goal.status, func.count(Goal.id)).group_by(Goal.status))
        return [(status, int(count)) for status, count in result.all()]

    async def org_quarterly_trends(self) -> list[tuple[str, float, int, int]]:
        result = await self.db.execute(
            select(
                AchievementUpdate.quarter,
                func.coalesce(func.avg(AchievementUpdate.progress_score), 0),
                func.sum(case((AchievementUpdate.status == ProgressStatus.COMPLETED.value, 1), else_=0)),
                func.count(AchievementUpdate.id),
            )
            .group_by(AchievementUpdate.quarter)
            .order_by(AchievementUpdate.quarter),
        )
        return [(quarter, round(float(avg), 2), int(completed or 0), int(total)) for quarter, avg, completed, total in result.all()]

    async def department_performance(self) -> list[tuple[str, float, float, int]]:
        completed_count = func.sum(case((AchievementUpdate.status == ProgressStatus.COMPLETED.value, 1), else_=0))
        total_count = func.count(AchievementUpdate.id)
        result = await self.db.execute(
            select(
                literal("Organization"),
                func.coalesce(func.avg(AchievementUpdate.progress_score), 0),
                case((total_count > 0, (cast(completed_count, Float) / cast(total_count, Float)) * 100), else_=0),
                total_count,
            )
            .select_from(AchievementUpdate),
        )
        return [(department, round(float(avg), 2), round(float(rate), 2), int(total)) for department, avg, rate, total in result.all()]

    async def report_rows(self, current_user: User) -> list[tuple[str, str, str | None, str | None, float, str]]:
        statement = (
            select(
                func.coalesce(User.full_name, User.email),
                Goal.title,
                Goal.target,
                AchievementUpdate.actual_value,
                AchievementUpdate.progress_score,
                AchievementUpdate.status,
            )
            .join(Goal, Goal.employee_id == User.id)
            .join(AchievementUpdate, AchievementUpdate.goal_id == Goal.id)
            .order_by(User.full_name, Goal.title, AchievementUpdate.quarter)
        )

        if current_user.role == "employee":
            statement = statement.where(User.id == current_user.id)
        elif current_user.role == "manager":
            statement = statement.where(User.manager_id == current_user.id)

        result = await self.db.execute(statement)
        return [(employee, goal, target, actual, float(progress), status) for employee, goal, target, actual, progress, status in result.all()]
