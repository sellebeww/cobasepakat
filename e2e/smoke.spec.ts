import { expect, test } from '@playwright/test';

test('demo terbuka, menampilkan banner fiktif dan hasil dengan interval', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/#/demo/isu/issue-parkir-lorong-b');
  await page.getByRole('button', { name: 'Dasbor Percobaan (berjalan)' }).click();
  await expect(page.getByTestId('demo-banner')).toContainText('fiktif');
  await expect(page.getByText('Hasil terhadap kriteria yang disepakati')).toBeVisible();
  await expect(page.getByText('Batasan metode')).toBeVisible();
  await expect(page.getByText('Interval 95%').first()).toBeVisible();
  expect(errors).toEqual([]);
});
