import { expect, test } from '@playwright/test';
import { RAKA } from './codes';
import { loginNew, researcherOpen } from './helpers';
import { isValidStudentCode, normalizeCode } from '../../src/domain/profile/studentCode';

test('profil: lihat kode, ganti avatar & nama, statistik', async ({ page }) => {
  await loginNew(page, RAKA, 'Raka');
  await page.getByRole('link', { name: /Profil Raka/ }).click();
  await expect(page.getByRole('heading', { name: 'Profil Saya' })).toBeVisible();
  await expect(page.getByText(`${RAKA.slice(0, 3)}-${RAKA.slice(3)}`)).toBeVisible();
  await expect(page.getByText('soal dijawab')).toBeVisible();

  await page.getByRole('radio', { name: 'Avatar 🐼' }).click();
  await page.getByLabel('Nama panggilan').fill('Raka Hebat');
  await page.getByRole('button', { name: 'Simpan' }).click();
  await page.goto('/');
  const link = page.getByRole('link', { name: /Profil Raka Hebat/ });
  await expect(link).toBeVisible();
  await expect(link).toContainText('🐼');
});

test('kode lama A07H ditolak; peneliti membuat kode acak yang sah & tersimpan', async ({ page }) => {
  await page.goto('/masuk');
  await page.getByLabel('Ketik kode siswamu').fill('A07H');
  await page.getByRole('button', { name: 'Masuk' }).click();
  await expect(page.getByRole('alert')).toContainText('belum tepat');
  await page.getByLabel('Ketik kode siswamu').fill('AK7-QM2');
  await page.getByRole('button', { name: 'Masuk' }).click();
  await expect(page.getByRole('alert')).toContainText('hanya contoh');

  await researcherOpen(page, '2468', []);
  await page.getByLabel('Jumlah kode').fill('5');
  await page.getByRole('button', { name: /Buat 5 kode acak/ }).click();
  const cards = page.locator('p.tracking-widest');
  await expect(cards).toHaveCount(5);
  const codes = await cards.allInnerTexts();
  for (const c of codes) expect(isValidStudentCode(normalizeCode(c))).toBe(true);

  // Mencetak ulang setelah muat ulang → kode yang sama
  await researcherOpen(page, '2468', []);
  await page.getByRole('button', { name: /Tampilkan kartu kode/ }).click();
  await expect(cards).toHaveCount(5);
  expect(await cards.allInnerTexts()).toEqual(codes);
});
