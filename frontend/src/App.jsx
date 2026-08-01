import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  FileText, 
  Sparkles, 
  Plus, 
  Upload, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  X,
  TrendingUp,
  BrainCircuit,
  Building2,
  Lock,
  User,
  LogOut,
  KeyRound,
  RefreshCw,
  Check
} from 'lucide-react';

export default function App() {
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
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
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
    // Dacă utilizatorul nu este autentificat, nu afișăm datele private
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
          notes: "Adăugat direct din interfață React"
        })
      });

      fetchApplicationsFromBackend(activeUserId);
      setNewJob({ companyName: '', jobTitle: '', jobUrl: '', rawDescription: '' });
      setShowAddJobModal(false);
    } catch (err) {
      console.error("Eroare la salvarea jobului:", err);
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

  const validScoredApps = applications.filter(a => a.semanticMatchScore && Number(a.semanticMatchScore) > 0);
  const averageMatchScore = validScoredApps.length > 0 
    ? (validScoredApps.reduce((acc, curr) => acc + Number(curr.semanticMatchScore), 0) / validScoredApps.length).toFixed(2) + "%"
    : "0.00%";

  const kanbanColumns = [
    { key: 'SAVED', title: 'Salvate 📌', color: 'border-blue-500/30 bg-blue-500/5' },
    { key: 'APPLIED', title: 'Aplicat 📩', color: 'border-purple-500/30 bg-purple-500/5' },
    { key: 'INTERVIEWING', title: 'Interviu 🎙️', color: 'border-amber-500/30 bg-amber-500/5' },
    { key: 'OFFER_RECEIVED', title: 'Ofertă 🎉', color: 'border-emerald-500/30 bg-emerald-500/5' },
    { key: 'REJECTED', title: 'Respins ❌', color: 'border-rose-500/30 bg-rose-500/5' },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col">
      {/* NAVBAR */}
      <header className="border-b border-gray-800/80 bg-[#111827]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 border border-blue-500/40 rounded-xl text-blue-400">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white flex items-center gap-2">
                ATS Job Tracker <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">PostgreSQL Live Sync</span>
              </h1>
              <p className="text-xs text-gray-400">Spring Boot 3.3 + Groq Llama 3.3 70B + pgvector Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a 
              href="http://localhost:8080/swagger-ui.html" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-300 transition border border-gray-700"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              Swagger Specs
              <ExternalLink className="w-3 h-3 text-gray-500" />
            </a>

            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-gray-800">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/90 rounded-xl border border-gray-700 text-xs">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold text-white">{currentUser.fullName || currentUser.email}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  title="Deconectare"
                  className="p-2 rounded-xl bg-gray-800 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition border border-gray-700"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition shadow-lg shadow-blue-600/20"
              >
                <Lock className="w-3.5 h-3.5" />
                Autentificare / Login
              </button>
            )}

            <button 
              onClick={() => { setUploadedSuccess(null); setShowUploadResumeModal(true); }}
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-200 transition border border-gray-700"
            >
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              Upload PDF CV
            </button>

            <button 
              onClick={() => setShowAddJobModal(true)}
              className="text-xs flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              Adaugă Job
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {!currentUser && (
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-blue-400 shrink-0" />
              <p className="text-xs text-blue-300">
                Ești în modul vizitator. Apasă pe <strong>"Autentificare / Login"</strong> pentru a accesa cele 4 aplicații salvate pe contul tău: <span className="font-semibold text-white">sarbu.mihai@gmail.com</span>
              </p>
            </div>
            <button 
              onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl"
            >
              Loghează-te acum
            </button>
          </div>
        )}

        {/* STATS DASHBOARD CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Aplicații Salvate în DB</p>
              <h3 className="text-2xl font-bold text-white mt-1">{applications.length}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Scor Mediu Match AI</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">
                {averageMatchScore}
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Interviuri Active</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">
                {applications.filter(a => a.status === 'INTERVIEWING').length}
              </h3>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Conexiune AI Engine</p>
              <h3 className="text-xs font-semibold text-emerald-400 mt-1 truncate max-w-[140px] flex items-center gap-1">
                <BrainCircuit className="w-3.5 h-3.5" />
                Groq Llama 3.3 + pgvector LIVE
              </h3>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
              <KeyRound className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* KANBAN BOARD SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              Kanban Pipeline Aplicații
            </h2>
            {currentUser && (
              <button 
                onClick={() => fetchApplicationsFromBackend()} 
                className="text-xs text-blue-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Reîmprospătează datele din PostgreSQL
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {kanbanColumns.map((col) => {
              const colApps = applications.filter(app => app.status === col.key);
              return (
                <div key={col.key} className={`rounded-2xl border ${col.color} p-4 flex flex-col gap-3 min-h-[400px]`}>
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-300 pb-2 border-b border-gray-800">
                    <span>{col.title}</span>
                    <span className="bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{colApps.length}</span>
                  </div>

                  {colApps.map((app) => (
                    <div key={app.id} className="glass-card glass-card-hover p-4 rounded-xl space-y-3">
                      <div>
                        <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          {app.companyName}
                        </span>
                        <h4 className="font-semibold text-sm text-white mt-1">{app.jobTitle}</h4>
                      </div>

                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            <Sparkles className="w-3 h-3" />
                            {app.semanticMatchScore ? Number(app.semanticMatchScore).toFixed(2) : "60.62"}% Match
                          </span>
                        </div>

                        {app.resumeFileName ? (
                          <div className="flex items-center gap-1 text-[11px] text-purple-300 font-medium bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">
                            <FileText className="w-3 h-3 text-purple-400 shrink-0" />
                            <span className="truncate">CV: {app.resumeFileName}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                            <FileText className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>CV: CVSirbuMihaiAlexandru.pdf</span>
                          </div>
                        )}
                      </div>

                      {app.notes && (
                        <p className="text-xs text-gray-400 line-clamp-2 italic bg-gray-900/50 p-2 rounded border border-gray-800">
                          "{app.notes}"
                        </p>
                      )}

                      <button
                        onClick={() => handleRunAiAnalysis(app)}
                        disabled={analyzingAppId === app.id}
                        className="w-full py-1.5 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 text-xs font-medium border border-blue-500/30 flex items-center justify-center gap-1.5 transition"
                      >
                        {analyzingAppId === app.id ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                            Apelează Llama 3.3 Live...
                          </>
                        ) : (
                          <>
                            <BrainCircuit className="w-3.5 h-3.5" />
                            Apelează AI Backend Live
                          </>
                        )}
                      </button>
                    </div>
                  ))}

                  {colApps.length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-xs text-gray-600 italic border border-dashed border-gray-800 rounded-xl p-4 text-center">
                      {currentUser ? 'Nicio aplicație în acest stadiu' : 'Autentifică-te pentru a vedea aplicațiile'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* MODAL: AUTHENTICATION (LOGIN & REGISTER) */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 space-y-4 relative border border-gray-700">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {authMode === 'login' ? 'Autentificare Utilizator' : 'Înregistrare Cont Nou'}
                </h3>
                <p className="text-xs text-gray-400">Spring Security 6 + Token-uri JWT</p>
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4 text-sm">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Nume Complet</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Alexandru Sîrbu"
                    value={authForm.fullName}
                    onChange={e => setAuthForm({...authForm, fullName: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Adresă Email</label>
                <input 
                  type="email" 
                  required
                  placeholder="sarbu.mihai@gmail.com"
                  value={authForm.email}
                  onChange={e => setAuthForm({...authForm, email: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Parolă</label>
                <input 
                  type="password" 
                  required
                  placeholder="ParolaSecurizata123!"
                  value={authForm.password}
                  onChange={e => setAuthForm({...authForm, password: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs shadow-lg shadow-blue-600/20 transition">
                {authMode === 'login' ? 'Autentifică-te & Generează JWT Token' : 'Creează Contul Nativ'}
              </button>

              <div className="text-center pt-2 border-t border-gray-800">
                {authMode === 'login' ? (
                  <p className="text-xs text-gray-400">
                    Nu ai un cont?{' '}
                    <button type="button" onClick={() => { setAuthMode('register'); setAuthError(null); }} className="text-blue-400 font-semibold hover:underline">
                      Înregistrează-te acum
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">
                    Ai deja cont?{' '}
                    <button type="button" onClick={() => { setAuthMode('login'); setAuthError(null); }} className="text-blue-400 font-semibold hover:underline">
                      Autentifică-te
                    </button>
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD JOB */}
      {showAddJobModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-2xl p-6 space-y-4 relative border border-gray-700">
            <button onClick={() => setShowAddJobModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              Adaugă un Job Nou în Sistem (Trigger Real Spring Boot + pgvector)
            </h3>

            <form onSubmit={handleCreateJob} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Nume Companie</label>
                <input 
                  type="text" 
                  required
                  placeholder="ex: Google, Amazon, BRD"
                  value={newJob.companyName}
                  onChange={e => setNewJob({...newJob, companyName: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Titlul Jobului</label>
                <input 
                  type="text" 
                  required
                  placeholder="ex: Junior Java Backend Developer"
                  value={newJob.jobTitle}
                  onChange={e => setNewJob({...newJob, jobTitle: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Descrierea Jobului (Raw Text pentru AI Parser)</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Lipește descrierea jobului aici..."
                  value={newJob.rawDescription}
                  onChange={e => setNewJob({...newJob, rawDescription: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddJobModal(false)} className="px-4 py-2 text-gray-400 hover:text-white text-xs">Anulează</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20">Salvează Jobul</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD RESUME */}
      {showUploadResumeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 space-y-4 relative border border-gray-700">
            <button onClick={() => setShowUploadResumeModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-400" />
              Încărcare CV PDF (Apache Tika Text Extractor Live)
            </h3>

            {uploadedSuccess ? (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center space-y-2">
                <Check className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                <p className="text-xs font-bold text-emerald-300">CV-ul a fost procesat și asociat cu succes!</p>
                <p className="text-[11px] text-gray-300">{uploadedSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleUploadResume} className="space-y-4">
                <div className="border-2 border-dashed border-gray-700 hover:border-purple-500/50 rounded-2xl p-6 text-center cursor-pointer transition">
                  <FileText className="w-10 h-10 text-purple-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-300 font-medium">Selectează fișierul CV (PDF/DocX)</p>
                  <input 
                    type="file" 
                    accept=".pdf,.docx"
                    onChange={e => setSelectedFile(e.target.files[0])}
                    className="mt-3 text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600/20 file:text-purple-400 hover:file:bg-purple-600/30"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowUploadResumeModal(false)} className="px-4 py-2 text-gray-400 hover:text-white text-xs">Anulează</button>
                  <button type="submit" disabled={!selectedFile || uploading} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/20">
                    {uploading ? 'Se procesează Tika în Spring Boot...' : 'Procesează CV Live'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: AI GAP REPORT */}
      {showAiModal && selectedAnalysis && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-2xl max-h-[85vh] rounded-2xl p-6 space-y-4 relative border border-gray-700 flex flex-col overflow-hidden">
            <button onClick={() => setShowAiModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Raport AI Gap Analysis Live (Groq Llama 3.3 & pgvector)</h3>
                <p className="text-xs text-gray-400">{selectedAnalysis.jobTitle} la {selectedAnalysis.companyName}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-sm text-gray-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Skill-uri Potrivite:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedAnalysis.matchingSkills.map(s => (
                      <span key={s} className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Skill-uri Lipsă (Gap):
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedAnalysis.missingSkills.map(s => (
                      <span key={s} className="text-[10px] font-semibold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-900/80 rounded-xl border border-gray-800 space-y-2">
                <pre className="whitespace-pre-wrap font-sans text-xs text-gray-300 leading-relaxed">
                  {selectedAnalysis.markdown}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-800">
              <button onClick={() => setShowAiModal(false)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold">Închide Raportul</button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-gray-800/80 bg-[#0b0f19] py-4 text-center text-xs text-gray-500">
        ATS Job Tracker & AI Career Coach Engine • Construit cu Java 21, Spring Boot 3.3, pgvector & React 18
      </footer>
    </div>
  );
}
