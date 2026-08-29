import React from 'react';
import { SeverityLevel } from '@/types';

interface RiskGaugeProps {
  score: number; // 0 - 100
  title?: string;
  size?: number;
  severity?: SeverityLevel;
  className?: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  title = 'THREAT ASSESSMENT',
  size = 128,
  severity = 'CRITICAL',
  className = '',
}) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const severityColor = {
    CRITICAL: '#ffb4ab',
    HIGH: '#ffaaa4',
    MEDIUM: '#feb700',
    LOW: '#00d1ff',
    INFO: '#a4e6ff',
  }[severity] || '#00d1ff';

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {title && (
        <span className="font-mono text-[10px] text-[#bbc9cf] tracking-widest uppercase mb-3">
          {title}
        </span>
      )}
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#1e2024"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={severityColor}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out glow-alert"
          />
        </svg>
        <div className="text-center">
          <div
            className="font-sans font-bold leading-none"
            style={{ fontSize: size * 0.28, color: severityColor }}
          >
            {score}
          </div>
          <div className="font-mono text-[10px] text-[#859399] mt-0.5">/100</div>
        </div>
      </div>
      <span
        className="mt-2 font-mono text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded"
        style={{ color: severityColor, backgroundColor: `${severityColor}15` }}
      >
        {severity}
      </span>
    </div>
  );
};
