import React, { useState, useEffect } from 'react';
import { BgSymbols } from '../components/TopNav.jsx';
import { narrate, stopNarration } from '../utils/audio.js';
import { storyNarration } from '../utils/narration.js';

const STORY_SLIDES = [
  {
    id: 1,
    title: "Algebra Is Everywhere",
    image: "/assets/images/slide1.png",
    body: "A school shop sells pencils for $p each and erasers for $e each. Buying 3 pencils and 2 erasers costs 3p + 2e dollars. That is an algebraic expression: letters and numbers joined by + and − signs, with no equals sign!",
    quote: "An expression is a phrase, not a sentence: it has no equals sign.",
    bubble: "Let's learn how to tidy expressions up!"
  },
  {
    id: 2,
    title: "Terms, Coefficients & Constants",
    image: "/assets/images/slide2.png",
    body: "Look at 5x + 3y − 7. Each part is a term. The number multiplying a letter is its coefficient: 5 is the coefficient of x. A number on its own, like −7, is a constant. The sign in front belongs to its term!",
    quote: "Terms are separated by + and − signs, and each sign travels with its term.",
    bubble: "Coefficient = the number in front. Constant = the number alone!"
  },
  {
    id: 3,
    title: "Like Terms vs Unlike Terms",
    image: "/assets/images/slide3.png",
    body: "Like terms have exactly the same letters with the same powers. 3x and 5x are like terms. But 3x and 3y are unlike, and so are 3x and 3x². It's like counting apples with apples, never apples with bananas!",
    quote: "Only LIKE terms can be added or subtracted.",
    bubble: "Same letter, same power — that's the secret test!"
  },
  {
    id: 4,
    title: "Collecting Like Terms",
    image: "/assets/images/slide4.png",
    body: "To simplify 7x + 3y − 2x + 5y, group the like terms: (7x − 2x) + (3y + 5y). Add the coefficients and keep the letter: 5x + 8y. Fewer terms, exactly the same value!",
    quote: "7x + 3y − 2x + 5y = 5x + 8y",
    bubble: "Add the coefficients, keep the letter the same!"
  },
  {
    id: 5,
    title: "Expanding Brackets: The Distributive Law",
    image: "/assets/images/slide5.png",
    body: "A number outside a bracket multiplies EVERY term inside it. This is the distributive law: a(b + c) = ab + ac. For example, 3(x + 4) = 3x + 12.",
    quote: "3(x + 4) = 3x + 12 — multiply EVERY term!",
    bubble: "Think of the number handing one gift to each term inside!"
  },
  {
    id: 6,
    title: "Negative Signs & Brackets",
    image: "/assets/images/slide6.png",
    body: "A minus sign in front of a bracket flips every sign inside it. −(2x − 5) = −2x + 5. And 4 − 2(x + 1) = 4 − 2x − 2 = −2x + 2.",
    quote: "A minus outside a bracket flips EVERY sign inside.",
    bubble: "Watch out: the minus changes the last term too!"
  },
  {
    id: 7,
    title: "Expand, Then Collect",
    image: "/assets/images/slide7.png",
    body: "Let's simplify 3(x + 2) + 2(x − 4). Expand first: 3x + 6 + 2x − 8. Then collect like terms: 5x − 2. Expand, collect, done!",
    quote: "Step 1: Expand the brackets. Step 2: Collect like terms.",
    bubble: "Two simple steps beat any messy expression!"
  },
  {
    id: 8,
    title: "Step Into the Simulation Lab!",
    image: "/assets/images/slide8.png",
    body: "Awesome job! You can now spot terms, find like terms, collect them, and expand brackets. Next, step into the lab to sort tiles, dial the expand machine, and play detective with tricky expressions!",
    quote: "Ready to simplify like a pro?",
    bubble: "Click below to enter the interactive lab!"
  }
];

