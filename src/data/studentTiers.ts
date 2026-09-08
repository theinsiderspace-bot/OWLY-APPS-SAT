import { StudentTier, StudentTierConfig, UserProfile, UserPermissions } from "../types";

export const DEFAULT_STUDENT_TIERS: Record<StudentTier, StudentTierConfig> = {
  starter: {
    id: "starter",
    name: "Free Starter",
    badge: "Starter",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-300",
    tagline: "Foundational Digital SAT Practice & Timing",
    targetAudience: "Students starting their SAT diagnostic journey",
    paymentStructure: {
      type: "free",
      monthlyPrice: 0,
      annualPrice: 0,
      trialDays: 0,
      moneyBackGuaranteeDays: 0,
      billingIntervals: ["monthly"],
      financialAidAvailable: false,
    },
    features: [
      "20 Daily Practice Questions with Official Digital SAT pacing",
      "Official College Board Bluebook Clock & Hidden Mode",
      "Complete SAT Math Formula Reference Guide",
      "Instant Answer Keys & Basic Explanations",
      "Local Session Score & Accuracy Tracking",
    ],
    omittedFeatures: [
      "Access to full 10,000+ Question Bank Hub",
      "Personalized 30/60-Day Adaptive Study Roadmaps",
      "AI Material & PSAT Score Report Analyzer",
      "AI Socratic Tutor with Step-by-Step Hints",
      "Vocabulary & Grammar Training Academy",
      "Score Guarantee & Progress Dossier PDF Exports",
    ],
    limits: {
      dailyPracticeQuestions: 20,
      aiTutorDailyQueries: 3,
      fullMockExamsAccess: false,
      materialPdfAnalyzerAllowed: false,
      aiQuestionGeneratorAllowed: false,
      exportScoreDossierAllowed: false,
      liveTutorReviewAllowed: false,
      prioritySupport: false,
      scoreGuarantee: null,
    },
    permissions: {
      canPracticeAndDrill: true,
      canViewStudyPlan: false,
      canAccessQuestionBank: false,
      canEditQuestions: false,
      canManageCurriculum: false,
      canAccessAdminPanel: false,
      canManageUsersAndRoles: false,
      canModifySystemGrading: false,
      canViewAllStudentReports: false,
      canExportData: false,
    },
  },

  plus: {
    id: "plus",
    name: "Scholar Plus",
    badge: "Plus",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-300",
    tagline: "Comprehensive Test Bank & Adaptive Curriculum",
    targetAudience: "Serious students aiming for a 1400+ score milestone",
    paymentStructure: {
      type: "recurring_subscription",
      monthlyPrice: 19,
      annualPrice: 149, // ~$12.40/mo (35% savings)
      trialDays: 7,
      moneyBackGuaranteeDays: 14,
      billingIntervals: ["monthly", "annual"],
      financialAidAvailable: true,
    },
    features: [
      "Unlimited Practice Drills across all Math & R&W domains",
      "Full 10,000+ Curated Question Bank with difficulty filters",
      "Dynamic 3-Streak Adaptive Difficulty Engine",
      "Personalized 30-Day & 60-Day Goal-Oriented Study Roadmaps",
      "Vocabulary & Grammar Academy (300+ Digital SAT Root Words)",
      "Detailed Domain Mastery & Trap Weakness Analytics",
      "50 AI Socratic Tutor Explanations per day",
      "+100 Points Score Improvement Guarantee",
    ],
    omittedFeatures: [
      "AI Material & PSAT PDF Syllabus Extraction",
      "AI Custom Test & Drill Variant Generator",
      "1-on-1 Live Expert Tutor Video Sessions",
      "99th-Percentile Hardest Trap Question Suite",
    ],
    limits: {
      dailyPracticeQuestions: "unlimited",
      aiTutorDailyQueries: 50,
      fullMockExamsAccess: true,
      materialPdfAnalyzerAllowed: false,
      aiQuestionGeneratorAllowed: false,
      exportScoreDossierAllowed: true,
      liveTutorReviewAllowed: false,
      prioritySupport: false,
      scoreGuarantee: "+100 Point Guarantee",
    },
    permissions: {
      canPracticeAndDrill: true,
      canViewStudyPlan: true,
      canAccessQuestionBank: true,
      canEditQuestions: false,
      canManageCurriculum: false,
      canAccessAdminPanel: false,
      canManageUsersAndRoles: false,
      canModifySystemGrading: false,
      canViewAllStudentReports: false,
      canExportData: true,
    },
  },

  pro: {
    id: "pro",
    name: "Mastery Pro",
    badge: "Pro",
    badgeColor: "bg-purple-100 text-purple-900 border-purple-300 ring-1 ring-purple-200",
    highlight: "MOST POPULAR",
    tagline: "AI-Powered Diagnostics, Materials Analyzer & Unlimited AI Tutor",
    targetAudience: "High achievers targeting Top 20 universities & 1500+ scores",
    paymentStructure: {
      type: "recurring_subscription",
      monthlyPrice: 49,
      annualPrice: 349, // ~$29/mo (40% savings)
      lifetimePrice: 299,
      trialDays: 14,
      moneyBackGuaranteeDays: 30,
      billingIntervals: ["monthly", "annual", "lifetime"],
      financialAidAvailable: true,
    },
    features: [
      "Everything in Scholar Plus included",
      "AI Material & Score PDF Analyzer (Upload Khan, PSAT & Bluebook PDFs)",
      "Unlimited AI 1-on-1 Socratic Tutor & Step-by-Step Hints",
      "AI Custom Drill Generator (Synthesize new question variants on demand)",
      "Official College Counselor Dossier & Comprehensive PDF Exports",
      "Full Timed 1600-Scale Official Digital SAT Mock Exams",
      "Desmos Graphing Calculator Pro Mastery Drills",
      "+150 Points Score Improvement Guarantee",
    ],
    omittedFeatures: [
      "2x Monthly 1-on-1 Live Expert Tutor Video Sessions",
      "Dedicated Human Essay & Strategy Hotline",
    ],
    limits: {
      dailyPracticeQuestions: "unlimited",
      aiTutorDailyQueries: "unlimited",
      fullMockExamsAccess: true,
      materialPdfAnalyzerAllowed: true,
      aiQuestionGeneratorAllowed: true,
      exportScoreDossierAllowed: true,
      liveTutorReviewAllowed: false,
      prioritySupport: true,
      scoreGuarantee: "+150 Point Guarantee",
    },
    permissions: {
      canPracticeAndDrill: true,
      canViewStudyPlan: true,
      canAccessQuestionBank: true,
      canEditQuestions: false,
      canManageCurriculum: false,
      canAccessAdminPanel: false,
      canManageUsersAndRoles: false,
      canModifySystemGrading: false,
      canViewAllStudentReports: false,
      canExportData: true,
    },
  },

  elite: {
    id: "elite",
    name: "Ivy Elite 1550+",
    badge: "Ivy Elite",
    badgeColor: "bg-amber-100 text-amber-950 border-amber-300 ring-1 ring-amber-300",
    highlight: "TOP 1% ADMISSIONS",
    tagline: "Private Live Mentorship, 99th-Percentile Bank & Score Guarantee",
    targetAudience: "Students pursuing Ivy League, Stanford, MIT, and Top 10 Merit Scholarships",
    paymentStructure: {
      type: "comprehensive_program",
      monthlyPrice: 129,
      annualPrice: 899, // ~$74.90/mo
      lifetimePrice: 799,
      trialDays: 14,
      moneyBackGuaranteeDays: 45,
      billingIntervals: ["monthly", "annual", "lifetime"],
      financialAidAvailable: true,
    },
    features: [
      "Everything in Mastery Pro included",
      "2x Monthly 45-min 1-on-1 Live Video Sessions with 99th-Percentile SAT Coach",
      "Exclusive 99th-Percentile Hardest Trap Questions Bank (1550+ Tier)",
      "Priority 24-Hour Verified Human Tutor Review on any flagged question",
      "Ivy League & Top 20 Admissions Profile & Strategy Consultation",
      "Direct Coach Messaging & Weekly Homework Audits",
      "Guaranteed 1500+ Score or 100% Full Refund Guarantee",
    ],
    omittedFeatures: [],
    limits: {
      dailyPracticeQuestions: "unlimited",
      aiTutorDailyQueries: "unlimited",
      fullMockExamsAccess: true,
      materialPdfAnalyzerAllowed: true,
      aiQuestionGeneratorAllowed: true,
      exportScoreDossierAllowed: true,
      liveTutorReviewAllowed: true,
      prioritySupport: true,
      scoreGuarantee: "1500+ Score or 100% Refund",
    },
    permissions: {
      canPracticeAndDrill: true,
      canViewStudyPlan: true,
      canAccessQuestionBank: true,
      canEditQuestions: false,
      canManageCurriculum: false,
      canAccessAdminPanel: false,
      canManageUsersAndRoles: false,
      canModifySystemGrading: false,
      canViewAllStudentReports: false,
      canExportData: true,
    },
  },
};

