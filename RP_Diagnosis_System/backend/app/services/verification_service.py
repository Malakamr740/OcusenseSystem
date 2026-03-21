import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.email_verification_token import EmailVerificationToken
from app.models.user import User
from app.services.email_service import send_email


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_email_verification_token(db: Session, user: User) -> str:
    raw_token = secrets.token_urlsafe(32)
    token_hash = _hash_token(raw_token)

    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES
    )

    verification_token = EmailVerificationToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
        used_at=None,
    )

    db.add(verification_token)
    db.commit()

    return raw_token


def send_verification_email(db: Session, user: User) -> None:
    raw_token = create_email_verification_token(db, user)
    verify_url = f"http://127.0.0.1:8000/auth/verify-email?token={raw_token}"

    subject = "Verify your email"
    body = (
        f"Hello,\n\n"
        f"Please verify your email by opening this link:\n\n"
        f"{verify_url}\n\n"
        f"If you did not create this account, please ignore this email."
    )

    send_email(user.email, subject, body)


def verify_email_token(db: Session, raw_token: str) -> User | None:
    token_hash = _hash_token(raw_token)

    verification_token = (
        db.query(EmailVerificationToken)
        .filter(
            EmailVerificationToken.token_hash == token_hash,
            EmailVerificationToken.used_at.is_(None),
        )
        .first()
    )

    if not verification_token:
        return None

    if verification_token.expires_at < datetime.now(timezone.utc):
        return None

    user = (
        db.query(User)
        .filter(User.id == verification_token.user_id, User.deleted_at.is_(None))
        .first()
    )

    if not user:
        return None

    verification_token.used_at = datetime.now(timezone.utc)
    user.email_verified_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(user)

    return user