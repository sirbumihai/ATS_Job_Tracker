import React, { useState } from 'react';
import { 
  Briefcase, 
  Sparkles, 
  TrendingUp, 
  Award, 
  BarChart3, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  Bookmark, 
  Calendar, 
  PieChart,
  Target,
  ArrowRight
} from 'lucide-react';

export default function StatsDashboard({ applications = [] }) {
  const [showDetailedAnalytics, setShowDetailedAnalytics] = useState(false);

  const applicationsCount = applications.length;
  const savedCount = applications.filter(a => a.status === 'SAVED').length;
  const appliedCount = applications.filter(a => a.status === 'APPLIED').length;
  const interviewingCount = applications.filter(a => a.status === 'INTERVIEWING').length;
  const offersCount = applications.filter(a => a.status === 'OFFER_RECEIVED').length;
  const rejectedCount = applications.filter(a => a.status === 'REJECTED').length;

  const totalActioned = appliedCount + interviewingCount + offersCount + rejectedCount;

  // Rate de conversie procentuale
  const interviewRate = totalActioned > 0 
    ? (((interviewingCount + offersCount) / totalActioned) * 100).toFixed(1)
    : '0.0';
    
  const offerRate = (interviewingCount + offersCount) > 0
    ? ((offersCount / (interviewingCount + offersCount)) * 100).toFixed(1)
    : '0.0';

  const scores = applications.map(a => Number(a.semanticMatchScore || 0)).filter(s => s > 0);
  const averageMatchScore = scores.length > 0 
    ? (scores.reduce((acc, curr) => acc + curr, 0) / scores.length).toFixed(1) + '%' 
    : '0.0%';

  // Repartitie Mod de Lucru
  const remoteCount = applications.filter(a => (a.workModel || '').toUpperCase().includes('REMOTE')).length;
  const hybridCount = applications.filter(a => {
    const wm = (a.workModel || '').toUpperCase();
    return wm.includes('HYBRID') || wm.includes('HIBRID');
  }).length;
  const onsiteCount = applications.filter(a => {
    const wm = (a.workModel || '').toUpperCase();
    return wm.includes('ONSITE') || wm.includes('SITE') || wm.includes('BIROU');
  }).length;

  // Sanatate Scor ATS
  const highMatchCount = applications.filter(a => Number(a.semanticMatchScore || 0) >= 80).length;
  const midMatchCount = applications.filter(a => {
    const s = Number(a.semanticMatchScore || 0);
    return s >= 50 && s < 80;
  }).length;
  const lowMatchCount = applications.filter(a => {
    const s = Number(a.semanticMatchScore || 0);
    return s > 0 && s < 50;
  }).length;

  return (
    <div className="space-y-3 font-sans">
      
      {/* 1. TOP 4 METRIC KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* CARD 1: APLICATII SALVATE */}
        <div className="bg-white border border-gray-200/90 shadow-sm p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-gray-900 transition hover:shadow-md">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Aplicatii in Pipeline</p>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-950 mt-0.5 sm:mt-1">{applicationsCount}</h3>
          </div>
          <div className="p-2.5 sm:p-3 bg-gray-100 border border-gray-200 rounded-xl sm:rounded-2xl text-gray-900 mt-2 sm:mt-0 self-end sm:self-auto shadow-2xs">
            <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* CARD 2: SCOR MEDIU MATCH */}
        <div className="bg-white border border-gray-200/90 shadow-sm p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-gray-900 transition hover:shadow-md">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Scor Mediu Match</p>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 mt-0.5 sm:mt-1">
              {averageMatchScore}
            </h3>
          </div>
          <div className="p-2.5 sm:p-3 bg-emerald-50 border border-emerald-200 rounded-xl sm:rounded-2xl text-emerald-700 mt-2 sm:mt-0 self-end sm:self-auto shadow-2xs">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* CARD 3: INTERVIURI ACTIVE */}
        <div className="bg-white border border-gray-200/90 shadow-sm p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-gray-900 transition hover:shadow-md">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Interviuri Active</p>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-950 mt-0.5 sm:mt-1">{interviewingCount}</h3>
          </div>
          <div className="p-2.5 sm:p-3 bg-gray-100 border border-gray-200 rounded-xl sm:rounded-2xl text-gray-900 mt-2 sm:mt-0 self-end sm:self-auto shadow-2xs">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* CARD 4: OFERTE PRIMITE */}
        <div className="bg-white border border-gray-200/90 shadow-sm p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-gray-900 transition hover:shadow-md">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Oferte Primite</p>
            <h3 className={`text-2xl sm:text-3xl font-black mt-0.5 sm:mt-1 ${offersCount > 0 ? 'text-emerald-600' : 'text-gray-950'}`}>
              {offersCount}
            </h3>
          </div>
          <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl mt-2 sm:mt-0 self-end sm:self-auto shadow-2xs ${
            offersCount > 0 
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-600' 
              : 'bg-gray-100 border border-gray-200 text-gray-900'
          }`}>
            <Award className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

      </div>

      {/* 2. EXPANDABLE PIPELINE & CONVERSION ANALYTICS */}
      {applicationsCount > 0 && (
        <div className="bg-white border border-gray-200/90 shadow-xs rounded-2xl overflow-hidden transition">
          <button
            type="button"
            onClick={() => setShowDetailedAnalytics(prev => !prev)}
            className="w-full px-4 py-2.5 bg-gray-50/70 hover:bg-gray-100/70 flex items-center justify-between text-xs font-bold text-gray-700 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Analiza Pipeline & Rate de Conversie</span>
              <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                {interviewRate}% Rata Interviuri
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-gray-500">
              <span>{showDetailedAnalytics ? 'Ascunde' : 'Extinde detalii'}</span>
              {showDetailedAnalytics ? (
                <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              )}
            </div>
          </button>

          {showDetailedAnalytics && (
            <div className="p-4 sm:p-5 border-t border-gray-100 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
              
              {/* FUNNEL VIZUAL DE CONVERSIE */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Funnel Conversie Candidaturi</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                  {/* PAS 1: SALVATE */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                      <span className="flex items-center gap-1">
                        <Bookmark className="w-3 h-3 text-slate-500" />
                        Salvate
                      </span>
                      <span className="font-extrabold text-slate-900">{savedCount}</span>
                    </div>
                    <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-500 rounded-full" style={{ width: `${applicationsCount > 0 ? (savedCount / applicationsCount) * 100 : 0}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-500">In asteptare aplicare</p>
                  </div>

                  {/* PAS 2: APLICATE */}
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200/80 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-blue-700">
                      <span className="flex items-center gap-1">
                        <Send className="w-3 h-3 text-blue-600" />
                        Aplicat
                      </span>
                      <span className="font-extrabold text-blue-950">{appliedCount}</span>
                    </div>
                    <div className="w-full bg-blue-200/70 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${applicationsCount > 0 ? (appliedCount / applicationsCount) * 100 : 0}%` }}></div>
                    </div>
                    <p className="text-[10px] text-blue-600">Trimise catre angajator</p>
                  </div>

                  {/* PAS 3: INTERVIU */}
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-800">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-600" />
                        Interviu
                      </span>
                      <span className="font-extrabold text-amber-950">{interviewingCount}</span>
                    </div>
                    <div className="w-full bg-amber-200/70 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${applicationsCount > 0 ? (interviewingCount / applicationsCount) * 100 : 0}%` }}></div>
                    </div>
                    <p className="text-[10px] text-amber-700 font-semibold">{interviewRate}% din trimise</p>
                  </div>

                  {/* PAS 4: OFERTA */}
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800">
                      <span className="flex items-center gap-1">
                        <Award className="w-3 h-3 text-emerald-600" />
                        Oferta
                      </span>
                      <span className="font-extrabold text-emerald-950">{offersCount}</span>
                    </div>
                    <div className="w-full bg-emerald-200/70 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${applicationsCount > 0 ? (offersCount / applicationsCount) * 100 : 0}%` }}></div>
                    </div>
                    <p className="text-[10px] text-emerald-700 font-semibold">{offerRate}% din interviuri</p>
                  </div>

                </div>
              </div>

              {/* GRID CU DISTRIBUTIE MOD DE LUCRU & SANATATE SCOR ATS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                
                {/* MOD DE LUCRU */}
                <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                      Repartitie Mod de Lucru
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">Total: {applicationsCount}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-extrabold text-[10px]">
                      Remote: {remoteCount} ({applicationsCount > 0 ? Math.round((remoteCount / applicationsCount) * 100) : 0}%)
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 font-extrabold text-[10px]">
                      Hibrid: {hybridCount} ({applicationsCount > 0 ? Math.round((hybridCount / applicationsCount) * 100) : 0}%)
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-extrabold text-[10px]">
                      On-site: {onsiteCount} ({applicationsCount > 0 ? Math.round((onsiteCount / applicationsCount) * 100) : 0}%)
                    </span>
                  </div>
                </div>

                {/* SANATATE SCOR ATS */}
                <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Calitate & Scor Match ATS
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">Medie: {averageMatchScore}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-extrabold text-[10px]">
                      &gt;80% Match: {highMatchCount}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold text-[10px]">
                      50-80% Match: {midMatchCount}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 font-extrabold text-[10px]">
                      &lt;50% Match: {lowMatchCount}
                    </span>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
}
