import React, { useState, useMemo } from "react";
import {
  Database,
  Layers,
  Sparkles,
  Download,
  Filter,
  Search,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  ArrowUpDown,
  FileJson,
  FileSpreadsheet,
  Printer,
  Zap,
  Tag,
  AlertTriangle,
  Flame,
  BarChart2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { SATQuestion, SATSection, SATDomain, DifficultyLevel } from "../types";
import { OwlyLogoIcon } from "./OwlyLogo";
import {
  generateFull10000QuestionBank,
  getCategoryTaxonomy,
  CategorySummary,
  DomainBreakdown,
} from "../data/questionGeneratorEngine";

interface QuestionBankHubViewProps {
  currentBank: SATQuestion[];
  onSetBank: (newBank: SATQuestion[]) => void;
  onLaunchDrill: (filteredQuestions: SATQuestion[]) => void;
  onOpenAiTutor: (question: SATQuestion) => void;
}

export const QuestionBankHubView: React.FC<QuestionBankHubViewProps> = ({
  currentBank,
  onSetBank,
  onLaunchDrill,
  onOpenAiTutor,
}) => {
  // State
  const [bankQuestions, setBankQuestions] = useState<SATQuestion[]>(() => {
    // If currentBank has fewer than 1000 questions, generate the full 10,000 bank
    if (currentBank.length < 1000) {
      return generateFull10000QuestionBank();
    }
    return currentBank;
  });

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<"All" | SATSection>("All");
  const [selectedDomain, setSelectedDomain] = useState<"All" | SATDomain>("All");
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"All" | DifficultyLevel>("All");
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;

  // Compute Taxonomy & Category Metrics
  const taxonomy = useMemo(() => {
    return getCategoryTaxonomy(bankQuestions);
  }, [bankQuestions]);

  // Filter questions based on controls
  const filteredQuestions = useMemo(() => {
    return bankQuestions.filter((q) => {
      if (selectedSection !== "All" && q.section !== selectedSection) return false;
      if (selectedDomain !== "All" && q.domain !== selectedDomain) return false;
      if (selectedSubtopic !== "All" && q.subtopic !== selectedSubtopic) return false;
      if (selectedDifficulty !== "All" && q.difficulty !== selectedDifficulty) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQ = q.question.toLowerCase().includes(query);
        const matchesPassage = q.passage?.toLowerCase().includes(query) || false;
        const matchesSubtopic = q.subtopic.toLowerCase().includes(query);
        const matchesId = q.id.toLowerCase().includes(query);
        if (!matchesQ && !matchesPassage && !matchesSubtopic && !matchesId) return false;
      }
      return true;
    });
  }, [bankQuestions, selectedSection, selectedDomain, selectedSubtopic, selectedDifficulty, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredQuestions.length / pageSize) || 1;
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, currentPage]);

  // Reset page when filters change
  const handleFilterChange = (setter: () => void) => {
    setter();
    setCurrentPage(1);
  };

  // Re-generate full 10,000 questions
  const handleRegenerate10000 = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const new10000 = generateFull10000QuestionBank();
      setBankQuestions(new10000);
      onSetBank(new10000);
      setIsGenerating(false);
      setCurrentPage(1);
    }, 400);
  };

  // Export as JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredQuestions, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `SAT_Categorized_Question_Bank_${filteredQuestions.length}_questions.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export as CSV
  const handleExportCSV = () => {
    const headers = ["ID", "Section", "Domain", "Subtopic", "Difficulty", "Question", "Options", "CorrectAnswer", "Explanation"];
    const rows = filteredQuestions.map((q) => [
      `"${q.id}"`,
      `"${q.section}"`,
      `"${q.domain}"`,
      `"${q.subtopic.replace(/"/g, '""')}"`,
      `"${q.difficulty}"`,
      `"${q.question.replace(/"/g, '""')}"`,
      `"${q.options.join(" | ").replace(/"/g, '""')}"`,
      `"${q.options[q.correctAnswerIndex]?.replace(/"/g, '""') || ""}"`,
      `"${q.explanation.replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute(
      "download",
      `SAT_10000_Question_Bank_${filteredQuestions.length}_items.csv`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Generation Controller */}
      <div className="bg-gradient-to-r from-slate-950 via-cyan-950/80 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <OwlyLogoIcon size="sm" />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                QUANTUM SAT QUESTION REPOSITORY • 10,000 VECTORS
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-orbitron font-bold tracking-wide text-white drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">
              10,000 Calibrated & Categorized SAT Questions
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-space leading-relaxed">
              Complete psychometric repository across all 8 Official College Board domains and 35+ granular subtopics.
              Filter by subject module and domain, explore question distractors, and launch custom drill sets with AI guidance.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="regenerate-10000-questions-button"
              onClick={handleRegenerate10000}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
              {isGenerating ? "Rebuilding Matrix..." : "Re-Seed 10,000 Qs"}
            </button>

            <button
              id="export-json-button"
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 text-xs font-mono font-bold rounded-xl border border-cyan-500/30 transition-all cursor-pointer"
              title="Download JSON Export"
            >
              <FileJson className="w-4 h-4 text-amber-400" />
              <span>JSON</span>
            </button>

            <button
              id="export-csv-button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 text-xs font-mono font-bold rounded-xl border border-cyan-500/30 transition-all cursor-pointer"
              title="Download CSV / Excel Spreadsheet"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Global Bank Stats Counter Cards */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-cyan-500/20">
          <div className="scifi-glass-card p-3.5 rounded-2xl border border-cyan-500/30">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Total Questions</div>
            <div className="text-2xl font-black text-cyan-300 font-orbitron mt-0.5 drop-shadow-[0_0_8px_#00f0ff]">
              {taxonomy.totalCount.toLocaleString()}
            </div>
            <div className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 100% Calibrated
            </div>
          </div>

          <div className="scifi-glass-card p-3.5 rounded-2xl border border-cyan-500/30">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Math Modules</div>
            <div className="text-2xl font-black text-cyan-300 font-orbitron mt-0.5">
              {taxonomy.sectionBreakdown["Math"]?.toLocaleString() || "5,000"}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">4 Official Modules</div>
          </div>

          <div className="scifi-glass-card p-3.5 rounded-2xl border border-cyan-500/30">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Reading & Writing Modules</div>
            <div className="text-2xl font-black text-cyan-300 font-orbitron mt-0.5">
              {taxonomy.sectionBreakdown["Reading & Writing"]?.toLocaleString() || "5,000"}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">4 Official Modules</div>
          </div>

          <div className="scifi-glass-card p-3.5 rounded-2xl border border-cyan-500/30">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Subtopics</div>
            <div className="text-2xl font-black text-cyan-300 font-orbitron mt-0.5">
              {taxonomy.subtopicSummaries.length}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">Easy • Med • Hard</div>
          </div>
        </div>
      </div>

      {/* Categorization Breakdown Matrix */}
      <div className="scifi-glass-card rounded-2xl border border-cyan-500/20 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cyan-500/20">
          <div>
            <h2 className="text-base font-orbitron font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Taxonomy & Categorization Matrix
            </h2>
            <p className="text-xs font-space text-slate-400">
              Select any domain vector below to immediately filter the question repository.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                handleFilterChange(() => {
                  setSelectedSection("All");
                  setSelectedDomain("All");
                  setSelectedSubtopic("All");
                });
              }}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all ${
                selectedDomain === "All" && selectedSection === "All"
                  ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                  : "bg-slate-900 text-slate-400 border-cyan-500/20 hover:text-white"
              }`}
            >
              All Domains (10,000)
            </button>
          </div>
        </div>

        {/* 8 Domain Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {taxonomy.domainBreakdowns.map((dom) => {
            const isSelected = selectedDomain === dom.domain;
            const isMath = dom.section === "Math";

            return (
              <div
                key={dom.domain}
                onClick={() => {
                  handleFilterChange(() => {
                    if (isSelected) {
                      setSelectedDomain("All");
                      setSelectedSection("All");
                    } else {
                      setSelectedDomain(dom.domain);
                      setSelectedSection(dom.section);
                      setSelectedSubtopic("All");
                    }
                  });
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-cyan-950/80 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400"
                    : "bg-slate-900/60 border-cyan-500/20 hover:border-cyan-500/40 hover:bg-slate-900/90"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isMath
                        ? "bg-cyan-950 text-cyan-300 border border-cyan-500/30"
                        : "bg-indigo-950 text-indigo-300 border border-indigo-500/30"
                    }`}
                  >
                    {dom.section}
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {dom.totalCount} Qs
                  </span>
                </div>

                <h3 className="text-xs font-mono font-bold text-white mt-2 line-clamp-1">
                  {dom.domain}
                </h3>

                <div className="text-[10px] font-mono text-slate-400 mt-1">
                  {dom.subtopics.length} Subtopic Categories
                </div>

                {/* Subtopic Mini Pills */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {dom.subtopics.slice(0, 3).map((st) => (
                    <span
                      key={st.name}
                      className="text-[9px] font-mono bg-slate-950 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800 truncate max-w-[150px]"
                    >
                      {st.name} ({st.count})
                    </span>
                  ))}
                  {dom.subtopics.length > 3 && (
                    <span className="text-[9px] font-mono text-slate-500 px-1">
                      +{dom.subtopics.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="scifi-glass-card rounded-2xl border border-cyan-500/20 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleFilterChange(() => setSearchQuery(e.target.value))}
              placeholder="Search by keywords, equations, subtopic, or ID (e.g. 'linear', 'standard deviation', 'semicolon')..."
              className="w-full pl-10 pr-4 py-2 text-xs font-mono bg-slate-900/90 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 placeholder:text-slate-500"
            />
          </div>

          {/* Quick Drill Launcher Button */}
          <button
            id="launch-filtered-drill-button"
            onClick={() => onLaunchDrill(filteredQuestions)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold rounded-xl shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all shrink-0 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            Launch Drill with Filtered ({filteredQuestions.length})
          </button>
        </div>

        {/* Filter Dropdowns & Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-cyan-500/20">
          {/* Section Filter */}
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 mb-1">
              Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) =>
                handleFilterChange(() => {
                  setSelectedSection(e.target.value as any);
                  if (e.target.value === "All") {
                    setSelectedDomain("All");
                  }
                  setSelectedSubtopic("All");
                })
              }
              className="w-full px-3 py-1.5 bg-slate-900 border border-cyan-500/30 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="All">All Sections</option>
              <option value="Math">Math (5,000)</option>
              <option value="Reading & Writing">Reading & Writing (5,000)</option>
            </select>
          </div>

          {/* Domain Filter */}
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 mb-1">
              Domain
            </label>
            <select
              value={selectedDomain}
              onChange={(e) =>
                handleFilterChange(() => {
                  setSelectedDomain(e.target.value as any);
                  setSelectedSubtopic("All");
                })
              }
              className="w-full px-3 py-1.5 bg-slate-900 border border-cyan-500/30 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="All">All Domains</option>
              {taxonomy.domainBreakdowns.map((d) => (
                <option key={d.domain} value={d.domain}>
                  {d.domain} ({d.totalCount})
                </option>
              ))}
            </select>
          </div>

          {/* Subtopic Filter */}
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 mb-1">
              Subtopic Category
            </label>
            <select
              value={selectedSubtopic}
              onChange={(e) => handleFilterChange(() => setSelectedSubtopic(e.target.value))}
              className="w-full px-3 py-1.5 bg-slate-900 border border-cyan-500/30 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="All">All Subtopics</option>
              {taxonomy.subtopicSummaries
                .filter((st) => selectedDomain === "All" || st.domain === selectedDomain)
                .map((st) => (
                  <option key={st.subtopic} value={st.subtopic}>
                    {st.subtopic} ({st.count})
                  </option>
                ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 mb-1">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => handleFilterChange(() => setSelectedDifficulty(e.target.value as any))}
              className="w-full px-3 py-1.5 bg-slate-900 border border-cyan-500/30 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy ({taxonomy.difficultyBreakdown["Easy"]})</option>
              <option value="Medium">Medium ({taxonomy.difficultyBreakdown["Medium"]})</option>
              <option value="Hard">Hard ({taxonomy.difficultyBreakdown["Hard"]})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions Results Table & Inspection Feed */}
      <div className="scifi-glass-card rounded-2xl border border-cyan-500/20 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-300">
              Showing {filteredQuestions.length.toLocaleString()} matching vectors
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              • Page {currentPage} of {totalPages}
            </span>
          </div>

          {/* Pagination Controls Top */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-cyan-500/20 text-slate-300 hover:bg-cyan-950 disabled:opacity-40"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-cyan-400 px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-cyan-500/20 text-slate-300 hover:bg-cyan-950 disabled:opacity-40"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="divide-y divide-cyan-500/10">
          {paginatedQuestions.map((q) => {
            const isExpanded = expandedQuestionId === q.id;
            const isMath = q.section === "Math";

            return (
              <div
                key={q.id}
                className="p-5 sm:p-6 hover:bg-slate-900/40 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                        #{q.id}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          isMath
                            ? "bg-cyan-950 text-cyan-300 border border-cyan-500/30"
                            : "bg-indigo-950 text-indigo-300 border border-indigo-500/30"
                        }`}
                      >
                        {q.section}
                      </span>
                      <span className="text-[10px] font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {q.domain}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {q.subtopic}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          q.difficulty === "Easy"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                            : q.difficulty === "Medium"
                            ? "bg-amber-950 text-amber-300 border border-amber-500/30"
                            : "bg-rose-950 text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </div>

                    {/* Passage Preview if applicable */}
                    {q.passage && (
                      <div className="mt-2 text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-cyan-500/20 font-space leading-relaxed italic">
                        {q.passage}
                      </div>
                    )}

                    {/* Table Data Preview if applicable */}
                    {q.tableData && (
                      <div className="mt-2 overflow-x-auto">
                        <table className="min-w-full text-xs text-slate-200 border border-cyan-500/20 rounded-lg overflow-hidden font-mono">
                          <thead className="bg-slate-900 font-bold text-cyan-300">
                            <tr>
                              {q.tableData.headers.map((h, i) => (
                                <th key={i} className="px-3 py-1.5 border-b border-cyan-500/20 text-left">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {q.tableData.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="border-b border-slate-800">
                                {row.map((c, cIdx) => (
                                  <td key={cIdx} className="px-3 py-1 text-slate-300">
                                    {c}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Question Prompt */}
                    <div className="text-xs sm:text-sm font-space font-semibold text-white pt-1 leading-snug">
                      {q.question}
                    </div>
                  </div>

                  {/* Toggle Explanation Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                      className="px-3 py-1.5 text-xs font-mono font-bold text-slate-300 bg-slate-900 border border-cyan-500/30 rounded-lg hover:bg-cyan-950 hover:text-cyan-300 transition-all cursor-pointer"
                    >
                      {isExpanded ? "Hide Details" : "View Protocol"}
                    </button>
                  </div>
                </div>

                {/* Expanded Answer Options, Explanation, & Trap Analysis */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-cyan-500/20 grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in fade-in duration-200">
                    {/* Multiple Choice Options */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                        Answer Options
                      </div>
                      <div className="space-y-1.5">
                        {q.options.map((opt, oIdx) => {
                          const isCorrect = oIdx === q.correctAnswerIndex;
                          const letter = String.fromCharCode(65 + oIdx);
                          return (
                            <div
                              key={oIdx}
                              className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs font-mono ${
                                isCorrect
                                  ? "bg-emerald-950/70 border-emerald-400 text-emerald-200 font-bold"
                                  : "bg-slate-950/60 border-cyan-500/10 text-slate-300"
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                  isCorrect
                                    ? "bg-emerald-500 text-black shadow-[0_0_8px_#10b981]"
                                    : "bg-slate-800 text-slate-300"
                                }`}
                              >
                                {letter}
                              </span>
                              <span className="leading-relaxed font-space">{opt}</span>
                              {isCorrect && (
                                <span className="ml-auto text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                                  Correct
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step-by-Step Explanation & Trap Warning */}
                    <div className="space-y-3">
                      <div className="bg-slate-950/90 p-3.5 rounded-xl border border-cyan-500/30">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Step-by-Step Tactical Solution
                        </div>
                        <p className="text-xs font-space text-slate-200 leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>

                      {q.trapAnalysis && (
                        <div className="bg-amber-950/40 p-3.5 rounded-xl border border-amber-500/40">
                          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300 mb-1">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            Official Distractor / Trap Analysis
                          </div>
                          <p className="text-xs font-space text-amber-200 leading-relaxed">
                            {q.trapAnalysis}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Pagination Footer */}
        <div className="px-6 py-4 border-t border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/60 font-mono text-xs">
          <div className="text-slate-400">
            Displaying {(currentPage - 1) * pageSize + 1} -{" "}
            {Math.min(currentPage * pageSize, filteredQuestions.length)} of{" "}
            {filteredQuestions.length.toLocaleString()} questions
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2.5 py-1 font-bold rounded-lg border border-cyan-500/20 text-slate-300 hover:bg-cyan-950 disabled:opacity-40"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 font-bold rounded-lg border border-cyan-500/20 text-slate-300 hover:bg-cyan-950 disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-xs font-bold text-cyan-400 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 font-bold rounded-lg border border-cyan-500/20 text-slate-300 hover:bg-cyan-950 disabled:opacity-40"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 font-bold rounded-lg border border-cyan-500/20 text-slate-300 hover:bg-cyan-950 disabled:opacity-40"
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
