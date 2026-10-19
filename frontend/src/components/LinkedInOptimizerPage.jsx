import React, { useState, useEffect } from 'react';
import {
  Upload,
  Sparkles,
  Check,
  Copy,
  Edit3,
  Plus,
  ShieldCheck,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Award,
  Flame,
  Lightbulb,
  X,
  RefreshCw,
  Eye,
  CheckSquare,
  Terminal,
  FolderGit2,
  FileText,
  Download,
  Target,
  Linkedin
} from 'lucide-react';
import Card from './ui/Card';
import Modal from './ui/Modal';
import ProfileBanner from './linkedin/ProfileBanner';
import ScoreSummary from './linkedin/ScoreSummary';
import ActionPlan from './linkedin/ActionPlan';
import { BANNER_TEMPLATES, DEFAULT_BANNER_TEMPLATE, loadBannerFonts, renderBannerBlob } from './linkedin/bannerCanvas';

const DEFAULT_HEADLINE = 'Junior Software Engineer | Java 21 & Spring Boot 3 | UPB Automatică & Calculatoare';

const TABS = [
  { id: 'action_plan', label: 'Plan', icon: CheckSquare },
  { id: 'headlines', label: 'Headline', icon: Lightbulb },
  { id: 'about', label: 'Despre', icon: Edit3 },
  { id: 'star_projects', label: 'Proiecte STAR', icon: FolderGit2 },
  { id: 'boolean_search', label: 'Căutare recruiter', icon: Terminal },
  { id: 'skills', label: 'Skills piață', icon: Flame },
  { id: 'tips', label: 'Sfaturi', icon: Award },
];

const inputClass =
  'w-full px-3.5 py-2.5 text-sm bg-white text-neutral-900 border border-neutral-300 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100';
const primaryButton =
  'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-brand-500 hover:bg-brand-600 text-white transition cursor-pointer disabled:opacity-50';
const secondaryButton =
  'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 transition cursor-pointer disabled:opacity-50';
const iconButton = 'p-1.5 rounded-lg text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 transition cursor-pointer';

