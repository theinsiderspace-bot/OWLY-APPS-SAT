import React, { useState } from "react";
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  Target,
  ArrowRight,
  RotateCw,
  FileCheck,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
} from "lucide-react";
import { StudyPlan, SATDomain } from "../types";
import { OwlyLogoIcon } from "./OwlyLogo";

interface StudyPlanViewProps {
  studyPlan: StudyPlan;
  onUpdatePlan: (newPlan: StudyPlan) => void;
  targetScore: number;
  setTargetScore: (score: number) => void;
  onNavigateToPractice: (domain?: SATDomain) => void;
  uploadedMaterialsSummary?: string;
}

export const StudyPlanView: React.FC<StudyPlanViewProps> = ({
  studyPlan,
  onUpdatePlan,
  targetScore,
  setTargetScore,
  onNavigateToPractice,
  uploadedMaterialsSummary,
}) => {
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [currentScore, setCurrentScore] = useState<number>(
    studyPlan.targetScoreBreakdown.mathCurrent + studyPlan.targetScoreBreakdown.rwCurrent || 1220
  );
  const [weeklyHours, setWeeklyHours] = useState<number>(8);
  const [testDate, setTestDate] = useState<string>("2026-10-15");
  const [expandedWeek, setExpandedWeek] = useState<number>(1);
  const [selectedWeakDomains, setSelectedWeakDomains] = useState<string[]>([
    "Algebra",
    "Standard English Conventions",
  ]);

  // Calculate stats
  const totalTasks = studyPlan.weeklySchedule.reduce((acc, w) => acc + w.days.length, 0);
  const completedTasks = studyPlan.weeklySchedule.reduce(
    (acc, w) => acc + w.days.filter((d) => d.completed).length,
    0
  );
  const planProgressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Toggle daily task completion
  const handleToggleTask = (weekNumber: number, taskId: string) => {
    const updatedWeeks = studyPlan.weeklySchedule.map((week) => {
      if (week.weekNumber !== weekNumber) return week;
      return {
        ...week,
        days: week.days.map((day) =>
          day.id === taskId ? { ...day, completed: !day.completed } : day
        ),
      };
    });

    onUpdatePlan({
      ...studyPlan,
      weeklySchedule: updatedWeeks,
    });
  };

  // Generate customized AI study plan
  const handleGenerateAIPlan = async () => {
    setIsRegenerating(true);
    try {
      const res = await fetch("/api/gemini/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetScore,
          currentScore,
          testDate,
          weeklyHours,
          weakAreas: selectedWeakDomains,
          uploadedSummary: uploadedMaterialsSummary || "",
        }),
      });

      if (!res.ok) throw new Error("Failed to generate plan");
      const data = await res.json();

      const newPlan: StudyPlan = {
        id: `plan-${Date.now()}`,
        planTitle: data.planTitle || "Personalized Digital SAT Mastery Plan",
        strategySummary: data.strategySummary || "Strategic path to score maximization.",
        targetScoreBreakdown: data.targetScoreBreakdown || {
          mathTarget: Math.round(targetScore * 0.51),
          rwTarget: Math.round(targetScore * 0.49),
          mathCurrent: Math.round(currentScore * 0.5),
          rwCurrent: Math.round(currentScore * 0.5),
        },
        weeklySchedule: (data.weeklySchedule || []).map((w: any, wIdx: number) => ({
          ...w,
          days: (w.days || []).map((d: any, dIdx: number) => ({
            ...d,
            id: `task-${wIdx + 1}-${dIdx + 1}-${Date.now()}`,
            completed: false,
          })),
        })),
        highYieldFormulasAndRules: data.highYieldFormulasAndRules || studyPlan.highYieldFormulasAndRules,
        testDayTips: data.testDayTips || studyPlan.testDayTips,
        createdAt: new Date().toISOString(),
      };

      onUpdatePlan(newPlan);
      setExpandedWeek(1);
    } catch (err) {
      console.error("Failed to generate study plan:", err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const domainOptions = [
    "Algebra",
    "Advanced Math",
    "Problem Solving & Data Analysis",
    "Geometry & Trigonometry",
    "Information and Ideas",
    "Craft and Structure",
    "Standard English Conventions",
    "Expression of Ideas",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Banner & Plan Progress (Quantum Trajectory Hero Block) */}
      <div className="bg-gradient-to-br from-cyan-950/90 via-slate-950/90 to-indigo-950/90 rounded-3xl p-6 sm:p-8 text-white shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden border border-cyan-500/40">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <OwlyLogoIcon size="sm" />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                OWLY AI ADAPTIVE VECTOR ROADMAP
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-orbitron font-bold tracking-wide text-white drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">
              {studyPlan.planTitle}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm font-space leading-relaxed max-w-2xl">
              {studyPlan.strategySummary}
            </p>

            {uploadedMaterialsSummary && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Incorporating psychometric telemetry from uploaded files</span>
              </div>
            )}
          </div>

          {/* Progress & Target Score Gauge */}
          <div className="scifi-glass-card rounded-2xl p-5 border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">MISSION COMPLETION</span>
              <span className="text-sm font-black font-mono text-cyan-300 drop-shadow-[0_0_8px_#00f0ff]">{planProgressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-500 rounded-full shadow-[0_0_8px_#00f0ff]"
                style={{ width: `${planProgressPercent}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-center">
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/20">
                <div className="text-[9px] uppercase font-mono font-bold text-slate-400">Nodes Resolved</div>
                <div className="text-base font-black font-mono text-white">
                  {completedTasks} / {totalTasks}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/20">
                <div className="text-[9px] uppercase font-mono font-bold text-slate-400">Score Delta</div>
                <div className="text-base font-black font-mono text-emerald-400 drop-shadow-[0_0_6px_#10b981]">
                  +{targetScore - currentScore} PTS
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Customizer & Goals (Cockpit Config Card) */}
      <div className="scifi-glass-card rounded-3xl p-6 border border-cyan-500/20 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-cyan-500/20 pb-4">
          <div>
            <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest mb-1">ROADMAP PARAMETERS</div>
            <h2 className="text-base font-orbitron font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              Score Targets & Study Commitment Parameters
            </h2>
          </div>
          <button
            onClick={handleGenerateAIPlan}
            disabled={isRegenerating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-xs sm:text-sm font-mono font-black transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            <RotateCw className={`w-4 h-4 ${isRegenerating ? "animate-spin text-black" : ""}`} />
            {isRegenerating ? "Synthesizing AI Plan..." : "Regenerate Adaptive Trajectory"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Target Score */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
              <span>Target Score</span>
              <span className="font-mono text-cyan-400 font-extrabold text-sm">{targetScore}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="1600"
              step="10"
              value={targetScore}
              onChange={(e) => setTargetScore(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Baseline Score */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
              <span>Baseline Score</span>
              <span className="font-mono text-white font-extrabold text-sm">{currentScore}</span>
            </div>
            <input
              type="range"
              min="800"
              max="1550"
              step="10"
              value={currentScore}
              onChange={(e) => setCurrentScore(Number(e.target.value))}
              className="w-full accent-indigo-400"
            />
          </div>

          {/* Weekly Commitment */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
              <span>Study Hours / Week</span>
              <span className="font-mono text-amber-400 font-extrabold text-sm">{weeklyHours} hrs</span>
            </div>
            <input
              type="range"
              min="2"
              max="25"
              step="1"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(Number(e.target.value))}
              className="w-full accent-amber-400"
            />
          </div>

          {/* Target Exam Date */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/20 space-y-2">
            <label className="text-xs font-mono font-bold text-slate-300 block">Target Exam Date</label>
            <input
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-slate-950 text-xs font-mono font-semibold text-cyan-300 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Priority Focus Areas */}
        <div className="space-y-2 pt-2 border-t border-cyan-500/10">
          <label className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">Priority Focus Domains</label>
          <div className="flex flex-wrap gap-2">
            {domainOptions.map((domain) => {
              const isSelected = selectedWeakDomains.includes(domain);
              return (
                <button
                  key={domain}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedWeakDomains(selectedWeakDomains.filter((d) => d !== domain));
                    } else {
                      setSelectedWeakDomains([...selectedWeakDomains, domain]);
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                    isSelected
                      ? "bg-cyan-950 text-cyan-300 border-cyan-500/60 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                      : "bg-slate-900/80 text-slate-400 border-slate-800 hover:border-cyan-500/30"
                  }`}
                >
                  {domain}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weekly Schedule Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">SCHEDULE TIMELINE</div>
            <h2 className="text-lg font-orbitron font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              Weekly Milestone Roadmap & Daily Tasks
            </h2>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-sm bg-cyan-950 text-cyan-300 border border-cyan-500/40">
            {studyPlan.weeklySchedule.length} WEEKS STRUCTURED
          </span>
        </div>

        <div className="space-y-4">
          {studyPlan.weeklySchedule.map((week) => {
            const isExpanded = expandedWeek === week.weekNumber;
            const weekCompletedCount = week.days.filter((d) => d.completed).length;
            const isWeekAllDone = week.days.length > 0 && weekCompletedCount === week.days.length;

            return (
              <div
                key={week.weekNumber}
                className="scifi-glass-card rounded-3xl border border-cyan-500/20 overflow-hidden transition-all"
              >
                {/* Week Header Accordion */}
                <div
                  onClick={() => setExpandedWeek(isExpanded ? 0 : week.weekNumber)}
                  className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-cyan-950/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-mono font-black text-sm shrink-0 border ${
                        isWeekAllDone
                          ? "bg-emerald-950 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_#10b981]"
                          : "bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_#00f0ff]"
                      }`}
                    >
                      W{week.weekNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-orbitron font-bold text-white text-base">{week.title}</h3>
                        <span className="px-2.5 py-0.5 rounded-sm text-[10px] font-mono font-bold bg-slate-900 text-cyan-300 border border-cyan-500/30">
                          {week.focusDomain}
                        </span>
                      </div>
                      <p className="text-xs font-space text-slate-400 mt-0.5">{week.goal}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{week.estimatedHours} hrs</span>
                      <span className="text-slate-600">•</span>
                      <span className="font-bold text-cyan-300">
                        {weekCompletedCount}/{week.days.length} done
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                </div>

                {/* Week Body (Tasks) */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-cyan-500/10 space-y-4 bg-slate-950/40">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {week.days.map((task) => (
                        <div
                          key={task.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            task.completed
                              ? "bg-emerald-950/40 border-emerald-500/40 text-slate-300"
                              : "bg-slate-900/90 border-cyan-500/20 hover:border-cyan-500/40"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <button
                              onClick={() => handleToggleTask(week.weekNumber, task.id)}
                              className="mt-0.5 text-slate-400 hover:text-cyan-400 transition-colors shrink-0"
                            >
                              {task.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950 shadow-[0_0_6px_#10b981]" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-600 hover:text-cyan-400" />
                              )}
                            </button>

                            <div className="flex-1 space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-mono font-bold text-white">{task.day}: {task.topic}</span>
                                <span
                                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-sm border ${
                                    task.activityType === "Timed Drill"
                                      ? "bg-amber-950 text-amber-300 border-amber-500/40"
                                      : task.activityType === "Mock Section"
                                      ? "bg-purple-950 text-purple-300 border-purple-500/40"
                                      : "bg-cyan-950 text-cyan-300 border-cyan-500/40"
                                  }`}
                                >
                                  {task.activityType}
                                </span>
                              </div>
                              <p className="text-xs font-space text-slate-300 leading-relaxed">{task.description}</p>
                              <div className="flex items-center justify-between pt-2">
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                                  <Clock className="w-3 h-3 text-cyan-400" />
                                  {task.durationMinutes} min
                                </span>
                                <button
                                  onClick={() => onNavigateToPractice()}
                                  className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                                >
                                  Engage
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Milestone Checkpoint */}
                    <div className="mt-4 p-4 rounded-2xl bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-between flex-wrap gap-3 text-xs">
                      <div className="flex items-center gap-2.5 text-white">
                        <Award className="w-5 h-5 text-cyan-400 shrink-0" />
                        <div>
                          <span className="font-mono font-bold text-cyan-300">Week {week.weekNumber} Milestone: </span>
                          <span className="text-slate-300 font-space">{week.milestoneCheckpoint}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigateToPractice()}
                        className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-mono font-bold hover:bg-cyan-400 transition-colors shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                      >
                        Launch Checkpoint Test
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* High-Yield Rule Cards & Test Day Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Yield Rules */}
        <div className="scifi-glass-card rounded-3xl p-6 border border-cyan-500/20 space-y-4">
          <div className="flex items-center gap-2 text-white font-orbitron font-bold text-base">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3>High-Yield SAT Rules & Quick Identities</h3>
          </div>
          <div className="space-y-3">
            {studyPlan.highYieldFormulasAndRules.slice(0, 4).map((rule, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/20 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cyan-300">{rule.rule}</span>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-sm bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    {rule.category}
                  </span>
                </div>
                <p className="text-slate-300 font-mono text-[11px]">{rule.example}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Test Day Tactical Execution */}
        <div className="scifi-glass-card rounded-3xl p-6 border border-cyan-500/20 space-y-4">
          <div className="flex items-center gap-2 text-white font-orbitron font-bold text-base">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3>Test-Day Psychological & Tactical Rules</h3>
          </div>
          <div className="space-y-3">
            {studyPlan.testDayTips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 text-xs text-slate-300">
                <div className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono font-bold flex items-center justify-center shrink-0 text-xs shadow-[0_0_6px_#10b981]">
                  {idx + 1}
                </div>
                <p className="leading-relaxed font-space pt-0.5">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
