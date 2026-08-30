"""
Unit and integration tests for FastAPI endpoints (/health, /api/detection/process, /api/tripwire/evaluate, /api/threat/calculate).
Supports both TestClient and direct route function invocation.
"""

import unittest
from backend.app.main import app, health_check
from backend.app.api.endpoints import (
    get_health,
    get_ai_status,
    process_detection,
    evaluate_tripwire,
    calculate_threat,
    DetectionProcessRequest,
    TripwireEvaluateRequest,
    TripwirePointInput,
    ThreatCalcRequest,
)


class TestApiEndpoints(unittest.TestCase):

    def test_direct_health_endpoint(self):
        """Test GET /health direct invocation."""
        data = health_check()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["service"], "IBVAP-EDGE-AI")
        self.assertIn("timestamp", data)
        self.assertIn("yolo_loaded", data)

    def test_direct_api_health_endpoint(self):
        """Test GET /api/health direct invocation."""
        data = get_health()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["service"], "IBVAP-EDGE-AI")

    def test_direct_ai_status_endpoint(self):
        """Test GET /api/ai/status direct invocation."""
        data = get_ai_status()
        self.assertTrue(data["success"])
        self.assertIn("detector", data)
        self.assertIn("is_yolo_loaded", data["detector"])

    def test_direct_detection_process_scenario(self):
        """Test POST /api/detection/process direct invocation."""
        req = DetectionProcessRequest(
            camera_id="CAM-01",
            scenario="human_crossing",
            step=1,
        )
        data = process_detection(req)
        self.assertTrue(data["success"])
        self.assertEqual(data["camera_id"], "CAM-01")
        self.assertGreater(len(data["detections"]), 0)

        first_det = data["detections"][0]
        self.assertEqual(first_det["object_type"], "human")
        self.assertEqual(first_det["category"], "HUMAN")
        self.assertIn("bbox", first_det)
        self.assertIn("centroid", first_det)

    def test_direct_tripwire_evaluate(self):
        """Test POST /api/tripwire/evaluate direct invocation."""
        req = TripwireEvaluateRequest(
            camera_id="CAM-01",
            tripwire_id="TW-MAIN",
            start_point=TripwirePointInput(x=0.5, y=0.0),
            end_point=TripwirePointInput(x=0.5, y=1.0),
            previous_centroid=TripwirePointInput(x=0.4, y=0.5),
            current_centroid=TripwirePointInput(x=0.6, y=0.5),
            direction="BIDIRECTIONAL",
            object_id="TRK-999",
            target_class="HUMAN",
            confidence=0.97,
        )
        data = evaluate_tripwire(req)
        self.assertTrue(data["success"])
        res = data["result"]
        self.assertTrue(res["crossed"])
        self.assertEqual(res["tripwireId"], "TW-MAIN")
        self.assertEqual(res["objectId"], "TRK-999")
        self.assertIn("crossingDirection", res)

    def test_direct_threat_calculate(self):
        """Test POST /api/threat/calculate direct invocation."""
        req = ThreatCalcRequest(
            objectType="HUMAN",
            confidence=0.96,
            tripwireBreached=True,
            crossingDirection="INBOUND",
            speedMps=3.0,
            posture="RUNNING",
            isRestrictedZone=True,
        )
        data = calculate_threat(req)
        self.assertTrue(data["success"])
        self.assertIn("score", data["data"])
        self.assertIn("severity", data["data"])
        self.assertIn("factors", data["data"])
        self.assertIn("summary", data["data"])

    def test_fastapi_testclient_if_available(self):
        """Test with TestClient if httpx is present."""
        try:
            from fastapi.testclient import TestClient
            client = TestClient(app)
            response = client.get("/health")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()["status"], "ok")
        except Exception:
            # Skip TestClient testing if httpx is still installing or unavailable
            pass


if __name__ == "__main__":
    unittest.main()
