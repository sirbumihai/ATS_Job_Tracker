import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowRight,
  Send,
  ThumbsUp,
  CheckCircle2,
  Star,
  Plus,
  Mail,
  Lightbulb
} from 'lucide-react';
import Footer from './Footer';
import Card from './ui/Card';
import Modal from './ui/Modal';
import BrandMark from './ui/BrandMark';

const FEEDBACK_CATEGORIES = [
  { id: 'feature', label: 'Funcție nouă' },
  { id: 'interview', label: 'Pregătire interviu' },
  { id: 'ats_cv', label: 'ATS și CV' },
  { id: 'bug', label: 'Problemă' },
  { id: 'other', label: 'Altele' }
];

// Valorile se trimit către backend și se compară cu categoriile existente; doar etichetele au diacritice.
const IDEA_CATEGORIES = [
  { value: 'Pregatire Interviu', label: 'Pregătire interviu' },
  { value: 'ATS & Optimizare CV', label: 'ATS și CV' },
  { value: 'Piata IT', label: 'Piața IT' },
  { value: 'Functie Noua', label: 'Funcție nouă' },
  { value: 'Altele', label: 'Altele' }
];
const IDEA_FILTERS = IDEA_CATEGORIES.slice(0, 4);

const IDEA_STATUSES = {
  IN_DEZVOLTARE: { label: 'În dezvoltare', style: 'bg-amber-50 text-amber-800' },
  IN_PLANIFICARE: { label: 'În planificare', style: 'bg-sky-50 text-sky-800' },
  FINALIZAT: { label: 'Finalizat', style: 'bg-emerald-50 text-emerald-800' },
  CERCETARE: { label: 'Cercetare', style: 'bg-purple-50 text-purple-800' }
};
const DEFAULT_IDEA_STATUS = { label: 'În analiză', style: 'bg-neutral-100 text-neutral-700' };

const RATING_LABELS = { 5: 'Excelent', 4: 'Foarte bun', 3: 'Decent', 2: 'Poate fi mai bine', 1: 'Slab' };

