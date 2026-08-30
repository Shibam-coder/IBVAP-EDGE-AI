"""
Tests for canonical Pydantic schemas and serialization/validation logic.
"""

import pytest
from pydantic import ValidationError
from backend.ai.mock_detections import generate_canonical_events
from backend.app.schemas import (
    BoundingBox,
    DetectionEvent,
    DetectionItem,
    EventEnvelope,
    FrontendWebSocketMessage,
    Point2D,
    ThreatAlert,
    ThreatEvent,
    TripwireEvent,
    TripwireZone,
    XaiExplanation,
    XaiFactor,
)


def test_canonical_events_generation() -> None:
    """Verify mock canonical event generation generates valid models."""
    det, trip, threat = generate_canonical_events()

    assert det.event_id.startswith("EVT-DET-")
    assert det.object_type == "human"
    assert 0.0 <= det.confidence <= 1.0

    assert trip.tripwire_id == "TW-ALPHA-01"
    assert trip.crossed is True
    assert trip.crossing_direction == "INBOUND"

    assert threat.threat_score == 88.5
    assert threat.severity == "CRITICAL"
    assert len(threat.xai_reasons) > 0


def test_detection_event_validation_invalid_confidence() -> None:
    """DetectionEvent must reject confidence outside 0.0..1.0."""
    with pytest.raises(ValidationError):
        DetectionEvent(
            event_id="EVT-1",
            camera_id="CAM-01",
            object_id="obj_1",
            object_type="human",
            confidence=1.5,  # Invalid: > 1.0
            bbox=[0.1, 0.1, 0.2, 0.2],
            centroid=[0.2, 0.2]
        )


def test_threat_event_validation_invalid_score() -> None:
    """ThreatEvent must reject threat score > 100."""
    with pytest.raises(ValidationError):
        ThreatEvent(
            event_id="EVT-THR-1",
            camera_id="CAM-01",
            object_type="human",
            threat_score=150.0,  # Invalid: > 100
            severity="CRITICAL"
        )


def test_event_envelope_serialization() -> None:
    """Verify EventEnvelope JSON serialization matches Step 5 specification."""
    envelope = EventEnvelope(
        type="threat",
        timestamp="2026-08-30T12:00:00Z",
        data={
            "threat_score": 92.0,
            "severity": "CRITICAL",
            "xai_reasons": ["Tripwire breach"]
        }
    )

    dumped = envelope.model_dump()
    assert dumped["type"] == "threat"
    assert dumped["timestamp"] == "2026-08-30T12:00:00Z"
    assert dumped["data"]["threat_score"] == 92.0


def test_frontend_websocket_message_serialization() -> None:
    """Verify FrontendWebSocketMessage serialization matches Next.js types."""
    msg = FrontendWebSocketMessage(
        event="THREAT_ALERT",
        payload={"riskScore": 88.5, "severity": "CRITICAL"},
        timestamp="2026-08-30T12:00:00Z"
    )

    dumped = msg.model_dump()
    assert dumped["event"] == "THREAT_ALERT"
    assert dumped["payload"]["riskScore"] == 88.5


def test_tripwire_zone_minimum_points_validation() -> None:
    """TripwireZone must require at least 2 points."""
    with pytest.raises(ValidationError):
        TripwireZone(
            id="TW-1",
            cameraId="CAM-01",
            name="Zone 1",
            points=[Point2D(x=0.1, y=0.1)]  # Only 1 point: Invalid
        )
