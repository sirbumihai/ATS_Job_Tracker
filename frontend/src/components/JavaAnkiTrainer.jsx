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
        <code key={pIdx} className="font-mono text-[11px] font-semibold text-indigo-700 bg-indigo-50/90 px-1.5 py-0.5 rounded-md border border-indigo-200/60 shadow-2xs">
          {part.slice(1, -1)}
        </code>
      );
    }
    const subParts = part.split(/(\b(?:this|super|new|void|int|String|boolean|class|SELECT|FROM|WHERE|JOIN|INDEX)\b(?:\([^)]*\))?|[a-zA-Z0-9_$]+\([^)]*\))/g);
    return subParts.map((sub, sIdx) => {
      if (/^(\b(?:this|super|new|void|int|String|boolean|class|SELECT|FROM|WHERE|JOIN|INDEX)\b(?:\([^)]*\))?|[a-zA-Z0-9_$]+\([^)]*\))$/.test(sub)) {
        return (
          <code key={`${pIdx}-${sIdx}`} className="font-mono text-[11px] font-semibold text-indigo-700 bg-indigo-50/90 px-1.5 py-0.5 rounded-md border border-indigo-200/60 shadow-2xs">
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
    <div className="space-y-2 text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
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
              <span className="w-5 h-5 rounded-lg bg-indigo-50 text-indigo-700 font-bold font-mono text-[10px] flex items-center justify-center shrink-0 border border-indigo-200/70 mt-0.5 shadow-2xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                {num}
              </span>
              <div className="flex-1 text-slate-700 leading-relaxed font-sans">
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
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
              <div className="flex-1 text-slate-700 leading-relaxed font-sans">
                {renderInlineFormatted(content)}
              </div>
            </div>
          );
        }

        // 3. Section Heading: e.g. ends with ":" and is relatively short (<= 65 chars)
        if (trimmed.endsWith(':') && trimmed.length <= 65 && !trimmed.startsWith('http')) {
          return (
            <div key={idx} className="pt-2 pb-1 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>{trimmed}</span>
            </div>
          );
        }

        // 4. Regular paragraph
        return (
          <p key={idx} className="text-slate-700 leading-relaxed font-sans">
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
            return <span key={i} className="text-indigo-600 font-bold">{tok.text}</span>;
          }
          if (tok.type === 'string') {
            return <span key={i} className="text-emerald-600 font-medium">{tok.text}</span>;
          }
          if (tok.type === 'annotation') {
            return <span key={i} className="text-purple-600 font-semibold">{tok.text}</span>;
          }
          if (tok.type === 'number') {
            return <span key={i} className="text-amber-600 font-mono font-medium">{tok.text}</span>;
          }
          if (tok.type === 'function') {
            return <span key={i} className="text-blue-700 font-medium">{tok.text}</span>;
          }
          return <span key={i} className="text-slate-800">{tok.text}</span>;
        })}
        {commentPart && (
          <span className="text-slate-400 italic font-mono">{commentPart}</span>
        )}
      </>
    );
  };

  return (
    <div className="rounded-2xl overflow-hidden bg-slate-50/90 border border-slate-200/90 text-xs font-mono shadow-2xs">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100/90 border-b border-slate-200/80 text-[11px] text-slate-600">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          </div>
          <div className="h-3 w-px bg-slate-300 mx-1" />
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-indigo-600" />
            <span>Solutie / Cod / Configurare</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            ({codeLines.length} linii)
          </span>
        </div>
        <button
          onClick={() => onCopy(cleanCode, cardId)}
          className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-slate-200/90 hover:border-indigo-200 px-2.5 py-1 rounded-lg transition shadow-2xs cursor-pointer active:scale-95"
          title="Copiaza codul in clipboard"
        >
          {copiedCodeId === cardId ? (
            <>
              <Check className="w-3 h-3 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Copiat in clipboard</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-slate-500" />
              <span>Copiaza cod</span>
            </>
          )}
        </button>
      </div>

      <div className="p-3 sm:p-4 overflow-x-auto text-[12px] leading-relaxed font-mono bg-[#f8fafc] border-t-0 selection:bg-indigo-100 selection:text-indigo-900">
        <table className="w-full border-collapse">
          <tbody>
            {codeLines.map((line, idx) => (
              <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                <td className="w-8 select-none text-right pr-3.5 text-[11px] text-slate-400/80 font-mono align-top py-0.5 border-r border-slate-200/60">
                  {idx + 1}
                </td>
                <td className="pl-3.5 py-0.5 whitespace-pre font-mono text-slate-900 align-top">
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
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      case 'MEDIU':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'USOR':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'mastered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'learning':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'review':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200/80';
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
            className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
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
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-600">Card {currentCardIndex + 1} din {filteredCards.length}</span>
                <span className="text-slate-300">•</span>
                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-2xs ${getStatusBadgeStyle(cardStatus)}`}>
                  {cardStatus === 'mastered' ? 'Stapanit' :
                   cardStatus === 'learning' ? 'In Invatare' :
                   cardStatus === 'review' ? 'De Revizuit' : 'Card Nou'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-36 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/80 shadow-2xs">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.round(((currentCardIndex + 1) / filteredCards.length) * 100)}%` }}
                />
              </div>
            </div>

            {/* THE INTERACTIVE CARD */}
            <div 
              onClick={() => setIsFlipped(prev => !prev)}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs cursor-pointer hover:border-slate-300 hover:shadow-xs transition-all duration-200 select-none min-h-[400px] flex flex-col justify-between relative group overflow-hidden"
            >
              {/* TOP ACCENT LINE IN INDIGO */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-500" />

              {/* Card Meta Badges */}
              <div className="flex items-center justify-between gap-3 mb-5 pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200/80 flex items-center gap-1.5 shadow-2xs">
                    {renderCategoryIcon(currentCard.category, "w-3 h-3 text-indigo-600")}
                    <span>{TECH_ANKI_CATEGORIES.find(c => c.id === currentCard.category)?.label || currentCard.category}</span>
                  </span>

                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-2xs ${getDifficultyBadgeStyle(currentCard.difficulty)}`}>
                    {currentCard.difficulty}
                  </span>
                </div>

                <div className="text-[11px] font-bold text-slate-600 group-hover:text-indigo-600 flex items-center gap-1.5 transition">
                  <RotateCw className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-600 transition" />
                  <span className="hidden sm:inline">{isFlipped ? 'Apasa pentru intrebare' : 'Apasa pentru raspuns'}</span>
                  <kbd className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-200/80 shadow-2xs">SPACE</kbd>
                </div>
              </div>

              {/* CARD CONTENT: FRONT vs BACK */}
              <div className="flex-1 flex flex-col justify-center py-2">
                {!isFlipped ? (
                  /* FRONT OF CARD (QUESTION) */
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-[11px] font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Intrebare de Interviu Tehnic:</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-snug">
                      {normalizeCardText(currentCard.title)}
                    </h2>
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 text-sm sm:text-base text-slate-700 leading-relaxed font-normal shadow-2xs">
                      {normalizeCardText(currentCard.question)}
                    </div>

                    <div className="pt-4">
                      <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all duration-150 shadow-2xs group-hover:shadow-xs active:scale-95">
                        <span>Vezi raspunsul canonic & explicatia</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* BACK OF CARD (ANSWER & CODE) */
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-black uppercase tracking-wider shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Raspuns Canonic Senior:</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 truncate max-w-[280px] sm:max-w-md hidden sm:inline">
                        {normalizeCardText(currentCard.title)}
                      </span>
                    </div>

                    {/* Formatted Answer with Section Parsing and Badges */}
                    <div className="p-4.5 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-2xs">
                      <FormattedAnswer text={currentCard.answer} />
                    </div>

                    {/* Syntax-Highlighted Light Developer Code Snippet Box */}
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
                        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 shadow-2xs flex flex-col justify-between">
                          <div>
                            <div className="font-black text-xs uppercase tracking-wider flex items-center gap-2 text-amber-900 mb-1.5">
                              <div className="p-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-200/80 shrink-0">
                                <ShieldAlert className="w-3.5 h-3.5" />
                              </div>
                              <span>Capcana la Interviu</span>
                            </div>
                            <p className="text-xs leading-relaxed text-slate-700 font-normal">
                              {normalizeCardText(currentCard.interviewTrap)}
                            </p>
                          </div>
                        </div>
                      )}

                      {currentCard.keyTakeaway && (
                        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 shadow-2xs flex flex-col justify-between">
                          <div>
                            <div className="font-black text-xs uppercase tracking-wider flex items-center gap-2 text-indigo-950 mb-1.5">
                              <div className="p-1 rounded-lg bg-indigo-100 text-indigo-700 border border-indigo-200/80 shrink-0">
                                <Zap className="w-3.5 h-3.5" />
                              </div>
                              <span>Concluzie Cheie</span>
                            </div>
                            <p className="text-xs leading-relaxed text-slate-700 font-normal">
                              {normalizeCardText(currentCard.keyTakeaway)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Shortcuts Bar */}
              <div className="pt-4 border-t border-slate-100/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-semibold">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Comenzi Rapide:</span>
                  <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg text-[10px] font-mono border border-slate-200/80 shadow-2xs">
                    <kbd className="font-bold">SPACE</kbd>
                    <span className="text-slate-500 font-sans font-medium">{isFlipped ? 'intrebare' : 'raspuns'}</span>
                  </span>
                  {isFlipped ? (
                    <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg text-[10px] font-mono border border-slate-200/80 shadow-2xs">
                      <kbd className="font-bold">1 - 4</kbd>
                      <span className="text-slate-500 font-sans font-medium">auto-evaluare</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg text-[10px] font-mono border border-slate-200/80 shadow-2xs">
                      <kbd className="font-bold">&larr; &rarr;</kbd>
                      <span className="text-slate-500 font-sans font-medium">navigare</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFlipped(false);
                      setCurrentCardIndex(prev => (prev - 1 + filteredCards.length) % filteredCards.length);
                    }}
                    className="p-1.5 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 rounded-xl transition cursor-pointer shadow-2xs active:scale-95"
                    title="Cardul anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-mono font-bold text-slate-500 px-1">
                    {currentCardIndex + 1} / {filteredCards.length}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFlipped(false);
                      setCurrentCardIndex(prev => (prev + 1) % filteredCards.length);
                    }}
                    className="p-1.5 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 rounded-xl transition cursor-pointer shadow-2xs active:scale-95"
                    title="Cardul urmator"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* ANKI RATING BUTTONS (Shown when card is flipped) */}
            {isFlipped && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs animate-in slide-in-from-bottom-2 duration-150 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Evalueaza Retentia Mentala (Repetitie Spatiata)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                    <span>Taste rapide:</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-bold">1</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-bold">2</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-bold">3</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-bold">4</kbd>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* 1. AGAIN */}
                  <button
                    onClick={() => handleRateCard('AGAIN')}
                    className="group p-4 rounded-2xl bg-white hover:bg-rose-50/50 border border-slate-200/90 hover:border-rose-300 transition-all duration-200 text-left flex flex-col justify-between gap-2.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="w-5 h-5 rounded-lg bg-rose-100 text-rose-700 text-xs font-black flex items-center justify-center border border-rose-200/70 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                        1
                      </span>
                      <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                        &lt; 1 zi
                      </span>
                    </div>
                    <div>
                      <div className="font-black text-sm text-slate-900 group-hover:text-rose-950">
                        Again
                      </div>
                      <div className="text-[11px] text-slate-500 group-hover:text-rose-700/80 font-medium mt-0.5">
                        Repeta astazi
                      </div>
                    </div>
                  </button>

                  {/* 2. HARD */}
                  <button
                    onClick={() => handleRateCard('HARD')}
                    className="group p-4 rounded-2xl bg-white hover:bg-amber-50/50 border border-slate-200/90 hover:border-amber-300 transition-all duration-200 text-left flex flex-col justify-between gap-2.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="w-5 h-5 rounded-lg bg-amber-100 text-amber-700 text-xs font-black flex items-center justify-center border border-amber-200/70 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        2
                      </span>
                      <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                        2-3 zile
                      </span>
                    </div>
                    <div>
                      <div className="font-black text-sm text-slate-900 group-hover:text-amber-950">
                        Hard
                      </div>
                      <div className="text-[11px] text-slate-500 group-hover:text-amber-700/80 font-medium mt-0.5">
                        Efort cognitiv mare
                      </div>
                    </div>
                  </button>

                  {/* 3. GOOD */}
                  <button
                    onClick={() => handleRateCard('GOOD')}
                    className="group p-4 rounded-2xl bg-white hover:bg-indigo-50/60 border border-slate-200/90 hover:border-indigo-300 transition-all duration-200 text-left flex flex-col justify-between gap-2.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 hover:-translate-y-0.5 ring-1 ring-transparent hover:ring-indigo-500/20"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="w-5 h-5 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center border border-indigo-200/70 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        3
                      </span>
                      <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
                        5-7 zile
                      </span>
                    </div>
                    <div>
                      <div className="font-black text-sm text-slate-900 group-hover:text-indigo-950">
                        Good
                      </div>
                      <div className="text-[11px] text-slate-500 group-hover:text-indigo-700/80 font-medium mt-0.5">
                        Retinut corect
                      </div>
                    </div>
                  </button>

                  {/* 4. EASY */}
                  <button
                    onClick={() => handleRateCard('EASY')}
                    className="group p-4 rounded-2xl bg-white hover:bg-emerald-50/50 border border-slate-200/90 hover:border-emerald-300 transition-all duration-200 text-left flex flex-col justify-between gap-2.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center border border-emerald-200/70 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        4
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        14+ zile
                      </span>
                    </div>
                    <div>
                      <div className="font-black text-sm text-slate-900 group-hover:text-emerald-950">
                        Easy
                      </div>
                      <div className="text-[11px] text-slate-500 group-hover:text-emerald-700/80 font-medium mt-0.5">
                        Complet stapanit
                      </div>
                    </div>
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
                      {normalizeCardText(card.title)}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      {normalizeCardText(card.question)}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-2xs">
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
                    <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80 text-slate-800 text-xs font-normal">
                      <span className="font-black text-amber-900 uppercase tracking-wider text-[10px] mr-1">Capcana la Interviu: </span>
                      {normalizeCardText(card.interviewTrap)}
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
