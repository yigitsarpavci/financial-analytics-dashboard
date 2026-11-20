from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "FinTech Intelligence Platform"
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/fintech"
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "supersecretkey"  # development default only; production refuses to start with it
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 1 day

    # CORS
    FRONTEND_CORS_ORIGINS: str = ""

    # AI
    OPENAI_API_KEY: str | None = None

    class Config:
        env_file = ".env"

    @property
    def sqlalchemy_database_url(self) -> str:
        """SQLAlchemy 2.1 defaults `postgresql://` to psycopg3; this project ships psycopg2, so pin the driver."""
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = "postgresql://" + url[len("postgres://"):]
        if url.startswith("postgresql://"):
            url = "postgresql+psycopg2://" + url[len("postgresql://"):]
        return url


settings = Settings()

if settings.ENVIRONMENT.lower() == "production" and settings.SECRET_KEY == "supersecretkey":
    raise RuntimeError("SECRET_KEY must be set to a strong random value when ENVIRONMENT=production")
