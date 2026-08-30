"""
Comprehensive Integration Tests for IBVAP-EDGE-AI End-to-End Pipeline:
1. Human detection reaches canonical DetectionEvent
2. Vehicle detection reaches canonical DetectionEvent
3. Tripwire crossing generates TripwireEvent
4. Crossing direction is correct (INBOUND / OUTBOUND)
5. Threat score is generated (0 - 100)
6. XAI reasons are generated
7. Complete mock event pipeline works
8. WebSocket receives canonical & frontend events
9. Detector status and API integration
"""

import json
import pytest
from fastapi.testclient import TestClient

from backend.ai.detection import (
    MockDetectionAdapter,
    to_detection_event,
    normalize_object_type,
    calculate_centroid,
)
from backend.ai.tripwire import (
    check_tripwire_crossing,
    line_intersects,
    calculate_crossing_direction,
    TripwireManager,
)
from backend.ai.threat_service import (
    ThreatAnalysisInput,
    calculate_threat_score,
    to_threat_models,
)
from backend.services.detection_service import detection_service
from backend.services.tripwire_service import tripwire_service
from backend.services.event_service import event_service
from backend.app.schemas import (
    BoundingBox,
    DetectionEvent,
    DetectionItem,
    Point2D,
    ProcessFrameRequest,
    TripwireEvent,
    TripwireZone,
)


# ==========================================
# 1. HUMAN DETECTION -> CANONICAL DETECTION EVENT
# ==========================================
def test_human_detection_reaches_canonical_event() -> None:
    """Verify human classification creates valid canonical DetectionEvent."""
    det_item = MockDetectionAdapter.create_detection(
        object_type="person",
        confidence=0.95,
        x=0.40,
        y=0.45,
        width=0.10,
        height=0.30,
        object_id="HUMAN-TRK-001",
        camera_id="CAM-01",
        speedKmH=8.5,
        posture="RUNNING",
        previous_centroid=Point2D(x=0.40, y=0.30)
    )

    assert det_item.category == "HUMAN"
    assert det_item.object_type == "human"

    canonical_evt = to_detection_event(det_item)
    assert isinstance(canonical_evt, DetectionEvent)
    assert canonical_evt.object_id == "HUMAN-TRK-001"
    assert canonical_evt.object_type == "human"
    assert canonical_evt.confidence == 0.95
    assert canonical_evt.camera_id == "CAM-01"
    assert canonical_evt.centroid.x == 0.45
    assert canonical_evt.centroid.y == 0.60
    assert canonical_evt.speed is not None


# ==========================================
# 2. VEHICLE DETECTION -> CANONICAL DETECTION EVENT
# ==========================================
def test_vehicle_detection_reaches_canonical_event() -> None:
    """Verify vehicle classification creates valid canonical DetectionEvent."""
    det_item = MockDetectionAdapter.create_detection(
        object_type="truck",
        confidence=0.98,
        x=0.20,
        y=0.50,
        width=0.25,
        height=0.20,
        object_id="VEH-TRK-002",
        camera_id="CAM-02",
        speedKmH=42.0,
        previous_centroid=Point2D(x=0.20, y=0.30)
    )

    assert det_item.category == "VEHICLE"
    assert det_item.object_type == "vehicle"

    canonical_evt = to_detection_event(det_item)
    assert isinstance(canonical_evt, DetectionEvent)
    assert canonical_evt.object_id == "VEH-TRK-002"
    assert canonical_evt.object_type == "vehicle"
    assert canonical_evt.confidence == 0.98
    assert canonical_evt.camera_id == "CAM-02"


# ==========================================
# 3 & 4. TRIPWIRE CROSSING & DIRECTION DETERMINATION
# ==========================================
def test_tripwire_crossing_generates_event_inbound() -> None:
    """Verify intersecting trajectory generates TripwireEvent with INBOUND direction."""
    tw_start = Point2D(x=0.1, y=0.5)
    tw_end = Point2D(x=0.9, y=0.5)

    # Moving top (y=0.3) to bottom (y=0.7) crossing horizontal line y=0.5
    p_prev = Point2D(x=0.5, y=0.3)
    p_curr = Point2D(x=0.5, y=0.7)

    res = check_tripwire_crossing(
        previous_centroid=p_prev,
        current_centroid=p_curr,
        tripwire_start=tw_start,
        tripwire_end=tw_end,
        tripwire_id="TW-HORIZ-01",
        object_id="TRK-101",
        required_direction="INBOUND",
        camera_id="CAM-01",
        target_class="HUMAN"
    )

    assert res["crossed"] is True
    assert res["crossing_direction"] == "INBOUND"
    assert res["tripwire_id"] == "TW-HORIZ-01"
    assert res["object_id"] == "TRK-101"


def test_tripwire_crossing_outbound_direction() -> None:
    """Verify reverse trajectory calculates OUTBOUND crossing direction."""
    tw_start = Point2D(x=0.1, y=0.5)
    tw_end = Point2D(x=0.9, y=0.5)

    # Moving bottom (y=0.7) to top (y=0.3)
    p_prev = Point2D(x=0.5, y=0.7)
    p_curr = Point2D(x=0.5, y=0.3)

    dir_result = calculate_crossing_direction(p_prev, p_curr, tw_start, tw_end)
    assert dir_result == "OUTBOUND"


