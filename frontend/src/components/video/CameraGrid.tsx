'use client';

import React from 'react';
import { CameraFeed, TripwireZone } from '@/types';
import { MOCK_CAMERA_FEEDS, MOCK_TRIPWIRES } from '@/data/mockData';
import { CameraFeedCard } from './CameraFeedCard';
import { DetectionItem } from './DetectionOverlay';

export interface CameraGridProps {
  cameras?: CameraFeed[];
  tripwires?: TripwireZone[];
  detections?: Record<string, DetectionItem[]>;
  activeAlertCameraId?: string;
  selectedCameraId?: string | null;
  onSelectCamera?: (camera: CameraFeed) => void;
  className?: string;
}

// Default mock detections tailored to the Stitch Tactical Grid design
const DEFAULT_GRID_DETECTIONS: Record<string, DetectionItem[]> = {
  'CAM-01': [
    {
      id: 'det-01',
      category: 'HUMAN',
      label: 'HUMAN #H-207',
      confidence: 0.97,
      isHostile: true,
      speedKmH: 8.6,
      posture: 'RUNNING',
      boundingBox: {
        x: 0.58,
        y: 0.42,
        width: 0.16,
        height: 0.38,
      },
    },
  ],
  'CAM-02': [
    {
      id: 'det-02',
      category: 'VEHICLE',
      label: 'VEHICLE [SUV]',
      confidence: 0.98,
      plateNumber: 'WB 73 AQ 4412',
      isBlacklisted: true,
      ocrConfidence: 0.962,
      boundingBox: {
        x: 0.35,
        y: 0.36,
        width: 0.3,
        height: 0.38,
      },
    },
  ],
  'CAM-03': [
    {
      id: 'det-03',
      category: 'UNKNOWN',
      label: 'SECTOR-SCAN [NORMAL]',
      confidence: 0.92,
      boundingBox: {
        x: 0.44,
        y: 0.44,
        width: 0.12,
        height: 0.12,
      },
    },
  ],
  'CAM-04': [
    {
      id: 'det-04',
      category: 'DRONE',
      label: 'UAV-DELTA AIRBORNE',
      confidence: 0.99,
      speedKmH: 45,
      boundingBox: {
        x: 0.4,
        y: 0.35,
        width: 0.2,
        height: 0.25,
      },
    },
  ],
};

export const CameraGrid: React.FC<CameraGridProps> = ({
  cameras = MOCK_CAMERA_FEEDS,
  tripwires = MOCK_TRIPWIRES,
  detections,
  activeAlertCameraId = 'CAM-01',
  selectedCameraId,
  onSelectCamera,
  className = '',
}) => {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 gap-1 bg-[#3c494e] p-[1px] h-full overflow-hidden ${className}`}
    >
      {cameras.slice(0, 4).map((camera) => {
        const camDetections =
          (detections && detections[camera.id]) ||
          DEFAULT_GRID_DETECTIONS[camera.id] ||
          [];
        const camTripwires = tripwires.filter((tw) => tw.cameraId === camera.id);
        const hasAlert = camera.id === activeAlertCameraId;
        const isSelected = camera.id === selectedCameraId;

        return (
          <CameraFeedCard
            key={camera.id}
            camera={camera}
            detections={camDetections}
            tripwires={camTripwires}
            hasAlert={hasAlert}
            isSelected={isSelected}
            onSelect={onSelectCamera}
            onMaximize={onSelectCamera}
            showCrosshair={camera.type === 'NIGHT_VISION' || camera.type === 'PTZ'}
            className="min-h-[220px] h-full"
          />
        );
      })}
    </div>
  );
};
