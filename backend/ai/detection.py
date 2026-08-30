"""
Detection utilities and AI engine interface contracts.
Focuses strictly on Human / Vehicle detection parsing and kinematic feature extraction.
"""

import math
from typing import Optional, Protocol, List
from ..app.schemas import BoundingBox, DetectionCategory, DetectionItem, Point2D


def compute_centroid(bbox: BoundingBox) -> Point2D:
    """Compute center point of a bounding box."""
    return Point2D(
        x=round(bbox.x + (bbox.width / 2.0), 4),
        y=round(bbox.y + (bbox.height / 2.0), 4),
    )


def estimate_speed_mps(
    p_prev: Optional[Point2D],
    p_curr: Point2D,
    dt_sec: float = 0.1,
    scale_factor: float = 15.0
) -> float:
    """
    Estimate velocity in meters per second from coordinate displacement.
    scale_factor approximates screen coordinate units to real-world meters.
    """
    if p_prev is None or dt_sec <= 0:
        return 0.0

    dx = p_curr.x - p_prev.x
    dy = p_curr.y - p_prev.y
    distance = math.sqrt(dx * dx + dy * dy)
    speed = (distance * scale_factor) / dt_sec
    return round(speed, 2)


def to_detection_item(
    item_id: str,
    category: DetectionCategory,
    confidence: float,
    bbox: BoundingBox,
    camera_id: str = "CAM-01",
    speed_mps: Optional[float] = None,
    posture: Optional[str] = None,
    is_hostile: bool = False,
    track_id: Optional[str] = None
) -> DetectionItem:
    """Helper to construct a typed DetectionItem compatible with frontend Stitch UI."""
    centroid = compute_centroid(bbox)
    speed_kmh = round(speed_mps * 3.6, 1) if speed_mps is not None else None

    return DetectionItem(
        id=item_id,
        camera_id=camera_id,
        category=category,
        confidence=round(confidence, 3),
        bbox=bbox,
        boundingBox=bbox,
        centroid=centroid,
        trackId=track_id or item_id,
        speedMps=speed_mps,
        speedKmH=speed_kmh,
        posture=posture,
        isHostile=is_hostile,
        severity="CRITICAL" if is_hostile else "INFO",
        label=f"{category} #{track_id or item_id[-4:]}"
    )


class DetectionEngineProtocol(Protocol):
    """Interface protocol for AI CV engine (implemented by Pratyush)."""

    def process_frame(self, frame_data: bytes, camera_id: str) -> List[DetectionItem]:
        """Process a raw video frame and return normalized detection items."""
        ...
