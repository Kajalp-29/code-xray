import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  FileCheck,
  FileX,
  FileMinus,
  Lock,
  ArrowRight,
  Eye,
  AlertTriangle,
  Info
} from 'lucide-react';
import { ProjectFile } from '../types/analyzer';

interface PrivacyReviewModalProps {
  projectName: string;
  projectFiles: ProjectFile[];
  privacySummary: {
    total: number;
    safe: number;
    sensitive: number;
    ignored: number;
    binary: number;
    secretsRedacted: number;
  };
  onConfirmAnalyze: () => void;
  onCancel: () => void;
}

export const PrivacyReviewModal: React.FC<PrivacyReviewModalProps> = ({
  projectName,
  projectFiles,
  privacySummary,
  onConfirmAnalyze,
  onCancel
}) => {
  const [activeTab, setActiveTab] = useState<'safe' | 'sensitive' | 'ignored'>('sensitive');
  const [acknowledged, setAcknowledged] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const safeFiles = projectFiles.filter(f => f.classification === 'SAFE');
  const sensitiveFiles = projectFiles.filter(f => f.classification === 'SENSITIVE');
  const ignoredFiles = projectFiles.filter(f => f.classification === 'IGNORED' || f.classification === 'BINARY');

  const getFilteredList = () => {
    let list: ProjectFile[] = [];
    if (activeTab === 'safe') list = safeFiles;
    if (activeTab === 'sensitive') list = sensitiveFiles;
    if (activeTab === 'ignored') list = ignoredFiles;

    if (!searchTerm) return list;
    return list.filter(f => f.path.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const filtered = getFilteredList();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Privacy Scan Complete
              </h2>
              <p className="text-xs text-slate-400">
                Reviewing file classification for <span className="text-indigo-400 font-mono font-medium">{projectName}</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg">
            {privacySummary.total} Files Total
          </span>
        </div>

        {/* Telemetry Cards Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 bg-slate-900/50 border-b border-slate-800">
          <div
            onClick={() => setActiveTab('safe')}
            className={`p-3.5 rounded-xl border cursor-pointer transition ${
              activeTab === 'safe'
                ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/30'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1 font-semibold">
              <span>Safe to Analyze</span>
              <FileCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">{privacySummary.safe}</div>
            <p className="text-[11px] text-emerald-400/80 mt-0.5">Source & safe configs</p>
          </div>

          <div
            onClick={() => setActiveTab('sensitive')}
            className={`p-3.5 rounded-xl border cursor-pointer transition ${
              activeTab === 'sensitive'
                ? 'bg-red-950/30 border-red-500/50 text-red-300 ring-1 ring-red-500/30'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1 font-semibold">
              <span>Sensitive Blocked</span>
              <ShieldAlert className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-bold text-red-400">{privacySummary.sensitive}</div>
            <p className="text-[11px] text-red-400/80 mt-0.5">.env, keys & secrets</p>
          </div>

          <div
            onClick={() => setActiveTab('ignored')}
            className={`p-3.5 rounded-xl border cursor-pointer transition ${
              activeTab === 'ignored'
                ? 'bg-slate-800 border-slate-500 text-slate-200'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1 font-semibold">
              <span>Build / Ignored</span>
              <FileMinus className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-white">{privacySummary.ignored + privacySummary.binary}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Modules, build & media</p>
          </div>

          <div className="p-3.5 rounded-xl border bg-slate-800/60 border-slate-700/60 text-slate-400">
            <div className="flex items-center justify-between text-xs mb-1 font-semibold">
              <span>Secrets Redacted</span>
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-300">{privacySummary.secretsRedacted}</div>
            <p className="text-[11px] text-amber-400/80 mt-0.5">Tokens masked in memory</p>
          </div>
        </div>

        {/* Tab & Search Selector */}
        <div className="px-6 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40">
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => setActiveTab('sensitive')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'sensitive'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Excluded Sensitive Files ({sensitiveFiles.length})
            </button>
            <button
              onClick={() => setActiveTab('safe')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'safe'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Safe Files ({safeFiles.length})
            </button>
            <button
              onClick={() => setActiveTab('ignored')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'ignored'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Ignored Artifacts ({ignoredFiles.length})
            </button>
          </div>

          <input
            type="text"
            placeholder="Filter files in list..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-56"
          />
        </div>

        {/* Files List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2 max-h-80">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500">
              No files found in this category matching your filter.
            </div>
          ) : (
            filtered.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs hover:border-slate-700 transition"
              >
                <div className="flex items-center space-x-3 truncate">
                  {file.classification === 'SAFE' && <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {file.classification === 'SENSITIVE' && <FileX className="w-4 h-4 text-red-400 shrink-0" />}
                  {(file.classification === 'IGNORED' || file.classification === 'BINARY') && (
                    <FileMinus className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <div className="truncate">
                    <span className="font-mono text-slate-200 font-medium">{file.path}</span>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{file.classificationReason}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  {file.isRedacted && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">
                      {file.redactedCount} secret(s) redacted
                    </span>
                  )}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      file.classification === 'SAFE'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : file.classification === 'SENSITIVE'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {file.classification}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Privacy Statement Alert */}
        <div className="p-4 mx-6 my-2 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex items-start space-x-3">
          <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <p className="font-semibold text-white">Privacy Guarantee</p>
            Sensitive files (<span className="text-red-300 font-mono">.env</span>, keys, credentials, db dumps) are stripped from memory and will <strong className="text-white">NOT</strong> be processed, evaluated, or transmitted to any AI layer or backend.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
            />
            <span>I understand sensitive files are excluded from analysis</span>
          </label>

          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
            >
              Cancel
            </button>
            <button
              disabled={!acknowledged}
              onClick={onConfirmAnalyze}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
            >
              <span>Analyze Full Project</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
