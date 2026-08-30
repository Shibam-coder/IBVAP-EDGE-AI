"""
IBVAP-EDGE-AI: Object Detection Layer
Lead: Pratyush (AI/CV Backend Lead)

Supported Target Classes:
  - person -> normalized to "human" (Category: HUMAN)
  - car, truck, bus, motorcycle -> normalized to "vehicle" (Category: VEHICLE)

Features:
  - Centroid calculation (cx = x + w/2, cy = y + h/2)
  - Ultralytics YOLOv8 inference adapter with graceful fallback
  - Deterministic mock inference adapter for testing without live cameras
  - Normalized 0..1 bounding box coordinates
"""

import uuid
import math
from typing import List, Dict, Any, Optional, Tuple, Union
from datetime import datetime, timezone

from backend.app.models.schemas import BoundingBox, Centroid, DetectionItem

# Supported COCO class names to normalized types
CLASS_MAPPING: Dict[str, Tuple[str, str]] = {
    # COCO name: (object_type, category)
    "person": ("human", "HUMAN"),
    "car": ("vehicle", "VEHICLE"),
    "truck": ("vehicle", "VEHICLE"),
    "bus": ("vehicle", "VEHICLE"),
    "motorcycle": ("vehicle", "VEHICLE"),
    "motorbike": ("vehicle", "VEHICLE"),
}

# COCO 80 class IDs for YOLO models:
# 0: person, 2: car, 3: motorcycle, 5: bus, 7: truck
COCO_TARGET_CLASS_IDS = {0: "person", 2: "car", 3: "motorcycle", 5: "bus", 7: "truck"}


def calculate_centroid(bbox: Union[BoundingBox, Dict[str, Any], Tuple[float, float, float, float]]) -> Centroid:
    """
    Calculate the centroid of a bounding box.
    cx = x + width / 2
    cy = y + height / 2

    Accepts:
      - BoundingBox object
      - dict with keys ('x', 'y', 'width', 'height')
      - tuple of (x, y, width, height)
    """
    if isinstance(bbox, BoundingBox):
        x, y, w, h = bbox.x, bbox.y, bbox.width, bbox.height
    elif isinstance(bbox, dict):
        x = float(bbox.get("x", 0.0))
        y = float(bbox.get("y", 0.0))
        w = float(bbox.get("width", bbox.get("w", 0.0)))
        h = float(bbox.get("height", bbox.get("h", 0.0)))
    elif isinstance(bbox, (tuple, list)) and len(bbox) >= 4:
        x, y, w, h = float(bbox[0]), float(bbox[1]), float(bbox[2]), float(bbox[3])
    else:
        raise ValueError(f"Invalid bounding box format: {bbox}")

    cx = x + (w / 2.0)
    cy = y + (h / 2.0)
    return Centroid(x=round(cx, 6), y=round(cy, 6))


def normalize_object_type(raw_class_name: str) -> Optional[Tuple[str, str]]:
    """
    Normalize raw class labels from detector into ("human"|"vehicle", "HUMAN"|"VEHICLE").
    Returns None if the class is outside the scope (e.g. dog, bottle, chair).
    """
    normalized_key = str(raw_class_name).strip().lower()
    return CLASS_MAPPING.get(normalized_key, None)


class YOLODetector:
    """
    Ultralytics YOLOv8 detector interface.
    Gracefully handles environments with or without Ultralytics / PyTorch installed.
    """

    def __init__(
        self,
        model_name: str = "yolov8n.pt",
        confidence_threshold: float = 0.25,
        iou_threshold: float = 0.45,
    ):
        self.model_name = model_name
        self.confidence_threshold = confidence_threshold
        self.iou_threshold = iou_threshold
        self.model = None
        self.is_real_yolo_loaded = False
        self.load_status_message = ""

        self._initialize_model()

    def _initialize_model(self) -> None:
        """Attempt to load Ultralytics YOLO model."""
        try:
            from ultralytics import YOLO  # type: ignore
            self.model = YOLO(self.model_name)
            self.is_real_yolo_loaded = True
            self.load_status_message = f"Ultralytics YOLO model '{self.model_name}' loaded successfully."
        except ImportError as e:
            self.is_real_yolo_loaded = False
            self.load_status_message = (
                f"Ultralytics is not installed in the environment ({str(e)}). "
                "Detector initialized in mock/standby adapter mode."
            )
        except Exception as e:
            self.is_real_yolo_loaded = False
            self.load_status_message = (
                f"Failed to load YOLO model weights '{self.model_name}' ({str(e)}). "
                "Detector initialized in mock/standby adapter mode."
            )

    def get_status(self) -> Dict[str, Any]:
        """Return diagnostic status of the detector."""
        return {
            "model_name": self.model_name,
            "is_yolo_loaded": self.is_real_yolo_loaded,
            "confidence_threshold": self.confidence_threshold,
            "status_message": self.load_status_message,
        }

    def detect_frame(
        self,
        frame: Any,
        camera_id: str = "CAM-01",
        frame_width: Optional[int] = None,
        frame_height: Optional[int] = None,
    ) -> List[DetectionItem]:
        """
        Run inference on a single frame (numpy array or image path).
        Filters only target classes (human, vehicle) and normalizes coordinates to 0..1.
        """
        if not self.is_real_yolo_loaded or self.model is None:
            # When YOLO is unavailable, return empty list (or use MockDetector for test scenarios)
            return []

        try:
            results = self.model(
                frame,
                conf=self.confidence_threshold,
                iou=self.iou_threshold,
                classes=list(COCO_TARGET_CLASS_IDS.keys()),
                verbose=False,
            )
        except Exception as e:
            print(f"[YOLODetector] Inference error: {e}")
            return []

        detections: List[DetectionItem] = []

        for result in results:
            boxes = result.boxes
            if boxes is None:
                continue

            orig_h, orig_w = result.orig_shape if hasattr(result, "orig_shape") else (1080, 1920)
            img_w = float(frame_width or orig_w)
            img_h = float(frame_height or orig_h)

            for box in boxes:
                cls_id = int(box.cls[0].item()) if hasattr(box.cls[0], "item") else int(box.cls[0])
                raw_class = COCO_TARGET_CLASS_IDS.get(cls_id, result.names.get(cls_id, "unknown"))
                norm_res = normalize_object_type(raw_class)
                if not norm_res:
                    continue

                obj_type, category = norm_res
                conf = float(box.conf[0].item() if hasattr(box.conf[0], "item") else box.conf[0])

                # Bounding box xyxy format
                xyxy = box.xyxy[0].tolist() if hasattr(box.xyxy[0], "tolist") else list(box.xyxy[0])
                x1, y1, x2, y2 = xyxy

                # Normalize to 0..1 range
                norm_x = max(0.0, min(1.0, x1 / img_w))
                norm_y = max(0.0, min(1.0, y1 / img_h))
                norm_w = max(0.0, min(1.0, (x2 - x1) / img_w))
                norm_h = max(0.0, min(1.0, (y2 - y1) / img_h))

                bbox = BoundingBox(x=round(norm_x, 6), y=round(norm_y, 6), width=round(norm_w, 6), height=round(norm_h, 6))
                centroid = calculate_centroid(bbox)

                det_id = f"det_{uuid.uuid4().hex[:8]}"
                detections.append(
                    DetectionItem(
                        id=det_id,
                        object_type=obj_type,
                        category=category,
                        confidence=round(conf, 4),
                        bbox=bbox,
                        centroid=centroid,
                        camera_id=camera_id,
                    )
                )

        return detections


