'use client';

import React from 'react';
import { RiskGauge } from '../ui/RiskGauge';

interface ThreatGaugeProps {
  score?: number;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title?: string;
  className?: string;
}

export const ThreatGauge: React.FC<ThreatGaugeProps> = ({
  score = 95,
  severity = 'CRITICAL',
  title = 'THREAT ASSESSMENT',
  className = '',
}) => {
  return (
    <div
      className={`bg-[#0f131a] ghost-border p-4 flex flex-col items-center justify-center min-h-[190px] ${className}`}
    >
      <RiskGauge score={score} severity={severity} title={title} size={120} />
    </div>
  );
};
