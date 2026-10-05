import { jsPDF } from 'jspdf';
import { FullProjectAnalysis } from '../types/analyzer';

/**
 * Generate comprehensive Markdown report with diagrams, tables, and file-by-file AST breakdowns
 */
export function generateMarkdownReport(analysis: FullProjectAnalysis): string {
  const {
    projectName,
    timestamp,
    overview,
    techStack,
    domStats,
    apiCalls,
    backendRoutes,
    databaseOperations,
    securityConcerns,
    performanceConcerns,
    dependencies,
    dataFlows,
    privacyReport,
    aiProjectSummary,
    files
  } = analysis;

  let md = `# Codebase Architecture & Technical Analysis Report: ${projectName}\n\n`;
  md += `> **Audit Generated On:** ${timestamp}  \n`;
  md += `> **Privacy Isolation Mode:** 100% Client-Side In-Browser (Zero Cloud Source Upload)  \n`;
  md += `> **Primary Language:** ${techStack.primaryLanguage} | **Total LOC:** ${overview.linesOfCode.toLocaleString()}  \n\n`;

  md += `## Table of Contents\n\n`;
  md += `1. [Executive Summary & Telemetry](#1-executive-summary--telemetry)\n`;
  md += `2. [Technology Stack & Ecosystem](#2-technology-stack--ecosystem)\n`;
  md += `3. [Architecture & System Topology](#3-architecture--system-topology)\n`;
  md += `4. [DOM APIs & Container Analysis](#4-dom-apis--container-analysis)\n`;
  md += `5. [APIs, Backend Routes & Databases](#5-apis-backend-routes--databases)\n`;
  md += `6. [Dependency Audit & Unused Package Detection](#6-dependency-audit--unused-package-detection)\n`;
  md += `7. [Security Findings & Vulnerability Review](#7-security-findings--vulnerability-review)\n`;
  md += `8. [Performance Findings & Optimization](#8-performance-findings--optimization)\n`;
  md += `9. [Data Flow Traces](#9-data-flow-traces)\n`;
  md += `10. [Detailed File-By-File Deep Dive](#10-detailed-file-by-file-deep-dive)\n`;
  md += `11. [Privacy & Secret Redaction Audit Certification](#11-privacy--secret-redaction-audit-certification)\n\n`;

  md += `---\n\n`;

  // 1. Executive Summary
  md += `## 1. Executive Summary & Telemetry\n\n`;
  md += `### Technical Summary\n${aiProjectSummary.developerSummary}\n\n`;
  md += `### Plain English Overview\n${aiProjectSummary.simpleSummary}\n\n`;

  md += `### Telemetry Metrics\n\n`;
  md += `| Telemetry Metric | Count |\n| :--- | :--- |\n`;
  md += `| **Total Detected Files** | ${overview.totalFiles} |\n`;
  md += `| **Safe Source Files Analyzed** | ${overview.analyzedFiles} |\n`;
  md += `| **Sensitive Files Blocked** | ${privacyReport.sensitiveFilesBlockedCount} |\n`;
  md += `| **Build/Artifact Files Ignored** | ${privacyReport.ignoredFilesCount} |\n`;
  md += `| **Lines of Code (LOC)** | ${overview.linesOfCode.toLocaleString()} |\n`;
  md += `| **Functions & Methods** | ${overview.functionsCount} |\n`;
  md += `| **UI Components Detected** | ${overview.componentsCount} |\n`;
  md += `| **Classes Detected** | ${overview.classesCount} |\n`;
  md += `| **DOM Operations** | ${overview.domOperationsCount} |\n`;
  md += `| **API & Network Integration Points** | ${overview.apiCallsCount} |\n`;
  md += `| **Backend Route Handlers** | ${backendRoutes.length} |\n`;
  md += `| **Database Operations** | ${databaseOperations.length} |\n`;
  md += `| **Security Concerns Flagged** | ${overview.securityConcernsCount} |\n`;
  md += `| **Performance Concerns Flagged** | ${overview.performanceConcernsCount} |\n\n`;

  md += `### Key Highlights\n`;
  aiProjectSummary.keyHighlights.forEach(h => md += `- ${h}\n`);
  md += `\n`;

  // 2. Tech Stack
  md += `## 2. Technology Stack & Ecosystem\n\n`;
  md += `* **Primary Language:** ${techStack.primaryLanguage}\n`;
  md += `* **Frontend Frameworks:** ${techStack.frontend.join(', ') || 'Vanilla Web Standards'}\n`;
  md += `* **Backend Frameworks:** ${techStack.backend.join(', ') || 'None detected'}\n`;
  md += `* **Databases & ORMs:** ${techStack.databases.join(', ') || 'None detected'}\n`;
  md += `* **Styling & UI:** ${techStack.styling.join(', ') || 'CSS'}\n`;
  md += `* **Build & Tooling:** ${techStack.buildTools.join(', ') || 'Standard'}\n`;
  md += `* **Testing Tools:** ${techStack.testing.join(', ') || 'None detected'}\n\n`;

  md += `### Language Distribution\n\n`;
  md += `| Language | Files | Source Lines | Percentage |\n| :--- | :--- | :--- | :--- |\n`;
  techStack.languages.forEach(l => {
    md += `| **${l.name}** | ${l.filesCount} | ${l.linesCount.toLocaleString()} | ${l.percentage}% |\n`;
  });
  md += `\n`;

  // 3. Architecture
  md += `## 3. Architecture & System Topology\n\n`;
  md += `${aiProjectSummary.architectureOverview}\n\n`;
  md += `### Architecture Tiers\n\n`;
  analysis.architecture.nodes.forEach(node => {
    md += `#### ${node.label} (${node.sublabel})\n`;
    md += `* **Tier Type:** \`${node.type}\`\n`;
    md += `* **Technologies:** ${node.technologies.join(', ') || 'Standard'}\n`;
    if (node.files.length > 0) {
      md += `* **Key Files:** ${node.files.slice(0, 5).map(f => `\`${f}\``).join(', ')}\n`;
    }
    md += `\n`;
  });

  // 4. DOM Analysis
  md += `## 4. DOM APIs & Container Analysis\n\n`;
  md += `* **Total Direct DOM Operations:** ${domStats.totalOperations}\n`;
  md += `* **Most Active DOM File:** \`${domStats.mostUsedFile}\`\n\n`;

  md += `### DOM API Frequency\n\n`;
  md += `| DOM API Call | Total Invocations |\n| :--- | :--- |\n`;
  Object.entries(domStats.apiBreakdown).sort((a, b) => b[1] - a[1]).forEach(([api, count]) => {
    md += `| \`${api}\` | ${count} |\n`;
  });
  md += `\n`;

  if (Object.keys(domStats.eventsBreakdown).length > 0) {
    md += `### Event System Listeners\n\n`;
    md += `| Event Type | Active Listeners |\n| :--- | :--- |\n`;
    Object.entries(domStats.eventsBreakdown).forEach(([evt, count]) => {
      md += `| \`${evt}\` | ${count} |\n`;
    });
    md += `\n`;
  }

  // 5. APIs & Backend
  md += `## 5. APIs, Backend Routes & Databases\n\n`;
  if (apiCalls.length > 0) {
    md += `### Client-Side Network Calls (${apiCalls.length})\n\n`;
    md += `| Method | Endpoint | Client | File | Line |\n| :--- | :--- | :--- | :--- | :--- |\n`;
    apiCalls.forEach(call => {
      md += `| \`${call.method}\` | \`${call.endpoint}\` | ${call.clientType} | \`${call.file}\` | ${call.line} |\n`;
    });
    md += `\n`;
  }

  if (backendRoutes.length > 0) {
    md += `### Backend Route Handlers (${backendRoutes.length})\n\n`;
    md += `| Method | Route Path | Auth Guard | Middleware | File |\n| :--- | :--- | :--- | :--- | :--- |\n`;
    backendRoutes.forEach(r => {
      md += `| \`${r.method}\` | \`${r.path}\` | ${r.authRequired ? 'Yes (Guarded)' : 'Public'} | ${r.middleware.join(', ') || 'None'} | \`${r.file}:${r.line}\` |\n`;
    });
    md += `\n`;
  }

  // 6. Dependencies
  md += `## 6. Dependency Audit & Unused Package Detection\n\n`;
  md += `| Package | Version | Category | Type | Direct Usages | Status |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
  dependencies.forEach(dep => {
    md += `| \`${dep.name}\` | \`${dep.version}\` | ${dep.category} | ${dep.isDev ? 'Dev' : 'Prod'} | ${dep.usageCount} file(s) | ${dep.isLikelyUnused ? '⚠️ No direct usage detected' : '✅ Active'} |\n`;
  });
  md += `\n`;

  // 7. Security
  md += `## 7. Security Findings & Vulnerability Review\n\n`;
  if (securityConcerns.length === 0) {
    md += `> ✅ **Clean Security Audit:** No dangerous eval invocations, unredacted credentials, or command injections detected in analyzed source files.\n\n`;
  } else {
    securityConcerns.forEach((sec, idx) => {
      md += `### ${idx + 1}. [${sec.severity.toUpperCase()}] ${sec.title}\n`;
      md += `* **File:** \`${sec.file}\` (Line ${sec.line})\n`;
      md += `* **Category:** ${sec.category} | **Confidence:** ${sec.confidence}\n`;
      md += `* **Reason:** ${sec.reason}\n`;
      md += `* **Suggested Remediation:** ${sec.suggestedReview}\n`;
      md += `* **Evidence Code Snippet:**\n\`\`\`\n${sec.codeSnippet}\n\`\`\`\n\n`;
    });
  }

  // 8. Performance
  md += `## 8. Performance Findings & Optimization\n\n`;
  if (performanceConcerns.length === 0) {
    md += `> ✅ **Clean Performance Audit:** No repeated querySelector loops or unthrottled event streams detected.\n\n`;
  } else {
    performanceConcerns.forEach((perf, idx) => {
      md += `### ${idx + 1}. [${perf.severity.toUpperCase()}] ${perf.title}\n`;
      md += `* **File:** \`${perf.file}\` (Line ${perf.line})\n`;
      md += `* **Category:** ${perf.category} | **Confidence:** ${perf.confidence}\n`;
      md += `* **Impact:** ${perf.reason}\n`;
      md += `* **Optimization:** ${perf.suggestedReview}\n`;
      md += `* **Snippet:**\n\`\`\`\n${perf.codeSnippet}\n\`\`\`\n\n`;
    });
  }

  // 9. Data Flows
  md += `## 9. Data Flow Traces\n\n`;
  dataFlows.forEach(flow => {
    md += `### ${flow.name}\n`;
    md += `${flow.description}\n\n`;
    flow.steps.forEach((step, sIdx) => {
      md += `${sIdx + 1}. **[${step.stage}]** ${step.label}: ${step.details}\n`;
    });
    md += `\n`;
  });

  // 10. File-By-File Deep Dive
  md += `## 10. Detailed File-By-File Deep Dive\n\n`;
  Object.entries(files).forEach(([path, fileResult]) => {
    md += `### File: \`${path}\`\n\n`;
    md += `* **Size:** ${(fileResult.file.size / 1024).toFixed(1)} KB | **Lines:** ${fileResult.file.lines} | **Cyclomatic Complexity:** ${fileResult.cyclomaticComplexity}\n`;
    md += `* **Architectural Purpose:** ${fileResult.purpose}\n`;
    md += `* **Simple Explanation:** ${fileResult.simpleExplanation}\n`;

    if (fileResult.mainResponsibilities.length > 0) {
      md += `* **Main Responsibilities:**\n`;
      fileResult.mainResponsibilities.forEach(r => md += `  - ${r}\n`);
    }

    if (fileResult.components.length > 0) {
      md += `* **Components:** ${fileResult.components.map(c => `<${c.name} />`).join(', ')}\n`;
    }

    if (fileResult.functions.length > 0) {
      md += `* **Declared Functions (${fileResult.functions.length}):**\n`;
      fileResult.functions.forEach(fn => {
        md += `  - \`${fn.name}(${fn.params.join(', ')})\` (Line ${fn.line}) — ${fn.purpose || 'Function'}\n`;
      });
    }
    md += `\n`;
  });

  // 11. Privacy Certification
  md += `## 11. Privacy & Secret Redaction Audit Certification\n\n`;
  md += `* **Total Detected Files:** ${privacyReport.totalDetectedFiles}\n`;
  md += `* **Safe Source Files Analyzed:** ${privacyReport.analyzedFilesCount}\n`;
  md += `* **Sensitive Files Strictly Blocked:** ${privacyReport.sensitiveFilesBlockedCount}\n`;
  md += `* **Build/Artifact Files Ignored:** ${privacyReport.ignoredFilesCount}\n`;
  md += `* **In-Memory Secrets Redacted:** ${privacyReport.secretsRedactedCount}\n`;
  md += `* **Processing Guarantee:** ${privacyReport.processingMode}\n`;
  md += `* **Data Retention Policy:** ${privacyReport.dataRetention}\n\n`;

  return md;
}

