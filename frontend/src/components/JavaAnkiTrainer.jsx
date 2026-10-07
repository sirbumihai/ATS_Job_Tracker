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
        <code key={pIdx} className="font-mono text-[11px] font-semibold text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-300">
          {part.slice(1, -1)}
        </code>
      );
    }
    const subParts = part.split(/(\b(?:this|super|new|void|int|String|boolean|class|SELECT|FROM|WHERE|JOIN|INDEX)\b(?:\([^)]*\))?|[a-zA-Z0-9_$]+\([^)]*\))/g);
    return subParts.map((sub, sIdx) => {
      if (/^(\b(?:this|super|new|void|int|String|boolean|class|SELECT|FROM|WHERE|JOIN|INDEX)\b(?:\([^)]*\))?|[a-zA-Z0-9_$]+\([^)]*\))$/.test(sub)) {
        return (
          <code key={`${pIdx}-${sIdx}`} className="font-mono text-[11px] font-semibold text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-300">
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
              <span className="w-5 h-5 rounded bg-neutral-100 text-neutral-900 font-bold font-mono text-[10px] flex items-center justify-center shrink-0 border border-neutral-300 mt-0.5 group-hover:bg-black group-hover:text-white transition-colors">
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
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2 shrink-0" />
              <div className="flex-1 text-neutral-700 leading-relaxed font-sans">
                {renderInlineFormatted(content)}
              </div>
            </div>
          );
        }

        // 3. Section Heading: e.g. ends with ":" and is relatively short (<= 65 chars)
        if (trimmed.endsWith(':') && trimmed.length <= 65 && !trimmed.startsWith('http')) {
          return (
            <div key={idx} className="pt-2 pb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100">
              <Sparkles className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
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
    <div className="rounded-xl overflow-hidden bg-neutral-50 border border-neutral-200 text-xs font-mono">
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-100 border-b border-neutral-200 text-[11px] text-neutral-600">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
          </div>
          <div className="h-3 w-px bg-neutral-300 mx-1" />
          <span className="font-bold text-neutral-900 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-black" />
            <span>Solutie / Cod / Configurare</span>
          </span>
          <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">
            ({codeLines.length} linii)
          </span>
        </div>
        <button
          onClick={() => onCopy(cleanCode, cardId)}
          className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-800 hover:text-black bg-white hover:bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
          title="Copiaza codul in clipboard"
        >
          {copiedCodeId === cardId ? (
            <>
              <Check className="w-3 h-3 text-black" />
              <span className="text-black font-bold">Copiat in clipboard</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-neutral-500" />
              <span>Copiaza cod</span>
            </>
          )}
        </button>
      </div>

      <div className="p-3 sm:p-4 overflow-x-auto text-[12px] leading-relaxed font-mono bg-white border-t-0 selection:bg-neutral-200 selection:text-black">
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

  // Monolithic Theme System for Anki Categories
  const getCategoryTheme = () => {
    return {
      accent: 'neutral',
      ring: 'ring-1 ring-black border-black',
      activeBg: 'bg-black text-white',
      iconBg: 'bg-neutral-100 text-neutral-900 border-neutral-300',
      badge: 'bg-black text-white font-mono',
      gradientAccent: 'bg-black',
      cardBorder: 'hover:border-black'
    };
  };

  const getDifficultyBadgeStyle = (difficulty) => {
    switch (difficulty) {
      case 'DIFICIL':
        return 'bg-rose-50 text-rose-800 border-rose-200 font-mono';
      case 'MEDIU':
        return 'bg-amber-50 text-amber-800 border-amber-200 font-mono';
      case 'USOR':
      default:
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 font-mono';
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'mastered':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 font-mono';
      case 'learning':
        return 'bg-amber-50 text-amber-800 border-amber-200 font-mono';
      case 'review':
        return 'bg-neutral-100 text-neutral-800 border-neutral-300 font-mono';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200 font-mono';
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
    <div className="space-y-6 font-sans text-neutral-900">
      
      {/* 1. TOP STATS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200">
          <div className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-black" />
            Total Carduri Tech
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-1.5">
            {stats.total}
          </div>
          <div className="text-[11px] text-neutral-600 font-medium mt-0.5">
            11 Domenii & Curicula 2026
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200">
          <div className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-black" />
            Stapanite (Easy)
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-1.5">
            {stats.mastered}
          </div>
          <div className="text-[11px] text-neutral-600 font-medium mt-0.5">
            {stats.completionPercent}% din intregul pachet
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200">
          <div className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-black" />
            In Invatare
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-1.5">
            {stats.learning + stats.review}
          </div>
          <div className="text-[11px] text-neutral-600 font-medium mt-0.5">
            Repetitie spatiata activa
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200">
          <div className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-black" />
            De Explorat
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-1.5">
            {stats.unstudied}
          </div>
          <div className="text-[11px] text-neutral-600 font-medium mt-0.5">
            Carduri noi de parcurs
          </div>
        </div>
      </div>

      {/* 2. CONTROLS: CATEGORIES & VIEW SWITCHER */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-neutral-200 space-y-4">
        
        {/* Header Domenii */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-0.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-black" />
            <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Alege Domeniul de Studiu ({TECH_ANKI_CATEGORIES.length - 1} Specializari):
            </span>
          </div>
          <div className="text-[11px] text-neutral-500 font-medium font-mono">
            Selectat: <span className="font-bold text-black">{TECH_ANKI_CATEGORIES.find(c => c.id === selectedCategory)?.label || 'Toate'}</span> ({categoryCounts[selectedCategory] || 0} carduri)
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
                className={`p-3 rounded-xl transition-colors cursor-pointer border text-left flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-black border-black text-white'
                    : 'bg-white hover:border-black text-neutral-900 border-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`p-1.5 rounded-lg shrink-0 ${
                    isSelected
                      ? 'bg-neutral-800 text-white'
                      : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                  }`}>
                    {renderCategoryIcon(cat.id, "w-3.5 h-3.5")}
                  </div>
                  <span className={`text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded ${
                    isSelected
                      ? 'bg-neutral-800 text-white font-bold'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {count}
                  </span>
                </div>

                <div className={`font-bold text-xs leading-snug line-clamp-2 min-h-[30px] flex items-center ${
                  isSelected ? 'text-white' : 'text-neutral-900'
                }`}>
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
            <span className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider mr-1">
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
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  difficultyFilter === diff.id
                    ? 'bg-black text-white font-bold'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-black'
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>

          {/* View mode toggle & Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="inline-flex items-center p-1 bg-neutral-100 rounded-xl border border-neutral-200">
              <button
                onClick={() => setViewStyle('FLASHCARD')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  viewStyle === 'FLASHCARD' ? 'bg-black text-white font-bold' : 'text-neutral-600 hover:text-black'
                }`}
              >
                Mod Card (Anki)
              </button>
              <button
                onClick={() => setViewStyle('CATALOG')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  viewStyle === 'CATALOG' ? 'bg-black text-white font-bold' : 'text-neutral-600 hover:text-black'
                }`}
              >
                Catalog ({filteredCards.length})
              </button>
            </div>

            <button
              onClick={handleShuffle}
              title="Amesteca cardurile"
              className="p-2 rounded-xl border border-neutral-200 text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={handleResetProgress}
              title="Reseteaza progresul"
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
            placeholder="Cauta in toate intrebarile (ex: HashMap, N+1, Virtual Threads, VPC, Docker, RAG, useMemo, Token Bucket)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentCardIndex(0);
              setVisibleCatalogLimit(20);
            }}
            className="w-full pl-9 pr-9 py-2 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-hidden focus:border-black transition"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCurrentCardIndex(0);
              }}
              className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700 cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. MAIN INTERACTIVE FLASHCARD COMPONENT */}
      {viewStyle === 'FLASHCARD' ? (
        filteredCards.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-neutral-200 space-y-3">
            <HelpCircle className="w-10 h-10 text-neutral-400 mx-auto" />
            <h3 className="text-base font-bold text-neutral-900">Nu am gasit carduri pentru filtrele selectate</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Incearca sa schimbi categoria, sa setezi dificultatea pe "Toate" sau sa cureti termenii de cautare.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            
            {/* Card Progress Header */}
            <div className="flex items-center justify-between text-xs font-mono font-bold text-neutral-500 px-1">
              <div className="flex items-center gap-2">
                <span className="text-neutral-600">Card {currentCardIndex + 1} din {filteredCards.length}</span>
                <span className="text-neutral-300">•</span>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border ${getStatusBadgeStyle(cardStatus)}`}>
                  {cardStatus === 'mastered' ? 'Stapanit' :
                   cardStatus === 'learning' ? 'In Invatare' :
                   cardStatus === 'review' ? 'De Revizuit' : 'Card Nou'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-36 bg-neutral-100 rounded-full h-1.5 overflow-hidden border border-neutral-200">
                <div 
                  className="bg-black h-full rounded-full transition-all duration-300"
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
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-300 flex items-center gap-1.5">
                        {renderCategoryIcon(currentCard.category, "w-3 h-3 text-black")}
                        <span>{TECH_ANKI_CATEGORIES.find(c => c.id === currentCard.category)?.label || currentCard.category}</span>
                      </span>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${getDifficultyBadgeStyle(currentCard.difficulty)}`}>
                        {currentCard.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSoundEnabled(prev => !prev);
                        }}
                        title={soundEnabled ? 'Dezactiveaza sunetul flip' : 'Activeaza sunetul flip'}
                        className="p-1 rounded-md text-neutral-400 hover:text-black hover:bg-neutral-100 transition cursor-pointer"
                      >
                        {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-neutral-400" />}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFlip();
                        }}
                        className="text-[11px] font-mono text-neutral-600 hover:text-black flex items-center gap-1.5 transition cursor-pointer bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded-lg border border-neutral-200"
                        title="Intoarce cardul"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-neutral-700 transition" />
                        <span className="hidden sm:inline font-sans font-medium">Apasa pentru raspuns</span>
                        <kbd className="inline-flex items-center gap-1 bg-white text-neutral-700 px-1.5 py-0.5 rounded text-[10px] font-mono border border-neutral-300 font-bold">SPACE</kbd>
                      </button>
                    </div>
                  </div>

                  {/* Front Card Question Content */}
                  <div className="flex-1 flex flex-col justify-center py-2 overflow-y-auto">
                    <div className="space-y-4">
                      <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-black" />
                        <span>Intrebare de Interviu Tehnic:</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight leading-snug">
                        {normalizeCardText(currentCard.title)}
                      </h2>
                      <div className="p-4 sm:p-5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm sm:text-base text-neutral-800 leading-relaxed font-normal">
                        {normalizeCardText(currentCard.question)}
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFlip();
                          }}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Vezi raspunsul canonic & explicatia</span>
                          <kbd className="inline-flex items-center bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded text-[10px] font-mono border border-neutral-700">SPACE</kbd>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Front Card Footer Shortcuts Bar */}
                  <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-500 font-medium shrink-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Comenzi Rapide:</span>
                      <span className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded text-[10px] font-mono border border-neutral-200">
                        <kbd className="font-bold">SPACE</kbd>
                        <span className="text-neutral-500 font-sans">raspuns</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded text-[10px] font-mono border border-neutral-200">
                        <kbd className="font-bold">&larr; &rarr;</kbd>
                        <span className="text-neutral-500 font-sans">navigare</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToCard((currentCardIndex - 1 + filteredCards.length) % filteredCards.length, 'prev');
                        }}
                        disabled={isAnimatingSlide}
                        className="p-1.5 text-neutral-700 hover:text-black hover:bg-neutral-100 border border-neutral-200 rounded-lg transition cursor-pointer"
                        title="Cardul anterior"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-[11px] font-mono font-bold text-neutral-500 px-1">
                        {currentCardIndex + 1} / {filteredCards.length}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToCard((currentCardIndex + 1) % filteredCards.length, 'next');
                        }}
                        disabled={isAnimatingSlide}
                        className="p-1.5 text-neutral-700 hover:text-black hover:bg-neutral-100 border border-neutral-200 rounded-lg transition cursor-pointer"
                        title="Cardul urmator"
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
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Raspuns Canonic Senior:</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSoundEnabled(prev => !prev);
                        }}
                        title={soundEnabled ? 'Dezactiveaza sunetul flip' : 'Activeaza sunetul flip'}
                        className="p-1 rounded-md text-neutral-400 hover:text-black hover:bg-neutral-100 transition cursor-pointer"
                      >
                        {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-neutral-400" />}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFlip();
                        }}
                        className="text-[11px] font-mono text-neutral-600 hover:text-black flex items-center gap-1.5 transition cursor-pointer bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded-lg border border-neutral-200"
                        title="Intoarce la intrebare"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-neutral-700 transition" />
                        <span className="hidden sm:inline font-sans font-medium">Inapoi la intrebare</span>
                        <kbd className="inline-flex items-center gap-1 bg-white text-neutral-700 px-1.5 py-0.5 rounded text-[10px] font-mono border border-neutral-300 font-bold">SPACE</kbd>
                      </button>
                    </div>
                  </div>

                  {/* Back Card Answer & Code Content (Scrollable with stopPropagation) */}
                  <div 
                    onClick={(e) => e.stopPropagation()} 
                    className="flex-1 py-1 overflow-y-auto space-y-4 pr-1 select-text cursor-auto"
                  >
                    <span className="text-xs font-bold text-neutral-900 block truncate">
                      {normalizeCardText(currentCard.title)}
                    </span>

                    {/* Formatted Answer */}
                    <div className="p-4 sm:p-5 rounded-xl bg-neutral-50 border border-neutral-200">
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
                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col justify-between">
                          <div>
                            <div className="font-bold text-xs uppercase tracking-wider flex items-center gap-2 text-amber-900 mb-1.5 font-mono">
                              <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              <span>Capcana la Interviu</span>
                            </div>
                            <p className="text-xs leading-relaxed text-neutral-800 font-normal">
                              {normalizeCardText(currentCard.interviewTrap)}
                            </p>
                          </div>
                        </div>
                      )}

                      {currentCard.keyTakeaway && (
                        <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col justify-between">
                          <div>
                            <div className="font-bold text-xs uppercase tracking-wider flex items-center gap-2 text-neutral-900 mb-1.5 font-mono">
                              <Zap className="w-3.5 h-3.5 text-black shrink-0" />
                              <span>Concluzie Cheie</span>
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFlip();
                        }}
                        className="inline-flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-2.5 py-1 rounded-lg text-[10px] font-mono border border-neutral-200 cursor-pointer transition font-medium"
                      >
                        <RotateCw className="w-3 h-3 text-neutral-700" />
                        <span>Inapoi la intrebare</span>
                        <kbd className="font-bold text-neutral-500">SPACE</kbd>
                      </button>
                      <span className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-700 px-2 py-1 rounded-lg text-[10px] font-mono border border-neutral-200">
                        <kbd className="font-bold">1 - 4</kbd>
                        <span className="text-neutral-500 font-sans">evalueaza</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToCard((currentCardIndex - 1 + filteredCards.length) % filteredCards.length, 'prev');
                        }}
                        disabled={isAnimatingSlide}
                        className="p-1.5 text-neutral-700 hover:text-black hover:bg-neutral-100 border border-neutral-200 rounded-lg transition cursor-pointer"
                        title="Cardul anterior"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-[11px] font-mono font-bold text-neutral-500 px-1">
                        {currentCardIndex + 1} / {filteredCards.length}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToCard((currentCardIndex + 1) % filteredCards.length, 'next');
                        }}
                        disabled={isAnimatingSlide}
                        className="p-1.5 text-neutral-700 hover:text-black hover:bg-neutral-100 border border-neutral-200 rounded-lg transition cursor-pointer"
                        title="Cardul urmator"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STUDY ACTION BAR: FLIP PROMPT (WHEN QUESTION) OR EVALUATION RATINGS (WHEN ANSWER) */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
              {!isFlipped ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 shrink-0">
                      <RotateCw className="w-4 h-4 text-black" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-900">Gandeste-te la raspuns inainte de a intoarce cardul</p>
                      <p className="text-[11px] text-neutral-500 font-mono">Apasa SPACE sau click pe card pentru solutia tehnica completa</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={handleFlip}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Intoarce Cardul (Flip)</span>
                      <kbd className="bg-neutral-800 text-neutral-200 text-[10px] px-1.5 py-0.5 rounded font-mono">SPACE</kbd>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-black" />
                      <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                        Evalueaza Retentia Mentala (Repetitie Spatiata)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleFlip}
                        className="text-[11px] font-mono text-neutral-500 hover:text-black flex items-center gap-1 cursor-pointer transition"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Inapoi la intrebare</span>
                      </button>
                      <div className="text-[11px] text-neutral-500 font-mono flex items-center gap-1">
                        <span>Taste:</span>
                        <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-800 text-[10px] font-bold">1</kbd>
                        <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-800 text-[10px] font-bold">2</kbd>
                        <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-800 text-[10px] font-bold">3</kbd>
                        <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-800 text-[10px] font-bold">4</kbd>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* 1. AGAIN */}
                    <button
                      onClick={() => handleRateCard('AGAIN')}
                      className="p-4 rounded-xl bg-white hover:bg-rose-50/40 border border-neutral-200 hover:border-rose-300 transition-colors text-left flex flex-col justify-between gap-2.5 cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="w-5 h-5 rounded bg-rose-100 text-rose-800 text-xs font-bold font-mono flex items-center justify-center border border-rose-200">
                          1
                        </span>
                        <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          &lt; 1 zi
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-sm text-neutral-900">
                          Again
                        </div>
                        <div className="text-[11px] text-neutral-500 font-medium mt-0.5">
                          Repeta astazi
                        </div>
                      </div>
                    </button>

                    {/* 2. HARD */}
                    <button
                      onClick={() => handleRateCard('HARD')}
                      className="p-4 rounded-xl bg-white hover:bg-amber-50/40 border border-neutral-200 hover:border-amber-300 transition-colors text-left flex flex-col justify-between gap-2.5 cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="w-5 h-5 rounded bg-amber-100 text-amber-800 text-xs font-bold font-mono flex items-center justify-center border border-amber-200">
                          2
                        </span>
                        <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          2-3 zile
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-sm text-neutral-900">
                          Hard
                        </div>
                        <div className="text-[11px] text-neutral-500 font-medium mt-0.5">
                          Efort cognitiv mare
                        </div>
                      </div>
                    </button>

                    {/* 3. GOOD */}
                    <button
                      onClick={() => handleRateCard('GOOD')}
                      className="p-4 rounded-xl bg-white hover:border-black border border-neutral-200 transition-colors text-left flex flex-col justify-between gap-2.5 cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="w-5 h-5 rounded bg-neutral-100 text-neutral-900 text-xs font-bold font-mono flex items-center justify-center border border-neutral-300">
                          3
                        </span>
                        <span className="text-[10px] font-mono font-bold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">
                          5-7 zile
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-sm text-neutral-900">
                          Good
                        </div>
                        <div className="text-[11px] text-neutral-500 font-medium mt-0.5">
                          Retinut corect
                        </div>
                      </div>
                    </button>

                    {/* 4. EASY */}
                    <button
                      onClick={() => handleRateCard('EASY')}
                      className="p-4 rounded-xl bg-white hover:bg-emerald-50/40 border border-neutral-200 hover:border-emerald-300 transition-colors text-left flex flex-col justify-between gap-2.5 cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold font-mono flex items-center justify-center border border-emerald-200">
                          4
                        </span>
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          14+ zile
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-sm text-neutral-900">
                          Easy
                        </div>
                        <div className="text-[11px] text-neutral-500 font-medium mt-0.5">
                          Complet stapanit
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      ) : (
        /* 4. CATALOG / CHEATSHEET VIEW */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-neutral-500 uppercase tracking-wider px-1">
            <span>Intrebari afisate: {visibleCatalogCards.length} din {filteredCards.length}</span>
            <span>Deck: {TECH_ANKI_CATEGORIES.find(c => c.id === selectedCategory)?.label || 'Toate'}</span>
          </div>

          <div className="space-y-3">
            {visibleCatalogCards.map((card, idx) => {
              const status = progress[card.id]?.status || 'new';
              return (
                <div 
                  key={card.id}
                  className="bg-white rounded-xl p-5 sm:p-6 border border-neutral-200 hover:border-black transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-neutral-400">#{idx + 1}</span>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700 flex items-center gap-1.5 border border-neutral-300">
                        {renderCategoryIcon(card.category, "w-3 h-3 text-neutral-600")}
                        {TECH_ANKI_CATEGORIES.find(c => c.id === card.category)?.label || card.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${getDifficultyBadgeStyle(card.difficulty)}`}>
                        {card.difficulty}
                      </span>
                    </div>

                    <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded self-start sm:self-auto border ${getStatusBadgeStyle(status)}`}>
                      {status === 'mastered' ? 'Stapanit' :
                       status === 'learning' ? 'In Invatare' :
                       status === 'review' ? 'De Revizuit' : 'Card Nou'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-neutral-900">
                      {normalizeCardText(card.title)}
                    </h3>
                    <p className="text-xs text-neutral-600 font-medium mt-0.5">
                      {normalizeCardText(card.question)}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
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
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-neutral-800 text-xs font-normal">
                      <span className="font-bold font-mono text-amber-900 uppercase tracking-wider text-[10px] mr-1">Capcana la Interviu: </span>
                      {normalizeCardText(card.interviewTrap)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {visibleCatalogLimit < filteredCards.length && (
            <div className="text-center pt-2">
              <button
                onClick={() => setVisibleCatalogLimit(prev => prev + 20)}
                className="px-6 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer"
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
