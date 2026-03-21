from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AdminProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    full_name: str
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None


class AdminUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    role: str
    is_active: bool
    auth_provider: str
    email_verified_at: datetime | None
    last_login_at: datetime | None
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None


class UserStatusUpdate(BaseModel):
    is_active: bool


class SoftDeleteResponse(BaseModel):
    message: str


class DashboardSummaryOut(BaseModel):
    total_users: int
    total_patients: int
    total_doctors: int
    total_cases: int
    total_reports: int
    total_chat_sessions: int
    total_retargeting_sessions: int


class AdminCaseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_profile_id: int
    uploaded_by_user_id: int
    modality: str
    image_path: str
    status: str
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None