import React, { useState, useMemo } from 'react';
import {
  MINUS, pAdd, pMul, pConst, pTerm, pFmt, pParse, pEqual, termFmt, termsFmt, termsToPoly
} from '../algebra.js';
import { playSfx } from '../utils/audio.js';

/* =========================================================================
   REAL-WORLD TERM STYLING & ICONS
   ========================================================================= */
const TERM_REAL_WORLD_MAP = {
  p: { icon: '✏️', name: 'Pencil', color: ['#3b82f6', '#ffffff'], unit: 'pencils' },
  e: { icon: '🧹', name: 'Eraser', color: ['#ec4899', '#ffffff'], unit: 'erasers' },
  a: { icon: '🍎', name: 'Apple', color: ['#ef4444', '#ffffff'], unit: 'apples' },
  b: { icon: '🍌', name: 'Banana', color: ['#eab308', '#1c1917'], unit: 'bananas' },
  x: { icon: '🧁', name: 'Cupcake / Item x', color: ['#8b5cf6', '#ffffff'], unit: 'x-units' },
  y: { icon: '⚙️', name: 'Gear / Item y', color: ['#06b6d4', '#042f2e'], unit: 'y-units' },
  'x^2': { icon: '🔷', name: 'Large Crystal Cluster (x²)', color: ['#f472b6', '#2b0719'], unit: 'x²-clusters' },
  '1': { icon: '🪙', name: 'Fixed Coin / Constant', color: ['#f97316', '#2b1100'], unit: 'coins' }
};

const getRealWorldInfo = m => TERM_REAL_WORLD_MAP[m] || { icon: '🏷️', name: `${m} Item`, color: ['#10b981', '#022c22'], unit: 'units' };

function RealWorldTermChip({ term, selected, onClick, small, disabled, showRealWorldName }) {
  const info = getRealWorldInfo(term.m);
  const [bg, fg] = info.color;
  const neg = term.c < 0;
  const absVal = Math.abs(term.c);
  const mathLabel = (neg ? MINUS : '+') + termFmt({ ...term, c: absVal });
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ background: bg, color: fg }}
      className={`group relative font-display font-900 rounded-2xl ${
        small ? 'px-3 py-1.5 text-sm sm:text-base' : 'px-4.5 py-2.5 text-base sm:text-xl'
      } shadow-lg transition-all duration-200 border-2 flex items-center gap-2 ${
        selected
          ? 'border-white scale-110 shadow-[0_0_24px_rgba(255,255,255,0.9)] ring-4 ring-cyan-300/60'
          : neg
          ? 'border-rose-300 border-dashed'
          : 'border-white/40'
      } ${disabled ? 'cursor-default' : 'cursor-pointer hover:scale-105 hover:shadow-xl'}`}
    >
      <span className="text-xl sm:text-2xl drop-shadow">{info.icon}</span>
      <span>{mathLabel}</span>
      
      {showRealWorldName && (
        <span className="text-xs opacity-95 font-extrabold bg-black/20 px-2 py-0.5 rounded-full ml-1">
          {absVal} {info.name}{absVal !== 1 && term.m !== '1' ? 's' : ''}
        </span>
      )}
    </button>
  );
}

