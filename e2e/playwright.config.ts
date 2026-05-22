/**
 * Playwright configuration — E2E tests against the Expo Web build.
 *
 * Target: static Expo export served at http://localhost:8081
 * Runner: Chromium only (RN Web is tested in Chrome in CI)
 *
 * To run locally:
 *   1. cd apps/game && npx expo export --platform web (or use the dev server)
 *   2. npx serve dist -p 8081 -s
 *   3. cd e2e && npm run test:e2e
 *
 * Or against the dev server (no build step):
 *   1. cd apps/game && npx expo start --web
 *   2. cd e2e && npm run test:e2e
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // sequential — tests share a localhost server
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
