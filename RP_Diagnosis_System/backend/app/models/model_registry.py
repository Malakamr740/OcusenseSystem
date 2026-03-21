from sqlalchemy import Boolean, Column, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin, SoftDeleteMixin


class ModelRegistry(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "model_registry"

    id = Column(Integer, primary_key=True, index=True)

    task_type = Column(String, nullable=False)  # classification / severity / segmentation / gradcam / retargeting
    model_name = Column(String, nullable=False)
    model_version = Column(String, nullable=False)
    framework = Column(String, nullable=True)   # pytorch / tensorflow / onnx / etc.
    is_active = Column(Boolean, default=True, nullable=False)
    notes = Column(Text, nullable=True)

    predictions = relationship("Prediction", back_populates="model_registry")
    gradcam_results = relationship("GradcamResult", back_populates="model_registry")
    segmentation_results = relationship("SegmentationResult", back_populates="model_registry")
    retargeting_iterations = relationship("RetargetingIteration", back_populates="model_registry")