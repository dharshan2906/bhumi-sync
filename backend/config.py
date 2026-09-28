import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
UPLOADS_DIR = DATA_DIR / "uploads"
EXPORTS_DIR = DATA_DIR / "exports"
DEMO_DIR = DATA_DIR / "demo"

UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
DEMO_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseModel):
    PROJECT_NAME: str = "BHUMI-SYNC"
    VERSION: str = "1.0.0"
    ORGANIZATION: str = "Ministry of Rural Development"
    PROBLEM_STATEMENT: str = "SIH26013 - Urban Land Record Harmonization"
    TAGLINE: str = "One Map. One Truth. Smarter Land Records."
    DEFAULT_CRS: str = "EPSG:4326"
    METRIC_CRS: str = "EPSG:32643"  # UTM Zone 43N for India
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/bhumi_sync.db")
    MAX_UPLOAD_SIZE_MB: int = 50
    JWT_SECRET: str = "bhumi_sync_sih_2026_super_secret_key"
    ALLOWED_HOSTS: list[str] = ["*"]

settings = Settings()
