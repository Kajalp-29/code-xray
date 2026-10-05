import React from 'react';
import {
  ShieldCheck,
  Search,
  Download,
  FolderOpen,
  Sparkles,
  Layers,
  Code2,
  Terminal,
  RotateCcw,
  BookOpen,
  FileText
} from 'lucide-react';
import { FullProjectAnalysis } from '../types/analyzer';

interface NavbarProps {
  analysis: FullProjectAnalysis | null;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onReset: () => void;
  onOpenSearch: () => void;
  onOpenExport: () => void;
  onOpenExecutiveReport: () => void;
  onOpenPrivacyGuide: () => void;
  viewMode: 'developer' | 'simple';
  onToggleViewMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  analysis,
  activeTab,
  onSelectTab,
  onReset,
  onOpenSearch,
  onOpenExport,
  onOpenExecutiveReport,
  onOpenPrivacyGuide,
  viewMode,
  onToggleViewMode
}) => {
  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'architecture', label: 'Architecture', icon: Layers },
    { id: 'explorer', label: 'Files & AST', icon: Code2 },
    { id: 'dom', label: 'DOM Analyzer', icon: Terminal },
    { id: 'apis', label: 'APIs & Backend', icon: Terminal },
    { id: 'dependencies', label: 'Dependencies', icon: Layers },
    { id: 'security', label: 'Security', icon: ShieldCheck, badge: analysis?.securityConcerns.length },
    { id: 'performance', label: 'Performance', icon: Sparkles, badge: analysis?.performanceConcerns.length },
    { id: 'dataflow', label: 'Data Flow', icon: Layers },
    { id: 'privacy', label: 'Privacy Report', icon: ShieldCheck }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={analysis ? () => onSelectTab('dashboard') : onReset}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Code<span className="text-indigo-400">XRay</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Privacy-First
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Full Website Codebase & Architecture Analyzer</p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2.5">
            {/* View Mode Switcher */}
            <button
              onClick={onToggleViewMode}
              className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition"
              title="Toggle between technical developer view and plain English explanation"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>{viewMode === 'developer' ? 'Technical View' : 'Simple View'}</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded font-mono">
                {viewMode === 'developer' ? 'DEV' : 'PLAIN'}
              </span>
            </button>

            {/* How Privacy Works Button */}
            <button
              onClick={onOpenPrivacyGuide}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">How Privacy Works</span>
            </button>

            {analysis && (
              <>
                {/* Search Trigger */}
                <button
                  onClick={onOpenSearch}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Search</span>
                  <kbd className="hidden sm:inline text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">Ctrl+K</kbd>
                </button>

                {/* View Executive Report Button */}
                <button
                  onClick={onOpenExecutiveReport}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-md shadow-indigo-600/20 transition"
                  title="View clean visual audit report with diagrams and graphs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Executive Report</span>
                </button>

                {/* Export Report */}
                <button
                  onClick={onOpenExport}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>

                {/* Reset / New Upload */}
                <button
                  onClick={onReset}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition"
                  title="Analyze another project"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Navigation Tabs Bar when Project is Analyzed */}
        {analysis && (
          <div className="flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-800/80 no-scrollbar text-xs">
            {navTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px]">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
