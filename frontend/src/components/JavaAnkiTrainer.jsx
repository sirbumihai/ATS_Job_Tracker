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
  X,
  Volume2,
  VolumeX
} from 'lucide-react';
import Card from './ui/Card';
import { TECH_ANKI_CATEGORIES, ALL_TECH_ANKI_CARDS } from '../data/decks/index';

const STORAGE_KEY = 'tech_anki_flashcards_progress_v2';

// 1. Text Normalizer - Safe replacement of escaped backslash-n, backslash-t, and backslash-r
function normalizeCardText(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .replace(/\\+r/g, '')
    .replace(/\\+n/g, '\n')
    .replace(/\\+t/g, '  ')
    .trim();
}

// 2. Inline Formatter for technical keywords, code terms, and method invocations
function renderInlineFormatted(text) {
  if (!text) return null;
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, pIdx) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={pIdx} className="font-mono text-[11px] font-semibold text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded">
          {part.slice(1, -1)}
        </code>
      );
    }
    const subParts = part.split(/(\b(?:this|super|new|void|int|String|boolean|class|SELECT|FROM|WHERE|JOIN|INDEX)\b(?:\([^)]*\))?|[a-zA-Z0-9_$]+\([^)]*\))/g);
    return subParts.map((sub, sIdx) => {
      if (/^(\b(?:this|super|new|void|int|String|boolean|class|SELECT|FROM|WHERE|JOIN|INDEX)\b(?:\([^)]*\))?|[a-zA-Z0-9_$]+\([^)]*\))$/.test(sub)) {
        return (
          <code key={`${pIdx}-${sIdx}`} className="font-mono text-[11px] font-semibold text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded">
            {sub}
          </code>
        );
      }
      return sub;
    });
  });
}

