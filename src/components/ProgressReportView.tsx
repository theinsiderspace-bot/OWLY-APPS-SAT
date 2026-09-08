import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Target,
  Award,
  Clock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  BarChart3,
  CheckCircle2,
  Radio,
  Zap,
  Cpu,
  Activity,
} from "lucide-react";
import { UserPerformanceStats, SATDomain } from "../types";

interface ProgressReportViewProps {
  stats: UserPerformanceStats;
  targetScore: number;
  onNavigateToPractice: (domain?: SATDomain) => void;
  onNavigateToMaterials?: () => void;
  isStudent?: boolean;
}

export const ProgressReportView: React.FC<ProgressReportViewProps> = ({
  stats,
  targetScore,
  onNavigateToPractice,
  onNavigateToMaterials,
  isStudent = false,
}) => {
  // Chart data for domain breakdown
  const domainData = Object.entries(stats.categoryStats).map(([domain, data]) => {
    const item = data as { answered: number; correct: number; accuracy: number };
    return {
      name: domain.length > 16 ? domain.slice(0, 14) + "..." : domain,
      fullName: domain,
      accuracy: item.accuracy,
      answered: item.answered,
      correct: item.correct,
    };
  });

  const pieData = [
    { name: "Optimal (Correct)", value: stats.totalCorrect, color: "#00f0ff" },
    {
      name: "Anomalies (Review)",
      value: Math.max(0, stats.totalQuestionsAnswered - stats.totalCorrect),
      color: "#f43f5e",
    },
  ];

  // Identify weak areas (< 75% accuracy or lowest accuracy)
  const weakDomains = Object.entries(stats.categoryStats)
    .map(([domain, data]) => [domain, data as { answered: number; correct: number; accuracy: number }] as const)
    .filter(([_, data]) => data.answered > 0 && data.accuracy < 75)
    .sort((a, b) => a[1].accuracy - b[1].accuracy);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* View Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/20">
        <div>
          <div className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>QUANTUM TELEMETRY & ACCURACY SENSORS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-orbitron font-bold text-white tracking-wide mt-1">
            Performance Matrix & Analytics
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-sm bg-cyan-950/80 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            SYNAPSE v4.2 ONLINE
          </span>
        </div>
      </div>

      {/* Top Metrics Grid (Sci-Fi Telemetry Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Projected Score HUD Card */}
        <div className="bg-gradient-to-br from-cyan-950/80 to-slate-950/90 rounded-2xl p-5 text-white border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.2)] space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-widest">
            <span>PROJECTED SCORE</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black font-mono text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
            {stats.estimatedScore}
            <span className="text-xs font-normal text-cyan-300 ml-1.5">/ 1600</span>
          </div>
          <div className="text-xs font-mono text-slate-300 flex items-center gap-1.5 pt-1">
            <span>Target: {targetScore}</span>
            <span className="text-cyan-400 font-bold">
              ({targetScore - stats.estimatedScore > 0 ? `-${targetScore - stats.estimatedScore} PTS` : "GOAL LOCKED!"})
            </span>
          </div>
        </div>

        {/* Overall Accuracy */}
        <div className="scifi-glass-card rounded-2xl p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-cyan-400/80 text-[10px] font-mono font-bold uppercase tracking-widest">
            <span>OVERALL ACCURACY</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black font-mono text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
            {stats.overallAccuracy}%
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            {stats.totalCorrect} of {stats.totalQuestionsAnswered} nodes resolved
          </div>
        </div>

        {/* Math vs Reading Accuracy */}
        <div className="scifi-glass-card rounded-2xl p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-cyan-400/80 text-[10px] font-mono font-bold uppercase tracking-widest">
            <span>SECTION TELEMETRY</span>
            <BarChart3 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Math Matrix</div>
              <div className="text-xl font-black font-mono text-cyan-400 drop-shadow-[0_0_6px_#00f0ff]">{stats.mathAccuracy}%</div>
            </div>
            <div className="h-8 w-px bg-cyan-500/20" />
            <div>
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">RW Synapse</div>
              <div className="text-xl font-black font-mono text-indigo-400 drop-shadow-[0_0_6px_#818cf8]">{stats.rwAccuracy}%</div>
            </div>
          </div>
        </div>

        {/* Study Time & Streak */}
        <div className="scifi-glass-card rounded-2xl p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-400/80 text-[10px] font-mono font-bold uppercase tracking-widest">
            <span>WARP CHRONOMETER</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black font-mono text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
            {stats.totalStudyMinutes}m
          </div>
          <div className="text-[11px] font-mono text-amber-300 font-bold flex items-center gap-1">
            ⚡ {stats.streakDays}-DAY SYNAPSE STREAK
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Domain Mastery Bar Chart */}
        <div className="lg:col-span-8 scifi-glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-cyan-500/20">
            <div>
              <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">DOMAIN VECTOR CALIBRATION</div>
              <h3 className="font-orbitron font-bold text-base text-white">Accuracy per SAT Domain (%)</h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-cyan-300 px-2.5 py-1 rounded-sm bg-cyan-950 border border-cyan-500/40">
              BENCHMARK: 80%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={domainData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(6, 182, 212, 0.1)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8", fontFamily: "JetBrains Mono" }} interval={0} angle={-15} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8", fontFamily: "JetBrains Mono" }} />
                <Tooltip
                  formatter={(value: any, _name: any, props: any) => [
                    `${value}% (${props.payload.correct}/${props.payload.answered} nodes resolved)`,
                    props.payload.fullName,
                  ]}
                  contentStyle={{ backgroundColor: "#060d1f", borderColor: "#06b6d4", color: "#00f0ff", borderRadius: "10px", fontFamily: "JetBrains Mono", fontSize: "12px", boxShadow: "0 0 15px rgba(6,182,212,0.4)" }}
                />
                <Bar dataKey="accuracy" fill="#00f0ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accuracy Proportion Donut */}
        <div className="lg:col-span-4 scifi-glass-card rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="pb-2 border-b border-cyan-500/20">
            <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">NEURAL RATIO</div>
            <h3 className="font-orbitron font-bold text-base text-white">Resolution Balance</h3>
          </div>

          <div className="h-44 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={72}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="rgba(6, 182, 212, 0.3)"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#060d1f", borderColor: "#06b6d4", color: "#fff", borderRadius: "8px", fontFamily: "JetBrains Mono", fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black font-mono text-cyan-300 drop-shadow-[0_0_8px_#00f0ff]">{stats.overallAccuracy}%</span>
              <span className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-widest">ACCURACY</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-cyan-950/60 text-cyan-200 font-mono font-semibold border border-cyan-500/30">
              <div className="text-sm text-cyan-300 font-black">{stats.totalCorrect}</div>
              <div className="text-[10px] text-cyan-400/80">OPTIMAL</div>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-950/60 text-rose-200 font-mono font-semibold border border-rose-500/30">
              <div className="text-sm text-rose-300 font-black">
                {Math.max(0, stats.totalQuestionsAnswered - stats.totalCorrect)}
              </div>
              <div className="text-[10px] text-rose-400/80">ANOMALIES</div>
            </div>
          </div>
        </div>
      </div>

      {/* Practice Volume vs. Accuracy Heatmap Matrix */}
      <div className="scifi-glass-card rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyan-500/20">
          <div>
            <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>PRACTICE FREQUENCY VS. ACCURACY HEATMAP MATRIX</span>
            </div>
            <h3 className="font-orbitron font-bold text-base text-white mt-0.5">
              Domain Vector Diagnostic Heatmap
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
            <span className="flex items-center gap-1 text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/40">
              <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
              Critical Attention (High Vol, Low Acc)
            </span>
            <span className="flex items-center gap-1 text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Blindspot (Low Vol)
            </span>
            <span className="flex items-center gap-1 text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
              Mastered (High Acc)
            </span>
          </div>
        </div>

        {/* Heatmap Grid of Domain Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(stats.categoryStats).map(([domain, data]) => {
            const item = data as { answered: number; correct: number; accuracy: number };
            const isHighVolume = item.answered >= 10;
            const isLowAccuracy = item.accuracy < 70;
            const isHighAccuracy = item.accuracy >= 80;

            let heatState: "critical" | "blindspot" | "mastered" | "nominal" = "nominal";
            if (isHighVolume && isLowAccuracy) heatState = "critical";
            else if (!isHighVolume && isLowAccuracy) heatState = "blindspot";
            else if (isHighAccuracy) heatState = "mastered";

            return (
              <div
                key={domain}
                className={`p-4 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  heatState === "critical"
                    ? "bg-rose-950/40 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                    : heatState === "blindspot"
                    ? "bg-amber-950/30 border-amber-500/40"
                    : heatState === "mastered"
                    ? "bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    : "bg-slate-900/80 border-cyan-500/20"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-space font-bold text-white leading-tight">
                      {domain}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                        heatState === "critical"
                          ? "bg-rose-500 text-black shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                          : heatState === "blindspot"
                          ? "bg-amber-500 text-black"
                          : heatState === "mastered"
                          ? "bg-cyan-400 text-black shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {heatState === "critical"
                        ? "ALERT: HIGH DRILL / LOW ACC"
                        : heatState === "blindspot"
                        ? "UNTESTED BLINDSPOT"
                        : heatState === "mastered"
                        ? "OPTIMAL MASTERY"
                        : "NOMINAL"}
                    </span>
                  </div>

                  {/* Accuracy Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">Accuracy Rate:</span>
                      <span
                        className={`font-black ${
                          item.accuracy < 70
                            ? "text-rose-400"
                            : item.accuracy >= 80
                            ? "text-cyan-300"
                            : "text-amber-300"
                        }`}
                      >
                        {item.accuracy}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.accuracy < 70
                            ? "bg-rose-500 shadow-[0_0_6px_#f43f5e]"
                            : item.accuracy >= 80
                            ? "bg-cyan-400 shadow-[0_0_6px_#00f0ff]"
                            : "bg-amber-400"
                        }`}
                        style={{ width: `${Math.min(100, item.accuracy)}%` }}
                      />
                    </div>
                  </div>

                  {/* Practice Frequency / Questions Answered Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">Practice Frequency:</span>
                      <span className="text-white font-bold">{item.answered} Qs</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-indigo-400 rounded-full transition-all shadow-[0_0_4px_#818cf8]"
                        style={{ width: `${Math.min(100, (item.answered / 30) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-cyan-500/10 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">
                    {item.correct}/{item.answered} resolved
                  </span>
                  <button
                    onClick={() => onNavigateToPractice(domain as SATDomain)}
                    className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/40 transition-colors flex items-center gap-1"
                  >
                    <span>Calibrate</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weak Areas & Targeted Next Drills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detected Weak Areas & Direct Drills */}
        <div className="scifi-glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
            <div>
              <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">NEURAL INTERVENTION RADAR</div>
              <h3 className="font-orbitron font-bold text-base text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Targeted Subsystem Interventions
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
              PRIORITY
            </span>
          </div>

          {weakDomains.length > 0 ? (
            <div className="space-y-3">
              {weakDomains.map(([domain, data]) => (
                <div
                  key={domain}
                  className="p-3.5 rounded-xl border border-cyan-500/20 bg-slate-900/80 flex items-center justify-between gap-3 hover:border-cyan-500/40 transition-colors"
                >
                  <div>
                    <h4 className="font-space font-bold text-sm text-white">{domain}</h4>
                    <div className="text-xs font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="text-rose-400 font-bold">{data.accuracy}% accuracy</span>
                      <span>•</span>
                      <span>{data.answered} attempts</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateToPractice(domain as SATDomain)}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                  >
                    <span>LAUNCH DRILL</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-xs font-mono text-cyan-200 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <span className="font-bold text-cyan-300">All Tested Categories Operating in Nominal Range!</span>
                <p className="text-slate-400 mt-0.5">
                  Continue mixed practice combat simulations to sustain warp stamina.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Uploaded Material Reports & Deep Diagnostics */}
        {!isStudent && onNavigateToMaterials && (
          <div className="scifi-glass-card rounded-2xl p-6 space-y-4">
            <div className="pb-2 border-b border-cyan-500/20">
              <div className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">DEEP PSYCHOMETRIC SENSORS</div>
              <h3 className="font-orbitron font-bold text-base text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Material Diagnostic Matrix
              </h3>
            </div>
            <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-950/80 to-slate-950/90 text-white space-y-3 border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <h4 className="font-orbitron font-bold text-sm text-cyan-300">Extract Telemetry from Custom Study Files</h4>
              <p className="text-xs font-space text-slate-300 leading-relaxed">
                Ingest your school notes, PDF workbooks, or past tests into the Owly AI Engine for psychometric scoring, trap taxonomy classification, and question bank ingestion.
              </p>
              <button
                onClick={onNavigateToMaterials}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold transition-all shadow-[0_0_10px_rgba(6,182,212,0.4)] flex items-center gap-1.5"
              >
                <span>OPEN DATA ANALYZER</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
