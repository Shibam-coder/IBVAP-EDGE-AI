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
import { VisionFiltersState } from './VideoViewport';

export interface CommandCenterFocusViewProps {
  initialCamera?: CameraFeed;
  cameras?: CameraFeed[];
  initialTripwires?: TripwireZone[];
  onBackToGrid?: () => void;
  className?: string;
}

export const CommandCenterFocusView: React.FC<CommandCenterFocusViewProps> = ({
  initialCamera,
  cameras = MOCK_CAMERA_FEEDS,
  initialTripwires = MOCK_TRIPWIRES,
  onBackToGrid,
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
    <div className={`flex flex-col h-full w-full bg-[#05070A] text-[#e2e2e8] overflow-hidden ${className}`}>
      {/* Top Header Bar */}
      <header className="h-14 bg-[#111318] border-b border-[#3c494e] flex justify-between items-center px-4 shrink-0 z-40">
        <div className="flex items-center gap-6">
          <div className="font-mono text-lg font-bold text-[#00d1ff] tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00d1ff] animate-pulse" />
            IBVAP-EDGE AI
          </div>
          <nav className="hidden md:flex gap-5 text-xs font-mono font-bold tracking-wider">
            {onBackToGrid && (
              <button
                type="button"
                onClick={onBackToGrid}
                className="text-[#859399] hover:text-[#00d1ff] transition-colors cursor-pointer flex items-center gap-1"
              >
                ← SURVEILLANCE GRID
              </button>
            )}
            <span className="text-[#00d1ff] border-b-2 border-[#00d1ff] pb-1 cursor-pointer">
              LIVE COMMAND CENTER
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
          <div className="font-mono text-xs text-[#00d1ff] bg-[#111318] px-3 py-1 rounded border border-[#3c494e]">
            17:22:09 UTC
          </div>
        </div>
      </header>

      {/* Main 3-Column Command Stage Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-1 gap-1">
        {/* Left Sub-Panel: Camera Switcher + Vision Processing + Tripwire Drawing Controls + Node Telemetry */}
        <div className="w-full lg:w-[280px] xl:w-[300px] flex flex-col gap-1 shrink-0 overflow-y-auto max-h-full">
          {/* Camera Grid Switcher */}
          <CameraSelectorList
            cameras={cameras}
            selectedCameraId={selectedCamera.id}
            onSelectCamera={setSelectedCamera}
          />

          {/* Vision Processing Toggles */}
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

          {/* Node Telemetry Widget */}
          <NodeTelemetryWidget />
        </div>

        {/* Center Main Stage: Large Video Focus Viewport with Overlays & Tripwires */}
        <div className="flex-1 flex flex-col h-full min-h-[400px] overflow-hidden">
          <VideoFocusStage
            camera={selectedCamera}
            tripwires={tripwires}
            isDrawingTripwire={isDrawingTripwire}
            onTripwireCreated={handleTripwireCreated}
            onTripwireSelect={setSelectedTripwireId}
            selectedTripwireId={selectedTripwireId}
            filters={filters}
            hasActiveBreach={true}
            onDispatchUnit={() => alert('QRT UNIT DISPATCHED')}
            onSoundAlarm={() => alert('TACTICAL SECTOR ALARM ACTIVATED')}
          />
        </div>

        {/* Right Sidebar: Threat Assessment Gauge + XAI Reason + Suspect Profile + Activity Log + Evidence Hash */}
        <div className="w-full lg:w-[300px] xl:w-[320px] flex flex-col gap-1 shrink-0 overflow-y-auto max-h-full">
          {/* Threat Assessment Circular SVG Gauge */}
          <div className="bg-[#1a1c20] border border-[#3c494e] p-3 flex flex-col items-center justify-center min-h-[170px] rounded-xs">
            <span className="font-mono text-[10px] font-bold text-[#bbc9cf] uppercase tracking-wider mb-2">
              Threat Assessment
            </span>
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#333539"
                  strokeWidth="7"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#ffb4ab"
                  strokeWidth="7"
                  strokeDasharray="264"
                  strokeDashoffset="13"
                  className="shadow-[0_0_12px_rgba(255,180,171,0.8)]"
                />
              </svg>
              <div className="text-center z-10">
                <div className="font-mono text-3xl font-bold text-[#ffb4ab] leading-none">
                  95
                </div>
                <div className="font-mono text-[9px] text-[#859399] mt-0.5 font-bold">
                  / 100 (CRITICAL)
                </div>
              </div>
            </div>
          </div>

          {/* XAI: Reason for Alert */}
          <div className="bg-[#1a1c20] border border-[#3c494e] flex flex-col rounded-xs">
            <div className="p-2 border-b border-[#3c494e] flex justify-between items-center">
              <span className="font-mono text-[10px] font-bold text-[#bbc9cf] uppercase tracking-wider">
                XAI: Reason for Alert
              </span>
              <span className="font-mono text-[9px] text-[#00d1ff]">EXPLAINABLE AI</span>
            </div>
            <div className="p-2.5 flex flex-col gap-2 font-mono text-[11px] text-[#e2e2e8] leading-tight">
              <div className="flex gap-2 items-start">
                <span className="text-[#ffb4ab] font-bold">▶</span>
                <p>Kinematic profile matches evasive maneuvering (Conf: 98%).</p>
              </div>
              <div className="flex gap-2 items-start">
                <span className="text-[#00d1ff] font-bold">▶</span>
                <p>Thermal signature detects obscured face/identity signature.</p>
              </div>
              <div className="flex gap-2 items-start">
                <span className="text-[#feb700] font-bold">▶</span>
                <p>Trajectory intersects Restricted Perimeter Zone Alpha.</p>
              </div>
            </div>
          </div>

          {/* Suspect Identification Profiles */}
          <SuspectEvidenceCard />

          {/* Activity Log */}
          <ActivityLogWidget />

          {/* SHA-256 Evidence Hash Footer */}
          <EvidenceHashFooter />
        </div>
      </div>
    </div>
  );
};
