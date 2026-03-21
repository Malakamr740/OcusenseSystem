from sqlalchemy.orm import Session

from app.models.chat_message import ChatMessage
from app.models.chat_session import ChatSession


def generate_mock_chatbot_reply(user_message: str, context_type: str | None = None) -> str:
    text = user_message.lower().strip()

    if "retinitis pigmentosa" in text or "rp" in text:
        return (
            "Retinitis pigmentosa (RP) is a group of inherited retinal disorders "
            "that can gradually affect peripheral vision and night vision. "
            "Please consult an ophthalmologist for medical advice."
        )

    if "fundus" in text:
        return (
            "A fundus image shows the back of the eye, including the retina, optic disc, "
            "and blood vessels."
        )

    if "gradcam" in text:
        return (
            "Grad-CAM is an explainability method that highlights image regions that influenced "
            "the model prediction."
        )

    if "segmentation" in text:
        return (
            "Segmentation identifies specific structures or lesions in the image, such as vessels "
            "or pigment regions."
        )

    if context_type == "diagnosis_help":
        return (
            "I can help explain diagnosis-related concepts such as classification, severity, "
            "Grad-CAM, and segmentation results."
        )

    return (
        "I can help answer general questions about ocular diseases, RP, diagnosis outputs, "
        "and image analysis features in this system."
    )


def add_chat_message(
    db: Session,
    *,
    session_id: int,
    role: str,
    content: str,
) -> ChatMessage:
    message = ChatMessage(
        session_id=session_id,
        role=role,
        content=content,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


def generate_and_store_assistant_reply(
    db: Session,
    *,
    session: ChatSession,
    user_message: str,
) -> ChatMessage:
    reply_text = generate_mock_chatbot_reply(
        user_message=user_message,
        context_type=session.context_type,
    )
    return add_chat_message(
        db,
        session_id=session.id,
        role="assistant",
        content=reply_text,
    )