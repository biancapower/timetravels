import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Never reload under the user: a half-built sentence is a form (decision 0003).
      registerType: 'prompt',
      includeAssets: ['icons/icon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'TimeTravels',
        short_name: 'TimeTravels',
        description: 'A time calculator you talk to in one sentence.',
        theme_color: '#3b5bdb',
        background_color: '#f8f9fa',
        display: 'standalone',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          { src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        // Precache everything the app needs, including the Temporal polyfill
        // chunk that only some browsers load, so it works offline from the start.
        globPatterns: ['**/*.{js,css,html,svg,png}'],
      },
    }),
  ],
  server: { host: '0.0.0.0' },
  test: {
    allowOnly: false,
    sequence: { shuffle: true },
    projects: [
      {
        extends: true,
        test: {
          name: 'time',
          environment: 'node',
          include: ['src/time/**/*.test.ts'],
          // Installs Temporal only where the runtime lacks it, as the app is meant to.
          setupFiles: ['temporal-polyfill/global'],
        },
      },
      {
        extends: true,
        test: {
          name: 'components',
          environment: 'jsdom',
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: ['src/time/**'],
          setupFiles: ['temporal-polyfill/global', 'src/test-setup.ts'],
        },
      },
    ],
  },
});
