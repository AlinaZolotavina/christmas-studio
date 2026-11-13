import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  retries: 1,
  workers: 1,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:5173', headless: true, actionTimeout: 15_000, viewport: { width: 1440, height: 900 }, trace: 'on-first-retry' },
  webServer: { command: 'npm run dev -- --port 5173 --strictPort', url: 'http://127.0.0.1:5173', reuseExistingServer: !process.env.CI, timeout: 30_000 },
});
