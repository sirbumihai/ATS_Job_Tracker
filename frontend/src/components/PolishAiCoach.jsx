import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import ScoreRing from './ui/ScoreRing';
import ScoreBar from './ui/ScoreBar';
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
      case 'IMPACT': return { label: 'Impact măsurabil', bg: 'bg-neutral-100 text-neutral-900 border-neutral-200 font-mono' };
      case 'TECH_DEPTH': return { label: 'Adâncime tehnică', bg: 'bg-neutral-100 text-neutral-900 border-neutral-200 font-mono' };
      case 'STACK': return { label: 'Stack tehnic', bg: 'bg-neutral-100 text-neutral-900 border-neutral-200 font-mono' };
      case 'PRODUCTION': return { label: 'Producție și arhitectură', bg: 'bg-neutral-100 text-neutral-900 border-neutral-200 font-mono' };
      case 'ROLE': return { label: 'Aliniere cu rolul', bg: 'bg-neutral-100 text-neutral-900 border-neutral-200 font-mono' };
      default: return { label: 'Recomandare AI', bg: 'bg-neutral-100 text-neutral-900 border-neutral-200 font-mono' };
    }
  };

  const pillars = [
    { key: 'roleMatch', label: 'Potrivire rol', icon: Layers, score: diagnosis?.roleMatchScore || 95 },
    { key: 'projectsDepth', label: 'Proiecte', icon: Cpu, score: diagnosis?.projectsDepthScore || 95 },
    { key: 'production', label: 'Producție', icon: ShieldCheck, score: diagnosis?.productionScore || 94 },
    { key: 'techSkills', label: 'Competențe tehnice', icon: BrainCircuit, score: diagnosis?.techSkillsScore || 95 },
    { key: 'impact', label: 'Impact măsurabil', icon: TrendingUp, score: diagnosis?.impactScore || 88 },
    { key: 'structure', label: 'Structură', icon: FileCheck, score: diagnosis?.structureScore || 100 },
  ];

  const currentScore = diagnosis?.totalScore ? (appliedFixIds.size > 0 ? Math.min(98.5, diagnosis.totalScore + (appliedFixIds.size * 2.0)) : diagnosis.totalScore) : 88.0;

  return (
    <Card className="space-y-5 text-neutral-900 font-sans" data-testid="polish-coach">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-serif text-lg font-medium text-neutral-950 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-500" />
          AI Review
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={fetchDiagnosis}
            disabled={loading}
            title="Recalculează diagnoza"
            aria-label="Recalculează diagnoza"
            className="p-1.5 rounded-xl hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              title="Închide"
              aria-label="Închide AI Review"
              className="p-1.5 rounded-xl hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ScoreRing value={currentScore} label="Scor ATS" size={88} />
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-neutral-950">
            {currentScore >= 90 ? 'Nivel excelent' : 'Nivel bun'}
          </p>
          <p className="text-xs text-neutral-500">
            {appliedFixIds.size} din {diagnosis?.suggestions?.length || 0} îmbunătățiri aplicate
          </p>
          {diagnosis?.summaryVerdict && (
            <p className="text-sm text-neutral-600 leading-snug">{diagnosis.summaryVerdict}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 pt-4 border-t border-neutral-100">
        {pillars.map((p) => {
          const pScore = p.key === 'impact' && appliedFixIds.size > 0 ? Math.min(96, p.score + (appliedFixIds.size * 2)) : p.score;
          return <ScoreBar key={p.key} label={p.label} value={pScore} max={100} />;
        })}
      </div>

      <div className="space-y-3 pt-4 border-t border-neutral-100">
        <div className="flex items-center justify-between">
          <h4 className="font-sans text-sm font-medium text-neutral-950 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-brand-500" />
            Sugestii
          </h4>
          {diagnosis?.suggestions && diagnosis.suggestions.length > 0 && appliedFixIds.size < diagnosis.suggestions.length && (
            <button
              onClick={handleApplyAll}
              className="text-xs font-medium text-brand-700 hover:text-brand-800 flex items-center gap-1 cursor-pointer bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl transition"
            >
              <Sparkles className="w-3 h-3" /> Aplică toate
            </button>
          )}
        </div>

        <ul className="divide-y divide-neutral-100">
          {diagnosis?.suggestions?.map((sug, idx) => {
            const isApplied = appliedFixIds.has(sug.id);
            const isExpanded = expandedFixId === sug.id;
            const badge = getCategoryBadge(sug.category);

            return (
              <li key={sug.id || idx} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setExpandedFixId(isExpanded ? null : sug.id)}
                    aria-expanded={isExpanded}
                    className="flex-1 min-w-0 text-left cursor-pointer"
                  >
                    <span className="text-xs text-neutral-500">{badge.label}</span>
                    <span className="block text-sm font-medium text-neutral-950 leading-snug">{sug.title}</span>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleApplySingle(sug)}
                      disabled={isApplied}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 transition ${
                        isApplied
                          ? 'bg-neutral-100 text-neutral-500 cursor-default'
                          : 'bg-brand-500 hover:bg-brand-600 text-white cursor-pointer'
                      }`}
                    >
                      {isApplied ? <><Check className="w-3.5 h-3.5" /><span>Aplicat</span></> : <span>Aplică</span>}
                    </button>
                    <span className="text-neutral-400 p-1" aria-hidden="true">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 space-y-3 text-sm">
                    <div>
                      <span className="text-xs text-neutral-500">Înainte</span>
                      <p className="text-neutral-500 line-through leading-relaxed">{sug.beforeText}</p>
                    </div>
                    <div>
                      <span className="text-xs text-brand-700">După</span>
                      <p className="text-neutral-950 leading-relaxed">{sug.afterText}</p>
                    </div>
                    {sug.rationale && (
                      <p className="text-xs text-neutral-500"><span className="font-medium text-neutral-700">De ce contează:</span> {sug.rationale}</p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
}
