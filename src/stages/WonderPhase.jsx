import React, { useEffect } from 'react';
import { BgSymbols } from '../components/TopNav.jsx';
import { narrate, stopNarration } from '../utils/audio.js';
import { wonderNarration } from '../utils/narration.js';

export function WonderPhase({ muted, onNext }) {
  useEffect(() => {
    narrate(wonderNarration(), !muted);
    return () => stopNarration();
  }, [muted]);

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none z-10">
      <BgSymbols />

      <div className="w-full max-w-2xl glass-card flex flex-col items-center text-center fade-in-up z-20 my-auto">
        {/* Glowing Phase Band */}
        <div className="phase-band phase-band--wonder" />

        <div className="flex items-center gap-2 mb-2">
          <span className="text-3xl">🔍</span>
          <span className="text-purple-300 font-display font-800 text-xs sm:text-sm tracking-wider uppercase">
            Phase 1: Wonder & Curiosity
          </span>
        </div>

        <h2 className="text-main-heading text-purple-200 mb-3 max-w-xl">
          Can You Shrink a Messy Expression?
        </h2>

        {/* Feature Stat Box */}
        <div className="w-full bg-[#1e143c]/90 border border-purple-400/30 rounded-2xl p-4 sm:p-6 mb-4 flex flex-col items-center shadow-xl">
          <div className="text-number text-amber-300 text-4xl sm:text-6xl mb-1">
            9 Terms → 3 Terms!
          </div>
          <p className="text-body text-slate-200 max-w-lg">
            Zara's robot wrote <span className="text-amber-300 font-bold">7x + 3y − 2x + 5 − y + 4x − 3 + 2y − x</span> on the board. Simplified, it becomes just <span className="text-amber-300 font-bold">8x + 4y + 2</span> — same value, far fewer terms!
          </p>
        </div>

        {/* Mascot Thinking Bubble */}
        <div className="flex items-center gap-3 bg-[#14082c]/80 border border-purple-500/30 rounded-full px-5 py-2 mb-5">
          <div className="w-8 h-8 rounded-full bg-purple-500/30 text-purple-200 flex items-center justify-center font-bold text-sm shrink-0">
            🤖
          </div>
          <p className="text-slate-300 text-xs sm:text-sm font-semibold">
            How can we tidy up a messy expression without changing its value?
          </p>
        </div>

        <button onClick={onNext} className="btn-gold flex items-center gap-2">
          <span>Explore the Story</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
