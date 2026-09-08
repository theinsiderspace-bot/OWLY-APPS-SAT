import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Target,
  Calendar,
  Clock,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Check,
  Plus,
  Trash2,
  Sliders,
  Award,
  BookOpen,
  Volume2,
  FileText,
  Users,
  Lock,
  KeyRound,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  School,
  ExternalLink,
  Flame,
  UserPlus,
  LogOut,
  CreditCard,
  Crown,
  Tag,
  ArrowRight,
  Zap,
  Receipt,
} from "lucide-react";
import { UserProfile, SATDomain, UserRole, UserPermissions, StudentTier, StudentTierConfig } from "../types";
import {
  POPULAR_DREAM_COLLEGES,
  COLLEGE_BENCHMARKS,
  ROLE_DEFINITIONS,
  ADMIN_SECURITY_PIN,
  getDefaultPermissions,
  deduplicateProfiles,
} from "../data/defaultProfiles";
import {
  DEFAULT_STUDENT_TIERS,
  getStudentTier,
} from "../data/studentTiers";
import { OwlyLogoIcon } from "./OwlyLogo";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  profilesList: UserProfile[];
  onSaveProfile: (profile: UserProfile) => void;
  onSelectProfile: (profileId: string) => void;
  onCreateNewProfile: (newProfile: UserProfile) => void;
  onDeleteProfile: (profileId: string) => void;
  onOpenSignUpModal?: () => void;
  onOpenStudentTiersModal?: () => void;
  onResetAttempts?: () => void;
  onSignOut?: () => void;
  customTiers?: Record<StudentTier, StudentTierConfig>;
}

