import { SATQuestion, SATSection, SATDomain, DifficultyLevel } from "../types";
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

function seededRandom(seed: number) {
  let s = (Math.abs(seed) + 1) % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

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

const MATH_NAMES = ["Marcus", "Elena", "Liam", "Sofia", "Aiden", "Priya", "Carlos", "Maya", "Kenji", "Zara", "Devon", "Chloe", "Tariq", "Amara", "Lucas", "Leila"];
const LINEAR_CONTEXTS = [
  { item: "custom 3D-printed brackets", unit: "bracket", unitPlural: "brackets", verb: "producing" },
  { item: "artisan ceramic mugs", unit: "mug", unitPlural: "mugs", verb: "crafting" },
  { item: "organic cold-pressed juices", unit: "bottle", unitPlural: "bottles", verb: "bottling" },
  { item: "recycled canvas tote bags", unit: "bag", unitPlural: "bags", verb: "manufacturing" },
  { item: "hand-bound leather journals", unit: "journal", unitPlural: "journals", verb: "binding" },
  { item: "solar-powered LED lanterns", unit: "lantern", unitPlural: "lanterns", verb: "assembling" },
];

function generateAlgebraQuestions(subtopic: string, count: number, startGlobalIndex: number, seenSignatures: Set<string>): SATQuestion[] {
  const questions: SATQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const globalIdx = startGlobalIndex + i;
    const difficulty: DifficultyLevel = i % 3 === 0 ? "Easy" : i % 3 === 1 ? "Medium" : "Hard";
    const id = `math-alg-${i + 1}-${globalIdx}`;

    let attempt = 0;
    while (attempt < 20) {
      const rand = seededRandom(globalIdx * 4001 + attempt * 1013 + i * 37);
      let qText = "";
      let ans = "";
      let distractors: [string, string, string] = ["", "", ""];
      let explanation = "";
      let trap = "";

      if (subtopic === "Linear Equations in One Variable") {
        const archetype = (i + attempt) % 6;
        if (archetype === 0) {
          const a = Math.floor(rand() * 15) + 3;
          const b = Math.floor(rand() * 40) + 10;
          const x = Math.floor(rand() * 25) + 2;
          const c = a * x + b;
          qText = `If ${a}x + ${b} = ${c}, what is the value of x?`;
          ans = `${x}`;
          distractors = [`${x + 2}`, `${Math.max(1, x - 2)}`, `${x * 2}`];
          explanation = `Subtract ${b} from both sides: ${a}x = ${c - b}. Divide by ${a}: x = ${x}.`;
          trap = `Arithmetic sign error when subtracting the constant term.`;
        } else if (archetype === 1) {
          const a = Math.floor(rand() * 10) + 3;
          const b = Math.floor(rand() * 25) + 5;
          const mult = Math.floor(rand() * 4) + 2;
          const x = Math.floor(rand() * 16) + 3;
          const c = a * x - b;
          const targetVal = mult * x;
          qText = `If ${a}x - ${b} = ${c}, what is the value of ${mult}x?`;
          ans = `${targetVal}`;
          distractors = [`${x}`, `${targetVal + mult}`, `${targetVal - mult}`];
          explanation = `Solve for x: ${a}x = ${c + b} => x = ${x}. Then multiply by ${mult}: ${mult}(${x}) = ${targetVal}.`;
          trap = `Stopping at x = ${x} instead of finding ${mult}x as requested.`;
        } else if (archetype === 2) {
          const a = Math.floor(rand() * 8) + 2;
          const b = Math.floor(rand() * 12) + 3;
          const d = a * 2;
          const noSolK = -(a * b);
          qText = `For what value of constant k does the equation ${a}(2x - ${b}) = ${d}x + k have no solution?`;
          ans = `Any value other than ${noSolK}`;
          distractors = [`${noSolK}`, `0`, `${b}`];
          explanation = `Expanding the left side yields ${d}x - ${a * b} = ${d}x + k. For no solution, the equation must be contradictory, meaning k ≠ ${noSolK}.`;
          trap = `Confusing no solution with infinitely many solutions.`;
        } else if (archetype === 3) {
          const name = MATH_NAMES[Math.floor(rand() * MATH_NAMES.length)];
          const ctx = LINEAR_CONTEXTS[Math.floor(rand() * LINEAR_CONTEXTS.length)];
          const baseFee = (Math.floor(rand() * 8) + 3) * 10;
          const unitCost = Math.floor(rand() * 9) + 4;
          const countUnits = Math.floor(rand() * 30) + 12;
          const totalCost = baseFee + unitCost * countUnits;
          qText = `${name} runs a small workshop ${ctx.verb} ${ctx.item}. The workshop has a fixed weekly setup fee of $${baseFee}, plus a production cost of $${unitCost} per ${ctx.unit}. If the total production cost for a given week was $${totalCost}, how many ${ctx.unitPlural} did the workshop produce that week?`;
          ans = `${countUnits}`;
          distractors = [`${countUnits - 4}`, `${countUnits + 5}`, `${Math.round(totalCost / unitCost)}`];
          explanation = `Linear model: C = ${baseFee} + ${unitCost}n. ${totalCost} = ${baseFee} + ${unitCost}n => n = ${countUnits}.`;
          trap = `Dividing total cost directly by unit cost without subtracting setup fee.`;
        } else if (archetype === 4) {
          const a = Math.floor(rand() * 6) + 2;
          const b = Math.floor(rand() * 8) + 2;
          const c = Math.floor(rand() * 5) + 2;
          const x = Math.floor(rand() * 10) + 2;
          const constDiff = a * (x + b) - c * x;
          qText = `What is the solution to the equation ${a}(x + ${b}) = ${c}x + ${constDiff}?`;
          ans = `${x}`;
          distractors = [`${x + 1}`, `${Math.max(1, x - 2)}`, `${x * 2}`];
          explanation = `Expand: ${a}x + ${a * b} = ${c}x + ${constDiff}. Rearrange: ${a - c}x = ${constDiff - a * b} => x = ${x}.`;
          trap = `Failing to distribute ${a} to both terms inside the parenthesis.`;
        } else {
          const a = Math.floor(rand() * 5) + 2;
          const b = Math.floor(rand() * 5) + 2;
          const c = Math.floor(rand() * 7) + 2;
          const d = Math.floor(rand() * 7) + 2;
          const x = Math.floor(rand() * 12) + 3;
          const rhs = ((x + a) * d) / b + c;
          const rhsRound = Math.round(rhs);
          qText = `If (x + ${a}) / ${b} = (${rhsRound} - ${c}) / ${d}, what is the value of x?`;
          ans = `${x}`;
          distractors = [`${x + 3}`, `${Math.max(1, x - 3)}`, `${x * 2}`];
          explanation = `Cross-multiply: ${d}(x + ${a}) = ${b}(${rhsRound - c}). Solve for x to get x = ${x}.`;
          trap = `Inverting fraction or arithmetic error during cross-multiplication.`;
        }
      } else if (subtopic === "Linear Functions & Slopes") {
        const archetype = (i + attempt) % 5;
        if (archetype === 0) {
          const m = Math.floor(rand() * 8) + 2;
          const k = Math.floor(rand() * 35) + 12;
          const isPerp = (i + attempt) % 2 === 0;
          if (isPerp) {
            qText = `Line L in the xy-plane is perpendicular to the line y = -${m}x + ${k} and passes through the origin (0, 0). What is the slope of line L?`;
            ans = `1/${m}`;
            distractors = [`-${m}`, `-1/${m}`, `${m}`];
            explanation = `Perpendicular lines have negative reciprocal slopes. Original slope is -${m}, so perpendicular slope is 1/${m}.`;
            trap = `Taking only reciprocal or only negative without both.`;
          } else {
            qText = `Line M is parallel to the line y = ${m}x - ${k} and passes through the point (2, 5). What is the y-intercept of line M?`;
            const yInt = 5 - m * 2;
            ans = `${yInt}`;
            distractors = [`${-k}`, `${yInt + m}`, `${5 + m * 2}`];
            explanation = `Parallel lines have identical slopes m = ${m}. Using point-slope: y - 5 = ${m}(x - 2) => y = ${m}x + ${yInt}.`;
            trap = `Assuming parallel lines share the same y-intercept.`;
          }
        } else if (archetype === 1) {
          const x1 = Math.floor(rand() * 5) + 1;
          const y1 = Math.floor(rand() * 10) + 2;
          const dx = Math.floor(rand() * 4) + 2;
          const m = Math.floor(rand() * 6) + 1;
          const x2 = x1 + dx;
          const y2 = y1 + m * dx;
          qText = `A line in the xy-plane passes through the points (${x1}, ${y1}) and (${x2}, ${y2}). What is the slope of the line?`;
          ans = `${m}`;
          distractors = [`${m + 1}`, `1/${m}`, `${m * 2}`];
          explanation = `Slope formula: m = (y₂ - y₁) / (x₂ - x₁) = ${y2 - y1} / ${dx} = ${m}.`;
          trap = `Inverting the slope formula (Δx / Δy).`;
        } else if (archetype === 2) {
          const m = Math.floor(rand() * 7) + 2;
          const k = Math.floor(rand() * 20) + 5;
          const evalX = Math.floor(rand() * 8) + 3;
          const fVal = m * evalX + k;
          qText = `The function f is defined by f(x) = ${m}x + ${k}. What is the value of f(${evalX})?`;
          ans = `${fVal}`;
          distractors = [`${fVal - m}`, `${fVal + m}`, `${m * evalX}`];
          explanation = `Substitute x = ${evalX}: f(${evalX}) = ${m}(${evalX}) + ${k} = ${fVal}.`;
          trap = `Ignoring constant term or substituting for f(x).`;
        } else if (archetype === 3) {
          const temp0 = Math.floor(rand() * 15) + 18;
          const rate = Math.floor(rand() * 6) + 2;
          const minutes = Math.floor(rand() * 25) + 10;
          const finalTemp = temp0 + rate * minutes;
          qText = `A chemical liquid begins at a temperature of ${temp0}°C and is heated uniformly such that its temperature increases by ${rate}°C per minute. If the final temperature reached is ${finalTemp}°C, how many minutes was the liquid heated?`;
          ans = `${minutes}`;
          distractors = [`${minutes - 3}`, `${minutes + 4}`, `${Math.round(finalTemp / rate)}`];
          explanation = `T(m) = ${temp0} + ${rate}m => ${finalTemp - temp0} = ${rate}m => m = ${minutes}.`;
          trap = `Dividing final temperature directly by rate without subtracting initial.`;
        } else {
          const a = Math.floor(rand() * 6) + 2;
          const b = Math.floor(rand() * 6) + 2;
          const c = a * 8 + b * 6;
          const yInt = c / b;
          qText = `The line ${a}x + ${b}y = ${c} is graphed in the xy-plane. What is the y-intercept of the line?`;
          ans = `(0, ${yInt})`;
          distractors = [`(${c / a}, 0)`, `(0, ${yInt + 2})`, `(${yInt}, 0)`];
          explanation = `Set x = 0: ${b}y = ${c} => y = ${yInt}. In coordinate form, (0, ${yInt}).`;
          trap = `Finding x-intercept instead of y-intercept.`;
        }
      } else if (subtopic === "Linear Equations in Two Variables & Graphing") {
        const archetype = (i + attempt) % 4;
        if (archetype === 0) {
          const a = Math.floor(rand() * 7) + 2;
          const b = Math.floor(rand() * 7) + 2;
          const xInt = Math.floor(rand() * 8) + 2;
          const c = a * xInt;
          qText = `What is the x-intercept of the line ${a}x - ${b}y = ${c} in the xy-plane?`;
          ans = `(${xInt}, 0)`;
          distractors = [`(0, ${-Math.round(c / b)})`, `(${xInt + 2}, 0)`, `(0, ${xInt})`];
          explanation = `Set y = 0: ${a}x = ${c} => x = ${xInt}. The point is (${xInt}, 0).`;
          trap = `Confusing x-intercept with y-intercept.`;
        } else if (archetype === 1) {
          const a = Math.floor(rand() * 5) + 2;
          const b = Math.floor(rand() * 5) + 2;
          qText = `What is the slope of the line given by ${a}x + ${b}y = 42?`;
          ans = `-${a}/${b}`;
          distractors = [`${a}/${b}`, `-${b}/${a}`, `${b}/${a}`];
          explanation = `Convert to slope-intercept form: y = (-${a}/${b})x + ${42 / b}. The slope is -${a}/${b}.`;
          trap = `Forgetting negative sign on moving Ax to right-hand side.`;
        } else if (archetype === 2) {
          const name = MATH_NAMES[Math.floor(rand() * MATH_NAMES.length)];
          const p1 = Math.floor(rand() * 4) + 3;
          const p2 = Math.floor(rand() * 5) + 6;
          const q1 = Math.floor(rand() * 15) + 10;
          const q2 = Math.floor(rand() * 15) + 10;
          const totalRev = p1 * q1 + p2 * q2;
          qText = `${name} sells movie tickets. Adult tickets cost $${p2} each and child tickets cost $${p1} each. If ${name} sold ${q1} child tickets and total ticket revenue was $${totalRev}, how many adult tickets were sold?`;
          ans = `${q2}`;
          distractors = [`${q2 - 2}`, `${q2 + 3}`, `${Math.round(totalRev / p2)}`];
          explanation = `${p1}(${q1}) + ${p2}a = ${totalRev} => ${p2}a = ${totalRev - p1 * q1} => a = ${q2}.`;
          trap = `Swapping adult and child ticket prices.`;
        } else {
          const m = Math.floor(rand() * 5) + 2;
          const x0 = Math.floor(rand() * 6) + 1;
          const y0 = Math.floor(rand() * 8) + 2;
          const dx = Math.floor(rand() * 4) + 1;
          const testX = x0 + dx;
          const testY = y0 + m * dx;
          qText = `A line with slope ${m} passes through the point (${x0}, ${y0}). Which of the following points also lies on this line?`;
          ans = `(${testX}, ${testY})`;
          distractors = [`(${testX}, ${testY + 3})`, `(${testX + 1}, ${testY})`, `(${x0}, ${testY})`];
          explanation = `Using y - ${y0} = ${m}(x - ${x0}): when x = ${testX}, y = ${y0} + ${m}(${dx}) = ${testY}.`;
          trap = `Adding slope to x-coordinate instead of y-coordinate.`;
        }
      } else if (subtopic === "Systems of Linear Equations") {
        const archetype = (i + attempt) % 4;
        if (archetype === 0) {
          const x = Math.floor(rand() * 12) + 2;
          const y = Math.floor(rand() * 12) + 2;
          const c1 = x + y;
          const c2 = 2 * x - y;
          qText = `Consider the system of linear equations:\nx + y = ${c1}\n2x - y = ${c2}\nWhat is the value of x?`;
          ans = `${x}`;
          distractors = [`${y}`, `${x + y}`, `${Math.max(1, x - 2)}`];
          explanation = `Add the equations: 3x = ${c1 + c2} => x = ${x}.`;
          trap = `Providing value of y instead of x.`;
        } else if (archetype === 1) {
          const x = Math.floor(rand() * 10) + 2;
          const y = Math.floor(rand() * 10) + 2;
          const c1 = 3 * x + 2 * y;
          const c2 = x - 2 * y;
          const target = x + y;
          qText = `If 3x + 2y = ${c1} and x - 2y = ${c2}, what is the value of x + y?`;
          ans = `${target}`;
          distractors = [`${x}`, `${y}`, `${target + 3}`];
          explanation = `Add equations: 4x = ${c1 + c2} => x = ${x}. Then 2y = ${c1} - 3(${x}) => y = ${y}. Then x + y = ${target}.`;
          trap = `Reporting only x or only y.`;
        } else if (archetype === 2) {
          const a = Math.floor(rand() * 6) + 2;
          const b = Math.floor(rand() * 6) + 2;
          const mult = Math.floor(rand() * 3) + 2;
          const d = a * mult;
          const k = b * mult;
          qText = `In the system of equations below, constant k ensures the system has no solution:\n${a}x + ${b}y = 15\n${d}x + ky = 40\nWhat is the value of k?`;
          ans = `${k}`;
          distractors = [`${b}`, `${d}`, `${k + 2}`];
          explanation = `Parallel lines have identical slopes: ${d}/${a} = k/${b} => k = ${k}.`;
          trap = `Confusing coefficient ratio with constant terms.`;
        } else {
          const name = MATH_NAMES[Math.floor(rand() * MATH_NAMES.length)];
          const countPencils = Math.floor(rand() * 5) + 3;
          const countPens = Math.floor(rand() * 4) + 2;
          const costPencil = 2;
          const costPen = 5;
          const total1 = countPencils * costPencil + countPens * costPen;
          const total2 = (countPencils + 2) * costPencil + (countPens + 1) * costPen;
          qText = `${name} bought ${countPencils} pencils and ${countPens} pens for $${total1}. At the same store, purchasing ${countPencils + 2} pencils and ${countPens + 1} pens costs $${total2}. What is the cost, in dollars, of 1 pen?`;
          ans = `${costPen}`;
          distractors = [`${costPencil}`, `${costPen + 1}`, `${costPen - 1}`];
          explanation = `Solving system yields pencil x = $${costPencil} and pen y = $${costPen}.`;
          trap = `Giving cost of pencil instead of pen.`;
        }
      } else if (subtopic === "Linear Inequalities in One or Two Variables") {
        const archetype = (i + attempt) % 3;
        if (archetype === 0) {
          const b = Math.floor(rand() * 15) + 5;
          const c = Math.floor(rand() * 20) + 10;
          const goodY = c + 4;
          const goodX = 2;
          qText = `Which of the following ordered pairs (x, y) satisfies the system of inequalities 2x - 3y < ${b} and y > ${c}?`;
          ans = `(${goodX}, ${goodY})`;
          distractors = [`(${b * 2}, 0)`, `(10, ${c - 2})`, `(20, 1)`];
          explanation = `2(${goodX}) - 3(${goodY}) < ${b} is True, and y = ${goodY} > ${c} is True.`;
          trap = `Choosing pair where y ≤ ${c}.`;
        } else if (archetype === 1) {
          const r1 = Math.floor(rand() * 6) + 12;
          const r2 = Math.floor(rand() * 8) + 18;
          const hours = Math.floor(rand() * 10) + 25;
          const targetEarn = Math.floor(rand() * 100) + 450;
          qText = `A student works two part-time jobs: tutoring at $${r2}/hour and lifeguarding at $${r1}/hour. The student wants to work at most ${hours} hours per week and earn at least $${targetEarn}. If x represents tutoring hours and y represents lifeguarding hours, which system of inequalities models this situation?`;
          ans = `x + y ≤ ${hours} and ${r2}x + ${r1}y ≥ ${targetEarn}`;
          distractors = [
            `x + y ≥ ${hours} and ${r2}x + ${r1}y ≥ ${targetEarn}`,
            `x + y ≤ ${hours} and ${r2}x + ${r1}y ≤ ${targetEarn}`,
            `${r2}x + ${r1}y ≤ ${hours} and x + y ≥ ${targetEarn}`,
          ];
          explanation = `At most ${hours} means x + y ≤ ${hours}. At least $${targetEarn} means ${r2}x + ${r1}y ≥ ${targetEarn}.`;
          trap = `Reversing inequality signs.`;
        } else {
          const a = Math.floor(rand() * 4) + 2;
          const b = Math.floor(rand() * 16) + 6;
          const c = Math.floor(rand() * 4) + 1;
          const d = Math.floor(rand() * 12) + 4;
          const xBound = Math.round((b + d) / (a - c));
          qText = `If ${a}x - ${b} > ${c}x + ${d}, which inequality describes all possible values of x?`;
          ans = `x > ${xBound}`;
          distractors = [`x < ${xBound}`, `x > ${xBound - 2}`, `x < ${-xBound}`];
          explanation = `Subtract ${c}x and add ${b}: ${a - c}x > ${b + d} => x > ${xBound}.`;
          trap = `Flipping inequality sign on dividing by positive.`;
        }
      } else {
        const archetype = (i + attempt) % 3;
        if (archetype === 0) {
          const c = Math.floor(rand() * 10) + 3;
          const k = Math.floor(rand() * 8) + 2;
          const rhs = c * 2 + k;
          const posRoot = (rhs + k) / 2;
          qText = `What is the positive solution to the absolute value equation |2x - ${k}| = ${rhs}?`;
          ans = `${posRoot}`;
          distractors = [`${c}`, `${posRoot - 2}`, `${posRoot + 3}`];
          explanation = `2x - ${k} = ${rhs} => 2x = ${rhs + k} => x = ${posRoot}.`;
          trap = `Solving only negative branch.`;
        } else if (archetype === 1) {
          const h = Math.floor(rand() * 15) + 10;
          const tol = Math.floor(rand() * 4) + 2;
          const maxD = h + tol;
          qText = `An industrial manufacturing process requires the diameter d of a steel pin to satisfy |d - ${h}| ≤ ${tol}. What is the maximum acceptable diameter of the pin?`;
          ans = `${maxD}`;
          distractors = [`${h}`, `${h - tol}`, `${maxD + tol}`];
          explanation = `-${tol} ≤ d - ${h} ≤ ${tol} => maximum d = ${h + tol}.`;
          trap = `Reporting nominal target ${h}.`;
        } else {
          const a = Math.floor(rand() * 5) + 2;
          const b = Math.floor(rand() * 12) + 4;
          const c = Math.floor(rand() * 15) + 10;
          qText = `How many real solutions does the absolute value equation |${a}x + ${b}| = -${c} have?`;
          ans = `0`;
          distractors = [`1`, `2`, `Infinitely many`];
          explanation = `Absolute value is always non-negative; it cannot equal negative number -${c}.`;
          trap = `Finding extraneous algebraic solutions.`;
        }
      }

      const sig = qText.trim().toLowerCase();
      if (!seenSignatures.has(sig)) {
        seenSignatures.add(sig);
        questions.push(formatQuestionWithDistractors(id, "Math", "Algebra", subtopic, difficulty, qText, ans, distractors, explanation, trap, i));
        break;
      }
      attempt++;
    }
  }
  return questions;
}

