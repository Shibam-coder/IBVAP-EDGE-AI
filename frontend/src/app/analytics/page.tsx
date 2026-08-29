'use client';

import React, { useState } from 'react';
import { TacticalShell } from '@/components/layout/TacticalShell';
import { RecentDetectionsTable } from '@/components/threat/RecentDetectionsTable';

export default function SectorAnalyticsPage() {
  const [timeframe, setTimeframe] = useState<'1H' | '24H' | '7D' | '30D'>('24H');

  return (
    <TacticalShell showSidebar={true} sectorId="SECTOR-07" operatorId="OPERATOR-42">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-6 relative bg-[#05070a]">
        {/* Background Grid Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, #3c494e 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 relative z-10">
          <div>
            <h1 className="font-sans text-2xl md:text-3xl font-bold text-[#e2e2e8] uppercase tracking-tight mb-1">
              SECTOR ANALYTICS
            </h1>
            <p className="font-sans text-sm text-[#bbc9cf]">
              Aggregated telemetry and threat assessments for Sector 7G.
            </p>
          </div>

          {/* Timeframe Filter */}
          <div className="flex items-center gap-2 mt-4 md:mt-0 font-mono text-[11px] font-bold">
            {(['1H', '24H', '7D', '30D'] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 border transition-colors cursor-pointer ${
                  timeframe === tf
                    ? 'bg-[#00d1ff]/20 border-[#00d1ff] text-[#a4e6ff]'
                    : 'bg-[#1e2024] border-[#3c494e] text-[#e2e2e8] hover:bg-[#282a2e]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Row (4 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 relative z-10">
          {/* KPI 1: Total Detections */}
          <div className="hud-panel ghost-border p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-[10px] text-[#859399] uppercase tracking-widest font-bold">
                TOTAL DETECTIONS
              </span>
              <span className="material-symbols-outlined text-[#859399] text-base">
                my_location
              </span>
            </div>
            <div>
              <div className="font-mono text-3xl font-bold leading-tight text-[#e2e2e8] mb-1">
                1,847
              </div>
              <div className="font-mono text-xs text-[#a4e6ff] flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">arrow_upward</span>
                +12.4% vs prev period
              </div>
            </div>
          </div>

          {/* KPI 2: Critical Alerts */}
          <div className="hud-panel ghost-border p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#ffb4ab]" />
            <div className="flex justify-between items-start mb-4 pl-2">
              <span className="font-mono text-[10px] text-[#859399] uppercase tracking-widest font-bold">
                CRITICAL ALERTS
              </span>
              <span className="material-symbols-outlined text-[#ffb4ab] text-base">
                warning
              </span>
            </div>
            <div className="pl-2">
              <div className="font-mono text-3xl font-bold leading-tight text-[#ffb4ab] mb-1">
                9
              </div>
              <div className="font-mono text-xs text-[#ffb4ab] flex items-center gap-1.5 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab] animate-pulse" />
                ACTION REQUIRED
              </div>
            </div>
          </div>

          {/* KPI 3: False Alarms Suppressed */}
          <div className="hud-panel ghost-border p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-[10px] text-[#859399] uppercase tracking-widest font-bold">
                FALSE ALARMS SUPPRESSED
              </span>
              <span className="material-symbols-outlined text-[#859399] text-base">
                filter_alt
              </span>
            </div>
            <div>
              <div className="font-mono text-3xl font-bold leading-tight text-[#e2e2e8] mb-2">
                83.4%
              </div>
              <div className="w-full bg-[#1e2024] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#a4e6ff] h-full w-[83.4%]" />
              </div>
            </div>
          </div>

          {/* KPI 4: Mean QRT Response */}
          <div className="hud-panel ghost-border p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-[10px] text-[#859399] uppercase tracking-widest font-bold">
                MEAN QRT RESPONSE
              </span>
              <span className="material-symbols-outlined text-[#859399] text-base">
                timer
              </span>
            </div>
            <div>
              <div className="font-mono text-2xl font-bold text-[#e2e2e8] mb-1 flex items-baseline gap-1">
                <span>4</span>
                <span className="text-xs text-[#bbc9cf] mr-1">m</span>
                <span>12</span>
                <span className="text-xs text-[#bbc9cf]">s</span>
              </div>
              <div className="font-mono text-xs text-[#a4e6ff]">
                Target: &lt; 5m 00s
              </div>
            </div>
          </div>
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 relative z-10 min-h-[300px]">
          {/* Bar Chart Panel: Hourly Alert Density */}
          <div className="hud-panel ghost-border col-span-1 lg:col-span-2 p-4 flex flex-col">
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-[#3c494e]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#a4e6ff]" />
                <span className="font-mono text-xs font-bold text-[#e2e2e8] uppercase tracking-wider">
                  HOURLY ALERT DENSITY
                </span>
              </div>
              <div className="flex items-center gap-4 font-mono text-[10px] text-[#859399]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-[#a4e6ff]" /> LOW (CYAN)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-[#feb700]" /> MEDIUM (AMBER)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-[#ffaaa4]" /> HIGH (RED)
                </span>
              </div>
            </div>

            {/* CSS Grid Bar Chart */}
            <div className="flex-1 flex items-end gap-2 relative h-full pt-4 min-h-[180px]">
              {/* Y Axis */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between font-mono text-[10px] text-[#859399] pb-6 w-6 text-right pr-2">
                <span>100</span>
                <span>75</span>
                <span>50</span>
                <span>25</span>
                <span>0</span>
              </div>

              {/* Bars Container */}
              <div className="ml-6 w-full h-full flex items-end gap-[3%] pb-6 relative border-b border-l border-[#3c494e]">
                {/* X Axis Labels */}
                <div className="absolute bottom-0 left-0 w-full flex justify-between font-mono text-[10px] text-[#859399] translate-y-full pt-2">
                  <span>00:00</span>
                  <span>04:00</span>
                  <span>08:00</span>
                  <span>12:00</span>
                  <span>16:00</span>
                  <span>20:00</span>
                </div>

                {/* Bars */}
                <div className="w-[7%] flex flex-col justify-end h-full">
                  <div className="w-full bg-[#a4e6ff] h-[35%] hover:brightness-125 transition-all" />
                </div>
                <div className="w-[7%] flex flex-col justify-end h-full">
                  <div className="w-full bg-[#a4e6ff] h-[28%] hover:brightness-125 transition-all" />
                </div>
                <div className="w-[7%] flex flex-col justify-end h-full">
                  <div className="w-full bg-[#a4e6ff] h-[48%] hover:brightness-125 transition-all" />
                </div>
                <div className="w-[7%] flex flex-col justify-end h-full">
                  <div className="w-full bg-[#feb700] h-[22%]">
                    <div className="w-full bg-[#a4e6ff] h-[100%] hover:brightness-125 transition-all" />
                  </div>
                </div>
                <div className="w-[7%] flex flex-col justify-end h-full">
                  <div className="w-full bg-[#a4e6ff] h-[32%] hover:brightness-125 transition-all" />
                </div>

                {/* Spike Bar 1 */}
                <div className="w-[7%] flex flex-col justify-end h-full">
                  <div className="w-full bg-[#ffaaa4] h-[45%]" />
                  <div className="w-full bg-[#feb700] h-[30%]" />
                  <div className="w-full bg-[#a4e6ff] h-[25%]" />
                </div>

                <div className="w-[7%] flex flex-col justify-end h-full">
                  <div className="w-full bg-[#feb700] h-[30%]">
                    <div className="w-full bg-[#a4e6ff] h-[100%]" />
                  </div>
                </div>
                <div className="w-[7%] flex flex-col justify-end h-full">
                  <div className="w-full bg-[#a4e6ff] h-[52%] hover:brightness-125 transition-all" />
                </div>
                <div className="w-[7%] flex flex-col justify-end h-full">
                  <div className="w-full bg-[#a4e6ff] h-[40%] hover:brightness-125 transition-all" />
                </div>

                {/* Spike Bar 2 */}
                <div className="w-[7%] flex flex-col justify-end h-full">
                  <div className="w-full bg-[#ffaaa4] h-[25%]" />
                  <div className="w-full bg-[#feb700] h-[30%]" />
                  <div className="w-full bg-[#a4e6ff] h-[45%]" />
                </div>

                <div className="w-[7%] flex flex-col justify-end h-full">
                  <div className="w-full bg-[#a4e6ff] h-[28%] hover:brightness-125 transition-all" />
                </div>
                <div className="w-[7%] flex flex-col justify-end h-full">
                  <div className="w-full bg-[#a4e6ff] h-[35%] hover:brightness-125 transition-all" />
                </div>
                <div className="w-[7%] flex flex-col justify-end h-full">
                  <div className="w-full bg-[#a4e6ff] h-[44%] hover:brightness-125 transition-all" />
                </div>
              </div>
            </div>
          </div>

          {/* Donut Chart Panel: Detection Classification */}
          <div className="hud-panel ghost-border col-span-1 p-4 flex flex-col">
            <div className="flex justify-start items-center mb-6 pb-2 border-b border-[#3c494e]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#859399]" />
                <span className="font-mono text-xs font-bold text-[#e2e2e8] uppercase tracking-wider">
                  DETECTION CLASSIFICATION
                </span>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative">
              {/* CSS Donut Chart */}
              <div className="w-36 h-36 rounded-full border-[8px] border-[#1e2024] relative flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full border-[8px] border-[#a4e6ff]"
                  style={{
                    clipPath:
                      'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 70%)',
                  }}
                />
                <div
                  className="absolute inset-0 rounded-full border-[8px] border-[#feb700]"
                  style={{ clipPath: 'polygon(50% 50%, 0 70%, 0 0, 50% 0)' }}
                />
                <div
                  className="absolute inset-0 rounded-full border-[8px] border-[#859399]"
                  style={{
                    clipPath: 'polygon(50% 50%, 100% 0, 100% 40%, 50% 50%)',
                    transform: 'rotate(45deg)',
                  }}
                />
                <div className="text-center z-10 flex flex-col items-center justify-center bg-[#0f131a] w-28 h-28 rounded-full absolute">
                  <span className="font-mono text-[9px] text-[#859399] uppercase tracking-widest font-bold">
                    TOTAL
                  </span>
                  <span className="font-mono text-2xl font-bold text-[#e2e2e8] leading-none mt-1">
                    1.8k
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="w-full mt-6 grid grid-cols-2 gap-y-3 gap-x-2 font-mono text-xs">
                <div className="flex items-center justify-between text-[#bbc9cf]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#a4e6ff]" /> HUMAN
                  </div>
                  <span className="text-[#e2e2e8] font-bold">45%</span>
                </div>
                <div className="flex items-center justify-between text-[#bbc9cf]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#859399]" /> VEHICLE
                  </div>
                  <span className="text-[#e2e2e8] font-bold">25%</span>
                </div>
                <div className="flex items-center justify-between text-[#bbc9cf]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#feb700]" /> INTRUSION
                  </div>
                  <span className="text-[#e2e2e8] font-bold">15%</span>
                </div>
                <div className="flex items-center justify-between text-[#bbc9cf]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#333539]" /> ANIMAL
                  </div>
                  <span className="text-[#e2e2e8] font-bold">15%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="mb-4 relative z-10">
          <RecentDetectionsTable
            onExportCsv={() => alert('Detections CSV exported successfully.')}
          />
        </div>
      </div>
    </TacticalShell>
  );
}
