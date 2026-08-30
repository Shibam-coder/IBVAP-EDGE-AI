"""
Unit tests for Tripwire Geometry Engine (Line Intersection, Directionality, Polyline, Manager).
"""

import unittest
from backend.app.models.schemas import Point2D, Centroid, TripwireZone, DetectionItem, BoundingBox
from backend.app.ai.tripwire import (
    line_intersects,
    calculate_crossing_direction,
    check_tripwire_crossing,
    TripwireManager,
    ccw,
    on_segment,
)


class TestTripwireGeometry(unittest.TestCase):

    def test_1_object_clearly_crosses_line(self):
        """Scenario 1: Object clearly crosses vertical line (x=0.5)."""
        movement = (Point2D(0.4, 0.5), Point2D(0.6, 0.5))
        tripwire = (Point2D(0.5, 0.0), Point2D(0.5, 1.0))
        self.assertTrue(line_intersects(movement, tripwire))

    def test_2_object_remains_on_same_side(self):
        """Scenario 2: Object moves parallel and remains on the left side."""
        movement = (Point2D(0.3, 0.2), Point2D(0.3, 0.8))
        tripwire = (Point2D(0.5, 0.0), Point2D(0.5, 1.0))
        self.assertFalse(line_intersects(movement, tripwire))

    def test_3_object_moves_away_from_line(self):
        """Scenario 3: Object starts near line and moves away."""
        movement = (Point2D(0.48, 0.5), Point2D(0.20, 0.5))
        tripwire = (Point2D(0.5, 0.0), Point2D(0.5, 1.0))
        self.assertFalse(line_intersects(movement, tripwire))

    def test_4_vertical_tripwire_crossings(self):
        """Scenario 4: Vertical tripwire tests."""
        tw_start = Point2D(0.5, 0.1)
        tw_end = Point2D(0.5, 0.9)

        # Crosses left to right
        res_lr = check_tripwire_crossing(
            previous_centroid=Point2D(0.4, 0.5),
            current_centroid=Point2D(0.6, 0.5),
            tripwire_start=tw_start,
            tripwire_end=tw_end,
        )
        self.assertTrue(res_lr["crossed"])
        self.assertIn(res_lr["crossing_direction"], ["INBOUND", "OUTBOUND"])

        # Crosses right to left
        res_rl = check_tripwire_crossing(
            previous_centroid=Point2D(0.6, 0.5),
            current_centroid=Point2D(0.4, 0.5),
            tripwire_start=tw_start,
            tripwire_end=tw_end,
        )
        self.assertTrue(res_rl["crossed"])
        # Opposite direction to lr
        self.assertNotEqual(res_lr["crossing_direction"], res_rl["crossing_direction"])

        # Moves above vertical segment without crossing
        res_above = check_tripwire_crossing(
            previous_centroid=Point2D(0.4, 0.05),
            current_centroid=Point2D(0.6, 0.05),
            tripwire_start=tw_start,
            tripwire_end=tw_end,
        )
        self.assertFalse(res_above["crossed"])

    def test_5_horizontal_tripwire_crossings(self):
        """Scenario 5: Horizontal tripwire tests (y=0.5)."""
        tw_start = Point2D(0.1, 0.5)
        tw_end = Point2D(0.9, 0.5)

        # Crosses top to bottom
        res_tb = check_tripwire_crossing(
            previous_centroid=Point2D(0.5, 0.3),
            current_centroid=Point2D(0.5, 0.7),
            tripwire_start=tw_start,
            tripwire_end=tw_end,
        )
        self.assertTrue(res_tb["crossed"])

        # Crosses bottom to top
        res_bt = check_tripwire_crossing(
            previous_centroid=Point2D(0.5, 0.7),
            current_centroid=Point2D(0.5, 0.3),
            tripwire_start=tw_start,
            tripwire_end=tw_end,
        )
        self.assertTrue(res_bt["crossed"])
        self.assertNotEqual(res_tb["crossing_direction"], res_bt["crossing_direction"])

    def test_6_diagonal_tripwire_crossings(self):
        """Scenario 6: Diagonal tripwire from (0.2, 0.2) to (0.8, 0.8)."""
        tw_start = Point2D(0.2, 0.2)
        tw_end = Point2D(0.8, 0.8)

        # Perpendicular crossing from (0.2, 0.8) to (0.8, 0.2)
        movement = (Point2D(0.2, 0.8), Point2D(0.8, 0.2))
        self.assertTrue(line_intersects(movement, (tw_start, tw_end)))

        # Non-intersecting parallel diagonal movement
        parallel = (Point2D(0.1, 0.3), Point2D(0.7, 0.9))
        self.assertFalse(line_intersects(parallel, (tw_start, tw_end)))

    def test_7_directional_constraint_filtering(self):
        """Test that INBOUND/OUTBOUND configured filters work as expected."""
        tw_start = Point2D(0.5, 0.0)
        tw_end = Point2D(0.5, 1.0)

        # Crossing left-to-right
        p1 = Point2D(0.4, 0.5)
        p2 = Point2D(0.6, 0.5)
        dir_detected = calculate_crossing_direction(p1, p2, tw_start, tw_end)

        # BIDIRECTIONAL allows it
        res_bi = check_tripwire_crossing(p1, p2, tw_start, tw_end, required_direction="BIDIRECTIONAL")
        self.assertTrue(res_bi["crossed"])

        # Matching direction allows it
        res_match = check_tripwire_crossing(p1, p2, tw_start, tw_end, required_direction=dir_detected)
        self.assertTrue(res_match["crossed"])

        # Opposite direction rejects breach
        opp_dir = "OUTBOUND" if dir_detected == "INBOUND" else "INBOUND"
        res_opp = check_tripwire_crossing(p1, p2, tw_start, tw_end, required_direction=opp_dir)
        self.assertFalse(res_opp["crossed"])

    def test_8_collinear_and_endpoint_contact(self):
        """Test on-segment touching edge cases."""
        # Movement ending exactly on the line
        movement = (Point2D(0.3, 0.5), Point2D(0.5, 0.5))
        tripwire = (Point2D(0.5, 0.0), Point2D(0.5, 1.0))
        self.assertTrue(line_intersects(movement, tripwire))

    def test_9_tripwire_manager_tracking(self):
        """Test stateful multi-frame evaluation with TripwireManager."""
        mgr = TripwireManager(camera_id="CAM-01")
        mgr.register_tripwire(
            tripwire_id="TW-ALPHA",
            name="Alpha Perimeter",
            points=[Point2D(0.5, 0.0), Point2D(0.5, 1.0)],
            direction="BIDIRECTIONAL",
        )

        # Frame 1: Object detected at x=0.4
        det1 = DetectionItem(
            id="TRK-001",
            object_type="human",
            category="HUMAN",
            confidence=0.96,
            bbox=BoundingBox(x=0.38, y=0.48, width=0.04, height=0.04),
            centroid=Centroid(x=0.40, y=0.50),
        )
        events_frame1 = mgr.evaluate_detections([det1])
        # First frame has no previous position, so no breach yet
        self.assertEqual(len(events_frame1), 0)

        # Frame 2: Object moves to x=0.60 (crosses vertical line x=0.50)
        det2 = DetectionItem(
            id="TRK-001",
            object_type="human",
            category="HUMAN",
            confidence=0.97,
            bbox=BoundingBox(x=0.58, y=0.48, width=0.04, height=0.04),
            centroid=Centroid(x=0.60, y=0.50),
        )
        events_frame2 = mgr.evaluate_detections([det2])
        self.assertEqual(len(events_frame2), 1)
        self.assertEqual(events_frame2[0].tripwireId, "TW-ALPHA")
        self.assertEqual(events_frame2[0].objectId, "TRK-001")
        self.assertTrue(events_frame2[0].crossed)


if __name__ == "__main__":
    unittest.main()
