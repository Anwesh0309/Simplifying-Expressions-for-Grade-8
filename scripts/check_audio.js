/* scripts/check_audio.js — verifies narration.js and generate_audio.js are in sync (no missing / stray phrases) */
import { ALL_NARRATION } from '../src/utils/narration.js';
import { phrases } from './generate_audio.js';
import { audioMap } from '../src/utils/audioMap.js';

const gen = new Map(phrases.map(p => [p.text, p.style]));
const used = new Map(ALL_NARRATION.map(s => [s.text, s.style]));
let bad = 0;
for (const [t, st] of used) {
  if (!gen.has(t)) { console.error('❌ in narration.js but NOT in generate_audio.js:', t.slice(0, 70)); bad++; }
  else if (gen.get(t) !== st) { console.error(`❌ style mismatch (${st} vs ${gen.get(t)}):`, t.slice(0, 70)); bad++; }
}
for (const t of gen.keys()) if (!used.has(t)) { console.warn('⚠️  in generate_audio.js but unused:', t.slice(0, 70)); }
const mapped = [...used.keys()].filter(t => audioMap[t]).length;
console.log(`${bad ? '❌' : '✅'} ${used.size} narrated phrases · ${mapped} pre-generated in audioMap.js ${mapped < used.size ? '(run `npm run audio` to pre-generate the rest)' : ''}`);
process.exit(bad ? 1 : 0);
