import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Building2, 
  Bot, 
  User, 
  LogOut, 
  Lock, 
  Upload, 
  Plus,
  ShieldCheck,
  Menu,
  X,
  FileText
} from 'lucide-react';

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

  return (
    <header className="border-b border-gray-800/80 bg-[#0f172a]/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="p-2 sm:p-2.5 bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-600 rounded-xl sm:rounded-2xl text-white shadow-lg shadow-purple-600/30">
            <BrainCircuit className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-black text-base sm:text-xl text-white flex items-center gap-1.5 tracking-tight">
              ATS AI <span className="gradient-text">Career Coach</span>
            </h1>
            <p className="hidden sm:flex text-[11px] text-gray-400 font-semibold items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Spring Boot 3.3 • React 18
            </p>
          </div>
        </div>

        {/* DESKTOP TABS NAVIGATION (3 TABS) */}
        <div className="hidden md:flex items-center gap-1.5 bg-gray-900/90 p-1.5 rounded-2xl border border-gray-800 shadow-inner">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-300 ${
              activeTab === 'kanban' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25 scale-[1.02]' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Kanban
          </button>

          <button
            onClick={() => setActiveTab('agent_studio')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-300 ${
              activeTab === 'agent_studio' 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/25 scale-[1.02]' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-amber-300" />
            AI Agents
          </button>

          <button
            onClick={() => setActiveTab('cv_studio')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-300 ${
              activeTab === 'cv_studio' 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/25 scale-[1.02]' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            Studio CV & Match 100%
          </button>
        </div>

        {/* DESKTOP ACTIONS */}
        <div className="hidden lg:flex items-center gap-2.5">
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-800">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/90 rounded-xl border border-gray-800 text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="font-bold text-white max-w-[120px] truncate">{currentUser.fullName || currentUser.email}</span>
              </div>
              <button 
                onClick={onLogout}
                title="Deconectare"
                className="p-2 rounded-xl bg-gray-900 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition border border-gray-800"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenAuth}
              className="text-xs flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold transition shadow-lg shadow-blue-600/25"
            >
              <Lock className="w-3.5 h-3.5" />
              Login
            </button>
          )}

          <button 
            onClick={onOpenUpload}
            className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900/80 hover:bg-gray-800 text-gray-200 transition border border-gray-800 font-semibold"
          >
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            Upload CV
          </button>

          <button 
            onClick={onOpenAddJob}
            className="text-xs flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold shadow-lg shadow-purple-600/25 transition"
          >
            <Plus className="w-4 h-4" />
            Adaugă Job
          </button>
        </div>

        {/* MOBILE HAMBURGER BUTTON */}
        <div className="flex items-center gap-2 lg:hidden">
          <button 
            onClick={onOpenAddJob}
            className="p-2 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-800 bg-[#0f172a] p-4 space-y-3">
          <div className="flex gap-1.5 p-1 bg-gray-900 rounded-xl border border-gray-800 overflow-x-auto">
            <button
              onClick={() => { setActiveTab('kanban'); setMobileMenuOpen(false); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1 shrink-0 ${
                activeTab === 'kanban' ? 'bg-blue-600 text-white' : 'text-gray-400'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              onClick={() => { setActiveTab('agent_studio'); setMobileMenuOpen(false); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1 shrink-0 ${
                activeTab === 'agent_studio' ? 'bg-purple-600 text-white' : 'text-gray-400'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              AI Studio
            </button>
            <button
              onClick={() => { setActiveTab('cv_studio'); setMobileMenuOpen(false); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1 shrink-0 ${
                activeTab === 'cv_studio' ? 'bg-emerald-600 text-white' : 'text-gray-400'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Studio CV
            </button>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-gray-800/80">
            {currentUser ? (
              <div className="flex items-center justify-between p-2 bg-gray-900 rounded-xl text-xs">
                <span className="font-bold text-white">{currentUser.fullName || currentUser.email}</span>
                <button onClick={onLogout} className="text-rose-400 font-semibold">Logout</button>
              </div>
            ) : (
              <button onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }} className="w-full py-2 bg-blue-600 text-white font-bold rounded-xl text-xs">
                Autentificare / Login
              </button>
            )}

            <button onClick={() => { onOpenUpload(); setMobileMenuOpen(false); }} className="w-full py-2 bg-gray-800 text-gray-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2">
              <Upload className="w-4 h-4 text-purple-400" />
              Upload PDF CV
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
