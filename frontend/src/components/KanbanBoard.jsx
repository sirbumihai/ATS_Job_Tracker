import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Building2, 
  Sparkles, 
  FileText, 
  BrainCircuit, 
  RefreshCw, 
  Search, 
  Filter, 
  GripVertical, 
  Trash2, 
  Columns, 
  List,
  Edit3,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Bookmark,
  Send,
  Calendar,
  Award,
  XCircle,
  Plus,
  FolderKanban,
  ArrowUpDown,
  RotateCcw,
  Briefcase,
  Download,
  StickyNote,
  X,
  Save,
  Mail,
  FileSignature,
  PanelLeft,
  BarChart3,
  Table as TableIcon,
  GitMerge,
  ArrowRight,
  TrendingUp,
  Target,
  CheckSquare,
  Square,
  Check,
  Zap
} from 'lucide-react';
import JobDetailModal from './JobDetailModal';
import GmailSyncModal from './GmailSyncModal';
import OutreachCrmModal from './OutreachCrmModal';
import CalendarView from './CalendarView';

export const isAppGmail = (app) => {
  if (!app) return false;
  const platform = (app.sourcePlatform || '').toUpperCase();
  if (platform === 'GMAIL') return true;
  const desc = app.rawDescription || '';
  if (desc.includes('GMAIL') || desc.includes('EMAIL DE RECRUTARE') || desc.includes('CONTINUT COMPLET EMAIL') || desc.includes('CON\u021bINUT COMPLET EMAIL')) return true;
  const notes = app.notes || '';
  if (notes.toLowerCase().includes('gmail sync')) return true;
  return false;
};

