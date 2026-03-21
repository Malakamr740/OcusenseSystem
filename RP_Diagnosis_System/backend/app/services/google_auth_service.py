from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

from app.core.config import settings


def verify_google_credential(credential: str) -> dict:
    """
    Verifies a Google ID token and returns the decoded claims.
    Raises ValueError if invalid.
    """
    try:
        idinfo = google_id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            settings.GOOGLE_WEB_CLIENT_ID,
        )
        return idinfo
    except Exception as e:
        raise ValueError("Invalid Google credential") from e