/**
 * Generate Ultra-Detailed Multi-Page PDF Document with headers, metrics, tables, and full file breakdowns
 */
export function generatePdfReport(analysis: FullProjectAnalysis): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const checkPageBreak = (spaceNeeded: number) => {
    if (y + spaceNeeded > pageHeight - 20) {
      doc.addPage();
      y = 20;
      renderHeader();
    }
  };

  const renderHeader = () => {
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`CodeXRay Technical Audit — ${analysis.projectName}`, margin, 10);
    doc.text(`100% In-Browser Privacy Isolated`, pageWidth - margin, 10, { align: 'right' });
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, 12, pageWidth - margin, 12);
  };

  // Cover / Header
  renderHeader();

  // Project Title
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text(`Codebase Technical Audit`, margin, y);
  y += 7;

  doc.setFontSize(14);
  doc.setTextColor(79, 70, 229);
  doc.text(analysis.projectName, margin, y);
  y += 6;

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Audit Date: ${analysis.timestamp} | Primary Language: ${analysis.techStack.primaryLanguage}`, margin, y);
  y += 10;

  // Section 1: Executive Summary & Metrics Grid
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Executive Telemetry & Codebase Summary', margin, y);
  y += 6;

  // Summary box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const summaryLines = doc.splitTextToSize(analysis.aiProjectSummary.developerSummary, contentWidth - 8);
  doc.text(summaryLines.slice(0, 4), margin + 4, y + 6);
  y += 30;

  // Telemetry Metrics Table
  const metrics = [
    ['Analyzed Files', `${analysis.overview.analyzedFiles} / ${analysis.overview.totalFiles}`, 'Lines of Code (LOC)', analysis.overview.linesOfCode.toLocaleString()],
    ['Functions Declared', `${analysis.overview.functionsCount}`, 'UI Components', `${analysis.overview.componentsCount}`],
    ['DOM Operations', `${analysis.overview.domOperationsCount}`, 'API / Network Calls', `${analysis.overview.apiCallsCount}`],
    ['Security Items', `${analysis.overview.securityConcernsCount}`, 'Performance Items', `${analysis.overview.performanceConcernsCount}`]
  ];

  doc.setFontSize(8.5);
  metrics.forEach(row => {
    checkPageBreak(8);
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth / 2 - 2, 6, 'F');
    doc.rect(margin + contentWidth / 2 + 2, y, contentWidth / 2 - 2, 6, 'F');

    doc.setTextColor(71, 85, 105);
    doc.text(`${row[0]}:`, margin + 3, y + 4.2);
    doc.setTextColor(15, 23, 42);
    doc.text(`${row[1]}`, margin + contentWidth / 2 - 6, y + 4.2, { align: 'right' });

    doc.setTextColor(71, 85, 105);
    doc.text(`${row[2]}:`, margin + contentWidth / 2 + 5, y + 4.2);
    doc.setTextColor(15, 23, 42);
    doc.text(`${row[3]}`, margin + contentWidth - 3, y + 4.2, { align: 'right' });

    y += 7.5;
  });
  y += 5;

  // Section 2: Architecture Topology Boxes
  checkPageBreak(35);
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('2. System Architecture Topology', margin, y);
  y += 6;

  analysis.architecture.nodes.slice(0, 4).forEach((node, i) => {
    checkPageBreak(12);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, contentWidth, 10, 1.5, 1.5, 'FD');

    doc.setFontSize(8.5);
    doc.setTextColor(79, 70, 229);
    doc.text(`[Tier 0${i + 1}] ${node.label}`, margin + 3, y + 4.5);

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`${node.sublabel}`, margin + 3, y + 8);
    doc.text(`Tech: ${node.technologies.slice(0, 3).join(', ') || 'N/A'}`, pageWidth - margin - 3, y + 6, { align: 'right' });
    y += 12;
  });
  y += 4;

  // Section 3: DOM Analysis
  checkPageBreak(35);
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`3. DOM Operations & Inferred Containers (${analysis.domStats.totalOperations} Operations)`, margin, y);
  y += 6;

  analysis.domStats.operations.slice(0, 8).forEach(dom => {
    checkPageBreak(12);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 10.5, 1.5, 1.5, 'F');

    doc.setTextColor(217, 119, 6);
    doc.text(`[${dom.api}]`, margin + 3, y + 4.2);
    doc.setTextColor(79, 70, 229);
    doc.text(`${dom.selector || 'element'}`, margin + 35, y + 4.2);
    doc.setTextColor(100, 116, 139);
    doc.text(`${dom.file}:${dom.line}`, pageWidth - margin - 3, y + 4.2, { align: 'right' });

    doc.setTextColor(51, 65, 85);
    const targetText = dom.inferredTarget ? `Target: ${dom.inferredTarget}` : dom.purpose;
    doc.text(targetText.slice(0, 85), margin + 3, y + 8.5);
    y += 12.5;
  });
  y += 4;

  // Section 4: Security Findings
  checkPageBreak(40);
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`4. Security & Vulnerability Findings (${analysis.securityConcerns.length} Items)`, margin, y);
  y += 6;

  if (analysis.securityConcerns.length === 0) {
    doc.setFontSize(8.5);
    doc.setTextColor(16, 185, 129);
    doc.text('✓ No immediate high-risk security vulnerabilities detected in analyzed source code.', margin + 2, y);
    y += 8;
  } else {
    analysis.securityConcerns.forEach(sec => {
      checkPageBreak(20);
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(254, 202, 202);
      doc.roundedRect(margin, y, contentWidth, 16, 1.5, 1.5, 'FD');

      doc.setTextColor(225, 29, 72);
      doc.text(`[${sec.severity.toUpperCase()}] ${sec.title}`, margin + 3, y + 4.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`${sec.file}:${sec.line}`, pageWidth - margin - 3, y + 4.5, { align: 'right' });

      doc.setTextColor(51, 65, 85);
      const reasonLine = doc.splitTextToSize(`Reason: ${sec.reason}`, contentWidth - 6);
      doc.text(reasonLine.slice(0, 2), margin + 3, y + 8.5);

      doc.setTextColor(15, 118, 110);
      doc.text(`Fix: ${sec.suggestedReview.slice(0, 95)}`, margin + 3, y + 13.5);
      y += 18.5;
    });
  }
  y += 4;

  // Section 5: File-By-File Deep Dive
  checkPageBreak(35);
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('5. Detailed File-By-File Codebase Directory', margin, y);
  y += 6;

  Object.entries(analysis.files).forEach(([path, fileRes]) => {
    checkPageBreak(22);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'FD');

    doc.setTextColor(79, 70, 229);
    doc.setFontSize(9);
    doc.text(`${path}`, margin + 3, y + 4.5);
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text(`${fileRes.file.lines} Lines | Complexity: ${fileRes.cyclomaticComplexity}`, pageWidth - margin - 3, y + 4.5, { align: 'right' });

    doc.setTextColor(51, 65, 85);
    doc.text(`Purpose: ${fileRes.purpose.slice(0, 100)}`, margin + 3, y + 9);

    if (fileRes.functions.length > 0) {
      const fnsText = `Functions: ${fileRes.functions.slice(0, 4).map(f => `${f.name}()`).join(', ')}`;
      doc.setTextColor(100, 116, 139);
      doc.text(fnsText.slice(0, 95), margin + 3, y + 13.5);
    }
    y += 20.5;
  });
  y += 4;

  // Add Page Numbers to all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 6, { align: 'center' });
  }

  return doc;
}

/**
 * Open High-Res Printable Report with Vector SVG Architecture Diagrams & Flowcharts
 */
export function openPrintableReport(analysis: FullProjectAnalysis) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to open the printable report window.');
    return;
  }

  const {
    projectName,
    timestamp,
    overview,
    techStack,
    domStats,
    securityConcerns,
    performanceConcerns,
    architecture,
    dataFlows,
    files,
    aiProjectSummary,
    privacyReport
  } = analysis;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Executive Codebase Audit — ${projectName}</title>
  <style>
    :root {
      --primary: #4f46e5;
      --primary-light: #eef2ff;
      --text: #0f172a;
      --muted: #64748b;
      --border: #e2e8f0;
      --bg: #ffffff;
      --card-bg: #f8fafc;
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: var(--text);
      background: var(--bg);
      line-height: 1.5;
      padding: 40px;
      max-width: 960px;
      margin: 0 auto;
    }
    .header-box {
      border: 1px solid var(--border);
      background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
      padding: 30px;
      border-radius: 16px;
      margin-bottom: 30px;
    }
    h1 { font-size: 28px; color: #0f172a; margin: 0 0 6px 0; font-weight: 800; letter-spacing: -0.5px; }
    h2 {
      font-size: 18px;
      color: #0f172a;
      border-bottom: 2px solid var(--border);
      padding-bottom: 8px;
      margin-top: 36px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    h3 { font-size: 14px; color: #1e293b; margin: 16px 0 6px 0; }
    .meta { font-size: 12px; color: var(--muted); }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      font-size: 10px;
      font-weight: 700;
      border-radius: 6px;
      text-transform: uppercase;
      font-family: monospace;
    }
    .badge-critical { background: #ffe4e6; color: #e11d48; border: 1px solid #fecdd3; }
    .badge-high { background: #ffedd5; color: #ea580c; border: 1px solid #fed7aa; }
    .badge-medium { background: #fef9c3; color: #ca8a04; border: 1px solid #fef08a; }
    .badge-safe { background: #dcfce7; color: #16a34a; border: 1px solid #bbf7d0; }
    .badge-primary { background: #e0e7ff; color: #4338ca; border: 1px solid #c7d2fe; }

    .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 20px 0; }
    .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 16px 0; }
    .metric-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      padding: 14px;
      border-radius: 12px;
      text-align: left;
    }
    .metric-title { font-size: 11px; color: var(--muted); text-transform: uppercase; font-weight: bold; }
    .metric-val { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 2px; }

    /* Architecture Box Diagram */
    .arch-container {
      background: #f8fafc;
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      margin: 20px 0;
    }
    .arch-node {
      width: 100%;
      max-width: 500px;
      background: #ffffff;
      border: 1.5px solid #cbd5e1;
      padding: 12px 18px;
      border-radius: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .arch-arrow {
      color: #6366f1;
      font-weight: bold;
      font-size: 16px;
    }

    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; }
    th, td { border: 1px solid var(--border); padding: 9px 12px; text-align: left; vertical-align: top; }
    th { background: #f1f5f9; font-weight: 700; color: #334155; }
    tr:nth-child(even) { background: #f8fafc; }
    .code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 11px; color: #4338ca; }

    .print-actions {
      display: flex;
      gap: 10px;
      margin-bottom: 24px;
    }
    .btn {
      background: var(--primary);
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn:hover { background: #4338ca; }

    @media print {
      .print-actions { display: none; }
      body { padding: 0; max-width: 100%; }
      .header-box { border: 1px solid #cbd5e1; }
      h2 { page-break-after: avoid; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; page-break-after: auto; }
    }
  </style>
</head>
<body>
  <div class="print-actions">
    <button class="btn" onclick="window.print()">🖨️ Print or Save as Vector PDF</button>
  </div>

  <div class="header-box">
    <div class="meta" style="text-transform: uppercase; letter-spacing: 1px; font-weight: bold; color: #4f46e5; margin-bottom: 4px;">
      CodeXRay Architecture & Technical Audit
    </div>
    <h1>${projectName}</h1>
    <div class="meta">
      Audit Date: <strong>${timestamp}</strong> | Primary Language: <strong>${techStack.primaryLanguage}</strong> | Privacy: <strong>100% In-Browser AST Isolated</strong>
    </div>

    <div class="grid-4">
      <div class="metric-card">
        <div class="metric-title">Analyzed Files</div>
        <div class="metric-val">${overview.analyzedFiles} <small style="font-size: 13px; color: #64748b; font-weight: normal;">/ ${overview.totalFiles}</small></div>
      </div>
      <div class="metric-card">
        <div class="metric-title">Lines of Code</div>
        <div class="metric-val">${overview.linesOfCode.toLocaleString()}</div>
      </div>
      <div class="metric-card">
        <div class="metric-title">DOM Operations</div>
        <div class="metric-val" style="color: #d97706;">${overview.domOperationsCount}</div>
      </div>
      <div class="metric-card">
        <div class="metric-title">Security Flags</div>
        <div class="metric-val" style="color: ${securityConcerns.length > 0 ? '#e11d48' : '#16a34a'};">${overview.securityConcernsCount}</div>
      </div>
    </div>
  </div>

  <h2>1. Executive Summary</h2>
  <p>${aiProjectSummary.developerSummary}</p>

  <div class="grid-2">
    <div class="metric-card">
      <strong style="color: #16a34a; font-size: 12px; text-transform: uppercase;">Key Highlights:</strong>
      <ul style="margin: 8px 0 0 0; padding-left: 18px; font-size: 12px; color: #334155;">
        ${aiProjectSummary.keyHighlights.map(h => `<li>${h}</li>`).join('')}
      </ul>
    </div>
    <div class="metric-card">
      <strong style="color: #d97706; font-size: 12px; text-transform: uppercase;">Recommended Actions:</strong>
      <ul style="margin: 8px 0 0 0; padding-left: 18px; font-size: 12px; color: #334155;">
        ${aiProjectSummary.recommendedNextSteps.map(s => `<li>${s}</li>`).join('')}
      </ul>
    </div>
  </div>

  <h2>2. System Architecture & Diagram Topology</h2>
  <p style="font-size: 12px; color: #64748b;">Visual representation of system layers and runtime communication boundaries:</p>

  <div class="arch-container">
    ${architecture.nodes.map((n, idx) => `
      <div class="arch-node">
        <div>
          <strong style="color: #0f172a; font-size: 13px;">${idx + 1}. ${n.label}</strong>
          <div style="font-size: 11px; color: #64748b;">${n.sublabel}</div>
        </div>
        <span class="badge badge-primary">${n.technologies.slice(0, 2).join(', ') || n.type}</span>
      </div>
      ${idx < architecture.nodes.length - 1 ? '<div class="arch-arrow">↓</div>' : ''}
    `).join('')}
  </div>

  <h2>3. Technology Stack & Language Distribution</h2>
  <p><strong>Primary Language:</strong> ${techStack.primaryLanguage} | <strong>Frontend:</strong> ${techStack.frontend.join(', ') || 'Vanilla'} | <strong>Backend:</strong> ${techStack.backend.join(', ') || 'None'} | <strong>Databases:</strong> ${techStack.databases.join(', ') || 'None'}</p>

  <table>
    <tr><th>Programming Language</th><th>Source Files</th><th>Lines of Code</th><th>Percentage</th></tr>
    ${techStack.languages.map(l => `
      <tr>
        <td><strong>${l.name}</strong></td>
        <td>${l.filesCount}</td>
        <td>${l.linesCount.toLocaleString()}</td>
        <td><strong>${l.percentage}%</strong></td>
      </tr>
    `).join('')}
  </table>

  <h2>4. DOM Operations & Inferred Container Map</h2>
  <p style="font-size: 12px; color: #64748b;">Total DOM Invocations: <strong>${domStats.totalOperations}</strong> | Most Active File: <strong>${domStats.mostUsedFile}</strong></p>

  <table>
    <tr><th>DOM API</th><th>Selector</th><th>Inferred Target Container</th><th>File Location</th></tr>
    ${domStats.operations.slice(0, 15).map(d => `
      <tr>
        <td><span class="code">${d.api}</span></td>
        <td><strong>${d.selector || 'element'}</strong></td>
        <td>${d.inferredTarget || d.purpose}</td>
        <td><span class="code">${d.file}:${d.line}</span></td>
      </tr>
    `).join('')}
  </table>

  <h2>5. Security Findings & Risk Audit</h2>
  ${securityConcerns.length === 0 ? '<p class="badge badge-safe">✓ Clean Security Audit: No critical vulnerabilities detected.</p>' : `
    <table>
      <tr><th>Severity</th><th>Vulnerability Finding</th><th>File & Line</th><th>Remediation Guide</th></tr>
      ${securityConcerns.map(s => `
        <tr>
          <td><span class="badge badge-${s.severity.toLowerCase()}">${s.severity}</span></td>
          <td><strong>${s.title}</strong><br><small style="color: #475569;">${s.reason}</small></td>
          <td><span class="code">${s.file}:${s.line}</span></td>
          <td><strong style="color: #0f766e;">Fix:</strong> ${s.suggestedReview}</td>
        </tr>
      `).join('')}
    </table>
  `}

  <h2>6. Detailed File-By-File Codebase Directory</h2>
  <table>
    <tr><th>File Path</th><th>Lines</th><th>Complexity</th><th>Functions</th><th>Architectural Role</th></tr>
    ${Object.entries(files).map(([p, f]) => `
      <tr>
        <td><strong>${p}</strong></td>
        <td>${f.file.lines}</td>
        <td><span class="badge ${f.cyclomaticComplexity <= 5 ? 'badge-safe' : 'badge-medium'}">${f.cyclomaticComplexity}</span></td>
        <td>${f.functions.length > 0 ? f.functions.slice(0, 3).map(fn => fn.name + '()').join(', ') : 'None'}</td>
        <td>${f.purpose}</td>
      </tr>
    `).join('')}
  </table>

  <h2>7. Privacy & Exclusion Guarantee</h2>
  <p>• Sensitive Credential Files Blocked: <strong>${privacyReport.sensitiveFilesBlockedCount}</strong> (.env, keys, credentials, db dumps)</p>
  <p>• In-Memory Redacted Secrets: <strong>${privacyReport.secretsRedactedCount}</strong> ([REDACTED_SECRET])</p>
  <p>• Processing Guarantee: <strong>100% Client-Side In-Browser Execution</strong>. Ephemeral in-memory session only.</p>

  <div style="margin-top: 40px; padding-top: 15px; border-top: 1px solid #cbd5e1; font-size: 11px; color: #94a3b8; text-align: center;">
    Report generated by CodeXRay — Privacy-First Full Website & Codebase Architecture Analyzer
  </div>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
