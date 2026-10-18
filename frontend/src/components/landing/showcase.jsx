import React, { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useReducedMotion } from 'framer-motion';
import { Bell, Check, Sparkles, TrendingUp } from 'lucide-react';
import { CountUp } from './motion';

const IMG_W = 1000;
const IMG_H = 642;

/**
 * Drives a 0..1 progress value in a loop, but only while `ref` is in the
 * viewport. Stays at 1 (final static state) with reduced motion.
 */
function useLoopProgress(ref, { duration = 3.2, hold = 2.2 } = {}) {
  const reduced = useReducedMotion();
  const inView = useInView(ref, { margin: '-10% 0px -10% 0px' });
  const [p, setP] = useState(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      setP(1);
      return undefined;
    }
    if (!inView) return undefined;
    const controls = animate(0, 1, {
      duration,
      ease: 'easeOut',
      repeat: Infinity,
      repeatDelay: hold,
      onUpdate: setP,
    });
    return () => controls.stop();
  }, [inView, reduced, duration, hold]);

  return [p, reduced];
}

const clamp01 = (n) => Math.min(1, Math.max(0, n));
// Maps overall progress into a sub-range [from, to] -> 0..1
const seg = (p, from, to) => clamp01((p - from) / (to - from));

function Shot({ src, alt, eager = false, width = IMG_W, height = IMG_H }) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchpriority={eager ? 'high' : undefined}
      className="block w-full h-auto"
    />
  );
}

function Frame({ children, className = '' }) {
  return (
    <div className={`relative rounded-xl border border-neutral-200 bg-white shadow-sm ${className}`}>
      <div className="overflow-hidden rounded-xl">{children}</div>
    </div>
  );
}

function ScoreBar({ value, className = '' }) {
  return (
    <div className={`h-1.5 w-full rounded-full bg-neutral-200 overflow-hidden ${className}`}>
      <div className="h-full rounded-full bg-brand-600" style={{ width: `${value}%` }} />
    </div>
  );
}

const overlayCard =
  'absolute rounded-xl bg-white/95 backdrop-blur border border-neutral-200 shadow-lg p-3 text-left';

// ---------------------------------------------------------------- HERO

