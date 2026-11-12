import { expect, test } from '@playwright/test';
import { openTrialDashboard, startAs } from './helpers';

const URLS = ['/#/', '/#/demo/beranda', '/#/demo/pustaka', '/#/demo/templat', '/#/demo/analitik', '/#/demo/fasilitator', '/#/demo/audit'];

test.describe('tampilan 360px tanpa gulir horizontal', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 1280) > 400, 'hanya proyek mobile-360');
  for (const url of URLS) {
    test(`halaman ${url}`, async ({ page }) => {
      await startAs(page, null, url);
      await page.waitForTimeout(600);
      const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      expect(sw, `scrollWidth ${sw} > clientWidth ${cw}`).toBeLessThanOrEqual(cw);
    });
  }
  test('dasbor percobaan (grafik dan tabel) muat di 360px', async ({ page }) => {
    await startAs(page, null);
    await openTrialDashboard(page);
    await page.waitForTimeout(600);
    const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    expect(sw).toBeLessThanOrEqual(cw);
  });
});
