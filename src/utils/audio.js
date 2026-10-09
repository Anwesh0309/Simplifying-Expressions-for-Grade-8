/* =========================================================================
   AUDIO ENGINE — ElevenLabs "Alice" pipeline (see audio_generation_pipeline.md)
   Voice: Alice (Clear, Engaging Educator) — Voice ID: Xb7hH8MSUJpSbSDYk0k2
   Model: eleven_multilingual_v2
   ========================================================================= */
import { audioMap } from './audioMap.js';

export const VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2';
export const MODEL_ID = 'eleven_multilingual_v2';

const API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ELEVENLABS_API_KEY) ||
  'sk_1477a0b0a31e89b834b1e17ca4468c02a6e8bf554f621c5a';

/* ElevenLabs voice settings per style */
export const STYLE_SETTINGS = {
  celebration:   { stability: 0.12, similarity_boost: 0.45, style: 0.75, use_speaker_boost: true, rate: 1.06, pitch: 1.2 },
  encouragement: { stability: 0.16, similarity_boost: 0.50, style: 0.65, use_speaker_boost: true, rate: 1.0,  pitch: 1.1 },
  question:      { stability: 0.20, similarity_boost: 0.55, style: 0.55, use_speaker_boost: true, rate: 0.98, pitch: 1.08 },
  emphasis:      { stability: 0.16, similarity_boost: 0.50, style: 0.60, use_speaker_boost: true, rate: 0.95, pitch: 1.05 },
  thinking:      { stability: 0.24, similarity_boost: 0.60, style: 0.35, use_speaker_boost: true, rate: 0.90, pitch: 0.95 },
  statement:     { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true, rate: 1.0,  pitch: 1.0 }
};
STYLE_SETTINGS.instruction = STYLE_SETTINGS.statement;

export let audioMuted = false;
let ttsVoice = null;
let currentAudioElement = null;
let currentQueue = 0;

/* ---------- browser speech fallback ---------- */
function pickVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  return (
    voices.find(v => /female|alice|zira|samantha|victoria|google us english/i.test(v.name)) ||
    voices.find(v => v.lang && v.lang.startsWith('en')) ||
    voices[0]
  );
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => { ttsVoice = pickVoice(); };
  ttsVoice = pickVoice();
}

function fallbackSpeech(seg) {
  return new Promise(resolve => {
    if (audioMuted || typeof window === 'undefined' || !('speechSynthesis' in window) || !seg.text) return resolve();
    const cfg = STYLE_SETTINGS[seg.style] || STYLE_SETTINGS.statement;
    const utter = new SpeechSynthesisUtterance(seg.text);
    if (ttsVoice) utter.voice = ttsVoice;
    utter.rate = cfg.rate;
    utter.pitch = cfg.pitch;
    utter.volume = 1;
    utter.onend = resolve;
    utter.onerror = resolve;
    window.speechSynthesis.speak(utter);
  });
}

/* ---------- ElevenLabs dynamic request ---------- */
const dynamicCache = new Map();

async function requestElevenLabs(text, style) {
  const cfg = STYLE_SETTINGS[style] || STYLE_SETTINGS.statement;
  const body = JSON.stringify({
    text,
    model_id: MODEL_ID,
    voice_settings: {
      stability: cfg.stability,
      similarity_boost: cfg.similarity_boost,
      style: cfg.style,
      use_speaker_boost: cfg.use_speaker_boost
    }
  });
  const path = `/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`;
  const attempts = [{ url: `/api/elevenlabs${path}`, headers: {} }];
  if (API_KEY) attempts.push({ url: `https://api.elevenlabs.io${path}`, headers: { 'xi-api-key': API_KEY } });

  for (const a of attempts) {
    try {
      const res = await fetch(a.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'audio/mpeg', ...a.headers },
        body
      });
      if (res.ok && /audio/.test(res.headers.get('content-type') || '')) {
        const blob = await res.blob();
        return URL.createObjectURL(blob);
      }
    } catch (e) { /* try next route */ }
  }
  return null;
}

