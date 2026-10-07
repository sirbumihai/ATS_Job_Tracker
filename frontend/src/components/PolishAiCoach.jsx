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
      console.error('Eroare la preluarea diagnozei AI Review:', err);
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

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'IMPACT': return { label: 'Impact Masurabil', bg: 'bg-neutral-100 text-neutral-900 border-neutral-200 font-mono' };
      case 'TECH_DEPTH': return { label: 'Adancime Tehnica', bg: 'bg-neutral-100 text-neutral-900 border-neutral-200 font-mono' };
      case 'STACK': return { label: 'Tech Stack & Cloud', bg: 'bg-neutral-100 text-neutral-900 border-neutral-200 font-mono' };
      case 'PRODUCTION': return { label: 'Productie & Arhitectura', bg: 'bg-neutral-100 text-neutral-900 border-neutral-200 font-mono' };
      case 'ROLE': return { label: 'Aliniere Rol', bg: 'bg-neutral-100 text-neutral-900 border-neutral-200 font-mono' };
      default: return { label: 'Recomandare AI', bg: 'bg-neutral-100 text-neutral-900 border-neutral-200 font-mono' };
    }
  };

  const pillars = [
    { key: 'roleMatch', label: 'Role Match', icon: Layers, score: diagnosis?.roleMatchScore || 95 },
    { key: 'projectsDepth', label: 'Projects Depth', icon: Cpu, score: diagnosis?.projectsDepthScore || 95 },
    { key: 'production', label: 'Production Ownership', icon: ShieldCheck, score: diagnosis?.productionScore || 94 },
    { key: 'techSkills', label: 'Tech Skills Match', icon: BrainCircuit, score: diagnosis?.techSkillsScore || 95 },
    { key: 'impact', label: 'Quantified Impact', icon: TrendingUp, score: diagnosis?.impactScore || 88 },
    { key: 'structure', label: 'Structure & Readability', icon: FileCheck, score: diagnosis?.structureScore || 100 },
  ];

  const currentScore = diagnosis?.totalScore ? (appliedFixIds.size > 0 ? Math.min(98.5, diagnosis.totalScore + (appliedFixIds.size * 2.0)) : diagnosis.totalScore) : 88.0;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-xl p-4 sm:p-5 space-y-5 text-neutral-900 font-sans">
      
      {/* HEADER WITH SCORE & CLOSE */}
      <div className="flex items-start justify-between gap-3 border-b border-neutral-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-neutral-950 tracking-tight">
                AI Review • Diagnostic & Evaluare CV
              </h3>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-900 border border-neutral-200">
                Audit Calitate
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">
              Recomandari de optimizare a impactului si competentelor tehnice
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchDiagnosis}
            disabled={loading}
            title="Recalculeaza diagnoza"
            className="p-1.5 rounded-xl hover:bg-neutral-100 text-neutral-400 hover:text-black transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {onClose && (
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-xl hover:bg-neutral-100 text-neutral-400 hover:text-black transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* OVERALL SCORE DIAL CARD */}
      <div className="bg-black text-white p-4 sm:p-5 rounded-xl border border-neutral-800 shadow-sm space-y-3">
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
              {currentScore >= 90 ? 'Nivel Excelent' : 'Nivel Bun'}
            </span>
            <p className="text-[10px] text-gray-400 mt-1">
              {appliedFixIds.size} din {diagnosis?.suggestions?.length || 5} imbunatatiri aplicate
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
          {diagnosis?.summaryVerdict || "Scor solid. Aplicarea recomandarilor va creste claritatea si impactul profilului tau."}
        </p>
      </div>

      {/* 6-PILLAR SCORE BREAKDOWN */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-gray-500" /> Cei 6 Piloni de Evaluare ATS:
          </h4>
          <span className="text-[10px] text-gray-400 font-medium">Scoring Standard</span>
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

      {/* SUGGESTIONS LIST */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Sugestii de Imbunatatire
            </h4>
          </div>
          {diagnosis?.suggestions && diagnosis.suggestions.length > 0 && appliedFixIds.size < diagnosis.suggestions.length && (
            <button
              onClick={handleApplyAll}
              className="text-[11px] font-bold text-black hover:text-neutral-700 flex items-center gap-1 cursor-pointer bg-neutral-100 hover:bg-neutral-200 px-3 py-1 rounded-xl transition"
            >
              <Sparkles className="w-3 h-3 text-black" /> Aplica Toate
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
                    ? 'border-neutral-300 bg-neutral-50/60' 
                    : 'border-neutral-200 hover:border-neutral-300 bg-white shadow-2xs'
                }`}
              >
                {/* SUGGESTION CARD HEADER */}
                <div 
                  onClick={() => setExpandedFixId(isExpanded ? null : sug.id)}
                  className="p-3 flex items-start justify-between gap-2 cursor-pointer select-none"
                >
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      {isApplied && (
                        <span className="text-[10px] font-mono font-bold text-black bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Check className="w-3 h-3" /> Aplicat
                        </span>
                      )}
                    </div>
                    <h5 className="text-xs font-bold text-neutral-950 leading-tight">
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
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-xs ${
                        isApplied 
                          ? 'bg-neutral-200 text-neutral-600 opacity-90 cursor-default' 
                          : 'bg-black hover:bg-neutral-800 text-white'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Aplicat</span>
                        </>
                      ) : (
                        <>
                          <span>Apply</span>
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
                        Inainte:
                      </span>
                      <p className="text-gray-500 line-through text-[11px] leading-relaxed bg-rose-50/70 p-2 rounded-lg border border-rose-100">
                        {sug.beforeText}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Dupa (Recomandare AI):
                      </span>
                      <p className="text-gray-900 font-medium text-[11px] leading-relaxed bg-white p-2.5 rounded-lg border border-emerald-200 shadow-2xs">
                        {sug.afterText}
                      </p>
                    </div>

                    <div className="text-[11px] text-gray-500 bg-gray-100/80 p-2 rounded-lg">
                      <strong className="text-gray-700">De ce conteaza:</strong> {sug.rationale}
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
