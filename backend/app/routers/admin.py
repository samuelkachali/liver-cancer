import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import hash_password
from app.database import get_db
from app.dependencies import require_roles
from app.models.patient import Patient
from app.models.user import User, UserRole, UserStatus
from app.schemas import DoctorListItem, UserRegister, UserResponse

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    role: UserRole | None = None,
    status_filter: UserStatus | None = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(UserRole.admin)),
) -> list[User]:
    query = select(User).order_by(User.created_at.desc())
    if role:
        query = query.where(User.role == role)
    if status_filter:
        query = query.where(User.status == status_filter)

    result = await db.execute(query)
    return list(result.scalars().all())


@router.get("/users/pending", response_model=list[UserResponse])
async def list_pending_users(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(UserRole.admin)),
) -> list[User]:
    result = await db.execute(
        select(User).where(User.status == UserStatus.pending).order_by(User.created_at.desc())
    )
    return list(result.scalars().all())


@router.patch("/users/{user_id}/verify", response_model=UserResponse)
async def verify_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(UserRole.admin)),
) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.status = UserStatus.verified
    await db.commit()
    await db.refresh(user)
    return user


@router.patch("/users/{user_id}/reject", response_model=UserResponse)
async def reject_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.admin)),
) -> User:
    if user_id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot reject yourself")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.status = UserStatus.rejected
    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.admin)),
) -> None:
    if user_id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot remove yourself")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    await db.delete(user)
    await db.commit()


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserRegister,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(UserRole.admin)),
) -> User:
    email = payload.email.lower()
    existing = await db.execute(select(User).where(User.email == email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=email,
        full_name=payload.full_name.strip(),
        password_hash=hash_password(payload.password),
        role=payload.role,
        status=UserStatus.verified,
        specialization=payload.specialization,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/doctors", response_model=list[DoctorListItem])
async def list_doctors(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(UserRole.nurse, UserRole.admin)),
) -> list[DoctorListItem]:
    doctors_result = await db.execute(
        select(User).where(User.role == UserRole.doctor, User.status == UserStatus.verified)
    )
    doctors = list(doctors_result.scalars().all())

    items: list[DoctorListItem] = []
    for doctor in doctors:
        count = await db.scalar(
            select(func.count()).select_from(Patient).where(Patient.assigned_doctor_id == doctor.id)
        )
        items.append(
            DoctorListItem(
                id=doctor.id,
                full_name=doctor.full_name,
                email=doctor.email,
                specialization=doctor.specialization,
                assigned_patient_count=count or 0,
            )
        )
    return items
