'use client';

import React from 'react';
import { TacticalShell } from '@/components/layout/TacticalShell';
import { TacticalMapCanvas } from '@/components/gis/TacticalMapCanvas';

export default function GisMapTrackingPage() {
  return (
    <TacticalShell showSidebar={true} sectorId="SECTOR-07" operatorId="OPERATOR-42">
      <div className="flex-1 w-full h-[calc(100vh-64px-32px)] relative overflow-hidden bg-[#05070a]">
        <TacticalMapCanvas />
      </div>
    </TacticalShell>
  );
}
