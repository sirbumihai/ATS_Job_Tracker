import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  MessageSquare, 
  Send, 
  ThumbsUp, 
  CheckCircle2, 
  AlertCircle, 
  Star, 
  Layers, 
  Compass, 
  GraduationCap, 
  Check, 
  ChevronRight,
  Clock,
  User,
  Vote
} from 'lucide-react';

const FEEDBACK_CATEGORIES = [
  { id: 'feature', label: 'Functie Noua', description: 'Idee de modul sau functionalitate utila' },
  { id: 'interview', label: 'Pregatire Interviu', description: 'Sugestii de intrebari tehnice sau scenarii HR' },
  { id: 'ats_cv', label: 'ATS & Optimizare CV', description: 'Imbunatatiri pentru parsare, comparatie si scor' },
  { id: 'bug', label: 'Raportare Problema', description: 'Comportament neasteptat sau eroare vizuala' },
  { id: 'other', label: 'Altele', description: 'Orice alt gand sau sugestie generala' }
];

const INITIAL_COMMUNITY_IDEAS = [
  {
    id: 1,
    title: 'Simulator de interviu vocal AI cu feedback in timp real',
    description: 'Posibilitatea de a raspunde vocal la intrebarile tehnice si HR, cu analiza pe ritm, claritate si terminologie.',
    category: 'Pregatire Interviu',
    votes: 142,
    status: 'In planificare'
  },
  {
    id: 2,
    title: 'Filtru avansat pentru salarii min/max raportate in Romania si Remote EU',
    description: 'Estimari salariale bazate pe piata reala IT si nivel de senioritate (Junior, Mid, Senior) la salvarea jobului.',
    category: 'Piata IT',
    votes: 98,
    status: 'In dezvoltare'
  },
  {
    id: 3,
    title: 'Export CV in format JSON Resume standardizat',
    description: 'Compatibilitate directa cu platformele internationale si posibilitatea de backup JSON complet al CV-ului.',
    category: 'ATS & Optimizare CV',
    votes: 84,
    status: 'Cercetare'
  },
  {
    id: 4,
    title: 'Banca extinsa de scenarii System Design pentru arhitecturi microservicii',
    description: 'Diagrame interactive si intrebari de scalabilitate (caching, partitionare, mesagerie asincrona Kafka).',
    category: 'Pregatire Interviu',
    votes: 76,
    status: 'In planificare'
  }
];

