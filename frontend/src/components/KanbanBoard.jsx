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
  Trash2
} from 'lucide-react';

export default function KanbanBoard({ 
  applications, 
  currentUser, 
  loading, 
  onRunAiAnalysis, 
  onOpenAnalysis,
  analyzingAppId,
  onUpdateStatus,
  onStatusChange,
  onDeleteApplication
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterScore, setFilterScore] = useState('ALL');
  const [mobileSelectedColumn, setMobileSelectedColumn] = useState('SAVED');
  const [draggedAppId, setDraggedAppId] = useState(null);
  const [dragOverColumnKey, setDragOverColumnKey] = useState(null);

  const kanbanColumns = [
    { key: 'SAVED', title: 'Salvate' },
    { key: 'APPLIED', title: 'Aplicat' },
    { key: 'INTERVIEWING', title: 'Interviu' },
    { key: 'OFFER_RECEIVED', title: 'Ofertă' },
    { key: 'REJECTED', title: 'Respins' },
  ];

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
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

  return (
    <div className="space-y-4 font-sans text-gray-900">
      
      {/* SEARCH & FILTER TOOLBAR */}
      {currentUser && (
        <div className="bg-white border border-gray-200/90 shadow-sm p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Caută companie sau job..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
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
        </div>
      )}

      {/* HEADER WITH DRAG INSTRUCTION */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-950 flex items-center gap-2 tracking-tight">
            <Building2 className="w-5 h-5 text-gray-900" />
            Pipeline Aplicații (Drag & Drop)
          </h2>
          <p className="text-xs text-gray-500 font-medium">Trage orice card de job în altă coloană pentru a-i actualiza statusul instant.</p>
        </div>
      </div>

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

      {/* KANBAN GRID WITH TRELLO-STYLE DRAG & DROP AND DELETE BUTTON */}
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
    </div>
  );
}
