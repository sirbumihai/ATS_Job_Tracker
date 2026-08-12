import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StatsDashboard from './components/StatsDashboard';
import KanbanBoard from './components/KanbanBoard';
import CvStudio from './components/CvStudio';
import { AuthModal, AddJobModal, UploadResumeModal, AiReportModal } from './components/Modals';

export default function App() {
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban' or 'cv_studio'

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

  // Form states
  const [authForm, setAuthForm] = useState({ email: '', password: '', fullName: '' });
  const [authError, setAuthError] = useState(null);
  const [newJob, setNewJob] = useState({ companyName: '', jobTitle: '', jobUrl: '', rawDescription: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedSuccess, setUploadedSuccess] = useState(null);

  const fetchApplicationsFromBackend = async (overrideUserId = null) => {
    const activeUserId = overrideUserId || (currentUser ? currentUser.userId : null);
    if (!activeUserId) {
      setApplications([]);
      return;
    }

    setLoading(true);
    try {
      let res = await fetch('/api/v1/applications', {
        headers: { 'X-User-Id': activeUserId }
      });
      
      let data = res.ok ? await res.json() : [];
      setApplications(data);
    } catch (err) {
      console.error("Eroare la incarcarea aplicatiilor din PostgreSQL:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationsFromBackend();
  }, [currentUser]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    const endpoint = authMode === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/register';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          authMode === 'login' 
            ? { email: authForm.email, password: authForm.password }
            : { email: authForm.email, password: authForm.password, fullName: authForm.fullName }
        )
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Eroare la autentificare.');
      }

      localStorage.setItem('ats_jwt_token', data.token);
      localStorage.setItem('ats_user', JSON.stringify(data));
      setAuthToken(data.token);
      setCurrentUser(data);
      setShowAuthModal(false);
      
      await fetchApplicationsFromBackend(data.userId);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ats_jwt_token');
    localStorage.removeItem('ats_user');
    setAuthToken(null);
    setCurrentUser(null);
    setApplications([]);
  };

  const handleAddJobSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    try {
      const resJob = await fetch('/api/v1/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      });
      const createdJob = await resJob.json();

      const resApp = await fetch('/api/v1/applications', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.userId
        },
        body: JSON.stringify({ jobId: createdJob.id, notes: 'Adaugat prin interfata' })
      });
      
      if (resApp.ok) {
        setShowAddJobModal(false);
        setNewJob({ companyName: '', jobTitle: '', jobUrl: '', rawDescription: '' });
        fetchApplicationsFromBackend();
      }
    } catch (err) {
      console.error("Eroare la adaugarea jobului:", err);
    }
  };

  const handleResumeUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !currentUser) return;

    setUploading(true);
    setUploadedSuccess(null);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/v1/resumes/upload', {
        method: 'POST',
        headers: { 'X-User-Id': currentUser.userId },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setUploadedSuccess(`CV-ul ${data.fileName} a fost extras si analizat cu succes!`);
        setTimeout(() => {
          setShowUploadResumeModal(false);
          setUploadedSuccess(null);
          setSelectedFile(null);
          fetchApplicationsFromBackend();
        }, 1500);
      }
    } catch (err) {
      console.error("Eroare la incarcarea CV-ului:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await fetch(`/api/v1/applications/${appId}/status?status=${newStatus}`, {
        method: 'PATCH'
      });
      if (res.ok) {
        setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app));
      }
    } catch (err) {
      console.error("Eroare la Schimbare Status:", err);
    }
  };

  const handleDeleteApplication = async (appId) => {
    try {
      const res = await fetch(`/api/v1/applications/${appId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setApplications(prev => prev.filter(app => app.id !== appId));
      }
    } catch (err) {
      console.error("Eroare la stergerea aplicatiei:", err);
    }
  };

  const handleOpenAiAnalysis = async (app) => {
    setAnalyzingAppId(app.id);
    try {
      const res = await fetch(`/api/v1/applications/${app.id}/analysis`, {
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
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      
      {/* NAVBAR */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenUpload={() => setShowUploadResumeModal(true)}
        onOpenAddJob={() => setShowAddJobModal(true)}
      />

      {/* CONTINUT PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* TOP STATS DASHBOARD */}
        <StatsDashboard applications={applications} />

        {/* TAB 1: KANBAN BOARD */}
        {activeTab === 'kanban' && (
          <KanbanBoard 
            applications={applications}
            onStatusChange={handleStatusChange}
            onOpenAnalysis={handleOpenAiAnalysis}
            onDeleteApplication={handleDeleteApplication}
            analyzingAppId={analyzingAppId}
            onOpenAddJob={() => setShowAddJobModal(true)}
            currentUser={currentUser}
          />
        )}

        {/* TAB 2: STUDIO CV & MATCH 100% */}
        {activeTab === 'cv_studio' && (
          <CvStudio 
            applications={applications}
            currentUser={currentUser}
          />
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-800/60 bg-[#0b0f19] py-4 text-center text-xs text-gray-400">
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
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        uploading={uploading}
        uploadedSuccess={uploadedSuccess}
        onSubmit={handleResumeUploadSubmit}
      />

      <AiReportModal 
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        analysis={selectedAnalysis}
      />

    </div>
  );
}
