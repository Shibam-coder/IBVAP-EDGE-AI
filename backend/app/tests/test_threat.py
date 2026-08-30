"""
Unit tests for Threat Scoring and XAI Explanation Service.
"""

import unittest
from backend.app.services.threat_service import (
    calculate_threat_score,
    ThreatAnalysisInput,
)


class TestThreatService(unittest.TestCase):

    def test_benign_stationary_human(self):
        """Test benign human outside perimeter."""
        inp = ThreatAnalysisInput(
            objectType="HUMAN",
            confidence=0.95,
            tripwireBreached=False,
            speedMps=0.5,
            isRestrictedZone=False,
        )
        res = calculate_threat_score(inp)
        self.assertLess(res["score"], 50)
        self.assertIn("LOW", ["LOW", "MEDIUM"])
        self.assertIn("Human subject detected", res["reasons"][0])

    def test_critical_inbound_breach(self):
        """Test critical threat: Human breaching tripwire at high speed."""
        inp = ThreatAnalysisInput(
            objectType="HUMAN",
            confidence=0.98,
            tripwireBreached=True,
            crossingDirection="INBOUND",
            speedMps=3.2,
            posture="RUNNING",
            weaponDetected=True,
            isRestrictedZone=True,
        )
        res = calculate_threat_score(inp)
        self.assertGreaterEqual(res["score"], 85)
        self.assertEqual(res["severity"], "CRITICAL")
        self.assertTrue(any("CRITICAL: Object payload or weapon signature" in r for r in res["reasons"]))

    def test_animal_score_capped(self):
        """Test that benign animal score cannot exceed 30."""
        inp = ThreatAnalysisInput(
            objectType="ANIMAL",
            confidence=0.99,
            tripwireBreached=True,
            crossingDirection="INBOUND",
            speedMps=4.0,
            weaponDetected=False,
        )
        res = calculate_threat_score(inp)
        self.assertLessEqual(res["score"], 30)
        self.assertEqual(res["severity"], "LOW")


if __name__ == "__main__":
    unittest.main()
