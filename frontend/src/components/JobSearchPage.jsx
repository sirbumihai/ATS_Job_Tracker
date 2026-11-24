import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  createPortal
} from 'react-dom';
import {
  Search,
  MapPin,
  Building2,
  Briefcase,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Filter,
  RefreshCw,
  Layers,
  Globe,
  Zap,
  GraduationCap,
  ShieldCheck,
  Clock,
  ChevronDown,
  ArrowUpRight,
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
  FileText,
  Check,
  Calendar,
  History,
  GitCommit,
  Download,
  FolderKanban,
  FileSignature
} from 'lucide-react';
import { JOB_PLATFORMS, platformSiteName } from '../data/jobPlatforms';
import Card from './ui/Card';
import PageHeader from './ui/PageHeader';
import JobDetailModal from './JobDetailModal';

// Helper eliminare diacritice
const removeDiacritics = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/[aa]/g, 'a')
    .replace(/[AA]/g, 'A')
    .replace(/[i]/g, 'i')
    .replace(/[I]/g, 'I')
    .replace(/[ss]/g, 's')
    .replace(/[SS]/g, 'S')
    .replace(/[tt]/g, 't')
    .replace(/[TT]/g, 'T');
};

// Parser uniform de salarii pentru sortare exacta pe client
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

// Helper pentru extragerea timestamp-ului real de publicare (cu fallback transparent)
const getJobTimestamp = (job) => {
  if (!job) return 0;
  // 1. Data reala de publicare (daca este specificata in format ISO sau data valida)
  if (job.postedAt) {
    const t = new Date(job.postedAt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  // 2. Fallback daca avem numar de zile valid (postedDaysAgo >= 0)
  if (job.postedDaysAgo !== undefined && job.postedDaysAgo !== null && job.postedDaysAgo >= 0) {
    return Date.now() - (job.postedDaysAgo * 24 * 3600 * 1000);
  }
  // 3. Fallback exclusiv pentru anunturile fara data specificata (data descoperirii de crawler)
  if (job.firstSeenAt) {
    const t = new Date(job.firstSeenAt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  return 0;
};

// Verificare daca un job este cu adevarat NOU GASIT (descoperit recent SI publicat in ultimele 48h)
const isJobTrulyNew = (job) => {
  if (!job?.newlyDiscovered) return false;
  const ts = getJobTimestamp(job);
  return ts > 0 && (Date.now() - ts) <= 48 * 3600 * 1000;
};

export default function JobSearchPage({ 
  currentUser, 
  onSaveToKanbanSuccess, 
  onNavigateToStudio,
  onNavigateToKanban,
  onOpenCoverLetter
}) {
  const DEFAULT_USER_ID = '23fe8bdd-08f4-413d-9985-f99c21040b59';
  const activeUserId = currentUser?.userId || currentUser?.id || DEFAULT_USER_ID;

  // Search & Filter state
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]); // Array de platforme selectate (gol = Toate)
  const [selectedRoleCategories, setSelectedRoleCategories] = useState([]); // Array de roluri selectate (gol = Toate)
  const [selectedLevels, setSelectedLevels] = useState([]); // Array de nivele selectate (gol = Toate)
  const [selectedAtsScore, setSelectedAtsScore] = useState('ALL'); // ALL, TOP_80, TOP_60, TOP_40, UNDER_40
  const [selectedDatePosted, setSelectedDatePosted] = useState('ALL'); // ALL, 24H, 48H, 7D, 30D
  const [selectedStatus, setSelectedStatus] = useState('ACTIVE'); // ACTIVE, EXPIRED, ALL
  const [selectedWorkModel, setSelectedWorkModel] = useState('ALL');
  const [selectedCompetitiveness, setSelectedCompetitiveness] = useState('ALL');

  // Audit History state
  const [auditJobForChanges, setAuditJobForChanges] = useState(null);
  const [jobChangesList, setJobChangesList] = useState([]);
  const [loadingChanges, setLoadingChanges] = useState(false); 
  
  // Dropdown-uri deschise
  const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);
  const [platformSearchQuery, setPlatformSearchQuery] = useState('');
  const [roleSearchQuery, setRoleSearchQuery] = useState('');

  // Autocomplete sugestii cautare & locatie
  const [showKeywordSuggestions, setShowKeywordSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  // Paginare server-side
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState(null);
  
  // Statistici globale persistente (platforme & contoare)
  const [globalStats, setGlobalStats] = useState({
    platformCounts: {},
    summaryStats: { junior: 0, intern: 0, remote: 0, highChance: 0, newlyDiscovered: 0 },
    totalLiveJobs: 0
  });

  // Numar joburi noi identificate la ultima sincronizare si publicate recent (max 48h) din statisticile globale
  const newlyDiscoveredCount = useMemo(() => {
    return globalStats.summaryStats?.newlyDiscovered ?? 0;
  }, [globalStats]);

  // Persistenta jobs salvate in localStorage
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

  // Helper pentru calculul secundelor ramase pana la urmatoarea ora fixa (:00:00)
  // Nu se reseteaza la refresh deoarece este calculat direct din ceasul sistemului!
  const getSecondsUntilNextHour = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const elapsed = minutes * 60 + seconds;
    const remaining = 3600 - elapsed;
    return remaining > 0 ? remaining : 3600;
  };

  // Timer sincronizare automata orara la ora fixa (ex: 19:00, 20:00, 21:00)
  const [secondsUntilSync, setSecondsUntilSync] = useState(() => getSecondsUntilNextHour());
  const lastTriggeredHourRef = useRef(null);
  const jobsListRef = useRef(null);
  const platformDropdownRef = useRef(null);
  const roleDropdownRef = useRef(null);
  const levelDropdownRef = useRef(null);
  const keywordInputRef = useRef(null);
  const locationInputRef = useRef(null);

  // Inchidere click-outside pentru dropdown-uri si autocomplete
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (platformDropdownRef.current && !platformDropdownRef.current.contains(e.target)) {
        setIsPlatformDropdownOpen(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setIsRoleDropdownOpen(false);
      }
      if (levelDropdownRef.current && !levelDropdownRef.current.contains(e.target)) {
        setIsLevelDropdownOpen(false);
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
    const updateCountdown = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const remaining = getSecondsUntilNextHour();
      
      setSecondsUntilSync(remaining);

      // Cand se ajunge la ora fixa (:00:00 - :00:02) declansam auto-refresh o singura data pe ora
      if (now.getMinutes() === 0 && now.getSeconds() < 3 && lastTriggeredHourRef.current !== currentHour) {
        lastTriggeredHourRef.current = currentHour;
        fetchJobs();
        fetchGlobalStats();
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatExactDate = (postedAt, fallbackDaysAgo, postedDateAgo) => {
    if (postedDateAgo === 'Data nespecificata' || fallbackDaysAgo === -1 || (!postedAt && (fallbackDaysAgo === undefined || fallbackDaysAgo === null || fallbackDaysAgo < 0))) {
      return 'Data nespecificata';
    }
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
    if (fallbackDaysAgo !== null && fallbackDaysAgo !== undefined && fallbackDaysAgo >= 0) {
      if (fallbackDaysAgo === 0) return 'Astazi';
      if (fallbackDaysAgo === 1) return 'Ieri';
      return `Acum ${fallbackDaysAgo} zile`;
    }
    return 'Data nespecificata';
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
      console.warn('Eroare la preluarea istoricului de modificari:', err);
    } finally {
      setLoadingChanges(false);
    }
  };

  // Scroll lock & Escape key listener cand modalul de istoric/audit este deschis
  useEffect(() => {
    if (!auditJobForChanges || typeof document === 'undefined') return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setAuditJobForChanges(null);
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
  }, [auditJobForChanges]);

  // 4 NIVELURI DE EXPERIENTA PENTRU MULTI-SELECT
  const levelsConfig = [
    { id: 'INTERNSHIP', label: 'Internship / Stagiu' },
    { id: 'JUNIOR', label: 'Junior (0-2 ani)' },
    { id: 'MID', label: 'Mid-Level (2-4 ani)' },
    { id: 'SENIOR', label: 'Senior / Lead (5+ ani)' }
  ];

  const toggleLevel = (id) => {
    setSelectedLevels(prev => {
      if (prev.includes(id)) {
        return prev.filter(l => l !== id);
      } else {
        return [...prev, id];
      }
    });
    setCurrentPage(1);
  };

  const selectAllLevels = () => {
    setSelectedLevels(['INTERNSHIP', 'JUNIOR', 'MID', 'SENIOR']);
    setCurrentPage(1);
  };

  const clearAllLevels = () => {
    setSelectedLevels([]);
    setCurrentPage(1);
  };

  // PLATFORMELE REALE CU ICONITE SI CONTOARE PERMANENTE (FARA EMOTICOANE)
  const PLATFORM_ICONS = {
    DEVJOB_RO: Code2,
    LINKEDIN: ExternalLink,
    GITHUB_COMMUNITY: Globe,
    BESTJOBS: Briefcase,
    HIPO: GraduationCap,
    STAGIIPEBUNE: GraduationCap,
    JUNIORS_RO: Briefcase,
    UNDELUCRAM: Building2,
    EJOBS: Layers
  };
  const platformsConfig = JOB_PLATFORMS.map(p => ({ ...p, icon: PLATFORM_ICONS[p.id] || Briefcase, countKey: p.id }));

  // 27 SPECIALIZARI IT CUPRINZATOARE (FARA EMOTICOANE)
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
    { id: 'AUTOMATION_TEST', label: 'QA, Tester & Quality Assurance', icon: CheckSquare },
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

  // SUGESTII INTERACTIVE LA CAUTARE DUPA CUVINTE CHEIE
  const keywordSuggestions = [
    { title: 'Java Developer', category: 'Backend' },
    { title: 'Spring Boot', category: 'Backend Framework' },
    { title: 'Backend Engineer', category: 'Software Engineering' },
    { title: 'Full Stack Engineer', category: 'Software Engineering' },
    { title: 'Graduate Software Engineer', category: 'Software Engineering' },
    { title: 'Frontend Developer', category: 'Web & UI' },
    { title: 'React Developer', category: 'Web Frontend' },
    { title: 'Python Developer', category: 'Data & Scripting' },
    { title: 'C++ / Embedded', category: 'Systems' },
    { title: 'DevOps Engineer', category: 'Cloud & Infra' },
    { title: 'Cloud Architect / AWS', category: 'Cloud' },
    { title: 'QA Automation', category: 'Testing' },
    { title: 'Software Tester', category: 'Testing & QA' },
    { title: 'Junior Tester', category: 'Testing & QA' },
    { title: 'QA Tester', category: 'Testing & QA' },
    { title: 'Data Analyst', category: 'Analytics' },
    { title: 'Data Engineer', category: 'Pipelines' },
    { title: 'Machine Learning / AI', category: 'AI & Data' },
    { title: 'Technical Support', category: 'Operations & Support' },
    { title: 'IT Helpdesk & Service Desk', category: 'Operations & Support' },
    { title: 'Business Analyst IT', category: 'Product & Analysis' },
    { title: 'Cyber Security Analyst', category: 'Securitate' },
    { title: 'Android Developer', category: 'Mobile' },
    { title: 'iOS Developer', category: 'Mobile' },
    { title: 'SQL Developer / DBA', category: 'Baze de Date' }
  ];

  // SUGESTII INTERACTIVE LA CAUTARE DUPA LOCATIE
  const locationSuggestions = [
    { name: 'Bucuresti', region: 'România (Hub Principal)' },
    { name: 'Cluj-Napoca', region: 'România (Transilvania Tech)' },
    { name: 'Timisoara', region: 'România (Banat Tech)' },
    { name: 'Iasi', region: 'România (Moldova Tech)' },
    { name: 'Brasov', region: 'România (Centru)' },
    { name: 'Sibiu', region: 'România (Transilvania)' },
    { name: 'Oradea', region: 'România (Bihor)' },
    { name: 'Craiova', region: 'România (Oltenia)' },
    { name: 'Remote România', region: 'Lucru la distanță (Companii RO)' },
    { name: 'Romania', region: 'Toate orașele (Național)' },
    { name: 'Remote', region: 'Telemunca / WFH' },
    { name: 'Ploiesti', region: 'România (Muntenia)' },
    { name: 'Constanta', region: 'România (Dobrogea)' }
  ];

  const fetchGlobalStats = async () => {
    try {
      const res = await fetch('/api/v1/jobs/stats');
      if (res.ok) {
        const data = await res.json();
        setGlobalStats(data);
      }
    } catch (err) {
      console.warn('Nu s-au putut incarca statisticile globale:', err);
    }
  };

  const fetchJobs = async (targetPage = currentPage) => {
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
      if (selectedLevels.length > 0) params.append('level', selectedLevels.join(','));
      if (selectedWorkModel && selectedWorkModel !== 'ALL') params.append('workModel', selectedWorkModel);
      if (selectedDatePosted && selectedDatePosted !== 'ALL') {
        params.append('datePosted', selectedDatePosted);
        params.append('discovered', selectedDatePosted);
      }
      if (selectedStatus && selectedStatus !== 'ALL') params.append('status', selectedStatus);
      else if (selectedStatus === 'ALL') params.append('status', 'ALL');
      if (selectedCompetitiveness && selectedCompetitiveness !== 'ALL') {
        params.append('competitiveness', selectedCompetitiveness);
      }
      if (selectedAtsScore && selectedAtsScore !== 'ALL') {
        params.append('atsScore', selectedAtsScore);
      }
      params.append('userId', activeUserId);
      params.append('page', targetPage);
      params.append('size', pageSize);

      const res = await fetch(`/api/v1/jobs/search?${params.toString()}`, {
        headers: { 'X-User-Id': activeUserId }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setJobs(data);
          setTotalJobs(data.length);
          setTotalPages(Math.max(1, Math.ceil(data.length / pageSize)));
        } else {
          const list = data.content || data.jobs || [];
          setJobs(list);
          setTotalJobs(data.totalElements ?? list.length);
          setTotalPages(data.totalPages ?? Math.max(1, Math.ceil(list.length / pageSize)));
        }
        setCurrentPage(targetPage);
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
        setSecondsUntilSync(getSecondsUntilNextHour());
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
    setSelectedLevels([]);
    setSelectedAtsScore('ALL');
    setSelectedDatePosted('ALL');
    setSelectedStatus('ACTIVE');
    setSelectedWorkModel('ALL');
    setSelectedCompetitiveness('ALL');
    setCurrentPage(1);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (keyword.trim()) count++;
    if (location.trim()) count++;
    if (selectedPlatforms.length > 0) count += selectedPlatforms.length;
    if (selectedRoleCategories.length > 0) count += selectedRoleCategories.length;
    if (selectedLevels.length > 0) count += selectedLevels.length;
    if (selectedAtsScore !== 'ALL') count++;
    if (selectedDatePosted !== 'ALL') count++;
    if (selectedStatus !== 'ACTIVE') count++;
    if (selectedWorkModel !== 'ALL') count++;
    if (selectedCompetitiveness !== 'ALL') count++;
    return count;
  }, [keyword, location, selectedPlatforms, selectedRoleCategories, selectedLevels, selectedAtsScore, selectedDatePosted, selectedStatus, selectedWorkModel, selectedCompetitiveness]);

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  // Cautare debounced (300ms) - declanseaza cautarea pe server cu pagina 1 la orice modificare de filtru
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [
    keyword, 
    location, 
    selectedPlatforms, 
    selectedRoleCategories, 
    selectedLevels,
    selectedDatePosted,
    selectedStatus,
    selectedWorkModel,
    selectedCompetitiveness,
    selectedAtsScore,
    pageSize
  ]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setShowKeywordSuggestions(false);
    setShowLocationSuggestions(false);
    fetchJobs(1);
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
          console.warn('Nu s-a putut salva in localStorage:', e);
        }

        setToastMessage(`Jobul "${job.jobTitle}" la ${job.companyName} a fost adăugat direct la Aplicat în Tracker!`);
        setTimeout(() => setToastMessage(null), 4000);
        if (onSaveToKanbanSuccess) onSaveToKanbanSuccess();
      }
    } catch (err) {
      console.error('Eroare la salvarea in Kanban:', err);
    } finally {
      setSavingJobId(null);
    }
  };

  // EXPORT JOBURI CAUTATE IN FORMAT CSV (RFC 4180 + UTF-8 BOM)
  const handleExportJobsCsv = () => {
    if (!jobs || jobs.length === 0) {
      setToastMessage('Nu există joburi afișate de exportat.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const headers = [
      'Companie',
      'Titlu Job',
      'Platforma',
      'Locație',
      'Mod Lucru',
      'Salariu',
      'Nivel Experiență',
      'Scor Match ATS (%)',
      'Competitivitate',
      'Data Publicarii',
      'URL Anunt'
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = jobs.map(j => {
      const score = j.atsMatchScore !== undefined && j.atsMatchScore !== null ? Number(j.atsMatchScore).toFixed(0) : 'N/A';
      return [
        escapeCsv(j.companyName || ''),
        escapeCsv(j.jobTitle || ''),
        escapeCsv(j.sourcePlatform || ''),
        escapeCsv(j.location || ''),
        escapeCsv(j.workModel || ''),
        escapeCsv(j.salaryRange || 'Nespecificat'),
        escapeCsv(j.experienceLevel || ''),
        escapeCsv(score),
        escapeCsv(j.competitivenessLabel || j.competitiveness || ''),
        escapeCsv(j.postedDateAgo || (j.postedAt ? new Date(j.postedAt).toLocaleDateString('ro-RO') : '')),
        escapeCsv(j.directApplyUrl || '')
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.map(h => `"${h}"`).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `jobflow_joburi_gasite_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastMessage(`${jobs.length} job-uri au fost exportate cu succes în CSV!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Paginare server-side & indici de afisare
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + jobs.length, totalJobs);
  const currentJobs = jobs;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      fetchJobs(newPage);
      if (jobsListRef.current) {
        jobsListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // INDICATOR PROFESIONAL DE COMPETITIVITATE (MONOLITHIC ARCHITECTURAL DISTILL)
  const renderCompetitivenessBadge = (job) => {
    const comp = job.competitiveness || 'MEDIUM';
    if (comp === 'LOW') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Competiție Redusă</span>
        </span>
      );
    }
    if (comp === 'HIGH') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
          <span>Competiție Ridicată</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
        <span>Competiție Medie</span>
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

  // Handlers pentru Multi-Select Specializari
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

  // Platforme filtrate in dropdown
  const filteredPlatformsList = useMemo(() => {
    if (!platformSearchQuery.trim()) return platformsConfig;
    const q = platformSearchQuery.toLowerCase();
    return platformsConfig.filter(p => p.label.toLowerCase().includes(q));
  }, [platformSearchQuery]);

  // Specializari filtrate in dropdown
  const filteredRolesList = useMemo(() => {
    if (!roleSearchQuery.trim()) return roleCategories;
    const q = roleSearchQuery.toLowerCase();
    return roleCategories.filter(r => r.label.toLowerCase().includes(q));
  }, [roleSearchQuery]);

  return (
    <div className="space-y-5 w-full max-w-[1920px] mx-auto pb-16 font-sans text-neutral-900">
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-brand-500 text-white px-4 py-3 rounded-xl shadow-2xl border border-neutral-800 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
          {onNavigateToKanban && (
            <button 
              onClick={onNavigateToKanban}
              className="ml-2 px-2.5 py-1 bg-white text-neutral-900 text-xs font-semibold rounded-lg hover:bg-neutral-200 transition cursor-pointer"
            >
              Vezi în Tracker
            </button>
          )}
        </div>
      )}

      {/* HEADER DE PAGINA: TITLU, AUTO-REFRESH SI SINCRONIZARE */}
      <Card padding="px-5 py-4">
        <PageHeader
          as="h2"
          title="Joburi IT"
          subtitle="România și Europa, cu scor ATS pe fiecare job"
          actions={
            <>
              <span
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-neutral-50 rounded-xl text-xs text-neutral-600"
                title="Reîmprospătare automată din oră în oră"
              >
                <Clock className="w-3.5 h-3.5" />
                <span className="font-medium tabular-nums">{formatCountdown(secondsUntilSync)}</span>
              </span>
              <button
                onClick={handleSyncLive}
                disabled={loading}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sincronizează</span>
              </button>
            </>
          }
        />
      </Card>

      {/* CAUTARE & FILTRE MULTI-SELECT CU AUTOCOMPLETE */}
      <Card padding="p-5 sm:p-6" className="space-y-4">
        
        {/* BARA PRINCIPALA DE CAUTARE CU AUTOCOMPLETE */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* CAMP CAUTARE KEYWORD CU RECOMANDARI */}
          <div className="relative md:col-span-6" ref={keywordInputRef}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setShowKeywordSuggestions(true);
              }}
              onFocus={() => setShowKeywordSuggestions(true)}
              placeholder="Titlu rol, tehnologii (Java, Spring Boot, React, Python, C++, QA, DevOps)..."
              className="w-full pl-11 pr-9 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-brand-500 transition"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => { setKeyword(''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-brand-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* POPUP SUGESTII INTERACTIVE KEYWORD */}
            {showKeywordSuggestions && filteredKeywordSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-xl z-40 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="px-3.5 py-2 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between text-xs font-medium text-neutral-500">
                  <span>Recomandări Căutare IT</span>
                  <span className="text-[11px] font-normal lowercase text-neutral-400">selectează</span>
                </div>
                <div className="max-h-64 overflow-y-auto p-1.5 divide-y divide-neutral-100">
                  {filteredKeywordSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setKeyword(item.title);
                        setShowKeywordSuggestions(false);
                      }}
                      className="w-full px-3 py-2 text-left rounded-lg hover:bg-neutral-100 transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-neutral-400 group-hover:text-brand-600" />
                        <span className="text-xs sm:text-sm font-semibold text-neutral-900 group-hover:text-brand-600">
                          {item.title}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-neutral-500 bg-neutral-100 group-hover:bg-neutral-200 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CAMP CAUTARE LOCATIE CU RECOMANDARI */}
          <div className="relative md:col-span-4" ref={locationInputRef}>
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setShowLocationSuggestions(true);
              }}
              onFocus={() => setShowLocationSuggestions(true)}
              placeholder="Locație (București, Cluj, Timișoara, Remote, Europa)..."
              className="w-full pl-11 pr-9 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-brand-500 transition"
            />
            {location && (
              <button
                type="button"
                onClick={() => { setLocation(''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-brand-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* POPUP SUGESTII INTERACTIVE LOCATIE */}
            {showLocationSuggestions && filteredLocationSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-xl z-40 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="px-3.5 py-2 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between text-xs font-medium text-neutral-500">
                  <span>Hub-uri & Regiuni IT</span>
                  <span className="text-[11px] font-normal lowercase text-neutral-400">selectează</span>
                </div>
                <div className="max-h-64 overflow-y-auto p-1.5 divide-y divide-neutral-100">
                  {filteredLocationSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setLocation(item.name);
                        setShowLocationSuggestions(false);
                      }}
                      className="w-full px-3 py-2 text-left rounded-lg hover:bg-neutral-100 transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 group-hover:text-brand-600" />
                        <span className="text-xs sm:text-sm font-semibold text-neutral-900 group-hover:text-brand-600">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-neutral-500 bg-neutral-100 group-hover:bg-neutral-200 px-2 py-0.5 rounded-md truncate max-w-[180px]">
                        {item.region}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* BUTON CAUTARE */}
          <div className="md:col-span-2">
            <button 
              type="submit"
              disabled={loading}
              className="w-full h-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>Caută</span>
            </button>
          </div>
        </form>

        {/* GRID FILTRE AVANSATE: MULTI-SELECT DROPDOWNS & SELECTOARE PROFESIONALE */}
        <div className="pt-2 border-t border-neutral-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3">
          
          {/* 1. DROPDOWN MULTI-SELECT PENTRU PLATFORME */}
          <div className="relative" ref={platformDropdownRef}>
            <label className="block text-[11px] font-medium font-semibold text-neutral-600 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
              <span>Platforme</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setIsPlatformDropdownOpen(prev => !prev);
                setIsRoleDropdownOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                selectedPlatforms.length > 0
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-800 hover:bg-neutral-100 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <Globe className={`w-3.5 h-3.5 shrink-0 ${selectedPlatforms.length > 0 ? 'text-white' : 'text-neutral-500'}`} />
                <span className="truncate">
                  {selectedPlatforms.length === 0
                    ? 'Toate Platformele'
                    : selectedPlatforms.length === 1
                    ? platformsConfig.find(p => p.id === selectedPlatforms[0])?.label || '1 platforma'
                    : `${selectedPlatforms.length} platforme`}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${selectedPlatforms.length > 0 ? 'text-white' : 'text-neutral-500'} ${isPlatformDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* MENIU DROPDOWN PLATFORME */}
            {isPlatformDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 bg-white border border-neutral-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-2.5 border-b border-neutral-100 space-y-2 bg-neutral-50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                    <input
                      type="text"
                      value={platformSearchQuery}
                      onChange={(e) => setPlatformSearchQuery(e.target.value)}
                      placeholder="Filtrează platformă..."
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-semibold px-1 font-mono">
                    <button
                      type="button"
                      onClick={selectAllPlatforms}
                      className="text-neutral-900 hover:underline cursor-pointer"
                    >
                      Selecteaza Toate
                    </button>
                    <button
                      type="button"
                      onClick={clearAllPlatforms}
                      className="text-neutral-500 hover:text-brand-600 cursor-pointer"
                    >
                      Deselecteaza Toate
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
                        className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                          isChecked 
                            ? 'bg-brand-500 text-white font-semibold' 
                            : 'hover:bg-neutral-100 text-neutral-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition shrink-0 ${
                            isChecked 
                              ? 'bg-white border-white text-neutral-900' 
                              : 'border-neutral-300 bg-white'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isChecked ? 'text-white' : 'text-neutral-500'}`} />
                          <span className="truncate">{plat.label}</span>
                        </div>
                        <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md shrink-0 ${
                          isChecked ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-700'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 2. DROPDOWN MULTI-SELECT PENTRU SPECIALIZARI & ROLURI IT */}
          <div className="relative" ref={roleDropdownRef}>
            <label className="block text-[11px] font-medium font-semibold text-neutral-600 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
              <span>Specializare IT</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setIsRoleDropdownOpen(prev => !prev);
                setIsPlatformDropdownOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                selectedRoleCategories.length > 0
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-800 hover:bg-neutral-100 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <Layers className={`w-3.5 h-3.5 shrink-0 ${selectedRoleCategories.length > 0 ? 'text-white' : 'text-neutral-500'}`} />
                <span className="truncate">
                  {selectedRoleCategories.length === 0
                    ? 'Toate Specializarile'
                    : selectedRoleCategories.length === 1
                    ? roleCategories.find(r => r.id === selectedRoleCategories[0])?.label || '1 rol'
                    : `${selectedRoleCategories.length} roluri`}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${selectedRoleCategories.length > 0 ? 'text-white' : 'text-neutral-500'} ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* MENIU DROPDOWN SPECIALIZARI */}
            {isRoleDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 bg-white border border-neutral-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-2.5 border-b border-neutral-100 space-y-2 bg-neutral-50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                    <input
                      type="text"
                      value={roleSearchQuery}
                      onChange={(e) => setRoleSearchQuery(e.target.value)}
                      placeholder="Filtrează rol (Java, DevOps, etc.)..."
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-semibold px-1 font-mono">
                    <button
                      type="button"
                      onClick={selectAllRoles}
                      className="text-neutral-900 hover:underline cursor-pointer"
                    >
                      Selecteaza Toate
                    </button>
                    <button
                      type="button"
                      onClick={clearAllRoles}
                      className="text-neutral-500 hover:text-brand-600 cursor-pointer"
                    >
                      Deselecteaza Toate
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
                        className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                          isChecked 
                            ? 'bg-brand-500 text-white font-semibold' 
                            : 'hover:bg-neutral-100 text-neutral-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition shrink-0 ${
                            isChecked 
                              ? 'bg-white border-white text-neutral-900' 
                              : 'border-neutral-300 bg-white'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isChecked ? 'text-white' : 'text-neutral-500'}`} />
                          <span className="truncate">{cat.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. FILTRU UNIFICAT: DATA POSTARII */}
          <div>
            <label className="block text-[11px] font-medium font-semibold text-neutral-600 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
              <span>Data Postarii</span>
            </label>
            <select
              value={selectedDatePosted}
              onChange={(e) => { setSelectedDatePosted(e.target.value); setCurrentPage(1); }}
              className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer focus:outline-none focus:border-brand-500 ${
                selectedDatePosted !== 'ALL'
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-800 hover:bg-neutral-100'
              }`}
            >
              <option value="ALL" className="bg-white text-neutral-900">Toate joburile (Oricând)</option>
              <option value="NEWLY_DISCOVERED" className="bg-white text-neutral-900">Doar NOU GĂSIT (Ultima Sincronizare)</option>
              <option value="24H" className="bg-white text-neutral-900">Ultimele 24 de ore (Noi)</option>
              <option value="48H" className="bg-white text-neutral-900">Ultimele 48 de ore</option>
              <option value="7D" className="bg-white text-neutral-900">Ultima săptămână (7 zile)</option>
              <option value="30D" className="bg-white text-neutral-900">Ultima lună (30 de zile)</option>
            </select>
          </div>

          {/* 4. DROPDOWN MULTI-SELECT PENTRU NIVEL EXPERIENTA */}
          <div className="relative" ref={levelDropdownRef}>
            <label className="block text-[11px] font-medium font-semibold text-neutral-600 mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
              <span>Nivel Experiență</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setIsLevelDropdownOpen(prev => !prev);
                setIsPlatformDropdownOpen(false);
                setIsRoleDropdownOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                selectedLevels.length > 0
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-800 hover:bg-neutral-100 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <GraduationCap className={`w-3.5 h-3.5 shrink-0 ${selectedLevels.length > 0 ? 'text-white' : 'text-neutral-500'}`} />
                <span className="truncate">
                  {selectedLevels.length === 0
                    ? 'Toate Nivelurile'
                    : selectedLevels.length === 1
                    ? levelsConfig.find(l => l.id === selectedLevels[0])?.label || '1 nivel'
                    : `${selectedLevels.length} niveluri`}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${selectedLevels.length > 0 ? 'text-white' : 'text-neutral-500'} ${isLevelDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* MENIU DROPDOWN NIVELURI */}
            {isLevelDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-64 bg-white border border-neutral-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-2.5 border-b border-neutral-100 flex items-center justify-between text-[11px] font-semibold bg-neutral-50 font-mono">
                  <button
                    type="button"
                    onClick={selectAllLevels}
                    className="text-neutral-900 hover:underline cursor-pointer"
                  >
                    Selecteaza Toate
                  </button>
                  <button
                    type="button"
                    onClick={clearAllLevels}
                    className="text-neutral-500 hover:text-brand-600 cursor-pointer"
                  >
                    Deselecteaza Toate
                  </button>
                </div>

                <div className="p-1.5 space-y-1">
                  {levelsConfig.map((lvl) => {
                    const isChecked = selectedLevels.includes(lvl.id);
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => toggleLevel(lvl.id)}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                          isChecked 
                            ? 'bg-brand-500 text-white font-semibold' 
                            : 'hover:bg-neutral-100 text-neutral-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition shrink-0 ${
                            isChecked 
                              ? 'bg-white border-white text-neutral-900' 
                              : 'border-neutral-300 bg-white'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="truncate">{lvl.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 5. MOD DE LUCRU (FARA EMOTICOANE) */}
          <div>
            <label className="block text-[11px] font-medium font-semibold text-neutral-600 mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
              <span>Mod de Lucru</span>
            </label>
            <select
              value={selectedWorkModel}
              onChange={(e) => { setSelectedWorkModel(e.target.value); setCurrentPage(1); }}
              className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer focus:outline-none focus:border-brand-500 ${
                selectedWorkModel !== 'ALL'
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-800 hover:bg-neutral-100'
              }`}
            >
              <option value="ALL" className="bg-white text-neutral-900">Toate Modurile</option>
              <option value="REMOTE" className="bg-white text-neutral-900">Remote</option>
              <option value="HYBRID" className="bg-white text-neutral-900">Hibrid</option>
              <option value="ONSITE" className="bg-white text-neutral-900">On-Site</option>
            </select>
          </div>

          {/* 6. COMPETITIVITATE & SANSE (FARA EMOTICOANE) */}
          <div>
            <label className="block text-[11px] font-medium font-semibold text-neutral-600 mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
              <span>Competiție</span>
            </label>
            <select
              value={selectedCompetitiveness}
              onChange={(e) => { setSelectedCompetitiveness(e.target.value); setCurrentPage(1); }}
              className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer focus:outline-none focus:border-brand-500 ${
                selectedCompetitiveness !== 'ALL'
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-800 hover:bg-neutral-100'
              }`}
            >
              <option value="ALL" className="bg-white text-neutral-900">Toate Tipurile</option>
              <option value="LOW" className="bg-white text-neutral-900">Competiție Redusă</option>
              <option value="MEDIUM" className="bg-white text-neutral-900">Competiție Medie</option>
              <option value="HIGH" className="bg-white text-neutral-900">Competiție Ridicată</option>
            </select>
          </div>

          {/* 7. STATUS JOB & LIFECYCLE (ACTIVE / EXPIRED / TOATE) */}
          <div>
            <label className="block text-[11px] font-medium font-semibold text-neutral-600 mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
              <span>Status Job</span>
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer focus:outline-none focus:border-brand-500 ${
                selectedStatus !== 'ACTIVE'
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-800 hover:bg-neutral-100'
              }`}
            >
              <option value="ACTIVE" className="bg-white text-neutral-900">Doar Active (Recente)</option>
              <option value="EXPIRED" className="bg-white text-neutral-900">Expirate / Inactive</option>
              <option value="ALL" className="bg-white text-neutral-900">Toate Statusurile</option>
            </select>
          </div>

          {/* 8. FILTRU SCOR ATS */}
          <div>
            <label className="block text-[11px] font-medium font-semibold text-neutral-600 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
              <span>Scor ATS</span>
            </label>
            <select
              value={selectedAtsScore}
              onChange={(e) => { setSelectedAtsScore(e.target.value); setCurrentPage(1); }}
              className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer focus:outline-none focus:border-brand-500 ${
                selectedAtsScore !== 'ALL'
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-800 hover:bg-neutral-100'
              }`}
            >
              <option value="ALL" className="bg-white text-neutral-900">Toate Scorurile ATS</option>
              <option value="TOP_80" className="bg-white text-neutral-900">Excelent (80%+ Match)</option>
              <option value="TOP_60" className="bg-white text-neutral-900">Bun (60%+ Match)</option>
              <option value="TOP_40" className="bg-white text-neutral-900">Mediu (40%+ Match)</option>
              <option value="UNDER_40" className="bg-white text-neutral-900">Sub 40% Match</option>
            </select>
          </div>

        </div>

      </Card>

      {/* BARA DE FILTRE ACTIVE CU RESET RAPID */}
      {activeFiltersCount > 0 && (
        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-neutral-900 flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5 text-neutral-900" />
              Filtre Active ({activeFiltersCount}):
            </span>

            {keyword && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-white text-neutral-900 border border-neutral-200">
                <span>Cuvânt: <strong>"{keyword}"</strong></span>
                <button onClick={() => setKeyword('')} className="hover:text-rose-600 cursor-pointer p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {location && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-white text-neutral-900 border border-neutral-200">
                <span>Locație: <strong>"{location}"</strong></span>
                <button onClick={() => setLocation('')} className="hover:text-rose-600 cursor-pointer p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedPlatforms.map(platId => {
              const p = platformsConfig.find(item => item.id === platId);
              return (
                <span key={platId} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-white text-neutral-900 border border-neutral-200">
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
                <span key={roleId} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-white text-neutral-900 border border-neutral-200">
                  <span>Rol: <strong>{r?.label || roleId}</strong></span>
                  <button onClick={() => toggleRoleCategory(roleId)} className="hover:text-rose-600 cursor-pointer p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}

            {selectedDatePosted !== 'ALL' && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border ${
                selectedDatePosted === 'NEWLY_DISCOVERED'
                  ? 'bg-brand-500 text-white border-brand-500 font-mono'
                  : 'bg-white text-neutral-900 border-neutral-200'
              }`}>
                {selectedDatePosted === 'NEWLY_DISCOVERED' ? (
                  <Sparkles className="w-3.5 h-3.5" />
                ) : (
                  <Calendar className="w-3 h-3 text-neutral-900" />
                )}
                <span>{
                  selectedDatePosted === 'NEWLY_DISCOVERED' ? (
                    <>Doar: <strong>NOU GĂSIT (Ultima Sincronizare)</strong></>
                  ) : (
                    <>Data postării: <strong>{
                      selectedDatePosted === '24H' ? 'Ultimele 24h' :
                      selectedDatePosted === '48H' ? 'Ultimele 48h' :
                      selectedDatePosted === '7D' ? 'Ultima săptămână' :
                      selectedDatePosted === '30D' ? 'Ultima lună' : selectedDatePosted
                    }</strong></>
                  )
                }</span>
                <button 
                  onClick={() => { setSelectedDatePosted('ALL'); setCurrentPage(1); }} 
                  className={`cursor-pointer p-0.5 ml-0.5 ${selectedDatePosted === 'NEWLY_DISCOVERED' ? 'hover:text-amber-200 text-white/80' : 'hover:text-rose-600 text-neutral-500'}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedLevels.map(lvlId => {
              const lvl = levelsConfig.find(item => item.id === lvlId);
              return (
                <span key={lvlId} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-white text-neutral-900 border border-neutral-200">
                  <span>Nivel: <strong>{lvl?.label || lvlId}</strong></span>
                  <button onClick={() => toggleLevel(lvlId)} className="hover:text-rose-600 cursor-pointer p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}

            {selectedAtsScore !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-neutral-100 text-neutral-900 border border-neutral-300 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
                <span>Scor ATS: <strong>{
                  selectedAtsScore === 'TOP_80' ? '80%+ Match' :
                  selectedAtsScore === 'TOP_60' ? '60%+ Match' :
                  selectedAtsScore === 'TOP_40' ? '40%+ Match' :
                  selectedAtsScore === 'UNDER_40' ? 'Sub 40%' : selectedAtsScore
                }</strong></span>
                <button onClick={() => { setSelectedAtsScore('ALL'); setCurrentPage(1); }} className="hover:text-rose-600 cursor-pointer p-0.5 text-neutral-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedWorkModel !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-white text-neutral-900 border border-neutral-200">
                <span>Mod: <strong>{selectedWorkModel}</strong></span>
                <button onClick={() => setSelectedWorkModel('ALL')} className="hover:text-rose-600 cursor-pointer p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedCompetitiveness !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-white text-neutral-900 border border-neutral-200">
                <span>Competiție: <strong>{selectedCompetitiveness}</strong></span>
                <button onClick={() => setSelectedCompetitiveness('ALL')} className="hover:text-rose-600 cursor-pointer p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedStatus !== 'ACTIVE' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-white text-neutral-900 border border-neutral-200">
                <span>Status: <strong>{selectedStatus === 'EXPIRED' ? 'Expirate / Inactive' : 'Toate Statusurile'}</strong></span>
                <button onClick={() => setSelectedStatus('ACTIVE')} className="hover:text-rose-600 cursor-pointer p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <button
            onClick={handleResetFilters}
            className="text-xs font-semibold text-neutral-900 hover:text-brand-600 bg-white hover:bg-neutral-100 border border-neutral-300 px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Resetează filtrele</span>
          </button>
        </div>
      )}

      {/* HEADER REZULTATE CU STATISTICI & CONTROALE DE PAGINARE */}
      <div ref={jobsListRef} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2.5">
          <span className="font-serif text-xl font-medium text-neutral-950">
            {loading ? 'Se caută...' : `${totalJobs} joburi găsite`}
          </span>
          <span className="text-xs font-mono font-medium text-neutral-500">
            • {totalJobs > 0 ? startIndex + 1 : 0} - {endIndex} din {totalJobs}
          </span>
        </div>

        {/* CONTROALE REZULTATE: EXPORT CSV & DIMENSIUNE PAGINA */}
        <div className="flex items-center gap-3">
          {/* BUTON EXPORT CSV */}
          <button
            type="button"
            onClick={handleExportJobsCsv}
            disabled={loading || totalJobs === 0}
            className="px-3.5 py-2 bg-white hover:bg-neutral-100 border border-neutral-300 hover:border-brand-500 text-neutral-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Exportă joburile afișate în format CSV compatibil Excel"
          >
            <Download className="w-3.5 h-3.5 text-neutral-900" />
            <span>Exportă CSV</span>
          </button>

          {/* DIMENSIUNE PAGINA */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono bg-neutral-50 p-1 rounded-xl border border-neutral-200">
            <span className="px-1.5 font-semibold">Pe pagină:</span>
            {[12, 24, 48].map((size) => (
              <button
                key={size}
                onClick={() => { setPageSize(size); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  pageSize === size 
                    ? 'bg-brand-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-200/70'
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
            <div key={n} className="bg-white border border-neutral-200 p-6 rounded-2xl animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-neutral-200 rounded-xl"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                  <div className="h-3 bg-neutral-100 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-16 bg-neutral-50 rounded-xl"></div>
              <div className="h-8 bg-neutral-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : totalJobs === 0 ? (
        <div className="bg-white border border-dashed border-neutral-300 p-12 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center">
            {selectedDatePosted === 'NEWLY_DISCOVERED' ? (
              <Sparkles className="w-6 h-6 text-neutral-900" />
            ) : (
              <Search className="w-6 h-6" />
            )}
          </div>
          <h3 className="text-base font-semibold text-neutral-900">
            {selectedDatePosted === 'NEWLY_DISCOVERED' 
              ? 'Nu au fost identificate joburi noi la cea mai recenta sincronizare'
              : 'Nu am găsit joburi care să corespundă filtrelor selectate'}
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            {selectedDatePosted === 'NEWLY_DISCOVERED'
              ? 'Toate joburile scanate erau deja înregistrate în baza de date. Apasă pe «Sincronizează Acum» pentru a relua căutarea live sau comută pe «Toate joburile».'
              : 'Încearcă să relaxezi selecția de platforme sau să schimbi termenul de căutare.'}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            {selectedDatePosted === 'NEWLY_DISCOVERED' && (
              <button
                type="button"
                onClick={() => { setSelectedDatePosted('ALL'); setCurrentPage(1); }}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Vezi toate joburile
              </button>
            )}
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-semibold rounded-xl border border-neutral-200 transition cursor-pointer"
            >
              Resetează filtrele
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentJobs.map((job) => {
            const isSaved = savedJobIds.has(job.id);
            const isSaving = savingJobId === job.id;
            const sourceSite = platformSiteName(job.sourcePlatform);
            const applyLabel = sourceSite ? `Aplică pe ${sourceSite}` : 'Aplică pe site-ul sursă';
            const trackerLabel = isSaved ? 'Adăugat în tracker, la Aplicat' : isSaving ? 'Se adaugă în tracker' : 'Adaugă în tracker, la Aplicat';
            const iconBtn = 'p-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 hover:text-brand-600 text-neutral-600 transition cursor-pointer shrink-0';
            const savedIconBtn = 'p-2 rounded-xl border border-brand-100 bg-brand-50 text-brand-600 shrink-0';

            return (
              <Card key={job.id} data-job-card={job.id} className="flex flex-col gap-4 hover:border-brand-300 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedJobForDetails(job)}
                    className="min-w-0 text-left cursor-pointer"
                    title="Deschide fișa jobului"
                  >
                    <h3 className="font-sans text-base font-medium text-neutral-950 leading-snug line-clamp-2">
                      {job.jobTitle}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-neutral-600 mt-1 truncate">
                      <Building2 className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                      <span className="truncate">{job.companyName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5 truncate">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    {sourceSite && (
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5 truncate">
                        <Globe className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                        <span className="truncate">{sourceSite}</span>
                      </div>
                    )}
                  </button>

                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-sm font-medium tabular-nums ${
                      job.atsMatchScore >= 75
                        ? 'bg-brand-500 text-white'
                        : job.atsMatchScore >= 45
                        ? 'bg-brand-50 text-brand-700'
                        : 'bg-neutral-100 text-neutral-500'
                    }`}
                    title="Scor ATS"
                    aria-label={`Scor ATS ${Math.round(job.atsMatchScore)}%`}
                  >
                    {Math.round(job.atsMatchScore)}%
                  </span>
                </div>

                <div className="mt-auto flex items-center gap-2">
                  <a
                    href={job.directApplyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-0 py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white transition"
                    title={applyLabel}
                    aria-label={applyLabel}
                  >
                    <span>Aplică</span>
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  <button
                    onClick={() => handleSaveToKanban(job)}
                    disabled={isSaved || isSaving}
                    className={isSaved ? savedIconBtn : `${iconBtn} disabled:opacity-60 disabled:cursor-wait`}
                    title={trackerLabel}
                    aria-label={trackerLabel}
                  >
                    {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <FolderKanban className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setSelectedJobForDetails(job)} className={iconBtn} title="Vezi fișa jobului" aria-label="Vezi fișa jobului">
                    <FileText className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleOpenAuditModal(job)} className={iconBtn} title="Istoric modificări" aria-label="Istoric modificări">
                    <History className="w-4 h-4" />
                  </button>
                  {onOpenCoverLetter && (
                    <button onClick={() => onOpenCoverLetter(job)} className={iconBtn} title="Generează scrisoare de intenție" aria-label="Generează scrisoare de intenție">
                      <FileSignature className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* PAGINARE IN PARTEA DE JOS */}
      {!loading && totalPages > 1 && (
        <div className="bg-white border border-neutral-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-mono font-medium text-neutral-500">
            Pagina <span className="text-neutral-900 font-semibold">{currentPage}</span> din <span className="text-neutral-900 font-semibold">{totalPages}</span> ({totalJobs} joburi în total)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-white transition cursor-pointer text-neutral-700"
              title="Prima pagină"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-white transition cursor-pointer text-xs font-mono font-semibold flex items-center gap-1 text-neutral-800"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>

            {/* BUTOANE NUMEROTATE DE PAGINA */}
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
                    className={`w-8 h-8 rounded-xl text-xs font-mono font-semibold transition cursor-pointer ${
                      isActive 
                        ? 'bg-brand-500 text-white' 
                        : 'bg-white text-neutral-800 hover:bg-neutral-100 border border-neutral-200'
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
              className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-white transition cursor-pointer text-xs font-mono font-semibold flex items-center gap-1 text-neutral-800"
            >
              <span>Următor</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-white transition cursor-pointer text-neutral-700"
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
          onOpenCoverLetter={onOpenCoverLetter}
          onUpdateJobScore={(jobId, newScore, aiData) => {
            setJobs(prevJobs => prevJobs.map(j => {
              if (j.id === jobId) {
                let updatedLevel = j.experienceLevel;
                if (aiData?.experienceLevel) {
                  const currentLvl = (j.experienceLevel || '').toUpperCase();
                  const aiLvl = (aiData.experienceLevel || '').toUpperCase();
                  if (currentLvl === 'SENIOR') {
                    updatedLevel = 'SENIOR';
                  } else if (currentLvl === 'MID') {
                    updatedLevel = aiLvl === 'SENIOR' ? 'SENIOR' : 'MID';
                  } else if (currentLvl === 'INTERNSHIP') {
                    updatedLevel = 'INTERNSHIP';
                  } else if (currentLvl === 'JUNIOR') {
                    updatedLevel = (aiLvl === 'SENIOR' || aiLvl === 'MID') ? aiLvl : 'JUNIOR';
                  } else {
                    updatedLevel = aiLvl || j.experienceLevel;
                  }
                }

                return {
                  ...j,
                  atsMatchScore: typeof newScore === 'number' ? newScore : j.atsMatchScore,
                  matchingSkills: (aiData?.matchingSkills && aiData.matchingSkills.length > 0) ? aiData.matchingSkills : j.matchingSkills,
                  missingSkills: (aiData?.missingSkills && aiData.missingSkills.length > 0) ? aiData.missingSkills : j.missingSkills,
                  experienceLevel: updatedLevel
                };
              }
              return j;
            }));
          }}
        />
      )}

      {/* MODAL AUDIT LIFECYCLE & ISTORIC MODIFICARI */}
      {auditJobForChanges && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] overflow-y-auto bg-brand-500/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-morphing-backdrop"
          onClick={() => setAuditJobForChanges(null)}
        >
          <div 
            className="relative bg-white border border-neutral-200 rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-morphing-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-neutral-950">
                    Istoric & Audit Pipeline
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono">
                    Monitorizare modificari continut & ciclu de viata
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAuditJobForChanges(null)}
                className="w-8 h-8 rounded-xl bg-white hover:bg-neutral-100 text-neutral-600 hover:text-brand-600 border border-neutral-200 flex items-center justify-center transition cursor-pointer animate-morphing-close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Job Info Summary */}
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-sm text-neutral-950">
                      {auditJobForChanges.jobTitle}
                    </div>
                    <div className="text-xs font-mono text-neutral-600 flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{auditJobForChanges.companyName}</span>
                      <span>•</span>
                      <span>{platformSiteName(auditJobForChanges.sourcePlatform)}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold border shrink-0 ${
                    auditJobForChanges.status === 'ACTIVE'
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                  }`}>
                    {auditJobForChanges.status === 'ACTIVE' ? 'Activ' : 'Expirat / Inactiv'}
                  </span>
                </div>

                {/* Content Hash & Timestamps */}
                <div className="pt-2 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>
                    <span className="text-neutral-500 block">Data Reala Publicare:</span>
                    <span className="font-semibold text-neutral-900 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-neutral-400" />
                      {formatDateTime(auditJobForChanges.postedAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Ultima Verificare (Crawl):</span>
                    <span className="font-semibold text-neutral-900 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      {formatDateTime(auditJobForChanges.lastSeenAt || auditJobForChanges.firstSeenAt)}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-neutral-500 block">Content Hash (SHA-256):</span>
                    <code className="font-mono text-[10px] bg-white px-2 py-1 rounded-lg border border-neutral-200 block truncate mt-0.5 text-neutral-800 select-all">
                      {auditJobForChanges.contentHash || 'Neindexat'}
                    </code>
                  </div>
                </div>
              </div>

              {/* Timeline of Changes */}
              <div className="space-y-2">
                <div className="font-mono font-semibold text-xs  text-neutral-700 flex items-center gap-1.5">
                  <GitCommit className="w-3.5 h-3.5 text-neutral-900" />
                  <span>Jurnal Modificari Inregistrate ({jobChangesList.length})</span>
                </div>

                {loadingChanges ? (
                  <div className="py-8 text-center text-neutral-500 space-y-2">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-neutral-900" />
                    <p className="font-medium">Se încarcă jurnalul de modificari...</p>
                  </div>
                ) : jobChangesList.length === 0 ? (
                  <div className="p-4 rounded-xl bg-neutral-50 border border-dashed border-neutral-200 text-center text-neutral-500 space-y-1">
                    <CheckCircle2 className="w-5 h-5 text-neutral-900 mx-auto" />
                    <p className="font-semibold text-neutral-800">Nicio modificare ulterioară</p>
                    <p className="text-[11px]">
                      Jobul a fost indexat initial si continutul nu a suferit modificari intre crawl-uri.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                    {jobChangesList.map((ch, idx) => {
                      const typeConfig = {
                        CREATED: { label: 'Descoperit & Indexat', bg: 'bg-brand-500 text-white border-brand-500', dot: 'bg-brand-500' },
                        CONTENT_UPDATED: { label: 'Conținut Modificat', bg: 'bg-neutral-100 text-neutral-900 border-neutral-300', dot: 'bg-neutral-700' },
                        EXPIRED: { label: 'Marcat ca Expirat', bg: 'bg-neutral-100 text-neutral-600 border-neutral-200', dot: 'bg-neutral-400' },
                        REACTIVATED: { label: 'Reactivat la Recrawling', bg: 'bg-brand-500 text-white border-brand-500', dot: 'bg-brand-500' }
                      }[ch.changeType] || { label: ch.changeType, bg: 'bg-neutral-100 text-neutral-800 border-neutral-200', dot: 'bg-neutral-500' };

                      return (
                        <div key={ch.id || idx} className="relative pl-7 flex items-start justify-between gap-3 group">
                          <div className={`absolute left-2.5 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ring-1 ring-neutral-300 ${typeConfig.dot}`}></div>
                          <div className="flex-1 bg-white p-2.5 rounded-xl border border-neutral-200 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold border ${typeConfig.bg}`}>
                                {typeConfig.label}
                              </span>
                              <span className="text-[10px] text-neutral-500 font-mono">
                                {formatDateTime(ch.changedAt)}
                              </span>
                            </div>
                            {ch.details && (
                              <div className="text-[11px] font-semibold text-neutral-800 leading-snug">
                                {ch.details}
                              </div>
                            )}
                            {ch.newHash && (
                              <div className="font-mono text-[9px] text-neutral-500 truncate" title={`Hash nou: ${ch.newHash}`}>
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
            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex justify-end">
              <button
                onClick={() => setAuditJobForChanges(null)}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
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
