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
  Filter,
  CheckSquare,
  HelpCircle
} from 'lucide-react';
import { JOB_TRACKS } from '../data/jobTracksRoadmapData';

export default function SkillRoadmapPage() {
  const [selectedTrackId, setSelectedTrackId] = useState('BACKEND');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'LEARN' | 'INTERVIEW'
  const [trackSearchQuery, setTrackSearchQuery] = useState('');
  const [resourceSearchQuery, setResourceSearchQuery] = useState('');
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
    return [...interview, ...learn]; // In ALL view, put interview prep & learning together
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
        <div className="space-y-2 max-w-4xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 bg-purple-100/90 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              Hub Resurse Gratuite & Pregatire Interviu Tehnic 2026
            </span>
            <span className="text-xs text-gray-400 font-semibold">•</span>
            <span className="text-xs font-bold text-gray-600">Aliniat cu Piata IT din Romania</span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-950 tracking-tight leading-tight">
            Unde Inveti Gratuit & De Unde Te Pregatesti pentru <span className="text-purple-600 underline decoration-purple-200 decoration-wavy">Interviul Tehnic</span>
          </h1>

          <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
            Selecteaza specializarea dorita. Ai acces direct la cele mai bune cursuri universitare deschise, documentatii oficiale, banci uriase de intrebari & raspunsuri pe GitHub, platforme de live coding si simulari de interviu 100% gratuite.
          </p>
        </div>

        {/* TRACKS SELECTOR BAR */}
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
      </div>

      {/* SELECTED TRACK CONTENT */}
      {selectedTrack && (
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
            {filteredResources.map((res, idx) => {
              const isInterview = res.category === 'INTERVIEW';

              return (
                <div 
                  key={idx} 
                  className={`p-5 rounded-3xl border transition flex flex-col justify-between space-y-4 group ${
                    res.isTopPick 
                      ? 'border-purple-300 bg-purple-50/30 hover:border-purple-400 shadow-2xs' 
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50 shadow-2xs'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* TOP BADGES */}
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

                    {/* TITLE */}
                    <h3 className="text-sm sm:text-base font-extrabold text-gray-950 group-hover:text-purple-600 transition leading-snug">
                      {res.title}
                    </h3>

                    {/* DESCRIPTION */}
                    <p className="text-xs text-gray-600 leading-relaxed font-sans">
                      {res.description}
                    </p>
                  </div>

                  {/* ACTION BUTTONS */}
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
              );
            })}
          </div>

          {filteredResources.length === 0 && (
            <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 text-gray-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-gray-300" />
              <p className="text-xs font-semibold">Nicio resursa gasita pentru cautarea "{resourceSearchQuery}".</p>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
