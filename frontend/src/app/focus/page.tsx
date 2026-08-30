'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CommandCenterFocusView } from '@/components/video';

export default function CommandCenterFocusPage() {
  const router = useRouter();

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#05070a] text-[#e2e2e8]">
      <CommandCenterFocusView
        onBackToGrid={() => {
          router.push('/grid');
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
