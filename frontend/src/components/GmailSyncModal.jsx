import React, { useState, useEffect } from 'react';
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
  Sparkles
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
  const [testResult, setTestResult] = useState(null); // { success: boolean, message: string }
  const [syncResult, setSyncResult] = useState(null); // GmailSyncResult object
  const [errorMsg, setErrorMsg] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  // Incarca credențialele memorate local
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
        console.error('Eroare la citirea credențialelor salvate:', e);
      }
      setTestResult(null);
      setSyncResult(null);
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!email || !appPassword) {
      setErrorMsg('Te rugăm să completezi atât adresa de email cât și parola de aplicație.');
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

  const handleRunSync = async () => {
    if (!email || !appPassword) {
      setErrorMsg('Te rugăm să completezi emailul și parola de aplicație.');
      return;
    }
    setErrorMsg(null);
    setIsSyncing(true);
    setSyncResult(null);

    // Salveaza credențialele dacă este bifat
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

      setSyncResult(data);

      if (data.success && onSyncComplete) {
        onSyncComplete();
      }
    } catch (err) {
      setErrorMsg('Eroare la sincronizarea cu Gmail: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900"
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-red-50/60 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-200">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">Sincronizare Automată Gmail</h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 tracking-wider">
                  ATS Auto-Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Detectează automat confirmările de aplicare, invitațiile la interviu și ofertele
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BODY (SCROLLABLE) */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* BANNER INFORMATIV */}
          <div className="p-3 bg-red-50/80 border border-red-200/80 rounded-2xl flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-red-950 space-y-1">
              <p className="font-bold">Securitate Maximă & Conexiune Criptată SSL</p>
              <p className="text-red-900/80 leading-relaxed">
                Aplicația se conectează direct la serverul Gmail prin <strong>IMAP SSL (Port 993)</strong> folosind o <strong>Parolă de Aplicație Google</strong> unică. Parola contului tău principal rămâne în siguranță și neatinsă.
              </p>
            </div>
          </div>

          {/* FORMULAR CREDENTIALE */}
          <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Adresă Email Gmail
              </label>
              <input 
                type="email"
                placeholder="exemplu@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-700">
                  Parolă de Aplicație Google (16 caractere)
                </label>
                <button 
                  type="button"
                  onClick={() => setShowHelp(!showHelp)}
                  className="text-[11px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Cum obții această parolă?</span>
                </button>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="ex: abcd efgh ijkl mnop"
                  value={appPassword}
                  onChange={e => setAppPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-9 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* ACCORDION GHID PAROLA APLICATIE */}
            {showHelp && (
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 text-[11px] text-slate-700 animate-in fade-in duration-150">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-600" />
                  Instrucțiuni Google în 3 pași simpli (sub 1 minut):
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  <li>
                    Accesează <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="text-red-600 underline font-bold inline-flex items-center gap-0.5">Contul tău Google &rarr; Securitate <ExternalLink className="w-2.5 h-2.5" /></a>
                  </li>
                  <li>
                    Asigură-te că <strong>Verificarea în 2 pași</strong> este activată.
                  </li>
                  <li>
                    Caută <strong>„Parole pentru aplicații”</strong> (App Passwords), scrie numele <em>ATS Job Tracker</em> și apasă <strong>Creează</strong>.
                  </li>
                  <li>
                    Copiază codul galben de 16 litere și lipește-l în căsuța de mai sus.
                  </li>
                </ol>
              </div>
            )}

            {/* SETĂRI ADIȚIONALE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Interval scanare emailuri
                </label>
                <select 
                  value={daysToLookBack}
                  onChange={e => setDaysToLookBack(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value={7}>Ultimele 7 zile</option>
                  <option value={14}>Ultimele 14 zile</option>
                  <option value={30}>Ultimele 30 zile (Recomandat)</option>
                  <option value={60}>Ultimele 60 zile</option>
                </select>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] font-bold text-slate-800">
                  <input 
                    type="checkbox"
                    checked={autoCreateMissing}
                    onChange={e => setAutoCreateMissing(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-red-600 focus:ring-red-500 accent-red-600 cursor-pointer"
                  />
                  <span>Creează automat joburi noi găsite</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] font-semibold text-slate-600">
                  <input 
                    type="checkbox"
                    checked={rememberCredentials}
                    onChange={e => setRememberCredentials(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-red-600 focus:ring-red-500 accent-red-600 cursor-pointer"
                  />
                  <span>Memorează pe acest dispozitiv</span>
                </label>
              </div>
            </div>
          </div>

          {/* MESAJE DE EROARE / TEST */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {testResult && (
            <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
              testResult.success 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* REZULTATE SINCRONIZARE */}
          {syncResult && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{syncResult.message}</span>
                </div>
                
                <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                  <div className="p-2 bg-white/80 rounded-xl border border-emerald-100">
                    <p className="text-base font-black text-slate-900">{syncResult.emailsScanned}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Scanate</p>
                  </div>
                  <div className="p-2 bg-white/80 rounded-xl border border-emerald-100">
                    <p className="text-base font-black text-indigo-700">{syncResult.matchedEmails}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Recrutare</p>
                  </div>
                  <div className="p-2 bg-white/80 rounded-xl border border-emerald-100">
                    <p className="text-base font-black text-amber-700">{syncResult.updatedApplications}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Actualizate</p>
                  </div>
                  <div className="p-2 bg-white/80 rounded-xl border border-emerald-100">
                    <p className="text-base font-black text-emerald-700">{syncResult.createdApplications}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Nou Adăugate</p>
                  </div>
                </div>
              </div>

              {/* LISTA DE DETALII APLICATII ACTUALIZATE */}
              {syncResult.syncDetails && syncResult.syncDetails.length > 0 && (
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  <p className="text-[11px] font-bold text-slate-700 px-1">
                    Candidaturi detectate și procesate:
                  </p>
                  {syncResult.syncDetails.map((detail, idx) => (
                    <div 
                      key={idx} 
                      className="p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 rounded-xl flex items-center justify-between gap-3 text-xs transition"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-slate-200/70 flex items-center justify-center shrink-0 text-slate-700 font-black text-[11px]">
                          {detail.companyName?.substring(0, 2).toUpperCase() || 'CP'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-900 truncate">
                            {detail.companyName}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate" title={detail.emailSubject}>
                            {detail.jobTitle} • {detail.emailSubject}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {detail.actionTaken === 'UPDATED' ? (
                          <div className="flex items-center gap-1 text-[10px] font-bold">
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 line-through">
                              {detail.oldStatus}
                            </span>
                            <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {detail.newStatus}
                            </span>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold border border-indigo-200">
                            Nou: {detail.newStatus}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting || isSyncing}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {isTesting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>Testează Conexiunea</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Închide
            </button>

            <button
              type="button"
              onClick={handleRunSync}
              disabled={isTesting || isSyncing}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-red-200 disabled:opacity-50 active:scale-95"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Se sincronizează...</span>
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5" />
                  <span>Sincronizează Acum</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
