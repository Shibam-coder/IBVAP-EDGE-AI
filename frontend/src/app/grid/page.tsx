'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TacticalGridView } from '@/components/video';

export default function TacticalGridPage() {
  const router = useRouter();

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#05070a] text-[#e2e2e8]">
      <TacticalGridView
        onSelectCamera={() => {
          router.push('/focus');
        }}
        onNavigateScreen={(screen) => {
          if (screen === 'SURVEILLANCE') router.push('/grid');
          if (screen === 'RISK_ANALYTICS') router.push('/analytics');
          if (screen === 'GIS_MAP') router.push('/gis');
        }}
      />
    </div>
  );
}
