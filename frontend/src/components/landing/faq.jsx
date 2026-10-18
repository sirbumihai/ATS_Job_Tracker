import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

/**
 * Single-open FAQ accordion. Height animates smoothly, the +/- indicator
 * rotates; both are instant with reduced motion.
 */
export default function FaqAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);
  const reduced = useReducedMotion();
  const t = { duration: reduced ? 0 : 0.35, ease: EASE };

  return (
    <div className="space-y-4">
      {items.map((faq, idx) => {
        const open = openIndex === idx;
        return (
          <div key={idx} className="rounded-2xl border border-neutral-200 bg-white transition hover:border-neutral-300">
            <h3>
              <button
                type="button"
                id={`faq-btn-${idx}`}
                aria-expanded={open}
                aria-controls={open ? `faq-panel-${idx}` : undefined}
                onClick={() => setOpenIndex(open ? null : idx)}
                className="w-full flex items-center justify-between gap-4 p-6 text-left cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:outline-neutral-900"
              >
                <span className="text-base sm:text-lg font-bold text-neutral-900 leading-snug">{faq.q}</span>
                <motion.span
                  aria-hidden="true"
                  className="text-xl font-mono text-neutral-400 shrink-0"
                  animate={{ rotate: open ? 180 : 0 }}
                  transition={t}
                >
                  {open ? '−' : '+'}
                </motion.span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  key="panel"
                  id={`faq-panel-${idx}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={t}
                  className="overflow-hidden"
                >
                  <p className="mx-6 pb-6 pt-3 border-t border-neutral-100 text-sm sm:text-base text-neutral-600 leading-relaxed">
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
