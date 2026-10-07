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
    <div className="space-y-6 animate-in fade-in duration-300 text-neutral-900 font-sans">
      
      {/* HEADER SECTION */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2 rounded-xl bg-black text-white">
              <Github className="w-5 h-5 text-white" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight">
              GitHub Profile README Studio
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-300">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-900" />
              Senior Clean · Non-AI
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-3xl leading-relaxed">
            Creeaza un README.md autentic, sobru si orientat spre productie pentru profilul tau de GitHub. Axat pe arhitectura reala, metrici masurabile si stack tehnic clar structurat.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowGuideModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-300 transition cursor-pointer"
          >
            <span>Ghid Configurare GitHub</span>
            <HelpCircle className="w-3.5 h-3.5 text-neutral-600" />
          </button>
        </div>
      </div>

      {/* WORKSPACE GRID: 5 COLS CONFIG, 7 COLS PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANEL: CONFIGURATION (5 COLS) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* MAIN CONFIGURATION CARD */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 space-y-5">
            
            {/* 1. CV PROFILE SELECTION & SYNC */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-neutral-900" />
                  1. Sursa Date Profil (CV)
                </label>
                {cvList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const chosen = cvList.find(c => c.id === selectedCvId);
                      if (chosen) syncFromCvProfile(chosen);
                    }}
                    className="text-[11px] font-mono font-medium text-neutral-700 hover:text-black flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Resincronizeaza
                  </button>
                )}
              </div>

              {loadingCvList ? (
                <div className="text-xs text-neutral-400 py-2.5 flex items-center gap-2 font-mono">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-900" /> Se incarca CV-urile...
                </div>
              ) : cvList.length > 0 ? (
                <select
                  value={selectedCvId}
                  onChange={(e) => {
                    setSelectedCvId(e.target.value);
                    const chosen = cvList.find(c => c.id === e.target.value);
                    if (chosen) syncFromCvProfile(chosen);
                  }}
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 focus:border-black transition outline-none cursor-pointer"
                >
                  {cvList.map((cv) => (
                    <option key={cv.id}>
                      {cv.title || 'CV'}{cv.isPrimary ? ' [Principal]' : ''} — {cv.fullName}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-neutral-500 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  Nu ai un CV salvat in aplicatie. Se folosesc datele implicite.
                </p>
              )}
            </div>

            <div className="h-px bg-neutral-100" />

            {/* 2. ARCHETYPE PRESETS */}
            <div className="space-y-2.5">
              <label className="text-xs font-mono font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-neutral-900" />
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
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        isSelected 
                          ? 'border-black bg-neutral-100 text-neutral-950 font-semibold' 
                          : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold">{arch.title}</span>
                        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-700'
                        }`}>
                          {arch.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-500 leading-tight line-clamp-2">{arch.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-neutral-100" />

            {/* 3. PROFILE IDENTIFIERS & HEADLINE */}
            <div className="space-y-3">
              <label className="text-xs font-mono font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-neutral-900" />
                3. Identificatori & Titlu
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-600 block">Nume Complet</label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-neutral-300 bg-white focus:border-black transition outline-none text-neutral-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-600 block flex items-center gap-1">
                    <Github className="w-3 h-3 text-neutral-500" /> GitHub Username
                  </label>
                  <input
                    type="text"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="sarbumihai"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-300 bg-white focus:border-black transition outline-none font-mono font-bold text-neutral-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-600 block">Headline Principal</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-neutral-300 bg-white focus:border-black transition outline-none text-neutral-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-600 block">Bio / Descriere Concisa (Non-AI)</label>
                <textarea
                  rows={3}
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-neutral-300 bg-white focus:border-black transition outline-none resize-none leading-relaxed text-neutral-800 font-sans"
                />
              </div>
            </div>

            <div className="h-px bg-neutral-100" />

            {/* 4. TECH STACK SELECTION (BADGES) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-neutral-900" />
                  4. Stack Tehnic & Insigne ({selectedTechs.length})
                </label>
              </div>

              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {Object.entries(TECH_CATALOG).map(([category, techs]) => (
                  <div key={category} className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">{category}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {techs.map((t) => {
                        const isSelected = selectedTechs.includes(t.name);
                        return (
                          <button
                            key={t.name}
                            type="button"
                            onClick={() => toggleTech(t.name)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium border transition cursor-pointer flex items-center gap-1.5 ${
                              isSelected 
                                ? 'bg-black text-white border-black' 
                                : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200'
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

            <div className="h-px bg-neutral-100" />

            {/* 5. GITHUB STATS & THEME */}
            <div className="space-y-3">
              <label className="text-xs font-mono font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-neutral-900" />
                5. Widget-uri GitHub Stats
              </label>

              <div className="grid grid-cols-3 gap-2">
                <label className="flex items-center gap-2 text-xs text-neutral-800 font-medium cursor-pointer p-2 rounded-xl bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={includeStats}
                    onChange={(e) => setIncludeStats(e.target.checked)}
                    className="rounded text-black focus:ring-0 cursor-pointer"
                  />
                  <span>Stats Card</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-neutral-800 font-medium cursor-pointer p-2 rounded-xl bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={includeLanguages}
                    onChange={(e) => setIncludeLanguages(e.target.checked)}
                    className="rounded text-black focus:ring-0 cursor-pointer"
                  />
                  <span>Top Langs</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-neutral-800 font-medium cursor-pointer p-2 rounded-xl bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={includeStreak}
                    onChange={(e) => setIncludeStreak(e.target.checked)}
                    className="rounded text-black focus:ring-0 cursor-pointer"
                  />
                  <span>Streak Card</span>
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-600 block">Tema Carduri GitHub</label>
                <select
                  value={statsTheme}
                  onChange={(e) => setStatsTheme(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-neutral-300 bg-white focus:border-black transition outline-none cursor-pointer text-neutral-900"
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

            {/* AI REFINE BUTTON */}
            <button
              onClick={handleAiRefine}
              disabled={generating}
              className="w-full py-3 px-4 rounded-xl font-medium text-xs flex items-center justify-between gap-3 bg-black hover:bg-neutral-800 text-white transition cursor-pointer disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white" />
                <span>{generating ? 'Se analizeaza si optimizeaza README-ul...' : 'Lustruieste cu Filtru Non-AI'}</span>
              </span>
              <span className="w-6 h-6 rounded-lg bg-neutral-800 flex items-center justify-center">
                {generating ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" /> : <ArrowRight className="w-3.5 h-3.5 text-white" />}
              </span>
            </button>

          </div>

          {/* ANTI-AI QUALITY BADGE */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs text-neutral-900 space-y-2.5">
            <h4 className="font-bold flex items-center gap-2 text-neutral-950 font-mono text-xs">
              <ShieldCheck className="w-4 h-4 text-neutral-900" /> Ce face acest profil 100% Non-AI?
            </h4>
            <ul className="space-y-1.5 text-[11px] text-neutral-600 leading-relaxed font-normal">
              {antiAiTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* RIGHT PANEL: LIVE GITHUB PREVIEW & MARKDOWN CODE (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* TOOLBAR */}
          <div className="bg-white p-3 rounded-xl border border-neutral-200 flex flex-wrap items-center justify-between gap-2.5">
            {/* VIEW MODE TABS */}
            <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-200 gap-1 font-mono">
              <button
                type="button"
                onClick={() => setViewTab('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  viewTab === 'preview' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Previzualizare GitHub</span>
              </button>

              <button
                type="button"
                onClick={() => setViewTab('code')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  viewTab === 'code' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Cod Markdown (README.md)</span>
              </button>
            </div>

            {/* PREVIEW THEME TOGGLE */}
            {viewTab === 'preview' && (
              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setPreviewTheme('dark')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                    previewTheme === 'dark' ? 'bg-neutral-900 text-white font-bold' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  GitHub Dark
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTheme('light')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                    previewTheme === 'light' ? 'bg-white text-black font-bold shadow-xs' : 'text-neutral-600 hover:text-black'
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
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 flex items-center gap-1.5 transition cursor-pointer"
                title="Copiaza tot codul Markdown in clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-neutral-900" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiat!' : 'Copiaza Markdown'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadReadme}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-black hover:bg-neutral-800 text-white transition cursor-pointer"
              >
                <span>Descarca README.md</span>
                <Download className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>

          {/* MAIN PREVIEW CONTAINER (MIMICS GITHUB PROFILE REPO) */}
          {viewTab === 'preview' ? (
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <div className={`transition-colors overflow-hidden ${
                previewTheme === 'dark' 
                  ? 'bg-[#0d1117] text-[#c9d1d9]' 
                  : 'bg-white text-[#24292f]'
              }`}>
                
                {/* GITHUB FILE HEADER BAR */}
                <div className={`px-4 py-3 border-b flex items-center justify-between text-xs font-mono font-medium ${
                  previewTheme === 'dark' 
                    ? 'bg-[#161b22] border-[#30363d] text-[#8b949e]' 
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                }`}>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="font-bold text-neutral-900 dark:text-neutral-100">{githubUsername.trim() || 'username'}</span>
                    <span>/</span>
                    <span className="font-bold">README.md</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-neutral-200"></span>
                    <span className="font-mono">Special Repository</span>
                  </div>
                </div>

                {/* RENDERED MARKDOWN CONTENT */}
                <div className="p-6 sm:p-10 leading-relaxed font-sans prose prose-neutral max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({node, ...props}) => <h1 className={`text-2xl sm:text-3xl font-bold pb-2 border-b mb-4 tracking-tight ${previewTheme === 'dark' ? 'text-white border-[#30363d]' : 'text-neutral-950 border-neutral-200'}`} {...props} />,
                      h2: ({node, ...props}) => <h2 className={`text-xl font-bold pb-1 border-b mt-6 mb-3 tracking-tight ${previewTheme === 'dark' ? 'text-white border-[#30363d]' : 'text-neutral-950 border-neutral-200'}`} {...props} />,
                      h3: ({node, ...props}) => <h3 className={`text-lg font-bold pb-1 border-b mt-6 mb-3 tracking-tight ${previewTheme === 'dark' ? 'text-white border-[#30363d]' : 'text-neutral-950 border-neutral-200'}`} {...props} />,
                      h4: ({node, ...props}) => <h4 className={`text-sm font-bold mt-4 mb-1.5 ${previewTheme === 'dark' ? 'text-neutral-200' : 'text-neutral-950'}`} {...props} />,
                      p: ({node, ...props}) => <p className={`text-xs sm:text-sm my-2.5 leading-relaxed ${previewTheme === 'dark' ? 'text-[#c9d1d9]' : 'text-neutral-700'}`} {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2.5 space-y-1.5 text-xs sm:text-sm" {...props} />,
                      li: ({node, ...props}) => <li className={`${previewTheme === 'dark' ? 'text-[#c9d1d9]' : 'text-neutral-700'} leading-relaxed`} {...props} />,
                      blockquote: ({node, ...props}) => (
                        <blockquote className={`border-l-4 pl-3.5 py-1.5 my-3.5 text-xs italic ${
                          previewTheme === 'dark' ? 'border-neutral-500 bg-[#161b22] text-[#8b949e]' : 'border-neutral-800 bg-neutral-50 text-neutral-600'
                        }`} {...props} />
                      ),
                      hr: () => <hr className={`my-5 border-t ${previewTheme === 'dark' ? 'border-[#30363d]' : 'border-neutral-200'}`} />,
                      code: ({node, inline, ...props}) => inline ? (
                        <code className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                          previewTheme === 'dark' ? 'bg-[#161b22] text-neutral-200' : 'bg-neutral-100 text-neutral-900 border border-neutral-200'
                        }`} {...props} />
                      ) : (
                        <code className="block p-3 rounded-xl text-xs font-mono bg-[#161b22] overflow-x-auto text-neutral-100" {...props} />
                      ),
                      img: ({node, ...props}) => (
                        <img className="inline-block mr-1.5 mb-1.5 align-middle rounded max-w-full" alt={props.alt || ''} {...props} />
                      ),
                      strong: ({node, ...props}) => (
                        <strong className={`font-bold ${previewTheme === 'dark' ? 'text-white' : 'text-neutral-950'}`} {...props} />
                      ),
                      a: ({node, ...props}) => (
                        <a className="text-neutral-900 dark:text-neutral-100 underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />
                      )
                    }}
                  >
                    {rawMarkdown}
                  </ReactMarkdown>
                </div>

              </div>
            </div>
          ) : (
            /* RAW MARKDOWN CODE EDITOR */
            <div className="bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden flex flex-col">
              <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400 font-mono">
                <span className="font-bold text-neutral-300">README.md (Editor Direct)</span>
                <span className="font-bold text-neutral-400">{rawMarkdown.length} caractere</span>
              </div>
              <textarea
                value={rawMarkdown}
                onChange={(e) => setRawMarkdown(e.target.value)}
                rows={28}
                className="w-full p-4.5 bg-transparent text-neutral-200 font-mono text-xs leading-relaxed outline-none resize-none focus:ring-0"
              />
            </div>
          )}

        </div>

      </div>

      {/* STEP-BY-STEP MODAL: HOW TO SETUP GITHUB PROFILE README */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-neutral-300 p-6 max-w-xl w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-black text-white">
                  <Github className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-lg text-neutral-950">Cum activezi README-ul pe GitHub?</h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              GitHub ofera o functionalitate speciala: daca creezi un repository public cu <strong className="text-neutral-950 font-bold">acelasi nume exact ca username-ul tau</strong>, continutul fisierului <code className="text-neutral-900 font-mono font-bold bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">README.md</code> va fi afisat automat pe pagina ta de profil!
            </p>

            <div className="space-y-2.5 text-xs text-neutral-800">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="w-5 h-5 rounded-full bg-black text-white font-mono font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                <div className="leading-relaxed">
                  <strong className="text-neutral-950 font-bold">Creeaza un repository nou pe GitHub:</strong> Mergi la <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-neutral-950 underline font-bold">github.com/new</a>.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="w-5 h-5 rounded-full bg-black text-white font-mono font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                <div className="leading-relaxed">
                  <strong className="text-neutral-950 font-bold">Numeste repository-ul:</strong> Pune exact username-ul tau (ex: <code className="text-neutral-900 font-mono font-bold bg-neutral-100 px-1 py-0.5 rounded border border-neutral-200">{githubUsername.trim() || 'sarbumihai'}</code>).
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="w-5 h-5 rounded-full bg-black text-white font-mono font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                <div className="leading-relaxed">
                  <strong className="text-neutral-950 font-bold">Bifeaza Public si Add a README file:</strong> Creeaza repository-ul.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="w-5 h-5 rounded-full bg-black text-white font-mono font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">4</span>
                <div className="leading-relaxed">
                  <strong className="text-neutral-950 font-bold">Lipeste codul generat:</strong> Apasa butonul <strong className="text-neutral-900 font-bold">„Copiaza Markdown”</strong> din acest Studio, deschide <code className="font-mono text-neutral-900 font-bold bg-neutral-100 px-1 py-0.5 rounded border border-neutral-200">README.md</code> in GitHub, lipeste continutul si apasa <strong className="text-neutral-900 font-bold">Commit changes</strong>!
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white font-medium text-xs rounded-xl cursor-pointer transition"
              >
                Am inteles, multumesc!
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
