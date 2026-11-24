import React from 'react';
import { ArrowRight, GraduationCap, MessageSquare } from 'lucide-react';
import BrandMark from './ui/BrandMark';
import Footer from './Footer';
import MethodSteps from './landing/method';
import FaqAccordion from './landing/faq';
import { Reveal, RevealStagger, RevealItem, CountUp } from './landing/motion';
import { HeroShowcase } from './landing/hero';
import { TrackerFragment, CvFragment, FlashcardFragment, LinkedInFragment } from './landing/cells';
import useLenis, { smoothScrollTo } from './landing/lenis';
import { JOB_PLATFORMS } from '../data/jobPlatforms';
import { ALL_TECH_ANKI_CARDS } from '../data/decks';

// Cifre verificabile, numarate din date la build, nu scrise de mana.
const STATS = [
  { value: String(JOB_PLATFORMS.length), label: 'platforme de joburi scanate orar' },
  { value: String(ALL_TECH_ANKI_CARDS.length), label: 'flashcard-uri tehnice pentru interviu' },
  { value: 'Scor ATS', label: 'pe fiecare job, pentru CV-ul tău' },
];

const FEATURES = [
  {
    title: 'Tracker',
    text: 'Fiecare aplicație, pe etape, de la salvat la ofertă.',
    media: TrackerFragment,
    cta: 'Deschide Tracker',
    tab: 'tracker',
  },
  {
    title: 'Optimizare CV',
    text: 'Vezi ce cuvinte-cheie lipsesc din CV pentru fiecare job.',
    media: CvFragment,
    cta: 'Deschide CV-urile',
    tab: 'cv_library',
  },
  {
    title: 'Pregătire interviu',
    text: 'Flashcard-uri tehnice și întrebări HR, pe stack-ul tău.',
    media: FlashcardFragment,
    cta: 'Exersează întrebări',
    tab: 'skill_roadmap',
  },
  {
    title: 'Brand personal',
    text: 'Profil LinkedIn și README GitHub pe care recrutorii le găsesc.',
    media: LinkedInFragment,
    cta: 'Deschide LinkedIn Optimizer',
    tab: 'linkedin_optimizer',
  },
];

const FAQ = [
  {
    q: 'Mă ajută dacă sunt junior sau student?',
    a: 'Da. Vezi ce tehnologii cer companiile acum, cum să-ți prezinți proiectele în CV și exersezi întrebări reale de interviu.',
  },
  {
    q: 'Cum funcționează scorul ATS?',
    a: 'Extragem competențele și cuvintele-cheie din anunț și le comparăm cu CV-ul tău. Vezi exact ce lipsește.',
  },
  {
    q: 'Ce tehnologii acoperă flashcard-urile?',
    a: 'Java, Spring, SQL, React, testare, DevOps, cloud, Python, design patterns, system design și ML.',
  },
  {
    q: 'Datele mele sunt în siguranță?',
    a: 'CV-urile și aplicațiile stau în contul tău și nu sunt partajate cu platforme de recrutare.',
  },
];

// Ancora din meniu: deruleaza prin Lenis (ia in calcul scroll-mt de pe sectiune); fara Lenis ramane comportamentul nativ.
function anchorClick(e) {
  const hash = e.currentTarget.getAttribute('href');
  if (smoothScrollTo(hash)) e.preventDefault();
}

const CONTAINER = 'max-w-6xl mx-auto border-x border-neutral-200';

function SectionHeading({ id, title, subtitle, center = false }) {
  return (
    <Reveal className={`px-6 sm:px-10 py-14 sm:py-16 ${center ? 'text-center' : ''}`}>
      <h2 id={id} className="font-serif text-4xl sm:text-5xl font-normal tracking-tight text-neutral-950 leading-tight">
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-base sm:text-lg text-neutral-500">{subtitle}</p>}
    </Reveal>
  );
}

