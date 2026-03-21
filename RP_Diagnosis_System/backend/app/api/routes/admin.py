from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_roles
from app.models.user import User
from app.models.case import Case
from app.models.report import Report
from app.models.patient import PatientProfile
from app.models.doctor import DoctorProfile
from app.models.chat_session import ChatSession
from app.models.retargeting_session import RetargetingSession
from app.schemas.admin import (
    AdminUserOut,
    UserStatusUpdate,
    SoftDeleteResponse,
    AdminCaseOut,
    DashboardSummaryOut,
)
from app.schemas.report import ReportOut
from app.services.audit_service import log_action

from app.models.audit_log import AuditLog
from app.schemas.audit import AuditLogOut

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Path, Query
from app.models.audit_log import AuditLog
from app.schemas.audit import AuditLogOut



router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[AdminUserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return users


@router.get("/users/{user_id}", response_model=AdminUserOut)
def get_user(
    user_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@router.patch("/users/{user_id}/status", response_model=AdminUserOut)
def update_user_status(
    payload: UserStatusUpdate,
    user_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    user = (
        db.query(User)
        .filter(User.id == user_id, User.deleted_at.is_(None))
        .first()
    )

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == "admin" and payload.is_active is False:
        raise HTTPException(
            status_code=400,
            detail="The single admin account cannot be deactivated from this endpoint",
        )

    user.is_active = payload.is_active
    db.commit()
    db.refresh(user)

    log_action(
        db,
        user_id=current_user.id,
        action="admin_updated_user_status",
        target_type="user",
        target_id=user.id,
        details_json={"new_is_active": user.is_active},
    )

    return user


@router.delete("/users/{user_id}", response_model=SoftDeleteResponse)
def soft_delete_user(
    user_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    user = (
        db.query(User)
        .filter(User.id == user_id, User.deleted_at.is_(None))
        .first()
    )

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == "admin":
        raise HTTPException(
            status_code=400,
            detail="The single admin account cannot be soft-deleted",
        )

    user.deleted_at = datetime.now(timezone.utc)
    user.is_active = False
    db.commit()

    log_action(
        db,
        user_id=current_user.id,
        action="admin_soft_deleted_user",
        target_type="user",
        target_id=user.id,
        details_json={
            "deleted_email": user.email,
            "deleted_role": user.role,
        },
    )

    return {"message": "User soft-deleted successfully"}


@router.get("/cases", response_model=list[AdminCaseOut])
def list_all_cases(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    cases = db.query(Case).order_by(Case.created_at.desc()).all()
    return cases


@router.get("/reports", response_model=list[ReportOut])
def list_all_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    reports = (
        db.query(Report)
        .filter(Report.deleted_at.is_(None))
        .order_by(Report.created_at.desc())
        .all()
    )
    return reports


@router.get("/dashboard-summary", response_model=DashboardSummaryOut)
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    total_users = db.query(User).filter(User.deleted_at.is_(None)).count()
    total_patients = (
        db.query(PatientProfile)
        .filter(PatientProfile.deleted_at.is_(None))
        .count()
    )
    total_doctors = (
        db.query(DoctorProfile)
        .filter(DoctorProfile.deleted_at.is_(None))
        .count()
    )
    total_cases = db.query(Case).filter(Case.deleted_at.is_(None)).count()
    total_reports = db.query(Report).filter(Report.deleted_at.is_(None)).count()
    total_chat_sessions = (
        db.query(ChatSession)
        .filter(ChatSession.deleted_at.is_(None))
        .count()
    )
    total_retargeting_sessions = (
        db.query(RetargetingSession)
        .filter(RetargetingSession.deleted_at.is_(None))
        .count()
    )

    return {
        "total_users": total_users,
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_cases": total_cases,
        "total_reports": total_reports,
        "total_chat_sessions": total_chat_sessions,
        "total_retargeting_sessions": total_retargeting_sessions,
    }

@router.get("/audit-logs", response_model=list[AuditLogOut])
def list_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    logs = (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .all()
    )
    return logs

@router.get("/audit-logs", response_model=list[AuditLogOut])
def list_audit_logs(
    user_id: int | None = Query(None, gt=0),
    action: str | None = Query(None),
    target_type: str | None = Query(None),
    target_id: int | None = Query(None, gt=0),
    date_from: datetime | None = Query(None),
    date_to: datetime | None = Query(None),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    query = db.query(AuditLog)

    if user_id is not None:
        query = query.filter(AuditLog.user_id == user_id)

    if action is not None:
        query = query.filter(AuditLog.action == action)

    if target_type is not None:
        query = query.filter(AuditLog.target_type == target_type)

    if target_id is not None:
        query = query.filter(AuditLog.target_id == target_id)

    if date_from is not None:
        query = query.filter(AuditLog.created_at >= date_from)

    if date_to is not None:
        query = query.filter(AuditLog.created_at <= date_to)

    logs = (
        query.order_by(AuditLog.created_at.desc())
        .limit(limit)
        .all()
    )

    return logs