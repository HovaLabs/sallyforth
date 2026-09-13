import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  use: {baseURL: 'http://localhost:3100', trace: 'retain-on-failure'},
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3100',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    {name: 'desktop', use: {...devices['Desktop Chrome'], viewport: {width: 1280, height: 900}}},
    {name: 'mobile', use: {...devices['Desktop Chrome'], viewport: {width: 375, height: 812}, isMobile: true, hasTouch: true, deviceScaleFactor: 2}},
  ],
});
