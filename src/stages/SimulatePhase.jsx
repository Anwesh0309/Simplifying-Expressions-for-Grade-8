import React, { useState, useEffect } from 'react';
import { BgSymbols } from '../components/TopNav.jsx';
import { narrate, stopNarration, playSfx } from '../utils/audio.js';
import { simActivityNarration, simSuccessNarration, simRetryNarration } from '../utils/narration.js';
import { SortLab, AreaLab, FlipLab, MachineLab, MistakeLab, AnswerLab } from '../components/SimLabs.jsx';

const mk = (id, c, m) => ({ id, c, m });

// 3 interactive real-world activities per station (Story aligned & Grade 7 ready)
const STATION_ACTIVITIES = {
  1: [
    {
      id: 1, kind: 'sort', icon: '🍎', title: 'Activity 1: Fruit Market Sorter (Story Slide 1 & 3)',
      desc: " 🍎 Zara's Farmers Fruit Stand has 3a + 2b + 4a + b, where a = red apples and b = yellow bananas. Tap an item term, then tap the tray where it belongs. Like terms share a tray!",
      terms: [mk('t1', 3, 'a'), mk('t2', 2, 'b'), mk('t3', 4, 'a'), mk('t4', 1, 'b')],
      trays: [{ key: 'a', label: 'Apple Tray (a)', emoji: '🍎' }, { key: 'b', label: 'Banana Tray (b)', emoji: '🍌' }]
    },
    {
      id: 2, kind: 'sort', icon: '✏️', title: 'Activity 2: School Shop Inventory (Story Slide 2)',
      desc: ' ✏️ The School Supply Counter is sorting 5x − 2y − 3x + 4y + 6 − 1 (x = pencils, y = erasers, 1 = coin constants). Keep each sign with its term while grouping!',
      terms: [mk('t1', 5, 'x'), mk('t2', -2, 'y'), mk('t3', -3, 'x'), mk('t4', 4, 'y'), mk('t5', 6, '1'), mk('t6', -1, '1')],
      trays: [{ key: 'x', label: 'Pencil Tray (x)', emoji: '✏️' }, { key: 'y', label: 'Eraser Tray (y)', emoji: '🧹' }, { key: '1', label: 'Coins Tray (1)', emoji: '🪙' }]
    },
    {
      id: 3, kind: 'sort', icon: '💎', title: 'Activity 3: Gem Vault Sorter (Story Slide 3 & 4)',
      desc: ' 🔷 The Gem Vault needs sorting: 2x² + 3x + 4 + x² − x − 1. Remember: large crystal clusters (x²) and single gems (x) are UNLIKE terms!',
      terms: [mk('t1', 2, 'x^2'), mk('t2', 3, 'x'), mk('t3', 4, '1'), mk('t4', 1, 'x^2'), mk('t5', -1, 'x'), mk('t6', -1, '1')],
      trays: [{ key: 'x^2', label: 'Cluster Tray (x²)', emoji: '🔷' }, { key: 'x', label: 'Single Gem Tray (x)', emoji: '💠' }, { key: '1', label: 'Coins Tray (1)', emoji: '🪙' }]
    }
  ],
  2: [
    {
      id: 1, kind: 'area', icon: '🧁', title: 'Activity 1: Bakery Gift Box Model (Story Slide 5)',
      desc: ' 🧁 Pack k gift boxes with (x cupcakes + c cookies). Predict the total items in k(x + c) then split the box to verify how the multiplier distributes to both items!',
      k: 3, c: 4
    },
    {
      id: 2, kind: 'flip', icon: '🛍️', title: 'Activity 2: Store Return Counter (Story Slide 6)',
      desc: ' 🛍️ Unpacking a returned combo box: 5 − (2x − 3). A minus sign outside a bracket flips EVERY item sign inside. Tap each item to flip its return sign!',
      lead: 5, inner: [{ c: 2, m: 'x' }, { c: -3, m: '1' }]
    },
    {
      id: 3, kind: 'machine', icon: '🎰', title: 'Activity 3: Catering Order Machine (Story Slide 5 & 7)',
      desc: ' 🎰 Dial batch order quantities for a(x + b) + c(x + d) to hit exact party catering targets. Expand and collect terms dynamically!',
      targets: ['5x + 10', '4x + 1', '7x − 2']
    }
  ],
  3: [
    {
      id: 1, kind: 'mistake', icon: '🕵️', title: 'Activity 1: Invoice Receipt Auditor (Story Slide 7)',
      desc: ' 🕵️ Detective Desk! A store clerk made an expansion mistake in 3(x + 4) − 2x. Tap the exact working line where the error happened, then enter the correct simplified total.',
      problem: '3(x + 4) − 2x',
      lines: ['3(x + 4) − 2x', '= 3x + 4 − 2x', '= x + 4'],
      errorLine: 1,
      errorWhy: 'The 3 must multiply BOTH x and 4 inside the bracket, so 3 × 4 = 12, not 4.',
      answer: 'x + 12',
      wrongAnswer: 'x + 4',
      hint: 'Expand properly: 3(x + 4) = 3x + 12. Then collect like terms: 3x − 2x + 12 = x + 12.'
    },
    {
      id: 2, kind: 'piece', icon: '🧩', title: 'Activity 2: Cargo Ship Missing Crate',
      desc: ' 🧩 A cargo shipment needs completing: (5x + 3y) + (?) = 8x + y − 1. Work out what missing container expression balances the total cargo.',
      answer: '3x - 2y - 1',
      placeholder: 'Type missing container (e.g. 3x - 2y - 1)',
      hint: 'Subtract: (8x + y − 1) − (5x + 3y). Subtract the x terms, the y terms, then the constant.',
      successText: 'The missing cargo container expression is 3x − 2y − 1.',
      diagnose: [
        { when: '13x + 4y - 1', text: 'You added instead of subtracting. The missing piece is what you ADD to 5x + 3y to reach the total.' },
        { when: '3x + 2y - 1', text: 'Check the y terms: 3y plus what gives 1y? It is −2y, not +2y.' }
      ]
    },
    {
      id: 3, kind: 'fence', icon: '🌷', title: 'Activity 3: Garden Fence Construction (Story Slide 7)',
      desc: ' 🌷 Fencing a rectangular flower garden that is (4x + 3) metres long and (x + 2) metres wide. Calculate the total perimeter P in simplest form!',
      answer: '10x + 10',
      placeholder: 'Type total perimeter (e.g. 10x + 10)',
      hint: 'Perimeter P = 2 × (length + width) = 2(4x + 3 + x + 2). Collect like terms inside first!',
      successText: 'P = 2(5x + 5) = 10x + 10 metres of fence required.',
      diagnose: [
        { when: '5x + 5', text: 'That is only HALF the perimeter (length + width). Perimeter goes all the way around, so double it!' },
        { when: '8x + 4', text: 'You doubled only the length. Both length AND width appear twice around a rectangle.' }
      ]
    }
  ]
};

