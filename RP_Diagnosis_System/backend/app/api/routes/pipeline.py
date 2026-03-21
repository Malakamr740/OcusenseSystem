from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.case import Case
from app.models.patient import PatientProfile
from app.models.user import User
from app.models.prediction import Prediction
from app.models.gradcam_result import GradcamResult
from app.models.segmentation_result import SegmentationResult
from app.schemas.result import CaseResultsOut
from app.services.mock_pipeline_service import run_mock_pipeline
from app.services.audit_service import log_action

router = APIRouter(prefix="/pipeline", tags=["pipeline"])


def _get_accessible_case(case_id: int, db: Session, current_user: User) -> Case:
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
        patient_profile = (
            db.query(PatientProfile)
            .filter(
                PatientProfile.user_id == current_user.id,
                PatientProfile.deleted_at.is_(None),
            )
            .first()
        )

        if not patient_profile or case.patient_profile_id != patient_profile.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not allowed to access this case",
            )

    return case


@router.post("/cases/{case_id}/run", response_model=CaseResultsOut)
def run_case_pipeline(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case = _get_accessible_case(case_id, db, current_user)

    result = run_mock_pipeline(db, case)

    log_action(
        db,
        user_id=current_user.id,
        action="diagnosis_pipeline_run",
        target_type="case",
        target_id=case.id,
        details_json={
            "prediction_count": len(result["predictions"]),
            "gradcam_count": len(result["gradcam_results"]),
            "segmentation_count": len(result["segmentation_results"]),
        },
    )

    return result


@router.get("/cases/{case_id}/results", response_model=CaseResultsOut)
def get_case_results(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case = _get_accessible_case(case_id, db, current_user)

    predictions = (
        db.query(Prediction)
        .filter(Prediction.case_id == case.id)
        .order_by(Prediction.created_at.asc())
        .all()
    )

    gradcam_results = (
        db.query(GradcamResult)
        .filter(GradcamResult.case_id == case.id)
        .order_by(GradcamResult.created_at.asc())
        .all()
    )

    segmentation_results = (
        db.query(SegmentationResult)
        .filter(SegmentationResult.case_id == case.id)
        .order_by(SegmentationResult.created_at.asc())
        .all()
    )

    return {
        "predictions": predictions,
        "gradcam_results": gradcam_results,
        "segmentation_results": segmentation_results,
    }