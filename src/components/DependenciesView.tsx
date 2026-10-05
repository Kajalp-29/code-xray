import React, { useState } from 'react';
import {
  Layers,
  Package,
  Search,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Tag
} from 'lucide-react';
import { DependencyItem, FullProjectAnalysis } from '../types/analyzer';

interface DependenciesViewProps {
  analysis: FullProjectAnalysis;
  onSelectFile?: (filePath: string) => void;
}

export const DependenciesView: React.FC<DependenciesViewProps> = ({ analysis, onSelectFile }) => {
  const { dependencies } = analysis;
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = Array.from(new Set(dependencies.map(d => d.category)));

  const filtered = dependencies.filter(dep => {
    const matchesCategory = selectedCategory === 'ALL' || dep.category === selectedCategory;
    const matchesSearch = !searchTerm || dep.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            <span>Dependency Ecosystem & Package Analysis</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tracks package manifests, direct imports, category classifications, and identifies unreferenced packages.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
            {dependencies.length} Packages
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
            {dependencies.filter(d => d.isLikelyUnused).length} Unreferenced
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3 text-xs">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              selectedCategory === 'ALL'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Categories ({dependencies.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat} ({dependencies.filter(d => d.category === cat).length})
            </button>
          ))}
        </div>

        <div className="relative shrink-0 w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search package name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Dependencies Table Grid */}
      {filtered.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center text-slate-500 text-sm">
          No dependencies found matching the current search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((dep, idx) => (
            <div
              key={idx}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 space-y-3 transition"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white font-mono text-sm">{dep.name}</h3>
                    <span className="text-[11px] font-mono text-slate-400">{dep.version}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {dep.category}
                  </span>
                  {dep.isDev && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      dev
                    </span>
                  )}
                </div>
              </div>

              {/* Usage Evidence */}
              <div className="text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Codebase Usage:</span>
                  {dep.isLikelyUnused ? (
                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> No direct usage detected
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Used in {dep.usageCount} file(s)
                    </span>
                  )}
                </div>

                {dep.usedInFiles.length > 0 && (
                  <div className="pt-2">
                    <span className="text-slate-500 text-[10px] uppercase font-semibold block mb-1">
                      Imported In:
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {dep.usedInFiles.map((file, i) => (
                        <span
                          key={i}
                          onClick={() => onSelectFile?.(file)}
                          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-white hover:border-indigo-500/50 cursor-pointer transition"
                        >
                          {file.split('/').pop()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
