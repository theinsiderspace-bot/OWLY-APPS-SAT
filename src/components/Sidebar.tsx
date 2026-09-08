import React from "react";
import {
  Calendar,
  BookOpen,
  FileText,
  BarChart3,
  BookMarked,
  Sparkles,
  X,
  Target,
  ChevronRight,
  Database,
  ShieldCheck,
  User,
  Sliders,
  GraduationCap,
  LogOut,
  Crown,
  Radio,
  Cpu,
  Zap,
  CheckSquare,
} from "lucide-react";
import { UserProfile } from "../types";
import { getStudentTier } from "../data/studentTiers";
import { OwlyLogo } from "./OwlyLogo";

interface SidebarProps {
  activeTab: "study-plan" | "homework" | "training" | "practice" | "question-bank" | "materials" | "analytics" | "formulas" | "admin";
  setActiveTab: (tab: "study-plan" | "homework" | "training" | "practice" | "question-bank" | "materials" | "analytics" | "formulas" | "admin") => void;
  targetScore: number;
  uploadedReportsCount: number;
  pendingHomeworkCount?: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isFocusMode?: boolean;
  currentProfile: UserProfile;
  onOpenProfileSetup: () => void;
  onOpenAuthModal?: () => void;
  onOpenStudentTiersModal?: () => void;
  onSignOut?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  targetScore,
  uploadedReportsCount,
  pendingHomeworkCount = 0,
  isOpenMobile,
  onCloseMobile,
  isFocusMode = false,
  currentProfile,
  onOpenProfileSetup,
  onOpenAuthModal,
  onOpenStudentTiersModal,
  onSignOut,
}) => {
  const isStudent = currentProfile?.role === "student";
  const isGuest = currentProfile?.role === "guest";
  const activeTier = getStudentTier(currentProfile?.tier || "starter");

  const allNavItems = [
    {
      id: "study-plan",
      label: "Mission Roadmap",
      icon: Calendar,
      badge: "AI PLAN",
      description: "Adaptive roadmap & daily vector",
    },
    {
      id: "homework",
      label: "Homework Hub",
      icon: CheckSquare,
      badge: pendingHomeworkCount > 0 ? `${pendingHomeworkCount} HW` : "Missions",
      description: "Assigned sets & time tracking",
    },
    {
      id: "training",
      label: "Academy Matrix",
      icon: GraduationCap,
      badge: "Curriculum",
      description: "Theory & section lessons",
    },
    {
      id: "practice",
      label: "Combat Drills",
      icon: BookOpen,
      badge: isGuest ? "Guest Access" : "Bluebook",
      description: "Interactive Bluebook tests",
    },
    {
      id: "question-bank",
      label: "10K Neural Bank",
      icon: Database,
      badge: "10,000",
      description: "Categorized official taxonomy",
    },
    {
      id: "materials",
      label: "Data Psychometrics",
      icon: FileText,
      badge: uploadedReportsCount > 0 ? `${uploadedReportsCount} Files` : "Upload",
      description: "File psychometrics & notes",
      hideForStudent: true,
    },
    {
      id: "analytics",
      label: "Telemetry Reports",
      icon: BarChart3,
      badge: "HUD",
      description: "Accuracy & domain breakdown",
    },
    {
      id: "formulas",
      label: "Formula Codex",
      icon: BookMarked,
      badge: "Flash",
      description: "High-yield flash cards",
    },
    {
      id: "admin",
      label: "Core Controller",
      icon: ShieldCheck,
      badge: "Root",
      description: "Complete system controls",
      adminOnly: true,
    },
  ] as const;

  const navItems = allNavItems.filter((item) => {
    // If Guest, conceal all options except Practice Drills
    if (isGuest) {
      return item.id === "practice";
    }
    if (isStudent && (item as any).hideForStudent) return false;
    if (item.id === "admin" && currentProfile.role !== "admin") return false;
    return true;
  });

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4 sm:p-5 bg-[#040816]/95 border-r border-cyan-500/20 text-slate-100 backdrop-blur-2xl relative overflow-hidden scifi-grid-bg">
      {/* Sci-Fi Ambient Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header & Navigation */}
      <div className="space-y-6 relative z-10">
        <div className="flex items-center justify-between px-1">
          <OwlyLogo size="md" animated={true} />

          {/* Close button for mobile drawer */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5" aria-label="Main Navigation">
          <div className="text-[9px] font-mono font-bold tracking-widest text-cyan-400/60 uppercase px-2 mb-2 flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>NEURAL FLIGHT MODULES</span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isAdmin = item.id === "admin";

            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full p-2.5 sm:p-3 rounded-xl flex items-center justify-between text-left transition-all relative group ${
                  isActive
                    ? isAdmin
                      ? "bg-rose-950/80 text-rose-300 font-bold border border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                      : "bg-cyan-950/70 text-cyan-200 font-bold border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                    : isAdmin
                    ? "text-slate-400 hover:bg-rose-950/30 hover:text-rose-300 hover:border-rose-500/30 border border-transparent"
                    : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-200 hover:border-cyan-500/20 border border-transparent"
                }`}
              >
                {/* Active Indicator Left Pip */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
                )}

                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? isAdmin
                          ? "bg-rose-500 text-black shadow-[0_0_8px_#f43f5e]"
                          : "bg-cyan-400 text-black shadow-[0_0_8px_#00f0ff]"
                        : isAdmin
                        ? "bg-rose-950/60 text-rose-400 border border-rose-800/40"
                        : "bg-slate-900 text-slate-400 group-hover:text-cyan-300 group-hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs sm:text-sm font-space font-medium leading-tight truncate">
                      {item.label}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider ${
                      isActive
                        ? isAdmin
                          ? "bg-rose-900 text-rose-200 border border-rose-500"
                          : "bg-cyan-900/80 text-cyan-200 border border-cyan-400"
                        : isAdmin
                        ? "bg-rose-950 text-rose-400 border border-rose-800/50"
                        : isGuest
                        ? "bg-amber-950 text-amber-300 border border-amber-500/40"
                        : "bg-slate-900 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Guest Mode Callout when user is guest */}
        {isGuest && (
          <div className="p-3 bg-amber-950/60 rounded-2xl border border-amber-500/40 text-amber-200 space-y-2 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>GUEST SIMULATION</span>
            </div>
            <p className="text-[10px] font-mono text-amber-200/80 leading-relaxed">
              Practicing in <strong>Drill Sim Mode</strong>. Unlock the AI Adaptive Engine & Full Analytics with an account.
            </p>
            {onOpenAuthModal && (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="w-full py-1.5 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-black transition-all shadow-[0_0_10px_rgba(245,158,11,0.4)] flex items-center justify-center gap-1"
              >
                <span>UNLOCK ALL NODES</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* User Profile Trigger & Target Goal Card */}
      <div className="space-y-3 mt-4 relative z-10">
        {/* Active Profile Card Button */}
        <div className="space-y-1.5">
          <button
            onClick={onOpenProfileSetup}
            className="w-full p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-cyan-500/30 text-left transition-all group flex items-center justify-between shadow-[0_0_10px_rgba(0,0,0,0.5)]"
            title="Open Pilot Calibration & Settings"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-7 h-7 rounded-lg ${currentProfile.avatarColor} text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs border border-white/20`}>
                {currentProfile.name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <div className="text-xs font-mono font-bold text-slate-100 truncate group-hover:text-cyan-300 transition-colors">
                  {currentProfile.name}
                </div>
                <div className="text-[9px] font-mono text-cyan-400/80 truncate flex items-center gap-1">
                  <span>{activeTier.name.toUpperCase()}</span>
                  <span>•</span>
                  <span>
                    {currentProfile?.role === "admin"
                      ? "ADMIN"
                      : isGuest
                      ? "GUEST"
                      : `${currentProfile?.targetScore || 1550} TARGET`}
                  </span>
                </div>
              </div>
            </div>
            <Sliders className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 shrink-0" />
          </button>

          {!isGuest && onOpenStudentTiersModal && (
            <button
              onClick={onOpenStudentTiersModal}
              className="w-full py-1.5 px-3 rounded-xl text-[10px] font-mono font-bold border border-cyan-500/30 bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 transition-all flex items-center justify-between shadow-[0_0_8px_rgba(6,182,212,0.15)]"
            >
              <div className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>{activeTier.name.toUpperCase()} TIER</span>
              </div>
              <span className="text-[9px] font-mono font-black text-cyan-300 uppercase underline">
                {currentProfile?.tier === "elite" ? "MAX" : "UPGRADE"}
              </span>
            </button>
          )}

          {(!isStudent || isGuest) && onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="w-full py-1.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-[10px] font-mono font-black border border-cyan-400 transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)] flex items-center justify-center gap-1.5"
            >
              <span>{isGuest ? "AUTHENTICATE PILOT" : "SWITCH ACCOUNT"}</span>
            </button>
          )}

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="w-full py-1.5 px-3 rounded-xl bg-slate-900/70 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 text-[10px] font-mono font-bold border border-slate-800 hover:border-rose-500/40 transition-colors flex items-center justify-center gap-1.5"
              title="Sign Out of active profile session"
            >
              <LogOut className="w-3 h-3" />
              <span>DISCONNECT</span>
            </button>
          )}
        </div>

        {/* Target Orbit & Subsystem Telemetry Block */}
        <div className="p-3 bg-slate-900/90 rounded-xl border border-cyan-500/30 space-y-2 shadow-[0_0_12px_rgba(6,182,212,0.1)]">
          <div className="flex items-center justify-between">
            <div className="text-[9px] font-mono font-bold text-cyan-400 tracking-wider uppercase flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isGuest ? "TRIAL VECTOR" : "TARGET_ORBIT"}</span>
            </div>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              {isGuest ? "TRIAL" : (currentProfile?.examDateLabel || "MAY").split(" ")[0].toUpperCase()}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-sm font-mono font-black text-white">
              {isGuest ? (
                "PRACTICE DRILLS"
              ) : (
                <>
                  <span className="text-cyan-300 font-bold">{targetScore} PTS</span>
                  <span className="text-[10px] font-normal text-slate-500 ml-1">/ 1600</span>
                </>
              )}
            </div>
            <span className="text-[10px] font-mono font-semibold text-emerald-400">
              {isGuest ? "BLUEBOOK" : targetScore >= 1500 ? "99TH PERCENTILE" : "TARGET SCORE"}
            </span>
          </div>

          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-cyan-500/20">
            <div
              className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_#00f0ff]"
              style={{ width: isGuest ? "100%" : `${Math.min(100, Math.round((targetScore / 1600) * 100))}%` }}
            />
          </div>

          {/* Subsystem Telemetry */}
          {!isGuest && (
            <div className="pt-2 border-t border-cyan-500/20 text-[10px] font-mono text-slate-300 space-y-0.5 leading-snug">
              <div className="text-[9px] font-bold text-cyan-400 tracking-wider uppercase flex items-center gap-1">
                <Cpu className="w-3 h-3 text-cyan-400 shrink-0" />
                <span>SUBSYSTEM:</span>
              </div>
              <p className="text-slate-300 font-space text-[10px] leading-tight">
                {activeTier.tagline}
              </p>
            </div>
          )}
        </div>

        {/* Telemetry Core Status */}
        <div className="pt-2 border-t border-cyan-500/10 flex items-center justify-between text-[8px] font-mono text-cyan-400/60 uppercase">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            CORE ONLINE
          </span>
          <span>v4.2 PRO</span>
        </div>
      </div>
    </div>
  );

  if (isFocusMode) {
    return null;
  }

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:h-screen lg:sticky lg:top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#040816] shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
