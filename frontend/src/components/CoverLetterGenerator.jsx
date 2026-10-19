import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import Card from './ui/Card';
import { 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  Edit3, 
  Building2, 
  Briefcase, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Languages, 
  Sliders, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  ClipboardPaste,
  Eye,
  Info
} from 'lucide-react';

export default function CoverLetterGenerator({ 
  applications = [], 
  currentUser,
  initialApplicationId = null,
  initialJobData = null,
  onNavigateToStudio,
  onNavigateToKanban
}) {
  const DEFAULT_USER_ID = '23fe8bdd-08f4-413d-9985-f99c21040b59';
  const activeUserId = currentUser?.userId || currentUser?.id || DEFAULT_USER_ID;

  // CV Profiles state
  const [cvList, setCvList] = useState([]);
  const [selectedCvId, setSelectedCvId] = useState('');
  const [loadingCvList, setLoadingCvList] = useState(false);

  // Job selection state
  const [jobMode, setJobMode] = useState(initialApplicationId ? 'saved' : 'saved'); // 'saved' | 'manual'
  const [selectedAppId, setSelectedAppId] = useState(initialApplicationId || '');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  // Generation preferences
  const [tone, setTone] = useState('SIMPLE_DIRECT'); // 'SIMPLE_DIRECT' | 'PROFESSIONAL' | 'MODERN_TECH'
  const [language, setLanguage] = useState('RO'); // 'RO' | 'EN'

  // Output & UI state
  const [generating, setGenerating] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const letterPaperRef = useRef(null);

  // Initial default letter state (preview prior to generation)
  const [letterData, setLetterData] = useState({
    candidateName: currentUser?.fullName || 'Mihai Sârbu',
    candidateEmail: currentUser?.email || 'mihai.sirbu@example.com',
    candidatePhone: '+40 712 345 678',
    candidateLocation: 'București, România',
    candidateLinkedin: 'linkedin.com/in/mihaisirbu',
    companyName: 'Tech Company',
    jobTitle: 'Software Engineer',
    letterDate: '24 septembrie 2026',
    recipientTitle: 'Echipa de Recrutare',
    subjectLine: 'Candidatură pentru poziția de Software Engineer – Mihai Sârbu',
    salutation: 'Stimate Manager de Recrutare,',
    openingParagraph: 'Vă adresez această scrisoare cu deosebit interes pentru oportunitatea de a mă alătura echipei dumneavoastră în rolul de Software Engineer. Pasiunea mea pentru codul curat, scalabil și performant se aliniază cu obiectivele tehnice ale organizației.',
    bodyParagraph1: 'Având experiență practică în ecosistemul Java, Spring Boot și baze de date relaționale, am dezvoltat și integrat servicii REST robuste pentru producție. Sunt obișnuit să analizez cerințe complexe de business și să le transform în module software sigure, bine testate și documentate.',
    bodyParagraph2: 'Apreciez accentul pe calitate și inovație din cadrul companiei. Sunt o persoană proactivă, orientată spre învățare continuă și dedicată colaborării eficiente în echipă.',
    closingParagraph: 'Aș fi onorat să discutăm într-un interviu despre cum pot contribui la proiectele dumneavoastră. Vă mulțumesc pentru timpul acordat.',
    signOff: 'Cu stimă,',
    matchedSkills: ['Java', 'Spring Boot', 'PostgreSQL', 'REST API', 'Docker']
  });

  // Fetch user's CV profiles
  useEffect(() => {
    const fetchCvProfiles = async () => {
      setLoadingCvList(true);
      try {
        const res = await fetch('/api/v1/cv/list', {
          headers: { 'X-User-Id': activeUserId }
        });
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            setCvList(list);
            const primary = list.find(c => c.isPrimary) || list[0];
            setSelectedCvId(primary.id);
            // Pre-fill candidate info from primary CV
            setLetterData(prev => ({
              ...prev,
              candidateName: primary.fullName || prev.candidateName,
              candidateEmail: primary.email || prev.candidateEmail,
              candidatePhone: primary.phone || prev.candidatePhone,
              candidateLocation: primary.location || prev.candidateLocation,
              candidateLinkedin: primary.linkedin || prev.candidateLinkedin,
            }));
          }
        }
      } catch (err) {
        console.error('Eroare la preluarea CV-urilor:', err);
      } finally {
        setLoadingCvList(false);
      }
    };

    fetchCvProfiles();
  }, [activeUserId]);

  // Handle CV selection change
  const handleCvChange = (cvId) => {
    setSelectedCvId(cvId);
    const chosen = cvList.find(c => c.id === cvId);
    if (chosen) {
      setLetterData(prev => ({
        ...prev,
        candidateName: chosen.fullName || prev.candidateName,
        candidateEmail: chosen.email || prev.candidateEmail,
        candidatePhone: chosen.phone || prev.candidatePhone,
        candidateLocation: chosen.location || prev.candidateLocation,
        candidateLinkedin: chosen.linkedin || prev.candidateLinkedin,
      }));
    }
  };

  // Handle application dropdown selection
  const handleSelectApplication = (appId) => {
    setSelectedAppId(appId);
    if (!appId) {
      setCompanyName('');
      setJobTitle('');
      setJobDescription('');
      return;
    }
    const app = applications.find(a => a.id === appId);
    if (app) {
      const cName = app.companyName || '';
      const jTitle = app.jobTitle || '';
      const jDesc = app.rawDescription || (app.jobPosting ? app.jobPosting.rawDescription : '') || '';
      setCompanyName(cName);
      setJobTitle(jTitle);
      setJobDescription(jDesc);

      // Auto-detect language
      if (jDesc) {
        const lower = jDesc.toLowerCase();
        if (lower.contains?.('experien') || lower.includes('experien') || lower.includes('cerin') || lower.includes('candidat')) {
          setLanguage('RO');
        } else if (lower.includes('experience') || lower.includes('requirements') || lower.includes('looking for')) {
          setLanguage('EN');
        }
      }
    }
  };

  useEffect(() => {
    if (initialJobData) {
      setJobMode('manual');
      const cName = initialJobData.companyName || initialJobData.company || '';
      const jTitle = initialJobData.jobTitle || initialJobData.title || '';
      const jDesc = initialJobData.description || initialJobData.rawDescription || (initialJobData.jobPosting ? initialJobData.jobPosting.rawDescription : '') || '';
      setCompanyName(cName);
      setJobTitle(jTitle);
      setJobDescription(jDesc);
      if (jDesc) {
        const lower = jDesc.toLowerCase();
        if (lower.includes('experien') || lower.includes('cerin') || lower.includes('candidat')) {
          setLanguage('RO');
        } else if (lower.includes('experience') || lower.includes('requirements') || lower.includes('looking for')) {
          setLanguage('EN');
        }
      }
    } else if (initialApplicationId && applications.length > 0) {
      setJobMode('saved');
      handleSelectApplication(initialApplicationId);
    }
  }, [initialApplicationId, initialJobData, applications]);

  // Paste from clipboard helper
  const handlePasteDescription = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setJobDescription(text);
      }
    } catch (e) {
      console.warn('Accesul la clipboard a fost blocat de browser:', e);
    }
  };

  // Trigger AI Generation
  const handleGenerate = async () => {
    if (!companyName.trim() && !jobTitle.trim() && !jobDescription.trim()) {
      setErrorMessage('Completează cel puțin compania sau titlul jobului.');
      return;
    }
    setErrorMessage('');
    setGenerating(true);

    try {
      const payload = {
        cvProfileId: selectedCvId || null,
        applicationId: jobMode === 'saved' && selectedAppId ? selectedAppId : null,
        companyName: companyName.trim(),
        jobTitle: jobTitle.trim(),
        jobDescription: jobDescription.trim(),
        languagePreference: language,
        tone: tone,
        candidateName: letterData.candidateName,
        candidateEmail: letterData.candidateEmail,
        candidatePhone: letterData.candidatePhone,
        candidateLocation: letterData.candidateLocation
      };

      const res = await fetch('/api/v1/ai/cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': activeUserId
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Serverul a returnat codul ${res.status}`);
      }

      const data = await res.json();
      setLetterData(prev => ({
        ...prev,
        ...data,
        matchedSkills: Array.isArray(data.matchedSkills) && data.matchedSkills.length > 0 
          ? data.matchedSkills 
          : prev.matchedSkills
      }));
      setIsEditing(false);
    } catch (err) {
      console.error('Eroare la generarea scrisorii de intentie:', err);
      setErrorMessage('Generarea a eșuat. S-a folosit modelul de rezervă.');
    } finally {
      setGenerating(false);
    }
  };

  // Direct PDF Download with html2pdf.js
  const handleDownloadPdf = async () => {
    const element = letterPaperRef.current;
    if (!element) {
      alert('Documentul nu a fost găsit pentru export.');
      return;
    }

    setIsDownloadingPdf(true);

    try {
      const candidateClean = (letterData.candidateName || 'Candidat').trim().replace(/\s+/g, '_');
      const companyClean = (letterData.companyName || 'Job').trim().replace(/\s+/g, '_');
      const filename = `Cover_Letter_${candidateClean}_${companyClean}.pdf`;

      // Temporarily hide helper controls
      const helperElements = element.querySelectorAll('.no-pdf');
      helperElements.forEach(el => { el.style.display = 'none'; });

      const opt = {
        margin: [15, 18, 15, 18],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2.5, 
          useCORS: true, 
          letterRendering: true,
          backgroundColor: '#ffffff',
          scrollY: 0,
          scrollX: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();

      helperElements.forEach(el => { el.style.display = ''; });
    } catch (err) {
      console.error('Eroare la descarcarea PDF-ului:', err);
      alert('Eroare la descărcarea fișierului PDF.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Copy complete letter text to clipboard
  const handleCopyText = async () => {
    const fullTextToCopy = [
      letterData.candidateName,
      `${letterData.candidateEmail} • ${letterData.candidatePhone} • ${letterData.candidateLocation}` + 
        (letterData.candidateLinkedin ? ` • ${letterData.candidateLinkedin}` : ''),
      '',
      letterData.letterDate,
      '',
      `${letterData.recipientTitle}\n${letterData.companyName}`,
      '',
      letterData.subjectLine,
      '',
      letterData.salutation,
      '',
      letterData.openingParagraph,
      '',
      letterData.bodyParagraph1,
      '',
      letterData.bodyParagraph2,
      '',
      letterData.closingParagraph,
      '',
      `${letterData.signOff}\n${letterData.candidateName}`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(fullTextToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Eroare la copiere:', err);
    }
  };

  // Field change helper when editing in-place
  const updateField = (field, value) => {
    setLetterData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans text-neutral-900">
      
      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANEL: CONFIGURATION & INPUTS (5 COLS) */}
        <div className="lg:col-span-5 space-y-5">
          
          <Card padding="p-5" className="space-y-4">
            
            {/* 1. SELECT CV PROFILE */}
            <div>
              <label htmlFor="cl-cv" className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5 mb-2">
                <User className="w-3.5 h-3.5 text-neutral-900" />
                CV sursă
              </label>
              
              {loadingCvList ? (
                <div className="text-xs text-neutral-400 py-2 flex items-center gap-2 font-mono">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-900" /> Se încarcă CV-urile...
                </div>
              ) : cvList.length > 0 ? (
                <div className="space-y-1.5">
                  <select
                    id="cl-cv"
                    value={selectedCvId}
                    onChange={(e) => handleCvChange(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 focus:border-brand-500 transition outline-none cursor-pointer"
                  >
                    {cvList.map((cv) => (
                      <option key={cv.id} value={cv.id}>
                        {cv.title || 'CV fără titlu'}{cv.isPrimary ? ' [Principal]' : ''} — {cv.fullName || 'Fără nume'}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-3 bg-neutral-100 rounded-xl border border-neutral-200 text-xs text-neutral-800">
                  Nu ai niciun CV salvat. Se folosesc datele implicite.
                </div>
              )}
            </div>

            <hr className="border-neutral-100" />

            {/* 2. TARGET JOB SELECTION */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-neutral-900" />
                  Jobul țintă
                </label>
                
                {/* MODE TOGGLE */}
                <div className="flex bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setJobMode('saved')}
                    className={`px-2 py-1 text-[11px] font-medium rounded-md transition ${
                      jobMode === 'saved' ? 'bg-white text-neutral-900 font-bold shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    Din Tracker
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobMode('manual')}
                    className={`px-2 py-1 text-[11px] font-medium rounded-md transition ${
                      jobMode === 'manual' ? 'bg-white text-neutral-900 font-bold shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    Manual
                  </button>
                </div>
              </div>

              {jobMode === 'saved' && (
                <div className="mb-3">
                  <select
                    value={selectedAppId}
                    onChange={(e) => handleSelectApplication(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-neutral-300 bg-white text-neutral-900 focus:border-brand-500 transition outline-none cursor-pointer"
                  >
                    <option value="">Alege o candidatură ({applications.length})</option>
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.companyName || 'Companie'} — {app.jobTitle || 'Job'} ({app.status || 'SAVED'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                <div>
                  <label htmlFor="cl-company" className="text-[11px] font-medium text-neutral-600 mb-1 block">Companie</label>
                  <input
                    id="cl-company"
                    type="text"
                    placeholder="Endava"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-300 bg-white focus:border-brand-500 transition outline-none font-medium text-neutral-900"
                  />
                </div>
                <div>
                  <label htmlFor="cl-title" className="text-[11px] font-medium text-neutral-600 mb-1 block">Titlu job</label>
                  <input
                    id="cl-title"
                    type="text"
                    placeholder="Junior Java Developer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-300 bg-white focus:border-brand-500 transition outline-none font-medium text-neutral-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-neutral-600">Descriere sau cerințe</label>
                  <button
                    type="button"
                    onClick={handlePasteDescription}
                    className="text-xs text-brand-600 hover:text-brand-500 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <ClipboardPaste className="w-3 h-3" /> Lipește
                  </button>
                </div>
                <textarea
                  rows={4}
                  placeholder="Lipește cerințele jobului"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-neutral-300 bg-white focus:border-brand-500 transition outline-none resize-none text-neutral-800 leading-relaxed font-sans"
                />
              </div>
            </div>

            <hr className="border-neutral-100" />

            {/* 3. GENERATION PREFERENCES */}
            <div>
              <label className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5 mb-2.5">
                <Sliders className="w-3.5 h-3.5 text-neutral-900" />
                Stil
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* TONE SELECTION */}
                <div>
                  <label className="text-[11px] font-medium text-neutral-600 mb-1 block">Ton</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full text-xs font-medium px-2.5 py-2 rounded-xl border border-neutral-300 bg-white focus:border-brand-500 transition outline-none cursor-pointer text-neutral-900"
                  >
                    <option value="SIMPLE_DIRECT">Simplu și direct</option>
                    <option value="PROFESSIONAL">Clasic și profesional</option>
                    <option value="MODERN_TECH">Modern și tehnic</option>
                  </select>
                </div>

                {/* LANGUAGE SELECTION */}
                <div>
                  <label className="text-[11px] font-medium text-neutral-600 mb-1 block flex items-center gap-1">
                    <Languages className="w-3 h-3 text-neutral-500" /> Limba
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full text-xs font-medium px-2.5 py-2 rounded-xl border border-neutral-300 bg-white focus:border-brand-500 transition outline-none cursor-pointer text-neutral-900"
                  >
                    <option value="RO">Română</option>
                    <option value="EN">English</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ERROR MESSAGE IF ANY */}
            {errorMessage && (
              <div className="p-3 bg-neutral-100 text-neutral-900 border border-neutral-300 rounded-xl text-xs flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-neutral-900" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* GENERATE BUTTON */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className={`w-full py-3 px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                generating 
                  ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed' 
                  : 'bg-brand-500 hover:bg-brand-600 text-white'
              }`}
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Se generează...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Generează scrisoarea</span>
                </>
              )}
            </button>

          </Card>

        </div>

        {/* RIGHT PANEL: A4 LIVE DOCUMENT & PDF EXPORT (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* TOOLBAR */}
          <Card padding="p-3" className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition border cursor-pointer ${
                  isEditing 
                    ? 'bg-brand-500 text-white border-brand-500' 
                    : 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-300'
                }`}
              >
                {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                {isEditing ? 'Previzualizare' : 'Editează'}
              </button>

              <button
                type="button"
                onClick={handleCopyText}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 flex items-center gap-1.5 transition cursor-pointer"
                title="Copiază textul scrisorii"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-neutral-900" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiat!' : 'Copiază textul'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="px-4 py-1.5 rounded-xl text-xs font-medium bg-brand-500 hover:bg-brand-600 text-white flex items-center gap-1.5 transition cursor-pointer"
              >
                {isDownloadingPdf ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{isDownloadingPdf ? 'Se generează...' : 'Descarcă PDF'}</span>
              </button>
            </div>
          </Card>

          {/* REALISTIC A4 PREVIEW CONTAINER */}
          <div className="bg-neutral-100 p-4 sm:p-8 rounded-2xl flex justify-center overflow-x-auto">
            
            {/* A4 PAPER SHEET */}
            <div
              id="cover-letter-paper"
              ref={letterPaperRef}
              className="bg-white w-full max-w-[750px] min-h-[960px] p-8 sm:p-12 shadow-sm text-gray-900 font-sans leading-relaxed selection:bg-blue-100 selection:text-blue-900 transition-all"
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}
            >
              
              {/* LETTERHEAD: CANDIDATE INFO */}
              <div className="border-b border-gray-200 pb-5 mb-6">
                {isEditing ? (
                  <input
                    type="text"
                    value={letterData.candidateName}
                    onChange={(e) => updateField('candidateName', e.target.value)}
                    className="w-full text-2xl font-black tracking-tight text-gray-950 border-b border-dashed border-gray-300 focus:border-blue-500 outline-none mb-1 bg-amber-50/40 px-1"
                  />
                ) : (
                  <h1 className="text-2xl font-black tracking-tight text-gray-950 uppercase">
                    {letterData.candidateName}
                  </h1>
                )}

                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-gray-600 mt-2 font-medium">
                  {isEditing ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full mt-2">
                      <input 
                        type="text" 
                        value={letterData.candidateEmail} 
                        onChange={(e) => updateField('candidateEmail', e.target.value)}
                        placeholder="Email" 
                        className="text-xs p-1 border rounded bg-amber-50/40"
                      />
                      <input 
                        type="text" 
                        value={letterData.candidatePhone} 
                        onChange={(e) => updateField('candidatePhone', e.target.value)}
                        placeholder="Telefon" 
                        className="text-xs p-1 border rounded bg-amber-50/40"
                      />
                      <input 
                        type="text" 
                        value={letterData.candidateLocation} 
                        onChange={(e) => updateField('candidateLocation', e.target.value)}
                        placeholder="Locație" 
                        className="text-xs p-1 border rounded bg-amber-50/40"
                      />
                      <input 
                        type="text" 
                        value={letterData.candidateLinkedin || ''} 
                        onChange={(e) => updateField('candidateLinkedin', e.target.value)}
                        placeholder="LinkedIn" 
                        className="text-xs p-1 border rounded bg-amber-50/40"
                      />
                    </div>
                  ) : (
                    <>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-gray-400 shrink-0" /> {letterData.candidateEmail}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-400 shrink-0" /> {letterData.candidatePhone}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" /> {letterData.candidateLocation}
                      </span>
                      {letterData.candidateLinkedin && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-blue-600">
                            <Linkedin className="w-3 h-3 shrink-0" /> {letterData.candidateLinkedin}
                          </span>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* DATE */}
              <div className="text-xs text-gray-500 font-semibold mb-6">
                {isEditing ? (
                  <input
                    type="text"
                    value={letterData.letterDate}
                    onChange={(e) => updateField('letterDate', e.target.value)}
                    className="text-xs font-semibold text-gray-600 border-b border-dashed border-gray-300 bg-amber-50/40 p-1"
                  />
                ) : (
                  letterData.letterDate
                )}
              </div>

              {/* RECIPIENT */}
              <div className="text-xs text-gray-800 mb-6 space-y-0.5">
                {isEditing ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={letterData.recipientTitle}
                      onChange={(e) => updateField('recipientTitle', e.target.value)}
                      className="w-full text-xs font-medium border-b border-dashed bg-amber-50/40 p-1"
                    />
                    <input
                      type="text"
                      value={letterData.companyName}
                      onChange={(e) => updateField('companyName', e.target.value)}
                      className="w-full text-sm font-bold text-gray-900 border-b border-dashed bg-amber-50/40 p-1"
                    />
                  </div>
                ) : (
                  <>
                    <p className="text-gray-500 font-medium">{letterData.recipientTitle}</p>
                    <p className="font-bold text-gray-950 text-sm">{letterData.companyName}</p>
                  </>
                )}
              </div>

              {/* SUBJECT LINE */}
              <div className="mb-6">
                {isEditing ? (
                  <input
                    type="text"
                    value={letterData.subjectLine}
                    onChange={(e) => updateField('subjectLine', e.target.value)}
                    className="w-full text-sm font-bold text-gray-950 border-b border-dashed bg-amber-50/40 p-1"
                  />
                ) : (
                  <p className="text-sm font-bold text-gray-950 tracking-tight">
                    {letterData.subjectLine}
                  </p>
                )}
              </div>

              {/* SALUTATION */}
              <div className="mb-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={letterData.salutation}
                    onChange={(e) => updateField('salutation', e.target.value)}
                    className="w-full text-xs font-semibold text-gray-900 border-b border-dashed bg-amber-50/40 p-1"
                  />
                ) : (
                  <p className="text-xs font-semibold text-gray-900">
                    {letterData.salutation}
                  </p>
                )}
              </div>

              {/* PARAGRAPH 1: OPENING HOOK */}
              <div className="mb-4">
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={letterData.openingParagraph}
                    onChange={(e) => updateField('openingParagraph', e.target.value)}
                    className="w-full text-xs leading-relaxed text-gray-800 p-2 border border-dashed rounded bg-amber-50/40"
                  />
                ) : (
                  <p className="text-xs sm:text-[13px] leading-relaxed text-gray-800 text-justify">
                    {letterData.openingParagraph}
                  </p>
                )}
              </div>

              {/* PARAGRAPH 2: TECHNICAL EXPERIENCE & SKILLS MATCH */}
              <div className="mb-4">
                {isEditing ? (
                  <textarea
                    rows={4}
                    value={letterData.bodyParagraph1}
                    onChange={(e) => updateField('bodyParagraph1', e.target.value)}
                    className="w-full text-xs leading-relaxed text-gray-800 p-2 border border-dashed rounded bg-amber-50/40"
                  />
                ) : (
                  <p className="text-xs sm:text-[13px] leading-relaxed text-gray-800 text-justify">
                    {letterData.bodyParagraph1}
                  </p>
                )}
              </div>

              {/* PARAGRAPH 3: VALUE PROPOSITION & FIT */}
              <div className="mb-4">
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={letterData.bodyParagraph2}
                    onChange={(e) => updateField('bodyParagraph2', e.target.value)}
                    className="w-full text-xs leading-relaxed text-gray-800 p-2 border border-dashed rounded bg-amber-50/40"
                  />
                ) : (
                  <p className="text-xs sm:text-[13px] leading-relaxed text-gray-800 text-justify">
                    {letterData.bodyParagraph2}
                  </p>
                )}
              </div>

              {/* PARAGRAPH 4: CALL TO ACTION & CLOSING */}
              <div className="mb-6">
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={letterData.closingParagraph}
                    onChange={(e) => updateField('closingParagraph', e.target.value)}
                    className="w-full text-xs leading-relaxed text-gray-800 p-2 border border-dashed rounded bg-amber-50/40"
                  />
                ) : (
                  <p className="text-xs sm:text-[13px] leading-relaxed text-gray-800 text-justify">
                    {letterData.closingParagraph}
                  </p>
                )}
              </div>

              {/* SIGN-OFF & NAME */}
              <div className="mt-8 space-y-1">
                {isEditing ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={letterData.signOff}
                      onChange={(e) => updateField('signOff', e.target.value)}
                      className="text-xs font-semibold text-gray-900 border-b border-dashed bg-amber-50/40 p-1"
                    />
                    <input
                      type="text"
                      value={letterData.candidateName}
                      onChange={(e) => updateField('candidateName', e.target.value)}
                      className="text-sm font-bold text-gray-950 border-b border-dashed bg-amber-50/40 p-1 block"
                    />
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-gray-700">{letterData.signOff}</p>
                    <p className="text-sm font-black text-gray-950 tracking-tight pt-2">
                      {letterData.candidateName}
                    </p>
                  </>
                )}
              </div>

            </div>

          </div>

          {/* HIGHLIGHTED SKILLS TAGS */}
          {letterData.matchedSkills && letterData.matchedSkills.length > 0 && (
            <Card padding="p-4" className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1 mr-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900" />
                Competențe din CV
              </span>
              {letterData.matchedSkills.map((skill, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-800 border border-neutral-200"
                >
                  {skill}
                </span>
              ))}
            </Card>
          )}

        </div>

      </div>

    </div>
  );
}
