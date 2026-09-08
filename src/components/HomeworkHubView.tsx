import React, { useState, useEffect } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Calendar,
  Send,
  User,
  Search,
  Filter,
  BarChart3,
  Award,
  FileText,
  Plus,
  HelpCircle,
  Calculator,
  Edit3,
  Flag,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Flame,
  Zap,
  Bookmark,
  Target,
  CheckSquare,
  MessageSquare,
  Clock3,
  Users,
  UserCheck,
  GraduationCap,
  Sparkle,
  Layers,
  ChevronDown,
  Printer,
  Copy,
  Check,
} from "lucide-react";
import {
  HomeworkAssignment,
  StudentHomeworkSubmission,
  SATQuestion,
  UserProfile,
  SATSection,
  SATDomain,
  DifficultyLevel,
} from "../types";
import { OwlyLogoIcon } from "./OwlyLogo";
import { INITIAL_QUESTION_BANK } from "../data/questionBank";
import { deduplicateProfiles } from "../data/defaultProfiles";

interface HomeworkHubViewProps {
  homeworkList: HomeworkAssignment[];
  currentProfile: UserProfile;
  profilesList: UserProfile[];
  onUpdateHomeworkList: (updated: HomeworkAssignment[]) => void;
  onOpenCalculator: () => void;
  onOpenScratchpad: () => void;
  onOpenFormulas: () => void;
  onLogStudyMinutes?: (minutes: number) => void;
}

