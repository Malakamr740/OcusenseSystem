from sqlalchemy import CheckConstraint, Column, ForeignKey, Index, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin, SoftDeleteMixin


class Report(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)

    pdf_path = Column(String, nullable=False)
    report_type = Column(String, default="diagnosis_report", nullable=False)
    status = Column(String, default="generated", nullable=False)
    metadata_json = Column(JSONB, nullable=True)

    __table_args__ = (
        CheckConstraint(
            "status IN ('generated', 'failed')",
            name="ck_reports_status_valid",
        ),
        Index("ix_reports_case_created_at", "case_id", "created_at"),
    )

    case = relationship("Case", back_populates="reports")