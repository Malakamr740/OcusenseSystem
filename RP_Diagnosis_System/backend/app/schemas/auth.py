from typing import Annotated, Literal

from pydantic import BaseModel, EmailStr, StringConstraints, field_validator

FullName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=100)]
PasswordStr = Annotated[str, StringConstraints(min_length=8, max_length=128)]


class RegisterRequest(BaseModel):
    email: EmailStr
    password: PasswordStr
    role: Literal["patient", "doctor"]
    full_name: FullName

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: str) -> str:
        if len(value.split()) < 2:
            raise ValueError("Full name must contain at least first name and last name")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: PasswordStr


class GoogleLoginRequest(BaseModel):
    credential: str
    role: Literal["patient", "doctor"] | None = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: PasswordStr


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MessageResponse(BaseModel):
    message: str