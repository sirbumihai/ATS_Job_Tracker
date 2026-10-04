import React from 'react';
import { 
  Briefcase, 
  Sparkles, 
  TrendingUp, 
  Award,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export default function StatsDashboard({ applications = [] }) {
  const applicationsCount = applications.length;
  const interviewingCount = applications.filter(a => a.status === 'INTERVIEWING').length;
  const offersCount = applications.filter(a => a.status === 'OFFER_RECEIVED').length;

  const scores = applications.map(a => Number(a.semanticMatchScore || 0)).filter(s => s > 0);
  const averageMatchNum = scores.length > 0 
    ? (scores.reduce((acc, curr) => acc + curr, 0) / scores.length)
    : 0;
  const averageMatchScore = averageMatchNum > 0 ? averageMatchNum.toFixed(1) + '%' : '0.0%';

  return (
    <div className="font-sans">
      {/* TOP 4 BENTO KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* CARD 1: APLICATII IN PIPELINE */}
        <div className="bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 p-4 sm:p-5 rounded-2xl transition-all duration-200 flex flex-col justify-between group">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Pipeline Activ
            </span>
            <div className="p-2 sm:p-2.5 rounded-xl bg-blue-50 border border-blue-100/80 text-blue-600 shadow-2xs group-hover:scale-105 transition-transform">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight tabular-nums">
              {applicationsCount}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span>Monitorizate in Kanban</span>
            </div>
          </div>
        </div>

        {/* CARD 2: SCOR MEDIU MATCH ATS */}
        <div className="bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 p-4 sm:p-5 rounded-2xl transition-all duration-200 flex flex-col justify-between group">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Scor Mediu Match
            </span>
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 border border-emerald-100/80 text-emerald-600 shadow-2xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight tabular-nums">
              {averageMatchScore}
            </div>
            <div className="mt-2 space-y-1">
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200/50">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, averageMatchNum)}%` }}
                />
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold">
                Compatibilitate semantica AI
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: INTERVIURI ACTIVE */}
        <div className="bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 p-4 sm:p-5 rounded-2xl transition-all duration-200 flex flex-col justify-between group">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Interviuri Active
            </span>
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-50 border border-amber-100/80 text-amber-600 shadow-2xs group-hover:scale-105 transition-transform">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight tabular-nums">
              {interviewingCount}
            </div>
            <div className="text-[11px] text-amber-700 font-semibold mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Screening & probe tehnice</span>
            </div>
          </div>
        </div>

        {/* CARD 4: OFERTE PRIMITE */}
        <div className="bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 p-4 sm:p-5 rounded-2xl transition-all duration-200 flex flex-col justify-between group">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Oferte Primite
            </span>
            <div className={`p-2 sm:p-2.5 rounded-xl border shadow-2xs group-hover:scale-105 transition-transform ${
              offersCount > 0 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                : 'bg-indigo-50 border-indigo-100/80 text-indigo-600'
            }`}>
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight tabular-nums ${
              offersCount > 0 ? 'text-emerald-600' : 'text-slate-950'
            }`}>
              {offersCount}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
              <CheckCircle2 className={`w-3 h-3 ${offersCount > 0 ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{offersCount > 0 ? 'Candidaturi finalizate cu succes' : 'In asteptare de oferte'}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
