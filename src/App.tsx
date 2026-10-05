import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  FileTreeNode,
  FullProjectAnalysis,
  ProjectFile
} from './types/analyzer';
import {
  extractZipFiles,
  performDeepAnalysis,
  performPrivacyScan,
  ScanProgress
} from './services/projectAnalyzer';
import { SampleProject } from './services/sampleProjects';

// UI Components
import { Navbar } from './components/Navbar';
import { UploadZone } from './components/UploadZone';
import { PrivacyReviewModal } from './components/PrivacyReviewModal';
import { DashboardView } from './components/DashboardView';
import { ArchitectureView } from './components/ArchitectureView';
import { FileExplorerView } from './components/FileExplorerView';
import { DomAnalysisView } from './components/DomAnalysisView';
import { ApiAnalysisView } from './components/ApiAnalysisView';
import { DependenciesView } from './components/DependenciesView';
import { SecurityView } from './components/SecurityView';
import { PerformanceView } from './components/PerformanceView';
import { DataFlowView } from './components/DataFlowView';
import { PrivacyAuditView } from './components/PrivacyAuditView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { ExportModal } from './components/ExportModal';
import { ExecutiveReportModal } from './components/ExecutiveReportModal';
import { PrivacyExplanationModal } from './components/PrivacyExplanationModal';