function generateAdvancedMathQuestions(subtopic: string, count: number, startGlobalIndex: number, seenSignatures: Set<string>): SATQuestion[] {
  const questions: SATQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const globalIdx = startGlobalIndex + i;
    const difficulty: DifficultyLevel = i % 3 === 0 ? "Easy" : i % 3 === 1 ? "Medium" : "Hard";
    const id = `math-adv-${i + 1}-${globalIdx}`;

    let attempt = 0;
    while (attempt < 20) {
      const rand = seededRandom(globalIdx * 4003 + attempt * 1019 + i * 41);
      let qText = "";
      let ans = "";
      let distractors: [string, string, string] = ["", "", ""];
      let explanation = "";
      let trap = "";

      if (subtopic === "Equivalent Expressions & Factoring") {
        const archetype = (i + attempt) % 4;
        if (archetype === 0) {
          const r1 = Math.floor(rand() * 12) + 2;
          const r2 = Math.floor(rand() * 12) + 2;
          const b = r1 + r2;
          const c = r1 * r2;
          qText = `Which of the following is an equivalent factored form of the quadratic expression x² - ${b}x + ${c}?`;
          ans = `(x - ${r1})(x - ${r2})`;
          distractors = [`(x + ${r1})(x + ${r2})`, `(x - ${r1})(x + ${r2})`, `(x - ${b})(x + ${c})`];
          explanation = `Find numbers that multiply to +${c} and sum to -${b}: -${r1} and -${r2}.`;
          trap = `Sign reversal error.`;
        } else if (archetype === 1) {
          const a = Math.floor(rand() * 6) + 2;
          const b = Math.floor(rand() * 8) + 3;
          const aSq = a * a;
          const bSq = b * b;
          qText = `Which expression is equivalent to ${aSq}x² - ${bSq}?`;
          ans = `(${a}x - ${b})(${a}x + ${b})`;
          distractors = [`(${a}x - ${b})²`, `(${a}x + ${b})²`, `${a}(x² - ${b})`];
          explanation = `Difference of squares: u² - v² = (u - v)(u + v).`;
          trap = `Confusing with perfect square binomial.`;
        } else if (archetype === 2) {
          const h = Math.floor(rand() * 6) + 1;
          const k = Math.floor(rand() * 12) + 2;
          const c = h * h + k;
          qText = `The expression x² - ${2 * h}x + ${c} can be rewritten in vertex form (x - h)² + k. What is the value of k?`;
          ans = `${k}`;
          distractors = [`${c}`, `${h}`, `${c - h}`];
          explanation = `Complete square: (x - ${h})² + ${k}. So k = ${k}.`;
          trap = `Reporting constant term ${c}.`;
        } else {
          const b = Math.floor(rand() * 10) + 3;
          qText = `Which of the following is equivalent to (x² - ${b * b}) / (x - ${b}) for all x ≠ ${b}?`;
          ans = `x + ${b}`;
          distractors = [`x - ${b}`, `x² + ${b}`, `${b}`];
          explanation = `Factor numerator: (x - ${b})(x + ${b}) / (x - ${b}) = x + ${b}.`;
          trap = `Incorrect cancellation.`;
        }
      } else if (subtopic === "Nonlinear Equations & Radicals") {
        const archetype = (i + attempt) % 3;
        if (archetype === 0) {
          const k = Math.floor(rand() * 8) + 3;
          const a = Math.floor(rand() * 4) + 2;
          const b = Math.floor(rand() * 10) + 1;
          const x = k * k;
          const inside = a * x + b;
          const rhs = Math.round(Math.sqrt(inside));
          const actualX = (rhs * rhs - b) / a;
          qText = `What is the solution to the radical equation √(${a}x + ${b}) = ${rhs}?`;
          ans = `${actualX}`;
          distractors = [`${actualX + 2}`, `${rhs * rhs}`, `${Math.max(1, actualX - 3)}`];
          explanation = `Square both sides: ${a}x + ${b} = ${rhs * rhs} => x = ${actualX}.`;
          trap = `Forgetting to square right-hand side.`;
        } else if (archetype === 1) {
          const a = Math.floor(rand() * 5) + 2;
          const b = Math.floor(rand() * 6) + 2;
          const c = Math.floor(rand() * 4) + 1;
          const xVal = b + a / c;
          qText = `If ${a} / (x - ${b}) = ${c}, what is the value of x?`;
          ans = `${xVal.toFixed(1).replace(/\.0$/, '')}`;
          distractors = [`${(xVal + 1).toFixed(1).replace(/\.0$/, '')}`, `${b}`, `${(xVal * 2).toFixed(1).replace(/\.0$/, '')}`];
          explanation = `${a} = ${c}(x - ${b}) => x = ${xVal.toFixed(1).replace(/\.0$/, '')}.`;
          trap = `Inverting fraction.`;
        } else {
          const c = Math.floor(rand() * 6) + 2;
          const target = c * c * c;
          qText = `If x^(2/3) = ${c * c}, what is the positive value of x?`;
          ans = `${target}`;
          distractors = [`${c * c}`, `${c}`, `${c * 4}`];
          explanation = `Raise to power 3/2: x = (${c * c})^(3/2) = ${c}³ = ${target}.`;
          trap = `Squaring instead of cubing.`;
        }
      } else if (subtopic === "Quadratic Functions & Vertex Form") {
        const archetype = (i + attempt) % 4;
        if (archetype === 0) {
          const h = Math.floor(rand() * 10) + 1;
          const k = Math.floor(rand() * 25) + 5;
          const a = Math.floor(rand() * 3) + 2;
          qText = `The function f is defined by f(x) = ${a}(x - ${h})² + ${k}. What is the minimum value of f(x)?`;
          ans = `${k}`;
          distractors = [`${h}`, `-${h}`, `${k + h}`];
          explanation = `Minimum value is vertex y-coordinate: ${k}.`;
          trap = `Reporting x-coordinate ${h}.`;
        } else if (archetype === 1) {
          const b = (Math.floor(rand() * 5) + 2) * 2;
          const c = Math.floor(rand() * 20) + 1;
          const axisX = b / 2;
          qText = `What is the equation of the axis of symmetry for the parabola y = x² - ${b}x + ${c}?`;
          ans = `x = ${axisX}`;
          distractors = [`x = -${axisX}`, `y = ${axisX}`, `x = ${b}`];
          explanation = `x = -b / (2a) = ${axisX}.`;
          trap = `Sign flip.`;
        } else if (archetype === 2) {
          const a = Math.floor(rand() * 3) + 1;
          const b = (Math.floor(rand() * 4) + 2) * 2;
          const reqC = (b * b) / (4 * a);
          qText = `For what value of constant c does the quadratic equation ${a}x² + ${b}x + c = 0 have exactly one real solution?`;
          ans = `${reqC.toFixed(2).replace(/\.00$/, '')}`;
          distractors = [`0`, `${b}`, `${(reqC * 2).toFixed(2).replace(/\.00$/, '')}`];
          explanation = `Discriminant b² - 4ac = 0 => c = ${reqC.toFixed(2).replace(/\.00$/, '')}.`;
          trap = `Setting discriminant > 0.`;
        } else {
          const v0 = (Math.floor(rand() * 4) + 4) * 16;
          const h0 = Math.floor(rand() * 15) + 5;
          const tMax = v0 / 32;
          qText = `A projectile launched vertically upward has its height in feet modeled by h(t) = -16t² + ${v0}t + ${h0}, where t is time in seconds. At what time t does the projectile reach its maximum height?`;
          ans = `${tMax} seconds`;
          distractors = [`${tMax * 2} seconds`, `${h0} seconds`, `${tMax + 1} seconds`];
          explanation = `Vertex time t = -b / (2a) = ${v0} / 32 = ${tMax} seconds.`;
          trap = `Confusing with landing time.`;
        }
      } else if (subtopic === "Exponential Growth & Decay Functions") {
        const archetype = (i + attempt) % 3;
        if (archetype === 0) {
          const p0 = (Math.floor(rand() * 8) + 3) * 100;
          const r = Math.floor(rand() * 12) + 3;
          const multiplier = (1 + r / 100).toFixed(2);
          qText = `A population of bacteria begins with ${p0} cells and increases by ${r}% every hour. Which function models the population P(t) after t hours?`;
          ans = `P(t) = ${p0}(${multiplier})^t`;
          distractors = [`P(t) = ${p0}(${(r / 100).toFixed(2)})^t`, `P(t) = ${p0} + ${r}t`, `P(t) = ${p0}(${(1 - r / 100).toFixed(2)})^t`];
          explanation = `P(t) = P₀(1 + r)^t = ${p0}(${multiplier})^t.`;
          trap = `Using only rate r/100 without adding 1.`;
        } else if (archetype === 1) {
          const val0 = (Math.floor(rand() * 10) + 15) * 1000;
          const decayRate = Math.floor(rand() * 10) + 8;
          const factor = (1 - decayRate / 100).toFixed(2);
          qText = `A commercial delivery vehicle is purchased for $${val0.toLocaleString()} and depreciates in value by ${decayRate}% each year. Which function V(t) models the value in dollars of the vehicle after t years?`;
          ans = `V(t) = ${val0}(${factor})^t`;
          distractors = [`V(t) = ${val0}(${(1 + decayRate / 100).toFixed(2)})^t`, `V(t) = ${val0} - ${decayRate * 100}t`, `V(t) = ${val0}(${(decayRate / 100).toFixed(2)})^t`];
          explanation = `V(t) = V₀(1 - r)^t = ${val0}(${factor})^t.`;
          trap = `Using growth factor instead of decay.`;
        } else {
          const halfLife = (Math.floor(rand() * 4) + 2) * 5;
          const initMass = (Math.floor(rand() * 6) + 2) * 50;
          qText = `A radioactive sample of isotope X has a half-life of ${halfLife} years. If the initial mass is ${initMass} grams, which expression represents the remaining mass after t years?`;
          ans = `${initMass}(1/2)^(t/${halfLife})`;
          distractors = [`${initMass}(1/2)^(${halfLife}t)`, `${initMass}(2)^(t/${halfLife})`, `${initMass} - (1/2)(${halfLife}t)`];
          explanation = `M(t) = M₀(1/2)^(t / H) = ${initMass}(1/2)^(t / ${halfLife}).`;
          trap = `Multiplying t by half-life instead of dividing.`;
        }
      } else {
        const archetype = (i + attempt) % 3;
        if (archetype === 0) {
          const c = Math.floor(rand() * 6) + 1;
          const rem = Math.floor(rand() * 15) + 3;
          qText = `When the polynomial P(x) is divided by (x - ${c}), the remainder is ${rem}. What is the value of P(${c})?`;
          ans = `${rem}`;
          distractors = [`0`, `-${c}`, `${rem * c}`];
          explanation = `By the Remainder Theorem, remainder equals P(${c}) = ${rem}.`;
          trap = `Assuming P(c) = 0.`;
        } else if (archetype === 1) {
          const c = Math.floor(rand() * 4) + 2;
          const a = Math.floor(rand() * 4) + 1;
          const k = -(c * c * c - a * c);
          qText = `If (x - ${c}) is a factor of the polynomial Q(x) = x³ - ${a}x + k, what is the value of constant k?`;
          ans = `${k}`;
          distractors = [`${-k}`, `0`, `${c}`];
          explanation = `Q(${c}) = 0 => k = ${k}.`;
          trap = `Sign flip.`;
        } else {
          const a = Math.floor(rand() * 4) + 2;
          const b = Math.floor(rand() * 5) + 2;
          const c = Math.floor(rand() * 6) + 3;
          const d = Math.floor(rand() * 4) + 1;
          const coeff = a * (-d) + b * c;
          qText = `What is the coefficient of x² in the product (${a}x + ${b})(${c}x² - ${d}x + 4)?`;
          ans = `${coeff}`;
          distractors = [`${a * c}`, `${coeff + 4}`, `${b * (-d)}`];
          explanation = `(-${a * d})x² + (${b * c})x² = ${coeff}x².`;
          trap = `Multiplying only leading coefficients.`;
        }
      }

      const sig = qText.trim().toLowerCase();
      if (!seenSignatures.has(sig)) {
        seenSignatures.add(sig);
        questions.push(formatQuestionWithDistractors(id, "Math", "Advanced Math", subtopic, difficulty, qText, ans, distractors, explanation, trap, i));
        break;
      }
      attempt++;
    }
  }
  return questions;
}

