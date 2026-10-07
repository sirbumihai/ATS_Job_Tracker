import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  Brain, 
  Cloud, 
  Server, 
  Database, 
  ShieldCheck, 
  Layers, 
  Layout, 
  Smartphone, 
  Cpu, 
  Headphones, 
  Briefcase, 
  Code, 
  CheckCircle2, 
  ExternalLink, 
  X, 
  ChevronRight, 
  Info, 
  Target, 
  Flame, 
  Zap, 
  BarChart3, 
  SlidersHorizontal,
  Compass,
  Building2,
  MapPin,
  RefreshCw,
  Globe,
  AlertCircle,
  BookOpen
} from 'lucide-react';

const DOMAIN_ICONS = {
  AI_DATA_SCIENCE: Brain,
  DEVOPS_CLOUD: Cloud,
  BACKEND: Server,
  DATA_ENGINEERING: Database,
  QA_AUTOMATION: CheckCircle2,
  CYBERSECURITY: ShieldCheck,
  FRONTEND: Layout,
  FULLSTACK: Layers,
  EMBEDDED_SYSTEMS: Cpu,
  MOBILE: Smartphone,
  IT_SUPPORT_SYSADMIN: Headphones,
  PRODUCT_BUSINESS_ANALYST: Briefcase,
  GENERAL_SOFTWARE: Code
};

