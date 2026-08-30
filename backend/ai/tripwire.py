"""
IBVAP-EDGE-AI: Spatial Virtual Tripwire Layer
Lead: Pratyush (AI/CV Backend Lead) & Bunty (Backend/API Integration Lead)

Geometric Features:
  - Vector cross-product orientation test (CCW)
  - Robust line segment intersection handling endpoints and collinearities
  - Normal vector motion classification for INBOUND vs OUTBOUND direction determination
  - Stateful TripwireManager for polyline tracking and breach event production
"""

import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Tuple, Union

from ..app.schemas import (
    Point2D,
    Centroid,
    TripwireEvent,
    TripwireZone,
    DetectionItem,
    get_current_utc_timestamp,
)

EPSILON = 1e-9


def _to_point(p: Union[Point2D, Dict[str, float], Tuple[float, float], List[float], Any]) -> Point2D:
    """Normalize various point representations into Point2D."""
    if isinstance(p, Point2D):
        return p
    if isinstance(p, dict):
        return Point2D(x=float(p.get("x", 0.0)), y=float(p.get("y", 0.0)))
    if isinstance(p, (tuple, list)) and len(p) >= 2:
        return Point2D(x=float(p[0]), y=float(p[1]))
    if hasattr(p, "x") and hasattr(p, "y"):
        return Point2D(x=float(p.x), y=float(p.y))
    raise ValueError(f"Cannot convert to Point2D: {p}")


def _ccw(a: Point2D, b: Point2D, c: Point2D) -> float:
    """Counter-clockwise orientation test (cross product)."""
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)


def _on_segment(p: Point2D, a: Point2D, b: Point2D) -> bool:
    """Check if point p lies on segment ab (assuming collinear)."""
    return (
        min(a.x, b.x) - EPSILON <= p.x <= max(a.x, b.x) + EPSILON
        and min(a.y, b.y) - EPSILON <= p.y <= max(a.y, b.y) + EPSILON
    )


def line_intersects(
    seg1: Tuple[Union[Point2D, Any], Union[Point2D, Any]],
    seg2: Tuple[Union[Point2D, Any], Union[Point2D, Any]],
) -> bool:
    """
    Robust 2D Line Segment Intersection Algorithm.
    Returns True if segment seg1 (p1->q1) intersects segment seg2 (p2->q2).
    """
    p1 = _to_point(seg1[0])
    q1 = _to_point(seg1[1])
    p2 = _to_point(seg2[0])
    q2 = _to_point(seg2[1])

    d1 = _ccw(p1, q1, p2)
    d2 = _ccw(p1, q1, q2)
    d3 = _ccw(p2, q2, p1)
    d4 = _ccw(p2, q2, q1)

    # General crossing case
    if ((d1 > EPSILON and d2 < -EPSILON) or (d1 < -EPSILON and d2 > EPSILON)) and (
        (d3 > EPSILON and d4 < -EPSILON) or (d3 < -EPSILON and d4 > EPSILON)
    ):
        return True

    # Collinear / endpoint cases
    if abs(d1) <= EPSILON and _on_segment(p2, p1, q1):
        return True
    if abs(d2) <= EPSILON and _on_segment(q2, p1, q1):
        return True
    if abs(d3) <= EPSILON and _on_segment(p1, p2, q2):
        return True
    if abs(d4) <= EPSILON and _on_segment(q1, p2, q2):
        return True

    return False


check_line_intersection = lambda a1, a2, b1, b2: line_intersects((a1, a2), (b1, b2))


