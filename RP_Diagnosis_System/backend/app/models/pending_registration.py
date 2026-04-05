from sqlalchemy import Column, DateTime, Integer, String

from app.core.database import Base
from app.models.mixins import TimestampMixin


class PendingRegistration(Base, TimestampMixin):
    __tablename__ = "pending_registrations"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)

    role = Column(String, nullable=False)   # patient / doctor
    full_name = Column(String, nullable=False)

    token_hash = Column(String, unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)