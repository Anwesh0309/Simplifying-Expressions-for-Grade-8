import React from 'react';
import { termFmt, MINUS } from '../algebra.js';

/* colour per kind of term */
const TERM_STYLE = {
  x: { fill: '#8b5cf6', text: '#ffffff' },
  y: { fill: '#22d3ee', text: '#06222b' },
  'x^2': { fill: '#f472b6', text: '#2b0719' },
  '1': { fill: '#facc15', text: '#2b2100' },
  other: { fill: '#4ade80', text: '#042a12' }
};
const styleFor = m => TERM_STYLE[m] || TERM_STYLE.other;

function Chip({ x, y, w, label, m, negative }) {
  const st = styleFor(m);
  return (
    <g>
      <rect
        x={x} y={y} width={w} height={34} rx={12}
        fill={st.fill} fillOpacity={negative ? 0.28 : 0.95}
        stroke={negative ? '#fb7185' : '#ffffff'} strokeOpacity={negative ? 1 : 0.55}
        strokeWidth={negative ? 2.5 : 1.5} strokeDasharray={negative ? '5 3' : undefined}
      />
      <text
        x={x + w / 2} y={y + 23} textAnchor="middle" fontSize="17" fontWeight="900"
        fill={negative ? '#ffe4e6' : st.text} fontFamily="'Fredoka One', Nunito, sans-serif"
      >
        {label}
      </text>
    </g>
  );
}

