import React, { useState } from 'react';
import {
  Download,
  FileText,
  FileCode,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  X,
  Sparkles,
  Layers,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { FullProjectAnalysis } from '../types/analyzer';
import {
  generateMarkdownReport,
  generatePdfReport,
  openPrintableReport
} from '../services/reportExporter';

interface ExportModalProps {
  analysis: FullProjectAnalysis;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  analysis,
  isOpen,
  onClose
}) => {
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    const doc = generatePdfReport(analysis);
    doc.save(`${analysis.projectName.toLowerCase().replace(/\s+/g, '-')}-detailed-technical-audit.pdf`);
    setDownloadedFormat('Detailed PDF Document');
    setTimeout(() => setDownloadedFormat(null), 3500);
  };

  const handlePrintReport = () => {
    openPrintableReport(analysis);
    setDownloadedFormat('Printable HTML Report');
    setTimeout(() => setDownloadedFormat(null), 3500);
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdownReport(analysis);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysis.projectName.toLowerCase().replace(/\s+/g, '-')}-codebase-analysis.md`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadedFormat('Comprehensive Markdown');
    setTimeout(() => setDownloadedFormat(null), 3500);
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(analysis, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysis.projectName.toLowerCase().replace(/\s+/g, '-')}-structured-ast.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadedFormat('Structured AST JSON');
    setTimeout(() => setDownloadedFormat(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Export Detailed Technical Report</h2>
              <p className="text-xs text-slate-400">Export multi-page PDF, printable audit, or Markdown</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {downloadedFormat && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Generated and exported <strong>{downloadedFormat}</strong> successfully!</span>
          </div>
        )}

        {/* Export Formats Grid */}
        <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
          {/* Detailed Multi-Page PDF */}
          <div
            onClick={handleDownloadPdf}
            className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-800/60 cursor-pointer transition flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition shrink-0">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-white text-sm">Detailed Multi-Page PDF Document (.pdf)</h4>
                  <span className="px-2 py-0.2 bg-rose-500/20 text-rose-300 rounded text-[10px] font-mono font-semibold">RECOMMENDED</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete technical audit containing telemetry, DOM analysis tables, security findings, and file directory.
                </p>
              </div>
            </div>
            <Download className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition shrink-0 ml-2" />
          </div>

          {/* Browser Print to PDF / High-Res View */}
          <div
            onClick={handlePrintReport}
            className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-800/60 cursor-pointer transition flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition shrink-0">
                <Printer className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Printable Interactive Report (Browser Print to PDF)</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Opens a formatted executive audit page ready for native high-resolution browser printing.
                </p>
              </div>
            </div>
            <Printer className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition shrink-0 ml-2" />
          </div>

          {/* Comprehensive Markdown */}
          <div
            onClick={handleDownloadMarkdown}
            className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-800/60 cursor-pointer transition flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Comprehensive Markdown Report (.md)</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  GitHub-formatted technical documentation with Table of Contents, code snippets, and AST breakdowns.
                </p>
              </div>
            </div>
            <Download className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition shrink-0 ml-2" />
          </div>

          {/* Structured JSON */}
          <div
            onClick={handleDownloadJson}
            className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-purple-500/60 hover:bg-slate-800/60 cursor-pointer transition flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition shrink-0">
                <FileCode className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Structured AST JSON (.json)</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Raw telemetry, parsed tokens, security evidence, and architecture nodes for automated pipelines.
                </p>
              </div>
            </div>
            <Download className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition shrink-0 ml-2" />
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" /> 100% Client-Side Generation
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