def calculate_crossing_direction(
    previous_point: Union[Point2D, Any],
    current_point: Union[Point2D, Any],
    tripwire_start: Union[Point2D, Any],
    tripwire_end: Union[Point2D, Any],
) -> str:
    """
    Determine crossing direction relative to tripwire normal vector.
    Returns 'INBOUND' | 'OUTBOUND' | 'UNKNOWN'.
    """
    p_prev = _to_point(previous_point)
    p_curr = _to_point(current_point)
    tw_start = _to_point(tripwire_start)
    tw_end = _to_point(tripwire_end)

    tx = tw_end.x - tw_start.x
    ty = tw_end.y - tw_start.y

    mx = p_curr.x - p_prev.x
    my = p_curr.y - p_prev.y

    move_len_sq = mx * mx + my * my
    if move_len_sq < (EPSILON * EPSILON):
        return "UNKNOWN"

    cross = tx * my - ty * mx

    if cross > EPSILON:
        return "INBOUND"
    elif cross < -EPSILON:
        return "OUTBOUND"
    else:
        return "UNKNOWN"


determine_crossing_direction = calculate_crossing_direction  # Alias


def check_tripwire_crossing(
    previous_centroid: Union[Point2D, Any],
    current_centroid: Union[Point2D, Any],
    tripwire_start: Union[Point2D, Any],
    tripwire_end: Union[Point2D, Any],
    tripwire_id: Optional[str] = None,
    object_id: Optional[str] = None,
    required_direction: str = "BIDIRECTIONAL",
    confidence: float = 0.95,
    camera_id: str = "CAM-01",
    target_class: str = "HUMAN",
) -> Dict[str, Any]:
    """
    Evaluate whether an object's motion trajectory crosses a tripwire segment.
    """
    p_prev = _to_point(previous_centroid)
    p_curr = _to_point(current_centroid)
    tw_start = _to_point(tripwire_start)
    tw_end = _to_point(tripwire_end)

    intersects = line_intersects((p_prev, p_curr), (tw_start, tw_end))

    if not intersects:
        return {
            "crossed": False,
            "crossing_direction": "UNKNOWN",
            "tripwire_id": tripwire_id or "TW-01",
            "tripwireId": tripwire_id or "TW-01",
            "object_id": object_id,
            "objectId": object_id,
            "confidence": round(float(confidence), 4),
        }

    direction = calculate_crossing_direction(p_prev, p_curr, tw_start, tw_end)

    req_dir = required_direction.upper()
    is_valid_breach = True
    if req_dir == "INBOUND" and direction != "INBOUND":
        is_valid_breach = False
    elif req_dir == "OUTBOUND" and direction != "OUTBOUND":
        is_valid_breach = False

    evt_id = f"TWE-{uuid.uuid4().hex[:8].upper()}"
    ts = get_current_utc_timestamp()

    return {
        "id": evt_id,
        "crossed": is_valid_breach,
        "crossing_direction": direction,
        "crossingDirection": direction,
        "tripwire_id": tripwire_id or "TW-01",
        "tripwireId": tripwire_id or "TW-01",
        "object_id": object_id,
        "objectId": object_id,
        "targetClass": target_class,
        "confidence": round(float(confidence), 4),
        "cameraId": camera_id,
        "camera_id": camera_id,
        "timestamp": ts,
        "tripwire_breached": is_valid_breach,
    }


def evaluate_tripwire_crossing(
    object_id: str,
    p_prev: Optional[Union[Point2D, Any]],
    p_curr: Union[Point2D, Any],
    tripwire: TripwireZone,
    category: str = "HUMAN"
) -> Optional[TripwireEvent]:
    """Helper to evaluate crossing against a TripwireZone and return a TripwireEvent."""
    if p_prev is None or not tripwire.isActive or len(tripwire.points) < 2:
        return None

    res = check_tripwire_crossing(
        previous_centroid=p_prev,
        current_centroid=p_curr,
        tripwire_start=tripwire.points[0],
        tripwire_end=tripwire.points[1],
        tripwire_id=tripwire.id,
        object_id=object_id,
        required_direction=tripwire.direction,
        confidence=0.98,
        camera_id=tripwire.cameraId,
        target_class=category
    )

    if res["crossed"]:
        return TripwireEvent(
            id=res["id"],
            tripwire_id=tripwire.id,
            camera_id=tripwire.cameraId,
            object_id=object_id,
            crossed=True,
            crossing_direction=res["crossing_direction"],
            targetClass=category,
            confidence=0.98,
            timestamp=res["timestamp"],
            tripwire_breached=True
        )
    return None


