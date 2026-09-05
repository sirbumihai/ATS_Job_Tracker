import React, { useState, useEffect } from 'react';
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
  Share2
} from 'lucide-react';

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

  useEffect(() => {
    if (!job) return;

    // Închidere la tasta Escape
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    // Dacă jobul e de pe LinkedIn și descrierea e scurtă, preluăm detaliile extinse
    if (job.sourcePlatform === 'LINKEDIN' && (!job.rawDescription || job.rawDescription.length < 350)) {
      setLoadingDetails(true);
      fetch(`/api/v1/jobs/${job.id}/details`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.rawDescription) {
            setDetailedJob(data);
          }
        })
        .catch(err => console.warn('Nu s-au putut încărca detaliile extinse:', err))
        .finally(() => setLoadingDetails(false));
    } else {
      setDetailedJob(job);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [job]);

  if (!job) return null;

  const currentJob = detailedJob || job;

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
                  <span className="flex items-center gap-1 text-gray-500 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    {currentJob.postedDateAgo}
                  </span>
                </div>
              </div>
            </div>

            {/* SCOR ATS MATCH MARE */}
            <div className={`shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl border self-start ${
              currentJob.atsMatchScore >= 80 
                ? 'bg-emerald-50 text-emerald-950 border-emerald-300 shadow-sm shadow-emerald-50' 
                : currentJob.atsMatchScore >= 50 
                ? 'bg-amber-50 text-amber-950 border-amber-300 shadow-sm shadow-amber-50' 
                : 'bg-rose-50 text-rose-950 border-rose-300'
            }`}>
              <Sparkles className={`w-5 h-5 ${currentJob.atsMatchScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`} />
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

          {/* SECȚIUNE ANALIZĂ ATS COMPARATIVĂ (SKILLS BIFATE VS LIPSĂ) */}
          <div className="bg-indigo-50/40 border border-indigo-100 p-5 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Analiză ATS de Compatibilitate cu Profilul Tău
              </h3>
              <span className="text-[11px] font-bold text-indigo-700">
                65% Skills + 35% Nivel Experiență
              </span>
            </div>

            {/* ABILITĂȚI IDENTIFICATE */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-600">Competențe Tehnice Cerute de Angajator:</span>
              <div className="flex flex-wrap gap-1.5">
                {currentJob.skillsRequired && currentJob.skillsRequired.length > 0 ? (
                  currentJob.skillsRequired.map((skill, idx) => {
                    const isMatched = currentJob.matchingSkills && currentJob.matchingSkills.includes(skill);
                    return (
                      <span 
                        key={idx}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${
                          isMatched 
                            ? 'bg-emerald-100 text-emerald-950 border-emerald-300 shadow-2xs' 
                            : 'bg-white text-gray-700 border-gray-200'
                        }`}
                      >
                        {isMatched ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>}
                        <span>{skill}</span>
                      </span>
                    );
                  })
                ) : (
                  <span className="text-xs text-gray-500 italic">Nu sunt specificate competențe stringente.</span>
                )}
              </div>
            </div>

            {/* JUSTIFICARE EXPERIENȚĂ */}
            <div className="text-xs text-gray-600 bg-white/80 p-3 rounded-2xl border border-indigo-100/60 leading-relaxed">
              <span className="font-black text-gray-900">Evaluare Nivel: </span>
              {currentJob.experienceLevel === 'JUNIOR' || currentJob.experienceLevel === 'INTERNSHIP' ? (
                <span className="text-emerald-800 font-bold">
                  Poziția este ideală pentru debut de carieră (0-1 ani experiență). Șanse maxime de selecție la interviu!
                </span>
              ) : currentJob.experienceLevel === 'MID' ? (
                <span className="text-amber-800 font-bold">
                  Poziția solicită 2-4 ani de experiență. Scorul ATS a fost ajustat cu penalizare moderată.
                </span>
              ) : (
                <span className="text-rose-800 font-bold">
                  Poziție de Senioritate Ridicată (5+ ani / Lead). Scorul ATS a fost penalizat substanțial din cauza cerințelor de vechime.
                </span>
              )}
            </div>
          </div>

          {/* DESCRIEREA ORIGINALĂ COMPLETĂ */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-700" />
                Fișa Oficială a Postului (Job Description Original)
              </h3>
              {loadingDetails && (
                <span className="text-xs font-bold text-indigo-600 animate-pulse">
                  Se extrage textul complet...
                </span>
              )}
            </div>

            <div className="bg-gray-50/70 border border-gray-200/90 rounded-3xl p-6 leading-relaxed">
              {formatDescription(currentJob.rawDescription)}
            </div>
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
