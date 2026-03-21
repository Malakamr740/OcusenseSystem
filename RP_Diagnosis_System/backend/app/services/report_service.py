import os
from uuid import uuid4

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Image,
    Table,
    TableStyle,
)

from sqlalchemy.orm import Session

from app.models.case import Case
from app.models.patient import PatientProfile
from app.models.prediction import Prediction
from app.models.gradcam_result import GradcamResult
from app.models.segmentation_result import SegmentationResult
from app.models.report import Report
from app.services.app_settings_service import get_or_create_app_settings


REPORTS_DIR = "app/storage/reports"


def _ensure_reports_dir():
    os.makedirs(REPORTS_DIR, exist_ok=True)


def _fit_image(image_path: str, max_width: float, max_height: float) -> Image | None:
    if not image_path or not os.path.exists(image_path):
        return None

    img = Image(image_path)
    width = img.imageWidth
    height = img.imageHeight

    if width <= 0 or height <= 0:
        return None

    ratio = min(max_width / width, max_height / height)
    img.drawWidth = width * ratio
    img.drawHeight = height * ratio
    return img


def _build_info_table(data: list[list[str]]) -> Table:
    table = Table(data, colWidths=[5 * cm, 10.5 * cm])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (1, 0), colors.HexColor("#DCEAF7")),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.black),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return table


def generate_case_report(db: Session, case: Case) -> Report:
    _ensure_reports_dir()

    app_settings = get_or_create_app_settings(db)

    patient = db.query(PatientProfile).filter(PatientProfile.id == case.patient_profile_id).first()

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

    filename = f"case_{case.id}_{uuid4().hex}.pdf"
    pdf_path = os.path.join(REPORTS_DIR, filename)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=1.5 * cm,
        leftMargin=1.5 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
    )

    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="SectionTitle",
            parent=styles["Heading2"],
            spaceBefore=10,
            spaceAfter=8,
            textColor=colors.HexColor("#174A7C"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="SmallNote",
            parent=styles["BodyText"],
            fontSize=9,
            textColor=colors.grey,
            leading=12,
        )
    )

    story = []

    report_title = app_settings.hospital_name or "RP Diagnosis System"
    story.append(Paragraph(report_title, styles["Title"]))
    story.append(Spacer(1, 0.15 * cm))
    story.append(Paragraph("Retinitis Pigmentosa Diagnosis Report", styles["Heading2"]))
    story.append(Spacer(1, 0.3 * cm))

    patient_name = patient.full_name if patient else "Unknown"
    patient_code = patient.patient_code if patient else "Unknown"
    patient_dob = str(patient.date_of_birth) if patient and patient.date_of_birth else "N/A"
    patient_sex = patient.sex if patient and patient.sex else "N/A"

    info_table = _build_info_table(
        [
            ["Field", "Value"],
            ["Patient Name", patient_name],
            ["Patient Code", patient_code],
            ["Date of Birth", patient_dob],
            ["Sex", patient_sex],
            ["Case ID", str(case.id)],
            ["Case Status", case.status],
            ["Case Created At", str(case.created_at)],
            ["Support Email", app_settings.support_email or "N/A"],
        ]
    )
    story.append(info_table)
    story.append(Spacer(1, 0.4 * cm))

    story.append(Paragraph("Original Fundus Image", styles["SectionTitle"]))
    original_img = _fit_image(case.image_path, max_width=15 * cm, max_height=8 * cm)
    if original_img:
        story.append(original_img)
    else:
        story.append(Paragraph("Original image not available.", styles["BodyText"]))
    story.append(Spacer(1, 0.4 * cm))

    story.append(Paragraph("Diagnosis Results", styles["SectionTitle"]))
    if predictions:
        pred_rows = [["Task", "Model", "Version", "Label", "Confidence"]]
        for p in predictions:
            pred_rows.append(
                [
                    p.task_type,
                    p.model_name,
                    p.model_version or "-",
                    p.label,
                    f"{p.confidence:.2f}" if p.confidence is not None else "-",
                ]
            )
        pred_table = Table(pred_rows, colWidths=[3 * cm, 4 * cm, 2.2 * cm, 4.3 * cm, 2.5 * cm])
        pred_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#DCEAF7")),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 6),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ]
            )
        )
        story.append(pred_table)
    else:
        story.append(Paragraph("No predictions available.", styles["BodyText"]))
    story.append(Spacer(1, 0.4 * cm))

    story.append(Paragraph("Grad-CAM", styles["SectionTitle"]))
    if gradcam_results:
        gradcam = gradcam_results[0]
        gradcam_img = _fit_image(gradcam.overlay_path, max_width=15 * cm, max_height=8 * cm)
        if gradcam_img:
            story.append(gradcam_img)
        else:
            story.append(Paragraph("Grad-CAM image not available.", styles["BodyText"]))
    else:
        story.append(Paragraph("No Grad-CAM result available.", styles["BodyText"]))
    story.append(Spacer(1, 0.4 * cm))

    story.append(Paragraph("Segmentation Results", styles["SectionTitle"]))
    if segmentation_results:
        for seg in segmentation_results:
            story.append(Paragraph(f"{seg.segmentation_type.title()} Segmentation", styles["Heading3"]))
            seg_img = _fit_image(seg.overlay_path or seg.mask_path, max_width=15 * cm, max_height=8 * cm)
            if seg_img:
                story.append(seg_img)
            else:
                story.append(Paragraph("Segmentation image not available.", styles["BodyText"]))
            story.append(Spacer(1, 0.25 * cm))
    else:
        story.append(Paragraph("No segmentation results available.", styles["BodyText"]))
    story.append(Spacer(1, 0.4 * cm))

    story.append(Paragraph("Disclaimer", styles["SectionTitle"]))
    story.append(
        Paragraph(
            app_settings.report_disclaimer
            or "This report is generated by an AI-assisted system for educational and decision-support purposes.",
            styles["SmallNote"],
        )
    )

    if app_settings.default_report_footer:
        story.append(Spacer(1, 0.3 * cm))
        story.append(Paragraph(app_settings.default_report_footer, styles["SmallNote"]))

    doc.build(story)

    report = Report(
        case_id=case.id,
        pdf_path=pdf_path,
        report_type="diagnosis_report",
        status="generated",
        metadata_json={
            "patient_profile_id": case.patient_profile_id,
            "prediction_count": len(predictions),
            "gradcam_count": len(gradcam_results),
            "segmentation_count": len(segmentation_results),
            "hospital_name": app_settings.hospital_name,
        },
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return report
