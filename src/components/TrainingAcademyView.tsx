import React, { useState } from "react";
import {
  Compass,
  BookOpen,
  FileCheck,
  Variable,
  BarChart,
  FunctionSquare,
  Shapes,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Layers,
  HelpCircle,
  RotateCcw,
  Volume2,
  Filter,
  Check,
  Eye,
  Award,
} from "lucide-react";
import { TRAINING_SECTIONS } from "../data/trainingMaterialsData";
import { SAT_VOCABULARY_THEMES, POWER_ROOTS_AND_AFFIXES } from "../data/trainingVocabularyData";
import { TrainingLesson, TrainingSectionModule, VocabularyWordItem, PowerRootItem } from "../data/trainingTypes";
import { safeStorage } from "../utils/storage";

interface TrainingAcademyViewProps {
  onStartPractice?: (sectionFilter?: string, domainFilter?: string) => void;
  onOpenFormulaGuide?: () => void;
}

export const TrainingAcademyView: React.FC<TrainingAcademyViewProps> = ({
  onStartPractice,
  onOpenFormulaGuide,
}) => {
  const [activeSectionId, setActiveSectionId] = useState<string>("module-strategy");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("lesson-strat-1");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedExamples, setExpandedExamples] = useState<Record<string, boolean>>({});
  const [drillAnswers, setDrillAnswers] = useState<Record<string, number | null>>({});
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => {
    return safeStorage.get<string[]>("sat_completed_training_lessons", ["lesson-strat-1"]);
  });

  // Vocabulary & Roots interactive sub-tab
  const [vocabSubTab, setVocabSubTab] = useState<"categories" | "roots" | "flashcard-trainer">("categories");
  const [selectedVocabCategoryIndex, setSelectedVocabCategoryIndex] = useState<number>(0);
  const [selectedRootIndex, setSelectedRootIndex] = useState<number>(0);
  const [flashcardMode, setFlashcardMode] = useState<"sentence" | "root" | "crossword" | "mnemonic">("sentence");
  const [flashcardFlipped, setFlashcardFlipped] = useState<boolean>(false);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);

  const toggleLessonCompleted = (id: string) => {
    setCompletedLessonIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      safeStorage.set("sat_completed_training_lessons", next);
      return next;
    });
  };

  const toggleExampleExpand = (key: string) => {
    setExpandedExamples((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectDrillOption = (drillId: string, optionIndex: number) => {
    setDrillAnswers((prev) => ({
      ...prev,
      [drillId]: optionIndex,
    }));
  };

  // Section icons mapper
  const getSectionIcon = (id: string) => {
    switch (id) {
      case "module-strategy":
        return <Compass className="w-4 h-4 text-amber-400" />;
      case "module-reading":
        return <BookOpen className="w-4 h-4 text-cyan-400" />;
      case "module-writing":
        return <FileCheck className="w-4 h-4 text-indigo-400" />;
      case "module-algebra":
        return <Variable className="w-4 h-4 text-cyan-400" />;
      case "module-data-analysis":
        return <BarChart className="w-4 h-4 text-emerald-400" />;
      case "module-advanced-math":
        return <FunctionSquare className="w-4 h-4 text-rose-400" />;
      case "module-additional-topics":
        return <Shapes className="w-4 h-4 text-sky-400" />;
      default:
        return <BookOpen className="w-4 h-4 text-slate-400" />;
    }
  };

  const currentSection =
    TRAINING_SECTIONS.find((s) => s.id === activeSectionId) || TRAINING_SECTIONS[0];

  const currentLesson: TrainingLesson | undefined =
    currentSection.lessons.find((l) => l.id === selectedLessonId) || currentSection.lessons[0];

  // Vocabulary flashcards
  const allVocabWords = SAT_VOCABULARY_THEMES.flatMap((t) => t.words);
  const activeVocabCategory = SAT_VOCABULARY_THEMES[selectedVocabCategoryIndex] || SAT_VOCABULARY_THEMES[0];
  const activeFlashcardWord = allVocabWords[currentCardIndex % allVocabWords.length];

  // Search filtering
  const filteredSections = TRAINING_SECTIONS.map((sec) => ({
    ...sec,
    lessons: sec.lessons.filter(
      (l) =>
        searchQuery === "" ||
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.coreConcept.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.domainCategory.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((sec) => sec.lessons.length > 0 || searchQuery === "");

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-950 via-cyan-950/90 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-[0_0_30px_rgba(6,182,212,0.15)] border border-cyan-500/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              THEORETICAL DOCTRINE & ACADEMY MATRIX
            </div>
            <h1 className="text-2xl sm:text-3xl font-orbitron font-bold tracking-wide text-white drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">
              SAT Training Academy & Section Mastery
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm font-space leading-relaxed">
              In-depth theoretical instruction, 16 rhetorical devices, 20 vocabulary themes, 100+ power roots, 18 Standard English conventions, and complete mathematical frameworks organized by official SAT sections.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap md:flex-col gap-3 scifi-glass-card border border-cyan-500/30 p-4 rounded-2xl min-w-[200px]">
            <div className="flex items-center justify-between gap-4 font-mono text-xs">
              <span className="text-slate-400">Modules Completed:</span>
              <span className="font-black text-cyan-300 drop-shadow-[0_0_6px_#00f0ff]">
                {completedLessonIds.length} / 25
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 h-full transition-all duration-300 shadow-[0_0_8px_#00f0ff]"
                style={{ width: `${Math.min(100, (completedLessonIds.length / 25) * 100)}%` }}
              />
            </div>
            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Lexicon Index:</span>
              <span className="font-bold text-amber-400">{allVocabWords.length}+ terms</span>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="mt-6 pt-4 border-t border-cyan-500/20 flex flex-col sm:flex-row gap-3 relative z-10">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
            <input
              type="text"
              placeholder="Search concepts, rules, terms (e.g., 'Pythagorean', 'Dangling Participle', 'Ad Hominem', 'Unit Circle')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-cyan-500/30 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-cyan-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Section Navigation Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-thin border-b border-cyan-500/20">
        {TRAINING_SECTIONS.map((sec) => {
          const isActive = activeSectionId === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => {
                setActiveSectionId(sec.id);
                if (sec.lessons.length > 0) {
                  setSelectedLessonId(sec.lessons[0].id);
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                  : "scifi-glass-card text-slate-300 hover:border-cyan-500/40 border-cyan-500/10"
              }`}
            >
              {getSectionIcon(sec.id)}
              <span>{sec.sectionName}</span>
            </button>
          );
        })}

        {/* Dedicated Vocab & Roots Tab */}
        <button
          onClick={() => setActiveSectionId("module-vocabulary")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border ${
            activeSectionId === "module-vocabulary"
              ? "bg-amber-500 text-black border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
              : "scifi-glass-card text-slate-300 hover:border-amber-500/40 border-cyan-500/10"
          }`}
        >
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Lexicon & Power Roots (Ch 3)</span>
        </button>
      </div>

      {/* BODY CONTENT BASED ON ACTIVE SECTION */}
      {activeSectionId === "module-vocabulary" ? (
        /* VOCABULARY & POWER ROOTS HUB */
        <div className="space-y-6">
          {/* Sub-tabs for Vocabulary */}
          <div className="flex flex-wrap gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-cyan-500/20">
            <button
              onClick={() => setVocabSubTab("categories")}
              className={`flex-1 min-w-[140px] py-2 px-4 rounded-lg text-xs font-mono font-bold transition ${
                vocabSubTab === "categories"
                  ? "bg-cyan-500 text-black shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              20 Semantic Vocabulary Themes
            </button>
            <button
              onClick={() => setVocabSubTab("roots")}
              className={`flex-1 min-w-[140px] py-2 px-4 rounded-lg text-xs font-mono font-bold transition ${
                vocabSubTab === "roots"
                  ? "bg-cyan-500 text-black shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Power Roots & Affixes Dictionary
            </button>
            <button
              onClick={() => setVocabSubTab("flashcard-trainer")}
              className={`flex-1 min-w-[140px] py-2 px-4 rounded-lg text-xs font-mono font-bold transition ${
                vocabSubTab === "flashcard-trainer"
                  ? "bg-cyan-500 text-black shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Interactive 4-Mode Flashcard Trainer
            </button>
          </div>

          {vocabSubTab === "categories" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Category Sidebar Selector */}
              <div className="lg:col-span-1 space-y-2 max-h-[700px] overflow-y-auto pr-1">
                <h3 className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider px-2">
                  Vocabulary Themes
                </h3>
                {SAT_VOCABULARY_THEMES.map((theme, idx) => (
                  <button
                    key={theme.categoryNumber}
                    onClick={() => setSelectedVocabCategoryIndex(idx)}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-mono transition ${
                      selectedVocabCategoryIndex === idx
                        ? "bg-cyan-950 text-cyan-300 border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.25)] font-bold"
                        : "bg-slate-900/80 border-cyan-500/10 text-slate-400 hover:border-cyan-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-cyan-400 font-bold">Theme {theme.categoryNumber}</span>
                      <span className="text-[10px] text-slate-500">{theme.words.length} terms</span>
                    </div>
                    <div className="font-space font-semibold text-white mt-0.5">{theme.categoryName}</div>
                  </button>
                ))}
              </div>

              {/* Words Cards in Category */}
              <div className="lg:col-span-3 space-y-4">
                <div className="scifi-glass-card border border-cyan-500/30 rounded-2xl p-5">
                  <h2 className="text-xl font-orbitron font-bold text-white">
                    {activeVocabCategory.categoryName}
                  </h2>
                  <p className="text-xs font-space text-slate-300 mt-1">
                    {activeVocabCategory.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeVocabCategory.words.map((item) => (
                    <div
                      key={item.id}
                      className="scifi-glass-card rounded-xl border border-cyan-500/20 p-5 space-y-3 hover:border-cyan-500/40 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-orbitron font-bold text-cyan-300 drop-shadow-[0_0_6px_#00f0ff]">{item.word}</span>
                            <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded font-mono">
                              ({item.partOfSpeech})
                            </span>
                          </div>
                          <p className="text-xs text-amber-400 font-mono mt-0.5">{item.etymology}</p>
                        </div>
                      </div>

                      <p className="text-xs font-space text-slate-200 font-medium leading-relaxed">{item.definition}</p>

                      <div className="bg-slate-950/80 rounded-lg p-3 border-l-2 border-cyan-400 text-xs text-slate-300 italic font-space">
                        "{item.exampleSentence}"
                      </div>

                      {item.synonyms && item.synonyms.length > 0 && (
                        <div className="text-xs font-mono text-slate-400">
                          <span className="font-bold text-slate-300">Synonyms: </span>
                          {item.synonyms.join(", ")}
                        </div>
                      )}

                      {item.mnemonic && (
                        <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-lg p-2.5 text-xs font-space text-cyan-200 flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-cyan-300">Mnemonic: </span>
                            {item.mnemonic}
                          </div>
                        </div>
                      )}

                      {item.dontConfuseWith && (
                        <div className="bg-rose-950/40 border border-rose-500/40 rounded-lg p-2 text-xs font-space text-rose-300">
                          <span className="font-bold">Trap Alert: </span>
                          {item.dontConfuseWith}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {vocabSubTab === "roots" && (
            <div className="scifi-glass-card rounded-2xl border border-cyan-500/20 p-6 space-y-6">
              <div>
                <h2 className="text-xl font-orbitron font-bold text-white">
                  The Power Roots and Affixes of the SAT
                </h2>
                <p className="text-xs font-space text-slate-300 mt-1">
                  Over 70% of high-difficulty SAT vocabulary words derive from Latin and Greek roots. Mastering these core morphemes unlocks the meanings of thousands of words.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {POWER_ROOTS_AND_AFFIXES.map((rootItem, rIdx) => (
                  <div
                    key={rIdx}
                    className="p-4 rounded-xl border border-cyan-500/20 bg-slate-900/80 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-cyan-300 font-mono drop-shadow-[0_0_6px_#00f0ff]">
                        {rootItem.root}
                      </span>
                      <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30 font-mono">
                        {rootItem.origin}
                      </span>
                    </div>

                    <div className="text-xs font-space text-slate-300 font-semibold">
                      Meaning: <span className="text-white font-normal">{rootItem.meaning}</span>
                    </div>

                    <div className="text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <div className="font-mono font-bold text-slate-200">
                        Anchor Word: <span className="text-cyan-400">{rootItem.anchorWord}</span>
                      </div>
                      <div className="text-slate-400 mt-0.5 text-[11px] font-space">{rootItem.anchorDefinition}</div>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400">
                      <span className="font-bold text-slate-300">Family: </span>
                      {rootItem.familyWords.join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {vocabSubTab === "flashcard-trainer" && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Study Mode Selector */}
              <div className="scifi-glass-card rounded-xl border border-cyan-500/20 p-4 space-y-3">
                <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  Select Study Method (McGraw-Hill Chapter 3 Protocol)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => setFlashcardMode("sentence")}
                    className={`p-2.5 rounded-lg text-xs font-mono font-bold text-center border transition ${
                      flashcardMode === "sentence"
                        ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                        : "bg-slate-900/80 text-slate-400 border-cyan-500/20 hover:text-white"
                    }`}
                  >
                    1. Sentence Context
                  </button>
                  <button
                    onClick={() => setFlashcardMode("root")}
                    className={`p-2.5 rounded-lg text-xs font-mono font-bold text-center border transition ${
                      flashcardMode === "root"
                        ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                        : "bg-slate-900/80 text-slate-400 border-cyan-500/20 hover:text-white"
                    }`}
                  >
                    2. Root Analysis
                  </button>
                  <button
                    onClick={() => setFlashcardMode("crossword")}
                    className={`p-2.5 rounded-lg text-xs font-mono font-bold text-center border transition ${
                      flashcardMode === "crossword"
                        ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                        : "bg-slate-900/80 text-slate-400 border-cyan-500/20 hover:text-white"
                    }`}
                  >
                    3. Crossword Clue
                  </button>
                  <button
                    onClick={() => setFlashcardMode("mnemonic")}
                    className={`p-2.5 rounded-lg text-xs font-mono font-bold text-center border transition ${
                      flashcardMode === "mnemonic"
                        ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                        : "bg-slate-900/80 text-slate-400 border-cyan-500/20 hover:text-white"
                    }`}
                  >
                    4. Visual Mnemonic
                  </button>
                </div>
              </div>

              {/* The Interactive Flashcard */}
              <div
                onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                className="scifi-glass-card rounded-2xl border border-cyan-500/30 p-8 min-h-[300px] flex flex-col justify-between cursor-pointer hover:border-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.15)] relative overflow-hidden"
              >
                <div className="space-y-4">
                  {!flashcardFlipped ? (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      {flashcardMode === "sentence" && (
                        <div className="space-y-3">
                          <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-3 py-1 rounded-sm font-bold uppercase">
                            Context Clue Challenge
                          </span>
                          <p className="text-base font-space text-slate-200 leading-relaxed">
                            "{activeFlashcardWord.exampleSentence.replace(new RegExp(activeFlashcardWord.word, "gi"), "_______")}"
                          </p>
                          <p className="text-xs font-mono text-cyan-400">
                            Which vocabulary word fits the context?
                          </p>
                        </div>
                      )}

                      {flashcardMode === "root" && (
                        <div className="space-y-3">
                          <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-500/40 px-3 py-1 rounded-sm font-bold uppercase">
                            Root Clue Analysis
                          </span>
                          <div className="text-2xl font-orbitron font-bold text-white">
                            Etymology: <span className="text-cyan-400">{activeFlashcardWord.etymology}</span>
                          </div>
                          <p className="text-xs font-space text-slate-300">
                            What English word with definition: "{activeFlashcardWord.definition}" corresponds to this root?
                          </p>
                        </div>
                      )}

                      {flashcardMode === "crossword" && (
                        <div className="space-y-3">
                          <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-sm font-bold uppercase">
                            Crossword Definition Clue
                          </span>
                          <p className="text-base font-space text-slate-200">
                            "{activeFlashcardWord.definition}"
                          </p>
                          <div className="text-xs font-mono text-cyan-400">
                            First Letter: <span className="text-base font-bold text-emerald-400">{activeFlashcardWord.word[0].toUpperCase()}</span> ({activeFlashcardWord.word.length} letters)
                          </div>
                        </div>
                      )}

                      {flashcardMode === "mnemonic" && (
                        <div className="space-y-3">
                          <span className="text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-500/40 px-3 py-1 rounded-sm font-bold uppercase">
                            Memory Hook Challenge
                          </span>
                          <div className="text-2xl font-orbitron font-bold text-white">
                            {activeFlashcardWord.word}
                          </div>
                          <p className="text-xs font-space text-slate-400">
                            How would you create a mental picture for this word?
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* FLIPPED CARD REVEAL */
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="text-3xl font-orbitron font-bold text-cyan-300 drop-shadow-[0_0_10px_#00f0ff]">
                        {activeFlashcardWord.word}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        ({activeFlashcardWord.partOfSpeech}) • {activeFlashcardWord.etymology}
                      </div>
                      <p className="text-sm font-space font-semibold text-white leading-relaxed">
                        {activeFlashcardWord.definition}
                      </p>

                      {activeFlashcardWord.mnemonic && (
                        <div className="bg-cyan-950/60 border border-cyan-500/40 rounded-xl p-3 text-xs font-space text-cyan-200">
                          <span className="font-bold text-cyan-300">Mnemonic: </span>
                          {activeFlashcardWord.mnemonic}
                        </div>
                      )}

                      <div className="text-xs font-space text-slate-400 italic">
                        "{activeFlashcardWord.exampleSentence}"
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-3 border-t border-cyan-500/20">
                  <span>Card {((currentCardIndex % allVocabWords.length) + 1)} of {allVocabWords.length}</span>
                  <span className="text-cyan-400 font-bold">{activeFlashcardWord.category}</span>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => {
                    setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : allVocabWords.length - 1));
                    setFlashcardFlipped(false);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-cyan-500/30 bg-slate-900 hover:bg-cyan-950 text-xs font-mono font-bold text-slate-300 shadow-sm"
                >
                  Previous Word
                </button>

                <button
                  onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs font-mono font-bold text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                >
                  {flashcardFlipped ? "Show Question" : "Reveal Answer"}
                </button>

                <button
                  onClick={() => {
                    setCurrentCardIndex((prev) => prev + 1);
                    setFlashcardFlipped(false);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-cyan-500/30 bg-slate-900 hover:bg-cyan-950 text-xs font-mono font-bold text-slate-300 shadow-sm"
                >
                  Next Word
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* SECTION LESSON VIEWER (READING, WRITING, MATH CHAPTERS) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Lesson Directory */}
          <div className="lg:col-span-4 space-y-3">
            <div className="scifi-glass-card rounded-2xl border border-cyan-500/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  Lessons in this Section
                </h3>
                <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                  {currentSection.lessons.length} Modules
                </span>
              </div>

              <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
                {currentSection.lessons.map((lesson) => {
                  const isSelected = selectedLessonId === lesson.id;
                  const isDone = completedLessonIds.includes(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setSelectedLessonId(lesson.id)}
                      className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-3 ${
                        isSelected
                          ? "bg-cyan-950/80 border-cyan-500 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                          : "bg-slate-900/60 border-cyan-500/10 text-slate-400 hover:border-cyan-500/30 hover:text-slate-200"
                      }`}
                    >
                      <div className="mt-0.5">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_4px_#10b981]" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-cyan-500/40 flex items-center justify-center text-[9px] font-mono font-bold text-cyan-400">
                            {lesson.lessonNumber}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono font-semibold text-white truncate">
                          {lesson.title}
                        </div>
                        {lesson.subtitle && (
                          <div className="text-[11px] font-space text-slate-400 truncate mt-0.5">
                            {lesson.subtitle}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Link to Formula Guide or Practice */}
            <div className="bg-gradient-to-br from-cyan-950/60 to-slate-950 rounded-2xl border border-cyan-500/30 p-4 space-y-3">
              <div className="flex items-center gap-2 text-cyan-300 font-mono font-bold text-xs">
                <Award className="w-4 h-4 text-cyan-400" />
                <span>Ready to Drill this Topic?</span>
              </div>
              <p className="text-xs font-space text-slate-300 leading-relaxed">
                Test your mastery on real Digital SAT questions from our 5,000 question bank.
              </p>
              <button
                onClick={() => onStartPractice && onStartPractice()}
                className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(6,182,212,0.3)] transition"
              >
                <span>Launch Timed Drill</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Selected Lesson Detail View */}
          <div className="lg:col-span-8 space-y-6">
            {currentLesson ? (
              <div className="scifi-glass-card rounded-2xl border border-cyan-500/20 p-6 sm:p-8 space-y-6">
                {/* Lesson Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/20">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider bg-cyan-950 px-2.5 py-1 rounded border border-cyan-500/40">
                        {currentLesson.chapterSource}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Lesson {currentLesson.lessonNumber}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-orbitron font-bold text-white">
                      {currentLesson.title}
                    </h2>
                    {currentLesson.subtitle && (
                      <p className="text-xs font-space text-slate-300">
                        {currentLesson.subtitle}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => toggleLessonCompleted(currentLesson.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition border ${
                      completedLessonIds.includes(currentLesson.id)
                        ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                        : "bg-slate-900 text-slate-300 border-cyan-500/30 hover:border-cyan-400"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>
                      {completedLessonIds.includes(currentLesson.id)
                        ? "Completed"
                        : "Mark as Learned"}
                    </span>
                  </button>
                </div>

                {/* Core Concept Banner */}
                <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-cyan-950/60 border border-cyan-500/30 rounded-xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300">
                    <Lightbulb className="w-4 h-4 text-cyan-400" />
                    <span>Core Conceptual Doctrine</span>
                  </div>
                  <p className="text-sm sm:text-base font-space text-white leading-relaxed">
                    {currentLesson.coreConcept}
                  </p>
                </div>

                {/* Key Formulas / Rules if applicable */}
                {currentLesson.keyFormulasAndRules && currentLesson.keyFormulasAndRules.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      Essential Formulas & Algebraic Identities
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentLesson.keyFormulasAndRules.map((f, fIdx) => (
                        <div
                          key={fIdx}
                          className="bg-slate-950 text-white rounded-xl p-4 space-y-2 border border-cyan-500/20"
                        >
                          <div className="text-xs font-mono font-bold text-cyan-300">{f.name}</div>
                          <div className="font-mono text-sm sm:text-base font-bold text-amber-400 bg-black/60 px-3 py-1.5 rounded-lg border border-slate-800">
                            {f.expression}
                          </div>
                          <div className="text-xs font-space text-slate-300 leading-relaxed">
                            {f.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rules List if applicable */}
                {currentLesson.rulesList && currentLesson.rulesList.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      Key Rules & Syntactic Conventions
                    </h4>
                    <div className="space-y-2">
                      {currentLesson.rulesList.map((r, rIdx) => (
                        <div
                          key={rIdx}
                          className="p-3.5 rounded-xl border border-cyan-500/20 bg-slate-950/60 flex items-start gap-3"
                        >
                          <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 shrink-0 shadow-[0_0_6px_#00f0ff]" />
                          <div className="space-y-1">
                            <div className="text-xs font-mono font-bold text-white">{r.ruleName}</div>
                            <div className="text-xs font-space text-slate-300 leading-relaxed">{r.ruleDetail}</div>
                            {r.example && (
                              <div className="text-xs font-mono text-cyan-300 italic mt-1">
                                Example: {r.example}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Explanation Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                    Detailed Theoretical Breakdown
                  </h4>
                  <div className="space-y-2.5 text-xs sm:text-sm font-space text-slate-200 leading-relaxed">
                    {currentLesson.detailedExplanation.map((paragraph, pIdx) => (
                      <p key={pIdx} className="scifi-glass-card p-3 rounded-lg border border-cyan-500/10">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Trap Alerts */}
                {currentLesson.trapAlerts && currentLesson.trapAlerts.length > 0 && (
                  <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>College Board Trap Alerts</span>
                    </div>
                    <ul className="space-y-1.5 text-xs sm:text-sm font-space text-amber-200">
                      {currentLesson.trapAlerts.map((trap, tIdx) => (
                        <li key={tIdx} className="flex items-start gap-2">
                          <span className="font-bold text-amber-400">•</span>
                          <span>{trap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Worked Examples */}
                {currentLesson.workedExamples && currentLesson.workedExamples.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      Real SAT Worked Examples & Step-by-Step Proofs
                    </h4>
                    {currentLesson.workedExamples.map((ex, exIdx) => {
                      const exKey = `${currentLesson.id}-ex-${exIdx}`;
                      const isExpanded = expandedExamples[exKey] ?? true;
                      return (
                        <div
                          key={exIdx}
                          className="border border-cyan-500/20 rounded-xl overflow-hidden bg-slate-950/60 shadow-sm"
                        >
                          <div
                            onClick={() => toggleExampleExpand(exKey)}
                            className="bg-slate-900/90 p-4 flex items-center justify-between cursor-pointer hover:bg-cyan-950/50 transition border-b border-cyan-500/10"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                                {ex.difficulty}
                              </span>
                              <span className="text-xs font-mono font-bold text-white">{ex.title}</span>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-cyan-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-500" />
                            )}
                          </div>

                          {isExpanded && (
                            <div className="p-5 space-y-4 text-xs font-space text-slate-200">
                              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono leading-relaxed border border-slate-800">
                                {ex.problemText}
                              </div>

                              <div className="space-y-2">
                                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                                  Step-by-Step Solution:
                                </div>
                                <div className="space-y-1.5 pl-3 border-l-2 border-cyan-400">
                                  {ex.stepByStepSolution.map((step, sIdx) => (
                                    <div key={sIdx} className="text-xs font-space text-slate-300">
                                      {step}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-cyan-500/10 bg-slate-900/60 p-3 rounded-lg">
                                <div>
                                  <span className="text-[10px] font-mono font-bold text-slate-400">Correct Result: </span>
                                  <span className="text-xs font-mono font-bold text-emerald-400">{ex.answer}</span>
                                </div>
                                <div className="text-xs font-mono text-cyan-300 italic">
                                  💡 {ex.keyTakeaway}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quick Check Drill Question if available */}
                {currentLesson.quickDrillQuestions && currentLesson.quickDrillQuestions.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-cyan-500/20">
                    <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-cyan-400" />
                      <span>Instant Concept Check</span>
                    </h4>

                    {currentLesson.quickDrillQuestions.map((q) => {
                      const selected = drillAnswers[q.id];
                      const hasAnswered = selected !== undefined && selected !== null;
                      const isCorrect = selected === q.correctIndex;

                      return (
                        <div key={q.id} className="bg-slate-950 rounded-xl p-5 border border-cyan-500/20 space-y-3">
                          <p className="text-xs sm:text-sm font-space font-semibold text-white">{q.question}</p>
                          <div className="space-y-2">
                            {q.options.map((opt, oIdx) => {
                              const isThisSelected = selected === oIdx;
                              let btnClass = "bg-slate-900 border-cyan-500/20 text-slate-300 hover:border-cyan-400";
                              if (hasAnswered) {
                                if (oIdx === q.correctIndex) {
                                  btnClass = "bg-emerald-950/80 border-emerald-400 text-emerald-200 font-bold";
                                } else if (isThisSelected) {
                                  btnClass = "bg-rose-950/80 border-rose-400 text-rose-200";
                                }
                              }

                              return (
                                <button
                                  key={oIdx}
                                  onClick={() => handleSelectDrillOption(q.id, oIdx)}
                                  className={`w-full text-left p-3 rounded-lg border text-xs font-mono transition flex items-center justify-between ${btnClass}`}
                                >
                                  <span>{opt}</span>
                                  {hasAnswered && oIdx === q.correctIndex && (
                                    <Check className="w-4 h-4 text-emerald-400" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {hasAnswered && (
                            <div
                              className={`p-3 rounded-lg text-xs font-mono leading-relaxed border ${
                                isCorrect ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-200" : "bg-amber-950/50 border-amber-500/40 text-amber-200"
                              }`}
                            >
                              <span className="font-bold">{isCorrect ? "Protocol Verified: " : "Tactical Analysis: "}</span>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="scifi-glass-card rounded-2xl border border-cyan-500/20 p-12 text-center text-slate-400 font-mono text-xs">
                Select a lesson from the list on the left to review training material.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
