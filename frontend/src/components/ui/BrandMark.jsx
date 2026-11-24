import React from 'react';
import { Sparkles } from 'lucide-react';

/** Sigla JobFlow AI: patratul brand-500 cu iconita, optional cu numele in Lora. */
export default function BrandMark({ size = 'w-8 h-8', withName = true }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className={`${size} rounded-xl bg-brand-500 text-white flex items-center justify-center shrink-0`}>
        <Sparkles className="w-4 h-4" />
      </span>
      {withName && (
        <span className="font-serif text-lg font-medium text-neutral-950 tracking-tight">
          JobFlow <span className="text-brand-500">AI</span>
        </span>
      )}
    </span>
  );
}
