from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.models.diagnosis import DiagnosisStatus
from app.models.user import UserRole, UserStatus


class UserRegister(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    role: UserRole
    specialization: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    role: UserRole
    status: UserStatus
    specialization: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class PatientCreate(BaseModel):
    hospital_number: str = Field(min_length=3, max_length=50)
    name: str = Field(min_length=2, max_length=255)
    age: int = Field(ge=1, le=149)
    gender: str = Field(pattern="^(female|male|other)$")
    contact: str | None = None
    address: str | None = None
    symptoms: str | None = None
    file_url: str | None = None
    assigned_doctor_id: UUID | None = None


class PatientUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    age: int | None = Field(default=None, ge=1, le=149)
    gender: str | None = Field(default=None, pattern="^(female|male|other)$")
    contact: str | None = None
    address: str | None = None
    symptoms: str | None = None
    file_url: str | None = None
    assigned_doctor_id: UUID | None = None


class PatientResponse(BaseModel):
    id: UUID
    hospital_number: str
    name: str
    age: int
    gender: str
    contact: str | None
    address: str | None
    symptoms: str | None
    file_url: str | None
    created_by: UUID
    assigned_doctor_id: UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AssignDoctorRequest(BaseModel):
    doctor_id: UUID


class DiagnosisCreate(BaseModel):
    patient_id: UUID
    confidence: Decimal | None = Field(default=None, ge=0, le=100)
    scan_url: str | None = None
    notes: str | None = None


class DiagnosisUpdate(BaseModel):
    notes: str | None = None
    status: DiagnosisStatus | None = None


class DiagnosisResponse(BaseModel):
    id: UUID
    patient_id: UUID
    doctor_id: UUID
    cancer_type: str
    confidence: Decimal
    scan_url: str | None
    notes: str | None
    status: DiagnosisStatus
    created_at: datetime

    model_config = {"from_attributes": True}


class DoctorListItem(BaseModel):
    id: UUID
    full_name: str
    email: EmailStr
    specialization: str | None
    assigned_patient_count: int = 0

    model_config = {"from_attributes": True}
