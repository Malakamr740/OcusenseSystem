from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin


class GradcamResult(Base, TimestampMixin):
    __tablename__ = "gradcam_results"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    model_registry_id = Column(Integer, ForeignKey("model_registry.id"), nullable=True)

    model_name = Column(String, nullable=False)
    model_version = Column(String, nullable=True)
    target_class = Column(String, nullable=True)

    heatmap_path = Column(String, nullable=True)
    overlay_path = Column(String, nullable=False)
    metadata_json = Column(JSONB, nullable=True)

    case = relationship("Case", back_populates="gradcam_results")
    model_registry = relationship("ModelRegistry", back_populates="gradcam_results")