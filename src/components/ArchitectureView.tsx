import React, { useState } from 'react';
import {
  Layers,
  ArrowDown,
  ArrowRight,
  Database,
  Globe,
  Server,
  Code2,
  FileCode,
  Shield,
  Cpu,
  Boxes,
  Lock,
  Puzzle,
  Zap
} from 'lucide-react';
import { ArchitectureNode, FullProjectAnalysis } from '../types/analyzer';

interface ArchitectureViewProps {
  analysis: FullProjectAnalysis;
  onSelectFile?: (filePath: string) => void;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({
  analysis,
  onSelectFile
}) => {
  const { architecture, chromeExtension } = analysis;
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode | null>(architecture.nodes[0] || null);

  const getNodeIcon = (type: ArchitectureNode['type']) => {
    switch (type) {
      case 'client': return Globe;
      case 'frontend': return Boxes;
      case 'service': return Zap;
      case 'backend': return Server;
      case 'database': return Database;
      case 'extension': return Puzzle;
      default: return Code2;
    }
  };

  const getNodeGradient = (type: ArchitectureNode['type']) => {
    switch (type) {
      case 'client': return 'from-blue-600/20 to-indigo-600/20 border-blue-500/40 text-blue-300';
      case 'frontend': return 'from-indigo-600/20 to-purple-600/20 border-indigo-500/40 text-indigo-300';
      case 'service': return 'from-amber-600/20 to-orange-600/20 border-amber-500/40 text-amber-300';
      case 'backend': return 'from-purple-600/20 to-pink-600/20 border-purple-500/40 text-purple-300';
      case 'database': return 'from-emerald-600/20 to-teal-600/20 border-emerald-500/40 text-emerald-300';
      case 'extension': return 'from-cyan-600/20 to-blue-600/20 border-cyan-500/40 text-cyan-300';
      default: return 'from-slate-700/20 to-slate-800/20 border-slate-600 text-slate-300';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Project Architecture & System Topology</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Interactive relationship diagram showing how layers, runtime processes, and services communicate.
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg">
            {architecture.nodes.length} Tiers • {architecture.edges.length} Connection Channels
          </span>
        </div>
      </div>

      {/* Main Diagram Canvas & Node Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Architecture Flow Column */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-slate-800 flex flex-col items-center justify-center space-y-6 relative overflow-hidden min-h-[500px]">
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-25"></div>

          {architecture.nodes.map((node, index) => {
            const Icon = getNodeIcon(node.type);
            const isSelected = selectedNode?.id === node.id;
            const edge = architecture.edges.find(e => e.source === node.id);

            return (
              <React.Fragment key={node.id}>
                {/* Node Box */}
                <div
                  onClick={() => setSelectedNode(node)}
                  className={`w-full max-w-md p-5 rounded-2xl border bg-gradient-to-r cursor-pointer transition transform hover:scale-[1.02] shadow-xl relative z-10 ${getNodeGradient(
                    node.type
                  )} ${isSelected ? 'ring-2 ring-indigo-400 shadow-indigo-500/20' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-center text-white">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">{node.label}</h3>
                        <p className="text-[11px] text-slate-300">{node.sublabel}</p>
                      </div>
                    </div>
                    {node.fileCount > 0 && (
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-900/80 text-slate-200 border border-white/10 rounded-md">
                        {node.fileCount} file(s)
                      </span>
                    )}
                  </div>

                  {/* Tech Tags */}
                  {node.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-white/10 text-[10px]">
                      {node.technologies.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-900/60 text-slate-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Connecting Edge Arrow */}
                {index < architecture.nodes.length - 1 && (
                  <div className="flex flex-col items-center text-indigo-400 text-xs py-1 space-y-1 z-10">
                    <div className="w-0.5 h-6 bg-indigo-500/40"></div>
                    {edge?.label && (
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-900 border border-slate-700 text-indigo-300 rounded-full">
                        {edge.label}
                      </span>
                    )}
                    <ArrowDown className="w-4 h-4 text-indigo-400 animate-pulse" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Selected Tier Inspector */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              Tier Inspector
            </span>
            <h2 className="text-lg font-bold text-white mt-1">
              {selectedNode ? selectedNode.label : 'Select an Architecture Tier'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {selectedNode?.sublabel}
            </p>
          </div>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              {/* Technologies */}
              <div>
                <span className="text-slate-400 font-medium block mb-2">Technologies in Tier:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.technologies.map((t, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Related Files */}
              <div>
                <span className="text-slate-400 font-medium block mb-2">
                  Sample Files in this Layer ({selectedNode.files.length}):
                </span>
                {selectedNode.files.length === 0 ? (
                  <p className="text-slate-500 text-xs italic">Runtime external environment</p>
                ) : (
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {selectedNode.files.map((file, i) => (
                      <div
                        key={i}
                        onClick={() => onSelectFile?.(file)}
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px] hover:border-indigo-500/50 hover:text-white cursor-pointer transition flex items-center justify-between"
                      >
                        <span className="truncate">{file}</span>
                        <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Click on any architecture box to inspect its components.</p>
          )}
        </div>
      </div>
    </div>
  );
};
