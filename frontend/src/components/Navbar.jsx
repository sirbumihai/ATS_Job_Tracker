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
  MessageSquare
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

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const renderNavList = () => (
    <div className="space-y-6">
      {NAV_SECTIONS.map((section, idx) => (
        <div key={idx} className="space-y-1.5">
          <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 select-none">
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
                      ? 'bg-indigo-50/90 text-slate-950 border border-indigo-200/90 ring-1 ring-indigo-500/20 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-lg shrink-0 transition-all ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-600 border border-slate-200/60 group-hover:border-indigo-200/80'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-xs truncate ${
                      isActive ? 'text-indigo-950 font-black' : 'text-slate-800 font-bold group-hover:text-slate-950'
                    }`}>
                      {item.label}
                    </span>
                  </div>

                  {isActive ? (
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  ) : item.badge ? (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 bg-slate-100 text-slate-600 border border-slate-200/80 group-hover:bg-indigo-50 group-hover:text-indigo-700">
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

  return (
    <>
      {/* ======================================================== */}
      {/* 1. DESKTOP VERTICAL SIDEBAR (Shown on lg: screens and up) */}
      {/* ======================================================== */}
      <aside className="hidden lg:flex w-64 xl:w-72 h-screen sticky top-0 bg-white border-r border-slate-200/90 flex-col justify-between shrink-0 z-30 select-none shadow-xs">
        
        {/* LOGO & BRAND HEADER */}
        <div className="p-5 border-b border-slate-100">
          <div 
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => handleSelectTab('landing')}
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs ring-1 ring-indigo-500/30 group-hover:bg-indigo-700 transition-all">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-black text-xl text-slate-950 flex items-center gap-1 tracking-tight leading-tight">
                JobFlow <span className="text-indigo-600">AI</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-indigo-600" />
                <span>Tracker & ATS Studio</span>
              </p>
            </div>
          </div>
        </div>

        {/* SCROLLABLE VERTICAL NAVIGATION */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {renderNavList()}
        </div>

        {/* BOTTOM SECTION: USER FOOTER */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 space-y-2.5">

          {/* USER PROFILE & LOGOUT */}
          {currentUser ? (
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {(currentUser.fullName || currentUser.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {currentUser.fullName || currentUser.email}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Online
                  </div>
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Deconectare din cont"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Conectare in Cont</span>
            </button>
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
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-black text-lg text-slate-950 flex items-center gap-1 tracking-tight leading-tight">
              JobFlow <span className="text-indigo-600">AI</span>
            </h1>
            <span className="text-[9px] font-bold text-slate-500 block -mt-0.5">
              ATS Studio
            </span>
          </div>
        </div>

        {/* Mobile Right Controls */}
        <div className="flex items-center gap-2">

          {currentUser ? (
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {(currentUser.fullName || currentUser.email || 'U').charAt(0).toUpperCase()}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white font-bold"
            >
              Login
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border bg-slate-100 border-slate-200 text-slate-900 cursor-pointer"
            aria-label="Meniu Navigare"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 3. MOBILE OFF-CANVAS SLIDE-OUT DRAWER                     */}
      {/* ======================================================== */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col z-50">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h2 className="font-black text-lg text-slate-950">
                  JobFlow <span className="text-indigo-600">AI</span>
                </h2>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-950 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Nav Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {renderNavList()}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/70 space-y-3">

              {currentUser && (
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Deconectare ({currentUser.fullName || currentUser.email})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
