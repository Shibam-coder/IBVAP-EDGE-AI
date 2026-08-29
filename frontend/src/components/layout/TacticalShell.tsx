'use client';

import React from 'react';
import { TopNavBar } from './TopNavBar';
import { SideNavBar } from './SideNavBar';
import { StatusFooter } from './StatusFooter';

interface TacticalShellProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  sectorId?: string;
  operatorId?: string;
  className?: string;
}

export const TacticalShell: React.FC<TacticalShellProps> = ({
  children,
  showSidebar = true,
  sectorId = 'SECTOR-07',
  operatorId = 'OPERATOR-42',
  className = '',
}) => {
  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-[#05070a] text-[#e2e2e8]">
      {/* Top Bar */}
      <TopNavBar />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {showSidebar && <SideNavBar sectorId={sectorId} operatorId={operatorId} />}

        <main className={`flex-1 overflow-y-auto relative flex flex-col ${className}`}>
          {children}
        </main>
      </div>

      {/* Footer Strip */}
      <StatusFooter />
    </div>
  );
};
