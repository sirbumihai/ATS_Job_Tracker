import React, { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Bell, Sparkles, TrendingUp } from 'lucide-react';
import { CountUp, EASE } from './motion';

const cardClass =
  'absolute rounded-xl bg-white/95 backdrop-blur border border-neutral-200 shadow-lg p-3 text-left';

/**
 * Card de interfata din evantai. Strat exterior: paralaxa legata de scroll,
 * netezita cu spring. Strat interior: desfacerea in evantai la incarcare.
 * Cu reduced-motion sta static, in pozitia finala.
 */
function FanCard({ progress, shift, from, rotate, delay, className, children }) {
  const reduced = useReducedMotion();
  const y = useSpring(useTransform(progress, [0, 1], [shift, -shift]), { stiffness: 90, damping: 24, mass: 0.4 });

  if (reduced) {
    return (
      <div data-testid="hero-card" className={`${cardClass} ${className}`} style={{ rotate }}>
        {children}
      </div>
    );
  }

  return (
    <motion.div data-testid="hero-card" className={`${cardClass} ${className}`} style={{ y }}>
      <motion.div
        initial={{ opacity: 0, x: from.x, y: from.y, rotate: 0, scale: 0.85 }}
        animate={{ opacity: 1, x: 0, y: 0, rotate, scale: 1 }}
        transition={{ duration: 1.1, delay, ease: EASE }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function HeroShowcase() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-md md:max-w-xl lg:max-w-none pb-8 md:pb-12">
      <div data-testid="hero-screenshot" className="relative rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <img
          src="/landing/hero-tracker.webp"
          alt="Board Kanban din JobFlow AI cu aplicații pe etape"
          width={1288}
          height={872}
          loading="eager"
          decoding="async"
          fetchpriority="high"
          className="block w-full h-auto"
        />
      </div>

      <FanCard
        progress={scrollYProgress}
        shift={28}
        from={{ x: 80, y: -40 }}
        rotate={-4}
        delay={0.2}
        className="left-2 -bottom-2 md:-left-6 md:bottom-6 w-44"
      >
        <div className="text-[10px] font-medium uppercase tracking-widest text-neutral-500">Scor ATS</div>
        <div className="flex items-end gap-1.5 mt-0.5">
          <span className="font-serif text-3xl text-neutral-950">
            <CountUp value="94%" duration={2} />
          </span>
          <TrendingUp className="w-4 h-4 text-brand-600 mb-1.5" />
        </div>
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
          <div className="h-full rounded-full bg-brand-500" style={{ width: '94%' }} />
        </div>
      </FanCard>

      <FanCard
        progress={scrollYProgress}
        shift={44}
        from={{ x: -80, y: 40 }}
        rotate={3}
        delay={0.35}
        className="right-2 top-14 md:-right-4 md:top-16 w-52"
      >
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-brand-500 text-white text-xs font-bold flex items-center justify-center">R</span>
          <div className="min-w-0">
            <div className="text-[10px] font-medium uppercase text-neutral-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-600" /> Job nou
            </div>
            <div className="text-xs font-semibold text-neutral-900 truncate">Java Software Engineer</div>
          </div>
        </div>
      </FanCard>

      <FanCard
        progress={scrollYProgress}
        shift={20}
        from={{ x: -60, y: -60 }}
        rotate={-2}
        delay={0.5}
        className="hidden md:block right-8 -bottom-2 w-56"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </span>
          <div>
            <div className="text-xs font-semibold text-neutral-900">Interviu programat</div>
            <div className="text-[11px] text-neutral-500">UiPath · joi, 14:00</div>
          </div>
        </div>
      </FanCard>
    </div>
  );
}
