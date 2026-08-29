'use client';

import React, { useState } from 'react';
import { CameraFeed, TripwireZone, TripwireDirection, SeverityLevel } from '@/types';
import { MOCK_CAMERA_FEEDS, MOCK_TRIPWIRES } from '@/data/mockData';
import { VideoFocusStage } from './VideoFocusStage';
import { CameraSelectorList } from './CameraSelectorList';
import { VisionProcessingPanel } from './VisionProcessingPanel';
import { NodeTelemetryWidget } from './NodeTelemetryWidget';
import { SuspectEvidenceCard } from './SuspectEvidenceCard';
import { ActivityLogWidget } from './ActivityLogWidget';
import { EvidenceHashFooter } from './EvidenceHashFooter';
import { TripwireControls } from '../tripwire/TripwireControls';
import { TripwireBreachEvent } from '../tripwire/SpatialTripwireOverlay';
import { VisionFiltersState } from './VideoViewport';

export interface CommandCenterFocusViewProps {
  initialCamera?: CameraFeed;
  cameras?: CameraFeed[];
  initialTripwires?: TripwireZone[];
  onBackToGrid?: () => void;
  onNavigateScreen?: (screen: string) => void;
  onTripwireBreach?: (event: TripwireBreachEvent) => void;
  className?: string;
}

