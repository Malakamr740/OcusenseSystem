from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def log_action(
    db: Session,
    *,
    user_id: int,
    action: str,
    target_type: str | None = None,
    target_id: int | None = None,
    details_json: dict | None = None,
) -> AuditLog:
    log = AuditLog(
        user_id=user_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        details_json=details_json,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log