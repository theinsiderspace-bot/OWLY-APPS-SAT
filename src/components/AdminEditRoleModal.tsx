import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  GraduationCap,
  BookOpen,
  User,
  CheckCircle2,
  X,
  Lock,
  Sparkles,
  Check,
  AlertTriangle,
  Layers,
  Award,
  KeyRound,
} from "lucide-react";
import { UserProfile, UserRole, UserPermissions } from "../types";
import { ROLE_DEFINITIONS } from "../data/defaultProfiles";

interface AdminEditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProfile: UserProfile;
  onSaveRole: (updatedProfile: UserProfile, summary: string) => void;
}

export const AdminEditRoleModal: React.FC<AdminEditRoleModalProps> = ({
  isOpen,
  onClose,
  targetProfile,
  onSaveRole,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(targetProfile.role);
  const [permissions, setPermissions] = useState<UserPermissions>(() => {
    return (
      targetProfile.permissions || {
        canPracticeAndDrill: true,
        canViewStudyPlan: true,
        canAccessQuestionBank: true,
        canEditQuestions: targetProfile.role === "admin" || targetProfile.role === "tutor",
        canManageCurriculum: targetProfile.role === "admin" || targetProfile.role === "tutor",
        canAccessAdminPanel: targetProfile.role === "admin",
        canManageUsersAndRoles: targetProfile.role === "admin",
        canModifySystemGrading: targetProfile.role === "admin",
        canViewAllStudentReports: targetProfile.role === "admin" || targetProfile.role === "tutor",
        canExportData: true,
      }
    );
  });
  const [adminNotes, setAdminNotes] = useState<string>("");

  useEffect(() => {
    if (targetProfile) {
      setSelectedRole(targetProfile.role);
      const isAdm = targetProfile.role === "admin";
      const isTut = targetProfile.role === "tutor";
      setPermissions(
        targetProfile.permissions || {
          canPracticeAndDrill: true,
          canViewStudyPlan: true,
          canAccessQuestionBank: true,
          canEditQuestions: isAdm || isTut,
          canManageCurriculum: isAdm || isTut,
          canAccessAdminPanel: isAdm,
          canManageUsersAndRoles: isAdm,
          canModifySystemGrading: isAdm,
          canViewAllStudentReports: isAdm || isTut,
          canExportData: true,
        }
      );
    }
  }, [targetProfile]);

  if (!isOpen || !targetProfile) return null;

  const handleRoleSelection = (newRole: UserRole) => {
    setSelectedRole(newRole);
    if (newRole === "admin") {
      setPermissions({
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
      });
    } else if (newRole === "tutor") {
      setPermissions({
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
      });
    } else if (newRole === "guest") {
      setPermissions({
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
      });
    } else {
      // student
      setPermissions({
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
      });
    }
  };

  const handleTogglePerm = (key: keyof UserPermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const oldRole = targetProfile.role;
    const isPromotedToAdmin = oldRole !== "admin" && selectedRole === "admin";
    const isDemotedFromAdmin = oldRole === "admin" && selectedRole !== "admin";

    const updatedProfile: UserProfile = {
      ...targetProfile,
      role: selectedRole,
      permissions,
    };

    let summary = `Updated status for ${targetProfile.name} from ${oldRole.toUpperCase()} to ${selectedRole.toUpperCase()}.`;
    if (isPromotedToAdmin) {
      summary = `PROMOTED user ${targetProfile.name} (${targetProfile.email}) from ${oldRole.toUpperCase()} to MASTER ADMIN. Granted Core Controller access.`;
    } else if (isDemotedFromAdmin) {
      summary = `Changed role of ${targetProfile.name} (${targetProfile.email}) from ADMIN to ${selectedRole.toUpperCase()}.`;
    }

    if (adminNotes.trim()) {
      summary += ` Note: ${adminNotes.trim()}`;
    }

    onSaveRole(updatedProfile, summary);
    onClose();
  };

  const roleList: UserRole[] = ["student", "admin", "tutor", "guest"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl ${targetProfile.avatarColor} text-white font-black text-base flex items-center justify-center shadow-sm`}
            >
              {targetProfile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">{targetProfile.name}</h3>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    ROLE_DEFINITIONS[targetProfile.role]?.badgeColor || "bg-slate-800 text-slate-200"
                  }`}
                >
                  Current: {ROLE_DEFINITIONS[targetProfile.role]?.badge || targetProfile.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">{targetProfile.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status / Role Selection Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Select Account Status / Role
              </label>
              <span className="text-[11px] text-slate-400">Click to switch status</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roleList.map((r) => {
                const info = ROLE_DEFINITIONS[r];
                const isSelected = selectedRole === r;
                const isCurrent = targetProfile.role === r;

                return (
                  <div
                    key={r}
                    onClick={() => handleRoleSelection(r)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? r === "admin"
                          ? "border-amber-500 bg-amber-50/70 shadow-sm ring-1 ring-amber-400"
                          : "border-indigo-600 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-400"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          {r === "admin" ? (
                            <ShieldCheck className="w-4 h-4 text-amber-600" />
                          ) : r === "student" ? (
                            <GraduationCap className="w-4 h-4 text-indigo-600" />
                          ) : r === "tutor" ? (
                            <BookOpen className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <User className="w-4 h-4 text-slate-600" />
                          )}
                          <span className="text-xs font-black text-slate-900">{info.title}</span>
                        </div>
                        {isSelected ? (
                          <CheckCircle2
                            className={`w-4 h-4 ${
                              r === "admin" ? "text-amber-600" : "text-indigo-600"
                            }`}
                          />
                        ) : isCurrent ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                            Current
                          </span>
                        ) : null}
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed">{info.description}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${info.badgeColor}`}
                      >
                        {info.badge}
                      </span>
                      {r === "admin" && (
                        <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded">
                          Root Authority
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Role Transition Notice */}
          {targetProfile.role === "student" && selectedRole === "admin" && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 animate-in fade-in">
              <KeyRound className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-extrabold text-amber-950">Promoting Student to Master Administrator</div>
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  This student will immediately gain full administrative privileges, including access to Core Controller,
                  question authoring, grading system controls, and user management.
                </p>
              </div>
            </div>
          )}

          {targetProfile.role === "admin" && selectedRole === "student" && (
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-start gap-3 animate-in fade-in">
              <GraduationCap className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-extrabold text-indigo-950">Reverting Administrator to Student Status</div>
                <p className="text-indigo-800 text-[11px] leading-relaxed">
                  Administrative and Core Controller privileges will be revoked. The user will be assigned standard SAT learner
                  permissions and access their student study roadmap.
                </p>
              </div>
            </div>
          )}

          {/* Granular Permission Matrix */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                Active System Permissions for {selectedRole.toUpperCase()}
              </label>
              <span className="text-[10px] text-slate-400">Auto-configured per role</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              {[
                {
                  key: "canAccessAdminPanel" as keyof UserPermissions,
                  label: "Core Controller Admin Access",
                  adminOnly: true,
                },
                {
                  key: "canManageUsersAndRoles" as keyof UserPermissions,
                  label: "Manage Accounts & Roles",
                  adminOnly: true,
                },
                {
                  key: "canEditQuestions" as keyof UserPermissions,
                  label: "Question Bank Authoring",
                  adminOnly: false,
                },
                {
                  key: "canModifySystemGrading" as keyof UserPermissions,
                  label: "Modify Grading Algorithms",
                  adminOnly: true,
                },
                {
                  key: "canViewAllStudentReports" as keyof UserPermissions,
                  label: "View Cohort Score Reports",
                  adminOnly: false,
                },
                {
                  key: "canPracticeAndDrill" as keyof UserPermissions,
                  label: "Practice Drills & Mocks",
                  adminOnly: false,
                },
                {
                  key: "canViewStudyPlan" as keyof UserPermissions,
                  label: "Curriculum Study Roadmap",
                  adminOnly: false,
                },
                {
                  key: "canExportData" as keyof UserPermissions,
                  label: "Export System Analytics",
                  adminOnly: false,
                },
              ].map((item) => {
                const isEnabled = permissions[item.key];
                return (
                  <label
                    key={item.key}
                    onClick={() => handleTogglePerm(item.key)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      isEnabled
                        ? "bg-white border-slate-200 font-bold text-slate-800 shadow-xs"
                        : "bg-slate-100/70 border-transparent text-slate-400"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => {}}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span>{item.label}</span>
                    </span>
                    {item.adminOnly && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                        Admin
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Optional Audit Log Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Admin Status Change Audit Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Promoted to lead admin for Fall 2026 cohort supervision"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              {targetProfile.role === "student" && selectedRole !== "admin" && (
                <button
                  type="button"
                  onClick={() => handleRoleSelection("admin")}
                  className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Set as Admin</span>
                </button>
              )}

              {targetProfile.role === "admin" && selectedRole !== "student" && (
                <button
                  type="button"
                  onClick={() => handleRoleSelection("student")}
                  className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Set as Student</span>
                </button>
              )}

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Save Status Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
