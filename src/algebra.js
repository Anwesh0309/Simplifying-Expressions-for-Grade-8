/* =========================================================================
   ALGEBRA ENGINE
   Tiny polynomial toolkit used by (a) the practice question generator and
   (b) the simulation stations to check typed answers like "3x - 2y + 5".
   Monomial keys: "x", "y", "x^2", "xy", "1" (constant).
   ========================================================================= */

export const MINUS = '\u2212';

/* ---------- polynomial as { monoKey: coefficient } ---------- */
export function pAdd(a, b) {
  const out = { ...a };
  for (const k in b) {
    out[k] = (out[k] || 0) + b[k];
    if (out[k] === 0) delete out[k];
  }
  return out;
}
export const pScale = (a, s) => {
  const out = {};
  for (const k in a) if (a[k] * s !== 0) out[k] = a[k] * s;
  return out;
};
export const pNeg = a => pScale(a, -1);

function monoParse(k) {
  const m = {};
  if (k === '1') return m;
  const re = /([a-z])(?:\^(\d+))?/g;
  let r;
  while ((r = re.exec(k))) m[r[1]] = (m[r[1]] || 0) + (r[2] ? +r[2] : 1);
  return m;
}
function monoKey(m) {
  const keys = Object.keys(m).filter(v => m[v] > 0).sort();
  if (!keys.length) return '1';
  return keys.map(v => (m[v] > 1 ? `${v}^${m[v]}` : v)).join('');
}
export function pMul(a, b) {
  const out = {};
  for (const ka in a) {
    for (const kb in b) {
      const ma = monoParse(ka);
      const mb = monoParse(kb);
      for (const v in mb) ma[v] = (ma[v] || 0) + mb[v];
      const k = monoKey(ma);
      out[k] = (out[k] || 0) + a[ka] * b[kb];
      if (out[k] === 0) delete out[k];
    }
  }
  return out;
}
export const pConst = n => (n === 0 ? {} : { '1': n });
export const pTerm = (c, k = '1') => (c === 0 ? {} : { [k]: c });

export function pEqual(a, b) {
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every(k => Math.abs((a[k] || 0) - (b[k] || 0)) < 1e-9);
}

export function pEval(p, vars) {
  let total = 0;
  for (const k in p) {
    const m = monoParse(k);
    let t = p[k];
    for (const v in m) t *= Math.pow(vars[v] ?? 1, m[v]);
    total += t;
  }
  return total;
}

/* ---------- formatting ---------- */
function monoDisplay(k) {
  if (k === '1') return '';
  return k.replace(/\^2/g, '\u00b2').replace(/\^3/g, '\u00b3').replace(/\^(\d+)/g, '^$1');
}
function monoOrder(k) {
  const m = monoParse(k);
  const deg = Object.values(m).reduce((a, b) => a + b, 0);
  return [-deg, k];
}

/** "3x² − 2x + 5" style output, highest degree first, constants last */
export function pFmt(p) {
  const keys = Object.keys(p).sort((a, b) => {
    const [da, ka] = monoOrder(a);
    const [db, kb] = monoOrder(b);
    if (da !== db) return da - db;
    return ka < kb ? -1 : 1;
  });
  if (!keys.length) return '0';
  return keys
    .map((k, i) => {
      const c = p[k];
      const abs = Math.abs(c);
      const body = k === '1' ? String(abs) : `${abs === 1 ? '' : abs}${monoDisplay(k)}`;
      if (i === 0) return (c < 0 ? MINUS : '') + body;
      return `${c < 0 ? MINUS : '+'} ${body}`;
    })
    .join(' ')
    .replace(/\+ /g, '+ ')
    .replace(/(\S) ([+\u2212]) /g, '$1 $2 ');
}

/** Format an ordered list of terms [{c, m}] WITHOUT collecting them. m is "x", "y", "x^2", or "1" */
export function termsFmt(terms) {
  return terms
    .map((t, i) => {
      const abs = Math.abs(t.c);
      const body = t.m === '1' ? String(abs) : `${abs === 1 ? '' : abs}${monoDisplay(t.m)}`;
      if (i === 0) return (t.c < 0 ? MINUS : '') + body;
      return `${t.c < 0 ? MINUS : '+'} ${body}`;
    })
    .join(' ');
}
export const termFmt = t => termsFmt([t]);
export const termsToPoly = terms => terms.reduce((acc, t) => pAdd(acc, pTerm(t.c, t.m)), {});
export const monoLabel = monoDisplay;

/* ---------- parser for typed answers ---------- */
export function pParse(input) {
  if (typeof input !== 'string') return null;
  const s = input
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/[\u00d7\u00b7]/g, '*')
    .replace(/\u00b2/g, '^2')
    .replace(/\u00b3/g, '^3')
    .replace(/\s+/g, '')
    .toLowerCase();
  if (!s) return null;
  let i = 0;
  const peek = () => s[i];

  function parseExpr() {
    let left = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const op = s[i++];
      const right = parseTerm();
      if (!right) throw new Error('bad');
      left = op === '+' ? pAdd(left, right) : pAdd(left, pNeg(right));
    }
    return left;
  }
  function parseTerm() {
    let left = parseFactor();
    for (;;) {
      const c = peek();
      if (c === '*') {
        i++;
        left = pMul(left, parseFactor());
      } else if (c && (/[a-z0-9.(]/.test(c))) {
        left = pMul(left, parseFactor());
      } else break;
    }
    return left;
  }
  function parseFactor() {
    if (peek() === '-') { i++; return pNeg(parseFactor()); }
    if (peek() === '+') { i++; return parseFactor(); }
    let base = parseAtom();
    if (peek() === '^') {
      i++;
      let n = '';
      while (/\d/.test(peek() || '')) n += s[i++];
      if (!n) throw new Error('bad');
      let out = pConst(1);
      for (let k = 0; k < +n; k++) out = pMul(out, base);
      base = out;
    }
    return base;
  }
  function parseAtom() {
    const c = peek();
    if (c === '(') {
      i++;
      const e = parseExpr();
      if (peek() !== ')') throw new Error('bad');
      i++;
      return e;
    }
    if (c && /[0-9.]/.test(c)) {
      let n = '';
      while (/[0-9.]/.test(peek() || '')) n += s[i++];
      const v = parseFloat(n);
      if (Number.isNaN(v)) throw new Error('bad');
      return pConst(v);
    }
    if (c && /[a-z]/.test(c)) {
      i++;
      return pTerm(1, c);
    }
    throw new Error('bad');
  }
  try {
    const out = parseExpr();
    if (i !== s.length) return null;
    return out;
  } catch (e) {
    return null;
  }
}

/** true if the typed text is a polynomial EQUAL to `target` (poly object) */
export function answerMatches(input, target) {
  const p = pParse(input);
  return p != null && pEqual(p, target);
}
