import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Flame, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  Target, 
  Award, 
  HelpCircle, 
  ChevronRight, 
  RefreshCw, 
  Filter, 
  Briefcase, 
  Send, 
  Calendar, 
  FileText, 
  Layers, 
  GraduationCap, 
  Zap, 
  Clock, 
  Check, 
  ShieldCheck,
  Compass,
  ArrowDown
} from 'lucide-react';

export default function CareerAnalyticsPage({ 
  currentUser, 
  onNavigateToTab 
}) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [claimedQuests, setClaimedQuests] = useState({});
  const [toastMessage, setToastMessage] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/career/analytics', {
        headers: {
          'X-User-Id': currentUser?.userId || currentUser?.id || '23fe8bdd-08f4-413d-9985-f99c21040b59'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Eroare la preluarea analizelor de cariera:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    try {
      const saved = JSON.parse(localStorage.getItem('ats_claimed_quests') || '{}');
      setClaimedQuests(saved);
    } catch (e) {}
  }, []);

  const handleClaimQuest = (quest) => {
    const updated = { ...claimedQuests, [quest.id]: true };
    setClaimedQuests(updated);
    try {
      localStorage.setItem('ats_claimed_quests', JSON.stringify(updated));
    } catch (e) {}
    setToastMessage(`✓ Felicitari! Ai revendicat +${quest.rewardXp} XP pentru: ${quest.title}`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const getStageColorClasses = (color) => {
    switch (color) {
      case 'blue': return { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      case 'indigo': return { bg: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
      case 'amber': return { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
      case 'purple': return { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
      case 'emerald': return { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
      default: return { bg: 'bg-gray-500', light: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const getBadgeIcon = (key) => {
    switch (key) {
      case 'target': return <Target className="w-5 h-5 text-blue-500" />;
      case 'sparkles': return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'send': return <Send className="w-5 h-5 text-indigo-500" />;
      case 'graduation': return <GraduationCap className="w-5 h-5 text-purple-500" />;
      case 'flame': return <Flame className="w-5 h-5 text-rose-500" />;
      case 'trophy': return <Trophy className="w-5 h-5 text-emerald-500" />;
      default: return <Award className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* HERO & GAMIFIED LEVEL CARD */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-50/70 via-indigo-50/40 to-transparent rounded-full pointer-events-none blur-2xl"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                Funnel Analytics & Career XP
              </span>
              <span className="text-xs text-gray-400 font-semibold">•</span>
              <span className="text-xs font-bold text-gray-600">Sistem Anti-Burnout</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">
              Palnia de Conversie & Diagnostic Automat al Candidaturilor
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
              Cautarea unui job este un maraton psihologic. In loc sa aplici haotic, masoara unde se pierd candidaturile tale si rezolva exact blocajul: <em>CV neadaptat la filtrele ATS</em> sau <em>pregatire insuficienta la interviul tehnic</em>.
            </p>
          </div>

          {/* XP & LEVEL BADGE */}
          {analytics && (
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl border border-slate-800 shadow-md min-w-[280px] shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-black text-sm">
                    L{analytics.currentLevel}
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Nivel Cariera</span>
                    <h3 className="text-xs font-black text-white">{analytics.levelTitle}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-rose-500/20 border border-rose-500/30 px-2.5 py-1 rounded-xl text-rose-300 text-xs font-black">
                  <Flame className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
                  <span>{analytics.dailyStreakDays} Zile Streak</span>
                </div>
              </div>

              {/* XP PROGRESS BAR */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-gray-300">XP Curent: <strong className="text-amber-400 font-black">{analytics.totalXp} XP</strong></span>
                  <span className="text-gray-400">{analytics.currentLevelXp} / {analytics.nextLevelXpRequired} XP</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${analytics.levelProgressPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md text-center transition animate-in slide-in-from-top">
          {toastMessage}
        </div>
      )}

      {/* DIAGNOSTIC AUTOMAT ANTI-BLOCAJ (HEALTH CHECK CARD) */}
      {analytics?.diagnosis && (
        <div className={`p-5 rounded-2xl border transition shadow-2xs ${
          analytics.diagnosis.healthStatus === 'WARNING_ATS_FILTER'
            ? 'bg-amber-50/90 border-amber-300 text-amber-950'
            : analytics.diagnosis.healthStatus === 'WARNING_TECH_INTERVIEW'
            ? 'bg-purple-50/90 border-purple-300 text-purple-950'
            : analytics.diagnosis.healthStatus === 'EXCELLENT' || analytics.diagnosis.healthStatus === 'HEALTHY'
            ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
            : 'bg-blue-50/90 border-blue-300 text-blue-950'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                {analytics.diagnosis.healthStatus.startsWith('WARNING') ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                <h3 className="font-black text-sm sm:text-base">
                  {analytics.diagnosis.headline}
                </h3>
              </div>

              <p className="text-xs font-semibold opacity-90 leading-relaxed">
                <strong>Cauza identificata:</strong> {analytics.diagnosis.rootCauseExplanation}
              </p>

              <p className="text-xs font-extrabold pt-1">
                👉 <strong>Planul recomandat:</strong> {analytics.diagnosis.recommendedActionPlan}
              </p>
            </div>

            {onNavigateToTab && analytics.diagnosis.directNavigationTab && (
              <button
                onClick={() => onNavigateToTab(analytics.diagnosis.directNavigationTab)}
                className="shrink-0 px-4 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-black transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Rezolva Blocajul Acum</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* SECTION: FUNNEL VISUALIZATION */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-950 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Palnia de Angajare (Hiring Conversion Funnel)
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Urmareste rata de conversie intre fiecare etapa si compara rezultatele cu benchmark-urile reale din Romania.
            </p>
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="self-start sm:self-auto p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Recalculeaza</span>
          </button>
        </div>

        {/* FUNNEL STEPS CARDS */}
        <div className="space-y-3">
          {analytics?.funnelStages?.map((stage, idx) => {
            const colors = getStageColorClasses(stage.statusColor);
            const isLast = idx === analytics.funnelStages.length - 1;

            return (
              <React.Fragment key={stage.key}>
                <div className={`p-4 rounded-2xl border ${colors.border} ${colors.light} flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:shadow-xs`}>
                  
                  {/* LEFT: STEP INFO */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl ${colors.bg} text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs`}>
                      #{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                        Etapa {idx + 1}
                      </span>
                      <h3 className="text-sm font-black text-gray-950 truncate">
                        {stage.label}
                      </h3>
                      <span className="text-[11px] text-gray-500 font-medium">
                        {stage.benchmarkRange}
                      </span>
                    </div>
                  </div>

                  {/* RIGHT: METRICS & CONVERSION */}
                  <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">Volum</span>
                      <span className="text-lg font-black text-gray-950">{stage.count}</span>
                    </div>

                    {idx > 0 && (
                      <div className="text-right border-l border-gray-300/60 pl-4 sm:pl-6">
                        <span className="text-[10px] font-bold text-gray-500 uppercase block">Rata Conversie</span>
                        <div className="flex items-center gap-1">
                          <span className={`text-base font-black ${stage.conversionRateFromPrevious >= 20 ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {stage.conversionRateFromPrevious}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* ARROW DOWN CONNECTOR */}
                {!isLast && (
                  <div className="flex justify-center -my-1">
                    <div className="p-1 rounded-full bg-gray-100 text-gray-400 border border-gray-200">
                      <ArrowDown className="w-3 h-3" />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* SECTION: WEEKLY CAREER QUESTS & ACHIEVEMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: WEEKLY QUESTS (7 COLS) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-black text-gray-950 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                Misiuni Saptamanale (Career Quests)
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Actiuni zilnice constante care aduc rezultate fara burnout.
              </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2 py-1 rounded-lg">
              Reset la 7 Zile
            </span>
          </div>

          <div className="space-y-3">
            {analytics?.weeklyQuests?.map((q) => {
              const isClaimed = !!claimedQuests[q.id];
              const progressPct = Math.min(100, Math.round((q.currentProgress / q.targetProgress) * 100));

              return (
                <div key={q.id} className="p-4 rounded-2xl border border-gray-200/80 bg-gray-50/60 hover:bg-white transition space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-purple-700 bg-purple-100 px-2 py-0.2 rounded-md">
                          +{q.rewardXp} XP
                        </span>
                        <h4 className="font-extrabold text-xs text-gray-950 truncate">
                          {q.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-gray-600 font-medium mt-1 leading-relaxed">
                        {q.description}
                      </p>
                    </div>

                    {isClaimed ? (
                      <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-xl shrink-0 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Revendicat
                      </span>
                    ) : q.completed ? (
                      <button
                        onClick={() => handleClaimQuest(q)}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl transition shadow-xs cursor-pointer shrink-0 animate-bounce"
                      >
                        Revendica XP!
                      </button>
                    ) : onNavigateToTab ? (
                      <button
                        onClick={() => onNavigateToTab(q.actionTab)}
                        className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
                      >
                        Incepe
                      </button>
                    ) : null}
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                      <span>Progres</span>
                      <span>{q.currentProgress} / {q.targetProgress}</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${progressPct >= 100 ? 'bg-emerald-500' : 'bg-purple-600'}`}
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: BADGES & ACHIEVEMENTS (5 COLS) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-black text-gray-950 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Insigne & Realizari (Badges)
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Recompense vizuale pentru etapele cheie parcurse.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {analytics?.badges?.map((badge) => (
              <div 
                key={badge.id}
                className={`p-3 rounded-2xl border transition flex flex-col justify-between ${
                  badge.unlocked
                    ? 'border-amber-200 bg-amber-50/50 shadow-2xs'
                    : 'border-gray-200 bg-gray-50/50 opacity-60 grayscale'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-white shadow-2xs border border-gray-100">
                    {getBadgeIcon(badge.iconKey)}
                  </div>
                  <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                    badge.rarity === 'LEGENDARY' 
                      ? 'bg-amber-200 text-amber-900' 
                      : badge.rarity === 'EPIC'
                      ? 'bg-purple-200 text-purple-900'
                      : 'bg-blue-100 text-blue-900'
                  }`}>
                    {badge.rarity}
                  </span>
                </div>

                <div className="mt-2.5">
                  <h4 className="font-extrabold text-xs text-gray-950 truncate">{badge.title}</h4>
                  <p className="text-[10px] text-gray-600 font-medium line-clamp-2 mt-0.5 leading-snug">
                    {badge.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* PSYCHOLOGY TIP BOX */}
          {analytics?.antiBurnoutAdvice && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 text-xs text-blue-950 space-y-1">
              <span className="font-black text-[11px] uppercase tracking-wider text-blue-800 block flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Sfatul Zilei Anti-Burnout
              </span>
              <p className="font-medium leading-relaxed italic text-[11px]">
                "{analytics.antiBurnoutAdvice}"
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
