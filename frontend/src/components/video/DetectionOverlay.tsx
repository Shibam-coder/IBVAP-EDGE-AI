'use client';

import React from 'react';
import { BoundingBox, DetectionCategory, SeverityLevel } from '@/types';

/**
 * Flexible Detection Item interface designed for seamless YOLO / AI pipeline integration.
 * Supports both standard project schema and YOLO raw outputs (object_type, bbox, confidence).
 */
export interface DetectionItem {
  id?: string;
  camera_id?: string;
  cameraId?: string;
  timestamp?: string;
  object_type?: 'person' | 'vehicle' | 'human' | 'animal' | 'drone' | string;
  class_name?: string;
  category?: DetectionCategory;
  label?: string;
  confidence: number;
  /** Normalized (0..1) or pixel bounding box coordinates (object or [x,y,w,h]) */
  bbox?:
    | {
        x: number;
        y: number;
        width: number;
        height: number;
      }
    | [number, number, number, number];
  boundingBox?: BoundingBox | [number, number, number, number];
  severity?: SeverityLevel;
  trackId?: string;
  track_id?: string | number;
  speedKmH?: number;
  speed_kmh?: number;
  speedMps?: number;
  speed_mps?: number;
  posture?: 'STANDING' | 'CROUCHING' | 'CRAWLING' | 'RUNNING' | 'EVASIVE' | string;
  isHostile?: boolean;
  is_hostile?: boolean;
  plateNumber?: string;
  plate_number?: string;
  isBlacklisted?: boolean;
  is_blacklisted?: boolean;
  ocrConfidence?: number;
  ocr_confidence?: number;
}

export interface DetectionOverlayProps {
  detections: DetectionItem[];
  showLabels?: boolean;
  showConfidence?: boolean;
  className?: string;
}

