export type SATSection = "Math" | "Reading & Writing";

export type SATDomain =
  | "Algebra"
  | "Advanced Math"
  | "Problem Solving & Data Analysis"
  | "Geometry & Trigonometry"
  | "Information and Ideas"
  | "Craft and Structure"
  | "Expression of Ideas"
  | "Standard English Conventions";

export type DifficultyLevel = "Easy" | "Medium" | "Hard";

export interface SATQuestion {
  id: string;
  section: SATSection;
  domain: SATDomain;
  subtopic: string;
  question: string;
  passage?: string;
  tableData?: {
    headers: string[];
    rows: (string | number)[][];
  };
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  trapAnalysis?: string;
  difficulty: DifficultyLevel;
  source?: string;
}

export interface QuizAttempt {
  questionId: string;
  selectedAnswerIndex: number | null;
  isCorrect: boolean;
  timeSpentSeconds: number;
  timestamp: number;
}

export interface DailyStudyTask {
  id: string;
  day: string;
  topic: string;
  activityType: "Concept Review" | "Timed Drill" | "Error Log" | "Mock Section" | "Flashcard Review";
  description: string;
  durationMinutes: number;
  completed: boolean;
}

export interface StudyPlanWeek {
  weekNumber: number;
  title: string;
  focusDomain: "Math" | "Reading & Writing" | "Full Test Strategy";
  goal: string;
  estimatedHours: number;
  days: DailyStudyTask[];
  milestoneCheckpoint: string;
}

export interface StudyPlan {
  id: string;
  planTitle: string;
  strategySummary: string;
  targetScoreBreakdown: {
    mathTarget: number;
    rwTarget: number;
    mathCurrent: number;
    rwCurrent: number;
  };
  weeklySchedule: StudyPlanWeek[];
  highYieldFormulasAndRules: {
    rule: string;
    category: string;
    example: string;
  }[];
  testDayTips: string[];
  createdAt: string;
}

export interface TopicMastery {
  domain: string;
  subtopic: string;
  masteryLevel: "Mastered" | "Proficient" | "Needs Review" | "Critical Focus";
  scorePercent: number;
  keyFindings: string;
}

export interface MaterialAnalysisReport {
  id: string;
  documentTitle: string;
  documentSummary: string;
  uploadedAt: string;
  fileSizeText?: string;
  overallReadinessScore: number; // 0 - 100
  estimatedScoreRange: {
    min: number;
    max: number;
    mathMin: number;
    mathMax: number;
    rwMin: number;
    rwMax: number;
  };
  masteryBreakdown: TopicMastery[];
  keyStrengths: string[];
  criticalWeaknessesAndTrapPatterns: string[];
  recommendedDailyActionPlan: string[];
  studyHoursRecommendation: string;
  extractedQuestions: SATQuestion[];
}

export type UserRole = "student" | "tutor" | "admin" | "guest";

export type StudentTier = "starter" | "plus" | "pro" | "elite";

export interface StudentTierLimits {
  dailyPracticeQuestions: number | "unlimited";
  aiTutorDailyQueries: number | "unlimited";
  fullMockExamsAccess: boolean;
  materialPdfAnalyzerAllowed: boolean;
  aiQuestionGeneratorAllowed: boolean;
  exportScoreDossierAllowed: boolean;
  liveTutorReviewAllowed: boolean;
  prioritySupport: boolean;
  scoreGuarantee: string | null;
}

export interface StudentTierPaymentStructure {
  type: "free" | "recurring_subscription" | "comprehensive_program";
  monthlyPrice: number; // e.g. 0, 19, 49, 129
  annualPrice: number; // e.g. 0, 149, 349, 899
  lifetimePrice?: number; // e.g. 299, 799
  trialDays: number;
  moneyBackGuaranteeDays: number;
  billingIntervals: ("monthly" | "annual" | "lifetime")[];
  financialAidAvailable: boolean;
}

export interface StudentTierConfig {
  id: StudentTier;
  name: string;
  badge: string;
  badgeColor: string;
  highlight?: string;
  tagline: string;
  targetAudience: string;
  paymentStructure: StudentTierPaymentStructure;
  features: string[];
  omittedFeatures?: string[];
  limits: StudentTierLimits;
  permissions: UserPermissions;
}

export interface BillingAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  currency?: string;
  status: "paid" | "pending" | "failed" | "refunded" | "void";
  description: string;
  paymentMethod?: string;
  billingName?: string;
}

