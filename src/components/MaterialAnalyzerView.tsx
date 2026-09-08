import React, { useState } from "react";
import {
  Upload,
  FileText,
  Sparkles,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Zap,
  Printer,
  FileCheck,
  Award,
} from "lucide-react";
import { MaterialAnalysisReport, SATQuestion } from "../types";
import { PRELOADED_MATERIALS } from "../data/sampleMaterials";

interface MaterialAnalyzerViewProps {
  reports: MaterialAnalysisReport[];
  onSaveReport: (report: MaterialAnalysisReport) => void;
  onAddExtractedQuestions: (questions: SATQuestion[]) => void;
  onNavigateToPractice: () => void;
}

export const MaterialAnalyzerView: React.FC<MaterialAnalyzerViewProps> = ({
  reports,
  onSaveReport,
  onAddExtractedQuestions,
  onNavigateToPractice,
}) => {
  const [activeTab, setActiveTab] = useState<"upload" | "report">("upload");
  const [selectedPreloaded, setSelectedPreloaded] = useState<string>("learnattic-1000-sat");
  const [customText, setCustomText] = useState<string>("");
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeReportIndex, setActiveReportIndex] = useState<number>(0);
  const [uploadMode, setUploadMode] = useState<"preloaded" | "file" | "paste">("preloaded");

  const currentReport: MaterialAnalysisReport | undefined = reports[activeReportIndex] || reports[0];

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCustomText(text);
    };
    reader.readAsText(file);
  };

  // Drag & drop handlers
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCustomText(text);
    };
    reader.readAsText(file);
  };

  // Trigger AI analysis on uploaded/selected material
  const handleAnalyzeMaterial = async () => {
    setIsAnalyzing(true);
    let title = "";
    let content = "";

    if (uploadMode === "preloaded") {
      const mat = PRELOADED_MATERIALS.find((m) => m.id === selectedPreloaded) || PRELOADED_MATERIALS[0];
      title = mat.title;
      content = mat.fullText;
    } else if (uploadMode === "file") {
      title = uploadedFileName || "Uploaded_SAT_Notes.pdf";
      content = customText || "SAT Practice questions notes";
    } else {
      title = "Custom Pasted SAT Notes";
      content = customText;
    }

    try {
      const res = await fetch("/api/gemini/analyze-material", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: title,
          fileContent: content,
        }),
      });

      if (!res.ok) throw new Error("Failed to analyze material");
      const data = await res.json();

      const newReport: MaterialAnalysisReport = {
        id: `report-${Date.now()}`,
        documentTitle: data.report.documentTitle || title,
        documentSummary: data.report.documentSummary || "Comprehensive analysis of SAT study material.",
        uploadedAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        overallReadinessScore: data.report.overallReadinessScore || 78,
        estimatedScoreRange: data.report.estimatedScoreRange || {
          min: 1280,
          max: 1460,
          mathMin: 640,
          mathMax: 740,
          rwMin: 640,
          rwMax: 720,
        },
        masteryBreakdown: data.report.masteryBreakdown || [],
        keyStrengths: data.report.keyStrengths || [],
        criticalWeaknessesAndTrapPatterns: data.report.criticalWeaknessesAndTrapPatterns || [],
        recommendedDailyActionPlan: data.report.recommendedDailyActionPlan || [],
        studyHoursRecommendation: data.report.studyHoursRecommendation || "15-20 hours over 3 weeks",
        extractedQuestions: (data.extractedQuestions || []).map((q: any, i: number) => ({
          ...q,
          id: `extracted-${Date.now()}-${i}`,
          source: `Uploaded: ${title.slice(0, 24)}...`,
        })),
      };

      onSaveReport(newReport);
      if (newReport.extractedQuestions.length > 0) {
        onAddExtractedQuestions(newReport.extractedQuestions);
      }
      setActiveReportIndex(0);
      setActiveTab("report");
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Banner (Geometric Balance) */}
      <div className="bg-gradient-to-r from-slate-950 via-cyan-950/80 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden border border-cyan-500/40">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
              DOCUMENT PSYCHOMETRICS & QUANTUM SCANNER
            </div>
            <h1 className="text-2xl sm:text-3xl font-orbitron font-bold tracking-wide text-white drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">
              Material Analyzer & Diagnostic Reports
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm font-space leading-relaxed max-w-2xl">
              Upload your SAT prep workbooks, practice test PDF exports, class notes, or formula sheets. Our AI psychometrics engine evaluates your material, estimates score readiness, identifies trap patterns, and extracts interactive practice drills.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-mono font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === "upload"
                  ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-cyan-500/30"
              }`}
            >
              <Upload className="w-4 h-4" />
              Analyze New Material
            </button>
            {reports.length > 0 && (
              <button
                onClick={() => setActiveTab("report")}
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-mono font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  activeTab === "report"
                    ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-cyan-500/30"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                View Generated Reports ({reports.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {activeTab === "upload" ? (
        /* UPLOAD & MATERIAL SELECTOR VIEW */
        <div className="space-y-6">
          <div className="scifi-glass-card rounded-3xl p-6 sm:p-8 border border-cyan-500/30 shadow-sm space-y-6">
            {/* Mode Tabs */}
            <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-4">
              <button
                onClick={() => setUploadMode("preloaded")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-colors flex items-center gap-2 cursor-pointer ${
                  uploadMode === "preloaded"
                    ? "bg-cyan-500 text-black shadow-[0_0_12px_#00f0ff]"
                    : "bg-slate-900 text-slate-400 border border-cyan-500/20 hover:text-white"
                }`}
              >
                <Award className="w-4 h-4" />
                Pre-Loaded Official SAT Workbooks
              </button>
              <button
                onClick={() => setUploadMode("file")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-colors flex items-center gap-2 cursor-pointer ${
                  uploadMode === "file"
                    ? "bg-cyan-500 text-black shadow-[0_0_12px_#00f0ff]"
                    : "bg-slate-900 text-slate-400 border border-cyan-500/20 hover:text-white"
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload PDF / File
              </button>
              <button
                onClick={() => setUploadMode("paste")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-colors flex items-center gap-2 cursor-pointer ${
                  uploadMode === "paste"
                    ? "bg-cyan-500 text-black shadow-[0_0_12px_#00f0ff]"
                    : "bg-slate-900 text-slate-400 border border-cyan-500/20 hover:text-white"
                }`}
              >
                <FileText className="w-4 h-4" />
                Paste Text / Notes
              </button>
            </div>

            {/* Mode 1: Preloaded Workbooks */}
            {uploadMode === "preloaded" && (
              <div className="space-y-4">
                <p className="text-xs text-slate-400 font-mono">
                  Select an authentic SAT resource to instantly generate a custom progress diagnostic and derived question bank:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {PRELOADED_MATERIALS.map((mat) => {
                    const isSel = selectedPreloaded === mat.id;
                    return (
                      <div
                        key={mat.id}
                        onClick={() => setSelectedPreloaded(mat.id)}
                        className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-3 ${
                          isSel
                            ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                            : "border-cyan-500/20 hover:border-cyan-500/50 bg-slate-950/60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                            {mat.category}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">{mat.pageCount} Pages</span>
                        </div>
                        <h4 className="font-orbitron font-bold text-sm text-white leading-snug">{mat.title}</h4>
                        <p className="text-xs font-space text-slate-300 leading-relaxed line-clamp-2">{mat.snippet}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mode 2: File Upload (Drag & Drop) */}
            {uploadMode === "file" && (
              <div className="space-y-4">
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-cyan-500/30 hover:border-cyan-400 rounded-3xl p-10 text-center bg-slate-950/60 hover:bg-cyan-950/20 transition-all cursor-pointer"
                >
                  <input
                    type="file"
                    id="file-upload-input"
                    onChange={handleFileUpload}
                    accept=".pdf,.txt,.md,.json,.doc,.docx"
                    className="hidden"
                  />
                  <label htmlFor="file-upload-input" className="cursor-pointer space-y-3 block">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-500/40 text-cyan-300 flex items-center justify-center mx-auto shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-sm font-orbitron font-bold text-white">
                        {uploadedFileName ? uploadedFileName : "Click to select or drag and drop SAT material"}
                      </span>
                      <p className="text-xs font-mono text-slate-400 mt-1">
                        Supports PDF exports, text notes, practice test result logs (.txt, .md, .pdf)
                      </p>
                    </div>
                    {uploadedFileName && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        File ready for AI analysis
                      </span>
                    )}
                  </label>
                </div>
              </div>
            )}

            {/* Mode 3: Paste Text */}
            {uploadMode === "paste" && (
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">Paste Study Notes / Problem Set</label>
                <textarea
                  rows={8}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Paste math problems, grammar rules, reading passages, or mock exam error notes here..."
                  className="w-full p-4 rounded-2xl border border-cyan-500/30 text-xs font-mono text-white bg-slate-900 focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
                />
              </div>
            )}

            {/* Submit Analysis Button */}
            <div className="flex items-center justify-end pt-4 border-t border-cyan-500/20">
              <button
                onClick={handleAnalyzeMaterial}
                disabled={isAnalyzing || (uploadMode !== "preloaded" && !customText.trim())}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-50 transition-all cursor-pointer"
              >
                <Sparkles className={`w-4 h-4 text-black ${isAnalyzing ? "animate-spin" : ""}`} />
                <span>{isAnalyzing ? "Analyzing Material & Computing Report..." : "Generate Custom Progress Report"}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* REPORT VIEW */
        <div className="space-y-6">
          {/* Report Switcher & Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-4 scifi-glass-card p-4 rounded-3xl border border-cyan-500/30 shadow-sm print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Report History:</span>
              <select
                value={activeReportIndex}
                onChange={(e) => setActiveReportIndex(Number(e.target.value))}
                className="px-3.5 py-1.5 rounded-xl border border-cyan-500/30 bg-slate-900 text-xs font-mono font-bold text-white focus:outline-none"
              >
                {reports.map((r, i) => (
                  <option key={r.id} value={i}>
                    {r.documentTitle} ({r.uploadedAt})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-cyan-500/30 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-cyan-400" />
                Print / Save PDF
              </button>

              {currentReport && currentReport.extractedQuestions.length > 0 && (
                <button
                  onClick={onNavigateToPractice}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold transition-colors shadow-[0_0_10px_#00f0ff] cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-black" />
                  Practice Derived Questions ({currentReport.extractedQuestions.length})
                </button>
              )}
            </div>
          </div>

          {currentReport ? (
            /* Printable Full Diagnostic Report Sheet */
            <div className="scifi-glass-card rounded-3xl p-6 sm:p-10 border border-cyan-500/30 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
              {/* Report Header */}
              <div className="flex items-start justify-between border-b border-cyan-500/20 pb-6 flex-wrap gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                      Official SAT Material Diagnostic Report
                    </span>
                    <span className="px-2.5 py-0.5 rounded-sm text-[9px] font-mono font-bold bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                      Evaluated by Gemini AI
                    </span>
                  </div>
                  <h2 className="text-2xl font-orbitron font-bold text-white">{currentReport.documentTitle}</h2>
                  <p className="text-xs font-mono text-slate-400">Generated on {currentReport.uploadedAt}</p>
                </div>

                {/* Readiness Gauge */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 shadow-[inset_0_0_12px_rgba(6,182,212,0.15)]">
                  <div className="text-center">
                    <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">SAT Readiness</div>
                    <div className="text-3xl font-orbitron font-black text-cyan-300 drop-shadow-[0_0_10px_#00f0ff]">
                      {currentReport.overallReadinessScore}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Score Range Estimation Cards (Geometric Balance) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] text-white">
                  <div className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                    Predicted Total SAT Score
                  </div>
                  <div className="text-3xl font-orbitron font-black text-white mt-1">
                    {currentReport.estimatedScoreRange.min} - {currentReport.estimatedScoreRange.max}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">Scale: 400 - 1600</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)] text-white">
                  <div className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
                    Predicted Math Section
                  </div>
                  <div className="text-3xl font-orbitron font-black mt-1 text-emerald-400">
                    {currentReport.estimatedScoreRange.mathMin} - {currentReport.estimatedScoreRange.mathMax}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">Scale: 200 - 800</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.15)] text-white">
                  <div className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider">
                    Predicted Reading & Writing
                  </div>
                  <div className="text-3xl font-orbitron font-black mt-1 text-indigo-400">
                    {currentReport.estimatedScoreRange.rwMin} - {currentReport.estimatedScoreRange.rwMax}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">Scale: 200 - 800</div>
                </div>
              </div>

              {/* Document Overview Summary */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/20 text-xs space-y-2 font-space">
                <span className="font-orbitron font-bold text-white text-sm">Document Analysis Summary</span>
                <p className="text-slate-300 leading-relaxed text-xs">{currentReport.documentSummary}</p>
                <div className="text-xs font-mono text-cyan-400 font-bold pt-1">
                  ⏱️ Recommended Study Allocation: {currentReport.studyHoursRecommendation}
                </div>
              </div>

              {/* Topic Mastery Grid */}
              <div className="space-y-4">
                <h3 className="text-base font-orbitron font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  Domain & Topic Competency Breakdown
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentReport.masteryBreakdown.map((item, idx) => {
                    let badgeColor = "bg-emerald-950 text-emerald-300 border-emerald-500/40";
                    let barColor = "bg-emerald-400 shadow-[0_0_8px_#10b981]";
                    if (item.masteryLevel === "Needs Review") {
                      badgeColor = "bg-amber-950 text-amber-300 border-amber-500/40";
                      barColor = "bg-amber-400 shadow-[0_0_8px_#f59e0b]";
                    } else if (item.masteryLevel === "Critical Focus") {
                      badgeColor = "bg-rose-950 text-rose-300 border-rose-500/40";
                      barColor = "bg-rose-500 shadow-[0_0_8px_#f43f5e]";
                    }

                    return (
                      <div key={idx} className="p-5 rounded-2xl border border-cyan-500/20 bg-slate-950/60 shadow-xs space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono uppercase font-bold text-cyan-400">{item.domain}</span>
                            <h4 className="font-orbitron font-bold text-sm text-white">{item.subtopic}</h4>
                          </div>
                          <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border ${badgeColor}`}>
                            {item.masteryLevel}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-mono text-slate-400">
                            <span>Mastery Index</span>
                            <span className="font-bold text-cyan-300">{item.scorePercent}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/20">
                            <div className={`h-full ${barColor}`} style={{ width: `${item.scorePercent}%` }} />
                          </div>
                        </div>

                        <p className="text-xs font-space text-slate-300 leading-relaxed">{item.keyFindings}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Strengths & Trap Patterns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
                  <h4 className="font-orbitron font-bold text-sm text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Key Strengths & Conceptual Mastery
                  </h4>
                  <ul className="space-y-2">
                    {currentReport.keyStrengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs font-space text-slate-200">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Trap Patterns & Vulnerabilities */}
                <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-3">
                  <h4 className="font-orbitron font-bold text-sm text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Detected Trap Patterns & Vulnerabilities
                  </h4>
                  <ul className="space-y-2">
                    {currentReport.criticalWeaknessesAndTrapPatterns.map((w, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs font-space text-slate-200">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Plan */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-cyan-500/30 text-white space-y-4">
                <h4 className="font-orbitron font-bold text-sm text-cyan-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Targeted Next-Step Action Roadmap
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentReport.recommendedDailyActionPlan.map((action, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/20 text-xs flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-cyan-500 text-black font-mono font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {idx + 1}
                      </div>
                      <p className="text-slate-200 font-space leading-relaxed">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 scifi-glass-card rounded-3xl border border-cyan-500/30 shadow-sm font-mono text-xs">
              No report generated yet. Choose a material above to generate your first custom report!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
