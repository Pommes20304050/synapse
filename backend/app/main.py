from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .database import engine, Base
from .routers import auth, notes, ai, search, settings
from .models import User, Note, Setting  # ensure models are imported for table creation

cfg = get_settings()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Synapse API",
    description="AI-powered personal knowledge management system",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cfg.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(notes.router)
app.include_router(ai.router)
app.include_router(search.router)
app.include_router(settings.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}