const INPUT = 'w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm focus:outline-none focus:border-brand-500 transition';
const LABEL = 'block text-sm font-medium text-neutral-900 mb-1.5';

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
          `Bună Mihai,\n\nIată feedback-ul meu pentru JobFlow AI:\n\nCategorie: ${selectedCategory}\nRating: ${rating}/5\nSubiect: ${title.trim()}\n\nDetalii:\n${message.trim()}\n\n--\nDe la: ${name.trim() || 'Utilizator'} (${email.trim() || 'Nespecificat'})`
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
    <div data-testid="feedback" className="w-full bg-white text-neutral-950 font-sans min-h-screen">

      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('landing')}
            className="cursor-pointer shrink-0"
            aria-label="JobFlow AI, înapoi la prezentare"
          >
            <BrandMark />
          </button>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-neutral-600" aria-label="Pagina Feedback">
            <a href="#formular" className="px-3 py-2 rounded-lg hover:text-neutral-950 hover:bg-neutral-100 transition">Trimite sugestie</a>
            <a href="#comunitate" className="px-3 py-2 rounded-lg hover:text-neutral-950 hover:bg-neutral-100 transition">Idei votate</a>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('skill_roadmap')}
              className="px-3 py-2 rounded-lg hover:text-neutral-950 hover:bg-neutral-100 transition cursor-pointer"
            >
              Skill Roadmap
            </button>
          </nav>

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('tracker')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition cursor-pointer shrink-0"
          >
            <span>Deschide Tracker</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">

        <div className="space-y-2">
          <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-neutral-950">
            Spune-ne ce putem construi mai bine
          </h1>
          <p className="text-neutral-500">
            {communityIdeas.length} idei și {totalVotesCount} voturi de la utilizatori.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* FORMULAR */}
          <div id="formular" className="lg:col-span-5 space-y-4">
            <Card padding="p-5 sm:p-6" className="space-y-5">
              <div>
                <h2 className="font-serif text-xl font-medium text-neutral-950">Trimite o sugestie</h2>
                <p className="text-sm text-neutral-500 mt-0.5">Ajunge direct la echipă.</p>
              </div>

              {submissionSuccess && (
                <div role="status" className="p-4 rounded-xl bg-emerald-50 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-emerald-950">Feedback trimis</h3>
                      <p className="text-xs text-emerald-800 mt-0.5">Mulțumim! Mesajul a ajuns la echipă.</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={submissionSuccess.mailToUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium transition"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Trimite și pe email</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setSubmissionSuccess(null)}
                      className="text-xs text-emerald-800 hover:underline cursor-pointer"
                    >
                      Închide
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitFeedback} className="space-y-4">

                <div role="group" aria-label="Tipul mesajului" className="flex flex-wrap gap-1.5">
                  {FEEDBACK_CATEGORIES.map(cat => (
                    <button
                      type="button"
                      key={cat.id}
                      aria-pressed={selectedCategory === cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-brand-500 text-white'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label htmlFor="fb-title" className={LABEL}>Titlu</label>
                  <input
                    id="fb-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Despre ce este vorba?"
                    className={INPUT}
                  />
                </div>

                <div>
                  <label htmlFor="fb-message" className={LABEL}>Detalii</label>
                  <textarea
                    id="fb-message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Descrie pe scurt"
                    className={`${INPUT} resize-none leading-relaxed`}
                  />
                </div>

                <details className="group">
                  <summary className="text-sm font-medium text-neutral-600 hover:text-neutral-950 cursor-pointer select-none">Mai multe opțiuni</summary>
                  <div className="mt-3 space-y-4">
                    <div>
                      <span className={LABEL}>Cum evaluezi platforma?</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            aria-label={`${star} din 5`}
                            aria-pressed={star === rating}
                            onClick={() => setRating(star)}
                            className="p-1 cursor-pointer transition hover:scale-110"
                          >
                            <Star className={`w-6 h-6 ${star <= rating ? 'text-amber-500 fill-amber-500' : 'text-neutral-300'}`} />
                          </button>
                        ))}
                        <span className="text-xs text-neutral-500 ml-2">{RATING_LABELS[rating]}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="fb-name" className={LABEL}>Nume</label>
                        <input id="fb-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Anonim" className={INPUT} />
                      </div>
                      <div>
                        <label htmlFor="fb-email" className={LABEL}>Email</label>
                        <input id="fb-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplu.ro" className={INPUT} />
                      </div>
                    </div>

                    <label htmlFor="shareCommunity" className="flex items-center gap-2.5 text-sm text-neutral-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        id="shareCommunity"
                        checked={shareInCommunity}
                        onChange={(e) => setShareInCommunity(e.target.checked)}
                        className="rounded border-neutral-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
                      />
                      Adaugă și în ideile votate
                    </label>
                  </div>
                </details>

                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !message.trim()}
                  className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium text-sm transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Se trimite...' : 'Trimite feedback'}</span>
                </button>
              </form>
            </Card>

            {userFeedbacks.length > 0 && (
              <Card padding="px-5 py-3" as="details">
                <summary className="text-sm font-semibold text-neutral-900 cursor-pointer select-none">
                  Propunerile tale ({userFeedbacks.length})
                </summary>
                <ul className="mt-3 space-y-2 max-h-56 overflow-y-auto">
                  {userFeedbacks.map(fb => (
                    <li key={fb.id} className="p-3 rounded-xl bg-neutral-50 text-xs space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-neutral-900 truncate">{fb.title}</span>
                        <span className="text-[11px] text-neutral-400 shrink-0">{fb.createdAt}</span>
                      </div>
                      <p className="text-neutral-500 line-clamp-2">{fb.message}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {/* IDEI VOTATE */}
          <div id="comunitate" className="lg:col-span-7 space-y-4">

            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-xl font-medium text-neutral-950">Idei votate</h2>
              <button
                type="button"
                onClick={() => setShowNewIdeaModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Propune o idee</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div role="group" aria-label="Filtrare după categorie" className="flex flex-wrap items-center gap-1.5">
                {[{ value: 'ALL', label: 'Toate' }, ...IDEA_FILTERS].map(cat => (
                  <button
                    type="button"
                    key={cat.value}
                    aria-pressed={categoryFilter === cat.value}
                    onClick={() => setCategoryFilter(cat.value)}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer text-xs font-medium ${
                      categoryFilter === cat.value
                        ? 'bg-brand-500 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:text-neutral-950'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div role="group" aria-label="Sortare" className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  aria-pressed={sortBy === 'VOTES'}
                  onClick={() => setSortBy('VOTES')}
                  className={`px-2.5 py-1 rounded transition cursor-pointer ${sortBy === 'VOTES' ? 'font-semibold text-neutral-950 underline' : 'text-neutral-500 hover:text-neutral-950'}`}
                >
                  Voturi
                </button>
                <button
                  type="button"
                  aria-pressed={sortBy === 'NEWEST'}
                  onClick={() => setSortBy('NEWEST')}
                  className={`px-2.5 py-1 rounded transition cursor-pointer ${sortBy === 'NEWEST' ? 'font-semibold text-neutral-950 underline' : 'text-neutral-500 hover:text-neutral-950'}`}
                >
                  Recente
                </button>
              </div>
            </div>

            {isLoadingIdeas ? (
              <Card padding="p-12" className="text-center text-sm text-neutral-400">Se încarcă ideile...</Card>
            ) : filteredIdeas.length === 0 ? (
              <Card padding="p-12" className="text-center space-y-3">
                <Lightbulb className="w-8 h-8 text-neutral-300 mx-auto" />
                <p className="text-sm text-neutral-500">Nicio idee în această categorie.</p>
                <button
                  type="button"
                  onClick={() => setShowNewIdeaModal(true)}
                  className="text-sm font-medium text-brand-600 hover:underline cursor-pointer"
                >
                  Propune prima idee
                </button>
              </Card>
            ) : (
              <ul className="space-y-3">
                {filteredIdeas.map((idea) => {
                  const status = IDEA_STATUSES[idea.status] || DEFAULT_IDEA_STATUS;
                  const categoryLabel = IDEA_CATEGORIES.find(c => c.value === idea.category)?.label || idea.category;

                  return (
                    <li key={idea.id}>
                      <Card padding="p-5" data-idea={idea.id} className={`transition-colors ${idea.hasVoted ? 'border-brand-500' : 'hover:border-neutral-300'}`}>
                        <div className="flex items-start gap-4">
                          <button
                            type="button"
                            onClick={() => handleVoteIdea(idea.id)}
                            disabled={votingIdeaId === idea.id}
                            aria-pressed={!!idea.hasVoted}
                            aria-label={`${idea.hasVoted ? 'Retrage votul' : 'Votează'}: ${idea.title}`}
                            className={`shrink-0 flex flex-col items-center justify-center w-14 py-2.5 rounded-xl border transition cursor-pointer ${
                              idea.hasVoted
                                ? 'bg-brand-500 text-white border-brand-500'
                                : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-400'
                            }`}
                          >
                            <ThumbsUp className="w-4 h-4 mb-1" />
                            <span className="text-sm font-semibold leading-none">{idea.votesCount}</span>
                          </button>

                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs text-neutral-500">{categoryLabel}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${status.style}`}>{status.label}</span>
                            </div>
                            <h3 className="text-base font-semibold text-neutral-950 leading-snug">{idea.title}</h3>
                            <p className="text-sm text-neutral-500 leading-relaxed line-clamp-3">{idea.description}</p>
                            <p className="text-xs text-neutral-400">{idea.authorName || 'Comunitate'}</p>
                          </div>
                        </div>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

        </div>
      </main>

      <Modal
        isOpen={showNewIdeaModal}
        onClose={() => setShowNewIdeaModal(false)}
        title="Propune o idee"
        icon={Lightbulb}
      >
        <form onSubmit={handleSubmitNewIdea} className="space-y-4">
          <div>
            <label htmlFor="idea-title" className={LABEL}>Titlu</label>
            <input
              id="idea-title"
              type="text"
              required
              value={newIdeaTitle}
              onChange={(e) => setNewIdeaTitle(e.target.value)}
              placeholder="Ce ar trebui adăugat?"
              className={INPUT}
            />
          </div>

          <div>
            <label htmlFor="idea-category" className={LABEL}>Categorie</label>
            <select
              id="idea-category"
              value={newIdeaCategory}
              onChange={(e) => setNewIdeaCategory(e.target.value)}
              className={`${INPUT} cursor-pointer`}
            >
              {IDEA_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="idea-description" className={LABEL}>Descriere</label>
            <textarea
              id="idea-description"
              required
              rows={4}
              value={newIdeaDescription}
              onChange={(e) => setNewIdeaDescription(e.target.value)}
              placeholder="De ce ar ajuta candidații?"
              className={`${INPUT} resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="idea-author" className={LABEL}>Nume</label>
              <input id="idea-author" type="text" value={newIdeaAuthor} onChange={(e) => setNewIdeaAuthor(e.target.value)} placeholder="Membru comunitate" className={INPUT} />
            </div>
            <div>
              <label htmlFor="idea-email" className={LABEL}>Email (opțional)</label>
              <input id="idea-email" type="email" value={newIdeaEmail} onChange={(e) => setNewIdeaEmail(e.target.value)} placeholder="email@exemplu.ro" className={INPUT} />
            </div>
          </div>

          <div className="pt-1 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowNewIdeaModal(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:text-neutral-950 cursor-pointer"
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={isSubmittingIdea || !newIdeaTitle.trim() || !newIdeaDescription.trim()}
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-medium transition cursor-pointer"
            >
              {isSubmittingIdea ? 'Se publică...' : 'Publică'}
            </button>
          </div>
        </form>
      </Modal>

      <Footer onNavigateTab={onNavigateTab} />

    </div>
  );
}