// 3. Structured Answer Component - Transforms plain text into clean paragraphs, headers, and numbered steps
function FormattedAnswer({ text }) {
  if (!text) return null;
  const clean = normalizeCardText(text);
  const rawLines = clean.split('\n');

  const lines = [];
  for (let i = 0; i < rawLines.length; i++) {
    const l = rawLines[i].trim();
    if (l === '' && lines.length > 0 && lines[lines.length - 1].trim() === '') {
      continue;
    }
    lines.push(rawLines[i]);
  }

  return (
    <div className="space-y-2 text-xs sm:text-sm text-neutral-800 leading-relaxed font-normal">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // 1. Numbered item: e.g. "1. ..." or "1) ..."
        const numberedMatch = trimmed.match(/^(\d+)[\.\)]\s*(.+)$/);
        if (numberedMatch) {
          const num = numberedMatch[1];
          const content = numberedMatch[2];
          return (
            <div key={idx} className="flex items-start gap-2.5 py-1 group">
              <span className="w-5 h-5 rounded bg-brand-50 text-brand-700 font-semibold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                {num}
              </span>
              <div className="flex-1 text-neutral-700 leading-relaxed font-sans">
                {renderInlineFormatted(content)}
              </div>
            </div>
          );
        }

        // 2. Bullet item: e.g. "- ..." or "* ..." or "• ..."
        const bulletMatch = trimmed.match(/^[-*•]\s*(.+)$/);
        if (bulletMatch) {
          const content = bulletMatch[1];
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-3 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
              <div className="flex-1 text-neutral-700 leading-relaxed font-sans">
                {renderInlineFormatted(content)}
              </div>
            </div>
          );
        }

        // 3. Section Heading: e.g. ends with ":" and is relatively short (<= 65 chars)
        if (trimmed.endsWith(':') && trimmed.length <= 65 && !trimmed.startsWith('http')) {
          return (
            <div key={idx} className="pt-2 pb-1 flex items-center gap-2 text-xs font-semibold text-neutral-950">
              <span>{trimmed}</span>
            </div>
          );
        }

        // 4. Regular paragraph
        return (
          <p key={idx} className="text-neutral-700 leading-relaxed font-sans">
            {renderInlineFormatted(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// 4. Modern Developer Code Snippet Box with Syntax Highlighting and Line Numbers
function CodeSnippetBox({ code, cardId, copiedCodeId, onCopy }) {
  if (!code) return null;
  const cleanCode = normalizeCardText(code);
  const codeLines = cleanCode.split('\n');

  const highlightLine = (line) => {
    const commentMatch = line.match(/^(\s*)((\/\/|#|--).*)$/);
    if (commentMatch) {
      return (
        <>
          <span>{commentMatch[1]}</span>
          <span className="text-slate-400 italic font-mono">{commentMatch[2]}</span>
        </>
      );
    }

    const inlineCommentIndex = line.search(/(\/\/|#|--)/);
    let codePart = line;
    let commentPart = null;
    if (inlineCommentIndex !== -1) {
      codePart = line.substring(0, inlineCommentIndex);
      commentPart = line.substring(inlineCommentIndex);
    }

    const tokenRegex = /(".*?"|'.*?'|`.*?`|@\w+|\b(?:public|private|protected|class|interface|extends|implements|void|int|long|double|float|boolean|char|byte|short|String|var|val|let|const|function|return|this|super|new|if|else|for|while|do|switch|case|default|break|continue|try|catch|finally|throw|throws|import|package|static|final|abstract|synchronized|volatile|transient|native|strictfp|instanceof|assert|enum|def|self|from|as|with|pass|lambda|yield|async|await|SELECT|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|ON|GROUP|BY|ORDER|HAVING|LIMIT|OFFSET|CREATE|TABLE|INDEX|INSERT|INTO|VALUES|UPDATE|SET|DELETE|AND|OR|NOT|IN|EXISTS|IS|NULL|null|true|false|None|True|False)\b|\b\d+(\.\d+)?\b|[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\())/g;

    const tokens = [];
    let lastIndex = 0;
    let match;

    while ((match = tokenRegex.exec(codePart)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({ text: codePart.substring(lastIndex, match.index), type: 'plain' });
      }
      const val = match[0];
      if (val.startsWith('"') || val.startsWith("'") || val.startsWith('`')) {
        tokens.push({ text: val, type: 'string' });
      } else if (val.startsWith('@')) {
        tokens.push({ text: val, type: 'annotation' });
      } else if (/^\d/.test(val)) {
        tokens.push({ text: val, type: 'number' });
      } else if (/^(public|private|protected|class|interface|extends|implements|void|int|long|double|float|boolean|char|byte|short|String|var|val|let|const|function|return|this|super|new|if|else|for|while|do|switch|case|default|break|continue|try|catch|finally|throw|throws|import|package|static|final|abstract|synchronized|volatile|transient|native|strictfp|instanceof|assert|enum|def|self|from|as|with|pass|lambda|yield|async|await|SELECT|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|ON|GROUP|BY|ORDER|HAVING|LIMIT|OFFSET|CREATE|TABLE|INDEX|INSERT|INTO|VALUES|UPDATE|SET|DELETE|AND|OR|NOT|IN|EXISTS|IS|NULL|null|true|false|None|True|False)$/.test(val)) {
        tokens.push({ text: val, type: 'keyword' });
      } else {
        tokens.push({ text: val, type: 'function' });
      }
      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < codePart.length) {
      tokens.push({ text: codePart.substring(lastIndex), type: 'plain' });
    }

    return (
      <>
        {tokens.map((tok, i) => {
          if (tok.type === 'keyword') {
            return <span key={i} className="text-neutral-950 font-bold">{tok.text}</span>;
          }
          if (tok.type === 'string') {
            return <span key={i} className="text-neutral-700 font-medium">{tok.text}</span>;
          }
          if (tok.type === 'annotation') {
            return <span key={i} className="text-neutral-800 font-semibold">{tok.text}</span>;
          }
          if (tok.type === 'number') {
            return <span key={i} className="text-neutral-900 font-mono font-medium">{tok.text}</span>;
          }
          if (tok.type === 'function') {
            return <span key={i} className="text-neutral-900 font-medium">{tok.text}</span>;
          }
          return <span key={i} className="text-neutral-800">{tok.text}</span>;
        })}
        {commentPart && (
          <span className="text-neutral-400 italic font-mono">{commentPart}</span>
        )}
      </>
    );
  };

  return (
    <div className="rounded-xl overflow-hidden bg-neutral-50 text-xs font-mono">
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-100 text-[11px] text-neutral-600">
        <div className="flex items-center gap-2">
          <span className="font-bold text-neutral-900 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-black" />
            <span>Cod</span>
          </span>
          <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">
            ({codeLines.length} linii)
          </span>
        </div>
        <button
          onClick={() => onCopy(cleanCode, cardId)}
          className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-800 hover:text-black bg-white hover:bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
          title="Copiază codul"
        >
          {copiedCodeId === cardId ? (
            <>
              <Check className="w-3 h-3 text-black" />
              <span className="text-neutral-950 font-semibold">Copiat</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-neutral-500" />
              <span>Copiază</span>
            </>
          )}
        </button>
      </div>

      <div className="p-3 sm:p-4 overflow-x-auto text-[12px] leading-relaxed font-mono bg-neutral-50 selection:bg-neutral-200 selection:text-black">
        <table className="w-full border-collapse">
          <tbody>
            {codeLines.map((line, idx) => (
              <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                <td className="w-8 select-none text-right pr-3.5 text-[11px] text-neutral-400 font-mono align-top py-0.5 border-r border-neutral-200">
                  {idx + 1}
                </td>
                <td className="pl-3.5 py-0.5 whitespace-pre font-mono text-neutral-900 align-top">
                  {highlightLine(line)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const DIFFICULTY_LABELS = { USOR: 'Ușor', MEDIU: 'Mediu', DIFICIL: 'Dificil' };

export default function JavaAnkiTrainer() {
  // Navigation & Category Filter
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL'); // 'ALL' | 'USOR' | 'MEDIU' | 'DIFICIL'
  const [searchQuery, setSearchQuery] = useState('');
  const [viewStyle, setViewStyle] = useState('FLASHCARD'); // 'FLASHCARD' | 'CATALOG'
  const [visibleCatalogLimit, setVisibleCatalogLimit] = useState(20);

  // Flashcard Player State & CardMotion Physics Engine
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [slideAnimationClass, setSlideAnimationClass] = useState('');
  const [isAnimatingSlide, setIsAnimatingSlide] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

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

  // Web Audio API: High-frequency tactile card turnover & slide cues (zero external dependencies)
  const playCardFlipSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.07);
      
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {
      // Audio autoplay policy or unavailable, fail silently
    }
  }, [soundEnabled]);

  const playCardSlideSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const bufferSize = Math.floor(ctx.sampleRate * 0.06);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.06);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.035, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch {
      // Fail silently
    }
  }, [soundEnabled]);

  // Card Flip Action with 3D Physics
  const handleFlip = useCallback(() => {
    if (isAnimatingSlide) return;
    playCardFlipSound();
    setIsFlipped(prev => !prev);
  }, [isAnimatingSlide, playCardFlipSound]);

  // Deck Motion Transition (Slide Out Current Card -> Drop In Next Card)
  const goToCard = useCallback((newIndex, direction = 'next') => {
    if (isAnimatingSlide || filteredCards.length === 0) return;
    setIsAnimatingSlide(true);

    const outClass = isFlipped
      ? (direction === 'next' ? 'anki-slide-out-left-flipped' : 'anki-slide-out-right-flipped')
      : (direction === 'next' ? 'anki-slide-out-left' : 'anki-slide-out-right');

    setSlideAnimationClass(outClass);
    playCardSlideSound();

    setTimeout(() => {
      setIsFlipped(false);
      setCurrentCardIndex(newIndex);
      setSlideAnimationClass('anki-slide-in-top');

      setTimeout(() => {
        setSlideAnimationClass('');
        setIsAnimatingSlide(false);
      }, 280);
    }, 230);
  }, [isAnimatingSlide, isFlipped, filteredCards.length, playCardSlideSound]);

  // Handle Anki Rating (Again, Hard, Good, Easy) with CardMotion Slide Out
  const handleRateCard = useCallback((rating) => {
    if (!currentCard || isAnimatingSlide) return;

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

    // Trigger deck slide-out to next card
    goToCard((currentCardIndex + 1) % filteredCards.length, 'next');
  }, [currentCard, isAnimatingSlide, progress, currentCardIndex, filteredCards.length, goToCard]);

  // Keyboard Shortcuts (Space to flip, 1-4 to rate, Left/Right arrows to navigate)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (isFlipped) {
        if (e.key === '1') handleRateCard('AGAIN');
        else if (e.key === '2') handleRateCard('HARD');
        else if (e.key === '3') handleRateCard('GOOD');
        else if (e.key === '4') handleRateCard('EASY');
      } else {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          goToCard((currentCardIndex + 1) % filteredCards.length, 'next');
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          goToCard((currentCardIndex - 1 + filteredCards.length) % filteredCards.length, 'prev');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, handleFlip, handleRateCard, goToCard, currentCardIndex, filteredCards.length]);

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleResetProgress = () => {
    if (window.confirm('Sigur vrei să resetezi tot progresul? Toate cardurile revin la starea inițială.')) {
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

  const getDifficultyBadgeStyle = (difficulty) => {
    switch (difficulty) {
      case 'DIFICIL':
        return 'bg-rose-50 text-rose-800';
      case 'MEDIU':
        return 'bg-amber-50 text-amber-800';
      case 'USOR':
      default:
        return 'bg-emerald-50 text-emerald-800';
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'mastered':
        return 'bg-emerald-50 text-emerald-800';
      case 'learning':
        return 'bg-amber-50 text-amber-800';
      case 'review':
        return 'bg-brand-50 text-brand-700';
      default:
        return 'bg-neutral-100 text-neutral-700';
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

  return (
    <div className="space-y-5 font-sans text-neutral-900">
      
      {/* STATISTICI */}
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['Total carduri', stats.total],
          ['Stăpânite', stats.mastered],
          ['În învățare', stats.learning + stats.review],
          ['De explorat', stats.unstudied]
        ].map(([label, value]) => (
          <Card key={label} padding="px-4 py-3">
            <dt className="text-xs text-neutral-500">{label}</dt>
            <dd className="text-2xl font-semibold text-neutral-950 mt-0.5">{value}</dd>
          </Card>
        ))}
      </dl>

      {/* 2. CONTROLS: CATEGORIES & VIEW SWITCHER */}
      <Card padding="p-5" className="space-y-4">
        
        {/* Header Domenii */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-0.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-500" />
            <h2 className="font-serif text-lg font-medium text-neutral-950">
              Domeniu <span className="text-neutral-400 font-sans text-sm">({TECH_ANKI_CATEGORIES.length - 1})</span>
            </h2>
          </div>
          <div className="text-xs text-neutral-500">
            {TECH_ANKI_CATEGORIES.find(c => c.id === selectedCategory)?.label || 'Toate'}: {categoryCounts[selectedCategory] || 0} carduri
          </div>
        </div>

        {/* Categories Grid */}
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
                aria-pressed={isSelected}
                className={`p-3 rounded-xl transition-colors cursor-pointer border text-left flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-brand-50 border-brand-500 text-neutral-950'
                    : 'bg-white hover:border-neutral-300 hover:bg-neutral-50 text-neutral-900 border-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`p-1.5 rounded-lg shrink-0 ${
                    isSelected
                      ? 'bg-brand-500 text-white'
                      : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    {renderCategoryIcon(cat.id, "w-3.5 h-3.5")}
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                    {count}
                  </span>
                </div>

                <div className="font-semibold text-xs leading-snug line-clamp-2 min-h-[30px] flex items-center text-neutral-950">
                  {cat.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Second line: Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-neutral-100">
          
          {/* Difficulty pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-neutral-500 mr-1">Dificultate</span>
            {[
              { id: 'ALL', label: 'Toate' },
              { id: 'USOR', label: 'Ușor' },
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
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  difficultyFilter === diff.id
                    ? 'bg-brand-500 text-white font-semibold'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-950'
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>

          {/* View mode toggle & Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="inline-flex items-center p-1 bg-neutral-100 rounded-xl" role="group" aria-label="Mod afișare">
              <button
                onClick={() => setViewStyle('FLASHCARD')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  viewStyle === 'FLASHCARD' ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                Carduri
              </button>
              <button
                onClick={() => setViewStyle('CATALOG')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  viewStyle === 'CATALOG' ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                Catalog ({filteredCards.length})
              </button>
            </div>

            <button
              onClick={handleShuffle}
              title="Amestecă cardurile" aria-label="Amestecă cardurile"
              className="p-2 rounded-xl border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={handleResetProgress}
              title="Resetează progresul" aria-label="Resetează progresul"
              className="p-2 rounded-xl border border-neutral-200 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search bar inside cards */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            aria-label="Caută în întrebări"
            placeholder="Caută în întrebări"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentCardIndex(0);
              setVisibleCatalogLimit(20);
            }}
            className="w-full pl-9 pr-9 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-hidden focus:border-brand-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCurrentCardIndex(0);
              }}
              aria-label="Șterge căutarea"
              className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700 cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </Card>

      {/* 3. MAIN INTERACTIVE FLASHCARD COMPONENT */}
      {viewStyle === 'FLASHCARD' ? (
        filteredCards.length === 0 ? (
          <Card padding="p-12" className="text-center space-y-3">
            <HelpCircle className="w-10 h-10 text-neutral-400 mx-auto" />
            <h3 className="text-base font-semibold text-neutral-950">Niciun card pentru filtrele alese</h3>
            <p className="text-sm text-neutral-500">Schimbă domeniul, dificultatea sau căutarea.</p>
          </Card>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            
            {/* Card Progress Header */}
            <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
              <div className="flex items-center gap-2">
                <span className="text-neutral-600">Card {currentCardIndex + 1} din {filteredCards.length}</span>
                <span className={`px-2 py-0.5 rounded text-[11px] ${getStatusBadgeStyle(cardStatus)}`}>
                  {cardStatus === 'mastered' ? 'Stăpânit' :
                   cardStatus === 'learning' ? 'În învățare' :
                   cardStatus === 'review' ? 'De revizuit' : 'Nou'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-36 bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-brand-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.round(((currentCardIndex + 1) / filteredCards.length) * 100)}%` }}
                />
              </div>
            </div>

            {/* THE INTERACTIVE 3D PERSPECTIVE CARD (ANKI CARD-MOTION ENGINE) */}
            <div className="anki-motion-container w-full">
              <div 
                className={`anki-motion-card ${isFlipped ? 'is-flipped' : ''} ${slideAnimationClass} min-h-[500px] h-[520px] sm:h-[560px]`}
              >
                {/* ================================================================= */}
                {/* FRONT FACE (QUESTION)                                            */}
                {/* ================================================================= */}
                <div 
                  onClick={handleFlip}
                  className={`anki-motion-face anki-motion-face-front p-6 sm:p-8 flex flex-col justify-between bg-white cursor-pointer select-none rounded-2xl ${isFlipped ? 'pointer-events-none' : ''}`}
                >
                  {/* Front Card Meta Badges */}
                  <div className="flex items-center justify-between gap-3 mb-4 shrink-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-800 flex items-center gap-1.5">
                        {renderCategoryIcon(currentCard.category, "w-3 h-3 text-brand-500")}
                        <span>{TECH_ANKI_CATEGORIES.find(c => c.id === currentCard.category)?.label || currentCard.category}</span>
                      </span>

                      <span className={`px-2 py-0.5 rounded text-[11px] ${getDifficultyBadgeStyle(currentCard.difficulty)}`}>
                        {DIFFICULTY_LABELS[currentCard.difficulty] || currentCard.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSoundEnabled(prev => !prev);
                        }}
                        title={soundEnabled ? 'Dezactivează sunetul' : 'Activează sunetul'}
                        aria-label={soundEnabled ? 'Dezactivează sunetul' : 'Activează sunetul'}
                        className="p-1 rounded-md text-neutral-400 hover:text-neutral-950 hover:bg-neutral-100 transition cursor-pointer"
                      >
                        {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-neutral-400" />}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFlip();
                        }}
                        className="text-[11px] text-neutral-600 hover:text-neutral-950 flex items-center gap-1.5 transition cursor-pointer bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded-lg"
                        title="Întoarce cardul"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-neutral-700 transition" />
                        <span className="hidden sm:inline font-medium">Arată răspunsul</span>
                      </button>
                    </div>
                  </div>

                  {/* Front Card Question Content */}
                  <div className="flex-1 flex flex-col justify-center py-2 overflow-y-auto">
                    <div className="space-y-4">

                      <h2 className="font-serif text-xl sm:text-2xl font-medium text-neutral-950 leading-snug">
                        {normalizeCardText(currentCard.title)}
                      </h2>
                      <div className="p-4 sm:p-5 rounded-xl bg-neutral-50 text-sm sm:text-base text-neutral-800 leading-relaxed font-normal">
                        {normalizeCardText(currentCard.question)}
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFlip();
                          }}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Arată răspunsul</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Front Card Footer Shortcuts Bar */}
                  <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-500 font-medium shrink-0">
                    <div className="text-[11px] text-neutral-400">
                      <kbd className="font-semibold">Space</kbd> răspuns · <kbd className="font-semibold">&larr; &rarr;</kbd> navigare
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToCard((currentCardIndex - 1 + filteredCards.length) % filteredCards.length, 'prev');
                        }}
                        disabled={isAnimatingSlide}
                        className="p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition cursor-pointer"
                        title="Cardul anterior" aria-label="Cardul anterior"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-[11px] text-neutral-500 px-1">
                        {currentCardIndex + 1} / {filteredCards.length}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToCard((currentCardIndex + 1) % filteredCards.length, 'next');
                        }}
                        disabled={isAnimatingSlide}
                        className="p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition cursor-pointer"
                        title="Cardul următor" aria-label="Cardul următor"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ================================================================= */}
                {/* BACK FACE (ANSWER & CODE)                                         */}
                {/* ================================================================= */}
                <div 
                  className={`anki-motion-face anki-motion-face-back p-6 sm:p-8 flex flex-col justify-between bg-white select-none rounded-2xl ${!isFlipped ? 'pointer-events-none' : ''}`}
                >
                  {/* Back Card Meta Badges */}
                  <div className="flex items-center justify-between gap-3 mb-3 shrink-0">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 text-[11px] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Răspuns</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSoundEnabled(prev => !prev);
                        }}
                        title={soundEnabled ? 'Dezactivează sunetul' : 'Activează sunetul'}
                        aria-label={soundEnabled ? 'Dezactivează sunetul' : 'Activează sunetul'}
                        className="p-1 rounded-md text-neutral-400 hover:text-neutral-950 hover:bg-neutral-100 transition cursor-pointer"
                      >
                        {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-neutral-400" />}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFlip();
                        }}
                        className="text-[11px] text-neutral-600 hover:text-neutral-950 flex items-center gap-1.5 transition cursor-pointer bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded-lg"
                        title="Înapoi la întrebare"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-neutral-700 transition" />
                        <span className="hidden sm:inline font-medium">Înapoi la întrebare</span>
                      </button>
                    </div>
                  </div>

                  {/* Back Card Answer & Code Content (Scrollable with stopPropagation) */}
                  <div 
                    onClick={(e) => e.stopPropagation()} 
                    className="flex-1 py-1 overflow-y-auto space-y-4 pr-1 select-text cursor-auto"
                  >
                    <span className="text-sm font-semibold text-neutral-950 block truncate">
                      {normalizeCardText(currentCard.title)}
                    </span>

                    {/* Formatted Answer */}
                    <div className="p-4 sm:p-5 rounded-xl bg-neutral-50">
                      <FormattedAnswer text={currentCard.answer} />
                    </div>

                    {/* Syntax-Highlighted Developer Code Snippet Box */}
                    {currentCard.codeSnippet && (
                      <CodeSnippetBox
                        code={currentCard.codeSnippet}
                        cardId={currentCard.id}
                        copiedCodeId={copiedCodeId}
                        onCopy={handleCopyCode}
                      />
                    )}

                    {/* Interview Trap & Key Takeaway */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {currentCard.interviewTrap && (
                        <div className="p-4 rounded-xl bg-amber-50 flex flex-col justify-between">
                          <div>
                            <div className="font-semibold text-xs flex items-center gap-2 text-amber-900 mb-1.5">
                              <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              <span>Capcană la interviu</span>
                            </div>
                            <p className="text-xs leading-relaxed text-neutral-800 font-normal">
                              {normalizeCardText(currentCard.interviewTrap)}
                            </p>
                          </div>
                        </div>
                      )}

                      {currentCard.keyTakeaway && (
                        <div className="p-4 rounded-xl bg-neutral-50 flex flex-col justify-between">
                          <div>
                            <div className="font-semibold text-xs flex items-center gap-2 text-neutral-900 mb-1.5">
                              <Zap className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                              <span>Concluzie</span>
                            </div>
                            <p className="text-xs leading-relaxed text-neutral-700 font-normal">
                              {normalizeCardText(currentCard.keyTakeaway)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Back Card Footer Shortcuts Bar */}
                  <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-500 font-medium shrink-0">
                    <div className="text-[11px] text-neutral-400">
                      <kbd className="font-semibold">Space</kbd> întoarce · <kbd className="font-semibold">1-4</kbd> evaluează
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToCard((currentCardIndex - 1 + filteredCards.length) % filteredCards.length, 'prev');
                        }}
                        disabled={isAnimatingSlide}
                        className="p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition cursor-pointer"
                        title="Cardul anterior" aria-label="Cardul anterior"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-[11px] text-neutral-500 px-1">
                        {currentCardIndex + 1} / {filteredCards.length}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToCard((currentCardIndex + 1) % filteredCards.length, 'next');
                        }}
                        disabled={isAnimatingSlide}
                        className="p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition cursor-pointer"
                        title="Cardul următor" aria-label="Cardul următor"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STUDY ACTION BAR: FLIP PROMPT (WHEN QUESTION) OR EVALUATION RATINGS (WHEN ANSWER) */}
            <Card padding="p-4 sm:p-5">
              {!isFlipped ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                      <RotateCw className="w-4 h-4 text-brand-500" />
                    </div>
                    <p className="text-sm font-medium text-neutral-900">Gândește-te la răspuns, apoi întoarce cardul</p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={handleFlip}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Întoarce cardul</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-neutral-950 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-brand-500" />
                      Cât de bine ai știut răspunsul?
                    </span>
                    <button
                      type="button"
                      onClick={handleFlip}
                      className="text-xs text-neutral-500 hover:text-neutral-950 flex items-center gap-1 cursor-pointer transition"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>Înapoi la întrebare</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* 1. AGAIN */}
                    <button
                      onClick={() => handleRateCard('AGAIN')}
                      className="p-4 rounded-xl bg-white hover:bg-rose-50/40 border border-neutral-200 hover:border-rose-300 transition-colors text-left flex flex-col justify-between gap-2.5 cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="w-5 h-5 rounded bg-rose-100 text-rose-800 text-xs font-semibold flex items-center justify-center">
                          1
                        </span>
                        <span className="text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                          sub 1 zi
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-neutral-950">
                          Din nou
                        </div>
                        <div className="text-[11px] text-neutral-500 font-medium mt-0.5">
                          Repetă azi
                        </div>
                      </div>
                    </button>

                    {/* 2. HARD */}
                    <button
                      onClick={() => handleRateCard('HARD')}
                      className="p-4 rounded-xl bg-white hover:bg-amber-50/40 border border-neutral-200 hover:border-amber-300 transition-colors text-left flex flex-col justify-between gap-2.5 cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="w-5 h-5 rounded bg-amber-100 text-amber-800 text-xs font-semibold flex items-center justify-center">
                          2
                        </span>
                        <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          2-3 zile
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-neutral-950">
                          Greu
                        </div>
                        <div className="text-[11px] text-neutral-500 font-medium mt-0.5">
                          Cu efort
                        </div>
                      </div>
                    </button>

                    {/* 3. GOOD */}
                    <button
                      onClick={() => handleRateCard('GOOD')}
                      className="p-4 rounded-xl bg-white hover:border-brand-500 border border-neutral-200 transition-colors text-left flex flex-col justify-between gap-2.5 cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="w-5 h-5 rounded bg-brand-50 text-brand-700 text-xs font-semibold flex items-center justify-center">
                          3
                        </span>
                        <span className="text-[11px] text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                          5-7 zile
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-neutral-950">
                          Bine
                        </div>
                        <div className="text-[11px] text-neutral-500 font-medium mt-0.5">
                          Reținut
                        </div>
                      </div>
                    </button>

                    {/* 4. EASY */}
                    <button
                      onClick={() => handleRateCard('EASY')}
                      className="p-4 rounded-xl bg-white hover:bg-emerald-50/40 border border-neutral-200 hover:border-emerald-300 transition-colors text-left flex flex-col justify-between gap-2.5 cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center">
                          4
                        </span>
                        <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          14+ zile
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-neutral-950">
                          Ușor
                        </div>
                        <div className="text-[11px] text-neutral-500 font-medium mt-0.5">
                          Stăpânit
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )
      ) : (
        /* 4. CATALOG / CHEATSHEET VIEW */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
            <span>{visibleCatalogCards.length} din {filteredCards.length} întrebări</span>
            <span>{TECH_ANKI_CATEGORIES.find(c => c.id === selectedCategory)?.label || 'Toate'}</span>
          </div>

          <div className="space-y-3">
            {visibleCatalogCards.map((card, idx) => {
              const status = progress[card.id]?.status || 'new';
              return (
                <Card
                  key={card.id}
                  padding="p-5 sm:p-6"
                  className="hover:border-neutral-300 transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-neutral-400">#{idx + 1}</span>
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-700 flex items-center gap-1.5">
                        {renderCategoryIcon(card.category, "w-3 h-3 text-neutral-600")}
                        {TECH_ANKI_CATEGORIES.find(c => c.id === card.category)?.label || card.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] ${getDifficultyBadgeStyle(card.difficulty)}`}>
                        {DIFFICULTY_LABELS[card.difficulty] || card.difficulty}
                      </span>
                    </div>

                    <span className={`text-[11px] px-2.5 py-0.5 rounded self-start sm:self-auto ${getStatusBadgeStyle(status)}`}>
                      {status === 'mastered' ? 'Stăpânit' :
                       status === 'learning' ? 'În învățare' :
                       status === 'review' ? 'De revizuit' : 'Nou'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-neutral-950">
                      {normalizeCardText(card.title)}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {normalizeCardText(card.question)}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-50">
                    <FormattedAnswer text={card.answer} />
                  </div>

                  {card.codeSnippet && (
                    <CodeSnippetBox
                      code={card.codeSnippet}
                      cardId={card.id}
                      copiedCodeId={copiedCodeId}
                      onCopy={handleCopyCode}
                    />
                  )}

                  {card.interviewTrap && (
                    <div className="p-3.5 rounded-xl bg-amber-50 text-neutral-800 text-xs font-normal">
                      <span className="font-semibold text-amber-900 mr-1">Capcană la interviu:</span>
                      {normalizeCardText(card.interviewTrap)}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Load More Button */}
          {visibleCatalogLimit < filteredCards.length && (
            <div className="text-center pt-2">
              <button
                onClick={() => setVisibleCatalogLimit(prev => prev + 20)}
                className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Încarcă încă 20 ({filteredCards.length - visibleCatalogLimit} rămase)</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