export function StoryPhase({ muted, onDone, onSlideChange }) {
  const [slideIdx, setSlideIdx] = useState(0);
  const slide = STORY_SLIDES[slideIdx];

  useEffect(() => {
    if (onSlideChange) {
      onSlideChange(slideIdx + 1, STORY_SLIDES.length);
    }
    narrate(storyNarration(slideIdx), !muted);
    return () => stopNarration();
  }, [slideIdx, muted, onSlideChange]);

  const goNext = () => {
    if (slideIdx < STORY_SLIDES.length - 1) {
      setSlideIdx(i => i + 1);
    } else {
      onDone();
    }
  };

  const goPrev = () => {
    if (slideIdx > 0) setSlideIdx(i => i - 1);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-3 sm:p-5 relative overflow-hidden select-none z-10">
      <BgSymbols />

      {/* Main Story Card with Maximum Grade 4 Visual Legibility & Scaled Image */}
      <div className="w-full max-w-5xl max-h-[92vh] bg-[#160b36]/95 border-2 border-purple-400/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 items-center fade-in-up z-20 my-auto overflow-hidden">
        {/* Left Column: Extra Large Image Illustration */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 h-80 sm:h-[420px] md:h-[450px] w-full bg-black/40 flex items-center justify-center shrink-0">
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover rounded-3xl hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Right Column: Extra Large Typography & Callout Pills */}
        <div className="flex flex-col items-start text-left justify-center gap-4.5 overflow-y-auto max-h-full py-1">
          {/* Slide Title */}
          <h2 className="font-display font-900 text-3xl sm:text-4xl md:text-5xl text-amber-400 leading-tight drop-shadow-md">
            {slide.title}
          </h2>

          {/* Body Narrative */}
          <p className="text-slate-100 text-xl sm:text-2xl leading-relaxed font-extrabold drop-shadow-sm">
            {slide.body}
          </p>

          {/* Pull-Quote Sparkle Pill */}
          <div className="w-full bg-[#1e0e45] border-2 border-amber-400/60 rounded-2xl px-6 py-3.5 text-center text-amber-300 font-display font-900 text-lg sm:text-xl flex items-center justify-center gap-3 shadow-lg">
            <span className="shrink-0 text-2xl">✨</span>
            <span className="leading-snug">"{slide.quote}"</span>
            <span className="shrink-0 text-2xl">✨</span>
          </div>

          {/* Mascot Speech Bubble Pill */}
          <div className="flex items-center gap-4 w-full mt-1">
            <div className="w-16 h-16 rounded-full bg-amber-400 flex items-center justify-center text-4xl shadow-lg shrink-0">
              🦁
            </div>
            <div className="bg-white text-[#0c031d] rounded-2xl px-7 py-3.5 font-display font-900 text-lg sm:text-xl shadow-xl flex-1 text-left leading-snug">
              {slide.bubble}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Row: Back, Dots, Next */}
      <div className="w-full max-w-4xl flex items-center justify-between mt-3 z-20 shrink-0">
        <button
          onClick={goPrev}
          disabled={slideIdx === 0}
          className="bg-[#1c0d3a]/90 hover:bg-[#2c1859] border-2 border-white/30 text-white font-display font-900 text-xl sm:text-2xl px-10 py-4 rounded-full cursor-pointer transition disabled:opacity-30 disabled:cursor-not-allowed shadow-xl hover:scale-105"
        >
          ← Back
        </button>

        {/* Dots Indicator */}
        <div className="flex items-center gap-3.5">
          {STORY_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIdx(i)}
              className={`rounded-full transition-all cursor-pointer ${
                i === slideIdx
                  ? 'w-4.5 h-4.5 bg-amber-400 shadow-[0_0_18px_rgba(250,204,21,0.9)]'
                  : 'w-3.5 h-3.5 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          className="btn-gold text-xl sm:text-2xl px-11 py-4 font-900 flex items-center gap-2 shadow-[0_0_35px_rgba(250,204,21,0.85)] hover:scale-105"
        >
          <span>{slideIdx === STORY_SLIDES.length - 1 ? 'Enter Lab 🧪' : 'Next'}</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
