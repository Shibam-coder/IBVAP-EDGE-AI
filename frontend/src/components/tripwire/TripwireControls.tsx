'use client';

import React from 'react';
import { TripwireZone, TripwireDirection, SeverityLevel } from '@/types';

export interface TripwireControlsProps {
  /** Current drawing state */
  isDrawing: boolean;
  /** Toggle drawing mode */
  onToggleDrawing: () => void;
  /** Clear all custom tripwires */
  onClearTripwires: () => void;
  /** Active selected tripwire ID */
  selectedTripwireId?: string | null;
  /** List of tripwires */
  tripwires?: TripwireZone[];
  /** On select tripwire */
  onSelectTripwire?: (id: string | null) => void;
  /** On toggle tripwire active state */
  onToggleTripwireActive?: (id: string) => void;
  /** On delete selected tripwire */
  onDeleteTripwire?: (id: string) => void;
  /** Current draw direction */
  drawDirection?: TripwireDirection;
  /** Change draw direction */
  onChangeDrawDirection?: (dir: TripwireDirection) => void;
  /** Current draw severity */
  drawSeverity?: SeverityLevel;
  /** Change draw severity */
  onChangeDrawSeverity?: (sev: SeverityLevel) => void;
  /** Optional class name */
  className?: string;
}

export const TripwireControls: React.FC<TripwireControlsProps> = ({
  isDrawing,
  onToggleDrawing,
  onClearTripwires,
  selectedTripwireId,
  tripwires = [],
  onSelectTripwire,
  onToggleTripwireActive,
  onDeleteTripwire,
  drawDirection = 'INBOUND',
  onChangeDrawDirection,
  drawSeverity = 'CRITICAL',
  onChangeDrawSeverity,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <span className="font-mono text-[11px] font-bold tracking-wider text-[#bbc9cf] uppercase">
          Spatial Tripwires
        </span>
        <span className="font-mono text-[10px] text-[#00d1ff] bg-[#00d1ff]/10 px-1.5 py-0.5 rounded border border-[#00d1ff]/30">
          {tripwires.length} ACTIVE
        </span>
      </div>

      {/* Action Buttons: DRAW / CLEAR */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onToggleDrawing}
          className={`flex-1 py-1.5 px-2 border font-mono text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
            isDrawing
              ? 'bg-[#00d1ff] text-[#003543] border-[#00d1ff] shadow-[0_0_10px_rgba(0,209,255,0.4)]'
              : 'border-[#3c494e] text-[#e2e2e8] hover:border-[#00d1ff] hover:bg-[#1e2024]'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          {isDrawing ? 'CANCEL DRAW' : 'DRAW TRIPWIRE'}
        </button>

        <button
          type="button"
          onClick={onClearTripwires}
          className="py-1.5 px-3 border border-[#3c494e] hover:border-[#ffb4ab] hover:text-[#ffb4ab] text-[#bbc9cf] font-mono text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors hover:bg-[#93000a]/20"
          title="Clear all tripwires"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          CLEAR
        </button>
      </div>

      {/* Drawing Config Parameters (when drawing is enabled or for global defaults) */}
      <div className="bg-[#111318] border border-[#3c494e]/60 p-2 rounded flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="text-[#859399]">DIRECTION:</span>
          <div className="flex gap-1">
            {(['INBOUND', 'OUTBOUND', 'BIDIRECTIONAL'] as TripwireDirection[]).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => onChangeDrawDirection?.(dir)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition-colors ${
                  drawDirection === dir
                    ? 'bg-[#00d1ff]/20 text-[#00d1ff] border border-[#00d1ff]'
                    : 'text-[#859399] hover:text-white'
                }`}
              >
                {dir === 'BIDIRECTIONAL' ? 'BI-DIR' : dir}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="text-[#859399]">SEVERITY:</span>
          <div className="flex gap-1">
            {(['CRITICAL', 'HIGH', 'MEDIUM'] as SeverityLevel[]).map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => onChangeDrawSeverity?.(sev)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition-colors ${
                  drawSeverity === sev
                    ? sev === 'CRITICAL'
                      ? 'bg-[#93000a]/40 text-[#ffb4ab] border border-[#ffb4ab]'
                      : 'bg-[#feb700]/20 text-[#feb700] border border-[#feb700]'
                    : 'text-[#859399] hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List of active tripwires */}
      {tripwires.length > 0 && (
        <div className="flex flex-col gap-1 max-h-28 overflow-y-auto">
          {tripwires.map((tw) => {
            const isSelected = selectedTripwireId === tw.id;
            return (
              <div
                key={tw.id}
                onClick={() => onSelectTripwire?.(tw.id)}
                className={`flex items-center justify-between p-1.5 text-[10px] font-mono border rounded cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#00d1ff]/10 border-[#00d1ff] text-[#e2e2e8]'
                    : 'bg-[#1a1c20] border-[#3c494e]/60 text-[#bbc9cf] hover:border-[#859399]'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tw.color || (tw.severity === 'CRITICAL' ? '#ff2d55' : '#00d1ff') }}
                  />
                  <span className="truncate font-semibold">{tw.name}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[9px] text-[#859399]">{tw.direction}</span>
                  {onToggleTripwireActive && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTripwireActive(tw.id);
                      }}
                      className={`text-[9px] px-1 py-0.2 rounded ${
                        tw.isActive ? 'text-[#00d1ff]' : 'text-[#859399]'
                      }`}
                    >
                      {tw.isActive ? 'ON' : 'OFF'}
                    </button>
                  )}
                  {onDeleteTripwire && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTripwire(tw.id);
                      }}
                      className="text-[#ffb4ab] hover:text-white px-1"
                      title="Delete Tripwire"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
