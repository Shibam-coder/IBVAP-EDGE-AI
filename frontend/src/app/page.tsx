import React from 'react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#05070A] text-[#e2e2e8] p-8 font-mono">
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
            <span className="w-2.5 h-2.5 rounded-full bg-[#00d1ff] animate-pulse"></span>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 border border-[#3c494e] bg-[#0c0e12]">
            <div className="text-xs text-[#00d1ff] font-bold">SHIBAM (Lead)</div>
            <div className="text-xs font-semibold text-white mt-1">Core Shell & Layout</div>
            <ul className="text-[11px] text-[#bbc9cf] mt-2 space-y-1">
              <li>• Navigation & Shell</li>
              <li>• Stitch Design Tokens</li>
              <li>• System Architecture</li>
            </ul>
          </div>
          <div className="p-4 border border-[#3c494e] bg-[#0c0e12]">
            <div className="text-xs text-[#00d1ff] font-bold">DEBANJAN</div>
            <div className="text-xs font-semibold text-white mt-1">Video & Tripwire</div>
            <ul className="text-[11px] text-[#bbc9cf] mt-2 space-y-1">
              <li>• Stream Players & Grid</li>
              <li>• Tripwire Overlay</li>
              <li>• Camera Selector</li>
            </ul>
          </div>
          <div className="p-4 border border-[#3c494e] bg-[#0c0e12]">
            <div className="text-xs text-[#00d1ff] font-bold">PROTYUSH</div>
            <div className="text-xs font-semibold text-white mt-1">Threat & GIS</div>
            <ul className="text-[11px] text-[#bbc9cf] mt-2 space-y-1">
              <li>• XAI Threat Feed</li>
              <li>• Risk Gauges</li>
              <li>• GIS Map Canvas</li>
            </ul>
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="border-t border-[#3c494e] pt-4 flex justify-between items-center text-xs text-[#859399]">
          <span>Branch: feat/shibam-ui</span>
          <span>Target Directory: /frontend</span>
          <span>UI Source: Google Stitch (#13550027997114350676)</span>
        </div>
      </div>
    </main>
  );
}
