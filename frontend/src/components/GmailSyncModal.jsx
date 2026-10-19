import React, { useState, useEffect, useRef } from 'react';
import Modal from './ui/Modal';
import { Mail, CheckCircle2, AlertCircle, RefreshCw, HelpCircle, ExternalLink, ArrowRight, Eye, EyeOff, XCircle, Wrench, Clock } from 'lucide-react';

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


  const handleTestConnection = async () => {
    if (!email || !appPassword) {
      setErrorMsg('Completează adresa de email și parola de aplicație.');
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
        throw new Error(`Serverul a returnat un răspuns neașteptat (status ${res.status}).`);
      }

      setTestResult({
        success: data.success,
        message: data.message || (data.success ? 'Conexiune reușită!' : 'Eroare la conectare')
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
      setErrorMsg('Eroare la repararea aplicațiilor: ' + err.message);
    } finally {
      setIsRepairing(false);
    }
  };

  const handleRunSync = async () => {
    if (!email || !appPassword) {
      setErrorMsg('Completează emailul și parola de aplicație.');
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
        throw new Error(`Serverul a returnat codul ${res.status} (${res.statusText || 'Timeout proxy/rețea'}). Verifică dacă sincronizarea s-a executat.`);
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

  const inputClass = 'w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-brand-500 transition';
  const primaryBtn = 'px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50';
  const secondaryBtn = 'px-4 py-2.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50';

  const syncSteps = [
    { step: 1, title: 'Conectare la Gmail' },
    { step: 2, title: `Scanare mesaje din ultimele ${daysToLookBack} zile` },
    { step: 3, title: 'Filtrare emailuri de recrutare' },
    { step: 4, title: 'Clasificare etapă' },
    { step: 5, title: 'Actualizare board' }
  ];

  const stats = syncResult ? [
    ['Emailuri scanate', syncResult.emailsScanned],
    ['Emailuri de recrutare', syncResult.matchedEmails],
    ['Etape actualizate', syncResult.updatedApplications],
    ['Aplicații noi', syncResult.createdApplications]
  ] : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gmail Sync"
      subtitle="Detectează confirmările, interviurile și ofertele din inbox"
      icon={Mail}
      size="xl"
    >
      <div className="space-y-4">
        <form onSubmit={(e) => { e.preventDefault(); handleRunSync(); }} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="gmail-email" className="block text-xs font-medium text-neutral-700 mb-1.5">Adresa Gmail</label>
              <input
                id="gmail-email"
                type="email"
                placeholder="exemplu@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="gmail-password" className="block text-xs font-medium text-neutral-700">Parolă de aplicație</label>
                <button
                  type="button"
                  onClick={() => setShowHelp(!showHelp)}
                  aria-expanded={showHelp}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Cum o obțin?</span>
                </button>
              </div>
              <div className="relative">
                <input
                  id="gmail-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="abcd efgh ijkl mnop"
                  value={appPassword}
                  onChange={e => setAppPassword(e.target.value)}
                  className={`${inputClass} pr-10 font-mono`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ascunde parola' : 'Arată parola'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {showHelp && (
            <div className="p-4 bg-neutral-50 rounded-xl space-y-2 text-xs text-neutral-700">
              <ol className="list-decimal list-inside space-y-1.5 text-neutral-600">
                <li>
                  Deschide{' '}
                  <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="text-brand-600 underline inline-flex items-center gap-0.5">
                    Cont Google, Securitate <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </li>
                <li>Activează verificarea în doi pași.</li>
                <li>Caută „Parole pentru aplicații”, scrie un nume și apasă Creează.</li>
                <li>Lipește codul de 16 litere în câmpul de mai sus.</li>
              </ol>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label htmlFor="gmail-days" className="block text-xs font-medium text-neutral-700 mb-1.5">Perioadă de căutare</label>
              <select
                id="gmail-days"
                value={daysToLookBack}
                onChange={e => setDaysToLookBack(Number(e.target.value))}
                className={`${inputClass} cursor-pointer`}
              >
                <option value={7}>Ultimele 7 zile</option>
                <option value={14}>Ultimele 14 zile</option>
                <option value={30}>Ultimele 30 de zile</option>
                <option value={60}>Ultimele 60 de zile</option>
                <option value={90}>Ultimele 90 de zile</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-sm text-neutral-800">
                <input
                  type="checkbox"
                  checked={autoCreateMissing}
                  onChange={e => setAutoCreateMissing(e.target.checked)}
                  className="w-4 h-4 rounded accent-brand-500 cursor-pointer"
                />
                <span>Creează automat aplicațiile noi</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-sm text-neutral-600">
                <input
                  type="checkbox"
                  checked={rememberCredentials}
                  onChange={e => setRememberCredentials(e.target.checked)}
                  className="w-4 h-4 rounded accent-brand-500 cursor-pointer"
                />
                <span>Păstrează datele în acest browser</span>
              </label>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-neutral-100 text-sm">
          <div className="min-w-0">
            <p className="font-medium text-neutral-900">Repară datele</p>
            <p className="text-xs text-neutral-500 truncate">Corectează numele și interviurile detectate greșit</p>
          </div>
          <button
            type="button"
            onClick={handleRepairCorrupted}
            disabled={isRepairing || isSyncing}
            className={`${secondaryBtn} shrink-0`}
          >
            {isRepairing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wrench className="w-4 h-4" />}
            <span>{isRepairing ? 'Se repară...' : 'Repară'}</span>
          </button>
        </div>

        {repairResult && (
          <div className="p-3 bg-neutral-50 rounded-xl flex items-center gap-2.5 text-sm text-neutral-900">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-brand-500" />
            <span>{repairResult.message || `Au fost reparate ${repairResult.repaired || 0} aplicații.`}</span>
          </div>
        )}

        {isSyncing && (
          <div className="p-4 bg-neutral-50 rounded-xl space-y-3" role="status">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-900">
                <RefreshCw className="w-4 h-4 animate-spin text-brand-500" />
                <span>Sincronizare în curs</span>
              </div>
              <span className="text-xs text-neutral-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {elapsedSeconds}s
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                <span>Pasul {syncStep} din 5</span>
                <span>{Math.min(95, syncStep * 20)}%</span>
              </div>
              <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(95, Math.max(15, syncStep * 20))}%` }}
                />
              </div>
            </div>

            <ul className="space-y-1">
              {syncSteps.map((item) => {
                const isDone = syncStep > item.step;
                const isCurrent = syncStep === item.step;
                return (
                  <li
                    key={item.step}
                    className={`flex items-center gap-2 text-xs ${isCurrent ? 'text-neutral-950 font-medium' : isDone ? 'text-neutral-600' : 'text-neutral-400'}`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-4 h-4 text-brand-500 animate-spin shrink-0" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-neutral-300 shrink-0" />
                    )}
                    <span>{item.title}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {isCancelled && (
          <div className="p-3 bg-neutral-50 rounded-xl flex items-center justify-between gap-3 text-sm text-neutral-800">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-neutral-500" />
              <span>Sincronizarea a fost oprită. Datele descărcate rămân salvate.</span>
            </div>
            <button type="button" onClick={() => setIsCancelled(false)} className="text-xs underline cursor-pointer">
              Închide
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-50 rounded-xl flex items-center gap-2.5 text-sm text-red-800" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {testResult && (
          <div className={`p-3 rounded-xl flex items-center gap-2.5 text-sm ${testResult.success ? 'bg-brand-50 text-brand-700' : 'bg-red-50 text-red-800'}`}>
            {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{testResult.message}</span>
          </div>
        )}

        {syncResult && (
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-sm font-medium text-neutral-900">
              <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
              <span>{syncResult.message}</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              {stats.map(([label, value]) => (
                <div key={label} className="p-3 bg-neutral-50 rounded-xl">
                  <p className="font-serif text-xl text-neutral-950">{value}</p>
                  <p className="text-xs text-neutral-500">{label}</p>
                </div>
              ))}
            </div>

            {syncResult.syncDetails && syncResult.syncDetails.length > 0 && (
              <ul className="space-y-1.5 max-h-60 overflow-y-auto">
                {syncResult.syncDetails.map((detail, idx) => (
                  <li key={idx} className="p-3 bg-neutral-50 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-medium text-neutral-900 truncate">{detail.companyName}</p>
                      <p className="text-neutral-500 truncate" title={detail.emailSubject}>
                        {detail.jobTitle}{detail.emailDate ? ` · ${detail.emailDate}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {detail.actionTaken === 'UPDATED' ? (
                        <>
                          <span className="px-2 py-0.5 rounded-md bg-neutral-200 text-neutral-600 line-through">{detail.oldStatus}</span>
                          <ArrowRight className="w-3 h-3 text-neutral-400" />
                          <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 font-medium">{detail.newStatus}</span>
                        </>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 font-medium">Nou: {detail.newStatus}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-neutral-100">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting || isSyncing}
            className={secondaryBtn}
          >
            {isTesting && <RefreshCw className="w-4 h-4 animate-spin" />}
            <span>Testează conexiunea</span>
          </button>

          {isSyncing ? (
            <button type="button" onClick={handleCancelSync} className={primaryBtn}>
              <XCircle className="w-4 h-4" />
              <span>Oprește sincronizarea</span>
            </button>
          ) : (
            <button type="button" onClick={handleRunSync} disabled={isTesting || isSyncing} className={primaryBtn}>
              <Mail className="w-4 h-4" />
              <span>Sincronizează acum</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
