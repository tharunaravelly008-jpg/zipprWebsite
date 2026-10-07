import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import setup_logging
from app.core.exceptions import ZipprException
from app.api.v1 import api_router
from app.db.base import engine

# Lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    setup_logging()
    logging.info("Zippr backend API starting up...")
    yield
    # Shutdown tasks
    logging.info("Zippr backend API shutting down...")
    await engine.dispose()

app = FastAPI(
    title="Zippr Ride-Hailing Platform",
    description="Unified bike, auto, and cab booking application backend APIs.",
    version="0.1.0",
    lifespan=lifespan
)

# CORS Middleware
_cors_origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
is_wildcard = "*" in _cors_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[] if is_wildcard else _cors_origins,
    allow_origin_regex=r".*" if is_wildcard else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handlers
@app.exception_handler(ZipprException)
async def zippr_exception_handler(request: Request, exc: ZipprException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "code": exc.code}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"Unhandled Exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred", "code": "INTERNAL_SERVER_ERROR"}
    )

# Root Health Checks
@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "healthy", "service": "zippr-backend"}

# Mount API Routers
app.include_router(api_router)
