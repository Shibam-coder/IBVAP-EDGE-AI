'use client';

import React from 'react';
import { CameraFeed } from '@/types';

export interface CameraFeedFooterProps {
  camera: CameraFeed;
  telemetryExtra?: string;
  className?: string;
}

export const CameraFeedFooter: React.FC<CameraFeedFooterProps> = ({
  camera,
  telemetryExtra,
  className = '',
}) => {
  const getSpecificTelemetry = () => {
    if (telemetryExtra) return telemetryExtra;

    switch (camera.type) {
      case 'THERMAL':
        return `BITRATE: ${camera.bitrateMbps || 8.4} Mbps`;
      case 'FIXED_OPTICAL':
        return 'FOCUS: AUTO // ANPR LOCK';
      case 'NIGHT_VISION':
      case 'PTZ':
        return 'AZIMUTH: 274° // ELV: +12°';
      case 'UAV_FEED':
        return 'ALT: 450m // LINK: 98%';
      default:
        return `BITRATE: ${camera.bitrateMbps} Mbps`;
    }
  };

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 p-2 flex justify-between items-end bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20 pointer-events-none ${className}`}
    >
      <div className="font-mono text-[9px] text-[#859399] truncate max-w-[65%]">
        {camera.streamUrl}
      </div>
      <div className="font-mono text-[9px] text-[#00d1ff] font-semibold bg-[#111318]/70 px-1.5 py-0.5 rounded border border-[#3c494e]/40 backdrop-blur-xs">
        {getSpecificTelemetry()}
      </div>
    </div>
  );
};
