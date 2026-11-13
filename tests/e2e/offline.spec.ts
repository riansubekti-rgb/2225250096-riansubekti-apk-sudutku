import { expect, test } from '@playwright/test';
import { loginNew } from './helpers';

test.use({ serviceWorkers: 'allow' });

test('PWA tetap berjalan tanpa internet (mode pesawat), termasuk 3D', async ({ page, context }) => {
  await page.goto('/masuk');
  // Tunggu service worker aktif & precache selesai, lalu muat ulang agar halaman dikendalikan SW.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

  await loginNew(page, 'A07H', 'Raka');
  await context.setOffline(true);

  await page.reload();
  await expect(page.getByText('Hai, Raka!')).toBeVisible();
  await page.goto('/kenali');
  await expect(page.getByRole('heading', { name: /Sudut Berpelurus/ })).toBeVisible();
  await page.goto('/misi?misi=1');
  await expect(page.locator('canvas, svg[role="img"]').first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Memuat 3D…')).toHaveCount(0);
});
