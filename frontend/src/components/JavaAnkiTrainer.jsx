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
  ChevronDown
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
      default: return <Layers className={sizeClass} />;
    }
  };

  const cardStatus = currentCard ? progress[currentCard.id]?.status || 'new' : 'new';
  const visibleCatalogCards = filteredCards.slice(0, visibleCatalogLimit);

  return (
    <div className="space-y-6 font-sans text-gray-900">
      
      {/* 1. TOP STATS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-blue-600" />
            Total Carduri Tech
          </div>
          <div className="text-2xl font-black text-gray-950 mt-1">
            {stats.total}
          </div>
          <div className="text-[11px] text-gray-600 font-semibold mt-0.5">
            9 Domenii & Curicula 2026
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200/80 bg-emerald-50/20 shadow-2xs">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            Stapanite (Easy)
          </div>
          <div className="text-2xl font-black text-emerald-950 mt-1">
            {stats.mastered}
          </div>
          <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">
            {stats.completionPercent}% din intregul pachet
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-200/80 bg-amber-50/20 shadow-2xs">
          <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-700" />
            In Invatare
          </div>
          <div className="text-2xl font-black text-amber-950 mt-1">
            {stats.learning + stats.review}
          </div>
          <div className="text-[11px] text-amber-800 font-semibold mt-0.5">
            Repetitie spatiata activa
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            De Explorat
          </div>
          <div className="text-2xl font-black text-gray-950 mt-1">
            {stats.unstudied}
          </div>
          <div className="text-[11px] text-gray-600 font-semibold mt-0.5">
            Carduri noi de parcurs
          </div>
        </div>
      </div>

      {/* 2. CONTROLS: CATEGORIES & VIEW SWITCHER */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-2xs space-y-4">
        
        {/* Top line: 9 Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-thin">
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-black'
                }`}
              >
                {renderCategoryIcon(cat.id, "w-3.5 h-3.5")}
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Second line: Filters (Search, Difficulty, Mode, Shuffle, Reset) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1 border-t border-gray-100">
          
          {/* Difficulty pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mr-1">
              Dificultate:
            </span>
            {[
              { id: 'ALL', label: 'Toate' },
              { id: 'USOR', label: 'Usor' },
              { id: 'MEDIU', label: 'Mediu' },
              { id: 'DIFICIL', label: 'Dificil' }
            ].map(diff => (
              <button
                key={diff.id}
                onClick={() => {
                  setDifficultyFilter(diff.id);
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                  setVisibleCatalogLimit(20);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  difficultyFilter === diff.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black'
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>

          {/* View mode toggle (Flashcard vs Catalog) & Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center p-0.5 bg-gray-100 rounded-xl border border-gray-200">
              <button
                onClick={() => setViewStyle('FLASHCARD')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewStyle === 'FLASHCARD' ? 'bg-white text-black shadow-xs' : 'text-gray-600 hover:text-black'
                }`}
              >
                Mod Card (Anki)
              </button>
              <button
                onClick={() => setViewStyle('CATALOG')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewStyle === 'CATALOG' ? 'bg-white text-black shadow-xs' : 'text-gray-600 hover:text-black'
                }`}
              >
                Catalog ({filteredCards.length})
              </button>
            </div>

            <button
              onClick={handleShuffle}
              title="Amesteca cardurile"
              className="p-1.5 rounded-xl border border-gray-200 text-gray-600 hover:text-black hover:bg-gray-100 transition cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={handleResetProgress}
              title="Reseteaza progresul"
              className="p-1.5 rounded-xl border border-gray-200 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search bar inside cards */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cauta in toate intrebarile (ex: HashMap, N+1, Virtual Threads, VPC, Docker, RAG, useMemo, Token Bucket)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentCardIndex(0);
              setVisibleCatalogLimit(20);
            }}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* 3. MAIN INTERACTIVE FLASHCARD COMPONENT */}
      {viewStyle === 'FLASHCARD' ? (
        filteredCards.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-2xs space-y-3">
            <HelpCircle className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="text-base font-bold text-gray-900">Nu am gasit carduri pentru filtrele selectate</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Incearca sa schimbi categoria, sa setezi dificultatea pe "Toate" sau sa cureti termenii de cautare.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            
            {/* Card Progress Header */}
            <div className="flex items-center justify-between text-xs font-bold text-gray-500 px-2">
              <div className="flex items-center gap-2">
                <span>Card {currentCardIndex + 1} din {filteredCards.length}</span>
                <span className="text-gray-300">•</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                  cardStatus === 'mastered' ? 'bg-emerald-100 text-emerald-800' :
                  cardStatus === 'learning' ? 'bg-amber-100 text-amber-800' :
                  cardStatus === 'review' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {cardStatus === 'mastered' ? 'Stapanit' :
                   cardStatus === 'learning' ? 'In Invatare' :
                   cardStatus === 'review' ? 'De Revizuit' : 'Card Nou'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.round(((currentCardIndex + 1) / filteredCards.length) * 100)}%` }}
                />
              </div>
            </div>

            {/* THE INTERACTIVE CARD */}
            <div 
              onClick={() => setIsFlipped(prev => !prev)}
              className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-gray-200/90 shadow-lg cursor-pointer hover:border-blue-400 transition-all duration-200 select-none min-h-[380px] flex flex-col justify-between relative group"
            >
              {/* Card Meta Badges */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-800 border border-gray-200 flex items-center gap-1.5">
                    {renderCategoryIcon(currentCard.category, "w-3 h-3 text-blue-600")}
                    {TECH_ANKI_CATEGORIES.find(c => c.id === currentCard.category)?.label || currentCard.category}
                  </span>

                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                    currentCard.difficulty === 'DIFICIL' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                    currentCard.difficulty === 'MEDIU' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {currentCard.difficulty}
                  </span>
                </div>

                <div className="text-[11px] font-bold text-gray-600 group-hover:text-blue-600 flex items-center gap-1 transition">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{isFlipped ? 'Apasa pentru intrebare' : 'Apasa SPACE sau click pentru raspuns'}</span>
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
                    <h2 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight leading-snug">
                      {currentCard.title}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-medium">
                      {currentCard.question}
                    </p>

                    <div className="pt-6">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition">
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
                      <span className="text-[10px] font-bold text-gray-400">
                        {currentCard.title}
                      </span>
                    </div>

                    {/* Formatted Answer */}
                    <div className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-line font-medium bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                      {currentCard.answer}
                    </div>

                    {/* Code Snippet Box */}
                    {currentCard.codeSnippet && (
                      <div className="relative rounded-2xl overflow-hidden bg-gray-950 text-gray-200 border border-gray-800 text-xs font-mono shadow-xs">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-gray-900 border-b border-gray-800 text-[11px] text-gray-400">
                          <span className="font-semibold text-gray-300">Solutie / Cod / Configurare</span>
                          <button
                            onClick={() => handleCopyCode(currentCard.codeSnippet, currentCard.id)}
                            className="flex items-center gap-1 text-[10px] text-gray-300 hover:text-white transition cursor-pointer"
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
                        <pre className="p-3.5 overflow-x-auto text-[11.5px] leading-relaxed">
                          <code>{currentCard.codeSnippet}</code>
                        </pre>
                      </div>
                    )}

                    {/* Interview Trap & Key Takeaway */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                      {currentCard.interviewTrap && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                          <div className="font-bold flex items-center gap-1.5 text-rose-800 mb-0.5">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Capcana la Interviu
                          </div>
                          <p className="text-[11px] leading-relaxed text-rose-800/90">
                            {currentCard.interviewTrap}
                          </p>
                        </div>
                      )}

                      {currentCard.keyTakeaway && (
                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                          <div className="font-bold flex items-center gap-1.5 text-blue-800 mb-0.5">
                            <Zap className="w-3.5 h-3.5" />
                            Concluzie Cheie
                          </div>
                          <p className="text-[11px] leading-relaxed text-blue-800/90">
                            {currentCard.keyTakeaway}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Hint */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600 font-semibold">
                <div>Shortcuts: Space (intoarce), 1-4 (evalueaza)</div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFlipped(false);
                      setCurrentCardIndex(prev => (prev - 1 + filteredCards.length) % filteredCards.length);
                    }}
                    className="p-1 hover:text-black hover:bg-gray-100 rounded-md transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFlipped(false);
                      setCurrentCardIndex(prev => (prev + 1) % filteredCards.length);
                    }}
                    className="p-1 hover:text-black hover:bg-gray-100 rounded-md transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* ANKI RATING BUTTONS (Shown when card is flipped) */}
            {isFlipped && (
              <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-md animate-in slide-in-from-bottom-2 duration-150">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center mb-3">
                  Cum ai raspuns la aceasta intrebare? (Alege pentru repetitie spatiata):
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    onClick={() => handleRateCard('AGAIN')}
                    className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold transition flex flex-col items-center gap-0.5 cursor-pointer shadow-2xs"
                  >
                    <span className="font-black text-rose-900">1. Again</span>
                    <span className="text-[10px] text-rose-600 font-semibold">&lt; 1 zi (Repeta azi)</span>
                  </button>

                  <button
                    onClick={() => handleRateCard('HARD')}
                    className="py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition flex flex-col items-center gap-0.5 cursor-pointer shadow-2xs"
                  >
                    <span className="font-black text-amber-900">2. Hard</span>
                    <span className="text-[10px] text-amber-600 font-semibold">in 2-3 zile</span>
                  </button>

                  <button
                    onClick={() => handleRateCard('GOOD')}
                    className="py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold transition flex flex-col items-center gap-0.5 cursor-pointer shadow-2xs"
                  >
                    <span className="font-black text-blue-900">3. Good</span>
                    <span className="text-[10px] text-blue-600 font-semibold">in 5-7 zile</span>
                  </button>

                  <button
                    onClick={() => handleRateCard('EASY')}
                    className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition flex flex-col items-center gap-0.5 cursor-pointer shadow-2xs"
                  >
                    <span className="font-black text-emerald-900">4. Easy</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Stapanit (14+ zile)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      ) : (
        /* 4. CATALOG / CHEATSHEET VIEW (BROWSE ALL QUESTIONS) */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
            <span>Intrebari afisate: {visibleCatalogCards.length} din {filteredCards.length}</span>
            <span>Deck: {TECH_ANKI_CATEGORIES.find(c => c.id === selectedCategory)?.label || 'Toate'}</span>
          </div>

          <div className="space-y-3">
            {visibleCatalogCards.map((card, idx) => {
              const status = progress[card.id]?.status || 'new';
              return (
                <div 
                  key={card.id}
                  className="bg-white rounded-2xl p-5 border border-gray-200/90 shadow-2xs hover:shadow-xs transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-gray-400">#{idx + 1}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-700 flex items-center gap-1">
                        {renderCategoryIcon(card.category, "w-3 h-3 text-blue-600")}
                        {TECH_ANKI_CATEGORIES.find(c => c.id === card.category)?.label || card.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        card.difficulty === 'DIFICIL' ? 'bg-rose-100 text-rose-800' :
                        card.difficulty === 'MEDIU' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {card.difficulty}
                      </span>
                    </div>

                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md self-start sm:self-auto ${
                      status === 'mastered' ? 'bg-emerald-100 text-emerald-800' :
                      status === 'learning' ? 'bg-amber-100 text-amber-800' :
                      status === 'review' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {status === 'mastered' ? 'Stapanit' :
                       status === 'learning' ? 'In Invatare' :
                       status === 'review' ? 'De Revizuit' : 'Card Nou'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-gray-950">
                      {card.title}
                    </h3>
                    <p className="text-xs text-gray-600 font-medium mt-0.5">
                      {card.question}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-800 leading-relaxed font-medium whitespace-pre-line">
                    {card.answer}
                  </div>

                  {card.codeSnippet && (
                    <div className="rounded-xl overflow-hidden bg-gray-950 text-gray-200 border border-gray-800 text-xs font-mono">
                      <pre className="p-3 overflow-x-auto text-[11px] leading-relaxed">
                        <code>{card.codeSnippet}</code>
                      </pre>
                    </div>
                  )}

                  {card.interviewTrap && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium">
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
                className="px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition inline-flex items-center gap-2 shadow-xs cursor-pointer"
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
