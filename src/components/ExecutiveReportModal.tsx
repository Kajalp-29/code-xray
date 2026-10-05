import React, { useState } from 'react';
import {
  Download,
  Printer,
  X,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  Layers,
  Terminal,
  Globe,
  Server,
  Database,
  Lock,
  ArrowDown,
  Sparkles,
  Cpu,
  Boxes,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { FullProjectAnalysis } from '../types/analyzer';
import {
  generateMarkdownReport,
  generatePdfReport,
  openPrintableReport
} from '../services/reportExporter';

interface ExecutiveReportModalProps {
  analysis: FullProjectAnalysis;
  isOpen: boolean;
  onClose: () => void;
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  analysis,
  isOpen,
  onClose
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const {
    projectName,
    timestamp,
    overview,
    techStack,
    domStats,
    apiCalls,
    backendRoutes,
    databaseOperations,
    securityConcerns,
    performanceConcerns,
    dependencies,
    dataFlows,
    privacyReport,
    aiProjectSummary,
    files,
    architecture
  } = analysis;

  const handleDownloadPdf = () => {
    const doc = generatePdfReport(analysis);
    doc.save(`${projectName.toLowerCase().replace(/\s+/g, '-')}-executive-audit.pdf`);
    setDownloadNotice('Detailed PDF exported successfully!');
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdownReport(analysis);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-technical-audit.md`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadNotice('Markdown report exported successfully!');
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className={`bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ${
          isFullScreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[92vh]'
        }`}
      >
        {/* Top Action Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Executive Technical Audit & Architecture Report
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                  100% In-Browser Privacy
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {projectName} • Generated {timestamp}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => openPrintableReport(analysis)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition"
              title="Print or Save as Vector PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print / Save as PDF</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
              title="Download direct PDF document"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>

            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition"
              title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {downloadNotice && (
          <div className="p-3 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{downloadNotice}</span>
          </div>
        )}

        {/* Report Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-10 text-slate-200">
          {/* Document Cover Header */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-slate-800 space-y-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
                  Official Software Engineering Deliverable
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {projectName}
                </h1>
                <p className="text-sm text-slate-300">
                  Fullstack Codebase Architecture, AST Dependency Graph & Security Audit
                </p>
              </div>

              <div className="flex flex-col sm:items-end text-xs text-slate-400 font-mono space-y-1">
                <div>Primary Language: <strong className="text-indigo-300">{techStack.primaryLanguage}</strong></div>
                <div>Analyzed LOC: <strong className="text-white">{overview.linesOfCode.toLocaleString()}</strong></div>
                <div>Status: <span className="text-emerald-400 font-bold">Audit Completed</span></div>
              </div>
            </div>

            {/* Telemetry Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-4 border-t border-slate-800/80">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Analyzed Files</span>
                <span className="text-lg font-bold text-white font-mono">{overview.analyzedFiles} / {overview.totalFiles}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Functions</span>
                <span className="text-lg font-bold text-cyan-400 font-mono">{overview.functionsCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">UI Components</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">{overview.componentsCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">DOM Operations</span>
                <span className="text-lg font-bold text-amber-400 font-mono">{overview.domOperationsCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">API / Routes</span>
                <span className="text-lg font-bold text-purple-400 font-mono">{overview.apiCallsCount + backendRoutes.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Security Flags</span>
                <span className="text-lg font-bold text-rose-400 font-mono">{overview.securityConcernsCount}</span>
              </div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              1. Executive Summary & Codebase Health
            </h2>
            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4 text-xs sm:text-sm text-slate-200 leading-relaxed">
              <p>{aiProjectSummary.developerSummary}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider">Key Highlights</h4>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {aiProjectSummary.keyHighlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-indigo-400">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">Recommended Next Actions</h4>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {aiProjectSummary.recommendedNextSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Visual Architecture Topology Graph */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              2. System Architecture & Component Topology
            </h2>
            <p className="text-xs text-slate-400">
              Visual diagram illustrating communication channels and data boundaries between runtime tiers.
            </p>

            {/* Visual SVG Diagram */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-4">
              {architecture.nodes.map((node, idx) => (
                <React.Fragment key={node.id}>
                  <div className="w-full max-w-lg p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 flex items-center justify-between shadow-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold font-mono">
                        0{idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{node.label}</h4>
                        <p className="text-xs text-slate-400">{node.sublabel}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                        {node.technologies.slice(0, 2).join(', ') || node.type}
                      </span>
                      {node.fileCount > 0 && (
                        <p className="text-[10px] text-slate-500 mt-0.5">{node.fileCount} file(s)</p>
                      )}
                    </div>
                  </div>

                  {idx < architecture.nodes.length - 1 && (
                    <div className="flex flex-col items-center text-indigo-400 py-0.5">
                      <div className="w-0.5 h-5 bg-indigo-500/40"></div>
                      <ArrowDown className="w-4 h-4 text-indigo-400 animate-pulse" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Section 3: Technology Stack & Language Distribution */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              3. Technology Stack & Language Breakdown
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stack Details */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold mb-1">Frontend Frameworks:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {techStack.frontend.map(f => <span key={f} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">{f}</span>)}
                    {techStack.styling.map(s => <span key={s} className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">{s}</span>)}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block font-semibold mb-1">Backend Server:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {techStack.backend.length > 0 ? (
                      techStack.backend.map(b => <span key={b} className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">{b}</span>)
                    ) : <span className="text-slate-500 italic">No backend framework detected</span>}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block font-semibold mb-1">Databases & Storage:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {techStack.databases.length > 0 ? (
                      techStack.databases.map(d => <span key={d} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">{d}</span>)
                    ) : <span className="text-slate-500 italic">No database engine detected</span>}
                  </div>
                </div>
              </div>

              {/* Language Distribution Progress Bars */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3 text-xs">
                <span className="text-slate-400 block font-semibold">Language Distribution:</span>
                {techStack.languages.map((lang, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-slate-300 font-mono">
                      <span>{lang.name} ({lang.filesCount} files)</span>
                      <span>{lang.linesCount.toLocaleString()} lines ({lang.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full"
                        style={{ width: `${Math.max(lang.percentage, 4)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: DOM Operations & Container Analysis */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Terminal className="w-5 h-5 text-amber-400" />
              4. DOM Operations & Inferred Container Map
            </h2>

            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Total DOM Invocations: {domStats.totalOperations}</span>
                <span className="text-slate-400 font-mono">Most Active File: {domStats.mostUsedFile}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2 px-3">DOM API</th>
                      <th className="py-2 px-3">Selector</th>
                      <th className="py-2 px-3">Inferred Container Target</th>
                      <th className="py-2 px-3">File Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {domStats.operations.slice(0, 12).map((op, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/60">
                        <td className="py-2 px-3 text-amber-400 font-bold">{op.api}</td>
                        <td className="py-2 px-3 text-indigo-300 font-semibold">{op.selector || 'element'}</td>
                        <td className="py-2 px-3 text-slate-300">{op.inferredTarget || op.purpose}</td>
                        <td className="py-2 px-3 text-slate-400">{op.file}:{op.line}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section 5: Security Findings */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <ShieldCheck className="w-5 h-5 text-rose-400" />
              5. Security Audit Findings & Vulnerability Matrix
            </h2>

            {securityConcerns.length === 0 ? (
              <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Clean Security Audit: No exposed credentials, eval() injections, or dangerous patterns detected.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {securityConcerns.map((sec, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold font-mono text-[10px]">
                          {sec.severity.toUpperCase()}
                        </span>
                        <h4 className="font-bold text-white">{sec.title}</h4>
                      </div>
                      <span className="font-mono text-slate-400 text-[11px]">{sec.file}:{sec.line}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{sec.reason}</p>
                    <p className="text-emerald-400 font-medium">Fix: {sec.suggestedReview}</p>
                    <div className="p-2 rounded-lg bg-slate-950 font-mono text-[11px] text-rose-300 truncate">
                      {sec.codeSnippet}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 6: File-By-File Deep Dive Table */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <FileCode className="w-5 h-5 text-indigo-400" />
              6. Detailed File-By-File Code Directory
            </h2>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-mono text-[11px]">
                    <th className="py-3 px-4">File Path</th>
                    <th className="py-3 px-4">Lines</th>
                    <th className="py-3 px-4">Complexity</th>
                    <th className="py-3 px-4">Declared Functions</th>
                    <th className="py-3 px-4">Architectural Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono text-[11px]">
                  {Object.entries(files).map(([path, fileRes], idx) => (
                    <tr key={idx} className="hover:bg-slate-900/60">
                      <td className="py-3 px-4 font-bold text-indigo-300">{path}</td>
                      <td className="py-3 px-4 text-slate-400">{fileRes.file.lines}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          fileRes.cyclomaticComplexity <= 5 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {fileRes.cyclomaticComplexity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-cyan-300">
                        {fileRes.functions.length > 0 ? fileRes.functions.map(f => `${f.name}()`).slice(0, 3).join(', ') : 'None'}
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-sans text-xs">
                        {fileRes.purpose.slice(0, 90)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 7: Privacy Certification */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-3 text-xs text-slate-400">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              7. Privacy & Data Isolation Certification
            </h3>
            <p>
              • Sensitive Files Excluded: <strong>{privacyReport.sensitiveFilesBlockedCount}</strong> (.env, keys, credentials, SQLite/DB dumps)
            </p>
            <p>
              • In-Memory Redacted Secrets: <strong>{privacyReport.secretsRedactedCount}</strong> ([REDACTED_SECRET])
            </p>
            <p>
              • Isolation Guarantee: <strong>100% Client-Side In-Browser execution</strong>. No source code was transmitted to or persisted on external cloud servers.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <span>CodeXRay — Professional Architecture & Codebase Intelligence Report</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => openPrintableReport(analysis)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
            >
              Print Report (PDF)
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
