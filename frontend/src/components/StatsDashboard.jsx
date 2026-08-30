import React from 'react';
import { Briefcase, Sparkles, TrendingUp, Database } from 'lucide-react';

export default function StatsDashboard({ applications = [] }) {
  const applicationsCount = applications.length;
  const interviewingCount = applications.filter(a => a.status === 'INTERVIEWING').length;
  const scores = applications.map(a => Number(a.semanticMatchScore || 0)).filter(s => s > 0);
  const averageMatchScore = scores.length > 0 
    ? (scores.reduce((acc, curr) => acc + curr, 0) / scores.length).toFixed(1) + '%' 
    : '0.0%';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-sans">
      
      {/* CARD 1: APLICATII SALVATE */}
      <div className="bg-white border border-gray-200/90 shadow-sm p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-gray-900 transition hover:shadow-md">
        <div>
          <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Aplicații Salvate</p>
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

      {/* CARD 4: BAZA DE DATE CV */}
      <div className="bg-white border border-gray-200/90 shadow-sm p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-gray-900 transition hover:shadow-md">
        <div>
          <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Bază de Date CV</p>
          <h3 className="text-xs font-bold text-gray-800 mt-1 truncate flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            PostgreSQL DB Conectat
          </h3>
        </div>
        <div className="p-2.5 sm:p-3 bg-gray-100 border border-gray-200 rounded-xl sm:rounded-2xl text-gray-900 mt-2 sm:mt-0 self-end sm:self-auto shadow-2xs">
          <Database className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

    </div>
  );
}
