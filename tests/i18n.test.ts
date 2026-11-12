import { describe, expect, it } from 'vitest';
import { en } from '../src/i18n/en';
import { id } from '../src/i18n/id';
import { translate } from '../src/i18n';

describe('i18n', () => {
  it('kamus en memiliki semua kunci id dan tidak ada yang kosong', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(id).sort());
    for (const [k, v] of Object.entries(en)) expect(v.trim(), k).not.toBe('');
  });
  it('placeholder konsisten antar bahasa', () => {
    const ph = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const k of Object.keys(id) as (keyof typeof id)[]) expect(ph(en[k]), k).toEqual(ph(id[k]));
  });
  it('translate mengganti parameter dan jatuh kembali ke id', () => {
    expect(translate('en', 'results.sample', { days: 8, n: 30 })).toBe('8 days / 30 records');
    expect(translate('id', 'results.sample', { days: 8, n: 30 })).toBe('8 hari / 30 data');
    expect(translate('id', 'reason.min_days', { days: 2 })).toContain('{minDays}');
  });
  it('bahasa bawaan tidak menyebut kata terlarang di kedua bahasa', () => {
    for (const d of [id, en]) for (const [k, v] of Object.entries(d)) if (k.startsWith('summary.')) expect(v).not.toMatch(/guaranteed|proven|pasti benar|signifikan/i);
  });
});