export default function FeedbackPage({ 
  onNavigateTab, 
  currentUser 
}) {
  const [selectedCategory, setSelectedCategory] = useState('feature');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userFeedbacks, setUserFeedbacks] = useState([]);
  const [communityIdeas, setCommunityIdeas] = useState(() => {
    try {
      const stored = localStorage.getItem('jobflow_community_ideas');
      return stored ? JSON.parse(stored) : INITIAL_COMMUNITY_IDEAS;
    } catch {
      return INITIAL_COMMUNITY_IDEAS;
    }
  });
  const [votedIdeas, setVotedIdeas] = useState(() => {
    try {
      const stored = localStorage.getItem('jobflow_voted_ideas');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Load user submitted feedbacks
  useEffect(() => {
    try {
      const stored = localStorage.getItem('jobflow_user_feedbacks');
      if (stored) {
        setUserFeedbacks(JSON.parse(stored));
      }
    } catch {
      setUserFeedbacks([]);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSubmitting(true);

    const newFeedback = {
      id: Date.now(),
      category: selectedCategory,
      categoryLabel: FEEDBACK_CATEGORIES.find(c => c.id === selectedCategory)?.label || selectedCategory,
      rating,
      title: title.trim(),
      message: message.trim(),
      email: email.trim() || (currentUser?.email || 'Anonim'),
      createdAt: new Date().toLocaleDateString('ro-RO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setTimeout(() => {
      const updated = [newFeedback, ...userFeedbacks];
      setUserFeedbacks(updated);
      try {
        localStorage.setItem('jobflow_user_feedbacks', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save feedback locally', err);
      }

      setIsSubmitting(false);
      setSubmitted(true);
      setTitle('');
      setMessage('');
    }, 400);
  };

  const handleVoteIdea = (ideaId) => {
    if (votedIdeas.includes(ideaId)) {
      // Remove vote
      const updatedVotes = votedIdeas.filter(id => id !== ideaId);
      setVotedIdeas(updatedVotes);
      localStorage.setItem('jobflow_voted_ideas', JSON.stringify(updatedVotes));

      const updatedIdeas = communityIdeas.map(item => {
        if (item.id === ideaId) {
          return { ...item, votes: item.votes - 1 };
        }
        return item;
      });
      setCommunityIdeas(updatedIdeas);
      localStorage.setItem('jobflow_community_ideas', JSON.stringify(updatedIdeas));
    } else {
      // Add vote
      const updatedVotes = [...votedIdeas, ideaId];
      setVotedIdeas(updatedVotes);
      localStorage.setItem('jobflow_voted_ideas', JSON.stringify(updatedVotes));

      const updatedIdeas = communityIdeas.map(item => {
        if (item.id === ideaId) {
          return { ...item, votes: item.votes + 1 };
        }
        return item;
      });
      setCommunityIdeas(updatedIdeas);
      localStorage.setItem('jobflow_community_ideas', JSON.stringify(updatedIdeas));
    }
  };

  return (
    <div className="w-full bg-white text-black font-sans selection:bg-black selection:text-white min-h-screen pb-24">

      {/* ========================================================================= */}
      {/* 0. ARCHITECTURAL TOP HEADER                                               */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          <div 
            onClick={() => onNavigateTab ? onNavigateTab('landing') : null}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-black">JobFlow AI</span>
              <span className="hidden sm:inline-block text-xs font-mono text-neutral-400 ml-2.5 border-l border-neutral-200 pl-2.5">
                Feedback & Roadmap Comunitar
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab ? onNavigateTab('landing') : null}
              className="text-sm font-medium text-neutral-600 hover:text-black px-4 py-2 transition cursor-pointer"
            >
              Acasa
            </button>
            <button
              onClick={() => onNavigateTab ? onNavigateTab('tracker') : null}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition cursor-pointer shadow-xs active:scale-95"
            >
              <span>Deschide Tracker</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 1. HERO TITLE SECTION: ARCHITECTURAL MONOLITH                             */}
      {/* ========================================================================= */}
      <section className="relative pt-12 sm:pt-16 pb-12 border-b border-neutral-200/90 overflow-hidden">
        
        {/* Subtle dot grid */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.035]" 
          style={{
            backgroundImage: `radial-gradient(#000000 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-5">
          
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full border border-neutral-300 bg-neutral-50 text-xs font-mono uppercase tracking-widest text-neutral-700">
            <MessageSquare className="w-3.5 h-3.5 text-black" />
            <span>VOCEA CANDIDATILOR • JOBFLOW AI ROADMAP</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-black leading-[1.1]">
            Construim impreuna{' '}
            <span className="font-serif italic font-normal text-neutral-900 underline decoration-1 underline-offset-8 decoration-neutral-300">
              cea mai precisa unealta
            </span>{' '}
            pentru cariera ta.
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Parerea ta ghideaza direct urmatoarele module. Spune-ne ce provocari intampini la interviuri, 
            ce functionalitati ti-ar aduce cel mai mare avantaj sau raporteaza orice problema intalnita.
          </p>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. MAIN FEEDBACK FORM & COMMUNITY VOTING GRID                             */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14">
            
            {/* Left Column: The Feedback Form (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                  TRIMITE PAREREA TA
                </span>
                <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-black">
                  Formular de Feedback Direct
                </h2>
                <p className="text-sm text-neutral-600">
                  Fiecare mesaj este analizat direct de echipa de dezvoltare.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 rounded-2xl border border-emerald-300 bg-emerald-50/60 space-y-4 animate-in fade-in duration-300">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900">
                    Multumim pentru feedback!
                  </h3>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    Sugestia ta a fost inregistrata cu succes. Contributia ta ne ajuta sa transformam 
                    JobFlow AI intr-un asistent si mai eficient pentru pregatirea de interviuri si cautarea de joburi.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-6 py-2.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition cursor-pointer"
                    >
                      Trimite o alta sugestie
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Category Selection */}
                  <div className="space-y-3">
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-700">
                      1. Selecteaza Categoria
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {FEEDBACK_CATEGORIES.map(cat => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                          <button
                            type="button"
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-black text-white border-black shadow-xs'
                                : 'bg-neutral-50/80 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                            }`}
                          >
                            <div className="font-semibold text-xs leading-tight">{cat.label}</div>
                            <div className={`text-[10px] mt-0.5 leading-snug line-clamp-1 ${
                              isSelected ? 'text-neutral-300' : 'text-neutral-500'
                            }`}>
                              {cat.description}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rating Selector */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-700">
                      2. Cum evaluezi experienta generala cu JobFlow AI?
                    </label>
                    <div className="flex items-center gap-2 sm:gap-3">
                      {[1, 2, 3, 4, 5].map(num => (
                        <button
                          type="button"
                          key={num}
                          onClick={() => setRating(num)}
                          className={`flex-1 py-3 rounded-xl border text-center transition cursor-pointer font-mono font-bold text-sm ${
                            rating === num
                              ? 'bg-black text-white border-black shadow-xs'
                              : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-700'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <Star className={`w-3.5 h-3.5 ${rating >= num ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`} />
                            <span>{num}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-neutral-400 px-1">
                      <span>1: Necesita imbunatatiri</span>
                      <span>5: Excelent</span>
                    </div>
                  </div>

                  {/* Feedback Title */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-700">
                      3. Subiect / Titlu Scurt
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Simulator de intrebari algoritmice cu solutii in Java si TypeScript"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
                    />
                  </div>

                  {/* Detailed Message */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-700">
                      4. Detalii & Sugestii Concrete
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Descrie cum te-ar ajuta aceasta functie sau ce problema ai observat. Orice detaliu specific este valoros!"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition leading-relaxed resize-y"
                    />
                  </div>

                  {/* Email (Optional) */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-700">
                      5. Adresa de Email (Optional, pentru actualizari de status)
                    </label>
                    <input
                      type="email"
                      placeholder="adresa.ta@exemplu.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-9 py-4 rounded-full bg-black hover:bg-neutral-800 text-white font-semibold text-sm transition-all duration-150 cursor-pointer shadow-xs active:scale-95 inline-flex items-center justify-center gap-2.5 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? 'Se trimite...' : 'Trimite Feedback-ul'}</span>
                    </button>
                  </div>

                </form>
              )}

            </div>

            {/* Right Column: Community Roadmap & Upvoting (5 cols) */}
            <div className="lg:col-span-5 space-y-8">
              
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                  ROADMAP PUBLIC
                </span>
                <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-black">
                  Idei Votate de Comunitate
                </h2>
                <p className="text-sm text-neutral-600">
                  Voteaza functiile pe care doresti sa le vezi implementate cu prioritate.
                </p>
              </div>

              {/* Ideas Cards */}
              <div className="space-y-4">
                {communityIdeas.map((idea) => {
                  const hasVoted = votedIdeas.includes(idea.id);
                  return (
                    <div 
                      key={idea.id}
                      className="p-5 rounded-2xl border border-neutral-200/90 bg-white hover:border-neutral-300 transition-all space-y-3.5 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                          {idea.category}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {idea.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-neutral-900 leading-snug">
                          {idea.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed">
                          {idea.description}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-neutral-100">
                        <span className="text-xs font-mono text-neutral-500">
                          {idea.votes} voturi inregistrate
                        </span>
                        <button
                          type="button"
                          onClick={() => handleVoteIdea(idea.id)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold font-mono transition cursor-pointer ${
                            hasVoted
                              ? 'bg-black text-white'
                              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{hasVoted ? 'Votat' : 'Voteaza'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* User Previous Submissions Box */}
              {userFeedbacks.length > 0 && (
                <div className="p-6 rounded-2xl border border-neutral-200 bg-neutral-50/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Sugestiile Tale Recente ({userFeedbacks.length})
                    </h4>
                  </div>
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {userFeedbacks.map(fb => (
                      <div key={fb.id} className="p-3 rounded-xl bg-white border border-neutral-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-neutral-900 truncate max-w-[200px]">{fb.title}</span>
                          <span className="text-[10px] font-mono text-neutral-400">{fb.createdAt}</span>
                        </div>
                        <p className="text-neutral-600 text-[11px] line-clamp-2">{fb.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. ARCHITECTURAL BOTTOM CALL TO ACTION                                    */}
      {/* ========================================================================= */}
      <section className="border-t border-neutral-200/90 bg-neutral-50/50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <h3 className="text-2xl sm:text-3xl font-light tracking-tight text-black">
            Pregatit sa aplici cu avantaj strategic?
          </h3>
          <p className="text-sm text-neutral-600 max-w-xl mx-auto">
            Acceseaza tracker-ul centralizat de aplicatii sau exerseaza intrebarile de interviu pe stiva ta tehnica.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => onNavigateTab ? onNavigateTab('tracker') : null}
              className="px-8 py-3.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition cursor-pointer"
            >
              Deschide Tracker Aplicatii
            </button>
            <button
              onClick={() => onNavigateTab ? onNavigateTab('skill_roadmap') : null}
              className="px-7 py-3.5 rounded-full bg-white text-black border border-neutral-300 text-sm font-semibold hover:border-black transition cursor-pointer"
            >
              Vezi Intrebari Interviu
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
