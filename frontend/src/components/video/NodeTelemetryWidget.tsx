'use client';

import React from 'react';
import { TelemetryData } from '@/types';
import { MOCK_TELEMETRY } from '@/data/mockData';

export interface NodeTelemetryWidgetProps {
  telemetry?: TelemetryData;
  className?: string;
}

export const NodeTelemetryWidget: React.FC<NodeTelemetryWidgetProps> = ({
  telemetry = MOCK_TELEMETRY,
  className = '',
}) => {
  return (
    <div className={`bg-[#1a1c20] border border-[#3c494e] flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-2.5 border-b border-[#3c494e] flex justify-between items-center">
        <span className="font-mono text-[11px] font-bold tracking-wider text-[#bbc9cf] uppercase">
          Node Telemetry
        </span>
        <span className="flex items-center gap-1 font-mono text-[9px] text-[#00d1ff] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d1ff] animate-pulse" />
          ONLINE
        </span>
      </div>

      {/* Metrics List */}
      <div className="p-3 flex flex-col gap-2 font-mono text-xs">
        <div className="flex justify-between items-center border-b border-[#3c494e]/50 pb-1.5">
          <span className="text-[#859399]">AI ENGINE</span>
          <span className="text-[#00d1ff] font-bold">YOLOv8-EDGE // ONLINE</span>
        </div>

        <div className="flex justify-between items-center border-b border-[#3c494e]/50 pb-1.5">
          <span className="text-[#859399]">GPU USAGE</span>
          <div className="flex items-center gap-2">
            <div className="w-16 bg-[#333539] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#00d1ff] h-full"
                style={{ width: `${telemetry.gpuUsagePercent}%` }}
              />
            </div>
            <span className="text-[#e2e2e8] font-bold">{telemetry.gpuUsagePercent}%</span>
          </div>
        </div>

        <div className="flex justify-between items-center border-b border-[#3c494e]/50 pb-1.5">
          <span className="text-[#859399]">FPS</span>
          <span className="text-[#e2e2e8] font-bold">{telemetry.inferenceFps} FPS</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[#859399]">LATENCY</span>
          <span className="text-[#00d1ff] font-bold">{telemetry.latencyMs} ms</span>
        </div>
      </div>
    </div>
  );
};
