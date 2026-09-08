import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  Timer,
  TimerOff,
  Flag,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Calculator,
  PenTool,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Check,
  AlertCircle,
  Zap,
  FileText,
  Layers,
  Shuffle,
  Trophy,
  Target,
  BarChart2,
  TrendingUp,
  TrendingDown,
  Flame,
  Gauge,
  Sliders,
  Play,
  Pause,
  Eye,
  EyeOff,
} from "lucide-react";
import confetti from "canvas-confetti";
import { SATQuestion, SATSection, SATDomain, DifficultyLevel, QuizAttempt } from "../types";
import { OwlyLogoIcon } from "./OwlyLogo";
import { safeStorage } from "../utils/storage";

interface PracticeViewProps {
  questions: SATQuestion[];
  onRecordAttempt: (attempt: QuizAttempt) => void;
  onOpenCalculator: () => void;
  onOpenScratchpad: () => void;
  onOpenAiTutor: (question: SATQuestion, selectedOption: number | null) => void;
  initialDomainFilter?: SATDomain | null;
  onGenerateNewAiQuestions: (domain: SATDomain, difficulty: DifficultyLevel) => Promise<void>;
  isGeneratingAiDrill: boolean;
}

// Progress Ring Component for Visual Feedback
const ProgressRing: React.FC<{
  progress: number;
  size?: number;
  strokeWidth?: number;
  subText?: string;
  accuracy?: number;
}> = ({ progress, size = 52, strokeWidth = 4.5, subText, accuracy }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-800"
          fill="transparent"
        />
        {/* Progress stroke with smooth transition */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-500 ease-out ${
            progress === 100 ? "text-cyan-400 drop-shadow-[0_0_8px_#00f0ff]" : "text-cyan-500"
          }`}
          fill="transparent"
        />
      </svg>
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none pointer-events-none">
        <span className="text-[11px] font-black font-mono text-cyan-300 tracking-tight">
          {progress}%
        </span>
        {subText && <span className="text-[8px] font-mono font-bold text-slate-400 mt-0.5">{subText}</span>}
      </div>
    </div>
  );
};

// High quality Mulberry32 PRNG Fisher-Yates shuffle
function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array];
  if (result.length <= 1) return result;
  let s = (Math.abs(seed) + 1) >>> 0;
  const nextRand = () => {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(nextRand() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  questions,
  onRecordAttempt,
  onOpenCalculator,
  onOpenScratchpad,
  onOpenAiTutor,
  initialDomainFilter,
  onGenerateNewAiQuestions,
  isGeneratingAiDrill,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<string, number[]>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Record<string, boolean>>({});
  const [mode, setMode] = useState<"practice" | "timed">("practice");
  const [timeLeft, setTimeLeft] = useState<number>(90); // 90s per question typical SAT pace
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Custom Session Question Count Configuration
  const [sessionQuestionLimit, setSessionQuestionLimit] = useState<number | "all">(() => {
    return safeStorage.get<number | "all">("sat_practice_session_limit", 10);
  });
  const [isSessionConfigOpen, setIsSessionConfigOpen] = useState<boolean>(false);
  const [customInputCount, setCustomInputCount] = useState<string>("10");
  const [shuffleSeed, setShuffleSeed] = useState<number>(() => Math.floor(Math.random() * 1000000) + 1);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState<boolean>(false);
  const [hasCelebratedCompletion, setHasCelebratedCompletion] = useState<boolean>(false);

  // Subtle Countdown Timer & Exam Pressure State
  const [isCountdownEnabled, setIsCountdownEnabled] = useState<boolean>(() => {
    return safeStorage.get<boolean>("sat_practice_countdown_enabled", true);
  });
  const [isTimerHidden, setIsTimerHidden] = useState<boolean>(() => {
    return safeStorage.get<boolean>("sat_practice_timer_hidden", false);
  });
  const [countdownPaceMode, setCountdownPaceMode] = useState<"auto" | "71s" | "95s" | "60s" | "90s" | "120s">(() => {
    return safeStorage.get<"auto" | "71s" | "95s" | "60s" | "90s" | "120s">("sat_practice_countdown_pace", "auto");
  });
  const [overtimeSeconds, setOvertimeSeconds] = useState<number>(0);
  const [isTimerConfigOpen, setIsTimerConfigOpen] = useState<boolean>(false);

  const sessionConfigRef = useRef<HTMLDivElement>(null);
  const timerConfigRef = useRef<HTMLDivElement>(null);

  // Filters
  const [selectedSection, setSelectedSection] = useState<"All" | SATSection>("All");
  const [selectedDomain, setSelectedDomain] = useState<"All" | SATDomain>(initialDomainFilter || "All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"All" | DifficultyLevel>("All");
  const [onlyUploadedSource, setOnlyUploadedSource] = useState<boolean>(false);

  // Adaptive Difficulty State & Controls
  const [isAdaptiveEnabled, setIsAdaptiveEnabled] = useState<boolean>(() => {
    return safeStorage.get<boolean>("sat_practice_adaptive_mode", true);
  });
  const [currentAdaptiveDifficulty, setCurrentAdaptiveDifficulty] = useState<DifficultyLevel>("Medium");
  const [correctStreak, setCorrectStreak] = useState<number>(0);
  const [incorrectStreak, setIncorrectStreak] = useState<number>(0);
  const [adaptiveNotification, setAdaptiveNotification] = useState<{
    type: "upgrade" | "downgrade" | "maintained";
    message: string;
    from: DifficultyLevel;
    to: DifficultyLevel;
  } | null>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sessionConfigRef.current && !sessionConfigRef.current.contains(event.target as Node)) {
        setIsSessionConfigOpen(false);
      }
      if (timerConfigRef.current && !timerConfigRef.current.contains(event.target as Node)) {
        setIsTimerConfigOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Target pace calculator for active question
  const getQuestionTargetPace = (q: SATQuestion | undefined, paceMode: string): number => {
    if (paceMode === "60s") return 60;
    if (paceMode === "71s") return 71;
    if (paceMode === "90s") return 90;
    if (paceMode === "95s") return 95;
    if (paceMode === "120s") return 120;
    // "auto" mode: Authentic Digital SAT timing:
    // Reading & Writing = 71 seconds (32 min for 27 Qs)
    // Math = 95 seconds (35 min for 22 Qs)
    if (q?.section === "Reading & Writing") return 71;
    return 95;
  };

  // Toggle and save countdown timer active state
  const handleToggleCountdown = (enabled: boolean) => {
    setIsCountdownEnabled(enabled);
    safeStorage.set("sat_practice_countdown_enabled", enabled);
  };

  // Toggle and save hide/show timer digits (Bluebook style)
  const handleToggleHideTimer = () => {
    const nextVal = !isTimerHidden;
    setIsTimerHidden(nextVal);
    safeStorage.set("sat_practice_timer_hidden", nextVal);
  };

  // Update countdown pacing preset
  const handleSetPaceMode = (modeVal: "auto" | "71s" | "95s" | "60s" | "90s" | "120s") => {
    setCountdownPaceMode(modeVal);
    safeStorage.set("sat_practice_countdown_pace", modeVal);
    const pace = getQuestionTargetPace(activeQuestion, modeVal);
    setTimeLeft(pace);
    setOvertimeSeconds(0);
    setIsTimerConfigOpen(false);
  };

  // Toggle and save adaptive mode setting
  const handleToggleAdaptiveMode = (enabled: boolean) => {
    setIsAdaptiveEnabled(enabled);
    safeStorage.set("sat_practice_adaptive_mode", enabled);
    if (!enabled && selectedDifficulty !== "All") {
      setCurrentAdaptiveDifficulty(selectedDifficulty);
    }
  };

  // Filter questions base pool
  const filteredPool = useMemo(() => {
    return questions.filter((q) => {
      if (selectedSection !== "All" && q.section !== selectedSection) return false;
      if (selectedDomain !== "All" && q.domain !== selectedDomain) return false;
      // If adaptive is active, we don't strictly filter out all other difficulties so the session can adapt smoothly
      if (!isAdaptiveEnabled) {
        if (selectedDifficulty !== "All" && q.difficulty !== selectedDifficulty) return false;
      }
      if (onlyUploadedSource && !q.source?.includes("Uploaded")) return false;
      return true;
    });
  }, [questions, selectedSection, selectedDomain, selectedDifficulty, onlyUploadedSource, isAdaptiveEnabled]);

  // Derive custom session slice with adaptive difficulty prioritizing using robust Fisher-Yates shuffle
  const sessionQuestions = useMemo(() => {
    let pool = [...filteredPool];
    if (isAdaptiveEnabled) {
      // In adaptive mode, prioritize starting with the current adaptive difficulty, then others
      const targetDiff = currentAdaptiveDifficulty;
      const targetList = seededShuffle(pool.filter((q) => q.difficulty === targetDiff), shuffleSeed);
      const remainingList = seededShuffle(pool.filter((q) => q.difficulty !== targetDiff), shuffleSeed + 997);

      pool = [...targetList, ...remainingList];
    } else {
      // Deterministic Fisher-Yates shuffle with seed
      pool = seededShuffle(pool, shuffleSeed);
    }

    if (sessionQuestionLimit === "all") {
      return pool;
    }
    return pool.slice(0, Math.max(1, sessionQuestionLimit));
  }, [filteredPool, sessionQuestionLimit, shuffleSeed, isAdaptiveEnabled, currentAdaptiveDifficulty]);

  const activeQuestion: SATQuestion | undefined = sessionQuestions[currentIndex] || sessionQuestions[0];

  // Session stats calculation
  const totalSessionCount = sessionQuestions.length;
  const answeredQuestions = sessionQuestions.filter(
    (q) => selectedAnswers[q.id] !== undefined && selectedAnswers[q.id] >= 0
  );
  const answeredCount = answeredQuestions.length;
  const correctCount = answeredQuestions.filter(
    (q) => selectedAnswers[q.id] === q.correctAnswerIndex
  ).length;
  const completionProgress = totalSessionCount > 0 ? Math.round((answeredCount / totalSessionCount) * 100) : 0;
  const accuracyPercentage = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  // Persist session limit choice
  const handleUpdateSessionLimit = (newLimit: number | "all") => {
    setSessionQuestionLimit(newLimit);
    safeStorage.set("sat_practice_session_limit", newLimit);
    setCurrentIndex(0);
    setIsSessionConfigOpen(false);
    setHasCelebratedCompletion(false);
  };

  // Check for 100% completion celebration
  useEffect(() => {
    if (totalSessionCount > 0 && answeredCount === totalSessionCount && !hasCelebratedCompletion) {
      setHasCelebratedCompletion(true);
      setIsCompletedModalOpen(true);
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#10b981", "#3b82f6", "#f59e0b"],
      });
    }
  }, [answeredCount, totalSessionCount, hasCelebratedCompletion]);

  // Current target pace for active question
  const currentTargetPace = getQuestionTargetPace(activeQuestion, countdownPaceMode);

  // Timer tick for exam pressure countdown & timed mode
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && (isCountdownEnabled || mode === "timed")) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev > 0) {
            return prev - 1;
          } else {
            setOvertimeSeconds((ot) => ot + 1);
            return 0;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isCountdownEnabled, mode]);

  // Reset timer on question switch or pace mode adjustment
  useEffect(() => {
    const pace = getQuestionTargetPace(activeQuestion, countdownPaceMode);
    setTimeLeft(pace);
    setOvertimeSeconds(0);
  }, [currentIndex, activeQuestion?.id, countdownPaceMode]);

  const handleSelectOption = (optionIndex: number) => {
    if (!activeQuestion) return;
    const isAlreadySelected = selectedAnswers[activeQuestion.id] === optionIndex;
    const newSelection = isAlreadySelected ? -1 : optionIndex;

    const newAnswers = { ...selectedAnswers, [activeQuestion.id]: newSelection };
    setSelectedAnswers(newAnswers);

    // Record attempt if an option was chosen
    if (newSelection >= 0) {
      const isCorrect = newSelection === activeQuestion.correctAnswerIndex;
      const targetPace = getQuestionTargetPace(activeQuestion, countdownPaceMode);
      const measuredTime = isCountdownEnabled || mode === "timed"
        ? Math.max(1, (targetPace - timeLeft) + overtimeSeconds)
        : 45;

      onRecordAttempt({
        questionId: activeQuestion.id,
        selectedAnswerIndex: newSelection,
        isCorrect,
        timeSpentSeconds: measuredTime,
        timestamp: Date.now(),
      });

      // Adaptive Difficulty Engine Logic:
      // When adaptive mode is enabled:
      // 1. Maintain a 3-question correct streak -> increase difficulty (Easy -> Medium -> Hard)
      // 2. If student struggles (2 consecutive incorrect OR 1 incorrect on Hard) -> decrease difficulty (Hard -> Medium -> Easy)
      if (isAdaptiveEnabled) {
        if (isCorrect) {
          const newStreak = correctStreak + 1;
          setCorrectStreak(newStreak);
          setIncorrectStreak(0);

          if (newStreak >= 3) {
            // Check if we can elevate difficulty
            if (currentAdaptiveDifficulty === "Easy") {
              setCurrentAdaptiveDifficulty("Medium");
              setCorrectStreak(0);
              setAdaptiveNotification({
                type: "upgrade",
                message: "🔥 3-in-a-row correct streak! Difficulty dynamically elevated to Medium.",
                from: "Easy",
                to: "Medium",
              });
              setTimeout(() => setAdaptiveNotification(null), 4500);
            } else if (currentAdaptiveDifficulty === "Medium") {
              setCurrentAdaptiveDifficulty("Hard");
              setCorrectStreak(0);
              setAdaptiveNotification({
                type: "upgrade",
                message: "⚡ 3-in-a-row mastery! Question complexity promoted to Hard (99th Percentile Tier).",
                from: "Medium",
                to: "Hard",
              });
              setTimeout(() => setAdaptiveNotification(null), 4500);
            } else {
              setAdaptiveNotification({
                type: "maintained",
                message: "🏆 Peak performance streak! You are maintaining mastery at Hard (Max Difficulty).",
                from: "Hard",
                to: "Hard",
              });
              setTimeout(() => setAdaptiveNotification(null), 4000);
            }
          }
        } else {
          // Incorrect response
          const newIncStreak = incorrectStreak + 1;
          setIncorrectStreak(newIncStreak);
          setCorrectStreak(0);

          // Struggle adjustment: If 2 incorrect in a row OR struggling on Hard
          if (currentAdaptiveDifficulty === "Hard") {
            setCurrentAdaptiveDifficulty("Medium");
            setIncorrectStreak(0);
            setAdaptiveNotification({
              type: "downgrade",
              message: "Adaptive Calibration: Difficulty adjusted to Medium to reinforce fundamental concepts.",
              from: "Hard",
              to: "Medium",
            });
            setTimeout(() => setAdaptiveNotification(null), 4500);
          } else if (currentAdaptiveDifficulty === "Medium" && newIncStreak >= 2) {
            setCurrentAdaptiveDifficulty("Easy");
            setIncorrectStreak(0);
            setAdaptiveNotification({
              type: "downgrade",
              message: "Adaptive Calibration: Difficulty softened to Easy for concept rebuilding and confidence.",
              from: "Medium",
              to: "Easy",
            });
            setTimeout(() => setAdaptiveNotification(null), 4500);
          }
        }
      }

      if (isCorrect && mode === "practice") {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#6366f1", "#10b981", "#3b82f6"],
        });
      }
    }
  };

  const toggleEliminateOption = (optionIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeQuestion) return;
    const currentElims = eliminatedOptions[activeQuestion.id] || [];
    const updated = currentElims.includes(optionIndex)
      ? currentElims.filter((idx) => idx !== optionIndex)
      : [...currentElims, optionIndex];
    setEliminatedOptions({ ...eliminatedOptions, [activeQuestion.id]: updated });
  };

  const toggleFlag = () => {
    if (!activeQuestion) return;
    setFlaggedQuestions({
      ...flaggedQuestions,
      [activeQuestion.id]: !flaggedQuestions[activeQuestion.id],
    });
  };

  const toggleRevealExplanation = () => {
    if (!activeQuestion) return;
    setRevealedExplanations({
      ...revealedExplanations,
      [activeQuestion.id]: !revealedExplanations[activeQuestion.id],
    });
  };

  const handleGenerateDrill = async () => {
    const domainToGen: SATDomain = selectedDomain !== "All" ? selectedDomain : "Algebra";
    const diffToGen: DifficultyLevel = selectedDifficulty !== "All" ? selectedDifficulty : "Medium";
    await onGenerateNewAiQuestions(domainToGen, diffToGen);
  };

  const handleRestartSession = () => {
    setCurrentIndex(0);
    setHasCelebratedCompletion(false);
    setIsCompletedModalOpen(false);
    setShuffleSeed(Date.now() + Math.floor(Math.random() * 10000));
  };

  const PRESET_SESSION_SIZES: (number | "all")[] = [5, 10, 15, 20, 25, 50, "all"];

  if (!activeQuestion) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-900">No questions match your current filters</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Try resetting the filters or generate fresh AI practice questions for this domain.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              setSelectedSection("All");
              setSelectedDomain("All");
              setSelectedDifficulty("All");
              setOnlyUploadedSource(false);
              setSessionQuestionLimit(10);
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Reset Filters
          </button>
          <button
            onClick={handleGenerateDrill}
            disabled={isGeneratingAiDrill}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            Generate AI Drill Questions
          </button>
        </div>
      </div>
    );
  }

  const selectedAnswer = selectedAnswers[activeQuestion.id];
  const isAnswered = selectedAnswer !== undefined && selectedAnswer >= 0;
  const isCorrect = isAnswered && selectedAnswer === activeQuestion.correctAnswerIndex;
  const isFlagged = flaggedQuestions[activeQuestion.id];
  const isExplanationRevealed = revealedExplanations[activeQuestion.id] || mode === "timed";
  const elimsForCurrent = eliminatedOptions[activeQuestion.id] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Top Filter & Toolbar Bar with Session Config & Live Progress Ring */}
      <div className="scifi-glass-card rounded-2xl p-4 sm:p-5 flex items-center justify-between flex-wrap gap-4">
        {/* Left: Filters & Session Size Picker */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 text-xs font-mono font-bold text-cyan-400 border border-cyan-500/30">
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>FILTERS:</span>
          </div>

          <select
            value={selectedSection}
            onChange={(e) => {
              setSelectedSection(e.target.value as any);
              setCurrentIndex(0);
              setHasCelebratedCompletion(false);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs font-mono font-semibold text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="All">All Sections</option>
            <option value="Math">Math Matrix</option>
            <option value="Reading & Writing">Reading & Writing</option>
          </select>

          <select
            value={selectedDomain}
            onChange={(e) => {
              setSelectedDomain(e.target.value as any);
              setCurrentIndex(0);
              setHasCelebratedCompletion(false);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs font-mono font-semibold text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="All">All Domains</option>
            <option value="Algebra">Algebra</option>
            <option value="Advanced Math">Advanced Math</option>
            <option value="Problem Solving & Data Analysis">Problem Solving & Data</option>
            <option value="Geometry & Trigonometry">Geometry & Trig</option>
            <option value="Information and Ideas">Information & Ideas</option>
            <option value="Craft and Structure">Craft & Structure</option>
            <option value="Standard English Conventions">Grammar & Conventions</option>
            <option value="Expression of Ideas">Expression of Ideas</option>
          </select>

          <select
            value={selectedDifficulty}
            disabled={isAdaptiveEnabled}
            onChange={(e) => {
              setSelectedDifficulty(e.target.value as any);
              setCurrentIndex(0);
              setHasCelebratedCompletion(false);
            }}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono font-semibold focus:outline-none ${
              isAdaptiveEnabled
                ? "bg-slate-900/40 text-slate-500 border-slate-800 cursor-not-allowed"
                : "bg-slate-900/90 border-cyan-500/30 text-slate-200 focus:border-cyan-400"
            }`}
            title={isAdaptiveEnabled ? "Difficulty is managed adaptively based on your streaks" : "Filter questions by static difficulty"}
          >
            <option value="All">All Complexities</option>
            <option value="Easy">Easy (Level 1)</option>
            <option value="Medium">Medium (Level 2)</option>
            <option value="Hard">Hard (Level 3)</option>
          </select>

          {/* Adaptive Difficulty Mode Toggle */}
          <button
            id="adaptive-difficulty-toggle"
            onClick={() => handleToggleAdaptiveMode(!isAdaptiveEnabled)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 ${
              isAdaptiveEnabled
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)] ring-1 ring-cyan-500/30"
                : "bg-slate-900/80 text-slate-400 border-slate-700 hover:bg-slate-800"
            }`}
            title="Automatically scales question complexity based on 3-streak performance or struggle patterns"
          >
            <Gauge className={`w-3.5 h-3.5 ${isAdaptiveEnabled ? "text-cyan-400" : "text-slate-400"}`} />
            <span>ADAPTIVE: {isAdaptiveEnabled ? "ON" : "OFF"}</span>
          </button>

          {/* Countdown Timer Exam Pressure Toggle */}
          <button
            id="countdown-timer-toggle-top"
            onClick={() => handleToggleCountdown(!isCountdownEnabled)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 ${
              isCountdownEnabled
                ? "bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)] ring-1 ring-amber-500/30"
                : "bg-slate-900/80 text-slate-400 border-slate-700 hover:bg-slate-800"
            }`}
            title="Toggle subtle exam pressure countdown timer to simulate genuine SAT test pace"
          >
            <Timer className={`w-3.5 h-3.5 ${isCountdownEnabled ? "text-amber-400" : "text-slate-400"}`} />
            <span>TIMER: {isCountdownEnabled ? "ON" : "OFF"}</span>
          </button>

          <button
            onClick={() => {
              setOnlyUploadedSource(!onlyUploadedSource);
              setCurrentIndex(0);
              setHasCelebratedCompletion(false);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 ${
              onlyUploadedSource
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-400 shadow-xs"
                : "bg-slate-900/80 text-slate-400 border-slate-700 hover:bg-slate-800"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Uploaded Only</span>
          </button>
        </div>

        {/* Right: Custom Session Count Selector & Progress Ring Status */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Adaptive Streak Status Badge */}
          {isAdaptiveEnabled && (
            <div
              id="adaptive-streak-indicator"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs font-bold shadow-xs"
              title="Adaptive Calibration: 3 correct in a row levels up; 2 incorrect levels down."
            >
              <div className="flex items-center gap-1">
                <Flame
                  className={`w-4 h-4 ${
                    correctStreak > 0 ? "text-amber-400 fill-amber-400 animate-bounce" : "text-slate-500"
                  }`}
                />
                <span className="font-mono text-cyan-300">
                  {correctStreak}/3
                </span>
              </div>
              <span className="text-slate-600">|</span>
              <span
                className={`text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded-md ${
                  currentAdaptiveDifficulty === "Easy"
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                    : currentAdaptiveDifficulty === "Medium"
                    ? "bg-amber-950 text-amber-300 border border-amber-500/40"
                    : "bg-rose-950 text-rose-300 border border-rose-500/40"
                }`}
              >
                {currentAdaptiveDifficulty}
              </span>
            </div>
          )}
          {/* Custom Question Count Popover Button */}
          <div className="relative" ref={sessionConfigRef}>
            <button
              id="practice-session-size-button"
              onClick={() => setIsSessionConfigOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 text-xs font-mono font-bold text-slate-200 transition-all shadow-xs"
              title="Configure number of questions for this session"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                Session:{" "}
                <span className="font-mono text-cyan-300">
                  {sessionQuestionLimit === "all" ? `All (${totalSessionCount})` : `${sessionQuestionLimit} Qs`}
                </span>
              </span>
            </button>

            {/* Session Configuration Dropdown Popover */}
            {isSessionConfigOpen && (
              <div
                id="practice-session-size-popover"
                className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-slate-950 rounded-2xl border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.3)] p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono font-bold text-white">Custom Session Length</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                    {filteredPool.length} available
                  </span>
                </div>

                <div className="py-3 space-y-3">
                  <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Select Question Count:
                  </div>

                  {/* Preset Pills */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {PRESET_SESSION_SIZES.map((size) => {
                      const isSelected = sessionQuestionLimit === size;
                      const label = size === "all" ? "All" : `${size}`;
                      return (
                        <button
                          key={size.toString()}
                          onClick={() => handleUpdateSessionLimit(size)}
                          className={`py-1.5 rounded-xl text-xs font-bold font-mono transition-all border ${
                            isSelected
                              ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                              : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Number Input */}
                  <div className="pt-2 border-t border-slate-800">
                    <label className="text-[11px] font-mono font-bold text-slate-400 block mb-1.5">
                      Or enter custom count:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max={filteredPool.length}
                        value={customInputCount}
                        onChange={(e) => setCustomInputCount(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-400"
                        placeholder="e.g. 12"
                      />
                      <button
                        onClick={() => {
                          const val = parseInt(customInputCount, 10);
                          if (!isNaN(val) && val > 0) {
                            handleUpdateSessionLimit(Math.min(val, filteredPool.length));
                          }
                        }}
                        className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold rounded-xl shrink-0 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Shuffle Button */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setShuffleSeed(Date.now() + Math.floor(Math.random() * 10000));
                        setCurrentIndex(0);
                        setHasCelebratedCompletion(false);
                      }}
                      className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      <span>Randomize / Shuffle Questions</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Progress Ring Widget */}
          <div
            id="practice-session-progress-ring"
            className="flex items-center gap-3 bg-slate-900/90 px-3 py-1.5 rounded-2xl border border-cyan-500/30"
            title={`Session Progress: ${answeredCount}/${totalSessionCount} answered (${completionProgress}%)`}
          >
            <ProgressRing progress={completionProgress} size={42} strokeWidth={3.8} />
            <div className="text-left">
              <div className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider leading-none mb-0.5">
                Session Progress
              </div>
              <div className="text-xs font-extrabold text-white font-mono flex items-center gap-1">
                <span>{answeredCount}</span>
                <span className="text-slate-500 font-normal">/</span>
                <span>{totalSessionCount}</span>
                <span className="text-[10px] text-cyan-400 font-sans font-semibold">Qs</span>
              </div>
            </div>
          </div>

          {/* Mode Toggle */}
          <button
            onClick={() => setMode(mode === "practice" ? "timed" : "practice")}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
              mode === "timed"
                ? "bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                : "bg-cyan-500/20 text-cyan-300 border-cyan-400/40 hover:bg-cyan-500/30"
            }`}
          >
            {mode === "timed" ? "⏱️ Exam Mode" : "💡 Practice Mode"}
          </button>
        </div>
      </div>

      {/* Adaptive Difficulty Elevation / Calibration Banner */}
      {adaptiveNotification && (
        <div
          id="adaptive-difficulty-notification"
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-top-3 duration-300 ${
            adaptiveNotification.type === "upgrade"
              ? "bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border-emerald-300 text-emerald-950"
              : adaptiveNotification.type === "downgrade"
              ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 text-amber-950"
              : "bg-indigo-50 border-indigo-200 text-indigo-950"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-xs ${
                adaptiveNotification.type === "upgrade"
                  ? "bg-emerald-600"
                  : adaptiveNotification.type === "downgrade"
                  ? "bg-amber-600"
                  : "bg-indigo-600"
              }`}
            >
              {adaptiveNotification.type === "upgrade" ? (
                <TrendingUp className="w-5 h-5" />
              ) : adaptiveNotification.type === "downgrade" ? (
                <TrendingDown className="w-5 h-5" />
              ) : (
                <Flame className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="text-xs font-black tracking-wide uppercase flex items-center gap-2">
                <span>{adaptiveNotification.type === "upgrade" ? "Adaptive Level Up" : adaptiveNotification.type === "downgrade" ? "Adaptive Calibration" : "Peak Performance"}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/80 border border-black/10 font-bold">
                  {adaptiveNotification.from} ➔ {adaptiveNotification.to}
                </span>
              </div>
              <p className="text-xs font-medium mt-0.5 opacity-90">{adaptiveNotification.message}</p>
            </div>
          </div>
          <button
            onClick={() => setAdaptiveNotification(null)}
            className="p-1 rounded-lg hover:bg-black/5 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Session 100% Completion Banner (shown if finished) */}
      {answeredCount === totalSessionCount && totalSessionCount > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 rounded-3xl p-5 border border-emerald-200 shadow-xs flex items-center justify-between flex-wrap gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-extrabold text-slate-900">Custom Practice Session Complete!</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  100% Finished
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                You answered all {totalSessionCount} questions with <span className="font-bold text-emerald-700">{correctCount}/{totalSessionCount} correct ({accuracyPercentage}% accuracy)</span>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRestartSession}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start New Drill</span>
            </button>
            <button
              onClick={() => setIsSessionConfigOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 transition-all"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Change Session Length</span>
            </button>
          </div>
        </div>
      )}

      {/* Main SAT Test Canvas (Sci-Fi Dual-Pane Cyber Cockpit Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Passage or Context or Data Table */}
        <div className="lg:col-span-6 scifi-glass-card rounded-2xl overflow-hidden h-full min-h-[480px] flex flex-col">
          <div className="px-6 py-4 bg-slate-900/90 border-b border-cyan-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                {activeQuestion.section} • {activeQuestion.domain}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                  activeQuestion.difficulty === "Easy"
                    ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                    : activeQuestion.difficulty === "Medium"
                    ? "bg-amber-950 text-amber-300 border-amber-500/40"
                    : "bg-rose-950 text-rose-300 border-rose-500/40"
                }`}
              >
                {isAdaptiveEnabled && <Gauge className="w-2.5 h-2.5" />}
                <span>{activeQuestion.difficulty}</span>
              </span>
              {isAdaptiveEnabled && (
                <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                  Streak: {correctStreak}/3
                </span>
              )}
              {activeQuestion.source && (
                <span className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
                  {activeQuestion.source}
                </span>
              )}
            </div>
          </div>

          <div className="p-6 flex-1 overflow-y-auto space-y-4 text-slate-200">
            {activeQuestion.passage ? (
              <div className="space-y-3 font-serif text-[15px] leading-relaxed text-slate-200 border-l-2 border-cyan-500 pl-4 py-1">
                <p className="whitespace-pre-line">{activeQuestion.passage}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/20 text-xs text-slate-300 space-y-1">
                  <div className="font-mono font-bold text-cyan-400 uppercase tracking-wider text-[10px]">Subtopic Focus:</div>
                  <div className="text-white font-semibold">{activeQuestion.subtopic}</div>
                </div>

                {activeQuestion.tableData && (
                  <div className="overflow-x-auto border border-cyan-500/20 rounded-xl my-4">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-900 text-cyan-300 font-mono font-bold border-b border-cyan-500/20">
                        <tr>
                          {activeQuestion.tableData.headers.map((h, i) => (
                            <th key={i} className="px-4 py-3">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 bg-slate-950/60 font-mono">
                        {activeQuestion.tableData.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-900/80">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-4 py-2.5 text-slate-300">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 space-y-1.5">
                  <div className="font-mono font-bold flex items-center gap-1.5 text-cyan-300">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    TACTICAL SAT VECTOR STRATEGY
                  </div>
                  <p className="text-slate-300 leading-relaxed font-space">
                    Read the question stem carefully to determine exactly what variable, value, or grammatical relationship is tested. Use the ABC eliminate tool to strike out decoy choices.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Left Pane Footer Utility Buttons */}
          <div className="px-6 py-3.5 bg-slate-900/90 border-t border-cyan-500/20 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <button
                onClick={onOpenCalculator}
                className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-400 font-mono font-bold transition-colors"
              >
                <Calculator className="w-4 h-4 text-cyan-400" />
                Calculator
              </button>
              <button
                onClick={onOpenScratchpad}
                className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-400 font-mono font-bold transition-colors"
              >
                <PenTool className="w-4 h-4 text-cyan-400" />
                Scratchpad
              </button>
            </div>
            <span className="font-mono font-bold text-cyan-400">
              NODE {currentIndex + 1} / {totalSessionCount}
            </span>
          </div>
        </div>

        {/* Right Pane: Question & Interactive Multiple-Choice Options */}
        <div className="lg:col-span-6 space-y-4">
          <div className="scifi-glass-card rounded-2xl p-6 space-y-6">
            {/* Question Header & Controls */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full border border-cyan-500/60 bg-cyan-950/80 flex items-center justify-center text-cyan-300 font-mono font-bold text-sm shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                  {currentIndex + 1}
                </span>
                <div>
                  <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">DIRECTIONS</div>
                  <span className="text-xs font-space text-slate-400">Select the optimal response node.</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Countdown Timer Widget */}
                <div className="relative" ref={timerConfigRef}>
                  {isCountdownEnabled ? (
                    <div className="flex items-center gap-1.5">
                      {/* Main Countdown Timer Pill */}
                      <button
                        type="button"
                        id="practice-countdown-pill"
                        onClick={() => setIsTimerConfigOpen((prev) => !prev)}
                        className={`relative overflow-hidden cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-bold border transition-all select-none ${
                          overtimeSeconds > 0
                            ? "bg-rose-950/90 text-rose-200 border-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                            : timeLeft <= 10
                            ? "bg-rose-950/80 text-rose-300 border-rose-400 animate-pulse"
                            : timeLeft <= 20
                            ? "bg-amber-950/80 text-amber-300 border-amber-400"
                            : "bg-slate-900 text-cyan-300 border-cyan-500/40 hover:border-cyan-400"
                        }`}
                        title={`Exam Target: ${currentTargetPace}s pace. Click to configure pace or pause.`}
                      >
                        <div
                          className={`absolute bottom-0 left-0 h-[2.5px] transition-all duration-300 ${
                            overtimeSeconds > 0
                              ? "bg-rose-500 w-full"
                              : timeLeft <= 10
                              ? "bg-rose-500"
                              : timeLeft <= 20
                              ? "bg-amber-500"
                              : "bg-cyan-500"
                          }`}
                          style={{
                            width: overtimeSeconds > 0 ? "100%" : `${Math.max(0, Math.min(100, (timeLeft / currentTargetPace) * 100))}%`,
                          }}
                        />

                        <div className="flex items-center gap-1.5">
                          <Timer
                            className={`w-3.5 h-3.5 shrink-0 ${
                              overtimeSeconds > 0
                                ? "text-rose-400"
                                : timeLeft <= 10
                                ? "text-rose-400 animate-bounce"
                                : timeLeft <= 20
                                ? "text-amber-400"
                                : "text-cyan-400"
                            }`}
                          />
                          {isTimerHidden ? (
                            <span className="text-[11px] font-mono font-bold text-slate-400 tracking-tight flex items-center gap-1">
                              <EyeOff className="w-3 h-3 text-slate-500" />
                              <span>Hidden</span>
                            </span>
                          ) : (
                            <span className="tracking-tight">
                              {overtimeSeconds > 0 ? (
                                <span className="text-rose-300 font-extrabold flex items-center gap-1">
                                  <span>0:00</span>
                                  <span className="text-[10px] font-normal opacity-80">+{overtimeSeconds}s</span>
                                </span>
                              ) : (
                                <span>
                                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                                </span>
                              )}
                            </span>
                          )}
                        </div>

                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-slate-400 hidden sm:inline">
                          {countdownPaceMode === "auto" ? `${currentTargetPace}s` : `${countdownPaceMode}`}
                        </span>
                      </button>

                      {/* Quick Hide/Show Toggle */}
                      <button
                        type="button"
                        id="toggle-hide-timer-button"
                        onClick={handleToggleHideTimer}
                        className="p-1.5 rounded-xl border border-cyan-500/30 text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition-colors"
                        title={isTimerHidden ? "Show timer countdown" : "Hide timer digits"}
                      >
                        {isTimerHidden ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      {/* Quick Pause / Resume */}
                      <button
                        type="button"
                        id="toggle-pause-timer-button"
                        onClick={() => setIsTimerRunning((prev) => !prev)}
                        className={`p-1.5 rounded-xl border transition-colors ${
                          !isTimerRunning
                            ? "bg-amber-950 text-amber-300 border-amber-400"
                            : "border-cyan-500/30 text-slate-400 hover:text-cyan-300 hover:bg-slate-900"
                        }`}
                        title={isTimerRunning ? "Pause timer countdown" : "Resume timer countdown"}
                      >
                        {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-amber-400" />}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      id="enable-countdown-timer-button"
                      onClick={() => handleToggleCountdown(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-amber-950/60 text-slate-400 hover:text-amber-300 border border-slate-700 hover:border-amber-400 text-xs font-mono font-bold transition-all"
                      title="Turn ON exam pressure countdown timer"
                    >
                      <TimerOff className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-[11px]">Untimed</span>
                      <span className="text-[10px] text-amber-400 underline font-semibold ml-0.5">Enable</span>
                    </button>
                  )}

                  {/* Timer Config Popover */}
                  {isTimerConfigOpen && (
                    <div
                      id="practice-timer-config-popover"
                      className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-slate-950 rounded-2xl border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.3)] p-4 z-50 animate-in fade-in duration-150 text-left"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-amber-950 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                            <Timer className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-mono font-bold text-white">CHRONOMETER CONFIG</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsTimerConfigOpen(false)}
                          className="text-slate-400 hover:text-white text-xs p-1 rounded-lg"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="py-3 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-mono font-bold text-white">Countdown Active</div>
                            <div className="text-[10px] font-mono text-slate-400">Tick down per question</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleCountdown(!isCountdownEnabled)}
                            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                              isCountdownEnabled
                                ? "bg-amber-500 text-black border-amber-400 shadow-xs"
                                : "bg-slate-900 text-slate-400 border-slate-700"
                            }`}
                          >
                            {isCountdownEnabled ? "ENABLED" : "OFF"}
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                          <div>
                            <div className="text-xs font-mono font-bold text-white">Hide Digits</div>
                            <div className="text-[10px] font-mono text-slate-400">Simulate blind clock</div>
                          </div>
                          <button
                            type="button"
                            onClick={handleToggleHideTimer}
                            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                              isTimerHidden
                                ? "bg-cyan-500 text-black border-cyan-400 shadow-xs"
                                : "bg-slate-900 text-slate-400 border-slate-700"
                            }`}
                          >
                            {isTimerHidden ? "HIDDEN" : "SHOWN"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Flag Button */}
                <button
                  onClick={toggleFlag}
                  className={`p-2 rounded-xl border transition-colors ${
                    isFlagged
                      ? "bg-amber-950 text-amber-400 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                      : "text-slate-400 border-cyan-500/30 hover:text-cyan-300 hover:bg-slate-900"
                  }`}
                  title="Flag question for review"
                >
                  <Flag className={`w-4 h-4 ${isFlagged ? "fill-amber-400" : ""}`} />
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="text-base font-space font-bold text-white leading-relaxed whitespace-pre-wrap">
              {activeQuestion.question}
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {activeQuestion.options.map((option, idx) => {
                const label = ["A", "B", "C", "D"][idx];
                const isSelected = selectedAnswer === idx;
                const isEliminated = elimsForCurrent.includes(idx);
                const isThisCorrect = activeQuestion.correctAnswerIndex === idx;

                let borderStyle = "border-slate-800 hover:border-cyan-500/60 bg-slate-900/70 text-slate-200";
                let badgeStyle = "border-slate-700 text-slate-400 group-hover:border-cyan-400 group-hover:text-cyan-300";

                if (isSelected) {
                  if (mode === "practice" && isAnswered) {
                    if (isThisCorrect) {
                      borderStyle = "border-emerald-400 bg-emerald-950/60 ring-1 ring-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.3)]";
                      badgeStyle = "bg-emerald-500 text-black border-emerald-400";
                    } else {
                      borderStyle = "border-rose-500 bg-rose-950/60 ring-1 ring-rose-500 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.3)]";
                      badgeStyle = "bg-rose-500 text-white border-rose-500";
                    }
                  } else {
                    borderStyle = "border-cyan-400 bg-cyan-950/60 ring-1 ring-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]";
                    badgeStyle = "bg-cyan-500 text-black border-cyan-400";
                  }
                } else if (mode === "practice" && isAnswered && isThisCorrect) {
                  borderStyle = "border-emerald-400 bg-emerald-950/40 text-emerald-200";
                  badgeStyle = "bg-emerald-500 text-black border-emerald-400";
                }

                return (
                  <div
                    key={idx}
                    onClick={() => !isEliminated && handleSelectOption(idx)}
                    className={`group relative p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3.5 ${borderStyle} ${
                      isEliminated ? "opacity-30 line-through bg-slate-950 border-dashed" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3.5 flex-1">
                      <div
                        className={`w-8 h-8 rounded-full border text-xs font-mono font-black flex items-center justify-center shrink-0 transition-colors ${badgeStyle}`}
                      >
                        {label}
                      </div>
                      <span className="text-sm font-space font-semibold leading-relaxed">
                        {option}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {mode === "practice" && isAnswered && isThisCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      )}
                      {mode === "practice" && isAnswered && isSelected && !isThisCorrect && (
                        <XCircle className="w-5 h-5 text-rose-400" />
                      )}

                      {/* Eliminator Trigger */}
                      <button
                        onClick={(e) => toggleEliminateOption(idx, e)}
                        className="text-[11px] font-mono px-2 py-0.5 rounded text-slate-500 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                        title="Eliminate answer choice"
                      >
                        {isEliminated ? "Undo" : "<s>ABC</s>"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Feedback & AI Assistance */}
            {mode === "practice" && isAnswered && (
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                        <Check className="w-4 h-4 text-emerald-400" /> OPTIMAL NODE MATCH!
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold shadow-[0_0_8px_rgba(244,63,94,0.3)]">
                        <XCircle className="w-4 h-4 text-rose-400" /> MISMATCH (Correct: Option {["A", "B", "C", "D"][activeQuestion.correctAnswerIndex]})
                      </span>
                    )}

                    {isCountdownEnabled && (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
                          overtimeSeconds > 0
                            ? "bg-rose-950 text-rose-300 border-rose-500/40"
                            : "bg-cyan-950 text-cyan-300 border-cyan-500/40"
                        }`}
                      >
                        <Zap className="w-3 h-3" />
                        <span>
                          {overtimeSeconds > 0
                            ? `+${overtimeSeconds}s DELAY`
                            : `${currentTargetPace - timeLeft}s / ${currentTargetPace}s PACE`}
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleRevealExplanation}
                      className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
                    >
                      {isExplanationRevealed ? "Hide Breakdown" : "Step Breakdown"}
                    </button>

                    <button
                      onClick={() => onOpenAiTutor(activeQuestion, selectedAnswer ?? null)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono font-bold transition-all border border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                    >
                      <OwlyLogoIcon size="xs" />
                      ASK QUANTUM TUTOR
                    </button>
                  </div>
                </div>

                {isExplanationRevealed && (
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-xs space-y-3 animate-in fade-in duration-150 font-space">
                    <div className="space-y-1">
                      <span className="font-mono font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Resolution Analysis:
                      </span>
                      <p className="text-slate-300 leading-relaxed">{activeQuestion.explanation}</p>
                    </div>

                    {activeQuestion.trapAnalysis && (
                      <div className="space-y-1 pt-2 border-t border-slate-800">
                        <span className="font-mono font-bold text-amber-300 text-xs flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-400" /> Trap Signal Matrix:
                        </span>
                        <p className="text-amber-200/90 leading-relaxed">{activeQuestion.trapAnalysis}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Nav Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-cyan-500/30 bg-slate-900/80 hover:bg-slate-800 disabled:opacity-30 text-xs font-mono font-bold text-slate-300 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                PREVIOUS
              </button>

              <button
                onClick={() =>
                  setCurrentIndex((prev) =>
                    Math.min(totalSessionCount - 1, prev + 1)
                  )
                }
                disabled={currentIndex === totalSessionCount - 1}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-xs font-mono font-bold text-black transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              >
                NEXT NODE
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Question Navigator Grid */}
          <div className="scifi-glass-card rounded-2xl border border-cyan-500/30 p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
              <div className="flex items-center gap-2">
                <span className="uppercase tracking-wider text-cyan-400">Node Matrix</span>
                <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 rounded-md font-bold">
                  {answeredCount}/{totalSessionCount} Resolved
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block shadow-[0_0_4px_#00f0ff]" /> Resolved
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Flagged
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800 inline-block" /> Idle
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto no-scrollbar pt-1">
              {sessionQuestions.map((q, idx) => {
                const isCurr = idx === currentIndex;
                const isAns = selectedAnswers[q.id] !== undefined && selectedAnswers[q.id] >= 0;
                const isFlag = flaggedQuestions[q.id];

                let bg = "bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800";
                if (isAns) bg = "bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-[0_0_6px_rgba(6,182,212,0.3)] font-bold";
                if (isCurr) bg = "ring-2 ring-cyan-400 bg-cyan-500 text-black font-bold shadow-[0_0_10px_#00f0ff]";

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative w-8 h-8 rounded-lg text-xs transition-all flex items-center justify-center font-mono ${bg}`}
                  >
                    {idx + 1}
                    {isFlag && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-1 ring-black" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

