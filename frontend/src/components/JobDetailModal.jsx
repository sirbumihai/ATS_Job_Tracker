import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  User,
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
  Bot,
  FileSignature,
  Send,
  Mail
} from 'lucide-react';

// Filtru riguros pentru a elimina artefacte web, tag-uri SVG Sketch/Figma sau titluri izolate
export const isValidRequirementItem = (item) => {
  if (!item || typeof item !== 'string') return false;
  const trimmed = item.trim();
  if (trimmed.length < 8) return false;

  // Nu permitem linii care se termina cu ':' (sunt de fapt sub-antete/subtitluri sau etichete de grup)
  if (trimmed.endsWith(':')) return false;

  // Nu permitem artefacte de export SVG / grafice (Sketch, Figma, Illustrator)
  if (/created with sketch/i.test(trimmed) || /created with figma/i.test(trimmed) || /bohemiancoding/i.test(trimmed)) return false;
  if (/^\d+_[A-Za-z0-9_ -]+$/i.test(trimmed)) return false;
  if (/\b\d+_[A-Za-z0-9_\- ]+created with sketch\b/i.test(trimmed)) return false;

  // Nu permitem cuvinte izolate de titlu / antet care au scapat ca cerinte
  if (/^(knowledge|requirements|qualifications|experience|skills|overview|summary|responsibilities|benefits|cerinte|calificari|responsabilitati|beneficii|profil|profilul candidatului|despre rol|activitati|ce cautam|who you are|what you bring)$/i.test(trimmed)) return false;

  // Nu permitem butoane/actiuni UI sau zgomot de pagina web
  if (/^(apply now|easy apply|save job|share|share this job|report job|report this job|posted on|full-time|part-time|remote|hybrid|on-site|vezi mai mult|citeste mai mult)$/i.test(trimmed)) return false;

  return true;
};

