"""
IBVAP-EDGE-AI: Threat Scoring & Explainable AI (XAI) Engine
Lead: Pratyush (AI/CV Backend Lead) & Bunty (Backend/API Integration Lead)

Mathematical Formulation:
S_total = min(100, S_object + S_tripwire + S_direction + S_kinematic + S_context)

Features:
- Deterministic 0-100 situational risk scoring
- Severity classification: CRITICAL (>=85), HIGH (>=65), MEDIUM (>=35), LOW (<35)
- Relative factor weight breakdowns
- Human-readable causal XAI explainability rationale
"""

import uuid
from typing import Dict, Any, List, Optional, Tuple, Union
from pydantic import BaseModel, Field
from ..app.schemas import (
    SeverityLevel,
    ThreatAlert,
    ThreatEvent,
    XaiExplanation,
    XaiFactor,
    get_current_utc_timestamp,
)


class ThreatAnalysisInput(BaseModel):
    objectType: str = "HUMAN"  # 'HUMAN' | 'VEHICLE' | 'ANIMAL' | 'DRONE' | 'UNKNOWN'
    confidence: float = 0.95  # 0.0 - 1.0
    tripwireBreached: bool = False
    crossingDirection: Optional[str] = None  # 'INBOUND' | 'OUTBOUND' | 'BIDIRECTIONAL'
    speedMps: Optional[float] = None
    speedKmH: Optional[float] = None
    isRestrictedZone: bool = False
    isNight: bool = False
    weaponDetected: bool = False
    isBlacklisted: bool = False
    posture: Optional[str] = None  # 'STANDING' | 'CROUCHING' | 'CRAWLING' | 'RUNNING'
    zoneName: str = "Sector-04 Perimeter"
    tripwireName: str = "Outer Perimeter Line Alpha"
    cameraId: str = "CAM-01"
    objectId: Optional[str] = "TRK-101"


