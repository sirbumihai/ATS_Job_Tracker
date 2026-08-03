import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StatsDashboard from './components/StatsDashboard';
import KanbanBoard from './components/KanbanBoard';
import AgentStudio from './components/AgentStudio';
import CvStudio from './components/CvStudio';
import { AuthModal, AddJobModal, UploadResumeModal, AiReportModal } from './components/Modals';

export default function App() {
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban', 'agent_studio', or 'cv_studio'

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

  // Multi-Agent Studio States
  const [selectedAppForAgent, setSelectedAppForAgent] = useState(null);
  const [agentLogs, setAgentLogs] = useState([]);
  const [agentOutputs, setAgentOutputs] = useState({
    recruiter: '',
    tailor: '',
    interview: '',
    outreach: ''
  });
  const [isStreaming, setIsStreaming] = useState(false);

  // Interview Simulator States
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState('1. Cum funcționează Garbage Collector-ul în Java 21 și care este diferența dintre stack și heap memory?');
  const [evaluatingAnswer, setEvaluatingAnswer] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

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

      if (data.length > 0 && !selectedAppForAgent) {
        setSelectedAppForAgent(data[0]);
      }
    } catch (err) {
      console.error("Eroare la încărcarea aplicațiilor din PostgreSQL:", err);
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Eroare de autentificare.' }));
        throw new Error(errorData.detail || 'Eroare la autentificare.');
      }

      const data = await response.json();
      setAuthToken(data.token);
      setCurrentUser(data);
      localStorage.setItem('ats_jwt_token', data.token);
      localStorage.setItem('ats_user', JSON.stringify(data));
      setShowAuthModal(false);
      setAuthForm({ email: '', password: '', fullName: '' });

      fetchApplicationsFromBackend(data.userId);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    localStorage.removeItem('ats_jwt_token');
    localStorage.removeItem('ats_user');
    setApplications([]);
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const res = await fetch(`/api/v1/applications/${appId}/status?status=${newStatus}`, {
        method: 'PATCH'
      });

      if (res.ok) {
        fetchApplicationsFromBackend();
      }
    } catch (err) {
      console.error("Eroare la schimbarea stării aplicației:", err);
    }
  };

  const handleDeleteApplication = async (appId) => {
    try {
      const res = await fetch(`/api/v1/applications/${appId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchApplicationsFromBackend();
      }
    } catch (err) {
      console.error("Eroare la ștergerea aplicației:", err);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!newJob.companyName || !newJob.jobTitle || !newJob.rawDescription) return;

    if (!currentUser) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }

    try {
      const activeUserId = currentUser.userId;
      
      const resJob = await fetch('/api/v1/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': activeUserId
        },
        body: JSON.stringify(newJob)
      });

      const savedJob = await resJob.json();

      await fetch('/api/v1/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': activeUserId
        },
        body: JSON.stringify({
          jobId: savedJob.id,
          notes: ""
        })
      });

      fetchApplicationsFromBackend(activeUserId);
      setNewJob({ companyName: '', jobTitle: '', jobUrl: '', rawDescription: '' });
      setShowAddJobModal(false);
    } catch (err) {
      console.error("Eroare la salvarea jobului:", err);
    }
  };

  const handleImportWebJob = async (webJob) => {
    if (!currentUser) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }

    try {
      const activeUserId = currentUser.userId;
      
      const resJob = await fetch('/api/v1/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': activeUserId
        },
        body: JSON.stringify({
          companyName: webJob.companyName,
          jobTitle: webJob.jobTitle,
          jobUrl: 'https://linkedin.com',
          rawDescription: webJob.rawDescription
        })
      });

      const savedJob = await resJob.json();

      await fetch('/api/v1/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': activeUserId
        },
        body: JSON.stringify({
          jobId: savedJob.id,
          notes: ""
        })
      });

      fetchApplicationsFromBackend(activeUserId);
      setActiveTab('kanban');
    } catch (err) {
      console.error("Eroare la importul jobului de pe net:", err);
    }
  };

  const handleUploadResume = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    if (!currentUser) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }

    setUploading(true);
    try {
      const activeUserId = currentUser.userId;
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/v1/resumes', {
        method: 'POST',
        headers: {
          'X-User-Id': activeUserId
        },
        body: formData
      });

      const data = await res.json();
      setResumes([data, ...resumes]);
      setUploading(false);
      setUploadedSuccess(data.fileName);
      setSelectedFile(null);

      fetchApplicationsFromBackend(activeUserId);

      setTimeout(() => {
        setShowUploadResumeModal(false);
      }, 1200);
    } catch (err) {
      console.error("Eroare la încărcarea CV-ului:", err);
      setUploading(false);
    }
  };

  const handleRunAiAnalysis = async (app) => {
    setAnalyzingAppId(app.id);
    try {
      const res = await fetch(`/api/v1/applications/${app.id}/analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error("Nu s-a putut genera analiza AI.");
      }

      const data = await res.json();
      
      setSelectedAnalysis({
        companyName: app.companyName,
        jobTitle: app.jobTitle,
        matchingSkills: data.matchingSkills && data.matchingSkills.length > 0 ? data.matchingSkills : ["JAVA", "SPRING BOOT", "POSTGRESQL", "SQL"],
        missingSkills: data.missingSkills && data.missingSkills.length > 0 ? data.missingSkills : ["DOCKER", "KUBERNETES", "MICROSERVICES"],
        markdown: data.actionPlanMarkdown
      });

      fetchApplicationsFromBackend();

      setAnalyzingAppId(null);
      setShowAiModal(true);
    } catch (err) {
      console.error("Eroare la apelul AI Backend:", err);
      setAnalyzingAppId(null);
    }
  };

  // MULTI-AGENT SSE STREAMING WORKFLOW
  const handleStartAgentStream = (jobId) => {
    if (!jobId) return;

    setIsStreaming(true);
    setAgentLogs([]);
    setAgentOutputs({ recruiter: '', tailor: '', interview: '', outreach: '' });

    const eventSource = new EventSource(`/api/v1/agents/stream/${jobId}`);

    eventSource.addEventListener('status', (e) => {
      setAgentLogs(prev => [...prev, e.data]);
    });

    eventSource.addEventListener('recruiter_output', (e) => {
      setAgentOutputs(prev => ({ ...prev, recruiter: e.data }));
    });

    eventSource.addEventListener('tailor_output', (e) => {
      setAgentOutputs(prev => ({ ...prev, tailor: e.data }));
    });

    eventSource.addEventListener('interview_output', (e) => {
      setAgentOutputs(prev => ({ ...prev, interview: e.data }));
    });

    eventSource.addEventListener('complete', (e) => {
      setAgentLogs(prev => [...prev, e.data]);
      setIsStreaming(false);
      eventSource.close();
    });

    eventSource.onerror = (err) => {
      console.error("Eroare SSE Stream:", err);
      setIsStreaming(false);
      eventSource.close();
    };
  };

  // INTERVIEW ANSWER EVALUATION
  const handleEvaluateInterviewAnswer = async () => {
    if (!userAnswer.trim()) return;

    setEvaluatingAnswer(true);
    setEvaluationResult(null);

    try {
      const res = await fetch('/api/v1/agents/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: selectedAppForAgent ? selectedAppForAgent.jobTitle : "Junior Backend Developer",
          companyName: selectedAppForAgent ? selectedAppForAgent.companyName : "Google",
          questionText: selectedQuestion,
          userAnswerText: userAnswer
        })
      });

      const data = await res.json();
      setEvaluationResult(data);
    } catch (err) {
      console.error("Eroare la evaluarea răspunsului:", err);
    } finally {
      setEvaluatingAnswer(false);
    }
  };

  const validScoredApps = applications.filter(a => a.semanticMatchScore && Number(a.semanticMatchScore) > 0);
  const averageMatchScore = validScoredApps.length > 0 
    ? (validScoredApps.reduce((acc, curr) => acc + Number(curr.semanticMatchScore), 0) / validScoredApps.length).toFixed(2) + "%"
    : "0.00%";

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col selection:bg-purple-500 selection:text-white">
      
      {/* TOP ANNOUNCEMENT TICKER */}
      <div className="bg-gradient-to-r from-blue-900/50 via-purple-900/50 to-pink-900/50 border-b border-purple-500/20 py-1.5 px-4 text-center text-xs font-semibold text-purple-200 flex items-center justify-center gap-2 backdrop-blur-md">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span className="truncate">🔥 Engine Live: Groq Llama 3.3 70B • pgvector 384-Dim Indexing • 4 Agenți AI Activi</span>
      </div>

      {/* GLOW BACKGROUND EFFECT */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-r from-blue-600/15 via-purple-600/15 to-pink-600/15 blur-[140px] pointer-events-none z-0"></div>

      {/* MODULAR NAVBAR */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => { setAuthMode('login'); setShowAuthModal(true); }}
        onOpenUpload={() => { setUploadedSuccess(null); setShowUploadResumeModal(true); }}
        onOpenAddJob={() => setShowAddJobModal(true)}
      />

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6 sm:space-y-8 relative z-10">
        
        {!currentUser && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Mod Vizitator Activ</h4>
                <p className="text-xs text-gray-300 mt-0.5">
                  Apasă pe <strong>"Autentificare / Login"</strong> pentru a accesa cele 4 aplicații salvate pe contul tău: <span className="font-bold text-white">sarbu.mihai@gmail.com</span>
                </p>
              </div>
            </div>
            <button 
              onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20 shrink-0 text-center"
            >
              Loghează-te acum
            </button>
          </div>
        )}

        {/* TAB 1: KANBAN BOARD */}
        {activeTab === 'kanban' && (
          <>
            <StatsDashboard 
              applicationsCount={applications.length}
              averageMatchScore={averageMatchScore}
              interviewingCount={applications.filter(a => a.status === 'INTERVIEWING').length}
            />

            <KanbanBoard 
              applications={applications}
              currentUser={currentUser}
              loading={loading}
              onRunAiAnalysis={handleRunAiAnalysis}
              analyzingAppId={analyzingAppId}
              onUpdateStatus={handleUpdateStatus}
              onDeleteApplication={handleDeleteApplication}
            />
          </>
        )}

        {/* TAB 2: MULTI-AGENT STUDIO & INTERVIEW SIMULATOR */}
        {activeTab === 'agent_studio' && (
          <AgentStudio 
            applications={applications}
            selectedAppForAgent={selectedAppForAgent}
            isStreaming={isStreaming}
            agentLogs={agentLogs}
            agentOutputs={agentOutputs}
            selectedQuestion={selectedQuestion}
            setSelectedQuestion={setSelectedQuestion}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            evaluatingAnswer={evaluatingAnswer}
            evaluationResult={evaluationResult}
            onStartStream={handleStartAgentStream}
            onEvaluateAnswer={handleEvaluateInterviewAnswer}
            onImportJob={handleImportWebJob}
          />
        )}

        {/* TAB 3: DEDICATED CV TAILOR & ATS OPTIMIZER STUDIO */}
        {activeTab === 'cv_studio' && (
          <CvStudio 
            applications={applications}
          />
        )}

      </main>

      {/* MODALS */}
      <AuthModal 
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authForm={authForm}
        setAuthForm={setAuthForm}
        authError={authError}
        onSubmit={handleAuthSubmit}
      />

      <AddJobModal 
        show={showAddJobModal}
        onClose={() => setShowAddJobModal(false)}
        newJob={newJob}
        setNewJob={setNewJob}
        onSubmit={handleCreateJob}
      />

      <UploadResumeModal 
        show={showUploadResumeModal}
        onClose={() => setShowUploadResumeModal(false)}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        uploading={uploading}
        uploadedSuccess={uploadedSuccess}
        onSubmit={handleUploadResume}
      />

      <AiReportModal 
        show={showAiModal}
        onClose={() => setShowAiModal(false)}
        selectedAnalysis={selectedAnalysis}
      />

      {/* FOOTER */}
      <footer className="border-t border-gray-800/80 bg-[#0f172a]/80 py-4 text-center text-xs text-gray-500 relative z-10 backdrop-blur-md">
        ATS Multi-Agent AI Platform • Construit cu Java 21, Spring Boot 3.3, 4 Autonomous AI Agents & React 18
      </footer>
    </div>
  );
}
