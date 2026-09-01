import React from 'react';
import { 
  X, 
  Lock, 
  AlertTriangle, 
  Plus, 
  Upload, 
  FileText, 
  Check, 
  BrainCircuit, 
  CheckCircle2 
} from 'lucide-react';

export function AuthModal({ isOpen, onClose, authMode, setAuthMode, authForm, setAuthForm, authError, onSubmit }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="glass-card w-full max-w-md rounded-2xl p-5 sm:p-6 space-y-4 relative border border-gray-700 my-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {authMode === 'login' ? 'Autentificare Utilizator' : 'Inregistrare Cont Nou'}
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

        <form onSubmit={onSubmit} className="space-y-3.5 text-sm">
          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Nume Complet</label>
              <input 
                type="text" 
                required
                placeholder="Alexandru Sirbu"
                value={authForm.fullName}
                onChange={e => setAuthForm({...authForm, fullName: e.target.value})}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Adresa Email</label>
            <input 
              type="email" 
              required
              placeholder="sarbu.mihai@gmail.com"
              value={authForm.email}
              onChange={e => setAuthForm({...authForm, email: e.target.value})}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Parola</label>
            <input 
              type="password" 
              required
              placeholder="ParolaSecurizata123!"
              value={authForm.password}
              onChange={e => setAuthForm({...authForm, password: e.target.value})}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-600/20 transition">
            {authMode === 'login' ? 'Autentifica-te & Genereaza JWT Token' : 'Creeaza Contul Nativ'}
          </button>

          <div className="text-center pt-2 border-t border-gray-800">
            {authMode === 'login' ? (
              <p className="text-xs text-gray-400">
                Nu ai un cont?{' '}
                <button type="button" onClick={() => setAuthMode('register')} className="text-blue-400 font-bold hover:underline">
                  Inregistreaza-te acum
                </button>
              </p>
            ) : (
              <p className="text-xs text-gray-400">
                Ai deja cont?{' '}
                <button type="button" onClick={() => setAuthMode('login')} className="text-blue-400 font-bold hover:underline">
                  Autentifica-te
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddJobModal({ isOpen, onClose, newJob, setNewJob, onSubmit }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="glass-card w-full max-w-lg rounded-2xl p-5 sm:p-6 space-y-4 relative border border-gray-700 my-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-400" />
          Adauga un Job Nou in Sistem
        </h3>

        <form onSubmit={onSubmit} className="space-y-3.5 text-sm">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Nume Companie</label>
            <input 
              type="text" 
              required
              placeholder="ex: Google, Amazon, BRD"
              value={newJob.companyName}
              onChange={e => setNewJob({...newJob, companyName: e.target.value})}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Titlul Jobului</label>
            <input 
              type="text" 
              required
              placeholder="ex: Junior Java Backend Developer"
              value={newJob.jobTitle}
              onChange={e => setNewJob({...newJob, jobTitle: e.target.value})}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Descrierea Jobului (Raw Text pentru AI Parser)</label>
            <textarea 
              required
              rows={4}
              placeholder="Lipeste descrierea jobului aici..."
              value={newJob.rawDescription}
              onChange={e => setNewJob({...newJob, rawDescription: e.target.value})}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white text-xs">Anuleaza</button>
            <button type="submit" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20">Salveaza Jobul</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function UploadResumeModal({ isOpen, onClose, selectedFile, setSelectedFile, uploading, uploadedSuccess, onSubmit }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="glass-card w-full max-w-md rounded-2xl p-5 sm:p-6 space-y-4 relative border border-gray-700 my-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Upload className="w-5 h-5 text-purple-400" />
          Incarcare CV PDF (Apache Tika Live)
        </h3>

        {uploadedSuccess ? (
          <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center space-y-2">
            <Check className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
            <p className="text-xs font-bold text-emerald-300">CV-ul a fost procesat si asociat cu succes!</p>
            <p className="text-[11px] text-gray-300">{uploadedSuccess}</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="border-2 border-dashed border-gray-700 hover:border-purple-500/50 rounded-2xl p-6 text-center cursor-pointer transition">
              <FileText className="w-10 h-10 text-purple-400 mx-auto mb-2" />
              <p className="text-xs text-gray-300 font-medium">Selecteaza fisierul CV (PDF/DocX)</p>
              <input 
                type="file" 
                accept=".pdf,.docx"
                onChange={e => setSelectedFile(e.target.files[0])}
                className="mt-3 text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600/20 file:text-purple-400 hover:file:bg-purple-600/30"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white text-xs">Anuleaza</button>
              <button type="submit" disabled={!selectedFile || uploading} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/20">
                {uploading ? 'Se proceseaza Tika in Spring Boot...' : 'Proceseaza CV Live'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function AiReportModal({ isOpen, onClose, analysis }) {
  if (!isOpen || !analysis) return null;

  const matching = Array.isArray(analysis.matchingSkills) ? analysis.matchingSkills : [];
  const missing = Array.isArray(analysis.missingSkills) ? analysis.missingSkills : [];
  const score = Number(analysis.matchScore || analysis.semanticMatchScore || 85.0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-5 sm:p-6 space-y-4 relative border border-gray-200 shadow-2xl max-w-2xl w-full max-h-[88vh] flex flex-col text-gray-900 my-auto">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3 border-b border-gray-100 pb-3">
          <div className="p-2.5 bg-black text-white rounded-xl shadow-sm shrink-0">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div className="pr-8">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-extrabold text-gray-950 tracking-tight">
                Raport AI Live • {analysis.jobTitle || 'Job Role'}
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {score.toFixed(1)}% Match
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">{analysis.companyName || 'Companie'}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* MATCHING SKILLS */}
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Skill-uri Identificate ({matching.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {matching.length > 0 ? (
                  matching.map((s, idx) => (
                    <span key={idx} className="text-[11px] font-bold bg-white text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-lg shadow-2xs">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-gray-500 italic">Nu s-au detectat potriviri exacte</span>
                )}
              </div>
            </div>

            {/* MISSING SKILLS / GAP */}
            <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-xl space-y-2">
              <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Skill-uri Lipsă ({missing.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {missing.length > 0 ? (
                  missing.map((s, idx) => (
                    <span key={idx} className="text-[11px] font-bold bg-white text-rose-800 border border-rose-300 px-2 py-0.5 rounded-lg shadow-2xs">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-emerald-700 font-semibold">CV-ul acoperă toate cerințele!</span>
                )}
              </div>
            </div>
          </div>

          {/* DETAILED REPORT */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Analiză Detaliată & Recomandări Live:</h4>
            <pre className="whitespace-pre-wrap font-sans text-xs text-gray-800 leading-relaxed bg-transparent border-0 p-0 m-0">
              {analysis.cleanReportText || analysis.actionPlanMarkdown || 'Analiză finalizată cu succes.'}
            </pre>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-gray-100">
          <button 
            onClick={onClose} 
            className="px-5 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Închide Raportul
          </button>
        </div>
      </div>
    </div>
  );
}
