from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import EmailStr
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.models.patient import PatientProfile
from app.models.doctor import DoctorProfile

from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    GoogleLoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    TokenResponse,
    MessageResponse,
)
from app.schemas.user import UserOut

from app.services.verification_service import (
    send_verification_email,
    verify_email_token,
)
from app.services.password_reset_service import (
    send_password_reset_email,
    reset_user_password,
)
from app.services.google_auth_service import verify_google_credential
from app.services.audit_service import log_action

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = (
        db.query(User)
        .filter(User.email == payload.email, User.deleted_at.is_(None))
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
        is_active=True,
        auth_provider="local",
        email_verified_at=None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    if payload.role == "patient":
        profile = PatientProfile(
            user_id=user.id,
            full_name=payload.full_name,
            patient_code=f"PAT-{user.id:05d}",
        )
        db.add(profile)

    elif payload.role == "doctor":
        profile = DoctorProfile(
            user_id=user.id,
            full_name=payload.full_name,
        )
        db.add(profile)

    db.commit()

    log_action(
        db,
        user_id=user.id,
        action="user_registered",
        target_type="user",
        target_id=user.id,
        details_json={
            "email": user.email,
            "role": user.role,
            "auth_provider": user.auth_provider,
        },
    )

    send_verification_email(db, user)

    return {"message": "Registration successful. Please verify your email."}


@router.get("/verify-email", response_model=MessageResponse)
def verify_email(token: str = Query(...), db: Session = Depends(get_db)):
    user = verify_email_token(db, token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )

    log_action(
        db,
        user_id=user.id,
        action="email_verified",
        target_type="user",
        target_id=user.id,
        details_json={"email": user.email},
    )

    return {"message": "Email verified successfully"}


@router.post("/resend-verification", response_model=MessageResponse)
def resend_verification(email: EmailStr = Query(...), db: Session = Depends(get_db)):
    user = (
        db.query(User)
        .filter(User.email == email, User.deleted_at.is_(None))
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.auth_provider != "local":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification is only required for local accounts",
        )

    if user.email_verified_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already verified",
        )

    send_verification_email(db, user)

    return {"message": "Verification email sent again"}


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = (
        db.query(User)
        .filter(User.email == payload.email, User.deleted_at.is_(None))
        .first()
    )

    if not user or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )

    if user.auth_provider == "local" and user.email_verified_at is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in",
        )

    user.last_login_at = datetime.now(timezone.utc)
    db.commit()

    log_action(
        db,
        user_id=user.id,
        action="user_logged_in",
        target_type="user",
        target_id=user.id,
        details_json={
            "email": user.email,
            "auth_provider": user.auth_provider,
        },
    )

    access_token = create_access_token(str(user.id))
    return TokenResponse(access_token=access_token)


@router.post("/google", response_model=TokenResponse)
def google_login(payload: GoogleLoginRequest, db: Session = Depends(get_db)):
    try:
        claims = verify_google_credential(payload.credential)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google credential",
        )

    google_sub = claims.get("sub")
    email = claims.get("email")
    email_verified = claims.get("email_verified", False)
    name = claims.get("name") or "Google User"

    if not google_sub or not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account data is incomplete",
        )

    if not email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google email is not verified",
        )

    user = (
        db.query(User)
        .filter(User.google_sub == google_sub, User.deleted_at.is_(None))
        .first()
    )

    created_now = False

    if not user:
        existing_email_user = (
            db.query(User)
            .filter(User.email == email, User.deleted_at.is_(None))
            .first()
        )

        if existing_email_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This email is already registered with another sign-in method",
            )

        if payload.role is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role is required for first-time Google sign-in",
            )

        user = User(
            email=email,
            password_hash=None,
            role=payload.role,
            is_active=True,
            auth_provider="google",
            google_sub=google_sub,
            email_verified_at=datetime.now(timezone.utc),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        if payload.role == "patient":
            profile = PatientProfile(
                user_id=user.id,
                full_name=name,
                patient_code=f"PAT-{user.id:05d}",
            )
            db.add(profile)

        elif payload.role == "doctor":
            profile = DoctorProfile(
                user_id=user.id,
                full_name=name,
            )
            db.add(profile)

        db.commit()
        created_now = True

        log_action(
            db,
            user_id=user.id,
            action="google_account_created",
            target_type="user",
            target_id=user.id,
            details_json={
                "email": user.email,
                "role": user.role,
            },
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )

    user.last_login_at = datetime.now(timezone.utc)
    db.commit()

    log_action(
        db,
        user_id=user.id,
        action="user_logged_in_with_google",
        target_type="user",
        target_id=user.id,
        details_json={
            "email": user.email,
            "role": user.role,
            "first_time_google_login": created_now,
        },
    )

    access_token = create_access_token(str(user.id))
    return TokenResponse(access_token=access_token)


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = (
        db.query(User)
        .filter(User.email == payload.email, User.deleted_at.is_(None))
        .first()
    )

    if not user or user.auth_provider != "local":
        return {"message": "If the account exists, a password reset email has been sent."}

    send_password_reset_email(db, user)

    log_action(
        db,
        user_id=user.id,
        action="password_reset_requested",
        target_type="user",
        target_id=user.id,
        details_json={"email": user.email},
    )

    return {"message": "If the account exists, a password reset email has been sent."}


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = reset_user_password(db, payload.token, payload.new_password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token",
        )

    log_action(
        db,
        user_id=user.id,
        action="password_reset_completed",
        target_type="user",
        target_id=user.id,
        details_json={"email": user.email},
    )

    return {"message": "Password reset successfully"}


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user