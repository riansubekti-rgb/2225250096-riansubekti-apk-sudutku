import { readFileSync } from 'node:fs';
import { strFromU8, unzipSync } from 'fflate';
import { expect, test } from '@playwright/test';
import { loginNew, researcherOpen } from './helpers';

test('penelitian: buka pretest → siswa mengerjakan → materi terbuka → ekspor ZIP', async ({ page }, info) => {
  // Hindari dialog berbagi sistem; ekspor jatuh ke unduhan.
  await page.addInitScript(() => Object.defineProperty(navigator, 'canShare', { value: undefined }));

  await loginNew(page, 'C05W', 'Dimas');
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
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Ekspor data/ }).click()]);
  const path = info.outputPath('export.zip');
  await dl.saveAs(path);
  const files = unzipSync(new Uint8Array(readFileSync(path)));
  expect(Object.keys(files)).toContain('assessment_summary.csv');
  const summary = strFromU8(files['assessment_summary.csv']!);
  expect(summary).toContain('C05W');
  expect(summary).not.toContain('Dimas');
  expect(strFromU8(files['assessments.csv']!).trim().split('\r\n')).toHaveLength(11);
});
