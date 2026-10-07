import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StatsDashboard from './components/StatsDashboard';
import KanbanBoard from './components/KanbanBoard';
import CvLibrary from './components/CvLibrary';
import CvStudio from './components/CvStudio';
import JobSearchPage from './components/JobSearchPage';
import CoverLetterGenerator from './components/CoverLetterGenerator';
import GithubReadmeStudio from './components/GithubReadmeStudio';
import MarketInsightsPage from './components/MarketInsightsPage';
import LinkedInOptimizerPage from './components/LinkedInOptimizerPage';
import SkillRoadmapPage from './components/SkillRoadmapPage';
import LandingPage from './components/LandingPage';
import FeedbackPage from './components/FeedbackPage';
import { AuthModal, AddJobModal, UploadResumeModal, AiReportModal } from './components/Modals';
import { Plus, Upload } from 'lucide-react';

const TAB_METADATA = {
  tracker: {
    title: 'Tracker Aplicatii',
    subtitle: 'Pipeline Kanban & Monitorizare Status Joburi',
    category: 'Pipeline'
  },
  job_search: {
    title: 'Cautare Job-uri',
    subtitle: 'Agregator Multi-Platforma & Scraping in Timp Real',
    category: 'Piata IT'
  },
  market_insights: {
    title: 'Market Insights',
    subtitle: 'Cerinte Reale & Skill Match Piata IT',
    category: 'Piata IT'
  },
  cv_library: {
    title: 'CV-urile Mele',
    subtitle: 'Baza de Profiluri ATS & PDF Upload',
    category: 'Documente'
  },
  cv_studio: {
    title: 'Studio CV & Match 100%',
    subtitle: 'Editor Vizual & Generator PDF Vectorial ATS',
    category: 'Optimizare ATS'
  },
  cover_letter: {
    title: 'Generator Scrisori de Intentie',
    subtitle: 'Cover Letter Personalizat pe Cerintele Jobului',
    category: 'AI Assistant'
  },
  github_readme: {
    title: 'GitHub README Studio',
    subtitle: 'Profil Developer Autentic & Carduri Tehnice',
    category: 'Branding Dev'
  },
  linkedin_optimizer: {
    title: 'LinkedIn Profile Optimizer',
    subtitle: 'Import PDF, Replica Desktop & Audit 100/100 All-Star',
    category: 'LinkedIn'
  },
  skill_roadmap: {
    title: 'Roadmap & Pregatire Interviuri',
    subtitle: 'Resurse Gratuite & Banci de Intrebari Tehnice',
    category: 'Educatie'
  },
  landing: {
    title: 'Prezentare Platforma',
    subtitle: 'Sistem de Accelerare in Cariera & Pregatire Interviuri',
    category: 'JobFlow AI'
  },
  feedback: {
    title: 'Feedback & Roadmap',
    subtitle: 'Vocea Candidatilor & Sugestii de Imbunatatire',
    category: 'Comunitate'
  }
};

