"""
Tests for Detection, Process Frame, and Telemetry API endpoints.
"""

from fastapi.testclient import TestClient
from backend.app.schemas import ProcessFrameRequest


def test_process_frame_endpoint(client: TestClient, sample_frame_request: ProcessFrameRequest) -> None:
    """Verify POST /api/v1/process-frame returns valid detections and performance telemetry."""
    response = client.post(
        "/api/v1/process-frame",
        json=sample_frame_request.model_dump()
    )
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert "data" in res_data
    
    data = res_data["data"]
    assert data["camera_id"] == "CAM-01"
    assert len(data["detections"]) > 0
    assert "inference_time_ms" in data
    assert "fps" in data


def test_process_frame_invalid_payload_error(client: TestClient) -> None:
    """Verify POST /api/v1/process-frame returns 422 on bad payload."""
    response = client.post(
        "/api/v1/process-frame",
        json={"camera_id": 12345, "tripwires": "invalid_array"}  # Invalid types
    )
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False
    assert data["error"] == "Validation Error"


def test_mock_trigger_endpoint(client: TestClient) -> None:
    """Verify POST /api/v1/mock/trigger initiates the mock broadcast pipeline."""
    response = client.post("/api/v1/mock/trigger?camera_id=CAM-01")
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert res_data["data"]["status"] == "broadcast_complete"
    assert res_data["data"]["detections_count"] > 0


def test_get_latest_detections_endpoint(client: TestClient) -> None:
    """Verify GET /api/v1/detections/latest returns detection items."""
    response = client.get("/api/v1/detections/latest")
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert isinstance(res_data["data"], list)
    assert len(res_data["data"]) > 0


def test_get_threats_endpoint(client: TestClient) -> None:
    """Verify GET /api/v1/threats returns threat alerts with XAI."""
    response = client.get("/api/v1/threats")
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    threats = res_data["data"]
    assert len(threats) > 0
    assert "aiExplanation" in threats[0]


def test_get_telemetry_endpoint(client: TestClient) -> None:
    """Verify GET /api/v1/telemetry returns telemetry metrics."""
    response = client.get("/api/v1/telemetry")
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    telemetry = res_data["data"]
    assert telemetry["systemStatus"] == "NOMINAL"
    assert "gpuUsagePercent" in telemetry
