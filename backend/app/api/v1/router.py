from fastapi import APIRouter

from app.api.v1 import admin, analytics, checkins, manager, reports
from app.api.v1.routes import auth, goals, health

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(goals.router)
api_router.include_router(manager.router)
api_router.include_router(checkins.router)
api_router.include_router(analytics.router)
api_router.include_router(reports.router)
api_router.include_router(admin.router)
