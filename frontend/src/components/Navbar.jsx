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
  Files
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
  const isWhiteTheme = true;

  return (
    <header className="border-b border-gray-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 text-gray-900 shadow-2xs transition-colors duration-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <div className="flex items-center cursor-pointer select-none group" onClick={() => setActiveTab('tracker')}>
          <div>
            <h1 className="font-black text-lg sm:text-2xl text-gray-950 flex items-center gap-1.5 tracking-tight group-hover:text-black transition">
              JobFlow <span className="text-blue-600 font-black">AI</span>
            </h1>
            <p className="hidden sm:flex text-[11px] text-gray-500 font-semibold items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Tracker Aplicatii & ATS Studio
            </p>
          </div>
        </div>

        {/* DESKTOP TABS NAVIGATION (4 TABS) */}
        <div className="hidden md:flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setActiveTab('tracker')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
              activeTab === 'tracker' 
                ? 'bg-black text-white shadow-sm' 
                : 'text-gray-600 hover:text-black hover:bg-gray-200/60'
            }`}
          >
            <FolderKanban className={`w-3.5 h-3.5 ${activeTab === 'tracker' ? 'text-blue-400' : 'text-blue-600'}`} />
            Tracker Aplicatii
          </button>

          <button
            onClick={() => setActiveTab('job_search')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
              activeTab === 'job_search' 
                ? 'bg-black text-white shadow-sm' 
                : 'text-gray-600 hover:text-black hover:bg-gray-200/60'
            }`}
          >
            <Search className={`w-3.5 h-3.5 ${activeTab === 'job_search' ? 'text-amber-400' : 'text-amber-500'}`} />
            Cautare Job-uri
          </button>

          <button
            onClick={() => setActiveTab('cv_library')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
              activeTab === 'cv_library' 
                ? 'bg-black text-white shadow-sm' 
                : 'text-gray-600 hover:text-black hover:bg-gray-200/60'
            }`}
          >
            <Files className={`w-3.5 h-3.5 ${activeTab === 'cv_library' ? 'text-emerald-400' : 'text-emerald-600'}`} />
            CV-urile Mele
          </button>

          <button
            onClick={() => setActiveTab('cv_studio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
              activeTab === 'cv_studio' 
                ? 'bg-black text-white shadow-sm' 
                : 'text-gray-600 hover:text-black hover:bg-gray-200/60'
            }`}
          >
            <FileText className={`w-3.5 h-3.5 ${activeTab === 'cv_studio' ? 'text-purple-400' : 'text-purple-600'}`} />
            Studio CV
          </button>
        </div>

        {/* DESKTOP ACTIONS */}
        <div className="hidden lg:flex items-center gap-2.5">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 border border-gray-200 text-gray-800">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="max-w-[140px] truncate">{currentUser.fullName || currentUser.email}</span>
              </div>
              <button 
                onClick={onLogout}
                title="Deconectare"
                className="p-2 rounded-xl transition border cursor-pointer bg-gray-100 hover:bg-rose-50 text-gray-600 hover:text-rose-600 border-gray-200"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenAuth}
              className="text-xs flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer bg-black hover:bg-neutral-800 text-white shadow-sm"
            >
              <Lock className="w-3.5 h-3.5" />
              Login
            </button>
          )}
        </div>

        {/* MOBILE HAMBURGER BUTTON */}
        <div className="flex items-center gap-2 lg:hidden">
          {currentUser ? (
            <button 
              onClick={onLogout}
              title="Deconectare"
              className="p-2 rounded-xl transition border cursor-pointer bg-gray-100 text-gray-600 border-gray-200"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={onOpenAuth}
              className="text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold bg-black text-white shadow-sm"
            >
              <Lock className="w-3.5 h-3.5" />
              Login
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border bg-gray-100 border-gray-200 text-gray-900"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t p-4 space-y-3 border-gray-200 bg-white text-gray-900">
          <div className="flex gap-1.5 p-1 rounded-xl border overflow-x-auto bg-gray-100 border-gray-200">
            <button
              onClick={() => { setActiveTab('tracker'); setMobileMenuOpen(false); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shrink-0 ${
                activeTab === 'tracker' ? 'bg-black text-white' : 'text-gray-700'
              }`}
            >
              <FolderKanban className={`w-3.5 h-3.5 ${activeTab === 'tracker' ? 'text-blue-400' : 'text-blue-600'}`} />
              Tracker
            </button>
            <button
              onClick={() => { setActiveTab('job_search'); setMobileMenuOpen(false); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shrink-0 ${
                activeTab === 'job_search' ? 'bg-black text-white' : 'text-gray-700'
              }`}
            >
              <Search className={`w-3.5 h-3.5 ${activeTab === 'job_search' ? 'text-amber-400' : 'text-amber-500'}`} />
              Joburi
            </button>
            <button
              onClick={() => { setActiveTab('cv_library'); setMobileMenuOpen(false); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shrink-0 ${
                activeTab === 'cv_library' ? 'bg-black text-white' : 'text-gray-700'
              }`}
            >
              <Files className={`w-3.5 h-3.5 ${activeTab === 'cv_library' ? 'text-emerald-400' : 'text-emerald-600'}`} />
              CV-uri
            </button>
            <button
              onClick={() => { setActiveTab('cv_studio'); setMobileMenuOpen(false); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shrink-0 ${
                activeTab === 'cv_studio' ? 'bg-black text-white' : 'text-gray-700'
              }`}
            >
              <FileText className={`w-3.5 h-3.5 ${activeTab === 'cv_studio' ? 'text-purple-400' : 'text-purple-600'}`} />
              Studio CV
            </button>
          </div>
        </div>
      )}

    </header>
  );
}
