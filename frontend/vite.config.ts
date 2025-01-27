


// frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests under /api to the backend during development
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});