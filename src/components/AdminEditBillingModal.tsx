import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Receipt,
  DollarSign,
  Calendar,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Plus,
  RefreshCw,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Tag,
  Check,
  X,
  ChevronDown,
  Sparkles,
  Award,
  ExternalLink,
  Percent,
} from "lucide-react";
import {
  UserProfile,
  UserSubscription,
  StudentTier,
  StudentTierConfig,
  BillingInvoice,
  BillingAddress,
} from "../types";
import {
  DEFAULT_STUDENT_TIERS,
  getStudentTier,
} from "../data/studentTiers";
import { getDefaultPermissions, deduplicateProfiles } from "../data/defaultProfiles";

interface AdminEditBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentProfile: UserProfile | null;
  allProfiles: UserProfile[];
  onSaveBilling: (updatedProfile: UserProfile, changeSummary: string) => void;
  onSwitchStudent: (studentId: string) => void;
  customTiers?: Record<StudentTier, StudentTierConfig>;
}

const PAYMENT_METHODS = [
  "Visa",
  "Mastercard",
  "American Express",
  "Discover",
  "PayPal",
  "Apple Pay",
  "Google Pay",
  "Bank Wire / ACH",
  "School District PO",
  "Free Tier Voucher",
];

export const AdminEditBillingModal: React.FC<AdminEditBillingModalProps> = ({
  isOpen,
  onClose,
  studentProfile,
  allProfiles,
  onSaveBilling,
  onSwitchStudent,
  customTiers,
}) => {
  const activeTiers = customTiers || DEFAULT_STUDENT_TIERS;
  const [activeTab, setActiveTab] = useState<
    "subscription" | "payment" | "contact" | "financial_aid" | "invoices"
  >("subscription");

  // Form State
  const sub = studentProfile?.subscription;
  const [tier, setTier] = useState<StudentTier>(studentProfile?.tier || sub?.tier || "starter");
  const [status, setStatus] = useState<"active" | "trialing" | "past_due" | "canceled">(
    sub?.status || "active"
  );
  const [billingInterval, setBillingInterval] = useState<"monthly" | "annual" | "lifetime">(
    sub?.billingInterval || "annual"
  );
  const [currentPeriodStart, setCurrentPeriodStart] = useState<string>(
    sub?.currentPeriodStart || new Date().toISOString().split("T")[0]
  );
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string>(
    sub?.currentPeriodEnd || "2027-08-01"
  );
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState<boolean>(
    !!sub?.cancelAtPeriodEnd
  );

  // Payment method
  const [paymentMethodBrand, setPaymentMethodBrand] = useState<string>(
    sub?.paymentMethodBrand || "Visa"
  );
  const [paymentMethodLast4, setPaymentMethodLast4] = useState<string>(
    sub?.paymentMethodLast4 || "4242"
  );
  const [paymentMethodExpiry, setPaymentMethodExpiry] = useState<string>(
    sub?.paymentMethodExpiry || "12/28"
  );
  const [lastPaymentAmount, setLastPaymentAmount] = useState<number>(
    sub?.lastPaymentAmount ?? (tier === "pro" ? 349 : tier === "plus" ? 149 : tier === "elite" ? 899 : 0)
  );
  const [amountPaid, setAmountPaid] = useState<number>(
    sub?.amountPaid ?? (sub?.lastPaymentAmount ?? 0)
  );
  const [promoCodeApplied, setPromoCodeApplied] = useState<string>(
    sub?.promoCodeApplied || ""
  );
  const [discountPercent, setDiscountPercent] = useState<number>(
    sub?.discountPercent || 0
  );

  // Contact & Invoicing
  const [billingName, setBillingName] = useState<string>(
    sub?.billingName || studentProfile?.name || ""
  );
  const [billingEmail, setBillingEmail] = useState<string>(
    sub?.billingEmail || studentProfile?.email || ""
  );
  const [billingPhone, setBillingPhone] = useState<string>(
    sub?.billingPhone || studentProfile?.phoneNumber || ""
  );
  const [line1, setLine1] = useState<string>(sub?.billingAddress?.line1 || "");
  const [line2, setLine2] = useState<string>(sub?.billingAddress?.line2 || "");
  const [city, setCity] = useState<string>(sub?.billingAddress?.city || "");
  const [stateCode, setStateCode] = useState<string>(sub?.billingAddress?.state || "");
  const [postalCode, setPostalCode] = useState<string>(sub?.billingAddress?.postalCode || "");
  const [country, setCountry] = useState<string>(
    sub?.billingAddress?.country || "United States"
  );
  const [taxId, setTaxId] = useState<string>(sub?.taxId || "");

  // Financial Aid & Notes
  const [financialAidStatus, setFinancialAidStatus] = useState<
    "none" | "applied" | "approved_50" | "approved_full" | "denied"
  >(sub?.financialAidStatus || "none");
  const [scholarshipNote, setScholarshipNote] = useState<string>(
    sub?.scholarshipNote || ""
  );
  const [adminBillingNotes, setAdminBillingNotes] = useState<string>(
    sub?.adminBillingNotes || ""
  );

  // Invoices list
  const [invoices, setInvoices] = useState<BillingInvoice[]>(
    sub?.invoices || [
      {
        id: `inv-${Date.now()}-1`,
        invoiceNumber: `INV-2026-00${Math.floor(100 + Math.random() * 900)}`,
        date: sub?.currentPeriodStart || new Date().toISOString().split("T")[0],
        amount: sub?.lastPaymentAmount || 0,
        status: "paid",
        description: `${getStudentTier(tier).name} Membership (${billingInterval})`,
        paymentMethod: `${sub?.paymentMethodBrand || "Visa"} ending in ${sub?.paymentMethodLast4 || "4242"}`,
        billingName: sub?.billingName || studentProfile?.name || "Student",
      },
    ]
  );

  // New invoice state
  const [showAddInvoice, setShowAddInvoice] = useState<boolean>(false);
  const [newInvNumber, setNewInvNumber] = useState<string>(
    `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [newInvAmount, setNewInvAmount] = useState<number>(49);
  const [newInvDate, setNewInvDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [newInvStatus, setNewInvStatus] = useState<"paid" | "pending" | "refunded">("paid");
  const [newInvDesc, setNewInvDesc] = useState<string>("Official Digital SAT Prep Tuition");
  const [newInvMethod, setNewInvMethod] = useState<string>("Visa ending in 4242");

  // Receipt preview modal state
  const [viewingReceipt, setViewingReceipt] = useState<BillingInvoice | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Sync state whenever studentProfile changes
  useEffect(() => {
    if (!studentProfile) return;
    const currentSub = studentProfile.subscription;
    const currentTier = studentProfile.tier || currentSub?.tier || "starter";
    setTier(currentTier);
    setStatus(currentSub?.status || "active");
    setBillingInterval(currentSub?.billingInterval || "annual");
    setCurrentPeriodStart(
      currentSub?.currentPeriodStart || new Date().toISOString().split("T")[0]
    );
    setCurrentPeriodEnd(currentSub?.currentPeriodEnd || "2027-08-01");
    setCancelAtPeriodEnd(!!currentSub?.cancelAtPeriodEnd);
    setPaymentMethodBrand(currentSub?.paymentMethodBrand || "Visa");
    setPaymentMethodLast4(currentSub?.paymentMethodLast4 || "4242");
    setPaymentMethodExpiry(currentSub?.paymentMethodExpiry || "12/28");
    setLastPaymentAmount(
      currentSub?.lastPaymentAmount ??
        (currentTier === "pro" ? 349 : currentTier === "plus" ? 149 : currentTier === "elite" ? 899 : 0)
    );
    setAmountPaid(currentSub?.amountPaid ?? (currentSub?.lastPaymentAmount ?? 0));
    setPromoCodeApplied(currentSub?.promoCodeApplied || "");
    setDiscountPercent(currentSub?.discountPercent || 0);
    setBillingName(currentSub?.billingName || studentProfile.name);
    setBillingEmail(currentSub?.billingEmail || studentProfile.email);
    setBillingPhone(currentSub?.billingPhone || studentProfile.phoneNumber || "");
    setLine1(currentSub?.billingAddress?.line1 || "");
    setLine2(currentSub?.billingAddress?.line2 || "");
    setCity(currentSub?.billingAddress?.city || "");
    setStateCode(currentSub?.billingAddress?.state || "");
    setPostalCode(currentSub?.billingAddress?.postalCode || "");
    setCountry(currentSub?.billingAddress?.country || "United States");
    setTaxId(currentSub?.taxId || "");
    setFinancialAidStatus(currentSub?.financialAidStatus || "none");
    setScholarshipNote(currentSub?.scholarshipNote || "");
    setAdminBillingNotes(currentSub?.adminBillingNotes || "");
    setInvoices(
      currentSub?.invoices || [
        {
          id: `inv-${Date.now()}-1`,
          invoiceNumber: `INV-2026-00${Math.floor(100 + Math.random() * 900)}`,
          date: currentSub?.currentPeriodStart || new Date().toISOString().split("T")[0],
          amount: currentSub?.lastPaymentAmount || 0,
          status: "paid",
          description: `${getStudentTier(currentTier).name} Access (${currentSub?.billingInterval || "annual"})`,
          paymentMethod: `${currentSub?.paymentMethodBrand || "Visa"} ending in ${currentSub?.paymentMethodLast4 || "4242"}`,
          billingName: currentSub?.billingName || studentProfile.name,
        },
      ]
    );
    setSaveSuccess(false);
  }, [studentProfile]);

  // Quick preset actions
  const handleExtendDays = (days: number) => {
    try {
      const baseDate = new Date(currentPeriodEnd);
      baseDate.setDate(baseDate.getDate() + days);
      setCurrentPeriodEnd(baseDate.toISOString().split("T")[0]);
    } catch {
      const now = new Date();
      now.setDate(now.getDate() + days);
      setCurrentPeriodEnd(now.toISOString().split("T")[0]);
    }
  };

  const handleApplyScholarship = (type: "50" | "100") => {
    if (type === "100") {
      setTier("pro");
      setFinancialAidStatus("approved_full");
      setDiscountPercent(100);
      setPromoCodeApplied("FULL_SCHOLARSHIP_WAIVER");
      setLastPaymentAmount(0);
      setPaymentMethodBrand("Free Tier Voucher");
      setPaymentMethodLast4("0000");
      setStatus("active");
      setScholarshipNote("100% Need-Based Academic Scholarship authorized by Admin Vance.");
    } else {
      setFinancialAidStatus("approved_50");
      setDiscountPercent(50);
      setPromoCodeApplied("NEED_AID_50");
      setLastPaymentAmount(Math.round(lastPaymentAmount * 0.5));
      setScholarshipNote("50% Educational Assistance grant approved.");
    }
  };

  const handleAddInvoiceSubmit = () => {
    if (!newInvNumber.trim() || newInvAmount < 0) return;
    const inv: BillingInvoice = {
      id: `inv-custom-${Date.now()}`,
      invoiceNumber: newInvNumber.trim(),
      date: newInvDate,
      amount: Number(newInvAmount),
      status: newInvStatus,
      description: newInvDesc.trim() || "SAT Prep Program Tuition",
      paymentMethod: newInvMethod.trim() || `${paymentMethodBrand} ending in ${paymentMethodLast4}`,
      billingName: billingName.trim() || studentProfile.name,
    };
    setInvoices((prev) => [inv, ...prev]);
    setShowAddInvoice(false);
    setNewInvNumber(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleDeleteInvoice = (invId: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== invId));
  };

  const handleToggleInvoiceStatus = (invId: string) => {
    setInvoices((prev) =>
      prev.map((i) => {
        if (i.id !== invId) return i;
        const nextStatus = i.status === "paid" ? "refunded" : i.status === "refunded" ? "pending" : "paid";
        return { ...i, status: nextStatus };
      })
    );
  };

  const handleSave = () => {
    const tierConfig = getStudentTier(tier);

    const updatedBillingAddress: BillingAddress = {
      line1: line1.trim() || undefined,
      line2: line2.trim() || undefined,
      city: city.trim() || undefined,
      state: stateCode.trim() || undefined,
      postalCode: postalCode.trim() || undefined,
      country: country.trim() || undefined,
    };

    const updatedSubscription: UserSubscription = {
      tier,
      status,
      billingInterval,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      amountPaid: Number(amountPaid),
      lastPaymentAmount: Number(lastPaymentAmount),
      currency: "USD",
      paymentMethodBrand,
      paymentMethodLast4: paymentMethodLast4.trim() || "4242",
      paymentMethodExpiry: paymentMethodExpiry.trim() || "12/28",
      promoCodeApplied: promoCodeApplied.trim() || undefined,
      discountPercent: Number(discountPercent),
      billingName: billingName.trim() || studentProfile.name,
      billingEmail: billingEmail.trim() || studentProfile.email,
      billingPhone: billingPhone.trim() || undefined,
      billingAddress: updatedBillingAddress,
      taxId: taxId.trim() || undefined,
      financialAidStatus,
      scholarshipNote: scholarshipNote.trim() || undefined,
      adminBillingNotes: adminBillingNotes.trim() || undefined,
      invoices,
    };

    const updatedProfile: UserProfile = {
      ...studentProfile,
      tier,
      subscription: updatedSubscription,
      // Update permissions in lockstep if tier changed
      permissions: {
        ...(studentProfile.permissions || getDefaultPermissions(studentProfile.role)),
        ...tierConfig.permissions,
      },
    };

    const summary = `Updated billing for ${studentProfile.name}: Tier=${tierConfig.name}, Status=${status}, EndDate=${currentPeriodEnd}, Method=${paymentMethodBrand} *${paymentMethodLast4}, LastPaid=$${lastPaymentAmount}`;
    onSaveBilling(updatedProfile, summary);
    setSaveSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  if (!isOpen || !studentProfile) {
    return null;
  }

  const tierObj = getStudentTier(tier);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* MODAL HEADER */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-indigo-400">
                  Admin Billing & Invoicing Console
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-900/80 text-indigo-200 font-mono">
                  RBAC Level 4
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Manage Billing:</span>
                <span className="text-indigo-200 underline decoration-indigo-500/50 underline-offset-4">
                  {studentProfile.name}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick student switcher dropdown */}
            <div className="relative">
              <select
                value={studentProfile.id}
                onChange={(e) => onSwitchStudent(e.target.value)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer max-w-[160px] sm:max-w-[200px] truncate"
              >
                {deduplicateProfiles(allProfiles).map((p, idx) => (
                  <option key={`billing-modal-user-${p.id}-${idx}`} value={p.id}>
                    {p.name} ({p.role})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close billing modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOP STATUS BAR & QUICK METRICS */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Active Tier:</span>
              <span className={`font-bold px-2 py-0.5 rounded-md border text-[11px] ${tierObj.badgeColor}`}>
                {tierObj.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Status:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-md uppercase text-[10px] ${
                  status === "active"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : status === "trialing"
                    ? "bg-blue-100 text-blue-800 border border-blue-300"
                    : status === "past_due"
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-slate-200 text-slate-700 border border-slate-300"
                }`}
              >
                {status.replace("_", " ")}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>Next Renewal:</span>
              <span className="font-bold text-slate-800">{currentPeriodEnd}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Quick Extend:</span>
            <button
              type="button"
              onClick={() => handleExtendDays(14)}
              className="px-2 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-indigo-600 rounded-lg font-bold text-[11px] transition-colors"
            >
              +14 Days
            </button>
            <button
              type="button"
              onClick={() => handleExtendDays(30)}
              className="px-2 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-indigo-600 rounded-lg font-bold text-[11px] transition-colors"
            >
              +30 Days
            </button>
            <button
              type="button"
              onClick={() => handleExtendDays(365)}
              className="px-2 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-indigo-600 rounded-lg font-bold text-[11px] transition-colors"
            >
              +1 Year
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-white overflow-x-auto no-scrollbar">
          {[
            { id: "subscription", label: "Plan & Tier", icon: Award },
            { id: "payment", label: "Payment & Rates", icon: DollarSign },
            { id: "contact", label: "Billing Contact & Address", icon: MapPin },
            { id: "financial_aid", label: "Financial Aid & Notes", icon: Shield },
            { id: "invoices", label: `Ledger & Invoices (${invoices.length})`, icon: Receipt },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 shrink-0 cursor-pointer ${
                  isSel
                    ? "border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-xl"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-xl"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          {/* TAB 1: SUBSCRIPTION & TIER */}
          {activeTab === "subscription" && (
            <div className="space-y-6">
              {/* Select Tier Cards */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  Student Subscription Tier Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(Object.keys(activeTiers) as StudentTier[]).map((tKey) => {
                    const t = activeTiers[tKey];
                    const isSelected = tier === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => {
                          setTier(t.id);
                          if (t.id === "starter") {
                            setLastPaymentAmount(0);
                            setPaymentMethodBrand("Free Tier Voucher");
                          } else {
                            const expectedPrice =
                              billingInterval === "annual"
                                ? t.paymentStructure.annualPrice
                                : t.paymentStructure.monthlyPrice;
                            setLastPaymentAmount(expectedPrice);
                          }
                        }}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-400 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${t.badgeColor}`}>
                              {t.name}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                            )}
                          </div>
                          <div className="text-xs font-bold text-slate-900 line-clamp-1">
                            {t.tagline}
                          </div>
                          <div className="mt-2 text-sm font-black text-indigo-950 font-mono">
                            {t.paymentStructure.type === "free"
                              ? "$0 / Free"
                              : billingInterval === "annual"
                              ? `$${t.paymentStructure.annualPrice}/yr`
                              : `$${t.paymentStructure.monthlyPrice}/mo`}
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 line-clamp-2">
                          {t.limits.scoreGuarantee || "Essential test battery"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status & Billing Interval */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Subscription Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="active">Active (Full Access)</option>
                    <option value="trialing">Trialing (Evaluation Period)</option>
                    <option value="past_due">Past Due (Payment Retrying)</option>
                    <option value="canceled">Canceled (Terminated at Period End)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Billing Interval Frequency
                  </label>
                  <select
                    value={billingInterval}
                    onChange={(e) => setBillingInterval(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="monthly">Monthly Recurring (30-day Cycle)</option>
                    <option value="annual">Annual Recurring (12-month Term)</option>
                    <option value="lifetime">Lifetime Unlimited Access</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Auto-Renewal Control
                  </label>
                  <div
                    onClick={() => setCancelAtPeriodEnd(!cancelAtPeriodEnd)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl border cursor-pointer select-none transition-colors ${
                      cancelAtPeriodEnd
                        ? "bg-rose-50 border-rose-300 text-rose-800"
                        : "bg-emerald-50 border-emerald-300 text-emerald-800"
                    }`}
                  >
                    <span className="text-xs font-bold">
                      {cancelAtPeriodEnd ? "Cancels at Term End" : "Auto-Renew Active"}
                    </span>
                    <input
                      type="checkbox"
                      checked={!cancelAtPeriodEnd}
                      readOnly
                      className="w-4 h-4 accent-emerald-600 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Term Dates */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Subscription Term Windows & Dates</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Current Period Start Date
                    </label>
                    <input
                      type="date"
                      value={currentPeriodStart}
                      onChange={(e) => setCurrentPeriodStart(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Current Period End / Renewal Expiration Date
                    </label>
                    <input
                      type="date"
                      value={currentPeriodEnd}
                      onChange={(e) => setCurrentPeriodEnd(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PAYMENT & RATES */}
          {activeTab === "payment" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Payment Method Brand
                  </label>
                  <select
                    value={paymentMethodBrand}
                    onChange={(e) => setPaymentMethodBrand(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm} value={pm}>
                        {pm}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Card / Account Last 4 Digits
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={paymentMethodLast4}
                    onChange={(e) => setPaymentMethodLast4(e.target.value.replace(/\D/g, ""))}
                    placeholder="4242"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Expiration Date (MM/YY)
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    value={paymentMethodExpiry}
                    onChange={(e) => setPaymentMethodExpiry(e.target.value)}
                    placeholder="12/28"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Amounts & Currency */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Tuition Charges & Revenue Record (USD)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Last Payment Amount ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={lastPaymentAmount}
                        onChange={(e) => setLastPaymentAmount(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Lifetime Cumulative Volume ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Promo Code Applied
                    </label>
                    <div className="relative">
                      <Tag className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={promoCodeApplied}
                        onChange={(e) => setPromoCodeApplied(e.target.value.toUpperCase())}
                        placeholder="SAT2026"
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-indigo-500 uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Discount Percentage (%)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BILLING CONTACT & ADDRESS */}
          {activeTab === "contact" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Billing Contact Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={billingName}
                      onChange={(e) => setBillingName(e.target.value)}
                      placeholder="Payer or Parent full name"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Billing Email (Receipts)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      value={billingEmail}
                      onChange={(e) => setBillingEmail(e.target.value)}
                      placeholder="billing@domain.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Billing Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={billingPhone}
                      onChange={(e) => setBillingPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Street Address */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  <span>Physical Address & Tax Identification</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Street Address Line 1
                    </label>
                    <input
                      type="text"
                      value={line1}
                      onChange={(e) => setLine1(e.target.value)}
                      placeholder="123 Academic Way"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Apartment / Suite / Unit (Optional)
                    </label>
                    <input
                      type="text"
                      value={line2}
                      onChange={(e) => setLine2(e.target.value)}
                      placeholder="Suite 4B"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Boston"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      State / Province
                    </label>
                    <input
                      type="text"
                      value={stateCode}
                      onChange={(e) => setStateCode(e.target.value)}
                      placeholder="MA"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Postal / ZIP Code
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="02138"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="United States"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Tax / VAT / EIN Registration (Optional)
                    </label>
                    <input
                      type="text"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      placeholder="US-12345678"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FINANCIAL AID & ADMIN NOTES */}
          {activeTab === "financial_aid" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Financial Aid Eligibility Status
                  </label>
                  <select
                    value={financialAidStatus}
                    onChange={(e) => setFinancialAidStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="none">None / Standard Tuition</option>
                    <option value="applied">Application Submitted & Pending</option>
                    <option value="approved_50">Approved - 50% Need-Based Grant</option>
                    <option value="approved_full">Approved - 100% Full Fee Waiver</option>
                    <option value="denied">Application Denied / Reverted</option>
                  </select>
                </div>

                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyScholarship("50")}
                    className="flex-1 py-2.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Percent className="w-3.5 h-3.5 text-amber-600" />
                    <span>Quick Grant 50%</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyScholarship("100")}
                    className="flex-1 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Full Waiver (Pro)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Scholarship & Institutional Sponsor Details
                </label>
                <input
                  type="text"
                  value={scholarshipNote}
                  onChange={(e) => setScholarshipNote(e.target.value)}
                  placeholder="e.g. Title 1 District Grant, QuestBridge Cohort, National Merit Finalist stipend"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confidential Admin Billing Notes (Internal Staff Only)
                </label>
                <textarea
                  rows={4}
                  value={adminBillingNotes}
                  onChange={(e) => setAdminBillingNotes(e.target.value)}
                  placeholder="Record internal customer service logs, invoice exemptions, special payment arrangements, or parent communication history..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* TAB 5: LEDGER & INVOICES */}
          {activeTab === "invoices" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Invoices & Payment Records</h3>
                  <p className="text-xs text-slate-500">
                    Official ledger of all charges, receipts, and refunds for this account.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddInvoice(!showAddInvoice)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record Invoice / Payment</span>
                </button>
              </div>

              {/* Inline Add Invoice Form */}
              {showAddInvoice && (
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3">
                  <div className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                    Add Transaction to Student Ledger
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Invoice / Receipt #
                      </label>
                      <input
                        type="text"
                        value={newInvNumber}
                        onChange={(e) => setNewInvNumber(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Amount ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newInvAmount}
                        onChange={(e) => setNewInvAmount(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Transaction Date
                      </label>
                      <input
                        type="date"
                        value={newInvDate}
                        onChange={(e) => setNewInvDate(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Line Item Description
                      </label>
                      <input
                        type="text"
                        value={newInvDesc}
                        onChange={(e) => setNewInvDesc(e.target.value)}
                        placeholder="e.g. Mastery Pro Annual Tuition"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Payment Status
                      </label>
                      <select
                        value={newInvStatus}
                        onChange={(e) => setNewInvStatus(e.target.value as any)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                      >
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddInvoice(false)}
                      className="px-3 py-1 text-xs text-slate-500 hover:text-slate-800 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddInvoiceSubmit}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold"
                    >
                      Save Transaction
                    </button>
                  </div>
                </div>
              )}

              {/* Invoices Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Invoice #</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-slate-400">
                          No transactions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                            {inv.invoiceNumber}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{inv.date}</td>
                          <td className="py-2.5 px-3 text-slate-700 max-w-[200px] truncate">
                            {inv.description}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-black text-slate-900">
                            ${inv.amount}
                          </td>
                          <td className="py-2.5 px-3">
                            <button
                              type="button"
                              onClick={() => handleToggleInvoiceStatus(inv.id)}
                              title="Click to toggle status"
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer ${
                                inv.status === "paid"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : inv.status === "pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {inv.status}
                            </button>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setViewingReceipt(inv)}
                                className="p-1 rounded text-indigo-600 hover:bg-indigo-50"
                                title="View Receipt"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteInvoice(inv.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <Check className="w-3.5 h-3.5" /> Saved changes!
              </span>
            )}
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Changes sync immediately to student access and the audit log.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all shadow-md hover:shadow-lg"
            >
              <Check className="w-4 h-4" />
              <span>Save Billing Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* RECEIPT VIEW MODAL */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <div className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">
                  Official SAT Prep Receipt
                </div>
                <h4 className="text-base font-black text-slate-900">{viewingReceipt.invoiceNumber}</h4>
              </div>
              <button
                onClick={() => setViewingReceipt(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Payer Name:</span>
                <span className="font-bold">{viewingReceipt.billingName || studentProfile.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Date:</span>
                <span className="font-bold">{viewingReceipt.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Description:</span>
                <span className="font-bold">{viewingReceipt.description}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Method:</span>
                <span className="font-bold">{viewingReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-sm">
                <span className="font-bold text-slate-900">Total Paid:</span>
                <span className="font-black text-indigo-600 font-mono">${viewingReceipt.amount}.00 USD</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold uppercase text-emerald-600">{viewingReceipt.status}</span>
              </div>
            </div>

            <button
              onClick={() => setViewingReceipt(null)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
