from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.doctor import DoctorProfile
from app.schemas.doctor import DoctorProfileOut, DoctorProfileUpdate

router = APIRouter(prefix="/doctors", tags=["doctors"])


@router.get("/me", response_model=DoctorProfileOut)
def get_my_doctor_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can access this endpoint",
        )

    profile = (
        db.query(DoctorProfile)
        .filter(
            DoctorProfile.user_id == current_user.id,
            DoctorProfile.deleted_at.is_(None),
        )
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found",
        )

    return profile


@router.patch("/me", response_model=DoctorProfileOut)
def update_my_doctor_profile(
    payload: DoctorProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can update this endpoint",
        )

    profile = (
        db.query(DoctorProfile)
        .filter(
            DoctorProfile.user_id == current_user.id,
            DoctorProfile.deleted_at.is_(None),
        )
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found",
        )

    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return profile