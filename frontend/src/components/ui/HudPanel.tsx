import React from 'react';

interface HudPanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: 'primary' | 'error' | 'warning' | 'muted';
  withCorners?: boolean;
  action?: React.ReactNode;
}

export const HudPanel: React.FC<HudPanelProps> = ({
  children,
  className = '',
  title,
  subtitle,
  badge,
  badgeVariant = 'primary',
  withCorners = false,
  action,
}) => {
  const badgeClasses = {
    primary: 'text-[#00d1ff] bg-[#00d1ff]/10 border-[#00d1ff]/30',
    error: 'text-[#ffb4ab] bg-[#93000a]/20 border-[#ffb4ab]/30',
    warning: 'text-[#feb700] bg-[#feb700]/10 border-[#feb700]/30',
    muted: 'text-[#859399] bg-[#1e2024] border-[#3c494e]',
  };

  return (
    <div className={`hud-panel ghost-border rounded relative flex flex-col ${className}`}>
      {withCorners && (
        <>
          <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-[#4cd6ff]/60 pointer-events-none" />
          <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-[#4cd6ff]/60 pointer-events-none" />
          <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-[#4cd6ff]/60 pointer-events-none" />
          <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-[#4cd6ff]/60 pointer-events-none" />
        </>
      )}

      {(title || badge || action) && (
        <div className="px-3 py-2 border-b border-[#3c494e] flex justify-between items-center bg-[#111318]/70">
          <div>
            {title && (
              <span className="font-mono text-[11px] font-bold tracking-widest text-[#bbc9cf] uppercase">
                {title}
              </span>
            )}
            {subtitle && (
              <span className="block font-mono text-[9px] text-[#859399] uppercase">
                {subtitle}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {badge && (
              <span
                className={`font-mono text-[9px] px-1.5 py-0.5 border rounded uppercase ${badgeClasses[badgeVariant]}`}
              >
                {badge}
              </span>
            )}
            {action}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
};
