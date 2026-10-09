import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
          setupFiles: ['src/test-setup.ts'],
        },
      },
    ],
  },
});
