import React, { useState } from 'react';
import { 
  Building2, 
  Sparkles, 
  FileText, 
  BrainCircuit, 
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

export default function KanbanBoard({ 
  applications, 
  currentUser, 
  loading, 
  onRefresh, 
  onRunAiAnalysis, 
  analyzingAppId 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterScore, setFilterScore] = useState('ALL');
  const [mobileSelectedColumn, setMobileSelectedColumn] = useState('SAVED');

  const kanbanColumns = [
    { key: 'SAVED', title: 'Salvate 📌', color: 'border-blue-500/30 bg-blue-500/5' },
    { key: 'APPLIED', title: 'Aplicat 📩', color: 'border-purple-500/30 bg-purple-500/5' },
    { key: 'INTERVIEWING', title: 'Interviu 🎙️', color: 'border-amber-500/30 bg-amber-500/5' },
    { key: 'OFFER_RECEIVED', title: 'Ofertă 🎉', color: 'border-emerald-500/30 bg-emerald-500/5' },
    { key: 'REJECTED', title: 'Respins ❌', color: 'border-rose-500/30 bg-rose-500/5' },
  ];

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const score = Number(app.semanticMatchScore || 0);
    if (filterScore === 'HIGH') return matchesSearch && score >= 80;
    if (filterScore === 'MID') return matchesSearch && score >= 50 && score < 80;
    return matchesSearch;
  });

  const getCompanyInitial = (company) => {
    if (!company) return 'J';
    return company.charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-4">
      {/* SEARCH & FILTER TOOLBAR */}
      {currentUser && (
        <div className="glass-card p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 border-gray-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Caută companie sau job..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-[11px] font-semibold text-gray-400 shrink-0">Score:</span>
            <button 
              onClick={() => setFilterScore('ALL')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition ${
                filterScore === 'ALL' ? 'bg-purple-600 text-white' : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              Toate ({applications.length})
            </button>
            <button 
              onClick={() => setFilterScore('HIGH')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition ${
                filterScore === 'HIGH' ? 'bg-emerald-600 text-white' : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              &gt; 80% Match
            </button>
            <button 
              onClick={() => setFilterScore('MID')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition ${
                filterScore === 'MID' ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              50% - 80%
            </button>
          </div>
        </div>
      )}

      {/* HEADER WITH REFRESH */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2.5 tracking-tight">
          <Building2 className="w-5 h-5 text-blue-400" />
          Pipeline Aplicații
        </h2>
        {currentUser && (
          <button 
            onClick={onRefresh} 
            className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Reîmprospătează DB
          </button>
        )}
      </div>

      {/* MOBILE COLUMN TAB SELECTOR (MOBILE ONLY < md) */}
      <div className="flex md:hidden overflow-x-auto gap-1.5 p-1 bg-gray-900/90 rounded-xl border border-gray-800">
        {kanbanColumns.map((col) => {
          const count = filteredApplications.filter(a => a.status === col.key).length;
          return (
            <button
              key={col.key}
              onClick={() => setMobileSelectedColumn(col.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 transition ${
                mobileSelectedColumn === col.key 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>{col.title.split(' ')[0]}</span>
              <span className="bg-gray-800 px-1.5 py-0.2 rounded-full text-[10px]">{count}</span>
            </button>
          );
        })}
      </div>

      {/* KANBAN GRID (DESKTOP: FULL GRID, MOBILE: SINGLE ACTIVE COLUMN) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-4">
        {kanbanColumns.map((col) => {
          const colApps = filteredApplications.filter(app => app.status === col.key);
          const isMobileVisible = mobileSelectedColumn === col.key;

          return (
            <div 
              key={col.key} 
              className={`rounded-2xl border ${col.color} p-3.5 sm:p-4 flex flex-col gap-3 min-h-[380px] backdrop-blur-md ${
                isMobileVisible ? 'flex' : 'hidden md:flex'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-gray-200 pb-2 border-b border-gray-800/80">
                <span>{col.title}</span>
                <span className="bg-gray-800/90 text-gray-300 text-[11px] font-extrabold px-2 py-0.5 rounded-full border border-gray-700">{colApps.length}</span>
              </div>

              {colApps.map((app) => {
                const score = app.semanticMatchScore ? Number(app.semanticMatchScore) : 60.62;
                return (
                  <div key={app.id} className="glass-card glass-card-hover p-3.5 sm:p-4 rounded-xl space-y-3 relative group border-gray-800/80">
                    
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-black text-xs text-white shadow-md shrink-0">
                          {getCompanyInitial(app.companyName)}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-extrabold tracking-wider uppercase text-blue-400 block truncate">
                            {app.companyName}
                          </span>
                          <h4 className="font-extrabold text-xs text-white leading-tight mt-0.5 line-clamp-1">{app.jobTitle}</h4>
                        </div>
                      </div>
                    </div>

                    {/* MATCH SCORE PROGRESS BAR */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 font-black text-emerald-400 text-[11px]">
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          {score.toFixed(2)}% Match
                        </span>
                        <span className="text-[9px] text-gray-500 font-semibold">pgvector</span>
                      </div>
                      <div className="w-full bg-gray-950 h-1.5 rounded-full overflow-hidden border border-gray-800">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, Math.max(10, score))}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* CV ATTACHED BADGE */}
                    {app.resumeFileName ? (
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-purple-300 font-semibold bg-purple-500/10 px-2 py-1 rounded-lg border border-purple-500/20 min-w-0">
                        <FileText className="w-3 h-3 text-purple-400 shrink-0" />
                        <span className="truncate">CV: {app.resumeFileName}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 min-w-0">
                        <FileText className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">CV: CVSirbuMihaiAlexandru.pdf</span>
                      </div>
                    )}

                    {app.notes && (
                      <p className="text-[11px] text-gray-400 line-clamp-2 italic bg-gray-950/60 p-2 rounded-lg border border-gray-800/80">
                        "{app.notes}"
                      </p>
                    )}

                    <button
                      onClick={() => onRunAiAnalysis(app)}
                      disabled={analyzingAppId === app.id}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 text-blue-300 hover:text-white text-xs font-bold border border-blue-500/30 flex items-center justify-center gap-1.5 transition shadow-sm"
                    >
                      {analyzingAppId === app.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                          Generare Raport AI...
                        </>
                      ) : (
                        <>
                          <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                          Apelează AI Backend Live
                        </>
                      )}
                    </button>
                  </div>
                );
              })}

              {colApps.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-xs text-gray-500 italic border border-dashed border-gray-800 rounded-xl p-4 text-center">
                  {currentUser ? 'Nicio aplicație în acest stadiu' : 'Autentifică-te pentru a vedea aplicațiile'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
