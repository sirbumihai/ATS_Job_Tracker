import React from 'react';
import { Briefcase, Sparkles, TrendingUp, Bot, Zap } from 'lucide-react';

export default function StatsDashboard({ applicationsCount, averageMatchScore, interviewingCount }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div className="glass-card glass-card-hover p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div>
          <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">Aplicații Salvate</p>
          <h3 className="text-2xl sm:text-3xl font-black text-white mt-0.5 sm:mt-1">{applicationsCount}</h3>
        </div>
        <div className="p-2.5 sm:p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl sm:rounded-2xl text-blue-400 glow-blue mt-2 sm:mt-0 self-end sm:self-auto">
          <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      <div className="glass-card glass-card-hover p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div>
          <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">Scor Mediu Match</p>
          <h3 className="text-2xl sm:text-3xl font-black gradient-text-emerald mt-0.5 sm:mt-1">
            {averageMatchScore}
          </h3>
        </div>
        <div className="p-2.5 sm:p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl sm:rounded-2xl text-emerald-400 glow-emerald mt-2 sm:mt-0 self-end sm:self-auto">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      <div className="glass-card glass-card-hover p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div>
          <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">Interviuri Active</p>
          <h3 className="text-2xl sm:text-3xl font-black text-amber-400 mt-0.5 sm:mt-1">{interviewingCount}</h3>
        </div>
        <div className="p-2.5 sm:p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl sm:rounded-2xl text-amber-400 glow-amber mt-2 sm:mt-0 self-end sm:self-auto">
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      <div className="glass-card glass-card-hover p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div>
          <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">Multi-Agent AI</p>
          <h3 className="text-xs font-black text-purple-400 mt-1 truncate flex items-center gap-1">
            <Bot className="w-3.5 h-3.5 text-pink-400" />
            4 Agenți Activi
          </h3>
        </div>
        <div className="p-2.5 sm:p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl sm:rounded-2xl text-purple-400 glow-purple mt-2 sm:mt-0 self-end sm:self-auto">
          <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>
    </div>
  );
}
