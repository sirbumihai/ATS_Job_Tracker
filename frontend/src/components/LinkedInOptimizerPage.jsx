import React, { useState, useEffect } from 'react';
import {
  Linkedin,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  Edit3,
  Plus,
  ShieldCheck,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Building,
  GraduationCap,
  Award,
  Layers,
  Flame,
  Lightbulb,
  X,
  RefreshCw,
  Eye,
  Briefcase,
  CheckSquare,
  Square,
  Terminal,
  Code2,
  FolderGit2,
  FileText,
  BookmarkCheck,
  Palette,
  Sliders,
  CheckCheck,
  Trash2,
  ChevronDown
} from 'lucide-react';

export default function LinkedInOptimizerPage({ currentUser }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [targetDomain, setTargetDomain] = useState('BACKEND');
  const [profileMode, setProfileMode] = useState('all_star'); // 'current' | 'all_star'
  
  // Modale & Interactiuni
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [addSkillModalOpen, setAddSkillModalOpen] = useState(false);
  const [newSkillText, setNewSkillText] = useState('');
  const [editHeadlineModalOpen, setEditHeadlineModalOpen] = useState(false);
  const [tempHeadline, setTempHeadline] = useState('');
  const [editAboutModalOpen, setEditAboutModalOpen] = useState(false);
  const [tempAbout, setTempAbout] = useState('');
  const [bannerPickerOpen, setBannerPickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('action_plan'); // 'action_plan', 'headlines', 'about', 'star_projects', 'boolean_search', 'skills', 'tips'
  const [completedSteps, setCompletedSteps] = useState({});

  // Sincronizare CV Library
  const [cvList, setCvList] = useState([]);
  const [selectedCvId, setSelectedCvId] = useState('');
  const [syncingCv, setSyncingCv] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  const DEFAULT_USER_ID = '23fe8bdd-08f4-413d-9985-f99c21040b59';
  const activeUserId = currentUser?.userId || currentUser?.id || DEFAULT_USER_ID;

  // Incarcare initiala
  useEffect(() => {
    loadAllStarProfile();
    fetchUserCvs();
    
    // Incarca starea checklist-ului din localStorage
    try {
      const savedSteps = localStorage.getItem('linkedin_action_steps');
      if (savedSteps) setCompletedSteps(JSON.parse(savedSteps));
    } catch (e) {
      console.warn('Could not read saved checklist steps', e);
    }
  }, []);

  const fetchUserCvs = async () => {
    try {
      const res = await fetch('/api/v1/cv/list', {
        headers: { 'X-User-Id': activeUserId }
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setCvList(list);
        if (list.length > 0) {
          const primary = list.find(c => c.isPrimary) || list[0];
          setSelectedCvId(primary.id);
        }
      }
    } catch (err) {
      console.error('Eroare la preluarea CV-urilor din biblioteca:', err);
    }
  };

  const toggleStep = (stepId) => {
    const updated = { ...completedSteps, [stepId]: !completedSteps[stepId] };
    setCompletedSteps(updated);
    try {
      localStorage.setItem('linkedin_action_steps', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save checklist step', e);
    }
  };

  const loadDemoProfile = async () => {
    setLoading(true);
    setProfileMode('current');
    try {
      const res = await fetch('/api/v1/linkedin/demo-profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        triggerOptimization(data);
      }
    } catch (err) {
      console.error('Eroare la incarcarea profilului demonstrativ:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllStarProfile = async () => {
    setLoading(true);
    setProfileMode('all_star');
    try {
      const res = await fetch('/api/v1/linkedin/all-star-profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        triggerOptimization(data);
      } else {
        loadDemoProfile();
      }
    } catch (err) {
      console.error('Eroare la incarcarea profilului All-Star:', err);
      loadDemoProfile();
    } finally {
      setLoading(false);
    }
  };

  const handleSyncWithSelectedCv = async () => {
    if (!selectedCvId && cvList.length === 0) {
      alert('Nu ai niciun CV in biblioteca pentru a sincroniza.');
      return;
    }
    const targetCv = cvList.find(c => c.id === selectedCvId) || cvList[0];
    if (!targetCv) return;

    setSyncingCv(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/v1/linkedin/sync-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: profile,
          cv: targetCv
        })
      });
      if (res.ok) {
        const syncRes = await res.json();
        setProfile(syncRes.profile);
        triggerOptimization(syncRes.profile);
        setSyncMessage({
          text: syncRes.message || 'Sincronizat cu succes!',
          imported: syncRes.importedItems || []
        });
        setTimeout(() => setSyncMessage(null), 8000);
      } else {
        alert('Nu s-a putut sincroniza profilul cu CV-ul selectat.');
      }
    } catch (err) {
      console.error('Eroare la sincronizarea cu CV-ul:', err);
      alert('A aparut o eroare la sincronizare.');
    } finally {
      setSyncingCv(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Te rugam sa incarci un fisier PDF exportat din LinkedIn.');
      return;
    }

    setLoading(true);
    setProfileMode('current');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/v1/linkedin/parse-pdf', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const parsed = await res.json();
        setProfile(parsed);
        triggerOptimization(parsed);
      } else {
        alert('Nu am putut citi fisierul PDF. Asigura-te ca este un export PDF valid LinkedIn.');
      }
    } catch (err) {
      console.error('Eroare la upload PDF:', err);
      alert('A aparut o eroare la incarcarea fisierului PDF.');
    } finally {
      setLoading(false);
    }
  };

  const triggerOptimization = async (currentProfile = profile, domain = targetDomain) => {
    if (!currentProfile) return;
    setOptimizing(true);
    try {
      const res = await fetch('/api/v1/linkedin/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: currentProfile,
          targetDomain: domain,
          targetRoleLevel: 'JUNIOR'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setOptimizationResult(data);
      }
    } catch (err) {
      console.error('Eroare la optimizarea profilului:', err);
    } finally {
      setOptimizing(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const applyHeadline = (newHeadline) => {
    if (!profile) return;
    const updated = { ...profile, headline: newHeadline };
    setProfile(updated);
    triggerOptimization(updated);
  };

  const applyAbout = (newAbout) => {
    if (!profile) return;
    const updated = { ...profile, about: newAbout };
    setProfile(updated);
    triggerOptimization(updated);
  };

  const addSkillToProfile = (skillName) => {
    if (!profile || !skillName.trim()) return;
    if (profile.skills && profile.skills.some(s => s.toLowerCase() === skillName.toLowerCase())) {
      return;
    }
    const currentSkills = profile.skills || [];
    const updated = { ...profile, skills: [...currentSkills, skillName.trim()] };
    setProfile(updated);
    triggerOptimization(updated);
  };

  const removeSkillFromProfile = (skillName) => {
    if (!profile || !profile.skills) return;
    const updated = {
      ...profile,
      skills: profile.skills.filter(s => s.toLowerCase() !== skillName.toLowerCase())
    };
    setProfile(updated);
    triggerOptimization(updated);
  };

  const handleManualAddSkill = (e) => {
    e.preventDefault();
    if (newSkillText.trim()) {
      addSkillToProfile(newSkillText.trim());
      setNewSkillText('');
      setAddSkillModalOpen(false);
    }
  };

  const handleSaveHeadline = () => {
    if (tempHeadline.trim()) {
      applyHeadline(tempHeadline.trim());
      setEditHeadlineModalOpen(false);
    }
  };

  const handleSaveAbout = () => {
    if (tempAbout.trim()) {
      applyAbout(tempAbout.trim());
      setEditAboutModalOpen(false);
    }
  };

  const toggleCreatorMode = () => {
    if (!profile) return;
    const updated = { ...profile, isCreatorMode: !profile.isCreatorMode };
    setProfile(updated);
    triggerOptimization(updated);
  };

  const toggleOpenToWork = () => {
    if (!profile) return;
    const updated = { ...profile, isOpenToWork: !profile.isOpenToWork };
    setProfile(updated);
    triggerOptimization(updated);
  };

  const setBannerStyle = (styleName) => {
    if (!profile) return;
    const updated = { ...profile, bannerTheme: styleName };
    setProfile(updated);
    setBannerPickerOpen(false);
  };

  const getBannerBackground = () => {
    const theme = profile?.bannerTheme || 'tech_terminal';
    switch (theme) {
      case 'upb_academic':
        return 'bg-gradient-to-r from-[#002f6c] via-[#004b87] to-[#0a66c2]';
      case 'minimalist_slate':
        return 'bg-gradient-to-r from-slate-900 via-slate-800 to-zinc-900';
      case 'cloud_violet':
        return 'bg-gradient-to-r from-[#1e1b4b] via-[#2e1065] to-[#3b0764]';
      case 'tech_terminal':
      default:
        return 'bg-gradient-to-r from-gray-950 via-neutral-900 to-[#0a192f]';
    }
  };

  return (
    <div className="space-y-8 pb-16 font-sans">
      
      {/* HERO BANNER & CV SYNC TOOLBAR */}
      <section className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-gradient-to-bl from-blue-100/50 via-sky-50/30 to-transparent rounded-full pointer-events-none blur-2xl"></div>

        <div className="relative z-10 space-y-6">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-[#0077b5]/10 text-[#0077b5] border border-[#0077b5]/20">
                <Linkedin className="w-3.5 h-3.5 fill-[#0077b5]" />
                Optimizator Profil LinkedIn & Sincronizare CV Studio
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-gray-950 tracking-tight leading-tight">
                Profil LinkedIn <span className="text-[#0a66c2] underline decoration-blue-200 decoration-wavy">Magnet pentru Recruiteri</span> & Cross-Sync CV
              </h1>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Combina datele oficiale din CV-ul tau (SIMAVI, ATS Job Tracker, 3D Medical Image Segmentation) cu algoritmul LinkedIn Recruiter 2026 pentru a genera un profil de autoritate maxima (100/100 All-Star).
              </p>
            </div>

            {/* QUICK ACTIONS & VIEW MODE SWITCHER */}
            <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2.5">
              
              <div className="bg-gray-100 p-1 rounded-2xl flex gap-1 border border-gray-200 shadow-2xs">
                <button
                  onClick={loadAllStarProfile}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    profileMode === 'all_star'
                      ? 'bg-black text-white shadow-xs'
                      : 'text-gray-600 hover:text-black hover:bg-gray-200/60'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  Profil All-Star (100/100)
                </button>
                <button
                  onClick={loadDemoProfile}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    profileMode === 'current'
                      ? 'bg-black text-white shadow-xs'
                      : 'text-gray-600 hover:text-black hover:bg-gray-200/60'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-gray-600" />
                  Profilul Curent
                </button>
              </div>

              <button
                onClick={() => triggerOptimization()}
                disabled={optimizing}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#0a66c2] hover:bg-[#004182] text-white transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${optimizing ? 'animate-spin' : ''}`} />
                Re-evalueaza Scorul ATS
              </button>

            </div>
          </div>

          {/* CV SELECTOR & DEEP SYNC BAR */}
          <div className="bg-gradient-to-r from-blue-50/80 via-sky-50/50 to-indigo-50/60 border border-blue-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase text-blue-950 tracking-wider">
                  Sincronizeaza Profilul cu un CV din Biblioteca
                </h4>
                <p className="text-xs text-blue-900 mt-0.5">
                  Importa automat proiectele STAR, experienta de internship si competentele tehnice fara a le tasta manual.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <select
                value={selectedCvId}
                onChange={(e) => setSelectedCvId(e.target.value)}
                className="px-3.5 py-2 text-xs font-bold bg-white text-gray-900 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                {cvList.length > 0 ? (
                  cvList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title || 'CV Fara Titlu'} {c.isPrimary ? '★ (Principal)' : ''}
                    </option>
                  ))
                ) : (
                  <option value="">Sirbu Mihai-Alexandru (CV Principal Tehnic)</option>
                )}
              </select>

              <button
                onClick={handleSyncWithSelectedCv}
                disabled={syncingCv}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${syncingCv ? 'animate-spin' : ''}`} />
                {syncingCv ? 'Se fuzioneaza...' : 'Sincronizeaza cu CV-ul'}
              </button>
            </div>
          </div>

          {/* SYNC NOTIFICATION BANNER */}
          {syncMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-start justify-between gap-3 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{syncMessage.text}</p>
                  {syncMessage.imported && syncMessage.imported.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {syncMessage.imported.map((item, idx) => (
                        <span key={idx} className="bg-white px-2 py-0.5 rounded-md font-semibold text-[11px] border border-emerald-200">
                          ✓ {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setSyncMessage(null)}
                className="text-emerald-700 hover:text-emerald-950 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* DRAG & DROP UPLOAD BOX */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            className={`p-6 border-2 border-dashed rounded-2xl text-center transition flex flex-col items-center justify-center gap-2 cursor-pointer ${
              dragOver 
                ? 'border-[#0a66c2] bg-blue-50/70 scale-[1.005]' 
                : 'border-gray-300 hover:border-gray-400 bg-gray-50/60'
            }`}
            onClick={() => document.getElementById('linkedin-pdf-input')?.click()}
          >
            <input 
              type="file" 
              id="linkedin-pdf-input" 
              accept=".pdf" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(e.target.files[0]);
                }
              }} 
            />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-[#0a66c2] flex items-center justify-center shadow-2xs">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-900">
                  {loading ? 'Se analizeaza PDF-ul LinkedIn...' : 'Ai descarcat un nou PDF din LinkedIn? Trage fisierul aici'}
                </p>
                <p className="text-[11px] text-gray-500">
                  Foloseste Resources ➔ Save to PDF de pe LinkedIn pentru a compara cu starea ta live.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* MAIN TWO-COLUMN SPLIT: INTERACTIVE LINKEDIN UI REPLICA (LEFT) & AI ADVISOR (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: PIXEL-PERFECT LINKEDIN DESKTOP PROFILE UI (7/12) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-gray-400">Previzualizare Profil Live</span>
              <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Eye className="w-3 h-3 text-[#0a66c2]" />
                {profileMode === 'all_star' ? 'All-Star Demo (Recomandat 100/100)' : 'Profilul Tau Curent'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setBannerPickerOpen(!bannerPickerOpen)}
                className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
                title="Alege Tema Banner-ului"
              >
                <Palette className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Schimba Banner</span>
              </button>
            </div>
          </div>

          {/* BANNER THEME SELECTOR MODAL / DROPDOWN */}
          {bannerPickerOpen && (
            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-md flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-gray-700">Alege Stilul Banner-ului Tehnic:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBannerStyle('tech_terminal')}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-gray-900 text-emerald-400 border border-gray-700 hover:scale-105 transition cursor-pointer"
                >
                  Terminal Java
                </button>
                <button
                  onClick={() => setBannerStyle('upb_academic')}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#004b87] text-white border border-blue-400 hover:scale-105 transition cursor-pointer"
                >
                  UPB Academic Blue
                </button>
                <button
                  onClick={() => setBannerStyle('minimalist_slate')}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 text-slate-200 border border-slate-600 hover:scale-105 transition cursor-pointer"
                >
                  Minimalist Slate
                </button>
                <button
                  onClick={() => setBannerStyle('cloud_violet')}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#2e1065] text-purple-300 border border-purple-500 hover:scale-105 transition cursor-pointer"
                >
                  Cloud & Microservices
                </button>
              </div>
            </div>
          )}

          {/* MAIN PROFILE CARD */}
          <div className="bg-white border border-gray-300 rounded-2xl overflow-hidden shadow-xs relative group">
            
            {/* LINKEDIN COVER BANNER */}
            <div className={`h-32 sm:h-44 w-full relative transition-colors duration-300 ${getBannerBackground()}`}>
              <div className="absolute inset-0 p-4 flex flex-col justify-between text-white/80 pointer-events-none">
                <div className="text-[11px] font-mono tracking-wider text-emerald-400/90 font-bold">
                  // Java 21 • Spring Boot 3 • PostgreSQL pgvector • Docker • Distributed Systems
                </div>
                <div className="text-right text-[10px] font-mono opacity-40">
                  National University of Science and Technology POLITEHNICA Bucharest
                </div>
              </div>

              <div className="absolute top-3 right-3">
                <button 
                  onClick={() => setBannerPickerOpen(!bannerPickerOpen)}
                  className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 flex items-center justify-center shadow-md transition cursor-pointer"
                  title="Personalizeaza Banner-ul"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* AVATAR & BASIC DETAILS */}
            <div className="px-6 pb-6 pt-0 relative">
              
              {/* CIRCULAR AVATAR */}
              <div className="flex justify-between items-end -mt-16 sm:-mt-20 mb-3">
                <div className="relative">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white bg-[#1b2a41] text-white flex items-center justify-center text-3xl sm:text-4xl font-black shadow-md">
                    {profile?.fullName ? profile.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SM'}
                  </div>
                  {profile?.isOpenToWork && (
                    <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider border-2 border-white shadow-xs">
                      Open to Work
                    </div>
                  )}
                </div>

                {/* UNIVERSITY LOGO BADGE */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center font-black text-xs text-gray-700">
                    UP
                  </div>
                  <span className="text-xs font-bold text-gray-900 hidden sm:inline max-w-[200px] leading-tight">
                    Universitatea POLITEHNICA din Bucuresti
                  </span>
                </div>
              </div>

              {/* NAME & VERIFICATION */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight">
                    {profile?.fullName || 'Sirbu Mihai'}
                  </h1>
                  <ShieldCheck className="w-5 h-5 text-gray-500 fill-gray-100" title="Verificat" />
                </div>

                {/* HEADLINE WITH EDIT BUTTON */}
                <div className="flex items-start justify-between gap-3 pt-0.5 group/h">
                  <p className="text-sm text-gray-800 font-normal leading-snug">
                    {profile?.headline || 'Junior Software Engineer | Java 21 & Spring Boot 3 | UPB Automatica & Calculatoare'}
                  </p>
                  <button
                    onClick={() => {
                      setTempHeadline(profile?.headline || '');
                      setEditHeadlineModalOpen(true);
                    }}
                    className="p-1 rounded-full text-gray-400 hover:text-black opacity-0 group-hover/h:opacity-100 transition cursor-pointer shrink-0"
                    title="Editeaza Headline"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* CREATOR TOPICS */}
                {profile?.isCreatorMode && (
                  <p className="text-xs text-gray-500 font-medium pt-0.5">
                    Discuta despre{' '}
                    <span className="font-semibold text-gray-700">
                      {profile.creatorTopics ? profile.creatorTopics.join(' ') : '#java #springboot #backend #algorithms #softwareengineering'}
                    </span>
                  </p>
                )}

                {/* LOCATION & CONTACT INFO */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 pt-1">
                  <span>{profile?.location || 'Bucuresti, Romania'}</span>
                  <span>•</span>
                  <button 
                    onClick={() => setContactModalOpen(true)}
                    className="text-[#0a66c2] hover:underline font-bold cursor-pointer"
                  >
                    Contact info
                  </button>
                </div>

                {/* CONNECTIONS COUNT */}
                <div className="pt-0.5">
                  <a href="#connections" className="text-xs font-bold text-[#0a66c2] hover:underline">
                    {profile?.connectionsCount || '500+ conexiuni'}
                  </a>
                </div>
              </div>

              {/* ACTION PILLS & TOGGLES */}
              <div className="flex flex-wrap items-center gap-2 pt-4">
                <button 
                  onClick={toggleOpenToWork}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition shadow-2xs cursor-pointer ${
                    profile?.isOpenToWork 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                      : 'bg-[#0a66c2] hover:bg-[#004182] text-white'
                  }`}
                >
                  {profile?.isOpenToWork ? '✓ Open to Work activ' : 'Open to'}
                </button>

                <button 
                  onClick={toggleCreatorMode}
                  className="px-4 py-1.5 rounded-full text-xs font-bold bg-white hover:bg-blue-50 text-[#0a66c2] border border-[#0a66c2] transition shadow-2xs cursor-pointer"
                >
                  {profile?.isCreatorMode ? 'Creator Mode: Pornit' : 'Porneste Creator Mode'}
                </button>

                <button 
                  onClick={() => {
                    setTempHeadline(profile?.headline || '');
                    setEditHeadlineModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white hover:bg-gray-100 text-gray-700 border border-gray-400 transition shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editeaza Profil
                </button>
              </div>

            </div>
          </div>

          {/* FEATURED SECTION (IN PRIM-PLAN) */}
          <div className="bg-white border border-gray-300 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-950 flex items-center gap-2">
                  Featured (In prim-plan)
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    +30% Vizualizari
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Vitrina ta tehnica vizuala: proiecte de pe GitHub, demo-uri live si CV PDF.
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('action_plan')}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {profile?.featured && profile.featured.length > 0 ? (
                profile.featured.map((item, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-xl p-3 bg-gray-50/70 hover:bg-blue-50/40 hover:border-blue-200 transition space-y-2 flex flex-col justify-between">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                      <h4 className="text-xs font-bold text-gray-900 leading-snug line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 leading-tight">
                        {item.subtitle}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px] font-bold text-[#0a66c2]">
                      <span>{item.type === 'LINK' ? 'Deschide Link' : item.type === 'DOCUMENT' ? 'Descarca PDF' : 'Vezi Postarea'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-4 text-center text-xs text-gray-400 border border-dashed rounded-xl">
                  Adauga proiectele de pe GitHub in sectiunea Featured pentru a demonstra expertiza practica!
                </div>
              )}
            </div>
          </div>

          {/* ABOUT CARD */}
          <div className="bg-white border border-gray-300 rounded-2xl p-6 shadow-xs space-y-3 relative group">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-950">About (Despre)</h3>
              <button 
                onClick={() => {
                  setTempAbout(profile?.about || '');
                  setEditAboutModalOpen(true);
                }}
                title="Editeaza sectiunea About"
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            {profile?.about && profile.about.trim().length > 0 ? (
              <div className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line space-y-2">
                {profile.about}
              </div>
            ) : (
              <div 
                onClick={() => setActiveTab('about')}
                className="py-4 px-3 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-400 hover:text-blue-600 hover:border-blue-300 transition cursor-pointer"
              >
                + Adauga sectiunea About (Apasa pentru a aplica rezumatul optimizat generat de AI)
              </div>
            )}
          </div>

          {/* EXPERIENCE CARD (PROFESSIONAL INTERNSHIP / ROLES) */}
          <div className="bg-white border border-gray-300 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-950 flex items-center gap-2">
                  Experience (Experienta Profesionala)
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Validare Practica
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Internship-urile si proiectele in echipa demonstreaza adaptarea la rigorile industriei.
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('action_plan')}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 divide-y divide-gray-100">
              {profile?.experience && profile.experience.length > 0 ? (
                profile.experience.map((exp, idx) => (
                  <div key={idx} className={`space-y-2 ${idx > 0 ? 'pt-4' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-gray-950 leading-tight">
                          {exp.title}
                        </h4>
                        <p className="text-xs font-semibold text-gray-700 mt-0.5">
                          {exp.company}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {exp.period} • {exp.location}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50/70 p-3 rounded-xl border border-gray-200/70">
                      {exp.description}
                    </div>
                  </div>
                ))
              ) : (
                <div 
                  onClick={handleSyncWithSelectedCv}
                  className="py-4 text-center text-xs text-gray-400 border border-dashed rounded-xl cursor-pointer hover:border-blue-300 hover:text-blue-600 transition"
                >
                  + Nu ai nicio experienta listata. Apasa pe „Sincronizeaza cu CV-ul” pentru a importa automat internship-ul SIMAVI!
                </div>
              )}
            </div>
          </div>

          {/* PROJECTS CARD (GOOGLE XYZ / STAR FORMATTED) */}
          <div className="bg-white border border-gray-300 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-950 flex items-center gap-2">
                  Projects (Proiecte Tehnice)
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Formule STAR
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Proiecte complexe cu cod deschis si arhitectura scalabila (Java 21, Spring Boot, PyTorch).
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('star_projects')}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 divide-y divide-gray-100">
              {profile?.projects && profile.projects.length > 0 ? (
                profile.projects.map((proj, idx) => (
                  <div key={idx} className={`space-y-2 ${idx > 0 ? 'pt-4' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-gray-950 leading-tight">
                          {proj.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {proj.timePeriod} • {proj.associatedWith}
                        </p>
                      </div>
                      {proj.url && (
                        <a 
                          href={proj.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition flex items-center gap-1 shrink-0"
                        >
                          <FolderGit2 className="w-3.5 h-3.5 text-gray-600" />
                          Link Proiect
                        </a>
                      )}
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed">
                      {proj.description}
                    </p>

                    {proj.skills && proj.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.skills.map((sk, sidx) => (
                          <span key={sidx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-100">
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div 
                  onClick={() => setActiveTab('star_projects')}
                  className="py-4 text-center text-xs text-gray-400 border border-dashed rounded-xl cursor-pointer"
                >
                  + Adauga proiecte tehnice cu formula STAR / Google XYZ
                </div>
              )}
            </div>
          </div>

          {/* EDUCATION CARD */}
          <div className="bg-white border border-gray-300 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-950">Education (Studii)</h3>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition cursor-pointer">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4 divide-y divide-gray-100">
              {profile?.education && profile.education.length > 0 ? (
                profile.education.map((edu, idx) => (
                  <div key={idx} className={`flex items-start gap-3.5 ${idx > 0 ? 'pt-4' : ''}`}>
                    <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center font-black text-xs text-gray-700 shrink-0">
                      {edu.logoBadge || 'UP'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 leading-tight">
                        {edu.institution}
                      </h4>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {edu.degree}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {edu.period}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center font-black text-xs text-gray-700 shrink-0">
                    UP
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Universitatea POLITEHNICA din Bucuresti</h4>
                    <p className="text-xs text-gray-600">Informatica</p>
                    <p className="text-[11px] text-gray-400">octombrie 2022 – iulie 2026</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SKILLS CARD WITH QUICK REMOVE & ADD */}
          <div className="bg-white border border-gray-300 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-950 flex items-center gap-2">
                  Skills & Endorsements
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {profile?.skills?.length || 0} competente
                  </span>
                </h3>
                <p className="text-xs text-gray-500">Fixeaza Top 3 Pinned Skills (Java, Spring Boot, SQL)</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setAddSkillModalOpen(true)}
                  className="px-3 py-1 rounded-full text-xs font-bold text-[#0a66c2] border border-[#0a66c2] hover:bg-blue-50 transition cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Skill
                </button>
              </div>
            </div>

            <div className="space-y-2.5 divide-y divide-gray-100">
              {profile?.skills && profile.skills.length > 0 ? (
                profile.skills.map((sk, idx) => (
                  <div key={idx} className={`flex items-center justify-between group/sk ${idx > 0 ? 'pt-2.5' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">{sk}</span>
                      {idx < 3 && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                          Pinned Top {idx + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-400">Aptitudine listata</span>
                      <button
                        onClick={() => removeSkillFromProfile(sk)}
                        className="text-gray-300 hover:text-rose-600 transition p-1 cursor-pointer opacity-0 group-hover/sk:opacity-100"
                        title="Sterge aptitudinea"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">Nicio aptitudine listata inca.</p>
              )}
            </div>
          </div>

          {/* LICENSES & CERTIFICATIONS CARD */}
          {profile?.certifications && profile.certifications.length > 0 && (
            <div className="bg-white border border-gray-300 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-950">Licenses & Certifications</h3>
                <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition cursor-pointer">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 divide-y divide-gray-100">
                {profile.certifications.map((cert, idx) => (
                  <div key={idx} className={`flex items-center justify-between ${idx > 0 ? 'pt-2' : ''}`}>
                    <div className="flex items-center gap-2.5">
                      <Award className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-xs font-bold text-gray-800">{cert}</span>
                    </div>
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                      Verificat
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LANGUAGES CARD */}
          {profile?.languages && profile.languages.length > 0 && (
            <div className="bg-white border border-gray-300 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-950">Languages</h3>
                <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition cursor-pointer">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 divide-y divide-gray-100">
                {profile.languages.map((lang, idx) => (
                  <div key={idx} className={`flex items-center justify-between ${idx > 0 ? 'pt-2' : ''}`}>
                    <span className="text-xs font-bold text-gray-800">{lang}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: AI AUDIT & OPTIMIZATION ADVISOR (5/12) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* PROFILE STRENGTH SCORE CARD */}
          <div className="bg-gradient-to-br from-gray-900 via-neutral-900 to-black text-white p-6 rounded-3xl shadow-lg border border-neutral-800 space-y-5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-blue-300 border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Scor Vizibilitate Recruiteri
              </span>
              <span className="text-xs font-bold text-gray-400">Algoritm 2026 Audit</span>
            </div>

            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 rounded-2xl bg-neutral-800/80 border border-neutral-700 flex flex-col items-center justify-center shrink-0">
                <span className="text-2xl font-black text-white">
                  {optimizationResult?.overallScore || 85}
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">din 100</span>
              </div>

              <div>
                <h3 className="text-sm font-black text-white leading-tight">
                  {optimizationResult?.scoreGrade || 'All-Star Profile (Optimizat Recruiteri)'}
                </h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Profilurile cu scor peste 85 obtin cu pana la <strong className="text-blue-300">3.5x mai multe mesaje directe</strong> de la recruiteri din Romania.
                </p>
              </div>
            </div>

            {/* SCORE BREAKDOWN BARS */}
            {optimizationResult?.scoreBreakdown && (
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                {Object.entries(optimizationResult.scoreBreakdown).map(([label, val]) => (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-gray-300">
                      <span>{label}</span>
                      <span>{val} pts</span>
                    </div>
                    <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          val >= 18 ? 'bg-emerald-500' : val >= 12 ? 'bg-blue-500' : 'bg-amber-500'
                        }`} 
                        style={{ width: `${Math.min(100, (val / 20) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CRITICAL GAPS */}
            {optimizationResult?.criticalGaps && optimizationResult.criticalGaps.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Lipsuri Critice Identificate ({optimizationResult.criticalGaps.length})
                </span>
                <ul className="space-y-1.5">
                  {optimizationResult.criticalGaps.map((gap, i) => (
                    <li key={i} className="text-xs text-gray-300 flex items-start gap-2 leading-relaxed bg-white/5 p-2 rounded-xl">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5"></span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* TABS NAVIGATION FOR SUGGESTIONS */}
          <div className="bg-white border border-gray-200 rounded-2xl p-1.5 flex flex-wrap gap-1 shadow-xs">
            <button
              onClick={() => setActiveTab('action_plan')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'action_plan'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              Plan Pas-cu-Pas
            </button>
            <button
              onClick={() => setActiveTab('headlines')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'headlines'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              Headline
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'about'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-500" />
              Despre
            </button>
            <button
              onClick={() => setActiveTab('star_projects')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'star_projects'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5 text-purple-500" />
              Proiecte STAR
            </button>
            <button
              onClick={() => setActiveTab('boolean_search')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'boolean_search'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-sky-500" />
              Cautare Recruiter
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'skills'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              Skills Piata
            </button>
            <button
              onClick={() => setActiveTab('tips')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tips'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-500" />
              Sfaturi Pro
            </button>
          </div>

          {/* TAB 0: ACTION PLAN CHECKLIST (10 DETAILED CONCRETE STEPS) */}
          {activeTab === 'action_plan' && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-950 uppercase tracking-wide flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-500" />
                    Plan de Actiune Pas cu Pas (10 Etape)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Bifeaza etapele pe masura ce le aplici pe profilul tau LinkedIn real.
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {Object.values(completedSteps).filter(Boolean).length} / {optimizationResult?.actionPlan?.length || 10} Completate
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {optimizationResult?.actionPlan?.map((step) => {
                  const isDone = !!completedSteps[step.id];
                  return (
                    <div 
                      key={step.id} 
                      className={`p-4 rounded-2xl border transition space-y-2.5 ${
                        isDone 
                          ? 'border-emerald-200 bg-emerald-50/40 opacity-80' 
                          : 'border-gray-200 bg-gray-50/80 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleStep(step.id)}
                            className="mt-0.5 text-gray-400 hover:text-emerald-600 transition cursor-pointer"
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-300" />
                            )}
                          </button>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-gray-950 leading-tight">
                                {step.stepNumber}. {step.title}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                {step.impact}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-1">
                              Timp estimat: <strong>{step.estimatedMinutes}</strong> • Categorie: {step.category}
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed pl-8">
                        {step.instructions}
                      </p>

                      {step.exampleSnippet && (
                        <div className="ml-8 p-2.5 rounded-xl bg-white border border-gray-200 flex items-center justify-between gap-2">
                          <code className="text-[11px] font-mono text-gray-800 truncate">
                            {step.exampleSnippet}
                          </code>
                          <button
                            onClick={() => copyToClipboard(step.exampleSnippet, step.id)}
                            className="text-xs font-bold text-[#0a66c2] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            {copiedKey === step.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedKey === step.id ? 'Copiat!' : 'Copiaza'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 1: HEADLINE SUGGESTIONS */}
          {activeTab === 'headlines' && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-950 uppercase tracking-wide flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Headline-uri Magnetice Optimizate
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Semnalul #1 in algoritmul LinkedIn Recruiter. Foloseste la maximum cele 220 de caractere.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                {optimizationResult?.optimizedHeadlines?.map((h, i) => (
                  <div 
                    key={i} 
                    className={`p-4 rounded-2xl border transition space-y-2.5 ${
                      h.recommended 
                        ? 'border-blue-300 bg-blue-50/50' 
                        : 'border-gray-200 bg-gray-50/80 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-blue-700 uppercase tracking-wider">
                        {h.formulaName}
                      </span>
                      {h.recommended && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-600 text-white">
                          Recomandat
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-gray-950 leading-snug">
                      "{h.headline}"
                    </p>

                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      {h.rationale}
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => applyHeadline(h.headline)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Adopta in Profil
                      </button>
                      <button
                        onClick={() => copyToClipboard(h.headline, `h_${i}`)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedKey === `h_${i}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Copiat!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copiaza
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ABOUT / SUMMARY GENERATOR */}
          {activeTab === 'about' && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-950 uppercase tracking-wide flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-blue-500" />
                    Sectiune 'About' Generata cu AI
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Structura pe 3 paragrafe: Cine esti + Stiva Tehnica & Proiecte + Call to Action cu Email.
                  </p>
                </div>
              </div>

              {optimizationResult?.optimizedAbout && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto">
                    {optimizationResult.optimizedAbout}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => applyAbout(optimizationResult.optimizedAbout)}
                      className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      Adopta in Profilul Live
                    </button>
                    <button
                      onClick={() => copyToClipboard(optimizationResult.optimizedAbout, 'about_text')}
                      className="py-2.5 px-4 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedKey === 'about_text' ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          Copiat!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copiaza Textul
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STAR PROJECTS (GOOGLE XYZ FORMULA) */}
          {activeTab === 'star_projects' && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-950 uppercase tracking-wide flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-purple-500" />
                    Proiecte Sugerate in Format STAR / Google XYZ
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Formula „Accomplished [X] as measured by [Y] by doing [Z]” care atrage direct interviuri tehnice.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-1">
                {optimizationResult?.suggestedProjects?.map((proj, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-gray-50/90 border border-gray-200 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-gray-950 leading-snug">{proj.title}</h4>
                        <span className="text-[11px] text-gray-500">{proj.timePeriod}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(`${proj.title}\n\n${proj.description}\n\nSkills: ${proj.skills.join(', ')}\nLink: ${proj.url}`, `proj_${idx}`)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        {copiedKey === `proj_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedKey === `proj_${idx}` ? 'Copiat!' : 'Copiaza'}
                      </button>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed bg-white p-3 rounded-xl border border-gray-200/80">
                      {proj.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {proj.skills.map((sk, sidx) => (
                        <span key={sidx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-900 border border-purple-100">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BOOLEAN SEARCH QUERIES (REVEALS HOW RECRUITERS SEARCH) */}
          {activeTab === 'boolean_search' && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-950 uppercase tracking-wide flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-sky-500" />
                    Interogari Booleene Rulate de Recruiteri
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Iata cum filtreaza recruiterii candidatii in LinkedIn Recruiter si cum apari tu pe prima pagina.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-1">
                {optimizationResult?.recruiterQueries?.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-gray-50/90 border border-gray-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-gray-950">{q.roleTarget}</h4>
                      <button
                        onClick={() => copyToClipboard(q.booleanString, `bq_${idx}`)}
                        className="text-xs font-bold text-[#0a66c2] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === `bq_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedKey === `bq_${idx}` ? 'Copiat!' : 'Copiaza Query'}
                      </button>
                    </div>

                    <div className="p-2.5 rounded-xl bg-gray-900 text-gray-100 font-mono text-[11px] leading-relaxed select-all">
                      {q.booleanString}
                    </div>

                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      <strong>Cum functioneaza:</strong> {q.explanation}
                    </p>

                    <div className="text-[11px] text-emerald-900 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200 font-medium">
                      🎯 <strong>De ce te potrivesti:</strong> {q.whyYouMatch}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: RECOMMENDED SKILLS */}
          {activeTab === 'skills' && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-950 uppercase tracking-wide flex items-center gap-2">
                    <Flame className="w-4 h-4 text-rose-500" />
                    Aptitudini Recomandate de Piata
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Tehnologii solicitate frecvent in rolurile de Junior din Romania care iti lipsesc din profil.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                {optimizationResult?.recommendedSkills?.map((sk) => (
                  <div 
                    key={sk.skillName}
                    className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-200/80 flex items-center justify-between gap-3 hover:bg-gray-100 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-950">{sk.skillName}</span>
                        <span className="text-[10px] font-semibold text-gray-500 bg-gray-200 px-1.5 py-0.2 rounded">
                          {sk.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {sk.rationale} • <strong className="text-blue-600">{sk.marketDemand}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => addSkillToProfile(sk.skillName)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-black hover:text-white text-gray-800 border border-gray-300 transition shadow-2xs whitespace-nowrap cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Adauga
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: RECRUITER STRATEGIC TIPS */}
          {activeTab === 'tips' && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-950 uppercase tracking-wide flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-500" />
                    Top Strategii Verificate de la Recruiteri IT
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Puncte cheie pentru a trece peste filtrele automate si a obtine interviuri.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                {optimizationResult?.recruiterTips?.map((tip) => (
                  <div key={tip.id} className="p-4 rounded-2xl bg-gray-50/90 border border-gray-200/90 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-gray-950 leading-snug">{tip.title}</h4>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {tip.badge}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      {tip.description}
                    </p>

                    <div className="pt-1 text-[11px] text-blue-900 bg-blue-50/60 p-2 rounded-xl border border-blue-100">
                      <strong>Cum faci:</strong> {tip.actionAdvice}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* EDIT HEADLINE MODAL */}
      {editHeadlineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-gray-200 w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-950 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#0a66c2]" />
                Editeaza Headline Profil
              </h3>
              <button 
                onClick={() => setEditHeadlineModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-black transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-gray-700">Titlu Profil (Headline)</label>
                <span className={`font-mono font-bold ${tempHeadline.length > 220 ? 'text-rose-600' : 'text-gray-400'}`}>
                  {tempHeadline.length} / 220 caractere
                </span>
              </div>
              <textarea
                value={tempHeadline}
                onChange={(e) => setTempHeadline(e.target.value)}
                rows={3}
                className="w-full p-3 text-xs font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Ex: Junior Software Engineer | Java 21 & Spring Boot | Student @ UPB..."
              />
              <p className="text-[11px] text-gray-500">
                Sfat: Foloseste separatorul `|` si include rolul dorit + stiva tehnica principala.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditHeadlineModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
              >
                Anuleaza
              </button>
              <button
                type="button"
                onClick={handleSaveHeadline}
                disabled={!tempHeadline.trim()}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-black text-white hover:bg-neutral-800 transition cursor-pointer disabled:opacity-50"
              >
                Salveaza in Profil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ABOUT MODAL */}
      {editAboutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-gray-200 w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-950 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#0a66c2]" />
                Editeaza Sectiunea About (Despre)
              </h3>
              <button 
                onClick={() => setEditAboutModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-black transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">Rezumat Profesional</label>
              <textarea
                value={tempAbout}
                onChange={(e) => setTempAbout(e.target.value)}
                rows={10}
                className="w-full p-3 text-xs text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black leading-relaxed"
                placeholder="Scrie povestea ta profesionala, proiectele realizate si datele de contact..."
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditAboutModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
              >
                Anuleaza
              </button>
              <button
                type="button"
                onClick={handleSaveAbout}
                disabled={!tempAbout.trim()}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-black text-white hover:bg-neutral-800 transition cursor-pointer disabled:opacity-50"
              >
                Salveaza in Profil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTACT INFO MODAL */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-gray-200 w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-950 flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-[#0a66c2]" />
                Informatii de Contact (Contact Info)
              </h3>
              <button 
                onClick={() => setContactModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-black transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" /> Adresa Email
                </span>
                <p className="text-sm font-bold text-gray-900 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                  {profile?.email || 'sarbumihai0@gmail.com'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" /> Numar de Telefon
                </span>
                <p className="text-sm font-bold text-gray-900 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                  {profile?.phone || '(+40) 723 034 706'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Linkedin className="w-3.5 h-3.5 text-[#0a66c2]" /> Profil LinkedIn
                </span>
                <a 
                  href={profile?.linkedinUrl || 'https://www.linkedin.com/in/sirbu-mihai'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#0a66c2] hover:underline bg-blue-50/50 p-2.5 rounded-xl border border-blue-200 flex items-center justify-between"
                >
                  <span className="truncate">{profile?.linkedinUrl || 'www.linkedin.com/in/sirbu-mihai'}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> Locatie
                </span>
                <p className="text-sm font-bold text-gray-900 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                  {profile?.location || 'Bucuresti, Romania'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setContactModalOpen(false)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-black text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              Inchide
            </button>
          </div>
        </div>
      )}

      {/* ADD CUSTOM SKILL MODAL */}
      {addSkillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-gray-200 w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-950 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#0a66c2]" />
                Adauga Aptitudine Manuala
              </h3>
              <button 
                onClick={() => setAddSkillModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-black transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualAddSkill} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Denumire Aptitudine / Tehnologie</label>
                <input
                  type="text"
                  value={newSkillText}
                  onChange={(e) => setNewSkillText(e.target.value)}
                  placeholder="Ex: Docker, Spring Boot, PostgreSQL, Git..."
                  className="w-full px-3.5 py-2.5 text-xs font-bold bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddSkillModalOpen(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
                >
                  Anuleaza
                </button>
                <button
                  type="submit"
                  disabled={!newSkillText.trim()}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-black text-white hover:bg-neutral-800 transition cursor-pointer disabled:opacity-50"
                >
                  Salveaza in Profil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
