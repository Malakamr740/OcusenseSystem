from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    action: str
    target_type: str | None
    target_id: int | None
    details_json: dict[str, Any] | None
    created_at: datetime
    updated_at: datetime