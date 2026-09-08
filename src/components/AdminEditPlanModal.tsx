import React, { useState, useEffect } from "react";
import {
  StudentTier,
  StudentTierConfig,
  StudentTierLimits,
  StudentTierPaymentStructure,
  UserPermissions,
} from "../types";
import {
  X,
  Sparkles,
  Check,
  CreditCard,
  Layers,
  Shield,
  Zap,
  Sliders,
  DollarSign,
  Plus,
  Trash2,
  HelpCircle,
  Award,
  Lock,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Tag,
  CheckCircle2,
  Crown,
} from "lucide-react";

interface AdminEditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  tierConfig?: StudentTierConfig | null;
  planConfig?: StudentTierConfig | null;
  onSavePlan: (updatedConfig: StudentTierConfig) => void;
  onResetPlanToDefault?: (tierId: StudentTier) => void;
  onResetDefault?: (tierId: StudentTier) => void;
}

const BADGE_COLOR_PRESETS = [
  {
    name: "Slate (Starter)",
    value: "bg-slate-100 text-slate-700 border-slate-300",
    previewClass: "bg-slate-100 text-slate-700 border-slate-300",
  },
  {
    name: "Indigo (Plus)",
    value: "bg-indigo-100 text-indigo-800 border-indigo-300",
    previewClass: "bg-indigo-100 text-indigo-800 border-indigo-300",
  },
  {
    name: "Purple (Pro)",
    value: "bg-purple-100 text-purple-900 border-purple-300 ring-1 ring-purple-200",
    previewClass: "bg-purple-100 text-purple-900 border-purple-300",
  },
  {
    name: "Amber Gold (Elite)",
    value: "bg-amber-100 text-amber-950 border-amber-300 ring-1 ring-amber-300",
    previewClass: "bg-amber-100 text-amber-950 border-amber-300",
  },
  {
    name: "Emerald Green",
    value: "bg-emerald-100 text-emerald-900 border-emerald-300 ring-1 ring-emerald-200",
    previewClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
  },
  {
    name: "Cyan Tech",
    value: "bg-cyan-100 text-cyan-900 border-cyan-300 ring-1 ring-cyan-200",
    previewClass: "bg-cyan-100 text-cyan-900 border-cyan-300",
  },
  {
    name: "Rose Luxury",
    value: "bg-rose-100 text-rose-900 border-rose-300 ring-1 ring-rose-200",
    previewClass: "bg-rose-100 text-rose-900 border-rose-300",
  },
];

