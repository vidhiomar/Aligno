"""Admin API endpoints for audit logs, user management, cycle config, and goal unlock."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.models.audit import AuditLog
from app.models.goal import Goal
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])


# ── Schemas ──────────────────────────────────────────────────────────────

class AuditLogOut(BaseModel):
    id: int
    goal_id: int
    changed_by: int
    field_name: str
    old_value: str | None
    new_value: str | None
    changed_at: str

    class Config:
        from_attributes = True


class AuditLogListResponse(BaseModel):
    logs: list[AuditLogOut]


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str | None
    role: str
    manager_id: int | None
    is_active: bool

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    users: list[UserOut]


class UserUpdatePayload(BaseModel):
    full_name: str | None = None
    role: str | None = None
    manager_id: int | None = None
    is_active: bool | None = None


class GoalUnlockPayload(BaseModel):
    reason: str = "Admin unlock"


class GoalOut(BaseModel):
    id: int
    employee_id: int
    title: str
    status: str
    is_locked: bool
    weightage: int

    class Config:
        from_attributes = True


class CycleConfig(BaseModel):
    id: str
    label: str
    opens: str
    closes: str
    is_active: bool


class CycleListResponse(BaseModel):
    cycles: list[CycleConfig]


class EscalationRule(BaseModel):
    id: str
    condition: str
    days_threshold: int
    escalation_chain: list[str]
    is_active: bool


class EscalationListResponse(BaseModel):
    rules: list[EscalationRule]


class EscalationLog(BaseModel):
    id: str
    rule_id: str
    employee_name: str
    triggered_at: str
    status: str
    resolved_at: str | None


class EscalationLogListResponse(BaseModel):
    logs: list[EscalationLog]


# ── Audit Logs ───────────────────────────────────────────────────────────

@router.get("/audit-logs", response_model=AuditLogListResponse)
async def get_audit_logs(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(get_current_admin)],
) -> AuditLogListResponse:
    result = await db.execute(
        select(AuditLog).order_by(AuditLog.changed_at.desc()).limit(200)
    )
    logs = result.scalars().all()
    return AuditLogListResponse(
        logs=[
            AuditLogOut(
                id=log.id,
                goal_id=log.goal_id,
                changed_by=log.changed_by,
                field_name=log.field_name,
                old_value=log.old_value,
                new_value=log.new_value,
                changed_at=log.changed_at.isoformat() if log.changed_at else "",
            )
            for log in logs
        ]
    )


# ── User Management ─────────────────────────────────────────────────────

@router.get("/users", response_model=UserListResponse)
async def get_users(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(get_current_admin)],
) -> UserListResponse:
    result = await db.execute(select(User).order_by(User.id))
    users = result.scalars().all()
    return UserListResponse(
        users=[
            UserOut(
                id=u.id,
                email=u.email,
                full_name=u.full_name,
                role=u.role,
                manager_id=u.manager_id,
                is_active=u.is_active,
            )
            for u in users
        ]
    )


@router.patch("/users/{user_id}", response_model=UserOut)
async def update_user(
    user_id: int,
    payload: UserUpdatePayload,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(get_current_admin)],
) -> UserOut:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.role is not None:
        user.role = payload.role
    if payload.manager_id is not None:
        user.manager_id = payload.manager_id
    if payload.is_active is not None:
        user.is_active = payload.is_active
    await db.commit()
    await db.refresh(user)
    return UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        manager_id=user.manager_id,
        is_active=user.is_active,
    )


# ── Goal Unlock ──────────────────────────────────────────────────────────

@router.get("/locked-goals")
async def get_locked_goals(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(get_current_admin)],
):
    result = await db.execute(
        select(Goal).where(Goal.is_locked == True).order_by(Goal.id)
    )
    goals = result.scalars().all()
    return {
        "goals": [
            {
                "id": g.id,
                "employee_id": g.employee_id,
                "title": g.title,
                "status": g.status,
                "is_locked": g.is_locked,
                "weightage": g.weightage,
            }
            for g in goals
        ]
    }


@router.post("/goals/{goal_id}/unlock")
async def unlock_goal(
    goal_id: int,
    payload: GoalUnlockPayload,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: Annotated[User, Depends(get_current_admin)],
):
    result = await db.execute(select(Goal).where(Goal.id == goal_id))
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Create audit log for the unlock
    audit = AuditLog(
        goal_id=goal.id,
        changed_by=admin.id,
        field_name="is_locked",
        old_value="true",
        new_value="false",
    )
    db.add(audit)

    goal.is_locked = False
    goal.status = "draft"
    await db.commit()
    return {"message": "Goal unlocked", "goal_id": goal_id}


# ── Cycles (config stored in memory for demo) ───────────────────────────

_DEMO_CYCLES: list[dict] = [
    {"id": "goal_setting", "label": "Phase 1 — Goal Setting", "opens": "2026-05-01", "closes": "2026-05-31", "is_active": True},
    {"id": "q1_checkin", "label": "Q1 Check-in", "opens": "2026-07-01", "closes": "2026-07-31", "is_active": False},
    {"id": "q2_checkin", "label": "Q2 Check-in", "opens": "2026-10-01", "closes": "2026-10-31", "is_active": False},
    {"id": "q3_checkin", "label": "Q3 Check-in", "opens": "2027-01-01", "closes": "2027-01-31", "is_active": False},
    {"id": "q4_annual", "label": "Q4 / Annual Review", "opens": "2027-03-01", "closes": "2027-04-30", "is_active": False},
]


@router.get("/cycles", response_model=CycleListResponse)
async def get_cycles(
    _: Annotated[User, Depends(get_current_admin)],
) -> CycleListResponse:
    return CycleListResponse(cycles=[CycleConfig(**c) for c in _DEMO_CYCLES])


@router.patch("/cycles/{cycle_id}")
async def update_cycle(
    cycle_id: str,
    payload: dict,
    _: Annotated[User, Depends(get_current_admin)],
):
    for cycle in _DEMO_CYCLES:
        if cycle["id"] == cycle_id:
            if "is_active" in payload:
                cycle["is_active"] = payload["is_active"]
            if "opens" in payload:
                cycle["opens"] = payload["opens"]
            if "closes" in payload:
                cycle["closes"] = payload["closes"]
            return cycle
    raise HTTPException(status_code=404, detail="Cycle not found")


# ── Escalation Rules (demo) ─────────────────────────────────────────────

_DEMO_ESCALATION_RULES: list[dict] = [
    {
        "id": "goal_submission",
        "condition": "Employee has not submitted goals",
        "days_threshold": 7,
        "escalation_chain": ["Employee", "Manager", "HR"],
        "is_active": True,
    },
    {
        "id": "manager_approval",
        "condition": "Manager has not approved goals",
        "days_threshold": 5,
        "escalation_chain": ["Manager", "Skip-level Manager", "HR"],
        "is_active": True,
    },
    {
        "id": "checkin_completion",
        "condition": "Quarterly check-in not completed",
        "days_threshold": 10,
        "escalation_chain": ["Employee", "Manager", "HR"],
        "is_active": False,
    },
]

_DEMO_ESCALATION_LOGS: list[dict] = [
    {
        "id": "esc-001",
        "rule_id": "goal_submission",
        "employee_name": "Eva Employee",
        "triggered_at": "2026-05-10T09:00:00",
        "status": "resolved",
        "resolved_at": "2026-05-12T14:30:00",
    },
    {
        "id": "esc-002",
        "rule_id": "manager_approval",
        "employee_name": "Eva Employee",
        "triggered_at": "2026-05-15T09:00:00",
        "status": "pending",
        "resolved_at": None,
    },
]


@router.get("/escalation-rules", response_model=EscalationListResponse)
async def get_escalation_rules(
    _: Annotated[User, Depends(get_current_admin)],
) -> EscalationListResponse:
    return EscalationListResponse(
        rules=[EscalationRule(**r) for r in _DEMO_ESCALATION_RULES]
    )


@router.patch("/escalation-rules/{rule_id}")
async def update_escalation_rule(
    rule_id: str,
    payload: dict,
    _: Annotated[User, Depends(get_current_admin)],
):
    for rule in _DEMO_ESCALATION_RULES:
        if rule["id"] == rule_id:
            if "is_active" in payload:
                rule["is_active"] = payload["is_active"]
            if "days_threshold" in payload:
                rule["days_threshold"] = payload["days_threshold"]
            return rule
    raise HTTPException(status_code=404, detail="Rule not found")


@router.get("/escalation-logs", response_model=EscalationLogListResponse)
async def get_escalation_logs(
    _: Annotated[User, Depends(get_current_admin)],
) -> EscalationLogListResponse:
    return EscalationLogListResponse(
        logs=[EscalationLog(**log) for log in _DEMO_ESCALATION_LOGS]
    )
