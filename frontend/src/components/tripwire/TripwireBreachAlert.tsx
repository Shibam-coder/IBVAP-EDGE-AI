'use client';

import React from 'react';
import { TripwireEvent } from '@/types';

export interface TripwireBreachAlertProps {
  event?: TripwireEvent;
  onDismiss?: () => void;
  className?: string;
}

export const TripwireBreachAlert: React.FC<TripwireBreachAlertProps> = ({
  event,
  onDismiss,
  className = '',
}) => {
  if (!event) return null;

  return (
    <div
      className={`bg-[#93000a]/90 text-[#ffdad6] border border-[#ffb4ab] px-4 py-2 rounded shadow-[0_0_15px_rgba(255,180,171,0.5)] flex items-center justify-between gap-4 font-mono text-xs backdrop-blur-md animate-pulse ${className}`}
    >
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-[#ffb4ab]" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <div>
          <div className="font-bold tracking-wider uppercase text-white">
            BREACH: {event.targetClass} DETECTED
          </div>
          <div className="text-[10px] text-[#ffdad6]/80">
            {event.crossingDirection} Crossing // Conf: {(event.confidence * 100).toFixed(1)}% // {event.timestamp}
          </div>
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-[#ffdad6] hover:text-white font-bold text-sm px-1.5 py-0.5 border border-[#ffb4ab]/40 rounded hover:bg-[#ffb4ab]/20"
        >
          ACK
        </button>
      )}
    </div>
  );
};
