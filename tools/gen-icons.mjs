// Membuat ikon PNG dari SVG (192, 512, maskable 512, apple-touch 180) memakai browser Playwright.
// Jalankan: node tools/gen-icons.mjs
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const channel = process.env.PW_CHANNEL ?? (process.platform === 'win32' ? 'msedge' : undefined);
const browser = await chromium.launch({ channel });
const page = await browser.newPage();
const jobs = [
  ['public/icons/icon.svg', 192, 'public/icons/icon-192.png'],
  ['public/icons/icon.svg', 512, 'public/icons/icon-512.png'],
  ['public/icons/icon-maskable.svg', 512, 'public/icons/icon-maskable-512.png'],
  ['public/icons/icon-maskable.svg', 180, 'public/icons/apple-touch-icon.png'],
];
for (const [src, size, out] of jobs) {
  const svg = readFileSync(src, 'utf8').replace('<svg ', `<svg width="${size}" height="${size}" `);
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
  await page.locator('svg').screenshot({ path: out, omitBackground: true });
  console.log('✓', out);
}
await browser.close();
