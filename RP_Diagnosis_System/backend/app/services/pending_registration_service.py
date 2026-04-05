import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.models.pending_registration import PendingRegistration
from app.models.user import User
from app.services.email_service import send_email


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def get_pending_registration_by_email(db: Session, email: str) -> PendingRegistration | None:
    return (
        db.query(PendingRegistration)
        .filter(PendingRegistration.email == email)
        .first()
    )


def create_pending_registration(
    db: Session,
    *,
    email: str,
    password: str,
    role: str,
    full_name: str,
) -> PendingRegistration:
    existing_user = (
        db.query(User)
        .filter(User.email == email, User.deleted_at.is_(None))
        .first()
    )
    if existing_user:
        raise ValueError("Email already registered")

    existing_pending = get_pending_registration_by_email(db, email)
    if existing_pending:
        raise ValueError("This email is pending verification. Please verify or resend verification.")

    raw_token = secrets.token_urlsafe(32)
    token_hash = _hash_token(raw_token)

    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES
    )

    pending = PendingRegistration(
        email=email,
        password_hash=hash_password(password),
        role=role,
        full_name=full_name,
        token_hash=token_hash,
        expires_at=expires_at,
    )

    db.add(pending)
    db.commit()
    db.refresh(pending)

    # temporarily attach raw token so caller can email it
    pending._raw_token = raw_token
    return pending


def send_pending_verification_email(pending: PendingRegistration) -> None:
    raw_token = getattr(pending, "_raw_token", None)
    if not raw_token:
        raise ValueError("Raw token not available for sending verification email")

    verify_url = f"{settings.APP_FRONTEND_URL}/verify-email?token={raw_token}"

    subject = "Verify your email"
    body = (
        f"Hello,\n\n"
        f"Please verify your email by opening this link:\n\n"
        f"{verify_url}\n\n"
        f"If you did not request this account, please ignore this email."
    )

    send_email(pending.email, subject, body)


def get_pending_registration_by_token(
    db: Session,
    raw_token: str,
) -> PendingRegistration | None:
    token_hash = _hash_token(raw_token)

    pending = (
        db.query(PendingRegistration)
        .filter(PendingRegistration.token_hash == token_hash)
        .first()
    )

    if not pending:
        return None

    if pending.expires_at < datetime.now(timezone.utc):
        return None

    return pending


def refresh_pending_registration_token(
    db: Session,
    pending: PendingRegistration,
) -> PendingRegistration:
    raw_token = secrets.token_urlsafe(32)
    pending.token_hash = _hash_token(raw_token)
    pending.expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES
    )

    db.commit()
    db.refresh(pending)

    pending._raw_token = raw_token
    return pending


def delete_pending_registration(db: Session, pending: PendingRegistration) -> None:
    db.delete(pending)
    db.commit()