'use client';

import React, { useState } from 'react';
import { CameraFeed, TripwireZone, ThreatAlert } from '@/types';
import { MOCK_CAMERA_FEEDS, MOCK_TRIPWIRES, MOCK_THREAT_ALERTS } from '@/data/mockData';
import { CameraGrid } from './CameraGrid';

export interface TacticalGridViewProps {
  cameras?: CameraFeed[];
  tripwires?: TripwireZone[];
  threatAlerts?: ThreatAlert[];
  onSelectCamera?: (camera: CameraFeed) => void;
  onDispatchAlert?: (alertId: string) => void;
  onAcknowledgeAlert?: (alertId: string) => void;
  className?: string;
}

export const TacticalGridView: React.FC<TacticalGridViewProps> = ({
  cameras = MOCK_CAMERA_FEEDS,
  tripwires = MOCK_TRIPWIRES,
  threatAlerts = MOCK_THREAT_ALERTS,
  onSelectCamera,
  onDispatchAlert,
  onAcknowledgeAlert,
  className = '',
}) => {
  const [activeAlertCamId] = useState<string>('CAM-01');

  return (
    <div className={`flex flex-col h-full w-full bg-[#05070A] text-[#e2e2e8] overflow-hidden ${className}`}>
      {/* Top Header Bar */}
      <header className="h-14 bg-[#111318] border-b border-[#3c494e] flex justify-between items-center px-4 shrink-0 z-40">
        <div className="flex items-center gap-6">
          <div className="font-mono text-lg font-bold text-[#00d1ff] tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00d1ff] animate-pulse" />
            IBVAP-EDGE AI
          </div>
          <nav className="hidden lg:flex gap-5 text-xs font-mono font-bold tracking-wider">
            <span className="text-[#00d1ff] border-b-2 border-[#00d1ff] pb-1 cursor-pointer">
              SURVEILLANCE GRID
            </span>
            <span className="text-[#859399] hover:text-[#e2e2e8] cursor-pointer transition-colors">
              RISK ANALYTICS
            </span>
            <span className="text-[#859399] hover:text-[#e2e2e8] cursor-pointer transition-colors">
              GIS MAP
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex gap-2">
            <span className="px-2 py-0.5 font-mono text-[10px] font-bold border border-[#ffb4ab]/40 text-[#ffb4ab] bg-[#93000a]/20 rounded">
              RESTRICTED SECTOR
            </span>
            <span className="px-2 py-0.5 font-mono text-[10px] font-bold border border-[#00d1ff]/40 text-[#00d1ff] bg-[#00d1ff]/10 rounded flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d1ff] animate-pulse" />
              NODE-01 ACTIVE
            </span>
          </div>
          <div className="font-mono text-xs text-[#bbc9cf] bg-[#1a1c20] px-2.5 py-1 rounded border border-[#3c494e]">
            IST 15:00:12
          </div>
        </div>
      </header>

      {/* Main Content Layout: 4-Channel Camera Grid + Right XAI Threat Feed */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left / Center 4-Cam Grid */}
        <div className="flex-1 h-full min-h-[400px] overflow-hidden p-1 bg-[#05070A]">
          <CameraGrid
            cameras={cameras}
            tripwires={tripwires}
            activeAlertCameraId={activeAlertCamId}
            onSelectCamera={onSelectCamera}
          />
        </div>

        {/* Right Sidebar: XAI Threat Feed & Evidence Snapshots */}
        <aside className="w-full lg:w-[360px] bg-[#1a1c20] border-l border-[#3c494e] flex flex-col shrink-0 overflow-y-auto">
          {/* Header */}
          <div className="p-3.5 border-b border-[#3c494e] sticky top-0 bg-[#1a1c20] z-10 flex justify-between items-center">
            <h2 className="font-mono text-xs font-bold tracking-wider text-[#e2e2e8] uppercase">
              XAI Threat Feed
            </h2>
            <span className="font-mono text-[10px] bg-[#93000a]/30 border border-[#ffb4ab]/40 text-[#ffb4ab] px-1.5 py-0.5 rounded font-bold">
              {threatAlerts.length} ACTIVE ALERTS
            </span>
          </div>

          {/* Incident Cards */}
          <div className="p-3 flex flex-col gap-3">
            {/* Incident 1: Critical Tripwire Breach */}
            <div className="border border-[#ffb4ab]/60 bg-[#93000a]/10 rounded flex flex-col overflow-hidden shadow-[0_0_12px_rgba(255,180,171,0.15)]">
              <div className="p-2.5 border-b border-[#ffb4ab]/20 flex justify-between items-start">
                <div>
                  <div className="font-mono text-[#ffb4ab] text-[10px] font-bold">
                    INCIDENT #T-882
                  </div>
                  <div className="font-mono text-xs font-bold text-[#e2e2e8]">
                    FENCE PERIMETER BREACH
                  </div>
                  <div className="font-mono text-[9px] text-[#859399] mt-0.5">
                    CAM-01 FENCE EAST // SECTOR-07G
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xl font-bold text-[#ffb4ab] leading-none">
                    95
                  </div>
                  <div className="font-mono text-[8px] text-[#ffb4ab] font-bold mt-0.5 uppercase">
                    CRITICAL
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1 w-full bg-[#333539]">
                <div className="h-full bg-[#ffb4ab]" style={{ width: '95%' }} />
              </div>

              {/* XAI Explanation */}
              <div className="p-2.5 bg-[#1e2024]/60">
                <div className="font-mono text-[9px] font-bold text-[#00d1ff] mb-1.5 uppercase tracking-wider">
                  AI EXPLANATION
                </div>
                <ul className="font-mono text-[10px] text-[#bbc9cf] space-y-1">
                  <li className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#00d1ff]" />
                    <span>Human class conf: 0.97</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#ffb4ab]" />
                    <span>
                      Velocity: <strong className="text-[#ffb4ab]">2.4 m/s (Running)</strong>
                    </span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#00d1ff]" />
                    <span>Trajectory intersects Tripwire Outer Perimeter Alpha</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="p-2 border-t border-[#ffb4ab]/20 flex gap-2">
                <button
                  type="button"
                  onClick={() => onSelectCamera && onSelectCamera(cameras[0])}
                  className="flex-1 py-1.5 font-mono text-[10px] font-bold border border-[#3c494e] hover:border-[#00d1ff] text-[#e2e2e8] rounded transition-colors text-center cursor-pointer"
                >
                  FOCUS FEED
                </button>
                <button
                  type="button"
                  onClick={() => onDispatchAlert?.('T-882')}
                  className="flex-1 py-1.5 font-mono text-[10px] font-bold bg-[#ffb4ab] text-[#690005] hover:bg-[#ffdad6] rounded transition-colors text-center cursor-pointer"
                >
                  DISPATCH QRT
                </button>
              </div>
            </div>

            {/* Incident 2: Blacklist Vehicle */}
            <div className="border border-[#feb700]/50 bg-[#feb700]/10 rounded flex flex-col overflow-hidden">
              <div className="p-2.5 border-b border-[#feb700]/20 flex justify-between items-start">
                <div>
                  <div className="font-mono text-[#feb700] text-[10px] font-bold">
                    INCIDENT #T-881
                  </div>
                  <div className="font-mono text-xs font-bold text-[#e2e2e8]">
                    BLACKLIST VEHICLE DETECTED
                  </div>
                  <div className="font-mono text-[9px] text-[#859399] mt-0.5">
                    CAM-02 CHECKPOST GATE (ANPR)
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xl font-bold text-[#feb700] leading-none">
                    78
                  </div>
                  <div className="font-mono text-[8px] text-[#feb700] font-bold mt-0.5 uppercase">
                    HIGH
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1 w-full bg-[#333539]">
                <div className="h-full bg-[#feb700]" style={{ width: '78%' }} />
              </div>

              {/* XAI Explanation */}
              <div className="p-2.5 bg-[#1e2024]/60">
                <div className="font-mono text-[9px] font-bold text-[#00d1ff] mb-1.5 uppercase tracking-wider">
                  AI EXPLANATION
                </div>
                <ul className="font-mono text-[10px] text-[#bbc9cf] space-y-1">
                  <li className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#feb700]" />
                    <span>OCR conf 96.2% // Plate: WB 73 AQ 4412</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#feb700]" />
                    <span>Matched against National Security Watchlist Alpha</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="p-2 border-t border-[#feb700]/20 flex gap-2">
                <button
                  type="button"
                  onClick={() => onSelectCamera && onSelectCamera(cameras[1])}
                  className="flex-1 py-1.5 font-mono text-[10px] font-bold border border-[#3c494e] hover:border-[#feb700] text-[#e2e2e8] rounded transition-colors text-center cursor-pointer"
                >
                  VIEW RECORD
                </button>
                <button
                  type="button"
                  onClick={() => onAcknowledgeAlert?.('T-881')}
                  className="flex-1 py-1.5 font-mono text-[10px] font-bold border border-[#3c494e] hover:bg-[#333539] text-[#e2e2e8] rounded transition-colors text-center cursor-pointer"
                >
                  ACK
                </button>
              </div>
            </div>
          </div>

          {/* Latest Snapshots */}
          <div className="mt-auto border-t border-[#3c494e] p-3">
            <div className="flex justify-between items-center mb-2.5">
              <span className="font-mono text-[10px] font-bold text-[#bbc9cf] uppercase tracking-wider">
                Latest Snapshots
              </span>
              <span className="font-mono text-[9px] text-[#859399]">AUTO-CAPTURED</span>
            </div>

            <div className="flex gap-2">
              {/* ANPR Snapshot */}
              <div className="w-1/2 border border-[#3c494e] bg-[#111318] p-1.5 rounded flex flex-col items-center">
                <div className="w-full h-12 bg-[#282a2e] rounded-xs flex items-center justify-center font-mono font-bold text-xs text-[#feb700] border border-[#feb700]/40">
                  WB 73 AQ 4412
                </div>
                <div className="bg-[#feb700] text-[#412d00] font-mono text-[9px] font-bold mt-1 px-1 py-0.2 rounded w-full text-center">
                  WATCHLIST MATCH
                </div>
              </div>

              {/* Suspect Face Snapshot */}
              <div className="w-1/2 border border-[#3c494e] bg-[#111318] p-1.5 rounded flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-full border border-[#ffb4ab] overflow-hidden flex items-center justify-center bg-[#282a2e] text-[#ffb4ab]">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="font-mono text-[8px] text-[#00d1ff] border border-[#00d1ff]/40 px-1 py-0.2 rounded mt-1">
                  ID: UNKNOWN #H-207
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-7 bg-[#111318] border-t border-[#3c494e] flex justify-between items-center px-4 shrink-0 font-mono text-[10px] text-[#859399]">
        <div className="flex items-center gap-2 text-[#00d1ff]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d1ff]" />
          <span>ENCRYPTED MESH ACTIVE // LATENCY 18.4ms</span>
        </div>
        <div className="flex gap-4">
          <span className="text-[#e2e2e8]">NODE-01: OK</span>
          <span className="text-[#e2e2e8]">NODE-02: OK</span>
          <span className="text-[#e2e2e8]">NODE-03: READY</span>
        </div>
      </footer>
    </div>
  );
};
