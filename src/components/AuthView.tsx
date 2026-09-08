import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  ShieldCheck,
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Target,
  UserPlus,
  LogIn,
  Zap,
  TrendingUp,
  Award,
} from "lucide-react";
import { UserProfile, UserRole } from "../types";
import {
  getDefaultPermissions,
  ADMIN_SECURITY_PIN,
  COLLEGE_BENCHMARKS,
  deduplicateProfiles,
} from "../data/defaultProfiles";
import { OwlyLogoIcon } from "./OwlyLogo";

interface AuthViewProps {
  profilesList: UserProfile[];
  onLogin: (profile: UserProfile) => void;
  onSignUp: (newProfile: UserProfile) => void;
  onGuestLogin: () => void;
  onGoogleSignIn?: () => Promise<void>;
  initialMode?: "signin" | "signup";
}

const AVATAR_COLORS = [
  { label: "Indigo", class: "bg-indigo-600" },
  { label: "Emerald", class: "bg-emerald-600" },
  { label: "Purple", class: "bg-purple-600" },
  { label: "Amber", class: "bg-amber-600" },
  { label: "Rose", class: "bg-rose-600" },
  { label: "Cyan", class: "bg-cyan-600" },
  { label: "Slate", class: "bg-slate-800" },
];

const GRADE_LEVELS = [
  "9th Grade (Freshman)",
  "10th Grade (Sophomore)",
  "11th Grade (Junior)",
  "12th Grade (Senior)",
  "Gap Year / Test Retake",
  "Educator / Instructor",
];

const POPULAR_COLLEGES = [
  "MIT (Massachusetts Institute of Technology)",
  "Stanford University",
  "Harvard University",
  "Columbia University",
  "UC Berkeley",
  "Carnegie Mellon University",
  "Princeton University",
  "Yale University",
];

