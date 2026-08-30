"""
IBVAP-EDGE-AI: API Endpoints
Provides HTTP endpoints for AI health checks, detection processing, tripwire evaluation, and threat calculation.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from backend.app.services.detection_service import detection_service
from backend.app.services.tripwire_service import tripwire_service
from backend.app.services.threat_service import calculate_threat_score, ThreatAnalysisInput
from backend.app.ai.tripwire import check_tripwire_crossing
from backend.app.models.schemas import Point2D, Centroid, BoundingBox, DetectionItem

router = APIRouter()


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "IBVAP-EDGE-AI"
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    yolo_loaded: bool = False


class BoundingBoxInput(BaseModel):
    x: float
    y: float
    width: float
    height: float


class DetectionProcessRequest(BaseModel):
    camera_id: str = "CAM-01"
    scenario: Optional[str] = "default"  # "human_crossing" | "vehicle_approach" | "default"
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
    objectType: str = "HUMAN"  # HUMAN | VEHICLE | ANIMAL | DRONE | UNKNOWN
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


@router.get("/health", response_model=HealthResponse)
def get_health() -> Dict[str, Any]:
    """Health check endpoint required by contract."""
    status = detection_service.get_status()
    return {
        "status": "ok",
        "service": "IBVAP-EDGE-AI",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "yolo_loaded": status.get("is_yolo_loaded", False),
    }


@router.get("/ai/status")
def get_ai_status() -> Dict[str, Any]:
    """Return status of YOLO model and CV processing layer."""
    return {
        "success": True,
        "detector": detection_service.get_status(),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.post("/detection/process")
def process_detection(request: DetectionProcessRequest) -> Dict[str, Any]:
    """
    Process detections for a camera feed or deterministic test scenario.
    Returns normalized DetectionItem list compatible with frontend DetectionOverlay.
    """
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
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "count": len(detections),
        "detections": [d.to_dict() for d in detections],
    }


@router.post("/tripwire/evaluate")
def evaluate_tripwire(request: TripwireEvaluateRequest) -> Dict[str, Any]:
    """
    Evaluate if an object movement crosses a tripwire and determine crossing direction.
    """
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


@router.post("/threat/calculate")
def calculate_threat(request: ThreatCalcRequest) -> Dict[str, Any]:
    """
    Calculate threat score and XAI explanation for an identified target.
    """
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
