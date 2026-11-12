import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { breaches, evaluateStopRules, latchTriggered, markManualStop, shouldHalt, warnings } from '../src/core/stopRules';
import type { Observation, StopComparator, StopRuleDef } from '../src/core/types';

const rule = (over: Partial<StopRuleDef> & { limit?: number; comparator?: StopComparator; consecutive?: number } = {}): StopRuleDef => ({
  id: over.id ?? 'r1',
  severity: over.severity ?? 'kritis_henti',
  triggeredAt: over.triggeredAt,
  trigger: over.trigger ?? { kind: 'metric', metricId: 'm', comparator: over.comparator ?? 'gte', limit: over.limit ?? 3, consecutive: over.consecutive ?? 1 },
});

const at = (i: number) => new Date(Date.UTC(2026, 9, 15, 7, 0, i)).toISOString();
const o = (value: number, i: number, metricId = 'm'): Observation => ({ id: `o${i}`, metricId, value, recordedAt: at(i) });

describe('breaches', () => {
  it('semua pembanding, batas tepat', () => {
    expect(breaches(3, 'gt', 3)).toBe(false);
    expect(breaches(3, 'gte', 3)).toBe(true);
    expect(breaches(3, 'lt', 3)).toBe(false);
    expect(breaches(3, 'lte', 3)).toBe(true);
    expect(breaches(2.9, 'lt', 3)).toBe(true);
  });
});

describe('evaluateStopRules', () => {
  it('satu pelanggaran memicu aturan consecutive=1 dan menyebut pengamatan pemicunya', () => {
    const [r] = evaluateStopRules([rule()], [o(1, 0), o(4, 1), o(1, 2)]);
    expect(r.status).toBe('terpicu');
    expect(r.source).toBe('otomatis');
    expect(r.triggeredByObservationId).toBe('o1');
    expect(r.triggeredAt).toBe(at(1));
    expect(r.reason).toMatch(/melanggar batas/);
  });
  it('consecutive=2 butuh dua berturut-turut; selingan nilai aman mengulang hitungan', () => {
    const rules = [rule({ consecutive: 2 })];
    expect(evaluateStopRules(rules, [o(4, 0), o(1, 1), o(4, 2)])[0].status).toBe('aman');
    expect(evaluateStopRules(rules, [o(4, 0), o(1, 1), o(4, 2)])[0].currentStreak).toBe(1);
    expect(evaluateStopRules(rules, [o(4, 0), o(4, 1)])[0].status).toBe('terpicu');
  });
  it('pengamatan metrik lain dan yang ditandai (flagged) diabaikan', () => {
    const data = [o(99, 0, 'lain'), { ...o(99, 1), flagged: true }];
    expect(evaluateStopRules([rule()], data)[0].status).toBe('aman');
  });
  it('aturan manual tidak pernah terpicu otomatis', () => {
    const r = rule({ trigger: { kind: 'manual' } });
    expect(evaluateStopRules([r], [o(1e9, 0)])[0].status).toBe('aman');
  });
  it('aturan yang sudah terpicu tetap terpicu walau datanya hilang (latching)', () => {
    const r = rule({ triggeredAt: '2026-10-16T00:00:00Z' });
    const res = evaluateStopRules([r], [])[0];
    expect(res.status).toBe('terpicu');
    expect(res.source).toBe('tercatat');
  });
  it('shouldHalt: hanya aturan kritis menghentikan; waspada hanya memperingatkan', () => {
    const rules = [rule({ id: 'a', severity: 'waspada' }), rule({ id: 'b', severity: 'kritis_henti', limit: 100 })];
    const res = evaluateStopRules(rules, [o(5, 0)]);
    expect(res.find((x) => x.ruleId === 'a')!.status).toBe('terpicu');
    expect(shouldHalt(res)).toBe(false);
    expect(warnings(res).map((x) => x.ruleId)).toEqual(['a']);
    expect(shouldHalt(evaluateStopRules([rule({ severity: 'kritis_henti' })], [o(5, 0)]))).toBe(true);
  });
  it('consecutive <= 0 diperlakukan sebagai 1 (tidak pernah mematikan aturan)', () => {
    expect(evaluateStopRules([rule({ consecutive: 0 })], [o(5, 0)])[0].status).toBe('terpicu');
  });

  it('property: tanpa pengamatan yang melanggar, tidak ada yang terpicu', () => {
    fc.assert(
      fc.property(fc.array(fc.double({ min: -100, max: 2.99, noNaN: true }), { maxLength: 30 }), (vals) => {
        const data = vals.map((v, i) => o(v, i));
        return evaluateStopRules([rule()], data)[0].status === 'aman';
      }),
    );
  });
  it('property: consecutive=1 terpicu bila dan hanya bila ada nilai yang melanggar', () => {
    fc.assert(
      fc.property(
        fc.array(fc.double({ min: -10, max: 10, noNaN: true }), { maxLength: 30 }),
        fc.constantFrom<StopComparator>('gt', 'gte', 'lt', 'lte'),
        fc.double({ min: -10, max: 10, noNaN: true }),
        (vals, cmp, limit) => {
          const data = vals.map((v, i) => o(v, i));
          const expected = vals.some((v) => breaches(v, cmp, limit));
          const got = evaluateStopRules([rule({ comparator: cmp, limit })], data)[0].status === 'terpicu';
          return got === expected;
        },
      ),
    );
  });
  it('property: monoton, menambah pengamatan tidak pernah membatalkan pemicuan', () => {
    fc.assert(
      fc.property(
        fc.array(fc.double({ min: -10, max: 10, noNaN: true }), { maxLength: 20 }),
        fc.array(fc.double({ min: -10, max: 10, noNaN: true }), { maxLength: 20 }),
        fc.integer({ min: 1, max: 4 }),
        (a, b, consecutive) => {
          const rules = [rule({ consecutive, limit: 3 })];
          const first = a.map((v, i) => o(v, i));
          const more = [...first, ...b.map((v, i) => o(v, a.length + i))];
          const before = evaluateStopRules(rules, first)[0].status;
          const after = evaluateStopRules(rules, more)[0].status;
          return before !== 'terpicu' || after === 'terpicu';
        },
      ),
    );
  });
  it('property: urutan array masukan tidak berpengaruh (waktu menentukan urutan)', () => {
    fc.assert(
      fc.property(fc.array(fc.double({ min: -10, max: 10, noNaN: true }), { maxLength: 20 }), fc.integer({ min: 1, max: 4 }), (vals, consecutive) => {
        const data = vals.map((v, i) => o(v, i));
        const rules = [rule({ consecutive, limit: 3 })];
        const a = evaluateStopRules(rules, data)[0];
        const b = evaluateStopRules(rules, [...data].reverse())[0];
        return a.status === b.status && a.triggeredAt === b.triggeredAt;
      }),
    );
  });
  it('property: pengamatan metrik lain tidak mempengaruhi hasil', () => {
    fc.assert(
      fc.property(
        fc.array(fc.double({ min: -10, max: 10, noNaN: true }), { maxLength: 15 }),
        fc.array(fc.double({ min: -100, max: 100, noNaN: true }), { maxLength: 15 }),
        (vals, noise) => {
          const base = vals.map((v, i) => o(v, i * 2));
          const withNoise = [...base, ...noise.map((v, i) => o(v, i * 2 + 1, 'lain'))];
          const rules = [rule({ consecutive: 2 })];
          return evaluateStopRules(rules, base)[0].status === evaluateStopRules(rules, withNoise)[0].status;
        },
      ),
    );
  });
});

