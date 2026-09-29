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
  Bell,
  Trophy,
  ChevronRight,
  Sparkles,
  Zap,
  ExternalLink
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    title: 'PIPELINE & CAUTARE',
    items: [
      {
        id: 'tracker',
        label: 'Tracker Aplicatii',
        subtitle: 'Kanban & Pipeline',
        icon: FolderKanban,
        color: 'text-blue-600',
        activeColor: 'text-blue-400',
        activeBg: 'bg-blue-600/10'
      },
      {
        id: 'job_search',
        label: 'Cautare Job-uri',
        subtitle: 'Agregator Piata IT',
        icon: Search,
        color: 'text-amber-500',
        activeColor: 'text-amber-400',
        activeBg: 'bg-amber-500/10'
      },
      {
        id: 'market_insights',
        label: 'Market Insights',
        subtitle: 'Cerinte & Skill Match',
        icon: Compass,
        color: 'text-cyan-600',
        activeColor: 'text-cyan-400',
        activeBg: 'bg-cyan-600/10'
      }
    ]
  },
  {
    title: 'DOCUMENTE & ATS STUDIO',
    items: [
      {
        id: 'cv_library',
        label: 'CV-urile Mele',
        subtitle: 'Baza de date Profiluri',
        icon: Files,
        color: 'text-emerald-600',
        activeColor: 'text-emerald-400',
        activeBg: 'bg-emerald-600/10'
      },
      {
        id: 'cv_studio',
        label: 'Studio CV',
        subtitle: 'Match 100% & PDF',
        icon: FileText,
        color: 'text-purple-600',
        activeColor: 'text-purple-400',
        activeBg: 'bg-purple-600/10',
        badge: '100%'
      },
      {
        id: 'cover_letter',
        label: 'Cover Letter AI',
        subtitle: 'Scrisoare de Intentie',
        icon: FileSignature,
        color: 'text-indigo-600',
        activeColor: 'text-indigo-400',
        activeBg: 'bg-indigo-600/10'
      },
      {
        id: 'github_readme',
        label: 'GitHub README',
        subtitle: 'Profil Developer Curat',
        icon: Github,
        color: 'text-gray-900',
        activeColor: 'text-emerald-400',
        activeBg: 'bg-gray-800/10'
      },
      {
        id: 'linkedin_optimizer',
        label: 'LinkedIn Optimizer',
        subtitle: 'Audit & Desktop Preview',
        icon: Linkedin,
        color: 'text-[#0a66c2]',
        activeColor: 'text-sky-400',
        activeBg: 'bg-blue-600/10',
        badge: 'ALL-STAR'
      }
    ]
  },
  {
    title: 'CRESTERE & CARIERA',
    items: [
      {
        id: 'skill_roadmap',
        label: 'Skill Roadmaps',
        subtitle: 'Planuri Practice 7 Zile',
        icon: GraduationCap,
        color: 'text-rose-600',
        activeColor: 'text-rose-400',
        activeBg: 'bg-rose-600/10',
        badge: 'LABS'
      },
      {
        id: 'career_analytics',
        label: 'Cariera & XP Funnel',
        subtitle: 'Palnie Conversie & Quests',
        icon: Trophy,
        color: 'text-amber-500',
        activeColor: 'text-amber-400',
        activeBg: 'bg-amber-500/10',
        badge: 'XP'
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
  onOpenAddJob,
  onOpenDigestModal
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
          <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-600 select-none">
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
                      ? 'bg-gray-950 text-white shadow-sm' 
                      : 'text-gray-700 hover:text-black hover:bg-gray-100/90'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                      isActive 
                        ? 'bg-white/10 text-white' 
                        : 'bg-gray-100 text-gray-700 group-hover:bg-white group-hover:text-black group-hover:shadow-2xs'
                    }`}>
                      <Icon className={`w-4 h-4 ${isActive ? item.activeColor : item.color}`} />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs truncate font-bold ${
                        isActive ? 'text-white' : 'text-gray-900 group-hover:text-black'
                      }`}>
                        {item.label}
                      </div>
                      <div className={`text-[10px] truncate ${
                        isActive ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-50 text-blue-700 border border-blue-200/80 group-hover:bg-blue-100'
                    }`}>
                      {item.badge}
                    </span>
                  )}
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
      <aside className="hidden lg:flex w-64 xl:w-72 h-screen sticky top-0 bg-white border-r border-gray-200/90 flex-col justify-between shrink-0 z-30 select-none shadow-xs">
        
        {/* LOGO & BRAND HEADER */}
        <div className="p-5 border-b border-gray-100">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => handleSelectTab('tracker')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-black text-xl text-gray-950 flex items-center gap-1 tracking-tight">
                JobFlow <span className="text-blue-600">AI</span>
              </h1>
              <p className="text-[10px] text-gray-500 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Tracker & ATS Studio
              </p>
            </div>
          </div>
        </div>

        {/* SCROLLABLE VERTICAL NAVIGATION */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {renderNavList()}
        </div>

        {/* BOTTOM SECTION: DAILY DIGEST + USER FOOTER */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/70 space-y-2.5">
          
          {/* DAILY DIGEST BUTTON */}
          {onOpenDigestModal && (
            <button
              onClick={onOpenDigestModal}
              title="Configureaza si testeaza Daily Job Digest (09:00 AM)"
              className="w-full p-2.5 rounded-xl border border-amber-200/90 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-950 flex items-center justify-between transition cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center gap-2.5">
                <div className="relative p-1.5 rounded-lg bg-amber-200/80 text-amber-900 group-hover:scale-105 transition-transform">
                  <Bell className="w-4 h-4 text-amber-800" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500"></span>
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    Daily Job Digest
                    <span className="text-[9px] bg-amber-200 text-amber-900 font-black px-1.5 py-0.2 rounded-full">09:00</span>
                  </div>
                  <div className="text-[10px] text-amber-700 font-medium">Alerte automate zilnice</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {/* USER PROFILE & LOGOUT */}
          {currentUser ? (
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-gray-200/90 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {(currentUser.fullName || currentUser.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-gray-900 truncate">
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
                className="p-1.5 rounded-lg text-gray-600 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="w-full py-2.5 px-3 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
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
          onClick={() => handleSelectTab('tracker')}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-black text-lg text-gray-950 flex items-center gap-1 tracking-tight leading-tight">
              JobFlow <span className="text-blue-600">AI</span>
            </h1>
            <span className="text-[9px] font-bold text-gray-500 block -mt-0.5">
              ATS Studio
            </span>
          </div>
        </div>

        {/* Mobile Right Controls */}
        <div className="flex items-center gap-2">
          {onOpenDigestModal && (
            <button
              onClick={onOpenDigestModal}
              title="Daily Job Digest"
              className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
            </button>
          )}

          {currentUser ? (
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {(currentUser.fullName || currentUser.email || 'U').charAt(0).toUpperCase()}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-black text-white font-bold"
            >
              Login
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border bg-gray-100 border-gray-200 text-gray-900 cursor-pointer"
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
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col z-50">
            {/* Drawer Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h2 className="font-black text-lg text-gray-950">
                  JobFlow <span className="text-blue-600">AI</span>
                </h2>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 cursor-pointer"
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
              {onOpenDigestModal && (
                <button
                  onClick={() => {
                    onOpenDigestModal();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-xs font-bold flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-700" />
                    <span>Daily Job Digest (09:00 AM)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-600" />
                </button>
              )}

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
