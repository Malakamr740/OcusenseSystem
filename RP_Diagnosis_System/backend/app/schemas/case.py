from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class CaseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_profile_id: int
    uploaded_by_user_id: int
    modality: str
    image_path: str
    status: str
    metadata_json: dict[str, Any] | None
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None