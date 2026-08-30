'use client';

import React, { useState } from 'react';
import { TacticalGridView, CommandCenterFocusView } from '@/components/video';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'screen2' | 'screen3' | 'foundation'>('screen2');

  return (
    <div className="min-h-screen bg-[#05070A] text-[#e2e2e8] flex flex-col">
      {/* Dev / Reviewer Quick Screen Switcher Bar */}
      <div className="bg-[#0c0e12] border-b border-[#3c494e] px-4 py-1.5 flex items-center justify-between z-50 text-xs font-mono shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[#00d1ff] font-bold">IBVAP-EDGE AI // DEBANJAN VIEW:</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('screen2')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                activeTab === 'screen2'
                  ? 'bg-[#00d1ff] text-[#003543] font-bold shadow-[0_0_8px_rgba(0,209,255,0.4)]'
                  : 'bg-[#1a1c20] text-[#bbc9cf] hover:text-white border border-[#3c494e]'
              }`}
            >
              SCREEN 2: Tactical Grid View
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('screen3')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                activeTab === 'screen3'
                  ? 'bg-[#00d1ff] text-[#003543] font-bold shadow-[0_0_8px_rgba(0,209,255,0.4)]'
                  : 'bg-[#1a1c20] text-[#bbc9cf] hover:text-white border border-[#3c494e]'
              }`}
            >
              SCREEN 3: Command Center Focus
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('foundation')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                activeTab === 'foundation'
                  ? 'bg-[#feb700] text-[#412d00] font-bold shadow-[0_0_8px_rgba(254,183,0,0.4)]'
                  : 'bg-[#1a1c20] text-[#bbc9cf] hover:text-white border border-[#3c494e]'
              }`}
            >
              Foundation Overview
            </button>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[#859399] text-[11px]">
          <span>STITCH #13550027997114350676</span>
          <span>•</span>
          <span className="text-[#00d1ff]">READY FOR INTEGRATION</span>
        </div>
      </div>

      {/* Screen Render */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'screen2' && (
          <TacticalGridView
            onSelectCamera={() => setActiveTab('screen3')}
            onNavigateScreen={(screen) => {
              if (screen === 'SURVEILLANCE') setActiveTab('screen2');
            }}
          />
        )}

        {activeTab === 'screen3' && (
          <CommandCenterFocusView
            onBackToGrid={() => setActiveTab('screen2')}
            onNavigateScreen={(screen) => {
              if (screen === 'SURVEILLANCE') setActiveTab('screen2');
            }}
          />
        )}

        {activeTab === 'foundation' && (
          <main className="flex-1 p-8 font-mono overflow-y-auto">
            <div className="max-w-4xl mx-auto border border-[#3c494e] p-6 bg-[#111318]">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-[#3c494e] pb-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-[#00d1ff] tracking-wider uppercase">
                    IBVAP-EDGE AI
                  </h1>
                  <p className="text-xs text-[#859399]">Problem Statement ID: 26187 // Common Project Foundation</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#00d1ff]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00d1ff] animate-pulse" />
                  SYSTEM STATUS: INITIALIZED
                </div>
              </div>

              {/* Status Message */}
              <div className="bg-[#1e2024] p-4 border border-[#3c494e] mb-6">
                <p className="text-sm text-[#e2e2e8]">
                  ✓ Next.js App Router, TypeScript, and Tailwind CSS foundation initialized successfully.
                </p>
              </div>

              {/* Team Scope Allocation Matrix */}
              <h2 className="text-sm font-bold text-[#feb700] uppercase mb-3">
                Frontend Engineering Team Scope Allocation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="p-4 border border-[#3c494e] bg-[#0c0e12]">
                  <div className="text-xs text-[#00d1ff] font-bold">SHIBAM (Frontend Lead)</div>
                  <div className="text-xs font-semibold text-white mt-1">Shell, Threat Intel, GIS & Integration</div>
                  <ul className="text-[11px] text-[#bbc9cf] mt-2 space-y-1">
                    <li>• Screen 1: Surveillance Initialization</li>
                    <li>• Screen 4: Sector Analytics & XAI Threat Feed</li>
                    <li>• Screen 5: GIS Tactical Map Tracking</li>
                    <li>• Layout (`src/components/layout`), Threat (`src/components/threat`), GIS (`src/components/gis`), UI (`src/components/ui`)</li>
                  </ul>
                </div>
                <div className="p-4 border border-[#3c494e] bg-[#0c0e12]">
                  <div className="text-xs text-[#00d1ff] font-bold">DEBANJAN (Video & Interaction Lead)</div>
                  <div className="text-xs font-semibold text-white mt-1">Multi-Camera Streams & Tripwires</div>
                  <ul className="text-[11px] text-[#bbc9cf] mt-2 space-y-1">
                    <li>• Screen 2: Tactical Grid View (4-Cam Grid) [IMPLEMENTED]</li>
                    <li>• Screen 3: Command Center Focus & Stream Player [IMPLEMENTED]</li>
                    <li>• Video Components (`src/components/video`) [COMPLETED]</li>
                    <li>• Tripwire Overlay & Spatial Boundaries (`src/components/tripwire`) [COMPLETED]</li>
                  </ul>
                </div>
              </div>

              {/* Verification Checklist */}
              <div className="border-t border-[#3c494e] pt-4 flex justify-between items-center text-xs text-[#859399]">
                <span>Branch: feat/debanjan-components</span>
                <span>Target Directory: /frontend</span>
                <span>UI Source: Google Stitch (#13550027997114350676)</span>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