function generateProblemSolvingQuestions(subtopic: string, count: number, startGlobalIndex: number, seenSignatures: Set<string>): SATQuestion[] {
  const questions: SATQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const globalIdx = startGlobalIndex + i;
    const difficulty: DifficultyLevel = i % 3 === 0 ? "Easy" : i % 3 === 1 ? "Medium" : "Hard";
    const id = `math-ps-${i + 1}-${globalIdx}`;

    let attempt = 0;
    while (attempt < 20) {
      const rand = seededRandom(globalIdx * 4007 + attempt * 1021 + i * 43);
      let qText = "";
      let ans = "";
      let distractors: [string, string, string] = ["", "", ""];
      let explanation = "";
      let trap = "";
      let tableData: { headers: string[]; rows: (string | number)[][] } | undefined = undefined;

      if (subtopic === "Ratios, Rates & Unit Conversions") {
        const archetype = (i + attempt) % 4;
        if (archetype === 0) {
          const speed = (Math.floor(rand() * 5) + 5) * 10;
          const hours = Math.floor(rand() * 4) + 2;
          const dist = speed * (hours + 0.5);
          qText = `An express passenger train travels along a straight track at a constant speed of ${speed} miles per hour. How many total miles does the train travel in ${hours} hours and 30 minutes?`;
          ans = `${dist}`;
          distractors = [`${speed * hours}`, `${dist + speed}`, `${speed * (hours + 1)}`];
          explanation = `Distance = Speed * Time = ${speed} * ${hours}.5 = ${dist} miles.`;
          trap = `Ignoring 30 minutes.`;
        } else if (archetype === 1) {
          const scaleCm = Math.floor(rand() * 3) + 2;
          const scaleKm = (Math.floor(rand() * 5) + 3) * 10;
          const mapDist = Math.floor(rand() * 8) + 4;
          const actualKm = (mapDist * scaleKm) / scaleCm;
          qText = `On an architectural topographical map, ${scaleCm} centimeters represents an actual distance of ${scaleKm} kilometers. If two mountain peaks are separated by ${mapDist} centimeters on the map, what is the actual distance, in kilometers, between them?`;
          ans = `${actualKm.toFixed(1).replace(/\.0$/, '')}`;
          distractors = [`${(actualKm + 10).toFixed(1).replace(/\.0$/, '')}`, `${(mapDist * scaleKm).toFixed(1).replace(/\.0$/, '')}`, `${(actualKm / 2).toFixed(1).replace(/\.0$/, '')}`];
          explanation = `x = (${mapDist} * ${scaleKm}) / ${scaleCm} = ${actualKm.toFixed(1).replace(/\.0$/, '')} km.`;
          trap = `Multiplying without dividing by scale base.`;
        } else if (archetype === 2) {
          const mpg = Math.floor(rand() * 10) + 25;
          const costPerGal = (Math.floor(rand() * 15) + 32) / 10;
          const miles = (Math.floor(rand() * 8) + 4) * 50;
          const totalCost = (miles / mpg) * costPerGal;
          qText = `A hybrid vehicle averages ${mpg} miles per gallon of gasoline. If gasoline costs $${costPerGal.toFixed(2)} per gallon, approximately how much will gasoline cost for a road trip of ${miles} miles?`;
          ans = `$${totalCost.toFixed(2)}`;
          distractors = [`$${(totalCost * 1.25).toFixed(2)}`, `$${((miles * costPerGal) / 100).toFixed(2)}`, `$${(totalCost - 8).toFixed(2)}`];
          explanation = `Gallons = ${miles} / ${mpg}. Cost = ${(miles / mpg).toFixed(2)} * $${costPerGal.toFixed(2)} = $${totalCost.toFixed(2)}.`;
          trap = `Multiplying miles by mpg.`;
        } else {
          const fps = (Math.floor(rand() * 6) + 4) * 11;
          const mph = Math.round((fps * 3600) / 5280);
          qText = `An autonomous drone travels at a constant velocity of ${fps} feet per second. Given that 1 mile = 5,280 feet and 1 hour = 3,600 seconds, what is the drone's speed in miles per hour (rounded to the nearest whole number)?`;
          ans = `${mph}`;
          distractors = [`${mph - 5}`, `${mph + 7}`, `${Math.round(fps / 3)}`];
          explanation = `Speed in mph = (${fps} * 3,600) / 5,280 = ${mph} mph.`;
          trap = `Inverting conversion factors.`;
        }
      } else if (subtopic === "Percentages & Margin of Error") {
        const archetype = (i + attempt) % 4;
        if (archetype === 0) {
          const origPrice = (Math.floor(rand() * 10) + 8) * 10;
          const disc = (Math.floor(rand() * 5) + 2) * 5;
          const tax = 8;
          const salePrice = origPrice * (1 - disc / 100);
          const finalPrice = salePrice * (1 + tax / 100);
          qText = `A winter jacket with an original retail price of $${origPrice} is discounted by ${disc}%. A ${tax}% sales tax is then applied to the discounted price. What is the final purchase price of the jacket?`;
          ans = `$${finalPrice.toFixed(2)}`;
          distractors = [`$${(origPrice * (1 - (disc - tax) / 100)).toFixed(2)}`, `$${salePrice.toFixed(2)}`, `$${(finalPrice + 12).toFixed(2)}`];
          explanation = `Sale price = $${salePrice.toFixed(2)}. Final price = $${finalPrice.toFixed(2)}.`;
          trap = `Directly subtracting tax percentage from discount percentage.`;
        } else if (archetype === 1) {
          const oldVal = (Math.floor(rand() * 8) + 4) * 50;
          const inc = (Math.floor(rand() * 6) + 3) * 5;
          const newVal = Math.round(oldVal * (1 + inc / 100));
          qText = `The enrollment at a community college increased from ${oldVal} students in 2022 to ${newVal} students in 2024. What was the percent increase in enrollment?`;
          ans = `${inc}%`;
          distractors = [`${inc + 5}%`, `${Math.round((newVal / oldVal) * 10)}%`, `${inc - 3}%`];
          explanation = `Percent increase = (${newVal} - ${oldVal}) / ${oldVal} * 100% = ${inc}%.`;
          trap = `Dividing by new enrollment.`;
        } else if (archetype === 2) {
          const pct = Math.floor(rand() * 10) + 52;
          const moe = 2.5;
          const lower = (pct - moe).toFixed(1);
          const upper = (pct + moe).toFixed(1);
          qText = `A randomized poll of 1,200 registered voters found that ${pct}% supported a proposed public transit bond, with an associated margin of error of ±${moe}%. Which of the following represents the plausible interval for the percentage of all voters who support the bond?`;
          ans = `Between ${lower}% and ${upper}%`;
          distractors = [`Between ${(pct - 2 * moe).toFixed(1)}% and ${pct}%`, `Exactly ${pct}%`, `Between ${pct}% and ${(pct + 2 * moe).toFixed(1)}%`];
          explanation = `Interval = ${pct}% ± ${moe}% = [${lower}%, ${upper}%].`;
          trap = `Believing point estimate is exact.`;
        } else {
          const disc = (Math.floor(rand() * 5) + 3) * 5;
          const finalPrice = Math.floor(rand() * 40) + 60;
          const orig = finalPrice / (1 - disc / 100);
          qText = `After receiving a ${disc}% promotional discount, a customer purchased a smart tablet for $${finalPrice}. What was the original price of the tablet before the discount (rounded to nearest dollar)?`;
          ans = `$${Math.round(orig)}`;
          distractors = [`$${Math.round(finalPrice * (1 + disc / 100))}`, `$${finalPrice + disc}`, `$${Math.round(orig + 15)}`];
          explanation = `Original = ${finalPrice} / ${(1 - disc / 100).toFixed(2)} ≈ $${Math.round(orig)}.`;
          trap = `Adding percentage to sale price.`;
        }
      } else if (subtopic === "Two-Way Contingency Tables & Probability") {
        const treatSucc = (Math.floor(rand() * 6) + 5) * 10;
        const treatFail = Math.floor(rand() * 4) + 15;
        const placeSucc = (Math.floor(rand() * 4) + 2) * 10;
        const placeFail = Math.floor(rand() * 6) + 40;
        const treatTotal = treatSucc + treatFail;
        const totalParticipants = treatTotal + placeSucc + placeFail;

        tableData = {
          headers: ["Cohort", "Positive Outcome", "No Improvement", "Total"],
          rows: [
            ["Treatment Group", treatSucc, treatFail, treatTotal],
            ["Placebo Group", placeSucc, placeFail, placeSucc + placeFail],
            ["Total", treatSucc + placeSucc, treatFail + placeFail, totalParticipants],
          ],
        };

        const archetype = (i + attempt) % 2;
        if (archetype === 0) {
          qText = `Based on the clinical trial contingency table, if a participant from the Treatment Group is chosen at random, what is the probability that the participant experienced a Positive Outcome?`;
          ans = `${treatSucc} / ${treatTotal}`;
          distractors = [`${treatSucc} / ${totalParticipants}`, `${treatSucc} / ${treatSucc + placeSucc}`, `${treatFail} / ${treatTotal}`];
          explanation = `Conditional probability: P(Positive | Treatment) = ${treatSucc} / ${treatTotal}.`;
          trap = `Using grand total as denominator.`;
        } else {
          const failTotal = treatFail + placeFail;
          qText = `If a participant who experienced No Improvement is selected at random from the study, what is the probability that the participant was in the Placebo Group?`;
          ans = `${placeFail} / ${failTotal}`;
          distractors = [`${placeFail} / ${placeSucc + placeFail}`, `${placeFail} / ${totalParticipants}`, `${treatFail} / ${failTotal}`];
          explanation = `Condition on 'No Improvement' total: ${failTotal}. P = ${placeFail} / ${failTotal}.`;
          trap = `Conditioning on Placebo row instead.`;
        }
      } else if (subtopic === "Statistics: Center, Spread & Outliers") {
        const archetype = (i + attempt) % 3;
        if (archetype === 0) {
          const mean0 = Math.floor(rand() * 20) + 70;
          const sd0 = Math.floor(rand() * 4) + 6;
          const addConst = Math.floor(rand() * 8) + 4;
          qText = `A set of exam scores has a mean of ${mean0} and a standard deviation of ${sd0}. If each score is increased by ${addConst} points, what are the new mean and standard deviation of the scores?`;
          ans = `Mean = ${mean0 + addConst}, Standard Deviation = ${sd0}`;
          distractors = [
            `Mean = ${mean0 + addConst}, Standard Deviation = ${sd0 + addConst}`,
            `Mean = ${mean0}, Standard Deviation = ${sd0}`,
            `Mean = ${mean0 + addConst}, Standard Deviation = ${sd0 * addConst}`,
          ];
          explanation = `Adding a constant increases mean by ${addConst}, but standard deviation remains ${sd0}.`;
          trap = `Adding constant to standard deviation.`;
        } else if (archetype === 1) {
          qText = `A dataset of 15 household home values in a neighborhood has a median of $320,000 and a mean of $335,000. A luxury mansion valued at $4,500,000 is built in the neighborhood and added to the dataset. Which measure of center will increase by the greatest amount?`;
          ans = `The mean`;
          distractors = [`The median`, `Both mean and median increase by identical amounts`, `Neither measure is affected`];
          explanation = `Mean is sensitive to outliers; median is resistant.`;
          trap = `Assuming mean and median react equally.`;
        } else {
          const q1 = Math.floor(rand() * 10) + 45;
          const q3 = q1 + Math.floor(rand() * 15) + 20;
          const iqr = q3 - q1;
          qText = `In a box plot representing employee commute times in minutes, the first quartile (Q₁) is ${q1} and the third quartile (Q₃) is ${q3}. What is the interquartile range (IQR) of the commute times?`;
          ans = `${iqr} minutes`;
          distractors = [`${q1 + q3} minutes`, `${Math.round((q1 + q3) / 2)} minutes`, `${iqr + 10} minutes`];
          explanation = `IQR = Q₃ - Q₁ = ${q3} - ${q1} = ${iqr} minutes.`;
          trap = `Computing midpoint instead.`;
        }
      } else {
        const archetype = (i + attempt) % 2;
        if (archetype === 0) {
          const slope = (Math.floor(rand() * 8) + 4) / 10;
          const intercept = Math.floor(rand() * 10) + 12;
          qText = `A biologist studies the growth of a shrub species. A scatterplot relates the age of the shrub in years, x, to its height in feet, y. The line of best fit is given by y = ${slope}x + ${intercept}. Which of the following is the best interpretation of the slope ${slope} in this context?`;
          ans = `The shrub's height increases by an estimated ${slope} feet for each additional year of age.`;
          distractors = [
            `The initial height of the shrub was ${slope} feet.`,
            `The shrub's age increases by ${slope} years for each foot of height.`,
            `The shrub reaches a maximum height of ${slope} feet.`,
          ];
          explanation = `Slope represents rate of change: ${slope} feet per year.`;
          trap = `Inverting variables.`;
        } else {
          const predSlope = 3;
          const predInt = 20;
          const xVal = 10;
          const predY = predSlope * xVal + predInt;
          const obsY = predY + Math.floor(rand() * 6) + 4;
          const residual = obsY - predY;
          qText = `For a line of best fit ŷ = ${predSlope}x + ${predInt}, a data point has an x-value of ${xVal} and an observed y-value of ${obsY}. What is the residual (observed y - predicted y) for this point?`;
          ans = `${residual}`;
          distractors = [`-${residual}`, `${predY}`, `${obsY}`];
          explanation = `Predicted ŷ = ${predY}. Residual = ${obsY} - ${predY} = ${residual}.`;
          trap = `Subtracting observed from predicted.`;
        }
      }

      const sig = qText.trim().toLowerCase();
      if (!seenSignatures.has(sig)) {
        seenSignatures.add(sig);
        questions.push(formatQuestionWithDistractors(id, "Math", "Problem Solving & Data Analysis", subtopic, difficulty, qText, ans, distractors, explanation, trap, i, undefined, tableData));
        break;
      }
      attempt++;
    }
  }
  return questions;
}

