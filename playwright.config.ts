import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './apps',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'customer-web-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'customer-web-mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3002',
        reuseExistingServer: !process.env.CI,
      },
});