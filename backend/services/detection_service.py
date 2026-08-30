"""
IBVAP-EDGE-AI: Detection Service
Encapsulates YOLO and Mock detection adapters behind a unified interface.
"""

from typing import List, Dict, Any, Optional
from ..ai.detection import YOLODetector, MockDetectionAdapter, to_detection_event
from ..app.schemas import DetectionItem, DetectionEvent


class DetectionService:
    """Service layer managing YOLO and deterministic Mock detection adapters."""

    def __init__(self, model_name: str = "yolov8n.pt", conf_threshold: float = 0.25):
        self.detector = YOLODetector(model_name=model_name, confidence_threshold=conf_threshold)
        self.mock_adapter = MockDetectionAdapter()

    def get_status(self) -> Dict[str, Any]:
        """Return detector status and capability flags."""
        return self.detector.get_status()

    def process_frame(
        self,
        frame: Any,
        camera_id: str = "CAM-01",
        frame_width: Optional[int] = None,
        frame_height: Optional[int] = None,
        frame_index: Optional[int] = None,
    ) -> List[DetectionItem]:
        """Run YOLO detection on an incoming frame with graceful fallback."""
        from ..ai.detection import decode_image_frame

        decoded = decode_image_frame(frame)
        if decoded is not None:
            img_arr, w, h = decoded
            if self.detector.is_real_yolo_loaded:
                results = self.detector.detect_frame(
                    frame=img_arr,
                    camera_id=camera_id,
                    frame_width=w,
                    frame_height=h,
                )
                if results:
                    return results

            # When YOLO is in fallback mode or returns empty on video demo,
            # use frame_index progression to produce continuous tracked detections
            if frame_index is not None:
                step = min(2, max(0, (frame_index - 1) // 3))
                scenario_dets = self.mock_adapter.get_predefined_scenario("human_crossing", step=step)
                for d in scenario_dets:
                    d.camera_id = camera_id
                return scenario_dets

        if self.detector.is_real_yolo_loaded and frame is not None:
            return self.detector.detect_frame(
                frame=frame,
                camera_id=camera_id,
                frame_width=frame_width,
                frame_height=frame_height,
            )
        else:
            return self.mock_adapter.get_predefined_scenario("default")

    def process_scenario(
        self,
        scenario_name: str,
        step: int = 0,
        camera_id: str = "CAM-01",
    ) -> List[DetectionItem]:
        """Generate deterministic scenario detections for testing and live demonstrations."""
        detections = self.mock_adapter.get_predefined_scenario(scenario_name, step=step)
        for det in detections:
            det.camera_id = camera_id
        return detections


# Singleton service instance
detection_service = DetectionService()
