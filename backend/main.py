import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
import backend.models  # Ensures all ORM models are registered in Base.metadata
from backend.database import engine, Base, SessionLocal
from backend.services.demo_generator import DemoDataGenerator

# Routers
from backend.routers import (
    dashboard, datasets, parcels, conflicts,
    ai_analysis, audit_logs, reports, demo
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Urban Land Record Harmonization & Intelligence Platform for Ministry of Rural Development (SIH26013)",
    version=settings.VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://bhumi-sync-812a.onrender.com"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(dashboard.router)
app.include_router(datasets.router)
app.include_router(parcels.router)
app.include_router(conflicts.router)
app.include_router(ai_analysis.router)
app.include_router(audit_logs.router)
app.include_router(reports.router)
app.include_router(demo.router)

@app.on_event("startup")
def on_startup():
    """
    Auto-seeds database on startup if empty.
    """
    db = SessionLocal()
    try:
        DemoDataGenerator.seed_demo_data(db, force_reset=False)
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "organization": settings.ORGANIZATION,
        "problem_statement": settings.PROBLEM_STATEMENT,
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "api_documentation": "/api/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
