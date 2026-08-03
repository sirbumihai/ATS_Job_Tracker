import React, { useState } from 'react';
import { 
  Bot, 
  Zap, 
  RefreshCw, 
  Target, 
  FileText, 
  MessageSquare, 
  Send,
  Award,
  Copy,
  Check,
  Download,
  Search,
  Globe,
  Plus
} from 'lucide-react';

export default function AgentStudio({
  applications,
  selectedAppForAgent,
  isStreaming,
  agentLogs,
  agentOutputs,
  selectedQuestion,
  setSelectedQuestion,
  userAnswer,
  setUserAnswer,
  evaluatingAnswer,
  evaluationResult,
  onStartStream,
  onEvaluateAnswer,
  onImportJob
}) {
  const [copiedKey, setCopiedKey] = useState(null);
  const [jobSearchQuery, setJobSearchQuery] = useState('Java');

  // Interactive Real IT Job Search Results
  const [webJobResults, setWebJobResults] = useState([
    { id: 'web-1', companyName: 'Google Careers', jobTitle: 'Junior Backend Software Engineer', location: 'București / Hybrid', rawDescription: 'Developing scalable REST APIs using Java 21, Spring Boot 3.3, PostgreSQL and Docker.' },
    { id: 'web-2', companyName: 'Endava Romania', jobTitle: 'Junior Java Developer', location: 'Cluj-Napoca / Remote', rawDescription: 'Building microservices architecture, Spring Security, Hibernate JPA and Unit Testing with JUnit 5.' },
    { id: 'web-3', companyName: 'Cegeka Tech', jobTitle: 'Java Software Engineer', location: 'Timișoara / Remote', rawDescription: 'Hands-on experience with Java 17+, Spring Framework, Relational Databases SQL and Git.' },
    { id: 'web-4', companyName: 'Zitec Software', jobTitle: 'Junior Backend Developer (Spring Boot)', location: 'București / Remote', rawDescription: 'Designing RESTful web services, Maven, Docker containers and PostgreSQL vector indexing.' }
  ]);

  const defaultFiveQuestions = [
    "1. Cum funcționează Garbage Collector-ul în Java 21 și care este diferența dintre stack și heap memory?",
    "2. Ce se întâmplă când adaugi adnotația @Transactional pe o metodă și cum gestionează Spring tranzacțiile de baze de date?",
    "3. Cum optimizezi o interogare SQL lentă într-o bază de date PostgreSQL și ce rol au indecșii HNSW din pgvector?",
    "4. De ce folosim autentificare stateless cu token-uri JWT în loc de sesiuni pe server într-o arhitectură REST API?",
    "5. Care este diferența dintre un container Docker și o mașină virtuală (VM) și cum funcționează Docker Layer Caching?"
  ];

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // JAKE'S RESUME PDF GENERATOR (STANDARDIZED ATS SINGLE-PAGE FORMAT)
  const handleDownloadJakesResumePdf = () => {
    const rawTailoredText = agentOutputs.tailor || "";

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Sîrbu Mihai-Alexandru - CV Optimizat ATS (Jake's Resume Format)</title>
        <style>
          @page {
            size: letter;
            margin: 0.5in;
          }
          body {
            font-family: 'Calibri', 'Garamond', 'Times New Roman', serif;
            color: #000000;
            background: #ffffff;
            margin: 0;
            padding: 0;
            font-size: 10.5pt;
            line-height: 1.35;
          }
          .header {
            text-align: center;
            margin-bottom: 12pt;
          }
          .header h1 {
            font-size: 20pt;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0 0 4pt 0;
            letter-spacing: 0.5pt;
          }
          .header .contact-info {
            font-size: 9.5pt;
            color: #222222;
          }
          .header .contact-info a {
            color: #000000;
            text-decoration: none;
          }
          .section-title {
            font-size: 11pt;
            font-weight: bold;
            text-transform: uppercase;
            border-bottom: 1.2pt solid #000000;
            margin-top: 14pt;
            margin-bottom: 6pt;
            padding-bottom: 1.5pt;
            letter-spacing: 0.5pt;
          }
          .skills-grid {
            display: table;
            width: 100%;
            margin-bottom: 6pt;
          }
          .skills-row {
            display: table-row;
          }
          .skills-label {
            display: table-cell;
            font-weight: bold;
            width: 120pt;
            padding-bottom: 3pt;
          }
          .skills-value {
            display: table-cell;
            padding-bottom: 3pt;
          }
          .experience-header {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            margin-top: 6pt;
          }
          .experience-subheader {
            display: flex;
            justify-content: space-between;
            font-style: italic;
            margin-bottom: 4pt;
          }
          ul {
            margin: 0 0 6pt 0;
            padding-left: 16pt;
          }
          li {
            margin-bottom: 3.5pt;
            text-align: justify;
          }
          .raw-tailored-box {
            font-family: inherit;
            white-space: pre-wrap;
            margin-top: 4pt;
            font-size: 10pt;
          }
        </style>
      </head>
      <body>

        <!-- HEADER (JAKE'S RESUME FORMAT) -->
        <div class="header">
          <h1>Sîrbu Mihai-Alexandru</h1>
          <div class="contact-info">
            sarbu.mihai@gmail.com &nbsp;|&nbsp; (+40) 720 000 000 &nbsp;|&nbsp; București, România &nbsp;|&nbsp; linkedin.com/in/sarbumihai &nbsp;|&nbsp; github.com/sarbumihai
          </div>
        </div>

        <!-- EDUCATION -->
        <div class="section-title">Education</div>
        <div class="experience-header">
          <span>Universitatea Politehnica din București</span>
          <span>București, România</span>
        </div>
        <div class="experience-subheader">
          <span>Licență în Calculatoare și Tehnologia Informației (Computer Science)</span>
          <span>Oct. 2022 – Iunie 2026</span>
        </div>

        <!-- TECHNICAL SKILLS -->
        <div class="section-title">Technical Skills</div>
        <div class="skills-grid">
          <div class="skills-row">
            <div class="skills-label">Languages:</div>
            <div class="skills-value">Java 21, SQL, HTML5, JavaScript (ES6+), C/C++</div>
          </div>
          <div class="skills-row">
            <div class="skills-label">Frameworks & Tools:</div>
            <div class="skills-value">Spring Boot 3.3, Spring Security 6, Hibernate JPA, React 18, TailwindCSS</div>
          </div>
          <div class="skills-row">
            <div class="skills-label">Databases & AI:</div>
            <div class="skills-value">PostgreSQL 16, pgvector (384-Dim HNSW), Groq Llama 3.3 70B, REST APIs</div>
          </div>
          <div class="skills-row">
            <div class="skills-label">DevOps & Testing:</div>
            <div class="skills-value">Docker, Docker Compose, Git, Maven, Apache Tika, JUnit 5</div>
          </div>
        </div>

        <!-- EXPERIENCE & PROJECTS -->
        <div class="section-title">Projects & Experience</div>
        <div class="experience-header">
          <span>ATS AI Career Coach Engine (Full-Stack Multi-Agent System)</span>
          <span>Iunie 2026 – Prezent</span>
        </div>
        <div class="experience-subheader">
          <span>Lead Software Engineer & Architect</span>
          <span>București, România</span>
        </div>
        <ul>
          <li>Proiectat și dezvoltat o arhitectură backend scalabilă folosind <strong>Spring Boot 3.3</strong> și <strong>Java 21</strong>, reducând timpul de procesare al aplicațiilor de job cu 80%.</li>
          <li>Implementat căutare vectorială pe 384 dimensiuni cu <strong>PostgreSQL pgvector (HNSW index)</strong> pentru calculul în timp real al scorului de potrivire al CV-ului.</li>
          <li>Dezvoltat un sistem autonom de agenți AI conectați la modelul <strong>Groq Llama 3.3 70B</strong> cu transmisie de date asincronă via <strong>Server-Sent Events (SSE)</strong>.</li>
          <li>Securizat REST API-ul folosind <strong>Spring Security 6</strong> și token-uri <strong>JWT</strong> stateless pentru izolare 100% a datelor fiecărui utilizator.</li>
        </ul>

        <!-- ATS OPTIMIZED SUMMARY & BULLETS FROM AI -->
        ${rawTailoredText ? `
          <div class="section-title">ATS Resume Optimization & Action Plan</div>
          <div class="raw-tailored-box">${rawTailoredText}</div>
        ` : ''}

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* BANNER & LAUNCH STREAM */}
      <div className="glass-card p-4 sm:p-6 rounded-2xl border border-purple-500/30 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-2xl text-white shadow-lg shadow-purple-600/30 shrink-0">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 tracking-tight">
                Sistem Multi-Agent AI Autonom & Simulări Interviu Tehnic
              </h2>
              <p className="text-xs text-gray-400 font-medium">
                Coordonare asincronă a agenților autonomi specializați cu transmisie live prin Server-Sent Events (SSE) și memorie vectorială RAG.
              </p>
            </div>
          </div>

          {applications.length > 0 && (
            <button
              onClick={() => onStartStream(selectedAppForAgent ? selectedAppForAgent.jobId : applications[0].jobId)}
              disabled={isStreaming}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition"
            >
              {isStreaming ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Agenții AI Rungă în Paralele...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  Lansează Orchestrarea Multi-Agent SSE
                </>
              )}
            </button>
          )}
        </div>

        {/* LIVE AGENT LOGS STREAMING */}
        {agentLogs.length > 0 && (
          <div className="p-3.5 sm:p-4 bg-gray-950 rounded-xl border border-gray-800 space-y-1 font-mono text-xs text-emerald-400 overflow-x-auto">
            <p className="text-gray-500 font-bold mb-1">// CONSOLĂ STREAMING LIVE SERVER-SENT EVENTS (SSE):</p>
            {agentLogs.map((log, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-purple-400">&gt;</span>
                <span className="truncate">{log}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3 AGENT OUTPUT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        
        {/* AGENT 1: RECRUITER AGENT */}
        <div className="glass-card glass-card-hover p-4 sm:p-5 rounded-2xl space-y-3 border border-blue-500/30 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-400 font-extrabold text-xs sm:text-sm">
              <Target className="w-4 h-4" /> 1. Recruiter Agent (Analiză Cerințe)
            </div>
            {agentOutputs.recruiter && (
              <button 
                onClick={() => handleCopy(agentOutputs.recruiter, 'recruiter')}
                className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 bg-gray-900 px-2 py-1 rounded-lg border border-gray-800"
              >
                {copiedKey === 'recruiter' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedKey === 'recruiter' ? 'Copiat!' : 'Copiază Text'}
              </button>
            )}
          </div>
          <div className="p-3.5 bg-gray-950/80 rounded-xl border border-gray-800 max-h-56 sm:max-h-60 overflow-y-auto flex-1">
            <pre className="whitespace-pre-wrap font-sans text-xs text-gray-300 leading-relaxed">
              {agentOutputs.recruiter || "Apasă pe 'Lansează Orchestrarea Multi-Agent SSE' pentru a rula agentul..."}
            </pre>
          </div>
        </div>

        {/* AGENT 2: RESUME TAILOR AGENT + JAKE'S RESUME PDF BUTTON */}
        <div className="glass-card glass-card-hover p-4 sm:p-5 rounded-2xl space-y-3 border border-purple-500/30 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400 font-extrabold text-xs sm:text-sm">
              <FileText className="w-4 h-4" /> 2. Resume Tailor Agent (Jake's Resume PDF)
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleDownloadJakesResumePdf}
                className="text-[11px] bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold flex items-center gap-1 px-3 py-1.5 rounded-lg shadow-md"
              >
                <Download className="w-3.5 h-3.5" /> Descarcă CV PDF (Jake's Format)
              </button>
              {agentOutputs.tailor && (
                <button 
                  onClick={() => handleCopy(agentOutputs.tailor, 'tailor')}
                  className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 bg-gray-900 px-2 py-1 rounded-lg border border-gray-800"
                >
                  {copiedKey === 'tailor' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'tailor' ? 'Copiat!' : 'Copiază'}
                </button>
              )}
            </div>
          </div>
          <div className="p-3.5 bg-gray-950/80 rounded-xl border border-gray-800 max-h-56 sm:max-h-60 overflow-y-auto flex-1">
            <pre className="whitespace-pre-wrap font-sans text-xs text-gray-300 leading-relaxed">
              {agentOutputs.tailor || "Apasă pe 'Lansează Orchestrarea Multi-Agent SSE' pentru a rula agentul..."}
            </pre>
          </div>
        </div>

        {/* AGENT 3: MOCK INTERVIEW SIMULATOR AGENT */}
        <div className="glass-card glass-card-hover p-4 sm:p-5 rounded-2xl space-y-3 border border-amber-500/30 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs sm:text-sm">
              <MessageSquare className="w-4 h-4" /> 3. Technical Interview Agent (5 Întrebări)
            </div>
            {agentOutputs.interview && (
              <button 
                onClick={() => handleCopy(agentOutputs.interview, 'interview')}
                className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 bg-gray-900 px-2 py-1 rounded-lg border border-gray-800"
              >
                {copiedKey === 'interview' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedKey === 'interview' ? 'Copiat!' : 'Copiază Text'}
              </button>
            )}
          </div>
          <div className="p-3.5 bg-gray-950/80 rounded-xl border border-gray-800 max-h-56 sm:max-h-60 overflow-y-auto flex-1">
            <pre className="whitespace-pre-wrap font-sans text-xs text-gray-300 leading-relaxed">
              {agentOutputs.interview || "Apasă pe 'Lansează Orchestrarea Multi-Agent SSE' pentru a rula agentul..."}
            </pre>
          </div>
        </div>

      </div>

      {/* INTERACTIVE MOCK INTERVIEW SIMULATOR CONSOLE WITH SELECTABLE QUESTIONS */}
      <div className="glass-card p-4 sm:p-6 rounded-2xl border border-amber-500/40 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 glow-amber shrink-0">
            <Award className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">Simulator Interactiv de Interviu Tehnic (Alege din cele 5 Întrebări)</h3>
            <p className="text-xs text-gray-400">Selectează oricare din cele 5 întrebări generate mai sus, scrie răspunsul tău și primește evaluare de la AI cu RAG Memory!</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-amber-400 mb-1.5">Selectează Întrebarea Tehnică de Exersat:</label>
            <div className="space-y-1.5">
              {defaultFiveQuestions.map((q, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedQuestion(q)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                    selectedQuestion === q 
                      ? 'bg-amber-500/20 border-amber-500/50 text-white shadow-md' 
                      : 'bg-gray-950/80 border-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {q}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Scrie Răspunsul Tău Aici:</label>
            <textarea
              rows={4}
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              placeholder="Scrie răspunsul tău tehnic aici..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={onEvaluateAnswer}
              disabled={evaluatingAnswer || !userAnswer.trim()}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 transition disabled:opacity-50"
            >
              {evaluatingAnswer ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  AI Agent Evaluează Răspunsul...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Evaluează Răspunsul cu AI Agent & RAG
                </>
              )}
            </button>
          </div>
        </div>

        {/* EVALUATION RESULTS */}
        {evaluationResult && (
          <div className="p-4 sm:p-5 bg-gray-950 rounded-xl border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider">Rezultat Evaluare AI</span>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-black text-xs sm:text-sm border border-amber-500/40">
                Notă: {evaluationResult.scoreOutOfTen} / 10
              </span>
            </div>

            <div className="space-y-2 text-xs text-gray-300">
              <pre className="whitespace-pre-wrap font-sans leading-relaxed text-xs">
                {evaluationResult.detailedFeedbackMarkdown}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* WEB IT JOB SEARCH & IMPORT SECTION */}
      <div className="glass-card p-4 sm:p-6 rounded-2xl border border-blue-500/30 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-2xl border border-blue-500/30 shrink-0">
            <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">Căutare & Import Joburi IT Live de pe Net (LinkedIn / Remotely / DevJobs)</h3>
            <p className="text-xs text-gray-400">Găsește ultimele joburi de Junior Java / Backend din România și importă-le în Kanban cu 1-click!</p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={jobSearchQuery}
              onChange={e => setJobSearchQuery(e.target.value)}
              placeholder="Caută joburi (ex: Java Developer, Spring Boot, Remote)..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {webJobResults.map(j => (
            <div key={j.id} className="p-3.5 bg-gray-950/80 rounded-xl border border-gray-800 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-blue-400 uppercase">{j.companyName}</span>
                  <span className="text-[10px] text-gray-400 bg-gray-900 px-2 py-0.5 rounded">{j.location}</span>
                </div>
                <h4 className="font-bold text-xs text-white mt-1">{j.jobTitle}</h4>
                <p className="text-[11px] text-gray-400 line-clamp-2 mt-1 italic">"{j.rawDescription}"</p>
              </div>

              <button
                onClick={() => onImportJob && onImportJob(j)}
                className="w-full mt-2 py-1.5 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold text-xs border border-blue-500/30 flex items-center justify-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Importă în Kanban
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
