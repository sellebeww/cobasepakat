import { defineConfig, devices } from '@playwright/test';
import fs from 'node:fs';

// Di lingkungan CI standar, `npx playwright install chromium` dipakai. Secara lokal/cloud, jalur
// Chromium yang sudah terpasang dapat diberikan lewat PW_CHROMIUM_PATH.
const executablePath = process.env.PW_CHROMIUM_PATH || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'off',
    launchOptions: { executablePath, args: ['--no-sandbox'] },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], launchOptions: { executablePath, args: ['--no-sandbox'] } } },
    { name: 'mobile-360', use: { viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, launchOptions: { executablePath, args: ['--no-sandbox'] } } },
  ],
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
