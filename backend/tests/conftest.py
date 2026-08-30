"""
Pytest configuration and shared fixtures for backend testing.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.schemas import (
    BoundingBox,
    Point2D,
    ProcessFrameRequest,
    TripwireZone,
)


@pytest.fixture(scope="session")
def client() -> TestClient:
    """FastAPI TestClient fixture."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def sample_tripwire() -> TripwireZone:
    """Sample tripwire line across normalized coordinate plane."""
    return TripwireZone(
        id="TW-TEST-01",
        cameraId="CAM-01",
        name="Test Perimeter Fence",
        points=[Point2D(x=0.0, y=0.5), Point2D(x=1.0, y=0.5)],
        direction="INBOUND",
        isActive=True,
        severity="CRITICAL",
        color="#ff2d55"
    )


@pytest.fixture
def sample_frame_request(sample_tripwire: TripwireZone) -> ProcessFrameRequest:
    """Sample process frame request."""
    return ProcessFrameRequest(
        camera_id="CAM-01",
        frame_id="FRM-TEST-001",
        tripwires=[sample_tripwire]
    )
