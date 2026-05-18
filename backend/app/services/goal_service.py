from datetime import UTC, datetime
from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit import AuditLog
from app.models.goal import Goal, GoalStatus
from app.models.user import User
from app.repositories.goal_repository import GoalRepository
from app.schemas.goal import GoalCreate, GoalUpdate, SharedGoalCreate


class GoalService:
    def __init__(self, db: AsyncSession) -> None:
        self.repository = GoalRepository(db)

    async def list_my_approved_goals(self, current_user: User) -> list[Goal]:
        return await self.repository.list_approved_for_employee(current_user.id)

    async def list_my_goals(self, current_user: User) -> list[Goal]:
        return await self.repository.list_for_employee(current_user.id)

    async def create_goal(self, payload: GoalCreate, current_user: User) -> Goal:
        await self._ensure_goal_limit(current_user.id)
        goal = Goal(
            employee_id=current_user.id,
            title=payload.title,
            thrust_area=payload.thrust_area,
            description=payload.description,
            target=payload.target,
            uom=payload.uom,
            uom_type=payload.uom_type,
            weightage=payload.weightage,
        )
        return await self.repository.create(goal)

    async def submit_goal_sheet(self, current_user: User) -> list[Goal]:
        goals = await self.repository.list_for_employee(current_user.id)
        editable_goals = [
            goal for goal in goals if goal.status in {GoalStatus.DRAFT.value, GoalStatus.REWORK.value}
        ]
        if not editable_goals:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No draft or rework goals are available to submit",
            )

        self._validate_goal_sheet([goal for goal in goals if goal.status != GoalStatus.REJECTED.value])
        now = datetime.now(UTC)
        for goal in editable_goals:
            goal.status = GoalStatus.SUBMITTED.value
            goal.submitted_at = now
            goal.manager_comment = None

        # Save through the existing repository pattern without adding a bulk abstraction.
        for goal in editable_goals:
            await self.repository.save(goal)
        return editable_goals

    async def update_goal(self, goal_id: int, payload: GoalUpdate, current_user: User) -> Goal:
        goal = await self._get_owned_goal(goal_id, current_user)
        self._ensure_unlocked(goal, current_user)
        self._ensure_editable_status(goal)

        update_data = payload.model_dump(exclude_unset=True)
        self._ensure_shared_goal_edit_allowed(goal, update_data, current_user)
        old_values = {field: getattr(goal, field) for field in update_data}
        for field, value in update_data.items():
            setattr(goal, field, value)

        if goal.is_locked:
            await self.repository.add_audit_logs(
                [
                    AuditLog(
                        goal_id=goal.id,
                        changed_by=current_user.id,
                        field_name=field,
                        old_value=None if old_values[field] is None else str(old_values[field]),
                        new_value=None if value is None else str(value),
                    )
                    for field, value in update_data.items()
                    if old_values[field] != value
                ],
            )
        return await self.repository.save(goal)

    async def create_shared_goal(self, payload: SharedGoalCreate, current_user: User) -> list[Goal]:
        if current_user.role not in {"manager", "admin"}:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Manager or admin access required")
        if payload.primary_owner_id not in payload.employee_ids:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Primary owner must be included in employee_ids",
            )

        group_id = str(uuid4())
        created_goals: list[Goal] = []
        for employee_id in payload.employee_ids:
            await self._ensure_goal_limit(employee_id)
            created_goals.append(
                Goal(
                    employee_id=employee_id,
                    title=payload.title,
                    thrust_area=payload.thrust_area,
                    description=payload.description,
                    target=payload.target,
                    uom=payload.uom,
                    uom_type=payload.uom_type,
                    weightage=payload.weightage,
                    shared_goal_group_id=group_id,
                    primary_owner_id=payload.primary_owner_id,
                ),
            )

        goals = await self.repository.create_many(created_goals)
        primary_goal = next(goal for goal in goals if goal.employee_id == payload.primary_owner_id)
        for goal in goals:
            if goal.id != primary_goal.id:
                goal.shared_source_goal_id = primary_goal.id
                await self.repository.save(goal)
        return goals

    async def delete_goal(self, goal_id: int, current_user: User) -> None:
        goal = await self._get_owned_goal(goal_id, current_user)
        self._ensure_unlocked(goal, current_user)
        self._ensure_editable_status(goal)
        await self.repository.delete(goal)

    async def _get_owned_goal(self, goal_id: int, current_user: User) -> Goal:
        goal = await self.repository.get_by_id(goal_id)
        if goal is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
        if current_user.role != "admin" and goal.employee_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Goal access denied")
        return goal

    def _ensure_unlocked(self, goal: Goal, current_user: User) -> None:
        if goal.is_locked and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Approved goals are locked and cannot be modified",
            )

    def _ensure_editable_status(self, goal: Goal) -> None:
        if goal.is_locked:
            return
        if goal.status not in {GoalStatus.DRAFT.value, GoalStatus.REWORK.value}:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Only draft or rework goals can be edited",
            )

    def _ensure_shared_goal_edit_allowed(
        self,
        goal: Goal,
        update_data: dict[str, object],
        current_user: User,
    ) -> None:
        if current_user.role == "admin":
            return
        if goal.shared_goal_group_id and goal.primary_owner_id != current_user.id:
            blocked_fields = set(update_data) - {"weightage"}
            if blocked_fields:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Shared goal recipients can only adjust weightage",
                )

    async def _ensure_goal_limit(self, employee_id: int) -> None:
        goal_count = await self.repository.count_for_employee(employee_id)
        if goal_count >= 8:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Employees can have a maximum of 8 goals",
            )

    def _validate_goal_sheet(self, goals: list[Goal]) -> None:
        if len(goals) > 8:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A goal sheet can contain a maximum of 8 goals",
            )
        if any(goal.weightage < 10 for goal in goals):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Each goal must have at least 10% weightage",
            )
        total_weightage = sum(goal.weightage for goal in goals)
        if total_weightage != 100:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Total goal weightage must equal 100%",
            )
