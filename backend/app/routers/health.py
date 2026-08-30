"""
Health check endpoints for IBVAP-EDGE-AI.
"""

from fastapi import APIRouter
from ...services.detection_service import detection_service
from ..config import settings
from ..schemas import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse, summary="System Health Status")
async def get_health() -> HealthResponse:
    """
    Standard health check endpoint.
    Returns status, service identifier, local runtime mode, and YOLO model load status.
    """
    detector_status = detection_service.get_status()
    return HealthResponse(
        status="ok",
        service=settings.SERVICE_NAME,
        mode=settings.MODE,
        yolo_loaded=detector_status.get("is_yolo_loaded", False)
    )
