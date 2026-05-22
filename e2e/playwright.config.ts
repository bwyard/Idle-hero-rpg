/**
 * Playwright configuration — E2E tests against the Expo Web build.
 *
 * Runner: Chromium only (RN Web is tested in Chrome in CI)
 *
 * Local usage (no manual server needed):
 *   cd e2e && npm run test:e2e
 *   Playwright auto-starts the Expo dev server and tears it down after.
 *   If you already have the server running on :8081, it reuses it.
 *
 * CI usage:
 *   CI starts the static build + serve manually before calling playwright.
 *   The webServer block is skipped in CI (server is already up).
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
  // Local only — CI starts its own static server before calling playwright.
  webServer: process.env.CI
    ? undefined
    : {
        command: 'cd ../apps/game && npx expo start --web --port 8081 --non-interactive',
        url: 'http://localhost:8081',
        reuseExistingServer: true, // reuse if already running (e.g. you started it manually)
        timeout: 120_000,
      },
});
