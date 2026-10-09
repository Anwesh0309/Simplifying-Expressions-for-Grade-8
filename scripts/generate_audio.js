/* =========================================================================
   scripts/generate_audio.js — OFFLINE narration generator (ElevenLabs "Alice")
   Usage:   npm run audio            (skips files that already exist)
            node scripts/generate_audio.js --force   (regenerate everything)

   • Reads the `phrases` array below (exact text + intended style).
   • Applies per-style ElevenLabs voice settings.
   • Calls ElevenLabs text-to-speech with VITE_ELEVENLABS_API_KEY from .env.local.
   • Saves mp3s into public/assets/audio/ with slugified filenames.
   • Rewrites src/utils/audioMap.js automatically.
   • Rate-limited: 500ms between API calls.

   ONLY paragraph text and questions go here — NEVER titles or headings.
   Keep this list in sync with src/utils/narration.js (run `npm run audio:check`).
   ========================================================================= */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const AUDIO_DIR = path.join(ROOT, 'public', 'assets', 'audio');
const MAP_FILE = path.join(ROOT, 'src', 'utils', 'audioMap.js');

export const VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2'; // Alice
export const MODEL_ID = 'eleven_multilingual_v2';

export const VOICE_SETTINGS = {
  celebration:   { stability: 0.12, similarity_boost: 0.45, style: 0.75, use_speaker_boost: true },
  encouragement: { stability: 0.16, similarity_boost: 0.50, style: 0.65, use_speaker_boost: true },
  question:      { stability: 0.20, similarity_boost: 0.55, style: 0.55, use_speaker_boost: true },
  emphasis:      { stability: 0.16, similarity_boost: 0.50, style: 0.60, use_speaker_boost: true },
  thinking:      { stability: 0.24, similarity_boost: 0.60, style: 0.35, use_speaker_boost: true },
  statement:     { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true }
};

export const phrases = [
  { text: "Zara's robot wrote a messy expression on the board: 7 x plus 3 y minus 2 x plus 5 minus y plus 4 x minus 3 plus 2 y minus x. That is nine terms! Simplified, it becomes just 8 x plus 4 y plus 2. Same value, far fewer terms!", style: 'statement' },
  { text: "How can we tidy up a messy expression without changing its value?", style: 'question' },
  { text: "A school shop sells pencils for p dollars each and erasers for e dollars each. Buying 3 pencils and 2 erasers costs 3 p plus 2 e dollars. That is an algebraic expression: letters and numbers joined by plus and minus signs, with no equals sign!", style: 'statement' },
  { text: "Look at 5 x plus 3 y minus 7. Each part is called a term. The number multiplying a letter is its coefficient, so 5 is the coefficient of x. A number on its own, like negative 7, is a constant. And the sign in front always belongs to its term!", style: 'emphasis' },
  { text: "Like terms have exactly the same letters with the same powers. 3 x and 5 x are like terms. But 3 x and 3 y are unlike, and so are 3 x and 3 x squared. It is like counting apples with apples, never apples with bananas!", style: 'emphasis' },
  { text: "To simplify 7 x plus 3 y minus 2 x plus 5 y, group the like terms. 7 x minus 2 x is 5 x, and 3 y plus 5 y is 8 y. So the answer is 5 x plus 8 y. Fewer terms, exactly the same value!", style: 'statement' },
  { text: "A number outside a bracket multiplies every term inside it. This is the distributive law: a times, b plus c, equals a b plus a c. For example, 3 times, x plus 4, equals 3 x plus 12.", style: 'emphasis' },
  { text: "A minus sign in front of a bracket flips every sign inside it. Negative, 2 x minus 5, in brackets, equals negative 2 x plus 5. And 4 minus 2 times, x plus 1, equals 4 minus 2 x minus 2, which simplifies to negative 2 x plus 2.", style: 'emphasis' },
  { text: "Let us simplify 3 times, x plus 2, plus 2 times, x minus 4. Expand first: 3 x plus 6 plus 2 x minus 8. Then collect like terms: 5 x minus 2. Expand, collect, done!", style: 'encouragement' },
  { text: "Awesome job! You can now spot terms, find like terms, collect them, and expand brackets. Next, step into the lab to sort tiles, dial the expand machine, and play detective with tricky expressions!", style: 'celebration' },
  { text: "Zara's fruit stall has 3 a plus 2 b plus 4 a plus b, where a is apples and b is bananas. Tap a term, then tap the tray where it belongs. Like terms must share a tray!", style: 'statement' },
  { text: "The Robot Workshop is recycling parts: 5 x minus 2 y minus 3 x plus 4 y plus 6 minus 1. Careful! Each term keeps its sign when you move it. Sort them into the x tray, the y tray and the number tray!", style: 'statement' },
  { text: "Deep in the crystal cave: 2 x squared plus 3 x plus 4 plus x squared minus x minus 1. Remember, x squared and x are NOT like terms! Sort every crystal into the right tray.", style: 'statement' },
  { text: "Build a rectangle that is x plus c wide and k tall. Use the buttons to choose k and c, then split the rectangle to see the two areas. Spot the pattern in k times, x plus c!", style: 'statement' },
  { text: "Expand 5 minus, 2 x minus 3. The minus sign outside the bracket flips every sign inside. Tap each term in the bracket to flip its sign, then collect the like terms!", style: 'statement' },
  { text: "The Simplify Machine works out a times, x plus b, plus c times, x plus d. Turn the dials to build an expression whose output matches the target. There is more than one way to win!", style: 'statement' },
  { text: "Detective Desk! Someone made a mistake in this solution. Tap the line where the first error happens, then type the correct answer.", style: 'statement' },
  { text: "A puzzle piece is missing! 5 x plus 3 y, plus the missing piece, equals 8 x plus y minus 1. Work out the missing expression and type it in.", style: 'statement' },
  { text: "Zara is fencing a rectangular garden that is 4 x plus 3 metres long and x plus 2 metres wide. Find the perimeter in simplest form.", style: 'statement' },
  { text: "Awesome! You solved it!", style: 'celebration' },
  { text: "Not quite yet. Check the signs and try again!", style: 'encouragement' },
  { text: "Correct! Great simplifying!", style: 'celebration' },
  { text: "Not quite! Read the explanation and keep going.", style: 'encouragement' },
  { text: "Great work completing the module!", style: 'statement' },
  { text: "What did you learn about simplifying expressions? Explain it to Robo with an example!", style: 'thinking' },
  { text: "Outstanding reflection! Lesson complete!", style: 'celebration' },
  { text: "Congratulations! You've mastered terms, like terms, brackets, and simplifying expressions!", style: 'celebration' },
];

