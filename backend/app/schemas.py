"""
Canonical Pydantic Schemas and Frontend Integration Contracts for IBVAP-EDGE-AI.
Problem Statement ID: 26187
"""

from datetime import datetime, timezone
from typing import Any, Dict, Generic, List, Literal, Optional, Tuple, TypeVar, Union
from pydantic import BaseModel, Field


def get_current_utc_timestamp() -> str:
    """Generate ISO 8601 UTC timestamp."""
    return datetime.now(timezone.utc).isoformat()


# ==========================================
# 1. ENUMS & BASIC PRIMITIVES
# ==========================================
SeverityLevel = Literal["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]
DetectionCategory = Literal["HUMAN", "VEHICLE", "ANIMAL", "DRONE", "UNKNOWN"]
CrossingDirection = Literal["INBOUND", "OUTBOUND", "BIDIRECTIONAL", "UNKNOWN"]


class Point2D(BaseModel):
    """2D point coordinate (normalized 0..1 or pixel value)."""
    x: float
    y: float

    def to_tuple(self) -> Tuple[float, float]:
        return (self.x, self.y)


Centroid = Point2D  # Alias for compatibility


class BoundingBox(BaseModel):
    """Bounding box coordinates (normalized 0..1 or pixel values)."""
    x: float = Field(..., description="Top-left X coordinate")
    y: float = Field(..., description="Top-left Y coordinate")
    width: float = Field(..., description="Box width")
    height: float = Field(..., description="Box height")


# ==========================================
# 2. CANONICAL DETECTION EVENT
# ==========================================
class DetectionEvent(BaseModel):
    """
    Canonical Detection Event format for AI -> Backend -> Frontend contract.
    """
    event_id: str = Field(..., description="Unique event identifier (UUID or hash)")
    camera_id: str = Field(..., description="Source camera identifier")
    timestamp: str = Field(default_factory=get_current_utc_timestamp, description="ISO timestamp")
    object_id: Union[str, int] = Field(..., description="Persistent track ID or detection index")
    object_type: str = Field(..., description="Object classification (e.g. human, vehicle)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Detection confidence score (0.0 - 1.0)")
    bbox: Union[BoundingBox, List[float], Dict[str, float]] = Field(
        ..., description="Bounding box representation [x, y, width, height] or {x, y, width, height}"
    )
    centroid: Union[Point2D, List[float], Tuple[float, float], Dict[str, float]] = Field(
        ..., description="Centroid coordinate [x, y] or {x, y}"
    )
    speed: Optional[float] = Field(None, ge=0.0, description="Speed in meters/sec or km/h")
    previous_centroid: Optional[Union[Point2D, List[float], Tuple[float, float], Dict[str, float]]] = Field(
        None, description="Previous centroid coordinate for kinematic tracking"
    )


# ==========================================
# 3. FRONTEND-COMPATIBLE DETECTION ITEM
# ==========================================
class DetectionItem(BaseModel):
    """
    Detection item schema fully compatible with Next.js frontend DetectionOverlay.tsx & detectionAdapter.ts.
    """
    id: str = Field(..., description="Detection or track identifier")
    camera_id: Optional[str] = Field("CAM-01", description="Camera source")
    timestamp: str = Field(default_factory=get_current_utc_timestamp)
    confidence: float = Field(..., ge=0.0, le=1.0)
    category: DetectionCategory = Field("HUMAN", description="Standard frontend category")
    object_type: Optional[str] = Field("human", description="Raw model type (person/vehicle/etc)")
    label: Optional[str] = Field(None, description="Rendered tactical HUD label")
    bbox: Optional[BoundingBox] = Field(None, description="Bounding box")
    boundingBox: Optional[BoundingBox] = Field(None, description="Alias for bbox")
    centroid: Optional[Point2D] = None
    previous_centroid: Optional[Point2D] = None
    severity: Optional[SeverityLevel] = Field("INFO", description="Threat severity level")
    trackId: Optional[str] = Field(None, description="Tracker ID")
    speedKmH: Optional[float] = Field(None, ge=0.0, description="Speed in km/h")
    speedMps: Optional[float] = Field(None, ge=0.0, description="Speed in m/s")
    speed: Optional[float] = Field(None, ge=0.0, description="Generic speed field")
    posture: Optional[str] = Field(None, description="STANDING / CROUCHING / CRAWLING / RUNNING / EVASIVE")
    isHostile: Optional[bool] = Field(False, description="Hostility trigger flag")
    plateNumber: Optional[str] = Field(None, description="Optional vehicle plate for UI mock")
    isBlacklisted: Optional[bool] = Field(None, description="Watchlist match")
    ocrConfidence: Optional[float] = Field(None, ge=0.0, le=1.0)

    def to_dict(self) -> Dict[str, Any]:
        return self.model_dump()


# ==========================================
# 4. TRIPWIRE SCHEMAS
# ==========================================
class TripwireZone(BaseModel):
    """Spatial virtual tripwire boundary configuration."""
    id: str = Field(..., description="Tripwire zone ID")
    cameraId: str = Field("CAM-01", description="Camera ID")
    name: str = Field(..., description="Descriptive zone name")
    points: List[Point2D] = Field(..., min_length=2, description="Start and end points of tripwire")
    direction: CrossingDirection = Field("INBOUND", description="Monitored crossing direction")
    isActive: bool = Field(True, description="Active status")
    severity: SeverityLevel = Field("CRITICAL", description="Breach alert severity")
    color: Optional[str] = Field("#ff2d55", description="Overlay laser color")


class TripwireEvent(BaseModel):
    """
    Canonical and Frontend-compatible Tripwire breach event.
    """
    id: Optional[str] = Field(None, description="Event ID")
    tripwire_id: str = Field(..., description="Breached tripwire ID")
    camera_id: str = Field("CAM-01", description="Camera identifier")
    object_id: Union[str, int] = Field(..., description="Track ID of the crossing object")
    crossed: bool = Field(True, description="Whether line was intersected")
    crossing_direction: str = Field("INBOUND", description="Observed direction of crossing")
    timestamp: str = Field(default_factory=get_current_utc_timestamp)
    targetClass: Optional[str] = Field("HUMAN", description="Target classification")
    confidence: Optional[float] = Field(1.0, ge=0.0, le=1.0)
    snapshotUrl: Optional[str] = None
    tripwire_breached: Optional[bool] = Field(True, description="Frontend boolean alias")


TripwireBreachEvent = TripwireEvent  # Alias


# ==========================================
# 5. XAI EXPLANATION & THREAT SCORING SCHEMAS
# ==========================================
class XaiFactor(BaseModel):
    """Individual explainability factor contributing to threat calculation."""
    name: str
    weight: float = Field(..., ge=0.0, le=1.0)
    description: str


class XaiExplanation(BaseModel):
    """Explainable AI breakdown for situational threat assessment."""
    classConfidence: float = Field(0.95, ge=0.0, le=1.0)
    speedMps: Optional[float] = None
    kinematicProfile: Optional[str] = None
    trajectoryDescription: Optional[str] = None
    reasons: List[str] = Field(default_factory=list, description="Human-readable decision rationale")
    factors: Optional[List[XaiFactor]] = None


class ThreatEvent(BaseModel):
    """
    Canonical Threat Event generated by the threat evaluation engine.
    """
    event_id: str = Field(..., description="Unique threat alert identifier")
    camera_id: str = Field("CAM-01", description="Camera source identifier")
    object_type: str = Field("human", description="Object type (human or vehicle)")
    threat_score: float = Field(..., ge=0.0, le=100.0, description="Risk score 0 to 100")
    severity: SeverityLevel = Field("CRITICAL", description="Severity level")
    xai_reasons: List[str] = Field(default_factory=list, description="XAI rationale explanations")
    timestamp: str = Field(default_factory=get_current_utc_timestamp)


class ThreatAlert(BaseModel):
    """
    Frontend-compatible Threat Alert contract.
    """
    id: str
    timestamp: str = Field(default_factory=get_current_utc_timestamp)
    incidentCode: str = Field("INC-26187", description="Tactical incident code")
    title: str = Field("Perimeter Intrusion Alert", description="Alert title")
    cameraId: str = "CAM-01"
    cameraName: str = Field("Sector-04 Perimeter Alpha")
    severity: SeverityLevel = "CRITICAL"
    riskScore: float = Field(..., ge=0.0, le=100.0)
    threat_score: Optional[float] = None
    aiExplanation: XaiExplanation
    status: Literal["OPEN", "INVESTIGATING", "DISPATCHED", "CLEARED", "FALSE_POSITIVE"] = "OPEN"


# ==========================================
# 6. WEBSOCKET ENVELOPES
# ==========================================
class EventEnvelope(BaseModel):
    """
    Canonical JSON event envelope:
    {
      "type": "detection" | "tripwire" | "threat",
      "timestamp": "...",
      "data": { ... }
    }
    """
    type: Literal["detection", "tripwire", "threat", "telemetry", "heartbeat"]
    timestamp: str = Field(default_factory=get_current_utc_timestamp)
    data: Any


class FrontendWebSocketMessage(BaseModel):
    """
    Frontend-native WebSocket envelope:
    {
      "event": "DETECTION_FRAME" | "TRIPWIRE_EVENT" | "THREAT_ALERT" | "TELEMETRY_UPDATE" | "HEARTBEAT",
      "payload": { ... },
      "timestamp": "..."
    }
    """
    event: Literal[
        "DETECTION_FRAME",
        "TRIPWIRE_EVENT",
        "THREAT_ALERT",
        "TELEMETRY_UPDATE",
        "CAMERA_STATUS",
        "HEARTBEAT"
    ]
    payload: Any
    timestamp: str = Field(default_factory=get_current_utc_timestamp)


# ==========================================
# 7. API REQUEST & RESPONSE ENVELOPES
# ==========================================
T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """Standard unified REST API response wrapper."""
    success: bool = True
    data: T
    message: Optional[str] = None
    timestamp: str = Field(default_factory=get_current_utc_timestamp)


class ProcessFrameRequest(BaseModel):
    """API payload for frame / video inspection."""
    camera_id: str = Field("CAM-01", description="Camera source identifier")
    scenario: Optional[str] = Field(None, description="Optional simulation scenario name")
    step: Optional[int] = Field(0, description="Scenario step (0, 1, 2)")
    frame_id: Optional[str] = Field(None, description="Optional client frame sequence ID")
    frame_base64: Optional[str] = Field(None, description="Optional raw frame data (base64)")
    tripwires: Optional[List[TripwireZone]] = Field(None, description="Active tripwires for evaluation")


class ProcessFrameResponseData(BaseModel):
    """Structured result of video / frame inference."""
    camera_id: str
    frame_id: str
    detections: List[DetectionItem]
    tripwire_breaches: List[TripwireEvent]
    threat_alerts: List[ThreatAlert]
    inference_time_ms: float
    fps: float


class HealthResponse(BaseModel):
    """Canonical Health check response."""
    status: str = "ok"
    service: str = "IBVAP-EDGE-AI"
    mode: str = "local"
    yolo_loaded: bool = False
    timestamp: str = Field(default_factory=get_current_utc_timestamp)


class TelemetrySummary(BaseModel):
    """Real-time system telemetry and node statistics."""
    timestamp: str = Field(default_factory=get_current_utc_timestamp)
    sectorId: str = "SECTOR-04"
    operatorId: str = "OP-BUNTY-AI"
    activeNodesCount: int = 4
    gpuUsagePercent: float = 42.5
    inferenceFps: float = 29.8
    latencyMs: float = 14.2
    networkThroughputMbps: float = 8.5
    systemStatus: Literal["NOMINAL", "DEGRADED", "CRITICAL"] = "NOMINAL"