export const CommandCenterFocusView: React.FC<CommandCenterFocusViewProps> = ({
  initialCamera,
  cameras = MOCK_CAMERA_FEEDS,
  initialTripwires = MOCK_TRIPWIRES,
  onBackToGrid,
  onNavigateScreen,
  onTripwireBreach,
  className = '',
}) => {
  const [selectedCamera, setSelectedCamera] = useState<CameraFeed>(
    initialCamera || cameras[0] || MOCK_CAMERA_FEEDS[0]
  );
  const [tripwires, setTripwires] = useState<TripwireZone[]>(initialTripwires);
  const [isDrawingTripwire, setIsDrawingTripwire] = useState<boolean>(false);
  const [drawDirection, setDrawDirection] = useState<TripwireDirection>('INBOUND');
  const [drawSeverity, setDrawSeverity] = useState<SeverityLevel>('CRITICAL');
  const [selectedTripwireId, setSelectedTripwireId] = useState<string | null>(null);

  // Mock Breach Demonstration State (Toggle between NORMAL and BREACH state for UI testing)
  const [isDemoBreachActive, setIsDemoBreachActive] = useState<boolean>(true);

  const [filters, setFilters] = useState<VisionFiltersState>({
    deHaze: true,
    clahe: false,
    irOverlay: false,
  });

  const handleToggleFilter = (key: keyof VisionFiltersState) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTripwireCreated = (newTripwire: Omit<TripwireZone, 'id'>) => {
    const created: TripwireZone = {
      ...newTripwire,
      id: `TW-CUSTOM-${Date.now().toString().slice(-4)}`,
    };
    setTripwires((prev) => [...prev, created]);
    setIsDrawingTripwire(false);
  };

  const handleClearTripwires = () => {
    setTripwires([]);
    setSelectedTripwireId(null);
  };

  const handleDeleteTripwire = (id: string) => {
    setTripwires((prev) => prev.filter((tw) => tw.id !== id));
    if (selectedTripwireId === id) setSelectedTripwireId(null);
  };

  const handleToggleTripwireActive = (id: string) => {
    setTripwires((prev) =>
      prev.map((tw) => (tw.id === id ? { ...tw, isActive: !tw.isActive } : tw))
    );
  };

  return (
    <div className={`flex flex-col h-screen w-screen bg-[#111318] text-[#e2e2e8] overflow-hidden select-none font-sans ${className}`}>
      {/* TopNavBar (Stitch Screen 3 replica) */}
      <header className="h-16 bg-[#111318] border-b border-[#3c494e] flex justify-between items-center w-full px-6 shrink-0 z-50">
        <div className="flex items-center gap-8">
          <div className="font-sans text-xl font-bold text-[#a4e6ff] tracking-tight">
            IBVAP-EDGE AI
          </div>
          <nav className="hidden md:flex gap-6 items-center">
            {onBackToGrid ? (
              <button
                type="button"
                onClick={onBackToGrid}
                className="text-[#bbc9cf] hover:text-[#00d1ff] font-mono text-[11px] font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
              >
                ← SURVEILLANCE GRID
              </button>
            ) : (
              <span
                onClick={() => onNavigateScreen?.('SURVEILLANCE')}
                className="text-[#bbc9cf] hover:text-[#00d1ff] font-mono text-[11px] font-bold uppercase transition-colors cursor-pointer"
              >
                SURVEILLANCE
              </span>
            )}
            <span
              onClick={() => onNavigateScreen?.('RISK_ANALYTICS')}
              className="text-[#bbc9cf] hover:text-[#00d1ff] font-mono text-[11px] font-bold uppercase transition-colors cursor-pointer"
            >
              RISK ANALYTICS
            </span>
            <span
              onClick={() => onNavigateScreen?.('GIS_MAP')}
              className="text-[#bbc9cf] hover:text-[#00d1ff] font-mono text-[11px] font-bold uppercase transition-colors cursor-pointer"
            >
              GIS MAP
            </span>
            <span className="text-[#a4e6ff] border-b-2 border-[#a4e6ff] pb-1 font-mono text-[11px] font-bold uppercase">
              LIVE COMMAND CENTER
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Mock Demonstration Mode Quick Toggle */}
          <div className="flex items-center gap-1.5 bg-[#1a1c20] border border-[#3c494e] p-1 rounded">
            <span className="font-mono text-[9px] text-[#859399] uppercase px-1">DEMO STATE:</span>
            <button
              type="button"
              onClick={() => setIsDemoBreachActive(!isDemoBreachActive)}
              className={`px-2 py-0.5 font-mono text-[9px] font-bold uppercase rounded transition-all cursor-pointer ${
                isDemoBreachActive
                  ? 'bg-[#93000a] text-[#ffdad6] border border-[#ffb4ab]'
                  : 'bg-[#00d1ff]/20 text-[#00d1ff] border border-[#00d1ff]'
              }`}
            >
              {isDemoBreachActive ? 'BREACH ACTIVE' : 'NORMAL / SECURE'}
            </button>
          </div>

          <div className="flex gap-1 text-[#bbc9cf]">
            <button type="button" className="p-1 hover:text-[#00d1ff] transition-colors" title="Notifications">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button type="button" className="p-1 hover:text-[#00d1ff] transition-colors" title="Settings">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </button>
          </div>
          <div className="font-mono text-xs border border-[#3c494e] px-3 py-1 rounded text-[#a4e6ff]">
            17:22:09 UTC
          </div>
        </div>
      </header>

      {/* Main Command Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* SideNavBar (Stitch Screen 3 replica) */}
        <aside className="bg-[#1a1c20] border-r border-[#3c494e] flex flex-col justify-between py-4 w-16 xl:w-[240px] shrink-0 z-40 hidden md:flex transition-all duration-300">
          <div>
            <div className="px-4 mb-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#37393e] flex items-center justify-center border border-[#a4e6ff]/30 text-[#a4e6ff]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="hidden xl:block">
                <div className="font-mono text-[11px] font-bold text-[#a4e6ff]">SECTOR-07</div>
                <div className="font-mono text-[10px] text-[#859399]">OPERATOR-42</div>
              </div>
            </div>

            <nav className="flex flex-col gap-1">
              <button
                type="button"
                className="bg-[#00d1ff]/10 text-[#00d1ff] border-l-4 border-[#00d1ff] px-4 py-3 font-mono text-[11px] font-bold uppercase flex items-center gap-3 text-left w-full cursor-pointer"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                <span className="hidden xl:block">Live Feed</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateScreen?.('THREAT_INTEL')}
                className="text-[#bbc9cf] hover:text-[#e2e2e8] hover:bg-[#282a2e] transition-all px-4 py-3 flex items-center gap-3 font-mono text-[11px] font-bold uppercase text-left w-full cursor-pointer"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="hidden xl:block">Threat Intel</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateScreen?.('ASSET_TRACKING')}
                className="text-[#bbc9cf] hover:text-[#e2e2e8] hover:bg-[#282a2e] transition-all px-4 py-3 flex items-center gap-3 font-mono text-[11px] font-bold uppercase text-left w-full cursor-pointer"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden xl:block">Asset Tracking</span>
              </button>

              <button
                type="button"
                className="text-[#bbc9cf] hover:text-[#e2e2e8] hover:bg-[#282a2e] transition-all px-4 py-3 flex items-center gap-3 font-mono text-[11px] font-bold uppercase text-left w-full cursor-pointer"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
                <span className="hidden xl:block">System Health</span>
              </button>

              <button
                type="button"
                className="text-[#bbc9cf] hover:text-[#e2e2e8] hover:bg-[#282a2e] transition-all px-4 py-3 flex items-center gap-3 font-mono text-[11px] font-bold uppercase text-left w-full cursor-pointer"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden xl:block">Archives</span>
              </button>
            </nav>
          </div>

          <div className="px-4 flex flex-col gap-4">
            <button
              type="button"
              className="w-full py-2 border border-[#ffb4ab] text-[#ffb4ab] font-mono text-[11px] font-bold uppercase hover:bg-[#ffb4ab]/10 transition-colors rounded-xs cursor-pointer"
            >
              DEPLOY RAPID RESPONSE
            </button>
            <div className="flex flex-col gap-2 font-mono text-xs text-[#bbc9cf]">
              <button type="button" className="hover:text-[#e2e2e8] flex items-center gap-2 text-left cursor-pointer">
                <span>Diagnostics</span>
              </button>
              <button type="button" className="hover:text-[#e2e2e8] flex items-center gap-2 text-left cursor-pointer">
                <span>Help</span>
              </button>
            </div>
          </div>
        </aside>

        {/* 3-Column Command Stage (Stitch Screen 3 layout) */}
        <main className="flex-1 bg-[#111318] p-1 flex flex-col lg:flex-row gap-1 overflow-hidden">
          {/* Left Sub-Panel: Camera Grid + Vision Processing + Spatial Tripwires + Node Telemetry (w-[300px]) */}
          <div className="w-full lg:w-[300px] flex flex-col gap-1 shrink-0 overflow-y-auto max-h-full">
            {/* Camera Grid Switcher */}
            <CameraSelectorList
              cameras={cameras}
              selectedCameraId={selectedCamera.id}
              onSelectCamera={setSelectedCamera}
            />

            {/* Vision Processing Controls */}
            <VisionProcessingPanel
              filters={filters}
              onToggleFilter={handleToggleFilter}
            />

            {/* Spatial Tripwires Controls */}
            <div className="bg-[#1a1c20] border border-[#3c494e] p-2.5 rounded-xs">
              <TripwireControls
                isDrawing={isDrawingTripwire}
                onToggleDrawing={() => setIsDrawingTripwire(!isDrawingTripwire)}
                onClearTripwires={handleClearTripwires}
                tripwires={tripwires}
                selectedTripwireId={selectedTripwireId}
                onSelectTripwire={setSelectedTripwireId}
                onToggleTripwireActive={handleToggleTripwireActive}
                onDeleteTripwire={handleDeleteTripwire}
                drawDirection={drawDirection}
                onChangeDrawDirection={setDrawDirection}
                drawSeverity={drawSeverity}
                onChangeDrawSeverity={setDrawSeverity}
              />
            </div>

            {/* Node Telemetry */}
            <NodeTelemetryWidget />
          </div>

          {/* Center Main Video Stage */}
          <div className="flex-1 flex flex-col h-full min-h-[400px] overflow-hidden">
            <VideoFocusStage
              camera={selectedCamera}
              tripwires={tripwires}
              isDrawingTripwire={isDrawingTripwire}
              onTripwireCreated={handleTripwireCreated}
              onTripwireSelect={setSelectedTripwireId}
              onTripwireBreach={onTripwireBreach}
              selectedTripwireId={selectedTripwireId}
              filters={filters}
              hasActiveBreach={isDemoBreachActive}
              onDispatchUnit={() => alert('DISPATCH RAPID RESPONSE TEAM INITIATED')}
              onSoundAlarm={() => alert('TACTICAL PERIMETER ALARM SOUNDED')}
            />
          </div>

          {/* Right Sidebar: Threat Assessment Gauge + XAI Reason + Identifications + Activity Log + Evidence Hash (w-[320px]) */}
          <div className="w-full lg:w-[320px] flex flex-col gap-1 shrink-0 overflow-y-auto max-h-full">
            {/* Threat Gauge (Stitch circular 95/100 gauge) */}
            <div className="bg-[#1a1c20] border border-[#3c494e] p-4 flex flex-col items-center justify-center min-h-[190px] rounded-xs">
              <span className="font-mono text-[11px] font-bold text-[#bbc9cf] uppercase tracking-wider mb-3">
                THREAT ASSESSMENT
              </span>
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#333539"
                    strokeWidth="6"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={isDemoBreachActive ? '#ffb4ab' : '#00d1ff'}
                    strokeWidth="6"
                    strokeDasharray="283"
                    strokeDashoffset={isDemoBreachActive ? '14' : '220'}
                    className="shadow-[0_0_15px_rgba(255,180,171,0.8)] transition-all duration-500"
                  />
                </svg>
                <div className="text-center z-10">
                  <div
                    className={`font-sans text-3xl font-bold leading-none ${
                      isDemoBreachActive ? 'text-[#ffb4ab]' : 'text-[#00d1ff]'
                    }`}
                  >
                    {isDemoBreachActive ? '95' : '18'}
                  </div>
                  <div className="font-mono text-[10px] text-[#859399] mt-1">/100</div>
                </div>
              </div>
            </div>

            {/* XAI: Reason for Alert */}
            <div className="bg-[#1a1c20] border border-[#3c494e] flex flex-col rounded-xs">
              <div className="p-2.5 border-b border-[#3c494e] flex justify-between items-center">
                <span className="font-mono text-[11px] font-bold text-[#bbc9cf] uppercase tracking-wider">
                  XAI: REASON FOR ALERT
                </span>
                <svg className="w-4 h-4 text-[#00d1ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="p-3 flex flex-col gap-3 font-sans text-[13px] text-[#e2e2e8] leading-snug">
                <div className="flex gap-2">
                  <span className="text-[#ffb4ab] font-bold shrink-0 mt-0.5">●</span>
                  <p>Kinematic profile matches evasive maneuvering (Conf: 98%).</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#00d1ff] font-bold shrink-0 mt-0.5">●</span>
                  <p>Thermal signature detects obscured face/identity.</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#feb700] font-bold shrink-0 mt-0.5">●</span>
                  <p>Trajectory intersects Restricted Zone Alpha.</p>
                </div>
              </div>
            </div>

            {/* Identifications (Facial Match + ANPR Readout) */}
            <SuspectEvidenceCard />

            {/* Activity Log */}
            <ActivityLogWidget />

            {/* SHA-256 Evidence Hash Footer */}
            <EvidenceHashFooter />
          </div>
        </main>
      </div>
    </div>
  );
};
