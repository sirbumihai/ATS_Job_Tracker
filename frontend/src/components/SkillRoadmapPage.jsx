import React, { useState, useMemo } from 'react';
import {
  Code2,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Cpu,
  Server,
  Cloud,
  Layout,
  Bug,
  ShieldCheck,
  Database,
  Smartphone,
  Search,
  Layers,
  Sparkles,
  Briefcase,
  Compass,
  Users,
  MessageSquare,
  Globe,
  AlertTriangle,
  Lightbulb,
  ChevronRight,
  CheckCheck,
  Brain,
  X
} from 'lucide-react';
import Card from './ui/Card';
import { JOB_TRACKS } from '../data/jobTracksRoadmapData';
import { HR_INTERVIEW_DATA } from '../data/hrInterviewData';
import JavaAnkiTrainer from './JavaAnkiTrainer';

const VIEW_MODES = [
  { id: 'TECH_TRACKS', label: 'Roluri tehnice', icon: Code2 },
  { id: 'HR_SCREENING', label: 'Interviu HR', icon: Users },
  { id: 'ANKI_JAVA', label: 'Flashcard-uri', icon: Brain }
];

const HR_TABS = [
  { id: 'ALL', label: 'Tot', icon: Compass },
  { id: 'TIMELINE', label: 'Structura apelului', icon: Briefcase },
  { id: 'PITCH_STAR', label: 'Pitch și STAR', icon: Sparkles },
  { id: 'QUESTIONS', label: 'Întrebări', icon: MessageSquare },
  { id: 'ENGLISH', label: 'Engleză', icon: Globe },
  { id: 'RESOURCES', label: 'Resurse', icon: BookOpen }
];

const METHOD_STEPS = [
  { title: 'Fundamente', text: 'Documentație oficială și cursuri deschise.' },
  { title: 'Argumentare orală', text: 'Răspunde cu voce tare în 60-90 de secunde.' },
  { title: 'Simulări practice', text: 'Rezolvă probleme explicând deciziile.' }
];