export function App() {
  // Main Analysis State
  const [analysis, setAnalysis] = useState<FullProjectAnalysis | null>(null);
  const [preScanData, setPreScanData] = useState<{
    projectName: string;
    projectFiles: ProjectFile[];
    fileTree: FileTreeNode;
    privacyReport: FullProjectAnalysis['privacyReport'];
  } | null>(null);

  // Loading & Progress States
  const [isScanning, setIsScanning] = useState(false);
  const [isDeepAnalyzing, setIsDeepAnalyzing] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState<ScanProgress | null>(null);

  // Navigation & View States
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedFilePath, setSelectedFilePath] = useState<string>('');
  const [viewMode, setViewMode] = useState<'developer' | 'simple'>('developer');

  // Modal Dialogs
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExecutiveReportOpen, setIsExecutiveReportOpen] = useState(false);
  const [isPrivacyGuideOpen, setIsPrivacyGuideOpen] = useState(false);

  // 1. Handle ZIP File Upload
  const handleZipSelected = async (file: File) => {
    try {
      setIsScanning(true);
      setScanStatus(`Decompressing ${file.name}...`);
      const rawFiles = await extractZipFiles(file, (msg) => setScanStatus(msg));

      setScanStatus('Running local privacy and secret classifier...');
      const projectName = file.name.replace(/\.zip$/i, '');
      const preScan = performPrivacyScan(rawFiles, projectName);

      setPreScanData(preScan);
      setIsScanning(false);
      setIsReviewModalOpen(true);
    } catch (err: any) {
      setIsScanning(false);
      alert(`Could not extract ZIP: ${err.message || 'Unknown error'}`);
    }
  };

  // 2. Handle Folder Upload
  const handleFolderSelected = async (files: FileList) => {
    try {
      setIsScanning(true);
      setScanStatus('Reading directory structure in browser memory...');
      const rawFiles: { path: string; size: number; content?: string }[] = [];

      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const path = (f as any).webkitRelativePath || f.name;

        // Skip massive files
        if (f.size > 15 * 1024 * 1024) continue;

        let content: string | undefined = undefined;
        const isText = /\.(js|jsx|ts|tsx|html|htm|css|scss|json|md|py|java|go|rs|php|rb|sql|yaml|yml|toml|txt|env.*|config.*)$/i.test(path) ||
          ['manifest.json', 'package.json', 'Dockerfile'].some(n => path.endsWith(n));

        if (isText && f.size < 5 * 1024 * 1024) {
          try {
            content = await f.text();
          } catch {
            // ignore
          }
        }

        rawFiles.push({ path, size: f.size, content });
      }

      setScanStatus('Classifying sensitive files and redacting secrets...');
      const rootDirName = rawFiles[0]?.path.split('/')[0] || 'Project Folder';
      const preScan = performPrivacyScan(rawFiles, rootDirName);

      setPreScanData(preScan);
      setIsScanning(false);
      setIsReviewModalOpen(true);
    } catch (err: any) {
      setIsScanning(false);
      alert(`Could not read folder: ${err.message || 'Unknown error'}`);
    }
  };

  // 3. Handle Sample Project Selection
  const handleSampleSelected = (sample: SampleProject) => {
    setIsScanning(true);
    setScanStatus(`Loading ${sample.name}...`);
    setTimeout(() => {
      const preScan = performPrivacyScan(sample.files, sample.name);
      setPreScanData(preScan);
      setIsScanning(false);
      setIsReviewModalOpen(true);
    }, 400);
  };

  // 4. Confirm Privacy Review & Execute Deep AST Analysis
  const handleConfirmAnalyze = async () => {
    if (!preScanData) return;
    setIsReviewModalOpen(false);
    setIsDeepAnalyzing(true);

    try {
      const fullAnalysis = await performDeepAnalysis(
        preScanData.projectName,
        preScanData.projectFiles,
        preScanData.fileTree,
        preScanData.privacyReport,
        (progress) => {
          setAnalysisProgress(progress);
        }
      );

      setAnalysis(fullAnalysis);
      setIsDeepAnalyzing(false);
      setActiveTab('dashboard');

      // Celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    } catch (err: any) {
      setIsDeepAnalyzing(false);
      alert(`Analysis failed: ${err.message || 'Unknown error'}`);
    }
  };

  // Reset Session
  const handleReset = () => {
    setAnalysis(null);
    setPreScanData(null);
    setSelectedFilePath('');
    setActiveTab('dashboard');
  };

  const handleSelectFileAndNavigate = (filePath: string) => {
    setSelectedFilePath(filePath);
    setActiveTab('explorer');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        analysis={analysis}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onReset={handleReset}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenExecutiveReport={() => setIsExecutiveReportOpen(true)}
        onOpenPrivacyGuide={() => setIsPrivacyGuideOpen(true)}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(prev => prev === 'developer' ? 'simple' : 'developer')}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading Overlay for Deep AST Analysis */}
        {isDeepAnalyzing && (
          <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-6 max-w-lg mx-auto my-16 shadow-2xl animate-fadeIn">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-cyan-500/20 border-b-cyan-400 animate-spin animation-reverse"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Extracting Code Architecture...</h3>
              <p className="text-xs text-indigo-300 font-mono">
                {analysisProgress?.stage || 'Parsing Abstract Syntax Trees (Babel AST)...'}
              </p>
            </div>

            {/* Progress Bar */}
            {analysisProgress && (
              <div className="space-y-1.5 pt-2">
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full transition-all duration-200"
                    style={{ width: `${analysisProgress.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>{analysisProgress.current} / {analysisProgress.total} files</span>
                  <span>{analysisProgress.percentage}%</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* State 1: Upload Dropzone (When no analysis loaded) */}
        {!analysis && !isDeepAnalyzing && (
          <UploadZone
            onZipSelected={handleZipSelected}
            onFolderSelected={handleFolderSelected}
            onSampleSelected={handleSampleSelected}
            isScanning={isScanning}
            scanStatus={scanStatus}
          />
        )}

        {/* State 2: Analyzed Dashboard Views */}
        {analysis && !isDeepAnalyzing && (
          <div>
            {activeTab === 'dashboard' && (
              <DashboardView
                analysis={analysis}
                onNavigateTab={(tab) => setActiveTab(tab)}
                viewMode={viewMode}
              />
            )}

            {activeTab === 'architecture' && (
              <ArchitectureView
                analysis={analysis}
                onSelectFile={handleSelectFileAndNavigate}
              />
            )}

            {activeTab === 'explorer' && (
              <FileExplorerView
                analysis={analysis}
                selectedFilePath={selectedFilePath}
                onSelectFile={(path) => setSelectedFilePath(path)}
                viewMode={viewMode}
              />
            )}

            {activeTab === 'dom' && (
              <DomAnalysisView
                analysis={analysis}
                onSelectFile={handleSelectFileAndNavigate}
              />
            )}

            {activeTab === 'apis' && (
              <ApiAnalysisView
                analysis={analysis}
                onSelectFile={handleSelectFileAndNavigate}
              />
            )}

            {activeTab === 'dependencies' && (
              <DependenciesView
                analysis={analysis}
                onSelectFile={handleSelectFileAndNavigate}
              />
            )}

            {activeTab === 'security' && (
              <SecurityView
                analysis={analysis}
                onSelectFile={handleSelectFileAndNavigate}
              />
            )}

            {activeTab === 'performance' && (
              <PerformanceView
                analysis={analysis}
                onSelectFile={handleSelectFileAndNavigate}
              />
            )}

            {activeTab === 'dataflow' && (
              <DataFlowView
                analysis={analysis}
              />
            )}

            {activeTab === 'privacy' && (
              <PrivacyAuditView
                analysis={analysis}
              />
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {isReviewModalOpen && preScanData && (
        <PrivacyReviewModal
          projectName={preScanData.projectName}
          projectFiles={preScanData.projectFiles}
          privacySummary={{
            total: preScanData.privacyReport.totalDetectedFiles,
            safe: preScanData.privacyReport.analyzedFilesCount,
            sensitive: preScanData.privacyReport.sensitiveFilesBlockedCount,
            ignored: preScanData.privacyReport.ignoredFilesCount,
            binary: preScanData.privacyReport.binaryFilesCount,
            secretsRedacted: preScanData.privacyReport.secretsRedactedCount
          }}
          onConfirmAnalyze={handleConfirmAnalyze}
          onCancel={() => {
            setIsReviewModalOpen(false);
            setPreScanData(null);
          }}
        />
      )}

      {analysis && (
        <>
          <GlobalSearchModal
            analysis={analysis}
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            onNavigateToFile={handleSelectFileAndNavigate}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />

          <ExecutiveReportModal
            analysis={analysis}
            isOpen={isExecutiveReportOpen}
            onClose={() => setIsExecutiveReportOpen(false)}
          />

          <ExportModal
            analysis={analysis}
            isOpen={isExportOpen}
            onClose={() => setIsExportOpen(false)}
          />
        </>
      )}

      <PrivacyExplanationModal
        isOpen={isPrivacyGuideOpen}
        onClose={() => setIsPrivacyGuideOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CodeXRay — Privacy-First Full Website & Codebase Architecture Analyzer</span>
          <span className="text-slate-400">100% In-Browser AST Processing • Zero Cloud Persistence</span>
        </div>
      </footer>
    </div>
  );
}
export default App;
