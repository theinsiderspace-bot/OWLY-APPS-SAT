/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { StudyPlanView } from "./components/StudyPlanView";
import { PracticeView } from "./components/PracticeView";
import { MaterialAnalyzerView } from "./components/MaterialAnalyzerView";
import { ProgressReportView } from "./components/ProgressReportView";
import { FormulaGuideView } from "./components/FormulaGuideView";
import { CalculatorModal } from "./components/CalculatorModal";
import { ScratchpadModal } from "./components/ScratchpadModal";
import { AiTutorModal } from "./components/AiTutorModal";
import { QuestionBankHubView } from "./components/QuestionBankHubView";
import { UserProfileModal } from "./components/UserProfileModal";
import { AuthModal } from "./components/AuthModal";
import { AuthView } from "./components/AuthView";
import { StudentTiersModal } from "./components/StudentTiersModal";
import { AdminControlView } from "./components/AdminControlView";
import { TrainingAcademyView } from "./components/TrainingAcademyView";
import { HomeworkHubView } from "./components/HomeworkHubView";
import {
  SATQuestion,
  StudyPlan,
  MaterialAnalysisReport,
  QuizAttempt,
  UserPerformanceStats,
  SATDomain,
  DifficultyLevel,
  UserProfile,
  AdminSystemConfig,
  AdminAuditLog,
  MathFormulaItem,
  StudentTier,
  StudentTierConfig,
  UserSubscription,
  HomeworkAssignment,
} from "./types";
import { INITIAL_QUESTION_BANK } from "./data/questionBank";
import { generateFull10000QuestionBank } from "./data/questionGeneratorEngine";
import { DEFAULT_STUDY_PLAN, INITIAL_MATERIAL_REPORT } from "./data/defaultPlan";
import { DEFAULT_HOMEWORK_ASSIGNMENTS } from "./data/defaultHomework";
import { ALL_MATH_FORMULAS } from "./data/mathFormulas";
import {
  DEFAULT_PROFILES,
  DEFAULT_ADMIN_CONFIG,
  INITIAL_AUDIT_LOGS,
  getDefaultPermissions,
  deduplicateProfiles,
} from "./data/defaultProfiles";
import {
  getStudentTier,
  hasTierAccess,
  DEFAULT_STUDENT_TIERS,
  DEFAULT_PROMO_CODES,
  PromoCode,
  loadSavedStudentTiers,
  saveStudentTiers,
  loadSavedPromoCodes,
  savePromoCodes,
} from "./data/studentTiers";
import {
  safeStorage,
  loadSafeQuestionBank,
  saveSafeQuestionBank,
} from "./utils/storage";
import {
  fetchUsersFromFirestore,
  saveUserToFirestore,
  deleteUserFromFirestore,
  seedInitialUsersIfEmpty,
  subscribeToUsers,
} from "./services/userService";
import {
  testFirestoreConnection,
  auth,
  signInWithGoogle,
  signOutFirebaseUser,
  onAuthStateChanged,
  FirebaseUser,
} from "./lib/firebase";

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<
    "study-plan" | "homework" | "training" | "practice" | "question-bank" | "materials" | "analytics" | "formulas" | "admin"
  >("study-plan");

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(() => {
    return safeStorage.get<boolean>("sat_focus_mode", false);
  });

  // Dynamic Plans & Tiers Configuration State
  const [studentTiers, setStudentTiers] = useState<Record<StudentTier, StudentTierConfig>>(() => {
    return loadSavedStudentTiers();
  });

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    return loadSavedPromoCodes();
  });

  const handleUpdateStudentTiers = (newTiers: Record<StudentTier, StudentTierConfig>) => {
    setStudentTiers(newTiers);
    saveStudentTiers(newTiers);
  };

  const handleUpdatePromoCodes = (newCodes: PromoCode[]) => {
    setPromoCodes(newCodes);
    savePromoCodes(newCodes);
  };

  // User Profiles State
  const [profilesList, setProfilesList] = useState<UserProfile[]>(() => {
    const saved = safeStorage.get<UserProfile[]>("sat_user_profiles_list", DEFAULT_PROFILES);
    const combined = Array.isArray(saved) && saved.length > 0 ? [...saved, ...DEFAULT_PROFILES] : DEFAULT_PROFILES;
    const deduplicated = deduplicateProfiles(combined);
    safeStorage.set("sat_user_profiles_list", deduplicated);
    return deduplicated;
  });

  // Always enforce a guaranteed deduplicated list for render passes & child components
  const sanitizedProfilesList = useMemo(() => deduplicateProfiles(profilesList), [profilesList]);

  // Synchronize state and storage if any duplicates are ever discovered in profilesList
  useEffect(() => {
    const deduped = deduplicateProfiles(profilesList);
    if (deduped.length !== profilesList.length) {
      setProfilesList(deduped);
      safeStorage.set("sat_user_profiles_list", deduped);
    }
  }, [profilesList]);

  // Firebase Auth and Cloud Firestore Database Connection State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(false);

  // Initialize and synchronize with Firebase Auth & Cloud Firestore
  useEffect(() => {
    let unsubscribeFirestore: (() => void) | undefined;

    // Test connectivity
    testFirestoreConnection().then((connected) => {
      setIsFirestoreConnected(connected);
    });

    // Reactive Firebase Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);

      if (currentUser) {
        setIsFirestoreConnected(true);
        const userEmail = (currentUser.email || "").toLowerCase();
        let matched = profilesList.find((p) => p.email.toLowerCase() === userEmail);

        if (!matched) {
          const isAdminUser = userEmail === "theinsiderspace@gmail.com";
          const newProfile: UserProfile = {
            id: currentUser.uid,
            name: currentUser.displayName || (isAdminUser ? "The Insider Space" : "SAT Student"),
            email: currentUser.email || "",
            role: isAdminUser ? "admin" : "student",
            tier: isAdminUser ? "elite" : "pro",
            permissions: getDefaultPermissions(isAdminUser ? "admin" : "student"),
            avatarColor: "bg-cyan-600",
            highSchoolGrade: isAdminUser ? "Lead Instructor & System Administrator" : "11th Grade (Junior)",
            targetScore: isAdminUser ? 1600 : 1520,
            mathTarget: isAdminUser ? 800 : 780,
            rwTarget: isAdminUser ? 800 : 740,
            baselineScore: isAdminUser ? 1580 : 1350,
            examDate: "2026-10-10",
            examDateLabel: "October 2026 Digital SAT",
            dailyGoalMinutes: 60,
            studyDaysPerWeek: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            dreamColleges: ["MIT", "Stanford", "Harvard"],
            weakestDomains: [],
            accommodations: {
              extendedTime: "Standard (1.0x)",
              enableSoundEffects: true,
              autoShowScratchpad: true,
              highContrastMode: false,
            },
            createdAt: new Date().toISOString(),
          };

          setProfilesList((prev) => {
            const next = deduplicateProfiles([...prev, newProfile]);
            safeStorage.set("sat_user_profiles_list", next);
            return next;
          });
          matched = newProfile;
          setCurrentProfileId(newProfile.id);
          safeStorage.set("sat_current_profile_id", newProfile.id);
          saveUserToFirestore(newProfile);
        } else {
          setCurrentProfileId(matched.id);
          safeStorage.set("sat_current_profile_id", matched.id);
        }

        setIsAuthenticated(true);
        safeStorage.set("sat_is_authenticated", true);

        // If admin, seed initial default profiles if cloud collection is empty
        if (userEmail === "theinsiderspace@gmail.com") {
          await seedInitialUsersIfEmpty(sanitizedProfilesList);
        }

        // Fetch remote users now that we are authenticated
        const remoteUsers = await fetchUsersFromFirestore();
        if (remoteUsers.length > 0) {
          setProfilesList((prev) => {
            const merged = deduplicateProfiles([...remoteUsers, ...prev]);
            safeStorage.set("sat_user_profiles_list", merged);
            return merged;
          });
        }

        // Real-time updates subscription
        if (unsubscribeFirestore) unsubscribeFirestore();
        unsubscribeFirestore = subscribeToUsers((updatedUsers) => {
          if (updatedUsers.length > 0) {
            setProfilesList((prev) => {
              const merged = deduplicateProfiles([...updatedUsers, ...prev]);
              safeStorage.set("sat_user_profiles_list", merged);
              return merged;
            });
          }
        });
      } else {
        // Disconnected / unauthenticated in Firebase Auth
        if (unsubscribeFirestore) {
          unsubscribeFirestore();
          unsubscribeFirestore = undefined;
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  const [currentProfileId, setCurrentProfileId] = useState<string>(() => {
    return safeStorage.get<string>("sat_current_profile_id", "user-jordan-davis");
  });

  const currentProfile =
    sanitizedProfilesList.find((p) => p.id === currentProfileId) || sanitizedProfilesList[0] || DEFAULT_PROFILES[0];

  const isStudent = currentProfile.role === "student";

  // Safeguard: Automatically redirect students away from restricted tabs
  useEffect(() => {
    if (isStudent && (activeTab === "materials" || activeTab === "admin")) {
      setActiveTab("study-plan");
    }
  }, [isStudent, activeTab]);

  // Homework Assignments State
  const [homeworkList, setHomeworkList] = useState<HomeworkAssignment[]>(() => {
    return safeStorage.get<HomeworkAssignment[]>("sat_homework_assignments", DEFAULT_HOMEWORK_ASSIGNMENTS);
  });

  useEffect(() => {
    safeStorage.set("sat_homework_assignments", homeworkList);
  }, [homeworkList]);

  // Pending Homework Counter for Badges
  const pendingHomeworkCount = homeworkList.filter((hw) => {
    const sub = hw.submissions[currentProfile.id];
    return !sub || sub.status === "in_progress" || sub.status === "not_started";
  }).length;

  // Admin Config State
  const [adminConfig, setAdminConfig] = useState<AdminSystemConfig>(() => {
    return safeStorage.get<AdminSystemConfig>("sat_admin_config", DEFAULT_ADMIN_CONFIG);
  });

  // Admin Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(() => {
    return safeStorage.get<AdminAuditLog[]>("sat_admin_audit_logs", INITIAL_AUDIT_LOGS);
  });

  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isStudentTiersModalOpen, setIsStudentTiersModalOpen] = useState<boolean>(false);

  // Authentication & Initial Load State
  // Defaults to false so the application loads the login and sign up page!
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return safeStorage.get<boolean>("sat_is_authenticated", false);
  });

  // App State with localStorage persistence
  const [targetScore, setTargetScore] = useState<number>(() => {
    return currentProfile ? currentProfile.targetScore : 1540;
  });

  const [dailyGoalMinutes, setDailyGoalMinutes] = useState<number>(() => {
    return currentProfile ? currentProfile.dailyGoalMinutes : 60;
  });

  const [studyPlan, setStudyPlan] = useState<StudyPlan>(() => {
    return safeStorage.get<StudyPlan>("sat_study_plan", DEFAULT_STUDY_PLAN);
  });

  const [questionBank, setQuestionBank] = useState<SATQuestion[]>(() => {
    return loadSafeQuestionBank();
  });

  const [materialReports, setMaterialReports] = useState<MaterialAnalysisReport[]>(() => {
    return safeStorage.get<MaterialAnalysisReport[]>("sat_material_reports", [INITIAL_MATERIAL_REPORT]);
  });

  const [formulaRules, setFormulaRules] = useState<MathFormulaItem[]>(() => {
    return safeStorage.get<MathFormulaItem[]>("sat_formula_rules", ALL_MATH_FORMULAS);
  });

  useEffect(() => {
    safeStorage.set("sat_formula_rules", formulaRules);
  }, [formulaRules]);

  const [attempts, setAttempts] = useState<QuizAttempt[]>(() => {
    const savedAttempts = safeStorage.get<QuizAttempt[] | null>("sat_quiz_attempts", null);
    if (savedAttempts && savedAttempts.length > 0) return savedAttempts;
    // Initial sample attempts for instant rich analytics
    return [
      { questionId: "math-alg-1", selectedAnswerIndex: 2, isCorrect: true, timeSpentSeconds: 45, timestamp: Date.now() - 86400000 },
      { questionId: "math-alg-2", selectedAnswerIndex: 1, isCorrect: true, timeSpentSeconds: 52, timestamp: Date.now() - 80000000 },
      { questionId: "math-alg-3", selectedAnswerIndex: 2, isCorrect: true, timeSpentSeconds: 61, timestamp: Date.now() - 75000000 },
      { questionId: "math-alg-4", selectedAnswerIndex: 2, isCorrect: true, timeSpentSeconds: 40, timestamp: Date.now() - 70000000 },
      { questionId: "math-adv-1", selectedAnswerIndex: 1, isCorrect: true, timeSpentSeconds: 65, timestamp: Date.now() - 60000000 },
      { questionId: "math-ps-1", selectedAnswerIndex: 0, isCorrect: true, timeSpentSeconds: 50, timestamp: Date.now() - 50000000 },
      { questionId: "rw-sec-1", selectedAnswerIndex: 0, isCorrect: false, timeSpentSeconds: 42, timestamp: Date.now() - 40000000 },
      { questionId: "rw-sec-2", selectedAnswerIndex: 1, isCorrect: true, timeSpentSeconds: 38, timestamp: Date.now() - 30000000 },
      { questionId: "rw-craft-1", selectedAnswerIndex: 1, isCorrect: true, timeSpentSeconds: 30, timestamp: Date.now() - 20000000 },
      { questionId: "rw-craft-3", selectedAnswerIndex: 0, isCorrect: true, timeSpentSeconds: 70, timestamp: Date.now() - 10000000 },
    ];
  });

  // Modals & Tools
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState<boolean>(false);
  const [aiTutorQuestion, setAiTutorQuestion] = useState<{
    question: SATQuestion;
    selectedOption: number | null;
  } | null>(null);

  // Active Timer
  const [studySeconds, setStudySeconds] = useState<number>(3420); // starts with 57 mins for lively feel
  const [practiceFilterDomain, setPracticeFilterDomain] = useState<SATDomain | null>(null);
  const [isGeneratingAiDrill, setIsGeneratingAiDrill] = useState<boolean>(false);

  // Save to safe storage
  useEffect(() => {
    safeStorage.set("sat_user_profiles_list", profilesList);
  }, [profilesList]);

  useEffect(() => {
    safeStorage.set("sat_current_profile_id", currentProfileId);
  }, [currentProfileId]);

  useEffect(() => {
    safeStorage.set("sat_admin_config", adminConfig);
  }, [adminConfig]);

  useEffect(() => {
    safeStorage.set("sat_admin_audit_logs", auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    safeStorage.set("sat_target_score", targetScore);
  }, [targetScore]);

  useEffect(() => {
    safeStorage.set("sat_daily_goal_minutes", dailyGoalMinutes);
  }, [dailyGoalMinutes]);

  useEffect(() => {
    safeStorage.set("sat_study_plan", studyPlan);
  }, [studyPlan]);

  useEffect(() => {
    saveSafeQuestionBank(questionBank);
  }, [questionBank]);

  useEffect(() => {
    safeStorage.set("sat_material_reports", materialReports);
  }, [materialReports]);

  useEffect(() => {
    safeStorage.set("sat_quiz_attempts", attempts);
  }, [attempts]);

  useEffect(() => {
    safeStorage.set("sat_focus_mode", isFocusMode);
  }, [isFocusMode]);

  // Guest users only have access to Practice Drills - enforce tab lock
  useEffect(() => {
    if (currentProfile.role === "guest" && activeTab !== "practice") {
      setActiveTab("practice");
    }
  }, [currentProfile.role, activeTab]);

  // Sync profile edits to current score & goal
  const handleSaveProfile = (updated: UserProfile) => {
    setProfilesList((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setTargetScore(updated.targetScore);
    setDailyGoalMinutes(updated.dailyGoalMinutes);
    handleAddAuditLog("Profile Saved", "Users", `Updated profile attributes for ${updated.name}`);
    saveUserToFirestore(updated);
  };

  const handleSelectProfile = (profileId: string) => {
    setCurrentProfileId(profileId);
    const selected = profilesList.find((p) => p.id === profileId);
    if (selected) {
      setTargetScore(selected.targetScore);
      setDailyGoalMinutes(selected.dailyGoalMinutes);
      handleAddAuditLog("User Switched", "Users", `Switched active student to ${selected.name}`);
    }
  };

  const handleCreateProfile = (newP: UserProfile) => {
    setProfilesList((prev) => {
      const updated = deduplicateProfiles([newP, ...prev]);
      safeStorage.set("sat_user_profiles_list", updated);
      return updated;
    });
    setCurrentProfileId(newP.id);
    setTargetScore(newP.targetScore);
    setDailyGoalMinutes(newP.dailyGoalMinutes);
    handleAddAuditLog("User Registered", "Users", `Created profile for ${newP.name}`);
    saveUserToFirestore(newP);
  };

  const handleDeleteProfile = (profileId: string) => {
    const remaining = deduplicateProfiles(profilesList.filter((p) => p.id !== profileId));
    setProfilesList(remaining);
    safeStorage.set("sat_user_profiles_list", remaining);
    if (currentProfileId === profileId && remaining.length > 0) {
      setCurrentProfileId(remaining[0].id);
      setTargetScore(remaining[0].targetScore);
      setDailyGoalMinutes(remaining[0].dailyGoalMinutes);
    }
    handleAddAuditLog("User Deleted", "Users", `Removed profile ID: ${profileId}`);
    deleteUserFromFirestore(profileId);
  };

  const handleLogin = (profile: UserProfile) => {
    setCurrentProfileId(profile.id);
    safeStorage.set("sat_current_profile_id", profile.id);
    setTargetScore(profile.targetScore);
    setDailyGoalMinutes(profile.dailyGoalMinutes);
    setIsAuthenticated(true);
    safeStorage.set("sat_is_authenticated", true);
    setIsAuthModalOpen(false);
    handleAddAuditLog("User Signed In", "Users", `User ${profile.name} signed into platform`);
  };

  const handleSignUp = (newProfile: UserProfile) => {
    setProfilesList((prev) => {
      const updated = deduplicateProfiles([newProfile, ...prev]);
      safeStorage.set("sat_user_profiles_list", updated);
      return updated;
    });
    setCurrentProfileId(newProfile.id);
    safeStorage.set("sat_current_profile_id", newProfile.id);
    setTargetScore(newProfile.targetScore);
    setDailyGoalMinutes(newProfile.dailyGoalMinutes);
    setIsAuthenticated(true);
    safeStorage.set("sat_is_authenticated", true);
    setIsAuthModalOpen(false);
    handleAddAuditLog("User Registered", "Users", `Created profile for ${newProfile.name}`);
    saveUserToFirestore(newProfile);
  };

  const handleGuestLogin = () => {
    let guestProfile = profilesList.find((p) => p.role === "guest" || p.id === "user-guest-session");
    if (!guestProfile) {
      guestProfile = {
        id: "user-guest-session",
        name: "Guest Explorer",
        email: "guest@satprep.edu",
        role: "guest",
        permissions: getDefaultPermissions("guest"),
        avatarColor: "bg-slate-700",
        highSchoolGrade: "Trial Guest Mode",
        targetScore: 1400,
        mathTarget: 700,
        rwTarget: 700,
        baselineScore: 1200,
        examDate: "2026-10-10",
        examDateLabel: "October 2026 Digital SAT",
        dailyGoalMinutes: 45,
        studyDaysPerWeek: ["Mon", "Wed", "Sat"],
        dreamColleges: ["University"],
        weakestDomains: [],
        bio: "Guest session. Practice drills enabled.",
        accommodations: {
          extendedTime: "Standard (1.0x)",
          enableSoundEffects: true,
          autoShowScratchpad: false,
          highContrastMode: false,
        },
        createdAt: new Date().toISOString().split("T")[0],
      };
      setProfilesList((prev) => [...prev, guestProfile!]);
    }
    setCurrentProfileId(guestProfile.id);
    safeStorage.set("sat_current_profile_id", guestProfile.id);
    setActiveTab("practice");
    setIsAuthenticated(true);
    safeStorage.set("sat_is_authenticated", true);
    setIsAuthModalOpen(false);
    handleAddAuditLog("Guest Session Started", "Users", `Started guest practice session`);
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        setIsAuthenticated(true);
        safeStorage.set("sat_is_authenticated", true);
        setIsAuthModalOpen(false);
        handleAddAuditLog(
          "Google Sign-In Success",
          "Users",
          `Authenticated via Google Cloud Auth (${user.email})`
        );
      }
    } catch (err) {
      console.warn("Google sign-in closed or error:", err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutFirebaseUser();
    } catch (e) {
      console.warn("Firebase sign out error:", e);
    }
    setIsAuthenticated(false);
    safeStorage.set("sat_is_authenticated", false);
    setIsUserProfileModalOpen(false);
    setIsAuthModalOpen(false);
    handleAddAuditLog("User Signed Out", "Users", `User disconnected from session`);
  };

  const handleSelectTier = (tier: StudentTier, billingInterval: "monthly" | "annual" | "lifetime", promoCodeApplied?: string) => {
    const tierConfig = getStudentTier(tier);
    const now = new Date();
    const nextPeriod = new Date();
    if (billingInterval === "monthly") nextPeriod.setMonth(nextPeriod.getMonth() + 1);
    else if (billingInterval === "annual") nextPeriod.setFullYear(nextPeriod.getFullYear() + 1);
    else nextPeriod.setFullYear(nextPeriod.getFullYear() + 10);

    const price = billingInterval === "monthly"
      ? tierConfig.paymentStructure.monthlyPrice
      : billingInterval === "annual"
      ? tierConfig.paymentStructure.annualPrice
      : tierConfig.paymentStructure.lifetimePrice || 0;

    const updatedSubscription: UserSubscription = {
      tier: tier,
      status: "active",
      billingInterval: billingInterval,
      currentPeriodEnd: nextPeriod.toISOString().split("T")[0],
      paymentMethodBrand: tierConfig.paymentStructure.type === "free" ? "Free Tier" : "Visa",
      paymentMethodLast4: tierConfig.paymentStructure.type === "free" ? "0000" : "4242",
      amountPaid: price,
      promoCodeApplied: promoCodeApplied,
    };

    const updatedProfile: UserProfile = {
      ...currentProfile,
      tier: tier,
      subscription: updatedSubscription,
      permissions: {
        ...(currentProfile.permissions || getDefaultPermissions(currentProfile.role)),
        ...tierConfig.permissions,
      },
    };

    handleSaveProfile(updatedProfile);
    handleAddAuditLog(
      "Student Tier Changed",
      "Users",
      `Upgraded ${currentProfile.name} to ${tierConfig.name} (${billingInterval} billing)`
    );
  };

  const handleAddAuditLog = (
    action: string,
    category: AdminAuditLog["category"],
    details: string
  ) => {
    const newLog: AdminAuditLog = {
      id: `log-${Date.now()}`,
      action,
      category,
      details,
      timestamp: Date.now(),
      adminName: currentProfile.name,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  const handleMasterResetAll = () => {
    const freshBank = generateFull10000QuestionBank();
    setQuestionBank(freshBank);
    setFormulaRules(ALL_MATH_FORMULAS);
    setStudyPlan(DEFAULT_STUDY_PLAN);
    setHomeworkList(DEFAULT_HOMEWORK_ASSIGNMENTS);
    setProfilesList(DEFAULT_PROFILES);
    setCurrentProfileId(DEFAULT_PROFILES[0].id);
    setTargetScore(DEFAULT_PROFILES[0].targetScore);
    setDailyGoalMinutes(DEFAULT_PROFILES[0].dailyGoalMinutes);
    setMaterialReports([INITIAL_MATERIAL_REPORT]);
    setAttempts([]);
    setAdminConfig(DEFAULT_ADMIN_CONFIG);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    safeStorage.clear();
  };

  // Keyboard shortcut listener for Esc to exit focus mode if no modal is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFocusMode && !isCalculatorOpen && !isScratchpadOpen && !aiTutorQuestion && !isUserProfileModalOpen) {
        setIsFocusMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocusMode, isCalculatorOpen, isScratchpadOpen, aiTutorQuestion, isUserProfileModalOpen]);

  // Session timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setStudySeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Record a quiz attempt
  const handleRecordAttempt = (attempt: QuizAttempt) => {
    setAttempts((prev) => [attempt, ...prev]);
  };

  // Add new extracted questions from uploaded material
  const handleAddExtractedQuestions = (newQuestions: SATQuestion[]) => {
    setQuestionBank((prev) => {
      const existingIds = new Set(prev.map((q) => q.id));
      const filtered = newQuestions.filter((q) => !existingIds.has(q.id));
      return [...filtered, ...prev];
    });
  };

  // Save a new material analysis report
  const handleSaveMaterialReport = (report: MaterialAnalysisReport) => {
    setMaterialReports((prev) => [report, ...prev]);
  };

  // Generate dynamic AI drill questions on the fly
  const handleGenerateAiDrill = async (domain: SATDomain, difficulty: DifficultyLevel) => {
    setIsGeneratingAiDrill(true);
    try {
      const res = await fetch("/api/gemini/generate-drill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section:
            domain.includes("Algebra") || domain.includes("Math") || domain.includes("Solving") || domain.includes("Geometry")
              ? "Math"
              : "Reading & Writing",
          topic: domain,
          difficulty,
          count: 5,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate AI drill");
      const data = await res.json();

      if (data.questions && data.questions.length > 0) {
        const formatted: SATQuestion[] = data.questions.map((q: any, i: number) => ({
          ...q,
          id: `ai-drill-${Date.now()}-${i}`,
          source: `AI Generated Drill (${domain})`,
        }));
        handleAddExtractedQuestions(formatted);
      }
    } catch (err) {
      console.error("AI Drill Generation Error:", err);
    } finally {
      setIsGeneratingAiDrill(false);
    }
  };

  // Compute performance metrics
  const computeStats = (): UserPerformanceStats => {
    const totalAnswered = attempts.length;
    const totalCorrect = attempts.filter((a) => a.isCorrect).length;
    const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    // Category stats mapping
    const categoryStats: Record<string, { answered: number; correct: number; accuracy: number }> = {
      Algebra: { answered: 0, correct: 0, accuracy: 0 },
      "Advanced Math": { answered: 0, correct: 0, accuracy: 0 },
      "Problem Solving & Data Analysis": { answered: 0, correct: 0, accuracy: 0 },
      "Geometry & Trigonometry": { answered: 0, correct: 0, accuracy: 0 },
      "Information and Ideas": { answered: 0, correct: 0, accuracy: 0 },
      "Craft and Structure": { answered: 0, correct: 0, accuracy: 0 },
      "Standard English Conventions": { answered: 0, correct: 0, accuracy: 0 },
      "Expression of Ideas": { answered: 0, correct: 0, accuracy: 0 },
    };

    let mathAnswered = 0;
    let mathCorrect = 0;
    let rwAnswered = 0;
    let rwCorrect = 0;

    attempts.forEach((att) => {
      const q = questionBank.find((item) => item.id === att.questionId);
      if (q) {
        if (q.section === "Math") {
          mathAnswered++;
          if (att.isCorrect) mathCorrect++;
        } else {
          rwAnswered++;
          if (att.isCorrect) rwCorrect++;
        }

        if (categoryStats[q.domain]) {
          categoryStats[q.domain].answered++;
          if (att.isCorrect) categoryStats[q.domain].correct++;
        }
      }
    });

    Object.keys(categoryStats).forEach((k) => {
      const cat = categoryStats[k];
      cat.accuracy = cat.answered > 0 ? Math.round((cat.correct / cat.answered) * 100) : 80;
    });

    const mathAccuracy = mathAnswered > 0 ? Math.round((mathCorrect / mathAnswered) * 100) : 85;
    const rwAccuracy = rwAnswered > 0 ? Math.round((rwCorrect / rwAnswered) * 100) : 78;

    // Estimate SAT Score based on accuracy benchmarks
    const curveBonus = adminConfig.scoringCurveMode === "Lenient" ? 30 : adminConfig.scoringCurveMode === "Strict" ? -30 : 0;
    const mathScore = Math.min(800, Math.max(400, Math.round(400 + (mathAccuracy / 100) * 400 + curveBonus / 2)));
    const rwScore = Math.min(800, Math.max(400, Math.round(400 + (rwAccuracy / 100) * 400 + curveBonus / 2)));
    const estimatedScore = Math.min(1600, mathScore + rwScore);

    return {
      totalQuestionsAnswered: totalAnswered,
      totalCorrect,
      overallAccuracy,
      mathAccuracy,
      rwAccuracy,
      streakDays: 4,
      totalStudyMinutes: Math.round(studySeconds / 60),
      estimatedScore,
      categoryStats,
    };
  };

  const performanceStats = computeStats();

  // If unauthenticated or initial load, display dedicated Login & Sign Up Page
  if (!isAuthenticated) {
    return (
      <AuthView
        profilesList={sanitizedProfilesList}
        onLogin={handleLogin}
        onSignUp={handleSignUp}
        onGuestLogin={handleGuestLogin}
        onGoogleSignIn={handleGoogleSignIn}
      />
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#030712] text-slate-100 font-sans overflow-hidden scifi-grid-bg relative selection:bg-cyan-500 selection:text-black">
      {/* Ambient Sci-Fi Radial Nebula Lighting */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[32rem] h-[32rem] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Left Sidebar (Cyber Cockpit Nav) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setPracticeFilterDomain(null);
        }}
        targetScore={targetScore}
        uploadedReportsCount={materialReports.length}
        pendingHomeworkCount={pendingHomeworkCount}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isFocusMode={isFocusMode}
        currentProfile={currentProfile}
        onOpenProfileSetup={() => setIsUserProfileModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenStudentTiersModal={() => setIsStudentTiersModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        {/* Top Header Bar */}
        <Header
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setPracticeFilterDomain(null);
          }}
          targetScore={targetScore}
          estimatedScore={performanceStats.estimatedScore}
          streakDays={performanceStats.streakDays}
          studySeconds={studySeconds}
          dailyGoalMinutes={dailyGoalMinutes}
          onUpdateDailyGoalMinutes={setDailyGoalMinutes}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
          isFocusMode={isFocusMode}
          onToggleFocusMode={() => setIsFocusMode((prev) => !prev)}
          currentProfile={currentProfile}
          onOpenProfileSetup={() => setIsUserProfileModalOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenStudentTiersModal={() => setIsStudentTiersModalOpen(true)}
          onSignOut={handleSignOut}
        />

        {/* View Component Body */}
        <main className="flex-1 pb-16">
          {/* Guest Role is strictly restricted to Practice Drills */}
          {(currentProfile.role === "guest" || activeTab === "practice") && (
            <PracticeView
              questions={questionBank}
              onRecordAttempt={handleRecordAttempt}
              onOpenCalculator={() => setIsCalculatorOpen(true)}
              onOpenScratchpad={() => setIsScratchpadOpen(true)}
              onOpenAiTutor={(question, selectedOption) => {
                setAiTutorQuestion({ question, selectedOption });
              }}
              initialDomainFilter={practiceFilterDomain}
              onGenerateNewAiQuestions={handleGenerateAiDrill}
              isGeneratingAiDrill={isGeneratingAiDrill}
            />
          )}

          {currentProfile.role !== "guest" && activeTab === "study-plan" && (
            <StudyPlanView
              studyPlan={studyPlan}
              onUpdatePlan={setStudyPlan}
              targetScore={targetScore}
              setTargetScore={setTargetScore}
              onNavigateToPractice={(domain) => {
                setPracticeFilterDomain(domain || null);
                setActiveTab("practice");
              }}
              uploadedMaterialsSummary={
                materialReports.length > 0 ? materialReports[0].documentSummary : undefined
              }
            />
          )}

          {currentProfile.role !== "guest" && activeTab === "homework" && (
            <HomeworkHubView
              homeworkList={homeworkList}
              currentProfile={currentProfile}
              profilesList={sanitizedProfilesList}
              onUpdateHomeworkList={setHomeworkList}
              onOpenCalculator={() => setIsCalculatorOpen(true)}
              onOpenScratchpad={() => setIsScratchpadOpen(true)}
              onOpenFormulas={() => setActiveTab("formulas")}
              onLogStudyMinutes={(minutes) => setStudySeconds((prev) => prev + minutes * 60)}
            />
          )}

          {currentProfile.role !== "guest" && activeTab === "training" && (
            <TrainingAcademyView
              onStartPractice={(sectionFilter, domainFilter) => {
                if (domainFilter) {
                  setPracticeFilterDomain(domainFilter as SATDomain);
                }
                setActiveTab("practice");
              }}
              onOpenFormulaGuide={() => setActiveTab("formulas")}
            />
          )}

          {currentProfile.role !== "guest" && activeTab === "question-bank" && (
            <QuestionBankHubView
              currentBank={questionBank}
              onSetBank={(newBank) => setQuestionBank(newBank)}
              onLaunchDrill={(filtered) => {
                if (filtered.length > 0) {
                  setPracticeFilterDomain(filtered[0].domain);
                }
                setActiveTab("practice");
              }}
              onOpenAiTutor={(question) => {
                setAiTutorQuestion({ question, selectedOption: null });
              }}
            />
          )}

          {currentProfile.role !== "guest" && !isStudent && activeTab === "materials" && (
            <MaterialAnalyzerView
              reports={materialReports}
              onSaveReport={handleSaveMaterialReport}
              onAddExtractedQuestions={handleAddExtractedQuestions}
              onNavigateToPractice={() => {
                setActiveTab("practice");
              }}
            />
          )}

          {currentProfile.role !== "guest" && activeTab === "analytics" && (
            <ProgressReportView
              stats={performanceStats}
              targetScore={targetScore}
              isStudent={isStudent}
              onNavigateToPractice={(domain) => {
                setPracticeFilterDomain(domain || null);
                setActiveTab("practice");
              }}
              onNavigateToMaterials={() => {
                if (!isStudent) {
                  setActiveTab("materials");
                }
              }}
            />
          )}

          {currentProfile.role !== "guest" && activeTab === "formulas" && (
            <FormulaGuideView
              formulaRules={formulaRules}
              onOpenAdminRules={() => setActiveTab("admin")}
              isAdmin={currentProfile.role === "admin"}
            />
          )}

          {currentProfile.role !== "guest" && activeTab === "admin" && (
            <AdminControlView
              questionBank={questionBank}
              onUpdateQuestionBank={setQuestionBank}
              formulaRules={formulaRules}
              onUpdateFormulaRules={setFormulaRules}
              studyPlan={studyPlan}
              onUpdateStudyPlan={setStudyPlan}
              profilesList={sanitizedProfilesList}
              currentProfile={currentProfile}
              onUpdateProfile={handleSaveProfile}
              onSelectProfile={handleSelectProfile}
              onCreateProfile={handleCreateProfile}
              onDeleteProfile={handleDeleteProfile}
              attempts={attempts}
              onUpdateAttempts={setAttempts}
              adminConfig={adminConfig}
              onUpdateAdminConfig={setAdminConfig}
              auditLogs={auditLogs}
              onAddAuditLog={handleAddAuditLog}
              onMasterResetAll={handleMasterResetAll}
              studentTiers={studentTiers}
              onUpdateStudentTiers={handleUpdateStudentTiers}
              promoCodes={promoCodes}
              onUpdatePromoCodes={handleUpdatePromoCodes}
              onOpenStudentTiersPreview={() => setIsStudentTiersModalOpen(true)}
              isFirestoreConnected={isFirestoreConnected}
              onSyncFirestoreUsers={async () => {
                for (const p of sanitizedProfilesList) {
                  await saveUserToFirestore(p);
                }
                const remote = await fetchUsersFromFirestore();
                if (remote.length > 0) {
                  setProfilesList((prev) => {
                    const merged = deduplicateProfiles([...remote, ...prev]);
                    safeStorage.set("sat_user_profiles_list", merged);
                    return merged;
                  });
                }
              }}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      <ScratchpadModal
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
      />

      {aiTutorQuestion && (
        <AiTutorModal
          isOpen={!!aiTutorQuestion}
          onClose={() => setAiTutorQuestion(null)}
          question={aiTutorQuestion.question}
          userSelectedOption={aiTutorQuestion.selectedOption}
        />
      )}

      {/* User Profile Setup & Account Modal */}
      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
        currentProfile={currentProfile}
        profilesList={sanitizedProfilesList}
        onSaveProfile={handleSaveProfile}
        onSelectProfile={handleSelectProfile}
        onCreateNewProfile={handleCreateProfile}
        onDeleteProfile={handleDeleteProfile}
        onOpenSignUpModal={() => {
          setIsUserProfileModalOpen(false);
          setIsAuthModalOpen(true);
        }}
        onOpenStudentTiersModal={() => {
          setIsUserProfileModalOpen(false);
          setIsStudentTiersModalOpen(true);
        }}
        onResetAttempts={() => setAttempts([])}
        onSignOut={handleSignOut}
        customTiers={studentTiers}
      />

      {/* Authentication & Multi-Role Sign Up Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        profilesList={sanitizedProfilesList}
        currentProfileId={currentProfile.id}
        onSelectProfile={(profileId) => {
          const matched = sanitizedProfilesList.find((p) => p.id === profileId);
          if (matched) handleLogin(matched);
          else handleSelectProfile(profileId);
          setIsAuthModalOpen(false);
        }}
        onCreateNewProfile={(newProfile) => {
          handleSignUp(newProfile);
          setIsAuthModalOpen(false);
        }}
        onSignUp={(newProfile) => {
          handleSignUp(newProfile);
          setIsAuthModalOpen(false);
        }}
        onLogin={(profile) => {
          handleLogin(profile);
          setIsAuthModalOpen(false);
        }}
        onGoogleSignIn={handleGoogleSignIn}
      />

      {/* Student Tiers & Pricing Plans Modal */}
      <StudentTiersModal
        isOpen={isStudentTiersModalOpen}
        onClose={() => setIsStudentTiersModalOpen(false)}
        currentProfile={currentProfile}
        onUpdateProfileTier={(tier, subscription) => {
          handleSelectTier(
            tier,
            subscription.billingInterval,
            subscription.promoCodeApplied
          );
          setIsStudentTiersModalOpen(false);
        }}
        customTiers={studentTiers}
        customPromoCodes={promoCodes}
      />
    </div>
  );
}

