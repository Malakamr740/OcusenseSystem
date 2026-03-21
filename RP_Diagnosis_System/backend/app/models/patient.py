from sqlalchemy import Column, Date, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin, SoftDeleteMixin


class PatientProfile(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "patient_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    full_name = Column(String, nullable=False)
    patient_code = Column(String, unique=True, nullable=False)
    date_of_birth = Column(Date, nullable=True)
    sex = Column(String, nullable=True)

    user = relationship("User", back_populates="patient_profile")
    cases = relationship("Case", back_populates="patient")
    retargeting_sessions = relationship("RetargetingSession", back_populates="patient")