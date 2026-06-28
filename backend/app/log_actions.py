import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.log import AuditLog


async def log_action(
    db: AsyncSession,
    actor_id: uuid.UUID,
    action: str,
    resource_type: str | None = None,
    resource_id: uuid.UUID | None = None,
    details: dict | None = None,
) -> None:
    try:
        db.add(
            AuditLog(
                actor_id=actor_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                details=details or {},
            )
        )
        await db.commit()
    except Exception:
        try:
            await db.rollback()
        except Exception:
            pass
