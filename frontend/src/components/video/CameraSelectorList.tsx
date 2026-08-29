'use client';

import React from 'react';
import { CameraFeed } from '@/types';

export interface CameraSelectorListProps {
  cameras: CameraFeed[];
  selectedCameraId?: string;
  onSelectCamera: (camera: CameraFeed) => void;
  className?: string;
}

export const CameraSelectorList: React.FC<CameraSelectorListProps> = ({
  cameras,
  selectedCameraId,
  onSelectCamera,
  className = '',
}) => {
  return (
    <div className={`bg-[#1a1c20] border border-[#3c494e] flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center p-2.5 border-b border-[#3c494e]">
        <span className="font-mono text-[11px] font-bold tracking-wider text-[#bbc9cf] uppercase">
          Camera Grid
        </span>
        <svg className="w-3.5 h-3.5 text-[#bbc9cf]" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </div>

      {/* Grid of 4 Mini Thumbnails */}
      <div className="p-2 grid grid-cols-2 gap-2 overflow-y-auto">
        {cameras.slice(0, 4).map((cam) => {
          const isSelected = cam.id === selectedCameraId;
          const isOffline = cam.status === 'OFFLINE';

          return (
            <div
              key={cam.id}
              onClick={() => !isOffline && onSelectCamera(cam)}
              className={`relative aspect-video border rounded-xs transition-all overflow-hidden flex flex-col justify-end p-1 select-none ${
                isOffline
                  ? 'border-[#3c494e] bg-[#333539] cursor-not-allowed opacity-60'
                  : isSelected
                  ? 'border-[#00d1ff] bg-[#0c0e12] shadow-[0_0_8px_rgba(0,209,255,0.4)] cursor-pointer'
                  : 'border-[#3c494e] bg-[#111318] hover:border-[#859399] cursor-pointer'
              }`}
            >
              {/* Simulated mini thumbnail background */}
              {!isOffline ? (
                <div
                  className="absolute inset-0 opacity-40 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      cam.type === 'THERMAL'
                        ? 'radial-gradient(ellipse at 50% 50%, rgba(0,209,255,0.3), #0a101d)'
                        : cam.type === 'NIGHT_VISION'
                        ? 'radial-gradient(ellipse at 50% 50%, rgba(16,64,40,0.5), #020a06)'
                        : 'linear-gradient(180deg, #1e2430, #0a0d12)',
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center font-mono text-[9px] font-bold text-[#ffb4ab]">
                  OFFLINE
                </div>
              )}

              {/* Camera Tag */}
              {!isOffline && (
                <div className="relative z-10 bg-[#111318]/90 px-1 py-0.2 rounded font-mono text-[9px] font-bold text-[#00d1ff] w-max border border-[#3c494e]/50">
                  {cam.id}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