export interface UserSubscription {
  tier: StudentTier;
  status: "active" | "trialing" | "past_due" | "canceled";
  billingInterval: "monthly" | "annual" | "lifetime";
  currentPeriodStart?: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd?: boolean;
  amountPaid?: number;
  lastPaymentAmount?: number;
  currency?: string;
  paymentMethodLast4?: string;
  paymentMethodBrand?: string;
  paymentMethodExpiry?: string;
  promoCodeApplied?: string;
  discountPercent?: number;
  billingName?: string;
  billingEmail?: string;
  billingPhone?: string;
  billingAddress?: BillingAddress;
  taxId?: string;
  financialAidStatus?: "none" | "applied" | "approved_50" | "approved_full" | "denied";
  scholarshipNote?: string;
  adminBillingNotes?: string;
  invoices?: BillingInvoice[];
}

export interface UserPermissions {
  canPracticeAndDrill: boolean;
  canViewStudyPlan: boolean;
  canAccessQuestionBank: boolean;
  canEditQuestions: boolean;
  canManageCurriculum: boolean;
  canAccessAdminPanel: boolean;
  canManageUsersAndRoles: boolean;
  canModifySystemGrading: boolean;
  canViewAllStudentReports: boolean;
  canExportData: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tier?: StudentTier;
  subscription?: UserSubscription;
  permissions?: UserPermissions;
  avatarColor: string;
  highSchoolGrade: string;
  targetScore: number;
  mathTarget: number;
  rwTarget: number;
  baselineScore: number;
  examDate: string; // e.g. "2026-10-10"
  examDateLabel: string; // e.g. "October 2026 Digital SAT"
  dailyGoalMinutes: number;
  studyDaysPerWeek?: string[]; // e.g. ["Mon", "Tue", "Wed", "Thu", "Sat"]
  dreamColleges: string[];
  weakestDomains: SATDomain[];
  bio?: string;
  password?: string;
  phoneNumber?: string;
  calculatorPreference?: "Desmos" | "Scientific" | "Standard";
  accommodations: {
    extendedTime: "Standard (1.0x)" | "1.5x Time" | "2.0x Double Time" | "Unlimited Time";
    enableSoundEffects: boolean;
    autoShowScratchpad: boolean;
    highContrastMode: boolean;
  };
  createdAt: string;
}

export interface AdminSystemConfig {
  scoringCurveMode: "Standard" | "Strict" | "Lenient";
  defaultSecondsPerQuestion: number;
  allowAiGeneration: boolean;
  maintenanceBanner?: string;
  enableDesmosCalculator: boolean;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  category: "Questions" | "Study Plan" | "Rules & Formulas" | "Users" | "Analytics" | "System";
  details: string;
  timestamp: number;
  adminName: string;
}

export interface UserPerformanceStats {
  totalQuestionsAnswered: number;
  totalCorrect: number;
  overallAccuracy: number;
  mathAccuracy: number;
  rwAccuracy: number;
  streakDays: number;
  totalStudyMinutes: number;
  estimatedScore: number;
  categoryStats: Record<
    string,
    {
      answered: number;
      correct: number;
      accuracy: number;
    }
  >;
}

export interface StudentHomeworkSubmission {
  studentId: string;
  studentName: string;
  status: "not_started" | "in_progress" | "submitted" | "graded";
  answers: Record<string, number | null>; // questionId -> chosenIndex
  timeSpentSeconds: number; // total time spent in seconds
  questionTimes?: Record<string, number>; // questionId -> seconds spent
  startedAt?: string;
  submittedAt?: string;
  score: number;
  totalQuestions: number;
  accuracyPercent: number;
  studentNotes?: string;
  tutorFeedback?: string;
  gradedScore?: number;
}

export interface HomeworkAssignment {
  id: string;
  title: string;
  description: string;
  section: SATSection | "Full Test";
  domain?: SATDomain;
  subtopic?: string;
  assignedDate: string;
  dueDate: string;
  dueTimeLabel?: string;
  assignedBy: string;
  assignedToStudentIds?: string[]; // student IDs or ["all"]
  assignedStudentNames?: string[]; // human-readable names for badges
  targetTier?: StudentTier | "all";
  customTutorNote?: string; // personalized note/instruction for targeted students
  estimatedMinutes: number;
  difficulty: DifficultyLevel;
  priority: "High" | "Medium" | "Low";
  tags: string[];
  questions: SATQuestion[];
  submissions: Record<string, StudentHomeworkSubmission>; // keyed by studentId
}

export interface HomeworkTimeLogEntry {
  id: string;
  homeworkId: string;
  homeworkTitle: string;
  studentId: string;
  studentName: string;
  date: string;
  secondsSpent: number;
  questionsAnswered: number;
  accuracyPercent: number;
}

export type { MathFormulaItem } from "./data/mathFormulas";

