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
  Award,
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
  Link as LinkIcon,
  Globe
} from 'lucide-react';

export default function CvStudio({ applications = [], currentUser }) {
  const activeUserId = currentUser ? currentUser.userId : null;
  const previewRef = useRef(null);
  const workbenchRef = useRef(null);

  // MASTER CONTACT STATE
  const [contactData, setContactData] = useState({
    fullName: currentUser ? (currentUser.fullName || "Sîrbu Mihai-Alexandru") : "Sîrbu Mihai-Alexandru",
    email: currentUser ? (currentUser.email || "sarbumihai0@gmail.com") : "sarbumihai0@gmail.com",
    phone: "(+40) 723 034 706",
    location: "Bucharest, Romania",
    linkedin: "https://www.linkedin.com/in/sirbu-mihai-86133b181/",
    linkedinFull: false,
    github: "https://github.com/sirbumihai",
    githubFull: false,
    portfolio: "",
    portfolioFull: false,
    blog: "",
    blogFull: false,
    social: "",
    socialFull: false
  });

  // CV SECTIONS STATE
  const [educationList, setEducationList] = useState([
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
  ]);

  const [experienceList, setExperienceList] = useState([
    {
      id: 1,
      role: "Software Engineering Intern",
      company: "SIMAVI (Software Imagination & Vision)",
      period: "June 2025 – August 2025",
      location: "Bucharest, Romania",
      bullets: [
        "Optimized data retrieval for a library management system by architecting a normalized MySQL schema with strategic indexing and implementing custom Spring Data JPA repositories, achieving sub-second latency for complex queries across 50,000+ records.",
        "Developed and maintained enterprise-grade features using Java, Spring Boot, and PrimeFaces, ensuring seamless integration with legacy systems and enhancing UI responsiveness."
      ]
    }
  ]);

  const [projectsList, setProjectsList] = useState([
    {
      id: 1,
      title: "3D Medical Image Segmentation",
      techStack: "Python, PyTorch, SimpleITK, Flask, Plotly, NumPy, SciPy, Nibabel",
      period: "February 2026 – June 2026",
      linkUrl: "",
      linkText: "",
      bullets: [
        "Architected a high-throughput medical data pipeline using SimpleITK to process 1,506 multi-center cases, reducing data preprocessing time by 40% and ensuring standardized inputs for segmentation models via isotropic resampling."
      ]
    },
    {
      id: 2,
      title: "OneRep – Fitness Tracking Web Application",
      techStack: "Next.js, React, TypeScript, Supabase, PostgreSQL, Tailwind",
      period: "October 2025 – January 2026",
      linkUrl: "https://one-rep.vercel.app",
      linkText: "one-rep.vercel.app",
      bullets: [
        "Engineered a scalable fitness tracking platform using Next.js and Supabase, enforcing granular data security via 8 RLS policies and automating subscription workflows via Stripe webhooks, which reduced manual payment processing overhead by 25%."
      ]
    },
    {
      id: 3,
      title: "Banking Application",
      techStack: "Java, Spring Boot, Spring Security, MySQL, Thymeleaf",
      period: "November 2024 – January 2025",
      linkUrl: "",
      linkText: "",
      bullets: [
        "Architected a secure full-stack banking platform with Spring Security and Thymeleaf, implementing custom transaction categorization logic that reduced manual reconciliation time by 30% and improved data accuracy for 500+ monthly transactions."
      ]
    }
  ]);

  // CERTIFICATIONS STATE
  const [certificationsList, setCertificationsList] = useState([
    {
      id: 1,
      name: "Oracle Certified Professional: Java SE 21 Developer",
      issuer: "Oracle",
      period: "May 2025",
      bullets: [
        "Demonstrated proficiency in core Java, modern concurrency, virtual threads, and JVM performance tuning."
      ]
    }
  ]);

  // TECHNICAL SKILLS FIELDS STATE
  const [skillsFields, setSkillsFields] = useState([
    {
      id: 'languages',
      label: 'Languages',
      items: ['Java', 'TypeScript', 'Python', 'C/C++', 'HTML', 'CSS']
    },
    {
      id: 'frameworks',
      label: 'Frameworks',
      items: ['Spring Boot', 'React', 'Next.js', 'PrimeFaces', 'Spring Security', 'Thymeleaf']
    },
    {
      id: 'developer_tools',
      label: 'Developer Tools',
      items: ['Linux', 'Git', 'Supabase', 'Stripe']
    },
    {
      id: 'libraries',
      label: 'Libraries',
      items: ['PyTorch', 'SimpleITK', 'Flask', 'Plotly', 'NumPy', 'SciPy', 'Nibabel', 'Tailwind', 'Bootstrap']
    }
  ]);

  const [summaryText, setSummaryText] = useState("Computer Science & Engineering graduate with software engineering internship experience specializing in full-stack development and deep learning. Proficient in Java (Spring Boot), TypeScript (React), and Python (PyTorch), with a track record of building secure web applications and high-performance 3D segmentation models.");

  // SECTION ORDER
  const [sectionOrder, setSectionOrder] = useState(['education', 'experience', 'projects', 'skills']);
  
  // UI CONTROLS & INTERACTIVITY STATES (DEFAULT 100% ZOOM)
  const [previewZoom, setPreviewZoom] = useState(1.0);
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  
  // DIRECT SINGLE-BUTTON POPUP DELETION TARGET
  const [selectedTarget, setSelectedTarget] = useState(null); // { type: 'skill'|'field'|'bullet'|'item', section: string, idx: number, subIdx?: number }
  const [addingSkillFieldIdx, setAddingSkillFieldIdx] = useState(null);
  const [newSkillText, setNewSkillText] = useState("");
  
  // AUTO-SAVE STATES
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState(null);
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);
  
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parsingPdf, setParsingPdf] = useState(false);
  const [parsedPdfSuccess, setParsedPdfSuccess] = useState(null);

  // AGENT OUTPUTS
  const [agent1Output, setAgent1Output] = useState(null);
  const [agent2Output, setAgent2Output] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(applications.length > 0 ? applications[0].id : '');
  const [customJobDescription, setCustomJobDescription] = useState('');

  // DISMISS POPUPS ON OUTSIDE CLICK
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.cv-popup-target')) {
        setSelectedTarget(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // LOAD FROM DATABASE ON MOUNT
  const fetchCvFromDatabase = async () => {
    if (!activeUserId) return;
    try {
      const res = await fetch('/api/v1/cv', {
        headers: { 'X-User-Id': activeUserId }
      });
      if (res.ok && res.status !== 204) {
        const data = await res.json();
        if (data) {
          setContactData(prev => ({
            ...prev,
            fullName: data.fullName || prev.fullName,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
            location: data.location || prev.location,
            linkedin: data.linkedin || prev.linkedin,
            github: data.github || prev.github
          }));

          if (data.educationJson) {
            try {
              const edu = JSON.parse(data.educationJson);
              if (Array.isArray(edu) && edu.length > 0) setEducationList(edu);
            } catch (e) {}
          }
          if (data.workExperienceJson) {
            try {
              const exp = JSON.parse(data.workExperienceJson);
              if (Array.isArray(exp) && exp.length > 0) setExperienceList(exp);
            } catch (e) {}
          }
          if (data.projectsJson) {
            try {
              const proj = JSON.parse(data.projectsJson);
              if (Array.isArray(proj) && proj.length > 0) setProjectsList(proj);
            } catch (e) {}
          }
          if (data.summary) setSummaryText(data.summary);
        }
      }
    } catch (err) {
      console.error("Eroare la citirea CV-ului din DB:", err);
    } finally {
      setIsInitialLoadDone(true);
    }
  };

  useEffect(() => {
    fetchCvFromDatabase();
  }, [activeUserId]);

  // AUTOMATIC REAL-TIME DEBOUNCED DATABASE SAVE
  useEffect(() => {
    if (!isInitialLoadDone || !activeUserId) return;

    const timer = setTimeout(async () => {
      setIsAutoSaving(true);
      try {
        const payload = {
          fullName: contactData.fullName,
          email: contactData.email,
          phone: contactData.phone,
          location: contactData.location,
          linkedin: contactData.linkedin,
          github: contactData.github,
          summary: summaryText,
          skillsLanguages: skillsFields.find(f => f.id === 'languages')?.items.join(', ') || "",
          skillsFrameworks: skillsFields.find(f => f.id === 'frameworks')?.items.join(', ') || "",
          skillsDevops: skillsFields.find(f => f.id === 'developer_tools')?.items.join(', ') || "",
          skillsDatabases: skillsFields.find(f => f.id === 'libraries')?.items.join(', ') || "",
          workExperienceJson: JSON.stringify(experienceList),
          projectsJson: JSON.stringify(projectsList),
          educationJson: JSON.stringify(educationList),
          languagePreference: "EN"
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
          setLastAutoSavedTime(new Date());
        }
      } catch (err) {
        console.error("Eroare la salvarea automata:", err);
      } finally {
        setIsAutoSaving(false);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [
    isInitialLoadDone,
    activeUserId,
    contactData,
    educationList,
    experienceList,
    projectsList,
    certificationsList,
    skillsFields,
    summaryText,
    sectionOrder
  ]);

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

  // REORDER ITEMS WITHIN SECTIONS
  const moveProjectItem = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= projectsList.length) return;
    const updated = [...projectsList];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setProjectsList(updated);
  };

  const moveExperienceItem = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= experienceList.length) return;
    const updated = [...experienceList];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setExperienceList(updated);
  };

  const moveEducationItem = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= educationList.length) return;
    const updated = [...educationList];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setEducationList(updated);
  };

  const moveCertificationItem = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= certificationsList.length) return;
    const updated = [...certificationsList];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setCertificationsList(updated);
  };

  const moveSkillFieldItem = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= skillsFields.length) return;
    const updated = [...skillsFields];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setSkillsFields(updated);
  };

  // EDUCATION HANDLERS
  const addEducation = () => {
    const newEdu = {
      id: Date.now(),
      school: "University / School Name",
      degree: "Bachelor of Computer Science & Engineering",
      period: "",
      location: "Bucharest, Romania",
      bullets: []
    };
    setEducationList(prev => [...prev, newEdu]);
  };

  const deleteEducation = (id) => {
    setEducationList(prev => prev.filter(e => e.id !== id));
    setSelectedTarget(null);
  };

  const addEduBullet = (eduIdx) => {
    const updated = [...educationList];
    if (!updated[eduIdx].bullets) updated[eduIdx].bullets = [];
    updated[eduIdx].bullets.push("Courses: Data Structures & Algorithms, Software Engineering...");
    setEducationList(updated);
  };

  const deleteEduBullet = (eduIdx, bIdx) => {
    const updated = [...educationList];
    updated[eduIdx].bullets = updated[eduIdx].bullets.filter((_, idx) => idx !== bIdx);
    setEducationList(updated);
    setSelectedTarget(null);
  };

  // EXPERIENCE HANDLERS
  const addExperience = () => {
    const newExp = {
      id: Date.now(),
      role: "Software Engineering Intern",
      company: "Company Name",
      period: "",
      location: "City, Country",
      bullets: ["Accomplished key task using Java, Spring Boot, reducing latency by 25%."]
    };
    setExperienceList(prev => [...prev, newExp]);
  };

  const deleteExperience = (id) => {
    setExperienceList(prev => prev.filter(e => e.id !== id));
    setSelectedTarget(null);
  };

  const addExpBullet = (expIdx) => {
    const updated = [...experienceList];
    if (!updated[expIdx].bullets) updated[expIdx].bullets = [];
    updated[expIdx].bullets.push("Developed scalable feature and enhanced UI responsiveness.");
    setExperienceList(updated);
  };

  const deleteExpBullet = (expIdx, bIdx) => {
    const updated = [...experienceList];
    updated[expIdx].bullets = updated[expIdx].bullets.filter((_, idx) => idx !== bIdx);
    setExperienceList(updated);
    setSelectedTarget(null);
  };

  // PROJECTS HANDLERS
  const addProject = () => {
    const newProj = {
      id: Date.now(),
      title: "Project Title",
      techStack: "Java, Spring Boot, React, PostgreSQL",
      period: "",
      linkUrl: "",
      linkText: "",
      bullets: ["Architected and delivered full-stack platform features..."]
    };
    setProjectsList(prev => [...prev, newProj]);
  };

  const deleteProject = (id) => {
    setProjectsList(prev => prev.filter(p => p.id !== id));
    setSelectedTarget(null);
  };

  const addProjectBullet = (projIdx) => {
    const updated = [...projectsList];
    if (!updated[projIdx].bullets) updated[projIdx].bullets = [];
    updated[projIdx].bullets.push("Architected high-performance feature using modern architecture...");
    setProjectsList(updated);
  };

  const deleteProjectBullet = (projIdx, bIdx) => {
    const updated = [...projectsList];
    updated[projIdx].bullets = updated[projIdx].bullets.filter((_, idx) => idx !== bIdx);
    setProjectsList(updated);
    setSelectedTarget(null);
  };

  // CERTIFICATIONS HANDLERS
  const addCertification = () => {
    const newCert = {
      id: Date.now(),
      name: "Certification Name",
      issuer: "Issuing Organization",
      period: "",
      bullets: []
    };
    setCertificationsList(prev => [...prev, newCert]);
  };

  const deleteCertification = (id) => {
    setCertificationsList(prev => prev.filter(c => c.id !== id));
    setSelectedTarget(null);
  };

  const addCertBullet = (certIdx) => {
    const updated = [...certificationsList];
    if (!updated[certIdx].bullets) updated[certIdx].bullets = [];
    updated[certIdx].bullets.push("Key skill validated or project domain covered...");
    setCertificationsList(updated);
  };

  const deleteCertBullet = (certIdx, bIdx) => {
    const updated = [...certificationsList];
    updated[certIdx].bullets = updated[certIdx].bullets.filter((_, idx) => idx !== bIdx);
    setCertificationsList(updated);
    setSelectedTarget(null);
  };

  // SKILLS HANDLERS
  const handleCommitSkill = (fieldIdx) => {
    if (newSkillText && newSkillText.trim()) {
      const updated = [...skillsFields];
      updated[fieldIdx].items.push(newSkillText.trim());
      setSkillsFields(updated);
    }
    setAddingSkillFieldIdx(null);
    setNewSkillText("");
  };

  const deleteSkillItem = (fieldIdx, itemIdx) => {
    const updated = [...skillsFields];
    updated[fieldIdx].items = updated[fieldIdx].items.filter((_, idx) => idx !== itemIdx);
    setSkillsFields(updated);
    setSelectedTarget(null);
  };

  const addSkillField = () => {
    const labelName = prompt("Introdu numele noii categorii de skill-uri (ex: Cloud & DevOps, Databases):");
    if (!labelName || !labelName.trim()) return;
    const cleanLabel = labelName.replace(/:+$/, '').trim();
    const newField = {
      id: 'field_' + Date.now(),
      label: cleanLabel,
      items: ['Skill Example']
    };
    setSkillsFields(prev => [...prev, newField]);
  };

  const deleteSkillField = (fieldIdx) => {
    setSkillsFields(prev => prev.filter((_, idx) => idx !== fieldIdx));
    setSelectedTarget(null);
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

          setContactData(prev => ({
            ...prev,
            fullName: p.fullName || prev.fullName,
            email: p.email || prev.email,
            phone: p.phone || prev.phone,
            location: p.location || prev.location,
            linkedin: p.linkedin || prev.linkedin,
            github: p.github || prev.github
          }));

          if (p.summary) setSummaryText(p.summary);

          const parsedEdu = safeParse(p.educationJson, []);
          if (Array.isArray(parsedEdu) && parsedEdu.length > 0) setEducationList(parsedEdu);

          const parsedExp = safeParse(p.workExperienceJson, []);
          if (Array.isArray(parsedExp) && parsedExp.length > 0) setExperienceList(parsedExp);

          const parsedProj = safeParse(p.projectsJson, []);
          if (Array.isArray(parsedProj) && parsedProj.length > 0) setProjectsList(parsedProj);
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

  // REAL 2-AGENT GROQ AI PIPELINE
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
        languagePreference: "EN"
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
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyAiOptimizations = () => {
    if (!agent2Output) return;

    if (agent2Output.tailoredSummary) {
      setSummaryText(agent2Output.tailoredSummary);
      if (!sectionOrder.includes('summary')) {
        setSectionOrder(prev => ['summary', ...prev]);
      }
    }

    if (agent2Output.tailoredProjects?.[0]?.bullets?.length > 0 && projectsList.length > 0) {
      const updated = [...projectsList];
      updated[0].bullets = agent2Output.tailoredProjects[0].bullets;
      setProjectsList(updated);
    }

    alert("Optimizarile generate de AI Groq au fost aplicate direct pe foaia de CV!");
  };

  // DIRECT PDF DOWNLOAD
  const handleDownloadDirectPdf = async () => {
    const element = previewRef.current || document.getElementById('cv-preview-sheet');
    if (!element) {
      alert("Nu s-a putut gasi fisa CV-ului.");
      return;
    }

    setIsDownloadingPdf(true);

    try {
      const sanitizedName = (contactData.fullName || 'CV').trim().replace(/\s+/g, '_');
      
      const currentTransform = element.style.transform;
      element.style.transform = 'none';

      // Hide all .no-pdf helper controls
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

      helperElements.forEach(el => { el.style.display = ''; });
      element.style.transform = currentTransform;
    } catch (err) {
      console.error("Eroare la generarea PDF-ului:", err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      
      {/* MINIMALIST WHITE & BLACK TOOLBAR */}
      <div className="bg-white border border-gray-200/90 shadow-sm p-4 sm:p-5 rounded-2xl space-y-4 text-gray-900">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-black text-white rounded-xl shrink-0 shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-950 tracking-tight flex items-center gap-2">
                CV Canvas Studio
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Editare directă în pagină. Modificările se salvează automat în timp real.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* REAL-TIME AUTO-SAVE STATUS INDICATOR */}
            <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs flex items-center gap-1.5">
              {isAutoSaving ? (
                <span className="text-gray-700 font-medium flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-gray-500" /> Se salvează...
                </span>
              ) : (
                <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Salvat automat
                </span>
              )}
            </div>

            {/* AI OPTIMIZE BUTTON */}
            <button
              onClick={() => setShowAiModal(true)}
              className="px-3.5 py-1.5 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-black" />
              Optimizare AI ATS 100%
            </button>

            {/* IMPORT PDF BUTTON */}
            <label className="px-3.5 py-1.5 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 rounded-lg font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition">
              <Upload className="w-3.5 h-3.5 text-gray-700" />
              {parsingPdf ? 'Se extrage...' : 'Importă PDF'}
              <input type="file" accept=".pdf,.docx" onChange={handleFileUploadPdf} className="hidden" />
            </label>

            {/* DOWNLOAD PDF BUTTON */}
            <button
              onClick={handleDownloadDirectPdf}
              disabled={isDownloadingPdf}
              className="px-4 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-60 cursor-pointer"
            >
              {isDownloadingPdf ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              {isDownloadingPdf ? 'Generare...' : 'Descarcă PDF'}
            </button>
          </div>
        </div>

        {/* RESTORE SECTIONS & ZOOM CONTROLS (MINIMALIST WHITE) */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100 text-xs">
          <span className="text-[11px] font-semibold text-gray-500">Adaugă secțiuni:</span>
          {!sectionOrder.includes('education') && (
            <button onClick={() => restoreSection('education')} className="px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-md text-[11px] font-medium border border-gray-200 flex items-center gap-1 transition cursor-pointer">
              <Plus className="w-3 h-3" /> Education
            </button>
          )}
          {!sectionOrder.includes('experience') && (
            <button onClick={() => restoreSection('experience')} className="px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-md text-[11px] font-medium border border-gray-200 flex items-center gap-1 transition cursor-pointer">
              <Plus className="w-3 h-3" /> Experience
            </button>
          )}
          {!sectionOrder.includes('projects') && (
            <button onClick={() => restoreSection('projects')} className="px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-md text-[11px] font-medium border border-gray-200 flex items-center gap-1 transition cursor-pointer">
              <Plus className="w-3 h-3" /> Projects
            </button>
          )}
          {!sectionOrder.includes('certifications') && (
            <button onClick={() => restoreSection('certifications')} className="px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-md text-[11px] font-medium border border-gray-200 flex items-center gap-1 transition cursor-pointer">
              <Plus className="w-3 h-3" /> Certifications
            </button>
          )}
          {!sectionOrder.includes('skills') && (
            <button onClick={() => restoreSection('skills')} className="px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-md text-[11px] font-medium border border-gray-200 flex items-center gap-1 transition cursor-pointer">
              <Plus className="w-3 h-3" /> Technical Skills
            </button>
          )}
          {!sectionOrder.includes('summary') && (
            <button onClick={() => restoreSection('summary')} className="px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-md text-[11px] font-medium border border-gray-200 flex items-center gap-1 transition cursor-pointer">
              <Plus className="w-3 h-3" /> Summary
            </button>
          )}

          {/* ZOOM CONTROLS (FIXED 100% SCALE DEFAULT) */}
          <div className="ml-auto flex items-center bg-gray-50 px-2 py-1 rounded-lg border border-gray-200 text-xs">
            <button 
              onClick={() => setPreviewZoom(z => Math.max(0.4, Number((z - 0.05).toFixed(2))))}
              className="p-1 hover:bg-gray-200 text-gray-600 hover:text-black rounded cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPreviewZoom(1.0)}
              className="font-mono text-gray-900 font-bold px-2 text-[11px] min-w-[38px] text-center cursor-pointer"
              title="Setează la 100%"
            >
              {Math.round(previewZoom * 100)}%
            </button>
            <button 
              onClick={() => setPreviewZoom(z => Math.min(1.3, Number((z + 0.05).toFixed(2))))}
              className="p-1 hover:bg-gray-200 text-gray-600 hover:text-black rounded cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {parsedPdfSuccess && (
          <div className="p-3 bg-gray-50 border border-gray-200 text-gray-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{parsedPdfSuccess}</span>
          </div>
        )}
      </div>

      {/* ================= A4 DOCUMENT WORKBENCH (PURE WHITE CANVAS) ================= */}
      <div 
        ref={workbenchRef}
        className="w-full flex justify-center py-6 overflow-x-auto text-center"
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
          {/* EXACT PHYSICAL 210mm A4 SHEET (CLEAN WHITE CARD WITH ROUNDED CORNERS & SHADOW) */}
          <div 
            ref={previewRef}
            id="cv-preview-sheet" 
            className="bg-white text-black shadow-xl rounded-2xl border border-gray-200/90 transition-all"
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
                className="no-pdf absolute right-0 top-0 text-[11px] font-sans text-gray-500 hover:text-black flex items-center gap-1 bg-gray-50 hover:bg-gray-100 px-2.5 py-1 rounded border border-gray-200 shadow-2xs transition cursor-pointer"
                title="Editează datele de contact ca în formular"
              >
                <Edit3 className="w-3.5 h-3.5 text-gray-500" /> Edit Contact
              </button>

              {/* CANDIDATE FULL NAME IN EDITABLE BOX */}
              <div 
                contentEditable={true}
                suppressContentEditableWarning={true}
                onBlur={e => setContactData({...contactData, fullName: e.currentTarget.textContent || ""})}
                className="outline-none font-bold uppercase tracking-wide cursor-text inline-block border border-transparent hover:border-gray-300 hover:bg-gray-50/50 focus:border-gray-400 focus:bg-gray-100/40 px-1.5 py-0.5 rounded transition"
                style={{ 
                  fontSize: '20pt', 
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  letterSpacing: '0.5px',
                  lineHeight: '1.2'
                }}
              >
                {contactData.fullName}
              </div>

              {/* CONTACT DETAILS ROW */}
              <div 
                className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-black mt-1 font-sans"
                style={{ fontSize: '9pt' }}
              >
                {contactData.phone && <span>{contactData.phone}</span>}
                
                {contactData.email && (
                  <>
                    <span className="text-gray-400">|</span>
                    <a href={`mailto:${contactData.email}`} className="text-black underline hover:text-gray-700">{contactData.email}</a>
                  </>
                )}
                
                {contactData.linkedin && (
                  <>
                    <span className="text-gray-400">|</span>
                    <a href={contactData.linkedin.startsWith('http') ? contactData.linkedin : `https://${contactData.linkedin}`} target="_blank" rel="noreferrer" className="text-black underline hover:text-gray-700">
                      {contactData.linkedinFull ? contactData.linkedin : 'LinkedIn'}
                    </a>
                  </>
                )}
                
                {contactData.github && (
                  <>
                    <span className="text-gray-400">|</span>
                    <a href={contactData.github.startsWith('http') ? contactData.github : `https://${contactData.github}`} target="_blank" rel="noreferrer" className="text-black underline hover:text-gray-700">
                      {contactData.githubFull ? contactData.github : 'GitHub'}
                    </a>
                  </>
                )}

                {contactData.portfolio && (
                  <>
                    <span className="text-gray-400">|</span>
                    <a href={contactData.portfolio.startsWith('http') ? contactData.portfolio : `https://${contactData.portfolio}`} target="_blank" rel="noreferrer" className="text-black underline hover:text-gray-700">
                      {contactData.portfolioFull ? contactData.portfolio : 'Portfolio'}
                    </a>
                  </>
                )}

                {contactData.blog && (
                  <>
                    <span className="text-gray-400">|</span>
                    <a href={contactData.blog.startsWith('http') ? contactData.blog : `https://${contactData.blog}`} target="_blank" rel="noreferrer" className="text-black underline hover:text-gray-700">
                      {contactData.blogFull ? contactData.blog : 'Blog'}
                    </a>
                  </>
                )}

                {contactData.social && (
                  <>
                    <span className="text-gray-400">|</span>
                    <a href={contactData.social.startsWith('http') ? contactData.social : `https://${contactData.social}`} target="_blank" rel="noreferrer" className="text-black underline hover:text-gray-700">
                      {contactData.socialFull ? contactData.social : 'Social'}
                    </a>
                  </>
                )}

                {contactData.location && (
                  <>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-700">{contactData.location}</span>
                  </>
                )}
              </div>
            </div>

            {/* ================= DYNAMIC SECTIONS ================= */}
            {sectionOrder.map((sectionKey, sIdx) => {
              
              // ------------------- EDUCATION -------------------
              if (sectionKey === 'education') {
                return (
                  <div key="education" className="mt-3.5 mb-2 group/sec">
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
                        
                        {/* LARGER SIZED SEPARATE ARROW BUTTONS */}
                        <div className="no-pdf flex items-center gap-1 font-sans text-xs text-gray-500 font-bold">
                          <button onClick={() => moveSection(sIdx, -1)} disabled={sIdx === 0} className="hover:text-black hover:bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-xs disabled:opacity-20 cursor-pointer shadow-2xs" title="Muta mai sus">↑</button>
                          <button onClick={() => moveSection(sIdx, 1)} disabled={sIdx === sectionOrder.length - 1} className="hover:text-black hover:bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-xs disabled:opacity-20 cursor-pointer shadow-2xs" title="Muta mai jos">↓</button>
                          <button onClick={addEducation} className="hover:text-black hover:bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer shadow-2xs" title="Adauga o noua scoala">+ new</button>
                        </div>
                      </div>

                      <button onClick={() => deleteSection('education')} className="no-pdf text-[11px] font-sans text-gray-400 hover:text-rose-600 flex items-center gap-0.5 cursor-pointer">
                        <Trash2 className="w-3 h-3" /> delete section
                      </button>
                    </div>

                    <div style={{ width: '100%', height: '1px', backgroundColor: '#000000', marginTop: '2px', marginBottom: '4px' }}></div>

                    {/* ENTRIES */}
                    {educationList.map((edu, eduIdx) => (
                      <div key={edu.id || eduIdx} className="mt-1.5 mb-1.5 group/item relative">
                        
                        {/* 2 SEPARATE HOVER BUTTONS ON LEFT */}
                        <div className="no-pdf absolute -left-12 top-0.5 opacity-0 group-hover/item:opacity-100 transition flex items-center gap-1">
                          <button onClick={() => moveEducationItem(eduIdx, -1)} disabled={eduIdx === 0} className="bg-white hover:bg-gray-100 text-gray-600 hover:text-black border border-gray-200 px-1.5 py-0.5 rounded text-xs font-bold shadow-sm disabled:opacity-20 cursor-pointer" title="Muta mai sus">↑</button>
                          <button onClick={() => moveEducationItem(eduIdx, 1)} disabled={eduIdx === educationList.length - 1} className="bg-white hover:bg-gray-100 text-gray-600 hover:text-black border border-gray-200 px-1.5 py-0.5 rounded text-xs font-bold shadow-sm disabled:opacity-20 cursor-pointer" title="Muta mai jos">↓</button>
                        </div>

                        {/* ROW 1: SCHOOL + DATES */}
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="flex items-baseline gap-1.5 flex-1">
                            <span
                              contentEditable={true}
                              suppressContentEditableWarning={true}
                              onBlur={e => {
                                const updated = [...educationList];
                                updated[eduIdx].school = e.currentTarget.textContent || "";
                                setEducationList(updated);
                              }}
                              className="font-bold text-black outline-none border border-transparent hover:border-gray-300 hover:bg-gray-50/50 focus:border-gray-400 focus:bg-gray-100/40 px-1 py-0.5 rounded transition cursor-text inline-block"
                              style={{ fontSize: '9.5pt' }}
                            >
                              {edu.school}
                            </span>
                            <button 
                              onClick={() => addEduBullet(eduIdx)}
                              className="no-pdf text-[10px] font-sans text-gray-400 hover:text-black font-semibold cursor-pointer shrink-0"
                            >
                              + bullet
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 cv-popup-target relative">
                            {/* DATES WITH VISIBLE PLACEHOLDER IF EMPTY */}
                            <span
                              contentEditable={true}
                              suppressContentEditableWarning={true}
                              onBlur={e => {
                                const updated = [...educationList];
                                updated[eduIdx].period = e.currentTarget.textContent || "";
                                setEducationList(updated);
                              }}
                              className={`text-right outline-none border border-transparent hover:border-gray-300 hover:bg-gray-50/50 focus:border-gray-400 focus:bg-gray-100/40 px-1 py-0.5 rounded transition cursor-text inline-block ${
                                !edu.period ? 'text-gray-400 italic' : 'text-black'
                              }`}
                              style={{ fontSize: '9pt' }}
                            >
                              {edu.period || "Dates"}
                            </span>

                            {/* DIRECT SINGLE DELETE BUTTON */}
                            {selectedTarget?.type === 'item' && selectedTarget?.section === 'education' && selectedTarget?.idx === eduIdx && (
                              <div className="no-pdf absolute bottom-full right-0 mb-1 z-40 animate-in fade-in">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); deleteEducation(edu.id); }}
                                  className="bg-white hover:bg-gray-100 text-gray-700 hover:text-rose-600 border border-gray-300 shadow-md px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                                >
                                  <Trash2 className="w-3 h-3 text-gray-500" /> Delete
                                </button>
                              </div>
                            )}

                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTarget({ type: 'item', section: 'education', idx: eduIdx });
                              }}
                              className="no-pdf text-gray-400 hover:text-black p-0.5 cursor-pointer"
                              title="Delete entry"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* ROW 2: DEGREE + LOCATION */}
                        <div className="flex items-baseline justify-between gap-2">
                          <span
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            onBlur={e => {
                              const updated = [...educationList];
                              updated[eduIdx].degree = e.currentTarget.textContent || "";
                              setEducationList(updated);
                            }}
                            className="italic text-gray-800 outline-none border border-transparent hover:border-gray-300 hover:bg-gray-50/50 focus:border-gray-400 focus:bg-gray-100/40 px-1 py-0.5 rounded transition cursor-text inline-block flex-1"
                            style={{ fontSize: '9pt' }}
                          >
                            {edu.degree}
                          </span>
                          <span
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            onBlur={e => {
                              const updated = [...educationList];
                              updated[eduIdx].location = e.currentTarget.textContent || "";
                              setEducationList(updated);
                            }}
                            className="italic text-right text-gray-700 outline-none border border-transparent hover:border-gray-300 hover:bg-gray-50/50 focus:border-gray-400 focus:bg-gray-100/40 px-1 py-0.5 rounded transition cursor-text inline-block shrink-0"
                            style={{ fontSize: '9pt' }}
                          >
                            {edu.location}
                          </span>
                        </div>

                        {/* BULLETS */}
                        {edu.bullets && edu.bullets.map((b, bIdx) => {
                          const isBulletSelected = selectedTarget?.type === 'bullet' && selectedTarget?.section === 'education' && selectedTarget?.idx === eduIdx && selectedTarget?.subIdx === bIdx;
                          return (
                            <div key={bIdx} className="cv-popup-target relative flex items-start gap-1 mt-0.5 group/b">
                              
                              {/* DIRECT SINGLE DELETE BUTTON */}
                              {isBulletSelected && (
                                <div className="no-pdf absolute bottom-full left-4 mb-1 z-40 animate-in fade-in">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); deleteEduBullet(eduIdx, bIdx); }}
                                    className="bg-white hover:bg-gray-100 text-gray-700 hover:text-rose-600 border border-gray-300 shadow-md px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                                  >
                                    <Trash2 className="w-3 h-3 text-gray-500" /> Delete
                                  </button>
                                </div>
                              )}

                              <span style={{ fontSize: '9pt', lineHeight: '1.3', flexShrink: 0, paddingLeft: '4px' }}>•</span>
                              <div
                                contentEditable={true}
                                suppressContentEditableWarning={true}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTarget({ type: 'bullet', section: 'education', idx: eduIdx, subIdx: bIdx });
                                }}
                                onBlur={e => {
                                  const updated = [...educationList];
                                  updated[eduIdx].bullets[bIdx] = e.currentTarget.textContent || "";
                                  setEducationList(updated);
                                }}
                                className={`outline-none border px-1 py-0.5 rounded transition cursor-text flex-1 ${
                                  isBulletSelected ? 'border-gray-400 bg-gray-100/40' : 'border-transparent hover:border-gray-300 hover:bg-gray-50/50'
                                }`}
                                style={{ fontSize: '8.5pt', lineHeight: '1.3', color: '#000000', textAlign: 'justify' }}
                              >
                                {b}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                );
              }

              // ------------------- EXPERIENCE -------------------
              if (sectionKey === 'experience') {
                return (
                  <div key="experience" className="mt-3.5 mb-2 group/sec">
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
                        
                        {/* LARGER SIZED SEPARATE ARROW BUTTONS */}
                        <div className="no-pdf flex items-center gap-1 font-sans text-xs text-gray-500 font-bold">
                          <button onClick={() => moveSection(sIdx, -1)} disabled={sIdx === 0} className="hover:text-black hover:bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-xs disabled:opacity-20 cursor-pointer shadow-2xs" title="Muta mai sus">↑</button>
                          <button onClick={() => moveSection(sIdx, 1)} disabled={sIdx === sectionOrder.length - 1} className="hover:text-black hover:bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-xs disabled:opacity-20 cursor-pointer shadow-2xs" title="Muta mai jos">↓</button>
                          <button onClick={addExperience} className="hover:text-black hover:bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer shadow-2xs" title="Adauga experienta">+ new</button>
                        </div>
                      </div>

                      <button onClick={() => deleteSection('experience')} className="no-pdf text-[11px] font-sans text-gray-400 hover:text-rose-600 flex items-center gap-0.5 cursor-pointer">
                        <Trash2 className="w-3 h-3" /> delete section
                      </button>
                    </div>

                    <div style={{ width: '100%', height: '1px', backgroundColor: '#000000', marginTop: '2px', marginBottom: '4px' }}></div>

                    {/* ENTRIES */}
                    {experienceList.map((exp, expIdx) => (
                      <div key={exp.id || expIdx} className="mt-1.5 mb-2 group/item relative">
                        
                        {/* 2 SEPARATE HOVER BUTTONS ON LEFT */}
                        <div className="no-pdf absolute -left-12 top-0.5 opacity-0 group-hover/item:opacity-100 transition flex items-center gap-1">
                          <button onClick={() => moveExperienceItem(expIdx, -1)} disabled={expIdx === 0} className="bg-white hover:bg-gray-100 text-gray-600 hover:text-black border border-gray-200 px-1.5 py-0.5 rounded text-xs font-bold shadow-sm disabled:opacity-20 cursor-pointer" title="Muta mai sus">↑</button>
                          <button onClick={() => moveExperienceItem(expIdx, 1)} disabled={expIdx === experienceList.length - 1} className="bg-white hover:bg-gray-100 text-gray-600 hover:text-black border border-gray-200 px-1.5 py-0.5 rounded text-xs font-bold shadow-sm disabled:opacity-20 cursor-pointer" title="Muta mai jos">↓</button>
                        </div>

                        {/* ROW 1: ROLE + DATES */}
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="flex items-baseline gap-1.5 flex-1">
                            <span
                              contentEditable={true}
                              suppressContentEditableWarning={true}
                              onBlur={e => {
                                const updated = [...experienceList];
                                updated[expIdx].role = e.currentTarget.textContent || "";
                                setExperienceList(updated);
                              }}
                              className="font-bold text-black outline-none border border-transparent hover:border-gray-300 hover:bg-gray-50/50 focus:border-gray-400 focus:bg-gray-100/40 px-1 py-0.5 rounded transition cursor-text inline-block"
                              style={{ fontSize: '9.5pt' }}
                            >
                              {exp.role}
                            </span>
                            <button 
                              onClick={() => addExpBullet(expIdx)}
                              className="no-pdf text-[10px] font-sans text-gray-400 hover:text-black font-semibold cursor-pointer shrink-0"
                            >
                              + bullet
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 cv-popup-target relative">
                            {/* DATES WITH VISIBLE PLACEHOLDER IF EMPTY */}
                            <span
                              contentEditable={true}
                              suppressContentEditableWarning={true}
                              onBlur={e => {
                                const updated = [...experienceList];
                                updated[expIdx].period = e.currentTarget.textContent || "";
                                setExperienceList(updated);
                              }}
                              className={`text-right outline-none border border-transparent hover:border-gray-300 hover:bg-gray-50/50 focus:border-gray-400 focus:bg-gray-100/40 px-1 py-0.5 rounded transition cursor-text inline-block ${
                                !exp.period ? 'text-gray-400 italic' : 'text-black'
                              }`}
                              style={{ fontSize: '9pt' }}
                            >
                              {exp.period || "Dates"}
                            </span>

                            {/* DIRECT SINGLE DELETE BUTTON */}
                            {selectedTarget?.type === 'item' && selectedTarget?.section === 'experience' && selectedTarget?.idx === expIdx && (
                              <div className="no-pdf absolute bottom-full right-0 mb-1 z-40 animate-in fade-in">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); deleteExperience(exp.id); }}
                                  className="bg-white hover:bg-gray-100 text-gray-700 hover:text-rose-600 border border-gray-300 shadow-md px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                                >
                                  <Trash2 className="w-3 h-3 text-gray-500" /> Delete
                                </button>
                              </div>
                            )}

                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTarget({ type: 'item', section: 'experience', idx: expIdx });
                              }}
                              className="no-pdf text-gray-400 hover:text-black p-0.5 cursor-pointer"
                              title="Delete entry"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* ROW 2: COMPANY + LOCATION */}
                        <div className="flex items-baseline justify-between gap-2">
                          <span
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            onBlur={e => {
                              const updated = [...experienceList];
                              updated[expIdx].company = e.currentTarget.textContent || "";
                              setExperienceList(updated);
                            }}
                            className="italic text-gray-800 outline-none border border-transparent hover:border-gray-300 hover:bg-gray-50/50 focus:border-gray-400 focus:bg-gray-100/40 px-1 py-0.5 rounded transition cursor-text inline-block flex-1"
                            style={{ fontSize: '9pt' }}
                          >
                            {exp.company}
                          </span>
                          <span
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            onBlur={e => {
                              const updated = [...experienceList];
                              updated[expIdx].location = e.currentTarget.textContent || "";
                              setExperienceList(updated);
                            }}
                            className="italic text-right text-gray-700 outline-none border border-transparent hover:border-gray-300 hover:bg-gray-50/50 focus:border-gray-400 focus:bg-gray-100/40 px-1 py-0.5 rounded transition cursor-text inline-block shrink-0"
                            style={{ fontSize: '9pt' }}
                          >
                            {exp.location}
                          </span>
                        </div>

                        {/* BULLETS */}
                        {exp.bullets && exp.bullets.map((b, bIdx) => {
                          const isBulletSelected = selectedTarget?.type === 'bullet' && selectedTarget?.section === 'experience' && selectedTarget?.idx === expIdx && selectedTarget?.subIdx === bIdx;
                          return (
                            <div key={bIdx} className="cv-popup-target relative flex items-start gap-1 mt-0.5 group/b">
                              
                              {/* DIRECT SINGLE DELETE BUTTON */}
                              {isBulletSelected && (
                                <div className="no-pdf absolute bottom-full left-4 mb-1 z-40 animate-in fade-in">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); deleteExpBullet(expIdx, bIdx); }}
                                    className="bg-white hover:bg-gray-100 text-gray-700 hover:text-rose-600 border border-gray-300 shadow-md px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                                  >
                                    <Trash2 className="w-3 h-3 text-gray-500" /> Delete
                                  </button>
                                </div>
                              )}

                              <span style={{ fontSize: '9pt', lineHeight: '1.35', flexShrink: 0, paddingLeft: '4px' }}>•</span>
                              <div
                                contentEditable={true}
                                suppressContentEditableWarning={true}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTarget({ type: 'bullet', section: 'experience', idx: expIdx, subIdx: bIdx });
                                }}
                                onBlur={e => {
                                  const updated = [...experienceList];
                                  updated[expIdx].bullets[bIdx] = e.currentTarget.textContent || "";
                                  setExperienceList(updated);
                                }}
                                className={`outline-none border px-1 py-0.5 rounded transition cursor-text flex-1 ${
                                  isBulletSelected ? 'border-gray-400 bg-gray-100/40' : 'border-transparent hover:border-gray-300 hover:bg-gray-50/50'
                                }`}
                                style={{ fontSize: '8.5pt', lineHeight: '1.35', color: '#000000', textAlign: 'justify' }}
                              >
                                {b}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                );
              }

              // ------------------- PROJECTS -------------------
              if (sectionKey === 'projects') {
                return (
                  <div key="projects" className="mt-3.5 mb-2 group/sec">
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
                        
                        {/* LARGER SIZED SEPARATE ARROW BUTTONS */}
                        <div className="no-pdf flex items-center gap-1 font-sans text-xs text-gray-500 font-bold">
                          <button onClick={() => moveSection(sIdx, -1)} disabled={sIdx === 0} className="hover:text-black hover:bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-xs disabled:opacity-20 cursor-pointer shadow-2xs" title="Muta mai sus">↑</button>
                          <button onClick={() => moveSection(sIdx, 1)} disabled={sIdx === sectionOrder.length - 1} className="hover:text-black hover:bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-xs disabled:opacity-20 cursor-pointer shadow-2xs" title="Muta mai jos">↓</button>
                          <button onClick={addProject} className="hover:text-black hover:bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer shadow-2xs" title="Adauga proiect">+ new</button>
                        </div>
                      </div>

                      <button onClick={() => deleteSection('projects')} className="no-pdf text-[11px] font-sans text-gray-400 hover:text-rose-600 flex items-center gap-0.5 cursor-pointer">
                        <Trash2 className="w-3 h-3" /> delete section
                      </button>
                    </div>

                    <div style={{ width: '100%', height: '1px', backgroundColor: '#000000', marginTop: '2px', marginBottom: '4px' }}></div>

                    {/* ENTRIES */}
                    {projectsList.map((proj, projIdx) => (
                      <div key={proj.id || projIdx} className="mt-1.5 mb-2 group/item relative">
                        
                        {/* 2 SEPARATE HOVER BUTTONS ON LEFT */}
                        <div className="no-pdf absolute -left-12 top-0.5 opacity-0 group-hover/item:opacity-100 transition flex items-center gap-1">
                          <button onClick={() => moveProjectItem(projIdx, -1)} disabled={projIdx === 0} className="bg-white hover:bg-gray-100 text-gray-600 hover:text-black border border-gray-200 px-1.5 py-0.5 rounded text-xs font-bold shadow-sm disabled:opacity-20 cursor-pointer" title="Muta mai sus">↑</button>
                          <button onClick={() => moveProjectItem(projIdx, 1)} disabled={projIdx === projectsList.length - 1} className="bg-white hover:bg-gray-100 text-gray-600 hover:text-black border border-gray-200 px-1.5 py-0.5 rounded text-xs font-bold shadow-sm disabled:opacity-20 cursor-pointer" title="Muta mai jos">↓</button>
                        </div>

                        {/* ROW 1: TITLE + TECH STACK + (+ ADD LINK) + (+ BULLET) + DATES */}
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="flex items-baseline flex-wrap gap-x-1.5 gap-y-0.5 flex-1">
                            <span
                              contentEditable={true}
                              suppressContentEditableWarning={true}
                              onBlur={e => {
                                const updated = [...projectsList];
                                updated[projIdx].title = e.currentTarget.textContent || "";
                                setProjectsList(updated);
                              }}
                              className="font-bold text-black outline-none border border-transparent hover:border-gray-300 hover:bg-gray-50/50 focus:border-gray-400 focus:bg-gray-100/40 px-1 py-0.5 rounded transition cursor-text inline-block"
                              style={{ fontSize: '9.5pt' }}
                            >
                              {proj.title}
                            </span>
                            
                            <span className="text-gray-400 font-normal">|</span>
                            
                            <span
                              contentEditable={true}
                              suppressContentEditableWarning={true}
                              onBlur={e => {
                                const updated = [...projectsList];
                                updated[projIdx].techStack = e.currentTarget.textContent || "";
                                setProjectsList(updated);
                              }}
                              className="italic text-gray-800 outline-none border border-transparent hover:border-gray-300 hover:bg-gray-50/50 focus:border-gray-400 focus:bg-gray-100/40 px-1 py-0.5 rounded transition cursor-text inline-block"
                              style={{ fontSize: '8.5pt' }}
                            >
                              {proj.techStack}
                            </span>

                            {/* CLICKABLE LINK */}
                            {proj.linkUrl ? (
                              <span className="inline-flex items-center gap-1 font-sans text-xs">
                                <a 
                                  href={proj.linkUrl.startsWith('http') ? proj.linkUrl : `https://${proj.linkUrl}`} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-black underline font-normal hover:text-gray-700"
                                  style={{ fontSize: '8.5pt' }}
                                >
                                  ({proj.linkText || proj.linkUrl})
                                </a>
                                <button 
                                  onClick={() => {
                                    const updated = [...projectsList];
                                    updated[projIdx].linkUrl = "";
                                    updated[projIdx].linkText = "";
                                    setProjectsList(updated);
                                  }}
                                  className="no-pdf text-gray-400 hover:text-rose-600 cursor-pointer"
                                  title="Sterge link"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </span>
                            ) : (
                              /* + ADD LINK BUTTON */
                              <button 
                                onClick={() => {
                                  const url = prompt("Introdu URL-ul proiectului (ex: https://one-rep.vercel.app):");
                                  if (!url) return;
                                  const text = prompt("Introdu textul afisat pentru link (optional, ex: one-rep.vercel.app):", url.replace(/^https?:\/\//, ''));
                                  const updated = [...projectsList];
                                  updated[projIdx].linkUrl = url;
                                  updated[projIdx].linkText = text || url;
                                  setProjectsList(updated);
                                }}
                                className="no-pdf text-[10px] font-sans text-gray-400 hover:text-black font-semibold cursor-pointer shrink-0"
                              >
                                + add link
                              </button>
                            )}

                            {/* + BULLET BUTTON */}
                            <button 
                              onClick={() => addProjectBullet(projIdx)}
                              className="no-pdf text-[10px] font-sans text-gray-400 hover:text-black font-semibold cursor-pointer shrink-0 ml-1"
                            >
                              + bullet
                            </button>
                          </div>

                          {/* DATES WITH PLACEHOLDER */}
                          <div className="flex items-center gap-1.5 shrink-0 cv-popup-target relative">
                            <span
                              contentEditable={true}
                              suppressContentEditableWarning={true}
                              onBlur={e => {
                                const updated = [...projectsList];
                                updated[projIdx].period = e.currentTarget.textContent || "";
                                setProjectsList(updated);
                              }}
                              className={`text-right outline-none border border-transparent hover:border-gray-300 hover:bg-gray-50/50 focus:border-gray-400 focus:bg-gray-100/40 px-1 py-0.5 rounded transition cursor-text inline-block ${
                                !proj.period ? 'text-gray-400 italic' : 'text-black'
                              }`}
                              style={{ fontSize: '9pt' }}
                            >
                              {proj.period || "Dates"}
                            </span>

                            {/* DIRECT SINGLE DELETE BUTTON */}
                            {selectedTarget?.type === 'item' && selectedTarget?.section === 'projects' && selectedTarget?.idx === projIdx && (
                              <div className="no-pdf absolute bottom-full right-0 mb-1 z-40 animate-in fade-in">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); deleteProject(proj.id); }}
                                  className="bg-white hover:bg-gray-100 text-gray-700 hover:text-rose-600 border border-gray-300 shadow-md px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                                >
                                  <Trash2 className="w-3 h-3 text-gray-500" /> Delete
                                </button>
                              </div>
                            )}

                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTarget({ type: 'item', section: 'projects', idx: projIdx });
                              }}
                              className="no-pdf text-gray-400 hover:text-black p-0.5 cursor-pointer"
                              title="Delete entry"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* BULLETS */}
                        {proj.bullets && proj.bullets.map((b, bIdx) => {
                          const isBulletSelected = selectedTarget?.type === 'bullet' && selectedTarget?.section === 'projects' && selectedTarget?.idx === projIdx && selectedTarget?.subIdx === bIdx;
                          return (
                            <div key={bIdx} className="cv-popup-target relative flex items-start gap-1 mt-0.5 group/b">
                              
                              {/* DIRECT SINGLE DELETE BUTTON */}
                              {isBulletSelected && (
                                <div className="no-pdf absolute bottom-full left-4 mb-1 z-40 animate-in fade-in">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); deleteProjectBullet(projIdx, bIdx); }}
                                    className="bg-white hover:bg-gray-100 text-gray-700 hover:text-rose-600 border border-gray-300 shadow-md px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                                  >
                                    <Trash2 className="w-3 h-3 text-gray-500" /> Delete
                                  </button>
                                </div>
                              )}

                              <span style={{ fontSize: '9pt', lineHeight: '1.35', flexShrink: 0, paddingLeft: '4px' }}>•</span>
                              <div
                                contentEditable={true}
                                suppressContentEditableWarning={true}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTarget({ type: 'bullet', section: 'projects', idx: projIdx, subIdx: bIdx });
                                }}
                                onBlur={e => {
                                  const updated = [...projectsList];
                                  updated[projIdx].bullets[bIdx] = e.currentTarget.textContent || "";
                                  setProjectsList(updated);
                                }}
                                className={`outline-none border px-1 py-0.5 rounded transition cursor-text flex-1 ${
                                  isBulletSelected ? 'border-gray-400 bg-gray-100/40' : 'border-transparent hover:border-gray-300 hover:bg-gray-50/50'
                                }`}
                                style={{ fontSize: '8.5pt', lineHeight: '1.35', color: '#000000', textAlign: 'justify' }}
                              >
                                {b}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                );
              }

              // ------------------- CERTIFICATIONS -------------------
              if (sectionKey === 'certifications') {
                return (
                  <div key="certifications" className="mt-3.5 mb-2 group/sec">
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
                          Certifications
                        </span>
                        
                        {/* LARGER SIZED SEPARATE ARROW BUTTONS */}
                        <div className="no-pdf flex items-center gap-1 font-sans text-xs text-gray-500 font-bold">
                          <button onClick={() => moveSection(sIdx, -1)} disabled={sIdx === 0} className="hover:text-black hover:bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-xs disabled:opacity-20 cursor-pointer shadow-2xs" title="Muta mai sus">↑</button>
                          <button onClick={() => moveSection(sIdx, 1)} disabled={sIdx === sectionOrder.length - 1} className="hover:text-black hover:bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-xs disabled:opacity-20 cursor-pointer shadow-2xs" title="Muta mai jos">↓</button>
                          <button onClick={addCertification} className="hover:text-black hover:bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer shadow-2xs" title="Adauga certificare">+ new</button>
                        </div>
                      </div>

                      <button onClick={() => deleteSection('certifications')} className="no-pdf text-[11px] font-sans text-gray-400 hover:text-rose-600 flex items-center gap-0.5 cursor-pointer">
                        <Trash2 className="w-3 h-3" /> delete section
                      </button>
                    </div>

                    <div style={{ width: '100%', height: '1px', backgroundColor: '#000000', marginTop: '2px', marginBottom: '4px' }}></div>

                    {/* ENTRIES */}
                    {certificationsList.map((cert, certIdx) => (
                      <div key={cert.id || certIdx} className="mt-1.5 mb-2 group/item relative">
                        
                        {/* 2 SEPARATE HOVER BUTTONS ON LEFT */}
                        <div className="no-pdf absolute -left-12 top-0.5 opacity-0 group-hover/item:opacity-100 transition flex items-center gap-1">
                          <button onClick={() => moveCertificationItem(certIdx, -1)} disabled={certIdx === 0} className="bg-white hover:bg-gray-100 text-gray-600 hover:text-black border border-gray-200 px-1.5 py-0.5 rounded text-xs font-bold shadow-sm disabled:opacity-20 cursor-pointer" title="Muta mai sus">↑</button>
                          <button onClick={() => moveCertificationItem(certIdx, 1)} disabled={certIdx === certificationsList.length - 1} className="bg-white hover:bg-gray-100 text-gray-600 hover:text-black border border-gray-200 px-1.5 py-0.5 rounded text-xs font-bold shadow-sm disabled:opacity-20 cursor-pointer" title="Muta mai jos">↓</button>
                        </div>

                        {/* ROW 1: CERT NAME + ISSUER + DATES */}
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="flex items-baseline flex-wrap gap-1.5 flex-1">
                            <span
                              contentEditable={true}
                              suppressContentEditableWarning={true}
                              onBlur={e => {
                                const updated = [...certificationsList];
                                updated[certIdx].name = e.currentTarget.textContent || "";
                                setCertificationsList(updated);
                              }}
                              className="font-bold text-black outline-none border border-transparent hover:border-gray-300 hover:bg-gray-50/50 focus:border-gray-400 focus:bg-gray-100/40 px-1 py-0.5 rounded transition cursor-text inline-block"
                              style={{ fontSize: '9.5pt' }}
                            >
                              {cert.name}
                            </span>
                            
                            {cert.issuer && (
                              <>
                                <span className="text-gray-400 font-normal">|</span>
                                <span
                                  contentEditable={true}
                                  suppressContentEditableWarning={true}
                                  onBlur={e => {
                                    const updated = [...certificationsList];
                                    updated[certIdx].issuer = e.currentTarget.textContent || "";
                                    setCertificationsList(updated);
                                  }}
                                  className="italic text-gray-800 outline-none border border-transparent hover:border-gray-300 hover:bg-gray-50/50 focus:border-gray-400 focus:bg-gray-100/40 px-1 py-0.5 rounded transition cursor-text inline-block"
                                  style={{ fontSize: '8.5pt' }}
                                >
                                  {cert.issuer}
                                </span>
                              </>
                            )}

                            <button 
                              onClick={() => addCertBullet(certIdx)}
                              className="no-pdf text-[10px] font-sans text-gray-400 hover:text-black font-semibold cursor-pointer shrink-0 ml-1"
                            >
                              + bullet
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 cv-popup-target relative">
                            {/* DATES WITH PLACEHOLDER */}
                            <span
                              contentEditable={true}
                              suppressContentEditableWarning={true}
                              onBlur={e => {
                                const updated = [...certificationsList];
                                updated[certIdx].period = e.currentTarget.textContent || "";
                                setCertificationsList(updated);
                              }}
                              className={`text-right outline-none border border-transparent hover:border-gray-300 hover:bg-gray-50/50 focus:border-gray-400 focus:bg-gray-100/40 px-1 py-0.5 rounded transition cursor-text inline-block ${
                                !cert.period ? 'text-gray-400 italic' : 'text-black'
                              }`}
                              style={{ fontSize: '9pt' }}
                            >
                              {cert.period || "Dates"}
                            </span>

                            {/* DIRECT SINGLE DELETE BUTTON */}
                            {selectedTarget?.type === 'item' && selectedTarget?.section === 'certifications' && selectedTarget?.idx === certIdx && (
                              <div className="no-pdf absolute bottom-full right-0 mb-1 z-40 animate-in fade-in">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); deleteCertification(cert.id); }}
                                  className="bg-white hover:bg-gray-100 text-gray-700 hover:text-rose-600 border border-gray-300 shadow-md px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                                >
                                  <Trash2 className="w-3 h-3 text-gray-500" /> Delete
                                </button>
                              </div>
                            )}

                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTarget({ type: 'item', section: 'certifications', idx: certIdx });
                              }}
                              className="no-pdf text-gray-400 hover:text-black p-0.5 cursor-pointer"
                              title="Delete entry"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* BULLETS */}
                        {cert.bullets && cert.bullets.map((b, bIdx) => {
                          const isBulletSelected = selectedTarget?.type === 'bullet' && selectedTarget?.section === 'certifications' && selectedTarget?.idx === certIdx && selectedTarget?.subIdx === bIdx;
                          return (
                            <div key={bIdx} className="cv-popup-target relative flex items-start gap-1 mt-0.5 group/b">
                              
                              {/* DIRECT SINGLE DELETE BUTTON */}
                              {isBulletSelected && (
                                <div className="no-pdf absolute bottom-full left-4 mb-1 z-40 animate-in fade-in">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); deleteCertBullet(certIdx, bIdx); }}
                                    className="bg-white hover:bg-gray-100 text-gray-700 hover:text-rose-600 border border-gray-300 shadow-md px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                                  >
                                    <Trash2 className="w-3 h-3 text-gray-500" /> Delete
                                  </button>
                                </div>
                              )}

                              <span style={{ fontSize: '9pt', lineHeight: '1.35', flexShrink: 0, paddingLeft: '4px' }}>•</span>
                              <div
                                contentEditable={true}
                                suppressContentEditableWarning={true}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTarget({ type: 'bullet', section: 'certifications', idx: certIdx, subIdx: bIdx });
                                }}
                                onBlur={e => {
                                  const updated = [...certificationsList];
                                  updated[certIdx].bullets[bIdx] = e.currentTarget.textContent || "";
                                  setCertificationsList(updated);
                                }}
                                className={`outline-none border px-1 py-0.5 rounded transition cursor-text flex-1 ${
                                  isBulletSelected ? 'border-gray-400 bg-gray-100/40' : 'border-transparent hover:border-gray-300 hover:bg-gray-50/50'
                                }`}
                                style={{ fontSize: '8.5pt', lineHeight: '1.35', color: '#000000', textAlign: 'justify' }}
                              >
                                {b}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                );
              }

              // ------------------- TECHNICAL SKILLS -------------------
              if (sectionKey === 'skills') {
                return (
                  <div key="skills" className="mt-3.5 mb-2 group/sec">
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
                        
                        {/* LARGER SIZED SEPARATE ARROW BUTTONS & + FIELD BUTTON */}
                        <div className="no-pdf flex items-center gap-1 font-sans text-xs text-gray-500 font-bold">
                          <button onClick={() => moveSection(sIdx, -1)} disabled={sIdx === 0} className="hover:text-black hover:bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-xs disabled:opacity-20 cursor-pointer shadow-2xs" title="Muta mai sus">↑</button>
                          <button onClick={() => moveSection(sIdx, 1)} disabled={sIdx === sectionOrder.length - 1} className="hover:text-black hover:bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-xs disabled:opacity-20 cursor-pointer shadow-2xs" title="Muta mai jos">↓</button>
                          <button onClick={addSkillField} className="hover:text-black hover:bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer shadow-2xs" title="Adauga o noua categorie de skill-uri">+ field</button>
                        </div>
                      </div>

                      <button onClick={() => deleteSection('skills')} className="no-pdf text-[11px] font-sans text-gray-400 hover:text-rose-600 flex items-center gap-0.5 cursor-pointer">
                        <Trash2 className="w-3 h-3" /> delete section
                      </button>
                    </div>

                    <div style={{ width: '100%', height: '1px', backgroundColor: '#000000', marginTop: '2px', marginBottom: '4px' }}></div>

                    {/* SKILLS ROWS */}
                    <div className="space-y-0.5 mt-1 text-black" style={{ fontSize: '8.5pt', lineHeight: '1.4' }}>
                      {skillsFields.map((field, fieldIdx) => (
                        <div key={field.id || fieldIdx} className="group/f relative leading-normal">
                          
                          {/* 2 SEPARATE HOVER BUTTONS ON LEFT */}
                          <div className="no-pdf absolute -left-12 top-0 opacity-0 group-hover/f:opacity-100 transition flex items-center gap-1">
                            <button onClick={() => moveSkillFieldItem(fieldIdx, -1)} disabled={fieldIdx === 0} className="bg-white hover:bg-gray-100 text-gray-600 hover:text-black border border-gray-200 px-1.5 py-0.5 rounded text-xs font-bold shadow-sm disabled:opacity-20 cursor-pointer" title="Muta categoria mai sus">↑</button>
                            <button onClick={() => moveSkillFieldItem(fieldIdx, 1)} disabled={fieldIdx === skillsFields.length - 1} className="bg-white hover:bg-gray-100 text-gray-600 hover:text-black border border-gray-200 px-1.5 py-0.5 rounded text-xs font-bold shadow-sm disabled:opacity-20 cursor-pointer" title="Muta categoria mai jos">↓</button>
                          </div>

                          {/* FIELD LABEL */}
                          <span className="cv-popup-target relative inline font-bold">
                            {/* DIRECT SINGLE DELETE BUTTON FOR FIELD */}
                            {selectedTarget?.type === 'field' && selectedTarget?.idx === fieldIdx && (
                              <div className="no-pdf absolute bottom-full left-0 mb-1 z-40 animate-in fade-in">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); deleteSkillField(fieldIdx); }}
                                  className="bg-white hover:bg-gray-100 text-gray-700 hover:text-rose-600 border border-gray-300 shadow-md px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                                >
                                  <Trash2 className="w-3 h-3 text-gray-500" /> Delete Field
                                </button>
                              </div>
                            )}

                            <span 
                              contentEditable={true}
                              suppressContentEditableWarning={true}
                              onClick={(e) => { e.stopPropagation(); setSelectedTarget({ type: 'field', idx: fieldIdx }); }}
                              onBlur={e => {
                                const cleanText = (e.currentTarget.textContent || "").replace(/:+$/, '').trim();
                                const updated = [...skillsFields];
                                updated[fieldIdx].label = cleanText || field.label;
                                setSkillsFields(updated);
                              }}
                              className="outline-none border border-transparent hover:border-gray-300 hover:bg-gray-50/50 focus:border-gray-400 focus:bg-gray-100/40 px-0.5 rounded cursor-pointer transition"
                            >
                              {field.label}:
                            </span>
                          </span>

                          <span className="ml-1.5"></span>

                          {/* INDIVIDUAL SKILL ITEMS */}
                          {field.items.map((item, itemIdx) => {
                            const isSkillSelected = selectedTarget?.type === 'skill' && selectedTarget?.idx === fieldIdx && selectedTarget?.subIdx === itemIdx;
                            return (
                              <span 
                                key={itemIdx} 
                                className="cv-popup-target relative inline cursor-pointer"
                              >
                                {/* DIRECT SINGLE DELETE BUTTON FOR SKILL */}
                                {isSkillSelected && (
                                  <div className="no-pdf absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-40 animate-in fade-in">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); deleteSkillItem(fieldIdx, itemIdx); }}
                                      className="bg-white hover:bg-gray-100 text-gray-700 hover:text-rose-600 border border-gray-300 shadow-md px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                                    >
                                      <Trash2 className="w-3 h-3 text-gray-500" /> Delete
                                    </button>
                                  </div>
                                )}

                                {/* SKILL TEXT */}
                                <span
                                  contentEditable={true}
                                  suppressContentEditableWarning={true}
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setSelectedTarget({ type: 'skill', idx: fieldIdx, subIdx: itemIdx });
                                  }}
                                  onBlur={e => {
                                    const updated = [...skillsFields];
                                    updated[fieldIdx].items[itemIdx] = e.currentTarget.textContent || "";
                                    setSkillsFields(updated);
                                  }}
                                  className={`outline-none border px-0.5 rounded transition ${
                                    isSkillSelected 
                                      ? 'border-gray-400 bg-gray-100/40 text-black font-medium' 
                                      : 'border-transparent hover:border-gray-300 hover:bg-gray-50/50'
                                  }`}
                                >
                                  {item}
                                </span>
                                {itemIdx < field.items.length - 1 && <span className="mr-1">,</span>}
                              </span>
                            );
                          })}

                          {/* INLINE +ADD INPUT BOX */}
                          {addingSkillFieldIdx === fieldIdx ? (
                            <span className="inline-block ml-1">
                              <input
                                type="text"
                                autoFocus
                                placeholder="Scrie skill..."
                                value={newSkillText}
                                onChange={e => setNewSkillText(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleCommitSkill(fieldIdx);
                                  if (e.key === 'Escape') { setAddingSkillFieldIdx(null); setNewSkillText(""); }
                                }}
                                onBlur={() => handleCommitSkill(fieldIdx)}
                                className="no-pdf border border-gray-400 bg-gray-50 px-1.5 py-0.5 rounded text-[8.5pt] outline-none text-black font-medium w-24 shadow-2xs"
                              />
                            </span>
                          ) : (
                            /* + ADD BUTTON */
                            <button
                              onClick={() => { setAddingSkillFieldIdx(fieldIdx); setNewSkillText(""); }}
                              className="no-pdf text-[10px] font-sans text-gray-400 hover:text-black font-semibold cursor-pointer px-1 hover:bg-gray-100 rounded ml-1 inline"
                              title={`Adaugă skill în ${field.label}`}
                            >
                              + add
                            </button>
                          )}

                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              // ------------------- SUMMARY -------------------
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
                        <div className="no-pdf flex items-center gap-1 font-sans text-xs text-gray-500 font-bold">
                          <button onClick={() => moveSection(sIdx, -1)} disabled={sIdx === 0} className="hover:text-black hover:bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-xs disabled:opacity-20 cursor-pointer shadow-2xs" title="Muta mai sus">↑</button>
                          <button onClick={() => moveSection(sIdx, 1)} disabled={sIdx === sectionOrder.length - 1} className="hover:text-black hover:bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-xs disabled:opacity-20 cursor-pointer shadow-2xs" title="Muta mai jos">↓</button>
                        </div>
                      </div>
                      <button onClick={() => deleteSection('summary')} className="no-pdf text-[11px] font-sans text-gray-400 hover:text-rose-600 flex items-center gap-0.5 cursor-pointer">
                        <Trash2 className="w-3 h-3" /> delete section
                      </button>
                    </div>
                    <div style={{ width: '100%', height: '1px', backgroundColor: '#000000', marginTop: '2px', marginBottom: '4px' }}></div>
                    <div
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={e => setSummaryText(e.currentTarget.textContent || "")}
                      className="outline-none border border-transparent hover:border-gray-300 hover:bg-gray-50/50 focus:border-gray-400 focus:bg-gray-100/40 px-1.5 py-0.5 rounded transition cursor-text"
                      style={{ fontSize: '9pt', color: '#000000', textAlign: 'justify', lineHeight: '1.35', fontFamily: 'Arial, Helvetica, sans-serif' }}
                    >
                      {summaryText}
                    </div>
                  </div>
                );
              }

              return null;
            })}

          </div>
        </div>
      </div>

      {/* ================= MODAL: EDIT CONTACT ================= */}
      {showEditContactModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-xl w-full my-6 animate-in fade-in zoom-in-95 font-sans">
            
            <div className="text-center mb-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                {contactData.fullName}
              </h2>
            </div>

            <div className="bg-white text-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-4 border border-gray-200">
              
              <div className="space-y-3">
                <div className="grid grid-cols-12 items-center gap-3">
                  <label className="col-span-3 text-right text-xs font-semibold text-gray-500">Email</label>
                  <input 
                    type="email" 
                    placeholder="email@example.com"
                    value={contactData.email} 
                    onChange={e => setContactData({...contactData, email: e.target.value})}
                    className="col-span-9 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-400" 
                  />
                </div>

                <div className="grid grid-cols-12 items-center gap-3">
                  <label className="col-span-3 text-right text-xs font-semibold text-gray-500">Phone</label>
                  <input 
                    type="text" 
                    placeholder="(+40) 700 000 000"
                    value={contactData.phone} 
                    onChange={e => setContactData({...contactData, phone: e.target.value})}
                    className="col-span-9 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-400" 
                  />
                </div>

                <div className="grid grid-cols-12 items-center gap-3">
                  <label className="col-span-3 text-right text-xs font-semibold text-gray-500">Location</label>
                  <input 
                    type="text" 
                    placeholder="Location"
                    value={contactData.location} 
                    onChange={e => setContactData({...contactData, location: e.target.value})}
                    className="col-span-9 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-400" 
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 my-4"></div>

              <div className="space-y-3">
                
                <div className="grid grid-cols-12 items-center gap-3">
                  <label className="col-span-3 text-right text-xs font-semibold text-gray-500">LinkedIn</label>
                  <input 
                    type="text" 
                    placeholder="https://www.linkedin.com/in/username"
                    value={contactData.linkedin} 
                    onChange={e => setContactData({...contactData, linkedin: e.target.value})}
                    className="col-span-6 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-400" 
                  />
                  <label className="col-span-3 flex items-center gap-1.5 text-[11px] text-gray-600 font-medium cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={contactData.linkedinFull}
                      onChange={e => setContactData({...contactData, linkedinFull: e.target.checked})}
                      className="rounded border-gray-300 text-gray-800 focus:ring-gray-500"
                    />
                    Show Full URL
                  </label>
                </div>

                <div className="grid grid-cols-12 items-center gap-3">
                  <label className="col-span-3 text-right text-xs font-semibold text-gray-500">GitHub</label>
                  <input 
                    type="text" 
                    placeholder="https://github.com/username"
                    value={contactData.github} 
                    onChange={e => setContactData({...contactData, github: e.target.value})}
                    className="col-span-6 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-400" 
                  />
                  <label className="col-span-3 flex items-center gap-1.5 text-[11px] text-gray-600 font-medium cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={contactData.githubFull}
                      onChange={e => setContactData({...contactData, githubFull: e.target.checked})}
                      className="rounded border-gray-300 text-gray-800 focus:ring-gray-500"
                    />
                    Show Full URL
                  </label>
                </div>

                <div className="grid grid-cols-12 items-center gap-3">
                  <label className="col-span-3 text-right text-xs font-semibold text-gray-500">Portfolio</label>
                  <input 
                    type="text" 
                    placeholder="yourname.com"
                    value={contactData.portfolio} 
                    onChange={e => setContactData({...contactData, portfolio: e.target.value})}
                    className="col-span-6 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-400" 
                  />
                  <label className="col-span-3 flex items-center gap-1.5 text-[11px] text-gray-600 font-medium cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={contactData.portfolioFull}
                      onChange={e => setContactData({...contactData, portfolioFull: e.target.checked})}
                      className="rounded border-gray-300 text-gray-800 focus:ring-gray-500"
                    />
                    Show Full URL
                  </label>
                </div>

                <div className="grid grid-cols-12 items-center gap-3">
                  <label className="col-span-3 text-right text-xs font-semibold text-gray-500">Blog</label>
                  <input 
                    type="text" 
                    placeholder="medium.com/@yourname"
                    value={contactData.blog} 
                    onChange={e => setContactData({...contactData, blog: e.target.value})}
                    className="col-span-6 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-400" 
                  />
                  <label className="col-span-3 flex items-center gap-1.5 text-[11px] text-gray-600 font-medium cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={contactData.blogFull}
                      onChange={e => setContactData({...contactData, blogFull: e.target.checked})}
                      className="rounded border-gray-300 text-gray-800 focus:ring-gray-500"
                    />
                    Show Full URL
                  </label>
                </div>

                <div className="grid grid-cols-12 items-center gap-3">
                  <label className="col-span-3 text-right text-xs font-semibold text-gray-500">Social</label>
                  <input 
                    type="text" 
                    placeholder="x.com/yourhandle"
                    value={contactData.social} 
                    onChange={e => setContactData({...contactData, social: e.target.value})}
                    className="col-span-6 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-400" 
                  />
                  <label className="col-span-3 flex items-center gap-1.5 text-[11px] text-gray-600 font-medium cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={contactData.socialFull}
                      onChange={e => setContactData({...contactData, socialFull: e.target.checked})}
                      className="rounded border-gray-300 text-gray-800 focus:ring-gray-500"
                    />
                    Show Full URL
                  </label>
                </div>

              </div>

              <div className="pt-4">
                <button
                  onClick={() => setShowEditContactModal(false)}
                  className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-5 py-2 rounded-lg shadow transition cursor-pointer"
                >
                  Done
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: AI 100% ATS OPTIMIZATION ================= */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-gray-900 max-w-4xl w-full p-6 rounded-2xl border border-gray-200 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-black text-white rounded-xl">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-950">Optimizare AI ATS 100% (Groq Live)</h3>
                  <p className="text-[11px] text-gray-500">Analiză diferențe ATS + Rescriere adaptată pentru cerințele jobului</p>
                </div>
              </div>
              <button onClick={() => setShowAiModal(false)} className="p-1 text-gray-400 hover:text-black rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {applications.length > 0 && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">Selectează Jobul din Tracker:</label>
                  <select 
                    value={selectedJobId}
                    onChange={e => setSelectedJobId(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs text-gray-900"
                  >
                    {applications.map(app => (
                      <option key={app.id} value={app.id}>{app.jobTitle} la {app.companyName}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1">Sau introdu cerințe job personalizate:</label>
                <input 
                  type="text" 
                  placeholder="ex: Java 21, Spring Boot, Microservices, Kubernetes, Redis"
                  value={customJobDescription}
                  onChange={e => setCustomJobDescription(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs text-gray-900"
                />
              </div>
            </div>

            <button
              onClick={handleRunTwoAgentPipeline}
              disabled={isAnalyzing}
              className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition disabled:opacity-60 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-gray-300" />
                  Se rulează Agent 1 (Gap Analyzer) & Agent 2 (Groq LLM Rewriter)...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Rulează Analiza și Rescrierea AI (Groq Live)
                </>
              )}
            </button>

            {(agent1Output || agent2Output) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {agent1Output && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-black" /> Agent 1: Gap Analyzer
                      </span>
                      <span className="px-2 py-0.5 bg-black text-white rounded font-mono font-bold text-[10px]">
                        Scor: 100%
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                        <span className="text-[10px] font-bold text-emerald-700 block">Skill-uri Match:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {agent1Output.matchingSkills.map(s => (
                            <span key={s} className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">{s}</span>
                          ))}
                        </div>
                      </div>

                      <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                        <span className="text-[10px] font-bold text-rose-700 block">Cuvinte Cheie de Adăugat:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {agent1Output.missingSkills.map(s => (
                            <span key={s} className="text-[9px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded font-medium">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {agent2Output && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 flex items-center gap-1.5">
                        <BrainCircuit className="w-4 h-4 text-black" /> Agent 2: CV Rewriter (100%)
                      </span>
                      <button
                        onClick={handleApplyAiOptimizations}
                        className="px-2.5 py-1 bg-black hover:bg-neutral-800 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 shadow transition cursor-pointer"
                      >
                        <Check className="w-3 h-3 text-emerald-400" /> Aplică direct în CV
                      </button>
                    </div>

                    {agent2Output.tailoredSummary && (
                      <div className="p-2.5 bg-white rounded-lg border border-gray-200 space-y-1">
                        <span className="text-[10px] font-bold text-gray-700">Summary Re-scris:</span>
                        <p className="text-[11px] text-gray-800 italic">{agent2Output.tailoredSummary}</p>
                      </div>
                    )}

                    {agent2Output.tailoredProjects?.[0]?.bullets?.length > 0 && (
                      <div className="p-2.5 bg-white rounded-lg border border-gray-200 space-y-1 max-h-36 overflow-y-auto">
                        <span className="text-[10px] font-bold text-gray-700">Bullet-uri Metoda XYZ:</span>
                        {agent2Output.tailoredProjects[0].bullets.map((b, idx) => (
                          <p key={idx} className="text-[10px] text-gray-800 flex items-start gap-1">
                            <span className="text-black">•</span> <span>{b}</span>
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
