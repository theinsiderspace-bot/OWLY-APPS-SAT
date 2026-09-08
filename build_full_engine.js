// Comprehensive SAT question generator engine generator
const fs = require("fs");
const path = require("path");

const code = `import { SATQuestion, SATSection, SATDomain, DifficultyLevel } from "../types";
import { INITIAL_QUESTION_BANK } from "./questionBank";

export interface CategorySummary {
  section: SATSection;
  domain: SATDomain;
  subtopic: string;
  count: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
}

export interface DomainBreakdown {
  domain: SATDomain;
  section: SATSection;
  totalCount: number;
  subtopics: {
    name: string;
    count: number;
  }[];
}

// Pseudo-random deterministic number generator using Linear Congruential Generator
function seededRandom(seed: number) {
  let s = (Math.abs(seed) + 1) % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// 35 Official Subtopics across Digital SAT Blueprint
export const SUBTOPIC_SPECS: {
  section: SATSection;
  domain: SATDomain;
  subtopic: string;
  targetCount: number;
}[] = [
  // SECTION 1: MATH (5,000 Items)
  { section: "Math", domain: "Algebra", subtopic: "Linear Equations in One Variable", targetCount: 340 },
  { section: "Math", domain: "Algebra", subtopic: "Linear Functions & Slopes", targetCount: 340 },
  { section: "Math", domain: "Algebra", subtopic: "Linear Equations in Two Variables & Graphing", targetCount: 280 },
  { section: "Math", domain: "Algebra", subtopic: "Systems of Linear Equations", targetCount: 340 },
  { section: "Math", domain: "Algebra", subtopic: "Linear Inequalities in One or Two Variables", targetCount: 200 },
  { section: "Math", domain: "Algebra", subtopic: "Absolute Value Equations & Inequalities", targetCount: 200 },

  { section: "Math", domain: "Advanced Math", subtopic: "Equivalent Expressions & Factoring", targetCount: 300 },
  { section: "Math", domain: "Advanced Math", subtopic: "Nonlinear Equations & Radicals", targetCount: 300 },
  { section: "Math", domain: "Advanced Math", subtopic: "Quadratic Functions & Vertex Form", targetCount: 300 },
  { section: "Math", domain: "Advanced Math", subtopic: "Exponential Growth & Decay Functions", targetCount: 300 },
  { section: "Math", domain: "Advanced Math", subtopic: "Polynomial Operations & Remainder Theorem", targetCount: 300 },

  { section: "Math", domain: "Problem Solving & Data Analysis", subtopic: "Ratios, Rates & Unit Conversions", targetCount: 250 },
  { section: "Math", domain: "Problem Solving & Data Analysis", subtopic: "Percentages & Margin of Error", targetCount: 250 },
  { section: "Math", domain: "Problem Solving & Data Analysis", subtopic: "Two-Way Contingency Tables & Probability", targetCount: 200 },
  { section: "Math", domain: "Problem Solving & Data Analysis", subtopic: "Statistics: Center, Spread & Outliers", targetCount: 200 },
  { section: "Math", domain: "Problem Solving & Data Analysis", subtopic: "Scatterplots & Linear Modeling", targetCount: 100 },

  { section: "Math", domain: "Geometry & Trigonometry", subtopic: "Area and Volume Formulas", targetCount: 200 },
  { section: "Math", domain: "Geometry & Trigonometry", subtopic: "Triangles & Pythagorean Theorem", targetCount: 240 },
  { section: "Math", domain: "Geometry & Trigonometry", subtopic: "Circle Equations & Arc Radians", targetCount: 200 },
  { section: "Math", domain: "Geometry & Trigonometry", subtopic: "Right Triangle Trigonometry & Identities", targetCount: 160 },

  // SECTION 2: READING & WRITING (5,000 Items)
  { section: "Reading & Writing", domain: "Information and Ideas", subtopic: "Central Ideas and Details", targetCount: 360 },
  { section: "Reading & Writing", domain: "Information and Ideas", subtopic: "Command of Evidence: Textual", targetCount: 360 },
  { section: "Reading & Writing", domain: "Information and Ideas", subtopic: "Command of Evidence: Quantitative Tables", targetCount: 340 },
  { section: "Reading & Writing", domain: "Information and Ideas", subtopic: "Inferences & Logical Hypotheses", targetCount: 340 },

  { section: "Reading & Writing", domain: "Craft and Structure", subtopic: "Words in Context & High-Utility Vocabulary", targetCount: 500 },
  { section: "Reading & Writing", domain: "Craft and Structure", subtopic: "Text Structure & Purpose", targetCount: 450 },
  { section: "Reading & Writing", domain: "Craft and Structure", subtopic: "Cross-Text Connections (Paired Passages)", targetCount: 450 },

  { section: "Reading & Writing", domain: "Expression of Ideas", subtopic: "Rhetorical Synthesis (Bullet-Point Notes)", targetCount: 500 },
  { section: "Reading & Writing", domain: "Expression of Ideas", subtopic: "Transitions & Logical Connectors", targetCount: 500 },

  { section: "Reading & Writing", domain: "Standard English Conventions", subtopic: "Boundaries: Run-ons, Semicolons & Colons", targetCount: 360 },
  { section: "Reading & Writing", domain: "Standard English Conventions", subtopic: "Subject-Verb Agreement", targetCount: 280 },
  { section: "Reading & Writing", domain: "Standard English Conventions", subtopic: "Modifier Placement & Dangling Participles", targetCount: 200 },
  { section: "Reading & Writing", domain: "Standard English Conventions", subtopic: "Verb Tense, Aspect & Mood", targetCount: 200 },
  { section: "Reading & Writing", domain: "Standard English Conventions", subtopic: "Pronoun-Antecedent Agreement", targetCount: 160 },
];

function formatQuestionWithDistractors(
  id: string,
  section: SATSection,
  domain: SATDomain,
  subtopic: string,
  difficulty: DifficultyLevel,
  question: string,
  correctAnswer: string,
  distractors: [string, string, string],
  explanation: string,
  trapAnalysis: string,
  indexInSubtopic: number,
  passage?: string,
  tableData?: { headers: string[]; rows: (string | number)[][] }
): SATQuestion {
  const seed = Math.abs(indexInSubtopic * 97 + id.length * 13) % 4;
  const rawOptions = [correctAnswer, distractors[0], distractors[1], distractors[2]];
  const options = new Array(4);
  const correctPos = seed;
  options[correctPos] = rawOptions[0];
  
  let distIdx = 1;
  for (let i = 0; i < 4; i++) {
    if (i !== correctPos) {
      options[i] = rawOptions[distIdx++];
    }
  }

  return {
    id,
    section,
    domain,
    subtopic,
    difficulty,
    question,
    passage,
    tableData,
    options,
    correctAnswerIndex: correctPos,
    explanation,
    trapAnalysis,
    source: "Official 10,000 Digital SAT Bank Generator",
  };
}
`;

fs.writeFileSync("/tmp/engine_header.ts", code);
console.log("Header written to /tmp/engine_header.ts");
