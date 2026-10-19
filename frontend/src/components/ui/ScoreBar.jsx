import React from 'react';

/** Bara de scor: eticheta scurta, punctaj `value/max` si o bara `brand-500`. */
export default function ScoreBar({ label, value, max = 100, className = '' }) {
  const shown = Math.round(Number(value) || 0);
  const pct = Math.min(100, Math.max(0, (shown / max) * 100));

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-neutral-600 truncate">{label}</span>
        <span className="font-medium text-neutral-900 tabular-nums">{shown}/{max}</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={shown}
        aria-valuemin={0}
        aria-valuemax={max}
        className="mt-1.5 h-1.5 rounded-full bg-neutral-100 overflow-hidden"
      >
        <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
