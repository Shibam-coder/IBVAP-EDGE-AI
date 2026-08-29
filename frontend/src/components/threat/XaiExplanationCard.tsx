import React from 'react';
import { XaiExplanation } from '@/types';

interface XaiExplanationCardProps {
  explanation?: XaiExplanation;
  threatScore?: number;
  objectType?: string;
  confidence?: number;
  tripwireBreached?: boolean;
  className?: string;
}

export const XaiExplanationCard: React.FC<XaiExplanationCardProps> = ({
  explanation,
  threatScore = 95,
  objectType = 'Human',
  confidence = 0.96,
  tripwireBreached = true,
  className = '',
}) => {
  const defaultReasons = [
    {
      icon: 'directions_run',
      color: 'text-[#ffb4ab]',
      text: `${objectType} detected with ${(confidence * 100).toFixed(0)}% confidence (Evasive Maneuvering profile).`,
    },
    {
      icon: 'visibility_off',
      color: 'text-[#a4e6ff]',
      text: 'Thermal signature detects anomalous heat flux in restricted perimeter.',
    },
    {
      icon: 'location_on',
      color: 'text-[#feb700]',
      text: tripwireBreached
        ? 'Direct trajectory intersects Active Tripwire (Outer Fence Alpha).'
        : 'Approaching restricted perimeter boundary.',
    },
  ];

  const reasons = explanation?.reasons?.length
    ? explanation.reasons.map((r, i) => ({
        icon: i === 0 ? 'directions_run' : i === 1 ? 'visibility_off' : 'location_on',
        color: i === 0 ? 'text-[#ffb4ab]' : i === 1 ? 'text-[#a4e6ff]' : 'text-[#feb700]',
        text: r,
      }))
    : defaultReasons;

  return (
    <div className={`bg-[#0f131a] ghost-border flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-2.5 border-b border-[#3c494e] flex justify-between items-center bg-[#111318]/80">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[15px] text-[#00d1ff]">
            psychology
          </span>
          <span className="font-mono text-[11px] font-bold text-[#bbc9cf] uppercase tracking-wider">
            XAI: REASON FOR ALERT
          </span>
        </div>
        <span className="font-mono text-[9px] text-[#ffb4ab] bg-[#93000a]/20 border border-[#ffb4ab]/30 px-1.5 py-0.5 uppercase">
          Score: {threatScore}/100
        </span>
      </div>

      {/* Rationale List */}
      <div className="p-3 flex flex-col gap-2.5 font-sans text-xs text-[#e2e2e8]">
        {reasons.map((reason, idx) => (
          <div key={idx} className="flex items-start gap-2.5">
            <span
              className={`material-symbols-outlined text-[16px] shrink-0 mt-0.5 ${reason.color}`}
            >
              {reason.icon}
            </span>
            <p className="leading-snug text-[#bbc9cf]">{reason.text}</p>
          </div>
        ))}
      </div>

      {/* Factors weights if present */}
      {explanation?.factors && explanation.factors.length > 0 && (
        <div className="px-3 pb-3 pt-1 border-t border-[#3c494e]/50 flex flex-col gap-1.5">
          <span className="font-mono text-[9px] text-[#859399] uppercase tracking-widest">
            AI WEIGHT CONTRIBUTION
          </span>
          {explanation.factors.map((f, i) => (
            <div key={i} className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#bbc9cf]">{f.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-[#1e2024] h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-[#00d1ff] h-full"
                    style={{ width: `${f.weight * 100}%` }}
                  />
                </div>
                <span className="text-[#00d1ff] w-6 text-right">
                  {(f.weight * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
