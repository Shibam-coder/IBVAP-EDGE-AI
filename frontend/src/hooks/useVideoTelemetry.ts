'use client';

import { useState, useEffect, useCallback } from 'react';
import { DetectionItem } from '@/components/video/DetectionOverlay';
import { TripwireBreachEvent } from '@/components/tripwire/SpatialTripwireOverlay';
import { DetectionFramePayload, TripwireBreachPayload } from '@/types';
import { telemetryWs, ConnectionStatus } from '@/lib/websocket';
import {
  adaptBackendDetectionBatch,
  adaptTripwireBreachEvent,
} from '@/lib/detectionAdapter';

// Default mock detections matching Stitch Screen 2
const DEFAULT_GRID_MOCK_DETECTIONS: Record<string, DetectionItem[]> = {
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

// Default mock detections matching Stitch Screen 3
const DEFAULT_FOCUS_MOCK_DETECTIONS: DetectionItem[] = [
  {
    id: 'focus-det-1',
    object_type: 'person',
    label: 'TARGET [UNIDENTIFIED MALE] | SPEED: 12KM/H',
    confidence: 0.98,
    speedKmH: 12,
    posture: 'EVASIVE',
    isHostile: true,
    bbox: {
      x: 0.6,
      y: 0.3,
      width: 0.16,
      height: 0.44,
    },
  },
  {
    id: 'focus-det-2',
    object_type: 'person',
    label: 'TRK-88',
    confidence: 0.94,
    speedKmH: 4.2,
    bbox: {
      x: 0.3,
      y: 0.4,
      width: 0.1,
      height: 0.3,
    },
  },
];

export interface UseVideoTelemetryOptions {
  cameraId?: string;
  forceMockMode?: boolean;
}

export function useVideoTelemetry(options: UseVideoTelemetryOptions = {}) {
  const { cameraId, forceMockMode = false } = options;

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('OFFLINE');
  const [gridDetections, setGridDetections] = useState<Record<string, DetectionItem[]>>(
    DEFAULT_GRID_MOCK_DETECTIONS
  );
  const [latestBreachEvent, setLatestBreachEvent] = useState<TripwireBreachEvent | null>(null);
  const [hasActiveBreach, setHasActiveBreach] = useState<boolean>(true);
  const [isLiveStreamActive, setIsLiveStreamActive] = useState<boolean>(false);

  useEffect(() => {
    if (forceMockMode) {
      return;
    }

    // Connect to telemetry WebSocket
    telemetryWs.connect();

    // Listen to status changes
    const unsubStatus = telemetryWs.onStatusChange((status) => {
      setConnectionStatus(status);
      setIsLiveStreamActive(status === 'OPEN');
    });

    // Subscribe to live detection frame batches
    const unsubDetections = telemetryWs.subscribe<DetectionFramePayload>(
      'DETECTION_FRAME',
      (msg) => {
        const payload = msg.payload;
        if (!payload || !payload.detections) return;

        const targetCamId = payload.cameraId || payload.camera_id || 'CAM-01';
        const adaptedItems = adaptBackendDetectionBatch(payload.detections, targetCamId);

        setGridDetections((prev) => ({
          ...prev,
          [targetCamId]: adaptedItems,
        }));
      }
    );

    // Subscribe to live tripwire breach events
    const unsubTripwires = telemetryWs.subscribe<TripwireBreachPayload>(
      'TRIPWIRE_EVENT',
      (msg) => {
        if (!msg.payload) return;
        const breach = adaptTripwireBreachEvent(msg.payload);
        setLatestBreachEvent(breach);
        if (breach.tripwire_breached) {
          setHasActiveBreach(true);
        }
      }
    );

    return () => {
      unsubStatus();
      unsubDetections();
      unsubTripwires();
    };
  }, [forceMockMode]);

  const triggerMockBreachToggle = useCallback(() => {
    setHasActiveBreach((prev) => !prev);
  }, []);

  const getCameraDetections = useCallback(
    (camId: string): DetectionItem[] => {
      if (gridDetections[camId] && gridDetections[camId].length > 0) {
        return gridDetections[camId];
      }
      if (camId === 'CAM-01' || camId === 'COMMAND-STAGE') {
        return hasActiveBreach ? DEFAULT_FOCUS_MOCK_DETECTIONS : [];
      }
      return DEFAULT_GRID_MOCK_DETECTIONS[camId] || [];
    },
    [gridDetections, hasActiveBreach]
  );

  const activeFocusDetections = cameraId
    ? getCameraDetections(cameraId)
    : hasActiveBreach
    ? DEFAULT_FOCUS_MOCK_DETECTIONS
    : [];

  return {
    connectionStatus,
    isLive: isLiveStreamActive,
    isMock: !isLiveStreamActive,
    gridDetections,
    activeFocusDetections,
    getCameraDetections,
    latestBreachEvent,
    hasActiveBreach,
    setHasActiveBreach,
    triggerMockBreachToggle,
  };
}
