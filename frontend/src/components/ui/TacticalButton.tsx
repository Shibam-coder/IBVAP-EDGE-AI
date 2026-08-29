import React from 'react';

interface TacticalButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'danger' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  className?: string;
  disabled?: boolean;
}

export const TacticalButton: React.FC<TacticalButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled = false,
}) => {
  const baseClasses =
    'font-mono uppercase font-bold tracking-wider rounded-none transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeClasses = {
    sm: 'text-[10px] px-2.5 py-1',
    md: 'text-xs px-4 py-2',
    lg: 'text-sm px-6 py-3',
  }[size];

  const variantClasses = {
    primary:
      'bg-[#a4e6ff] text-[#003543] hover:bg-[#00d1ff] shadow-[0_0_10px_rgba(0,209,255,0.3)]',
    danger:
      'bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/40 hover:bg-[#ffb4ab] hover:text-[#690005]',
    secondary:
      'bg-[#1e2024] text-[#e2e2e8] border border-[#3c494e] hover:bg-[#282a2e]',
    ghost:
      'bg-transparent text-[#bbc9cf] hover:text-[#00d1ff] hover:bg-[#00d1ff]/10',
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
    >
      {icon && (
        <span className="material-symbols-outlined text-[16px] leading-none">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
};
