from pydantic import BaseModel


class KpiMetric(BaseModel):
    label: str
    value: float | int | str


class StatusCount(BaseModel):
    status: str
    count: int


class QuarterTrend(BaseModel):
    quarter: str
    average_progress: float
    completed: int
    total: int


class TeamPerformancePoint(BaseModel):
    employee_id: int | None = None
    employee: str
    average_progress: float
    completion_rate: float
    total_updates: int


class DepartmentPerformancePoint(BaseModel):
    department: str
    average_progress: float
    completion_rate: float
    total_updates: int


class HeatmapCell(BaseModel):
    employee: str
    quarter: str
    status: str


class EmployeeAnalyticsResponse(BaseModel):
    total_goals: int
    approved_goals: int
    completed_goals: int
    average_progress: float
    quarterly_completion: float
    status_distribution: list[StatusCount]
    quarterly_trends: list[QuarterTrend]


class EmployeeTrendsResponse(BaseModel):
    quarterly_trends: list[QuarterTrend]


class TeamAnalyticsResponse(BaseModel):
    team_size: int
    pending_approvals: int
    rework_requests: int
    team_average_progress: float
    checkin_completion: float
    team_performance: list[TeamPerformancePoint]
    status_distribution: list[StatusCount]
    heatmap: list[HeatmapCell]


class TeamStatusResponse(BaseModel):
    status_distribution: list[StatusCount]


class OrgAnalyticsResponse(BaseModel):
    organization_completion_rate: float
    total_employees: int
    active_goals: int
    pending_reviews: int
    escalations: int
    department_performance: list[DepartmentPerformancePoint]
    status_distribution: list[StatusCount]
    quarterly_trends: list[QuarterTrend]


class CompletionMetricsResponse(BaseModel):
    completion_rate: float
    completed_updates: int
    total_updates: int


class DistributionResponse(BaseModel):
    status_distribution: list[StatusCount]
