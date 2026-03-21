from sqlalchemy import CheckConstraint, Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin


class ChatMessageFeedback(Base, TimestampMixin):
    __tablename__ = "chat_message_feedback"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("chat_messages.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    rating = Column(String, nullable=False)
    comment = Column(Text, nullable=True)

    __table_args__ = (
        CheckConstraint(
            "rating IN ('helpful', 'not_helpful')",
            name="ck_chat_message_feedback_rating_valid",
        ),
    )

    message = relationship("ChatMessage", back_populates="feedback")