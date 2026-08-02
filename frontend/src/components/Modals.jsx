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

export function AuthModal({ show, onClose, authMode, setAuthMode, authForm, setAuthForm, authError, onSubmit }) {
  if (!show) return null;
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

        <form onSubmit={onSubmit} className="space-y-3.5 text-sm">
          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Nume Complet</label>
              <input 
                type="text" 
                required
                placeholder="Alexandru Sîrbu"
                value={authForm.fullName}
                onChange={e => setAuthForm({...authForm, fullName: e.target.value})}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Adresă Email</label>
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
            <label className="block text-xs font-semibold text-gray-400 mb-1">Parolă</label>
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
            {authMode === 'login' ? 'Autentifică-te & Generează JWT Token' : 'Creează Contul Nativ'}
          </button>

          <div className="text-center pt-2 border-t border-gray-800">
            {authMode === 'login' ? (
              <p className="text-xs text-gray-400">
                Nu ai un cont?{' '}
                <button type="button" onClick={() => setAuthMode('register')} className="text-blue-400 font-bold hover:underline">
                  Înregistrează-te acum
                </button>
              </p>
            ) : (
              <p className="text-xs text-gray-400">
                Ai deja cont?{' '}
                <button type="button" onClick={() => setAuthMode('login')} className="text-blue-400 font-bold hover:underline">
                  Autentifică-te
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddJobModal({ show, onClose, newJob, setNewJob, onSubmit }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="glass-card w-full max-w-lg rounded-2xl p-5 sm:p-6 space-y-4 relative border border-gray-700 my-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-400" />
          Adaugă un Job Nou în Sistem
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
              placeholder="Lipește descrierea jobului aici..."
              value={newJob.rawDescription}
              onChange={e => setNewJob({...newJob, rawDescription: e.target.value})}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white text-xs">Anulează</button>
            <button type="submit" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20">Salvează Jobul</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function UploadResumeModal({ show, onClose, selectedFile, setSelectedFile, uploading, uploadedSuccess, onSubmit }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="glass-card w-full max-w-md rounded-2xl p-5 sm:p-6 space-y-4 relative border border-gray-700 my-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Upload className="w-5 h-5 text-purple-400" />
          Încărcare CV PDF (Apache Tika Live)
        </h3>

        {uploadedSuccess ? (
          <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center space-y-2">
            <Check className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
            <p className="text-xs font-bold text-emerald-300">CV-ul a fost procesat și asociat cu succes!</p>
            <p className="text-[11px] text-gray-300">{uploadedSuccess}</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
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
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white text-xs">Anulează</button>
              <button type="submit" disabled={!selectedFile || uploading} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/20">
                {uploading ? 'Se procesează Tika în Spring Boot...' : 'Procesează CV Live'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function AiReportModal({ show, onClose, selectedAnalysis }) {
  if (!show || !selectedAnalysis) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="glass-card w-full max-w-2xl max-h-[85vh] rounded-2xl p-5 sm:p-6 space-y-4 relative border border-gray-700 flex flex-col my-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30 shrink-0">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">Raport AI Gap Analysis Live (Groq Llama 3.3 & pgvector)</h3>
            <p className="text-xs text-gray-400">{selectedAnalysis.jobTitle} la {selectedAnalysis.companyName}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs text-gray-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
              <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Skill-uri Potrivite:
              </span>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {selectedAnalysis.matchingSkills.map(s => (
                  <span key={s} className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">{s}</span>
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1">
              <span className="text-xs font-extrabold text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Skill-uri Lipsă (Gap):
              </span>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {selectedAnalysis.missingSkills.map(s => (
                  <span key={s} className="text-[10px] font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded">{s}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 space-y-2">
            <pre className="whitespace-pre-wrap font-sans text-xs text-gray-300 leading-relaxed">
              {selectedAnalysis.markdown}
            </pre>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-800">
          <button onClick={onClose} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold">Închide Raportul</button>
        </div>
      </div>
    </div>
  );
}
