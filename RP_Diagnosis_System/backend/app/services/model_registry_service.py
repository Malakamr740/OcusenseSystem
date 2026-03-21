from sqlalchemy.orm import Session

from app.models.model_registry import ModelRegistry


def get_active_model_by_task_type(db: Session, task_type: str) -> ModelRegistry | None:
    return (
        db.query(ModelRegistry)
        .filter(
            ModelRegistry.task_type == task_type,
            ModelRegistry.is_active.is_(True),
            ModelRegistry.deleted_at.is_(None),
        )
        .order_by(ModelRegistry.created_at.desc())
        .first()
    )


def get_model_by_id(db: Session, model_id: int) -> ModelRegistry | None:
    return (
        db.query(ModelRegistry)
        .filter(
            ModelRegistry.id == model_id,
            ModelRegistry.deleted_at.is_(None),
        )
        .first()
    )