export function ExprDiagram({ diagramData, size = 210 }) {
  if (!diagramData) return null;
  const { mode } = diagramData;
  const width = Math.round(size * 1.55);
  const height = Math.round(width * 0.47);
  const common = {
    width, height, viewBox: '0 0 320 150',
    className: 'drop-shadow-[0_0_18px_rgba(139,92,246,0.45)]'
  };

  /* ---- term chips (sort-friendly view of the expression) ---- */
  if (mode === 'chips') {
    const terms = diagramData.terms || [];
    const items = terms.map(t => {
      const label = termFmt({ ...t, c: Math.abs(t.c) }); // abs, sign shown by style + prefix
      const text = (t.c < 0 ? MINUS : '+') + label;
      return { text, m: t.m, negative: t.c < 0, w: 26 + text.length * 11 };
    });
    // simple row wrap
    const rows = [];
    let row = [], rowW = 0;
    items.forEach(it => {
      if (rowW + it.w + 8 > 300 && row.length) { rows.push(row); row = []; rowW = 0; }
      row.push(it);
      rowW += it.w + 8;
    });
    if (row.length) rows.push(row);
    const gapY = rows.length > 2 ? 42 : 48;
    const startY = 75 - ((rows.length - 1) * gapY) / 2 - 17;
    return (
      <svg {...common}>
        {rows.map((r, ri) => {
          const total = r.reduce((a, it) => a + it.w + 8, -8);
          let cx = 160 - total / 2;
          return r.map((it, ci) => {
            const el = <Chip key={`${ri}-${ci}`} x={cx} y={startY + ri * gapY} w={it.w} label={it.text} m={it.m} negative={it.negative} />;
            cx += it.w + 8;
            return el;
          });
        })}
      </svg>
    );
  }

  /* ---- legend for like / unlike ---- */
  if (mode === 'legend') {
    const samples = [
      { l: '3x', m: 'x' }, { l: '5x', m: 'x' }, { l: '2y', m: 'y' }, { l: '4x\u00b2', m: 'x^2' }, { l: '7', m: '1' }
    ];
    return (
      <svg {...common}>
        {samples.map((s, i) => <Chip key={i} x={14 + i * 60} y={34} w={52} label={s.l} m={s.m} />)}
        <path d="M 40 76 Q 66 100 92 76" fill="none" stroke="#4ade80" strokeWidth="3.5" strokeLinecap="round" />
        <text x="66" y="118" textAnchor="middle" fontSize="13" fontWeight="900" fill="#4ade80">LIKE</text>
        <text x="228" y="108" textAnchor="middle" fontSize="12.5" fontWeight="800" fill="#fda4af">different letter or power = unlike</text>
      </svg>
    );
  }

  /* ---- area model for k(x + c) ---- */
  if (mode === 'area') {
    const { k, c } = diagramData;
    const h = Math.min(92, 20 + k * 11);
    const cw = Math.min(110, 22 + c * 9);
    const xw = 120;
    const x0 = 160 - (xw + cw) / 2 + 10;
    const y0 = 38;
    return (
      <svg {...common}>
        <rect x={x0} y={y0} width={xw} height={h} fill="#8b5cf6" fillOpacity="0.75" stroke="#fff" strokeOpacity="0.7" strokeWidth="2" rx="4" />
        <rect x={x0 + xw} y={y0} width={cw} height={h} fill="#facc15" fillOpacity="0.85" stroke="#fff" strokeOpacity="0.7" strokeWidth="2" rx="4" />
        <text x={x0 + xw / 2} y={y0 - 8} textAnchor="middle" fontSize="15" fontWeight="900" fill="#c4b5fd">x</text>
        <text x={x0 + xw + cw / 2} y={y0 - 8} textAnchor="middle" fontSize="15" fontWeight="900" fill="#fde047">{c}</text>
        <text x={x0 - 10} y={y0 + h / 2 + 5} textAnchor="end" fontSize="16" fontWeight="900" fill="#67e8f9">{k}</text>
        <text x={x0 + xw / 2} y={y0 + h / 2 + 6} textAnchor="middle" fontSize="17" fontWeight="900" fill="#fff">{k}x</text>
        <text x={x0 + xw + cw / 2} y={y0 + h / 2 + 6} textAnchor="middle" fontSize="17" fontWeight="900" fill="#2b2100">{k * c}</text>
      </svg>
    );
  }

  /* ---- arrows: k outside bracket reaches every term ---- */
  if (mode === 'arrows') {
    const { k, inner } = diagramData;
    const kText = k < 0 ? `${MINUS}${Math.abs(k)}` : String(k);
    const t1 = termFmt(inner[0]);
    const t2 = termFmt(inner[1]);
    return (
      <svg {...common}>
        <text x="56" y="112" textAnchor="middle" fontSize="40" fontWeight="900" fill="#67e8f9" fontFamily="'Fredoka One', Nunito, sans-serif">{kText}</text>
        <text x="106" y="112" textAnchor="middle" fontSize="48" fontWeight="300" fill="#e2e8f0">(</text>
        <text x="158" y="110" textAnchor="middle" fontSize="28" fontWeight="900" fill="#c4b5fd" fontFamily="'Fredoka One', Nunito, sans-serif">{t1}</text>
        <text x="226" y="110" textAnchor="middle" fontSize="28" fontWeight="900" fill="#fde047" fontFamily="'Fredoka One', Nunito, sans-serif">{inner[1].c < 0 ? t2 : `+ ${t2}`}</text>
        <text x="286" y="112" textAnchor="middle" fontSize="48" fontWeight="300" fill="#e2e8f0">)</text>
        <path d="M 56 80 Q 100 20 158 76" fill="none" stroke="#4ade80" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 62 80 Q 150 -6 226 76" fill="none" stroke="#4ade80" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="1 7" />
        <circle cx="158" cy="76" r="4.5" fill="#4ade80" />
        <circle cx="226" cy="76" r="4.5" fill="#4ade80" />
      </svg>
    );
  }

  /* ---- flow: stacked steps ---- */
  if (mode === 'flow') {
    const steps = diagramData.steps || [];
    const tags = ['START', 'EXPAND', 'RESULT'];
    return (
      <svg {...common}>
        {steps.map((s, i) => {
          const y = 8 + i * 46;
          const last = i === steps.length - 1;
          const fs = s.length > 24 ? 13 : s.length > 18 ? 15 : 17;
          return (
            <g key={i}>
              <rect x="10" y={y} width="300" height="34" rx="17"
                fill={last ? '#facc15' : '#2a1a5e'} fillOpacity={last ? 0.95 : 0.9}
                stroke={last ? '#fde047' : '#a78bfa'} strokeOpacity="0.8" strokeWidth="2" />
              <text x="26" y={y + 22} fontSize="10" fontWeight="900" fill={last ? '#5b4400' : '#a78bfa'}>{tags[i] || ''}</text>
              <text x="178" y={y + 23} textAnchor="middle" fontSize={fs} fontWeight="900"
                fill={last ? '#2b2100' : '#ffffff'} fontFamily="'Fredoka One', Nunito, sans-serif">{s}</text>
              {!last && <path d={`M 160 ${y + 36} l 0 6 l -4 -4 m 4 4 l 4 -4`} stroke="#4ade80" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
            </g>
          );
        })}
      </svg>
    );
  }

  /* ---- rectangle (perimeter) ---- */
  if (mode === 'rect') {
    const { length, width: w } = diagramData;
    return (
      <svg {...common}>
        <rect x="20" y="34" width="180" height="84" rx="8" fill="#38bdf8" fillOpacity="0.2" stroke="#38bdf8" strokeWidth="4" />
        <text x="110" y="24" textAnchor="middle" fontSize="15" fontWeight="900" fill="#fde047">{length} cm</text>
        <text x="210" y="82" textAnchor="start" fontSize="15" fontWeight="900" fill="#c4b5fd">{w} cm</text>
        <text x="110" y="82" textAnchor="middle" fontSize="15" fontWeight="900" fill="#fda4af">P = ?</text>
        {[[20, 34], [200, 34], [200, 118], [20, 118]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="5" fill="#fff" />)}
      </svg>
    );
  }

  return null;
}
