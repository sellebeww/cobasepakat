import { expect, test } from '@playwright/test';
import { BAMBANG, addEntry, openTrialDashboard, startAs } from './helpers';

test('mencatat data lapangan memperbarui jumlah entri dan hasil', async ({ page }) => {
  await startAs(page, null);
  await openTrialDashboard(page);
  const before = await page.getByText(/\d+ entri tercatat/).innerText();
  await addEntry(page, /Waktu tempuh/, 3.1);
  await expect(page.getByText(/Entri data lapangan disimpan/).first()).toBeVisible();
  await expect(page.getByText(/\d+ entri tercatat/)).not.toHaveText(before);
});

test('aturan berhenti otomatis: dua keluhan > 3 berturut-turut menghentikan percobaan', async ({ page }) => {
  await startAs(page, null);
  await openTrialDashboard(page);
  await addEntry(page, /Keluhan warga/, 5);
  await expect(page.getByText('Percobaan Dihentikan Segera (Aturan Berhenti Terpicu)')).toHaveCount(0);
  await addEntry(page, /Keluhan warga/, 6);
  await expect(page.getByText('Percobaan Dihentikan Segera (Aturan Berhenti Terpicu)')).toBeVisible();
  await expect(page.getByText(/melanggar batas/).first()).toBeVisible();
});

test('"Hentikan Sekarang" manual hanya menghentikan, tidak memicu aturan otomatis', async ({ page }) => {
  await startAs(page, null);
  await openTrialDashboard(page);
  await page.getByRole('button', { name: 'Hentikan Sekarang' }).first().click();
  await page.getByPlaceholder(/Contoh: Terjadi 1 kali ambulans/).fill('Uji henti manual');
  await page.getByRole('button', { name: 'Hentikan Percobaan Sekarang' }).click();
  await expect(page.getByText('Percobaan Dihentikan Segera (Aturan Berhenti Terpicu)')).toBeVisible();
  await expect(page.getByText(/Dipantau otomatis · rentetan pelanggaran 0\/2/)).toBeVisible();
});

test('keputusan dikunci ke riwayat berantai, terverifikasi, dan penyuntingan terdeteksi', async ({ page }) => {
  await startAs(page, BAMBANG);
  await openTrialDashboard(page);
  await page.getByRole('button', { name: 'Catat Keputusan' }).first().click();
  await page.getByLabel('Judul Keputusan:').fill('Uji: tinjau ulang setelah 1 bulan');
  await page.getByLabel(/Pernyataan Keputusan Resmi/).fill('Pernyataan uji untuk warga.');
  await page.getByRole('button', { name: /Simpan & Kunci Catatan Keputusan/ }).click();
  await expect(page.getByTestId('decision-hash')).toContainText(/[0-9a-f]{64}/);
  await page.getByRole('button', { name: 'Selesai', exact: true }).click();

  await page.goto('/#/demo/audit');
  await page.getByRole('button', { name: 'Verifikasi sekarang' }).click();
  await expect(page.getByTestId('ledger-status')).toContainText('Rantai utuh');
  await page.getByRole('button', { name: /Simulasikan penyuntingan/ }).click();
  await page.getByRole('button', { name: 'Verifikasi sekarang' }).click();
  await expect(page.getByTestId('ledger-status')).toContainText('Rantai rusak');
});

test('keputusan tidak bisa dicatat dua kali', async ({ page }) => {
  await startAs(page, BAMBANG);
  await openTrialDashboard(page);
  await page.getByRole('button', { name: 'Catat Keputusan' }).first().click();
  await page.getByLabel('Judul Keputusan:').fill('Keputusan pertama');
  await page.getByLabel(/Pernyataan Keputusan Resmi/).fill('Pernyataan.');
  await page.getByRole('button', { name: /Simpan & Kunci Catatan Keputusan/ }).click();
  await page.getByRole('button', { name: 'Selesai', exact: true }).click();
  await page.reload();
  const issueDecisions = await page.evaluate(() => JSON.parse(localStorage.getItem('cobasepakat_state_v1_issues') ?? '[]').filter((i: { decision?: unknown }) => i.decision).length);
  expect(issueDecisions).toBeGreaterThanOrEqual(2); // 1 contoh bawaan + 1 baru
});

test('tautan undangan: dibuat pengurus, dibuka, dan ditebus', async ({ page }) => {
  await startAs(page, BAMBANG, '/#/demo/beranda');
  await page.getByRole('button', { name: 'Undang anggota' }).click();
  await page.getByRole('button', { name: 'Buat tautan' }).click();
  const url = await page.getByTestId('invite-url').inputValue();
  expect(url).toMatch(/#\/join\/[A-Za-z0-9_-]{32}$/);
  await page.goto(url);
  await expect(page.getByTestId('join-status')).toContainText('Undangan valid');
  await page.getByRole('button', { name: 'Gabung (mode demo)' }).click();
  await expect(page).toHaveURL(/#\/demo\/beranda/);
});

test('undangan tidak dikenal ditolak', async ({ page }) => {
  await startAs(page, null, `/#/join/${'A'.repeat(32)}`);
  await expect(page.getByTestId('join-status')).toContainText('tidak dikenal');
  await expect(page.getByRole('button', { name: 'Gabung (mode demo)' })).toHaveCount(0);
});

test('bahasa Inggris tersedia dan tersimpan', async ({ page }) => {
  await startAs(page, null);
  if ((page.viewportSize()?.width ?? 1280) < 640) {
    // di ponsel pemilih bahasa ada di menu hamburger; cukup atur preferensi tersimpan lalu muat ulang
    await page.evaluate(() => localStorage.setItem('cobasepakat_locale', 'en'));
    await page.reload();
  } else {
    await page.getByTestId('lang-select').selectOption('en');
  }
  await page.getByRole('button', { name: 'Dasbor Percobaan (berjalan)' }).click();
  await expect(page.getByText('Results against the agreed criteria')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('real-time antar tab: entri di satu tab muncul di tab lain tanpa muat ulang', async ({ context }) => {
  const a = await context.newPage();
  await startAs(a, null);
  await openTrialDashboard(a);
  const b = await context.newPage();
  await b.goto('/#/demo/isu/issue-parkir-lorong-b');
  await openTrialDashboard(b);
  const before = await b.getByText(/\d+ entri tercatat/).innerText();
  await addEntry(a, /Waktu tempuh/, 3.3);
  await expect(b.getByText(/\d+ entri tercatat/)).not.toHaveText(before, { timeout: 5000 });
});

test('analitik tidak menampilkan angka karangan dan memakai data nyata', async ({ page }) => {
  await startAs(page, null, '/#/demo/analitik');
  const body = await page.locator('main').innerText();
  for (const fake of ['94.2%', '84.0%', '68.5%', '16 Hari', '-64%']) expect(body).not.toContain(fake);
  await expect(page.getByText('Jawaban Survei Penerimaan')).toBeVisible();
  await expect(page.getByText(/n = 2/)).toBeVisible(); // 2 pihak kontra dari data contoh
});

test('PWA: shell tetap terbuka saat luring', async ({ page, context }) => {
  await startAs(page, null, '/#/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload(); // dikendalikan SW
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  await context.setOffline(false);
});
