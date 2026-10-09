/* =========================================================================
   MATH DATA & PROCEDURAL QUESTION GENERATOR
   Procedurally generates unbounded non-repeating Grade 8 questions on
   Simplifying Algebraic Expressions (collect like terms, expand brackets,
   negatives, x², perimeter, evaluate, factorise).
   ========================================================================= */
import {
  MINUS,
  pAdd, pMul, pConst, pTerm, pFmt, pEval, pEqual, pScale,
  termsFmt, termsToPoly
} from './algebra.js';

export const WESTERN_NAMES = [
  "Leo", "Emma", "Alex", "Oliver", "Sophia", "Jack", "Maya", "Lucas",
  "Ethan", "Chloe", "Noah", "Liam", "Harper", "Ava", "Mason", "Ella",
  "James", "Mia", "Logan", "Charlotte"
];

/* difficulty: 1 easy → 4 hard. `types` = archetypes this world draws from */
export const PRACTICE_WORLDS = [
  { id: 0, name: "Fruit Stand Fiesta", icon: "🍎", range: "Q1–10", difficulty: 1, types: ['identify', 'coef', 'collect1'] },
  { id: 1, name: "Pencil Palace", icon: "✏️", range: "Q11–20", difficulty: 1, types: ['collect1', 'collect2', 'identify'] },
  { id: 2, name: "Robot Workshop", icon: "🤖", range: "Q21–30", difficulty: 2, types: ['collect2', 'collectNeg', 'coef'] },
  { id: 3, name: "Rocket Launchpad", icon: "🚀", range: "Q31–40", difficulty: 2, types: ['expand', 'collectNeg', 'expand'] },
  { id: 4, name: "Bakery Brackets", icon: "🧁", range: "Q41–50", difficulty: 3, types: ['expand', 'expandNeg', 'expandConst'] },
  { id: 5, name: "Treasure Cove", icon: "🏴‍☠️", range: "Q51–60", difficulty: 3, types: ['expandCollect', 'expandNeg', 'expandConst'] },
  { id: 6, name: "Garden Fence Grove", icon: "🌳", range: "Q61–70", difficulty: 3, types: ['perimeter', 'expandCollect', 'expand'] },
  { id: 7, name: "Crystal Cavern", icon: "💎", range: "Q71–80", difficulty: 4, types: ['quad', 'expandCollect', 'subBrackets'] },
  { id: 8, name: "Space Station Hub", icon: "🛰️", range: "Q81–90", difficulty: 4, types: ['subBrackets', 'evaluate', 'quad', 'factor'] },
  { id: 9, name: "Champion's Arena", icon: "🏆", range: "Q91–100", difficulty: 4, types: ['subBrackets', 'expandCollect', 'quad', 'evaluate', 'factor', 'perimeter', 'expandNeg'] }
];

/* ---------- small helpers ---------- */
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randNZ = (min, max) => {
  let v = 0;
  while (v === 0) v = randInt(min, max);
  return v;
};
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const lin = (a, b, v = 'x') => pAdd(pTerm(a, v), pConst(b)); // a·v + b
const T = (c, m = '1') => ({ c, m });

/** Turn a list of {poly | label} wrong answers into 3 unique wrong labels (never equal to the correct one) */
function buildOptions(correctLabel, wrongs, fallback) {
  const seen = new Set([correctLabel]);
  const wrongLabels = [];
  for (const w of wrongs) {
    const label = typeof w === 'string' ? w : pFmt(w);
    if (!seen.has(label)) {
      seen.add(label);
      wrongLabels.push(label);
    }
    if (wrongLabels.length === 3) break;
  }
  let guard = 0;
  while (wrongLabels.length < 3 && guard++ < 80) {
    const label = fallback();
    if (label != null && !seen.has(label)) {
      seen.add(label);
      wrongLabels.push(label);
    }
  }
  const options = shuffle([correctLabel, ...wrongLabels.slice(0, 3)]);
  return { options, correctIndex: options.indexOf(correctLabel) };
}