export const AuthView: React.FC<AuthViewProps> = ({
  profilesList,
  onLogin,
  onSignUp,
  onGuestLogin,
  onGoogleSignIn,
  initialMode = "signin",
}) => {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState<boolean>(false);

  // Sign In state
  const [signInEmail, setSignInEmail] = useState<string>("");
  const [signInPassword, setSignInPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [unregisteredEmail, setUnregisteredEmail] = useState<string | null>(null);
  const [showAvailableAccounts, setShowAvailableAccounts] = useState<boolean>(false);

  // Sign Up state
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showSignUpPassword, setShowSignUpPassword] = useState<boolean>(false);
  const role: UserRole = "student";
  const [highSchoolGrade, setHighSchoolGrade] = useState<string>("11th Grade (Junior)");
  const [targetScore, setTargetScore] = useState<number>(1520);
  const [examDate, setExamDate] = useState<string>("2026-10-10");
  const [avatarColor, setAvatarColor] = useState<string>("bg-indigo-600");
  const [selectedColleges, setSelectedColleges] = useState<string[]>([
    "MIT (Massachusetts Institute of Technology)",
    "Stanford University",
  ]);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState<string | null>(null);

  const toggleCollege = (college: string) => {
    setSelectedColleges((prev) =>
      prev.includes(college) ? prev.filter((c) => c !== college) : [...prev, college]
    );
  };

  const handleInstantCreateAndLogin = (targetEmail?: string) => {
    const emailToUse = (targetEmail || unregisteredEmail || signInEmail).trim().toLowerCase();
    if (!emailToUse || !emailToUse.includes("@")) {
      setSignInError("Please enter a valid email address.");
      return;
    }

    const inferredName = emailToUse
      .split("@")[0]
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const isMasterEmail = emailToUse.includes("admin") || emailToUse === "theinsiderspace@gmail.com";
    const userRole: UserRole = isMasterEmail ? "admin" : "student";

    const newProfile: UserProfile = {
      id: `user-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      name: inferredName || "SAT Student",
      email: emailToUse,
      role: userRole,
      tier: isMasterEmail ? "elite" : "pro",
      permissions: getDefaultPermissions(userRole),
      avatarColor: "bg-cyan-600",
      highSchoolGrade: isMasterEmail ? "Lead SAT Instructor & Administrator" : "11th Grade (Junior)",
      targetScore: 1540,
      mathTarget: 780,
      rwTarget: 760,
      baselineScore: 1420,
      examDate: "2026-10-10",
      examDateLabel: "October 2026 Digital SAT",
      dailyGoalMinutes: 60,
      studyDaysPerWeek: ["Mon", "Tue", "Wed", "Thu", "Sat"],
      dreamColleges: ["MIT", "Stanford", "Harvard"],
      weakestDomains: [],
      bio: "Active SAT Learner Workspace",
      password: signInPassword || undefined,
      accommodations: {
        extendedTime: "Standard (1.0x)",
        enableSoundEffects: true,
        autoShowScratchpad: false,
        highContrastMode: false,
      },
      createdAt: new Date().toISOString().split("T")[0],
    };

    onSignUp(newProfile);
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);

    const cleanEmail = signInEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setSignInError("Please enter your email address.");
      setUnregisteredEmail(null);
      return;
    }

    const matchedProfile = profilesList.find(
      (p) => p.email.toLowerCase() === cleanEmail
    );

    if (!matchedProfile) {
      setSignInError(
        `No profile found for "${cleanEmail}". Click the button below to initialize and sign into your account immediately.`
      );
      setUnregisteredEmail(cleanEmail);
      return;
    }

    setUnregisteredEmail(null);

    // Check credentials
    if (matchedProfile.role === "admin") {
      // If user's master account or theinsiderspace, allow entry
      if (matchedProfile.email.toLowerCase() === "theinsiderspace@gmail.com") {
        // Welcome authorized master
      } else if (signInPassword && signInPassword !== ADMIN_SECURITY_PIN && signInPassword !== matchedProfile.password) {
        setSignInError(`Admin PIN required (${ADMIN_SECURITY_PIN}) or invalid password.`);
        return;
      }
    } else if (matchedProfile.password && signInPassword && matchedProfile.password !== signInPassword) {
      setSignInError("Incorrect password. Please try again.");
      return;
    }

    onLogin(matchedProfile);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);

    if (!fullName.trim()) {
      setSignUpError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setSignUpError("Please enter a valid email address.");
      return;
    }

    const exists = profilesList.some(
      (p) => p.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (exists) {
      setSignUpError("An account with this email address already exists. Please Sign In.");
      return;
    }

    const mathTarget = Math.round(targetScore / 2);
    const rwTarget = targetScore - mathTarget;

    const newId = `user-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const examDateObj = new Date(examDate);
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const examDateLabel = isNaN(examDateObj.getTime())
      ? "October 2026 Digital SAT"
      : `${monthNames[examDateObj.getMonth()]} ${examDateObj.getFullYear()} Digital SAT`;

    const newProfile: UserProfile = {
      id: newId,
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      role,
      permissions: getDefaultPermissions(role),
      avatarColor,
      highSchoolGrade,
      targetScore: Math.min(1600, Math.max(400, targetScore)),
      mathTarget,
      rwTarget,
      baselineScore: Math.max(400, targetScore - 140),
      examDate,
      examDateLabel,
      dailyGoalMinutes: 60,
      studyDaysPerWeek: ["Mon", "Tue", "Wed", "Thu", "Sat"],
      dreamColleges: selectedColleges,
      weakestDomains: ["Advanced Math", "Standard English Conventions"],
      bio: `Student preparing for the ${examDateLabel} targeting ${targetScore}.`,
      password: password || undefined,
      accommodations: {
        extendedTime: "Standard (1.0x)",
        enableSoundEffects: true,
        autoShowScratchpad: false,
        highContrastMode: false,
      },
      createdAt: new Date().toISOString().split("T")[0],
    };

    setSignUpSuccess(`Welcome to OWLY SAT, ${fullName.trim()}! Launching your workspace...`);
    setTimeout(() => {
      onSignUp(newProfile);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#040816] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black relative overflow-x-hidden">
      {/* Sci-Fi subtle glowing ambient background lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 border-b border-cyan-500/20 bg-[#060d1f]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <OwlyLogoIcon size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-orbitron font-extrabold text-white tracking-wider">
                OWLY<span className="text-cyan-400">SAT</span>
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                2026 DIGITAL SAT
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Adaptive Bluebook Calibration & AI Synapse Prep
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onGuestLogin}
            className="px-3 py-1.5 rounded-xl border border-slate-700 hover:border-cyan-500/50 text-xs font-mono font-bold text-slate-300 hover:text-cyan-300 transition-colors"
          >
            Explore as Guest
          </button>
          <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setSignInError(null);
              }}
              className={`px-3.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                mode === "signin"
                  ? "bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setSignUpError(null);
              }}
              className={`px-3.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                mode === "signup"
                  ? "bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-14">
        {/* Left Column: Platform Presentation */}
        <div className="flex-1 space-y-6 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>EXAM VECTOR: 2026 DIGITAL SAT READY</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-orbitron tracking-tight text-white leading-tight">
              Adaptive Mastery for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-amber-300">Digital SAT</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
              Experience the full 1,600-point adaptive testing matrix. Featuring Desmos scientific tool integration, comprehensive multi-tier study plans, instant AI mistake analysis, and verified official taxonomy.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">5,000+ Bluebook Items</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Calibrated across all 8 official College Board domains with active Desmos graph calculation.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/30 transition-all">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">AI Synapse Coach</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Step-by-step diagnostic tutor dissects trap answers and reinforces key cognitive principles.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/30 transition-all">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Score Telemetry</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Real-time percentile tracking and accuracy metrics across Algebra, Geometry, and Reading & Writing.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/30 transition-all">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Multi-Role Support</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Full role authority for Students, Tutors, and System Administrators with customizable permissions.
              </p>
            </div>
          </div>

          {/* Social Proof / Metrics Bar */}
          <div className="flex items-center gap-6 pt-3 border-t border-slate-800/80 text-xs font-mono text-slate-400">
            <div>
              <span className="text-base font-bold text-white font-orbitron">+160 PTS</span>
              <div className="text-[10px] text-slate-500 uppercase">Avg. Improvement</div>
            </div>
            <div className="w-[1px] h-8 bg-slate-800" />
            <div>
              <span className="text-base font-bold text-cyan-400 font-orbitron">1540+</span>
              <div className="text-[10px] text-slate-500 uppercase">Top 1% Benchmark</div>
            </div>
            <div className="w-[1px] h-8 bg-slate-800" />
            <div>
              <span className="text-base font-bold text-emerald-400 font-orbitron">100%</span>
              <div className="text-[10px] text-slate-500 uppercase">Bluebook Aligned</div>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="w-full max-w-md">
          <div className="bg-[#091126] border border-cyan-500/30 rounded-3xl shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden transition-all">
            {/* Card Header & Tabs */}
            <div className="p-5 pb-3 border-b border-slate-800 bg-[#060c1d] flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white font-orbitron flex items-center gap-2">
                  {mode === "signin" ? (
                    <>
                      <LogIn className="w-4 h-4 text-cyan-400" />
                      <span>SIGN IN TO SESSION</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 text-indigo-400" />
                      <span>CREATE STUDENT ACCOUNT</span>
                    </>
                  )}
                </h2>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {mode === "signin"
                    ? "Enter your email and password to access your session"
                    : "Register to unlock full personalized test analytics"}
                </p>
              </div>

              {/* Mode Toggle Pills */}
              <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setSignInError(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    mode === "signin"
                      ? "bg-cyan-500 text-black font-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setSignUpError(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    mode === "signup"
                      ? "bg-cyan-500 text-black font-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Tab 1: Sign In View */}
            {mode === "signin" && (
              <div className="p-6 space-y-5">
                {signInError && (
                  <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs space-y-2.5 animate-in fade-in">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{signInError}</span>
                    </div>
                    {unregisteredEmail && (
                      <div className="pt-2.5 border-t border-rose-900/60 flex flex-col gap-2">
                        <p className="text-[11px] text-slate-300 font-mono">
                          Would you like to initialize and activate a new student profile for <strong>{unregisteredEmail}</strong> right now?
                        </p>
                        <button
                          type="button"
                          onClick={() => handleInstantCreateAndLogin(unregisteredEmail)}
                          className="w-full py-2.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Create & Sign In with this Email Now →</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Google Sign In Option */}
                {onGoogleSignIn && (
                  <div className="space-y-3 mb-4">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          setIsGoogleSigningIn(true);
                          await onGoogleSignIn();
                        } catch (err) {
                          console.warn("Google sign-in error:", err);
                        } finally {
                          setIsGoogleSigningIn(false);
                        }
                      }}
                      disabled={isGoogleSigningIn}
                      className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer border border-slate-200"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>{isGoogleSigningIn ? "Signing In with Google..." : "Continue with Google (Sync with Cloud)"}</span>
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="h-px bg-slate-800 flex-1" />
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Or Continue with Email</span>
                      <div className="h-px bg-slate-800 flex-1" />
                    </div>
                  </div>
                )}

                {/* Email and Password Form */}
                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-300 mb-1">
                      Account Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="theinsiderspace@gmail.com"
                        value={signInEmail}
                        onChange={(e) => {
                          setSignInEmail(e.target.value);
                          if (signInError) {
                            setSignInError(null);
                            setUnregisteredEmail(null);
                          }
                        }}
                        className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-400 text-white rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-mono font-bold uppercase text-slate-300">
                        Password / Passcode
                      </label>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-400 text-white rounded-xl pl-10 pr-10 py-2.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-orbitron font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Sign In & Open Bluebook Suite</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Helpful Accounts Reference */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAvailableAccounts((prev) => !prev)}
                    className="text-[11px] font-mono text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showAvailableAccounts ? "▾ Hide" : "▸ Show"} registered system accounts</span>
                  </button>
                  {showAvailableAccounts && (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 animate-in fade-in">
                      <div className="text-[10px] text-slate-400 font-mono mb-1">
                        Click an account to autofill email:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {deduplicateProfiles(profilesList).map((p, idx) => (
                          <button
                            key={`auth-acc-${p.id || idx}`}
                            type="button"
                            onClick={() => {
                              setSignInEmail(p.email);
                              setSignInError(null);
                              setUnregisteredEmail(null);
                            }}
                            className="text-[10px] font-mono px-2 py-1 rounded-md bg-slate-800/90 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer truncate max-w-full"
                          >
                            {p.email} ({p.role})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Guest Option */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={onGuestLogin}
                    className="text-slate-400 hover:text-cyan-300 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Continue as Guest Pilot →</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="text-cyan-400 hover:text-cyan-300 font-bold text-xs cursor-pointer"
                  >
                    Need an account? Sign Up
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Sign Up View */}
            {mode === "signup" && (
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {signUpSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{signUpSuccess}</span>
                  </div>
                )}

                {signUpError && (
                  <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{signUpError}</span>
                  </div>
                )}

                <form onSubmit={handleSignUpSubmit} className="space-y-4">
                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-slate-300 mb-1">
                        Full Name <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Maya Lin"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-400 text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-slate-300 mb-1">
                        Email Address <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="maya@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-400 text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>
                  </div>

                  {/* Password & Academic Level */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-slate-300 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showSignUpPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-400 text-white rounded-xl px-3 py-2 pr-9 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignUpPassword((prev) => !prev)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                          {showSignUpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-slate-300 mb-1">
                        Academic Grade
                      </label>
                      <select
                        value={highSchoolGrade}
                        onChange={(e) => setHighSchoolGrade(e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-400 text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer"
                      >
                        {GRADE_LEVELS.map((g) => (
                          <option key={g} value={g} className="bg-slate-900 text-white">
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Target Score Slider */}
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase text-slate-300">
                        Target Composite Score
                      </span>
                      <span className="text-sm font-black font-mono text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                        {targetScore} <span className="text-[10px] text-slate-400">/ 1600</span>
                      </span>
                    </div>

                    <input
                      type="range"
                      min="1000"
                      max="1600"
                      step="10"
                      value={targetScore}
                      onChange={(e) => setTargetScore(Number(e.target.value))}
                      className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />

                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Math: ~{Math.round(targetScore / 2)}</span>
                      <span>Reading & Writing: ~{targetScore - Math.round(targetScore / 2)}</span>
                    </div>
                  </div>

                  {/* Official SAT Date */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-300 mb-1">
                      Upcoming SAT Exam Date
                    </label>
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-400 text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>

                  {/* Avatar Color */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-300 mb-1.5">
                      Avatar Theme
                    </label>
                    <div className="flex items-center gap-2">
                      {AVATAR_COLORS.map((c) => (
                        <button
                          type="button"
                          key={c.class}
                          onClick={() => setAvatarColor(c.class)}
                          className={`w-7 h-7 rounded-full ${c.class} transition-all flex items-center justify-center text-white ${
                            avatarColor === c.class
                              ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#091126] scale-110"
                              : "opacity-75 hover:opacity-100"
                          }`}
                        >
                          {avatarColor === c.class && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-400 hover:opacity-95 text-black font-orbitron font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Register & Launch Adaptive Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="text-xs text-slate-400 hover:text-cyan-300 font-mono transition-colors"
                  >
                    Already registered? <strong className="text-cyan-400 font-bold">Sign In here</strong>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-[#060d1f]/60 backdrop-blur px-6 py-3 text-center text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Role-Based Access Control (RBAC) • Bluebook Calibration Matrix</span>
        </div>
        <div>
          <span>Official 2026 Digital SAT Taxonomy • Desmos Computational HUD</span>
        </div>
      </footer>
    </div>
  );
};
