import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  MapPin, 
  Building2, 
  Briefcase, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Layers, 
  Globe, 
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  Users,
  FileText,
  Check, 
  ChevronRight, 
  TrendingUp, 
  Share2,
  Calendar,
  History,
  GitCommit,
  Database,
  Target,
  Award,
  BookOpen,
  Gift,
  CheckCheck,
  Lightbulb,
  AlertTriangle,
  RefreshCw,
  Bot
} from 'lucide-react';

// Parser inteligent de Job Description: extragere structurată de cerințe obligatorii, bonus, responsabilități și beneficii
const parseJobDescription = (rawText, skillsRequired = [], matchingSkills = [], missingSkills = []) => {
  if (!rawText || rawText.trim().length === 0) {
    return {
      mandatoryRequirements: (skillsRequired || []).map(s => ({
        text: `Cunoștințe sau experiență demonstrabilă cu ${s}`,
        matched: (matchingSkills || []).includes(s) ? [s] : [],
        missing: (missingSkills || []).includes(s) ? [s] : []
      })),
      bonusRequirements: [],
      responsibilities: [],
      benefits: [],
      hasParsedSections: false,
      cleanedText: ''
    };
  }

  // 1. Curățare HTML & entități
  let text = rawText
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<h[1-6][^>]*>/gi, '\n\n### ')
    .replace(/<\/h[1-6]>/gi, ':\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\r\n/g, '\n')
    .trim();

  // 1.1 Inserare separatoare înainte de antete comune când textul este compactat (ex: LinkedIn text fără newline)
  text = text.replace(/([a-z0-9\.\)\!\?])\s*(Main responsibilities|Key responsibilities|Responsibilities|What you will do|Tasks|Activități|Responsabilități|Ce vei face|Required skills|Requirements|Must have|Qualifications|Ce căutăm|Cerințe obligatorii|Cerințe|Desirable skills|Nice to have|Good to have|Bonus|Constituie avantaj|Reprezintă un plus|Avantaje|Compensation & benefits|Benefits|What we offer|Beneficii|Ce oferim)\b/gi, '$1\n\n### $2\n');

  // 1.2 Separare elemente de listă concatenate (ex: "testingWork in teams", "ManagersBug fixing")
  text = text.replace(/([a-z0-9\.\)])([A-Z][a-z]{3,})/g, '$1\n• $2');

  const lines = text.split('\n');
  const sections = {
    mandatory: [],
    bonus: [],
    responsibilities: [],
    benefits: []
  };

  let currentSection = null;
  let hasFoundExplicitSection = false;

  const isHeading = (line) => {
    const l = line.trim().toLowerCase().replace(/^###\s*/, '').replace(/[:\s]+$/, '');
    return (
      (line.startsWith('### ') || line.endsWith(':') || line.length < 90) &&
      /(cerin[tț]e|ce c[aă]ut[aă]m|ce ne dorim|profilul c[aă]utat|profil candidat|calific[aă]ri|competen[tț]e|must have|requirements|required skills|what you need|qualifications|who you are|candidate profile|skills & experience|what you bring|ce trebuie s[aă] ai|hard skills|condi[tț]ii|cuno[sș]tin[tț]e|bonus|constituie avantaj|reprezint[aă] un plus|nice to have|good to have|desirable skills|preferred qualifications|would be a plus|avantaje|plusuri|op[tț]ional|responsabilit[aă][tț]i|ce vei face|rolul t[aă]u|descrierea rolului|activit[aă][tț]i|ce presupune rolul|main responsibilities|key responsibilities|responsibilities|what you will do|your role|tasks|what you'll be doing|compensation & benefits|beneficii|ce oferim|ce [iî][tț]i oferim|pachet de beneficii|benefits|what we offer|perks|compensation)/i.test(l)
    );
  };

  const getSectionType = (line) => {
    const l = line.toLowerCase();
    if (/desirable skills|bonus|constituie avantaj|reprezint[aă] un plus|nice to have|good to have|preferred qualifications|would be a plus|plusuri|op[tț]ional|ce constituie avantaj/i.test(l)) {
      return 'bonus';
    }
    if (/required skills|cerin[tț]e|ce c[aă]ut[aă]m|ce ne dorim|profilul c[aă]utat|profil candidat|calific[aă]ri|must have|requirements|what you need|qualifications|who you are|candidate profile|skills & experience|hard skills|cuno[sș]tin[tț]e/i.test(l)) {
      return 'mandatory';
    }
    if (/main responsibilities|key responsibilities|responsabilit[aă][tț]i|ce vei face|rolul t[aă]u|descrierea rolului|activit[aă][tț]i|responsibilities|what you will do|your role|tasks/i.test(l)) {
      return 'responsibilities';
    }
    if (/compensation & benefits|beneficii|ce oferim|ce [iî][tț]i oferim|benefits|what we offer|perks|compensation/i.test(l)) {
      return 'benefits';
    }
    return null;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    if (isHeading(rawLine)) {
      const detected = getSectionType(rawLine);
      if (detected) {
        currentSection = detected;
        hasFoundExplicitSection = true;
        continue;
      }
    }

    const cleanItem = rawLine.replace(/^###\s*/, '').replace(/^[•\-*–—]\s*/, '').trim();
    if (!cleanItem) continue;

    if (currentSection) {
      if ((currentSection === 'mandatory') && /constituie (un )?avantaj|reprezint[aă] (un )?plus|nice to have|would be a plus|bonus/i.test(cleanItem)) {
        sections.bonus.push(cleanItem);
        continue;
      }
      sections[currentSection].push(cleanItem);
    } else {
      if (/constituie (un )?avantaj|reprezint[aă] (un )?plus|nice to have|bonus/i.test(cleanItem)) {
        sections.bonus.push(cleanItem);
      } else if (cleanItem.length > 15 && cleanItem.length < 160 && /candidat|experien|skills|studii|cuno[sș]tin|programare/i.test(cleanItem)) {
        sections.mandatory.push(cleanItem);
      }
    }
  }

  // Fallback dacă nu s-au găsit cerințe explicite dar avem skillsRequired
  if (sections.mandatory.length === 0 && skillsRequired && skillsRequired.length > 0) {
    sections.mandatory = skillsRequired.map(s => `Cunoștințe practice de ${s}`);
  }

  // Mapare și asociere automată a competențelor pe fiecare cerință
  const mapWithSkillMatch = (items) => {
    return items.map(text => {
      const tLow = text.toLowerCase();
      const matched = (matchingSkills || []).filter(s => {
        const sLow = s.toLowerCase();
        return tLow.includes(sLow) || (sLow === 'java' && tLow.includes('java') && !tLow.includes('javascript'));
      });
      const missing = (missingSkills || []).filter(s => {
        const sLow = s.toLowerCase();
        return tLow.includes(sLow) || (sLow === 'java' && tLow.includes('java') && !tLow.includes('javascript'));
      });
      return { text, matched, missing };
    });
  };

  return {
    mandatoryRequirements: mapWithSkillMatch(sections.mandatory),
    bonusRequirements: mapWithSkillMatch(sections.bonus),
    responsibilities: sections.responsibilities,
    benefits: sections.benefits,
    hasParsedSections: hasFoundExplicitSection || sections.mandatory.length > 0,
    cleanedText: text
  };
};

export default function JobDetailModal({ 
  job, 
  onClose, 
  onSaveToKanban, 
  isSaved, 
  isSaving,
  activeUserId 
}) {
  const [detailedJob, setDetailedJob] = useState(job);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [jobChanges, setJobChanges] = useState([]);
  const [loadingChanges, setLoadingChanges] = useState(false);
  const [showChanges, setShowChanges] = useState(false);
  const [aiAnalysisData, setAiAnalysisData] = useState(null);
  const [loadingAiAnalysis, setLoadingAiAnalysis] = useState(false);
  const [aiAnalysisError, setAiAnalysisError] = useState(null);

  const formatDateTime = (dtStr) => {
    if (!dtStr) return 'Nespecificat';
    try {
      const d = new Date(dtStr);
      if (isNaN(d.getTime())) return dtStr;
      return d.toLocaleString('ro-RO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dtStr;
    }
  };

  const runAiMatch = async () => {
    setLoadingAiAnalysis(true);
    setAiAnalysisError(null);
    try {
      const res = await fetch('/api/v1/ai/match-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(activeUserId ? { 'X-User-Id': activeUserId } : {})
        },
        body: JSON.stringify({
          jobId: currentJob.id,
          jobTitle: currentJob.jobTitle,
          rawDescription: currentJob.rawDescription,
          userId: activeUserId
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && (data.aiVerified || (data.matchingSkills && data.matchingSkills.length > 0))) {
          setAiAnalysisData(data);
        } else {
          setAiAnalysisError("Analiza AI nu a putut fi finalizată.");
        }
      } else {
        setAiAnalysisError("Serviciul AI este indisponibil momentan.");
      }
    } catch (err) {
      console.warn("Eroare AI match:", err);
      setAiAnalysisError("Eroare de conexiune la AI.");
    } finally {
      setLoadingAiAnalysis(false);
    }
  };

  const fetchChanges = async () => {
    if (showChanges) {
      setShowChanges(false);
      return;
    }
    setShowChanges(true);
    if (jobChanges.length === 0) {
      setLoadingChanges(true);
      try {
        const res = await fetch(`/api/v1/jobs/${currentJob.id}/changes`);
        if (res.ok) {
          const data = await res.json();
          setJobChanges(data);
        }
      } catch (err) {
        console.warn('Eroare la preluarea istoricului:', err);
      } finally {
        setLoadingChanges(false);
      }
    }
  };

  useEffect(() => {
    if (!job) return;

    // Închidere la tasta Escape
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    // Preluăm detaliile extinse dacă descrierea este scurtă/placeholder sau lipsesc competențele de matching
    const isDescriptionShort = !job.rawDescription || job.rawDescription.length < 350 || job.rawDescription.includes('Descrierea completă a postului salvat');
    const isMissingSkillBreakdown = !job.matchingSkills || job.matchingSkills.length === 0;
    const needsDetailsFetch = !!job.id && (isDescriptionShort || isMissingSkillBreakdown || ['LINKEDIN', 'HIPO', 'BESTJOBS'].includes(job.sourcePlatform));

    if (needsDetailsFetch) {
      setLoadingDetails(true);
      const url = activeUserId ? `/api/v1/jobs/${job.id}/details?userId=${activeUserId}` : `/api/v1/jobs/${job.id}/details`;
      fetch(url, {
        headers: activeUserId ? { 'X-User-Id': activeUserId } : {}
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setDetailedJob({
              ...data,
              atsMatchScore: (typeof data.atsMatchScore === 'number' && data.atsMatchScore > 0) ? data.atsMatchScore : (job.atsMatchScore || 0),
              matchingSkills: (data.matchingSkills && data.matchingSkills.length > 0) ? data.matchingSkills : (job.matchingSkills || []),
              missingSkills: (data.missingSkills && data.missingSkills.length > 0) ? data.missingSkills : (job.missingSkills || []),
              experienceLevel: job.experienceLevel || data.experienceLevel,
              workModel: job.workModel || data.workModel,
              salaryRange: job.salaryRange || data.salaryRange,
              rawDescription: (data.rawDescription && data.rawDescription.length > (job.rawDescription?.length || 0)) ? data.rawDescription : (job.rawDescription || data.rawDescription)
            });
          }
        })
        .catch(err => console.warn('Nu s-au putut încărca detaliile extinse:', err))
        .finally(() => setLoadingDetails(false));
    } else {
      setDetailedJob(job);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [job, activeUserId]);

  if (!job) return null;

  const currentJob = detailedJob || job;

  const displayMatchingSkills = (aiAnalysisData?.matchingSkills && aiAnalysisData.matchingSkills.length > 0)
    ? aiAnalysisData.matchingSkills
    : (currentJob.matchingSkills || []);

  const displayMissingSkills = (aiAnalysisData?.missingSkills && aiAnalysisData.missingSkills.length > 0)
    ? aiAnalysisData.missingSkills
    : (currentJob.missingSkills || []);

  const displayScore = aiAnalysisData?.atsScore != null
    ? Number(aiAnalysisData.atsScore)
    : (typeof currentJob.atsMatchScore === 'number' ? currentJob.atsMatchScore : 0);

  const skillsRequired = (aiAnalysisData?.matchingSkills && aiAnalysisData?.missingSkills)
    ? [...aiAnalysisData.matchingSkills, ...aiAnalysisData.missingSkills]
    : (currentJob.skillsRequired || []);

  const parsedDescription = useMemo(() => {
    return parseJobDescription(
      currentJob.rawDescription,
      skillsRequired,
      displayMatchingSkills,
      displayMissingSkills
    );
  }, [currentJob.rawDescription, skillsRequired, displayMatchingSkills, displayMissingSkills]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentJob.directApplyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Formatare estetică a textului descrierii
  const formatDescription = (rawText) => {
    if (!rawText) return <p className="text-gray-500 italic">Descrierea completă nu este disponibilă.</p>;

    // Împărțire pe paragrafe
    const paragraphs = rawText.split(/\n\s*\n|\r\n\r\n/);

    return paragraphs.map((para, pIdx) => {
      const trimmed = para.trim();
      if (!trimmed) return null;

      // Verificare dacă paragraful este o listă cu liniuțe sau bullet points
      if (trimmed.includes('•') || trimmed.includes('- ') || trimmed.includes('* ')) {
        const lines = trimmed.split(/\n/);
        return (
          <ul key={pIdx} className="my-3 space-y-1.5 list-disc pl-5 text-gray-700 leading-relaxed text-sm">
            {lines.map((line, lIdx) => {
              const cleanLine = line.replace(/^[•\-*]\s*/, '').trim();
              if (!cleanLine) return null;
              return <li key={lIdx}>{cleanLine}</li>;
            })}
          </ul>
        );
      }

      // Verificare dacă este un antet (Header)
      if (trimmed.endsWith(':') || trimmed.length < 50 && (trimmed.toLowerCase().includes('cerin') || trimmed.toLowerCase().includes('responsabilit') || trimmed.toLowerCase().includes('benefic') || trimmed.toLowerCase().includes('requirements') || trimmed.toLowerCase().includes('responsibilities'))) {
        return (
          <h4 key={pIdx} className="text-sm font-black text-gray-950 uppercase tracking-wider mt-5 mb-2 border-b border-gray-100 pb-1">
            {trimmed}
          </h4>
        );
      }

      return (
        <p key={pIdx} className="my-2 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center items-start p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* CONTAINER MODAL / SHEET */}
      <div 
        className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* HEADER BAR FIX CU CLOSE & SHARE */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-black text-white">
              {currentJob.sourcePlatform}
            </span>
            <span className="text-xs text-gray-500 font-semibold">
              ID: {currentJob.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-200/70 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Copiază link-ul direct de aplicare"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copiat!' : 'Distribuie'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-200/70 transition cursor-pointer"
              title="Închide fereastra (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 flex-1 scrollbar-thin">

          {/* TITLU & COMPANIE */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
            <div className="flex items-start gap-4">
              <img 
                src={currentJob.companyLogoUrl} 
                alt={currentJob.companyName}
                className="w-16 h-16 rounded-2xl object-cover bg-gray-50 border border-gray-200 shrink-0 shadow-sm"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=120&auto=format&fit=crop&q=80';
                }}
              />
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight leading-snug">
                  {currentJob.jobTitle}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 font-semibold">
                  <span className="flex items-center gap-1 text-gray-900 font-extrabold">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    {currentJob.companyName}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {currentJob.location}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-gray-700 font-bold text-xs" title={currentJob.postedAt ? `Data postării: ${currentJob.postedAt}` : 'Data exactă de publicare nu a fost furnizată de angajator'}>
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    {currentJob.postedAt ? (formatDateTime(currentJob.postedAt) !== 'Nespecificat' ? formatDateTime(currentJob.postedAt) : currentJob.postedDateAgo) : (currentJob.postedDateAgo || 'Dată nespecificată')}
                  </span>
                  {currentJob.status && (
                    <>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        currentJob.status === 'ACTIVE' 
                          ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' 
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      }`}>
                        {currentJob.status === 'ACTIVE' ? 'Activ' : 'Expirat / Arhivat'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* SCOR ATS MATCH MARE */}
            <div className={`shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl border self-start ${
              currentJob.atsMatchScore >= 75 
                ? 'bg-emerald-50 text-emerald-950 border-emerald-300 shadow-sm shadow-emerald-50' 
                : currentJob.atsMatchScore >= 45 
                ? 'bg-amber-50 text-amber-950 border-amber-300 shadow-sm shadow-amber-50' 
                : 'bg-rose-50 text-rose-950 border-rose-300 shadow-sm shadow-rose-50'
            }`}>
              <Sparkles className={`w-5 h-5 ${currentJob.atsMatchScore >= 75 ? 'text-emerald-600' : currentJob.atsMatchScore >= 45 ? 'text-amber-600' : 'text-rose-600'}`} />
              <div>
                <div className="text-lg font-black leading-tight">
                  {currentJob.atsMatchScore.toFixed(1)}% Match
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Scor ATS Ponderat
                </div>
              </div>
            </div>
          </div>

          {/* GRID METADATE CHEIE */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50/90 border border-gray-200/80 p-3.5 rounded-2xl space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Pachet Salarial
              </span>
              <p className="text-xs sm:text-sm font-extrabold text-gray-900 truncate">
                {currentJob.salaryRange || 'Conform Anunț'}
              </p>
            </div>

            <div className="bg-gray-50/90 border border-gray-200/80 p-3.5 rounded-2xl space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                Mod de Lucru
              </span>
              <p className="text-xs sm:text-sm font-extrabold text-gray-900">
                {currentJob.workModel === 'REMOTE' ? 'Remote' : currentJob.workModel === 'HYBRID' ? 'Hibrid' : 'On-Site'}
              </p>
            </div>

            <div className="bg-gray-50/90 border border-gray-200/80 p-3.5 rounded-2xl space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                Nivel Experiență
              </span>
              <p className="text-xs sm:text-sm font-extrabold text-gray-900">
                {currentJob.experienceLevel === 'INTERNSHIP' ? 'Internship' :
                 currentJob.experienceLevel === 'JUNIOR' ? 'Junior' :
                 currentJob.experienceLevel === 'SENIOR' ? 'Senior' : 'Mid-Level'}
              </p>
            </div>

            <div className="bg-gray-50/90 border border-gray-200/80 p-3.5 rounded-2xl space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-600" />
                Competiție
              </span>
              <p className="text-xs sm:text-sm font-extrabold text-gray-900 truncate">
                {currentJob.applicantCountText || 'Estimare Normală'}
              </p>
            </div>
          </div>

          {/* SECȚIUNE PIPELINE DE AUDIT & ISTORIC MODIFICĂRI */}
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-black uppercase tracking-wider text-gray-900">
                  Audit Lifecycle & Istoric Modificări
                </span>
                {currentJob.contentHash && (
                  <span className="text-[10px] font-mono bg-white text-gray-500 border border-gray-200 px-2 py-0.5 rounded-md hidden sm:inline" title={`SHA-256: ${currentJob.contentHash}`}>
                    Hash: {currentJob.contentHash.substring(0, 10)}...
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={fetchChanges}
                className="text-xs font-extrabold text-indigo-700 hover:text-indigo-950 bg-white border border-indigo-200 hover:bg-indigo-50 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <GitCommit className="w-3.5 h-3.5" />
                <span>{showChanges ? 'Ascunde Istoric' : 'Vezi Istoric Modificări'}</span>
              </button>
            </div>

            {showChanges && (
              <div className="pt-2 border-t border-gray-200/80 space-y-2">
                {loadingChanges ? (
                  <div className="py-4 text-center text-xs font-semibold text-gray-500 animate-pulse">
                    Se încarcă istoricul din baza de date...
                  </div>
                ) : jobChanges.length === 0 ? (
                  <div className="py-3 text-center text-xs text-gray-500 font-medium bg-white rounded-xl border border-gray-100">
                    Niciun eveniment de modificare înregistrat încă (Job în starea inițială CREATED).
                  </div>
                ) : (
                  <div className="space-y-2">
                    {jobChanges.map((change) => (
                      <div 
                        key={change.id || Math.random()}
                        className="bg-white border border-gray-200 p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                            change.changeType === 'CREATED' ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' :
                            change.changeType === 'CONTENT_UPDATED' ? 'bg-blue-100 text-blue-950 border border-blue-300' :
                            change.changeType === 'REACTIVATED' ? 'bg-amber-100 text-amber-950 border border-amber-300' :
                            change.changeType === 'EXPIRED' ? 'bg-rose-100 text-rose-950 border border-rose-300' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {change.changeType}
                          </span>
                          <span className="font-semibold text-gray-700">
                            {change.details || 'Modificare detectată în pipeline'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium shrink-0">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{formatDateTime(change.changedAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECȚIUNE NOUĂ: BILANȚ INTELIGENT COMPETENȚE (CE ȘTII VS CE ÎȚI LIPSEȘTE) */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-xl space-y-4 border border-indigo-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    Bilanț Competențe: Ce Știi vs Ce Îți Lipsește
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Comparat în timp real cu profilul tău de CV pentru a-ți evidenția atuurile la interviu
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={runAiMatch}
                  disabled={loadingAiAnalysis}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-extrabold text-xs shadow-md transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border border-indigo-400/40"
                  title="Analizează semantic cerințele jobului direct cu AI Groq și CV-ul tău"
                >
                  {loadingAiAnalysis ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-200" />
                      <span>Verificare AI în curs...</span>
                    </>
                  ) : aiAnalysisData ? (
                    <>
                      <Bot className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Re-analizează cu AI</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-3.5 h-3.5 text-indigo-200" />
                      <span>Verifică & Bifează cu AI</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-2xl backdrop-blur-sm border border-white/10">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <div className="text-right">
                    <div className="text-xs font-black text-white">{displayScore.toFixed(1)}% Match ATS</div>
                    <div className="text-[10px] text-indigo-200 font-semibold">
                      {displayMatchingSkills.length} din {displayMatchingSkills.length + displayMissingSkills.length > 0 ? displayMatchingSkills.length + displayMissingSkills.length : skillsRequired.length || 1} cerințe bifate
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RAPORT / VERDICT AI RECRUITER DACĂ ESTE ACTIVAT */}
            {aiAnalysisData?.verdict && (
              <div className="bg-indigo-900/60 border border-indigo-400/30 rounded-2xl p-3.5 flex items-start gap-3">
                <div className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-indigo-300" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300">
                    Verdict Recruiter AI (Analiză Semantică CV)
                  </span>
                  <p className="text-xs text-indigo-100 font-medium leading-relaxed">
                    {aiAnalysisData.verdict}
                  </p>
                </div>
              </div>
            )}

            {aiAnalysisError && (
              <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-3 text-xs text-rose-300 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{aiAnalysisError}</span>
              </div>
            )}

            {/* GRID CU 2 COLOANE CLARE: CE ȘTII vs CE NU ȘTII */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* COLOANA 1: CE STĂPÂNEȘTI (VERDE) */}
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Ce Stăpânești Deja ({displayMatchingSkills.length})
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Puncte Forte
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                  {displayMatchingSkills.length > 0 ? (
                    displayMatchingSkills.map((skill, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 shadow-2xs"
                      >
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>{skill}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">Nu s-a detectat încă o suprapunere directă de cuvinte cheie din CV.</span>
                  )}
                </div>
                <p className="text-[11px] text-emerald-300/80 leading-relaxed pt-1">
                  ✓ Aceste competențe sunt deja demonstrate în CV. Vor fi punctele tale forte la interviu!
                </p>
              </div>

              {/* COLOANA 2: CE ÎȚI LIPSEȘTE / DE APROFUNDAT (PORTOCALIU) */}
              <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    Ce Nu Ai în CV / De Învățat ({displayMissingSkills.length})
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Gaps de Acoperit
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                  {displayMissingSkills.length > 0 ? (
                    displayMissingSkills.map((skill, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-2xs"
                      >
                        <BookOpen className="w-3 h-3 text-amber-400" />
                        <span>{skill}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-emerald-300 font-bold flex items-center gap-1">
                      <CheckCheck className="w-4 h-4 text-emerald-400" />
                      Felicitări! Profilul tău acoperă toate cerințele tehnice identificate!
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-amber-300/80 leading-relaxed pt-1">
                  💡 Sfat: Dacă ai lucrat chiar și la proiecte personale cu aceste tehnologii, adaugă-le în CV Studio pentru a crește scorul ATS!
                </p>
              </div>
            </div>

            {/* EVALUARE NIVEL EXPERIENȚĂ */}
            <div className="text-xs text-slate-200 bg-white/5 p-3 rounded-2xl border border-white/10 leading-relaxed">
              <span className="font-black text-white">Evaluare Nivel: </span>
              {currentJob.experienceLevel === 'JUNIOR' || currentJob.experienceLevel === 'INTERNSHIP' ? (
                <span className="text-emerald-300 font-bold">
                  Poziția este ideală pentru debut de carieră (0-1 ani experiență). Șanse maxime de selecție la interviu! Fără penalizare de vechime.
                </span>
              ) : currentJob.experienceLevel === 'MID' ? (
                <span className="text-amber-300 font-bold">
                  Penalizare de nivel: Poziția solicită 2-4 ani de experiență comercială. Profilul de Junior este plafonat automat de algoritmul ATS din cauza deficitului de vechime cerut.
                </span>
              ) : (
                <span className="text-rose-300 font-bold">
                  Incompatibilitate de senioritate: Poziție de nivel Senior / Lead (5+ ani). Sistemele automate ATS descalifică de regulă profilurile fără vechime comercială solidă.
                </span>
              )}
            </div>
          </div>

          {/* SECȚIUNE FIȘA POSTULUI & CERINȚE DETALIATE */}
          <div className="space-y-5 pt-2">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider">
                    Fișa Postului & Cerințe Detaliate
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Cerințe tehnice și responsabilități structurate inteligent
                  </p>
                </div>
              </div>
            </div>

            {loadingDetails && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs font-bold text-indigo-700 flex items-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Se extrage descrierea detaliată completă de pe {currentJob.sourcePlatform}...
              </div>
            )}

            {/* CERINȚE OBLIGATORII (MUST-HAVE) */}
            {((aiAnalysisData?.mandatory && aiAnalysisData.mandatory.length > 0) || parsedDescription.mandatoryRequirements.length > 0) && (
              <div className="bg-white border-2 border-indigo-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-indigo-50 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-indigo-100/80 text-indigo-700">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-950 uppercase tracking-wider flex items-center gap-2">
                        <span>Cerințe Obligatorii (Must-Have)</span>
                        {aiAnalysisData && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Bot className="w-3 h-3 text-indigo-600" />
                            AI Verified
                          </span>
                        )}
                      </h4>
                      <span className="text-[11px] text-gray-500 font-semibold">
                        Competențe și calificări esențiale cerute pentru acest rol
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {aiAnalysisData?.mandatory?.length || parsedDescription.mandatoryRequirements.length} Cerințe
                  </span>
                </div>

                <div className="space-y-2.5">
                  {aiAnalysisData?.mandatory && aiAnalysisData.mandatory.length > 0 ? (
                    aiAnalysisData.mandatory.map((req, idx) => (
                      <div 
                        key={idx}
                        className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition ${
                          req.isMatched 
                            ? 'bg-emerald-50/60 border-emerald-200' 
                            : 'bg-amber-50/50 border-amber-200'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 flex-1">
                          {req.isMatched ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-1">
                            <span className="text-xs sm:text-sm font-medium text-gray-800 leading-snug">
                              {req.text}
                            </span>
                            {req.explanation && (
                              <p className="text-[11px] text-gray-500 italic">
                                {req.explanation}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-start sm:self-center">
                          {req.isMatched ? (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>{req.matchedSkill ? `Bifat: ${req.matchedSkill}` : 'Bifat în CV'}</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                              <BookOpen className="w-3 h-3 text-amber-600" />
                              <span>Lipsește din CV</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    parsedDescription.mandatoryRequirements.map((req, idx) => {
                      const hasMatch = req.matched && req.matched.length > 0;
                      const hasMissing = req.missing && req.missing.length > 0;
                      return (
                        <div 
                          key={idx}
                          className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition ${
                            hasMatch 
                              ? 'bg-emerald-50/50 border-emerald-200/80' 
                              : hasMissing 
                              ? 'bg-amber-50/40 border-amber-200/80' 
                              : 'bg-gray-50/70 border-gray-200/80'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 flex-1">
                            {hasMatch ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            ) : hasMissing ? (
                              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0 mt-1.5 ml-1"></div>
                            )}
                            <span className="text-xs sm:text-sm font-medium text-gray-800 leading-snug">
                              {req.text}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-start sm:self-center">
                            {hasMatch && (
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Bifat în CV: {req.matched.join(', ')}</span>
                              </span>
                            )}
                            {hasMissing && (
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                <BookOpen className="w-3 h-3 text-amber-600" />
                                <span>De aprofundat: {req.missing.join(', ')}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* CUNOȘTINȚE BONUS / AVANTAJE (NICE-TO-HAVE) */}
            {((aiAnalysisData?.bonus && aiAnalysisData.bonus.length > 0) || parsedDescription.bonusRequirements.length > 0) && (
              <div className="bg-gradient-to-br from-amber-50/50 to-purple-50/30 border-2 border-amber-200/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-950 uppercase tracking-wider flex items-center gap-1.5">
                        <span>Cunoștințe Bonus & Avantaje (Nice-to-Have)</span>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      </h4>
                      <span className="text-[11px] text-gray-500 font-semibold">
                        Cunoștințe care nu sunt eliminatorii, dar îți oferă un avantaj major la selecție
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                    {aiAnalysisData?.bonus?.length || parsedDescription.bonusRequirements.length} Puncte Bonus
                  </span>
                </div>

                <div className="space-y-2">
                  {aiAnalysisData?.bonus && aiAnalysisData.bonus.length > 0 ? (
                    aiAnalysisData.bonus.map((bonus, idx) => (
                      <div 
                        key={idx}
                        className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                          bonus.isMatched 
                            ? 'bg-emerald-50/70 border-emerald-300' 
                            : 'bg-white/80 border-amber-100'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 flex-1">
                          <Sparkles className={`w-4 h-4 shrink-0 mt-0.5 ${bonus.isMatched ? 'text-emerald-600' : 'text-amber-500'}`} />
                          <span className="text-xs sm:text-sm font-medium text-gray-800 leading-snug">
                            {bonus.text}
                          </span>
                        </div>

                        {bonus.isMatched && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1 shrink-0 self-start sm:self-center">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>{bonus.matchedSkill ? `Bonus Bifat: ${bonus.matchedSkill}` : 'Bonus Bifat în Profil!'}</span>
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    parsedDescription.bonusRequirements.map((bonus, idx) => {
                      const hasMatch = bonus.matched && bonus.matched.length > 0;
                      return (
                        <div 
                          key={idx}
                          className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                            hasMatch 
                              ? 'bg-emerald-50/70 border-emerald-300' 
                              : 'bg-white/80 border-amber-100'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 flex-1">
                            <Sparkles className={`w-4 h-4 shrink-0 mt-0.5 ${hasMatch ? 'text-emerald-600' : 'text-amber-500'}`} />
                            <span className="text-xs sm:text-sm font-medium text-gray-800 leading-snug">
                              {bonus.text}
                            </span>
                          </div>

                          {hasMatch && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1 shrink-0 self-start sm:self-center">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Bonus Bifat în Profil!</span>
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* RESPONSABILITĂȚI PRINCIPALE */}
            {parsedDescription.responsibilities && parsedDescription.responsibilities.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-950 uppercase tracking-wider">
                      Ce Vei Face în Acest Rol (Responsabilități)
                    </h4>
                    <span className="text-[11px] text-gray-500 font-semibold">
                      Activitățile tale zilnice și proiectele din cadrul echipei
                    </span>
                  </div>
                </div>

                <ul className="space-y-2 pl-1">
                  {parsedDescription.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700 leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-2"></div>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* BENEFICII & OFERTĂ */}
            {parsedDescription.benefits && parsedDescription.benefits.length > 0 && (
              <div className="bg-emerald-50/40 border border-emerald-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-emerald-100 pb-2.5">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-emerald-950 uppercase tracking-wider">
                      Ce Îți Oferă Compania (Beneficii & Pachet)
                    </h4>
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      Perks, asigurare, dezvoltare profesională și condiții de lucru
                    </span>
                  </div>
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {parsedDescription.benefits.map((ben, idx) => (
                    <li key={idx} className="bg-white/80 p-2.5 rounded-xl border border-emerald-100 text-xs font-semibold text-emerald-950 flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{ben}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* FALLBACK DACĂ NU S-A PUTUT STRUCTURA NICIO SECȚIUNE */}
            {(!parsedDescription.mandatoryRequirements.length &&
              (!aiAnalysisData?.mandatory || !aiAnalysisData.mandatory.length) &&
              !parsedDescription.bonusRequirements.length &&
              !parsedDescription.responsibilities.length &&
              !parsedDescription.benefits.length) && (
              <div className="bg-gray-50/80 border border-gray-200 rounded-3xl p-6 leading-relaxed">
                {formatDescription(currentJob.rawDescription)}
              </div>
            )}

          </div>

        </div>

        {/* FOOTER FIX CU ACȚIUNI RAPIDE */}
        <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-20">
          <div className="text-xs text-gray-500 font-semibold text-center sm:text-left">
            Platformă Sursă: <strong className="text-gray-900">{currentJob.sourcePlatform}</strong> • Verificat & Validat
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => onSaveToKanban(currentJob)}
              disabled={isSaved || isSaving}
              className={`flex-1 sm:flex-none px-5 py-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer border ${
                isSaved 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                  : 'bg-white hover:bg-gray-100 text-gray-900 border-gray-300 shadow-2xs'
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                  <span>Salvat în Kanban</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-gray-500" />
                  <span>{isSaving ? 'Se salvează...' : 'Salvează în Kanban'}</span>
                </>
              )}
            </button>

            <a
              href={currentJob.directApplyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
            >
              <span>Aplică pe Site-ul Oficial</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
