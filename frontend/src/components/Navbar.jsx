import React, { useState } from 'react';
import {
  LogOut,
  Lock,
  Menu,
  X,
  Search,
  FileText,
  FolderKanban,
  Files,
  FileSignature,
  Github,
  Compass,
  Linkedin,
  GraduationCap,
  Sparkles,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

// Ordinea si destinatiile tab-urilor sunt fixe; se schimba doar textul si stilul.
const NAV_SECTIONS = [
  {
    title: 'Pipeline',
    items: [
      { id: 'tracker', label: 'Tracker aplicații', icon: FolderKanban },
      { id: 'job_search', label: 'Căutare joburi', icon: Search },
      { id: 'market_insights', label: 'Market Insights', icon: Compass }
    ]
  },
  {
    title: 'Documente',
    items: [
      { id: 'cv_library', label: 'CV-urile mele', icon: Files },
      { id: 'cv_studio', label: 'Studio CV', icon: FileText },
      { id: 'cover_letter', label: 'Cover Letter', icon: FileSignature },
      { id: 'github_readme', label: 'GitHub README', icon: Github },
      { id: 'linkedin_optimizer', label: 'LinkedIn Optimizer', icon: Linkedin }
    ]
  },
  {
    title: 'Pregătire',
    items: [
      { id: 'skill_roadmap', label: 'Skill Roadmap', icon: GraduationCap },
      { id: 'feedback', label: 'Feedback', icon: MessageSquare }
    ]
  }
];

const ALL_ITEMS = NAV_SECTIONS.flatMap(s => s.items);

function initialOf(user) {
  return (user.fullName || user.email || 'U').charAt(0).toUpperCase();
}

function BrandMark({ size = 'w-9 h-9' }) {
  return (
    <span className={`${size} rounded-xl bg-brand-500 text-white flex items-center justify-center shrink-0`}>
      <Sparkles className="w-4 h-4" />
    </span>
  );
}

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onOpenAuth
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('jobflow_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('jobflow_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const itemClass = (isActive) => isActive
    ? 'bg-brand-50 text-brand-700'
    : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100';

  return (
    <>
      {/* 1. MENIU LATERAL DESKTOP (RESTRANGIBIL) */}
      <aside
        className={`hidden lg:flex h-screen sticky top-0 bg-white border-r border-neutral-200 flex-col justify-between shrink-0 z-30 select-none transition-all duration-200 overflow-x-hidden ${
          isCollapsed ? 'w-[72px]' : 'w-60'
        }`}
      >
        <div className={`border-b border-neutral-100 ${isCollapsed ? 'p-3 flex flex-col items-center gap-2' : 'px-4 py-4 flex items-center justify-between'}`}>
          <button
            type="button"
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => handleSelectTab('landing')}
            aria-label="JobFlow AI, pagina principală"
          >
            <BrandMark />
            {!isCollapsed && (
              <span className="font-serif text-lg font-medium text-neutral-950 tracking-tight">
                JobFlow <span className="text-brand-500">AI</span>
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? 'Extinde meniul' : 'Restrânge meniul'}
            title={isCollapsed ? 'Extinde meniul' : 'Restrânge meniul'}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-950 hover:bg-neutral-100 transition cursor-pointer"
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        <nav
          aria-label="Meniu principal"
          className={`flex-1 overflow-y-auto overflow-x-hidden py-4 ${isCollapsed ? 'px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden' : 'px-3'}`}
        >
          {NAV_SECTIONS.map((section, sIdx) => (
            <div key={section.title} className={sIdx > 0 ? 'mt-5' : ''}>
              {isCollapsed
                ? sIdx > 0 && <div className="w-8 h-px bg-neutral-200 mx-auto mb-3" />
                : (
                  <div className="px-3 mb-1.5 text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                    {section.title}
                  </div>
                )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectTab(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      aria-label={isCollapsed ? item.label : undefined}
                      title={isCollapsed ? item.label : undefined}
                      className={`flex items-center rounded-lg transition-colors cursor-pointer ${itemClass(isActive)} ${
                        isCollapsed ? 'w-11 h-11 mx-auto justify-center' : 'w-full gap-3 px-3 py-2 text-sm font-medium text-left'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-500' : ''}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className={`border-t border-neutral-100 ${isCollapsed ? 'p-2.5 flex flex-col items-center gap-2' : 'p-3'}`}>
          {currentUser ? (
            <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2' : 'justify-between gap-2'}`}>
              <div className="flex items-center gap-2.5 min-w-0" title={currentUser.fullName || currentUser.email}>
                <span className="w-8 h-8 rounded-lg bg-neutral-900 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                  {initialOf(currentUser)}
                </span>
                {!isCollapsed && (
                  <span className="text-sm font-medium text-neutral-900 truncate">
                    {currentUser.fullName || currentUser.email}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onLogout}
                aria-label="Deconectare"
                title="Deconectare"
                className="p-2 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              aria-label="Conectare"
              title="Conectare"
              className={`rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                isCollapsed ? 'w-10 h-10' : 'w-full py-2.5'
              }`}
            >
              <Lock className="w-4 h-4" />
              {!isCollapsed && <span>Conectare</span>}
            </button>
          )}
        </div>
      </aside>

      {/* 2. BARA DE SUS PE MOBIL (< lg) */}
      <header className="lg:hidden border-b border-neutral-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 h-14 px-4 flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSelectTab('landing')}
          aria-label="JobFlow AI, pagina principală"
        >
          <BrandMark size="w-8 h-8" />
          <span className="font-serif text-lg font-medium text-neutral-950 tracking-tight">
            JobFlow <span className="text-brand-500">AI</span>
          </span>
        </button>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <span className="w-8 h-8 rounded-lg bg-neutral-900 text-white font-semibold text-xs flex items-center justify-center">
              {initialOf(currentUser)}
            </span>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="text-xs px-3 py-1.5 rounded-lg bg-brand-500 text-white font-semibold cursor-pointer"
            >
              Conectare
            </button>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border border-neutral-200 text-neutral-900 cursor-pointer"
            aria-label={mobileMenuOpen ? 'Închide meniul' : 'Deschide meniul'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* 3. MENIU MOBIL PE TOT ECRANUL */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[9999] bg-white flex flex-col p-5 select-none overflow-y-auto">
          <div className="flex items-center justify-between shrink-0">
            <button
              type="button"
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleSelectTab('landing')}
              aria-label="JobFlow AI, pagina principală"
            >
              <BrandMark size="w-8 h-8" />
              <span className="font-serif text-lg font-medium text-neutral-950">JobFlow</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 -mr-2 text-neutral-950 cursor-pointer"
              aria-label="Închide meniul"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav aria-label="Meniu mobil" className="my-auto py-8 space-y-1">
            {ALL_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-serif text-xl text-left transition-colors cursor-pointer ${itemClass(isActive)}`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-brand-500' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end text-sm shrink-0">
            {currentUser ? (
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="text-neutral-900 hover:text-rose-600 font-semibold transition cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Deconectare</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="text-brand-600 font-semibold hover:underline transition cursor-pointer"
              >
                Conectare
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
