/* =========================================================================
   NARRATION SCRIPTS — maps each lesson phase to its spoken lines.
   Rules (see audio_generation_pipeline.md):
     • ONLY paragraph text and questions are narrated — NEVER titles/headings.
     • Math is written the way it is SPOKEN ("3 x plus 2 y") so the voice reads it naturally.
     • Every text here is also listed in scripts/generate_audio.js (npm run audio:check verifies this).
   ========================================================================= */
import { say, ask, cheer, emphasize, celebrate, instruct, think } from './audio.js';

/* ---------- 01 · WONDER ---------- */
export function wonderNarration() {
  return [
    say("Zara's robot wrote a messy expression on the board: 7 x plus 3 y minus 2 x plus 5 minus y plus 4 x minus 3 plus 2 y minus x. That is nine terms! Simplified, it becomes just 8 x plus 4 y plus 2. Same value, far fewer terms!"),
    ask('How can we tidy up a messy expression without changing its value?')
  ];
}

/* ---------- 02 · STORY (one script per slide, index 0-7) ---------- */
const STORY_LINES = [
  say('A school shop sells pencils for p dollars each and erasers for e dollars each. Buying 3 pencils and 2 erasers costs 3 p plus 2 e dollars. That is an algebraic expression: letters and numbers joined by plus and minus signs, with no equals sign!'),
  emphasize('Look at 5 x plus 3 y minus 7. Each part is called a term. The number multiplying a letter is its coefficient, so 5 is the coefficient of x. A number on its own, like negative 7, is a constant. And the sign in front always belongs to its term!'),
  emphasize('Like terms have exactly the same letters with the same powers. 3 x and 5 x are like terms. But 3 x and 3 y are unlike, and so are 3 x and 3 x squared. It is like counting apples with apples, never apples with bananas!'),
  say('To simplify 7 x plus 3 y minus 2 x plus 5 y, group the like terms. 7 x minus 2 x is 5 x, and 3 y plus 5 y is 8 y. So the answer is 5 x plus 8 y. Fewer terms, exactly the same value!'),
  emphasize('A number outside a bracket multiplies every term inside it. This is the distributive law: a times, b plus c, equals a b plus a c. For example, 3 times, x plus 4, equals 3 x plus 12.'),
  emphasize('A minus sign in front of a bracket flips every sign inside it. Negative, 2 x minus 5, in brackets, equals negative 2 x plus 5. And 4 minus 2 times, x plus 1, equals 4 minus 2 x minus 2, which simplifies to negative 2 x plus 2.'),
  instruct('Let us simplify 3 times, x plus 2, plus 2 times, x minus 4. Expand first: 3 x plus 6 plus 2 x minus 8. Then collect like terms: 5 x minus 2. Expand, collect, done!'),
  celebrate('Awesome job! You can now spot terms, find like terms, collect them, and expand brackets. Next, step into the lab to sort tiles, dial the expand machine, and play detective with tricky expressions!')
];
export const storyNarration = idx => [STORY_LINES[idx]];

/* ---------- 03 · SIMULATE (one description per activity: station 1-3, activity 0-2) ---------- */
const SIM_LINES = {
  1: [
    say("Zara's fruit stall has 3 a plus 2 b plus 4 a plus b, where a is apples and b is bananas. Tap a term, then tap the tray where it belongs. Like terms must share a tray!"),
    say('The Robot Workshop is recycling parts: 5 x minus 2 y minus 3 x plus 4 y plus 6 minus 1. Careful! Each term keeps its sign when you move it. Sort them into the x tray, the y tray and the number tray!'),
    say('Deep in the crystal cave: 2 x squared plus 3 x plus 4 plus x squared minus x minus 1. Remember, x squared and x are NOT like terms! Sort every crystal into the right tray.')
  ],
  2: [
    say('Build a rectangle that is x plus c wide and k tall. Use the buttons to choose k and c, then split the rectangle to see the two areas. Spot the pattern in k times, x plus c!'),
    say('Expand 5 minus, 2 x minus 3. The minus sign outside the bracket flips every sign inside. Tap each term in the bracket to flip its sign, then collect the like terms!'),
    say('The Simplify Machine works out a times, x plus b, plus c times, x plus d. Turn the dials to build an expression whose output matches the target. There is more than one way to win!')
  ],
  3: [
    say('Detective Desk! Someone made a mistake in this solution. Tap the line where the first error happens, then type the correct answer.'),
    say('A puzzle piece is missing! 5 x plus 3 y, plus the missing piece, equals 8 x plus y minus 1. Work out the missing expression and type it in.'),
    say('Zara is fencing a rectangular garden that is 4 x plus 3 metres long and x plus 2 metres wide. Find the perimeter in simplest form.')
  ]
};
export const simActivityNarration = (station, actIdx) => [SIM_LINES[station][actIdx]];
export const simSuccessNarration = () => [cheer('Awesome! You solved it!')];
export const simRetryNarration = () => [instruct('Not quite yet. Check the signs and try again!')];

/* ---------- 04 · PRACTICE feedback ---------- */
export const practiceCorrectNarration = () => [cheer('Correct! Great simplifying!')];
export const practiceWrongNarration = () => [instruct('Not quite! Read the explanation and keep going.')];

/* ---------- 05 · REFLECT ---------- */
export function reflectQuestionNarration() {
  return [
    say('Great work completing the module!'),
    think('What did you learn about simplifying expressions? Explain it to Robo with an example!')
  ];
}
export const reflectDoneNarration = () => [cheer('Outstanding reflection! Lesson complete!')];
export const celebrationNarration = () => [
  cheer("Congratulations! You've mastered terms, like terms, brackets, and simplifying expressions!")
];

/* ---------- every phrase (used by scripts/check_audio.js) ---------- */
export const ALL_NARRATION = [
  ...wonderNarration(),
  ...STORY_LINES,
  ...Object.values(SIM_LINES).flat(),
  ...simSuccessNarration(),
  ...simRetryNarration(),
  ...practiceCorrectNarration(),
  ...practiceWrongNarration(),
  ...reflectQuestionNarration(),
  ...reflectDoneNarration(),
  ...celebrationNarration()
];
