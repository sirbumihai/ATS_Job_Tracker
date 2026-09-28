import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Mail, 
  Linkedin, 
  Clock, 
  ExternalLink, 
  Copy, 
  Check, 
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
    setToastMessage(`Copiat în clipboard: ${label}!`);
    setTimeout(() => {
      setCopiedKey(null);
      setToastMessage('');
    }, 2500);
  };

  const handleRecruiterSubmit = (e) => {
    e.preventDefault();
    fetchOutreachBundle(recruiterName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-gray-900 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                  Recruiter Outreach CRM
                </span>
                <span className="text-xs text-gray-400 font-semibold">•</span>
                <span className="text-xs font-bold text-gray-600">{company}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-gray-950 truncate max-w-[480px]">
                {jobTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOutreachBundle(recruiterName)}
              disabled={loading}
              title="Regenerează mesajele"
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-black transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-black transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOAST FEEDBACK */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 text-center transition animate-in slide-in-from-top">
            ✓ {toastMessage}
          </div>
        )}

        {/* CADENCE & TIMELINE STATUS STRIP */}
        {bundle?.cadence && (
          <div className="bg-amber-50/70 border-b border-amber-200/80 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-amber-950">
                    {bundle.cadence.stageLabel}
                  </span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.2 rounded-full">
                    {appliedDate ? `Aplicat la ${appliedDate}` : 'Aplicare recentă'}
                  </span>
                </div>
                <p className="text-[11px] text-amber-900/90 font-medium mt-0.5">
                  {bundle.cadence.actionRecommendation}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-1.5 self-start sm:self-auto">
              {bundle.cadence.daysElapsed < 5 ? (
                <button
                  onClick={() => setActiveTab('linkedin_note')}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Linkedin className="w-3 h-3" /> Pasul 1: Notă LinkedIn
                </button>
              ) : bundle.cadence.daysElapsed < 10 ? (
                <button
                  onClick={() => setActiveTab('follow_up_1')}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Mail className="w-3 h-3" /> Pasul 2: Follow-Up #1
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('follow_up_2')}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <TrendingUp className="w-3 h-3" /> Pasul 3: Follow-Up #2
                </button>
              )}
            </div>
          </div>
        )}

        {/* BODY CONTAINER */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* QUICK RECRUITER SEARCH & PERSONALIZATION BAR */}
          <div className="bg-gray-50 border border-gray-200/90 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-blue-600" />
                Găsește persoana potrivită la {company}:
              </span>
              <a
                href={bundle?.recruiterSearchUrl || `https://www.linkedin.com/search/results/people/?keywords=Recruiter%20${encodeURIComponent(company)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-blue-50 border border-gray-300 hover:border-blue-400 text-[#0a66c2] text-xs font-bold rounded-lg shadow-2xs transition"
              >
                <Linkedin className="w-3 h-3" /> Recruiteri {company}
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </a>
              <a
                href={bundle?.engineeringManagerSearchUrl || `https://www.linkedin.com/search/results/people/?keywords=Engineering%20Manager%20${encodeURIComponent(company)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-indigo-50 border border-gray-300 hover:border-indigo-400 text-indigo-700 text-xs font-bold rounded-lg shadow-2xs transition"
              >
                <UserCheck className="w-3 h-3" /> Engineering Managers
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </a>
            </div>

            {/* PERSONALIZATION INPUT */}
            <form onSubmit={handleRecruiterSubmit} className="flex items-center gap-1.5 shrink-0">
              <input
                type="text"
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                placeholder="Ex: Andreea sau Popescu..."
                className="px-2.5 py-1 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-900 focus:outline-blue-600 w-36 sm:w-44"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Personalizează
              </button>
            </form>
          </div>

          {/* MESSAGE SELECTOR TABS */}
          <div className="flex border-b border-gray-200 overflow-x-auto gap-1 pb-1">
            <button
              onClick={() => setActiveTab('linkedin_note')}
              className={`px-3 py-2 text-xs font-extrabold rounded-t-lg transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'linkedin_note'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/40'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              <Linkedin className="w-3.5 h-3.5 text-[#0a66c2]" />
              Notă LinkedIn (&lt;300 caractere)
              {bundle?.linkedinNote && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  bundle.linkedinNote.characterCount <= 300 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {bundle.linkedinNote.characterCount}/300
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('cold_email')}
              className={`px-3 py-2 text-xs font-extrabold rounded-t-lg transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'cold_email'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/40'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              Cold Email (4 Paragrafe)
            </button>

            <button
              onClick={() => setActiveTab('follow_up_1')}
              className={`px-3 py-2 text-xs font-extrabold rounded-t-lg transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'follow_up_1'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/40'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              Follow-Up #1 (Ziua 5)
            </button>

            <button
              onClick={() => setActiveTab('follow_up_2')}
              className={`px-3 py-2 text-xs font-extrabold rounded-t-lg transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'follow_up_2'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/40'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
              Follow-Up #2 (Ziua 10)
            </button>

            <button
              onClick={() => setActiveTab('starters')}
              className={`px-3 py-2 text-xs font-extrabold rounded-t-lg transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'starters'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/40'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-gray-600" />
              Icebreakers & Căutări Google
            </button>
          </div>

          {/* TAB 1: LINKEDIN NOTE */}
          {activeTab === 'linkedin_note' && bundle?.linkedinNote && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <Linkedin className="w-4 h-4 text-[#0a66c2]" />
                    {bundle.linkedinNote.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {bundle.linkedinNote.advice}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black px-2 py-0.5 rounded-md border ${
                    bundle.linkedinNote.characterCount <= 300 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {bundle.linkedinNote.characterCount} / 300 caractere
                  </span>
                  <button
                    onClick={() => handleCopy(bundle.linkedinNote.content, 'linkedin_note', 'Nota LinkedIn')}
                    className="px-3 py-1.5 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    {copiedKey === 'linkedin_note' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'linkedin_note' ? 'Copiat!' : 'Copiază Nota'}
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs sm:text-[13px] leading-relaxed font-sans text-gray-800 whitespace-pre-wrap select-all shadow-inner">
                {bundle.linkedinNote.content}
              </div>

              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 flex items-start gap-2 text-xs text-blue-900">
                <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p>
                  <strong>Cum trimiți:</strong> Mergi pe profilul LinkedIn al recruiterului de la <strong>{company}</strong>, apasă <strong>Connect</strong>, apoi alege obligatoriu <strong>"Add a note"</strong> și lipește textul de mai sus. Nu trimite niciodată cerere goală!
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: COLD EMAIL */}
          {activeTab === 'cold_email' && bundle?.coldEmail && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-blue-600" />
                    {bundle.coldEmail.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {bundle.coldEmail.advice}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:?subject=${encodeURIComponent(bundle.coldEmail.subject)}&body=${encodeURIComponent(bundle.coldEmail.content)}`}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Deschide Mail
                  </a>
                  <button
                    onClick={() => handleCopy(bundle.coldEmail.content, 'cold_email', 'Cold Email')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    {copiedKey === 'cold_email' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'cold_email' ? 'Copiat!' : 'Copiază Email'}
                  </button>
                </div>
              </div>

              {/* SUBJECT FIELD */}
              <div className="bg-gray-100/80 border border-gray-200 rounded-lg p-2.5 flex items-center justify-between gap-2 text-xs">
                <span className="font-bold text-gray-600">Subiect:</span>
                <span className="font-semibold text-gray-900 flex-1 truncate">{bundle.coldEmail.subject}</span>
                <button
                  onClick={() => handleCopy(bundle.coldEmail.subject, 'email_sub', 'Subiectul')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  {copiedKey === 'email_sub' ? 'Copiat!' : 'Copiază'}
                </button>
              </div>

              {/* BODY FIELD */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs sm:text-[13px] leading-relaxed font-sans text-gray-800 whitespace-pre-wrap select-all shadow-inner max-h-72 overflow-y-auto">
                {bundle.coldEmail.content}
              </div>

              <div className="text-[11px] text-gray-500 italic">
                * Nu uita să atașezi CV-ul tău în format PDF înainte de expediere!
              </div>
            </div>
          )}

          {/* TAB 3: FOLLOW UP #1 */}
          {activeTab === 'follow_up_1' && bundle?.followUp1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    {bundle.followUp1.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {bundle.followUp1.advice}
                  </p>
                </div>

                <button
                  onClick={() => handleCopy(bundle.followUp1.content, 'follow_up_1', 'Follow-Up #1')}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  {copiedKey === 'follow_up_1' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'follow_up_1' ? 'Copiat!' : 'Copiază Mesaj'}
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs sm:text-[13px] leading-relaxed font-sans text-gray-800 whitespace-pre-wrap select-all shadow-inner">
                {bundle.followUp1.content}
              </div>
            </div>
          )}

          {/* TAB 4: FOLLOW UP #2 */}
          {activeTab === 'follow_up_2' && bundle?.followUp2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    {bundle.followUp2.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {bundle.followUp2.advice}
                  </p>
                </div>

                <button
                  onClick={() => handleCopy(bundle.followUp2.content, 'follow_up_2', 'Follow-Up #2')}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  {copiedKey === 'follow_up_2' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'follow_up_2' ? 'Copiat!' : 'Copiază Mesaj'}
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs sm:text-[13px] leading-relaxed font-sans text-gray-800 whitespace-pre-wrap select-all shadow-inner">
                {bundle.followUp2.content}
              </div>
            </div>
          )}

          {/* TAB 5: STARTERS & BOOLEAN QUERIES */}
          {activeTab === 'starters' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Formule de Inițiere a Conversației (Icebreakers)
                </h3>
                <p className="text-xs text-gray-500">
                  Fraze scurte pe care le poți folosi dacă recruiterul acceptă cererea de conectare:
                </p>
              </div>

              <div className="space-y-2.5">
                {bundle?.conversationStarters?.map((starter, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-start justify-between gap-3 text-xs text-gray-800">
                    <p className="leading-relaxed font-medium">"{starter}"</p>
                    <button
                      onClick={() => handleCopy(starter, `starter_${i}`, 'Icebreaker')}
                      className="text-blue-600 hover:text-blue-800 font-bold shrink-0 cursor-pointer"
                    >
                      {copiedKey === `starter_${i}` ? 'Copiat!' : 'Copiază'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5 mb-2">
                  <Search className="w-3.5 h-3.5 text-blue-600" /> Interogări Booleene Recruiter (Google / LinkedIn)
                </h4>
                <div className="space-y-1.5">
                  {bundle?.recruiterBooleanQueries?.map((query, idx) => (
                    <div key={idx} className="bg-gray-900 text-gray-200 font-mono text-[11px] p-2 rounded-lg flex items-center justify-between gap-2">
                      <span className="truncate">{query}</span>
                      <button
                        onClick={() => handleCopy(query, `query_${idx}`, 'Interogare Booleană')}
                        className="text-amber-400 hover:text-amber-300 font-sans font-bold text-xs shrink-0 cursor-pointer"
                      >
                        {copiedKey === `query_${idx}` ? 'Copiat!' : 'Copiază'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1.5 font-medium">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            Optimizat cu background-ul tău UPB & SIMAVI
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition cursor-pointer"
          >
            Închide
          </button>
        </div>
      </div>
    </div>
  );
}
