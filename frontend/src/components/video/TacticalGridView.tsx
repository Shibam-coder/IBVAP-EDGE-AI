'use client';

import React, { useState } from 'react';
import { CameraFeed, TripwireZone, ThreatAlert } from '@/types';
import { MOCK_CAMERA_FEEDS, MOCK_TRIPWIRES, MOCK_THREAT_ALERTS } from '@/data/mockData';
import { CameraGrid } from './CameraGrid';
import { useVideoTelemetry } from '@/hooks/useVideoTelemetry';

export interface TacticalGridViewProps {
  cameras?: CameraFeed[];
  tripwires?: TripwireZone[];
  threatAlerts?: ThreatAlert[];
  onSelectCamera?: (camera: CameraFeed) => void;
  onNavigateScreen?: (screen: string) => void;
  onDispatchAlert?: (alertId: string) => void;
  onAcknowledgeAlert?: (alertId: string) => void;
  className?: string;
}

export const TacticalGridView: React.FC<TacticalGridViewProps> = ({
  cameras = MOCK_CAMERA_FEEDS,
  tripwires = MOCK_TRIPWIRES,
  threatAlerts = MOCK_THREAT_ALERTS,
  onSelectCamera,
  onNavigateScreen,
  onDispatchAlert,
  onAcknowledgeAlert,
  className = '',
}) => {
  const [activeAlertCamId] = useState<string>('CAM-01');
  const { gridDetections, isLive } = useVideoTelemetry();

  return (
    <div className={`flex h-screen w-screen bg-[#111318] text-[#e2e2e8] overflow-hidden select-none font-sans ${className}`}>
      {/* SideNavBar (Stitch Screen 2 exact replica) */}
      <nav className="hidden md:flex flex-col justify-between py-4 bg-[#1a1c20] border-r border-[#3c494e] w-16 xl:w-[240px] transition-all duration-300 z-50 shrink-0">
        <div className="flex flex-col gap-4">
          {/* Operator Profile Tag */}
          <div className="px-4 mb-2 xl:flex xl:items-center xl:gap-3 hidden">
            <div className="w-8 h-8 rounded-full bg-[#a4e6ff] flex items-center justify-center text-[#003543] font-bold font-mono text-xs shadow-md">
              IBV
            </div>
            <div>
              <div className="font-mono text-[11px] font-bold text-[#00d1ff] tracking-wider">SECTOR-07</div>
              <div className="font-mono text-[9px] text-[#859399]">OPERATOR-42</div>
            </div>
          </div>
          <div className="px-4 mb-2 xl:hidden flex justify-center">
            <div className="w-8 h-8 rounded-full bg-[#a4e6ff] flex items-center justify-center text-[#003543] font-bold text-xs">
              IBV
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              className="bg-[#00d1ff]/10 text-[#00d1ff] border-l-4 border-[#00d1ff] px-4 py-3 flex items-center gap-3 xl:justify-start justify-center group translate-x-0.5 text-left cursor-pointer"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider hidden xl:block">
                Live Feed
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateScreen?.('THREAT_INTEL')}
              className="text-[#bbc9cf] hover:text-[#e2e2e8] px-4 py-3 flex items-center gap-3 xl:justify-start justify-center hover:bg-[#282a2e] transition-all group border-l-4 border-transparent text-left cursor-pointer"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider hidden xl:block">
                Threat Intel
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateScreen?.('ASSET_TRACKING')}
              className="text-[#bbc9cf] hover:text-[#e2e2e8] px-4 py-3 flex items-center gap-3 xl:justify-start justify-center hover:bg-[#282a2e] transition-all group border-l-4 border-transparent text-left cursor-pointer"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider hidden xl:block">
                Asset Tracking
              </span>
            </button>

            <button
              type="button"
              className="text-[#bbc9cf] hover:text-[#e2e2e8] px-4 py-3 flex items-center gap-3 xl:justify-start justify-center hover:bg-[#282a2e] transition-all group border-l-4 border-transparent text-left cursor-pointer"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider hidden xl:block">
                System Health
              </span>
            </button>

            <button
              type="button"
              className="text-[#bbc9cf] hover:text-[#e2e2e8] px-4 py-3 flex items-center gap-3 xl:justify-start justify-center hover:bg-[#282a2e] transition-all group border-l-4 border-transparent text-left cursor-pointer"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider hidden xl:block">
                Archives
              </span>
            </button>
          </div>
        </div>

        {/* Bottom Menu Items */}
        <div className="flex flex-col gap-1 mt-auto">
          <button
            type="button"
            className="text-[#bbc9cf] hover:text-[#e2e2e8] px-4 py-3 flex items-center gap-3 xl:justify-start justify-center hover:bg-[#282a2e] transition-all group border-l-4 border-transparent text-left cursor-pointer"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider hidden xl:block">
              Diagnostics
            </span>
          </button>
          <button
            type="button"
            className="text-[#bbc9cf] hover:text-[#e2e2e8] px-4 py-3 flex items-center gap-3 xl:justify-start justify-center hover:bg-[#282a2e] transition-all group border-l-4 border-transparent text-left cursor-pointer"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider hidden xl:block">
              Help
            </span>
          </button>
        </div>
      </nav>

      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* TopNavBar Header (Stitch Screen 2 replica) */}
        <header className="h-16 bg-[#111318] border-b border-[#3c494e] flex justify-between items-center w-full px-6 shrink-0 z-40">
          <div className="flex items-center gap-6">
            <div className="font-sans text-xl font-bold text-[#a4e6ff] tracking-tight">
              IBVAP-EDGE AI
            </div>
            <nav className="hidden lg:flex gap-6">
              <span className="font-mono text-[11px] font-bold text-[#00d1ff] border-b-2 border-[#00d1ff] py-4 cursor-pointer">
                SURVEILLANCE
              </span>
              <span
                onClick={() => onNavigateScreen?.('RISK_ANALYTICS')}
                className="font-mono text-[11px] font-bold text-[#bbc9cf] hover:text-[#00d1ff] transition-colors py-4 border-b-2 border-transparent cursor-pointer"
              >
                RISK ANALYTICS
              </span>
              <span
                onClick={() => onNavigateScreen?.('GIS_MAP')}
                className="font-mono text-[11px] font-bold text-[#bbc9cf] hover:text-[#00d1ff] transition-colors py-4 border-b-2 border-transparent cursor-pointer"
              >
                GIS MAP
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex gap-2">
              <span className="px-3 py-1 font-mono text-[11px] font-bold border border-[#3c494e] text-[#ffb4ab] bg-[#93000a]/10 rounded-xs">
                RESTRICTED
              </span>
              <span className="px-3 py-1 font-mono text-[11px] font-bold border border-[#a4e6ff] text-[#a4e6ff] bg-[#a4e6ff]/10 flex items-center gap-1.5 rounded-xs">
                <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-[#00d1ff]' : 'bg-[#a4e6ff]'} animate-pulse`} />
                {isLive ? 'LIVE MESH' : 'ND-01'}
              </span>
            </div>
            <div className="font-mono text-sm text-[#bbc9cf]">
              IST 15:00:12
            </div>
            <div className="flex gap-1 text-[#bbc9cf]">
              <button type="button" className="p-2 hover:text-[#00d1ff] transition-colors" title="Notifications">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <button type="button" className="p-2 hover:text-[#00d1ff] transition-colors" title="Settings">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Center Grid Layout + Right Sidebar */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#05070A]">
          {/* 4-Channel Camera Grid */}
          <div className="flex-1 h-full min-h-[400px] overflow-hidden">
            <CameraGrid
              cameras={cameras}
              tripwires={tripwires}
              detections={gridDetections}
              activeAlertCameraId={activeAlertCamId}
              onSelectCamera={onSelectCamera}
            />
          </div>

          {/* Right Sidebar: XAI Threat Feed & Evidence Snapshots (Stitch exact layout) */}
          <aside className="w-full lg:w-[360px] bg-[#1a1c20] border-l border-[#3c494e] flex flex-col shrink-0 overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-[#3c494e] sticky top-0 bg-[#1a1c20] z-10 flex justify-between items-center">
              <h2 className="font-sans text-xl font-bold text-[#e2e2e8]">XAI THREAT FEED</h2>
              <span className="font-mono text-[10px] bg-[#93000a]/30 border border-[#ffb4ab]/40 text-[#ffb4ab] px-2 py-0.5 rounded font-bold">
                {threatAlerts.length} ALERTS
              </span>
            </div>

            {/* Incidents List */}
            <div className="p-4 flex flex-col gap-4">
              {/* Incident 1: #T-882 */}
              <div className="border border-[#ffb4ab]/50 bg-[#93000a]/10 flex flex-col rounded-xs overflow-hidden">
                <div className="p-3 border-b border-[#ffb4ab]/20 flex justify-between items-start">
                  <div>
                    <div className="font-mono text-[#ffb4ab] text-xs mb-1 font-bold">INCIDENT #T-882</div>
                    <div className="font-mono text-[11px] font-bold text-[#e2e2e8] uppercase">
                      FENCE PERIMETER BREACH
                    </div>
                    <div className="font-mono text-[9px] text-[#859399] mt-1">CAM-01 FENCE EAST</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-2xl font-bold text-[#ffb4ab] leading-none">95</div>
                    <div className="font-mono text-[8px] text-[#ffb4ab] font-bold mt-1 uppercase">CRITICAL</div>
                  </div>
                </div>

                <div className="h-1 w-full bg-[#333539]">
                  <div className="h-full bg-[#ffb4ab]" style={{ width: '95%' }} />
                </div>

                <div className="p-3 bg-[#1e2024]/50">
                  <div className="font-mono text-[11px] font-bold text-[#00d1ff] mb-2 uppercase tracking-wider">
                    AI EXPLANATION
                  </div>
                  <ul className="list-disc list-inside font-mono text-[11px] text-[#bbc9cf] space-y-1">
                    <li>Human class conf 0.97</li>
                    <li>
                      Velocity <span className="text-[#ffb4ab] font-bold">2.4 m/s</span> (Running)
                    </li>
                    <li>Trajectory intersects Tripwire L-1</li>
                  </ul>
                </div>

                <div className="p-3 border-t border-[#ffb4ab]/20 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectCamera && onSelectCamera(cameras[0])}
                    className="flex-1 py-2 font-mono text-[11px] font-bold border border-[#3c494e] text-[#e2e2e8] hover:bg-[#333539] transition-colors rounded-xs cursor-pointer"
                  >
                    5s REWIND
                  </button>
                  <button
                    type="button"
                    onClick={() => onDispatchAlert?.('T-882')}
                    className="flex-1 py-2 font-mono text-[11px] font-bold bg-[#ffb4ab] text-[#690005] hover:bg-[#ffdad6] transition-colors rounded-xs cursor-pointer"
                  >
                    DISPATCH QRT
                  </button>
                </div>
              </div>

              {/* Incident 2: #T-881 */}
              <div className="border border-[#feb700]/50 bg-[#feb700]/10 flex flex-col rounded-xs overflow-hidden">
                <div className="p-3 border-b border-[#feb700]/20 flex justify-between items-start">
                  <div>
                    <div className="font-mono text-[#feb700] text-xs mb-1 font-bold">INCIDENT #T-881</div>
                    <div className="font-mono text-[11px] font-bold text-[#e2e2e8] uppercase">
                      BLACKLIST VEHICLE
                    </div>
                    <div className="font-mono text-[9px] text-[#859399] mt-1">CAM-02 CHECKPOST</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-2xl font-bold text-[#feb700] leading-none">78</div>
                    <div className="font-mono text-[8px] text-[#feb700] font-bold mt-1 uppercase">HIGH</div>
                  </div>
                </div>

                <div className="h-1 w-full bg-[#333539]">
                  <div className="h-full bg-[#feb700]" style={{ width: '78%' }} />
                </div>

                <div className="p-3 bg-[#1e2024]/50">
                  <div className="font-mono text-[11px] font-bold text-[#00d1ff] mb-2 uppercase tracking-wider">
                    AI EXPLANATION
                  </div>
                  <ul className="list-disc list-inside font-mono text-[11px] text-[#bbc9cf] space-y-1">
                    <li>OCR conf 96.2%</li>
                    <li>Plate matches DB-Watchlist-Alpha</li>
                  </ul>
                </div>

                <div className="p-3 border-t border-[#feb700]/20 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectCamera && onSelectCamera(cameras[1])}
                    className="flex-1 py-2 font-mono text-[11px] font-bold border border-[#3c494e] text-[#e2e2e8] hover:bg-[#333539] transition-colors rounded-xs cursor-pointer"
                  >
                    VIEW RECORD
                  </button>
                  <button
                    type="button"
                    onClick={() => onAcknowledgeAlert?.('T-881')}
                    className="flex-1 py-2 font-mono text-[11px] font-bold border border-[#3c494e] text-[#e2e2e8] hover:bg-[#333539] transition-colors rounded-xs cursor-pointer"
                  >
                    ACK
                  </button>
                </div>
              </div>
            </div>

            {/* Latest Snapshots (Stitch replica) */}
            <div className="mt-auto border-t border-[#3c494e] p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="font-mono text-[11px] font-bold text-[#bbc9cf] uppercase tracking-wider">
                  LATEST SNAPSHOTS
                </div>
                <svg className="w-4 h-4 text-[#bbc9cf]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>

              <div className="flex gap-2">
                {/* Plate snapshot */}
                <div className="w-1/2 border border-[#3c494e] bg-[#111318] p-1 rounded-xs">
                  <div
                    className="w-full h-16 bg-cover bg-center grayscale opacity-80 rounded-xs"
                    style={{
                      backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAGmdVP99GAeqJg4sxrptW7LFzBi_e8l66Ues1joz3r_dWT10xgzfquZoALW7Nhm9Vme6VB0rpof1uNrfVhrmaAzOt11wbNkbDC6rcK9Q-9NF0zKeKVWNFPKU_kpOI8np1XfBZyP3ilZGnetoihyjynJMmwX8jaoQYCCXeG9DxV8jVfqt5NNf79G7-7sDFs6TtUYGIkgcOo_vp9rnwmBy1hmtgTw3_B5-4wJEN3auX67CaQyWZK3ax02w')`,
                    }}
                  />
                  <div className="bg-[#feb700] text-[#412d00] text-center font-mono text-[10px] font-bold mt-1 py-0.5 rounded-xs">
                    WB 73 AQ 4412
                  </div>
                </div>

                {/* Suspect Face snapshot */}
                <div className="w-1/2 border border-[#3c494e] bg-[#111318] p-1 rounded-xs flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full border border-[#3c494e] overflow-hidden mb-1">
                    <div
                      className="w-full h-full bg-cover bg-center grayscale opacity-60"
                      style={{
                        backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuB6uKMoBl6c2d3K1hBnHgMdXoaRNMNJVqa0PMNtGsVBKjakDLwOkwHBXQQbVctb0ObHCJCa4zs0fGsAWLYjvqeln1WB_SNeB3H5z1Bkqp4a1IxxBWJDmiwCuRBN8mfPtiiQSno8xQGJQvwpQSd9WOyEYczjyKdtDMWAH4m5CoxgFykLjJY_XbW8vV3uBrGri60HNu77yEVKQ6p8Vy5lr0qC06vY575CeIqnUwYyIEOXPpow5WxSO6cQ7Q')`,
                      }}
                    />
                  </div>
                  <div className="font-mono text-[8px] text-[#00d1ff] border border-[#00d1ff]/50 px-1.5 py-0.2 rounded-xs">
                    ID: UNKNOWN
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Bottom Status Bar (Stitch Screen 2 replica) */}
        <footer className="h-8 bg-[#111318] border-t border-[#3c494e] flex justify-between items-center px-4 shrink-0 font-mono text-[10px] text-[#859399]">
          <div className="flex gap-4 items-center">
            <span className="flex items-center gap-1.5 text-[#00d1ff]">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              ENCRYPTED MESH ACTIVE
            </span>
          </div>
          <div className="flex gap-4">
            <span className="text-[#e2e2e8]">NODE-01: OK</span>
            <span className="text-[#e2e2e8]">NODE-02: OK</span>
          </div>
        </footer>
      </main>
    </div>
  );
};
