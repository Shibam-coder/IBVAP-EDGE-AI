import React from 'react';

interface CameraNodeMarkerProps {
  id: string;
  name: string;
  isCritical?: boolean;
  onClick?: () => void;
  className?: string;
}

export const CameraNodeMarker: React.FC<CameraNodeMarkerProps> = ({
  name,
  isCritical = false,
  onClick,
  className = '',
}) => {
  if (isCritical) {
    return (
      <div
        onClick={onClick}
        className={`relative flex flex-col items-center group cursor-crosshair select-none ${className}`}
      >
        <div className="w-4 h-4 rounded-full border-2 border-[#ffb4ab] bg-[#05070a] z-10 pulse-dot flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-[#ffb4ab] rounded-full" />
        </div>
        <div className="w-[1px] h-8 bg-[#ffb4ab]/50 group-hover:bg-[#ffb4ab] transition-colors" />
        <div className="bg-[#0f131a] border border-[#ffb4ab]/50 px-2 py-0.5 font-mono text-[10px] text-[#ffb4ab] shadow-[0_0_8px_rgba(255,180,171,0.3)]">
          {name}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col items-center cursor-crosshair group select-none ${className}`}
    >
      <div className="w-3 h-3 rounded-full border border-[#4cd6ff] bg-[#4cd6ff]/20 z-10 flex items-center justify-center group-hover:bg-[#4cd6ff]/50 transition-colors">
        <div className="w-1 h-1 bg-[#4cd6ff] rounded-full" />
      </div>
      <div className="w-[1px] h-6 bg-[#4cd6ff]/30 group-hover:bg-[#4cd6ff]/80 transition-colors" />
      <div className="bg-[#0f131a] border border-[#3c494e] px-2 py-0.5 font-mono text-[10px] text-[#4cd6ff] group-hover:border-[#4cd6ff] transition-colors">
        {name}
      </div>
    </div>
  );
};
