/**
 * IBVAP-Edge AI - Live Detection & Tripwire Event Adapter Layer
 * Converts live backend payloads (FastAPI, YOLO, WebSocket frames) into standardized
 * DetectionItem and TripwireBreachEvent models for frontend rendering.
 */

import {
  BoundingBox,
  DetectionCategory,
  SeverityLevel,
  BackendRawDetection,
  TripwireBreachPayload,
  Point2D,
} from '@/types';
import { DetectionItem } from '@/components/video/DetectionOverlay';
import { TripwireBreachEvent } from '@/components/tripwire/SpatialTripwireOverlay';

/**
 * Normalizes bounding box representations from various backend formats into standard BoundingBox.
 * Supports:
 * - Object: { x, y, width, height }
 * - Array 4-tuple [x, y, width, height]
 * - Array 4-tuple [xmin, ymin, xmax, ymax]
 */
export function normalizeBoundingBox(
  rawBox: unknown
): BoundingBox {
  if (!rawBox) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  // If already an object { x, y, width, height }
  if (typeof rawBox === 'object' && !Array.isArray(rawBox)) {
    const obj = rawBox as Record<string, unknown>;
    const x = typeof obj.x === 'number' ? obj.x : typeof obj.xmin === 'number' ? obj.xmin : 0;
    const y = typeof obj.y === 'number' ? obj.y : typeof obj.ymin === 'number' ? obj.ymin : 0;
    let width = typeof obj.width === 'number' ? obj.width : typeof obj.w === 'number' ? obj.w : 0;
    let height = typeof obj.height === 'number' ? obj.height : typeof obj.h === 'number' ? obj.h : 0;

    // In case xmax/ymax were provided instead of width/height
    if (!width && typeof obj.xmax === 'number') {
      width = Math.max(0, (obj.xmax as number) - x);
    }
    if (!height && typeof obj.ymax === 'number') {
      height = Math.max(0, (obj.ymax as number) - y);
    }

    return { x, y, width, height };
  }

  // If 4-item array
  if (Array.isArray(rawBox) && rawBox.length >= 4) {
    const [a, b, c, d] = rawBox.map((v) => (typeof v === 'number' ? v : Number(v) || 0));

    // Heuristic: if c > a and d > b and c <= 1 and d <= 1 (or c > a with high px), could be [xmin, ymin, xmax, ymax]
    if (c > a && d > b && c <= 1 && a >= 0 && c - a < 1 && d - b < 1 && c > 0.5 && a > 0.3) {
      // Likely [xmin, ymin, xmax, ymax]
      return { x: a, y: b, width: Number((c - a).toFixed(4)), height: Number((d - b).toFixed(4)) };
    }

    // Default assume [x, y, width, height]
    return { x: a, y: b, width: c, height: d };
  }

  return { x: 0, y: 0, width: 0, height: 0 };
}

/**
 * Normalizes category strings into standardized DetectionCategory.
 */
export function normalizeCategory(raw: unknown): DetectionCategory {
  if (typeof raw !== 'string') return 'UNKNOWN';
  const upper = raw.toUpperCase().trim();

  if (['PERSON', 'HUMAN', 'PEDESTRIAN', 'MAN', 'WOMAN', 'SOLDIER', 'INTRUDER'].includes(upper)) {
    return 'HUMAN';
  }
  if (['VEHICLE', 'CAR', 'TRUCK', 'SUV', 'BUS', 'MOTORCYCLE', 'VAN', 'PICKUP'].includes(upper)) {
    return 'VEHICLE';
  }
  if (['ANIMAL', 'DOG', 'CATTLE', 'SHEEP', 'WILDLIFE', 'HORSE'].includes(upper)) {
    return 'ANIMAL';
  }
  if (['DRONE', 'UAV', 'QUADCOPTER', 'AIRCRAFT'].includes(upper)) {
    return 'DRONE';
  }

  return 'UNKNOWN';
}

/**
 * Adapts a single raw backend detection into a frontend DetectionItem.
 */
