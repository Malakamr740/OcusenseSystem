from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin


class SegmentationResult(Base, TimestampMixin):
    __tablename__ = "segmentation_results"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    model_registry_id = Column(Integer, ForeignKey("model_registry.id"), nullable=True)

    segmentation_type = Column(String, nullable=False)   # vessel / pigment
    model_name = Column(String, nullable=False)
    model_version = Column(String, nullable=True)

    mask_path = Column(String, nullable=False)
    overlay_path = Column(String, nullable=True)
    metrics_json = Column(JSONB, nullable=True)

    case = relationship("Case", back_populates="segmentation_results")
    model_registry = relationship("ModelRegistry", back_populates="segmentation_results")