export default function App() {
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      // Root "/" or empty or "/landing" is the default landing page
      if (path === '/' || path === '' || path === '/landing' || path === '/home' || path === '/index.html') return 'landing';

      if (path.startsWith('/tracker') || path.startsWith('/kanban')) return 'tracker';
      if (path.startsWith('/roadmap') || path.startsWith('/skill-roadmap')) return 'skill_roadmap';
      if (path.startsWith('/linkedin') || path.startsWith('/linkedin-optimizer')) return 'linkedin_optimizer';
      if (path.startsWith('/job-search') || path.startsWith('/jobs')) return 'job_search';
      if (path.startsWith('/market-insights') || path.startsWith('/insights') || path.startsWith('/radar')) return 'market_insights';
      if (path.startsWith('/cv-library') || path.startsWith('/cv_library')) return 'cv_library';
      if (path.startsWith('/cv-studio') || path.startsWith('/cv_studio')) return 'cv_studio';
      if (path.startsWith('/cover-letter') || path.startsWith('/cover_letter')) return 'cover_letter';
      if (path.startsWith('/github-readme') || path.startsWith('/github_readme') || path.startsWith('/readme')) return 'github_readme';
      if (path.startsWith('/feedback') || path.startsWith('/sugestii')) return 'feedback';

      const hash = window.location.hash.toLowerCase();
      if (hash.includes('tracker') || hash.includes('kanban')) return 'tracker';
      if (hash.includes('roadmap')) return 'skill_roadmap';
      if (hash.includes('linkedin')) return 'linkedin_optimizer';
      if (hash.includes('job-search') || hash.includes('jobs')) return 'job_search';
      if (hash.includes('market-insights') || hash.includes('radar')) return 'market_insights';
      if (hash.includes('cv-library') || hash.includes('cv_library')) return 'cv_library';
      if (hash.includes('cv-studio') || hash.includes('cv_studio')) return 'cv_studio';
      if (hash.includes('cover-letter') || hash.includes('cover_letter')) return 'cover_letter';
      if (hash.includes('github-readme') || hash.includes('github_readme') || hash.includes('readme')) return 'github_readme';
      if (hash.includes('feedback')) return 'feedback';

      const stored = localStorage.getItem('ats_active_tab');
      if (stored === 'hero_showcase') return 'landing';
      if (stored === 'landing' || stored === 'feedback' || stored === 'skill_roadmap' || stored === 'linkedin_optimizer' || stored === 'job_search' || stored === 'market_insights' || stored === 'cv_library' || stored === 'cv_studio' || stored === 'cover_letter' || stored === 'github_readme' || stored === 'tracker') return stored;
      if (stored === 'kanban') return 'tracker';
    }
    return 'landing';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [selectedStudioCvId, setSelectedStudioCvId] = useState(null);
  const [selectedCoverLetterAppId, setSelectedCoverLetterAppId] = useState(null);

  // Sync tab with clean URL pathname and localStorage
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('ats_active_tab', tab);
      let targetPath = '/';
      if (tab === 'landing') targetPath = '/';
      else if (tab === 'tracker') targetPath = '/tracker';
      else if (tab === 'skill_roadmap') targetPath = '/roadmap';
      else if (tab === 'linkedin_optimizer') targetPath = '/linkedin-optimizer';
      else if (tab === 'job_search') targetPath = '/job-search';
      else if (tab === 'market_insights') targetPath = '/market-insights';
      else if (tab === 'cv_library') targetPath = '/cv-library';
      else if (tab === 'cv_studio') targetPath = '/cv-studio';
      else if (tab === 'cover_letter') targetPath = '/cover-letter';
      else if (tab === 'github_readme') targetPath = '/github-readme';
      else if (tab === 'feedback') targetPath = '/feedback';
      
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ tab }, '', targetPath);
      }
    }
  };

  const handleEditCvInStudio = (cvId) => {
    setSelectedStudioCvId(cvId);
    handleTabChange('cv_studio');
  };

  const handleOpenCoverLetterForApp = (appId) => {
    setSelectedCoverLetterAppId(appId);
    handleTabChange('cover_letter');
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
    // Redirect /landing to / if visited directly
    if (typeof window !== 'undefined' && window.location.pathname.toLowerCase().startsWith('/landing')) {
      window.history.replaceState({ tab: 'landing' }, '', '/');
    }
    // Redirect /kanban to /tracker if visited directly
    if (typeof window !== 'undefined' && window.location.pathname.toLowerCase().startsWith('/kanban')) {
      window.history.replaceState({ tab: 'tracker' }, '', '/tracker');
    }

    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/' || path === '' || path === '/landing' || path === '/home' || path === '/index.html') {
        setActiveTab('landing');
        localStorage.setItem('ats_active_tab', 'landing');
      } else if (path.startsWith('/tracker') || path.startsWith('/kanban')) {
        setActiveTab('tracker');
        localStorage.setItem('ats_active_tab', 'tracker');
      } else if (path.startsWith('/roadmap') || path.startsWith('/skill-roadmap')) {
        setActiveTab('skill_roadmap');
        localStorage.setItem('ats_active_tab', 'skill_roadmap');
      } else if (path.startsWith('/linkedin') || path.startsWith('/linkedin-optimizer')) {
        setActiveTab('linkedin_optimizer');
        localStorage.setItem('ats_active_tab', 'linkedin_optimizer');
      } else if (path.startsWith('/job-search') || path.startsWith('/jobs')) {
        setActiveTab('job_search');
        localStorage.setItem('ats_active_tab', 'job_search');
      } else if (path.startsWith('/market-insights') || path.startsWith('/insights') || path.startsWith('/radar')) {
        setActiveTab('market_insights');
        localStorage.setItem('ats_active_tab', 'market_insights');
      } else if (path.startsWith('/cv-library') || path.startsWith('/cv_library')) {
        setActiveTab('cv_library');
        localStorage.setItem('ats_active_tab', 'cv_library');
      } else if (path.startsWith('/cv-studio') || path.startsWith('/cv_studio')) {
        setActiveTab('cv_studio');
        localStorage.setItem('ats_active_tab', 'cv_studio');
      } else if (path.startsWith('/cover-letter') || path.startsWith('/cover_letter')) {
        setActiveTab('cover_letter');
        localStorage.setItem('ats_active_tab', 'cover_letter');
      } else if (path.startsWith('/github-readme') || path.startsWith('/github_readme') || path.startsWith('/readme')) {
        setActiveTab('github_readme');
        localStorage.setItem('ats_active_tab', 'github_readme');
      } else if (path.startsWith('/feedback') || path.startsWith('/sugestii')) {
        setActiveTab('feedback');
        localStorage.setItem('ats_active_tab', 'feedback');
      } else {
        setActiveTab('landing');
        localStorage.setItem('ats_active_tab', 'landing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Authentication State
  const [authToken, setAuthToken] = useState(localStorage.getItem('ats_jwt_token') || null);
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem('ats_user') || 'null')
  );

  // Modals state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [showUploadResumeModal, setShowUploadResumeModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [analyzingAppId, setAnalyzingAppId] = useState(null);

  // Forms state
  const [authForm, setAuthForm] = useState({ fullName: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [newJob, setNewJob] = useState({ 
    companyName: '', 
    jobTitle: '', 
    jobLocation: '', 
    workModel: 'REMOTE', 
    rawDescription: '' 
  });

  const DEFAULT_USER_ID = '23fe8bdd-08f4-413d-9985-f99c21040b59';
  const activeUserId = currentUser?.userId || currentUser?.id || DEFAULT_USER_ID;

  // Fetch initial applications
  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/v1/applications', {
        headers: { 'X-User-Id': activeUserId }
      });
      if (res.ok) {
        const data = await res.json();
        let list = Array.isArray(data) ? data : [];
        try {
          const savedOrder = JSON.parse(localStorage.getItem(`ats_kanban_order_${activeUserId}`) || '[]');
          if (savedOrder.length > 0) {
            const orderMap = new Map(savedOrder.map((id, index) => [id, index]));
            list.sort((a, b) => {
              const idxA = orderMap.has(a.id) ? orderMap.get(a.id) : 999999;
              const idxB = orderMap.has(b.id) ? orderMap.get(b.id) : 999999;
              return idxA - idxB;
            });
          }
        } catch (e) {}
        setApplications(list);
      }
    } catch (err) {
      console.error("Eroare la preluarea aplicatiilor:", err);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [activeUserId]);

  // Auto-refresh aplicatii din ora in ora la ora fixa (ex: 20:00, 21:00)
  useEffect(() => {
    let lastHour = new Date().getHours();
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getMinutes() === 0 && now.getSeconds() < 3 && now.getHours() !== lastHour) {
        lastHour = now.getHours();
        fetchApplications();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeUserId]);

  const handleApplicationUpdated = (updatedApp) => {
    setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
  };

  const handleReorderApplications = (reorderedApps) => {
    setApplications(reorderedApps);
    try {
      const orderIds = reorderedApps.map(a => a.id);
      localStorage.setItem(`ats_kanban_order_${activeUserId}`, JSON.stringify(orderIds));
    } catch (e) {
      console.warn("Nu s-a putut salva ordinea cardurilor:", e);
    }
  };

  // Status change handler
  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await fetch(`/api/v1/applications/${appId}/status?status=${newStatus}`, {
        method: 'PATCH',
        headers: { 'X-User-Id': activeUserId }
      });
      if (res.ok) {
        const updated = await res.json();
        handleApplicationUpdated(updated);
      }
    } catch (err) {
      console.error("Eroare la actualizarea statusului:", err);
    }
  };

  // Delete application handler
  const handleDeleteApplication = async (appId) => {
    try {
      const res = await fetch(`/api/v1/applications/${appId}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': activeUserId }
      });
      if (res.ok) {
        setApplications(prev => prev.filter(a => a.id !== appId));
      }
    } catch (err) {
      console.error("Eroare la stergerea aplicatiei:", err);
    }
  };

  // Auth Submit
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = authMode === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/register';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (res.ok) {
        const userData = {
          id: data.userId || data.id,
          userId: data.userId || data.id,
          email: data.email,
          fullName: data.fullName
        };
        localStorage.setItem('ats_jwt_token', data.token);
        localStorage.setItem('ats_user', JSON.stringify(userData));
        setAuthToken(data.token);
        setCurrentUser(userData);
        setShowAuthModal(false);
        setAuthForm({ fullName: '', email: '', password: '' });
      } else {
        setAuthError(data.message || 'Eroare la autentificare');
      }
    } catch (err) {
      setAuthError('Eroare de conexiune la server');
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('ats_jwt_token');
    localStorage.removeItem('ats_user');
    setAuthToken(null);
    setCurrentUser(null);
  };

  // Add Job Submit
  const handleAddJobSubmit = async (e) => {
    e.preventDefault();
    try {
      const jobRes = await fetch('/api/v1/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      });
      if (jobRes.ok) {
        const createdJob = await jobRes.json();
        const appRes = await fetch('/api/v1/applications', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-User-Id': activeUserId
          },
          body: JSON.stringify({ jobId: createdJob.id, notes: 'Creat manual din UI' })
        });
        if (appRes.ok) {
          const createdApp = await appRes.json();
          setApplications(prev => [createdApp, ...prev]);
          setShowAddJobModal(false);
          setNewJob({ companyName: '', jobTitle: '', jobLocation: '', workModel: 'REMOTE', rawDescription: '' });
        }
      }
    } catch (err) {
      console.error("Eroare la adaugarea jobului:", err);
    }
  };

  // Upload Resume Submit
  const handleUploadResumeSubmit = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/v1/resumes', {
        method: 'POST',
        headers: { 'X-User-Id': activeUserId },
        body: formData
      });
      if (res.ok) {
        setShowUploadResumeModal(false);
        fetchApplications();
      }
    } catch (err) {
      console.error("Eroare la incarcarea CV-ului:", err);
    }
  };

  // Run AI Analysis
  const handleOpenAiAnalysis = async (app) => {
    setAnalyzingAppId(app.id);
    try {
      const res = await fetch(`/api/v1/ai/gap-analysis?applicationId=${app.id}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedAnalysis({
          ...data,
          jobTitle: data.jobTitle || app.jobTitle || 'Job Role',
          companyName: data.companyName || app.companyName || 'Companie',
          matchScore: data.matchScore || app.semanticMatchScore || 85.0
        });
        setShowAiModal(true);
      }
    } catch (err) {
      console.error("Eroare la rularea analizei AI:", err);
    } finally {
      setAnalyzingAppId(null);
    }
  };

  const currentTabInfo = TAB_METADATA[activeTab] || {
    title: 'JobFlow AI',
    subtitle: 'Tracker & ATS Studio',
    category: 'Platforma'
  };

  return (
    <div className={`min-h-screen text-neutral-900 font-sans selection:bg-black selection:text-white ${
      (activeTab === 'landing' || activeTab === 'feedback') ? 'bg-white' : 'bg-neutral-50/40 flex flex-col lg:flex-row'
    }`}>
      
      {/* SIDEBAR NAVIGATION (Desktop Sidebar + Mobile Header/Drawer) */}
      {activeTab !== 'landing' && activeTab !== 'feedback' && (
        <Navbar 
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenAuth={() => setShowAuthModal(true)}
        />
      )}

      {/* CONTINUT PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden bg-white w-full">
        
        {/* DESKTOP TOP BAR CU TITLU PAGINA SI BREADCRUMB */}
        {activeTab !== 'landing' && activeTab !== 'feedback' && (
          <header className="hidden lg:flex items-center justify-between px-6 xl:px-8 py-3.5 bg-white/95 backdrop-blur-md border-b border-neutral-200/90 sticky top-0 z-20 shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-neutral-100 text-neutral-800 border border-neutral-200 font-semibold shadow-2xs">
                {currentTabInfo.category}
              </span>
              <div className="h-4 w-px bg-neutral-200" />
              <div>
                <h2 className="text-base font-bold text-neutral-950 tracking-tight leading-none">
                  {currentTabInfo.title}
                </h2>
                <p className="text-xs text-neutral-500 font-medium mt-0.5">
                  {currentTabInfo.subtitle}
                </p>
              </div>
            </div>

            {/* Quick Actions & User Account Status */}
            <div className="flex items-center gap-3">
              {currentUser && (
                <div className="flex items-center gap-2">
                  {activeTab === 'tracker' && (
                    <button
                      onClick={() => setShowAddJobModal(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-black hover:bg-neutral-800 text-white transition-all duration-150 shadow-2xs cursor-pointer active:scale-95"
                      title="Adauga o noua aplicatie de urmarit"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adauga Job</span>
                    </button>
                  )}
                  {activeTab === 'cv_library' && (
                    <button
                      onClick={() => setShowUploadResumeModal(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-black hover:bg-neutral-800 text-white transition-all duration-150 shadow-2xs cursor-pointer active:scale-95"
                      title="Incarca un CV PDF pentru analiza"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Incarca CV</span>
                    </button>
                  )}
                </div>
              )}

              {currentUser ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-neutral-200 text-neutral-800 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="max-w-[160px] truncate">{currentUser.fullName || currentUser.email}</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-black text-white shadow-xs hover:bg-neutral-800 transition cursor-pointer active:scale-95"
                >
                  <span>Conectare</span>
                </button>
              )}
            </div>
          </header>
        )}

        {/* CONTINUT PRINCIPAL */}
        <main className={(activeTab === 'landing' || activeTab === 'feedback') ? "flex-1 w-full bg-white p-0" : "flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"}>
        
        {/* TAB 1: TRACKER BOARD & LIST (WITH STATS) */}
        {activeTab === 'tracker' && (
          <>
            <StatsDashboard 
              applications={applications} 
            />
            <KanbanBoard 
              applications={applications}
              onStatusChange={handleStatusChange}
              onReorderApplications={handleReorderApplications}
              onOpenAnalysis={handleOpenAiAnalysis}
              onDeleteApplication={handleDeleteApplication}
              onApplicationUpdated={handleApplicationUpdated}
              onEditCvInStudio={handleEditCvInStudio}
              onOpenCoverLetter={handleOpenCoverLetterForApp}
              analyzingAppId={analyzingAppId}
              onOpenAddJob={() => setShowAddJobModal(true)}
              currentUser={currentUser}
              onRefreshApplications={fetchApplications}
            />
          </>
        )}

        {/* TAB 2: JOB SEARCH & MULTI-PLATFORM AGGREGATOR */}
        {activeTab === 'job_search' && (
          <JobSearchPage 
            currentUser={currentUser}
            onSaveToKanbanSuccess={fetchApplications}
            onNavigateToStudio={() => handleTabChange('cv_studio')}
            onNavigateToKanban={() => handleTabChange('tracker')}
          />
        )}

        {/* TAB 2.5: RADAR PIATA IT & STATISTICI CARIERA */}
        {activeTab === 'market_insights' && (
          <MarketInsightsPage 
            currentUser={currentUser}
            onNavigateToJobSearch={() => handleTabChange('job_search')}
            onNavigateToSkillRoadmap={() => handleTabChange('skill_roadmap')}
          />
        )}

        {/* TAB 3: CV LIBRARY (CV-URILE MELE) */}
        {activeTab === 'cv_library' && (
          <CvLibrary 
            currentUser={currentUser}
            onEditCvInStudio={handleEditCvInStudio}
            onNavigateToStudio={() => handleTabChange('cv_studio')}
          />
        )}

        {/* TAB 4: STUDIO CV & MATCH 100% (SEPARATE DEDICATED PAGE) */}
        {activeTab === 'cv_studio' && (
          <CvStudio 
            applications={applications}
            currentUser={currentUser}
            activeCvId={selectedStudioCvId}
            onNavigateToLibrary={() => handleTabChange('cv_library')}
          />
        )}

        {/* TAB 5: GENERATOR COVER LETTER (SCRISOARE DE INTENTIE PDF) */}
        {activeTab === 'cover_letter' && (
          <CoverLetterGenerator 
            applications={applications}
            currentUser={currentUser}
            initialApplicationId={selectedCoverLetterAppId}
            onNavigateToStudio={() => handleTabChange('cv_studio')}
            onNavigateToKanban={() => handleTabChange('tracker')}
          />
        )}

        {/* TAB 6: GITHUB PROFILE README STUDIO (NON-AI & AUTHENTIC) */}
        {activeTab === 'github_readme' && (
          <GithubReadmeStudio 
            currentUser={currentUser}
          />
        )}

        {/* TAB 7: LINKEDIN OPTIMIZER (PDF IMPORT, UI REPLICA & AI ADVISOR) */}
        {activeTab === 'linkedin_optimizer' && (
          <LinkedInOptimizerPage 
            currentUser={currentUser}
          />
        )}

        {/* TAB 8: SKILL ROADMAPS (RESURSE GRATUITE & PREGATIRE INTERVIU) */}
        {activeTab === 'skill_roadmap' && (
          <SkillRoadmapPage 
            currentUser={currentUser}
            onNavigateToCvLibrary={() => handleTabChange('cv_library')}
          />
        )}

        {/* TAB 9: LANDING PAGE (SISTEM DE ACCELERARE IN CARIERA & PREGATIRE INTERVIU) */}
        {activeTab === 'landing' && (
          <LandingPage 
            onNavigateTab={handleTabChange}
            currentUser={currentUser}
            onOpenAuth={() => setShowAuthModal(true)}
            onOpenUpload={() => setShowUploadResumeModal(true)}
            onOpenAddJob={() => setShowAddJobModal(true)}
          />
        )}

        {/* TAB 10: FEEDBACK & COMMUNITY ROADMAP */}
        {activeTab === 'feedback' && (
          <FeedbackPage 
            onNavigateTab={handleTabChange}
            currentUser={currentUser}
          />
        )}

        </main>

        {/* FOOTER */}
        {activeTab !== 'landing' && activeTab !== 'feedback' && (
          <footer className="border-t border-neutral-200/90 bg-white py-4 px-6 sm:px-8 text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-neutral-900 tracking-tight">JobFlow AI</span>
              <span className="text-neutral-300">•</span>
              <span className="font-mono text-[11px] text-neutral-500">Tracker & ATS Studio 2026</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono text-neutral-500">
              <button 
                onClick={() => handleTabChange('landing')}
                className="hover:text-black transition-colors cursor-pointer"
              >
                Landing Page
              </button>
              <span>•</span>
              <button 
                onClick={() => handleTabChange('feedback')}
                className="hover:text-black transition-colors cursor-pointer"
              >
                Feedback & Idei
              </button>
              <span>•</span>
              <span>Spring Boot 3.3 • React 18</span>
            </div>
          </footer>
        )}
      </div>

      {/* MODALE POPUP */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authForm={authForm}
        setAuthForm={setAuthForm}
        authError={authError}
        onSubmit={handleAuthSubmit}
      />

      <AddJobModal 
        isOpen={showAddJobModal}
        onClose={() => setShowAddJobModal(false)}
        newJob={newJob}
        setNewJob={setNewJob}
        onSubmit={handleAddJobSubmit}
      />

      <UploadResumeModal 
        isOpen={showUploadResumeModal}
        onClose={() => setShowUploadResumeModal(false)}
        onUpload={handleUploadResumeSubmit}
      />

      <AiReportModal 
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        analysis={selectedAnalysis}
      />

    </div>
  );
}
