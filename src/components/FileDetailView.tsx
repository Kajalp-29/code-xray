import React, { useState } from 'react';
import {
  FileCode,
  Cpu,
  Boxes,
  Terminal,
  Globe,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Layers,
  Code2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Hash
} from 'lucide-react';
import { FileAnalysisResult, FunctionAnalysis } from '../types/analyzer';

interface FileDetailViewProps {
  analysis: FileAnalysisResult;
  viewMode: 'developer' | 'simple';
}

export const FileDetailView: React.FC<FileDetailViewProps> = ({ analysis, viewMode }) => {
  const { file, purpose, simpleExplanation, mainResponsibilities, functions, classes, components, imports, exports, domOperations, apiCalls, cyclomaticComplexity, deadCodeCandidates } = analysis;
  const [activeTab, setActiveTab] = useState<'overview' | 'functions' | 'dom' | 'apis' | 'code'>('overview');
  const [selectedFunc, setSelectedFunc] = useState<FunctionAnalysis | null>(functions[0] || null);

  const getComplexityBadge = (score: number) => {
    if (score <= 5) return { label: 'Low Complexity (Clean)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (score <= 15) return { label: 'Moderate Complexity', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { label: 'High Complexity (Refactor candidate)', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
  };

  const compBadge = getComplexityBadge(cyclomaticComplexity);

  return (
    <div className="glass-panel rounded-3xl border border-slate-800 p-6 space-y-6 flex-1 overflow-y-auto">
      {/* File Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-mono">{file.name}</h2>
              <p className="text-xs text-slate-400">{file.path}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-mono">
            {file.lines} lines
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-mono">
            {(file.size / 1024).toFixed(1)} KB
          </span>
          <span className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${compBadge.color}`}>
            Cyclomatic: {cyclomaticComplexity} ({compBadge.label.split(' ')[0]})
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            activeTab === 'overview' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          Overview & AI Explanation
        </button>
        <button
          onClick={() => setActiveTab('functions')}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            activeTab === 'functions' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          Functions ({functions.length})
        </button>
        {domOperations.length > 0 && (
          <button
            onClick={() => setActiveTab('dom')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'dom' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            DOM APIs ({domOperations.length})
          </button>
        )}
        {apiCalls.length > 0 && (
          <button
            onClick={() => setActiveTab('apis')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'apis' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Network APIs ({apiCalls.length})
          </button>
        )}
        <button
          onClick={() => setActiveTab('code')}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            activeTab === 'code' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Source Code
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6 text-xs">
          {/* AI Purpose Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                {viewMode === 'developer' ? 'Architectural Purpose' : 'What this file does'}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded">
                {viewMode === 'developer' ? 'Developer View' : 'Simple View'}
              </span>
            </div>
            <p className="text-slate-200 leading-relaxed text-sm">
              {viewMode === 'developer' ? purpose : simpleExplanation}
            </p>
          </div>

          {/* Main Responsibilities */}
          {mainResponsibilities.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider">
                Key Responsibilities:
              </h4>
              <ul className="space-y-1.5">
                {mainResponsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Dead Code Notice if any */}
          {deadCodeCandidates.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2">
              <h4 className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Potential Dead / Unused Code ({deadCodeCandidates.length})
              </h4>
              {deadCodeCandidates.map((dc, i) => (
                <p key={i} className="text-[11px] text-amber-200/90 font-mono">
                  • Line {dc.line}: {dc.reason}
                </p>
              ))}
            </div>
          )}

          {/* Components / Classes Summary */}
          {components.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-400" />
                React / UI Components ({components.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {components.map((comp, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-400 font-mono">&lt;{comp.name} /&gt;</span>
                      <span className="text-[10px] text-slate-500">Line {comp.line}</span>
                    </div>
                    {comp.hooksUsed.length > 0 && (
                      <div className="text-[11px] text-slate-400">
                        <span className="text-slate-500">Hooks: </span>
                        {comp.hooksUsed.map(h => (
                          <span key={h} className="inline-block px-1.5 py-0.2 bg-indigo-500/10 text-indigo-300 rounded font-mono mr-1">
                            {h}()
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Imports & Exports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
              <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider block">
                Imports ({imports.length})
              </span>
              {imports.length === 0 ? (
                <p className="text-slate-500 italic">No external module imports</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto font-mono text-[11px]">
                  {imports.map((imp, i) => (
                    <div key={i} className="text-slate-300 truncate">
                      <span className="text-indigo-400">{imp.specifiers.join(', ') || '*'}</span> from <span className="text-slate-400">'{imp.source}'</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
              <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider block">
                Exports ({exports.length})
              </span>
              {exports.length === 0 ? (
                <p className="text-slate-500 italic">No exported symbols</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto font-mono text-[11px]">
                  {exports.map((exp, i) => (
                    <div key={i} className="text-emerald-400 truncate">
                      export {exp.isDefault ? 'default ' : ''}{exp.name} (Line {exp.line})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Functions & Methods */}
      {activeTab === 'functions' && (
        <div className="space-y-6 text-xs">
          {functions.length === 0 ? (
            <p className="text-slate-500 italic text-center py-8">No standalone functions or methods declared in this file.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Function List */}
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {functions.map((fn, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedFunc(fn)}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      selectedFunc?.name === fn.name
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-indigo-300 truncate">
                        {fn.name}()
                      </span>
                      <span className="text-[10px] text-slate-500">Line {fn.line}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1.5 text-[10px] text-slate-400">
                      {fn.isAsync && <span className="text-amber-400">async</span>}
                      {fn.isExported && <span className="text-emerald-400">exported</span>}
                      <span>({fn.params.length} params)</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Function Detail Card */}
              <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                {selectedFunc ? (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-indigo-400 uppercase">Function Analysis</span>
                        <h3 className="text-base font-bold text-white font-mono mt-0.5">
                          {selectedFunc.name}({selectedFunc.params.join(', ')})
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700">
                        Line {selectedFunc.line}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium block mb-1">Purpose & Role:</span>
                      <p className="text-slate-200 leading-relaxed text-xs">
                        {viewMode === 'developer' ? selectedFunc.purpose : selectedFunc.simpleExplanation}
                      </p>
                    </div>

                    {selectedFunc.calls && selectedFunc.calls.length > 0 && (
                      <div>
                        <span className="text-slate-400 font-medium block mb-1.5">Functions/APIs Called:</span>
                        <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                          {selectedFunc.calls.map(c => (
                            <span key={c} className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                              {c}()
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-slate-500 italic">Select a function to view details.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: DOM Operations */}
      {activeTab === 'dom' && (
        <div className="space-y-3 text-xs">
          {domOperations.map((dom, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-amber-400 text-xs">{dom.api}</span>
                <span className="text-[10px] text-slate-500">Line {dom.line}</span>
              </div>
              {dom.selector && (
                <div className="font-mono text-[11px] text-slate-300">
                  <span className="text-slate-500">Selector: </span>
                  <span className="text-indigo-300 font-bold">{dom.selector}</span>
                </div>
              )}
              {dom.inferredTarget && (
                <p className="text-[11px] text-emerald-300/90">
                  <span className="text-slate-400">Target Container: </span>{dom.inferredTarget}
                </p>
              )}
              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-300 truncate">
                {dom.codeSnippet}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: API Calls */}
      {activeTab === 'apis' && (
        <div className="space-y-3 text-xs">
          {apiCalls.map((api, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold font-mono text-[10px]">
                    {api.method}
                  </span>
                  <span className="font-mono text-slate-200 font-semibold">{api.endpoint}</span>
                </div>
                <span className="text-[10px] text-slate-500">Line {api.line}</span>
              </div>
              {api.domain && (
                <p className="text-[11px] text-slate-400">External Domain: <strong className="text-white">{api.domain}</strong></p>
              )}
              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-300">
                {api.codeSnippet}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Raw Code Viewer */}
      {activeTab === 'code' && (
        <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden text-xs">
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400 font-mono text-[11px]">
            <span>{file.path}</span>
            <span>{file.lines} lines</span>
          </div>
          <pre className="p-4 overflow-x-auto font-mono text-slate-300 max-h-[500px] leading-relaxed select-text">
            {file.content || '// Content excluded for privacy or binary representation'}
          </pre>
        </div>
      )}
    </div>
  );
};
