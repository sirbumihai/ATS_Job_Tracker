import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  BrainCircuit, 
  Layers, 
  Cpu, 
  BarChart3, 
  FileCheck, 
  ShieldCheck, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  RefreshCw,
  X
} from 'lucide-react';

export default function PolishAiCoach({ 
  cvId, 
  applicationId, 
  onApplyFix, 
  onApplyAllFixes,
  onClose
}) {
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [appliedFixIds, setAppliedFixIds] = useState(new Set());
  const [expandedFixId, setExpandedFixId] = useState(null);

  const fetchDiagnosis = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/ai/polish-diagnosis?cvProfileId=${cvId || ''}&applicationId=${applicationId || ''}`);
      if (res.ok) {
        const data = await res.json();
        setDiagnosis(data);
        if (data.suggestions && data.suggestions.length > 0) {
          setExpandedFixId(data.suggestions[0].id);
        }
      }
    } catch (err) {
      console.error('Eroare la preluarea diagnozei Polish AI:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnosis();
  }, [cvId, applicationId]);

  const handleApplySingle = (suggestion) => {
    if (onApplyFix) {
      onApplyFix(suggestion);
      setAppliedFixIds(prev => new Set(prev).add(suggestion.id));
    }
  };

  const handleApplyAll = () => {
    if (diagnosis?.suggestions && onApplyAllFixes) {
      onApplyAllFixes(diagnosis.suggestions);
      const allIds = new Set(diagnosis.suggestions.map(s => s.id));
      setAppliedFixIds(allIds);
    }
  };

  const getPillarColor = (score) => {
    if (score >= 95) return 'bg-emerald-500 text-emerald-700 border-emerald-200';
    if (score >= 88) return 'bg-blue-500 text-blue-700 border-blue-200';
    return 'bg-amber-500 text-amber-700 border-amber-200';
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'IMPACT': return { label: 'Impact Măsurabil (Google XYZ)', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'TECH_DEPTH': return { label: 'Adâncime Tehnică & SQL', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'STACK': return { label: 'Tech Stack & Cloud', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'PRODUCTION': return { label: 'Production & Vector AI', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'ROLE': return { label: 'Aliniere Rol & Concurrency', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      default: return { label: 'Optimizare ATS', bg: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const pillars = [
    { key: 'roleMatch', label: 'Role Match', icon: Layers, score: diagnosis?.roleMatchScore || 95 },
    { key: 'projectsDepth', label: 'Projects Depth', icon: Cpu, score: diagnosis?.projectsDepthScore || 95 },
    { key: 'production', label: 'Production Ownership', icon: ShieldCheck, score: diagnosis?.productionScore || 94 },
    { key: 'techSkills', label: 'Tech Skills Match', icon: BrainCircuit, score: diagnosis?.techSkillsScore || 95 },
    { key: 'impact', label: 'Quantified Impact (XYZ)', icon: TrendingUp, score: diagnosis?.impactScore || 88 },
    { key: 'structure', label: 'Structure & Readability', icon: FileCheck, score: diagnosis?.structureScore || 100 },
  ];

  const currentScore = diagnosis?.totalScore ? (appliedFixIds.size > 0 ? Math.min(98.5, diagnosis.totalScore + (appliedFixIds.size * 2.0)) : diagnosis.totalScore) : 88.0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xl p-4 sm:p-5 space-y-5 text-gray-900 font-sans">
      
      {/* HEADER WITH SCORE & CLOSE */}
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-gray-950 tracking-tight">
                Polish AI • Resume Optimizer
              </h3>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                FAANG Standard
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Optimizare asistată live conform Formulei Google X-Y-Z
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchDiagnosis}
            disabled={loading}
            title="Recalculează diagnoza"
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* OVERALL SCORE DIAL CARD */}
      <div className="bg-gradient-to-br from-gray-900 via-neutral-900 to-black text-white p-4 sm:p-5 rounded-2xl shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-gray-400 font-extrabold block">
              Scor ATS Global
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {currentScore.toFixed(0)}
              </span>
              <span className="text-sm font-bold text-gray-400">/ 100</span>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {currentScore >= 95 ? 'Top 1% Elite Candidate' : 'Strong Candidate (Pushing 95+)'}
            </span>
            <p className="text-[10px] text-gray-400 mt-1">
              {appliedFixIds.size} din {diagnosis?.suggestions?.length || 5} îmbunătățiri aplicate
            </p>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, Math.max(10, currentScore))}%` }}
          ></div>
        </div>

        <p className="text-xs text-gray-300 font-medium leading-snug pt-1">
          {diagnosis?.summaryVerdict || "Scor foarte solid! Aplicarea metricilor cuantificate Google X-Y-Z îți va propulsa profilul în Top 1% candidați."}
        </p>
      </div>

      {/* 6-PILLAR SCORE BREAKDOWN */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-gray-500" /> Cei 6 Piloni de Evaluare ATS:
          </h4>
          <span className="text-[10px] text-gray-400 font-medium">Recruiter Scoring Rubric</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {pillars.map((p) => {
            const Icon = p.icon;
            const pScore = p.key === 'impact' && appliedFixIds.size > 0 ? Math.min(96, p.score + (appliedFixIds.size * 2)) : p.score;
            return (
              <div key={p.key} className="p-2.5 rounded-xl border border-gray-200/90 bg-gray-50/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-gray-700 truncate">
                    <Icon className="w-3 h-3 text-gray-500 shrink-0" />
                    <span className="truncate">{p.label.split(' ')[0]}</span>
                  </div>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded border ${
                    pScore >= 95 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {pScore.toFixed(0)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${pScore >= 95 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(100, Math.max(10, pScore))}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TOP 5 HIGH IMPACT FIXES (POLISHME STYLE) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Top 5 Îmbunătățiri de Mare Impact (1-Click Fixes)
            </h4>
          </div>
          {diagnosis?.suggestions && diagnosis.suggestions.length > 0 && appliedFixIds.size < diagnosis.suggestions.length && (
            <button
              onClick={handleApplyAll}
              className="text-[11px] font-extrabold text-black hover:text-neutral-700 flex items-center gap-1 cursor-pointer bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition"
            >
              <Sparkles className="w-3 h-3 text-amber-500" /> Aplică Toate (Boost 96+)
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {diagnosis?.suggestions?.map((sug, idx) => {
            const isApplied = appliedFixIds.has(sug.id);
            const isExpanded = expandedFixId === sug.id;
            const badge = getCategoryBadge(sug.category);

            return (
              <div 
                key={sug.id || idx}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isApplied 
                    ? 'border-emerald-300 bg-emerald-50/40' 
                    : 'border-gray-200 hover:border-gray-300 bg-white shadow-2xs'
                }`}
              >
                {/* SUGGESTION CARD HEADER */}
                <div 
                  onClick={() => setExpandedFixId(isExpanded ? null : sug.id)}
                  className="p-3 flex items-start justify-between gap-2 cursor-pointer select-none"
                >
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      {isApplied && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Check className="w-3 h-3" /> Aplicat
                        </span>
                      )}
                    </div>
                    <h5 className="text-xs font-bold text-gray-950 leading-tight">
                      {sug.title}
                    </h5>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplySingle(sug);
                      }}
                      disabled={isApplied}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs ${
                        isApplied 
                          ? 'bg-emerald-600 text-white opacity-90 cursor-default' 
                          : 'bg-black hover:bg-neutral-800 text-white'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Salvat
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          1-Click Apply
                        </>
                      )}
                    </button>
                    <div className="text-gray-400 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* EXPANDED BEFORE / AFTER DIFF */}
                {isExpanded && (
                  <div className="px-3 pb-3.5 pt-1 space-y-2.5 border-t border-gray-100 bg-gray-50/50 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600">
                        Înainte (Fără metrici / Pasiv):
                      </span>
                      <p className="text-gray-500 line-through text-[11px] leading-relaxed bg-rose-50/70 p-2 rounded-lg border border-rose-100">
                        {sug.beforeText}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> După (Formula Google X-Y-Z cu Metrici Reale):
                      </span>
                      <p className="text-gray-900 font-medium text-[11px] leading-relaxed bg-white p-2.5 rounded-lg border border-emerald-200 shadow-2xs">
                        {sug.afterText}
                      </p>
                    </div>

                    <div className="text-[11px] text-gray-500 italic bg-gray-100/80 p-2 rounded-lg">
                      💡 <strong>De ce contează:</strong> {sug.rationale}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
