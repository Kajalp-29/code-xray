import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileCheck,
  FileX,
  FileMinus,
  Search,
  ChevronRight,
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { FileTreeNode, FullProjectAnalysis, ProjectFile } from '../types/analyzer';
import { FileDetailView } from './FileDetailView';

interface FileExplorerViewProps {
  analysis: FullProjectAnalysis;
  selectedFilePath?: string;
  onSelectFile?: (path: string) => void;
  viewMode: 'developer' | 'simple';
}

export const FileExplorerView: React.FC<FileExplorerViewProps> = ({
  analysis,
  selectedFilePath,
  onSelectFile,
  viewMode
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'SAFE' | 'SENSITIVE'>('SAFE');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'src': true,
    'src/components': true,
    'server': true
  });

  // Find currently selected file
  const firstSafeFile = Object.keys(analysis.files)[0];
  const currentPath = selectedFilePath || firstSafeFile;
  const currentAnalysis = analysis.files[currentPath];

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  // Render tree node recursively
  const renderNode = (node: FileTreeNode, depth = 0): React.ReactNode => {
    if (node.name === 'root') {
      return node.children?.map(child => renderNode(child, 0));
    }

    const isDir = node.type === 'directory';
    const isExpanded = expandedFolders[node.path] ?? true;

    // Filter by search
    if (searchTerm) {
      const matchesSearch = node.path.toLowerCase().includes(searchTerm.toLowerCase());
      if (!isDir && !matchesSearch) return null;
    }

    // Filter by classification
    if (!isDir && filterType !== 'ALL' && node.classification !== filterType) {
      return null;
    }

    if (isDir) {
      return (
        <div key={node.path} className="select-none text-xs">
          <div
            onClick={() => toggleFolder(node.path)}
            style={{ paddingLeft: `${depth * 14 + 8}px` }}
            className="flex items-center space-x-1.5 py-1.5 px-2 rounded-lg hover:bg-slate-800/80 cursor-pointer text-slate-300 font-medium transition"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
            {isExpanded ? <FolderOpen className="w-4 h-4 text-indigo-400" /> : <Folder className="w-4 h-4 text-indigo-400" />}
            <span className="truncate">{node.name}</span>
          </div>

          {isExpanded && node.children && (
            <div className="space-y-0.5">
              {node.children.map(child => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // File node
    const isSelected = currentPath === node.path;
    const isAnalyzed = !!analysis.files[node.path];

    return (
      <div
        key={node.path}
        onClick={() => {
          if (isAnalyzed) {
            onSelectFile?.(node.path);
          }
        }}
        style={{ paddingLeft: `${depth * 14 + 22}px` }}
        className={`flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer text-xs font-mono transition ${
          isSelected
            ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
            : isAnalyzed
            ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            : 'text-slate-500 cursor-not-allowed opacity-60'
        }`}
      >
        <div className="flex items-center space-x-2 truncate">
          {node.classification === 'SAFE' && <FileCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
          {node.classification === 'SENSITIVE' && <FileX className="w-3.5 h-3.5 text-red-400 shrink-0" />}
          {node.classification === 'IGNORED' && <FileMinus className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
          <span className="truncate">{node.name}</span>
        </div>

        {node.fileData?.lines ? (
          <span className="text-[10px] text-slate-500 shrink-0 ml-1">{node.fileData.lines}L</span>
        ) : null}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Sidebar: File Tree */}
        <div className="glass-panel p-4 rounded-3xl border border-slate-800 space-y-4 max-h-[750px] flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Project File Tree</span>
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
              {Object.keys(analysis.files).length} Analyzed
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Classification Filters */}
          <div className="flex items-center space-x-1 text-[11px]">
            <button
              onClick={() => setFilterType('SAFE')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filterType === 'SAFE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Safe ({Object.keys(analysis.files).length})
            </button>
            <button
              onClick={() => setFilterType('SENSITIVE')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filterType === 'SENSITIVE' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Blocked ({analysis.privacyReport.sensitiveFilesBlockedCount})
            </button>
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filterType === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
          </div>

          {/* Scrollable Tree */}
          <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 max-h-[550px]">
            {renderNode(analysis.fileTree)}
          </div>
        </div>

        {/* Right Detail: File Deep Dive */}
        <div className="lg:col-span-2">
          {currentAnalysis ? (
            <FileDetailView analysis={currentAnalysis} viewMode={viewMode} />
          ) : (
            <div className="glass-panel rounded-3xl border border-slate-800 p-12 text-center text-slate-500">
              Select an analyzed file from the tree to inspect its AST, functions, DOM usage, and code.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