/** Buton dintr-un grup de taburi: activ = accent albastru, inactiv = text discret. */
function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
        active ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-600 hover:text-neutral-950'
      }`}
    >
      {Icon && <Icon className={`w-3.5 h-3.5 ${active ? 'text-brand-500' : 'text-neutral-400'}`} />}
      <span>{children}</span>
    </button>
  );
}

function TabGroup({ label, children }) {
  return (
    <div role="group" aria-label={label} className="inline-flex flex-wrap items-center gap-1 p-1 bg-neutral-100 rounded-xl">
      {children}
    </div>
  );
}

function SearchField({ value, onChange, placeholder, label, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-white border border-neutral-300 rounded-xl pl-8 pr-8 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:border-brand-500 transition outline-none"
      />
      {value && (
        <button
          type="button"
          aria-label="Șterge căutarea"
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 cursor-pointer p-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-4">
      <h3 className="font-serif text-lg font-medium text-neutral-950 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-brand-500" />}
        {title}
      </h3>
      {subtitle && <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

export default function SkillRoadmapPage() {
  // VIEW MODE: 'TECH_TRACKS' | 'HR_SCREENING' | 'ANKI_JAVA'
  const [viewMode, setViewMode] = useState('TECH_TRACKS');

  // TECH TRACKS STATE
  const [selectedTrackId, setSelectedTrackId] = useState('BACKEND');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'LEARN' | 'INTERVIEW'
  const [trackSearchQuery, setTrackSearchQuery] = useState('');
  const [resourceSearchQuery, setResourceSearchQuery] = useState('');

  // HR SCREENING STATE
  const [hrSubTab, setHrSubTab] = useState('ALL'); // 'ALL' | 'TIMELINE' | 'PITCH_STAR' | 'QUESTIONS' | 'ENGLISH' | 'RESOURCES'
  const [expandedHrQuestions, setExpandedHrQuestions] = useState({});

  // COPY & TOAST STATE
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const handleCopyLink = (url, title) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setToastMessage(`Link copiat: ${title}`);
    setTimeout(() => {
      setCopiedUrl(null);
      setToastMessage('');
    }, 2500);
  };

  const handleCopyText = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setToastMessage(`Copiat: ${label}`);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  const toggleHrQuestion = (idx) => {
    setExpandedHrQuestions(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Filter tracks by search query
  const filteredTracks = useMemo(() => {
    if (!trackSearchQuery.trim()) return JOB_TRACKS;
    const q = trackSearchQuery.toLowerCase().trim();
    return JOB_TRACKS.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.shortTitle.toLowerCase().includes(q) ||
      t.tagLine.toLowerCase().includes(q)
    );
  }, [trackSearchQuery]);

  // Selected track
  const selectedTrack = useMemo(() => {
    return JOB_TRACKS.find(t => t.id === selectedTrackId) || JOB_TRACKS[0];
  }, [selectedTrackId]);

  // Track icons helper
  const getTrackIcon = (iconKey, sizeClass = "w-4 h-4") => {
    switch (iconKey) {
      case 'Server': return <Server className={sizeClass} />;
      case 'Layout': return <Layout className={sizeClass} />;
      case 'Layers': return <Layers className={sizeClass} />;
      case 'Bug': return <Bug className={sizeClass} />;
      case 'Cloud': return <Cloud className={sizeClass} />;
      case 'Sparkles': return <Sparkles className={sizeClass} />;
      case 'ShieldCheck': return <ShieldCheck className={sizeClass} />;
      case 'Database': return <Database className={sizeClass} />;
      case 'Cpu': return <Cpu className={sizeClass} />;
      case 'Smartphone': return <Smartphone className={sizeClass} />;
      default: return <Code2 className={sizeClass} />;
    }
  };

  // Compile combined resources for current track
  const allResources = useMemo(() => {
    if (!selectedTrack) return [];
    const learn = (selectedTrack.freeLearnResources || []).map(r => ({ ...r, category: 'LEARN' }));
    const interview = (selectedTrack.interviewPrepResources || []).map(r => ({ ...r, category: 'INTERVIEW' }));

    if (activeTab === 'LEARN') return learn;
    if (activeTab === 'INTERVIEW') return interview;
    return [...interview, ...learn];
  }, [selectedTrack, activeTab]);

  // Filter resources by search inside active track
  const filteredResources = useMemo(() => {
    if (!resourceSearchQuery.trim()) return allResources;
    const q = resourceSearchQuery.toLowerCase().trim();
    return allResources.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.platform.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
    );
  }, [allResources, resourceSearchQuery]);

  const learnCount = selectedTrack?.freeLearnResources?.length || 0;
  const interviewCount = selectedTrack?.interviewPrepResources?.length || 0;
  const totalCount = learnCount + interviewCount;

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-16 font-sans text-neutral-900">

      {toastMessage && (
        <div role="status" className="fixed top-20 right-6 z-50 bg-brand-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <TabGroup label="Secțiune">
        {VIEW_MODES.map(mode => (
          <TabButton
            key={mode.id}
            active={viewMode === mode.id}
            icon={mode.icon}
            onClick={() => setViewMode(mode.id)}
          >
            {mode.label}
          </TabButton>
        ))}
      </TabGroup>

      {/* ROLURI TEHNICE */}
      {viewMode === 'TECH_TRACKS' && selectedTrack && (
        <div className="space-y-5">

          <Card className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-serif text-lg font-medium text-neutral-950">
                Alege specializarea <span className="text-neutral-400 font-sans text-sm">({JOB_TRACKS.length})</span>
              </h2>
              <SearchField
                className="w-full sm:w-64"
                label="Caută rol"
                placeholder="Caută rol"
                value={trackSearchQuery}
                onChange={setTrackSearchQuery}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {filteredTracks.map((track) => {
                const isSelected = selectedTrackId === track.id;
                const resourceTotal = (track.freeLearnResources?.length || 0) + (track.interviewPrepResources?.length || 0);
                return (
                  <button
                    key={track.id}
                    type="button"
                    data-track={track.id}
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSelectedTrackId(track.id);
                      setResourceSearchQuery('');
                    }}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50 text-neutral-950'
                        : 'border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 text-neutral-900'
                    }`}
                  >
                    <span className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-brand-500 text-white' : 'bg-neutral-100 text-neutral-700'}`}>
                      {getTrackIcon(track.iconKey, "w-4 h-4")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold leading-snug truncate">{track.shortTitle}</span>
                      <span className="block text-[11px] text-neutral-500">{resourceTotal} resurse</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {filteredTracks.length === 0 && (
              <div className="text-center py-6 text-sm text-neutral-500">
                Niciun rol găsit pentru „{trackSearchQuery}”.
              </div>
            )}
          </Card>

          <Card className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <span className="p-2.5 rounded-xl bg-brand-50 text-brand-600 shrink-0">
                {getTrackIcon(selectedTrack.iconKey, "w-5 h-5")}
              </span>
              <div className="min-w-0">
                <h2 className="font-serif text-xl font-medium text-neutral-950">{selectedTrack.title}</h2>
                <p className="text-sm text-neutral-500 mt-0.5 line-clamp-2">{selectedTrack.tagLine}</p>
              </div>
            </div>
            <dl className="grid grid-cols-3 gap-2 shrink-0 text-center">
              {[['Total', totalCount], ['Interviu', interviewCount], ['Cursuri', learnCount]].map(([label, value]) => (
                <div key={label} className="bg-neutral-50 rounded-xl px-4 py-2">
                  <dd className="text-lg font-semibold text-neutral-950 leading-tight">{value}</dd>
                  <dt className="text-[11px] text-neutral-500">{label}</dt>
                </div>
              ))}
            </dl>
          </Card>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <TabGroup label="Tip resurse">
              <TabButton active={activeTab === 'ALL'} icon={Compass} onClick={() => setActiveTab('ALL')}>
                Toate ({totalCount})
              </TabButton>
              <TabButton active={activeTab === 'INTERVIEW'} icon={Briefcase} onClick={() => setActiveTab('INTERVIEW')}>
                Interviu ({interviewCount})
              </TabButton>
              <TabButton active={activeTab === 'LEARN'} icon={BookOpen} onClick={() => setActiveTab('LEARN')}>
                Cursuri ({learnCount})
              </TabButton>
            </TabGroup>

            <SearchField
              className="w-full sm:w-72"
              label="Filtrează resurse"
              placeholder="Filtrează resurse"
              value={resourceSearchQuery}
              onChange={setResourceSearchQuery}
            />
          </div>

          <Card padding="px-5 py-3" as="details">
            <summary className="text-sm font-semibold text-neutral-900 cursor-pointer select-none flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-500" /> Metodologie în trei pași
            </summary>
            <ol className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
              {METHOD_STEPS.map((step, idx) => (
                <li key={step.title} className="p-3 rounded-xl bg-neutral-50 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                  <span className="text-sm">
                    <strong className="block text-neutral-950">{step.title}</strong>
                    <span className="text-neutral-500 text-xs">{step.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResources.map((res, idx) => (
              <Card key={idx} data-resource="" className="flex flex-col justify-between gap-4 hover:border-neutral-300 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-medium text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                        {res.platform}
                      </span>
                      <span className="text-[11px] text-neutral-500">{res.type}</span>
                    </div>

                    {res.isTopPick && (
                      <span className="text-[11px] font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Recomandat
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-neutral-950 leading-snug">{res.title}</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">{res.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3.5 rounded-xl text-xs font-medium bg-brand-500 hover:bg-brand-600 text-white transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Deschide</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(res.url, res.title)}
                    className="py-2 px-3 rounded-xl text-xs font-medium bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Copiază linkul"
                    aria-label={`Copiază linkul: ${res.title}`}
                  >
                    {copiedUrl === res.url ? <Check className="w-3.5 h-3.5 text-brand-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{copiedUrl === res.url ? 'Copiat' : 'Copiază'}</span>
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <Card className="p-12 text-center text-neutral-500 space-y-2">
              <Search className="w-8 h-8 mx-auto text-neutral-300" />
              <p className="text-sm">Nicio resursă găsită pentru „{resourceSearchQuery}”.</p>
            </Card>
          )}

        </div>
      )}

      {/* INTERVIU HR */}
      {viewMode === 'HR_SCREENING' && (
        <div className="space-y-5">

          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h2 className="font-serif text-xl font-medium text-neutral-950">{HR_INTERVIEW_DATA.title}</h2>
              <p className="text-sm text-neutral-500 mt-0.5 line-clamp-2">{HR_INTERVIEW_DATA.subtitle}</p>
            </div>
          </div>

          <TabGroup label="Secțiuni HR">
            {HR_TABS.map(tab => (
              <TabButton key={tab.id} active={hrSubTab === tab.id} icon={tab.icon} onClick={() => setHrSubTab(tab.id)}>
                {tab.label}
              </TabButton>
            ))}
          </TabGroup>

          {(hrSubTab === 'ALL' || hrSubTab === 'TIMELINE') && (
            <Card padding="p-5 sm:p-6">
              <SectionTitle icon={Briefcase} title="Structura apelului (30 de minute)" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {HR_INTERVIEW_DATA.interviewPhases.map((phase, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-neutral-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">{phase.time}</span>
                      <span className="text-[11px] text-neutral-400">Pasul {idx + 1}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-neutral-950">{phase.title}</h4>
                    <p className="text-xs text-neutral-500 leading-relaxed">{phase.focus}</p>
                    <details className="text-xs text-neutral-700">
                      <summary className="cursor-pointer font-medium text-neutral-900 select-none">Recomandare</summary>
                      <p className="mt-1.5 leading-relaxed">{phase.proTip}</p>
                    </details>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {(hrSubTab === 'ALL' || hrSubTab === 'PITCH_STAR') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              <Card padding="p-5 sm:p-6" className="space-y-3">
                <SectionTitle icon={Sparkles} title={HR_INTERVIEW_DATA.pitchFormula.title} subtitle={HR_INTERVIEW_DATA.pitchFormula.subtitle} />
                <div className="space-y-2">
                  {HR_INTERVIEW_DATA.pitchFormula.steps.map((st, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-neutral-50 space-y-0.5">
                      <span className="text-xs font-semibold text-neutral-950 block">{st.step}</span>
                      <p className="text-xs text-neutral-600 leading-relaxed">{st.description}</p>
                    </div>
                  ))}
                </div>

                <details className="rounded-xl bg-neutral-50 p-3">
                  <summary className="text-xs font-semibold text-neutral-900 cursor-pointer select-none">Script de adaptat</summary>
                  <p className="text-xs text-neutral-800 leading-relaxed italic select-text mt-2">
                    „{HR_INTERVIEW_DATA.pitchFormula.sampleScript}”
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopyText(HR_INTERVIEW_DATA.pitchFormula.sampleScript, 'script pitch')}
                    className="mt-2 text-xs font-medium text-brand-600 hover:text-brand-500 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiază scriptul</span>
                  </button>
                </details>
              </Card>

              <Card padding="p-5 sm:p-6" className="space-y-3">
                <SectionTitle icon={CheckCheck} title={HR_INTERVIEW_DATA.starMethod.title} subtitle={HR_INTERVIEW_DATA.starMethod.description} />
                <div className="grid grid-cols-2 gap-2">
                  {HR_INTERVIEW_DATA.starMethod.components.map((c, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-neutral-50 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-brand-500 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                          {c.letter}
                        </span>
                        <span className="text-xs font-semibold text-neutral-950">{c.name}</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">{c.explanation}</p>
                    </div>
                  ))}
                </div>

                <details className="rounded-xl bg-neutral-50 p-3">
                  <summary className="text-xs font-semibold text-neutral-900 cursor-pointer select-none">Exemplu din proiect personal</summary>
                  <p className="text-xs text-neutral-950 font-semibold mt-2">
                    „{HR_INTERVIEW_DATA.starMethod.example.question}”
                  </p>
                  <p className="text-xs text-neutral-700 leading-relaxed select-text mt-1">
                    {HR_INTERVIEW_DATA.starMethod.example.answer}
                  </p>
                </details>
              </Card>

            </div>
          )}

          {(hrSubTab === 'ALL' || hrSubTab === 'QUESTIONS') && (
            <Card padding="p-5 sm:p-6">
              <SectionTitle icon={MessageSquare} title="Întrebări clasice de HR" />
              <div className="space-y-2">
                {HR_INTERVIEW_DATA.topQuestions.map((item, idx) => {
                  const isExpanded = !!expandedHrQuestions[idx];

                  return (
                    <div key={idx} className="rounded-xl bg-neutral-50 overflow-hidden">
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        onClick={() => toggleHrQuestion(idx)}
                        className="w-full text-left p-4 hover:bg-neutral-100 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-[11px] font-medium text-neutral-500 block">{item.category}</span>
                          <h4 className="text-sm font-semibold text-neutral-950">{item.q}</h4>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-neutral-400 transition-transform shrink-0 ${isExpanded ? 'rotate-90 text-brand-500' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="p-4 pt-0 space-y-3 text-xs leading-relaxed">
                          <p className="text-neutral-600 italic">
                            <strong>Ce urmărește recruiterul:</strong> {item.intent}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3.5 rounded-xl bg-emerald-50 space-y-1.5">
                              <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Răspuns recomandat
                              </span>
                              <p className="text-emerald-950">{item.goodAnswer}</p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-rose-50 space-y-1.5">
                              <span className="text-xs font-semibold text-rose-800 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                De evitat
                              </span>
                              <p className="text-rose-950">{item.redFlag}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {(hrSubTab === 'ALL' || hrSubTab === 'ENGLISH') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              <Card padding="p-5 sm:p-6" className="space-y-3">
                <SectionTitle icon={Globe} title={HR_INTERVIEW_DATA.englishCheck.title} subtitle={HR_INTERVIEW_DATA.englishCheck.description} />

                <div className="p-3 rounded-xl bg-brand-50 text-xs text-neutral-900 space-y-1">
                  <span className="font-semibold block">Fraza tipică a recruiterului</span>
                  <p className="italic">{HR_INTERVIEW_DATA.englishCheck.triggerPhrase}</p>
                </div>

                <div className="space-y-2">
                  {HR_INTERVIEW_DATA.englishCheck.goldenRules.map((r, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-neutral-50 text-xs space-y-0.5">
                      <span className="font-semibold text-neutral-950 block">{r.title}</span>
                      <p className="text-neutral-600">{r.tip}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card padding="p-5 sm:p-6" className="space-y-3">
                <SectionTitle icon={Lightbulb} title="Întrebări pentru recruiter" subtitle="Nu spune „Nu” când ești întrebat dacă ai întrebări." />
                <div className="space-y-2">
                  {HR_INTERVIEW_DATA.reverseQuestions.map((rq, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-neutral-50 space-y-1">
                      <span className="font-semibold text-xs text-neutral-950 block">„{rq.q}”</span>
                      <p className="text-[11px] text-neutral-500 italic">{rq.why}</p>
                    </div>
                  ))}
                </div>
              </Card>

            </div>
          )}

          {(hrSubTab === 'ALL' || hrSubTab === 'RESOURCES') && (
            <Card padding="p-5 sm:p-6">
              <SectionTitle icon={BookOpen} title="Resurse gratuite pentru interviul comportamental" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {HR_INTERVIEW_DATA.freeHrResources.map((res, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-neutral-50 flex flex-col justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium text-neutral-700 bg-white px-2 py-0.5 rounded">{res.platform}</span>
                        <span className="text-[11px] text-neutral-500">{res.type}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-neutral-950">{res.title}</h4>
                      <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">{res.description}</p>
                    </div>

                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3.5 rounded-xl text-xs font-medium bg-brand-500 hover:bg-brand-600 text-white transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>Deschide</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </Card>
          )}

        </div>
      )}

      {/* FLASHCARD-URI */}
      {viewMode === 'ANKI_JAVA' && <JavaAnkiTrainer />}

    </div>
  );
}
