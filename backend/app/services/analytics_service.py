import csv
from io import BytesIO, StringIO
from typing import Literal

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.goal import GoalStatus
from app.models.user import User
from app.repositories.analytics_repository import AnalyticsRepository
from app.schemas.analytics import (
    CompletionMetricsResponse,
    DepartmentPerformancePoint,
    DistributionResponse,
    EmployeeAnalyticsResponse,
    EmployeeTrendsResponse,
    HeatmapCell,
    OrgAnalyticsResponse,
    QuarterTrend,
    StatusCount,
    TeamAnalyticsResponse,
    TeamPerformancePoint,
    TeamStatusResponse,
)


class AnalyticsService:
    def __init__(self, db: AsyncSession) -> None:
        self.repository = AnalyticsRepository(db)

    async def get_employee_analytics(self, user: User) -> EmployeeAnalyticsResponse:
        total_goals = await self.repository.count_employee_goals(user.id)
        approved_goals = await self.repository.count_employee_goals(user.id, GoalStatus.APPROVED.value)
        completed_goals = await self.repository.count_employee_completed_updates(user.id)
        average_progress = await self.repository.employee_average_progress(user.id)
        trends = self._trend_rows(await self.repository.employee_quarterly_trends(user.id))
        completed_updates = sum(item.completed for item in trends)
        total_updates = sum(item.total for item in trends)

        return EmployeeAnalyticsResponse(
            total_goals=total_goals,
            approved_goals=approved_goals,
            completed_goals=completed_goals,
            average_progress=average_progress,
            quarterly_completion=self._percentage(completed_updates, total_updates),
            status_distribution=self._status_rows(await self.repository.employee_status_distribution(user.id)),
            quarterly_trends=trends,
        )

    async def get_employee_trends(self, user: User) -> EmployeeTrendsResponse:
        return EmployeeTrendsResponse(
            quarterly_trends=self._trend_rows(await self.repository.employee_quarterly_trends(user.id)),
        )

    async def get_team_analytics(self, user: User) -> TeamAnalyticsResponse:
        checked_in, approved_goals = await self.repository.team_checkin_counts(user.id)
        return TeamAnalyticsResponse(
            team_size=await self.repository.team_size(user.id),
            pending_approvals=await self.repository.count_team_goals(user.id, GoalStatus.SUBMITTED.value),
            rework_requests=await self.repository.count_team_goals(user.id, GoalStatus.REWORK.value),
            team_average_progress=await self.repository.team_average_progress(user.id),
            checkin_completion=self._percentage(checked_in, approved_goals),
            team_performance=[
                TeamPerformancePoint(
                    employee_id=employee_id,
                    employee=employee,
                    average_progress=average,
                    completion_rate=completion_rate,
                    total_updates=total_updates,
                )
                for employee_id, employee, average, completion_rate, total_updates in await self.repository.team_performance(user.id)
            ],
            status_distribution=self._status_rows(await self.repository.team_status_distribution(user.id)),
            heatmap=[
                HeatmapCell(employee=employee, quarter=quarter, status=status)
                for employee, quarter, status in await self.repository.team_heatmap(user.id)
            ],
        )

    async def get_team_status(self, user: User) -> TeamStatusResponse:
        return TeamStatusResponse(
            status_distribution=self._status_rows(await self.repository.team_status_distribution(user.id)),
        )

    async def get_org_analytics(self) -> OrgAnalyticsResponse:
        completed, total = await self.repository.org_completion_counts()
        return OrgAnalyticsResponse(
            organization_completion_rate=self._percentage(completed, total),
            total_employees=await self.repository.total_employees(),
            active_goals=await self.repository.active_goals(),
            pending_reviews=await self.repository.org_goal_count(GoalStatus.SUBMITTED.value),
            escalations=await self.repository.org_goal_count(GoalStatus.REWORK.value)
            + await self.repository.org_goal_count(GoalStatus.REJECTED.value),
            department_performance=[
                DepartmentPerformancePoint(
                    department=department,
                    average_progress=average,
                    completion_rate=completion_rate,
                    total_updates=total_updates,
                )
                for department, average, completion_rate, total_updates in await self.repository.department_performance()
            ],
            status_distribution=self._status_rows(await self.repository.org_status_distribution()),
            quarterly_trends=self._trend_rows(await self.repository.org_quarterly_trends()),
        )

    async def get_completion_metrics(self) -> CompletionMetricsResponse:
        completed, total = await self.repository.org_completion_counts()
        return CompletionMetricsResponse(
            completion_rate=self._percentage(completed, total),
            completed_updates=completed,
            total_updates=total,
        )

    async def get_distribution(self) -> DistributionResponse:
        return DistributionResponse(
            status_distribution=self._status_rows(await self.repository.org_status_distribution()),
        )

    async def export_report(self, user: User, file_format: Literal["csv", "xlsx"]) -> tuple[bytes, str, str]:
        rows = await self.repository.report_rows(user)
        headers = ["employee", "goal", "target", "achievement", "progress", "status"]

        if file_format == "csv":
            output = StringIO()
            writer = csv.writer(output)
            writer.writerow(headers)
            writer.writerows(rows)
            return output.getvalue().encode("utf-8"), "text/csv", "goalsync-report.csv"

        try:
            from openpyxl import Workbook
        except ImportError as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Excel export dependency is not installed",
            ) from exc

        workbook = Workbook()
        worksheet = workbook.active
        worksheet.title = "GoalSync Report"
        worksheet.append(headers)
        for row in rows:
            worksheet.append(row)

        output = BytesIO()
        workbook.save(output)
        return (
            output.getvalue(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "goalsync-report.xlsx",
        )

    def _status_rows(self, rows: list[tuple[str, int]]) -> list[StatusCount]:
        known_statuses = ["draft", "submitted", "approved", "rework", "rejected"]
        counts = {status: count for status, count in rows}
        return [StatusCount(status=status, count=counts.get(status, 0)) for status in known_statuses]

    def _trend_rows(self, rows: list[tuple[str, float, int, int]]) -> list[QuarterTrend]:
        trend_map = {
            quarter: QuarterTrend(
                quarter=quarter,
                average_progress=average,
                completed=completed,
                total=total,
            )
            for quarter, average, completed, total in rows
        }
        return [
            trend_map.get(
                quarter,
                QuarterTrend(quarter=quarter, average_progress=0, completed=0, total=0),
            )
            for quarter in ["Q1", "Q2", "Q3", "Q4"]
        ]

    def _percentage(self, numerator: int, denominator: int) -> float:
        if denominator <= 0:
            return 0
        return round((numerator / denominator) * 100, 2)
