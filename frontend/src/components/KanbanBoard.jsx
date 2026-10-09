import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Building2, 
  Sparkles, 
  FileText, 
  BrainCircuit, 
  RefreshCw, 
  Search, 
  Filter, 
  Trash2, 
  Columns, 
  List,
  Edit3,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Send,
  Calendar,
  XCircle,
  Plus,
  FolderKanban,
  ArrowUpDown,
  RotateCcw,
  Briefcase,
  StickyNote,
  X,
  Save,
  Mail,
  FileSignature
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

export const normalizeStatus = (status) => {
  if (status === 'SAVED') return 'APPLIED';
  if (status === 'OFFER_RECEIVED') return 'INTERVIEWING';
  return status || 'APPLIED';
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
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list' | 'calendar'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('CUSTOM'); // 'CUSTOM' | 'SCORE_DESC' | 'SCORE_ASC' | 'DATE_DESC' | 'COMPANY_ASC' | 'TITLE_ASC'
  const [filterScore, setFilterScore] = useState('ALL'); // 'ALL' | 'HIGH' | 'MID' | 'LOW'
  const [filterWorkModel, setFilterWorkModel] = useState('ALL'); // 'ALL' | 'REMOTE' | 'HYBRID' | 'ONSITE'
  const [filterCv, setFilterCv] = useState('ALL'); // 'ALL' | 'ATTACHED' | 'UNATTACHED'
  const [filterGmailOnly, setFilterGmailOnly] = useState(false);
  const [mobileSelectedColumn, setMobileSelectedColumn] = useState('APPLIED');
  
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
    APPLIED: 'bg-neutral-100 text-neutral-800 border-neutral-300',
    INTERVIEWING: 'bg-neutral-900 text-white border-neutral-900',
    REJECTED: 'bg-neutral-100 text-neutral-500 border-neutral-200',
    SAVED: 'bg-neutral-100 text-neutral-800 border-neutral-300',
    OFFER_RECEIVED: 'bg-neutral-900 text-white border-neutral-900',
  };

  const statusDotMap = {
    APPLIED: 'bg-neutral-600',
    INTERVIEWING: 'bg-neutral-950',
    REJECTED: 'bg-neutral-300',
    SAVED: 'bg-neutral-600',
    OFFER_RECEIVED: 'bg-neutral-950',
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
    const targetColApps = currentApps.filter(a => normalizeStatus(a.status) === targetColumnKey);

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
    const targetH = Math.max(activeDrag?.cardHeight || 86, 76);

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
    const isGmail = isAppGmail(app);

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
                className="p-1 rounded-md text-neutral-300 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer shrink-0 opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* CARD FOOTER: METADATA CHIPS & QUICK ACTIONS */}
        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-neutral-100 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0 text-[11px] text-neutral-500 font-mono">
            {app.appliedDate && (
              <span className="inline-flex items-center gap-1 shrink-0" title={`Data aplicarii: ${app.appliedDate}`}>
                <Calendar className="w-3 h-3 text-neutral-400 shrink-0" />
                <span>{app.appliedDate}</span>
              </span>
            )}
            {(app.workModel || app.jobLocation || app.location) && (
              <span className="text-neutral-400 truncate max-w-[140px]" title={app.workModel || app.jobLocation || app.location}>
                {app.appliedDate ? '• ' : ''}{app.workModel || app.jobLocation || app.location}
              </span>
            )}
            {!app.appliedDate && !app.workModel && !app.jobLocation && !app.location && (
              <span className="text-neutral-400 italic font-sans text-[11px]">Detalii disponibile</span>
            )}
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            {onOpenCoverLetter && !isFloating && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCoverLetter(app.id);
                }}
                className="p-1 rounded-md text-neutral-400 hover:text-black hover:bg-neutral-100 transition cursor-pointer"
                title="Genereaza Scrisoare de Intentie AI"
              >
                <FileSignature className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                if (isFloating) return;
                e.stopPropagation();
                handleOpenJobModal(app);
              }}
              className="p-1 rounded-md text-neutral-400 hover:text-black hover:bg-neutral-100 transition cursor-pointer"
              title="Deschide fisa detaliata a jobului (procent match, CV, outreach)"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-3 font-sans text-neutral-900">
      
      {/* UNIFIED SINGLE HEADER & TOOLBAR */}
      <div className="bg-white border border-neutral-200/90 shadow-2xs p-3 sm:p-4 rounded-2xl space-y-2.5">
        
        {/* ROW 1: BRAND TITLE + SEARCH + VIEW MODE + ACTION BUTTONS */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
          
          {/* TITLE & TOTAL COUNT */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-neutral-950 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <FolderKanban className="w-4.5 h-4.5" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-neutral-950 tracking-tight leading-none">
                {viewMode === 'kanban' 
                  ? 'Tracker & Pipeline' 
                  : viewMode === 'list' 
                  ? 'Lista Centralizata' 
                  : 'Calendar & Agenda'}
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
                {filteredApplications.length}
              </span>
            </div>
          </div>

          {/* SEARCH INPUT */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Cauta companie, titlu, locatie..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 outline-none transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black text-xs font-bold p-1 cursor-pointer"
                title="Sterge textul cautat"
              >
                ✕
              </button>
            )}
          </div>

          {/* CONTROLS & ACTIONS GROUP */}
          <div className="flex items-center gap-2 flex-wrap justify-between lg:justify-end">
            
            {/* VIEW MODE TOGGLE */}
            <div className="flex items-center bg-neutral-100 p-0.5 rounded-xl border border-neutral-200 shrink-0">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'kanban' 
                    ? 'bg-black text-white shadow-2xs' 
                    : 'text-neutral-600 hover:text-black hover:bg-neutral-200/60'
                }`}
                title="Vizualizare Kanban Board"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'list' 
                    ? 'bg-black text-white shadow-2xs' 
                    : 'text-neutral-600 hover:text-black hover:bg-neutral-200/60'
                }`}
                title="Vizualizare Lista Tabelara"
              >
                <List className="w-3.5 h-3.5" />
                <span>Lista</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'calendar' 
                    ? 'bg-black text-white shadow-2xs' 
                    : 'text-neutral-600 hover:text-black hover:bg-neutral-200/60'
                }`}
                title="Vizualizare Calendar & Agenda Aplicari"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Calendar</span>
              </button>
            </div>

            {/* GMAIL SYNC BUTTON */}
            <button
              onClick={() => setIsGmailModalOpen(true)}
              className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs shrink-0 active:scale-95"
              title="Sincronizeaza statusul aplicatiilor din emailurile Gmail"
            >
              <Mail className="w-3.5 h-3.5 text-neutral-600" />
              <span>Gmail Sync</span>
            </button>

            {/* ADAUGA JOB BUTTON */}
            {onOpenAddJob && (
              <button
                onClick={onOpenAddJob}
                className="px-3.5 py-2 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer shrink-0 active:scale-95 border border-neutral-900 group"
                title="Adauga un job nou manual in tracker"
              >
                <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                <span>Adauga Job</span>
              </button>
            )}

          </div>

        </div>

        {/* ROW 2: FILTERS & SORTING INLINE */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-neutral-100 text-xs">
          
          {/* SORT BY */}
          <div className="flex items-center gap-1.5 bg-neutral-50 px-2.5 py-1 rounded-lg border border-neutral-200">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <span className="text-[11px] font-mono font-bold text-neutral-500 uppercase shrink-0">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-neutral-900 font-bold text-xs outline-none cursor-pointer"
            >
              <option value="CUSTOM">Manual (Drag & Drop)</option>
              <option value="SCORE_DESC">Scor ATS (Descrescator)</option>
              <option value="SCORE_ASC">Scor ATS (Crescator)</option>
              <option value="DATE_DESC">Cele mai recente</option>
              <option value="COMPANY_ASC">Companie (A - Z)</option>
              <option value="TITLE_ASC">Titlu Job (A - Z)</option>
            </select>
          </div>

          {/* FILTER MOD DE LUCRU */}
          <div className="flex items-center gap-1.5 bg-neutral-50 px-2.5 py-1 rounded-lg border border-neutral-200">
            <Briefcase className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <span className="text-[11px] font-mono text-neutral-500 font-semibold">Mod:</span>
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

          {/* FILTER SCOR ATS */}
          <div className="flex items-center gap-1.5 bg-neutral-50 px-2.5 py-1 rounded-lg border border-neutral-200">
            <Sparkles className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <span className="text-[11px] font-mono text-neutral-500 font-semibold">Scor:</span>
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

          {/* FILTER CV ASOCIAT */}
          <div className="flex items-center gap-1.5 bg-neutral-50 px-2.5 py-1 rounded-lg border border-neutral-200">
            <FileText className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <span className="text-[11px] font-mono text-neutral-500 font-semibold">CV:</span>
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
            title="Filtreaza doar aplicatiile extrase din Gmail"
          >
            <Mail className={`w-3.5 h-3.5 ${filterGmailOnly ? 'text-white' : 'text-neutral-500'}`} />
            <span>Doar din Gmail</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
              filterGmailOnly ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-neutral-800'
            }`}>
              {gmailJobsCount}
            </span>
          </button>

          {/* RESET BUTTON */}
          {isAnyFilterActive && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 hover:text-black text-xs font-bold transition cursor-pointer"
              title="Reseteaza filtrele si cautarea"
            >
              <RotateCcw className="w-3 h-3 text-neutral-500" />
              <span>Reseteaza</span>
            </button>
          )}

          {/* RESULTS COUNT */}
          <span className="text-[11px] text-neutral-400 font-mono ml-auto">
            Afisare: <strong className="text-neutral-900">{filteredApplications.length}</strong> din {applications.length}
          </span>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 1. KANBAN VIEW (COLUMNS WITH DRAG & DROP & PREVIEW) */}
      {/* ========================================================================= */}
      {viewMode === 'kanban' && (
        <>
          {/* MOBILE COLUMN TAB SELECTOR */}
          <div className="flex md:hidden overflow-x-auto gap-1.5 p-1.5 bg-neutral-100 rounded-2xl border border-neutral-200">
            {kanbanColumns.map((col) => {
              const count = filteredApplications.filter(a => normalizeStatus(a.status) === col.key).length;
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 items-start">
            {kanbanColumns.map((col) => {
              const colApps = filteredApplications.filter(app => normalizeStatus(app.status) === col.key);
              const isMobileVisible = mobileSelectedColumn === col.key;
              const isDragOverCol = (dropTargetSlot?.columnKey === col.key) && Boolean(activeDrag);
              const ColIcon = col.icon;

              return (
                <div 
                  key={col.key} 
                  data-kanban-col={col.key}
                  className={`rounded-2xl border ${col.columnBg} ${col.accentBorder} transition-all duration-200 flex flex-col h-[calc(100vh-175px)] min-h-[480px] shadow-xs overflow-hidden ${
                    isDragOverCol ? 'ring-2 ring-neutral-900/60 shadow-md' : ''
                  } ${isMobileVisible ? 'flex' : 'hidden md:flex'}`}
                >
                  {/* FIXED COLUMN HEADER */}
                  <div className={`flex items-center justify-between px-4 py-2.5 ${col.headerBg} font-bold text-sm sm:text-base shrink-0`}>
                    <div className="flex items-center gap-2">
                      <ColIcon className={`w-4 h-4 ${col.iconColor} shrink-0`} />
                      <span className="truncate">{col.title}</span>
                    </div>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${col.badgeBg}`}>
                      {colApps.length}
                    </span>
                  </div>

                  {/* SCROLLABLE CARDS CONTAINER */}
                  <div 
                    data-scroll-container="true"
                    className="flex-1 overflow-y-auto p-2 sm:p-2.5 pr-1.5 sm:pr-2 min-h-0 flex flex-col kanban-column-scroll"
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
                              marginBottom: isBeingDragged ? '0px' : '8px',
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
                                className={`bg-white border rounded-xl p-3 space-y-2 relative group shadow-2xs hover:shadow-xs transition-all text-neutral-900 cursor-pointer active:cursor-grabbing w-full min-w-0 border-neutral-200/90 hover:border-neutral-400 select-none ${
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
              className="bg-white border border-neutral-300/90 rounded-xl p-3 space-y-2 select-none cursor-grabbing"
            >
              {renderCardInner(activeDrag.app, true)}
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. LIST VIEW (CLEAN MINIMALIST TABLE & CARDS WITH CV SELECTOR) */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="bg-white border border-gray-200/90 shadow-sm rounded-2xl overflow-hidden font-sans">
          
          {filteredApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50/80 text-xs font-mono font-bold text-neutral-500 uppercase tracking-wider">
                    <th className="py-4 px-4 sm:px-6">Companie & Job</th>
                    <th className="py-4 px-4">Status Curent</th>
                    <th className="py-4 px-4">Scor Match AI</th>
                    <th className="py-4 px-4">CV Asociat</th>
                    <th className="py-4 px-4 sm:px-6 text-right">Actiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-sm">
                  {filteredApplications.map((app) => {
                    const score = app.semanticMatchScore ? Number(app.semanticMatchScore) : 0.0;
                    const isGmail = app.sourcePlatform === 'GMAIL' 
                      || (app.rawDescription && app.rawDescription.includes('GMAIL'))
                      || (app.notes && app.notes.includes('[Gmail Sync'));
                    const emailSender = isGmail ? getEmailSender(app) : null;
                    return (
                      <tr key={app.id} className="hover:bg-neutral-50/70 transition-colors group">
                        
                        {/* 1. COMPANIE & JOB */}
                        <td className="py-4 px-4 sm:px-6">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-xs sm:text-[13px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                                {app.companyName}
                              </span>
                              {isGmail && (
                                <span className="inline-flex items-center gap-1 font-bold text-[10px] text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full" title="Detectat automat prin sincronizare Gmail">
                                  <Mail className="w-3 h-3 text-red-600 shrink-0" />
                                  <span>Gmail</span>
                                </span>
                              )}
                              {app.appliedDate && (
                                <span className="inline-flex items-center gap-1 font-mono text-xs text-neutral-500 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md" title={`Data aplicarii: ${app.appliedDate}`}>
                                  <Calendar className="w-3 h-3 text-neutral-400 shrink-0" />
                                  <span>{app.appliedDate}</span>
                                </span>
                              )}
                            </div>
                            <span 
                              onClick={() => handleOpenJobModal(app)}
                              className="font-bold text-sm sm:text-base text-neutral-950 block hover:text-neutral-700 transition cursor-pointer"
                              title="Deschide fisa completa a jobului"
                            >
                              {app.jobTitle}
                            </span>
                            {app.jobLocation && (
                              <span className="text-xs text-neutral-500 block mt-0.5">
                                {app.jobLocation}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 2. STATUS DROPDOWN */}
                        <td className="py-4 px-4">
                          <div className="inline-flex items-center gap-1.5 relative">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${statusDotMap[normalizeStatus(app.status)] || 'bg-neutral-400'}`}></span>
                            <select
                              value={normalizeStatus(app.status)}
                              onChange={(e) => handleStatusSelectChange(app.id, e.target.value)}
                              className={`text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer transition ${statusColorMap[normalizeStatus(app.status)] || 'bg-neutral-50 text-neutral-700 border-neutral-200'}`}
                            >
                              <option value="APPLIED">Aplicat</option>
                              <option value="INTERVIEWING">Interviu</option>
                              <option value="REJECTED">Respins</option>
                            </select>
                          </div>
                        </td>

                        {/* 3. SCOR MATCH AI */}
                        <td className="py-4 px-4">
                          {isGmail ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs font-bold max-w-[180px] truncate" title={emailSender ? `Expeditor: ${emailSender}` : 'Email Recrutare Gmail'}>
                              <Mail className="w-4 h-4 text-red-600 shrink-0" />
                              <span className="truncate">{emailSender ? emailSender : 'Email Recrutare'}</span>
                            </div>
                          ) : (
                            <div className="w-40 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1 font-mono font-bold text-neutral-900 text-xs sm:text-sm">
                                  <Sparkles className="w-3.5 h-3.5 text-neutral-600" />
                                  {score.toFixed(1)}%
                                </span>
                                <span className="text-xs text-neutral-500 font-mono">ATS Match</span>
                              </div>
                              <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden border border-neutral-200">
                                <div 
                                  className="h-full bg-neutral-900 rounded-full transition-all duration-500" 
                                  style={{ width: `${Math.min(100, Math.max(10, score))}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* 4. CV ASOCIAT DROPDOWN */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-200 max-w-[240px]">
                            <FileText className="w-4 h-4 text-neutral-500 shrink-0" />
                            <select
                              value={app.cvProfileId ? `CV_${app.cvProfileId}` : (app.resumeId ? `RESUME_${app.resumeId}` : '')}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (!val) return;
                                if (val.startsWith('CV_')) {
                                  handleAttachCvProfile(app.id, val.replace('CV_', ''));
                                } else if (val.startsWith('RESUME_')) {
                                  handleAttachResume(app.id, val.replace('RESUME_', ''));
                                }
                              }}
                              disabled={attachingCvAppId === app.id}
                              className="bg-transparent text-neutral-900 font-medium outline-none cursor-pointer w-full text-xs sm:text-sm truncate"
                              title="Alege CV-ul sau fisierul asociat pentru aceasta aplicatie"
                            >
                              <option value="">-- Alege CV sau Fisier --</option>
                              {cvList.length > 0 && (
                                <optgroup label="CV-uri Create in Studio">
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
                                      Fisier: {r.fileName}
                                    </option>
                                  ))}
                                </optgroup>
                              )}
                            </select>
                            {app.cvProfileId && onEditCvInStudio && (
                              <button
                                onClick={() => onEditCvInStudio(app.cvProfileId)}
                                className="text-neutral-400 hover:text-black p-0.5 cursor-pointer shrink-0"
                                title="Editeaza in Studio"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* 5. ACTIUNI (TOATE FUNCTIONALITATILE ACCESIBILE IN MODUL LISTA) */}
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenJobModal(app)}
                              className="px-3.5 py-2 rounded-xl border border-neutral-200/90 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer shadow-2xs group active:scale-95"
                              title="Vezi fisa completa a jobului"
                            >
                              <Eye className="w-4 h-4 text-neutral-700 group-hover:scale-110 transition-transform shrink-0" />
                              <span>Fisa Job</span>
                            </button>

                            {onOpenCoverLetter && (
                              <button
                                onClick={() => onOpenCoverLetter(app.id)}
                                className="p-2 rounded-xl border border-neutral-200/90 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-black transition shadow-2xs cursor-pointer group active:scale-95"
                                title="Genereaza Scrisoare de Intentie AI"
                              >
                                <FileSignature className="w-4 h-4 text-neutral-700 group-hover:scale-110 transition-transform" />
                              </button>
                            )}

                            <button
                              onClick={() => setOutreachApp(app)}
                              className="p-2 rounded-xl border border-neutral-200/90 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-black transition shadow-2xs cursor-pointer group active:scale-95"
                              title="Outreach Recruiter: Mesaj LinkedIn & Cold Email"
                            >
                              <Send className="w-4 h-4 text-neutral-700 group-hover:scale-110 transition-transform" />
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(`Sigur doresti sa stergi jobul ${app.jobTitle} la ${app.companyName}?`)) {
                                  onDeleteApplication && onDeleteApplication(app.id);
                                }
                              }}
                              title="Sterge aplicatia"
                              className="p-2 rounded-xl hover:bg-rose-50 text-neutral-300 hover:text-rose-600 border border-transparent hover:border-rose-200 transition cursor-pointer ml-1"
                            >
                              <Trash2 className="w-4 h-4" />
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
            <div className="p-12 text-center text-gray-400 space-y-2">
              <Building2 className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="font-semibold text-sm text-gray-700">Nicio aplicatie gasita</p>
              <p className="text-xs text-gray-400">Incearca sa modifici filtrele sau cautarea.</p>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CALENDAR VIEW (CHRONOLOGICAL TIMELINE & AGENDA) */}
      {/* ========================================================================= */}
      {viewMode === 'calendar' && (
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