class TripwireManager:
    """
    Stateful Tripwire and Virtual Perimeter Manager.
    Maintains registered active tripwires, tracks previous object centroids,
    and produces breach events across successive video frames.
    """

    def __init__(self, camera_id: str = "CAM-01"):
        self.camera_id = camera_id
        self.tripwires: Dict[str, TripwireZone] = {}
        self.track_history: Dict[str, Point2D] = {}

    def register_tripwire(
        self,
        tripwire_id: str,
        name: str,
        points: List[Any],
        direction: str = "BIDIRECTIONAL",
        severity: str = "CRITICAL",
        is_active: bool = True,
    ) -> TripwireZone:
        """Register or update a tripwire zone."""
        parsed_points = [_to_point(p) for p in points]
        tw = TripwireZone(
            id=tripwire_id,
            name=name,
            points=parsed_points,
            cameraId=self.camera_id,
            direction=direction,  # type: ignore
            isActive=is_active,
            severity=severity,  # type: ignore
        )
        self.tripwires[tripwire_id] = tw
        return tw

    def remove_tripwire(self, tripwire_id: str) -> bool:
        """Remove a tripwire zone."""
        return bool(self.tripwires.pop(tripwire_id, None))

    def evaluate_detections(
        self,
        current_detections: List[Any],
    ) -> List[TripwireEvent]:
        """
        Evaluate a frame's detections against all active tripwires.
        Emits TripwireEvent for each valid breach.
        """
        breach_events: List[TripwireEvent] = []

        for det in current_detections:
            if hasattr(det, "id"):
                obj_id = getattr(det, "trackId", None) or det.id
                curr_centroid = det.centroid
                category = getattr(det, "category", "HUMAN")
                confidence = getattr(det, "confidence", 0.95)
                prev_c = getattr(det, "previous_centroid", None)
            elif isinstance(det, dict):
                obj_id = det.get("trackId", det.get("id", det.get("object_id", "obj-0")))
                curr_c_dict = det.get("centroid", {})
                curr_centroid = Point2D(x=float(curr_c_dict.get("x", 0)), y=float(curr_c_dict.get("y", 0)))
                category = det.get("category", "HUMAN")
                confidence = float(det.get("confidence", 0.95))
                prev_c_dict = det.get("previous_centroid")
                prev_c = Point2D(x=float(prev_c_dict["x"]), y=float(prev_c_dict["y"])) if prev_c_dict else None
            else:
                continue

            prev_centroid = prev_c or self.track_history.get(obj_id)

            if prev_centroid is not None and curr_centroid is not None:
                for tw in self.tripwires.values():
                    if not tw.isActive or len(tw.points) < 2:
                        continue

                    for i in range(len(tw.points) - 1):
                        p_start = tw.points[i]
                        p_end = tw.points[i + 1]

                        result = check_tripwire_crossing(
                            previous_centroid=prev_centroid,
                            current_centroid=curr_centroid,
                            tripwire_start=p_start,
                            tripwire_end=p_end,
                            tripwire_id=tw.id,
                            object_id=obj_id,
                            required_direction=tw.direction,
                            confidence=confidence,
                            camera_id=self.camera_id,
                            target_class=category,
                        )

                        if result["crossed"]:
                            event = TripwireEvent(
                                id=result["id"],
                                tripwire_id=tw.id,
                                camera_id=self.camera_id,
                                timestamp=result["timestamp"],
                                targetClass=category,
                                crossing_direction=result["crossing_direction"],
                                confidence=confidence,
                                crossed=True,
                                object_id=obj_id,
                                tripwire_breached=True
                            )
                            breach_events.append(event)
                            break

            if curr_centroid is not None:
                self.track_history[obj_id] = _to_point(curr_centroid)

        return breach_events
