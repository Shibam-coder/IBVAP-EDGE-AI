'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TacticalShell } from '@/components/layout/TacticalShell';

export default function SurveillanceInitializationPage() {
  const [selectedCam, setSelectedCam] = useState<'CAM-01' | 'CAM-02' | 'CAM-03'>('CAM-02');
  const [deHaze, setDeHaze] = useState<boolean>(true);
  const [clahe, setClahe] = useState<boolean>(false);
  const [riskLevel, setRiskLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');

  const simulationFeeds = [
    {
      id: 'CAM-01',
      title: 'NIGHT INFILTRATION',
      resolution: '1080p 30FPS',
      status: 'OFFLINE',
      imgSrc:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC8dlrTRpYAvQEopdqEiyFn2cuPrXp-jcGhjO6jPy4VGHupOq07bdEawwoeX9wBQMZ6WpCnK0sg4_eGF1No_t8YlmomzA6SOkPVRzqW7ZiQUfCw4gpM8HHcj_BDHx-9n9R7yY8MY7Y7ED1IvZ3W8kAJiANHwdjeho7WFmjpBRmjV0Q5zdO1cZ4k8uMDgUT3StCHDe-iiVlA0E6NSLSidmiRyDs-CgAdD8l8nScY-FO6k57SYYq6-YQ2jg',
    },
    {
      id: 'CAM-02',
      title: 'CHECKPOST CORRIDOR',
      resolution: '4K 60FPS',
      status: 'READY',
      imgSrc:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDqmniA0LF3J5ASZ_xyu-r_j2YwJLyM3N9tNkPWlQI3tLrDUpr5N5B6UrEj-yJqsYilinvZwS6VDVmGn4ByHVXtLMEEh2sovfQsVbUM6pKAAEosOo3JKNsjImAR33m8o2qPk6B5MWuDpagO0uffOaYWRktafQwH5kQovC8T_XUMyD1ac-XLPj7uSIEPY2_7UeZ9_I9PLd_snX1KBuR4Y0yfJNjzvYNuZGlaiPkUztBtfGM2bvVzp0JxZcFTRIsUvLynTMI',
    },
    {
      id: 'CAM-03',
      title: 'RIVERINE FOG',
      resolution: '1080p 15FPS',
      status: 'READY',
      imgSrc: null,
    },
  ];

  return (
    <TacticalShell showSidebar={false}>
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row w-full p-4 gap-4 bg-[#05070a]">
        {/* Left Stage: Surveillance Init */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
          {/* Page Header */}
          <div className="flex justify-between items-end border-b border-[#3c494e] pb-2 shrink-0">
            <div>
              <h1 className="font-sans text-2xl font-semibold text-[#e2e2e8] uppercase tracking-wider">
                INITIALIZE SURVEILLANCE SESSION
              </h1>
              <p className="font-mono text-xs text-[#859399] uppercase mt-1">
                AWAITING VIDEO STREAM INPUT // SYSTEM READY
              </p>
            </div>
            <div className="flex items-center gap-2 text-[#a4e6ff] font-mono text-xs uppercase">
              <div className="w-2 h-2 rounded-full bg-[#a4e6ff] animate-pulse shadow-[0_0_8px_#a4e6ff]" />
              EDGE NODE: ONLINE
            </div>
          </div>

          {/* Drop Zone */}
          <div className="hud-panel ghost-border rounded-lg relative p-8 flex flex-col items-center justify-center min-h-[280px] border-dashed border-2 border-[#3c494e] hover:border-[#a4e6ff] transition-colors cursor-pointer group select-none">
            {/* Corner brackets for HUD feel */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#3c494e]" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#3c494e]" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#3c494e]" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#3c494e]" />

            <span className="material-symbols-outlined text-6xl text-[#859399] mb-4 group-hover:text-[#a4e6ff] transition-colors">
              cloud_upload
            </span>
            <h2 className="font-sans text-xl font-semibold uppercase text-[#e2e2e8] mb-2">
              CCTV VIDEO INPUT
            </h2>
            <p className="font-mono text-xs text-[#a4e6ff] uppercase mb-6">
              <span className="text-[#859399]">DROP</span> VIDEO{' '}
              <span className="text-[#859399]">HERE</span>
            </p>

            <div className="flex gap-4">
              <span className="bg-[#111318] px-3 py-1 font-mono text-xs text-[#859399] ghost-border rounded uppercase">
                MP4 / AVI
              </span>
              <span className="bg-[#111318] px-3 py-1 font-mono text-xs text-[#859399] ghost-border rounded uppercase">
                LOCAL EDGE PROCESSING
              </span>
            </div>
          </div>

          {/* Simulation Feeds Section */}
          <div className="flex flex-col gap-2 mt-2 flex-1">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-mono text-[11px] text-[#859399] uppercase tracking-wider font-bold">
                SIMULATION FEEDS (PRE-LOADED)
              </h3>
              <button
                onClick={() => setSelectedCam('CAM-02')}
                className="font-mono text-[11px] text-[#a4e6ff] hover:text-[#00d1ff] uppercase flex items-center gap-1 cursor-pointer"
              >
                REFRESH LIST
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {simulationFeeds.map((feed) => {
                const isSelected = selectedCam === feed.id;
                return (
                  <div
                    key={feed.id}
                    onClick={() => setSelectedCam(feed.id as typeof selectedCam)}
                    className={`hud-panel ghost-border rounded flex flex-col transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'border-[#a4e6ff] glow-active'
                        : 'opacity-75 grayscale hover:grayscale-0 hover:opacity-100'
                    }`}
                  >
                    <div className="relative h-32 bg-[#05070a] overflow-hidden flex items-center justify-center">
                      {feed.imgSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={feed.imgSrc}
                          alt={feed.title}
                          className={`w-full h-full object-cover ${
                            isSelected ? 'opacity-100' : 'opacity-50'
                          }`}
                        />
                      ) : (
                        <span className="material-symbols-outlined text-4xl text-[#3c494e]">
                          visibility_off
                        </span>
                      )}

                      {isSelected && <div className="scanline" />}

                      <div
                        className={`absolute top-2 left-2 bg-black/60 px-2 py-0.5 font-mono text-[10px] border rounded ${
                          isSelected
                            ? 'text-[#a4e6ff] border-[#a4e6ff]'
                            : 'text-[#859399] border-[#3c494e]'
                        }`}
                      >
                        {feed.id}
                      </div>

                      <div
                        className={`absolute bottom-2 right-2 px-2 py-0.5 font-mono text-[10px] border rounded ${
                          isSelected
                            ? 'bg-[#a4e6ff]/20 border-[#a4e6ff] text-[#a4e6ff]'
                            : 'bg-[#111318] border-[#3c494e] text-[#859399]'
                        }`}
                      >
                        {feed.status}
                      </div>
                    </div>

                    <div
                      className={`p-3 border-t border-[#3c494e] flex justify-between items-center ${
                        isSelected ? 'bg-[#a4e6ff]/5' : ''
                      }`}
                    >
                      <span
                        className={`font-mono text-xs uppercase ${
                          isSelected ? 'text-[#a4e6ff] font-bold' : 'text-[#e2e2e8]'
                        }`}
                      >
                        {feed.title}
                      </span>
                      <span
                        className={`font-mono text-[10px] ${
                          isSelected ? 'text-[#a4e6ff]' : 'text-[#859399]'
                        }`}
                      >
                        {feed.resolution}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Configuration */}
        <div className="w-full md:w-[320px] shrink-0 flex flex-col gap-4">
          {/* Selected Source Preview (Mini) */}
          <div className="hud-panel ghost-border rounded flex flex-col">
            <div className="p-2 border-b border-[#3c494e] flex justify-between items-center bg-[#111318]">
              <span className="font-mono text-[11px] font-bold text-[#859399] uppercase tracking-wider">
                SELECTED SOURCE
              </span>
              <span className="font-mono text-[10px] text-[#a4e6ff] font-bold">
                {selectedCam}
              </span>
            </div>

            <div className="p-2">
              <div className="relative h-32 bg-black border border-[#3c494e] rounded overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtUURbmHcZ-lztzJB7s-qvIBs3BdRkd8Leb8JKtTLNvkbGSgJSqJUKOiy3B5wOc1BPS96hTCBI8wKU5scv4cx7sOxu4HJ7F8nnOENpMpyiLb7e1sVfH03yWWu-hFP9lax-x5A3uUajqIPYX6G8EC5YYfIkJz1Lotm091h3BwRAU9D8V9R_plp2MRk_kJ-FfB9-eJhRNrzpGov4h9l7ilU7ODiGez60xhsM1xEv9GLxwAB6-B8-ZhnVVDvLtYWts-u75yc"
                  alt="Selected Source Mini Preview"
                  className="w-full h-full object-cover opacity-90"
                />
                {/* Targeting reticle overlay */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-[#a4e6ff] rounded-full opacity-70 flex items-center justify-center">
                  <div className="w-1 h-1 bg-[#a4e6ff] rounded-full" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-[#3c494e]">
              <div className="bg-[#111318] p-2 flex flex-col">
                <span className="font-mono text-[9px] text-[#859399]">CODEC</span>
                <span className="font-mono text-xs text-[#e2e2e8] font-bold">H.265</span>
              </div>
              <div className="bg-[#111318] p-2 flex flex-col">
                <span className="font-mono text-[9px] text-[#859399]">BITRATE</span>
                <span className="font-mono text-xs text-[#e2e2e8] font-bold">12.5 Mbps</span>
              </div>
            </div>
          </div>

          {/* AI Config Panel */}
          <div className="hud-panel ghost-border rounded flex-1 flex flex-col">
            <div className="p-3 border-b border-[#3c494e] bg-[#1a1c20]">
              <h3 className="font-mono text-[11px] font-bold text-[#859399] uppercase tracking-wider">
                AI CONFIGURATION
              </h3>
            </div>

            <div className="p-4 flex flex-col gap-6">
              {/* Weather Toggle Section */}
              <div>
                <div className="flex items-center gap-2 mb-4 text-[#e2e2e8]">
                  <span className="material-symbols-outlined text-sm text-[#00d1ff]">
                    cloud
                  </span>
                  <span className="font-mono text-xs uppercase font-bold tracking-wider">
                    WEATHER AI ENHANCEMENT
                  </span>
                </div>

                <div className="space-y-3 pl-6">
                  {/* De-Haze */}
                  <label className="flex justify-between items-center cursor-pointer group">
                    <span className="font-mono text-xs text-[#859399] group-hover:text-[#e2e2e8] transition-colors">
                      De-Haze Algorithm
                    </span>
                    <button
                      type="button"
                      onClick={() => setDeHaze(!deHaze)}
                      className={`w-9 h-5 rounded-full relative transition-colors ${
                        deHaze ? 'bg-[#a4e6ff]' : 'bg-[#333539]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full absolute top-[2px] transition-transform ${
                          deHaze ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </label>

                  {/* Night CLAHE */}
                  <label className="flex justify-between items-center cursor-pointer group">
                    <span className="font-mono text-xs text-[#859399] group-hover:text-[#e2e2e8] transition-colors">
                      Night CLAHE Vision
                    </span>
                    <button
                      type="button"
                      onClick={() => setClahe(!clahe)}
                      className={`w-9 h-5 rounded-full relative transition-colors ${
                        clahe ? 'bg-[#a4e6ff]' : 'bg-[#333539]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full absolute top-[2px] transition-transform ${
                          clahe ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </label>
                </div>
              </div>

              <hr className="border-[#3c494e]" />

              {/* Risk Level Section */}
              <div>
                <div className="flex items-center gap-2 mb-3 text-[#e2e2e8]">
                  <span className="material-symbols-outlined text-sm text-[#feb700]">
                    warning
                  </span>
                  <span className="font-mono text-xs uppercase font-bold tracking-wider">
                    ZONE RISK LEVEL
                  </span>
                </div>

                <div className="flex p-1 bg-[#333539] rounded border border-[#3c494e] mb-2">
                  {(['LOW', 'MEDIUM', 'HIGH'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setRiskLevel(lvl)}
                      className={`flex-1 py-1 font-mono text-[10px] font-bold rounded transition-colors cursor-pointer ${
                        riskLevel === lvl
                          ? 'bg-[#a4e6ff] text-black font-bold'
                          : 'text-[#859399] hover:text-[#e2e2e8]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <p className="font-mono text-[9px] text-[#859399] leading-tight">
                  {riskLevel === 'HIGH'
                    ? 'High risk triggers instant audible alert and rapid response team pre-dispatch.'
                    : riskLevel === 'MEDIUM'
                    ? 'Medium risk prioritizes vehicle identification and anomaly detection algorithms over standard motion.'
                    : 'Low risk suppresses benign wildlife motions and environmental false positives.'}
                </p>
              </div>
            </div>

            {/* Launch Action Button */}
            <div className="mt-auto p-4 border-t border-[#3c494e]">
              <Link
                href="/analytics"
                className="w-full bg-[#a4e6ff] hover:bg-[#00d1ff] text-black font-mono font-bold text-xs py-3 px-4 rounded flex items-center justify-center gap-2 transition-all active:scale-95 text-center shadow-[0_0_12px_rgba(0,209,255,0.3)]"
              >
                <span className="material-symbols-outlined text-base">play_arrow</span>
                START AI LIVE ANALYTICS ENGINE
              </Link>
            </div>
          </div>
        </div>
      </div>
    </TacticalShell>
  );
}
