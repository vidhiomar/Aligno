from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin, get_current_manager, get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.analytics import (
    CompletionMetricsResponse,
    DistributionResponse,
    EmployeeAnalyticsResponse,
    EmployeeTrendsResponse,
    OrgAnalyticsResponse,
    TeamAnalyticsResponse,
    TeamStatusResponse,
)
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/me", response_model=EmployeeAnalyticsResponse)
async def get_my_analytics(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> EmployeeAnalyticsResponse:
    return await AnalyticsService(db).get_employee_analytics(current_user)


@router.get("/me/trends", response_model=EmployeeTrendsResponse)
async def get_my_trends(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> EmployeeTrendsResponse:
    return await AnalyticsService(db).get_employee_trends(current_user)


@router.get("/team", response_model=TeamAnalyticsResponse)
async def get_team_analytics(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_manager)],
) -> TeamAnalyticsResponse:
    return await AnalyticsService(db).get_team_analytics(current_user)


@router.get("/team/status", response_model=TeamStatusResponse)
async def get_team_status(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_manager)],
) -> TeamStatusResponse:
    return await AnalyticsService(db).get_team_status(current_user)


@router.get("/org", response_model=OrgAnalyticsResponse)
async def get_org_analytics(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(get_current_admin)],
) -> OrgAnalyticsResponse:
    return await AnalyticsService(db).get_org_analytics()


@router.get("/completion", response_model=CompletionMetricsResponse)
async def get_completion_metrics(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(get_current_admin)],
) -> CompletionMetricsResponse:
    return await AnalyticsService(db).get_completion_metrics()


@router.get("/distribution", response_model=DistributionResponse)
async def get_distribution(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(get_current_admin)],
) -> DistributionResponse:
    return await AnalyticsService(db).get_distribution()
