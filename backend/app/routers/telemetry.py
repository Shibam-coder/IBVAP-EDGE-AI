"""
Telemetry and threat overview REST endpoints matching frontend contracts in frontend/src/lib/api.ts.
"""

from typing import List
from fastapi import APIRouter
from ...ai.mock_detections import generate_mock_detection_sequence
from ..schemas import (
    ApiResponse,
    TelemetrySummary,
    ThreatAlert,
    get_current_utc_timestamp,
)

router = APIRouter(prefix="/api/v1", tags=["Telemetry & Threats"])


@router.get("/threats", response_model=ApiResponse[List[ThreatAlert]], summary="Get Active Threat Alerts")
async def get_threat_alerts() -> ApiResponse[List[ThreatAlert]]:
    """Retrieve active threat alerts with XAI breakdown for frontend UI."""
    _, _, threats = generate_mock_detection_sequence()
    return ApiResponse(
        success=True,
        data=threats,
        timestamp=get_current_utc_timestamp()
    )


@router.get("/telemetry", response_model=ApiResponse[TelemetrySummary], summary="Get System Telemetry Status")
async def get_telemetry() -> ApiResponse[TelemetrySummary]:
    """Retrieve edge AI node telemetry, FPS, and status for frontend UI."""
    summary = TelemetrySummary()
    return ApiResponse(
        success=True,
        data=summary,
        timestamp=get_current_utc_timestamp()
    )
