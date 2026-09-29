import React, { useState, useEffect, useMemo } from 'react';
import { 
  GraduationCap, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Code2, 
  Copy, 
  Check, 
  Sparkles, 
  ChevronRight, 
  ExternalLink, 
  FileText, 
  Layers, 
  Terminal, 
  Flame, 
  PlusCircle, 
  BookOpen, 
  CheckSquare,
  HelpCircle,
  TrendingUp,
  Cpu,
  Server,
  Box,
  Cloud,
  Layout,
  Bug,
  ShieldCheck,
  Database,
  Smartphone,
  Search,
  Award,
  ArrowRight,
  Target,
  Briefcase,
  AlertTriangle,
  Lightbulb,
  Compass,
  CheckCheck
} from 'lucide-react';
import { JOB_TRACKS } from '../data/jobTracksRoadmapData';

export default function SkillRoadmapPage({ currentUser, onNavigateToCvLibrary }) {
  // VIEW MODE: 'TRACKS' (Full Career & Interview Playbook) vs 'LABS_7DAY' (Specific micro-skills)
  const [viewMode, setViewMode] = useState('TRACKS'); // 'TRACKS' | 'LABS_7DAY'

  // TRACKS VIEW STATE
  const [selectedTrackId, setSelectedTrackId] = useState('BACKEND');
  const [activePillarTab, setActivePillarTab] = useState('REACH_INTERVIEW'); // 'REACH_INTERVIEW', 'PASS_INTERVIEW', 'FREE_RESOURCES', 'STAGES'
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState({});

  // 7-DAY LABS STATE (PRESERVED FUNCTIONALITY)
  const [catalog, setCatalog] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState('kafka');
  const [roadmap, setRoadmap] = useState(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const [completedDays, setCompletedDays] = useState({});
  const [isAddingToCv, setIsAddingToCv] = useState(false);
  const [customSkillName, setCustomSkillName] = useState('');
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);

  // Fetch catalog on mount for 7-day labs
  useEffect(() => {
    fetch('/api/v1/roadmap/catalog')
      .then(res => res.json())
      .then(data => setCatalog(Array.isArray(data) ? data : []))
      .catch(err => console.error('Eroare catalog roadmaps:', err));
  }, []);

  // Fetch roadmap when selected skill changes in 7-day labs
  useEffect(() => {
    if (!selectedSkillId) return;
    setLoadingRoadmap(true);
    fetch(`/api/v1/roadmap/${selectedSkillId}`)
      .then(res => res.json())
      .then(data => {
        setRoadmap(data);
        setSelectedDayNumber(1);
      })
      .catch(err => console.error('Eroare la preluarea roadmap-ului:', err))
      .finally(() => setLoadingRoadmap(false));

    try {
      const saved = JSON.parse(localStorage.getItem(`ats_roadmap_completed_${selectedSkillId}`) || '{}');
      setCompletedDays(saved);
    } catch (e) {}
  }, [selectedSkillId]);

  const toggleDayCompletion = (dayNum) => {
    const updated = { ...completedDays, [dayNum]: !completedDays[dayNum] };
    setCompletedDays(updated);
    try {
      localStorage.setItem(`ats_roadmap_completed_${selectedSkillId}`, JSON.stringify(updated));
    } catch (e) {}
  };

  const handleCopy = (text, key, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setToastMessage(`Copiat in clipboard: ${label}!`);
    setTimeout(() => {
      setCopiedKey(null);
      setToastMessage('');
    }, 2500);
  };

  const toggleQuestionExpand = (idx) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleAddToCv = async () => {
    if (!roadmap) return;
    setIsAddingToCv(true);
    try {
      const res = await fetch('/api/v1/roadmap/add-to-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillName: roadmap.skillName,
          cvBulletPoint: roadmap.cvBulletPoint,
          projectTitle: roadmap.capstoneProjectTitle,
          projectDescription: roadmap.capstoneProjectArchitecture,
          technologiesUsed: `${roadmap.skillName}, Java 21, Spring Boot, Docker`
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToastMessage(`✓ Skill-ul ${roadmap.skillName} si proiectul Capstone au fost adaugate in CV!`);
      } else {
        setToastMessage(`⚠️ ${data.message || 'Eroare la adaugarea in CV'}`);
      }
    } catch (err) {
      setToastMessage('Eroare de conexiune la server.');
    } finally {
      setIsAddingToCv(false);
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  const handleGenerateCustom = async (e) => {
    e.preventDefault();
    if (!customSkillName.trim()) return;
    setIsGeneratingCustom(true);
    try {
      const res = await fetch('/api/v1/roadmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillName: customSkillName.trim(),
          targetRole: 'Junior / Mid Java Developer',
          currentLevel: 'INTERMEDIATE',
          focusArea: 'BACKEND_JAVA'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setRoadmap(data);
        setSelectedSkillId(data.id || customSkillName.toLowerCase());
        setSelectedDayNumber(1);
        setCustomSkillName('');
      }
    } catch (err) {
      console.error('Eroare la generarea roadmap-ului custom:', err);
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  // FILTERED TRACKS BY SEARCH
  const filteredTracks = useMemo(() => {
    if (!searchQuery.trim()) return JOB_TRACKS;
    const q = searchQuery.toLowerCase().trim();
    return JOB_TRACKS.filter(t => 
      t.title.toLowerCase().includes(q) ||
      t.shortTitle.toLowerCase().includes(q) ||
      t.tagLine.toLowerCase().includes(q) ||
      t.reachInterview.mustHaveSkills.some(s => s.name.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const selectedTrack = useMemo(() => {
    return JOB_TRACKS.find(t => t.id === selectedTrackId) || JOB_TRACKS[0];
  }, [selectedTrackId]);

  const getTrackIcon = (iconKey, sizeClass = "w-4 h-4") => {
    switch (iconKey) {
      case 'Server': return <Server className={`${sizeClass} text-emerald-600`} />;
      case 'Layout': return <Layout className={`${sizeClass} text-blue-600`} />;
      case 'Layers': return <Layers className={`${sizeClass} text-indigo-600`} />;
      case 'Bug': return <Bug className={`${sizeClass} text-rose-600`} />;
      case 'Cloud': return <Cloud className={`${sizeClass} text-sky-600`} />;
      case 'Sparkles': return <Sparkles className={`${sizeClass} text-amber-600`} />;
      case 'ShieldCheck': return <ShieldCheck className={`${sizeClass} text-red-600`} />;
      case 'Database': return <Database className={`${sizeClass} text-teal-600`} />;
      case 'Cpu': return <Cpu className={`${sizeClass} text-purple-600`} />;
      case 'Smartphone': return <Smartphone className={`${sizeClass} text-pink-600`} />;
      default: return <Code2 className={`${sizeClass} text-gray-600`} />;
    }
  };

  const getSkillIcon = (key) => {
    switch (key) {
      case 'kafka': return <Server className="w-5 h-5 text-amber-500" />;
      case 'redis': return <Flame className="w-5 h-5 text-rose-500" />;
      case 'docker': return <Box className="w-5 h-5 text-blue-500" />;
      case 'kubernetes': return <Cloud className="w-5 h-5 text-indigo-500" />;
      case 'microservices': return <Cpu className="w-5 h-5 text-emerald-500" />;
      default: return <GraduationCap className="w-5 h-5 text-purple-500" />;
    }
  };

  const activeDay = roadmap?.days?.find(d => d.dayNumber === selectedDayNumber) || roadmap?.days?.[0];
  const completedCount = Object.values(completedDays).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / (roadmap?.totalDays || 7)) * 100);

  return (
    <div className="space-y-6 font-sans text-gray-900 pb-16">
      
      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-black text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-2xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 bg-purple-100/90 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                Ghid de Cariera & Roadmap Interviuri 2026
              </span>
              <span className="text-xs text-gray-400 font-semibold">•</span>
              <span className="text-xs font-bold text-gray-600">Aliniat cu Piata IT din Romania</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-950 tracking-tight leading-tight">
              Cum Treci Filtrele CV/ATS, Iei Interviul Tehnic & Unde Inveti <span className="text-purple-600 underline decoration-purple-200 decoration-wavy">100% GRATIS</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
              Fiecare tip de job din piata analizat in profunzime: ce competente iti garanteaza chemarea la interviu, ce proiecte reale sa ai pe GitHub, cum sa raspunzi la intrebarile capcana si link-urile directe catre cele mai bune resurse si cursuri gratuite din lume.
            </p>
          </div>

          {/* VIEW MODE TOGGLE SWITCHER */}
          <div className="flex items-center p-1 bg-gray-100 rounded-2xl border border-gray-200 shrink-0 self-start lg:self-center">
            <button
              onClick={() => setViewMode('TRACKS')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'TRACKS'
                  ? 'bg-white text-black shadow-xs font-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <Compass className="w-4 h-4 text-purple-600" />
              <span>Ghid pe Roluri & Interviuri</span>
            </button>
            <button
              onClick={() => setViewMode('LABS_7DAY')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'LABS_7DAY'
                  ? 'bg-white text-black shadow-xs font-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <Terminal className="w-4 h-4 text-amber-600" />
              <span>Micro-Curricula 7 Zile</span>
            </button>
          </div>
        </div>

        {/* MODE A: TRACKS CAROUSEL / SELECTOR */}
        {viewMode === 'TRACKS' && (
          <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-black uppercase text-gray-400 tracking-wider">
                Alege Directia Profesionala ({JOB_TRACKS.length} Specializari):
              </span>

              {/* SEARCH FILTER */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Cauta rol sau tehnologie..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-600 focus:bg-white transition"
                />
              </div>
            </div>

            {/* TRACK PILLS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {filteredTracks.map((track) => {
                const isSelected = selectedTrackId === track.id;
                return (
                  <button
                    key={track.id}
                    onClick={() => setSelectedTrackId(track.id)}
                    className={`px-3.5 py-2.5 rounded-2xl border text-left shrink-0 transition flex items-center gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-black text-white border-black shadow-sm ring-2 ring-purple-600/30'
                        : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-200'
                    }`}
                  >
                    <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-white/10 text-white' : 'bg-gray-100'}`}>
                      {getTrackIcon(track.iconKey, "w-4 h-4")}
                    </div>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5 truncate">
                        <span>{track.shortTitle}</span>
                        {track.badge && (
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                            isSelected ? 'bg-purple-500/30 text-purple-200' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {track.badge}
                          </span>
                        )}
                      </div>
                      <div className={`text-[10px] truncate ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                        {track.salaryJunior}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODE A: FULL CAREER & INTERVIEW PLAYBOOK FOR SELECTED TRACK */}
      {/* ========================================================================= */}
      {viewMode === 'TRACKS' && selectedTrack && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* TRACK HERO BANNER WITH MARKET SALARY */}
          <div className="bg-gradient-to-r from-gray-950 via-neutral-900 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-sm border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-white/10 text-white shrink-0">
                  {getTrackIcon(selectedTrack.iconKey, "w-5 h-5")}
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {selectedTrack.title}
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {selectedTrack.badge}
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                {selectedTrack.tagLine}
              </p>
              <div className="text-[11px] text-gray-400 flex items-center gap-1.5 pt-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>{selectedTrack.marketDemand}</span>
              </div>
            </div>

            {/* SALARY STATS BOX */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shrink-0 flex items-center gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Salariu Junior (RO)</span>
                <span className="text-xs sm:text-sm font-black text-emerald-400">{selectedTrack.salaryJunior}</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Salariu Mid (RO)</span>
                <span className="text-xs sm:text-sm font-black text-blue-400">{selectedTrack.salaryMid}</span>
              </div>
            </div>
          </div>

          {/* PILLAR NAVIGATION TABS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <button
              onClick={() => setActivePillarTab('REACH_INTERVIEW')}
              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                activePillarTab === 'REACH_INTERVIEW'
                  ? 'bg-black text-white border-black shadow-xs ring-1 ring-black'
                  : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-200'
              }`}
            >
              <Target className={`w-4 h-4 shrink-0 ${activePillarTab === 'REACH_INTERVIEW' ? 'text-amber-400' : 'text-amber-600'}`} />
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider block opacity-70">Pilonul 1</span>
                <h3 className="text-xs font-extrabold truncate">1. Trecere CV & Filtre ATS</h3>
              </div>
            </button>

            <button
              onClick={() => setActivePillarTab('PASS_INTERVIEW')}
              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                activePillarTab === 'PASS_INTERVIEW'
                  ? 'bg-black text-white border-black shadow-xs ring-1 ring-black'
                  : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-200'
              }`}
            >
              <Briefcase className={`w-4 h-4 shrink-0 ${activePillarTab === 'PASS_INTERVIEW' ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider block opacity-70">Pilonul 2</span>
                <h3 className="text-xs font-extrabold truncate">2. Cum Iei Interviul Tehnic</h3>
              </div>
            </button>

            <button
              onClick={() => setActivePillarTab('FREE_RESOURCES')}
              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                activePillarTab === 'FREE_RESOURCES'
                  ? 'bg-black text-white border-black shadow-xs ring-1 ring-black'
                  : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-200'
              }`}
            >
              <BookOpen className={`w-4 h-4 shrink-0 ${activePillarTab === 'FREE_RESOURCES' ? 'text-blue-400' : 'text-blue-600'}`} />
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider block opacity-70">Pilonul 3</span>
                <h3 className="text-xs font-extrabold truncate">3. De Unde Inveti GRATIS</h3>
              </div>
            </button>

            <button
              onClick={() => setActivePillarTab('STAGES')}
              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                activePillarTab === 'STAGES'
                  ? 'bg-black text-white border-black shadow-xs ring-1 ring-black'
                  : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-200'
              }`}
            >
              <Calendar className={`w-4 h-4 shrink-0 ${activePillarTab === 'STAGES' ? 'text-purple-400' : 'text-purple-600'}`} />
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider block opacity-70">Pilonul 4</span>
                <h3 className="text-xs font-extrabold truncate">4. Curriculum Pas cu Pas</h3>
              </div>
            </button>
          </div>

          {/* ================================================================= */}
          {/* TAB 1: CUM AJUNGI LA INTERVIU (CV, ATS & PORTOFOLIU) */}
          {/* ================================================================= */}
          {activePillarTab === 'REACH_INTERVIEW' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: MUST-HAVE SKILLS (5 COLS) */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* MUST HAVE SKILLS */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/90 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-gray-950 uppercase tracking-wide flex items-center gap-2">
                        <CheckCheck className="w-4 h-4 text-emerald-600" />
                        Competente Obligatorii (Filtre ATS)
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Daca aceste cuvinte cheie lipsesc din CV, esti respins automat de filtre.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {selectedTrack.reachInterview.mustHaveSkills.map((sk, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-extrabold text-xs text-gray-900">{sk.name}</span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            sk.level === 'CRITIC' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                            sk.level === 'ESENTIAL' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}>
                            {sk.level}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 leading-relaxed font-sans">{sk.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CV SCREEN TIPS */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-5 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    Ce Cauta Recruiterii la Scanarea de 6 Secunde
                  </h3>
                  <ul className="space-y-2 text-xs text-amber-900 leading-relaxed font-sans">
                    {selectedTrack.reachInterview.cvScreenTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold shrink-0">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* COMMON MISTAKES */}
                <div className="bg-rose-50/60 border border-rose-200/80 rounded-3xl p-5 space-y-2.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-rose-950 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Greseli Frecvente pe CV care Duc la Respingere
                  </h3>
                  <ul className="space-y-1.5 text-xs text-rose-900 leading-relaxed font-sans">
                    {selectedTrack.reachInterview.commonMistakes.map((mis, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold shrink-0">✕</span>
                        <span>{mis}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* RIGHT COLUMN: RECOMMENDED GITHUB PROJECT & GOOGLE XYZ BULLET (7 COLS) */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* RECOMMENDED GITHUB PORTFOLIO PROJECT */}
                <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                        Diferentiator Masiv pe GitHub
                      </span>
                      <h3 className="text-base font-black text-gray-950 mt-1">
                        {selectedTrack.reachInterview.recommendedProject.title}
                      </h3>
                    </div>
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed font-sans">
                    {selectedTrack.reachInterview.recommendedProject.description}
                  </p>

                  {/* KEY FEATURES CHECKLIST */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 block">
                      Ce trebuie sa contina neaparat repozitoriul:
                    </span>
                    <div className="space-y-1.5">
                      {selectedTrack.reachInterview.recommendedProject.keyFeatures.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-gray-800 leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* GITHUB README ADVICE */}
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-700 space-y-1">
                    <span className="font-bold text-gray-950 block">Sfat pentru README-ul GitHub:</span>
                    <p className="text-[11px] leading-relaxed text-gray-600">
                      {selectedTrack.reachInterview.recommendedProject.githubAdvice}
                    </p>
                  </div>
                </div>

                {/* GOOGLE XYZ STAR BULLET */}
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 border border-slate-800 shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-amber-300">
                        Formula Google XYZ pentru CV (Gata de Copiat)
                      </h3>
                    </div>
                    <button
                      onClick={() => handleCopy(selectedTrack.reachInterview.googleXyzBullet, 'xyz_bullet', 'Formula Google XYZ')}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedKey === 'xyz_bullet' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'xyz_bullet' ? 'Copiat!' : 'Copiaza'}</span>
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-200 leading-relaxed bg-black/30 p-3.5 rounded-2xl border border-white/10 font-sans select-text">
                    "{selectedTrack.reachInterview.googleXyzBullet}"
                  </p>

                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Foloseste structura: <em>„Realizat [X] masurat prin [Y] facand [Z]”</em> in sectiunea de Experienta sau Proiecte din CV-ul tau.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: CUM IEI INTERVIUL TEHNIC (LIVE CODING & INTREBARI) */}
          {/* ================================================================= */}
          {activePillarTab === 'PASS_INTERVIEW' && (
            <div className="space-y-6">
              
              {/* LIVE CODING & LEETCODE STRATEGY */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-gray-950 uppercase tracking-wide flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-indigo-600" />
                      Ce Se Da la Live Coding / Algoritmi
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Nivelul cerut la companiile din Romania: <strong>{selectedTrack.passInterview.codingFocus.leetcodeLevel}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedTrack.passInterview.codingFocus.patterns.slice(0, 3).map((pat, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-indigo-50 text-indigo-800 text-[10px] font-bold rounded-lg border border-indigo-200">
                        {pat.split('(')[0]}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                    <span className="text-xs font-black uppercase text-gray-500 tracking-wider block">
                      Pattern-uri Frecvente de Probleme:
                    </span>
                    <ul className="space-y-1.5 text-xs text-gray-800 font-sans">
                      {selectedTrack.passInterview.codingFocus.patterns.map((pat, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{pat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                    <span className="text-xs font-black uppercase text-amber-900 tracking-wider block flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                      Regula de Aur la Live Coding:
                    </span>
                    <p className="text-xs text-amber-900 leading-relaxed font-sans">
                      {selectedTrack.passInterview.codingFocus.tips}
                    </p>
                  </div>
                </div>
              </div>

              {/* TOP TECHNICAL QUESTIONS (ACCORDION / CARDS) */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-black text-gray-950 uppercase tracking-wide flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                    Top Intrebari Tehnice & Concepte Teoretice Frecvente
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Intrebarile adresate la peste 80% din interviurile tehnice din Romania pentru acest rol.
                  </p>
                </div>

                <div className="space-y-3">
                  {selectedTrack.passInterview.topQuestions.map((item, idx) => {
                    const isExpanded = !!expandedQuestions[idx];
                    return (
                      <div 
                        key={idx} 
                        className="rounded-2xl border border-gray-200 overflow-hidden transition"
                      >
                        <button
                          onClick={() => toggleQuestionExpand(idx)}
                          className="w-full text-left p-4 bg-gray-50/70 hover:bg-gray-100/70 flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.2 rounded-md inline-block">
                              {item.category}
                            </span>
                            <h4 className="text-xs sm:text-sm font-extrabold text-gray-950">
                              {item.q}
                            </h4>
                          </div>
                          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${isExpanded ? 'rotate-90 text-black' : ''}`} />
                        </button>

                        {isExpanded && (
                          <div className="p-4 bg-white border-t border-gray-100 text-xs sm:text-sm text-gray-700 leading-relaxed font-sans select-text">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TRICKY QUESTIONS / INTREBARI CAPCANA */}
              <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50/50 rounded-3xl p-6 border border-amber-200/90 shadow-2xs space-y-4">
                <div className="border-b border-amber-200/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-200 text-amber-900">
                      Nivel Avansat
                    </span>
                    <h3 className="text-sm font-black text-amber-950 uppercase tracking-wide">
                      Intrebari Capcana (Ce Intreaba Seniorii pentru Departajare)
                    </h3>
                  </div>
                  <p className="text-xs text-amber-800 mt-1">
                    Aceste intrebari testeaza daca intelegi mecanismele profunde sau doar ai invatat definitii pe de rost.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTrack.passInterview.trickyQuestions.map((tq, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-4 border border-amber-200 shadow-2xs space-y-2.5">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-amber-600 block uppercase">Intrebare Capcana #{idx + 1}</span>
                        <h4 className="text-xs font-black text-gray-950">{tq.q}</h4>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed font-sans bg-gray-50 p-3 rounded-xl border border-gray-100">
                        {tq.a}
                      </p>
                      <div className="text-[11px] text-amber-800 italic pt-1">
                        <strong>De ce o pun intervievatorii:</strong> {tq.why}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SYSTEM DESIGN MINI TOPIC */}
              {selectedTrack.passInterview.systemDesignMini && (
                <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-black text-gray-950 uppercase tracking-wide">
                      Scenariu de System Design (Nivel Junior/Mid): {selectedTrack.passInterview.systemDesignMini.topic}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500">
                    Cand ti se cere sa desenezi o arhitectura pe tabla sau in Excalidraw, atinge aceste puncte cheie:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {selectedTrack.passInterview.systemDesignMini.keyPoints.map((pt, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 font-sans flex items-start gap-2">
                        <span className="font-extrabold text-indigo-600 shrink-0">{idx + 1}.</span>
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: DE UNDE SI CUM INVETI GRATIS (PLATFORME & LINK-URI) */}
          {/* ================================================================= */}
          {activePillarTab === 'FREE_RESOURCES' && (
            <div className="space-y-6">
              
              {/* HOW TO LEARN EFFECTIVELY WITHOUT TUTORIAL HELL */}
              <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-md border border-purple-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <h3 className="text-base font-black tracking-tight text-white">
                    Metodologia: Cum Inveti Eficient Fara "Tutorial Hell"
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-200 leading-relaxed font-sans">
                  <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 space-y-1">
                    <span className="font-black text-amber-300 block">1. Regula 30/70</span>
                    <p>Dedica maxim 30% din timp citind sau privind video-uri. Restul de 70% din timp scrie cod, ruleaza teste si construieste aplicatii de la zero pe calculatorul tau.</p>
                  </div>
                  <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 space-y-1">
                    <span className="font-black text-emerald-300 block">2. Proiecte Incrementale</span>
                    <p>Incepe cu un CLI simplu, adauga o baza de date, apoi un REST API si apoi Docker. Nu incerca sa faci un Facebook din prima zi; creste complexitatea treptat.</p>
                  </div>
                  <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 space-y-1">
                    <span className="font-black text-sky-300 block">3. Explica Codul cu Voce Tare</span>
                    <p>Daca nu poti explica pe scurt de ce ai folosit un HashMap sau cum functioneaza o tranzactie unui coleg, inseamna ca nu o stapanesti inca pentru interviu.</p>
                  </div>
                </div>
              </div>

              {/* CURATED FREE RESOURCES CARDS */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-gray-950 uppercase tracking-wide flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                      Resurse, Cursuri & Ghiduri Verificate (100% GRATIS)
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Platforme de renume mondial, cursuri universitare deschise si ghiduri interactive oficiale.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTrack.freeResources.map((res, idx) => (
                    <div 
                      key={idx} 
                      className={`p-5 rounded-2xl border transition flex flex-col justify-between space-y-3 group ${
                        res.isTopPick 
                          ? 'border-purple-300 bg-purple-50/40 hover:border-purple-400' 
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                            {res.platform}
                          </span>
                          {res.isTopPick && (
                            <span className="text-[9px] font-black uppercase tracking-wider bg-purple-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                              Top Recomandat
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-extrabold text-gray-950 group-hover:text-purple-600 transition">
                          {res.title}
                        </h4>

                        <p className="text-xs text-gray-600 leading-relaxed font-sans">
                          {res.description}
                        </p>
                      </div>

                      <div className="pt-2">
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white transition flex items-center justify-center gap-2 shadow-2xs"
                        >
                          <span>Acceseaza Gratuit</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: CURRICULUM PAS CU PAS (DE LA 0 LA ANGAJARE) */}
          {/* ================================================================= */}
          {activePillarTab === 'STAGES' && (
            <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-6">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-sm font-black text-gray-950 uppercase tracking-wide flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  Etapele de Pregatire: De la Zero la Primul Job / Internship
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Urmeaza aceste etape secvential pentru a evita supraincarcarea si pentru a construi o fundatie solida.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {selectedTrack.stages.map((stg) => (
                  <div key={stg.stageNumber} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-black flex items-center justify-center">
                          {stg.stageNumber}
                        </span>
                        <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                          {stg.duration}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-gray-950 leading-snug">
                        {stg.title}
                      </h4>
                      <ul className="space-y-1.5 text-[11px] text-gray-600 leading-relaxed font-sans pt-1">
                        {stg.milestones.map((m, mIdx) => (
                          <li key={mIdx} className="flex items-start gap-1.5">
                            <span className="text-purple-600 font-bold shrink-0">•</span>
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE B: 7-DAY SPECIFIC SKILL LABS (PRESERVED & ENHANCED) */}
      {/* ========================================================================= */}
      {viewMode === 'LABS_7DAY' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* 7-DAY SELECTOR & CUSTOM GENERATOR BANNER */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-gray-950 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-600" />
                  Curricula Intensive de 7 Zile pentru Skill-uri Specifice
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Invata o tehnologie ceruta in anunturile de joburi (Kafka, Redis, Docker etc.) cu teorie, docker si proiect Capstone.
                </p>
              </div>

              {/* CUSTOM GENERATOR INPUT */}
              <form onSubmit={handleGenerateCustom} className="shrink-0 flex items-center gap-1.5 bg-gray-50 p-2 rounded-xl border border-gray-200">
                <input
                  type="text"
                  value={customSkillName}
                  onChange={(e) => setCustomSkillName(e.target.value)}
                  placeholder="Ex: GraphQL, RabbitMQ, Go..."
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-900 focus:outline-purple-600 w-48 sm:w-56"
                />
                <button
                  type="submit"
                  disabled={isGeneratingCustom}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGeneratingCustom ? 'animate-spin' : ''}`} />
                  {isGeneratingCustom ? 'Generez...' : 'Genereaza'}
                </button>
              </form>
            </div>

            {/* CATALOG SKILL PILLS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2">
              {catalog.map((cat) => {
                const isSelected = selectedSkillId === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedSkillId(cat.id)}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/60 shadow-xs ring-1 ring-purple-600'
                        : 'border-gray-200 bg-white hover:bg-gray-50/80 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-1.5 rounded-lg bg-gray-100">
                        {getSkillIcon(cat.iconKey)}
                      </div>
                      <span className="text-[10px] font-black text-purple-700 bg-purple-100/70 px-1.5 py-0.2 rounded-full">
                        {cat.totalDays} Zile
                      </span>
                    </div>
                    <div className="mt-2">
                      <h3 className="font-extrabold text-xs text-gray-950 truncate">{cat.skillName}</h3>
                      <p className="text-[10px] text-gray-500 font-medium truncate mt-0.5">{cat.marketDemandRomania}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ROADMAP CONTENT AREA */}
          {loadingRoadmap ? (
            <div className="bg-white rounded-3xl p-12 text-center text-gray-400">
              <span className="text-xs font-semibold">Se incarca curriculum-ul...</span>
            </div>
          ) : roadmap ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: 7-DAY NAVIGATION & PROGRESS (4 COLS) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-gray-950 flex items-center gap-1.5">
                        {getSkillIcon(roadmap.iconKey)}
                        Progres Curriculum
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {completedCount} din {roadmap.totalDays} zile bifate ({progressPercent}%)
                      </p>
                    </div>
                    <span className="text-xs font-black text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
                      {roadmap.difficulty}
                    </span>
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-200">
                    <div 
                      className="h-full bg-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>

                  {/* DAYS LIST */}
                  <div className="space-y-1.5 pt-2">
                    {roadmap.days?.map((day) => {
                      const isSelected = selectedDayNumber === day.dayNumber;
                      const isDone = !!completedDays[day.dayNumber];

                      return (
                        <div
                          key={day.dayNumber}
                          onClick={() => setSelectedDayNumber(day.dayNumber)}
                          className={`p-2.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'border-purple-600 bg-purple-50/80 shadow-xs'
                              : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/70'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleDayCompletion(day.dayNumber);
                              }}
                              className="shrink-0 text-gray-400 hover:text-emerald-600 transition cursor-pointer"
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                              ) : (
                                <Circle className="w-4 h-4 text-gray-300" />
                              )}
                            </button>
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold text-gray-500 block">
                                Ziua {day.dayNumber} • {day.estimatedHours}
                              </span>
                              <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-purple-950 font-extrabold' : 'text-gray-800'}`}>
                                {day.title.replace(/^Ziua \d+:\s*/, '')}
                              </h4>
                            </div>
                          </div>

                          <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CAPSTONE PROJECT ACTION CARD */}
                <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-neutral-900 text-white rounded-3xl p-5 border border-slate-800 shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                      Capstone Project
                    </span>
                    <span className="text-xs text-gray-400">Day 7 Objective</span>
                  </div>

                  <h3 className="font-extrabold text-sm text-white leading-snug">
                    {roadmap.capstoneProjectTitle}
                  </h3>

                  <p className="text-xs text-gray-300 leading-relaxed font-sans">
                    {roadmap.capstoneProjectArchitecture}
                  </p>

                  {/* GOOGLE XYZ STAR BULLET */}
                  <div className="bg-white/10 rounded-xl p-3 border border-white/15 text-xs text-gray-200 leading-relaxed space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold">
                      <span>Google XYZ Bullet Point (CV & LinkedIn):</span>
                      <button
                        onClick={() => handleCopy(roadmap.cvBulletPoint, 'cv_bullet', 'Formula Google XYZ')}
                        className="hover:text-white cursor-pointer"
                      >
                        {copiedKey === 'cv_bullet' ? 'Copiat!' : 'Copiaza'}
                      </button>
                    </div>
                    <p className="font-sans italic select-text">
                      "{roadmap.cvBulletPoint}"
                    </p>
                  </div>

                  <button
                    onClick={handleAddToCv}
                    disabled={isAddingToCv}
                    className="w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
                  >
                    {isAddingToCv ? (
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <PlusCircle className="w-3.5 h-3.5" />
                    )}
                    <span>{isAddingToCv ? 'Se adauga...' : 'Adauga Skill-ul & Proiectul in CV-ul Meu'}</span>
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: ACTIVE DAY CURRICULUM DETAILS (8 COLS) */}
              <div className="lg:col-span-8 space-y-4">
                {activeDay && (
                  <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-2xs space-y-6">
                    
                    {/* DAY HEADER */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                            Ziua {activeDay.dayNumber} din {roadmap.totalDays}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs font-semibold text-gray-500">{activeDay.estimatedHours} timp estimat</span>
                        </div>
                        <h2 className="text-base sm:text-lg font-black text-gray-950 mt-1">
                          {activeDay.title}
                        </h2>
                      </div>

                      <button
                        onClick={() => toggleDayCompletion(activeDay.dayNumber)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto ${
                          completedDays[activeDay.dayNumber]
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {completedDays[activeDay.dayNumber] ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Completat</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-3.5 h-3.5" />
                            <span>Bifeaza ca Terminat</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* THEORY EXPLANATION */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                        Teorie Esentiala
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans whitespace-pre-line">
                        {activeDay.theoryExplanation}
                      </p>
                    </div>

                    {/* DOCKER ONE-LINER SETUP */}
                    {activeDay.dockerSetupCommand && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                            <Box className="w-3.5 h-3.5 text-blue-500" />
                            Mediu Docker One-Liner (Local Lab)
                          </h4>
                          <button
                            onClick={() => handleCopy(activeDay.dockerSetupCommand, 'docker_cmd', 'Comanda Docker')}
                            className="text-xs text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {copiedKey === 'docker_cmd' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedKey === 'docker_cmd' ? 'Copiat!' : 'Copiaza comanda'}</span>
                          </button>
                        </div>
                        <div className="bg-gray-950 text-emerald-400 p-3.5 rounded-xl font-mono text-xs overflow-x-auto shadow-inner border border-gray-800">
                          <code>{activeDay.dockerSetupCommand}</code>
                        </div>
                      </div>
                    )}

                    {/* HANDS-ON CODE SNIPPET */}
                    {activeDay.handsOnCodeSnippet && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                            <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                            Implementare de Cod ({activeDay.codeLanguage || 'Java / Spring Boot'})
                          </h4>
                          <button
                            onClick={() => handleCopy(activeDay.handsOnCodeSnippet, 'code_snip', 'Cod Sursa')}
                            className="text-xs text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {copiedKey === 'code_snip' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedKey === 'code_snip' ? 'Copiat!' : 'Copiaza codul'}</span>
                          </button>
                        </div>
                        <div className="bg-gray-950 text-gray-200 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-80 shadow-inner border border-gray-800">
                          <pre>{activeDay.handsOnCodeSnippet}</pre>
                        </div>
                      </div>
                    )}

                    {/* PRACTICE TASK & INTERVIEW PRO-TIP */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-1.5">
                        <span className="text-[10px] font-black uppercase text-purple-800 tracking-wider flex items-center gap-1">
                          <CheckSquare className="w-3.5 h-3.5" />
                          Exercitiu Practic al Zilei
                        </span>
                        <p className="text-xs text-purple-950 leading-relaxed font-sans">
                          {activeDay.practiceTask}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                        <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          Pro-Tip pentru Interviu Tehnic
                        </span>
                        <p className="text-xs text-amber-950 leading-relaxed font-sans">
                          {activeDay.interviewTip}
                        </p>
                      </div>
                    </div>

                  </div>
                )}
              </div>

            </div>
          ) : null}

        </div>
      )}

    </div>
  );
}
