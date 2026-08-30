"""
Unit tests for AI kinematic and tripwire geometric math.
"""

from backend.ai.detection import compute_centroid, estimate_speed_mps
from backend.ai.tripwire import (
    check_line_intersection,
    determine_crossing_direction,
    evaluate_tripwire_crossing,
)
from backend.app.schemas import BoundingBox, Point2D, TripwireZone


def test_compute_centroid() -> None:
    """Verify centroid is correctly computed from bounding box."""
    bbox = BoundingBox(x=10.0, y=20.0, width=40.0, height=60.0)
    centroid = compute_centroid(bbox)
    assert centroid.x == 30.0
    assert centroid.y == 50.0


def test_estimate_speed_mps() -> None:
    """Verify speed computation from point delta."""
    p_prev = Point2D(x=0.0, y=0.0)
    p_curr = Point2D(x=0.3, y=0.4)  # displacement = 0.5
    speed = estimate_speed_mps(p_prev, p_curr, dt_sec=0.1, scale_factor=10.0)
    assert speed == 50.0  # (0.5 * 10) / 0.1 = 50.0


def test_line_intersection_true() -> None:
    """Verify intersecting perpendicular line segments return True."""
    a1 = Point2D(x=0.5, y=0.0)
    a2 = Point2D(x=0.5, y=1.0)
    b1 = Point2D(x=0.0, y=0.5)
    b2 = Point2D(x=1.0, y=0.5)

    assert check_line_intersection(a1, a2, b1, b2) is True


def test_line_intersection_false_parallel() -> None:
    """Verify parallel disjoint lines return False."""
    a1 = Point2D(x=0.0, y=0.2)
    a2 = Point2D(x=1.0, y=0.2)
    b1 = Point2D(x=0.0, y=0.8)
    b2 = Point2D(x=1.0, y=0.8)

    assert check_line_intersection(a1, a2, b1, b2) is False


def test_evaluate_tripwire_crossing_detection() -> None:
    """Verify evaluate_tripwire_crossing generates a TripwireEvent on boundary crossing."""
    tripwire = TripwireZone(
        id="TW-01",
        cameraId="CAM-01",
        name="Perimeter line",
        points=[Point2D(x=0.0, y=0.5), Point2D(x=1.0, y=0.5)],
        direction="INBOUND",
        isActive=True,
        severity="CRITICAL"
    )

    # Object moving from top (y=0.2) to bottom (y=0.8) crossing y=0.5
    p_prev = Point2D(x=0.5, y=0.2)
    p_curr = Point2D(x=0.5, y=0.8)

    event = evaluate_tripwire_crossing(
        object_id="TRK-99",
        p_prev=p_prev,
        p_curr=p_curr,
        tripwire=tripwire,
        category="HUMAN"
    )

    assert event is not None
    assert event.tripwire_id == "TW-01"
    assert event.object_id == "TRK-99"
    assert event.crossed is True
