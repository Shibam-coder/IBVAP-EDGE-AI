import React from 'react';

interface TelemetryChipProps {
  label: string;
  value: string | number;
  unit?: string;
  variant?: 'cyan' | 'amber' | 'red' | 'default';
  className?: string;
}

export const TelemetryChip: React.FC<TelemetryChipProps> = ({
  label,
  value,
  unit,
  variant = 'default',
  className = '',
}) => {
  const valueColor = {
    cyan: 'text-[#00d1ff]',
    amber: 'text-[#feb700]',
    red: 'text-[#ffb4ab]',
    default: 'text-[#e2e2e8]',
  };

  return (
    <div
      className={`bg-[#111318] ghost-border px-2.5 py-1.5 flex flex-col justify-between ${className}`}
    >
      <span className="font-mono text-[9px] text-[#859399] tracking-wider uppercase">
        {label}
      </span>
      <div className="flex items-baseline gap-0.5 mt-0.5">
        <span className={`font-mono text-xs font-bold ${valueColor[variant]}`}>
          {value}
        </span>
        {unit && <span className="font-mono text-[9px] text-[#859399]">{unit}</span>}
      </div>
    </div>
  );
};
