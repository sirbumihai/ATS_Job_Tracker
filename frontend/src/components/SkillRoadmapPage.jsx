import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Code2, 
  Copy, 
  Check, 
  Sparkles, 
  ChevronRight, 
  ExternalLink, 
  FileText, 
  Layers, 
  Terminal, 
  Flame, 
  PlusCircle, 
  BookOpen, 
  CheckSquare,
  HelpCircle,
  TrendingUp,
  Cpu,
  Server,
  Box,
  Cloud
} from 'lucide-react';

export default function SkillRoadmapPage({ currentUser, onNavigateToCvLibrary }) {
  const [catalog, setCatalog] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState('kafka');
  const [roadmap, setRoadmap] = useState(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const [completedDays, setCompletedDays] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isAddingToCv, setIsAddingToCv] = useState(false);

  // Custom skill generation state
  const [customSkillName, setCustomSkillName] = useState('');
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);

  // Fetch catalog on mount
  useEffect(() => {
    fetch('/api/v1/roadmap/catalog')
      .then(res => res.json())
      .then(data => setCatalog(data))
      .catch(err => console.error('Eroare catalog roadmaps:', err));
  }, []);

  // Fetch roadmap when selected skill changes
  useEffect(() => {
    if (!selectedSkillId) return;
    setLoadingRoadmap(true);
    fetch(`/api/v1/roadmap/${selectedSkillId}`)
      .then(res => res.json())
      .then(data => {
        setRoadmap(data);
        setSelectedDayNumber(1);
      })
      .catch(err => console.error('Eroare la preluarea roadmap-ului:', err))
      .finally(() => setLoadingRoadmap(false));

    // Load completed days from local storage
    try {
      const saved = JSON.parse(localStorage.getItem(`ats_roadmap_completed_${selectedSkillId}`) || '{}');
      setCompletedDays(saved);
    } catch (e) {}
  }, [selectedSkillId]);

  const toggleDayCompletion = (dayNum) => {
    const updated = { ...completedDays, [dayNum]: !completedDays[dayNum] };
    setCompletedDays(updated);
    try {
      localStorage.setItem(`ats_roadmap_completed_${selectedSkillId}`, JSON.stringify(updated));
    } catch (e) {}
  };

  const handleCopy = (text, key, label) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setToastMessage(`Copiat în clipboard: ${label}!`);
    setTimeout(() => {
      setCopiedKey(null);
      setToastMessage('');
    }, 2500);
  };

  const handleAddToCv = async () => {
    if (!roadmap) return;
    setIsAddingToCv(true);
    try {
      const res = await fetch('/api/v1/roadmap/add-to-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillName: roadmap.skillName,
          cvBulletPoint: roadmap.cvBulletPoint,
          projectTitle: roadmap.capstoneProjectTitle,
          projectDescription: roadmap.capstoneProjectArchitecture,
          technologiesUsed: `${roadmap.skillName}, Java 21, Spring Boot, Docker`
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToastMessage(`✓ Skill-ul ${roadmap.skillName} și proiectul Capstone au fost adăugate în CV!`);
      } else {
        setToastMessage(`⚠️ ${data.message || 'Eroare la adăugarea în CV'}`);
      }
    } catch (err) {
      setToastMessage('Eroare de conexiune la server.');
    } finally {
      setIsAddingToCv(false);
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  const handleGenerateCustom = async (e) => {
    e.preventDefault();
    if (!customSkillName.trim()) return;
    setIsGeneratingCustom(true);
    try {
      const res = await fetch('/api/v1/roadmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillName: customSkillName.trim(),
          targetRole: 'Junior / Mid Java Developer',
          currentLevel: 'INTERMEDIATE',
          focusArea: 'BACKEND_JAVA'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setRoadmap(data);
        setSelectedSkillId(data.id || customSkillName.toLowerCase());
        setSelectedDayNumber(1);
        setCustomSkillName('');
      }
    } catch (err) {
      console.error('Eroare la generarea roadmap-ului custom:', err);
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  const activeDay = roadmap?.days?.find(d => d.dayNumber === selectedDayNumber) || roadmap?.days?.[0];
  const completedCount = Object.values(completedDays).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / (roadmap?.totalDays || 7)) * 100);

  const getSkillIcon = (key) => {
    switch (key) {
      case 'kafka': return <Server className="w-5 h-5 text-amber-500" />;
      case 'redis': return <Flame className="w-5 h-5 text-rose-500" />;
      case 'docker': return <Box className="w-5 h-5 text-blue-500" />;
      case 'kubernetes': return <Cloud className="w-5 h-5 text-indigo-500" />;
      case 'microservices': return <Cpu className="w-5 h-5 text-emerald-500" />;
      default: return <GraduationCap className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER SECTION */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 bg-purple-100/90 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                Skill Gap Learning Roadmaps
              </span>
              <span className="text-xs text-gray-400 font-semibold">•</span>
              <span className="text-xs font-bold text-gray-600">Curricula Intensive de 7 Zile</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">
              Învață Tehnologiile Căutate în România și Adaugă-le în CV
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 font-medium max-w-3xl leading-relaxed">
              Transformă tehnologiile lipsă cerute în anunțurile de joburi în proiecte reale pe GitHub. Fiecare curriculum oferă teorie esențială, comenzi Docker, cod complet Spring Boot și un proiect Capstone formulat Google XYZ gata de inserat în CV.
            </p>
          </div>

          {/* CUSTOM GENERATOR INPUT */}
          <form onSubmit={handleGenerateCustom} className="shrink-0 flex items-center gap-1.5 bg-gray-50 p-2 rounded-xl border border-gray-200">
            <input
              type="text"
              value={customSkillName}
              onChange={(e) => setCustomSkillName(e.target.value)}
              placeholder="Ex: GraphQL, RabbitMQ, Go..."
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-900 focus:outline-purple-600 w-48 sm:w-56"
            />
            <button
              type="submit"
              disabled={isGeneratingCustom}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingCustom ? 'animate-spin' : ''}`} />
              {isGeneratingCustom ? 'Generez...' : 'Generează'}
            </button>
          </form>
        </div>

        {/* SKILL SELECTOR PILLS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-5">
          {catalog.map((cat) => {
            const isSelected = selectedSkillId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedSkillId(cat.id)}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50/60 shadow-xs ring-1 ring-purple-600'
                    : 'border-gray-200 bg-white hover:bg-gray-50/80 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-lg bg-gray-100">
                    {getSkillIcon(cat.iconKey)}
                  </div>
                  <span className="text-[10px] font-black text-purple-700 bg-purple-100/70 px-1.5 py-0.2 rounded-full">
                    {cat.totalDays} Zile
                  </span>
                </div>
                <div className="mt-2">
                  <h3 className="font-extrabold text-xs text-gray-950 truncate">{cat.skillName}</h3>
                  <p className="text-[10px] text-gray-500 font-medium truncate mt-0.5">{cat.marketDemandRomania}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md text-center transition animate-in slide-in-from-top">
          {toastMessage}
        </div>
      )}

      {/* ROADMAP CONTENT AREA */}
      {roadmap && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: 7-DAY NAVIGATION & PROGRESS (4 COLS) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-2xs space-y-4">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-gray-950 flex items-center gap-1.5">
                    {getSkillIcon(roadmap.iconKey)}
                    Progres Curriculum
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {completedCount} din {roadmap.totalDays} zile bifate ({progressPercent}%)
                  </p>
                </div>
                <span className="text-xs font-black text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
                  {roadmap.difficulty}
                </span>
              </div>

              {/* PROGRESS BAR */}
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-200">
                <div 
                  className="h-full bg-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              {/* DAYS LIST */}
              <div className="space-y-1.5 pt-2">
                {roadmap.days?.map((day) => {
                  const isSelected = selectedDayNumber === day.dayNumber;
                  const isDone = !!completedDays[day.dayNumber];

                  return (
                    <div
                      key={day.dayNumber}
                      onClick={() => setSelectedDayNumber(day.dayNumber)}
                      className={`p-2.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/80 shadow-xs'
                          : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDayCompletion(day.dayNumber);
                          }}
                          className="shrink-0 text-gray-400 hover:text-emerald-600 transition cursor-pointer"
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-300" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-gray-500 block">
                            Ziua {day.dayNumber} • {day.estimatedHours}
                          </span>
                          <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-purple-950 font-extrabold' : 'text-gray-800'}`}>
                            {day.title.replace(/^Ziua \d+:\s*/, '')}
                          </h4>
                        </div>
                      </div>

                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                    </div>
                  );
                })}
              </div>

            </div>

            {/* CAPSTONE PROJECT ACTION CARD */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-neutral-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                  Capstone Project
                </span>
                <span className="text-xs text-gray-400">Day 7 Objective</span>
              </div>

              <h3 className="font-extrabold text-sm text-white leading-snug">
                {roadmap.capstoneProjectTitle}
              </h3>

              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                {roadmap.capstoneProjectArchitecture}
              </p>

              {/* GOOGLE XYZ STAR BULLET */}
              <div className="bg-white/10 rounded-xl p-3 border border-white/15 text-xs text-gray-200 leading-relaxed space-y-2">
                <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold">
                  <span>Google XYZ Bullet Point (CV & LinkedIn):</span>
                  <button
                    onClick={() => handleCopy(roadmap.cvBulletPoint, 'cv_bullet', 'Formula Google XYZ')}
                    className="hover:text-white cursor-pointer"
                  >
                    {copiedKey === 'cv_bullet' ? 'Copiat!' : 'Copiază'}
                  </button>
                </div>
                <p className="italic text-[11px] text-gray-100">
                  "{roadmap.cvBulletPoint}"
                </p>
              </div>

              <button
                onClick={handleAddToCv}
                disabled={isAddingToCv}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                <PlusCircle className={`w-4 h-4 ${isAddingToCv ? 'animate-spin' : ''}`} />
                {isAddingToCv ? 'Se adaugă...' : '+ Adaugă Automat în CV-ul Meu'}
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: ACTIVE DAY WORKSHOP & LAB (8 COLS) */}
          <div className="lg:col-span-8 space-y-4">
            {activeDay && (
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-2xs space-y-5">
                
                {/* DAY HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                        Ziua {activeDay.dayNumber} din {roadmap.totalDays}
                      </span>
                      <span className="text-xs text-gray-400 font-semibold">•</span>
                      <span className="text-xs font-bold text-gray-600">Timp estimat: {activeDay.estimatedHours}</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-gray-950 mt-1">
                      {activeDay.title}
                    </h2>
                  </div>

                  <button
                    onClick={() => toggleDayCompletion(activeDay.dayNumber)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto ${
                      completedDays[activeDay.dayNumber]
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    {completedDays[activeDay.dayNumber] ? 'Bifat ca Finalizat ✓' : 'Marchează ca Finalizat'}
                  </button>
                </div>

                {/* OBJECTIVE & CONCEPTS */}
                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                    Obiectivul Zilei
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-200/80">
                    {activeDay.coreObjective}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-gray-500 font-semibold">Concepte cheie:</span>
                    {activeDay.keyConcepts?.map((kc, kci) => (
                      <span key={kci} className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-900 border border-purple-200">
                        {kc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* HANDS-ON LAB */}
                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-blue-600" />
                    Laborator Practic
                  </h3>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {activeDay.handsOnLab}
                  </p>
                </div>

                {/* CODE SNIPPET */}
                {activeDay.codeSnippet && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-gray-700 flex items-center gap-1.5">
                        <Code2 className="w-4 h-4 text-purple-600" />
                        Configurație & Cod Practic ({activeDay.codeSnippetLanguage?.toUpperCase() || 'CODE'})
                      </span>
                      <button
                        onClick={() => handleCopy(activeDay.codeSnippet, `code_${activeDay.dayNumber}`, 'Snippet-ul de Cod')}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === `code_${activeDay.dayNumber}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedKey === `code_${activeDay.dayNumber}` ? 'Copiat!' : 'Copiază Codul'}
                      </button>
                    </div>

                    <div className="bg-gray-950 text-gray-100 rounded-xl p-4 font-mono text-xs overflow-x-auto border border-gray-800 shadow-inner max-h-80 leading-relaxed">
                      <pre><code>{activeDay.codeSnippet}</code></pre>
                    </div>
                  </div>
                )}

                {/* INTERVIEW VERIFICATION QUESTIONS */}
                {activeDay.interviewVerificationQuestions?.length > 0 && (
                  <div className="space-y-2 bg-amber-50/70 border border-amber-200/80 rounded-xl p-4">
                    <h3 className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      Întrebări de Verificare la Interviul Tehnic
                    </h3>
                    <ul className="space-y-1.5 text-xs text-amber-900/90 font-medium">
                      {activeDay.interviewVerificationQuestions.map((q, qi) => (
                        <li key={qi} className="flex items-start gap-1.5">
                          <span className="font-bold text-amber-700">•</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* BOTTOM NAVIGATION BUTTONS */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <button
                    disabled={activeDay.dayNumber <= 1}
                    onClick={() => setSelectedDayNumber(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    ← Ziua Precedentă
                  </button>

                  <button
                    disabled={activeDay.dayNumber >= (roadmap.totalDays || 7)}
                    onClick={() => setSelectedDayNumber(prev => Math.min(roadmap.totalDays || 7, prev + 1))}
                    className="px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-bold transition shadow-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Următoarea Zi →
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
