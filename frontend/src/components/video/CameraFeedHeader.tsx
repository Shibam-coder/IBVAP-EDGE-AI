'use client';

import React from 'react';
import { CameraFeed, CameraStatus } from '@/types';

export interface CameraFeedHeaderProps {
  camera: CameraFeed;
  isFocused?: boolean;
  onMaximize?: () => void;
  className?: string;
}

export const CameraFeedHeader: React.FC<CameraFeedHeaderProps> = ({
  camera,
  isFocused = false,
  onMaximize,
  className = '',
}) => {
  const getStatusBadge = (status: CameraStatus) => {
    switch (status) {
      case 'RECORDING':
        return (
          <span className="flex items-center gap-1 font-mono text-[9px] font-bold text-[#ffb4ab] uppercase bg-[#93000a]/30 border border-[#ffb4ab]/40 px-1.5 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab] animate-pulse" />
            REC
          </span>
        );
      case 'READY':
      case 'ONLINE':
        return (
          <span className="flex items-center gap-1 font-mono text-[9px] font-bold text-[#00d1ff] uppercase bg-[#00d1ff]/10 border border-[#00d1ff]/30 px-1.5 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d1ff]" />
            LIVE
          </span>
        );
      case 'OFFLINE':
        return (
          <span className="flex items-center gap-1 font-mono text-[9px] font-bold text-[#859399] uppercase bg-[#333539] border border-[#859399]/40 px-1.5 py-0.5 rounded">
            OFFLINE
          </span>
        );
      default:
        return (
          <span className="font-mono text-[9px] text-[#bbc9cf] px-1 py-0.5 rounded bg-[#1e2024]">
            {status}
          </span>
        );
    }
  };

  const getCameraTypeLabel = (type: string) => {
    switch (type) {
      case 'THERMAL':
        return 'THERMAL / PTZ';
      case 'NIGHT_VISION':
        return 'NIGHT VISION';
      case 'UAV_FEED':
        return 'UAV PATROL';
      case 'FIXED_OPTICAL':
        return 'OPTICAL (ANPR)';
      default:
        return type;
    }
  };

  return (
    <div
      className={`absolute top-0 left-0 right-0 p-2 flex justify-between items-start bg-gradient-to-b from-black/90 via-black/50 to-transparent z-20 pointer-events-auto ${className}`}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <div className="bg-[#111318]/90 px-2 py-0.5 font-mono text-[10px] font-bold text-[#00d1ff] border border-[#3c494e] backdrop-blur-md rounded shadow">
          {camera.name || camera.id}
        </div>
        {getStatusBadge(camera.status)}
        <span className="hidden sm:inline-block font-mono text-[9px] text-[#859399] bg-[#0c0e12]/60 px-1.5 py-0.5 rounded border border-[#3c494e]/40">
          {getCameraTypeLabel(camera.type)}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="font-mono text-[9px] text-[#bbc9cf] bg-[#111318]/80 px-2 py-0.5 rounded border border-[#3c494e]/50 backdrop-blur-sm">
          {`${camera.resolution} // ${camera.fps}FPS // ${camera.codec}`}
        </div>
        {onMaximize && (
          <button
            type="button"
            onClick={onMaximize}
            className="text-[#bbc9cf] hover:text-[#00d1ff] p-1 bg-[#111318]/80 hover:bg-[#1e2024] border border-[#3c494e] rounded transition-colors"
            title={isFocused ? 'Exit Fullscreen' : 'Focus View'}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isFocused ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              )}
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
