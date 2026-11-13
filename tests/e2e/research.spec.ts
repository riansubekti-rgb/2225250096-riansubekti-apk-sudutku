import { strFromU8, unzipSync } from 'fflate';
import { expect, test } from '@playwright/test';
import { DIMAS } from './codes';
import { loginNew, researcherOpen } from './helpers';

test('penelitian: buka pretest → siswa mengerjakan → materi terbuka → ekspor ZIP', async ({ page }) => {
  // Hindari dialog berbagi sistem, dan tangkap ZIP yang diserahkan aplikasi ke tautan unduhan
  // (tanpa unduhan sungguhan — Edge kadang galat saat menutup jendela berisi unduhan aktif).
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'canShare', { value: undefined });
    const w = window as unknown as { __zip?: number[]; __zipName?: string };
    HTMLAnchorElement.prototype.click = function () {
      if (!this.download) return;
      w.__zipName = this.download;
      void fetch(this.href)
        .then((r) => r.arrayBuffer())
        .then((b) => (w.__zip = Array.from(new Uint8Array(b))));
    };
  });

  await loginNew(page, DIMAS, 'Dimas');
  // Siswa membuka Tes Awal sendiri dengan kode dari papan tulis
  await page.getByRole('link', { name: /Punya kode dari guru/ }).click();
  await page.getByLabel('Ketik kode dari gurumu').fill('tesawal');
  await page.getByRole('button', { name: 'Buka' }).click();

  // Materi terkunci sampai Tes Awal selesai
  await expect(page.getByRole('link', { name: /Lab Sudut/ })).toHaveCount(0);
  await page.getByRole('link', { name: /Tes Awal/ }).click();
  for (let i = 0; i < 10; i++) {
    await page.getByRole('radio').first().click();
    await page.getByRole('button', { name: i < 9 ? 'Berikutnya →' : 'Selesai' }).click();
  }
  await expect(page.getByText('Semua soal sudah dijawab.')).toBeVisible();
  await page.getByRole('button', { name: 'Kirim jawaban' }).click();
  await expect(page.getByText(/Terima kasih/)).toBeVisible();
  await page.goto('/');
  await expect(page.getByRole('link', { name: /Lab Sudut/ })).toBeVisible();

  // Ekspor
  await researcherOpen(page, '2468', []);
  await page.getByRole('button', { name: /Ekspor data/ }).click();
  await expect.poll(() => page.evaluate(() => Boolean((window as unknown as { __zip?: number[] }).__zip))).toBe(true);
  const name = await page.evaluate(() => (window as unknown as { __zipName: string }).__zipName);
  expect(name).toMatch(/^sudutku_semua_[0-9a-f]{8}_\d{8}-\d{4}\.zip$/);
  const bytes = await page.evaluate(() => (window as unknown as { __zip: number[] }).__zip);
  const files = unzipSync(new Uint8Array(bytes));
  expect(Object.keys(files)).toContain('assessment_summary.csv');
  const summary = strFromU8(files['assessment_summary.csv']!);
  expect(summary).toContain(DIMAS);
  expect(summary).not.toContain('Dimas');
  expect(strFromU8(files['assessments.csv']!).trim().split('\r\n')).toHaveLength(11);
});
