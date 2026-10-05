import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Github, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  Code2, 
  Layers, 
  Eye, 
  Sliders, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle, 
  ExternalLink, 
  User, 
  Briefcase, 
  Mail, 
  Linkedin, 
  FileCode, 
  Terminal, 
  Flame, 
  BookOpen, 
  Wrench, 
  Plus, 
  Trash2, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

export default function GithubReadmeStudio({ currentUser }) {
  const DEFAULT_USER_ID = '23fe8bdd-08f4-413d-9985-f99c21040b59';
  const activeUserId = currentUser?.userId || currentUser?.id || DEFAULT_USER_ID;

  // Available archetypes
  const ARCHETYPES = [
    {
      id: 'BACKEND_SYSTEMS',
      title: 'Backend & Systems Engineer',
      desc: 'Focus pe Java 21, Spring Boot, baze de date relationale, microservicii si latenta redusa.',
      badge: 'Recomandat'
    },
    {
      id: 'FULLSTACK_SYSTEMS',
      title: 'Full-Stack & Cloud Engineer',
      desc: 'Ecosistem complet: Spring Boot + React, Docker, containere si livrare end-to-end.',
      badge: 'Popular'
    },
    {
      id: 'MINIMALIST_LEAD',
      title: 'Minimalist Senior / Tech Lead',
      desc: 'Zero decoratiuni inutile, stil curat Unix, cod si arhitectura pe primul loc.',
      badge: 'Clean Code'
    },
    {
      id: 'OPEN_SOURCE',
      title: 'Open Source & Product Builder',
      desc: 'Orientat pe proiecte publice, invatare activa, documentatie impecabila si metrici.',
      badge: 'Community'
    }
  ];

  // Predefined catalog of Shields.io badges
  const TECH_CATALOG = {
    'Limbaje': [
      { name: 'Java', badge: '![Java](https://img.shields.io/badge/Java_21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)' },
      { name: 'Python', badge: '![Python](https://img.shields.io/badge/Python_3-3776AB?style=flat-square&logo=python&logoColor=white)' },
      { name: 'SQL', badge: '![SQL](https://img.shields.io/badge/SQL-CC292B?style=flat-square)' },
      { name: 'TypeScript', badge: '![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)' },
      { name: 'JavaScript', badge: '![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)' },
      { name: 'C++', badge: '![C++](https://img.shields.io/badge/C++-00599C?style=flat-square&logo=c%2B%2B&logoColor=white)' }
    ],
    'Backend & Frameworks': [
      { name: 'Spring Boot', badge: '![Spring Boot](https://img.shields.io/badge/Spring_Boot_3-6DB33F?style=flat-square&logo=springboot&logoColor=white)' },
      { name: 'Spring Cloud', badge: '![Spring Cloud](https://img.shields.io/badge/Spring_Cloud-6DB33F?style=flat-square&logo=spring&logoColor=white)' },
      { name: 'REST API', badge: '![REST API](https://img.shields.io/badge/REST_APIs-009688?style=flat-square)' },
      { name: 'Microservices', badge: '![Microservices](https://img.shields.io/badge/Microservices-34495E?style=flat-square)' }
    ],
    'Baze de Date & Caching': [
      { name: 'PostgreSQL', badge: '![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)' },
      { name: 'pgvector', badge: '![pgvector](https://img.shields.io/badge/pgvector-336791?style=flat-square&logo=postgresql&logoColor=white)' },
      { name: 'Redis', badge: '![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)' }
    ],
    'DevOps & Tooling': [
      { name: 'Docker', badge: '![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)' },
      { name: 'Git', badge: '![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white)' },
      { name: 'GitHub Actions', badge: '![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)' },
      { name: 'Linux', badge: '![Linux](https://img.shields.io/badge/Linux-FCC624?style=flat-square&logo=linux&logoColor=black)' },
      { name: 'Postman', badge: '![Postman](https://img.shields.io/badge/Postman-FF6C37?style=flat-square&logo=postman&logoColor=white)' }
    ],
    'Frontend': [
      { name: 'React', badge: '![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)' },
      { name: 'Tailwind CSS', badge: '![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)' }
    ],
    'Testare': [
      { name: 'JUnit 5', badge: '![JUnit 5](https://img.shields.io/badge/JUnit_5-25A162?style=flat-square&logo=junit5&logoColor=white)' },
      { name: 'Mockito', badge: '![Mockito](https://img.shields.io/badge/Mockito-brightgreen?style=flat-square)' }
    ]
  };

  // State
  const [cvList, setCvList] = useState([]);
  const [selectedCvId, setSelectedCvId] = useState('');
  const [loadingCvList, setLoadingCvList] = useState(false);

  // Form Fields
  const [candidateName, setCandidateName] = useState(currentUser?.fullName || 'Mihai Sirbu');
  const [githubUsername, setGithubUsername] = useState('sarbumihai');
  const [archetype, setArchetype] = useState('BACKEND_SYSTEMS');
  const [headline, setHeadline] = useState('Software Engineer | Java 21, Spring Boot & Backend Systems');
  const [bioText, setBioText] = useState('Software Engineer specializing in Java, Spring Boot, and high-concurrency relational systems. Experienced in architecting REST APIs, optimizing PostgreSQL query plans, and containerizing distributed microservices.');
  const [techPhilosophy, setTechPhilosophy] = useState('Predictable latency, clear module boundaries, and rigorous unit testing over premature complexity.');

  const [building, setBuilding] = useState('High-throughput job crawler pipelines and vector semantic search engines');
  const [learning, setLearning] = useState('Advanced JVM tuning, distributed consensus, and database indexing internals');
  const [collaborating, setCollaborating] = useState('Backend performance optimization and microservices architecture');

  const [selectedTechs, setSelectedTechs] = useState(['Java', 'Spring Boot', 'PostgreSQL', 'pgvector', 'Docker', 'Git', 'GitHub Actions', 'React', 'Linux', 'JUnit 5']);
  
  const [projects, setProjects] = useState([
    {
      title: 'ATS AI Career Coach & Job Match Engine',
      techStack: 'Java 21, Spring Boot 3.3, PostgreSQL, pgvector, React, Docker',
      linkUrl: 'https://github.com/sirbumihai/ATS_Job_Tracker',
      bullets: [
        'High-concurrency job ingestion pipeline processing 8.5k+ postings in <10s using Java 21 Virtual Threads.',
        'Engineered 384-dimension vector similarity search with PostgreSQL pgvector (HNSW Index), achieving sub-15ms semantic matching.'
      ]
    },
    {
      title: 'E-Commerce Microservices Banking Platform',
      techStack: 'Java 21, Spring Cloud, PostgreSQL, Docker, Redis',
      linkUrl: '',
      bullets: [
        'Resilient distributed backend with circuit breakers and central service discovery, maintaining 99.9% uptime under concurrent load.',
        'Optimized database execution time by 40% with B-Tree composite indexing across high-volume relational tables.'
      ]
    }
  ]);

  // Widgets & Stats
  const [includeStats, setIncludeStats] = useState(true);
  const [includeLanguages, setIncludeLanguages] = useState(true);
  const [includeStreak, setIncludeStreak] = useState(true);
  const [statsTheme, setStatsTheme] = useState('github_dark');

  // Contact
  const [linkedinUrl, setLinkedinUrl] = useState('https://linkedin.com/in/sarbumihai');
  const [email, setEmail] = useState('sarbumihai0@gmail.com');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // UI state
  const [viewTab, setViewTab] = useState('preview'); // 'preview' | 'code'
  const [previewTheme, setPreviewTheme] = useState('dark'); // 'dark' | 'light'
  const [rawMarkdown, setRawMarkdown] = useState('');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [antiAiTips, setAntiAiTips] = useState([
    'Design Senior 100% Non-AI: Fara emoticoane (fara rachete, unelte, fete zambitoare sau degete indicatoare).',
    'Structura inginereasca clara: Focus activ, stack tehnic grupat pe categorii, proiecte cu metrici concrete.',
    'Zero clisee corporatiste ("passionate developer", "crafting seamless experiences", "transformative synergy").',
    'Insigne Shields.io flat-square discrete cu logo-uri oficiale de brand.',
    'Metrici tehnice masurabile (latenta P99, cereri concurente, indici de baze de date, acoperire de teste).'
  ]);

  // Load CV profiles from backend
  useEffect(() => {
    const fetchCvs = async () => {
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
            syncFromCvProfile(primary);
          }
        }
      } catch (err) {
        console.error('Eroare la preluarea CV-urilor:', err);
      } finally {
        setLoadingCvList(false);
      }
    };
    fetchCvs();
  }, [activeUserId]);

  // Sync state from CV Profile
  const syncFromCvProfile = (cv) => {
    if (!cv) return;
    if (cv.fullName) setCandidateName(cv.fullName);
    if (cv.email) setEmail(cv.email);
    if (cv.linkedin) setLinkedinUrl(cv.linkedin);
    if (cv.github) {
      const cleanHandle = cv.github.replace(/https?:\/\/github\.com\//i, '').replace(/\/+$/, '');
      if (cleanHandle) setGithubUsername(cleanHandle);
    }

    // Parse technologies from CV skills
    const rawSkills = [cv.skillsLanguages, cv.skillsFrameworks, cv.skillsDatabases, cv.skillsDevops].filter(Boolean).join(', ');
    if (rawSkills) {
      const tokens = rawSkills.split(/[,;•\n]+/).map(s => s.trim().toLowerCase());
      const allCatalogTechs = Object.values(TECH_CATALOG).flat();
      const matched = allCatalogTechs
        .filter(t => tokens.some(tok => tok === t.name.toLowerCase() || t.name.toLowerCase().includes(tok)))
        .map(t => t.name);
      if (matched.length > 0) {
        setSelectedTechs([...new Set(matched)]);
      }
    }

    // Parse projects from CV
    if (cv.projectsJson) {
      try {
        const parsed = JSON.parse(cv.projectsJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const projectItems = parsed.map(p => ({
            title: p.title || 'Project',
            techStack: p.techStack || '',
            linkUrl: p.linkUrl || '',
            bullets: Array.isArray(p.bullets) ? p.bullets : []
          }));
          setProjects(projectItems);
        }
      } catch (e) {
        console.warn('Nu s-au putut parsa proiectele din CV:', e);
      }
    }
  };

  // Toggle tech badge
  const toggleTech = (techName) => {
    setSelectedTechs(prev => 
      prev.includes(techName) ? prev.filter(t => t !== techName) : [...prev, techName]
    );
  };

  // Emoji stripper helper (preserves newlines and markdown structure!)
  const stripEmojis = (str) => {
    if (!str) return '';
    return str
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '')
      .replace(/[👋🚀⚡🛠📊📫👉🔨🔭📚💬✨]/g, '')
      .replace(/[^\S\r\n]{2,}/g, ' ') // ONLY horizontal whitespace! Never touch newlines!
      .replace(/\n{3,}/g, '\n\n') // Normalize multiple empty lines to max 2
      .trim();
  };

  // Build Badges String grouped by domain categories
  const badgesString = useMemo(() => {
    const sections = [];
    const allBadgesMap = new Map();
    Object.values(TECH_CATALOG).flat().forEach(t => allBadgesMap.set(t.name, t.badge));

    Object.entries(TECH_CATALOG).forEach(([category, techs]) => {
      const selectedInCategory = techs.filter(t => selectedTechs.includes(t.name));
      if (selectedInCategory.length > 0) {
        const badgesRow = selectedInCategory.map(t => t.badge).join(' ');
        sections.push(`**${category}**\n\n${badgesRow}`);
      }
    });

    const knownTechNames = Object.values(TECH_CATALOG).flat().map(t => t.name);
    const customTechs = selectedTechs.filter(t => !knownTechNames.includes(t));
    if (customTechs.length > 0) {
      const customRow = customTechs
        .map(name => `![${name}](https://img.shields.io/badge/${encodeURIComponent(name)}-1e293b?style=flat-square)`)
        .join(' ');
      sections.push(`**Instrumente & Biblioteci**\n\n${customRow}`);
    }

    return sections.join('\n\n');
  }, [selectedTechs]);

  // Generate full markdown dynamically with senior typography, clean spacing, and 0 emojis
  const generatedMarkdown = useMemo(() => {
    const cleanUser = githubUsername.trim() || 'username';

    const sections = [];

    // Header Block
    let headerBlock = `# ${candidateName}\n\n### ${headline}`;
    sections.push(headerBlock);

    // Bio
    if (bioText && bioText.trim()) {
      sections.push(bioText.trim());
    }

    // Engineering Mindset Quote
    if (techPhilosophy && techPhilosophy.trim()) {
      sections.push(`> **Engineering Mindset**: ${techPhilosophy.trim()}`);
    }

    // Current Focus
    const focusItems = [];
    if (building && building.trim()) focusItems.push(`- **Active Development**: ${building.trim()}`);
    if (learning && learning.trim()) focusItems.push(`- **Technical Deep-Dives**: ${learning.trim()}`);
    if (collaborating && collaborating.trim()) focusItems.push(`- **Architecture & Discussions**: ${collaborating.trim()}`);
    if (focusItems.length > 0) {
      sections.push(`### Current Focus\n\n${focusItems.join('\n')}`);
    }

    // Tech Stack
    if (badgesString && badgesString.trim()) {
      sections.push(`### Tech Stack & Tooling\n\n${badgesString.trim()}`);
    }

    // Featured Projects
    if (projects.length > 0) {
      const projectBlocks = projects.map(p => {
        const parts = [];
        parts.push(`#### ${p.title}`);
        if (p.techStack && p.techStack.trim()) {
          parts.push(`\`${p.techStack.trim()}\``);
        }
        if (Array.isArray(p.bullets) && p.bullets.length > 0) {
          parts.push(p.bullets.map(b => `- ${b.trim()}`).join('\n'));
        }
        if (p.linkUrl && p.linkUrl.trim()) {
          parts.push(`[View Repository](${p.linkUrl.trim()})`);
        }
        return parts.join('\n\n');
      });
      sections.push(`### Featured Engineering Projects\n\n${projectBlocks.join('\n\n---\n\n')}`);
    }

    // GitHub Stats
    if (includeStats || includeLanguages || includeStreak) {
      const statsParts = [];
      statsParts.push('<p align="center">');
      if (includeStats) {
        statsParts.push(`  <img src="https://github-readme-stats.vercel.app/api?username=${cleanUser}&show_icons=true&theme=${statsTheme}&hide_border=true&count_private=true" alt="GitHub Stats" height="150" />`);
      }
      if (includeLanguages) {
        statsParts.push(`  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=${cleanUser}&layout=compact&theme=${statsTheme}&hide_border=true" alt="Top Languages" height="150" />`);
      }
      statsParts.push('</p>');

      if (includeStreak) {
        statsParts.push('<p align="center">');
        statsParts.push(`  <img src="https://github-readme-streak-stats.herokuapp.com/?user=${cleanUser}&theme=${statsTheme}&hide_border=true" alt="GitHub Streak" />`);
        statsParts.push('</p>');
      }
      sections.push(`### GitHub Metrics\n\n${statsParts.join('\n')}`);
    }

    // Contact
    const contactBadges = [];
    if (linkedinUrl && linkedinUrl.trim()) {
      contactBadges.push(`[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](${linkedinUrl.trim()})`);
    }
    if (email && email.trim()) {
      contactBadges.push(`[![Email](https://img.shields.io/badge/Email-${encodeURIComponent(email.trim())}-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:${email.trim()})`);
    }
    if (portfolioUrl && portfolioUrl.trim()) {
      contactBadges.push(`[![Portfolio](https://img.shields.io/badge/Portfolio-000000?style=flat-square&logo=aboutdotme&logoColor=white)](${portfolioUrl.trim()})`);
    }
    if (contactBadges.length > 0) {
      sections.push(`### Connect\n\n${contactBadges.join(' ')}`);
    }

    return stripEmojis(sections.join('\n\n---\n\n'));
  }, [
    candidateName, headline, bioText, techPhilosophy,
    building, learning, collaborating,
    badgesString, projects, githubUsername,
    includeStats, includeLanguages, includeStreak, statsTheme,
    linkedinUrl, email, portfolioUrl
  ]);

  // Keep rawMarkdown in sync unless user edited it
  useEffect(() => {
    setRawMarkdown(generatedMarkdown);
  }, [generatedMarkdown]);

  // Call Backend AI Generator for Smart Polish (with strict Anti-AI filter)
  const handleAiRefine = async () => {
    setGenerating(true);
    try {
      const payload = {
        cvProfileId: selectedCvId || null,
        githubUsername: githubUsername.trim() || 'sarbumihai',
        candidateName: candidateName.trim(),
        targetRole: headline.trim(),
        archetype: archetype,
        tone: 'PRAGMATIC_HUMAN',
        includeStatsCards: includeStats,
        includeLanguages: includeLanguages,
        includeStreak: includeStreak,
        statsTheme: statsTheme,
        selectedTechnologies: selectedTechs,
        linkedinUrl: linkedinUrl.trim(),
        email: email.trim(),
        portfolioUrl: portfolioUrl.trim()
      };

      const res = await fetch('/api/v1/github-readme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': activeUserId
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.headline) setHeadline(data.headline);
        if (data.bioSection) setBioText(data.bioSection);
        if (data.fullMarkdown) setRawMarkdown(data.fullMarkdown);
        if (Array.isArray(data.antiAiHighlights) && data.antiAiHighlights.length > 0) {
          setAntiAiTips(data.antiAiHighlights);
        }
      }
    } catch (err) {
      console.error('Eroare la generarea AI README:', err);
    } finally {
      setGenerating(false);
    }
  };

  // Copy Markdown to Clipboard
  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(rawMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Eroare la copiere:', e);
    }
  };

  // Download README.md
  const handleDownloadReadme = () => {
    const element = document.createElement('a');
    const file = new Blob([rawMarkdown], { type: 'text/markdown;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = 'README.md';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER SECTION - DOUBLE-BEZEL HARDWARE HERO */}
      <div className="bg-slate-100/80 p-1.5 rounded-[2.25rem] border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="bg-white p-6 sm:p-7 rounded-[calc(2.25rem-0.375rem)] border border-slate-200/60 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
          {/* Subtle Ambient Radial Backlight */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-indigo-100/50 via-slate-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2 rounded-xl bg-slate-950 text-white shadow-2xs">
                <Github className="w-5 h-5 text-white" />
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-950 tracking-tight">
                GitHub Profile README <span className="text-indigo-600">Studio</span>
              </h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Senior Clean · Zero Emoticoane · 100% Non-AI
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed font-normal">
              Creeaza un README.md autentic, sobru si non-AI pentru profilul tau de GitHub. Fara emoticoane juvenile sau clisee corporatiste, axat pe arhitectura reala, metrici masurabile si stack tehnic structurat pe domenii.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowGuideModal(true)}
              className="group inline-flex items-center gap-2 pl-4 pr-2 py-2 rounded-xl text-xs font-black bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200/80 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer shadow-2xs"
            >
              <span>Ghid Configurare GitHub</span>
              <span className="w-5 h-5 rounded-lg bg-white shadow-2xs flex items-center justify-center transition-transform group-hover:scale-105">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* WORKSPACE GRID: 5 COLS CONFIG, 7 COLS PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANEL: CONFIGURATION (5 COLS) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* MAIN CONFIGURATION CARD - DOUBLE-BEZEL HARDWARE */}
          <div className="bg-slate-100/80 p-1.5 rounded-[2rem] border border-slate-200/80 shadow-xs relative overflow-hidden">
            <div className="bg-white p-6 rounded-[calc(2rem-0.375rem)] border border-slate-200/60 shadow-xs space-y-6">
              
              {/* 1. CV PROFILE SELECTION & SYNC */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    1. Sursa Date Profil (CV)
                  </label>
                  {cvList.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const chosen = cvList.find(c => c.id === selectedCvId);
                        if (chosen) syncFromCvProfile(chosen);
                      }}
                      className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" /> Resincronizeaza
                    </button>
                  )}
                </div>

                {loadingCvList ? (
                  <div className="text-xs text-slate-400 py-2.5 flex items-center gap-2 font-medium">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" /> Se incarca CV-urile...
                  </div>
                ) : cvList.length > 0 ? (
                  <select
                    value={selectedCvId}
                    onChange={(e) => {
                      setSelectedCvId(e.target.value);
                      const chosen = cvList.find(c => c.id === e.target.value);
                      if (chosen) syncFromCvProfile(chosen);
                    }}
                    className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-slate-50/80 text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none cursor-pointer shadow-2xs"
                  >
                    {cvList.map((cv) => (
                      <option key={cv.id}>
                        {cv.title || 'CV'}{cv.isPrimary ? ' [Principal]' : ''} — {cv.fullName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-slate-500 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 font-medium">
                    Nu ai un CV salvat in aplicatie. Se folosesc datele implicite.
                  </p>
                )}
              </div>

              <div className="h-px bg-slate-100" />

              {/* 2. ARCHETYPE PRESETS */}
              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  2. Arhetip Ingineresc
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ARCHETYPES.map((arch) => {
                    const isSelected = archetype === arch.id;
                    return (
                      <button
                        key={arch.id}
                        type="button"
                        onClick={() => {
                          setArchetype(arch.id);
                          if (arch.id === 'BACKEND_SYSTEMS') {
                            setHeadline('Software Engineer | Java 21, Spring Boot & Backend Systems');
                            setBioText('Software Engineer specializing in Java, Spring Boot, and high-concurrency relational systems. Experienced in architecting REST APIs, optimizing PostgreSQL query plans, and containerizing distributed microservices.');
                          } else if (arch.id === 'FULLSTACK_SYSTEMS') {
                            setHeadline('Full-Stack Engineer | Java, Spring Boot & React');
                            setBioText('I engineer end-to-end web applications and robust distributed backends. Focused on clean architecture, responsive frontends, and automated CI/CD pipelines.');
                          } else if (arch.id === 'MINIMALIST_LEAD') {
                            setHeadline('Software Engineer | Systems & Architecture');
                            setBioText('Backend-focused engineer building reliable, low-latency microservices and scalable database systems. No buzzwords — just clean code, high test coverage, and dependable software.');
                          } else if (arch.id === 'OPEN_SOURCE') {
                            setHeadline('Software Engineer | Open Source & Backend Systems');
                            setBioText('Developer passionate about open-source collaboration, robust REST APIs, and building reliable developer tooling.');
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer ${
                          isSelected 
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-2xs ring-1 ring-indigo-500/20' 
                            : 'border-slate-200/80 bg-slate-50/70 hover:bg-slate-100/70 text-slate-700 hover:border-slate-300/80'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-black">{arch.title}</span>
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {arch.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight line-clamp-2 font-medium">{arch.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              {/* 3. PROFILE IDENTIFIERS & HEADLINE */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-600" />
                  3. Identificatori & Titlu
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Nume Complet</label>
                    <input
                      type="text"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200/90 bg-slate-50/80 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block flex items-center gap-1">
                      <Github className="w-3 h-3 text-slate-500" /> GitHub Username
                    </label>
                    <input
                      type="text"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      placeholder="sarbumihai"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200/90 bg-slate-50/80 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none font-mono font-black text-indigo-700"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">Headline Principal</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200/90 bg-slate-50/80 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">Bio / Descriere Concisa (Non-AI)</label>
                  <textarea
                    rows={3}
                    value={bioText}
                    onChange={(e) => setBioText(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200/90 bg-slate-50/80 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none resize-none leading-relaxed text-slate-800 font-sans"
                  />
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              {/* 4. TECH STACK SELECTION (BADGES) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                    4. Stack Tehnic & Insigne ({selectedTechs.length})
                  </label>
                </div>

                <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                  {Object.entries(TECH_CATALOG).map(([category, techs]) => (
                    <div key={category} className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">{category}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {techs.map((t) => {
                          const isSelected = selectedTechs.includes(t.name);
                          return (
                            <button
                              key={t.name}
                              type="button"
                              onClick={() => toggleTech(t.name)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer flex items-center gap-1.5 ${
                                isSelected 
                                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs ring-1 ring-indigo-500/20' 
                                  : 'bg-slate-100/80 text-slate-700 border-slate-200/80 hover:bg-slate-200/80'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                              <span>{t.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              {/* 5. GITHUB STATS & THEME */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  5. Widget-uri GitHub Stats
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 text-xs text-slate-700 font-bold cursor-pointer p-2 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={includeStats}
                      onChange={(e) => setIncludeStats(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <span>Stats Card</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 font-bold cursor-pointer p-2 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={includeLanguages}
                      onChange={(e) => setIncludeLanguages(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <span>Top Langs</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 font-bold cursor-pointer p-2 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={includeStreak}
                      onChange={(e) => setIncludeStreak(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <span>Streak Card</span>
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">Tema Carduri GitHub</label>
                  <select
                    value={statsTheme}
                    onChange={(e) => setStatsTheme(e.target.value)}
                    className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200/90 bg-slate-50/80 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none cursor-pointer shadow-2xs"
                  >
                    <option value="github_dark">GitHub Dark (Implicit)</option>
                    <option value="dark">Dark Minimal</option>
                    <option value="tokyonight">Tokyo Night</option>
                    <option value="dracula">Dracula</option>
                    <option value="nord">Nord</option>
                    <option value="radical">Radical</option>
                    <option value="minimal">Minimal White</option>
                  </select>
                </div>
              </div>

              {/* AI REFINE BUTTON - BUTTON-IN-BUTTON ARCHITECTURE */}
              <button
                onClick={handleAiRefine}
                disabled={generating}
                className="group w-full py-3 pl-5 pr-2.5 rounded-2xl font-black text-xs flex items-center justify-between gap-3 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:shadow-sm active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>{generating ? 'Se analizeaza si optimizeaza README-ul...' : 'Lustruieste cu Filtru Non-AI'}</span>
                </span>
                <span className="w-7 h-7 rounded-xl bg-indigo-700/60 flex items-center justify-center transition-transform group-hover:scale-105 group-hover:translate-x-0.5">
                  {generating ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <ArrowRight className="w-4 h-4 text-white" />}
                </span>
              </button>

            </div>
          </div>

          {/* ANTI-AI QUALITY BADGE - DOUBLE-BEZEL HARDWARE */}
          <div className="bg-slate-100/70 p-1.5 rounded-[1.75rem] border border-slate-200/80 shadow-xs">
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-[calc(1.75rem-0.375rem)] p-4.5 text-xs text-emerald-950 space-y-2.5">
              <h4 className="font-black flex items-center gap-2 text-emerald-900 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Ce face acest profil 100% Non-AI?
              </h4>
              <ul className="space-y-1.5 text-[11px] text-emerald-800 leading-relaxed font-medium">
                {antiAiTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: LIVE GITHUB PREVIEW & MARKDOWN CODE (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* TOOLBAR - DOUBLE-BEZEL COMPACT STRIP */}
          <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
            {/* VIEW MODE TABS - SEGMENTED FLUID ISLAND */}
            <div className="flex bg-white/80 p-1 rounded-xl border border-slate-200/80 shadow-2xs gap-1">
              <button
                type="button"
                onClick={() => setViewTab('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer ${
                  viewTab === 'preview' ? 'bg-indigo-600 text-white shadow-2xs ring-1 ring-indigo-500/20' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Previzualizare GitHub</span>
              </button>

              <button
                type="button"
                onClick={() => setViewTab('code')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer ${
                  viewTab === 'code' ? 'bg-indigo-600 text-white shadow-2xs ring-1 ring-indigo-500/20' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Cod Markdown (README.md)</span>
              </button>
            </div>

            {/* PREVIEW THEME TOGGLE */}
            {viewTab === 'preview' && (
              <div className="flex items-center gap-1 bg-white/80 p-1 rounded-xl border border-slate-200/80 shadow-2xs text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewTheme('dark')}
                  className={`px-2.5 py-1 rounded-lg font-black text-[11px] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer ${
                    previewTheme === 'dark' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  GitHub Dark
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTheme('light')}
                  className={`px-2.5 py-1 rounded-lg font-black text-[11px] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer ${
                    previewTheme === 'light' ? 'bg-slate-100 text-slate-950 shadow-2xs' : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  GitHub Light
                </button>
              </div>
            )}

            {/* ACTIONS: COPY & DOWNLOAD */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 flex items-center gap-1.5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer shadow-2xs"
                title="Copiaza tot codul Markdown in clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiat!' : 'Copiaza Markdown'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadReadme}
                className="group inline-flex items-center gap-2 pl-3.5 pr-2 py-1.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer shadow-xs hover:shadow-sm"
              >
                <span>Descarca README.md</span>
                <span className="w-5 h-5 rounded-lg bg-indigo-700/60 flex items-center justify-center transition-transform group-hover:scale-105">
                  <Download className="w-3.5 h-3.5 text-white" />
                </span>
              </button>
            </div>
          </div>

          {/* MAIN PREVIEW CONTAINER (MIMICS GITHUB PROFILE REPO) - DOUBLE-BEZEL */}
          {viewTab === 'preview' ? (
            <div className="bg-slate-100/80 p-1.5 rounded-[2rem] border border-slate-200/80 shadow-xs relative overflow-hidden">
              <div className={`rounded-[calc(2rem-0.375rem)] border shadow-xs transition-colors overflow-hidden ${
                previewTheme === 'dark' 
                  ? 'bg-[#0d1117] text-[#c9d1d9] border-[#30363d]' 
                  : 'bg-white text-[#24292f] border-slate-200'
              }`}>
                
                {/* GITHUB FILE HEADER BAR */}
                <div className={`px-4 py-3 border-b flex items-center justify-between text-xs font-mono font-medium ${
                  previewTheme === 'dark' 
                    ? 'bg-[#161b22] border-[#30363d] text-[#8b949e]' 
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="font-bold text-indigo-400">{githubUsername.trim() || 'username'}</span>
                    <span>/</span>
                    <span className="font-bold">{previewTheme === 'dark' ? 'README.md' : 'README.md'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-bold">Special Repository</span>
                  </div>
                </div>

                {/* RENDERED MARKDOWN CONTENT */}
                <div className="p-6 sm:p-10 leading-relaxed font-sans prose prose-slate max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({node, ...props}) => <h1 className={`text-2xl sm:text-3xl font-black pb-2 border-b mb-4 tracking-tight ${previewTheme === 'dark' ? 'text-white border-[#30363d]' : 'text-slate-950 border-slate-200'}`} {...props} />,
                      h2: ({node, ...props}) => <h2 className={`text-xl font-black pb-1 border-b mt-6 mb-3 tracking-tight ${previewTheme === 'dark' ? 'text-white border-[#30363d]' : 'text-slate-950 border-slate-200'}`} {...props} />,
                      h3: ({node, ...props}) => <h3 className={`text-lg font-black pb-1 border-b mt-6 mb-3 tracking-tight ${previewTheme === 'dark' ? 'text-white border-[#30363d]' : 'text-slate-950 border-slate-200'}`} {...props} />,
                      h4: ({node, ...props}) => <h4 className={`text-sm font-black mt-4 mb-1.5 ${previewTheme === 'dark' ? 'text-indigo-300' : 'text-indigo-950'}`} {...props} />,
                      p: ({node, ...props}) => <p className={`text-xs sm:text-sm my-2.5 leading-relaxed ${previewTheme === 'dark' ? 'text-[#c9d1d9]' : 'text-slate-700'}`} {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2.5 space-y-1.5 text-xs sm:text-sm" {...props} />,
                      li: ({node, ...props}) => <li className={`${previewTheme === 'dark' ? 'text-[#c9d1d9]' : 'text-slate-700'} leading-relaxed`} {...props} />,
                      blockquote: ({node, ...props}) => (
                        <blockquote className={`border-l-4 pl-3.5 py-1.5 my-3.5 text-xs italic ${
                          previewTheme === 'dark' ? 'border-indigo-500 bg-[#161b22] text-[#8b949e]' : 'border-indigo-600 bg-slate-50 text-slate-600'
                        }`} {...props} />
                      ),
                      hr: () => <hr className={`my-5 border-t ${previewTheme === 'dark' ? 'border-[#30363d]' : 'border-slate-200'}`} />,
                      code: ({node, inline, ...props}) => inline ? (
                        <code className={`px-1.5 py-0.5 rounded text-xs font-mono font-semibold ${
                          previewTheme === 'dark' ? 'bg-[#161b22] text-indigo-300' : 'bg-slate-100 text-indigo-700'
                        }`} {...props} />
                      ) : (
                        <code className="block p-3 rounded-xl text-xs font-mono bg-[#161b22] overflow-x-auto" {...props} />
                      ),
                      img: ({node, ...props}) => (
                        <img className="inline-block mr-1.5 mb-1.5 align-middle rounded max-w-full" alt={props.alt || ''} {...props} />
                      ),
                      strong: ({node, ...props}) => (
                        <strong className={`font-black ${previewTheme === 'dark' ? 'text-white' : 'text-slate-950'}`} {...props} />
                      ),
                      a: ({node, ...props}) => (
                        <a className="text-indigo-400 hover:underline font-bold" target="_blank" rel="noopener noreferrer" {...props} />
                      )
                    }}
                  >
                    {rawMarkdown}
                  </ReactMarkdown>
                </div>

              </div>
            </div>
          ) : (
            /* RAW MARKDOWN CODE EDITOR - DOUBLE-BEZEL */
            <div className="bg-slate-100/80 p-1.5 rounded-[2rem] border border-slate-200/80 shadow-xs relative overflow-hidden">
              <div className="bg-slate-950 rounded-[calc(2rem-0.375rem)] border border-slate-800 shadow-xs overflow-hidden flex flex-col">
                <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="font-bold text-slate-300">README.md (Editor Direct)</span>
                  <span className="font-bold text-indigo-400 font-mono">{rawMarkdown.length} caractere</span>
                </div>
                <textarea
                  value={rawMarkdown}
                  onChange={(e) => setRawMarkdown(e.target.value)}
                  rows={28}
                  className="w-full p-4.5 bg-transparent text-slate-200 font-mono text-xs leading-relaxed outline-none resize-none focus:ring-0 selection:bg-indigo-900/60"
                />
              </div>
            </div>
          )}

        </div>

      </div>

      {/* STEP-BY-STEP MODAL: HOW TO SETUP GITHUB PROFILE README - DOUBLE-BEZEL DIALOG */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-100/90 p-1.5 rounded-[2.25rem] border border-slate-200/90 shadow-2xl max-w-xl w-full">
            <div className="bg-white rounded-[calc(2.25rem-0.375rem)] border border-slate-200/60 p-6 sm:p-7 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-slate-950 text-white shadow-2xs">
                    <Github className="w-5 h-5" />
                  </span>
                  <h3 className="font-black text-lg text-slate-950">Cum activezi README-ul pe GitHub?</h3>
                </div>
                <button
                  onClick={() => setShowGuideModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                GitHub ofera o functionalitate speciala: daca creezi un repository public cu <strong className="text-slate-900 font-bold">acelasi nume exact ca username-ul tau</strong>, continutul fisierului <code className="text-indigo-600 font-mono font-bold bg-indigo-50 px-1.5 py-0.5 rounded">README.md</code> va fi afisat automat pe pagina ta de profil!
              </p>

              <div className="space-y-2.5 text-xs text-slate-800">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5 shadow-2xs">1</span>
                  <div className="leading-relaxed">
                    <strong className="text-slate-950 font-black">Creeaza un repository nou pe GitHub:</strong> Mergi la <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-bold">github.com/new</a>.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5 shadow-2xs">2</span>
                  <div className="leading-relaxed">
                    <strong className="text-slate-950 font-black">Numeste repository-ul:</strong> Pune exact username-ul tau (ex: <code className="text-indigo-600 font-mono font-bold">{githubUsername.trim() || 'sarbumihai'}</code>). GitHub va afisa un mesaj cu o cutie verde: <em>"You found a secret!"</em>.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5 shadow-2xs">3</span>
                  <div className="leading-relaxed">
                    <strong className="text-slate-950 font-black">Bifeaza Public si Add a README file:</strong> Creeaza repository-ul.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5 shadow-2xs">4</span>
                  <div className="leading-relaxed">
                    <strong className="text-slate-950 font-black">Lipeste codul generat:</strong> Apasa butonul <strong className="text-slate-900 font-bold">„Copiaza Markdown”</strong> din acest Studio, deschide <code className="font-mono text-indigo-600 font-bold">README.md</code> in GitHub, lipeste continutul si apasa <strong className="text-slate-900 font-bold">Commit changes</strong>!
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowGuideModal(false)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl cursor-pointer active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-xs"
                >
                  Am inteles, multumesc!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
