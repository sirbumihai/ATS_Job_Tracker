import React, { useState, useEffect } from 'react';
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
  XCircle
} from 'lucide-react';
import JobDetailModal from './JobDetailModal';

export default function KanbanBoard({ 
  applications = [], 
  currentUser, 
  loading, 
  onRunAiAnalysis, 
  onOpenAnalysis,
  analyzingAppId,
  onUpdateStatus,
  onStatusChange,
  onDeleteApplication,
  onApplicationUpdated,
  onEditCvInStudio
}) {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterScore, setFilterScore] = useState('ALL');
  const [mobileSelectedColumn, setMobileSelectedColumn] = useState('SAVED');
  const [draggedAppId, setDraggedAppId] = useState(null);
  const [dragOverColumnKey, setDragOverColumnKey] = useState(null);
  const [cvList, setCvList] = useState([]);
  const [uploadedResumes, setUploadedResumes] = useState([]);
  const [attachingCvAppId, setAttachingCvAppId] = useState(null);
  const [selectedJobForModal, setSelectedJobForModal] = useState(null);
  const DEFAULT_USER_ID = '23fe8bdd-08f4-413d-9985-f99c21040b59';
  const activeUserId = currentUser?.userId || currentUser?.id || DEFAULT_USER_ID;

  const handleOpenJobModal = (app) => {
    setSelectedJobForModal({
      id: app.jobId || app.id,
      jobTitle: app.jobTitle,
      companyName: app.companyName,
      companyLogoUrl: app.companyLogoUrl || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80",
      location: app.location || app.jobLocation || "România",
      workModel: app.workModel || "REMOTE",
      experienceLevel: app.experienceLevel || "MID",
      sourcePlatform: app.sourcePlatform || "OTHER",
      directApplyUrl: app.jobUrl || "#",
      rawDescription: app.rawDescription || "Descrierea completă a postului salvat în aplicația de tracking Kanban.",
      salaryRange: app.salaryRange || "Salariu Nespecificat / Conform Anunț",
      skillsRequired: app.skillsRequired || [],
      atsMatchScore: app.semanticMatchScore ? Number(app.semanticMatchScore) : 0,
      competitiveness: "MEDIUM",
      competitivenessLabel: "Competiție Medie",
      applicantCountText: "Candidatură Activă",
      postedDateAgo: "Salvat în Tracker"
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
      console.error('Eroare la incarcarea CV-urilor in Kanban:', err);
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
      headerBg: 'bg-slate-100/90 text-slate-800 border-b border-slate-200',
      columnBg: 'bg-slate-50/70 border-slate-200/90',
      accentBorder: 'border-t-4 border-t-slate-500',
      badgeBg: 'bg-white text-slate-800 border border-slate-200 shadow-2xs',
      iconColor: 'text-slate-600',
      tabActive: 'bg-slate-800 text-white',
      icon: Bookmark
    },
    { 
      key: 'APPLIED', 
      title: 'Aplicat', 
      label: 'Aplicat',
      headerBg: 'bg-blue-50 text-blue-900 border-b border-blue-200',
      columnBg: 'bg-blue-50/40 border-blue-200/80',
      accentBorder: 'border-t-4 border-t-blue-500',
      badgeBg: 'bg-white text-blue-900 border border-blue-200 shadow-2xs',
      iconColor: 'text-blue-600',
      tabActive: 'bg-blue-600 text-white',
      icon: Send
    },
    { 
      key: 'INTERVIEWING', 
      title: 'Interviu', 
      label: 'Interviu',
      headerBg: 'bg-amber-50 text-amber-950 border-b border-amber-200',
      columnBg: 'bg-amber-50/40 border-amber-200/80',
      accentBorder: 'border-t-4 border-t-amber-500',
      badgeBg: 'bg-white text-amber-950 border border-amber-200 shadow-2xs',
      iconColor: 'text-amber-600',
      tabActive: 'bg-amber-600 text-white',
      icon: Calendar
    },
    { 
      key: 'OFFER_RECEIVED', 
      title: 'Ofertă', 
      label: 'Ofertă',
      headerBg: 'bg-emerald-50 text-emerald-950 border-b border-emerald-200',
      columnBg: 'bg-emerald-50/40 border-emerald-200/80',
      accentBorder: 'border-t-4 border-t-emerald-500',
      badgeBg: 'bg-white text-emerald-950 border border-emerald-200 shadow-2xs',
      iconColor: 'text-emerald-600',
      tabActive: 'bg-emerald-600 text-white',
      icon: Award
    },
    { 
      key: 'REJECTED', 
      title: 'Respins', 
      label: 'Respins',
      headerBg: 'bg-rose-50 text-rose-950 border-b border-rose-200',
      columnBg: 'bg-rose-50/40 border-rose-200/80',
      accentBorder: 'border-t-4 border-t-rose-400',
      badgeBg: 'bg-white text-rose-950 border border-rose-200 shadow-2xs',
      iconColor: 'text-rose-600',
      tabActive: 'bg-rose-600 text-white',
      icon: XCircle
    },
  ];

  const statusColorMap = {
    SAVED: 'bg-slate-50 text-slate-700 border-slate-200',
    APPLIED: 'bg-blue-50 text-blue-700 border-blue-200',
    INTERVIEWING: 'bg-amber-50 text-amber-800 border-amber-200',
    OFFER_RECEIVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const statusDotMap = {
    SAVED: 'bg-slate-500',
    APPLIED: 'bg-blue-600',
    INTERVIEWING: 'bg-amber-500',
    OFFER_RECEIVED: 'bg-emerald-600',
    REJECTED: 'bg-rose-500',
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = (app.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (app.jobTitle || '').toLowerCase().includes(searchQuery.toLowerCase());
    const score = Number(app.semanticMatchScore || 0);
    if (filterScore === 'HIGH') return matchesSearch && score >= 80;
    if (filterScore === 'MID') return matchesSearch && score >= 50 && score < 80;
    return matchesSearch;
  });

  // DRAG AND DROP HANDLERS (TRELLO STYLE)
  const handleDragStart = (e, appId) => {
    e.dataTransfer.setData('text/plain', appId);
    setDraggedAppId(appId);
  };

  const handleDragOver = (e, columnKey) => {
    e.preventDefault();
    if (dragOverColumnKey !== columnKey) {
      setDragOverColumnKey(columnKey);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetColumnKey) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('text/plain') || draggedAppId;
    const updateHandler = onUpdateStatus || onStatusChange;
    if (appId && updateHandler) {
      updateHandler(appId, targetColumnKey);
    }
    setDraggedAppId(null);
    setDragOverColumnKey(null);
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

  return (
    <div className="space-y-4 font-sans text-gray-900">
      
      {/* SEARCH, FILTER & VIEW MODE TOOLBAR */}
      {currentUser && (
        <div className="bg-white border border-gray-200/90 shadow-sm p-3.5 sm:p-4 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-3">
          
          {/* SEARCH INPUT */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Caută companie sau job..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500 focus:bg-white transition"
            />
          </div>

          {/* SCORE FILTERS */}
          <div className="flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
            <Filter className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <span className="text-[11px] font-semibold text-gray-500 shrink-0">Scor:</span>
            <button 
              onClick={() => setFilterScore('ALL')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold shrink-0 transition cursor-pointer ${
                filterScore === 'ALL' ? 'bg-black text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Toate ({applications.length})
            </button>
            <button 
              onClick={() => setFilterScore('HIGH')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold shrink-0 transition cursor-pointer ${
                filterScore === 'HIGH' ? 'bg-black text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              &gt; 80% Match
            </button>
            <button 
              onClick={() => setFilterScore('MID')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold shrink-0 transition cursor-pointer ${
                filterScore === 'MID' ? 'bg-black text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              50% - 80%
            </button>
          </div>

          {/* VIEW MODE TOGGLE (KANBAN VS LIST) */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 shrink-0 self-end lg:self-auto">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'kanban' 
                  ? 'bg-black text-white shadow-sm' 
                  : 'text-gray-600 hover:text-black hover:bg-gray-200/60'
              }`}
              title="Vizualizare Kanban Board"
            >
              <Columns className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'list' 
                  ? 'bg-black text-white shadow-sm' 
                  : 'text-gray-600 hover:text-black hover:bg-gray-200/60'
              }`}
              title="Vizualizare Listă Tabelară"
            >
              <List className="w-3.5 h-3.5" />
              Listă
            </button>
          </div>

        </div>
      )}

      {/* HEADER WITH INSTRUCTION */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-950 flex items-center gap-2 tracking-tight">
            <Building2 className="w-5 h-5 text-gray-900" />
            {viewMode === 'kanban' ? 'Pipeline Aplicații (Drag & Drop)' : 'Listă Centralizată Aplicații'}
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            {viewMode === 'kanban' 
              ? 'Trage orice card de job în altă coloană pentru a-i actualiza statusul instant și alege CV-ul asociat.'
              : 'Gestionează statusul, CV-ul asociat fiecărui job și rapoartele AI într-un format compact.'}
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. KANBAN VIEW (COLUMNS WITH DRAG & DROP & CV SELECTOR) */}
      {/* ========================================================================= */}
      {viewMode === 'kanban' && (
        <>
          {/* MOBILE COLUMN TAB SELECTOR */}
          <div className="flex md:hidden overflow-x-auto gap-1.5 p-1.5 bg-gray-100 rounded-2xl border border-gray-200">
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
                      : 'text-gray-700 hover:text-black bg-white/70'
                  }`}
                >
                  <ColIcon className="w-3.5 h-3.5" />
                  <span>{col.title}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-800'
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
              const isDragOver = dragOverColumnKey === col.key;
              const ColIcon = col.icon;

              return (
                <div 
                  key={col.key} 
                  onDragOver={(e) => handleDragOver(e, col.key)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, col.key)}
                  className={`rounded-2xl border ${col.columnBg} ${col.accentBorder} transition-all duration-200 flex flex-col h-[calc(100vh-230px)] min-h-[500px] max-h-[760px] shadow-xs overflow-hidden ${
                    isDragOver ? 'ring-2 ring-indigo-600 scale-[1.01] shadow-md' : ''
                  } ${isMobileVisible ? 'flex' : 'hidden md:flex'}`}
                >
                  {/* FIXED COLUMN HEADER */}
                  <div className={`flex items-center justify-between px-3.5 py-2.5 ${col.headerBg} font-extrabold text-xs shrink-0`}>
                    <div className="flex items-center gap-1.5">
                      <ColIcon className={`w-3.5 h-3.5 ${col.iconColor} shrink-0`} />
                      <span className="truncate">{col.title}</span>
                    </div>
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${col.badgeBg}`}>
                      {colApps.length}
                    </span>
                  </div>

                  {/* SCROLLABLE CARDS CONTAINER */}
                  <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2.5">
                    {colApps.map((app) => {
                      const score = app.semanticMatchScore ? Number(app.semanticMatchScore) : 0.0;
                      const isBeingDragged = draggedAppId === app.id;

                      return (
                        <div 
                          key={app.id}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, app.id)}
                          className={`bg-white border border-gray-200/90 rounded-xl p-3 space-y-2.5 relative group shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all text-gray-900 cursor-grab active:cursor-grabbing ${
                            isBeingDragged ? 'opacity-40 scale-95 border-indigo-500' : ''
                          }`}
                        >
                          {/* CARD HEADER: COMPANY, TITLE, DELETE & DRAG */}
                          <div className="flex items-start justify-between gap-1.5">
                            <div 
                              onClick={() => handleOpenJobModal(app)}
                              className="cursor-pointer group/title flex-1 min-w-0"
                              title="Apasă pentru a deschide fișa completă a jobului"
                            >
                              <span className="text-[10px] font-extrabold tracking-wider uppercase text-gray-500 block truncate group-hover/title:text-indigo-600 transition">
                                {app.companyName}
                              </span>
                              <h4 className="font-bold text-xs sm:text-[13px] text-gray-950 leading-snug mt-0.5 line-clamp-2 group-hover/title:text-indigo-600 transition">
                                {app.jobTitle}
                              </h4>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Sigur dorești să ștergi jobul ${app.jobTitle} la ${app.companyName}?`)) {
                                    onDeleteApplication && onDeleteApplication(app.id);
                                  }
                                }}
                                title="Șterge din Kanban"
                                className="p-1 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <GripVertical className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 shrink-0" />
                            </div>
                          </div>

                          {/* MATCH SCORE PILL + SLIM PROGRESS */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className={`inline-flex items-center gap-1 font-extrabold px-1.5 py-0.5 rounded-md text-[10px] ${
                                score >= 75 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : score >= 50
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-50 text-slate-700 border border-slate-200'
                              }`}>
                                <Sparkles className="w-2.5 h-2.5 shrink-0" />
                                {score.toFixed(0)}% Match ATS
                              </span>
                              {app.jobLocation && (
                                <span className="text-[10px] text-gray-400 truncate max-w-[100px]" title={app.jobLocation}>
                                  {app.jobLocation}
                                </span>
                              )}
                            </div>
                            <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden border border-gray-200/60">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-slate-400'
                                }`} 
                                style={{ width: `${Math.min(100, Math.max(10, score))}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* CV SELECTOR (COMPACT & CLEAN) */}
                          <div className="flex items-center gap-1 bg-gray-50/80 hover:bg-gray-100/80 px-2 py-1 rounded-lg border border-gray-200/90 text-xs">
                            <FileText className="w-3 h-3 text-gray-400 shrink-0" />
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
                              className="bg-transparent text-gray-800 font-semibold outline-none cursor-pointer w-full text-[11px] truncate"
                              title="Alege CV-ul asociat pentru această aplicație"
                            >
                              <option value="">CV Neselectat</option>
                              {cvList.length > 0 && (
                                <optgroup label="CV-uri din Studio">
                                  {cvList.map((cv) => (
                                    <option key={cv.id} value={`CV_${cv.id}`}>
                                      {cv.title} {cv.isPrimary ? '⭐' : ''}
                                    </option>
                                  ))}
                                </optgroup>
                              )}
                              {uploadedResumes.length > 0 && (
                                <optgroup label="Fișiere CV Încărcate">
                                  {uploadedResumes.map((r) => (
                                    <option key={r.id} value={`RESUME_${r.id}`}>
                                      {r.fileName}
                                    </option>
                                  ))}
                                </optgroup>
                              )}
                            </select>
                            {app.cvProfileId && onEditCvInStudio && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditCvInStudio(app.cvProfileId);
                                }}
                                className="text-gray-400 hover:text-indigo-600 p-0.5 cursor-pointer shrink-0"
                                title="Editează acest CV în Studio"
                              >
                                <Edit3 className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>

                          {/* ACTION: VEZI FIȘA COMPLETĂ */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenJobModal(app);
                            }}
                            className="w-full py-1.5 px-2.5 rounded-lg border border-indigo-100 hover:border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-950 text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
                            title="Deschide fișa completă și analiza AI a jobului"
                          >
                            <Eye className="w-3 h-3 text-indigo-600" />
                            <span>Vezi Fișa Jobului</span>
                          </button>
                        </div>
                      );
                    })}

                    {colApps.length === 0 && (
                      <div className="h-40 flex items-center justify-center text-[11px] text-gray-400 italic border border-dashed border-gray-300/80 rounded-xl p-3 text-center">
                        {currentUser ? 'Plasează un job aici' : 'Autentifică-te'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
                  <tr className="border-b border-gray-200 bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Companie & Job</th>
                    <th className="py-3.5 px-4">Status Curent</th>
                    <th className="py-3.5 px-4">Scor Match AI</th>
                    <th className="py-3.5 px-4">CV Asociat</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredApplications.map((app) => {
                    const score = app.semanticMatchScore ? Number(app.semanticMatchScore) : 0.0;
                    return (
                      <tr key={app.id} className="hover:bg-gray-50/70 transition-colors group">
                        
                        {/* 1. COMPANIE & JOB */}
                        <td className="py-4 px-4 sm:px-6">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 block">
                              {app.companyName}
                            </span>
                            <span className="font-bold text-sm text-gray-950 block mt-0.5">
                              {app.jobTitle}
                            </span>
                            {app.jobLocation && (
                              <span className="text-[11px] text-gray-400 block mt-0.5">
                                {app.jobLocation}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 2. STATUS DROPDOWN */}
                        <td className="py-4 px-4">
                          <div className="inline-flex items-center gap-1.5 relative">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${statusDotMap[app.status] || 'bg-gray-400'}`}></span>
                            <select
                              value={app.status}
                              onChange={(e) => handleStatusSelectChange(app.id, e.target.value)}
                              className={`text-xs font-bold px-2.5 py-1 rounded-lg border outline-none cursor-pointer transition ${statusColorMap[app.status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}
                            >
                              <option value="SAVED">Salvate</option>
                              <option value="APPLIED">Aplicat</option>
                              <option value="INTERVIEWING">Interviu</option>
                              <option value="OFFER_RECEIVED">Ofertă</option>
                              <option value="REJECTED">Respins</option>
                            </select>
                          </div>
                        </td>

                        {/* 3. SCOR MATCH AI */}
                        <td className="py-4 px-4">
                          <div className="w-36 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1 font-bold text-emerald-700 text-xs">
                                <Sparkles className="w-3 h-3 text-emerald-600" />
                                {score.toFixed(1)}%
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium">ATS Match</span>
                            </div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden border border-gray-200">
                              <div 
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                                style={{ width: `${Math.min(100, Math.max(10, score))}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* 4. CV ASOCIAT DROPDOWN */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200 max-w-[220px]">
                            <FileText className="w-3.5 h-3.5 text-gray-500 shrink-0" />
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
                              className="bg-transparent text-gray-900 font-semibold outline-none cursor-pointer w-full text-xs truncate"
                              title="Alege CV-ul sau fișierul asociat pentru această aplicație"
                            >
                              <option value="">-- Alege CV sau Fișier --</option>
                              {cvList.length > 0 && (
                                <optgroup label="CV-uri Create în Studio">
                                  {cvList.map((cv) => (
                                    <option key={cv.id} value={`CV_${cv.id}`}>
                                      {cv.title} {cv.isPrimary ? '(⭐ Principal)' : ''}
                                    </option>
                                  ))}
                                </optgroup>
                              )}
                              {uploadedResumes.length > 0 && (
                                <optgroup label="Fișiere CV Încărcate">
                                  {uploadedResumes.map((r) => (
                                    <option key={r.id} value={`RESUME_${r.id}`}>
                                      Fișier: {r.fileName}
                                    </option>
                                  ))}
                                </optgroup>
                              )}
                            </select>
                            {app.cvProfileId && onEditCvInStudio && (
                              <button
                                onClick={() => onEditCvInStudio(app.cvProfileId)}
                                className="text-gray-400 hover:text-black p-0.5 cursor-pointer shrink-0"
                                title="Editează în Studio"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* 5. ACȚIUNI */}
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenJobModal(app)}
                              className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-indigo-300 bg-gray-50 hover:bg-indigo-50 text-gray-800 hover:text-indigo-950 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                              title="Vezi fișa completă a jobului"
                            >
                              <Eye className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Fișă</span>
                            </button>

                            <button
                              onClick={() => {
                                const runAi = onRunAiAnalysis || onOpenAnalysis;
                                if (runAi) runAi(app);
                              }}
                              disabled={analyzingAppId === app.id}
                              className="px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm disabled:opacity-60 cursor-pointer"
                              title="Rulează analiza AI Match & Raport"
                            >
                              {analyzingAppId === app.id ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-gray-300" />
                                  <span>Analiză...</span>
                                </>
                              ) : (
                                <>
                                  <BrainCircuit className="w-3.5 h-3.5" />
                                  <span>Apelează AI</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(`Sigur dorești să ștergi jobul ${app.jobTitle} la ${app.companyName}?`)) {
                                  onDeleteApplication && onDeleteApplication(app.id);
                                }
                              }}
                              title="Șterge aplicația"
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 border border-transparent hover:border-rose-200 transition cursor-pointer"
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
              <p className="font-semibold text-sm text-gray-700">Nicio aplicație găsită</p>
              <p className="text-xs text-gray-400">Încearcă să modifici filtrul de scor sau căutarea.</p>
            </div>
          )}

        </div>
      )}

      {/* JOB DETAIL MODAL INTEGRAT ÎN KANBAN */}
      {selectedJobForModal && (
        <JobDetailModal
          job={selectedJobForModal}
          onClose={() => setSelectedJobForModal(null)}
          isSaved={true}
          activeUserId={activeUserId}
        />
      )}

    </div>
  );
}
