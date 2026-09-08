import React, { useState } from "react";
import {
  X,
  User,
  Mail,
  Lock,
  GraduationCap,
  ShieldCheck,
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Calendar,
  Target,
  Sliders,
  UserPlus,
  LogIn,
} from "lucide-react";
import { UserProfile, UserRole } from "../types";
import {
  getDefaultPermissions,
  ROLE_DEFINITIONS,
  ADMIN_SECURITY_PIN,
  COLLEGE_BENCHMARKS,
  deduplicateProfiles,
} from "../data/defaultProfiles";
import { OwlyLogoIcon } from "./OwlyLogo";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup";
  profilesList: UserProfile[];
  currentProfileId?: string;
  onSelectProfile: (profileId: string) => void;
  onCreateNewProfile?: (newProfile: UserProfile) => void;
  onSignUp?: (newProfile: UserProfile) => void;
  onLogin?: (profile: UserProfile) => void;
  onGoogleSignIn?: () => Promise<void>;
}

const AVATAR_COLORS = [
  { label: "Indigo", class: "bg-indigo-600" },
  { label: "Emerald", class: "bg-emerald-600" },
  { label: "Purple", class: "bg-purple-600" },
  { label: "Amber", class: "bg-amber-600" },
  { label: "Rose", class: "bg-rose-600" },
  { label: "Cyan", class: "bg-cyan-600" },
  { label: "Slate", class: "bg-slate-900" },
];

