from sqlalchemy import CheckConstraint, Column, ForeignKey, Index, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin, SoftDeleteMixin


class RetargetingSession(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "retargeting_sessions"

    id = Column(Integer, primary_key=True, index=True)
    patient_profile_id = Column(Integer, ForeignKey("patient_profiles.id"), nullable=False)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    source_image_path = Column(String, nullable=False)
    source_image_type = Column(String, nullable=True)
    status = Column(String, default="in_progress", nullable=False)

    accepted_iteration_id = Column(Integer, ForeignKey("retargeting_iterations.id"), nullable=True)

    __table_args__ = (
        CheckConstraint(
            "status IN ('in_progress', 'accepted', 'cancelled')",
            name="ck_retargeting_sessions_status_valid",
        ),
        Index(
            "ix_retargeting_sessions_patient_created_at",
            "patient_profile_id",
            "created_at",
        ),
    )

    patient = relationship("PatientProfile", back_populates="retargeting_sessions")
    created_by_user = relationship("User")
    iterations = relationship(
        "RetargetingIteration",
        foreign_keys="RetargetingIteration.session_id",
        back_populates="session"
    )
    accepted_iteration = relationship(
        "RetargetingIteration",
        foreign_keys=[accepted_iteration_id],
        post_update=True
    )