import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist'),
    emptyOutDir: true,
    assetsDir: 'assets',
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      // This tells your local server to proxy /api requests to your backend
      '/api': {
        target: 'https://aegis-api.rafiuraza474.workers.dev',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  preview: {
    port: 4173,
    host: true,
  },
});