function generateGeometryQuestions(subtopic: string, count: number, startGlobalIndex: number, seenSignatures: Set<string>): SATQuestion[] {
  const questions: SATQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const globalIdx = startGlobalIndex + i;
    const difficulty: DifficultyLevel = i % 3 === 0 ? "Easy" : i % 3 === 1 ? "Medium" : "Hard";
    const id = `math-geom-${i + 1}-${globalIdx}`;

    let attempt = 0;
    while (attempt < 20) {
      const rand = seededRandom(globalIdx * 4013 + attempt * 1031 + i * 47);
      let qText = "";
      let ans = "";
      let distractors: [string, string, string] = ["", "", ""];
      let explanation = "";
      let trap = "";

      if (subtopic === "Area and Volume Formulas") {
        const archetype = (i + attempt) % 4;
        if (archetype === 0) {
          const r = Math.floor(rand() * 6) + 3;
          const h = Math.floor(rand() * 10) + 4;
          const vol = r * r * h;
          qText = `A right circular cylinder has a base radius of ${r} cm and a height of ${h} cm. What is the volume, in cm³, of the cylinder?`;
          ans = `${vol}π`;
          distractors = [`${2 * r * h}π`, `${Math.round(vol / 3)}π`, `${r * h}π`];
          explanation = `Volume = πr²h = ${vol}π cm³.`;
          trap = `Using cone formula.`;
        } else if (archetype === 1) {
          const r = (Math.floor(rand() * 4) + 1) * 3;
          const h = Math.floor(rand() * 6) + 4;
          const vol = Math.round((r * r * h) / 3);
          qText = `A right circular cone has a base radius of ${r} meters and a height of ${h} meters. What is the volume, in cubic meters, of the cone?`;
          ans = `${vol}π`;
          distractors = [`${r * r * h}π`, `${2 * r * h}π`, `${Math.round(vol / 2)}π`];
          explanation = `Cone volume = (1/3)πr²h = ${vol}π m³.`;
          trap = `Forgetting 1/3 factor.`;
        } else if (archetype === 2) {
          const r = (Math.floor(rand() * 4) + 1) * 3;
          const vol = Math.round((4 / 3) * r * r * r);
          qText = `What is the volume, in cubic centimeters, of a solid sphere with radius ${r} centimeters?`;
          ans = `${vol}π`;
          distractors = [`${4 * r * r}π`, `${Math.round(vol / 2)}π`, `${r * r * r}π`];
          explanation = `Sphere volume = (4/3)πr³ = ${vol}π cm³.`;
          trap = `Using surface area formula.`;
        } else {
          const factor = Math.floor(rand() * 3) + 2;
          const factorCubed = factor * factor * factor;
          qText = `Two similar rectangular prisms, Prism A and Prism B, have corresponding linear edge lengths in a ratio of 1 : ${factor}. If the volume of Prism A is 24 cubic inches, what is the volume, in cubic inches, of Prism B?`;
          ans = `${24 * factorCubed}`;
          distractors = [`${24 * factor}`, `${24 * factor * factor}`, `${24 + factorCubed}`];
          explanation = `Volume scales by k³ = ${factorCubed}. Volume = 24 * ${factorCubed} = ${24 * factorCubed}.`;
          trap = `Scaling volume linearly.`;
        }
      } else if (subtopic === "Triangles & Pythagorean Theorem") {
        const archetype = (i + attempt) % 4;
        if (archetype === 0) {
          const triples = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]];
          const triple = triples[(i + attempt) % triples.length];
          const mult = Math.floor(rand() * 3) + 1;
          const a = triple[0] * mult;
          const b = triple[1] * mult;
          const c = triple[2] * mult;
          qText = `In right triangle ABC, angle C is 90°. If leg AC = ${a} and leg BC = ${b}, what is the length of hypotenuse AB?`;
          ans = `${c}`;
          distractors = [`${a + b}`, `${c * 2}`, `${Math.round(Math.sqrt(a * a + b))}`];
          explanation = `c = √(a² + b²) = ${c}.`;
          trap = `Adding legs directly.`;
        } else if (archetype === 1) {
          const x = Math.floor(rand() * 6) + 3;
          qText = `In a 30°-60°-90° right triangle, the length of the side opposite the 30° angle is ${x}. What is the length of the hypotenuse?`;
          ans = `${x * 2}`;
          distractors = [`${x}√3`, `${x + 2}`, `${x * 4}`];
          explanation = `Hypotenuse = 2 * (short leg) = ${x * 2}.`;
          trap = `Confusing with longer leg.`;
        } else if (archetype === 2) {
          const leg = Math.floor(rand() * 8) + 4;
          qText = `In an isosceles right triangle (45°-45°-90°), the length of each leg is ${leg}. What is the length of the hypotenuse?`;
          ans = `${leg}√2`;
          distractors = [`${leg * 2}`, `${leg}√3`, `${leg + 2}`];
          explanation = `Hypotenuse = leg * √2 = ${leg}√2.`;
          trap = `Using 30-60-90 ratio.`;
        } else {
          const a = Math.floor(rand() * 5) + 6;
          const b = Math.floor(rand() * 5) + 12;
          const minC = b - a;
          const maxC = b + a;
          qText = `A triangle has two sides with lengths ${a} and ${b}. According to the triangle inequality theorem, which of the following could be the length of the third side?`;
          ans = `${b}`;
          distractors = [`${minC}`, `${maxC}`, `${maxC + 3}`];
          explanation = `${minC} < c < ${maxC}. ${b} is strictly within range.`;
          trap = `Selecting boundary values.`;
        }
      } else if (subtopic === "Circle Equations & Arc Radians") {
        const archetype = (i + attempt) % 3;
        if (archetype === 0) {
          const h = Math.floor(rand() * 8) + 1;
          const k = Math.floor(rand() * 8) + 1;
          const r = Math.floor(rand() * 6) + 2;
          const rSq = r * r;
          qText = `A circle in the xy-plane is given by the equation (x - ${h})² + (y + ${k})² = ${rSq}. What are the coordinates of its center and its radius?`;
          ans = `Center: (${h}, -${k}), Radius: ${r}`;
          distractors = [`Center: (-${h}, ${k}), Radius: ${r}`, `Center: (${h}, -${k}), Radius: ${rSq}`, `Center: (-${h}, -${k}), Radius: ${r}`];
          explanation = `Center is (${h}, -${k}) and radius is √${rSq} = ${r}.`;
          trap = `Sign inversion.`;
        } else if (archetype === 1) {
          const r = (Math.floor(rand() * 4) + 2) * 2;
          const deg = (Math.floor(rand() * 4) + 1) * 30;
          const arcFrac = deg / 360;
          const arcLen = arcFrac * 2 * r;
          qText = `In a circle with radius ${r} cm, a central angle intercepts an arc with measure ${deg}°. What is the length, in cm, of the intercepted arc?`;
          ans = `${arcLen}π`;
          distractors = [`${arcLen * 2}π`, `${(arcLen / 2).toFixed(1)}π`, `${r * deg}π`];
          explanation = `Arc length = (θ / 360°) * 2πr = ${arcLen}π cm.`;
          trap = `Calculating sector area instead.`;
        } else {
          const deg = (Math.floor(rand() * 5) + 1) * 45;
          const radFrac = deg / 180;
          qText = `What is the radian measure equivalent to an angle of ${deg}°?`;
          ans = `${radFrac.toFixed(2).replace(/\.00$/, '')}π`;
          distractors = [`${(deg / 360).toFixed(2)}π`, `${deg}π`, `${(180 / deg).toFixed(2)}π`];
          explanation = `Radians = degrees * (π / 180) = ${radFrac.toFixed(2).replace(/\.00$/, '')}π.`;
          trap = `Dividing by 360°.`;
        }
      } else {
        const archetype = (i + attempt) % 3;
        if (archetype === 0) {
          const angle = (Math.floor(rand() * 3) + 1) * 20;
          const comp = 90 - angle;
          qText = `In a right triangle with acute angles x° and y°, sin(x°) = cos(y°). If x = ${angle}°, what is the value of y?`;
          ans = `${comp}°`;
          distractors = [`${angle}°`, `${180 - angle}°`, `45°`];
          explanation = `Cofunction identity: x + y = 90° => y = ${comp}°.`;
          trap = `Confusing with supplementary angles (180°).`;
        } else if (archetype === 1) {
          qText = `In right triangle ABC with right angle at C, leg AC = 4 and leg BC = 3. What is the value of tan(A)?`;
          ans = `3/4`;
          distractors = [`4/3`, `3/5`, `4/5`];
          explanation = `tan(A) = Opposite / Adjacent = 3/4.`;
          trap = `Inverting tangent.`;
        } else {
          qText = `For any acute angle θ, what is the value of sin²(θ) + cos²(θ)?`;
          ans = `1`;
          distractors = [`0`, `2`, `tan(θ)`];
          explanation = `Pythagorean identity: sin²(θ) + cos²(θ) = 1.`;
          trap = `Assuming dependence on specific angle value.`;
        }
      }

      const sig = qText.trim().toLowerCase();
      if (!seenSignatures.has(sig)) {
        seenSignatures.add(sig);
        questions.push(formatQuestionWithDistractors(id, "Math", "Geometry & Trigonometry", subtopic, difficulty, qText, ans, distractors, explanation, trap, i));
        break;
      }
      attempt++;
    }
  }
  return questions;
}

