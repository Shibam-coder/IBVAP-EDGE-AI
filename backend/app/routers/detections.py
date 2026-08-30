"""
Detection, inference pipeline, and mock trigger API endpoints.
"""

from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException, status
from ...services.event_service import event_service
from ...ai.mock_detections import generate_mock_detection_sequence
from ..schemas import (
    ApiResponse,
    DetectionItem,
    ProcessFrameRequest,
    ProcessFrameResponseData,
    get_current_utc_timestamp,
)

router = APIRouter(prefix="/api/v1", tags=["Detections & Inference"])


@router.post(
    "/process-frame",
    response_model=ApiResponse[ProcessFrameResponseData],
    summary="Process Frame / Video Detection Request"
)
async def process_frame(request: ProcessFrameRequest) -> ApiResponse[ProcessFrameResponseData]:
    """
    Process an incoming video frame or detection query through the AI/tripwire/threat pipeline.
    Broadcasting the resulting events to active WebSocket connections.
    """
    try:
        data = await event_service.process_frame(request)
        return ApiResponse(
            success=True,
            data=data,
            message="Frame processed successfully",
            timestamp=get_current_utc_timestamp()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference pipeline failure: {str(exc)}"
        )


@router.post(
    "/mock/trigger",
    response_model=ApiResponse[Dict[str, Any]],
    summary="Trigger Mock Detection -> Tripwire -> Threat Event Flow"
)
async def trigger_mock_sequence(camera_id: str = "CAM-01") -> ApiResponse[Dict[str, Any]]:
    """
    Trigger end-to-end mock event flow for real-time WebSocket client testing.
    """
    result = await event_service.trigger_mock_sequence(camera_id=camera_id)
    return ApiResponse(
        success=True,
        data=result,
        message="Mock sequence triggered and broadcast to WebSockets",
        timestamp=get_current_utc_timestamp()
    )


@router.get(
    "/detections/latest",
    response_model=ApiResponse[List[DetectionItem]],
    summary="Get Latest Detections"
)
async def get_latest_detections() -> ApiResponse[List[DetectionItem]]:
    """
    Return recent detections snapshot for initial UI render.
    """
    detections, _, _ = generate_mock_detection_sequence()
    return ApiResponse(
        success=True,
        data=detections,
        timestamp=get_current_utc_timestamp()
    )
