'use client';

import React from 'react';
import { CameraFeed, TripwireZone } from '@/types';
import { DetectionOverlay, DetectionItem } from './DetectionOverlay';
import { SpatialTripwireOverlay } from '../tripwire/SpatialTripwireOverlay';

export interface VisionFiltersState {
  deHaze?: boolean;
  clahe?: boolean;
  irOverlay?: boolean;
}

export interface VideoViewportProps {
  camera: CameraFeed;
  detections?: DetectionItem[];
  tripwires?: TripwireZone[];
  isDrawingTripwire?: boolean;
  onTripwireCreated?: (newTripwire: Omit<TripwireZone, 'id'>) => void;
  onTripwireSelect?: (id: string) => void;
  selectedTripwireId?: string | null;
  filters?: VisionFiltersState;
  showCrosshair?: boolean;
  showScanlines?: boolean;
  customOverlay?: React.ReactNode;
  className?: string;
  hasActiveBreach?: boolean;
}

export const VideoViewport: React.FC<VideoViewportProps> = ({
  camera,
  detections = [],
  tripwires = [],
  isDrawingTripwire = false,
  onTripwireCreated,
  onTripwireSelect,
  selectedTripwireId,
  filters = {},
  showCrosshair,
  showScanlines = true,
  customOverlay,
  className = '',
  hasActiveBreach = false,
}) => {
  const isOffline = camera.status === 'OFFLINE';

  // Compute CSS filter string based on tactical vision processing toggles
  const getFilterStyle = (): React.CSSProperties => {
    const filterParts: string[] = [];

    if (filters.deHaze) {
      filterParts.push('contrast(135%) brightness(110%) saturate(120%)');
    }
    if (filters.clahe) {
      filterParts.push('contrast(160%) brightness(105%)');
    }
    if (filters.irOverlay) {
      filterParts.push('hue-rotate(180deg) invert(20%) saturate(200%)');
    }

    return {
      filter: filterParts.length > 0 ? filterParts.join(' ') : undefined,
    };
  };

  // High-fidelity SVG/Canvas background generator for realistic tactical mock feeds
  const renderSimulatedFeed = () => {
    if (isOffline) {
      return (
        <div className="absolute inset-0 bg-[#0c0e12] flex flex-col items-center justify-center text-[#859399]">
          <svg className="w-12 h-12 text-[#93000a] mb-2 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 4.243a9 9 0 01-12.728 0m0 0l2.829-2.829m-2.829 2.829L3 21m3.536-12.536a5 5 0 010-7.072m0 0l2.829 2.829" />
          </svg>
          <div className="font-mono text-xs font-bold tracking-widest text-[#ffb4ab]">
            RTSP STREAM DISCONNECTED
          </div>
          <div className="font-mono text-[10px] text-[#859399] mt-1">
            NODE-03 UNRESPONSIVE // RECONNECTING...
          </div>
        </div>
      );
    }

    switch (camera.type) {
      case 'THERMAL':
        return (
          <div
            className="absolute inset-0 w-full h-full bg-[#080d14]"
            style={{
              backgroundImage: `radial-gradient(ellipse at 60% 60%, rgba(0, 209, 255, 0.15) 0%, rgba(10, 15, 25, 0.95) 70%), linear-gradient(135deg, #050b14 0%, #101c2a 100%)`,
              ...getFilterStyle(),
            }}
          >
            {/* Thermal Background Terrain Contours */}
            <svg className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="none" viewBox="0 0 800 500">
              <path d="M0,350 Q200,300 400,340 T800,310 L800,500 L0,500 Z" fill="#0d1f30" />
              <path d="M0,390 Q300,340 550,380 T800,360 L800,500 L0,500 Z" fill="#132a40" />
              <line x1="50" y1="280" x2="750" y2="280" stroke="#00d1ff" strokeWidth="0.5" strokeDasharray="4 8" opacity="0.3" />
              <line x1="50" y1="360" x2="750" y2="360" stroke="#00d1ff" strokeWidth="0.5" strokeDasharray="4 8" opacity="0.3" />
              {/* Thermal Hotspot heat signature */}
              <circle cx="580" cy="290" r="35" fill="url(#thermalHeatGlow)" opacity="0.75" className="animate-pulse" />
              <defs>
                <radialGradient id="thermalHeatGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                  <stop offset="40%" stopColor="#ffb4ab" stopOpacity="0.7" />
                  <stop offset="70%" stopColor="#00d1ff" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#001f28" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        );

      case 'FIXED_OPTICAL':
        return (
          <div
            className="absolute inset-0 w-full h-full bg-[#0e1116] grayscale opacity-85"
            style={{
              backgroundImage: `linear-gradient(180deg, #13171e 0%, #0a0d12 100%)`,
              ...getFilterStyle(),
            }}
          >
            {/* Checkpost road / gate outlines */}
            <svg className="absolute inset-0 w-full h-full opacity-35" preserveAspectRatio="none" viewBox="0 0 800 500">
              <polygon points="320,180 480,180 700,500 100,500" fill="#1b212b" />
              <line x1="400" y1="180" x2="400" y2="500" stroke="#feb700" strokeWidth="2" strokeDasharray="20 15" opacity="0.5" />
              <rect x="280" y="240" width="240" height="140" fill="#252d3a" rx="8" opacity="0.8" />
            </svg>
          </div>
        );

      case 'NIGHT_VISION':
      case 'PTZ':
        return (
          <div
            className="absolute inset-0 w-full h-full bg-[#05110d]"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(16, 64, 40, 0.4) 0%, rgba(2, 10, 6, 0.95) 80%)`,
              ...getFilterStyle(),
            }}
          >
            {/* Riverine landscape contours */}
            <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 800 500">
              <path d="M0,260 C250,230 400,320 800,240 L800,500 L0,500 Z" fill="#0d281a" />
              <path d="M0,320 C300,280 500,370 800,310 L800,500 L0,500 Z" fill="#081a11" />
            </svg>
          </div>
        );

      case 'UAV_FEED':
        return (
          <div
            className="absolute inset-0 w-full h-full bg-[#0a0f18] grayscale opacity-85"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 40%, rgba(25, 45, 70, 0.5) 0%, #060910 85%)`,
              ...getFilterStyle(),
            }}
          >
            {/* Aerial topographical terrain lines */}
            <svg className="absolute inset-0 w-full h-full opacity-25" preserveAspectRatio="none" viewBox="0 0 800 500">
              <ellipse cx="400" cy="250" rx="300" ry="180" fill="none" stroke="#00d1ff" strokeWidth="1" strokeDasharray="6 6" />
              <ellipse cx="400" cy="250" rx="200" ry="120" fill="none" stroke="#00d1ff" strokeWidth="0.8" strokeDasharray="4 4" />
              <ellipse cx="400" cy="250" rx="100" ry="60" fill="none" stroke="#00d1ff" strokeWidth="0.5" />
            </svg>
          </div>
        );

      default:
        return <div className="absolute inset-0 bg-[#0c0e12]" />;
    }
  };

  return (
    <div
      className={`relative w-full h-full bg-[#05070A] overflow-hidden select-none ${className}`}
    >
      {/* Video Content Canvas / Stream Simulation */}
      {renderSimulatedFeed()}

      {/* Tactical Scanlines Texture */}
      {showScanlines && (
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage:
              'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))',
            backgroundSize: '100% 4px, 6px 100%',
          }}
        />
      )}

      {/* HUD Corner Framing Notches */}
      <div className="absolute inset-0 pointer-events-none p-1">
        <div className="w-full h-full border border-[#3c494e]/30 relative">
          <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00d1ff]/70" />
          <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00d1ff]/70" />
          <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00d1ff]/70" />
          <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00d1ff]/70" />
        </div>
      </div>

      {/* PTZ / Crosshair Center Reticle */}
      {(showCrosshair || camera.ptzCapable) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-35">
          <svg
            className="w-24 h-24 text-[#00d1ff]"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="50" cy="50" r="35" strokeWidth="1" strokeDasharray="6 4" />
            <circle cx="50" cy="50" r="15" strokeWidth="0.8" />
            <circle cx="50" cy="50" r="2" fill="currentColor" />
            <line x1="50" y1="10" x2="50" y2="30" strokeWidth="1" />
            <line x1="50" y1="70" x2="50" y2="90" strokeWidth="1" />
            <line x1="10" y1="50" x2="30" y2="50" strokeWidth="1" />
            <line x1="70" y1="50" x2="90" y2="50" strokeWidth="1" />
          </svg>
        </div>
      )}

      {/* Spatial Tripwire Layer */}
      {tripwires.length > 0 || isDrawingTripwire ? (
        <SpatialTripwireOverlay
          tripwires={tripwires}
          isDrawing={isDrawingTripwire}
          onTripwireCreated={onTripwireCreated}
          onTripwireSelect={onTripwireSelect}
          selectedTripwireId={selectedTripwireId}
          hasActiveBreach={hasActiveBreach}
        />
      ) : null}

      {/* Detection & Bounding Boxes Layer */}
      {detections.length > 0 && <DetectionOverlay detections={detections} />}

      {/* Custom Overlays (e.g., Active Breach Banner, Action Reticles) */}
      {customOverlay}
    </div>
  );
};
