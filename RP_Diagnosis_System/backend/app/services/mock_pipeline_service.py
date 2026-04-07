import os
import shutil
from uuid import uuid4

from sqlalchemy.orm import Session

from app.models.case import Case
from app.models.prediction import Prediction
from app.models.gradcam_result import GradcamResult
from app.models.segmentation_result import SegmentationResult
from app.services.model_registry_service import get_active_model_by_task_type
from app.ml.diagnosis.classification.inference import predict_classification
from app.ml.diagnosis.classification.gradcam import generate_gradcam_artifacts

GRADCAM_DIR = "app/storage/gradcam"
SEGMENTATION_DIR = "app/storage/segmentation"


def _ensure_dirs():
    os.makedirs(GRADCAM_DIR, exist_ok=True)
    os.makedirs(SEGMENTATION_DIR, exist_ok=True)


def _copy_artifact(source_path: str, target_dir: str, suffix: str) -> str:
    _ensure_dirs()

    ext = source_path.split(".")[-1].lower()
    filename = f"{uuid4().hex}_{suffix}.{ext}"
    target_path = os.path.join(target_dir, filename)

    shutil.copyfile(source_path, target_path)
    return target_path


def _clear_previous_results(db: Session, case_id: int):
    db.query(Prediction).filter(Prediction.case_id == case_id).delete()
    db.query(GradcamResult).filter(GradcamResult.case_id == case_id).delete()
    db.query(SegmentationResult).filter(SegmentationResult.case_id == case_id).delete()
    db.commit()


def run_mock_pipeline(db: Session, case: Case) -> dict:
    _clear_previous_results(db, case.id)

    case.status = "processing"
    db.commit()
    db.refresh(case)

    classification_model = get_active_model_by_task_type(db, "classification")
    severity_model = get_active_model_by_task_type(db, "severity")
    gradcam_model = get_active_model_by_task_type(db, "gradcam")
    segmentation_model = get_active_model_by_task_type(db, "segmentation")

    classification_model_name = (
        classification_model.model_name if classification_model else "resnet_cbam"
    )

    real_cls = predict_classification(
        case.image_path,
        model_name=classification_model_name,
    )

    pred1 = Prediction(
        case_id=case.id,
        model_registry_id=classification_model.id if classification_model else None,
        task_type="classification",
        model_name=classification_model.model_name if classification_model else real_cls["architecture"],
        model_version=classification_model.model_version if classification_model else "v1",
        label=real_cls["label"],
        confidence=real_cls["confidence"],
        raw_output_json=real_cls["raw_output_json"],
    )

    pred2 = Prediction(
        case_id=case.id,
        model_registry_id=severity_model.id if severity_model else None,
        task_type="severity",
        model_name=severity_model.model_name if severity_model else "mock_mobilenetv2",
        model_version=severity_model.model_version if severity_model else "v1",
        label="Stage 3",
        confidence=0.88,
        raw_output_json={
            "stage_1": 0.03,
            "stage_2": 0.06,
            "stage_3": 0.88,
            "stage_4": 0.03,
        },
    )

    db.add_all([pred1, pred2])
    db.commit()
    db.refresh(pred1)
    db.refresh(pred2)

    gradcam_data = generate_gradcam_artifacts(
        case.image_path,
        model_name=classification_model_name,
    )

    gradcam = GradcamResult(
        case_id=case.id,
        model_registry_id=(
            gradcam_model.id
            if gradcam_model
            else classification_model.id if classification_model else None
        ),
        model_name=gradcam_model.model_name if gradcam_model else classification_model_name,
        model_version=(
            gradcam_model.model_version
            if gradcam_model
            else classification_model.model_version if classification_model else "v1"
        ),
        target_class=gradcam_data["target_class"],
        heatmap_path=gradcam_data["heatmap_path"],
        overlay_path=gradcam_data["overlay_path"],
        metadata_json=gradcam_data["metadata_json"],
    )
    db.add(gradcam)
    db.commit()
    db.refresh(gradcam)

    vessel_mask = _copy_artifact(case.image_path, SEGMENTATION_DIR, "vessel_mask")
    vessel_overlay = _copy_artifact(case.image_path, SEGMENTATION_DIR, "vessel_overlay")

    vessel_seg = SegmentationResult(
        case_id=case.id,
        model_registry_id=segmentation_model.id if segmentation_model else None,
        segmentation_type="vessel",
        model_name=segmentation_model.model_name if segmentation_model else "mock_unet_vessel",
        model_version=segmentation_model.model_version if segmentation_model else "v1",
        mask_path=vessel_mask,
        overlay_path=vessel_overlay,
        metrics_json={"vessel_area_percent": 12.7},
    )

    pigment_mask = _copy_artifact(case.image_path, SEGMENTATION_DIR, "pigment_mask")
    pigment_overlay = _copy_artifact(case.image_path, SEGMENTATION_DIR, "pigment_overlay")

    pigment_seg = SegmentationResult(
        case_id=case.id,
        model_registry_id=segmentation_model.id if segmentation_model else None,
        segmentation_type="pigment",
        model_name=segmentation_model.model_name if segmentation_model else "mock_unet_pigment",
        model_version=segmentation_model.model_version if segmentation_model else "v1",
        mask_path=pigment_mask,
        overlay_path=pigment_overlay,
        metrics_json={"pigment_area_percent": 6.1},
    )

    db.add_all([vessel_seg, pigment_seg])
    db.commit()
    db.refresh(vessel_seg)
    db.refresh(pigment_seg)

    case.status = "done"
    db.commit()
    db.refresh(case)

    return {
        "predictions": [pred1, pred2],
        "gradcam_results": [gradcam],
        "segmentation_results": [vessel_seg, pigment_seg],
    }