describe('markManualStop dan latchTriggered', () => {
  it('manual hanya mengunci aturan manual (bukan semua), kecuali dipilih eksplisit', () => {
    const rules = [rule({ id: 'a', trigger: { kind: 'manual' } }), rule({ id: 'b' })];
    const out = markManualStop(rules, '2026-10-20T00:00:00Z');
    expect(out.find((r) => r.id === 'a')!.triggeredAt).toBe('2026-10-20T00:00:00Z');
    expect(out.find((r) => r.id === 'b')!.triggeredAt).toBeUndefined();
    const sel = markManualStop(rules, '2026-10-20T00:00:00Z', ['b']);
    expect(sel.find((r) => r.id === 'b')!.triggeredAt).toBe('2026-10-20T00:00:00Z');
    expect(sel.find((r) => r.id === 'a')!.triggeredAt).toBeUndefined();
  });
  it('tidak menimpa waktu pemicuan yang sudah ada', () => {
    const rules = [rule({ id: 'a', triggeredAt: 'awal', trigger: { kind: 'manual' } })];
    expect(markManualStop(rules, 'baru')[0].triggeredAt).toBe('awal');
  });
  it('latchTriggered mengunci hasil otomatis dan tidak mengubah masukan', () => {
    const rules = [rule()];
    const res = evaluateStopRules(rules, [o(5, 0)]);
    const latched = latchTriggered(rules, res);
    expect(latched[0].triggeredAt).toBe(at(0));
    expect(rules[0].triggeredAt).toBeUndefined();
    expect(evaluateStopRules(latched, [])[0].status).toBe('terpicu');
  });
});
