import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { summarizeSeries } from '../src/core/aggregate';
import { combineVerdicts, estimateMetric, evaluateCriterion, evaluateRule, METHOD_LIMITATIONS } from '../src/core/results';
import type { Criterion, MetricDef, Observation, Verdict } from '../src/core/types';

const waktu: MetricDef = {
  id: 'm1',
  name: 'Waktu tempuh',
  unit: 'menit',
  kind: 'durasi',
  direction: 'turun_lebih_baik',
  baselineValue: 4.2,
  thresholdValue: 3.5,
};

const obs = (metricId: string, values: number[], startDay = 1): Observation[] =>
  values.map((v, i) => ({ id: `${metricId}-${i}`, metricId, value: v, day: startDay + i, recordedAt: `2026-10-${String(15 + i).padStart(2, '0')}T07:00:00Z` }));

const crit = (over: Partial<Criterion> = {}): Criterion => ({
  id: 'c1',
  metricId: 'm1',
  kind: 'absolute',
  comparator: 'lte',
  value: 3.5,
  ...over,
});

describe('summarizeSeries', () => {
  it('mengelompokkan per hari, mengabaikan yang ditandai dan non-hingga', () => {
    const o: Observation[] = [
      { metricId: 'm1', value: 3, day: 1, recordedAt: '2026-10-15T07:00:00Z' },
      { metricId: 'm1', value: 5, day: 1, recordedAt: '2026-10-15T08:00:00Z' },
      { metricId: 'm1', value: 4, day: 2, recordedAt: '2026-10-16T08:00:00Z' },
      { metricId: 'm1', value: 99, day: 2, recordedAt: '2026-10-16T09:00:00Z', flagged: true },
      { metricId: 'm1', value: Number.NaN, day: 3, recordedAt: '2026-10-17T09:00:00Z' },
      { metricId: 'lain', value: 1, day: 1, recordedAt: '2026-10-15T09:00:00Z' },
    ];
    const s = summarizeSeries(o, 'm1');
    expect(s.days).toBe(2);
    expect(s.observations).toBe(3);
    expect(s.excluded).toBe(2);
    expect(s.daily).toEqual([
      { day: 1, value: 4, count: 2 },
      { day: 2, value: 4, count: 1 },
    ]);
  });
  it('tanpa field day memakai tanggal UTC dari recordedAt', () => {
    const s = summarizeSeries(
      [
        { metricId: 'm1', value: 1, recordedAt: '2026-10-15T01:00:00Z' },
        { metricId: 'm1', value: 3, recordedAt: '2026-10-15T20:00:00Z' },
      ],
      'm1',
    );
    expect(s.days).toBe(1);
    expect(s.daily[0].value).toBe(2);
  });
});

describe('estimateMetric', () => {
  it('tanpa data: semua null, bukan angka bawaan', () => {
    const e = estimateMetric(waktu, []);
    expect(e.estimate).toBeNull();
    expect(e.interval).toBeNull();
    expect(e.method).toBe('tidak_ada');
  });
  it('satu hari: estimasi ada tetapi interval tidak', () => {
    const e = estimateMetric(waktu, obs('m1', [3.2]));
    expect(e.estimate).toBe(3.2);
    expect(e.interval).toBeNull();
  });
  it('ya_tidak memakai Wilson; nilai bukan 0/1 ditolak', () => {
    const m: MetricDef = { ...waktu, id: 'm2', kind: 'ya_tidak', baselineValue: 0.5, thresholdValue: 0.7, direction: 'naik_lebih_baik' };
    const e = estimateMetric(m, obs('m2', [1, 1, 0, 1, 1]));
    expect(e.method).toBe('proporsi_wilson');
    expect(e.estimate).toBeCloseTo(0.8, 10);
    expect(e.interval!.lower).toBeGreaterThan(0.3);
    const bad = estimateMetric(m, obs('m2', [1, 2, 0]));
    expect(bad.method).toBe('tidak_ada');
  });
});

