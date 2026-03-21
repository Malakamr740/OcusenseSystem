from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ModelRegistryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    task_type: str
    model_name: str
    model_version: str
    framework: str | None
    is_active: bool
    notes: str | None
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None


class ModelRegistryCreate(BaseModel):
    task_type: str
    model_name: str
    model_version: str
    framework: str | None = None
    is_active: bool = True
    notes: str | None = None


class ModelRegistryUpdate(BaseModel):
    task_type: str | None = None
    model_name: str | None = None
    model_version: str | None = None
    framework: str | None = None
    is_active: bool | None = None
    notes: str | None = None