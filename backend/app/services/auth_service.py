from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self.repository = UserRepository(db)

    async def register(self, payload: UserCreate) -> User:
        return await self.repository.create(payload, hash_password(payload.password))

    async def authenticate(self, email: str, password: str) -> User | None:
        user = await self.repository.get_by_email(email)
        if user is None or not verify_password(password, user.hashed_password):
            return None
        return user
