import React, { useRef } from 'react';
import { motion, useReducedMotion, useScroll } from 'framer-motion';

const STEPS = [
  {
    n: '01',
    title: 'Audit & Calibrare CV',
    text: 'Incarci CV-ul curent, primesti raportul de compatibilitate si adaugi competentele cheie solicitate in anunturile tinta.',
    img: '/landing/method/audit-cv.webp',
    w: 670,
    h: 330,
    alt: 'Decupaj din CV Studio cu un CV demo',
  },
  {
    n: '02',
    title: 'Aplicare Tintita',
    text: 'Generezi scrisori de intentie specifice si inregistrezi aplicatia in board-ul Kanban pentru urmarire disciplinata.',
    img: '/landing/method/aplicare-tracker.webp',
    w: 513,
    h: 330,
    alt: 'Decupaj din board-ul Kanban cu aplicatii demo',
  },
  {
    n: '03',
    title: 'Drill-down Tehnic',
    text: 'Exersezi 15-20 de flashcard-uri zilnic pe stiva ta tehnica si parcurgi scenariile practice de arhitectura de sistem.',
    img: '/landing/method/drilldown-piata.webp',
    w: 950,
    h: 330,
    alt: 'Decupaj din Market Insights cu statistici despre piata IT',
  },
  {
    n: '04',
    title: 'Conversie in Oferta',
    text: 'Sustii interviul HR cu povesti clare prin metoda STAR, stapanesti intrebarile tehnice si negociezi pachetul salarial.',
    img: '/landing/method/oferta-scrisoare.webp',
    w: 545,
    h: 330,
    alt: 'Decupaj dintr-o scrisoare de intentie generata pentru un job demo',
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
        <motion.div className="h-full bg-neutral-900 origin-left" style={{ scaleX: progress }} />
      </div>
      {/* Mobile line */}
      <div className="md:hidden absolute left-[7px] top-2 bottom-2 w-px bg-neutral-200" aria-hidden="true">
        <motion.div className="w-full h-full bg-neutral-900 origin-top" style={{ scaleY: progress }} />
      </div>

      <ol className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6 list-none m-0 p-0">
        {STEPS.map((s) => (
          <li key={s.n} className="relative pl-8 md:pl-0 md:pt-10">
            <span
              className="absolute left-0 top-1 md:top-0 w-[15px] h-[15px] rounded-full bg-white border-2 border-neutral-900"
              aria-hidden="true"
            />
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-neutral-200 space-y-3.5 shadow-2xs h-full">
              <div className="rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50 aspect-[16/10]">
                <img
                  src={s.img}
                  alt={s.alt}
                  width={s.w}
                  height={s.h}
                  loading="lazy"
                  decoding="async"
                  className="block w-full h-full object-cover object-top-left"
                />
              </div>
              <span className="block text-xs font-mono font-bold text-neutral-400">PASUL {s.n}</span>
              <h3 className="text-lg sm:text-xl font-bold text-black">{s.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
