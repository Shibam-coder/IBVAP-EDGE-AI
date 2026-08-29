import React from 'react';

interface StatusFooterProps {
  statusText?: string;
  linkNode?: string;
  fps?: number;
  timeToMaint?: string;
}

export const StatusFooter: React.FC<StatusFooterProps> = ({
  statusText = 'NOMINAL // ENCRYPTED MESH ACTIVE',
  linkNode = 'NODE:01_ONLINE',
  fps = 98,
  timeToMaint = '14h 22m TO MAINT',
}) => {
  return (
    <footer className="bg-[#0c0e12] border-t border-[#3c494e] px-4 py-1.5 flex justify-between items-center font-mono text-[10px] text-[#859399] shrink-0 z-30 select-none">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d1ff] animate-pulse" />
          SYSTEM STATUS:{' '}
          <span className="text-[#00d1ff] font-bold tracking-wider">{statusText}</span>
        </span>
      </div>
      <div className="hidden md:flex items-center gap-6">
        <span>
          &gt; LINK: <span className="text-[#feb700]">{linkNode}</span>
        </span>
        <span>&gt; SYNC_OK</span>
        <span>
          &gt; GPU:<span className="text-[#e2e2e8]">{fps}FPS</span>
        </span>
        <span>&gt; T-MINUS: {timeToMaint}</span>
      </div>
    </footer>
  );
};
