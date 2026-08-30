import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Building2, 
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
  const isWhiteTheme = activeTab === 'cv_studio';

  return (
    <header className={
      isWhiteTheme 
        ? "border-b border-gray-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 text-gray-900 shadow-2xs transition-colors duration-200"
        : "border-b border-gray-800/80 bg-[#0f172a]/80 backdrop-blur-xl sticky top-0 z-40 text-white transition-colors duration-200"
    }>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer" onClick={() => setActiveTab('kanban')}>
          <div className={
            isWhiteTheme
              ? "p-2 sm:p-2.5 bg-black text-white rounded-xl sm:rounded-2xl shadow-sm"
              : "p-2 sm:p-2.5 bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-600 rounded-xl sm:rounded-2xl text-white shadow-lg shadow-purple-600/30"
          }>
            <BrainCircuit className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h1 className={
              isWhiteTheme
                ? "font-black text-base sm:text-xl text-gray-950 flex items-center gap-1.5 tracking-tight"
                : "font-black text-base sm:text-xl text-white flex items-center gap-1.5 tracking-tight"
            }>
              ATS AI {isWhiteTheme ? <span className="font-extrabold text-gray-700">Career Coach</span> : <span className="gradient-text">Career Coach</span>}
            </h1>
            <p className="hidden sm:flex text-[11px] text-gray-500 font-semibold items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Spring Boot 3.3 • React 18
            </p>
          </div>
        </div>

        {/* DESKTOP TABS NAVIGATION */}
        <div className={
          isWhiteTheme
            ? "hidden md:flex items-center gap-1.5 bg-gray-100 p-1.5 rounded-xl border border-gray-200"
            : "hidden md:flex items-center gap-1.5 bg-gray-900/90 p-1.5 rounded-2xl border border-gray-800 shadow-inner"
        }>
          <button
            onClick={() => setActiveTab('kanban')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
              activeTab === 'kanban' 
                ? (isWhiteTheme ? 'bg-black text-white shadow-sm' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25') 
                : (isWhiteTheme ? 'text-gray-600 hover:text-black hover:bg-gray-200/60' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50')
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Kanban
          </button>

          <button
            onClick={() => setActiveTab('cv_studio')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
              activeTab === 'cv_studio' 
                ? (isWhiteTheme ? 'bg-black text-white shadow-sm' : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/25') 
                : (isWhiteTheme ? 'text-gray-600 hover:text-black hover:bg-gray-200/60' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50')
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Studio CV & Match 100%
          </button>
        </div>

        {/* DESKTOP ACTIONS */}
        <div className="hidden lg:flex items-center gap-2.5">
          {currentUser ? (
            <div className={`flex items-center gap-2 pl-2 border-l ${isWhiteTheme ? 'border-gray-200' : 'border-gray-800'}`}>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
                isWhiteTheme ? 'bg-gray-100 border border-gray-200 text-gray-800' : 'bg-gray-900/90 border border-gray-800 text-white'
              }`}>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="max-w-[120px] truncate">{currentUser.fullName || currentUser.email}</span>
              </div>
              <button 
                onClick={onLogout}
                title="Deconectare"
                className={`p-2 rounded-xl transition border cursor-pointer ${
                  isWhiteTheme ? 'bg-gray-100 hover:bg-rose-50 text-gray-600 hover:text-rose-600 border-gray-200' : 'bg-gray-900 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 border-gray-800'
                }`}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenAuth}
              className={`text-xs flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                isWhiteTheme ? 'bg-black hover:bg-neutral-800 text-white shadow-sm' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Login
            </button>
          )}

          <button 
            onClick={onOpenUpload}
            className={`text-xs flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold border transition cursor-pointer ${
              isWhiteTheme ? 'bg-white hover:bg-gray-50 text-gray-900 border-gray-300 shadow-2xs' : 'bg-gray-900/80 hover:bg-gray-800 text-gray-200 border-gray-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-gray-600" />
            Upload CV
          </button>

          <button 
            onClick={onOpenAddJob}
            className={`text-xs flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              isWhiteTheme ? 'bg-black hover:bg-neutral-800 text-white shadow-sm' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-600/25'
            }`}
          >
            <Plus className="w-4 h-4" />
            Adaugă Job
          </button>
        </div>

        {/* MOBILE HAMBURGER BUTTON */}
        <div className="flex items-center gap-2 lg:hidden">
          <button 
            onClick={onOpenAddJob}
            className="p-2 rounded-xl bg-black text-white text-xs font-bold flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-xl border ${isWhiteTheme ? 'bg-gray-100 border-gray-200 text-gray-900' : 'bg-gray-900 border-gray-800 text-gray-300'}`}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className={`lg:hidden border-t p-4 space-y-3 ${isWhiteTheme ? 'border-gray-200 bg-white text-gray-900' : 'border-gray-800 bg-[#0f172a] text-white'}`}>
          <div className={`flex gap-1.5 p-1 rounded-xl border overflow-x-auto ${isWhiteTheme ? 'bg-gray-100 border-gray-200' : 'bg-gray-900 border-gray-800'}`}>
            <button
              onClick={() => { setActiveTab('kanban'); setMobileMenuOpen(false); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1 shrink-0 ${
                activeTab === 'kanban' 
                  ? (isWhiteTheme ? 'bg-black text-white' : 'bg-blue-600 text-white') 
                  : (isWhiteTheme ? 'text-gray-700' : 'text-gray-400')
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              onClick={() => { setActiveTab('cv_studio'); setMobileMenuOpen(false); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1 shrink-0 ${
                activeTab === 'cv_studio' 
                  ? (isWhiteTheme ? 'bg-black text-white' : 'bg-emerald-600 text-white') 
                  : (isWhiteTheme ? 'text-gray-700' : 'text-gray-400')
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Studio CV
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { onOpenUpload(); setMobileMenuOpen(false); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 ${
                isWhiteTheme ? 'bg-white border-gray-300 text-gray-800' : 'bg-gray-900 border-gray-800 text-gray-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload CV
            </button>
            <button
              onClick={() => { onOpenAddJob(); setMobileMenuOpen(false); }}
              className="flex-1 py-2 text-xs font-bold rounded-xl bg-black text-white flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Adaugă Job
            </button>
          </div>
        </div>
      )}

    </header>
  );
}
