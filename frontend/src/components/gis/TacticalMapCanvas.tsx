'use client';

import React, { useState } from 'react';
import { GisTelemetryOverlay } from './GisTelemetryOverlay';
import { ActiveNodesList } from './ActiveNodesList';
import { IncidentPopup } from './IncidentPopup';
import { CameraNodeMarker } from './CameraNodeMarker';

interface TacticalMapCanvasProps {
  className?: string;
}

export const TacticalMapCanvas: React.FC<TacticalMapCanvasProps> = ({
  className = '',
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>('CAM-01');
  const [showIncidentPopup, setShowIncidentPopup] = useState<boolean>(true);

  const mapBgUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBwh9rEgDeP7OPBol0xDtuyeBD2-FVaEpXSV9Z5ounHvAJUq1RHcM3FbCQRyt0zLfToJ3j99_ZOqeIzphM4u8i2zZTrfu_bktPSUPz9bYFDPiPUDfUxYLAMM4EC6auP_E0qPwBkEG5nFv9OBm1N1HAYABRCWRdJu334rXFFJtiKOu-X7a7cBOzdvJj6kWmTs7zbTBCslVmKJ-lzGlew9Y_OZwwlmBf6i7n2ag6UM0QdKU6clKc5IHB8PErGiXXMWV8d4g0';

  return (
    <div className={`relative w-full h-full bg-[#05070a] overflow-hidden select-none ${className}`}>
      {/* Map Background Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-luminosity grid-pattern"
        style={{ backgroundImage: `url('${mapBgUrl}')` }}
      />

      {/* Animated Scanline Overlay */}
      <div className="absolute inset-0 scan-line pointer-events-none opacity-40" />

      {/* SVG Tactical Vector Paths */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <path
          d="M 280 540 L 480 390 L 680 440 L 780 260"
          fill="none"
          stroke="rgba(0, 209, 255, 0.45)"
          strokeDasharray="5 5"
          strokeWidth="1.5"
        />
        <circle cx="480" cy="390" r="40" fill="none" stroke="rgba(255, 180, 171, 0.25)" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="480" cy="390" r="80" fill="none" stroke="rgba(255, 180, 171, 0.15)" strokeWidth="1" strokeDasharray="6 6" />
      </svg>

      {/* Top Right HUD: Telemetry Panel */}
      <div className="absolute top-4 right-4 z-20 pointer-events-auto">
        <GisTelemetryOverlay
          lat="34.0522° N"
          lon="118.2437° W"
          elevation="1,204M"
          temperature="-4°C"
        />
      </div>

      {/* Right Side Stack: Active Nodes & Threat Status */}
      <div className="absolute right-4 top-48 bottom-4 w-72 z-20 pointer-events-auto hidden lg:flex flex-col justify-start">
        <ActiveNodesList
          onSelectNode={(id) => {
            setSelectedNode(id);
            if (id === 'CAM-01') setShowIncidentPopup(true);
          }}
        />
      </div>

      {/* Dynamic Map Markers */}

      {/* CAM-01 Incident Marker & Callout Popup */}
      <div className="absolute top-[46%] left-[52%] -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto flex flex-col items-center">
        {showIncidentPopup && (
          <div className="mb-3">
            <IncidentPopup
              threatScore={95}
              incidentType="HUMAN BREACH"
              onIntercept={() => alert('QRT Intercept Protocol Dispatched')}
              onViewFeed={() => alert('Switching to CAM-01 Live Focus Feed')}
            />
          </div>
        )}
        <CameraNodeMarker
          id="CAM-01"
          name="CAM-01"
          isCritical={true}
          onClick={() => setShowIncidentPopup(!showIncidentPopup)}
        />
      </div>

      {/* CAM-02 Secure Marker */}
      <div className="absolute top-[32%] left-[38%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto">
        <CameraNodeMarker
          id="CAM-02"
          name="CAM-02"
          isCritical={false}
          onClick={() => setSelectedNode('CAM-02')}
        />
      </div>

      {/* CAM-03 Secure Marker */}
      <div className="absolute bottom-[24%] right-[32%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto">
        <CameraNodeMarker
          id="CAM-03"
          name="CAM-03"
          isCritical={false}
          onClick={() => setSelectedNode('CAM-03')}
        />
      </div>

      {/* Compass / Orientation Indicator Bottom Left */}
      <div className="absolute bottom-4 left-4 z-20 bg-[#0f131a]/90 ghost-border px-3 py-2 flex items-center gap-3 font-mono text-[10px] text-[#859399]">
        <div className="w-5 h-5 rounded-full border border-[#00d1ff]/50 flex items-center justify-center text-[#00d1ff] font-bold text-[9px]">
          N
        </div>
        <span>SECTOR 7G GRID // AZIMUTH 084°</span>
        {selectedNode && (
          <span className="text-[#00d1ff] font-bold border-l border-[#3c494e] pl-3">
            SELECTED: {selectedNode}
          </span>
        )}
      </div>
    </div>
  );
};
