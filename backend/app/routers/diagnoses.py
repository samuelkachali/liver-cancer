import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_roles
from app.log_actions import log_action
from app.models.diagnosis import Diagnosis, DiagnosisStatus
from app.models.patient import Patient
from app.models.user import User, UserRole
from app.schemas import DiagnosisCreate, DiagnosisResponse, DiagnosisUpdate

router = APIRouter(prefix="/diagnoses", tags=["diagnoses"])

CANCER_TYPE = "liver"


@router.post("", response_model=DiagnosisResponse, status_code=status.HTTP_201_CREATED)
async def create_diagnosis(
    payload: DiagnosisCreate,
    db: AsyncSession = Depends(get_db),
    doctor: User = Depends(require_roles(UserRole.doctor)),
) -> Diagnosis:
    result = await db.execute(select(Patient).where(Patient.id == payload.patient_id))
    patient = result.scalar_one_or_none()
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    if patient.assigned_doctor_id != doctor.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Patient not assigned to you")

    if payload.confidence is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Confidence score is required"
        )
    diagnosis = Diagnosis(
        patient_id=patient.id,
        doctor_id=doctor.id,
        cancer_type=CANCER_TYPE,
        confidence=payload.confidence,
        scan_url=payload.scan_url,
        notes=payload.notes,
        status=DiagnosisStatus.pending,
    )
    db.add(diagnosis)
    await db.commit()
    await db.refresh(diagnosis)
    
    await log_action(
        db=db,
        actor_id=doctor.id,
        action="create_diagnosis",
        resource_type="diagnosis",
        resource_id=diagnosis.id,
        details={"patient_id": str(patient.id), "cancer_type": CANCER_TYPE},
    )
    
    return diagnosis


@router.post("/run-ai/{patient_id}", response_model=DiagnosisResponse, status_code=status.HTTP_201_CREATED)
async def run_ai_diagnosis(
    patient_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    doctor: User = Depends(require_roles(UserRole.doctor)),
    scan_url: str | None = None,
) -> Diagnosis:
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    if patient.assigned_doctor_id != doctor.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Patient not assigned to you")

    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="AI diagnosis endpoint requires integration with ML model. Use POST /diagnoses with explicit confidence instead."
    )


@router.get("", response_model=list[DiagnosisResponse])
async def list_diagnoses(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_roles(UserRole.doctor, UserRole.admin, UserRole.nurse)),
) -> list[Diagnosis]:
    query = select(Diagnosis).order_by(Diagnosis.created_at.desc())
    if user.role == UserRole.doctor:
        query = query.where(Diagnosis.doctor_id == user.id)
    elif user.role == UserRole.nurse:
        query = query.join(Patient).where(Patient.created_by == user.id)

    result = await db.execute(query)
    return list(result.scalars().all())


@router.get("/{diagnosis_id}", response_model=DiagnosisResponse)
async def get_diagnosis(
    diagnosis_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_roles(UserRole.doctor, UserRole.admin, UserRole.nurse)),
) -> Diagnosis:
    result = await db.execute(select(Diagnosis).where(Diagnosis.id == diagnosis_id))
    diagnosis = result.scalar_one_or_none()
    if diagnosis is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diagnosis not found")

    if user.role == UserRole.doctor and diagnosis.doctor_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your diagnosis")

    if user.role == UserRole.nurse:
        patient_result = await db.execute(select(Patient).where(Patient.id == diagnosis.patient_id))
        patient = patient_result.scalar_one_or_none()
        if patient is None or patient.created_by != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your patient")

    return diagnosis


@router.patch("/{diagnosis_id}", response_model=DiagnosisResponse)
async def update_diagnosis(
    diagnosis_id: uuid.UUID,
    payload: DiagnosisUpdate,
    db: AsyncSession = Depends(get_db),
    doctor: User = Depends(require_roles(UserRole.doctor)),
) -> Diagnosis:
    result = await db.execute(select(Diagnosis).where(Diagnosis.id == diagnosis_id))
    diagnosis = result.scalar_one_or_none()
    if diagnosis is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diagnosis not found")
    if diagnosis.doctor_id != doctor.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your diagnosis")

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(diagnosis, field, value)

    await db.commit()
    await db.refresh(diagnosis)
    return diagnosis
