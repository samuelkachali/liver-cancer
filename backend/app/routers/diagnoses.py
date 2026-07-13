import base64
import logging
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
from app.schemas import DiagnosisCreate, DiagnosisResponse, DiagnosisUpdate, RunAiRequest

router = APIRouter(prefix="/diagnoses", tags=["diagnoses"])

logger = logging.getLogger(__name__)

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
    payload: RunAiRequest,
    db: AsyncSession = Depends(get_db),
    doctor: User = Depends(require_roles(UserRole.doctor)),
) -> Diagnosis:
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    if patient.assigned_doctor_id != doctor.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Patient not assigned to you")

    image_data_url = payload.image or patient.file_url
    if not image_data_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image available for AI diagnosis. Upload a scan or patient image first.",
        )

    try:
        from app.ml.model import decode_data_url, run_diagnosis

        image_bytes = decode_data_url(image_data_url)
        ai = run_diagnosis(image_bytes)
    except Exception as exc:
        logger.exception("AI diagnosis failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI diagnosis failed: {exc}",
        ) from exc

    overlay_data_url = f"data:image/png;base64,{base64.b64encode(ai['overlay_png']).decode()}"

    diagnosis = Diagnosis(
        patient_id=patient.id,
        doctor_id=doctor.id,
        cancer_type=ai["cancer_type"],
        confidence=ai["confidence"],
        scan_url=overlay_data_url,
        notes=f"Tumor detected: {ai['tumor_detected']}. Tumor coverage: {ai['coverage']:.4f}",
        status=DiagnosisStatus.pending,
    )
    db.add(diagnosis)
    await db.commit()
    await db.refresh(diagnosis)

    await log_action(
        db=db,
        actor_id=doctor.id,
        action="run_ai_diagnosis",
        resource_type="diagnosis",
        resource_id=diagnosis.id,
        details={"patient_id": str(patient.id), "cancer_type": ai["cancer_type"], "tumor_detected": ai["tumor_detected"]},
    )

    return diagnosis


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
