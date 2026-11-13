import type { Page } from '@playwright/test';

/** Lewati layar pembuka "Ketuk untuk mulai!" bila tampil. */
export async function passGate(page: Page) {
  const gate = page.getByRole('button', { name: 'Ketuk untuk mulai' });
  if (await gate.isVisible().catch(() => false)) await gate.click();
}

export async function loginNew(page: Page, code: string, nickname: string) {
  await page.goto('/masuk');
  await page.getByRole('button', { name: 'Ketuk untuk mulai' }).or(page.getByLabel('Ketik kode siswamu')).first().waitFor();
  await passGate(page);
  await page.getByLabel('Ketik kode siswamu').fill(code);
  await page.getByRole('button', { name: 'Masuk' }).click();
  await page.getByLabel('Nama panggilan').fill(nickname);
  await page.getByRole('button', { name: 'Mulai belajar' }).click();
  await page.getByText(`Hai, ${nickname}!`).waitFor();
}

export async function researcherOpen(page: Page, pin: string, toggles: RegExp[]) {
  await page.goto('/peneliti');
  await page.getByLabel('PIN', { exact: true }).waitFor();
  if (await page.getByLabel('Ulangi PIN').isVisible()) {
    await page.getByLabel('PIN', { exact: true }).fill(pin);
    await page.getByLabel('Ulangi PIN').fill(pin);
    await page.getByRole('button', { name: 'Simpan PIN' }).click();
  } else {
    await page.getByLabel('PIN', { exact: true }).fill(pin);
    await page.getByRole('button', { name: 'Buka' }).click();
  }
  for (const t of toggles) await page.getByText(t).click();
}