describe('evaluateCriterion', () => {
  it('data kurang hari => belum dapat disimpulkan walau titik memenuhi', () => {
    const r = evaluateCriterion(crit(), waktu, obs('m1', [3.0, 3.1]));
    expect(r.verdict).toBe('belum_dapat_disimpulkan');
    expect(r.pointEstimateMeets).toBe(true);
    expect(r.reason).toMatch(/minimal 3 hari/);
  });
  it('seluruh interval di bawah ambang => terpenuhi', () => {
    const r = evaluateCriterion(crit(), waktu, obs('m1', [3.0, 3.1, 3.0, 3.2, 3.1, 3.0]));
    expect(r.verdict).toBe('terpenuhi');
    expect(r.measuredInterval!.upper).toBeLessThanOrEqual(3.5);
  });
  it('seluruh interval di atas ambang => tidak terpenuhi', () => {
    const r = evaluateCriterion(crit(), waktu, obs('m1', [4.5, 4.4, 4.6, 4.5, 4.4]));
    expect(r.verdict).toBe('tidak_terpenuhi');
  });
  it('interval melintasi ambang walau titik lolos => belum dapat disimpulkan', () => {
    const r = evaluateCriterion(crit(), waktu, obs('m1', [2.0, 5.0, 3.0, 4.0, 2.5, 3.2]));
    expect(r.pointEstimateMeets).toBe(true);
    expect(r.verdict).toBe('belum_dapat_disimpulkan');
    expect(r.reason).toMatch(/melintasi ambang/);
  });
  it('perubahan relatif memakai garis dasar (turun 10% dari 4.2 = 3.78)', () => {
    const c = crit({ kind: 'relative_change', comparator: 'lte', value: -0.1 });
    const ok = evaluateCriterion(c, waktu, obs('m1', [3.3, 3.2, 3.3, 3.25, 3.3]));
    expect(ok.verdict).toBe('terpenuhi');
    expect(ok.measured!).toBeLessThan(-0.2);
    const none = evaluateCriterion(c, waktu, obs('m1', [4.2, 4.3, 4.1, 4.25, 4.15]));
    expect(none.verdict).toBe('tidak_terpenuhi');
  });
  it('garis dasar nol => perubahan relatif tak terdefinisi', () => {
    const m = { ...waktu, baselineValue: 0 };
    const r = evaluateCriterion(crit({ kind: 'relative_change', value: 0.1 }), m, obs('m1', [1, 1, 1, 1]));
    expect(r.verdict).toBe('belum_dapat_disimpulkan');
    expect(r.reason).toMatch(/garis dasar bernilai nol/);
  });
  it('within_band: dalam pita atau di luar pita', () => {
    const c = crit({ kind: 'within_band', value: 0.5 });
    expect(evaluateCriterion(c, waktu, obs('m1', [4.2, 4.3, 4.1, 4.25, 4.15])).verdict).toBe('terpenuhi');
    expect(evaluateCriterion(c, waktu, obs('m1', [5.5, 5.6, 5.4, 5.5, 5.45])).verdict).toBe('tidak_terpenuhi');
  });
  it('metrik tidak ditemukan atau tanpa data', () => {
    expect(evaluateCriterion(crit(), undefined, []).verdict).toBe('belum_dapat_disimpulkan');
    expect(evaluateCriterion(crit(), waktu, []).reason).toBe('Belum ada data.');
  });
  it('gte: terpenuhi bila batas bawah >= ambang', () => {
    const naik: MetricDef = { ...waktu, id: 'm3', direction: 'naik_lebih_baik', baselineValue: 14, thresholdValue: 20 };
    const r = evaluateCriterion(crit({ metricId: 'm3', comparator: 'gte', value: 20 }), naik, obs('m3', [22, 22, 23, 22, 21]));
    expect(r.verdict).toBe('terpenuhi');
    const k = evaluateCriterion(crit({ metricId: 'm3', comparator: 'gte', value: 20 }), naik, obs('m3', [10, 11, 12, 10, 11]));
    expect(k.verdict).toBe('tidak_terpenuhi');
  });

  it('property: perbandingan menurut titik tidak pernah bertentangan dengan verdict pasti', () => {
    const vals = fc.array(fc.double({ min: 0, max: 10, noNaN: true }), { minLength: 3, maxLength: 20 });
    fc.assert(
      fc.property(vals, fc.double({ min: 0, max: 10, noNaN: true }), (xs, limit) => {
        const r = evaluateCriterion(crit({ value: limit }), waktu, obs('m1', xs));
        if (r.verdict === 'terpenuhi') return r.pointEstimateMeets === true;
        if (r.verdict === 'tidak_terpenuhi') return r.pointEstimateMeets === false;
        return true;
      }),
    );
  });
  it('property: menaikkan semua nilai tidak membuat kriteria lte lebih mudah terpenuhi', () => {
    const vals = fc.array(fc.double({ min: 0, max: 10, noNaN: true }), { minLength: 3, maxLength: 15 });
    const rank = (v: Verdict) => ({ tidak_terpenuhi: 0, belum_dapat_disimpulkan: 1, terpenuhi: 2 })[v];
    fc.assert(
      fc.property(vals, fc.double({ min: 0, max: 5, noNaN: true }), fc.double({ min: 0, max: 10, noNaN: true }), (xs, shift, limit) => {
        const a = evaluateCriterion(crit({ value: limit }), waktu, obs('m1', xs));
        const b = evaluateCriterion(crit({ value: limit }), waktu, obs('m1', xs.map((x) => x + shift)));
        return rank(b.verdict) <= rank(a.verdict);
      }),
    );
  });
  it('property: urutan pencatatan tidak mengubah hasil', () => {
    const vals = fc.array(fc.double({ min: 0, max: 10, noNaN: true }), { minLength: 3, maxLength: 15 });
    fc.assert(
      fc.property(vals, fc.infiniteStream(fc.nat()), (xs, _s) => {
        const o = obs('m1', xs);
        const shuffled = [...o].reverse();
        const a = evaluateCriterion(crit(), waktu, o);
        const b = evaluateCriterion(crit(), waktu, shuffled);
        return a.verdict === b.verdict && Math.abs((a.measured ?? 0) - (b.measured ?? 0)) < 1e-9;
      }),
    );
  });
});

