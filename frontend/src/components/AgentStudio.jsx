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
  Check
} from 'lucide-react';

export default function AgentStudio({
  applications,
  selectedAppForAgent,
  isStreaming,
  agentLogs,
  agentOutputs,
  selectedQuestion,
  userAnswer,
  setUserAnswer,
  evaluatingAnswer,
  evaluationResult,
  onStartStream,
  onEvaluateAnswer
}) {
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
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
                Coordonare asincronă a 4 agenți autonomi specializați cu transmisie live prin Server-Sent Events (SSE) și memorie vectorială RAG.
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

      {/* 4 AGENT OUTPUT CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
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

        {/* AGENT 2: RESUME TAILOR AGENT */}
        <div className="glass-card glass-card-hover p-4 sm:p-5 rounded-2xl space-y-3 border border-purple-500/30 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400 font-extrabold text-xs sm:text-sm">
              <FileText className="w-4 h-4" /> 2. Resume Tailor Agent (Optimizare CV ATS 100%)
            </div>
            {agentOutputs.tailor && (
              <button 
                onClick={() => handleCopy(agentOutputs.tailor, 'tailor')}
                className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 bg-gray-900 px-2 py-1 rounded-lg border border-gray-800"
              >
                {copiedKey === 'tailor' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedKey === 'tailor' ? 'Copiat!' : 'Copiază Text'}
              </button>
            )}
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
              <MessageSquare className="w-4 h-4" /> 3. Technical Interview Agent (5 Întrebări Tehnice)
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

        {/* AGENT 4: OUTREACH AGENT */}
        <div className="glass-card glass-card-hover p-4 sm:p-5 rounded-2xl space-y-3 border border-emerald-500/30 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs sm:text-sm">
              <Send className="w-4 h-4" /> 4. Outreach Agent (Mesaje Recruiter LinkedIn)
            </div>
            {agentOutputs.outreach && (
              <button 
                onClick={() => handleCopy(agentOutputs.outreach, 'outreach')}
                className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 bg-gray-900 px-2 py-1 rounded-lg border border-gray-800"
              >
                {copiedKey === 'outreach' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedKey === 'outreach' ? 'Copiat!' : 'Copiază Text'}
              </button>
            )}
          </div>
          <div className="p-3.5 bg-gray-950/80 rounded-xl border border-gray-800 max-h-56 sm:max-h-60 overflow-y-auto flex-1">
            <pre className="whitespace-pre-wrap font-sans text-xs text-gray-300 leading-relaxed">
              {agentOutputs.outreach || "Apasă pe 'Lansează Orchestrarea Multi-Agent SSE' pentru a rula agentul..."}
            </pre>
          </div>
        </div>

      </div>

      {/* INTERACTIVE MOCK INTERVIEW SIMULATOR CONSOLE */}
      <div className="glass-card p-4 sm:p-6 rounded-2xl border border-amber-500/40 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 glow-amber shrink-0">
            <Award className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">Simulator Interactiv de Interviu Tehnic cu AI & RAG Memory</h3>
            <p className="text-xs text-gray-400">Scrie răspunsul tău la întrebare și primește o notă de la 1 la 10 și feedback în timp real!</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-amber-400 mb-1">Întrebare Tehnică Selectată:</label>
            <p className="p-3 sm:p-3.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-gray-200 font-semibold">
              {selectedQuestion}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Scrie Răspunsul Tău Aici:</label>
            <textarea
              rows={4}
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              placeholder="Scrie răspunsul tău tehnic aici (ex: Garbage Collector-ul eliberează memoria nefolosită din Heap...)"
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

    </div>
  );
}
