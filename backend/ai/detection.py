"""
IBVAP-EDGE-AI: Object Detection Layer
Lead: Pratyush (AI/CV Backend Lead) & Bunty (Backend/API Integration Lead)

Target Classes:
  - person -> normalized to "human" (Category: HUMAN)
  - car, truck, bus, motorcycle -> normalized to "vehicle" (Category: VEHICLE)

Features:
  - Centroid calculation: cx = x + width/2, cy = y + height/2
  - Ultralytics YOLOv8 inference adapter with graceful standby fallback
  - Deterministic mock inference adapter for testing without live cameras
  - Coordinate normalization to 0..1 bounding box space
  - Conversion to canonical DetectionEvent and frontend DetectionItem
"""

import uuid
import math
from typing import List, Dict, Any, Optional, Tuple, Union
from datetime import datetime, timezone

from ..app.schemas import (
    BoundingBox,
    Centroid,
    DetectionCategory,
    DetectionEvent,
    DetectionItem,
    Point2D,
    get_current_utc_timestamp,
)

# Supported COCO class names to normalized types
CLASS_MAPPING: Dict[str, Tuple[str, DetectionCategory]] = {
    "person": ("human", "HUMAN"),
    "human": ("human", "HUMAN"),
    "car": ("vehicle", "VEHICLE"),
    "truck": ("vehicle", "VEHICLE"),
    "bus": ("vehicle", "VEHICLE"),
    "motorcycle": ("vehicle", "VEHICLE"),
    "motorbike": ("vehicle", "VEHICLE"),
    "vehicle": ("vehicle", "VEHICLE"),
}

# COCO 80 class IDs for YOLO models:
# 0: person, 2: car, 3: motorcycle, 5: bus, 7: truck
COCO_TARGET_CLASS_IDS = {0: "person", 2: "car", 3: "motorcycle", 5: "bus", 7: "truck"}


def calculate_centroid(bbox: Union[BoundingBox, Dict[str, Any], Tuple[float, float, float, float], List[float]]) -> Point2D:
    """
    Calculate the centroid of a bounding box.
    cx = x + width / 2
    cy = y + height / 2
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
    return Point2D(x=round(cx, 6), y=round(cy, 6))


compute_centroid = calculate_centroid  # Alias


def estimate_speed_mps(
    p_prev: Optional[Point2D],
    p_curr: Point2D,
    dt_sec: float = 0.1,
    scale_factor: float = 15.0
) -> float:
    """Estimate velocity in meters per second from coordinate displacement."""
    if p_prev is None or dt_sec <= 0:
        return 0.0

    dx = p_curr.x - p_prev.x
    dy = p_curr.y - p_prev.y
    distance = math.sqrt(dx * dx + dy * dy)
    speed = (distance * scale_factor) / dt_sec
    return round(speed, 2)


def normalize_object_type(raw_class_name: str) -> Optional[Tuple[str, DetectionCategory]]:
    """
    Normalize raw class labels from detector into ("human"|"vehicle", "HUMAN"|"VEHICLE").
    """
    normalized_key = str(raw_class_name).strip().lower()
    return CLASS_MAPPING.get(normalized_key, None)


def to_detection_event(det: DetectionItem) -> DetectionEvent:
    """Convert DetectionItem to canonical DetectionEvent format."""
    box = det.bbox or det.boundingBox or BoundingBox(x=0.0, y=0.0, width=0.0, height=0.0)
    centroid = det.centroid or calculate_centroid(box)
    
    speed_val = det.speed if det.speed is not None else (
        det.speedMps if det.speedMps is not None else (
            det.speedKmH / 3.6 if det.speedKmH else None
        )
    )

    return DetectionEvent(
        event_id=f"EVT-{det.id}",
        camera_id=det.camera_id or "CAM-01",
        timestamp=det.timestamp or get_current_utc_timestamp(),
        object_id=det.trackId or det.id,
        object_type=det.object_type or "human",
        confidence=det.confidence,
        bbox=box,
        centroid=centroid,
        speed=round(speed_val, 2) if speed_val is not None else None,
        previous_centroid=det.previous_centroid
    )


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
        Run inference on a single frame.
        Filters only target classes (human, vehicle) and normalizes coordinates to 0..1.
        """
        if not self.is_real_yolo_loaded or self.model is None:
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

                xyxy = box.xyxy[0].tolist() if hasattr(box.xyxy[0], "tolist") else list(box.xyxy[0])
                x1, y1, x2, y2 = xyxy

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
                        boundingBox=bbox,
                        centroid=centroid,
                        camera_id=camera_id,
                        label=f"{category} #{det_id[-4:].upper()}"
                    )
                )

        return detections


class MockDetectionAdapter:
    """
    Deterministic Mock Detection Adapter for testing, offline execution,
    and end-to-end telemetry without requiring live cameras or GPU hardware.
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
        previous_centroid: Optional[Point2D] = None,
        is_hostile: bool = False,
    ) -> DetectionItem:
        """Create a deterministic normalized detection item."""
        norm = normalize_object_type(object_type)
        if norm is None:
            obj_type = object_type.lower()
            category: DetectionCategory = "HUMAN" if "human" in obj_type or "person" in obj_type else "VEHICLE"
        else:
            obj_type, category = norm

        bbox = BoundingBox(x=round(x, 6), y=round(y, 6), width=round(width, 6), height=round(height, 6))
        centroid = calculate_centroid(bbox)
        det_id = object_id or f"mock_{uuid.uuid4().hex[:8]}"
        speed_mps = speed if speed is not None else (speedKmH / 3.6 if speedKmH else None)

        return DetectionItem(
            id=det_id,
            object_type=obj_type,
            category=category,
            confidence=round(confidence, 4),
            bbox=bbox,
            boundingBox=bbox,
            centroid=centroid,
            previous_centroid=previous_centroid,
            speed=speed_mps,
            speedKmH=speedKmH or (round(speed_mps * 3.6, 1) if speed_mps else None),
            speedMps=round(speed_mps, 2) if speed_mps else None,
            posture=posture,
            camera_id=camera_id,
            isHostile=is_hostile,
            severity="CRITICAL" if is_hostile else "INFO",
            label=f"{category} #{det_id[-6:].upper()}"
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
                    previous_centroid=Point2D(x=prev_x_coords[step], y=0.50),
                    is_hostile=step > 0
                )
            ]

        elif scenario_name == "vehicle_approach":
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
                    previous_centroid=Point2D(x=0.50, y=prev_y_coords[step]),
                    is_hostile=step > 0
                )
            ]

        else:
            # Default rich tactical scene
            return [
                MockDetectionAdapter.create_detection(
                    object_type="person",
                    confidence=0.94,
                    x=0.42,
                    y=0.48,
                    width=0.12,
                    height=0.28,
                    object_id="HUMAN-TRK-101",
                    speedKmH=12.2,
                    posture="RUNNING",
                    previous_centroid=Point2D(x=0.48, y=0.35),
                    is_hostile=True
                ),
                MockDetectionAdapter.create_detection(
                    object_type="car",
                    confidence=0.97,
                    x=0.20,
                    y=0.60,
                    width=0.22,
                    height=0.18,
                    object_id="VEH-TRK-204",
                    speedKmH=18.5,
                    previous_centroid=Point2D(x=0.20, y=0.45),
                    is_hostile=False
                )
            ]