export const AdminEditPlanModal: React.FC<AdminEditPlanModalProps> = ({
  isOpen,
  onClose,
  tierConfig,
  planConfig,
  onSavePlan,
  onResetPlanToDefault,
  onResetDefault,
}) => {
  const activeConfig = planConfig || tierConfig;
  const onReset = onResetDefault || onResetPlanToDefault;
  const [activeTab, setActiveTab] = useState<
    "branding" | "pricing" | "limits" | "features" | "permissions"
  >("branding");

  // Form State
  const [name, setName] = useState<string>(activeConfig?.name || "");
  const [badge, setBadge] = useState<string>(activeConfig?.badge || "");
  const [badgeColor, setBadgeColor] = useState<string>(
    activeConfig?.badgeColor || "bg-indigo-100 text-indigo-800 border-indigo-300"
  );
  const [highlight, setHighlight] = useState<string>(activeConfig?.highlight || "");
  const [tagline, setTagline] = useState<string>(activeConfig?.tagline || "");
  const [targetAudience, setTargetAudience] = useState<string>(
    activeConfig?.targetAudience || ""
  );

  // Payment Structure
  const [type, setType] = useState<"free" | "recurring_subscription" | "comprehensive_program">(
    activeConfig?.paymentStructure?.type || "recurring_subscription"
  );
  const [monthlyPrice, setMonthlyPrice] = useState<number>(
    activeConfig?.paymentStructure?.monthlyPrice || 0
  );
  const [annualPrice, setAnnualPrice] = useState<number>(
    activeConfig?.paymentStructure?.annualPrice || 0
  );
  const [lifetimePrice, setLifetimePrice] = useState<number | undefined>(
    activeConfig?.paymentStructure?.lifetimePrice
  );
  const [trialDays, setTrialDays] = useState<number>(
    activeConfig?.paymentStructure?.trialDays || 0
  );
  const [moneyBackGuaranteeDays, setMoneyBackGuaranteeDays] = useState<number>(
    activeConfig?.paymentStructure?.moneyBackGuaranteeDays || 0
  );
  const [billingIntervals, setBillingIntervals] = useState<
    ("monthly" | "annual" | "lifetime")[]
  >(activeConfig?.paymentStructure?.billingIntervals || ["monthly", "annual"]);
  const [financialAidAvailable, setFinancialAidAvailable] = useState<boolean>(
    activeConfig?.paymentStructure?.financialAidAvailable ?? true
  );

  // Limits
  const [isDailyUnlimited, setIsDailyUnlimited] = useState<boolean>(
    activeConfig?.limits?.dailyPracticeQuestions === "unlimited"
  );
  const [dailyQuestionsCount, setDailyQuestionsCount] = useState<number>(
    typeof activeConfig?.limits?.dailyPracticeQuestions === "number"
      ? activeConfig.limits.dailyPracticeQuestions
      : 20
  );

  const [isAiTutorUnlimited, setIsAiTutorUnlimited] = useState<boolean>(
    activeConfig?.limits?.aiTutorDailyQueries === "unlimited"
  );
  const [aiTutorQueriesCount, setAiTutorQueriesCount] = useState<number>(
    typeof activeConfig?.limits?.aiTutorDailyQueries === "number"
      ? activeConfig.limits.aiTutorDailyQueries
      : 50
  );

  const [fullMockExamsAccess, setFullMockExamsAccess] = useState<boolean>(
    activeConfig?.limits?.fullMockExamsAccess ?? true
  );
  const [materialPdfAnalyzerAllowed, setMaterialPdfAnalyzerAllowed] = useState<boolean>(
    activeConfig?.limits?.materialPdfAnalyzerAllowed ?? false
  );
  const [aiQuestionGeneratorAllowed, setAiQuestionGeneratorAllowed] = useState<boolean>(
    activeConfig?.limits?.aiQuestionGeneratorAllowed ?? false
  );
  const [exportScoreDossierAllowed, setExportScoreDossierAllowed] = useState<boolean>(
    activeConfig?.limits?.exportScoreDossierAllowed ?? true
  );
  const [liveTutorReviewAllowed, setLiveTutorReviewAllowed] = useState<boolean>(
    activeConfig?.limits?.liveTutorReviewAllowed ?? false
  );
  const [prioritySupport, setPrioritySupport] = useState<boolean>(
    activeConfig?.limits?.prioritySupport ?? false
  );
  const [scoreGuarantee, setScoreGuarantee] = useState<string>(
    activeConfig?.limits?.scoreGuarantee || ""
  );

  // Features list
  const [features, setFeatures] = useState<string[]>(activeConfig?.features || []);
  const [newFeatureInput, setNewFeatureInput] = useState<string>("");

  // Omitted Features list
  const [omittedFeatures, setOmittedFeatures] = useState<string[]>(
    activeConfig?.omittedFeatures || []
  );
  const [newOmittedInput, setNewOmittedInput] = useState<string>("");

  // Permissions
  const [permissions, setPermissions] = useState<UserPermissions>(
    activeConfig?.permissions || {
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
    }
  );

  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Synchronize when activeConfig changes
  useEffect(() => {
    if (!activeConfig) return;
    setName(activeConfig.name || "");
    setBadge(activeConfig.badge || "");
    setBadgeColor(activeConfig.badgeColor || "bg-indigo-100 text-indigo-800 border-indigo-300");
    setHighlight(activeConfig.highlight || "");
    setTagline(activeConfig.tagline || "");
    setTargetAudience(activeConfig.targetAudience || "");

    setType(activeConfig.paymentStructure?.type || "recurring_subscription");
    setMonthlyPrice(activeConfig.paymentStructure?.monthlyPrice || 0);
    setAnnualPrice(activeConfig.paymentStructure?.annualPrice || 0);
    setLifetimePrice(activeConfig.paymentStructure?.lifetimePrice);
    setTrialDays(activeConfig.paymentStructure?.trialDays || 0);
    setMoneyBackGuaranteeDays(activeConfig.paymentStructure?.moneyBackGuaranteeDays || 0);
    setBillingIntervals(activeConfig.paymentStructure?.billingIntervals || ["monthly", "annual"]);
    setFinancialAidAvailable(activeConfig.paymentStructure?.financialAidAvailable ?? true);

    setIsDailyUnlimited(activeConfig.limits?.dailyPracticeQuestions === "unlimited");
    setDailyQuestionsCount(
      typeof activeConfig.limits?.dailyPracticeQuestions === "number"
        ? activeConfig.limits.dailyPracticeQuestions
        : 20
    );

    setIsAiTutorUnlimited(activeConfig.limits?.aiTutorDailyQueries === "unlimited");
    setAiTutorQueriesCount(
      typeof activeConfig.limits?.aiTutorDailyQueries === "number"
        ? activeConfig.limits.aiTutorDailyQueries
        : 50
    );

    setFullMockExamsAccess(activeConfig.limits?.fullMockExamsAccess ?? true);
    setMaterialPdfAnalyzerAllowed(activeConfig.limits?.materialPdfAnalyzerAllowed ?? false);
    setAiQuestionGeneratorAllowed(activeConfig.limits?.aiQuestionGeneratorAllowed ?? false);
    setExportScoreDossierAllowed(activeConfig.limits?.exportScoreDossierAllowed ?? true);
    setLiveTutorReviewAllowed(activeConfig.limits?.liveTutorReviewAllowed ?? false);
    setPrioritySupport(activeConfig.limits?.prioritySupport ?? false);
    setScoreGuarantee(activeConfig.limits?.scoreGuarantee || "");

    setFeatures(activeConfig.features || []);
    setOmittedFeatures(activeConfig.omittedFeatures || []);
    setPermissions(activeConfig.permissions);
  }, [activeConfig]);

  // Handlers
  const handleAddFeature = () => {
    if (!newFeatureInput.trim()) return;
    setFeatures((prev) => [...prev, newFeatureInput.trim()]);
    setNewFeatureInput("");
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveFeature = (index: number, direction: "up" | "down") => {
    setFeatures((prev) => {
      const next = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return next;
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const handleAddOmitted = () => {
    if (!newOmittedInput.trim()) return;
    setOmittedFeatures((prev) => [...prev, newOmittedInput.trim()]);
    setNewOmittedInput("");
  };

  const handleRemoveOmitted = (index: number) => {
    setOmittedFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleInterval = (interval: "monthly" | "annual" | "lifetime") => {
    setBillingIntervals((prev) => {
      if (prev.includes(interval)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((i) => i !== interval);
      }
      return [...prev, interval];
    });
  };

  const handleSave = () => {
    if (!activeConfig) return;

    const paymentStructure: StudentTierPaymentStructure = {
      type,
      monthlyPrice: Number(monthlyPrice) || 0,
      annualPrice: Number(annualPrice) || 0,
      lifetimePrice: lifetimePrice !== undefined ? Number(lifetimePrice) || 0 : undefined,
      trialDays: Number(trialDays) || 0,
      moneyBackGuaranteeDays: Number(moneyBackGuaranteeDays) || 0,
      billingIntervals,
      financialAidAvailable,
    };

    const limits: StudentTierLimits = {
      dailyPracticeQuestions: isDailyUnlimited ? "unlimited" : Number(dailyQuestionsCount) || 20,
      aiTutorDailyQueries: isAiTutorUnlimited ? "unlimited" : Number(aiTutorQueriesCount) || 50,
      fullMockExamsAccess,
      materialPdfAnalyzerAllowed,
      aiQuestionGeneratorAllowed,
      exportScoreDossierAllowed,
      liveTutorReviewAllowed,
      prioritySupport,
      scoreGuarantee: scoreGuarantee.trim() ? scoreGuarantee.trim() : null,
    };

    const updatedConfig: StudentTierConfig = {
      ...activeConfig,
      name: name.trim() || activeConfig.name,
      badge: badge.trim() || activeConfig.badge,
      badgeColor,
      highlight: highlight.trim() ? highlight.trim() : undefined,
      tagline: tagline.trim() || activeConfig.tagline,
      targetAudience: targetAudience.trim() || activeConfig.targetAudience,
      paymentStructure,
      limits,
      features,
      omittedFeatures,
      permissions,
    };

    onSavePlan(updatedConfig);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 500);
  };

  if (!isOpen || !activeConfig) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-cyan-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  Edit Plan: {name || activeConfig.name}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border ${badgeColor}`}
                >
                  {badge || activeConfig.badge}
                </span>
                {highlight && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    {highlight}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Tier Key: <span className="text-cyan-400 font-bold">{activeConfig.id}</span> •
                Configure pricing, limits, curriculum privileges & marketing copy
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onReset && (
              <button
                type="button"
                onClick={() => onReset(activeConfig.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 border border-slate-700 transition-all cursor-pointer"
                title="Reset this tier configuration to College Board default"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Defaults</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-950/60 border-b border-cyan-500/20 overflow-x-auto no-scrollbar">
          {[
            { id: "branding", label: "Branding & Copy", icon: Sparkles },
            { id: "pricing", label: "Pricing & Billing", icon: DollarSign },
            { id: "limits", label: "Usage Limits & Guarantees", icon: Sliders },
            { id: "features", label: `Feature Bullets (${features.length})`, icon: Layers },
            { id: "permissions", label: "Role Permissions", icon: Shield },
          ].map((t) => {
            const Icon = t.icon;
            const isSel = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer ${
                  isSel
                    ? "bg-cyan-500 text-black shadow-[0_0_12px_#00f0ff]"
                    : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-cyan-500/20"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* TAB 1: BRANDING & COPY */}
          {activeTab === "branding" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
                    Plan Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Scholar Plus"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-3.5 py-2.5 text-sm text-white font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
                    Short Badge Text
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Plus, Pro, Ivy Elite"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-3.5 py-2.5 text-sm text-white font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
                    Promotional Highlight Banner (Optional)
                  </label>
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) => setHighlight(e.target.value)}
                    placeholder="e.g. MOST POPULAR, TOP 1% ADMISSIONS (leave blank for none)"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-3.5 py-2.5 text-sm text-white font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
                    Badge Theme Preset
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {BADGE_COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setBadgeColor(preset.value)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all text-center truncate cursor-pointer ${
                          badgeColor === preset.value
                            ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900 border-white"
                            : "opacity-70 hover:opacity-100"
                        } ${preset.previewClass}`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
                  Tagline / Core Value Proposition
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Comprehensive Test Bank & Adaptive Curriculum"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-3.5 py-2.5 text-sm text-white font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
                  Target Student Persona & Audience
                </label>
                <textarea
                  rows={2}
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Serious students aiming for a 1400+ score milestone on the Digital SAT"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl p-3 text-sm text-white font-sans"
                />
              </div>

              {/* Live Preview Card */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/20">
                <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                  Live Tier Badge Preview:
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeColor}`}>
                    {badge || "Tier Badge"}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white">{name || "Plan Name"}</h4>
                    <p className="text-xs text-slate-400">{tagline || "Plan tagline preview..."}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRICING & BILLING */}
          {activeTab === "pricing" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
                    Payment Model Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                  >
                    <option value="free">Free / No Charge</option>
                    <option value="recurring_subscription">Recurring Subscription</option>
                    <option value="comprehensive_program">Comprehensive High-Tier Program</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
                    Monthly Price ($ USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono">$</span>
                    <input
                      type="number"
                      min={0}
                      value={monthlyPrice}
                      onChange={(e) => setMonthlyPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-white font-mono"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                    Billed $ {monthlyPrice}/mo
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
                    Annual Price ($ USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono">$</span>
                    <input
                      type="number"
                      min={0}
                      value={annualPrice}
                      onChange={(e) => setAnnualPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-white font-mono"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                    Billed $ {annualPrice}/yr (
                    {annualPrice > 0 ? `$${(annualPrice / 12).toFixed(2)}/mo` : "$0"})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
                    Lifetime Single-Pay Price (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono">$</span>
                    <input
                      type="number"
                      min={0}
                      value={lifetimePrice ?? ""}
                      onChange={(e) =>
                        setLifetimePrice(
                          e.target.value === "" ? undefined : Math.max(0, Number(e.target.value))
                        )
                      }
                      placeholder="e.g. 299 or blank"
                      className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
                    Free Trial Period (Days)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={trialDays}
                    onChange={(e) => setTrialDays(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                    {trialDays > 0 ? `${trialDays}-Day Free Trial Active` : "No free trial"}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
                    Money-Back Guarantee (Days)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={moneyBackGuaranteeDays}
                    onChange={(e) =>
                      setMoneyBackGuaranteeDays(Math.max(0, Number(e.target.value)))
                    }
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                    {moneyBackGuaranteeDays > 0
                      ? `${moneyBackGuaranteeDays}-Day 100% Refund Window`
                      : "No refund guarantee"}
                  </span>
                </div>
              </div>

              {/* Interval toggles & Financial aid */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-2 font-semibold">
                    Supported Checkout Intervals
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {(["monthly", "annual", "lifetime"] as const).map((interval) => (
                      <button
                        key={interval}
                        type="button"
                        onClick={() => toggleInterval(interval)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                          billingIntervals.includes(interval)
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500"
                            : "bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                            billingIntervals.includes(interval)
                              ? "bg-cyan-500 border-cyan-400 text-black"
                              : "border-slate-600"
                          }`}
                        >
                          {billingIntervals.includes(interval) && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="capitalize">{interval}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      College Board / Need-Based Financial Aid Eligible
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Allows eligible students with fee waivers to apply 100% discount codes to this tier
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={financialAidAvailable}
                    onChange={(e) => setFinancialAidAvailable(e.target.checked)}
                    className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIMITS & GUARANTEES */}
          {activeTab === "limits" && (
            <div className="space-y-6">
              {/* Daily Question Limits */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white font-mono">
                      Daily Practice Question Quota
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Number of drills allowed each calendar day
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsDailyUnlimited(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                        isDailyUnlimited
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500"
                          : "bg-slate-900 text-slate-500 border-slate-700"
                      }`}
                    >
                      Unlimited
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDailyUnlimited(false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                        !isDailyUnlimited
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500"
                          : "bg-slate-900 text-slate-500 border-slate-700"
                      }`}
                    >
                      Fixed Limit
                    </button>
                  </div>
                </div>
                {!isDailyUnlimited && (
                  <div className="pt-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        max={1000}
                        value={dailyQuestionsCount}
                        onChange={(e) => setDailyQuestionsCount(Math.max(1, Number(e.target.value)))}
                        className="w-32 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-sm text-white font-mono"
                      />
                      <span className="text-xs text-slate-400 font-mono">
                        Questions per 24-hour cycle
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Tutor Query Limits */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white font-mono">
                      Daily AI Socratic Tutor Queries
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Step-by-step AI question hints & interactive dialogues
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAiTutorUnlimited(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                        isAiTutorUnlimited
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500"
                          : "bg-slate-900 text-slate-500 border-slate-700"
                      }`}
                    >
                      Unlimited
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAiTutorUnlimited(false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                        !isAiTutorUnlimited
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500"
                          : "bg-slate-900 text-slate-500 border-slate-700"
                      }`}
                    >
                      Fixed Limit
                    </button>
                  </div>
                </div>
                {!isAiTutorUnlimited && (
                  <div className="pt-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        value={aiTutorQueriesCount}
                        onChange={(e) => setAiTutorQueriesCount(Math.max(0, Number(e.target.value)))}
                        className="w-32 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-sm text-white font-mono"
                      />
                      <span className="text-xs text-slate-400 font-mono">
                        AI tutor prompts per 24-hour cycle
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Module Feature Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    id: "fullMockExamsAccess",
                    title: "Full Timed 1600-Scale Mocks",
                    desc: "Official digital SAT full-length simulated exam mode",
                    val: fullMockExamsAccess,
                    set: setFullMockExamsAccess,
                  },
                  {
                    id: "materialPdfAnalyzerAllowed",
                    title: "AI Score & Material PDF Analyzer",
                    desc: "Extract diagnostic syllabi from College Board score PDFs",
                    val: materialPdfAnalyzerAllowed,
                    set: setMaterialPdfAnalyzerAllowed,
                  },
                  {
                    id: "aiQuestionGeneratorAllowed",
                    title: "AI Custom Drill Generator",
                    desc: "Synthesize target question clones and trap variants",
                    val: aiQuestionGeneratorAllowed,
                    set: setAiQuestionGeneratorAllowed,
                  },
                  {
                    id: "exportScoreDossierAllowed",
                    title: "Score Dossier PDF Exports",
                    desc: "Official progress reports for counselors and tutors",
                    val: exportScoreDossierAllowed,
                    set: setExportScoreDossierAllowed,
                  },
                  {
                    id: "liveTutorReviewAllowed",
                    title: "Live 1-on-1 Expert Review",
                    desc: "Live video coaching or 24hr human tutor audit hotline",
                    val: liveTutorReviewAllowed,
                    set: setLiveTutorReviewAllowed,
                  },
                  {
                    id: "prioritySupport",
                    title: "24/7 Priority Support",
                    desc: "Expedited ticketing and technical assistance",
                    val: prioritySupport,
                    set: setPrioritySupport,
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      item.val
                        ? "bg-slate-950/80 border-cyan-500/40"
                        : "bg-slate-950/40 border-slate-800"
                    }`}
                  >
                    <div>
                      <h5 className="text-xs font-bold text-white font-mono">{item.title}</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={item.val}
                      onChange={(e) => item.set(e.target.checked)}
                      className="w-5 h-5 accent-cyan-500 rounded cursor-pointer shrink-0 mt-0.5"
                    />
                  </div>
                ))}
              </div>

              {/* Score Improvement Guarantee */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  Official Score Guarantee Label (Optional)
                </label>
                <input
                  type="text"
                  value={scoreGuarantee}
                  onChange={(e) => setScoreGuarantee(e.target.value)}
                  placeholder="e.g. +100 Point Guarantee, 1500+ Score or 100% Refund (or leave blank)"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-sm text-white font-sans"
                />
              </div>
            </div>
          )}

          {/* TAB 4: FEATURES & BULLETS */}
          {activeTab === "features" && (
            <div className="space-y-6">
              {/* Included Features */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Included Features Checklist ({features.length})
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Shown with green checkmark in student checkout
                  </span>
                </div>

                <div className="space-y-2">
                  {features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 group"
                    >
                      <span className="w-5 text-center text-xs font-mono text-slate-500">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => {
                          const updated = [...features];
                          updated[idx] = e.target.value;
                          setFeatures(updated);
                        }}
                        className="flex-1 bg-transparent border-0 text-sm text-white focus:outline-none"
                      />
                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveFeature(idx, "up")}
                          className="p-1 text-slate-400 hover:text-cyan-400 disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === features.length - 1}
                          onClick={() => handleMoveFeature(idx, "down")}
                          className="p-1 text-slate-400 hover:text-cyan-400 disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(idx)}
                          className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new feature input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeatureInput}
                    onChange={(e) => setNewFeatureInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddFeature())}
                    placeholder="Add a new included feature bullet..."
                    className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-sm text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 text-black font-mono font-bold text-xs rounded-xl hover:bg-cyan-400 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              </div>

              {/* Omitted / Locked Features */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white font-mono flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    Omitted / Locked Features ({omittedFeatures.length})
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Shown with lock / cross on lower tiers to encourage upgrades
                  </span>
                </div>

                <div className="space-y-2">
                  {omittedFeatures.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 group"
                    >
                      <span className="w-5 text-center text-xs font-mono text-slate-500">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => {
                          const updated = [...omittedFeatures];
                          updated[idx] = e.target.value;
                          setOmittedFeatures(updated);
                        }}
                        className="flex-1 bg-transparent border-0 text-sm text-slate-300 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveOmitted(idx)}
                        className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new omitted feature */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newOmittedInput}
                    onChange={(e) => setNewOmittedInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddOmitted())}
                    placeholder="Add an omitted feature bullet (e.g. 1-on-1 Live Expert Tutor Sessions)..."
                    className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-sm text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddOmitted}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-slate-300 hover:text-white font-mono font-bold text-xs rounded-xl hover:bg-slate-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PERMISSIONS */}
          {activeTab === "permissions" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 font-mono">
                Configure default system capabilities granted to students assigned to the{" "}
                <span className="text-cyan-400 font-bold">{name}</span> tier:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: "canPracticeAndDrill", label: "Practice & Timed Drills Access" },
                  { key: "canViewStudyPlan", label: "View & Manage Study Roadmaps" },
                  { key: "canAccessQuestionBank", label: "Full Question Bank Browser" },
                  { key: "canExportData", label: "Export Progress Data & PDFs" },
                  { key: "canEditQuestions", label: "Edit Question Bank Content (Tutor/Admin)" },
                  { key: "canManageCurriculum", label: "Manage Curriculum & Formulas" },
                  { key: "canAccessAdminPanel", label: "Admin Console Matrix Access" },
                  { key: "canManageUsersAndRoles", label: "Manage User Accounts & Roles" },
                  { key: "canModifySystemGrading", label: "Modify System Curve & Grading" },
                  { key: "canViewAllStudentReports", label: "View All Student Performance Reports" },
                ].map((perm) => (
                  <div
                    key={perm.key}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800"
                  >
                    <span className="text-xs text-slate-200 font-medium">{perm.label}</span>
                    <input
                      type="checkbox"
                      checked={!!permissions[perm.key as keyof UserPermissions]}
                      onChange={(e) =>
                        setPermissions((prev) => ({
                          ...prev,
                          [perm.key]: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-cyan-500/20 bg-slate-950/80">
          <div className="text-xs font-mono text-slate-400">
            {saveSuccess ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Changes applied & stored successfully!
              </span>
            ) : (
              <span>Modifications instantly reflect across student checkout & billing</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-mono font-bold bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_12px_#00f0ff] transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              Save Plan Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
