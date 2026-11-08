import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, isPreview }) => ({
  // GitHub Pages uses its own build path; development always stays at the root URL.
  base: command === 'serve' && !isPreview ? '/' : process.env.VITE_BASE_PATH || './',
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  plugins: [react()],
  test: { environment: 'node', include: ['src/**/*.test.ts', 'tests/**/*.test.ts'] },
}));
