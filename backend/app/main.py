"""
FastAPI Backend Application Entrypoint for IBVAP-EDGE-AI.
Problem Statement ID: 26187
"""

from contextlib import asynccontextmanager
import logging
from typing import AsyncGenerator
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .routers import detections, health, telemetry, ws
from .schemas import get_current_utc_timestamp

# Configure structured logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("backend.main")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan management for startup and graceful shutdown."""
    logger.info(f"Starting {settings.SERVICE_NAME} in '{settings.MODE}' mode...")
    logger.info(f"Allowed CORS origins: {settings.cors_origins}")
    yield
    logger.info(f"Shutting down {settings.SERVICE_NAME}...")


def create_app() -> FastAPI:
    """FastAPI application factory."""
    app = FastAPI(
        title="IBVAP-EDGE-AI Backend API",
        description="Edge AI Backend & Event Streaming for Human/Vehicle Detection, Tripwire, and XAI Threat Scoring",
        version="1.0.0",
        lifespan=lifespan
    )

    # Configure CORS for Next.js frontend
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Global Validation Error Handler
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        logger.warning(f"Validation error on {request.url.path}: {exc.errors()}")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "error": "Validation Error",
                "details": exc.errors(),
                "timestamp": get_current_utc_timestamp()
            }
        )

    # Generic Unhandled Exception Handler
    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.error(f"Unhandled exception on {request.url.path}: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": "Internal Server Error",
                "message": str(exc),
                "timestamp": get_current_utc_timestamp()
            }
        )

    # Register Routers
    app.include_router(health.router)
    app.include_router(detections.router)
    app.include_router(telemetry.router)
    app.include_router(ws.router)

    @app.get("/", summary="Root Metadata")
    async def root_info() -> dict:
        return {
            "service": settings.SERVICE_NAME,
            "version": "1.0.0",
            "status": "online",
            "mode": settings.MODE,
            "docs_url": "/docs",
            "health_url": "/health",
            "telemetry_ws": "/ws/telemetry",
            "detections_ws": "/ws/detections"
        }

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.app.main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=True
    )
