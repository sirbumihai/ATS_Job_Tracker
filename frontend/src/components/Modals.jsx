import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev === 'hidden' ? '' : prev;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div 
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white text-gray-900 w-full max-w-md rounded-3xl p-6 sm:p-7 space-y-4 relative border border-gray-200 shadow-2xl my-auto animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-200">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-gray-950 tracking-tight">
              {authMode === 'login' ? 'Autentificare Utilizator' : 'Inregistrare Cont Nou'}
            </h3>
            <p className="text-xs text-gray-500 font-semibold">Spring Security 6 + Token JWT</p>
          </div>
        </div>

        {authError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3.5 text-sm">
          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nume Complet</label>
              <input 
                type="text" 
                required
                placeholder="Mihai Sirbu"
                value={authForm.fullName}
                onChange={e => setAuthForm({...authForm, fullName: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black font-medium transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Adresa Email</label>
            <input 
              type="email" 
              required
              placeholder="nume@exemplu.ro"
              value={authForm.email}
              onChange={e => setAuthForm({...authForm, email: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black font-medium transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Parola Cont</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              value={authForm.password}
              onChange={e => setAuthForm({...authForm, password: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black font-medium transition"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold text-xs shadow-sm transition cursor-pointer"
          >
            {authMode === 'login' ? 'Conectare in Cont' : 'Creeaza Contul Acum'}
          </button>

          <div className="text-center pt-2 border-t border-gray-100">
            {authMode === 'login' ? (
              <p className="text-xs text-gray-500 font-medium">
                Nu ai un cont?{' '}
                <button type="button" onClick={() => setAuthMode('register')} className="text-blue-600 font-bold hover:underline cursor-pointer">
                  Inregistreaza-te acum
                </button>
              </p>
            ) : (
              <p className="text-xs text-gray-500 font-medium">
                Ai deja cont?{' '}
                <button type="button" onClick={() => setAuthMode('login')} className="text-blue-600 font-bold hover:underline cursor-pointer">
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
  useEffect(() => {
    if (!isOpen) return;
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white text-gray-900 w-full max-w-lg rounded-3xl p-6 sm:p-7 space-y-4 relative border border-gray-200 shadow-2xl my-auto animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-200">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-gray-950 tracking-tight">
              Adauga un Job Nou in Tracker
            </h3>
            <p className="text-xs text-gray-500 font-semibold">Introducere manuala sau descriere bruta</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Nume Companie</label>
            <input 
              type="text" 
              required
              placeholder="ex: Google, UiPath, Bitdefender, BRD"
              value={newJob.companyName}
              onChange={e => setNewJob({...newJob, companyName: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black font-medium transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Titlul Rolului / Pozitiei</label>
            <input 
              type="text" 
              required
              placeholder="ex: Junior Java Backend Developer"
              value={newJob.jobTitle}
              onChange={e => setNewJob({...newJob, jobTitle: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black font-medium transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Descrierea Jobului (Text pentru ATS Match)</label>
            <textarea 
              required
              rows={5}
              placeholder="Lipeste textul descrierii jobului aici pentru analiza automata a compatibilitatii..."
              value={newJob.rawDescription}
              onChange={e => setNewJob({...newJob, rawDescription: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black font-medium transition resize-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Anuleaza
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
            >
              Salveaza Jobul
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export function UploadResumeModal({ isOpen, onClose, selectedFile, setSelectedFile, uploading, uploadedSuccess, onSubmit }) {
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev === 'hidden' ? '' : prev;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div 
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white text-gray-900 w-full max-w-md rounded-3xl p-6 sm:p-7 space-y-4 relative border border-gray-200 shadow-2xl my-auto animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-2xl border border-purple-200">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-gray-950 tracking-tight">
              Incarcare CV PDF
            </h3>
            <p className="text-xs text-gray-500 font-semibold">Procesare text & parsare competente</p>
          </div>
        </div>

        {uploadedSuccess ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
            <Check className="w-8 h-8 text-emerald-600 mx-auto animate-bounce" />
            <p className="text-xs font-bold text-emerald-900">CV-ul a fost procesat si asociat cu succes!</p>
            <p className="text-[11px] text-emerald-700">{uploadedSuccess}</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="border-2 border-dashed border-gray-200 hover:border-purple-400 bg-gray-50/50 hover:bg-purple-50/30 rounded-2xl p-6 text-center cursor-pointer transition">
              <FileText className="w-10 h-10 text-purple-600 mx-auto mb-2" />
              <p className="text-xs text-gray-700 font-bold">Selecteaza fisierul CV (PDF sau DOCX)</p>
              <input 
                type="file" 
                accept=".pdf,.docx"
                onChange={e => setSelectedFile(e.target.files[0])}
                className="mt-3 text-xs text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-gray-200 file:text-xs file:font-bold file:bg-white file:text-gray-900 hover:file:bg-gray-100 cursor-pointer"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Anuleaza
              </button>
              <button 
                type="submit" 
                disabled={!selectedFile || uploading} 
                className="px-5 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                {uploading ? 'Se proceseaza CV...' : 'Proceseaza CV'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function AiReportModal({ isOpen, onClose, analysis }) {
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev === 'hidden' ? '' : prev;
      };
    }
  }, [isOpen]);

  if (!isOpen || !analysis) return null;

  const matching = Array.isArray(analysis.matchingSkills) ? analysis.matchingSkills : [];
  const missing = Array.isArray(analysis.missingSkills) ? analysis.missingSkills : [];
  const score = Number(analysis.matchScore || analysis.semanticMatchScore || 85.0);

  return (
    <div 
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl p-6 sm:p-7 space-y-4 relative border border-gray-200 shadow-2xl max-w-2xl w-full max-h-[88vh] flex flex-col text-gray-900 my-auto animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-200">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-gray-950 tracking-tight">Raport Analiza AI & Compatibilitate ATS</h3>
            <p className="text-xs text-gray-500 font-semibold">Comparatie semantica intre cerintele jobului si profilul tau</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Scor General de Potrivire</span>
            <span className="text-2xl font-black text-gray-950">{score.toFixed(1)}% Match ATS</span>
          </div>
          <span className={`px-3 py-1 rounded-xl text-xs font-extrabold border ${
            score >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
            score >= 60 ? 'bg-amber-50 text-amber-700 border-amber-200' :
            'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            {score >= 80 ? 'Candidat Excelent' : score >= 60 ? 'Potrivire Moderata' : 'Gap-uri Semnificative'}
          </span>
        </div>

        <div className="overflow-y-auto space-y-4 flex-1 pr-1">
          {matching.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Competente Validate in CV ({matching.length})</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {matching.map((sk, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold">
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {missing.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Competente Cheie Lipsa ({missing.length})</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {missing.map((sk, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold">
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {analysis.recommendation && (
            <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-1">
              <span className="text-xs font-extrabold text-blue-950 uppercase tracking-wider">Recomandare Strategica:</span>
              <p className="text-xs text-blue-900 font-medium leading-relaxed">{analysis.recommendation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
