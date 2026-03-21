from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin


class ChatMessage(Base, TimestampMixin):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)

    role = Column(String, nullable=False)   # user / assistant
    content = Column(Text, nullable=False)

    session = relationship("ChatSession", back_populates="messages")
    feedback = relationship("ChatMessageFeedback", back_populates="message")