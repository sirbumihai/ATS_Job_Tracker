import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Brain, 
  RotateCw, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Search, 
  Check, 
  Copy, 
  Zap, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  HelpCircle,
  Coffee,
  Leaf,
  Database,
  Cpu,
  Server,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Layout,
  Cloud,
  ChevronDown,
  Shapes,
  Terminal,
  X
} from 'lucide-react';
import { TECH_ANKI_CATEGORIES, ALL_TECH_ANKI_CARDS } from '../data/decks/index';

const STORAGE_KEY = 'tech_anki_flashcards_progress_v2';

export default function JavaAnkiTrainer() {
  // Navigation & Category Filter
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL'); // 'ALL' | 'USOR' | 'MEDIU' | 'DIFICIL'
  const [searchQuery, setSearchQuery] = useState('');
  const [viewStyle, setViewStyle] = useState('FLASHCARD'); // 'FLASHCARD' | 'CATALOG'
  const [visibleCatalogLimit, setVisibleCatalogLimit] = useState(20);

  // Flashcard Player State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  // Persistent Progress Data
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Eroare salvare progres Anki:', e);
    }
  }, [progress]);

  // Dynamic counts per category
  const categoryCounts = useMemo(() => {
    const counts = { ALL: ALL_TECH_ANKI_CARDS.length };
    ALL_TECH_ANKI_CARDS.forEach(card => {
      counts[card.category] = (counts[card.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Filtered Cards based on category, difficulty and search
  const filteredCards = useMemo(() => {
    return ALL_TECH_ANKI_CARDS.filter(card => {
      const matchCategory = selectedCategory === 'ALL' || card.category === selectedCategory;
      const matchDifficulty = difficultyFilter === 'ALL' || card.difficulty === difficultyFilter;
      const matchSearch = !searchQuery.trim() || 
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchDifficulty && matchSearch;
    });
  }, [selectedCategory, difficultyFilter, searchQuery]);

  // Ensure current card index is in bounds
  useEffect(() => {
    if (currentCardIndex >= filteredCards.length) {
      setCurrentCardIndex(0);
    }
    setIsFlipped(false);
  }, [filteredCards.length, selectedCategory, difficultyFilter, searchQuery]);

  const currentCard = filteredCards[currentCardIndex] || filteredCards[0];

  // Stats calculation
  const stats = useMemo(() => {
    const total = ALL_TECH_ANKI_CARDS.length;
    let mastered = 0;
    let learning = 0;
    let review = 0;

    Object.values(progress).forEach(item => {
      if (item.status === 'mastered') mastered++;
      else if (item.status === 'learning') learning++;
      else if (item.status === 'review') review++;
    });

    const unstudied = Math.max(0, total - (mastered + learning + review));
    const completionPercent = Math.round((mastered / total) * 100);

    return { total, mastered, learning, review, unstudied, completionPercent };
  }, [progress]);

  // Handle Anki Rating (Again, Hard, Good, Easy)
  const handleRateCard = useCallback((rating) => {
    if (!currentCard) return;

    let newStatus = 'learning';
    if (rating === 'EASY') newStatus = 'mastered';
    else if (rating === 'GOOD') newStatus = 'review';
    else if (rating === 'HARD') newStatus = 'learning';
    else if (rating === 'AGAIN') newStatus = 'learning';

    const currentRepetitions = (progress[currentCard.id]?.repetitions || 0) + 1;

    setProgress(prev => ({
      ...prev,
      [currentCard.id]: {
        status: newStatus,
        repetitions: currentRepetitions,
        lastRating: rating,
        updatedAt: new Date().toISOString()
      }
    }));

    // Transition to next card smoothly
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex(prev => (prev + 1) % filteredCards.length);
    }, 150);
  }, [currentCard, progress, filteredCards.length]);

  // Keyboard Shortcuts (Space to flip, 1-4 to rate)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (isFlipped) {
        if (e.key === '1') handleRateCard('AGAIN');
        else if (e.key === '2') handleRateCard('HARD');
        else if (e.key === '3') handleRateCard('GOOD');
        else if (e.key === '4') handleRateCard('EASY');
      } else {
        if (e.key === 'ArrowRight') {
          setIsFlipped(false);
          setCurrentCardIndex(prev => (prev + 1) % filteredCards.length);
        } else if (e.key === 'ArrowLeft') {
          setIsFlipped(false);
          setCurrentCardIndex(prev => (prev - 1 + filteredCards.length) % filteredCards.length);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, handleRateCard, filteredCards.length]);

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleResetProgress = () => {
    if (window.confirm('Sigur doresti sa resetezi intregul progres Anki? Toate cardurile vor reveni la starea initiala.')) {
      setProgress({});
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleShuffle = () => {
    if (filteredCards.length <= 1) return;
    const randomIndex = Math.floor(Math.random() * filteredCards.length);
    setCurrentCardIndex(randomIndex);
    setIsFlipped(false);
  };

  // Chromatic Theme System for Anki Categories (Unified Indigo & Slate Light Palette)
  const getCategoryTheme = () => {
    return {
      accent: 'indigo',
      ring: 'ring-indigo-500/20 border-indigo-600',
      activeBg: 'bg-indigo-50/90 border-indigo-600 text-slate-950 ring-2 ring-indigo-500/20 shadow-xs',
      iconBg: 'bg-slate-100 text-slate-700 border-slate-200/80',
      badge: 'bg-indigo-600 text-white font-bold',
      gradientAccent: 'from-indigo-500 to-indigo-600',
      cardBorder: 'hover:border-indigo-300'
    };
  };

  const getDifficultyBadgeStyle = (difficulty) => {
    switch (difficulty) {
      case 'DIFICIL':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'MEDIU':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'USOR':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'mastered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'learning':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Helper for Category Icons
  const renderCategoryIcon = (catId, sizeClass = "w-4 h-4") => {
    switch (catId) {
      case 'JAVA': return <Coffee className={sizeClass} />;
      case 'SPRING': return <Leaf className={sizeClass} />;
      case 'SQL': return <Database className={sizeClass} />;
      case 'SYSTEM_DESIGN': return <Server className={sizeClass} />;
      case 'TESTING': return <CheckCircle2 className={sizeClass} />;
      case 'REACT': return <Layout className={sizeClass} />;
      case 'DEVOPS': return <Cpu className={sizeClass} />;
      case 'CLOUD': return <Cloud className={sizeClass} />;
      case 'ML_AI': return <Sparkles className={sizeClass} />;
      case 'DESIGN_PATTERNS': return <Shapes className={sizeClass} />;
      case 'PYTHON': return <Terminal className={sizeClass} />;
      default: return <Layers className={sizeClass} />;
    }
  };

  const cardStatus = currentCard ? progress[currentCard.id]?.status || 'new' : 'new';
  const visibleCatalogCards = filteredCards.slice(0, visibleCatalogLimit);
  const currentCategoryTheme = getCategoryTheme(currentCard?.category || 'ALL');

  return (
    <div className="space-y-6 font-sans text-gray-900">
      
      {/* 1. TOP STATS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-200">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-indigo-600" />
            Total Carduri Tech
          </div>
          <div className="text-2xl font-black text-slate-950 mt-1.5">
            {stats.total}
          </div>
          <div className="text-[11px] text-slate-600 font-semibold mt-0.5">
            11 Domenii & Curicula 2026
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200/80 bg-gradient-to-b from-emerald-50/30 to-white shadow-2xs hover:shadow-xs transition-all duration-200">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            Stapanite (Easy)
          </div>
          <div className="text-2xl font-black text-emerald-950 mt-1.5">
            {stats.mastered}
          </div>
          <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">
            {stats.completionPercent}% din intregul pachet
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/80 bg-gradient-to-b from-amber-50/30 to-white shadow-2xs hover:shadow-xs transition-all duration-200">
          <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-700" />
            In Invatare
          </div>
          <div className="text-2xl font-black text-amber-950 mt-1.5">
            {stats.learning + stats.review}
          </div>
          <div className="text-[11px] text-amber-800 font-semibold mt-0.5">
            Repetitie spatiata activa
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 bg-gradient-to-b from-slate-50/50 to-white shadow-2xs hover:shadow-xs transition-all duration-200">
          <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            De Explorat
          </div>
          <div className="text-2xl font-black text-slate-950 mt-1.5">
            {stats.unstudied}
          </div>
          <div className="text-[11px] text-slate-600 font-semibold mt-0.5">
            Carduri noi de parcurs
          </div>
        </div>
      </div>

      {/* 2. CONTROLS: CATEGORIES & VIEW SWITCHER */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
        
        {/* Header Domenii */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-0.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Alege Domeniul de Studiu ({TECH_ANKI_CATEGORIES.length - 1} Specializari):
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-semibold">
            Selectat: <span className="font-bold text-slate-950">{TECH_ANKI_CATEGORIES.find(c => c.id === selectedCategory)?.label || 'Toate'}</span> ({categoryCounts[selectedCategory] || 0} carduri)
          </div>
        </div>

        {/* Categories Grid (Elimina complet scroll-ul orizontal, incadrare perfecta pe desktop si mobil) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5">
          {TECH_ANKI_CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                  setVisibleCatalogLimit(20);
                }}
                className={`group p-3 rounded-2xl transition-all duration-200 cursor-pointer border text-left flex flex-col justify-between gap-2.5 active:scale-95 ${
                  isSelected
                    ? 'bg-indigo-50/80 border-indigo-600 text-slate-950 shadow-xs ring-2 ring-indigo-500/20 -translate-y-0.5'
                    : 'bg-white hover:bg-slate-50/80 text-slate-900 border-slate-200/90 hover:border-indigo-300 hover:shadow-2xs hover:-translate-y-0.5'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`p-1.5 rounded-xl shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 border border-slate-200/70 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200/80 shadow-2xs group-hover:scale-105 transition-all'
                  }`}>
                    {renderCategoryIcon(cat.id, "w-3.5 h-3.5")}
                  </div>
                  <span className={`text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-full transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                  }`}>
                    {count}
                  </span>
                </div>

                <div className={`font-black text-xs leading-snug line-clamp-2 min-h-[30px] flex items-center ${
                  isSelected ? 'text-indigo-950 font-black' : 'text-slate-950 group-hover:text-indigo-950'
                }`}>
                  {cat.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Second line: Filters (Search, Difficulty, Mode, Shuffle, Reset) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          
          {/* Difficulty pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider mr-1">
              Dificultate:
            </span>
            {[
              { id: 'ALL', label: 'Toate', activeColor: 'bg-indigo-600 text-white shadow-xs font-black ring-1 ring-indigo-500/20' },
              { id: 'USOR', label: 'Usor', activeColor: 'bg-emerald-600 text-white' },
              { id: 'MEDIU', label: 'Mediu', activeColor: 'bg-amber-600 text-white' },
              { id: 'DIFICIL', label: 'Dificil', activeColor: 'bg-rose-600 text-white' }
            ].map(diff => (
              <button
                key={diff.id}
                onClick={() => {
                  setDifficultyFilter(diff.id);
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                  setVisibleCatalogLimit(20);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer active:scale-95 ${
                  difficultyFilter === diff.id
                    ? `${diff.activeColor} shadow-2xs font-black`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-950'
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>

          {/* View mode toggle (Flashcard vs Catalog) & Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 shadow-2xs">
              <button
                onClick={() => setViewStyle('FLASHCARD')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer active:scale-95 ${
                  viewStyle === 'FLASHCARD' ? 'bg-indigo-600 text-white shadow-xs font-black ring-1 ring-indigo-500/20' : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
                }`}
              >
                Mod Card (Anki)
              </button>
              <button
                onClick={() => setViewStyle('CATALOG')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer active:scale-95 ${
                  viewStyle === 'CATALOG' ? 'bg-indigo-600 text-white shadow-xs font-black ring-1 ring-indigo-500/20' : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
                }`}
              >
                Catalog ({filteredCards.length})
              </button>
            </div>

            <button
              onClick={handleShuffle}
              title="Amesteca cardurile"
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-all duration-150 cursor-pointer active:scale-95 shadow-2xs"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={handleResetProgress}
              title="Reseteaza progresul"
              className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all duration-150 cursor-pointer active:scale-95 shadow-2xs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search bar inside cards */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cauta in toate intrebarile (ex: HashMap, N+1, Virtual Threads, VPC, Docker, RAG, useMemo, Token Bucket)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentCardIndex(0);
              setVisibleCatalogLimit(20);
            }}
            className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCurrentCardIndex(0);
              }}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. MAIN INTERACTIVE FLASHCARD COMPONENT */}
      {viewStyle === 'FLASHCARD' ? (
        filteredCards.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-3">
            <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Nu am gasit carduri pentru filtrele selectate</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Incearca sa schimbi categoria, sa setezi dificultatea pe "Toate" sau sa cureti termenii de cautare.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            
            {/* Card Progress Header */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-2">
              <div className="flex items-center gap-2">
                <span>Card {currentCardIndex + 1} din {filteredCards.length}</span>
                <span className="text-slate-300">•</span>
                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-2xs ${getStatusBadgeStyle(cardStatus)}`}>
                  {cardStatus === 'mastered' ? 'Stapanit' :
                   cardStatus === 'learning' ? 'In Invatare' :
                   cardStatus === 'review' ? 'De Revizuit' : 'Card Nou'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/80">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.round(((currentCardIndex + 1) / filteredCards.length) * 100)}%` }}
                />
              </div>
            </div>

            {/* THE INTERACTIVE CARD */}
            <div 
              onClick={() => setIsFlipped(prev => !prev)}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm cursor-pointer hover:border-slate-300 hover:shadow-md transition-all duration-200 select-none min-h-[380px] flex flex-col justify-between relative group overflow-hidden"
            >
              {/* TOP ACCENT LINE WITH CATEGORY GRADIENT */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${currentCategoryTheme.gradientAccent}`} />

              {/* Card Meta Badges */}
              <div className="flex items-center justify-between gap-3 mb-4 pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200/80 flex items-center gap-1.5 shadow-2xs">
                    {renderCategoryIcon(currentCard.category, "w-3 h-3 text-slate-700")}
                    {TECH_ANKI_CATEGORIES.find(c => c.id === currentCard.category)?.label || currentCard.category}
                  </span>

                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-2xs ${getDifficultyBadgeStyle(currentCard.difficulty)}`}>
                    {currentCard.difficulty}
                  </span>
                </div>

                <div className="text-[11px] font-bold text-slate-500 group-hover:text-slate-900 flex items-center gap-1.5 transition">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isFlipped ? 'Apasa pentru intrebare' : 'Apasa pentru raspuns'}</span>
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-200">SPACE</span>
                </div>
              </div>

              {/* CARD CONTENT: FRONT vs BACK */}
              <div className="flex-1 flex flex-col justify-center py-2">
                {!isFlipped ? (
                  /* FRONT OF CARD (QUESTION) */
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-[11px] font-black uppercase tracking-wider text-blue-600">
                      Intrebare de Interviu Tehnic:
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-snug">
                      {currentCard.title}
                    </h2>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
                      {currentCard.question}
                    </p>

                    <div className="pt-6">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition shadow-2xs">
                        <span>Vezi raspunsul complet & explicatia</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* BACK OF CARD (ANSWER & CODE) */
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Raspuns Canonic Senior:
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        {currentCard.title}
                      </span>
                    </div>

                    {/* Formatted Answer */}
                    <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium bg-slate-50/90 p-4.5 rounded-2xl border border-slate-100">
                      {currentCard.answer}
                    </div>

                    {/* Code Snippet Box */}
                    {currentCard.codeSnippet && (
                      <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-200 border border-slate-800 text-xs font-mono shadow-xs">
                        <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-300">Solutie / Cod / Configurare</span>
                          <button
                            onClick={() => handleCopyCode(currentCard.codeSnippet, currentCard.id)}
                            className="flex items-center gap-1 text-[10px] text-slate-300 hover:text-white transition cursor-pointer px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700"
                          >
                            {copiedCodeId === currentCard.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copiat</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copiaza</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-4 overflow-x-auto text-[11.5px] leading-relaxed">
                          <code>{currentCard.codeSnippet}</code>
                        </pre>
                      </div>
                    )}

                    {/* Interview Trap & Key Takeaway */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                      {currentCard.interviewTrap && (
                        <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200/90 text-rose-900 text-xs shadow-2xs">
                          <div className="font-bold flex items-center gap-1.5 text-rose-800 mb-0.5">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Capcana la Interviu
                          </div>
                          <p className="text-[11px] leading-relaxed text-rose-800/90 font-sans">
                            {currentCard.interviewTrap}
                          </p>
                        </div>
                      )}

                      {currentCard.keyTakeaway && (
                        <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/90 text-blue-900 text-xs shadow-2xs">
                          <div className="font-bold flex items-center gap-1.5 text-blue-800 mb-0.5">
                            <Zap className="w-3.5 h-3.5" />
                            Concluzie Cheie
                          </div>
                          <p className="text-[11px] leading-relaxed text-blue-800/90 font-sans">
                            {currentCard.keyTakeaway}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Hint */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                <div className="flex items-center gap-2">
                  <span>Shortcuts:</span>
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-200">Space (intoarce)</span>
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-200">1-4 (evalueaza)</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFlipped(false);
                      setCurrentCardIndex(prev => (prev - 1 + filteredCards.length) % filteredCards.length);
                    }}
                    className="p-1 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFlipped(false);
                      setCurrentCardIndex(prev => (prev + 1) % filteredCards.length);
                    }}
                    className="p-1 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* ANKI RATING BUTTONS (Shown when card is flipped) */}
            {isFlipped && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm animate-in slide-in-from-bottom-2 duration-150 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    Evalueaza Intelegerea (Repetitie Spatiata):
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold hidden sm:inline">
                    Poti folosi tastele numerice 1, 2, 3, 4
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    onClick={() => handleRateCard('AGAIN')}
                    className="py-3 px-3.5 rounded-2xl bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200/90 text-rose-900 text-xs font-bold transition-all duration-150 flex flex-col items-center gap-1 cursor-pointer shadow-2xs active:scale-95 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-rose-200 text-rose-800 text-[10px] font-black flex items-center justify-center">1</span>
                      <span className="font-black text-rose-950 text-sm">Again</span>
                    </div>
                    <span className="text-[10px] text-rose-700 font-semibold">&lt; 1 zi (Repeta azi)</span>
                  </button>

                  <button
                    onClick={() => handleRateCard('HARD')}
                    className="py-3 px-3.5 rounded-2xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/90 text-amber-900 text-xs font-bold transition-all duration-150 flex flex-col items-center gap-1 cursor-pointer shadow-2xs active:scale-95 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-800 text-[10px] font-black flex items-center justify-center">2</span>
                      <span className="font-black text-amber-950 text-sm">Hard</span>
                    </div>
                    <span className="text-[10px] text-amber-700 font-semibold">in 2-3 zile</span>
                  </button>

                  <button
                    onClick={() => handleRateCard('GOOD')}
                    className="py-3 px-3.5 rounded-2xl bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200/90 text-blue-900 text-xs font-bold transition-all duration-150 flex flex-col items-center gap-1 cursor-pointer shadow-2xs active:scale-95 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-blue-200 text-blue-800 text-[10px] font-black flex items-center justify-center">3</span>
                      <span className="font-black text-blue-950 text-sm">Good</span>
                    </div>
                    <span className="text-[10px] text-blue-700 font-semibold">in 5-7 zile</span>
                  </button>

                  <button
                    onClick={() => handleRateCard('EASY')}
                    className="py-3 px-3.5 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/90 text-emerald-900 text-xs font-bold transition-all duration-150 flex flex-col items-center gap-1 cursor-pointer shadow-2xs active:scale-95 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-800 text-[10px] font-black flex items-center justify-center">4</span>
                      <span className="font-black text-emerald-950 text-sm">Easy</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold">Stapanit (14+ zile)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      ) : (
        /* 4. CATALOG / CHEATSHEET VIEW (BROWSE ALL QUESTIONS) */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            <span>Intrebari afisate: {visibleCatalogCards.length} din {filteredCards.length}</span>
            <span>Deck: {TECH_ANKI_CATEGORIES.find(c => c.id === selectedCategory)?.label || 'Toate'}</span>
          </div>

          <div className="space-y-3">
            {visibleCatalogCards.map((card, idx) => {
              const status = progress[card.id]?.status || 'new';
              return (
                <div 
                  key={card.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all duration-150 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-slate-400">#{idx + 1}</span>
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 flex items-center gap-1.5 border border-slate-200/80 shadow-2xs">
                        {renderCategoryIcon(card.category, "w-3 h-3 text-slate-600")}
                        {TECH_ANKI_CATEGORIES.find(c => c.id === card.category)?.label || card.category}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-2xs ${getDifficultyBadgeStyle(card.difficulty)}`}>
                        {card.difficulty}
                      </span>
                    </div>

                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg self-start sm:self-auto border shadow-2xs ${getStatusBadgeStyle(status)}`}>
                      {status === 'mastered' ? 'Stapanit' :
                       status === 'learning' ? 'In Invatare' :
                       status === 'review' ? 'De Revizuit' : 'Card Nou'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-950">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      {card.question}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-line">
                    {card.answer}
                  </div>

                  {card.codeSnippet && (
                    <div className="rounded-2xl overflow-hidden bg-slate-950 text-slate-200 border border-slate-800 text-xs font-mono shadow-xs">
                      <pre className="p-3.5 overflow-x-auto text-[11px] leading-relaxed">
                        <code>{card.codeSnippet}</code>
                      </pre>
                    </div>
                  )}

                  {card.interviewTrap && (
                    <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-900 text-xs font-medium">
                      <span className="font-bold text-rose-800">Capcana: </span>
                      {card.interviewTrap}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Load More Button for large decks */}
          {visibleCatalogLimit < filteredCards.length && (
            <div className="text-center pt-2">
              <button
                onClick={() => setVisibleCatalogLimit(prev => prev + 20)}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all duration-150 inline-flex items-center gap-2 shadow-2xs active:scale-95 cursor-pointer"
              >
                <span>Incarca inca 20 de intrebari (Ramase: {filteredCards.length - visibleCatalogLimit})</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
