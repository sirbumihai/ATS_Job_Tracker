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
      case 'Server': return <Server className={`${sizeClass} text-emerald-600`} />;
      case 'Layout': return <Layout className={`${sizeClass} text-blue-600`} />;
      case 'Layers': return <Layers className={`${sizeClass} text-indigo-600`} />;
      case 'Bug': return <Bug className={`${sizeClass} text-rose-600`} />;
      case 'Cloud': return <Cloud className={`${sizeClass} text-sky-600`} />;
      case 'Sparkles': return <Sparkles className={`${sizeClass} text-amber-600`} />;
      case 'ShieldCheck': return <ShieldCheck className={`${sizeClass} text-red-600`} />;
      case 'Database': return <Database className={`${sizeClass} text-teal-600`} />;
      case 'Cpu': return <Cpu className={`${sizeClass} text-purple-600`} />;
      case 'Smartphone': return <Smartphone className={`${sizeClass} text-pink-600`} />;
      default: return <Code2 className={`${sizeClass} text-gray-600`} />;
    }
  };

  // Badge color helper for resource types
  const getTypeBadgeStyle = (type = '') => {
    const t = type.toUpperCase();
    if (t.includes('BANCA') || t.includes('INTREBARI')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    if (t.includes('CURS')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (t.includes('ALGORITMI') || t.includes('CODING')) {
      return 'bg-amber-100 text-amber-900 border-amber-200';
    }
    if (t.includes('REPO') || t.includes('GITHUB')) {
      return 'bg-sky-100 text-sky-800 border-sky-200';
    }
    if (t.includes('SYSTEM DESIGN') || t.includes('ARHITECTURA')) {
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    }
    if (t.includes('MOCK') || t.includes('PRACTICA')) {
      return 'bg-rose-100 text-rose-800 border-rose-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
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
    <div className="space-y-6 font-sans text-gray-900 pb-16">
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-black text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200/80 flex items-center gap-1.5 shadow-2xs">
                <GraduationCap className="w-3.5 h-3.5" />
                Playbook Interviuri & Roadmap IT 2026
              </span>
              <span className="text-xs text-slate-300 font-semibold">•</span>
              <span className="text-xs font-bold text-slate-600">Aliniat cu Piata Tech din Romania</span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-950 tracking-tight leading-tight">
              Cum Treci Interviul <span className="text-purple-600 underline decoration-purple-200 decoration-wavy">HR</span>, Cel <span className="text-indigo-600 underline decoration-indigo-200 decoration-wavy">Tehnic</span> si <span className="text-blue-600 underline decoration-blue-200 decoration-wavy">Anki Trainer</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Pregatire 360 de grade pentru intregul proces de selectie: screening HR (pitch de 90s, STAR, verificarea de engleza), ghid tehnic pe roluri si antrenament interactiv cu flashcards stil Anki pentru Java.
            </p>
          </div>

          {/* VIEW MODE TOGGLE SWITCHER (TECH vs HR vs ANKI) */}
          <div className="inline-flex items-center p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 shrink-0 self-start lg:self-center flex-wrap gap-1 shadow-2xs">
            <button
              onClick={() => setViewMode('TECH_TRACKS')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-2 cursor-pointer active:scale-95 ${
                viewMode === 'TECH_TRACKS'
                  ? 'bg-white text-slate-950 shadow-xs font-black ring-1 ring-slate-900/5'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
              }`}
            >
              <Code2 className="w-4 h-4 text-purple-600" />
              <span>Ghid Tehnic pe Roluri</span>
            </button>

            <button
              onClick={() => setViewMode('HR_SCREENING')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-2 cursor-pointer active:scale-95 ${
                viewMode === 'HR_SCREENING'
                  ? 'bg-white text-slate-950 shadow-xs font-black ring-1 ring-slate-900/5'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
              }`}
            >
              <Users className="w-4 h-4 text-amber-600" />
              <span>Interviu HR & Screening</span>
            </button>

            <button
              onClick={() => setViewMode('ANKI_JAVA')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-2 cursor-pointer active:scale-95 ${
                viewMode === 'ANKI_JAVA'
                  ? 'bg-white text-slate-950 shadow-xs font-black ring-1 ring-slate-900/5'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
              }`}
            >
              <Brain className="w-4 h-4 text-blue-600" />
              <span>Anki Flashcards (11 Domenii)</span>
            </button>
          </div>
        </div>

        {/* TECH TRACKS SELECTOR GRID (ONLY VISIBLE IN TECH_TRACKS MODE) */}
        {viewMode === 'TECH_TRACKS' && (
          <div className="mt-7 pt-6 border-t border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Alege Specializarea ({JOB_TRACKS.length} Roluri Tehnice):
                </span>
                <span className="text-[11px] text-slate-500 font-semibold hidden md:inline">
                  • Selectat: <strong className="text-slate-950 font-bold">{selectedTrack?.title}</strong>
                </span>
              </div>

              {/* TRACK SEARCH */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Cauta rol (ex: Backend, QA, Cloud)..."
                  value={trackSearchQuery}
                  onChange={e => setTrackSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition"
                />
                {trackSearchQuery && (
                  <button 
                    onClick={() => setTrackSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* TRACK CARDS GRID (Fara scroll orizontal, 2 randuri curate de cate 5 pe desktop) */}
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
                    className={`group p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 active:scale-98 ${
                      isSelected
                        ? 'bg-slate-950 text-white border-slate-900 shadow-md ring-2 ring-purple-600/50 -translate-y-0.5'
                        : 'bg-white hover:bg-slate-50/80 text-slate-900 border-slate-200/90 hover:border-slate-300 hover:shadow-2xs hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`p-2 rounded-xl shrink-0 transition-colors ${
                        isSelected 
                          ? 'bg-white/15 text-white shadow-2xs' 
                          : 'bg-slate-50 text-purple-600 border border-slate-200/70 shadow-2xs group-hover:bg-purple-50 group-hover:border-purple-200'
                      }`}>
                        {getTrackIcon(track.iconKey, "w-4 h-4")}
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full transition-colors ${
                        isSelected
                          ? 'bg-purple-500/25 text-purple-200 border border-purple-400/30'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-purple-50 group-hover:text-purple-700'
                      }`}>
                        {isSelected ? 'Activ' : `${resourceTotal} ghiduri`}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <div className={`text-xs sm:text-sm font-black tracking-tight leading-snug line-clamp-1 ${
                        isSelected ? 'text-white' : 'text-slate-950'
                      }`}>
                        {track.shortTitle}
                      </div>
                      {track.badge && (
                        <div className={`text-[10px] font-bold leading-tight line-clamp-1 ${
                          isSelected ? 'text-purple-300' : 'text-purple-700'
                        }`}>
                          {track.badge}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredTracks.length === 0 && (
              <div className="text-center py-6 text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
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
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="p-2.5 rounded-2xl bg-white/10 text-white shrink-0 border border-white/10 shadow-2xs">
                  {getTrackIcon(selectedTrack.iconKey, "w-5 h-5")}
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  {selectedTrack.title}
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30 backdrop-blur-xs">
                  {selectedTrack.badge}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {selectedTrack.tagLine}
              </p>
              <div className="text-xs text-slate-400 flex items-center gap-2 pt-1 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-emerald-300 font-bold">{selectedTrack.marketDemand}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-200 bg-white/10 px-4 py-2 rounded-2xl border border-white/15 font-extrabold backdrop-blur-xs shadow-2xs">
                {totalCount} Resurse Verificate
              </span>
            </div>
          </div>

          {/* TABS & SEARCH BAR FOR RESOURCES */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* TABS */}
            <div className="inline-flex items-center p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 shrink-0 self-start sm:self-auto gap-1 shadow-2xs">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  activeTab === 'ALL'
                    ? 'bg-white text-slate-950 shadow-xs font-black ring-1 ring-slate-900/5'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-purple-600" />
                <span>Toate Resursele ({totalCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('INTERVIEW')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  activeTab === 'INTERVIEW'
                    ? 'bg-white text-slate-950 shadow-xs font-black ring-1 ring-slate-900/5'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pregatire Interviu ({interviewCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('LEARN')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  activeTab === 'LEARN'
                    ? 'bg-white text-slate-950 shadow-xs font-black ring-1 ring-slate-900/5'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Unde Inveti Gratuit ({learnCount})</span>
              </button>
            </div>

            {/* SEARCH INSIDE RESOURCES */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Filtreaza resurse (ex: GitHub, Q&A, LeetCode)..."
                value={resourceSearchQuery}
                onChange={e => setResourceSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 shadow-2xs transition"
              />
              {resourceSearchQuery && (
                <button
                  onClick={() => setResourceSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* STRATEGY PRO-TIP BANNER */}
          <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-sm border border-purple-800/80 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black tracking-tight text-white uppercase">
                Metodologie Recomandata de Pregatire pentru Interviu
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs text-slate-200 leading-relaxed font-sans">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1.5 backdrop-blur-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black flex items-center justify-center">1</span>
                  <span className="font-black text-amber-300">Fixeaza Conceptele Cheie</span>
                </div>
                <p className="text-slate-300 text-[11.5px]">Urmareste documentatiile oficiale si cursurile gratuite pentru a intelege fundamentele fara a ramane blocat in tutoriale pasive.</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1.5 backdrop-blur-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black flex items-center justify-center">2</span>
                  <span className="font-black text-emerald-300">Repeta Intrebarile cu Voce Tare</span>
                </div>
                <p className="text-slate-300 text-[11.5px]">Ia intrebarile de pe GitHub si formuleaza raspunsul tehnic oral in 60-90 de secunde, explicand argumentat si cu exemple de cod.</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1.5 backdrop-blur-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-400/20 text-sky-300 border border-sky-400/30 text-[10px] font-black flex items-center justify-center">3</span>
                  <span className="font-black text-sky-300">Simuleaza Live Coding</span>
                </div>
                <p className="text-slate-300 text-[11.5px]">Rezolva problemele pe NeetCode sau LeetCode explicand pasii inainte de a scrie primul rand de cod, exact ca la un interviu real.</p>
              </div>
            </div>
          </div>

          {/* RESOURCES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResources.map((res, idx) => (
              <div 
                key={idx} 
                className={`p-5 sm:p-6 rounded-3xl border transition-all duration-200 flex flex-col justify-between space-y-4 group ${
                  res.isTopPick 
                    ? 'border-purple-200/90 bg-gradient-to-b from-purple-50/40 via-white to-white hover:border-purple-300 hover:shadow-md' 
                    : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/40 shadow-2xs hover:shadow-sm'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80">
                        {res.platform}
                      </span>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${getTypeBadgeStyle(res.type)}`}>
                        {res.type}
                      </span>
                    </div>

                    {res.isTopPick && (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-purple-600 text-white px-2.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        Recomandat
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-slate-950 group-hover:text-purple-600 transition-colors leading-snug">
                    {res.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {res.description}
                  </p>
                </div>

                <div className="pt-3 flex items-center gap-2 border-t border-slate-100">
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-800 text-white transition-all duration-150 flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
                  >
                    <span>Acceseaza Gratuit</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(res.url, res.title)}
                    className="py-2.5 px-3.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    title="Copiaza link-ul direct"
                  >
                    {copiedUrl === res.url ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
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
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">Nicio resursa gasita pentru cautarea "{resourceSearchQuery}".</p>
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
          <div className="bg-gradient-to-br from-slate-950 via-neutral-900 to-amber-950 text-white p-6 sm:p-8 rounded-3xl shadow-sm border border-neutral-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 shrink-0 border border-amber-500/30 shadow-2xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  {HR_INTERVIEW_DATA.title}
                </h2>
                <p className="text-xs sm:text-sm text-amber-200/80 font-medium">
                  {HR_INTERVIEW_DATA.subtitle}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 text-xs text-slate-300 font-sans">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1.5 backdrop-blur-xs">
                <span className="text-[10px] font-black uppercase text-amber-400 block tracking-wider">Obiectivul HR-ului</span>
                <p className="text-slate-300 leading-relaxed text-[11.5px]">Nu iti testeaza codul linie cu linie; evalueaza daca esti comunicativ, pasionat, serios si adaptabil echipei.</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1.5 backdrop-blur-xs">
                <span className="text-[10px] font-black uppercase text-emerald-400 block tracking-wider">Rata de Trecere</span>
                <p className="text-slate-300 leading-relaxed text-[11.5px]">Peste 65% din candidati sunt eliminati in runda de HR din cauza lipsei de pregatire si raspunsurilor vagi.</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1.5 backdrop-blur-xs">
                <span className="text-[10px] font-black uppercase text-sky-400 block tracking-wider">Cheia Succesului</span>
                <p className="text-slate-300 leading-relaxed text-[11.5px]">Un pitch clar de 90 secunde, povesti structurate cu metoda STAR si naturalete la verificarea de limba engleza.</p>
              </div>
            </div>
          </div>

          {/* HR SUB-NAVIGATION TABS (fara scroll orizontal) */}
          <div className="inline-flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 shadow-2xs">
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
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-white text-slate-950 shadow-xs font-black ring-1 ring-slate-900/5'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-500' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* SECTION 1: TYPICAL 30-MIN CALL STRUCTURE */}
          {(hrSubTab === 'ALL' || hrSubTab === 'TIMELINE') && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3.5">
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-wide flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-600" />
                  Structura Cronologica a Apelului de HR (Cum Sunt Impartite cele 30 de Minute)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fiecare minut conteaza. Iata pasii exacti prin care te va trece recruiterul:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {HR_INTERVIEW_DATA.interviewPhases.map((phase, idx) => (
                  <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-2xs transition-all duration-150 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                          {phase.time}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">Etapa {idx + 1}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-950">
                        {phase.title}
                      </h4>
                      <p className="text-[11.5px] text-slate-600 leading-relaxed font-sans">
                        {phase.focus}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-950 font-sans space-y-0.5">
                      <strong className="text-amber-800 font-bold block">Pro-Tip:</strong>
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
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                  <div>
                    <h3 className="text-sm font-black text-slate-950 uppercase tracking-wide flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      {HR_INTERVIEW_DATA.pitchFormula.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {HR_INTERVIEW_DATA.pitchFormula.subtitle}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {HR_INTERVIEW_DATA.pitchFormula.steps.map((st, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[11px] font-extrabold text-purple-900 block">
                        {st.step}
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed font-sans">
                        {st.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* SCRIPT GATA DE ADAPTAT */}
                <div className="bg-purple-50/80 border border-purple-200/90 rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-900">
                      Model de Script Personalizabil:
                    </span>
                    <button
                      onClick={() => handleCopyText(HR_INTERVIEW_DATA.pitchFormula.sampleScript, 'Script Pitch 90s')}
                      className="text-xs font-bold text-purple-700 hover:text-purple-950 flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-purple-200 shadow-2xs active:scale-95 transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiaza Script</span>
                    </button>
                  </div>
                  <p className="text-xs text-purple-950 leading-relaxed font-sans italic select-text">
                    "{HR_INTERVIEW_DATA.pitchFormula.sampleScript}"
                  </p>
                </div>
              </div>

              {/* STAR METHOD CARD */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 pb-3.5">
                  <h3 className="text-sm font-black text-slate-950 uppercase tracking-wide flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-emerald-600" />
                    {HR_INTERVIEW_DATA.starMethod.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {HR_INTERVIEW_DATA.starMethod.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {HR_INTERVIEW_DATA.starMethod.components.map((c, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {c.letter}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{c.name}</span>
                      </div>
                      <p className="text-[10.5px] text-slate-600 leading-relaxed font-sans pt-0.5">
                        {c.explanation}
                      </p>
                    </div>
                  ))}
                </div>

                {/* REAL CODE PROJECT EXAMPLE */}
                <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900">
                      Exemplu Practic din Proiect Personal:
                    </span>
                  </div>
                  <div className="text-[11.5px] text-emerald-950 font-bold">
                    Intrebare: "{HR_INTERVIEW_DATA.starMethod.example.question}"
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed font-sans select-text">
                    {HR_INTERVIEW_DATA.starMethod.example.answer}
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* SECTION 3: TOP 8 HR QUESTIONS & TRAPS */}
          {(hrSubTab === 'ALL' || hrSubTab === 'QUESTIONS') && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3.5">
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-wide flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  Top Intrebari Clasice de HR: Raspuns Recomandat vs. Red Flags (Capcane)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Intrebarile adresate la aproape orice interviu de debut. Invata ce urmareste recruiterul si ce sa nu spui niciodata.
                </p>
              </div>

              <div className="space-y-3">
                {HR_INTERVIEW_DATA.topQuestions.map((item, idx) => {
                  const isExpanded = !!expandedHrQuestions[idx];

                  return (
                    <div 
                      key={idx} 
                      className="rounded-2xl border border-slate-200/90 overflow-hidden transition-all duration-150 hover:border-slate-300 shadow-2xs"
                    >
                      <button
                        onClick={() => toggleHrQuestion(idx)}
                        className="w-full text-left p-4 sm:p-4.5 bg-slate-50/70 hover:bg-slate-100/70 flex items-center justify-between gap-3 cursor-pointer transition-colors duration-150"
                      >
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md inline-block">
                            {item.category}
                          </span>
                          <h4 className="text-xs sm:text-sm font-extrabold text-slate-950">
                            {item.q}
                          </h4>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-90 text-slate-950' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="p-4 sm:p-5 bg-white border-t border-slate-100 space-y-3.5 text-xs leading-relaxed font-sans">
                          <div className="text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <strong>Ce urmareste recruiterul:</strong> {item.intent}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/90 space-y-1.5 shadow-2xs">
                              <span className="text-[10px] font-black uppercase text-emerald-800 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Cum Sa Raspunzi (Exemplu Recomandat):
                              </span>
                              <p className="text-emerald-950 font-sans leading-relaxed">{item.goodAnswer}</p>
                            </div>

                            <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200/90 space-y-1.5 shadow-2xs">
                              <span className="text-[10px] font-black uppercase text-rose-800 flex items-center gap-1.5">
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
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 pb-3.5">
                  <h3 className="text-sm font-black text-slate-950 uppercase tracking-wide flex items-center gap-2">
                    <Globe className="w-4 h-4 text-sky-600" />
                    {HR_INTERVIEW_DATA.englishCheck.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {HR_INTERVIEW_DATA.englishCheck.description}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200/90 text-xs text-sky-950 space-y-1">
                  <span className="text-[10px] font-black uppercase text-sky-800 block">Fraza tipica a recruiterului:</span>
                  <p className="italic font-sans">{HR_INTERVIEW_DATA.englishCheck.triggerPhrase}</p>
                </div>

                <div className="space-y-2">
                  {HR_INTERVIEW_DATA.englishCheck.goldenRules.map((r, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-0.5">
                      <span className="font-extrabold text-slate-950 block">{r.title}</span>
                      <p className="text-slate-600 font-sans">{r.tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* REVERSE QUESTIONS (CE INTREBI TU LA FINAL) */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 pb-3.5">
                  <h3 className="text-sm font-black text-slate-950 uppercase tracking-wide flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    Intrebari Inteligente pe care sa le Pui TU la Final
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Cand recruiterul te intreaba "Ai vreo intrebare pentru noi?", nu spune niciodata "Nu". Pune una dintre aceste intrebari:
                  </p>
                </div>

                <div className="space-y-2.5">
                  {HR_INTERVIEW_DATA.reverseQuestions.map((rq, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 hover:border-slate-300 transition-colors">
                      <span className="font-bold text-xs text-slate-950 block">"{rq.q}"</span>
                      <p className="text-[11px] text-slate-600 italic font-sans">
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
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3.5">
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-wide flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  Resurse & Ghiduri Gratuite pentru Interviul Comportamental
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Materiale de referinta oferite de universitati si platforme de cariera de renume.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {HR_INTERVIEW_DATA.freeHrResources.map((res, idx) => (
                  <div key={idx} className="p-5 sm:p-6 rounded-3xl border border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs transition-all duration-150 flex flex-col justify-between space-y-3.5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                          {res.platform}
                        </span>
                        <span className="text-[9px] font-black uppercase text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-md">
                          {res.type}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-slate-950">{res.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans">{res.description}</p>
                    </div>

                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-800 text-white transition-all duration-150 flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
                    >
                      <span>Deschide Resursa</span>
                      <ExternalLink className="w-3.5 h-3.5" />
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

    </div>
  );
}
