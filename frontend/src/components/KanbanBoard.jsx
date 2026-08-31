import React, { useState } from 'react';
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
  CheckCircle2,
  Clock,
  Send,
  XCircle,
  HelpCircle
} from 'lucide-react';

export default function KanbanBoard({ 
  applications = [], 
  currentUser, 
  loading, 
  onRunAiAnalysis, 
  onOpenAnalysis,
  analyzingAppId,
  onUpdateStatus,
  onStatusChange,
  onDeleteApplication
}) {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterScore, setFilterScore] = useState('ALL');
  const [mobileSelectedColumn, setMobileSelectedColumn] = useState('SAVED');
  const [draggedAppId, setDraggedAppId] = useState(null);
  const [dragOverColumnKey, setDragOverColumnKey] = useState(null);

  const kanbanColumns = [
    { key: 'SAVED', title: 'Salvate', label: 'Salvat' },
    { key: 'APPLIED', title: 'Aplicat', label: 'Aplicat' },
    { key: 'INTERVIEWING', title: 'Interviu', label: 'Interviu' },
    { key: 'OFFER_RECEIVED', title: 'Ofertă', label: 'Ofertă' },
    { key: 'REJECTED', title: 'Respins', label: 'Respins' },
  ];

  const statusColorMap = {
    SAVED: 'bg-blue-50 text-blue-700 border-blue-200',
    APPLIED: 'bg-purple-50 text-purple-700 border-purple-200',
    INTERVIEWING: 'bg-amber-50 text-amber-700 border-amber-200',
    OFFER_RECEIVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const statusDotMap = {
    SAVED: 'bg-blue-500',
    APPLIED: 'bg-purple-500',
    INTERVIEWING: 'bg-amber-500',
    OFFER_RECEIVED: 'bg-emerald-500',
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
              ? 'Trage orice card de job în altă coloană pentru a-i actualiza statusul instant.'
              : 'Gestionează statusul, analizele AI și detaliile aplicărilor tale într-un format compact și clar.'}
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. KANBAN VIEW (COLUMNS WITH DRAG & DROP) */}
      {/* ========================================================================= */}
      {viewMode === 'kanban' && (
        <>
          {/* MOBILE COLUMN TAB SELECTOR */}
          <div className="flex md:hidden overflow-x-auto gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200">
            {kanbanColumns.map((col) => {
              const count = filteredApplications.filter(a => a.status === col.key).length;
              return (
                <button
                  key={col.key}
                  onClick={() => setMobileSelectedColumn(col.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 transition cursor-pointer ${
                    mobileSelectedColumn === col.key 
                      ? 'bg-black text-white shadow-sm' 
                      : 'text-gray-700 hover:text-black'
                  }`}
                >
                  <span>{col.title.split(' ')[0]}</span>
                  <span className="bg-gray-200 text-gray-800 px-1.5 py-0.2 rounded-full text-[10px]">{count}</span>
                </button>
              );
            })}
          </div>

          {/* KANBAN GRID */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-4">
            {kanbanColumns.map((col) => {
              const colApps = filteredApplications.filter(app => app.status === col.key);
              const isMobileVisible = mobileSelectedColumn === col.key;
              const isDragOver = dragOverColumnKey === col.key;

              return (
                <div 
                  key={col.key} 
                  onDragOver={(e) => handleDragOver(e, col.key)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, col.key)}
                  className={`rounded-2xl border border-gray-200/90 bg-gray-100/70 transition-all duration-200 p-3.5 sm:p-4 flex flex-col gap-3 min-h-[460px] ${
                    isDragOver ? 'ring-2 ring-black scale-[1.01] bg-gray-200/90' : ''
                  } ${isMobileVisible ? 'flex' : 'hidden md:flex'}`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-gray-900 pb-2 border-b border-gray-200">
                    <span>{col.title}</span>
                    <span className="bg-white text-gray-800 text-[11px] font-extrabold px-2 py-0.5 rounded-full border border-gray-200 shadow-2xs">{colApps.length}</span>
                  </div>

                  {colApps.map((app) => {
                    const score = app.semanticMatchScore ? Number(app.semanticMatchScore) : 0.0;
                    const isBeingDragged = draggedAppId === app.id;

                    return (
                      <div 
                        key={app.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, app.id)}
                        className={`bg-white border border-gray-200 rounded-xl p-3.5 sm:p-4 space-y-3 relative group shadow-2xs hover:shadow-md hover:border-gray-300 cursor-grab active:cursor-grabbing transition-all text-gray-900 ${
                          isBeingDragged ? 'opacity-40 scale-95 border-black' : ''
                        }`}
                      >
                        
                        {/* CARD TITLE, DRAG HANDLE & DELETE BUTTON */}
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <span className="text-[10px] font-extrabold tracking-wider uppercase text-gray-500 block">
                              {app.companyName}
                            </span>
                            <h4 className="font-bold text-xs text-gray-950 leading-tight mt-0.5">{app.jobTitle}</h4>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Sigur dorești să ștergi jobul ${app.jobTitle} la ${app.companyName}?`)) {
                                  onDeleteApplication && onDeleteApplication(app.id);
                                }
                              }}
                              title="Șterge acest job"
                              className="p-1 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <GripVertical className="w-4 h-4 text-gray-400 group-hover:text-gray-700 shrink-0" />
                          </div>
                        </div>

                        {/* MATCH SCORE PROGRESS BAR */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1 font-bold text-emerald-700 text-[11px]">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              {score.toFixed(2)}% Match
                            </span>
                            <span className="text-[9px] text-gray-400 font-medium">Multi-Criteria AI</span>
                          </div>
                          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden border border-gray-200">
                            <div 
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                              style={{ width: `${Math.min(100, Math.max(10, score))}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* CV ATTACHED BADGE */}
                        {app.resumeFileName ? (
                          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-gray-700 font-medium bg-gray-50 px-2 py-1 rounded-lg border border-gray-200 min-w-0">
                            <FileText className="w-3 h-3 text-gray-500 shrink-0" />
                            <span className="truncate">CV: {app.resumeFileName}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 min-w-0">
                            <FileText className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate">Niciun CV asociat</span>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            const runAi = onRunAiAnalysis || onOpenAnalysis;
                            if (runAi) runAi(app);
                          }}
                          disabled={analyzingAppId === app.id}
                          className="w-full py-2 px-3 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-60 cursor-pointer"
                        >
                          {analyzingAppId === app.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-gray-300" />
                              Generare Raport AI...
                            </>
                          ) : (
                            <>
                              <BrainCircuit className="w-3.5 h-3.5" />
                              Apelează AI Backend Live
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}

                  {colApps.length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-xs text-gray-400 italic border border-dashed border-gray-300 rounded-xl p-4 text-center">
                      {currentUser ? 'Plasează (drag & drop) un job aici' : 'Autentifică-te pentru a muta aplicațiile'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. LIST VIEW (CLEAN MINIMALIST TABLE & CARDS) */}
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

                        {/* 4. CV ASOCIAT */}
                        <td className="py-4 px-4">
                          {app.resumeFileName ? (
                            <div className="inline-flex items-center gap-1.5 text-xs text-gray-800 font-medium bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200 max-w-[180px]">
                              <FileText className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                              <span className="truncate">{app.resumeFileName}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-[11px]">Niciun CV</span>
                          )}
                        </td>

                        {/* 5. ACȚIUNI */}
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
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

    </div>
  );
}
