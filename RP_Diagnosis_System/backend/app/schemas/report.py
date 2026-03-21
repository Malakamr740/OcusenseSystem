from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class ReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    case_id: int
    pdf_path: str
    report_type: str
    status: str
    metadata_json: dict[str, Any] | None
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None


class ReportGenerateResponse(BaseModel):
    message: str
    report: ReportOut