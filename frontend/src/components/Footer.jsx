import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  MessageSquare, 
  Mail, 
  Github, 
  Check, 
  Copy, 
  ChevronRight, 
  ExternalLink,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export default function Footer({ onNavigateTab }) {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText('sarbumihai0@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <footer className="w-full border-t border-neutral-200/90 bg-neutral-50/50 text-neutral-900 transition-colors">
      
      {/* Main Multi-Column Centered Architectural Grid */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Column 1: Brand & Operational Status (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            <div 
              onClick={() => {
                if (onNavigateTab) onNavigateTab('landing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-3 cursor-pointer group inline-flex"
            >
              <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
                <Sparkles className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight text-black">JobFlow AI</span>
                <span className="text-xs text-neutral-400 font-mono ml-2">v2.4</span>
              </div>
            </div>

            <p className="text-sm text-neutral-600 leading-relaxed max-w-sm">
              Sistem inteligent complet pentru depasirea barierelor ATS, optimizarea CV-ului 
              si pregatire tehnica de inalta fidelitate pentru interviuri de software engineering.
            </p>

            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-neutral-200 bg-white text-xs text-neutral-700 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium">Toate modulele sunt 100% operationale</span>
            </div>
          </div>

          {/* Column 2: Module Platforma (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
              Platforma
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-600 font-medium">
              <li>
                <button 
                  onClick={() => onNavigateTab && onNavigateTab('tracker')}
                  className="hover:text-black transition-colors cursor-pointer text-left"
                >
                  Tracker Aplicatii
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateTab && onNavigateTab('cv_studio')}
                  className="hover:text-black transition-colors cursor-pointer text-left"
                >
                  Studio CV & ATS
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateTab && onNavigateTab('skill_roadmap')}
                  className="hover:text-black transition-colors cursor-pointer text-left"
                >
                  Skill Roadmaps
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateTab && onNavigateTab('linkedin_optimizer')}
                  className="hover:text-black transition-colors cursor-pointer text-left"
                >
                  LinkedIn Optimizer
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateTab && onNavigateTab('job_search')}
                  className="hover:text-black transition-colors cursor-pointer text-left"
                >
                  Cautare Job-uri Live
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Comunitate & Resurse (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
              Comunitate
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-600 font-medium">
              <li>
                <button 
                  onClick={() => onNavigateTab && onNavigateTab('feedback')}
                  className="hover:text-black transition-colors cursor-pointer text-left font-semibold text-neutral-900 flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Feedback & Idei</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab('feedback');
                  }}
                  className="hover:text-black transition-colors cursor-pointer text-left"
                >
                  Roadmap Comunitar
                </button>
              </li>
              <li>
                <a 
                  href="#intrebari"
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab('landing');
                  }}
                  className="hover:text-black transition-colors cursor-pointer block"
                >
                  Intrebari Frecvente
                </a>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateTab && onNavigateTab('skill_roadmap')}
                  className="hover:text-black transition-colors cursor-pointer text-left"
                >
                  Ghiduri Interviu
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Echipa (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
              Contact & Fondator
            </h4>
            
            <p className="text-xs text-neutral-600 leading-relaxed">
              Ai o propunere, o sugestie de functie noua sau doresti colaborare? Scrie direct:
            </p>

            <div className="p-3.5 rounded-xl border border-neutral-200 bg-white shadow-2xs space-y-2">
              <div className="flex items-center justify-between gap-2">
                <a 
                  href="mailto:sarbumihai0@gmail.com"
                  className="text-xs font-medium text-neutral-900 hover:text-black flex items-center gap-1.5 truncate"
                >
                  <Mail className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <span className="truncate">sarbumihai0@gmail.com</span>
                </a>
                <button
                  onClick={handleCopyEmail}
                  title="Copiaza adresa de email"
                  className="p-1 rounded hover:bg-neutral-100 text-neutral-500 hover:text-black transition cursor-pointer"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <div className="text-[11px] text-neutral-400 font-mono">
                {copied ? 'Copiat in clipboard!' : 'Raspuns in maximum 24h'}
              </div>
            </div>

            <div className="pt-1 flex items-center gap-3 text-xs text-neutral-500">
              <a 
                href="https://github.com/sirbumihai/ATS_Job_Tracker" 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-black transition flex items-center gap-1.5"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub Repository</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

          </div>

        </div>
      </div>

      {/* Centered Bottom Bar */}
      <div className="border-t border-neutral-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-medium">
          
          <div className="flex items-center gap-2">
            <span>© 2026 JobFlow AI. Construit de Mihai Sarbu.</span>
            <span className="hidden sm:inline text-neutral-300">•</span>
            <span className="hidden sm:inline">Toate drepturile rezervate.</span>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => onNavigateTab && onNavigateTab('feedback')}
              className="hover:text-black transition cursor-pointer"
            >
              Trimite Feedback
            </button>
            <a 
              href="mailto:sarbumihai0@gmail.com" 
              className="hover:text-black transition"
            >
              Suport Email
            </a>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-black transition cursor-pointer"
            >
              Inapoi Sus ↑
            </button>
          </div>

        </div>
      </div>

    </footer>
  );
}
