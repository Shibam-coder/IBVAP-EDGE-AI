'use client';

import React from 'react';

export interface EvidenceHashFooterProps {
  sha256Hash?: string;
  className?: string;
}

export const EvidenceHashFooter: React.FC<EvidenceHashFooterProps> = ({
  sha256Hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  className = '',
}) => {
  return (
    <div className={`bg-[#0c0e12] border border-[#3c494e] p-2.5 rounded flex flex-col gap-1 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="font-mono text-[9px] font-bold text-[#859399] tracking-wider uppercase">
          EVIDENCE HASH (SHA-256)
        </span>
        <span className="font-mono text-[8px] text-[#00d1ff] bg-[#00d1ff]/10 px-1 py-0.2 rounded border border-[#00d1ff]/30">
          CHAIN OF CUSTODY VERIFIED
        </span>
      </div>
      <div className="font-mono text-[8px] text-[#859399] break-all leading-tight">
        {sha256Hash}
      </div>
    </div>
  );
};
