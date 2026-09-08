import { UserProfile, UserRole, UserPermissions, AdminSystemConfig, AdminAuditLog } from "../types";

export function getDefaultPermissions(role: UserRole): UserPermissions {
  switch (role) {
    case "admin":
      return {
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
    case "tutor":
      return {
        canPracticeAndDrill: true,
        canViewStudyPlan: true,
        canAccessQuestionBank: true,
        canEditQuestions: true,
        canManageCurriculum: false,
        canAccessAdminPanel: false,
        canManageUsersAndRoles: false,
        canModifySystemGrading: false,
        canViewAllStudentReports: true,
        canExportData: true,
      };
    case "student":
      return {
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
      };
    case "guest":
      return {
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
      };
  }
}

export interface RoleDescriptor {
  role: UserRole;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  iconName: string;
  requiresPin: boolean;
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleDescriptor> = {
  student: {
    role: "student",
    title: "SAT Student",
    badge: "Student",
    badgeColor: "bg-indigo-100 text-indigo-700 border-indigo-200",
    description: "Standard learner permission. Access adaptive study roadmap, 5,000 question bank drills, personalized progress reports, and AI tutor.",
    iconName: "GraduationCap",
    requiresPin: false,
  },
  tutor: {
    role: "tutor",
    title: "SAT Tutor / Coach",
    badge: "Tutor / Coach",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    description: "Educator & mentor permission. Access all student progress reports, review question banks with trap analyses, and guide curriculum.",
    iconName: "BookOpen",
    requiresPin: false,
  },
  admin: {
    role: "admin",
    title: "System Administrator",
    badge: "Master Admin",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
    description: "Full root authority. Manage 5,000 question bank, curriculum roadmaps, grading algorithms, user roles, security, and audit logs.",
    iconName: "ShieldCheck",
    requiresPin: true,
  },
  guest: {
    role: "guest",
    title: "Guest Learner",
    badge: "Guest (Practice Only)",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-300",
    description: "Trial practice drills mode. Test practice questions and drills with the Digital SAT Bluebook engine (all other tabs concealed for guest).",
    iconName: "User",
    requiresPin: false,
  },
};

export const ADMIN_SECURITY_PIN = "1542016"; // Admin access authorization passcode & password

export function deduplicateProfiles(profiles: UserProfile[]): UserProfile[] {
  if (!Array.isArray(profiles)) return [];
  const seenIds = new Set<string>();
  const seenEmails = new Set<string>();
  const result: UserProfile[] = [];

  for (const p of profiles) {
    if (!p) continue;
    const cleanId = String(p.id || "").trim();
    const cleanEmail = (p.email || "").trim().toLowerCase();

    if (!cleanId) continue;
    if (seenIds.has(cleanId)) continue;
    if (cleanEmail && seenEmails.has(cleanEmail)) continue;

    seenIds.add(cleanId);
    if (cleanEmail) {
      seenEmails.add(cleanEmail);
    }
    result.push({
      ...p,
      id: cleanId,
    });
  }

  return result;
}

export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: "user-theinsiderspace",
    name: "The Insider Space",
    email: "theinsiderspace@gmail.com",
    role: "admin",
    tier: "elite",
    permissions: getDefaultPermissions("admin"),
    avatarColor: "bg-cyan-600",
    highSchoolGrade: "Lead Instructor & System Administrator",
    targetScore: 1600,
    mathTarget: 800,
    rwTarget: 800,
    baselineScore: 1580,
    examDate: "2026-10-10",
    examDateLabel: "October 2026 Digital SAT",
    dailyGoalMinutes: 90,
    studyDaysPerWeek: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    dreamColleges: ["MIT", "Stanford", "Harvard", "Princeton"],
    weakestDomains: [],
    bio: "Administrator & Lead Account for The Insider Space.",
    accommodations: {
      extendedTime: "Standard (1.0x)",
      enableSoundEffects: true,
      autoShowScratchpad: true,
      highContrastMode: false,
    },
    createdAt: "2026-01-01",
  },
  {
    id: "user-jordan-davis",
    name: "Jordan Davis",
    email: "jordan.davis@satprep.edu",
    role: "student",
    tier: "pro",
    subscription: {
      tier: "pro",
      status: "active",
      billingInterval: "annual",
      currentPeriodStart: "2026-08-01",
      currentPeriodEnd: "2027-08-01",
      amountPaid: 349,
      lastPaymentAmount: 349,
      paymentMethodBrand: "Visa",
      paymentMethodLast4: "4242",
      paymentMethodExpiry: "08/28",
      promoCodeApplied: "SAT2026",
      discountPercent: 15,
      billingName: "Michael Davis (Guardian)",
      billingEmail: "m.davis.billing@gmail.com",
      billingPhone: "+1 (555) 349-8821",
      billingAddress: {
        line1: "742 Evergreen Terrace",
        city: "Springfield",
        state: "IL",
        postalCode: "62704",
        country: "United States",
      },
      adminBillingNotes: "Annual Pro subscription billed via card. High-achiever family discount applied with code SAT2026.",
      invoices: [
        {
          id: "inv-2026-001",
          invoiceNumber: "INV-2026-0801",
          date: "2026-08-01",
          amount: 349,
          status: "paid",
          description: "Annual Mastery Pro Membership (12 Months)",
          paymentMethod: "Visa ending in 4242",
          billingName: "Michael Davis",
        },
      ],
    },
    permissions: getDefaultPermissions("student"),
    avatarColor: "bg-indigo-600",
    highSchoolGrade: "11th Grade (Junior)",
    targetScore: 1540,
    mathTarget: 780,
    rwTarget: 760,
    baselineScore: 1380,
    examDate: "2026-10-10",
    examDateLabel: "October 2026 Digital SAT",
    dailyGoalMinutes: 60,
    studyDaysPerWeek: ["Mon", "Tue", "Wed", "Thu", "Sat"],
    dreamColleges: ["MIT", "Stanford", "Carnegie Mellon", "UC Berkeley"],
    weakestDomains: ["Advanced Math", "Standard English Conventions"],
    bio: "Aspiring Computer Science major aiming for 1550+ on the October Digital SAT.",
    accommodations: {
      extendedTime: "Standard (1.0x)",
      enableSoundEffects: true,
      autoShowScratchpad: false,
      highContrastMode: false,
    },
    createdAt: "2026-08-01",
  },
  {
    id: "user-sarah-jenkins",
    name: "Sarah Jenkins, M.Ed.",
    email: "sarah.jenkins@owlysat.edu",
    role: "tutor",
    tier: "elite",
    permissions: getDefaultPermissions("tutor"),
    avatarColor: "bg-emerald-600",
    highSchoolGrade: "Senior SAT Prep Coach & Evaluator",
    targetScore: 1600,
    mathTarget: 800,
    rwTarget: 800,
    baselineScore: 1590,
    examDate: "2026-10-10",
    examDateLabel: "October 2026 Digital SAT (Proctor)",
    dailyGoalMinutes: 90,
    studyDaysPerWeek: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    dreamColleges: ["Harvard", "Stanford", "Yale", "Columbia"],
    weakestDomains: [],
    bio: "Lead SAT educator supporting 40+ students aiming for Ivy League and Top 20 admissions.",
    accommodations: {
      extendedTime: "Standard (1.0x)",
      enableSoundEffects: true,
      autoShowScratchpad: true,
      highContrastMode: false,
    },
    createdAt: "2026-07-15",
  },
  {
    id: "user-maya-patel",
    name: "Maya Patel",
    email: "maya.patel@satprep.edu",
    role: "student",
    tier: "elite",
    subscription: {
      tier: "elite",
      status: "active",
      billingInterval: "monthly",
      currentPeriodStart: "2026-08-10",
      currentPeriodEnd: "2026-09-10",
      amountPaid: 129,
      lastPaymentAmount: 129,
      paymentMethodBrand: "Mastercard",
      paymentMethodLast4: "8821",
      paymentMethodExpiry: "11/27",
      billingName: "Dr. Sunita Patel (Parent)",
      billingEmail: "spatel.md@patelhealth.org",
      billingPhone: "+1 (555) 782-9900",
      billingAddress: {
        line1: "1200 Beacon Street, Apt 4B",
        city: "Brookline",
        state: "MA",
        postalCode: "02446",
        country: "United States",
      },
      adminBillingNotes: "Ivy Elite Monthly coaching. Automated invoice receipts sent to family accountant.",
      invoices: [
        {
          id: "inv-2026-002",
          invoiceNumber: "INV-2026-0810",
          date: "2026-08-10",
          amount: 129,
          status: "paid",
          description: "Ivy Elite Monthly Diagnostic & Coaching Suite",
          paymentMethod: "Mastercard ending in 8821",
          billingName: "Dr. Sunita Patel",
        },
      ],
    },
    permissions: getDefaultPermissions("student"),
    avatarColor: "bg-purple-600",
    highSchoolGrade: "12th Grade (Senior)",
    targetScore: 1580,
    mathTarget: 800,
    rwTarget: 780,
    baselineScore: 1450,
    examDate: "2026-11-07",
    examDateLabel: "November 2026 Digital SAT",
    dailyGoalMinutes: 90,
    studyDaysPerWeek: ["Mon", "Wed", "Fri", "Sun"],
    dreamColleges: ["Harvard", "Yale", "Columbia", "Princeton"],
    weakestDomains: ["Craft and Structure", "Geometry & Trigonometry"],
    bio: "Pre-med track student focused on maxing out Math and Craft & Structure sections.",
    accommodations: {
      extendedTime: "Standard (1.0x)",
      enableSoundEffects: true,
      autoShowScratchpad: true,
      highContrastMode: false,
    },
    createdAt: "2026-08-10",
  },
  {
    id: "user-alex-chen",
    name: "Alex Chen",
    email: "alex.chen@satprep.edu",
    role: "student",
    tier: "plus",
    subscription: {
      tier: "plus",
      status: "active",
      billingInterval: "monthly",
      currentPeriodStart: "2026-08-15",
      currentPeriodEnd: "2026-09-15",
      amountPaid: 19,
      lastPaymentAmount: 19,
      paymentMethodBrand: "Amex",
      paymentMethodLast4: "1004",
      paymentMethodExpiry: "04/29",
      billingName: "Alex Chen",
      billingEmail: "alex.chen.finances@gmail.com",
      billingPhone: "+1 (555) 602-1144",
      billingAddress: {
        line1: "450 Westwood Blvd",
        city: "Los Angeles",
        state: "CA",
        postalCode: "90024",
        country: "United States",
      },
      adminBillingNotes: "Scholar Plus Monthly plan. Student self-pay with debit account.",
      invoices: [
        {
          id: "inv-2026-003",
          invoiceNumber: "INV-2026-0815",
          date: "2026-08-15",
          amount: 19,
          status: "paid",
          description: "Scholar Plus Monthly Access",
          paymentMethod: "Amex ending in 1004",
          billingName: "Alex Chen",
        },
      ],
    },
    permissions: getDefaultPermissions("student"),
    avatarColor: "bg-amber-600",
    highSchoolGrade: "11th Grade (Junior)",
    targetScore: 1480,
    mathTarget: 750,
    rwTarget: 730,
    baselineScore: 1290,
    examDate: "2026-10-10",
    examDateLabel: "October 2026 Digital SAT",
    dailyGoalMinutes: 45,
    studyDaysPerWeek: ["Tue", "Thu", "Sat", "Sun"],
    dreamColleges: ["UCLA", "University of Michigan", "NYU", "UT Austin"],
    weakestDomains: ["Algebra", "Information and Ideas"],
    bio: "Business administration applicant targeting top public universities.",
    accommodations: {
      extendedTime: "1.5x Time",
      enableSoundEffects: false,
      autoShowScratchpad: false,
      highContrastMode: false,
    },
    createdAt: "2026-08-15",
  },
  {
    id: "user-admin-master",
    name: "Dr. Robert Vance (Director / Admin)",
    email: "admin.vance@owlysat.internal",
    password: "1542016",
    role: "admin",
    permissions: getDefaultPermissions("admin"),
    avatarColor: "bg-slate-900",
    highSchoolGrade: "Lead SAT Instructor & System Administrator",
    targetScore: 1600,
    mathTarget: 800,
    rwTarget: 800,
    baselineScore: 1600,
    examDate: "2026-12-05",
    examDateLabel: "Official Proctor / Curriculum Control",
    dailyGoalMinutes: 120,
    studyDaysPerWeek: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    dreamColleges: ["College Board Testing Center", "Ivy League Consortium"],
    weakestDomains: [],
    bio: "Curriculum director with 15+ years of standardized test psychometrics experience.",
    accommodations: {
      extendedTime: "Standard (1.0x)",
      enableSoundEffects: true,
      autoShowScratchpad: true,
      highContrastMode: false,
    },
    createdAt: "2026-01-01",
  },
];

