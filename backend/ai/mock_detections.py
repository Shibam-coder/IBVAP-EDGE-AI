"""
Mock event generation pipeline for Human/Vehicle Detection, Tripwire Breaches, and XAI Threat Scores.
Provides deterministic simulation for end-to-end frontend/backend telemetry testing.
"""

from typing import List, Tuple
import uuid
from ..app.schemas import (
    BoundingBox,
    DetectionEvent,
    DetectionItem,
    Point2D,
    ThreatAlert,
    ThreatEvent,
    TripwireEvent,
    TripwireZone,
    XaiExplanation,
    XaiFactor,
    get_current_utc_timestamp,
)
from .detection import MockDetectionAdapter, to_detection_event
from .threat_service import ThreatAnalysisInput, calculate_threat_score, to_threat_models


def generate_mock_detection_sequence() -> Tuple[List[DetectionItem], List[TripwireEvent], List[ThreatAlert]]:
    """
    Generates a full tactical event sequence:
    1. Human detected approaching boundary
    2. Tripwire breach (INBOUND)
    3. Threat alert calculated with XAI explanation breakdown
    """
    ts = get_current_utc_timestamp()
    cam_id = "CAM-01"
    track_id = "HUMAN-TRK-101"

    # 1. Detection items
    detection_items = [
        MockDetectionAdapter.create_detection(
            object_type="person",
            confidence=0.94,
            x=0.42,
            y=0.48,
            width=0.12,
            height=0.28,
            object_id=track_id,
            camera_id=cam_id,
            speedKmH=12.2,
            posture="RUNNING",
            previous_centroid=Point2D(x=0.48, y=0.35),
            is_hostile=True,
        )
    ]

    # 2. Tripwire Breach Event
    tripwire_events = [
        TripwireEvent(
            id=f"TWE-{uuid.uuid4().hex[:8].upper()}",
            tripwire_id="TW-ALPHA-01",
            camera_id=cam_id,
            object_id=track_id,
            crossed=True,
            crossing_direction="INBOUND",
            timestamp=ts,
            targetClass="HUMAN",
            confidence=0.96,
            tripwire_breached=True,
        )
    ]

    # 3. Threat Alert with XAI Explanation
    analysis_input = ThreatAnalysisInput(
        objectType="HUMAN",
        confidence=0.94,
        tripwireBreached=True,
        crossingDirection="INBOUND",
        speedMps=3.4,
        speedKmH=12.2,
        isRestrictedZone=True,
        posture="RUNNING",
        zoneName="Sector-04 Perimeter Alpha",
        tripwireName="TW-ALPHA-01",
        cameraId=cam_id,
        objectId=track_id,
    )
    _, threat_alert = to_threat_models(analysis_input)

    return detection_items, tripwire_events, [threat_alert]


def generate_canonical_events() -> Tuple[DetectionEvent, TripwireEvent, ThreatEvent]:
    """
    Generate canonical Pydantic event models for unit testing and schema compliance.
    """
    det_items, trip_events, _ = generate_mock_detection_sequence()
    det_event = to_detection_event(det_items[0])
    det_event.event_id = f"EVT-DET-{uuid.uuid4().hex[:6]}"
    trip_event = trip_events[0]

    analysis_input = ThreatAnalysisInput(
        objectType="HUMAN",
        confidence=0.94,
        tripwireBreached=True,
        crossingDirection="INBOUND",
        speedMps=3.4,
        isRestrictedZone=True,
        posture="RUNNING",
        zoneName="Sector-04 Perimeter Alpha",
        tripwireName="TW-ALPHA-01",
        cameraId="CAM-01",
        objectId=det_event.object_id,
    )
    threat_event, _ = to_threat_models(analysis_input)

    return det_event, trip_event, threat_event


def get_default_mock_tripwires(camera_id: str = "CAM-01") -> List[TripwireZone]:
    """Provide default mock tripwire lines matching frontend video coordinates."""
    return [
        TripwireZone(
            id="TW-ALPHA-01",
            cameraId=camera_id,
            name="Alpha Perimeter Virtual Fence",
            points=[Point2D(x=0.1, y=0.5), Point2D(x=0.9, y=0.5)],
            direction="INBOUND",
            isActive=True,
            severity="CRITICAL",
            color="#ff2d55"
        ),
        TripwireZone(
            id="TW-BRAVO-02",
            cameraId=camera_id,
            name="Bravo Checkpoint Boundary",
            points=[Point2D(x=0.2, y=0.8), Point2D(x=0.8, y=0.8)],
            direction="BIDIRECTIONAL",
            isActive=True,
            severity="HIGH",
            color="#feb700"
        )
    ]
