from datetime import datetime, timezone

from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User
from app.models.admin import AdminProfile


ADMIN_EMAIL = "admin@gmail.com"
ADMIN_PASSWORD = "Admin123456"
ADMIN_FULL_NAME = "System Admin"


def main():
    db = SessionLocal()

    try:
        existing_admin = db.execute(
            select(User).where(User.role == "admin")
        ).scalar_one_or_none()

        if existing_admin:
            print("Admin already exists.")
            return

        admin_user = User(
            email=ADMIN_EMAIL,
            password_hash=hash_password(ADMIN_PASSWORD),
            role="admin",
            is_active=True,
            auth_provider="local",
            email_verified_at=datetime.now(timezone.utc),
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        admin_profile = AdminProfile(
            user_id=admin_user.id,
            full_name=ADMIN_FULL_NAME,
        )
        db.add(admin_profile)
        db.commit()

        print("Initial admin created successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    main()