/** random "plausible slip" of a polynomial, used to top up distractors */
function mutatePoly(p) {
  const keys = Object.keys(p);
  const out = { ...p };
  const k = pick(keys.length ? keys : ['1']);
  const roll = Math.random();
  if (roll < 0.35) out[k] = (out[k] || 0) + pick([-2, -1, 1, 2]);
  else if (roll < 0.6) out[k] = -(out[k] || 1);
  else if (roll < 0.8) out['1'] = (out['1'] || 0) + pick([-3, -1, 1, 3]);
  else out[k] = (out[k] || 1) * 2;
  for (const key in out) if (out[key] === 0) delete out[key];
  return out;
}
const polyFallback = correct => () => {
  const m = mutatePoly(correct);
  return pEqual(m, correct) || !Object.keys(m).length ? null : pFmt(m);
};

/* ---------- 'identify' & 'coef' & others: returns a question body ---------- */
function qIdentify() {
  const v = pick(['x', 'y', 'a', 'n']);
  const w = pick(['x', 'y', 'a', 'n'].filter(l => l !== v));
  const a = randInt(2, 9);
  const b = randInt(2, 9);
  const correct = `${a}${v} and ${b}${v}`;
  const wrongs = [
    `${a}${v} and ${b}${w}`,
    `${a}${v} and ${b}${v}\u00b2`,
    `${a}${v} and ${b}`
  ];
  const { options, correctIndex } = buildOptions(correct, wrongs, () => `${a}${v}${w} and ${b}${v}`);
  return {
    rule: 'LIKE TERMS RULE',
    prompt: `Which pair of terms are LIKE terms?`,
    options,
    correctIndex,
    diagramData: { mode: 'legend' },
    explanation: `Like terms have the same letter(s) with the same power. ${correct} both use ${v}, so they are like terms.`
  };
}

function qCoef() {
  const asks = pick(['coefficient', 'constant']);
  const a = randInt(2, 9);
  const b = randNZ(-9, 9);
  const c = randNZ(-9, 9);
  const terms = [T(a, 'x'), T(b, 'y'), T(c)];
  const expr = termsFmt(terms);
  if (asks === 'coefficient') {
    const correct = b < 0 ? `${MINUS}${Math.abs(b)}` : String(b);
    const wrongs = [b < 0 ? String(Math.abs(b)) : `${MINUS}${b}`, String(a), c < 0 ? `${MINUS}${Math.abs(c)}` : String(c), 'y'];
    const { options, correctIndex } = buildOptions(correct, wrongs, () => String(randInt(-9, 9)));
    return {
      rule: 'TERMS RULE',
      prompt: `In ${expr}, what is the coefficient of y?`,
      options, correctIndex,
      diagramData: { mode: 'chips', terms },
      explanation: `The coefficient is the number multiplying y, including its sign. In ${expr} it is ${correct}.`
    };
  }
  const correct = c < 0 ? `${MINUS}${Math.abs(c)}` : String(c);
  const wrongs = [c < 0 ? String(Math.abs(c)) : `${MINUS}${c}`, String(a), String(b < 0 ? `${MINUS}${Math.abs(b)}` : b), '0'];
  const { options, correctIndex } = buildOptions(correct, wrongs, () => String(randInt(-9, 9)));
  return {
    rule: 'TERMS RULE',
    prompt: `In ${expr}, what is the constant term?`,
    options, correctIndex,
    diagramData: { mode: 'chips', terms },
    explanation: `The constant term has no letter. In ${expr} it is ${correct} (keep its sign).`
  };
}

function qCollect1() {
  const v = pick(['x', 'y', 'a', 'n', 'p']);
  const a = randInt(1, 9), b = randInt(1, 9), c = randInt(1, 9), d = randInt(1, 9);
  const terms = shuffle([T(a, v), T(b, v), T(c), T(d)]);
  const correct = pAdd(lin(a + b, c + d, v), {});
  const wrongs = [
    pTerm(a + b + c + d, v),
    lin(a + b, c, v),
    pAdd(pTerm(a + b, `${v}^2`), pConst(c + d)),
    pConst(a + b + c + d)
  ];
  const label = pFmt(correct);
  const { options, correctIndex } = buildOptions(label, wrongs, polyFallback(correct));
  return {
    rule: 'LIKE TERMS RULE',
    prompt: `Simplify: ${termsFmt(terms)}`,
    options, correctIndex,
    diagramData: { mode: 'chips', terms },
    explanation: `${a}${v} + ${b}${v} = ${a + b}${v} and ${c} + ${d} = ${c + d}, so the answer is ${label}.`
  };
}

