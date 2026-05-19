import os
from functools import lru_cache


def _get_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.lower() in {"1", "true", "yes", "on"}


class Settings:
    app_name: str = os.getenv("APP_NAME", "Aligno")
    environment: str = os.getenv("ENVIRONMENT", "development")
    debug: bool = _get_bool("DEBUG", True)
    api_v1_prefix: str = os.getenv("API_V1_PREFIX", "/api/v1")
    backend_cors_origins: str = os.getenv("BACKEND_CORS_ORIGINS", "https://aligno.vercel.app,")
    create_tables_on_startup: bool = _get_bool("CREATE_TABLES_ON_STARTUP", True)
    seed_demo_data: bool = _get_bool("SEED_DEMO_DATA", True)

    database_url: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./goalsync.db")

    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "change-me-in-production")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.backend_cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
