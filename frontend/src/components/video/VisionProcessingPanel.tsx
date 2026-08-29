'use client';

import React from 'react';
import { VisionFiltersState } from './VideoViewport';

export interface VisionProcessingPanelProps {
  filters: VisionFiltersState;
  onToggleFilter: (filterKey: keyof VisionFiltersState) => void;
  className?: string;
}

export const VisionProcessingPanel: React.FC<VisionProcessingPanelProps> = ({
  filters,
  onToggleFilter,
  className = '',
}) => {
  return (
    <div className={`bg-[#1a1c20] border border-[#3c494e] flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-2.5 border-b border-[#3c494e] flex justify-between items-center">
        <span className="font-mono text-[11px] font-bold tracking-wider text-[#bbc9cf] uppercase">
          Vision Processing
        </span>
        <span className="font-mono text-[9px] text-[#00d1ff] bg-[#00d1ff]/10 px-1.5 py-0.5 rounded">
          AI ENHANCED
        </span>
      </div>

      {/* Filter Toggles */}
      <div className="p-3 flex flex-col gap-3">
        {/* De-Haze (AI) */}
        <div className="flex justify-between items-center">
          <div>
            <div className="font-mono text-xs font-semibold text-[#e2e2e8]">De-Haze (AI)</div>
            <div className="font-mono text-[9px] text-[#859399]">Atmospheric scattering removal</div>
          </div>
          <button
            type="button"
            onClick={() => onToggleFilter('deHaze')}
            className={`w-9 h-5 rounded-full relative transition-colors duration-200 cursor-pointer ${
              filters.deHaze ? 'bg-[#00d1ff]' : 'bg-[#333539] border border-[#3c494e]'
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-200 ${
                filters.deHaze
                  ? 'right-0.5 bg-[#003543]'
                  : 'left-0.5 bg-[#859399]'
              }`}
            />
          </button>
        </div>

        {/* CLAHE Filter */}
        <div className="flex justify-between items-center">
          <div>
            <div className="font-mono text-xs font-semibold text-[#e2e2e8]">CLAHE Filter</div>
            <div className="font-mono text-[9px] text-[#859399]">Adaptive histogram equalization</div>
          </div>
          <button
            type="button"
            onClick={() => onToggleFilter('clahe')}
            className={`w-9 h-5 rounded-full relative transition-colors duration-200 cursor-pointer ${
              filters.clahe ? 'bg-[#00d1ff]' : 'bg-[#333539] border border-[#3c494e]'
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-200 ${
                filters.clahe
                  ? 'right-0.5 bg-[#003543]'
                  : 'left-0.5 bg-[#859399]'
              }`}
            />
          </button>
        </div>

        {/* IR Overlay */}
        <div className="flex justify-between items-center">
          <div>
            <div className="font-mono text-xs font-semibold text-[#e2e2e8]">IR Overlay</div>
            <div className="font-mono text-[9px] text-[#859399]">Thermal pseudocolor spectrum</div>
          </div>
          <button
            type="button"
            onClick={() => onToggleFilter('irOverlay')}
            className={`w-9 h-5 rounded-full relative transition-colors duration-200 cursor-pointer ${
              filters.irOverlay ? 'bg-[#00d1ff]' : 'bg-[#333539] border border-[#3c494e]'
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-200 ${
                filters.irOverlay
                  ? 'right-0.5 bg-[#003543]'
                  : 'left-0.5 bg-[#859399]'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
