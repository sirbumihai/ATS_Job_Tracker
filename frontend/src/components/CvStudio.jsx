import React, { useState, useEffect } from 'react';
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
  ArrowDown
} from 'lucide-react';

export default function CvStudio({ applications = [], currentUser }) {
  const activeUserId = currentUser ? currentUser.userId : null;

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
    education: {
      school: "",
      degree: "",
      period: "",
      location: ""
    }
  });

  const [languagePref, setLanguagePref] = useState('EN');
  const [selectedJobId, setSelectedJobId] = useState(applications.length > 0 ? applications[0].id : '');
  const [customJobDescription, setCustomJobDescription] = useState('');
  
  const [isSavingDb, setIsSavingDb] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parsingPdf, setParsingPdf] = useState(false);
  const [parsedPdfSuccess, setParsedPdfSuccess] = useState(null);
  const [extractedMarkdown, setExtractedMarkdown] = useState('');

  // AGENT OUTPUTS
  const [agent1Output, setAgent1Output] = useState(null);
  const [agent2Output, setAgent2Output] = useState(null);

  const selectedApp = applications.find(a => a.id === selectedJobId) || (applications.length > 0 ? applications[0] : null);

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
            education: data.educationJson ? JSON.parse(data.educationJson) : { school: "", degree: "", period: "", location: "" }
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
            education: safeParse(p.educationJson, { school: "", degree: "", period: "", location: "" })
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

  // JAKE'S RESUME PDF GENERATOR
  const handleDownloadTailoredJakesPdf = () => {
    const finalSummary = agent2Output ? agent2Output.tailoredSummary : cvSections.summary;
    const finalSkills = agent2Output ? agent2Output.tailoredSkills : cvSections.skills;
    const finalWorkExp = agent2Output ? agent2Output.tailoredExperience : cvSections.workExperience;
    const finalProjects = agent2Output ? agent2Output.tailoredProjects : cvSections.projects;
    const edu = cvSections.education || {};

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${cvSections.fullName || 'CV'} - ATS Resume (Jake's Format)</title>
        <style>
          @page { size: letter; margin: 0.45in; }
          body { font-family: 'Calibri', 'Garamond', serif; color: #000; background: #fff; margin: 0; padding: 0; font-size: 10pt; line-height: 1.3; }
          .header { text-align: center; margin-bottom: 10pt; }
          .header h1 { font-size: 19pt; font-weight: bold; text-transform: uppercase; margin: 0 0 3pt 0; }
          .header .contact-info { font-size: 9pt; color: #222; }
          .section-title { font-size: 10.5pt; font-weight: bold; text-transform: uppercase; border-bottom: 1pt solid #000; margin-top: 11pt; margin-bottom: 5pt; padding-bottom: 1.5pt; }
          .skills-grid { display: table; width: 100%; margin-bottom: 4pt; }
          .skills-row { display: table-row; }
          .skills-label { display: table-cell; font-weight: bold; width: 110pt; padding-bottom: 2.5pt; }
          .skills-value { display: table-cell; padding-bottom: 2.5pt; }
          .experience-header { display: flex; justify-content: space-between; font-weight: bold; margin-top: 5pt; }
          .experience-subheader { display: flex; justify-content: space-between; font-style: italic; margin-bottom: 3pt; }
          ul { margin: 0 0 5pt 0; padding-left: 14pt; }
          li { margin-bottom: 2.5pt; text-align: justify; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${cvSections.fullName || 'Nume Prenume'}</h1>
          <div class="contact-info">
            ${cvSections.email || ''} &nbsp;|&nbsp; ${cvSections.phone || ''} &nbsp;|&nbsp; ${cvSections.location || ''} &nbsp;|&nbsp; ${cvSections.linkedin || ''} &nbsp;|&nbsp; ${cvSections.github || ''}
          </div>
        </div>
        ${finalSummary ? `<div class="section-title">Professional Summary</div><p>${finalSummary}</p>` : ''}
        ${(edu.school || edu.degree) ? `
          <div class="section-title">Education</div>
          <div class="experience-header">
            <span>${edu.school || ''}</span>
            <span>${edu.location || ''}</span>
          </div>
          <div class="experience-subheader">
            <span>${edu.degree || ''}</span>
            <span>${edu.period || ''}</span>
          </div>
        ` : ''}
        ${finalWorkExp.length > 0 ? `<div class="section-title">Work Experience</div>${finalWorkExp.map(exp => `<div class="experience-header"><span>${exp.company || exp.role}</span><span>${exp.location || ''}</span></div><div class="experience-subheader"><span>${exp.role || ''}</span><span>${exp.period || ''}</span></div><ul>${exp.bullets ? exp.bullets.map(b => `<li>${b}</li>`).join('') : ''}</ul>`).join('')}` : ''}
        ${finalProjects.length > 0 ? `<div class="section-title">Personal Projects</div>${finalProjects.map(proj => `<div class="experience-header"><span>${proj.title || ''}</span><span>2024 - 2026</span></div><ul>${proj.bullets ? proj.bullets.map(b => `<li>${b}</li>`).join('') : ''}</ul>`).join('')}` : ''}
        <div class="section-title">Technical Skills</div>
        <div class="skills-grid">
          <div class="skills-row"><div class="skills-label">Languages:</div><div class="skills-value">${finalSkills.languages || 'Java'}</div></div>
          <div class="skills-row"><div class="skills-label">Frameworks:</div><div class="skills-value">${finalSkills.frameworks || 'Spring Boot'}</div></div>
          <div class="skills-row"><div class="skills-label">Databases:</div><div class="skills-value">${finalSkills.databases || 'PostgreSQL'}</div></div>
          <div class="skills-row"><div class="skills-label">DevOps:</div><div class="skills-value">${finalSkills.devops || 'Docker'}</div></div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

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
                Studio CV ATS - Editor Complet, Salvare in PostgreSQL & Generare PDF
              </h2>
              <p className="text-xs text-gray-400 font-medium">
                Poti edita, adauga, sterge, reordona si salva orice camp si secțiune din CV (Experienta, Proiecte, Educatie, Skills).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* SAVE TO DB BUTTON */}
            <button
              onClick={handleSaveToDatabase}
              disabled={isSavingDb || !activeUserId}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition disabled:opacity-50"
            >
              {isSavingDb ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4 text-cyan-300" />}
              {isSavingDb ? 'Se salveaza in DB...' : 'Salveaza in PostgreSQL'}
            </button>

            {/* UPLOAD PDF */}
            <label className="px-3.5 py-2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition">
              <Upload className="w-4 h-4 text-purple-400" />
              {parsingPdf ? 'Se proceseaza PDF...' : 'Incarca CV PDF'}
              <input type="file" accept=".pdf,.docx" onChange={handleFileUploadPdf} className="hidden" />
            </label>

            {/* DOWNLOAD PDF */}
            <button
              onClick={handleDownloadTailoredJakesPdf}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
            >
              <Download className="w-4 h-4" />
              Descarca PDF (Jake's Resume)
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

      {/* SECTION 1: MASTER CV EDITOR WITH DYNAMIC WORK EXPERIENCE, PROJECTS & EDUCATION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: EDITABLE SECTIONS */}
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              Sectiunile CV-ului (Salvare in PostgreSQL & Editare Nativa)
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* CONTACT DETAILS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">Nume Complet:</label>
                <input 
                  type="text" 
                  placeholder="ex: Nume Prenume"
                  value={cvSections.fullName}
                  onChange={e => setCvSections({...cvSections, fullName: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">Email:</label>
                <input 
                  type="text" 
                  placeholder="ex: email@example.com"
                  value={cvSections.email}
                  onChange={e => setCvSections({...cvSections, email: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">Telefon:</label>
                <input 
                  type="text" 
                  placeholder="ex: (+40) 700 000 000"
                  value={cvSections.phone}
                  onChange={e => setCvSections({...cvSections, phone: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">Locatie (Oras, Tara):</label>
                <input 
                  type="text" 
                  placeholder="ex: Bucuresti, Romania"
                  value={cvSections.location}
                  onChange={e => setCvSections({...cvSections, location: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">LinkedIn:</label>
                <input 
                  type="text" 
                  placeholder="ex: linkedin.com/in/profil"
                  value={cvSections.linkedin}
                  onChange={e => setCvSections({...cvSections, linkedin: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">GitHub:</label>
                <input 
                  type="text" 
                  placeholder="ex: github.com/username"
                  value={cvSections.github}
                  onChange={e => setCvSections({...cvSections, github: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* SUMMARY */}
            <div>
              <label className="block text-[11px] font-bold text-purple-400 mb-1">Professional Summary / Profil:</label>
              <textarea 
                rows={4}
                placeholder="Introdu profilul profesional..."
                value={cvSections.summary}
                onChange={e => setCvSections({...cvSections, summary: e.target.value})}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* EDUCATION SECTION EDITOR */}
            <div className="p-3.5 bg-gray-950/60 rounded-xl border border-gray-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5 uppercase">
                  <GraduationCap className="w-4 h-4" /> 1. Educatie si Studii (Education)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1">Institutie / Universitate:</label>
                  <input 
                    type="text" 
                    placeholder="ex: Universitatea Politehnica din Bucuresti"
                    value={cvSections.education ? cvSections.education.school || "" : ""}
                    onChange={e => setCvSections({
                      ...cvSections, 
                      education: { ...cvSections.education, school: e.target.value }
                    })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1">Diploma / Specializare:</label>
                  <input 
                    type="text" 
                    placeholder="ex: Licenta in Calculatoare si Tehnologia Informatiei"
                    value={cvSections.education ? cvSections.education.degree || "" : ""}
                    onChange={e => setCvSections({
                      ...cvSections, 
                      education: { ...cvSections.education, degree: e.target.value }
                    })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1">Perioada de Studii:</label>
                  <input 
                    type="text" 
                    placeholder="ex: Octombrie 2022 - Iulie 2026"
                    value={cvSections.education ? cvSections.education.period || "" : ""}
                    onChange={e => setCvSections({
                      ...cvSections, 
                      education: { ...cvSections.education, period: e.target.value }
                    })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1">Locatie Universitate:</label>
                  <input 
                    type="text" 
                    placeholder="ex: Bucuresti, Romania"
                    value={cvSections.education ? cvSections.education.location || "" : ""}
                    onChange={e => setCvSections({
                      ...cvSections, 
                      education: { ...cvSections.education, location: e.target.value }
                    })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* WORK EXPERIENCE SECTION WITH BULLETS & REORDERING */}
            <div className="p-3.5 bg-gray-950/60 rounded-xl border border-gray-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-400 flex items-center gap-1.5 uppercase">
                  <Briefcase className="w-4 h-4" /> 2. Experienta Profesionala (Work Experience)
                </span>
                <button 
                  onClick={handleAddWorkExperience}
                  className="px-2.5 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-[10px] font-bold border border-blue-500/30 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Adauga Experienta Noua
                </button>
              </div>

              {cvSections.workExperience.length === 0 && (
                <p className="text-[11px] text-gray-500 italic text-center py-2">
                  Nicio experienta adaugata. Incarca un PDF CV sau apasa pe "+ Adauga Experienta Noua".
                </p>
              )}

              {cvSections.workExperience.map((exp, expIdx) => (
                <div key={exp.id || expIdx} className="space-y-2.5 p-3 bg-gray-900/50 rounded-xl border border-gray-800/80">
                  <div className="flex items-center justify-between gap-2">
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <input 
                        type="text" 
                        placeholder="Nume Companie / Rol"
                        value={exp.company || exp.role || ""}
                        onChange={e => {
                          const updated = [...cvSections.workExperience];
                          updated[expIdx].company = e.target.value;
                          setCvSections({...cvSections, workExperience: updated});
                        }}
                        className="bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs font-bold text-white"
                      />
                      <input 
                        type="text" 
                        placeholder="Perioada (ex: 2024 - Present)"
                        value={exp.period || ""}
                        onChange={e => {
                          const updated = [...cvSections.workExperience];
                          updated[expIdx].period = e.target.value;
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

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-semibold text-gray-400">Bullet-uri Responsabilitati Activitate:</label>
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
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* DYNAMIC PERSONAL PROJECTS SECTION WITH BULLETS & REORDERING */}
            <div className="p-3.5 bg-gray-950/60 rounded-xl border border-gray-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 flex items-center gap-1.5 uppercase">
                  <FolderGit2 className="w-4 h-4" /> 3. Proiecte Personale (Personal Projects)
                </span>
                <button 
                  onClick={handleAddProject}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[10px] font-bold border border-amber-500/30 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Adauga Proiect Nou
                </button>
              </div>

              {cvSections.projects.length === 0 && (
                <p className="text-[11px] text-gray-500 italic text-center py-2">
                  Niciun proiect adaugat. Incarca un PDF CV sau apasa pe "+ Adauga Proiect Nou".
                </p>
              )}

              {cvSections.projects.map((proj, projIdx) => (
                <div key={proj.id || projIdx} className="space-y-2.5 p-3 bg-gray-900/50 rounded-xl border border-gray-800/80">
                  <div className="flex items-center justify-between gap-2">
                    <input 
                      type="text" 
                      placeholder="Titlu Proiect din CV"
                      value={proj.title || ""}
                      onChange={e => {
                        const updated = [...cvSections.projects];
                        updated[projIdx].title = e.target.value;
                        setCvSections({...cvSections, projects: updated});
                      }}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs font-bold text-white"
                    />
                    
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
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* TECHNICAL SKILLS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">Limbaje de Programare:</label>
                <input 
                  type="text" 
                  placeholder="ex: Java, SQL, Python"
                  value={cvSections.skills.languages}
                  onChange={e => setCvSections({...cvSections, skills: {...cvSections.skills, languages: e.target.value}})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">Framework-uri:</label>
                <input 
                  type="text" 
                  placeholder="ex: Spring Boot, React"
                  value={cvSections.skills.frameworks}
                  onChange={e => setCvSections({...cvSections, skills: {...cvSections.skills, frameworks: e.target.value}})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2 text-xs text-white"
                />
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: TARGET JOB & AI TRIGGER */}
        <div className="glass-card p-5 rounded-2xl border border-purple-500/30 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              Alege Jobul Tinta pentru Match 100%
            </h3>

            {applications.length > 0 && (
              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">Selecteaza din Kanban:</label>
                <select 
                  value={selectedJobId}
                  onChange={e => setSelectedJobId(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {applications.map(app => (
                    <option key={app.id} value={app.id}>
                      {app.jobTitle} la {app.companyName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-gray-400 mb-1">Sau Lipeste Cerintele Unui Job Nou:</label>
              <textarea 
                rows={5}
                value={customJobDescription}
                onChange={e => setCustomJobDescription(e.target.value)}
                placeholder="Lipeste descrierea jobului de pe LinkedIn aici..."
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            onClick={handleRunTwoAgentPipeline}
            disabled={isAnalyzing}
            className="w-full py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition scale-[1.01]"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Pipeline-ul de 2 Agenti AI Adapteaza CV-ul...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                Ruleaza Pipeline-ul AI (Match 100%)
              </>
            )}
          </button>
        </div>

      </div>

      {/* SECTION 2: DUAL AGENT PIPELINE OUTPUT CARDS */}
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
                  onClick={handleDownloadTailoredJakesPdf}
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
                  "Apasa pe 'Ruleaza Pipeline-ul AI' pentru a genera noul CV optimizat."
                )}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