// Reading & Writing Repositories
const RW_RESEARCHERS = ["Dr. Vance", "Dr. Thorne", "Prof. Dubois", "Dr. Mensah", "Dr. Alvarez", "Dr. Chen", "Prof. Tanaka", "Dr. O'Connor", "Dr. Lindqvist", "Dr. Rossi", "Dr. Gallagher", "Prof. Zhao"];
const RW_INSTITUTIONS = ["Woods Hole Oceanographic Institution", "Max Planck Institute", "Cambridge University", "Caltech Planetary Lab", "Smithsonian Institution", "Oxford Palaeobiology Group", "Sorbonne Laboratory", "Tokyo Institute of Technology"];

const VOCAB_DATA = [
  { word: "anomalous", distractors: ["predictable", "ubiquitous", "rudimentary"] as [string, string, string], def: "deviating from normal or expected behavior" },
  { word: "bolster", distractors: ["undermine", "curtail", "obscure"] as [string, string, string], def: "to support, strengthen, or reinforce" },
  { word: "corroborate", distractors: ["contradict", "invalidate", "conjecture"] as [string, string, string], def: "to confirm or give support to a finding" },
  { word: "ephemeral", distractors: ["perpetual", "immutable", "enduring"] as [string, string, string], def: "lasting for a very short time" },
  { word: "mitigate", distractors: ["exacerbate", "intensify", "perpetuate"] as [string, string, string], def: "to make less severe, serious, or painful" },
  { word: "pragmatic", distractors: ["idealistic", "esoteric", "frivolous"] as [string, string, string], def: "dealing with things sensibly and realistically" },
  { word: "substantiate", distractors: ["refute", "discredit", "fabricate"] as [string, string, string], def: "to provide evidence to support or prove the truth of" },
  { word: "ubiquitous", distractors: ["scarce", "esoteric", "localized"] as [string, string, string], def: "present, appearing, or found everywhere" },
  { word: "meticulous", distractors: ["cursory", "negligent", "slapdash"] as [string, string, string], def: "showing great attention to detail; very careful and precise" },
  { word: "lucid", distractors: ["opaque", "ambiguous", "convoluted"] as [string, string, string], def: "expressed clearly; easy to understand" },
  { word: "galvanize", distractors: ["demoralize", "tranquilize", "dissuade"] as [string, string, string], def: "to shock or excite someone into taking action" },
  { word: "delineate", distractors: ["confuse", "distort", "conflate"] as [string, string, string], def: "to describe or portray precisely" },
  { word: "juxtapose", distractors: ["isolate", "homogenize", "disperse"] as [string, string, string], def: "to place close together for contrasting effect" },
  { word: "resilient", distractors: ["fragile", "susceptible", "vulnerable"] as [string, string, string], def: "able to withstand or recover quickly from difficult conditions" },
  { word: "superfluous", distractors: ["vital", "indispensable", "rudimentary"] as [string, string, string], def: "unnecessary, especially through being more than enough" },
  { word: "plausible", distractors: ["implausible", "irrational", "untenable"] as [string, string, string], def: "seeming reasonable or probable" },
  { word: "tenuous", distractors: ["robust", "unshakeable", "substantial"] as [string, string, string], def: "very weak or slight" },
  { word: "innovative", distractors: ["derivative", "pedestrian", "archaic"] as [string, string, string], def: "featuring new methods; advanced and original" },
  { word: "immutable", distractors: ["malleable", "variable", "transient"] as [string, string, string], def: "unchanging over time or unable to be changed" },
  { word: "disparate", distractors: ["homogeneous", "uniform", "identical"] as [string, string, string], def: "essentially different in kind; not allowing comparison" },
];

