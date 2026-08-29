'use client';

import React from 'react';
import { TacticalShell } from '@/components/layout/TacticalShell';
import { ThreatGauge } from '@/components/threat/ThreatGauge';
import { XaiExplanationCard } from '@/components/threat/XaiExplanationCard';
import { ThreatSnapshotCard } from '@/components/threat/ThreatSnapshotCard';
import { RecentDetectionsTable } from '@/components/threat/RecentDetectionsTable';

export default function ThreatIntelPage() {
  return (
    <TacticalShell showSidebar={true} sectorId="SECTOR-07" operatorId="OPERATOR-42">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#05070a]">
        {/* Header */}
        <div className="border-b border-[#3c494e] pb-3 flex justify-between items-end">
          <div>
            <h1 className="font-sans text-2xl font-bold text-[#e2e2e8] uppercase tracking-wider">
              THREAT INTELLIGENCE & XAI RATIONALE
            </h1>
            <p className="font-mono text-xs text-[#859399] uppercase mt-1">
              Autonomous Real-Time Risk Assessment // Explainable AI Engine
            </p>
          </div>
          <div className="flex items-center gap-2 text-[#ffb4ab] font-mono text-xs uppercase">
            <span className="w-2 h-2 rounded-full bg-[#ffb4ab] pulse-dot" />
            LIVE THREAT RADAR ACTIVE
          </div>
        </div>

        {/* Top Grid: Gauge + XAI + Snapshot */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ThreatGauge score={95} severity="CRITICAL" />
          <XaiExplanationCard
            threatScore={95}
            objectType="Human"
            confidence={0.97}
            tripwireBreached={true}
            explanation={{
              classConfidence: 0.97,
              speedMps: 2.4,
              kinematicProfile: 'Running / Evasive Maneuvering',
              trajectoryDescription: 'Crossed Tripwire Outer Perimeter Alpha into Restricted Sector',
              reasons: [
                'Human signature detected with 97% confidence',
                'Kinematic velocity 2.4 m/s (Running pattern)',
                'Inbound crossing on Tripwire TW-01 into Restricted Zone',
              ],
              factors: [
                { name: 'Velocity Profile', weight: 0.4, description: 'High speed approach' },
                { name: 'Zone Sensitivity', weight: 0.35, description: 'Sector 7G Restricted Zone' },
                { name: 'Time of Breach', weight: 0.25, description: 'Night hours active surveillance' },
              ],
            }}
          />
          <ThreatSnapshotCard />
        </div>

        {/* Detection Logs */}
        <RecentDetectionsTable />
      </div>
    </TacticalShell>
  );
}