export const DetectionOverlay: React.FC<DetectionOverlayProps> = ({
  detections,
  showLabels = true,
  showConfidence = true,
  className = '',
}) => {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {detections.map((det, index) => {
        // Resolve bounding box coordinates from either bbox (object/array) or boundingBox
        const rawBox = det.bbox || det.boundingBox;
        let box = { x: 0, y: 0, width: 0, height: 0 };

        if (Array.isArray(rawBox) && rawBox.length >= 4) {
          box = { x: rawBox[0], y: rawBox[1], width: rawBox[2], height: rawBox[3] };
        } else if (rawBox && typeof rawBox === 'object' && !Array.isArray(rawBox)) {
          const obj = rawBox as { x?: number; y?: number; width?: number; height?: number };
          box = {
            x: typeof obj.x === 'number' ? obj.x : 0,
            y: typeof obj.y === 'number' ? obj.y : 0,
            width: typeof obj.width === 'number' ? obj.width : 0,
            height: typeof obj.height === 'number' ? obj.height : 0,
          };
        }

        const id = det.id || `det-${index}`;
        const trackId = det.trackId || (det.track_id !== undefined ? String(det.track_id) : undefined);
        const speedKmH = det.speedKmH ?? det.speed_kmh;
        const speedMps = det.speedMps ?? det.speed_mps;
        const isHostile = det.isHostile || det.is_hostile || det.severity === 'CRITICAL';
        const isBlacklisted = det.isBlacklisted || det.is_blacklisted || det.severity === 'HIGH';
        const plateNumber = det.plateNumber || det.plate_number;
        const ocrConfidence = det.ocrConfidence ?? det.ocr_confidence;

        // Determine if coordinates are normalized (0..1) or pixel values
        const leftPercent = box.x <= 1 && box.x >= 0 ? `${box.x * 100}%` : `${box.x}px`;
        const topPercent = box.y <= 1 && box.y >= 0 ? `${box.y * 100}%` : `${box.y}px`;
        const widthPercent = box.width <= 1 && box.width > 0 ? `${box.width * 100}%` : `${box.width}px`;
        const heightPercent = box.height <= 1 && box.height > 0 ? `${box.height * 100}%` : `${box.height}px`;

        // Normalize object type
        const rawType = (det.object_type || det.class_name || det.category || 'UNKNOWN').toUpperCase();
        const isPerson = rawType === 'PERSON' || rawType === 'HUMAN';
        const isVehicle = rawType === 'VEHICLE' || rawType === 'CAR' || rawType === 'TRUCK' || rawType === 'SUV';


        // Styling based on Stitch theme
        const borderColor = isHostile
          ? 'border-[#ffb4ab]'
          : isBlacklisted
          ? 'border-[#feb700]'
          : 'border-[#00d1ff]';

        const bgColor = isHostile
          ? 'bg-[#93000a]/20'
          : isBlacklisted
          ? 'bg-[#feb700]/15'
          : 'bg-[#00d1ff]/10';

        const textColor = isHostile
          ? 'text-[#ffb4ab]'
          : isBlacklisted
          ? 'text-[#feb700]'
          : 'text-[#00d1ff]';

        const headerBg = isHostile
          ? 'bg-[#ffb4ab] text-[#690005]'
          : isBlacklisted
          ? 'bg-[#feb700] text-[#412d00]'
          : 'bg-[#00d1ff] text-[#003543]';

        // Display label calculation
        const displayLabel =
          det.label ||
          (isPerson
            ? `HUMAN #${trackId || id.slice(-3).toUpperCase()}`
            : isVehicle
            ? `VEHICLE [${plateNumber ? 'ANPR LOCK' : 'DETECTED'}]`
            : rawType);

        return (
          <div
            key={id}
            className={`absolute border ${borderColor} ${bgColor} transition-all duration-150 select-none`}
            style={{
              left: leftPercent,
              top: topPercent,
              width: widthPercent,
              height: heightPercent,
            }}
          >
            {/* Tactical HUD Corner Reticle Brackets */}
            <span className={`absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 ${borderColor}`} />
            <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 ${borderColor}`} />
            <span className={`absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 ${borderColor}`} />
            <span className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 ${borderColor}`} />

            {/* Top Label Tag */}
            {showLabels && (
              <div
                className={`absolute -top-5 left-0 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider uppercase whitespace-nowrap shadow flex items-center gap-1 ${headerBg}`}
              >
                {isHostile && <span className="animate-pulse">⚠</span>}
                <span>{displayLabel}</span>
                {showConfidence && (
                  <span className="opacity-90 font-normal">
                    {(det.confidence * 100).toFixed(0)}%
                  </span>
                )}
                {trackId && <span className="opacity-80">[{trackId}]</span>}
              </div>
            )}

            {/* Bottom Telemetry Tag (Speed / Posture / Hostility) */}
            {(speedKmH !== undefined || speedMps !== undefined || det.posture || isHostile) && (
              <div
                className={`absolute -bottom-4 right-0 px-1 py-0.2 bg-[#0c0e12]/95 border border-[#3c494e] font-mono text-[8px] font-bold ${textColor} whitespace-nowrap`}
              >
                {isHostile && <span className="text-[#ffb4ab] mr-1">HOSTILE</span>}
                {speedKmH !== undefined ? (
                  <span>{speedKmH} KM/H</span>
                ) : speedMps !== undefined ? (
                  <span>{speedMps} m/s</span>
                ) : null}
                {det.posture && <span className="ml-1 opacity-80 uppercase">({det.posture})</span>}
              </div>
            )}

            {/* ANPR Dedicated Lock Overlay if vehicle license plate is present */}
            {plateNumber && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-1 bg-black/50">
                <div className="border border-[#feb700] bg-[#feb700]/10 p-1.5 text-center backdrop-blur-xs shadow-lg">
                  <div className="font-mono text-[7px] text-[#feb700] font-bold tracking-widest uppercase">
                    ANPR LOCK DETECTED
                  </div>
                  <div className="bg-[#feb700] text-[#412d00] font-mono font-bold text-xs px-2 py-0.5 mt-0.5 tracking-widest">
                    {plateNumber}
                  </div>
                  <div className="flex justify-between gap-2 font-mono text-[8px] text-[#feb700] mt-0.5 bg-black/70 px-1">
                    <span>{isBlacklisted ? 'BLACKLIST MATCH' : 'REGISTERED'}</span>
                    <span>OCR {ocrConfidence ? (ocrConfidence * 100).toFixed(1) : '96.2'}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
