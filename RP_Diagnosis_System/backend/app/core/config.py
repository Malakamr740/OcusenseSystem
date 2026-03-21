from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "RP Platform"
    API_V1_STR: str = "/api"

    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "RPDatabase"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "Retinitis_Pigmentosa_DB"

    JWT_SECRET_KEY: str = "8f4c2b1e9a7d6c5f3b2a1d9e8f7c6b5a4d3e2f1c9b8a7d6e5f4c3b2a1d9e8f"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    STORAGE_DIR: str = "app/storage/uploads"

    # email verification
    EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    APP_FRONTEND_URL: str = "http://localhost:5173"

    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = "malakamrismail740@gmail.com"
    SMTP_PASSWORD: str = "rgneimzykrvrzqpq"
    SMTP_FROM_EMAIL: str = "malakamrismail740@gmail.com"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    GOOGLE_WEB_CLIENT_ID: str = "YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com"

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql+psycopg2://{self.POSTGRES_USER}:"
            f"{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:"
            f"{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = 60

settings = Settings()