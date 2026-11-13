import { defineConfig, devices } from '@playwright/test';

// Di Windows memakai Microsoft Edge bawaan (tidak perlu mengunduh Chromium). Ganti dengan PW_CHANNEL bila perlu.
const channel = process.env.PW_CHANNEL ?? (process.platform === 'win32' ? 'msedge' : undefined);

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  use: { baseURL: 'http://localhost:4173', channel },
  webServer: { command: 'npm run build && npm run preview -- --port 4173', port: 4173, reuseExistingServer: true, timeout: 180_000 },
  projects: [
    // Target utama: ponsel Android kelas bawah (360×640) dan tablet.
    { name: 'android-360', use: { ...devices['Pixel 5'], viewport: { width: 360, height: 640 }, channel } },
    { name: 'tablet', use: { ...devices['Galaxy Tab S4'], channel } },
  ],
});
