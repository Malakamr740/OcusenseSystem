from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class PredictionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    case_id: int
    model_registry_id: int | None
    task_type: str
    model_name: str
    model_version: str | None
    label: str
    confidence: float | None
    raw_output_json: dict[str, Any] | None
    created_at: datetime
    updated_at: datetime


class GradcamResultOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    case_id: int
    model_registry_id: int | None
    model_name: str
    model_version: str | None
    target_class: str | None
    heatmap_path: str | None
    overlay_path: str
    metadata_json: dict[str, Any] | None
    created_at: datetime
    updated_at: datetime


class SegmentationResultOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    case_id: int
    model_registry_id: int | None
    segmentation_type: str
    model_name: str
    model_version: str | None
    mask_path: str
    overlay_path: str | None
    metrics_json: dict[str, Any] | None
    created_at: datetime
    updated_at: datetime


class CaseResultsOut(BaseModel):
    predictions: list[PredictionOut]
    gradcam_results: list[GradcamResultOut]
    segmentation_results: list[SegmentationResultOut]