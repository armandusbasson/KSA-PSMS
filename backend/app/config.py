import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings"""
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    API_TITLE: str = "Kulkoni SA Power Station Management API"
    API_VERSION: str = "1.0.0"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
