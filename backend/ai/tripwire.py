"""
Tripwire spatial geometric intersection utilities and crossing classification.
"""

from typing import Optional
import uuid
from ..app.schemas import Point2D, TripwireEvent, TripwireZone


def _ccw(a: Point2D, b: Point2D, c: Point2D) -> float:
    """Counter-clockwise orientation test (cross product)."""
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)


def check_line_intersection(
    a1: Point2D, a2: Point2D,
    b1: Point2D, b2: Point2D
) -> bool:
    """
    Determines if line segment (a1->a2) intersects segment (b1->b2).
    """
    ccw1 = _ccw(a1, a2, b1)
    ccw2 = _ccw(a1, a2, b2)
    ccw3 = _ccw(b1, b2, a1)
    ccw4 = _ccw(b1, b2, a2)

    # Segments intersect if endpoints of each segment are on opposite sides of the other
    if ((ccw1 > 0 and ccw2 < 0) or (ccw1 < 0 and ccw2 > 0)) and \
       ((ccw3 > 0 and ccw4 < 0) or (ccw3 < 0 and ccw4 > 0)):
        return True

    return False


def determine_crossing_direction(
    p_prev: Point2D,
    p_curr: Point2D,
    tw_p1: Point2D,
    tw_p2: Point2D
) -> str:
    """
    Determine crossing direction relative to tripwire normal.
    Positive normal cross product indicates INBOUND, negative indicates OUTBOUND.
    """
    # Tripwire vector
    tx = tw_p2.x - tw_p1.x
    ty = tw_p2.y - tw_p1.y

    # Trajectory vector
    mx = p_curr.x - p_prev.x
    my = p_curr.y - p_prev.y

    # 2D cross product of tripwire and trajectory
    cross = (tx * my) - (ty * mx)
    return "INBOUND" if cross >= 0 else "OUTBOUND"


def evaluate_tripwire_crossing(
    object_id: str,
    p_prev: Optional[Point2D],
    p_curr: Point2D,
    tripwire: TripwireZone,
    category: str = "HUMAN"
) -> Optional[TripwireEvent]:
    """
    Evaluate if an object's motion trajectory from p_prev to p_curr crosses a tripwire.
    """
    if p_prev is None or not tripwire.isActive or len(tripwire.points) < 2:
        return None

    tw_p1 = tripwire.points[0]
    tw_p2 = tripwire.points[1]

    if check_line_intersection(p_prev, p_curr, tw_p1, tw_p2):
        direction = determine_crossing_direction(p_prev, p_curr, tw_p1, tw_p2)
        
        # Check directional filter
        if tripwire.direction == "BIDIRECTIONAL" or tripwire.direction == direction:
            return TripwireEvent(
                id=f"TWE-{uuid.uuid4().hex[:8].upper()}",
                tripwire_id=tripwire.id,
                camera_id=tripwire.cameraId,
                object_id=object_id,
                crossed=True,
                crossing_direction=direction,
                targetClass="HUMAN" if category.upper() == "HUMAN" else "VEHICLE",
                confidence=0.98
            )

    return None
