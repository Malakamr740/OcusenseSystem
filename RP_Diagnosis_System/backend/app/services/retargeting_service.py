import os
import shutil
from uuid import uuid4

from sqlalchemy.orm import Session

from app.models.retargeting_session import RetargetingSession
from app.models.retargeting_iteration import RetargetingIteration
from app.services.model_registry_service import get_active_model_by_task_type, get_model_by_id


RETARGETED_DIR = "app/storage/retargeted"


def _ensure_dirs():
    os.makedirs(RETARGETED_DIR, exist_ok=True)


def _copy_retargeted_artifact(source_path: str) -> str:
    _ensure_dirs()

    ext = source_path.split(".")[-1].lower()
    filename = f"{uuid4().hex}_retargeted.{ext}"
    output_path = os.path.join(RETARGETED_DIR, filename)

    shutil.copyfile(source_path, output_path)
    return output_path


def run_mock_retargeting_iteration(
    db: Session,
    session: RetargetingSession,
    *,
    model_registry_id: int | None,
    model_name: str | None,
    model_version: str | None,
    parameters_json: dict | None,
) -> RetargetingIteration:
    output_image_path = _copy_retargeted_artifact(session.source_image_path)

    selected_model = None

    if model_registry_id is not None:
        selected_model = get_model_by_id(db, model_registry_id)
    else:
        selected_model = get_active_model_by_task_type(db, "retargeting")

    final_model_registry_id = selected_model.id if selected_model else None
    final_model_name = selected_model.model_name if selected_model else (model_name or "mock_retargeting_model")
    final_model_version = selected_model.model_version if selected_model else (model_version or "v1")

    iteration = RetargetingIteration(
        session_id=session.id,
        model_registry_id=final_model_registry_id,
        model_name=final_model_name,
        model_version=final_model_version,
        output_image_path=output_image_path,
        parameters_json=parameters_json,
        feedback_text=None,
        feedback_rating=None,
        is_accepted=False,
    )

    db.add(iteration)
    db.commit()
    db.refresh(iteration)

    return iteration