export const DEFAULT_ADMIN_CONFIG: AdminSystemConfig = {
  scoringCurveMode: "Standard",
  defaultSecondsPerQuestion: 90,
  allowAiGeneration: true,
  enableDesmosCalculator: true,
  maintenanceBanner: "",
};

export const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: "log-1",
    action: "System Initialization",
    category: "System",
    details: "Loaded 5,000 verified Digital SAT Questions taxonomy and adaptive engine.",
    timestamp: Date.now() - 172800000,
    adminName: "Dr. Robert Vance",
  },
  {
    id: "log-2",
    action: "Curriculum Calibration",
    category: "Study Plan",
    details: "Calibrated 8-week structured roadmap with College Board 2026 test specs.",
    timestamp: Date.now() - 86400000,
    adminName: "Dr. Robert Vance",
  },
  {
    id: "log-3",
    action: "Student Enrollment",
    category: "Users",
    details: "Activated student profile Jordan Davis (Target: 1540).",
    timestamp: Date.now() - 43200000,
    adminName: "System",
  },
];

export interface CollegeBenchmark {
  name: string;
  satRange: string;
  midScore: number;
  acceptanceRate: string;
  location: string;
}

export const COLLEGE_BENCHMARKS: CollegeBenchmark[] = [
  { name: "MIT (Massachusetts Institute of Technology)", satRange: "1510 - 1580", midScore: 1550, acceptanceRate: "4.0%", location: "Cambridge, MA" },
  { name: "Harvard University", satRange: "1490 - 1580", midScore: 1540, acceptanceRate: "3.4%", location: "Cambridge, MA" },
  { name: "Stanford University", satRange: "1500 - 1570", midScore: 1540, acceptanceRate: "3.7%", location: "Stanford, CA" },
  { name: "Princeton University", satRange: "1500 - 1580", midScore: 1540, acceptanceRate: "4.5%", location: "Princeton, NJ" },
  { name: "Yale University", satRange: "1490 - 1580", midScore: 1540, acceptanceRate: "4.6%", location: "New Haven, CT" },
  { name: "Columbia University", satRange: "1480 - 1570", midScore: 1530, acceptanceRate: "3.9%", location: "New York, NY" },
  { name: "University of Pennsylvania (Penn)", satRange: "1480 - 1570", midScore: 1530, acceptanceRate: "5.9%", location: "Philadelphia, PA" },
  { name: "Carnegie Mellon University (CMU)", satRange: "1480 - 1560", midScore: 1520, acceptanceRate: "11.3%", location: "Pittsburgh, PA" },
  { name: "Duke University", satRange: "1480 - 1560", midScore: 1520, acceptanceRate: "6.3%", location: "Durham, NC" },
  { name: "Brown University", satRange: "1470 - 1560", midScore: 1520, acceptanceRate: "5.1%", location: "Providence, RI" },
  { name: "Dartmouth College", satRange: "1470 - 1560", midScore: 1510, acceptanceRate: "6.2%", location: "Hanover, NH" },
  { name: "Cornell University", satRange: "1450 - 1550", midScore: 1500, acceptanceRate: "7.9%", location: "Ithaca, NY" },
  { name: "UC Berkeley", satRange: "1410 - 1530", midScore: 1470, acceptanceRate: "11.6%", location: "Berkeley, CA" },
  { name: "UCLA", satRange: "1390 - 1530", midScore: 1460, acceptanceRate: "9.0%", location: "Los Angeles, CA" },
  { name: "University of Michigan (Ann Arbor)", satRange: "1380 - 1530", midScore: 1450, acceptanceRate: "17.7%", location: "Ann Arbor, MI" },
  { name: "NYU (New York University)", satRange: "1450 - 1550", midScore: 1500, acceptanceRate: "12.2%", location: "New York, NY" },
  { name: "Northwestern University", satRange: "1460 - 1560", midScore: 1510, acceptanceRate: "7.0%", location: "Evanston, IL" },
  { name: "University of Chicago", satRange: "1510 - 1570", midScore: 1540, acceptanceRate: "5.4%", location: "Chicago, IL" },
  { name: "Johns Hopkins University", satRange: "1500 - 1560", midScore: 1530, acceptanceRate: "6.5%", location: "Baltimore, MD" },
  { name: "Georgia Tech", satRange: "1370 - 1530", midScore: 1450, acceptanceRate: "16.0%", location: "Atlanta, GA" },
  { name: "UT Austin", satRange: "1250 - 1480", midScore: 1370, acceptanceRate: "28.7%", location: "Austin, TX" },
];

export const POPULAR_DREAM_COLLEGES = COLLEGE_BENCHMARKS.map((c) => c.name);

