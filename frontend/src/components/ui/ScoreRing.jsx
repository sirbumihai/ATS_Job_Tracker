import React from 'react';

/** Inel de scor: arc `brand-500` proportional cu `value / max`, cu valoarea in centru. */
export default function ScoreRing({ value, max = 100, size = 88, stroke = 7, label, className = '', ...rest }) {
  const pct = Math.min(1, Math.max(0, (Number(value) || 0) / max));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const shown = Math.round(Number(value) || 0);

  return (
    <div
      role="img"
      aria-label={`${label ? `${label}: ` : ''}${shown} din ${max}`}
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      {...rest}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-neutral-100" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          className="stroke-brand-500"
        />
      </svg>
      <span aria-hidden="true" className="absolute font-serif text-neutral-950 tabular-nums" style={{ fontSize: size * 0.3 }}>
        {shown}
      </span>
    </div>
  );
}
