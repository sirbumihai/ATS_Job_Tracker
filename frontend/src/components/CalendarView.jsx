import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Mail, 
  Building2, 
  Eye, 
  FileSignature, 
  Send, 
  Trash2, 
  Clock, 
  Award, 
  XCircle, 
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  CalendarDays,
  Plus
} from 'lucide-react';

const MONTH_NAMES_RO = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
];

const WEEKDAY_NAMES_RO = [
  { short: 'Lun', full: 'Luni' },
  { short: 'Mar', full: 'Marți' },
  { short: 'Mie', full: 'Miercuri' },
  { short: 'Joi', full: 'Joi' },
  { short: 'Vin', full: 'Vineri' },
  { short: 'Sâm', full: 'Sâmbătă' },
  { short: 'Dum', full: 'Duminică' }
];

export default function CalendarView({
  applications = [],
  onOpenJobModal,
  onOpenCoverLetter,
  onOpenOutreach,
  onDeleteApplication,
  onStatusChange,
  statusColorMap = {},
  statusDotMap = {},
  onApplicationUpdated,
  activeUserId
}) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const [selectedDateStr, setSelectedDateStr] = useState(todayStr);
  const [showUnscheduled, setShowUnscheduled] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [savingDateAppId, setSavingDateAppId] = useState(null);

  // Extragere data 'YYYY-MM-DD' din aplicatie
  const extractDate = (app) => {
    if (app.appliedDate) {
      const match = String(app.appliedDate).match(/^\d{4}-\d{2}-\d{2}/);
      if (match) return match[0];
      try {
        const d = new Date(app.appliedDate);
        if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
      } catch (e) {}
    }
    if (app.createdAt) {
      try {
        const d = new Date(app.createdAt);
        if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
      } catch (e) {}
    }
    return null;
  };

  // Grupare aplicatii pe date calendaristice
  const { appsByDate, unscheduledApps, totalMonthApps, interviewApps } = useMemo(() => {
    const map = {};
    const unscheduled = [];
    const interviews = [];
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    let monthCount = 0;

    applications.forEach(app => {
      if (statusFilter !== 'ALL' && app.status !== statusFilter) return;

      if (app.status === 'INTERVIEWING') {
        interviews.push(app);
      }

      const dStr = extractDate(app);
      if (dStr) {
        if (!map[dStr]) map[dStr] = [];
        map[dStr].push(app);

        const [y, m] = dStr.split('-').map(Number);
        if (y === currentYear && m === (currentMonth + 1)) {
          monthCount++;
        }
      } else {
        unscheduled.push(app);
      }
    });

    return { 
      appsByDate: map, 
      unscheduledApps: unscheduled, 
      totalMonthApps: monthCount,
      interviewApps: interviews
    };
  }, [applications, currentDate, statusFilter]);

  // Generare zile din gridul lunar (luni -> duminica)
  const calendarCells = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    // JS getDay(): 0 = Duminică, 1 = Luni, etc.
    // În România săptămâna începe Luni: Luni = 0, Duminică = 6
    const firstDayOffset = (firstDayOfMonth.getDay() + 6) % 7;

    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];

    // Zile din luna anterioară (fade)
    for (let i = firstDayOffset - 1; i >= 0; i--) {
      const dNum = daysInPrevMonth - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
      cells.push({
        dayNumber: dNum,
        dateStr: dStr,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDateStr,
        apps: appsByDate[dStr] || []
      });
    }

    // Zile din luna curentă
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dayNumber: d,
        dateStr: dStr,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDateStr,
        apps: appsByDate[dStr] || []
      });
    }

    // Zile din luna următoare pentru a completa săptămânile (multiplu de 7, max 42)
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let nextD = 1; nextD <= remaining; nextD++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(nextD).padStart(2, '0')}`;
      cells.push({
        dayNumber: nextD,
        dateStr: dStr,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDateStr,
        apps: appsByDate[dStr] || []
      });
    }

    return cells;
  }, [currentDate, todayStr, selectedDateStr, appsByDate]);

  // Navigare luni
  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDateStr(todayStr);
  };

  // Salvare data manuala pentru un job neschedulat
  const handleAssignDate = async (appId, newDateStr) => {
    if (!newDateStr) return;
    setSavingDateAppId(appId);
    try {
      const res = await fetch(`/api/v1/applications/${appId}/notes`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(activeUserId ? { 'X-User-Id': activeUserId } : {})
        },
        body: JSON.stringify({
          appliedDate: newDateStr
        })
      });
      if (res.ok) {
        const updated = await res.json();
        onApplicationUpdated && onApplicationUpdated(updated);
        setSelectedDateStr(newDateStr);
      }
    } catch (e) {
      console.warn("Nu s-a putut salva data aplicarii:", e);
    } finally {
      setSavingDateAppId(null);
    }
  };

  // Formatare estetica a datei selectate
  const formatSelectedDateHuman = (dateStr) => {
    if (!dateStr) return 'Nicio zi selectată';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      const dayName = WEEKDAY_NAMES_RO[(dt.getDay() + 6) % 7].full;
      const monthName = MONTH_NAMES_RO[m - 1];
      return `${dayName}, ${d} ${monthName} ${y}`;
    } catch {
      return dateStr;
    }
  };

  const selectedDayApps = appsByDate[selectedDateStr] || [];

  return (
    <div className="space-y-4 font-sans text-gray-900">
      
      {/* 1. CALENDAR TOP CONTROLS & MONTH SELECTOR */}
      <div className="bg-white border border-gray-200/90 shadow-2xs rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* MONTH & YEAR HEADER WITH NAVIGATION BUTTONS */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-200 shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-gray-950 tracking-tight">
                {MONTH_NAMES_RO[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {totalMonthApps} aplicări în lună
              </span>
            </div>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">
              Click pe orice zi pentru a vizualiza sau adăuga aplicări
            </p>
          </div>
        </div>

        {/* CONTROLS: PREV, TODAY, NEXT & STATUS FILTER */}
        <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
          
          {/* QUICK STATUS FILTER */}
          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs">
            <span className="text-[11px] font-bold text-gray-500 shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-gray-900 font-bold text-xs outline-none cursor-pointer"
            >
              <option value="ALL">Toate statusurile</option>
              <option value="APPLIED">Aplicat</option>
              <option value="INTERVIEWING">Interviu</option>
              <option value="OFFER_RECEIVED">Oferta</option>
              <option value="SAVED">Salvate</option>
              <option value="REJECTED">Respinse</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-white text-gray-600 hover:text-black transition cursor-pointer"
              title="Luna Anterioară"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleGoToday}
              className="px-2.5 py-1 text-xs font-bold rounded-lg hover:bg-white text-gray-800 transition cursor-pointer"
              title="Mergi la ziua de azi"
            >
              Astăzi
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-white text-gray-600 hover:text-black transition cursor-pointer"
              title="Luna Următoare"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* 2. MAIN SPLIT: CALENDAR GRID (LEFT) + SELECTED DAY AGENDA (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* CALENDAR GRID (SPAN 8/12) */}
        <div className="lg:col-span-8 bg-white border border-gray-200/90 shadow-sm rounded-2xl overflow-hidden flex flex-col">
          
          {/* DAY NAMES HEADER */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/90 text-center py-2.5 text-xs font-extrabold text-gray-600 uppercase tracking-wider">
            {WEEKDAY_NAMES_RO.map((wd, i) => (
              <div key={i} title={wd.full} className={i >= 5 ? 'text-gray-400' : ''}>
                <span className="hidden sm:inline">{wd.full}</span>
                <span className="sm:hidden">{wd.short}</span>
              </div>
            ))}
          </div>

          {/* DAYS GRID CELLS */}
          <div className="grid grid-cols-7 divide-x divide-y divide-gray-100 bg-gray-50/20">
            {calendarCells.map((cell, idx) => {
              const appCount = cell.apps.length;
              const hasInterviews = cell.apps.some(a => a.status === 'INTERVIEWING');
              const hasOffers = cell.apps.some(a => a.status === 'OFFER_RECEIVED');

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[95px] sm:min-h-[110px] p-1.5 sm:p-2 flex flex-col transition-all cursor-pointer relative group ${
                    !cell.isCurrentMonth ? 'bg-gray-50/50 text-gray-300' : 'bg-white text-gray-900'
                  } ${
                    cell.isSelected 
                      ? 'ring-2 ring-blue-600 bg-blue-50/20 z-10' 
                      : 'hover:bg-gray-50/80'
                  }`}
                >
                  {/* CELL TOP: DAY NUMBER + EVENT COUNT BADGE */}
                  <div className="flex items-center justify-between mb-1">
                    <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-extrabold rounded-full transition ${
                      cell.isToday 
                        ? 'bg-blue-600 text-white font-black shadow-xs' 
                        : cell.isSelected 
                        ? 'bg-gray-900 text-white font-black' 
                        : cell.isCurrentMonth 
                        ? 'text-gray-800' 
                        : 'text-gray-400'
                    }`}>
                      {cell.dayNumber}
                    </span>

                    {appCount > 0 && (
                      <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full border ${
                        hasOffers
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : hasInterviews
                          ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {appCount}
                      </span>
                    )}
                  </div>

                  {/* CELL APPLICATIONS PILLS */}
                  <div className="space-y-1 flex-1 overflow-hidden">
                    {cell.apps.slice(0, 2).map((app) => {
                      const isGmail = app.sourcePlatform === 'GMAIL' || (app.rawDescription && app.rawDescription.includes('GMAIL'));
                      const statusDot = statusDotMap[app.status] || 'bg-gray-400';
                      return (
                        <div
                          key={app.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenJobModal(app);
                          }}
                          className={`px-1.5 py-0.5 rounded-md border text-[10px] font-bold truncate flex items-center gap-1 transition shadow-2xs hover:scale-[1.02] cursor-pointer ${
                            statusColorMap[app.status] || 'bg-gray-50 text-gray-800 border-gray-200'
                          }`}
                          title={`${app.companyName}: ${app.jobTitle} (${app.status})`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot}`}></span>
                          {isGmail && <Mail className="w-2.5 h-2.5 text-red-600 shrink-0" />}
                          <span className="truncate">{app.companyName}</span>
                        </div>
                      );
                    })}

                    {appCount > 2 && (
                      <div className="text-[9px] font-extrabold text-blue-600 hover:text-blue-800 pl-0.5">
                        +{appCount - 2} altele
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* SELECTED DAY AGENDA & INTERVIEW HIGHLIGHTS (SPAN 4/12) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* DAY AGENDA BOX */}
          <div className="bg-white border border-gray-200/90 shadow-sm rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 block">
                  Agendă & Aplicări
                </span>
                <h4 className="text-sm sm:text-base font-black text-gray-950 mt-0.5">
                  {formatSelectedDateHuman(selectedDateStr)}
                </h4>
              </div>
              <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-gray-100 text-gray-800 border border-gray-200">
                {selectedDayApps.length} {selectedDayApps.length === 1 ? 'Job' : 'Joburi'}
              </span>
            </div>

            {/* LIST OF JOBS ON SELECTED DAY */}
            {selectedDayApps.length > 0 ? (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {selectedDayApps.map((app) => {
                  const score = app.semanticMatchScore ? Number(app.semanticMatchScore) : 0;
                  const isGmail = app.sourcePlatform === 'GMAIL' || (app.rawDescription && app.rawDescription.includes('GMAIL'));

                  return (
                    <div 
                      key={app.id} 
                      className="p-3 bg-gray-50/80 hover:bg-gray-100/80 border border-gray-200 rounded-xl space-y-2 transition shadow-2xs group"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div 
                          onClick={() => onOpenJobModal(app)} 
                          className="cursor-pointer flex-1 min-w-0"
                          title="Deschide fișa completă a jobului"
                        >
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                              {app.companyName}
                            </span>
                            {isGmail && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded-full">
                                <Mail className="w-2.5 h-2.5 text-red-600" />
                                Gmail
                              </span>
                            )}
                          </div>
                          <h5 className="font-bold text-xs text-gray-950 group-hover:text-indigo-600 transition truncate mt-0.5">
                            {app.jobTitle}
                          </h5>
                        </div>

                        {/* STATUS DROPDOWN DIRECT DIN CALENDAR */}
                        <select
                          value={app.status}
                          onChange={(e) => onStatusChange && onStatusChange(app.id, e.target.value)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border outline-none cursor-pointer ${
                            statusColorMap[app.status] || 'bg-white border-gray-200'
                          }`}
                        >
                          <option value="SAVED">Salvat</option>
                          <option value="APPLIED">Aplicat</option>
                          <option value="INTERVIEWING">Interviu</option>
                          <option value="OFFER_RECEIVED">Oferta</option>
                          <option value="REJECTED">Respins</option>
                        </select>
                      </div>

                      {/* SCORE + ACTIONS ROW */}
                      <div className="flex items-center justify-between pt-1 border-t border-gray-200/60 text-xs">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                          {score.toFixed(0)}% Match
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onOpenJobModal(app)}
                            className="p-1 rounded-lg hover:bg-indigo-50 text-indigo-700 border border-indigo-200 transition cursor-pointer"
                            title="Deschide Fișa Jobului"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {onOpenCoverLetter && (
                            <button
                              type="button"
                              onClick={() => onOpenCoverLetter(app.id)}
                              className="p-1 rounded-lg hover:bg-blue-50 text-blue-700 border border-blue-200 transition cursor-pointer"
                              title="Generează Scrisoare de Intenție AI"
                            >
                              <FileSignature className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onOpenOutreach && onOpenOutreach(app)}
                            className="p-1 rounded-lg hover:bg-purple-50 text-purple-700 border border-purple-200 transition cursor-pointer"
                            title="Outreach Recruiter CRM"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Sigur dorești să ștergi aplicarea la ${app.companyName}?`)) {
                                onDeleteApplication && onDeleteApplication(app.id);
                              }
                            }}
                            className="p-1 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition cursor-pointer"
                            title="Șterge aplicarea"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400 space-y-2 border border-dashed border-gray-200 rounded-xl p-4">
                <CalendarDays className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-xs font-semibold text-gray-600">Nicio aplicare în această zi</p>
                <p className="text-[11px] text-gray-400">
                  Selectează altă zi cu marcaje sau adaugă o dată joburilor salvate mai jos.
                </p>
              </div>
            )}

          </div>

          {/* ACTIVE INTERVIEWS HIGHLIGHT (DACĂ EXISTĂ) */}
          {interviewApps.length > 0 && (
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2 text-amber-900">
                <Award className="w-4 h-4 text-amber-600 shrink-0" />
                <h4 className="text-xs font-black uppercase tracking-wider">
                  Interviuri Active ({interviewApps.length})
                </h4>
              </div>
              <div className="space-y-1.5">
                {interviewApps.slice(0, 3).map((app) => (
                  <div 
                    key={app.id}
                    onClick={() => onOpenJobModal(app)}
                    className="p-2 bg-white rounded-xl border border-amber-200/80 flex items-center justify-between text-xs cursor-pointer hover:border-amber-400 transition"
                  >
                    <div className="truncate pr-2">
                      <strong className="text-gray-900 block truncate">{app.companyName}</strong>
                      <span className="text-[11px] text-gray-500 truncate block">{app.jobTitle}</span>
                    </div>
                    {app.appliedDate && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded shrink-0">
                        {app.appliedDate}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* JOBS WITHOUT DATE (COLLAPSIBLE ACCORDION) */}
          {unscheduledApps.length > 0 && (
            <div className="bg-white border border-gray-200/90 rounded-2xl p-4 space-y-3 shadow-2xs">
              <button
                type="button"
                onClick={() => setShowUnscheduled(!showUnscheduled)}
                className="w-full flex items-center justify-between text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition" />
                  <span className="text-xs font-extrabold text-gray-800 group-hover:text-blue-600 transition">
                    Joburi fără dată specificată ({unscheduledApps.length})
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-400 group-hover:text-gray-700">
                  {showUnscheduled ? 'Ascunde' : 'Vezi'}
                </span>
              </button>

              {showUnscheduled && (
                <div className="space-y-2 pt-2 border-t border-gray-100 max-h-[260px] overflow-y-auto pr-1">
                  <p className="text-[11px] text-gray-500 font-medium">
                    Setează o dată pentru a le poziționa în calendar:
                  </p>
                  {unscheduledApps.map((app) => (
                    <div key={app.id} className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 truncate">{app.companyName}</span>
                        <span className="text-[10px] font-extrabold text-gray-500">{app.status}</span>
                      </div>
                      <p className="text-[11px] text-gray-600 truncate">{app.jobTitle}</p>
                      <div className="flex items-center gap-1.5 pt-1">
                        <input
                          type="date"
                          defaultValue={todayStr}
                          id={`date_input_${app.id}`}
                          className="flex-1 bg-white border border-gray-200 rounded-lg px-2 py-1 text-[11px] text-gray-800 outline-none"
                        />
                        <button
                          type="button"
                          disabled={savingDateAppId === app.id}
                          onClick={() => {
                            const inp = document.getElementById(`date_input_${app.id}`);
                            if (inp && inp.value) {
                              handleAssignDate(app.id, inp.value);
                            }
                          }}
                          className="px-2 py-1 bg-black hover:bg-neutral-800 text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                        >
                          {savingDateAppId === app.id ? '...' : 'Programează'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
