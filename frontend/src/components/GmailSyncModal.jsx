import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Mail, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X, 
  HelpCircle, 
  ExternalLink, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Bot,
  Check,
  XCircle,
  Wrench
} from 'lucide-react';

export default function GmailSyncModal({ isOpen, onClose, onSyncComplete, activeUserId }) {
  const [email, setEmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [daysToLookBack, setDaysToLookBack] = useState(30);
  const [autoCreateMissing, setAutoCreateMissing] = useState(true);
  const [rememberCredentials, setRememberCredentials] = useState(true);

  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [syncStep, setSyncStep] = useState(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [isRepairing, setIsRepairing] = useState(false);
  const [repairResult, setRepairResult] = useState(null);

  const [testResult, setTestResult] = useState(null); // { success: boolean, message: string }
  const [syncResult, setSyncResult] = useState(null); // GmailSyncResult object
  const [errorMsg, setErrorMsg] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  const abortControllerRef = useRef(null);
  const timerRef = useRef(null);
  const stepTimerRef = useRef(null);

  // Incarca credentialele memorate local
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('ats_gmail_sync_credentials');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.email) setEmail(parsed.email);
          if (parsed.appPassword) setAppPassword(parsed.appPassword);
        }
      } catch (e) {
        console.error('Eroare la citirea credentialelor salvate:', e);
      }
      setTestResult(null);
      setSyncResult(null);
      setErrorMsg(null);
    }
  }, [isOpen]);

  // Blocare scroll pagina cand modalul este deschis + ascultare tasta Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!email || !appPassword) {
      setErrorMsg('Te rugam sa completezi atat adresa de email cat si parola de aplicatie.');
      return;
    }
    setErrorMsg(null);
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/v1/integrations/gmail/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), appPassword: appPassword.trim() })
      });
      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        throw new Error(`Serverul a returnat un raspuns neasteptat (status ${res.status}).`);
      }

      setTestResult({
        success: data.success,
        message: data.message || (data.success ? 'Conexiune reusita!' : 'Eroare la conectare')
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Eroare la testarea conexiunii: ' + err.message
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCancelSync = () => {
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (e) {}
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    setIsSyncing(false);
    setIsCancelled(true);
    setErrorMsg(null);
  };

  const handleRepairCorrupted = async () => {
    setIsRepairing(true);
    setRepairResult(null);
    setErrorMsg(null);
    try {
      const url = activeUserId 
        ? `/api/v1/integrations/gmail/repair?userId=${activeUserId}`
        : '/api/v1/integrations/gmail/repair';
      const res = await fetch(url, { method: 'POST' });
      const data = await res.json();
      setRepairResult(data);
      if (onSyncComplete) onSyncComplete();
    } catch (err) {
      setErrorMsg('Eroare la repararea candidaturilor: ' + err.message);
    } finally {
      setIsRepairing(false);
    }
  };

  const handleRunSync = async () => {
    if (!email || !appPassword) {
      setErrorMsg('Te rugam sa completezi emailul si parola de aplicatie.');
      return;
    }
    setErrorMsg(null);
    setIsCancelled(false);
    setIsSyncing(true);
    setSyncResult(null);
    setRepairResult(null);
    setSyncStep(1);
    setElapsedSeconds(0);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Timer pentru secundar si pasi de progres
    const startTimestamp = Date.now();
    timerRef.current = setInterval(() => {
      const secs = Math.floor((Date.now() - startTimestamp) / 1000);
      setElapsedSeconds(secs);
      if (secs >= 2 && secs < 5) setSyncStep(2);
      else if (secs >= 5 && secs < 9) setSyncStep(3);
      else if (secs >= 9) setSyncStep(4);
    }, 1000);

    // Salveaza credentialele daca este bifat
    if (rememberCredentials) {
      try {
        localStorage.setItem('ats_gmail_sync_credentials', JSON.stringify({
          email: email.trim(),
          appPassword: appPassword.trim()
        }));
      } catch (ignored) {}
    } else {
      localStorage.removeItem('ats_gmail_sync_credentials');
    }

    try {
      const url = activeUserId 
        ? `/api/v1/integrations/gmail/sync?userId=${activeUserId}`
        : '/api/v1/integrations/gmail/sync';

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          email: email.trim(),
          appPassword: appPassword.trim(),
          daysToLookBack,
          autoCreateMissing
        })
      });

      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        throw new Error(`Serverul a returnat codul ${res.status} (${res.statusText || 'Timeout proxy/retea'}). Verifica daca sincronizarea s-a executat.`);
      }

      setSyncStep(5);
      setSyncResult(data);

      if (data.success && onSyncComplete) {
        onSyncComplete();
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setIsCancelled(true);
      } else {
        setErrorMsg('Eroare la sincronizarea cu Gmail: ' + err.message);
      }
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      setIsSyncing(false);
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-morphing-backdrop" 
      onClick={onClose}
    >
      {/* CONTAINER MODAL / SHEET (STIL JOB DETAIL MODAL) */}
      <div 
        className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-auto animate-morphing-dialog flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER BAR FIX CU CLOSE & AJUTOR */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-white/95 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2.5 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider bg-black text-white flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>GMAIL ATS SYNC</span>
            </span>
            <span className="text-xs font-medium text-neutral-500 truncate max-w-[200px] sm:max-w-md">
              Sincronizare Automata & Clasificare AI
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-2 rounded-xl text-neutral-600 hover:text-black hover:bg-neutral-100 transition cursor-pointer flex items-center gap-1.5 text-xs font-medium"
              title="Instructiuni Parola Aplicatie"
            >
              <HelpCircle className="w-4 h-4 text-black" />
              <span className="hidden sm:inline">Ghid Parola</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-500 hover:text-black hover:bg-neutral-100 transition cursor-pointer animate-morphing-close"
              title="Inchide fereastra (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 flex-1 scrollbar-thin">
          
          {/* BANNER HEADER TITLU & DESCRIERE */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight leading-snug flex items-center gap-2">
                <span>Scanare Candidaturi din Gmail</span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-300 px-2 py-0.5 rounded flex items-center gap-1">
                  <Bot className="w-3 h-3 text-black" />
                  AI Powered
                </span>
              </h2>
              <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                Detecteaza automat confirmarile de aplicare, invitatiile la interviu si ofertele de angajare de pe toate platformele ATS (LinkedIn, Greenhouse, Workday, Lever, eJobs, BestJobs, Hipo etc.).
              </p>
            </div>
          </div>

          {/* BANNER SECURITATE */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-neutral-900 shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-900 space-y-1">
              <p className="font-bold">Conexiune Securizata IMAP SSL & Filtrare Inteligenta AI</p>
              <p className="text-neutral-600 leading-relaxed text-[11px]">
                Conexiunea este criptata direct cu <strong>imap.gmail.com (Port 993)</strong> folosind o <strong>Parola de Aplicatie Google</strong> unica. Modelul AI analizeaza doar anteturile de recrutare pentru a elimina falsele alerte si promotiile comerciale.
              </p>
            </div>
          </div>

          {/* FORMULAR DATE DE CONECTARE */}
          <form onSubmit={(e) => { e.preventDefault(); handleRunSync(); }} className="bg-white border border-neutral-200 rounded-xl p-5 sm:p-6 space-y-4">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Key className="w-3.5 h-3.5 text-black" />
              <span>Date de Autentificare Gmail</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Adresa de Gmail
                </label>
                <input 
                  type="email"
                  placeholder="exemplu@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-neutral-700">
                    Parola Aplicatie (16 caractere)
                  </label>
                  <button 
                    type="button"
                    onClick={() => setShowHelp(!showHelp)}
                    className="text-[11px] text-neutral-600 hover:text-black font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Cum o obtii?</span>
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="ex: abcd efgh ijkl mnop"
                    value={appPassword}
                    onChange={e => setAppPassword(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-xl pl-4 pr-10 py-2.5 text-xs font-mono text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black transition"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* ACCORDION GHID PAROLA APLICATIE */}
            {showHelp && (
              <div className="p-4 bg-white border border-gray-200 rounded-2xl space-y-2.5 text-xs text-gray-700 animate-in fade-in duration-150">
                <p className="font-extrabold text-gray-900 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-600" />
                  Instructiuni Google in 3 pasi rapizi:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-gray-600 leading-relaxed text-[11px]">
                  <li>
                    Acceseaza contul la <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="text-red-600 underline font-bold inline-flex items-center gap-0.5">Cont Google &rarr; Securitate <ExternalLink className="w-2.5 h-2.5" /></a>
                  </li>
                  <li>
                    Asigura-te ca <strong>Verificarea in 2 pasi</strong> este activa.
                  </li>
                  <li>
                    Cauta <strong>„Parole pentru aplicatii”</strong> (App Passwords), scrie numele <em>ATS Job Tracker</em> si apasa <strong>Creeaza</strong>.
                  </li>
                  <li>
                    Copiaza codul de 16 litere si lipeste-l in campul de mai sus.
                  </li>
                </ol>
              </div>
            )}

            {/* PREFERINTE SCANARE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-200/70">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Perioada cautare in inbox
                </label>
                <select 
                  value={daysToLookBack}
                  onChange={e => setDaysToLookBack(Number(e.target.value))}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none focus:border-black cursor-pointer font-medium"
                >
                  <option value={7}>Ultimele 7 zile</option>
                  <option value={14}>Ultimele 14 zile</option>
                  <option value={30}>Ultimele 30 zile (Recomandat)</option>
                  <option value={60}>Ultimele 60 zile</option>
                  <option value={90}>Ultimele 90 zile</option>
                </select>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-medium text-neutral-800">
                  <input 
                    type="checkbox"
                    checked={autoCreateMissing}
                    onChange={e => setAutoCreateMissing(e.target.checked)}
                    className="w-4 h-4 rounded text-black focus:ring-black accent-black cursor-pointer"
                  />
                  <span>Creeaza automat carduri pentru aplicari noi</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-medium text-neutral-600">
                  <input 
                    type="checkbox"
                    checked={rememberCredentials}
                    onChange={e => setRememberCredentials(e.target.checked)}
                    className="w-4 h-4 rounded text-black focus:ring-black accent-black cursor-pointer"
                  />
                  <span>Pastreaza datele pe acest browser</span>
                </label>
              </div>
            </div>
          </form>

          {/* BANNER REPARARE RAPIDA A CANDIDATURILOR EXISTENTE */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-neutral-200 flex items-center justify-center shrink-0 text-neutral-900">
                <Wrench className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-neutral-950">Curatare & Auto-Reparare Erori Gmail</p>
                <p className="text-[11px] text-neutral-600 truncate">
                  Corecteaza automat numele eronate ("REQ", "care ai aplicat") si falsele interviuri.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRepairCorrupted}
              disabled={isRepairing || isSyncing}
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shrink-0 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isRepairing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{isRepairing ? 'Se curata...' : 'Repara Datele'}</span>
            </button>
          </div>

          {repairResult && (
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center gap-3 text-xs text-neutral-900 font-bold animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-neutral-900" />
              <span>{repairResult.message || `Au fost verificate si reparate ${repairResult.repaired || 0} candidaturi.`}</span>
            </div>
          )}

          {/* CARD DE PROGRES REAL-TIME & FEEDBACK LIVE IN TIMPUL SINCRONIZARII */}
          {isSyncing && (
            <div className="p-5 sm:p-6 bg-white border border-neutral-200 rounded-xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-neutral-950">
                      Sincronizare in Desfasurare...
                    </h4>
                    <p className="text-[11px] text-neutral-500 font-medium">
                      Procesare automata a emailurilor de recrutare
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-neutral-100 px-3 py-1 rounded-lg border border-neutral-200 text-neutral-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-black" />
                    <span>{elapsedSeconds}s</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCancelSync}
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    title="Opreste imediat procesul"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Opreste</span>
                  </button>
                </div>
              </div>

              {/* BARA DE PROGRES VIZUALA */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-neutral-600 px-0.5">
                  <span>Pasul {syncStep} din 5</span>
                  <span>{Math.min(95, syncStep * 20)}%</span>
                </div>
                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden border border-neutral-200">
                  <div 
                    className="h-full bg-black rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${Math.min(95, Math.max(15, syncStep * 20))}%` }}
                  />
                </div>
              </div>

              {/* LISTA PASILOR DE SCANARE */}
              <div className="grid grid-cols-1 gap-2 pt-1">
                {[
                  { step: 1, title: 'Conectare IMAP securizata la imap.gmail.com (Port 993 SSL)' },
                  { step: 2, title: `Cautare si scanare plicuri mesaje primite in ultimele ${daysToLookBack} zile` },
                  { step: 3, title: 'Filtrare inteligenta anteturi si identificare platforme ATS (LinkedIn, BestJobs, etc.)' },
                  { step: 4, title: 'Clasificare determinista status (Aplicat, Interviu, Respins, Oferta)' },
                  { step: 5, title: 'Salvare securizata si actualizare board Kanban in timp real' }
                ].map((item) => {
                  const isDone = syncStep > item.step;
                  const isCurrent = syncStep === item.step;
                  return (
                    <div 
                      key={item.step} 
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition ${
                        isCurrent 
                          ? 'bg-white border border-indigo-200 shadow-xs font-bold text-indigo-950' 
                          : isDone 
                          ? 'text-emerald-800 font-semibold bg-emerald-50/50' 
                          : 'text-gray-400 font-normal'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-gray-300 text-[10px] flex items-center justify-center font-bold text-gray-400 shrink-0">
                          {item.step}
                        </div>
                      )}
                      <span className="flex-1 truncate sm:whitespace-normal">{item.title}</span>
                      {isCurrent && (
                        <span className="text-[10px] bg-indigo-100 text-indigo-900 font-black px-2 py-0.5 rounded-full shrink-0 animate-pulse">
                          In lucru
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* BANNER ANULAT / OPRIT DE UTILIZATOR */}
          {isCancelled && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900 font-bold animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
                <span>Sincronizarea a fost oprita manual. Datele descarcate anterior sunt in siguranta.</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCancelled(false)}
                className="text-amber-800 hover:text-amber-950 text-xs underline font-extrabold cursor-pointer"
              >
                Inchide
              </button>
            </div>
          )}

          {/* MESAJE DE EROARE / TEST */}
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-800 font-semibold">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {testResult && (
            <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-bold ${
              testResult.success 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* REZULTATE STATISTICI & APLICATII SINCRONIZATE */}
          {syncResult && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 sm:p-5 bg-emerald-50/60 border border-emerald-200 rounded-3xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{syncResult.message}</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-center">
                  <div className="p-3 bg-white/90 rounded-2xl border border-emerald-100 shadow-2xs">
                    <p className="text-xl font-black text-gray-900">{syncResult.emailsScanned}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Emailuri Scanate</p>
                  </div>
                  <div className="p-3 bg-white/90 rounded-2xl border border-emerald-100 shadow-2xs">
                    <p className="text-xl font-black text-indigo-700">{syncResult.matchedEmails}</p>
                    <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Recrutare Verificate</p>
                  </div>
                  <div className="p-3 bg-white/90 rounded-2xl border border-emerald-100 shadow-2xs">
                    <p className="text-xl font-black text-amber-700">{syncResult.updatedApplications}</p>
                    <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Status Actualizat</p>
                  </div>
                  <div className="p-3 bg-white/90 rounded-2xl border border-emerald-100 shadow-2xs">
                    <p className="text-xl font-black text-emerald-700">{syncResult.createdApplications}</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Nou Adaugate</p>
                  </div>
                </div>
              </div>

              {/* LISTA CARDURI ACTUALIZATE */}
              {syncResult.syncDetails && syncResult.syncDetails.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider px-1">
                    Candidaturi identificate si sincronizate:
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {syncResult.syncDetails.map((detail, idx) => (
                      <div 
                        key={idx} 
                        className="p-3 bg-gray-50 hover:bg-gray-100/80 border border-gray-200 rounded-2xl flex items-center justify-between gap-3 text-xs transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 text-gray-900 font-black text-xs shadow-2xs">
                            {detail.companyName?.substring(0, 2).toUpperCase() || 'CP'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-extrabold text-gray-900 truncate">
                                {detail.companyName}
                              </p>
                              {detail.emailDate && (
                                <span className="text-[10px] font-bold text-gray-600 bg-white border border-gray-200 px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                                  <Calendar className="w-2.5 h-2.5 text-gray-400" />
                                  <span>{detail.emailDate}</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 truncate" title={detail.emailSubject}>
                              {detail.jobTitle} • {detail.emailSubject}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {detail.actionTaken === 'UPDATED' ? (
                            <div className="flex items-center gap-1.5 text-xs font-bold">
                              <span className="px-2 py-0.5 rounded-lg bg-gray-200 text-gray-700 line-through text-[11px]">
                                {detail.oldStatus}
                              </span>
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                              <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-[11px]">
                                {detail.newStatus}
                              </span>
                            </div>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-900 text-[11px] font-black border border-indigo-200">
                              Nou: {detail.newStatus}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* FOOTER FIX CU ACTIUNI RAPIDE */}
        <div className="p-4 sm:p-5 bg-white border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-20">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting || isSyncing}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border-neutral-200 disabled:opacity-50"
          >
            {isTesting && <RefreshCw className="w-4 h-4 animate-spin text-neutral-600" />}
            <span>Testeaza Conexiunea</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-medium text-neutral-600 hover:text-black rounded-xl hover:bg-neutral-100 transition cursor-pointer"
            >
              Inchide
            </button>

            {isSyncing ? (
              <button
                type="button"
                onClick={handleCancelSync}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Opreste Sincronizarea</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRunSync}
                disabled={isTesting || isSyncing}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <Mail className="w-4 h-4" />
                <span>Sincronizeaza Acum</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