export function adaptBackendDetectionToItem(
  raw: BackendRawDetection | Record<string, unknown>,
  defaultCameraId: string = 'CAM-01'
): DetectionItem {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `det-${Date.now()}`,
      confidence: 0,
      bbox: { x: 0, y: 0, width: 0, height: 0 },
    };
  }

  const r = raw as Record<string, unknown>;
  const cameraId = (r.camera_id || r.cameraId || defaultCameraId) as string;
  const rawClass = (r.class_name || r.object_type || r.category || 'UNKNOWN') as string;
  const category = normalizeCategory(rawClass);

  const rawConfidence = typeof r.confidence === 'number' ? r.confidence : typeof r.score === 'number' ? r.score : 0.85;
  const confidence = Math.max(0, Math.min(1, rawConfidence));

  const rawBbox = r.bbox || r.boundingBox || r.box;
  const bbox = normalizeBoundingBox(rawBbox);

  const trackId = r.track_id !== undefined ? String(r.track_id) : r.trackId !== undefined ? String(r.trackId) : undefined;
  const speedKmH = typeof r.speed_kmh === 'number' ? r.speed_kmh : typeof r.speedKmH === 'number' ? r.speedKmH : undefined;
  const speedMps = typeof r.speed_mps === 'number' ? r.speed_mps : typeof r.speedMps === 'number' ? r.speedMps : undefined;
  const posture = (r.posture as string | undefined) || undefined;
  const isHostile = Boolean(r.is_hostile ?? r.isHostile ?? r.weapon_detected ?? r.weaponDetected);
  const plateNumber = (r.license_plate || r.plate_number || r.plateNumber) as string | undefined;
  const isBlacklisted = Boolean(r.is_blacklisted ?? r.isBlacklisted);
  const ocrConfidence = typeof r.ocr_confidence === 'number' ? r.ocr_confidence : typeof r.ocrConfidence === 'number' ? r.ocrConfidence : undefined;

  let severity: SeverityLevel = 'INFO';
  if (isHostile) {
    severity = 'CRITICAL';
  } else if (isBlacklisted) {
    severity = 'HIGH';
  } else if (category === 'HUMAN' || category === 'VEHICLE') {
    severity = 'MEDIUM';
  }

  const label =
    (r.label as string | undefined) ||
    (category === 'HUMAN'
      ? `HUMAN #${trackId || (r.id ? String(r.id).slice(-3).toUpperCase() : '01')}`
      : category === 'VEHICLE'
      ? `VEHICLE [${plateNumber ? 'ANPR LOCK' : 'DETECTED'}]`
      : rawClass.toUpperCase());

  return {
    id: (r.id as string) || `det-${cameraId}-${trackId || Date.now().toString().slice(-4)}`,
    camera_id: cameraId,
    cameraId: cameraId,
    timestamp: (r.timestamp as string) || new Date().toISOString(),
    object_type: rawClass.toLowerCase(),
    category,
    label,
    confidence,
    bbox,
    boundingBox: bbox,
    severity,
    trackId,
    track_id: trackId,
    speedKmH,
    speed_kmh: speedKmH,
    speedMps,
    speed_mps: speedMps,
    posture,
    isHostile,
    is_hostile: isHostile,
    plateNumber,
    plate_number: plateNumber,
    isBlacklisted,
    is_blacklisted: isBlacklisted,
    ocrConfidence,
    ocr_confidence: ocrConfidence,
  };
}

/**
 * Adapts a list of raw backend detections into an array of DetectionItems.
 */
export function adaptBackendDetectionBatch(
  rawList: unknown[],
  defaultCameraId: string = 'CAM-01'
): DetectionItem[] {
  if (!Array.isArray(rawList)) return [];
  return rawList.map((item) =>
    adaptBackendDetectionToItem(item as BackendRawDetection, defaultCameraId)
  );
}

/**
 * Adapts raw breach payloads into standard TripwireBreachEvent.
 */
export function adaptTripwireBreachEvent(raw: unknown): TripwireBreachEvent {
  if (!raw || typeof raw !== 'object') {
    return {
      tripwire_id: 'TW-01',
      camera_id: 'CAM-01',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      object_type: 'person',
      confidence: 0.95,
      crossing_direction: 'INBOUND',
      tripwire_breached: true,
    };
  }

  const p = raw as TripwireBreachPayload & Record<string, unknown>;
  const rawCrossing = p.crossing_direction || p.crossingDirection || 'INBOUND';
  const crossing_direction = rawCrossing === 'OUTBOUND' ? 'OUTBOUND' : 'INBOUND';

  return {
    tripwire_id: p.tripwire_id || p.tripwireId || 'TW-01',
    tripwire_name: p.tripwire_name || (p.name as string) || 'Perimeter Virtual Barrier',
    camera_id: p.camera_id || p.cameraId || 'CAM-01',
    timestamp: p.timestamp || new Date().toLocaleTimeString('en-US', { hour12: false }),
    object_type: p.object_type || (p.targetClass ? String(p.targetClass).toLowerCase() : 'person'),
    confidence: typeof p.confidence === 'number' ? p.confidence : 0.96,
    crossing_direction,
    tripwire_breached: p.tripwire_breached !== undefined ? Boolean(p.tripwire_breached) : true,
    coordinates: (p.coordinates as Point2D[]) || (p.points as Point2D[]) || undefined,
    snapshot_url: p.snapshot_url || (p.snapshotUrl as string) || undefined,
  };
}
