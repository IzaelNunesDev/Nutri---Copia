"""
Application configuration
"""
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # MongoDB
    MONGODB_URL: str
    DATABASE_NAME: str = "nutri_gestantes"
    
    # API
    API_V1_PREFIX: str = "/api"

    # Auth
    SECRET_KEY: str = "your-secret-key-please-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Email/SMTP Configuration
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = ""
    SMTP_FROM_NAME: str = "NutriPré"
    FRONTEND_URL: str = "http://localhost:5173"  # URL do frontend para o link de reset
    
    # Environment
    ENVIRONMENT: str = "development"
    ALLOWED_ORIGINS: str = "http://localhost:5173"
    
    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore"
    }

    @property
    def frontend_url_parsed(self) -> str:
        """Ensure FRONTEND_URL has protocol"""
        url = self.FRONTEND_URL
        if url and not url.startswith("http"):
            return f"https://{url}"
        return url

settings = Settings()

