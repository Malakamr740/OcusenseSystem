from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, StringConstraints
from typing import Annotated

ChatTitle = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=150)]
ChatContent = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=4000)]


class ChatSessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str | None
    context_type: str | None
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None


class ChatSessionCreate(BaseModel):
    title: ChatTitle | None = None
    context_type: str | None = None


class ChatSessionUpdate(BaseModel):
    title: ChatTitle | None = None
    context_type: str | None = None


class ChatMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: int
    role: str
    content: str
    created_at: datetime
    updated_at: datetime


class ChatMessageCreate(BaseModel):
    content: ChatContent


class ChatMessageFeedbackOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    message_id: int
    user_id: int
    rating: str
    comment: str | None
    created_at: datetime
    updated_at: datetime


class ChatMessageFeedbackCreate(BaseModel):
    rating: Literal["helpful", "not_helpful"]
    comment: str | None = None