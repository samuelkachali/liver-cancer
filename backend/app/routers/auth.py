import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.auth import (
    blacklist_token,
    create_access_token,
    create_reset_token,
    decode_access_token,
    get_user_by_email,
    hash_password,
    verify_password,
    verify_reset_token,
)
from app.database import get_db
from app.dependencies import get_current_user
from app.email import send_email
from app.models.user import User, UserRole, UserStatus
from app.schemas import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)

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


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(
    payload: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)
) -> ForgotPasswordResponse:
    user = await get_user_by_email(db, payload.email.lower())
    if user is None or user.status != UserStatus.verified:
        return ForgotPasswordResponse(
            message="If an account exists for that email, a password reset link has been sent."
        )

    reset_token, _ = create_reset_token(user.id)
    reset_url = f"{settings.app_url.rstrip('/')}/auth/reset-password?token={reset_token}"

    email_sent = await send_email(
        to_email=user.email,
        subject="Reset your MediVision AI password",
        body=(
            f"Hi {user.full_name},\n\n"
            f"We received a request to reset your MediVision AI password.\n"
            f"Use the link below to choose a new password. This link expires in "
            f"{settings.reset_token_expire_minutes} minutes.\n\n"
            f"{reset_url}\n\n"
            f"If you did not request this, you can safely ignore this email."
        ),
    )

    if email_sent:
        return ForgotPasswordResponse(
            message="If an account exists for that email, a password reset link has been sent."
        )

    return ForgotPasswordResponse(
        message="Email sending is not configured. Use the link below to reset your password.",
        dev_reset_token=reset_token,
        dev_reset_url=reset_url,
    )


@router.post("/reset-password", status_code=status.HTTP_204_NO_CONTENT)
async def reset_password(
    payload: ResetPasswordRequest, db: AsyncSession = Depends(get_db)
) -> None:
    try:
        user_id = verify_reset_token(payload.token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.password_hash = hash_password(payload.new_password)
    await db.commit()