function qCollect2() {
  const a = randInt(1, 8), b = randInt(1, 8), c = randInt(1, 8), d = randInt(1, 8);
  const terms = shuffle([T(a, 'x'), T(b, 'y'), T(c, 'x'), T(d, 'y')]);
  const correct = pAdd(pTerm(a + c, 'x'), pTerm(b + d, 'y'));
  const label = pFmt(correct);
  const wrongs = [
    pTerm(a + b + c + d, 'xy'),
    pAdd(pTerm(a + d, 'x'), pTerm(b + c, 'y')),
    pTerm(a + b + c + d, 'x'),
    pAdd(pTerm(a * c, 'x'), pTerm(b * d, 'y'))
  ];
  const { options, correctIndex } = buildOptions(label, wrongs, polyFallback(correct));
  return {
    rule: 'LIKE TERMS RULE',
    prompt: `Simplify: ${termsFmt(terms)}`,
    options, correctIndex,
    diagramData: { mode: 'chips', terms },
    explanation: `Group x with x and y with y: (${a}x + ${c}x) + (${b}y + ${d}y) = ${label}.`
  };
}

function qCollectNeg() {
  let a, c, b, d, e, f;
  do { a = randInt(2, 9); c = randInt(1, 9); } while (a === c);
  do { b = randInt(1, 9); d = randInt(2, 9); } while (b === d);
  do { e = randInt(1, 9); f = randInt(1, 9); } while (e === f);
  const terms = shuffle([T(a, 'x'), T(-b, 'y'), T(-c, 'x'), T(d, 'y'), T(e), T(-f)]);
  const correct = termsToPoly(terms);
  const label = pFmt(correct);
  const wrongs = [
    pAdd(pAdd(pTerm(a + c, 'x'), pTerm(b + d, 'y')), pConst(e - f)),
    pAdd(pAdd(pTerm(a - c, 'x'), pTerm(b - d, 'y')), pConst(e - f)),
    pAdd(pAdd(pTerm(a - c, 'x'), pTerm(d - b, 'y')), pConst(e + f)),
    pAdd(pAdd(pTerm(a + c, 'x'), pTerm(d - b, 'y')), pConst(e - f))
  ];
  const { options, correctIndex } = buildOptions(label, wrongs, polyFallback(correct));
  return {
    rule: 'SIGN RULE',
    prompt: `Simplify: ${termsFmt(terms)}`,
    options, correctIndex,
    diagramData: { mode: 'chips', terms },
    explanation: `Each term keeps its sign. x: ${a} ${MINUS} ${c} = ${a - c}. y: ${d} ${MINUS} ${b} = ${d - b}. Numbers: ${e} ${MINUS} ${f} = ${e - f}. So ${label}.`
  };
}

function qExpand() {
  const k = randInt(2, 7);
  const a = pick([1, 1, 1, 2, 3, 4]);
  const b = pick([randInt(1, 9), randInt(1, 9), -randInt(1, 9)]);
  const inner = lin(a, b);
  const correct = pMul(pConst(k), inner);
  const label = pFmt(correct);
  const wrongs = [
    lin(k * a, b),
    lin(a, k * b),
    lin(k + a, k + b),
    lin(k * a, -k * b)
  ];
  const { options, correctIndex } = buildOptions(label, wrongs, polyFallback(correct));
  const simple = a === 1 && b > 0;
  return {
    rule: 'EXPAND RULE',
    prompt: `Expand: ${k}(${pFmt(inner)})`,
    options, correctIndex,
    diagramData: simple
      ? { mode: 'area', k, c: b }
      : { mode: 'arrows', k, inner: [T(a, 'x'), T(b)] },
    explanation: `Multiply EVERY term in the bracket by ${k}: ${k} × ${a === 1 ? '' : a}x = ${pFmt(pTerm(k * a, 'x'))} and ${k} × ${b < 0 ? `(${MINUS}${Math.abs(b)})` : b} = ${pFmt(pConst(k * b))}. Answer: ${label}.`
  };
}