const RW_DOMAINS_TOPICS = [
  { topic: "deep-sea hydrothermal vent microbiomes", unit: "chemosynthetic sulfur-oxidizing bacteria", param: "water temperature", metric: "barometric bar" },
  { topic: "early Holocene agricultural expansion", unit: "charred einkorn wheat grains", param: "radiocarbon stratigraphy", metric: "calibrated BCE years" },
  { topic: "polar ice sheet firn densification", unit: "trapped atmospheric gas bubbles", param: "delta-18 oxygen ratios", metric: "per mil deviation" },
  { topic: "exoplanet atmospheric spectroscopy", unit: "transmission light spectra", param: "methane absorption wavelengths", metric: "nanometers" },
  { topic: "neolithic obsidian blade trade networks", unit: "volcanic trace element profiles", param: "x-ray fluorescence spectra", metric: "parts per million" },
  { topic: "avian nocturnal magnetic navigation", unit: "cryptochrome photoreceptor proteins", param: "blue light irradiance", metric: "lux intensity" },
  { topic: "urban canopy microclimate regulation", unit: "broadleaf evapotranspiration rates", param: "ambient daytime heat index", metric: "degrees Celsius" },
  { topic: "Renaissance copper-plate etching degradation", unit: "verdigris pigment precipitates", param: "ambient atmospheric acidity", metric: "pH levels" },
];

