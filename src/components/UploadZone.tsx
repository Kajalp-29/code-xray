import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileArchive,
  Folder,
  Shield,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Puzzle,
  Terminal,
  FileCode,
  Zap
} from 'lucide-react';
import { SAMPLE_PROJECTS, SampleProject } from '../services/sampleProjects';

interface UploadZoneProps {
  onZipSelected: (file: File) => void;
  onFolderSelected: (files: FileList) => void;
  onSampleSelected: (sample: SampleProject) => void;
  isScanning: boolean;
  scanStatus: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onZipSelected,
  onFolderSelected,
  onSampleSelected,
  isScanning,
  scanStatus
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const firstFile = e.dataTransfer.files[0];
      if (firstFile.name.endsWith('.zip')) {
        onZipSelected(firstFile);
      } else {
        // Multi-file or folder dropped
        onFolderSelected(e.dataTransfer.files);
      }
    }
  };

  const sampleIcons: Record<string, any> = {
    ShoppingBag,
    Puzzle,
    Terminal
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Zero Server Uploads • 100% In-Browser AST Analysis</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          Understand your entire codebase. <br />
          <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Without exposing your secrets.
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          Upload any web project folder or ZIP. Get a deep technical X-ray of project architecture,
          DOM operations, APIs, component trees, dependencies, security concerns, and data flows with automated secret exclusion.
        </p>
      </div>

      {/* Main Upload Drop Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition duration-200 glass-panel ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-950/30 glow-indigo'
            : 'border-slate-700/80 hover:border-slate-600'
        }`}
      >
        {isScanning ? (
          <div className="py-10 flex flex-col items-center justify-center space-y-5">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-cyan-500/20 border-b-cyan-400 animate-spin animation-reverse"></div>
              <Shield className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Scanning Codebase...</h3>
              <p className="text-sm text-indigo-300 font-mono">{scanStatus}</p>
            </div>
            <div className="flex items-center space-x-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> In-Memory Sandbox</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Excluding .env & Keys</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Redacting Secrets</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-950 to-slate-800 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <UploadCloud className="w-10 h-10 animate-bounce text-indigo-400" />
            </div>

            <div className="space-y-2 max-w-lg">
              <h3 className="text-2xl font-bold text-white">
                Drop your project here
              </h3>
              <p className="text-sm text-slate-400">
                Supports ZIP archives or entire unzipped project directories.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              {/* ZIP Input */}
              <input
                ref={zipInputRef}
                type="file"
                accept=".zip"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    onZipSelected(e.target.files[0]);
                  }
                }}
              />
              <button
                onClick={() => zipInputRef.current?.click()}
                className="flex items-center space-x-2.5 px-6 py-3 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
              >
                <FileArchive className="w-4 h-4" />
                <span>Select ZIP Archive</span>
              </button>

              {/* Folder Input */}
              <input
                ref={folderInputRef}
                type="file"
                // @ts-ignore
                webkitdirectory=""
                directory=""
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    onFolderSelected(e.target.files);
                  }
                }}
              />
              <button
                onClick={() => folderInputRef.current?.click()}
                className="flex items-center space-x-2.5 px-6 py-3 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition transform hover:-translate-y-0.5"
              >
                <Folder className="w-4 h-4 text-cyan-400" />
                <span>Select Project Folder</span>
              </button>
            </div>

            {/* Security Badge in Dropzone */}
            <div className="flex items-center space-x-2 text-xs text-slate-400 pt-4 border-t border-slate-800/80 max-w-md">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                Sensitive files (<code className="text-slate-300">.env</code>, <code className="text-slate-300">*.key</code>, <code className="text-slate-300">credentials.json</code>, <code className="text-slate-300">*.db</code>) are automatically excluded before analysis.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Instant 1-Click Demo Projects */}
      <div className="mt-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Or Explore Instant Demo Codebases</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Test real-world AST code & DOM extraction without uploading local files</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SAMPLE_PROJECTS.map((sample) => {
            const Icon = sampleIcons[sample.icon] || FileCode;
            return (
              <div
                key={sample.id}
                onClick={() => onSampleSelected(sample)}
                className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/80 cursor-pointer transition group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                      {sample.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-indigo-300 transition text-sm">
                      {sample.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {sample.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-indigo-400 font-medium pt-4 mt-3 border-t border-slate-800/80">
                  <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Zap className="w-3 h-3 text-amber-400" /> {sample.files.length} mock files
                  </span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition">
                    Analyze Sample <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
            <Lock className="w-4 h-4" />
          </div>
          <h4 className="font-semibold text-white text-sm mb-1">Guaranteed Privacy Boundary</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            All file classification and AST extraction happens directly in JavaScript inside your browser. No files are stored or uploaded.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
            <Terminal className="w-4 h-4" />
          </div>
          <h4 className="font-semibold text-white text-sm mb-1">Deep DOM & Container Extraction</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Identifies every querySelector, createElement, event listener, and infers target container components with confidence indicators.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
            <FileCode className="w-4 h-4" />
          </div>
          <h4 className="font-semibold text-white text-sm mb-1">True AST Parsers & Graphs</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Uses real Babel AST parsers for JavaScript, TypeScript, JSX, and TSX. Calculates cyclomatic complexity and traces full data flows.
          </p>
        </div>
      </div>
    </div>
  );
};
