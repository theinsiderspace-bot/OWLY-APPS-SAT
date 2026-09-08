import React, { useState, useMemo } from "react";
import {
  BookMarked,
  Search,
  Zap,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCw,
  Copy,
  Check,
  HelpCircle,
  Maximize2,
  Sliders,
  Flame,
  BookmarkCheck,
  ArrowRight,
  Layers,
  FileSpreadsheet,
  Edit2,
  ShieldCheck,
} from "lucide-react";
import { ALL_MATH_FORMULAS, MathFormulaItem } from "../data/mathFormulas";

interface FormulaGuideViewProps {
  formulaRules?: MathFormulaItem[];
  onOpenAdminRules?: (ruleId?: string) => void;
  isAdmin?: boolean;
}

export const FormulaGuideView: React.FC<FormulaGuideViewProps> = ({
  formulaRules = ALL_MATH_FORMULAS,
  onOpenAdminRules,
  isAdmin = true,
}) => {
  const [search, setSearch] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [filterProvidedOnly, setFilterProvidedOnly] = useState<boolean>(false);
  const [filterMustMemorizeOnly, setFilterMustMemorizeOnly] = useState<boolean>(false);
  const [isFlashcardMode, setIsFlashcardMode] = useState<boolean>(false);
  const [revealedFlashcards, setRevealedFlashcards] = useState<Record<string, boolean>>({});
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active Interactive Solver state
  const [activeSolverItem, setActiveSolverItem] = useState<MathFormulaItem | null>(null);

  // Interactive Solver inputs
  const [quadA, setQuadA] = useState<number>(1);
  const [quadB, setQuadB] = useState<number>(-5);
  const [quadC, setQuadC] = useState<number>(6);

  const [slopeX1, setSlopeX1] = useState<number>(2);
  const [slopeY1, setSlopeY1] = useState<number>(3);
  const [slopeX2, setSlopeX2] = useState<number>(6);
  const [slopeY2, setSlopeY2] = useState<number>(11);

  const [pctOrig, setPctOrig] = useState<number>(80);
  const [pctNew, setPctNew] = useState<number>(60);

  const [circleD, setCircleD] = useState<number>(-6);
  const [circleE, setCircleE] = useState<number>(8);
  const [circleF, setCircleF] = useState<number>(24);

  const [arcRadius, setArcRadius] = useState<number>(6);
  const [arcAngleDeg, setArcAngleDeg] = useState<number>(60);

  const [expPrincipal, setExpPrincipal] = useState<number>(1000);
  const [expRate, setExpRate] = useState<number>(5);
  const [expYears, setExpYears] = useState<number>(3);
  const [isDecay, setIsDecay] = useState<boolean>(false);

  // Categories list
  const categories = [
    "All",
    "Algebra",
    "Advanced Math",
    "Problem Solving & Data Analysis",
    "Geometry & Trigonometry",
    "Bluebook Reference Sheet",
    "Reading & Writing",
  ];

  const currentFormulas = formulaRules && formulaRules.length > 0 ? formulaRules : ALL_MATH_FORMULAS;

  const filtered = useMemo(() => {
    return currentFormulas.filter((card) => {
      // Category / Domain matching
      if (activeCategory === "Bluebook Reference Sheet") {
        if (!card.isProvidedOnTest) return false;
      } else if (activeCategory === "Reading & Writing") {
        if (card.category !== "Reading & Writing") return false;
      } else if (activeCategory !== "All") {
        if (card.domain !== activeCategory) return false;
      }

      // Filter by provided / must memorize
      if (filterProvidedOnly && !card.isProvidedOnTest) return false;
      if (filterMustMemorizeOnly && (card.isProvidedOnTest || card.category !== "Math")) return false;

      // Search matching
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = card.title.toLowerCase().includes(q);
        const matchesFormula = card.formula.toLowerCase().includes(q);
        const matchesNotes = card.notes.toLowerCase().includes(q);
        const matchesDomain = card.domain.toLowerCase().includes(q);
        const matchesTraps = card.commonTraps.toLowerCase().includes(q);
        const matchesVars = card.variables.some(
          (v) => v.symbol.toLowerCase().includes(q) || v.meaning.toLowerCase().includes(q)
        );
        return matchesTitle || matchesFormula || matchesNotes || matchesDomain || matchesTraps || matchesVars;
      }
      return true;
    });
  }, [currentFormulas, search, activeCategory, filterProvidedOnly, filterMustMemorizeOnly]);

  const handleCopyFormula = (id: string, formula: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFlashcardReveal = (id: string) => {
    setRevealedFlashcards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Solver calculations
  const quadDiscriminant = quadB * quadB - 4 * quadA * quadC;
  const quadRoot1 =
    quadA !== 0 && quadDiscriminant >= 0 ? ((-quadB + Math.sqrt(quadDiscriminant)) / (2 * quadA)).toFixed(3) : null;
  const quadRoot2 =
    quadA !== 0 && quadDiscriminant >= 0 ? ((-quadB - Math.sqrt(quadDiscriminant)) / (2 * quadA)).toFixed(3) : null;
  const quadVertexX = quadA !== 0 ? (-quadB / (2 * quadA)).toFixed(3) : "0";
  const quadVertexY =
    quadA !== 0 ? (quadA * Math.pow(-quadB / (2 * quadA), 2) + quadB * (-quadB / (2 * quadA)) + quadC).toFixed(3) : "0";

  const slopeVal = slopeX2 - slopeX1 !== 0 ? ((slopeY2 - slopeY1) / (slopeX2 - slopeX1)).toFixed(3) : "Undefined (Vertical)";
  const slopeDistance = Math.sqrt(Math.pow(slopeX2 - slopeX1, 2) + Math.pow(slopeY2 - slopeY1, 2)).toFixed(3);
  const slopeMidX = ((slopeX1 + slopeX2) / 2).toFixed(2);
  const slopeMidY = ((slopeY1 + slopeY2) / 2).toFixed(2);

  const pctDiff = pctNew - pctOrig;
  const pctChangeVal = pctOrig !== 0 ? ((pctDiff / pctOrig) * 100).toFixed(2) : "0";

  const circleCenterX = (-circleD / 2).toFixed(2);
  const circleCenterY = (-circleE / 2).toFixed(2);
  const circleR2 = Math.pow(-circleD / 2, 2) + Math.pow(-circleE / 2, 2) + circleF;
  const circleRadius = circleR2 > 0 ? Math.sqrt(circleR2).toFixed(3) : "Invalid (r² ≤ 0)";

  const arcLen = ((arcAngleDeg / 360) * 2 * Math.PI * arcRadius).toFixed(3);
  const sectorArea = ((arcAngleDeg / 360) * Math.PI * Math.pow(arcRadius, 2)).toFixed(3);

  const expMultiplier = isDecay ? 1 - expRate / 100 : 1 + expRate / 100;
  const expFinalValue = (expPrincipal * Math.pow(expMultiplier, expYears)).toFixed(2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Hero Banner with Quick Stats */}
      <div className="bg-gradient-to-r from-slate-950 via-cyan-950/80 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden border border-cyan-500/40">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-start justify-between flex-wrap gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              <BookMarked className="w-3.5 h-3.5 text-cyan-400" />
              DIGITAL SAT MATHEMATICS QUANTUM CODEX
            </div>
            <h1 className="text-2xl sm:text-4xl font-orbitron font-bold tracking-wide text-white drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">
              Official Reference Guide & Formulas
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm font-space leading-relaxed">
              Exhaustive reference library covering all College Board provided formulas, must-memorize unprovided identities, 
              Desmos fast hacks, step-by-step worked SAT examples, and trap answer defenses across all 4 math domains.
            </p>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 pt-2 flex-wrap text-xs text-slate-300 font-mono">
              <div className="flex items-center gap-1.5 scifi-glass-card px-3 py-1.5 rounded-xl border border-cyan-500/30">
                <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                <span><strong className="text-cyan-300">{currentFormulas.filter((f) => f.category === "Math").length}</strong> Math Identities</span>
              </div>
              <div className="flex items-center gap-1.5 scifi-glass-card px-3 py-1.5 rounded-xl border border-cyan-500/30">
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                <span><strong className="text-cyan-300">{currentFormulas.filter((f) => f.isProvidedOnTest).length}</strong> Given Sheet</span>
              </div>
              <div className="flex items-center gap-1.5 scifi-glass-card px-3 py-1.5 rounded-xl border border-cyan-500/30">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Interactive Solvers Active</span>
              </div>

              {onOpenAdminRules && (
                <button
                  onClick={() => onOpenAdminRules()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all ml-auto cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-900" />
                  <span>Admin: Edit Rules ({currentFormulas.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Flashcard Study Mode Toggle */}
          <div className="scifi-glass-card p-4 rounded-2xl border border-cyan-500/30 space-y-3 text-right">
            <div className="flex items-center justify-end gap-2 text-xs font-mono font-bold text-cyan-300">
              <span>Flashcard Recall Mode</span>
              <button
                onClick={() => {
                  setIsFlashcardMode(!isFlashcardMode);
                  setRevealedFlashcards({});
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isFlashcardMode ? "bg-cyan-500 shadow-[0_0_8px_#00f0ff]" : "bg-slate-800"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isFlashcardMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <p className="text-[10px] font-mono text-slate-400 max-w-[200px]">
              {isFlashcardMode
                ? "Formulas hidden. Test your neural memory before clicking to reveal!"
                : "Standard mode: Full formula and step-by-step walkthroughs visible."}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="space-y-4 scifi-glass-card p-4 sm:p-6 rounded-3xl border border-cyan-500/20 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                    : "bg-slate-900 text-slate-400 border border-cyan-500/20 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search formula, variable, rule, or trap..."
              className="w-full pl-10 pr-4 py-2 text-xs font-mono bg-slate-900 border border-cyan-500/30 rounded-xl focus:outline-none focus:border-cyan-400 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Secondary Sub-filters */}
        <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-cyan-500/20 text-xs font-mono">
          <span className="text-slate-400 font-semibold">Quick Filters:</span>
          <button
            onClick={() => {
              setFilterProvidedOnly(!filterProvidedOnly);
              if (!filterProvidedOnly) setFilterMustMemorizeOnly(false);
            }}
            className={`px-3 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
              filterProvidedOnly
                ? "bg-amber-950 text-amber-300 border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]"
                : "bg-slate-900 text-slate-400 border-cyan-500/20 hover:text-white"
            }`}
          >
            📋 Official Bluebook Given Formulas Only
          </button>
          <button
            onClick={() => {
              setFilterMustMemorizeOnly(!filterMustMemorizeOnly);
              if (!filterMustMemorizeOnly) setFilterProvidedOnly(false);
            }}
            className={`px-3 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
              filterMustMemorizeOnly
                ? "bg-rose-950 text-rose-300 border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                : "bg-slate-900 text-slate-400 border-cyan-500/20 hover:text-white"
            }`}
          >
            🧠 Must Memorize (Not on Test Sheet)
          </button>
          <span className="text-slate-400 ml-auto font-mono text-[11px]">
            Showing <strong className="text-cyan-400">{filtered.length}</strong> of {ALL_MATH_FORMULAS.length} references
          </span>
        </div>
      </div>

      {/* Formula Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((card) => {
          const isExpanded = expandedCards[card.id] || false;
          const isRevealed = revealedFlashcards[card.id] || !isFlashcardMode;

          return (
            <div
              key={card.id}
              className={`scifi-glass-card rounded-3xl p-6 border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
                card.isProvidedOnTest ? "border-amber-500/30 hover:border-amber-400/50" : "border-cyan-500/30 hover:border-cyan-400/60"
              }`}
            >
              <div className="space-y-3.5">
                {/* Header Badge & Title */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[9px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded ${
                          card.domain === "Algebra"
                            ? "bg-cyan-950 text-cyan-300 border border-cyan-500/30"
                            : card.domain === "Advanced Math"
                            ? "bg-indigo-950 text-indigo-300 border border-indigo-500/30"
                            : card.domain === "Problem Solving & Data Analysis"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                            : card.domain === "Geometry & Trigonometry"
                            ? "bg-sky-950 text-sky-300 border border-sky-500/30"
                            : "bg-rose-950 text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {card.domain}
                      </span>
                      {card.isProvidedOnTest ? (
                        <span className="text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                          <span>✓ Given on Exam Reference</span>
                        </span>
                      ) : card.category === "Math" ? (
                        <span className="text-[9px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded">
                          ★ Must Memorize
                        </span>
                      ) : null}
                    </div>
                    <h2 className="text-base font-orbitron font-bold text-white mt-1.5">{card.title}</h2>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Admin Direct Edit Button */}
                    {onOpenAdminRules && isAdmin && (
                      <button
                        onClick={() => onOpenAdminRules(card.id)}
                        title="Edit this rule in Admin Center"
                        className="p-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/40 transition-colors flex items-center gap-1 text-xs font-mono font-bold cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                    )}

                    {/* Copy Formula Button */}
                    <button
                      onClick={() => handleCopyFormula(card.id, card.formula)}
                      title="Copy formula text"
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-cyan-500/20 transition-colors cursor-pointer"
                    >
                      {copiedId === card.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    {/* Interactive Solver Launcher Button */}
                    {card.interactiveType && (
                      <button
                        onClick={() => setActiveSolverItem(card)}
                        title="Open interactive calculator solver"
                        className="p-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 transition-colors flex items-center gap-1 text-xs font-mono font-bold cursor-pointer"
                      >
                        <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="hidden sm:inline">Solver</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Primary Formula Display Block */}
                {isFlashcardMode && !isRevealed ? (
                  <button
                    onClick={() => toggleFlashcardReveal(card.id)}
                    className="w-full py-6 px-4 rounded-2xl bg-slate-950 hover:bg-slate-900 text-amber-300 text-xs font-mono font-bold text-center border border-cyan-500/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <RotateCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500 text-cyan-400" />
                    <span>Click to Flip Flashcard & Reveal Formula</span>
                  </button>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-950 text-cyan-300 font-mono text-xs sm:text-sm font-bold tracking-wide overflow-x-auto border border-cyan-500/30 shadow-[inset_0_0_10px_rgba(6,182,212,0.2)]">
                    {card.formula}
                  </div>
                )}

                {/* Variable Breakdown */}
                {isRevealed && card.variables && card.variables.length > 0 && (
                  <div className="bg-slate-950/60 p-3 rounded-2xl border border-cyan-500/10 space-y-1.5 text-xs font-mono">
                    <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                      Variable Key & Meaning:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                      {card.variables.map((v, i) => (
                        <div key={i} className="flex items-baseline gap-1.5 text-slate-300">
                          <span className="font-mono font-bold text-cyan-400 shrink-0">{v.symbol}:</span>
                          <span className="text-slate-400 font-space">{v.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* When to Use Scenario */}
                {isRevealed && (
                  <div className="flex items-start gap-2 text-xs font-space text-slate-300">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">When to Use: </strong>
                      <span>{card.whenToUse}</span>
                    </div>
                  </div>
                )}

                {/* Extended Details (Step-by-step example, traps, Desmos hacks) */}
                {isRevealed && isExpanded && (
                  <div className="space-y-3 pt-2 border-t border-cyan-500/20 text-xs animate-in fade-in duration-200">
                    {/* Worked Example Problem */}
                    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/20 space-y-2">
                      <div className="flex items-center gap-1.5 text-cyan-300 font-mono font-bold text-xs uppercase tracking-wide">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Real SAT Worked Example</span>
                      </div>
                      <p className="font-space text-slate-200 text-[12px]">{card.exampleProblem}</p>
                      <div className="space-y-1 pl-2 border-l-2 border-cyan-500/30 pt-1 text-[11px] text-slate-300 font-mono">
                        {card.stepByStepSolution.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className="text-cyan-400 font-bold">{idx + 1}.</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Common Trap Alert */}
                    <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-2 text-rose-200 font-space">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white font-bold">College Board Trap: </strong>
                        <span className="text-[11px] text-rose-300">{card.commonTraps}</span>
                      </div>
                    </div>

                    {/* Desmos Fast Hack */}
                    {card.desmosHack && (
                      <div className="p-3 rounded-2xl bg-slate-950 border border-cyan-500/20 text-cyan-200 flex items-start gap-2 font-mono text-[11px]">
                        <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white font-sans font-bold">Desmos Shortcut: </strong>
                          <span className="text-cyan-300">{card.desmosHack}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Expand / Collapse Accordion Action */}
              {isRevealed && (
                <button
                  onClick={() => toggleExpand(card.id)}
                  className="w-full pt-2 flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors border-t border-cyan-500/20 cursor-pointer"
                >
                  <span>{isExpanded ? "Hide SAT Example & Desmos Hacks" : "View Step-by-Step SAT Example & Traps"}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ==================================================== */}
      {/* INTERACTIVE FORMULA SOLVER & CALCULATION MODAL */}
      {/* ==================================================== */}
      {activeSolverItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="scifi-glass-card rounded-3xl max-w-2xl w-full border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-slate-950 text-white flex items-center justify-between border-b border-cyan-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500 text-black flex items-center justify-center font-bold shadow-[0_0_12px_#00f0ff]">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase text-cyan-400 font-bold">
                    Interactive Formula Sandbox
                  </div>
                  <h3 className="text-lg font-orbitron font-bold text-white">{activeSolverItem.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setActiveSolverItem(null)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-cyan-500/30 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Interactive Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-200 text-xs font-space">
              <div className="p-3.5 rounded-2xl bg-slate-950 text-cyan-300 font-mono text-xs font-bold tracking-wide border border-cyan-500/30">
                Formula: {activeSolverItem.formula}
              </div>

              {/* 1. Quadratic Equation Solver */}
              {activeSolverItem.interactiveType === "quadratic" && (
                <div className="space-y-4">
                  <div className="text-xs font-mono font-bold text-cyan-300">
                    Input Quadratic Coefficients (ax² + bx + c = 0):
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">a (quadratic):</label>
                      <input
                        type="number"
                        value={quadA}
                        onChange={(e) => setQuadA(parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 font-mono font-bold text-white text-center focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">b (linear):</label>
                      <input
                        type="number"
                        value={quadB}
                        onChange={(e) => setQuadB(parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 font-mono font-bold text-white text-center focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">c (constant):</label>
                      <input
                        type="number"
                        value={quadC}
                        onChange={(e) => setQuadC(parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 font-mono font-bold text-white text-center focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Calculated Output Box */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-2">
                    <div className="font-mono font-bold text-cyan-300 text-xs uppercase tracking-wide">
                      Live Solution & Psychometrics:
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/20">
                        <span className="text-slate-400 font-mono">Discriminant (b² - 4ac):</span>
                        <div className="font-mono font-bold text-cyan-300 text-sm mt-0.5">
                          Δ = {quadDiscriminant}{" "}
                          <span className="text-xs font-normal">
                            ({quadDiscriminant > 0 ? "2 Real Roots" : quadDiscriminant === 0 ? "1 Double Root" : "0 Real Roots"})
                          </span>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/20">
                        <span className="text-slate-400 font-mono">Parabola Vertex (h, k):</span>
                        <div className="font-mono font-bold text-cyan-300 text-sm mt-0.5">
                          ({quadVertexX}, {quadVertexY})
                        </div>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/20 col-span-2">
                        <span className="text-slate-400 font-mono">Roots / Solutions:</span>
                        <div className="font-mono font-bold text-white text-sm mt-0.5">
                          {quadDiscriminant >= 0 ? (
                            <span>
                              x₁ = {quadRoot1} &nbsp;|&nbsp; x₂ = {quadRoot2}
                            </span>
                          ) : (
                            <span className="text-rose-400">No real roots (2 complex conjugate roots)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Slope & Distance Solver */}
              {(activeSolverItem.interactiveType === "slope" || activeSolverItem.interactiveType === "distanceMidpoint") && (
                <div className="space-y-4">
                  <div className="text-xs font-mono font-bold text-cyan-300">
                    Input Coordinates of Two Points (x₁, y₁) and (x₂, y₂):
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">x₁:</label>
                      <input
                        type="number"
                        value={slopeX1}
                        onChange={(e) => setSlopeX1(parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 font-mono font-bold text-center text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">y₁:</label>
                      <input
                        type="number"
                        value={slopeY1}
                        onChange={(e) => setSlopeY1(parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 font-mono font-bold text-center text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">x₂:</label>
                      <input
                        type="number"
                        value={slopeX2}
                        onChange={(e) => setSlopeX2(parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 font-mono font-bold text-center text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">y₂:</label>
                      <input
                        type="number"
                        value={slopeY2}
                        onChange={(e) => setSlopeY2(parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 font-mono font-bold text-center text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-2">
                    <div className="font-mono font-bold text-cyan-300 text-xs uppercase tracking-wide">
                      Coordinate Geometry Computations:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/20">
                        <span className="text-slate-400 font-mono">Slope m:</span>
                        <div className="font-mono font-bold text-cyan-300 text-sm mt-0.5">{slopeVal}</div>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/20">
                        <span className="text-slate-400 font-mono">Distance d:</span>
                        <div className="font-mono font-bold text-cyan-300 text-sm mt-0.5">{slopeDistance} units</div>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/20">
                        <span className="text-slate-400 font-mono">Midpoint M:</span>
                        <div className="font-mono font-bold text-cyan-300 text-sm mt-0.5">({slopeMidX}, {slopeMidY})</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Percent Change Calculator */}
              {activeSolverItem.interactiveType === "percentChange" && (
                <div className="space-y-4">
                  <div className="text-xs font-mono font-bold text-cyan-300">Input Starting & New Values:</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">Original Starting Price / Value:</label>
                      <input
                        type="number"
                        value={pctOrig}
                        onChange={(e) => setPctOrig(parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 font-mono font-bold text-center text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">New Final Price / Value:</label>
                      <input
                        type="number"
                        value={pctNew}
                        onChange={(e) => setPctNew(parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 font-mono font-bold text-center text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-2">
                    <div className="font-mono font-bold text-cyan-300 text-xs uppercase tracking-wide">
                      Percent Change Breakdown:
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/20">
                        <span className="text-slate-400 font-mono">Absolute Difference:</span>
                        <div className="font-mono font-bold text-white text-sm mt-0.5">{pctDiff > 0 ? `+${pctDiff}` : pctDiff}</div>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/20">
                        <span className="text-slate-400 font-mono">Percentage Shift:</span>
                        <div
                          className={`font-mono font-bold text-sm mt-0.5 ${
                            parseFloat(pctChangeVal) >= 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {parseFloat(pctChangeVal) >= 0 ? `+${pctChangeVal}% (Increase)` : `${pctChangeVal}% (Discount/Decrease)`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Circle Center & Radius Calculator */}
              {activeSolverItem.interactiveType === "circle" && (
                <div className="space-y-4">
                  <div className="text-xs font-mono font-bold text-cyan-300">
                    Input Coefficients for Expanded Circle Equation (x² + y² + Dx + Ey = F):
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">D (x-term):</label>
                      <input
                        type="number"
                        value={circleD}
                        onChange={(e) => setCircleD(parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 font-mono font-bold text-center text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">E (y-term):</label>
                      <input
                        type="number"
                        value={circleE}
                        onChange={(e) => setCircleE(parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 font-mono font-bold text-center text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">F (constant right):</label>
                      <input
                        type="number"
                        value={circleF}
                        onChange={(e) => setCircleF(parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 font-mono font-bold text-center text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-2">
                    <div className="font-mono font-bold text-cyan-300 text-xs uppercase tracking-wide">
                      Standard Form: (x - h)² + (y - k)² = r²
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/20">
                        <span className="text-slate-400 font-mono">Center (h, k):</span>
                        <div className="font-mono font-bold text-cyan-300 text-sm mt-0.5">
                          ({circleCenterX}, {circleCenterY})
                        </div>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/20">
                        <span className="text-slate-400 font-mono">Radius r:</span>
                        <div className="font-mono font-bold text-cyan-300 text-sm mt-0.5">{circleRadius}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Arc Length & Sector Area */}
              {activeSolverItem.interactiveType === "arcSector" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">Radius (r):</label>
                      <input
                        type="number"
                        value={arcRadius}
                        onChange={(e) => setArcRadius(parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 font-mono font-bold text-center text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">Central Angle (Degrees θ):</label>
                      <input
                        type="number"
                        value={arcAngleDeg}
                        onChange={(e) => setArcAngleDeg(parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 font-mono font-bold text-center text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-2">
                    <div className="font-mono font-bold text-cyan-300 text-xs uppercase tracking-wide">
                      Arc & Sector Output:
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/20">
                        <span className="text-slate-400 font-mono">Arc Length s:</span>
                        <div className="font-mono font-bold text-cyan-300 text-sm mt-0.5">{arcLen} units</div>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/20">
                        <span className="text-slate-400 font-mono">Sector Area:</span>
                        <div className="font-mono font-bold text-cyan-300 text-sm mt-0.5">{sectorArea} sq units</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. Exponential Growth & Depreciation */}
              {activeSolverItem.interactiveType === "exponential" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">Initial Amount (a):</label>
                      <input
                        type="number"
                        value={expPrincipal}
                        onChange={(e) => setExpPrincipal(parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 font-mono font-bold text-center text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">Rate (% per cycle):</label>
                      <input
                        type="number"
                        value={expRate}
                        onChange={(e) => setExpRate(parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 font-mono font-bold text-center text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">Time (t years):</label>
                      <input
                        type="number"
                        value={expYears}
                        onChange={(e) => setExpYears(parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 font-mono font-bold text-center text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsDecay(false)}
                      className={`px-3 py-1.5 rounded-xl font-mono font-bold border transition-colors cursor-pointer ${
                        !isDecay ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_8px_#00f0ff]" : "bg-slate-900 text-slate-400 border-cyan-500/20"
                      }`}
                    >
                      Growth (1 + r)
                    </button>
                    <button
                      onClick={() => setIsDecay(true)}
                      className={`px-3 py-1.5 rounded-xl font-mono font-bold border transition-colors cursor-pointer ${
                        isDecay ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_8px_#00f0ff]" : "bg-slate-900 text-slate-400 border-cyan-500/20"
                      }`}
                    >
                      Decay / Depreciation (1 - r)
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-2">
                    <div className="font-mono font-bold text-cyan-300 text-xs uppercase tracking-wide">
                      Exponential Model: y = {expPrincipal}({expMultiplier.toFixed(3)})^{expYears}
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/20">
                      <span className="text-slate-400 font-mono">Final Value after {expYears} cycles:</span>
                      <div className="font-mono font-bold text-emerald-400 text-base mt-0.5">${expFinalValue}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-cyan-500/30 flex justify-end">
              <button
                onClick={() => setActiveSolverItem(null)}
                className="px-5 py-2 rounded-xl bg-cyan-500 text-black font-mono font-bold hover:bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-colors cursor-pointer"
              >
                Close Sandbox
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
