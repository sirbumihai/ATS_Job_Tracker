import React, { useEffect, useState } from 'react';
import {
  Lock,
  AlertTriangle,
  Plus,
  Upload,
  FileText,
  BrainCircuit,
  CheckCircle2
} from 'lucide-react';
import Modal from './ui/Modal';
import Card from './ui/Card';
import ScoreRing from './ui/ScoreRing';
import ScoreBar from './ui/ScoreBar';

const LABEL = 'block text-xs font-semibold text-neutral-700 mb-1';
const INPUT = 'w-full bg-white border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition';
const PRIMARY = 'px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
const SECONDARY = 'px-4 py-2.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-lg text-sm font-semibold transition cursor-pointer';

export function AuthModal({ isOpen, onClose, authMode, setAuthMode, authForm, setAuthForm, authError, onSubmit }) {
  const isLogin = authMode === 'login';
  return (
    <Modal isOpen={isOpen} onClose={onClose} icon={Lock} title={isLogin ? 'Autentificare' : 'Cont nou'}>
      {authError && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-3.5">
        {!isLogin && (
          <div>
            <label htmlFor="auth-name" className={LABEL}>Nume complet</label>
            <input
              id="auth-name"
              type="text"
              required
              placeholder="Mihai Sîrbu"
              value={authForm.fullName}
              onChange={e => setAuthForm({ ...authForm, fullName: e.target.value })}
              className={INPUT}
            />
          </div>
        )}

        <div>
          <label htmlFor="auth-email" className={LABEL}>Email</label>
          <input
            id="auth-email"
            type="email"
            required
            placeholder="nume@exemplu.ro"
            value={authForm.email}
            onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
            className={INPUT}
          />
        </div>

        <div>
          <label htmlFor="auth-password" className={LABEL}>Parolă</label>
          <input
            id="auth-password"
            type="password"
            required
            value={authForm.password}
            onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
            className={INPUT}
          />
        </div>

        <button type="submit" className={`${PRIMARY} w-full`}>
          {isLogin ? 'Conectează-te' : 'Creează contul'}
        </button>

        <p className="text-center text-sm text-neutral-500 pt-1">
          {isLogin ? 'Nu ai cont? ' : 'Ai deja cont? '}
          <button
            type="button"
            onClick={() => setAuthMode(isLogin ? 'register' : 'login')}
            className="text-brand-600 font-semibold hover:underline cursor-pointer"
          >
            {isLogin ? 'Creează cont' : 'Conectează-te'}
          </button>
        </p>
      </form>
    </Modal>
  );
}

export function AddJobModal({ isOpen, onClose, newJob, setNewJob, onSubmit }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} icon={Plus} size="lg" title="Adaugă un job" subtitle="Lipește descrierea pentru scorul ATS">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="job-company" className={LABEL}>Companie</label>
            <input
              id="job-company"
              type="text"
              required
              placeholder="ex: Bitdefender"
              value={newJob.companyName}
              onChange={e => setNewJob({ ...newJob, companyName: e.target.value })}
              className={INPUT}
            />
          </div>
          <div>
            <label htmlFor="job-title" className={LABEL}>Rol</label>
            <input
              id="job-title"
              type="text"
              required
              placeholder="ex: Junior Java Developer"
              value={newJob.jobTitle}
              onChange={e => setNewJob({ ...newJob, jobTitle: e.target.value })}
              className={INPUT}
            />
          </div>
        </div>

        <div>
          <label htmlFor="job-description" className={LABEL}>Descrierea jobului</label>
          <textarea
            id="job-description"
            required
            rows={5}
            placeholder="Textul anunțului"
            value={newJob.rawDescription}
            onChange={e => setNewJob({ ...newJob, rawDescription: e.target.value })}
            className={`${INPUT} resize-none leading-relaxed`}
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-1">
          <button type="button" onClick={onClose} className={SECONDARY}>Anulează</button>
          <button type="submit" className={PRIMARY}>Salvează</button>
        </div>
      </form>
    </Modal>
  );
}

export function UploadResumeModal({ isOpen, onClose, onUpload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isOpen) setSelectedFile(null);
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    try {
      await onUpload(selectedFile);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} icon={Upload} title="Încarcă un CV" subtitle="PDF sau DOCX">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label
          htmlFor="resume-file"
          className="block border border-dashed border-neutral-300 hover:border-brand-500 rounded-xl p-6 text-center cursor-pointer transition"
        >
          <FileText className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
          <span className="block text-sm font-medium text-neutral-800">
            {selectedFile ? selectedFile.name : 'Alege fișierul'}
          </span>
        </label>
        <input
          id="resume-file"
          type="file"
          accept=".pdf,.docx"
          aria-label="Fișier CV"
          onChange={e => setSelectedFile(e.target.files?.[0] || null)}
          className="sr-only"
        />

        <div className="flex justify-end gap-2.5">
          <button type="button" onClick={onClose} className={SECONDARY}>Anulează</button>
          <button type="submit" disabled={!selectedFile || uploading} className={PRIMARY}>
            {uploading ? 'Se procesează...' : 'Procesează CV-ul'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function AiReportModal({ isOpen, onClose, analysis }) {
  if (!analysis) return null;

  const matching = Array.isArray(analysis.matchingSkills) ? analysis.matchingSkills : [];
  const missing = Array.isArray(analysis.missingSkills) ? analysis.missingSkills : [];
  const score = Number(analysis.matchScore || analysis.semanticMatchScore || 85.0);
  const verdict = score >= 80 ? 'Potrivire foarte bună' : score >= 60 ? 'Potrivire moderată' : 'Lipsuri importante';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={BrainCircuit}
      size="xl"
      title="Raport ATS"
      subtitle={[analysis.jobTitle, analysis.companyName].filter(Boolean).join(' · ')}
    >
      <div className="max-h-[65vh] overflow-y-auto space-y-5 pr-1">
        <div className="flex items-center gap-5">
          <ScoreRing value={score} label="Scor ATS" />
          <div className="flex-1 min-w-0 space-y-3">
            <p className="font-serif text-lg text-neutral-950">{verdict}</p>
            {matching.length + missing.length > 0 && (
              <ScoreBar label="Competențe acoperite" value={matching.length} max={matching.length + missing.length} />
            )}
          </div>
        </div>

        {matching.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Găsite în CV ({matching.length})</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {matching.map((sk, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-neutral-50 text-neutral-800 border border-neutral-200 rounded-md text-xs font-medium">
                  {sk}
                </span>
              ))}
            </div>
          </div>
        )}

        {missing.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Lipsă ({missing.length})</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {missing.map((sk, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-md text-xs font-medium">
                  {sk}
                </span>
              ))}
            </div>
          </div>
        )}

        {analysis.recommendation && (
          <Card padding="p-4" className="bg-neutral-50">
            <p className="text-xs font-semibold text-neutral-900 mb-1">Recomandare</p>
            <p className="text-sm text-neutral-700 leading-relaxed">{analysis.recommendation}</p>
          </Card>
        )}
      </div>
    </Modal>
  );
}
