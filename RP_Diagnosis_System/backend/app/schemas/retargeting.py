from datetime import datetime
from typing import Any, Literal
from pydantic import BaseModel, field_validator

from pydantic import BaseModel, ConfigDict


class RetargetingSessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_profile_id: int
    created_by_user_id: int
    source_image_path: str
    source_image_type: str | None
    status: str
    accepted_iteration_id: int | None
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None


class RetargetingSessionCreate(BaseModel):
    source_image_type: str | None = None


class RetargetingSessionUpdate(BaseModel):
    status: Literal["in_progress", "accepted", "cancelled"] | None = None
    accepted_iteration_id: int | None = None


class RetargetingIterationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: int
    model_registry_id: int | None
    model_name: str
    model_version: str | None
    output_image_path: str
    parameters_json: dict[str, Any] | None
    feedback_text: str | None
    feedback_rating: str | None
    is_accepted: bool
    created_at: datetime
    updated_at: datetime


class RetargetingIterationCreate(BaseModel):
    model_registry_id: int | None = None
    model_name: str
    model_version: str | None = None
    parameters_json: dict[str, Any] | None = None

    @field_validator("model_registry_id")
    @classmethod
    def normalize_model_registry_id(cls, value: int | None) -> int | None:
        if value == 0:
            return None
        return value


class RetargetingIterationFeedbackUpdate(BaseModel):
    feedback_text: str | None = None
    feedback_rating: str | None = None
    is_accepted: bool | None = None