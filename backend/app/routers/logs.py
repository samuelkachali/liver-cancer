import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_roles
from app.log_actions import log_action
from app.models.log import AuditLog
from app.models.user import User, UserRole
from app.schemas import LogResponse

router = APIRouter(prefix="/logs", tags=["logs"])


@router.get("", response_model=list[LogResponse])
async def list_logs(
    action: str | None = Query(default=None),
    resource_type: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.admin)),
) -> list[LogResponse]:
    query = select(AuditLog).order_by(AuditLog.created_at.desc())
    if action:
        query = query.where(AuditLog.action == action)
    if resource_type:
        query = query.where(AuditLog.resource_type == resource_type)
    query = query.limit(limit).offset(offset)

    result = await db.execute(query)
    logs = list(result.scalars().all())
    if logs and admin:
        await log_action(
            db=db,
            actor_id=admin.id,
            action="list_logs",
            resource_type="audit_logs",
            details={"count": len(logs), "action_filter": action, "resource_type_filter": resource_type},
        )
    return [LogResponse.model_validate(log) for log in logs]
