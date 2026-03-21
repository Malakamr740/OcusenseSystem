import os

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.case import Case
from app.models.patient import PatientProfile
from app.models.report import Report
from app.models.user import User
from app.schemas.report import ReportOut, ReportGenerateResponse
from app.services.report_service import generate_case_report
from app.services.audit_service import log_action

router = APIRouter(prefix="/reports", tags=["reports"])


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


@router.post("/cases/{case_id}/generate", response_model=ReportGenerateResponse)
def generate_report_for_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case = _get_accessible_case(case_id, db, current_user)
    report = generate_case_report(db, case)

    log_action(
        db,
        user_id=current_user.id,
        action="report_generated",
        target_type="report",
        target_id=report.id,
        details_json={
            "case_id": case.id,
            "report_type": report.report_type,
            "status": report.status,
        },
    )

    return {
        "message": "Report generated successfully",
        "report": report,
    }


@router.get("", response_model=list[ReportOut])
def list_all_reports_for_doctor_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Doctor/admin: can view all reports
    Patient: use /reports/cases/{case_id}
    """
    if current_user.role not in ["doctor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors and admins can view all reports",
        )

    reports = (
        db.query(Report)
        .filter(Report.deleted_at.is_(None))
        .order_by(Report.created_at.desc())
        .all()
    )

    return reports


@router.get("/cases/{case_id}", response_model=list[ReportOut])
def list_case_reports(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case = _get_accessible_case(case_id, db, current_user)

    reports = (
        db.query(Report)
        .filter(
            Report.case_id == case.id,
            Report.deleted_at.is_(None),
        )
        .order_by(Report.created_at.desc())
        .all()
    )

    return reports


@router.get("/{report_id}/download")
def download_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = (
        db.query(Report)
        .filter(Report.id == report_id, Report.deleted_at.is_(None))
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )

    _get_accessible_case(report.case_id, db, current_user)

    if not os.path.exists(report.pdf_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF file not found on disk",
        )

    filename = f"case_{report.case_id}_report.pdf"
    return FileResponse(
        path=report.pdf_path,
        media_type="application/pdf",
        filename=filename,
    )