const GRADE_LEVELS = [
  "9th Grade (Freshman)",
  "10th Grade (Sophomore)",
  "11th Grade (Junior)",
  "12th Grade (Senior)",
  "Gap Year / Test Retake",
  "Educator / Instructor",
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "signup",
  profilesList,
  currentProfileId = "",
  onSelectProfile,
  onCreateNewProfile,
  onSignUp,
  onLogin,
  onGoogleSignIn,
}) => {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState<boolean>(false);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState<string | null>(null);

  // Sign Up Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const role: UserRole = "student";
  const [highSchoolGrade, setHighSchoolGrade] = useState("11th Grade (Junior)");
  const [targetScore, setTargetScore] = useState(1520);
  const [examDate, setExamDate] = useState("2026-10-10");
  const [avatarColor, setAvatarColor] = useState("bg-indigo-600");
  const [selectedColleges, setSelectedColleges] = useState<string[]>([
    "MIT (Massachusetts Institute of Technology)",
    "Stanford University",
  ]);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState<string | null>(null);

  const currentProfile = profilesList.find((p) => p.id === currentProfileId);
  const isStudent = currentProfile?.role === "student";
  const isGuest = currentProfile?.role === "guest" || !currentProfile;
  const isStudentOrGuest = isStudent || isGuest;

  if (!isOpen) return null;

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);

    const cleanEmail = signInEmail.trim().toLowerCase();
    const matchedProfile = profilesList.find(
      (p) => p.email.toLowerCase() === cleanEmail
    );

    if (!matchedProfile) {
      setSignInError(
        "No account found with this email. Please check your spelling or sign up below."
      );
      return;
    }

    // If account has a password or is admin, verify it
    if (matchedProfile.role === "admin") {
      if (signInPassword !== ADMIN_SECURITY_PIN && signInPassword !== matchedProfile.password) {
        setSignInError(`Admin password required (${ADMIN_SECURITY_PIN}). Please enter the admin password.`);
        return;
      }
    } else if (matchedProfile.password && matchedProfile.password !== signInPassword) {
      setSignInError("Incorrect password. Please try again.");
      return;
    }

    if (onLogin) {
      onLogin(matchedProfile);
    }
    if (onSelectProfile) {
      onSelectProfile(matchedProfile.id);
    }
    onClose();
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

    // Check if email already registered
    const exists = profilesList.some(
      (p) => p.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (exists) {
      setSignUpError("An account with this email address already exists. Please Sign In.");
      return;
    }

    const mathTarget = Math.round(targetScore / 2);
    const rwTarget = targetScore - mathTarget;

    // Create unique ID
    const newId = `user-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .substring(2, 6)}`;

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
      baselineScore: Math.max(400, targetScore - 150),
      examDate,
      examDateLabel,
      dailyGoalMinutes: 60,
      studyDaysPerWeek: ["Mon", "Tue", "Wed", "Thu", "Sat"],
      dreamColleges: selectedColleges,
      weakestDomains: ["Advanced Math", "Standard English Conventions"],
      bio: `Dedicated ${ROLE_DEFINITIONS[role].title} preparing with OWLY SAT.`,
      password: password || undefined,
      accommodations: {
        extendedTime: "Standard (1.0x)",
        enableSoundEffects: true,
        autoShowScratchpad: false,
        highContrastMode: false,
      },
      createdAt: new Date().toISOString().split("T")[0],
    };

    if (onCreateNewProfile) {
      onCreateNewProfile(newProfile);
    } else if (onSignUp) {
      onSignUp(newProfile);
    }

    setSignUpSuccess(`Account created! Welcome to OWLY SAT, ${fullName.trim()}!`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleGuestSignIn = () => {
    // Check if guest profile already exists or create one
    let guest = profilesList.find((p) => p.role === "guest");
    if (!guest) {
      guest = {
        id: "user-guest-explorer",
        name: "Guest Explorer",
        email: "guest@owlysat.trial",
        role: "guest",
        permissions: getDefaultPermissions("guest"),
        avatarColor: "bg-slate-700",
        highSchoolGrade: "Trial Guest Mode",
        targetScore: 1500,
        mathTarget: 750,
        rwTarget: 750,
        baselineScore: 1300,
        examDate: "2026-10-10",
        examDateLabel: "Trial Exploration",
        dailyGoalMinutes: 30,
        dreamColleges: ["MIT", "Stanford", "Harvard"],
        weakestDomains: [],
        bio: "Trial guest exploring OWLY SAT test bank and study plans.",
        accommodations: {
          extendedTime: "Standard (1.0x)",
          enableSoundEffects: true,
          autoShowScratchpad: false,
          highContrastMode: false,
        },
        createdAt: new Date().toISOString().split("T")[0],
      };
      if (onCreateNewProfile) {
        onCreateNewProfile(guest);
      } else if (onSignUp) {
        onSignUp(guest);
      }
    } else {
      if (onLogin) {
        onLogin(guest);
      }
      if (onSelectProfile) {
        onSelectProfile(guest.id);
      }
    }
    onClose();
  };

  const toggleCollege = (college: string) => {
    setSelectedColleges((prev) =>
      prev.includes(college) ? prev.filter((c) => c !== college) : [...prev, college]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header with Mode Switcher */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/50">
          <div className="flex items-center gap-3">
            <OwlyLogoIcon size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  OWLY SAT Account Center
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {mode === "signup" ? "New Registration" : "User Access"}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {mode === "signup"
                  ? "Create your student account with custom target scores and study schedules"
                  : "Sign in to your personalized SAT mastery workspace"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => {
              setMode("signup");
              setSignUpError(null);
            }}
            className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
              mode === "signup"
                ? "border-indigo-600 text-indigo-700 bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Create Account / Sign Up
          </button>
          <button
            onClick={() => {
              setMode("signin");
              setSignInError(null);
            }}
            className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
              mode === "signin"
                ? "border-indigo-600 text-indigo-700 bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <LogIn className="w-4 h-4" />
            {isStudentOrGuest ? "Sign In" : "Sign In & Fast Switch"}
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {mode === "signup" ? (
            <form onSubmit={handleSignUpSubmit} className="space-y-6">
              {signUpSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{signUpSuccess}</span>
                </div>
              )}

              {signUpError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{signUpError}</span>
                </div>
              )}

              {/* 1. Account Credentials */}
              <div className="space-y-4">
                <div className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  1. Identity & Credentials
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maya Lin"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. maya@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password / Security PIN
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Optional passcode for quick sign in</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Academic Level
                    </label>
                    <select
                      value={highSchoolGrade}
                      onChange={(e) => setHighSchoolGrade(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {GRADE_LEVELS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Target Score & Test Date */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <div className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-600" />
                  2. Target Score & Digital SAT Exam Date
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-700">Composite Target Score</span>
                      <span className="text-lg font-black font-mono text-indigo-600">
                        {targetScore} <span className="text-xs text-slate-400">/ 1600</span>
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="1600"
                      step="10"
                      value={targetScore}
                      onChange={(e) => setTargetScore(Number(e.target.value))}
                      className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>Math: ~{Math.round(targetScore / 2)}</span>
                      <span>Reading & Writing: ~{targetScore - Math.round(targetScore / 2)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Upcoming Official SAT Date
                    </label>
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Avatar Theme */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                  3. Profile Avatar Theme
                </div>
                <div className="flex items-center gap-3">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      type="button"
                      key={c.class}
                      onClick={() => setAvatarColor(c.class)}
                      className={`w-8 h-8 rounded-full ${c.class} transition-all flex items-center justify-center text-white ${
                        avatarColor === c.class
                          ? "ring-4 ring-indigo-300 ring-offset-2 scale-110"
                          : "opacity-80 hover:opacity-100"
                      }`}
                    >
                      {avatarColor === c.class && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 group"
              >
                <span>Create OWLY SAT Account</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </form>
          ) : (
            /* Sign In / Account Switcher */
            <div className="space-y-6">
              {signInError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{signInError}</span>
                </div>
              )}

              {/* Fast Demo Account Switcher - Only available for staff/admin accounts */}
              {!isStudentOrGuest && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      Instant Fast Switch (Registered Accounts)
                    </div>
                    <span className="text-[11px] text-slate-400">Click to load profile</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {deduplicateProfiles(profilesList).map((p, idx) => {
                      const isCurrent = p.id === currentProfileId;
                      const roleInfo = ROLE_DEFINITIONS[p.role] || ROLE_DEFINITIONS.student;

                      return (
                        <button
                          key={`auth-modal-acc-${p.id}-${idx}`}
                          type="button"
                          onClick={() => {
                            onSelectProfile(p.id);
                            onClose();
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                            isCurrent
                              ? "border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500"
                              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl ${p.avatarColor} text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs`}
                            >
                              {p.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900 truncate">
                                  {p.name}
                                </span>
                                {isCurrent && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-600 text-white">
                                    Active
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">{p.email}</div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span
                                  className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${roleInfo.badgeColor}`}
                                >
                                  {roleInfo.badge}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {p.targetScore} Target
                                </span>
                              </div>
                            </div>
                          </div>

                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 shrink-0 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Google Sign In Option */}
              {onGoogleSignIn && (
                <div className="space-y-2 mb-4">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        setIsGoogleSigningIn(true);
                        await onGoogleSignIn();
                        onClose();
                      } catch (err) {
                        console.warn("Google sign in error:", err);
                      } finally {
                        setIsGoogleSigningIn(false);
                      }
                    }}
                    disabled={isGoogleSigningIn}
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs tracking-wide transition-all shadow-xs border border-slate-200 flex items-center justify-center gap-2.5 cursor-pointer"
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
                  <div className="flex items-center gap-3 py-1">
                    <div className="h-px bg-slate-200 flex-1" />
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Or Email Sign In</span>
                    <div className="h-px bg-slate-200 flex-1" />
                  </div>
                </div>
              )}

              {/* Manual Email Login Form */}
              <form onSubmit={handleSignInSubmit} className={`space-y-4 ${!isStudentOrGuest ? "pt-4 border-t border-slate-100" : ""}`}>
                <div className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                  Sign In With Email & Password
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Account Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="jordan.davis@satprep.edu"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password (Optional if not set)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleGuestSignIn}
                    className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                  >
                    Explore as Guest
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure Role-Based Access Control (RBAC)</span>
          </div>
          {mode === "signup" ? (
            <button
              onClick={() => setMode("signin")}
              className="text-indigo-600 hover:text-indigo-800 font-bold"
            >
              Already have an account? Sign In
            </button>
          ) : (
            <button
              onClick={() => setMode("signup")}
              className="text-indigo-600 hover:text-indigo-800 font-bold"
            >
              Need an account? Sign Up
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