export default function MarketInsightsPage({ currentUser, onNavigateToJobSearch }) {
  const [levelFilter, setLevelFilter] = useState('JUNIOR'); // JUNIOR, MID, SENIOR, ALL
  const [locationFilter, setLocationFilter] = useState('RO_ONLY'); // RO_ONLY, BUCURESTI, RO_AND_REMOTE, ALL
  const [activeOnly, setActiveOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('OPPORTUNITY'); // OPPORTUNITY, LOW_COMP, VOLUME, NAME
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal stare pentru detalii domeniu ("Cerinte Junior & Potrivire CV")
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [modalTab, setModalTab] = useState('requirements'); // 'requirements', 'sample_jobs'

  // Filtrare pe categorii de tehnologii in modal
  const [modalSkillCategory, setModalSkillCategory] = useState('ALL');

  const SKILL_CATEGORIES = [
    { id: 'ALL', label: 'Toate Tehnologiile' },
    { id: 'Limbaje de Programare', label: 'Limbaje' },
    { id: 'Frameworks & Web', label: 'Frameworks & Web' },
    { id: 'Baze de Date', label: 'Baze de Date' },
    { id: 'Cloud & DevOps', label: 'Cloud & DevOps' },
    { id: 'AI & Data', label: 'AI & Data Science' },
    { id: 'QA & Testare', label: 'QA & Testare' },
    { id: 'Sisteme & Securitate', label: 'Securitate & Sisteme' },
    { id: 'Unelte & Metodologii', label: 'Unelte & Agile' }
  ];

  const activeUserId = currentUser?.userId || currentUser?.id || null;

  const fetchInsights = async (
    level = levelFilter, 
    location = locationFilter, 
    active = activeOnly
  ) => {
    setLoading(true);
    setError(null);
    try {
      const headers = {};
      if (activeUserId) {
        headers['X-User-Id'] = activeUserId;
      }
      const userParam = activeUserId ? `&userId=${activeUserId}` : '';
      const res = await fetch(`/api/v1/market-insights?level=${level}&location=${location}&activeOnly=${active}${userParam}`, {
        headers
      });
      if (!res.ok) {
        throw new Error(`Eroare server: ${res.status}`);
      }
      const json = await res.json();
      setData(json);
      if (selectedDomain) {
        const updated = json.domains?.find(d => d.id === selectedDomain.id);
        if (updated) setSelectedDomain(updated);
      }
    } catch (err) {
      console.error("Eroare la preluarea cerintelor de piata:", err);
      setError("Nu s-au putut incarca cerintele de piata. Te rugam sa reincerci.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights(levelFilter, locationFilter, activeOnly);
  }, [levelFilter, locationFilter, activeOnly]);

  // Lock scroll si inchidere la tasta Escape cand modalul este deschis
  useEffect(() => {
    if (!selectedDomain || typeof document === 'undefined') return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedDomain(null);
    };
    window.addEventListener('keydown', handleKeyDown);

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = (prevBodyOverflow === 'hidden' ? '' : prevBodyOverflow);
      document.documentElement.style.overflow = (prevHtmlOverflow === 'hidden' ? '' : prevHtmlOverflow);
    };
  }, [selectedDomain]);

  // Filtrare si sortare domenii
  const filteredDomains = useMemo(() => {
    if (!data?.domains) return [];
    let list = [...data.domains];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(d => 
        d.title.toLowerCase().includes(q) || 
        d.tagLine.toLowerCase().includes(q) ||
        d.topSkills.some(s => s.skill.toLowerCase().includes(q))
      );
    }

    switch (sortBy) {
      case 'OPPORTUNITY':
        list.sort((a, b) => b.opportunityScore - a.opportunityScore);
        break;
      case 'LOW_COMP':
        list.sort((a, b) => b.lowCompetitionRate - a.lowCompetitionRate);
        break;
      case 'VOLUME':
        list.sort((a, b) => b.levelJobCount - a.levelJobCount);
        break;
      case 'NAME':
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return list;
  }, [data, searchQuery, sortBy]);

  const getOpportunityColor = (score) => {
    if (score >= 75) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (score >= 45) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-gray-700 bg-gray-50 border-gray-200';
  };

  const getCompBadge = (rate) => {
    if (rate >= 60) {
      return {
        label: 'Competitie Redusa',
        color: 'text-emerald-700 bg-emerald-100/70 border-emerald-300'
      };
    }
    if (rate >= 45) {
      return {
        label: 'Competitie Medie',
        color: 'text-amber-700 bg-amber-100/70 border-amber-300'
      };
    }
    return {
      label: 'Competitie Mare',
      color: 'text-rose-700 bg-rose-100/70 border-rose-300'
    };
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      
      {/* HERO HEADER */}
      <section className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-bold tracking-wide uppercase bg-neutral-100 text-neutral-900 border border-neutral-200">
              <Compass className="w-3.5 h-3.5 text-black" />
              Market Insights 2026
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950 tracking-tight leading-tight">
              Ce Se Cere pe Piata IT & Skill Match Junior
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Analiza bazata pe <span className="font-bold text-neutral-950">{data?.totalJobsAnalyzed ? data.totalJobsAnalyzed.toLocaleString() : '8.800+'} pozitii reale</span>. Compara cerintele oficiale de la joburile de Junior cu profilul tau pentru a vedea exact ce competente ai si ce iti lipseste.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2.5">
            <button
              onClick={() => fetchInsights()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition border border-neutral-200 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Actualizeaza Datele
            </button>
            {onNavigateToJobSearch && (
              <button
                onClick={onNavigateToJobSearch}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-black hover:bg-neutral-800 text-white transition shadow-xs cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-white" />
                Vezi Joburile Live in Cautare
              </button>
            )}
          </div>
        </div>
      </section>

      {/* STATS BANNER */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-neutral-200/90 p-4 rounded-xl shadow-2xs">
          <p className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Total Joburi Analizate</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-neutral-950 mt-1 tabular-nums">
            {data ? data.totalJobsAnalyzed?.toLocaleString() : '...'}
          </p>
          <p className="text-xs text-neutral-500 mt-0.5 font-mono">
            {locationFilter === 'BUCURESTI' ? 'Doar Bucuresti' : locationFilter === 'RO_ONLY' ? 'Toata Romania' : locationFilter === 'RO_AND_REMOTE' ? 'Romania & Remote' : 'Toate'}
          </p>
        </div>

        <div className="bg-white border border-neutral-200/90 p-4 rounded-xl shadow-2xs">
          <p className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Pozitii Junior & Intern</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-neutral-950 mt-1 tabular-nums">
            {data ? data.totalJuniorJobs?.toLocaleString() : '...'}
          </p>
          <p className="text-xs text-neutral-500 mt-0.5 font-mono">
            {data && data.totalJobsAnalyzed > 0 ? `${Math.round((data.totalJuniorJobs * 100) / data.totalJobsAnalyzed)}% din piata` : 'Oportunitati debut'}
          </p>
        </div>

        <div className="bg-white border border-neutral-200/90 p-4 rounded-xl shadow-2xs">
          <p className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Competitie Redusa</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-neutral-950 mt-1 tabular-nums">
            {data ? `${data.overallLowCompetitionPct}%` : '...'}
          </p>
          <p className="text-xs text-neutral-500 mt-0.5 font-mono">Sub 10-25 aplicanti / early apply</p>
        </div>

        <div className="bg-white border border-neutral-200/90 p-4 rounded-xl shadow-2xs">
          <p className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Specializari IT</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-neutral-950 mt-1 tabular-nums">
            {data?.domains ? data.domains.length : '13'}
          </p>
          <p className="text-xs text-neutral-500 mt-0.5 font-mono">Domenii tehnice distincte</p>
        </div>
      </section>

      {/* DUAL SELECTOR BAR: SENIORITY + LOCATION (BUCURESTI FILTER) */}
      <section className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
        
        {/* ROW 1: SENIORITY & LOCATION PILLS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-2 border-b border-neutral-100">
          
          {/* SENIORITY CONTROL */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-neutral-500 tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-black" />
              1. Nivel de Experienta:
            </label>
            <div className="inline-flex p-1 bg-neutral-100 rounded-xl border border-neutral-200 w-full overflow-x-auto">
              <button
                onClick={() => setLevelFilter('JUNIOR')}
                className={`flex-1 min-w-[120px] py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center ${
                  levelFilter === 'JUNIOR'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-neutral-700 hover:text-black hover:bg-neutral-200/60'
                }`}
              >
                Junior & Intern
              </button>
              <button
                onClick={() => setLevelFilter('MID')}
                className={`flex-1 min-w-[110px] py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center ${
                  levelFilter === 'MID'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-neutral-700 hover:text-black hover:bg-neutral-200/60'
                }`}
              >
                Mid-Level (2-4 ani)
              </button>
              <button
                onClick={() => setLevelFilter('SENIOR')}
                className={`flex-1 min-w-[120px] py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center ${
                  levelFilter === 'SENIOR'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-neutral-700 hover:text-black hover:bg-neutral-200/60'
                }`}
              >
                Senior & Lead (5+)
              </button>
              <button
                onClick={() => setLevelFilter('ALL')}
                className={`flex-1 min-w-[90px] py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center ${
                  levelFilter === 'ALL'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-neutral-700 hover:text-black hover:bg-neutral-200/60'
                }`}
              >
                Toate
              </button>
            </div>
          </div>

          {/* LOCATION FILTER (INCLUDING BUCURESTI) */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-neutral-500 tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-black" />
              2. Filtru Geografic (Locatie):
            </label>
            <div className="flex flex-wrap p-1 bg-neutral-100 rounded-xl border border-neutral-200 w-full gap-1">
              <button
                onClick={() => setLocationFilter('RO_ONLY')}
                className={`flex-1 min-w-[120px] py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center flex items-center justify-center gap-1.5 ${
                  locationFilter === 'RO_ONLY'
                    ? 'bg-black text-white shadow-xs font-bold'
                    : 'text-neutral-700 hover:text-black hover:bg-neutral-200/60'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Toata Romania</span>
              </button>
              <button
                onClick={() => setLocationFilter('BUCURESTI')}
                className={`flex-1 min-w-[110px] py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center flex items-center justify-center gap-1.5 ${
                  locationFilter === 'BUCURESTI'
                    ? 'bg-black text-white shadow-xs font-bold'
                    : 'text-neutral-700 hover:text-black hover:bg-neutral-200/60'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Bucuresti</span>
              </button>
              <button
                onClick={() => setLocationFilter('RO_AND_REMOTE')}
                className={`flex-1 min-w-[130px] py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center flex items-center justify-center gap-1.5 ${
                  locationFilter === 'RO_AND_REMOTE'
                    ? 'bg-black text-white shadow-xs font-bold'
                    : 'text-neutral-700 hover:text-black hover:bg-neutral-200/60'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Romania & Remote</span>
              </button>
              <button
                onClick={() => setLocationFilter('ALL')}
                className={`flex-1 min-w-[100px] py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center flex items-center justify-center gap-1.5 ${
                  locationFilter === 'ALL'
                    ? 'bg-black text-white shadow-xs font-bold'
                    : 'text-neutral-700 hover:text-black hover:bg-neutral-200/60'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Toate</span>
              </button>
            </div>
          </div>

        </div>

        {/* ROW 2: SEARCH & SORT TOOLBAR */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cauta domeniu sau skill (ex: python, devops, react, embedded)..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 font-semibold whitespace-nowrap">Sortare:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
              >
                <option value="OPPORTUNITY">Scor Oportunitate</option>
                <option value="LOW_COMP">Cea Mai Mica Competitie</option>
                <option value="VOLUME">Numar Joburi (Cerere)</option>
                <option value="NAME">Alfabetic</option>
              </select>
            </div>

            <label className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={activeOnly}
                onChange={(e) => setActiveOnly(e.target.checked)}
                className="rounded border-gray-300 text-black focus:ring-black h-3.5 w-3.5 cursor-pointer"
              />
              Doar active acum
            </label>
          </div>
        </div>
      </section>

      {/* HIGHLIGHT BOXES (SWEET SPOT, LOWEST COMPETITION, MOST IN-DEMAND) */}
      {data && !loading && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* BOX 1: SWEET SPOTS */}
          <div className="bg-white border border-neutral-200/90 hover:border-black rounded-2xl p-5 shadow-2xs transition-all flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-neutral-100 text-neutral-900 border border-neutral-200">
                  <Target className="w-3 h-3 text-black" />
                  Top Oportunitate
                </span>
                <span className="text-xs text-neutral-500 font-mono font-bold">Cel mai bun raport</span>
              </div>
              <h3 className="font-bold text-neutral-950 text-sm tracking-tight">Cerere mare & competitie redusa</h3>

              <div className="space-y-2 pt-1">
                {data.topSweetSpots?.slice(0, 3).map((spot, i) => (
                  <div 
                    key={spot.id}
                    onClick={() => { setSelectedDomain(spot); setModalTab('requirements'); }}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50/80 hover:bg-neutral-100 border border-neutral-200 transition cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-black text-white font-mono font-bold text-xs flex items-center justify-center">
                        #{i + 1}
                      </span>
                      <p className="text-xs font-bold text-neutral-900 group-hover:text-black transition truncate">
                        {spot.title}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-black px-2 py-0.5 rounded-md bg-white border border-neutral-200">
                      {spot.opportunityScore}/100
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BOX 2: LOWEST COMPETITION */}
          <div className="bg-white border border-neutral-200/90 hover:border-black rounded-2xl p-5 shadow-2xs transition-all flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-neutral-100 text-neutral-900 border border-neutral-200">
                  <ShieldCheck className="w-3 h-3 text-black" />
                  Competitie Redusa
                </span>
                <span className="text-xs text-neutral-500 font-mono font-bold">Putini candidati</span>
              </div>
              <h3 className="font-bold text-neutral-950 text-sm tracking-tight">Sanse mari de selectie rapida</h3>

              <div className="space-y-2 pt-1">
                {data.lowestCompetition?.slice(0, 3).map((spot, i) => (
                  <div 
                    key={spot.id}
                    onClick={() => { setSelectedDomain(spot); setModalTab('requirements'); }}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50/80 hover:bg-neutral-100 border border-neutral-200 transition cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-black text-white font-mono font-bold text-xs flex items-center justify-center">
                        #{i + 1}
                      </span>
                      <p className="text-xs font-bold text-neutral-900 group-hover:text-black transition truncate">
                        {spot.title}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-black px-2 py-0.5 rounded-md bg-white border border-neutral-200">
                      {spot.lowCompetitionRate}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BOX 3: MOST IN-DEMAND */}
          <div className="bg-white border border-neutral-200/90 hover:border-black rounded-2xl p-5 shadow-2xs transition-all flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-neutral-100 text-neutral-900 border border-neutral-200">
                  <Flame className="w-3 h-3 text-black" />
                  Cele Mai Cautate
                </span>
                <span className="text-xs text-neutral-500 font-mono font-bold">Volum maxim</span>
              </div>
              <h3 className="font-bold text-neutral-950 text-sm tracking-tight">Cele mai multe anunturi active</h3>

              <div className="space-y-2 pt-1">
                {data.mostInDemand?.slice(0, 3).map((spot, i) => (
                  <div 
                    key={spot.id}
                    onClick={() => { setSelectedDomain(spot); setModalTab('requirements'); }}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50/80 hover:bg-neutral-100 border border-neutral-200 transition cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-black text-white font-mono font-bold text-xs flex items-center justify-center">
                        #{i + 1}
                      </span>
                      <p className="text-xs font-bold text-neutral-900 group-hover:text-black transition truncate">
                        {spot.title}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-black px-2 py-0.5 rounded-md bg-white border border-neutral-200">
                      {spot.levelJobCount} joburi
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </section>
      )}

      {/* DOMAIN CARDS GRID (13 SPECIALIZATIONS) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-950 flex items-center gap-2 tracking-tight">
              <Code className="w-4 h-4 text-black" />
              Specializari Tehnice & Cerinte Reale ({filteredDomains.length})
            </h2>
            <p className="text-xs text-neutral-500">
              Apasa pe orice domeniu pentru a vedea cerintele junior complete, analiza competentelor tale si joburile deschise.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-neutral-800 bg-neutral-100 px-2.5 py-1 rounded-xl border border-neutral-200">
              {locationFilter === 'BUCURESTI' ? 'Bucuresti' : locationFilter === 'RO_ONLY' ? 'Toata Romania' : locationFilter === 'RO_AND_REMOTE' ? 'Romania & Remote' : 'Toate'}
            </span>
            <span className="text-xs font-mono font-bold text-neutral-800 bg-neutral-100 px-2.5 py-1 rounded-xl border border-neutral-200">
              Nivel: {levelFilter}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center bg-white border border-neutral-200 rounded-2xl">
            <RefreshCw className="w-8 h-8 text-black animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-neutral-900">Se analizeaza piata IT si cerintele de joburi...</p>
            <p className="text-xs text-neutral-500 mt-1">Calculare statistici de competitie, cerere si potrivire cerinte.</p>
          </div>
        ) : filteredDomains.length === 0 ? (
          <div className="py-16 text-center bg-white border border-neutral-200 rounded-2xl p-6">
            <Info className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-neutral-900">Nu a fost gasit niciun domeniu conform filtrelor selectate.</p>
            <button
              onClick={() => { setSearchQuery(''); setLevelFilter('JUNIOR'); setLocationFilter('RO_ONLY'); setActiveOnly(false); }}
              className="mt-3 px-4 py-2 bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Reseteaza Filtrele
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDomains.map((domain) => {
              const IconComp = DOMAIN_ICONS[domain.id] || Code;
              const compInfo = getCompBadge(domain.lowCompetitionRate);

              return (
                <div
                  key={domain.id}
                  onClick={() => { setSelectedDomain(domain); setModalTab('requirements'); }}
                  className="bg-white border border-neutral-200/90 hover:border-black rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-3.5">
                    {/* TOP LINE: ICON + BADGES */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 group-hover:bg-black group-hover:text-white transition shrink-0">
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-neutral-950 text-base leading-tight group-hover:text-neutral-700 transition truncate tracking-tight">
                            {domain.title}
                          </h3>
                          <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1 font-mono">
                            {domain.tagLine}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* METRICS ROW */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-gray-100 text-center">
                      <div className="bg-gray-50/80 rounded-xl p-2 border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Joburi {levelFilter}</p>
                        <p className="text-sm font-black text-gray-950 mt-0.5">
                          {domain.levelJobCount}
                        </p>
                      </div>
                      <div className="bg-gray-50/80 rounded-xl p-2 border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Competitie</p>
                        <p className={`text-[10px] font-black mt-1 px-1.5 py-0.5 rounded-md inline-block border ${compInfo.color}`}>
                          {compInfo.label}
                        </p>
                      </div>
                      <div className="bg-gray-50/80 rounded-xl p-2 border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Oportunitate</p>
                        <p className={`text-sm font-black mt-0.5 ${domain.opportunityScore >= 70 ? 'text-emerald-700' : 'text-indigo-700'}`}>
                          {domain.opportunityScore}<span className="text-[10px] text-gray-400 font-normal">/100</span>
                        </p>
                      </div>
                    </div>

                    {/* JUNIOR SKILL MATCH INDICATOR */}
                    {domain.topSkills && domain.topSkills.length > 0 && (
                      <div className="bg-gray-50/70 border border-gray-200/70 rounded-xl p-2.5 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-gray-700 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Potrivire Cerinte Junior:
                          </span>
                          {domain.userMatchScore > 0 ? (
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                              domain.userMatchScore >= 70 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                              domain.userMatchScore >= 40 ? 'bg-blue-50 text-blue-800 border-blue-200' :
                              'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                              {domain.userMatchScore}% Match
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-gray-400">
                              {domain.userMatchingSkills?.length || 0} din {domain.topSkills.length} cerinte
                            </span>
                          )}
                        </div>

                        {/* SKILL CHIPS: MATCHING (GREEN) VS MISSING (ROSE/GRAY) */}
                        <div className="flex flex-wrap gap-1">
                          {domain.topSkills.slice(0, 5).map((sk) => (
                            <span 
                              key={sk.skill}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                                sk.userHasSkill 
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                  : 'bg-white text-gray-600 border-gray-200'
                              }`}
                              title={sk.userHasSkill ? `${sk.skill}: Il ai in profil` : `${sk.skill}: Iti lipseste`}
                            >
                              {sk.userHasSkill ? (
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block shrink-0" />
                              )}
                              <span>{sk.skill}</span>
                            </span>
                          ))}
                          {domain.topSkills.length > 5 && (
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md">
                              +{domain.topSkills.length - 5}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* SENIORITY SPREAD MINI-BAR */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                        <span>Junior ({domain.juniorJobs})</span>
                        <span>Mid ({domain.midJobs})</span>
                        <span>Senior ({domain.seniorJobs})</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
                        <div 
                          className="bg-emerald-500 h-full" 
                          style={{ width: `${domain.totalJobs > 0 ? (domain.juniorJobs / domain.totalJobs) * 100 : 0}%` }}
                        />
                        <div 
                          className="bg-blue-500 h-full" 
                          style={{ width: `${domain.totalJobs > 0 ? (domain.midJobs / domain.totalJobs) * 100 : 0}%` }}
                        />
                        <div 
                          className="bg-purple-500 h-full" 
                          style={{ width: `${domain.totalJobs > 0 ? (domain.seniorJobs / domain.totalJobs) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM CTA BUTTON */}
                  <div className="mt-3.5 pt-3 border-t border-neutral-200 flex items-center justify-between text-xs font-bold text-neutral-900 group-hover:text-black transition">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-neutral-900" />
                      Verifica Cerinte Junior
                    </span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition text-neutral-400 group-hover:text-black" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* DETAIL MODAL ("CERINTE JUNIOR & POTRIVIRE CV") */}
      {selectedDomain && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setSelectedDomain(null)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div 
            className="bg-white rounded-2xl border border-neutral-300 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="p-5 sm:p-6 border-b border-neutral-200 flex items-start justify-between bg-white shrink-0">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                  {(() => {
                    const IconComp = DOMAIN_ICONS[selectedDomain.id] || Code;
                    return <IconComp className="w-5 h-5 text-white" />;
                  })()}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
                      {selectedDomain.title}
                    </h2>
                    <span className="font-mono text-xs uppercase px-2.5 py-0.5 rounded-md border border-neutral-300 bg-neutral-100 text-neutral-800">
                      {selectedDomain.opportunityBadge}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl">
                    {selectedDomain.tagLine}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDomain(null)}
                className="p-2 rounded-xl text-neutral-500 hover:text-black hover:bg-neutral-100 transition cursor-pointer"
                title="Inchide fereastra (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MODAL TABS */}
            <div className="px-6 border-b border-neutral-200 bg-neutral-50 flex gap-2 shrink-0 overflow-x-auto">
              <button
                onClick={() => setModalTab('requirements')}
                className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  modalTab === 'requirements'
                    ? 'border-black text-black bg-white font-bold'
                    : 'border-transparent text-neutral-500 hover:text-black'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-neutral-900" />
                Cerinte Junior & Potrivire CV
              </button>
              <button
                onClick={() => setModalTab('sample_jobs')}
                className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  modalTab === 'sample_jobs'
                    ? 'border-black text-black bg-white font-bold'
                    : 'border-transparent text-neutral-500 hover:text-black'
                }`}
              >
                <Briefcase className="w-4 h-4 text-neutral-700" />
                Joburi Reale Deschise ({selectedDomain.sampleJobs?.length || 0})
              </button>
            </div>

            {/* MODAL CONTENT BODY */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
              
              {/* TAB 1: REQUIREMENTS & CV MATCH */}
              {modalTab === 'requirements' && (
                <div className="space-y-5">
                  
                  {/* CV MATCH BREAKDOWN: WHAT YOU HAVE VS WHAT YOU ARE MISSING */}
                  <div className="bg-white border border-neutral-200 p-5 rounded-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                      <div>
                        <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-neutral-900" />
                          Analiza Competentelor Tale pentru {selectedDomain.title}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Comparatie intre cerintele anunturilor reale de Junior si profilul/CV-ul tau.
                        </p>
                      </div>
                      {selectedDomain.userMatchScore > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-500 font-medium">Grad Potrivire:</span>
                          <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md border border-neutral-300 bg-neutral-100 text-neutral-900">
                            {selectedDomain.userMatchScore}% Match
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* COLUMN 1: WHAT YOU HAVE */}
                      <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                            <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900" />
                            Competente Identificate ({selectedDomain.userMatchingSkills?.length || 0})
                          </span>
                          <span className="text-[10px] font-mono font-medium text-neutral-700 bg-neutral-200 px-2 py-0.5 rounded">
                            In CV
                          </span>
                        </div>

                        {selectedDomain.userMatchingSkills && selectedDomain.userMatchingSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {selectedDomain.userMatchingSkills.map((sk) => (
                              <span 
                                key={sk} 
                                className="px-2.5 py-1 rounded-md text-xs font-medium bg-white text-neutral-900 border border-neutral-200 flex items-center gap-1.5 font-mono"
                              >
                                <CheckCircle2 className="w-3 h-3 text-neutral-900 shrink-0" />
                                <span>{sk}</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-neutral-500 italic pt-1">
                            Nicio competenta specifica pentru acest domeniu nu a fost detectata inca in CV.
                          </p>
                        )}
                      </div>

                      {/* COLUMN 2: WHAT IS MISSING */}
                      <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                            <AlertCircle className="w-3.5 h-3.5 text-neutral-700" />
                            Ce Iti Lipseste ({selectedDomain.userMissingSkills?.length || 0})
                          </span>
                          <span className="text-[10px] font-mono font-medium text-neutral-700 bg-neutral-200 px-2 py-0.5 rounded">
                            De adaugat
                          </span>
                        </div>

                        {selectedDomain.userMissingSkills && selectedDomain.userMissingSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {selectedDomain.userMissingSkills.map((sk) => (
                              <span 
                                key={sk} 
                                className="px-2.5 py-1 rounded-md text-xs font-medium bg-white text-neutral-800 border border-neutral-200 flex items-center gap-1.5 font-mono"
                              >
                                <X className="w-3 h-3 text-neutral-400 shrink-0" />
                                <span>{sk}</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-neutral-900 font-medium pt-1">
                            Excelent! Ai toate cerintele principale detectate in descrierile de junior.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* INTERVIEW FORMAT BANNER */}
                  {selectedDomain.interviewFormat && (
                    <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl flex items-start gap-3">
                      <Zap className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-700 block">
                          Formatul Tipic al Interviului Tehnic in Romania
                        </span>
                        <p className="text-xs text-neutral-800 mt-1 leading-relaxed">
                          {selectedDomain.interviewFormat}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* COMPLETE SKILLS FREQUENCY GRID FOR THIS DOMAIN */}
                  <div className="bg-white p-5 rounded-xl border border-neutral-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="text-xs font-bold uppercase text-neutral-500 tracking-wider flex items-center gap-2 font-mono">
                        <BarChart3 className="w-4 h-4 text-neutral-900" />
                        Cerinte Tehnice din Anunturile Reale ({levelFilter})
                      </h4>
                      <span className="text-[11px] text-neutral-500 font-mono">
                        {selectedDomain.topSkills?.length || 0} tehnologii cerute
                      </span>
                    </div>

                    {/* CATEGORY PILLS FOR MODAL */}
                    {selectedDomain.topSkills && selectedDomain.topSkills.length > 0 && (
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 border-b border-neutral-100">
                        {SKILL_CATEGORIES.map((cat) => {
                          const countInCat = cat.id === 'ALL'
                            ? selectedDomain.topSkills.length
                            : selectedDomain.topSkills.filter(s => s.category === cat.id).length;
                          if (countInCat === 0 && cat.id !== 'ALL') return null;
                          const active = modalSkillCategory === cat.id;
                          return (
                            <button
                              key={cat.id}
                              onClick={() => setModalSkillCategory(cat.id)}
                              className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 border ${
                                active
                                  ? 'bg-black text-white border-black'
                                  : 'bg-white hover:bg-neutral-100 text-neutral-600 border-neutral-200'
                              }`}
                            >
                              <span>{cat.label}</span>
                              <span className={`text-[10px] px-1 py-0.2 rounded ${active ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-600'}`}>
                                {countInCat}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                      {selectedDomain.topSkills
                        ?.filter(sk => modalSkillCategory === 'ALL' || sk.category === modalSkillCategory)
                        .map((sk) => (
                          <div 
                            key={sk.skill} 
                            className={`p-3 rounded-xl border flex flex-col justify-between transition ${
                              sk.userHasSkill 
                                ? 'bg-neutral-50/80 border-neutral-300' 
                                : 'bg-white border-neutral-200'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-xs font-medium text-neutral-900 gap-1 font-mono">
                                <span className="truncate" title={sk.skill}>{sk.skill}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded inline-flex items-center gap-1 ${
                                  sk.userHasSkill 
                                    ? 'bg-neutral-900 text-white' 
                                    : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                                }`}>
                                  {sk.userHasSkill ? (
                                    <>
                                      <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                                      <span>In CV</span>
                                    </>
                                  ) : (
                                    <>
                                      <X className="w-2.5 h-2.5 text-neutral-400" />
                                      <span>Lipsa</span>
                                    </>
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                                <span>{sk.category || 'General'}</span>
                                <span className="font-bold text-neutral-900">{sk.percentage}% din joburi</span>
                              </div>
                            </div>
                            <div className="w-full bg-neutral-100 h-1 rounded-full overflow-hidden mt-2">
                              <div 
                                className="h-full rounded-full bg-black" 
                                style={{ width: `${Math.min(100, sk.percentage * 2)}%` }} 
                              />
                            </div>
                            <span className="text-[10px] text-neutral-400 mt-1 font-mono">{sk.count} anunturi</span>
                          </div>
                      ))}
                    </div>
                  </div>

                  {/* STRUCTURED REQUIREMENTS CATEGORIES */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedDomain.requirementsChecklist?.map((cat, idx) => (
                      <div key={idx} className="bg-white p-5 rounded-xl border border-neutral-200 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-bold text-neutral-900">
                          <CheckCircle2 className="w-4 h-4 text-neutral-900" />
                          <h4>{cat.categoryName}</h4>
                        </div>
                        <ul className="space-y-2">
                          {cat.items?.map((item, itemIdx) => (
                            <li key={itemIdx} className="text-xs text-neutral-700 flex items-start gap-2 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 shrink-0 mt-1.5"></span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: SAMPLE ACTIVE JOBS */}
              {modalTab === 'sample_jobs' && (
                <div className="space-y-4">
                  
                  {/* SEARCH REDIRECT BANNER */}
                  <div className="bg-white p-4 rounded-xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2 font-mono">
                        <Building2 className="w-4 h-4 text-neutral-900" />
                        Companii Reale Verificate ({locationFilter === 'BUCURESTI' ? 'Bucuresti' : locationFilter === 'RO_ONLY' ? 'Romania' : locationFilter === 'RO_AND_REMOTE' ? 'Romania & Remote' : 'Toate'})
                      </h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Fiecare pozitie provine de la o companie diferita pentru varietate.
                      </p>
                    </div>

                    {onNavigateToJobSearch && (
                      <button
                        onClick={() => {
                          setSelectedDomain(null);
                          onNavigateToJobSearch();
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-medium transition cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5 text-white" />
                        <span>Cauta in toate joburile deschise</span>
                      </button>
                    )}
                  </div>

                  {selectedDomain.sampleJobs && selectedDomain.sampleJobs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {selectedDomain.sampleJobs.map((job) => (
                        <div 
                          key={job.id} 
                          className="bg-white p-4 rounded-xl border border-neutral-200 hover:border-black transition flex flex-col justify-between text-neutral-900"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 truncate font-mono">
                                {job.companyName}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-neutral-200 bg-neutral-100 text-neutral-700">
                                {job.sourcePlatform}
                              </span>
                            </div>
                            <h4 className="font-bold text-xs sm:text-[13px] text-neutral-950 leading-snug line-clamp-2" title={job.jobTitle}>
                              {job.jobTitle}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 flex-wrap pt-0.5 font-mono">
                              <span className="inline-flex items-center gap-1 bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded">
                                <MapPin className="w-2.5 h-2.5 text-neutral-400" />
                                {job.location || 'Romania'}
                              </span>
                              <span className="inline-flex items-center gap-1 bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded">
                                <Briefcase className="w-2.5 h-2.5 text-neutral-400" />
                                {job.workModel || 'On-site'}
                              </span>
                              <span className="inline-flex items-center gap-1 font-bold text-neutral-900 bg-neutral-100 border border-neutral-300 px-1.5 py-0.5 rounded">
                                {job.experienceLevel || 'JUNIOR'}
                              </span>
                            </div>
                          </div>

                          {job.directApplyUrl && (
                            <div className="pt-2 border-t border-neutral-100 mt-2">
                              <a
                                href={job.directApplyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-medium transition cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-white" />
                                <span>Vezi Anuntul / Aplica</span>
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-white border border-neutral-200 rounded-xl space-y-3">
                      <p className="text-xs text-neutral-600">
                        Nu au fost identificate exemple directe pentru filtrul selectat.
                      </p>
                      <button
                        onClick={() => setLocationFilter('RO_AND_REMOTE')}
                        className="px-4 py-2 bg-black text-white text-xs font-medium rounded-xl hover:bg-neutral-800 transition cursor-pointer"
                      >
                        Comuta pe Romania & Remote
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 border-t border-neutral-200 bg-white flex items-center justify-between shrink-0">
              <span className="text-xs text-neutral-500 font-mono">
                Piata: <strong className="text-neutral-900">{selectedDomain.totalJobs} joburi</strong> ({selectedDomain.juniorJobs} Junior, {selectedDomain.midJobs} Mid, {selectedDomain.seniorJobs} Senior)
              </span>
              <button
                onClick={() => setSelectedDomain(null)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-medium rounded-xl transition cursor-pointer border border-neutral-200"
              >
                Inchide
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