export function getAudioUrl(text, style = 'statement') {
  if (!text) return Promise.resolve(null);
  if (audioMap[text]) return Promise.resolve(audioMap[text]);
  const key = `${style}::${text}`;
  if (!dynamicCache.has(key)) {
    dynamicCache.set(key, requestElevenLabs(text, style).then(url => {
      if (!url) dynamicCache.delete(key);
      return url;
    }));
  }
  return dynamicCache.get(key);
}

/* ---------- playback ---------- */
function playUrl(url, queueId) {
  return new Promise(resolve => {
    if (queueId !== currentQueue || audioMuted) return resolve(false);
    try {
      const audio = new Audio(url);
      currentAudioElement = audio;
      audio.onended = () => {
        if (currentAudioElement === audio) currentAudioElement = null;
        resolve(true);
      };
      audio.onerror = () => {
        if (currentAudioElement === audio) currentAudioElement = null;
        resolve(false);
      };
      audio.play().catch(() => {
        if (currentAudioElement === audio) currentAudioElement = null;
        resolve(false);
      });
    } catch (e) {
      resolve(false);
    }
  });
}

export async function speakSegment(seg, queueId = currentQueue) {
  if (audioMuted || !seg || !seg.text) return;
  if (queueId !== currentQueue) return;

  const url = await getAudioUrl(seg.text, seg.style);
  if (queueId !== currentQueue || audioMuted) return;

  if (url) {
    const ok = await playUrl(url, queueId);
    if (ok) return;
    if (queueId !== currentQueue || audioMuted) return;
  }
  await fallbackSpeech(seg);
}

/** Play an array of segments sequentially. Starting a new narration cancels the previous one immediately. */
export async function narrate(segments, autoplay = true) {
  // Always stop previous narration dead in its tracks to prevent overlaps
  stopNarration();
  if (!autoplay || audioMuted) return;

  const myQueue = currentQueue; // currentQueue was incremented in stopNarration()
  const list = (Array.isArray(segments) ? segments : [segments]).filter(Boolean);
  
  for (let i = 0; i < list.length; i++) {
    if (myQueue !== currentQueue || audioMuted) return;
    if (list[i + 1]) getAudioUrl(list[i + 1].text, list[i + 1].style);
    await speakSegment(list[i], myQueue);
  }
}

/** Immediately stop all playing audio and cancel queues */
export function stopNarration() {
  currentQueue++;
  if (currentAudioElement) {
    currentAudioElement.pause();
    currentAudioElement.currentTime = 0;
    currentAudioElement = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function setMuted(m) {
  audioMuted = m;
  if (m) stopNarration();
}

/* ---------- UI sound effects ---------- */
let audioCtx = null;
export function playSfx(kind = 'good') {
  if (audioMuted || typeof window === 'undefined') return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioCtx = audioCtx || new Ctx();
    const seqs = {
      good: [[660, 0], [880, 0.09]],
      bad: [[220, 0], [165, 0.11]],
      win: [[523, 0], [659, 0.1], [784, 0.2], [1047, 0.3]],
      pop: [[740, 0]]
    };
    const now = audioCtx.currentTime;
    (seqs[kind] || seqs.good).forEach(([freq, at]) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = kind === 'bad' ? 'sawtooth' : 'triangle';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, now + at);
      g.gain.exponentialRampToValueAtTime(0.14, now + at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + at + 0.16);
      o.connect(g).connect(audioCtx.destination);
      o.start(now + at);
      o.stop(now + at + 0.18);
    });
  } catch (e) { /* ignore */ }
}

/* ---------- segment helpers ---------- */
export const say = text => ({ text, style: 'statement' });
export const ask = text => ({ text, style: 'question' });
export const cheer = text => ({ text, style: 'celebration' });
export const emphasize = text => ({ text, style: 'emphasis' });
export const think = text => ({ text, style: 'thinking' });
export const celebrate = text => ({ text, style: 'celebration' });
export const instruct = text => ({ text, style: 'encouragement' });