function FloatCard({ className, delay, children, drift = 6 }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={`${overlayCard} ${className}`}>{children}</div>;
  return (
    <motion.div
      className={`${overlayCard} ${className}`}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        animate={{ y: [0, -drift, 0] }}
        transition={{ duration: 5 + delay, repeat: Infinity, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function HeroShowcase() {
  return (
    <div className="relative mx-auto w-full max-w-md md:max-w-xl lg:max-w-none pb-6 md:pb-10">
      <Frame>
        <Shot src="/landing/hero-tracker.webp" alt="Board Kanban din JobFlow AI cu aplicatii pe etape" width={844} height={540} eager />
      </Frame>

      {/* Card 1: ATS score (always visible) */}
      <FloatCard delay={0.5} className="left-2 -bottom-2 md:-left-6 md:bottom-4 w-44">
        <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Scor ATS</div>
        <div className="flex items-end gap-1.5 mt-0.5">
          <span className="text-3xl font-light font-mono text-black">
            <CountUp value="94%" duration={2} />
          </span>
          <TrendingUp className="w-4 h-4 text-brand-600 mb-1.5" />
        </div>
        <ScoreBar value={94} className="mt-1.5" />
      </FloatCard>

      {/* Card 2: new job (always visible) */}
      <FloatCard delay={0.9} drift={8} className="right-2 top-14 md:-right-4 md:top-20 w-52">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-black text-white text-xs font-bold flex items-center justify-center">R</span>
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase text-neutral-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-600" /> Job nou
            </div>
            <div className="text-xs font-bold text-neutral-900 truncate">Java Software Engineer</div>
          </div>
        </div>
      </FloatCard>

      {/* Card 3: interview notification (tablet and up) */}
      <FloatCard delay={1.3} drift={5} className="hidden md:block right-6 -bottom-2 w-56">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </span>
          <div>
            <div className="text-xs font-bold text-neutral-900">Interviu programat</div>
            <div className="text-[11px] font-mono text-neutral-500">UiPath • Joi, 14:00</div>
          </div>
        </div>
      </FloatCard>
    </div>
  );
}

// ---------------------------------------------------------------- CV STUDIO

const CV_KEYWORDS = ['Java 21', 'Spring Boot', 'PostgreSQL', 'Docker', 'REST API'];

export function CvStudioMedia() {
  const ref = useRef(null);
  const [p] = useLoopProgress(ref, { duration: 3.6 });
  const score = Math.round(63 + 31 * seg(p, 0.1, 0.95));

  return (
    <div ref={ref} className="relative">
      <Frame>
        <Shot src="/landing/cv-studio.webp" alt="Studio CV cu editorul si scorul de compatibilitate ATS" />
      </Frame>
      <div className={`${overlayCard} right-2 top-2 sm:right-3 sm:top-3 w-36`}>
        <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Scor ATS</div>
        <div className="text-2xl font-light font-mono text-black tabular-nums">{score}%</div>
        <ScoreBar value={score} className="mt-1" />
      </div>
      <div className={`${overlayCard} left-2 bottom-2 sm:left-3 sm:bottom-3 max-w-[88%]`}>
        <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-1.5">Cuvinte cheie</div>
        <div className="flex flex-wrap gap-1.5">
          {CV_KEYWORDS.map((k, i) => {
            const on = p >= 0.1 + i * 0.15;
            return (
              <span
                key={k}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border transition-colors duration-300 ${
                  on
                    ? 'bg-brand-50 text-brand-700 border-brand-100'
                    : 'bg-white text-neutral-500 border-neutral-200'
                }`}
              >
                {k}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- MARKET INSIGHTS

export function MarketInsightsMedia() {
  const ref = useRef(null);
  const [p] = useLoopProgress(ref, { duration: 2.8 });
  const match = Math.round(78 * seg(p, 0.05, 0.9));

  return (
    <div ref={ref} className="relative">
      <Frame>
        <Shot src="/landing/market-insights.webp" alt="Market Insights cu cererea pe piata IT din Romania" />
      </Frame>
      <div className={`${overlayCard} right-2 bottom-2 sm:right-3 sm:bottom-3 w-48`}>
        <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Skill match</div>
        <div className="flex items-end justify-between">
          <span className="text-3xl font-light font-mono text-black tabular-nums">{match}%</span>
          <Check className="w-4 h-4 text-brand-600 mb-1.5" />
        </div>
        <ScoreBar value={match} className="mt-1" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- LINKEDIN

export function LinkedInMedia() {
  const ref = useRef(null);
  const [p] = useLoopProgress(ref, { duration: 3.4 });
  const score = Math.round(58 + 42 * seg(p, 0.05, 0.95));

  return (
    <div ref={ref} className="relative">
      <Frame>
        <Shot src="/landing/linkedin-optimizer.webp" alt="LinkedIn Optimizer cu auditul profilului" />
      </Frame>
      <div className={`${overlayCard} right-2 top-2 sm:right-3 sm:top-3 w-40`}>
        <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Audit LinkedIn</div>
        <div className="text-2xl font-light font-mono text-black tabular-nums">
          {score}<span className="text-sm text-neutral-400">/100</span>
        </div>
        <ScoreBar value={score} className="mt-1" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- COVER LETTER

const LETTER =
  'Solicit postul de Java Software Engineer la Revolut. Cu 4 ani de experienta in dezvoltarea backend cu Java si Spring Boot, ' +
  'am construit solutii scalabile care se aliniaza direct cu stack-ul tehnologic al companiei.';

export function CoverLetterMedia() {
  const ref = useRef(null);
  const [p, reduced] = useLoopProgress(ref, { duration: 4.5, hold: 2.5 });
  const shown = reduced ? LETTER : LETTER.slice(0, Math.round(LETTER.length * seg(p, 0, 0.92)));
  const typing = !reduced && shown.length < LETTER.length;

  return (
    <div ref={ref} className="relative">
      <Frame>
        <Shot src="/landing/cover-letter.webp" alt="Generatorul de scrisori de intentie" />
      </Frame>
      <div className={`${overlayCard} left-2 right-2 bottom-2 sm:left-auto sm:right-3 sm:bottom-3 sm:w-72`}>
        <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-1">Scrisoare generata</div>
        <p className="text-[11px] leading-relaxed text-neutral-800 min-h-[4.5rem]">
          {shown}
          {typing && <span className="inline-block w-px h-3 ml-0.5 align-middle bg-black animate-pulse" />}
        </p>
      </div>
    </div>
  );
}