function qExpandNeg() {
  if (Math.random() < 0.5) {
    // −k(ax + b)
    const k = randInt(2, 6);
    const a = pick([1, 1, 2, 3]);
    const b = randNZ(-8, 8);
    const inner = lin(a, b);
    const correct = pMul(pConst(-k), inner);
    const label = pFmt(correct);
    const wrongs = [
      lin(-k * a, k * b),
      lin(-k * a, b),
      lin(k * a, k * b),
      lin(k * a, -k * b)
    ];
    const { options, correctIndex } = buildOptions(label, wrongs, polyFallback(correct));
    return {
      rule: 'SIGN RULE',
      prompt: `Expand: ${MINUS}${k}(${pFmt(inner)})`,
      options, correctIndex,
      diagramData: { mode: 'arrows', k: -k, inner: [T(a, 'x'), T(b)] },
      explanation: `The ${MINUS}${k} multiplies BOTH terms and flips their signs: ${label}.`
    };
  }
  // c − k(x + d)
  const c = randNZ(-6, 9);
  const k = randInt(2, 5);
  const d = randNZ(-6, 6);
  const inner = lin(1, d);
  const correct = pAdd(pConst(c), pMul(pConst(-k), inner));
  const label = pFmt(correct);
  const wrongs = [
    pAdd(pConst(c - d), pTerm(-k, 'x')),
    pAdd(pConst(c + k * d), pTerm(-k, 'x')),
    pMul(pConst(c - k), inner),
    pAdd(pConst(c - k * d), pTerm(k, 'x'))
  ];
  const { options, correctIndex } = buildOptions(label, wrongs, polyFallback(correct));
  const cStr = c < 0 ? `${MINUS}${Math.abs(c)}` : String(c);
  return {
    rule: 'SIGN RULE',
    prompt: `Expand and simplify: ${cStr} ${MINUS} ${k}(${pFmt(inner)})`,
    options, correctIndex,
    diagramData: {
      mode: 'flow',
      steps: [`${cStr} ${MINUS} ${k}(${pFmt(inner)})`, `${cStr} ${MINUS}${k}x ${d < 0 ? '+' : MINUS} ${k * Math.abs(d)}`, label]
    },
    explanation: `${MINUS}${k} multiplies both x and ${d}: ${MINUS}${k}x and ${pFmt(pConst(-k * d))}. Collect the numbers: ${label}.`
  };
}

function qExpandConst() {
  const k = randInt(2, 6);
  const a = pick([1, 1, 2, 3]);
  const b = randNZ(-7, 7);
  const dd = randNZ(-8, 8);
  const inner = lin(a, b);
  const correct = pAdd(pMul(pConst(k), inner), pConst(dd));
  const label = pFmt(correct);
  const wrongs = [
    lin(k * a, b + dd),
    lin(k * a, k * (b + dd)),
    lin(k * a + dd, k * b),
    lin(k * a, k * b - dd)
  ];
  const { options, correctIndex } = buildOptions(label, wrongs, polyFallback(correct));
  const dStr = `${dd < 0 ? MINUS : '+'} ${Math.abs(dd)}`;
  return {
    rule: 'EXPAND RULE',
    prompt: `Simplify: ${k}(${pFmt(inner)}) ${dStr}`,
    options, correctIndex,
    diagramData: {
      mode: 'flow',
      steps: [`${k}(${pFmt(inner)}) ${dStr}`, `${pFmt(pMul(pConst(k), inner))} ${dStr}`, label]
    },
    explanation: `Expand first: ${k}(${pFmt(inner)}) = ${pFmt(pMul(pConst(k), inner))}. Then collect the numbers: ${label}.`
  };
}

function bracketStr(p) { return `(${pFmt(p)})`; }

