"""
IBVAP-EDGE-AI: Tripwire & Virtual Perimeter Geometry Engine
Lead: Pratyush (AI/CV Backend Lead)

Features:
  - Robust Line Segment Intersection using Counter-Clockwise (CCW) / Orientation algorithm
  - Collinear and boundary-touching edge cases handled with epsilon precision
  - Crossing direction determination: "INBOUND" vs "OUTBOUND" vs "UNKNOWN"
  - Compatible with normalized (0..1) screen coordinates
  - Multi-segment tripwire polyline support
  - Deterministic batch evaluation for multi-camera feeds
"""

import math
import uuid
from typing import List, Dict, Any, Optional, Tuple, Union
from datetime import datetime, timezone

from backend.app.models.schemas import Point2D, Centroid, TripwireZone, TripwireBreachEvent

EPSILON = 1e-9


def _to_point(p: Union[Point2D, Centroid, Dict[str, Any], Tuple[float, float], List[float]]) -> Point2D:
    """Normalize various point representations into Point2D."""
    if isinstance(p, (Point2D, Centroid)):
        return Point2D(x=float(p.x), y=float(p.y))
    elif isinstance(p, dict):
        return Point2D(x=float(p.get("x", 0.0)), y=float(p.get("y", 0.0)))
    elif isinstance(p, (tuple, list)) and len(p) >= 2:
        return Point2D(x=float(p[0]), y=float(p[1]))
    else:
        raise ValueError(f"Invalid point format: {p}")


def ccw(a: Point2D, b: Point2D, c: Point2D) -> float:
    """
    Compute the 2D cross product of vector AB and AC.
    Returns:
      > 0: Counter-Clockwise turn (C is to the left of directed line AB)
      < 0: Clockwise turn (C is to the right of directed line AB)
      == 0: Collinear (A, B, C lie on the same straight line)
    """
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)


def on_segment(p: Point2D, q: Point2D, r: Point2D) -> bool:
    """
    Check if point q lies on line segment pr (assuming p, q, r are collinear).
    """
    return (
        min(p.x, r.x) - EPSILON <= q.x <= max(p.x, r.x) + EPSILON
        and min(p.y, r.y) - EPSILON <= q.y <= max(p.y, r.y) + EPSILON
    )


def line_intersects(
    line1: Tuple[Union[Point2D, Dict[str, float], Tuple[float, float]], Union[Point2D, Dict[str, float], Tuple[float, float]]],
    line2: Tuple[Union[Point2D, Dict[str, float], Tuple[float, float]], Union[Point2D, Dict[str, float], Tuple[float, float]]],
) -> bool:
    """
    Determine if line segment line1 (p1 -> q1) and line segment line2 (p2 -> q2) intersect.
    Uses the robust CCW orientation algorithm.
    """
    p1 = _to_point(line1[0])
    q1 = _to_point(line1[1])
    p2 = _to_point(line2[0])
    q2 = _to_point(line2[1])

    # Zero-length line segments do not cross
    if abs(p1.x - q1.x) < EPSILON and abs(p1.y - q1.y) < EPSILON:
        return False
    if abs(p2.x - q2.x) < EPSILON and abs(p2.y - q2.y) < EPSILON:
        return False

    # Find orientations
    o1 = ccw(p1, q1, p2)
    o2 = ccw(p1, q1, q2)
    o3 = ccw(p2, q2, p1)
    o4 = ccw(p2, q2, q1)

    # General Case: Straddle condition
    # line1 straddles line2 and line2 straddles line1
    def _sign(val: float) -> int:
        if val > EPSILON:
            return 1
        elif val < -EPSILON:
            return -1
        return 0

    s1, s2, s3, s4 = _sign(o1), _sign(o2), _sign(o3), _sign(o4)

    if s1 != s2 and s3 != s4 and s1 != 0 and s2 != 0 and s3 != 0 and s4 != 0:
        return True

    # Special Cases: Collinear points lying on the respective segment
    if s1 == 0 and on_segment(p1, p2, q1):
        return True
    if s2 == 0 and on_segment(p1, q2, q1):
        return True
    if s3 == 0 and on_segment(p2, p1, q2):
        return True
    if s4 == 0 and on_segment(p2, q1, q2):
        return True

    return False


def calculate_crossing_direction(
    previous_point: Union[Point2D, Centroid, Dict[str, float], Tuple[float, float]],
    current_point: Union[Point2D, Centroid, Dict[str, float], Tuple[float, float]],
    tripwire_start: Union[Point2D, Dict[str, float], Tuple[float, float]],
    tripwire_end: Union[Point2D, Dict[str, float], Tuple[float, float]],
) -> str:
    """
    Determine the crossing direction of an object's trajectory relative to a directed tripwire.

    Tripwire directed from tripwire_start (A) to tripwire_end (B).
    Object moves from previous_point (P_prev) to current_point (P_curr).

    Direction:
      - "INBOUND": Object moves across the line in the direction of the line's designated normal.
      - "OUTBOUND": Object moves across the line in the reverse direction.
      - "UNKNOWN": Insufficient or parallel movement.
    """
    p_prev = _to_point(previous_point)
    p_curr = _to_point(current_point)
    tw_start = _to_point(tripwire_start)
    tw_end = _to_point(tripwire_end)

    # Tripwire vector T = B - A
    tx = tw_end.x - tw_start.x
    ty = tw_end.y - tw_start.y

    # Movement vector M = P_curr - P_prev
    mx = p_curr.x - p_prev.x
    my = p_curr.y - p_prev.y

    move_len_sq = mx * mx + my * my
    if move_len_sq < (EPSILON * EPSILON):
        return "UNKNOWN"

    # Cross product of tripwire vector and movement vector in 2D
    # cross = tx * my - ty * mx
    cross = tx * my - ty * mx

    # In screen coordinates (y downwards):
    # If cross > 0 -> movement is to the right/normal side of directed line -> INBOUND
    # If cross < 0 -> movement is to the left side -> OUTBOUND
    if cross > EPSILON:
        return "INBOUND"
    elif cross < -EPSILON:
        return "OUTBOUND"
    else:
        return "UNKNOWN"


