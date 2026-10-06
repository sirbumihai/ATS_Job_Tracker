import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Layers, 
  Terminal, 
  Eye, 
  Check, 
  ArrowRight, 
  Search, 
  Upload, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  Code2, 
  Compass, 
  FolderGit2, 
  Award, 
  Cpu, 
  Sliders, 
  RefreshCw, 
  ChevronRight, 
  Bookmark, 
  Clock, 
  ExternalLink,
  Flame,
  CheckCircle2,
  FileText,
  BarChart3,
  MousePointerClick
} from 'lucide-react';

export default function HeroShowcaseStudio({ onNavigateTab, onOpenUpload, onOpenAddJob }) {
  // Category state: 'design_taste' (/design-taste-frontend) or 'impeccable' (/impeccable)
  const [activeCategory, setActiveCategory] = useState(() => {
    return localStorage.getItem('ats_hero_category') || 'design_taste';
  });

  // Selected Style ID (1 to 5 per category)
  const [selectedStyleId, setSelectedStyleId] = useState(() => {
    return localStorage.getItem('ats_hero_style_id') || 'style_1';
  });

  // Confirmed Global Style
  const [savedGlobalStyle, setSavedGlobalStyle] = useState(() => {
    return localStorage.getItem('ats_preferred_hero_style') || null;
  });

  const [notificationMessage, setNotificationMessage] = useState(null);

  // Interactive state inside heroes
  const [interactiveSearchRole, setInteractiveSearchRole] = useState('Java Spring Boot');
  const [tactileMode, setTactileMode] = useState('ats_strict'); // 'ats_strict' | 'human_recruiter'
  const [hudQueryRunning, setHudQueryRunning] = useState(false);
  const [hudQueryResult, setHudQueryResult] = useState('Rezultat: 142 pozitii identificate cu potrivire > 92% in Bucuresti & Remote');

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

  // 10 Hero Styles Definitions
  const STYLES_CATALOG = {
    design_taste: [
      {
        id: 'style_1',
        title: 'Linear Dark Tech',
        subtitle: 'Monastic Minimalist & High-Concurrency Telemetry',
        dials: 'VARIANCE: 6 | MOTION: 4 | DENSITY: 5',
        archetype: 'The Dark Tech Command',
        palette: 'OLED Black (#09090b) · Electric Emerald (#10b981) · Zinc-800',
        typography: 'Grotesk Display + JetBrains Mono Telemetry',
        badge: 'Technical B2B'
      },
      {
        id: 'style_2',
        title: 'Asymmetrical Bento Grid',
        subtitle: 'Apple-Tier Masonry Product Showcase',
        dials: 'VARIANCE: 8 | MOTION: 6 | DENSITY: 4',
        archetype: 'The Asymmetrical Bento',
        palette: 'Slate-50 Canvas · Pure Indigo (#4f46e5) · Dual Hairlines',
        typography: 'Bold Sans Display + Concentric Hardware Curves',
        badge: 'Product SaaS'
      },
      {
        id: 'style_3',
        title: 'Cold Luxury Swiss Precision',
        subtitle: 'Titanium Slate & Architectural Restraint',
        dials: 'VARIANCE: 7 | MOTION: 5 | DENSITY: 3',
        archetype: 'Cold Luxury & Swiss Grid',
        palette: 'Silver-Slate (#f1f5f9) · Pure White · Cobalt Hairlines',
        typography: 'Geometric Grotesque + Micro-Pill Eyebrow',
        badge: 'Executive / Clean'
      },
      {
        id: 'style_4',
        title: 'Kinetic Editorial Split',
        subtitle: '50/50 Asymmetric Manifesto & Live Comparison',
        dials: 'VARIANCE: 8 | MOTION: 7 | DENSITY: 3',
        archetype: 'The Editorial Split',
        palette: 'High-Contrast Monochrome · Crisp Charcoal · White Core',
        typography: 'Monumental Display with Same-Family Italic Tension',
        badge: 'Design Studio'
      },
      {
        id: 'style_5',
        title: 'Luminescent Aurora Mesh',
        subtitle: 'Soft Multi-Layer Luminescence & Frosted Glass',
        dials: 'VARIANCE: 7 | MOTION: 6 | DENSITY: 4',
        archetype: 'Aurora Ambient Mesh',
        palette: 'Diffused Cyan/Indigo Radial Orbs · Pure White · Glassmorphism',
        typography: 'Clean Grotesk + Interactive Prompt Island',
        badge: 'Next-Gen AI'
      }
    ],
    impeccable: [
      {
        id: 'style_6',
        title: 'Overdrive Cyber-HUD Terminal',
        subtitle: 'Spatial Telemetry & Tactical Vector Scanlines',
        dials: 'MODE: Operate / Overdrive | DENSITY: High | P99: 12ms',
        archetype: 'Spatial HUD Radar',
        palette: 'Deep Obsidian (#05070f) · Cyber Cyan (#06b6d4) · Laser Violet',
        typography: 'Tactical Monospace + High-Density Coordinate Grid',
        badge: 'Cyber Tactical'
      },
      {
        id: 'style_7',
        title: 'Architectural Zen (Distill)',
        subtitle: 'Radical Reduction to Absolute Purity & Function',
        dials: 'MODE: Persuade / Distill | DENSITY: Minimal | Zero Fluff',
        archetype: 'Monolithic Architectural Zen',
        palette: 'Stark Pure White (#ffffff) · Absolute Pitch Ink (#000000)',
        typography: 'Monolithic Display + Sub-Micron Whisper Details',
        badge: 'Pure Essence'
      },
      {
        id: 'style_8',
        title: 'Tactile Delight & Mass',
        subtitle: 'Machined Hardware Surfaces with Physical Emboss',
        dials: 'MODE: Experience / Delight | Physical Haptics & Mass',
        archetype: 'Neumorphic Machined Console',
        palette: 'Sculpted Bone-Slate (#f3f4f6) · Inset Bevels · Dual-Light Shadow',
        typography: 'Precision Micro-Type + Physical Switch Physics',
        badge: 'Tactile Hardware'
      },
      {
        id: 'style_9',
        title: 'Monumental High-Contrast (Bolder)',
        subtitle: 'Unapologetic Type Scale with Dynamic Ticker Tape',
        dials: 'MODE: Persuade / Bolder | DRAMA: Max | Contrast: 10/10',
        archetype: 'Monumental Editorial Power',
        palette: 'Deep Charcoal (#111113) · High-Voltage Amber Gold (#fbbf24)',
        typography: 'Exaggerated Monumental Sans (7xl) + Ticker Banner',
        badge: 'Bold Statement'
      },
      {
        id: 'style_10',
        title: 'Serene Scandinavian Studio',
        subtitle: 'Organic Calm, Tactile Stacks & Human Craft',
        dials: 'MODE: Persuade / Craft Floor | Calibrated Breathing Room',
        archetype: 'Warm Nordic Organic Studio',
        palette: 'Calibrated Mist (#f8f9fa) · Forest Green (#15803d) · Slate-600',
        typography: 'Airy Modern Sans + Asymmetric Floating Card Angles',
        badge: 'Nordic Calm'
      }
    ]
  };

  const currentStylesList = STYLES_CATALOG[activeCategory] || STYLES_CATALOG.design_taste;
  const currentStyleMeta = currentStylesList.find(s => s.id === selectedStyleId) || currentStylesList[0];

  // Helper to switch category and reset style selection appropriately
  const handleCategoryChange = (newCat) => {
    setActiveCategory(newCat);
    if (newCat === 'design_taste') {
      setSelectedStyleId('style_1');
    } else {
      setSelectedStyleId('style_6');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      
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
                  Hero Design Studio <span className="text-indigo-600 font-mono text-sm">(10 Stiluri Interactive)</span>
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Comuta liber intre cele 5 concepte din <code className="text-indigo-600 font-mono font-bold">/design-taste-frontend</code> si cele 5 din <code className="text-purple-600 font-mono font-bold">/impeccable</code>. Alege stilul dorit pentru tot website-ul!
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
                  5 stiluri
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
                  5 stiluri
                </span>
              </button>
            </div>
          </div>

          {/* SECOND ROW: 5 STYLE PILLS FOR THE ACTIVE CATEGORY */}
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
                Palette: <strong className="text-slate-900">{currentStyleMeta.palette}</strong>
              </span>
              <span className="text-slate-600 font-medium hidden sm:inline">
                Type: <strong className="text-slate-900">{currentStyleMeta.typography}</strong>
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
      {/* LIVE RENDERING OF THE ACTIVE HERO VARIANT */}
      {/* ========================================================= */}

      {/* --------------------------------------------------------- */}
      {/* HERO 1: LINEAR DARK TECH (/design-taste-frontend) */}
      {/* --------------------------------------------------------- */}
      {selectedStyleId === 'style_1' && (
        <div className="bg-[#09090b] text-zinc-100 rounded-[2.5rem] p-6 sm:p-12 lg:p-16 border border-zinc-800 shadow-2xl relative overflow-hidden font-sans">
          {/* Subtle Keyline Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

          {/* Electric Emerald Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-5xl mx-auto space-y-8">
            {/* Top Telemetry Bar */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-zinc-400 font-bold uppercase tracking-wider">v2.4 Telemetry Engine Active</span>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-zinc-500">
                <span>LATENCY: <strong>14ms</strong></span>
                <span>MATCH ENGINE: <strong>PGVECTOR</strong></span>
                <span>CONCURRENCY: <strong>10k+</strong></span>
              </div>
            </div>

            {/* Headline Block */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Terminal className="w-3.5 h-3.5" />
                <span>Software Engineers First · Zero Fluff</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Arhitectura de recrutare pentru ingineri care scriu cod, nu povesti.
              </h1>

              <p className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed font-normal">
                Platforma automata cu parsing vectorial ATS, ranking semantic in timp real cu PostgreSQL pgvector si sincronizare directa pentru roluri de Backend, DevOps si Full-Stack.
              </p>
            </div>

            {/* Interactive Terminal / Quick Action Box */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 font-mono text-xs space-y-3 shadow-inner">
              <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-2.5">
                <span className="flex items-center gap-2">
                  <span className="text-emerald-400">$</span> jobflow search --role "Java 21 Spring Boot" --strict
                </span>
                <span className="text-[10px] text-zinc-500">HOTKEY: CTRL+K</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-zinc-300">
                <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold">142 Joburi Active</span>
                <span className="px-2.5 py-1 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-bold">98% Match Semantic</span>
                <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">Fara Rejection Filters</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button 
                onClick={() => onNavigateTab && onNavigateTab('tracker')}
                className="group px-6 py-3.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <span>Deschide Tracker Aplicatii</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button 
                onClick={() => onNavigateTab && onNavigateTab('cv_studio')}
                className="px-6 py-3.5 rounded-xl text-xs font-bold bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer flex items-center gap-2"
              >
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span>Testeaza Match pe CV-ul Tau</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* HERO 2: ASYMMETRICAL BENTO GRID (/design-taste-frontend) */}
      {/* --------------------------------------------------------- */}
      {selectedStyleId === 'style_2' && (
        <div className="bg-slate-100/70 p-2 rounded-[2.5rem] border border-slate-200/80 shadow-xs font-sans">
          <div className="bg-white rounded-[calc(2.5rem-0.5rem)] border border-slate-200/60 p-6 sm:p-10 lg:p-12 shadow-xs space-y-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* BENTO TILE 1: MAIN HERO VALUE PROPOSITION (7/12) */}
              <div className="lg:col-span-7 bg-slate-50/80 rounded-3xl p-6 sm:p-8 border border-slate-200/80 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Platforma Inteligenta de Recrutare IT
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
                    Fiecare aplicatie optimizata matematic pentru primul interviu.
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    Nu mai trimite sute de CV-uri fara raspuns. JobFlow AI sincronizeaza experienta ta tehnica cu cerintele reale din piata prin scoring ATS, reconstructie de proiecte STAR si asistenta pas-cu-pas.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200/70">
                  <button 
                    onClick={() => onNavigateTab && onNavigateTab('job_search')}
                    className="group px-5 py-3 rounded-2xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer flex items-center gap-2 shadow-xs"
                  >
                    <span>Cauta Job-uri in Timp Real</span>
                    <span className="w-6 h-6 rounded-lg bg-indigo-700/60 flex items-center justify-center transition-transform group-hover:scale-105 group-hover:translate-x-0.5">
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </span>
                  </button>

                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Peste 850 oferte acceptate in 2026</span>
                  </div>
                </div>
              </div>

              {/* BENTO TILE 2 & 3 & 4: RIGHT STACK (5/12) */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                
                {/* TILE A: ATS SCORE DIAL */}
                <div className="bg-gradient-to-br from-indigo-50/80 to-white rounded-3xl p-5 border border-indigo-100 flex items-center justify-between gap-4 shadow-2xs">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">Scor Compatibilitate</span>
                    <h3 className="text-sm font-black text-slate-950 mt-0.5">All-Star ATS Match</h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">Depaseste filtrele automate din primele 3 secunde.</p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex flex-col items-center justify-center shrink-0 shadow-sm font-mono">
                    <span className="text-xl font-black">98</span>
                    <span className="text-[9px] uppercase font-bold text-indigo-200">/100</span>
                  </div>
                </div>

                {/* TILE B: LIVE RADAR TELEMETRY */}
                <div className="bg-slate-50/80 rounded-3xl p-5 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Radar Scraping Timp Real
                    </span>
                    <span className="font-mono text-[10px] font-bold text-slate-400">eJobs · BestJobs · LinkedIn</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 text-[11px] font-medium text-slate-700 flex items-center justify-between">
                    <span>Junior Backend Java Developer</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Nou astazi</span>
                  </div>
                </div>

                {/* TILE C: SEMANTIC VECTOR CHIP */}
                <div className="bg-slate-950 text-white rounded-3xl p-5 space-y-2 shadow-sm font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>POSTGRESQL PGVECTOR</span>
                    <span className="text-indigo-400">HNSW INDEX</span>
                  </div>
                  <div className="text-slate-200 font-bold">
                    cosine_similarity(cv_embedding, job_embedding) = <span className="text-emerald-400 font-black">0.942</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* HERO 3: COLD LUXURY SWISS PRECISION (/design-taste-frontend) */}
      {/* --------------------------------------------------------- */}
      {selectedStyleId === 'style_3' && (
        <div className="bg-[#f1f5f9] text-slate-900 rounded-[2.5rem] p-6 sm:p-12 lg:p-16 border border-slate-300 shadow-sm font-sans relative overflow-hidden">
          {/* Razor Thin Grid lines */}
          <div className="absolute top-0 bottom-0 left-12 w-px bg-slate-300/80 hidden lg:block" />
          <div className="absolute top-0 bottom-0 right-12 w-px bg-slate-300/80 hidden lg:block" />

          <div className="max-w-4xl mx-auto space-y-8 text-center">
            {/* Swiss Precision Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.25em] bg-white text-slate-800 border border-slate-300 shadow-2xs">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              SWISS SPECIFICATION · RECRUITMENT ENGINE 2026
            </div>

            {/* Massive Heading */}
            <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-tight">
              Precizie matematica in potrivirea CV-urilor tehnice.
            </h1>

            {/* Crisp Subtitle */}
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed font-normal">
              Fara aproximari si fara formulari sterile. Algoritm de potrivire bidirectionala intre experienta ta reala de programare si filtrele ATS utilizate de companiile de top.
            </p>

            {/* Swiss Hardware Floating Action Dock */}
            <div className="bg-white p-2 rounded-2xl border border-slate-300 shadow-md max-w-md mx-auto flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 pl-3 text-xs font-mono text-slate-500 font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>ats_job_engine_v3</span>
              </div>

              <button 
                onClick={() => onNavigateTab && onNavigateTab('cv_studio')}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-slate-950 hover:bg-blue-600 text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer shadow-xs"
              >
                Incepe Auditul CV
              </button>
            </div>

            {/* Spec Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-300 max-w-3xl mx-auto text-left">
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
      {/* HERO 4: KINETIC EDITORIAL SPLIT (/design-taste-frontend) */}
      {/* --------------------------------------------------------- */}
      {selectedStyleId === 'style_4' && (
        <div className="bg-[#fafafa] text-slate-950 rounded-[2.5rem] p-6 sm:p-12 lg:p-16 border border-slate-200 shadow-sm font-sans">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* LEFT 50%: EDITORIAL MANIFESTO */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold block">
                [ MANIFEST DE ANGAJARE 2026 ]
              </span>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] text-slate-950">
                Viitorul carierei tale nu este o loterie <span className="italic font-normal underline decoration-slate-300">tehnica</span>.
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md font-normal">
                Companiile primesc 300 de CV-uri pe minut. Algoritmii resping 85% in primele secunde din cauza formatarii gresite si lipsei cuvintelor cheie. Noi intoarcem algoritmul in favoarea ta.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button 
                  onClick={() => onNavigateTab && onNavigateTab('cover_letter')}
                  className="px-6 py-3.5 rounded-full text-xs font-black bg-slate-950 hover:bg-slate-800 text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer"
                >
                  Generare Scrisoare de Intentie
                </button>
                <button 
                  onClick={() => onNavigateTab && onNavigateTab('skill_roadmap')}
                  className="px-6 py-3.5 rounded-full text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer"
                >
                  Vezi Skill Roadmap
                </button>
              </div>
            </div>

            {/* RIGHT 50%: LIVE CONTRAST CARD STACK */}
            <div className="lg:col-span-6 space-y-4">
              {/* CARD A: REJECTED SCENARIO */}
              <div className="p-5 rounded-2xl bg-white border border-rose-200 shadow-2xs space-y-2 opacity-90">
                <div className="flex items-center justify-between text-xs font-bold text-rose-700">
                  <span>CV Standard Nepregatit</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200">Scor ATS: 42%</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Format nestandardizat, tabele invizibile pentru parser, absenta competentelor concrete de Java/Spring.
                </p>
                <div className="text-[11px] font-mono text-rose-600 font-bold">
                  Status: Respins automat fara citire umana
                </div>
              </div>

              {/* CARD B: JOBFLOW AI OPTIMIZED */}
              <div className="p-6 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-xl space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-indigo-300 font-mono font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Optimizat cu JobFlow AI
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                    Scor ATS: 98%
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Sabloane conforme ATS, descrieri STAR (Google XYZ formula), indexare semantica directa pe roluri din Romania.
                </p>
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Invitatie la interviu tehnic primita in &lt; 48 ore
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* HERO 5: LUMINESCENT AURORA MESH (/design-taste-frontend) */}
      {/* --------------------------------------------------------- */}
      {selectedStyleId === 'style_5' && (
        <div className="bg-white text-slate-900 rounded-[2.5rem] p-6 sm:p-12 lg:p-16 border border-slate-200 shadow-sm font-sans relative overflow-hidden">
          {/* Restrained Aurora Radial Orbs (Indigo & Cyan) */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -top-24 right-0 w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto space-y-8 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              AI Career Copilot · Dezvoltat pentru Developeri
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-tight">
              Gaseste jobul potrivit inainte sa apara pe LinkedIn.
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed font-normal">
              Agregator inteligent ce scaneaza continuu piata tech din Romania si iti optimizeaza profilul in cateva secunde.
            </p>

            {/* Interactive Aurora Search Prompt Bar */}
            <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-slate-200/90 shadow-md max-w-lg mx-auto flex items-center gap-2">
              <div className="pl-3 text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={interactiveSearchRole}
                onChange={(e) => setInteractiveSearchRole(e.target.value)}
                placeholder="Introdu rolul dorit..."
                className="w-full text-xs font-bold text-slate-900 bg-transparent outline-none"
              />
              <button 
                onClick={() => onNavigateTab && onNavigateTab('job_search')}
                className="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer shrink-0"
              >
                Scaneaza Piata
              </button>
            </div>

            {/* Role Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {['Java Spring Boot', 'Junior Backend', 'React Fullstack', 'DevOps Docker', 'PostgreSQL'].map(tag => (
                <button
                  key={tag}
                  onClick={() => setInteractiveSearchRole(tag)}
                  className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-all cursor-pointer ${
                    interactiveSearchRole === tag
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* HERO 6: OVERDRIVE CYBER-HUD TERMINAL (/impeccable) */}
      {/* --------------------------------------------------------- */}
      {selectedStyleId === 'style_6' && (
        <div className="bg-[#05070f] text-cyan-100 rounded-[2.5rem] p-6 sm:p-12 lg:p-16 border border-cyan-500/30 shadow-2xl relative overflow-hidden font-mono">
          {/* Cyber Scanline Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />

          <div className="relative z-10 max-w-5xl mx-auto space-y-8">
            {/* Cyber Header HUD */}
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-cyan-400 font-black">SYS.OVERDRIVE // OPERATIONAL RADAR</span>
              </div>
              <div className="text-cyan-300/60 text-[10px]">
                COORD: 44.4268° N, 26.1025° E (BUCURESTI)
              </div>
            </div>

            {/* Tactical Headline */}
            <div className="space-y-4">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                MODE: OPERATE / OUT-OF-DISTRIBUTION CRAFT
              </span>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Interfata tactica de strapungere a filtrelor ATS.
              </h1>

              <p className="text-xs sm:text-sm text-cyan-200/70 max-w-2xl leading-relaxed font-sans font-normal">
                Scaneaza vectorii de compatibilitate din anunturi reale, izoleaza cerintele ascunse si genereaza CV-uri cu rezolutie de 100% in parserele enterprise.
              </p>
            </div>

            {/* Interactive Cyber Simulation Box */}
            <div className="bg-[#090d1a] border border-cyan-500/30 rounded-2xl p-5 space-y-3 shadow-inner">
              <div className="flex items-center justify-between text-xs text-cyan-400 border-b border-cyan-900/60 pb-2">
                <span>SIMULATOR VECTOR QUERIES (PGVECTOR)</span>
                <span className="text-xs font-bold text-violet-400">LATENCY: 12MS</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setHudQueryRunning(true);
                    setTimeout(() => {
                      setHudQueryRunning(false);
                      setHudQueryResult('Rezultat: 142 pozitii identificate cu potrivire > 92% in Bucuresti & Remote');
                    }, 600);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {hudQueryRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span>Executa Scanare Cosinus</span>
                </button>
                <div className="flex-1 p-2.5 rounded-xl bg-slate-950/60 border border-cyan-900/80 text-xs text-cyan-300 flex items-center font-mono">
                  {hudQueryResult}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigateTab && onNavigateTab('tracker')}
                className="px-6 py-3 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:brightness-110 transition shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                Lanseaza Aplicatia
              </button>
              <button
                onClick={() => onNavigateTab && onNavigateTab('github_readme')}
                className="px-6 py-3 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-cyan-200 border border-cyan-800/80 transition cursor-pointer"
              >
                Configureaza Profil GitHub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* HERO 7: ARCHITECTURAL ZEN / DISTILL (/impeccable) */}
      {/* --------------------------------------------------------- */}
      {selectedStyleId === 'style_7' && (
        <div className="bg-white text-black rounded-[2.5rem] p-8 sm:p-16 lg:p-24 border border-black/10 shadow-xs font-sans">
          <div className="max-w-3xl mx-auto space-y-12">
            
            <div className="space-y-6">
              <div className="text-[11px] font-mono tracking-widest uppercase text-neutral-400">
                JobFlow AI · Architectural Zen
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-none text-black">
                Un singur CV.<br />Interviuri directe.
              </h1>

              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal max-w-lg">
                Fara decoratiuni inutile. Algoritmi simpli, rapizi si precisi care iti aduc rezultate fara zgomot.
              </p>
            </div>

            {/* Decisive Single Button */}
            <div>
              <button
                onClick={() => onNavigateTab && onNavigateTab('cv_studio')}
                className="group px-8 py-4 rounded-full text-xs font-black bg-black hover:bg-neutral-800 text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer inline-flex items-center gap-3 shadow-sm"
              >
                <span>Acceseaza Studio CV</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Whisper Minimal Specs */}
            <div className="pt-12 border-t border-black/[0.08] grid grid-cols-3 gap-6 text-xs text-neutral-500 font-mono">
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
      {/* HERO 8: TACTILE DELIGHT & MASS (/impeccable) */}
      {/* --------------------------------------------------------- */}
      {selectedStyleId === 'style_8' && (
        <div className="bg-[#f3f4f6] text-slate-800 rounded-[2.5rem] p-6 sm:p-12 lg:p-16 border border-slate-300 shadow-xl font-sans relative">
          <div className="max-w-4xl mx-auto space-y-8">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-600" />
                Physical Tactile Console
              </span>

              {/* Physical Mode Switcher */}
              <div className="flex bg-slate-200/80 p-1 rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] border border-slate-300/70">
                <button
                  onClick={() => setTactileMode('ats_strict')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    tactileMode === 'ats_strict'
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'text-slate-600'
                  }`}
                >
                  Mod ATS Strict
                </button>
                <button
                  onClick={() => setTactileMode('human_recruiter')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    tactileMode === 'human_recruiter'
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'text-slate-600'
                  }`}
                >
                  Mod Recruiter Uman
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
                Control tactil deplin asupra sanselor tale de cariera.
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed font-normal">
                Fiecare element din CV este simulat cu fizica reala: compatibilitate de cuvinte cheie, formatare structurala si densitate tehnica.
              </p>
            </div>

            {/* Tactile Hardware Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-300 shadow-sm space-y-2">
                <span className="text-xs font-bold text-slate-500">Densitate Tehnica</span>
                <div className="text-2xl font-black text-slate-950 font-mono">94%</div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full w-[94%]" />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-300 shadow-sm space-y-2">
                <span className="text-xs font-bold text-slate-500">Formatare Conforma</span>
                <div className="text-2xl font-black text-slate-950 font-mono">A+</div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[100%]" />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-300 shadow-sm space-y-2">
                <span className="text-xs font-bold text-slate-500">Reconstructie Proiecte</span>
                <div className="text-2xl font-black text-slate-950 font-mono">STAR</div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[90%]" />
                </div>
              </div>
            </div>

            {/* Tactile Button */}
            <div className="pt-2">
              <button 
                onClick={() => onNavigateTab && onNavigateTab('linkedin_optimizer')}
                className="px-6 py-3.5 rounded-2xl text-xs font-black bg-slate-900 text-white shadow-lg active:translate-y-0.5 transition-transform cursor-pointer"
              >
                Optimizeaza Profilul LinkedIn
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* HERO 9: MONUMENTAL HIGH-CONTRAST / BOLDER (/impeccable) */}
      {/* --------------------------------------------------------- */}
      {selectedStyleId === 'style_9' && (
        <div className="bg-[#111113] text-white rounded-[2.5rem] p-6 sm:p-12 lg:p-16 border border-neutral-800 shadow-2xl font-sans relative overflow-hidden">
          {/* Ticker Banner at Top */}
          <div className="border-b border-neutral-800 pb-3 mb-6 flex items-center justify-between text-xs font-mono text-amber-400">
            <span className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              8,500+ JOBURI SCANATE · ZERO REFUZURI AUTOMATE · SPRING BOOT & REACT
            </span>
            <span className="hidden sm:inline text-neutral-500">ACTIUNE IMEDIATA</span>
          </div>

          <div className="space-y-8 max-w-4xl">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-none">
              OPRESTE TRIMITEREA DE CV-URI IN GOL.
            </h1>

            <p className="text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed font-normal">
              Ia controlul asupra fiecarui pas din procesul de angajare. ATS Job Tracker transforma aplicatiile haotice intr-un pipeline transparent de succes.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => onNavigateTab && onNavigateTab('tracker')}
                className="px-8 py-4 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-black transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer shadow-lg shadow-amber-400/20"
              >
                DESCHIDE PIPELINE KANBAN
              </button>

              <button 
                onClick={() => onNavigateTab && onNavigateTab('market_insights')}
                className="px-6 py-4 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 transition cursor-pointer"
              >
                VEZI RADAR PIATA IT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* HERO 10: SCANDINAVIAN STUDIO (/impeccable) */}
      {/* --------------------------------------------------------- */}
      {selectedStyleId === 'style_10' && (
        <div className="bg-[#f8f9fa] text-slate-800 rounded-[2.5rem] p-6 sm:p-12 lg:p-16 border border-slate-200/90 shadow-sm font-sans">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Calm & Claritate in Cariera
              </span>

              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                O cale mai linistita catre urmatorul tau rol de software engineer.
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-lg">
                Fara spam de aplicatii, fara frustrare. Analizam cerintele tehnice reale si iti aratam exact ce lipseste din profilul tau pentru a trece cu brio de interviul tehnic.
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

            {/* Floating Organic Card Stack */}
            <div className="lg:col-span-5 relative space-y-3">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs transform rotate-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-2">
                  <span>Pregatire Interviuri UPB / Politehnica</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">100% Gratuit</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Banci de 150+ intrebari reale de Java, Spring Boot, SQL si Arhitectura Enterprise.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-lg transform -rotate-1">
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span>Mentor Digital Integrat</span>
                  <span className="text-indigo-400 text-[10px] font-mono">AI Active</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Iti recomanda solutii concrete si proiecte practice de adaugat in portofoliu.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
