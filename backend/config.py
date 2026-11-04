"""Environment-based configuration. No secrets or absolute paths are hardcoded."""

import os
from pathlib import Path

from dotenv import load_dotenv

REPO_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(REPO_ROOT / ".env")


def _as_bool(value, default=False):
    if value is None:
        return default
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


class Config:
    # API_PORT is separate from PORT to avoid conflicts with the Node server.
    HOST = os.getenv("API_HOST", "127.0.0.1")
    PORT = int(os.getenv("API_PORT", "5000"))
    DEBUG = _as_bool(os.getenv("FLASK_DEBUG"), False)

    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173"
        ).split(",")
        if origin.strip()
    ]

    SAVED_MODELS_DIR = Path(
        os.getenv("SAVED_MODELS_DIR", REPO_ROOT / "saved_models")
    )

    YF_TIMEOUT = float(os.getenv("YF_TIMEOUT", "8"))
    YF_HEALTH_TTL = float(os.getenv("YF_HEALTH_TTL", "30"))
