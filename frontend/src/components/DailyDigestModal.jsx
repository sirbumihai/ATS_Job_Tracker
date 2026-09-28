import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  Send, 
  Settings, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Radio, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  RefreshCw,
  Sliders,
  MessageSquare
} from 'lucide-react';

export default function DailyDigestModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'settings' | 'discord_raw'
  const [settings, setSettings] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [channel, setChannel] = useState('DISCORD');
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState('');
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [emailRecipient, setEmailRecipient] = useState('sarbumihai0@gmail.com');
  const [minMatchScore, setMinMatchScore] = useState(80);
  const [onlyRomania, setOnlyRomania] = useState(true);
  const [onlyJunior, setOnlyJunior] = useState(true);
  const [enabled, setEnabled] = useState(true);

  const fetchSettingsAndPreview = async () => {
    setLoadingPreview(true);
    try {
      const [resSet, resPrev] = await Promise.all([
        fetch('/api/v1/digest/settings'),
        fetch('/api/v1/digest/preview')
      ]);

      if (resSet.ok) {
        const s = await resSet.json();
        setSettings(s);
        setChannel(s.primaryChannel || 'DISCORD');
        setDiscordWebhookUrl(s.discordWebhookUrl || '');
        setTelegramBotToken(s.telegramBotToken || '');
        setTelegramChatId(s.telegramChatId || '');
        setEmailRecipient(s.emailRecipient || 'sarbumihai0@gmail.com');
        setMinMatchScore(s.minMatchScore || 80);
        setOnlyRomania(s.onlyRomania ?? true);
        setOnlyJunior(s.onlyJunior ?? true);
        setEnabled(s.enabled ?? true);
      }

      if (resPrev.ok) {
        const p = await resPrev.json();
        setPreview(p);
      }
    } catch (err) {
      console.error('Eroare la preluarea setarilor de digest:', err);
    } finally {
      setLoadingPreview(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndPreview();
  }, [isOpen]);

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setSavingSettings(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/v1/digest/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled,
          primaryChannel: channel,
          discordWebhookUrl,
          telegramBotToken,
          telegramChatId,
          emailRecipient,
          minMatchScore: Number(minMatchScore),
          maxJobsCount: 5,
          onlyRomania,
          onlyJunior,
          scheduledHour: 9,
          lastDispatchedAt: settings?.lastDispatchedAt || null,
          lastDispatchStatus: settings?.lastDispatchStatus || null
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        // Refresh preview with new settings
        fetchSettingsAndPreview();
      }
    } catch (err) {
      console.error('Eroare la salvarea setarilor de digest:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleTestWebhook = async () => {
    setTestingWebhook(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/v1/digest/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: channel,
          targetDestination: channel === 'DISCORD' ? discordWebhookUrl : channel === 'TELEGRAM' ? telegramChatId : emailRecipient,
          telegramBotToken: telegramBotToken,
          sendTopJobs: true
        })
      });
      if (res.ok) {
        const data = await res.json();
        setTestResult(data);
      }
    } catch (err) {
      setTestResult({ success: false, message: 'Eroare de conexiune la server' });
    } finally {
      setTestingWebhook(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-gray-900 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50/60 via-orange-50/40 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Programat zilnic la 09:00 AM
                </span>
                <span className="text-xs text-gray-400 font-semibold">•</span>
                <span className="text-xs font-bold text-gray-600">Discord / Telegram / Email</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-gray-950">
                Digest Matinal de Joburi Noi & Alerte AI
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchSettingsAndPreview}
              disabled={loadingPreview}
              title="Reincarca previzualizarea"
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-black transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loadingPreview ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-black transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NOTIFICATION FEEDBACK */}
        {testResult && (
          <div className={`px-5 py-2.5 text-xs font-bold flex items-center justify-between transition ${
            testResult.success ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}>
            <span>{testResult.success ? '✓' : '⚠️'} {testResult.message}</span>
            <button onClick={() => setTestResult(null)} className="text-white/80 hover:text-white cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* TABS */}
        <div className="flex border-b border-gray-200 px-5 pt-2 gap-2 bg-gray-50/50">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-2 text-xs font-extrabold rounded-t-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'preview'
                ? 'border-b-2 border-amber-600 text-amber-700 bg-white shadow-2xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Previzualizare Alerta (Top 5 Joburi Potrivite)
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-2 text-xs font-extrabold rounded-t-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-b-2 border-amber-600 text-amber-700 bg-white shadow-2xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-gray-600" />
            Configurare Canale (Discord / Telegram / Email)
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-5">
          
          {/* TAB 1: PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Filtru Automat de Potrivire Inteligenta
                  </h4>
                  <p className="text-[11px] text-amber-900/90 mt-0.5">
                    Scanam cele 8.800+ oferte de munca active si selectam doar pozitiile cu <strong>Match ATS &gt;= {minMatchScore}%</strong> pentru profilul tau <strong>Mihai Sirbu (UPB Automatica)</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleTestWebhook}
                    disabled={testingWebhook}
                    className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Send className={`w-3.5 h-3.5 ${testingWebhook ? 'animate-spin' : ''}`} />
                    {testingWebhook ? 'Se trimite...' : 'Trimite Test Acum'}
                  </button>
                </div>
              </div>

              {/* JOBS CARDS IN DIGEST */}
              <div className="space-y-3">
                {preview?.jobs?.map((job, idx) => (
                  <div key={job.id || idx} className="bg-white border border-gray-200 hover:border-amber-300 rounded-xl p-4 transition shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 shrink-0">
                          #{idx + 1} • {job.matchScore}% Match
                        </span>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider truncate">
                          {job.company}
                        </span>
                        <span className="text-[11px] text-gray-400 font-semibold">• {job.postedDateAgo}</span>
                      </div>

                      <h3 className="font-extrabold text-sm text-gray-950 mt-1 truncate">
                        {job.title}
                      </h3>

                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                        <span>📍 {job.location}</span>
                        <span>•</span>
                        <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">{job.workModel}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {job.keySkills?.map((s, si) => (
                          <span key={si} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                            {s}
                          </span>
                        ))}
                      </div>

                      <p className="text-[11px] text-emerald-800 bg-emerald-50/70 border border-emerald-200/60 rounded-md p-1.5 mt-2 font-medium">
                        💡 {job.matchHighlights}
                      </p>
                    </div>

                    <div className="flex sm:flex-col gap-2 shrink-0">
                      <a
                        href={job.directApplyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 sm:flex-none text-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs"
                      >
                        Aplica Direct <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href={job.outreachHook}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 sm:flex-none text-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 border border-gray-200"
                      >
                        Recruiter LinkedIn <ExternalLink className="w-3 h-3 text-gray-400" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* NETWORKING TIP */}
              {preview?.dailyNetworkingTip && (
                <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-blue-950">
                  <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <strong>Sfatul Zilei de la AI:</strong> {preview.dailyNetworkingTip}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-5">
              
              {/* STATUS ON/OFF */}
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-3.5">
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900">Activare Alerta Zilnica la 09:00 AM</h4>
                  <p className="text-[11px] text-gray-500">Trimite automat raportul in fiecare dimineata daca exista joburi noi.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* CHANNEL SELECTOR */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">Canal Principal de Livrare</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel('DISCORD')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                      channel === 'DISCORD'
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    <span>Discord Webhook</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('TELEGRAM')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                      channel === 'TELEGRAM'
                        ? 'border-blue-500 bg-blue-50/80 text-blue-900'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Send className="w-4 h-4 text-blue-500" />
                    <span>Telegram Bot</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('EMAIL')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                      channel === 'EMAIL'
                        ? 'border-amber-500 bg-amber-50/80 text-amber-900'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Bell className="w-4 h-4 text-amber-500" />
                    <span>Email Digest</span>
                  </button>
                </div>
              </div>

              {/* DISCORD CONFIG */}
              {channel === 'DISCORD' && (
                <div className="space-y-1.5 bg-indigo-50/50 border border-indigo-200 rounded-xl p-3.5">
                  <label className="text-xs font-bold text-indigo-950 block">URL Discord Webhook</label>
                  <input
                    type="url"
                    value={discordWebhookUrl}
                    onChange={(e) => setDiscordWebhookUrl(e.target.value)}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono focus:outline-indigo-600"
                  />
                  <p className="text-[11px] text-gray-500">
                    In Discord: Server Settings -&gt; Integrations -&gt; Webhooks -&gt; New Webhook -&gt; Copy Webhook URL.
                  </p>
                </div>
              )}

              {/* TELEGRAM CONFIG */}
              {channel === 'TELEGRAM' && (
                <div className="space-y-3 bg-blue-50/50 border border-blue-200 rounded-xl p-3.5">
                  <div>
                    <label className="text-xs font-bold text-blue-950 block">Telegram Bot Token</label>
                    <input
                      type="text"
                      value={telegramBotToken}
                      onChange={(e) => setTelegramBotToken(e.target.value)}
                      placeholder="123456789:ABCdefGhIJKlmNoPQRstuVWXyz..."
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono focus:outline-blue-600 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-blue-950 block">Telegram Chat ID (utilizator sau grup)</label>
                    <input
                      type="text"
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      placeholder="Ex: 987654321 sau -10012345678"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono focus:outline-blue-600 mt-1"
                    />
                  </div>
                </div>
              )}

              {/* EMAIL CONFIG */}
              {channel === 'EMAIL' && (
                <div className="space-y-1.5 bg-amber-50/50 border border-amber-200 rounded-xl p-3.5">
                  <label className="text-xs font-bold text-amber-950 block">Adresa de Email Destinatar</label>
                  <input
                    type="email"
                    value={emailRecipient}
                    onChange={(e) => setEmailRecipient(e.target.value)}
                    placeholder="sarbumihai0@gmail.com"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium focus:outline-amber-600"
                  />
                </div>
              )}

              {/* CRITERIA SLIDERS & CHECKBOXES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 border border-gray-200 rounded-xl p-3.5">
                <div>
                  <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                    <span>Scor Minim de Potrivire ATS:</span>
                    <span className="text-blue-600 font-extrabold">{minMatchScore}%</span>
                  </label>
                  <input
                    type="range"
                    min="60"
                    max="95"
                    step="5"
                    value={minMatchScore}
                    onChange={(e) => setMinMatchScore(Number(e.target.value))}
                    className="w-full accent-blue-600 mt-2 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>60% (Mai multe)</span>
                    <span>80% (Recomandat)</span>
                    <span>95% (Foarte stricte)</span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyRomania}
                      onChange={(e) => setOnlyRomania(e.target.checked)}
                      className="rounded-sm text-blue-600 focus:ring-blue-500"
                    />
                    <span>Doar pozitii din Romania & Remote</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyJunior}
                      onChange={(e) => setOnlyJunior(e.target.checked)}
                      className="rounded-sm text-blue-600 focus:ring-blue-500"
                    />
                    <span>Doar Junior / Entry / Graduate</span>
                  </label>
                </div>
              </div>

              {/* SAVE BUTTON */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-gray-500">
                  {saveSuccess && <span className="text-emerald-600 font-bold">✓ Setarile au fost salvate cu succes!</span>}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestWebhook}
                    disabled={testingWebhook}
                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    {testingWebhook ? 'Trimitere...' : 'Testeaza Notificarea'}
                  </button>

                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {savingSettings ? 'Se salveaza...' : 'Salveaza Setarile'}
                  </button>
                </div>
              </div>

            </form>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span className="font-medium">
            Programat prin Spring Boot <code>@Scheduled(cron = "0 0 9 * * ?")</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition cursor-pointer"
          >
            Inchide
          </button>
        </div>
      </div>
    </div>
  );
}
