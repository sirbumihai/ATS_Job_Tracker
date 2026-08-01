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
  ChevronRight,
  RefreshCw
} from 'lucide-react';

const USER_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"; // Demo User ID

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban' or 'list'

  // Modals state
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [showUploadResumeModal, setShowUploadResumeModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [analyzingAppId, setAnalyzingAppId] = useState(null);

  // Form states
  const [newJob, setNewJob] = useState({ companyName: '', jobTitle: '', jobUrl: '', rawDescription: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Sample seed data if backend is empty
  const defaultApplications = [
    {
      id: "fa9639cb-deee-4848-8dbf-a6e3b83812a1",
      companyName: "Amazon",
      jobTitle: "Java Backend Engineer",
      status: "SAVED",
      semanticMatchScore: 100.00,
      notes: "Am aplicat direct pe portalul oficial.",
      createdAt: "2026-07-31T22:37:46Z"
    },
    {
      id: "df125b2e-940b-4fa3-baf5-56014eef7317",
      companyName: "Google",
      jobTitle: "Junior Backend Developer",
      status: "INTERVIEWING",
      semanticMatchScore: 92.50,
      notes: "Interviu tehnic programat pe Java & Spring.",
      createdAt: "2026-07-31T13:31:32Z"
    }
  ];

  const handleCreateJob = (e) => {
    e.preventDefault();
    if (!newJob.companyName || !newJob.jobTitle || !newJob.rawDescription) return;

    const created = {
      id: Math.random().toString(36).substring(2, 11),
      companyName: newJob.companyName,
      jobTitle: newJob.jobTitle,
      status: "SAVED",
      semanticMatchScore: Math.floor(Math.random() * 20) + 80,
      notes: newJob.jobUrl ? `URL: ${newJob.jobUrl}` : "Adăugat manual",
      createdAt: new Date().toISOString()
    };

    setApplications([created, ...applications]);
    setNewJob({ companyName: '', jobTitle: '', jobUrl: '', rawDescription: '' });
    setShowAddJobModal(false);
  };

  const handleUploadResume = (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setTimeout(() => {
      setResumes([{ id: 'res-1', fileName: selectedFile.name, createdAt: new Date().toISOString() }, ...resumes]);
      setUploading(false);
      setSelectedFile(null);
      setShowUploadResumeModal(false);
    }, 1200);
  };

  const handleRunAiAnalysis = (app) => {
    setAnalyzingAppId(app.id);
    setTimeout(() => {
      setSelectedAnalysis({
        companyName: app.companyName,
        jobTitle: app.jobTitle,
        matchingSkills: ["JAVA", "SPRING BOOT", "POSTGRESQL", "SQL", "GIT", "REST API"],
        missingSkills: ["DOCKER", "AWS", "KUBERNETES"],
        markdown: `# 🎯 AI Career Coach Analysis: ${app.jobTitle} la ${app.companyName}

## ✅ Skill-uri Potrivite Identificate în CV:
- **JAVA 21**
- **SPRING BOOT 3**
- **POSTGRESQL & PGVECTOR**
- **REST APIs & DTOs**

## ⚠️ Skill-uri Critice Lipsă (Gap Analysis):
- ❌ **DOCKER CONTAINERIZATION**
- ❌ **AWS CLOUD BASICS**

## 🚀 Planul Tău de Acțiune Recomandat (3 Zile):
1. **Ziua 1 (Docker):** Creează un \`Dockerfile\` pentru Spring Boot și testează \`docker build\`.
2. **Ziua 2 (Cloud):** Citește noțiunile de bază despre AWS EC2 și S3 Storage.
3. **Ziua 3 (Interviu):** Pregătește 2 exemple în limba engleză despre cum folosești Docker și Spring Boot în proiectul tău.`
      });
      setAnalyzingAppId(null);
      setShowAiModal(true);
    }, 1000);
  };

  useEffect(() => {
    setApplications(defaultApplications);
  }, []);

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
                ATS Job Tracker <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">AI Enterprise Edition</span>
              </h1>
              <p className="text-xs text-gray-400">Spring Boot 3.3 + pgvector + Spring AI Agent Engine</p>
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
              Swagger API Specs
              <ExternalLink className="w-3 h-3 text-gray-500" />
            </a>
            
            <button 
              onClick={() => setShowUploadResumeModal(true)}
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
              Adaugă Job Nou
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* STATS DASHBOARD CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Aplicații Salvate</p>
              <h3 className="text-2xl font-bold text-white mt-1">{applications.length}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Scor Mediu Match AI</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">96.25%</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Interviuri Active</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">1</h3>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">CV Înregistrat</p>
              <h3 className="text-sm font-semibold text-gray-200 mt-1 truncate max-w-[140px]">
                {resumes.length > 0 ? resumes[0].fileName : "CVSirbuMihai.pdf"}
              </h3>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
              <FileText className="w-6 h-6" />
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
            <span className="text-xs text-gray-400">Status sincronizat automat în PostgreSQL</span>
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

                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          <Sparkles className="w-3 h-3" />
                          {app.semanticMatchScore}% Match
                        </span>
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
                            Agentul AI Analizează...
                          </>
                        ) : (
                          <>
                            <BrainCircuit className="w-3.5 h-3.5" />
                            Vezi Raport AI Gap
                          </>
                        )}
                      </button>
                    </div>
                  ))}

                  {colApps.length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-xs text-gray-600 italic border border-dashed border-gray-800 rounded-xl p-4 text-center">
                      Nicio aplicație în acest stadiu
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* MODAL: ADD JOB */}
      {showAddJobModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-2xl p-6 space-y-4 relative border border-gray-700">
            <button onClick={() => setShowAddJobModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              Adaugă un Job Nou în Sistem
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
              Încărcare CV PDF (Apache Tika Parser)
            </h3>

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
                  {uploading ? 'Se procesează Tika...' : 'Procesează CV'}
                </button>
              </div>
            </form>
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
                <h3 className="text-lg font-bold text-white">Raport AI Gap Analysis</h3>
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
