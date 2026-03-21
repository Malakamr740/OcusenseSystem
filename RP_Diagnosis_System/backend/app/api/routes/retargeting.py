from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, Path, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.patient import PatientProfile
from app.models.retargeting_iteration import RetargetingIteration
from app.models.retargeting_session import RetargetingSession
from app.models.user import User
from app.schemas.retargeting import (
    RetargetingSessionOut,
    RetargetingIterationOut,
    RetargetingIterationCreate,
    RetargetingIterationFeedbackUpdate,
)
from app.services.file_service import save_upload_file
from app.services.retargeting_service import run_mock_retargeting_iteration

router = APIRouter(prefix="/retargeting", tags=["retargeting"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png"}
RETARGETING_SOURCE_DIR = "app/storage/retargeting_source"


def _get_patient_profile_for_user(db: Session, user_id: int) -> PatientProfile | None:
    return (
        db.query(PatientProfile)
        .filter(
            PatientProfile.user_id == user_id,
            PatientProfile.deleted_at.is_(None),
        )
        .first()
    )


def _get_accessible_session(
    session_id: int,
    db: Session,
    current_user: User,
) -> RetargetingSession:
    session = (
        db.query(RetargetingSession)
        .filter(
            RetargetingSession.id == session_id,
            RetargetingSession.deleted_at.is_(None),
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Retargeting session not found",
        )

    if current_user.role == "patient":
        patient_profile = _get_patient_profile_for_user(db, current_user.id)
        if not patient_profile or session.patient_profile_id != patient_profile.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not allowed to access this retargeting session",
            )

    return session


def _get_accessible_iteration(
    iteration_id: int,
    db: Session,
    current_user: User,
) -> RetargetingIteration:
    iteration = (
        db.query(RetargetingIteration)
        .filter(RetargetingIteration.id == iteration_id)
        .first()
    )

    if not iteration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Retargeting iteration not found",
        )

    _get_accessible_session(iteration.session_id, db, current_user)
    return iteration


@router.post("/sessions", response_model=RetargetingSessionOut, status_code=status.HTTP_201_CREATED)
def create_retargeting_session(
    file: UploadFile = File(...),
    source_image_type: str | None = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can create retargeting sessions",
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

    source_image_path = save_upload_file(file, upload_dir=RETARGETING_SOURCE_DIR)

    session = RetargetingSession(
        patient_profile_id=patient_profile.id,
        created_by_user_id=current_user.id,
        source_image_path=source_image_path,
        source_image_type=source_image_type,
        status="in_progress",
        accepted_iteration_id=None,
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return session


@router.get("/sessions/me", response_model=list[RetargetingSessionOut])
def list_my_retargeting_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can view their retargeting sessions",
        )

    patient_profile = _get_patient_profile_for_user(db, current_user.id)
    if not patient_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found",
        )

    sessions = (
        db.query(RetargetingSession)
        .filter(
            RetargetingSession.patient_profile_id == patient_profile.id,
            RetargetingSession.deleted_at.is_(None),
        )
        .order_by(RetargetingSession.created_at.desc())
        .all()
    )

    return sessions


@router.get("/sessions/{session_id}", response_model=RetargetingSessionOut)
def get_retargeting_session(
    session_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _get_accessible_session(session_id, db, current_user)


@router.post("/sessions/{session_id}/run", response_model=RetargetingIterationOut)
def run_retargeting_iteration(
    payload: RetargetingIterationCreate,
    session_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = _get_accessible_session(session_id, db, current_user)

    if session.status != "in_progress":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Retargeting session is not in progress",
        )

    model_registry_id = payload.model_registry_id
    if model_registry_id == 0:
        model_registry_id = None

    iteration = run_mock_retargeting_iteration(
        db,
        session,
        model_registry_id=model_registry_id,
        model_name=payload.model_name,
        model_version=payload.model_version,
        parameters_json=payload.parameters_json,
    )

    return iteration

@router.get("/sessions/{session_id}/iterations", response_model=list[RetargetingIterationOut])
def list_retargeting_iterations(
    session_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = _get_accessible_session(session_id, db, current_user)

    iterations = (
        db.query(RetargetingIteration)
        .filter(RetargetingIteration.session_id == session.id)
        .order_by(RetargetingIteration.created_at.asc())
        .all()
    )

    return iterations


@router.patch("/iterations/{iteration_id}/feedback", response_model=RetargetingIterationOut)
def update_retargeting_feedback(
    payload: RetargetingIterationFeedbackUpdate,
    iteration_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    iteration = _get_accessible_iteration(iteration_id, db, current_user)

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(iteration, field, value)

    db.commit()
    db.refresh(iteration)

    return iteration


@router.patch("/iterations/{iteration_id}/accept", response_model=RetargetingSessionOut)
def accept_retargeting_iteration(
    iteration_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    iteration = _get_accessible_iteration(iteration_id, db, current_user)
    session = _get_accessible_session(iteration.session_id, db, current_user)

    # reset previous accepted flags in this session
    (
        db.query(RetargetingIteration)
        .filter(RetargetingIteration.session_id == session.id)
        .update({"is_accepted": False}, synchronize_session=False)
    )

    iteration.is_accepted = True
    session.accepted_iteration_id = iteration.id
    session.status = "accepted"

    db.commit()
    db.refresh(session)

    return session


@router.delete("/sessions/{session_id}")
def soft_delete_retargeting_session(
    session_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = _get_accessible_session(session_id, db, current_user)
    session.deleted_at = datetime.now(timezone.utc)

    db.commit()

    return {"message": "Retargeting session deleted successfully"}