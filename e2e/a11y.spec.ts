import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES: [string, string][] = [
  ['landing', '/#/'],
  ['dasbor', '/#/demo/beranda'],
  ['percobaan', '/#/demo/isu/issue-parkir-lorong-b'],
  ['pustaka', '/#/demo/pustaka'],
  ['analitik', '/#/demo/analitik'],
  ['audit', '/#/demo/audit'],
];

for (const [name, url] of PAGES) {
  test(`a11y (axe): ${name}`, async ({ page }) => {
    await page.goto(url);
    if (name === 'percobaan') await page.getByRole('button', { name: 'Dasbor Percobaan (berjalan)' }).click();
    await page.waitForTimeout(700); // animasi masuk
    const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    const summary = res.violations.map((v) => `${v.id} (${v.impact}) x${v.nodes.length}: ${v.nodes[0].target.join(' ')}`);
    expect(summary, summary.join('\n')).toEqual([]);
  });
}