export interface PromoCode {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  description: string;
  active?: boolean;
}

export const DEFAULT_PROMO_CODES: PromoCode[] = [
  {
    code: "SAT2026",
    discountType: "percent",
    discountValue: 20,
    description: "20% off all annual and monthly SAT plans",
    active: true,
  },
  {
    code: "IVYBOUND",
    discountType: "fixed",
    discountValue: 50,
    description: "$50 instant credit on Mastery Pro & Ivy Elite",
    active: true,
  },
  {
    code: "SCHOLAR15",
    discountType: "percent",
    discountValue: 15,
    description: "15% student seasonal study discount",
    active: true,
  },
  {
    code: "FEEWAIVER100",
    discountType: "percent",
    discountValue: 100,
    description: "100% College Board / High School Need-Based Fee Waiver (Scholar Plus)",
    active: true,
  },
];

export const loadSavedStudentTiers = (): Record<StudentTier, StudentTierConfig> => {
  if (typeof window === "undefined") return DEFAULT_STUDENT_TIERS;
  try {
    const raw = localStorage.getItem("sat_student_tiers_config_v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.starter && parsed.plus && parsed.pro && parsed.elite) {
        const merged: Record<StudentTier, StudentTierConfig> = {} as any;
        (["starter", "plus", "pro", "elite"] as StudentTier[]).forEach((tierId) => {
          const def = DEFAULT_STUDENT_TIERS[tierId];
          const cur = parsed[tierId] || {};
          merged[tierId] = {
            ...def,
            ...cur,
            paymentStructure: {
              ...def.paymentStructure,
              ...(cur.paymentStructure || {}),
            },
            limits: {
              ...def.limits,
              ...(cur.limits || {}),
            },
            permissions: {
              ...def.permissions,
              ...(cur.permissions || {}),
            },
            features: Array.isArray(cur.features)
              ? cur.features
              : Array.isArray(cur.includedFeatures)
              ? cur.includedFeatures
              : def.features,
            omittedFeatures: Array.isArray(cur.omittedFeatures)
              ? cur.omittedFeatures
              : def.omittedFeatures,
          };
        });
        return merged;
      }
    }
  } catch (e) {
    console.error("Failed to load saved student tiers", e);
  }
  return DEFAULT_STUDENT_TIERS;
};

