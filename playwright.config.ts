import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  workers: 2,
  retries: 0,
  use: {
    browserName: 'chromium',
    baseURL: 'http://127.0.0.1:4174',
    viewport: { width: 1280, height: 900 },
    reducedMotion: 'reduce',
    locale: 'en-US',
    timezoneId: 'UTC',
    colorScheme: 'dark',
  },
  expect: {
    toHaveScreenshot: { animations: 'disabled', maxDiffPixelRatio: 0.002 },
  },
  webServer: [
    {
      command: 'node scripts/serve-consumer.mjs vite-react 4174',
      url: 'http://127.0.0.1:4174',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'node scripts/serve-consumer.mjs nextjs 4175',
      url: 'http://127.0.0.1:4175',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'node scripts/serve-consumer.mjs vite-react 4176 dist-tailwind',
      url: 'http://127.0.0.1:4176',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'node scripts/serve-static.mjs storybook-static 6006',
      url: 'http://127.0.0.1:6006',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
