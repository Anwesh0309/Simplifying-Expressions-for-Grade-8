import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { BgSymbols } from '../components/TopNav.jsx';
import { narrate, stopNarration, playSfx } from '../utils/audio.js';
import { reflectQuestionNarration, reflectDoneNarration, celebrationNarration } from '../utils/narration.js';
import { PRACTICE_WORLDS } from '../mathData.js';

export function ReflectPhase({ xp, stars, bestStreak, worldResults, muted, onComplete }) {
  const [reflectionText, setReflectionText] = useState('');
  const minLength = 10;

  useEffect(() => {
    narrate(reflectQuestionNarration(), !muted);
    return () => stopNarration();
  }, [muted]);

  const handleSubmit = () => {
    playSfx('win');
    narrate(reflectDoneNarration(), !muted);
    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}
    onComplete();
  };

  const charCount = reflectionText.trim().length;

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-3 sm:p-5 relative overflow-hidden select-none z-10">
      <BgSymbols />

      {/* Main Glass Card Frame with Scaled Up Grade 4 Typography */}
      <div className="w-full max-w-4xl max-h-[94vh] bg-[#160b38]/95 border-2 border-purple-400/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md flex flex-col items-center fade-in-up z-20 my-auto overflow-hidden">
        
        {/* Glowing Accent Line */}
        <div className="w-24 h-2 bg-purple-400 rounded-full mb-3 shadow-[0_0_18px_rgba(168,85,247,0.85)] shrink-0" />

        {/* Main Title */}
        <h2 className="font-display font-900 text-3xl sm:text-4xl text-white mb-5 flex items-center gap-3 shrink-0">
          <span className="text-4xl sm:text-5xl">🏆</span>
          <span>Reflect & Scoreboard</span>
        </h2>

        {/* Top 3 Score Cards (Total XP | Stars | Best Streak) */}
        <div className="grid grid-cols-3 gap-4.5 w-full mb-5 shrink-0">
          {/* Card 1: Total XP */}
          <div className="bg-[#1a0e42]/95 border-2 border-purple-400/35 rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center shadow-lg">
            <span className="text-3xl mb-1">✨</span>
            <span className="font-display font-900 text-3xl sm:text-4xl text-amber-400 mb-0.5">{xp}</span>
            <span className="text-sm sm:text-base font-900 text-slate-200">Total XP</span>
          </div>

          {/* Card 2: Stars */}
          <div className="bg-[#1a0e42]/95 border-2 border-purple-400/35 rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center shadow-lg">
            <span className="text-3xl mb-1">⭐</span>
            <span className="font-display font-900 text-3xl sm:text-4xl text-amber-400 mb-0.5">{stars} / 30</span>
            <span className="text-sm sm:text-base font-900 text-slate-200">Stars</span>
          </div>

          {/* Card 3: Best Streak */}
          <div className="bg-[#1a0e42]/95 border-2 border-purple-400/35 rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center shadow-lg">
            <span className="text-3xl mb-1">🔥</span>
            <span className="font-display font-900 text-3xl sm:text-4xl text-amber-400 mb-0.5">{bestStreak}</span>
            <span className="text-sm sm:text-base font-900 text-slate-200">Best Streak</span>
          </div>
        </div>

        {/* WORLD RESULTS Section */}
        <div className="w-full flex flex-col items-center mb-4 shrink-0">
          <span className="text-sm font-900 text-amber-400 tracking-wider uppercase mb-2">
            WORLD RESULTS
          </span>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5 w-full">
            {PRACTICE_WORLDS.map((w, idx) => {
              const res = worldResults[idx];
              return (
                <div
                  key={w.id}
                  className="bg-[#1a0e42]/80 border-2 border-purple-400/30 rounded-xl p-2 sm:p-2.5 flex flex-col items-center justify-between text-center min-h-[60px] shadow-sm"
                >
                  <span className="text-xs sm:text-sm font-black text-slate-200">W{idx + 1}</span>
                  <span className="text-xs sm:text-sm font-900 text-amber-400 mt-1">
                    {res != null && res > 0 ? `${res}★` : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Horizontal Divider Line */}
        <div className="w-full border-t border-white/15 my-3 shrink-0" />

        {/* Bottom Reflection Section with Robo Avatar */}
        <div className="w-full flex items-start gap-4 mb-4 shrink-0">
          {/* Left Robo Avatar */}
          <div className="w-16 h-16 rounded-full bg-[#1e0e4a] border-2 border-cyan-400 flex items-center justify-center text-4xl shadow-lg shrink-0 mt-1">
            🤖
          </div>

          {/* Right Question Prompt & Textarea */}
          <div className="flex-1 flex flex-col text-left">
            <h3 className="font-display font-900 text-lg sm:text-xl text-white mb-2 leading-tight">
              What did you learn about simplifying expressions? Explain it to Robo with an example!
            </h3>

            <div className="w-full bg-[#0e0626] border-2 border-purple-400/40 rounded-2xl p-4 flex flex-col relative shadow-inner">
              <textarea
                rows="3"
                value={reflectionText}
                onChange={e => setReflectionText(e.target.value)}
                placeholder="Dear Robo, simplifying is when we..."
                className="w-full bg-transparent text-base sm:text-lg font-extrabold text-white placeholder-slate-400 outline-none resize-none font-sans"
              />
              <div className="text-xs font-black text-slate-300 text-right mt-1">
                {charCount} / {minLength} min chars
              </div>
            </div>
          </div>
        </div>

        {/* Complete Lesson Button */}
        <button
          disabled={charCount < minLength}
          onClick={handleSubmit}
          className="btn-gold font-display font-900 text-lg sm:text-xl px-10 py-3.5 rounded-full shadow-[0_0_25px_rgba(250,204,21,0.65)] hover:scale-105 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          Complete Lesson! 🎉
        </button>
      </div>
    </div>
  );
}

export function CelebrationScreen({ xp, stars, onRestart, muted }) {
  useEffect(() => {
    narrate(celebrationNarration(), !muted);
    try {
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
    } catch (e) {}
    return () => stopNarration();
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden select-none z-20 bg-[#0c0424]">
      <BgSymbols />

      <div className="w-full max-w-md glass-card flex flex-col items-center text-center fade-in-up z-30 my-auto py-6 px-6">
        <span className="text-5xl mb-2 animate-bounce">🎓🏆</span>

        <div className="bg-[#1c0d38] border border-amber-400/40 text-amber-300 text-xs font-bold px-4 py-1 rounded-full mb-2">
          Grade 8 Math Mastered!
        </div>

        <h1 className="font-display font-900 text-2xl sm:text-3xl text-white mb-2">
          Simplifying Expressions Quest Complete!
        </h1>

        <p className="text-slate-300 text-xs sm:text-sm mb-4 leading-relaxed">
          Congratulations! You've mastered terms, like terms, brackets, and simplifying expressions!
        </p>

        <div className="w-full bg-[#14082c] border border-white/10 rounded-2xl p-4 flex justify-around items-center mb-5">
          <div className="flex flex-col items-center">
            <span className="text-amber-400 font-display font-900 text-lg">{xp} XP</span>
            <span className="text-slate-400 text-[10px]">Total Score</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-amber-300 font-display font-900 text-lg">{stars} ⭐</span>
            <span className="text-slate-400 text-[10px]">Stars Earned</span>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="btn-gold text-xs px-8 py-3"
        >
          🔄 Play Module Again
        </button>
      </div>
    </div>
  );
}
