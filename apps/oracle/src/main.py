import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routes import router
from src.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start background scheduler on startup, cancel on shutdown."""
    interval = getattr(settings, "scoring_interval_seconds", 300)
    task = asyncio.create_task(_scheduler_loop(interval))
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


async def _scheduler_loop(interval: int):
    """Refresh ARES scores for tracked wallets every `interval` seconds."""
    from src.scheduler.jobs import periodic_score_refresh
    while True:
        try:
            await periodic_score_refresh()
        except Exception:
            pass
        await asyncio.sleep(interval)


app = FastAPI(
    title="ARES Oracle",
    description="AI Reputation & Execution Settlement Oracle for arenapay",
    version="0.1.0",
    lifespan=lifespan,
)

# PRD §14.1 — Oracle is internal-only; restrict CORS to API service
_origins = [o.strip() for o in settings.allowed_origins.split(",") if o.strip()] if settings.allowed_origins else []

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins if _origins else ["http://api:3000"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ares-oracle"}