export const saveStudentTiers = (tiers: Record<StudentTier, StudentTierConfig>) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("sat_student_tiers_config_v1", JSON.stringify(tiers));
  } catch (e) {
    console.error("Failed to save student tiers", e);
  }
};

export const loadSavedPromoCodes = (): PromoCode[] => {
  if (typeof window === "undefined") return DEFAULT_PROMO_CODES;
  try {
    const raw = localStorage.getItem("sat_promo_codes_v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load saved promo codes", e);
  }
  return DEFAULT_PROMO_CODES;
};

export const savePromoCodes = (codes: PromoCode[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("sat_promo_codes_v1", JSON.stringify(codes));
  } catch (e) {
    console.error("Failed to save promo codes", e);
  }
};

export const STUDENT_TIERS: Record<StudentTier, StudentTierConfig> = DEFAULT_STUDENT_TIERS;
export const AVAILABLE_PROMO_CODES: PromoCode[] = DEFAULT_PROMO_CODES;

export const getStudentTier = (
  tierId?: StudentTier,
  customTiers?: Record<StudentTier, StudentTierConfig>
): StudentTierConfig => {
  const tiersDict = customTiers || DEFAULT_STUDENT_TIERS;
  if (!tierId || !tiersDict[tierId]) {
    return tiersDict.starter || DEFAULT_STUDENT_TIERS.starter;
  }
  return tiersDict[tierId];
};

export const hasTierAccess = (
  user?: UserProfile | null,
  feature?: keyof StudentTierConfig["limits"],
  customTiers?: Record<StudentTier, StudentTierConfig>
): boolean => {
  if (!user || !feature) return true;
  // Admin and Tutor roles have unrestricted access
  if (user.role === "admin" || user.role === "tutor") return true;

  const tier = getStudentTier(user.tier, customTiers);
  const limitValue = tier.limits[feature];

  if (typeof limitValue === "boolean") {
    return limitValue;
  }
  if (limitValue === "unlimited") {
    return true;
  }
  return typeof limitValue === "number" && limitValue > 0;
};
