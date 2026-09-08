import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Database,
  Users,
  Settings,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Check,
  Download,
  Upload,
  AlertTriangle,
  Search,
  Activity,
  Sliders,
  CheckCircle2,
  Sparkles,
  Layers,
  Award,
  Eye,
  RefreshCw,
  Clock,
  Zap,
  X,
  BookmarkCheck,
  BookMarked,
  Calculator,
  FileSpreadsheet,
  Copy,
  Code,
  HelpCircle,
  FileText,
  CheckCheck,
  CreditCard,
  Receipt,
  DollarSign,
  Calendar,
  Percent,
  Filter,
  ArrowUpDown,
  ChevronRight,
  Crown,
  Tag,
  Gift,
  FileJson,
  ShieldAlert,
  GraduationCap,
  UserCog,
  UserCheck,
  UserPlus,
} from "lucide-react";
import {
  SATQuestion,
  StudyPlan,
  UserProfile,
  UserRole,
  UserPermissions,
  AdminSystemConfig,
  AdminAuditLog,
  QuizAttempt,
  SATSection,
  SATDomain,
  DifficultyLevel,
  StudentTier,
  StudentTierConfig,
} from "../types";
import { OwlyLogoIcon } from "./OwlyLogo";
import { generateFull10000QuestionBank } from "../data/questionGeneratorEngine";
import { AdminEditBillingModal } from "./AdminEditBillingModal";
import { AdminEditPlanModal } from "./AdminEditPlanModal";
import { AdminEditRoleModal } from "./AdminEditRoleModal";
import {
  STUDENT_TIERS,
  DEFAULT_STUDENT_TIERS,
  DEFAULT_PROMO_CODES,
  PromoCode,
  getStudentTier,
  saveStudentTiers,
  savePromoCodes,
} from "../data/studentTiers";
import { DEFAULT_STUDY_PLAN } from "../data/defaultPlan";
import { ALL_MATH_FORMULAS, MathFormulaItem } from "../data/mathFormulas";
import { ROLE_DEFINITIONS, deduplicateProfiles } from "../data/defaultProfiles";

interface AdminControlViewProps {
  questionBank: SATQuestion[];
  onUpdateQuestionBank: (newBank: SATQuestion[]) => void;
  studyPlan: StudyPlan;
  onUpdateStudyPlan: (newPlan: StudyPlan) => void;
  formulaRules?: MathFormulaItem[];
  onUpdateFormulaRules?: (newRules: MathFormulaItem[]) => void;
  initialRuleIdToEdit?: string | null;
  onClearRuleIdToEdit?: () => void;
  profilesList: UserProfile[];
  currentProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onSelectProfile: (profileId: string) => void;
  onCreateProfile: (newP: UserProfile) => void;
  onDeleteProfile: (profileId: string) => void;
  attempts: QuizAttempt[];
  onUpdateAttempts: (newAttempts: QuizAttempt[]) => void;
  adminConfig: AdminSystemConfig;
  onUpdateAdminConfig: (cfg: AdminSystemConfig) => void;
  auditLogs: AdminAuditLog[];
  onAddAuditLog: (action: string, category: AdminAuditLog["category"], details: string) => void;
  onMasterResetAll: () => void;
  studentTiers?: Record<StudentTier, StudentTierConfig>;
  onUpdateStudentTiers?: (newTiers: Record<StudentTier, StudentTierConfig>) => void;
  promoCodes?: PromoCode[];
  onUpdatePromoCodes?: (newCodes: PromoCode[]) => void;
  onOpenStudentTiersPreview?: () => void;
  isFirestoreConnected?: boolean;
  onSyncFirestoreUsers?: () => Promise<void>;
}

const ALL_SECTIONS: SATSection[] = ["Math", "Reading & Writing"];
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
const ALL_DIFFICULTIES: DifficultyLevel[] = ["Easy", "Medium", "Hard"];

