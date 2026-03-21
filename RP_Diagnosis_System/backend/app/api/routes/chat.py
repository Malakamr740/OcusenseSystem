from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.chat_message import ChatMessage
from app.models.chat_message_feedback import ChatMessageFeedback
from app.models.chat_session import ChatSession
from app.models.user import User
from app.schemas.chat import (
    ChatSessionOut,
    ChatSessionCreate,
    ChatSessionUpdate,
    ChatMessageOut,
    ChatMessageCreate,
    ChatMessageFeedbackOut,
    ChatMessageFeedbackCreate,
)
from app.services.chat_service import add_chat_message, generate_and_store_assistant_reply

router = APIRouter(prefix="/chat", tags=["chat"])


def _get_accessible_session(
    session_id: int,
    db: Session,
    current_user: User,
) -> ChatSession:
    session = (
        db.query(ChatSession)
        .filter(
            ChatSession.id == session_id,
            ChatSession.deleted_at.is_(None),
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found",
        )

    if session.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to access this chat session",
        )

    return session


def _get_accessible_message(
    message_id: int,
    db: Session,
    current_user: User,
) -> ChatMessage:
    message = db.query(ChatMessage).filter(ChatMessage.id == message_id).first()

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat message not found",
        )

    _get_accessible_session(message.session_id, db, current_user)
    return message


@router.post("/sessions", response_model=ChatSessionOut, status_code=status.HTTP_201_CREATED)
def create_chat_session(
    payload: ChatSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = ChatSession(
        user_id=current_user.id,
        title=payload.title,
        context_type=payload.context_type,
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return session


@router.get("/sessions/me", response_model=list[ChatSessionOut])
def list_my_chat_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sessions = (
        db.query(ChatSession)
        .filter(
            ChatSession.user_id == current_user.id,
            ChatSession.deleted_at.is_(None),
        )
        .order_by(ChatSession.created_at.desc())
        .all()
    )

    return sessions


@router.get("/sessions/{session_id}", response_model=ChatSessionOut)
def get_chat_session(
    session_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _get_accessible_session(session_id, db, current_user)


@router.patch("/sessions/{session_id}", response_model=ChatSessionOut)
def update_chat_session(
    payload: ChatSessionUpdate,
    session_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = _get_accessible_session(session_id, db, current_user)

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(session, field, value)

    db.commit()
    db.refresh(session)

    return session


@router.delete("/sessions/{session_id}")
def soft_delete_chat_session(
    session_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = _get_accessible_session(session_id, db, current_user)
    session.deleted_at = datetime.now(timezone.utc)

    db.commit()

    return {"message": "Chat session deleted successfully"}


@router.get("/sessions/{session_id}/messages", response_model=list[ChatMessageOut])
def list_chat_messages(
    session_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = _get_accessible_session(session_id, db, current_user)

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    return messages


@router.post("/sessions/{session_id}/messages", response_model=list[ChatMessageOut])
def send_chat_message(
    payload: ChatMessageCreate,
    session_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = _get_accessible_session(session_id, db, current_user)

    user_message = add_chat_message(
        db,
        session_id=session.id,
        role="user",
        content=payload.content,
    )

    assistant_message = generate_and_store_assistant_reply(
        db,
        session=session,
        user_message=payload.content,
    )

    return [user_message, assistant_message]


@router.post("/messages/{message_id}/feedback", response_model=ChatMessageFeedbackOut, status_code=status.HTTP_201_CREATED)
def add_message_feedback(
    payload: ChatMessageFeedbackCreate,
    message_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    message = _get_accessible_message(message_id, db, current_user)

    existing_feedback = (
        db.query(ChatMessageFeedback)
        .filter(
            ChatMessageFeedback.message_id == message.id,
            ChatMessageFeedback.user_id == current_user.id,
        )
        .first()
    )

    if existing_feedback:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Feedback already submitted for this message by this user",
        )

    feedback = ChatMessageFeedback(
        message_id=message.id,
        user_id=current_user.id,
        rating=payload.rating,
        comment=payload.comment,
    )

    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return feedback