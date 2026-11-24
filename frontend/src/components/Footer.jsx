import React, { useState } from 'react';
import {
  MessageSquare,
  Mail,
  Github,
  Check,
  Copy,
  ExternalLink
} from 'lucide-react';
import BrandMark from './ui/BrandMark';

const LINK = 'hover:text-neutral-950 transition-colors cursor-pointer text-left';

export default function Footer({ onNavigateTab }) {
  const [copied, setCopied] = useState(false);
  const go = (tab) => onNavigateTab && onNavigateTab(tab);

  const handleCopyEmail = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText('sarbumihai0@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <footer className="w-full bg-white text-neutral-900">
      <div className="max-w-6xl mx-auto border-x border-neutral-200 px-6 sm:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

          <div className="lg:col-span-5 space-y-4">
            <button
              type="button"
              onClick={() => {
                go('landing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <BrandMark />
            </button>
            <p className="text-sm text-neutral-500 leading-relaxed max-w-sm">
              Tracker de aplicații, optimizare CV pentru ATS și pregătire de interviu.
            </p>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Platformă</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><button type="button" onClick={() => go('tracker')} className={LINK}>Tracker aplicații</button></li>
              <li><button type="button" onClick={() => go('cv_studio')} className={LINK}>Studio CV</button></li>
              <li><button type="button" onClick={() => go('skill_roadmap')} className={LINK}>Skill Roadmap</button></li>
              <li><button type="button" onClick={() => go('linkedin_optimizer')} className={LINK}>LinkedIn Optimizer</button></li>
              <li><button type="button" onClick={() => go('job_search')} className={LINK}>Căutare joburi</button></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Comunitate</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <button type="button" onClick={() => go('feedback')} className={`${LINK} flex items-center gap-1.5`}>
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Feedback și idei</span>
                </button>
              </li>
              <li>
                <a href="#intrebari" onClick={() => go('landing')} className={`${LINK} block`}>Întrebări frecvente</a>
              </li>
              <li><button type="button" onClick={() => go('skill_roadmap')} className={LINK}>Ghiduri de interviu</button></li>
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Contact</h4>
            <div className="flex items-center justify-between gap-2 p-3 rounded-xl border border-neutral-200">
              <a
                href="mailto:sarbumihai0@gmail.com"
                className="text-sm text-neutral-800 hover:text-neutral-950 flex items-center gap-1.5 min-w-0"
              >
                <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="truncate">sarbumihai0@gmail.com</span>
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                aria-label={copied ? 'Adresa a fost copiată' : 'Copiază adresa de email'}
                title="Copiază adresa de email"
                className="p-1 rounded hover:bg-neutral-100 text-neutral-500 hover:text-neutral-950 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <a
              href="https://github.com/sirbumihai/ATS_Job_Tracker"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-950 transition"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Cod sursă pe GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200">
        <div className="max-w-6xl mx-auto border-x border-neutral-200 px-6 sm:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <span>2026 JobFlow AI. Construit de Mihai Sarbu.</span>
          <div className="flex items-center gap-5">
            <button type="button" onClick={() => go('feedback')} className={LINK}>Trimite feedback</button>
            <a href="mailto:sarbumihai0@gmail.com" className="hover:text-neutral-950 transition">Suport</a>
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={LINK}>
              Înapoi sus
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
