import React from 'react';

interface IncidentPopupProps {
  threatScore?: number;
  incidentType?: string;
  onIntercept?: () => void;
  onViewFeed?: () => void;
  className?: string;
}

export const IncidentPopup: React.FC<IncidentPopupProps> = ({
  threatScore = 95,
  incidentType = 'HUMAN BREACH',
  onIntercept,
  onViewFeed,
  className = '',
}) => {
  return (
    <div
      className={`bg-[#0f131a]/95 backdrop-blur-xl border border-[#ffb4ab]/50 glow-alert w-64 overflow-hidden shadow-2xl ${className}`}
    >
      <div className="bg-[#93000a]/30 px-3 py-2 flex justify-between items-center border-b border-[#ffb4ab]/30">
        <span className="font-mono text-[10px] text-[#ffb4ab] font-bold tracking-wider uppercase">
          INCIDENT DETECTED
        </span>
        <span className="material-symbols-outlined text-[#ffb4ab] text-sm pulse-dot">
          warning
        </span>
      </div>

      <div className="p-4">
        <div className="font-mono text-xs text-[#bbc9cf] mb-1">
          CRITICAL THREAT: <span className="text-[#ffb4ab] font-bold">{threatScore}</span>
        </div>
        <div className="font-sans text-base text-[#ffb4ab] font-bold mb-4 uppercase tracking-wide">
          {incidentType}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onIntercept}
            className="flex-1 bg-[#ffb4ab]/20 hover:bg-[#ffb4ab]/30 text-[#ffb4ab] border border-[#ffb4ab]/50 py-1.5 font-mono text-[11px] font-bold uppercase transition-colors cursor-pointer active:scale-95"
          >
            INTERCEPT
          </button>
          <button
            onClick={onViewFeed}
            className="flex-1 bg-[#1e2024] hover:bg-[#282a2e] text-[#e2e2e8] border border-[#3c494e] py-1.5 font-mono text-[11px] font-bold uppercase transition-colors cursor-pointer active:scale-95"
          >
            FEED
          </button>
        </div>
      </div>
    </div>
  );
};
