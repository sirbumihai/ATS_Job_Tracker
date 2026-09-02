import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  SlidersHorizontal,
  Code2,
  Database,
  Cpu,
  Terminal,
  Smartphone,
  Server,
  Shield,
  CheckSquare,
  LineChart,
  BrainCircuit,
  Bot,
  HelpCircle,
  Network,
  Users,
  Palette,
  FileCode2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Flame,
  Gauge
} from 'lucide-react';

export default function JobSearchPage({ 
  currentUser, 
  onSaveToKanbanSuccess, 
  onNavigateToStudio,
  onNavigateToKanban
}) {
  const DEFAULT_USER_ID = '23fe8bdd-08f4-413d-9985-f99c21040b59';
  const activeUserId = currentUser?.userId || currentUser?.id || DEFAULT_USER_ID;

  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [selectedRoleCategory, setSelectedRoleCategory] = useState('ALL');
  const [selectedPlatform, setSelectedPlatform] = useState('ALL');
  const [selectedWorkModel, setSelectedWorkModel] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedCompetitiveness, setSelectedCompetitiveness] = useState('ALL');
  const [sortBy, setSortBy] = useState('MATCH_AND_RECENCY'); // 'MATCH_AND_RECENCY', 'MATCH_SCORE', 'NEWEST', 'LOW_COMPETITION'
  
  // Paginare & Optimizare
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [savingJobId, setSavingJobId] = useState(null);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Timer sincronizare automată orară (60 minute)
  const [secondsUntilSync, setSecondsUntilSync] = useState(3600);
  const jobsListRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsUntilSync(prev => {
        if (prev <= 1) {
          fetchJobs();
          return 3600;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const roleCategories = [
    { id: 'ALL', label: 'Toate Rolurile', icon: Globe },
    { id: 'JAVA', label: 'Java Engineer', icon: Code2 },
    { id: 'BACKEND', label: 'Backend Engineer', icon: Server },
    { id: 'FULLSTACK', label: 'Full Stack Engineer', icon: Layers },
    { id: 'AI_LLM', label: 'AI & LLM Engineer', icon: Bot },
    { id: 'ML_ENGINEER', label: 'Machine Learning & Deep Learning', icon: BrainCircuit },
    { id: 'DATA_ANALYST', label: 'Data Analyst', icon: LineChart },
    { id: 'DATA_SCIENTIST', label: 'Data Scientist', icon: Cpu },
    { id: 'DATA_ENGINEER', label: 'Data Engineer', icon: Database },
    { id: 'FRONTEND_REACT', label: 'Frontend / React Developer', icon: Terminal },
    { id: 'ANDROID', label: 'Android Developer', icon: Smartphone },
    { id: 'DEVOPS', label: 'DevOps & SRE', icon: Zap },
    { id: 'CLOUD_SECURITY', label: 'Cloud Security / Cyber', icon: Shield },
    { id: 'AUTOMATION_TEST', label: 'QA & Automation Testing', icon: CheckSquare },
    { id: 'BUSINESS_ANALYST', label: 'Business Analyst / PO', icon: LineChart },
    { id: 'TECH_SUPPORT', label: 'Technical Support & Helpdesk', icon: HelpCircle },
    { id: 'SYSADMIN_NETWORK', label: 'SysAdmin & Network Engineer', icon: Network },
    { id: 'SCRUM_PM', label: 'Scrum Master & IT PM', icon: Users },
    { id: 'DBA_SQL', label: 'DBA & SQL Developer', icon: Database },
    { id: 'ERP_SAP_CRM', label: 'SAP, Salesforce & ERP', icon: FileCode2 },
    { id: 'UI_UX', label: 'UI/UX & Product Design', icon: Palette }
  ];

  const platformsList = [
    { id: 'ALL', label: 'Toate Platformele', icon: Globe },
    { id: 'STAGIIPEBUNE', label: '🎓 StagiiPeBune.ro', icon: GraduationCap },
    { id: 'JUNIORS_RO', label: '👶 Juniors.ro', icon: Briefcase },
    { id: 'LINKEDIN', label: '🌐 LinkedIn Jobs', icon: ExternalLink },
    { id: 'DIRECT_ATS', label: '🏢 Direct ATS (Greenhouse / Ashby / Lever)', icon: Building2 },
    { id: 'WELLFOUND', label: '🚀 Wellfound Startups', icon: Zap },
    { id: 'EJOBS', label: '🇷🇴 eJobs & UndeLucram', icon: Layers }
  ];

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (location) params.append('location', location);
      if (selectedPlatform && selectedPlatform !== 'ALL') params.append('platform', selectedPlatform);
      if (selectedLevel && selectedLevel !== 'ALL') params.append('level', selectedLevel);
      if (selectedRoleCategory && selectedRoleCategory !== 'ALL') params.append('roleCategory', selectedRoleCategory);
      if (selectedWorkModel && selectedWorkModel !== 'ALL') params.append('workModel', selectedWorkModel);
      params.append('userId', activeUserId);

      const res = await fetch(`/api/v1/jobs/search?${params.toString()}`, {
        headers: { 'X-User-Id': activeUserId }
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
        setCurrentPage(1); // Reset la prima pagină la căutare
      }
    } catch (err) {
      console.error('Eroare la căutarea joburilor:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncLive = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/jobs/sync-live', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setToastMessage(`Sincronizare Live Reușită! ${data.totalLiveJobs || '1200+'} joburi agregate și active.`);
        setSecondsUntilSync(3600);
        setTimeout(() => setToastMessage(null), 4500);
      }
    } catch (err) {
      console.warn('Sync live warn:', err);
    } finally {
      fetchJobs();
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedRoleCategory, selectedPlatform, selectedWorkModel, selectedLevel]);

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

  // Filtrare suplimentară pe client & Sortare flexibilă
  const filteredAndSortedJobs = useMemo(() => {
    let result = [...jobs];

    // Filtrare competitivitate
    if (selectedCompetitiveness !== 'ALL') {
      result = result.filter(j => (j.competitiveness || 'MEDIUM') === selectedCompetitiveness);
    }

    // Sortare
    result.sort((a, b) => {
      if (sortBy === 'MATCH_SCORE') {
        return b.atsMatchScore - a.atsMatchScore;
      }
      if (sortBy === 'NEWEST') {
        return (a.postedDaysAgo || 0) - (b.postedDaysAgo || 0);
      }
      if (sortBy === 'LOW_COMPETITION') {
        const compOrder = { 'LOW': 0, 'MEDIUM': 1, 'HIGH': 2 };
        const compA = compOrder[a.competitiveness] ?? 1;
        const compB = compOrder[b.competitiveness] ?? 1;
        if (compA !== compB) return compA - compB;
        return b.atsMatchScore - a.atsMatchScore;
      }
      // Implicit: MATCH_AND_RECENCY (Cele mai bune match-uri dintre cele mai recente)
      const scoreDiff = b.atsMatchScore - a.atsMatchScore;
      if (Math.abs(scoreDiff) > 5) {
        return scoreDiff;
      }
      return (a.postedDaysAgo || 0) - (b.postedDaysAgo || 0);
    });

    return result;
  }, [jobs, selectedCompetitiveness, sortBy]);

  // Paginare
  const totalJobs = filteredAndSortedJobs.length;
  const totalPages = Math.max(1, Math.ceil(totalJobs / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalJobs);
  const currentJobs = useMemo(() => {
    return filteredAndSortedJobs.slice(startIndex, endIndex);
  }, [filteredAndSortedJobs, startIndex, endIndex]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      if (jobsListRef.current) {
        jobsListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
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
        return { label: 'eJobs & UndeLucram', bg: 'bg-amber-100 text-amber-900 border-amber-300', dot: 'bg-amber-500' };
      default:
        return { label: platform, bg: 'bg-gray-100 text-gray-800 border-gray-300', dot: 'bg-gray-500' };
    }
  };

  const renderCompetitivenessBadge = (job) => {
    const comp = job.competitiveness || 'MEDIUM';
    if (comp === 'LOW') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          🟢 Șansă Mare de Angajare (Competiție Redusă)
        </span>
      );
    }
    if (comp === 'HIGH') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-800 border border-rose-300 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          🔴 Competiție Ridicată (Top Brand / Mulți Candidați)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
        🟡 Competiție Medie (Șanse Echilibrate)
      </span>
    );
  };

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

      {/* HERO HEADER & STATS BAR */}
      <div className="bg-white border border-gray-200/90 shadow-sm p-6 sm:p-8 rounded-3xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                20+ Specializări IT
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-blue-100 text-blue-800 border border-blue-200">
                Postate în Ultima Lună (Verificate)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-purple-100 text-purple-800 border border-purple-200">
                Indexare & Scor ATS Match
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
              Căutare & Agregator Job-uri Multi-Platformă
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium max-w-3xl leading-relaxed">
              Explorează peste 1.200+ oportunități live extrase direct de pe <strong>LinkedIn România, StagiiPeBune, Juniors.ro, UndeLucram, eJobs, Ashby, Greenhouse & Remotive</strong>.
            </p>
          </div>

          {/* TIMER DE SINCRONIZARE AUTOMATĂ ORARĂ & BUTON REFRESH */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start md:self-auto">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-700">
              <Clock className="w-4 h-4 text-indigo-600 animate-spin-slow" />
              <span>Auto-refresh în:</span>
              <span className="font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                {formatCountdown(secondsUntilSync)}
              </span>
            </div>

            <button 
              onClick={handleSyncLive}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-100 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sincronizează Acum</span>
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH BAR & MAIN FILTERS */}
      <div className="bg-white border border-gray-200/90 shadow-sm p-6 rounded-3xl space-y-6">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="relative md:col-span-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Titlu rol, tehnologii (Java, Spring, Python, React, SQL, DevOps)..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
            />
          </div>

          <div className="relative md:col-span-4">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Locație (București, Cluj, Timișoara, Remote)..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
            />
          </div>

          <div className="md:col-span-2">
            <button 
              type="submit"
              disabled={loading}
              className="w-full h-full py-3 bg-black hover:bg-gray-800 text-white rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 transition cursor-pointer shadow-md disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>Caută</span>
            </button>
          </div>
        </form>

        {/* CATEGORII DE ROLURI IT EXTINSE */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Specializare & Domeniu Tehnic (20+ Opțiuni):
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {roleCategories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedRoleCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedRoleCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition cursor-pointer shrink-0 border ${
                    isSelected 
                      ? 'bg-black text-white border-black shadow-sm' 
                      : 'bg-gray-50/90 text-gray-700 border-gray-200/90 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-gray-500'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FILTRE AVANSATE DE NIVEL, COMPETITIVITATE, PLATFORMĂ & SORTARE */}
        <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* NIVEL EXPERIENȚĂ */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">
              Nivel Experiență
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
            >
              <option value="ALL">Toate Nivelurile</option>
              <option value="INTERNSHIP">🎓 Internship & Stagiari</option>
              <option value="JUNIOR">👶 Junior & Entry Level</option>
              <option value="MID">🏢 Mid-Level (Middle)</option>
              <option value="SENIOR">⭐ Senior & Lead / Architect</option>
            </select>
          </div>

          {/* NIVEL COMPETITIVITATE */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">
              Competitivitate & Șanse
            </label>
            <select
              value={selectedCompetitiveness}
              onChange={(e) => setSelectedCompetitiveness(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
            >
              <option value="ALL">Toate Tipurile de Competiție</option>
              <option value="LOW">🟢 Șansă Mare (Competiție Scăzută)</option>
              <option value="MEDIUM">🟡 Competiție Medie</option>
              <option value="HIGH">🔴 Competiție Ridicată (Top Tech)</option>
            </select>
          </div>

          {/* PLATFORMĂ */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">
              Platformă Sursă
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
            >
              {platformsList.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* WORK MODEL */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">
              Mod de Lucru
            </label>
            <select
              value={selectedWorkModel}
              onChange={(e) => setSelectedWorkModel(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
            >
              <option value="ALL">Toate Modurile</option>
              <option value="REMOTE">🌐 Exclusiv Remote</option>
              <option value="HYBRID">🏢 Hibrid</option>
              <option value="ONSITE">📍 On-Site</option>
            </select>
          </div>

          {/* SORTARE INTELIGENTĂ */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">
              Sortare Rezultate
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs font-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 cursor-pointer"
            >
              <option value="MATCH_AND_RECENCY">🚀 Cele Mai Recente & Scor ATS</option>
              <option value="NEWEST">🕒 Cele Mai Noi (Data Postării)</option>
              <option value="MATCH_SCORE">🎯 Scor Match ATS Descrescător</option>
              <option value="LOW_COMPETITION">🟢 Șanse Maxime (Competiție Redusă)</option>
            </select>
          </div>

        </div>
      </div>

      {/* HEADER REZULTATE CU STATISTICI & CONTROALE DE PAGINARE TOP */}
      <div ref={jobsListRef} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-gray-900">
            {loading ? 'Se caută...' : `${totalJobs} Oportunități Găsite`}
          </span>
          <span className="text-xs font-semibold text-gray-400">
            • Afișare {totalJobs > 0 ? startIndex + 1 : 0} - {endIndex} din {totalJobs}
          </span>
        </div>

        {/* DIMENSIUNE PAGINĂ */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
            <span>Pe pagină:</span>
            {[12, 24, 48].map((size) => (
              <button
                key={size}
                onClick={() => { setPageSize(size); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                  pageSize === size 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LISTA DE JOB-URI (OPTIMIZATĂ CU PAGINARE) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="bg-white border border-gray-200 p-6 rounded-3xl animate-pulse space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-16 bg-gray-50 rounded-xl"></div>
              <div className="h-8 bg-gray-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : totalJobs === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 p-12 rounded-3xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-800">Nu am găsit joburi care să corespundă filtrelor selectate</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Încearcă să resetezi filtrele sau apasă pe butonul <strong>Sincronizare Live</strong> pentru a reîmprospăta baza de date cu cele mai noi anunțuri.
          </p>
          <button
            onClick={() => {
              setKeyword('');
              setLocation('');
              setSelectedRoleCategory('ALL');
              setSelectedPlatform('ALL');
              setSelectedLevel('ALL');
              setSelectedCompetitiveness('ALL');
            }}
            className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition cursor-pointer"
          >
            Resetează Toate Filtrele
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentJobs.map((job) => {
            const platformBadge = getPlatformBadge(job.sourcePlatform);
            const isSaved = savedJobIds.has(job.id);
            const isSaving = savingJobId === job.id;
            const isExpanded = expandedJobId === job.id;

            return (
              <div 
                key={job.id} 
                className="bg-white border border-gray-200/90 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 rounded-3xl p-5 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3.5">
                  
                  {/* TOP HEADER: PLATFORMĂ & SCOR MATCH */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${platformBadge.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${platformBadge.dot}`}></span>
                      {platformBadge.label}
                    </span>

                    <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-black">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>{job.atsMatchScore.toFixed(1)}% Match</span>
                    </div>
                  </div>

                  {/* LOGO & TITLU */}
                  <div className="flex items-start gap-3">
                    <img 
                      src={job.companyLogoUrl} 
                      alt={job.companyName}
                      className="w-12 h-12 rounded-2xl object-cover bg-gray-50 border border-gray-200/70 shrink-0 shadow-2xs"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-extrabold text-gray-950 leading-snug line-clamp-2 group-hover:text-indigo-600 transition">
                        {job.jobTitle}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold truncate">
                        <Building2 className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                        <span className="truncate">{job.companyName}</span>
                      </div>
                    </div>
                  </div>

                  {/* BADGE-URI DE META-DATE: LOCAȚIE, MOD, NIVEL */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-gray-600">
                    <span className="px-2 py-0.5 bg-gray-100 rounded-lg flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {job.location}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded-lg">
                      {job.workModel === 'REMOTE' ? '🌐 Remote' : job.workModel === 'HYBRID' ? '🏢 Hibrid' : '📍 On-Site'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg ${
                      job.experienceLevel === 'INTERNSHIP' ? 'bg-emerald-100 text-emerald-900 font-extrabold' :
                      job.experienceLevel === 'JUNIOR' ? 'bg-indigo-100 text-indigo-900 font-extrabold' :
                      job.experienceLevel === 'SENIOR' ? 'bg-purple-100 text-purple-900 font-extrabold' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {job.experienceLevel === 'INTERNSHIP' ? '🎓 Internship' :
                       job.experienceLevel === 'JUNIOR' ? '👶 Junior' :
                       job.experienceLevel === 'SENIOR' ? '⭐ Senior' : '🏢 Mid-Level'}
                    </span>
                  </div>

                  {/* INDICATOR DE COMPETITIVITATE */}
                  <div>
                    {renderCompetitivenessBadge(job)}
                  </div>

                  {/* SALARIU & DATA POSTĂRII */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 text-gray-600 font-medium">
                    <span className="font-extrabold text-gray-900">
                      {job.salaryRange}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500 text-[11px]">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {job.postedDateAgo}
                    </span>
                  </div>

                  {/* SKILLS REQUIRED & MATCHING */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {job.skillsRequired.slice(0, 4).map((s, idx) => {
                      const isMatched = job.matchingSkills.includes(s);
                      return (
                        <span 
                          key={idx}
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                            isMatched 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : 'bg-gray-50 text-gray-600 border-gray-200'
                          }`}
                        >
                          {s}
                        </span>
                      );
                    })}
                    {job.skillsRequired.length > 4 && (
                      <span className="text-[10px] font-bold text-gray-400 self-center">
                        +{job.skillsRequired.length - 4}
                      </span>
                    )}
                  </div>

                  {/* DESCRIERE CU BUTON EXTINDERE */}
                  <div className="text-xs text-gray-600 leading-relaxed bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
                    <p className={isExpanded ? '' : 'line-clamp-2'}>
                      {job.rawDescription}
                    </p>
                    {job.rawDescription.length > 120 && (
                      <button
                        onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 mt-1 flex items-center gap-0.5 cursor-pointer"
                      >
                        {isExpanded ? <>Mai puțin <ChevronUp className="w-3 h-3" /></> : <>Citește mai mult <ChevronDown className="w-3 h-3" /></>}
                      </button>
                    )}
                  </div>

                </div>

                {/* BUTOANE ACȚIUNI: SALVARE KANBAN & APLICARE DIRECTĂ */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleSaveToKanban(job)}
                    disabled={isSaved || isSaving}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                      isSaved 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                        : 'bg-white hover:bg-gray-50 text-gray-900 border-gray-300 shadow-2xs'
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Salvat în Kanban</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5 text-gray-500" />
                        <span>{isSaving ? 'Se salvează...' : 'Salvează'}</span>
                      </>
                    )}
                  </button>

                  <a 
                    href={job.directApplyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm shadow-black/10"
                  >
                    <span>Aplică pe Site</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* PAGINARE ÎN PARTEA DE JOS */}
      {!loading && totalPages > 1 && (
        <div className="bg-white border border-gray-200 p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-bold text-gray-500">
            Pagina <span className="text-gray-950 font-black">{currentPage}</span> din <span className="text-gray-950 font-black">{totalPages}</span> ({totalJobs} joburi în total)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white transition cursor-pointer text-gray-700"
              title="Prima pagină"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white transition cursor-pointer text-xs font-bold flex items-center gap-1 text-gray-700"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>

            {/* BUTOANE NUMEROTATE DE PAGINĂ */}
            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-black transition cursor-pointer ${
                      isActive 
                        ? 'bg-black text-white shadow-xs' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white transition cursor-pointer text-xs font-bold flex items-center gap-1 text-gray-700"
            >
              <span>Următor</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white transition cursor-pointer text-gray-700"
              title="Ultima pagină"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
