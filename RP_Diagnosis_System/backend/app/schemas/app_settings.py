from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class AppSettingsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    hospital_name: str
    logo_path: str | None
    support_email: EmailStr | None
    report_disclaimer: str | None
    default_report_footer: str | None
    created_at: datetime
    updated_at: datetime


class AppSettingsUpdate(BaseModel):
    hospital_name: str | None = None
    logo_path: str | None = None
    support_email: EmailStr | None = None
    report_disclaimer: str | None = None
    default_report_footer: str | None = None