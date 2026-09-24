import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { 
  FileSignature, 
  Sparkles, 
  Download, 
  Printer, 
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
  ShieldCheck,
  Eye,
  Info
} from 'lucide-react';

export default function CoverLetterGenerator({ 
  applications = [], 
  currentUser,
  initialApplicationId = null,
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
    candidateName: currentUser?.fullName || 'Mihai Sîrbu',
    candidateEmail: currentUser?.email || 'mihai.sirbu@example.com',
    candidatePhone: '+40 712 345 678',
    candidateLocation: 'București, România',
    candidateLinkedin: 'linkedin.com/in/mihaisirbu',
    companyName: 'Tech Company',
    jobTitle: 'Software Engineer',
    letterDate: '24 Septembrie 2026',
    recipientTitle: 'Echipa de Recrutare',
    subjectLine: 'Candidatură pentru poziția de Software Engineer – Mihai Sîrbu',
    salutation: 'Stimate Manager de Recrutare,',
    openingParagraph: 'Vă adresez această scrisoare cu deosebit interes pentru oportunitatea de a mă alătura echipei dumneavoastră în rolul de Software Engineer. Pasiunea mea pentru scrierea de cod curat, scalabil și performant se aliniază strâns cu obiectivele tehnice ale organizației.',
    bodyParagraph1: 'Având experiență practică în ecosistemul Java, Spring Boot și baze de date relaționale, am dezvoltat și integrat servicii REST robuste capabile să deservească sarcini de producție. Sunt obișnuit să analizez cerințe complexe de business și să le transform în module software sigure, bine testate și documentate.',
    bodyParagraph2: 'Apreciez în mod deosebit accentul pe calitate și inovație din cadrul companiei. Sunt o persoană proactivă, orientată spre învățare continuă și dedicată colaborării eficiente în echipă pentru a atinge cele mai înalte standarde profesionale.',
    closingParagraph: 'Aș fi onorat să discutăm în cadrul unui interviu despre modul în care abilitățile și entuziasmul meu pot contribui la succesul proiectelor dumneavoastră. Vă mulțumesc pentru timpul și atenția acordate.',
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
    if (initialApplicationId && applications.length > 0) {
      setJobMode('saved');
      handleSelectApplication(initialApplicationId);
    }
  }, [initialApplicationId, applications]);

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
      setErrorMessage('Te rugăm să completezi cel puțin Numele Companiei sau Titlul Jobului.');
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
      console.error('Eroare la generarea scrisorii de intenție:', err);
      setErrorMessage('A apărut o problemă la generare. S-a activat modelul determinist de siguranță.');
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
      console.error('Eroare la descărcarea PDF-ului:', err);
      alert('Eroare la descărcarea fișierului PDF.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Native Vector Print (Save as PDF)
  const handlePrint = () => {
    const originalTitle = document.title;
    const candidateClean = (letterData.candidateName || 'Candidat').trim().replace(/\s+/g, '_');
    const companyClean = (letterData.companyName || 'Job').trim().replace(/\s+/g, '_');
    document.title = `Cover_Letter_${candidateClean}_${companyClean}`;
    window.print();
    document.title = originalTitle;
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
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <FileSignature className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Generator Cover Letter <span className="text-blue-600">AI</span>
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Export PDF Instant
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Creează o scrisoare de intenție curată, simplă și orientată pe rezultate, adaptată perfect profilului tău din CV și cerințelor jobului.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {cvList.length > 0 && (
            <div className="text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{cvList.length} CV-uri detectate</span>
            </div>
          )}
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANEL: CONFIGURATION & INPUTS (5 COLS) */}
        <div className="lg:col-span-5 space-y-5">
          
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4">
            
            {/* 1. SELECT CV PROFILE */}
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <User className="w-3.5 h-3.5 text-blue-600" />
                1. Alege CV-ul Sursă
              </label>
              
              {loadingCvList ? (
                <div className="text-xs text-gray-400 py-2 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Se încarcă CV-urile...
                </div>
              ) : cvList.length > 0 ? (
                <div className="space-y-1.5">
                  <select
                    value={selectedCvId}
                    onChange={(e) => handleCvChange(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-none cursor-pointer"
                  >
                    {cvList.map((cv) => (
                      <option key={cv.id} value={cv.id}>
                        {cv.title || 'CV fără titlu'} {cv.isPrimary ? '★ (Principal)' : ''} — {cv.fullName || 'Fără nume'}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Datele de contact și experiența sunt extrase automat din acest profil.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                  Nu ai niciun profil CV salvat încă. Se vor folosi datele prestabilite. Poți configura unul în secțiunea <strong>CV-urile Mele</strong>.
                </div>
              )}
            </div>

            <hr className="border-gray-100" />

            {/* 2. TARGET JOB SELECTION */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                  2. Jobul Țintă
                </label>
                
                {/* MODE TOGGLE */}
                <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setJobMode('saved')}
                    className={`px-2 py-1 text-[11px] font-bold rounded-md transition ${
                      jobMode === 'saved' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Din Tracker
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobMode('manual')}
                    className={`px-2 py-1 text-[11px] font-bold rounded-md transition ${
                      jobMode === 'manual' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Job Personalizat
                  </button>
                </div>
              </div>

              {jobMode === 'saved' && (
                <div className="mb-3">
                  <select
                    value={selectedAppId}
                    onChange={(e) => handleSelectApplication(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition outline-none cursor-pointer"
                  >
                    <option value="">-- Alege o candidatură salvată ({applications.length}) --</option>
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
                  <label className="text-[11px] font-semibold text-gray-600 mb-1 block">Companie</label>
                  <input
                    type="text"
                    placeholder="ex: Google, Endava, Bitdefender..."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 mb-1 block">Titlu Job</label>
                  <input
                    type="text"
                    placeholder="ex: Junior Java Developer..."
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-gray-600">Descriere Job (sau Cerințe)</label>
                  <button
                    type="button"
                    onClick={handlePasteDescription}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <ClipboardPaste className="w-3 h-3" /> Lipește din Clipboard
                  </button>
                </div>
                <textarea
                  rows={4}
                  placeholder="Lipește aici cerințele cheie ale jobului pentru a sincroniza abilitățile din CV cu nevoile angajatorului..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-none resize-none text-gray-800 leading-relaxed font-sans"
                />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* 3. GENERATION PREFERENCES */}
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                <Sliders className="w-3.5 h-3.5 text-purple-600" />
                3. Stil & Opțiuni
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* TONE SELECTION */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 mb-1 block">Ton Scrisoare</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full text-xs font-semibold px-2.5 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition outline-none cursor-pointer"
                  >
                    <option value="SIMPLE_DIRECT">Simplu & Direct (Recomandat)</option>
                    <option value="PROFESSIONAL">Clasic & Profesional</option>
                    <option value="MODERN_TECH">Modern & Tehnologic</option>
                  </select>
                </div>

                {/* LANGUAGE SELECTION */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 mb-1 block flex items-center gap-1">
                    <Languages className="w-3 h-3 text-gray-500" /> Limbă
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full text-xs font-semibold px-2.5 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition outline-none cursor-pointer"
                  >
                    <option value="RO">Română (RO)</option>
                    <option value="EN">English (EN)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ERROR MESSAGE IF ANY */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* GENERATE BUTTON */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
                generating 
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                  : 'bg-black hover:bg-neutral-800 text-white hover:shadow-lg'
              }`}
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                  <span>Se generează scrisoarea cu AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Generează Scrisoare de Intenție</span>
                </>
              )}
            </button>

          </div>

          {/* TIPS CARD */}
          <div className="bg-blue-50/60 rounded-2xl border border-blue-100 p-4 text-xs text-blue-900 space-y-2">
            <h4 className="font-bold flex items-center gap-1.5 text-blue-950">
              <ShieldCheck className="w-4 h-4 text-blue-600" /> De ce o scrisoare de intenție simplă?
            </h4>
            <p className="text-[11px] leading-relaxed text-blue-800">
              Recruiterii alocă mai puțin de <strong>30 de secunde</strong> unei scrisori. O scrisoare simplă, concisă (sub 250 de cuvinte), axată direct pe tehnologiile cerute și valoarea adusă, are o rată de citire și succes cu până la <strong>40% mai mare</strong> decât textele lungi și stufoase.
            </p>
          </div>

        </div>

        {/* RIGHT PANEL: A4 LIVE DOCUMENT & PDF EXPORT (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* TOOLBAR */}
          <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border cursor-pointer ${
                  isEditing 
                    ? 'bg-amber-500 text-white border-amber-600' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                }`}
              >
                {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                {isEditing ? 'Previzualizează' : 'Editează Direct'}
              </button>

              <button
                type="button"
                onClick={handleCopyText}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 flex items-center gap-1.5 transition cursor-pointer"
                title="Copiază textul scrisorii"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiat!' : 'Copiază Text'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 flex items-center gap-1.5 transition cursor-pointer"
                title="Printează sau salvează ca PDF vectorial din browser"
              >
                <Printer className="w-3.5 h-3.5 text-gray-600" />
                <span>Printează</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition cursor-pointer shadow-sm hover:shadow"
              >
                {isDownloadingPdf ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{isDownloadingPdf ? 'Se generează...' : 'Descarcă PDF'}</span>
              </button>
            </div>
          </div>

          {/* REALISTIC A4 PREVIEW CONTAINER */}
          <div className="bg-gray-200/70 p-4 sm:p-8 rounded-2xl border border-gray-300 flex justify-center overflow-x-auto">
            
            {/* A4 PAPER SHEET */}
            <div
              id="cover-letter-paper"
              ref={letterPaperRef}
              className="bg-white w-full max-w-[750px] min-h-[960px] p-8 sm:p-12 shadow-xl border border-gray-300 text-gray-900 font-sans leading-relaxed selection:bg-blue-100 selection:text-blue-900 transition-all"
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
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 mr-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Competențe corelate din CV:
              </span>
              {letterData.matchedSkills.map((skill, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
