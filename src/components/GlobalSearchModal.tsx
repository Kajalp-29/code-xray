import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  FileCode,
  Cpu,
  Terminal,
  Globe,
  ShieldAlert,
  ArrowRight,
  X
} from 'lucide-react';
import { FullProjectAnalysis } from '../types/analyzer';

interface GlobalSearchModalProps {
  analysis: FullProjectAnalysis;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToFile: (filePath: string) => void;
  onNavigateToTab: (tab: string) => void;
}

interface SearchResultItem {
  id: string;
  type: 'file' | 'function' | 'dom' | 'api' | 'security';
  title: string;
  subtitle: string;
  file?: string;
  tab: string;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  analysis,
  isOpen,
  onClose,
  onNavigateToFile,
  onNavigateToTab
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // Toggle or open search
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results: SearchResultItem[] = [];
  const q = query.trim().toLowerCase();

  if (q) {
    // 1. Search Files
    Object.entries(analysis.files).forEach(([path, fileRes]) => {
      if (path.toLowerCase().includes(q) || fileRes.file.name.toLowerCase().includes(q)) {
        results.push({
          id: `file_${path}`,
          type: 'file',
          title: fileRes.file.name,
          subtitle: path,
          file: path,
          tab: 'explorer'
        });
      }

      // 2. Search Functions
      fileRes.functions.forEach(fn => {
        if (fn.name.toLowerCase().includes(q) || fn.params.some(p => p.toLowerCase().includes(q))) {
          results.push({
            id: `fn_${path}_${fn.name}`,
            type: 'function',
            title: `${fn.name}()`,
            subtitle: `Function in ${path} (Line ${fn.line})`,
            file: path,
            tab: 'explorer'
          });
        }
      });
    });

    // 3. Search DOM Operations & Selectors
    analysis.domStats.operations.forEach(dom => {
      if (dom.api.toLowerCase().includes(q) || dom.selector?.toLowerCase().includes(q) || dom.inferredTarget?.toLowerCase().includes(q)) {
        results.push({
          id: `dom_${dom.file}_${dom.line}`,
          type: 'dom',
          title: dom.selector ? `${dom.api} -> ${dom.selector}` : dom.api,
          subtitle: `DOM operation in ${dom.file} (Line ${dom.line})`,
          file: dom.file,
          tab: 'dom'
        });
      }
    });

    // 4. Search APIs & Endpoints
    analysis.apiCalls.forEach(api => {
      if (api.endpoint.toLowerCase().includes(q) || api.method.toLowerCase().includes(q) || api.domain?.toLowerCase().includes(q)) {
        results.push({
          id: `api_${api.file}_${api.line}`,
          type: 'api',
          title: `${api.method} ${api.endpoint}`,
          subtitle: `API call in ${api.file} (Line ${api.line})`,
          file: api.file,
          tab: 'apis'
        });
      }
    });

    // 5. Search Security Findings
    analysis.securityConcerns.forEach(sec => {
      if (sec.title.toLowerCase().includes(q) || sec.reason.toLowerCase().includes(q)) {
        results.push({
          id: `sec_${sec.id}`,
          type: 'security',
          title: `[${sec.severity}] ${sec.title}`,
          subtitle: `${sec.file}:${sec.line} - ${sec.reason.slice(0, 70)}...`,
          file: sec.file,
          tab: 'security'
        });
      }
    });
  }

  const handleSelect = (item: SearchResultItem) => {
    if (item.file) {
      onNavigateToFile(item.file);
    }
    onNavigateToTab(item.tab);
    onClose();
  };

  const getTypeIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'file': return FileCode;
      case 'function': return Cpu;
      case 'dom': return Terminal;
      case 'api': return Globe;
      case 'security': return ShieldAlert;
      default: return Search;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center space-x-3">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search files, functions, DOM selectors, endpoints, security..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none placeholder-slate-500"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">ESC to close</kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 max-h-96">
          {!query ? (
            <div className="p-8 text-center text-xs text-slate-500 space-y-2">
              <p>Type keywords to search anywhere across the analyzed codebase.</p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span onClick={() => setQuery('querySelector')} className="px-2 py-1 bg-slate-800 rounded-md text-slate-300 font-mono cursor-pointer hover:text-indigo-300">querySelector</span>
                <span onClick={() => setQuery('fetch')} className="px-2 py-1 bg-slate-800 rounded-md text-slate-300 font-mono cursor-pointer hover:text-indigo-300">fetch</span>
                <span onClick={() => setQuery('login')} className="px-2 py-1 bg-slate-800 rounded-md text-slate-300 font-mono cursor-pointer hover:text-indigo-300">login</span>
                <span onClick={() => setQuery('secret')} className="px-2 py-1 bg-slate-800 rounded-md text-slate-300 font-mono cursor-pointer hover:text-indigo-300">secret</span>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching files, functions, DOM APIs, or security findings found for "{query}".
            </div>
          ) : (
            results.slice(0, 30).map((res) => {
              const Icon = getTypeIcon(res.type);
              return (
                <div
                  key={res.id}
                  onClick={() => handleSelect(res)}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-800/60 cursor-pointer transition flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <h4 className="font-semibold text-white text-xs font-mono group-hover:text-indigo-300 transition truncate">
                        {res.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{res.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase bg-slate-800 text-slate-400">
                      {res.type}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