describe('combineVerdicts', () => {
  const T: Verdict = 'terpenuhi';
  const F: Verdict = 'tidak_terpenuhi';
  const U: Verdict = 'belum_dapat_disimpulkan';
  it('all', () => {
    expect(combineVerdicts({ mode: 'all' }, [T, T])).toBe(T);
    expect(combineVerdicts({ mode: 'all' }, [T, U])).toBe(U);
    expect(combineVerdicts({ mode: 'all' }, [T, F, U])).toBe(F);
  });
  it('any', () => {
    expect(combineVerdicts({ mode: 'any' }, [F, T])).toBe(T);
    expect(combineVerdicts({ mode: 'any' }, [F, F])).toBe(F);
    expect(combineVerdicts({ mode: 'any' }, [F, U])).toBe(U);
  });
  it('k_of_n', () => {
    expect(combineVerdicts({ mode: 'k_of_n', k: 2 }, [T, T, F])).toBe(T);
    expect(combineVerdicts({ mode: 'k_of_n', k: 2 }, [T, F, F])).toBe(F);
    expect(combineVerdicts({ mode: 'k_of_n', k: 2 }, [T, F, U])).toBe(U);
    expect(combineVerdicts({ mode: 'k_of_n', k: 99 }, [T, T])).toBe(T); // k dijepit ke n
  });
  it('tanpa kriteria tidak pernah terpenuhi', () => {
    expect(combineVerdicts({ mode: 'all' }, [])).toBe(U);
    expect(combineVerdicts({ mode: 'any' }, [])).toBe(U);
  });
  it('property: all <= k_of_n(n) setara all; any setara k_of_n(1); hasil monoton terhadap perbaikan kriteria', () => {
    const v = fc.constantFrom<Verdict>(T, F, U);
    const rank = (x: Verdict) => ({ tidak_terpenuhi: 0, belum_dapat_disimpulkan: 1, terpenuhi: 2 })[x];
    fc.assert(
      fc.property(fc.array(v, { minLength: 1, maxLength: 8 }), (vs) => {
        expect(combineVerdicts({ mode: 'k_of_n', k: vs.length }, vs)).toBe(combineVerdicts({ mode: 'all' }, vs));
        expect(combineVerdicts({ mode: 'k_of_n', k: 1 }, vs)).toBe(combineVerdicts({ mode: 'any' }, vs));
        // memperbaiki satu kriteria satu tingkat tidak boleh memperburuk hasil
        for (const mode of ['all', 'any'] as const) {
          const before = rank(combineVerdicts({ mode }, vs));
          const improved = vs.map((x, i) => (i === 0 && x !== T ? (x === F ? U : T) : x));
          expect(rank(combineVerdicts({ mode }, improved))).toBeGreaterThanOrEqual(before);
        }
      }),
    );
  });
});

describe('evaluateRule', () => {
  const keluhan: MetricDef = { ...waktu, id: 'm3', name: 'Keluhan', baselineValue: 1.2, thresholdValue: 1.0, unit: 'keluhan' };
  it('menggabungkan kriteria, menyertakan batasan, tidak memakai kata terlarang', () => {
    const data = [...obs('m1', [3.1, 3.0, 3.2, 3.1, 3.0]), ...obs('m3', [0.4, 0.5, 0.6, 0.5, 0.4])];
    const r = evaluateRule(
      { mode: 'all', criteria: [crit(), crit({ id: 'c2', metricId: 'm3', value: 1.0 })] },
      [waktu, keluhan],
      data,
    );
    expect(r.verdict).toBe('terpenuhi');
    expect(r.satisfied).toBe(2);
    expect(r.limitations).toBe(METHOD_LIMITATIONS);
    expect(r.limitations.length).toBeGreaterThanOrEqual(5);
    expect(r.summary).not.toMatch(/\bpasti benar\b|signifikan secara statistik/i);
    expect(r.summary).toMatch(/bukan bukti pasti/);
  });
  it('tanpa kriteria => belum dapat disimpulkan', () => {
    expect(evaluateRule({ mode: 'all', criteria: [] }, [waktu], []).verdict).toBe('belum_dapat_disimpulkan');
  });
  it('semua ringkasan verdict menyebut ketidakpastian', () => {
    const none = evaluateRule({ mode: 'all', criteria: [crit()] }, [waktu], []);
    expect(none.summary).toMatch(/belum cukup/);
  });
});
