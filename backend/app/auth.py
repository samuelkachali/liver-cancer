import uuid
from datetime import UTC, datetime, timedelta

import bcrypt
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.token_blacklist import TokenBlacklist
from app.models.user import User


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())


def create_access_token(user_id: uuid.UUID) -> tuple[str, uuid.UUID, datetime]:
    jti = uuid.uuid4()
    expires_at = datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {
        "sub": str(user_id),
        "jti": str(jti),
        "exp": expires_at,
    }
    token = jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)
    return token, jti, expires_at


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])


def create_reset_token(user_id: uuid.UUID) -> tuple[str, datetime]:
    expires_at = datetime.now(UTC) + timedelta(minutes=settings.reset_token_expire_minutes)
    payload = {
        "sub": str(user_id),
        "type": "reset",
        "exp": expires_at,
    }
    token = jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)
    return token, expires_at


def verify_reset_token(token: str) -> uuid.UUID:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except (JWTError, ValueError) as exc:
        raise ValueError("Invalid or expired reset token") from exc
    if payload.get("type") != "reset":
        raise ValueError("Invalid reset token")
    return uuid.UUID(payload["sub"])


async def is_token_blacklisted(db: AsyncSession, jti: uuid.UUID) -> bool:
    result = await db.execute(select(TokenBlacklist).where(TokenBlacklist.jti == jti))
    return result.scalar_one_or_none() is not None


async def blacklist_token(db: AsyncSession, jti: uuid.UUID, expires_at: datetime) -> None:
    db.add(TokenBlacklist(jti=jti, expires_at=expires_at))
    await db.commit()


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email.lower()))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()
