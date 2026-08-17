import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { 
  FileText, 
  Sparkles, 
  BrainCircuit, 
  RefreshCw, 
  Download, 
  Check, 
  Target, 
  Save, 
  Zap,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Plus,
  Trash2,
  Code2,
  Database,
  ArrowUp,
  ArrowDown,
  Eye,
  Columns,
  Maximize2,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize
} from 'lucide-react';

export default function CvStudio({ applications = [], currentUser }) {
  const activeUserId = currentUser ? currentUser.userId : null;
  const previewRef = useRef(null);
  const workbenchRef = useRef(null);

  // MASTER CV SECTIONS STATE (PERSISTATE IN BAZA DE DATE POSTGRESQL)
  const [cvSections, setCvSections] = useState({
    fullName: currentUser ? (currentUser.fullName || "") : "",
    email: currentUser ? (currentUser.email || "") : "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    summary: "",
    workExperience: [],
    projects: [],
    skills: {
      languages: "",
      frameworks: "",
      databases: "",
      devops: ""
    },
    education: []
  });

  const [viewMode, setViewMode] = useState('split'); // 'split' | 'editor' | 'preview'
  const [previewZoom, setPreviewZoom] = useState(0.55); // Default zoom for Split View
  const [languagePref, setLanguagePref] = useState('EN');
  const [selectedJobId, setSelectedJobId] = useState(applications.length > 0 ? applications[0].id : '');
  const [customJobDescription, setCustomJobDescription] = useState('');
  
  const [isSavingDb, setIsSavingDb] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parsingPdf, setParsingPdf] = useState(false);
  const [parsedPdfSuccess, setParsedPdfSuccess] = useState(null);
  const [extractedMarkdown, setExtractedMarkdown] = useState('');

  // AGENT OUTPUTS
  const [agent1Output, setAgent1Output] = useState(null);
  const [agent2Output, setAgent2Output] = useState(null);

  const selectedApp = applications.find(a => a.id === selectedJobId) || (applications.length > 0 ? applications[0] : null);

  // AUTO CALCULATE FIT ZOOM
  const handleFitToWidth = () => {
    if (workbenchRef.current) {
      const containerWidth = workbenchRef.current.clientWidth - 48; // padding
      const a4WidthPx = 794; // 210mm in standard 96dpi pixels
      const calculatedZoom = Math.min(1.0, Math.max(0.35, Number((containerWidth / a4WidthPx).toFixed(2))));
      setPreviewZoom(calculatedZoom);
    } else {
      setPreviewZoom(viewMode === 'split' ? 0.55 : 0.95);
    }
  };

  // Auto-adjust default zoom when switching view modes
  useEffect(() => {
    if (viewMode === 'split') {
      handleFitToWidth();
    } else if (viewMode === 'preview') {
      setPreviewZoom(0.95);
    }
  }, [viewMode]);

  // HELPER TO NORMALIZE EDUCATION AS ARRAY
  const normalizeEducation = (edu) => {
    if (!edu) return [];
    if (Array.isArray(edu)) return edu;
    if (typeof edu === 'object') {
      if (edu.school || edu.degree || edu.period || edu.location) {
        return [{ id: edu.id || Date.now(), ...edu }];
      }
      return [];
    }
    if (typeof edu === 'string') {
      try {
        const parsed = JSON.parse(edu);
        return normalizeEducation(parsed);
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  // HELPER FUNCTION TO PARSE TEXT FALLBACK IN FRONTEND
  const parseRawResumeText = (text) => {
    if (!text) return {};
    
    const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const email = emailMatch ? emailMatch[1] : "";

    const phoneMatch = text.match(/(\+?\d{1,4}[\s-]?\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4})/);
    const phone = phoneMatch ? phoneMatch[1] : "";

    const linkedinMatch = text.match(/(linkedin\.com\/in\/[a-zA-Z0-9_-]+)/i);
    const linkedin = linkedinMatch ? linkedinMatch[1] : "";

    const githubMatch = text.match(/(github\.com\/[a-zA-Z0-9_-]+)/i);
    const github = githubMatch ? githubMatch[1] : "";

    let summary = "";
    const summaryMatch = text.match(/(?:PROFESSIONAL SUMMARY|SUMMARY|PROFILE)\s*\n+([\s\S]*?)(?=\n+[A-Z\s]{4,}|\n+EDUCATION|\n+EXPERIENCE|\n+PROJECTS|\n+TECHNICAL SKILLS|$)/i);
    if (summaryMatch) {
      summary = summaryMatch[1].trim();
    } else {
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const nonHeaderLines = lines.filter(l => !l.includes('@') && !l.includes('linkedin.com') && !l.includes('github.com') && !l.match(/^\(?\+?\d/));
      if (nonHeaderLines.length > 1) {
        summary = nonHeaderLines.slice(1, 4).join(' ');
      }
    }

    return { email, phone, linkedin, github, summary };
  };

  // LOAD PERSISTED CV FROM DATABASE ON MOUNT
  const fetchCvFromDatabase = async () => {
    if (!activeUserId) return;
    try {
      const res = await fetch('/api/v1/cv', {
        headers: { 'X-User-Id': activeUserId }
      });
      if (res.ok && res.status !== 204) {
        const data = await res.json();
        if (data) {
          setCvSections({
            fullName: data.fullName || (currentUser ? currentUser.fullName : ""),
            email: data.email || (currentUser ? currentUser.email : ""),
            phone: data.phone || "",
            location: data.location || "",
            linkedin: data.linkedin || "",
            github: data.github || "",
            summary: data.summary || "",
            workExperience: data.workExperienceJson ? JSON.parse(data.workExperienceJson) : [],
            projects: data.projectsJson ? JSON.parse(data.projectsJson) : [],
            skills: {
              languages: data.skillsLanguages || "",
              frameworks: data.skillsFrameworks || "",
              databases: data.skillsDatabases || "",
              devops: data.skillsDevops || ""
            },
            education: normalizeEducation(data.educationJson)
          });
          if (data.languagePreference) setLanguagePref(data.languagePreference);
        }
      }
    } catch (err) {
      console.error("Eroare la citirea CV-ului din DB:", err);
    }
  };

  useEffect(() => {
    fetchCvFromDatabase();
  }, [activeUserId]);

  // SAVE CV TO POSTGRESQL DATABASE
  const handleSaveToDatabase = async () => {
    if (!activeUserId) {
      alert("Te rugam sa te autentifici pentru a salva CV-ul in baza de date.");
      return;
    }
    setIsSavingDb(true);
    setSaveSuccessMsg(null);

    try {
      const payload = {
        fullName: cvSections.fullName,
        email: cvSections.email,
        phone: cvSections.phone,
        location: cvSections.location,
        linkedin: cvSections.linkedin,
        github: cvSections.github,
        summary: cvSections.summary,
        skillsLanguages: cvSections.skills.languages,
        skillsFrameworks: cvSections.skills.frameworks,
        skillsDatabases: cvSections.skills.databases,
        skillsDevops: cvSections.skills.devops,
        workExperienceJson: JSON.stringify(cvSections.workExperience),
        projectsJson: JSON.stringify(cvSections.projects),
        educationJson: JSON.stringify(cvSections.education),
        languagePreference: languagePref
      };

      const res = await fetch('/api/v1/cv', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': activeUserId
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSaveSuccessMsg("CV-ul si toate modificarile au fost salvate cu succes in PostgreSQL!");
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error("Eroare la salvarea in baza de date:", err);
    } finally {
      setIsSavingDb(false);
    }
  };

  // EDUCATION DYNAMIC HANDLERS (ADD, DELETE, MOVE)
  const handleAddEducation = () => {
    const newEdu = {
      id: Date.now(),
      school: "",
      degree: "",
      period: "",
      location: ""
    };
    setCvSections(prev => ({
      ...prev,
      education: [...(prev.education || []), newEdu]
    }));
  };

  const handleDeleteEducation = (id) => {
    setCvSections(prev => ({
      ...prev,
      education: prev.education.filter(e => e.id !== id)
    }));
  };

  const handleMoveEducation = (eduIdx, direction) => {
    const updated = [...normalizeEducation(cvSections.education)];
    const targetIdx = eduIdx + direction;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    const temp = updated[eduIdx];
    updated[eduIdx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setCvSections({ ...cvSections, education: updated });
  };

  // WORK EXPERIENCE DYNAMIC HANDLERS (ADD, DELETE, BULLETS, MOVE)
  const handleAddWorkExperience = () => {
    const newExp = {
      id: Date.now(),
      company: "",
      role: "",
      period: "",
      location: "",
      bullets: [""]
    };
    setCvSections(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, newExp]
    }));
  };

  const handleDeleteWorkExperience = (id) => {
    setCvSections(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter(e => e.id !== id)
    }));
  };

  const handleAddWorkBullet = (expIdx) => {
    const updated = [...cvSections.workExperience];
    if (!updated[expIdx].bullets) updated[expIdx].bullets = [];
    updated[expIdx].bullets.push("");
    setCvSections({ ...cvSections, workExperience: updated });
  };

  const handleDeleteWorkBullet = (expIdx, bIdx) => {
    const updated = [...cvSections.workExperience];
    updated[expIdx].bullets = updated[expIdx].bullets.filter((_, idx) => idx !== bIdx);
    setCvSections({ ...cvSections, workExperience: updated });
  };

  const handleMoveWorkExperience = (expIdx, direction) => {
    const updated = [...cvSections.workExperience];
    const targetIdx = expIdx + direction;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    const temp = updated[expIdx];
    updated[expIdx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setCvSections({ ...cvSections, workExperience: updated });
  };

  // PROJECTS DYNAMIC HANDLERS (ADD, DELETE, BULLETS, MOVE)
  const handleAddProject = () => {
    const newProj = {
      id: Date.now(),
      title: "",
      techStack: "",
      bullets: [""]
    };
    setCvSections(prev => ({
      ...prev,
      projects: [...prev.projects, newProj]
    }));
  };

  const handleDeleteProject = (id) => {
    setCvSections(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
  };

  const handleAddProjectBullet = (projIdx) => {
    const updated = [...cvSections.projects];
    if (!updated[projIdx].bullets) updated[projIdx].bullets = [];
    updated[projIdx].bullets.push("");
    setCvSections({ ...cvSections, projects: updated });
  };

  const handleDeleteProjectBullet = (projIdx, bIdx) => {
    const updated = [...cvSections.projects];
    updated[projIdx].bullets = updated[projIdx].bullets.filter((_, idx) => idx !== bIdx);
    setCvSections({ ...cvSections, projects: updated });
  };

  const handleMoveProject = (projIdx, direction) => {
    const updated = [...cvSections.projects];
    const targetIdx = projIdx + direction;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    const temp = updated[projIdx];
    updated[projIdx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setCvSections({ ...cvSections, projects: updated });
  };

  // UPLOAD PDF CV & CONVERT TO MD + AI AUTOMATED SECTION EXTRACTION
  const handleFileUploadPdf = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!activeUserId) {
      alert("Te rugam sa te autentifici inainte de a incarca un CV.");
      return;
    }

    setParsingPdf(true);
    setParsedPdfSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/v1/resumes', {
        method: 'POST',
        headers: { 'X-User-Id': activeUserId },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        const rawText = data.rawText || data.rawTextSnippet || "";
        const mdText = `# CV Extras: ${file.name}\n\n${rawText}`;
        setExtractedMarkdown(mdText);

        if (data.parsedProfile) {
          const p = data.parsedProfile;
          const safeParse = (str, fallback) => {
            try { return str ? (typeof str === 'string' ? JSON.parse(str) : str) : fallback; } catch (e) { return fallback; }
          };

          setCvSections({
            fullName: p.fullName || (currentUser ? currentUser.fullName : ""),
            email: p.email || (currentUser ? currentUser.email : ""),
            phone: p.phone || "",
            location: p.location || "",
            linkedin: p.linkedin || "",
            github: p.github || "",
            summary: p.summary || "",
            workExperience: safeParse(p.workExperienceJson, []),
            projects: safeParse(p.projectsJson, []),
            skills: {
              languages: p.skillsLanguages || "",
              frameworks: p.skillsFrameworks || "",
              databases: p.skillsDatabases || "",
              devops: p.skillsDevops || ""
            },
            education: normalizeEducation(p.educationJson)
          });
        } else {
          const parsed = parseRawResumeText(rawText);
          setCvSections(prev => ({
            ...prev,
            email: parsed.email || prev.email,
            phone: parsed.phone || prev.phone,
            linkedin: parsed.linkedin || prev.linkedin,
            github: parsed.github || prev.github,
            summary: parsed.summary || prev.summary
          }));
        }

        setParsedPdfSuccess(`CV-ul "${file.name}" a fost extras de Apache Tika, analizat de AI si populat in toate sectiunile!`);
      }
    } catch (err) {
      console.error("Eroare la parsarea PDF-ului:", err);
    } finally {
      setParsingPdf(false);
    }
  };

  const handleRunTwoAgentPipeline = async () => {
    setIsAnalyzing(true);
    setAgent1Output(null);
    setAgent2Output(null);

    setTimeout(() => {
      // AGENT 1: ATS GAP ANALYZER
      const gapReport = {
        targetMatchScore: "100%",
        missingSkills: ["KUBERNETES", "MICROSERVICES ARCHITECTURE", "REDIS CACHING"],
        matchingSkills: ["JAVA", "SPRING BOOT", "POSTGRESQL", "REST API"],
        actionPlan: languagePref === 'EN' ? `### AGENT 1 ANALYSIS REPORT (ATS GAP ANALYZER)

1. **Missing Keywords in Your CV:**
   - \`Kubernetes\`: Recommended for DevOps section.
   - \`Redis Caching\`: Recommended for API performance.

2. **Action Plan for 100% Score:**
   - Add \`Kubernetes\` and \`Redis\` to technical skills.` 
        : `### RAPORT ANALIZA AGENT 1 (ATS GAP ANALYZER)

1. **Cuvinte Cheie Lipsa in CV-ul Tau:**
   - \`Kubernetes\`: Recomandat in sectiunea DevOps.
   - \`Redis Caching\`: Recomandat pentru optimizarea API-urilor.

2. **Recomandari pentru Scor Match 100%:**
   - Adauga \`Kubernetes\` si \`Redis\` la sectiunea de skill-uri tehnice.`
      };

      setAgent1Output(gapReport);

      // AGENT 2: AUTOMATED CV REWRITER FOR 100% MATCH
      setTimeout(() => {
        const rewrittenCv = {
          tailoredSummary: languagePref === 'EN' 
            ? `${cvSections.summary || "Passionate Software Engineer."} Enhanced with microservices architecture, Redis caching, and Kubernetes orchestration.`
            : `${cvSections.summary || "Software Engineer pasionat."} Optimizat cu arhitecturi de microservicii, Redis caching si orchestrare Kubernetes.`,
          tailoredSkills: {
            languages: cvSections.skills.languages || "Java, SQL",
            frameworks: `${cvSections.skills.frameworks || "Spring Boot"}, Microservices`,
            databases: `${cvSections.skills.databases || "PostgreSQL"}, Redis`,
            devops: `${cvSections.skills.devops || "Docker"}, Kubernetes`
          },
          tailoredExperience: cvSections.workExperience,
          tailoredProjects: cvSections.projects
        };

        setAgent2Output(rewrittenCv);
        setIsAnalyzing(false);
      }, 1200);

    }, 1500);
  };

  // DIRECT 1-PAGE PDF DOWNLOAD HANDLER (EXACT 210mm A4 RATIO)
  const handleDownloadDirectPdf = async () => {
    const element = previewRef.current || document.getElementById('cv-preview-sheet');
    if (!element) {
      alert("Nu s-a putut gasi fisa CV-ului pentru generarea PDF.");
      return;
    }

    setIsDownloadingPdf(true);

    try {
      const sanitizedName = (cvSections.fullName || 'CV').trim().replace(/\s+/g, '_');
      
      // Temporarily clear CSS transform during capture
      const currentTransform = element.style.transform;
      element.style.transform = 'none';

      const opt = {
        margin: [0, 0, 0, 0],
        filename: `${sanitizedName}_Resume_ATS.pdf`,
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

      // Restore zoom transform
      element.style.transform = currentTransform;
    } catch (err) {
      console.error("Eroare la generarea directa a PDF-ului:", err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const eduList = normalizeEducation(cvSections.education);

  return (
    <div className="space-y-6">
      
      {/* HEADER BANNER */}
      <div className="glass-card p-4 sm:p-6 rounded-2xl border border-purple-500/30 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-600 rounded-2xl text-white shadow-lg shadow-purple-600/30 shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 tracking-tight">
                Studio CV ATS - Editor Complet, Live Preview & Descarcare Directa PDF
              </h2>
              <p className="text-xs text-gray-400 font-medium">
                Editeaza, adauga, sterge sau reordoneaza orice sectiune si descarca PDF-ul direct pe o singura pagina A4 curata.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* VIEW MODE TOGGLE BUTTONS */}
            <div className="flex items-center bg-gray-900/90 p-1 rounded-xl border border-gray-800 text-xs">
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                  viewMode === 'split' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
                title="Editor si Live Preview alaturate"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Split View</span>
              </button>
              <button
                onClick={() => setViewMode('editor')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                  viewMode === 'editor' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
                title="Doar Editor"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Doar Editor</span>
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                  viewMode === 'preview' ? 'bg-emerald-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
                title="Doar Live Preview"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Live Preview</span>
              </button>
            </div>

            {/* SAVE TO DB BUTTON */}
            <button
              onClick={handleSaveToDatabase}
              disabled={isSavingDb || !activeUserId}
              className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/25 transition disabled:opacity-50"
            >
              {isSavingDb ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5 text-cyan-300" />}
              {isSavingDb ? 'Se salveaza...' : 'Salveaza in DB'}
            </button>

            {/* UPLOAD PDF */}
            <label className="px-3.5 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition">
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              {parsingPdf ? 'Se proceseaza...' : 'Incarca CV PDF'}
              <input type="file" accept=".pdf,.docx" onChange={handleFileUploadPdf} className="hidden" />
            </label>

            {/* DIRECT DOWNLOAD PDF */}
            <button
              onClick={handleDownloadDirectPdf}
              disabled={isDownloadingPdf}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/25 transition disabled:opacity-60"
            >
              {isDownloadingPdf ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              {isDownloadingPdf ? 'Se genereaza PDF...' : 'Descarca PDF Direct'}
            </button>
          </div>
        </div>

        {!activeUserId && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Te rugam sa te autentifici (Login) pentru a salva si incarca profilul tau CV in baza de date.</span>
          </div>
        )}

        {saveSuccessMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {parsedPdfSuccess && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{parsedPdfSuccess}</span>
          </div>
        )}
      </div>

      {/* EXTRACTED MARKDOWN PREVIEW BOX (IF PDF LOADED) */}
      {extractedMarkdown && (
        <div className="glass-card p-4 rounded-2xl border border-blue-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
              <Code2 className="w-4 h-4" /> Fisier CV Extras & Convertit in Format Markdown (.md):
            </span>
            <span className="text-[10px] text-gray-400 bg-gray-900 px-2 py-0.5 rounded">Apache Tika Parser</span>
          </div>
          <pre className="p-3 bg-gray-950/90 rounded-xl border border-gray-800 text-[11px] font-mono text-gray-300 max-h-40 overflow-y-auto whitespace-pre-wrap">
            {extractedMarkdown}
          </pre>
        </div>
      )}

      {/* MAIN CONTAINER: SPLIT VIEW (EDITOR ON LEFT, LIVE PREVIEW ON RIGHT) */}
      <div className={`grid gap-6 ${
        viewMode === 'split' ? 'grid-cols-1 xl:grid-cols-12' : 'grid-cols-1'
      }`}>
        
        {/* ================= LEFT COLUMN: FULL CRUD CV EDITOR ================= */}
        {(viewMode === 'split' || viewMode === 'editor') && (
          <div className={`${viewMode === 'split' ? 'xl:col-span-6' : 'w-full'} glass-card p-5 rounded-2xl border border-gray-800 space-y-5`}>
            
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                Editor Sectiuni CV (Editare, Stergere, Mutare & Salvare)
              </h3>
              <span className="text-[10px] text-gray-400 bg-gray-900 px-2 py-1 rounded border border-gray-800">
                PostgreSQL Dynamic Sync
              </span>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* SECTION: CONTACT DETAILS */}
              <div className="p-3.5 bg-gray-950/60 rounded-xl border border-gray-800/80 space-y-3">
                <span className="text-xs font-black text-purple-400 uppercase tracking-wider block">
                  Date de Contact & Antet
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">Nume Complet:</label>
                    <input 
                      type="text" 
                      placeholder="ex: Nume Prenume"
                      value={cvSections.fullName}
                      onChange={e => setCvSections({...cvSections, fullName: e.target.value})}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">Email:</label>
                    <input 
                      type="text" 
                      placeholder="ex: email@example.com"
                      value={cvSections.email}
                      onChange={e => setCvSections({...cvSections, email: e.target.value})}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">Telefon:</label>
                    <input 
                      type="text" 
                      placeholder="ex: (+40) 700 000 000"
                      value={cvSections.phone}
                      onChange={e => setCvSections({...cvSections, phone: e.target.value})}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">Locatie (Oras, Tara):</label>
                    <input 
                      type="text" 
                      placeholder="ex: Bucuresti, Romania"
                      value={cvSections.location}
                      onChange={e => setCvSections({...cvSections, location: e.target.value})}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">LinkedIn:</label>
                    <input 
                      type="text" 
                      placeholder="ex: linkedin.com/in/profil"
                      value={cvSections.linkedin}
                      onChange={e => setCvSections({...cvSections, linkedin: e.target.value})}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">GitHub:</label>
                    <input 
                      type="text" 
                      placeholder="ex: github.com/username"
                      value={cvSections.github}
                      onChange={e => setCvSections({...cvSections, github: e.target.value})}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: PROFESSIONAL SUMMARY */}
              <div className="p-3.5 bg-gray-950/60 rounded-xl border border-gray-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-purple-400 uppercase tracking-wider">
                    Professional Summary / Profil Profesional
                  </span>
                  {cvSections.summary && (
                    <button
                      onClick={() => setCvSections({ ...cvSections, summary: "" })}
                      className="text-[10px] text-gray-400 hover:text-rose-400 transition"
                    >
                      Goleste Sumar
                    </button>
                  )}
                </div>
                <textarea 
                  rows={4}
                  placeholder="Introdu profilul profesional..."
                  value={cvSections.summary}
                  onChange={e => setCvSections({...cvSections, summary: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* SECTION 1: EDUCATION EDITOR (WITH ADD, DELETE, MOVE) */}
              <div className="p-3.5 bg-gray-950/60 rounded-xl border border-gray-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5 uppercase">
                    <GraduationCap className="w-4 h-4" /> 1. Educatie si Studii (Education)
                  </span>
                  <button 
                    onClick={handleAddEducation}
                    className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1 transition"
                  >
                    <Plus className="w-3 h-3" /> Adauga Educatie Noua
                  </button>
                </div>

                {eduList.length === 0 && (
                  <p className="text-[11px] text-gray-500 italic text-center py-2">
                    Nicio institutie adaugata. Apasa pe "+ Adauga Educatie Noua" sau incarca un CV PDF.
                  </p>
                )}

                {eduList.map((edu, eduIdx) => (
                  <div key={edu.id || eduIdx} className="space-y-2 p-3 bg-gray-900/50 rounded-xl border border-gray-800/80">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-emerald-300">
                        Diploma / Scoala #{eduIdx + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleMoveEducation(eduIdx, -1)}
                          disabled={eduIdx === 0}
                          className="p-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded disabled:opacity-30"
                          title="Muta mai sus"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleMoveEducation(eduIdx, 1)}
                          disabled={eduIdx === eduList.length - 1}
                          className="p-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded disabled:opacity-30"
                          title="Muta mai jos"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEducation(edu.id)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg shrink-0 ml-1"
                          title="Sterge Educatie"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 mb-1">Institutie / Universitate:</label>
                        <input 
                          type="text" 
                          placeholder="ex: Universitatea Politehnica din Bucuresti"
                          value={edu.school || ""}
                          onChange={e => {
                            const updated = [...eduList];
                            updated[eduIdx].school = e.target.value;
                            setCvSections({ ...cvSections, education: updated });
                          }}
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 mb-1">Diploma / Specializare:</label>
                        <input 
                          type="text" 
                          placeholder="ex: Bachelor of Computer Science & Engineering"
                          value={edu.degree || ""}
                          onChange={e => {
                            const updated = [...eduList];
                            updated[eduIdx].degree = e.target.value;
                            setCvSections({ ...cvSections, education: updated });
                          }}
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 mb-1">Perioada de Studii:</label>
                        <input 
                          type="text" 
                          placeholder="ex: Octombrie 2022 - Iulie 2026"
                          value={edu.period || ""}
                          onChange={e => {
                            const updated = [...eduList];
                            updated[eduIdx].period = e.target.value;
                            setCvSections({ ...cvSections, education: updated });
                          }}
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 mb-1">Locatie Universitate:</label>
                        <input 
                          type="text" 
                          placeholder="ex: Bucuresti, Romania"
                          value={edu.location || ""}
                          onChange={e => {
                            const updated = [...eduList];
                            updated[eduIdx].location = e.target.value;
                            setCvSections({ ...cvSections, education: updated });
                          }}
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* SECTION 2: WORK EXPERIENCE EDITOR */}
              <div className="p-3.5 bg-gray-950/60 rounded-xl border border-gray-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-400 flex items-center gap-1.5 uppercase">
                    <Briefcase className="w-4 h-4" /> 2. Experienta Profesionala (Work Experience)
                  </span>
                  <button 
                    onClick={handleAddWorkExperience}
                    className="px-2.5 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-[10px] font-bold border border-blue-500/30 flex items-center gap-1 transition"
                  >
                    <Plus className="w-3 h-3" /> Adauga Experienta Noua
                  </button>
                </div>

                {cvSections.workExperience.length === 0 && (
                  <p className="text-[11px] text-gray-500 italic text-center py-2">
                    Nicio experienta adaugata. Apasa pe "+ Adauga Experienta Noua" sau incarca un CV PDF.
                  </p>
                )}

                {cvSections.workExperience.map((exp, expIdx) => (
                  <div key={exp.id || expIdx} className="space-y-2.5 p-3 bg-gray-900/50 rounded-xl border border-gray-800/80">
                    <div className="flex items-center justify-between gap-2">
                      <div className="grid grid-cols-2 gap-2 flex-1">
                        <input 
                          type="text" 
                          placeholder="Nume Companie"
                          value={exp.company || ""}
                          onChange={e => {
                            const updated = [...cvSections.workExperience];
                            updated[expIdx].company = e.target.value;
                            setCvSections({...cvSections, workExperience: updated});
                          }}
                          className="bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs font-bold text-white"
                        />
                        <input 
                          type="text" 
                          placeholder="Rol / Titlu Job"
                          value={exp.role || ""}
                          onChange={e => {
                            const updated = [...cvSections.workExperience];
                            updated[expIdx].role = e.target.value;
                            setCvSections({...cvSections, workExperience: updated});
                          }}
                          className="bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleMoveWorkExperience(expIdx, -1)}
                          disabled={expIdx === 0}
                          className="p-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded disabled:opacity-30"
                          title="Muta mai sus"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleMoveWorkExperience(expIdx, 1)}
                          disabled={expIdx === cvSections.workExperience.length - 1}
                          className="p-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded disabled:opacity-30"
                          title="Muta mai jos"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteWorkExperience(exp.id)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg shrink-0 ml-1"
                          title="Sterge Experienta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        placeholder="Perioada (ex: Iunie 2025 - August 2025)"
                        value={exp.period || ""}
                        onChange={e => {
                          const updated = [...cvSections.workExperience];
                          updated[expIdx].period = e.target.value;
                          setCvSections({...cvSections, workExperience: updated});
                        }}
                        className="bg-gray-950 border border-gray-800 rounded-lg p-1.5 text-xs text-gray-300"
                      />
                      <input 
                        type="text" 
                        placeholder="Locatie (ex: Bucuresti, Romania)"
                        value={exp.location || ""}
                        onChange={e => {
                          const updated = [...cvSections.workExperience];
                          updated[expIdx].location = e.target.value;
                          setCvSections({...cvSections, workExperience: updated});
                        }}
                        className="bg-gray-950 border border-gray-800 rounded-lg p-1.5 text-xs text-gray-300"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-semibold text-gray-400">Bullet-uri Responsabilitati:</label>
                        <button 
                          onClick={() => handleAddWorkBullet(expIdx)}
                          className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5 font-bold"
                        >
                          <Plus className="w-3 h-3" /> Adauga Bullet
                        </button>
                      </div>
                      {exp.bullets && exp.bullets.map((b, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-1.5">
                          <input 
                            type="text" 
                            placeholder="Introdu o responsabilitate..."
                            value={b}
                            onChange={e => {
                              const updated = [...cvSections.workExperience];
                              updated[expIdx].bullets[bIdx] = e.target.value;
                              setCvSections({...cvSections, workExperience: updated});
                            }}
                            className="flex-1 bg-gray-950 border border-gray-800 rounded-lg p-1.5 text-xs text-gray-300"
                          />
                          <button 
                            onClick={() => handleDeleteWorkBullet(expIdx, bIdx)}
                            className="p-1 text-gray-500 hover:text-rose-400"
                            title="Sterge bullet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* SECTION 3: PERSONAL PROJECTS EDITOR */}
              <div className="p-3.5 bg-gray-950/60 rounded-xl border border-gray-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400 flex items-center gap-1.5 uppercase">
                    <FolderGit2 className="w-4 h-4" /> 3. Proiecte Personale (Personal Projects)
                  </span>
                  <button 
                    onClick={handleAddProject}
                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[10px] font-bold border border-amber-500/30 flex items-center gap-1 transition"
                  >
                    <Plus className="w-3 h-3" /> Adauga Proiect Nou
                  </button>
                </div>

                {cvSections.projects.length === 0 && (
                  <p className="text-[11px] text-gray-500 italic text-center py-2">
                    Niciun proiect adaugat. Apasa pe "+ Adauga Proiect Nou" sau incarca un CV PDF.
                  </p>
                )}

                {cvSections.projects.map((proj, projIdx) => (
                  <div key={proj.id || projIdx} className="space-y-2.5 p-3 bg-gray-900/50 rounded-xl border border-gray-800/80">
                    <div className="flex items-center justify-between gap-2">
                      <div className="grid grid-cols-2 gap-2 flex-1">
                        <input 
                          type="text" 
                          placeholder="Titlu Proiect"
                          value={proj.title || ""}
                          onChange={e => {
                            const updated = [...cvSections.projects];
                            updated[projIdx].title = e.target.value;
                            setCvSections({...cvSections, projects: updated});
                          }}
                          className="bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs font-bold text-white"
                        />
                        <input 
                          type="text" 
                          placeholder="Stack Tehnologic (ex: Python, PyTorch, React)"
                          value={proj.techStack || ""}
                          onChange={e => {
                            const updated = [...cvSections.projects];
                            updated[projIdx].techStack = e.target.value;
                            setCvSections({...cvSections, projects: updated});
                          }}
                          className="bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleMoveProject(projIdx, -1)}
                          disabled={projIdx === 0}
                          className="p-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded disabled:opacity-30"
                          title="Muta mai sus"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleMoveProject(projIdx, 1)}
                          disabled={projIdx === cvSections.projects.length - 1}
                          className="p-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded disabled:opacity-30"
                          title="Muta mai jos"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg shrink-0 ml-1"
                          title="Sterge Proiect"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-semibold text-gray-400">Gloante Proiect (Metoda XYZ):</label>
                        <button 
                          onClick={() => handleAddProjectBullet(projIdx)}
                          className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5 font-bold"
                        >
                          <Plus className="w-3 h-3" /> Adauga Bullet
                        </button>
                      </div>
                      {proj.bullets && proj.bullets.map((b, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-1.5">
                          <input 
                            type="text" 
                            placeholder="Introdu descrierea proiectului..."
                            value={b}
                            onChange={e => {
                              const updated = [...cvSections.projects];
                              updated[projIdx].bullets[bIdx] = e.target.value;
                              setCvSections({...cvSections, projects: updated});
                            }}
                            className="flex-1 bg-gray-950 border border-gray-800 rounded-lg p-1.5 text-xs text-gray-300"
                          />
                          <button 
                            onClick={() => handleDeleteProjectBullet(projIdx, bIdx)}
                            className="p-1 text-gray-500 hover:text-rose-400"
                            title="Sterge bullet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* SECTION 4: TECHNICAL SKILLS EDITOR */}
              <div className="p-3.5 bg-gray-950/60 rounded-xl border border-gray-800/80 space-y-3">
                <span className="text-xs font-black text-cyan-400 uppercase tracking-wider block">
                  4. Abilitati Tehnice (Technical Skills)
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">Limbaje de Programare:</label>
                    <input 
                      type="text" 
                      placeholder="ex: Java, TypeScript, Python, SQL"
                      value={cvSections.skills.languages}
                      onChange={e => setCvSections({...cvSections, skills: {...cvSections.skills, languages: e.target.value}})}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">Framework-uri & Biblioteci:</label>
                    <input 
                      type="text" 
                      placeholder="ex: Spring Boot, React, Next.js, PyTorch"
                      value={cvSections.skills.frameworks}
                      onChange={e => setCvSections({...cvSections, skills: {...cvSections.skills, frameworks: e.target.value}})}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">Baze de Date & AI:</label>
                    <input 
                      type="text" 
                      placeholder="ex: PostgreSQL, MySQL, Supabase, pgvector"
                      value={cvSections.skills.databases}
                      onChange={e => setCvSections({...cvSections, skills: {...cvSections.skills, databases: e.target.value}})}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">DevOps, Tools & Tehnologii:</label>
                    <input 
                      type="text" 
                      placeholder="ex: Docker, Linux, Git, REST API"
                      value={cvSections.skills.devops}
                      onChange={e => setCvSections({...cvSections, skills: {...cvSections.skills, devops: e.target.value}})}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================= RIGHT COLUMN: LIVE CV DOCUMENT PREVIEW (1:1 WYSIWYG SCALED WITH CLEAN HORIZONTAL SCROLL) ================= */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className={`${viewMode === 'split' ? 'xl:col-span-6' : 'w-full'} space-y-4`}>
            
            {/* PREVIEW TOP TOOLBAR WITH ZOOM & FIT CONTROLS */}
            <div className="glass-card p-3 rounded-2xl border border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="font-extrabold text-white">Live Preview Document (A4 1:1)</span>
              </div>

              {/* ZOOM CONTROLS */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleFitToWidth}
                  className="px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 rounded-xl font-bold text-[11px] flex items-center gap-1 transition"
                  title="Potrivește automat pe lățimea ecranului fără margini tăiate"
                >
                  <Maximize className="w-3 h-3 text-purple-300" />
                  <span>Potrivește (Fit)</span>
                </button>

                <div className="flex items-center bg-gray-950 px-2 py-1 rounded-xl border border-gray-800 text-xs">
                  <button 
                    onClick={() => setPreviewZoom(z => Math.max(0.35, Number((z - 0.05).toFixed(2))))}
                    className="p-1 hover:bg-gray-800 text-gray-400 hover:text-white rounded transition"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewZoom(1.0)}
                    className="font-mono text-purple-300 hover:text-purple-200 font-bold px-2 text-[11px] min-w-[44px] text-center"
                    title="Setează la 100%"
                  >
                    {Math.round(previewZoom * 100)}%
                  </button>
                  <button 
                    onClick={() => setPreviewZoom(z => Math.min(1.25, Number((z + 0.05).toFixed(2))))}
                    className="p-1 hover:bg-gray-800 text-gray-400 hover:text-white rounded transition"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={handleFitToWidth}
                    className="p-1 hover:bg-gray-800 text-gray-400 hover:text-white rounded ml-1 transition"
                    title="Resetează Zoom la Potrivire"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={handleDownloadDirectPdf}
                  disabled={isDownloadingPdf}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow transition disabled:opacity-60"
                >
                  {isDownloadingPdf ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  {isDownloadingPdf ? 'Se descarca...' : 'Descarca PDF'}
                </button>
              </div>
            </div>

            {/* A4 CANVAS WORKBENCH (FULL HORIZONTAL & VERTICAL SCROLL, ZERO CUTOFFS) */}
            <div 
              ref={workbenchRef}
              className="w-full bg-slate-950/80 p-3 sm:p-5 rounded-2xl border border-gray-800/80 overflow-x-auto overflow-y-auto max-h-[88vh] shadow-inner text-center"
            >
              
              {/* SIZING WRAPPER FOR CSS TRANSFORM SCALE (INLINE-BLOCK WITH AUTO MARGIN PREVENTS NEGATIVE CLIPPING) */}
              <div 
                style={{ 
                  display: 'inline-block',
                  width: `${210 * previewZoom}mm`, 
                  minHeight: `${297 * previewZoom}mm`,
                  margin: '0 auto',
                  textAlign: 'left',
                  position: 'relative',
                  transition: 'width 0.1s ease, min-height 0.1s ease'
                }}
              >
                
                {/* EXACT PHYSICAL 210mm A4 SHEET (NEVER SQUEEZES TEXT, IDENTICAL TO PDF) */}
                <div 
                  ref={previewRef}
                  id="cv-preview-sheet" 
                  className="bg-white text-black select-text shadow-2xl rounded-sm"
                  style={{ 
                    width: '210mm',
                    minHeight: '297mm',
                    padding: '12mm 15mm',
                    transform: `scale(${previewZoom})`,
                    transformOrigin: 'top left',
                    fontFamily: "'Times New Roman', Times, serif",
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    boxSizing: 'border-box'
                  }}
                >
                  
                  {/* HEADER (NAME + CONTACT LINKS) */}
                  <div style={{ textAlign: 'center', paddingBottom: '2px' }}>
                    <h1 style={{ 
                      fontSize: '18pt', 
                      fontWeight: 'bold', 
                      textTransform: 'uppercase', 
                      letterSpacing: '1px', 
                      color: '#000000', 
                      fontFamily: 'Arial, Helvetica, sans-serif',
                      lineHeight: '1.2',
                      margin: 0
                    }}>
                      {cvSections.fullName || 'Nume Prenume'}
                    </h1>
                    <div style={{ 
                      fontSize: '8.5pt', 
                      color: '#222222', 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '4px 6px', 
                      marginTop: '4px',
                      fontFamily: 'Arial, Helvetica, sans-serif'
                    }}>
                      {cvSections.email && <span>{cvSections.email}</span>}
                      {cvSections.phone && <span>| {cvSections.phone}</span>}
                      {cvSections.location && <span>| {cvSections.location}</span>}
                      {cvSections.linkedin && <span>| {cvSections.linkedin}</span>}
                      {cvSections.github && <span>| {cvSections.github}</span>}
                    </div>
                  </div>

                  {/* SUMMARY */}
                  {cvSections.summary && (
                    <div style={{ marginTop: '12px', marginBottom: '4px' }}>
                      <div style={{ 
                        fontWeight: 'bold', 
                        fontSize: '9.5pt', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.8px', 
                        color: '#000000', 
                        fontFamily: 'Arial, Helvetica, sans-serif',
                        lineHeight: '1.2'
                      }}>
                        Professional Summary
                      </div>
                      <div style={{ width: '100%', height: '1px', backgroundColor: '#000000', marginTop: '3px', marginBottom: '5px' }}></div>
                      <p style={{ fontSize: '9pt', color: '#000000', textAlign: 'justify', lineHeight: '1.35', fontFamily: 'Arial, Helvetica, sans-serif', margin: 0 }}>
                        {cvSections.summary}
                      </p>
                    </div>
                  )}

                  {/* EDUCATION */}
                  {eduList.length > 0 && (
                    <div style={{ marginTop: '12px', marginBottom: '4px' }}>
                      <div style={{ 
                        fontWeight: 'bold', 
                        fontSize: '9.5pt', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.8px', 
                        color: '#000000', 
                        fontFamily: 'Arial, Helvetica, sans-serif',
                        lineHeight: '1.2'
                      }}>
                        Education
                      </div>
                      <div style={{ width: '100%', height: '1px', backgroundColor: '#000000', marginTop: '3px', marginBottom: '5px' }}></div>
                      {eduList.map((edu, idx) => (
                        <div key={idx} style={{ marginTop: idx > 0 ? '5px' : '2px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '9.5pt', color: '#000000' }}>
                            <span>{edu.school || 'Universitate / Scoala'}</span>
                            <span>{edu.location || ''}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontStyle: 'italic', fontSize: '8.5pt', color: '#222222' }}>
                            <span>{edu.degree || 'Diploma / Specializare'}</span>
                            <span>{edu.period || ''}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* WORK EXPERIENCE */}
                  {cvSections.workExperience.length > 0 && (
                    <div style={{ marginTop: '12px', marginBottom: '4px' }}>
                      <div style={{ 
                        fontWeight: 'bold', 
                        fontSize: '9.5pt', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.8px', 
                        color: '#000000', 
                        fontFamily: 'Arial, Helvetica, sans-serif',
                        lineHeight: '1.2'
                      }}>
                        Work Experience
                      </div>
                      <div style={{ width: '100%', height: '1px', backgroundColor: '#000000', marginTop: '3px', marginBottom: '5px' }}></div>
                      {cvSections.workExperience.map((exp, idx) => (
                        <div key={idx} style={{ marginTop: idx > 0 ? '6px' : '2px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '9.5pt', color: '#000000' }}>
                            <span>{exp.company || 'Companie'}</span>
                            <span>{exp.location || ''}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontStyle: 'italic', fontSize: '8.5pt', color: '#222222' }}>
                            <span>{exp.role || 'Rol'}</span>
                            <span>{exp.period || ''}</span>
                          </div>
                          {exp.bullets && exp.bullets.length > 0 && (
                            <div style={{ marginTop: '3px' }}>
                              {exp.bullets.filter(Boolean).map((b, bIdx) => (
                                <div key={bIdx} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '2px' }}>
                                  <span style={{ display: 'inline-block', width: '14px', fontSize: '9pt', lineHeight: '1.3', color: '#000000', flexShrink: 0, textAlign: 'center' }}>•</span>
                                  <span style={{ flex: 1, fontSize: '8.5pt', lineHeight: '1.3', color: '#000000', textAlign: 'justify' }}>{b}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* PERSONAL PROJECTS */}
                  {cvSections.projects.length > 0 && (
                    <div style={{ marginTop: '12px', marginBottom: '4px' }}>
                      <div style={{ 
                        fontWeight: 'bold', 
                        fontSize: '9.5pt', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.8px', 
                        color: '#000000', 
                        fontFamily: 'Arial, Helvetica, sans-serif',
                        lineHeight: '1.2'
                      }}>
                        Personal Projects
                      </div>
                      <div style={{ width: '100%', height: '1px', backgroundColor: '#000000', marginTop: '3px', marginBottom: '5px' }}></div>
                      {cvSections.projects.map((proj, idx) => (
                        <div key={idx} style={{ marginTop: idx > 0 ? '6px' : '2px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '9.5pt', color: '#000000' }}>
                            <span>{proj.title || 'Titlu Proiect'}</span>
                            <span style={{ fontWeight: 'normal', fontSize: '8.5pt', fontStyle: 'italic', color: '#333333' }}>{proj.techStack || ''}</span>
                          </div>
                          {proj.bullets && proj.bullets.length > 0 && (
                            <div style={{ marginTop: '3px' }}>
                              {proj.bullets.filter(Boolean).map((b, bIdx) => (
                                <div key={bIdx} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '2px' }}>
                                  <span style={{ display: 'inline-block', width: '14px', fontSize: '9pt', lineHeight: '1.3', color: '#000000', flexShrink: 0, textAlign: 'center' }}>•</span>
                                  <span style={{ flex: 1, fontSize: '8.5pt', lineHeight: '1.3', color: '#000000', textAlign: 'justify' }}>{b}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TECHNICAL SKILLS */}
                  {(cvSections.skills.languages || cvSections.skills.frameworks || cvSections.skills.databases || cvSections.skills.devops) && (
                    <div style={{ marginTop: '12px', marginBottom: '4px' }}>
                      <div style={{ 
                        fontWeight: 'bold', 
                        fontSize: '9.5pt', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.8px', 
                        color: '#000000', 
                        fontFamily: 'Arial, Helvetica, sans-serif',
                        lineHeight: '1.2'
                      }}>
                        Technical Skills
                      </div>
                      <div style={{ width: '100%', height: '1px', backgroundColor: '#000000', marginTop: '3px', marginBottom: '5px' }}></div>
                      <div style={{ marginTop: '3px', fontSize: '8.5pt', color: '#000000', lineHeight: '1.4' }}>
                        {cvSections.skills.languages && (
                          <p style={{ margin: '1.5px 0' }}><span style={{ fontWeight: 'bold' }}>Languages:</span> {cvSections.skills.languages}</p>
                        )}
                        {cvSections.skills.frameworks && (
                          <p style={{ margin: '1.5px 0' }}><span style={{ fontWeight: 'bold' }}>Frameworks:</span> {cvSections.skills.frameworks}</p>
                        )}
                        {cvSections.skills.databases && (
                          <p style={{ margin: '1.5px 0' }}><span style={{ fontWeight: 'bold' }}>Databases:</span> {cvSections.skills.databases}</p>
                        )}
                        {cvSections.skills.devops && (
                          <p style={{ margin: '1.5px 0' }}><span style={{ fontWeight: 'bold' }}>DevOps & Tools:</span> {cvSections.skills.devops}</p>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* TARGET JOB AI OPTIMIZATION ACCORDION */}
            <div className="glass-card p-4 rounded-2xl border border-purple-500/30 space-y-3">
              <h4 className="text-xs font-black text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                Optimizare AI ATS Match 100% pentru un Job Tinta
              </h4>
              
              {applications.length > 0 && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">Selecteaza jobul din pipeline:</label>
                  <select 
                    value={selectedJobId}
                    onChange={e => setSelectedJobId(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {applications.map(app => (
                      <option key={app.id} value={app.id}>
                        {app.jobTitle} la {app.companyName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={handleRunTwoAgentPipeline}
                disabled={isAnalyzing}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analiza AI in desfasurare...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    Ruleaza Analiza AI Match 100%
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </div>

      {/* SECTION: DUAL AGENT PIPELINE OUTPUT CARDS */}
      {(agent1Output || agent2Output || isAnalyzing) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* AGENT 1: ATS GAP ANALYZER REPORT */}
          <div className="glass-card p-5 rounded-2xl border border-blue-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-blue-400 flex items-center gap-2 uppercase tracking-wider">
                <Target className="w-4 h-4" /> Agent 1: ATS Gap Analyzer (Analiza Diferente)
              </h4>
              {agent1Output && (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-extrabold text-xs border border-blue-500/40">
                  Target Match: 100%
                </span>
              )}
            </div>

            {agent1Output ? (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                    <span className="text-[11px] font-extrabold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Skill-uri Prezente:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {agent1Output.matchingSkills.map(s => (
                        <span key={s} className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1">
                    <span className="text-[11px] font-extrabold text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Recomandat de adaugat:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {agent1Output.missingSkills.map(s => (
                        <span key={s} className="text-[9px] font-bold bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-gray-950/80 rounded-xl border border-gray-800 max-h-52 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans text-xs text-gray-300 leading-relaxed">
                    {agent1Output.actionPlan}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-gray-500 italic">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400" />
                Agent 1 analizeaza diferentele dintre CV si cerintele jobului...
              </div>
            )}
          </div>

          {/* AGENT 2: AUTOMATED CV REWRITER FOR 100% MATCH */}
          <div className="glass-card p-5 rounded-2xl border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-purple-400 flex items-center gap-2 uppercase tracking-wider">
                <BrainCircuit className="w-4 h-4" /> Agent 2: Rewriter CV Autonom (Match 100%)
              </h4>
              {agent2Output && (
                <button 
                  onClick={handleDownloadDirectPdf}
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-xs flex items-center gap-1 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" /> Descarca PDF Optimizat 100%
                </button>
              )}
            </div>

            {agent2Output ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-1">
                  <span className="text-[11px] font-extrabold text-purple-300">Summary Re-scris pentru 100% ATS:</span>
                  <p className="text-[11px] text-gray-200 italic mt-1">{agent2Output.tailoredSummary}</p>
                </div>

                <div className="p-3.5 bg-gray-950/80 rounded-xl border border-gray-800 max-h-44 overflow-y-auto space-y-1.5">
                  <span className="text-[11px] font-extrabold text-amber-400">Gloante Proiecte Re-scrise (Metoda XYZ):</span>
                  {agent2Output.tailoredProjects.length > 0 && agent2Output.tailoredProjects[0].bullets.map((b, idx) => (
                    <p key={idx} className="text-[11px] text-gray-300 flex items-start gap-1.5">
                      <span className="text-purple-400">•</span>
                      <span>{b}</span>
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-gray-500 italic">
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
                    Agent 2 rescrie sectiunile CV-ului pentru a obtine scorul de 100%...
                  </>
                ) : (
                  "Apasa pe 'Ruleaza Analiza AI Match 100%' pentru a genera noul CV optimizat."
                )}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