def check_tripwire_crossing(
    previous_centroid: Union[Point2D, Centroid, Dict[str, float], Tuple[float, float]],
    current_centroid: Union[Point2D, Centroid, Dict[str, float], Tuple[float, float]],
    tripwire_start: Union[Point2D, Dict[str, float], Tuple[float, float]],
    tripwire_end: Union[Point2D, Dict[str, float], Tuple[float, float]],
    tripwire_id: Optional[str] = None,
    object_id: Optional[str] = None,
    required_direction: str = "BIDIRECTIONAL",
    confidence: float = 0.95,
    camera_id: str = "CAM-01",
    target_class: str = "HUMAN",
) -> Dict[str, Any]:
    """
    Evaluate whether an object's centroid motion crosses a tripwire segment.
    Filters by required direction ('BIDIRECTIONAL', 'INBOUND', 'OUTBOUND').
    Returns a dictionary structure compatible with TripwireBreachEvent.
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

    # Directional filter logic
    req_dir = required_direction.upper()
    is_valid_breach = True
    if req_dir == "INBOUND" and direction != "INBOUND":
        is_valid_breach = False
    elif req_dir == "OUTBOUND" and direction != "OUTBOUND":
        is_valid_breach = False

    return {
        "id": f"evt_{uuid.uuid4().hex[:8]}",
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
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


class TripwireManager:
    """
    Stateful Tripwire and Virtual Perimeter Manager.
    Maintains registered active tripwires, tracks previous object centroids,
    and produces breach events across successive video frames.
    """

    def __init__(self, camera_id: str = "CAM-01"):
        self.camera_id = camera_id
        self.tripwires: Dict[str, TripwireZone] = {}
        # Track previous centroids by object_id: {object_id: Centroid}
        self.track_history: Dict[str, Centroid] = {}

    def register_tripwire(
        self,
        tripwire_id: str,
        name: str,
        points: List[Union[Point2D, Dict[str, float], Tuple[float, float]]],
        direction: str = "BIDIRECTIONAL",
        severity: str = "HIGH",
        is_active: bool = True,
    ) -> TripwireZone:
        """Register or update a tripwire zone."""
        parsed_points = [_to_point(p) for p in points]
        tw = TripwireZone(
            id=tripwire_id,
            name=name,
            points=parsed_points,
            cameraId=self.camera_id,
            direction=direction,
            isActive=is_active,
            severity=severity,
        )
        self.tripwires[tripwire_id] = tw
        return tw

    def remove_tripwire(self, tripwire_id: str) -> bool:
        """Remove a tripwire zone."""
        return bool(self.tripwires.pop(tripwire_id, None))

    def evaluate_detections(
        self,
        current_detections: List[Any],
    ) -> List[TripwireBreachEvent]:
        """
        Evaluate a frame's detections against all active tripwires.
        Emits TripwireBreachEvent for each valid breach.
        """
        breach_events: List[TripwireBreachEvent] = []

        for det in current_detections:
            # Extract detection fields from DetectionItem or dict
            if hasattr(det, "id"):
                obj_id = det.id
                curr_centroid = det.centroid
                category = getattr(det, "category", "HUMAN")
                confidence = getattr(det, "confidence", 0.95)
                prev_c = getattr(det, "previous_centroid", None)
            elif isinstance(det, dict):
                obj_id = det.get("id", det.get("object_id", "obj-0"))
                curr_c_dict = det.get("centroid", {})
                curr_centroid = Centroid(x=float(curr_c_dict.get("x", 0)), y=float(curr_c_dict.get("y", 0)))
                category = det.get("category", "HUMAN")
                confidence = float(det.get("confidence", 0.95))
                prev_c_dict = det.get("previous_centroid")
                prev_c = Centroid(x=float(prev_c_dict["x"]), y=float(prev_c_dict["y"])) if prev_c_dict else None
            else:
                continue

            # Check if we have previous centroid from detection object or historical tracking
            prev_centroid = prev_c or self.track_history.get(obj_id)

            if prev_centroid is not None:
                for tw in self.tripwires.values():
                    if not tw.isActive or len(tw.points) < 2:
                        continue

                    # Check each segment of the polyline
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
                            event = TripwireBreachEvent(
                                id=result["id"],
                                tripwireId=tw.id,
                                cameraId=self.camera_id,
                                timestamp=result["timestamp"],
                                targetClass=category,
                                crossingDirection=result["crossingDirection"],
                                confidence=confidence,
                                crossed=True,
                                objectId=obj_id,
                            )
                            breach_events.append(event)
                            break  # Avoid duplicate breach per tripwire

            # Update historical track
            self.track_history[obj_id] = curr_centroid

        return breach_events