function generateReadingWritingQuestions(
  domain: SATDomain,
  subtopic: string,
  count: number,
  startGlobalIndex: number,
  seenSignatures: Set<string>
): SATQuestion[] {
  const questions: SATQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const globalIdx = startGlobalIndex + i;
    const difficulty: DifficultyLevel = i % 3 === 0 ? "Easy" : i % 3 === 1 ? "Medium" : "Hard";
    const id = `rw-${domain.slice(0, 3).toLowerCase()}-${i + 1}-${globalIdx}`;

    let attempt = 0;
    while (attempt < 20) {
      const rand = seededRandom(globalIdx * 4019 + attempt * 1033 + i * 53);
      let qText = "";
      let ans = "";
      let distractors: [string, string, string] = ["", "", ""];
      let explanation = "";
      let trap = "";
      let passage: string | undefined = undefined;
      let tableData: { headers: string[]; rows: (string | number)[][] } | undefined = undefined;

      const researcher = RW_RESEARCHERS[(i + attempt) % RW_RESEARCHERS.length];
      const inst = RW_INSTITUTIONS[(i + attempt) % RW_INSTITUTIONS.length];
      const top = RW_DOMAINS_TOPICS[(i + attempt) % RW_DOMAINS_TOPICS.length];
      const year = 2018 + (i % 6);

      if (subtopic === "Words in Context & High-Utility Vocabulary") {
        const vocab = VOCAB_DATA[(i + attempt) % VOCAB_DATA.length];
        passage = `In a ${year} investigation into ${top.topic} conducted by ${researcher} at ${inst}, preliminary readings showed unexpected spikes in ${top.param}. Despite initial skepticism, the scientific team demonstrated that the observed phenomenon was remarkably ______ once baseline environmental factors were held constant.`;
        qText = "Which choice completes the text with the most logical and precise word or phrase?";
        ans = vocab.word;
        distractors = vocab.distractors;
        explanation = `The context indicates that the phenomenon aligned with the research team's hypothesis once baseline factors were controlled, making '${vocab.word}' (${vocab.def}) the most precise choice.`;
        trap = "Selecting a word with a similar formal tone that contradicts the contextual requirement.";
      } else if (subtopic === "Text Structure & Purpose") {
        passage = `In their ${year} monograph, ${researcher} and colleagues at ${inst} re-examined prevailing assumptions regarding ${top.topic}. While earlier twentieth-century models posited that ${top.unit} functioned primarily through passive environmental diffusion, new high-resolution imaging revealed active molecular transport pathways. Consequently, ${researcher} argues that existing ecological textbooks must be revised to acknowledge the organism's proactive regulatory capacity.`;
        const qKind = (i + attempt) % 3;
        if (qKind === 0) {
          qText = "Which choice best states the primary purpose of the text?";
          ans = `To challenge an established model regarding ${top.topic} by presenting new empirical findings.`;
          distractors = [
            `To criticize ${researcher}'s laboratory methodology at ${inst}.`,
            `To prove that earlier twentieth-century models had completely fabricated their data.`,
            `To argue that molecular transport is identical across all living organisms.`,
          ];
          explanation = "The passage describes an earlier consensus, introduces new empirical evidence from high-resolution imaging, and calls for updating existing models.";
          trap = "Choosing an overly adversarial option claiming earlier scientists fabricated data.";
        } else if (qKind === 1) {
          qText = "Which choice best describes the function of the second sentence in the overall structure of the text?";
          ans = "It contrasts an earlier consensus model with recent high-resolution empirical observations.";
          distractors = [
            "It provides statistical evidence disproving the existence of active transport.",
            "It introduces an unrelated scientific discovery to distract the reader.",
            "It outlines the funding sources supporting the research.",
          ];
          explanation = "The second sentence explicitly contrasts 'earlier twentieth-century models' with 'new high-resolution imaging'.";
          trap = "Confusing the function of the sentence with the overall conclusion of the entire passage.";
        } else {
          qText = "Which choice best describes the author's tone toward the earlier twentieth-century models?";
          ans = "Respectfully critical of their empirical limitations in light of modern imaging advances.";
          distractors = ["Vindictive and dismissive", "Unreservedly enthusiastic", "Entirely neutral and uncritical"];
          explanation = "The author systematically examines earlier assumptions and notes their limitations without personal animosity.";
          trap = "Selecting extreme emotional descriptions like 'vindictive'.";
        }
      } else if (subtopic === "Cross-Text Connections (Paired Passages)") {
        const text1 = `Text 1\nAdvocates of the external forcing model argue that rapid shifts in ${top.topic} were initiated by abrupt climatic variations. According to ${researcher}, data from ${year} sediment cores indicates that environmental changes preceded behavioral adaptations by several centuries.\n\n`;
        const text2 = `Text 2\nWhile acknowledging environmental pressures, Dr. Liam Patel contends that internal technological innovations were the primary catalysts for development in ${top.topic}. Patel emphasizes that cultural artifacts reveal coordinated planning well before the onset of documented climate stress.`;
        passage = text1 + text2;
        qText = "Based on the passages, how would Dr. Patel (Text 2) most likely respond to the claim made by the author of Text 1?";
        ans = "By arguing that technological innovation occurred independently of, and prior to, external climatic pressure.";
        distractors = [
          "By completely denying that environmental changes ever occurred during the study period.",
          "By agreeing that cultural artifacts played no role in historical development.",
          "By demonstrating that sediment core dating was mathematically impossible.",
        ];
        explanation = "Text 2 explicitly argues that internal technological innovations and coordinated planning occurred prior to climate stress.";
        trap = "Assuming Text 2 denies the existence of environmental changes entirely.";
      } else if (subtopic === "Rhetorical Synthesis (Bullet-Point Notes)") {
        const noteBullets = [
          `In ${year}, ${researcher} led a major field study investigating ${top.topic} at ${inst}.`,
          `The researchers cataloged over ${(i % 5 + 2) * 150} individual specimens of ${top.unit}.`,
          `Specimens collected in high-${top.param} environments exhibited an average 34% increase in metabolic resilience.`,
          `Prior to this expedition, scientists believed that ${top.unit} could only survive in mild, low-${top.param} habitats.`,
          `The findings demonstrate that ${top.unit} possesses remarkable evolutionary plasticity.`,
        ];
        passage = `While researching a topic, a student has taken the following notes:\n• ${noteBullets.join("\n• ")}`;
        qText = "The student wants to emphasize the contrast between earlier scientific assumptions and the study's new findings. Which choice most effectively uses relevant information from the notes to accomplish this goal?";
        ans = `Although scientists previously believed ${top.unit} could only survive in mild environments, ${researcher}'s ${year} study revealed that specimens in high-${top.param} conditions exhibited an average 34% increase in metabolic resilience.`;
        distractors = [
          `In ${year}, researchers at ${inst} cataloged hundreds of individual specimens of ${top.unit}.`,
          `Specimens collected during the expedition demonstrated that ${top.unit} possesses evolutionary plasticity.`,
          `${researcher} conducted field research focused on ${top.topic} across diverse habitats.`,
        ];
        explanation = "This choice directly contrasts earlier beliefs ('Although scientists previously believed...') with the new finding ('revealed that specimens in high conditions exhibited 34% increase...').";
        trap = "Selecting a true factual summary from the notes that does not emphasize the contrast requested.";
      } else if (subtopic === "Transitions & Logical Connectors") {
        const transType = (i + attempt) % 4;
        if (transType === 0) {
          passage = `Initial laboratory trials indicated that the synthetic enzyme decomposed within minutes at elevated temperatures. ______ subsequent molecular stabilization using gold nanoparticles allowed the catalyst to maintain operational efficiency for over seventy-two hours.`;
          qText = "Which choice completes the text with the most logical transition?";
          ans = "However,";
          distractors = ["Therefore,", "Furthermore,", "Specifically,"];
          explanation = "'However' signals the contrast between the initial failure and the subsequent success with nanoparticles.";
          trap = "Using cause-and-effect transition 'Therefore'.";
        } else if (transType === 1) {
          passage = `The newly discovered marine invertebrate possesses no specialized lungs or gills for gaseous exchange. ______ it relies entirely on cutaneous respiration, absorbing dissolved oxygen directly through its permeable outer epidermis.`;
          qText = "Which choice completes the text with the most logical transition?";
          ans = "Consequently,";
          distractors = ["Conversely,", "Nonetheless,", "In comparison,"];
          explanation = "'Consequently' correctly introduces the direct result of lacking specialized respiratory organs.";
          trap = "Using contrast transition 'Conversely'.";
        } else if (transType === 2) {
          passage = `Satellite telemetry confirmed that the urban reforestation initiative lowered ground surface temperatures by 3.2°C across the downtown commercial core. ______ municipal air monitoring stations recorded a 14 percent drop in airborne particulate matter over the same two-year span.`;
          qText = "Which choice completes the text with the most logical transition?";
          ans = "Moreover,";
          distractors = ["However,", "Rather,", "Instead,"];
          explanation = "'Moreover' adds an additional reinforcing environmental benefit of the reforestation initiative.";
          trap = "Using contrast transition.";
        } else {
          passage = `Extremophile organisms frequently modify their cell membrane lipids to preserve fluidity under severe pressure. ______ piezophilic bacteria isolated from deep oceanic trenches synthesize high concentrations of polyunsaturated fatty acids to prevent membrane solidification.`;
          qText = "Which choice completes the text with the most logical transition?";
          ans = "For example,";
          distractors = ["Nevertheless,", "Consequently,", "In conclusion,"];
          explanation = "'For example' introduces a specific biological illustration of extremophile membrane adaptation.";
          trap = "Using concluding or contrasting markers.";
        }
      } else if (subtopic === "Boundaries: Run-ons, Semicolons & Colons") {
        const archetype = (i + attempt) % 3;
        if (archetype === 0) {
          passage = `The deep-space research probe gathered telemetry on ${top.topic} for fourteen ______ high-resolution sensors mapped microscopic fluctuations across the region.`;
          qText = "Which choice completes the text so that it conforms to the conventions of Standard English?";
          ans = "months; its";
          distractors = ["months, its", "months its", "months: whose"];
          explanation = "Two independent clauses must be joined with a semicolon; a comma alone creates a comma splice.";
          trap = "Choosing comma splice 'months, its'.";
        } else if (archetype === 1) {
          passage = `Archaeologists excavating the neolithic settlement uncovered artifacts crafted from three distinct ______ obsidian blades from the volcanic highlands, copper pins from coastal deposits, and carved steatite beads from the river valley.`;
          qText = "Which choice completes the text so that it conforms to the conventions of Standard English?";
          ans = "materials:";
          distractors = ["materials;", "materials,", "materials—and"];
          explanation = "A colon introduces an illustrative list after a complete independent clause.";
          trap = "Using semicolon before a list.";
        } else {
          passage = `Pioneering biochemist ${researcher} published a landmark monograph on ${top.topic} ______ a seminal contribution that reshaped twentieth-century molecular theory.`;
          qText = "Which choice completes the text so that it conforms to the conventions of Standard English?";
          ans = "in 2021—";
          distractors = ["in 2021,", "in 2021;", "in 2021:"]
          explanation = "An em-dash appropriately sets off the concluding appositive phrase elaborating on the publication.";
          trap = "Using a semicolon before a dependent noun phrase.";
        }
      } else if (subtopic === "Subject-Verb Agreement") {
        const archetype = (i + attempt) % 2;
        if (archetype === 0) {
          passage = `The comprehensive catalog of rare artifacts, along with several ceremonial obsidian ornaments recovered from the excavation site, ______ currently preserved in climate-controlled archives at ${inst}.`;
          qText = "Which choice completes the text so that it conforms to the conventions of Standard English?";
          ans = "is";
          distractors = ["are", "were", "have been"];
          explanation = "The true grammatical head subject is the singular noun 'catalog'. Intervening prepositional phrases do not change verb number.";
          trap = "Matching verb to intervening plural noun 'ornaments'.";
        } else {
          passage = `Neither the lead researcher nor the laboratory assistants ______ able to account for the unexpected spectral variance detected during the trial.`;
          qText = "Which choice completes the text so that it conforms to the conventions of Standard English?";
          ans = "were";
          distractors = ["was", "is", "has been"];
          explanation = "In 'neither... nor...' constructions, the verb agrees with the closer subject ('assistants', which is plural).";
          trap = "Agreeing with the singular initial subject.";
        }
      } else if (subtopic === "Modifier Placement & Dangling Participles") {
        passage = `______ the research team decided to recalibrate the spectrometers before proceeding with the second phase of the trial.`;
        qText = "Which choice completes the text so that it conforms to the conventions of Standard English?";
        ans = "Having identified subtle calibration anomalies in the initial baseline data,";
        distractors = [
          "Subtle calibration anomalies having been identified in the initial baseline data,",
          "Identified by subtle calibration anomalies in the initial data,",
          "Upon identifying subtle calibration anomalies by the instruments,",
        ];
        explanation = "The introductory participial phrase must logically modify the grammatical subject immediately following the comma ('the research team').";
        trap = "Creating a dangling modifier where anomalies appear to make the decision.";
      } else if (subtopic === "Verb Tense, Aspect & Mood") {
        passage = `By the time ${inst} launched the automated subsea probe in ${year}, oceanographic teams ______ deep-trench currents for over three decades.`;
        qText = "Which choice completes the text so that it conforms to the conventions of Standard English?";
        ans = "had been monitoring";
        distractors = ["have been monitoring", "will be monitoring", "are monitoring"];
        explanation = "The past perfect progressive ('had been monitoring') is required for an ongoing past action occurring prior to another past milestone (the launch).";
        trap = "Using present perfect 'have been monitoring'.";
      } else if (subtopic === "Pronoun-Antecedent Agreement") {
        passage = `Each of the automated monitoring buoys deployed across the Antarctic current transmits ______ sensory telemetry to the central database every six hours.`;
        qText = "Which choice completes the text so that it conforms to the conventions of Standard English?";
        ans = "its";
        distractors = ["their", "one's", "they're"];
        explanation = "'Each' is an indefinite singular pronoun that requires the singular possessive pronoun 'its'.";
        trap = "Using plural pronoun 'their' to refer to singular 'Each'.";
      } else if (subtopic === "Command of Evidence: Quantitative Tables") {
        const val1 = 12 + (i % 6) * 3;
        const val2 = 28 + (i % 4) * 4;
        const val3 = 45 + (i % 5) * 5;
        const val4 = 72 + (i % 3) * 6;
        tableData = {
          headers: ["Sampling Station", "Mean Temperature (°C)", "Dissolved Oxygen (mg/L)", "Biomass Density (g/m²)"],
          rows: [
            ["Station Alpha", 14.2, 8.4, val1],
            ["Station Beta", 18.5, 6.9, val2],
            ["Station Gamma", 22.1, 5.1, val3],
            ["Station Delta", 26.8, 3.8, val4],
          ],
        };
        passage = `A team of marine biologists led by ${researcher} sampled four estuarine stations to evaluate how aquatic biomass varies across varying water temperature regimes.`;
        qText = "Which choice most effectively uses data from the table to support the claim that higher water temperatures were associated with greater overall biomass density despite lower dissolved oxygen levels?";
        ans = `Station Delta recorded the highest water temperature (26.8°C) and lowest dissolved oxygen (3.8 mg/L), yet supported the highest biomass density (${val4} g/m²), while Station Alpha had the lowest temperature (14.2°C) and the lowest biomass density (${val1} g/m²).`;
        distractors = [
          `Station Alpha recorded the highest dissolved oxygen (8.4 mg/L) and therefore achieved the greatest biomass density across all stations.`,
          `All four stations maintained identical biomass density measurements regardless of water temperature.`,
          `Station Beta exhibited higher biomass density and lower temperature than Station Delta.`,
        ];
        explanation = "This choice accurately cites the data trend: the warmest station with lowest oxygen supported the highest biomass, whereas the coldest had the lowest biomass.";
        trap = "Misinterpreting table rows or citing conflicting values.";
      } else {
        // Central Ideas, Textual Evidence, or Inferences
        passage = `Ecological studies conducted by ${researcher} at ${inst} examined the long-term impact of ${top.topic}. Across a six-year monitoring period, ecosystems with high biodiversity exhibited faster recovery following environmental shocks compared to monoculture control sites. The researchers concluded that structural biodiversity acts as a critical biological buffer, mitigating ecological vulnerability.`;
        qText = "Which choice best reflects a central finding or logically supported conclusion from the passage?";
        ans = "Ecosystems characterized by higher structural biodiversity demonstrate enhanced resilience and accelerated recovery following environmental disruptions.";
        distractors = [
          "Monoculture ecosystems are completely immune to environmental disruptions.",
          "Biodiversity increases environmental vulnerability during protracted drought cycles.",
          "Chemical pesticides are the sole determinant of ecosystem stability.",
        ];
        explanation = "The passage concludes that structural biodiversity acts as a biological buffer, enabling faster recovery after environmental shocks.";
        trap = "Selecting an assertion directly contradicted by the text.";
      }

      const sig = (qText + ":::" + (passage ? passage.slice(0, 70) : "")).trim().toLowerCase();
      if (!seenSignatures.has(sig)) {
        seenSignatures.add(sig);
        questions.push(formatQuestionWithDistractors(id, "Reading & Writing", domain, subtopic, difficulty, qText, ans, distractors, explanation, trap, i, passage, tableData));
        break;
      }
      attempt++;
    }
  }
  return questions;
}

