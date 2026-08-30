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


def generate_mock_detection_sequence() -> Tuple[List[DetectionItem], List[TripwireEvent], List[ThreatAlert]]:
    """
    Generates a full tactical event sequence:
    1. Human detected approaching boundary
    2. Tripwire breach (INBOUND)
    3. Threat alert calculated with XAI explanation breakdown
    """
    ts = get_current_utc_timestamp()
    cam_id = "CAM-01"
    track_id = "TRK-101"

    # 1. Human Detection Item
    human_bbox = BoundingBox(x=0.42, y=0.48, width=0.12, height=0.28)
    human_centroid = Point2D(x=0.48, y=0.62)
    human_prev_centroid = Point2D(x=0.48, y=0.35)

    detection_item = DetectionItem(
        id=f"DET-{uuid.uuid4().hex[:8].upper()}",
        camera_id=cam_id,
        timestamp=ts,
        confidence=0.94,
        category="HUMAN",
        object_type="human",
        label="HUMAN #101",
        bbox=human_bbox,
        boundingBox=human_bbox,
        centroid=human_centroid,
        severity="CRITICAL",
        trackId=track_id,
        speedMps=3.4,
        speedKmH=12.2,
        posture="RUNNING",
        isHostile=True
    )

    # 2. Tripwire Breach Event
    tripwire_event = TripwireEvent(
        id=f"TWE-{uuid.uuid4().hex[:8].upper()}",
        tripwire_id="TW-ALPHA-01",
        camera_id=cam_id,
        object_id=track_id,
        crossed=True,
        crossing_direction="INBOUND",
        timestamp=ts,
        targetClass="HUMAN",
        confidence=0.96
    )

    # 3. XAI Threat Explanation & Alert
    xai_explanation = XaiExplanation(
        classConfidence=0.94,
        speedMps=3.4,
        kinematicProfile="ACCELERATING_INBOUND",
        trajectoryDescription="Direct perpendicular approach vector to Sector-04 perimeter",
        reasons=[
            "Target crossed virtual perimeter tripwire TW-ALPHA-01 inbound",
            "Elevated approach velocity (3.4 m/s) towards restricted zone",
            "Anomalous running posture identified in high-security sector"
        ],
        factors=[
            XaiFactor(name="Tripwire Breach", weight=0.45, description="Active perimeter line crossing"),
            XaiFactor(name="Kinematic Velocity", weight=0.30, description="Abnormal approach velocity"),
            XaiFactor(name="Posture & Trajectory", weight=0.25, description="Hostile posture pattern")
        ]
    )

    threat_alert = ThreatAlert(
        id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
        timestamp=ts,
        incidentCode="INC-26187",
        title="High-Threat Perimeter Breach Detected",
        cameraId=cam_id,
        cameraName="Sector-04 Perimeter Alpha",
        severity="CRITICAL",
        riskScore=88.5,
        threat_score=88.5,
        aiExplanation=xai_explanation,
        status="OPEN"
    )

    return [detection_item], [tripwire_event], [threat_alert]


def generate_canonical_events() -> Tuple[DetectionEvent, TripwireEvent, ThreatEvent]:
    """
    Generate canonical Step 4 Pydantic event models for unit testing and schema compliance.
    """
    ts = get_current_utc_timestamp()
    cam_id = "CAM-01"
    obj_id = "obj_101"

    det_event = DetectionEvent(
        event_id=f"EVT-DET-{uuid.uuid4().hex[:6]}",
        camera_id=cam_id,
        timestamp=ts,
        object_id=obj_id,
        object_type="human",
        confidence=0.94,
        bbox=[0.42, 0.48, 0.12, 0.28],
        centroid=[0.48, 0.62],
        speed=3.4,
        previous_centroid=[0.48, 0.35]
    )

    trip_event = TripwireEvent(
        tripwire_id="TW-ALPHA-01",
        camera_id=cam_id,
        object_id=obj_id,
        crossed=True,
        crossing_direction="INBOUND",
        timestamp=ts
    )

    threat_event = ThreatEvent(
        event_id=f"EVT-THR-{uuid.uuid4().hex[:6]}",
        camera_id=cam_id,
        object_type="human",
        threat_score=88.5,
        severity="CRITICAL",
        xai_reasons=[
            "Perimeter tripwire breach detected on TW-ALPHA-01",
            "High approach velocity (3.4 m/s)",
            "Target identified in restricted perimeter zone"
        ],
        timestamp=ts
    )

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
