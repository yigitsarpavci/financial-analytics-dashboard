from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api import api_router
from app.core.config import settings

app = FastAPI(
    title="FinTech Intelligence Platform API",
    description="API for personal finance, portfolio analysis, and trading simulation.",
    version="1.0.0"
)

# CORS configuration
origins = ["http://localhost:3000"]
if hasattr(settings, "FRONTEND_CORS_ORIGINS") and settings.FRONTEND_CORS_ORIGINS:
    # E.g. FRONTEND_CORS_ORIGINS="http://localhost:3000,https://my-vercel-app.vercel.app"
    origins.extend([origin.strip() for origin in settings.FRONTEND_CORS_ORIGINS.split(",")])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "API is healthy and running!"}