export const HomeworkHubView: React.FC<HomeworkHubViewProps> = ({
  homeworkList,
  currentProfile,
  profilesList,
  onUpdateHomeworkList,
  onOpenCalculator,
  onOpenScratchpad,
  onOpenFormulas,
  onLogStudyMinutes,
}) => {
  const isStudent = currentProfile.role === "student";
  const isAdminOrTutor = currentProfile.role === "admin" || currentProfile.role === "tutor";

  // Filter only actual students from profiles list
  const studentProfiles = deduplicateProfiles(
    profilesList.filter(
      (p) => p.role === "student" || p.id === "user-jordan-davis" || p.id === "user-maya-patel" || p.id === "user-alex-chen"
    )
  );

  // Navigation Subtabs
  const [activeSubTab, setActiveSubTab] = useState<"assignments" | "telemetry" | "tutor-studio">("assignments");
  const [tutorStudioSection, setTutorStudioSection] = useState<"roster" | "student-deepdive" | "assign" | "grading">("roster");

  // Filters
  const [statusFilter, setStatusFilter] = useState<"all" | "personal" | "class" | "pending" | "in_progress" | "submitted">("all");
  const [sectionFilter, setSectionFilter] = useState<"all" | "Math" | "Reading & Writing" | "Full Test">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Active Homework Runner State
  const [activeHomeworkId, setActiveHomeworkId] = useState<string | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [liveTimerSeconds, setLiveTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, number | null>>({});
  const [questionTimeLogs, setQuestionTimeLogs] = useState<Record<string, number>>({});
  const [studentSelfNote, setStudentSelfNote] = useState<string>("");
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showResultsReview, setShowResultsReview] = useState<boolean>(false);

  // Tutor Studio State
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    studentProfiles[0]?.id || currentProfile.id
  );
  const [selectedHwForGrading, setSelectedHwForGrading] = useState<string | null>(null);
  const [tutorFeedbackDraft, setTutorFeedbackDraft] = useState<string>("");
  const [copiedReportSuccess, setCopiedReportSuccess] = useState<boolean>(false);

  // Assign Homework Form State
  const [isCreateHwModalOpen, setIsCreateHwModalOpen] = useState<boolean>(false);
  const [assignTargetType, setAssignTargetType] = useState<"single" | "multiple" | "all" | "tier">("single");
  const [targetSingleStudentId, setTargetSingleStudentId] = useState<string>(studentProfiles[0]?.id || "user-jordan-davis");
  const [targetMultiStudentIds, setTargetMultiStudentIds] = useState<string[]>([studentProfiles[0]?.id || "user-jordan-davis"]);
  const [targetTierOption, setTargetTierOption] = useState<string>("pro");
  const [newHwTitle, setNewHwTitle] = useState<string>("");
  const [newHwDesc, setNewHwDesc] = useState<string>("");
  const [newHwTutorNote, setNewHwTutorNote] = useState<string>("");
  const [newHwSection, setNewHwSection] = useState<SATSection | "Full Test">("Math");
  const [newHwDomain, setNewHwDomain] = useState<SATDomain>("Advanced Math");
  const [newHwSubtopic, setNewHwSubtopic] = useState<string>("Quadratic Equations and Vertex Form");
  const [newHwDifficulty, setNewHwDifficulty] = useState<DifficultyLevel>("Hard");
  const [newHwDueDate, setNewHwDueDate] = useState<string>(
    new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0]
  );
  const [newHwEstMinutes, setNewHwEstMinutes] = useState<number>(20);
  const [newHwPriority, setNewHwPriority] = useState<"High" | "Medium" | "Low">("High");
  const [newHwTags, setNewHwTags] = useState<string>("Personalized Drill, Targeted Mastery, Speed Set");
  const [newHwQuestionCount, setNewHwQuestionCount] = useState<number>(5);

  // Selected student object for deep-dive
  const targetStudentProfile = profilesList.find((p) => p.id === selectedStudentId) || currentProfile;

  // Timer Tick Effect for runner
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && activeHomeworkId) {
      interval = setInterval(() => {
        setLiveTimerSeconds((prev) => prev + 1);

        // Also track question-specific time
        const activeAssignment = homeworkList.find((h) => h.id === activeHomeworkId);
        if (activeAssignment && activeAssignment.questions[activeQuestionIndex]) {
          const qId = activeAssignment.questions[activeQuestionIndex].id;
          setQuestionTimeLogs((prev) => ({
            ...prev,
            [qId]: (prev[qId] || 0) + 1,
          }));
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, activeHomeworkId, activeQuestionIndex, homeworkList]);

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (totalSeconds: number) => {
    if (!totalSeconds || isNaN(totalSeconds)) return "00:00";
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const activeAssignment = homeworkList.find((h) => h.id === activeHomeworkId);
  const currentSubmission = activeAssignment?.submissions[currentProfile.id];

  // Check if a homework assignment is assigned to a specific student
  const isHomeworkAssignedToStudent = (hw: HomeworkAssignment, studentId: string) => {
    if (!hw.assignedToStudentIds || hw.assignedToStudentIds.length === 0) return true;
    if (hw.assignedToStudentIds.includes("all")) return true;
    return hw.assignedToStudentIds.includes(studentId);
  };

  // Check if an assignment is an individual/targeted assignment
  const isTargetedAssignment = (hw: HomeworkAssignment) => {
    return !!hw.assignedToStudentIds && !hw.assignedToStudentIds.includes("all") && hw.assignedToStudentIds.length > 0;
  };

  // Start or resume a homework assignment
  const handleStartHomework = (hw: HomeworkAssignment) => {
    setActiveHomeworkId(hw.id);
    setActiveQuestionIndex(0);
    const existingSub = hw.submissions[currentProfile.id];
    if (existingSub) {
      setCurrentAnswers(existingSub.answers || {});
      setLiveTimerSeconds(existingSub.timeSpentSeconds || 0);
      setQuestionTimeLogs(existingSub.questionTimes || {});
      setStudentSelfNote(existingSub.studentNotes || "");
    } else {
      setCurrentAnswers({});
      setLiveTimerSeconds(0);
      setQuestionTimeLogs({});
      setStudentSelfNote("");
    }
    setFlaggedQuestions({});
    setIsTimerRunning(true);
    setShowResultsReview(false);
  };

  // View completed homework review
  const handleViewHomeworkReview = (hw: HomeworkAssignment) => {
    setActiveHomeworkId(hw.id);
    setActiveQuestionIndex(0);
    const existingSub = hw.submissions[currentProfile.id];
    if (existingSub) {
      setCurrentAnswers(existingSub.answers || {});
      setLiveTimerSeconds(existingSub.timeSpentSeconds || 0);
      setQuestionTimeLogs(existingSub.questionTimes || {});
      setStudentSelfNote(existingSub.studentNotes || "");
    }
    setIsTimerRunning(false);
    setShowResultsReview(true);
  };

  // Answer selection in runner
  const handleSelectOption = (optIndex: number) => {
    if (!activeAssignment || showResultsReview) return;
    const currentQ = activeAssignment.questions[activeQuestionIndex];
    if (!currentQ) return;

    setCurrentAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optIndex,
    }));

    // Auto update in-progress state in background
    const updatedSubmissions = { ...activeAssignment.submissions };
    const existing = updatedSubmissions[currentProfile.id] || {
      studentId: currentProfile.id,
      studentName: currentProfile.name,
      status: "in_progress",
      answers: {},
      timeSpentSeconds: 0,
      startedAt: new Date().toISOString(),
      score: 0,
      totalQuestions: activeAssignment.questions.length,
      accuracyPercent: 0,
    };

    updatedSubmissions[currentProfile.id] = {
      ...existing,
      status: "in_progress",
      answers: { ...currentAnswers, [currentQ.id]: optIndex },
      timeSpentSeconds: liveTimerSeconds,
      questionTimes: questionTimeLogs,
      studentNotes: studentSelfNote,
    };

    const updatedHwList = homeworkList.map((h) =>
      h.id === activeAssignment.id ? { ...h, submissions: updatedSubmissions } : h
    );
    onUpdateHomeworkList(updatedHwList);
  };

  // Toggle flag
  const handleToggleFlag = (qId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  // Final Submit Homework
  const handleSubmitHomework = () => {
    if (!activeAssignment) return;
    setIsTimerRunning(false);
    setShowSubmitModal(false);

    // Calculate score & accuracy
    let correctCount = 0;
    activeAssignment.questions.forEach((q) => {
      const studentAns = currentAnswers[q.id];
      if (studentAns === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const accuracy = Math.round((correctCount / activeAssignment.questions.length) * 100);

    const submission: StudentHomeworkSubmission = {
      studentId: currentProfile.id,
      studentName: currentProfile.name,
      status: "submitted",
      answers: currentAnswers,
      timeSpentSeconds: liveTimerSeconds,
      questionTimes: questionTimeLogs,
      startedAt: currentSubmission?.startedAt || new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      score: correctCount,
      totalQuestions: activeAssignment.questions.length,
      accuracyPercent: accuracy,
      studentNotes: studentSelfNote,
      tutorFeedback:
        accuracy >= 80
          ? "Outstanding precision! Your analytical pace was exceptionally sharp."
          : "Good attempt. Review the trap explanations on missed questions and verify formulas in the Codex.",
      gradedScore: accuracy,
    };

    const updatedHwList = homeworkList.map((h) => {
      if (h.id === activeAssignment.id) {
        return {
          ...h,
          submissions: {
            ...h.submissions,
            [currentProfile.id]: submission,
          },
        };
      }
      return h;
    });

    onUpdateHomeworkList(updatedHwList);

    // Log study time in minutes
    if (onLogStudyMinutes && liveTimerSeconds > 60) {
      onLogStudyMinutes(Math.round(liveTimerSeconds / 60));
    }

    setShowResultsReview(true);
  };

  // Tutor submit feedback
  const handleSaveTutorFeedback = (hwId: string, studentId: string) => {
    const hw = homeworkList.find((h) => h.id === hwId);
    if (!hw || !hw.submissions[studentId]) return;

    const updatedSubmissions = { ...hw.submissions };
    updatedSubmissions[studentId] = {
      ...updatedSubmissions[studentId],
      tutorFeedback: tutorFeedbackDraft,
      status: "graded",
    };

    const updated = homeworkList.map((h) =>
      h.id === hwId ? { ...h, submissions: updatedSubmissions } : h
    );
    onUpdateHomeworkList(updated);
    setSelectedHwForGrading(null);
    setTutorFeedbackDraft("");
  };

  // Quick Open Modal targeting a specific student
  const handleQuickAssignToStudent = (student: UserProfile) => {
    setAssignTargetType("single");
    setTargetSingleStudentId(student.id);
    const weakest = student.weakestDomains?.[0] || "Advanced Math";
    setNewHwTitle(`Targeted Drill: ${weakest} Mastery for ${student.name.split(" ")[0]}`);
    setNewHwDesc(`Personalized homework set designed to eliminate recurring trap patterns in ${weakest}.`);
    setNewHwTutorNote(`${student.name.split(" ")[0]}: Focus on step verification and paced timing on these problems.`);
    if (weakest.includes("Math") || weakest.includes("Algebra") || weakest.includes("Geometry")) {
      setNewHwSection("Math");
      setNewHwDomain(weakest as any || "Algebra");
    } else {
      setNewHwSection("Reading & Writing");
      setNewHwDomain(weakest as any || "Standard English Conventions");
    }
    setIsCreateHwModalOpen(true);
  };

  // Create new custom homework
  const handleCreateNewHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHwTitle.trim()) return;

    // Determine targeted student IDs and names
    let assignedIds: string[] = [];
    let assignedNames: string[] = [];

    if (assignTargetType === "single") {
      const s = profilesList.find((p) => p.id === targetSingleStudentId);
      assignedIds = [targetSingleStudentId];
      assignedNames = [s ? s.name : "Target Student"];
    } else if (assignTargetType === "multiple") {
      assignedIds = targetMultiStudentIds;
      assignedNames = targetMultiStudentIds.map((id) => {
        const s = profilesList.find((p) => p.id === id);
        return s ? s.name : id;
      });
    } else if (assignTargetType === "tier") {
      assignedIds = studentProfiles
        .filter((p) => (p.tier || "pro") === targetTierOption)
        .map((p) => p.id);
      assignedNames = [`All ${targetTierOption.toUpperCase()} Tier Students`];
    } else {
      assignedIds = ["all"];
      assignedNames = ["All Enrolled Students"];
    }

    // Auto-curate matching questions from Question Bank
    let matchingQuestions = INITIAL_QUESTION_BANK.filter(
      (q) => q.section === newHwSection && (q.domain === newHwDomain || !newHwDomain)
    );

    if (matchingQuestions.length < newHwQuestionCount) {
      matchingQuestions = INITIAL_QUESTION_BANK.filter((q) => q.section === newHwSection);
    }
    if (matchingQuestions.length === 0) {
      matchingQuestions = INITIAL_QUESTION_BANK;
    }

    const curatedQuestions = matchingQuestions.slice(0, Math.min(newHwQuestionCount, matchingQuestions.length));

    const newHw: HomeworkAssignment = {
      id: `hw-${Date.now()}`,
      title: newHwTitle.trim(),
      description: newHwDesc.trim() || "Custom assigned homework set for SAT precision mastery.",
      section: newHwSection,
      domain: newHwDomain,
      subtopic: newHwSubtopic,
      assignedDate: new Date().toISOString().split("T")[0],
      dueDate: newHwDueDate,
      dueTimeLabel: "11:59 PM EST",
      assignedBy: `${currentProfile.name} (${currentProfile.role === "admin" ? "Admin" : "Lead Coach"})`,
      assignedToStudentIds: assignedIds,
      assignedStudentNames: assignedNames,
      customTutorNote: newHwTutorNote.trim() || undefined,
      estimatedMinutes: Number(newHwEstMinutes) || 20,
      difficulty: newHwDifficulty,
      priority: newHwPriority,
      tags: newHwTags.split(",").map((t) => t.trim()).filter(Boolean),
      questions: curatedQuestions.length > 0 ? curatedQuestions : homeworkList[0].questions,
      submissions: {},
    };

    onUpdateHomeworkList([newHw, ...homeworkList]);
    setIsCreateHwModalOpen(false);
    setNewHwTitle("");
    setNewHwDesc("");
    setNewHwTutorNote("");
  };

  // Calculate Cumulative Telemetry Metrics for current student (or selected student in tutor mode)
  const inspectedStudentId = isAdminOrTutor && activeSubTab === "tutor-studio" ? selectedStudentId : currentProfile.id;
  const inspectedStudentProfile = profilesList.find((p) => p.id === inspectedStudentId) || currentProfile;

  const relevantStudentHwList = homeworkList.filter((h) =>
    isHomeworkAssignedToStudent(h, inspectedStudentId)
  );

  const studentSubmissionsList = relevantStudentHwList
    .map((h) => ({
      hw: h,
      sub: h.submissions[inspectedStudentId],
    }))
    .filter((item) => item.sub !== undefined);

  const totalTimeSpentSeconds = studentSubmissionsList.reduce(
    (acc, curr) => acc + (curr.sub?.timeSpentSeconds || 0),
    0
  );

  const submittedSubmissions = studentSubmissionsList.filter(
    (item) => item.sub?.status === "submitted" || item.sub?.status === "graded"
  );

  const totalCompletedQuestions = submittedSubmissions.reduce(
    (acc, curr) => acc + (curr.sub?.totalQuestions || 0),
    0
  );

  const totalCorrectQuestions = submittedSubmissions.reduce(
    (acc, curr) => acc + (curr.sub?.score || 0),
    0
  );

  const avgAccuracy =
    totalCompletedQuestions > 0
      ? Math.round((totalCorrectQuestions / totalCompletedQuestions) * 100)
      : 0;

  const avgSecondsPerQuestion =
    totalCompletedQuestions > 0
      ? Math.round(totalTimeSpentSeconds / totalCompletedQuestions)
      : 0;

  // Filtered assignments list for student view
  const filteredAssignments = homeworkList.filter((hw) => {
    // Check assignment targeting
    const isAssigned = isHomeworkAssignedToStudent(hw, currentProfile.id);
    if (!isAdminOrTutor && !isAssigned) return false;

    const sub = hw.submissions[currentProfile.id];
    const status = sub?.status || "not_started";
    const isTargeted = isTargetedAssignment(hw);

    if (statusFilter === "personal" && !isTargeted) return false;
    if (statusFilter === "class" && isTargeted) return false;
    if (statusFilter === "pending" && status !== "not_started") return false;
    if (statusFilter === "in_progress" && status !== "in_progress") return false;
    if (statusFilter === "submitted" && status !== "submitted" && status !== "graded") return false;

    if (sectionFilter !== "all" && hw.section !== sectionFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = hw.title.toLowerCase().includes(q);
      const matchDesc = hw.description.toLowerCase().includes(q);
      const matchTag = hw.tags.some((t) => t.toLowerCase().includes(q));
      const matchTutor = hw.assignedBy.toLowerCase().includes(q);
      const matchStudent = hw.assignedStudentNames?.some((n) => n.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTag && !matchTutor && !matchStudent) return false;
    }
    return true;
  });

  // Copy Progress Report to Clipboard
  const handleCopyProgressReport = () => {
    const reportText = `===========================================
OWLY SAT - STUDENT HOMEWORK PROGRESS REPORT
===========================================
Student: ${inspectedStudentProfile.name}
Grade: ${inspectedStudentProfile.highSchoolGrade || "11th Grade"}
Target Score: ${inspectedStudentProfile.targetScore || 1550}
Date Generated: ${new Date().toLocaleDateString()}

--- TELEMETRY SUMMARY ---
• Total Homework Time Logged: ${formatTime(totalTimeSpentSeconds)}
• Missions Completed: ${submittedSubmissions.length} of ${relevantStudentHwList.length} (${relevantStudentHwList.length > 0 ? Math.round((submittedSubmissions.length / relevantStudentHwList.length) * 100) : 0}%)
• Overall Homework Accuracy: ${avgAccuracy}% (${totalCorrectQuestions}/${totalCompletedQuestions} questions)
• Average Pace Per Problem: ${formatTime(avgSecondsPerQuestion)} (SAT Standard: 1m 35s)

--- MISSION SUBMISSIONS ---
${studentSubmissionsList.map(({ hw, sub }) => `* ${hw.title} [${hw.section}]
  - Status: ${sub.status.toUpperCase()}
  - Score: ${sub.score}/${sub.totalQuestions} (${sub.accuracyPercent}%)
  - Time Spent: ${formatTime(sub.timeSpentSeconds)}
  - Tutor Feedback: "${sub.tutorFeedback || "Pending Review"}"`).join("\n\n")}
===========================================`;

    navigator.clipboard.writeText(reportText);
    setCopiedReportSuccess(true);
    setTimeout(() => setCopiedReportSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Futuristic Cockpit Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-cyan-950/80 to-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <OwlyLogoIcon size="sm" />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                STUDENT HOMEWORK & TIME TELEMETRY ENGINE
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-orbitron font-bold tracking-wide text-white drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">
              Homework Hub & Precision Monitoring
            </h1>
            <p className="text-xs sm:text-sm font-space text-slate-300 max-w-2xl leading-relaxed">
              Give targeted homework to particular students, track stopwatch time investment, review answer trap patterns, and coach high-yield improvements.
            </p>
          </div>

          {/* Quick Telemetry Indicators */}
          <div className="grid grid-cols-3 gap-3 bg-slate-950/90 p-3.5 rounded-2xl border border-cyan-500/30 shrink-0 text-center shadow-[inset_0_0_12px_rgba(6,182,212,0.15)]">
            <div className="px-2">
              <div className="text-[10px] uppercase font-mono font-bold text-cyan-400">HW Time</div>
              <div className="text-lg font-orbitron font-black text-cyan-300">{formatTime(totalTimeSpentSeconds)}</div>
            </div>
            <div className="px-2 border-x border-cyan-500/20">
              <div className="text-[10px] uppercase font-mono font-bold text-emerald-400">Completed</div>
              <div className="text-lg font-orbitron font-black text-emerald-400">
                {submittedSubmissions.length} / {relevantStudentHwList.length}
              </div>
            </div>
            <div className="px-2">
              <div className="text-[10px] uppercase font-mono font-bold text-amber-400">Accuracy</div>
              <div className="text-lg font-orbitron font-black text-amber-400">{avgAccuracy}%</div>
            </div>
          </div>
        </div>

        {/* Navigation Subtabs Bar */}
        <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-cyan-500/20 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setActiveSubTab("assignments");
                setActiveHomeworkId(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeSubTab === "assignments" && !activeHomeworkId
                  ? "bg-cyan-500 text-black shadow-[0_0_12px_#00f0ff]"
                  : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-cyan-500/20"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Homework Queue ({filteredAssignments.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveSubTab("telemetry");
                setActiveHomeworkId(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeSubTab === "telemetry"
                  ? "bg-cyan-500 text-black shadow-[0_0_12px_#00f0ff]"
                  : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-cyan-500/20"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Time & Progress Telemetry</span>
            </button>

            {isAdminOrTutor && (
              <button
                onClick={() => {
                  setActiveSubTab("tutor-studio");
                  setActiveHomeworkId(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeSubTab === "tutor-studio"
                    ? "bg-purple-500 text-black shadow-[0_0_12px_#a855f7]"
                    : "bg-slate-900/80 text-purple-400 hover:text-white hover:bg-slate-800 border border-purple-500/30"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Tutor & Admin Studio ({studentProfiles.length} Students)</span>
              </button>
            )}
          </div>

          {isAdminOrTutor && (
            <button
              onClick={() => setIsCreateHwModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-black" />
              <span>Assign New Homework</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ACTIVE HOMEWORK INTERACTIVE RUNNER / WORKSPACE */}
      {/* ========================================================================= */}
      {activeHomeworkId && activeAssignment ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Mission Control Bar */}
          <div className="scifi-glass-card p-4 sm:p-5 rounded-2xl border border-cyan-500/30 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setActiveHomeworkId(null);
                }}
                className="p-2 rounded-xl bg-slate-900 border border-cyan-500/30 text-slate-300 hover:text-white hover:border-cyan-400 transition-colors cursor-pointer"
                title="Back to homework list"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    {activeAssignment.section}
                  </span>
                  {isTargetedAssignment(activeAssignment) && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      Personalized Drill
                    </span>
                  )}
                  <span className="text-xs font-mono text-slate-400">
                    Question {activeQuestionIndex + 1} of {activeAssignment.questions.length}
                  </span>
                </div>
                <h3 className="text-sm font-orbitron font-bold text-white line-clamp-1">{activeAssignment.title}</h3>
              </div>
            </div>

            {/* Live Stopwatch & Pacing Telemetry */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-950 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Clock className={`w-4 h-4 text-cyan-400 ${isTimerRunning ? "animate-pulse" : ""}`} />
                <div className="font-mono font-bold text-sm text-cyan-300 tracking-wider">
                  {formatTime(liveTimerSeconds)}
                </div>
                {!showResultsReview && (
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title={isTimerRunning ? "Pause Timer" : "Resume Timer"}
                  >
                    {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                )}
              </div>

              {/* Utility Tool Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenCalculator}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold transition-all cursor-pointer"
                  title="Open Desmos Graphing Calculator"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Desmos</span>
                </button>
                <button
                  onClick={onOpenScratchpad}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-400 border border-purple-500/30 text-xs font-mono font-bold transition-all cursor-pointer"
                  title="Open Scratchpad"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Scratchpad</span>
                </button>
                <button
                  onClick={onOpenFormulas}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold transition-all cursor-pointer"
                  title="Open Formula Codex"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Formulas</span>
                </button>
              </div>
            </div>
          </div>

          {/* Targeted Personal Tutor Note Callout */}
          {activeAssignment.customTutorNote && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-purple-950/70 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)] flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
                  Personalized Tutor Instructions:
                </div>
                <p className="text-xs font-space text-slate-200 italic">"{activeAssignment.customTutorNote}"</p>
              </div>
            </div>
          )}

          {/* Question Stepper Navigation Bar */}
          <div className="scifi-glass-card p-3 rounded-2xl border border-cyan-500/20 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5">
              {activeAssignment.questions.map((q, idx) => {
                const isSelected = activeQuestionIndex === idx;
                const isAnswered = currentAnswers[q.id] !== undefined && currentAnswers[q.id] !== null;
                const isFlagged = !!flaggedQuestions[q.id];
                const isCorrect = showResultsReview && currentAnswers[q.id] === q.correctAnswerIndex;
                const isWrong = showResultsReview && currentAnswers[q.id] !== undefined && currentAnswers[q.id] !== q.correctAnswerIndex;

                let btnStyle = "bg-slate-900 text-slate-400 border-cyan-500/20";
                if (showResultsReview) {
                  if (isCorrect) btnStyle = "bg-emerald-500 text-black border-emerald-400 shadow-[0_0_8px_#10b981]";
                  else if (isWrong) btnStyle = "bg-rose-500 text-white border-rose-400 shadow-[0_0_8px_#f43f5e]";
                  else btnStyle = "bg-slate-900 text-slate-500 border-slate-700";
                } else if (isSelected) {
                  btnStyle = "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_10px_#00f0ff] font-bold";
                } else if (isAnswered) {
                  btnStyle = "bg-cyan-950 text-cyan-300 border-cyan-500/50";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setActiveQuestionIndex(idx)}
                    className={`relative w-9 h-9 rounded-lg border font-mono text-xs transition-all flex items-center justify-center cursor-pointer ${btnStyle}`}
                  >
                    {idx + 1}
                    {isFlagged && !showResultsReview && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_5px_#f59e0b]" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  const currQ = activeAssignment.questions[activeQuestionIndex];
                  if (currQ) handleToggleFlag(currQ.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-colors cursor-pointer ${
                  flaggedQuestions[activeAssignment.questions[activeQuestionIndex]?.id]
                    ? "bg-amber-950/80 border-amber-500 text-amber-300"
                    : "bg-slate-900 border-cyan-500/20 text-slate-400 hover:text-white"
                }`}
              >
                <Flag className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Flag Question</span>
              </button>

              {!showResultsReview && (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs shadow-[0_0_12px_#10b981] transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit HW</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Question Display */}
          {(() => {
            const currentQ = activeAssignment.questions[activeQuestionIndex];
            if (!currentQ) return null;
            const chosenAnswer = currentAnswers[currentQ.id];
            const timeOnThisQuestion = questionTimeLogs[currentQ.id] || 0;

            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Question & Options Card */}
                <div className="lg:col-span-2 scifi-glass-card p-6 sm:p-8 rounded-3xl border border-cyan-500/30 space-y-6">
                  <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                        {currentQ.domain}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{currentQ.subtopic}</span>
                    </div>
                    <div className="text-[11px] font-mono text-cyan-400/90 flex items-center gap-1.5">
                      <Clock3 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Time on Q: {formatTime(timeOnThisQuestion)}</span>
                    </div>
                  </div>

                  {/* Passage if present */}
                  {currentQ.passage && (
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/20 text-xs sm:text-sm font-space text-slate-300 leading-relaxed max-h-56 overflow-y-auto no-scrollbar">
                      {currentQ.passage}
                    </div>
                  )}

                  {/* Table Data if present */}
                  {currentQ.tableData && (
                    <div className="overflow-x-auto my-3 border border-cyan-500/20 rounded-xl">
                      <table className="w-full text-xs text-left font-space text-slate-200">
                        <thead className="bg-cyan-950/60 text-cyan-300 font-mono">
                          <tr>
                            {currentQ.tableData.headers.map((h, i) => (
                              <th key={i} className="p-2.5 border-b border-cyan-500/30">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {currentQ.tableData.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="border-b border-cyan-500/10 hover:bg-cyan-950/20">
                              {row.map((c, cIdx) => (
                                <td key={cIdx} className="p-2.5">
                                  {c}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Question Stem */}
                  <div className="text-base sm:text-lg font-space font-medium text-white leading-relaxed">
                    {currentQ.question}
                  </div>

                  {/* Options List */}
                  <div className="space-y-3 pt-2">
                    {currentQ.options.map((opt, optIdx) => {
                      const letter = ["A", "B", "C", "D"][optIdx];
                      const isSelected = chosenAnswer === optIdx;
                      const isCorrect = showResultsReview && currentQ.correctAnswerIndex === optIdx;
                      const isUserWrong = showResultsReview && isSelected && !isCorrect;

                      let optClass = "border-cyan-500/20 hover:border-cyan-400/60 bg-slate-950/60 text-slate-200";
                      if (showResultsReview) {
                        if (isCorrect) optClass = "border-emerald-500 bg-emerald-950/50 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.3)]";
                        else if (isUserWrong) optClass = "border-rose-500 bg-rose-950/50 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.3)]";
                      } else if (isSelected) {
                        optClass = "border-cyan-400 bg-cyan-950/60 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.3)]";
                      }

                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectOption(optIdx)}
                          className={`p-4 rounded-2xl border-2 transition-all flex items-start gap-3 cursor-pointer ${optClass}`}
                        >
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                              isSelected || isCorrect
                                ? "bg-cyan-500 text-black shadow-[0_0_8px_#00f0ff]"
                                : "bg-slate-900 text-slate-400 border border-cyan-500/30"
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="text-sm font-space leading-relaxed pt-0.5">{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Navigation Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-cyan-500/20">
                    <button
                      disabled={activeQuestionIndex === 0}
                      onClick={() => setActiveQuestionIndex((prev) => Math.max(0, prev - 1))}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 font-mono text-xs border border-cyan-500/20 transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Previous Question</span>
                    </button>

                    <button
                      disabled={activeQuestionIndex === activeAssignment.questions.length - 1}
                      onClick={() => setActiveQuestionIndex((prev) => Math.min(activeAssignment.questions.length - 1, prev + 1))}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-mono font-bold text-xs shadow-[0_0_10px_#00f0ff] transition-all cursor-pointer"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Right Sidebar: Step Explanation or Notes */}
                <div className="space-y-6">
                  {showResultsReview ? (
                    /* Explanation Card */
                    <div className="scifi-glass-card p-6 rounded-3xl border border-emerald-500/30 space-y-4 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                      <div className="flex items-center gap-2 text-emerald-400 font-orbitron font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Step-by-Step Solution</span>
                      </div>
                      <p className="text-xs font-space text-slate-200 leading-relaxed">{currentQ.explanation}</p>

                      {currentQ.trapAnalysis && (
                        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs font-space text-amber-200 space-y-1">
                          <div className="font-orbitron font-bold text-amber-300 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Trap Pattern Alert</span>
                          </div>
                          <p>{currentQ.trapAnalysis}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Student Self-Notes & Tutor Inquiries */
                    <div className="scifi-glass-card p-6 rounded-3xl border border-cyan-500/30 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-cyan-300 font-orbitron font-bold text-xs">
                          <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Student Notes & Questions</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">Saved to Submission</span>
                      </div>
                      <p className="text-[11px] font-space text-slate-400 leading-relaxed">
                        Add reflections or questions about this problem set. Your tutor will review them during grading.
                      </p>
                      <textarea
                        rows={4}
                        value={studentSelfNote}
                        onChange={(e) => setStudentSelfNote(e.target.value)}
                        placeholder="e.g., Struggled with finding the vertex on Q3, need to review Desmos regression..."
                        className="w-full p-3 rounded-2xl bg-slate-950 border border-cyan-500/30 text-xs font-space text-white focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
                      />
                    </div>
                  )}

                  {/* Submission Summary Box */}
                  <div className="scifi-glass-card p-6 rounded-3xl border border-cyan-500/20 space-y-3 font-mono text-xs">
                    <div className="text-cyan-400 font-bold uppercase tracking-wider">Mission Telemetry</div>
                    <div className="space-y-2 text-slate-300">
                      <div className="flex justify-between">
                        <span>Total Items:</span>
                        <span className="text-white font-bold">{activeAssignment.questions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Answered:</span>
                        <span className="text-cyan-300 font-bold">
                          {Object.keys(currentAnswers).length} / {activeAssignment.questions.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target Duration:</span>
                        <span className="text-slate-400">{activeAssignment.estimatedMinutes} mins</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time Elapsed:</span>
                        <span className="text-amber-400 font-bold">{formatTime(liveTimerSeconds)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      ) : null}

      {/* ========================================================================= */}
      {/* 2. ASSIGNMENTS LIST VIEW (DEFAULT TAB) */}
      {/* ========================================================================= */}
      {activeSubTab === "assignments" && !activeHomeworkId && (
        <div className="space-y-6">
          {/* Filter & Search Bar */}
          <div className="scifi-glass-card p-4 sm:p-5 rounded-2xl border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: "all", label: "All Missions" },
                { id: "personal", label: "🎯 Targeted for Me" },
                { id: "class", label: "👥 Class-wide Sets" },
                { id: "pending", label: "To Do" },
                { id: "in_progress", label: "In Progress" },
                { id: "submitted", label: "Completed" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl font-mono text-xs transition-all cursor-pointer shrink-0 ${
                    statusFilter === tab.id
                      ? "bg-cyan-500 text-black font-bold shadow-[0_0_10px_#00f0ff]"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-cyan-500/20"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Section & Search */}
            <div className="flex items-center gap-3">
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Sections</option>
                <option value="Math">Math Section</option>
                <option value="Reading & Writing">Reading & Writing</option>
                <option value="Full Test">Full Test Capstone</option>
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search homework..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-xs font-space text-white focus:outline-none focus:border-cyan-400 placeholder:text-slate-500 w-44 sm:w-56"
                />
              </div>
            </div>
          </div>

          {/* Homework Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.map((hw) => {
              const submission = hw.submissions[currentProfile.id];
              const status = submission?.status || "not_started";
              const isSubmitted = status === "submitted" || status === "graded";
              const isInProgress = status === "in_progress";
              const isTargeted = isTargetedAssignment(hw);

              return (
                <div
                  key={hw.id}
                  className={`scifi-glass-card rounded-3xl p-6 border transition-all flex flex-col justify-between space-y-4 group ${
                    isTargeted
                      ? "border-purple-500/40 hover:border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                      : "border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                          {hw.section}
                        </span>
                        {isTargeted ? (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                            <Target className="w-2.5 h-2.5" />
                            Targeted
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
                            Class Mission
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {hw.priority === "High" && (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40">
                            High Priority
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                            isSubmitted
                              ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                              : isInProgress
                              ? "bg-amber-950 text-amber-300 border-amber-500/40"
                              : "bg-slate-900 text-slate-400 border-slate-700"
                          }`}
                        >
                          {isSubmitted ? `Submitted (${submission?.accuracyPercent}%)` : isInProgress ? "In Progress" : "Assigned"}
                        </span>
                      </div>
                    </div>

                    {/* Assigned Student Names Badge if targeted */}
                    {hw.assignedStudentNames && hw.assignedStudentNames.length > 0 && !hw.assignedStudentNames.includes("All Enrolled Students") && (
                      <div className="text-[10px] font-mono text-purple-300 flex items-center gap-1.5 bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-500/30">
                        <Users className="w-3 h-3 text-purple-400" />
                        <span>Assigned to: {hw.assignedStudentNames.join(", ")}</span>
                      </div>
                    )}

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-base font-orbitron font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug line-clamp-2">
                        {hw.title}
                      </h3>
                      <p className="text-xs font-space text-slate-300 mt-2 leading-relaxed line-clamp-2">
                        {hw.description}
                      </p>
                    </div>

                    {/* Tutor Note Preview if present */}
                    {hw.customTutorNote && (
                      <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-[11px] font-space text-purple-200 italic line-clamp-2">
                        💬 Tutor Note: "{hw.customTutorNote}"
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {hw.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-cyan-500/20"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer & Telemetry */}
                  <div className="pt-4 border-t border-cyan-500/20 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Est: {hw.estimatedMinutes}m</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>Due: {hw.dueDate}</span>
                      </div>
                    </div>

                    {/* If submitted, show exact time spent and tutor feedback preview */}
                    {isSubmitted && (
                      <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-[11px] font-mono space-y-1">
                        <div className="flex justify-between text-emerald-300 font-bold">
                          <span>Time Logged: {formatTime(submission.timeSpentSeconds)}</span>
                          <span>Score: {submission.score}/{submission.totalQuestions} ({submission.accuracyPercent}%)</span>
                        </div>
                        {submission.tutorFeedback && (
                          <p className="text-[10px] font-space text-slate-300 line-clamp-1 italic">
                            Tutor: "{submission.tutorFeedback}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action Button */}
                    {isSubmitted ? (
                      <button
                        onClick={() => handleViewHomeworkReview(hw)}
                        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 font-mono font-bold text-xs border border-cyan-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                      >
                        <FileText className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Review Completed Mission</span>
                      </button>
                    ) : isInProgress ? (
                      <button
                        onClick={() => handleStartHomework(hw)}
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_12px_#f59e0b]"
                      >
                        <Play className="w-3.5 h-3.5 text-black" />
                        <span>Resume Homework ({formatTime(submission?.timeSpentSeconds || 0)} logged)</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartHomework(hw)}
                        className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                      >
                        <Play className="w-3.5 h-3.5 text-black" />
                        <span>Start Homework ({hw.questions.length} Items)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TIME & PROGRESS TELEMETRY TAB */}
      {/* ========================================================================= */}
      {activeSubTab === "telemetry" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Big Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="scifi-glass-card p-6 rounded-3xl border border-cyan-500/30 space-y-2 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">Total Homework Time</span>
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-orbitron font-black text-white">{formatTime(totalTimeSpentSeconds)}</div>
              <p className="text-[11px] font-space text-slate-400">Real-time stopwatch time logged across all homework missions</p>
            </div>

            <div className="scifi-glass-card p-6 rounded-3xl border border-emerald-500/30 space-y-2 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">HW Completion Rate</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-orbitron font-black text-emerald-300">
                {relevantStudentHwList.length > 0
                  ? Math.round((submittedSubmissions.length / relevantStudentHwList.length) * 100)
                  : 0}%
              </div>
              <p className="text-[11px] font-space text-slate-400">
                {submittedSubmissions.length} of {relevantStudentHwList.length} assigned missions completed
              </p>
            </div>

            <div className="scifi-glass-card p-6 rounded-3xl border border-purple-500/30 space-y-2 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400">Average HW Accuracy</span>
                <Award className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-orbitron font-black text-purple-300">{avgAccuracy}%</div>
              <p className="text-[11px] font-space text-slate-400">
                {totalCorrectQuestions} correct of {totalCompletedQuestions} completed questions
              </p>
            </div>

            <div className="scifi-glass-card p-6 rounded-3xl border border-amber-500/30 space-y-2 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">Avg Pace / Problem</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-orbitron font-black text-amber-300">{formatTime(avgSecondsPerQuestion)}</div>
              <p className="text-[11px] font-space text-slate-400">Digital SAT standard pace benchmark: 1m 35s</p>
            </div>
          </div>

          {/* Time Investment & Progress Chart */}
          <div className="scifi-glass-card p-6 sm:p-8 rounded-3xl border border-cyan-500/30 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-orbitron font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  Weekly Homework Time Investment & Pacing Curve
                </h3>
                <p className="text-xs font-space text-slate-400">
                  Daily minutes spent on assigned homework sets vs target daily study goals.
                </p>
              </div>
            </div>

            {/* Weekdays Bar Visualizer */}
            <div className="grid grid-cols-7 gap-3 pt-4">
              {[
                { day: "Mon", minutes: 35, target: 45 },
                { day: "Tue", minutes: 50, target: 45 },
                { day: "Wed", minutes: 25, target: 45 },
                { day: "Thu", minutes: 60, target: 45 },
                { day: "Fri", minutes: 40, target: 45 },
                { day: "Sat", minutes: 90, target: 60 },
                { day: "Sun", minutes: 45, target: 60 },
              ].map((item, idx) => {
                const heightPercent = Math.min(100, Math.round((item.minutes / 90) * 100));
                const targetPercent = Math.min(100, Math.round((item.target / 90) * 100));

                return (
                  <div key={idx} className="flex flex-col items-center space-y-2">
                    <div className="w-full bg-slate-950/80 rounded-2xl h-44 border border-cyan-500/20 relative flex items-end justify-center p-2">
                      {/* Target Goal Line */}
                      <div
                        className="absolute w-full border-t border-dashed border-cyan-400/50 left-0"
                        style={{ bottom: `${targetPercent}%` }}
                        title={`Target: ${item.target}m`}
                      />

                      {/* Bar Fill */}
                      <div
                        className="w-full bg-gradient-to-t from-indigo-600 via-cyan-400 to-emerald-400 rounded-xl transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-white">{item.day}</span>
                    <span className="text-[10px] font-mono text-cyan-400">{item.minutes} mins</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submission History Table */}
          <div className="scifi-glass-card p-6 sm:p-8 rounded-3xl border border-cyan-500/30 space-y-6">
            <h3 className="text-base font-orbitron font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Verified Homework Submission Logs & Timesheets
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-space text-slate-200">
                <thead className="bg-slate-950 font-mono text-cyan-300 uppercase text-[10px]">
                  <tr>
                    <th className="p-3 border-b border-cyan-500/30">Mission Title</th>
                    <th className="p-3 border-b border-cyan-500/30">Section</th>
                    <th className="p-3 border-b border-cyan-500/30">Type</th>
                    <th className="p-3 border-b border-cyan-500/30">Time Spent</th>
                    <th className="p-3 border-b border-cyan-500/30">Score</th>
                    <th className="p-3 border-b border-cyan-500/30">Accuracy</th>
                    <th className="p-3 border-b border-cyan-500/30">Submitted Date</th>
                    <th className="p-3 border-b border-cyan-500/30">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/10">
                  {studentSubmissionsList.map(({ hw, sub }) => (
                    <tr key={hw.id} className="hover:bg-cyan-950/20 transition-colors">
                      <td className="p-3 font-orbitron font-bold text-white">{hw.title}</td>
                      <td className="p-3 font-mono text-cyan-400">{hw.section}</td>
                      <td className="p-3 font-mono">
                        {isTargetedAssignment(hw) ? (
                          <span className="text-purple-400 font-bold">TARGETED</span>
                        ) : (
                          <span className="text-slate-400">CLASS</span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-amber-300">{formatTime(sub.timeSpentSeconds)}</td>
                      <td className="p-3 font-mono">
                        {sub.score} / {sub.totalQuestions}
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-400">{sub.accuracyPercent}%</td>
                      <td className="p-3 font-mono text-slate-400">{sub.submittedAt ? sub.submittedAt.split("T")[0] : "In Progress"}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleViewHomeworkReview(hw)}
                          className="px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono transition-colors cursor-pointer"
                        >
                          Review Work
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TUTOR / ADMIN MONITORING & ASSIGNMENT STUDIO */}
      {/* ========================================================================= */}
      {activeSubTab === "tutor-studio" && isAdminOrTutor && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Subtabs for Tutor Studio */}
          <div className="flex items-center gap-3 border-b border-purple-500/20 pb-4 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setTutorStudioSection("roster")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                tutorStudioSection === "roster"
                  ? "bg-purple-500 text-black shadow-[0_0_12px_#a855f7]"
                  : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-purple-500/30"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>👥 Student Roster & Live Progress Matrix</span>
            </button>

            <button
              onClick={() => setTutorStudioSection("student-deepdive")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                tutorStudioSection === "student-deepdive"
                  ? "bg-purple-500 text-black shadow-[0_0_12px_#a855f7]"
                  : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-purple-500/30"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>📊 Particular Student Deep Telemetry</span>
            </button>

            <button
              onClick={() => setIsCreateHwModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs shadow-[0_0_12px_#00f0ff] transition-all cursor-pointer ml-auto"
            >
              <Target className="w-3.5 h-3.5 text-black" />
              <span>🎯 Assign Targeted HW</span>
            </button>
          </div>

          {/* 4A. STUDENT ROSTER & MULTI-STUDENT MONITORING MATRIX */}
          {tutorStudioSection === "roster" && (
            <div className="space-y-6">
              <div className="scifi-glass-card p-6 sm:p-8 rounded-3xl border border-purple-500/30 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-orbitron font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-purple-400" />
                      Enrolled Students Homework & Pacing Matrix
                    </h3>
                    <p className="text-xs font-space text-slate-400 mt-1">
                      Monitor total homework time invested, assignment completion rates, and assign targeted problem sets to individual students.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-purple-300 bg-purple-950/60 px-3 py-1.5 rounded-xl border border-purple-500/40">
                      {studentProfiles.length} Active Students
                    </span>
                  </div>
                </div>

                {/* Students Cards / Table */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {studentProfiles.map((student, idx) => {
                    const studentHws = homeworkList.filter((h) =>
                      isHomeworkAssignedToStudent(h, student.id)
                    );
                    const studentSubs = studentHws
                      .map((h) => h.submissions[student.id])
                      .filter((s) => s !== undefined);

                    const completedCount = studentSubs.filter(
                      (s) => s.status === "submitted" || s.status === "graded"
                    ).length;

                    const studentTotalSeconds = studentSubs.reduce(
                      (acc, s) => acc + (s.timeSpentSeconds || 0),
                      0
                    );

                    const totalCorrect = studentSubs.reduce(
                      (acc, s) => acc + (s.score || 0),
                      0
                    );
                    const totalQues = studentSubs.reduce(
                      (acc, s) => acc + (s.totalQuestions || 0),
                      0
                    );
                    const accuracy =
                      totalQues > 0 ? Math.round((totalCorrect / totalQues) * 100) : 0;

                    const completionRate =
                      studentHws.length > 0
                        ? Math.round((completedCount / studentHws.length) * 100)
                        : 0;

                    return (
                      <div
                        key={`hw-student-card-${student.id}-${idx}`}
                        className="scifi-glass-card p-6 rounded-3xl border border-purple-500/30 hover:border-purple-400/60 transition-all flex flex-col justify-between space-y-5 shadow-[0_0_20px_rgba(168,85,247,0.15)] group"
                      >
                        <div className="space-y-4">
                          {/* Student Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-orbitron font-bold text-white text-sm shadow-[0_0_12px_rgba(168,85,247,0.4)] ${
                                  student.avatarColor || "bg-indigo-600"
                                }`}
                              >
                                {student.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </div>
                              <div>
                                <h4 className="font-orbitron font-bold text-white text-sm group-hover:text-purple-300 transition-colors">
                                  {student.name}
                                </h4>
                                <span className="text-[10px] font-mono text-slate-400">{student.highSchoolGrade}</span>
                              </div>
                            </div>

                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40">
                              Target: {student.targetScore}
                            </span>
                          </div>

                          {/* Progress Telemetry Stats */}
                          <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-3 rounded-2xl border border-purple-500/20 text-center font-mono">
                            <div>
                              <div className="text-[9px] uppercase text-purple-400 font-bold">HW Time</div>
                              <div className="text-sm font-orbitron font-bold text-white">{formatTime(studentTotalSeconds)}</div>
                            </div>
                            <div className="border-x border-purple-500/20">
                              <div className="text-[9px] uppercase text-emerald-400 font-bold">Completed</div>
                              <div className="text-sm font-orbitron font-bold text-emerald-300">
                                {completedCount}/{studentHws.length}
                              </div>
                            </div>
                            <div>
                              <div className="text-[9px] uppercase text-amber-400 font-bold">Accuracy</div>
                              <div className="text-sm font-orbitron font-bold text-amber-300">{accuracy}%</div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-mono text-slate-400">
                              <span>Mission Completion</span>
                              <span className="text-purple-300 font-bold">{completionRate}%</span>
                            </div>
                            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-purple-500/20">
                              <div
                                className="bg-gradient-to-r from-indigo-500 to-purple-400 h-full rounded-full transition-all duration-500"
                                style={{ width: `${completionRate}%` }}
                              />
                            </div>
                          </div>

                          {/* Weakest Areas */}
                          {student.weakestDomains && student.weakestDomains.length > 0 && (
                            <div className="space-y-1">
                              <div className="text-[10px] font-mono text-slate-400">Target Focus Areas:</div>
                              <div className="flex flex-wrap gap-1">
                                {student.weakestDomains.map((w, wIdx) => (
                                  <span
                                    key={wIdx}
                                    className="text-[9px] font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-500/30"
                                  >
                                    {w}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="pt-4 border-t border-purple-500/20 flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedStudentId(student.id);
                              setTutorStudioSection("student-deepdive");
                            }}
                            className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 font-mono text-xs border border-purple-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                            <span>Telemetry</span>
                          </button>

                          <button
                            onClick={() => handleQuickAssignToStudent(student)}
                            className="flex-1 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-black font-mono font-bold text-xs shadow-[0_0_10px_#a855f7] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Target className="w-3.5 h-3.5 text-black" />
                            <span>Assign HW</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 4B. PARTICULAR STUDENT DEEP-DIVE TELEMETRY & SUBMISSIONS */}
          {tutorStudioSection === "student-deepdive" && (
            <div className="space-y-6">
              {/* Student Switcher Banner */}
              <div className="scifi-glass-card p-6 sm:p-8 rounded-3xl border border-purple-500/40 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-orbitron font-bold text-white text-xl shadow-[0_0_15px_rgba(168,85,247,0.4)] ${
                      targetStudentProfile.avatarColor || "bg-indigo-600"
                    }`}
                  >
                    {targetStudentProfile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40">
                        STUDENT DEEP-DIVE
                      </span>
                      <span className="text-xs font-mono text-slate-400">{targetStudentProfile.highSchoolGrade}</span>
                    </div>
                    <h3 className="text-xl font-orbitron font-bold text-white">{targetStudentProfile.name}</h3>
                    <p className="text-xs font-space text-slate-300">
                      Target: {targetStudentProfile.targetScore} (Math: {targetStudentProfile.mathTarget || 780}, R&W: {targetStudentProfile.rwTarget || 760})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Switch Student:</label>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="px-4 py-2 rounded-xl bg-slate-950 border border-purple-500/40 text-xs font-mono text-white focus:outline-none cursor-pointer"
                    >
                      {studentProfiles.map((p, idx) => (
                        <option key={`hw-opt-stu-${p.id}-${idx}`} value={p.id}>
                          {p.name} ({p.highSchoolGrade})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleCopyProgressReport}
                    className="flex items-center gap-1.5 px-4 py-2 mt-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/30 text-xs font-mono transition-all cursor-pointer"
                    title="Copy full progress report summary"
                  >
                    {copiedReportSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedReportSuccess ? "Copied!" : "Export Report"}</span>
                  </button>

                  <button
                    onClick={() => handleQuickAssignToStudent(targetStudentProfile)}
                    className="flex items-center gap-1.5 px-4 py-2 mt-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs shadow-[0_0_10px_#00f0ff] transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-black" />
                    <span>Assign to {targetStudentProfile.name.split(" ")[0]}</span>
                  </button>
                </div>
              </div>

              {/* Submissions & Time Log Table for This Particular Student */}
              <div className="scifi-glass-card p-6 sm:p-8 rounded-3xl border border-purple-500/30 space-y-6">
                <h4 className="text-base font-orbitron font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  Assigned Missions & Time Telemetry for {targetStudentProfile.name}
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-space text-slate-200">
                    <thead className="bg-slate-950 font-mono text-purple-300 uppercase text-[10px]">
                      <tr>
                        <th className="p-3 border-b border-purple-500/30">Mission Title</th>
                        <th className="p-3 border-b border-purple-500/30">Section</th>
                        <th className="p-3 border-b border-purple-500/30">Targeting</th>
                        <th className="p-3 border-b border-purple-500/30">Status</th>
                        <th className="p-3 border-b border-purple-500/30">Time Spent</th>
                        <th className="p-3 border-b border-purple-500/30">Accuracy</th>
                        <th className="p-3 border-b border-purple-500/30">Student Notes</th>
                        <th className="p-3 border-b border-purple-500/30">Tutor Feedback</th>
                        <th className="p-3 border-b border-purple-500/30">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/10">
                      {relevantStudentHwList.map((hw) => {
                        const sub = hw.submissions[selectedStudentId];
                        const isSub = !!sub;

                        return (
                          <tr key={hw.id} className="hover:bg-purple-950/20 transition-colors">
                            <td className="p-3 font-orbitron font-bold text-white">{hw.title}</td>
                            <td className="p-3 font-mono text-cyan-400">{hw.section}</td>
                            <td className="p-3 font-mono">
                              {isTargetedAssignment(hw) ? (
                                <span className="text-purple-300 font-bold">🎯 TARGETED</span>
                              ) : (
                                <span className="text-slate-400">CLASS</span>
                              )}
                            </td>
                            <td className="p-3 font-mono">
                              {isSub ? (
                                <span
                                  className={`font-bold ${
                                    sub.status === "graded"
                                      ? "text-emerald-400"
                                      : sub.status === "submitted"
                                      ? "text-cyan-400"
                                      : "text-amber-400"
                                  }`}
                                >
                                  {sub.status.toUpperCase()}
                                </span>
                              ) : (
                                <span className="text-slate-500">NOT STARTED</span>
                              )}
                            </td>
                            <td className="p-3 font-mono text-amber-300">{isSub ? formatTime(sub.timeSpentSeconds) : "--"}</td>
                            <td className="p-3 font-mono font-bold text-cyan-300">
                              {isSub ? `${sub.score}/${sub.totalQuestions} (${sub.accuracyPercent}%)` : "--"}
                            </td>
                            <td className="p-3 font-space text-slate-300 max-w-xs truncate italic">
                              {sub?.studentNotes ? `"${sub.studentNotes}"` : "--"}
                            </td>
                            <td className="p-3 font-space text-purple-200 max-w-xs truncate">
                              {sub?.tutorFeedback || "--"}
                            </td>
                            <td className="p-3">
                              {isSub ? (
                                <button
                                  onClick={() => {
                                    setSelectedHwForGrading(hw.id);
                                    setTutorFeedbackDraft(sub.tutorFeedback || "");
                                  }}
                                  className="px-3 py-1 rounded bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-500/40 text-[10px] font-mono transition-colors cursor-pointer"
                                >
                                  Grade & Feedback
                                </button>
                              ) : (
                                <span className="text-[10px] font-mono text-slate-500">Awaiting Submission</span>
                              )}
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

          {/* Grading & Feedback Modal */}
          {selectedHwForGrading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="scifi-glass-card max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-purple-500/50 space-y-5 shadow-[0_0_40px_rgba(168,85,247,0.3)]">
                <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                  <h4 className="font-orbitron font-bold text-lg text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-purple-400" />
                    Tutor Grading & Feedback
                  </h4>
                  <button
                    onClick={() => setSelectedHwForGrading(null)}
                    className="text-slate-400 hover:text-white font-mono text-sm"
                  >
                    ✕
                  </button>
                </div>

                {(() => {
                  const hw = homeworkList.find((h) => h.id === selectedHwForGrading);
                  const sub = hw?.submissions[selectedStudentId];
                  if (!hw || !sub) return null;

                  return (
                    <div className="space-y-4 font-space text-xs">
                      {/* Submission Summary */}
                      <div className="p-3 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-1 font-mono text-[11px]">
                        <div className="text-white font-bold">{hw.title}</div>
                        <div className="flex justify-between text-slate-300 pt-1">
                          <span>Student: <span className="text-purple-300 font-bold">{sub.studentName}</span></span>
                          <span>Time: <span className="text-amber-300 font-bold">{formatTime(sub.timeSpentSeconds)}</span></span>
                          <span>Score: <span className="text-emerald-300 font-bold">{sub.score}/{sub.totalQuestions} ({sub.accuracyPercent}%)</span></span>
                        </div>
                        {sub.studentNotes && (
                          <div className="pt-2 border-t border-purple-500/20 text-slate-300 font-space italic">
                            Student Note: "{sub.studentNotes}"
                          </div>
                        )}
                      </div>

                      {/* Quick Feedback Presets */}
                      <div className="space-y-1.5">
                        <label className="text-purple-300 font-mono font-bold uppercase text-[10px]">
                          Quick Feedback Presets:
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            "Flawless execution! 100% accuracy and sharp pacing.",
                            "Great pacing. Remember finding vertex is x = -b/(2a).",
                            "Review question 3 sign conventions in the Formula Codex.",
                            "Scheduled for live 1-on-1 drill follow-up.",
                          ].map((preset, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => setTutorFeedbackDraft(preset)}
                              className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-purple-950 text-slate-300 hover:text-purple-200 border border-purple-500/20 transition-colors text-left"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Feedback Textarea */}
                      <div className="space-y-1">
                        <label className="text-purple-300 font-mono font-bold uppercase text-[10px]">
                          Personalized Coach Commentary:
                        </label>
                        <textarea
                          rows={4}
                          value={tutorFeedbackDraft}
                          onChange={(e) => setTutorFeedbackDraft(e.target.value)}
                          placeholder="Provide specific constructive feedback on pace, trap identification, or Desmos shortcuts..."
                          className="w-full p-3 rounded-2xl bg-slate-950 border border-purple-500/40 text-xs font-space text-white focus:outline-none focus:border-purple-400"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedHwForGrading(null)}
                          className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs font-mono"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveTutorFeedback(selectedHwForGrading, selectedStudentId)}
                          className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-black font-mono font-bold text-xs shadow-[0_0_12px_#a855f7] cursor-pointer"
                        >
                          Publish Graded Feedback
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CREATE & TARGET CUSTOM HOMEWORK MODAL */}
      {/* ========================================================================= */}
      {isCreateHwModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="scifi-glass-card max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-cyan-500/50 space-y-6 shadow-[0_0_40px_rgba(6,182,212,0.3)] my-8">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
              <div className="flex items-center gap-2 font-orbitron font-bold text-lg text-white">
                <Target className="w-5 h-5 text-cyan-400" />
                <span>Author & Assign Targeted SAT Homework</span>
              </div>
              <button
                onClick={() => setIsCreateHwModalOpen(false)}
                className="text-slate-400 hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewHomework} className="space-y-5 font-space text-xs">
              {/* TARGET AUDIENCE SELECTION */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-3">
                <div className="text-purple-300 font-mono font-bold uppercase text-[10px] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span>Assign Target Audience:</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "single", label: "Single Student" },
                    { id: "multiple", label: "Multi-Select" },
                    { id: "tier", label: "By Score Tier" },
                    { id: "all", label: "All Students" },
                  ].map((target) => (
                    <button
                      key={target.id}
                      type="button"
                      onClick={() => setAssignTargetType(target.id as any)}
                      className={`p-2 rounded-xl text-xs font-mono font-bold transition-all text-center cursor-pointer border ${
                        assignTargetType === target.id
                          ? "bg-purple-500 text-black border-purple-400 shadow-[0_0_10px_#a855f7]"
                          : "bg-slate-900 text-slate-300 border-purple-500/20 hover:bg-slate-800"
                      }`}
                    >
                      {target.label}
                    </button>
                  ))}
                </div>

                {/* Single Student Dropdown */}
                {assignTargetType === "single" && (
                  <div className="space-y-1 pt-1">
                    <label className="text-slate-300 font-mono text-[10px]">Select Particular Student:</label>
                    <select
                      value={targetSingleStudentId}
                      onChange={(e) => setTargetSingleStudentId(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-purple-500/40 text-white font-mono text-xs focus:outline-none"
                    >
                      {studentProfiles.map((s, idx) => (
                        <option key={`hw-single-opt-${s.id}-${idx}`} value={s.id}>
                          {s.name} — {s.highSchoolGrade} (Target: {s.targetScore}, Weakness: {s.weakestDomains?.[0] || "General"})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Multiple Student Checkboxes */}
                {assignTargetType === "multiple" && (
                  <div className="space-y-1 pt-1">
                    <label className="text-slate-300 font-mono text-[10px]">Choose Specific Students:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {studentProfiles.map((s, idx) => {
                        const isChecked = targetMultiStudentIds.includes(s.id);
                        return (
                          <div
                            key={`hw-multi-box-${s.id}-${idx}`}
                            onClick={() => {
                              if (isChecked) {
                                setTargetMultiStudentIds(targetMultiStudentIds.filter((id) => id !== s.id));
                              } else {
                                setTargetMultiStudentIds([...targetMultiStudentIds, s.id]);
                              }
                            }}
                            className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between cursor-pointer transition-colors ${
                              isChecked
                                ? "bg-purple-950 border-purple-400 text-purple-200"
                                : "bg-slate-900 border-slate-800 text-slate-400"
                            }`}
                          >
                            <span>{s.name}</span>
                            {isChecked && <Check className="w-3.5 h-3.5 text-purple-400" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Score Tier Option */}
                {assignTargetType === "tier" && (
                  <div className="space-y-1 pt-1">
                    <label className="text-slate-300 font-mono text-[10px]">Select Student Cohort Tier:</label>
                    <select
                      value={targetTierOption}
                      onChange={(e) => setTargetTierOption(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-purple-500/40 text-white font-mono text-xs focus:outline-none"
                    >
                      <option value="elite">Elite Tier (1550+ Ivy League Targets)</option>
                      <option value="pro">Pro Tier (1450-1540 Top 20 Targets)</option>
                      <option value="plus">Plus Tier (1350-1440 Foundation)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <label className="text-cyan-300 font-mono font-bold uppercase text-[10px]">Homework Mission Title</label>
                <input
                  type="text"
                  required
                  value={newHwTitle}
                  onChange={(e) => setNewHwTitle(e.target.value)}
                  placeholder="HW #08: Quadratic Discriminant & Parabola Vertex Mastery"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-cyan-500/30 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-cyan-300 font-mono font-bold uppercase text-[10px]">Description & Learning Objectives</label>
                <textarea
                  rows={2}
                  value={newHwDesc}
                  onChange={(e) => setNewHwDesc(e.target.value)}
                  placeholder="Targeting discriminant b²-4ac conditions, vertex coordinates, and intersection points."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-cyan-500/30 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Tutor Personal Coaching Note */}
              <div className="space-y-1">
                <label className="text-purple-300 font-mono font-bold uppercase text-[10px]">
                  Personal Tutor Note for Assigned Student(s) (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newHwTutorNote}
                  onChange={(e) => setNewHwTutorNote(e.target.value)}
                  placeholder="e.g., Focus on your negative sign distribution on question 3. Use Desmos to check vertex coordinates."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-purple-500/30 text-white focus:outline-none focus:border-purple-400 placeholder:text-slate-600"
                />
              </div>

              {/* Section, Domain, Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-cyan-300 font-mono font-bold uppercase text-[10px]">Section</label>
                  <select
                    value={newHwSection}
                    onChange={(e) => setNewHwSection(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-white focus:outline-none font-mono"
                  >
                    <option value="Math">Math</option>
                    <option value="Reading & Writing">Reading & Writing</option>
                    <option value="Full Test">Full Test</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-cyan-300 font-mono font-bold uppercase text-[10px]">Domain</label>
                  <select
                    value={newHwDomain}
                    onChange={(e) => setNewHwDomain(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-white focus:outline-none font-mono"
                  >
                    {newHwSection === "Math" ? (
                      <>
                        <option value="Algebra">Algebra</option>
                        <option value="Advanced Math">Advanced Math</option>
                        <option value="Problem Solving & Data Analysis">Problem Solving & Data</option>
                        <option value="Geometry & Trigonometry">Geometry & Trigonometry</option>
                      </>
                    ) : (
                      <>
                        <option value="Craft and Structure">Craft and Structure</option>
                        <option value="Information and Ideas">Information and Ideas</option>
                        <option value="Standard English Conventions">Standard English Conventions</option>
                        <option value="Expression of Ideas">Expression of Ideas</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-cyan-300 font-mono font-bold uppercase text-[10px]">Due Date</label>
                  <input
                    type="date"
                    value={newHwDueDate}
                    onChange={(e) => setNewHwDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Question Count, Est Minutes, Difficulty */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-cyan-300 font-mono font-bold uppercase text-[10px]">Question Count</label>
                  <select
                    value={newHwQuestionCount}
                    onChange={(e) => setNewHwQuestionCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-white focus:outline-none font-mono"
                  >
                    <option value={3}>3 Questions (Quick Drill)</option>
                    <option value={5}>5 Questions (Standard)</option>
                    <option value={8}>8 Questions (Extended)</option>
                    <option value={10}>10 Questions (Mastery Set)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-cyan-300 font-mono font-bold uppercase text-[10px]">Est. Time (Mins)</label>
                  <input
                    type="number"
                    value={newHwEstMinutes}
                    onChange={(e) => setNewHwEstMinutes(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-white focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-cyan-300 font-mono font-bold uppercase text-[10px]">Difficulty</label>
                  <select
                    value={newHwDifficulty}
                    onChange={(e) => setNewHwDifficulty(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-white focus:outline-none font-mono"
                  >
                    <option value="Hard">Hard (Module 2 Target)</option>
                    <option value="Medium">Medium</option>
                    <option value="Easy">Easy (Foundational)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-cyan-300 font-mono font-bold uppercase text-[10px]">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newHwTags}
                  onChange={(e) => setNewHwTags(e.target.value)}
                  placeholder="Targeted Drill, Speed Set, Parabolas"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-white focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-cyan-500/20">
                <button
                  type="button"
                  onClick={() => setIsCreateHwModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 font-mono text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs shadow-[0_0_15px_#00f0ff] cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish & Assign Homework</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SUBMIT CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="scifi-glass-card max-w-md w-full p-6 sm:p-8 rounded-3xl border border-cyan-500/50 space-y-5 shadow-[0_0_40px_rgba(6,182,212,0.4)] text-center">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-500/40 text-cyan-300 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Send className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-orbitron font-bold text-white">Submit Homework Mission?</h4>
              <p className="text-xs font-space text-slate-300">
                You have answered <span className="font-bold text-cyan-300">{Object.keys(currentAnswers).length}</span> of{" "}
                <span className="font-bold text-white">{activeAssignment?.questions.length}</span> questions in{" "}
                <span className="font-bold text-amber-400">{formatTime(liveTimerSeconds)}</span>.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs border border-cyan-500/20 cursor-pointer"
              >
                Return to Test
              </button>
              <button
                onClick={handleSubmitHomework}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs shadow-[0_0_15px_#10b981] cursor-pointer"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
