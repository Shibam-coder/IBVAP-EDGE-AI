'use client';

import React from 'react';

export interface ActivityEvent {
  id: string;
  time: string;
  label: string;
  type: 'CRITICAL' | 'PRIMARY' | 'DEFAULT';
}

export interface ActivityLogWidgetProps {
  events?: ActivityEvent[];
  className?: string;
}

const DEFAULT_EVENTS: ActivityEvent[] = [
  { id: '1', time: '14:02:11', label: 'BREACH DETECTED', type: 'CRITICAL' },
  { id: '2', time: '14:01:45', label: 'OBJ TRACKING INIT', type: 'PRIMARY' },
  { id: '3', time: '14:00:00', label: 'SECTOR SCAN COMP', type: 'DEFAULT' },
  { id: '4', time: '13:55:12', label: 'PTZ CALIBRATION', type: 'DEFAULT' },
];

export const ActivityLogWidget: React.FC<ActivityLogWidgetProps> = ({
  events = DEFAULT_EVENTS,
  className = '',
}) => {
  return (
    <div className={`bg-[#1a1c20] border border-[#3c494e] flex flex-col flex-1 min-h-[140px] ${className}`}>
      {/* Header */}
      <div className="p-2.5 border-b border-[#3c494e] flex justify-between items-center">
        <span className="font-mono text-[11px] font-bold tracking-wider text-[#bbc9cf] uppercase">
          Activity Log
        </span>
        <span className="font-mono text-[10px] text-[#00d1ff] font-bold animate-pulse flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d1ff]" />
          LIVE
        </span>
      </div>

      {/* Log Items List */}
      <div className="p-2 flex flex-col gap-1.5 font-mono text-[10px] overflow-y-auto max-h-48">
        {events.map((ev) => {
          const isCrit = ev.type === 'CRITICAL';
          const isPrimary = ev.type === 'PRIMARY';

          return (
            <div
              key={ev.id}
              className={`flex gap-2 p-1.5 rounded-xs transition-colors ${
                isCrit
                  ? 'bg-[#93000a]/20 text-[#ffb4ab] border-l-2 border-[#ffb4ab]'
                  : isPrimary
                  ? 'bg-[#00d1ff]/10 text-[#00d1ff] border-l-2 border-[#00d1ff]'
                  : 'text-[#bbc9cf] border-l-2 border-[#3c494e]'
              }`}
            >
              <span className="w-14 shrink-0 opacity-75">{ev.time}</span>
              <span className="font-semibold truncate">{ev.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
