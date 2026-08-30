"""
Unit tests for AI Detection layer (Centroid, Class Normalization, Bounding Boxes, Mock Adapter).
"""

import unittest
from backend.app.models.schemas import BoundingBox, Centroid, DetectionItem
from backend.app.ai.detection import (
    calculate_centroid,
    normalize_object_type,
    YOLODetector,
    MockDetectionAdapter,
    CLASS_MAPPING,
)


class TestDetectionLayer(unittest.TestCase):

    def test_centroid_calculation_dataclass(self):
        """Test centroid calculation using BoundingBox dataclass."""
        bbox = BoundingBox(x=0.2, y=0.4, width=0.1, height=0.2)
        c = calculate_centroid(bbox)
        # cx = 0.2 + 0.1/2 = 0.25, cy = 0.4 + 0.2/2 = 0.50
        self.assertAlmostEqual(c.x, 0.25, places=5)
        self.assertAlmostEqual(c.y, 0.50, places=5)

    def test_centroid_calculation_dict(self):
        """Test centroid calculation using dictionary."""
        bbox_dict = {"x": 0.0, "y": 0.0, "width": 1.0, "height": 1.0}
        c = calculate_centroid(bbox_dict)
        self.assertAlmostEqual(c.x, 0.5, places=5)
        self.assertAlmostEqual(c.y, 0.5, places=5)

    def test_centroid_calculation_tuple(self):
        """Test centroid calculation using tuple (x, y, w, h)."""
        c = calculate_centroid((0.3, 0.5, 0.2, 0.4))
        self.assertAlmostEqual(c.x, 0.4, places=5)
        self.assertAlmostEqual(c.y, 0.7, places=5)

    def test_human_classification_normalization(self):
        """Test normalization for human class."""
        res = normalize_object_type("person")
        self.assertIsNotNone(res)
        self.assertEqual(res[0], "human")
        self.assertEqual(res[1], "HUMAN")

    def test_vehicle_classification_normalization(self):
        """Test normalization for vehicle classes."""
        vehicle_classes = ["car", "truck", "bus", "motorcycle", "motorbike"]
        for cls_name in vehicle_classes:
            res = normalize_object_type(cls_name)
            self.assertIsNotNone(res, f"Failed for {cls_name}")
            self.assertEqual(res[0], "vehicle")
            self.assertEqual(res[1], "VEHICLE")

    def test_unsupported_classes_ignored(self):
        """Test that out-of-scope classes return None."""
        unsupported = ["dog", "cat", "chair", "backpack", "bottle", "traffic light"]
        for cls_name in unsupported:
            res = normalize_object_type(cls_name)
            self.assertIsNone(res, f"Should be None for {cls_name}")

    def test_mock_detection_adapter(self):
        """Test deterministic mock detection adapter output contract."""
        det = MockDetectionAdapter.create_detection(
            object_type="person",
            confidence=0.98234,
            x=0.45,
            y=0.55,
            width=0.08,
            height=0.22,
            object_id="HUMAN-TEST-01",
            speedKmH=5.4,
            posture="RUNNING",
        )
        self.assertEqual(det.object_type, "human")
        self.assertEqual(det.category, "HUMAN")
        self.assertEqual(det.id, "HUMAN-TEST-01")
        self.assertAlmostEqual(det.confidence, 0.9823, places=3)
        self.assertAlmostEqual(det.centroid.x, 0.49, places=5)
        self.assertAlmostEqual(det.centroid.y, 0.66, places=5)

        det_dict = det.to_dict()
        self.assertEqual(det_dict["object_type"], "human")
        self.assertEqual(det_dict["category"], "HUMAN")
        self.assertIn("bbox", det_dict)
        self.assertIn("centroid", det_dict)
        self.assertIn("speedKmH", det_dict)

    def test_yolo_detector_status(self):
        """Test YOLODetector initialization and diagnostic reporting."""
        detector = YOLODetector(model_name="yolov8n.pt")
        status = detector.get_status()
        self.assertIn("is_yolo_loaded", status)
        self.assertIn("status_message", status)
        self.assertIn("confidence_threshold", status)


if __name__ == "__main__":
    unittest.main()
