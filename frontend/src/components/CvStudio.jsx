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
  Maximize,
  Edit3,
  X,
  Wand2
} from 'lucide-react';

export default function CvStudio({ applications = [], currentUser }) {
  const activeUserId = currentUser ? currentUser.userId : null;
  const previewRef = useRef(null);
  const workbenchRef = useRef(null);

  // MASTER CV STATE
  const [cvSections, setCvSections] = useState({
    fullName: currentUser ? (currentUser.fullName || "Sîrbu Mihai-Alexandru") : "Sîrbu Mihai-Alexandru",
    email: currentUser ? (currentUser.email || "sarbumihai0@gmail.com") : "sarbumihai0@gmail.com",
    phone: "(+40) 723 034 706",
    location: "Bucharest, Romania",
    linkedin: "linkedin.com/in/sirbu-mihai",
    github: "github.com/sirbumihai",
    summary: "Computer Science & Engineering graduate with software engineering internship experience specializing in full-stack development and deep learning. Proficient in Java (Spring Boot), TypeScript (React), and Python (PyTorch), with a track record of building secure web applications and high-performance 3D segmentation models.",
    workExperience: [
      {
        id: 1,
        company: "SIMAVI (Software Imagination & Vision)",
        role: "Software Engineering Intern",
        period: "June 2025 – August 2025",
        location: "Bucharest, Romania",
        bullets: [
          "Optimized data retrieval for a library management system by architecting a normalized MySQL schema with strategic indexing and implementing custom Spring Data JPA repositories, achieving sub-second latency for complex queries across 50,000+ records.",
          "Developed and maintained enterprise-grade features using Java, Spring Boot, and PrimeFaces, ensuring seamless integration with legacy systems and enhancing UI responsiveness."
        ]
      }
    ],
    projects: [
      {
        id: 1,
        title: "3D Medical Image Segmentation",
        techStack: "Python, PyTorch, SimpleITK, Flask, Plotly, NumPy, SciPy, Nibabel",
        period: "February 2026 – June 2026",
        link: "",
        bullets: [
          "Architected a high-throughput medical data pipeline using SimpleITK to process 1,506 multi-center cases, reducing data preprocessing time by 40% and ensuring standardized inputs for segmentation models via isotropic resampling."
        ]
      },
      {
        id: 2,
        title: "OneRep – Fitness Tracking Web Application",
        techStack: "Next.js, React, TypeScript, Supabase, PostgreSQL, Tailwind",
        period: "October 2025 – January 2026",
        link: "one-rep.vercel.app",
        bullets: [
          "Engineered a scalable fitness tracking platform using Next.js and Supabase, enforcing granular data security via 8 RLS policies and automating subscription workflows via Stripe webhooks, which reduced manual payment processing overhead by 25%."
        ]
      },
      {
        id: 3,
        title: "Banking Application",
        techStack: "Java, Spring Boot, Spring Security, MySQL, Thymeleaf",
        period: "November 2024 – January 2025",
        link: "",
        bullets: [
          "Architected a secure full-stack banking platform with Spring Security and Thymeleaf, implementing custom transaction categorization logic that reduced manual reconciliation time by 30% and improved data accuracy for 500+ monthly transactions."
        ]
      }
    ],
    skills: {
      languages: "Java, TypeScript, Python, C/C++, HTML, CSS",
      frameworks: "Spring Boot, React, Next.js, PrimeFaces, Spring Security, Thymeleaf",
      developerTools: "Linux, Git, Supabase, Stripe",
      libraries: "PyTorch, SimpleITK, Flask, Plotly, NumPy, SciPy, Nibabel, Tailwind, Bootstrap"
    },
    education: [
      {
        id: 1,
        school: "University Politehnica of Bucharest",
        degree: "Bachelor of Computer Science & Engineering",
        period: "October 2022 – July 2026",
        location: "Bucharest, Romania",
        bullets: [
          "Courses: Data Structures & Algorithms, Object-Oriented Programming, Database Systems, Computer Networks, Software Engineering."
        ]
      }
    ]
  });

  // SECTION ORDER & VISIBILITY
  const [sectionOrder, setSectionOrder] = useState(['education', 'experience', 'projects', 'skills']);
  const [showSummarySection, setShowSummarySection] = useState(false);

  // UI CONTROLS
  const [previewZoom, setPreviewZoom] = useState(0.85);
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [languagePref, setLanguagePref] = useState('EN');
  const [selectedJobId, setSelectedJobId] = useState(applications.length > 0 ? applications[0].id : '');
  const [customJobDescription, setCustomJobDescription] = useState('');
  
  const [isSavingDb, setIsSavingDb] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parsingPdf, setParsingPdf] = useState(false);
  const [parsedPdfSuccess, setParsedPdfSuccess] = useState(null);

  // AGENT OUTPUTS
  const [agent1Output, setAgent1Output] = useState(null);
  const [agent2Output, setAgent2Output] = useState(null);

  // AUTO CALCULATE FIT ZOOM
  const handleFitToWidth = () => {
    if (workbenchRef.current) {
      const containerWidth = workbenchRef.current.clientWidth - 48;
      const a4WidthPx = 794; // 210mm in pixels at standard 96dpi
      const calculatedZoom = Math.min(1.0, Math.max(0.4, Number((containerWidth / a4WidthPx).toFixed(2))));
      setPreviewZoom(calculatedZoom);
    } else {
      setPreviewZoom(0.85);
    }
  };

  useEffect(() => {
    handleFitToWidth();
    window.addEventListener('resize', handleFitToWidth);
    return () => window.removeEventListener('resize', handleFitToWidth);
  }, []);

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

  // LOAD CV FROM DATABASE ON MOUNT
  const fetchCvFromDatabase = async () => {
    if (!activeUserId) return;
    try {
      const res = await fetch('/api/v1/cv', {
        headers: { 'X-User-Id': activeUserId }
      });
      if (res.ok && res.status !== 204) {
        const data = await res.json();
        if (data) {
          const edu = normalizeEducation(data.educationJson);
          setCvSections(prev => ({
            fullName: data.fullName || prev.fullName,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
            location: data.location || prev.location,
            linkedin: data.linkedin || prev.linkedin,
            github: data.github || prev.github,
            summary: data.summary || prev.summary,
            workExperience: data.workExperienceJson ? JSON.parse(data.workExperienceJson) : prev.workExperience,
            projects: data.projectsJson ? JSON.parse(data.projectsJson) : prev.projects,
            skills: {
              languages: data.skillsLanguages || prev.skills.languages,
              frameworks: data.skillsFrameworks || prev.skills.frameworks,
              developerTools: data.skillsDevops || prev.skills.developerTools,
              libraries: data.skillsDatabases || prev.skills.libraries
            },
            education: edu.length > 0 ? edu : prev.education
          }));
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
        skillsDatabases: cvSections.skills.libraries,
        skillsDevops: cvSections.skills.developerTools,
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
        setSaveSuccessMsg("Toate modificarile din CV au fost salvate cu succes in PostgreSQL!");
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error("Eroare la salvarea in baza de date:", err);
    } finally {
      setIsSavingDb(false);
    }
  };

  // REORDER SECTIONS
  const moveSection = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= sectionOrder.length) return;
    const newOrder = [...sectionOrder];
    const temp = newOrder[idx];
    newOrder[idx] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;
    setSectionOrder(newOrder);
  };

  const deleteSection = (sectionKey) => {
    setSectionOrder(prev => prev.filter(k => k !== sectionKey));
  };

  const restoreSection = (sectionKey) => {
    if (!sectionOrder.includes(sectionKey)) {
      setSectionOrder(prev => [...prev, sectionKey]);
    }
  };

  // DYNAMIC ITEM HANDLERS (EDUCATION)
  const addEducation = () => {
    const newEdu = {
      id: Date.now(),
      school: "University / School Name",
      degree: "Degree / Specialization",
      period: "Month Year – Month Year",
      location: "City, Country",
      bullets: []
    };
    setCvSections(prev => ({ ...prev, education: [...prev.education, newEdu] }));
  };

  const deleteEducation = (id) => {
    setCvSections(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
  };

  const addEduBullet = (eduIdx) => {
    const updated = [...cvSections.education];
    if (!updated[eduIdx].bullets) updated[eduIdx].bullets = [];
    updated[eduIdx].bullets.push("Courses: Relevant coursework or honors...");
    setCvSections({ ...cvSections, education: updated });
  };

  const deleteEduBullet = (eduIdx, bIdx) => {
    const updated = [...cvSections.education];
    updated[eduIdx].bullets = updated[eduIdx].bullets.filter((_, idx) => idx !== bIdx);
    setCvSections({ ...cvSections, education: updated });
  };

  // DYNAMIC ITEM HANDLERS (EXPERIENCE)
  const addExperience = () => {
    const newExp = {
      id: Date.now(),
      company: "Company Name",
      role: "Job Role / Title",
      period: "Month Year – Month Year",
      location: "City, Country",
      bullets: ["Describe key responsibility or achievement using action verbs..."]
    };
    setCvSections(prev => ({ ...prev, workExperience: [...prev.workExperience, newExp] }));
  };

  const deleteExperience = (id) => {
    setCvSections(prev => ({ ...prev, workExperience: prev.workExperience.filter(e => e.id !== id) }));
  };

  const addExpBullet = (expIdx) => {
    const updated = [...cvSections.workExperience];
    if (!updated[expIdx].bullets) updated[expIdx].bullets = [];
    updated[expIdx].bullets.push("New accomplishment measured by impact...");
    setCvSections({ ...cvSections, workExperience: updated });
  };

  const deleteExpBullet = (expIdx, bIdx) => {
    const updated = [...cvSections.workExperience];
    updated[expIdx].bullets = updated[expIdx].bullets.filter((_, idx) => idx !== bIdx);
    setCvSections({ ...cvSections, workExperience: updated });
  };

  // DYNAMIC ITEM HANDLERS (PROJECTS)
  const addProject = () => {
    const newProj = {
      id: Date.now(),
      title: "Project Title",
      techStack: "Tech, Stack, Used",
      period: "Month Year – Month Year",
      link: "",
      bullets: ["Architected and delivered key project features using..."]
    };
    setCvSections(prev => ({ ...prev, projects: [...prev.projects, newProj] }));
  };

  const deleteProject = (id) => {
    setCvSections(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
  };

  const addProjectBullet = (projIdx) => {
    const updated = [...cvSections.projects];
    if (!updated[projIdx].bullets) updated[projIdx].bullets = [];
    updated[projIdx].bullets.push("Accomplished [X] measured by [Y] using [Z]...");
    setCvSections({ ...cvSections, projects: updated });
  };

  const deleteProjectBullet = (projIdx, bIdx) => {
    const updated = [...cvSections.projects];
    updated[projIdx].bullets = updated[projIdx].bullets.filter((_, idx) => idx !== bIdx);
    setCvSections({ ...cvSections, projects: updated });
  };

  // UPLOAD PDF CV & AUTO FILL
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
        if (data.parsedProfile) {
          const p = data.parsedProfile;
          const safeParse = (str, fallback) => {
            try { return str ? (typeof str === 'string' ? JSON.parse(str) : str) : fallback; } catch (e) { return fallback; }
          };

          setCvSections({
            fullName: p.fullName || cvSections.fullName,
            email: p.email || cvSections.email,
            phone: p.phone || cvSections.phone,
            location: p.location || cvSections.location,
            linkedin: p.linkedin || cvSections.linkedin,
            github: p.github || cvSections.github,
            summary: p.summary || cvSections.summary,
            workExperience: safeParse(p.workExperienceJson, cvSections.workExperience),
            projects: safeParse(p.projectsJson, cvSections.projects),
            skills: {
              languages: p.skillsLanguages || cvSections.skills.languages,
              frameworks: p.skillsFrameworks || cvSections.skills.frameworks,
              developerTools: p.skillsDevops || cvSections.skills.developerTools,
              libraries: p.skillsDatabases || cvSections.skills.libraries
            },
            education: normalizeEducation(p.educationJson)
          });
        }
        setParsedPdfSuccess(`CV-ul "${file.name}" a fost importat si completat direct pe pagina!`);
        setTimeout(() => setParsedPdfSuccess(null), 5000);
      }
    } catch (err) {
      console.error("Eroare la incarcarea PDF-ului:", err);
    } finally {
      setParsingPdf(false);
    }
  };

  // RUN REAL 2-AGENT GROQ PIPELINE
  const handleRunTwoAgentPipeline = async () => {
    if (!activeUserId) {
      alert("Te rugam sa te autentifici inainte de a rula optimizarea AI.");
      return;
    }

    setIsAnalyzing(true);
    setAgent1Output(null);
    setAgent2Output(null);

    try {
      const payload = {
        applicationId: selectedJobId || (applications.length > 0 ? applications[0].id : null),
        customJobDescription: customJobDescription || "",
        languagePreference: languagePref
      };

      const res = await fetch('/api/v1/cv/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': activeUserId
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setAgent1Output({
          targetMatchScore: data.targetMatchScore || "100%",
          matchingSkills: data.matchingSkills || [],
          missingSkills: data.missingSkills || [],
          actionPlan: data.actionPlan || "Analiza realizata cu succes."
        });

        setAgent2Output({
          tailoredSummary: data.tailoredSummary || "",
          tailoredSkills: data.tailoredSkills || {},
          tailoredProjects: [{
            bullets: data.tailoredBullets || []
          }],
          fullTailoredReport: data.fullTailoredReport || ""
        });
      } else {
        const err = await res.text();
        alert("Eroare la optimizarea AI: " + err);
      }
    } catch (err) {
      console.error("Eroare la apelul AI:", err);
      alert("A intervenit o eroare la apelul serviciului AI: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyAiOptimizations = () => {
    if (!agent2Output) return;

    setCvSections(prev => ({
      ...prev,
      summary: agent2Output.tailoredSummary || prev.summary,
      skills: {
        languages: agent2Output.tailoredSkills?.languages || prev.skills.languages,
        frameworks: agent2Output.tailoredSkills?.frameworks || prev.skills.frameworks,
        developerTools: agent2Output.tailoredSkills?.devops || prev.skills.developerTools,
        libraries: agent2Output.tailoredSkills?.databases || prev.skills.libraries
      },
      projects: prev.projects.length > 0 && agent2Output.tailoredProjects?.[0]?.bullets?.length > 0
        ? [{ ...prev.projects[0], bullets: agent2Output.tailoredProjects[0].bullets }, ...prev.projects.slice(1)]
        : prev.projects
    }));

    if (agent2Output.tailoredSummary) {
      setShowSummarySection(true);
      if (!sectionOrder.includes('summary')) {
        setSectionOrder(prev => ['summary', ...prev]);
      }
    }

    alert("Optimizarile generate de AI Groq au fost aplicate direct pe foaia CV-ului!");
  };

  // DIRECT PDF DOWNLOAD HANDLER (PRINTS CLEAN A4 WITH HELPER CONTROLS HIDDEN)
  const handleDownloadDirectPdf = async () => {
    const element = previewRef.current || document.getElementById('cv-preview-sheet');
    if (!element) {
      alert("Nu s-a putut gasi fisa CV-ului.");
      return;
    }

    setIsDownloadingPdf(true);

    try {
      const sanitizedName = (cvSections.fullName || 'CV').trim().replace(/\s+/g, '_');
      
      // Temporarily clear CSS transform during capture
      const currentTransform = element.style.transform;
      element.style.transform = 'none';

      // Hide all .no-pdf interactive helper elements
      const helperElements = element.querySelectorAll('.no-pdf');
      helperElements.forEach(el => { el.style.display = 'none'; });

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

      // Restore helper elements and transform
      helperElements.forEach(el => { el.style.display = ''; });
      element.style.transform = currentTransform;
    } catch (err) {
      console.error("Eroare la generarea PDF-ului:", err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const autoResizeTextarea = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* TOP WORKSPACE TOOLBAR */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl border border-purple-500/30 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-600 rounded-2xl text-white shadow-lg shadow-purple-600/30 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                CV Canvas Studio – Editare Directă în Pagină (Inline WYSIWYG)
              </h2>
              <p className="text-xs text-gray-400 font-medium">
                Scrie, editează, adaugă sau șterge direct pe foaia A4 de mai jos exact ca într-un document nativ.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* SAVE TO DB */}
            <button
              onClick={handleSaveToDatabase}
              disabled={isSavingDb || !activeUserId}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/25 transition disabled:opacity-50"
            >
              {isSavingDb ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {isSavingDb ? 'Se salvează...' : 'Salvează în DB'}
            </button>

            {/* AI OPTIMIZE DRAWER BUTTON */}
            <button
              onClick={() => setShowAiModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/25 transition"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              Optimizare AI ATS 100%
            </button>

            {/* UPLOAD PDF CV */}
            <label className="px-4 py-2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition">
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              {parsingPdf ? 'Se extrage...' : 'Importă CV PDF'}
              <input type="file" accept=".pdf,.docx" onChange={handleFileUploadPdf} className="hidden" />
            </label>

            {/* DOWNLOAD PDF */}
            <button
              onClick={handleDownloadDirectPdf}
              disabled={isDownloadingPdf}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/25 transition disabled:opacity-60"
            >
              {isDownloadingPdf ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              {isDownloadingPdf ? 'Generare...' : 'Descarcă PDF'}
            </button>
          </div>
        </div>

        {/* RESTORE SECTIONS QUICK BAR */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-800/80 text-xs">
          <span className="text-[11px] font-bold text-gray-400">Adaugă secțiuni în pagină:</span>
          {!sectionOrder.includes('education') && (
            <button onClick={() => restoreSection('education')} className="px-2 py-1 bg-gray-900 hover:bg-gray-800 text-emerald-300 rounded-lg text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
              <Plus className="w-3 h-3" /> Education
            </button>
          )}
          {!sectionOrder.includes('experience') && (
            <button onClick={() => restoreSection('experience')} className="px-2 py-1 bg-gray-900 hover:bg-gray-800 text-blue-300 rounded-lg text-[10px] font-bold border border-blue-500/30 flex items-center gap-1">
              <Plus className="w-3 h-3" /> Experience
            </button>
          )}
          {!sectionOrder.includes('projects') && (
            <button onClick={() => restoreSection('projects')} className="px-2 py-1 bg-gray-900 hover:bg-gray-800 text-amber-300 rounded-lg text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
              <Plus className="w-3 h-3" /> Projects
            </button>
          )}
          {!sectionOrder.includes('skills') && (
            <button onClick={() => restoreSection('skills')} className="px-2 py-1 bg-gray-900 hover:bg-gray-800 text-cyan-300 rounded-lg text-[10px] font-bold border border-cyan-500/30 flex items-center gap-1">
              <Plus className="w-3 h-3" /> Technical Skills
            </button>
          )}
          {!sectionOrder.includes('summary') && (
            <button onClick={() => restoreSection('summary')} className="px-2 py-1 bg-gray-900 hover:bg-gray-800 text-purple-300 rounded-lg text-[10px] font-bold border border-purple-500/30 flex items-center gap-1">
              <Plus className="w-3 h-3" /> Professional Summary
            </button>
          )}

          {/* ZOOM TOOLBAR */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleFitToWidth}
              className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
            >
              <Maximize className="w-3 h-3" /> Potrivește (Fit)
            </button>
            <div className="flex items-center bg-gray-950 px-1.5 py-0.5 rounded-lg border border-gray-800 text-xs">
              <button 
                onClick={() => setPreviewZoom(z => Math.max(0.4, Number((z - 0.05).toFixed(2))))}
                className="p-1 hover:bg-gray-800 text-gray-400 hover:text-white rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <button
                onClick={() => setPreviewZoom(1.0)}
                className="font-mono text-purple-300 font-bold px-1.5 text-[11px] min-w-[38px] text-center"
                title="Seteaza la 100%"
              >
                {Math.round(previewZoom * 100)}%
              </button>
              <button 
                onClick={() => setPreviewZoom(z => Math.min(1.3, Number((z + 0.05).toFixed(2))))}
                className="p-1 hover:bg-gray-800 text-gray-400 hover:text-white rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

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

      {/* ================= INLINE WYSIWYG A4 CV DOCUMENT CANVAS ================= */}
      <div 
        ref={workbenchRef}
        className="w-full bg-slate-950/90 p-4 sm:p-8 rounded-3xl border border-gray-800 overflow-x-auto overflow-y-auto max-h-[90vh] shadow-2xl text-center"
      >
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
          {/* EXACT PHYSICAL 210mm A4 SHEET */}
          <div 
            ref={previewRef}
            id="cv-preview-sheet" 
            className="bg-white text-black shadow-2xl rounded-sm transition-all"
            style={{ 
              width: '210mm',
              minHeight: '297mm',
              padding: '14mm 16mm',
              transform: `scale(${previewZoom})`,
              transformOrigin: 'top left',
              fontFamily: "'Times New Roman', Times, serif",
              backgroundColor: '#ffffff',
              color: '#000000',
              boxSizing: 'border-box'
            }}
          >
            
            {/* ================= HEADER SECTION (NAME + CONTACT DETAILS) ================= */}
            <div className="relative group text-center pb-2">
              
              {/* EDIT CONTACT BUTTON */}
              <button 
                onClick={() => setShowEditContactModal(true)}
                className="no-pdf absolute right-0 top-0 text-[11px] font-sans text-gray-400 hover:text-blue-600 flex items-center gap-1 bg-gray-50 hover:bg-blue-50 px-2 py-1 rounded border border-gray-200 transition cursor-pointer"
                title="Editeaza datele de contact"
              >
                <Edit3 className="w-3 h-3" /> Edit Contact
              </button>

              {/* CANDIDATE FULL NAME */}
              <input 
                type="text"
                value={cvSections.fullName}
                onChange={e => setCvSections({...cvSections, fullName: e.target.value})}
                placeholder="NUME CANDIDAT"
                className="w-full text-center bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:bg-blue-50/20 outline-none text-black font-bold uppercase tracking-wide transition"
                style={{ 
                  fontSize: '20pt', 
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  letterSpacing: '0.5px',
                  lineHeight: '1.2'
                }}
              />

              {/* CONTACT DETAILS ROW */}
              <div 
                className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-black mt-1 font-sans"
                style={{ fontSize: '9pt' }}
              >
                {cvSections.phone && <span>{cvSections.phone}</span>}
                {cvSections.email && (
                  <>
                    <span className="text-gray-400">|</span>
                    <a href={`mailto:${cvSections.email}`} className="text-black underline">{cvSections.email}</a>
                  </>
                )}
                {cvSections.linkedin && (
                  <>
                    <span className="text-gray-400">|</span>
                    <a href={cvSections.linkedin.startsWith('http') ? cvSections.linkedin : `https://${cvSections.linkedin}`} target="_blank" rel="noreferrer" className="text-black underline">
                      LinkedIn
                    </a>
                  </>
                )}
                {cvSections.github && (
                  <>
                    <span className="text-gray-400">|</span>
                    <a href={cvSections.github.startsWith('http') ? cvSections.github : `https://${cvSections.github}`} target="_blank" rel="noreferrer" className="text-black underline">
                      GitHub
                    </a>
                  </>
                )}
                {cvSections.location && (
                  <>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-700">{cvSections.location}</span>
                  </>
                )}
              </div>
            </div>

            {/* ================= DYNAMIC SECTIONS RENDERING ================= */}
            {sectionOrder.map((sectionKey, sIdx) => {
              
              // ------------------- SECTION: EDUCATION -------------------
              if (sectionKey === 'education') {
                return (
                  <div key="education" className="mt-3.5 mb-2 group/sec">
                    {/* SECTION TITLE & INLINE CONTROLS */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span style={{ 
                          fontWeight: 'bold', 
                          fontSize: '10.5pt', 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.8px', 
                          color: '#000000', 
                          fontFamily: 'Arial, Helvetica, sans-serif'
                        }}>
                          Education
                        </span>
                        
                        {/* INLINE ACTION BUTTONS */}
                        <div className="no-pdf flex items-center gap-1 font-sans text-[10px] text-gray-400">
                          <button onClick={() => moveSection(sIdx, -1)} disabled={sIdx === 0} className="hover:text-gray-800 disabled:opacity-20 cursor-pointer" title="Move Up">↑</button>
                          <button onClick={() => moveSection(sIdx, 1)} disabled={sIdx === sectionOrder.length - 1} className="hover:text-gray-800 disabled:opacity-20 cursor-pointer" title="Move Down">↓</button>
                          <button onClick={addEducation} className="hover:text-blue-600 text-gray-500 font-semibold ml-1 cursor-pointer" title="Add education entry">+ new</button>
                        </div>
                      </div>

                      <button onClick={() => deleteSection('education')} className="no-pdf text-[10px] font-sans text-gray-400 hover:text-rose-600 flex items-center gap-0.5 cursor-pointer">
                        <Trash2 className="w-3 h-3" /> delete section
                      </button>
                    </div>

                    {/* SECTION DIVIDER */}
                    <div style={{ width: '100%', height: '1px', backgroundColor: '#000000', marginTop: '2px', marginBottom: '4px' }}></div>

                    {/* ENTRIES */}
                    {cvSections.education.map((edu, eduIdx) => (
                      <div key={edu.id || eduIdx} className="mt-1.5 mb-1.5 group/item">
                        {/* ROW 1: SCHOOL (LEFT) + DATES (RIGHT) */}
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="flex items-baseline gap-1.5 flex-1">
                            <input 
                              type="text"
                              value={edu.school || ""}
                              onChange={e => {
                                const updated = [...cvSections.education];
                                updated[eduIdx].school = e.target.value;
                                setCvSections({...cvSections, education: updated});
                              }}
                              placeholder="University / School"
                              className="font-bold text-black bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none flex-1 transition"
                              style={{ fontSize: '9.5pt' }}
                            />
                            <button 
                              onClick={() => addEduBullet(eduIdx)}
                              className="no-pdf text-[10px] font-sans text-gray-400 hover:text-blue-600 font-semibold cursor-pointer shrink-0"
                            >
                              + bullet
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <input 
                              type="text"
                              value={edu.period || ""}
                              onChange={e => {
                                const updated = [...cvSections.education];
                                updated[eduIdx].period = e.target.value;
                                setCvSections({...cvSections, education: updated});
                              }}
                              placeholder="Dates"
                              className="text-right text-black bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none transition"
                              style={{ fontSize: '9pt' }}
                            />
                            <button 
                              onClick={() => deleteEducation(edu.id)}
                              className="no-pdf text-gray-400 hover:text-rose-600 p-0.5 cursor-pointer"
                              title="Delete entry"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* ROW 2: DEGREE (LEFT) + LOCATION (RIGHT) */}
                        <div className="flex items-baseline justify-between gap-2">
                          <input 
                            type="text"
                            value={edu.degree || ""}
                            onChange={e => {
                              const updated = [...cvSections.education];
                              updated[eduIdx].degree = e.target.value;
                              setCvSections({...cvSections, education: updated});
                            }}
                            placeholder="Bachelor of Computer Science & Engineering"
                            className="italic text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none flex-1 transition"
                            style={{ fontSize: '9pt' }}
                          />
                          <input 
                            type="text"
                            value={edu.location || ""}
                            onChange={e => {
                              const updated = [...cvSections.education];
                              updated[eduIdx].location = e.target.value;
                              setCvSections({...cvSections, education: updated});
                            }}
                            placeholder="Location"
                            className="italic text-right text-gray-700 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none shrink-0 transition"
                            style={{ fontSize: '9pt' }}
                          />
                        </div>

                        {/* BULLETS */}
                        {edu.bullets && edu.bullets.map((b, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-1 mt-0.5 group/b">
                            <span style={{ fontSize: '9pt', lineHeight: '1.3', flexShrink: 0, paddingLeft: '4px' }}>•</span>
                            <textarea
                              rows={1}
                              value={b}
                              onInput={autoResizeTextarea}
                              onChange={e => {
                                const updated = [...cvSections.education];
                                updated[eduIdx].bullets[bIdx] = e.target.value;
                                setCvSections({...cvSections, education: updated});
                              }}
                              placeholder="Courses: Data Structures, Algorithms..."
                              className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none resize-none transition"
                              style={{ fontSize: '8.5pt', lineHeight: '1.3', color: '#000000', textAlign: 'justify' }}
                            />
                            <button 
                              onClick={() => deleteEduBullet(eduIdx, bIdx)}
                              className="no-pdf text-gray-300 hover:text-rose-600 p-0.5 cursor-pointer shrink-0"
                              title="Delete bullet"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                );
              }

              // ------------------- SECTION: EXPERIENCE -------------------
              if (sectionKey === 'experience') {
                return (
                  <div key="experience" className="mt-3.5 mb-2 group/sec">
                    {/* SECTION TITLE & INLINE CONTROLS */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span style={{ 
                          fontWeight: 'bold', 
                          fontSize: '10.5pt', 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.8px', 
                          color: '#000000', 
                          fontFamily: 'Arial, Helvetica, sans-serif'
                        }}>
                          Experience
                        </span>
                        
                        {/* INLINE ACTION BUTTONS */}
                        <div className="no-pdf flex items-center gap-1 font-sans text-[10px] text-gray-400">
                          <button onClick={() => moveSection(sIdx, -1)} disabled={sIdx === 0} className="hover:text-gray-800 disabled:opacity-20 cursor-pointer" title="Move Up">↑</button>
                          <button onClick={() => moveSection(sIdx, 1)} disabled={sIdx === sectionOrder.length - 1} className="hover:text-gray-800 disabled:opacity-20 cursor-pointer" title="Move Down">↓</button>
                          <button onClick={addExperience} className="hover:text-blue-600 text-gray-500 font-semibold ml-1 cursor-pointer" title="Add experience entry">+ new</button>
                        </div>
                      </div>

                      <button onClick={() => deleteSection('experience')} className="no-pdf text-[10px] font-sans text-gray-400 hover:text-rose-600 flex items-center gap-0.5 cursor-pointer">
                        <Trash2 className="w-3 h-3" /> delete section
                      </button>
                    </div>

                    {/* SECTION DIVIDER */}
                    <div style={{ width: '100%', height: '1px', backgroundColor: '#000000', marginTop: '2px', marginBottom: '4px' }}></div>

                    {/* ENTRIES */}
                    {cvSections.workExperience.map((exp, expIdx) => (
                      <div key={exp.id || expIdx} className="mt-1.5 mb-2 group/item">
                        {/* ROW 1: ROLE (LEFT) + DATES (RIGHT) */}
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="flex items-baseline gap-1.5 flex-1">
                            <input 
                              type="text"
                              value={exp.role || ""}
                              onChange={e => {
                                const updated = [...cvSections.workExperience];
                                updated[expIdx].role = e.target.value;
                                setCvSections({...cvSections, workExperience: updated});
                              }}
                              placeholder="Job Role / Title"
                              className="font-bold text-black bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none flex-1 transition"
                              style={{ fontSize: '9.5pt' }}
                            />
                            <button 
                              onClick={() => addExpBullet(expIdx)}
                              className="no-pdf text-[10px] font-sans text-gray-400 hover:text-blue-600 font-semibold cursor-pointer shrink-0"
                            >
                              + bullet
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <input 
                              type="text"
                              value={exp.period || ""}
                              onChange={e => {
                                const updated = [...cvSections.workExperience];
                                updated[expIdx].period = e.target.value;
                                setCvSections({...cvSections, workExperience: updated});
                              }}
                              placeholder="June 2025 – August 2025"
                              className="text-right text-black bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none transition"
                              style={{ fontSize: '9pt' }}
                            />
                            <button 
                              onClick={() => deleteExperience(exp.id)}
                              className="no-pdf text-gray-400 hover:text-rose-600 p-0.5 cursor-pointer"
                              title="Delete entry"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* ROW 2: COMPANY (LEFT) + LOCATION (RIGHT) */}
                        <div className="flex items-baseline justify-between gap-2">
                          <input 
                            type="text"
                            value={exp.company || ""}
                            onChange={e => {
                              const updated = [...cvSections.workExperience];
                              updated[expIdx].company = e.target.value;
                              setCvSections({...cvSections, workExperience: updated});
                            }}
                            placeholder="Company Name"
                            className="italic text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none flex-1 transition"
                            style={{ fontSize: '9pt' }}
                          />
                          <input 
                            type="text"
                            value={exp.location || ""}
                            onChange={e => {
                              const updated = [...cvSections.workExperience];
                              updated[expIdx].location = e.target.value;
                              setCvSections({...cvSections, workExperience: updated});
                            }}
                            placeholder="Location"
                            className="italic text-right text-gray-700 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none shrink-0 transition"
                            style={{ fontSize: '9pt' }}
                          />
                        </div>

                        {/* BULLETS */}
                        {exp.bullets && exp.bullets.map((b, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-1 mt-0.5 group/b">
                            <span style={{ fontSize: '9pt', lineHeight: '1.35', flexShrink: 0, paddingLeft: '4px' }}>•</span>
                            <textarea
                              rows={1}
                              value={b}
                              onInput={autoResizeTextarea}
                              onChange={e => {
                                const updated = [...cvSections.workExperience];
                                updated[expIdx].bullets[bIdx] = e.target.value;
                                setCvSections({...cvSections, workExperience: updated});
                              }}
                              placeholder="Accomplishment / responsibility..."
                              className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none resize-none transition"
                              style={{ fontSize: '8.5pt', lineHeight: '1.35', color: '#000000', textAlign: 'justify' }}
                            />
                            <button 
                              onClick={() => deleteExpBullet(expIdx, bIdx)}
                              className="no-pdf text-gray-300 hover:text-rose-600 p-0.5 cursor-pointer shrink-0"
                              title="Delete bullet"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                );
              }

              // ------------------- SECTION: PROJECTS -------------------
              if (sectionKey === 'projects') {
                return (
                  <div key="projects" className="mt-3.5 mb-2 group/sec">
                    {/* SECTION TITLE & INLINE CONTROLS */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span style={{ 
                          fontWeight: 'bold', 
                          fontSize: '10.5pt', 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.8px', 
                          color: '#000000', 
                          fontFamily: 'Arial, Helvetica, sans-serif'
                        }}>
                          Projects
                        </span>
                        
                        {/* INLINE ACTION BUTTONS */}
                        <div className="no-pdf flex items-center gap-1 font-sans text-[10px] text-gray-400">
                          <button onClick={() => moveSection(sIdx, -1)} disabled={sIdx === 0} className="hover:text-gray-800 disabled:opacity-20 cursor-pointer" title="Move Up">↑</button>
                          <button onClick={() => moveSection(sIdx, 1)} disabled={sIdx === sectionOrder.length - 1} className="hover:text-gray-800 disabled:opacity-20 cursor-pointer" title="Move Down">↓</button>
                          <button onClick={addProject} className="hover:text-blue-600 text-gray-500 font-semibold ml-1 cursor-pointer" title="Add project entry">+ new</button>
                        </div>
                      </div>

                      <button onClick={() => deleteSection('projects')} className="no-pdf text-[10px] font-sans text-gray-400 hover:text-rose-600 flex items-center gap-0.5 cursor-pointer">
                        <Trash2 className="w-3 h-3" /> delete section
                      </button>
                    </div>

                    {/* SECTION DIVIDER */}
                    <div style={{ width: '100%', height: '1px', backgroundColor: '#000000', marginTop: '2px', marginBottom: '4px' }}></div>

                    {/* ENTRIES */}
                    {cvSections.projects.map((proj, projIdx) => (
                      <div key={proj.id || projIdx} className="mt-1.5 mb-2 group/item">
                        {/* ROW 1: TITLE + TECH STACK (LEFT) + DATES (RIGHT) */}
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="flex items-baseline flex-wrap gap-1 flex-1">
                            <input 
                              type="text"
                              value={proj.title || ""}
                              onChange={e => {
                                const updated = [...cvSections.projects];
                                updated[projIdx].title = e.target.value;
                                setCvSections({...cvSections, projects: updated});
                              }}
                              placeholder="Project Title"
                              className="font-bold text-black bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none transition"
                              style={{ fontSize: '9.5pt' }}
                            />
                            <span className="text-gray-400 font-normal">|</span>
                            <input 
                              type="text"
                              value={proj.techStack || ""}
                              onChange={e => {
                                const updated = [...cvSections.projects];
                                updated[projIdx].techStack = e.target.value;
                                setCvSections({...cvSections, projects: updated});
                              }}
                              placeholder="Python, PyTorch, React..."
                              className="italic text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none flex-1 transition min-w-[140px]"
                              style={{ fontSize: '8.5pt' }}
                            />
                            <button 
                              onClick={() => addProjectBullet(projIdx)}
                              className="no-pdf text-[10px] font-sans text-gray-400 hover:text-blue-600 font-semibold cursor-pointer shrink-0 ml-1"
                            >
                              + bullet
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <input 
                              type="text"
                              value={proj.period || ""}
                              onChange={e => {
                                const updated = [...cvSections.projects];
                                updated[projIdx].period = e.target.value;
                                setCvSections({...cvSections, projects: updated});
                              }}
                              placeholder="Dates"
                              className="text-right text-black bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none transition"
                              style={{ fontSize: '9pt' }}
                            />
                            <button 
                              onClick={() => deleteProject(proj.id)}
                              className="no-pdf text-gray-400 hover:text-rose-600 p-0.5 cursor-pointer"
                              title="Delete entry"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* BULLETS */}
                        {proj.bullets && proj.bullets.map((b, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-1 mt-0.5 group/b">
                            <span style={{ fontSize: '9pt', lineHeight: '1.35', flexShrink: 0, paddingLeft: '4px' }}>•</span>
                            <textarea
                              rows={1}
                              value={b}
                              onInput={autoResizeTextarea}
                              onChange={e => {
                                const updated = [...cvSections.projects];
                                updated[projIdx].bullets[bIdx] = e.target.value;
                                setCvSections({...cvSections, projects: updated});
                              }}
                              placeholder="Architected / Built..."
                              className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none resize-none transition"
                              style={{ fontSize: '8.5pt', lineHeight: '1.35', color: '#000000', textAlign: 'justify' }}
                            />
                            <button 
                              onClick={() => deleteProjectBullet(projIdx, bIdx)}
                              className="no-pdf text-gray-300 hover:text-rose-600 p-0.5 cursor-pointer shrink-0"
                              title="Delete bullet"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                );
              }

              // ------------------- SECTION: TECHNICAL SKILLS -------------------
              if (sectionKey === 'skills') {
                return (
                  <div key="skills" className="mt-3.5 mb-2 group/sec">
                    {/* SECTION TITLE & INLINE CONTROLS */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span style={{ 
                          fontWeight: 'bold', 
                          fontSize: '10.5pt', 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.8px', 
                          color: '#000000', 
                          fontFamily: 'Arial, Helvetica, sans-serif'
                        }}>
                          Technical Skills
                        </span>
                        
                        {/* INLINE ACTION BUTTONS */}
                        <div className="no-pdf flex items-center gap-1 font-sans text-[10px] text-gray-400">
                          <button onClick={() => moveSection(sIdx, -1)} disabled={sIdx === 0} className="hover:text-gray-800 disabled:opacity-20 cursor-pointer" title="Move Up">↑</button>
                          <button onClick={() => moveSection(sIdx, 1)} disabled={sIdx === sectionOrder.length - 1} className="hover:text-gray-800 disabled:opacity-20 cursor-pointer" title="Move Down">↓</button>
                        </div>
                      </div>

                      <button onClick={() => deleteSection('skills')} className="no-pdf text-[10px] font-sans text-gray-400 hover:text-rose-600 flex items-center gap-0.5 cursor-pointer">
                        <Trash2 className="w-3 h-3" /> delete section
                      </button>
                    </div>

                    {/* SECTION DIVIDER */}
                    <div style={{ width: '100%', height: '1px', backgroundColor: '#000000', marginTop: '2px', marginBottom: '4px' }}></div>

                    {/* SKILLS ROWS */}
                    <div className="space-y-1 mt-1 text-black" style={{ fontSize: '8.5pt', lineHeight: '1.4' }}>
                      
                      {/* LANGUAGES */}
                      <div className="flex items-baseline gap-1.5 group/sk">
                        <span style={{ fontWeight: 'bold' }}>Languages:</span>
                        <input 
                          type="text"
                          value={cvSections.skills.languages || ""}
                          onChange={e => setCvSections({...cvSections, skills: {...cvSections.skills, languages: e.target.value}})}
                          placeholder="Java, TypeScript, Python, C/C++, HTML, CSS"
                          className="flex-1 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none transition"
                        />
                      </div>

                      {/* FRAMEWORKS */}
                      <div className="flex items-baseline gap-1.5 group/sk">
                        <span style={{ fontWeight: 'bold' }}>Frameworks:</span>
                        <input 
                          type="text"
                          value={cvSections.skills.frameworks || ""}
                          onChange={e => setCvSections({...cvSections, skills: {...cvSections.skills, frameworks: e.target.value}})}
                          placeholder="Spring Boot, React, Next.js, PrimeFaces, Spring Security"
                          className="flex-1 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none transition"
                        />
                      </div>

                      {/* DEVELOPER TOOLS */}
                      <div className="flex items-baseline gap-1.5 group/sk">
                        <span style={{ fontWeight: 'bold' }}>Developer Tools:</span>
                        <input 
                          type="text"
                          value={cvSections.skills.developerTools || ""}
                          onChange={e => setCvSections({...cvSections, skills: {...cvSections.skills, developerTools: e.target.value}})}
                          placeholder="Linux, Git, Supabase, Stripe, Docker"
                          className="flex-1 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none transition"
                        />
                      </div>

                      {/* LIBRARIES */}
                      <div className="flex items-baseline gap-1.5 group/sk">
                        <span style={{ fontWeight: 'bold' }}>Libraries:</span>
                        <input 
                          type="text"
                          value={cvSections.skills.libraries || ""}
                          onChange={e => setCvSections({...cvSections, skills: {...cvSections.skills, libraries: e.target.value}})}
                          placeholder="PyTorch, SimpleITK, Flask, Plotly, NumPy, SciPy, Tailwind"
                          className="flex-1 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none transition"
                        />
                      </div>

                    </div>
                  </div>
                );
              }

              // ------------------- SECTION: SUMMARY -------------------
              if (sectionKey === 'summary') {
                return (
                  <div key="summary" className="mt-3.5 mb-2 group/sec">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span style={{ 
                          fontWeight: 'bold', 
                          fontSize: '10.5pt', 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.8px', 
                          color: '#000000', 
                          fontFamily: 'Arial, Helvetica, sans-serif'
                        }}>
                          Professional Summary
                        </span>
                        <div className="no-pdf flex items-center gap-1 font-sans text-[10px] text-gray-400">
                          <button onClick={() => moveSection(sIdx, -1)} disabled={sIdx === 0} className="hover:text-gray-800 disabled:opacity-20 cursor-pointer" title="Move Up">↑</button>
                          <button onClick={() => moveSection(sIdx, 1)} disabled={sIdx === sectionOrder.length - 1} className="hover:text-gray-800 disabled:opacity-20 cursor-pointer" title="Move Down">↓</button>
                        </div>
                      </div>
                      <button onClick={() => deleteSection('summary')} className="no-pdf text-[10px] font-sans text-gray-400 hover:text-rose-600 flex items-center gap-0.5 cursor-pointer">
                        <Trash2 className="w-3 h-3" /> delete section
                      </button>
                    </div>
                    <div style={{ width: '100%', height: '1px', backgroundColor: '#000000', marginTop: '2px', marginBottom: '4px' }}></div>
                    <textarea
                      rows={3}
                      value={cvSections.summary}
                      onInput={autoResizeTextarea}
                      onChange={e => setCvSections({...cvSections, summary: e.target.value})}
                      placeholder="Enter your professional summary..."
                      className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none resize-none transition"
                      style={{ fontSize: '9pt', color: '#000000', textAlign: 'justify', lineHeight: '1.35', fontFamily: 'Arial, Helvetica, sans-serif' }}
                    />
                  </div>
                );
              }

              return null;
            })}

          </div>
        </div>
      </div>

      {/* ================= MODAL: EDIT CONTACT DETAILS ================= */}
      {showEditContactModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 rounded-3xl border border-purple-500/30 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-purple-400" /> Editează Date de Contact & Header
              </h3>
              <button onClick={() => setShowEditContactModal(false)} className="p-1 text-gray-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1">Nume Complet:</label>
                <input 
                  type="text" 
                  value={cvSections.fullName} 
                  onChange={e => setCvSections({...cvSections, fullName: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-white" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">Email:</label>
                  <input 
                    type="email" 
                    value={cvSections.email} 
                    onChange={e => setCvSections({...cvSections, email: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-white" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">Telefon:</label>
                  <input 
                    type="text" 
                    value={cvSections.phone} 
                    onChange={e => setCvSections({...cvSections, phone: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-white" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1">Locație (Oraș, Țară):</label>
                <input 
                  type="text" 
                  value={cvSections.location} 
                  onChange={e => setCvSections({...cvSections, location: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-white" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">LinkedIn (URL sau handle):</label>
                  <input 
                    type="text" 
                    value={cvSections.linkedin} 
                    onChange={e => setCvSections({...cvSections, linkedin: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-white" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">GitHub (URL sau handle):</label>
                  <input 
                    type="text" 
                    value={cvSections.github} 
                    onChange={e => setCvSections({...cvSections, github: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-white" 
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                onClick={() => setShowEditContactModal(false)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
              >
                Gata (Actualizează)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: AI 100% ATS OPTIMIZATION ================= */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card max-w-4xl w-full p-6 rounded-3xl border border-purple-500/30 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-600/30 text-purple-400 rounded-xl">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Pipeline AI cu 2 Agenți Groq (Match 100%)</h3>
                  <p className="text-[11px] text-gray-400">Analiză diferențe ATS + Rescriere completă a experienței candidatului</p>
                </div>
              </div>
              <button onClick={() => setShowAiModal(false)} className="p-1 text-gray-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SELECTION ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {applications.length > 0 && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">Selectează Jobul din Tracker:</label>
                  <select 
                    value={selectedJobId}
                    onChange={e => setSelectedJobId(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white"
                  >
                    {applications.map(app => (
                      <option key={app.id} value={app.id}>{app.jobTitle} la {app.companyName}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1">Sau introdu cerințe job personalizate:</label>
                <input 
                  type="text" 
                  placeholder="ex: Java 21, Spring Boot, Microservices, Kubernetes, Redis"
                  value={customJobDescription}
                  onChange={e => setCustomJobDescription(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
            </div>

            <button
              onClick={handleRunTwoAgentPipeline}
              disabled={isAnalyzing}
              className="w-full py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  Se rulează Agent 1 (Gap Analyzer) & Agent 2 (Groq LLM Rewriter)...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Rulează Analiza și Rescrierea AI (Groq Live)
                </>
              )}
            </button>

            {/* RESULTS ROW */}
            {(agent1Output || agent2Output) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* AGENT 1 CARD */}
                {agent1Output && (
                  <div className="p-4 bg-gray-950/80 rounded-2xl border border-blue-500/30 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-400 flex items-center gap-1.5">
                        <Target className="w-4 h-4" /> Agent 1: Gap Analyzer
                      </span>
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded font-mono font-bold text-[10px]">
                        Scor: 100%
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                        <span className="text-[10px] font-bold text-emerald-400 block">Skill-uri Match:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {agent1Output.matchingSkills.map(s => (
                            <span key={s} className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">{s}</span>
                          ))}
                        </div>
                      </div>

                      <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20">
                        <span className="text-[10px] font-bold text-rose-400 block">Cuvinte Cheie de Adăugat:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {agent1Output.missingSkills.map(s => (
                            <span key={s} className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-bold">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AGENT 2 CARD */}
                {agent2Output && (
                  <div className="p-4 bg-gray-950/80 rounded-2xl border border-purple-500/30 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-400 flex items-center gap-1.5">
                        <BrainCircuit className="w-4 h-4" /> Agent 2: CV Rewriter (100%)
                      </span>
                      <button
                        onClick={handleApplyAiOptimizations}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 shadow transition"
                      >
                        <Check className="w-3 h-3" /> Aplică direct în CV
                      </button>
                    </div>

                    {agent2Output.tailoredSummary && (
                      <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20 space-y-1">
                        <span className="text-[10px] font-bold text-purple-300">Summary Re-scris:</span>
                        <p className="text-[11px] text-gray-200 italic">{agent2Output.tailoredSummary}</p>
                      </div>
                    )}

                    {agent2Output.tailoredProjects?.[0]?.bullets?.length > 0 && (
                      <div className="p-2.5 bg-gray-900/60 rounded-xl border border-gray-800 space-y-1 max-h-36 overflow-y-auto">
                        <span className="text-[10px] font-bold text-amber-400">Bullet-uri Metoda XYZ:</span>
                        {agent2Output.tailoredProjects[0].bullets.map((b, idx) => (
                          <p key={idx} className="text-[10px] text-gray-300 flex items-start gap-1">
                            <span className="text-purple-400">•</span> <span>{b}</span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