export default function KanbanBoard({ 
  applications = [], 
  currentUser, 
  loading, 
  onRunAiAnalysis, 
  onOpenAnalysis,
  analyzingAppId,
  onUpdateStatus,
  onStatusChange,
  onReorderApplications,
  onDeleteApplication,
  onApplicationUpdated,
  onEditCvInStudio,
  onOpenCoverLetter,
  onOpenAddJob,
  onRefreshApplications
}) {
  const [isGmailModalOpen, setIsGmailModalOpen] = useState(false);
  // 5 TRACKER LAYOUT VERSIONS: 'kanban' | 'split' | 'matrix' | 'table' | 'funnel' | 'calendar'
  const [trackerLayout, setTrackerLayout] = useState(() => {
    try {
      const saved = localStorage.getItem('ats_tracker_layout_version');
      if (saved) {
        if (saved === 'list') return 'table';
        return saved;
      }
    } catch (e) {
      // ignore
    }
    return 'kanban';
  });

  const handleSelectLayout = (layoutId) => {
    setTrackerLayout(layoutId);
    try {
      localStorage.setItem('ats_tracker_layout_version', layoutId);
    } catch (e) {
      // ignore
    }
  };

  const TRACKER_LAYOUTS = [
    { 
      id: 'kanban', 
      label: '1. Swift Board', 
      badge: 'Coloane Agil',
      icon: Columns, 
      desc: 'Vizualizare clasica verticala pe 5 coloane cu fizica fluid drag-and-drop' 
    },
    { 
      id: 'split', 
      label: '2. Split Studio', 
      badge: 'Master-Detail',
      icon: PanelLeft, 
      desc: 'Feed compact in stanga si inspector interactiv cu editare de notite in dreapta' 
    },
    { 
      id: 'matrix', 
      label: '3. Executive Matrix', 
      badge: 'KPI & Swimlanes',
      icon: BarChart3, 
      desc: 'Tablou de bord executiv cu metrici cheie si benzi orizontale pe etape' 
    },
    { 
      id: 'table', 
      label: '4. Spreadsheet Pro', 
      badge: 'Tabel Notion',
      icon: TableIcon, 
      desc: 'Tabel densitate inalta cu sortare rapida pe coloane si actiuni in masa' 
    },
    { 
      id: 'funnel', 
      label: '5. Career Funnel', 
      badge: 'Palnie & Roadmap',
      icon: GitMerge, 
      desc: 'Pipeline progresiv cu rate de conversie si butoane de avansare directa' 
    },
  ];

  // SPLIT STUDIO STATE
  const [selectedAppIdForSplit, setSelectedAppIdForSplit] = useState(null);
  const [splitNotesText, setSplitNotesText] = useState('');
  const [isSavingSplitNotes, setIsSavingSplitNotes] = useState(false);
  const [splitNotesSavedToast, setSplitNotesSavedToast] = useState(false);
  const [splitStageFilter, setSplitStageFilter] = useState('ALL');

  // SPREADSHEET PRO STATE
  const [selectedRowIds, setSelectedRowIds] = useState(new Set());

  // CAREER FUNNEL STATE
  const [funnelStageFilter, setFunnelStageFilter] = useState('ALL');

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('CUSTOM'); // 'CUSTOM' | 'SCORE_DESC' | 'SCORE_ASC' | 'DATE_DESC' | 'COMPANY_ASC' | 'TITLE_ASC'
  const [filterScore, setFilterScore] = useState('ALL'); // 'ALL' | 'HIGH' | 'MID' | 'LOW'
  const [filterWorkModel, setFilterWorkModel] = useState('ALL'); // 'ALL' | 'REMOTE' | 'HYBRID' | 'ONSITE'
  const [filterCv, setFilterCv] = useState('ALL'); // 'ALL' | 'ATTACHED' | 'UNATTACHED'
  const [filterGmailOnly, setFilterGmailOnly] = useState(false);
  const [mobileSelectedColumn, setMobileSelectedColumn] = useState('SAVED');
  
  // SWIFT KANBAN MOTION STATE (POINTER EVENTS BASED)
  const [activeDrag, setActiveDrag] = useState(null); // { app, sourceColKey, sourceIndex, cardWidth, cardHeight, x, y }
  const [dropTargetSlot, setDropTargetSlot] = useState(null); // { columnKey: string, slotIndex: number }
  const [justDroppedCardId, setJustDroppedCardId] = useState(null);

  const dragStartRef = useRef(null);
  const floatingCardRef = useRef(null);
  const dropTargetSlotRef = useRef(null);

  useEffect(() => {
    dropTargetSlotRef.current = dropTargetSlot;
  }, [dropTargetSlot]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeDrag) {
        setActiveDrag(null);
        setDropTargetSlot(null);
        dragStartRef.current = null;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDrag]);

  const [cvList, setCvList] = useState([]);
  const [uploadedResumes, setUploadedResumes] = useState([]);
  const [attachingCvAppId, setAttachingCvAppId] = useState(null);
  const [selectedJobForModal, setSelectedJobForModal] = useState(null);
  const [outreachApp, setOutreachApp] = useState(null);
  const DEFAULT_USER_ID = '23fe8bdd-08f4-413d-9985-f99c21040b59';
  const activeUserId = currentUser?.userId || currentUser?.id || DEFAULT_USER_ID;

  const getEmailSender = (app) => {
    if (!app) return null;
    if (app.rawDescription) {
      const m = app.rawDescription.match(/👤\s*Expeditor:\s*([^\n\r]+)/i);
      if (m) return m[1].trim();
    }
    if (app.notes) {
      const m = app.notes.match(/\(([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\)/);
      if (m) return m[1].trim();
    }
    return null;
  };

  const [trackerToast, setTrackerToast] = useState(null);

  // EXPORT CANDIDATURI IN FORMAT CSV COMPATIBIL EXCEL (UTF-8 BOM)
  const handleExportCsv = () => {
    const appsToExport = filteredApplications.length > 0 ? filteredApplications : applications;
    if (!appsToExport || appsToExport.length === 0) {
      setTrackerToast('Nu exista aplicatii de exportat.');
      setTimeout(() => setTrackerToast(null), 3000);
      return;
    }

    const statusLabels = {
      SAVED: 'Salvat',
      APPLIED: 'Aplicat',
      INTERVIEWING: 'Interviu',
      OFFER_RECEIVED: 'Oferta Primita',
      REJECTED: 'Respins',
      WITHDRAWN: 'Retras'
    };

    const headers = [
      'Companie',
      'Titlu Job',
      'Status',
      'Scor Match ATS (%)',
      'Mod Lucru',
      'Locatie',
      'Salariu',
      'Data Aplicarii',
      'CV Utilizat',
      'Notite',
      'Link Job'
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = appsToExport.map(a => {
      const score = a.semanticMatchScore ? Number(a.semanticMatchScore).toFixed(1) : 'N/A';
      const cvName = a.cvProfileTitle || a.resumeFileName || (a.cvProfileId ? 'CV Studio' : (a.resumeId ? 'Fisier CV' : 'Nespecificat'));
      return [
        escapeCsv(a.companyName || ''),
        escapeCsv(a.jobTitle || ''),
        escapeCsv(statusLabels[a.status] || a.status || ''),
        escapeCsv(score),
        escapeCsv(a.workModel || ''),
        escapeCsv(a.jobLocation || a.location || ''),
        escapeCsv(a.salaryRange || ''),
        escapeCsv(a.appliedDate || (a.createdAt ? new Date(a.createdAt).toLocaleDateString('ro-RO') : '')),
        escapeCsv(cvName),
        escapeCsv(a.notes || ''),
        escapeCsv(a.jobUrl || '')
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.map(h => `"${h}"`).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `jobflow_aplicatii_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTrackerToast(`${appsToExport.length} aplicatii au fost exportate cu succes in CSV!`);
    setTimeout(() => setTrackerToast(null), 4000);
  };

  const handleOpenJobModal = (app) => {
    const isGmail = isAppGmail(app);
    setSelectedJobForModal({
      id: app.jobId || app.id,
      jobTitle: app.jobTitle,
      companyName: app.companyName,
      companyLogoUrl: app.companyLogoUrl || (isGmail ? "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico" : "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80"),
      location: app.location || app.jobLocation || "Romania",
      workModel: app.workModel || "REMOTE",
      experienceLevel: app.experienceLevel || "MID",
      sourcePlatform: isGmail ? "GMAIL" : (app.sourcePlatform || "OTHER"),
      directApplyUrl: app.jobUrl || "#",
      rawDescription: app.rawDescription || "Descrierea completa a postului salvat in aplicatia de tracking.",
      salaryRange: app.salaryRange || "Salariu Nespecificat / Conform Anunt",
      skillsRequired: app.skillsRequired || [],
      atsMatchScore: app.semanticMatchScore ? Number(app.semanticMatchScore) : 0,
      competitiveness: "MEDIUM",
      competitivenessLabel: isGmail ? "Email Recrutare" : "Competitie Medie",
      applicantCountText: isGmail ? "Sincronizat din Gmail" : "Candidatura Activa",
      postedDateAgo: app.appliedDate ? `Email din ${app.appliedDate}` : "Salvat in Tracker",
      postedAt: app.appliedDate ? `${app.appliedDate}T12:00:00Z` : null,
      notes: app.notes,
      appliedDate: app.appliedDate,
      status: app.status
    });
  };

  // LOAD USER'S SAVED CVS AND UPLOADED RESUMES FOR SELECTION
  const fetchCvProfilesAndResumes = async () => {
    try {
      const [cvRes, resRes] = await Promise.all([
        fetch('/api/v1/cv/list', { headers: { 'X-User-Id': activeUserId } }),
        fetch('/api/v1/resumes/user', { headers: { 'X-User-Id': activeUserId } })
      ]);
      if (cvRes.ok) {
        const data = await cvRes.json();
        setCvList(Array.isArray(data) ? data : []);
      }
      if (resRes.ok) {
        const rData = await resRes.json();
        setUploadedResumes(Array.isArray(rData) ? rData : []);
      }
    } catch (err) {
      console.error('Eroare la incarcarea CV-urilor in Tracker:', err);
    }
  };

  useEffect(() => {
    fetchCvProfilesAndResumes();
  }, [activeUserId]);

  const kanbanColumns = [
    { 
      key: 'SAVED', 
      title: 'Salvate', 
      label: 'Salvat',
      headerBg: 'bg-white text-neutral-950 border-b border-neutral-200/90',
      columnBg: 'bg-[#fafafa] border-neutral-200/90',
      accentBorder: 'border-t-2 border-t-neutral-400',
      badgeBg: 'bg-white text-neutral-900 border border-neutral-200 shadow-2xs font-mono',
      iconColor: 'text-neutral-500',
      tabActive: 'bg-black text-white shadow-xs',
      icon: Bookmark
    },
    { 
      key: 'APPLIED', 
      title: 'Aplicat', 
      label: 'Aplicat',
      headerBg: 'bg-white text-neutral-950 border-b border-neutral-200/90',
      columnBg: 'bg-[#fafafa] border-neutral-200/90',
      accentBorder: 'border-t-2 border-t-neutral-800',
      badgeBg: 'bg-white text-neutral-900 border border-neutral-200 shadow-2xs font-mono',
      iconColor: 'text-neutral-800',
      tabActive: 'bg-black text-white shadow-xs',
      icon: Send
    },
    { 
      key: 'INTERVIEWING', 
      title: 'Interviu', 
      label: 'Interviu',
      headerBg: 'bg-white text-neutral-950 border-b border-neutral-200/90',
      columnBg: 'bg-[#fafafa] border-neutral-200/90',
      accentBorder: 'border-t-2 border-t-neutral-950',
      badgeBg: 'bg-white text-neutral-900 border border-neutral-200 shadow-2xs font-mono',
      iconColor: 'text-neutral-950',
      tabActive: 'bg-black text-white shadow-xs',
      icon: Calendar
    },
    { 
      key: 'OFFER_RECEIVED', 
      title: 'Oferta', 
      label: 'Oferta',
      headerBg: 'bg-white text-neutral-950 border-b border-neutral-200/90',
      columnBg: 'bg-[#fafafa] border-neutral-200/90',
      accentBorder: 'border-t-2 border-t-emerald-600',
      badgeBg: 'bg-white text-emerald-900 border border-emerald-200 shadow-2xs font-mono',
      iconColor: 'text-emerald-700',
      tabActive: 'bg-black text-white shadow-xs',
      icon: Award
    },
    { 
      key: 'REJECTED', 
      title: 'Respins', 
      label: 'Respins',
      headerBg: 'bg-white text-neutral-950 border-b border-neutral-200/90',
      columnBg: 'bg-[#fafafa] border-neutral-200/90',
      accentBorder: 'border-t-2 border-t-neutral-300',
      badgeBg: 'bg-white text-neutral-600 border border-neutral-200 shadow-2xs font-mono',
      iconColor: 'text-neutral-400',
      tabActive: 'bg-black text-white shadow-xs',
      icon: XCircle
    },
  ];

  const statusColorMap = {
    SAVED: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    APPLIED: 'bg-neutral-100 text-neutral-800 border-neutral-300',
    INTERVIEWING: 'bg-neutral-900 text-white border-neutral-900',
    OFFER_RECEIVED: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    REJECTED: 'bg-neutral-100 text-neutral-500 border-neutral-200',
  };

  const statusDotMap = {
    SAVED: 'bg-neutral-400',
    APPLIED: 'bg-neutral-600',
    INTERVIEWING: 'bg-neutral-950',
    OFFER_RECEIVED: 'bg-emerald-500',
    REJECTED: 'bg-neutral-300',
  };

  // FILTER & SORT APPLICATIONS
  const filteredApplications = useMemo(() => {
    const list = applications.filter(app => {
      // 1. Search query (company, title, location)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const comp = (app.companyName || '').toLowerCase();
        const title = (app.jobTitle || '').toLowerCase();
        const loc = (app.jobLocation || app.location || '').toLowerCase();
        if (!comp.includes(q) && !title.includes(q) && !loc.includes(q)) {
          return false;
        }
      }

      // 2. Score filter
      const score = Number(app.semanticMatchScore || 0);
      if (filterScore === 'HIGH' && score < 80) return false;
      if (filterScore === 'MID' && (score < 50 || score >= 80)) return false;
      if (filterScore === 'LOW' && score >= 50) return false;

      // 3. Work model filter
      if (filterWorkModel !== 'ALL') {
        const wm = (app.workModel || '').toUpperCase();
        if (filterWorkModel === 'REMOTE' && !wm.includes('REMOTE')) return false;
        if (filterWorkModel === 'HYBRID' && (!wm.includes('HYBRID') && !wm.includes('HIBRID'))) return false;
        if (filterWorkModel === 'ONSITE' && (!wm.includes('SITE') && !wm.includes('BIROU') && !wm.includes('ONSITE'))) return false;
      }

      // 4. CV filter
      if (filterCv === 'ATTACHED') {
        if (!app.cvProfileId && !app.resumeId) return false;
      } else if (filterCv === 'UNATTACHED') {
        if (app.cvProfileId || app.resumeId) return false;
      }

      // 5. Gmail Only filter
      if (filterGmailOnly) {
        if (!isAppGmail(app)) return false;
      }

      return true;
    });

    // 6. Sort
    if (sortBy === 'CUSTOM') {
      return list; // Retine ordinea manuala din array
    }

    const sorted = [...list];
    if (sortBy === 'SCORE_DESC') {
      sorted.sort((a, b) => Number(b.semanticMatchScore || 0) - Number(a.semanticMatchScore || 0));
    } else if (sortBy === 'SCORE_ASC') {
      sorted.sort((a, b) => Number(a.semanticMatchScore || 0) - Number(b.semanticMatchScore || 0));
    } else if (sortBy === 'COMPANY_ASC') {
      sorted.sort((a, b) => (a.companyName || '').localeCompare(b.companyName || ''));
    } else if (sortBy === 'TITLE_ASC') {
      sorted.sort((a, b) => (a.jobTitle || '').localeCompare(b.jobTitle || ''));
    } else if (sortBy === 'DATE_DESC') {
      sorted.sort((a, b) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA;
      });
    }

    return sorted;
  }, [applications, searchQuery, filterScore, filterWorkModel, filterCv, filterGmailOnly, sortBy]);

  const gmailJobsCount = useMemo(() => {
    return applications.filter(isAppGmail).length;
  }, [applications]);

  const isAnyFilterActive = searchQuery.trim() !== '' || 
    filterScore !== 'ALL' || 
    filterWorkModel !== 'ALL' || 
    filterCv !== 'ALL' || 
    filterGmailOnly ||
    sortBy !== 'CUSTOM';

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterScore('ALL');
    setFilterWorkModel('ALL');
    setFilterCv('ALL');
    setFilterGmailOnly(false);
    setSortBy('CUSTOM');
  };

  const statusLabelsRo = {
    SAVED: 'Salvat',
    APPLIED: 'Aplicat',
    INTERVIEWING: 'Interviu',
    OFFER_RECEIVED: 'Oferta',
    REJECTED: 'Respins',
    WITHDRAWN: 'Retras'
  };

  // EXECUTIVE MATRIX & FUNNEL COMPUTED METRICS
  const statsMetrics = useMemo(() => {
    const total = applications.length;
    const saved = applications.filter(a => a.status === 'SAVED').length;
    const applied = applications.filter(a => a.status === 'APPLIED').length;
    const interviewing = applications.filter(a => a.status === 'INTERVIEWING').length;
    const offers = applications.filter(a => a.status === 'OFFER_RECEIVED').length;
    const rejected = applications.filter(a => a.status === 'REJECTED').length;

    const highMatch = applications.filter(a => Number(a.semanticMatchScore || 0) >= 80).length;
    const midMatch = applications.filter(a => {
      const s = Number(a.semanticMatchScore || 0);
      return s >= 50 && s < 80;
    }).length;

    const interviewConversionRate = total > 0 ? (((interviewing + offers) / total) * 100).toFixed(1) : '0.0';
    const offerConversionRate = interviewing > 0 ? ((offers / interviewing) * 100).toFixed(1) : '0.0';
    const passToAppliedRate = (saved + applied) > 0 ? ((applied / (saved + applied)) * 100).toFixed(0) : '0';
    const passToInterviewRate = (applied + interviewing) > 0 ? ((interviewing / (applied + interviewing)) * 100).toFixed(0) : '0';

    return {
      total,
      saved,
      applied,
      interviewing,
      offers,
      rejected,
      highMatch,
      midMatch,
      interviewConversionRate,
      offerConversionRate,
      passToAppliedRate,
      passToInterviewRate
    };
  }, [applications]);

  const topPriorityJobs = useMemo(() => {
    return [...applications]
      .filter(a => (a.status === 'SAVED' || a.status === 'APPLIED') && Number(a.semanticMatchScore || 0) > 0)
      .sort((a, b) => Number(b.semanticMatchScore || 0) - Number(a.semanticMatchScore || 0))
      .slice(0, 4);
  }, [applications]);

  // SPLIT STUDIO LOGIC
  const activeSplitApp = useMemo(() => {
    if (!filteredApplications.length) return null;
    return filteredApplications.find(a => a.id === selectedAppIdForSplit) || filteredApplications[0];
  }, [filteredApplications, selectedAppIdForSplit]);

  useEffect(() => {
    if (activeSplitApp) {
      setSplitNotesText(activeSplitApp.notes || '');
    } else {
      setSplitNotesText('');
    }
  }, [activeSplitApp?.id, activeSplitApp?.notes]);

  const splitFilteredApps = useMemo(() => {
    if (splitStageFilter === 'ALL') return filteredApplications;
    return filteredApplications.filter(a => a.status === splitStageFilter);
  }, [filteredApplications, splitStageFilter]);

  const handleSaveSplitNotes = async (appId) => {
    if (!appId) return;
    setIsSavingSplitNotes(true);
    try {
      const res = await fetch(`/api/v1/applications/${appId}/notes`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(activeUserId ? { 'X-User-Id': activeUserId } : {})
        },
        body: JSON.stringify({
          notes: splitNotesText
        })
      });
      if (res.ok) {
        const updated = await res.json();
        if (onApplicationUpdated) onApplicationUpdated(updated);
        setSplitNotesSavedToast(true);
        setTimeout(() => setSplitNotesSavedToast(false), 2500);
      }
    } catch (err) {
      console.error('Eroare la salvarea notitelor:', err);
    } finally {
      setIsSavingSplitNotes(false);
    }
  };

  // CAREER FUNNEL LOGIC
  const funnelBlocks = [
    {
      statusKey: 'SAVED',
      title: '1. Prospectare & Salvari',
      icon: Bookmark,
      stageDesc: 'Pozitii salvate din cautari care necesita pregatirea dosarului.',
      advanceLabel: 'Aplica Acum'
    },
    {
      statusKey: 'APPLIED',
      title: '2. Candidaturi Depuse & Outreach',
      icon: Send,
      stageDesc: 'Aplicatii trimise la companii, in asteptarea primului contact cu HR.',
      advanceLabel: 'Treci la Interviu'
    },
    {
      statusKey: 'INTERVIEWING',
      title: '3. Evaluare & Interviuri',
      icon: Calendar,
      stageDesc: 'Screening telefonic, interviuri tehnice si probe practice.',
      advanceLabel: 'Oferta Primita'
    },
    {
      statusKey: 'OFFER_RECEIVED',
      title: '4. Oferte Obtinute',
      icon: Award,
      stageDesc: 'Pozitii reusite, aflate in faza de decizie si negociere.',
      advanceLabel: null
    },
    {
      statusKey: 'REJECTED',
      title: '5. Candidaturi Inchise',
      icon: XCircle,
      stageDesc: 'Pozitii retrase sau refuzate, pastrate pentru analiza retrospectiva.',
      advanceLabel: null
    }
  ];

  const handleAdvanceStage = (app) => {
    const updateHandler = onUpdateStatus || onStatusChange;
    if (!updateHandler) return;
    if (app.status === 'SAVED') {
      updateHandler(app.id, 'APPLIED');
    } else if (app.status === 'APPLIED') {
      updateHandler(app.id, 'INTERVIEWING');
    } else if (app.status === 'INTERVIEWING') {
      updateHandler(app.id, 'OFFER_RECEIVED');
    }
  };

  const handleRejectStage = (app) => {
    const updateHandler = onUpdateStatus || onStatusChange;
    if (updateHandler) {
      updateHandler(app.id, 'REJECTED');
    }
  };

  // SPREADSHEET PRO LOGIC
  const handleToggleSelectAll = () => {
    if (selectedRowIds.size === filteredApplications.length && filteredApplications.length > 0) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(filteredApplications.map(a => a.id)));
    }
  };

  const handleToggleSelectRow = (id) => {
    setSelectedRowIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkStatusChange = (newStatus) => {
    const updateHandler = onUpdateStatus || onStatusChange;
    if (!updateHandler || selectedRowIds.size === 0) return;
    selectedRowIds.forEach(id => {
      updateHandler(id, newStatus);
    });
    setTrackerToast(`${selectedRowIds.size} aplicatii au fost actualizate la ${statusLabelsRo[newStatus] || newStatus}.`);
    setTimeout(() => setTrackerToast(null), 3000);
    setSelectedRowIds(new Set());
  };

  const handleBulkDelete = () => {
    if (selectedRowIds.size === 0 || !onDeleteApplication) return;
    if (window.confirm(`Sigur doresti sa stergi cele ${selectedRowIds.size} aplicatii selectate?`)) {
      selectedRowIds.forEach(id => {
        onDeleteApplication(id);
      });
      setSelectedRowIds(new Set());
      setTrackerToast('Aplicatiile selectate au fost sterse.');
      setTimeout(() => setTrackerToast(null), 3000);
    }
  };

  // SWIFT KANBAN MOTION ENGINE (POINTER EVENTS BASED - BUTTERY 60-120FPS GPU PHYSICS)
  const handlePointerDown = (e, app, sourceColKey, sourceIndex) => {
    // Left click or single touch only
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    // Don't drag if clicking buttons, selects, inputs, or links
    if (e.target.closest('button, select, input, a, textarea')) return;

    const cardEl = e.currentTarget;
    const rect = cardEl.getBoundingClientRect();

    dragStartRef.current = {
      app,
      sourceColKey,
      sourceIndex,
      cardEl,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      cardWidth: Math.round(rect.width),
      cardHeight: Math.round(rect.height),
      hasStarted: false,
    };

    const handlePointerMove = (moveEvent) => {
      if (!dragStartRef.current) return;

      const dx = moveEvent.clientX - dragStartRef.current.startX;
      const dy = moveEvent.clientY - dragStartRef.current.startY;

      if (!dragStartRef.current.hasStarted) {
        if (Math.hypot(dx, dy) < 6) return; // Allow normal clicks without starting drag
        dragStartRef.current.hasStarted = true;

        // Prevent native selection while dragging
        window.getSelection()?.removeAllRanges();

        setActiveDrag({
          app: dragStartRef.current.app,
          sourceColKey: dragStartRef.current.sourceColKey,
          sourceIndex: dragStartRef.current.sourceIndex,
          cardWidth: dragStartRef.current.cardWidth,
          cardHeight: dragStartRef.current.cardHeight,
          x: moveEvent.clientX - dragStartRef.current.offsetX,
          y: moveEvent.clientY - dragStartRef.current.offsetY,
        });

        // Do not open slot initially in source column so source gap can cleanly collapse
        setDropTargetSlot(null);

        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';
      }

      // Direct GPU transform update on floating card with signature Swift Kanban Lift & Tilt
      if (floatingCardRef.current) {
        const posX = moveEvent.clientX - dragStartRef.current.offsetX;
        const posY = moveEvent.clientY - dragStartRef.current.offsetY;
        floatingCardRef.current.style.transform = `translate3d(${posX}px, ${posY}px, 0) scale(1.04) rotate(4deg)`;
      }

      // Column and slot hit-testing
      const columnEls = Array.from(document.querySelectorAll('[data-kanban-col]'));
      let targetColKey = null;
      let targetColEl = null;

      for (const colEl of columnEls) {
        const colRect = colEl.getBoundingClientRect();
        if (
          moveEvent.clientX >= colRect.left && 
          moveEvent.clientX <= colRect.right &&
          moveEvent.clientY >= colRect.top - 60 &&
          moveEvent.clientY <= colRect.bottom + 80
        ) {
          targetColKey = colEl.getAttribute('data-kanban-col');
          targetColEl = colEl;
          break;
        }
      }

      if (!targetColEl) {
        setDropTargetSlot(null);
        return;
      }

      // Auto-scroll column if cursor is near top/bottom
      const scrollContainer = targetColEl.querySelector('[data-scroll-container]');
      if (scrollContainer) {
        const scRect = scrollContainer.getBoundingClientRect();
        if (moveEvent.clientY < scRect.top + 55 && moveEvent.clientY > scRect.top) {
          scrollContainer.scrollTop -= 8;
        } else if (moveEvent.clientY > scRect.bottom - 55 && moveEvent.clientY < scRect.bottom) {
          scrollContainer.scrollTop += 8;
        }
      }

      // Query visible cards inside target column, excluding the dragged card
      const cardWrappers = Array.from(targetColEl.querySelectorAll('[data-card-wrapper="true"]'));
      const otherCards = cardWrappers.filter(el => el.getAttribute('data-card-id') !== dragStartRef.current?.app?.id);

      let targetSlotIdx = 0;
      if (otherCards.length === 0) {
        targetSlotIdx = 0;
      } else {
        // Hysteresis deadband: If cursor is currently inside the active open drop slot in this column, KEEP IT!
        const currentSlot = dropTargetSlotRef.current;
        let keepCurrentSlot = false;

        if (currentSlot && currentSlot.columnKey === targetColKey) {
          const activeSlotEl = targetColEl.querySelector('[data-active-slot="true"]');
          if (activeSlotEl) {
            const slotRect = activeSlotEl.getBoundingClientRect();
            if (
              moveEvent.clientY >= slotRect.top - 20 && 
              moveEvent.clientY <= slotRect.bottom + 20
            ) {
              keepCurrentSlot = true;
              targetSlotIdx = currentSlot.slotIndex;
            }
          }
        }

        if (!keepCurrentSlot) {
          let found = otherCards.length;
          for (let i = 0; i < otherCards.length; i++) {
            const cRect = otherCards[i].getBoundingClientRect();
            const midY = cRect.top + cRect.height / 2;
            if (moveEvent.clientY < midY) {
              found = i;
              break;
            }
          }
          targetSlotIdx = found;
        }
      }

      setDropTargetSlot(prev => {
        if (prev?.columnKey === targetColKey && prev?.slotIndex === targetSlotIdx) return prev;
        return { columnKey: targetColKey, slotIndex: targetSlotIdx };
      });
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';

      if (dragStartRef.current?.hasStarted) {
        const movingApp = dragStartRef.current.app;
        const finalSlot = dropTargetSlotRef.current;
        if (finalSlot && finalSlot.columnKey) {
          executeMoveToSlot(movingApp.id, finalSlot.columnKey, finalSlot.slotIndex);
        }
      }

      setActiveDrag(null);
      setDropTargetSlot(null);
      dragStartRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  const executeMoveToSlot = (movingAppId, targetColumnKey, slotIndex) => {
    if (!movingAppId) return;

    const currentApps = [...applications];
    const movingIndex = currentApps.findIndex(a => a.id === movingAppId);
    if (movingIndex === -1) return;

    const movingApp = { ...currentApps[movingIndex] };
    const statusChanged = targetColumnKey && movingApp.status !== targetColumnKey;

    if (statusChanged) {
      movingApp.status = targetColumnKey;
    }

    // Eliminam aplicatia din pozitia initiala
    currentApps.splice(movingIndex, 1);

    // Identificam aplicatiile din coloana tinta (fara movingApp)
    const targetColApps = currentApps.filter(a => a.status === targetColumnKey);

    if (targetColApps.length === 0) {
      currentApps.push(movingApp);
    } else if (slotIndex <= 0) {
      const firstTargetIndex = currentApps.findIndex(a => a.id === targetColApps[0].id);
      currentApps.splice(firstTargetIndex, 0, movingApp);
    } else if (slotIndex >= targetColApps.length) {
      const lastTarget = targetColApps[targetColApps.length - 1];
      const lastTargetIndex = currentApps.findIndex(a => a.id === lastTarget.id);
      currentApps.splice(lastTargetIndex + 1, 0, movingApp);
    } else {
      const slotTarget = targetColApps[slotIndex];
      const slotTargetIndex = currentApps.findIndex(a => a.id === slotTarget.id);
      currentApps.splice(slotTargetIndex, 0, movingApp);
    }

    // Efect de arc spring recoil pe cardul plasat
    setJustDroppedCardId(movingAppId);
    setTimeout(() => {
      setJustDroppedCardId(null);
    }, 600);

    // Retinem ordinea manuala
    if (sortBy !== 'CUSTOM') {
      setSortBy('CUSTOM');
    }

    if (onReorderApplications) {
      onReorderApplications(currentApps);
    }

    if (statusChanged) {
      const updateHandler = onUpdateStatus || onStatusChange;
      if (updateHandler) {
        updateHandler(movingAppId, targetColumnKey);
      }
    }
  };

  const handleStatusSelectChange = (appId, newStatus) => {
    const updateHandler = onUpdateStatus || onStatusChange;
    if (updateHandler) {
      updateHandler(appId, newStatus);
    }
  };

  // ATTACH CV PROFILE HANDLER
  const handleAttachCvProfile = async (appId, cvProfileId) => {
    if (!cvProfileId) return;
    setAttachingCvAppId(appId);
    try {
      const res = await fetch(`/api/v1/applications/${appId}/cv/${cvProfileId}`, {
        method: 'PATCH'
      });
      if (res.ok) {
        const updated = await res.json();
        if (onApplicationUpdated) onApplicationUpdated(updated);
      }
    } catch (err) {
      console.error('Eroare la asocierea CV-ului:', err);
    } finally {
      setAttachingCvAppId(null);
    }
  };

  // ATTACH UPLOADED RESUME FILE HANDLER
  const handleAttachResume = async (appId, resumeId) => {
    if (!resumeId) return;
    setAttachingCvAppId(appId);
    try {
      const res = await fetch(`/api/v1/applications/${appId}/resume/${resumeId}`, {
        method: 'PATCH'
      });
      if (res.ok) {
        const updated = await res.json();
        if (onApplicationUpdated) onApplicationUpdated(updated);
      }
    } catch (err) {
      console.error('Eroare la asocierea fisierului de CV:', err);
    } finally {
      setAttachingCvAppId(null);
    }
  };

  // RENDER PURE MINIMAL DROP SLOT (ZERO TEXT, ZERO LABELS, EXACT CARD HEIGHT)
  const renderDropSlot = (columnKey, slotIndex) => {
    const isActive = Boolean(
      activeDrag && 
      dropTargetSlot?.columnKey === columnKey && 
      dropTargetSlot?.slotIndex === slotIndex
    );
    const targetH = Math.max(activeDrag?.cardHeight || 185, 175);

    return (
      <div 
        key={`drop-slot-${columnKey}-${slotIndex}`}
        data-active-slot={isActive ? 'true' : 'false'}
        data-slot-col={columnKey}
        data-slot-idx={slotIndex}
        style={{
          display: 'grid',
          gridTemplateRows: isActive ? '1fr' : '0fr',
          opacity: isActive ? 1 : 0,
          marginBottom: isActive ? '12px' : '0px',
          transition: activeDrag 
            ? 'grid-template-rows 280ms cubic-bezier(0.25, 1, 0.5, 1), margin-bottom 280ms cubic-bezier(0.25, 1, 0.5, 1), opacity 200ms ease-out'
            : 'none',
        }}
        className="w-full min-w-0"
      >
        <div style={{ overflow: 'hidden', minHeight: 0 }} className="w-full min-w-0">
          <div 
            style={{ height: `${targetH}px` }} 
            className="w-full rounded-xl border-2 border-dashed border-neutral-300/90 bg-neutral-100/60 shadow-inner flex items-center justify-center pointer-events-none select-none transition-colors"
          />
        </div>
      </div>
    );
  };

  // RENDER CARD INNER (SHARED BETWEEN COLUMN CARDS AND FLOATING PREVIEW)
  const renderCardInner = (app, isFloating = false) => {
    const score = app.semanticMatchScore ? Number(app.semanticMatchScore) : 0.0;
    const isGmail = isAppGmail(app);
    const emailSender = isGmail ? getEmailSender(app) : null;

    return (
      <>
        {/* CARD HEADER: COMPANY, TITLE, DELETE & DRAG */}
        <div className="flex items-start justify-between gap-1.5 w-full min-w-0">
          <div 
            onClick={() => {
              if (!isFloating) handleOpenJobModal(app);
            }}
            className="cursor-pointer group/title flex-1 min-w-0"
            title="Apasa pentru a deschide fisa completa a jobului"
          >
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-[13px] font-mono uppercase tracking-wider text-neutral-500 font-semibold truncate block group-hover/title:text-black transition">
                {app.companyName}
              </span>
              {isGmail && (
                <span className="inline-flex items-center gap-1 font-bold text-[10px] text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full shrink-0" title="Detectat automat prin sincronizare Gmail">
                  <Mail className="w-2.5 h-2.5 text-red-600 shrink-0" />
                  <span>Gmail</span>
                </span>
              )}
            </div>
            <h4 className="font-bold text-sm sm:text-[15px] text-neutral-950 leading-snug mt-1 line-clamp-2 group-hover/title:text-neutral-700 transition">
              {app.jobTitle}
            </h4>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            {!isFloating && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Sigur doresti sa stergi jobul ${app.jobTitle} la ${app.companyName}?`)) {
                    onDeleteApplication && onDeleteApplication(app.id);
                  }
                }}
                title="Sterge din Tracker"
                className="p-1.5 rounded-lg hover:bg-rose-50 text-neutral-300 hover:text-rose-600 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <GripVertical className="w-4 h-4 text-neutral-300 group-hover:text-neutral-600 shrink-0 cursor-grab" />
          </div>
        </div>

        {/* ROW BADGES: EXPEDITOR GMAIL / MATCH SCORE + DATA APLICARII */}
        {isGmail ? (
          <div className="flex items-center justify-between gap-1.5 w-full min-w-0">
            <span 
              className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md text-xs bg-red-50 text-red-700 border border-red-200 min-w-0 flex-1 truncate" 
              title={emailSender ? `Expeditor: ${emailSender}` : 'Email Recrutare Gmail'}
            >
              <Mail className="w-3 h-3 shrink-0 text-red-600" />
              <span className="truncate min-w-0">{emailSender ? `De la: ${emailSender}` : 'Email Recrutare'}</span>
            </span>

            {app.appliedDate && (
              <span 
                className="inline-flex items-center gap-1 font-mono text-xs text-neutral-500 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md shrink-0 ml-auto" 
                title={`Data: ${app.appliedDate}`}
              >
                <Calendar className="w-3 h-3 text-neutral-400 shrink-0" />
                <span className="whitespace-nowrap">{app.appliedDate}</span>
              </span>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-1.5 w-full min-w-0">
              <span className={`inline-flex items-center gap-1 font-mono font-bold text-xs px-2.5 py-0.5 rounded-md shrink-0 ${
                score >= 75 
                  ? 'bg-neutral-100 text-neutral-900 border border-neutral-300'
                  : score >= 50
                  ? 'bg-neutral-100 text-neutral-800 border border-neutral-200'
                  : 'bg-neutral-50 text-neutral-600 border border-neutral-200'
              }`}>
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-neutral-600" />
                <span>{score > 0 ? `${score.toFixed(0)}% Match` : 'ATS Match'}</span>
              </span>

              {app.appliedDate && (
                <span className="inline-flex items-center gap-1 font-mono text-xs text-neutral-500 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md shrink-0 ml-auto" title={`Data adaugarii/aplicarii: ${app.appliedDate}`}>
                  <Calendar className="w-3 h-3 text-neutral-400 shrink-0" />
                  <span className="whitespace-nowrap">{app.appliedDate}</span>
                </span>
              )}
            </div>

            {score > 0 && (
              <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden border border-neutral-200/60">
                <div 
                  className="h-full bg-neutral-900 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(10, score))}%` }}
                ></div>
              </div>
            )}
          </div>
        )}

        {/* CV SELECTOR (COMPACT & CLEAN) */}
        <div className="flex items-center gap-1.5 bg-neutral-50/80 hover:bg-neutral-100/80 px-2.5 py-1.5 rounded-lg border border-neutral-200/90 text-xs">
          <FileText className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <select
            value={app.cvProfileId ? `CV_${app.cvProfileId}` : (app.resumeId ? `RESUME_${app.resumeId}` : '')}
            onChange={(e) => {
              if (isFloating) return;
              const val = e.target.value;
              if (!val) return;
              if (val.startsWith('CV_')) {
                handleAttachCvProfile(app.id, val.replace('CV_', ''));
              } else if (val.startsWith('RESUME_')) {
                handleAttachResume(app.id, val.replace('RESUME_', ''));
              }
            }}
            disabled={isFloating || attachingCvAppId === app.id}
            className="bg-transparent text-neutral-800 font-medium outline-none cursor-pointer w-full text-xs truncate"
            title="Alege CV-ul asociat pentru aceasta aplicatie"
          >
            <option value="">CV Neselectat</option>
            {cvList.length > 0 && (
              <optgroup label="CV-uri din Studio">
                {cvList.map((cv) => (
                  <option key={cv.id} value={`CV_${cv.id}`}>
                    {cv.title}{cv.isPrimary ? ' [Principal]' : ''}
                  </option>
                ))}
              </optgroup>
            )}
            {uploadedResumes.length > 0 && (
              <optgroup label="Fisiere CV Incarcate">
                {uploadedResumes.map((r) => (
                  <option key={r.id} value={`RESUME_${r.id}`}>
                    {r.fileName}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          {app.cvProfileId && onEditCvInStudio && !isFloating && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEditCvInStudio(app.cvProfileId);
              }}
              className="text-neutral-400 hover:text-black p-0.5 cursor-pointer shrink-0"
              title="Editeaza acest CV in Studio"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* ACTION BUTTONS: CARD AERISIT CU FISA JOB + ACTIUNI RAPIDE ICON-ONLY */}
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
          <button
            type="button"
            onClick={(e) => {
              if (isFloating) return;
              e.stopPropagation();
              handleOpenJobModal(app);
            }}
            className="flex-1 py-2 px-3 rounded-xl border border-neutral-200/90 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer group active:scale-95"
            title="Deschide fisa completa si cerintele jobului"
          >
            <Eye className="w-4 h-4 text-neutral-700 group-hover:scale-110 transition-transform shrink-0" />
            <span>Fisa Job</span>
          </button>

          {onOpenCoverLetter && (
            <button
              type="button"
              onClick={(e) => {
                if (isFloating) return;
                e.stopPropagation();
                onOpenCoverLetter(app.id);
              }}
              className="p-2 rounded-xl border border-neutral-200/90 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-black transition shadow-2xs cursor-pointer group shrink-0 active:scale-95"
              title="Genereaza Scrisoare de Intentie AI pentru acest rol"
            >
              <FileSignature className="w-4 h-4 text-neutral-700 group-hover:scale-110 transition-transform" />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              if (isFloating) return;
              e.stopPropagation();
              setOutreachApp(app);
            }}
            className="p-1.5 rounded-xl border border-neutral-200/90 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-black transition shadow-2xs cursor-pointer group shrink-0 active:scale-95"
            title="Outreach Recruiter: Mesaj LinkedIn & Cold Email"
          >
            <Send className="w-3.5 h-3.5 text-neutral-700 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-4 font-sans text-neutral-900">
      
      {/* 1. TOP LUXURY LAYOUT SWITCHER BAR (5 VERSIUNI TRACKER + CALENDAR) */}
      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 px-1.5 shrink-0">
            Aranjament:
          </span>
          {TRACKER_LAYOUTS.map((layout) => {
            const Icon = layout.icon;
            const isActive = trackerLayout === layout.id;
            return (
              <button
                key={layout.id}
                onClick={() => handleSelectLayout(layout.id)}
                className={`flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 select-none ${
                  isActive
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 hover:text-black border border-transparent'
                }`}
                title={layout.desc}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-white' : 'text-neutral-600'}`} />
                <span>{layout.label}</span>
              </button>
            );
          })}

          <div className="h-4 w-[1px] bg-neutral-200 mx-1 shrink-0" />

          {/* CALENDAR UTILITY VIEW */}
          <button
            onClick={() => handleSelectLayout('calendar')}
            className={`flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 select-none ${
              trackerLayout === 'calendar'
                ? 'bg-black text-white shadow-xs'
                : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 hover:text-black'
            }`}
            title="Vizualizare Calendar & Agenda Aplicari"
          >
            <Calendar className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${trackerLayout === 'calendar' ? 'text-white' : 'text-neutral-600'}`} />
            <span>Calendar</span>
          </button>
        </div>

        {/* QUICK ACTIONS: EXPORT CSV, SYNC GMAIL, ADAUGA JOB */}
        <div className="flex items-center gap-2 self-start xl:self-auto shrink-0 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-300 text-neutral-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-95"
            title="Descarca lista aplicatiilor in format CSV compatibil Excel"
          >
            <Download className="w-3.5 h-3.5 text-neutral-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsGmailModalOpen(true)}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-95"
            title="Sincronizeaza automat statusul aplicatiilor din emailurile Gmail"
          >
            <Mail className="w-3.5 h-3.5 text-neutral-300" />
            <span>Sync Gmail</span>
          </button>

          {onOpenAddJob && (
            <button
              onClick={onOpenAddJob}
              className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-95"
              title="Adauga un job nou manual in tracker"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adauga Job</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. SEARCH & FILTER TOOLBAR */}
      {currentUser && (
        <div className="bg-white border border-neutral-200/90 shadow-2xs p-3.5 sm:p-4 rounded-2xl space-y-3">
          
          {/* SEARCH & SORT ROW */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Cauta dupa companie, titlu sau locatie..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black text-xs font-bold p-1 cursor-pointer"
                  title="Sterge cautarea"
                >
                  &#x2715;
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs sm:text-sm shrink-0 self-start sm:self-auto">
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span className="text-xs font-mono font-bold text-neutral-500 shrink-0 uppercase">Ordonare:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-neutral-900 font-bold text-xs outline-none cursor-pointer"
              >
                <option value="CUSTOM">Ordine Manuala (Custom)</option>
                <option value="SCORE_DESC">Scor ATS (Mare la Mic)</option>
                <option value="SCORE_ASC">Scor ATS (Mic la Mare)</option>
                <option value="DATE_DESC">Cele mai recente</option>
                <option value="COMPANY_ASC">Companie (A - Z)</option>
                <option value="TITLE_ASC">Titlu Job (A - Z)</option>
              </select>
            </div>
          </div>

          {/* FILTER PILLS ROW */}
          <div className="flex items-center gap-2 flex-wrap pt-2.5 border-t border-neutral-100 text-xs">
            <div className="flex items-center gap-1.5 text-neutral-500 font-bold text-xs shrink-0 font-mono">
              <Filter className="w-3.5 h-3.5 text-neutral-500" />
              <span>Filtre:</span>
            </div>

            {/* FILTER SCOR ATS */}
            <div className="flex items-center gap-1.5 bg-neutral-50 px-2.5 py-1 rounded-lg border border-neutral-200">
              <Sparkles className="w-3 h-3 text-neutral-700 shrink-0" />
              <span className="text-xs text-neutral-500 font-semibold font-mono">Scor:</span>
              <select
                value={filterScore}
                onChange={(e) => setFilterScore(e.target.value)}
                className="bg-transparent text-neutral-900 font-bold text-xs outline-none cursor-pointer"
              >
                <option value="ALL">Toate scorurile</option>
                <option value="HIGH">&gt; 80% Match</option>
                <option value="MID">50% - 80% Match</option>
                <option value="LOW">&lt; 50% Match</option>
              </select>
            </div>

            {/* FILTER MOD DE LUCRU */}
            <div className="flex items-center gap-1.5 bg-neutral-50 px-2.5 py-1 rounded-lg border border-neutral-200">
              <Briefcase className="w-3 h-3 text-neutral-700 shrink-0" />
              <span className="text-xs text-neutral-500 font-semibold font-mono">Mod:</span>
              <select
                value={filterWorkModel}
                onChange={(e) => setFilterWorkModel(e.target.value)}
                className="bg-transparent text-neutral-900 font-bold text-xs outline-none cursor-pointer"
              >
                <option value="ALL">Toate modurile</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hibrid</option>
                <option value="ONSITE">On-site</option>
              </select>
            </div>

            {/* FILTER CV ASOCIAT */}
            <div className="flex items-center gap-1.5 bg-neutral-50 px-2.5 py-1 rounded-lg border border-neutral-200">
              <FileText className="w-3 h-3 text-neutral-700 shrink-0" />
              <span className="text-xs text-neutral-500 font-semibold font-mono">CV:</span>
              <select
                value={filterCv}
                onChange={(e) => setFilterCv(e.target.value)}
                className="bg-transparent text-neutral-900 font-bold text-xs outline-none cursor-pointer"
              >
                <option value="ALL">Toate aplicatiile</option>
                <option value="ATTACHED">Cu CV asociat</option>
                <option value="UNATTACHED">Fara CV asociat</option>
              </select>
            </div>

            {/* FILTER DOAR DIN GMAIL */}
            <button
              type="button"
              onClick={() => setFilterGmailOnly(prev => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition cursor-pointer select-none ${
                filterGmailOnly 
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs' 
                  : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
              }`}
              title="Filtreaza doar joburile sincronizate din Gmail"
            >
              <Mail className={`w-3 h-3 ${filterGmailOnly ? 'text-white' : 'text-neutral-500'}`} />
              <span>Gmail Only</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                filterGmailOnly ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-neutral-800'
              }`}>
                {gmailJobsCount}
              </span>
            </button>

            {/* COUNT OF RESULTS */}
            <span className="text-xs text-neutral-400 font-mono ml-auto">
              Afisare: <strong className="text-neutral-900">{filteredApplications.length}</strong> din {applications.length}
            </span>

            {/* RESET FILTERS BUTTON */}
            {isAnyFilterActive && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 hover:text-black text-xs font-bold transition cursor-pointer"
                title="Reseteaza toate filtrele"
              >
                <RotateCcw className="w-3 h-3 text-neutral-500" />
                <span>Reseteaza</span>
              </button>
            )}

          </div>

        </div>
      )}

      {/* 3. DYNAMIC VIEW HEADER WITH INSTRUCTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-4.5 rounded-2xl border border-neutral-200/90 shadow-2xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-neutral-950 flex items-center gap-2.5 tracking-tight">
            <FolderKanban className="w-5 h-5 text-neutral-950" />
            {trackerLayout === 'kanban' && '1. Swift Board: Coloane Agil & Drag-and-Drop'}
            {trackerLayout === 'split' && '2. Split Studio: Master-Detail & Inspector Live'}
            {trackerLayout === 'matrix' && '3. Executive Matrix: KPI Analytics & Swimlanes'}
            {trackerLayout === 'table' && '4. Spreadsheet Pro: Tabel Densitate Mare & Bulk Actions'}
            {trackerLayout === 'funnel' && '5. Career Funnel: Palnie Progresiva & Roadmap'}
            {trackerLayout === 'calendar' && 'Calendar & Agenda Aplicari'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 font-medium mt-1">
            {trackerLayout === 'kanban' && 'Trage orice card in alta coloana cu tranzitii fluide sau reordoneaza-le direct pentru a-ti organiza procesul.'}
            {trackerLayout === 'split' && 'Selecteaza o candidatura din feed-ul din stanga pentru a edita notitele, a schimba statusul cu 1-click si a citi descrierea in dreapta.'}
            {trackerLayout === 'matrix' && 'Tablou de bord executiv cu rata de conversie a palniei, tinte ATS prioritare si swimlane-uri orizontale pe fiecare etapa.'}
            {trackerLayout === 'table' && 'Tabel dens stil Airtable/Notion cu selectie multipla, actiuni in masa, ordonare rapida si dropdown-uri inline.'}
            {trackerLayout === 'funnel' && 'Urmareste rata de trecere intre stadii si avanseaza fiecare aplicatie pas-cu-pas catre oferta finala cu un singur buton.'}
            {trackerLayout === 'calendar' && 'Vizualizeaza cronologic aplicarile pe zile, monitorizeaza interviurile si programeaza activitati.'}
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. KANBAN VIEW (COLUMNS WITH DRAG & DROP & PREVIEW) */}
      {/* ========================================================================= */}
      {trackerLayout === 'kanban' && (
        <>
          {/* MOBILE COLUMN TAB SELECTOR */}
          <div className="flex md:hidden overflow-x-auto gap-1.5 p-1.5 bg-neutral-100 rounded-2xl border border-neutral-200">
            {kanbanColumns.map((col) => {
              const count = filteredApplications.filter(a => a.status === col.key).length;
              const ColIcon = col.icon;
              const isSelected = mobileSelectedColumn === col.key;
              return (
                <button
                  key={col.key}
                  onClick={() => setMobileSelectedColumn(col.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition cursor-pointer ${
                    isSelected 
                      ? `${col.tabActive} shadow-sm font-black` 
                      : 'text-neutral-700 hover:text-black bg-white/70'
                  }`}
                >
                  <ColIcon className="w-3.5 h-3.5" />
                  <span>{col.title}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-800'
                  }`}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* KANBAN GRID WITH INTERNAL SCROLLING & FIXED TOTAL HEIGHT */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-4 items-start">
            {kanbanColumns.map((col) => {
              const colApps = filteredApplications.filter(app => app.status === col.key);
              const isMobileVisible = mobileSelectedColumn === col.key;
              const isDragOverCol = (dropTargetSlot?.columnKey === col.key) && Boolean(activeDrag);
              const ColIcon = col.icon;

              return (
                <div 
                  key={col.key} 
                  data-kanban-col={col.key}
                  className={`rounded-2xl border ${col.columnBg} ${col.accentBorder} transition-all duration-200 flex flex-col h-[calc(100vh-230px)] min-h-[500px] max-h-[760px] shadow-xs overflow-hidden ${
                    isDragOverCol ? 'ring-2 ring-neutral-900/60 shadow-md' : ''
                  } ${isMobileVisible ? 'flex' : 'hidden md:flex'}`}
                >
                  {/* FIXED COLUMN HEADER */}
                  <div className={`flex items-center justify-between px-4 py-3 ${col.headerBg} font-bold text-sm sm:text-base shrink-0`}>
                    <div className="flex items-center gap-2">
                      <ColIcon className={`w-4 h-4 ${col.iconColor} shrink-0`} />
                      <span className="truncate">{col.title}</span>
                    </div>
                    <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-md ${col.badgeBg}`}>
                      {colApps.length}
                    </span>
                  </div>

                  {/* SCROLLABLE CARDS CONTAINER */}
                  <div 
                    data-scroll-container="true"
                    className="flex-1 overflow-y-auto p-2.5 sm:p-3 min-h-0 flex flex-col"
                  >
                    {/* TOP DROP SLOT (SLOT 0) */}
                    {renderDropSlot(col.key, 0)}

                    {colApps.map((app, index) => {
                      const isBeingDragged = activeDrag && activeDrag.app.id === app.id;
                      const otherCardsInCol = colApps.filter(a => !(activeDrag && a.id === activeDrag.app.id));
                      const visibleIdx = otherCardsInCol.findIndex(a => a.id === app.id);
                      const slotAfterIdx = visibleIdx !== -1 ? visibleIdx + 1 : index + 1;

                      return (
                        <React.Fragment key={app.id}>
                          {/* COLLAPSIBLE CARD WRAPPER (PERMANENT GRID FOR SMOOTH 340MS FLUID COLLAPSE) */}
                          <div
                            data-card-wrapper="true"
                            data-card-id={app.id}
                            style={{
                              display: 'grid',
                              gridTemplateRows: isBeingDragged ? '0fr' : '1fr',
                              opacity: isBeingDragged ? 0 : 1,
                              marginBottom: isBeingDragged ? '0px' : '12px',
                              transition: isBeingDragged
                                ? 'grid-template-rows 340ms cubic-bezier(0.25, 1, 0.5, 1), margin-bottom 340ms cubic-bezier(0.25, 1, 0.5, 1), opacity 220ms ease-out'
                                : 'none',
                            }}
                            className="w-full min-w-0"
                          >
                            <div style={{ overflow: 'hidden', minHeight: 0 }} className="w-full min-w-0">
                              <div
                                draggable={false}
                                onDragStart={(e) => { e.preventDefault(); return false; }}
                                onPointerDown={(e) => handlePointerDown(e, app, col.key, visibleIdx)}
                                style={{ touchAction: 'none', userSelect: 'none' }}
                                className={`bg-white border rounded-xl p-3.5 space-y-3 relative group shadow-2xs hover:shadow-md transition-shadow text-neutral-900 cursor-grab active:cursor-grabbing w-full min-w-0 border-neutral-200/90 hover:border-neutral-400 select-none ${
                                  justDroppedCardId === app.id ? 'animate-card-settle' : ''
                                }`}
                              >
                                {renderCardInner(app)}
                              </div>
                            </div>
                          </div>

                          {/* DROP SLOT AFTER THIS CARD (RENDER ONLY IF THIS CARD IS NOT BEING DRAGGED) */}
                          {!isBeingDragged && renderDropSlot(col.key, slotAfterIdx)}
                        </React.Fragment>
                      );
                    })}

                    {/* EMPTY COLUMN PLACEHOLDER WHEN NOT DRAGGING */}
                    {colApps.length === 0 && !activeDrag && (
                      <div className="h-28 w-full flex items-center justify-center text-xs text-neutral-400 font-medium italic border border-dashed border-neutral-300/80 rounded-xl p-3 text-center select-none">
                        {currentUser ? 'Niciun job in aceasta etapa' : 'Autentifica-te'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* FLOATING CARD PORTAL (FOLLOWS CURSOR WITH SWIFT KANBAN LIFT & TILT) */}
          {activeDrag && (
            <div
              ref={floatingCardRef}
              style={{
                position: 'fixed',
                left: 0,
                top: 0,
                width: `${activeDrag.cardWidth}px`,
                pointerEvents: 'none',
                zIndex: 99999,
                transform: `translate3d(${activeDrag.x}px, ${activeDrag.y}px, 0) scale(1.04) rotate(4deg)`,
                willChange: 'transform',
                boxShadow: '0 25px 45px -8px rgba(0, 0, 0, 0.3), 0 12px 22px -6px rgba(0, 0, 0, 0.15)',
                opacity: 1,
              }}
              className="bg-white border border-neutral-300/90 rounded-xl p-3.5 space-y-3 select-none cursor-grabbing"
            >
              {renderCardInner(activeDrag.app, true)}
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. SPLIT STUDIO VIEW (MASTER-DETAIL DUAL PANE & LIVE INSPECTOR)           */}
      {/* ========================================================================= */}
      {trackerLayout === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* LEFT PANE: APPLICATION FEED */}
          <div className="lg:col-span-5 flex flex-col h-[calc(100vh-230px)] min-h-[580px] max-h-[820px] bg-[#fafafa] border border-neutral-200/90 rounded-2xl overflow-hidden shadow-2xs">
            {/* LEFT HEADER & QUICK CHIPS */}
            <div className="p-3.5 bg-white border-b border-neutral-200/90 space-y-2.5 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PanelLeft className="w-4 h-4 text-neutral-800" />
                  <span className="font-bold text-sm text-neutral-950">Feed Aplicatii</span>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 border border-neutral-200">
                  {splitFilteredApps.length}
                </span>
              </div>
              
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
                {[
                  { key: 'ALL', label: 'Toate' },
                  { key: 'SAVED', label: 'Salvate' },
                  { key: 'APPLIED', label: 'Aplicat' },
                  { key: 'INTERVIEWING', label: 'Interviu' },
                  { key: 'OFFER_RECEIVED', label: 'Oferta' },
                  { key: 'REJECTED', label: 'Respins' }
                ].map(chip => (
                  <button
                    key={chip.key}
                    onClick={() => setSplitStageFilter(chip.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      splitStageFilter === chip.key
                        ? 'bg-black text-white shadow-2xs'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SCROLLABLE FEED LIST */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {splitFilteredApps.length > 0 ? (
                splitFilteredApps.map((app) => {
                  const isSelected = activeSplitApp?.id === app.id;
                  const score = Number(app.semanticMatchScore || 0);
                  const isGmail = isAppGmail(app);
                  return (
                    <div
                      key={app.id}
                      onClick={() => setSelectedAppIdForSplit(app.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'bg-white border-black ring-2 ring-black/80 shadow-sm'
                          : 'bg-white hover:bg-neutral-50/80 border-neutral-200/90 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold truncate block">
                              {app.companyName}
                            </span>
                            {isGmail && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded-full">
                                <Mail className="w-2.5 h-2.5 text-red-600" />
                                <span>Gmail</span>
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-sm text-neutral-950 truncate mt-0.5">
                            {app.jobTitle}
                          </h4>
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${statusColorMap[app.status] || 'bg-neutral-100 text-neutral-700 border-neutral-200'}`}>
                          {statusLabelsRo[app.status] || app.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-neutral-100 text-xs">
                        <div className="flex items-center gap-1.5 text-neutral-500">
                          <Briefcase className="w-3 h-3 text-neutral-400" />
                          <span>{app.workModel || 'Nespecificat'}</span>
                          {app.jobLocation && <span className="text-neutral-300">•</span>}
                          {app.jobLocation && <span className="truncate max-w-[110px]">{app.jobLocation}</span>}
                        </div>
                        {score > 0 && (
                          <span className="flex items-center gap-1 font-mono font-bold text-neutral-800 shrink-0">
                            <Sparkles className="w-3 h-3 text-neutral-600" />
                            {score.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-neutral-400 font-medium italic">
                  Nicio aplicatie gasita in aceasta selectie.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANE: LIVE STUDIO INSPECTOR */}
          <div className="lg:col-span-7 flex flex-col h-[calc(100vh-230px)] min-h-[580px] max-h-[820px] bg-white border border-neutral-200/90 rounded-2xl overflow-hidden shadow-2xs">
            {activeSplitApp ? (
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* INSPECTOR HEADER */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-neutral-200">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono uppercase font-bold text-neutral-500">
                        {activeSplitApp.companyName}
                      </span>
                      {isAppGmail(activeSplitApp) && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                          <Mail className="w-3 h-3 text-red-600" />
                          <span>Sincronizat Gmail</span>
                        </span>
                      )}
                      {activeSplitApp.appliedDate && (
                        <span className="inline-flex items-center gap-1 text-xs font-mono text-neutral-500 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md">
                          <Calendar className="w-3 h-3 text-neutral-400" />
                          <span>{activeSplitApp.appliedDate}</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-neutral-950 mt-1 leading-snug">
                      {activeSplitApp.jobTitle}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-xs font-medium text-neutral-600 flex-wrap">
                      <span>{activeSplitApp.jobLocation || activeSplitApp.location || 'Romania'}</span>
                      <span>•</span>
                      <span className="font-semibold text-neutral-800">{activeSplitApp.workModel || 'REMOTE'}</span>
                      {activeSplitApp.salaryRange && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-neutral-900 font-semibold">{activeSplitApp.salaryRange}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {activeSplitApp.jobUrl && (
                      <a
                        href={activeSplitApp.jobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-black transition cursor-pointer"
                        title="Deschide anuntul original"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm(`Sigur doresti sa stergi jobul ${activeSplitApp.jobTitle}?`)) {
                          onDeleteApplication && onDeleteApplication(activeSplitApp.id);
                        }
                      }}
                      className="p-2 rounded-xl hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition cursor-pointer"
                      title="Sterge aplicatia"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* QUICK 1-CLICK STATUS STEPPER */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                    Schimba Statusul (1-Click)
                  </label>
                  <div className="grid grid-cols-5 gap-1.5 bg-neutral-100 p-1.5 rounded-xl border border-neutral-200">
                    {kanbanColumns.map(col => {
                      const isActive = activeSplitApp.status === col.key;
                      return (
                        <button
                          key={col.key}
                          onClick={() => handleStatusSelectChange(activeSplitApp.id, col.key)}
                          className={`py-2 px-1 rounded-lg text-xs font-bold transition text-center truncate cursor-pointer ${
                            isActive
                              ? 'bg-black text-white shadow-xs'
                              : 'bg-white hover:bg-neutral-50 text-neutral-700 hover:text-black border border-neutral-200/60'
                          }`}
                        >
                          {col.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ATS SEMANTIC MATCH GAUGE */}
                <div className="bg-neutral-50 border border-neutral-200/90 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold uppercase text-neutral-500 block">
                      ATS Semantic Match Score
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-mono font-bold text-neutral-950">
                        {Number(activeSplitApp.semanticMatchScore || 0).toFixed(1)}%
                      </span>
                      <span className="text-xs font-semibold text-neutral-600">
                        {Number(activeSplitApp.semanticMatchScore || 0) >= 80 ? 'Potrivire Excelenta' : Number(activeSplitApp.semanticMatchScore || 0) >= 50 ? 'Potrivire Buna' : 'Potrivire Moderata'}
                      </span>
                    </div>
                  </div>
                  <div className="w-32 bg-neutral-200 h-2 rounded-full overflow-hidden shrink-0">
                    <div
                      className="h-full bg-black rounded-full"
                      style={{ width: `${Math.min(100, Math.max(8, Number(activeSplitApp.semanticMatchScore || 0)))}%` }}
                    />
                  </div>
                </div>

                {/* LIVE NOTES EDITOR */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                      <StickyNote className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Notite & Urmarire Aplicatie</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {splitNotesSavedToast && (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                          <Check className="w-3.5 h-3.5" /> Salvat!
                        </span>
                      )}
                      <button
                        onClick={() => handleSaveSplitNotes(activeSplitApp.id)}
                        disabled={isSavingSplitNotes}
                        className="px-3 py-1 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs disabled:opacity-50"
                      >
                        <Save className="w-3 h-3" />
                        <span>{isSavingSplitNotes ? 'Salvare...' : 'Salveaza Notite'}</span>
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={splitNotesText}
                    onChange={(e) => setSplitNotesText(e.target.value)}
                    placeholder="Adauga notite despre interviuri, salarii discutate, contacte ale recrutorilor..."
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition resize-none"
                  />
                </div>

                {/* ATTACHED CV & RESUME SELECTOR */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-neutral-500" />
                    <span>CV / Rezumat Asociat</span>
                  </label>
                  <div className="flex items-center gap-2 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                    <select
                      value={activeSplitApp.cvProfileId ? `CV_${activeSplitApp.cvProfileId}` : (activeSplitApp.resumeId ? `RESUME_${activeSplitApp.resumeId}` : '')}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) return;
                        if (val.startsWith('CV_')) handleAttachCvProfile(activeSplitApp.id, val.replace('CV_', ''));
                        else if (val.startsWith('RESUME_')) handleAttachResume(activeSplitApp.id, val.replace('RESUME_', ''));
                      }}
                      disabled={attachingCvAppId === activeSplitApp.id}
                      className="bg-transparent text-neutral-900 font-medium outline-none cursor-pointer flex-1 text-xs sm:text-sm truncate"
                    >
                      <option value="">-- Alege CV sau Fisier --</option>
                      {cvList.length > 0 && (
                        <optgroup label="CV-uri Create in Studio">
                          {cvList.map((cv) => (
                            <option key={cv.id} value={`CV_${cv.id}`}>{cv.title}{cv.isPrimary ? ' [Principal]' : ''}</option>
                          ))}
                        </optgroup>
                      )}
                      {uploadedResumes.length > 0 && (
                        <optgroup label="Fisiere CV Incarcate">
                          {uploadedResumes.map((r) => (
                            <option key={r.id} value={`RESUME_${r.id}`}>Fisier: {r.fileName}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    {activeSplitApp.cvProfileId && onEditCvInStudio && (
                      <button
                        onClick={() => onEditCvInStudio(activeSplitApp.cvProfileId)}
                        className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 rounded-lg text-xs font-bold transition cursor-pointer"
                        title="Editeaza CV in Studio"
                      >
                        Editeaza in Studio
                      </button>
                    )}
                  </div>
                </div>

                {/* ACTION BUTTONS TOOLBAR */}
                <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 flex-wrap">
                  <button
                    onClick={() => handleOpenJobModal(activeSplitApp)}
                    className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Fisa Completa</span>
                  </button>
                  {onOpenCoverLetter && (
                    <button
                      onClick={() => onOpenCoverLetter(activeSplitApp.id)}
                      className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <FileSignature className="w-3.5 h-3.5" />
                      <span>Scrisoare Intentie AI</span>
                    </button>
                  )}
                  <button
                    onClick={() => setOutreachApp(activeSplitApp)}
                    className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Outreach CRM</span>
                  </button>
                </div>

                {/* RAW DESCRIPTION / EMAIL BODY READER */}
                <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                    Descriere Job & Continut
                  </span>
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-xs sm:text-sm text-neutral-800 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-line font-sans">
                    {activeSplitApp.rawDescription || 'Nu exista o descriere text salvata pentru aceasta aplicatie.'}
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400 space-y-2">
                <PanelLeft className="w-8 h-8 text-neutral-300" />
                <p className="font-semibold text-sm text-neutral-700">Nicio aplicatie selectata</p>
                <p className="text-xs text-neutral-400 max-w-sm">
                  Selecteaza o aplicatie din lista din stanga pentru a deschide inspectorul in timp real.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. EXECUTIVE MATRIX VIEW (KPI ANALYTICS & HORIZONTAL STAGE SWIMLANES)    */}
      {/* ========================================================================= */}
      {trackerLayout === 'matrix' && (
        <div className="space-y-5">
          {/* 4 TOP EXECUTIVE KPI METRIC CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {/* 1. RATA CONVERSIE PIPELINE */}
            <div className="bg-white p-4.5 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-mono font-bold uppercase tracking-wider">Conversie Pipeline</span>
                <TrendingUp className="w-4 h-4 text-neutral-700" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-neutral-950">
                  {statsMetrics.interviewConversionRate}%
                </span>
                <span className="text-xs font-semibold text-neutral-500 font-mono">interviuri/oferte</span>
              </div>
              <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-black h-full rounded-full" style={{ width: `${Math.min(100, Number(statsMetrics.interviewConversionRate))}%` }} />
              </div>
            </div>

            {/* 2. TINTE PRIORITARE SCOR >80% */}
            <div className="bg-white p-4.5 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-mono font-bold uppercase tracking-wider">Tinte ATS Ridicat</span>
                <Sparkles className="w-4 h-4 text-neutral-700" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-neutral-950">
                  {statsMetrics.highMatch}
                </span>
                <span className="text-xs font-semibold text-neutral-500 font-mono">&gt; 80% Match ATS</span>
              </div>
              <p className="text-[11px] text-neutral-500 font-medium truncate">
                Candidaturi cu sanse maxime de selectie
              </p>
            </div>

            {/* 3. INTERVIURI ACTIVE */}
            <div className="bg-white p-4.5 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-mono font-bold uppercase tracking-wider">Interviuri Active</span>
                <Calendar className="w-4 h-4 text-neutral-950" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-neutral-950">
                  {statsMetrics.interviewing}
                </span>
                <span className="text-xs font-semibold text-neutral-500 font-mono">in desfasurare</span>
              </div>
              <p className="text-[11px] text-neutral-500 font-medium truncate">
                Etape de testare si discutii finale
              </p>
            </div>

            {/* 4. OFERTE PRIMITE */}
            <div className="bg-white p-4.5 rounded-2xl border border-emerald-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-emerald-700">
                <span className="text-xs font-mono font-bold uppercase tracking-wider">Oferte Obtinute</span>
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-emerald-950">
                  {statsMetrics.offers}
                </span>
                <span className="text-xs font-semibold text-emerald-700 font-mono">succese finale</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium truncate">
                Propuneri salariale receptionate
              </p>
            </div>
          </div>

          {/* TOP PRIORITY ACTION STRIP */}
          {topPriorityJobs.length > 0 && (
            <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-neutral-950" />
                  <h4 className="font-bold text-sm text-neutral-950">Focalizare Prioritara: Top Scoruri ATS</h4>
                </div>
                <span className="text-xs font-mono text-neutral-500">Actiuni recomandate</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {topPriorityJobs.map(job => (
                  <div key={job.id} className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2 hover:border-neutral-400 transition">
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="min-w-0">
                        <span className="text-[11px] font-mono uppercase text-neutral-500 font-semibold block truncate">
                          {job.companyName}
                        </span>
                        <h5 className="font-bold text-xs text-neutral-950 truncate mt-0.5">
                          {job.jobTitle}
                        </h5>
                      </div>
                      <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-neutral-900 text-white rounded-md shrink-0">
                        {Number(job.semanticMatchScore).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-neutral-200/60">
                      <button
                        onClick={() => handleOpenJobModal(job)}
                        className="text-xs font-bold text-neutral-700 hover:text-black cursor-pointer"
                      >
                        Vezi Fisa
                      </button>
                      {job.status === 'SAVED' && (
                        <button
                          onClick={() => handleStatusSelectChange(job.id, 'APPLIED')}
                          className="text-xs font-bold text-neutral-900 bg-white border border-neutral-300 hover:bg-neutral-100 px-2 py-0.5 rounded-lg transition cursor-pointer"
                        >
                          Aplica Acum
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HORIZONTAL STAGE SWIMLANES */}
          <div className="space-y-3">
            {kanbanColumns.map(col => {
              const laneApps = filteredApplications.filter(a => a.status === col.key);
              const ColIcon = col.icon;
              return (
                <div key={col.key} className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-stretch gap-4">
                  {/* LEFT STAGE PILLAR */}
                  <div className="md:w-56 shrink-0 flex md:flex-col justify-between items-start border-b md:border-b-0 md:border-r border-neutral-200/80 pb-3 md:pb-0 md:pr-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <ColIcon className={`w-4 h-4 ${col.iconColor}`} />
                        <h4 className="font-bold text-sm sm:text-base text-neutral-950">{col.title}</h4>
                      </div>
                      <p className="text-xs text-neutral-500 hidden md:block">
                        {col.key === 'SAVED' && 'Identificate in piata'}
                        {col.key === 'APPLIED' && 'Candidaturi transmise'}
                        {col.key === 'INTERVIEWING' && 'Runde de selectie'}
                        {col.key === 'OFFER_RECEIVED' && 'Propuneri primite'}
                        {col.key === 'REJECTED' && 'Inchise sau arhivate'}
                      </p>
                    </div>
                    <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-md ${col.badgeBg}`}>
                      {laneApps.length} aplicatii
                    </span>
                  </div>

                  {/* RIGHT HORIZONTAL CARDS TRACK */}
                  <div className="flex-1 overflow-x-auto flex gap-3 py-1 items-stretch no-scrollbar min-h-[110px]">
                    {laneApps.length > 0 ? (
                      laneApps.map(app => {
                        const score = Number(app.semanticMatchScore || 0);
                        const isGmail = isAppGmail(app);
                        return (
                          <div
                            key={app.id}
                            className="w-[280px] shrink-0 bg-neutral-50/80 border border-neutral-200/90 hover:border-neutral-400 rounded-xl p-3 flex flex-col justify-between gap-2.5 transition shadow-2xs"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-[11px] font-mono uppercase text-neutral-500 font-semibold truncate">
                                  {app.companyName}
                                </span>
                                {score > 0 && (
                                  <span className="text-[11px] font-mono font-bold text-neutral-900 bg-white border border-neutral-200 px-1.5 py-0.2 rounded shrink-0">
                                    {score.toFixed(0)}%
                                  </span>
                                )}
                              </div>
                              <h5
                                onClick={() => handleOpenJobModal(app)}
                                className="font-bold text-xs sm:text-sm text-neutral-950 truncate mt-0.5 cursor-pointer hover:text-neutral-700"
                              >
                                {app.jobTitle}
                              </h5>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 text-xs">
                              {/* SELECT STATUS COMPACT */}
                              <select
                                value={app.status}
                                onChange={(e) => handleStatusSelectChange(app.id, e.target.value)}
                                className="bg-white border border-neutral-200 text-neutral-900 font-semibold text-[11px] px-2 py-1 rounded-lg outline-none cursor-pointer"
                              >
                                <option value="SAVED">Salvate</option>
                                <option value="APPLIED">Aplicat</option>
                                <option value="INTERVIEWING">Interviu</option>
                                <option value="OFFER_RECEIVED">Oferta</option>
                                <option value="REJECTED">Respins</option>
                              </select>

                              {/* ACTIONS */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenJobModal(app)}
                                  className="p-1 hover:bg-neutral-200 rounded-md text-neutral-600 transition cursor-pointer"
                                  title="Fisa Job"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                {onOpenCoverLetter && (
                                  <button
                                    onClick={() => onOpenCoverLetter(app.id)}
                                    className="p-1 hover:bg-neutral-200 rounded-md text-neutral-600 transition cursor-pointer"
                                    title="Scrisoare de Intentie"
                                  >
                                    <FileSignature className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => setOutreachApp(app)}
                                  className="p-1 hover:bg-neutral-200 rounded-md text-neutral-600 transition cursor-pointer"
                                  title="Outreach"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-xs text-neutral-400 font-medium italic border border-dashed border-neutral-200 rounded-xl p-4">
                        Nicio aplicatie in acest stadiu
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SPREADSHEET PRO VIEW (NOTION/AIRTABLE DENSITY & BULK ACTIONS)           */}
      {/* ========================================================================= */}
      {trackerLayout === 'table' && (
        <div className="space-y-3 font-sans">
          {/* FLOATING BULK ACTION BAR */}
          {selectedRowIds.size > 0 && (
            <div className="bg-black text-white p-3 sm:px-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg border border-neutral-800 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs sm:text-sm">
                  {selectedRowIds.size} {selectedRowIds.size === 1 ? 'aplicatie selectata' : 'aplicatii selectate'}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleBulkStatusChange('APPLIED')}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  Marcheaza ca Aplicat
                </button>
                <button
                  onClick={() => handleBulkStatusChange('INTERVIEWING')}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  Marcheaza ca Interviu
                </button>
                <button
                  onClick={() => handleBulkStatusChange('OFFER_RECEIVED')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 text-xs font-bold transition cursor-pointer"
                >
                  Marcheaza ca Oferta
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold transition cursor-pointer"
                >
                  Sterge
                </button>
                <button
                  onClick={() => setSelectedRowIds(new Set())}
                  className="px-3 py-1.5 rounded-xl bg-transparent hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-bold transition cursor-pointer"
                >
                  Deselecteaza
                </button>
              </div>
            </div>
          )}

          {/* FULL-WIDTH SPREADSHEET TABLE */}
          <div className="bg-white border border-neutral-200/90 shadow-2xs rounded-2xl overflow-hidden">
            {filteredApplications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/90 text-xs font-mono font-bold text-neutral-500 uppercase tracking-wider select-none">
                      <th className="py-3.5 px-4 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedRowIds.size === filteredApplications.length && filteredApplications.length > 0}
                          onChange={handleToggleSelectAll}
                          className="w-4 h-4 rounded text-black cursor-pointer"
                          title="Selecteaza tot"
                        />
                      </th>
                      <th 
                        onClick={() => setSortBy(sortBy === 'COMPANY_ASC' ? 'CUSTOM' : 'COMPANY_ASC')}
                        className="py-3.5 px-4 cursor-pointer hover:text-black"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Companie & Job</span>
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </div>
                      </th>
                      <th className="py-3.5 px-4">Status</th>
                      <th 
                        onClick={() => setSortBy(sortBy === 'SCORE_DESC' ? 'SCORE_ASC' : 'SCORE_DESC')}
                        className="py-3.5 px-4 cursor-pointer hover:text-black"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Scor ATS</span>
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </div>
                      </th>
                      <th className="py-3.5 px-4">CV Asociat</th>
                      <th className="py-3.5 px-4">Mod / Locatie</th>
                      <th className="py-3.5 px-4">Salariu</th>
                      <th 
                        onClick={() => setSortBy(sortBy === 'DATE_DESC' ? 'CUSTOM' : 'DATE_DESC')}
                        className="py-3.5 px-4 cursor-pointer hover:text-black"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Data</span>
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </div>
                      </th>
                      <th className="py-3.5 px-4 text-right">Actiuni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-xs sm:text-sm">
                    {filteredApplications.map(app => {
                      const isSelected = selectedRowIds.has(app.id);
                      const score = Number(app.semanticMatchScore || 0);
                      const isGmail = isAppGmail(app);
                      return (
                        <tr
                          key={app.id}
                          className={`transition-colors ${
                            isSelected ? 'bg-neutral-100/70' : 'hover:bg-neutral-50/60'
                          }`}
                        >
                          {/* CHECKBOX */}
                          <td className="py-3 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectRow(app.id)}
                              className="w-4 h-4 rounded text-black cursor-pointer"
                            />
                          </td>

                          {/* COMPANIE & JOB */}
                          <td className="py-3 px-4">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[11px] font-mono uppercase font-semibold text-neutral-500">
                                  {app.companyName}
                                </span>
                                {isGmail && (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-red-700 bg-red-50 border border-red-200 px-1 py-0.2 rounded-full">
                                    <Mail className="w-2.5 h-2.5 text-red-600" />
                                    <span>Gmail</span>
                                  </span>
                                )}
                              </div>
                              <span
                                onClick={() => handleOpenJobModal(app)}
                                className="font-bold text-sm text-neutral-950 block hover:text-neutral-700 transition cursor-pointer"
                              >
                                {app.jobTitle}
                              </span>
                            </div>
                          </td>

                          {/* STATUS DROPDOWN */}
                          <td className="py-3 px-4">
                            <select
                              value={app.status}
                              onChange={(e) => handleStatusSelectChange(app.id, e.target.value)}
                              className={`text-xs font-bold px-2.5 py-1 rounded-xl border outline-none cursor-pointer transition ${
                                statusColorMap[app.status] || 'bg-neutral-50 text-neutral-700 border-neutral-200'
                              }`}
                            >
                              <option value="SAVED">Salvate</option>
                              <option value="APPLIED">Aplicat</option>
                              <option value="INTERVIEWING">Interviu</option>
                              <option value="OFFER_RECEIVED">Oferta</option>
                              <option value="REJECTED">Respins</option>
                            </select>
                          </td>

                          {/* SCOR ATS */}
                          <td className="py-3 px-4">
                            {score > 0 ? (
                              <div className="w-28 space-y-1">
                                <span className="font-mono font-bold text-neutral-900 text-xs">
                                  {score.toFixed(0)}%
                                </span>
                                <div className="w-full bg-neutral-100 h-1 rounded-full overflow-hidden border border-neutral-200">
                                  <div className="h-full bg-black rounded-full" style={{ width: `${Math.min(100, Math.max(10, score))}%` }} />
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-neutral-400 font-mono">-</span>
                            )}
                          </td>

                          {/* CV ASOCIAT */}
                          <td className="py-3 px-4">
                            <select
                              value={app.cvProfileId ? `CV_${app.cvProfileId}` : (app.resumeId ? `RESUME_${app.resumeId}` : '')}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (!val) return;
                                if (val.startsWith('CV_')) handleAttachCvProfile(app.id, val.replace('CV_', ''));
                                else if (val.startsWith('RESUME_')) handleAttachResume(app.id, val.replace('RESUME_', ''));
                              }}
                              disabled={attachingCvAppId === app.id}
                              className="bg-neutral-50 border border-neutral-200 text-neutral-900 text-xs px-2 py-1 rounded-lg outline-none cursor-pointer max-w-[150px] truncate"
                            >
                              <option value="">Fara CV</option>
                              {cvList.map(cv => (
                                <option key={cv.id} value={`CV_${cv.id}`}>{cv.title}</option>
                              ))}
                              {uploadedResumes.map(r => (
                                <option key={r.id} value={`RESUME_${r.id}`}>{r.fileName}</option>
                              ))}
                            </select>
                          </td>

                          {/* MOD & LOCATIE */}
                          <td className="py-3 px-4 text-xs text-neutral-600">
                            <span className="font-semibold text-neutral-800">{app.workModel || 'REMOTE'}</span>
                            {app.jobLocation && <div className="text-[11px] text-neutral-400 truncate max-w-[120px]">{app.jobLocation}</div>}
                          </td>

                          {/* SALARIU */}
                          <td className="py-3 px-4 text-xs font-mono text-neutral-700">
                            {app.salaryRange || '-'}
                          </td>

                          {/* DATA */}
                          <td className="py-3 px-4 text-xs font-mono text-neutral-500 whitespace-nowrap">
                            {app.appliedDate || (app.createdAt ? new Date(app.createdAt).toLocaleDateString('ro-RO') : '-')}
                          </td>

                          {/* ACTIUNI */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenJobModal(app)}
                                className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-600 transition cursor-pointer"
                                title="Fisa Job"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {onOpenCoverLetter && (
                                <button
                                  onClick={() => onOpenCoverLetter(app.id)}
                                  className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-600 transition cursor-pointer"
                                  title="Scrisoare de Intentie"
                                >
                                  <FileSignature className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => setOutreachApp(app)}
                                className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-600 transition cursor-pointer"
                                title="Outreach Recruiter"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Sigur doresti sa stergi jobul ${app.jobTitle}?`)) {
                                    onDeleteApplication && onDeleteApplication(app.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-neutral-300 hover:text-rose-600 transition cursor-pointer"
                                title="Sterge"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center text-xs text-neutral-400 font-medium italic">
                Nicio aplicatie gasita in tabel.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CAREER FUNNEL VIEW (PROGRESSIVE PIPELINE & ROADMAP)                    */}
      {/* ========================================================================= */}
      {trackerLayout === 'funnel' && (
        <div className="space-y-5">
          {/* SEQUENTIAL STEPPER PIPELINE BAR */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-neutral-950" />
                <h4 className="font-bold text-sm sm:text-base text-neutral-950">
                  Palnia Carierii & Rata de Trecere
                </h4>
              </div>
              <span className="text-xs font-mono text-neutral-500">
                Total in flux: {applications.length}
              </span>
            </div>

            {/* 4 STAGES STEPPER WITH CONVERSION METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
              {/* STEP 1: PROSPECTARE */}
              <div 
                onClick={() => setFunnelStageFilter(funnelStageFilter === 'SAVED' ? 'ALL' : 'SAVED')}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  funnelStageFilter === 'SAVED' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase">1. Prospectare</span>
                  <Bookmark className="w-3.5 h-3.5" />
                </div>
                <div className="text-2xl font-mono font-bold mt-1">{statsMetrics.saved}</div>
                <span className="text-[11px] opacity-70 block mt-0.5">Joburi salvate</span>
              </div>

              {/* STEP 2: DEPUNERE */}
              <div 
                onClick={() => setFunnelStageFilter(funnelStageFilter === 'APPLIED' ? 'ALL' : 'APPLIED')}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  funnelStageFilter === 'APPLIED' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase">2. Depunere</span>
                  <Send className="w-3.5 h-3.5" />
                </div>
                <div className="text-2xl font-mono font-bold mt-1">{statsMetrics.applied}</div>
                <span className="text-[11px] opacity-70 block mt-0.5">Rata avansare: {statsMetrics.passToAppliedRate}%</span>
              </div>

              {/* STEP 3: EVALUARE */}
              <div 
                onClick={() => setFunnelStageFilter(funnelStageFilter === 'INTERVIEWING' ? 'ALL' : 'INTERVIEWING')}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  funnelStageFilter === 'INTERVIEWING' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase">3. Evaluare</span>
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div className="text-2xl font-mono font-bold mt-1">{statsMetrics.interviewing}</div>
                <span className="text-[11px] opacity-70 block mt-0.5">Rata interviu: {statsMetrics.passToInterviewRate}%</span>
              </div>

              {/* STEP 4: REZULTATE */}
              <div 
                onClick={() => setFunnelStageFilter(funnelStageFilter === 'OFFER_RECEIVED' ? 'ALL' : 'OFFER_RECEIVED')}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  funnelStageFilter === 'OFFER_RECEIVED' ? 'bg-emerald-950 text-white border-emerald-900' : 'bg-emerald-50/60 hover:bg-emerald-50 border-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-emerald-800">4. Oferte</span>
                  <Award className="w-3.5 h-3.5 text-emerald-700" />
                </div>
                <div className="text-2xl font-mono font-bold text-emerald-950 mt-1">{statsMetrics.offers}</div>
                <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">Rata oferta: {statsMetrics.offerConversionRate}%</span>
              </div>
            </div>
          </div>

          {/* SMART ADVICE BANNER */}
          <div className="bg-neutral-900 text-white p-4 rounded-2xl border border-neutral-800 flex items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <h5 className="font-bold text-xs sm:text-sm">Recomandare Progresie Inteligenta</h5>
                <p className="text-xs text-neutral-300 mt-0.5">
                  {statsMetrics.saved > 0
                    ? `Ai ${statsMetrics.saved} joburi salvate in stadiul de Prospectare. Foloseste Scrisoarea de Intentie AI si trimite dosarul pentru a trece in etapa de Depunere.`
                    : statsMetrics.interviewing > 0
                    ? `Excelent! Ai ${statsMetrics.interviewing} interviuri in curs. Pregateste intrebarile frecvente si fa follow-up cu recrutorul.`
                    : 'Continua adaugarea de pozitii noi din cautari pentru a alimenta palnia de recrutare.'}
                </p>
              </div>
            </div>
            {funnelStageFilter !== 'ALL' && (
              <button
                onClick={() => setFunnelStageFilter('ALL')}
                className="text-xs font-bold text-neutral-300 hover:text-white underline shrink-0 cursor-pointer"
              >
                Afiseaza tot
              </button>
            )}
          </div>

          {/* CARDS DISPLAYED IN FUNNEL STAGE BLOCKS WITH DIRECT ADVANCEMENT BUTTON */}
          <div className="space-y-6">
            {funnelBlocks.map(block => {
              const blockApps = filteredApplications.filter(a => a.status === block.statusKey);
              if (funnelStageFilter !== 'ALL' && funnelStageFilter !== block.statusKey) return null;
              const BlockIcon = block.icon;

              return (
                <div key={block.statusKey} className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <BlockIcon className="w-4 h-4 text-neutral-950" />
                      <h4 className="font-bold text-sm sm:text-base text-neutral-950">{block.title}</h4>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 border border-neutral-200">
                        {blockApps.length}
                      </span>
                    </div>
                    <span className="text-xs text-neutral-500 font-medium hidden sm:block">
                      {block.stageDesc}
                    </span>
                  </div>

                  {blockApps.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {blockApps.map(app => {
                        const score = Number(app.semanticMatchScore || 0);
                        const isGmail = isAppGmail(app);
                        return (
                          <div key={app.id} className="bg-neutral-50 border border-neutral-200/90 hover:border-neutral-400 rounded-xl p-4 flex flex-col justify-between gap-3 transition shadow-2xs">
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <span className="text-[11px] font-mono uppercase text-neutral-500 font-semibold block truncate">
                                    {app.companyName}
                                  </span>
                                  <h5
                                    onClick={() => handleOpenJobModal(app)}
                                    className="font-bold text-sm text-neutral-950 truncate mt-0.5 cursor-pointer hover:text-neutral-700"
                                  >
                                    {app.jobTitle}
                                  </h5>
                                </div>
                                {score > 0 && (
                                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-white border border-neutral-200 rounded-md text-neutral-900 shrink-0">
                                    {score.toFixed(0)}%
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-xs text-neutral-500 mt-2">
                                <span>{app.workModel || 'REMOTE'}</span>
                                <span>•</span>
                                <span className="truncate">{app.jobLocation || 'Romania'}</span>
                              </div>
                            </div>

                            {/* FUNNEL ADVANCEMENT ACTION ROW */}
                            <div className="pt-2.5 border-t border-neutral-200/80 flex items-center justify-between gap-2">
                              {block.advanceLabel && (
                                <button
                                  onClick={() => handleAdvanceStage(app)}
                                  className="flex-1 py-1.5 px-3 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-95"
                                >
                                  <span>{block.advanceLabel}</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleOpenJobModal(app)}
                                className="p-1.5 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 transition cursor-pointer"
                                title="Fisa Detaliata"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {block.statusKey !== 'REJECTED' && (
                                <button
                                  onClick={() => handleRejectStage(app)}
                                  className="p-1.5 rounded-xl bg-white border border-neutral-200 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition cursor-pointer"
                                  title="Marcheaza ca Respins"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-neutral-400 font-medium italic border border-dashed border-neutral-200 rounded-xl">
                      Nicio aplicatie in aceasta etapa a palniei.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. CALENDAR VIEW (CHRONOLOGICAL TIMELINE & AGENDA)                        */}
      {/* ========================================================================= */}
      {trackerLayout === 'calendar' && (
        <CalendarView
          applications={filteredApplications}
          onOpenJobModal={handleOpenJobModal}
          onOpenCoverLetter={onOpenCoverLetter}
          onOpenOutreach={(targetJob) => setOutreachApp(targetJob)}
          onDeleteApplication={onDeleteApplication}
          onStatusChange={handleStatusSelectChange}
          statusColorMap={statusColorMap}
          statusDotMap={statusDotMap}
          onApplicationUpdated={onApplicationUpdated}
          activeUserId={activeUserId}
        />
      )}

      {/* JOB DETAIL MODAL INTEGRAT IN TRACKER */}
      {selectedJobForModal && (
        <JobDetailModal
          job={selectedJobForModal}
          onClose={() => setSelectedJobForModal(null)}
          isSaved={true}
          activeUserId={activeUserId}
          onOpenCoverLetter={onOpenCoverLetter}
          onOpenOutreach={(targetJob) => setOutreachApp(targetJob)}
        />
      )}

      {/* GMAIL ATS AUTO-SYNC MODAL */}
      <GmailSyncModal 
        isOpen={isGmailModalOpen}
        onClose={() => setIsGmailModalOpen(false)}
        onSyncComplete={() => {
          if (onRefreshApplications) onRefreshApplications();
          setTrackerToast('Sincronizarea cu Gmail a fost finalizata cu succes!');
          setTimeout(() => setTrackerToast(null), 4000);
        }}
        activeUserId={activeUserId}
      />

      {/* OUTREACH CRM MODAL (NOTE LINKEDIN, COLD EMAIL, CADENCE) */}
      {outreachApp && (
        <OutreachCrmModal 
          isOpen={!!outreachApp}
          onClose={() => setOutreachApp(null)}
          application={outreachApp}
        />
      )}

      {/* TOAST FEEDBACK NOTIFICATION */}
      {trackerToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-4 py-3 rounded-2xl shadow-xl border border-gray-800 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{trackerToast}</span>
        </div>
      )}

    </div>
  );
}
