from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    Index,
    Integer,
    String,
    text,
)
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin, SoftDeleteMixin


class User(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True)

    role = Column(String, nullable=False)   # patient / doctor / admin
    is_active = Column(Boolean, default=True, nullable=False)
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    auth_provider = Column(String, default="local", nullable=False)   # local / google
    google_sub = Column(String, unique=True, nullable=True, index=True)
    email_verified_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        CheckConstraint(
            "role IN ('patient', 'doctor', 'admin')",
            name="ck_users_role_valid",
        ),
        CheckConstraint(
            "auth_provider IN ('local', 'google')",
            name="ck_users_auth_provider_valid",
        ),
        Index(
            "uq_single_admin_user",
            "role",
            unique=True,
            postgresql_where=text("role = 'admin'")
        ),
    )

    patient_profile = relationship("PatientProfile", back_populates="user", uselist=False)
    doctor_profile = relationship("DoctorProfile", back_populates="user", uselist=False)
    admin_profile = relationship("AdminProfile", back_populates="user", uselist=False)

    uploaded_cases = relationship(
        "Case",
        foreign_keys="Case.uploaded_by_user_id",
        back_populates="uploaded_by_user"
    )

    chat_sessions = relationship("ChatSession", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")
    email_verification_tokens = relationship("EmailVerificationToken", back_populates="user")
    password_reset_tokens = relationship("PasswordResetToken", back_populates="user")