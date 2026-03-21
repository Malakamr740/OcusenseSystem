from sqlalchemy import CheckConstraint, Column, ForeignKey, Index, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin, SoftDeleteMixin


class Case(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    patient_profile_id = Column(Integer, ForeignKey("patient_profiles.id"), nullable=False)
    uploaded_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    modality = Column(String, default="fundus", nullable=False)
    image_path = Column(String, nullable=False)
    status = Column(String, default="uploaded", nullable=False)
    metadata_json = Column(JSONB, nullable=True)

    __table_args__ = (
        CheckConstraint(
            "modality IN ('fundus', 'oct')",
            name="ck_cases_modality_valid",
        ),
        CheckConstraint(
            "status IN ('uploaded', 'processing', 'done', 'failed')",
            name="ck_cases_status_valid",
        ),
        Index("ix_cases_patient_created_at", "patient_profile_id", "created_at"),
    )

    patient = relationship("PatientProfile", back_populates="cases")
    uploaded_by_user = relationship("User", back_populates="uploaded_cases")

    predictions = relationship("Prediction", back_populates="case")
    gradcam_results = relationship("GradcamResult", back_populates="case")
    segmentation_results = relationship("SegmentationResult", back_populates="case")
    reports = relationship("Report", back_populates="case")