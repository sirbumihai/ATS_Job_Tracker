import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  Search, 
  Filter, 
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
  Sparkles, 
  CheckCircle2, 
  GraduationCap, 
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
  ArrowRight,
  BookOpen,
  Award,
  Calendar,
  Check,
  Building2,
  MapPin,
  RefreshCw,
  Banknote,
  Globe,
  CheckSquare
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
  const [locationFilter, setLocationFilter] = useState('RO_ONLY'); // RO_ONLY, RO_AND_REMOTE, ALL
  const [activeOnly, setActiveOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('OPPORTUNITY'); // OPPORTUNITY, LOW_COMP, VOLUME, NAME
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal stare pentru detalii domeniu ("Ce se cere")
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [modalTab, setModalTab] = useState('requirements'); // 'requirements', 'comparison', 'roadmap', 'sample_jobs'

  // Filtrare pe categorii de tehnologii (Limbaje, Frameworks, Cloud, Baze de Date etc.)
  const [universalSkillCategory, setUniversalSkillCategory] = useState('ALL');
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
      const res = await fetch(`/api/v1/market-insights?level=${level}&location=${location}&activeOnly=${active}`, {
        headers
      });
      if (!res.ok) {
        throw new Error(`Eroare server: ${res.status}`);
      }
      const json = await res.json();
      setData(json);
      // Daca un domeniu era deja selectat in modal, actualizam si datele lui
      if (selectedDomain) {
        const updated = json.domains?.find(d => d.id === selectedDomain.id);
        if (updated) setSelectedDomain(updated);
      }
    } catch (err) {
      console.error("Eroare la preluarea statisticilor pietei:", err);
      setError("Nu s-au putut încărca datele analitice de piață. Te rugăm să reîncerci.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights(levelFilter, locationFilter, activeOnly);
  }, [levelFilter, locationFilter, activeOnly]);

  // Lock scroll cand modalul este deschis
  useEffect(() => {
    if (selectedDomain) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
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
        label: 'Competiție Redusă',
        color: 'text-emerald-700 bg-emerald-100/70 border-emerald-300'
      };
    }
    if (rate >= 45) {
      return {
        label: 'Competiție Medie',
        color: 'text-amber-700 bg-amber-100/70 border-amber-300'
      };
    }
    return {
      label: 'Competiție Mare',
      color: 'text-rose-700 bg-rose-100/70 border-rose-300'
    };
  };

  return (
    <div className="space-y-8 pb-16 font-sans">
      
      {/* HERO HEADER */}
      <section className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-gradient-to-bl from-blue-50 via-indigo-50/40 to-transparent rounded-full pointer-events-none blur-2xl"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-blue-50 text-blue-700 border border-blue-200">
              <Compass className="w-3.5 h-3.5" />
              Radar Piață IT & Ghid Oportunități 2026
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-gray-950 tracking-tight leading-tight">
              Unde Sunt Joburile IT & Unde Ai <span className="text-blue-600 underline decoration-blue-200 decoration-wavy">Cea Mai Mică Competiție</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Analiză pe baza a <span className="font-bold text-gray-950">{data?.totalJobsAnalyzed ? data.totalJobsAnalyzed.toLocaleString() : '8.800+'} de poziții IT reale</span>. Descoperă ce se cere în descrierile oficiale ale rolurilor, unde numărul de candidați este redus și companiile găsesc greu oameni, precum și salariile medii nete în România.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            <button
              onClick={() => fetchInsights()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 transition border border-gray-200 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Actualizează Datele
            </button>
            {onNavigateToJobSearch && (
              <button
                onClick={onNavigateToJobSearch}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white transition shadow-sm cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-blue-400" />
                Vezi Joburile Live în Căutare
              </button>
            )}
          </div>
        </div>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-100">
          <div className="bg-gray-50/80 border border-gray-200/70 p-4 rounded-2xl">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Poziții Analizate</p>
            <p className="text-xl sm:text-2xl font-black text-gray-950 mt-1">
              {data ? data.totalJobsAnalyzed?.toLocaleString() : '...'}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              {locationFilter === 'RO_ONLY' ? 'Doar Piața România' : locationFilter === 'RO_AND_REMOTE' ? 'România & Remote' : 'România + Europa'}
            </p>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200/70 p-4 rounded-2xl">
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Poziții Junior & Intern</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-950 mt-1">
              {data ? data.totalJuniorJobs?.toLocaleString() : '...'}
            </p>
            <p className="text-[11px] text-emerald-700 mt-1">
              {data && data.totalJobsAnalyzed > 0 ? `${Math.round((data.totalJuniorJobs * 100) / data.totalJobsAnalyzed)}% din poziții` : 'Oportunități debut'}
            </p>
          </div>

          <div className="bg-blue-50/60 border border-blue-200/70 p-4 rounded-2xl">
            <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Competiție Redusă</p>
            <p className="text-xl sm:text-2xl font-black text-blue-950 mt-1">
              {data ? `${data.overallLowCompetitionPct}%` : '...'}
            </p>
            <p className="text-[11px] text-blue-700 mt-1">Sub 10-25 aplicanți / early apply</p>
          </div>

          <div className="bg-purple-50/60 border border-purple-200/70 p-4 rounded-2xl">
            <p className="text-xs font-semibold text-purple-800 uppercase tracking-wider">Specializări IT</p>
            <p className="text-xl sm:text-2xl font-black text-purple-950 mt-1">
              {data?.domains ? data.domains.length : '13'}
            </p>
            <p className="text-[11px] text-purple-700 mt-1">Domenii tehnice distincte</p>
          </div>
        </div>
      </section>

      {/* DUAL SELECTOR BAR: SENIORITY + LOCATION (ROMANIA FILTER) */}
      <section className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-4">
        
        {/* ROW 1: SENIORITY & LOCATION PILLS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-2 border-b border-gray-100">
          
          {/* SENIORITY CONTROL */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              1. Nivel de Experiență:
            </label>
            <div className="inline-flex p-1 bg-gray-100 rounded-xl border border-gray-200 w-full overflow-x-auto">
              <button
                onClick={() => setLevelFilter('JUNIOR')}
                className={`flex-1 min-w-[120px] py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center ${
                  levelFilter === 'JUNIOR'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-gray-700 hover:text-black hover:bg-gray-200/60'
                }`}
              >
                Junior & Intern
              </button>
              <button
                onClick={() => setLevelFilter('MID')}
                className={`flex-1 min-w-[110px] py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center ${
                  levelFilter === 'MID'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-gray-700 hover:text-black hover:bg-gray-200/60'
                }`}
              >
                Mid-Level (2-4 ani)
              </button>
              <button
                onClick={() => setLevelFilter('SENIOR')}
                className={`flex-1 min-w-[120px] py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center ${
                  levelFilter === 'SENIOR'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-gray-700 hover:text-black hover:bg-gray-200/60'
                }`}
              >
                Senior & Lead (5+)
              </button>
              <button
                onClick={() => setLevelFilter('ALL')}
                className={`flex-1 min-w-[90px] py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center ${
                  levelFilter === 'ALL'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-gray-700 hover:text-black hover:bg-gray-200/60'
                }`}
              >
                Toate
              </button>
            </div>
          </div>

          {/* LOCATION FILTER (ROMANIA TOGGLE) */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              2. Filtru Geografic (Locație):
            </label>
            <div className="inline-flex p-1 bg-gray-100 rounded-xl border border-gray-200 w-full overflow-x-auto">
              <button
                onClick={() => setLocationFilter('RO_ONLY')}
                className={`flex-1 min-w-[130px] py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center flex items-center justify-center gap-1.5 ${
                  locationFilter === 'RO_ONLY'
                    ? 'bg-blue-600 text-white shadow-xs font-black'
                    : 'text-gray-700 hover:text-black hover:bg-gray-200/60'
                }`}
              >
                <span>🇷🇴 Doar România</span>
              </button>
              <button
                onClick={() => setLocationFilter('RO_AND_REMOTE')}
                className={`flex-1 min-w-[140px] py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center flex items-center justify-center gap-1.5 ${
                  locationFilter === 'RO_AND_REMOTE'
                    ? 'bg-blue-600 text-white shadow-xs font-black'
                    : 'text-gray-700 hover:text-black hover:bg-gray-200/60'
                }`}
              >
                <span>🏠 România & Remote</span>
              </button>
              <button
                onClick={() => setLocationFilter('ALL')}
                className={`flex-1 min-w-[140px] py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center flex items-center justify-center gap-1.5 ${
                  locationFilter === 'ALL'
                    ? 'bg-blue-600 text-white shadow-xs font-black'
                    : 'text-gray-700 hover:text-black hover:bg-gray-200/60'
                }`}
              >
                <span>🌍 Toate (incl. Europa)</span>
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
              placeholder="Caută domeniu sau skill (ex: python, devops, react, embedded)..."
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
                <option value="OPPORTUNITY">Scor Oportunitate (Sweet Spot)</option>
                <option value="LOW_COMP">Cea Mai Mică Competiție</option>
                <option value="VOLUME">Număr Joburi (Cerere)</option>
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

      {/* THREE HIGHLIGHTS BOXES (SWEET SPOT, LOWEST COMPETITION, MOST IN-DEMAND) */}
      {data && !loading && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* BOX 1: SWEET SPOTS (TOP OPORTUNITATE) */}
          <div className="bg-gradient-to-br from-emerald-500/10 via-white to-white border border-emerald-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <Target className="w-3.5 h-3.5 text-emerald-600" />
                  Top Sweet Spot
                </span>
                <span className="text-xs text-emerald-700 font-bold">Cel mai bun ROI</span>
              </div>
              <h3 className="font-black text-gray-950 text-base">Unde să aplici pentru cele mai bune șanse</h3>
              <p className="text-xs text-gray-600">
                Roluri cu cerere mare din partea angajatorilor și competiție redusă din partea altor aplicanți.
              </p>

              <div className="space-y-2 pt-2">
                {data.topSweetSpots?.slice(0, 3).map((spot, i) => (
                  <div 
                    key={spot.id}
                    onClick={() => { setSelectedDomain(spot); setModalTab('requirements'); }}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-emerald-100 hover:border-emerald-300 transition cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 font-black text-xs flex items-center justify-center">
                        #{i + 1}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-gray-900 group-hover:text-emerald-700 transition">
                          {spot.title}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {spot.levelJobCount} poziții • {spot.lowCompetitionRate}% competiție redusă
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-700 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100">
                      {spot.opportunityScore}/100
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BOX 2: LOWEST COMPETITION */}
          <div className="bg-gradient-to-br from-blue-500/10 via-white to-white border border-blue-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Cea Mai Mică Competiție
                </span>
                <span className="text-xs text-blue-700 font-bold">Puțini candidați</span>
              </div>
              <h3 className="font-black text-gray-950 text-base">Lipsă de candidați specializați</h3>
              <p className="text-xs text-gray-600">
                Domenii tehnice unde companiile au sub 10-25 de aplicanți per job și răspund mult mai repede.
              </p>

              <div className="space-y-2 pt-2">
                {data.lowestCompetition?.slice(0, 3).map((spot, i) => (
                  <div 
                    key={spot.id}
                    onClick={() => { setSelectedDomain(spot); setModalTab('requirements'); }}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-blue-100 hover:border-blue-300 transition cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 font-black text-xs flex items-center justify-center">
                        #{i + 1}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-gray-900 group-hover:text-blue-700 transition">
                          {spot.title}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {spot.lowCompetitionRate}% dintre postări au competiție scăzută
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-blue-700 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100">
                      {spot.lowCompetitionRate}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BOX 3: MOST IN-DEMAND */}
          <div className="bg-gradient-to-br from-amber-500/10 via-white to-white border border-amber-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  Cele Mai Căutate
                </span>
                <span className="text-xs text-amber-700 font-bold">Volum maxim</span>
              </div>
              <h3 className="font-black text-gray-950 text-base">Cele mai multe oferte deschise</h3>
              <p className="text-xs text-gray-600">
                Domenii cu numărul brut cel mai mare de joburi active pe nivelul {levelFilter} în {locationFilter === 'RO_ONLY' ? 'România' : 'piață'}.
              </p>

              <div className="space-y-2 pt-2">
                {data.mostInDemand?.slice(0, 3).map((spot, i) => (
                  <div 
                    key={spot.id}
                    onClick={() => { setSelectedDomain(spot); setModalTab('requirements'); }}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-amber-100 hover:border-amber-300 transition cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 font-black text-xs flex items-center justify-center">
                        #{i + 1}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-gray-900 group-hover:text-amber-700 transition">
                          {spot.title}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {spot.levelJobCount} poziții la nivelul {levelFilter}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-amber-700 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-100">
                      {spot.levelJobCount} joburi
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </section>
      )}

      {/* UNIVERSAL TOP SKILLS RADAR STRIP */}
      {data?.universalTopSkills && data.universalTopSkills.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Frecvența Tehnologiilor în Descrierile Reale de Joburi ({levelFilter} • {locationFilter === 'RO_ONLY' ? 'România' : 'Extins'})
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Extrase direct din cerințele oficiale ale anunțurilor de recrutare din România (fără estimări generice sau etichete sintetice).
              </p>
            </div>
            <span className="text-[11px] font-bold text-gray-400">
              {data.universalTopSkills.length} tehnologii detectate
            </span>
          </div>

          {/* CATEGORY FILTER PILLS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 border-b border-gray-100">
            {SKILL_CATEGORIES.map((cat) => {
              const countInCat = cat.id === 'ALL'
                ? data.universalTopSkills.length
                : data.universalTopSkills.filter(s => s.category === cat.id).length;
              if (countInCat === 0 && cat.id !== 'ALL') return null;

              const active = universalSkillCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setUniversalSkillCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${active ? 'bg-neutral-700 text-gray-200' : 'bg-gray-200 text-gray-600'}`}>
                    {countInCat}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
            {data.universalTopSkills
              .filter(sk => universalSkillCategory === 'ALL' || sk.category === universalSkillCategory)
              .map((sk) => (
                <div 
                  key={sk.skill}
                  className="bg-gray-50/80 border border-gray-200/70 p-3 rounded-2xl flex flex-col justify-between hover:bg-gray-100 transition group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-gray-900 truncate" title={sk.skill}>
                        {sk.skill}
                      </span>
                      <span className="text-[11px] font-black text-blue-600 shrink-0">{sk.percentage}%</span>
                    </div>
                    {sk.category && (
                      <span className="inline-block text-[9px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-200/60 px-1.5 py-0.5 rounded">
                        {sk.category}
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-2.5">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, sk.percentage * 2)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1">{sk.count} poziții cerute</span>
                </div>
            ))}
          </div>
        </section>
      )}

      {/* DOMAIN CARDS GRID (13 SPECIALIZATIONS) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-950 flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-600" />
              Specializări Tehnice în Piață ({filteredDomains.length})
            </h2>
            <p className="text-xs text-gray-500">
              Apasă pe orice domeniu pentru a vedea cerințele complete, joburile reale din România și estimările salariale.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-xl border border-gray-200">
              {locationFilter === 'RO_ONLY' ? '🇷🇴 Doar România' : locationFilter === 'RO_AND_REMOTE' ? '🏠 România & Remote' : '🌍 Toate'}
            </span>
            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-xl border border-gray-200">
              Nivel: {levelFilter}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center bg-white border border-gray-200 rounded-3xl">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-800">Se analizează piața IT și descrierile de joburi...</p>
            <p className="text-xs text-gray-500 mt-1">Calculare statistici de competiție, cerere și salarii.</p>
          </div>
        ) : filteredDomains.length === 0 ? (
          <div className="py-16 text-center bg-white border border-gray-200 rounded-3xl p-6">
            <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-800">Nu a fost găsit niciun domeniu conform filtrelor selectate.</p>
            <button
              onClick={() => { setSearchQuery(''); setLevelFilter('JUNIOR'); setLocationFilter('RO_ONLY'); setActiveOnly(false); }}
              className="mt-3 px-4 py-2 bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Resetează Filtrele
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDomains.map((domain) => {
              const IconComp = DOMAIN_ICONS[domain.id] || Code;
              const compInfo = getCompBadge(domain.lowCompetitionRate);

              return (
                <div
                  key={domain.id}
                  onClick={() => { setSelectedDomain(domain); setModalTab('requirements'); }}
                  className="bg-white border border-gray-200 hover:border-gray-400 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* TOP LINE: ICON + BADGES */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-800 group-hover:bg-black group-hover:text-white transition">
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-black text-gray-950 text-base leading-tight group-hover:text-blue-600 transition">
                            {domain.title}
                          </h3>
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                            {domain.tagLine}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* METRICS ROW */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-gray-100 text-center">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Joburi {levelFilter}</p>
                        <p className="text-base font-black text-gray-950 mt-0.5">
                          {domain.levelJobCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Competiție</p>
                        <p className={`text-[11px] font-black mt-1 px-1.5 py-0.5 rounded-md inline-block border ${compInfo.color}`}>
                          {compInfo.label}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Scor Oportunitate</p>
                        <p className={`text-base font-black mt-0.5 ${domain.opportunityScore >= 70 ? 'text-emerald-700' : 'text-blue-700'}`}>
                          {domain.opportunityScore}<span className="text-[10px] text-gray-400 font-normal">/100</span>
                        </p>
                      </div>
                    </div>

                    {/* SALARY STRIP */}
                    {domain.salaryEstimate && (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-700 bg-amber-50/70 border border-amber-200/80 px-2.5 py-1.5 rounded-xl">
                        <Banknote className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">Salariu {levelFilter}: <strong className="text-gray-950">{domain.salaryEstimate}</strong></span>
                      </div>
                    )}

                    {/* CV SKILL MATCH INDICATOR (IF USER HAS CV) */}
                    {domain.userMatchScore > 0 ? (
                      <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                        <span>Potrivire cu CV-ul tău:</span>
                        <span className="font-black px-1.5 py-0.2 rounded-md bg-emerald-600 text-white text-[10px]">
                          {domain.userMatchScore}% Match
                        </span>
                      </div>
                    ) : null}

                    {/* SENIORITY SPREAD MINI-BAR */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                        <span>Junior ({domain.juniorJobs})</span>
                        <span>Mid ({domain.midJobs})</span>
                        <span>Senior ({domain.seniorJobs})</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
                        <div 
                          className="bg-emerald-500 h-full" 
                          style={{ width: `${domain.totalJobs > 0 ? (domain.juniorJobs / domain.totalJobs) * 100 : 0}%` }}
                          title={`Junior: ${domain.juniorJobs}`}
                        />
                        <div 
                          className="bg-blue-500 h-full" 
                          style={{ width: `${domain.totalJobs > 0 ? (domain.midJobs / domain.totalJobs) * 100 : 0}%` }}
                          title={`Mid: ${domain.midJobs}`}
                        />
                        <div 
                          className="bg-purple-500 h-full" 
                          style={{ width: `${domain.totalJobs > 0 ? (domain.seniorJobs / domain.totalJobs) * 100 : 0}%` }}
                          title={`Senior: ${domain.seniorJobs}`}
                        />
                      </div>
                    </div>

                    {/* TOP REQUIRED SKILLS */}
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Top Ce Se Cere:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {domain.topSkills?.slice(0, 5).map((sk) => (
                          <span 
                            key={sk.skill} 
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-100 text-gray-800 border border-gray-200"
                          >
                            {sk.skill} <span className="text-gray-400 font-semibold">{sk.percentage}%</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM CTA BUTTON */}
                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-900 group-hover:text-blue-600 transition">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      Vezi Ce Se Cere & Joburi Reale
                    </span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* DETAIL MODAL ("CE TREBUIE SĂ ȘTII PENTRU ACEST ROL") */}
      {selectedDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl border border-gray-200 w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="p-6 border-b border-gray-200 flex items-start justify-between bg-gradient-to-r from-gray-50 via-white to-white shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-sm">
                  {(() => {
                    const IconComp = DOMAIN_ICONS[selectedDomain.id] || Code;
                    return <IconComp className="w-6 h-6 text-blue-400" />;
                  })()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg sm:text-2xl font-black text-gray-950 tracking-tight">
                      {selectedDomain.title}
                    </h2>
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${getOpportunityColor(selectedDomain.opportunityScore)}`}>
                      {selectedDomain.opportunityBadge}
                    </span>
                    {selectedDomain.salaryEstimate && (
                      <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                        <Banknote className="w-3 h-3 text-amber-600" />
                        {selectedDomain.salaryEstimate}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl">
                    {selectedDomain.tagLine}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDomain(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MODAL TABS */}
            <div className="px-6 border-b border-gray-200 bg-white flex gap-2 shrink-0 overflow-x-auto">
              <button
                onClick={() => setModalTab('requirements')}
                className={`py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  modalTab === 'requirements'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-black'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Ce Se Cere în Descrierile Reale
              </button>
              <button
                onClick={() => setModalTab('comparison')}
                className={`py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  modalTab === 'comparison'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-black'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                Junior vs Mid vs Senior
              </button>
              <button
                onClick={() => setModalTab('roadmap')}
                className={`py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  modalTab === 'roadmap'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-black'
                }`}
              >
                <Compass className="w-4 h-4 text-purple-600" />
                Ghid de Pregătire & Roadmap
              </button>
              <button
                onClick={() => setModalTab('sample_jobs')}
                className={`py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  modalTab === 'sample_jobs'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-black'
                }`}
              >
                <Briefcase className="w-4 h-4 text-amber-600" />
                Joburi Reale Deschise ({selectedDomain.sampleJobs?.length || 0})
              </button>
            </div>

            {/* MODAL CONTENT BODY */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-gray-50/50">
              
              {/* TAB 1: REQUIREMENTS CHECKLIST */}
              {modalTab === 'requirements' && (
                <div className="space-y-6">
                  
                  {/* INTERVIEW FORMAT & DIFFICULTY BANNER */}
                  {selectedDomain.interviewFormat && (
                    <div className="bg-indigo-50/70 border border-indigo-200/80 p-4 rounded-2xl flex items-start gap-3">
                      <Zap className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-black uppercase tracking-wider text-[11px] text-indigo-800 block">
                          Formatul Tipic al Interviului Tehnic în România
                        </span>
                        <p className="text-xs text-indigo-950 mt-1 leading-relaxed">
                          {selectedDomain.interviewFormat}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* USER CV MATCH BANNER (IF ACTIVE) */}
                  {selectedDomain.userMatchScore > 0 ? (
                    <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Analiză Potrivire cu CV-ul Tău Salvat
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white">
                          {selectedDomain.userMatchScore}% Match
                        </span>
                      </div>
                      <div className="text-xs text-emerald-900 space-y-1">
                        <p>
                          ✓ Competențe identificate în CV-ul tău: <strong className="text-emerald-950">{selectedDomain.userMatchingSkills?.join(', ') || 'Niciunul'}</strong>
                        </p>
                        {selectedDomain.userMissingSkills?.length > 0 && (
                          <p className="text-gray-700">
                            ⚡ Ce îți lipsește pentru a maximiza rata de selecție ATS: <strong className="text-rose-600">{selectedDomain.userMissingSkills.join(', ')}</strong>
                          </p>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* TOP SKILLS FREQUENCY */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="text-xs font-black uppercase text-gray-500 tracking-wider flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-600" />
                        Frecvența Tehnologiilor în Descrierile Reale ({levelFilter} • {locationFilter === 'RO_ONLY' ? 'România' : 'Extins'})
                      </h4>
                      <span className="text-[11px] text-gray-400 font-semibold">
                        {selectedDomain.topSkills?.length || 0} tehnologii identificate
                      </span>
                    </div>

                    {/* CATEGORY PILLS FOR MODAL */}
                    {selectedDomain.topSkills && selectedDomain.topSkills.length > 0 && (
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 border-b border-gray-100">
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
                              className={`px-2.5 py-1 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                                active
                                  ? 'bg-black text-white'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                              }`}
                            >
                              <span>{cat.label}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${active ? 'bg-neutral-700 text-gray-200' : 'bg-gray-200 text-gray-600'}`}>
                                {countInCat}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
                      {selectedDomain.topSkills
                        ?.filter(sk => modalSkillCategory === 'ALL' || sk.category === modalSkillCategory)
                        .map((sk) => (
                          <div key={sk.skill} className="p-3 rounded-xl bg-gray-50/90 border border-gray-200 flex flex-col justify-between hover:bg-gray-100 transition">
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-xs font-bold text-gray-900 gap-1">
                                <span className="truncate" title={sk.skill}>{sk.skill}</span>
                                <span className="text-blue-600 shrink-0">{sk.percentage}%</span>
                              </div>
                              {sk.category && (
                                <span className="inline-block text-[9px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-200/60 px-1.5 py-0.5 rounded">
                                  {sk.category}
                                </span>
                              )}
                            </div>
                            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-2.5">
                              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${Math.min(100, sk.percentage * 2)}%` }} />
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1">{sk.count} cerințe în descrieri</span>
                          </div>
                      ))}
                    </div>
                  </div>

                  {/* STRUCTURED REQUIREMENTS CATEGORIES */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedDomain.requirementsChecklist?.map((cat, idx) => (
                      <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-black text-gray-950">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <h4>{cat.categoryName}</h4>
                        </div>
                        <ul className="space-y-2">
                          {cat.items?.map((item, itemIdx) => (
                            <li key={itemIdx} className="text-xs text-gray-700 flex items-start gap-2 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5"></span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: COMPARISON JUNIOR VS MID VS SENIOR */}
              {modalTab === 'comparison' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* JUNIOR */}
                  <div className="bg-white p-5 rounded-2xl border-2 border-emerald-300 space-y-3 relative shadow-xs">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      Nivel Junior / Intern (0-2 ani)
                    </span>
                    <h4 className="font-black text-gray-950 text-sm">Focus pe Bază & Capacitate de Învățare</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Companiile nu caută un expert care știe totul, ci o persoană pasionată cu fundamente solide și dorință de creștere.
                    </p>
                    <ul className="space-y-2 pt-2 border-t border-gray-100">
                      {selectedDomain.seniorityComparison?.juniorFocus?.map((point, i) => (
                        <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* MID */}
                  <div className="bg-white p-5 rounded-2xl border border-blue-200 space-y-3 shadow-xs">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800">
                      Nivel Mid-Level (2-4 ani)
                    </span>
                    <h4 className="font-black text-gray-950 text-sm">Autonomie & Livrare Funcționalități</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Se cere capacitatea de a prelua un task de la cap la coadă fără îndrumare constantă, scriind cod curat și testat.
                    </p>
                    <ul className="space-y-2 pt-2 border-t border-gray-100">
                      {selectedDomain.seniorityComparison?.midFocus?.map((point, i) => (
                        <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* SENIOR */}
                  <div className="bg-white p-5 rounded-2xl border border-purple-200 space-y-3 shadow-xs">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800">
                      Nivel Senior & Lead (5+ ani)
                    </span>
                    <h4 className="font-black text-gray-950 text-sm">Arhitectură, Scalabilitate & Mentoring</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Decizii tehnice pe termen lung, rezolvare de probleme de performanță la scară mare și ghidare de echipă.
                    </p>
                    <ul className="space-y-2 pt-2 border-t border-gray-100">
                      {selectedDomain.seniorityComparison?.seniorFocus?.map((point, i) => (
                        <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 3: ROADMAP */}
              {modalTab === 'roadmap' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-xs text-blue-800 leading-relaxed">
                    💡 <strong>Plan Strategic Recomandat:</strong> Urmează aceste 4 etape structurate pentru a trece cu succes de selecția ATS și de interviul tehnic pentru roluri de {selectedDomain.title}.
                  </div>

                  <div className="space-y-3">
                    {selectedDomain.preparationRoadmap?.map((stage) => (
                      <div key={stage.stageNumber} className="bg-white p-5 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className="w-9 h-9 rounded-xl bg-black text-white font-black text-sm flex items-center justify-center shrink-0">
                            {stage.stageNumber}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-gray-950 text-sm">{stage.stageTitle}</h4>
                              <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                {stage.durationEst}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {stage.keyMilestones?.map((m, mIdx) => (
                                <span key={mIdx} className="text-xs text-gray-700 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
                                  ✓ {m}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: SAMPLE ACTIVE JOBS (DISTINCT COMPANIES & LOCATION SENSITIVE) */}
              {modalTab === 'sample_jobs' && (
                <div className="space-y-4">
                  
                  {/* SEARCH REDIRECT BANNER */}
                  <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                    <div>
                      <h4 className="text-xs font-black text-gray-950 uppercase tracking-wider flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        Companii Reale Verificate ({locationFilter === 'RO_ONLY' ? 'Piața România' : locationFilter === 'RO_AND_REMOTE' ? 'România & Remote' : 'Toate'})
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Fiecare poziție de mai jos provine de la o companie diferită pentru a asigura varietate (fără duplicate).
                      </p>
                    </div>

                    {onNavigateToJobSearch && (
                      <button
                        onClick={() => {
                          setSelectedDomain(null);
                          onNavigateToJobSearch();
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition shadow-xs shrink-0 cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5 text-blue-400" />
                        <span>Caută în toate joburile deschise</span>
                      </button>
                    )}
                  </div>

                  {selectedDomain.sampleJobs && selectedDomain.sampleJobs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedDomain.sampleJobs.map((job) => (
                        <div key={job.id} className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3 flex flex-col justify-between shadow-2xs hover:border-black transition">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                {job.sourcePlatform}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                {job.experienceLevel}
                              </span>
                            </div>
                            <h4 className="font-black text-gray-950 text-sm line-clamp-1" title={job.jobTitle}>
                              {job.jobTitle}
                            </h4>
                            <p className="text-xs text-gray-800 flex items-center gap-1.5 font-bold">
                              <Building2 className="w-3.5 h-3.5 text-blue-600" />
                              {job.companyName}
                            </p>
                            <p className="text-[11px] text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              {job.location} • {job.workModel}
                            </p>
                          </div>

                          {job.directApplyUrl && (
                            <a
                              href={job.directApplyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                            >
                              <span>Vezi Anunțul / Aplică Direct</span>
                              <ExternalLink className="w-3 h-3 text-blue-400" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-white border border-gray-200 rounded-2xl space-y-3">
                      <p className="text-xs text-gray-600">
                        Nu au fost identificate exemple directe pentru filtrul <strong className="text-gray-900">{locationFilter === 'RO_ONLY' ? 'Doar România' : locationFilter}</strong> la nivelul <strong className="text-gray-900">{levelFilter}</strong>.
                      </p>
                      <button
                        onClick={() => setLocationFilter('RO_AND_REMOTE')}
                        className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition cursor-pointer"
                      >
                        Comută pe România & Remote
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between shrink-0">
              <span className="text-xs text-gray-500">
                Piață: <strong className="text-gray-900">{selectedDomain.totalJobs} joburi</strong> ({selectedDomain.juniorJobs} Junior, {selectedDomain.midJobs} Mid, {selectedDomain.seniorJobs} Senior)
              </span>
              <button
                onClick={() => setSelectedDomain(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
