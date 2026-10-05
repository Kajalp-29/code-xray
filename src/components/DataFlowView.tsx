import React, { useState } from 'react';
import {
  Layers,
  ArrowRight,
  MousePointer,
  Boxes,
  Zap,
  Globe,
  Server,
  Database,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { DataFlowStep, FullProjectAnalysis } from '../types/analyzer';

interface DataFlowViewProps {
  analysis: FullProjectAnalysis;
}

export const DataFlowView: React.FC<DataFlowViewProps> = ({ analysis }) => {
  const { dataFlows } = analysis;
  const [selectedFlowId, setSelectedFlowId] = useState<string>(dataFlows[0]?.id || '');

  const currentFlow = dataFlows.find(f => f.id === selectedFlowId) || dataFlows[0];

  const getStageIcon = (stage: DataFlowStep['stage']) => {
    switch (stage) {
      case 'User Action': return MousePointer;
      case 'UI Component': return Boxes;
      case 'State/Store': return Zap;
      case 'Service/Hook': return Layers;
      case 'API Call': return Globe;
      case 'Backend Route': return Server;
      case 'Database': return Database;
      case 'Response': return RefreshCw;
      case 'UI Update': return CheckCircle2;
      default: return Layers;
    }
  };

  const getStageColor = (stage: DataFlowStep['stage']) => {
    switch (stage) {
      case 'User Action': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'UI Component': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
      case 'State/Store': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Service/Hook': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'API Call': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'Backend Route': return 'text-pink-400 bg-pink-500/10 border-pink-500/30';
      case 'Database': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Response': return 'text-teal-400 bg-teal-500/10 border-teal-500/30';
      case 'UI Update': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      default: return 'text-slate-300 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>End-to-End Data Flow Tracing</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visualizes where data originates, transforms across state stores and services, queries backend endpoints, and commits to UI re-renders.
          </p>
        </div>
      </div>

      {/* Flow Selector */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 text-xs">
        {dataFlows.map(flow => (
          <button
            key={flow.id}
            onClick={() => setSelectedFlowId(flow.id)}
            className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition ${
              currentFlow?.id === flow.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {flow.name}
          </button>
        ))}
      </div>

      {/* Flow Details & Step Sequence */}
      {currentFlow && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-8">
          <div>
            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-bold">
              Active Flow Path
            </span>
            <h2 className="text-lg font-bold text-white mt-1">{currentFlow.name}</h2>
            <p className="text-xs text-slate-400 mt-1">{currentFlow.description}</p>
          </div>

          {/* Stepper Timeline */}
          <div className="relative pl-6 sm:pl-8 border-l-2 border-indigo-500/30 space-y-8 my-4">
            {currentFlow.steps.map((step, index) => {
              const Icon = getStageIcon(step.stage);
              const colorClass = getStageColor(step.stage);

              return (
                <div key={step.id} className="relative group">
                  {/* Step Bubble */}
                  <div className={`absolute -left-[35px] sm:-left-[43px] top-0 w-8 h-8 rounded-full ${colorClass} border flex items-center justify-center font-bold text-xs shadow-lg group-hover:scale-110 transition`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${colorClass}`}>
                          Step {index + 1}: {step.stage}
                        </span>
                        <h3 className="font-bold text-white text-sm">{step.label}</h3>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{step.details}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
