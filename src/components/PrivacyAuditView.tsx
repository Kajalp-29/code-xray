import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  FileCheck,
  FileX,
  FileMinus,
  CheckCircle2,
  AlertTriangle,
  Info,
  KeyRound,
  EyeOff
} from 'lucide-react';
import { FullProjectAnalysis } from '../types/analyzer';

interface PrivacyAuditViewProps {
  analysis: FullProjectAnalysis;
}

export const PrivacyAuditView: React.FC<PrivacyAuditViewProps> = ({ analysis }) => {
  const { privacyReport } = analysis;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-Knowledge Static Privacy Audit</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Privacy & Security Isolation Report
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete transparency into what was scanned, blocked, redacted, and processed during this session.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
          <span className="text-xs text-slate-400">Total Scanned</span>
          <div className="text-2xl font-bold text-white mt-1">{privacyReport.totalDetectedFiles}</div>
          <span className="text-[10px] text-slate-500">Detected in folder/zip</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-center">
          <span className="text-xs text-emerald-400">Safe Analyzed</span>
          <div className="text-2xl font-bold text-emerald-300 mt-1">{privacyReport.analyzedFilesCount}</div>
          <span className="text-[10px] text-emerald-500">Parsed by AST</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center">
          <span className="text-xs text-rose-400">Sensitive Blocked</span>
          <div className="text-2xl font-bold text-rose-300 mt-1">{privacyReport.sensitiveFilesBlockedCount}</div>
          <span className="text-[10px] text-rose-500">Zero content retained</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
          <span className="text-xs text-slate-400">Build / Ignored</span>
          <div className="text-2xl font-bold text-slate-200 mt-1">{privacyReport.ignoredFilesCount}</div>
          <span className="text-[10px] text-slate-500">node_modules & dist</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-center">
          <span className="text-xs text-amber-400">Secrets Redacted</span>
          <div className="text-2xl font-bold text-amber-300 mt-1">{privacyReport.secretsRedactedCount}</div>
          <span className="text-[10px] text-amber-500">[REDACTED_SECRET]</span>
        </div>
      </div>

      {/* Real Privacy Architecture Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm">1. Source Code Isolation</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            All file decompression (via JSZip) and Abstract Syntax Tree extraction (via Babel) run exclusively inside your browser's V8 JavaScript engine. Your source code never leaves your local machine.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm">2. Automatic Secret Redaction</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Whenever API keys, authorization tokens, database URLs, or private keys are identified in source files, their raw values are overwritten in memory with <code className="text-indigo-300 font-mono">[REDACTED_SECRET]</code>.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm">3. Ephemeral Memory Retention</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Analysis metadata exists only in memory for the current browser session. Resetting the project or closing the browser tab immediately purges all structured data from client memory.
          </p>
        </div>
      </div>

      {/* Blocked Files Audit List */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <FileX className="w-4 h-4 text-rose-400" />
          <span>Excluded Sensitive Files ({privacyReport.blockedFilesList.length})</span>
        </h2>
        <p className="text-xs text-slate-400">
          The following files matched sensitive security rules and were completely blocked from deep parsing and AI synthesis:
        </p>

        {privacyReport.blockedFilesList.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No sensitive credential files were present in this upload.</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {privacyReport.blockedFilesList.map((file, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs">
                <span className="font-mono text-rose-300 font-semibold">{file.path}</span>
                <span className="text-[11px] text-slate-400">{file.reason}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
