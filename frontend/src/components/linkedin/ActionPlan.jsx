import React, { useState } from 'react';
import { Check, Copy, ChevronDown } from 'lucide-react';
import Card from '../ui/Card';

const MAX_TITLE_WORDS = 6;

/** Titlul din lista: cel mult 6 cuvinte; titlul complet apare in panoul pasului. */
function shortTitle(title) {
  const words = (title || '').trim().split(/\s+/);
  return words.length <= MAX_TITLE_WORDS ? words.join(' ') : `${words.slice(0, MAX_TITLE_WORDS).join(' ')}…`;
}

/** Planul de actiune: lista de bife; detaliile si textul de copiat se deschid la click pe pas. */
export default function ActionPlan({ steps, completed, onToggle, onCopy, copiedKey }) {
  const [openId, setOpenId] = useState(null);
  const total = steps?.length || 10;
  const done = (steps || []).filter((step) => completed[step.id]).length;

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-lg font-medium text-neutral-950">Plan de acțiune</h2>
        <span data-testid="plan-progress" aria-label="Pași completați" className="text-sm font-medium text-neutral-600 tabular-nums">
          {done} / {total}
        </span>
      </div>

      <ul className="divide-y divide-neutral-100">
        {(steps || []).map((step) => {
          const isDone = !!completed[step.id];
          const isOpen = openId === step.id;
          const panelId = `plan-step-${step.id}`;
          return (
            <li key={step.id} className="py-2.5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isDone}
                  aria-label={step.title}
                  onClick={() => onToggle(step.id)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition cursor-pointer ${
                    isDone ? 'bg-brand-500 border-brand-500 text-white' : 'border-neutral-300 hover:border-brand-500 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenId(isOpen ? null : step.id)}
                  className="flex-1 min-w-0 flex items-center justify-between gap-2 text-left cursor-pointer"
                >
                  <span className={`text-sm ${isDone ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}>
                    {shortTitle(step.title)}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {isOpen && (
                <div id={panelId} className="mt-2 ml-8 space-y-2.5 text-sm text-neutral-600">
                  {shortTitle(step.title) !== step.title && <p className="font-medium text-neutral-900">{step.title}</p>}
                  <p>{step.instructions}</p>
                  <p className="text-xs text-neutral-500">
                    {[step.estimatedMinutes && `${step.estimatedMinutes} min`, step.category, step.impact].filter(Boolean).join(' · ')}
                  </p>
                  {step.exampleSnippet && (
                    <div className="flex items-center justify-between gap-3 rounded-lg bg-neutral-50 px-3 py-2">
                      <code className="text-xs text-neutral-800 break-words min-w-0">{step.exampleSnippet}</code>
                      <button
                        type="button"
                        onClick={() => onCopy(step.exampleSnippet, step.id)}
                        className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 shrink-0 cursor-pointer"
                      >
                        {copiedKey === step.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedKey === step.id ? 'Copiat' : 'Copiază'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
