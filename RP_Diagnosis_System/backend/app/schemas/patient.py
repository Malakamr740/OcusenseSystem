from datetime import date, datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, StringConstraints, field_validator

FullName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=100)]
SexType = Literal["male", "female"]


class PatientProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    full_name: str
    patient_code: str
    date_of_birth: date | None
    sex: str | None
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None


class PatientProfileUpdate(BaseModel):
    full_name: FullName | None = None
    date_of_birth: date | None = None
    sex: SexType | None = None

    @field_validator("date_of_birth")
    @classmethod
    def validate_date_of_birth(cls, value: date | None) -> date | None:
        if value is None:
            return value
        if value > date.today():
            raise ValueError("Date of birth cannot be in the future")
        return value