export default function LandingPage({
  onNavigateTab,
  currentUser,
  onOpenAuth
}) {
  const go = (tab) => onNavigateTab && onNavigateTab(tab);
  useLenis();

  return (
    <div data-testid="landing" className="w-full bg-white text-neutral-950 font-sans">

      {/* BARA DE SUS */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => { if (!smoothScrollTo(0)) window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
            aria-label="JobFlow AI, începutul paginii"
          >
            <BrandMark />
          </button>

          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-neutral-600">
            <a href="#functionalitati" onClick={anchorClick} className="px-3 py-2 rounded-lg hover:text-neutral-950 hover:bg-neutral-100 transition">Funcționalități</a>
            <a href="#metodologie" onClick={anchorClick} className="px-3 py-2 rounded-lg hover:text-neutral-950 hover:bg-neutral-100 transition">Metodologie</a>
            <a href="#intrebari" onClick={anchorClick} className="px-3 py-2 rounded-lg hover:text-neutral-950 hover:bg-neutral-100 transition">Întrebări</a>
            <button
              type="button"
              onClick={() => go('feedback')}
              className="px-3 py-2 rounded-lg hover:text-neutral-950 hover:bg-neutral-100 transition cursor-pointer"
            >
              Feedback
            </button>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => go('feedback')}
              aria-label="Feedback"
              className="lg:hidden p-2 rounded-lg border border-neutral-200 text-neutral-600 hover:text-neutral-950 transition cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            {!currentUser && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="hidden sm:inline-block text-sm font-semibold text-neutral-700 hover:text-neutral-950 px-3 py-2 rounded-lg hover:bg-neutral-100 transition cursor-pointer"
              >
                Conectare
              </button>
            )}
            <button
              type="button"
              onClick={() => go('tracker')}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition cursor-pointer"
            >
              <span>Deschide aplicația</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 1. HERO */}
      <section aria-label="Prezentare" className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-b from-brand-100/70 via-brand-50/60 to-white">
        <div className={`${CONTAINER} relative px-4 sm:px-10 pt-14 sm:pt-20 pb-16 sm:pb-20`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-[64px] font-normal tracking-tight leading-[1.05] text-neutral-950">
                Găsește jobul. Trece de ATS. Ia oferta.
              </h1>
              <p className="text-lg text-neutral-600 max-w-2xl leading-relaxed">
                Multe CV-uri pică filtrul ATS. Află ce lipsește din al tău.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => go('tracker')}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-semibold transition cursor-pointer"
                >
                  <span>Începe gratuit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => go('skill_roadmap')}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-200 font-semibold transition cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-neutral-500" />
                  <span>Pregătire interviuri</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <HeroShowcase />
            </div>
          </div>
        </div>
      </section>

      {/* 2. CIFRE */}
      <section aria-label="Cifre" className="border-b border-neutral-200">
        <RevealStagger className={CONTAINER}>
          <dl className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200">
            {STATS.map((s) => (
              <RevealItem key={s.label} className="px-6 sm:px-8 py-10 flex flex-col-reverse gap-2">
                <dt className="text-sm text-neutral-500">{s.label}</dt>
                <dd className="font-serif text-4xl sm:text-5xl text-neutral-950 tracking-tight">
                  <CountUp value={s.value} />
                </dd>
              </RevealItem>
            ))}
          </dl>
        </RevealStagger>
      </section>

      {/* 3. FUNCTIONALITATI */}
      <section id="functionalitati" aria-label="Funcționalități" className="border-b border-neutral-200 scroll-mt-16">
        <div className={CONTAINER}>
          <div className="border-b border-neutral-200">
            <SectionHeading title="Tot procesul, într-un singur loc." subtitle="Patru module, de la anunț la ofertă." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-200">
            {FEATURES.map((f) => {
              const Media = f.media;
              return (
                <Reveal key={f.title} className="bg-white p-6 sm:p-10 flex flex-col gap-5">
                  <div>
                    <h3 className="font-serif text-2xl sm:text-3xl text-neutral-950">{f.title}</h3>
                    <p className="mt-2 text-neutral-500">{f.text}</p>
                  </div>
                  {Media && <Media />}
                  <button
                    type="button"
                    onClick={() => go(f.tab)}
                    className="mt-auto self-start inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition cursor-pointer"
                  >
                    <span>{f.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. METODOLOGIE */}
      <section id="metodologie" aria-label="Metodologie" className="border-b border-neutral-200 scroll-mt-16">
        <div className={CONTAINER}>
          <SectionHeading title="Patru pași până la ofertă." subtitle="Un proces simplu, pe care îl repeți pentru fiecare job." />
          <div className="px-6 sm:px-10 pb-16">
            <MethodSteps />
          </div>
        </div>
      </section>

      {/* 5. FAQ */}
      <section id="intrebari" aria-label="Întrebări frecvente" className="border-b border-neutral-200 scroll-mt-16">
        <div className={CONTAINER}>
          <SectionHeading title="Întrebări frecvente" subtitle="Răspunsuri scurte la ce ne întreabă lumea des." center />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
            <FaqAccordion items={FAQ} />
          </div>
        </div>
      </section>

      {/* 6. CTA FINAL */}
      <section aria-label="Începe" className="border-b border-neutral-200 bg-gradient-to-b from-white to-brand-50/70">
        <Reveal className={`${CONTAINER} px-6 py-20 sm:py-24 text-center`}>
          <h2 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-neutral-950 leading-tight">
            Următorul tău job începe aici.
          </h2>
          <button
            type="button"
            onClick={() => go('tracker')}
            className="mt-9 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-semibold transition cursor-pointer"
          >
            <span>Deschide JobFlow AI</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </Reveal>
      </section>

      {/* 7. FOOTER */}
      <Footer onNavigateTab={onNavigateTab} />
    </div>
  );
}
