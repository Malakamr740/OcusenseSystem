from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints

FullName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=100)]
SpecializationStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=100)]


class DoctorProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    full_name: str
    specialization: str | None
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None


class DoctorProfileUpdate(BaseModel):
    full_name: FullName | None = None
    specialization: SpecializationStr | None = None