import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Code2, 
  Copy, 
  Check, 
  CheckCircle2, 
  ExternalLink, 
  BookOpen, 
  TrendingUp, 
  Cpu, 
  Server, 
  Cloud, 
  Layout, 
  Bug, 
  ShieldCheck, 
  Database, 
  Smartphone, 
  Search, 
  Layers, 
  Sparkles, 
  Briefcase, 
  Compass,
  Users,
  MessageSquare,
  Globe,
  AlertTriangle,
  Lightbulb,
  ChevronRight,
  CheckCheck,
  Brain,
  ArrowRight,
  X
} from 'lucide-react';
import { JOB_TRACKS } from '../data/jobTracksRoadmapData';
import { HR_INTERVIEW_DATA } from '../data/hrInterviewData';
import JavaAnkiTrainer from './JavaAnkiTrainer';

export default function SkillRoadmapPage() {
  // VIEW MODE: 'TECH_TRACKS' | 'HR_SCREENING' | 'ANKI_JAVA'
  const [viewMode, setViewMode] = useState('TECH_TRACKS');

  // TECH TRACKS STATE
  const [selectedTrackId, setSelectedTrackId] = useState('BACKEND');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'LEARN' | 'INTERVIEW'
  const [trackSearchQuery, setTrackSearchQuery] = useState('');
  const [resourceSearchQuery, setResourceSearchQuery] = useState('');

  // HR SCREENING STATE
  const [hrSubTab, setHrSubTab] = useState('ALL'); // 'ALL' | 'PITCH_STAR' | 'QUESTIONS' | 'ENGLISH' | 'RESOURCES'
  const [expandedHrQuestions, setExpandedHrQuestions] = useState({});

  // COPY & TOAST STATE
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const handleCopyLink = (url, title) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setToastMessage(`Link copiat: ${title}`);
    setTimeout(() => {
      setCopiedUrl(null);
      setToastMessage('');
    }, 2500);
  };

  const handleCopyText = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setToastMessage(`Copiat in clipboard: ${label}!`);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  const toggleHrQuestion = (idx) => {
    setExpandedHrQuestions(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Filter tracks by search query
  const filteredTracks = useMemo(() => {
    if (!trackSearchQuery.trim()) return JOB_TRACKS;
    const q = trackSearchQuery.toLowerCase().trim();
    return JOB_TRACKS.filter(t => 
      t.title.toLowerCase().includes(q) ||
      t.shortTitle.toLowerCase().includes(q) ||
      t.tagLine.toLowerCase().includes(q)
    );
  }, [trackSearchQuery]);

  // Selected track
  const selectedTrack = useMemo(() => {
    return JOB_TRACKS.find(t => t.id === selectedTrackId) || JOB_TRACKS[0];
  }, [selectedTrackId]);

  // Track icons helper
  const getTrackIcon = (iconKey, sizeClass = "w-4 h-4") => {
    switch (iconKey) {
      case 'Server': return <Server className={sizeClass} />;
      case 'Layout': return <Layout className={sizeClass} />;
      case 'Layers': return <Layers className={sizeClass} />;
      case 'Bug': return <Bug className={sizeClass} />;
      case 'Cloud': return <Cloud className={sizeClass} />;
      case 'Sparkles': return <Sparkles className={sizeClass} />;
      case 'ShieldCheck': return <ShieldCheck className={sizeClass} />;
      case 'Database': return <Database className={sizeClass} />;
      case 'Cpu': return <Cpu className={sizeClass} />;
      case 'Smartphone': return <Smartphone className={sizeClass} />;
      default: return <Code2 className={sizeClass} />;
    }
  };

  // Unified Theme System for specialization tracks (Calibrated Light Indigo & Slate)
  const getTrackTheme = () => {
    return {
      accent: 'indigo',
      ring: 'ring-indigo-500/20 border-indigo-600',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200/90',
      accentBorder: 'border-l-4 border-l-indigo-600',
      iconBg: 'bg-slate-100 text-slate-700 border-slate-200/80',
      cardBorder: 'hover:border-indigo-300'
    };
  };

  // Badge color helper for resource types (Refined Indigo & Slate Palette)
  const getTypeBadgeStyle = (type = '') => {
    return 'bg-neutral-100 text-neutral-800 border-neutral-200 font-mono';
  };

  // Compile combined resources for current track
  const allResources = useMemo(() => {
    if (!selectedTrack) return [];
    const learn = (selectedTrack.freeLearnResources || []).map(r => ({ ...r, category: 'LEARN' }));
    const interview = (selectedTrack.interviewPrepResources || []).map(r => ({ ...r, category: 'INTERVIEW' }));
    
    if (activeTab === 'LEARN') return learn;
    if (activeTab === 'INTERVIEW') return interview;
    return [...interview, ...learn];
  }, [selectedTrack, activeTab]);

  // Filter resources by search inside active track
  const filteredResources = useMemo(() => {
    if (!resourceSearchQuery.trim()) return allResources;
    const q = resourceSearchQuery.toLowerCase().trim();
    return allResources.filter(r => 
      r.title.toLowerCase().includes(q) ||
      r.platform.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
    );
  }, [allResources, resourceSearchQuery]);

  const learnCount = selectedTrack?.freeLearnResources?.length || 0;
  const interviewCount = selectedTrack?.interviewPrepResources?.length || 0;
  const totalCount = learnCount + interviewCount;

  return (
    <div className="space-y-6 font-sans text-neutral-900 pb-16">
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-black text-white px-4 py-2.5 rounded-xl shadow-xl border border-neutral-800 flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-neutral-200 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded px-2.5 py-0.5 text-[10px] uppercase font-mono font-bold tracking-wider text-neutral-800 bg-neutral-100 border border-neutral-300 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-neutral-900" />
                <span>Playbook Interviuri & Roadmap IT</span>
              </span>
              <span className="text-xs text-neutral-500 font-mono">Piata Tech Romania</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-950 tracking-tight leading-tight">
              Ghid Tehnic pe Roluri, Interviu HR si Trainer Anki
            </h1>

            <p className="text-xs sm:text-sm text-neutral-500 font-normal leading-relaxed max-w-xl">
              Curicula practica de interviu pentru piata IT din Romania: screening HR, intrebari tehnice de seniorat si repetitie spatiata pe 11 domenii.
            </p>

            {/* VIEW MODE TOGGLE SWITCHER */}
            <div className="inline-flex items-center p-1 bg-neutral-100 rounded-xl border border-neutral-200 shrink-0 self-start flex-wrap gap-1 font-mono text-xs">
              <button
                onClick={() => setViewMode('TECH_TRACKS')}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 cursor-pointer ${
                  viewMode === 'TECH_TRACKS'
                    ? 'bg-black text-white font-bold'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>Ghid Tehnic pe Roluri</span>
              </button>

              <button
                onClick={() => setViewMode('HR_SCREENING')}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 cursor-pointer ${
                  viewMode === 'HR_SCREENING'
                    ? 'bg-black text-white font-bold'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Interviu HR & Screening</span>
              </button>

              <button
                onClick={() => setViewMode('ANKI_JAVA')}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 cursor-pointer ${
                  viewMode === 'ANKI_JAVA'
                    ? 'bg-black text-white font-bold'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                <Brain className="w-4 h-4" />
                <span>Anki Flashcards (11 Domenii)</span>
              </button>
            </div>
          </div>

          {/* ASYMMETRIC BENTO STATS PANEL */}
          <div className="w-full lg:w-72 bg-neutral-50 border border-neutral-200 rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 shrink-0">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="space-y-0.5">
                <div className="text-xl font-bold text-neutral-950 font-mono">10</div>
                <div className="text-[11px] text-neutral-500 font-mono uppercase tracking-wider">Roluri Tehnice</div>
              </div>
              <div className="p-2 rounded-lg bg-white border border-neutral-200 text-neutral-900">
                <Code2 className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="space-y-0.5">
                <div className="text-xl font-bold text-neutral-950 font-mono">1380</div>
                <div className="text-[11px] text-neutral-500 font-mono uppercase tracking-wider">Carduri Anki</div>
              </div>
              <div className="p-2 rounded-lg bg-white border border-neutral-200 text-neutral-900">
                <Brain className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xl font-bold text-neutral-950 font-mono">100%</div>
                <div className="text-[11px] text-neutral-500 font-mono uppercase tracking-wider">Gratuit & Open</div>
              </div>
              <div className="p-2 rounded-lg bg-neutral-200 text-neutral-900">
                <Check className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* TECH TRACKS SELECTOR GRID */}
        {viewMode === 'TECH_TRACKS' && (
          <div className="mt-6 pt-5 border-t border-neutral-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-neutral-900" />
                <span className="text-xs font-mono font-bold text-neutral-900 uppercase tracking-wider">
                  Alege Specializarea ({JOB_TRACKS.length} Roluri):
                </span>
                <span className="text-[11px] text-neutral-500 hidden md:inline font-mono">
                  Selectat: <strong className="text-neutral-950">{selectedTrack?.title}</strong>
                </span>
              </div>

              {/* TRACK SEARCH */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Cauta rol (ex: Backend, QA)..."
                  value={trackSearchQuery}
                  onChange={e => setTrackSearchQuery(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl pl-8 pr-8 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:border-black transition outline-none"
                />
                {trackSearchQuery && (
                  <button 
                    onClick={() => setTrackSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black cursor-pointer p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* TRACK CARDS GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {filteredTracks.map((track) => {
                const isSelected = selectedTrackId === track.id;
                const resourceTotal = (track.freeLearnResources?.length || 0) + (track.interviewPrepResources?.length || 0);
                return (
                  <button
                    key={track.id}
                    onClick={() => {
                      setSelectedTrackId(track.id);
                      setResourceSearchQuery('');
                    }}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? `bg-neutral-100 border-black text-neutral-950`
                        : `bg-white hover:bg-neutral-50 text-neutral-900 border-neutral-200 hover:border-neutral-400`
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        isSelected 
                          ? 'bg-black text-white' 
                          : 'bg-neutral-100 text-neutral-800 border border-neutral-200'
                      }`}>
                        {getTrackIcon(track.iconKey, "w-4 h-4")}
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        isSelected
                          ? 'bg-black text-white font-bold'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {isSelected ? 'Activ' : `${resourceTotal}`}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <div className={`text-xs sm:text-sm font-bold tracking-tight leading-snug line-clamp-1 ${
                        isSelected ? 'text-black' : 'text-neutral-950'
                      }`}>
                        {track.shortTitle}
                      </div>
                      {track.badge && (
                        <div className="text-[10px] font-mono text-neutral-500 leading-tight line-clamp-1">
                          {track.badge}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredTracks.length === 0 && (
              <div className="text-center py-6 text-xs text-neutral-500 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                Nu am gasit niciun rol tehnic pentru "{trackSearchQuery}". Incearca un alt termen.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: TECH TRACKS VIEW                                                  */}
      {/* ========================================================================= */}
      {viewMode === 'TECH_TRACKS' && selectedTrack && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* TRACK HERO BANNER */}
          <div className="bg-white text-neutral-950 p-6 sm:p-7 rounded-xl border border-neutral-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="p-2 rounded-lg bg-black text-white shrink-0">
                  {getTrackIcon(selectedTrack.iconKey, "w-5 h-5")}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight">
                  {selectedTrack.title}
                </h2>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-neutral-300 bg-neutral-100 text-neutral-800">
                  {selectedTrack.badge}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans">
                {selectedTrack.tagLine}
              </p>
              <div className="text-xs text-neutral-500 flex items-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-neutral-900 shrink-0" />
                <span className="text-neutral-800 font-semibold">{selectedTrack.marketDemand}</span>
              </div>
            </div>

            {/* BENTO STATS */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0 font-mono">
              <div className="bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-xl text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Total</div>
                <div className="text-lg font-bold text-neutral-950 mt-0.5">{totalCount}</div>
              </div>
              <div className="bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-xl text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Interviu</div>
                <div className="text-lg font-bold text-neutral-950 mt-0.5">{interviewCount}</div>
              </div>
              <div className="bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-xl text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Cursuri</div>
                <div className="text-lg font-bold text-neutral-950 mt-0.5">{learnCount}</div>
              </div>
            </div>
          </div>

          {/* TABS & SEARCH BAR FOR RESOURCES */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* TABS */}
            <div className="inline-flex items-center p-1 bg-neutral-100 rounded-xl border border-neutral-200 shrink-0 self-start sm:self-auto gap-1 font-mono text-xs">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'ALL'
                    ? 'bg-black text-white font-bold'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Toate Resursele ({totalCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('INTERVIEW')}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'INTERVIEW'
                    ? 'bg-black text-white font-bold'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Pregatire Interviu ({interviewCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('LEARN')}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'LEARN'
                    ? 'bg-black text-white font-bold'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Unde Inveti Gratuit ({learnCount})</span>
              </button>
            </div>

            {/* SEARCH INSIDE RESOURCES */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Filtreaza resurse (ex: GitHub, Q&A)..."
                value={resourceSearchQuery}
                onChange={e => setResourceSearchQuery(e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded-xl pl-8 pr-8 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:border-black transition outline-none"
              />
              {resourceSearchQuery && (
                <button
                  onClick={() => setResourceSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black cursor-pointer p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* METHODOLOGY ROADMAP */}
          <div className="bg-white text-neutral-950 rounded-xl p-5 sm:p-6 border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-black text-white">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-neutral-950">
                  Metodologie de Pregatire pentru Interviu
                </h3>
              </div>
              <span className="text-[11px] text-neutral-400 font-mono hidden sm:inline">Trei Pasi Structurati</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs text-neutral-600">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-black text-white text-[11px] font-mono font-bold flex items-center justify-center">1</span>
                  <span className="font-bold text-neutral-950 text-xs">Fundamente & Concepte</span>
                </div>
                <p className="text-neutral-600 text-[11.5px] leading-relaxed">
                  Documentatii oficiale si cursuri open-source pentru a intelege mecanismele interne ale tehnologiilor, fara tutorial hell.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-black text-white text-[11px] font-mono font-bold flex items-center justify-center">2</span>
                  <span className="font-bold text-neutral-950 text-xs">Argumentare Orala (60-90s)</span>
                </div>
                <p className="text-neutral-600 text-[11.5px] leading-relaxed">
                  Formuleaza raspunsul tehnic cu voce tare, structurat pe definitie, mecanism intern, trade-off-uri si exemple din productie.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-black text-white text-[11px] font-mono font-bold flex items-center justify-center">3</span>
                  <span className="font-bold text-neutral-950 text-xs">Simulari Practice & Coding</span>
                </div>
                <p className="text-neutral-600 text-[11.5px] leading-relaxed">
                  Rezolva probleme pe NeetCode si repozitorii GitHub explicand deciziile inainte de a scrie codul, intocmai ca la interviu.
                </p>
              </div>
            </div>
          </div>

          {/* RESOURCES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResources.map((res, idx) => (
              <div 
                key={idx}
                className="bg-white border border-neutral-200 rounded-xl p-5 sm:p-6 hover:border-black transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">
                        {res.platform}
                      </span>
                      <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${getTypeBadgeStyle(res.type)}`}>
                        {res.type}
                      </span>
                    </div>

                    {res.isTopPick && (
                      <span className="font-mono text-[9px] uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        Recomandat
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-neutral-900 group-hover:text-black transition-colors leading-snug">
                    {res.title}
                  </h3>

                  <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                    {res.description}
                  </p>
                </div>

                <div className="pt-3 flex items-center gap-2 border-t border-neutral-100">
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3.5 rounded-xl text-xs font-medium bg-black hover:bg-neutral-800 text-white transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Acceseaza Gratuit</span>
                    <ExternalLink className="w-3.5 h-3.5 text-white" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(res.url, res.title)}
                    className="py-2 px-3 rounded-xl text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Copiaza link-ul direct"
                  >
                    {copiedUrl === res.url ? (
                      <Check className="w-3.5 h-3.5 text-neutral-900" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">{copiedUrl === res.url ? 'Copiat' : 'Copiaza'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="p-12 text-center bg-white rounded-xl border border-neutral-200 text-neutral-500 space-y-2">
              <Search className="w-8 h-8 mx-auto text-neutral-300" />
              <p className="text-xs font-medium">Nicio resursa gasita pentru cautarea "{resourceSearchQuery}".</p>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: HR & SCREENING NON-TECHNICAL INTERVIEW PLAYBOOK                   */}
      {/* ========================================================================= */}
      {viewMode === 'HR_SCREENING' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* HR HERO BANNER */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900 shrink-0">
                <Users className="w-5 h-5 text-neutral-900" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                  {HR_INTERVIEW_DATA.title}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 font-medium mt-0.5">
                  {HR_INTERVIEW_DATA.subtitle}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-neutral-700 font-sans">
              <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase text-neutral-900 block tracking-wider">Obiectivul Recruiterului</span>
                <p className="text-neutral-600 leading-relaxed text-[11.5px]">Evalueaza compatibilitatea cu echipa, capacitatea de comunicare si motivatia reala pentru rol.</p>
              </div>
              <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase text-neutral-900 block tracking-wider">Rata de Trecere</span>
                <p className="text-neutral-600 leading-relaxed text-[11.5px]">Peste 65% din candidati sunt descalificati la HR din cauza raspunsurilor vagi sau nepregatite.</p>
              </div>
              <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase text-neutral-900 block tracking-wider">Cheia Succesului</span>
                <p className="text-neutral-600 leading-relaxed text-[11.5px]">Pitch concis de 90 de secunde, exemple structurate STAR si fluenta la conversatia in engleza.</p>
              </div>
            </div>
          </div>

          {/* HR SUB-NAVIGATION TABS */}
          <div className="inline-flex flex-wrap items-center gap-1.5 p-1 bg-neutral-100 rounded-xl border border-neutral-200">
            {[
              { id: 'ALL', label: 'Ghid Complet 360°', icon: Compass },
              { id: 'TIMELINE', label: 'Structura Apelului (30 min)', icon: Briefcase },
              { id: 'PITCH_STAR', label: 'Pitch 90s & Metoda STAR', icon: Sparkles },
              { id: 'QUESTIONS', label: 'Top 8 Intrebari & Capcane', icon: MessageSquare },
              { id: 'ENGLISH', label: 'English Check & Intrebari', icon: Globe },
              { id: 'RESOURCES', label: 'Resurse Gratuite HR', icon: BookOpen }
            ].map(tab => {
              const isActive = hrSubTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setHrSubTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-black text-white font-bold'
                      : 'text-neutral-600 hover:text-black hover:bg-neutral-200/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* SECTION 1: TYPICAL 30-MIN CALL STRUCTURE */}
          {(hrSubTab === 'ALL' || hrSubTab === 'TIMELINE') && (
            <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-7 space-y-5">
              <div className="border-b border-neutral-100 pb-3.5">
                <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-black" />
                  Structura Cronologica a Apelului de HR (30 de Minute)
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Fiecare interval are un obiectiv clar de evaluare:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {HR_INTERVIEW_DATA.interviewPhases.map((phase, idx) => (
                  <div key={idx} className="p-4 sm:p-5 rounded-xl bg-white border border-neutral-200 hover:border-black transition-colors flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-800 bg-neutral-100 border border-neutral-300 px-2 py-0.5 rounded">
                          {phase.time}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-400">Pas {idx + 1}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-neutral-900">
                        {phase.title}
                      </h4>
                      <p className="text-[11.5px] text-neutral-600 leading-relaxed font-sans">
                        {phase.focus}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-700 font-sans space-y-0.5">
                      <strong className="text-black font-bold block">Recomandare:</strong>
                      <span>{phase.proTip}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: 90-SECOND PITCH & STAR METHOD */}
          {(hrSubTab === 'ALL' || hrSubTab === 'PITCH_STAR') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* PITCH 90S CARD */}
              <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-7 space-y-4 h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-black" />
                        {HR_INTERVIEW_DATA.pitchFormula.title}
                      </h3>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        {HR_INTERVIEW_DATA.pitchFormula.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {HR_INTERVIEW_DATA.pitchFormula.steps.map((st, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                        <span className="text-[11px] font-bold text-neutral-900 block">
                          {st.step}
                        </span>
                        <p className="text-xs text-neutral-700 leading-relaxed font-sans">
                          {st.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SCRIPT GATA DE ADAPTAT */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 sm:p-5 space-y-2.5 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-800">
                      Model de Script Personalizabil:
                    </span>
                    <button
                      onClick={() => handleCopyText(HR_INTERVIEW_DATA.pitchFormula.sampleScript, 'Script Pitch 90s')}
                      className="text-xs font-medium text-neutral-900 hover:text-black flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-neutral-200 hover:border-neutral-400 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiaza Script</span>
                    </button>
                  </div>
                  <p className="text-xs text-neutral-800 leading-relaxed font-sans italic select-text">
                    "{HR_INTERVIEW_DATA.pitchFormula.sampleScript}"
                  </p>
                </div>
              </div>

              {/* STAR METHOD CARD */}
              <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-7 space-y-4 h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="border-b border-neutral-100 pb-3.5">
                    <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-2">
                      <CheckCheck className="w-4 h-4 text-black" />
                      {HR_INTERVIEW_DATA.starMethod.title}
                    </h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      {HR_INTERVIEW_DATA.starMethod.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {HR_INTERVIEW_DATA.starMethod.components.map((c, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-black text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {c.letter}
                          </span>
                          <span className="text-xs font-bold text-neutral-900">{c.name}</span>
                        </div>
                        <p className="text-[10.5px] text-neutral-600 leading-relaxed font-sans pt-0.5">
                          {c.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* REAL CODE PROJECT EXAMPLE */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 sm:p-5 space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-800">
                      Exemplu Practic din Proiect Personal:
                    </span>
                  </div>
                  <div className="text-[11.5px] text-neutral-900 font-bold">
                    Intrebare: "{HR_INTERVIEW_DATA.starMethod.example.question}"
                  </div>
                  <p className="text-xs text-neutral-800 leading-relaxed font-sans select-text">
                    {HR_INTERVIEW_DATA.starMethod.example.answer}
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* SECTION 3: TOP 8 HR QUESTIONS & TRAPS */}
          {(hrSubTab === 'ALL' || hrSubTab === 'QUESTIONS') && (
            <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-7 space-y-4">
              <div className="border-b border-neutral-100 pb-3.5">
                <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-black" />
                  Top Intrebari Clasice de HR: Raspuns Recomandat vs. Red Flags
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Intrebarile adresate la aproape orice interviu de debut. Invata ce urmareste recruiterul si ce sa nu spui niciodata.
                </p>
              </div>

              <div className="space-y-3">
                {HR_INTERVIEW_DATA.topQuestions.map((item, idx) => {
                  const isExpanded = !!expandedHrQuestions[idx];

                  return (
                    <div 
                      key={idx} 
                      className="rounded-xl border border-neutral-200 overflow-hidden transition-all bg-white hover:border-neutral-300"
                    >
                      <button
                        onClick={() => toggleHrQuestion(idx)}
                        className="w-full text-left p-4 bg-neutral-50 hover:bg-neutral-100 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                      >
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-800 bg-neutral-200/80 px-2 py-0.5 rounded inline-block">
                            {item.category}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-neutral-900">
                            {item.q}
                          </h4>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-neutral-400 transition-transform shrink-0 ${isExpanded ? 'rotate-90 text-black' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="p-4 sm:p-5 bg-white border-t border-neutral-100 space-y-3.5 text-xs leading-relaxed font-sans">
                          <div className="text-neutral-600 italic bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                            <strong>Ce urmareste recruiterul:</strong> {item.intent}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                              <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Cum Sa Raspunzi (Exemplu Recomandat):
                              </span>
                              <p className="text-emerald-950 font-sans leading-relaxed">{item.goodAnswer}</p>
                            </div>

                            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5">
                              <span className="text-[10px] font-mono font-bold uppercase text-rose-800 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                De Evitat Absolut (Red Flag):
                              </span>
                              <p className="text-rose-950 font-sans leading-relaxed">{item.redFlag}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 4: ENGLISH CHECK & REVERSE QUESTIONS */}
          {(hrSubTab === 'ALL' || hrSubTab === 'ENGLISH') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* ENGLISH CHECK */}
              <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-7 space-y-4 h-full">
                <div className="border-b border-neutral-100 pb-3.5">
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-2">
                    <Globe className="w-4 h-4 text-black" />
                    {HR_INTERVIEW_DATA.englishCheck.title}
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {HR_INTERVIEW_DATA.englishCheck.description}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-neutral-800 block">Fraza tipica a recruiterului:</span>
                  <p className="italic font-sans">{HR_INTERVIEW_DATA.englishCheck.triggerPhrase}</p>
                </div>

                <div className="space-y-2">
                  {HR_INTERVIEW_DATA.englishCheck.goldenRules.map((r, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-0.5">
                      <span className="font-bold text-neutral-900 block">{r.title}</span>
                      <p className="text-neutral-600 font-sans">{r.tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* REVERSE QUESTIONS */}
              <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-7 space-y-4 h-full">
                <div className="border-b border-neutral-100 pb-3.5">
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-black" />
                    Intrebari Inteligente pe care sa le Pui TU la Final
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Cand recruiterul te intreaba "Ai vreo intrebare pentru noi?", nu spune niciodata "Nu". Pune una dintre aceste intrebari:
                  </p>
                </div>

                <div className="space-y-2.5">
                  {HR_INTERVIEW_DATA.reverseQuestions.map((rq, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1 hover:border-neutral-400 transition-colors">
                      <span className="font-bold text-xs text-neutral-900 block">"{rq.q}"</span>
                      <p className="text-[11px] text-neutral-600 italic font-sans">
                        <strong>De ce impresioneaza:</strong> {rq.why}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* SECTION 5: CURATED FREE HR & BEHAVIORAL RESOURCES */}
          {(hrSubTab === 'ALL' || hrSubTab === 'RESOURCES') && (
            <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-7 space-y-5">
              <div className="border-b border-neutral-100 pb-3.5">
                <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-black" />
                  Resurse & Ghiduri Gratuite pentru Interviul Comportamental
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Materiale de referinta oferite de universitati si platforme de cariera de renume.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {HR_INTERVIEW_DATA.freeHrResources.map((res, idx) => (
                  <div key={idx} className="p-5 sm:p-6 rounded-xl border border-neutral-200 bg-white hover:border-black transition-colors flex flex-col justify-between space-y-3.5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">
                          {res.platform}
                        </span>
                        <span className="text-[9px] font-mono font-bold uppercase text-neutral-800 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded">
                          {res.type}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-neutral-900">{res.title}</h4>
                      <p className="text-xs text-neutral-600 leading-relaxed font-sans">{res.description}</p>
                    </div>

                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3.5 rounded-xl text-xs font-medium bg-black hover:bg-neutral-800 text-white transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>Deschide Resursa</span>
                      <ExternalLink className="w-3.5 h-3.5 text-white" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: ANKI JAVA FLASHCARDS & REPETITIE SPATIATA                         */}
      {/* ========================================================================= */}
      {viewMode === 'ANKI_JAVA' && (
        <div className="animate-in fade-in duration-200">
          <JavaAnkiTrainer />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 6: CLOSING CTA & DAILY HABIT                                      */}
      {/* ========================================================================= */}
      {viewMode !== 'ANKI_JAVA' && (
        <div className="bg-white border border-neutral-200 rounded-xl p-8 sm:p-12 text-center space-y-6 mt-8">
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded px-2.5 py-0.5 text-[10px] uppercase font-mono font-bold text-neutral-800 bg-neutral-100 border border-neutral-300">
              <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
              <span>Pregatire Zilnica Structurata</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight leading-tight">
              Stapaneste Conceptele Tehnice si Treci Orice Interviu
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans max-w-xl mx-auto">
              15 minute pe zi de repetitie spatiata Anki si pregatire structurata pe roluri iti asigura avantajul competitiv la interviurile de angajare.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => {
                setViewMode('ANKI_JAVA');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto py-2.5 px-6 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Incepe Antrenamentul de Astazi</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>

            <button
              onClick={() => {
                setViewMode('TECH_TRACKS');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Exploreaza Curriculum Complet</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 sm:gap-6 pt-4 text-[11px] text-neutral-500 font-medium flex-wrap border-t border-neutral-100">
            <span>Open Source</span>
            <span className="h-3 w-px bg-neutral-200" />
            <span>Aliniat cu Piata Tech din Romania</span>
            <span className="h-3 w-px bg-neutral-200" />
            <span>Fara Inregistrare Obligatorie</span>
          </div>
        </div>
      )}

    </div>
  );
}
