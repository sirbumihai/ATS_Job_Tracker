import React, { useEffect, useRef, useState } from 'react';
import { LayoutGroup, motion, useInView, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import ScoreRing from '../ui/ScoreRing';
import { EASE, useLoopProgress } from './motion';

const clamp01 = (n) => Math.min(1, Math.max(0, n));
// Maps overall progress into a sub-range [from, to] -> 0..1
const seg = (p, from, to) => clamp01((p - from) / (to - from));

function Fragment({ children, className = '' }) {
  return (
    <div
      data-testid="feature-fragment"
      className={`relative h-60 rounded-xl border border-neutral-200 bg-neutral-50 p-4 overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

/** Ticker care avanseaza doar cat `ref` e in viewport; cu reduced-motion ramane pe `settled`. */
function useStepper(ref, count, interval, settled) {
  const reduced = useReducedMotion();
  const inView = useInView(ref, { margin: '-10% 0px -10% 0px' });
  const [step, setStep] = useState(reduced ? settled : 0);

  useEffect(() => {
    if (reduced) {
      setStep(settled);
      return undefined;
    }
    if (!inView) return undefined;
    const id = setInterval(() => setStep((s) => (s + 1) % count), interval);
    return () => clearInterval(id);
  }, [inView, reduced, count, interval, settled]);

  return step;
}

// ---------------------------------------------------------------- TRACKER

const STAGES = ['Salvat', 'Aplicat', 'Interviu'];
const SETTLED_STAGE = 2;

function Placeholder({ width }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-2.5">
      <div className="h-1.5 rounded bg-neutral-200" style={{ width }} />
      <div className="mt-1.5 h-1.5 w-1/2 rounded bg-neutral-100" />
    </div>
  );
}

export function TrackerFragment() {
  const ref = useRef(null);
  const stage = useStepper(ref, STAGES.length, 2200, SETTLED_STAGE);

  return (
    <Fragment className="!p-3">
      <div ref={ref} className="grid grid-cols-3 gap-2 h-full">
        <LayoutGroup>
          {STAGES.map((name, i) => (
            <div key={name} className="rounded-lg bg-white/60 border border-neutral-200 p-2 flex flex-col gap-2">
              <div className="text-[11px] font-medium text-neutral-600">{name}</div>
              <Placeholder width={['70%', '55%', '60%'][i]} />
              {i === stage && (
                <motion.div
                  layoutId="moving-job"
                  transition={{ duration: 0.9, ease: EASE }}
                  className="rounded-lg border border-brand-300 bg-white p-2.5 shadow-sm"
                >
                  <div className="text-[10px] uppercase tracking-wide text-neutral-500">Fintech Core Labs</div>
                  <div className="text-xs font-semibold text-neutral-900 leading-tight">Full Stack Engineer</div>
                </motion.div>
              )}
            </div>
          ))}
        </LayoutGroup>
      </div>
    </Fragment>
  );
}

// ---------------------------------------------------------------- CV

const CV_LINES = [
  ['Dezvoltat servicii ', 'Java 21', ' cu ', 'Spring Boot', '.'],
  ['Baze de date ', 'PostgreSQL', ', livrare cu ', 'Docker', '.'],
];
const KEYWORDS = ['Java 21', 'Spring Boot', 'PostgreSQL', 'Docker'];

export function CvFragment() {
  const ref = useRef(null);
  const p = useLoopProgress(ref, { duration: 3.6 });
  const score = Math.round(63 + 31 * seg(p, 0.1, 0.95));

  return (
    <Fragment>
      <div ref={ref} className="flex items-center gap-4 h-full">
        <ScoreRing value={score} size={88} label="Scor ATS" />
        <div className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white p-3 space-y-2 text-xs text-neutral-600 leading-relaxed">
          {CV_LINES.map((line, li) => (
            <p key={li}>
              {line.map((part, i) => {
                const idx = KEYWORDS.indexOf(part);
                if (idx === -1) return <React.Fragment key={i}>{part}</React.Fragment>;
                const on = p >= 0.1 + idx * 0.18;
                return (
                  <mark
                    key={i}
                    className={`rounded px-1 font-medium transition-colors duration-500 ${
                      on ? 'bg-brand-100 text-brand-700' : 'bg-transparent text-neutral-600'
                    }`}
                  >
                    {part}
                  </mark>
                );
              })}
            </p>
          ))}
        </div>
      </div>
    </Fragment>
  );
}

// ---------------------------------------------------------------- INTERVIU

export function FlashcardFragment() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  // Pasii 0..1: fata, apoi spatele; cu reduced-motion ramane pe spate (raspunsul).
  const step = useStepper(ref, 2, 3000, 1);
  const flipped = step === 1;

  const face =
    'absolute inset-0 rounded-xl border bg-white p-4 flex flex-col justify-between [backface-visibility:hidden]';

  return (
    <Fragment className="flex items-center justify-center">
      <div ref={ref} className="relative w-full max-w-xs h-40 [perspective:900px]">
        <motion.div
          className="relative h-full w-full [transform-style:preserve-3d]"
          initial={false}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: reduced ? 0 : 0.9, ease: EASE }}
        >
          <div className={`${face} border-neutral-200`}>
            <span className="text-[10px] font-medium uppercase tracking-widest text-neutral-500">Spring · Întrebare</span>
            <p className="font-serif text-lg text-neutral-950 leading-snug">Ce face @Transactional?</p>
            <span className="text-[11px] text-neutral-400">Răspunsul, pe spate</span>
          </div>
          <div className={`${face} [transform:rotateY(180deg)] border-brand-200 bg-brand-50`}>
            <span className="text-[10px] font-medium uppercase tracking-widest text-brand-600">Răspuns</span>
            <p className="text-sm text-neutral-800 leading-snug">
              Rulează metoda într-o tranzacție și face rollback la excepții runtime.
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-600">
              <Check className="w-3 h-3" /> Știam
            </span>
          </div>
        </motion.div>
      </div>
    </Fragment>
  );
}

// ---------------------------------------------------------------- LINKEDIN

const PROFILE_CHECKS = ['Headline cu tehnologii', 'Secțiunea Despre completă', 'Proiecte cu rezultate'];

export function LinkedInFragment() {
  const ref = useRef(null);
  const p = useLoopProgress(ref, { duration: 3.4 });
  const score = Math.round(58 + 36 * seg(p, 0.05, 0.95));

  return (
    <Fragment>
      <div ref={ref} className="rounded-xl border border-neutral-200 bg-white overflow-hidden h-full">
        <div className="h-14 bg-gradient-to-r from-brand-200 via-brand-100 to-brand-50" />
        <div className="px-4 pb-3 -mt-6 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <span className="w-12 h-12 rounded-full bg-brand-500 text-white font-semibold flex items-center justify-center border-2 border-white">
              AP
            </span>
            <div className="mt-1.5 text-sm font-semibold text-neutral-950 truncate">Andrei Popescu</div>
            <div className="text-xs text-neutral-500 truncate">Java Developer · Spring · PostgreSQL</div>
          </div>
          <div className="shrink-0 font-serif text-3xl text-neutral-950 tabular-nums leading-none">
            {score}
            <span className="text-sm text-neutral-400">/100</span>
          </div>
        </div>
        <ul className="px-4 pb-3 space-y-1">
          {PROFILE_CHECKS.map((c, i) => {
            const on = p >= 0.2 + i * 0.25;
            return (
              <li
                key={c}
                className={`flex items-center gap-1.5 text-xs transition-colors duration-500 ${on ? 'text-neutral-800' : 'text-neutral-400'}`}
              >
                <Check className={`w-3 h-3 transition-colors duration-500 ${on ? 'text-brand-500' : 'text-neutral-300'}`} />
                {c}
              </li>
            );
          })}
        </ul>
      </div>
    </Fragment>
  );
}
