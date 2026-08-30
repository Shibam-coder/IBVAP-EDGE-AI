"""
Health check endpoints for IBVAP-EDGE-AI.
"""

from fastapi import APIRouter
from ..config import settings
from ..schemas import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse, summary="System Health Status")
async def get_health() -> HealthResponse:
    """
    Standard health check endpoint (Step 3).
    Returns status, service identifier, and local runtime mode.
    """
    return HealthResponse(
        status="ok",
        service=settings.SERVICE_NAME,
        mode=settings.MODE
    )