// Parser inteligent de Job Description: extragere structurata de cerinte obligatorii, bonus, responsabilitati si beneficii
export const parseJobDescription = (rawText, skillsRequired = [], matchingSkills = [], missingSkills = []) => {
  if (!rawText || rawText.trim().length === 0) {
    return {
      mandatoryRequirements: (skillsRequired || []).map(s => ({
        text: `Cunostinte sau experienta demonstrabila cu ${s}`,
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

  // 1. Curatare HTML, taguri de imagine/SVG & entitati
  let text = rawText
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, ' ')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<h[1-6][^>]*>/gi, '\n\n### ')
    .replace(/<\/h[1-6]>/gi, ':\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\r\n/g, '\n')
    .trim();

  // 1.1 Curatare artefacte Sketch, Figma si SVG icons
  text = text
    .replace(/.*Created with Sketch\.?.*/gi, '')
    .replace(/.*Created with Figma\.?.*/gi, '')
    .replace(/\b\d+_[A-Za-z0-9_\- ]+Created with Sketch\b/gi, '')
    .replace(/^\s*\d+_[A-Za-z0-9_ -]{2,}\s*$/gm, '');

  // 1.2 Inserare separatoare inainte de antete comune cand textul este compactat (ex: LinkedIn text fara newline)
  text = text.replace(/([a-z0-9\.\)\!\?])\s*(Main responsibilities|Key responsibilities|Responsibilities|What you will do|What you'll do|Tasks|Activitati|Responsabilitati|Ce vei face|Required skills|Requirements|Must have|Qualifications|Ce cautam|Cerinte obligatorii|Cerinte|Desirable skills|Nice to have|Good to have|Bonus|Constituie avantaj|Reprezinta un plus|Avantaje|Compensation & benefits|Benefits|What we offer|Beneficii|Ce oferim|Who you are|Tech stack|Work mode|About us|Knowledge)\b/gi, '$1\n\n### $2:\n');

  // 1.3 Separare elemente de lista concatenate (ex: "testingWork in teams", "ManagersBug fixing")
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
    if (!l) return false;
    const matchesKeyword = /(cerin[tt]e|ce c[aa]ut[aa]m|ce ne dorim|profilul c[aa]utat|profil candidat|calific[aa]ri|competen[tt]e|must have|must-have|requirements|required skills|essential experience|essential skills|what you need|qualifications|who you are|candidate profile|skills & experience|what you bring|ce trebuie s[aa] ai|hard skills|condi[tt]ii|cuno[ss]tin[tt]e|knowledge|technical knowledge|domain knowledge|job knowledge|skills|bonus|constituie avantaj|reprezint[aa] un plus|nice to have|nice-to-have|good to have|desirable skills|desirable experience|preferred qualifications|would be a plus|avantaje|plusuri|op[tt]ional|responsabilit[aa][tt]i|ce vei face|rolul t[aa]u|descrierea rolului|activit[aa][tt]i|ce presupune rolul|main responsibilities|key responsibilities|responsibilities|what you will do|what you'll do|your role|tasks|what you'll be doing|what success looks like|compensation & benefits|beneficii|ce oferim|ce [ii][tt]i oferim|pachet de beneficii|benefits|what we offer|perks|compensation|health and wellness|work-life balance|diversity and inclusion|tech stack|work mode|about us|despre noi)/i.test(l);

    if (line.startsWith('### ') || line.endsWith(':')) {
      return matchesKeyword || l.length < 40;
    }
    return (line.length < 90) && matchesKeyword;
  };

  const getSectionType = (line) => {
    const l = line.toLowerCase().replace(/^###\s*/, '').replace(/[:\s]+$/, '');
    if (/about us|work mode|despre noi|mod de lucru/i.test(l)) {
      return null;
    }
    if (/compensation & benefits|beneficii|ce oferim|ce [ii][tt]i oferim|benefits|what we offer|perks|compensation|health and wellness|work-life balance|diversity and inclusion/i.test(l)) {
      return 'benefits';
    }
    if (/desirable skills|desirable experience|bonus|constituie avantaj|reprezint[aa] un plus|nice to have|nice-to-have|good to have|preferred qualifications|would be a plus|plusuri|op[tt]ional|ce constituie avantaj|tech stack/i.test(l)) {
      return 'bonus';
    }
    if (/required skills|essential experience|essential skills|cerin[tt]e|ce c[aa]ut[aa]m|ce ne dorim|profilul c[aa]utat|profil candidat|calific[aa]ri|must have|must-have|requirements|what you need|qualifications|who you are|candidate profile|skills & experience|hard skills|cuno[ss]tin[tt]e|knowledge|technical knowledge|domain knowledge/i.test(l)) {
      return 'mandatory';
    }
    if (/main responsibilities|key responsibilities|responsabilit[aa][tt]i|ce vei face|rolul t[aa]u|descrierea rolului|activit[aa][tt]i|ce presupune rolul|responsibilities|what you will do|what you'll do|your role|tasks|what success looks like/i.test(l)) {
      return 'responsibilities';
    }
    return null;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    if (isHeading(rawLine)) {
      const detected = getSectionType(rawLine);
      currentSection = detected;
      if (detected) {
        hasFoundExplicitSection = true;
      }
      continue;
    }

    const cleanItem = rawLine.replace(/^###\s*/, '').replace(/^[•\-*–—]\s*/, '').trim();
    if (!cleanItem || !isValidRequirementItem(cleanItem)) continue;

    if (currentSection) {
      // Redirectioneaza beneficii evidente catre benefits
      if (/meal voucher|tichete de mas[aa]|health care|medical insurance|asigurare medical[aa]|annual leave|zile de concediu|paid day off|flexible working|program flexibil|sabbatical|bookster|gym membership|pensie/i.test(cleanItem)) {
        sections.benefits.push(cleanItem);
        continue;
      }
      if ((currentSection === 'mandatory') && /constituie (un )?avantaj|reprezint[aa] (un )?plus|nice to have|would be a plus|bonus/i.test(cleanItem)) {
        sections.bonus.push(cleanItem);
        continue;
      }
      sections[currentSection].push(cleanItem);
    } else {
      if (/constituie (un )?avantaj|reprezint[aa] (un )?plus|nice to have|bonus/i.test(cleanItem)) {
        sections.bonus.push(cleanItem);
      } else if (cleanItem.length > 15 && cleanItem.length < 160 && /candidat|experien|skills|studii|cuno[ss]tin|programare/i.test(cleanItem)) {
        sections.mandatory.push(cleanItem);
      }
    }
  }

  // Fallback daca nu s-au gasit cerinte explicite dar avem skillsRequired
  if (sections.mandatory.length === 0 && skillsRequired && skillsRequired.length > 0) {
    sections.mandatory = skillsRequired.map(s => `Cunostinte practice de ${s}`);
  }

  // Mapare si asociere automata a competentelor pe fiecare cerinta
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
  activeUserId,
  onUpdateJobScore,
  onOpenCoverLetter
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
  const [copiedEmailBody, setCopiedEmailBody] = useState(false);

  // State pentru selectare CV personal pentru comparatie
  const [userCvs, setUserCvs] = useState([]);
  const [selectedCvId, setSelectedCvId] = useState(null);
  const [loadingCvs, setLoadingCvs] = useState(false);

  useEffect(() => {
    if (!activeUserId) return;
    setLoadingCvs(true);
    fetch('/api/v1/cv/list', {
      headers: { 'X-User-Id': activeUserId }
    })
      .then(res => res.ok ? res.json() : [])
      .then(list => {
        if (Array.isArray(list) && list.length > 0) {
          setUserCvs(list);
          const primary = list.find(c => c.isPrimary) || list[0];
          if (primary) {
            setSelectedCvId(primary.id);
          }
        }
      })
      .catch(e => console.warn('Nu s-au putut incarca CV-urile:', e))
      .finally(() => setLoadingCvs(false));
  }, [activeUserId]);

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

  const runAiMatch = async (jobToAnalyze, cvIdToUse, forceRefresh = false) => {
    const targetJob = jobToAnalyze || detailedJob || job;
    if (!targetJob || !targetJob.rawDescription || targetJob.rawDescription.trim().length < 50) return;

    // IMPORTANT: Nu rulam NICIODATA analiza AI pe emailurile Gmail
    const isTargetGmail = targetJob.sourcePlatform === 'GMAIL' 
      || (typeof targetJob.rawDescription === 'string' && (
        targetJob.rawDescription.includes('EMAIL DE RECRUTARE GMAIL') || 
        targetJob.rawDescription.includes('GMAIL (Sincronizat Automat)') ||
        targetJob.rawDescription.includes('CONTINUT COMPLET EMAIL') ||
        targetJob.rawDescription.includes('CON\u021bINUT COMPLET EMAIL')
      ))
      || (typeof targetJob.notes === 'string' && targetJob.notes.includes('[Gmail Sync'));
    if (isTargetGmail) return;

    const cvId = cvIdToUse !== undefined ? cvIdToUse : selectedCvId;
    const cacheKey = `ats_ai_job_${targetJob.id || targetJob.directApplyUrl}_${cvId || 'default'}`;

    if (!forceRefresh) {
      try {
        const cached = sessionStorage.getItem(cacheKey) || sessionStorage.getItem(`ats_ai_job_${targetJob.id || targetJob.directApplyUrl}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          const isDescLong = (targetJob.rawDescription?.length || 0) > 800;
          const isCachedStale = isDescLong && (parsed.atsScore === 0 || (parsed.mandatory?.length || 0) <= 1);
          if (!isCachedStale && parsed && (parsed.aiVerified || (parsed.mandatory && parsed.mandatory.length > 0))) {
            const baseLvl = (targetJob.experienceLevel || '').toUpperCase();
            if ((baseLvl === 'MID' || baseLvl === 'SENIOR') && parsed.experienceLevel === 'JUNIOR') {
              parsed.experienceLevel = baseLvl;
            }
            setAiAnalysisData(parsed);
            if (onUpdateJobScore && typeof onUpdateJobScore === 'function') {
              onUpdateJobScore(targetJob.id, Number(parsed.atsScore) || targetJob.atsMatchScore, parsed);
            }
            return;
          }
        }
      } catch (e) {}
    } else {
      try {
        sessionStorage.removeItem(cacheKey);
        sessionStorage.removeItem(`ats_ai_job_${targetJob.id || targetJob.directApplyUrl}`);
        sessionStorage.removeItem(`ats_ai_job_${targetJob.id || targetJob.directApplyUrl}_default`);
      } catch (e) {}
    }

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
          jobId: targetJob.id,
          jobTitle: targetJob.jobTitle,
          rawDescription: targetJob.rawDescription,
          userId: activeUserId,
          cvProfileId: cvId || null
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && (data.aiVerified || (data.matchingSkills && data.matchingSkills.length > 0) || (data.mandatory && data.mandatory.length > 0))) {
          const baseLvl = (targetJob.experienceLevel || '').toUpperCase();
          if ((baseLvl === 'MID' || baseLvl === 'SENIOR') && data.experienceLevel === 'JUNIOR') {
            data.experienceLevel = baseLvl;
          }
          setAiAnalysisData(data);
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
          } catch (e) {}
          if (onUpdateJobScore && typeof onUpdateJobScore === 'function') {
            onUpdateJobScore(targetJob.id, Number(data.atsScore) || targetJob.atsMatchScore, data);
          }
        } else {
          setAiAnalysisError("Analiza AI nu a putut fi finalizata.");
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

  const handleSelectCv = (cvId) => {
    setSelectedCvId(cvId);
    runAiMatch(currentJob, cvId, true);
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

    // Inchidere la tasta Escape
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    // Daca este job extras din Gmail, nu apelam niciun model AI si afisam direct emailul
    const isTargetGmail = job.sourcePlatform === 'GMAIL' 
      || (typeof job.rawDescription === 'string' && (
        job.rawDescription.includes('EMAIL DE RECRUTARE GMAIL') || 
        job.rawDescription.includes('GMAIL (Sincronizat Automat)') ||
        job.rawDescription.includes('CONTINUT COMPLET EMAIL') ||
        job.rawDescription.includes('CON\u021bINUT COMPLET EMAIL')
      ))
      || (typeof job.notes === 'string' && job.notes.includes('[Gmail Sync'));

    if (isTargetGmail) {
      setDetailedJob(job);
      setAiAnalysisData(null);
      setAiAnalysisError(null);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }

    // Preluam detaliile extinse daca descrierea este scurta/placeholder sau lipsesc competentele de matching
    const isDescriptionShort = !job.rawDescription || job.rawDescription.length < 350 || job.rawDescription.includes('Descrierea completa a postului salvat');
    const isMissingSkillBreakdown = !job.matchingSkills || job.matchingSkills.length === 0;
    const needsDetailsFetch = !!job.id && (isDescriptionShort || isMissingSkillBreakdown || ['LINKEDIN', 'HIPO', 'BESTJOBS'].includes(job.sourcePlatform));

    // Verificare cache AI la deschiderea modalului
    const cacheKey = `ats_ai_job_${job.id || job.directApplyUrl}_${selectedCvId || 'default'}`;
    let hasLoadedFromCache = false;
    try {
      const cached = sessionStorage.getItem(cacheKey) || sessionStorage.getItem(`ats_ai_job_${job.id || job.directApplyUrl}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        const isDescLong = (job.rawDescription?.length || 0) > 800;
        const isCachedStale = isDescLong && (parsed.atsScore === 0 || (parsed.mandatory?.length || 0) <= 1);
        if (!isCachedStale && parsed && (parsed.aiVerified || (parsed.mandatory && parsed.mandatory.length > 0))) {
          const baseLvl = (job.experienceLevel || '').toUpperCase();
          if ((baseLvl === 'MID' || baseLvl === 'SENIOR') && parsed.experienceLevel === 'JUNIOR') {
            parsed.experienceLevel = baseLvl;
          }
          setAiAnalysisData(parsed);
          hasLoadedFromCache = true;
          if (onUpdateJobScore && typeof onUpdateJobScore === 'function') {
            onUpdateJobScore(job.id, Number(parsed.atsScore) || job.atsMatchScore, parsed);
          }
        }
      }
    } catch (e) {}

    if (!hasLoadedFromCache) {
      setAiAnalysisData(null);
      setAiAnalysisError(null);
    }

    if (needsDetailsFetch) {
      setLoadingDetails(true);
      const url = activeUserId ? `/api/v1/jobs/${job.id}/details?userId=${activeUserId}` : `/api/v1/jobs/${job.id}/details`;
      fetch(url, {
        headers: activeUserId ? { 'X-User-Id': activeUserId } : {}
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            const updated = {
              ...data,
              atsMatchScore: (typeof data.atsMatchScore === 'number' && data.atsMatchScore > 0) ? data.atsMatchScore : (job.atsMatchScore || 0),
              matchingSkills: (data.matchingSkills && data.matchingSkills.length > 0) ? data.matchingSkills : (job.matchingSkills || []),
              missingSkills: (data.missingSkills && data.missingSkills.length > 0) ? data.missingSkills : (job.missingSkills || []),
              experienceLevel: job.experienceLevel || data.experienceLevel,
              workModel: job.workModel || data.workModel,
              salaryRange: job.salaryRange || data.salaryRange,
              rawDescription: (data.rawDescription && data.rawDescription.length > (job.rawDescription?.length || 0)) ? data.rawDescription : (job.rawDescription || data.rawDescription)
            };
            setDetailedJob(updated);
            const isDescUpdated = data.rawDescription && data.rawDescription.length > (job.rawDescription?.length || 0) + 200;
            if (!hasLoadedFromCache || isDescUpdated) {
              runAiMatch(updated, selectedCvId, isDescUpdated);
            }
          } else if (!hasLoadedFromCache) {
            runAiMatch(job, selectedCvId, false);
          }
        })
        .catch(err => {
          console.warn('Nu s-au putut incarca detaliile extinse:', err);
          if (!hasLoadedFromCache) runAiMatch(job, selectedCvId, false);
        })
        .finally(() => setLoadingDetails(false));
    } else {
      setDetailedJob(job);
      if (!hasLoadedFromCache) {
        runAiMatch(job, selectedCvId, false);
      }
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [job, activeUserId]);

  // Blocare scroll pe fundal cat timp modalul este deschis
  useEffect(() => {
    if (!job || typeof document === 'undefined') return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = (prevOverflow === 'hidden' ? '' : prevOverflow);
    };
  }, [job]);

  if (!job || typeof document === 'undefined') return null;

  const currentJob = detailedJob || job;

  const isGmailJob = useMemo(() => {
    if (!currentJob) return false;
    return currentJob.sourcePlatform === 'GMAIL' 
      || (typeof currentJob.rawDescription === 'string' && (
        currentJob.rawDescription.includes('EMAIL DE RECRUTARE GMAIL') || 
        currentJob.rawDescription.includes('GMAIL (Sincronizat Automat)') ||
        currentJob.rawDescription.includes('CONTINUT COMPLET EMAIL') ||
        currentJob.rawDescription.includes('CON\u021bINUT COMPLET EMAIL')
      ))
      || (typeof currentJob.notes === 'string' && currentJob.notes.includes('[Gmail Sync'));
  }, [currentJob]);

  const emailData = useMemo(() => {
    if (!isGmailJob || !currentJob) return null;
    const raw = currentJob.rawDescription || '';
    const notes = currentJob.notes || '';

    let sender = '';
    let subject = '';
    let date = currentJob.appliedDate || '';
    let status = currentJob.status || 'APPLIED';
    let body = '';

    const senderMatch = raw.match(/👤\s*Expeditor:\s*([^\n\r]+)/i);
    if (senderMatch) sender = senderMatch[1].trim();

    const subjectMatch = raw.match(/📌\s*Subiect:\s*([^\n\r]+)/i);
    if (subjectMatch) subject = subjectMatch[1].trim();

    const dateMatch = raw.match(/📅\s*Data Primirii:\s*([^\n\r]+)/i);
    if (dateMatch) date = dateMatch[1].trim();

    const statusMatch = raw.match(/🏷️\s*Status Detectat:\s*([^\n\r]+)/i);
    if (statusMatch) status = statusMatch[1].trim();

    if (/CON[T\u021B\u0163]INUT COMPLET EMAIL:/i.test(raw)) {
      const parts = raw.split(/CON[T\u021B\u0163]INUT COMPLET EMAIL:[\s\S]*?-{10,}/i);
      if (parts.length > 1) {
        body = parts[1].trim();
      }
    }

    if (!body) {
      body = raw
        .replace(/📩\s*EMAIL DE RECRUTARE GMAIL[\s\S]*?={10,}/gi, '')
        .replace(/============================================================/g, '')
        .trim();
    }

    if (!sender && notes) {
      const noteSenderMatch = notes.match(/\(([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\)/);
      if (noteSenderMatch) sender = noteSenderMatch[1];
    }

    if (!subject) {
      subject = currentJob.jobTitle || 'Email Recrutare';
    }

    return { sender, subject, date, status, body };
  }, [isGmailJob, currentJob]);

  const effectiveExperienceLevel = useMemo(() => {
    const jobLvl = (currentJob.experienceLevel || '').toUpperCase();
    const aiLvl = (aiAnalysisData?.experienceLevel || '').toUpperCase();

    // Daca jobul a fost determinat algoritmic ca SENIOR sau MID, nu permitem AI-ului sa il degradeze la JUNIOR sau INTERNSHIP
    if (jobLvl === 'SENIOR') return 'SENIOR';
    if (jobLvl === 'MID') {
      return aiLvl === 'SENIOR' ? 'SENIOR' : 'MID';
    }
    if (jobLvl === 'INTERNSHIP') return 'INTERNSHIP';
    if (jobLvl === 'JUNIOR') {
      if (aiLvl === 'SENIOR' || aiLvl === 'MID') return aiLvl;
      return 'JUNIOR';
    }
    return aiLvl || jobLvl || 'MID';
  }, [currentJob.experienceLevel, aiAnalysisData?.experienceLevel]);

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

  // CERINTE OBLIGATORII (MUST-HAVE): Cand AI a evaluat jobul, rezultatele AI sunt sursa autoritara si completa
  const effectiveMandatoryRequirements = useMemo(() => {
    if (aiAnalysisData?.mandatory && aiAnalysisData.mandatory.length > 0) {
      return aiAnalysisData.mandatory
        .filter(req => isValidRequirementItem(req?.text))
        .map(req => ({
          text: req.text,
          isMatched: Boolean(req.isMatched),
          matchedSkill: req.matchedSkill || '',
          explanation: req.explanation || ''
        }));
    }

    // Fallback cand analiza AI nu este inca finalizata sau e indisponibila
    return (parsedDescription.mandatoryRequirements || [])
      .filter(req => isValidRequirementItem(req?.text))
      .map(req => ({
        text: req.text,
        isMatched: req.matched && req.matched.length > 0,
        matchedSkill: req.matched ? req.matched.join(', ') : '',
        explanation: req.matched && req.matched.length > 0 ? `Bifat in CV conform profilului: ${req.matched.join(', ')}` : 'Competenta ceruta in anunt'
      }));
  }, [aiAnalysisData?.mandatory, parsedDescription.mandatoryRequirements]);

  // PUNCTE BONUS & AVANTAJE INTEGRATE (NICE-TO-HAVE)
  const effectiveBonusRequirements = useMemo(() => {
    if (aiAnalysisData?.bonus && aiAnalysisData.bonus.length > 0) {
      return aiAnalysisData.bonus
        .filter(b => isValidRequirementItem(b?.text))
        .map(b => ({
          text: b.text,
          isMatched: Boolean(b.isMatched),
          matchedSkill: b.matchedSkill || ''
        }));
    }

    // Fallback cand analiza AI nu este inca finalizata sau e indisponibila
    return (parsedDescription.bonusRequirements || [])
      .filter(b => isValidRequirementItem(b?.text))
      .map(b => ({
        text: b.text,
        isMatched: b.matched && b.matched.length > 0,
        matchedSkill: b.matched ? b.matched.join(', ') : ''
      }));
  }, [aiAnalysisData?.bonus, parsedDescription.bonusRequirements]);

  const totalMandatoryCount = effectiveMandatoryRequirements.length;
  const matchedMandatoryCount = effectiveMandatoryRequirements.filter(r => r.isMatched).length;

  const displayResponsibilities = (aiAnalysisData?.responsibilities && aiAnalysisData.responsibilities.length > 0)
    ? aiAnalysisData.responsibilities
    : (parsedDescription.responsibilities || []);

  const displayBenefits = (aiAnalysisData?.benefits && aiAnalysisData.benefits.length > 0)
    ? aiAnalysisData.benefits
    : (parsedDescription.benefits || []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentJob.directApplyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Formatare estetica a textului descrierii
  const formatDescription = (rawText) => {
    if (!rawText) return <p className="text-gray-500 italic">Descrierea completa nu este disponibila.</p>;

    let sanitized = rawText
      .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/.*Created with Sketch\.?.*/gi, '')
      .replace(/.*Created with Figma\.?.*/gi, '')
      .replace(/\b\d+_[A-Za-z0-9_\- ]+Created with Sketch\b/gi, '');

    // Impartire pe paragrafe
    const paragraphs = sanitized.split(/\n\s*\n|\r\n\r\n/);

    return paragraphs.map((para, pIdx) => {
      const trimmed = para.trim();
      if (!trimmed) return null;

      // Verificare daca paragraful este o lista cu liniute sau bullet points
      if (trimmed.includes('•') || trimmed.includes('- ') || trimmed.includes('* ')) {
        const lines = trimmed.split(/\n/);
        return (
          <ul key={pIdx} className="my-3 space-y-1.5 list-disc pl-5 text-neutral-800 leading-relaxed text-sm">
            {lines.map((line, lIdx) => {
              const cleanLine = line.replace(/^[•\-*]\s*/, '').trim();
              if (!cleanLine || !isValidRequirementItem(cleanLine)) return null;
              return <li key={lIdx}>{cleanLine}</li>;
            })}
          </ul>
        );
      }

      // Verificare daca este un antet (Header)
      if (trimmed.endsWith(':') || (trimmed.length < 50 && (trimmed.toLowerCase().includes('cerin') || trimmed.toLowerCase().includes('responsabilit') || trimmed.toLowerCase().includes('benefic') || trimmed.toLowerCase().includes('requirements') || trimmed.toLowerCase().includes('responsibilities')))) {
        return (
          <h4 key={pIdx} className="text-xs font-mono font-bold text-neutral-950 uppercase tracking-wider mt-5 mb-2 border-b border-neutral-200/80 pb-1">
            {trimmed}
          </h4>
        );
      }

      return (
        <p key={pIdx} className="my-2 text-sm text-neutral-800 leading-relaxed whitespace-pre-line">
          {trimmed}
        </p>
      );
    });
  };

  const companyLetter = (currentJob?.companyName || 'J').trim().charAt(0).toUpperCase();

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-morphing-backdrop" onClick={onClose}>
      
      {/* CONTAINER MODAL / SHEET */}
      <div 
        className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-neutral-200/90 overflow-hidden my-auto animate-morphing-dialog flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* HEADER BAR FIX CU CLOSE & SHARE */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200/80 bg-white/95 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${
              isGmailJob 
                ? 'bg-red-50 text-red-700 border border-red-200/90 flex items-center gap-1.5' 
                : 'bg-neutral-100 text-neutral-800 border border-neutral-200/90 flex items-center gap-1.5'
            }`}>
              {isGmailJob && <Mail className="w-3 h-3 text-red-600 shrink-0" />}
              <span>{isGmailJob ? 'GMAIL ATS' : (currentJob.sourcePlatform || 'JOB')}</span>
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-bold truncate max-w-[200px] sm:max-w-md">
              {currentJob.companyName}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyLink}
              className="p-2 px-3 rounded-xl text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 border border-transparent hover:border-neutral-200/80 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold active:scale-95"
              title="Copiaza link-ul direct de aplicare"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-neutral-500" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copiat!' : 'Distribuie'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-950 hover:bg-neutral-100 border border-transparent hover:border-neutral-200/80 transition-all cursor-pointer animate-morphing-close active:scale-95"
              title="Inchide fereastra (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 flex-1 scrollbar-thin">

          {isGmailJob ? (
            /* DEDICATED GMAIL EMAIL CLIENT VIEW */
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* EMAIL BANNER & SENDER DETAILS */}
              <div className="bg-neutral-50/60 border border-neutral-200/90 rounded-2xl p-6 sm:p-7 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200/90 flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-red-600" />
                    <span>EMAIL DE RECRUTARE GMAIL</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-200/90">
                    {emailData?.status === 'INTERVIEWING' ? 'Invitatie Interviu' :
                     emailData?.status === 'OFFER_RECEIVED' ? 'Oferta Primita' :
                     emailData?.status === 'REJECTED' ? 'Respins / Negativ' : 'Aplicat (Confirmare)'}
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight leading-snug">
                    {emailData?.subject || currentJob.jobTitle}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="bg-white border border-neutral-200/80 p-3.5 rounded-xl shadow-2xs space-y-1">
                      <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Companie</span>
                      </span>
                      <p className="font-extrabold text-neutral-950 text-sm truncate">{currentJob.companyName}</p>
                    </div>
                    <div className="bg-white border border-neutral-200/80 p-3.5 rounded-xl shadow-2xs space-y-1">
                      <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Expeditor (De la)</span>
                      </span>
                      <p className="font-extrabold text-neutral-900 font-mono text-xs truncate" title={emailData?.sender}>
                        {emailData?.sender || 'Nespecificat'}
                      </p>
                    </div>
                    <div className="bg-white border border-neutral-200/80 p-3.5 rounded-xl shadow-2xs space-y-1">
                      <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Data Primirii</span>
                      </span>
                      <p className="font-extrabold text-neutral-800 font-mono text-xs">
                        {emailData?.date || 'Nespecificata'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* EMAIL BODY CONTENT */}
              <div className="bg-white border border-neutral-200/90 rounded-2xl overflow-hidden shadow-2xs">
                <div className="px-6 py-3.5 bg-neutral-50/90 border-b border-neutral-200/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-neutral-600" />
                    <h3 className="text-xs font-mono font-bold text-neutral-900 uppercase tracking-wider">
                      Continut Integral al Emailului Primit
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(emailData?.body || '');
                      setCopiedEmailBody(true);
                      setTimeout(() => setCopiedEmailBody(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200/90 text-xs font-mono font-bold text-neutral-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                  >
                    {copiedEmailBody ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-neutral-400" />}
                    <span>{copiedEmailBody ? 'Copiat!' : 'Copiaza Text'}</span>
                  </button>
                </div>

                <div className="p-6 sm:p-8 font-sans text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap selection:bg-neutral-200 font-normal">
                  {emailData?.body ? (
                    emailData.body
                  ) : (
                    <p className="text-neutral-400 italic">Mesajul nu contine text aditional in corpul emailului.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* TITLU & COMPANIE */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {/* ARCHITECTURAL COMPANY AVATAR */}
                  {currentJob.companyLogoUrl ? (
                    <img 
                      src={currentJob.companyLogoUrl} 
                      alt={currentJob.companyName}
                      className="w-14 h-14 rounded-2xl object-cover bg-neutral-100 border border-neutral-200/90 shrink-0 shadow-2xs"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-14 h-14 rounded-2xl bg-neutral-100 border border-neutral-200/90 text-neutral-950 flex items-center justify-center font-mono font-black text-xl shrink-0 shadow-2xs ${currentJob.companyLogoUrl ? 'hidden' : 'flex'}`}
                  >
                    {companyLetter}
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight leading-snug">
                      {currentJob.jobTitle}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 font-medium">
                      <span className="flex items-center gap-1.5 text-neutral-950 font-mono font-bold uppercase tracking-wider text-[11px]">
                        <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                        {currentJob.companyName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-neutral-600">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                        {currentJob.location}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-neutral-600 font-mono" title={currentJob.postedAt ? `Data postarii: ${currentJob.postedAt}` : 'Data exacta de publicare nu a fost furnizata de angajator'}>
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        {currentJob.postedAt ? (formatDateTime(currentJob.postedAt) !== 'Nespecificat' ? formatDateTime(currentJob.postedAt) : currentJob.postedDateAgo) : (currentJob.postedDateAgo || 'Data nespecificata')}
                      </span>
                      {currentJob.status && (
                        <>
                          <span>•</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                            currentJob.status === 'ACTIVE' 
                              ? 'bg-neutral-100 text-neutral-900 border border-neutral-200/90' 
                              : 'bg-neutral-100 text-neutral-500 border border-neutral-200/90'
                          }`}>
                            {currentJob.status === 'ACTIVE' ? 'Activ' : 'Expirat / Arhivat'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* SCOR ATS MATCH MARE */}
                <div className="shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl border border-neutral-200/90 bg-neutral-50/70 shadow-2xs self-start">
                  <Sparkles className={`w-5 h-5 shrink-0 ${displayScore >= 75 ? 'text-emerald-600' : displayScore >= 45 ? 'text-amber-500' : 'text-neutral-400'}`} />
                  <div>
                    <div className="text-xl font-mono font-black text-neutral-950 leading-tight">
                      {displayScore.toFixed(1)}% Match
                    </div>
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                      {aiAnalysisData?.aiVerified ? 'Scor ATS Verificat AI' : 'Scor ATS Ponderat'}
                    </div>
                  </div>
                </div>
              </div>

              {/* GRID METADATE CHEIE */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-neutral-50/60 border border-neutral-200/80 p-3.5 rounded-2xl space-y-1.5 transition-colors hover:bg-neutral-50">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-neutral-400" />
                    Mod de Lucru
                  </span>
                  <p className="text-xs sm:text-sm font-extrabold text-neutral-950">
                    {currentJob.workModel === 'REMOTE' ? 'Remote' : currentJob.workModel === 'HYBRID' ? 'Hibrid' : 'On-Site'}
                  </p>
                </div>

                <div className="bg-neutral-50/60 border border-neutral-200/80 p-3.5 rounded-2xl space-y-1.5 transition-colors hover:bg-neutral-50">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-neutral-400" />
                    Nivel Experienta
                  </span>
                  <p className="text-xs sm:text-sm font-extrabold text-neutral-950">
                    {effectiveExperienceLevel === 'INTERNSHIP' ? 'Internship' :
                     effectiveExperienceLevel === 'JUNIOR' ? 'Junior' :
                     effectiveExperienceLevel === 'SENIOR' ? 'Senior' : 'Mid-Level'}
                  </p>
                </div>

                <div className="bg-neutral-50/60 border border-neutral-200/80 p-3.5 rounded-2xl space-y-1.5 transition-colors hover:bg-neutral-50">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-neutral-400" />
                    Competitie
                  </span>
                  <p className="text-xs sm:text-sm font-extrabold text-neutral-950 truncate">
                    {currentJob.applicantCountText ? currentJob.applicantCountText.replace(/[()]/g, '').trim() : 'Estimare Normala'}
                  </p>
                </div>
              </div>

              {/* SECTIUNE PIPELINE DE AUDIT & ISTORIC MODIFICARI */}
              <div className="bg-neutral-50/60 border border-neutral-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-neutral-700" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900">
                      Audit Lifecycle & Istoric Modificari
                    </span>
                    {currentJob.contentHash && (
                      <span className="text-[10px] font-mono bg-white text-neutral-500 border border-neutral-200 px-2 py-0.5 rounded-md hidden sm:inline" title={`SHA-256: ${currentJob.contentHash}`}>
                        Hash: {currentJob.contentHash.substring(0, 10)}...
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={fetchChanges}
                    className="text-xs font-mono font-bold text-neutral-700 hover:text-neutral-950 bg-white border border-neutral-200 hover:bg-neutral-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
                  >
                    <GitCommit className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{showChanges ? 'Ascunde Istoric' : 'Vezi Istoric Modificari'}</span>
                  </button>
                </div>

                {showChanges && (
                  <div className="pt-2 border-t border-neutral-200/80 space-y-2">
                    {loadingChanges ? (
                      <div className="py-4 text-center text-xs font-mono font-semibold text-neutral-500 animate-pulse">
                        Se incarca istoricul din baza de date...
                      </div>
                    ) : jobChanges.length === 0 ? (
                      <div className="py-3 text-center text-xs text-neutral-500 font-medium bg-white rounded-xl border border-neutral-200/70">
                        Niciun eveniment de modificare inregistrat inca (Job in starea initiala CREATED).
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {jobChanges.map((change) => (
                          <div 
                            key={change.id || Math.random()}
                            className="bg-white border border-neutral-200/80 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-2xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-neutral-100 text-neutral-800 border border-neutral-200/90">
                                {change.changeType}
                              </span>
                              <span className="font-semibold text-neutral-800">
                                {change.details || 'Modificare detectata in pipeline'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono shrink-0">
                              <Clock className="w-3 h-3 text-neutral-400" />
                              <span>{formatDateTime(change.changedAt)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* BILANT INTELIGENT COMPETENTE (OBSIDIAN DARK COMMAND CARD) */}
              <div className="bg-neutral-950 text-white p-5 sm:p-6 rounded-2xl shadow-lg border border-neutral-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-white" />
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                        Bilant Competente: Ce Stii vs Ce Iti Lipseste
                      </h3>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1 font-normal">
                      Comparat in timp real cu profilul tau de CV pentru a-ti evidentia atuurile la interviu
                    </p>

                    {/* SELECTOR CV UTILIZATOR PENTRU COMPARARE */}
                    {userCvs.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mt-2.5 pt-2 border-t border-neutral-800/80">
                        <span className="text-xs font-mono font-bold text-neutral-300 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-neutral-400" />
                          Compara cu CV-ul:
                        </span>
                        <select
                          value={selectedCvId || ''}
                          onChange={(e) => handleSelectCv(e.target.value)}
                          disabled={loadingAiAnalysis}
                          className="bg-neutral-900 hover:bg-neutral-800/90 border border-neutral-700 text-white font-mono font-semibold text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-400 cursor-pointer shadow-2xs transition-all disabled:opacity-50"
                        >
                          {userCvs.map((c) => (
                            <option key={c.id} value={c.id} className="bg-neutral-900 text-white py-1">
                              {c.title || 'CV Personal'} {c.isPrimary ? '[Principal]' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => runAiMatch(currentJob, selectedCvId, true)}
                      disabled={loadingAiAnalysis}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-100 active:scale-95 text-neutral-950 font-mono font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border border-neutral-200"
                      title="Analizeaza semantic cerintele jobului direct cu AI Groq si CV-ul selectat"
                    >
                      {loadingAiAnalysis ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-700" />
                          <span>Verificare AI in curs...</span>
                        </>
                      ) : aiAnalysisData ? (
                        <>
                          <Bot className="w-3.5 h-3.5 text-neutral-950" />
                          <span>Re-analizeaza cu AI</span>
                        </>
                      ) : (
                        <>
                          <Bot className="w-3.5 h-3.5 text-neutral-950" />
                          <span>Verifica & Bifeaza cu AI</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2.5 bg-neutral-900 border border-neutral-800 px-3.5 py-2 rounded-xl">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="text-right">
                        <div className="text-xs font-mono font-black text-white">{displayScore.toFixed(1)}% Match ATS</div>
                        <div className="text-[10px] font-mono text-neutral-400 font-medium">
                          {matchedMandatoryCount} din {totalMandatoryCount > 0 ? totalMandatoryCount : (skillsRequired.length || 1)} cerinte bifate
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RAPORT / VERDICT AI RECRUITER DACA ESTE ACTIVAT */}
                {aiAnalysisData?.verdict && (
                  <div className="bg-neutral-900 border border-neutral-800/90 rounded-xl p-3.5 flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-neutral-300" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                        Verdict Recruiter AI (Analiza Semantica CV)
                      </span>
                      <p className="text-xs text-neutral-200 font-normal leading-relaxed">
                        {aiAnalysisData.verdict}
                      </p>
                    </div>
                  </div>
                )}

                {aiAnalysisError && (
                  <div className="bg-rose-950/40 border border-rose-800/50 rounded-xl p-3 text-xs text-rose-300 font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{aiAnalysisError}</span>
                  </div>
                )}

                {/* GRID CU 2 COLOANE CLARE: CE STII vs CE NU STII */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* COLOANA 1: CE STAPANESTI */}
                  <div className="bg-neutral-900/90 border border-emerald-900/40 rounded-xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-emerald-300 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Ce Stapanesti Deja ({displayMatchingSkills.length})
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                        Puncte Forte
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                      {displayMatchingSkills.length > 0 ? (
                        displayMatchingSkills.map((skill, idx) => (
                          <span 
                            key={idx} 
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-emerald-950/50 text-emerald-200 border border-emerald-800/50 shadow-2xs"
                          >
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>{skill}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-neutral-400 italic">Nu s-a detectat inca o suprapunere directa de cuvinte cheie din CV.</span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed pt-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Aceste competente sunt deja demonstrate in CV. Vor fi punctele tale forte la interviu!</span>
                    </p>
                  </div>

                  {/* COLOANA 2: CE ITI LIPSESTE */}
                  <div className="bg-neutral-900/90 border border-amber-900/40 rounded-xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        Ce Nu Ai in CV / De Invatat ({displayMissingSkills.length})
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-800/60">
                        Gaps de Acoperit
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                      {displayMissingSkills.length > 0 ? (
                        displayMissingSkills.map((skill, idx) => (
                          <span 
                            key={idx} 
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-amber-950/50 text-amber-200 border border-amber-800/50 shadow-2xs"
                          >
                            <BookOpen className="w-3 h-3 text-amber-400" />
                            <span>{skill}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-emerald-300 font-bold flex items-center gap-1">
                          <CheckCheck className="w-4 h-4 text-emerald-400" />
                          Felicitari! Profilul tau acopera toate cerintele tehnice identificate!
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed pt-1 flex items-start gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>Sfat: Daca ai lucrat chiar si la proiecte personale cu aceste tehnologii, adauga-le in CV Studio pentru a creste scorul ATS!</span>
                    </p>
                  </div>
                </div>

                {/* EVALUARE NIVEL EXPERIENTA */}
                <div className="text-xs text-neutral-300 bg-neutral-900 border border-neutral-800 p-3 rounded-xl leading-relaxed">
                  <span className="font-mono font-bold text-white uppercase text-[10px] tracking-wider mr-1">Evaluare Nivel: </span>
                  {effectiveExperienceLevel === 'JUNIOR' || effectiveExperienceLevel === 'INTERNSHIP' ? (
                    <span className="text-emerald-300 font-medium">
                      Pozitia este ideala pentru debut de cariera (0-1 ani experienta). Sanse maxime de selectie la interviu! Fara penalizare de vechime.
                    </span>
                  ) : effectiveExperienceLevel === 'MID' ? (
                    <span className="text-amber-300 font-medium">
                      Penalizare de nivel: Pozitia solicita 2-4 ani de experienta comerciala. Profilul de Junior este plafonat automat de algoritmul ATS din cauza deficitului de vechime cerut.
                    </span>
                  ) : (
                    <span className="text-rose-300 font-medium">
                      Incompatibilitate de senioritate: Pozitie de nivel Senior / Lead (5+ ani). Sistemele automate ATS descalifica de regula profilurile fara vechime comerciala solida.
                    </span>
                  )}
                </div>
              </div>

              {/* SECTIUNE FISA POSTULUI & CERINTE DETALIATE */}
              <div className="space-y-5 pt-2">
                <div className="flex items-center justify-between border-b border-neutral-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-neutral-900" />
                    <div>
                      <h3 className="text-xs font-mono font-bold text-neutral-950 uppercase tracking-wider">
                        Fisa Postului & Cerinte Detaliate
                      </h3>
                      <p className="text-[11px] text-neutral-500 font-normal">
                        Cerinte tehnice si responsabilitati structurate inteligent
                      </p>
                    </div>
                  </div>
                </div>

                {loadingDetails && (
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono font-bold text-neutral-700 flex items-center gap-2 animate-pulse">
                    <Sparkles className="w-4 h-4 text-neutral-600" />
                    Se extrage descrierea detaliata completa de pe {currentJob.sourcePlatform}...
                  </div>
                )}

                {loadingAiAnalysis && (
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono font-bold text-neutral-800 flex items-center justify-between gap-2 animate-pulse shadow-2xs">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-neutral-700 animate-spin" />
                      <span>AI extrage si separa cerintele, responsabilitatile si beneficiile din anunt...</span>
                    </div>
                    <span className="text-[10px] font-mono bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded-md uppercase font-bold">AI Live</span>
                  </div>
                )}

                {/* CERINTE OBLIGATORII (MUST-HAVE) */}
                {effectiveMandatoryRequirements.length > 0 && (
                  <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-neutral-100 text-neutral-800">
                          <Target className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-mono font-bold text-neutral-950 uppercase tracking-wider flex items-center gap-2">
                            <span>Cerinte Obligatorii (Must-Have)</span>
                            {aiAnalysisData && (
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Bot className="w-3 h-3 text-neutral-700" />
                                AI Verified
                              </span>
                            )}
                          </h4>
                          <span className="text-[11px] text-neutral-500 font-medium">
                            Competente si calificari esentiale cerute pentru acest rol
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-neutral-100 text-neutral-800 border border-neutral-200/80">
                        {effectiveMandatoryRequirements.length} Cerinte
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {effectiveMandatoryRequirements.map((req, idx) => (
                        <div 
                          key={idx}
                          className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                            req.isMatched 
                              ? 'bg-neutral-50/70 border-neutral-200/80 hover:border-neutral-300' 
                              : 'bg-amber-50/20 border-amber-200/60 hover:border-amber-300'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 flex-1">
                            {req.isMatched ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            )}
                            <div className="space-y-0.5">
                              <span className="text-xs sm:text-sm font-medium text-neutral-900 leading-snug">
                                {req.text}
                              </span>
                              {req.explanation && (
                                <p className="text-[11px] text-neutral-500 italic">
                                  {req.explanation}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-start sm:self-center">
                            {req.isMatched ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/90 flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>{req.matchedSkill ? `Bifat: ${req.matchedSkill}` : 'Bifat in CV'}</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center gap-1">
                                <BookOpen className="w-3 h-3 text-amber-600" />
                                <span>Lipseste din CV</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CUNOSTINTE BONUS / AVANTAJE (NICE-TO-HAVE) */}
                {effectiveBonusRequirements.length > 0 && (
                  <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-neutral-100 text-neutral-800">
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-mono font-bold text-neutral-950 uppercase tracking-wider flex items-center gap-1.5">
                            <span>Cunostinte Bonus & Avantaje (Nice-to-Have)</span>
                            <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
                          </h4>
                          <span className="text-[11px] text-neutral-500 font-medium">
                            Cunostinte care nu sunt eliminatorii, dar iti ofera un avantaj major la selectie
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-neutral-100 text-neutral-800 border border-neutral-200/80">
                        {effectiveBonusRequirements.length} Puncte Bonus
                      </span>
                    </div>

                    <div className="space-y-2">
                      {effectiveBonusRequirements.map((bonus, idx) => (
                        <div 
                          key={idx}
                          className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                            bonus.isMatched 
                              ? 'bg-emerald-50/30 border-emerald-200/70' 
                              : 'bg-neutral-50/40 border-neutral-200/60'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 flex-1">
                            <Sparkles className={`w-4 h-4 shrink-0 mt-0.5 ${bonus.isMatched ? 'text-emerald-600' : 'text-neutral-400'}`} />
                            <span className="text-xs sm:text-sm font-medium text-neutral-800 leading-snug">
                              {bonus.text}
                            </span>
                          </div>

                          {bonus.isMatched && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/90 flex items-center gap-1 shrink-0 self-start sm:self-center">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>{bonus.matchedSkill ? `Bonus Bifat: ${bonus.matchedSkill}` : 'Bonus Bifat in Profil!'}</span>
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* RESPONSABILITATI PRINCIPALE */}
                {displayResponsibilities && displayResponsibilities.length > 0 && (
                  <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-neutral-100 text-neutral-800">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-mono font-bold text-neutral-950 uppercase tracking-wider flex items-center gap-2">
                            <span>Ce Vei Face in Acest Rol (Responsabilitati)</span>
                            {aiAnalysisData?.responsibilities?.length > 0 && (
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Bot className="w-3 h-3 text-neutral-700" />
                                AI Extracted
                              </span>
                            )}
                          </h4>
                          <span className="text-[11px] text-neutral-500 font-medium">
                            Activitatile tale zilnice si proiectele din cadrul echipei
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-neutral-100 text-neutral-800 border border-neutral-200/80">
                        {displayResponsibilities.length} Activitati
                      </span>
                    </div>

                    <ul className="space-y-2">
                      {displayResponsibilities.map((resp, idx) => (
                        <li key={idx} className="p-2.5 rounded-xl bg-neutral-50/50 border border-neutral-100 flex items-start gap-2.5 text-xs sm:text-sm text-neutral-800 leading-relaxed">
                          <div className="w-1.5 h-1.5 rounded-full bg-neutral-950 shrink-0 mt-2"></div>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* BENEFICII & OFERTA */}
                {displayBenefits && displayBenefits.length > 0 && (
                  <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-neutral-100 text-neutral-800">
                          <Gift className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-mono font-bold text-neutral-950 uppercase tracking-wider flex items-center gap-2">
                            <span>Ce Iti Ofera Compania (Beneficii & Pachet)</span>
                            {aiAnalysisData?.benefits?.length > 0 && (
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Bot className="w-3 h-3 text-neutral-700" />
                                AI Extracted
                              </span>
                            )}
                          </h4>
                          <span className="text-[11px] text-neutral-500 font-medium">
                            Perks, asigurare, dezvoltare profesionala si conditii de lucru
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-neutral-100 text-neutral-800 border border-neutral-200/80">
                        {displayBenefits.length} Beneficii
                      </span>
                    </div>

                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {displayBenefits.map((ben, idx) => (
                        <li key={idx} className="bg-neutral-50/60 p-3 rounded-xl border border-neutral-200/70 text-xs font-medium text-neutral-800 flex items-center gap-2.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{ben}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* FALLBACK DACA NU S-A PUTUT STRUCTURA NICIO SECTIUNE */}
                {(!parsedDescription.mandatoryRequirements.length &&
                  (!aiAnalysisData?.mandatory || !aiAnalysisData.mandatory.length) &&
                  !parsedDescription.bonusRequirements.length &&
                  (!aiAnalysisData?.bonus || !aiAnalysisData.bonus.length) &&
                  !displayResponsibilities.length &&
                  !displayBenefits.length) && (
                  <div className="bg-neutral-50/60 border border-neutral-200/80 rounded-2xl p-6 leading-relaxed">
                    {formatDescription(currentJob.rawDescription)}
                  </div>
                )}

              </div>

            </>
          )}

        </div>

        {/* FOOTER FIX CU ACTIUNI RAPIDE */}
        <div className="p-4 sm:p-5 bg-white/95 border-t border-neutral-200/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-20">
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium text-center sm:text-left flex-wrap">
            <span className="font-mono">Platforma: <strong className="text-neutral-950 font-bold">{isGmailJob ? 'Gmail Sync' : (currentJob.sourcePlatform || 'DIRECT')}</strong></span>
            {(currentJob.appliedDate || emailData?.date) && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-neutral-700 font-mono font-bold">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{currentJob.appliedDate || emailData?.date}</span>
                </span>
              </>
            )}
            <span>• {isGmailJob ? 'Email Original Sincronizat' : 'Verificat & Validat'}</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap justify-end">
            {onOpenCoverLetter && (
              <button
                type="button"
                onClick={() => {
                  onOpenCoverLetter(currentJob);
                  onClose();
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-neutral-200/90 bg-neutral-100 hover:bg-neutral-200/80 text-neutral-900 active:scale-95"
                title="Genereaza Scrisoare de Intentie AI pentru acest rol"
              >
                <FileSignature className="w-3.5 h-3.5 text-neutral-800 shrink-0" />
                <span>Scrisoare AI</span>
              </button>
            )}

            {onSaveToKanban && (
              <button
                onClick={() => onSaveToKanban(currentJob)}
                disabled={isSaved || isSaving}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border active:scale-95 ${
                  isSaved 
                    ? 'bg-neutral-100 text-neutral-700 border-neutral-200/90' 
                    : 'bg-white hover:bg-neutral-100 text-neutral-900 border-neutral-300'
                }`}
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0" />
                    <span>Aplicat in Tracker</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-neutral-600 shrink-0" />
                    <span>{isSaving ? 'Se adauga...' : 'Adauga la Aplicat'}</span>
                  </>
                )}
              </button>
            )}

            {currentJob.directApplyUrl && (
              <a
                href={currentJob.directApplyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                <span>Aplica Oficial</span>
                <ArrowUpRight className="w-4 h-4 shrink-0" />
              </a>
            )}
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
