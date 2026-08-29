'use client';

import React from 'react';
import { CameraFeed, TripwireZone } from '@/types';
import { CameraFeedHeader } from './CameraFeedHeader';
import { CameraFeedFooter } from './CameraFeedFooter';
import { VideoViewport, VisionFiltersState } from './VideoViewport';
import { DetectionItem } from './DetectionOverlay';

export interface CameraFeedCardProps {
  camera: CameraFeed;
  detections?: DetectionItem[];
  tripwires?: TripwireZone[];
  isSelected?: boolean;
  hasAlert?: boolean;
  onSelect?: (camera: CameraFeed) => void;
  onMaximize?: (camera: CameraFeed) => void;
  filters?: VisionFiltersState;
  showCrosshair?: boolean;
  className?: string;
}

export const CameraFeedCard: React.FC<CameraFeedCardProps> = ({
  camera,
  detections = [],
  tripwires = [],
  isSelected = false,
  hasAlert = false,
  onSelect,
  onMaximize,
  filters,
  showCrosshair,
  className = '',
}) => {
  return (
    <div
      onClick={() => onSelect?.(camera)}
      className={`relative bg-[#111318] border transition-all duration-200 overflow-hidden flex flex-col group cursor-pointer ${
        hasAlert
          ? 'border-[#ffb4ab] shadow-[0_0_15px_rgba(255,180,171,0.2)]'
          : isSelected
          ? 'border-[#00d1ff] shadow-[0_0_12px_rgba(0,209,255,0.25)]'
          : 'border-[#3c494e] hover:border-[#00d1ff]/60'
      } ${className}`}
    >
      {/* Top Header */}
      <CameraFeedHeader
        camera={camera}
        isFocused={isSelected}
        onMaximize={onMaximize ? () => onMaximize(camera) : undefined}
      />

      {/* Main Viewport */}
      <div className="flex-1 w-full min-h-[180px] relative">
        <VideoViewport
          camera={camera}
          detections={detections}
          tripwires={tripwires}
          filters={filters}
          showCrosshair={showCrosshair}
          hasActiveBreach={hasAlert}
        />
      </div>

      {/* Bottom Footer */}
      <CameraFeedFooter camera={camera} />
    </div>
  );
};
