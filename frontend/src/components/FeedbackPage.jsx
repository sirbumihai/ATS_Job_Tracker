import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  MessageSquare, 
  Send, 
  ThumbsUp, 
  CheckCircle2, 
  AlertCircle, 
  Star, 
  Plus,
  Mail,
  Filter,
  Check,
  ChevronDown,
  Layers,
  GraduationCap,
  ExternalLink,
  Clock,
  User,
  Vote,
  Lightbulb,
  X
} from 'lucide-react';
import Footer from './Footer';

const FEEDBACK_CATEGORIES = [
  { id: 'feature', label: 'Functie Noua', description: 'Idee de modul sau functionalitate utila' },
  { id: 'interview', label: 'Pregatire Interviu', description: 'Sugestii de intrebari tehnice sau scenarii HR' },
  { id: 'ats_cv', label: 'ATS & Optimizare CV', description: 'Imbunatatiri pentru parsare, comparatie si scor' },
  { id: 'bug', label: 'Raportare Problema', description: 'Comportament neasteptat sau eroare vizuala' },
  { id: 'other', label: 'Altele', description: 'Orice alt gand sau sugestie generala' }
];

export default function FeedbackPage({ 
  onNavigateTab, 
  currentUser 
}) {
  // Feedback form state
  const [selectedCategory, setSelectedCategory] = useState('feature');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [shareInCommunity, setShareInCommunity] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [userFeedbacks, setUserFeedbacks] = useState([]);

  // Community ideas state
  const [communityIdeas, setCommunityIdeas] = useState([]);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('VOTES'); // 'VOTES' | 'NEWEST'
  const [showNewIdeaModal, setShowNewIdeaModal] = useState(false);
  const [votingIdeaId, setVotingIdeaId] = useState(null);

  // New Idea modal state
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [newIdeaCategory, setNewIdeaCategory] = useState('Functie Noua');
  const [newIdeaDescription, setNewIdeaDescription] = useState('');
  const [newIdeaAuthor, setNewIdeaAuthor] = useState(currentUser?.name || '');
  const [newIdeaEmail, setNewIdeaEmail] = useState(currentUser?.email || '');
  const [isSubmittingIdea, setIsSubmittingIdea] = useState(false);

  // Persistent voter token
  const voterToken = useMemo(() => {
    try {
      let token = localStorage.getItem('jobflow_voter_token');
      if (!token) {
        token = 'voter_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
        localStorage.setItem('jobflow_voter_token', token);
      }
      return token;
    } catch {
      return 'voter_default';
    }
  }, []);

  // Fetch community ideas from real backend API
  const fetchIdeas = async () => {
    try {
      setIsLoadingIdeas(true);
      const res = await fetch(`/api/v1/feedback/ideas?voterToken=${encodeURIComponent(voterToken)}`);
      if (res.ok) {
        const data = await res.json();
        setCommunityIdeas(data);
      }
    } catch (err) {
      console.error('Failed to fetch community ideas:', err);
    } finally {
      setIsLoadingIdeas(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
    try {
      const stored = localStorage.getItem('jobflow_user_feedbacks');
      if (stored) {
        setUserFeedbacks(JSON.parse(stored));
      }
    } catch {
      setUserFeedbacks([]);
    }
  }, [voterToken]);

  // Lock body scroll and support Escape key when modal is open
  useEffect(() => {
    if (showNewIdeaModal) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setShowNewIdeaModal(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showNewIdeaModal]);

  // Handle standard feedback submission
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setSubmissionSuccess(null);

    const payload = {
      name: name.trim() || 'Anonim',
      email: email.trim() || 'sarbumihai0@gmail.com',
      category: selectedCategory,
      rating,
      title: title.trim(),
      message: message.trim(),
      shareInCommunity
    };

    try {
      const res = await fetch('/api/v1/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      const savedLocal = {
        id: Date.now(),
        categoryLabel: FEEDBACK_CATEGORIES.find(c => c.id === selectedCategory)?.label || selectedCategory,
        rating,
        title: title.trim(),
        message: message.trim(),
        email: email.trim() || 'sarbumihai0@gmail.com',
        createdAt: new Date().toLocaleDateString('ro-RO', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      const updatedHistory = [savedLocal, ...userFeedbacks];
      setUserFeedbacks(updatedHistory);
      try {
        localStorage.setItem('jobflow_user_feedbacks', JSON.stringify(updatedHistory));
      } catch (storageErr) {
        console.error(storageErr);
      }

      setSubmissionSuccess({
        title: title.trim(),
        message: message.trim(),
        mailToUrl: `mailto:sarbumihai0@gmail.com?subject=${encodeURIComponent('[JobFlow Feedback] ' + title.trim())}&body=${encodeURIComponent(
          `Buna Mihai,\n\nIata feedback-ul meu pentru JobFlow AI:\n\nCategorie: ${selectedCategory}\nRating: ${rating}/5\nSubiect: ${title.trim()}\n\nDetalii:\n${message.trim()}\n\n--\nDe la: ${name.trim() || 'Utilizator'} (${email.trim() || 'Nespecificat'})`
        )}`
      });

      setTitle('');
      setMessage('');

      // Refresh community ideas if shared
      if (shareInCommunity) {
        fetchIdeas();
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Upvote/downvote community idea
  const handleVoteIdea = async (ideaId) => {
    if (votingIdeaId === ideaId) return;
    setVotingIdeaId(ideaId);

    // Optimistic UI update
    setCommunityIdeas(prev => prev.map(item => {
      if (item.id === ideaId) {
        const nextVoted = !item.hasVoted;
        return {
          ...item,
          hasVoted: nextVoted,
          votesCount: nextVoted ? item.votesCount + 1 : Math.max(0, item.votesCount - 1)
        };
      }
      return item;
    }));

    try {
      const res = await fetch(`/api/v1/feedback/ideas/${ideaId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterToken })
      });

      if (res.ok) {
        const data = await res.json();
        setCommunityIdeas(prev => prev.map(item => {
          if (item.id === ideaId) {
            return {
              ...item,
              hasVoted: data.hasVoted,
              votesCount: data.votesCount
            };
          }
          return item;
        }));
      }
    } catch (err) {
      console.error('Vote failed:', err);
      // Rollback on failure
      fetchIdeas();
    } finally {
      setVotingIdeaId(null);
    }
  };

  // Submit direct new community idea
  const handleSubmitNewIdea = async (e) => {
    e.preventDefault();
    if (!newIdeaTitle.trim() || !newIdeaDescription.trim()) return;

    setIsSubmittingIdea(true);
    try {
      const res = await fetch('/api/v1/feedback/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newIdeaTitle.trim(),
          category: newIdeaCategory,
          description: newIdeaDescription.trim(),
          authorName: newIdeaAuthor.trim() || 'Membru Comunitate',
          authorEmail: newIdeaEmail.trim() || null
        })
      });

      if (res.ok) {
        const created = await res.json();
        setCommunityIdeas(prev => [created, ...prev]);
        setShowNewIdeaModal(false);
        setNewIdeaTitle('');
        setNewIdeaDescription('');
      }
    } catch (err) {
      console.error('Failed to create idea:', err);
    } finally {
      setIsSubmittingIdea(false);
    }
  };

  // Filter and sort ideas
  const filteredIdeas = useMemo(() => {
    let list = [...communityIdeas];

    if (categoryFilter !== 'ALL') {
      list = list.filter(item => item.category === categoryFilter);
    }

    if (sortBy === 'VOTES') {
      list.sort((a, b) => b.votesCount - a.votesCount);
    } else {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return list;
  }, [communityIdeas, categoryFilter, sortBy]);

  const totalVotesCount = useMemo(() => {
    return communityIdeas.reduce((sum, item) => sum + (item.votesCount || 0), 0);
  }, [communityIdeas]);

  return (
    <div className="w-full bg-white text-black font-sans selection:bg-black selection:text-white min-h-screen">

      {/* ========================================================================= */}
      {/* 0. ARCHITECTURAL TOP BAR (SPACIOUS, MONOCHROME DISTILL)                   */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200/90 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Context Pill */}
          <div 
            onClick={() => onNavigateTab ? onNavigateTab('landing') : null}
            className="flex items-center gap-3.5 cursor-pointer group select-none shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-xl tracking-tight text-neutral-950">JobFlow AI</span>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full border border-neutral-200 bg-neutral-50 text-[11px] font-medium text-neutral-500">
                Feedback & Comunitate
              </span>
            </div>
          </div>

          {/* Centered Navigation Links */}
          <nav className="hidden md:flex items-center gap-2 text-sm font-medium text-neutral-600">
            <button 
              onClick={() => onNavigateTab ? onNavigateTab('landing') : null}
              className="px-4 py-2 rounded-xl hover:text-black hover:bg-neutral-100/80 transition-all cursor-pointer"
            >
              Acasa
            </button>
            <a 
              href="#formular" 
              className="px-4 py-2 rounded-xl hover:text-black hover:bg-neutral-100/80 transition-all cursor-pointer"
            >
              Trimite Sugestie
            </a>
            <a 
              href="#comunitate" 
              className="px-4 py-2 rounded-xl text-neutral-900 font-semibold hover:bg-neutral-100/80 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Vote className="w-4 h-4 text-neutral-700" />
              <span>Roadmap Comunitar</span>
            </a>
            <button 
              onClick={() => onNavigateTab ? onNavigateTab('skill_roadmap') : null}
              className="px-4 py-2 rounded-xl hover:text-black hover:bg-neutral-100/80 transition-all cursor-pointer"
            >
              Skill Roadmaps
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab ? onNavigateTab('landing') : null}
              className="hidden sm:inline-block text-sm font-semibold text-neutral-700 hover:text-black px-4 py-2 rounded-xl hover:bg-neutral-100 transition cursor-pointer"
            >
              Inapoi la Landing
            </button>
            <button
              onClick={() => onNavigateTab ? onNavigateTab('tracker') : null}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition cursor-pointer shadow-xs active:scale-95"
            >
              <span>Deschide Tracker</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 1. HERO SECTION: MONOLITHIC TITLE & CONTEXT                               */}
      {/* ========================================================================= */}
      <section className="relative pt-16 sm:pt-20 pb-16 sm:pb-20 border-b border-neutral-200/90 overflow-hidden bg-neutral-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-5xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-200 bg-white text-xs font-mono text-neutral-600 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Canal Direct sarbumihai0@gmail.com • Voturi Comunitate Live</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-neutral-950 leading-[1.08]">
              Spune-ne ce putem <span className="font-bold">construi mai bine</span>.
            </h1>

            <p className="text-lg text-neutral-600 leading-relaxed">
              Fiecare feedback, idee de functionalitate sau raportare de bug ajunge direct pe emailul 
              fondatorului si poate fi integrata in roadmap-ul votat deschis de intreaga comunitate.
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-3 text-xs sm:text-sm text-neutral-500 font-mono">
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900">{communityIdeas.length}</span>
                <span>Idei Inregistrate</span>
              </div>
              <span className="text-neutral-300">•</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900">{totalVotesCount}</span>
                <span>Voturi Acordate</span>
              </div>
              <span className="text-neutral-300">•</span>
              <div className="flex items-center gap-2 text-neutral-900 font-medium">
                <Mail className="w-3.5 h-3.5" />
                <span>sarbumihai0@gmail.com</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. MAIN SPLIT: FEEDBACK FORM + COMMUNITY VOTED ROADMAP                    */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start">
            
            {/* LEFT COLUMN: THE FEEDBACK FORM (4 cols on xl) */}
            <div id="formular" className="lg:col-span-5 xl:col-span-4 space-y-8">
              
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                  Transmite Opinia Ta
                </span>
                <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-950">
                  Formular de Feedback Direct
                </h2>
                <p className="text-sm text-neutral-600">
                  Mesajul tau este salvat in sistem si expediat pe loc la sarbumihai0@gmail.com.
                </p>
              </div>

              {/* Success Notification Alert */}
              {submissionSuccess && (
                <div className="p-6 rounded-2xl border border-emerald-300 bg-emerald-50/70 space-y-4 animate-in fade-in">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-emerald-950">
                        Feedback-ul a fost expediat cu succes!
                      </h4>
                      <p className="text-xs text-emerald-800 leading-relaxed">
                        Multumim pentru contributie! Mesajul a fost inregistrat in baza de date si transmis echipei la <span className="font-semibold">sarbumihai0@gmail.com</span>.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <a
                      href={submissionSuccess.mailToUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Deschide si in clientul tau de email</span>
                    </a>
                    <button
                      onClick={() => setSubmissionSuccess(null)}
                      className="text-xs text-emerald-800 hover:underline cursor-pointer"
                    >
                      Inchide alerta
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitFeedback} className="space-y-6">
                
                {/* Category Selection */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold">
                    1. Tipul Mesajului
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {FEEDBACK_CATEGORIES.map(cat => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`p-3 text-left rounded-xl border text-xs transition cursor-pointer flex flex-col justify-between gap-1 ${
                          selectedCategory === cat.id
                            ? 'border-black bg-black text-white font-semibold'
                            : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                        }`}
                      >
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating 1-5 */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold">
                    2. Nivel de Satisfactie Platforma
                  </label>
                  <div className="flex items-center gap-2 p-3 rounded-xl border border-neutral-200 bg-neutral-50/50">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 cursor-pointer transition hover:scale-110 active:scale-95"
                      >
                        <Star 
                          className={`w-6 h-6 ${
                            star <= rating 
                              ? 'text-amber-500 fill-amber-500' 
                              : 'text-neutral-300'
                          }`} 
                        />
                      </button>
                    ))}
                    <span className="text-xs font-mono text-neutral-600 ml-3">
                      {rating === 5 && 'Excelent (5/5)'}
                      {rating === 4 && 'Foarte bun (4/5)'}
                      {rating === 3 && 'Decent (3/5)'}
                      {rating === 2 && 'Necesita imbunatatiri (2/5)'}
                      {rating === 1 && 'Slab (1/5)'}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold">
                    3. Subiect / Titlu Relevat
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ex: Simulator tehnic pentru System Design sau Filtrare companii..."
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-sm focus:outline-none focus:border-black transition"
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold">
                    4. Detalii & Argumentatie
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Descrie problema observata sau cum te-ar ajuta o noua functionalitate in pregatirea pentru interviuri..."
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-sm focus:outline-none focus:border-black transition resize-none leading-relaxed"
                  />
                </div>

                {/* Sender Email & Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold">
                      Nume (Optional)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Anonim"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white text-xs focus:outline-none focus:border-black transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold">
                      Email-ul Tau (Raspuns)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@exemplu.ro"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white text-xs focus:outline-none focus:border-black transition"
                    />
                  </div>
                </div>

                {/* Share in community roadmap checkbox */}
                <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="shareCommunity"
                    checked={shareInCommunity}
                    onChange={(e) => setShareInCommunity(e.target.checked)}
                    className="mt-0.5 rounded border-neutral-300 text-black focus:ring-black cursor-pointer"
                  />
                  <label htmlFor="shareCommunity" className="text-xs text-neutral-700 leading-snug cursor-pointer select-none">
                    <span className="font-bold text-neutral-900 block">Adauga si pe Roadmap-ul Comunitar</span>
                    Propunerea ta va aparea public in panoul din dreapta pentru a putea fi votata si sustinuta de ceilalti utilizatori.
                  </label>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !message.trim()}
                  className="w-full py-4 rounded-xl bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-semibold text-sm transition cursor-pointer flex items-center justify-center gap-2.5 shadow-xs active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Se expediaza...' : 'Trimite Feedback & Notifica Echipa'}</span>
                </button>

              </form>

              {/* User Previous Submissions Box */}
              {userFeedbacks.length > 0 && (
                <div className="p-6 rounded-2xl border border-neutral-200 bg-neutral-50/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Propunerile Tale Recente ({userFeedbacks.length})
                    </h4>
                  </div>
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {userFeedbacks.map(fb => (
                      <div key={fb.id} className="p-3 rounded-xl bg-white border border-neutral-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-neutral-900 truncate max-w-[220px]">{fb.title}</span>
                          <span className="text-[10px] font-mono text-neutral-400">{fb.createdAt}</span>
                        </div>
                        <p className="text-neutral-600 text-[11px] line-clamp-2">{fb.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: REAL COMMUNITY ROADMAP & VOTING (8 cols on xl) */}
            <div id="comunitate" className="lg:col-span-7 xl:col-span-8 space-y-8">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                    Roadmap Decis de Utilizatori
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-950">
                    Idei Votate de Comunitate
                  </h2>
                </div>

                <button
                  onClick={() => setShowNewIdeaModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-semibold transition cursor-pointer shadow-xs active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Propune o Idee</span>
                </button>
              </div>

              {/* Filter and Sorting Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-2xl border border-neutral-200 bg-neutral-50/50">
                
                {/* Category Pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
                  {['ALL', 'Pregatire Interviu', 'ATS & Optimizare CV', 'Piata IT', 'Functie Noua'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer text-xs ${
                        categoryFilter === cat
                          ? 'bg-black text-white font-semibold'
                          : 'bg-white border border-neutral-200 text-neutral-600 hover:text-black'
                      }`}
                    >
                      {cat === 'ALL' ? 'Toate Categoriile' : cat}
                    </button>
                  ))}
                </div>

                {/* Sort Toggle */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-neutral-400 font-mono text-[11px]">Sortare:</span>
                  <button
                    onClick={() => setSortBy('VOTES')}
                    className={`px-2.5 py-1 rounded transition cursor-pointer ${
                      sortBy === 'VOTES' ? 'font-bold text-black underline' : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    Voturi
                  </button>
                  <span className="text-neutral-300">|</span>
                  <button
                    onClick={() => setSortBy('NEWEST')}
                    className={`px-2.5 py-1 rounded transition cursor-pointer ${
                      sortBy === 'NEWEST' ? 'font-bold text-black underline' : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    Recente
                  </button>
                </div>

              </div>

              {/* Ideas Cards Stream */}
              {isLoadingIdeas ? (
                <div className="p-12 text-center text-sm font-mono text-neutral-400 border border-neutral-200 rounded-2xl">
                  Se incarca propunerile din baza de date...
                </div>
              ) : filteredIdeas.length === 0 ? (
                <div className="p-12 text-center space-y-3 border border-dashed border-neutral-300 rounded-2xl">
                  <Lightbulb className="w-8 h-8 text-neutral-300 mx-auto" />
                  <p className="text-sm text-neutral-500">Nicio propunere gasita in aceasta categorie.</p>
                  <button
                    onClick={() => setShowNewIdeaModal(true)}
                    className="text-xs font-semibold text-black hover:underline cursor-pointer"
                  >
                    Fii primul care propune o idee!
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredIdeas.map((idea) => {
                    const statusColor = 
                      idea.status === 'IN_DEZVOLTARE' ? 'border-amber-300 bg-amber-50 text-amber-900' :
                      idea.status === 'IN_PLANIFICARE' ? 'border-sky-300 bg-sky-50 text-sky-900' :
                      idea.status === 'FINALIZAT' ? 'border-emerald-300 bg-emerald-50 text-emerald-900' :
                      idea.status === 'CERCETARE' ? 'border-purple-300 bg-purple-50 text-purple-900' :
                      'border-neutral-200 bg-neutral-100 text-neutral-700';

                    const statusLabel = 
                      idea.status === 'IN_DEZVOLTARE' ? 'In Dezvoltare' :
                      idea.status === 'IN_PLANIFICARE' ? 'In Planificare' :
                      idea.status === 'FINALIZAT' ? 'Finalizat' :
                      idea.status === 'CERCETARE' ? 'Cercetare' :
                      'In Analiza';

                    return (
                      <div 
                        key={idea.id}
                        className={`p-6 rounded-2xl border transition-all duration-150 ${
                          idea.hasVoted 
                            ? 'border-neutral-900 bg-neutral-50/80 shadow-2xs' 
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-start gap-4 sm:gap-5">
                          
                          {/* Vote Action Column */}
                          <button
                            type="button"
                            onClick={() => handleVoteIdea(idea.id)}
                            disabled={votingIdeaId === idea.id}
                            className={`shrink-0 flex flex-col items-center justify-center w-14 sm:w-16 py-3 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                              idea.hasVoted
                                ? 'bg-black text-white border-black shadow-xs'
                                : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-100'
                            }`}
                          >
                            <ThumbsUp className={`w-4 h-4 mb-1 transition-transform ${idea.hasVoted ? 'scale-110' : ''}`} />
                            <span className="text-sm font-bold leading-none">{idea.votesCount}</span>
                            <span className="text-[10px] font-mono mt-1 opacity-80">
                              {idea.hasVoted ? 'Votat' : 'Vot'}
                            </span>
                          </button>

                          {/* Content Column */}
                          <div className="flex-1 space-y-2.5">
                            
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-semibold">
                                {idea.category}
                              </span>
                              
                              <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-medium font-mono ${statusColor}`}>
                                {statusLabel}
                              </span>
                            </div>

                            <h3 className="text-base sm:text-lg font-bold text-neutral-950 leading-snug">
                              {idea.title}
                            </h3>

                            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                              {idea.description}
                            </p>

                            <div className="pt-2 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                              <span>Autor: {idea.authorName || 'Comunitate'}</span>
                              <span>JobFlow Roadmap</span>
                            </div>

                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PROPOSE COMMUNITY IDEA MODAL                                           */}
      {/* ========================================================================= */}
      {showNewIdeaModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
          onClick={() => setShowNewIdeaModal(false)}
        >
          <div 
            className="w-full max-w-lg rounded-2xl bg-white border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                  Comunitate JobFlow
                </span>
                <h3 className="text-xl font-bold text-neutral-950">
                  Propune o Idee pe Roadmap
                </h3>
              </div>
              <button
                onClick={() => setShowNewIdeaModal(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewIdea} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold">
                  Titlu Propunere
                </label>
                <input
                  type="text"
                  required
                  value={newIdeaTitle}
                  onChange={(e) => setNewIdeaTitle(e.target.value)}
                  placeholder="ex: Integrare cu platforma HackerRank / LeetCode..."
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold">
                  Categorie
                </label>
                <select
                  value={newIdeaCategory}
                  onChange={(e) => setNewIdeaCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-black bg-white"
                >
                  <option value="Pregatire Interviu">Pregatire Interviu</option>
                  <option value="ATS & Optimizare CV">ATS & Optimizare CV</option>
                  <option value="Piata IT">Piata IT</option>
                  <option value="Functie Noua">Functie Noua</option>
                  <option value="Altele">Altele</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold">
                  Descriere Detaliata
                </label>
                <textarea
                  required
                  rows={4}
                  value={newIdeaDescription}
                  onChange={(e) => setNewIdeaDescription(e.target.value)}
                  placeholder="Explica pe scurt utilitatea acestei idei pentru candidati..."
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-black resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold">
                    Nume Autor
                  </label>
                  <input
                    type="text"
                    value={newIdeaAuthor}
                    onChange={(e) => setNewIdeaAuthor(e.target.value)}
                    placeholder="Membru Comunitate"
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={newIdeaEmail}
                    onChange={(e) => setNewIdeaEmail(e.target.value)}
                    placeholder="sarbumihai0@gmail.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewIdeaModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 hover:text-black cursor-pointer"
                >
                  Anuleaza
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingIdea || !newIdeaTitle.trim() || !newIdeaDescription.trim()}
                  className="px-6 py-2.5 rounded-xl bg-black hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                >
                  {isSubmittingIdea ? 'Se publica...' : 'Publica pe Roadmap'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. BALANCED BOTTOM CALL TO ACTION                                         */}
      {/* ========================================================================= */}
      <section className="border-t border-neutral-200/90 bg-neutral-50/60 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center space-y-6">
          <h3 className="text-3xl sm:text-4xl font-light tracking-tight text-neutral-950">
            Pregatit sa aplici cu <span className="font-bold">avantaj strategic</span>?
          </h3>
          <p className="text-sm sm:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed">
            Acceseaza tracker-ul centralizat de aplicatii, optimizeaza-ti CV-ul pentru algoritmi ATS 
            sau exerseaza intrebarile de interviu pe stiva ta tehnica.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigateTab ? onNavigateTab('tracker') : null}
              className="px-8 py-3.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition cursor-pointer shadow-xs active:scale-95"
            >
              Deschide Tracker Aplicatii
            </button>
            <button
              onClick={() => onNavigateTab ? onNavigateTab('skill_roadmap') : null}
              className="px-7 py-3.5 rounded-xl bg-white text-black border border-neutral-300 text-sm font-semibold hover:border-black transition cursor-pointer shadow-2xs"
            >
              Vezi Intrebari Interviu
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. ARCHITECTURAL SHARED FOOTER                                            */}
      {/* ========================================================================= */}
      <Footer onNavigateTab={onNavigateTab} />

    </div>
  );
}
