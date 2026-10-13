import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  SparklesIcon,
  SearchIcon,
  RefreshCwIcon,
  CheckCircle2Icon,
  CheckIcon,
  CalendarIcon,
  ExternalLinkIcon
} from './animated-icons';

import { 
  Brain, 
  Cloud, 
  Server, 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  Layout, 
  Smartphone, 
  Cpu, 
  Headphones, 
  Briefcase, 
  Code, 
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
  Globe, 
  AlertCircle, 
  BookOpen,
  TrendingUp,
  Award,
  Check,
  DollarSign,
  Lightbulb,
  ArrowUpRight,
  Filter,
  ArrowRight,
  Clock,
  Sparkles
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

export default function MarketInsightsPage({ currentUser, onNavigateToJobSearch, onNavigateToSkillRoadmap }) {
  const [levelFilter, setLevelFilter] = useState('JUNIOR'); // JUNIOR, MID, SENIOR, ALL
  const [locationFilter, setLocationFilter] = useState('RO_ONLY'); // RO_ONLY, BUCURESTI, RO_AND_REMOTE, ALL
  const [activeOnly, setActiveOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('OPPORTUNITY'); // OPPORTUNITY, LOW_COMP, VOLUME, NAME
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal stare pentru detalii complete domeniu
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [modalTab, setModalTab] = useState('requirements'); // 'requirements', 'interview', 'roadmap', 'sample_jobs'
  const [modalSkillCategory, setModalSkillCategory] = useState('ALL');

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
      console.error('Eroare la preluarea cerintelor de piata:', err);
      setError('Nu s-au putut incarca cerintele de piata. Te rugam sa reincerci.');
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

  const getCompBadge = (rate) => {
    if (rate >= 60) {
      return {
        label: 'Competitie Redusa',
        color: 'text-emerald-800 bg-emerald-50 border-emerald-200'
      };
    }
    if (rate >= 45) {
      return {
        label: 'Competitie Medie',
        color: 'text-amber-800 bg-amber-50 border-amber-200'
      };
    }
    return {
      label: 'Competitie Mare',
      color: 'text-neutral-800 bg-neutral-100 border-neutral-300'
    };
  };

  const getOpportunityBadge = (score) => {
    if (score >= 75) {
      return {
        label: 'Oportunitate Ridicata',
        badgeClass: 'text-emerald-800 bg-emerald-50 border-emerald-200 font-bold'
      };
    }
    if (score >= 60) {
      return {
        label: 'Oportunitate Buna',
        badgeClass: 'text-neutral-900 bg-neutral-100 border-neutral-300 font-bold'
      };
    }
    return {
      label: 'Oportunitate Moderata',
      badgeClass: 'text-neutral-600 bg-neutral-50 border-neutral-200'
    };
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      
      {/* HERO HEADER */}
      <section className="bg-white border border-neutral-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight leading-tight">
              Radar Piata IT & Analiza Cerintelor
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Analiza continua pe baza a <span className="font-bold text-neutral-950">{data?.totalJobsAnalyzed ? data.totalJobsAnalyzed.toLocaleString() : '8.800+'} pozitii reale din Romania</span>. Compara cerintele oficiale de angajare cu profilul tau pentru a identifica direct oportunitatile optime si pasii de pregatire.
            </p>
          </div>

          <div className="shrink-0 flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <button
              onClick={() => fetchInsights()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition border border-neutral-200/90 cursor-pointer shadow-2xs active:scale-95"
            >
              <RefreshCwIcon size={14} className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizeaza Datele</span>
            </button>
            {onNavigateToJobSearch && (
              <button
                onClick={onNavigateToJobSearch}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-black hover:bg-neutral-800 text-white transition shadow-xs cursor-pointer active:scale-95"
              >
                <SearchIcon size={14} className="w-3.5 h-3.5 text-white" />
                <span>Joburi Live in Cautare</span>
              </button>
            )}
            {onNavigateToSkillRoadmap && (
              <button
                onClick={onNavigateToSkillRoadmap}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white transition shadow-xs cursor-pointer active:scale-95"
              >
                <SparklesIcon size={14} className="w-3.5 h-3.5 text-amber-300" />
                <span>Roadmap Invatare</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* EXECUTIVE STATS RIBBON */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-neutral-200/90 p-4 sm:p-5 rounded-2xl shadow-2xs space-y-1">
          <p className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Total Pozitii Analizate</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tabular-nums">
            {data ? data.totalJobsAnalyzed?.toLocaleString() : '...'}
          </p>
          <p className="text-xs text-neutral-500 font-mono">
            {locationFilter === 'BUCURESTI' ? 'Doar Bucuresti' : locationFilter === 'RO_ONLY' ? 'Toata Romania' : locationFilter === 'RO_AND_REMOTE' ? 'Romania & Remote' : 'Toate Locatiile'}
          </p>
        </div>

        <div className="bg-white border border-neutral-200/90 p-4 sm:p-5 rounded-2xl shadow-2xs space-y-1">
          <p className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Pozitii Debut (Junior & Intern)</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tabular-nums">
            {data ? data.totalJuniorJobs?.toLocaleString() : '...'}
          </p>
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-neutral-900 rounded-full" 
                style={{ width: `${data && data.totalJobsAnalyzed > 0 ? (data.totalJuniorJobs * 100) / data.totalJobsAnalyzed : 25}%` }} 
              />
            </div>
            <span className="text-[11px] text-neutral-500 font-mono font-bold">
              {data && data.totalJobsAnalyzed > 0 ? `${Math.round((data.totalJuniorJobs * 100) / data.totalJobsAnalyzed)}%` : ''}
            </span>
          </div>
        </div>

        <div className="bg-white border border-neutral-200/90 p-4 sm:p-5 rounded-2xl shadow-2xs space-y-1">
          <p className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Competitie Redusa</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tabular-nums">
            {data ? `${data.overallLowCompetitionPct}%` : '...'}
          </p>
          <p className="text-xs text-neutral-500 font-mono">Sub 15 aplicanti / early apply</p>
        </div>

        <div className="bg-white border border-neutral-200/90 p-4 sm:p-5 rounded-2xl shadow-2xs space-y-1">
          <p className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Specializari IT</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tabular-nums">
            {data?.domains ? data.domains.length : '13'}
          </p>
          <p className="text-xs text-neutral-500 font-mono">Domenii tehnice cartografiate</p>
        </div>
      </section>

      {/* REFINED CONTROL CENTER: SENIORITY, LOCATION, SEARCH & SORT */}
      <section className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-4">
        
        {/* ROW 1: LEVEL & LOCATION SELECTORS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4 border-b border-neutral-100">
          
          {/* LEVEL SELECTOR */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-neutral-500 tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-700" />
              Nivel de Experienta
            </span>
            <div className="inline-flex p-1 bg-neutral-100/80 rounded-xl border border-neutral-200/80 w-full overflow-x-auto gap-1">
              {[
                { id: 'JUNIOR', label: 'Junior & Intern' },
                { id: 'MID', label: 'Mid-Level (2-4 ani)' },
                { id: 'SENIOR', label: 'Senior & Lead (5+ ani)' },
                { id: 'ALL', label: 'Toate Nivelurile' }
              ].map(lvl => (
                <button
                  key={lvl.id}
                  onClick={() => setLevelFilter(lvl.id)}
                  className={`flex-1 min-w-[110px] py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center ${
                    levelFilter === lvl.id
                      ? 'bg-black text-white shadow-xs'
                      : 'text-neutral-700 hover:text-black hover:bg-neutral-200/70'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* LOCATION SELECTOR */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-neutral-500 tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-neutral-700" />
              Acoperire Geografica
            </span>
            <div className="flex flex-wrap p-1 bg-neutral-100/80 rounded-xl border border-neutral-200/80 w-full gap-1">
              {[
                { id: 'RO_ONLY', label: 'Toata Romania', icon: MapPin },
                { id: 'BUCURESTI', label: 'Bucuresti', icon: Building2 },
                { id: 'RO_AND_REMOTE', label: 'Romania & Remote', icon: Globe },
                { id: 'ALL', label: 'Toate', icon: Compass }
              ].map(loc => {
                const LocIcon = loc.icon;
                return (
                  <button
                    key={loc.id}
                    onClick={() => setLocationFilter(loc.id)}
                    className={`flex-1 min-w-[110px] py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center flex items-center justify-center gap-1.5 ${
                      locationFilter === loc.id
                        ? 'bg-black text-white shadow-xs'
                        : 'text-neutral-700 hover:text-black hover:bg-neutral-200/70'
                    }`}
                  >
                    <LocIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>{loc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* ROW 2: SEARCH, SORT & ACTIVE FILTER */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1 items-stretch sm:items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <SearchIcon size={15} className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cauta domeniu sau tehnologie (ex: Python, DevOps, React, Embedded)..."
              className="w-full pl-9.5 pr-8 py-2 text-xs rounded-xl bg-neutral-50 border border-neutral-200/90 text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all font-sans"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black cursor-pointer p-1"
                title="Sterge cautarea"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 justify-between sm:justify-end">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 font-mono font-bold whitespace-nowrap">Sortare:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-bold bg-neutral-50 border border-neutral-200/90 rounded-xl px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 cursor-pointer font-sans"
              >
                <option value="OPPORTUNITY">Scor Oportunitate</option>
                <option value="LOW_COMP">Competitie Redusa</option>
                <option value="VOLUME">Cerere (Volum Joburi)</option>
                <option value="NAME">Alfabetic</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs text-neutral-700 font-medium cursor-pointer select-none bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/90 px-3 py-2 rounded-xl transition">
              <input
                type="checkbox"
                checked={activeOnly}
                onChange={(e) => setActiveOnly(e.target.checked)}
                className="rounded border-neutral-300 text-black focus:ring-black h-3.5 w-3.5 cursor-pointer"
              />
              <span>Doar anunturi active acum</span>
            </label>
          </div>
        </div>
      </section>

      {/* CURATED SPOTLIGHT TRACKS */}
      {data && !loading && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* TRACK 1: SWEET SPOTS */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-neutral-400 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-neutral-950" />
                  Raport Optim Cerere / Competitie
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Sweet Spot
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Domeniile cu cel mai bun scor general de oportunitate pentru {levelFilter}.
              </p>
            </div>

            <div className="space-y-2">
              {data.topSweetSpots?.slice(0, 3).map((spot, i) => (
                <div 
                  key={spot.id}
                  onClick={() => { setSelectedDomain(spot); setModalTab('requirements'); }}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-50/80 hover:bg-neutral-100/90 border border-neutral-200/80 transition cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-neutral-950 text-white font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-xs font-bold text-neutral-900 group-hover:text-black transition truncate">
                      {spot.title}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-neutral-950 px-2 py-0.5 rounded-md bg-white border border-neutral-200 shrink-0">
                    {spot.opportunityScore}/100
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* TRACK 2: LOWEST COMPETITION */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-neutral-400 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-950" />
                  Selectie Rapida & Competitie Redusa
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                  Early Apply
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Pondere ridicata de anunturi cu putini candidati inscrisi.
              </p>
            </div>

            <div className="space-y-2">
              {data.lowestCompetition?.slice(0, 3).map((spot, i) => (
                <div 
                  key={spot.id}
                  onClick={() => { setSelectedDomain(spot); setModalTab('requirements'); }}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-50/80 hover:bg-neutral-100/90 border border-neutral-200/80 transition cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-neutral-950 text-white font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-xs font-bold text-neutral-900 group-hover:text-black transition truncate">
                      {spot.title}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-neutral-950 px-2 py-0.5 rounded-md bg-white border border-neutral-200 shrink-0">
                    {spot.lowCompetitionRate}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* TRACK 3: MOST IN-DEMAND */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-neutral-400 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-neutral-950" />
                  Volum Maxim de Anunturi
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 border border-neutral-300">
                  Cerere Maxima
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Specializarile cu cel mai mare numar de roluri deschise activ.
              </p>
            </div>

            <div className="space-y-2">
              {data.mostInDemand?.slice(0, 3).map((spot, i) => (
                <div 
                  key={spot.id}
                  onClick={() => { setSelectedDomain(spot); setModalTab('requirements'); }}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-50/80 hover:bg-neutral-100/90 border border-neutral-200/80 transition cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-neutral-950 text-white font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-xs font-bold text-neutral-900 group-hover:text-black transition truncate">
                      {spot.title}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-neutral-950 px-2 py-0.5 rounded-md bg-white border border-neutral-200 shrink-0">
                    {spot.levelJobCount} joburi
                  </span>
                </div>
              ))}
            </div>
          </div>

        </section>
      )}

      {/* UNIVERSAL TOP SKILLS RADAR (ROMANIAN IT MARKET OVERALL) */}
      {data?.universalTopSkills && data.universalTopSkills.length > 0 && (
        <section className="bg-white border border-neutral-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-950 flex items-center gap-2 tracking-tight">
                <BarChart3 className="w-4 h-4 text-neutral-950" />
                Competente Universale Cerute in Romania
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Tehnologiile cu cea mai frecventa aparitie in fisele de post pentru {levelFilter === 'JUNIOR' ? 'Junior' : levelFilter === 'MID' ? 'Mid-Level' : levelFilter === 'SENIOR' ? 'Senior' : 'toate nivelurile'}.
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-500 self-start sm:self-center">
              Top {data.universalTopSkills.length} cerinte transversale
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {data.universalTopSkills.slice(0, 16).map((sk) => (
              <div
                key={sk.skill}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-neutral-200/90 bg-neutral-50/70 hover:bg-neutral-100 transition shadow-2xs"
              >
                <div className="flex items-center gap-1.5">
                  {sk.userHasSkill ? (
                    <CheckCircle2Icon size={13} className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0" />
                  )}
                  <span className="text-xs font-bold text-neutral-900 font-sans">{sk.skill}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-neutral-600 bg-white border border-neutral-200/80 px-1.5 py-0.5 rounded">
                  {sk.percentage}%
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* DOMAIN CARDS GRID (13 SPECIALIZATIONS) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-950 flex items-center gap-2 tracking-tight">
              <Code className="w-4 h-4 text-neutral-950" />
              Specializari Tehnice & Fise de Cerinte ({filteredDomains.length})
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Selecteaza un domeniu pentru a vizualiza profilul complet: cerinte, bilant CV, format interviu, roadmap si pozitii active.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs font-mono font-bold text-neutral-800 bg-neutral-100 px-3 py-1 rounded-xl border border-neutral-200/90">
              {locationFilter === 'BUCURESTI' ? 'Bucuresti' : locationFilter === 'RO_ONLY' ? 'Toata Romania' : locationFilter === 'RO_AND_REMOTE' ? 'Romania & Remote' : 'Toate'}
            </span>
            <span className="text-xs font-mono font-bold text-neutral-800 bg-neutral-100 px-3 py-1 rounded-xl border border-neutral-200/90">
              {levelFilter}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center bg-white border border-neutral-200/90 rounded-2xl shadow-2xs space-y-3">
            <RefreshCwIcon size={28} className="w-7 h-7 text-neutral-950 animate-spin mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-neutral-900">Se actualizeaza parametrii pietei IT...</p>
              <p className="text-xs text-neutral-500">Calculare statistici de competitie, cerere si potrivire cerinte.</p>
            </div>
          </div>
        ) : filteredDomains.length === 0 ? (
          <div className="py-16 text-center bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-2xs space-y-3">
            <Info className="w-8 h-8 text-neutral-400 mx-auto" />
            <p className="text-sm font-bold text-neutral-900">Nu a fost gasita nicio specializare conform filtrelor alese.</p>
            <button
              onClick={() => { setSearchQuery(''); setLevelFilter('JUNIOR'); setLocationFilter('RO_ONLY'); setActiveOnly(false); }}
              className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Reseteaza Filtrele
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDomains.map((domain) => {
              const IconComp = DOMAIN_ICONS[domain.id] || Code;
              const compInfo = getCompBadge(domain.lowCompetitionRate);
              const oppInfo = getOpportunityBadge(domain.opportunityScore);

              return (
                <div
                  key={domain.id}
                  onClick={() => { setSelectedDomain(domain); setModalTab('requirements'); }}
                  className="bg-white border border-neutral-200/90 hover:border-neutral-950 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-3.5">
                    
                    {/* TOP LINE: ICON & HEADER */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-neutral-100 border border-neutral-200/90 flex items-center justify-center text-neutral-900 group-hover:bg-neutral-950 group-hover:text-white transition-colors shrink-0 shadow-2xs">
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-neutral-950 text-base leading-tight group-hover:text-neutral-900 transition truncate tracking-tight">
                            {domain.title}
                          </h3>
                          <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1 font-mono">
                            {domain.tagLine}
                          </p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md border shrink-0 ${oppInfo.badgeClass}`}>
                        {domain.opportunityScore}/100
                      </span>
                    </div>

                    {/* METRICS SPLIT: JOBS, COMPETITION, SALARY */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-neutral-100 text-center">
                      <div className="bg-neutral-50/70 rounded-xl p-2 border border-neutral-200/70">
                        <p className="text-[10px] text-neutral-500 font-mono font-bold uppercase">Pozitii</p>
                        <p className="text-sm font-extrabold text-neutral-950 mt-0.5 tabular-nums">
                          {domain.levelJobCount}
                        </p>
                      </div>

                      <div className="bg-neutral-50/70 rounded-xl p-2 border border-neutral-200/70">
                        <p className="text-[10px] text-neutral-500 font-mono font-bold uppercase">Competitie</p>
                        <p className={`text-[10px] font-bold mt-1 px-1.5 py-0.5 rounded-md inline-block border ${compInfo.color}`}>
                          {compInfo.label}
                        </p>
                      </div>

                      <div className="bg-neutral-50/70 rounded-xl p-2 border border-neutral-200/70">
                        <p className="text-[10px] text-neutral-500 font-mono font-bold uppercase">Salariu</p>
                        <p className="text-[10px] font-mono font-bold text-neutral-900 mt-1 truncate" title={domain.salaryEstimate || 'Conform pietei'}>
                          {domain.salaryEstimate || 'Piata IT'}
                        </p>
                      </div>
                    </div>

                    {/* JUNIOR SKILL MATCH INDICATOR */}
                    {domain.topSkills && domain.topSkills.length > 0 && (
                      <div className="bg-neutral-50/70 border border-neutral-200/80 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                            <CheckCircle2Icon size={13} className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Potrivire Profil CV:</span>
                          </span>
                          {domain.userMatchScore > 0 ? (
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                              domain.userMatchScore >= 70 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                              domain.userMatchScore >= 40 ? 'bg-blue-50 text-blue-800 border-blue-200' :
                              'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                              {domain.userMatchScore}% Match
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono font-medium text-neutral-500">
                              {domain.userMatchingSkills?.length || 0} din {domain.topSkills.length} cerinte
                            </span>
                          )}
                        </div>

                        {/* SKILL CHIPS */}
                        <div className="flex flex-wrap gap-1.5">
                          {domain.topSkills.slice(0, 5).map((sk) => (
                            <span 
                              key={sk.skill}
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-md border flex items-center gap-1 font-sans ${
                                sk.userHasSkill 
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200 font-bold' 
                                  : 'bg-white text-neutral-700 border-neutral-200/90'
                              }`}
                              title={sk.userHasSkill ? `${sk.skill}: Detectat in profil` : `${sk.skill}: De adaugat`}
                            >
                              {sk.userHasSkill ? (
                                <CheckIcon size={10} className="w-2.5 h-2.5 text-emerald-700 shrink-0" />
                              ) : (
                                <span className="w-1 h-1 rounded-full bg-neutral-300 inline-block shrink-0" />
                              )}
                              <span>{sk.skill}</span>
                            </span>
                          ))}
                          {domain.topSkills.length > 5 && (
                            <span className="text-[10px] font-mono font-medium text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded-md border border-neutral-200/80">
                              +{domain.topSkills.length - 5}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* SENIORITY SPREAD MINI-BAR (CALIBRATED NEUTRAL PALETTE) */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[10px] text-neutral-500 font-mono font-medium">
                        <span>Junior ({domain.juniorJobs})</span>
                        <span>Mid ({domain.midJobs})</span>
                        <span>Senior ({domain.seniorJobs})</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden flex">
                        <div 
                          className="bg-neutral-900 h-full" 
                          style={{ width: `${domain.totalJobs > 0 ? (domain.juniorJobs / domain.totalJobs) * 100 : 0}%` }}
                          title={`Junior: ${domain.juniorJobs}`}
                        />
                        <div 
                          className="bg-neutral-500 h-full" 
                          style={{ width: `${domain.totalJobs > 0 ? (domain.midJobs / domain.totalJobs) * 100 : 0}%` }}
                          title={`Mid: ${domain.midJobs}`}
                        />
                        <div 
                          className="bg-neutral-300 h-full" 
                          style={{ width: `${domain.totalJobs > 0 ? (domain.seniorJobs / domain.totalJobs) * 100 : 0}%` }}
                          title={`Senior: ${domain.seniorJobs}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM ACTION BUTTON */}
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-neutral-900 group-hover:text-black transition">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-neutral-800" />
                      <span>Exploreaza Cerinte & Roadmap</span>
                    </span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition text-neutral-400 group-hover:text-black" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* COMPREHENSIVE DOMAIN DETAIL DOSSIER (MORPHING MODAL) */}
      {selectedDomain && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setSelectedDomain(null)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-morphing-backdrop"
        >
          <div 
            className="bg-white rounded-2xl border border-neutral-300 w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-morphing-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="p-5 sm:p-6 border-b border-neutral-200/90 flex items-start justify-between bg-white shrink-0">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-neutral-950 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  {(() => {
                    const IconComp = DOMAIN_ICONS[selectedDomain.id] || Code;
                    return <IconComp className="w-6 h-6 text-white" />;
                  })()}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-extrabold text-neutral-950 tracking-tight leading-snug">
                      {selectedDomain.title}
                    </h2>
                    <span className="font-mono text-xs uppercase px-2.5 py-0.5 rounded-md border border-neutral-300 bg-neutral-100 text-neutral-900 font-bold">
                      {selectedDomain.opportunityBadge || 'Oportunitate IT'}
                    </span>
                    {selectedDomain.salaryEstimate && (
                      <span className="font-mono text-xs px-2.5 py-0.5 rounded-md border border-neutral-200 bg-neutral-50 text-neutral-700">
                        {selectedDomain.salaryEstimate}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl font-sans">
                    {selectedDomain.tagLine}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDomain(null)}
                className="p-2 rounded-xl text-neutral-400 hover:text-black hover:bg-neutral-100 transition cursor-pointer animate-morphing-close shrink-0"
                title="Inchide fereastra (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MODAL NAVIGATION TABS */}
            <div className="px-5 sm:px-6 border-b border-neutral-200/90 bg-neutral-50/70 flex gap-2 shrink-0 overflow-x-auto">
              {[
                { id: 'requirements', label: 'Cerinte & Match CV', icon: CheckCircle2 },
                { id: 'interview', label: 'Interviu & Senioritate', icon: Zap },
                { id: 'roadmap', label: 'Roadmap Pregatire', icon: Target },
                { id: 'sample_jobs', label: `Joburi Deschise (${selectedDomain.sampleJobs?.length || 0})`, icon: Briefcase }
              ].map(tab => {
                const TabIcon = tab.icon;
                const isActive = modalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setModalTab(tab.id)}
                    className={`py-3 px-3.5 text-xs font-bold border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                      isActive
                        ? 'border-neutral-950 text-neutral-950 bg-white'
                        : 'border-transparent text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100/50'
                    }`}
                  >
                    <TabIcon className="w-4 h-4 shrink-0 text-neutral-700" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* MODAL CONTENT BODY */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-white animate-morphing-content">
              
              {/* TAB 1: REQUIREMENTS & CV MATCH */}
              {modalTab === 'requirements' && (
                <div className="space-y-5">
                  
                  {/* CV MATCH BILATERAL BREAKDOWN */}
                  <div className="bg-white border border-neutral-200/90 p-5 rounded-2xl shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                      <div>
                        <h3 className="text-sm font-bold text-neutral-950 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-neutral-950" />
                          <span>Bilantul Competentelor Tale pentru {selectedDomain.title}</span>
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Comparatie directa intre cerintele rolurilor de {levelFilter} si CV-ul tau activ.
                        </p>
                      </div>
                      {selectedDomain.userMatchScore > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-500 font-medium font-mono">Grad Potrivire:</span>
                          <span className="font-mono text-xs font-bold px-3 py-1 rounded-md border border-neutral-300 bg-neutral-100 text-neutral-950">
                            {selectedDomain.userMatchScore}% Match
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* COLUMN 1: WHAT YOU HAVE */}
                      <div className="bg-neutral-50/70 border border-neutral-200/80 p-4 rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                            <CheckCircle2Icon size={14} className="w-3.5 h-3.5 text-emerald-700" />
                            <span>In CV-ul Tau ({selectedDomain.userMatchingSkills?.length || 0})</span>
                          </span>
                          <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded">
                            Validat
                          </span>
                        </div>

                        {selectedDomain.userMatchingSkills && selectedDomain.userMatchingSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {selectedDomain.userMatchingSkills.map((sk) => (
                              <span 
                                key={sk} 
                                className="px-2.5 py-1 rounded-md text-xs font-medium bg-white text-neutral-900 border border-neutral-200 flex items-center gap-1.5 font-mono shadow-2xs"
                              >
                                <CheckIcon size={11} className="w-3 h-3 text-emerald-700 shrink-0" />
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
                      <div className="bg-neutral-50/70 border border-neutral-200/80 p-4 rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                            <AlertCircle className="w-3.5 h-3.5 text-neutral-700" />
                            <span>De Dobandit / Adaugat ({selectedDomain.userMissingSkills?.length || 0})</span>
                          </span>
                          <span className="text-[10px] font-mono font-bold text-neutral-700 bg-neutral-200 px-2 py-0.5 rounded">
                            Prioritate
                          </span>
                        </div>

                        {selectedDomain.userMissingSkills && selectedDomain.userMissingSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {selectedDomain.userMissingSkills.map((sk) => (
                              <span 
                                key={sk} 
                                className="px-2.5 py-1 rounded-md text-xs font-medium bg-white text-neutral-800 border border-neutral-200 flex items-center gap-1.5 font-mono shadow-2xs"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0" />
                                <span>{sk}</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-neutral-900 font-medium pt-1">
                            Excelent! Detii toate cerintele principale detectate in anunturile de angajare.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* COMPLETE SKILLS FREQUENCY GRID */}
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="text-xs font-bold uppercase text-neutral-600 tracking-wider flex items-center gap-2 font-mono">
                        <BarChart3 className="w-4 h-4 text-neutral-900" />
                        <span>Frecventa Tehnologiilor in Job Description-uri ({levelFilter})</span>
                      </h4>
                      <span className="text-[11px] text-neutral-500 font-mono">
                        {selectedDomain.topSkills?.length || 0} tehnologii identificate
                      </span>
                    </div>

                    {/* CATEGORY PILLS */}
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
                              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 border ${
                                active
                                  ? 'bg-neutral-950 text-white border-neutral-950 font-bold'
                                  : 'bg-white hover:bg-neutral-100 text-neutral-700 border-neutral-200/90'
                              }`}
                            >
                              <span>{cat.label}</span>
                              <span className={`text-[10px] px-1 rounded ${active ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-600'}`}>
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
                            className={`p-3 rounded-xl border flex flex-col justify-between transition shadow-2xs ${
                              sk.userHasSkill 
                                ? 'bg-neutral-50/80 border-neutral-300' 
                                : 'bg-white border-neutral-200/90'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-xs font-bold text-neutral-900 gap-1 font-mono">
                                <span className="truncate" title={sk.skill}>{sk.skill}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded inline-flex items-center gap-1 ${
                                  sk.userHasSkill 
                                    ? 'bg-neutral-950 text-white' 
                                    : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                                }`}>
                                  {sk.userHasSkill ? (
                                    <>
                                      <CheckIcon size={10} className="w-2.5 h-2.5 text-white" />
                                      <span>In CV</span>
                                    </>
                                  ) : (
                                    <span>De invatat</span>
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                                <span>{sk.category || 'General'}</span>
                                <span className="font-bold text-neutral-950">{sk.percentage}% din anunturi</span>
                              </div>
                            </div>
                            <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden mt-2.5">
                              <div 
                                className="h-full rounded-full bg-neutral-950" 
                                style={{ width: `${Math.min(100, Math.max(8, sk.percentage))}%` }} 
                              />
                            </div>
                            <span className="text-[10px] text-neutral-400 mt-1 font-mono">{sk.count} pozitii</span>
                          </div>
                      ))}
                    </div>
                  </div>

                  {/* STRUCTURED REQUIREMENTS CATEGORIES */}
                  {selectedDomain.requirementsChecklist && selectedDomain.requirementsChecklist.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedDomain.requirementsChecklist.map((cat, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-3">
                          <div className="flex items-center gap-2 text-sm font-bold text-neutral-950">
                            <CheckCircle2 className="w-4 h-4 text-neutral-900" />
                            <h4>{cat.categoryName}</h4>
                          </div>
                          <ul className="space-y-2">
                            {cat.items?.map((item, itemIdx) => (
                              <li key={itemIdx} className="text-xs text-neutral-700 flex items-start gap-2 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 shrink-0 mt-1.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: INTERVIEW PROCESS & SENIORITY EXPECTATIONS */}
              {modalTab === 'interview' && (
                <div className="space-y-5">
                  
                  {/* INTERVIEW FORMAT IN ROMANIA */}
                  {selectedDomain.interviewFormat && (
                    <div className="bg-neutral-50/70 border border-neutral-200/90 p-5 rounded-2xl shadow-2xs space-y-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-neutral-950" />
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900">
                          Formatul Tipic al Procesului de Recrutare Tehnic in Romania
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-sans">
                        {selectedDomain.interviewFormat}
                      </p>
                    </div>
                  )}

                  {/* SENIORITY EXPECTATIONS COMPARISON */}
                  {selectedDomain.seniorityComparison && (
                    <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-neutral-950 flex items-center gap-2">
                          <SlidersHorizontal className="w-4 h-4 text-neutral-950" />
                          <span>Ghid de Asteptari pe Niveluri de Senioritate</span>
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Ce diferentiaza un Junior de un Mid sau Senior la evaluarea tehnica pentru {selectedDomain.title}.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                        
                        {/* JUNIOR FOCUS */}
                        <div className="bg-neutral-50/70 border border-neutral-200/80 p-4 rounded-xl space-y-2.5">
                          <div className="flex items-center justify-between pb-1 border-b border-neutral-200/60">
                            <span className="text-xs font-mono font-bold uppercase text-neutral-950">Junior & Intern</span>
                            <span className="text-[10px] font-mono text-neutral-500">0 - 2 ani</span>
                          </div>
                          <ul className="space-y-2 text-xs text-neutral-700">
                            {(selectedDomain.seniorityComparison.juniorFocus || [
                              'Fundamente algoritmice solide',
                              'Scriere cod curat si respectare conventii',
                              'Lucru fluent cu Git si Pull Requests',
                              'Curiozitate si proiecte practice pe GitHub'
                            ]).map((item, i) => (
                              <li key={i} className="flex items-start gap-2 leading-relaxed">
                                <CheckIcon size={12} className="w-3.5 h-3.5 text-neutral-950 shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* MID FOCUS */}
                        <div className="bg-neutral-50/70 border border-neutral-200/80 p-4 rounded-xl space-y-2.5">
                          <div className="flex items-center justify-between pb-1 border-b border-neutral-200/60">
                            <span className="text-xs font-mono font-bold uppercase text-neutral-950">Mid-Level</span>
                            <span className="text-[10px] font-mono text-neutral-500">2 - 5 ani</span>
                          </div>
                          <ul className="space-y-2 text-xs text-neutral-700">
                            {(selectedDomain.seniorityComparison.midFocus || [
                              'Autonomie in livrarea modulelor complete',
                              'Design modular si alegere de structuri optime',
                              'Testare automata integrata (unit/integration)',
                              'Intelegerea constrangerilor de performanta'
                            ]).map((item, i) => (
                              <li key={i} className="flex items-start gap-2 leading-relaxed">
                                <CheckIcon size={12} className="w-3.5 h-3.5 text-neutral-950 shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* SENIOR FOCUS */}
                        <div className="bg-neutral-50/70 border border-neutral-200/80 p-4 rounded-xl space-y-2.5">
                          <div className="flex items-center justify-between pb-1 border-b border-neutral-200/60">
                            <span className="text-xs font-mono font-bold uppercase text-neutral-950">Senior & Lead</span>
                            <span className="text-[10px] font-mono text-neutral-500">5+ ani</span>
                          </div>
                          <ul className="space-y-2 text-xs text-neutral-700">
                            {(selectedDomain.seniorityComparison.seniorFocus || [
                              'Arhitectura de sistem si analiza trade-offs',
                              'Identificare si rezolvare bottlenecks majore',
                              'Definire standarde tehnice si code review',
                              'Mentorat tehnic si ghidare de echipa'
                            ]).map((item, i) => (
                              <li key={i} className="flex items-start gap-2 leading-relaxed">
                                <CheckIcon size={12} className="w-3.5 h-3.5 text-neutral-950 shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 3: STEP-BY-STEP ROADMAP */}
              {modalTab === 'roadmap' && (
                <div className="space-y-5">
                  <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-neutral-950 flex items-center gap-2">
                          <Target className="w-4 h-4 text-neutral-950" />
                          <span>Plan de Pregatire Recomandat pentru {selectedDomain.title}</span>
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Etape structurate pentru acoperirea cerintelor obligatorii de angajare.
                        </p>
                      </div>

                      {onNavigateToSkillRoadmap && (
                        <button
                          onClick={() => {
                            setSelectedDomain(null);
                            onNavigateToSkillRoadmap();
                          }}
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold transition cursor-pointer shadow-xs active:scale-95"
                        >
                          <SparklesIcon size={14} className="w-3.5 h-3.5 text-amber-300" />
                          <span>Deschide Studio-ul de Roadmap</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-3 pt-2">
                      {(selectedDomain.preparationRoadmap || [
                        { stageNumber: 1, stageTitle: 'Fundamente Teoretice & Limbaj de Baza', durationEst: '1 - 1.5 Luni', keyMilestones: ['Stapanire sintaxa si paradigme de programare', 'Structuri de date esentiale si analiza complexitatii', 'Probleme de logica pe platforme tehnice'] },
                        { stageNumber: 2, stageTitle: 'Baze de Date, SQL & Versionare Git', durationEst: '1 Luna', keyMilestones: ['Interogari SQL si modelare relationala', 'Workflow profesional Git (Branches, PRs, Rebase)', 'Concepte arhitecturale fundamentale'] },
                        { stageNumber: 3, stageTitle: 'Dezvoltare de Proiecte Practice End-to-End', durationEst: '1.5 Luni', keyMilestones: ['Implementare API RESTful complet', 'Teste automate si containerizare Docker', 'Documentatie README profesionala'] },
                        { stageNumber: 4, stageTitle: 'Pregatire Interviu Tehnic & Portofoliu', durationEst: '1 Luna', keyMilestones: ['Simulari de interviu algoritmic sub timp', 'Exersare scenarii de System Design de baza', 'Optimizare CV tehnic si profil LinkedIn'] }
                      ]).map((stage) => (
                        <div 
                          key={stage.stageNumber}
                          className="p-4 rounded-xl border border-neutral-200/90 bg-neutral-50/70 hover:bg-white transition space-y-2.5 shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-lg bg-neutral-950 text-white font-mono font-bold text-xs flex items-center justify-center">
                                {stage.stageNumber}
                              </span>
                              <h4 className="font-bold text-xs sm:text-sm text-neutral-950 font-sans">
                                {stage.stageTitle}
                              </h4>
                            </div>
                            <span className="text-[11px] font-mono text-neutral-600 font-bold px-2 py-0.5 rounded bg-white border border-neutral-200">
                              {stage.durationEst}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pl-8.5">
                            {stage.keyMilestones?.map((ms, msIdx) => (
                              <span 
                                key={msIdx} 
                                className="text-xs text-neutral-700 bg-white border border-neutral-200/80 px-2.5 py-1 rounded-md flex items-center gap-1.5 font-mono"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0" />
                                <span>{ms}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SAMPLE ACTIVE JOBS */}
              {modalTab === 'sample_jobs' && (
                <div className="space-y-4">
                  
                  {/* DIRECT SEARCH BANNER */}
                  <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-950 uppercase tracking-wider flex items-center gap-2 font-mono">
                        <Building2 className="w-4 h-4 text-neutral-950" />
                        <span>Pozitii Reale Verificate ({locationFilter === 'BUCURESTI' ? 'Bucuresti' : locationFilter === 'RO_ONLY' ? 'Romania' : locationFilter === 'RO_AND_REMOTE' ? 'Romania & Remote' : 'Toate'})</span>
                      </h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Fiecare pozitie provine de la un angajator verificat activ pe piata.
                      </p>
                    </div>

                    {onNavigateToJobSearch && (
                      <button
                        onClick={() => {
                          setSelectedDomain(null);
                          onNavigateToJobSearch();
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold transition cursor-pointer shadow-xs active:scale-95"
                      >
                        <SearchIcon size={14} className="w-3.5 h-3.5 text-white" />
                        <span>Cauta in toate joburile</span>
                      </button>
                    )}
                  </div>

                  {selectedDomain.sampleJobs && selectedDomain.sampleJobs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {selectedDomain.sampleJobs.map((job) => (
                        <div 
                          key={job.id} 
                          className="bg-white p-4.5 rounded-2xl border border-neutral-200/90 hover:border-neutral-950 transition flex flex-col justify-between text-neutral-900 shadow-2xs space-y-3"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 truncate font-mono">
                                {job.companyName}
                              </span>
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-neutral-200 bg-neutral-100 text-neutral-800">
                                {job.sourcePlatform}
                              </span>
                            </div>

                            <h4 className="font-bold text-sm text-neutral-950 leading-snug line-clamp-2" title={job.jobTitle}>
                              {job.jobTitle}
                            </h4>

                            <div className="flex items-center gap-1.5 text-[11px] text-neutral-600 flex-wrap pt-0.5 font-mono">
                              <span className="inline-flex items-center gap-1 bg-neutral-100 border border-neutral-200/90 px-2 py-0.5 rounded-md">
                                <MapPin className="w-3 h-3 text-neutral-500" />
                                <span>{job.location || 'Romania'}</span>
                              </span>
                              <span className="inline-flex items-center gap-1 bg-neutral-100 border border-neutral-200/90 px-2 py-0.5 rounded-md">
                                <Briefcase className="w-3 h-3 text-neutral-500" />
                                <span>{job.workModel || 'Hibrid'}</span>
                              </span>
                              <span className="inline-flex items-center gap-1 font-bold text-neutral-950 bg-neutral-100 border border-neutral-300 px-2 py-0.5 rounded-md">
                                <span>{job.experienceLevel || 'JUNIOR'}</span>
                              </span>
                            </div>

                            {job.salaryRange && (
                              <p className="text-[11px] font-mono text-neutral-500 pt-0.5">
                                {job.salaryRange}
                              </p>
                            )}
                          </div>

                          {job.directApplyUrl && (
                            <div className="pt-2.5 border-t border-neutral-100">
                              <a
                                href={job.directApplyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold transition cursor-pointer shadow-xs active:scale-95"
                              >
                                <ExternalLinkIcon size={13} className="w-3.5 h-3.5 text-white" />
                                <span>Aplica Oficial pe {job.sourcePlatform}</span>
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-white border border-neutral-200/90 rounded-2xl space-y-3 shadow-2xs">
                      <p className="text-xs text-neutral-600">
                        Nu au fost identificate exemple directe pentru filtrul selectat.
                      </p>
                      <button
                        onClick={() => setLocationFilter('RO_AND_REMOTE')}
                        className="px-4 py-2 bg-neutral-950 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition cursor-pointer"
                      >
                        Comuta pe Romania & Remote
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 sm:p-5 border-t border-neutral-200/90 bg-white flex items-center justify-between shrink-0">
              <span className="text-xs text-neutral-500 font-mono">
                Volum total: <strong className="text-neutral-950">{selectedDomain.totalJobs} pozitii</strong> ({selectedDomain.juniorJobs} Junior, {selectedDomain.midJobs} Mid, {selectedDomain.seniorJobs} Senior)
              </span>
              <button
                onClick={() => setSelectedDomain(null)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold rounded-xl transition cursor-pointer border border-neutral-200/90 shadow-2xs active:scale-95"
              >
                Inchide Fereastra
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
