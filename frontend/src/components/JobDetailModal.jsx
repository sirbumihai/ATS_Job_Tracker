import React, { useState, useEffect, useMemo } from 'react';
import {
  createPortal
} from 'react-dom';
import {
  SendIcon,
  CheckCircle2Icon,
  CheckIcon,
  FileSignatureIcon,
  ExternalLinkIcon
} from './animated-icons';

import {
  X,
  MapPin,
  Building2,
  Briefcase,
  Sparkles,
  CheckCircle2,
  Clock,
  Globe,
  AlertCircle,
  Users,
  User,
  Check,
  Share2,
  Calendar,
  History,
  AlertTriangle,
  RefreshCw,
  Bot,
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
        text: `Cunoștințe sau experiență demonstrabila cu ${s}`,
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
    sections.mandatory = skillsRequired.map(s => `Cunoștințe practice de ${s}`);
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
        targetJob.rawDescription.includes('CONȚINUT COMPLET EMAIL') ||
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
        job.rawDescription.includes('CONȚINUT COMPLET EMAIL') ||
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
    const isDescriptionShort = !job.rawDescription || job.rawDescription.length < 350 || job.rawDescription.includes('Descrierea completă a postului salvat');
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
        currentJob.rawDescription.includes('CONȚINUT COMPLET EMAIL') ||
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
        explanation: req.matched && req.matched.length > 0 ? `Bifat în CV conform profilului: ${req.matched.join(', ')}` : 'Competenta ceruta în anunt'
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
    if (!rawText) return <p className="text-gray-500 italic">Descrierea completă nu este disponibila.</p>;

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
          <h4 key={pIdx} className="text-sm font-medium text-neutral-950 mt-4 mb-1">
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

  const sectionTitle = 'font-sans text-sm font-medium text-neutral-950';
  const pill = 'px-2 py-0.5 rounded-md text-xs bg-neutral-100 text-neutral-700';
  const levelLabel = effectiveExperienceLevel === 'INTERNSHIP' ? 'Internship' :
    effectiveExperienceLevel === 'JUNIOR' ? 'Junior' :
    effectiveExperienceLevel === 'SENIOR' ? 'Senior' : 'Mid-Level';
  const workLabel = currentJob.workModel === 'REMOTE' ? 'Remote' : currentJob.workModel === 'HYBRID' ? 'Hibrid' : 'On-site';
  const competitionLabel = currentJob.applicantCountText
    ? currentJob.applicantCountText.replace(/[()]/g, '').trim()
    : (currentJob.competitivenessLabel || 'Nespecificat');
  const postedLabel = currentJob.postedAt
    ? (formatDateTime(currentJob.postedAt) !== 'Nespecificat' ? formatDateTime(currentJob.postedAt) : currentJob.postedDateAgo)
    : (currentJob.postedDateAgo || 'Dată nespecificată');

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-neutral-950/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-morphing-backdrop" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={currentJob.jobTitle}
        className="relative bg-white w-full max-w-3xl rounded-2xl border border-neutral-200 shadow-xl overflow-hidden my-auto animate-morphing-dialog flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-2 min-w-0 text-xs text-neutral-500">
            {isGmailJob && <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />}
            <span className="truncate">{isGmailJob ? 'Gmail' : (currentJob.sourcePlatform || 'Job')}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyLink}
              className="p-2 px-3 rounded-xl text-neutral-600 hover:text-brand-600 hover:bg-brand-50 transition cursor-pointer flex items-center gap-1.5 text-xs font-medium"
              title="Copiază linkul de aplicare"
            >
              {copiedLink ? <CheckIcon size={14} className="w-3.5 h-3.5 text-brand-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copiat' : 'Distribuie'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-950 hover:bg-neutral-100 transition cursor-pointer"
              title="Închide"
              aria-label="Închide"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          {isGmailJob ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <span className={pill}>
                  {emailData?.status === 'INTERVIEWING' ? 'Invitație la interviu' :
                   emailData?.status === 'OFFER_RECEIVED' ? 'Ofertă primită' :
                   emailData?.status === 'REJECTED' ? 'Respins' : 'Aplicat'}
                </span>
                <h2 className="font-serif text-2xl font-medium text-neutral-950 leading-snug">
                  {emailData?.subject || currentJob.jobTitle}
                </h2>
                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-neutral-500 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />Companie</dt>
                    <dd className="font-medium text-neutral-950 truncate">{currentJob.companyName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500 flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Expeditor</dt>
                    <dd className="font-medium text-neutral-950 truncate" title={emailData?.sender}>{emailData?.sender || 'Nespecificat'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Data primirii</dt>
                    <dd className="font-medium text-neutral-950">{emailData?.date || 'Nespecificată'}</dd>
                  </div>
                </dl>
              </div>

              <section className="border-t border-neutral-100 pt-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className={sectionTitle}>Emailul primit</h3>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(emailData?.body || '');
                      setCopiedEmailBody(true);
                      setTimeout(() => setCopiedEmailBody(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 text-xs font-medium text-neutral-700 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedEmailBody ? <CheckIcon size={14} className="w-3.5 h-3.5 text-brand-500" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copiedEmailBody ? 'Copiat' : 'Copiază textul'}</span>
                  </button>
                </div>
                <div className="text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap">
                  {emailData?.body || <p className="text-neutral-400">Emailul nu conține text.</p>}
                </div>
              </section>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  {currentJob.companyLogoUrl ? (
                    <img
                      src={currentJob.companyLogoUrl}
                      alt={currentJob.companyName}
                      className="w-12 h-12 rounded-xl object-cover bg-neutral-50 shrink-0"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-12 h-12 rounded-xl bg-brand-50 text-brand-700 items-center justify-center font-serif text-xl shrink-0 ${currentJob.companyLogoUrl ? 'hidden' : 'flex'}`}>
                    {companyLetter}
                  </div>
                  <div className="min-w-0">
                    <h1 className="font-serif text-2xl font-medium text-neutral-950 leading-snug">{currentJob.jobTitle}</h1>
                    <p className="text-sm text-neutral-600 mt-1">{currentJob.companyName}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 mt-1">
                      <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{currentJob.location}</span>
                      <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{postedLabel}</span>
                      {currentJob.status && <span>{currentJob.status === 'ACTIVE' ? 'Activ' : 'Expirat'}</span>}
                    </div>
                  </div>
                </div>

                <div
                  className={`shrink-0 text-center px-3 py-2 rounded-xl ${displayScore >= 75 ? 'bg-brand-500 text-white' : displayScore >= 45 ? 'bg-brand-50 text-brand-700' : 'bg-neutral-100 text-neutral-600'}`}
                  title={aiAnalysisData?.aiVerified ? 'Scor ATS verificat cu AI' : 'Scor ATS'}
                >
                  <div className="text-xl font-medium tabular-nums leading-tight">{Math.round(displayScore)}%</div>
                  <div className="text-xs opacity-80">Scor ATS</div>
                </div>
              </div>

              <dl className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-neutral-500 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />Mod</dt>
                  <dd className="font-medium text-neutral-950">{workLabel}</dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" />Nivel</dt>
                  <dd className="font-medium text-neutral-950">{levelLabel}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs text-neutral-500 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />Competiție</dt>
                  <dd className="font-medium text-neutral-950 truncate">{competitionLabel}</dd>
                </div>
              </dl>

              <section className="border-t border-neutral-100 pt-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className={sectionTitle}>Potrivire cu CV-ul</h3>
                    <p className="text-xs text-neutral-500">
                      {matchedMandatoryCount} din {totalMandatoryCount > 0 ? totalMandatoryCount : (skillsRequired.length || 1)} cerințe acoperite
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {userCvs.length > 0 && (
                      <select
                        value={selectedCvId || ''}
                        onChange={(e) => handleSelectCv(e.target.value)}
                        disabled={loadingAiAnalysis}
                        aria-label="CV pentru comparare"
                        className="bg-white border border-neutral-200 text-neutral-900 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500 cursor-pointer disabled:opacity-50"
                      >
                        {userCvs.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title || 'CV personal'} {c.isPrimary ? '[Principal]' : ''}
                          </option>
                        ))}
                      </select>
                    )}
                    <button
                      type="button"
                      onClick={() => runAiMatch(currentJob, selectedCvId, true)}
                      disabled={loadingAiAnalysis}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium transition cursor-pointer disabled:opacity-60"
                      title="Analizează cerințele jobului cu AI, pe CV-ul selectat"
                    >
                      {loadingAiAnalysis ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
                      <span>{loadingAiAnalysis ? 'Se analizează...' : aiAnalysisData ? 'Reanalizează' : 'Analizează cu AI'}</span>
                    </button>
                  </div>
                </div>

                {aiAnalysisData?.verdict && (
                  <p className="text-sm text-neutral-700 leading-relaxed bg-neutral-50 rounded-xl p-3">{aiAnalysisData.verdict}</p>
                )}

                {aiAnalysisError && (
                  <div className="text-sm text-red-700 bg-red-50 rounded-xl p-3 flex items-center gap-2" role="alert">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{aiAnalysisError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-sans text-xs font-medium text-neutral-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
                      Ai deja ({displayMatchingSkills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {displayMatchingSkills.length > 0 ? displayMatchingSkills.map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg text-xs bg-brand-50 text-brand-700">{skill}</span>
                      )) : <span className="text-xs text-neutral-400">Nicio suprapunere găsită</span>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-sans text-xs font-medium text-neutral-600 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      Îți lipsesc ({displayMissingSkills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {displayMissingSkills.length > 0 ? displayMissingSkills.map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg text-xs bg-amber-50 text-amber-800">{skill}</span>
                      )) : <span className="text-xs text-neutral-500">Profilul acoperă cerințele tehnice</span>}
                    </div>
                  </div>
                </div>
              </section>

              {loadingDetails && (
                <div className="text-xs text-neutral-500 flex items-center gap-2" role="status">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Se încarcă descrierea completă
                </div>
              )}

              {effectiveMandatoryRequirements.length > 0 && (
                <section className="border-t border-neutral-100 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className={sectionTitle}>Cerințe obligatorii</h3>
                    <span className={pill}>{effectiveMandatoryRequirements.length}</span>
                  </div>
                  <ul className="space-y-2">
                    {effectiveMandatoryRequirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-neutral-800 leading-snug">
                        {req.isMatched ? (
                          <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <span className="flex-1">
                          {req.text}
                          {req.explanation && <span className="block text-xs text-neutral-500 mt-0.5">{req.explanation}</span>}
                        </span>
                        <span className="text-xs text-neutral-500 shrink-0">
                          {req.isMatched ? (req.matchedSkill || 'În CV') : 'Lipsește'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {effectiveBonusRequirements.length > 0 && (
                <section className="border-t border-neutral-100 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className={sectionTitle}>Avantaje</h3>
                    <span className={pill}>{effectiveBonusRequirements.length}</span>
                  </div>
                  <ul className="space-y-2">
                    {effectiveBonusRequirements.map((bonus, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-neutral-800 leading-snug">
                        <Sparkles className={`w-4 h-4 shrink-0 mt-0.5 ${bonus.isMatched ? 'text-brand-500' : 'text-neutral-300'}`} />
                        <span className="flex-1">{bonus.text}</span>
                        {bonus.isMatched && <span className="text-xs text-neutral-500 shrink-0">{bonus.matchedSkill || 'În CV'}</span>}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {displayResponsibilities && displayResponsibilities.length > 0 && (
                <section className="border-t border-neutral-100 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className={sectionTitle}>Responsabilități</h3>
                    <span className={pill}>{displayResponsibilities.length}</span>
                  </div>
                  <ul className="space-y-1.5 list-disc pl-5 text-sm text-neutral-800 leading-relaxed marker:text-neutral-300">
                    {displayResponsibilities.map((resp, idx) => <li key={idx}>{resp}</li>)}
                  </ul>
                </section>
              )}

              {displayBenefits && displayBenefits.length > 0 && (
                <section className="border-t border-neutral-100 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className={sectionTitle}>Beneficii</h3>
                    <span className={pill}>{displayBenefits.length}</span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-neutral-800">
                    {displayBenefits.map((ben, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-1" />
                        <span>{ben}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {(!parsedDescription.mandatoryRequirements.length &&
                (!aiAnalysisData?.mandatory || !aiAnalysisData.mandatory.length) &&
                !parsedDescription.bonusRequirements.length &&
                (!aiAnalysisData?.bonus || !aiAnalysisData.bonus.length) &&
                !displayResponsibilities.length &&
                !displayBenefits.length) && (
                <section className="border-t border-neutral-100 pt-4 space-y-3">
                  <h3 className={sectionTitle}>Descriere</h3>
                  <div className="leading-relaxed">{formatDescription(currentJob.rawDescription)}</div>
                </section>
              )}

              <section className="border-t border-neutral-100 pt-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className={sectionTitle}>Istoric modificări</h3>
                  <button
                    type="button"
                    onClick={fetchChanges}
                    aria-expanded={showChanges}
                    className="text-xs font-medium text-neutral-700 hover:text-brand-600 bg-white border border-neutral-200 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>{showChanges ? 'Ascunde' : 'Arată'}</span>
                  </button>
                </div>
                {showChanges && (
                  loadingChanges ? (
                    <p className="text-xs text-neutral-500" role="status">Se încarcă istoricul</p>
                  ) : jobChanges.length === 0 ? (
                    <p className="text-xs text-neutral-500">Nicio modificare înregistrată.</p>
                  ) : (
                    <ul className="space-y-2">
                      {jobChanges.map((change) => (
                        <li key={change.id || `${change.changeType}-${change.changedAt}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                          <span className="text-neutral-800">
                            <span className={`${pill} mr-2`}>{change.changeType}</span>
                            {change.details || 'Modificare detectată'}
                          </span>
                          <span className="text-neutral-400 flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(change.changedAt)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </section>
            </>
          )}
        </div>

        <div className="px-5 py-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-neutral-500 flex items-center gap-2 flex-wrap">
            <span>{isGmailJob ? 'Gmail Sync' : (currentJob.sourcePlatform || 'Direct')}</span>
            {(currentJob.appliedDate || emailData?.date) && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {currentJob.appliedDate || emailData?.date}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-end">
            {onOpenCoverLetter && (
              <button
                type="button"
                onClick={() => {
                  onOpenCoverLetter(currentJob);
                  onClose();
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900"
                title="Generează scrisoare de intenție"
              >
                <FileSignatureIcon size={14} className="w-3.5 h-3.5 shrink-0" />
                <span>Scrisoare AI</span>
              </button>
            )}

            {onSaveToKanban && (
              <button
                onClick={() => onSaveToKanban(currentJob)}
                disabled={isSaved || isSaving}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer border ${
                  isSaved
                    ? 'bg-brand-50 text-brand-700 border-brand-100'
                    : 'bg-white hover:bg-neutral-50 text-neutral-900 border-neutral-200'
                }`}
              >
                {isSaved ? (
                  <>
                    <CheckCircle2Icon size={16} className="w-4 h-4 shrink-0" />
                    <span>Aplicat în Tracker</span>
                  </>
                ) : (
                  <>
                    <SendIcon size={16} className="w-4 h-4 shrink-0" />
                    <span>{isSaving ? 'Se adaugă...' : 'Adaugă la Aplicat'}</span>
                  </>
                )}
              </button>
            )}

            {currentJob.directApplyUrl && (
              <a
                href={currentJob.directApplyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>Aplică</span>
                <ExternalLinkIcon size={16} className="w-4 h-4 shrink-0" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