function qExpandCollect() {
  const a = randInt(2, 6), c = randInt(2, 6);
  const b = randNZ(-6, 6), d = randNZ(-6, 6);
  const A = lin(1, b), B = lin(1, d);
  const correct = pAdd(pMul(pConst(a), A), pMul(pConst(c), B));
  const label = pFmt(correct);
  const wrongs = [
    lin(a + c, a * b + d),
    lin(a + c, b + c * d),
    lin(a + c, b + d),
    lin(a + c, a * b - c * d),
    lin(a + c, Math.abs(a * b) + Math.abs(c * d))
  ];
  const { options, correctIndex } = buildOptions(label, wrongs, polyFallback(correct));
  const mid = `${pFmt(pConst(a * b))} ${c * d < 0 ? MINUS : '+'} ${Math.abs(c * d)}`;
  return {
    rule: 'EXPAND RULE',
    prompt: `Simplify: ${a}${bracketStr(A)} + ${c}${bracketStr(B)}`,
    options, correctIndex,
    diagramData: {
      mode: 'flow',
      steps: [`${a}${bracketStr(A)} + ${c}${bracketStr(B)}`, termsFmt([T(a, 'x'), T(a * b), T(c, 'x'), T(c * d)]), label]
    },
    explanation: `Expand both brackets, then collect: ${a}x + ${c}x = ${a + c}x and ${mid} = ${pFmt(pConst(a * b + c * d))}. Answer: ${label}.`
  };
}

function qSubBrackets() {
  let a, c;
  do { a = randInt(3, 7); c = randInt(2, 6); } while (a === c);
  let b, d;
  do { b = randNZ(-5, 6); d = randNZ(-5, 6); } while (a * b === c * d);
  const A = lin(1, b), B = lin(1, d);
  const correct = pAdd(pMul(pConst(a), A), pScale(pMul(pConst(c), B), -1));
  const label = pFmt(correct);
  const wrongs = [
    lin(a - c, a * b + c * d),
    lin(a - c, a * b - d),
    lin(a + c, a * b - c * d),
    lin(a - c, b - d)
  ];
  const { options, correctIndex } = buildOptions(label, wrongs, polyFallback(correct));
  return {
    rule: 'SIGN RULE',
    prompt: `Simplify: ${a}${bracketStr(A)} ${MINUS} ${c}${bracketStr(B)}`,
    options, correctIndex,
    diagramData: {
      mode: 'flow',
      steps: [
        `${a}${bracketStr(A)} ${MINUS} ${c}${bracketStr(B)}`,
        `${pFmt(pMul(pConst(a), A))} ${MINUS} ${c}${bracketStr(B)}`,
        label
      ]
    },
    explanation: `The ${MINUS} sign multiplies the WHOLE second bracket: ${MINUS}${c}x and ${pFmt(pConst(-c * d))}. Then collect: ${label}.`
  };
}

function qQuad() {
  const a = randInt(1, 5), d = randInt(1, 5);
  const b = randNZ(-6, 6);
  let e;
  do { e = randNZ(-6, 6); } while (b + e === 0);
  const c = randNZ(-7, 7);
  let f;
  do { f = randNZ(-7, 7); } while (c + f === 0);
  const terms = shuffle([T(a, 'x^2'), T(b, 'x'), T(c), T(d, 'x^2'), T(e, 'x'), T(f)]);
  const correct = termsToPoly(terms);
  const label = pFmt(correct);
  const wrongs = [
    pAdd(pTerm(a + d + b + e, 'x^2'), pConst(c + f)),
    pAdd(pAdd(pTerm(a + d, 'x^4'), pTerm(b + e, 'x')), pConst(c + f)),
    pAdd(pTerm(a + d, 'x^2'), pTerm(b + e + c + f, 'x')),
    pAdd(pAdd(pTerm(a + d, 'x^2'), pTerm(b + e, 'x^2')), pConst(c + f))
  ];
  const { options, correctIndex } = buildOptions(label, wrongs, polyFallback(correct));
  return {
    rule: 'LIKE TERMS RULE',
    prompt: `Simplify: ${termsFmt(terms)}`,
    options, correctIndex,
    diagramData: { mode: 'chips', terms },
    explanation: `x² with x², x with x, numbers with numbers: ${label}. (x² and x are NOT like terms!)`
  };
}

