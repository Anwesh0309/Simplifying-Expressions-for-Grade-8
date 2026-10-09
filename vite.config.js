import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Dev/preview proxy so the ElevenLabs key can stay server-side while testing.
// src/utils/audio.js tries /api/elevenlabs first, then falls back to a direct call.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const key = env.VITE_ELEVENLABS_API_KEY || env.ELEVENLABS_API_KEY || '';
  const proxy = {
    '/api/elevenlabs': {
      target: 'https://api.elevenlabs.io',
      changeOrigin: true,
      rewrite: p => p.replace(/^\/api\/elevenlabs/, ''),
      headers: key ? { 'xi-api-key': key } : {}
    }
  };
  return {
    plugins: [react()],
    server: { port: 3000, open: true, proxy },
    preview: { proxy }
  };
});
