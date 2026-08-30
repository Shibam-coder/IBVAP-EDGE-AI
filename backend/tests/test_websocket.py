"""
Tests for WebSocket endpoints and event streaming broadcasts.
"""

import json
from fastapi.testclient import TestClient
from backend.app.schemas import EventEnvelope
from backend.app.websocket_manager import ws_manager


def test_websocket_telemetry_handshake(client: TestClient) -> None:
    """Verify WebSocket /ws/telemetry connects and receives initial heartbeat."""
    with client.websocket_connect("/ws/telemetry") as websocket:
        data = websocket.receive_text()
        msg = json.loads(data)
        assert msg["event"] == "HEARTBEAT"
        assert msg["payload"]["status"] == "connected"
        assert msg["payload"]["stream"] == "telemetry"


def test_websocket_detections_handshake(client: TestClient) -> None:
    """Verify WebSocket /ws/detections connects and receives initial heartbeat."""
    with client.websocket_connect("/ws/detections") as websocket:
        data = websocket.receive_text()
        msg = json.loads(data)
        assert msg["event"] == "HEARTBEAT"
        assert msg["payload"]["stream"] == "detections"


def test_websocket_ping_pong_keepalive(client: TestClient) -> None:
    """Verify WebSocket responds to client ping messages."""
    with client.websocket_connect("/ws/telemetry") as websocket:
        _ = websocket.receive_text()  # Handshake

        # Send JSON ping
        websocket.send_text(json.dumps({"type": "ping"}))
        response = websocket.receive_text()
        resp_json = json.loads(response)
        assert resp_json["type"] == "pong"


def test_websocket_mock_trigger_broadcast(client: TestClient) -> None:
    """Verify triggering mock events broadcasts live messages to connected WebSocket clients."""
    with client.websocket_connect("/ws/telemetry") as websocket:
        _ = websocket.receive_text()  # Handshake

        # Trigger mock event pipeline via REST API
        trigger_res = client.post("/api/v1/mock/trigger?camera_id=CAM-01")
        assert trigger_res.status_code == 200

        # Receive broadcast messages (detections, tripwire, threat alerts)
        received_types = []
        for _ in range(6):  # Canonical envelopes + frontend messages
            msg_text = websocket.receive_text()
            msg = json.loads(msg_text)
            if "event" in msg:
                received_types.append(msg["event"])
            elif "type" in msg:
                received_types.append(msg["type"])

        assert "DETECTION_FRAME" in received_types or "detection" in received_types
        assert "TRIPWIRE_EVENT" in received_types or "tripwire" in received_types
        assert "THREAT_ALERT" in received_types or "threat" in received_types