/* ---------- helpers ---------- */
function loadKey() {
  if (process.env.VITE_ELEVENLABS_API_KEY) return process.env.VITE_ELEVENLABS_API_KEY;
  for (const f of ['.env.local', '.env']) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) continue;
    const m = fs.readFileSync(p, 'utf8').match(/^\s*VITE_ELEVENLABS_API_KEY\s*=\s*(.+)\s*$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  return '';
}

export function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 50);
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function synth(text, style, key) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'audio/mpeg', 'xi-api-key': key },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: VOICE_SETTINGS[style] || VOICE_SETTINGS.statement
      })
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if (res.status === 429 || res.status >= 500) {
      await sleep(1500 * attempt);
      continue;
    }
    throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  throw new Error('ElevenLabs: too many retries');
}

function writeAudioMap() {
  const map = {};
  phrases.forEach((p, i) => {
    const file = `audio_${slugify(p.text)}_${i}.mp3`;
    if (fs.existsSync(path.join(AUDIO_DIR, file))) map[p.text] = `/assets/audio/${file}`;
  });
  const body =
    `/* AUTO-GENERATED by scripts/generate_audio.js — do not edit by hand.\n` +
    `   Key = exact spoken text, Value = static mp3 path. */\n` +
    `export const audioMap = ${JSON.stringify(map, null, 2)};\n`;
  fs.writeFileSync(MAP_FILE, body);
  return Object.keys(map).length;
}

async function main() {
  const force = process.argv.includes('--force');
  const key = loadKey();
  if (!key) {
    console.error('❌ Missing VITE_ELEVENLABS_API_KEY (put it in .env.local)');
    process.exit(1);
  }
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
  let made = 0, skipped = 0, failed = 0;
  for (let i = 0; i < phrases.length; i++) {
    const { text, style } = phrases[i];
    const file = `audio_${slugify(text)}_${i}.mp3`;
    const out = path.join(AUDIO_DIR, file);
    if (!force && fs.existsSync(out)) { skipped++; continue; }
    try {
      process.stdout.write(`🎙️  [${i + 1}/${phrases.length}] ${style.padEnd(13)} ${text.slice(0, 60)}…\n`);
      fs.writeFileSync(out, await synth(text, style, key));
      made++;
    } catch (e) {
      failed++;
      console.error('   ⚠️  failed:', e.message);
    }
    await sleep(500); // rate limit
  }
  const mapped = writeAudioMap();
  console.log(`\n✅ Done. generated ${made}, skipped ${skipped}, failed ${failed}. audioMap.js now lists ${mapped}/${phrases.length} phrases.`);
  if (failed) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
