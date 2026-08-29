'use client';

import React from 'react';
import { BoundingBox, DetectionCategory, SeverityLevel } from '@/types';

export interface DetectionItem {
  id: string;
  category: DetectionCategory;
  label: string;
  confidence: number;
  boundingBox: BoundingBox;
  severity?: SeverityLevel;
  trackId?: string;
  speedKmH?: number;
  posture?: string;
  isHostile?: boolean;
  plateNumber?: string;
  isBlacklisted?: boolean;
  ocrConfidence?: number;
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
      {detections.map((det) => {
        const { x, y, width, height } = det.boundingBox;
        // Check if coordinates are normalized (0..1) or pixel values
        const leftPercent = x <= 1 ? `${x * 100}%` : `${x}px`;
        const topPercent = y <= 1 ? `${y * 100}%` : `${y}px`;
        const widthPercent = width <= 1 ? `${width * 100}%` : `${width}px`;
        const heightPercent = height <= 1 ? `${height * 100}%` : `${height}px`;

        const isHostile = det.isHostile || det.severity === 'CRITICAL';
        const isBlacklisted = det.isBlacklisted || det.severity === 'HIGH';

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

        return (
          <div
            key={det.id}
            className={`absolute border ${borderColor} ${bgColor} transition-all duration-200`}
            style={{
              left: leftPercent,
              top: topPercent,
              width: widthPercent,
              height: heightPercent,
            }}
          >
            {/* Tactical Corner Reticle Markers */}
            <span className={`absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 ${borderColor}`} />
            <span className={`absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 ${borderColor}`} />
            <span className={`absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 ${borderColor}`} />
            <span className={`absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 ${borderColor}`} />

            {/* Top Label Tag */}
            {showLabels && (
              <div
                className={`absolute -top-5 left-0 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider uppercase whitespace-nowrap shadow flex items-center gap-1 ${headerBg}`}
              >
                {isHostile && <span className="animate-pulse">⚠</span>}
                <span>{det.label || det.category}</span>
                {showConfidence && (
                  <span className="opacity-90 font-normal">
                    {(det.confidence * 100).toFixed(0)}%
                  </span>
                )}
                {det.trackId && <span className="opacity-80">[{det.trackId}]</span>}
              </div>
            )}

            {/* Bottom Telemetry Tag (e.g., Speed / Posture / Hostility) */}
            {(det.speedKmH !== undefined || det.posture || det.isHostile) && (
              <div
                className={`absolute -bottom-4 right-0 px-1 py-0.2 bg-[#0c0e12]/90 border border-[#3c494e] font-mono text-[8px] font-bold ${textColor} whitespace-nowrap`}
              >
                {det.isHostile && <span className="text-[#ffb4ab] mr-1">HOSTILE</span>}
                {det.speedKmH !== undefined && <span>{det.speedKmH} KM/H</span>}
                {det.posture && <span className="ml-1 opacity-80">{det.posture}</span>}
              </div>
            )}

            {/* ANPR Dedicated Lock Overlay if plate is present */}
            {det.plateNumber && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-1 bg-black/40">
                <div className="border border-[#feb700] bg-[#feb700]/10 p-1.5 text-center backdrop-blur-xs">
                  <div className="font-mono text-[7px] text-[#feb700] font-bold tracking-widest uppercase">
                    ANPR LOCK DETECTED
                  </div>
                  <div className="bg-[#feb700] text-[#412d00] font-mono font-bold text-xs px-2 py-0.5 mt-0.5 tracking-wider">
                    {det.plateNumber}
                  </div>
                  <div className="flex justify-between gap-2 font-mono text-[8px] text-[#feb700] mt-0.5 bg-black/60 px-1">
                    <span>{det.isBlacklisted ? 'BLACKLIST MATCH' : 'REGISTERED'}</span>
                    <span>OCR {det.ocrConfidence ? (det.ocrConfidence * 100).toFixed(1) : '96.2'}%</span>
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
