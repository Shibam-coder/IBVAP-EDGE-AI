import { XaiExplanation } from '@/types';
import { ThreatAnalysisInput, ThreatScoreResult } from './threatCalculator';

/**
 * Dynamic Explainable AI (XAI) Rationale Engine for IBVAP-Edge AI
 * Converts raw detection, tripwire, and kinematic telemetry into structured,
 * operator-ready causal explanations.
 */
export function generateXaiExplanation(
  input: ThreatAnalysisInput,
  scoreResult: ThreatScoreResult
): XaiExplanation {
  const reasons: string[] = [];
  const confPercent = (Math.max(0, Math.min(1, input.confidence)) * 100).toFixed(0);
  const speedMps = input.speedMps ?? (input.speedKmH ? Number((input.speedKmH / 3.6).toFixed(1)) : 0);

  // 1. Core Object Classification Rationale
  if (input.objectType === 'HUMAN') {
    const postureStr = input.posture ? ` (${input.posture.toLowerCase()} profile)` : '';
    reasons.push(`Human subject detected with ${confPercent}% AI confidence${postureStr}.`);
  } else if (input.objectType === 'VEHICLE') {
    const speedStr = input.speedKmH ? ` traveling at ${input.speedKmH} km/h` : '';
    reasons.push(`Motor vehicle identified with ${confPercent}% confidence${speedStr}.`);
  } else if (input.objectType === 'DRONE') {
    reasons.push(`Unmanned Aerial Vehicle (UAV) detected with ${confPercent}% confidence.`);
  } else if (input.objectType === 'ANIMAL') {
    reasons.push(`Wildlife signature detected with ${confPercent}% confidence (benign pattern).`);
  } else {
    reasons.push(`Unidentified object tracked with ${confPercent}% classification confidence.`);
  }

  // 2. Spatial Boundary / Tripwire Breach Rationale
  if (input.tripwireBreached) {
    const twName = input.tripwireName || 'Outer Perimeter Line Alpha';
    const dirStr = input.crossingDirection ? ` (${input.crossingDirection} trajectory)` : '';
    reasons.push(`Restricted spatial tripwire '${twName}' breached${dirStr}.`);
  } else if (input.isRestrictedZone) {
    reasons.push(`Target operating within buffer proximity of Restricted Zone boundary.`);
  }

  // 3. Kinematic & Behavior Assessment
  if (input.posture === 'CRAWLING' || input.posture === 'CROUCHING') {
    reasons.push(`Stealth locomotion detected: low radar cross-section crawling profile.`);
  } else if (input.posture === 'RUNNING' || speedMps >= 2.2) {
    reasons.push(`Kinematic velocity (${speedMps.toFixed(1)} m/s) matches evasive running behavior.`);
  } else if (speedMps > 0) {
    reasons.push(`Target velocity verified at ${speedMps.toFixed(1)} m/s.`);
  }

  // 4. Critical Flags & Context
  if (input.weaponDetected) {
    reasons.push(`CRITICAL: Object payload or weapon signature identified in target bounding box.`);
  }
  if (input.isBlacklisted) {
    reasons.push(`ALERT: License plate or facial feature matches active National Watchlist.`);
  }
  if (input.isNight) {
    reasons.push(`Night-vision thermal flux anomaly indicates deliberate darkness exploitation.`);
  }

  // Kinematic Profile Summary
  const kinematicProfile =
    input.posture === 'CRAWLING'
      ? 'Stealth Crawl / Ground Evasion'
      : input.posture === 'RUNNING' || speedMps >= 2.2
      ? 'High-Speed Evasive Sprint'
      : speedMps > 0
      ? 'Controlled Linear Motion'
      : 'Stationary Position';

  // Trajectory Summary
  const trajectoryDescription = input.tripwireBreached
    ? `Direct ${input.crossingDirection || 'INBOUND'} crossing of ${input.tripwireName || 'Tripwire TW-01'} into ${input.zoneName || 'Sector 7G'}.`
    : `Operating in buffer area outside ${input.zoneName || 'Sector 7G'} perimeter.`;

  return {
    classConfidence: input.confidence,
    speedMps: speedMps > 0 ? speedMps : undefined,
    kinematicProfile,
    trajectoryDescription,
    reasons,
    factors: scoreResult.factors,
  };
}
