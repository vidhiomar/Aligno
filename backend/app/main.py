from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.models import achievement, audit, checkin, goal, user  # noqa: F401
from app.utils.seed_demo import seed_demo


def _sqlite_columns(connection, table_name: str) -> set[str]:
    rows = connection.exec_driver_sql(f"PRAGMA table_info({table_name})").fetchall()
    return {row[1] for row in rows}


def _add_column_if_missing(connection, table_name: str, column_name: str, definition: str) -> None:
    if column_name not in _sqlite_columns(connection, table_name):
        connection.exec_driver_sql(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {definition}")


def ensure_mvp_sqlite_columns(connection) -> None:
    if not settings.database_url.startswith("sqlite"):
        return

    user_columns = _sqlite_columns(connection, "users")
    if user_columns:
        _add_column_if_missing(connection, "users", "role", "VARCHAR(32) NOT NULL DEFAULT 'employee'")
        _add_column_if_missing(connection, "users", "manager_id", "INTEGER")

    goal_columns = _sqlite_columns(connection, "goals")
    if goal_columns:
        _add_column_if_missing(connection, "goals", "thrust_area", "VARCHAR(255)")
        _add_column_if_missing(connection, "goals", "uom_type", "VARCHAR(32) NOT NULL DEFAULT 'numeric'")
        _add_column_if_missing(connection, "goals", "shared_goal_group_id", "VARCHAR(64)")
        _add_column_if_missing(connection, "goals", "shared_source_goal_id", "INTEGER")
        _add_column_if_missing(connection, "goals", "primary_owner_id", "INTEGER")


async def prepare_mvp_database() -> None:
    if settings.create_tables_on_startup:
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)
            await connection.run_sync(ensure_mvp_sqlite_columns)

    if settings.seed_demo_data:
        await seed_demo()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        debug=settings.debug,
        version="0.1.0",
        openapi_url=f"{settings.api_v1_prefix}/openapi.json",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix=settings.api_v1_prefix)

    @app.on_event("startup")
    async def on_startup() -> None:
        await prepare_mvp_database()

    return app


app = create_app()
