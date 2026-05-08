from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "FinTech Intelligence Platform"
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/fintech"
    SECRET_KEY: str = "supersecretkey"  # In production, this should be set via env var
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 1 day

    # CORS
    FRONTEND_CORS_ORIGINS: str = ""

    # AI
    OPENAI_API_KEY: str | None = None

    class Config:
        env_file = ".env"

settings = Settings()
