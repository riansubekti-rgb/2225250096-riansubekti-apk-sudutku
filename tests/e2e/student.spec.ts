import { expect, test } from '@playwright/test';
import { RAKA } from './codes';
import { loginNew } from './helpers';

test('siswa: masuk → pemanasan → kenali → lab → misi 3D → ganti siswa', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));

  await loginNew(page, RAKA, 'Raka');

  // Pemanasan: lewati kartu, jawab cek prasyarat
  await page.getByRole('link', { name: /Pemanasan/ }).click();
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Lanjut →' }).click();
  await page.getByRole('button', { name: '90°' }).click();
  await expect(page.getByText(/benar!/i)).toBeVisible();

  // Kenali Hubungan: tantangan pertama
  await page.goto('/kenali?langkah=4');
  await page.getByRole('button', { name: /Berpelurus/ }).click();
  await expect(page.getByRole('status')).toContainText(/benar!/i);

  // Lab Sudut: tombol + mengubah persamaan
  await page.goto('/lab');
  await expect(page.getByText('65° + 115° = 180°')).toBeVisible();
  await page.getByRole('button', { name: 'Besarkan sudut' }).click();
  await expect(page.getByText('66° + 114° = 180°')).toBeVisible();

  // Misi 3D termuat (atau gambar 2D cadangan bila WebGL tidak ada)
  await page.goto('/misi?misi=0');
  await expect(page.locator('canvas, svg[role="img"]').first()).toBeVisible({ timeout: 15_000 });

  // Ganti siswa
  await page.getByRole('link', { name: /Profil Raka/ }).click();
  await page.getByRole('button', { name: /Keluar & ganti siswa/ }).click();
  await expect(page.getByLabel('Ketik kode siswamu')).toBeVisible();

  expect(errors).toEqual([]);
});

test('kode salah ketik ditolak', async ({ page }) => {
  await page.goto('/masuk');
  await page.getByLabel('Ketik kode siswamu').fill('A07J');
  await page.getByRole('button', { name: 'Masuk' }).click();
  await expect(page.getByRole('alert')).toContainText('belum tepat');
});
