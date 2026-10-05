import React from 'react';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Cpu,
  FileCheck,
  FileX,
  X,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface PrivacyExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyExplanationModal: React.FC<PrivacyExplanationModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">How CodeXRay Privacy Works</h2>
              <p className="text-xs text-slate-400">Transparent client-side architecture & secret redaction</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-300 leading-relaxed">
          {/* Architecture diagram */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-sm">Client-Side Isolation Pipeline</h3>
            <div className="font-mono text-[11px] text-slate-300 space-y-2 bg-slate-900/80 p-4 rounded-xl border border-slate-800 overflow-x-auto">
              <div className="text-cyan-400">1. Browser File System / ZIP (Local Machine)</div>
              <div className="pl-4 text-slate-400">↓ Unpacked in Browser Memory (JSZip)</div>
              <div className="text-indigo-400">2. Local Privacy Filter (classifyFile)</div>
              <div className="pl-4 text-slate-400">├─ SENSITIVE FILES (.env, *.key, credentials.json) ──► [PURGED & BLOCKED]</div>
              <div className="pl-4 text-slate-400">└─ SAFE FILES (Source code, safe configs) ────────────► [IN-MEMORY REDACTION]</div>
              <div className="text-emerald-400">3. In-Browser AST Engine (Babel AST + DOM + API Analyzers)</div>
              <div className="pl-4 text-slate-400">↓ Structured Metadata & Metrics Generated</div>
              <div className="text-purple-400">4. Interactive Technical Report & Visual Diagrams</div>
            </div>
          </div>

          {/* Privacy Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                <FileCheck className="w-4 h-4" />
                <span>What Is Analyzed</span>
              </div>
              <p className="text-slate-400">
                JavaScript, TypeScript, JSX, TSX, HTML, CSS, Python, and package manifests (<code className="text-slate-200">package.json</code>, <code className="text-slate-200">manifest.json</code>, <code className="text-slate-200">vite.config.*</code>) for code structure, DOM queries, functions, and architecture relationships.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs">
                <FileX className="w-4 h-4" />
                <span>What Is Automatically Blocked</span>
              </div>
              <p className="text-slate-400">
                Environment configurations (<code className="text-slate-200">.env*</code>), SSL/SSH certificates (<code className="text-slate-200">*.pem</code>, <code className="text-slate-200">*.key</code>), credentials (<code className="text-slate-200">credentials.json</code>), database dumps (<code className="text-slate-200">*.sqlite</code>, <code className="text-slate-200">*.sql</code>), and build artifacts.
              </p>
            </div>
          </div>

          {/* Secret Redaction in Memory */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-2">
            <h4 className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
              <Lock className="w-4 h-4" />
              In-Memory Secret Masking
            </h4>
            <p className="text-slate-300">
              Even in safe files, if secret patterns (e.g. <code className="text-amber-200">API_KEY=</code>, <code className="text-amber-200">sk-...</code>, <code className="text-amber-200">Authorization: Bearer</code>) are detected, they are immediately masked to <code className="text-indigo-300 font-mono">[REDACTED_SECRET]</code> in memory before any downstream views or analyzers receive the content.
            </p>
          </div>

          {/* Ephemeral Session Notice */}
          <div className="flex items-center space-x-2 text-slate-400 text-xs pt-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>No database storage, no user tracking, no backend code persistence. Project analysis exists strictly for this browser session.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
          >
            Got it, return to app
          </button>
        </div>
      </div>
    </div>
  );
};
