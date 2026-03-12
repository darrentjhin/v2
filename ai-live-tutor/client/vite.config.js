/**
 * Vite configuration for the AI Live Tutor frontend.
 *
 * - plugin-react: enables Fast Refresh and JSX
 * - proxy: forwards /api requests to the backend during development
 *   so the frontend can call http://localhost:5173/api/... and Vite
 *   will proxy to http://localhost:3001/api/...
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API calls to the backend (avoids CORS and hardcoded URLs)
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
