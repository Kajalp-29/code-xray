import React from 'react';
import {
  Sparkles,
  Zap,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { FullProjectAnalysis, PerformanceConcern } from '../types/analyzer';

interface PerformanceViewProps {
  analysis: FullProjectAnalysis;
  onSelectFile?: (filePath: string) => void;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({ analysis, onSelectFile }) => {
  const { performanceConcerns } = analysis;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span>Runtime & DOM Performance Analysis</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Detects layout thrashing, DOM queries in loops, unthrottled event streams, and heavy synchronous blockers.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 font-mono font-semibold text-xs">
          {performanceConcerns.length} Performance Concerns
        </span>
      </div>

      {/* Concerns List */}
      {performanceConcerns.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Critical Performance Bottlenecks Detected</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            DOM operations and listeners follow standard non-blocking practices without repeated queries inside loops.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {performanceConcerns.map((perf) => (
            <div
              key={perf.id}
              className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-yellow-500/40 space-y-4 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="px-2.5 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-bold text-xs">
                    {perf.severity.toUpperCase()}
                  </span>
                  <h3 className="font-bold text-white text-sm">{perf.title}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {perf.category}
                  </span>
                </div>

                <div
                  onClick={() => onSelectFile?.(perf.file)}
                  className="flex items-center space-x-1.5 text-xs font-mono text-slate-400 hover:text-indigo-400 cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{perf.file}:{perf.line}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">
                    Impact & Risk:
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    {perf.reason}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <span className="text-emerald-400 text-[10px] uppercase font-semibold block">
                    Optimization Recommendation:
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    {perf.suggestedReview}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-yellow-300/90 overflow-x-auto">
                {perf.codeSnippet}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
