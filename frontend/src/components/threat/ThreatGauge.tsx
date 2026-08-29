'use client';

import React from 'react';
import { RiskGauge } from '../ui/RiskGauge';
import { SeverityLevel } from '@/types';
import { ThreatAnalysisInput, calculateThreatScore } from './threatCalculator';

interface ThreatGaugeProps {
  input?: ThreatAnalysisInput;
  score?: number;
  severity?: SeverityLevel;
  title?: string;
  className?: string;
}

export const ThreatGauge: React.FC<ThreatGaugeProps> = ({
  input,
  score: directScore = 95,
  severity: directSeverity = 'CRITICAL',
  title = 'THREAT ASSESSMENT',
  className = '',
}) => {
  let displayScore = directScore;
  let displaySeverity = directSeverity;

  if (input) {
    const result = calculateThreatScore(input);
    displayScore = result.score;
    displaySeverity = result.severity;
  }

  return (
    <div
      className={`bg-[#0f131a] ghost-border p-4 flex flex-col items-center justify-center min-h-[190px] ${className}`}
    >
      <RiskGauge
        score={displayScore}
        severity={displaySeverity}
        title={title}
        size={120}
      />
    </div>
  );
};
