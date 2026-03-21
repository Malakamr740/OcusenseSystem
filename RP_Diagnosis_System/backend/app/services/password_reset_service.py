import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.models.password_reset_token import PasswordResetToken
from app.models.user import User
from app.services.email_service import send_email


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_password_reset_token(db: Session, user: User) -> str:
    raw_token = secrets.token_urlsafe(32)
    token_hash = _hash_token(raw_token)

    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES
    )

    reset_token = PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
        used_at=None,
    )

    db.add(reset_token)
    db.commit()

    return raw_token


def send_password_reset_email(db: Session, user: User) -> None:
    raw_token = create_password_reset_token(db, user)
    reset_url = f"{settings.APP_FRONTEND_URL}/reset-password?token={raw_token}"

    subject = "Reset your password"
    body = (
        f"Hello,\n\n"
        f"To reset your password, open this link:\n\n"
        f"{reset_url}\n\n"
        f"If you did not request a password reset, please ignore this email."
    )

    send_email(user.email, subject, body)


def reset_user_password(db: Session, raw_token: str, new_password: str) -> User | None:
    token_hash = _hash_token(raw_token)

    reset_token = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token_hash == token_hash,
            PasswordResetToken.used_at.is_(None),
        )
        .first()
    )

    if not reset_token:
        return None

    if reset_token.expires_at < datetime.now(timezone.utc):
        return None

    user = (
        db.query(User)
        .filter(User.id == reset_token.user_id, User.deleted_at.is_(None))
        .first()
    )

    if not user:
        return None

    user.password_hash = hash_password(new_password)
    reset_token.used_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(user)

    return user