const STATIONS = [
  { n: 1, icon: '🧺', title: 'Station 1: Item & Tile Sorter', sub: 'School shop & fruit market sorting' },
  { n: 2, icon: '🧁', title: 'Station 2: Bakery & Combo Lab', sub: 'Gift boxes, sign flips & dials' },
  { n: 3, icon: '🕵️', title: 'Station 3: Garden & Detective', sub: 'Invoice audit & fence perimeter' }
];

export function SimulatePhase({ muted, onNext }) {
  const [station, setStation] = useState(1);
  const [actIdx, setActIdx] = useState(0);
  const [solved, setSolved] = useState({});

  const currentActivity = STATION_ACTIVITIES[station][actIdx];
  const key = `${station}-${actIdx}`;

  useEffect(() => {
    narrate(simActivityNarration(station, actIdx), !muted);
    return () => stopNarration();
  }, [station, actIdx, muted]);

  const markSolved = () => {
    setSolved(s => ({ ...s, [key]: true }));
    playSfx('win');
    narrate(simSuccessNarration(), !muted);
  };
  const notifyRetry = () => {
    playSfx('bad');
    narrate(simRetryNarration(), !muted);
  };

  const nextActivity = () => {
    if (actIdx < 2) {
      setActIdx(i => i + 1);
    } else if (station < 3) {
      setStation(s => s + 1);
      setActIdx(0);
    } else {
      onNext();
    }
  };

  const prevActivity = () => {
    if (actIdx > 0) {
      setActIdx(i => i - 1);
    } else if (station > 1) {
      setStation(s => s - 1);
      setActIdx(2);
    }
  };

  const stationDone = n => [0, 1, 2].every(i => solved[`${n}-${i}`]);
  const a = currentActivity;

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-2 sm:p-5 relative overflow-hidden select-none z-10">
      <BgSymbols />

      {/* Main Simulation Stations Container — Overflow Auto prevents clipping without decreasing font size */}
      <div className="w-full max-w-6xl max-h-[94vh] bg-[#160b36]/95 border-2 border-purple-400/40 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md flex flex-col items-center fade-in-up z-20 my-auto overflow-y-auto">
        {/* Accent Bar */}
        <div className="w-28 h-2 bg-gradient-to-r from-cyan-400 via-amber-300 to-cyan-400 rounded-full mb-2 shadow-[0_0_20px_rgba(56,189,248,0.9)] shrink-0" />

        {/* Card Header Title */}
        <div className="flex flex-wrap items-center justify-between w-full mb-3 shrink-0 px-2 gap-2">
          <h2 className="font-display font-900 text-2xl sm:text-3xl text-white flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">🧪</span>
            <span>Real-World Simulation Stations</span>
          </h2>
          <span className="text-xs sm:text-sm font-extrabold text-slate-200 bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
            Aligned with Story Phase · Grade 7 Friendly
          </span>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 w-full items-stretch flex-1 min-h-0">
          {/* Left Column: Station Sidebar Tabs */}
          <div className="md:col-span-4 flex flex-col justify-between gap-3 shrink-0">
            <div className="flex flex-col gap-3">
              {STATIONS.map(st => (
                <button
                  key={st.n}
                  onClick={() => {
                    setStation(st.n);
                    setActIdx(0);
                  }}
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all duration-200 cursor-pointer ${
                    station === st.n
                      ? 'border-cyan-400 bg-[#1e2852] text-white shadow-[0_0_24px_rgba(56,189,248,0.45)] scale-[1.02]'
                      : 'border-purple-500/25 bg-[#13082b]/80 text-slate-300 hover:border-cyan-400/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 ${
                      station === st.n ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50' : 'bg-white/10 text-white'
                    }`}>
                      {st.icon}
                    </div>
                    <div>
                      <p className="font-display font-900 text-base sm:text-lg leading-tight">{st.title}</p>
                      <p className="text-xs font-extrabold text-slate-300 mt-0.5">{st.sub}</p>
                    </div>
                  </div>
                  <span className="text-lg">{stationDone(st.n) ? '✅' : '🔓'}</span>
                </button>
              ))}
            </div>

            {/* Bottom Left CTA Button */}
            <button
              onClick={onNext}
              className="btn-gold font-display font-900 text-base sm:text-lg py-3.5 px-6 shadow-[0_0_25px_rgba(250,204,21,0.7)] hover:scale-105 transition mt-2 w-full flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>Go to Practice Phase!</span>
              <span>→</span>
            </button>
          </div>

          {/* Right Column: Interactive Real-World Simulation Box */}
          <div className="md:col-span-8 bg-[#13092e]/95 border-2 border-purple-400/35 rounded-3xl p-4 sm:p-6 flex flex-col justify-between shadow-inner flex-1 min-h-0 overflow-y-auto">
            <div className="flex flex-col flex-1 min-h-0 justify-start gap-3">
              {/* Header Row */}
              <div className="flex flex-wrap items-center justify-between border-b border-white/15 pb-2.5 shrink-0 gap-2">
                <h3 className="font-display font-900 text-xl sm:text-2xl text-cyan-300 flex items-center gap-2.5">
                  <span className="text-2xl sm:text-3xl">{a.icon}</span>
                  <span>{a.title}</span>
                </h3>
                <span className="font-display font-900 text-xs sm:text-sm text-slate-200 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                  {solved[key] ? '✅ Solved · ' : ''}Activity {actIdx + 1} of 3
                </span>
              </div>

              {/* Activity Description */}
              <p className="text-slate-100 text-sm sm:text-base leading-relaxed font-extrabold shrink-0 bg-white/5 p-3 rounded-2xl border border-white/10">
                {a.desc}
              </p>

              {/* Interactive lab for this activity — smooth internal scrolling if needed */}
              <div key={key} className="flex flex-col items-center gap-4 bg-[#1e1342]/95 border-2 border-cyan-400/40 rounded-2xl p-4 sm:p-5 shadow-xl flex-1 min-h-0 justify-start overflow-y-auto">
                {a.kind === 'sort' && <SortLab cfg={a} onSolved={markSolved} />}
                {a.kind === 'area' && <AreaLab cfg={a} onSolved={markSolved} />}
                {a.kind === 'flip' && <FlipLab cfg={a} onSolved={markSolved} />}
                {a.kind === 'machine' && <MachineLab cfg={a} onSolved={markSolved} />}
                {a.kind === 'mistake' && <MistakeLab cfg={a} onSolved={markSolved} onRetry={notifyRetry} />}
                {(a.kind === 'piece' || a.kind === 'fence') && <AnswerLab cfg={a} onSolved={markSolved} onRetry={notifyRetry} />}
              </div>
            </div>

            {/* Bottom Activity Step Buttons */}
            <div className="flex items-center justify-between border-t border-white/15 pt-3.5 mt-3 shrink-0">
              <button
                onClick={prevActivity}
                disabled={station === 1 && actIdx === 0}
                className="bg-[#1c0d3a]/90 hover:bg-[#2c1859] border-2 border-white/25 text-white font-display font-900 text-sm sm:text-base px-5 py-2 rounded-full cursor-pointer transition disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
              >
                ← Previous Activity
              </button>

              <button
                onClick={nextActivity}
                className="btn-gold text-sm sm:text-base font-900 px-7 py-2 rounded-full flex items-center gap-2 shadow-lg hover:scale-105 transition cursor-pointer"
              >
                <span>{station === 3 && actIdx === 2 ? 'Go to Practice Phase' : 'Next Activity'}</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
