import asyncio

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.models.achievement import AchievementUpdate
from app.models.checkin import ManagerCheckin
from app.models.goal import Goal
from app.models.user import User


DEMO_USERS = [
    {
        "email": "manager@demo.com",
        "password": "Manager123",
        "full_name": "Maya Manager",
        "role": "manager",
    },
    {
        "email": "admin@demo.com",
        "password": "Admin123",
        "full_name": "Aarav Admin",
        "role": "admin",
    },
]


async def get_user(email: str) -> User | None:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()


async def ensure_user(
    email: str,
    password: str,
    full_name: str,
    role: str,
    manager_id: int | None = None,
) -> User:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if user:
            user.hashed_password = hash_password(password)
            user.full_name = full_name
            user.role = role
            user.manager_id = manager_id
            user.is_active = True
            await session.commit()
            await session.refresh(user)
            return user

        user = User(
            email=email,
            hashed_password=hash_password(password),
            full_name=full_name,
            role=role,
            manager_id=manager_id,
            is_active=True,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user


async def ensure_goal(
    employee_id: int,
    title: str,
    target: str,
    uom: str,
    uom_type: str,
    weightage: int,
    status: str,
    manager_comment: str | None = None,
) -> Goal:
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Goal).where(Goal.employee_id == employee_id, Goal.title == title),
        )
        goal = result.scalar_one_or_none()
        if goal:
            goal.target = target
            goal.uom = uom
            goal.uom_type = uom_type
            goal.weightage = weightage
            goal.status = status
            goal.is_locked = status == "approved"
            goal.manager_comment = manager_comment
            await session.commit()
            await session.refresh(goal)
            return goal

        goal = Goal(
            employee_id=employee_id,
            title=title,
            description=f"Demo goal for {title.lower()}",
            target=target,
            uom=uom,
            uom_type=uom_type,
            weightage=weightage,
            status=status,
            is_locked=status == "approved",
            manager_comment=manager_comment,
        )
        session.add(goal)
        await session.commit()
        await session.refresh(goal)
        return goal


async def ensure_achievement(goal: Goal, quarter: str, actual_value: str, progress_score: float) -> AchievementUpdate:
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(AchievementUpdate).where(
                AchievementUpdate.goal_id == goal.id,
                AchievementUpdate.quarter == quarter,
            ),
        )
        achievement = result.scalar_one_or_none()
        if achievement:
            return achievement

        achievement = AchievementUpdate(
            goal_id=goal.id,
            quarter=quarter,
            planned_value=goal.target,
            actual_value=actual_value,
            progress_score=progress_score,
            status="completed" if progress_score >= 100 else "on_track",
            employee_comment="Demo quarterly progress update.",
        )
        session.add(achievement)
        await session.commit()
        await session.refresh(achievement)
        return achievement


async def ensure_checkin(achievement: AchievementUpdate, manager_id: int) -> None:
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(ManagerCheckin).where(ManagerCheckin.achievement_id == achievement.id),
        )
        if result.scalar_one_or_none():
            return

        session.add(
            ManagerCheckin(
                achievement_id=achievement.id,
                manager_comment="Great progress. Keep the momentum through the next quarter.",
                reviewed_by=manager_id,
            ),
        )
        await session.commit()


async def seed_demo() -> None:
    manager = await ensure_user(**DEMO_USERS[0])
    await ensure_user(**DEMO_USERS[1])
    employee = await ensure_user(
        email="employee@demo.com",
        password="Employee123",
        full_name="Eva Employee",
        role="employee",
        manager_id=manager.id,
    )

    approved_goal = await ensure_goal(
        employee_id=employee.id,
        title="Improve customer onboarding activation",
        target="85",
        uom="Activation %",
        uom_type="percent",
        weightage=40,
        status="approved",
        manager_comment="Approved for Q2 tracking.",
    )
    await ensure_goal(
        employee_id=employee.id,
        title="Reduce production incidents",
        target="0",
        uom="Incidents",
        uom_type="zero_based",
        weightage=30,
        status="submitted",
    )
    await ensure_goal(
        employee_id=employee.id,
        title="Complete analytics rollout",
        target="2026-06-30",
        uom="Deadline",
        uom_type="timeline",
        weightage=30,
        status="rework",
        manager_comment="Clarify rollout milestones.",
    )

    q1 = await ensure_achievement(approved_goal, "Q1", "74", 87.06)
    q2 = await ensure_achievement(approved_goal, "Q2", "81", 95.29)
    await ensure_checkin(q1, manager.id)
    await ensure_checkin(q2, manager.id)

    print("Demo data ready: employee@demo.com, manager@demo.com, admin@demo.com")


if __name__ == "__main__":
    asyncio.run(seed_demo())
