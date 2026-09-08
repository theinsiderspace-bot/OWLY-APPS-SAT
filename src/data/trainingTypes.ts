export interface TrainingLesson {
  id: string;
  lessonNumber: number;
  title: string;
  subtitle?: string;
  chapterSource: string;
  section: "Reading" | "Writing and Language" | "Heart of Algebra" | "Problem Solving & Data Analysis" | "Passport to Advanced Math" | "Additional Topics" | "Vocabulary & Roots" | "Exam Strategies";
  domainCategory: string;
  coreConcept: string;
  keyFormulasAndRules?: {
    name: string;
    expression: string;
    description: string;
  }[];
  detailedExplanation: string[];
  rulesList?: {
    ruleName: string;
    ruleDetail: string;
    example?: string;
  }[];
  workedExamples: {
    title: string;
    problemText: string;
    difficulty: "Easy" | "Medium" | "Hard" | "Medium-Hard";
    stepByStepSolution: string[];
    answer: string;
    keyTakeaway: string;
  }[];
  trapAlerts?: string[];
  interactiveTools?: {
    toolName: string;
    description: string;
    type: "calculator" | "flashcard" | "desmos" | "formula-prover" | "root-builder";
  }[];
  quickDrillQuestions?: {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface TrainingSectionModule {
  id: string;
  sectionName: string;
  chapterNumber: number;
  shortDescription: string;
  iconName: string;
  colorTheme: string;
  lessons: TrainingLesson[];
}

export interface VocabularyWordItem {
  id: string;
  word: string;
  partOfSpeech: string;
  etymology: string;
  definition: string;
  exampleSentence: string;
  synonyms: string[];
  rootFamily?: {
    root: string;
    meaning: string;
    relatedWords: string[];
  }[];
  dontConfuseWith?: string;
  mnemonic?: string;
  usageNote?: string;
  category: string;
}

export interface PowerRootItem {
  root: string;
  meaning: string;
  origin: "Latin" | "Greek" | "Old English" | "French" | "Germanic" | "Latin/Greek" | "Greek/Latin" | string;
  anchorWord: string;
  anchorDefinition: string;
  familyWords: string[];
}
