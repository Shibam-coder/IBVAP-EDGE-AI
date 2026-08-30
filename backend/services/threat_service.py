"""
IBVAP-EDGE-AI: Threat Service Module
Exposes calculate_threat_score, ThreatAnalysisInput, and model conversions for the service layer.
"""

from ..ai.threat_service import (
    ThreatAnalysisInput,
    calculate_threat_score,
    to_threat_models,
)

__all__ = [
    "ThreatAnalysisInput",
    "calculate_threat_score",
    "to_threat_models",
]
