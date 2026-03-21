from sqlalchemy import Boolean, Column, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin


class RetargetingIteration(Base, TimestampMixin):
    __tablename__ = "retargeting_iterations"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("retargeting_sessions.id"), nullable=False)
    model_registry_id = Column(Integer, ForeignKey("model_registry.id"), nullable=True)

    model_name = Column(String, nullable=False)
    model_version = Column(String, nullable=True)

    output_image_path = Column(String, nullable=False)
    parameters_json = Column(JSONB, nullable=True)

    feedback_text = Column(Text, nullable=True)
    feedback_rating = Column(String, nullable=True)
    is_accepted = Column(Boolean, default=False, nullable=False)

    __table_args__ = (
        Index("ix_retargeting_iterations_session_created_at", "session_id", "created_at"),
    )

    session = relationship(
        "RetargetingSession",
        foreign_keys=[session_id],
        back_populates="iterations"
    )
    model_registry = relationship("ModelRegistry", back_populates="retargeting_iterations")