import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_roles
from app.models.patient import Patient
from app.models.user import User, UserRole, UserStatus
from app.schemas import AssignDoctorRequest, PatientCreate, PatientResponse, PatientUpdate

router = APIRouter(prefix="/patients", tags=["patients"])


async def _get_patient_or_404(db: AsyncSession, patient_id: uuid.UUID) -> Patient:
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return patient


async def _validate_doctor(db: AsyncSession, doctor_id: uuid.UUID) -> None:
    result = await db.execute(
        select(User).where(
            User.id == doctor_id,
            User.role == UserRole.doctor,
            User.status == UserStatus.verified,
        )
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or unverified doctor")


@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(
    payload: PatientCreate,
    db: AsyncSession = Depends(get_db),
    nurse: User = Depends(require_roles(UserRole.nurse)),
) -> Patient:
    existing = await db.execute(select(Patient).where(Patient.hospital_number == payload.hospital_number))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Hospital number already exists")

    if payload.assigned_doctor_id:
        await _validate_doctor(db, payload.assigned_doctor_id)

    patient = Patient(
        hospital_number=payload.hospital_number,
        name=payload.name,
        age=payload.age,
        gender=payload.gender,
        contact=payload.contact,
        address=payload.address,
        symptoms=payload.symptoms,
        file_url=payload.file_url,
        created_by=nurse.id,
        assigned_doctor_id=payload.assigned_doctor_id,
    )
    db.add(patient)
    await db.commit()
    await db.refresh(patient)
    return patient


@router.get("", response_model=list[PatientResponse])
async def list_patients(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_roles(UserRole.nurse, UserRole.doctor, UserRole.admin)),
) -> list[Patient]:
    query = select(Patient).order_by(Patient.created_at.desc())
    if user.role == UserRole.nurse:
        query = query.where(Patient.created_by == user.id)
    elif user.role == UserRole.doctor:
        query = query.where(Patient.assigned_doctor_id == user.id)

    result = await db.execute(query)
    return list(result.scalars().all())


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_roles(UserRole.nurse, UserRole.doctor, UserRole.admin)),
) -> Patient:
    patient = await _get_patient_or_404(db, patient_id)
    if user.role == UserRole.nurse and patient.created_by != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your patient")
    if user.role == UserRole.doctor and patient.assigned_doctor_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Patient not assigned to you")
    return patient


@router.patch("/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: uuid.UUID,
    payload: PatientUpdate,
    db: AsyncSession = Depends(get_db),
    nurse: User = Depends(require_roles(UserRole.nurse)),
) -> Patient:
    patient = await _get_patient_or_404(db, patient_id)
    if patient.created_by != nurse.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your patient")

    updates = payload.model_dump(exclude_unset=True)
    if "assigned_doctor_id" in updates and updates["assigned_doctor_id"]:
        await _validate_doctor(db, updates["assigned_doctor_id"])

    for field, value in updates.items():
        setattr(patient, field, value)

    await db.commit()
    await db.refresh(patient)
    return patient


@router.post("/{patient_id}/assign-doctor", response_model=PatientResponse)
async def assign_doctor(
    patient_id: uuid.UUID,
    payload: AssignDoctorRequest,
    db: AsyncSession = Depends(get_db),
    nurse: User = Depends(require_roles(UserRole.nurse)),
) -> Patient:
    patient = await _get_patient_or_404(db, patient_id)
    if patient.created_by != nurse.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your patient")

    await _validate_doctor(db, payload.doctor_id)
    patient.assigned_doctor_id = payload.doctor_id
    await db.commit()
    await db.refresh(patient)
    return patient
