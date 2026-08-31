import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StatsDashboard from './components/StatsDashboard';
import KanbanBoard from './components/KanbanBoard';
import CvLibrary from './components/CvLibrary';
import CvStudio from './components/CvStudio';
import { AuthModal, AddJobModal, UploadResumeModal, AiReportModal } from './components/Modals';

export default function App() {
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/cv-library') || path.startsWith('/cv_library')) return 'cv_library';
      if (path.startsWith('/cv-studio') || path.startsWith('/cv_studio')) return 'cv_studio';
      if (path.startsWith('/kanban')) return 'kanban';
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('cv-library') || hash.includes('cv_library')) return 'cv_library';
      if (hash.includes('cv-studio') || hash.includes('cv_studio')) return 'cv_studio';
      if (hash.includes('kanban')) return 'kanban';
      const stored = localStorage.getItem('ats_active_tab');
      if (stored === 'cv_library' || stored === 'cv_studio' || stored === 'kanban') return stored;
    }
    return 'kanban';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [selectedStudioCvId, setSelectedStudioCvId] = useState(null);

  // Sync tab with clean URL pathname and localStorage
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ats_active_tab', tab);
      let targetPath = '/kanban';
      if (tab === 'cv_library') targetPath = '/cv-library';
      if (tab === 'cv_studio') targetPath = '/cv-studio';
      
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ tab }, '', targetPath);
      }
    }
  };

  const handleEditCvInStudio = (cvId) => {
    setSelectedStudioCvId(cvId);
    handleTabChange('cv_studio');
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/cv-library') || path.startsWith('/cv_library')) {
        setActiveTab('cv_library');
        localStorage.setItem('ats_active_tab', 'cv_library');
      } else if (path.startsWith('/cv-studio') || path.startsWith('/cv_studio')) {
        setActiveTab('cv_studio');
        localStorage.setItem('ats_active_tab', 'cv_studio');
      } else {
        setActiveTab('kanban');
        localStorage.setItem('ats_active_tab', 'kanban');
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
        setApplications(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Eroare la preluarea aplicatiilor:", err);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [activeUserId]);

  const handleApplicationUpdated = (updatedApp) => {
    setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
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
        setSelectedAnalysis(data);
        setShowAiModal(true);
      }
    } catch (err) {
      console.error("Eroare la rularea analizei AI:", err);
    } finally {
      setAnalyzingAppId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col font-sans selection:bg-black selection:text-white">
      
      {/* NAVBAR */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenUpload={() => setShowUploadResumeModal(true)}
        onOpenAddJob={() => setShowAddJobModal(true)}
      />

      {/* CONTINUT PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* TAB 1: KANBAN BOARD & LIST (WITH STATS) */}
        {activeTab === 'kanban' && (
          <>
            <StatsDashboard applications={applications} />
            <KanbanBoard 
              applications={applications}
              onStatusChange={handleStatusChange}
              onOpenAnalysis={handleOpenAiAnalysis}
              onDeleteApplication={handleDeleteApplication}
              onApplicationUpdated={handleApplicationUpdated}
              onEditCvInStudio={handleEditCvInStudio}
              analyzingAppId={analyzingAppId}
              onOpenAddJob={() => setShowAddJobModal(true)}
              currentUser={currentUser}
            />
          </>
        )}

        {/* TAB 2: CV LIBRARY (CV-URILE MELE) */}
        {activeTab === 'cv_library' && (
          <CvLibrary 
            currentUser={currentUser}
            onEditCvInStudio={handleEditCvInStudio}
            onNavigateToStudio={() => handleTabChange('cv_studio')}
          />
        )}

        {/* TAB 3: STUDIO CV & MATCH 100% (SEPARATE DEDICATED PAGE) */}
        {activeTab === 'cv_studio' && (
          <CvStudio 
            applications={applications}
            currentUser={currentUser}
            activeCvId={selectedStudioCvId}
            onNavigateToLibrary={() => handleTabChange('cv_library')}
          />
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-500">
        <p>ATS AI Career Coach & Engine • Spring Boot 3.3 Java 21 • React 18 • PostgreSQL pgvector</p>
      </footer>

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
