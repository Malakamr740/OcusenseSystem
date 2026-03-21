from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_roles
from app.models.model_registry import ModelRegistry
from app.models.user import User
from app.schemas.model_registry import (
    ModelRegistryOut,
    ModelRegistryCreate,
    ModelRegistryUpdate,
)
from app.services.audit_service import log_action

router = APIRouter(prefix="/models", tags=["model-registry"])


@router.get("", response_model=list[ModelRegistryOut])
def list_models(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    models = (
        db.query(ModelRegistry)
        .filter(ModelRegistry.deleted_at.is_(None))
        .order_by(ModelRegistry.created_at.desc())
        .all()
    )
    return models


@router.get("/{model_id}", response_model=ModelRegistryOut)
def get_model(
    model_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    model = (
        db.query(ModelRegistry)
        .filter(ModelRegistry.id == model_id, ModelRegistry.deleted_at.is_(None))
        .first()
    )

    if not model:
        raise HTTPException(status_code=404, detail="Model not found")

    return model


@router.post("", response_model=ModelRegistryOut)
def create_model(
    payload: ModelRegistryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    model = ModelRegistry(
        task_type=payload.task_type,
        model_name=payload.model_name,
        model_version=payload.model_version,
        framework=payload.framework,
        is_active=payload.is_active,
        notes=payload.notes,
    )

    db.add(model)
    db.commit()
    db.refresh(model)

    log_action(
        db,
        user_id=current_user.id,
        action="model_registry_created",
        target_type="model_registry",
        target_id=model.id,
        details_json={
            "task_type": model.task_type,
            "model_name": model.model_name,
            "model_version": model.model_version,
            "is_active": model.is_active,
        },
    )

    return model


@router.patch("/{model_id}", response_model=ModelRegistryOut)
def update_model(
    payload: ModelRegistryUpdate,
    model_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    model = (
        db.query(ModelRegistry)
        .filter(ModelRegistry.id == model_id, ModelRegistry.deleted_at.is_(None))
        .first()
    )

    if not model:
        raise HTTPException(status_code=404, detail="Model not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(model, field, value)

    db.commit()
    db.refresh(model)

    log_action(
        db,
        user_id=current_user.id,
        action="model_registry_updated",
        target_type="model_registry",
        target_id=model.id,
        details_json=update_data,
    )

    return model


@router.delete("/{model_id}")
def soft_delete_model(
    model_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    model = (
        db.query(ModelRegistry)
        .filter(ModelRegistry.id == model_id, ModelRegistry.deleted_at.is_(None))
        .first()
    )

    if not model:
        raise HTTPException(status_code=404, detail="Model not found")

    from datetime import datetime, timezone
    model.deleted_at = datetime.now(timezone.utc)
    db.commit()

    log_action(
        db,
        user_id=current_user.id,
        action="model_registry_deleted",
        target_type="model_registry",
        target_id=model.id,
        details_json={
            "model_name": model.model_name,
            "model_version": model.model_version,
        },
    )

    return {"message": "Model deleted successfully"}