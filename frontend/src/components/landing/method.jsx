import React, { useRef } from 'react';
import { motion, useReducedMotion, useScroll } from 'framer-motion';

const STEPS = [
  {
    n: '01',
    title: 'Calibrezi CV-ul',
    text: 'Vezi scorul ATS și adaugi cuvintele-cheie care lipsesc.',
    img: '/landing/method/audit-cv.webp',
    w: 670,
    h: 330,
    alt: 'Decupaj din Studio CV cu un CV demo',
  },
  {
    n: '02',
    title: 'Aplici țintit',
    text: 'Scrisoare de intenție pe job și aplicația urmărită în Tracker.',
    img: '/landing/method/aplicare-tracker.webp',
    w: 513,
    h: 330,
    alt: 'Decupaj din board-ul Kanban cu aplicații demo',
  },
  {
    n: '03',
    title: 'Exersezi tehnic',
    text: 'Câteva flashcard-uri pe zi, pe stack-ul cerut de piață.',
    img: '/landing/method/drilldown-piata.webp',
    w: 950,
    h: 330,
    alt: 'Decupaj din Market Insights cu statistici despre piața IT',
  },
  {
    n: '04',
    title: 'Iei oferta',
    text: 'Răspunsuri STAR la interviul HR și negociere pregătită.',
    img: '/landing/method/oferta-scrisoare.webp',
    w: 545,
    h: 330,
    alt: 'Decupaj dintr-o scrisoare de intenție generată pentru un job demo',
  },
];

/**
 * The 4 methodology steps joined by a line that draws itself as the section
 * scrolls into view (horizontal on desktop, vertical on mobile). Fully drawn
 * and static with reduced motion.
 */
export default function MethodSteps() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 65%'] });
  const progress = reduced ? 1 : scrollYProgress;

  return (
    <div ref={ref} className="relative">
      {/* Desktop line */}
      <div className="hidden md:block absolute left-0 right-0 top-[7px] h-px bg-neutral-200" aria-hidden="true">
        <motion.div className="h-full bg-brand-500 origin-left" style={{ scaleX: progress }} />
      </div>
      {/* Mobile line */}
      <div className="md:hidden absolute left-[7px] top-2 bottom-2 w-px bg-neutral-200" aria-hidden="true">
        <motion.div className="w-full h-full bg-brand-500 origin-top" style={{ scaleY: progress }} />
      </div>

      <ol className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6 list-none m-0 p-0">
        {STEPS.map((s) => (
          <li key={s.n} className="relative pl-8 md:pl-0 md:pt-10">
            <span
              className="absolute left-0 top-1 md:top-0 w-[15px] h-[15px] rounded-full bg-white border-2 border-brand-500"
              aria-hidden="true"
            />
            <div className="p-5 rounded-2xl bg-white border border-neutral-200 space-y-3 h-full">
              <div className="rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50">
                <img
                  src={s.img}
                  alt={s.alt}
                  width={s.w}
                  height={s.h}
                  loading="lazy"
                  decoding="async"
                  className="block w-full h-auto"
                />
              </div>
              <span className="block text-xs font-medium text-brand-600">Pasul {s.n}</span>
              <h3 className="font-serif text-xl text-neutral-950">{s.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
