import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Building2, 
  Briefcase, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Filter, 
  RefreshCw, 
  Layers, 
  Globe, 
  Zap, 
  GraduationCap, 
  ShieldCheck, 
  DollarSign, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  ArrowUpRight,
  SlidersHorizontal
} from 'lucide-react';

export default function JobSearchPage({ 
  currentUser, 
  onSaveToKanbanSuccess, 
  onNavigateToStudio,
  onNavigateToKanban
}) {
  const DEFAULT_USER_ID = '23fe8bdd-08f4-413d-9985-f99c21040b59';
  const activeUserId = currentUser?.userId || currentUser?.id || DEFAULT_USER_ID;

  const [keyword, setKeyword] = useState('Java');
  const [location, setLocation] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [savingJobId, setSavingJobId] = useState(null);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (location) params.append('location', location);
      if (selectedPlatform && selectedPlatform !== 'ALL') params.append('platform', selectedPlatform);
      if (selectedLevel && selectedLevel !== 'ALL') params.append('level', selectedLevel);
      params.append('userId', activeUserId);

      const res = await fetch(`/api/v1/jobs/search?${params.toString()}`, {
        headers: { 'X-User-Id': activeUserId }
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (err) {
      console.error('Eroare la căutarea joburilor:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedPlatform, selectedLevel]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    fetchJobs();
  };

  const handleSaveToKanban = async (job) => {
    setSavingJobId(job.id);
    try {
      const res = await fetch('/api/v1/jobs/save-to-kanban', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': activeUserId 
        },
        body: JSON.stringify(job)
      });
      if (res.ok) {
        setSavedJobIds(prev => new Set(prev).add(job.id));
        setToastMessage(`Jobul „${job.jobTitle}” la ${job.companyName} a fost salvat în Kanban!`);
        setTimeout(() => setToastMessage(null), 4000);
        if (onSaveToKanbanSuccess) onSaveToKanbanSuccess();
      }
    } catch (err) {
      console.error('Eroare la salvarea în Kanban:', err);
    } finally {
      setSavingJobId(null);
    }
  };

  const getPlatformBadge = (platform) => {
    switch (platform) {
      case 'STAGIIPEBUNE':
        return { label: 'StagiiPeBune.ro', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', dot: 'bg-emerald-500' };
      case 'JUNIORS_RO':
        return { label: 'Juniors.ro', bg: 'bg-indigo-100 text-indigo-900 border-indigo-300', dot: 'bg-indigo-500' };
      case 'GREENHOUSE':
        return { label: 'Greenhouse (Direct ATS)', bg: 'bg-purple-100 text-purple-900 border-purple-300', dot: 'bg-purple-600' };
      case 'ASHBY':
        return { label: 'AshbyHQ (Direct ATS)', bg: 'bg-purple-100 text-purple-900 border-purple-300', dot: 'bg-purple-600' };
      case 'LEVER':
        return { label: 'Lever.co (Direct ATS)', bg: 'bg-purple-100 text-purple-900 border-purple-300', dot: 'bg-purple-600' };
      case 'LINKEDIN':
        return { label: 'LinkedIn Jobs', bg: 'bg-blue-100 text-blue-900 border-blue-300', dot: 'bg-blue-600' };
      case 'WELLFOUND':
        return { label: 'Wellfound Startups', bg: 'bg-rose-100 text-rose-900 border-rose-300', dot: 'bg-rose-500' };
      case 'INDEED':
        return { label: 'Indeed', bg: 'bg-sky-100 text-sky-900 border-sky-300', dot: 'bg-sky-600' };
      case 'EJOBS':
        return { label: 'eJobs.ro', bg: 'bg-amber-100 text-amber-900 border-amber-300', dot: 'bg-amber-500' };
      case 'HIPO':
        return { label: 'Hipo.ro Trainee', bg: 'bg-cyan-100 text-cyan-900 border-cyan-300', dot: 'bg-cyan-500' };
      case 'BESTJOBS':
        return { label: 'BestJobs', bg: 'bg-orange-100 text-orange-900 border-orange-300', dot: 'bg-orange-500' };
      default:
        return { label: platform, bg: 'bg-gray-100 text-gray-800 border-gray-300', dot: 'bg-gray-500' };
    }
  };

  const platformsList = [
    { id: 'ALL', label: 'Toate Platformele', icon: Globe },
    { id: 'STAGIIPEBUNE', label: '🎓 StagiiPeBune.ro', icon: GraduationCap },
    { id: 'JUNIORS_RO', label: '👶 Juniors.ro', icon: Briefcase },
    { id: 'DIRECT_ATS', label: '🏢 Direct ATS (Greenhouse / Ashby / Lever)', icon: Building2 },
    { id: 'LINKEDIN', label: '🌐 LinkedIn', icon: ExternalLink },
    { id: 'WELLFOUND', label: '🚀 Wellfound', icon: Zap },
    { id: 'EJOBS', label: '🇷🇴 eJobs & Hipo', icon: Layers }
  ];

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-16 font-sans text-gray-900">
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-4 py-3 rounded-2xl shadow-2xl border border-gray-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
          {onNavigateToKanban && (
            <button 
              onClick={onNavigateToKanban}
              className="ml-2 px-2.5 py-1 bg-white text-black text-xs font-extrabold rounded-lg hover:bg-gray-200 transition cursor-pointer"
            >
              Vezi în Kanban →
            </button>
          )}
        </div>
      )}

      {/* HERO HEADER */}
      <div className="bg-white border border-gray-200/90 shadow-sm p-6 sm:p-8 rounded-3xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                10+ Surse Integrate
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-blue-100 text-blue-800 border border-blue-200">
                Live ATS Matching
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
              Căutare & Agregator Job-uri Multi-Platformă
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium max-w-3xl leading-relaxed">
              Descoperă și aplică direct pe oportunități agregate de pe <strong>StagiiPeBune.ro, Juniors.ro, Greenhouse, Ashby, Lever, LinkedIn, Wellfound, eJobs și Hipo</strong>, cu scor de compatibilitate ATS calculat instant pe baza CV-ului tău.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button 
              onClick={fetchJobs}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizează Feed</span>
            </button>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <form onSubmit={handleSearchSubmit} className="pt-2 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            {/* KEYWORD SEARCH */}
            <div className="sm:col-span-6 relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5" />
              <input 
                type="text" 
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="Titlu rol, tehnologie (ex: Java, Spring Boot, React, Python)..."
                className="w-full bg-gray-50/80 hover:bg-gray-50 focus:bg-white border border-gray-300 focus:border-black rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-900 outline-none transition placeholder-gray-400 shadow-2xs"
              />
            </div>

            {/* LOCATION FILTER */}
            <div className="sm:col-span-3 relative flex items-center">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5" />
              <input 
                type="text" 
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Locație (București, Remote, Cluj)..."
                className="w-full bg-gray-50/80 hover:bg-gray-50 focus:bg-white border border-gray-300 focus:border-black rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-900 outline-none transition placeholder-gray-400 shadow-2xs"
              />
            </div>

            {/* EXPERIENCE LEVEL */}
            <div className="sm:col-span-2 relative flex items-center">
              <select 
                value={selectedLevel}
                onChange={e => setSelectedLevel(e.target.value)}
                className="w-full bg-gray-50/80 hover:bg-gray-50 focus:bg-white border border-gray-300 focus:border-black rounded-2xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-gray-900 outline-none transition cursor-pointer shadow-2xs appearance-none"
              >
                <option value="ALL">Toate Nivelurile</option>
                <option value="INTERNSHIP">Internship / Stagii</option>
                <option value="JUNIOR">Junior (0-2 ani)</option>
                <option value="MID">Mid-Level</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 pointer-events-none" />
            </div>

            {/* SUBMIT BUTTON */}
            <div className="sm:col-span-1">
              <button 
                type="submit"
                className="w-full h-full min-h-[40px] bg-black hover:bg-neutral-800 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PLATFORM HORIZONTAL FILTER PILLS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" /> Sursă:
            </span>
            {platformsList.map((p) => {
              const Icon = p.icon;
              const isSelected = selectedPlatform === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 flex items-center gap-1.5 transition cursor-pointer border ${
                    isSelected 
                      ? 'bg-black text-white border-black shadow-2xs' 
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200/90'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </form>

        {/* QUICK DEEP-SEARCH EXTERNAL SHORTCUTS */}
        <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-semibold text-gray-500">Căutare directă pe site-uri externe:</span>
          <a 
            href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keyword || 'Java Developer')}`} 
            target="_blank" 
            rel="noreferrer"
            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg font-bold text-[11px] flex items-center gap-1 transition shadow-2xs"
          >
            <span>LinkedIn</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>
          <a 
            href={`https://wellfound.com/jobs?role=${encodeURIComponent(keyword || 'Software Engineer')}`} 
            target="_blank" 
            rel="noreferrer"
            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 rounded-lg font-bold text-[11px] flex items-center gap-1 transition shadow-2xs"
          >
            <span>Wellfound</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>
          <a 
            href="https://stagiipebune.ro/" 
            target="_blank" 
            rel="noreferrer"
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg font-bold text-[11px] flex items-center gap-1 transition shadow-2xs"
          >
            <span>StagiiPeBune.ro</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>
          <a 
            href="https://juniors.ro/jobs" 
            target="_blank" 
            rel="noreferrer"
            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-lg font-bold text-[11px] flex items-center gap-1 transition shadow-2xs"
          >
            <span>Juniors.ro</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>
          <a 
            href={`https://www.ejobs.ro/locuri-de-munca/${encodeURIComponent(keyword || 'java')}/`} 
            target="_blank" 
            rel="noreferrer"
            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg font-bold text-[11px] flex items-center gap-1 transition shadow-2xs"
          >
            <span>eJobs</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>
          <a 
            href={`https://www.hipo.ro/locuri-de-munca/cautajob/toate-domeniile/${encodeURIComponent(keyword || 'java')}`} 
            target="_blank" 
            rel="noreferrer"
            className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-200 rounded-lg font-bold text-[11px] flex items-center gap-1 transition shadow-2xs"
          >
            <span>Hipo.ro</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* JOBS RESULTS COUNT & STATUS */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-extrabold text-gray-900">
            {jobs.length} Oportunități Găsite
          </span>
          <span className="text-xs text-gray-500 font-medium">
            (ordonate după cel mai mare scor de compatibilitate ATS)
          </span>
        </div>
      </div>

      {/* JOBS GRID */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-gray-200">
          <RefreshCw className="w-8 h-8 animate-spin text-black" />
          <span className="text-sm font-bold text-gray-700">Se agregă joburile din toate sursele...</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-gray-200 p-8 space-y-3">
          <Building2 className="w-10 h-10 text-gray-300 mx-auto" />
          <h4 className="text-base font-bold text-gray-900">Niciun job găsit pentru filtrele selectate</h4>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Încearcă să schimbi cuvintele cheie (ex: "Java", "Spring", "Backend") sau să selectezi "Toate Platformele".
          </p>
          <button 
            onClick={() => {
              setKeyword('');
              setLocation('');
              setSelectedPlatform('ALL');
              setSelectedLevel('ALL');
            }}
            className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition cursor-pointer"
          >
            Resetează Toate Filtrele
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => {
            const platformBadge = getPlatformBadge(job.sourcePlatform);
            const isSaved = savedJobIds.has(job.id);
            const isSaving = savingJobId === job.id;
            const isExpanded = expandedJobId === job.id;

            return (
              <div 
                key={job.id}
                className="bg-white rounded-2xl border border-gray-200/90 hover:border-gray-300 shadow-2xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between space-y-4"
              >
                {/* CARD TOP: PLATFORM BADGE + ATS MATCH SCORE */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-1 rounded-lg border ${platformBadge.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${platformBadge.dot}`}></span>
                      {platformBadge.label}
                    </span>

                    {/* ATS LIVE MATCH SCORE BADGE */}
                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-xs font-black text-emerald-800">
                        {job.atsMatchScore.toFixed(1)}% Match
                      </span>
                    </div>
                  </div>

                  {/* TITLE & COMPANY */}
                  <div>
                    <h3 className="text-base font-extrabold text-gray-950 tracking-tight leading-snug">
                      {job.jobTitle}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 mt-1">
                      <span className="text-gray-900 font-bold">{job.companyName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {job.location}
                      </span>
                    </div>
                  </div>

                  {/* PILLS: WORK MODEL, LEVEL, SALARY */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 border border-gray-200">
                      {job.workModel === 'REMOTE' ? '🏠 100% Remote' : job.workModel === 'HYBRID' ? '🏢 Hibrid' : '📍 On-Site'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 border border-gray-200">
                      {job.experienceLevel === 'INTERNSHIP' ? '🎓 Internship / Stagiu' : job.experienceLevel === 'JUNIOR' ? '👶 Junior' : '⚡ Mid-Level'}
                    </span>
                    {job.salaryRange && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-emerald-600" />
                        {job.salaryRange}
                      </span>
                    )}
                    <span className="text-gray-400 font-normal text-[10px] ml-auto flex items-center gap-0.5">
                      <Clock className="w-3 h-3" /> {job.postedDateAgo}
                    </span>
                  </div>

                  {/* SKILLS REQUIRED & MATCH PILLS */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex flex-wrap gap-1">
                      {job.matchingSkills?.map((skill) => (
                        <span key={skill} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> {skill}
                        </span>
                      ))}
                      {job.missingSkills?.map((skill) => (
                        <span key={skill} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* SHORT DESCRIPTION / EXPANDABLE */}
                  <div className="text-xs text-gray-600 leading-relaxed pt-1">
                    <p className={isExpanded ? '' : 'line-clamp-2'}>
                      {job.rawDescription}
                    </p>
                    <button 
                      onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                      className="text-[11px] font-bold text-gray-900 hover:text-black mt-1 flex items-center gap-0.5 cursor-pointer"
                    >
                      {isExpanded ? (
                        <>Mai puțin <ChevronUp className="w-3 h-3" /></>
                      ) : (
                        <>Vezi descrierea completă <ChevronDown className="w-3 h-3" /></>
                      )}
                    </button>
                  </div>
                </div>

                {/* CARD FOOTER ACTIONS (3 BUTTONS) */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
                  {/* DIRECT APPLY EXTERNAL BUTTON */}
                  <a 
                    href={job.directApplyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 min-w-[130px] px-3 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <span>Aplică pe Site</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>

                  {/* 1-CLICK SAVE TO KANBAN BUTTON */}
                  <button
                    onClick={() => handleSaveToKanban(job)}
                    disabled={isSaved || isSaving}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                      isSaved 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 opacity-90 cursor-default' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200 shadow-2xs'
                    }`}
                  >
                    {isSaving ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : isSaved ? (
                      <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Bookmark className="w-3.5 h-3.5 text-gray-600" />
                    )}
                    <span>{isSaved ? 'Salvat în Kanban' : 'Salvează'}</span>
                  </button>

                  {/* TAILOR CV IN STUDIO BUTTON */}
                  {onNavigateToStudio && (
                    <button
                      onClick={onNavigateToStudio}
                      title="Deschide Studio CV pentru a optimiza CV-ul dedicat acestui job"
                      className="px-2.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span className="hidden sm:inline">Optimizează CV</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