const ALL_DOMAINS: SATDomain[] = [
  "Algebra",
  "Advanced Math",
  "Problem Solving & Data Analysis",
  "Geometry & Trigonometry",
  "Information and Ideas",
  "Craft and Structure",
  "Expression of Ideas",
  "Standard English Conventions",
];

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
  "Gap Year / College Transfer",
  "Educator / Instructor",
];

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  profilesList,
  onSaveProfile,
  onSelectProfile,
  onCreateNewProfile,
  onDeleteProfile,
  onOpenSignUpModal,
  onOpenStudentTiersModal,
  onResetAttempts,
  onSignOut,
  customTiers,
}) => {
  const activeTiers = customTiers || DEFAULT_STUDENT_TIERS;
  const isStudent = currentProfile.role === "student";
  const isGuest = currentProfile.role === "guest";

  const [activeTab, setActiveTab] = useState<
    "identity" | "membership" | "permissions" | "targets" | "schedule" | "accommodations" | "accounts" | "data"
  >("identity");

  // Local form state
  const [form, setForm] = useState<UserProfile>({ ...currentProfile });
  const [newCollegeInput, setNewCollegeInput] = useState<string>("");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [adminPinInput, setAdminPinInput] = useState<string>("");
  const [roleChangeError, setRoleChangeError] = useState<string | null>(null);
  const [autoPermissionsBasedOnRole, setAutoPermissionsBasedOnRole] = useState<boolean>(false);

  // Sync form if currentProfile changes
  useEffect(() => {
    setForm({ ...currentProfile });
  }, [currentProfile]);

  // Ensure students & guests cannot stay on restricted tabs
  useEffect(() => {
    if ((isStudent || isGuest) && (activeTab === "permissions" || activeTab === "accounts" || activeTab === "data")) {
      setActiveTab("identity");
    }
  }, [isStudent, isGuest, activeTab]);

  if (!isOpen) return null;

  const currentRoleInfo = ROLE_DEFINITIONS[form.role] || ROLE_DEFINITIONS.student;

  const handleTogglePermission = (permKey: keyof UserPermissions) => {
    setForm((prev) => {
      const currentPerms = prev.permissions || getDefaultPermissions(prev.role);
      return {
        ...prev,
        permissions: {
          ...currentPerms,
          [permKey]: !currentPerms[permKey],
        },
      };
    });
  };

  const handleResetPermissionsToRole = () => {
    setForm((prev) => ({
      ...prev,
      permissions: getDefaultPermissions(prev.role),
    }));
  };

  const handleGrantAllPermissions = () => {
    setForm((prev) => {
      const allPerms: UserPermissions = {
        canPracticeAndDrill: true,
        canViewStudyPlan: true,
        canAccessQuestionBank: true,
        canEditQuestions: true,
        canManageCurriculum: true,
        canAccessAdminPanel: true,
        canManageUsersAndRoles: true,
        canModifySystemGrading: true,
        canViewAllStudentReports: true,
        canExportData: true,
      };
      return {
        ...prev,
        permissions: allPerms,
      };
    });
  };

  const handleRevokeAllPermissions = () => {
    setForm((prev) => {
      const allPerms: UserPermissions = {
        canPracticeAndDrill: false,
        canViewStudyPlan: false,
        canAccessQuestionBank: false,
        canEditQuestions: false,
        canManageCurriculum: false,
        canAccessAdminPanel: false,
        canManageUsersAndRoles: false,
        canModifySystemGrading: false,
        canViewAllStudentReports: false,
        canExportData: false,
      };
      return {
        ...prev,
        permissions: allPerms,
      };
    });
  };

  const handleSave = () => {
    // Validate target score bounds
    const cleanTarget = Math.min(1600, Math.max(400, form.targetScore));
    const cleanMath = Math.min(800, Math.max(200, form.mathTarget));
    const cleanRw = Math.min(800, Math.max(200, form.rwTarget));

    // Update label based on examDate
    let examDateLabel = form.examDateLabel;
    if (form.examDate) {
      const d = new Date(form.examDate);
      if (!isNaN(d.getTime())) {
        const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        examDateLabel = `${monthNames[d.getMonth()]} ${d.getFullYear()} Digital SAT`;
      }
    }

    const updated: UserProfile = {
      ...form,
      targetScore: cleanTarget,
      mathTarget: cleanMath,
      rwTarget: cleanRw,
      examDateLabel,
      permissions: form.permissions || getDefaultPermissions(form.role),
    };

    onSaveProfile(updated);
    setSaveSuccessMsg("Profile and permission controls saved successfully!");
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleAddCollege = (college: string) => {
    if (!college.trim()) return;
    if (!form.dreamColleges.includes(college.trim())) {
      setForm((prev) => ({
        ...prev,
        dreamColleges: [...prev.dreamColleges, college.trim()],
      }));
    }
    setNewCollegeInput("");
  };

  const handleRemoveCollege = (college: string) => {
    setForm((prev) => ({
      ...prev,
      dreamColleges: prev.dreamColleges.filter((c) => c !== college),
    }));
  };

  const handleToggleDomain = (domain: SATDomain) => {
    setForm((prev) => {
      const exists = prev.weakestDomains.includes(domain);
      return {
        ...prev,
        weakestDomains: exists
          ? prev.weakestDomains.filter((d) => d !== domain)
          : [...prev.weakestDomains, domain],
      };
    });
  };

  const handleToggleStudyDay = (day: string) => {
    setForm((prev) => {
      const currentDays = prev.studyDaysPerWeek || ["Mon", "Tue", "Wed", "Thu", "Sat"];
      const exists = currentDays.includes(day);
      return {
        ...prev,
        studyDaysPerWeek: exists
          ? currentDays.filter((d) => d !== day)
          : [...currentDays, day],
      };
    });
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRoleChangeError(null);
    if (newRole === "admin" && form.role !== "admin") {
      if (adminPinInput.trim() !== ADMIN_SECURITY_PIN) {
        setRoleChangeError(`Admin Password required to elevate to Master Admin. (Admin Password: ${ADMIN_SECURITY_PIN})`);
        return;
      }
    }

    setForm((prev) => ({
      ...prev,
      role: newRole,
      permissions: autoPermissionsBasedOnRole
        ? getDefaultPermissions(newRole)
        : prev.permissions || getDefaultPermissions(newRole),
    }));
    setAdminPinInput("");
  };

  const handleExportProfileJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(form, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `owly_sat_profile_${form.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Calculate days remaining to exam
  const examDateObj = new Date(form.examDate);
  const today = new Date();
  const diffTime = examDateObj.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-profile-modal-title"
    >
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-5 flex items-center justify-between text-white border-b border-indigo-900/50 shrink-0">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl ${form.avatarColor} flex items-center justify-center font-black text-lg shadow-md border-2 border-white/20`}
            >
              {form.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="user-profile-modal-title" className="text-base sm:text-lg font-black tracking-tight text-white">
                  {form.name}
                </h2>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${currentRoleInfo.badgeColor}`}>
                  {currentRoleInfo.badge}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium flex items-center gap-2">
                <span>{form.email}</span>
                <span>•</span>
                <span>Target: <strong className="text-indigo-300 font-mono font-bold">{form.targetScore}</strong></span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">{daysRemaining}d to exam</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close Profile Setup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-6 pt-3 pb-2 border-b border-slate-200 bg-slate-50/80 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab("identity")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === "identity"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <User className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isStudent ? "Student Profile" : isGuest ? "Guest Settings" : "Identity & Account"}</span>
          </button>

          {!isGuest && (
            <button
              onClick={() => setActiveTab("membership")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === "membership"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
              <span>Student Tier & Billing</span>
            </button>
          )}

          {!isStudent && !isGuest && (
            <button
              onClick={() => setActiveTab("permissions")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === "permissions"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Role & Permissions</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("targets")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === "targets"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Target className="w-3.5 h-3.5 text-emerald-600" />
            <span>Score Targets & Colleges</span>
          </button>

          <button
            onClick={() => setActiveTab("schedule")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === "schedule"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            <span>Pacing & Schedule</span>
          </button>

          <button
            onClick={() => setActiveTab("accommodations")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === "accommodations"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-rose-600" />
            <span>Accommodations</span>
          </button>

          {!isStudent && !isGuest && (
            <button
              onClick={() => setActiveTab("accounts")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === "accounts"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Accounts ({profilesList.length})</span>
            </button>
          )}

          {!isStudent && !isGuest && (
            <button
              onClick={() => setActiveTab("data")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === "data"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Data & Privacy</span>
            </button>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {saveSuccessMsg && (
            <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* TAB 1: Identity & Account */}
          {activeTab === "identity" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    User Full Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    placeholder="e.g. Jordan Davis"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    placeholder="student@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Academic Grade / Level
                  </label>
                  <select
                    value={form.highSchoolGrade}
                    onChange={(e) => setForm({ ...form, highSchoolGrade: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    {GRADE_LEVELS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Account Password / Security Passcode
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={form.password || ""}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="•••••••• (Leave blank to keep unchanged)"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Bio Statement */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Academic Goal & Student Bio
                </label>
                <textarea
                  rows={2}
                  value={form.bio || ""}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="e.g. Aspiring Computer Science major aiming for 1550+ on the October Digital SAT."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"
                />
              </div>

              {/* Avatar Color Accent */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Avatar Theme Accent
                </label>
                <div className="flex items-center gap-3">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c.class}
                      type="button"
                      onClick={() => setForm({ ...form, avatarColor: c.class })}
                      className={`w-9 h-9 rounded-full ${c.class} flex items-center justify-center text-white transition-all ${
                        form.avatarColor === c.class
                          ? "ring-4 ring-indigo-400 ring-offset-2 scale-110 shadow-md"
                          : "opacity-80 hover:opacity-100 hover:scale-105"
                      }`}
                    >
                      {form.avatarColor === c.class && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Student Membership Tier & Billing */}
          {activeTab === "membership" && (
            <div className="space-y-6">
              {/* Active Plan Hero Header */}
              {(() => {
                const currentTier = getStudentTier(form.tier || "starter");
                return (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">
                          Active Student Tier:
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${currentTier.badgeColor}`}
                        >
                          {currentTier.name}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-white">{currentTier.tagline}</h3>
                      <p className="text-xs text-slate-300 max-w-xl">
                        {currentTier.targetAudience} • {currentTier.limits.scoreGuarantee || "Standard Diagnostics"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onOpenStudentTiersModal && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenStudentTiersModal();
                          }}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Compare All Plans</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Tier Selection Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Select & Switch Student Tier
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Changes apply immediately to your permissions and test limits.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(Object.keys(activeTiers) as StudentTier[]).map((tierKey) => {
                    const tier = activeTiers[tierKey];
                    const isSelected = (form.tier || "starter") === tier.id;

                    return (
                      <div
                        key={tier.id}
                        onClick={() => {
                          setForm({
                            ...form,
                            tier: tier.id,
                            permissions: {
                              ...(form.permissions || getDefaultPermissions(form.role)),
                              ...tier.permissions,
                            },
                          });
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500 shadow-md"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${tier.badgeColor}`}
                            >
                              {tier.badge}
                            </span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                                ✓
                              </span>
                            )}
                          </div>

                          <div className="text-sm font-extrabold text-slate-900">
                            {tier.name}
                          </div>

                          <div className="text-base font-black text-slate-900 font-mono">
                            {tier.paymentStructure.type === "free"
                              ? "$0"
                              : `$${tier.paymentStructure.monthlyPrice}/mo`}
                          </div>

                          <p className="text-[11px] text-slate-500 line-clamp-2">
                            {tier.tagline}
                          </p>

                          <div className="space-y-1 pt-2 border-t border-slate-100 text-[10px] text-slate-600">
                            <div>• {tier.limits.dailyPracticeQuestions === "unlimited" ? "Unlimited Questions" : `${tier.limits.dailyPracticeQuestions} Qs/day`}</div>
                            <div>• {tier.limits.aiTutorDailyQueries === "unlimited" ? "Unlimited AI Tutor" : `${tier.limits.aiTutorDailyQueries} AI Queries/day`}</div>
                            <div>• {tier.limits.materialPdfAnalyzerAllowed ? "PDF Score Analyzer ✓" : "No PDF Analyzer"}</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          className={`mt-4 w-full py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? "bg-indigo-600 text-white shadow-2xs"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {isSelected ? "Active Tier" : "Select Tier"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Billing & Subscription Metadata */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Receipt className="w-4 h-4 text-indigo-600" />
                    <span>Subscription & Payment Structure Details</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {form.subscription?.status ? form.subscription.status.toUpperCase() : "ACTIVE"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Billing Frequency</span>
                    <div className="font-bold text-slate-800 capitalize mt-0.5">
                      {form.subscription?.billingInterval || "Annual (Billed Yearly)"}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Payment Method</span>
                    <div className="font-bold text-slate-800 mt-0.5">
                      {form.subscription?.paymentMethodBrand || "Visa"} ending in {form.subscription?.paymentMethodLast4 || "4242"}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Next Renewal Date</span>
                    <div className="font-bold text-indigo-600 mt-0.5">
                      {form.subscription?.currentPeriodEnd || "2027-08-01"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Role & Permission Matrix (RBAC) */}
          {!isStudent && !isGuest && activeTab === "permissions" && (
            <div className="space-y-6">
              {roleChangeError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{roleChangeError}</span>
                </div>
              )}

              {/* Current Role Overview Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">
                      Current Permission Level:
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${currentRoleInfo.badgeColor}`}>
                      {currentRoleInfo.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white">{currentRoleInfo.title}</h3>
                  <p className="text-xs text-slate-300 max-w-xl">{currentRoleInfo.description}</p>
                </div>

                <div className="shrink-0">
                  <span className="text-[11px] font-mono text-slate-400 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                    ID: {form.id}
                  </span>
                </div>
              </div>

              {/* Role Switcher with Admin Pin Verification */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Switch Permission Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(["student", "tutor", "admin"] as UserRole[]).map((r) => {
                    const info = ROLE_DEFINITIONS[r];
                    const isSelected = form.role === r;
                    return (
                      <div
                        key={r}
                        onClick={() => handleRoleChange(r)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/60 shadow-xs"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${info.badgeColor}`}>
                            {info.badge}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                        </div>
                        <div className="text-xs font-bold text-slate-900">{info.title}</div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">{info.description}</p>
                      </div>
                    );
                  })}
                </div>

                {form.role !== "admin" && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 text-amber-900">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <KeyRound className="w-4 h-4 text-amber-700" />
                      <span>Elevate to Master Admin Authority</span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      To promote this account to Master Administrator with curriculum and question editing rights, enter the Admin Password:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder={`Admin Password (${ADMIN_SECURITY_PIN})`}
                        value={adminPinInput}
                        onChange={(e) => setAdminPinInput(e.target.value)}
                        className="px-3.5 py-2 bg-white rounded-xl border border-amber-300 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleRoleChange("admin")}
                        className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                      >
                        Authorize Master Role
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Granular Permission Rights Checklist */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Granular Access Rights Matrix
                    </label>
                    <p className="text-[11px] text-slate-500">
                      {autoPermissionsBasedOnRole
                        ? "Permissions automatically assigned based on user role."
                        : "Automatic based on role is disabled. Click any permission to toggle custom overrides."}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const next = !autoPermissionsBasedOnRole;
                        setAutoPermissionsBasedOnRole(next);
                        if (next) {
                          handleResetPermissionsToRole();
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                        autoPermissionsBasedOnRole
                          ? "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                          : "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs"
                      }`}
                      title="Toggle automatic role-based permissions sync"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>
                        Automatic based on role:{" "}
                        <span className={autoPermissionsBasedOnRole ? "font-bold text-slate-800" : "font-bold text-emerald-700"}>
                          {autoPermissionsBasedOnRole ? "Enabled" : "Disabled"}
                        </span>
                      </span>
                    </button>
                  </div>
                </div>

                {/* Granular Controls Action Bar */}
                <div className="flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                  <span className="text-[11px] font-medium text-slate-600">
                    {!autoPermissionsBasedOnRole ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Custom manual permission editing enabled
                      </span>
                    ) : (
                      "Synced with role template"
                    )}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleGrantAllPermissions}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      Grant All
                    </button>
                    <button
                      type="button"
                      onClick={handleRevokeAllPermissions}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      Revoke All
                    </button>
                    <button
                      type="button"
                      onClick={handleResetPermissionsToRole}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-[11px] font-bold text-indigo-700 transition-colors cursor-pointer"
                    >
                      Reset to Role
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { key: "canPracticeAndDrill", label: "Take Bluebook-Style Practice Drills", desc: "Adaptive timed modules and diagnostic scoring" },
                    { key: "canViewStudyPlan", label: "Access 8-Week Personalized Roadmap", desc: "Daily milestone checklist and formula guides" },
                    { key: "canAccessQuestionBank", label: "Browse 5,000 Questions Repository", desc: "Filter by 8 domains and explore answer distractors" },
                    { key: "canEditQuestions", label: "Edit & Add Question Bank Items", desc: "Modify questions, correct answers, and trap explanations", roleReq: "Tutor / Admin" },
                    { key: "canViewAllStudentReports", label: "View Multi-Student Analytics Hub", desc: "Review performance curves across all learners", roleReq: "Tutor / Admin" },
                    { key: "canManageCurriculum", label: "Re-order Curriculum Roadmaps", desc: "Modify weekly tasks and study strategy summaries", roleReq: "Admin Only" },
                    { key: "canAccessAdminPanel", label: "Master Admin Control Center", desc: "Full root access to system settings and database", roleReq: "Admin Only" },
                    { key: "canModifySystemGrading", label: "Calibrate Psychometric Curves", desc: "Tune strict vs lenient grading algorithms", roleReq: "Admin Only" },
                    { key: "canManageUsersAndRoles", label: "Manage User Accounts & Security", desc: "Create, edit, and switch student & educator profiles", roleReq: "Admin Only" },
                    { key: "canExportData", label: "Export Study Analytics & Diagnostics", desc: "Download full diagnostic JSON reports and scores" },
                  ].map((perm) => {
                    const isGranted = (form.permissions as any)?.[perm.key] ?? false;
                    return (
                      <button
                        type="button"
                        key={perm.key}
                        onClick={() => {
                          if (autoPermissionsBasedOnRole) {
                            setAutoPermissionsBasedOnRole(false);
                          }
                          handleTogglePermission(perm.key as keyof UserPermissions);
                        }}
                        className={`text-left p-3 rounded-xl border flex items-start justify-between gap-3 transition-all cursor-pointer ${
                          isGranted
                            ? "bg-emerald-50/70 border-emerald-300 hover:border-emerald-400 shadow-xs"
                            : "bg-slate-50/80 border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold ${isGranted ? "text-emerald-950" : "text-slate-700"}`}>
                              {perm.label}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{perm.desc}</p>
                          {perm.roleReq && !isGranted && (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.2 rounded mt-1 inline-block">
                              Standard default: {perm.roleReq}
                            </span>
                          )}
                        </div>

                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 transition-colors ${
                            isGranted
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                              : "border-slate-300 bg-white text-slate-400 hover:border-slate-400"
                          }`}
                        >
                          {isGranted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Score Targets & Dream Colleges */}
          {activeTab === "targets" && (
            <div className="space-y-6">
              {/* Target Score Composite */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Overall Composite Target Score
                    </h3>
                    <p className="text-xs text-slate-500">Digital SAT Scale: 400 – 1600</p>
                  </div>
                  <div className="text-2xl font-black font-mono text-indigo-600">
                    {form.targetScore} <span className="text-xs font-normal text-slate-400">/ 1600</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="800"
                  max="1600"
                  step="10"
                  value={form.targetScore}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    const half = Math.round(val / 2 / 10) * 10;
                    setForm({
                      ...form,
                      targetScore: val,
                      mathTarget: half,
                      rwTarget: val - half,
                    });
                  }}
                  className="w-full accent-indigo-600 cursor-pointer h-2.5 bg-slate-200 rounded-lg"
                />

                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2">
                  <span>800</span>
                  <span>1200</span>
                  <span>1400</span>
                  <span className="font-bold text-indigo-600">1500 (99th %ile)</span>
                  <span>1600 (Perfect)</span>
                </div>
              </div>

              {/* Math vs Reading Section Targets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Math Target (200 - 800)</span>
                    <span className="text-lg font-black font-mono text-indigo-600">{form.mathTarget}</span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="800"
                    step="10"
                    value={form.mathTarget}
                    onChange={(e) => {
                      const m = parseInt(e.target.value, 10);
                      setForm({
                        ...form,
                        mathTarget: m,
                        targetScore: m + form.rwTarget,
                      });
                    }}
                    className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                  />
                  <p className="text-[11px] text-slate-400">Algebra, Advanced Math, Problem Solving, Geometry</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Reading & Writing (200 - 800)</span>
                    <span className="text-lg font-black font-mono text-indigo-600">{form.rwTarget}</span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="800"
                    step="10"
                    value={form.rwTarget}
                    onChange={(e) => {
                      const rw = parseInt(e.target.value, 10);
                      setForm({
                        ...form,
                        rwTarget: rw,
                        targetScore: form.mathTarget + rw,
                      });
                    }}
                    className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                  />
                  <p className="text-[11px] text-slate-400">Info & Ideas, Craft & Structure, Expression, Conventions</p>
                </div>
              </div>

              {/* Baseline Diagnostic Score */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Baseline Diagnostic Score
                  </label>
                  <input
                    type="number"
                    min="400"
                    max="1600"
                    step="10"
                    value={form.baselineScore}
                    onChange={(e) => setForm({ ...form, baselineScore: parseInt(e.target.value, 10) || 1200 })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Starting point to calculate growth trajectory</p>
                </div>

                <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex flex-col justify-center">
                  <div className="text-xs text-indigo-800 font-bold">Projected Point Jump:</div>
                  <div className="text-xl font-black text-indigo-600 font-mono">
                    +{Math.max(0, form.targetScore - form.baselineScore)} Points
                  </div>
                  <div className="text-[11px] text-indigo-600/80">From {form.baselineScore} to {form.targetScore}</div>
                </div>
              </div>

              {/* Dream Colleges Benchmarks */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Target Dream Colleges & Admissions Benchmarks
                  </label>
                  <span className="text-[11px] text-slate-400">SAT 25th - 75th percentiles</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {form.dreamColleges.map((college) => {
                    const bench = COLLEGE_BENCHMARKS.find((b) => b.name === college);
                    return (
                      <span
                        key={college}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-950 border border-indigo-200 text-xs font-bold shadow-xs"
                      >
                        <School className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{college}</span>
                        {bench && (
                          <span className="text-[10px] font-mono text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded">
                            {bench.satRange}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveCollege(college)}
                          className="text-indigo-400 hover:text-indigo-700 p-0.5 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>

                {/* Add College Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCollegeInput}
                    onChange={(e) => setNewCollegeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCollege(newCollegeInput);
                      }
                    }}
                    placeholder="Type custom college name (e.g. Rice University)..."
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCollege(newCollegeInput)}
                    className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shrink-0"
                  >
                    Add College
                  </button>
                </div>

                {/* Quick Add List */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 block">Top Institutional Benchmarks:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-36 overflow-y-auto">
                    {COLLEGE_BENCHMARKS.map((bench) => {
                      const isAdded = form.dreamColleges.includes(bench.name);
                      return (
                        <button
                          key={bench.name}
                          type="button"
                          onClick={() => (isAdded ? handleRemoveCollege(bench.name) : handleAddCollege(bench.name))}
                          className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                            isAdded
                              ? "bg-indigo-50 border-indigo-300 text-indigo-900 font-bold"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="truncate">
                            <div className="truncate font-semibold">{bench.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{bench.satRange} ({bench.acceptanceRate})</div>
                          </div>
                          <span className={`text-[11px] font-bold shrink-0 ml-1 ${isAdded ? "text-indigo-600" : "text-slate-400"}`}>
                            {isAdded ? "✓" : "+"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Schedule & Pacing */}
          {activeTab === "schedule" && (
            <div className="space-y-6">
              {/* Test Date Countdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target Official Digital SAT Exam Date
                  </label>
                  <input
                    type="date"
                    value={form.examDate}
                    onChange={(e) => setForm({ ...form, examDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-indigo-900 text-white flex items-center justify-between border border-indigo-950">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">
                      Days Until Test
                    </div>
                    <div className="text-2xl font-black font-mono text-white">
                      {daysRemaining} Days
                    </div>
                    <div className="text-[11px] text-indigo-200">{form.examDateLabel}</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-800/80 flex items-center justify-center text-indigo-300">
                    <Flame className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
              </div>

              {/* Daily Study Goal */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-800">Daily Study Time Goal</span>
                  </div>
                  <span className="text-base font-black font-mono text-indigo-600">{form.dailyGoalMinutes} Minutes / Day</span>
                </div>

                <div className="grid grid-cols-6 gap-2">
                  {[15, 30, 45, 60, 90, 120].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setForm({ ...form, dailyGoalMinutes: mins })}
                      className={`py-2 rounded-xl text-xs font-bold font-mono transition-all border ${
                        form.dailyGoalMinutes === mins
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Weekly Commitment Days */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Weekly Practice Commitment Days
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = (form.studyDaysPerWeek || []).includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleToggleStudyDay(day)}
                        className={`py-3 rounded-2xl text-xs font-bold transition-all border ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority Weakest Domains */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Priority Focus Domains (Select areas needing most review)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ALL_DOMAINS.map((domain) => {
                    const isChecked = form.weakestDomains.includes(domain);
                    return (
                      <button
                        key={domain}
                        type="button"
                        onClick={() => handleToggleDomain(domain)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs font-bold transition-all ${
                          isChecked
                            ? "bg-indigo-50 border-indigo-300 text-indigo-900"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span>{domain}</span>
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                            isChecked ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 bg-white"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Accommodations & Testing Experience */}
          {activeTab === "accommodations" && (
            <div className="space-y-6">
              {/* Extended Time */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  College Board Approved Timing Accommodation
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(["Standard (1.0x)", "1.5x Time", "2.0x Double Time", "Unlimited Time"] as const).map((timeOpt) => {
                    const isSel = form.accommodations.extendedTime === timeOpt;
                    return (
                      <button
                        key={timeOpt}
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            accommodations: { ...form.accommodations, extendedTime: timeOpt },
                          })
                        }
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          isSel
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <div className="text-xs font-black">{timeOpt}</div>
                        <div className={`text-[10px] mt-0.5 ${isSel ? "text-indigo-200" : "text-slate-400"}`}>
                          {timeOpt === "Standard (1.0x)"
                            ? "90s / Q"
                            : timeOpt === "1.5x Time"
                            ? "135s / Q"
                            : timeOpt === "2.0x Double Time"
                            ? "180s / Q"
                            : "Untimed"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Practice Experience & Accessibility Preferences
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-slate-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Audio Feedback & Celebrations</div>
                      <div className="text-[11px] text-slate-500">Play subtle sound chime when answering questions correctly</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.accommodations.enableSoundEffects}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        accommodations: { ...form.accommodations, enableSoundEffects: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Auto-Open Scratchpad on Math Questions</div>
                      <div className="text-[11px] text-slate-500">Automatically display scratch canvas for geometry and advanced equations</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.accommodations.autoShowScratchpad}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        accommodations: { ...form.accommodations, autoShowScratchpad: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 6: Manage & Switch Accounts */}
          {!isStudent && !isGuest && activeTab === "accounts" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Registered OWLY SAT Accounts ({profilesList.length})
                  </h3>
                  <p className="text-xs text-slate-500">Switch active session or create new student account</p>
                </div>
                {onOpenSignUpModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSignUpModal();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register New Account</span>
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {deduplicateProfiles(profilesList).map((p, idx) => {
                  const isCurrent = p.id === currentProfile.id;
                  const roleInfo = ROLE_DEFINITIONS[p.role] || ROLE_DEFINITIONS.student;

                  return (
                    <div
                      key={`user-profile-acc-${p.id}-${idx}`}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                        isCurrent
                          ? "bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-400"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl ${p.avatarColor} text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs`}
                        >
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900 truncate">{p.name}</span>
                            {isCurrent && (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                                Active Profile
                              </span>
                            )}
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${roleInfo.badgeColor}`}>
                              {roleInfo.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            {p.email} • Target: <strong className="text-slate-800">{p.targetScore}</strong> • {p.highSchoolGrade}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectProfile(p.id);
                              setForm(p);
                              setActiveTab("identity");
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                          >
                            Switch To
                          </button>
                        )}
                        {profilesList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => onDeleteProfile(p.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 7: Data & Privacy */}
          {!isStudent && !isGuest && activeTab === "data" && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Export SAT Student Profile & Metadata
                  </h3>
                </div>
                <p className="text-xs text-slate-600">
                  Download your complete study roadmap, domain masteries, target score benchmarks, and account settings in JSON format.
                </p>
                <button
                  type="button"
                  onClick={handleExportProfileJson}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Profile JSON Backup</span>
                </button>
              </div>

              {onResetAttempts && (
                <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
                  <div className="flex items-center gap-2 text-rose-900">
                    <RotateCcw className="w-4 h-4 text-rose-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      Reset Personal Question History & Quiz Attempts
                    </h3>
                  </div>
                  <p className="text-xs text-rose-800">
                    Clears all logged test answers and resets accuracy curves for this profile. Your 5,000 question repository and study plans remain intact.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Are you sure you want to reset all test attempts for this profile?")) {
                        onResetAttempts();
                        alert("Quiz attempts reset successfully.");
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
                  >
                    Reset Quiz History
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {onSignOut && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSignOut();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors"
                title="Sign Out of this account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
            <div className="hidden sm:block text-xs text-slate-500">
              Account Created: <span className="font-semibold text-slate-700">{form.createdAt || "Active Session"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Save & Apply Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
