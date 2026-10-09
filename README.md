# Simplifying Expressions Quest · Grade 8 (MOE)

Same architecture, UI/UX, viewport, colours and audio pipeline as the Circumference module — new content.

## Run
```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build -> dist/
```

## Audio (ElevenLabs "Alice")
The key is already in `.env.local` (`VITE_ELEVENLABS_API_KEY`).

```bash
npm run audio         # pre-generate all 27 narration lines -> public/assets/audio + src/utils/audioMap.js
npm run audio:check   # verifies narration.js and generate_audio.js are in sync
npm run audio:clean   # removes orphaned mp3 files
```
Until you run `npm run audio`, the engine generates each line live (proxy → direct ElevenLabs call, cached for the
session) and falls back to browser speech. After running it, playback is instant from static mp3s.
Full pipeline details: `audio_generation_pipeline.md`.

## Where things live
| What | File |
|---|---|
| Story slides (text) | `src/stages/StoryPhase.jsx` — images in `public/assets/images/slide1-8.png` |
| Spoken scripts | `src/utils/narration.js` (+ phrase list in `scripts/generate_audio.js`) |
| Simulation stations & activities | `src/stages/SimulatePhase.jsx` (config) + `src/components/SimLabs.jsx` (interactions) |
| Practice questions (10 worlds) | `src/mathData.js` |
| Answer checking / algebra | `src/algebra.js` |
