import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  LogOut, 
  Lock, 
  Upload, 
  Plus, 
  ShieldCheck, 
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
  ChevronRight,
  Sparkles,
  Zap,
  ExternalLink,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    title: 'PIPELINE & CAUTARE',
    items: [
      {
        id: 'tracker',
        label: 'Tracker Aplicatii',
        icon: FolderKanban
      },
      {
        id: 'job_search',
        label: 'Cautare Job-uri',
        icon: Search
      },
      {
        id: 'market_insights',
        label: 'Market Insights',
        icon: Compass
      }
    ]
  },
  {
    title: 'DOCUMENTE & ATS STUDIO',
    items: [
      {
        id: 'cv_library',
        label: 'CV-urile Mele',
        icon: Files
      },
      {
        id: 'cv_studio',
        label: 'Studio CV',
        icon: FileText
      },
      {
        id: 'cover_letter',
        label: 'Cover Letter AI',
        icon: FileSignature
      },
      {
        id: 'github_readme',
        label: 'GitHub README',
        icon: Github
      },
      {
        id: 'linkedin_optimizer',
        label: 'LinkedIn Optimizer',
        icon: Linkedin
      }
    ]
  },
  {
    title: 'PREGATIRE & RESURSE',
    items: [
      {
        id: 'skill_roadmap',
        label: 'Skill Roadmaps',
        icon: GraduationCap
      },
      {
        id: 'feedback',
        label: 'Feedback & Sugestii',
        icon: MessageSquare
      }
    ]
  }
];

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onLogout, 
  onOpenAuth, 
  onOpenUpload, 
  onOpenAddJob
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

  // Render expanded navigation list
  const renderNavListExpanded = () => (
    <div className="space-y-6">
      {NAV_SECTIONS.map((section, idx) => (
        <div key={idx} className="space-y-1.5">
          <div className="px-3 text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold select-none">
            {section.title}
          </div>
          <div className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer group ${
                    isActive 
                      ? 'bg-black text-white shadow-xs' 
                      : 'text-neutral-700 hover:text-black hover:bg-neutral-100/90 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 rounded-lg shrink-0 transition-all ${
                      isActive 
                        ? 'bg-neutral-800 text-white' 
                        : 'bg-neutral-100 text-neutral-700 group-hover:bg-neutral-200 group-hover:text-black'
                    }`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <span className={`text-[13px] sm:text-sm truncate ${
                      isActive ? 'text-white font-bold' : 'text-neutral-800 font-medium group-hover:text-black'
                    }`}>
                      {item.label}
                    </span>
                  </div>

                  {isActive ? (
                    <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
                  ) : item.badge ? (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 bg-neutral-100 text-neutral-600 border border-neutral-200">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  // Render compact collapsed icon rail
  const renderNavListCollapsed = () => (
    <div className="space-y-3 py-1 w-full">
      {NAV_SECTIONS.map((section, sIdx) => (
        <div key={sIdx} className="space-y-1.5 w-full">
          {sIdx > 0 && <div className="w-8 h-px bg-neutral-200 mx-auto my-2" />}
          {section.items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div key={item.id} className="flex justify-center w-full">
                <button
                  onClick={() => handleSelectTab(item.id)}
                  title={item.label}
                  className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-150 cursor-pointer ${
                    isActive 
                      ? 'bg-black text-white shadow-xs' 
                      : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
                  }`}
                  aria-label={item.label}
                >
                  <Icon className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* ======================================================== */}
      {/* 1. DESKTOP VERTICAL SIDEBAR (COLLAPSIBLE FOR SPACE SAVING) */}
      {/* ======================================================== */}
      <aside 
        className={`hidden lg:flex h-screen sticky top-0 bg-white border-r border-neutral-200/90 flex-col justify-between shrink-0 z-30 select-none shadow-2xs transition-all duration-200 overflow-x-hidden ${
          isCollapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        
        {/* LOGO & BRAND HEADER */}
        <div className={`border-b border-neutral-100 ${isCollapsed ? 'p-3 flex flex-col items-center gap-2' : 'p-4 flex items-center justify-between'}`}>
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleSelectTab('landing')}
            title="Mergi la pagina principala JobFlow AI"
          >
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-all shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-bold text-lg text-neutral-950 flex items-center gap-1 tracking-tight leading-tight">
                  JobFlow <span className="text-neutral-950">AI</span>
                </h1>
                <p className="text-[10px] text-neutral-400 font-mono flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-neutral-600" />
                  <span>Tracker & ATS Studio</span>
                </p>
              </div>
            )}
          </div>

          {/* TOGGLE COLLAPSE BUTTON */}
          <button
            onClick={toggleCollapsed}
            title={isCollapsed ? "Extinde meniul lateral" : "Restrange meniul lateral (Castiga spatiu pentru tabele si Kanban)"}
            className={`p-2 rounded-xl text-neutral-400 hover:text-black hover:bg-neutral-100 transition cursor-pointer ${
              isCollapsed ? 'mt-1' : ''
            }`}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4.5 h-4.5" />
            ) : (
              <PanelLeftClose className="w-4.5 h-4.5" />
            )}
          </button>
        </div>

        {/* SCROLLABLE VERTICAL NAVIGATION */}
        <div className={`flex-1 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden' : 'px-3.5'} py-3 space-y-4`}>
          {isCollapsed ? renderNavListCollapsed() : renderNavListExpanded()}
        </div>

        {/* BOTTOM SECTION: USER FOOTER */}
        <div className={`border-t border-neutral-100 bg-neutral-50/70 ${isCollapsed ? 'p-2.5 flex flex-col items-center gap-2' : 'p-3.5 space-y-2.5'}`}>

          {/* USER PROFILE & LOGOUT */}
          {currentUser ? (
            isCollapsed ? (
              <div className="flex flex-col items-center gap-2 w-full py-1">
                <div 
                  className="w-10 h-10 rounded-xl bg-black text-white font-bold text-xs flex items-center justify-center shadow-xs relative"
                  title={currentUser.fullName || currentUser.email}
                >
                  {(currentUser.fullName || currentUser.email || 'U').charAt(0).toUpperCase()}
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute -top-0.5 -right-0.5 animate-pulse"></span>
                </div>
                <button
                  onClick={onLogout}
                  title="Deconectare cont"
                  className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-neutral-200/60 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-neutral-200/90 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-black text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    {(currentUser.fullName || currentUser.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-neutral-900 truncate">
                      {currentUser.fullName || currentUser.email}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Online
                    </div>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Deconectare din cont"
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )
          ) : (
            isCollapsed ? (
              <button
                onClick={onOpenAuth}
                title="Conectare in cont"
                className="w-10 h-10 rounded-xl bg-black hover:bg-neutral-800 text-white flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
              >
                <Lock className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="w-full py-2.5 px-3 rounded-xl bg-black hover:bg-neutral-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer active:scale-95"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Conectare in Cont</span>
              </button>
            )
          )}

        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MOBILE TOP BAR (Shown on screens < lg)                 */}
      {/* ======================================================== */}
      <header className="lg:hidden border-b border-gray-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 text-gray-900 shadow-2xs h-15 px-4 flex items-center justify-between">
        
        {/* Mobile Brand */}
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSelectTab('landing')}
        >
          <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-neutral-950 flex items-center gap-1 tracking-tight leading-tight">
              JobFlow <span className="text-neutral-950">AI</span>
            </h1>
            <span className="text-[9px] font-mono text-neutral-400 block -mt-0.5">
              ATS Studio
            </span>
          </div>
        </div>

        {/* Mobile Right Controls */}
        <div className="flex items-center gap-2">

          {currentUser ? (
            <div className="w-7 h-7 rounded-lg bg-black text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {(currentUser.fullName || currentUser.email || 'U').charAt(0).toUpperCase()}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-black text-white font-semibold"
            >
              Login
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border bg-neutral-100 border-neutral-200 text-neutral-900 cursor-pointer"
            aria-label="Meniu Navigare"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 3. FULL-SCREEN ARCHITECTURAL MOBILE MENU OVERLAY          */}
      {/* ======================================================== */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[9999] bg-white flex flex-col justify-between p-6 sm:p-8 animate-in fade-in duration-200 select-none overflow-y-auto">
          {/* Top Bar: Minimalist Logo + Close Button */}
          <div className="flex items-center justify-between w-full shrink-0">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleSelectTab('landing')}
            >
              <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-bold text-lg text-black tracking-tight">JobFlow</span>
            </div>

            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 -mr-2 text-black hover:opacity-60 transition cursor-pointer"
              aria-label="Inchide meniul"
            >
              <X className="w-6 h-6 stroke-[2.2]" />
            </button>
          </div>

          {/* Center Links: Large Centered Typography (Matching Reference) */}
          <nav className="my-auto py-8 flex flex-col items-center justify-center space-y-5 sm:space-y-6 text-center">
            {NAV_SECTIONS.flatMap(s => s.items).map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`text-2xl sm:text-3xl font-medium tracking-tight transition cursor-pointer ${
                    isActive 
                      ? 'font-bold text-black border-b-2 border-black pb-0.5' 
                      : 'text-neutral-900 hover:text-neutral-500'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Bottom Bar: Subtle Footer Links & User Action */}
          <div className="pt-6 border-t border-neutral-100 flex items-center justify-between text-xs sm:text-sm text-neutral-400 font-medium shrink-0">
            <div className="flex items-center gap-5 sm:gap-6">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-black transition">GitHub</a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-black transition">LinkedIn</a>
              <button onClick={() => handleSelectTab('feedback')} className="hover:text-black transition cursor-pointer">Feedback</button>
            </div>
            {currentUser ? (
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="text-neutral-900 hover:text-rose-600 font-semibold transition cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Deconectare</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="text-black font-bold hover:underline transition cursor-pointer"
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
