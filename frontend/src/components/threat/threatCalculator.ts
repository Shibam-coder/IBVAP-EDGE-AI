import { SeverityLevel, XaiFactor } from '@/types';

export interface ThreatAnalysisInput {
  objectType: 'HUMAN' | 'VEHICLE' | 'ANIMAL' | 'DRONE' | 'UNKNOWN';
  confidence: number; // 0.0 - 1.0
  tripwireBreached: boolean;
  crossingDirection?: 'INBOUND' | 'OUTBOUND' | 'BIDIRECTIONAL';
  speedMps?: number; // Speed in meters per second
  speedKmH?: number;
  isRestrictedZone?: boolean;
  isNight?: boolean;
  weaponDetected?: boolean;
  isBlacklisted?: boolean;
  posture?: 'STANDING' | 'CROUCHING' | 'CRAWLING' | 'RUNNING';
  zoneName?: string;
  tripwireName?: string;
}

export interface ThreatScoreBreakdown {
  objectScore: number;
  tripwireScore: number;
  directionScore: number;
  kinematicScore: number;
  contextScore: number;
}

export interface ThreatScoreResult {
  score: number; // 0 - 100
  severity: SeverityLevel;
  factors: XaiFactor[];
  breakdown: ThreatScoreBreakdown;
  summary: string;
}

/**
 * Deterministic Threat Score Calculator for IBVAP-Edge AI
 * 
 * Mathematical Formulation:
 * S_total = min(100, S_object + S_tripwire + S_direction + S_kinematic + S_context)
 * 
 * Where:
 * 1. S_object = BaseClassWeight * Confidence (Max: 30 pts)
 * 2. S_tripwire = BreachFlag ? 30 pts : 0 pts
 * 3. S_direction = Inbound: 15 pts | Bidirectional: 10 pts | Outbound: 5 pts
 * 4. S_kinematic = Speed/Posture anomaly (Max: 15 pts)
 * 5. S_context = RestrictedZone / Night / Weapon / Blacklist (Max: 15 pts)
 */
export function calculateThreatScore(input: ThreatAnalysisInput): ThreatScoreResult {
  const conf = Math.max(0, Math.min(1, input.confidence));

  // --- 1. Object Type & Confidence Contribution (Max: 30 pts) ---
  const objectBaseWeights: Record<ThreatAnalysisInput['objectType'], number> = {
    DRONE: 30,
    HUMAN: 28,
    VEHICLE: 24,
    UNKNOWN: 15,
    ANIMAL: 5,
  };
  const maxObjWeight = objectBaseWeights[input.objectType] || 15;
  const objectScore = Math.round(maxObjWeight * conf);

  // --- 2. Spatial Boundary / Tripwire Breach (Max: 30 pts) ---
  let tripwireScore = 0;
  if (input.tripwireBreached) {
    tripwireScore = 30;
  } else if (input.isRestrictedZone) {
    tripwireScore = 15; // Approaching restricted boundary
  }

  // --- 3. Directional Vector (Max: 15 pts) ---
  let directionScore = 0;
  if (input.crossingDirection === 'INBOUND') {
    directionScore = 15;
  } else if (input.crossingDirection === 'BIDIRECTIONAL') {
    directionScore = 10;
  } else if (input.crossingDirection === 'OUTBOUND') {
    directionScore = 5;
  } else if (input.tripwireBreached) {
    directionScore = 10; // Default when breached without explicit direction
  }

  // --- 4. Kinematics & Behavior Profile (Max: 15 pts) ---
  let kinematicScore = 0;
  const speed = input.speedMps ?? (input.speedKmH ? input.speedKmH / 3.6 : 0);

  if (input.posture === 'CRAWLING' || input.posture === 'CROUCHING') {
    kinematicScore = 14; // Stealth intrusion tactic
  } else if (input.posture === 'RUNNING' || speed >= 2.2) {
    kinematicScore = 12; // Evasive running speed
  } else if (input.objectType === 'VEHICLE' && (speed > 10 || (input.speedKmH && input.speedKmH > 40))) {
    kinematicScore = 15; // High speed vehicle approach
  } else if (speed > 1.2) {
    kinematicScore = 6;  // Standard walking pace
  }

  // --- 5. Contextual Risk Multipliers (Max: 15 pts) ---
  let contextScore = 0;
  if (input.weaponDetected) contextScore += 15;
  if (input.isBlacklisted) contextScore += 12;
  if (input.isRestrictedZone) contextScore += 8;
  if (input.isNight) contextScore += 4;
  contextScore = Math.min(15, contextScore);

  // --- Total Raw Calculation ---
  let rawScore = objectScore + tripwireScore + directionScore + kinematicScore + contextScore;

  // Animals cannot exceed 35 unless weapon/payload attached
  if (input.objectType === 'ANIMAL' && !input.weaponDetected) {
    rawScore = Math.min(30, rawScore);
  }

  const finalScore = Math.max(0, Math.min(100, rawScore));

  // --- Severity Classification ---
  let severity: SeverityLevel = 'LOW';
  if (finalScore >= 85) {
    severity = 'CRITICAL';
  } else if (finalScore >= 65) {
    severity = 'HIGH';
  } else if (finalScore >= 35) {
    severity = 'MEDIUM';
  } else {
    severity = 'LOW';
  }

  // --- Contributing Factors Breakdown for Explainability ---
  const totalPoints = Math.max(1, finalScore);
  const factors: XaiFactor[] = [
    {
      name: 'Boundary Intersection',
      weight: Number((tripwireScore / totalPoints).toFixed(2)),
      description: input.tripwireBreached
        ? `Virtual tripwire breach detected (${tripwireScore} pts)`
        : 'Boundary intact',
    },
    {
      name: 'Object Classification',
      weight: Number((objectScore / totalPoints).toFixed(2)),
      description: `${input.objectType} identified with ${(conf * 100).toFixed(0)}% confidence (${objectScore} pts)`,
    },
    {
      name: 'Kinematic Behavior',
      weight: Number((kinematicScore / totalPoints).toFixed(2)),
      description: speed > 0
        ? `Velocity ${speed.toFixed(1)} m/s, posture: ${input.posture || 'MOVING'} (${kinematicScore} pts)`
        : 'Stationary / standard profile',
    },
    {
      name: 'Direction & Context',
      weight: Number(((directionScore + contextScore) / totalPoints).toFixed(2)),
      description: `${input.crossingDirection || 'INBOUND'} trajectory in ${input.zoneName || 'Sector 7G'} (${directionScore + contextScore} pts)`,
    },
  ].filter((f) => f.weight > 0);

  const summary = `${severity} threat (${finalScore}/100) triggered by ${input.objectType} [${(conf * 100).toFixed(0)}% conf] ${
    input.tripwireBreached ? 'breaching perimeter line' : 'near boundary'
  }.`;

  return {
    score: finalScore,
    severity,
    factors,
    breakdown: {
      objectScore,
      tripwireScore,
      directionScore,
      kinematicScore,
      contextScore,
    },
    summary,
  };
}
