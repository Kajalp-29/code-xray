import React, { useState } from 'react';
import {
  Globe,
  Server,
  Database,
  Lock,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Search
} from 'lucide-react';
import { FullProjectAnalysis } from '../types/analyzer';

interface ApiAnalysisViewProps {
  analysis: FullProjectAnalysis;
  onSelectFile?: (filePath: string) => void;
}

export const ApiAnalysisView: React.FC<ApiAnalysisViewProps> = ({ analysis, onSelectFile }) => {
  const { apiCalls, backendRoutes, databaseOperations } = analysis;
  const [activeTab, setActiveTab] = useState<'client_apis' | 'backend_routes' | 'databases'>('client_apis');
  const [searchTerm, setSearchTerm] = useState('');

  const getMethodBadge = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'POST': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'PUT': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'DELETE': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'WS': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'GQL': return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-400" />
            <span>APIs, Backend Architecture & Database Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audits asynchronous network requests, backend endpoints, middleware pipelines, and database queries.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 font-semibold">
            {apiCalls.length} Client API Calls
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
            {backendRoutes.length} Routes
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
            {databaseOperations.length} DB Ops
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3 text-xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('client_apis')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition ${
              activeTab === 'client_apis'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Client Network Requests ({apiCalls.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('backend_routes')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition ${
              activeTab === 'backend_routes'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Backend Route Handlers ({backendRoutes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('databases')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition ${
              activeTab === 'databases'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Database Operations ({databaseOperations.length})</span>
          </button>
        </div>

        <div className="relative shrink-0 w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search endpoints, tables, files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Tab 1: Client API Requests */}
      {activeTab === 'client_apis' && (
        <div className="space-y-4">
          {apiCalls.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center text-slate-500 text-sm">
              No client-side fetch or axios network calls detected.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {apiCalls
                .filter(a => !searchTerm || a.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) || a.file.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((call, idx) => (
                  <div
                    key={idx}
                    className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-purple-500/40 space-y-3 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-xs ${getMethodBadge(call.method)}`}>
                          {call.method}
                        </span>
                        <span className="font-mono font-bold text-white text-sm truncate">
                          {call.endpoint}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {call.clientType}
                        </span>
                      </div>

                      <div
                        onClick={() => onSelectFile?.(call.file)}
                        className="flex items-center space-x-1.5 text-xs font-mono text-slate-400 hover:text-indigo-400 cursor-pointer"
                      >
                        <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{call.file}:{call.line}</span>
                      </div>
                    </div>

                    {call.domain && (
                      <p className="text-xs text-slate-300">
                        External Destination Domain: <strong className="text-indigo-400 font-mono">{call.domain}</strong>
                      </p>
                    )}

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-300 overflow-x-auto">
                      {call.codeSnippet}
                    </div>

                    {call.headersRedacted && (
                      <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400">
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Authorization headers detected and redacted for privacy: <code className="text-slate-300 font-mono">Bearer [REDACTED]</code></span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Backend Routes */}
      {activeTab === 'backend_routes' && (
        <div className="space-y-4">
          {backendRoutes.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center text-slate-500 text-sm">
              No backend route definitions detected in source files (e.g. Express, Fastify, Next.js API).
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {backendRoutes
                .filter(r => !searchTerm || r.path.toLowerCase().includes(searchTerm.toLowerCase()) || r.file.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((route, idx) => (
                  <div
                    key={idx}
                    className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 space-y-3 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-xs ${getMethodBadge(route.method)}`}>
                          {route.method}
                        </span>
                        <span className="font-mono font-bold text-white text-sm">
                          {route.path}
                        </span>
                      </div>

                      <div
                        onClick={() => onSelectFile?.(route.file)}
                        className="flex items-center space-x-1.5 text-xs font-mono text-slate-400 hover:text-indigo-400 cursor-pointer"
                      >
                        <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{route.file}:{route.line}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {route.authRequired ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-semibold">
                          <Lock className="w-3 h-3" /> Auth Guarded
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          Public Endpoint
                        </span>
                      )}

                      {route.middleware.map((mw, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                          {mw}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Database Operations */}
      {activeTab === 'databases' && (
        <div className="space-y-4">
          {databaseOperations.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center text-slate-500 text-sm">
              No direct database queries or ORM models detected.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {databaseOperations
                .filter(d => !searchTerm || d.collectionOrTable.toLowerCase().includes(searchTerm.toLowerCase()) || d.file.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((db, idx) => (
                  <div
                    key={idx}
                    className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/40 space-y-3 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center space-x-3">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-xs">
                          {db.databaseType}
                        </span>
                        <span className="font-mono font-bold text-white text-sm">
                          {db.collectionOrTable} • {db.operation}
                        </span>
                      </div>

                      <div
                        onClick={() => onSelectFile?.(db.file)}
                        className="flex items-center space-x-1.5 text-xs font-mono text-slate-400 hover:text-indigo-400 cursor-pointer"
                      >
                        <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{db.file}:{db.line}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-300 overflow-x-auto">
                      {db.codeSnippet}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
