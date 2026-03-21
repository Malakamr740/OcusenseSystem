from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_roles
from app.models.user import User
from app.schemas.app_settings import AppSettingsOut, AppSettingsUpdate
from app.services.app_settings_service import get_or_create_app_settings
from app.services.audit_service import log_action

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=AppSettingsOut)
def get_app_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    settings = get_or_create_app_settings(db)
    return settings


@router.patch("", response_model=AppSettingsOut)
def update_app_settings(
    payload: AppSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    settings = get_or_create_app_settings(db)

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)

    db.commit()
    db.refresh(settings)

    log_action(
        db,
        user_id=current_user.id,
        action="app_settings_updated",
        target_type="app_settings",
        target_id=settings.id,
        details_json=update_data,
    )

    return settings