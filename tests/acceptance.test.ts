import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { summarizeAcceptance, summarizeBeliefShift } from '../src/core/acceptance';

describe('summarizeAcceptance', () => {
  it('tanpa responden: semua null, tidak ada angka karangan', () => {
    const s = summarizeAcceptance([]);
    expect(s).toMatchObject({ n: 0, meanScore: null, acceptShare: null, acceptInterval: null, opposingAcceptShare: null });
    expect(s.note).toMatch(/Belum ada/);
  });
  it('menghitung dari data; satu jawaban per pengguna; skor di luar 1..5 dibuang', () => {
    const s = summarizeAcceptance([
      { userId: 'a', score: 2, accepts: false, stanceInitial: 'kontra' },
      { userId: 'a', score: 4, accepts: true, stanceInitial: 'kontra' },
      { userId: 'b', score: 5, accepts: true, stanceInitial: 'pro' },
      { userId: 'c', score: 9, accepts: true },
      { userId: 'd', score: 3, accepts: false, stanceInitial: 'kontra' },
    ]);
    expect(s.n).toBe(3);
    expect(s.meanScore).toBeCloseTo(4, 10);
    expect(s.acceptShare).toBeCloseTo(2 / 3, 10);
    expect(s.opposingN).toBe(2);
    expect(s.opposingAcceptShare).toBeCloseTo(0.5, 10);
    expect(s.acceptInterval!.upper).toBeGreaterThan(s.acceptInterval!.lower);
    expect(s.note).toMatch(/tidak mewakili/);
  });
  it('property: rata-rata di [1,5], proporsi di [0,1], interval memuat proporsi', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({ userId: fc.string({ minLength: 1, maxLength: 3 }), score: fc.integer({ min: 1, max: 5 }), accepts: fc.boolean() }), { minLength: 1, maxLength: 30 }),
        (rs) => {
          const s = summarizeAcceptance(rs);
          expect(s.meanScore!).toBeGreaterThanOrEqual(1);
          expect(s.meanScore!).toBeLessThanOrEqual(5);
          expect(s.acceptInterval!.lower).toBeLessThanOrEqual(s.acceptShare! + 1e-12);
          expect(s.acceptInterval!.upper).toBeGreaterThanOrEqual(s.acceptShare! - 1e-12);
        },
      ),
    );
  });
});

describe('summarizeBeliefShift', () => {
  it('hanya menghitung klaim dengan pasca-keyakinan; kosong => null', () => {
    expect(summarizeBeliefShift([{ initial: 80 }])).toEqual({ n: 0, changed: 0, meanChange: null });
    const s = summarizeBeliefShift([{ initial: 80, post: 60 }, { initial: 20, post: 20 }, { initial: 50 }]);
    expect(s).toEqual({ n: 2, changed: 1, meanChange: -10 });
  });
});
