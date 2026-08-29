import React from 'react';

interface GisTelemetryOverlayProps {
  lat?: string;
  lon?: string;
  elevation?: string;
  temperature?: string;
  className?: string;
}

export const GisTelemetryOverlay: React.FC<GisTelemetryOverlayProps> = ({
  lat = '34.0522° N',
  lon = '118.2437° W',
  elevation = '1,204M',
  temperature = '-4°C',
  className = '',
}) => {
  return (
    <div className={`bg-[#0f131a]/95 backdrop-blur-md ghost-border w-64 ${className}`}>
      <div className="px-4 py-2 border-b border-[#3c494e] font-mono text-[11px] font-bold text-[#bbc9cf] tracking-widest uppercase">
        TELEMETRY
      </div>
      <div className="p-4 flex flex-col gap-2 font-mono text-xs">
        <div className="flex justify-between">
          <span className="text-[#859399]">LAT:</span>
          <span className="text-[#4cd6ff] font-bold">{lat}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#859399]">LON:</span>
          <span className="text-[#4cd6ff] font-bold">{lon}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#859399]">ELEV:</span>
          <span className="text-[#e2e2e8]">{elevation}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#859399]">TEMP:</span>
          <span className="text-[#e2e2e8]">{temperature}</span>
        </div>
      </div>
    </div>
  );
};
