import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Send, 
  Mail, 
  Linkedin, 
  Clock, 
  ExternalLink, 
  Copy, 
  Check, 
  CheckCircle2,
  Sparkles, 
  UserCheck, 
  Search, 
  MessageSquare, 
  Calendar, 
  RefreshCw,
  AlertCircle,
  TrendingUp,
  FileCheck
} from 'lucide-react';

export default function OutreachCrmModal({ 
  isOpen, 
  onClose, 
  application,
  initialJobData 
}) {
  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = (prevBodyOverflow === 'hidden' ? '' : prevBodyOverflow);
      document.documentElement.style.overflow = (prevHtmlOverflow === 'hidden' ? '' : prevHtmlOverflow);
    };
  }, [isOpen, onClose]);
  if (!isOpen) return null;

  const company = application?.companyName || initialJobData?.companyName || initialJobData?.company || 'Companie';
  const jobTitle = application?.jobTitle || initialJobData?.jobTitle || initialJobData?.title || 'Software Engineer';
  const appliedDate = application?.appliedDate ? String(application.appliedDate).split('T')[0] : '';
  const applicationId = application?.id || null;

  const [activeTab, setActiveTab] = useState('linkedin_note'); // 'linkedin_note' | 'cold_email' | 'follow_up_1' | 'follow_up_2' | 'starters'
  const [recruiterName, setRecruiterName] = useState('');
  const [loading, setLoading] = useState(false);
  const [bundle, setBundle] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const fetchOutreachBundle = async (customRecruiter = '') => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/outreach/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: applicationId,
          companyName: company,
          jobTitle: jobTitle,
          recruiterName: customRecruiter || recruiterName || 'Hiring Manager',
          appliedDate: appliedDate || null,
          tone: 'PROFESSIONAL_ENGAGING',
          targetRecipientRole: 'RECRUITER'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setBundle(data);
      }
    } catch (err) {
      console.error('Eroare la preluarea bundle-ului de outreach:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutreachBundle();
  }, [application, initialJobData]);

  const handleCopy = (text, key, label) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setToastMessage(`Copiat in clipboard: ${label}!`);
    setTimeout(() => {
      setCopiedKey(null);
      setToastMessage('');
    }, 2500);
  };

  const handleRecruiterSubmit = (e) => {
    e.preventDefault();
    fetchOutreachBundle(recruiterName);
  };

  return typeof document !== 'undefined' ? createPortal(
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-morphing-backdrop"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-neutral-900 font-sans my-auto animate-morphing-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-xs shrink-0">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md">
                  Recruiter Outreach CRM
                </span>
                <span className="text-xs text-neutral-300 font-semibold">•</span>
                <span className="text-xs font-bold text-neutral-600">{company}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-950 truncate max-w-[480px]">
                {jobTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOutreachBundle(recruiterName)}
              disabled={loading}
              title="Regenereaza mesajele"
              className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-black transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-neutral-100 text-neutral-500 hover:text-black transition cursor-pointer animate-morphing-close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOAST FEEDBACK */}
        {toastMessage && (
          <div className="bg-black text-white text-xs font-mono font-bold px-4 py-2 text-center transition animate-in slide-in-from-top flex items-center justify-center gap-1.5 border-b border-neutral-800">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* CADENCE & TIMELINE STATUS STRIP */}
        {bundle?.cadence && (
          <div className="bg-neutral-50 border-b border-neutral-200 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-black mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-950">
                    {bundle.cadence.stageLabel}
                  </span>
                  <span className="text-[10px] font-mono bg-neutral-200 text-neutral-800 font-semibold px-2 py-0.5 rounded-md">
                    {appliedDate ? `Aplicat la ${appliedDate}` : 'Aplicare recenta'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600 font-medium mt-0.5">
                  {bundle.cadence.actionRecommendation}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-1.5 self-start sm:self-auto">
              {bundle.cadence.daysElapsed < 5 ? (
                <button
                  onClick={() => setActiveTab('linkedin_note')}
                  className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Linkedin className="w-3.5 h-3.5" /> Pasul 1: Nota LinkedIn
                </button>
              ) : bundle.cadence.daysElapsed < 10 ? (
                <button
                  onClick={() => setActiveTab('follow_up_1')}
                  className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" /> Pasul 2: Follow-Up #1
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('follow_up_2')}
                  className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <TrendingUp className="w-3.5 h-3.5" /> Pasul 3: Follow-Up #2
                </button>
              )}
            </div>
          </div>
        )}

        {/* BODY CONTAINER */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* QUICK RECRUITER SEARCH & PERSONALIZATION BAR */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-black" />
                Gaseste persoana potrivita la {company}:
              </span>
              <a
                href={bundle?.recruiterSearchUrl || `https://www.linkedin.com/search/results/people/?keywords=Recruiter%20${encodeURIComponent(company)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-900 text-xs font-semibold rounded-xl shadow-2xs transition"
              >
                <Linkedin className="w-3 h-3 text-black" /> Recruiteri {company}
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </a>
              <a
                href={bundle?.engineeringManagerSearchUrl || `https://www.linkedin.com/search/results/people/?keywords=Engineering%20Manager%20${encodeURIComponent(company)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-900 text-xs font-semibold rounded-xl shadow-2xs transition"
              >
                <UserCheck className="w-3 h-3 text-black" /> Engineering Managers
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </a>
            </div>

            {/* PERSONALIZATION INPUT */}
            <form onSubmit={handleRecruiterSubmit} className="flex items-center gap-1.5 shrink-0">
              <input
                type="text"
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                placeholder="Ex: Andreea sau Popescu..."
                className="px-3 py-1.5 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-black w-36 sm:w-44"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Personalizeaza
              </button>
            </form>
          </div>

          {/* MESSAGE SELECTOR TABS */}
          <div className="flex border-b border-neutral-200 overflow-x-auto gap-1 pb-1">
            <button
              onClick={() => setActiveTab('linkedin_note')}
              className={`px-3 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'linkedin_note'
                  ? 'border-b-2 border-black text-black bg-neutral-100/80'
                  : 'text-neutral-500 hover:text-black hover:bg-neutral-50'
              }`}
            >
              <Linkedin className="w-3.5 h-3.5 text-black" />
              Nota LinkedIn (&lt;300 caractere)
              {bundle?.linkedinNote && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                  bundle.linkedinNote.characterCount <= 300 ? 'bg-neutral-200 text-neutral-900' : 'bg-neutral-900 text-white'
                }`}>
                  {bundle.linkedinNote.characterCount}/300
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('cold_email')}
              className={`px-3 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'cold_email'
                  ? 'border-b-2 border-black text-black bg-neutral-100/80'
                  : 'text-neutral-500 hover:text-black hover:bg-neutral-50'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-black" />
              Cold Email (4 Paragrafe)
            </button>

            <button
              onClick={() => setActiveTab('follow_up_1')}
              className={`px-3 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'follow_up_1'
                  ? 'border-b-2 border-black text-black bg-neutral-100/80'
                  : 'text-neutral-500 hover:text-black hover:bg-neutral-50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-black" />
              Follow-Up #1 (Ziua 5)
            </button>

            <button
              onClick={() => setActiveTab('follow_up_2')}
              className={`px-3 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'follow_up_2'
                  ? 'border-b-2 border-black text-black bg-neutral-100/80'
                  : 'text-neutral-500 hover:text-black hover:bg-neutral-50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-black" />
              Follow-Up #2 (Ziua 10)
            </button>

            <button
              onClick={() => setActiveTab('starters')}
              className={`px-3 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'starters'
                  ? 'border-b-2 border-black text-black bg-neutral-100/80'
                  : 'text-neutral-500 hover:text-black hover:bg-neutral-50'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-black" />
              Icebreakers & Cautari Google
            </button>
          </div>

          {/* TAB 1: LINKEDIN NOTE */}
          {activeTab === 'linkedin_note' && bundle?.linkedinNote && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                    <Linkedin className="w-4 h-4 text-black" />
                    {bundle.linkedinNote.title}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {bundle.linkedinNote.advice}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${
                    bundle.linkedinNote.characterCount <= 300 
                      ? 'bg-neutral-100 text-neutral-900 border-neutral-300' 
                      : 'bg-neutral-900 text-white border-neutral-950'
                  }`}>
                    {bundle.linkedinNote.characterCount} / 300 caractere
                  </span>
                  <button
                    onClick={() => handleCopy(bundle.linkedinNote.content, 'linkedin_note', 'Nota LinkedIn')}
                    className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    {copiedKey === 'linkedin_note' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'linkedin_note' ? 'Copiat!' : 'Copiaza Nota'}
                  </button>
                </div>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs sm:text-[13px] leading-relaxed font-sans text-neutral-800 whitespace-pre-wrap select-all">
                {bundle.linkedinNote.content}
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 flex items-start gap-2 text-xs text-neutral-700">
                <Sparkles className="w-4 h-4 text-black mt-0.5 shrink-0" />
                <p>
                  <strong>Cum trimiti:</strong> Mergi pe profilul LinkedIn al recruiterului de la <strong>{company}</strong>, apasa <strong>Connect</strong>, apoi alege obligatoriu <strong>"Add a note"</strong> si lipeste textul de mai sus. Nu trimite niciodata cerere goala!
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: COLD EMAIL */}
          {activeTab === 'cold_email' && bundle?.coldEmail && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-black" />
                    {bundle.coldEmail.title}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {bundle.coldEmail.advice}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:?subject=${encodeURIComponent(bundle.coldEmail.subject)}&body=${encodeURIComponent(bundle.coldEmail.content)}`}
                    className="px-3.5 py-1.5 bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Deschide Mail
                  </a>
                  <button
                    onClick={() => handleCopy(bundle.coldEmail.content, 'cold_email', 'Cold Email')}
                    className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    {copiedKey === 'cold_email' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'cold_email' ? 'Copiat!' : 'Copiaza Email'}
                  </button>
                </div>
              </div>

              {/* SUBJECT FIELD */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs">
                <span className="font-bold text-neutral-500 font-mono uppercase text-[11px]">Subiect:</span>
                <span className="font-semibold text-neutral-900 flex-1 truncate">{bundle.coldEmail.subject}</span>
                <button
                  onClick={() => handleCopy(bundle.coldEmail.subject, 'email_sub', 'Subiectul')}
                  className="text-xs font-semibold text-neutral-900 hover:underline cursor-pointer"
                >
                  {copiedKey === 'email_sub' ? 'Copiat!' : 'Copiaza'}
                </button>
              </div>

              {/* BODY FIELD */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs sm:text-[13px] leading-relaxed font-sans text-neutral-800 whitespace-pre-wrap select-all max-h-72 overflow-y-auto">
                {bundle.coldEmail.content}
              </div>

              <div className="text-[11px] text-neutral-500 italic">
                * Nu uita sa atasezi CV-ul tau in format PDF inainte de expediere!
              </div>
            </div>
          )}

          {/* TAB 3: FOLLOW UP #1 */}
          {activeTab === 'follow_up_1' && bundle?.followUp1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-black" />
                    {bundle.followUp1.title}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {bundle.followUp1.advice}
                  </p>
                </div>

                <button
                  onClick={() => handleCopy(bundle.followUp1.content, 'follow_up_1', 'Follow-Up #1')}
                  className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  {copiedKey === 'follow_up_1' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'follow_up_1' ? 'Copiat!' : 'Copiaza Mesaj'}
                </button>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs sm:text-[13px] leading-relaxed font-sans text-neutral-800 whitespace-pre-wrap select-all">
                {bundle.followUp1.content}
              </div>
            </div>
          )}

          {/* TAB 4: FOLLOW UP #2 */}
          {activeTab === 'follow_up_2' && bundle?.followUp2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-black" />
                    {bundle.followUp2.title}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {bundle.followUp2.advice}
                  </p>
                </div>

                <button
                  onClick={() => handleCopy(bundle.followUp2.content, 'follow_up_2', 'Follow-Up #2')}
                  className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  {copiedKey === 'follow_up_2' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'follow_up_2' ? 'Copiat!' : 'Copiaza Mesaj'}
                </button>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs sm:text-[13px] leading-relaxed font-sans text-neutral-800 whitespace-pre-wrap select-all">
                {bundle.followUp2.content}
              </div>
            </div>
          )}

          {/* TAB 5: STARTERS & BOOLEAN QUERIES */}
          {activeTab === 'starters' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Formule de Initiere a Conversatiei (Icebreakers)
                </h3>
                <p className="text-xs text-neutral-500">
                  Fraze scurte pe care le poti folosi daca recruiterul accepta cererea de conectare:
                </p>
              </div>

              <div className="space-y-2.5">
                {bundle?.conversationStarters?.map((starter, i) => (
                  <div key={i} className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 flex items-start justify-between gap-3 text-xs text-neutral-800">
                    <p className="leading-relaxed font-medium">"{starter}"</p>
                    <button
                      onClick={() => handleCopy(starter, `starter_${i}`, 'Icebreaker')}
                      className="text-black hover:underline font-semibold shrink-0 cursor-pointer"
                    >
                      {copiedKey === `starter_${i}` ? 'Copiat!' : 'Copiaza'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5 mb-2">
                  <Search className="w-3.5 h-3.5 text-black" /> Interogari Booleene Recruiter (Google / LinkedIn)
                </h4>
                <div className="space-y-1.5">
                  {bundle?.recruiterBooleanQueries?.map((query, idx) => (
                    <div key={idx} className="bg-neutral-900 text-neutral-200 font-mono text-[11px] p-2.5 rounded-xl flex items-center justify-between gap-2 border border-neutral-800">
                      <span className="truncate">{query}</span>
                      <button
                        onClick={() => handleCopy(query, `query_${idx}`, 'Interogare Booleana')}
                        className="text-neutral-400 hover:text-white font-mono font-medium text-xs shrink-0 cursor-pointer"
                      >
                        {copiedKey === `query_${idx}` ? 'Copiat!' : 'Copiaza'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-5 py-3.5 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs text-neutral-500">
          <span className="flex items-center gap-1.5 font-medium">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            Optimizat cu background-ul tau UPB & SIMAVI
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-semibold rounded-xl transition cursor-pointer"
          >
            Inchide
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;
}
