import React from 'react';
import {
  Layers,
  Code2,
  FileCode,
  Terminal,
  ShieldCheck,
  Sparkles,
  Zap,
  ArrowRight,
  Database,
  Globe,
  Cpu,
  Lock,
  Boxes,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { FullProjectAnalysis } from '../types/analyzer';

interface DashboardViewProps {
  analysis: FullProjectAnalysis;
  onNavigateTab: (tab: string) => void;
  viewMode: 'developer' | 'simple';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analysis,
  onNavigateTab,
  viewMode
}) => {
  const { overview, techStack, aiProjectSummary, domStats, securityConcerns, performanceConcerns, chromeExtension } = analysis;

  const statCards = [
    {
      title: 'Analyzed Files',
      value: `${overview.analyzedFiles} / ${overview.totalFiles}`,
      sub: `${analysis.privacyReport.sensitiveFilesBlockedCount} sensitive blocked`,
      icon: FileCode,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      tab: 'explorer'
    },
    {
      title: 'Lines of Code',
      value: overview.linesOfCode.toLocaleString(),
      sub: `${techStack.languages.length} language(s)`,
      icon: Code2,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      tab: 'explorer'
    },
    {
      title: 'Functions & Methods',
      value: overview.functionsCount,
      sub: `${overview.classesCount} classes detected`,
      icon: Cpu,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      tab: 'explorer'
    },
    {
      title: 'UI Components',
      value: overview.componentsCount,
      sub: `${techStack.frontend.join(', ') || 'HTML/JS'}`,
      icon: Boxes,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      tab: 'explorer'
    },
    {
      title: 'DOM Operations',
      value: overview.domOperationsCount,
      sub: `Across ${Object.keys(domStats.apiBreakdown).length} DOM API types`,
      icon: Terminal,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      tab: 'dom'
    },
    {
      title: 'API & Network Calls',
      value: overview.apiCallsCount,
      sub: `${analysis.backendRoutes.length} backend routes`,
      icon: Globe,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      tab: 'apis'
    },
    {
      title: 'Security Concerns',
      value: overview.securityConcernsCount,
      sub: `${securityConcerns.filter(s => s.severity === 'Critical' || s.severity === 'High').length} high severity`,
      icon: ShieldCheck,
      color: securityConcerns.length > 0 ? 'text-rose-400' : 'text-emerald-400',
      bg: securityConcerns.length > 0 ? 'bg-rose-500/10' : 'bg-emerald-500/10',
      border: securityConcerns.length > 0 ? 'border-rose-500/20' : 'border-emerald-500/20',
      tab: 'security'
    },
    {
      title: 'Performance Items',
      value: overview.performanceConcernsCount,
      sub: 'DOM loops & event listeners',
      icon: Sparkles,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      tab: 'performance'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Hero Info */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {analysis.projectName}
              </h1>
              {chromeExtension?.isExtension && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Chrome Extension MV{chromeExtension.manifestVersion || 3}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>Analyzed on {analysis.timestamp}</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <Lock className="w-3 h-3" /> 100% In-Browser AST Isolated
              </span>
            </p>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateTab('architecture')}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Explore Architecture Graph</span>
            </button>
            <button
              onClick={() => onNavigateTab('dom')}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>DOM Analyzer ({overview.domOperationsCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigateTab(stat.tab)}
              className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-indigo-500/40 cursor-pointer transition transform hover:-translate-y-0.5 group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-400">{stat.title}</span>
                <div className={`w-8 h-8 rounded-lg ${stat.bg} ${stat.border} border flex items-center justify-center ${stat.color} group-hover:scale-110 transition`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">{stat.value}</div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* AI Summary Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {viewMode === 'developer' ? 'Technical Architecture & Codebase Summary' : 'Plain English Project Summary'}
              </h2>
              <p className="text-xs text-slate-400">
                {viewMode === 'developer' ? 'Grounded in static AST analysis and dependency graphs' : 'Simplified non-technical overview'}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            {viewMode === 'developer' ? 'Developer Perspective' : 'Simple Perspective'}
          </span>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed">
          {viewMode === 'developer' ? aiProjectSummary.developerSummary : aiProjectSummary.simpleSummary}
        </p>

        {/* Highlights & Next Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Key Highlights */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Key Codebase Highlights
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {aiProjectSummary.keyHighlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Next Steps */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Recommended Reviews & Actions
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {aiProjectSummary.recommendedNextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Tech Stack & Languages Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Technologies Grid */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Detected Technology Stack
          </h2>

          <div className="space-y-4 text-xs">
            {techStack.frontend.length > 0 && (
              <div>
                <span className="text-slate-400 font-medium block mb-2">Frontend & UI:</span>
                <div className="flex flex-wrap gap-2">
                  {techStack.frontend.map((t, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                      {t}
                    </span>
                  ))}
                  {techStack.styling.map((s, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {techStack.backend.length > 0 && (
              <div>
                <span className="text-slate-400 font-medium block mb-2">Backend & Server:</span>
                <div className="flex flex-wrap gap-2">
                  {techStack.backend.map((t, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {techStack.databases.length > 0 && (
              <div>
                <span className="text-slate-400 font-medium block mb-2">Databases & ORM:</span>
                <div className="flex flex-wrap gap-2">
                  {techStack.databases.map((t, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {techStack.buildTools.length > 0 && (
              <div>
                <span className="text-slate-400 font-medium block mb-2">Tooling & Compiler:</span>
                <div className="flex flex-wrap gap-2">
                  {techStack.buildTools.map((t, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Languages Breakdown */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <Code2 className="w-4 h-4 text-cyan-400" />
              Language Breakdown
            </h2>

            {/* Visual Bar */}
            <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-800 mb-4">
              {techStack.languages.map((l, i) => {
                const colors = ['bg-indigo-500', 'bg-cyan-400', 'bg-blue-500', 'bg-purple-500', 'bg-emerald-400', 'bg-amber-400'];
                return (
                  <div
                    key={i}
                    style={{ width: `${Math.max(l.percentage, 5)}%` }}
                    className={`${colors[i % colors.length]}`}
                    title={`${l.name}: ${l.percentage}%`}
                  />
                );
              })}
            </div>

            <div className="space-y-2 text-xs">
              {techStack.languages.slice(0, 5).map((l, i) => (
                <div key={i} className="flex items-center justify-between text-slate-300">
                  <span className="font-medium">{l.name}</span>
                  <div className="space-x-3 text-slate-400 font-mono">
                    <span>{l.linesCount.toLocaleString()} lines</span>
                    <span className="font-bold text-white">{l.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Primary Language:</span>
            <span className="font-bold text-indigo-400">{techStack.primaryLanguage}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
