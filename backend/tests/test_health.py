"""
Tests for /health endpoint.
"""

from fastapi.testclient import TestClient


def test_health_endpoint_status_code(client: TestClient) -> None:
    """Verify GET /health returns HTTP 200 OK."""
    response = client.get("/health")
    assert response.status_code == 200


def test_health_endpoint_response_structure(client: TestClient) -> None:
    """Verify GET /health returns canonical response payload."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "IBVAP-EDGE-AI"
    assert data["mode"] == "local"


def test_root_metadata_endpoint(client: TestClient) -> None:
    """Verify GET / returns online status and endpoint URLs."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "telemetry_ws" in data
