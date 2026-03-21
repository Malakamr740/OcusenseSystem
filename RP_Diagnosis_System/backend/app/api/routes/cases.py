from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.case import Case
from app.models.patient import PatientProfile
from app.models.user import User
from app.schemas.case import CaseOut
from app.services.file_service import save_upload_file
from app.services.audit_service import log_action

router = APIRouter(prefix="/cases", tags=["cases"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png"}


def _get_patient_profile_for_user(db: Session, user_id: int) -> PatientProfile | None:
    return (
        db.query(PatientProfile)
        .filter(
            PatientProfile.user_id == user_id,
            PatientProfile.deleted_at.is_(None),
        )
        .first()
    )


@router.post("/upload", response_model=CaseOut, status_code=status.HTTP_201_CREATED)
def upload_case(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can upload cases",
        )

    filename = file.filename or ""
    if "." not in filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must have a valid extension",
        )

    ext = filename.rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPG, JPEG, and PNG files are allowed",
        )

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image/jpeg and image/png content types are allowed",
        )

    contents = file.file.read()
    file_size = len(contents)
    file.file.seek(0)

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty",
        )

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size must not exceed 10 MB",
        )

    patient_profile = _get_patient_profile_for_user(db, current_user.id)
    if not patient_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found",
        )

    saved_path = save_upload_file(file)

    case = Case(
        patient_profile_id=patient_profile.id,
        uploaded_by_user_id=current_user.id,
        modality="fundus",
        image_path=saved_path,
        status="uploaded",
        metadata_json={
            "original_filename": filename,
            "content_type": file.content_type,
            "file_size": file_size,
        },
    )

    db.add(case)
    db.commit()
    db.refresh(case)

    log_action(
        db,
        user_id=current_user.id,
        action="case_uploaded",
        target_type="case",
        target_id=case.id,
        details_json={
            "modality": case.modality,
            "original_filename": filename,
            "content_type": file.content_type,
            "file_size": file_size,
        },
    )

    return case


@router.get("", response_model=list[CaseOut])
def list_cases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Doctor/admin: can view all cases
    Patient: use /cases/me instead
    """
    if current_user.role not in ["doctor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors and admins can view all cases",
        )

    cases = (
        db.query(Case)
        .filter(Case.deleted_at.is_(None))
        .order_by(Case.created_at.desc())
        .all()
    )

    return cases


@router.get("/me", response_model=list[CaseOut])
def list_my_cases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can view their own cases here",
        )

    patient_profile = _get_patient_profile_for_user(db, current_user.id)
    if not patient_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found",
        )

    cases = (
        db.query(Case)
        .filter(
            Case.patient_profile_id == patient_profile.id,
            Case.deleted_at.is_(None),
        )
        .order_by(Case.created_at.desc())
        .all()
    )

    return cases


@router.get("/{case_id}", response_model=CaseOut)
def get_case_by_id(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case = (
        db.query(Case)
        .filter(Case.id == case_id, Case.deleted_at.is_(None))
        .first()
    )

    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found",
        )

    if current_user.role == "patient":
        patient_profile = _get_patient_profile_for_user(db, current_user.id)
        if not patient_profile or case.patient_profile_id != patient_profile.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not allowed to access this case",
            )

    return case