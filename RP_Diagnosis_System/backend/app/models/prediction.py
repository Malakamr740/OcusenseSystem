from sqlalchemy import Column, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin


class Prediction(Base, TimestampMixin):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    model_registry_id = Column(Integer, ForeignKey("model_registry.id"), nullable=True)

    task_type = Column(String, nullable=False)   # classification / severity
    model_name = Column(String, nullable=False)
    model_version = Column(String, nullable=True)

    label = Column(String, nullable=False)
    confidence = Column(Float, nullable=True)
    raw_output_json = Column(JSONB, nullable=True)

    case = relationship("Case", back_populates="predictions")
    model_registry = relationship("ModelRegistry", back_populates="predictions")