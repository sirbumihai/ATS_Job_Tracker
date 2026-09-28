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
  Briefcase
} from 'lucide-react';

export default function LinkedInOptimizerPage({ currentUser }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [targetDomain, setTargetDomain] = useState('BACKEND');
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [addSkillModalOpen, setAddSkillModalOpen] = useState(false);
  const [newSkillText, setNewSkillText] = useState('');
  const [activeTab, setActiveTab] = useState('headlines'); // 'headlines', 'about', 'skills', 'tips'

  // Încarcă automat profilul demonstrativ Sirbu Mihai la pornire
  useEffect(() => {
    loadDemoProfile();
  }, []);

  const loadDemoProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/linkedin/demo-profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        triggerOptimization(data);
      }
    } catch (err) {
      console.error('Eroare la încărcarea profilului demonstrativ:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Te rugăm să încarci un fișier PDF exportat din LinkedIn.');
      return;
    }

    setLoading(true);
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
        alert('Nu am putut citi fișierul PDF. Asigură-te că este un export PDF valid LinkedIn.');
      }
    } catch (err) {
      console.error('Eroare la upload PDF:', err);
      alert('A apărut o eroare la încărcarea fișierului PDF.');
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

  const handleManualAddSkill = (e) => {
    e.preventDefault();
    if (newSkillText.trim()) {
      addSkillToProfile(newSkillText.trim());
      setNewSkillText('');
      setAddSkillModalOpen(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-300';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-300';
    if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-300';
    return 'text-rose-600 bg-rose-50 border-rose-300';
  };

  return (
    <div className="space-y-8 pb-16 font-sans">
      
      {/* HERO BANNER & 3-STEP GUIDE */}
      <section className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-gradient-to-bl from-blue-100/50 via-sky-50/30 to-transparent rounded-full pointer-events-none blur-2xl"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-[#0077b5]/10 text-[#0077b5] border border-[#0077b5]/20">
              <Linkedin className="w-3.5 h-3.5 fill-[#0077b5]" />
              Optimizator Profil LinkedIn & Audit Recruiter AI
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-gray-950 tracking-tight leading-tight">
              Cum să ai un Profil LinkedIn <span className="text-[#0a66c2] underline decoration-blue-200 decoration-wavy">Magnet pentru Recruiteri</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Exportă profilul direct din LinkedIn în format PDF, vezi replica vizuală a paginii tale și primești recomandări de optimizare cu cuvinte cheie ATS, headline-uri dovedite și bune practici pentru România și Europa.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            <button
              onClick={loadDemoProfile}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-[#0a66c2] transition border border-blue-200 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Încarcă Profil Demo (Sirbu Mihai)
            </button>
            <button
              onClick={() => triggerOptimization()}
              disabled={optimizing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#0a66c2] hover:bg-[#004182] text-white transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${optimizing ? 'animate-spin' : ''}`} />
              Re-evaluează cu AI
            </button>
          </div>
        </div>

        {/* 3-STEP EXPLANATION STRIP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100">
          <div className="bg-gray-50/90 border border-gray-200/80 p-4 rounded-2xl flex items-start gap-3.5">
            <span className="w-7 h-7 rounded-xl bg-black text-white font-black text-xs flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <p className="text-xs font-black text-gray-900 uppercase tracking-wide">Open the Resources menu</p>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Pe profilul tău LinkedIn, apasă pe butonul <strong className="text-gray-900">„Resources”</strong> (sau „More / Mai multe” de sub headline).
              </p>
            </div>
          </div>

          <div className="bg-gray-50/90 border border-gray-200/80 p-4 rounded-2xl flex items-start gap-3.5">
            <span className="w-7 h-7 rounded-xl bg-black text-white font-black text-xs flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <p className="text-xs font-black text-gray-900 uppercase tracking-wide">Choose „Save to PDF”</p>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                LinkedIn descarcă instant un export complet și curat în format PDF al întregului tău profil.
              </p>
            </div>
          </div>

          <div className="bg-blue-50/60 border border-blue-200/80 p-4 rounded-2xl flex items-start gap-3.5">
            <span className="w-7 h-7 rounded-xl bg-[#0a66c2] text-white font-black text-xs flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <p className="text-xs font-black text-blue-950 uppercase tracking-wide">Drop the file above</p>
              <p className="text-xs text-blue-900 mt-1 leading-relaxed">
                Trage PDF-ul descărcat în zona de mai jos — îți reconstruim profilul și îl audităm în câteva secunde.
              </p>
            </div>
          </div>
        </div>

        {/* DRAG & DROP UPLOAD BOX */}
        <div 
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
          className={`mt-6 p-6 rounded-2xl border-2 border-dashed transition flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer ${
            dragOver 
              ? 'border-[#0a66c2] bg-blue-50/50' 
              : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
          }`}
          onClick={() => document.getElementById('linkedin-pdf-input')?.click()}
        >
          <input 
            type="file" 
            id="linkedin-pdf-input" 
            className="hidden" 
            accept=".pdf" 
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }} 
          />
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-100/70 text-[#0a66c2] flex items-center justify-center shrink-0">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                Încarcă PDF-ul descărcat din LinkedIn (sau trage fișierul aici)
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Format acceptat: <strong className="text-gray-700">.pdf</strong> generat oficial de LinkedIn prin funcția „Save to PDF”
              </p>
            </div>
          </div>

          <span className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-gray-300 text-gray-800 shadow-2xs hover:bg-gray-100 transition whitespace-nowrap">
            Selectează PDF
          </span>
        </div>
      </section>

      {/* TWO-COLUMN WORKSPACE: LEFT = LINKEDIN CLONE PREVIEW, RIGHT = AI OPTIMIZATION PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: PIXEL-PERFECT LINKEDIN UI (7/12) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                Preview Live Profil LinkedIn
              </h2>
            </div>
            <span className="text-xs text-gray-400 font-semibold">
              Replica Desktop Oficială
            </span>
          </div>

          {/* MAIN LINKEDIN CARD */}
          <div className="bg-white border border-gray-300 rounded-2xl shadow-xs overflow-hidden">
            
            {/* BANNER HEADER */}
            <div className="h-36 sm:h-44 bg-[#1d3557] relative w-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#1d3557] via-[#243e63] to-[#1d3557] opacity-90"></div>
              <button 
                title="Editează coperta"
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 flex items-center justify-center transition shadow-sm cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            {/* AVATAR + TOP BAR INFO */}
            <div className="px-6 pb-6 pt-0 relative">
              
              {/* AVATAR (CIRCULAR WITH SM) */}
              <div className="relative -mt-16 sm:-mt-20 mb-3 flex items-end justify-between">
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-[#1b2a41] border-4 border-white text-white font-black text-3xl sm:text-4xl flex items-center justify-center shadow-md select-none tracking-wider">
                  {profile?.fullName ? (
                    profile.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                  ) : 'SM'}
                </div>

                {/* INSTITUTION ROW ON THE RIGHT */}
                {profile?.education && profile.education.length > 0 && (
                  <div className="hidden sm:flex items-center gap-2 max-w-[240px] text-right">
                    <span className="text-xs font-bold text-gray-900 leading-tight">
                      {profile.education[0].institution}
                    </span>
                    <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-black text-gray-700 shrink-0">
                      {profile.education[0].logoBadge || 'UP'}
                    </div>
                  </div>
                )}
              </div>

              {/* NAME & VERIFICATION */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight">
                    {profile?.fullName || 'Sirbu Mihai'}
                  </h1>
                  <ShieldCheck className="w-5 h-5 text-gray-500 fill-gray-100" title="Verificat" />
                </div>

                {/* HEADLINE */}
                <p className="text-sm text-gray-800 font-normal leading-snug">
                  {profile?.headline || 'Student la Universitatea POLITEHNICA din Bucuresti'}
                </p>

                {/* LOCATION & CONTACT INFO */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 pt-1">
                  <span>{profile?.location || 'București, România'}</span>
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
                    {profile?.connectionsCount || '500+ connections'}
                  </a>
                </div>
              </div>

              {/* ACTION PILLS (OPEN TO, ADD PROFILE SECTION, ENHANCE PROFILE, RESOURCES) */}
              <div className="flex flex-wrap items-center gap-2 pt-4">
                <button className="px-4 py-1.5 rounded-full text-sm font-bold bg-[#0a66c2] hover:bg-[#004182] text-white transition shadow-2xs cursor-pointer">
                  Open to
                </button>
                <button className="px-4 py-1.5 rounded-full text-sm font-bold bg-white hover:bg-blue-50 text-[#0a66c2] border border-[#0a66c2] transition shadow-2xs cursor-pointer">
                  Add profile section
                </button>
                <button className="px-4 py-1.5 rounded-full text-sm font-bold bg-white hover:bg-blue-50 text-[#0a66c2] border border-[#0a66c2] transition shadow-2xs cursor-pointer">
                  Enhance profile
                </button>
                <button className="px-4 py-1.5 rounded-full text-sm font-bold bg-white hover:bg-gray-100 text-gray-600 border border-gray-400 transition shadow-2xs cursor-pointer">
                  Resources
                </button>
              </div>

            </div>
          </div>

          {/* ABOUT CARD */}
          <div className="bg-white border border-gray-300 rounded-2xl p-6 shadow-xs space-y-3 relative group">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-950">About</h3>
              <button 
                onClick={() => setActiveTab('about')}
                title="Editează secțiunea About"
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
                + Add an about summary (Apasă pentru a genera cu AI un rezumat profesional complet)
              </div>
            )}
          </div>

          {/* EDUCATION CARD */}
          <div className="bg-white border border-gray-300 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-950">Education</h3>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition cursor-pointer">
                  <Plus className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition cursor-pointer">
                  <Edit3 className="w-4 h-4" />
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
                    <h4 className="text-sm font-bold text-gray-900">Universitatea POLITEHNICA din București</h4>
                    <p className="text-xs text-gray-600">Informatică</p>
                    <p className="text-[11px] text-gray-400">octombrie 2022 – iulie 2026</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SKILLS CARD */}
          <div className="bg-white border border-gray-300 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-950">Skills</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setAddSkillModalOpen(true)}
                  className="px-3 py-1 rounded-full text-xs font-bold text-[#0a66c2] border border-[#0a66c2] hover:bg-blue-50 transition cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Skill
                </button>
                <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition cursor-pointer">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2.5 divide-y divide-gray-100">
              {profile?.skills && profile.skills.length > 0 ? (
                profile.skills.map((sk, idx) => (
                  <div key={idx} className={`flex items-center justify-between ${idx > 0 ? 'pt-2.5' : ''}`}>
                    <span className="text-xs font-bold text-gray-900">{sk}</span>
                    <span className="text-[11px] text-gray-400">Aptitudine listată</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">Nicio aptitudine listată încă.</p>
              )}
            </div>
          </div>

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
              <span className="text-xs font-bold text-gray-400">LinkedIn ATS Audit</span>
            </div>

            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 rounded-2xl bg-neutral-800/80 border border-neutral-700 flex flex-col items-center justify-center shrink-0">
                <span className="text-2xl font-black text-white">
                  {optimizationResult?.overallScore || 45}
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">din 100</span>
              </div>

              <div>
                <h3 className="text-sm font-black text-white leading-tight">
                  {optimizationResult?.scoreGrade || 'Nivel Mediu (Necesită Optimizare)'}
                </h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Profilurile optimizate complet obțin cu până la <strong className="text-blue-300">3.5x mai multe mesaje directe</strong> de la recruiteri IT din România.
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
                      <span>{val} / 25 pts</span>
                    </div>
                    <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          val >= 20 ? 'bg-emerald-500' : val >= 12 ? 'bg-blue-500' : 'bg-amber-500'
                        }`} 
                        style={{ width: `${(val / 25) * 100}%` }}
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
          <div className="bg-white border border-gray-200 rounded-2xl p-1.5 flex gap-1 shadow-xs">
            <button
              onClick={() => setActiveTab('headlines')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
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
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'about'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-500" />
              Secțiune About
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'skills'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              Skills Piață
            </button>
            <button
              onClick={() => setActiveTab('tips')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'tips'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-500" />
              Sfaturi Pro
            </button>
          </div>

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
                    Formule testate care apar în căutările recrutorilor IT din România.
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
                        Adoptă în Profil
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
                            Copiază
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
                    Secțiune 'About' Generată cu AI
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Structură pe 3 paragrafe: Pasiune, Competențe Tehnice și Obiectiv Profesional.
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
                      Adoptă în Profilul Live
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
                          Copiază Textul
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RECOMMENDED SKILLS FROM ROMANIAN MARKET */}
          {activeTab === 'skills' && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-950 uppercase tracking-wide flex items-center gap-2">
                    <Flame className="w-4 h-4 text-rose-500" />
                    Aptitudini Recomandate de Piață
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Tehnologii solicitate frecvent în rolurile de Junior din România care îți lipsesc din profil.
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
                      Adaugă
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RECRUITER STRATEGIC TIPS */}
          {activeTab === 'tips' && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-950 uppercase tracking-wide flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-500" />
                    Top 5 Strategii de la Recruiteri IT
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Trucuri verificate pentru a maximiza algoritmul LinkedIn Recruiter.
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

      {/* CONTACT INFO MODAL */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-gray-200 w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-950 flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-[#0a66c2]" />
                Informații de Contact (Contact Info)
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
                  <Mail className="w-3.5 h-3.5 text-blue-600" /> Adresă Email
                </span>
                <p className="text-sm font-bold text-gray-900 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                  {profile?.email || 'sarbumihai0@gmail.com'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Linkedin className="w-3.5 h-3.5 text-[#0a66c2]" /> Profil LinkedIn
                </span>
                <a 
                  href={profile?.linkedinUrl || 'https://www.linkedin.com/in/sirbu-mihai-86133b181'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#0a66c2] hover:underline bg-blue-50/50 p-2.5 rounded-xl border border-blue-200 flex items-center justify-between"
                >
                  <span className="truncate">{profile?.linkedinUrl || 'www.linkedin.com/in/sirbu-mihai-86133b181'}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> Locație
                </span>
                <p className="text-sm font-bold text-gray-900 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                  {profile?.location || 'București, România'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setContactModalOpen(false)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-black text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              Închide
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
                Adaugă Aptitudine Manuală
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
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={!newSkillText.trim()}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-black text-white hover:bg-neutral-800 transition cursor-pointer disabled:opacity-50"
                >
                  Salvează în Profil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