let cachedBank: SATQuestion[] | null = null;

export function generateFull10000QuestionBank(): SATQuestion[] {
  if (cachedBank && cachedBank.length === 10000) {
    return cachedBank;
  }

  const seenSignatures = new Set<string>();
  const fullBank: SATQuestion[] = [];

  // 1. Incorporate authentic curated questions (32 items)
  for (const q of INITIAL_QUESTION_BANK) {
    const sig = (q.question + ":::" + (q.passage ? q.passage.slice(0, 70) : "")).trim().toLowerCase();
    seenSignatures.add(sig);
    fullBank.push(q);
  }

  // 2. Generate required questions per blueprint subtopic
  let globalIndex = fullBank.length;

  for (const spec of SUBTOPIC_SPECS) {
    const existingInSubtopic = fullBank.filter((q) => q.subtopic === spec.subtopic).length;
    const needed = Math.max(0, spec.targetCount - existingInSubtopic);

    let generated: SATQuestion[] = [];
    if (spec.section === "Math") {
      if (spec.domain === "Algebra") {
        generated = generateAlgebraQuestions(spec.subtopic, needed, globalIndex, seenSignatures);
      } else if (spec.domain === "Advanced Math") {
        generated = generateAdvancedMathQuestions(spec.subtopic, needed, globalIndex, seenSignatures);
      } else if (spec.domain === "Problem Solving & Data Analysis") {
        generated = generateProblemSolvingQuestions(spec.subtopic, needed, globalIndex, seenSignatures);
      } else {
        generated = generateGeometryQuestions(spec.subtopic, needed, globalIndex, seenSignatures);
      }
    } else {
      generated = generateReadingWritingQuestions(spec.domain, spec.subtopic, needed, globalIndex, seenSignatures);
    }

    fullBank.push(...generated);
    globalIndex += generated.length;
  }

  // Ensure exact total of 10,000 items
  if (fullBank.length < 10000) {
    const deficit = 10000 - fullBank.length;
    const bonus = generateAlgebraQuestions("Linear Equations in One Variable", deficit, globalIndex, seenSignatures);
    fullBank.push(...bonus);
  } else if (fullBank.length > 10000) {
    fullBank.length = 10000;
  }

  cachedBank = fullBank;
  return fullBank;
}

export const generateFull5000QuestionBank = generateFull10000QuestionBank;

export function getCategoryTaxonomy(questions: SATQuestion[]): {
  summaries: CategorySummary[];
  domains: DomainBreakdown[];
  totalQuestions: number;
} {
  const summaryMap = new Map<string, CategorySummary>();
  const domainMap = new Map<string, DomainBreakdown>();

  for (const q of questions) {
    const key = `${q.section}|${q.domain}|${q.subtopic}`;
    if (!summaryMap.has(key)) {
      summaryMap.set(key, {
        section: q.section,
        domain: q.domain,
        subtopic: q.subtopic,
        count: 0,
        easyCount: 0,
        mediumCount: 0,
        hardCount: 0,
      });
    }

    const summary = summaryMap.get(key)!;
    summary.count++;
    if (q.difficulty === "Easy") summary.easyCount++;
    else if (q.difficulty === "Medium") summary.mediumCount++;
    else if (q.difficulty === "Hard") summary.hardCount++;

    const domainKey = `${q.section}|${q.domain}`;
    if (!domainMap.has(domainKey)) {
      domainMap.set(domainKey, {
        domain: q.domain,
        section: q.section,
        totalCount: 0,
        subtopics: [],
      });
    }
    const dBreakdown = domainMap.get(domainKey)!;
    dBreakdown.totalCount++;
  }

  const summaries = Array.from(summaryMap.values());
  const domains = Array.from(domainMap.values());

  for (const domain of domains) {
    const relatedSubtopics = summaries
      .filter((s) => s.section === domain.section && s.domain === domain.domain)
      .map((s) => ({ name: s.subtopic, count: s.count }));
    domain.subtopics = relatedSubtopics;
  }

  return {
    summaries,
    domains,
    totalQuestions: questions.length,
  };
}
