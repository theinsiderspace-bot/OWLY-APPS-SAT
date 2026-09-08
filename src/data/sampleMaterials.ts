export interface PreloadedMaterial {
  id: string;
  title: string;
  category: "Math" | "Reading & Writing" | "Full Comprehensive";
  pageCount: number;
  snippet: string;
  fullText: string;
}

export const PRELOADED_MATERIALS: PreloadedMaterial[] = [
  {
    id: "learnattic-1000-sat",
    title: "1000+ SAT Practice Questions Workbook (Official Extract)",
    category: "Full Comprehensive",
    pageCount: 226,
    snippet: "Complete Digital SAT Practice Workbook covering 500 Math questions (linear, quadratic, statistics, geometry) and 550 Reading & Writing questions.",
    fullText: `1000+ SAT PRACTICE QUESTIONS - Digital SAT Practice Workbook
Reading • Writing • Math - Includes 1000+ SAT-Style Questions with Answer Key

Section 1: Math Practice Questions (500 Questions)
- Linear Equations in One Variable (e.g. 3x + 5 = 20 => x = 5; 4x + 7 = 27 => x = 5; 2(x+5) = 18 => x = 4)
- Systems of Linear Equations (e.g. x + y = 10, x - y = 2 => x = 6; 2x + y = 7, x + y = 5 => x = 2)
- Linear Inequalities (e.g. 3x + 5 > 14 => x > 3; 4x - 7 >= 9 => x >= 4)
- Linear Slopes and Intercepts (e.g. y = 3x + 5 slope = 3, y-intercept = 5; slope between (1,3) and (3,7) = 2)
- Word Problems & Linear Modeling (e.g. Taxi flat fee $3 + $2/mile; gym membership fee $10 + $5/visit)
- Quadratic Equations and Factoring (e.g. x^2 - 5x + 6 = 0 => (x-2)(x-3)=0 => x=2,3; x^2 - 11x + 24 = 0 => x=3,8)
- Polynomial Operations (e.g. (2x+3)(x+4) = 2x^2 + 11x + 12; (3x^2+2x) + (4x^2-x) = 7x^2 + x)
- Exponents, Roots and Functions (e.g. 2^4 = 16, sqrt(9x^2) = 3x, f(x)=2x+3 => f(2)=7; f(x)=x+5 => f(x+1)=x+6)
- Ratios, Proportions & Percentages (e.g. Boys to girls 3:5 with 24 students => 9 boys; 20% discount on $50 = $10)
- Statistics and Data Analysis (Mean of 4,6,8 = 6; Median of 4,6,8,10,12 = 8; Range of 4,7,10 = 6)
- Basic Probability (Jar with 2 blue, 3 red, 5 green => P(blue) = 2/10 = 1/5; Single die roll P(even) = 1/2)

Section 2: Digital SAT Reading Mastery (350 Questions)
- Passages on Urban Planning & Transit: Public transportation reduces congestion and pollution but requires consistent funding.
- Scientific Inquiries: Glaciers preserve atmospheric history; Photosynthesis converts CO2 and sunlight into glucose; Ocean currents regulate planetary heat.
- Paired Passages: Urban parks (wildlife refuges vs maintenance/accessibility constraints); Electric vehicles (zero tailpipe emissions vs grid fossil reliance & mineral mining); Space exploration (scientific innovations vs terrestrial healthcare/climate funding trade-offs).
- Vocabulary in Context: Meticulous (detailed and precise), Mitigate (reduce/lessen), Candid (straightforward/honest), Trepidation (fear/apprehension), Arduous (difficult and strenuous).

Section 3: SAT Writing & Grammar (200 Questions)
- Punctuation & Independent Clauses: Semicolons join two complete clauses without conjunctions. Colons introduce explanatory lists.
- Transitions & Conjunctive Adverbs: "Therefore" for logical results; "However" for contrasts; "Moreover" for additions.
- Subject-Verb Agreement: Intervening prepositional phrases do not change subject number ("The committee, along with volunteers, is planning...").
- Modifier Placement: Introductory participles must modify the logical subject ("Walking down the street, I noticed the flowers...").
- Concision & Redundancy: Eliminate bloated phrasing ("due to the fact that" => "because"; "returned back" => "returned").`,
  },
  {
    id: "sat-math-algebra-cheat-sheet",
    title: "High-Yield SAT Math: Algebra, Geometry & Data Cheat Sheet",
    category: "Math",
    pageCount: 18,
    snippet: "Core formulas, discriminant rules, quadratic vertex form, system elimination shortcuts, circle equations, and trigonometric identities.",
    fullText: `HIGH YIELD DIGITAL SAT MATH CHEAT SHEET
1. Heart of Algebra & Systems:
- Slope-intercept: y = mx + b. Standard form: Ax + By = C (slope = -A/B, y-int = C/B).
- Point-slope: y - y1 = m(x - x1).
- Perpendicular slopes: m1 * m2 = -1 (negative reciprocal).
- System of equations solutions:
  * Exactly 1 solution: slopes differ (m1 != m2).
  * No solution: parallel lines (m1 = m2, b1 != b2).
  * Infinitely many solutions: identical lines (m1 = m2, b1 = b2).

2. Advanced Math & Quadratics:
- Quadratic formula: x = (-b ± √(b² - 4ac)) / 2a.
- Discriminant D = b² - 4ac:
  * D > 0: 2 distinct real solutions.
  * D = 0: 1 real solution (tangent/perfect square).
  * D < 0: 0 real solutions (2 complex).
- Vertex of parabola y = ax² + bx + c: x_v = -b / (2a), y_v = f(x_v).
- Sum of roots = -b/a. Product of roots = c/a.
- Exponent rules: x^a * x^b = x^(a+b); (x^a)^b = x^(ab); x^(a/b) = b-th root of x^a.

3. Problem Solving & Data:
- Percent change: (New - Old) / Old * 100%.
- Weighted Average: Sum(value * weight) / Sum(weights).
- Margin of error & confidence intervals: Sample must be randomly selected from population to generalize.
- Scatterplots & lines of best fit: Residual = Actual - Predicted.

4. Geometry & Trigonometry:
- Circle Equation: (x - h)² + (y - k)² = r² (Center (h, k), radius r).
- Arc length: s = r * θ (in radians) or (θ/360) * 2πr (in degrees).
- Sector area: (θ/360) * πr².
- SOH CAH TOA: sin(θ) = cos(90° - θ).`,
  },
  {
    id: "sat-rw-grammar-playbook",
    title: "Digital SAT Reading & Writing Grammar Playbook",
    category: "Reading & Writing",
    pageCount: 24,
    snippet: "Mastery guide for Standard English Conventions, Rhetorical synthesis, command of evidence, transitions, and sentence structure.",
    fullText: `DIGITAL SAT READING & WRITING STRATEGY PLAYBOOK
1. Punctuation Rules (Stop, Half-Stop, Go):
- Period (.) and Semicolon (;) require COMPLETE sentence on both sides: [IC] ; [IC].
- Comma + FANBOYS (for, and, nor, but, or, yet, so) connects two independent clauses: [IC], and [IC].
- Colon (:) and Single Dash (-) require a COMPLETE sentence before them. What follows can be a single word, list, or clause explaining the first part.
- Comma Splice ERROR: [IC], [IC] is ALWAYS wrong without a FANBOYS conjunction.

2. Subject-Verb Agreement:
- Locate the true subject by crossing out prepositional phrases: "The collection of vintage coins (is/are)" -> "The collection is".
- Indefinite pronouns like each, everyone, somebody, neither, either are SINGULAR.
- "Neither X nor Y" -> verb agrees with Y (the closest noun).

3. Pronouns:
- Check for pronoun ambiguity and singular/plural match.
- "Its" = possessive. "It's" = it is. "Its'" = does NOT exist.
- "Their" = plural possessive. "They're" = they are. "There" = location.

4. Modifier Placement:
- Any descriptive phrase at the beginning of a sentence MUST be followed immediately by the noun it describes:
  * "Tired and hungry, the pizza was eaten by John." -> WRONG (the pizza wasn't tired).
  * "Tired and hungry, John ate the pizza." -> CORRECT.

5. Rhetorical Synthesis (Bullet-Point Notes Questions):
- Read the SPECIFIC PROMPT GOAL first before reading the bullets.
- Common prompt goals: "emphasize a difference", "introduce the subject to a new audience", "summarize the findings".
- The correct choice MUST directly fulfill that exact requirement.`,
  },
  {
    id: "mcgraw-hill-sat-2023-complete",
    title: "McGraw-Hill SAT 2023: Full Comprehensive Coursebook & Strategy Guide",
    category: "Full Comprehensive",
    pageCount: 719,
    snippet: "Complete section-organized training curriculum from Christopher Black & Mark Anestis covering 16 Reading Rhetorical Devices, 20 Vocabulary Themes, 18 Grammar Lessons, Heart of Algebra, Data Analysis, Advanced Math, Geometry & Trigonometry, and Practice Tests.",
    fullText: `McGRAW-HILL SAT 2023 - COMPLETE COMPREHENSIVE TRAINING COURSE
By Christopher Black, MA & Mark Anestis, MA (College Hill Coaching)

SECTION 1: TEST ARCHITECTURE, SCORING & DAILY STUDY PROTOCOL (CHAPTER 1)
- What the SAT Tests: Analytical reading, Standard English conventions, and mathematical problem-solving.
- Rights-Only Scoring: Raw score = total correct answers. Zero penalty for incorrect guesses. Scale 400-1600 (Math 200-800, Reading & Writing 200-800).
- Superscoring Advantage: Colleges cherry-pick peak Math and peak Reading & Writing subscores from multiple test dates.
- Landscape™ Context Score: High school and neighborhood metrics providing admissions officers with socioeconomic context.
- Daily 30-40 Minute Study Protocol: Set a discrete agenda for every session. Master 6 new roots and complete half a chapter.
- 30-Second Check: Log the single most critical insight at the end of each session.
- Learn It As If Teaching: Explain the concept out loud as if teaching an 8th-grade classroom.
- Sleep Consolidation: 8 hours of sleep required; thinking about a challenging problem before sleep initiates subconscious consolidation.
- Visual Mnemonics: Use bizarre, colorful imagery (e.g., 'polemic' -> political argument with a microphone on a pole).
- Week-Before Protocol: Healthy diet, sleep consistency, visualization of calm focus, staging photo ID, admissions ticket, and calculator.

SECTION 2: SAT VOCABULARY - THE LANGUAGE OF IDEAS (CHAPTER 3)
- 20 Categorized Semantic Themes:
  1. Language of Ideas and Learning (abstract, anthropology, comprehensive, construe, discerning, discriminating, disseminate, erudite, indoctrinate, insular, orthodox, pedantic, peruse, postulate, provincial, revelation)
  2. Language of Argument and Persuasion (advocate, apologist, appease, bolster, buttress, cajole, circumlocutory, circumscribe, cohesive, conjecture, consensus, contentious, credulous, criteria, cursory, debunk, delineate, dispel, disputatious, elucidate, enticement, enumerate, equivocate, exhortation, exonerate, fallacious, harangue, incongruous, induce, inexorable, infer, insinuate, intransigent, irresolute, litigious, obstinate, partisan, placate, precedent, prevalent, propensity, provocative, pugnacious, qualify, rebut, recalcitrant, refute, resolute, rhetoric, specious, speculation, steadfast, strident, subjective, substantiate, tenuous, tirade, viable, vindicate, zealot)
  3. Language of Dissent and Rebellion (adversary, antipathy, audacious, averse, belligerent, berate, cantankerous, circumspect, clamor, condescend, encroach, estranged, evade, flout, heresy, iconoclast, indignant, instigate, insurgent, malign, maverick, misanthrope, rancor, rebuke, renounce, reprehensible, reprove, revoke, subvert, supplant, vilify, vindictive)
  4. Language of Power and Submission (acquiesce, capitulate, coerce, concession, contrite, deference, demagogue, despot, dictatorial, diffident, domineering, eminent, enthralling, exploitative, hierarchy, imperious, impervious, indelible, insolent, insubordination, mandate, obtrusive, pacify, pervasive, potent, predominant, propagate, recluse, relinquish, ruthless, sanction, sequester, servile, subjugate, tenacious, tractable, unremitting, usurper)
  5. Language of Language and Literature (allude, analogy, anecdote, anthology, bombastic, coherent, colloquial, derivative, eclectic, eloquent, epilogue, evocative, irony, laconic, lament, loquacious, melodrama, platitude, poignant, satiric, verbose)
  6. Language of Judgment (ambivalent, arbitrary, arbitrate, carping, censor, censure, clemency, conformist, contempt, cynic, demeaning, denounce, depraved, derision, disdain, dogmatic, extol, futile, inane, irreverent, mundane, punitive, repudiate, skeptical)
  7. Language of Extremism and Exaggeration (embellish, eradicate, hyperbole, indulgent, superfluous, unstinting)
  8. Language of Care and Restraint (ameliorate, assuage, curtail, equanimity, fastidious, impassive, meticulous, nonchalant, parsimony, placid, refurbish, rejuvenate, reticent, scrupulous, sedate, stoic, succinct, temperance, vigilant)
  9. Language of Freedom (anarchist, capricious, emancipate, extemporaneous, extricate, impetuous, mercurial, unfettered)
  10. Language of Change and Force (catalyst, disperse, ephemeral, impetus, intermittent, mutable, ossify, precipitous, synthesis, transient, volatile)
  11. Language of Dullness and Stasis (banal, conventional, homogeneous, indigenous, insipid, languish, prosaic, protracted, stagnant)
  12. Language of Truth and Beauty (aesthetic, candid, fallible, incontrovertible, introspective, rectify, sublime)
  13. Language of Deceit and Confusion (anachronism, belie, chicanery, circuitous, confound, convoluted, digress, disingenuous, dubious, duplicity, guile, inept, machination, perjure, spurious, subterfuge, surreptitious, treacherous, unscrupulous, vex)
  14. Language of Creativity and Productivity (assiduous, efficacy, expedite, facilitate, flourish, lineage, prodigious, profuse, progeny, proliferate, prolific, vigor)
  15. Language of Mystery and Discovery (ambiguous, anomaly, diversion, divulge, elusive, empirical, enigma, idiosyncrasy, inscrutable, intrepid, nebulous, paradox)
  16. Language of Harm, Deficit, and Decline (adverse, archaic, bane, dearth, debilitating, deleterious, enervate, exacerbate, insidious, malevolence, obsolete, regress, vestige, virulent)
  17. Language of Kindness and Benefit (affable, alleviate, altruistic, amicable, auspicious, benefactor, beneficiary, benevolent, benign, complement, conciliatory, decorum, empathy, eulogy, euphemism, innocuous, mitigate, mollify, obliging, propriety, reciprocate, refinement, solicitous, symbiosis, tactful, utility)
  18. Language of Wisdom and Skill (adroit, astute, discernment, discretion, ethics, exacting, exemplar, lithe, objective, pragmatic, proficient, sagacious, valor)
  19. Language of Capital and Wealth (avarice, bourgeois, decadent, exorbitant, frugal, indigent, lavish, lucrative, mercenary, opulent, ostentatious, prodigal, remuneration, squander)
  20. Language of Passion and Emotion (abash, alacrity, apathy, apprehensive, ardor, callous, catharsis, complacent, ebullient, effusive, fervent, forlorn, grudging, indifferent, inhibited, palpable, qualitative, resigned, vehement)
- Power Roots and Affixes: 100+ root families including [tract], [anthro], [prehens], [stru], [cern], [semin], [rud], [doc/dox], [insula], [ortho], [voc/vok], [vers/vert], [path], [bell], [eikon], [mal], [quies], [capit], [arc], [trit], [dem], [poten], [fid], [domit], [hiero], [del], [man], [trus/trud], [pax], [clud/clus], [linqu/lict], [sanct], [jug], [ten/tain], [flor], [fus/fund], [vol], [sed/sid], [cad/cas], [orb], [luc/lum], [apt/ept], [jur/jus], [rap/rav], [fac/fic], [bio], [ethos], [burg], [ard], [ferv], [palp], [vehe].

SECTION 3: THE SAT READING TEST (CHAPTER 4)
- Core Analytical Reading Rules: Extract key facts, identify purpose/central idea/structure/tone, supply literal and quantitative evidence.
- The Three Key Questions:
  * Purpose: Expository (objective information, guiding question), Rhetorical (point of view, central thesis), Narrative (character struggle, transformative arc).
  * Central Idea: Identify early, verify in the final paragraph.
  * Functional Structure: Map paragraph roles (Misconception -> Controlled Experiment -> Refutation -> Implication).
- The Three Secondary Questions:
  * How does the author use language and tone?
  * How does the author use literal and quantitative evidence?
  * How does the author use rhetorical devices?
- 16 Basic Stylistic & Rhetorical Devices: Ad hominem, allusion, analogy, anecdote, aphorism, appeal to authority, appeal to emotion, characterization, euphemism, hyperbole, irony, metaphor, rhetorical parallelism, personification, simile, understatement.
- Preemptive Attack Strategy: Formulate your own answer before reading choices; avoid keyword traps.
- Playing Devil's Advocate: Read with critical awareness of assumptions, counterarguments, and potential weaknesses.
- Paired Passages 3-Step Strategy: Read P1 and answer P1 questions -> Read P2 and answer P2 questions -> Answer synthesis questions on agreement, disagreement, and tone.

SECTION 4: THE SAT WRITING AND LANGUAGE TEST (CHAPTER 5)
- 18 Core Lessons:
  1. Question Types: Clarity, Grammar/Usage, Coherence/Development, Style.
  2. Parsing Sentences: Independent vs. Dependent Clauses.
  3. The Law of Trimming: Strip nonessential prepositional phrases, appositives, and modifiers to isolate the core subject-verb.
  4. Verb Agreement: Number matching, tricky Latin plurals (criteria, phenomena, media, data), inverted syntax, dummy subjects.
  5. Developing & Coordinating Ideas: Semicolons between independent clauses; colons after independent clauses before specifiers/explanations; comma splices are forbidden.
  6. Transitions & References: Extend, illustrate, contrast, compare, cause-and-effect transitions; unambiguous pronoun referents.
  7. Law of Parallelism: Parallel lists, correlative conjunctions (neither...nor, rather...than, not so much...as, prefer...to), gerunds vs infinitives.
  8. Coordinating Modifiers: Participial phrases must share subject with main clause; avoid dangling participles; Law of Proximity for appositives; consequential participles (having + past participle).
  9. Illogical Modifiers: Adjectives vs adverbs (-ly), comparative forms (-er vs more).
  10. Logical & Quantitative Comparisons: Like-to-like comparisons; less/much/amount (uncountable) vs fewer/many/number (countable).
  11. Pronoun Agreement: Singular collectives in American English; who (person), where (place), when (time), whereby (by which), why (reason).
  12. Pronoun Case: Subjective (I, he, she, we, they) vs. Objective (me, him, her, us, them) vs. Reflexive (myself, himself) vs. Possessive (its, their, your).
  13. Verb Tense & Aspect: Habitual, progressive, and consequential (status-as-consequence); historical past vs timeless present; currency of art/ideas.
  14. Diction & Redundancy: Law of Parsimony (shorter is better); sound-alike mix-ups (accept/except, adapt/adopt/adept, affect/effect, allude/elude, allusion/illusion, cite/site/sight, compliment/complement, council/counsel, discrete/discreet, elicit/illicit, eminent/imminent, flaunt/flout, imply/infer, precede/proceed, principal/principle, reticent/reluctant).
  15. Idiomatic Expression & Prepositional Idioms: agree with/to/on/about, angry with/about, concerned with/about, wait for/on.
  16. Active vs. Passive Voice: Prioritize active voice for concision; use passive only when emphasizing the receiver of action.
  17. Grammatical Mood: Indicative (facts), Imperative (commands/infinitive after demand/suggest that), Subjunctive (counterfactuals: if I were, had I known, would have been).
  18. Punctuation: Interrupter symmetry (comma...comma or dash...dash), apostrophe rules for singular (-'s) and plural (-s') possessives, comma restraint.

SECTION 5: THE SAT MATH TEST - THE HEART OF ALGEBRA (CHAPTER 6)
- 13 Lessons:
  1. Word Problems: 4-Step Framework (Identify, Represent, Translate, Solve).
  2. Order of Operations: PG-ER-MD-AS; Laws of Arithmetic (Commutative, Associative, Distributive); Avoid Overdistributing (3(2*5) != (3*2)*(3*5)).
  3. Simplifying Expressions: Law of Substitution; Percent increase = *(1 + a/100); Percent decrease = *(1 - a/100); Operations in terms of inverses.
  4. Conversions & Dimensional Analysis: Unit cancellation using equivalence fractions.
  5. Linear Equations & Graphs: Slope-intercept (y = mx + b), Standard form (Ax + By = C, slope = -A/B), Point-slope (y - y1 = m(x - x1)), Intercept form (x/a + y/b = 1).
  6. Laws of Equality: 4 fundamental operations; non-zero division; square root duality (±).
  7. Analyzing Linear Graphs: Slopes as unit rates of change; Parallel lines (m1 = m2); Perpendicular lines (m1 * m2 = -1, opposite reciprocals).
  8. Inequalities & Absolute Values as Distance: |a - b| = distance on number line between a and b; tolerance inequalities |x - center| <= tolerance.
  9. Laws of Inequality: Flip inequality when multiplying/dividing by negative numbers; Sandwich inequalities.
  10. Graphing Inequalities: Boundary lines and test points.
  11. Linear Systems: Geometric interpretation as intersection points (1 solution, no solution/parallel, infinitely many/coincident).
  12. Systems by Substitution: Isolating a variable and substituting.
  13. Systems by Linear Combination: Adding or subtracting equations to eliminate variables or evaluate expressions directly (e.g. 3x-y=20, 2x+4y=7 => x-5y=13).

SECTION 6: PROBLEM SOLVING AND DATA ANALYSIS (CHAPTER 7)
- 16 Lessons:
  1. Averages & Weighted Averages: Sum = Average * n; Combined Average = (n1*avg1 + n2*avg2)/(n1 + n2).
  2. Medians & Modes: Median position = (n+1)/2 in sorted data; Mode = most frequent value.
  3. Data Spread: Mean Absolute Deviation (MAD), Range = Max - Min, Standard Deviation as measure of dispersion.
  4. Direct & Inverse Variations: Direct (y = kx, line through origin); Inverse (xy = k, hyperbola).
  5. Rate Problems & The Rate Pie: Distance = Rate * Time; Rate conversions.
  6. Ratios & Probabilities: Part-to-Whole vs Part-to-Part ratios; Probabilities as ratios.
  7. Percentages: Translation key (is = '=', of = '*', what = 'x', percent = '/100'); Commutativity of % (x% of y = y% of x).
  8. Percent Change Formula: % Change = ((Final - Initial)/Initial) * 100%; Multi-stage compounding.
  9. Proportions & Scaling: Law of Cross-Multiplication (ad = bc); Law of Cross-Swapping.
  10. Tables & Venn Diagrams: Disjoint tables vs Overlapping Venn sets (Total = A + B - Both + Neither).
  11. Conditional Probabilities: P(A | B) = Count(A and B) / Count(B); Restricted denominators.
  12. Analyzing Relations with Tables: Rate of change and pattern extrapolation.
  13. Scatterplots & Lines of Best Fit: Slope = unit rate of increase/decrease.
  14. Nonlinear Relationships: Quadratic and exponential curves; intersection points.
  15. Drawing Inferences from Graphs: Average rate of change (secant line) vs Instantaneous rate of change (tangent line).
  16. Pie Graphs Formula: Sector Angle = (Part / Whole) * 360°.

SECTION 7: PASSPORT TO ADVANCED MATH (CHAPTER 8)
- 14 Lessons:
  1. Functions: Input-output mappings, domain, and range.
  2. Representing Functions: Tables, Equations, Graphs (TEG).
  3. Compositions & Transformations: f(g(x)); Horizontal shift f(x+k) [left] and f(x-k) [right]; Vertical shift f(x)+k; Vertical stretch/shrink k*f(x); Reflection -f(x).
  4. Factoring Quadratics: Common factors; Difference of squares ((ax)^2 - b^2 = (ax+b)(ax-b)); Product-Sum Method (ac = product, b = sum).
  5. Solving Quadratics: Zero Product Property; Factor Theorem (root r => factor (x - r)); Quadratic Formula x = (-b ± √(b²-4ac))/(2a); Completing the Square; Sum of roots = -b/a; Product of roots = c/a.
  6. Parabola Graphs: Vertex at (-b/2a, c - b²/4a); Vertex form y = a(x - h)² + k; Axis of symmetry x = (r1 + r2)/2.
  7. Higher Order Polynomials: Polynomial multiplication; Factoring by grouping.
  8. Higher Order Systems: Intersections of quadratics with lines or other curves.
  9. 11 Laws of Exponentials: Negative powers, product rule, quotient rule, power of a power, fractional exponents x^(m/n) = n-th root of x^m, base matching.
  10. Laws of Radicals & Perfect Squares: Simplification, estimating roots, conjugate multiplication.
  11. Solving Exponential & Radical Equations: Extraneous roots verification.
  12. Rational Expressions: Adding/subtracting with common denominators; Multiplying straight across.
  13. Simplifying Rational Expressions: Complex fractions; Polynomial long division and remainder theorem.
  14. Solving Rational Equations: Multiplying both sides by the least common denominator.

SECTION 8: ADDITIONAL TOPICS & GEOMETRY (CHAPTER 9)
- 12 Lessons:
  1. Angles & Parallel Lines: Intersecting lines; Parallel lines transversal ('ZCUF' angles).
  2. Triangles: Sum of angles = 180°; Side-Angle Theorem; Isosceles Triangle Theorem; Exterior Angle Theorem (ext = sum of 2 remote interior); Triangle Inequality (|a-b| < c < a+b).
  3. Working in the xy-Plane: Area as grid unit squares; Dropping perpendiculars; Midpoint formula ((x1+x2)/2, (y1+y2)/2).
  4. Pythagorean Theorem & Special Right Triangles: a² + b² = c²; 45°-45°-90° (s, s, s√2); 30°-60°-90° (x, x√3, 2x); Triples 3-4-5, 5-12-13; 3-D Pythagorean Theorem (d² = a² + b² + c²).
  5. Circles: Equation (x - h)² + (y - k)² = r²; Circumference C = 2πr; Area A = πr²; Tangent line is perpendicular to radius at point of tangency (90°).
  6. Radians, Chords, Arcs & Sectors: 180° = π radians; Perpendicular from center bisects chord; Arc length/2πr = θ/360°; Sector area/πr² = θ/360°.
  7. Areas & Volumes: Formulas for prisms, cylinders, spheres, cones, pyramids; Strange Area Rule (bounding box minus right triangles).
  8. Similarity & AA Theorem: Similar polygons side ratio a:b => Perimeter ratio a:b, Area ratio a²:b², Volume ratio a³:b³.
  9. Basic Trigonometry: SOH CAH TOA (sin = opp/hyp, cos = adj/hyp, tan = opp/adj); Unit circle definitions (cos = x, sin = y, tan = y/x).
  10. Pythagorean Trigonometric Identity: sin²(θ) + cos²(θ) = 1.
  11. Cofunction Identities: sin(x) = cos(π/2 - x) and cos(x) = sin(π/2 - x).
  12. Imaginary & Complex Numbers: i = √-1; Powers of i cyclical pattern (i^1=i, i^2=-1, i^3=-i, i^4=1, remainder mod 4); Complex conjugate multiplication (a+bi)(a-bi) = a² + b²; Absolute value / Modulus |a+bi| = √(a² + b²).

SECTION 9: DIAGNOSTIC & PRACTICE TESTS MASTERY (CHAPTERS 2 & 10)
- Diagnostic SAT: Complete 4-section baseline assessment with score conversion table and detailed explanations for all 154 questions.
- Practice Tests 1, 2, 3, 4: Heavyweight SAT practice exams with section-by-section analysis, question-by-question trap breakdowns, and strategic test-day diagnostics.`,
  },
];

