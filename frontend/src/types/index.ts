/**
 * IBVAP-Edge AI - Shared TypeScript Type Definitions
 * Problem Statement ID: 26187
 * 
 * Comprehensive shared types for:
 * - CCTV / Video Streaming
 * - Human & Vehicle Detection
 * - Tripwire Events & Spatial Zones
 * - Threat Scoring & XAI Explanations
 * - ANPR (Automated Number Plate Recognition) & FRS (Facial Recognition System)
 * - GIS Camera Telemetry & Geolocation
 * - Weather Processing & Environmental Sensors
 * - WebSocket Telemetry & Event Contracts
 */

// ==========================================
// 1. CCTV & VIDEO STREAMING
// ==========================================
export type CameraStatus = 'ONLINE' | 'OFFLINE' | 'READY' | 'RECORDING' | 'MAINTENANCE';
export type CameraType = 'FIXED_OPTICAL' | 'PTZ' | 'THERMAL' | 'NIGHT_VISION' | 'UAV_FEED';

export interface CameraFeed {
  id: string;
  name: string;
  location: string;
  sectorId: string;
  type: CameraType;
  streamUrl: string;
  resolution: string;
  fps: number;
  status: CameraStatus;
  codec: string;
  bitrateMbps: number;
  ptzCapable: boolean;
  thumbnailUrl?: string;
}

// ==========================================
// 2. DETECTION & CLASSIFICATION (HUMAN / VEHICLE / ANPR / FRS)
// ==========================================
export type DetectionCategory = 'HUMAN' | 'VEHICLE' | 'ANIMAL' | 'DRONE' | 'UNKNOWN';

export interface BoundingBox {
  x: number;      // Normalized 0..1 or pixel value
  y: number;
  width: number;
  height: number;
}

export interface DetectionBase {
  id: string;
  cameraId: string;
  timestamp: string;
  confidence: number;
  category: DetectionCategory;
  boundingBox: BoundingBox;
}

export interface HumanDetection extends DetectionBase {
  category: 'HUMAN';
  posture?: 'STANDING' | 'CROUCHING' | 'CRAWLING' | 'RUNNING';
  weaponDetected?: boolean;
  thermalSignature?: 'NORMAL' | 'ELEVATED' | 'ANOMALOUS';
  frsMatch?: FrsRecord;
}

export interface VehicleDetection extends DetectionBase {
  category: 'VEHICLE';
  vehicleType?: 'TRUCK' | 'SUV' | 'SEDAN' | 'MOTORCYCLE' | 'MILITARY_VEHICLE' | 'UNKNOWN';
  speedKmH?: number;
  anprMatch?: AnprRecord;
}

export interface AnprRecord {
  plateNumber: string;
  confidence: number;
  countryOrState?: string;
  isBlacklisted: boolean;
  watchlistReason?: string;
}

export interface FrsRecord {
  subjectId?: string;
  fullName?: string;
  matchConfidence: number;
  isWatchlisted: boolean;
  threatCategory?: string;
}

// ==========================================
// 3. TRIPWIRE & SPATIAL VIRTUAL FENCING
// ==========================================
export interface Point2D {
  x: number;
  y: number;
}

export type TripwireDirection = 'BIDIRECTIONAL' | 'INBOUND' | 'OUTBOUND';

export interface TripwireZone {
  id: string;
  cameraId: string;
  name: string;
  points: Point2D[];
  direction: TripwireDirection;
  isActive: boolean;
  severity: SeverityLevel;
  color: string;
}

export interface TripwireEvent {
  id: string;
  tripwireId: string;
  cameraId: string;
  timestamp: string;
  targetClass: DetectionCategory;
  crossingDirection: 'INBOUND' | 'OUTBOUND';
  confidence: number;
  snapshotUrl?: string;
}

// ==========================================
// 4. THREAT SCORING & XAI EXPLANATIONS
// ==========================================
export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface XaiFactor {
  name: string;
  weight: number;         // 0..1
  description: string;
}

export interface XaiExplanation {
  classConfidence: number;
  speedMps?: number;
  kinematicProfile?: string;
  trajectoryDescription?: string;
  reasons: string[];
  factors?: XaiFactor[];
}

export interface ThreatAlert {
  id: string;
  timestamp: string;
  incidentCode: string;
  title: string;
  cameraId: string;
  cameraName: string;
  severity: SeverityLevel;
  riskScore: number;     // 0 - 100
  aiExplanation: XaiExplanation;
  status: 'OPEN' | 'INVESTIGATING' | 'DISPATCHED' | 'CLEARED' | 'FALSE_POSITIVE';
  anprData?: AnprRecord;
  frsData?: FrsRecord;
}

export interface ThreatScoreSummary {
  overallRiskLevel: SeverityLevel;
  activeThreatCount: number;
  criticalThreatCount: number;
  avgResponseTimeSec: number;
}

// ==========================================
// 5. GIS TELEMETRY & CAMERA GEOLOCATION
// ==========================================
export interface GisCoordinates {
  latitude: number;
  longitude: number;
  elevationMeters?: number;
}

export interface CameraNodeMarker {
  id: string;
  cameraId: string;
  name: string;
  coordinates: GisCoordinates;
  status: CameraStatus;
  coverageRadiusMeters: number;
  azimuthDegrees: number;
  hasActiveAlert: boolean;
  alertId?: string;
}

export interface GisSectorZone {
  id: string;
  name: string;
  polygon: GisCoordinates[];
  riskStatus: SeverityLevel;
}

export interface TelemetryData {
  timestamp: string;
  sectorId: string;
  operatorId: string;
  centerCoordinates: GisCoordinates;
  activeNodesCount: number;
  gpuUsagePercent: number;
  inferenceFps: number;
  latencyMs: number;
  networkThroughputMbps: number;
  systemStatus: 'NOMINAL' | 'DEGRADED' | 'CRITICAL';
}

// ==========================================
// 6. WEATHER & ENVIRONMENTAL PROCESSING
// ==========================================
export type WeatherConditionType = 'CLEAR' | 'FOG' | 'HEAVY_RAIN' | 'SNOW' | 'SANDSTORM' | 'OVERCAST';

export interface WeatherTelemetry {
  timestamp: string;
  sectorId: string;
  condition: WeatherConditionType;
  temperatureCelsius: number;
  humidityPercent: number;
  visibilityMeters: number;
  windSpeedKmh: number;
  windDirectionDegrees: number;
  thermalDistortionIndex: number;  // 0..1 (affects optical / thermal accuracy)
  sensorConfidenceMultiplier: number; // 0..1 (applied to visual detections)
}

// ==========================================
// 7. WEBSOCKET & API CONTRACTS
// ==========================================
export type WebSocketEventType =
  | 'TELEMETRY_UPDATE'
  | 'THREAT_ALERT'
  | 'DETECTION_FRAME'
  | 'TRIPWIRE_EVENT'
  | 'CAMERA_STATUS'
  | 'WEATHER_UPDATE'
  | 'HEARTBEAT';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface WebSocketMessage<T = unknown> {
  event: WebSocketEventType;
  payload: T;
  timestamp: string;
}
