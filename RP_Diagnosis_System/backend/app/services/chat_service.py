from sqlalchemy.orm import Session

from app.models.chat_message import ChatMessage
from app.models.chat_session import ChatSession
from app.services.chatbot_service import chatbot_service


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


def _make_session_title_from_message(text: str, max_len: int = 60) -> str:
    cleaned = " ".join(str(text).strip().split())
    if not cleaned:
        return "New Eye Chat"

    cleaned = cleaned[0].upper() + cleaned[1:] if len(cleaned) > 1 else cleaned.upper()

    if len(cleaned) > max_len:
        cleaned = cleaned[: max_len - 3].rstrip() + "..."

    return cleaned


def _update_session_title_if_first_user_message(
    db: Session,
    *,
    session: ChatSession,
    user_message: str,
) -> None:
    existing_user_message_count = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.session_id == session.id,
            ChatMessage.role == "user",
        )
        .count()
    )

    if existing_user_message_count == 1:
        session.title = _make_session_title_from_message(user_message)
        db.commit()
        db.refresh(session)


def generate_and_store_assistant_reply(
    db: Session,
    *,
    session: ChatSession,
    user_message: str,
) -> ChatMessage:
    _update_session_title_if_first_user_message(
        db,
        session=session,
        user_message=user_message,
    )

    chatbot_result = chatbot_service.get_reply(session.id, user_message)

    if chatbot_result is None:
        reply_text = "Sorry, I could not find a confident eye-related answer."
    else:
        reply_text = chatbot_result["reply"]

    return add_chat_message(
        db,
        session_id=session.id,
        role="assistant",
        content=reply_text,
    )