function qPerimeter() {
  const p = randInt(1, 4), q = randInt(1, 6), r = randInt(1, 3), s = randInt(1, 6);
  const L = lin(p, q), W = lin(r, s);
  const correct = pScale(pAdd(L, W), 2);
  const label = pFmt(correct);
  const wrongs = [
    pAdd(L, W),
    pAdd(pScale(L, 2), W),
    lin(2 * (p + r), q + s),
    pMul(L, W)
  ];
  const { options, correctIndex } = buildOptions(label, wrongs, polyFallback(correct));
  return {
    rule: 'PERIMETER RULE',
    prompt: `A rectangle has length (${pFmt(L)}) cm and width (${pFmt(W)}) cm. Find its perimeter in simplest form.`,
    options, correctIndex,
    diagramData: { mode: 'rect', length: pFmt(L), width: pFmt(W) },
    explanation: `Perimeter = 2 × (length + width) = 2(${pFmt(pAdd(L, W))}) = ${label}.`
  };
}

function qEvaluate() {
  const a = randInt(2, 5), c = randInt(2, 5);
  const b = randNZ(-4, 5), d = randNZ(-4, 5);
  const xv = randInt(2, 5);
  const A = lin(1, b), B = lin(1, d);
  const simplified = pAdd(pMul(pConst(a), A), pMul(pConst(c), B));
  const val = pEval(simplified, { x: xv });
  const wrongs = [
    pEval(lin(a + c, a * b + d), { x: xv }),
    pEval(lin(a + c, b + c * d), { x: xv }),
    pEval(lin(a + c, b + d), { x: xv }),
    pEval(lin(a + c, a * b - c * d), { x: xv })
  ].map(String);
  const correct = String(val);
  const { options, correctIndex } = buildOptions(correct, wrongs, () => String(val + pick([-4, -3, -2, 2, 3, 4, 5])));
  return {
    rule: 'EVALUATE RULE',
    prompt: `Simplify ${a}${bracketStr(A)} + ${c}${bracketStr(B)}, then find its value when x = ${xv}.`,
    options, correctIndex,
    diagramData: {
      mode: 'flow',
      steps: [`${a}${bracketStr(A)} + ${c}${bracketStr(B)}`, pFmt(simplified), `x = ${xv} → ${val}`]
    },
    explanation: `Simplified: ${pFmt(simplified)}. Substitute x = ${xv}: ${val}.`
  };
}

function gcd(a, b) { return b === 0 ? Math.abs(a) : gcd(b, a % b); }

function qFactor() {
  let g, m, n;
  do { g = randInt(2, 5); m = randInt(1, 4); n = randInt(1, 7); } while (gcd(m, n) !== 1);
  const expr = pFmt(lin(g * m, g * n));
  const correct = `${g}(${pFmt(lin(m, n))})`;
  const wrongs = [
    `${g}(${pFmt(lin(m, g * n))})`,
    `${g * m}(x + ${n})`,
    `${g}(${pFmt(lin(m, n + 1))})`,
    `${m}(${pFmt(lin(g, n))})`,
    `${g}(${pFmt(lin(m, -n))})`
  ];
  const { options, correctIndex } = buildOptions(correct, wrongs, () => `${g}(${pFmt(lin(m + 1, n))})`);
  return {
    rule: 'FACTOR RULE',
    prompt: `Factorise completely: ${expr}`,
    options, correctIndex,
    diagramData: { mode: 'flow', steps: [expr, `common factor = ${g}`, correct] },
    explanation: `${g} divides both terms: ${g * m}x ÷ ${g} = ${pFmt(pTerm(m, 'x'))} and ${g * n} ÷ ${g} = ${n}. So ${correct}.`
  };
}

const GENERATORS = {
  identify: qIdentify,
  coef: qCoef,
  collect1: qCollect1,
  collect2: qCollect2,
  collectNeg: qCollectNeg,
  expand: qExpand,
  expandNeg: qExpandNeg,
  expandConst: qExpandConst,
  expandCollect: qExpandCollect,
  subBrackets: qSubBrackets,
  quad: qQuad,
  perimeter: qPerimeter,
  evaluate: qEvaluate,
  factor: qFactor
};

/**
 * Generate a procedural question for a given world
 */
export function makeQuestion(worldIndex = 0) {
  const world = PRACTICE_WORLDS[worldIndex] || PRACTICE_WORLDS[0];
  const type = pick(world.types);
  const body = GENERATORS[type]();
  return { world, name: pick(WESTERN_NAMES), type, ...body };
}
