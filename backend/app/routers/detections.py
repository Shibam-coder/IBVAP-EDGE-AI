"""
Detection, inference pipeline, mock triggers, and AI status API endpoints.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel

from ...services.event_service import event_service
from ...services.detection_service import detection_service
from ...ai.tripwire import check_tripwire_crossing
from ...ai.threat_service import ThreatAnalysisInput, calculate_threat_score
from ..schemas import (
    ApiResponse,
    DetectionItem,
    Point2D,
    ProcessFrameRequest,
    ProcessFrameResponseData,
    get_current_utc_timestamp,
)

router = APIRouter(tags=["Detections & AI Inference"])


# ==========================================
# 1. AI STATUS & DIAGNOSTICS
# ==========================================
@router.get("/api/ai/status", summary="AI / YOLO Detector Diagnostic Status")
@router.get("/ai/status", summary="AI Detector Status (Alias)")
async def get_ai_status() -> Dict[str, Any]:
    """Return status of YOLO model and CV processing layer."""
    return {
        "success": True,
        "detector": detection_service.get_status(),
        "timestamp": get_current_utc_timestamp(),
    }


# ==========================================
# 2. CANONICAL PIPELINE PROCESS FRAME & MOCK TRIGGER
# ==========================================
@router.post(
    "/api/v1/process-frame",
    response_model=ApiResponse[ProcessFrameResponseData],
    summary="Process Frame / Video Detection Request"
)
async def process_frame(request: ProcessFrameRequest) -> ApiResponse[ProcessFrameResponseData]:
    """
    Process video frame / detection request through full pipeline:
    AI Detection -> Tripwire Crossings -> Threat Evaluation & XAI -> WebSocket Broadcast
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
    "/api/v1/mock/trigger",
    response_model=ApiResponse[Dict[str, Any]],
    summary="Trigger Deterministic Simulated Intrusion Scenario"
)
async def trigger_mock_sequence(
    scenario: str = Query("human_crossing", description="Simulation scenario: human_crossing, vehicle_approach, default"),
    step: int = Query(1, ge=0, le=2, description="Scenario timeline step (0: approach, 1: breach, 2: interior)"),
    camera_id: str = Query("CAM-01", description="Camera source identifier")
) -> ApiResponse[Dict[str, Any]]:
    """
    Trigger complete end-to-end mock event flow for real-time WebSocket client testing.
    Demonstrates: Detection -> Kinematic Motion -> Tripwire Crossing (INBOUND) -> Threat Score (0-100) -> XAI Rationale -> WebSocket.
    """
    result = await event_service.trigger_mock_sequence(
        scenario=scenario,
        step=step,
        camera_id=camera_id
    )
    return ApiResponse(
        success=True,
        data=result,
        message=f"Mock sequence '{scenario}' (step {step}) executed and broadcast to WebSockets",
        timestamp=get_current_utc_timestamp()
    )


@router.get(
    "/api/v1/detections/latest",
    response_model=ApiResponse[List[DetectionItem]],
    summary="Get Latest Detections Snapshot"
)
async def get_latest_detections(camera_id: str = "CAM-01") -> ApiResponse[List[DetectionItem]]:
    """Return recent detections snapshot for initial UI render."""
    detections = detection_service.process_scenario("default", step=0, camera_id=camera_id)
    return ApiResponse(
        success=True,
        data=detections,
        timestamp=get_current_utc_timestamp()
    )


# ==========================================
# 3. DIRECT MODULAR TEST ENDPOINTS
# ==========================================
class DetectionProcessRequest(BaseModel):
    camera_id: str = "CAM-01"
    scenario: Optional[str] = "default"
    step: Optional[int] = 0
    raw_frame_b64: Optional[str] = None


class TripwirePointInput(BaseModel):
    x: float
    y: float


class TripwireEvaluateRequest(BaseModel):
    camera_id: str = "CAM-01"
    tripwire_id: str = "TW-01"
    start_point: TripwirePointInput
    end_point: TripwirePointInput
    previous_centroid: TripwirePointInput
    current_centroid: TripwirePointInput
    direction: str = "BIDIRECTIONAL"
    object_id: Optional[str] = "OBJ-01"
    target_class: str = "HUMAN"
    confidence: float = 0.95


class ThreatCalcRequest(BaseModel):
    objectType: str = "HUMAN"
    confidence: float = 0.95
    tripwireBreached: bool = False
    crossingDirection: Optional[str] = "INBOUND"
    speedMps: Optional[float] = None
    speedKmH: Optional[float] = None
    isRestrictedZone: bool = False
    isNight: bool = False
    weaponDetected: bool = False
    isBlacklisted: bool = False
    posture: Optional[str] = None
    zoneName: str = "Sector 7G"
    tripwireName: str = "Outer Perimeter Line Alpha"


@router.post("/api/detection/process", summary="Process Detections Direct Endpoint")
async def process_detection_direct(request: DetectionProcessRequest) -> Dict[str, Any]:
    """Process detections for a camera feed or deterministic test scenario."""
    if request.scenario:
        detections = detection_service.process_scenario(
            scenario_name=request.scenario,
            step=request.step or 0,
            camera_id=request.camera_id,
        )
    else:
        detections = detection_service.process_frame(
            frame=request.raw_frame_b64,
            camera_id=request.camera_id,
        )

    return {
        "success": True,
        "camera_id": request.camera_id,
        "timestamp": get_current_utc_timestamp(),
        "count": len(detections),
        "detections": [d.to_dict() for d in detections],
    }


@router.post("/api/tripwire/evaluate", summary="Evaluate Tripwire Line Crossing Direct Endpoint")
async def evaluate_tripwire_direct(request: TripwireEvaluateRequest) -> Dict[str, Any]:
    """Evaluate if an object movement crosses a tripwire and determine crossing direction."""
    result = check_tripwire_crossing(
        previous_centroid=Point2D(x=request.previous_centroid.x, y=request.previous_centroid.y),
        current_centroid=Point2D(x=request.current_centroid.x, y=request.current_centroid.y),
        tripwire_start=Point2D(x=request.start_point.x, y=request.start_point.y),
        tripwire_end=Point2D(x=request.end_point.x, y=request.end_point.y),
        tripwire_id=request.tripwire_id,
        object_id=request.object_id,
        required_direction=request.direction,
        confidence=request.confidence,
        camera_id=request.camera_id,
        target_class=request.target_class,
    )
    return {
        "success": True,
        "result": result,
    }


@router.post("/api/threat/calculate", summary="Calculate Threat Score Direct Endpoint")
async def calculate_threat_direct(request: ThreatCalcRequest) -> Dict[str, Any]:
    """Calculate threat score and XAI explanation for an identified target."""
    inp = ThreatAnalysisInput(
        objectType=request.objectType,
        confidence=request.confidence,
        tripwireBreached=request.tripwireBreached,
        crossingDirection=request.crossingDirection,
        speedMps=request.speedMps,
        speedKmH=request.speedKmH,
        isRestrictedZone=request.isRestrictedZone,
        isNight=request.isNight,
        weaponDetected=request.weaponDetected,
        isBlacklisted=request.isBlacklisted,
        posture=request.posture,
        zoneName=request.zoneName,
        tripwireName=request.tripwireName,
    )
    res = calculate_threat_score(inp)
    return {
        "success": True,
        "data": res,
    }
