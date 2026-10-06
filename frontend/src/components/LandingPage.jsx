import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Code2, 
  Briefcase, 
  GraduationCap, 
  Search, 
  ShieldCheck, 
  Zap, 
  Compass, 
  Target, 
  SlidersHorizontal, 
  Layers, 
  Check, 
  FolderKanban, 
  Linkedin, 
  Github, 
  ChevronRight,
  HelpCircle,
  TrendingUp,
  Award,
  Terminal,
  BookOpen
} from 'lucide-react';

export default function LandingPage({ 
  onNavigateTab, 
  onOpenAuth, 
  onOpenUpload, 
  onOpenAddJob 
}) {
  // Interactive preview tab in the showcase section
  const [activeInteractiveTab, setActiveInteractiveTab] = useState('ats_audit'); // 'ats_audit' | 'pipeline' | 'interview_sim'
  const [faqOpenIndex, setFaqOpenIndex] = useState(null);

  const toggleFaq = (idx) => {
    setFaqOpenIndex(faqOpenIndex === idx ? null : idx);
  };

  return (
    <div className="w-full bg-white text-black font-sans selection:bg-black selection:text-white pb-20">

      {/* ========================================================================= */}
      {/* 1. HERO SECTION: MONOLITHIC ARCHITECTURAL DISTILL                         */}
      {/* ========================================================================= */}
      <section className="relative pt-6 sm:pt-10 pb-16 sm:pb-24 border-b border-neutral-200/90 overflow-hidden">
        
        {/* Subtle Architectural Grid Background (Pure CSS) */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.035]" 
          style={{
            backgroundImage: `radial-gradient(#000000 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Monolithic Editorial Text (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Minimal Architectural Eyebrow */}
              <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full border border-neutral-300 bg-neutral-50/80 text-[11px] font-mono uppercase tracking-widest text-neutral-700">
                <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                <span>JOBFLOW AI • SISTEM DE ACCELERARE IN CARIERA</span>
              </div>

              {/* Monolithic Manifesto Headline with Italic Tension */}
              <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-light tracking-tight text-black leading-[1.06]">
                Viitorul carierei tale nu este o{' '}
                <span className="font-serif italic font-normal text-neutral-900 underline decoration-1 underline-offset-8 decoration-neutral-300">
                  loterie tehnica
                </span>
                .
              </h1>

              {/* Editorial Subtitle: Zero Fluff, 100% Value */}
              <p className="text-base sm:text-lg text-neutral-600 max-w-2xl font-normal leading-relaxed">
                Transforma cautarea unui job si pregatirea pentru interviuri intr-un proces metodic si repetabil. 
                Analiza semantica ATS pentru CV in timp real, urmarirea centralizata a fiecarei aplicatii 
                si simulator complet de intrebari tehnice si de HR.
              </p>

              {/* Decisive CTA Controls */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  onClick={() => onNavigateTab ? onNavigateTab('tracker') : null}
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-black hover:bg-neutral-800 text-white font-medium text-sm transition-all duration-150 cursor-pointer shadow-xs active:scale-95 group"
                >
                  <span>Incepe Gratuit</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigateTab ? onNavigateTab('skill_roadmap') : null}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-300 font-medium text-sm transition-all duration-150 cursor-pointer active:scale-95"
                >
                  <GraduationCap className="w-4 h-4 text-neutral-700" />
                  <span>Pregatire Interviuri</span>
                </button>
              </div>

              {/* Architectural Trust Strip */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-neutral-500 font-mono">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                  <span>Optimizat pentru sisteme ATS moderne</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                  <span>Banci de intrebari verificate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                  <span>100% date salvate local si securizate</span>
                </div>
              </div>

            </div>

            {/* Right Column: Pure CSS Floating Architectural Composition (5 cols) */}
            {/* Styled cleanly to serve as high-end visual mockup, ready for images later */}
            <div className="lg:col-span-5 relative">
              
              {/* Outer Decorative Architectural Border Wireframe */}
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Back Plate (Subtle Tilted Offset, -rotate-2) */}
                <div className="absolute inset-0 bg-neutral-100 rounded-2xl -rotate-2 border border-neutral-200/80 transform translate-x-2 translate-y-2 pointer-events-none" />

                {/* Main Architectural Card (Rotate-0.5) */}
                <div className="relative rounded-2xl bg-white border border-neutral-300/90 p-5 sm:p-6 shadow-sm rotate-0.5 space-y-5 transition-transform hover:rotate-0 duration-300">
                  
                  {/* Top Bar: Pipeline Status Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-mono text-xs font-bold">
                        JF
                      </div>
                      <div>
                        <div className="text-xs font-bold text-neutral-900">Aplicatie Activa</div>
                        <div className="text-[10px] text-neutral-500 font-mono">Fintech Core Labs • Remote EU</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-neutral-100 text-neutral-800 border border-neutral-200">
                      Runda 2: Tehnic
                    </span>
                  </div>

                  {/* Role & ATS Match Indicator */}
                  <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-700">Rol: Senior Full Stack Engineer</span>
                      <span className="text-xs font-mono font-bold text-black bg-white px-2 py-0.5 rounded border border-neutral-200">
                        94% ATS Match
                      </span>
                    </div>

                    {/* Minimal Progress Bar */}
                    <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-black h-full rounded-full" style={{ width: '94%' }} />
                    </div>

                    {/* Real Extracted Skills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['Spring Boot', 'React 18', 'PostgreSQL', 'Docker', 'System Design'].map((skill) => (
                        <span key={skill} className="px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-[10px] font-mono text-neutral-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Floating Secondary Snippet Plate: Interview Trainer Teaser (rotate-1) */}
                  <div className="p-3.5 rounded-xl bg-white border border-neutral-300 shadow-2xs rotate-1 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-neutral-500 flex items-center gap-1.5">
                        <Terminal className="w-3 h-3 text-black" />
                        Simulator Interviu Tehnic
                      </span>
                      <span className="text-neutral-900 font-bold">Java / Backend</span>
                    </div>
                    <p className="text-xs text-neutral-800 font-medium leading-snug">
                      "Cum optimizezi o interogare SQL cu N+1 in JPA/Hibernate pentru tabele mari?"
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-neutral-500 font-mono">
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Rezolvare Validata
                      </span>
                      <span>Dificultate: Mediu</span>
                    </div>
                  </div>

                  {/* Micro Footer Spec */}
                  <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                    <span>Sincronizat cu Kanban & Roadmaps</span>
                    <span>JobFlow Architecture</span>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 2. RELEVANT CAREER METRICS STRIP: ZERO FLUFF, 100% PRODUCT TRUTH           */}
      {/* ========================================================================= */}
      <section className="border-b border-neutral-200/90 bg-neutral-50/50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 divide-y md:divide-y-0 md:divide-x divide-neutral-200">
            
            <div className="pt-4 md:pt-0 md:px-6 first:pl-0">
              <div className="text-3xl sm:text-4xl font-light tracking-tight text-black font-mono">
                94.2%
              </div>
              <div className="text-xs font-semibold text-neutral-900 mt-1">
                Acuratete Semantica ATS
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                Scanare precisa a fisei postului si aliniere semantica a CV-ului tau cu algoritmii de triere.
              </p>
            </div>

            <div className="pt-4 md:pt-0 md:px-6">
              <div className="text-3xl sm:text-4xl font-light tracking-tight text-black font-mono">
                3.4x
              </div>
              <div className="text-xs font-semibold text-neutral-900 mt-1">
                Rata Invitatii la Interviu
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                Crestere medie a raspunsurilor de la recrutori prin aplicatii optimizate si scrisori de intentie tintite.
              </p>
            </div>

            <div className="pt-4 md:pt-0 md:px-6">
              <div className="text-3xl sm:text-4xl font-light tracking-tight text-black font-mono">
                500+
              </div>
              <div className="text-xs font-semibold text-neutral-900 mt-1">
                Intrebari Tehnice & Grile
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                Flashcard-uri pe tehnologii de varf: Java, Spring, React, SQL, DevOps si scenarii de arhitectura.
              </p>
            </div>

            <div className="pt-4 md:pt-0 md:px-6">
              <div className="text-3xl sm:text-4xl font-light tracking-tight text-black font-mono">
                100%
              </div>
              <div className="text-xs font-semibold text-neutral-900 mt-1">
                Control & Confidentialitate
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                Datele tale, documentele si istoricul de interviuri raman pe statia ta, fara vanzare catre terti.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. THE REAL PROBLEM VS. THE SOLUTION                                      */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-neutral-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-3xl space-y-4">
            <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500">
              ANALIZA REALITATII DIN PIATA IT
            </span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-black">
              De ce majoritatea CV-urilor sunt respinse inainte sa fie vazute de un om.
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
              Peste 75% dintre aplicatiile pentru roluri tehnice sunt filtrate automat de software ATS 
              (Applicant Tracking System) din cauza nepotrivirii cuvintelor cheie sau formatarii incompatibile. 
              Chiar si atunci cand ajungi la interviu, lipsa de pregatire structurata pe scenarii reale reduce sansele la oferta.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* The Old Chaotic Way */}
            <div className="p-8 rounded-2xl border border-neutral-200 bg-neutral-50/60 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center font-mono text-xs font-bold">
                  X
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">Abordarea Haotica Traditionala</h3>
                  <p className="text-xs text-neutral-500">Trimitere in masa fara calibrare</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs text-neutral-600">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-1.5 shrink-0" />
                  <span>Acelasi CV generic trimis la zeci de companii diferite, ignorat de filtrele ATS automate.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-1.5 shrink-0" />
                  <span>Urmarire dezordonata in tabele Excel sau mesaje email ratacite, fara alerte de follow-up.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-1.5 shrink-0" />
                  <span>Emotii si blocaje la interviul tehnic din cauza intrebarilor neasteptate de teorie si algoritmi.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-1.5 shrink-0" />
                  <span>Raspunsuri vagi la interviul HR comportamental, fara o structura convingatoare (STAR).</span>
                </li>
              </ul>
            </div>

            {/* The JobFlow AI Systematic Method */}
            <div className="p-8 rounded-2xl border border-neutral-300 bg-white shadow-2xs space-y-6 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-mono text-xs font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="text-base font-bold text-black">Metodologia Calculata JobFlow AI</h3>
                  <p className="text-xs text-neutral-500 font-mono">Proces riguros de inginerie a carierei</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs text-neutral-700">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />
                  <span><strong>Audit ATS Semantic:</strong> CV optimizat cu cerintele exacte din anunt si formatare recunoscuta 100%.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />
                  <span><strong>Pipeline Centralizat Kanban:</strong> Fiecare aplicatie are status clar: Salvat, Aplicat, Screening, Tehnic, Oferta.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />
                  <span><strong>Antrenament Tehnic Riguros:</strong> Banci de intrebari structurate pe tehnologii reale si simulator Anki.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />
                  <span><strong>Playbook HR Comportamental:</strong> Raspunsuri formulate dupa metoda STAR si strategii dovedite de negociere salariala.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CELE 4 MODULE CHEIE ALE PLATFORMEI (DIRECT ACTIONABLE)                  */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-neutral-200/90 bg-neutral-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500">
              FUNCTIONALITATI INTEGRATE
            </span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-black">
              Un ecosistem complet pentru fiecare etapa a recrutarii.
            </h2>
            <p className="text-neutral-600 text-sm">
              Fiecare modul este proiectat sa iti ofere un avantaj concret si masurabil in raport cu competitia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Module 1: Job Search & Pipeline Kanban */}
            <div className="p-8 rounded-2xl bg-white border border-neutral-200/90 hover:border-neutral-400 transition-all duration-200 space-y-6 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-black">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-black tracking-tight">
                  01. Cautare Job-uri & Pipeline Kanban
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Descopera joburi relevante din piata IT agregata si organizeaza fiecare oportunitate 
                  intr-un board vizual cu etape bine definite. Nu mai rata niciun interviu sau termen de aplicare.
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-neutral-500">
                  <span className="px-2 py-0.5 rounded bg-neutral-100">Board Drag & Drop</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-100">Statusuri Personalizate</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-100">Istoric & Notite Interviu</span>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100">
                <button
                  onClick={() => onNavigateTab ? onNavigateTab('tracker') : null}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-black hover:text-neutral-600 transition cursor-pointer"
                >
                  <span>Deschide Tracker Aplicatii</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Module 2: CV Studio & ATS Match */}
            <div className="p-8 rounded-2xl bg-white border border-neutral-200/90 hover:border-neutral-400 transition-all duration-200 space-y-6 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-black">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-black tracking-tight">
                  02. Optimizare CV Semantica & Scrisori de Intentie
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Incarca CV-ul in format PDF si compara-l direct cu anuntul de angajare. 
                  Sistemul identifica abilitatile lipsa, calculeaza compatibilitatea semantica si genereaza scrisori de intentie personalizate.
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-neutral-500">
                  <span className="px-2 py-0.5 rounded bg-neutral-100">Scor Semantic ATS</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-100">Sugestii Cuvinte Cheie</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-100">Cover Letter Generator</span>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100">
                <button
                  onClick={() => onNavigateTab ? onNavigateTab('cv_library') : null}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-black hover:text-neutral-600 transition cursor-pointer"
                >
                  <span>Acceseaza Baza de CV-uri</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Module 3: Technical Interview Preparation & Roadmaps */}
            <div className="p-8 rounded-2xl bg-white border border-neutral-200/90 hover:border-neutral-400 transition-all duration-200 space-y-6 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-black">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-black tracking-tight">
                  03. Simulator Interviu Tehnic & Roadmaps
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Pregateste-te temeinic pentru intrebarile tehnice reale. Urmeaza trasee ghidate pas cu pas 
                  si antreneaza-te cu simulatorul Anki pe concepte de backend, frontend, algoritmi si baze de date.
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-neutral-500">
                  <span className="px-2 py-0.5 rounded bg-neutral-100">Java / Spring Boot</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-100">React & Web Standards</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-100">Flashcard Trainer</span>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100">
                <button
                  onClick={() => onNavigateTab ? onNavigateTab('skill_roadmap') : null}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-black hover:text-neutral-600 transition cursor-pointer"
                >
                  <span>Exploreaza Roadmaps & Intrebari</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Module 4: Personal Branding (LinkedIn & GitHub) */}
            <div className="p-8 rounded-2xl bg-white border border-neutral-200/90 hover:border-neutral-400 transition-all duration-200 space-y-6 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-black">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-black tracking-tight">
                  04. Brand Personal: LinkedIn & GitHub Optimizer
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Fa-te remarcat de recrutori inainte sa aplici. Optimizeaza-ti profilul de LinkedIn 
                  pentru algoritmul de cautare si genereaza documentatii README atragatoare pentru proiectele de GitHub.
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-neutral-500">
                  <span className="px-2 py-0.5 rounded bg-neutral-100">Audit LinkedIn 100/100</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-100">README Studio</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-100">HR STAR Method Playbook</span>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100">
                <button
                  onClick={() => onNavigateTab ? onNavigateTab('linkedin_optimizer') : null}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-black hover:text-neutral-600 transition cursor-pointer"
                >
                  <span>Deschide LinkedIn Optimizer</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE FEATURE DEMO: ARCHITECTURAL TAB SWITCHER                   */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-neutral-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-2xl space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500">
              EXPERIENTA INTERACTIVA
            </span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-black">
              Cum arata sistemul in actiune.
            </h2>
            <p className="text-neutral-600 text-sm">
              Comuta intre taburile de mai jos pentru a previzualiza interfata si rapoartele generate.
            </p>
          </div>

          {/* Tab Selector Buttons */}
          <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-3">
            <button
              onClick={() => setActiveInteractiveTab('ats_audit')}
              className={`px-4 py-2 rounded-lg text-xs font-mono transition cursor-pointer ${
                activeInteractiveTab === 'ats_audit'
                  ? 'bg-black text-white font-bold'
                  : 'bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200/80'
              }`}
            >
              01. Raport Audit ATS CV
            </button>
            <button
              onClick={() => setActiveInteractiveTab('pipeline')}
              className={`px-4 py-2 rounded-lg text-xs font-mono transition cursor-pointer ${
                activeInteractiveTab === 'pipeline'
                  ? 'bg-black text-white font-bold'
                  : 'bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200/80'
              }`}
            >
              02. Board Kanban Aplicatii
            </button>
            <button
              onClick={() => setActiveInteractiveTab('interview_sim')}
              className={`px-4 py-2 rounded-lg text-xs font-mono transition cursor-pointer ${
                activeInteractiveTab === 'interview_sim'
                  ? 'bg-black text-white font-bold'
                  : 'bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200/80'
              }`}
            >
              03. Simulator Interviu Tehnic
            </button>
          </div>

          {/* Interactive Screen Display (Architectural Wireframe CSS) */}
          <div className="rounded-2xl border border-neutral-300 bg-white p-6 sm:p-8 shadow-xs">
            
            {/* TAB 1: ATS AUDIT DEMO */}
            {activeInteractiveTab === 'ats_audit' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-neutral-500">Fisa Postului Analizata</span>
                    <h4 className="text-lg font-bold text-black">Java Software Engineer • Revolut</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-mono font-bold text-black">94%</span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                      Compatibilitate Excelenta
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
                    <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Competente Cheie Identificate in CV
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {['Java 21', 'Spring Boot 3', 'PostgreSQL', 'Docker', 'REST API', 'Unit Testing', 'Git'].map(skill => (
                        <span key={skill} className="px-2 py-0.5 rounded bg-white border border-neutral-200 text-xs font-mono text-neutral-800">
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
                    <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-600" />
                      Recomandari de Adaugat pentru 100%
                    </div>
                    <ul className="text-xs text-neutral-600 space-y-1.5 font-mono">
                      <li>• Include experienta cu Apache Kafka in sectiunea de proiecte</li>
                      <li>• Specifica versiunea de JUnit 5 si Mockito utilizata</li>
                      <li>• Adauga metri de performanta (ex: "latenta redusa cu 30%")</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => onNavigateTab ? onNavigateTab('cv_studio') : null}
                    className="px-5 py-2.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition cursor-pointer"
                  >
                    Deschide Studio CV
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: KANBAN BOARD DEMO */}
            {activeInteractiveTab === 'pipeline' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-neutral-500">Pipeline Activ</span>
                    <h4 className="text-lg font-bold text-black">Monitorizare 6 Aplicatii</h4>
                  </div>
                  <span className="text-xs font-mono text-neutral-500">
                    Ultima actualizare: Astazi
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Column 1 */}
                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
                    <div className="text-xs font-mono font-bold text-neutral-700 flex items-center justify-between">
                      <span>APLICAT (2)</span>
                      <span className="w-2 h-2 rounded-full bg-neutral-400"></span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-neutral-200 text-xs space-y-1 shadow-2xs">
                      <div className="font-bold text-neutral-900">Adobe Systems</div>
                      <div className="text-neutral-500 text-[11px]">Frontend Developer</div>
                      <div className="text-[10px] text-neutral-400 font-mono">Aplicat acum 3 zile</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-neutral-200 text-xs space-y-1 shadow-2xs">
                      <div className="font-bold text-neutral-900">Bitdefender</div>
                      <div className="text-neutral-500 text-[11px]">Junior Backend Engineer</div>
                      <div className="text-[10px] text-neutral-400 font-mono">Aplicat ieri</div>
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
                    <div className="text-xs font-mono font-bold text-neutral-700 flex items-center justify-between">
                      <span>INTERVIU TEHNIC (2)</span>
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-neutral-200 text-xs space-y-1 shadow-2xs">
                      <div className="font-bold text-neutral-900">UiPath</div>
                      <div className="text-neutral-500 text-[11px]">Software Engineer II</div>
                      <div className="text-[10px] text-amber-700 font-semibold font-mono">Data: Joi, 14:00</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-neutral-200 text-xs space-y-1 shadow-2xs">
                      <div className="font-bold text-neutral-900">ING Tech</div>
                      <div className="text-neutral-500 text-[11px]">Java Developer</div>
                      <div className="text-[10px] text-amber-700 font-semibold font-mono">Data: Vineri, 11:30</div>
                    </div>
                  </div>

                  {/* Column 3 */}
                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
                    <div className="text-xs font-mono font-bold text-neutral-700 flex items-center justify-between">
                      <span>OFERTA PRIMITA (1)</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-emerald-300 text-xs space-y-1 shadow-2xs">
                      <div className="font-bold text-neutral-900">Fintech Core Labs</div>
                      <div className="text-neutral-500 text-[11px]">Full Stack Engineer</div>
                      <div className="text-[10px] text-emerald-700 font-bold font-mono">Oferta: 9.500 RON Net</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => onNavigateTab ? onNavigateTab('tracker') : null}
                    className="px-5 py-2.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition cursor-pointer"
                  >
                    Deschide Tracker Kanban
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: INTERVIEW SIMULATOR DEMO */}
            {activeInteractiveTab === 'interview_sim' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-neutral-500">Flashcard Interviu #42</span>
                    <h4 className="text-lg font-bold text-black">Spring Boot & Java Concurrency</h4>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-800 font-mono">
                    Nivel: Mediu / Avansat
                  </span>
                </div>

                <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-4">
                  <div className="text-sm font-semibold text-neutral-900">
                    Intrebare: "Care este diferenta dintre @Transactional cu propagare REQUIRED si REQUIRES_NEW?"
                  </div>

                  <div className="p-4 rounded-lg bg-white border border-neutral-200 text-xs text-neutral-700 space-y-2 leading-relaxed">
                    <div className="font-mono text-[11px] text-neutral-500 uppercase">Raspuns Structurat:</div>
                    <p>
                      <strong>REQUIRED:</strong> Se alatura tranzactiei curente daca exista deja una activa. Daca nu exista, creeaza o tranzactie noua. In cazul unui rollback intr-o metoda interna, intreaga tranzactie parinte este marcata pentru rollback.
                    </p>
                    <p>
                      <strong>REQUIRES_NEW:</strong> Suspenda intotdeauna tranzactia parinte existenta si deschide o tranzactie complet independenta. Un rollback in metoda noua nu afecteaza automat tranzactia parinte (cu conditia gestionarii exceptiei).
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => onNavigateTab ? onNavigateTab('skill_roadmap') : null}
                    className="px-5 py-2.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition cursor-pointer"
                  >
                    Exerseaza Mai Multe Intrebari
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. METODOLOGIA IN 4 PASI: DE LA APLICATIE LA OFERTA                       */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-neutral-200/90 bg-neutral-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="max-w-2xl space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500">
              TRASEUL CANDIDATULUI
            </span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-black">
              Cei 4 pasi pana la contractul dorit.
            </h2>
            <p className="text-neutral-600 text-sm">
              Un proces liniar si clar care te duce de la stadiul de cautare pana la oferta finala.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-2xl bg-white border border-neutral-200 space-y-3">
              <span className="text-xs font-mono font-bold text-neutral-400">PASUL 01</span>
              <h3 className="text-base font-bold text-black">Audit & Calibrare CV</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Incarci CV-ul curent, primesti raportul de compatibilitate si adaugi competentele cheie solicitate in anunturile tinta.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-neutral-200 space-y-3">
              <span className="text-xs font-mono font-bold text-neutral-400">PASUL 02</span>
              <h3 className="text-base font-bold text-black">Aplicare Tintita</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Generezi scrisori de intentie specifice si inregistrezi aplicatia in board-ul Kanban pentru urmarire disciplinata.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-neutral-200 space-y-3">
              <span className="text-xs font-mono font-bold text-neutral-400">PASUL 03</span>
              <h3 className="text-base font-bold text-black">Drill-down Tehnic</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Exersezi 15-20 de flashcard-uri zilnic pe stiva ta tehnica si parcurgi scenariile practice de arhitectura de sistem.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-neutral-200 space-y-3">
              <span className="text-xs font-mono font-bold text-neutral-400">PASUL 04</span>
              <h3 className="text-base font-bold text-black">Conversie in Oferta</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Sustii interviul HR cu povesti clare prin metoda STAR, stapanesti intrebarile tehnice si negociezi pachetul salarial.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FREQUENTLY ASKED QUESTIONS (FAQ)                                       */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-neutral-200/90">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500">
              INTREBARI FRECVENTE
            </span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-black">
              Claritate totala despre JobFlow AI.
            </h2>
          </div>

          <div className="space-y-4">
            
            {[
              {
                q: "Cum ma ajuta JobFlow AI daca sunt la inceput de drum (Junior / Student)?",
                a: "Platforma este ideala pentru candidatii la inceput de cariera. Iti ofera un ghid clar cu ce tehnologii cauta cu adevarat companiile in acest moment, cum sa iti structurezi proiectele personale in CV pentru a trece de filtrele automate si sute de intrebari reale de interviu pentru a invata exact ce ti se va cere."
              },
              {
                q: "Cum functioneaza calculul de compatibilitate ATS?",
                a: "Folosim un algoritm de parsare si comparatie semantica bazat pe vectori embeddings (PostgreSQL pgvector) care extrage competentele, termenii cheie si nivelul de experienta din anuntul de angajare si le compara direct cu textul extras din CV-ul tau, evidentiind exact ce lipseste."
              },
              {
                q: "Ce tehnologii sunt incluse in simulatorul de interviuri?",
                a: "Baza noastra de intrebari acopera Java, Spring Boot, React, JavaScript/TypeScript, SQL, Docker, Linux, Git, Concepte de Algoritmi & Structuri de Date, precum si scenarii de System Design si Arhitectura Microservicii."
              },
              {
                q: "Datele mele si fisierele PDF incarcate sunt in siguranta?",
                a: "Absolut. JobFlow AI respecta confidentialitatea datelor tale. Fisierele tale PDF si aplicatiile sunt stocate in baza de date locala sau in profilul tau privat securizat, fara a fi partajate sau vandute vreunei platforme terte de recrutare."
              }
            ].map((faq, idx) => (
              <div 
                key={idx}
                className="rounded-xl border border-neutral-200 bg-white p-5 cursor-pointer transition hover:border-neutral-300"
                onClick={() => toggleFaq(idx)}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-bold text-neutral-900">{faq.q}</h3>
                  <span className="text-lg font-mono text-neutral-400">
                    {faqOpenIndex === idx ? '−' : '+'}
                  </span>
                </div>
                {faqOpenIndex === idx && (
                  <p className="mt-3 text-xs text-neutral-600 leading-relaxed pt-2 border-t border-neutral-100">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FINAL MONOLITHIC DECISIVE CALL TO ACTION                               */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 bg-neutral-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900 text-[11px] font-mono text-neutral-400">
            <span>PREGATIRE STRATEGICA • REZULTATE MASURABILE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-tight">
            Esti gata sa elimini incertitudinea din cautarea urmatorului tau job?
          </h2>

          <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Porneste gratuit astazi. Optimizeaza primul tau CV, organizeaza-ti oportunitatile 
            si stapaneste fiecare interviu tehnic cu incredere.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigateTab ? onNavigateTab('tracker') : null}
              className="w-full sm:w-auto px-9 py-4 rounded-full bg-white hover:bg-neutral-100 text-black font-semibold text-sm transition cursor-pointer shadow-sm active:scale-95 inline-flex items-center justify-center gap-2"
            >
              <span>Deschide JobFlow AI</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateTab ? onNavigateTab('skill_roadmap') : null}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 font-medium text-sm transition cursor-pointer"
            >
              Consulta Roadmaps Gratuite
            </button>
          </div>

          <div className="pt-6 text-xs text-neutral-500 font-mono">
            Fara card de credit necesar • Configurare instanta • 100% Date Securizate
          </div>

        </div>
      </section>

    </div>
  );
}