class MockDetectionAdapter:
    """
    Deterministic Mock Detection Adapter for testing, offline execution,
    and end-to-end telemetry without requiring live CCTV cameras or GPU hardware.
    Produces identical DetectionItem output contracts.
    """

    @staticmethod
    def create_detection(
        object_type: str,
        confidence: float,
        x: float,
        y: float,
        width: float,
        height: float,
        object_id: Optional[str] = None,
        camera_id: str = "CAM-01",
        speed: Optional[float] = None,
        speedKmH: Optional[float] = None,
        posture: Optional[str] = None,
        previous_centroid: Optional[Centroid] = None,
    ) -> DetectionItem:
        """Create a deterministic normalized detection item."""
        norm = normalize_object_type(object_type)
        if norm is None:
            # Default fallback for testing
            obj_type = object_type.lower()
            category = object_type.upper()
        else:
            obj_type, category = norm

        bbox = BoundingBox(x=round(x, 6), y=round(y, 6), width=round(width, 6), height=round(height, 6))
        centroid = calculate_centroid(bbox)

        det_id = object_id or f"mock_{uuid.uuid4().hex[:8]}"

        return DetectionItem(
            id=det_id,
            object_type=obj_type,
            category=category,
            confidence=round(confidence, 4),
            bbox=bbox,
            centroid=centroid,
            previous_centroid=previous_centroid,
            speed=speed,
            speedKmH=speedKmH,
            speedMps=speed if speed is not None else (speedKmH / 3.6 if speedKmH else None),
            posture=posture,
            camera_id=camera_id,
        )

    @staticmethod
    def get_predefined_scenario(scenario_name: str, step: int = 0) -> List[DetectionItem]:
        """
        Generate deterministic multi-step scenario detections.
        Step 0: Approaching boundary.
        Step 1: Crossing boundary.
        Step 2: Inside restricted zone.
        """
        step = max(0, min(2, step))

        if scenario_name == "human_crossing":
            # Human crossing vertical tripwire at x=0.5
            x_coords = [0.42, 0.52, 0.62]
            prev_x_coords = [0.38, 0.42, 0.52]
            return [
                MockDetectionAdapter.create_detection(
                    object_type="person",
                    confidence=0.96,
                    x=x_coords[step] - 0.04,
                    y=0.40,
                    width=0.08,
                    height=0.20,
                    object_id="HUMAN-TRK-101",
                    speedKmH=6.5,
                    posture="RUNNING" if step > 0 else "STANDING",
                    previous_centroid=Centroid(x=prev_x_coords[step], y=0.50),
                )
            ]

        elif scenario_name == "vehicle_approach":
            # Vehicle moving across horizontal tripwire at y=0.5
            y_coords = [0.35, 0.52, 0.68]
            prev_y_coords = [0.20, 0.35, 0.52]
            return [
                MockDetectionAdapter.create_detection(
                    object_type="truck",
                    confidence=0.98,
                    x=0.40,
                    y=y_coords[step] - 0.08,
                    width=0.20,
                    height=0.16,
                    object_id="VEH-TRK-202",
                    speedKmH=45.0,
                    previous_centroid=Centroid(x=0.50, y=prev_y_coords[step]),
                )
            ]

        else:
            # Baseline dual detection
            return [
                MockDetectionAdapter.create_detection(
                    object_type="person",
                    confidence=0.94,
                    x=0.20,
                    y=0.30,
                    width=0.06,
                    height=0.18,
                    object_id="HUMAN-01",
                    speedKmH=4.2,
                    posture="STANDING",
                ),
                MockDetectionAdapter.create_detection(
                    object_type="car",
                    confidence=0.97,
                    x=0.60,
                    y=0.60,
                    width=0.16,
                    height=0.12,
                    object_id="VEH-01",
                    speedKmH=32.0,
                ),
            ]
