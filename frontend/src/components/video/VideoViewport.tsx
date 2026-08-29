'use client';

import React from 'react';
import { CameraFeed, TripwireZone } from '@/types';
import { DetectionOverlay, DetectionItem } from './DetectionOverlay';
import { SpatialTripwireOverlay, TripwireBreachEvent } from '../tripwire/SpatialTripwireOverlay';

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
  onTripwireBreach?: (event: TripwireBreachEvent) => void;
  selectedTripwireId?: string | null;
  filters?: VisionFiltersState;
  showCrosshair?: boolean;
  showScanlines?: boolean;
  customOverlay?: React.ReactNode;
  className?: string;
  hasActiveBreach?: boolean;
}

// Exact image URLs from Google Stitch project for realistic tactical HUD feeds
const STITCH_FEED_IMAGE_URLS: Record<string, string> = {
  'CAM-01':
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDyLHr-USadpDIe9n-y9BEhWbgYt6IAmDlFhxVTvrJNjrppyCaJFJJNG4GoXeUY41ULZvJwAEBsDQ0D0H65JDp7u6H6rPikbzUulqzPRjEXT7wX2rXM2r2o-_5rf-dlm_Zy4bnF-UfySkmFsRjnuq-R-74bin_YyFtcQwAuRozdHeOvLkJPZsVUbux5644wmeR2y9WJojZ4XONXwqKDM-b8xt8NpkMdiuzsIVFR40ADPfUd0Ow1MKPwIuryTgXg3MQAQjk',
  'CAM-02':
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBn47KBCV0T05HFf4VY3maPoIZN2a2LPAg5-UfrKXcAZuV48V7X-Qk6Z5zCqNWAJcnNprctVMZ49YI15n-dq4VNKgqAJHSXr1C_tuwj8zAF7UwFuRbyJWW8z5_wqEq7ZqePRvmLP1kQNzSxWfeCKfv78di7plg6YUAeMdBEsndM_5EsfdmZ7UmJuzfHMAWFfFKn6LkIcQ1IVbroxPfmnQq4Gva6jfOE7PDSx2XbbBHAdd4Pq_60zREHSA',
  'CAM-03':
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD2LJthJXSNLUIXbSyaUkBkT9vemWfA27MbmGoQPugKcDVy6xZIe1arNuhqVl6rIMv7ICIkycRKtk8rECRjefN6e6YooPSPUcLHe7ptALY-Tb2CVw_5brfrpqQDEZqvfvXgpOubt7eLLMhT1mseI7uxEcE0wGl6G_p4t7InP01MOpA4U3PylqfHqg2rnzqO2vdJccEKuRLyes3QovCaupg4yrN0vBaYOtYk3vFpp71hNm_NtRS6D9Qxlw',
  'CAM-04':
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAufdbCEd2ormLC4IgZ9H1ChS5BziZfQJn8KpfSGtdH-112lmS_ARi8P-Hoyy461lGhe5-EGswmkSTFcW-eB6hwsEFsJaplaBP-65324Jfj-9g_5_VjHnpvf0S962cHpoIe4GRXfq0uPhf32bWR8r63bgTDH8S-h4pAyFc_LLO2LG-vxsWZTya7aCcWgfzHumSeOG8fqufWTxKMUhZod-ACfdysJGa1e7AjTFuh_puvgQndY9ywTaYMvw',
  'COMMAND-STAGE':
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDO2OfmTwjGHhuU0t-nxeIrQtcYmB0SoKtuhqBpFSEIf8HgwX0P5DbTblDAUxQft3tqeEjs3kd9cZ54AXS1YHPu9AfI0aRu3TIwOYQrmMAnxP3B5QSLSz1D2dIEmdsvRa-a0y-QBwOH3KAcARgGcPXUnSCoys09d3z1290R5M4c2jN29c4WfXvSQYWyxy8vLN-QnHRvzPR3OPLpFk4U0V770ZzjM8bA62SPdDhgMFRq50oHDRyj80KGeQ',
};

export const VideoViewport: React.FC<VideoViewportProps> = ({
  camera,
  detections = [],
  tripwires = [],
  isDrawingTripwire = false,
  onTripwireCreated,
  onTripwireSelect,
  onTripwireBreach,
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

  // High-fidelity background rendering matching Stitch
  const renderFeedContent = () => {
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

    const imageUrl = STITCH_FEED_IMAGE_URLS[camera.id] || STITCH_FEED_IMAGE_URLS['COMMAND-STAGE'];

    return (
      <div className="absolute inset-0 w-full h-full overflow-hidden" style={getFilterStyle()}>
        {/* Background Image Layer from Stitch with Tactical Opacity */}
        <div
          className={`absolute inset-0 w-full h-full bg-cover bg-center transition-all ${
            camera.type === 'FIXED_OPTICAL' || camera.type === 'UAV_FEED' ? 'grayscale opacity-75' : 'opacity-80'
          }`}
          style={{
            backgroundImage: `url('${imageUrl}')`,
          }}
        />

        {/* Fallback & Enhanced Contours */}
        {camera.type === 'THERMAL' && (
          <div className="absolute inset-0 bg-radial from-transparent via-[#050b14]/40 to-[#050b14]/90 pointer-events-none" />
        )}
      </div>
    );
  };

  return (
    <div
      className={`relative w-full h-full bg-[#05070A] overflow-hidden select-none ${className}`}
    >
      {/* Video Content Canvas / Stream */}
      {renderFeedContent()}

      {/* Tactical Scanlines Texture */}
      {showScanlines && (
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage:
              'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 255, 0, 0.03))',
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
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
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
          onTripwireBreach={onTripwireBreach}
          selectedTripwireId={selectedTripwireId}
          cameraId={camera.id}
          hasActiveBreach={hasActiveBreach}
        />
      ) : null}

      {/* Detection & Bounding Boxes Layer */}
      {detections.length > 0 && <DetectionOverlay detections={detections} />}

      {/* Custom Overlays */}
      {customOverlay}
    </div>
  );
};
