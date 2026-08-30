"""
IBVAP-EDGE-AI: Shared Data Models and Schemas
Strictly aligned with frontend contracts (frontend/src/types/index.ts and DetectionOverlay.tsx)
"""

from typing import List, Optional, Dict, Any, Union
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
import uuid

try:
    from pydantic import BaseModel, Field
    PYDANTIC_AVAILABLE = True
except ImportError:
    PYDANTIC_AVAILABLE = False


@dataclass
class Point2D:
    x: float
    y: float

    def to_dict(self) -> Dict[str, float]:
        return {"x": float(self.x), "y": float(self.y)}


@dataclass
class BoundingBox:
    x: float
    y: float
    width: float
    height: float

    def to_dict(self) -> Dict[str, float]:
        return {
            "x": float(self.x),
            "y": float(self.y),
            "width": float(self.width),
            "height": float(self.height),
        }


@dataclass
class Centroid:
    x: float
    y: float

    def to_dict(self) -> Dict[str, float]:
        return {"x": float(self.x), "y": float(self.y)}


@dataclass
class DetectionItem:
    """
    Standard detection structure matching frontend DetectionOverlay and DetectionBase.
    Normalized coordinates (0..1) used across the pipeline.
    """
    id: str
    object_type: str  # "human" | "vehicle"
    confidence: float
    bbox: BoundingBox
    centroid: Centroid
    category: str = "UNKNOWN"  # "HUMAN" | "VEHICLE"
    label: Optional[str] = None
    speed: Optional[float] = None
    speedKmH: Optional[float] = None
    speedMps: Optional[float] = None
    posture: Optional[str] = None  # "STANDING" | "CROUCHING" | "CRAWLING" | "RUNNING"
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    camera_id: str = "CAM-01"
    previous_centroid: Optional[Centroid] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "object_id": self.id,
            "object_type": self.object_type,
            "category": self.category,
            "label": self.label or f"{self.object_type.upper()} {self.confidence:.0%}",
            "confidence": round(float(self.confidence), 4),
            "bbox": self.bbox.to_dict(),
            "boundingBox": self.bbox.to_dict(),
            "centroid": self.centroid.to_dict(),
            "previous_centroid": self.previous_centroid.to_dict() if self.previous_centroid else None,
            "speed": self.speed,
            "speedKmH": self.speedKmH,
            "speedMps": self.speedMps,
            "posture": self.posture,
            "timestamp": self.timestamp,
            "camera_id": self.camera_id,
            "cameraId": self.camera_id,
        }


@dataclass
class TripwireZone:
    id: str
    name: str
    points: List[Point2D]
    cameraId: str = "CAM-01"
    direction: str = "BIDIRECTIONAL"  # "BIDIRECTIONAL" | "INBOUND" | "OUTBOUND"
    isActive: bool = True
    severity: str = "HIGH"  # "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO"
    color: str = "#00d1ff"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "cameraId": self.cameraId,
            "points": [p.to_dict() for p in self.points],
            "direction": self.direction,
            "isActive": self.isActive,
            "severity": self.severity,
            "color": self.color,
        }


@dataclass
class TripwireBreachEvent:
    """
    Contract for Tripwire breach events compatible with frontend TripwireEvent.
    """
    id: str
    tripwireId: str
    cameraId: str
    timestamp: str
    targetClass: str  # "HUMAN" | "VEHICLE"
    crossingDirection: str  # "INBOUND" | "OUTBOUND" | "UNKNOWN"
    confidence: float
    crossed: bool = True
    objectId: Optional[str] = None
    tripwire_id: Optional[str] = None
    object_id: Optional[str] = None
    snapshotUrl: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        tw_id = self.tripwireId or self.tripwire_id or "TW-01"
        obj_id = self.objectId or self.object_id or ""
        return {
            "id": self.id,
            "tripwireId": tw_id,
            "tripwire_id": tw_id,
            "cameraId": self.cameraId,
            "timestamp": self.timestamp,
            "targetClass": self.targetClass,
            "crossingDirection": self.crossingDirection,
            "confidence": round(float(self.confidence), 4),
            "crossed": self.crossed,
            "objectId": obj_id,
            "object_id": obj_id,
            "snapshotUrl": self.snapshotUrl,
        }


# Optional Pydantic request/response schemas if Pydantic is active
if PYDANTIC_AVAILABLE:
    class BoundingBoxSchema(BaseModel):
        x: float
        y: float
        width: float
        height: float

    class Point2DSchema(BaseModel):
        x: float
        y: float

    class TripwireZoneSchema(BaseModel):
        id: str
        name: str
        points: List[Point2DSchema]
        cameraId: str = "CAM-01"
        direction: str = "BIDIRECTIONAL"
        isActive: bool = True
        severity: str = "HIGH"
        color: Optional[str] = "#00d1ff"

    class DetectionRequestSchema(BaseModel):
        camera_id: str = "CAM-01"
        frame_base64: Optional[str] = None
        mock_scenario: Optional[str] = None  # "human_crossing", "vehicle_approach", "perimeter_patrol"
        tripwires: Optional[List[TripwireZoneSchema]] = None
        simulated_movements: Optional[List[Dict[str, Any]]] = None

    class DetectionResponseSchema(BaseModel):
        success: bool = True
        camera_id: str
        timestamp: str
        detections: List[Dict[str, Any]]
        tripwire_events: List[Dict[str, Any]]
        total_detections: int
        breach_count: int
        threat_score: Optional[float] = None
        threat_severity: Optional[str] = None