function SectionHeading({ title, hint, onAdd, addLabel, action }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="font-serif text-lg font-medium text-neutral-950 leading-tight">{title}</h3>
        {hint && <p className="text-sm text-neutral-500 mt-0.5">{hint}</p>}
      </div>
      {action}
      {onAdd && (
        <button type="button" onClick={onAdd} aria-label={addLabel} className={`${iconButton} shrink-0`}>
          <Plus className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function CopyButton({ text, copyKey, copiedKey, onCopy, label = 'Copiază' }) {
  const copied = copiedKey === copyKey;
  return (
    <button
      type="button"
      onClick={() => onCopy(text, copyKey)}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 cursor-pointer shrink-0"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copiat' : label}
    </button>
  );
}

export default function LinkedInOptimizerPage({ currentUser }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [targetDomain] = useState('BACKEND');
  const [profileMode, setProfileMode] = useState('all_star'); // 'current' | 'all_star'

  // Modale & interactiuni
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [addSkillModalOpen, setAddSkillModalOpen] = useState(false);
  const [newSkillText, setNewSkillText] = useState('');
  const [editHeadlineModalOpen, setEditHeadlineModalOpen] = useState(false);
  const [tempHeadline, setTempHeadline] = useState('');
  const [editAboutModalOpen, setEditAboutModalOpen] = useState(false);
  const [tempAbout, setTempAbout] = useState('');
  const [selectedAboutVariant, setSelectedAboutVariant] = useState('technical');
  const [bannerTemplate, setBannerTemplate] = useState(DEFAULT_BANNER_TEMPLATE);
  const [bannerError, setBannerError] = useState(false);
  const [activeTab, setActiveTab] = useState('action_plan');
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
      alert('Nu ai niciun CV în bibliotecă pentru a sincroniza.');
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
      alert('A apărut o eroare la sincronizare.');
    } finally {
      setSyncingCv(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Încarcă un fișier PDF exportat din LinkedIn.');
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

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Nu s-a putut copia în clipboard:', err);
      return;
    }
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

  const openHeadlineEditor = () => {
    setTempHeadline(profile?.headline || '');
    setEditHeadlineModalOpen(true);
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

  // Banner: textul vine din headline-ul si stack-ul profilului afisat
  const bannerHeadline = profile?.headline || DEFAULT_HEADLINE;
  const bannerStack = profile?.skills || [];

  const handleDownloadBanner = async () => {
    setBannerError(false);
    try {
      await loadBannerFonts();
      const blob = await renderBannerBlob({ template: bannerTemplate, headline: bannerHeadline, stack: bannerStack });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `banner-linkedin-${bannerTemplate}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error('Eroare la generarea bannerului:', err);
      setBannerError(true);
    }
  };

  const userEmail = profile?.email || 'sarbumihai0@gmail.com';
  const aboutVariants = [
    {
      id: 'technical',
      label: 'Tehnic și detaliat',
      badge: 'Backend',
      text: optimizationResult?.optimizedAbout || `Inginer software la început de drum, student la Facultatea de Automatică și Calculatoare din cadrul Universității POLITEHNICA din București. Lucrez în principal pe dezvoltare backend și arhitectura aplicațiilor folosind Java și ecosistemul Spring Boot.

În proiectele mele mă concentrez pe scrierea de cod modular și ușor de întreținut, proiectarea de baze de date relaționale (PostgreSQL, Microsoft SQL Server) și containerizarea serviciilor cu Docker. Recent am dezvoltat ATS Job Tracker, o platformă full-stack cu backend în Spring Boot 3, persistență în PostgreSQL cu extensia pgvector pentru căutare semantică, frontend în React și deployment containerizat. Anterior, am activat ca Software Engineering Intern la SIMAVI, unde am lucrat pe întregul ciclu de dezvoltare (SDLC) pentru aplicații enterprise în Java.

Sunt deschis pentru oportunități de Junior Software Engineer sau Junior Backend Developer, unde pot contribui tehnic și pot aprofunda sisteme distribuite de înaltă performanță.

Contact: ${userEmail} | București, România`
    },
    {
      id: 'concise',
      label: 'Concis și direct',
      badge: 'Scurt',
      text: `Student în anul final la Automatică și Calculatoare (UPB), pasionat de inginerie software și dezvoltare backend. Experiența mea practică include atât stagiu de practică ca Software Engineering Intern (SIMAVI), cât și proiecte software complete dezvoltate de la zero.

Stiva tehnică principală: Java 21, Spring Boot 3, PostgreSQL, Docker, Git, REST APIs și baze de date relaționale. Îmi place să lucrez la optimizarea interogărilor SQL, structura curată a serviciilor și integrarea de soluții moderne, precum căutarea vectorială în PostgreSQL (pgvector).

Urmăresc un rol de Junior Software Engineer / Backend Developer într-o echipă tehnică care pune accent pe bune practici, clean code și colaborare solidă.

Email: ${userEmail}`
    },
    {
      id: 'english',
      label: 'Internațional (engleză)',
      badge: 'Global',
      text: `Software engineer and Computer Science student at University POLITEHNICA of Bucharest (Faculty of Automatic Control and Computers), focused on backend engineering, RESTful APIs, and database performance.

My primary technical stack revolves around Java, Spring Boot, relational databases (PostgreSQL, SQL Server), and Docker. I care deeply about writing clean, maintainable code, structuring scalable database schemas, and understanding systems down to query execution and memory management.

Key projects include ATS Job Tracker, an open-source platform built with Spring Boot 3, PostgreSQL (pgvector), React, and Docker, featuring automated web scrapers and semantic candidate matching. Previously, as a Software Engineering Intern at SIMAVI, I contributed to full-stack Java/Spring enterprise solutions across the complete SDLC.

Currently open to Junior Software Engineer, Junior Backend Developer, and Software Developer roles.

Reach out directly at: ${userEmail}`
    }
  ];
  const currentAboutVariant = aboutVariants.find(v => v.id === selectedAboutVariant) || aboutVariants[0];

  const initials = profile?.fullName
    ? profile.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'SM';

  return (
    <div className="space-y-6 pb-16 text-neutral-900">

      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="flex gap-1 p-1 rounded-xl bg-neutral-100" role="group" aria-label="Profil afișat">
          <button
            type="button"
            onClick={loadAllStarProfile}
            aria-pressed={profileMode === 'all_star'}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer flex items-center gap-1.5 ${
              profileMode === 'all_star' ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-600 hover:text-neutral-950'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            All-Star
          </button>
          <button
            type="button"
            onClick={loadDemoProfile}
            aria-pressed={profileMode === 'current'}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer flex items-center gap-1.5 ${
              profileMode === 'current' ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-600 hover:text-neutral-950'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Profil curent
          </button>
        </div>
        <button type="button" onClick={() => triggerOptimization()} disabled={optimizing} className={secondaryButton}>
          <RefreshCw className={`w-4 h-4 ${optimizing ? 'animate-spin' : ''}`} />
          Reevaluează
        </button>
      </div>

      {/* SINCRONIZARE CV & INCARCARE PDF */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-600" />
            <h2 className="text-sm font-medium text-neutral-900">Sincronizează cu un CV</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedCvId}
              onChange={(e) => setSelectedCvId(e.target.value)}
              aria-label="CV pentru sincronizare"
              className={`${inputClass} min-w-0 cursor-pointer`}
            >
              {cvList.length > 0 ? (
                cvList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title || 'CV fără titlu'}{c.isPrimary ? ' (principal)' : ''}
                  </option>
                ))
              ) : (
                <option value="">Niciun CV în bibliotecă</option>
              )}
            </select>
            <button type="button" onClick={handleSyncWithSelectedCv} disabled={syncingCv} className={`${primaryButton} whitespace-nowrap`}>
              {syncingCv ? 'Se sincronizează...' : 'Sincronizează'}
              <Sparkles className={`w-4 h-4 ${syncingCv ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {syncMessage && (
            <div role="status" className="flex items-start justify-between gap-3 text-sm text-neutral-700">
              <div className="min-w-0">
                <p className="font-medium text-neutral-900">{syncMessage.text}</p>
                {syncMessage.imported.length > 0 && (
                  <ul className="flex flex-wrap gap-1.5 mt-1.5">
                    {syncMessage.imported.map((item, idx) => (
                      <li key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-xs">
                        <Check className="w-3 h-3 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button type="button" onClick={() => setSyncMessage(null)} aria-label="Închide mesajul" className={iconButton}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </Card>

        <Card
          padding="p-5"
          className={`border-dashed transition cursor-pointer flex items-center gap-3 ${dragOver ? 'border-brand-500 bg-brand-50' : 'hover:border-brand-300'}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => document.getElementById('linkedin-pdf-input')?.click()}
        >
          <input
            type="file"
            id="linkedin-pdf-input"
            accept=".pdf"
            className="hidden"
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />
          <span className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <Upload className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-900">
              {loading ? 'Se analizează PDF-ul...' : 'Încarcă PDF-ul din LinkedIn'}
            </p>
            <p className="text-xs text-neutral-500">Trage fișierul aici sau apasă. Din LinkedIn: More, apoi Save to PDF.</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* STANGA: PREVIZUALIZARE PROFIL */}
        <div className="lg:col-span-7 space-y-4 min-w-0">

          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-lg font-medium text-neutral-950">Banner</h2>
            <div className="flex flex-wrap items-center gap-2">
              <div role="radiogroup" aria-label="Șablon banner" className="flex gap-1 p-1 rounded-xl bg-neutral-100">
                {BANNER_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    role="radio"
                    aria-checked={bannerTemplate === template.id}
                    onClick={() => setBannerTemplate(template.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                      bannerTemplate === template.id ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-600 hover:text-neutral-950'
                    }`}
                  >
                    {template.label}
                  </button>
                ))}
              </div>
              <button type="button" onClick={handleDownloadBanner} className={primaryButton}>
                <Download className="w-4 h-4" />
                Descarcă PNG
              </button>
            </div>
          </div>
          {bannerError && <p role="alert" className="text-sm text-red-600">Nu s-a putut genera bannerul. Încearcă din nou.</p>}

          {/* CARD PROFIL */}
          <Card padding="p-0" className="overflow-hidden">
            <ProfileBanner template={bannerTemplate} headline={bannerHeadline} stack={bannerStack} />

            <div className="px-5 sm:px-6 pb-6">
              <div className="flex justify-between items-end pt-4 mb-3">
                <div className="relative">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-brand-500 text-white flex items-center justify-center font-serif text-3xl sm:text-4xl">
                    {initials}
                  </div>
                  {profile?.isOpenToWork && (
                    <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-medium border-2 border-white">
                      Open to Work
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <h2 className="font-serif text-2xl text-neutral-950">{profile?.fullName || 'Sirbu Mihai'}</h2>
                <ShieldCheck className="w-5 h-5 text-brand-500" aria-label="Verificat" />
              </div>

              <div className="flex items-start justify-between gap-3 mt-1">
                <p className="text-sm text-neutral-800 leading-relaxed">{profile?.headline || DEFAULT_HEADLINE}</p>
                <button type="button" onClick={openHeadlineEditor} aria-label="Editează headline-ul" className={`${iconButton} shrink-0`}>
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              {profile?.isCreatorMode && (
                <p className="text-sm text-brand-600 mt-1">
                  {profile.creatorTopics ? profile.creatorTopics.join(' ') : '#java #springboot #backend #algorithms #softwareengineering'}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500 mt-1.5">
                <span>{profile?.location || 'București, România'}</span>
                <span aria-hidden="true">·</span>
                <button type="button" onClick={() => setContactModalOpen(true)} className="text-brand-600 hover:text-brand-700 font-medium cursor-pointer">
                  Contact
                </button>
                <span aria-hidden="true">·</span>
                <span>{profile?.connectionsCount || '500+ conexiuni'}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-4">
                <button
                  type="button"
                  onClick={toggleOpenToWork}
                  aria-pressed={!!profile?.isOpenToWork}
                  className={profile?.isOpenToWork ? 'px-4 py-1.5 rounded-full text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer' : `${primaryButton} !rounded-full !py-1.5`}
                >
                  {profile?.isOpenToWork ? 'Open to Work activ' : 'Open to Work'}
                </button>
                <button
                  type="button"
                  onClick={toggleCreatorMode}
                  aria-pressed={!!profile?.isCreatorMode}
                  className={`${secondaryButton} !rounded-full !py-1.5`}
                >
                  {profile?.isCreatorMode ? 'Creator Mode pornit' : 'Pornește Creator Mode'}
                </button>
                <button type="button" onClick={openHeadlineEditor} className={`${secondaryButton} !rounded-full !py-1.5`}>
                  <Edit3 className="w-3.5 h-3.5" />
                  Editează profilul
                </button>
              </div>
            </div>
          </Card>

          {/* FEATURED */}
          <Card className="space-y-4">
            <SectionHeading title="Featured" hint="Proiecte GitHub, demo-uri live și CV PDF." onAdd={() => setActiveTab('action_plan')} addLabel="Adaugă în Featured" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {profile?.featured && profile.featured.length > 0 ? (
                profile.featured.map((item, idx) => (
                  <div key={idx} className="rounded-xl bg-neutral-50 p-3.5 flex flex-col justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-[11px] font-medium text-brand-700">{item.badge}</span>
                      <h4 className="text-sm font-medium text-neutral-900 leading-snug line-clamp-2">{item.title}</h4>
                      <p className="text-xs text-neutral-500">{item.subtitle}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium text-brand-600">
                      <span>{item.type === 'LINK' ? 'Deschide linkul' : item.type === 'DOCUMENT' ? 'Descarcă PDF' : 'Vezi postarea'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="sm:col-span-3 text-sm text-neutral-400">Adaugă proiectele de pe GitHub în Featured.</p>
              )}
            </div>
          </Card>

          {/* ABOUT */}
          <Card className="space-y-3">
            <SectionHeading
              title="Despre"
              action={
                <button
                  type="button"
                  onClick={() => { setTempAbout(profile?.about || ''); setEditAboutModalOpen(true); }}
                  aria-label="Editează secțiunea Despre"
                  className={`${iconButton} shrink-0`}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              }
            />
            {profile?.about && profile.about.trim().length > 0 ? (
              <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">{profile.about}</p>
            ) : (
              <button type="button" onClick={() => setActiveTab('about')} className="text-sm text-brand-600 hover:text-brand-700 cursor-pointer">
                Adaugă secțiunea Despre
              </button>
            )}
          </Card>

          {/* EXPERIENCE */}
          <Card className="space-y-4">
            <SectionHeading title="Experiență" hint="Internship-uri și proiecte în echipă." onAdd={() => setActiveTab('action_plan')} addLabel="Adaugă experiență" />
            <div className="divide-y divide-neutral-100">
              {profile?.experience && profile.experience.length > 0 ? (
                profile.experience.map((exp, idx) => (
                  <div key={idx} className={`space-y-1.5 ${idx > 0 ? 'pt-4' : ''} ${idx < profile.experience.length - 1 ? 'pb-4' : ''}`}>
                    <h4 className="text-sm font-medium text-neutral-950">{exp.title}</h4>
                    <p className="text-sm text-neutral-700">{exp.company}</p>
                    <p className="text-xs text-neutral-400">{exp.period} · {exp.location}</p>
                    <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line pt-1">{exp.description}</p>
                  </div>
                ))
              ) : (
                <button type="button" onClick={handleSyncWithSelectedCv} className="text-sm text-brand-600 hover:text-brand-700 cursor-pointer">
                  Nicio experiență listată. Importă din CV.
                </button>
              )}
            </div>
          </Card>

          {/* PROJECTS */}
          <Card className="space-y-4">
            <SectionHeading title="Proiecte" hint="Formule STAR pentru proiectele tehnice." onAdd={() => setActiveTab('star_projects')} addLabel="Adaugă proiect" />
            <div className="divide-y divide-neutral-100">
              {profile?.projects && profile.projects.length > 0 ? (
                profile.projects.map((proj, idx) => (
                  <div key={idx} className={`space-y-2 ${idx > 0 ? 'pt-4' : ''} ${idx < profile.projects.length - 1 ? 'pb-4' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium text-neutral-950">{proj.title}</h4>
                        <p className="text-xs text-neutral-400">{proj.timePeriod} · {proj.associatedWith}</p>
                      </div>
                      {proj.url && (
                        <a href={proj.url} target="_blank" rel="noreferrer" className={`${secondaryButton} !px-3 !py-1.5 text-xs shrink-0`}>
                          <FolderGit2 className="w-3.5 h-3.5" />
                          Proiect
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 leading-relaxed">{proj.description}</p>
                    {proj.skills && proj.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {proj.skills.map((sk, sidx) => (
                          <span key={sidx} className="text-xs px-2 py-0.5 rounded-md bg-brand-50 text-brand-700">{sk}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <button type="button" onClick={() => setActiveTab('star_projects')} className="text-sm text-brand-600 hover:text-brand-700 cursor-pointer">
                  Adaugă proiecte în format STAR
                </button>
              )}
            </div>
          </Card>

          {/* EDUCATION */}
          <Card className="space-y-4">
            <SectionHeading title="Studii" />
            <div className="divide-y divide-neutral-100">
              {profile?.education && profile.education.length > 0 ? (
                profile.education.map((edu, idx) => (
                  <div key={idx} className={`flex items-start gap-3.5 ${idx > 0 ? 'pt-4' : ''} ${idx < profile.education.length - 1 ? 'pb-4' : ''}`}>
                    <span className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center text-xs font-medium shrink-0">
                      {edu.logoBadge || 'UP'}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium text-neutral-950">{edu.institution}</h4>
                      <p className="text-sm text-neutral-600">{edu.degree}</p>
                      <p className="text-xs text-neutral-400">{edu.period}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-start gap-3.5">
                  <span className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center text-xs font-medium shrink-0">UP</span>
                  <div>
                    <h4 className="text-sm font-medium text-neutral-950">Universitatea POLITEHNICA din București</h4>
                    <p className="text-sm text-neutral-600">Informatică</p>
                    <p className="text-xs text-neutral-400">octombrie 2022 – iulie 2026</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* SKILLS */}
          <Card className="space-y-4">
            <SectionHeading
              title="Competențe"
              hint={`${profile?.skills?.length || 0} competențe. Fixează primele 3 (Java, Spring Boot, SQL).`}
              action={
                <button type="button" onClick={() => setAddSkillModalOpen(true)} className={`${secondaryButton} !px-3 !py-1.5 shrink-0`}>
                  <Plus className="w-3.5 h-3.5" />
                  Adaugă
                </button>
              }
            />
            {profile?.skills && profile.skills.length > 0 ? (
              <ul className="divide-y divide-neutral-100">
                {profile.skills.map((sk, idx) => (
                  <li key={idx} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm text-neutral-900">{sk}</span>
                      {idx < 3 && <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-brand-50 text-brand-700">Fixat {idx + 1}</span>}
                    </div>
                    <button type="button" onClick={() => removeSkillFromProfile(sk)} aria-label={`Șterge ${sk}`} className={iconButton}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-400">Nicio competență listată încă.</p>
            )}
          </Card>

          {/* CERTIFICATIONS */}
          {profile?.certifications && profile.certifications.length > 0 && (
            <Card className="space-y-3">
              <SectionHeading title="Certificări" />
              <ul className="divide-y divide-neutral-100">
                {profile.certifications.map((cert, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                    <span className="flex items-center gap-2.5 text-sm text-neutral-900">
                      <Award className="w-4 h-4 text-neutral-400 shrink-0" />
                      {cert}
                    </span>
                    <span className="text-xs text-emerald-700">Verificat</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* LANGUAGES */}
          {profile?.languages && profile.languages.length > 0 && (
            <Card className="space-y-3">
              <SectionHeading title="Limbi" />
              <ul className="divide-y divide-neutral-100">
                {profile.languages.map((lang, idx) => (
                  <li key={idx} className="text-sm text-neutral-900 py-2 first:pt-0 last:pb-0">{lang}</li>
                ))}
              </ul>
            </Card>
          )}

        </div>

        {/* DREAPTA: SCOR SI SUGESTII */}
        <div className="lg:col-span-5 space-y-5 min-w-0">

          <ScoreSummary result={optimizationResult} />

          <div role="tablist" aria-label="Sugestii" className="flex flex-wrap gap-1 p-1 rounded-xl bg-neutral-100">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activeTab === id}
                onClick={() => setActiveTab(id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === id ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'action_plan' && (
            <ActionPlan
              steps={optimizationResult?.actionPlan}
              completed={completedSteps}
              onToggle={toggleStep}
              onCopy={copyToClipboard}
              copiedKey={copiedKey}
            />
          )}

          {activeTab === 'headlines' && (
            <Card className="space-y-4">
              <SectionHeading title="Headline-uri optimizate" hint="Maximum 220 de caractere." />
              <div className="space-y-3">
                {optimizationResult?.optimizedHeadlines?.map((h, i) => (
                  <div key={i} className={`rounded-xl p-4 space-y-2 ${h.recommended ? 'bg-brand-50' : 'bg-neutral-50'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-brand-700">{h.formulaName}</span>
                      {h.recommended && <span className="text-xs font-medium text-brand-700">Recomandat</span>}
                    </div>
                    <p className="text-sm font-medium text-neutral-950 leading-snug">{h.headline}</p>
                    <p className="text-xs text-neutral-500">{h.rationale}</p>
                    <div className="flex items-center gap-3 pt-1">
                      <button type="button" onClick={() => applyHeadline(h.headline)} className={`${primaryButton} !px-3 !py-1.5`}>
                        <Check className="w-3.5 h-3.5" />
                        Folosește
                      </button>
                      <CopyButton text={h.headline} copyKey={`h_${i}`} copiedKey={copiedKey} onCopy={copyToClipboard} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'about' && (
            <Card className="space-y-4">
              <SectionHeading title="Rezumat profesional" hint="Alege o variantă și aplic-o pe profil." />
              <div role="radiogroup" aria-label="Variantă Despre" className="flex flex-wrap gap-2">
                {aboutVariants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    role="radio"
                    aria-checked={selectedAboutVariant === variant.id}
                    onClick={() => setSelectedAboutVariant(variant.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                      selectedAboutVariant === variant.id ? 'bg-brand-500 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {variant.label}
                  </button>
                ))}
              </div>
              <p className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-800 leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto select-text">
                {currentAboutVariant.text}
              </p>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => applyAbout(currentAboutVariant.text)} className={`${primaryButton} flex-1`}>
                  <Check className="w-4 h-4" />
                  Folosește pe profil
                </button>
                <CopyButton text={currentAboutVariant.text} copyKey={`about_${currentAboutVariant.id}`} copiedKey={copiedKey} onCopy={copyToClipboard} label="Copiază textul" />
              </div>
            </Card>
          )}

          {activeTab === 'star_projects' && (
            <Card className="space-y-4">
              <SectionHeading title="Proiecte în format STAR" hint="Realizat [X], măsurat prin [Y], făcând [Z]." />
              <div className="space-y-3">
                {optimizationResult?.suggestedProjects?.map((proj, idx) => (
                  <div key={idx} className="rounded-xl bg-neutral-50 p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium text-neutral-950">{proj.title}</h4>
                        <span className="text-xs text-neutral-400">{proj.timePeriod}</span>
                      </div>
                      <CopyButton
                        text={`${proj.title}\n\n${proj.description}\n\nSkills: ${proj.skills.join(', ')}\nLink: ${proj.url}`}
                        copyKey={`proj_${idx}`}
                        copiedKey={copiedKey}
                        onCopy={copyToClipboard}
                      />
                    </div>
                    <p className="text-sm text-neutral-700 leading-relaxed">{proj.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {proj.skills.map((sk, sidx) => (
                        <span key={sidx} className="text-xs px-2 py-0.5 rounded-md bg-brand-50 text-brand-700">{sk}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'boolean_search' && (
            <Card className="space-y-4">
              <SectionHeading title="Căutări de recruiter" hint="Cum te găsesc recruiterii în LinkedIn Recruiter." />
              <div className="space-y-3">
                {optimizationResult?.recruiterQueries?.map((q, idx) => (
                  <div key={idx} className="rounded-xl bg-neutral-50 p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-sm font-medium text-neutral-950">{q.roleTarget}</h4>
                      <CopyButton text={q.booleanString} copyKey={`bq_${idx}`} copiedKey={copiedKey} onCopy={copyToClipboard} label="Copiază query" />
                    </div>
                    <code className="block rounded-lg bg-neutral-900 text-neutral-100 text-xs leading-relaxed p-3 break-words select-all">
                      {q.booleanString}
                    </code>
                    <p className="text-xs text-neutral-600">{q.explanation}</p>
                    <p className="flex items-start gap-1.5 text-xs text-neutral-700">
                      <Target className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                      <span>{q.whyYouMatch}</span>
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'skills' && (
            <Card className="space-y-4">
              <SectionHeading title="Competențe cerute pe piață" hint="Lipsesc din profilul tău." />
              <ul className="space-y-2">
                {optimizationResult?.recommendedSkills?.map((sk) => (
                  <li key={sk.skillName} className="rounded-xl bg-neutral-50 p-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-neutral-950">{sk.skillName}</span>
                        <span className="text-xs text-neutral-500">{sk.category}</span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {sk.rationale} · <span className="text-brand-600 font-medium">{sk.marketDemand}</span>
                      </p>
                    </div>
                    <button type="button" onClick={() => addSkillToProfile(sk.skillName)} className={`${secondaryButton} !px-3 !py-1.5 shrink-0`}>
                      <Plus className="w-3.5 h-3.5" />
                      Adaugă
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {activeTab === 'tips' && (
            <Card className="space-y-4">
              <SectionHeading title="Sfaturi de la recruiteri" hint="Cum treci de filtrele automate." />
              <div className="space-y-3">
                {optimizationResult?.recruiterTips?.map((tip) => (
                  <div key={tip.id} className="rounded-xl bg-neutral-50 p-4 space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-sm font-medium text-neutral-950">{tip.title}</h4>
                      <span className="text-xs text-brand-700 shrink-0">{tip.badge}</span>
                    </div>
                    <p className="text-sm text-neutral-600">{tip.description}</p>
                    <p className="text-xs text-neutral-700"><span className="font-medium">Cum faci:</span> {tip.actionAdvice}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

        </div>
      </div>

      {/* MODALE */}
      <Modal isOpen={editHeadlineModalOpen} onClose={() => setEditHeadlineModalOpen(false)} title="Editează headline-ul" icon={Edit3}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-sm">
              <label htmlFor="linkedin-headline-input" className="font-medium text-neutral-700">Headline</label>
              <span className={`text-xs tabular-nums ${tempHeadline.length > 220 ? 'text-red-600' : 'text-neutral-400'}`}>
                {tempHeadline.length} / 220
              </span>
            </div>
            <textarea
              id="linkedin-headline-input"
              value={tempHeadline}
              onChange={(e) => setTempHeadline(e.target.value)}
              rows={3}
              className={inputClass}
              placeholder="Ex: Junior Software Engineer | Java 21 & Spring Boot | Student UPB"
            />
            <p className="text-xs text-neutral-500">Folosește separatorul | și include rolul dorit și stiva principală.</p>
          </div>
          <div className="flex items-center gap-2.5">
            <button type="button" onClick={() => setEditHeadlineModalOpen(false)} className={`${secondaryButton} flex-1`}>Anulează</button>
            <button type="button" onClick={handleSaveHeadline} disabled={!tempHeadline.trim()} className={`${primaryButton} flex-1`}>Salvează</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={editAboutModalOpen} onClose={() => setEditAboutModalOpen(false)} title="Editează secțiunea Despre" icon={Edit3} size="lg">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="linkedin-about-input" className="text-sm font-medium text-neutral-700">Rezumat profesional</label>
            <textarea
              id="linkedin-about-input"
              value={tempAbout}
              onChange={(e) => setTempAbout(e.target.value)}
              rows={10}
              className={inputClass}
              placeholder="Povestea ta profesională, proiectele realizate și datele de contact"
            />
          </div>
          <div className="flex items-center gap-2.5">
            <button type="button" onClick={() => setEditAboutModalOpen(false)} className={`${secondaryButton} flex-1`}>Anulează</button>
            <button type="button" onClick={handleSaveAbout} disabled={!tempAbout.trim()} className={`${primaryButton} flex-1`}>Salvează</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={contactModalOpen} onClose={() => setContactModalOpen(false)} title="Date de contact" icon={Linkedin}>
        <div className="space-y-4">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="flex items-center gap-1.5 text-xs text-neutral-500"><Mail className="w-3.5 h-3.5" /> Email</dt>
              <dd className="mt-0.5 font-medium text-neutral-900 break-all">{profile?.email || 'sarbumihai0@gmail.com'}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs text-neutral-500"><Phone className="w-3.5 h-3.5" /> Telefon</dt>
              <dd className="mt-0.5 font-medium text-neutral-900">{profile?.phone || '(+40) 723 034 706'}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs text-neutral-500"><Linkedin className="w-3.5 h-3.5" /> Profil LinkedIn</dt>
              <dd className="mt-0.5">
                <a
                  href={profile?.linkedinUrl || 'https://www.linkedin.com/in/sirbu-mihai'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-brand-600 hover:text-brand-700 break-all"
                >
                  {profile?.linkedinUrl || 'www.linkedin.com/in/sirbu-mihai'}
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs text-neutral-500"><MapPin className="w-3.5 h-3.5" /> Locație</dt>
              <dd className="mt-0.5 font-medium text-neutral-900">{profile?.location || 'București, România'}</dd>
            </div>
          </dl>
          <button type="button" onClick={() => setContactModalOpen(false)} className={`${primaryButton} w-full`}>Închide</button>
        </div>
      </Modal>

      <Modal isOpen={addSkillModalOpen} onClose={() => setAddSkillModalOpen(false)} title="Adaugă competență" icon={Plus}>
        <form onSubmit={handleManualAddSkill} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="linkedin-skill-input" className="text-sm font-medium text-neutral-700">Competență sau tehnologie</label>
            <input
              id="linkedin-skill-input"
              type="text"
              value={newSkillText}
              onChange={(e) => setNewSkillText(e.target.value)}
              placeholder="Ex: Docker, Spring Boot, PostgreSQL"
              className={inputClass}
              autoFocus
            />
          </div>
          <div className="flex items-center gap-2.5">
            <button type="button" onClick={() => setAddSkillModalOpen(false)} className={`${secondaryButton} flex-1`}>Anulează</button>
            <button type="submit" disabled={!newSkillText.trim()} className={`${primaryButton} flex-1`}>Salvează</button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