function Stepper({ label, value, min, max, onChange, color = 'text-amber-300', icon = '' }) {
  return (
    <div className="flex items-center gap-2.5 bg-[#14082c] border border-cyan-400/40 rounded-2xl px-3.5 py-2 shadow-md">
      {icon && <span className="text-lg">{icon}</span>}
      <span className="text-xs sm:text-sm font-extrabold text-slate-200">{label}</span>
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/25 text-white font-black text-lg cursor-pointer disabled:opacity-30 transition"
      >−</button>
      <span className={`font-display font-900 text-lg sm:text-xl w-8 text-center ${color}`}>
        {value < 0 ? `${MINUS}${Math.abs(value)}` : value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/25 text-white font-black text-lg cursor-pointer disabled:opacity-30 transition"
      >+</button>
    </div>
  );
}

function Banner({ ok, children }) {
  return (
    <div className={`px-4 py-3 rounded-2xl text-sm sm:text-base font-900 w-full text-center fade-in-up shadow-xl shrink-0 flex items-center justify-center gap-2 ${
      ok ? 'bg-emerald-950/90 text-emerald-200 border-2 border-emerald-400/70' : 'bg-rose-950/90 text-rose-200 border-2 border-rose-400/70'
    }`}>
      <span className="text-xl">{ok ? '🌟' : '💡'}</span>
      <span>{children}</span>
    </div>
  );
}

/* =========================================================================
   STATION 1 · REAL-WORLD ITEM & TILE SORTER (Tray Lab)
   ========================================================================= */
export function SortLab({ cfg, onSolved }) {
  const [pool, setPool] = useState(cfg.terms);
  const [placed, setPlaced] = useState({});
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState(null);
  const [shakeKey, setShakeKey] = useState(null);
  const [combined, setCombined] = useState(false);

  const sel = pool.find(t => t.id === selected);

  const dropOn = tray => {
    if (!sel) {
      setMsg({ ok: false, text: 'Tap an item term first above, then tap the tray where it belongs.' });
      return;
    }
    if (sel.m === tray.key) {
      playSfx('pop');
      setPlaced(p => ({ ...p, [tray.key]: [...(p[tray.key] || []), sel] }));
      setPool(p => p.filter(t => t.id !== sel.id));
      setSelected(null);
      const info = getRealWorldInfo(sel.m);
      setMsg({ ok: true, text: `✓ ${termFmt(sel)} (${info.name}) placed in the ${tray.label}! Like terms have the same letter.` });
    } else {
      playSfx('bad');
      setShakeKey(tray.key);
      setTimeout(() => setShakeKey(null), 450);
      const selInfo = getRealWorldInfo(sel.m);
      setMsg({ ok: false, text: `❌ ${termFmt(sel)} (${selInfo.name}) cannot go in ${tray.label}! Unlike terms have different letters or powers.` });
    }
  };

  const combine = () => {
    setCombined(true);
    playSfx('win');
    onSolved();
  };

  const trayTotals = cfg.trays.map(t => ({ ...t, poly: termsToPoly(placed[t.key] || []) }));
  const finalPoly = trayTotals.reduce((acc, t) => pAdd(acc, t.poly), {});

  return (
    <>
      {/* Real-World Context Badge */}
      <div className="w-full bg-[#14082c] border-2 border-cyan-400/40 rounded-2xl p-3 shrink-0 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-slate-200">
          <span className="flex items-center gap-2">
            <span>📦</span>
            <span className="text-cyan-300">Item Inventory Pool ({pool.length} remaining):</span>
          </span>
          <span className="text-amber-300 font-900">
            {pool.length ? 'Tap a term card to select it' : 'All items correctly sorted! 🎉'}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 min-h-[52px]">
          {pool.map(t => (
            <RealWorldTermChip
              key={t.id}
              term={t}
              selected={selected === t.id}
              showRealWorldName
              onClick={() => setSelected(s => (s === t.id ? null : t.id))}
            />
          ))}
          {!pool.length && !combined && (
            <span className="text-sm font-extrabold text-emerald-300 bg-emerald-950/80 px-4 py-1.5 rounded-full border border-emerald-400/50 animate-bounce">
              Great sorting! Click 'Combine Trays' below to simplify.
            </span>
          )}
        </div>
      </div>

      {/* Trays Grid */}
      <div className="grid gap-3 w-full" style={{ gridTemplateColumns: `repeat(${cfg.trays.length}, minmax(0, 1fr))` }}>
        {trayTotals.map(t => {
          const info = getRealWorldInfo(t.key);
          const currentItems = placed[t.key] || [];
          return (
            <button
              key={t.key}
              onClick={() => dropOn(t)}
              className={`rounded-2xl border-2 p-3 flex flex-col items-center justify-between gap-2 text-center cursor-pointer transition-all duration-200 min-h-[140px] ${
                sel
                  ? 'border-cyan-300 bg-cyan-400/15 hover:bg-cyan-400/25 scale-[1.01] shadow-[0_0_20px_rgba(56,189,248,0.3)]'
                  : 'border-purple-400/40 bg-[#10072a]/95 hover:border-purple-400'
              } ${shakeKey === t.key ? 'animate-shake border-rose-400 bg-rose-950/50' : ''}`}
            >
              {/* Tray Header */}
              <div className="flex items-center justify-center gap-2 bg-[#1b0d40] w-full py-1.5 rounded-xl border border-white/10 shrink-0">
                <span className="text-xl sm:text-2xl">{t.emoji}</span>
                <span className="font-display font-900 text-sm sm:text-base text-white">{t.label}</span>
              </div>

              {/* Items Placed in Tray */}
              <div className="flex flex-wrap items-center justify-center gap-2 flex-1 w-full min-h-[60px] p-2 bg-black/20 rounded-xl border border-dashed border-white/15">
                {currentItems.length === 0 && (
                  <span className="text-xs font-bold text-slate-400 italic">
                    {sel ? `Tap to place ${termFmt(sel)} here` : `Empty ${t.label}`}
                  </span>
                )}
                {currentItems.map(p => (
                  <RealWorldTermChip key={p.id} term={p} small disabled />
                ))}
              </div>

              {/* Combined Total Result */}
              {combined && (
                <div className="w-full font-display font-900 text-lg sm:text-xl text-amber-300 bg-amber-400/20 border border-amber-400/60 rounded-xl py-1 px-3 fade-in-up flex items-center justify-center gap-1.5 shadow-md shrink-0">
                  <span>=</span>
                  <span>{pFmt(t.poly)}</span>
                  <span className="text-xs text-slate-200 font-extrabold">({info.name}s)</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {msg && !combined && <Banner ok={msg.ok}>{msg.text}</Banner>}

      {combined ? (
        <div className="w-full bg-cyan-950/90 border-2 border-cyan-400/70 p-3.5 rounded-2xl flex flex-col items-center fade-in-up shadow-xl shrink-0 gap-1.5">
          <span className="text-xs text-cyan-300 font-900 uppercase tracking-wider flex items-center gap-1">
            <span>✨</span> Real-World Simplified Inventory Expression:
          </span>
          <div className="w-full py-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 rounded-xl flex items-center justify-center font-display font-900 text-slate-950 text-lg sm:text-2xl shadow-lg px-4 text-center border border-white/50">
            {termsFmt(cfg.terms)} = {pFmt(finalPoly)}
          </div>
        </div>
      ) : (
        <button
          onClick={combine}
          disabled={pool.length > 0}
          className="btn-gold text-sm sm:text-base font-900 px-9 py-3 shadow-lg hover:scale-105 transition cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ✨ Combine & Simplify Trays
        </button>
      )}
    </>
  );
}

/* =========================================================================
   STATION 2 · A — BAKERY GIFT BOX AREA MODEL
   ========================================================================= */
export function AreaLab({ cfg, onSolved }) {
  const [k, setK] = useState(cfg.k);
  const [c, setC] = useState(cfg.c);
  const [split, setSplit] = useState(false);
  const [guess, setGuess] = useState(null);
  const [msg, setMsg] = useState(null);

  const options = useMemo(() => {
    const opts = [
      { id: 'a', label: `${k}x + ${c}`, ok: false, why: `Remember to multiply the second term (${k} × ${c} = ${k * c}), not leave it as ${c}!` },
      { id: 'b', label: `${k}x + ${k * c}`, ok: true, why: `Correct! ${k} multiplies both the x cupcakes and the ${c} cookies.` },
      { id: 'c', label: `x + ${k * c}`, ok: false, why: `Don't forget the first term! ${k} × x = ${k}x, not just 1x.` }
    ];
    const r = (k + c) % 3;
    return [...opts.slice(r), ...opts.slice(0, r)];
  }, [k, c]);

  const reset = () => { setSplit(false); setGuess(null); setMsg(null); };
  const change = setter => v => { setter(v); reset(); };

  const doSplit = () => {
    if (!guess) {
      setMsg({ ok: false, text: 'Choose your prediction below first, then split the combo box!' });
      return;
    }
    setSplit(true);
    const chosen = options.find(o => o.id === guess);
    if (chosen.ok) {
      playSfx('good');
      setMsg({ ok: true, text: `✓ Perfect! ${k}(x + ${c}) = ${k}x + ${k * c}. ${k} gift boxes containing (x cupcakes + ${c} cookies) equals ${k}x cupcakes plus ${k * c} cookies!` });
      onSolved();
    } else {
      playSfx('bad');
      setMsg({ ok: false, text: `Not quite: ${chosen.why}` });
    }
  };

  return (
    <>
      {/* Real-world Scenario Header */}
      <div className="w-full bg-[#14082c] border border-cyan-400/30 rounded-2xl p-3 shrink-0 text-center flex flex-col items-center gap-1">
        <span className="text-xs sm:text-sm font-extrabold text-cyan-300 flex items-center gap-1.5">
          <span>🧁</span>
          <span>Bakery Gift Box Factory: Packaging <span className="text-amber-300 font-900">{k}</span> combo boxes with <span className="text-amber-300 font-900">(x cupcakes + {c} cookies)</span> inside.</span>
        </span>
      </div>

      {/* Interactive Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
        <Stepper label="k (Number of Boxes)" value={k} min={2} max={6} onChange={change(setK)} color="text-cyan-300" icon="📦" />
        <Stepper label="c (Cookies per Box)" value={c} min={1} max={8} onChange={change(setC)} color="text-amber-300" icon="🍪" />
      </div>

      {/* Visual Area Model Box Representation — Flex Col on small screens, Row on large */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-5 w-full py-2 shrink-0">
        <div className="relative bg-[#10072a] border-2 border-purple-400/50 rounded-2xl p-4 flex flex-col items-center justify-center shadow-2xl overflow-hidden w-full max-w-sm">
          <div className="text-xs text-cyan-300 font-900 mb-2 uppercase tracking-wider text-center">
            {split ? 'Expanded Bakery Inventory Areas' : 'Packaged Gift Box: k(x + c)'}
          </div>

          <div className="flex w-full items-stretch gap-2 min-h-[105px]">
            {/* Cupcakes Area (x) */}
            <div className={`flex-1 rounded-xl p-3 flex flex-col items-center justify-center transition-all duration-300 border-2 ${
              split ? 'bg-purple-900/80 border-purple-400 shadow-lg scale-105' : 'bg-purple-950/60 border-purple-500/40'
            }`}>
              <span className="text-2xl sm:text-3xl mb-1">🧁</span>
              <span className="font-display font-900 text-lg sm:text-2xl text-white">
                {split ? `${k}x` : 'x'}
              </span>
              <span className="text-[11px] font-bold text-slate-300">
                {split ? `${k} × x cupcakes` : 'cupcakes'}
              </span>
            </div>

            {/* Cookies Area (c) */}
            <div className={`flex-1 rounded-xl p-3 flex flex-col items-center justify-center transition-all duration-300 border-2 ${
              split ? 'bg-amber-900/80 border-amber-400 shadow-lg scale-105' : 'bg-amber-950/60 border-amber-500/40'
            }`}>
              <span className="text-2xl sm:text-3xl mb-1">🍪</span>
              <span className="font-display font-900 text-lg sm:text-2xl text-amber-300">
                {split ? `${k * c}` : `${c}`}
              </span>
              <span className="text-[11px] font-bold text-slate-300">
                {split ? `${k} × ${c} = ${k * c} cookies` : `${c} cookies`}
              </span>
            </div>
          </div>

          {/* Mathematical Expression Formula Overlay */}
          <div className="mt-3 font-display font-900 text-lg sm:text-xl text-white bg-black/40 px-4 py-1.5 rounded-full border border-white/20 text-center">
            {split ? `${k}(x + ${c}) = ${k}x + ${k * c}` : `${k}(x + ${c})`}
          </div>
        </div>

        {/* Prediction Multiple Choice Selector */}
        <div className="flex flex-col gap-2 shrink-0 w-full max-w-sm">
          <p className="text-xs font-900 text-cyan-300 uppercase tracking-wider text-center lg:text-left">Predict the expanded total:</p>
          {options.map(o => (
            <button
              key={o.id}
              onClick={() => { setGuess(o.id); setMsg(null); setSplit(false); }}
              className={`font-display font-900 text-sm sm:text-base px-4 py-2.5 rounded-xl border-2 cursor-pointer transition text-left ${
                guess === o.id
                  ? 'bg-amber-400 text-slate-950 border-white scale-105 shadow-lg'
                  : 'bg-[#14082c] text-white border-purple-400/40 hover:border-cyan-300'
              }`}
            >
              {k}(x + {c}) = {o.label}
            </button>
          ))}
        </div>
      </div>

      {msg && <Banner ok={msg.ok}>{msg.text}</Banner>}

      <button onClick={doSplit} className="btn-gold text-sm sm:text-base font-900 px-8 py-2.5 shadow-lg hover:scale-105 transition cursor-pointer shrink-0">
        ✂️ Split & Verify Bakery Boxes
      </button>
    </>
  );
}

/* =========================================================================
   STATION 2 · B — STORE REFUND & RETURN COUNTER (Sign Flipper)
   ========================================================================= */
export function FlipLab({ cfg, onSolved }) {
  const [flipped, setFlipped] = useState(cfg.inner.map(() => false));
  const [msg, setMsg] = useState(null);
  const [done, setDone] = useState(false);

  const shown = cfg.inner.map((t, i) => (flipped[i] ? { ...t, c: -t.c } : t));
  const target = cfg.inner.map(t => ({ ...t, c: -t.c }));
  const finalPoly = pAdd(pConst(cfg.lead), termsToPoly(target));

  const check = () => {
    const allFlipped = flipped.every(Boolean);
    if (allFlipped) {
      setDone(true);
      playSfx('good');
      const tStr = target.map(t => `${t.c < 0 ? MINUS : '+'} ${termFmt({ ...t, c: Math.abs(t.c) })}`).join(' ');
      setMsg({ ok: true, text: `✓ Every sign flipped! ${cfg.lead} ${tStr} = ${pFmt(finalPoly)}. A minus sign outside a bracket flips EVERY term inside!` });
      onSolved();
    } else {
      playSfx('bad');
      const left = flipped.filter(f => !f).length;
      setMsg({ ok: false, text: `The minus outside flips EVERY term inside. ${left} term${left > 1 ? 's are' : ' is'} still unflipped!` });
    }
  };

  const exprInside = termsFmt(cfg.inner);

  return (
    <>
      <div className="w-full bg-[#14082c] border border-cyan-400/30 rounded-2xl p-3 shrink-0 text-center flex flex-col items-center gap-1">
        <span className="text-xs sm:text-sm font-extrabold text-cyan-300 flex items-center gap-1.5">
          <span>🛍️</span>
          <span>Store Return Counter: Unpacking returned combo box <span className="text-amber-300 font-900">{cfg.lead} − ({exprInside})</span></span>
        </span>
      </div>

      <div className="w-full flex flex-col items-center gap-2 shrink-0">
        <span className="text-xs text-slate-300 font-extrabold">Original Receipt Expression:</span>
        <div className="font-display font-900 text-2xl sm:text-4xl text-white bg-[#14082c] border-2 border-purple-400/40 rounded-2xl px-8 py-2 shadow-inner">
          {cfg.lead} <span className="text-rose-400 font-900">{MINUS}</span> ( {exprInside} )
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 shrink-0 py-2">
        <p className="text-xs sm:text-sm font-extrabold text-amber-300 flex items-center gap-1">
          <span>👇</span> Tap each term card inside the bracket to flip its sign:
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="font-display font-900 text-3xl sm:text-4xl text-amber-300 px-3.5 py-1.5 bg-amber-400/10 rounded-xl border border-amber-400/40">
            {cfg.lead}
          </span>
          {shown.map((t, i) => {
            const info = getRealWorldInfo(t.m);
            return (
              <button
                key={i}
                disabled={done}
                onClick={() => {
                  playSfx('pop');
                  setFlipped(f => f.map((v, j) => (j === i ? !v : v)));
                  setMsg(null);
                }}
                className={`relative font-display font-900 text-2xl sm:text-3xl px-6 py-3.5 rounded-2xl border-2 shadow-xl transition-all duration-300 cursor-pointer hover:scale-110 flex items-center gap-2 ${
                  flipped[i]
                    ? 'bg-emerald-600/90 border-white text-white scale-105 ring-4 ring-emerald-300/50'
                    : 'bg-[#1e1342] border-rose-400/70 text-white'
                }`}
              >
                <span>{info.icon}</span>
                <span>{(t.c < 0 ? MINUS : '+') + ' ' + termFmt({ ...t, c: Math.abs(t.c) })}</span>
                <span className="absolute -top-3 -right-2 text-xl bg-black/60 rounded-full p-1 border border-white/20">
                  {flipped[i] ? '🔄' : '❓'}
                </span>
              </button>
            );
          })}
        </div>

        {done && (
          <div className="mt-2 font-display font-900 text-lg sm:text-2xl text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 rounded-full px-8 py-2 shadow-xl fade-in-up border border-white">
            Simplified Total: = {pFmt(finalPoly)}
          </div>
        )}
      </div>

      {msg && <Banner ok={msg.ok}>{msg.text}</Banner>}

      {!done && (
        <button onClick={check} className="btn-gold text-sm sm:text-base font-900 px-8 py-2.5 shadow-lg hover:scale-105 transition cursor-pointer shrink-0">
          ✅ Flip Signs & Collect
        </button>
      )}
    </>
  );
}

/* =========================================================================
   STATION 2 · C — SIMPLIFY MACHINE (Combo Pack Order Dialer)
   ========================================================================= */
export function MachineLab({ cfg, onSolved }) {
  const [a, setA] = useState(2);
  const [b, setB] = useState(1);
  const [c, setC] = useState(1);
  const [d, setD] = useState(-1);
  const [tIdx, setTIdx] = useState(0);
  const [won, setWon] = useState(false);
  const [celebrated, setCelebrated] = useState(false);

  const target = cfg.targets[tIdx];
  const targetPoly = pParse(target);
  const br = (n) => (n < 0 ? `x ${MINUS} ${Math.abs(n)}` : n === 0 ? 'x' : `x + ${n}`);
  const result = pAdd(pMul(pConst(a), pAdd(pTerm(1, 'x'), pConst(b))), pMul(pConst(c), pAdd(pTerm(1, 'x'), pConst(d))));
  const expandedTerms = [{ c: a, m: 'x' }, { c: a * b, m: '1' }, { c: c, m: 'x' }, { c: c * d, m: '1' }].filter(t => t.c !== 0);
  const match = pEqual(result, targetPoly);

  React.useEffect(() => {
    if (match && !won) {
      setWon(true);
      playSfx('good');
      if (!celebrated) { setCelebrated(true); onSolved(); }
    }
    if (!match && won) setWon(false);
  }, [match]);

  const nextTarget = () => { setTIdx(i => (i + 1) % cfg.targets.length); setWon(false); };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between w-full bg-[#14082c] border border-cyan-400/30 rounded-2xl p-3 shrink-0 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎰</span>
          <span className="text-xs sm:text-sm font-extrabold text-cyan-300">Catering Order Target:</span>
          <span className="font-display font-900 text-xl sm:text-2xl text-amber-300 bg-amber-400/15 border border-amber-400/50 rounded-xl px-4 py-0.5">
            {target}
          </span>
        </div>

        <button onClick={nextTarget} className="bg-purple-900/80 hover:bg-purple-800 border border-purple-400/50 text-purple-200 font-display font-900 text-xs sm:text-sm px-3.5 py-1.5 rounded-xl cursor-pointer transition">
          🔀 Change Order
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
        <Stepper label="a (Pack 1 Batch)" value={a} min={1} max={6} onChange={setA} color="text-cyan-300" icon="📦" />
        <Stepper label="b (Extras 1)" value={b} min={-5} max={5} onChange={setB} icon="🍪" />
        <Stepper label="c (Pack 2 Batch)" value={c} min={1} max={6} onChange={setC} color="text-cyan-300" icon="📦" />
        <Stepper label="d (Extras 2)" value={d} min={-5} max={5} onChange={setD} icon="🧁" />
      </div>

      <div className={`w-full rounded-2xl border-2 p-4 flex flex-col items-center gap-2 shrink-0 justify-center transition-all duration-300 ${
        won ? 'border-emerald-400 bg-emerald-950/60 shadow-[0_0_30px_rgba(52,211,153,0.5)]' : 'border-amber-400/40 bg-[#14082c]/95'
      }`}>
        <p className="font-display font-900 text-lg sm:text-2xl text-white">
          {a}({br(b)}) + {c}({br(d)})
        </p>
        <p className="text-slate-300 font-extrabold text-sm sm:text-base">
          ↓ Expand: <span className="text-cyan-300 font-900">{termsFmt(expandedTerms)}</span>
        </p>
        <p className="text-slate-300 font-extrabold text-sm sm:text-base">↓ Collect like terms:</p>
        <div className={`font-display font-900 text-2xl sm:text-3xl rounded-full px-8 py-2 shadow-lg ${
          won ? 'bg-emerald-400 text-slate-950 border-2 border-white animate-bounce' : 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950'
        }`}>
          {pFmt(result)} {won && '✓ TARGET MATCHED!'}
        </div>
      </div>

      <p className="text-xs sm:text-sm font-extrabold text-slate-300 text-center shrink-0">
        {won ? '🎉 Perfect dial setting! Click Next Activity to proceed.' : 'Hint: total x = (a + c) and constant = (a×b + c×d).'}
      </p>
    </>
  );
}

/* =========================================================================
   STATION 3 · A — RECEIPT AUDITOR (Spot the Mistake)
   ========================================================================= */
export function MistakeLab({ cfg, onSolved, onRetry }) {
  const [found, setFound] = useState(false);
  const [lineMsg, setLineMsg] = useState(null);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [done, setDone] = useState(false);

  const clickLine = i => {
    if (found) return;
    if (i === 0) setLineMsg({ ok: false, text: 'Line 1 is the original problem description.' });
    else if (i === cfg.errorLine) {
      setFound(true);
      playSfx('good');
      setLineMsg({ ok: true, text: `🔍 Spot on! ${cfg.errorWhy}` });
    } else {
      playSfx('bad');
      setLineMsg({ ok: false, text: 'That line is calculated correctly. The FIRST error is on another line!' });
    }
  };

  const check = () => {
    const p = pParse(input);
    if (!p) {
      setFeedback({ ok: false, text: 'Type a valid simplified expression like x + 12.' });
      return;
    }
    if (pEqual(p, pParse(cfg.answer))) {
      setDone(true);
      playSfx('good');
      setFeedback({ ok: true, text: `🎉 Receipt audit complete! Correct simplified answer is ${cfg.answer}.` });
      onSolved();
    } else if (pEqual(p, pParse(cfg.wrongAnswer))) {
      playSfx('bad');
      setFeedback({ ok: false, text: 'That is the clerk\'s mistaken answer! Type the CORRECT simplified answer.' });
      onRetry();
    } else {
      playSfx('bad');
      setFeedback({ ok: false, text: 'Not quite. Multiply the bracket first, then collect like terms.' });
      onRetry();
    }
  };

  return (
    <>
      <div className="w-full bg-[#14082c] border border-cyan-400/30 rounded-2xl p-3 shrink-0 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs sm:text-sm font-extrabold text-cyan-300 flex items-center gap-1.5">
          <span>🕵️</span>
          <span>Store Invoice Audit: Tap the line where the clerk made an error:</span>
        </span>
        <span className="font-display font-900 text-lg sm:text-xl text-amber-300">{cfg.problem}</span>
      </div>

      <div className="w-full flex flex-col gap-2 shrink-0">
        {cfg.lines.map((ln, i) => (
          <button
            key={i}
            onClick={() => clickLine(i)}
            className={`text-left font-display font-900 text-lg sm:text-2xl px-5 py-3 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
              found && i === cfg.errorLine
                ? 'bg-rose-900/80 border-rose-400 text-rose-100 shadow-[0_0_24px_rgba(251,113,133,0.6)] scale-[1.01]'
                : 'bg-[#14082c] border-purple-400/40 text-white hover:border-cyan-300'
            }`}
          >
            <div>
              <span className="text-slate-400 text-xs sm:text-sm font-900 mr-3 bg-white/10 px-2.5 py-1 rounded-lg">Line {i + 1}</span>
              <span>{ln}</span>
            </div>
            {found && i === cfg.errorLine && <span className="text-2xl animate-bounce">❌ Mistake Here!</span>}
          </button>
        ))}
      </div>

      {lineMsg && <Banner ok={lineMsg.ok}>{lineMsg.text}</Banner>}

      {found && (
        <div className="flex flex-col items-center gap-2.5 w-full shrink-0 fade-in-up mt-1">
          <p className="text-xs sm:text-sm font-extrabold text-cyan-300">Enter the CORRECT simplified result:</p>
          <div className="flex items-center gap-3 justify-center flex-wrap">
            <input
              type="text"
              placeholder="e.g. x + 12"
              value={input}
              disabled={done}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !done && check()}
              className="bg-[#14082c] border-2 border-cyan-400/70 rounded-2xl px-5 py-3 text-white font-display font-900 text-base sm:text-xl text-center outline-none focus:border-amber-400 w-60 shadow-inner"
            />
            <button onClick={check} disabled={done} className="btn-gold text-sm sm:text-base font-900 px-7 py-3 shadow-lg hover:scale-105 transition cursor-pointer disabled:opacity-50">
              Submit Correction ✨
            </button>
            <button onClick={() => setShowHint(h => !h)} className="bg-purple-900/80 hover:bg-purple-800 border border-purple-400/50 text-purple-200 font-display font-900 text-xs sm:text-sm px-4 py-3 rounded-xl transition cursor-pointer">
              💡 Hint
            </button>
          </div>
          {showHint && <div className="p-3 bg-amber-950/90 border border-amber-400/50 text-amber-200 rounded-xl text-xs sm:text-sm font-bold w-full text-center fade-in-up">💡 {cfg.hint}</div>}
          {feedback && <Banner ok={feedback.ok}>{feedback.text}</Banner>}
        </div>
      )}
    </>
  );
}

/* =========================================================================
   STATION 3 · B/C — REAL-WORLD GARDEN FENCE & PUZZLE SOLVER
   ========================================================================= */
export function AnswerLab({ cfg, onSolved, onRetry }) {
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [done, setDone] = useState(false);
  const target = useMemo(() => pParse(cfg.answer), [cfg.answer]);

  const check = () => {
    const p = pParse(input);
    if (!p) {
      setFeedback({ ok: false, text: 'I could not read that. Type it like 10x + 10.' });
      return;
    }
    if (pEqual(p, target)) {
      setDone(true);
      playSfx('win');
      setFeedback({ ok: true, text: `🎉 Brilliant! ${cfg.successText}` });
      onSolved();
      return;
    }
    playSfx('bad');
    const diag = (cfg.diagnose || []).find(d => pEqual(p, pParse(d.when)));
    setFeedback({ ok: false, text: diag ? diag.text : 'Not quite. Combine length and width, then double it for full perimeter!' });
    onRetry();
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row items-center justify-center gap-5 w-full py-1 shrink-0">
        {cfg.kind === 'piece' && (
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="text-xs sm:text-sm font-extrabold text-cyan-300 bg-[#14082c] border border-cyan-400/30 px-4 py-1.5 rounded-full text-center">
              📦 Cargo Ship Shipment: Find the missing container expression
            </div>
            <div className="flex items-center gap-3 flex-wrap justify-center font-display font-900 text-xl sm:text-3xl text-white bg-[#10072a] p-4 rounded-2xl border border-purple-400/40">
              <span className="bg-[#1e1342] border-2 border-cyan-300/60 rounded-xl px-4 py-2 text-cyan-200">5x + 3y</span>
              <span className="text-amber-300">+</span>
              <span className="bg-amber-400/20 border-2 border-dashed border-amber-300 text-amber-300 rounded-xl px-6 py-2 animate-pulse">🧩 ?</span>
              <span className="text-amber-300">=</span>
              <span className="bg-[#1e1342] border-2 border-emerald-300/60 rounded-xl px-4 py-2 text-emerald-300">8x + y {MINUS} 1</span>
            </div>
          </div>
        )}

        {cfg.kind === 'fence' && (
          <div className="flex flex-col sm:flex-row items-center gap-5 w-full justify-center">
            {/* SVG Garden Illustration with Dimensions */}
            <div className="relative shrink-0">
              <svg width="240" height="150" viewBox="0 0 240 150" className="drop-shadow-[0_0_24px_rgba(74,222,128,0.5)]">
                <rect x="24" y="34" width="160" height="86" rx="12" fill="#166534" fillOpacity="0.6" stroke="#fbbf24" strokeWidth="6" strokeDasharray="10 4" />
                <text x="104" y="84" textAnchor="middle" fontSize="28">🌷🌻🌷</text>
                <text x="104" y="24" textAnchor="middle" fontSize="13" fontWeight="900" fill="#fde047">Length = 4x + 3 m</text>
                <text x="190" y="82" textAnchor="start" fontSize="12" fontWeight="900" fill="#c4b5fd">Width =</text>
                <text x="190" y="98" textAnchor="start" fontSize="12" fontWeight="900" fill="#c4b5fd">x + 2 m</text>
              </svg>
            </div>

            {/* Formula Step-by-Step Breakdown */}
            <div className="text-left text-xs sm:text-sm font-extrabold text-slate-100 flex flex-col gap-1.5 bg-[#14082c] border border-cyan-400/40 p-3.5 rounded-2xl shadow-inner">
              <p className="text-cyan-300 font-900 uppercase tracking-wider text-xs">Perimeter Formula Rule:</p>
              <p>• Length ($L$) = <span className="text-amber-300 font-900">4x + 3</span></p>
              <p>• Width ($W$) = <span className="text-amber-300 font-900">x + 2</span></p>
              <p>• Perimeter ($P$) = <span className="text-emerald-300 font-900">2 × (Length + Width)</span></p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 w-full justify-center flex-wrap shrink-0">
        <input
          type="text"
          placeholder={cfg.placeholder}
          value={input}
          disabled={done}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !done && check()}
          className="bg-[#14082c] border-2 border-cyan-400/70 rounded-2xl px-5 py-3 text-white font-display font-900 text-base sm:text-xl text-center outline-none focus:border-amber-400 w-64 shadow-inner"
        />
        <button onClick={check} disabled={done} className="btn-gold text-sm sm:text-base font-900 px-8 py-3 shadow-lg hover:scale-105 transition cursor-pointer disabled:opacity-50">
          Check Answer ✨
        </button>
        <button onClick={() => setShowHint(h => !h)} className="bg-purple-900/80 hover:bg-purple-800 border border-purple-400/50 text-purple-200 font-display font-900 text-xs sm:text-sm px-4 py-3 rounded-xl transition cursor-pointer">
          💡 Hint
        </button>
      </div>

      {showHint && (
        <div className="p-3 bg-amber-950/90 border border-amber-400/50 text-amber-200 rounded-xl text-xs sm:text-sm font-bold w-full text-center fade-in-up shrink-0">
          💡 {cfg.hint}
        </div>
      )}
      {feedback && <Banner ok={feedback.ok}>{feedback.text}</Banner>}
    </>
  );
}
