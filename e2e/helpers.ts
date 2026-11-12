import type { Page } from '@playwright/test';

export const BAMBANG = { id: 'user-bambang', name: 'Bambang Wijaya', displayName: 'Bambang (Ketua RT 04)', email: 'b@example.test', unitLabel: 'Blok B-01', role: 'pengurus', avatarUrl: '' };
export const RATNA = { id: 'user-ratna', name: 'Ratna Dewi', displayName: 'Ratna D.', email: 'r@example.test', unitLabel: 'Blok B-14', role: 'anggota', avatarUrl: '' };

/** Mulai dari data demo bersih dengan persona tertentu (persona disimpan di localStorage aplikasi). */
export async function startAs(page: Page, user: object | null, hash = '/#/demo/isu/issue-parkir-lorong-b') {
  await page.addInitScript((u) => {
    if (sessionStorage.getItem('e2e-init')) return;
    sessionStorage.setItem('e2e-init', '1');
    localStorage.clear();
    if (u) localStorage.setItem('cobasepakat_state_v1_user', JSON.stringify(u));
  }, user);
  await page.goto(hash);
}

export async function openTrialDashboard(page: Page) {
  await page.getByRole('button', { name: 'Dasbor Percobaan (berjalan)' }).click();
  await page.getByText('Hasil terhadap kriteria yang disepakati').waitFor();
}

export async function addEntry(page: Page, metricLabel: RegExp, value: number) {
  await page.getByLabel('Pilih Metrik:').selectOption({ label: await page.getByLabel('Pilih Metrik:').locator('option', { hasText: metricLabel }).first().innerText() });
  await page.getByLabel(/Nilai Terukur/).fill(String(value));
  await page.getByRole('button', { name: 'Simpan Entri Data' }).click();
}
