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
  CheckCheck
} from 'lucide-react';
import { JOB_TRACKS } from '../data/jobTracksRoadmapData';
import { HR_INTERVIEW_DATA } from '../data/hrInterviewData';

export default function SkillRoadmapPage() {
  // VIEW MODE: 'TECH_TRACKS' vs 'HR_SCREENING'
  const [viewMode, setViewMode] = useState('TECH_TRACKS'); // 'TECH_TRACKS' | 'HR_SCREENING'

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
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-2xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 bg-purple-100/90 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                Playbook Interviuri & Roadmap IT 2026
              </span>
              <span className="text-xs text-gray-400 font-semibold">•</span>
              <span className="text-xs font-bold text-gray-600">Aliniat cu Piata Tech din Romania</span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-950 tracking-tight leading-tight">
              Cum Treci Interviul <span className="text-purple-600 underline decoration-purple-200 decoration-wavy">HR</span> si Cel <span className="text-indigo-600 underline decoration-indigo-200 decoration-wavy">Tehnic</span>
            </h1>

            <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
              Pregatire 360 de grade pentru intregul proces de selectie: de la primul apel de screening cu recruiterul (pitch de 90s, STAR, verificarea de engleza) pana la bancile de intrebari tehnice si cursurile gratuite pentru fiecare specializare.
            </p>
          </div>

          {/* VIEW MODE TOGGLE SWITCHER (TECH vs HR) */}
          <div className="flex items-center p-1 bg-gray-100 rounded-2xl border border-gray-200 shrink-0 self-start lg:self-center">
            <button
              onClick={() => setViewMode('TECH_TRACKS')}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                viewMode === 'TECH_TRACKS'
                  ? 'bg-white text-black shadow-xs font-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <Code2 className="w-4 h-4 text-purple-600" />
              <span>Ghid Tehnic pe Roluri</span>
            </button>

            <button
              onClick={() => setViewMode('HR_SCREENING')}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                viewMode === 'HR_SCREENING'
                  ? 'bg-white text-black shadow-xs font-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <Users className="w-4 h-4 text-amber-600" />
              <span>Interviu HR & Screening</span>
            </button>
          </div>
        </div>

        {/* TECH TRACKS SELECTOR BAR (ONLY VISIBLE IN TECH_TRACKS MODE) */}
        {viewMode === 'TECH_TRACKS' && (
          <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-black uppercase text-gray-400 tracking-wider">
                Alege Specializarea ({JOB_TRACKS.length} Roluri Tehnice):
              </span>

              {/* TRACK SEARCH */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Cauta rol (ex: Backend, QA, Cloud)..."
                  value={trackSearchQuery}
                  onChange={e => setTrackSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-600 focus:bg-white transition"
                />
              </div>
            </div>

            {/* TRACK PILLS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {filteredTracks.map((track) => {
                const isSelected = selectedTrackId === track.id;
                return (
                  <button
                    key={track.id}
                    onClick={() => {
                      setSelectedTrackId(track.id);
                      setResourceSearchQuery('');
                    }}
                    className={`px-3.5 py-2.5 rounded-2xl border text-left shrink-0 transition flex items-center gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-black text-white border-black shadow-sm ring-2 ring-purple-600/30'
                        : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-200'
                    }`}
                  >
                    <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-white/10 text-white' : 'bg-gray-100'}`}>
                      {getTrackIcon(track.iconKey, "w-4 h-4")}
                    </div>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5 truncate">
                        <span>{track.shortTitle}</span>
                        {track.badge && (
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                            isSelected ? 'bg-purple-500/30 text-purple-200' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {track.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: TECH TRACKS VIEW                                                  */}
      {/* ========================================================================= */}
      {viewMode === 'TECH_TRACKS' && selectedTrack && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* TRACK HERO BANNER */}
          <div className="bg-gradient-to-r from-gray-950 via-neutral-900 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-sm border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-white/10 text-white shrink-0">
                  {getTrackIcon(selectedTrack.iconKey, "w-5 h-5")}
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {selectedTrack.title}
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {selectedTrack.badge}
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                {selectedTrack.tagLine}
              </p>
              <div className="text-[11px] text-gray-400 flex items-center gap-1.5 pt-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>{selectedTrack.marketDemand}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-300 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 font-bold">
                {totalCount} Resurse Verificate
              </span>
            </div>
          </div>

          {/* TABS & SEARCH BAR FOR RESOURCES */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* TABS */}
            <div className="flex items-center p-1 bg-gray-100 rounded-2xl border border-gray-200 shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'ALL'
                    ? 'bg-white text-black shadow-xs font-black'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-purple-600" />
                <span>Toate Resursele ({totalCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('INTERVIEW')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'INTERVIEW'
                    ? 'bg-white text-black shadow-xs font-black'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pregatire Interviu ({interviewCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('LEARN')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'LEARN'
                    ? 'bg-white text-black shadow-xs font-black'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Unde Inveti Gratuit ({learnCount})</span>
              </button>
            </div>

            {/* SEARCH INSIDE RESOURCES */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Filtreaza resurse (ex: GitHub, Q&A, LeetCode)..."
                value={resourceSearchQuery}
                onChange={e => setResourceSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-600 shadow-2xs transition"
              />
            </div>
          </div>

          {/* STRATEGY PRO-TIP BANNER */}
          <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-sm border border-purple-800 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <h3 className="text-sm font-black tracking-tight text-white uppercase">
                Metodologie Recomandata de Pregatire pentru Interviu
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-200 leading-relaxed font-sans">
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10 space-y-1">
                <span className="font-black text-amber-300 block">1. Fixeaza Conceptele Cheie</span>
                <p>Urmareste documentatiile oficiale si cursurile gratuite pentru a intelege fundamentele fara a ramane blocat in tutoriale pasive.</p>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10 space-y-1">
                <span className="font-black text-emerald-300 block">2. Repeta Intrebarile cu Voce Tare</span>
                <p>Ia intrebarile de pe GitHub si formuleaza raspunsul tehnic oral in 60-90 de secunde, explicand argumentat si cu exemple de cod.</p>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10 space-y-1">
                <span className="font-black text-sky-300 block">3. Simuleaza Live Coding</span>
                <p>Rezolva problemele pe NeetCode sau LeetCode explicand pasii inainte de a scrie primul rand de cod, exact ca la un interviu real.</p>
              </div>
            </div>
          </div>

          {/* RESOURCES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResources.map((res, idx) => (
              <div 
                key={idx} 
                className={`p-5 rounded-3xl border transition flex flex-col justify-between space-y-4 group ${
                  res.isTopPick 
                    ? 'border-purple-300 bg-purple-50/30 hover:border-purple-400 shadow-2xs' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50 shadow-2xs'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-lg border border-gray-200">
                        {res.platform}
                      </span>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${getTypeBadgeStyle(res.type)}`}>
                        {res.type}
                      </span>
                    </div>

                    {res.isTopPick && (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-purple-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                        Recomandat
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-extrabold text-gray-950 group-hover:text-purple-600 transition leading-snug">
                    {res.title}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed font-sans">
                    {res.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-2 border-t border-gray-100">
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white transition flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <span>Acceseaza Gratuit</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(res.url, res.title)}
                    className="py-2 px-3 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition flex items-center justify-center gap-1 cursor-pointer"
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
            <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 text-gray-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-gray-300" />
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
          <div className="bg-gradient-to-r from-amber-950 via-neutral-900 to-stone-900 text-white p-6 sm:p-7 rounded-3xl shadow-sm border border-neutral-800 space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 border border-amber-500/30">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {HR_INTERVIEW_DATA.title}
                </h2>
                <p className="text-xs text-amber-200/80 font-medium">
                  {HR_INTERVIEW_DATA.subtitle}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-gray-300 font-sans">
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-amber-400 block">Obiectivul HR-ului</span>
                <p>Nu iti testeaza codul linie cu linie; evalueaza daca esti comunicativ, pasionat, serios si adaptabil echipei.</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-emerald-400 block">Rata de Trecere</span>
                <p>Peste 65% din candidati sunt eliminati in runda de HR din cauza lipsei de pregatire si raspunsurilor vagi.</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-sky-400 block">Cheia Succesului</span>
                <p>Un pitch clar de 90 secunde, povesti structurate cu metoda STAR si naturalete la verificarea de limba engleza.</p>
              </div>
            </div>
          </div>

          {/* HR SUB-NAVIGATION TABS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
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
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-black text-white shadow-xs font-black ring-1 ring-black'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-gray-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* SECTION 1: TYPICAL 30-MIN CALL STRUCTURE */}
          {(hrSubTab === 'ALL' || hrSubTab === 'TIMELINE') && (
            <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-sm font-black text-gray-950 uppercase tracking-wide flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-600" />
                  Structura Cronologica a Apelului de HR (Cum Sunt Impartite cele 30 de Minute)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Fiecare minut conteaza. Iata pasii exacti prin care te va trece recruiterul:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {HR_INTERVIEW_DATA.interviewPhases.map((phase, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex flex-col justify-between space-y-2">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                          {phase.time}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">Etapa {idx + 1}</span>
                      </div>
                      <h4 className="text-xs font-black text-gray-950">
                        {phase.title}
                      </h4>
                      <p className="text-[11px] text-gray-600 leading-relaxed font-sans">
                        {phase.focus}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-[11px] text-amber-950 font-sans">
                      <strong className="text-amber-800 font-bold block mb-0.5">Pro-Tip:</strong>
                      {phase.proTip}
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
              <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-gray-950 uppercase tracking-wide flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      {HR_INTERVIEW_DATA.pitchFormula.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {HR_INTERVIEW_DATA.pitchFormula.subtitle}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {HR_INTERVIEW_DATA.pitchFormula.steps.map((st, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-1">
                      <span className="text-[11px] font-extrabold text-purple-900 block">
                        {st.step}
                      </span>
                      <p className="text-xs text-gray-700 leading-relaxed font-sans">
                        {st.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* SCRIPT GATA DE ADAPTAT */}
                <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-900">
                      Model de Script Personalizabil:
                    </span>
                    <button
                      onClick={() => handleCopyText(HR_INTERVIEW_DATA.pitchFormula.sampleScript, 'Script Pitch 90s')}
                      className="text-xs font-bold text-purple-700 hover:text-purple-950 flex items-center gap-1 cursor-pointer"
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
              <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-black text-gray-950 uppercase tracking-wide flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-emerald-600" />
                    {HR_INTERVIEW_DATA.starMethod.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {HR_INTERVIEW_DATA.starMethod.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {HR_INTERVIEW_DATA.starMethod.components.map((c, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {c.letter}
                        </span>
                        <span className="text-xs font-bold text-gray-900">{c.name}</span>
                      </div>
                      <p className="text-[10px] text-gray-600 leading-relaxed font-sans pt-0.5">
                        {c.explanation}
                      </p>
                    </div>
                  ))}
                </div>

                {/* REAL CODE PROJECT EXAMPLE */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900">
                      Exemplu Practic din Proiect Personal:
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-950 font-bold">
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
            <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-sm font-black text-gray-950 uppercase tracking-wide flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  Top Intrebari Clasice de HR: Raspuns Recomandat vs. Red Flags (Capcane)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Intrebarile adresate la aproape orice interviu de debut. Invata ce urmareste recruiterul si ce sa nu spui niciodata.
                </p>
              </div>

              <div className="space-y-3">
                {HR_INTERVIEW_DATA.topQuestions.map((item, idx) => {
                  const isExpanded = !!expandedHrQuestions[idx];

                  return (
                    <div 
                      key={idx} 
                      className="rounded-2xl border border-gray-200 overflow-hidden transition"
                    >
                      <button
                        onClick={() => toggleHrQuestion(idx)}
                        className="w-full text-left p-4 bg-gray-50/70 hover:bg-gray-100/70 flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.2 rounded-md inline-block">
                            {item.category}
                          </span>
                          <h4 className="text-xs sm:text-sm font-extrabold text-gray-950">
                            {item.q}
                          </h4>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${isExpanded ? 'rotate-90 text-black' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="p-4 bg-white border-t border-gray-100 space-y-3 text-xs leading-relaxed font-sans">
                          <div className="text-gray-600 italic bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                            <strong>Ce urmareste recruiterul:</strong> {item.intent}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                              <span className="text-[10px] font-black uppercase text-emerald-800 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Cum Sa Raspunzi (Exemplu Recomandat):
                              </span>
                              <p className="text-emerald-950 font-sans">{item.goodAnswer}</p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 space-y-1">
                              <span className="text-[10px] font-black uppercase text-rose-800 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                De Evitat Absolut (Red Flag):
                              </span>
                              <p className="text-rose-950 font-sans">{item.redFlag}</p>
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
              <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-black text-gray-950 uppercase tracking-wide flex items-center gap-2">
                    <Globe className="w-4 h-4 text-sky-600" />
                    {HR_INTERVIEW_DATA.englishCheck.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {HR_INTERVIEW_DATA.englishCheck.description}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-950 space-y-1">
                  <span className="text-[10px] font-black uppercase text-sky-800 block">Fraza tipica a recruiterului:</span>
                  <p className="italic font-sans">{HR_INTERVIEW_DATA.englishCheck.triggerPhrase}</p>
                </div>

                <div className="space-y-2">
                  {HR_INTERVIEW_DATA.englishCheck.goldenRules.map((r, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-0.5">
                      <span className="font-extrabold text-gray-950 block">{r.title}</span>
                      <p className="text-gray-600 font-sans">{r.tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* REVERSE QUESTIONS (CE INTREBI TU LA FINAL) */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-black text-gray-950 uppercase tracking-wide flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    Intrebari Inteligente pe care sa le Pui TU la Final
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Cand recruiterul te intreaba "Ai vreo intrebare pentru noi?", nu spune niciodata "Nu". Pune una dintre aceste intrebari:
                  </p>
                </div>

                <div className="space-y-2.5">
                  {HR_INTERVIEW_DATA.reverseQuestions.map((rq, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                      <span className="font-bold text-xs text-gray-950 block">"{rq.q}"</span>
                      <p className="text-[11px] text-gray-600 italic font-sans">
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
            <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-sm font-black text-gray-950 uppercase tracking-wide flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  Resurse & Ghiduri Gratuite pentru Interviul Comportamental
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Materiale de referinta oferite de universitati si platforme de cariera de renume.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {HR_INTERVIEW_DATA.freeHrResources.map((res, idx) => (
                  <div key={idx} className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 transition flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                          {res.platform}
                        </span>
                        <span className="text-[9px] font-black uppercase text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md">
                          {res.type}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-950">{res.title}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed font-sans">{res.description}</p>
                    </div>

                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white transition flex items-center justify-center gap-1.5 shadow-2xs"
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

    </div>
  );
}
