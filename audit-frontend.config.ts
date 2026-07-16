import { defineConfig, devices } from '@playwright/test';

/**
 * Dedicated config for the SpiceGarden frontend audit.
 * - Runs ONLY audit-frontend.spec.ts
 * - Does NOT start a webServer (all apps already run in dev mode)
 * - Uses a single Chromium project; responsive checks are done in-test
 */
export default defineConfig({
  testDir: '.',
  testMatch: /audit-frontend\.spec\.ts/,
  fullyParallel: false, // keep console/network capture deterministic per route
  workers: 1,
  retries: 0,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { outputFolder: 'playwright-report-audit', open: 'never' }]],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'audit-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
