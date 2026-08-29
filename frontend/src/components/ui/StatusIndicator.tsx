import React from 'react';

interface StatusIndicatorProps {
  status: 'ONLINE' | 'OFFLINE' | 'READY' | 'RECORDING' | 'CRITICAL' | 'NOMINAL';
  label?: string;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  className = '',
}) => {
  const configs = {
    ONLINE: {
      dotClass: 'bg-[#a4e6ff] shadow-[0_0_8px_#a4e6ff]',
      textClass: 'text-[#a4e6ff]',
      defaultLabel: 'ONLINE',
    },
    READY: {
      dotClass: 'bg-[#00d1ff] shadow-[0_0_8px_#00d1ff]',
      textClass: 'text-[#00d1ff]',
      defaultLabel: 'READY',
    },
    RECORDING: {
      dotClass: 'bg-[#ffb4ab] animate-pulse shadow-[0_0_8px_#ffb4ab]',
      textClass: 'text-[#ffb4ab]',
      defaultLabel: 'REC',
    },
    CRITICAL: {
      dotClass: 'bg-[#ffb4ab] pulse-dot',
      textClass: 'text-[#ffb4ab]',
      defaultLabel: 'CRITICAL',
    },
    NOMINAL: {
      dotClass: 'bg-[#00d1ff]',
      textClass: 'text-[#00d1ff]',
      defaultLabel: 'NOMINAL',
    },
    OFFLINE: {
      dotClass: 'bg-[#859399]',
      textClass: 'text-[#859399]',
      defaultLabel: 'OFFLINE',
    },
  };

  const conf = configs[status] || configs.NOMINAL;

  return (
    <div className={`flex items-center gap-1.5 font-mono text-[11px] uppercase ${className}`}>
      <span className={`w-2 h-2 rounded-full ${conf.dotClass}`} />
      <span className={conf.textClass}>{label || conf.defaultLabel}</span>
    </div>
  );
};
