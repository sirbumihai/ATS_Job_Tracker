import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Layers, 
  Terminal, 
  Check, 
  ArrowRight, 
  Compass, 
  Award, 
  Sliders, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Code2, 
  Briefcase, 
  GraduationCap,
  ChevronRight,
  ShieldCheck,
  Zap,
  MousePointerClick
} from 'lucide-react';

export default function HeroShowcaseStudio({ onNavigateTab, onOpenUpload, onOpenAddJob }) {
  // Category state: 'design_taste' (/design-taste-frontend) or 'impeccable' (/impeccable)
  const [activeCategory, setActiveCategory] = useState(() => {
    return localStorage.getItem('ats_hero_category') || 'design_taste';
  });

  // Selected Style ID
  const [selectedStyleId, setSelectedStyleId] = useState(() => {
    return localStorage.getItem('ats_hero_style_id') || 'style_1';
  });

  // Confirmed Global Style
  const [savedGlobalStyle, setSavedGlobalStyle] = useState(() => {
    return localStorage.getItem('ats_preferred_hero_style') || null;
  });

  const [notificationMessage, setNotificationMessage] = useState(null);

  // Interactive state for Hero 7 (Haptic Nordic Interactive)
  const [hapticTab, setHapticTab] = useState('benchmarks'); // 'benchmarks' | 'matching' | 'questions'

  useEffect(() => {
    localStorage.setItem('ats_hero_category', activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    localStorage.setItem('ats_hero_style_id', selectedStyleId);
  }, [selectedStyleId]);

  // Handle Global Selection
  const handleSelectAsGlobal = (styleKey, styleTitle) => {
    localStorage.setItem('ats_preferred_hero_style', styleKey);
    setSavedGlobalStyle(styleKey);
    setNotificationMessage(`Ai ales stilul "${styleTitle}" ca directie vizuala pentru intregul website!`);
    setTimeout(() => {
      setNotificationMessage(null);
    }, 4500);
  };

  // Curated Catalog focused strictly on the user's favorite elements:
  // - Kinetic Editorial typography & manifesto copy
  // - Clean architectural Distill & Cold Luxury Swiss precision
  // - Nordic Calm floating tilted card stack
  const STYLES_CATALOG = {
    design_taste: [
      {
        id: 'style_1',
        title: 'Swiss Kinetic Fusion',
        subtitle: 'Text Kinetic Manifesto + Fundal Cold Luxury + Carduri Nordic Rotite',
        dials: 'VARIANCE: 8 | MOTION: 6 | DENSITY: 3',
        archetype: 'Swiss Cold Luxury & Nordic Tilt',
        palette: 'Titanium Slate (#f8fafc) · Cobalt Hairlines · Pure White Core',
        typography: 'Kinetic Display + Italic Descender Clearance',
        badge: 'Recomandat'
      },
      {
        id: 'style_2',
        title: 'Architectural Distill Editorial',
        subtitle: 'Text Kinetic + Puritate Stark Distill + Carduri Albe Minimale',
        dials: 'VARIANCE: 7 | MOTION: 4 | DENSITY: 2',
        archetype: 'Monolithic Architectural Distill',
        palette: 'Stark Pure White (#ffffff) · Absolute Ink (#000000) · Zero Fluff',
        typography: 'Monumental Serifless + Decisive Single Pill CTA',
        badge: 'Ultra Clean'
      },
      {
        id: 'style_3',
        title: 'Swiss Precision Specification',
        subtitle: 'Text Kinetic + Linii Swiss + Carduri Tehnice Rotite + Dock Metrice',
        dials: 'VARIANCE: 7 | MOTION: 5 | DENSITY: 4',
        archetype: 'Swiss Specification & Dock',
        palette: 'Silver-Slate (#f1f5f9) · Slate-950 · 4-Metric Precision Strip',
        typography: 'Swiss Geometric Grotesque + Micro-Pill Eyebrow',
        badge: 'Precision'
      },
      {
        id: 'style_4',
        title: 'Monochrome Studio Split',
        subtitle: 'Text Kinetic Cursiv + Contrast Monocrom + Card Stack 3 Nivele',
        dials: 'VARIANCE: 8 | MOTION: 7 | DENSITY: 3',
        archetype: 'Monochrome 3-Tier Tilt Stack',
        palette: 'High-Contrast Monochrome (#fafafa) · Charcoal · Progressive Angle',
        typography: 'Kinetic Tension + Triple Layered Angular Cards',
        badge: 'Studio Split'
      }
    ],
    impeccable: [
      {
        id: 'style_5',
        title: 'Nordic Distill Studio',
        subtitle: 'Text Kinetic + Tonuri Calme Nordic (#f8f9fa) + Carduri Organice',
        dials: 'MODE: Persuade / Craft Floor | Calibrated Calm',
        archetype: 'Nordic Organic Floating Cards',
        palette: 'Calibrated Mist (#f8f9fa) · Forest Green (#15803d) · Slate-600',
        typography: 'Airy Modern Sans + Serene Conversational Copy',
        badge: 'Nordic Calm'
      },
      {
        id: 'style_6',
        title: 'Architectural Zen Stack',
        subtitle: 'Scara Monumentala (7xl) + Carduri Floating Arhitecturale',
        dials: 'MODE: Persuade / Distill | Radical Reduction to Essence',
        archetype: 'Zen Architectural Plates',
        palette: 'Pure Gallery White · Whisper Thin Hairlines · Black Accent',
        typography: 'Monolithic Typography + Whisper Specs Row',
        badge: 'Zen Distill'
      },
      {
        id: 'style_7',
        title: 'Haptic Nordic Interactive',
        subtitle: 'Carduri Rotite Interactive cu Comutator Live intre Moduri',
        dials: 'MODE: Experience / Delight | Physical Interactive Motion',
        archetype: 'Haptic Rotated Card Tabs',
        palette: 'Slate-100 Hardware · Indigo-600 · Dual Rotated Responsive Cards',
        typography: 'Clean Sans + Dynamic Tab Flipping Logic',
        badge: 'Interactive'
      },
      {
        id: 'style_8',
        title: 'Craft Floor $150k Agency Edition',
        subtitle: 'Sinteza Suprema: Text Kinetic + Linii Swiss + Carduri Nordic Rotite',
        dials: 'MODE: Persuade / Craft Floor | Out-of-Distribution Craft',
        archetype: 'Concentric Double-Bezel Hardware',
        palette: 'Titanium Shell · Pure White Core · Concentric Math Radii',
        typography: 'Kinetic Tension with Same-Family Italic + Button-in-Button',
        badge: 'Top Agency'
      }
    ]
  };

  const currentStylesList = STYLES_CATALOG[activeCategory] || STYLES_CATALOG.design_taste;
  const currentStyleMeta = currentStylesList.find(s => s.id === selectedStyleId) || currentStylesList[0];

  const handleCategoryChange = (newCat) => {
    setActiveCategory(newCat);
    if (newCat === 'design_taste') {
      setSelectedStyleId('style_1');
    } else {
      setSelectedStyleId('style_5');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 font-sans">
      
      {/* ========================================================= */}
      {/* TOP CONTROL BAR: HERO SHOWCASE SWITCHER DOCK */}
      {/* ========================================================= */}
      <div className="bg-slate-100/90 p-1.5 rounded-[2.25rem] border border-slate-200/90 shadow-md sticky top-14 z-30 backdrop-blur-md">
        <div className="bg-white rounded-[calc(2.25rem-0.375rem)] border border-slate-200/70 p-4 sm:p-5 shadow-xs space-y-4">
          
          {/* TOP ROW: CATEGORY SWITCHER & NOTIFICATION */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-indigo-600 text-white shadow-2xs">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h1 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                  Hero Design Studio <span className="text-indigo-600 font-mono text-xs">(Curated Favorites)</span>
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Sinteza rafinata: <strong className="text-slate-800">Textul Kinetic Editorial</strong> + <strong className="text-slate-800">Puritatea Swiss/Distill</strong> + <strong className="text-slate-800">Cardurile plutitoare Nordic Calm</strong>.
              </p>
            </div>

            {/* CATEGORY SELECTOR TABS */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80 gap-1 shrink-0">
              <button
                onClick={() => handleCategoryChange('design_taste')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === 'design_taste'
                    ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-indigo-500/20'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-white/80'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>/design-taste-frontend</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeCategory === 'design_taste' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-600'}`}>
                  4 variante
                </span>
              </button>

              <button
                onClick={() => handleCategoryChange('impeccable')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === 'impeccable'
                    ? 'bg-purple-600 text-white shadow-xs ring-1 ring-purple-500/20'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-white/80'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>/impeccable</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeCategory === 'impeccable' ? 'bg-purple-700 text-purple-100' : 'bg-slate-200 text-slate-600'}`}>
                  4 variante
                </span>
              </button>
            </div>
          </div>

          {/* SECOND ROW: STYLE SELECTOR PILLS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            {currentStylesList.map((st, index) => {
              const isSelected = selectedStyleId === st.id;
              const isGlobalSaved = savedGlobalStyle === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setSelectedStyleId(st.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer whitespace-nowrap flex items-center gap-2 shrink-0 border ${
                    isSelected
                      ? activeCategory === 'design_taste'
                        ? 'bg-slate-950 text-white border-black shadow-xs ring-2 ring-indigo-500/40'
                        : 'bg-slate-950 text-white border-black shadow-xs ring-2 ring-purple-500/40'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {index + 1}
                  </span>
                  <span>{st.title}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                    isSelected ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-200/80 text-slate-500'
                  }`}>
                    {st.badge}
                  </span>
                  {isGlobalSaved && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-200 animate-pulse" title="Stilul ales pentru tot site-ul" />
                  )}
                </button>
              );
            })}
          </div>

          {/* THIRD ROW: ACTIVE STYLE SPECS & CONFIRMATION BUTTON */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3 flex-wrap text-xs">
              <span className="font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/70">
                {currentStyleMeta.dials}
              </span>
              <span className="text-slate-600 font-medium">
                Concept: <strong className="text-slate-900">{currentStyleMeta.archetype}</strong>
              </span>
              <span className="text-slate-600 font-medium hidden sm:inline">
                Palette: <strong className="text-slate-900">{currentStyleMeta.palette}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => handleSelectAsGlobal(currentStyleMeta.id, currentStyleMeta.title)}
                className={`group px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer flex items-center gap-2 shadow-xs ${
                  savedGlobalStyle === currentStyleMeta.id
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                }`}
              >
                {savedGlobalStyle === currentStyleMeta.id ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                    <span>Selectat ca Stil Global!</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Alege acest stil pentru tot website-ul</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* NOTIFICATION BANNER */}
          {notificationMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-2 animate-in fade-in duration-200 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{notificationMessage}</span>
            </div>
          )}

        </div>
      </div>

      {/* ========================================================= */}
      {/* 4 STYLES UNDER /design-taste-frontend */}
      {/* ========================================================= */}

      {/* --------------------------------------------------------- */}
      {/* STYLE 1: SWISS KINETIC FUSION (/design-taste-frontend) */}
      {/* --------------------------------------------------------- */}
      {selectedStyleId === 'style_1' && (
        <div className="bg-[#f8fafc] text-slate-950 rounded-[2.5rem] p-6 sm:p-12 lg:p-16 border border-slate-300/80 shadow-sm relative overflow-hidden">
          {/* Subtle Titanium Radial Light */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            
            {/* LEFT SIDE: KINETIC MANIFESTO TEXT */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-white text-slate-800 border border-slate-300 shadow-2xs">
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                SWISS SPECIFICATION · RECRUITMENT ENGINE 2026
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-slate-950 pb-1">
                Viitorul carierei tale nu este o loterie <span className="italic font-normal underline decoration-slate-300 decoration-2">tehnica</span>.
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl font-normal">
                Companiile primesc 300 de CV-uri pe minut. Algoritmii resping 85% in primele secunde din cauza formatarii gresite si lipsei cuvintelor cheie. Noi intoarcem algoritmul in favoarea ta prin parsare vectoriala, reconstructie STAR si compatibilitate de 100%.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button 
                  onClick={() => onNavigateTab && onNavigateTab('cv_studio')}
                  className="group px-6 py-3.5 rounded-full text-xs font-black bg-slate-950 hover:bg-blue-600 text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <span>Incepe Auditul CV Gratuit</span>
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center transition-transform group-hover:scale-110">
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </span>
                </button>

                <button 
                  onClick={() => onNavigateTab && onNavigateTab('skill_roadmap')}
                  className="px-6 py-3.5 rounded-full text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer"
                >
                  Exploreaza Roadmap Tehnic
                </button>
              </div>

              {/* Swiss Minimal Telemetry Whisper */}
              <div className="pt-4 flex items-center gap-4 text-xs font-mono text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> 100% Parsing Valid
                </span>
                <span>•</span>
                <span>Sub-15ms pgvector HNSW</span>
                <span>•</span>
                <span>0 Diacritice Cliseu</span>
              </div>
            </div>

            {/* RIGHT SIDE: ELEVATED NORDIC TILTED CARD STACK */}
            <div className="lg:col-span-5 relative space-y-4 pt-4 lg:pt-0">
              {/* CARD 1: TECHNICAL BENCHMARK (TILTED 1.5 DEG) */}
              <div className="p-6 rounded-3xl bg-white border border-slate-300 shadow-md transform rotate-1.5 transition-transform hover:rotate-0 duration-300 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span className="text-xs font-black text-slate-900">Benchmark Tehnic UPB / Politehnica</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    ATS Match: 98%
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Sincronizare automata cu cerintele reale din piata IT (Java 21, Spring Boot, PostgreSQL, Docker). Proiecte structurate pe formula Google XYZ.
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">Java 21 Virtual Threads</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">Spring Boot 3</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">pgvector HNSW</span>
                </div>
              </div>

              {/* CARD 2: RECRUITER VERIFIED DIRECT (TILTED -1.5 DEG) */}
              <div className="p-6 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-xl transform -rotate-1.5 transition-transform hover:rotate-0 duration-300 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-indigo-300 font-mono flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Recruiter Pass Verified
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                    P99 &lt; 14ms
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  „Formatare curata, fara blocaje de parser si fara tabele invizibile. Candidatul a fost directionat direct catre interviul tehnic in 48 de ore.”
                </p>

                <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
                  <span>Bucuresti & Remote Romania</span>
                  <span className="text-white font-mono font-bold">4 Invitatii Active</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* STYLE 2: ARCHITECTURAL DISTILL EDITORIAL (/design-taste-frontend) */}
      {/* --------------------------------------------------------- */}
      {selectedStyleId === 'style_2' && (
        <div className="bg-white text-black rounded-[2.5rem] p-8 sm:p-14 lg:p-20 border border-black/[0.08] shadow-xs relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* LEFT: MONUMENTAL MANIFESTO */}
            <div className="lg:col-span-7 space-y-8">
              <div className="text-[11px] font-mono tracking-widest uppercase text-neutral-400 font-bold">
                [ ARCHITECTURAL DISTILL · PURITATE RADICALA ]
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.98] text-black">
                Viitorul carierei tale nu este o loterie <span className="italic font-normal">tehnica</span>.
              </h1>

              <p className="text-sm text-neutral-600 leading-relaxed max-w-lg font-normal">
                Fara decoratiuni sterile. Eliminam zgomotul si cliseele din aplicatii pentru ca experienta ta inginereasca sa vorbeasca clar in fata comisiilor tehnice de angajare.
              </p>

              <div>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('cv_studio')}
                  className="group px-8 py-4 rounded-full text-xs font-black bg-black hover:bg-neutral-800 text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer inline-flex items-center gap-3 shadow-sm"
                >
                  <span>Acceseaza Studio CV</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              <div className="pt-8 border-t border-black/[0.08] grid grid-cols-3 gap-6 text-xs text-neutral-500 font-mono">
                <div>
                  <strong className="block text-black font-black text-sm">0%</strong>
                  Diacritice Cliseu
                </div>
                <div>
                  <strong className="block text-black font-black text-sm">100%</strong>
                  Parsing Valid
                </div>
                <div>
                  <strong className="block text-black font-black text-sm">&lt; 15ms</strong>
                  Latenta Rulare
                </div>
              </div>
            </div>

            {/* RIGHT: GALLERY-GRADE MINIMAL TILTED CARDS */}
            <div className="lg:col-span-5 relative space-y-4">
              <div className="p-7 rounded-3xl bg-neutral-50 border border-neutral-200/80 shadow-xs transform -rotate-1 transition-transform hover:rotate-0 duration-300 space-y-3">
                <div className="text-xs font-black text-black tracking-tight flex items-center justify-between">
                  <span>Standard Ingineresc UPB</span>
                  <span className="font-mono text-neutral-500">2026.04</span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Structura liniara validata pentru companii de inalta tehnologie. Focus pe modularitate, zero clisee descriptive.
                </p>
                <div className="pt-2 text-[11px] font-mono text-neutral-400">
                  Java 21 · Spring Boot · PostgreSQL · Docker
                </div>
              </div>

              <div className="p-7 rounded-3xl bg-black text-white shadow-xl transform rotate-1.5 transition-transform hover:rotate-0 duration-300 space-y-3">
                <div className="text-xs font-black tracking-tight text-neutral-300 flex items-center justify-between">
                  <span>Rezultat Evaluare Semantica</span>
                  <span className="font-mono text-emerald-400">MATCH: 99%</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                  „Candidatul bifeaza 100% din cerintele esentiale din JD fara formule redundante. Validat pentru etapa tehnica.”
                </p>
                <div className="pt-2 text-[11px] font-mono text-neutral-500">
                  Invitatia transmisa in mai putin de 48 ore
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* STYLE 3: SWISS PRECISION SPECIFICATION (/design-taste-frontend) */}
      {/* --------------------------------------------------------- */}
      {selectedStyleId === 'style_3' && (
        <div className="bg-[#f1f5f9] text-slate-900 rounded-[2.5rem] p-6 sm:p-12 lg:p-16 border border-slate-300 shadow-sm relative overflow-hidden">
          <div className="max-w-6xl mx-auto space-y-10">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* LEFT */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.25em] bg-white text-slate-800 border border-slate-300 shadow-2xs">
                  <Compass className="w-3.5 h-3.5 text-blue-600" />
                  SPECIFICATIE MATEMATICA ELVETIANA · ATS 2026
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-slate-950 pb-1">
                  Viitorul carierei tale nu este o loterie <span className="italic font-normal underline decoration-blue-500 decoration-2">tehnica</span>.
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 max-w-lg leading-relaxed font-normal">
                  Algoritm de potrivire bidirectionala intre experienta ta reala de programare si filtrele ATS utilizate de companiile de top.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => onNavigateTab && onNavigateTab('job_search')}
                    className="px-6 py-3 rounded-xl text-xs font-black bg-slate-950 hover:bg-blue-600 text-white transition-all cursor-pointer shadow-xs"
                  >
                    Lanseaza Cautarea de Joburi
                  </button>
                  <button
                    onClick={() => onNavigateTab && onNavigateTab('cover_letter')}
                    className="px-6 py-3 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition-all cursor-pointer"
                  >
                    Generator Cover Letter
                  </button>
                </div>
              </div>

              {/* RIGHT TILTED CARDS */}
              <div className="lg:col-span-5 relative space-y-3">
                <div className="p-5 rounded-2xl bg-white border border-slate-300 shadow-sm transform -rotate-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                    <span>Index Vectorial Cosinus</span>
                    <span className="font-mono text-blue-600 font-black">0.962</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Comparatie directa intre JD si profilul tehnic: 100% acoperire cerinte obligatorii.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-lg transform rotate-1">
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span>Sincronizare CV & GitHub</span>
                    <span className="font-mono text-emerald-400">ACTIV</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Proiectele cu virtual threads si microservicii sunt evidentiate in prim-plan.
                  </p>
                </div>
              </div>
            </div>

            {/* BOTTOM SWISS 4-METRIC STRIP */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-300 text-left">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">PARSING ACCURACY</span>
                <span className="text-xl font-black text-slate-950 font-mono">100.0%</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">SEARCH SPEED</span>
                <span className="text-xl font-black text-slate-950 font-mono">&lt; 15ms</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">RECRUITER VISIBILITY</span>
                <span className="text-xl font-black text-slate-950 font-mono">3.5x</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">DIACRITICS POLICY</span>
                <span className="text-xl font-black text-slate-950 font-mono">0 ERRORS</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* STYLE 4: MONOCHROME STUDIO SPLIT (/design-taste-frontend) */}
      {/* --------------------------------------------------------- */}
      {selectedStyleId === 'style_4' && (
        <div className="bg-[#fafafa] text-slate-950 rounded-[2.5rem] p-6 sm:p-12 lg:p-16 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* LEFT */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold block">
                [ STUDIO KINETIC MANIFESTO ]
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-slate-950 pb-1">
                Viitorul carierei tale nu este o loterie <span className="italic font-normal underline decoration-slate-300">tehnica</span>.
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg font-normal">
                Scapa de nesiguranta aplicatiilor oarbe. Platforma noastra reconstruieste profilul tau dupa rigorile celor mai exigente echipe de inginerie software.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigateTab && onNavigateTab('tracker')}
                  className="px-6 py-3.5 rounded-full text-xs font-black bg-slate-950 hover:bg-slate-800 text-white transition-all cursor-pointer"
                >
                  Deschide Tracker Aplicatii
                </button>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('linkedin_optimizer')}
                  className="px-6 py-3.5 rounded-full text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition-all cursor-pointer"
                >
                  Optimizator LinkedIn
                </button>
              </div>
            </div>

            {/* RIGHT 3-TIER TILTED STACK */}
            <div className="lg:col-span-5 relative space-y-3">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs transform -rotate-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>1. Structura STAR Reconstructie</span>
                  <span className="text-emerald-600 font-mono">VALID</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-100/90 border border-slate-300/80 shadow-xs transform rotate-0">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                  <span>2. Scanare Automata Piata IT</span>
                  <span className="font-mono text-indigo-600">8.5k Joburi</span>
                </div>
                <p className="text-[11px] text-slate-500">eJobs, BestJobs, LinkedIn agregate la fiecare 30 de minute.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 text-white shadow-xl transform rotate-2">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span>3. Rata de Succes la Interviuri</span>
                  <span className="font-mono text-emerald-400">94.8%</span>
                </div>
                <p className="text-[11px] text-slate-400">Candidatii primesc raspunsuri directe cu 3.5x mai rapid.</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4 STYLES UNDER /impeccable */}
      {/* ========================================================= */}

      {/* --------------------------------------------------------- */}
      {/* STYLE 5: NORDIC DISTILL STUDIO (/impeccable) */}
      {/* --------------------------------------------------------- */}
      {selectedStyleId === 'style_5' && (
        <div className="bg-[#f8f9fa] text-slate-800 rounded-[2.5rem] p-6 sm:p-12 lg:p-16 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* LEFT: CALM NORDIC COPY WITH KINETIC STATEMENT */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Calm & Claritate in Cariera · Craft Floor
              </span>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08] pb-1">
                Viitorul carierei tale nu este o loterie <span className="italic font-normal underline decoration-emerald-400 decoration-2">tehnica</span>.
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-lg">
                Fara spam de aplicatii, fara frustrare. Analizam cerintele tehnice reale si iti aratam exact ce lipseste din profilul tau pentru a trece cu brio de primul interviu tehnic.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button 
                  onClick={() => onNavigateTab && onNavigateTab('skill_roadmap')}
                  className="px-6 py-3.5 rounded-2xl text-xs font-black bg-emerald-700 hover:bg-emerald-800 text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer shadow-sm"
                >
                  Exploreaza Roadmap-urile Gratuite
                </button>

                <button 
                  onClick={() => onNavigateTab && onNavigateTab('cv_library')}
                  className="px-6 py-3.5 rounded-2xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 transition cursor-pointer"
                >
                  Vezi CV-urile Tale
                </button>
              </div>
            </div>

            {/* RIGHT: THE AUTHENTIC NORDIC FLOATING CARD STACK */}
            <div className="lg:col-span-5 relative space-y-3">
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs transform rotate-1 transition-transform hover:rotate-0 duration-300">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-2">
                  <span>Pregatire Interviuri UPB / Politehnica</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded text-[10px] font-bold">100% Gratuit</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Banci de 150+ intrebari reale de Java 21, Spring Boot, SQL si Arhitectura Enterprise.
                </p>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sincronizat cu programa academica</span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl transform -rotate-1 transition-transform hover:rotate-0 duration-300">
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span>Mentor Digital Integrat</span>
                  <span className="text-indigo-400 text-[10px] font-mono">AI Active</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Iti recomanda solutii concrete si proiecte practice de adaugat in portofoliu pentru a convinge recruiterii IT.
                </p>
                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Reconstructie STAR automata</span>
                  <span className="text-emerald-400 font-bold">100% Recomandat</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* STYLE 6: ARCHITECTURAL ZEN STACK (/impeccable) */}
      {/* --------------------------------------------------------- */}
      {selectedStyleId === 'style_6' && (
        <div className="bg-white text-black rounded-[2.5rem] p-8 sm:p-14 lg:p-20 border border-black/10 shadow-xs relative overflow-hidden">
          <div className="max-w-6xl mx-auto space-y-12">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* LEFT */}
              <div className="lg:col-span-7 space-y-6">
                <div className="text-[11px] font-mono tracking-widest uppercase text-neutral-400 font-bold">
                  MODE: PERSUADE / DISTILL · ESSENCE
                </div>

                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.98] text-black">
                  Viitorul carierei tale nu este o loterie <span className="italic font-normal">tehnica</span>.
                </h1>

                <p className="text-sm text-neutral-600 leading-relaxed max-w-md font-normal">
                  Un singur CV clar redactat depaseste sute de incercari oarbe. Algoritmi simpli, rapizi si precisi care iti aduc rezultate fara zgomot.
                </p>

                <div>
                  <button
                    onClick={() => onNavigateTab && onNavigateTab('cv_studio')}
                    className="px-8 py-4 rounded-full text-xs font-black bg-black hover:bg-neutral-800 text-white transition-all cursor-pointer shadow-sm inline-flex items-center gap-2"
                  >
                    <span>Lanseaza Optimizarea CV</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* RIGHT ARCHITECTURAL FLOATING PLATES */}
              <div className="lg:col-span-5 relative space-y-4">
                <div className="p-6 rounded-3xl bg-neutral-50 border border-neutral-200 shadow-2xs transform -rotate-1.5">
                  <div className="text-xs font-bold text-black mb-1">Standard Academic & Tehnic</div>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Formatare omologata pentru parsere ATS globale (Workday, Taleo, Greenhouse).
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-black text-white shadow-xl transform rotate-1">
                  <div className="text-xs font-bold text-neutral-200 mb-1 flex items-center justify-between">
                    <span>Evaluare Finala</span>
                    <span className="font-mono text-emerald-400">SCOR: 98/100</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                    Fara formule redundante. Candidatul a fost directionat direct la interviul cu Engineering Manager-ul.
                  </p>
                </div>
              </div>
            </div>

            {/* BOTTOM WHISPER SPECS */}
            <div className="pt-8 border-t border-black/[0.08] grid grid-cols-3 gap-6 text-xs text-neutral-500 font-mono">
              <div>
                <strong className="block text-black font-black text-sm">0%</strong>
                Diacritice Cliseu
              </div>
              <div>
                <strong className="block text-black font-black text-sm">100%</strong>
                Parsing Valid
              </div>
              <div>
                <strong className="block text-black font-black text-sm">&lt; 15ms</strong>
                Latenta Rulare
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* STYLE 7: HAPTIC NORDIC INTERACTIVE (/impeccable) */}
      {/* --------------------------------------------------------- */}
      {selectedStyleId === 'style_7' && (
        <div className="bg-[#f3f4f6] text-slate-800 rounded-[2.5rem] p-6 sm:p-12 lg:p-16 border border-slate-300 shadow-xl relative overflow-hidden">
          <div className="max-w-6xl mx-auto space-y-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* LEFT */}
              <div className="lg:col-span-7 space-y-6">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  MODE: EXPERIENCE / DELIGHT · HAPTIC INTERACTIVE
                </span>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.08]">
                  Viitorul carierei tale nu este o loterie <span className="italic font-normal underline decoration-indigo-400 decoration-2">tehnica</span>.
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 max-w-lg leading-relaxed font-normal">
                  Testeaza interactiv cele trei etape de validare pe care le parcurge dosarul tau de aplicare inainte de chemarea la interviu.
                </p>

                {/* Haptic Tab Controls */}
                <div className="flex bg-slate-200/80 p-1.5 rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] border border-slate-300/70 gap-1 max-w-md">
                  <button
                    onClick={() => setHapticTab('benchmarks')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      hapticTab === 'benchmarks' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-600'
                    }`}
                  >
                    1. Benchmark
                  </button>
                  <button
                    onClick={() => setHapticTab('matching')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      hapticTab === 'matching' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-600'
                    }`}
                  >
                    2. Match ATS
                  </button>
                  <button
                    onClick={() => setHapticTab('questions')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      hapticTab === 'questions' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-600'
                    }`}
                  >
                    3. Interviu
                  </button>
                </div>
              </div>

              {/* RIGHT: HAPTIC CARDS REACTING TO ACTIVE TAB */}
              <div className="lg:col-span-5 relative space-y-4">
                {hapticTab === 'benchmarks' && (
                  <div className="p-6 rounded-3xl bg-white border border-slate-300 shadow-md transform rotate-1 animate-in fade-in zoom-in-95 duration-200 space-y-3">
                    <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase block">PASUL 1 · CRITERII TEHNICE</span>
                    <h3 className="text-sm font-black text-slate-950">Validare Stiva Tehnica Java / Spring</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Verificare proiecte cu Virtual Threads, interogari relationale PostgreSQL si containere Docker.
                    </p>
                  </div>
                )}

                {hapticTab === 'matching' && (
                  <div className="p-6 rounded-3xl bg-white border border-slate-300 shadow-md transform -rotate-1 animate-in fade-in zoom-in-95 duration-200 space-y-3">
                    <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase block">PASUL 2 · SIMULARE PARSER</span>
                    <h3 className="text-sm font-black text-slate-950">Scor de Compatibilitate 98%</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Format vectorial 100% parsabil in mai putin de 15 milisecunde. Toate cuvintele cheie sunt aliniate.
                    </p>
                  </div>
                )}

                {hapticTab === 'questions' && (
                  <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl transform rotate-1.5 animate-in fade-in zoom-in-95 duration-200 space-y-3">
                    <span className="text-[10px] font-mono text-indigo-300 font-bold uppercase block">PASUL 3 · PREGATIRE TEHNICA</span>
                    <h3 className="text-sm font-black text-white">Banca de 150+ Intrebari Live</h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Intrebari concrete de sistem distribuite, JVM memory management si optimizare de baze de date.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* STYLE 8: CRAFT FLOOR $150K AGENCY EDITION (/impeccable) */}
      {/* --------------------------------------------------------- */}
      {selectedStyleId === 'style_8' && (
        <div className="bg-slate-100/80 p-1.5 rounded-[2.5rem] border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="bg-white rounded-[calc(2.5rem-0.375rem)] border border-slate-200/60 p-6 sm:p-12 lg:p-16 shadow-xs relative overflow-hidden">
            
            {/* Subtle Ambient Radial Backlight */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-indigo-100/40 via-slate-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              
              {/* LEFT: BESPOKE AGENCY MANIFESTO */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  PEAK CRAFT FLOOR · SINTEZA SUPREMA $150K
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-slate-950 pb-1">
                  Viitorul carierei tale nu este o loterie <span className="italic font-normal underline decoration-indigo-400 decoration-2">tehnica</span>.
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl font-normal">
                  Companiile primesc 300 de CV-uri pe minut. Algoritmii resping 85% in primele secunde din cauza formatarii gresite si lipsei cuvintelor cheie. Noi intoarcem algoritmul in favoarea ta prin precizie elvetiana, sabloane STAR si scoring semantic direct.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button 
                    onClick={() => onNavigateTab && onNavigateTab('cv_studio')}
                    className="group px-6 py-3.5 rounded-full text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer flex items-center gap-2 shadow-xs"
                  >
                    <span>Incepe Auditul CV Gratuit</span>
                    <span className="w-5 h-5 rounded-full bg-indigo-700/60 flex items-center justify-center transition-transform group-hover:scale-110">
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </span>
                  </button>

                  <button 
                    onClick={() => onNavigateTab && onNavigateTab('tracker')}
                    className="px-6 py-3.5 rounded-full text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer"
                  >
                    Deschide Tracker Aplicatii
                  </button>
                </div>

                <div className="pt-2 flex items-center gap-3 text-xs text-slate-500 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Peste 850 de oferte acceptate de studenti si juniori in 2026</span>
                </div>
              </div>

              {/* RIGHT: BESPOKE FLOATING CARD STACK */}
              <div className="lg:col-span-5 relative space-y-4">
                <div className="p-6 rounded-3xl bg-slate-50/90 border border-slate-200/90 shadow-md transform rotate-1.5 transition-transform hover:rotate-0 duration-500 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">Standard Pregatire UPB / Politehnica</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Scor ATS: 98%
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    Formatare omologata pentru parsere enterprise, proiecte descrise in format STAR si 0 diacritice eronate.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200/80">Java 21</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200/80">Spring Boot 3</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200/80">PostgreSQL</span>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-950 text-white shadow-xl transform -rotate-1.5 transition-transform hover:rotate-0 duration-500 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-indigo-300 font-mono flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Rezultat Verificat
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      P99 &lt; 14ms
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    „Candidatul a primit invitatia directa la interviu tehnic in mai putin de 48 de ore de la aplicare.”
                  </p>
                  <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
                    <span>Bucharest & Remote</span>
                    <span className="text-white font-mono font-bold">4 Invitatii Active</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
