/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // D4: PWA adalah satu-satunya kanal distribusi.
      registerType: 'prompt',
      includeAssets: ['icons/*.svg', 'icons/*.png'],
      manifest: {
        name: 'SudutKu — Belajar Hubungan Antar Sudut',
        short_name: 'SudutKu',
        description: 'Belajar sudut berpelurus, berpenyiku, dan bertolak belakang.',
        lang: 'id',
        start_url: '/?source=pwa',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#3B3F99',
        background_color: '#FAFAF7',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icons/icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache semuanya, termasuk chunk Three.js & font, agar 100% offline (agents.md §3.8).
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: '/index.html',
      },
    }),
  ],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: { three: ['three'] },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    alias: { 'virtual:pwa-register': '/src/test/pwaRegisterMock.ts' },
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