def calculate_threat_score(inp: ThreatAnalysisInput) -> Dict[str, Any]:
    """
    Deterministic Threat Score Calculator.
    Returns score (0-100), severity level, factors breakdown, and XAI causal summary.
    """
    conf = max(0.0, min(1.0, float(inp.confidence)))
    obj_type = inp.objectType.upper()

    # 1. Object Type & Confidence (Max: 30 pts)
    object_weights = {
        "DRONE": 30,
        "HUMAN": 28,
        "VEHICLE": 24,
        "UNKNOWN": 15,
        "ANIMAL": 5,
    }
    max_obj_weight = object_weights.get(obj_type, 15)
    object_score = round(max_obj_weight * conf)

    # 2. Spatial Boundary / Tripwire Breach (Max: 30 pts)
    tripwire_score = 0
    if inp.tripwireBreached:
        tripwire_score = 30
    elif inp.isRestrictedZone:
        tripwire_score = 15

    # 3. Directional Vector (Max: 15 pts)
    direction_score = 0
    if inp.crossingDirection == "INBOUND":
        direction_score = 15
    elif inp.crossingDirection == "BIDIRECTIONAL":
        direction_score = 10
    elif inp.crossingDirection == "OUTBOUND":
        direction_score = 5
    elif inp.tripwireBreached:
        direction_score = 10

    # 4. Kinematics & Behavior Profile (Max: 15 pts)
    kinematic_score = 0
    speed = inp.speedMps if inp.speedMps is not None else ((inp.speedKmH / 3.6) if inp.speedKmH else 0.0)

    if inp.posture in ("CRAWLING", "CROUCHING"):
        kinematic_score = 14
    elif inp.posture == "RUNNING" or speed >= 2.2:
        kinematic_score = 12
    elif obj_type == "VEHICLE" and (speed > 10.0 or (inp.speedKmH and inp.speedKmH > 40.0)):
        kinematic_score = 15
    elif speed > 1.2:
        kinematic_score = 6

    # 5. Contextual Risk Multipliers (Max: 15 pts)
    context_score = 0
    if inp.weaponDetected:
        context_score += 15
    if inp.isBlacklisted:
        context_score += 12
    if inp.isRestrictedZone:
        context_score += 8
    if inp.isNight:
        context_score += 4
    context_score = min(15, context_score)

    # Total Raw Calculation
    raw_score = object_score + tripwire_score + direction_score + kinematic_score + context_score

    if obj_type == "ANIMAL" and not inp.weaponDetected:
        raw_score = min(30, raw_score)

    final_score = float(max(0, min(100, raw_score)))

    # Severity Level
    if final_score >= 85:
        severity: SeverityLevel = "CRITICAL"
    elif final_score >= 65:
        severity: SeverityLevel = "HIGH"
    elif final_score >= 35:
        severity: SeverityLevel = "MEDIUM"
    else:
        severity: SeverityLevel = "LOW"

    # Explainability factors
    total_pts = max(1.0, final_score)
    factors = [
        XaiFactor(
            name="Boundary Intersection",
            weight=round(tripwire_score / total_pts, 2),
            description=f"Virtual tripwire breach detected ({tripwire_score} pts)"
            if inp.tripwireBreached
            else "Boundary intact",
        ),
        XaiFactor(
            name="Object Classification",
            weight=round(object_score / total_pts, 2),
            description=f"{obj_type} identified with {conf:.0%} confidence ({object_score} pts)",
        ),
        XaiFactor(
            name="Kinematic Behavior",
            weight=round(kinematic_score / total_pts, 2),
            description=f"Velocity {speed:.1f} m/s, posture: {inp.posture or 'MOVING'} ({kinematic_score} pts)"
            if speed > 0
            else "Stationary / standard profile",
        ),
        XaiFactor(
            name="Direction & Context",
            weight=round((direction_score + context_score) / total_pts, 2),
            description=f"{inp.crossingDirection or 'INBOUND'} trajectory in {inp.zoneName} ({direction_score + context_score} pts)",
        ),
    ]
    filtered_factors = [f for f in factors if f.weight > 0]

    # Generate XAI explanation rationale
    reasons: List[str] = []
    if obj_type == "HUMAN":
        posture_str = f" ({inp.posture.lower()} profile)" if inp.posture else ""
        reasons.append(f"Human subject detected with {conf:.0%} AI confidence{posture_str}.")
    elif obj_type == "VEHICLE":
        speed_str = f" traveling at {inp.speedKmH} km/h" if inp.speedKmH else ""
        reasons.append(f"Motor vehicle identified with {conf:.0%} confidence{speed_str}.")
    elif obj_type == "DRONE":
        reasons.append(f"Unmanned Aerial Vehicle (UAV) detected with {conf:.0%} confidence.")
    elif obj_type == "ANIMAL":
        reasons.append(f"Wildlife signature detected with {conf:.0%} confidence (benign pattern).")
    else:
        reasons.append(f"Unidentified object tracked with {conf:.0%} classification confidence.")

    if inp.tripwireBreached:
        dir_str = f" ({inp.crossingDirection} trajectory)" if inp.crossingDirection else ""
        reasons.append(f"Restricted spatial tripwire '{inp.tripwireName}' breached{dir_str}.")
    elif inp.isRestrictedZone:
        reasons.append("Target operating within buffer proximity of Restricted Zone boundary.")

    if inp.posture in ("CRAWLING", "CROUCHING"):
        reasons.append("Stealth locomotion detected: low radar cross-section crawling profile.")
    elif inp.posture == "RUNNING" or speed >= 2.2:
        reasons.append(f"Kinematic velocity ({speed:.1f} m/s) matches evasive running behavior.")
    elif speed > 0:
        reasons.append(f"Target velocity verified at {speed:.1f} m/s.")

    if inp.weaponDetected:
        reasons.append("CRITICAL: Object payload or weapon signature identified in target bounding box.")
    if inp.isBlacklisted:
        reasons.append("ALERT: Target or vehicle matches active Security Watchlist.")
    if inp.isNight:
        reasons.append("Night-vision thermal flux anomaly indicates deliberate darkness exploitation.")

    summary = (
        f"{severity} threat ({final_score:.0f}/100) triggered by {obj_type} [{conf:.0%} conf] "
        f"{'breaching perimeter line' if inp.tripwireBreached else 'near boundary'}."
    )

    return {
        "score": final_score,
        "severity": severity,
        "factors": [f.model_dump() for f in filtered_factors],
        "breakdown": {
            "objectScore": object_score,
            "tripwireScore": tripwire_score,
            "directionScore": direction_score,
            "kinematicScore": kinematic_score,
            "contextScore": context_score,
        },
        "summary": summary,
        "reasons": reasons,
    }


def to_threat_models(
    analysis_input: ThreatAnalysisInput,
    alert_id: Optional[str] = None
) -> Tuple[ThreatEvent, ThreatAlert]:
    """Generate both canonical ThreatEvent and frontend ThreatAlert from analysis input."""
    res = calculate_threat_score(analysis_input)
    ts = get_current_utc_timestamp()
    evt_id = alert_id or f"ALT-{uuid.uuid4().hex[:8].upper()}"

    xai_exp = XaiExplanation(
        classConfidence=analysis_input.confidence,
        speedMps=analysis_input.speedMps,
        kinematicProfile="EVASIVE_RUNNING" if analysis_input.posture == "RUNNING" else "STANDARD_MOTION",
        trajectoryDescription=f"{analysis_input.crossingDirection or 'INBOUND'} approach towards {analysis_input.zoneName}",
        reasons=res["reasons"],
        factors=[XaiFactor(**f) for f in res["factors"]]
    )

    threat_event = ThreatEvent(
        event_id=f"EVT-{evt_id}",
        camera_id=analysis_input.cameraId,
        object_type=analysis_input.objectType.lower(),
        threat_score=res["score"],
        severity=res["severity"],
        xai_reasons=res["reasons"],
        timestamp=ts
    )

    threat_alert = ThreatAlert(
        id=evt_id,
        timestamp=ts,
        incidentCode="INC-26187",
        title="Perimeter Intrusion Alert" if res["score"] >= 65 else "Low Threat Boundary Activity",
        cameraId=analysis_input.cameraId,
        cameraName=f"Sector-04 Perimeter ({analysis_input.cameraId})",
        severity=res["severity"],
        riskScore=res["score"],
        threat_score=res["score"],
        aiExplanation=xai_exp,
        status="OPEN"
    )

    return threat_event, threat_alert
