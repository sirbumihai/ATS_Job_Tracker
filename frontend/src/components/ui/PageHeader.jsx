import React from 'react';

/** Header de pagina: titlu (Lora) + un rand de subtitlu + slot de actiuni. */
export default function PageHeader({ title, subtitle, actions, as: Heading = 'h1', className = '' }) {
  return (
    <div className={`flex items-center justify-between gap-4 min-w-0 ${className}`}>
      <div className="min-w-0">
        <Heading className="font-serif text-xl font-medium text-neutral-950 leading-tight truncate">{title}</Heading>
        {subtitle && <p className="text-sm text-neutral-500 truncate mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
