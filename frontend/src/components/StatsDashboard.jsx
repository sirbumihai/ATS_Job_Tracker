import React from 'react';
import { 
  Briefcase, 
  Sparkles, 
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
      {/* 4 BENTO KPI CARDS - MONOLITHIC ARCHITECTURAL DISTILL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* CARD 1: APLICATII IN PIPELINE */}
        <div className="bg-white border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-black p-5 sm:p-6 rounded-xl transition-all duration-200 flex flex-col justify-between group min-h-[148px]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs sm:text-[13px] font-mono text-neutral-500 uppercase tracking-wider font-bold">
              Pipeline Activ
            </span>
            <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200/80 text-neutral-900 flex items-center justify-center shadow-2xs group-hover:scale-105 group-hover:bg-neutral-200/70 transition-all shrink-0">
              <Briefcase className="w-5 h-5 text-neutral-800" />
            </div>
          </div>
          <div className="mt-4 sm:mt-5">
            <div className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight tabular-nums">
              {applicationsCount}
            </div>
            <div className="text-xs sm:text-sm text-neutral-600 font-medium mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neutral-950 shrink-0"></span>
              <span>Monitorizate in Kanban</span>
            </div>
          </div>
        </div>

        {/* CARD 2: SCOR MEDIU MATCH ATS */}
        <div className="bg-white border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-black p-5 sm:p-6 rounded-xl transition-all duration-200 flex flex-col justify-between group min-h-[148px]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs sm:text-[13px] font-mono text-neutral-500 uppercase tracking-wider font-bold">
              Scor Mediu Match
            </span>
            <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200/80 text-neutral-900 flex items-center justify-center shadow-2xs group-hover:scale-105 group-hover:bg-neutral-200/70 transition-all shrink-0">
              <Sparkles className="w-5 h-5 text-neutral-800" />
            </div>
          </div>
          <div className="mt-4 sm:mt-5">
            <div className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight tabular-nums">
              {averageMatchScore}
            </div>
            <div className="mt-2.5 space-y-1.5">
              <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden border border-neutral-200">
                <div 
                  className="bg-black h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, averageMatchNum)}%` }}
                />
              </div>
              <div className="text-xs text-neutral-500 font-mono">
                Compatibilitate semantica AI
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: INTERVIURI ACTIVE */}
        <div className="bg-white border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-black p-5 sm:p-6 rounded-xl transition-all duration-200 flex flex-col justify-between group min-h-[148px]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs sm:text-[13px] font-mono text-neutral-500 uppercase tracking-wider font-bold">
              Interviuri Active
            </span>
            <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200/80 text-neutral-900 flex items-center justify-center shadow-2xs group-hover:scale-105 group-hover:bg-neutral-200/70 transition-all shrink-0">
              <Calendar className="w-5 h-5 text-neutral-800" />
            </div>
          </div>
          <div className="mt-4 sm:mt-5">
            <div className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight tabular-nums">
              {interviewingCount}
            </div>
            <div className="text-xs sm:text-sm text-neutral-600 font-medium mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span>Screening & probe tehnice</span>
            </div>
          </div>
        </div>

        {/* CARD 4: OFERTE PRIMITE */}
        <div className="bg-white border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-black p-5 sm:p-6 rounded-xl transition-all duration-200 flex flex-col justify-between group min-h-[148px]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs sm:text-[13px] font-mono text-neutral-500 uppercase tracking-wider font-bold">
              Oferte Primite
            </span>
            <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200/80 text-neutral-900 flex items-center justify-center shadow-2xs group-hover:scale-105 group-hover:bg-neutral-200/70 transition-all shrink-0">
              <Award className="w-5 h-5 text-neutral-800" />
            </div>
          </div>
          <div className="mt-4 sm:mt-5">
            <div className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight tabular-nums">
              {offersCount}
            </div>
            <div className="text-xs sm:text-sm text-neutral-600 font-medium mt-2 flex items-center gap-2">
              <CheckCircle2 className={`w-4 h-4 shrink-0 ${offersCount > 0 ? 'text-emerald-600' : 'text-neutral-400'}`} />
              <span>{offersCount > 0 ? 'Candidaturi finalizate cu succes' : 'In asteptare de oferte'}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
