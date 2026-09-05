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
  X, 
  Flame, 
  AlertCircle,
  FileText,
  Check,
  Calendar,
  History,
  GitCommit
} from 'lucide-react';
import JobDetailModal from './JobDetailModal';

export default function JobSearchPage({ 
  currentUser, 
  onSaveToKanbanSuccess, 
  onNavigateToStudio,
  onNavigateToKanban
}) {
  const DEFAULT_USER_ID = '23fe8bdd-08f4-413d-9985-f99c21040b59';
  const activeUserId = currentUser?.userId || currentUser?.id || DEFAULT_USER_ID;

  // Search & Filter state
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]); // Array de platforme selectate (gol = Toate)
  const [selectedRoleCategories, setSelectedRoleCategories] = useState([]); // Array de roluri selectate (gol = Toate)
  const [selectedDatePosted, setSelectedDatePosted] = useState('ALL'); // ALL, 1, 3, 7, 14, 30 zile
  const [selectedStatus, setSelectedStatus] = useState('ACTIVE'); // ACTIVE, EXPIRED, ALL
  const [selectedWorkModel, setSelectedWorkModel] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedCompetitiveness, setSelectedCompetitiveness] = useState('ALL');
  const [sortBy, setSortBy] = useState('MATCH_AND_RECENCY'); 

  // Audit History state
  const [auditJobForChanges, setAuditJobForChanges] = useState(null);
  const [jobChangesList, setJobChangesList] = useState([]);
  const [loadingChanges, setLoadingChanges] = useState(false); 
  
  // Dropdown-uri deschise
  const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [platformSearchQuery, setPlatformSearchQuery] = useState('');
  const [roleSearchQuery, setRoleSearchQuery] = useState('');

  // Autocomplete sugestii căutare & locație
  const [showKeywordSuggestions, setShowKeywordSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  // Paginare
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState(null);
  
  // Statistici globale persistente (platforme & contoare)
  const [globalStats, setGlobalStats] = useState({
    platformCounts: {},
    summaryStats: { junior: 0, intern: 0, remote: 0, highChance: 0 },
    totalLiveJobs: 0
  });

  // Persistență jobs salvate în localStorage
  const [savedJobIds, setSavedJobIds] = useState(() => {
    try {
      const saved = localStorage.getItem('ats_saved_job_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [savingJobId, setSavingJobId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Timer sincronizare automată orară (60 minute)
  const [secondsUntilSync, setSecondsUntilSync] = useState(3600);
  const jobsListRef = useRef(null);
  const platformDropdownRef = useRef(null);
  const roleDropdownRef = useRef(null);
  const keywordInputRef = useRef(null);
  const locationInputRef = useRef(null);

  // Închidere click-outside pentru dropdown-uri și autocomplete
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (platformDropdownRef.current && !platformDropdownRef.current.contains(e.target)) {
        setIsPlatformDropdownOpen(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setIsRoleDropdownOpen(false);
      }
      if (keywordInputRef.current && !keywordInputRef.current.contains(e.target)) {
        setShowKeywordSuggestions(false);
      }
      if (locationInputRef.current && !locationInputRef.current.contains(e.target)) {
        setShowLocationSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsUntilSync(prev => {
        if (prev <= 1) {
          fetchJobs();
          fetchGlobalStats();
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

  const formatExactDate = (postedAt, fallbackDaysAgo) => {
    if (postedAt) {
      try {
        const d = new Date(postedAt);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' });
        }
      } catch {
        // fallback to days ago
      }
    }
    if (fallbackDaysAgo !== null && fallbackDaysAgo !== undefined) {
      if (fallbackDaysAgo === 0) return 'Astăzi';
      if (fallbackDaysAgo === 1) return 'Ieri';
      return `Acum ${fallbackDaysAgo} zile`;
    }
    return 'Recent';
  };

  const formatDateTime = (dtStr) => {
    if (!dtStr) return 'Nespecificat';
    try {
      const d = new Date(dtStr);
      if (isNaN(d.getTime())) return dtStr;
      return d.toLocaleString('ro-RO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dtStr;
    }
  };

  const handleOpenAuditModal = async (job) => {
    setAuditJobForChanges(job);
    setLoadingChanges(true);
    setJobChangesList([]);
    try {
      const res = await fetch(`/api/v1/jobs/${job.id}/changes`);
      if (res.ok) {
        const data = await res.json();
        setJobChangesList(data);
      }
    } catch (err) {
      console.warn('Eroare la preluarea istoricului de modificări:', err);
    } finally {
      setLoadingChanges(false);
    }
  };

  // 14 PLATFORME REALE CU ICONIȚE ȘI CONTOARE PERMANENTE (FĂRĂ EMOTICOANE)
  const platformsConfig = [
    { id: 'DEVJOB_RO', label: 'DevJob.ro (Tech)', icon: Code2, countKey: 'DEVJOB_RO' },
    { id: 'LINKEDIN', label: 'LinkedIn Jobs', icon: ExternalLink, countKey: 'LINKEDIN' },
    { id: 'HIPO', label: 'Hipo.ro Trainee & IT', icon: GraduationCap, countKey: 'HIPO' },
    { id: 'STAGIIPEBUNE', label: 'StagiiPeBune.ro', icon: GraduationCap, countKey: 'STAGIIPEBUNE' },
    { id: 'JUNIORS_RO', label: 'Juniors.ro', icon: Briefcase, countKey: 'JUNIORS_RO' },
    { id: 'UNDELUCRAM', label: 'UndeLucram.ro', icon: Building2, countKey: 'UNDELUCRAM' },
    { id: 'EJOBS', label: 'eJobs.ro', icon: Layers, countKey: 'EJOBS' },
    { id: 'EU_TECH', label: 'GermanTechJobs (EU)', icon: Globe, countKey: 'EU_TECH' },
    { id: 'GREENHOUSE', label: 'Greenhouse ATS', icon: ShieldCheck, countKey: 'GREENHOUSE' },
    { id: 'ASHBY', label: 'AshbyHQ ATS', icon: Zap, countKey: 'ASHBY' },
    { id: 'SMARTRECRUITERS', label: 'SmartRecruiters', icon: Building2, countKey: 'SMARTRECRUITERS' },
    { id: 'REMOTIVE', label: 'Remotive Global', icon: Globe, countKey: 'REMOTIVE' },
    { id: 'WWR', label: 'WeWorkRemotely', icon: Globe, countKey: 'WWR' },
    { id: 'ARBEITNOW', label: 'Arbeitnow EU', icon: Cpu, countKey: 'ARBEITNOW' }
  ];

  // 27 SPECIALIZĂRI IT CUPRINZĂTOARE (FĂRĂ EMOTICOANE)
  const roleCategories = [
    { id: 'JAVA', label: 'Java Engineer', icon: Code2 },
    { id: 'BACKEND', label: 'Backend Engineer', icon: Server },
    { id: 'FULLSTACK', label: 'Full Stack Engineer', icon: Layers },
    { id: 'EMBEDDED_CPP', label: 'Embedded & C/C++', icon: Cpu },
    { id: 'IOS_SWIFT', label: 'iOS & Swift Developer', icon: Smartphone },
    { id: 'ANDROID', label: 'Android & Kotlin', icon: Smartphone },
    { id: 'GAME_DEV', label: 'Game Developer (Unity/Unreal)', icon: Flame },
    { id: 'AI_LLM', label: 'AI & LLM Engineer', icon: Bot },
    { id: 'ML_ENGINEER', label: 'Machine Learning & Deep Learning', icon: BrainCircuit },
    { id: 'DATA_ANALYST', label: 'Data Analyst', icon: LineChart },
    { id: 'DATA_SCIENTIST', label: 'Data Scientist', icon: Cpu },
    { id: 'DATA_ENGINEER', label: 'Data Engineer', icon: Database },
    { id: 'FRONTEND_REACT', label: 'Frontend / React Developer', icon: Terminal },
    { id: 'DEVOPS', label: 'DevOps & SRE', icon: Zap },
    { id: 'CLOUD_SECURITY', label: 'Cloud Security / Cyber', icon: Shield },
    { id: 'AUTOMATION_TEST', label: 'QA & Automation Testing', icon: CheckSquare },
    { id: 'SOLUTIONS_ARCHITECT', label: 'Cloud & Solutions Architect', icon: Network },
    { id: 'PRODUCT_MGMT', label: 'Product Manager (Tech)', icon: Users },
    { id: 'BUSINESS_ANALYST', label: 'Business Analyst / PO', icon: LineChart },
    { id: 'BI_ETL', label: 'BI, Tableau & PowerBI', icon: LineChart },
    { id: 'TECH_SUPPORT', label: 'Technical Support & Helpdesk', icon: HelpCircle },
    { id: 'SYSADMIN_NETWORK', label: 'SysAdmin & Network Engineer', icon: Network },
    { id: 'SCRUM_PM', label: 'Scrum Master & IT PM', icon: Users },
    { id: 'DBA_SQL', label: 'DBA & SQL Developer', icon: Database },
    { id: 'ERP_SAP_CRM', label: 'SAP, Salesforce & ERP', icon: FileCode2 },
    { id: 'UI_UX', label: 'UI/UX & Product Design', icon: Palette }
  ];

  // SUGESTII INTERACTIVE LA CĂUTARE DUPĂ CUVINTE CHEIE
  const keywordSuggestions = [
    { title: 'Java Developer', category: 'Backend' },
    { title: 'Spring Boot', category: 'Backend Framework' },
    { title: 'Backend Engineer', category: 'Software Engineering' },
    { title: 'Full Stack Engineer', category: 'Software Engineering' },
    { title: 'Frontend Developer', category: 'Web & UI' },
    { title: 'React Developer', category: 'Web Frontend' },
    { title: 'Python Developer', category: 'Data & Scripting' },
    { title: 'C++ / Embedded', category: 'Systems' },
    { title: 'DevOps Engineer', category: 'Cloud & Infra' },
    { title: 'Cloud Architect / AWS', category: 'Cloud' },
    { title: 'QA Automation', category: 'Testing' },
    { title: 'Data Analyst', category: 'Analytics' },
    { title: 'Data Engineer', category: 'Pipelines' },
    { title: 'Machine Learning / AI', category: 'AI & Data' },
    { title: 'Technical Support', category: 'Operations' },
    { title: 'Business Analyst IT', category: 'Product & Analysis' },
    { title: 'Cyber Security Analyst', category: 'Securitate' },
    { title: 'Android Developer', category: 'Mobile' },
    { title: 'iOS Developer', category: 'Mobile' },
    { title: 'SQL Developer / DBA', category: 'Baze de Date' }
  ];

  // SUGESTII INTERACTIVE LA CĂUTARE DUPĂ LOCAȚIE
  const locationSuggestions = [
    { name: 'București', region: 'România (Hub Principal)' },
    { name: 'Cluj-Napoca', region: 'România (Transilvania Tech)' },
    { name: 'Timișoara', region: 'România (Banat Tech)' },
    { name: 'Iași', region: 'România (Moldova Tech)' },
    { name: 'Brașov', region: 'România (Centru)' },
    { name: 'Sibiu', region: 'România (Transilvania)' },
    { name: 'Oradea', region: 'România (Bihor)' },
    { name: 'Craiova', region: 'România (Oltenia)' },
    { name: 'Remote România', region: 'Lucru la distanță (Companii RO)' },
    { name: 'Remote Europa', region: 'Lucru la distanță (Companii UE)' },
    { name: 'Germania', region: 'Europa Tech (GermanTechJobs)' },
    { name: 'Elveția', region: 'Europa Tech (SwissDevJobs)' },
    { name: 'Uniunea Europeană', region: 'Tech EU (Arbeitnow & Remotive)' }
  ];

  const fetchGlobalStats = async () => {
    try {
      const res = await fetch('/api/v1/jobs/stats');
      if (res.ok) {
        const data = await res.json();
        setGlobalStats(data);
      }
    } catch (err) {
      console.warn('Nu s-au putut încărca statisticile globale:', err);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword.trim()) params.append('keyword', keyword.trim());
      if (location.trim()) params.append('location', location.trim());
      if (selectedPlatforms.length > 0) {
        params.append('platform', selectedPlatforms.join(','));
      }
      if (selectedRoleCategories.length > 0) {
        params.append('roleCategory', selectedRoleCategories.join(','));
      }
      if (selectedLevel && selectedLevel !== 'ALL') params.append('level', selectedLevel);
      if (selectedWorkModel && selectedWorkModel !== 'ALL') params.append('workModel', selectedWorkModel);
      if (selectedDatePosted && selectedDatePosted !== 'ALL') params.append('datePosted', selectedDatePosted);
      if (selectedStatus && selectedStatus !== 'ALL') params.append('status', selectedStatus);
      else if (selectedStatus === 'ALL') params.append('status', 'ALL');
      if (sortBy) params.append('sortBy', sortBy);
      params.append('userId', activeUserId);

      const res = await fetch(`/api/v1/jobs/search?${params.toString()}`, {
        headers: { 'X-User-Id': activeUserId }
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Eroare la preluarea joburilor:', err);
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
        setToastMessage(`Sincronizare Reușită! ${data.totalLiveJobs || '1500+'} joburi agregate și actualizate.`);
        setSecondsUntilSync(3600);
        setTimeout(() => setToastMessage(null), 4500);
      }
    } catch (err) {
      console.warn('Sync live warn:', err);
    } finally {
      fetchJobs();
      fetchGlobalStats();
    }
  };

  const handleResetFilters = () => {
    setKeyword('');
    setLocation('');
    setSelectedPlatforms([]);
    setSelectedRoleCategories([]);
    setSelectedDatePosted('ALL');
    setSelectedStatus('ACTIVE');
    setSelectedWorkModel('ALL');
    setSelectedLevel('ALL');
    setSelectedCompetitiveness('ALL');
    setSortBy('MATCH_AND_RECENCY');
    setCurrentPage(1);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (keyword.trim()) count++;
    if (location.trim()) count++;
    if (selectedPlatforms.length > 0) count += selectedPlatforms.length;
    if (selectedRoleCategories.length > 0) count += selectedRoleCategories.length;
    if (selectedDatePosted !== 'ALL') count++;
    if (selectedStatus !== 'ACTIVE') count++;
    if (selectedWorkModel !== 'ALL') count++;
    if (selectedLevel !== 'ALL') count++;
    if (selectedCompetitiveness !== 'ALL') count++;
    return count;
  }, [keyword, location, selectedPlatforms, selectedRoleCategories, selectedDatePosted, selectedStatus, selectedWorkModel, selectedLevel, selectedCompetitiveness]);

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  // Căutare debounced (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 300);
    return () => clearTimeout(timer);
  }, [
    keyword, 
    location, 
    selectedPlatforms, 
    selectedRoleCategories, 
    selectedDatePosted,
    selectedStatus,
    selectedWorkModel, 
    selectedLevel, 
    sortBy
  ]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setShowKeywordSuggestions(false);
    setShowLocationSuggestions(false);
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
        const nextSaved = new Set(savedJobIds).add(job.id);
        setSavedJobIds(nextSaved);
        try {
          localStorage.setItem('ats_saved_job_ids', JSON.stringify(Array.from(nextSaved)));
        } catch (e) {
          console.warn('Nu s-a putut salva în localStorage:', e);
        }

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

  // Parser uniform de salarii pentru sortare exactă pe client
  const parseSalaryForSort = (salaryRange) => {
    if (!salaryRange) return 0;
    const s = salaryRange.toLowerCase().replace(/\./g, '').replace(/,/g, '');
    const matches = s.match(/\d{3,6}/g);
    if (!matches) return 0;
    let maxVal = 0;
    for (const m of matches) {
      const v = parseFloat(m);
      if (v > maxVal && v < 500000) maxVal = v;
    }
    if (maxVal === 0) return 0;
    const isEur = s.includes('eur') || s.includes('€');
    const isChf = s.includes('chf');
    const isAnnual = s.includes('an') || s.includes('year') || maxVal > 35000;
    let monthly = isAnnual ? maxVal / 12 : maxVal;
    if (isEur) monthly *= 5.0;
    else if (isChf) monthly *= 5.2;
    return monthly;
  };

  // Filtrare & Sortare flexibilă pe client
  const filteredAndSortedJobs = useMemo(() => {
    let result = [...jobs];

    // Filtru status (ACTIVE / EXPIRED / ALL) pe client
    if (selectedStatus !== 'ALL') {
      result = result.filter(j => (j.status || 'ACTIVE') === selectedStatus);
    }

    // Filtru competitivitate pe client
    if (selectedCompetitiveness !== 'ALL') {
      result = result.filter(j => (j.competitiveness || 'MEDIUM') === selectedCompetitiveness);
    }

    // Filtru dată postare pe client pentru sincronizare instantanee
    if (selectedDatePosted !== 'ALL') {
      const maxDays = parseInt(selectedDatePosted, 10);
      if (!isNaN(maxDays)) {
        result = result.filter(j => (j.postedDaysAgo ?? 0) <= maxDays);
      }
    }

    result.sort((a, b) => {
      if (sortBy === 'POSTED_AT_DESC') {
        const dateA = a.postedAt ? new Date(a.postedAt).getTime() : 0;
        const dateB = b.postedAt ? new Date(b.postedAt).getTime() : 0;
        if (dateA !== dateB) return dateB - dateA;
        return (a.postedDaysAgo || 0) - (b.postedDaysAgo || 0);
      }
      if (sortBy === 'MATCH_SCORE') {
        const diff = b.atsMatchScore - a.atsMatchScore;
        if (diff !== 0) return diff;
        return (a.postedDaysAgo || 0) - (b.postedDaysAgo || 0);
      }
      if (sortBy === 'NEWEST') {
        const dateA = a.postedAt ? new Date(a.postedAt).getTime() : 0;
        const dateB = b.postedAt ? new Date(b.postedAt).getTime() : 0;
        if (dateA !== 0 && dateB !== 0 && dateA !== dateB) return dateB - dateA;
        const diff = (a.postedDaysAgo || 0) - (b.postedDaysAgo || 0);
        if (diff !== 0) return diff;
        return b.atsMatchScore - a.atsMatchScore;
      }
      if (sortBy === 'SALARY_DESC') {
        const salA = parseSalaryForSort(a.salaryRange);
        const salB = parseSalaryForSort(b.salaryRange);
        if (salA !== salB) return salB - salA;
        return b.atsMatchScore - a.atsMatchScore;
      }
      if (sortBy === 'LOW_COMPETITION') {
        const compOrder = { 'LOW': 0, 'MEDIUM': 1, 'HIGH': 2 };
        const compA = compOrder[a.competitiveness] ?? 1;
        const compB = compOrder[b.competitiveness] ?? 1;
        if (compA !== compB) return compA - compB;
        return b.atsMatchScore - a.atsMatchScore;
      }
      if (sortBy === 'JUNIOR_FIRST') {
        const lvlOrder = { 'INTERNSHIP': 0, 'JUNIOR': 1, 'MID': 2, 'SENIOR': 3 };
        const lvlA = lvlOrder[a.experienceLevel] ?? 2;
        const lvlB = lvlOrder[b.experienceLevel] ?? 2;
        if (lvlA !== lvlB) return lvlA - lvlB;
        return b.atsMatchScore - a.atsMatchScore;
      }
      if (sortBy === 'COMPANY_AZ') {
        return (a.companyName || '').localeCompare(b.companyName || '');
      }
      // Implicit: MATCH_AND_RECENCY (Pondere: 70% ATS Match + 30% Recență)
      const recencyA = Math.max(0, 30 - (a.postedDaysAgo || 0));
      const recencyB = Math.max(0, 30 - (b.postedDaysAgo || 0));
      const totalA = (a.atsMatchScore * 0.70) + (recencyA * 0.30);
      const totalB = (b.atsMatchScore * 0.70) + (recencyB * 0.30);
      return totalB - totalA;
    });

    return result;
  }, [jobs, selectedCompetitiveness, selectedDatePosted, selectedStatus, sortBy]);

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
      case 'DEVJOB_RO':
        return { label: 'DevJob.ro', bg: 'bg-emerald-50 text-emerald-950 border-emerald-300', dot: 'bg-emerald-600' };
      case 'HIPO':
        return { label: 'Hipo.ro Trainee', bg: 'bg-amber-50 text-amber-950 border-amber-300', dot: 'bg-amber-600' };
      case 'EU_TECH':
        return { label: 'GermanTechJobs (EU)', bg: 'bg-sky-50 text-sky-950 border-sky-300', dot: 'bg-sky-600' };
      case 'LINKEDIN':
        return { label: 'LinkedIn Jobs', bg: 'bg-blue-50 text-blue-900 border-blue-300', dot: 'bg-blue-600' };
      case 'STAGIIPEBUNE':
        return { label: 'StagiiPeBune.ro', bg: 'bg-teal-50 text-teal-900 border-teal-300', dot: 'bg-teal-500' };
      case 'JUNIORS_RO':
        return { label: 'Juniors.ro', bg: 'bg-indigo-50 text-indigo-900 border-indigo-300', dot: 'bg-indigo-500' };
      case 'EJOBS':
        return { label: 'eJobs.ro', bg: 'bg-orange-50 text-orange-900 border-orange-300', dot: 'bg-orange-600' };
      case 'UNDELUCRAM':
        return { label: 'UndeLucram.ro', bg: 'bg-cyan-50 text-cyan-900 border-cyan-300', dot: 'bg-cyan-600' };
      case 'GREENHOUSE':
        return { label: 'Greenhouse ATS', bg: 'bg-purple-50 text-purple-900 border-purple-300', dot: 'bg-purple-600' };
      case 'ASHBY':
        return { label: 'AshbyHQ ATS', bg: 'bg-violet-50 text-violet-900 border-violet-300', dot: 'bg-violet-600' };
      case 'SMARTRECRUITERS':
        return { label: 'SmartRecruiters', bg: 'bg-teal-50 text-teal-900 border-teal-300', dot: 'bg-teal-600' };
      case 'REMOTIVE':
        return { label: 'Remotive Global', bg: 'bg-rose-50 text-rose-900 border-rose-300', dot: 'bg-rose-500' };
      case 'WWR':
        return { label: 'WeWorkRemotely', bg: 'bg-emerald-50 text-emerald-950 border-emerald-300', dot: 'bg-emerald-600' };
      case 'ARBEITNOW':
        return { label: 'Arbeitnow EU', bg: 'bg-slate-100 text-slate-900 border-slate-300', dot: 'bg-slate-600' };
      default:
        return { label: platform, bg: 'bg-gray-100 text-gray-800 border-gray-300', dot: 'bg-gray-500' };
    }
  };

  // INDICATOR PROFESIONAL DE COMPETITIVITATE (FĂRĂ EMOTICOANE)
  const renderCompetitivenessBadge = (job) => {
    const comp = job.competitiveness || 'MEDIUM';
    if (comp === 'LOW') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Competiție Redusă (Sub 25 aplicanți)</span>
        </span>
      );
    }
    if (comp === 'HIGH') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-50 text-rose-900 border border-rose-300 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>Competiție Ridicată (100+ aplicanți)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-950 border border-amber-300 shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
        <span>Competiție Medie (25-50 aplicanți)</span>
      </span>
    );
  };

  // Handlers pentru Multi-Select Platforme
  const togglePlatform = (id) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(id)) {
        return prev.filter(p => p !== id);
      } else {
        return [...prev, id];
      }
    });
    setCurrentPage(1);
  };

  const selectAllPlatforms = () => {
    setSelectedPlatforms(platformsConfig.map(p => p.id));
    setCurrentPage(1);
  };

  const clearAllPlatforms = () => {
    setSelectedPlatforms([]);
    setCurrentPage(1);
  };

  // Handlers pentru Multi-Select Specializări
  const toggleRoleCategory = (id) => {
    setSelectedRoleCategories(prev => {
      if (prev.includes(id)) {
        return prev.filter(r => r !== id);
      } else {
        return [...prev, id];
      }
    });
    setCurrentPage(1);
  };

  const selectAllRoles = () => {
    setSelectedRoleCategories(roleCategories.map(r => r.id));
    setCurrentPage(1);
  };

  const clearAllRoles = () => {
    setSelectedRoleCategories([]);
    setCurrentPage(1);
  };

  // Filtrare sugestii la tastare
  const filteredKeywordSuggestions = useMemo(() => {
    if (!keyword.trim()) return keywordSuggestions.slice(0, 8);
    const q = keyword.toLowerCase();
    return keywordSuggestions.filter(s => 
      s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    );
  }, [keyword]);

  const filteredLocationSuggestions = useMemo(() => {
    if (!location.trim()) return locationSuggestions.slice(0, 8);
    const q = location.toLowerCase();
    return locationSuggestions.filter(s => 
      s.name.toLowerCase().includes(q) || s.region.toLowerCase().includes(q)
    );
  }, [location]);

  // Platforme filtrate în dropdown
  const filteredPlatformsList = useMemo(() => {
    if (!platformSearchQuery.trim()) return platformsConfig;
    const q = platformSearchQuery.toLowerCase();
    return platformsConfig.filter(p => p.label.toLowerCase().includes(q));
  }, [platformSearchQuery]);

  // Specializări filtrate în dropdown
  const filteredRolesList = useMemo(() => {
    if (!roleSearchQuery.trim()) return roleCategories;
    const q = roleSearchQuery.toLowerCase();
    return roleCategories.filter(r => r.label.toLowerCase().includes(q));
  }, [roleSearchQuery]);

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
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-emerald-50 text-emerald-900 border border-emerald-300">
                14 Platforme Sursă (România & Europa)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-blue-50 text-blue-900 border border-blue-300">
                Scor ATS Ponderat pe Skills & Experiență
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-indigo-50 text-indigo-900 border border-indigo-300">
                Filtrare Multi-Platformă & Multi-Specializare
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
              Căutare & Agregator Job-uri Multi-Platformă
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 font-medium max-w-3xl leading-relaxed">
              Explorează oportunități agregate direct din 14 surse reale verificate: DevJob.ro, LinkedIn, Hipo.ro, StagiiPeBune, Juniors.ro, UndeLucram, eJobs, GermanTechJobs (EU), Greenhouse, Ashby, SmartRecruiters, Remotive, WeWorkRemotely și Arbeitnow.
            </p>
          </div>

          {/* TIMER DE SINCRONIZARE AUTOMATĂ ORARĂ & BUTON REFRESH */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start md:self-auto">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-700">
              <Clock className="w-4 h-4 text-indigo-600" />
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

      {/* CĂUTARE & FILTRE MULTI-SELECT CU AUTOCOMPLETE */}
      <div className="bg-white border border-gray-200/90 shadow-sm p-6 rounded-3xl space-y-5">
        
        {/* BARA PRINCIPALĂ DE CĂUTARE CU AUTOCOMPLETE */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* CÂMP CĂUTARE KEYWORD CU RECOMANDĂRI */}
          <div className="relative md:col-span-6" ref={keywordInputRef}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setShowKeywordSuggestions(true);
              }}
              onFocus={() => setShowKeywordSuggestions(true)}
              placeholder="Titlu rol, tehnologii (Java, Spring Boot, React, Python, C++, QA, DevOps)..."
              className="w-full pl-11 pr-9 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => { setKeyword(''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* POPUP SUGESTII INTERACTIVE KEYWORD */}
            {showKeywordSuggestions && filteredKeywordSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl z-40 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="px-3.5 py-2 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                  <span>Recomandări Căutare IT</span>
                  <span className="text-[10px] font-normal lowercase text-gray-400">apasă pentru selectare</span>
                </div>
                <div className="max-h-64 overflow-y-auto p-1.5 divide-y divide-gray-50">
                  {filteredKeywordSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setKeyword(item.title);
                        setShowKeywordSuggestions(false);
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-indigo-50/70 transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-600" />
                        <span className="text-xs font-bold text-gray-900 group-hover:text-indigo-950">
                          {item.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 group-hover:bg-indigo-100 group-hover:text-indigo-900 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CÂMP CĂUTARE LOCAȚIE CU RECOMANDĂRI */}
          <div className="relative md:col-span-4" ref={locationInputRef}>
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setShowLocationSuggestions(true);
              }}
              onFocus={() => setShowLocationSuggestions(true)}
              placeholder="Locație (București, Cluj, Timișoara, Remote, Europa)..."
              className="w-full pl-11 pr-9 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
            />
            {location && (
              <button
                type="button"
                onClick={() => { setLocation(''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* POPUP SUGESTII INTERACTIVE LOCAȚIE */}
            {showLocationSuggestions && filteredLocationSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl z-40 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="px-3.5 py-2 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                  <span>Hub-uri & Regiuni IT</span>
                  <span className="text-[10px] font-normal lowercase text-gray-400">apasă pentru selectare</span>
                </div>
                <div className="max-h-64 overflow-y-auto p-1.5 divide-y divide-gray-50">
                  {filteredLocationSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setLocation(item.name);
                        setShowLocationSuggestions(false);
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-indigo-50/70 transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-600" />
                        <span className="text-xs font-bold text-gray-900 group-hover:text-indigo-950">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 group-hover:bg-indigo-100 group-hover:text-indigo-900 px-2 py-0.5 rounded-md truncate max-w-[180px]">
                        {item.region}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* BUTON CĂUTARE */}
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

        {/* GRID FILTRE AVANSATE: MULTI-SELECT DROPDOWNS & SELECTOARE PROFESIONALE */}
        <div className="pt-2 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3">
          
          {/* 1. DROPDOWN MULTI-SELECT PENTRU PLATFORME */}
          <div className="relative" ref={platformDropdownRef}>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
              <Globe className="w-3 h-3 text-gray-500" />
              <span>Platforme</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setIsPlatformDropdownOpen(prev => !prev);
                setIsRoleDropdownOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                selectedPlatforms.length > 0
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-950 shadow-2xs'
                  : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <Globe className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">
                  {selectedPlatforms.length === 0
                    ? 'Toate Platformele'
                    : selectedPlatforms.length === 1
                    ? platformsConfig.find(p => p.id === selectedPlatforms[0])?.label || '1 platformă'
                    : `${selectedPlatforms.length} platforme selectate`}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-500 shrink-0 transition-transform duration-200 ${isPlatformDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* MENIU DROPDOWN PLATFORME */}
            {isPlatformDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-2.5 border-b border-gray-100 space-y-2 bg-gray-50/80">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={platformSearchQuery}
                      onChange={(e) => setPlatformSearchQuery(e.target.value)}
                      placeholder="Filtrează platformă..."
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-extrabold px-1">
                    <button
                      type="button"
                      onClick={selectAllPlatforms}
                      className="text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      Selectează Toate
                    </button>
                    <button
                      type="button"
                      onClick={clearAllPlatforms}
                      className="text-gray-500 hover:text-rose-600 cursor-pointer"
                    >
                      Deselectează Toate
                    </button>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
                  {filteredPlatformsList.map((plat) => {
                    const Icon = plat.icon;
                    const isChecked = selectedPlatforms.includes(plat.id);
                    const count = globalStats.platformCounts?.[plat.countKey] ?? 0;

                    return (
                      <button
                        key={plat.id}
                        type="button"
                        onClick={() => togglePlatform(plat.id)}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                          isChecked 
                            ? 'bg-indigo-50/90 text-indigo-950 font-black' 
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition shrink-0 ${
                            isChecked 
                              ? 'bg-indigo-600 border-indigo-600 text-white' 
                              : 'border-gray-300 bg-white'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <Icon className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                          <span className="truncate">{plat.label}</span>
                        </div>
                        <span className="text-[10px] font-extrabold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full shrink-0">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 2. DROPDOWN MULTI-SELECT PENTRU SPECIALIZĂRI & ROLURI IT */}
          <div className="relative" ref={roleDropdownRef}>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
              <Layers className="w-3 h-3 text-gray-500" />
              <span>Specializare IT</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setIsRoleDropdownOpen(prev => !prev);
                setIsPlatformDropdownOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                selectedRoleCategories.length > 0
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-950 shadow-2xs'
                  : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <Layers className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">
                  {selectedRoleCategories.length === 0
                    ? 'Toate Specializările'
                    : selectedRoleCategories.length === 1
                    ? roleCategories.find(r => r.id === selectedRoleCategories[0])?.label || '1 rol'
                    : `${selectedRoleCategories.length} roluri selectate`}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-500 shrink-0 transition-transform duration-200 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* MENIU DROPDOWN SPECIALIZĂRI */}
            {isRoleDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-2.5 border-b border-gray-100 space-y-2 bg-gray-50/80">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={roleSearchQuery}
                      onChange={(e) => setRoleSearchQuery(e.target.value)}
                      placeholder="Filtrează rol (Java, DevOps, etc.)..."
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-extrabold px-1">
                    <button
                      type="button"
                      onClick={selectAllRoles}
                      className="text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      Selectează Toate
                    </button>
                    <button
                      type="button"
                      onClick={clearAllRoles}
                      className="text-gray-500 hover:text-rose-600 cursor-pointer"
                    >
                      Deselectează Toate
                    </button>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
                  {filteredRolesList.map((cat) => {
                    const Icon = cat.icon;
                    const isChecked = selectedRoleCategories.includes(cat.id);

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleRoleCategory(cat.id)}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                          isChecked 
                            ? 'bg-indigo-50/90 text-indigo-950 font-black' 
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition shrink-0 ${
                            isChecked 
                              ? 'bg-indigo-600 border-indigo-600 text-white' 
                              : 'border-gray-300 bg-white'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <Icon className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                          <span className="truncate">{cat.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. FILTRU NOU: DATA POSTĂRII */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-gray-500" />
              <span>Data Postării</span>
            </label>
            <select
              value={selectedDatePosted}
              onChange={(e) => { setSelectedDatePosted(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
            >
              <option value="ALL">Oricând</option>
              <option value="1">Ultimele 24 de ore (1 zi)</option>
              <option value="3">Ultimele 3 zile</option>
              <option value="7">Ultimele 7 zile (1 săptămână)</option>
              <option value="14">Ultimele 14 zile (2 săptămâni)</option>
              <option value="30">Ultimele 30 de zile (1 lună)</option>
            </select>
          </div>

          {/* 4. NIVEL EXPERIENȚĂ (FĂRĂ EMOTICOANE) */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
              <GraduationCap className="w-3 h-3 text-gray-500" />
              <span>Nivel Experiență</span>
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => { setSelectedLevel(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
            >
              <option value="ALL">Toate Nivelurile</option>
              <option value="INTERNSHIP">Internship / Stagiu</option>
              <option value="JUNIOR">Junior (0-2 ani)</option>
              <option value="MID">Mid-Level (2-4 ani)</option>
              <option value="SENIOR">Senior / Lead (5+ ani)</option>
            </select>
          </div>

          {/* 5. MOD DE LUCRU (FĂRĂ EMOTICOANE) */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-gray-500" />
              <span>Mod de Lucru</span>
            </label>
            <select
              value={selectedWorkModel}
              onChange={(e) => { setSelectedWorkModel(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
            >
              <option value="ALL">Toate Modurile</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hibrid</option>
              <option value="ONSITE">On-Site</option>
            </select>
          </div>

          {/* 6. COMPETITIVITATE & ȘANSE (FĂRĂ EMOTICOANE) */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
              <Users className="w-3 h-3 text-gray-500" />
              <span>Competiție</span>
            </label>
            <select
              value={selectedCompetitiveness}
              onChange={(e) => { setSelectedCompetitiveness(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
            >
              <option value="ALL">Toate Tipurile</option>
              <option value="LOW">Competiție Redusă (Sub 25)</option>
              <option value="MEDIUM">Competiție Medie (25-50)</option>
              <option value="HIGH">Competiție Ridicată (100+)</option>
            </select>
          </div>

          {/* 7. STATUS JOB & LIFECYCLE (ACTIVE / EXPIRED / TOATE) */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-gray-500" />
              <span>Status Job</span>
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
            >
              <option value="ACTIVE">Doar Active (Recente)</option>
              <option value="EXPIRED">Expirate / Inactive</option>
              <option value="ALL">Toate Statusurile</option>
            </select>
          </div>

        </div>

        {/* BARA DE SORTARE PROFESIONALĂ (FĂRĂ EMOTICOANE) */}
        <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              Criteriu de Sortare:
            </span>
          </div>

          <div className="sm:w-72">
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-indigo-50 border border-indigo-200 text-indigo-950 font-black rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer shadow-2xs"
            >
              <option value="MATCH_AND_RECENCY">Recomandate (Scor ATS & Recență)</option>
              <option value="POSTED_AT_DESC">Dată Exactă Postare (Cele mai noi)</option>
              <option value="MATCH_SCORE">Scor ATS Maxim</option>
              <option value="NEWEST">Cele Mai Noi (Zile)</option>
              <option value="SALARY_DESC">Salariu Descrescător</option>
              <option value="LOW_COMPETITION">Competiție Redusă Prioritar</option>
              <option value="JUNIOR_FIRST">Juniori & Stagii Prioritar</option>
              <option value="COMPANY_AZ">Nume Companie (A - Z)</option>
            </select>
          </div>
        </div>

      </div>

      {/* BARA DE FILTRE ACTIVE CU RESET RAPID */}
      {activeFiltersCount > 0 && (
        <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              Filtre Active ({activeFiltersCount}):
            </span>

            {keyword && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-white text-gray-800 border border-gray-200 shadow-2xs">
                <span>Cuvânt: <strong>"{keyword}"</strong></span>
                <button onClick={() => setKeyword('')} className="hover:text-rose-600 cursor-pointer p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {location && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-white text-gray-800 border border-gray-200 shadow-2xs">
                <span>Locație: <strong>"{location}"</strong></span>
                <button onClick={() => setLocation('')} className="hover:text-rose-600 cursor-pointer p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedPlatforms.map(platId => {
              const p = platformsConfig.find(item => item.id === platId);
              return (
                <span key={platId} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-white text-gray-800 border border-gray-200 shadow-2xs">
                  <span>Platformă: <strong>{p?.label || platId}</strong></span>
                  <button onClick={() => togglePlatform(platId)} className="hover:text-rose-600 cursor-pointer p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}

            {selectedRoleCategories.map(roleId => {
              const r = roleCategories.find(item => item.id === roleId);
              return (
                <span key={roleId} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-white text-gray-800 border border-gray-200 shadow-2xs">
                  <span>Rol: <strong>{r?.label || roleId}</strong></span>
                  <button onClick={() => toggleRoleCategory(roleId)} className="hover:text-rose-600 cursor-pointer p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}

            {selectedDatePosted !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-white text-gray-800 border border-gray-200 shadow-2xs">
                <span>Dată: <strong>Ultimele {selectedDatePosted} zile</strong></span>
                <button onClick={() => setSelectedDatePosted('ALL')} className="hover:text-rose-600 cursor-pointer p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedLevel !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-white text-gray-800 border border-gray-200 shadow-2xs">
                <span>Nivel: <strong>{selectedLevel}</strong></span>
                <button onClick={() => setSelectedLevel('ALL')} className="hover:text-rose-600 cursor-pointer p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedWorkModel !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-white text-gray-800 border border-gray-200 shadow-2xs">
                <span>Mod: <strong>{selectedWorkModel}</strong></span>
                <button onClick={() => setSelectedWorkModel('ALL')} className="hover:text-rose-600 cursor-pointer p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedCompetitiveness !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-white text-gray-800 border border-gray-200 shadow-2xs">
                <span>Competiție: <strong>{selectedCompetitiveness}</strong></span>
                <button onClick={() => setSelectedCompetitiveness('ALL')} className="hover:text-rose-600 cursor-pointer p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedStatus !== 'ACTIVE' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-white text-gray-800 border border-gray-200 shadow-2xs">
                <span>Status: <strong>{selectedStatus === 'EXPIRED' ? 'Expirate / Inactive' : 'Toate Statusurile'}</strong></span>
                <button onClick={() => setSelectedStatus('ACTIVE')} className="hover:text-rose-600 cursor-pointer p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <button
            onClick={handleResetFilters}
            className="text-xs font-extrabold text-indigo-700 hover:text-indigo-900 bg-white hover:bg-indigo-50 border border-indigo-200 px-3.5 py-2 rounded-xl transition cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Resetează Toate Filtrele</span>
          </button>
        </div>
      )}

      {/* HEADER REZULTATE CU STATISTICI & CONTROALE DE PAGINARE */}
      <div ref={jobsListRef} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-gray-900">
            {loading ? 'Se caută...' : `${totalJobs} Oportunități Găsite`}
          </span>
          <span className="text-xs font-semibold text-gray-500">
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

      {/* LISTA DE JOB-URI */}
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
            Încearcă să relaxezi selecția de platforme sau să schimbi termenul de căutare.
          </p>
          <button
            onClick={handleResetFilters}
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

            return (
              <div 
                key={job.id} 
                className="bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 rounded-3xl p-5 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3.5">
                  
                  {/* TOP HEADER: PLATFORMĂ, STATUS & SCOR MATCH DINAMIC */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${platformBadge.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${platformBadge.dot}`}></span>
                        {platformBadge.label}
                      </span>
                      {job.status === 'EXPIRED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-800 border border-rose-200">
                          Expirat
                        </span>
                      )}
                    </div>

                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black border ${
                      job.atsMatchScore >= 80 
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
                        : job.atsMatchScore >= 50 
                        ? 'bg-amber-50 text-amber-900 border-amber-300' 
                        : 'bg-rose-50 text-rose-900 border-rose-300'
                    }`}>
                      <Sparkles className={`w-3 h-3 ${job.atsMatchScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`} />
                      <span>{job.atsMatchScore.toFixed(1)}% Match</span>
                    </div>
                  </div>

                  {/* LOGO & TITLU */}
                  <div 
                    onClick={() => setSelectedJobForDetails(job)}
                    className="flex items-start gap-3 cursor-pointer group/title"
                    title="Apasă pentru a deschide fișa completă a postului"
                  >
                    <img 
                      src={job.companyLogoUrl} 
                      alt={job.companyName}
                      className="w-12 h-12 rounded-2xl object-cover bg-gray-50 border border-gray-200/70 shrink-0 shadow-2xs group-hover/title:scale-105 transition"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-extrabold text-gray-950 leading-snug line-clamp-2 group-hover/title:text-indigo-600 transition">
                        {job.jobTitle}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold truncate">
                        <Building2 className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                        <span className="truncate">{job.companyName}</span>
                      </div>
                    </div>
                  </div>

                  {/* BADGE-URI DE META-DATE: LOCAȚIE, MOD, NIVEL (FĂRĂ EMOTICOANE) */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-gray-600">
                    <span className="px-2 py-0.5 bg-gray-100 rounded-lg flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {job.location}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded-lg">
                      {job.workModel === 'REMOTE' ? 'Remote' : job.workModel === 'HYBRID' ? 'Hibrid' : 'On-Site'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg ${
                      job.experienceLevel === 'INTERNSHIP' ? 'bg-emerald-100 text-emerald-950 font-extrabold' :
                      job.experienceLevel === 'JUNIOR' ? 'bg-indigo-100 text-indigo-950 font-extrabold' :
                      job.experienceLevel === 'SENIOR' ? 'bg-purple-100 text-purple-950 font-extrabold' :
                      'bg-gray-100 text-gray-900'
                    }`}>
                      {job.experienceLevel === 'INTERNSHIP' ? 'Internship / Stagiu' :
                       job.experienceLevel === 'JUNIOR' ? 'Junior (0-2 ani)' :
                       job.experienceLevel === 'SENIOR' ? 'Senior' : 'Mid-Level'}
                    </span>
                  </div>

                  {/* INDICATOR DE COMPETITIVITATE & NUMĂR DE CANDIDAȚI (FĂRĂ EMOTICOANE) */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {renderCompetitivenessBadge(job)}

                    {job.applicantCountText && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-50 text-gray-700 border border-gray-200">
                        <Users className="w-3 h-3 text-gray-500" />
                        <span>{job.applicantCountText}</span>
                      </span>
                    )}
                  </div>

                  {/* SALARIU & DATA EXACTĂ POSTĂRII */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 text-gray-600 font-medium">
                    <span className="font-extrabold text-gray-900">
                      {job.salaryRange}
                    </span>
                    <span 
                      className="flex items-center gap-1 text-gray-500 text-[11px]"
                      title={job.postedAt ? `Publicat la: ${new Date(job.postedAt).toLocaleString('ro-RO')}` : undefined}
                    >
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {formatExactDate(job.postedAt, job.postedDaysAgo)}
                    </span>
                  </div>

                  {/* SKILLS REQUIRED & MATCHING */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {job.skillsRequired.slice(0, 4).map((s, idx) => {
                      const isMatched = job.matchingSkills && job.matchingSkills.includes(s);
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

                  {/* BUTOANE: VEZI FIȘA COMPLETĂ & AUDIT MODIFICĂRI */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedJobForDetails(job)}
                      className="flex-1 py-2.5 px-3 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-950 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer border border-indigo-200/80 shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Vezi Fișa Completă</span>
                    </button>
                    <button
                      onClick={() => handleOpenAuditModal(job)}
                      className="py-2.5 px-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-indigo-600 rounded-2xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer border border-gray-200 shadow-2xs"
                      title="Istoric modificări & audit pipeline"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[11px]">Istoric</span>
                    </button>
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

      {/* MODAL DETALII COMPLETE JOB */}
      {selectedJobForDetails && (
        <JobDetailModal
          job={selectedJobForDetails}
          onClose={() => setSelectedJobForDetails(null)}
          onSaveToKanban={handleSaveToKanban}
          isSaved={savedJobIds.has(selectedJobForDetails.id)}
          isSaving={savingJobId === selectedJobForDetails.id}
          activeUserId={activeUserId}
        />
      )}

      {/* MODAL AUDIT LIFECYCLE & ISTORIC MODIFICĂRI */}
      {auditJobForChanges && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-950">
                    Istoric & Audit Pipeline
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Monitorizare modificări de conținut & ciclu de viață
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAuditJobForChanges(null)}
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Job Info Summary */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-extrabold text-sm text-gray-950">
                      {auditJobForChanges.jobTitle}
                    </div>
                    <div className="text-xs font-semibold text-gray-600 flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      <span>{auditJobForChanges.companyName}</span>
                      <span>•</span>
                      <span>{auditJobForChanges.sourcePlatform}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border shrink-0 ${
                    auditJobForChanges.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      : 'bg-rose-50 text-rose-900 border-rose-300'
                  }`}>
                    {auditJobForChanges.status === 'ACTIVE' ? 'Activ' : 'Expirat / Inactiv'}
                  </span>
                </div>

                {/* Content Hash & Timestamps */}
                <div className="pt-2 border-t border-gray-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-gray-500 font-semibold block">Data Reală Publicare:</span>
                    <span className="font-bold text-gray-900 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {formatDateTime(auditJobForChanges.postedAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-semibold block">Ultima Verificare (Crawl):</span>
                    <span className="font-bold text-gray-900 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {formatDateTime(auditJobForChanges.lastSeenAt || auditJobForChanges.firstSeenAt)}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-500 font-semibold block">Content Hash (SHA-256):</span>
                    <code className="font-mono text-[10px] bg-white px-2 py-1 rounded-lg border border-gray-200 block truncate mt-0.5 text-gray-800 select-all">
                      {auditJobForChanges.contentHash || 'Neindexat'}
                    </code>
                  </div>
                </div>
              </div>

              {/* Timeline of Changes */}
              <div className="space-y-2">
                <div className="font-bold text-xs uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                  <GitCommit className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Jurnal Modificări Înregistrate ({jobChangesList.length})</span>
                </div>

                {loadingChanges ? (
                  <div className="py-8 text-center text-gray-500 space-y-2">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-600" />
                    <p className="font-medium">Se încarcă jurnalul de modificări...</p>
                  </div>
                ) : jobChangesList.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center text-gray-500 space-y-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                    <p className="font-bold text-gray-800">Nicio modificare ulterioară</p>
                    <p className="text-[11px]">
                      Jobul a fost indexat inițial și conținutul nu a suferit modificări între crawl-uri.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                    {jobChangesList.map((ch, idx) => {
                      const typeConfig = {
                        CREATED: { label: 'Descoperit & Indexat', bg: 'bg-emerald-50 text-emerald-900 border-emerald-300', dot: 'bg-emerald-500' },
                        CONTENT_UPDATED: { label: 'Conținut Modificat', bg: 'bg-blue-50 text-blue-900 border-blue-300', dot: 'bg-blue-500' },
                        EXPIRED: { label: 'Marcat ca Expirat', bg: 'bg-rose-50 text-rose-900 border-rose-300', dot: 'bg-rose-500' },
                        REACTIVATED: { label: 'Reactivat la Recrawling', bg: 'bg-amber-50 text-amber-900 border-amber-300', dot: 'bg-amber-500' }
                      }[ch.changeType] || { label: ch.changeType, bg: 'bg-gray-100 text-gray-800 border-gray-200', dot: 'bg-gray-400' };

                      return (
                        <div key={ch.id || idx} className="relative pl-7 flex items-start justify-between gap-3 group">
                          <div className={`absolute left-2.5 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ring-1 ring-gray-300 ${typeConfig.dot}`}></div>
                          <div className="flex-1 bg-white p-2.5 rounded-xl border border-gray-200/80 shadow-2xs space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${typeConfig.bg}`}>
                                {typeConfig.label}
                              </span>
                              <span className="text-[10px] text-gray-500 font-medium">
                                {formatDateTime(ch.changedAt)}
                              </span>
                            </div>
                            {ch.newHash && (
                              <div className="font-mono text-[9px] text-gray-500 truncate" title={`Hash nou: ${ch.newHash}`}>
                                Hash: {ch.newHash.substring(0, 16)}...
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button
                onClick={() => setAuditJobForChanges(null)}
                className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
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