def test_tripwire_manager_stateful_crossing() -> None:
    """Verify TripwireManager detects breaches over successive frame evaluations."""
    mgr = TripwireManager(camera_id="CAM-01")
    mgr.register_tripwire(
        tripwire_id="TW-ALPHA",
        name="Alpha Fence",
        points=[Point2D(x=0.5, y=1.0), Point2D(x=0.5, y=0.0)],
        direction="INBOUND"
    )

    # Frame 1: Object on left (x=0.4)
    f1_det = MockDetectionAdapter.create_detection(
        object_type="person",
        confidence=0.95,
        x=0.36,
        y=0.40,
        width=0.08,
        height=0.20,
        object_id="HUMAN-1"
    )
    breaches_f1 = mgr.evaluate_detections([f1_det])
    assert len(breaches_f1) == 0

    # Frame 2: Object crossed to right (x=0.6)
    f2_det = MockDetectionAdapter.create_detection(
        object_type="person",
        confidence=0.96,
        x=0.56,
        y=0.40,
        width=0.08,
        height=0.20,
        object_id="HUMAN-1"
    )
    breaches_f2 = mgr.evaluate_detections([f2_det])
    assert len(breaches_f2) == 1
    assert breaches_f2[0].tripwire_id == "TW-ALPHA"
    assert breaches_f2[0].crossed is True


# ==========================================
# 5 & 6. THREAT SCORING & XAI REASONS
# ==========================================
def test_threat_score_and_xai_reasons() -> None:
    """Verify threat score formulation and XAI rationale output."""
    inp = ThreatAnalysisInput(
        objectType="HUMAN",
        confidence=0.95,
        tripwireBreached=True,
        crossingDirection="INBOUND",
        speedMps=3.8,
        speedKmH=13.68,
        isRestrictedZone=True,
        posture="RUNNING",
        zoneName="Restricted Zone 4",
        tripwireName="TW-NORTH",
        cameraId="CAM-01",
        objectId="TRK-99"
    )

    calc_res = calculate_threat_score(inp)
    assert 0.0 <= calc_res["score"] <= 100.0
    assert calc_res["score"] >= 80.0  # High threat score
    assert calc_res["severity"] == "CRITICAL"
    assert len(calc_res["reasons"]) >= 3
    assert any("breached" in r.lower() for r in calc_res["reasons"])
    assert any("velocity" in r.lower() or "speed" in r.lower() or "running" in r.lower() for r in calc_res["reasons"])

    thr_evt, thr_alert = to_threat_models(inp)
    assert thr_evt.threat_score == calc_res["score"]
    assert thr_evt.severity == "CRITICAL"
    assert len(thr_evt.xai_reasons) > 0
    assert thr_alert.riskScore == calc_res["score"]


# ==========================================
# 7. COMPLETE MOCK EVENT PIPELINE
# ==========================================
@pytest.mark.asyncio
async def test_complete_event_pipeline_service() -> None:
    """Verify end-to-end event service process_frame execution."""
    req = ProcessFrameRequest(
        camera_id="CAM-01",
        scenario="human_crossing",
        step=1
    )

    res = await event_service.process_frame(req)
    assert res.camera_id == "CAM-01"
    assert len(res.detections) > 0
    assert len(res.threat_alerts) > 0
    assert res.inference_time_ms > 0
    assert res.fps > 0


# ==========================================
# 8. WEBSOCKET CANONICAL & FRONTEND BROADCAST
# ==========================================
def test_websocket_receives_canonical_and_frontend_events(client: TestClient) -> None:
    """Verify WebSocket client receives both canonical envelopes and frontend message contracts."""
    with client.websocket_connect("/ws/telemetry") as ws:
        handshake = json.loads(ws.receive_text())
        assert handshake["event"] == "HEARTBEAT"

        # Trigger mock event flow via API
        resp = client.post("/api/v1/mock/trigger?scenario=human_crossing&step=1")
        assert resp.status_code == 200

        received_events = []
        for _ in range(6):
            raw = ws.receive_text()
            data = json.loads(raw)
            received_events.append(data)

        # Check that we received canonical envelopes: type="detection"|"tripwire"|"threat"
        canonical_types = [e.get("type") for e in received_events if "type" in e]
        assert "detection" in canonical_types
        assert "threat" in canonical_types

        # Check that we received frontend contracts: event="DETECTION_FRAME"|"TRIPWIRE_EVENT"|"THREAT_ALERT"
        frontend_events = [e.get("event") for e in received_events if "event" in e]
        assert "DETECTION_FRAME" in frontend_events
        assert "THREAT_ALERT" in frontend_events


# ==========================================
# 9. AI STATUS & DIRECT ENDPOINTS
# ==========================================
def test_ai_status_endpoint(client: TestClient) -> None:
    """Verify GET /api/ai/status returns detector diagnostic state."""
    resp = client.get("/api/ai/status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert "detector" in data
    assert "status_message" in data["detector"]


def test_direct_tripwire_and_threat_endpoints(client: TestClient) -> None:
    """Verify POST /api/tripwire/evaluate and POST /api/threat/calculate."""
    tw_res = client.post(
        "/api/tripwire/evaluate",
        json={
            "camera_id": "CAM-01",
            "tripwire_id": "TW-01",
            "start_point": {"x": 0.5, "y": 1.0},
            "end_point": {"x": 0.5, "y": 0.0},
            "previous_centroid": {"x": 0.4, "y": 0.5},
            "current_centroid": {"x": 0.6, "y": 0.5},
            "direction": "INBOUND",
            "object_id": "OBJ-1",
            "target_class": "HUMAN"
        }
    )
    assert tw_res.status_code == 200
    assert tw_res.json()["result"]["crossed"] is True

    thr_res = client.post(
        "/api/threat/calculate",
        json={
            "objectType": "HUMAN",
            "confidence": 0.95,
            "tripwireBreached": True,
            "crossingDirection": "INBOUND",
            "speedMps": 3.5,
            "posture": "RUNNING"
        }
    )
    assert thr_res.status_code == 200
    assert thr_res.json()["data"]["score"] >= 80
