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
  ChevronUp
} from 'lucide-react';

export default function GithubReadmeStudio({ currentUser }) {
  const DEFAULT_USER_ID = '23fe8bdd-08f4-413d-9985-f99c21040b59';
  const activeUserId = currentUser?.userId || currentUser?.id || DEFAULT_USER_ID;

  // Available archetypes
  const ARCHETYPES = [
    {
      id: 'BACKEND_SYSTEMS',
      title: 'Backend & Systems Engineer',
      desc: 'Focus pe Java 21, Spring Boot, baze de date relaționale, microservicii și latență redusă.',
      badge: 'Recomandat'
    },
    {
      id: 'FULLSTACK_SYSTEMS',
      title: 'Full-Stack & Cloud Engineer',
      desc: 'Ecosistem complet: Spring Boot + React, Docker, containere și livrare end-to-end.',
      badge: 'Popular'
    },
    {
      id: 'MINIMALIST_LEAD',
      title: 'Minimalist Senior / Tech Lead',
      desc: 'Zero decorațiuni inutile, stil curat Unix, cod și arhitectură pe primul loc.',
      badge: 'Clean Code'
    },
    {
      id: 'OPEN_SOURCE',
      title: 'Open Source & Product Builder',
      desc: 'Orientat pe proiecte publice, învățare activă, documentație impecabilă și metrici.',
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
  const [candidateName, setCandidateName] = useState(currentUser?.fullName || 'Mihai Sîrbu');
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
    'Design Senior 100% Non-AI: Fără emoticoane (fără rachete, unelte, fețe zâmbitoare sau degete indicatoare).',
    'Structură inginerească clară: Focus activ, stack tehnic grupat pe categorii, proiecte cu metrici concrete.',
    'Zero clișee corporatiste ("passionate developer", "crafting seamless experiences", "transformative synergy").',
    'Insigne Shields.io flat-square discrete cu logo-uri oficiale de brand.',
    'Metrici tehnice măsurabile (latență P99, cereri concurente, indici de baze de date, acoperire de teste).'
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

  // Emoji stripper helper
  const stripEmojis = (str) => {
    if (!str) return '';
    return str
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '')
      .replace(/[👋🚀⚡🛠📊📫👉🔨🔭📚💬✨]/g, '')
      .replace(/\s{2,}/g, ' ')
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
        sections.push(`#### ${category}\n${badgesRow}`);
      }
    });

    const knownTechNames = Object.values(TECH_CATALOG).flat().map(t => t.name);
    const customTechs = selectedTechs.filter(t => !knownTechNames.includes(t));
    if (customTechs.length > 0) {
      const customRow = customTechs
        .map(name => `![${name}](https://img.shields.io/badge/${encodeURIComponent(name)}-1e293b?style=flat-square)`)
        .join(' ');
      sections.push(`#### Instrumente & Biblioteci\n${customRow}`);
    }

    return sections.join('\n\n');
  }, [selectedTechs]);

  // Generate full markdown dynamically with senior typography and 0 emojis
  const generatedMarkdown = useMemo(() => {
    const cleanUser = githubUsername.trim() || 'username';

    const lines = [];
    lines.push(`# ${candidateName}\n`);
    lines.push(`**${headline}**\n`);
    if (bioText) lines.push(`${bioText}\n`);

    if (techPhilosophy) {
      lines.push(`> **Engineering Mindset**: ${techPhilosophy}\n`);
    }

    lines.push('---\n');
    lines.push('## Current Focus\n');
    if (building) lines.push(`- **Active Development**: ${building}`);
    if (learning) lines.push(`- **Technical Deep-Dives**: ${learning}`);
    if (collaborating) lines.push(`- **Architecture & Discussions**: ${collaborating}`);
    lines.push('\n---\n');

    lines.push('## Tech Stack & Tooling\n');
    lines.push(`${badgesString}\n`);

    if (projects.length > 0) {
      lines.push('---\n');
      lines.push('## Featured Engineering Projects\n');
      projects.forEach(p => {
        lines.push(`### ${p.title}`);
        if (p.techStack) lines.push(`\`${p.techStack}\`\n`);
        p.bullets.forEach(b => lines.push(`- ${b}`));
        if (p.linkUrl) lines.push(`\n[View Repository](${p.linkUrl})\n`);
        lines.push('');
      });
    }

    if (includeStats || includeLanguages || includeStreak) {
      lines.push('---\n');
      lines.push('## GitHub Metrics\n');
      lines.push('<p align="center">');
      if (includeStats) {
        lines.push(`  <img src="https://github-readme-stats.vercel.app/api?username=${cleanUser}&show_icons=true&theme=${statsTheme}&hide_border=true&count_private=true" alt="GitHub Stats" height="155" />`);
      }
      if (includeLanguages) {
        lines.push(`  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=${cleanUser}&layout=compact&theme=${statsTheme}&hide_border=true" alt="Top Languages" height="155" />`);
      }
      lines.push('</p>\n');

      if (includeStreak) {
        lines.push('<p align="center">');
        lines.push(`  <img src="https://github-readme-streak-stats.herokuapp.com/?user=${cleanUser}&theme=${statsTheme}&hide_border=true" alt="GitHub Streak" />`);
        lines.push('</p>\n');
      }
    }

    lines.push('---\n');
    lines.push('## Connect\n');
    const contactBadges = [];
    if (linkedinUrl) contactBadges.push(`[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](${linkedinUrl})`);
    if (email) contactBadges.push(`[![Email](https://img.shields.io/badge/Email-${encodeURIComponent(email)}-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:${email})`);
    if (portfolioUrl) contactBadges.push(`[![Portfolio](https://img.shields.io/badge/Portfolio-000000?style=flat-square&logo=aboutdotme&logoColor=white)](${portfolioUrl})`);
    lines.push(contactBadges.join(' '));

    return stripEmojis(lines.join('\n'));
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
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gray-950 text-white border border-gray-800">
              <Github className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              GitHub Profile README <span className="text-indigo-600">Studio</span>
            </h2>
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Senior Clean · Zero Emoticoane · 100% Non-AI
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-3xl">
            Creează un README.md autentic, sobru și non-AI pentru profilul tău de GitHub. Fără emoticoane juvenile sau clișee corporatiste, axat pe arhitectură reală, metrici măsurabile și stack tehnic structurat pe domenii.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGuideModal(true)}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800 flex items-center gap-1.5 transition cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>Ghid Configurare GitHub</span>
          </button>
        </div>
      </div>

      {/* WORKSPACE GRID: 5 COLS CONFIG, 7 COLS PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANEL: CONFIGURATION (5 COLS) */}
        <div className="lg:col-span-5 space-y-5">
          
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4">
            
            {/* 1. CV PROFILE SELECTION & SYNC */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  1. Sursă Date Profil (CV)
                </label>
                {cvList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const chosen = cvList.find(c => c.id === selectedCvId);
                      if (chosen) syncFromCvProfile(chosen);
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Resincronizează
                  </button>
                )}
              </div>

              {loadingCvList ? (
                <div className="text-xs text-gray-400 py-2 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Se încarcă CV-urile...
                </div>
              ) : cvList.length > 0 ? (
                <select
                  value={selectedCvId}
                  onChange={(e) => {
                    setSelectedCvId(e.target.value);
                    const chosen = cvList.find(c => c.id === e.target.value);
                    if (chosen) syncFromCvProfile(chosen);
                  }}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-none cursor-pointer"
                >
                  {cvList.map((cv) => (
                    <option key={cv.id} value={cv.id}>
                      {cv.title || 'CV'} {cv.isPrimary ? '★' : ''} — {cv.fullName}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border">
                  Nu ai un CV salvat în aplicație. Se folosesc datele implicite.
                </p>
              )}
            </div>

            <hr className="border-gray-100" />

            {/* 2. ARCHETYPE PRESETS */}
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                2. Arhetip Ingineresc
              </label>
              
              <div className="grid grid-cols-2 gap-2">
                {ARCHETYPES.map((arch) => (
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
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      archetype === arch.id 
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-2xs ring-1 ring-indigo-500' 
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-black">{arch.title}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-tight line-clamp-2">{arch.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* 3. PROFILE IDENTIFIERS & HEADLINE */}
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                <Terminal className="w-3.5 h-3.5 text-gray-800" />
                3. Identificatori & Titlu
              </label>

              <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 mb-1 block">Nume Complet</label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 mb-1 block flex items-center gap-1">
                    <Github className="w-3 h-3 text-gray-500" /> GitHub Username
                  </label>
                  <input
                    type="text"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="sarbumihai"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none font-mono font-bold text-indigo-700"
                  />
                </div>
              </div>

              <div className="mb-2.5">
                <label className="text-[11px] font-semibold text-gray-600 mb-1 block">Headline Principal</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none font-medium text-gray-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-600 mb-1 block">Bio / Descriere Concisă (Non-AI)</label>
                <textarea
                  rows={3}
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none resize-none leading-relaxed text-gray-800 font-sans"
                />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* 4. TECH STACK SELECTION (BADGES) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                  4. Stack Tehnic & Insigne ({selectedTechs.length})
                </label>
              </div>

              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {Object.entries(TECH_CATALOG).map(([category, techs]) => (
                  <div key={category} className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">{category}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {techs.map((t) => {
                        const isSelected = selectedTechs.includes(t.name);
                        return (
                          <button
                            key={t.name}
                            type="button"
                            onClick={() => toggleTech(t.name)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer flex items-center gap-1 ${
                              isSelected 
                                ? 'bg-gray-950 text-white border-black shadow-2xs' 
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                            <span>{t.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* 5. GITHUB STATS & THEME */}
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                5. Widget-uri GitHub Stats
              </label>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <label className="flex items-center gap-1.5 text-xs text-gray-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeStats}
                    onChange={(e) => setIncludeStats(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span>Stats Card</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-gray-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeLanguages}
                    onChange={(e) => setIncludeLanguages(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span>Top Langs</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-gray-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeStreak}
                    onChange={(e) => setIncludeStreak(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span>Streak Card</span>
                </label>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-600 mb-1 block">Temă Carduri GitHub</label>
                <select
                  value={statsTheme}
                  onChange={(e) => setStatsTheme(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 outline-none cursor-pointer"
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
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
                generating 
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                  : 'bg-black hover:bg-neutral-800 text-white hover:shadow-lg'
              }`}
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>Se analizează și lustruiește README-ul non-AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Lustruiește cu Filtru Non-AI</span>
                </>
              )}
            </button>

          </div>

          {/* ANTI-AI QUALITY BADGE */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 space-y-2">
            <h4 className="font-extrabold flex items-center gap-1.5 text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Ce face acest profil 100% Non-AI?
            </h4>
            <ul className="space-y-1 text-[11px] text-emerald-800 leading-relaxed">
              {antiAiTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* RIGHT PANEL: LIVE GITHUB PREVIEW & MARKDOWN CODE (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* TOOLBAR */}
          <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
            {/* VIEW MODE TABS */}
            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setViewTab('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  viewTab === 'preview' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600 hover:text-black'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                <span>Previzualizare GitHub</span>
              </button>

              <button
                type="button"
                onClick={() => setViewTab('code')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  viewTab === 'code' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600 hover:text-black'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-gray-700" />
                <span>Cod Markdown (`README.md`)</span>
              </button>
            </div>

            {/* PREVIEW THEME TOGGLE */}
            {viewTab === 'preview' && (
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewTheme('dark')}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] transition ${
                    previewTheme === 'dark' ? 'bg-gray-900 text-white' : 'text-gray-600'
                  }`}
                >
                  GitHub Dark
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTheme('light')}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] transition ${
                    previewTheme === 'light' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600'
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
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 flex items-center gap-1.5 transition cursor-pointer"
                title="Copiază tot codul Markdown în clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiat!' : 'Copiază Markdown'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadReadme}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition cursor-pointer shadow-sm hover:shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descarcă README.md</span>
              </button>
            </div>
          </div>

          {/* MAIN PREVIEW CONTAINER (MIMICS GITHUB PROFILE REPO) */}
          {viewTab === 'preview' ? (
            <div className={`rounded-2xl border shadow-sm transition-colors overflow-hidden ${
              previewTheme === 'dark' 
                ? 'bg-[#0d1117] text-[#c9d1d9] border-[#30363d]' 
                : 'bg-white text-[#24292f] border-gray-200'
            }`}>
              
              {/* GITHUB FILE HEADER BAR */}
              <div className={`px-4 py-2.5 border-b flex items-center justify-between text-xs font-mono font-medium ${
                previewTheme === 'dark' 
                  ? 'bg-[#161b22] border-[#30363d] text-[#8b949e]' 
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="font-semibold text-indigo-400">{githubUsername.trim() || 'username'}</span>
                  <span>/</span>
                  <span className="font-bold text-gray-200">README.md</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Special Repository</span>
                </div>
              </div>

              {/* RENDERED MARKDOWN CONTENT */}
              <div className="p-6 sm:p-10 leading-relaxed font-sans prose prose-slate max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className={`text-2xl sm:text-3xl font-bold pb-2 border-b mb-4 ${previewTheme === 'dark' ? 'text-white border-[#30363d]' : 'text-gray-900 border-gray-200'}`} {...props} />,
                    h2: ({node, ...props}) => <h2 className={`text-xl font-bold pb-1 border-b mt-6 mb-3 ${previewTheme === 'dark' ? 'text-white border-[#30363d]' : 'text-gray-900 border-gray-200'}`} {...props} />,
                    h3: ({node, ...props}) => <h3 className={`text-base font-bold mt-4 mb-2 ${previewTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`} {...props} />,
                    h4: ({node, ...props}) => <h4 className={`text-xs font-bold uppercase tracking-wider mt-4 mb-2 ${previewTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} {...props} />,
                    p: ({node, ...props}) => <p className={`text-xs sm:text-sm my-2 leading-relaxed ${previewTheme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-700'}`} {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2 space-y-1 text-xs sm:text-sm" {...props} />,
                    li: ({node, ...props}) => <li className={`${previewTheme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-700'}`} {...props} />,
                    blockquote: ({node, ...props}) => (
                      <blockquote className={`border-l-4 pl-3 py-1 my-3 text-xs italic ${
                        previewTheme === 'dark' ? 'border-indigo-500 bg-[#161b22] text-[#8b949e]' : 'border-indigo-600 bg-gray-50 text-gray-600'
                      }`} {...props} />
                    ),
                    hr: () => <hr className={`my-6 ${previewTheme === 'dark' ? 'border-[#30363d]' : 'border-gray-200'}`} />,
                    code: ({node, inline, ...props}) => inline ? (
                      <code className={`px-1.5 py-0.5 rounded text-xs font-mono font-semibold ${
                        previewTheme === 'dark' ? 'bg-[#161b22] text-indigo-300' : 'bg-gray-100 text-indigo-700'
                      }`} {...props} />
                    ) : (
                      <code className="block p-3 rounded-lg text-xs font-mono bg-[#161b22] overflow-x-auto" {...props} />
                    ),
                    img: ({node, ...props}) => (
                      <img className="inline-block max-w-full my-1 rounded" alt={props.alt || ''} {...props} />
                    ),
                    a: ({node, ...props}) => (
                      <a className="text-blue-400 hover:underline font-semibold" target="_blank" rel="noopener noreferrer" {...props} />
                    )
                  }}
                >
                  {rawMarkdown}
                </ReactMarkdown>
              </div>

            </div>
          ) : (
            /* RAW MARKDOWN CODE EDITOR */
            <div className="bg-gray-950 rounded-2xl border border-gray-800 shadow-sm overflow-hidden flex flex-col">
              <div className="px-4 py-2.5 bg-gray-900 border-b border-gray-800 flex items-center justify-between text-xs text-gray-400 font-mono">
                <span>README.md (Editor Direct)</span>
                <span>{rawMarkdown.length} caractere</span>
              </div>
              <textarea
                value={rawMarkdown}
                onChange={(e) => setRawMarkdown(e.target.value)}
                rows={28}
                className="w-full p-4 bg-transparent text-gray-200 font-mono text-xs leading-relaxed outline-none resize-none focus:ring-0 selection:bg-indigo-900"
              />
            </div>
          )}

        </div>

      </div>

      {/* STEP-BY-STEP MODAL: HOW TO SETUP GITHUB PROFILE README */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-gray-900 text-white">
                  <Github className="w-5 h-5" />
                </span>
                <h3 className="font-black text-lg text-gray-900">Cum activezi README-ul pe GitHub?</h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              GitHub oferă o funcționalitate specială: dacă creezi un repository public cu <strong>același nume exact ca username-ul tău</strong>, conținutul fișierului <code>README.md</code> va fi afișat automat pe pagina ta de profil!
            </p>

            <div className="space-y-2.5 text-xs text-gray-800">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="w-5 h-5 rounded-full bg-black text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                <div>
                  <strong>Creează un repository nou pe GitHub:</strong> Mergi la <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-blue-600 underline font-bold">github.com/new</a>.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="w-5 h-5 rounded-full bg-black text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                <div>
                  <strong>Numește repository-ul:</strong> Pune exact username-ul tău (ex: <code>{githubUsername.trim() || 'sarbumihai'}</code>). GitHub va afișa un mesaj cu o cutie verde: <em>"You found a secret!"</em>.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="w-5 h-5 rounded-full bg-black text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                <div>
                  <strong>Bifează "Public" și "Add a README file":</strong> Creează repository-ul.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="w-5 h-5 rounded-full bg-black text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">4</span>
                <div>
                  <strong>Lipește codul generat:</strong> Apasă butonul <strong>„Copiază Markdown”</strong> din acest Studio, deschide <code>README.md</code> în GitHub, lipește conținutul și apasă <strong>Commit changes</strong>!
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Am înțeles, mulțumesc!
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
