/* scripts/clean_audio.js — deletes any .mp3 in public/assets/audio that is no longer referenced by audioMap.js */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { audioMap } from '../src/utils/audioMap.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const AUDIO_DIR = path.join(ROOT, 'public', 'assets', 'audio');

const valid = new Set(Object.values(audioMap).map(p => path.basename(p)));
let removed = 0;
if (fs.existsSync(AUDIO_DIR)) {
  for (const f of fs.readdirSync(AUDIO_DIR)) {
    if (f.endsWith('.mp3') && !valid.has(f)) {
      fs.unlinkSync(path.join(AUDIO_DIR, f));
      removed++;
      console.log('🗑️  removed orphan', f);
    }
  }
}
console.log(`✅ Clean. Removed ${removed} orphaned file(s). ${valid.size} active.`);
