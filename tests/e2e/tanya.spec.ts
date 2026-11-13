import { expect, test } from '@playwright/test';
import { loginNew } from './helpers';

test('Tanya Busu: menjawab konsep, menghitung, dan jujur bila tidak tahu', async ({ page }) => {
  await loginNew(page, 'A07H', 'Raka');
  await page.getByRole('link', { name: /Tanya Busu/ }).click();

  await page.getByRole('button', { name: 'Apa bedanya pelurus dan penyiku?' }).click();
  await expect(page.getByText(/peLURUS = lurus/)).toBeVisible();

  await page.getByLabel('Pertanyaan untuk Busu').fill('2x + 4x = 90');
  await page.getByRole('button', { name: 'Kirim pertanyaan' }).click();
  await expect(page.getByText('Jadi x = 15.', { exact: false })).toBeVisible();

  await page.getByLabel('Pertanyaan untuk Busu').fill('resep nasi goreng');
  await page.getByRole('button', { name: 'Kirim pertanyaan' }).click();
  await expect(page.getByText(/aku belum paham/)).toBeVisible();
});

test('Tanya Busu melayang di Latihan tanpa menghilangkan soal', async ({ page }) => {
  await loginNew(page, 'B12W', 'Sinta');
  await page.goto('/latihan');
  await expect(page.getByText(/Soal 1\/5/)).toBeVisible();
  await page.getByRole('button', { name: 'Tanya Busu' }).click();
  await expect(page.getByRole('dialog', { name: 'Tanya Busu' })).toBeVisible();
  await page.getByRole('button', { name: /Tutup/ }).click();
  await expect(page.getByText(/Soal 1\/5/)).toBeVisible();
});
