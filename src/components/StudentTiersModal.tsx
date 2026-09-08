import React, { useState } from "react";
import {
  StudentTier,
  StudentTierConfig,
  UserProfile,
  UserSubscription,
} from "../types";
import {
  DEFAULT_STUDENT_TIERS,
  DEFAULT_PROMO_CODES,
  PromoCode,
  getStudentTier,
} from "../data/studentTiers";
import {
  Sparkles,
  Check,
  X,
  Zap,
  Shield,
  CreditCard,
  Crown,
  BookOpen,
  BrainCircuit,
  GraduationCap,
  Calendar,
  Lock,
  Tag,
  ArrowRight,
  Receipt,
  HelpCircle,
  Clock,
  Award,
} from "lucide-react";

interface StudentTiersModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile?: UserProfile;
  onUpdateProfileTier: (
    newTier: StudentTier,
    subscription: UserSubscription
  ) => void;
  initialSelectedTier?: StudentTier;
  customTiers?: Record<StudentTier, StudentTierConfig>;
  customPromoCodes?: PromoCode[];
}

export const StudentTiersModal: React.FC<StudentTiersModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onUpdateProfileTier,
  initialSelectedTier,
  customTiers,
  customPromoCodes,
}) => {
  const activeTiers = customTiers || DEFAULT_STUDENT_TIERS;
  const activePromos = customPromoCodes || DEFAULT_PROMO_CODES;

  const [billingInterval, setBillingInterval] = useState<
    "monthly" | "annual" | "lifetime"
  >("annual");
  const [selectedTierId, setSelectedTierId] = useState<StudentTier>(
    initialSelectedTier || currentProfile?.tier || "pro"
  );
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"tiers" | "matrix" | "invoices">(
    "tiers"
  );

  // Checkout form state
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(
    currentProfile?.subscription?.promoCodeApplied || null
  );
  const [promoError, setPromoError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "apple" | "google" | "feewaiver"
  >("card");
  const [cardNumber, setCardNumber] = useState("•••• •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("123");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  if (!isOpen) return null;

  const currentTierConfig = getStudentTier(currentProfile?.tier || "starter", activeTiers);
  const activePlanConfig = activeTiers[selectedTierId] || activeTiers.starter;

  // Calculate pricing with promos
  const calculateFinalPrice = (
    tier: StudentTierConfig,
    interval: "monthly" | "annual" | "lifetime"
  ) => {
    let base = 0;
    if (interval === "monthly") base = tier.paymentStructure.monthlyPrice;
    else if (interval === "annual") base = tier.paymentStructure.annualPrice;
    else if (interval === "lifetime")
      base = tier.paymentStructure.lifetimePrice || tier.paymentStructure.annualPrice;

    if (!appliedPromo) return base;

    const promoObj = activePromos.find(
      (p) => p.code.toUpperCase() === appliedPromo.toUpperCase()
    );
    if (!promoObj) return base;

    if (promoObj.discountType === "percent") {
      const discounted = base * (1 - promoObj.discountValue / 100);
      return Math.max(0, Math.round(discounted));
    } else {
      return Math.max(0, base - promoObj.discountValue);
    }
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    const cleaned = promoCodeInput.trim().toUpperCase();
    const found = activePromos.find((p) => p.code === cleaned);
    if (found) {
      setAppliedPromo(found.code);
      setPromoCodeInput("");
    } else {
      setPromoError("Invalid promotional code or expired voucher.");
    }
  };

  const handleExecuteSubscription = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCheckoutSuccess(true);

      const finalPrice = calculateFinalPrice(activePlanConfig, billingInterval);
      const now = new Date();
      const nextPeriod = new Date();
      if (billingInterval === "monthly") {
        nextPeriod.setMonth(nextPeriod.getMonth() + 1);
      } else if (billingInterval === "annual") {
        nextPeriod.setFullYear(nextPeriod.getFullYear() + 1);
      } else {
        nextPeriod.setFullYear(nextPeriod.getFullYear() + 10);
      }

      const newSub: UserSubscription = {
        tier: selectedTierId,
        status: "active",
        billingInterval,
        currentPeriodStart: now.toISOString().split("T")[0],
        currentPeriodEnd: nextPeriod.toISOString().split("T")[0],
        lastPaymentAmount: finalPrice,
        paymentMethodBrand:
          paymentMethod === "feewaiver"
            ? "Need-Based Fee Waiver"
            : paymentMethod === "apple"
            ? "Apple Pay"
            : paymentMethod === "google"
            ? "Google Pay"
            : "Visa",
        paymentMethodLast4: paymentMethod === "card" ? "4242" : "Online",
        promoCodeApplied: appliedPromo || undefined,
      };

      onUpdateProfileTier(selectedTierId, newSub);

      setTimeout(() => {
        setCheckoutSuccess(false);
        setIsCheckoutOpen(false);
      }, 1800);
    }, 1200);
  };

  return (
    <div
      id="student-tiers-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Digital SAT Student Memberships & Pricing</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Empower Your Prep with Tailored Student Tiers
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Choose the structure that matches your target milestone: from foundational free drills to AI diagnostics and 99th-percentile live coach mentorship.
              </p>
            </div>

            <button
              type="button"
              id="close-student-tiers-modal"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Tier Status Strip */}
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Current Active Plan:</span>
              <span
                className={`font-bold px-2.5 py-0.5 rounded-full border text-[11px] ${currentTierConfig.badgeColor}`}
              >
                {currentTierConfig.name}
              </span>
              {currentProfile.subscription?.billingInterval && (
                <span className="text-slate-400">
                  ({currentProfile.subscription.billingInterval} billing)
                </span>
              )}
            </div>

            {/* Navigation tabs inside modal */}
            <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab("tiers")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "tiers"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Plan Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("matrix")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "matrix"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Feature Matrix
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("invoices")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "invoices"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Billing & Policy
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {activeTab === "tiers" && (
            <div className="space-y-6">
              {/* Billing Cycle Frequency Selector */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Billing Frequency & Savings
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Switch to Annual billing for up to 40% discount + full score improvement guarantee.
                  </div>
                </div>

                <div className="flex items-center p-1 rounded-xl bg-slate-200/80 border border-slate-300/60 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setBillingInterval("monthly")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      billingInterval === "monthly"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingInterval("annual")}
                    className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      billingInterval === "annual"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>Annual</span>
                    <span className="px-1.5 py-0.2 bg-amber-400 text-amber-950 rounded text-[10px] font-extrabold uppercase tracking-tight">
                      Save 40%
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingInterval("lifetime")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      billingInterval === "lifetime"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Lifetime Pass
                  </button>
                </div>
              </div>

              {/* 4 Tier Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(
                  Object.keys(activeTiers) as Array<
                    keyof typeof activeTiers
                  >
                ).map((tierKey) => {
                  const tier = activeTiers[tierKey];
                  const isCurrent = currentProfile?.tier === tier.id;
                  const isSelected = selectedTierId === tier.id;
                  const finalPrice = calculateFinalPrice(tier, billingInterval);

                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTierId(tier.id)}
                      className={`relative flex flex-col justify-between rounded-2xl p-5 border transition-all cursor-pointer ${
                        isSelected
                          ? "ring-2 ring-indigo-600 border-indigo-600 bg-white shadow-lg"
                          : "border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 shadow-2xs"
                      }`}
                    >
                      {/* Highlight Banner if available */}
                      {tier.highlight && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-extrabold tracking-wider shadow-xs uppercase">
                          {tier.highlight}
                        </div>
                      )}

                      <div className="space-y-4">
                        {/* Header */}
                        <div>
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md border ${tier.badgeColor}`}
                            >
                              {tier.badge}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Current Active
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-extrabold text-slate-900 mt-2">
                            {tier.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                            {tier.tagline}
                          </p>
                        </div>

                        {/* Pricing Block */}
                        <div className="py-2 border-y border-slate-100">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-900">
                              ${finalPrice}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              {tier.paymentStructure.type === "free"
                                ? "/ free forever"
                                : billingInterval === "monthly"
                                ? "/ month"
                                : billingInterval === "annual"
                                ? "/ year"
                                : " one-time"}
                            </span>
                          </div>
                          {billingInterval === "annual" &&
                            tier.paymentStructure.annualPrice > 0 && (
                              <div className="text-[10px] font-semibold text-emerald-600 mt-0.5">
                                Equivalent to $
                                {Math.round(
                                  tier.paymentStructure.annualPrice / 12
                                )}
                                /mo billed annually
                              </div>
                            )}
                        </div>

                        {/* Key Feature List */}
                        <div className="space-y-2 text-xs">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Included Access:
                          </div>
                          {(tier.features || []).slice(0, 5).map((f, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2 text-slate-700 text-[11px] leading-tight"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Select / Action Button */}
                      <div className="mt-5 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTierId(tier.id);
                            setIsCheckoutOpen(true);
                          }}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                            isCurrent
                              ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
                              : isSelected
                              ? "bg-indigo-600 text-white hover:bg-indigo-700"
                              : "bg-slate-900 text-white hover:bg-indigo-600"
                          }`}
                        >
                          {isCurrent ? (
                            <span>Manage / View Receipt</span>
                          ) : tier.paymentStructure.type === "free" ? (
                            <span>Switch to Free Starter</span>
                          ) : (
                            <span>
                              Select {tier.name.split(" ")[0]} Plan
                            </span>
                          )}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Guarantee Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between flex-wrap gap-4 text-emerald-950">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-900">
                      College Board Security Standard & 100% Score Guarantee
                    </div>
                    <div className="text-[11px] text-emerald-800 leading-tight">
                      All paid tiers include a 100+ to 150+ point score improvement guarantee or full money-back refund within our guarantee window.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-emerald-800">
                    High School Fee Waiver eligible?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTierId("plus");
                      setPaymentMethod("feewaiver");
                      setIsCheckoutOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    Apply Waiver Code
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "matrix" && (
            /* Comprehensive Tier Comparison Matrix */
            <div className="space-y-4">
              <div className="text-xs text-slate-500">
                Detailed side-by-side feature and permission permissions matrix across all 4 Digital SAT student tiers.
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700">
                      <th className="p-3.5 font-bold">Feature / Permission</th>
                      <th className="p-3.5 font-bold text-center">Free Starter</th>
                      <th className="p-3.5 font-bold text-center">Scholar Plus</th>
                      <th className="p-3.5 font-bold text-center text-indigo-900 bg-indigo-50/50">
                        Mastery Pro
                      </th>
                      <th className="p-3.5 font-bold text-center text-amber-900 bg-amber-50/50">
                        Ivy Elite 1550+
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">
                        Monthly / Annual Pricing
                      </td>
                      <td className="p-3 text-center font-mono">$0</td>
                      <td className="p-3 text-center font-mono">$19 / $149</td>
                      <td className="p-3 text-center font-mono bg-indigo-50/30 font-bold">
                        $49 / $349
                      </td>
                      <td className="p-3 text-center font-mono bg-amber-50/30 font-bold">
                        $129 / $899
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3">Daily Practice Questions</td>
                      <td className="p-3 text-center font-mono">20 / day</td>
                      <td className="p-3 text-center font-mono text-emerald-600 font-bold">
                        Unlimited
                      </td>
                      <td className="p-3 text-center font-mono text-emerald-600 font-bold bg-indigo-50/30">
                        Unlimited
                      </td>
                      <td className="p-3 text-center font-mono text-emerald-600 font-bold bg-amber-50/30">
                        Unlimited
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3">10,000+ Question Bank Hub</td>
                      <td className="p-3 text-center text-slate-300">—</td>
                      <td className="p-3 text-center text-emerald-600">
                        <Check className="w-4 h-4 mx-auto" />
                      </td>
                      <td className="p-3 text-center text-emerald-600 bg-indigo-50/30">
                        <Check className="w-4 h-4 mx-auto" />
                      </td>
                      <td className="p-3 text-center text-emerald-600 bg-amber-50/30">
                        <Check className="w-4 h-4 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3">Dynamic Adaptive Streak Engine</td>
                      <td className="p-3 text-center text-emerald-600">
                        <Check className="w-4 h-4 mx-auto" />
                      </td>
                      <td className="p-3 text-center text-emerald-600">
                        <Check className="w-4 h-4 mx-auto" />
                      </td>
                      <td className="p-3 text-center text-emerald-600 bg-indigo-50/30">
                        <Check className="w-4 h-4 mx-auto" />
                      </td>
                      <td className="p-3 text-center text-emerald-600 bg-amber-50/30">
                        <Check className="w-4 h-4 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3">AI 1-on-1 Socratic Explanations</td>
                      <td className="p-3 text-center font-mono">3 / day</td>
                      <td className="p-3 text-center font-mono">50 / day</td>
                      <td className="p-3 text-center font-mono text-indigo-700 font-bold bg-indigo-50/30">
                        Unlimited
                      </td>
                      <td className="p-3 text-center font-mono text-amber-700 font-bold bg-amber-50/30">
                        Unlimited + Voice
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3">AI Material & Score PDF Analyzer</td>
                      <td className="p-3 text-center text-slate-300">—</td>
                      <td className="p-3 text-center text-slate-300">—</td>
                      <td className="p-3 text-center text-emerald-600 bg-indigo-50/30">
                        <Check className="w-4 h-4 mx-auto" />
                      </td>
                      <td className="p-3 text-center text-emerald-600 bg-amber-50/30">
                        <Check className="w-4 h-4 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3">AI Custom Drill Variant Generator</td>
                      <td className="p-3 text-center text-slate-300">—</td>
                      <td className="p-3 text-center text-slate-300">—</td>
                      <td className="p-3 text-center text-emerald-600 bg-indigo-50/30">
                        <Check className="w-4 h-4 mx-auto" />
                      </td>
                      <td className="p-3 text-center text-emerald-600 bg-amber-50/30">
                        <Check className="w-4 h-4 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3">Vocabulary & Grammar Academy</td>
                      <td className="p-3 text-center text-slate-300">—</td>
                      <td className="p-3 text-center text-emerald-600">
                        <Check className="w-4 h-4 mx-auto" />
                      </td>
                      <td className="p-3 text-center text-emerald-600 bg-indigo-50/30">
                        <Check className="w-4 h-4 mx-auto" />
                      </td>
                      <td className="p-3 text-center text-emerald-600 bg-amber-50/30">
                        <Check className="w-4 h-4 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3">Exportable Counselor Dossier PDF</td>
                      <td className="p-3 text-center text-slate-300">—</td>
                      <td className="p-3 text-center text-emerald-600">
                        <Check className="w-4 h-4 mx-auto" />
                      </td>
                      <td className="p-3 text-center text-emerald-600 bg-indigo-50/30">
                        <Check className="w-4 h-4 mx-auto" />
                      </td>
                      <td className="p-3 text-center text-emerald-600 bg-amber-50/30">
                        <Check className="w-4 h-4 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3">99th-Percentile Hardest Trap Bank</td>
                      <td className="p-3 text-center text-slate-300">—</td>
                      <td className="p-3 text-center text-slate-300">—</td>
                      <td className="p-3 text-center text-slate-300 bg-indigo-50/30">—</td>
                      <td className="p-3 text-center text-emerald-600 bg-amber-50/30">
                        <Check className="w-4 h-4 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3">2x Monthly 1-on-1 Live Video Coaching</td>
                      <td className="p-3 text-center text-slate-300">—</td>
                      <td className="p-3 text-center text-slate-300">—</td>
                      <td className="p-3 text-center text-slate-300 bg-indigo-50/30">—</td>
                      <td className="p-3 text-center text-emerald-600 bg-amber-50/30">
                        <Check className="w-4 h-4 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3">Guaranteed Score Improvement</td>
                      <td className="p-3 text-center text-slate-400">None</td>
                      <td className="p-3 text-center font-semibold text-emerald-700">
                        +100 Points
                      </td>
                      <td className="p-3 text-center font-semibold text-purple-700 bg-indigo-50/30">
                        +150 Points
                      </td>
                      <td className="p-3 text-center font-extrabold text-amber-900 bg-amber-50/30">
                        1500+ or 100% Refund
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "invoices" && (
            /* Billing and Policy Details */
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Receipt className="w-4 h-4 text-indigo-600" />
                    <span>Active Subscription Receipt</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Subscriber:</span>
                      <strong className="text-slate-900">{currentProfile?.name || "Student"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Plan:</span>
                      <strong className="text-indigo-600">{currentTierConfig.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span>{currentProfile.subscription?.paymentMethodBrand || "Visa"} ending in {currentProfile.subscription?.paymentMethodLast4 || "4242"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Period End:</span>
                      <span>{currentProfile.subscription?.currentPeriodEnd || "2027-08-01"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="text-emerald-600 font-bold uppercase">{currentProfile.subscription?.status || "Active"}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <HelpCircle className="w-4 h-4 text-indigo-600" />
                    <span>Refund & Cancellation Policy</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                    <li>Cancel anytime with 1-click in account settings before renewal.</li>
                    <li>14-day to 45-day unconditional money-back satisfaction guarantee.</li>
                    <li>Official score guarantees require completion of at least 4 practice modules.</li>
                    <li>Need-based waivers supported via College Board CSS Profile or Counselor letter.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Checkout Modal Overlay when user clicks 'Select Plan' */}
        {isCheckoutOpen && (
          <div
            id="tier-checkout-overlay"
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Confirm Subscription
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {activePlanConfig.name} • {billingInterval} interval
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {checkoutSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
                    <Check className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    Plan Activated Successfully!
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Your student profile is now upgraded to{" "}
                    <strong>{activePlanConfig.name}</strong>. Enjoy full access to all features!
                  </p>
                </div>
              ) : (
                <>
                  {/* Order Summary */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between font-medium text-slate-600">
                      <span>Plan:</span>
                      <span className="font-bold text-slate-900">
                        {activePlanConfig.name}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium text-slate-600">
                      <span>Billing Interval:</span>
                      <span className="capitalize text-slate-900 font-semibold">
                        {billingInterval}
                      </span>
                    </div>
                    {appliedPromo && (
                      <div className="flex justify-between font-medium text-emerald-600">
                        <span>Promo Code ({appliedPromo}):</span>
                        <span>Discount Applied</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                      <span>Total Due Today:</span>
                      <span className="text-indigo-600">
                        ${calculateFinalPrice(activePlanConfig, billingInterval)}
                      </span>
                    </div>
                  </div>

                  {/* Promo Code Input */}
                  <form onSubmit={handleApplyPromo} className="space-y-1">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="Promo code (e.g. SAT2026, IVYBOUND)"
                          value={promoCodeInput}
                          onChange={(e) => setPromoCodeInput(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600 uppercase"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    {promoError && (
                      <div className="text-[11px] text-rose-600">{promoError}</div>
                    )}
                    {appliedPromo && (
                      <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Voucher applied ({appliedPromo})</span>
                      </div>
                    )}
                  </form>

                  {/* Payment Method Selector */}
                  {activePlanConfig.paymentStructure.type !== "free" && (
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-slate-700">
                        Select Payment Method:
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: "card", label: "Card" },
                          { id: "apple", label: "Apple Pay" },
                          { id: "google", label: "GPay" },
                          { id: "feewaiver", label: "Fee Waiver" },
                        ].map((m) => (
                          <button
                            type="button"
                            key={m.id}
                            onClick={() => setPaymentMethod(m.id as any)}
                            className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center ${
                              paymentMethod === m.id
                                ? "bg-indigo-50 border-indigo-600 text-indigo-900 ring-1 ring-indigo-500"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>

                      {paymentMethod === "card" && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500">
                              Card Number (Mock Sandbox)
                            </label>
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500">
                                Expiration
                              </label>
                              <input
                                type="text"
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500">
                                CVC
                              </label>
                              <input
                                type="text"
                                value={cardCvc}
                                onChange={(e) => setCardCvc(e.target.value)}
                                className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {paymentMethod === "feewaiver" && (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                          <div className="font-bold flex items-center gap-1">
                            <GraduationCap className="w-4 h-4" />
                            <span>College Board Need-Based Fee Waiver</span>
                          </div>
                          <p className="text-[11px] text-amber-800">
                            Enter code <strong>FEEWAIVER100</strong> above or verify with high school school counselor email for 100% complimentary Scholar Plus tier.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Complete Button */}
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleExecuteSubscription}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span>Processing Secure Activation...</span>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>
                          Confirm & Activate {activePlanConfig.name} ($
                          {calculateFinalPrice(activePlanConfig, billingInterval)})
                        </span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