export const AdminControlView: React.FC<AdminControlViewProps> = ({
  questionBank,
  onUpdateQuestionBank,
  studyPlan,
  onUpdateStudyPlan,
  formulaRules = ALL_MATH_FORMULAS,
  onUpdateFormulaRules,
  initialRuleIdToEdit,
  onClearRuleIdToEdit,
  profilesList,
  currentProfile,
  onUpdateProfile,
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile,
  attempts,
  onUpdateAttempts,
  adminConfig,
  onUpdateAdminConfig,
  auditLogs,
  onAddAuditLog,
  onMasterResetAll,
  studentTiers,
  onUpdateStudentTiers,
  promoCodes,
  onUpdatePromoCodes,
  onOpenStudentTiersPreview,
  isFirestoreConnected = true,
  onSyncFirestoreUsers,
}) => {
  const [adminTab, setAdminTab] = useState<
    "overview" | "questions" | "rules" | "curriculum" | "users" | "plans" | "billing" | "system" | "logs"
  >("overview");

  // Dynamic Tiers & Promo state fallback
  const activeTiers = studentTiers || DEFAULT_STUDENT_TIERS;
  const activePromos = promoCodes || DEFAULT_PROMO_CODES;

  // Plan Tier Editor Modal State
  const [selectedTierToEdit, setSelectedTierToEdit] = useState<StudentTierConfig | null>(null);
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState<boolean>(false);

  // Plans JSON Import / Export Drawer State
  const [isJsonDrawerOpen, setIsJsonDrawerOpen] = useState<boolean>(false);
  const [jsonImportText, setJsonImportText] = useState<string>("");

  // Promo Code Modal & Form State
  const [isAddPromoModalOpen, setIsAddPromoModalOpen] = useState<boolean>(false);
  const [newPromoCode, setNewPromoCode] = useState<string>("");
  const [newPromoDiscountType, setNewPromoDiscountType] = useState<"percent" | "fixed">("percent");
  const [newPromoDiscountValue, setNewPromoDiscountValue] = useState<number>(20);
  const [newPromoDesc, setNewPromoDesc] = useState<string>("");

  // User Accounts & Role Management State
  const [userSearch, setUserSearch] = useState<string>("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<UserProfile | null>(null);

  const handleOpenEditRole = (profile: UserProfile) => {
    setSelectedUserForRole(profile);
    setIsRoleModalOpen(true);
  };

  const handleRoleChange = (profile: UserProfile, newRole: UserRole) => {
    const oldRole = profile.role;
    if (oldRole === newRole) return;

    let newPermissions: UserPermissions;
    if (newRole === "admin") {
      newPermissions = {
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
    } else if (newRole === "tutor") {
      newPermissions = {
        canPracticeAndDrill: true,
        canViewStudyPlan: true,
        canAccessQuestionBank: true,
        canEditQuestions: true,
        canManageCurriculum: true,
        canAccessAdminPanel: false,
        canManageUsersAndRoles: false,
        canModifySystemGrading: false,
        canViewAllStudentReports: true,
        canExportData: true,
      };
    } else if (newRole === "guest") {
      newPermissions = {
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
    } else {
      // student
      newPermissions = {
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
    }

    const updatedProfile: UserProfile = {
      ...profile,
      role: newRole,
      permissions: newPermissions,
    };

    onUpdateProfile(updatedProfile);
    onAddAuditLog(
      "User Role Updated",
      "Users",
      `Changed status for ${profile.name} (${profile.email}) from ${oldRole.toUpperCase()} to ${newRole.toUpperCase()}`
    );
    showToast(
      `Status updated: ${profile.name} is now ${
        newRole === "admin" ? "Master Admin" : newRole === "student" ? "SAT Student" : newRole === "tutor" ? "SAT Tutor" : "Guest"
      }`
    );
  };

  const handleSaveRoleModal = (updatedProfile: UserProfile, summary: string) => {
    onUpdateProfile(updatedProfile);
    onAddAuditLog("User Role Updated", "Users", summary);
    showToast(`Updated status & permissions for ${updatedProfile.name}`);
  };

  // Billing Admin State
  const [isBillingModalOpen, setIsBillingModalOpen] = useState<boolean>(false);
  const [billingModalProfile, setBillingModalProfile] = useState<UserProfile | null>(null);
  const [billingSearch, setBillingSearch] = useState<string>("");
  const [billingTierFilter, setBillingTierFilter] = useState<string>("All");
  const [billingStatusFilter, setBillingStatusFilter] = useState<string>("All");
  const [billingIntervalFilter, setBillingIntervalFilter] = useState<string>("All");

  const handleOpenEditBilling = (profile: UserProfile) => {
    setBillingModalProfile(profile);
    setIsBillingModalOpen(true);
  };

  const handleSaveBilling = (updatedProfile: UserProfile, summary: string) => {
    onUpdateProfile(updatedProfile);
    onAddAuditLog("Billing Updated", "Users", summary);
    showToast(`Updated billing details for ${updatedProfile.name}`);
  };

  const handleSwitchBillingStudent = (studentId: string) => {
    const target = profilesList.find((p) => p.id === studentId);
    if (target) {
      setBillingModalProfile(target);
    }
  };

  // Plan Management Handlers
  const handleOpenEditPlan = (tierConfig: StudentTierConfig) => {
    setSelectedTierToEdit(tierConfig);
    setIsEditPlanModalOpen(true);
  };

  const handleSavePlanConfig = (updatedConfig: StudentTierConfig) => {
    const nextTiers = {
      ...activeTiers,
      [updatedConfig.id]: updatedConfig,
    };
    if (onUpdateStudentTiers) {
      onUpdateStudentTiers(nextTiers);
    } else {
      saveStudentTiers(nextTiers);
    }
    onAddAuditLog(
      "Plan Tier Modified",
      "System",
      `Updated pricing, features, and quotas for ${updatedConfig.name} (${updatedConfig.id})`
    );
    showToast(`Saved configuration for plan "${updatedConfig.name}"`);
  };

  const handleResetPlanToDefault = (tierId: StudentTier) => {
    const defaultTier = DEFAULT_STUDENT_TIERS[tierId];
    if (!defaultTier) return;
    const nextTiers = {
      ...activeTiers,
      [tierId]: defaultTier,
    };
    if (onUpdateStudentTiers) {
      onUpdateStudentTiers(nextTiers);
    } else {
      saveStudentTiers(nextTiers);
    }
    if (selectedTierToEdit?.id === tierId) {
      setSelectedTierToEdit(defaultTier);
    }
    onAddAuditLog(
      "Plan Tier Reset",
      "System",
      `Reset ${defaultTier.name} (${tierId}) to College Board factory defaults`
    );
    showToast(`Reset "${defaultTier.name}" to factory default settings`);
  };

  const handleResetAllPlans = () => {
    if (
      !window.confirm(
        "Are you sure you want to reset all 4 student plans and tiers to official College Board factory defaults?"
      )
    ) {
      return;
    }
    if (onUpdateStudentTiers) {
      onUpdateStudentTiers(DEFAULT_STUDENT_TIERS);
    } else {
      saveStudentTiers(DEFAULT_STUDENT_TIERS);
    }
    onAddAuditLog(
      "All Plans Reset",
      "System",
      "Factory reset all 4 student tier subscription configurations"
    );
    showToast("Restored all 4 student plans to factory defaults");
  };

  const handleExportPlansJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(
        JSON.stringify(
          {
            version: "1.0",
            exportedAt: new Date().toISOString(),
            tiers: activeTiers,
            promoCodes: activePromos,
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `sat-plans-and-tiers-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Downloaded plans & tiers configuration JSON");
  };

  const handleImportPlansJson = () => {
    try {
      const parsed = JSON.parse(jsonImportText);
      const importedTiers = parsed.tiers || parsed;
      if (
        importedTiers &&
        importedTiers.starter &&
        importedTiers.plus &&
        importedTiers.pro &&
        importedTiers.elite
      ) {
        if (onUpdateStudentTiers) {
          onUpdateStudentTiers(importedTiers);
        } else {
          saveStudentTiers(importedTiers);
        }
        if (parsed.promoCodes && Array.isArray(parsed.promoCodes)) {
          if (onUpdatePromoCodes) {
            onUpdatePromoCodes(parsed.promoCodes);
          } else {
            savePromoCodes(parsed.promoCodes);
          }
        }
        setIsJsonDrawerOpen(false);
        setJsonImportText("");
        onAddAuditLog(
          "Plans JSON Imported",
          "System",
          "Imported student tiers configuration from JSON payload"
        );
        showToast("Successfully imported plans and tiers JSON configuration!");
      } else {
        alert(
          "Invalid JSON structure. Must contain valid 'starter', 'plus', 'pro', and 'elite' tier definitions."
        );
      }
    } catch (e) {
      alert("Failed to parse JSON string. Please ensure valid JSON formatting.");
    }
  };

  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = newPromoCode.trim().toUpperCase();
    if (!code) return;
    if (activePromos.some((p) => p.code.toUpperCase() === code)) {
      alert(`Promo code "${code}" already exists.`);
      return;
    }
    const newObj: PromoCode = {
      code,
      discountType: newPromoDiscountType,
      discountValue: Number(newPromoDiscountValue) || 10,
      description:
        newPromoDesc.trim() ||
        `${newPromoDiscountValue}${newPromoDiscountType === "percent" ? "%" : "$"} discount promo`,
      active: true,
    };
    const updated = [...activePromos, newObj];
    if (onUpdatePromoCodes) {
      onUpdatePromoCodes(updated);
    } else {
      savePromoCodes(updated);
    }
    setNewPromoCode("");
    setNewPromoDesc("");
    setIsAddPromoModalOpen(false);
    onAddAuditLog(
      "Promo Code Created",
      "System",
      `Created promo code ${code} (${newObj.discountValue}${newObj.discountType === "percent" ? "%" : "$"} off)`
    );
    showToast(`Added promotional code ${code}`);
  };

  const handleTogglePromoActive = (code: string) => {
    const updated = activePromos.map((p) =>
      p.code === code ? { ...p, active: p.active === false ? true : false } : p
    );
    if (onUpdatePromoCodes) {
      onUpdatePromoCodes(updated);
    } else {
      savePromoCodes(updated);
    }
    showToast(`Updated promo code status for ${code}`);
  };

  const handleDeletePromo = (code: string) => {
    if (!window.confirm(`Delete promotional code "${code}"?`)) return;
    const updated = activePromos.filter((p) => p.code !== code);
    if (onUpdatePromoCodes) {
      onUpdatePromoCodes(updated);
    } else {
      savePromoCodes(updated);
    }
    onAddAuditLog("Promo Code Deleted", "System", `Deleted promo code ${code}`);
    showToast(`Removed promo code ${code}`);
  };

  // Question editing / creation modal state
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<SATQuestion | null>(null);
  const [questionSearch, setQuestionSearch] = useState<string>("");
  const [questionDomainFilter, setQuestionDomainFilter] = useState<string>("All");

  // Question Form State
  const [qFormSection, setQFormSection] = useState<SATSection>("Math");
  const [qFormDomain, setQFormDomain] = useState<SATDomain>("Algebra");
  const [qFormSubtopic, setQFormSubtopic] = useState<string>("Linear Equations in One Variable");
  const [qFormDifficulty, setQFormDifficulty] = useState<DifficultyLevel>("Medium");
  const [qFormQuestion, setQFormQuestion] = useState<string>("");
  const [qFormPassage, setQFormPassage] = useState<string>("");
  const [qFormOptions, setQFormOptions] = useState<string[]>(["", "", "", ""]);
  const [qFormCorrectIndex, setQFormCorrectIndex] = useState<number>(0);
  const [qFormExplanation, setQFormExplanation] = useState<string>("");
  const [qFormTrap, setQFormTrap] = useState<string>("");

  // ==========================================
  // RULES & FORMULAS ADMIN STATE
  // ==========================================
  const currentRules = formulaRules && formulaRules.length > 0 ? formulaRules : ALL_MATH_FORMULAS;
  const [ruleSearch, setRuleSearch] = useState<string>("");
  const [ruleDomainFilter, setRuleDomainFilter] = useState<string>("All");
  const [ruleCategoryFilter, setRuleCategoryFilter] = useState<string>("All");
  const [isRuleModalOpen, setIsRuleModalOpen] = useState<boolean>(false);
  const [editingRule, setEditingRule] = useState<MathFormulaItem | null>(null);

  // Rule Form State
  const [rFormTitle, setRFormTitle] = useState<string>("");
  const [rFormCategory, setRFormCategory] = useState<"Math" | "Reading & Writing">("Math");
  const [rFormDomain, setRFormDomain] = useState<MathFormulaItem["domain"]>("Algebra");
  const [rFormIsProvided, setRFormIsProvided] = useState<boolean>(false);
  const [rFormFormula, setRFormFormula] = useState<string>("");
  const [rFormVariables, setRFormVariables] = useState<{ symbol: string; meaning: string }[]>([
    { symbol: "x", meaning: "Independent variable / input" },
  ]);
  const [rFormWhenToUse, setRFormWhenToUse] = useState<string>("");
  const [rFormNotes, setRFormNotes] = useState<string>("");
  const [rFormExampleProblem, setRFormExampleProblem] = useState<string>("");
  const [rFormSteps, setRFormSteps] = useState<string[]>(["Step 1: Identify given parameters."]);
  const [rFormTraps, setRFormTraps] = useState<string>("");
  const [rFormDesmosHack, setRFormDesmosHack] = useState<string>("");
  const [rFormInteractiveType, setRFormInteractiveType] = useState<string>("none");

  // Rule Import/Export Modal State
  const [isImportRuleModalOpen, setIsImportRuleModalOpen] = useState<boolean>(false);
  const [importRuleJson, setImportRuleJson] = useState<string>("");
  const [importRuleError, setImportRuleError] = useState<string | null>(null);

  // Notification
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Direct trigger if coming from Formula Guide view
  useEffect(() => {
    if (initialRuleIdToEdit) {
      setAdminTab("rules");
      const found = currentRules.find((r) => r.id === initialRuleIdToEdit);
      if (found) {
        handleOpenEditRule(found);
      }
      if (onClearRuleIdToEdit) {
        onClearRuleIdToEdit();
      }
    }
  }, [initialRuleIdToEdit, currentRules]);

  // Open Create Question Modal
  const handleOpenCreateQuestion = () => {
    setEditingQuestion(null);
    setQFormSection("Math");
    setQFormDomain("Algebra");
    setQFormSubtopic("Linear Equations in One Variable");
    setQFormDifficulty("Medium");
    setQFormQuestion("If 4x + 12 = 36, what is the value of x - 2?");
    setQFormPassage("");
    setQFormOptions(["4", "6", "8", "10"]);
    setQFormCorrectIndex(0);
    setQFormExplanation("Subtract 12 from both sides: 4x = 24, so x = 6. The question asks for x - 2 = 6 - 2 = 4.");
    setQFormTrap("Choice B (6) is solving for x without subtracting 2.");
    setIsQuestionModalOpen(true);
  };

  // Open Edit Question Modal
  const handleOpenEditQuestion = (q: SATQuestion) => {
    setEditingQuestion(q);
    setQFormSection(q.section);
    setQFormDomain(q.domain);
    setQFormSubtopic(q.subtopic);
    setQFormDifficulty(q.difficulty);
    setQFormQuestion(q.question);
    setQFormPassage(q.passage || "");
    setQFormOptions([...q.options]);
    setQFormCorrectIndex(q.correctAnswerIndex);
    setQFormExplanation(q.explanation);
    setQFormTrap(q.trapAnalysis || "");
    setIsQuestionModalOpen(true);
  };

  // Save Created or Edited Question
  const handleSaveQuestion = () => {
    if (!qFormQuestion.trim()) {
      alert("Question prompt cannot be empty.");
      return;
    }

    if (editingQuestion) {
      // Update existing
      const updated: SATQuestion = {
        ...editingQuestion,
        section: qFormSection,
        domain: qFormDomain,
        subtopic: qFormSubtopic,
        difficulty: qFormDifficulty,
        question: qFormQuestion,
        passage: qFormPassage ? qFormPassage : undefined,
        options: qFormOptions,
        correctAnswerIndex: qFormCorrectIndex,
        explanation: qFormExplanation,
        trapAnalysis: qFormTrap ? qFormTrap : undefined,
      };

      const newBank = questionBank.map((q) => (q.id === editingQuestion.id ? updated : q));
      onUpdateQuestionBank(newBank);
      onAddAuditLog("Question Updated", "Questions", `Updated question ID: ${editingQuestion.id}`);
      showToast("Question saved successfully!");
    } else {
      // Create new
      const newId = `admin-q-${Date.now()}`;
      const newQ: SATQuestion = {
        id: newId,
        section: qFormSection,
        domain: qFormDomain,
        subtopic: qFormSubtopic,
        difficulty: qFormDifficulty,
        question: qFormQuestion,
        passage: qFormPassage ? qFormPassage : undefined,
        options: qFormOptions,
        correctAnswerIndex: qFormCorrectIndex,
        explanation: qFormExplanation,
        trapAnalysis: qFormTrap ? qFormTrap : undefined,
        source: "Admin Custom Creator",
      };

      const newBank = [newQ, ...questionBank];
      onUpdateQuestionBank(newBank);
      onAddAuditLog("Question Created", "Questions", `Created custom question in ${qFormDomain} (${qFormDifficulty})`);
      showToast("New question added to bank!");
    }

    setIsQuestionModalOpen(false);
  };

  // Delete Question
  const handleDeleteQuestion = (id: string) => {
    if (window.confirm("Are you sure you want to delete this question from the bank?")) {
      const newBank = questionBank.filter((q) => q.id !== id);
      onUpdateQuestionBank(newBank);
      onAddAuditLog("Question Deleted", "Questions", `Deleted question ID: ${id}`);
      showToast("Question deleted from bank.");
    }
  };

  // Reset Question Bank to Factory Defaults
  const handleResetBank = () => {
    if (window.confirm("Restore factory 10,000 Questions Bank? Any custom questions will be reset.")) {
      const fullBank = generateFull10000QuestionBank();
      onUpdateQuestionBank(fullBank);
      onAddAuditLog("Bank Reset", "Questions", "Restored full 10,000 question bank from generator engine.");
      showToast("Question Bank restored to 10,000 questions!");
    }
  };

  // Reset Study Plan
  const handleResetPlan = () => {
    if (window.confirm("Reset Study Plan to default 8-week curriculum?")) {
      onUpdateStudyPlan(DEFAULT_STUDY_PLAN);
      onAddAuditLog("Curriculum Reset", "Study Plan", "Reset study roadmap to standard 8-week Digital SAT template.");
      showToast("Study plan reset to default!");
    }
  };

  // ==========================================
  // RULES & FORMULAS ACTION HANDLERS
  // ==========================================
  const handleOpenCreateRule = () => {
    setEditingRule(null);
    setRFormTitle("Quadratic Vertex & Peak Value Shortcut");
    setRFormCategory("Math");
    setRFormDomain("Advanced Math");
    setRFormIsProvided(false);
    setRFormFormula("h = -b / (2a)  |  k = f(h)  (Vertex at (h, k))");
    setRFormVariables([
      { symbol: "h", meaning: "x-coordinate of the parabola vertex / axis of symmetry" },
      { symbol: "k", meaning: "y-coordinate of vertex (minimum if a > 0, maximum if a < 0)" },
      { symbol: "a, b, c", meaning: "Coefficients of standard quadratic ax² + bx + c" },
    ]);
    setRFormWhenToUse("Finding the peak height, minimum cost, maximum revenue, or symmetry axis of any quadratic function.");
    setRFormNotes("If a > 0, parabola opens upward (k is minimum). If a < 0, parabola opens downward (k is maximum).");
    setRFormExampleProblem("A projectile height is given by h(t) = -5t² + 20t + 15. At what time t does it reach maximum altitude?");
    setRFormSteps([
      "Identify coefficients: a = -5, b = 20, c = 15",
      "Apply vertex axis formula: t = -b / (2a) = -20 / (2 * -5) = 2 seconds",
      "Calculate peak height by substituting t = 2: h(2) = -5(4) + 20(2) + 15 = 35 meters",
    ]);
    setRFormTraps("Mixing up the x-value (time/input) with the y-value (max height/output) when selecting choices.");
    setRFormDesmosHack("Graph 'y = -5x^2 + 20x + 15' in Desmos and tap the peak point (2, 35) directly.");
    setRFormInteractiveType("quadratic");
    setIsRuleModalOpen(true);
  };

  const handleOpenEditRule = (rule: MathFormulaItem) => {
    setEditingRule(rule);
    setRFormTitle(rule.title);
    setRFormCategory(rule.category);
    setRFormDomain(rule.domain);
    setRFormIsProvided(rule.isProvidedOnTest);
    setRFormFormula(rule.formula);
    setRFormVariables(rule.variables && rule.variables.length > 0 ? [...rule.variables] : [{ symbol: "x", meaning: "Variable" }]);
    setRFormWhenToUse(rule.whenToUse || "");
    setRFormNotes(rule.notes || "");
    setRFormExampleProblem(rule.exampleProblem || "");
    setRFormSteps(rule.stepByStepSolution && rule.stepByStepSolution.length > 0 ? [...rule.stepByStepSolution] : ["Step 1: Apply formula."]);
    setRFormTraps(rule.commonTraps || "");
    setRFormDesmosHack(rule.desmosHack || "");
    setRFormInteractiveType(rule.interactiveType || "none");
    setIsRuleModalOpen(true);
  };

  const handleSaveRule = () => {
    if (!rFormTitle.trim()) {
      alert("Rule title cannot be empty.");
      return;
    }
    if (!rFormFormula.trim()) {
      alert("Formula / rule expression cannot be empty.");
      return;
    }

    const cleanVariables = rFormVariables.filter((v) => v.symbol.trim() || v.meaning.trim());
    const cleanSteps = rFormSteps.filter((s) => s.trim().length > 0);

    if (editingRule) {
      const updatedRule: MathFormulaItem = {
        ...editingRule,
        title: rFormTitle.trim(),
        category: rFormCategory,
        domain: rFormDomain,
        isProvidedOnTest: rFormIsProvided,
        formula: rFormFormula.trim(),
        variables: cleanVariables.length > 0 ? cleanVariables : [{ symbol: "x", meaning: "Standard term" }],
        whenToUse: rFormWhenToUse.trim(),
        notes: rFormNotes.trim(),
        exampleProblem: rFormExampleProblem.trim(),
        stepByStepSolution: cleanSteps.length > 0 ? cleanSteps : ["Step 1: Compute value."],
        commonTraps: rFormTraps.trim(),
        desmosHack: rFormDesmosHack.trim() ? rFormDesmosHack.trim() : undefined,
        interactiveType: (rFormInteractiveType !== "none" ? rFormInteractiveType : undefined) as any,
      };

      const newRules = currentRules.map((r) => (r.id === editingRule.id ? updatedRule : r));
      if (onUpdateFormulaRules) {
        onUpdateFormulaRules(newRules);
      }
      onAddAuditLog("Rule Updated", "Rules & Formulas", `Updated rule "${updatedRule.title}" (${updatedRule.domain})`);
      showToast("Rule updated successfully!");
    } else {
      const newId = `rule-${rFormDomain.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;
      const newRule: MathFormulaItem = {
        id: newId,
        title: rFormTitle.trim(),
        category: rFormCategory,
        domain: rFormDomain,
        isProvidedOnTest: rFormIsProvided,
        formula: rFormFormula.trim(),
        variables: cleanVariables.length > 0 ? cleanVariables : [{ symbol: "x", meaning: "Standard term" }],
        whenToUse: rFormWhenToUse.trim(),
        notes: rFormNotes.trim(),
        exampleProblem: rFormExampleProblem.trim(),
        stepByStepSolution: cleanSteps.length > 0 ? cleanSteps : ["Step 1: Compute value."],
        commonTraps: rFormTraps.trim(),
        desmosHack: rFormDesmosHack.trim() ? rFormDesmosHack.trim() : undefined,
        interactiveType: (rFormInteractiveType !== "none" ? rFormInteractiveType : undefined) as any,
      };

      const newRules = [newRule, ...currentRules];
      if (onUpdateFormulaRules) {
        onUpdateFormulaRules(newRules);
      }
      onAddAuditLog("Rule Created", "Rules & Formulas", `Authored new rule "${newRule.title}" in ${newRule.domain}`);
      showToast("New rule added to catalog!");
    }

    setIsRuleModalOpen(false);
  };

  const handleDeleteRule = (id: string) => {
    const target = currentRules.find((r) => r.id === id);
    const title = target?.title || id;
    if (window.confirm(`Are you sure you want to delete the rule "${title}"?`)) {
      const newRules = currentRules.filter((r) => r.id !== id);
      if (onUpdateFormulaRules) {
        onUpdateFormulaRules(newRules);
      }
      onAddAuditLog("Rule Deleted", "Rules & Formulas", `Deleted rule: ${title} (ID: ${id})`);
      showToast("Rule removed from catalog.");
    }
  };

  const handleDuplicateRule = (rule: MathFormulaItem) => {
    const newId = `rule-dup-${Date.now()}`;
    const duplicated: MathFormulaItem = {
      ...rule,
      id: newId,
      title: `${rule.title} (Custom Variant)`,
    };
    const newRules = [duplicated, ...currentRules];
    if (onUpdateFormulaRules) {
      onUpdateFormulaRules(newRules);
    }
    onAddAuditLog("Rule Duplicated", "Rules & Formulas", `Cloned rule "${rule.title}" -> "${duplicated.title}"`);
    showToast("Rule duplicated successfully!");
  };

  const handleToggleProvided = (id: string) => {
    const newRules = currentRules.map((r) => {
      if (r.id === id) {
        const nextStatus = !r.isProvidedOnTest;
        onAddAuditLog(
          "Rule Sheet Status Changed",
          "Rules & Formulas",
          `Toggled "${r.title}" to ${nextStatus ? "Provided on Reference Sheet" : "Must Memorize"}`
        );
        return { ...r, isProvidedOnTest: nextStatus };
      }
      return r;
    });
    if (onUpdateFormulaRules) {
      onUpdateFormulaRules(newRules);
    }
    showToast("Reference sheet status updated!");
  };

  const handleResetRules = () => {
    if (window.confirm("Restore factory default Formulas & Rules catalog? All custom rules will be reset.")) {
      if (onUpdateFormulaRules) {
        onUpdateFormulaRules(ALL_MATH_FORMULAS);
      }
      onAddAuditLog("Rules Catalog Reset", "Rules & Formulas", "Restored standard reference catalog from default repository.");
      showToast("Formulas & Rules catalog restored to defaults!");
    }
  };

  const handleExportRulesJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentRules, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sat_rules_formulas_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onAddAuditLog("Rules Exported", "Rules & Formulas", `Exported ${currentRules.length} rules to JSON file.`);
    showToast(`Exported ${currentRules.length} rules!`);
  };

  const handleImportRulesJson = (mode: "append" | "replace") => {
    setImportRuleError(null);
    if (!importRuleJson.trim()) {
      setImportRuleError("JSON text cannot be empty.");
      return;
    }
    try {
      const parsed = JSON.parse(importRuleJson);
      if (!Array.isArray(parsed)) {
        throw new Error("Imported JSON must be an array of Rule objects.");
      }
      const validRules: MathFormulaItem[] = parsed.map((item, idx) => {
        if (!item.title || !item.formula) {
          throw new Error(`Item at index ${idx} is missing required 'title' or 'formula' fields.`);
        }
        return {
          id: item.id || `imported-rule-${Date.now()}-${idx}`,
          category: item.category || "Math",
          domain: item.domain || "Algebra",
          title: item.title,
          isProvidedOnTest: Boolean(item.isProvidedOnTest),
          formula: item.formula,
          renderedFormula: item.renderedFormula,
          variables: Array.isArray(item.variables) ? item.variables : [],
          whenToUse: item.whenToUse || "",
          notes: item.notes || "",
          exampleProblem: item.exampleProblem || "",
          stepByStepSolution: Array.isArray(item.stepByStepSolution) ? item.stepByStepSolution : [],
          commonTraps: item.commonTraps || "",
          desmosHack: item.desmosHack,
          interactiveType: item.interactiveType,
        };
      });

      let updatedRules: MathFormulaItem[];
      if (mode === "replace") {
        updatedRules = validRules;
      } else {
        const existingIds = new Set(currentRules.map((r) => r.id));
        const nonDuplicates = validRules.map((r) => (existingIds.has(r.id) ? { ...r, id: `${r.id}-imp-${Date.now()}` } : r));
        updatedRules = [...currentRules, ...nonDuplicates];
      }

      if (onUpdateFormulaRules) {
        onUpdateFormulaRules(updatedRules);
      }
      onAddAuditLog(
        "Rules Imported",
        "Rules & Formulas",
        `Imported ${validRules.length} rules via JSON (${mode === "replace" ? "Replaced catalog" : "Appended to catalog"}).`
      );
      showToast(`Successfully imported ${validRules.length} rules!`);
      setIsImportRuleModalOpen(false);
      setImportRuleJson("");
    } catch (err: any) {
      setImportRuleError(err.message || "Failed to parse JSON.");
    }
  };

  // Filtered Rules List for Rules Manager
  const filteredRules = currentRules.filter((r) => {
    if (ruleDomainFilter !== "All" && r.domain !== ruleDomainFilter) return false;
    if (ruleCategoryFilter === "Math" && r.category !== "Math") return false;
    if (ruleCategoryFilter === "Reading & Writing" && r.category !== "Reading & Writing") return false;
    if (ruleCategoryFilter === "Provided" && !r.isProvidedOnTest) return false;
    if (ruleCategoryFilter === "MustMemorize" && (r.isProvidedOnTest || r.category !== "Math")) return false;
    if (ruleCategoryFilter === "Interactive" && !r.interactiveType) return false;

    if (ruleSearch.trim()) {
      const q = ruleSearch.toLowerCase();
      const matchesTitle = r.title.toLowerCase().includes(q);
      const matchesFormula = r.formula.toLowerCase().includes(q);
      const matchesDomain = r.domain.toLowerCase().includes(q);
      const matchesWhen = (r.whenToUse || "").toLowerCase().includes(q);
      const matchesTraps = (r.commonTraps || "").toLowerCase().includes(q);
      const matchesVars = (r.variables || []).some(
        (v) => v.symbol.toLowerCase().includes(q) || v.meaning.toLowerCase().includes(q)
      );
      if (!matchesTitle && !matchesFormula && !matchesDomain && !matchesWhen && !matchesTraps && !matchesVars) {
        return false;
      }
    }
    return true;
  });

  // Performance Overrides
  const handleSeedHighPerformance = () => {
    const sampleAttempts: QuizAttempt[] = questionBank.slice(0, 40).map((q, idx) => ({
      questionId: q.id,
      selectedAnswerIndex: idx % 10 === 0 ? (q.correctAnswerIndex + 1) % 4 : q.correctAnswerIndex, // 90% correct
      isCorrect: idx % 10 !== 0,
      timeSpentSeconds: 40 + (idx % 20),
      timestamp: Date.now() - idx * 3600000,
    }));
    onUpdateAttempts(sampleAttempts);
    onAddAuditLog("Analytics Seeded", "Analytics", "Injected 40 high-performance student test attempts (90% accuracy).");
    showToast("High-performance sample attempts generated!");
  };

  const handleClearAttempts = () => {
    if (window.confirm("Clear all student practice attempts and test history?")) {
      onUpdateAttempts([]);
      onAddAuditLog("Attempts Cleared", "Analytics", "Cleared all logged student quiz attempts.");
      showToast("All student test attempts cleared.");
    }
  };

  // Filtered Question List for Manager
  const filteredQuestions = questionBank.filter((q) => {
    if (questionDomainFilter !== "All" && q.domain !== questionDomainFilter) return false;
    if (
      questionSearch &&
      !q.question.toLowerCase().includes(questionSearch.toLowerCase()) &&
      !q.subtopic.toLowerCase().includes(questionSearch.toLowerCase()) &&
      !q.id.toLowerCase().includes(questionSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-slate-950 text-white border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.4)] animate-in slide-in-from-bottom-3 font-mono">
          <CheckCircle2 className="w-5 h-5 text-cyan-400" />
          <span className="text-xs font-bold">{successMsg}</span>
        </div>
      )}

      {/* Admin Command Center Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-cyan-950/80 to-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <OwlyLogoIcon size="sm" />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-amber-950/80 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                OWLY SAT QUANTUM COMMAND CENTER
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-orbitron font-bold tracking-wide text-white drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">
              System Core & Curriculum Controller
            </h1>
            <p className="text-xs sm:text-sm font-space text-slate-300 max-w-2xl leading-relaxed">
              Complete administrative authority over the 10,000 question repository, curricula roadmaps, student accounts, grading formulas, and testing environments.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 bg-slate-950/90 p-3.5 rounded-2xl border border-cyan-500/30 shrink-0 text-center shadow-[inset_0_0_12px_rgba(6,182,212,0.15)]">
            <div className="px-2">
              <div className="text-[10px] uppercase font-mono font-bold text-cyan-400">Total Bank</div>
              <div className="text-lg font-orbitron font-black text-cyan-300">{questionBank.length.toLocaleString()}</div>
            </div>
            <div className="px-2 border-x border-cyan-500/20">
              <div className="text-[10px] uppercase font-mono font-bold text-emerald-400">Learners</div>
              <div className="text-lg font-orbitron font-black text-emerald-400">{profilesList.length}</div>
            </div>
            <div className="px-2">
              <div className="text-[10px] uppercase font-mono font-bold text-amber-400">Attempts</div>
              <div className="text-lg font-orbitron font-black text-amber-400">{attempts.length}</div>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-cyan-500/20 overflow-x-auto no-scrollbar">
          {[
            { id: "overview", label: "Core Overview", icon: Activity },
            { id: "questions", label: `Questions Bank (${questionBank.length})`, icon: Database },
            { id: "rules", label: `Rules & Formulas (${currentRules.length})`, icon: BookmarkCheck },
            { id: "curriculum", label: "Curricula & Plan", icon: BookOpen },
            { id: "users", label: `Accounts (${profilesList.length})`, icon: Users },
            { id: "plans", label: "Plans & Tiers (4 Tiers)", icon: Crown },
            { id: "billing", label: "Billing & Subscriptions", icon: CreditCard },
            { id: "system", label: "System Matrix", icon: Sliders },
            { id: "logs", label: `Audit Trail (${auditLogs.length})`, icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = adminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer ${
                  isSel
                    ? "bg-cyan-500 text-black shadow-[0_0_12px_#00f0ff]"
                    : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-cyan-500/20"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {adminTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="scifi-glass-card p-6 rounded-3xl border border-cyan-500/30 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-cyan-950 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                  <Database className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  {questionBank.length} items
                </span>
              </div>
              <div>
                <h3 className="text-base font-orbitron font-bold text-white">Question Bank</h3>
                <p className="text-xs font-space text-slate-300 mt-1 leading-relaxed">
                  Full 10,000 item Digital SAT taxonomy across all 4 math domains & reading.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => setAdminTab("questions")}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer"
                >
                  Questions
                </button>
                <button
                  onClick={handleOpenCreateQuestion}
                  className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl text-xs font-mono font-bold transition-colors shadow-[0_0_10px_rgba(6,182,212,0.4)] cursor-pointer"
                >
                  + Add
                </button>
              </div>
            </div>

            <div className="scifi-glass-card p-6 rounded-3xl border border-cyan-500/30 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-purple-950 text-purple-400 border border-purple-500/40 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                  <BookmarkCheck className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                  {currentRules.length} Rules
                </span>
              </div>
              <div>
                <h3 className="text-base font-orbitron font-bold text-white">Rules & Formulas</h3>
                <p className="text-xs font-space text-slate-300 mt-1 leading-relaxed">
                  Comprehensive identities, official given sheets, Desmos hacks, & trap alerts.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => setAdminTab("rules")}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-purple-400 border border-purple-500/30 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer"
                >
                  Manage Rules
                </button>
                <button
                  onClick={handleOpenCreateRule}
                  className="px-3 py-2 bg-purple-500 hover:bg-purple-400 text-black rounded-xl text-xs font-mono font-bold transition-colors shadow-[0_0_10px_rgba(168,85,247,0.4)] cursor-pointer"
                >
                  + Add
                </button>
              </div>
            </div>

            <div className="scifi-glass-card p-6 rounded-3xl border border-cyan-500/30 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  8 Weeks Active
                </span>
              </div>
              <div>
                <h3 className="text-base font-orbitron font-bold text-white">Curriculum</h3>
                <p className="text-xs font-space text-slate-300 mt-1 leading-relaxed">
                  {studyPlan.planTitle} ({studyPlan.weeklySchedule.length} weeks of daily goals).
                </p>
              </div>
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => setAdminTab("curriculum")}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer"
                >
                  Roadmap
                </button>
                <button
                  onClick={handleResetPlan}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-cyan-500/30 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer"
                  title="Reset to default roadmap"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="scifi-glass-card p-6 rounded-3xl border border-cyan-500/30 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-amber-950 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
                  {profilesList.length} Active
                </span>
              </div>
              <div>
                <h3 className="text-base font-orbitron font-bold text-white">Student Cohorts</h3>
                <p className="text-xs font-space text-slate-300 mt-1 leading-relaxed">
                  Active student: <span className="font-bold text-cyan-300">{currentProfile.name}</span> (Target: {currentProfile.targetScore}).
                </p>
              </div>
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => setAdminTab("users")}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer"
                >
                  Learners
                </button>
                <button
                  onClick={handleSeedHighPerformance}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-mono font-bold transition-colors shadow-[0_0_10px_rgba(245,158,11,0.4)] cursor-pointer"
                  title="Inject test analytics"
                >
                  Seed
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="scifi-glass-card p-6 rounded-3xl border border-cyan-500/30 shadow-sm space-y-4">
            <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              High-Priority Administrative Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={handleOpenCreateQuestion}
                className="p-4 rounded-2xl bg-slate-950/70 hover:bg-cyan-950/30 border border-cyan-500/20 hover:border-cyan-500/50 text-left transition-all group cursor-pointer"
              >
                <Plus className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-orbitron font-bold text-white">Author SAT Question</div>
                <div className="text-[11px] font-space text-slate-400">Insert custom items with step-by-step logic</div>
              </button>

              <button
                onClick={handleOpenCreateRule}
                className="p-4 rounded-2xl bg-slate-950/70 hover:bg-purple-950/30 border border-purple-500/20 hover:border-purple-500/50 text-left transition-all group cursor-pointer"
              >
                <BookmarkCheck className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-orbitron font-bold text-white">Author Math Rule / Formula</div>
                <div className="text-[11px] font-space text-slate-400">Add identities, variable keys, & Desmos hacks</div>
              </button>

              <button
                onClick={handleSeedHighPerformance}
                className="p-4 rounded-2xl bg-slate-950/70 hover:bg-emerald-950/30 border border-emerald-500/20 hover:border-emerald-500/50 text-left transition-all group cursor-pointer"
              >
                <Zap className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-orbitron font-bold text-white">Simulate Test Scores</div>
                <div className="text-[11px] font-space text-slate-400">Generate 40 verified attempts for analytics</div>
              </button>

              <button
                onClick={handleResetRules}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all group cursor-pointer"
              >
                <RotateCcw className="w-5 h-5 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-900">Reset Reference Catalog</div>
                <div className="text-[11px] text-slate-500">Restore factory College Board formulas</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUESTIONS MANAGER */}
      {adminTab === "questions" && (
        <div className="space-y-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900">SAT Question Repository Control</h2>
              <p className="text-xs text-slate-500">
                Browse, modify, or author official-caliber Digital SAT questions ({questionBank.length} loaded).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetBank}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset 10,000 Bank</span>
              </button>
              <button
                onClick={handleOpenCreateQuestion}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Author New Question</span>
              </button>
            </div>
          </div>

          {/* Search & Domain Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                placeholder="Search by keyword, subtopic, or ID..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={questionDomainFilter}
              onChange={(e) => setQuestionDomainFilter(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Domains ({questionBank.length})</option>
              {ALL_DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Question Table View */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] sticky top-0 border-b border-slate-200 z-10">
                  <tr>
                    <th className="py-3 px-4">ID & Difficulty</th>
                    <th className="py-3 px-4">Domain & Subtopic</th>
                    <th className="py-3 px-4">Question Prompt</th>
                    <th className="py-3 px-4">Correct Answer</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredQuestions.slice(0, 100).map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 text-[11px]">{q.id}</div>
                        <span
                          className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded mt-0.5 ${
                            q.difficulty === "Easy"
                              ? "bg-emerald-100 text-emerald-800"
                              : q.difficulty === "Medium"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{q.domain}</div>
                        <div className="text-[10px] text-slate-500">{q.subtopic}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs sm:max-w-md truncate">
                        {q.question}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-emerald-700">
                        Opt {String.fromCharCode(65 + q.correctAnswerIndex)}: {q.options[q.correctAnswerIndex]}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditQuestion(q)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Question"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
              Showing top {Math.min(100, filteredQuestions.length)} of {filteredQuestions.length} questions matching filters.
            </div>
          </div>
        </div>
      )}

      {/* TAB: RULES & FORMULAS MANAGER */}
      {adminTab === "rules" && (
        <div className="space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          {/* Header & Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <BookmarkCheck className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-black text-slate-900">Digital SAT Rules & Math Formulas Control</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Author, edit, or configure College Board reference sheet status, variable keys, worked examples, Desmos hacks, and interactive calculators ({currentRules.length} rules active).
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleResetRules}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                title="Restore factory default formulas"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <button
                onClick={handleExportRulesJson}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                title="Download JSON backup"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={() => {
                  setImportRuleJson("");
                  setImportRuleError(null);
                  setIsImportRuleModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                title="Import rules from JSON"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>Import JSON</span>
              </button>

              <button
                onClick={handleOpenCreateRule}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Author New Rule</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Rules</div>
              <div className="text-base font-black font-mono text-slate-900">{currentRules.length}</div>
            </div>
            <div className="bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100 text-center">
              <div className="text-[10px] uppercase font-bold text-indigo-500">Math Identities</div>
              <div className="text-base font-black font-mono text-indigo-700">
                {currentRules.filter((r) => r.category === "Math").length}
              </div>
            </div>
            <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-100 text-center">
              <div className="text-[10px] uppercase font-bold text-amber-600">Given on Exam</div>
              <div className="text-base font-black font-mono text-amber-800">
                {currentRules.filter((r) => r.isProvidedOnTest).length}
              </div>
            </div>
            <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100 text-center">
              <div className="text-[10px] uppercase font-bold text-rose-500">Must Memorize</div>
              <div className="text-base font-black font-mono text-rose-700">
                {currentRules.filter((r) => !r.isProvidedOnTest && r.category === "Math").length}
              </div>
            </div>
            <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100 text-center">
              <div className="text-[10px] uppercase font-bold text-emerald-600">R&W Rules</div>
              <div className="text-base font-black font-mono text-emerald-700">
                {currentRules.filter((r) => r.category === "Reading & Writing").length}
              </div>
            </div>
            <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-100 text-center">
              <div className="text-[10px] uppercase font-bold text-purple-600">Calculators</div>
              <div className="text-base font-black font-mono text-purple-700">
                {currentRules.filter((r) => Boolean(r.interactiveType)).length}
              </div>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={ruleSearch}
                onChange={(e) => setRuleSearch(e.target.value)}
                placeholder="Search rule title, formula expression, variable symbols, trap alerts, or Desmos hacks..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium"
              />
              {ruleSearch && (
                <button
                  onClick={() => setRuleSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={ruleCategoryFilter}
              onChange={(e) => setRuleCategoryFilter(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-purple-500 w-full sm:w-auto"
            >
              <option value="All">All Categories ({currentRules.length})</option>
              <option value="Math">Math Formulas ({currentRules.filter((r) => r.category === "Math").length})</option>
              <option value="Reading & Writing">Reading & Writing Rules ({currentRules.filter((r) => r.category === "Reading & Writing").length})</option>
              <option value="Provided">Official Bluebook Sheet ({currentRules.filter((r) => r.isProvidedOnTest).length})</option>
              <option value="MustMemorize">Must Memorize ({currentRules.filter((r) => !r.isProvidedOnTest && r.category === "Math").length})</option>
              <option value="Interactive">Interactive Solvers ({currentRules.filter((r) => r.interactiveType).length})</option>
            </select>

            <select
              value={ruleDomainFilter}
              onChange={(e) => setRuleDomainFilter(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-purple-500 w-full sm:w-auto"
            >
              <option value="All">All Domains</option>
              <option value="Algebra">Algebra</option>
              <option value="Advanced Math">Advanced Math</option>
              <option value="Problem Solving & Data Analysis">Problem Solving & Data Analysis</option>
              <option value="Geometry & Trigonometry">Geometry & Trigonometry</option>
              <option value="Standard English Conventions">Grammar & Conventions</option>
              <option value="Expression of Ideas">Expression of Ideas</option>
            </select>
          </div>

          {/* Rules Table / Catalog View */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            {filteredRules.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-slate-800">No matching formulas or rules found</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No rule matched your query "{ruleSearch}". Try clearing your filters or create a new rule.
                </p>
                <button
                  onClick={() => {
                    setRuleSearch("");
                    setRuleDomainFilter("All");
                    setRuleCategoryFilter("All");
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs hover:bg-purple-100 transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Domain & Status</th>
                      <th className="py-3 px-4">Rule Title & Formula Expression</th>
                      <th className="py-3 px-4">Variables & Application</th>
                      <th className="py-3 px-4">Desmos & Solver</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Domain & Sheet Status */}
                        <td className="py-3.5 px-4 align-top w-48 shrink-0">
                          <div className="space-y-1.5">
                            <span
                              className={`inline-block text-[10px] uppercase font-black px-2 py-0.5 rounded-md ${
                                rule.domain === "Algebra"
                                  ? "bg-indigo-100 text-indigo-800"
                                  : rule.domain === "Advanced Math"
                                  ? "bg-purple-100 text-purple-800"
                                  : rule.domain === "Problem Solving & Data Analysis"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : rule.domain === "Geometry & Trigonometry"
                                  ? "bg-sky-100 text-sky-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {rule.domain}
                            </span>

                            {/* One-click toggle for Reference Sheet */}
                            <div>
                              <button
                                onClick={() => handleToggleProvided(rule.id)}
                                title="Click to toggle reference sheet status"
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 transition-all cursor-pointer ${
                                  rule.isProvidedOnTest
                                    ? "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
                                    : "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100"
                                }`}
                              >
                                {rule.isProvidedOnTest ? (
                                  <>
                                    <Check className="w-3 h-3 text-amber-700" />
                                    <span>Given on Exam Sheet</span>
                                  </>
                                ) : (
                                  <>
                                    <span>★ Must Memorize</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">ID: {rule.id}</div>
                          </div>
                        </td>

                        {/* Title & Formula Expression */}
                        <td className="py-3.5 px-4 align-top max-w-sm">
                          <div className="space-y-1.5">
                            <div className="font-bold text-slate-900 text-sm">{rule.title}</div>
                            <div className="p-2 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] font-bold overflow-x-auto shadow-inner">
                              {rule.formula}
                            </div>
                            {rule.whenToUse && (
                              <p className="text-[11px] text-slate-500 line-clamp-2">
                                <strong className="text-slate-700">When to use: </strong>
                                {rule.whenToUse}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Variables & SAT Example */}
                        <td className="py-3.5 px-4 align-top max-w-xs">
                          <div className="space-y-1 text-[11px]">
                            {rule.variables && rule.variables.length > 0 && (
                              <div className="text-slate-600">
                                <span className="font-bold text-slate-700">{rule.variables.length} Variables: </span>
                                <span className="font-mono text-indigo-600">
                                  {rule.variables.map((v) => v.symbol).join(", ")}
                                </span>
                              </div>
                            )}

                            {rule.exampleProblem && (
                              <div className="text-slate-500 line-clamp-2">
                                <strong className="text-indigo-700">Example: </strong>
                                {rule.exampleProblem}
                              </div>
                            )}

                            {rule.commonTraps && (
                              <div className="text-rose-600 text-[10px] line-clamp-1">
                                <strong>Trap: </strong>
                                {rule.commonTraps}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Desmos & Interactive Solver */}
                        <td className="py-3.5 px-4 align-top w-48 shrink-0">
                          <div className="space-y-1.5">
                            {rule.interactiveType ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md">
                                <Calculator className="w-3 h-3 text-indigo-600" />
                                <span>Solver: {rule.interactiveType}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">No Interactive Solver</span>
                            )}

                            {rule.desmosHack && (
                              <div className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 p-1.5 rounded-lg line-clamp-2 font-mono">
                                <strong>Desmos: </strong>
                                {rule.desmosHack}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 align-top text-right shrink-0">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleDuplicateRule(rule)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                              title="Duplicate / Clone Rule"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditRule(rule)}
                              className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors cursor-pointer"
                              title="Edit Rule Details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRule(rule.id)}
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                              title="Delete Rule"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing <strong>{filteredRules.length}</strong> of {currentRules.length} rules
              </span>
              <button
                onClick={handleExportRulesJson}
                className="font-bold text-purple-700 hover:text-purple-900 transition-colors flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Rule Dataset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CURRICULUM OVERRIDE */}
      {adminTab === "curriculum" && (
        <div className="space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900">Curricula & Study Plan Editor</h2>
              <p className="text-xs text-slate-500">Modify global 8-week syllabus, weekly targets, and milestones.</p>
            </div>
            <button
              onClick={handleResetPlan}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Curriculum</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Plan Title
              </label>
              <input
                type="text"
                value={studyPlan.planTitle}
                onChange={(e) => onUpdateStudyPlan({ ...studyPlan, planTitle: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Strategy Summary
              </label>
              <textarea
                rows={3}
                value={studyPlan.strategySummary}
                onChange={(e) => onUpdateStudyPlan({ ...studyPlan, strategySummary: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Weeks Schedule Overview */}
            <div className="pt-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Weekly Schedule Breakdown ({studyPlan.weeklySchedule.length} Weeks)
              </h3>
              <div className="space-y-3">
                {studyPlan.weeklySchedule.map((week, wIdx) => (
                  <div key={week.weekNumber} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold font-mono text-xs flex items-center justify-center">
                          {week.weekNumber}
                        </span>
                        <input
                          type="text"
                          value={week.title}
                          onChange={(e) => {
                            const newSched = [...studyPlan.weeklySchedule];
                            newSched[wIdx].title = e.target.value;
                            onUpdateStudyPlan({ ...studyPlan, weeklySchedule: newSched });
                          }}
                          className="font-bold text-xs text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none px-1"
                        />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono">
                        {week.estimatedHours} Hours
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Weekly Goal:</span>
                        <input
                          type="text"
                          value={week.goal}
                          onChange={(e) => {
                            const newSched = [...studyPlan.weeklySchedule];
                            newSched[wIdx].goal = e.target.value;
                            onUpdateStudyPlan({ ...studyPlan, weeklySchedule: newSched });
                          }}
                          className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1 mt-0.5 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Milestone Checkpoint:</span>
                        <input
                          type="text"
                          value={week.milestoneCheckpoint}
                          onChange={(e) => {
                            const newSched = [...studyPlan.weeklySchedule];
                            newSched[wIdx].milestoneCheckpoint = e.target.value;
                            onUpdateStudyPlan({ ...studyPlan, weeklySchedule: newSched });
                          }}
                          className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1 mt-0.5 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: USERS & STUDENTS */}
      {adminTab === "users" && (
        <div className="space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          {/* Header & Provisioning Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-black text-slate-900">Student & Account Administration</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage registered user accounts, elevate student status to administrator, assign educator roles, and inspect security permissions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const newId = `user-student-${Date.now()}`;
                  const newStudent: UserProfile = {
                    id: newId,
                    name: "New Student Cohort",
                    email: `student.${profilesList.length + 1}@satprep.edu`,
                    role: "student",
                    avatarColor: "bg-purple-600",
                    highSchoolGrade: "11th Grade (Junior)",
                    targetScore: 1520,
                    mathTarget: 770,
                    rwTarget: 750,
                    baselineScore: 1320,
                    examDate: "2026-10-10",
                    examDateLabel: "October 2026 Digital SAT",
                    dailyGoalMinutes: 60,
                    dreamColleges: ["MIT", "Columbia"],
                    weakestDomains: ["Advanced Math"],
                    accommodations: {
                      extendedTime: "Standard (1.0x)",
                      enableSoundEffects: true,
                      autoShowScratchpad: false,
                      highContrastMode: false,
                    },
                    createdAt: new Date().toISOString().split("T")[0],
                  };
                  onCreateProfile(newStudent);
                  onAddAuditLog("User Created", "Users", `Created student account ${newStudent.name}`);
                  showToast("New student profile provisioned!");
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all border border-indigo-200 cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>+ Provision Student</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const newId = `user-admin-${Date.now()}`;
                  const newAdmin: UserProfile = {
                    id: newId,
                    name: "New System Administrator",
                    email: `admin.${profilesList.length + 1}@satprep.edu`,
                    role: "admin",
                    avatarColor: "bg-amber-600",
                    highSchoolGrade: "Faculty / Administrator",
                    targetScore: 1600,
                    mathTarget: 800,
                    rwTarget: 800,
                    baselineScore: 1550,
                    examDate: "2026-10-10",
                    examDateLabel: "October 2026 Digital SAT",
                    dailyGoalMinutes: 60,
                    dreamColleges: ["Stanford", "Harvard"],
                    weakestDomains: [],
                    permissions: {
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
                    },
                    accommodations: {
                      extendedTime: "Standard (1.0x)",
                      enableSoundEffects: true,
                      autoShowScratchpad: false,
                      highContrastMode: false,
                    },
                    createdAt: new Date().toISOString().split("T")[0],
                  };
                  onCreateProfile(newAdmin);
                  onAddAuditLog("Admin Created", "Users", `Provisioned new administrator account ${newAdmin.name}`);
                  showToast("New administrator account provisioned!");
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>+ Provision Admin</span>
              </button>
            </div>
          </div>

          {/* Cloud Database Status Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-indigo-900/10 via-slate-900/5 to-cyan-900/10 p-3.5 rounded-2xl border border-indigo-200/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Firestore Users Database</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Cloud Sync Active
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Collection: <code className="text-indigo-600 font-semibold">/users</code> &bull; Schema: <code className="text-indigo-600 font-semibold">firebase-blueprint.json</code>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  if (onSyncFirestoreUsers) {
                    await onSyncFirestoreUsers();
                    showToast("User database synchronized with Firestore cloud!");
                  } else {
                    showToast("Database is up-to-date and listening for changes.");
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                <span>Sync Cloud Database</span>
              </button>
            </div>
          </div>

          {/* Search, Filter & Role Statistics Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search accounts by name, email, or high school grade..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-500"
              />
              {userSearch && (
                <button
                  onClick={() => setUserSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Role Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "all", label: "All Accounts", count: profilesList.length },
                {
                  id: "student",
                  label: "Students",
                  count: profilesList.filter((p) => p.role === "student").length,
                },
                {
                  id: "admin",
                  label: "Admins",
                  count: profilesList.filter((p) => p.role === "admin").length,
                },
                {
                  id: "tutor",
                  label: "Tutors",
                  count: profilesList.filter((p) => p.role === "tutor").length,
                },
              ].map((filter) => {
                const isActive = userRoleFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setUserRoleFilter(filter.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200"
                    }`}
                  >
                    <span>{filter.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {filter.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Notice Banner on Role Switching */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong className="font-bold">Role Authority Control:</strong> Use the direct status switcher dropdown or 1-click promote/demote buttons below to change any user between <strong>Student</strong>, <strong>Administrator</strong>, and <strong>Tutor</strong> status.
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-white/70 px-2 py-0.5 rounded border border-amber-200 text-amber-800 shrink-0 hidden sm:inline">
              Instant Sync
            </span>
          </div>

          {/* Profiles Grid */}
          {(() => {
            const filtered = deduplicateProfiles(profilesList).filter((p) => {
              const matchesSearch =
                p.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                p.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                (p.highSchoolGrade && p.highSchoolGrade.toLowerCase().includes(userSearch.toLowerCase()));
              const matchesRole = userRoleFilter === "all" || p.role === userRoleFilter;
              return matchesSearch && matchesRole;
            });

            if (filtered.length === 0) {
              return (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl p-6 bg-slate-50">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <div className="text-sm font-bold text-slate-700">No accounts match your filter criteria</div>
                  <p className="text-xs text-slate-400 mt-1">Try changing your search term or role filter tab.</p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((p, idx) => {
                  const isCurrent = p.id === currentProfile.id;
                  const roleDef = ROLE_DEFINITIONS[p.role] || ROLE_DEFINITIONS.student;

                  return (
                    <div
                      key={`admin-user-card-${p.id}-${idx}`}
                      className={`p-5 rounded-3xl border transition-all ${
                        isCurrent
                          ? "bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-400"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {/* Top Row: User Avatar, Name & Current Role */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-11 rounded-2xl ${p.avatarColor} text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs`}
                          >
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-extrabold text-slate-900">{p.name}</span>
                              <span
                                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${roleDef.badgeColor}`}
                              >
                                {roleDef.badge}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 font-mono">{p.email}</div>
                          </div>
                        </div>

                        {isCurrent ? (
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-indigo-600 text-white shadow-xs shrink-0">
                            Active Session
                          </span>
                        ) : null}
                      </div>

                      {/* Status / Role Management Bar */}
                      <div className="p-3 rounded-2xl bg-white border border-slate-200 mb-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                            Account Status / Role
                          </label>

                          <button
                            type="button"
                            onClick={() => handleOpenEditRole(p)}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                            title="Configure detailed permissions"
                          >
                            <UserCog className="w-3 h-3" />
                            <span>Edit Permissions</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Direct Role Select Dropdown */}
                          <select
                            value={p.role}
                            onChange={(e) => handleRoleChange(p, e.target.value as UserRole)}
                            className={`flex-1 text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none focus:ring-2 cursor-pointer transition-colors ${
                              p.role === "admin"
                                ? "bg-amber-50 text-amber-900 border-amber-300 focus:ring-amber-400"
                                : p.role === "student"
                                ? "bg-indigo-50 text-indigo-900 border-indigo-200 focus:ring-indigo-400"
                                : "bg-slate-50 text-slate-800 border-slate-200 focus:ring-slate-400"
                            }`}
                          >
                            <option value="student">🎓 Student (Standard Learner)</option>
                            <option value="admin">🛡️ Administrator (Root Authority)</option>
                            <option value="tutor">📖 Tutor / Coach (Educator)</option>
                            <option value="guest">👤 Guest (Practice Only)</option>
                          </select>

                          {/* Quick 1-Click Promote / Demote Action */}
                          {p.role === "student" && (
                            <button
                              type="button"
                              onClick={() => handleRoleChange(p, "admin")}
                              className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-[11px] flex items-center gap-1 transition-all shadow-xs cursor-pointer whitespace-nowrap"
                              title="Promote this student directly to Master Administrator"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Make Admin</span>
                            </button>
                          )}

                          {p.role === "admin" && (
                            <button
                              type="button"
                              onClick={() => handleRoleChange(p, "student")}
                              className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] flex items-center gap-1 transition-all shadow-xs cursor-pointer whitespace-nowrap"
                              title="Demote this administrator to standard student status"
                            >
                              <GraduationCap className="w-3.5 h-3.5" />
                              <span>Make Student</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Score Metrics Grid */}
                      <div className="grid grid-cols-3 gap-2 py-2 text-center bg-white rounded-xl border border-slate-200 mb-3">
                        <div>
                          <div className="text-[9px] uppercase font-bold text-slate-400">Target</div>
                          <div className="text-xs font-black font-mono text-indigo-600">{p.targetScore}</div>
                        </div>
                        <div className="border-x border-slate-100">
                          <div className="text-[9px] uppercase font-bold text-slate-400">Baseline</div>
                          <div className="text-xs font-black font-mono text-slate-700">{p.baselineScore}</div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase font-bold text-slate-400">Daily Goal</div>
                          <div className="text-xs font-black font-mono text-emerald-600">{p.dailyGoalMinutes}m</div>
                        </div>
                      </div>

                      {/* Subscription & Billing Status Row */}
                      {(() => {
                        const pTier = getStudentTier(p.tier || p.subscription?.tier || "starter");
                        const pSub = p.subscription;
                        const status = pSub?.status || "active";
                        return (
                          <div className="p-2.5 rounded-2xl bg-white border border-slate-200 mb-3 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-[10px] font-black px-1.5 py-0.5 rounded border uppercase ${pTier.badgeColor}`}
                                >
                                  {pTier.name}
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium capitalize">
                                  ({pSub?.billingInterval || "Annual"})
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                  status === "active"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : status === "trialing"
                                    ? "bg-blue-100 text-blue-800"
                                    : status === "past_due"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {status.replace("_", " ")}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenEditBilling(p)}
                                className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                title="Edit billing details for this student"
                              >
                                <CreditCard className="w-3 h-3" />
                                <span>Edit Billing</span>
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="text-[11px] text-slate-500 font-medium">
                          Grade: <span className="font-semibold text-slate-700">{p.highSchoolGrade}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditRole(p)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Edit account role and permissions modal"
                          >
                            <UserCog className="w-3.5 h-3.5" />
                            <span>Role</span>
                          </button>

                          {!isCurrent && (
                            <button
                              onClick={() => {
                                onSelectProfile(p.id);
                                showToast(`Switched active profile to ${p.name}`);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              Switch User
                            </button>
                          )}
                          {profilesList.length > 1 && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete profile for ${p.name}?`)) {
                                  onDeleteProfile(p.id);
                                  onAddAuditLog("User Deleted", "Users", `Deleted profile for ${p.name}`);
                                  showToast("Profile deleted.");
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB: PLANS & TIERS ARCHITECTURE */}
      {adminTab === "plans" && (
        <div className="space-y-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Student Subscription Plans & Tier Matrix</h2>
                  <p className="text-xs text-slate-500">
                    Configure live pricing tiers, daily question & AI quotas, premium features, guarantees, and voucher codes.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onOpenStudentTiersPreview && (
                <button
                  type="button"
                  onClick={onOpenStudentTiersPreview}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-all shadow-xs cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Test Student Checkout View</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleExportPlansJson}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setJsonImportText(JSON.stringify(activeTiers, null, 2));
                  setIsJsonDrawerOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-all shadow-xs cursor-pointer"
              >
                <FileJson className="w-3.5 h-3.5" />
                <span>Import JSON</span>
              </button>
              <button
                type="button"
                onClick={handleResetAllPlans}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-all shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Factory Reset All</span>
              </button>
            </div>
          </div>

          {/* 4 Tiers Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {(["starter", "plus", "pro", "elite"] as StudentTier[]).map((tierKey) => {
              const tier = activeTiers[tierKey];
              if (!tier) return null;

              const enrolledStudents = profilesList.filter((p) => {
                const t = p.tier || p.subscription?.tier || "starter";
                return t === tier.id;
              });

              const isElite = tier.id === "elite";
              const isPro = tier.id === "pro";
              const isPlus = tier.id === "plus";

              return (
                <div
                  key={tier.id}
                  className={`flex flex-col justify-between rounded-2xl border p-5 transition-all relative ${
                    isElite
                      ? "border-purple-300 bg-gradient-to-b from-purple-50/70 to-slate-50 shadow-md shadow-purple-500/5"
                      : isPro
                      ? "border-amber-300 bg-gradient-to-b from-amber-50/70 to-slate-50 shadow-md shadow-amber-500/5"
                      : isPlus
                      ? "border-blue-300 bg-gradient-to-b from-blue-50/70 to-slate-50"
                      : "border-slate-200 bg-slate-50/60"
                  }`}
                >
                  {/* Top Badge / Tag */}
                  {tier.highlight && (
                    <div className="absolute -top-3 right-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white shadow-xs">
                        {tier.highlight}
                      </span>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Header */}
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-mono font-bold uppercase tracking-wider ${
                            isElite
                              ? "text-purple-700"
                              : isPro
                              ? "text-amber-700"
                              : isPlus
                              ? "text-blue-700"
                              : "text-slate-600"
                          }`}
                        >
                          Tier {tier.id.toUpperCase()}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-bold">
                          {enrolledStudents.length} {enrolledStudents.length === 1 ? "student" : "students"}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 mt-1">{tier.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{tier.tagline}</p>
                    </div>

                    {/* Pricing Box */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[11px] font-semibold text-slate-500">Monthly:</span>
                        <span className="text-sm font-black text-slate-900 font-mono">
                          {tier.paymentStructure?.monthlyPrice === 0
                            ? "Free ($0)"
                            : `$${tier.paymentStructure?.monthlyPrice ?? 0}/mo`}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between border-t border-slate-100 pt-1.5">
                        <span className="text-[11px] font-semibold text-slate-500">Annual:</span>
                        <span className="text-sm font-black text-slate-900 font-mono">
                          {tier.paymentStructure?.annualPrice === 0
                            ? "Free ($0)"
                            : `$${tier.paymentStructure?.annualPrice ?? 0}/yr`}
                        </span>
                      </div>
                      {tier.paymentStructure?.lifetimePrice !== undefined && (
                        <div className="flex items-baseline justify-between border-t border-slate-100 pt-1.5">
                          <span className="text-[11px] font-semibold text-slate-500">Lifetime:</span>
                          <span className="text-sm font-black text-slate-900 font-mono">
                            {tier.paymentStructure.lifetimePrice === 0
                              ? "Free ($0)"
                              : `$${tier.paymentStructure.lifetimePrice} once`}
                          </span>
                        </div>
                      )}
                      {tier.paymentStructure?.trialDays ? (
                        <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-center">
                          {tier.paymentStructure.trialDays}-Day Free Trial Included
                        </div>
                      ) : null}
                    </div>

                    {/* Limits & Quotas */}
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Daily Questions:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {tier.limits?.dailyPracticeQuestions === "unlimited" || tier.limits?.dailyPracticeQuestions === -1
                            ? "Unlimited"
                            : `${tier.limits?.dailyPracticeQuestions ?? 20} / day`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Daily AI Queries:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {tier.limits?.aiTutorDailyQueries === "unlimited" || tier.limits?.aiTutorDailyQueries === -1
                            ? "Unlimited"
                            : `${tier.limits?.aiTutorDailyQueries ?? 3} / day`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Full 1600 Mocks:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {tier.limits?.fullMockExamsAccess ? "Full Access" : "Disabled (Tier Locked)"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">PDF Diagnostics:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {tier.limits?.materialPdfAnalyzerAllowed ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      {tier.limits?.scoreGuarantee && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Guarantee:</span>
                          <span className="font-bold text-amber-700">{tier.limits.scoreGuarantee}</span>
                        </div>
                      )}
                    </div>

                    {/* Features List Sample */}
                    <div className="border-t border-slate-200/60 pt-3">
                      <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-2">
                        Included Features ({(tier.features || []).length})
                      </div>
                      <ul className="space-y-1">
                        {(tier.features || []).slice(0, 4).map((f, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{f}</span>
                          </li>
                        ))}
                        {(tier.features || []).length > 4 && (
                          <li className="text-[10px] text-slate-400 font-semibold pl-5">
                            +{(tier.features || []).length - 4} more benefits...
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-4 border-t border-slate-200/80 space-y-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditPlan(tier)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Edit Plan Details & Limits</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResetPlanToDefault(tier.id)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restore Default Tier</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Promotional Voucher & Coupon Codes Studio */}
          <div className="border-t border-slate-100 pt-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-base font-black text-slate-900">Promotional Vouchers & Need-Based Waivers</h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    {activePromos.length} Codes Active
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Create discount codes for marketing campaigns, seasonal flash sales, and need-based full tuition fee waivers.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddPromoModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Voucher Code</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activePromos.map((promo) => (
                <div
                  key={promo.code}
                  className={`p-4 rounded-2xl border transition-all ${
                    promo.active !== false
                      ? "bg-slate-50/80 border-slate-200 hover:border-emerald-300"
                      : "bg-slate-100/60 border-slate-200 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-sm text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                          {promo.code}
                        </span>
                        {promo.active !== false ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">(Inactive)</span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-emerald-600 mt-1.5">
                        {promo.discountValue}
                        {promo.discountType === "percent" ? "% OFF" : "$ OFF"}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(promo.code);
                          showToast(`Copied code ${promo.code}!`);
                        }}
                        title="Copy Code"
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePromo(promo.code)}
                        title="Delete Code"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{promo.description}</p>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {promo.discountType === "percent" ? "Percentage Discount" : "Flat Dollar Waiver"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTogglePromoActive(promo.code)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer ${
                        promo.active !== false
                          ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                          : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                      }`}
                    >
                      {promo.active !== false ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Comparison & Access Matrix */}
          <div className="border-t border-slate-100 pt-8 space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Tier Entitlements & Access Matrix</h3>
              <p className="text-xs text-slate-500">
                Summary of feature permissions, mock exams, scoring engines, and live 1-on-1 tutoring by tier.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-mono text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 font-bold">Tier / Plan</th>
                    <th className="p-3.5 font-bold">Pricing (Mo / Yr / Life)</th>
                    <th className="p-3.5 font-bold">Daily Limits</th>
                    <th className="p-3.5 font-bold">Full 1600 Mocks</th>
                    <th className="p-3.5 font-bold">PDF Analyzer</th>
                    <th className="p-3.5 font-bold">AI Drill Gen</th>
                    <th className="p-3.5 font-bold">Guarantees</th>
                    <th className="p-3.5 font-bold">Enrolled</th>
                    <th className="p-3.5 text-right font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {(["starter", "plus", "pro", "elite"] as StudentTier[]).map((tierId) => {
                    const tier = activeTiers[tierId];
                    if (!tier) return null;
                    const enrolledCount = profilesList.filter(
                      (p) => (p.tier || p.subscription?.tier || "starter") === tier.id
                    ).length;

                    return (
                      <tr key={tier.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{tier.name}</span>
                            {tier.highlight && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                                Pop
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-slate-600">
                          ${tier.paymentStructure?.monthlyPrice ?? 0} / ${tier.paymentStructure?.annualPrice ?? 0} / $
                          {tier.paymentStructure?.lifetimePrice ?? tier.paymentStructure?.annualPrice ?? 0}
                        </td>
                        <td className="p-3.5 font-mono text-slate-600">
                          {tier.limits?.dailyPracticeQuestions === "unlimited" || tier.limits?.dailyPracticeQuestions === -1
                            ? "∞"
                            : tier.limits?.dailyPracticeQuestions ?? 20}{" "}
                          Qs ·{" "}
                          {tier.limits?.aiTutorDailyQueries === "unlimited" || tier.limits?.aiTutorDailyQueries === -1
                            ? "∞"
                            : tier.limits?.aiTutorDailyQueries ?? 3}{" "}
                          AI
                        </td>
                        <td className="p-3.5">
                          {tier.limits?.fullMockExamsAccess ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Full
                            </span>
                          ) : (
                            <span className="text-slate-400">Locked</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          {tier.limits?.materialPdfAnalyzerAllowed ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Enabled
                            </span>
                          ) : (
                            <span className="text-slate-400">Disabled</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          {tier.limits?.aiQuestionGeneratorAllowed ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Unlimited
                            </span>
                          ) : (
                            <span className="text-slate-400">Standard</span>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-600">
                          {tier.limits?.scoreGuarantee ||
                            (tier.paymentStructure?.trialDays
                              ? `${tier.paymentStructure.trialDays}d Trial`
                              : "—")}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-slate-800">{enrolledCount}</td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenEditPlan(tier)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Edit Tier
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: BILLING & SUBSCRIPTIONS */}
      {adminTab === "billing" && (
        <div className="space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">Billing, Tuition & Subscription Operations</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                  Live Gateway
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Real-time ledger of learner tiers, active MRR, renewal schedules, and need-based financial aid waivers.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAdminTab("plans")}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-all shadow-xs cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Configure Plans & Tiers</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const headers = [
                    "Student Name",
                    "Email",
                    "Role",
                    "Tier",
                    "Billing Interval",
                    "Status",
                    "Current Period End",
                    "Payment Method",
                    "Last Amount",
                    "Lifetime Paid",
                    "Promo Code",
                    "Financial Aid",
                  ];
                  const rows = profilesList.map((p) => {
                    const sub = p.subscription;
                    return [
                      `"${p.name}"`,
                      `"${p.email}"`,
                      `"${p.role}"`,
                      `"${p.tier || sub?.tier || "starter"}"`,
                      `"${sub?.billingInterval || "annual"}"`,
                      `"${sub?.status || "active"}"`,
                      `"${sub?.currentPeriodEnd || "N/A"}"`,
                      `"${sub?.paymentMethodBrand || "N/A"} *${sub?.paymentMethodLast4 || ""}"`,
                      sub?.lastPaymentAmount ?? 0,
                      sub?.amountPaid ?? 0,
                      `"${sub?.promoCodeApplied || ""}"`,
                      `"${sub?.financialAidStatus || "none"}"`,
                    ].join(",");
                  });
                  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", `sat_billing_ledger_${new Date().toISOString().split("T")[0]}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  showToast("Billing ledger exported to CSV!");
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Ledger CSV</span>
              </button>
            </div>
          </div>

          {/* KPI Metrics Dashboard Cards */}
          {(() => {
            const paidProfiles = profilesList.filter((p) => {
              const t = p.tier || p.subscription?.tier || "starter";
              return t !== "starter" && p.subscription?.status === "active";
            });

            // Calculate estimated MRR
            const estimatedMrr = profilesList.reduce((acc, p) => {
              const sub = p.subscription;
              if (sub?.status !== "active") return acc;
              const t = getStudentTier(p.tier || sub?.tier);
              if (t.paymentStructure.type === "free") return acc;
              if (sub.billingInterval === "monthly") {
                return acc + (sub.lastPaymentAmount || t.paymentStructure.monthlyPrice);
              } else if (sub.billingInterval === "annual") {
                return acc + Math.round((sub.lastPaymentAmount || t.paymentStructure.annualPrice) / 12);
              }
              return acc;
            }, 0);

            // Calculate total cumulative volume
            const totalVolume = profilesList.reduce((acc, p) => {
              return acc + (p.subscription?.amountPaid ?? (p.subscription?.lastPaymentAmount ?? 0));
            }, 0);

            const pastDueCount = profilesList.filter((p) => p.subscription?.status === "past_due").length;
            const aidCount = profilesList.filter(
              (p) => p.subscription?.financialAidStatus && p.subscription.financialAidStatus !== "none"
            ).length;

            return (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border border-indigo-200">
                  <div className="flex items-center justify-between text-indigo-700 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider">Active MRR</span>
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black font-mono text-indigo-950">${estimatedMrr.toLocaleString()}/mo</div>
                  <div className="text-[11px] text-indigo-600 font-medium mt-1">
                    ${(estimatedMrr * 12).toLocaleString()} ARR run-rate
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/80 border border-emerald-200">
                  <div className="flex items-center justify-between text-emerald-700 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider">Cumulative Volume</span>
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black font-mono text-emerald-950">${totalVolume.toLocaleString()}</div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-1">
                    Across {paidProfiles.length} active paid plans
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/80 border border-amber-200">
                  <div className="flex items-center justify-between text-amber-700 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider">Past Due / Alerts</span>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black font-mono text-amber-950">{pastDueCount}</div>
                  <div className="text-[11px] text-amber-700 font-medium mt-1">
                    {pastDueCount > 0 ? "Requires payment recovery" : "All accounts current"}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/80 to-pink-50/80 border border-purple-200">
                  <div className="flex items-center justify-between text-purple-700 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider">Financial Aid</span>
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black font-mono text-purple-950">{aidCount}</div>
                  <div className="text-[11px] text-purple-700 font-medium mt-1">Need-based waivers & grants</div>
                </div>
              </div>
            );
          })()}

          {/* Search & Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={billingSearch}
                  onChange={(e) => setBillingSearch(e.target.value)}
                  placeholder="Search student, email, payer name, promo code, or last 4 digits..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <select
                  value={billingTierFilter}
                  onChange={(e) => setBillingTierFilter(e.target.value)}
                  className="px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="All">All Tiers</option>
                  <option value="starter">Starter (Free)</option>
                  <option value="plus">Scholar Plus</option>
                  <option value="pro">Mastery Pro</option>
                  <option value="elite">Ivy Elite</option>
                </select>

                <select
                  value={billingStatusFilter}
                  onChange={(e) => setBillingStatusFilter(e.target.value)}
                  className="px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="trialing">Trialing</option>
                  <option value="past_due">Past Due</option>
                  <option value="canceled">Canceled</option>
                </select>

                <select
                  value={billingIntervalFilter}
                  onChange={(e) => setBillingIntervalFilter(e.target.value)}
                  className="px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="All">All Intervals</option>
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                  <option value="lifetime">Lifetime</option>
                </select>

                {(billingSearch || billingTierFilter !== "All" || billingStatusFilter !== "All" || billingIntervalFilter !== "All") && (
                  <button
                    type="button"
                    onClick={() => {
                      setBillingSearch("");
                      setBillingTierFilter("All");
                      setBillingStatusFilter("All");
                      setBillingIntervalFilter("All");
                    }}
                    className="px-2.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition-colors shrink-0 cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Subscriptions Table */}
          {(() => {
            const filteredProfiles = profilesList.filter((p) => {
              const sub = p.subscription;
              const pTier = p.tier || sub?.tier || "starter";
              const pStatus = sub?.status || "active";
              const pInterval = sub?.billingInterval || "annual";

              // Tier filter
              if (billingTierFilter !== "All" && pTier !== billingTierFilter) return false;
              // Status filter
              if (billingStatusFilter !== "All" && pStatus !== billingStatusFilter) return false;
              // Interval filter
              if (billingIntervalFilter !== "All" && pInterval !== billingIntervalFilter) return false;

              // Search query
              if (billingSearch.trim()) {
                const query = billingSearch.toLowerCase().trim();
                const matchName = p.name.toLowerCase().includes(query);
                const matchEmail = p.email.toLowerCase().includes(query);
                const matchPayer = sub?.billingName?.toLowerCase().includes(query) || false;
                const matchPromo = sub?.promoCodeApplied?.toLowerCase().includes(query) || false;
                const matchLast4 = sub?.paymentMethodLast4?.includes(query) || false;
                if (!matchName && !matchEmail && !matchPayer && !matchPromo && !matchLast4) {
                  return false;
                }
              }

              return true;
            });

            return (
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Learner & Account</th>
                      <th className="py-3 px-3">Plan & Interval</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Payment Method</th>
                      <th className="py-3 px-3">Next Renewal</th>
                      <th className="py-3 px-3">Charges / Volume</th>
                      <th className="py-3 px-3">Aid / Notes</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProfiles.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-10 text-slate-400">
                          No student billing accounts match your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      deduplicateProfiles(filteredProfiles).map((p, idx) => {
                        const sub = p.subscription;
                        const tierObj = getStudentTier(p.tier || sub?.tier || "starter");
                        const status = sub?.status || "active";
                        const interval = sub?.billingInterval || "annual";
                        const lastAmount = sub?.lastPaymentAmount ?? (tierObj.paymentStructure.type === "free" ? 0 : 49);
                        const renewalDate = sub?.currentPeriodEnd || "2027-08-01";

                        return (
                          <tr key={`admin-billing-row-${p.id}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                            {/* Learner */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-xl ${p.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                                  {p.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                                    <span>{p.name}</span>
                                    {p.role === "admin" && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white">
                                        Admin
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-500">{p.email}</div>
                                </div>
                              </div>
                            </td>

                            {/* Plan & Interval */}
                            <td className="py-3 px-3">
                              <div className="space-y-0.5">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${tierObj.badgeColor}`}>
                                  {tierObj.name}
                                </span>
                                <div className="text-[11px] text-slate-500 font-medium capitalize">
                                  {interval} cycle
                                </div>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-3 px-3">
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                  status === "active"
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    : status === "trialing"
                                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                                    : status === "past_due"
                                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                                    : "bg-slate-100 text-slate-700 border border-slate-200"
                                }`}
                              >
                                {status.replace("_", " ")}
                              </span>
                              {sub?.cancelAtPeriodEnd && (
                                <div className="text-[9px] text-rose-600 font-bold mt-0.5">
                                  Cancels at term end
                                </div>
                              )}
                            </td>

                            {/* Payment Method */}
                            <td className="py-3 px-3 font-medium text-slate-700">
                              <div className="flex items-center gap-1.5">
                                <CreditCard className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                <span>{sub?.paymentMethodBrand || "Visa"}</span>
                                <span className="font-mono text-slate-500 font-bold">
                                  •••• {sub?.paymentMethodLast4 || "4242"}
                                </span>
                              </div>
                              {sub?.paymentMethodExpiry && (
                                <div className="text-[10px] text-slate-400 font-mono">
                                  Exp: {sub.paymentMethodExpiry}
                                </div>
                              )}
                            </td>

                            {/* Next Renewal */}
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-800 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>{renewalDate}</span>
                              </div>
                            </td>

                            {/* Charges / Volume */}
                            <td className="py-3 px-3">
                              <div className="font-black text-slate-900 font-mono">
                                ${lastAmount}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                Total: ${sub?.amountPaid ?? lastAmount}
                              </div>
                            </td>

                            {/* Aid / Notes */}
                            <td className="py-3 px-3">
                              {sub?.financialAidStatus && sub.financialAidStatus !== "none" ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                                  Aid: {sub.financialAidStatus.replace("_", " ")}
                                </span>
                              ) : sub?.promoCodeApplied ? (
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  {sub.promoCodeApplied}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">—</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditBilling(p)}
                                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                                  title="Edit full billing details"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>Edit Billing</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 5: SYSTEM PARAMETERS */}
      {adminTab === "system" && (
        <div className="space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900">Global Test Parameters & System Tuning</h2>
            <p className="text-xs text-slate-500">Configure grading formulas, testing timeouts, and platform features.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Digital SAT Scoring Curve Calibration
                </label>
                <select
                  value={adminConfig.scoringCurveMode}
                  onChange={(e) =>
                    onUpdateAdminConfig({ ...adminConfig, scoringCurveMode: e.target.value as any })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Standard">Standard (Official 2026 Adaptive Curve)</option>
                  <option value="Strict">Strict (Heavy penalties for Hard module misses)</option>
                  <option value="Lenient">Lenient (Forgiving curve for baseline diagnostics)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Standard Practice Timer (Seconds Per Question)
                </label>
                <select
                  value={adminConfig.defaultSecondsPerQuestion}
                  onChange={(e) =>
                    onUpdateAdminConfig({
                      ...adminConfig,
                      defaultSecondsPerQuestion: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value={60}>60 Seconds (Rapid Fire)</option>
                  <option value={75}>75 Seconds (Reading Pace)</option>
                  <option value={90}>90 Seconds (Standard SAT Benchmark)</option>
                  <option value={120}>120 Seconds (Extended Math Focus)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-900">Enable Desmos Scientific Tool</div>
                  <div className="text-[11px] text-slate-500">Allow embedded math tool on all test questions</div>
                </div>
                <input
                  type="checkbox"
                  checked={adminConfig.enableDesmosCalculator}
                  onChange={(e) =>
                    onUpdateAdminConfig({ ...adminConfig, enableDesmosCalculator: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-900">AI Tutor & Question Synthesis</div>
                  <div className="text-[11px] text-slate-500">Permit real-time AI drill generation</div>
                </div>
                <input
                  type="checkbox"
                  checked={adminConfig.allowAiGeneration}
                  onChange={(e) =>
                    onUpdateAdminConfig({ ...adminConfig, allowAiGeneration: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
                />
              </label>
            </div>
          </div>

          {/* Master Wipe Zone */}
          <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 space-y-3">
            <div className="flex items-center gap-2 text-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h3 className="text-xs font-black uppercase tracking-wider">Danger Zone: Master Factory Reset</h3>
            </div>
            <p className="text-xs text-rose-700">
              This will permanently purge all customized questions, reset student performance stats, restore default study plans, and reload clean factory states.
            </p>
            <button
              onClick={() => {
                if (window.confirm("PERMANENT ACTION: Wipe and restore everything to factory defaults?")) {
                  onMasterResetAll();
                  showToast("Factory Master Reset Complete.");
                }
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-xs"
            >
              Execute Master Factory Reset
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT TRAIL */}
      {adminTab === "logs" && (
        <div className="space-y-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">System Audit Trail & Event Logs</h2>
              <p className="text-xs text-slate-500">Immutable ledger of administrative actions, test changes, and curriculum events.</p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {auditLogs.length} Events Recorded
            </span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">{log.action}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {log.category}
                    </span>
                  </div>
                  <p className="text-slate-600">{log.details}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString()} • {new Date(log.timestamp).toLocaleDateString()}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500">by {log.adminName}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AUTHOR / EDIT QUESTION MODAL */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-base">
                  {editingQuestion ? `Edit Question (${editingQuestion.id})` : "Author New SAT Question"}
                </h3>
              </div>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Section</label>
                  <select
                    value={qFormSection}
                    onChange={(e) => setQFormSection(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    {ALL_SECTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Domain</label>
                  <select
                    value={qFormDomain}
                    onChange={(e) => setQFormDomain(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    {ALL_DOMAINS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Difficulty</label>
                  <select
                    value={qFormDifficulty}
                    onChange={(e) => setQFormDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    {ALL_DIFFICULTIES.map((df) => (
                      <option key={df} value={df}>{df}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Subtopic</label>
                <input
                  type="text"
                  value={qFormSubtopic}
                  onChange={(e) => setQFormSubtopic(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  placeholder="e.g. Systems of Linear Equations"
                />
              </div>

              {qFormSection === "Reading & Writing" && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Passage Context (Optional)</label>
                  <textarea
                    rows={3}
                    value={qFormPassage}
                    onChange={(e) => setQFormPassage(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    placeholder="Enter reading passage..."
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Question Prompt</label>
                <textarea
                  rows={3}
                  value={qFormQuestion}
                  onChange={(e) => setQFormQuestion(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  placeholder="Enter main question text..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">
                  Multiple Choice Options (Select Correct Answer)
                </label>
                <div className="space-y-2">
                  {qFormOptions.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQFormCorrectIndex(oIdx)}
                        className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center border transition-all ${
                          qFormCorrectIndex === oIdx
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {String.fromCharCode(65 + oIdx)}
                      </button>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...qFormOptions];
                          newOpts[oIdx] = e.target.value;
                          setQFormOptions(newOpts);
                        }}
                        className={`flex-1 px-3 py-1.5 rounded-xl border text-xs font-medium ${
                          qFormCorrectIndex === oIdx ? "border-emerald-500 bg-emerald-50/40" : "border-slate-200 bg-slate-50"
                        }`}
                        placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Step-by-Step Explanation</label>
                <textarea
                  rows={2}
                  value={qFormExplanation}
                  onChange={(e) => setQFormExplanation(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  placeholder="Explain why the answer is correct..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Trap / Distractor Analysis (Optional)</label>
                <input
                  type="text"
                  value={qFormTrap}
                  onChange={(e) => setQFormTrap(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  placeholder="Common College Board trap in this problem..."
                />
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsQuestionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuestion}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shadow-xs"
              >
                Save to Question Bank
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* RULE & FORMULA AUTHORING / EDITING MODAL */}
      {/* ==================================================== */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="bg-slate-900 p-6 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md">
                  <BookmarkCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingRule ? `Edit Rule: ${editingRule.title}` : "Author New Rule / Math Formula"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Define formula expressions, variable breakdowns, worked SAT problems, traps, and Desmos shortcuts.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRuleModalOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Row 1: Category, Domain, and Provided Switch */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Subject Category
                  </label>
                  <select
                    value={rFormCategory}
                    onChange={(e) => setRFormCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Math">Math</option>
                    <option value="Reading & Writing">Reading & Writing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    SAT Domain
                  </label>
                  <select
                    value={rFormDomain}
                    onChange={(e) => setRFormDomain(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Algebra">Algebra</option>
                    <option value="Advanced Math">Advanced Math</option>
                    <option value="Problem Solving & Data Analysis">Problem Solving & Data Analysis</option>
                    <option value="Geometry & Trigonometry">Geometry & Trigonometry</option>
                    <option value="Standard English Conventions">Grammar & Conventions</option>
                    <option value="Expression of Ideas">Expression of Ideas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Reference Sheet Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setRFormIsProvided(!rFormIsProvided)}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      rFormIsProvided
                        ? "bg-amber-100 border-amber-300 text-amber-950 shadow-xs"
                        : "bg-rose-50 border-rose-200 text-rose-800"
                    }`}
                  >
                    {rFormIsProvided ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-amber-700" />
                        <span>Given on Exam Sheet</span>
                      </>
                    ) : (
                      <>
                        <span>★ Must Memorize</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Row 2: Title & Formula */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Rule / Formula Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={rFormTitle}
                  onChange={(e) => setRFormTitle(e.target.value)}
                  placeholder="e.g. Quadratic Formula, Arc Length Formula, Circle Equation"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Mathematical Formula Expression <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={rFormFormula}
                  onChange={(e) => setRFormFormula(e.target.value)}
                  placeholder="e.g. x = (-b ± √(b² - 4ac)) / (2a)"
                  className="w-full px-3.5 py-2.5 bg-slate-900 text-emerald-400 border border-slate-800 rounded-xl text-xs sm:text-sm font-mono font-bold focus:outline-none focus:border-purple-500 shadow-inner"
                />
              </div>

              {/* Row 3: Variables Breakdown Builder */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">
                    Variables & Meaning Key ({rFormVariables.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setRFormVariables([...rFormVariables, { symbol: "", meaning: "" }])}
                    className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Variable</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {rFormVariables.map((v, vIdx) => (
                    <div key={vIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={v.symbol}
                        onChange={(e) => {
                          const updated = [...rFormVariables];
                          updated[vIdx].symbol = e.target.value;
                          setRFormVariables(updated);
                        }}
                        placeholder="Symbol (e.g. r)"
                        className="w-24 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-purple-700 focus:outline-none focus:border-purple-500"
                      />
                      <input
                        type="text"
                        value={v.meaning}
                        onChange={(e) => {
                          const updated = [...rFormVariables];
                          updated[vIdx].meaning = e.target.value;
                          setRFormVariables(updated);
                        }}
                        placeholder="Meaning (e.g. Radius of sphere)"
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (rFormVariables.length > 1) {
                            setRFormVariables(rFormVariables.filter((_, i) => i !== vIdx));
                          }
                        }}
                        disabled={rFormVariables.length <= 1}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 4: When to Use & Conceptual Guidance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    When to Use in Digital SAT
                  </label>
                  <textarea
                    rows={2}
                    value={rFormWhenToUse}
                    onChange={(e) => setRFormWhenToUse(e.target.value)}
                    placeholder="When the problem asks for..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Conceptual Notes & Rules
                  </label>
                  <textarea
                    rows={2}
                    value={rFormNotes}
                    onChange={(e) => setRFormNotes(e.target.value)}
                    placeholder="Important conceptual constraints..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Row 5: Real SAT Worked Example */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Real SAT Worked Example Problem
                </label>
                <textarea
                  rows={2}
                  value={rFormExampleProblem}
                  onChange={(e) => setRFormExampleProblem(e.target.value)}
                  placeholder="e.g. In triangle ABC, angle C is 90°, and sin(A) = 3/5. What is cos(B)?"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Row 6: Step-by-Step Solution Builder */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">
                    Step-by-Step Solution ({rFormSteps.length} steps)
                  </label>
                  <button
                    type="button"
                    onClick={() => setRFormSteps([...rFormSteps, `Step ${rFormSteps.length + 1}: `])}
                    className="px-2.5 py-1 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Step</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {rFormSteps.map((step, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                        {sIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => {
                          const updated = [...rFormSteps];
                          updated[sIdx] = e.target.value;
                          setRFormSteps(updated);
                        }}
                        placeholder={`Step ${sIdx + 1} walkthrough...`}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (rFormSteps.length > 1) {
                            setRFormSteps(rFormSteps.filter((_, i) => i !== sIdx));
                          }
                        }}
                        disabled={rFormSteps.length <= 1}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 7: Common Traps & Desmos Shortcut */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-rose-700 uppercase mb-1">
                    College Board Trap / Distractor Alert
                  </label>
                  <textarea
                    rows={2}
                    value={rFormTraps}
                    onChange={(e) => setRFormTraps(e.target.value)}
                    placeholder="Common mistake or trick to warn students about..."
                    className="w-full px-3.5 py-2 bg-rose-50/50 border border-rose-200 rounded-xl text-xs text-rose-950 focus:outline-none focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-indigo-700 uppercase mb-1">
                    Desmos Calculator Fast Shortcut
                  </label>
                  <textarea
                    rows={2}
                    value={rFormDesmosHack}
                    onChange={(e) => setRFormDesmosHack(e.target.value)}
                    placeholder="Graph 'y = ...' or type regression '~' in Desmos..."
                    className="w-full px-3.5 py-2 bg-indigo-50/50 border border-indigo-200 rounded-xl text-xs font-mono text-indigo-950 focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              {/* Row 8: Interactive Calculator Solver Type */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Built-in Interactive Calculator Sandbox
                </label>
                <select
                  value={rFormInteractiveType}
                  onChange={(e) => setRFormInteractiveType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-500"
                >
                  <option value="none">None (Standard Formula Reference)</option>
                  <option value="quadratic">Quadratic Solver (Roots, Vertex, Discriminant)</option>
                  <option value="slope">Slope, y-intercept & Line Equation</option>
                  <option value="circle">Circle Standard Form (Center (h,k) & Radius)</option>
                  <option value="percent">Percent Change & Growth Multiplier</option>
                  <option value="arc">Arc Length & Sector Area Calculator</option>
                  <option value="exponential">Exponential Growth & Decay Solver</option>
                  <option value="distance">Distance & Midpoint 2D Calculator</option>
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRuleModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRule}
                className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Formula to Catalog</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* JSON IMPORT MODAL */}
      {/* ==================================================== */}
      {isImportRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="bg-slate-900 p-6 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Import Rules & Formulas JSON</h3>
                  <p className="text-xs text-slate-400">Paste JSON array containing MathFormulaItem objects.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportRuleModalOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {importRuleError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{importRuleError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  JSON Array Payload
                </label>
                <textarea
                  rows={8}
                  value={importRuleJson}
                  onChange={(e) => setImportRuleJson(e.target.value)}
                  placeholder={`[\n  {\n    "id": "rule-custom-1",\n    "title": "Special Right Triangles (30-60-90)",\n    "category": "Math",\n    "domain": "Geometry & Trigonometry",\n    "isProvidedOnTest": true,\n    "formula": "Sides in ratio: x : x√3 : 2x",\n    "variables": [{"symbol": "x", "meaning": "Shortest side opposite 30°"}]\n  }\n]`}
                  className="w-full p-3 bg-slate-900 text-emerald-400 border border-slate-800 rounded-xl font-mono text-xs focus:outline-none focus:border-purple-500 shadow-inner"
                />
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsImportRuleModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 cursor-pointer"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleImportRulesJson("append")}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Append to Existing
                </button>
                <button
                  type="button"
                  onClick={() => handleImportRulesJson("replace")}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Replace All Rules
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* ADMIN EDIT ROLE & PERMISSIONS MODAL */}
      {/* ==================================================== */}
      {isRoleModalOpen && selectedUserForRole && (
        <AdminEditRoleModal
          isOpen={isRoleModalOpen}
          onClose={() => {
            setIsRoleModalOpen(false);
            setSelectedUserForRole(null);
          }}
          targetProfile={selectedUserForRole}
          onSaveRole={handleSaveRoleModal}
        />
      )}

      {/* ==================================================== */}
      {/* ADMIN EDIT BILLING & SUBSCRIPTION MODAL */}
      {/* ==================================================== */}
      {isBillingModalOpen && billingModalProfile && (
        <AdminEditBillingModal
          isOpen={isBillingModalOpen}
          onClose={() => {
            setIsBillingModalOpen(false);
            setBillingModalProfile(null);
          }}
          studentProfile={billingModalProfile}
          allProfiles={profilesList}
          onSaveBilling={handleSaveBilling}
          onSwitchStudent={handleSwitchBillingStudent}
          customTiers={activeTiers}
        />
      )}

      {/* ==================================================== */}
      {/* ADMIN EDIT PLAN & TIER CONFIGURATION MODAL */}
      {/* ==================================================== */}
      {isEditPlanModalOpen && selectedTierToEdit && (
        <AdminEditPlanModal
          isOpen={isEditPlanModalOpen}
          onClose={() => {
            setIsEditPlanModalOpen(false);
            setSelectedTierToEdit(null);
          }}
          planConfig={selectedTierToEdit}
          onSavePlan={handleSavePlanConfig}
          onResetDefault={handleResetPlanToDefault}
        />
      )}

      {/* ==================================================== */}
      {/* PLANS & TIERS JSON IMPORT / EXPORT MODAL */}
      {/* ==================================================== */}
      {isJsonDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">
                  Import / Export Plans & Tiers Configuration JSON
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsJsonDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Paste a custom plans JSON payload below to import or override current pricing, quotas, and promo codes.
            </p>

            <textarea
              value={jsonImportText}
              onChange={(e) => setJsonImportText(e.target.value)}
              rows={12}
              className="w-full font-mono text-xs p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-slate-50"
              placeholder="Paste JSON configuration here..."
            />

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(jsonImportText);
                  showToast("Copied JSON to clipboard!");
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsJsonDrawerOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportPlansJson}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Apply JSON Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* CREATE NEW PROMO / VOUCHER CODE MODAL */}
      {/* ==================================================== */}
      {isAddPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">Create New Promo Voucher</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPromoModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPromo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Voucher Code Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER50, SCHOLAR2026"
                  value={newPromoCode}
                  onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                  className="w-full text-sm font-mono font-bold uppercase p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Discount Type
                  </label>
                  <select
                    value={newPromoDiscountType}
                    onChange={(e) => setNewPromoDiscountType(e.target.value as any)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Dollar ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Discount Value ({newPromoDiscountType === "percent" ? "%" : "$"})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={newPromoDiscountType === "percent" ? 100 : 10000}
                    required
                    value={newPromoDiscountValue}
                    onChange={(e) => setNewPromoDiscountValue(Number(e.target.value))}
                    className="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description / Campaign Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Spring admission season 20% tuition discount"
                  value={newPromoDesc}
                  onChange={(e) => setNewPromoDesc(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddPromoModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Save & Activate Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
