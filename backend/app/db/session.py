from collections.abc import AsyncGenerator, Callable
from typing import Any

from sqlalchemy import create_engine
from sqlalchemy.engine import Connection
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings


def _sync_database_url(database_url: str) -> str:
    if database_url.startswith("sqlite+aiosqlite://"):
        return database_url.replace("sqlite+aiosqlite://", "sqlite://", 1)
    return database_url


sync_engine = create_engine(_sync_database_url(settings.database_url), pool_pre_ping=True)
SyncSessionLocal = sessionmaker(bind=sync_engine, expire_on_commit=False, class_=Session)


class AsyncConnectionAdapter:
    def __init__(self, connection: Connection) -> None:
        self.connection = connection

    async def run_sync(self, fn: Callable[..., Any]) -> Any:
        return fn(self.connection)


class AsyncBeginContext:
    def __init__(self) -> None:
        self.context = sync_engine.begin()
        self.connection: Connection | None = None

    async def __aenter__(self) -> AsyncConnectionAdapter:
        self.connection = self.context.__enter__()
        return AsyncConnectionAdapter(self.connection)

    async def __aexit__(self, exc_type: object, exc: object, traceback: object) -> None:
        self.context.__exit__(exc_type, exc, traceback)


class AsyncEngineAdapter:
    def begin(self) -> AsyncBeginContext:
        return AsyncBeginContext()


class AsyncSessionAdapter:
    def __init__(self) -> None:
        self.session = SyncSessionLocal()

    async def __aenter__(self) -> "AsyncSessionAdapter":
        return self

    async def __aexit__(self, exc_type: object, exc: object, traceback: object) -> None:
        self.session.close()

    def add(self, instance: object) -> None:
        self.session.add(instance)

    def add_all(self, instances: list[object]) -> None:
        self.session.add_all(instances)

    async def execute(self, statement: object) -> Any:
        return self.session.execute(statement)

    async def scalar(self, statement: object) -> Any:
        return self.session.scalar(statement)

    async def commit(self) -> None:
        self.session.commit()

    async def refresh(self, instance: object) -> None:
        self.session.refresh(instance)

    async def delete(self, instance: object) -> None:
        self.session.delete(instance)

    async def get(self, model: type, identity: object) -> Any:
        return self.session.get(model, identity)

    async def rollback(self) -> None:
        self.session.rollback()


engine = AsyncEngineAdapter()


def AsyncSessionLocal() -> AsyncSessionAdapter:
    return AsyncSessionAdapter()


async def get_db() -> AsyncGenerator[AsyncSessionAdapter, None]:
    async with AsyncSessionLocal() as session:
        yield session
