import React, { useState, useRef, useEffect } from "react";
import {
  Flame,
  Calculator,
  Clock,
  Menu,
  Sparkles,
  TrendingUp,
  Target,
  CheckCircle2,
  Edit2,
  X,
  Check,
  Maximize2,
  Minimize2,
  EyeOff,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Crown,
  Zap,
  Activity,
  Radio,
} from "lucide-react";
import { UserProfile } from "../types";
import { getStudentTier } from "../data/studentTiers";
import { OwlyLogoIcon } from "./OwlyLogo";

interface HeaderProps {
  activeTab: "study-plan" | "homework" | "training" | "practice" | "question-bank" | "materials" | "analytics" | "formulas" | "admin";
  setActiveTab: (tab: "study-plan" | "homework" | "training" | "practice" | "question-bank" | "materials" | "analytics" | "formulas" | "admin") => void;
  targetScore: number;
  estimatedScore: number;
  streakDays: number;
  studySeconds: number;
  dailyGoalMinutes: number;
  onUpdateDailyGoalMinutes: (minutes: number) => void;
  onOpenCalculator: () => void;
  onToggleMobileSidebar: () => void;
  studentName?: string;
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  currentProfile: UserProfile;
  onOpenProfileSetup: () => void;
  onOpenAuthModal?: () => void;
  onOpenStudentTiersModal?: () => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  targetScore,
  estimatedScore,
  streakDays,
  studySeconds,
  dailyGoalMinutes,
  onUpdateDailyGoalMinutes,
  onOpenCalculator,
  onToggleMobileSidebar,
  studentName = "Jordan",
  isFocusMode,
  onToggleFocusMode,
  currentProfile,
  onOpenProfileSetup,
  onOpenAuthModal,
  onOpenStudentTiersModal,
  onSignOut,
}) => {
  const [isGoalEditorOpen, setIsGoalEditorOpen] = useState<boolean>(false);
  const [tempGoalInput, setTempGoalInput] = useState<string>(dailyGoalMinutes.toString());
  const popoverRef = useRef<HTMLDivElement>(null);
  const activeStudentTier = getStudentTier(currentProfile?.tier || "starter");
  const isGuest = currentProfile?.role === "guest";

  // Sync temp input when prop changes
  useEffect(() => {
    setTempGoalInput(dailyGoalMinutes.toString());
  }, [dailyGoalMinutes]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsGoalEditorOpen(false);
      }
    };
    if (isGoalEditorOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isGoalEditorOpen]);

  // Daily goal calculation
  const currentStudyMinutes = Math.floor(studySeconds / 60);
  const progressPercent = Math.min(
    100,
    Math.round((currentStudyMinutes / Math.max(1, dailyGoalMinutes)) * 100)
  );
  const isGoalAchieved = currentStudyMinutes >= dailyGoalMinutes;
  const remainingMinutes = Math.max(0, dailyGoalMinutes - currentStudyMinutes);

  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
  };

  const handleSaveGoal = (targetMinutes: number) => {
    if (targetMinutes >= 5 && targetMinutes <= 600) {
      onUpdateDailyGoalMinutes(targetMinutes);
      setIsGoalEditorOpen(false);
    }
  };

  const handleCustomInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(tempGoalInput, 10);
    if (!isNaN(val) && val >= 5 && val <= 600) {
      handleSaveGoal(val);
    }
  };

  const PRESET_GOALS = [15, 30, 45, 60, 90, 120];

  return (
    <header
      className={`sticky top-0 z-20 transition-all duration-300 border-b flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 bg-[#060d1f]/90 backdrop-blur-xl border-cyan-500/20 text-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.6)] ${
        isFocusMode ? "h-16" : "h-20"
      }`}
    >
      {/* Sci-Fi subtle scanline glow top bar */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />

      {/* Left: Command Deck Status & Pilot Designation */}
      <div className="flex items-center gap-3.5">
        {!isFocusMode && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-cyan-400 hover:bg-cyan-950/50 border border-cyan-500/30 transition-all"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Owly Quantum Logo Avatar on Mobile/Focus */}
        <div className="lg:hidden shrink-0">
          <OwlyLogoIcon size="xs" />
        </div>

        <div>
          {isFocusMode ? (
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400 shadow-[0_0_8px_#00f0ff]"></span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-orbitron font-bold tracking-wider text-white flex items-center gap-1.5 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                  <EyeOff className="w-4 h-4 text-cyan-400" />
                  HUD STEALTH FOCUS ACTIVE
                </span>
                <span className="hidden sm:inline-block text-[9px] uppercase tracking-widest font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                  ISOLATION MATRIX ENGAGED
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#00f0ff]" />
                  <h1 className="text-base sm:text-lg font-orbitron font-bold text-white tracking-wide">
                    {isGuest ? "GUEST_PILOT" : (currentProfile?.name || "STUDENT PILOT").toUpperCase()}
                  </h1>
                </div>

                {isGuest ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-sm bg-amber-950/80 text-amber-300 border border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    SIM_MODE: GUEST DRILLS
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={onOpenStudentTiersModal}
                      className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-sm border transition-all hover:scale-105 shadow-[0_0_10px_rgba(6,182,212,0.2)] ${activeStudentTier.badgeColor}`}
                      title="Access Tier Upgrades & Holographic Telemetry"
                    >
                      <Crown className="w-3 h-3 text-amber-400" />
                      <span>{activeStudentTier.name.toUpperCase()}</span>
                    </button>

                    <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-sm bg-indigo-950/80 text-cyan-300 border border-cyan-500/30">
                      <Radio className="w-3 h-3 text-cyan-400" />
                      EXAM_VECTOR: {(currentProfile?.examDateLabel || "MAY").split(" ")[0].toUpperCase()}
                    </span>
                  </>
                )}
                {currentProfile?.role === "admin" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black px-2 py-0.5 rounded-sm bg-rose-950/80 text-rose-300 border border-rose-500/60 shadow-[0_0_8px_rgba(244,63,94,0.4)]">
                    <ShieldCheck className="w-3 h-3 text-rose-400" />
                    ROOT_OVERRIDE
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                {isGuest ? (
                  <span className="text-cyan-400/80">Digital SAT Practice Engine Simulation Active</span>
                ) : (
                  <span className="text-cyan-400/80 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span>Digital SAT Adaptive Mission Control & Exam Engine</span>
                  </span>
                )}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Right: Sci-Fi Telemetry Readouts & Flight Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Daily Study Energy Core Progress */}
        <div className="relative" ref={popoverRef}>
          <button
            id="header-daily-goal-button"
            onClick={() => setIsGoalEditorOpen((prev) => !prev)}
            className={`group flex flex-col justify-center px-3 py-1.5 sm:px-3 sm:py-1.5 rounded-xl border transition-all text-left ${
              isGoalAchieved
                ? "bg-cyan-950/70 hover:bg-cyan-900/70 border-cyan-400/60 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                : "bg-slate-900/90 hover:bg-slate-800/90 border-slate-700/80 text-slate-200 hover:border-cyan-500/40"
            }`}
            title="Neural Daily Goal - Click to configure calibration minutes"
          >
            <div className="flex items-center justify-between gap-2 min-w-[115px] sm:min-w-[135px]">
              <div className="flex items-center gap-1.5">
                {isGoalAchieved ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 shadow-xs" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                )}
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-cyan-400/80">
                  SYNAPSE
                </span>
              </div>

              <div className="flex items-center gap-1">
                <span
                  className={`text-xs font-black font-mono ${
                    isGoalAchieved ? "text-cyan-300 drop-shadow-[0_0_6px_#00f0ff]" : "text-slate-100"
                  }`}
                >
                  {currentStudyMinutes}/{dailyGoalMinutes}m
                </span>
                <Edit2 className="w-2.5 h-2.5 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Futuristic Energy Bar */}
            <div className="mt-1 w-full rounded-full h-1 overflow-hidden bg-slate-800 border border-slate-700/60">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isGoalAchieved
                    ? "bg-gradient-to-r from-cyan-500 to-emerald-400 shadow-[0_0_10px_#00f0ff]"
                    : "bg-gradient-to-r from-indigo-500 to-cyan-500"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </button>

          {/* Daily Goal Sci-Fi Customization Popover */}
          {isGoalEditorOpen && (
            <div
              id="header-daily-goal-popover"
              className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-[#0a1128] text-slate-100 rounded-2xl border border-cyan-500/40 shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isGoalAchieved
                        ? "bg-cyan-950 text-cyan-300 border border-cyan-400/50"
                        : "bg-indigo-950 text-indigo-300 border border-indigo-400/50"
                    }`}
                  >
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-orbitron font-bold text-white">Daily Target Calibration</h4>
                    <p className="text-[10px] font-mono text-cyan-400/70">Neural focus matrix duration</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsGoalEditorOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Current Progress Status */}
              <div className="mt-3 bg-slate-900/80 p-3 rounded-xl border border-cyan-500/20">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-mono text-[11px] text-slate-400">CORE CAPACITY</span>
                  <span className="font-mono font-bold text-cyan-300">
                    {progressPercent}% CHARGED
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2 border border-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isGoalAchieved ? "bg-cyan-400 shadow-[0_0_8px_#00f0ff]" : "bg-indigo-500"
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
                  {isGoalAchieved ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-cyan-300 font-semibold">
                        Goal achieved: {dailyGoalMinutes}m threshold reached!
                      </span>
                    </>
                  ) : (
                    <span>
                      {remainingMinutes}m remaining to lock daily neural cycle.
                    </span>
                  )}
                </p>
              </div>

              {/* Preset Targets */}
              <div className="mt-3.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400/80 mb-2">
                  WARP PRESETS
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {PRESET_GOALS.map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => handleSaveGoal(mins)}
                      className={`px-2 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all ${
                        dailyGoalMinutes === mins
                          ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                          : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 hover:border-cyan-500/50"
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <form onSubmit={handleCustomInputSubmit} className="mt-3 pt-3 border-t border-cyan-500/20">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400/80 mb-1.5">
                  CUSTOM SPEC (5 - 600 MINS)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={5}
                    max={600}
                    value={tempGoalInput}
                    onChange={(e) => setTempGoalInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
                    placeholder="e.g. 75"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-mono font-bold text-xs rounded-lg transition-all shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                  >
                    ENGAGE
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Telemetry: Streak & Projected Score */}
        {!isFocusMode && (
          <>
            {/* Warp Streak Metric */}
            <div
              className="hidden md:flex items-center gap-2.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]"
              title="Active Daily Streak"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-950 flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/40">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
              </div>
              <div>
                <div className="text-[8px] text-amber-400/80 font-mono font-bold uppercase tracking-widest">STREAK</div>
                <div className="text-xs font-mono font-black text-amber-300 leading-tight">
                  {streakDays} DAYS
                </div>
              </div>
            </div>

            {/* Quantum Projected Score Metric */}
            <div
              className="hidden sm:flex items-center gap-2.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.15)]"
              title="Current Projected SAT Score"
            >
              <div className="w-6 h-6 rounded-lg bg-cyan-950 flex items-center justify-center text-cyan-400 shrink-0 border border-cyan-500/40">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[8px] text-cyan-400/80 font-mono font-bold uppercase tracking-widest">PROJECTED</div>
                <div className="text-xs font-mono font-black text-cyan-300 leading-tight drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]">
                  {estimatedScore}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Warp Chronometer */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold ${
            isFocusMode
              ? "bg-slate-900 border-cyan-500/40 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.2)]"
              : "hidden xl:flex bg-slate-900/80 border-slate-700/80 text-slate-300"
          }`}
          title="Session Chronometer"
        >
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{formatTime(studySeconds)}</span>
        </div>

        {/* Desmos Quantum Calculator Button */}
        <button
          id="header-calculator-button"
          onClick={onOpenCalculator}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)] shrink-0"
          title="Open SAT Desmos Scientific Calculator HUD"
        >
          <Calculator className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">CALC</span>
        </button>

        {/* Focus Mode Cloak Toggle Button */}
        <button
          id="header-focus-mode-toggle"
          onClick={onToggleFocusMode}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-xs shrink-0 ${
            isFocusMode
              ? "bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_#00f0ff] font-black"
              : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-cyan-500/40"
          }`}
          title={isFocusMode ? "Exit HUD Cloak" : "Engage HUD Cloak (Hide Navigation)"}
        >
          {isFocusMode ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-black" />
              <span className="inline">EXIT CLOAK</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="inline">HUD CLOAK</span>
            </>
          )}
        </button>

        {/* Guest Quick Unlock */}
        {isGuest && onOpenAuthModal && (
          <button
            id="header-guest-signin-button"
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-black transition-all shadow-xs shrink-0 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            title="Create account or Sign in to unlock full platform"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">UNLOCK SUITE</span>
            <span className="sm:hidden">UNLOCK</span>
          </button>
        )}

        {/* Pilot Profile Setup Avatar Trigger */}
        <button
          id="header-user-profile-button"
          onClick={onOpenProfileSetup}
          className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-2xl border transition-all bg-slate-900/90 hover:bg-slate-800 border-cyan-500/30 text-white shadow-[0_0_10px_rgba(6,182,212,0.15)]"
          title="Pilot Profile & Neural Telemetry Calibration"
        >
          <div className={`w-7 h-7 rounded-xl ${currentProfile.avatarColor} text-white flex items-center justify-center font-mono font-bold text-xs shadow-xs border border-white/20`}>
            {currentProfile.name.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:inline-block text-xs font-mono font-bold truncate max-w-[80px]">
            {currentProfile.name.split(" ")[0]}
          </span>
          <ChevronDown className="w-3 h-3 text-cyan-400 shrink-0" />
        </button>

        {/* Sign Out Button */}
        {onSignOut && (
          <button
            id="header-sign-out-button"
            onClick={onSignOut}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-mono font-bold transition-all shrink-0 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 hover:border-rose-400/60 shadow-[0_0_8px_rgba(244,63,94,0.2)]"
            title="Disconnect Neural Session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">DISCONNECT</span>
          </button>
        )}
      </div>
    </header>
  );
};
