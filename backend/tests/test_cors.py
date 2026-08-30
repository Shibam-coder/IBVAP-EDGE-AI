"""
Tests for CORS headers and Origin handling.
"""

from fastapi.testclient import TestClient


def test_cors_headers_on_health(client: TestClient) -> None:
    """Verify CORS allow-origin header is returned for frontend origin."""
    response = client.get(
        "/health",
        headers={"Origin": "http://localhost:3000"}
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"
    assert response.headers.get("access-control-allow-credentials") == "true"


def test_cors_preflight_options_request(client: TestClient) -> None:
    """Verify OPTIONS preflight request for API routes."""
    response = client.options(
        "/api/v1/process-frame",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type"
        }
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"
    assert "POST" in response.headers.get("access-control-allow-methods", "")
