'use client';

import React from 'react';
import { CameraFeed, TripwireZone } from '@/types';
import { VideoViewport, VisionFiltersState } from './VideoViewport';
import { DetectionItem } from './DetectionOverlay';
import { TripwireBreachEvent } from '../tripwire/SpatialTripwireOverlay';

export interface VideoFocusStageProps {
  camera: CameraFeed;
  tripwires: TripwireZone[];
  detections?: DetectionItem[];
  isDrawingTripwire?: boolean;
  onTripwireCreated?: (newTripwire: Omit<TripwireZone, 'id'>) => void;
  onTripwireSelect?: (id: string) => void;
  onTripwireBreach?: (event: TripwireBreachEvent) => void;
  selectedTripwireId?: string | null;
  filters?: VisionFiltersState;
  hasActiveBreach?: boolean;
  onDispatchUnit?: () => void;
  onSoundAlarm?: () => void;
  className?: string;
}

// Default Stitch Screen 3 detections in BREACH state
const DEFAULT_STAGE_BREACH_DETECTIONS: DetectionItem[] = [
  {
    id: 'focus-det-1',
    object_type: 'person',
    label: 'TARGET [UNIDENTIFIED MALE] | SPEED: 12KM/H',
    confidence: 0.98,
    speedKmH: 12,
    posture: 'EVASIVE',
    isHostile: true,
    bbox: {
      x: 0.60,
      y: 0.30,
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
      x: 0.30,
      y: 0.40,
      width: 0.10,
      height: 0.30,
    },
  },
];

// Default detections in NORMAL (non-breached) state for demonstration
const DEFAULT_STAGE_NORMAL_DETECTIONS: DetectionItem[] = [
  {
    id: 'normal-det-1',
    object_type: 'person',
    label: 'PERSON #H-104 [PATROL]',
    confidence: 0.96,
    speedKmH: 3.5,
    posture: 'STANDING',
    isHostile: false,
    bbox: {
      x: 0.35,
      y: 0.40,
      width: 0.12,
      height: 0.35,
    },
  },
];

export const VideoFocusStage: React.FC<VideoFocusStageProps> = ({
  camera,
  tripwires,
  detections,
  isDrawingTripwire = false,
  onTripwireCreated,
  onTripwireSelect,
  onTripwireBreach,
  selectedTripwireId,
  filters = {},
  hasActiveBreach = true,
  onDispatchUnit,
  onSoundAlarm,
  className = '',
}) => {
  // Use caller detections if passed, otherwise use demonstration detections based on breach state
  const activeDetections =
    detections || (hasActiveBreach ? DEFAULT_STAGE_BREACH_DETECTIONS : DEFAULT_STAGE_NORMAL_DETECTIONS);

  return (
    <div
      className={`flex-1 bg-black border border-[#3c494e] relative overflow-hidden flex flex-col ${className}`}
    >
      {/* Top Header Information Overlay */}
      <div className="absolute top-3 left-4 z-20 pointer-events-none font-mono text-lg text-white drop-shadow-md font-bold tracking-wider">
        17:22 MST
      </div>

      {/* Center Alert Banner (Stitch Screen 3 replica) */}
      {hasActiveBreach ? (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#93000a]/90 text-[#ffdad6] px-6 py-2 rounded border border-[#ffb4ab] shadow-[0_0_20px_rgba(255,180,171,0.6)] flex items-center gap-3 z-30 pointer-events-none animate-pulse">
          <svg className="w-6 h-6 text-[#ffb4ab]" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-mono text-base font-bold tracking-widest uppercase">
            Border Breach Detected
          </span>
        </div>
      ) : (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#111318]/90 text-[#00d1ff] px-4 py-1.5 rounded border border-[#00d1ff]/40 shadow-lg flex items-center gap-2 z-30 pointer-events-none font-mono text-xs">
          <span className="w-2 h-2 rounded-full bg-[#00d1ff] animate-pulse" />
          <span className="font-bold tracking-wider uppercase">
            SECTOR SURVEILLANCE NOMINAL // TRIPWIRE ACTIVE
          </span>
        </div>
      )}

      {/* Main Focus Viewport Area */}
      <div className="flex-1 relative w-full h-full min-h-[350px]">
        <VideoViewport
          camera={camera}
          detections={activeDetections}
          tripwires={tripwires}
          isDrawingTripwire={isDrawingTripwire}
          onTripwireCreated={onTripwireCreated}
          onTripwireSelect={onTripwireSelect}
          onTripwireBreach={onTripwireBreach}
          selectedTripwireId={selectedTripwireId}
          filters={filters}
          showCrosshair={true}
          hasActiveBreach={hasActiveBreach}
        />
      </div>

      {/* Bottom Tactical Toolbar for Feed */}
      <div className="h-10 bg-[#282a2e] border-t border-[#3c494e] flex items-center justify-between px-4 z-20 shrink-0">
        <div className="font-mono text-[11px] text-[#00d1ff] font-bold">
          {camera.name || `${camera.id}: SECTOR 4`}
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px] text-[#bbc9cf]">
          <span>ZOOM: 1.4x</span>
          <span>PTZ: AUTO-TRACK</span>
          <div className="flex items-center gap-1.5 text-[#ffb4ab] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#ffb4ab] animate-pulse" />
            REC
          </div>
        </div>
      </div>

      {/* Bottom Action Bar & Sector Integrity Meter */}
      <div className="p-3 bg-[#1a1c20] border-t border-[#3c494e] flex items-center justify-between flex-wrap gap-2 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] font-bold tracking-wider text-[#bbc9cf] uppercase">
            Sector Integrity
          </span>
          <div className="flex gap-1 h-2.5 w-28">
            <div className={`flex-1 rounded-xs ${hasActiveBreach ? 'bg-[#3c494e]/40' : 'bg-[#00d1ff]'}`} />
            <div className={`flex-1 rounded-xs ${hasActiveBreach ? 'bg-[#3c494e]/40' : 'bg-[#00d1ff]'}`} />
            <div className={`flex-1 rounded-xs ${hasActiveBreach ? 'bg-[#3c494e]/40' : 'bg-[#00d1ff]'}`} />
            <div className={`flex-1 rounded-xs ${hasActiveBreach ? 'bg-[#93000a]' : 'bg-[#00d1ff]'}`} />
            <div className={`flex-1 rounded-xs ${hasActiveBreach ? 'bg-[#ffb4ab] animate-pulse' : 'bg-[#00d1ff]'}`} />
          </div>
          <span
            className={`font-mono text-[10px] font-bold uppercase ${
              hasActiveBreach ? 'text-[#ffb4ab]' : 'text-[#00d1ff]'
            }`}
          >
            {hasActiveBreach ? 'CRITICAL' : 'NOMINAL (100%)'}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onDispatchUnit}
            className="bg-[#00d1ff] hover:bg-[#a4e6ff] text-[#003543] px-4 py-1.5 font-mono text-[11px] font-bold tracking-wider uppercase rounded transition-all shadow-[0_0_10px_rgba(0,209,255,0.3)] cursor-pointer"
          >
            DISPATCH UNIT
          </button>
          <button
            type="button"
            onClick={onSoundAlarm}
            className="bg-transparent border border-[#3c494e] hover:border-[#ffb4ab] hover:text-[#ffb4ab] text-[#e2e2e8] px-4 py-1.5 font-mono text-[11px] font-bold tracking-wider uppercase rounded transition-colors cursor-pointer"
          >
            SOUND ALARM
          </button>
        </div>
      </div>
    </div>
  );
};
