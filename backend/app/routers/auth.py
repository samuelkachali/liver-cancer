import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import (
    blacklist_token,
    create_access_token,
    decode_access_token,
    get_user_by_email,
    hash_password,
    verify_password,
)
from app.database import get_db
from app.dependencies import get_current_user
from app.log_actions import log_action
from app.models.user import User, UserRole, UserStatus
from app.schemas import TokenResponse, UserLogin, UserRegister, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)) -> User:
    email = payload.email.lower()
    existing = await get_user_by_email(db, email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    if payload.role == UserRole.admin:
        admin_count = await db.scalar(select(func.count()).select_from(User).where(User.role == UserRole.admin))
        if admin_count and admin_count > 0:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin accounts must be created by an existing admin",
            )

    user = User(
        email=email,
        full_name=payload.full_name.strip(),
        password_hash=hash_password(payload.password),
        role=payload.role,
        status=UserStatus.pending,
        specialization=payload.specialization,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    user = await get_user_by_email(db, payload.email.lower())
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if user.status == UserStatus.rejected:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account was rejected by admin")

    if user.status == UserStatus.pending:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account pending admin verification",
        )

    token, _, _ = create_access_token(user.id)
    
    await log_action(
        db=db,
        actor_id=user.id,
        action="login",
        resource_type="auth",
        details={"role": user.role.value},
    )
    
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> None:
    try:
        payload = decode_access_token(credentials.credentials)
        jti = uuid.UUID(payload["jti"])
        exp = datetime.fromtimestamp(payload["exp"], tz=UTC)
    except (JWTError, ValueError, KeyError) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    await blacklist_token(db, jti, exp)


@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)) -> User:
    return user
