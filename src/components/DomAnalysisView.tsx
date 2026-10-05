import React, { useState } from 'react';
import {
  Terminal,
  MousePointer,
  Eye,
  FileCode,
  Layers,
  Sparkles,
  Zap,
  Info,
  Search,
  Filter
} from 'lucide-react';
import { DomOperation, DomStats, FullProjectAnalysis } from '../types/analyzer';

interface DomAnalysisViewProps {
  analysis: FullProjectAnalysis;
  onSelectFile?: (filePath: string) => void;
}

export const DomAnalysisView: React.FC<DomAnalysisViewProps> = ({ analysis, onSelectFile }) => {
  const { domStats } = analysis;
  const [selectedApi, setSelectedApi] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const apiList = Object.entries(domStats.apiBreakdown).sort((a, b) => b[1] - a[1]);
  const eventList = Object.entries(domStats.eventsBreakdown).sort((a, b) => b[1] - a[1]);

  const filteredOps = domStats.operations.filter(op => {
    const matchesApi = selectedApi === 'ALL' || op.api === selectedApi;
    const matchesSearch = !searchTerm ||
      op.selector?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.file.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.codeSnippet.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesApi && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            <span>DOM API & Container Analysis</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Examines browser DOM queries, element creation, class modifications, observers, and event listeners.
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono font-semibold">
            {domStats.totalOperations} Total DOM Operations
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-mono">
            Most Active: <strong className="text-white">{domStats.mostUsedFile.split('/').pop() || 'N/A'}</strong>
          </span>
        </div>
      </div>

      {/* Top API Cards Distribution */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setSelectedApi('ALL')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition ${
            selectedApi === 'ALL'
              ? 'bg-amber-950/30 border-amber-500/50 text-amber-300 ring-1 ring-amber-500/30'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] font-medium block">All Operations</span>
          <div className="text-xl font-bold text-white mt-1">{domStats.totalOperations}</div>
        </div>

        {apiList.slice(0, 5).map(([api, count]) => (
          <div
            key={api}
            onClick={() => setSelectedApi(api)}
            className={`p-3.5 rounded-2xl border cursor-pointer transition ${
              selectedApi === api
                ? 'bg-amber-950/30 border-amber-500/50 text-amber-300 ring-1 ring-amber-500/30'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <span className="text-[11px] font-mono font-medium truncate block">{api}</span>
            <div className="text-xl font-bold text-white mt-1">{count}</div>
          </div>
        ))}
      </div>

      {/* Event Listeners System Summary */}
      {eventList.length > 0 && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <MousePointer className="w-4 h-4 text-indigo-400" />
            <span>Event System & User Interactions ({eventList.reduce((acc, [, c]) => acc + c, 0)} listeners)</span>
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {eventList.map(([evt, count]) => (
              <div key={evt} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80">
                <span className="font-mono text-indigo-300 font-semibold">{evt}</span>
                <span className="px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded-full text-[10px] font-mono">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto text-xs pb-1 sm:pb-0">
          <span className="text-slate-500 font-medium shrink-0">Filter API:</span>
          <button
            onClick={() => setSelectedApi('ALL')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              selectedApi === 'ALL' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({domStats.totalOperations})
          </button>
          {apiList.map(([api, count]) => (
            <button
              key={api}
              onClick={() => setSelectedApi(api)}
              className={`px-2.5 py-1 rounded-lg font-medium font-mono whitespace-nowrap transition ${
                selectedApi === api ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              {api} ({count})
            </button>
          ))}
        </div>

        <div className="relative shrink-0 w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search selector, file..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* DOM Operations Detailed Cards */}
      <div className="space-y-3">
        {filteredOps.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center text-slate-500 text-sm">
            No DOM operations matching the current filter.
          </div>
        ) : (
          filteredOps.map((op, idx) => (
            <div
              key={idx}
              className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-amber-500/40 space-y-3 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold text-xs">
                    {op.api}
                  </span>
                  {op.selector && (
                    <div className="flex items-center space-x-1.5 font-mono text-xs">
                      <span className="text-slate-500">Selector:</span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-indigo-300 border border-slate-700 font-bold">
                        {op.selector}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                  <span
                    onClick={() => onSelectFile?.(op.file)}
                    className="hover:text-indigo-400 cursor-pointer flex items-center gap-1 text-slate-300"
                  >
                    <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{op.file}</span>
                  </span>
                  <span>:Line {op.line}</span>
                </div>
              </div>

              {/* Inferred Target & Purpose */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {op.inferredTarget && (
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold block mb-0.5">
                      Target Container / Element
                    </span>
                    <p className="text-emerald-300 font-medium">
                      {op.inferredTarget}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 italic">
                      *Target inferred from selector; runtime DOM may differ.
                    </p>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold block mb-0.5">
                    Operation Purpose
                  </span>
                  <p className="text-slate-300">
                    {op.purpose}
                  </p>
                </div>
              </div>

              {/* Code Snippet */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-300 overflow-x-auto">
                {op.codeSnippet}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
