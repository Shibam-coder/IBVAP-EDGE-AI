"""
IBVAP-EDGE-AI: Tripwire Service
High-level management of tripwire registrations, real-time breach detection, and event emission.
"""

from typing import List, Dict, Any, Optional
from backend.app.ai.tripwire import TripwireManager, check_tripwire_crossing
from backend.app.models.schemas import TripwireZone, TripwireBreachEvent, DetectionItem


class TripwireService:
    def __init__(self, default_camera_id: str = "CAM-01"):
        self.managers: Dict[str, TripwireManager] = {
            default_camera_id: TripwireManager(camera_id=default_camera_id)
        }

    def _get_manager(self, camera_id: str) -> TripwireManager:
        if camera_id not in self.managers:
            self.managers[camera_id] = TripwireManager(camera_id=camera_id)
        return self.managers[camera_id]

    def register_tripwire(
        self,
        camera_id: str,
        tripwire_id: str,
        name: str,
        points: List[Any],
        direction: str = "BIDIRECTIONAL",
        severity: str = "HIGH",
        is_active: bool = True,
    ) -> TripwireZone:
        mgr = self._get_manager(camera_id)
        return mgr.register_tripwire(
            tripwire_id=tripwire_id,
            name=name,
            points=points,
            direction=direction,
            severity=severity,
            is_active=is_active,
        )

    def evaluate_detections(
        self,
        camera_id: str,
        detections: List[Any],
    ) -> List[TripwireBreachEvent]:
        mgr = self._get_manager(camera_id)
        return mgr.evaluate_detections(detections)


# Singleton service instance
tripwire_service = TripwireService()
