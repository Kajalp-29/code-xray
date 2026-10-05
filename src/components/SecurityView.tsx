import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  FileCode,
  CheckCircle2,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';
import { FullProjectAnalysis, SecurityConcern } from '../types/analyzer';

interface SecurityViewProps {
  analysis: FullProjectAnalysis;
  onSelectFile?: (filePath: string) => void;
}

export const SecurityView: React.FC<SecurityViewProps> = ({ analysis, onSelectFile }) => {
  const { securityConcerns } = analysis;
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const getSeverityBadge = (sev: SecurityConcern['severity']) => {
    switch (sev) {
      case 'Critical': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'High': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'Medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Low': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const filtered = securityConcerns.filter(s => {
    const matchesSev = selectedSeverity === 'ALL' || s.severity === selectedSeverity;
    const matchesSearch = !searchTerm ||
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.file.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSev && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-rose-400" />
            <span>Code Security & Vulnerability Analysis</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Static security audit with evidence-based findings, confidence levels, and remediation guidance.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 font-semibold">
            {securityConcerns.length} Items Flagged
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
            {analysis.privacyReport.secretsRedactedCount} Secrets In-Memory Redacted
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3 text-xs">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedSeverity('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              selectedSeverity === 'ALL'
                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Severities ({securityConcerns.length})
          </button>
          {['Critical', 'High', 'Medium', 'Low'].map(sev => {
            const count = securityConcerns.filter(s => s.severity === sev).length;
            if (count === 0) return null;
            return (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  selectedSeverity === sev
                    ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sev} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative shrink-0 w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search security findings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Findings List */}
      {filtered.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Security Concerns Flagged</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Static analysis did not identify any immediate hardcoded credentials, unsafe eval invocations, or dangerous injections in analyzed source files.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((sec) => (
            <div
              key={sec.id}
              className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-rose-500/40 space-y-4 transition"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center space-x-3">
                  <span className={`px-2.5 py-1 rounded-lg border font-bold text-xs ${getSeverityBadge(sec.severity)}`}>
                    {sec.severity.toUpperCase()}
                  </span>
                  <h3 className="font-bold text-white text-sm">{sec.title}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {sec.category}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-mono">
                    Confidence: <strong className="text-indigo-300">{sec.confidence}</strong>
                  </span>
                  <div
                    onClick={() => onSelectFile?.(sec.file)}
                    className="flex items-center space-x-1.5 text-xs font-mono text-slate-400 hover:text-indigo-400 cursor-pointer"
                  >
                    <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{sec.file}:{sec.line}</span>
                  </div>
                </div>
              </div>

              {/* Reason & Remediation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">
                    Reason & Risk:
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    {sec.reason}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <span className="text-emerald-400 text-[10px] uppercase font-semibold block">
                    Suggested Remediation:
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    {sec.suggestedReview}
                  </p>
                </div>
              </div>

              {/* Code Evidence */}
              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Evidence Code Snippet:</span>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-rose-300/90 overflow-x-auto">
                  {sec.codeSnippet}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
