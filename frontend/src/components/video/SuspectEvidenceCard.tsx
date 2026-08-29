'use client';

import React from 'react';
import { AnprRecord } from '@/types';

export interface SuspectEvidenceCardProps {
  suspectName?: string;
  suspectId?: string;
  facialConfidence?: number;
  anprData?: AnprRecord;
  className?: string;
}

export const SuspectEvidenceCard: React.FC<SuspectEvidenceCardProps> = ({
  suspectName = 'Suspect #4',
  suspectId = 'ID: UNKNOWN_M_04',
  facialConfidence = 0.87,
  anprData = {
    plateNumber: 'JK-02-AB-1234',
    confidence: 0.962,
    isBlacklisted: true,
    watchlistReason: 'FLAG: STOLEN / RESTRICTED',
  },
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {/* 1. Facial Match Profile */}
      <div className="bg-[#111318] border border-[#3c494e] p-2.5 rounded flex gap-3">
        {/* Face Thumbnail with Scanning Mesh */}
        <div className="w-16 h-16 bg-[#282a2e] border border-[#3c494e]/70 relative shrink-0 overflow-hidden rounded-xs flex items-center justify-center">
          {/* Simulated Biometric Facial Mesh Canvas */}
          <svg className="w-12 h-12 text-[#ffb4ab]" viewBox="0 0 64 64" fill="none" stroke="currentColor">
            <circle cx="32" cy="24" r="14" strokeWidth="1.5" />
            <path d="M14 54 C14 42 22 38 32 38 C42 38 50 42 50 54" strokeWidth="1.5" />
            {/* Biometric Scanning Grid Mesh */}
            <circle cx="27" cy="22" r="1.5" fill="currentColor" />
            <circle cx="37" cy="22" r="1.5" fill="currentColor" />
            <line x1="32" y1="20" x2="32" y2="28" strokeWidth="1" strokeDasharray="1 1" />
            <line x1="28" y1="30" x2="36" y2="30" strokeWidth="1" />
            <circle cx="32" cy="24" r="18" stroke="#ff2d55" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
          </svg>
          <div className="absolute inset-0 border border-[#ffb4ab]/50" />
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[9px] font-bold text-[#00d1ff] uppercase tracking-wider">
              FACIAL MATCH
            </span>
            <span className="font-mono text-[10px] bg-[#333539] px-1.5 py-0.2 rounded text-[#e2e2e8] font-bold">
              {(facialConfidence * 100).toFixed(0)}%
            </span>
          </div>
          <div className="font-sans font-bold text-sm text-[#e2e2e8] truncate">
            {suspectName}
          </div>
          <div className="font-mono text-[9px] text-[#859399] tracking-wider">
            {suspectId}
          </div>
        </div>
      </div>

      {/* 2. ANPR Readout Profile */}
      <div className="bg-[#111318] border border-[#3c494e] p-2.5 rounded flex gap-3">
        {/* Plate Icon Thumbnail */}
        <div className="w-16 h-12 bg-[#282a2e] border border-[#3c494e]/70 shrink-0 overflow-hidden rounded-xs flex items-center justify-center p-1">
          <div className="w-full h-full bg-[#111318] border border-[#feb700] rounded-xs flex flex-col items-center justify-center">
            <span className="font-mono text-[6px] text-[#feb700] font-bold">IND</span>
            <span className="font-mono text-[8px] text-[#feb700] font-bold leading-none">
              {anprData.plateNumber.split(' ')[0]}
            </span>
          </div>
        </div>

        {/* Plate Details */}
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <span className="font-mono text-[9px] font-bold text-[#00d1ff] uppercase tracking-wider">
            ANPR READOUT
          </span>
          <div className="font-mono text-sm font-bold text-[#e2e2e8] tracking-widest truncate">
            {anprData.plateNumber}
          </div>
          <div className="font-mono text-[9px] text-[#ffb4ab] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab] animate-pulse" />
            {anprData.isBlacklisted ? 'FLAG: STOLEN / WATCHLIST' : 'REGISTERED VEHICLE'}
          </div>
        </div>
      </div>
    </div>
  );
};
