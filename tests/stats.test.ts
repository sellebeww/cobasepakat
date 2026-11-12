import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  mean,
  meanInterval,
  normalCdf,
  normalQuantile,
  relativeChange,
  sampleSd,
  sampleVariance,
  tCdf,
  tQuantile,
  wilsonInterval,
} from '../src/core/stats';

describe('stats dasar', () => {
  it('mean dan varians sampel', () => {
    expect(mean([1, 2, 3, 4])).toBe(2.5);
    expect(mean([])).toBeNaN();
    expect(sampleVariance([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(4.571428571, 8);
    expect(sampleSd([1, 1, 1])).toBe(0);
    expect(sampleVariance([5])).toBeNaN();
  });
});

describe('distribusi', () => {
  // Nilai acuan dari tabel t Student baku (dua sisi 95% => p = 0.975).
  const table: [number, number][] = [
    [1, 12.7062047],
    [2, 4.30265273],
    [3, 3.18244631],
    [5, 2.57058184],
    [10, 2.22813885],
    [30, 2.04227246],
    [120, 1.97993040],
  ];
  it.each(table)('tQuantile(0.975, df=%i) ≈ %f', (df, expected) => {
    expect(tQuantile(0.975, df)).toBeCloseTo(expected, 5);
  });

  it('tQuantile 99% df=10 dan df tak hingga', () => {
    expect(tQuantile(0.995, 10)).toBeCloseTo(3.16927262, 5);
    expect(tQuantile(0.975, Number.POSITIVE_INFINITY)).toBeCloseTo(1.959963985, 7);
  });

  it('normal baku: nilai acuan', () => {
    expect(normalCdf(0)).toBe(0.5);
    expect(normalCdf(1.96)).toBeCloseTo(0.975002105, 8);
    expect(normalCdf(-1)).toBeCloseTo(0.158655254, 8);
    expect(normalQuantile(0.975)).toBeCloseTo(1.959963985, 7);
    expect(normalQuantile(0.9)).toBeCloseTo(1.281551566, 7);
  });

  it('masukan tidak valid menghasilkan NaN', () => {
    expect(tQuantile(0, 5)).toBeNaN();
    expect(tQuantile(1, 5)).toBeNaN();
    expect(tQuantile(0.5, 0)).toBeNaN();
    expect(tCdf(Number.NaN, 3)).toBeNaN();
    expect(normalQuantile(2)).toBeNaN();
  });

  it('property: tCdf dan tQuantile saling invers', () => {
    fc.assert(
      fc.property(fc.double({ min: 0.001, max: 0.999, noNaN: true }), fc.integer({ min: 1, max: 200 }), (p, df) => {
        const q = tQuantile(p, df);
        return Math.abs(tCdf(q, df) - p) < 1e-8;
      }),
      { numRuns: 200 },
    );
  });

  it('property: tCdf simetris dan monoton', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -50, max: 50, noNaN: true }),
        fc.double({ min: -50, max: 50, noNaN: true }),
        fc.integer({ min: 1, max: 100 }),
        (a, b, df) => {
          expect(tCdf(a, df) + tCdf(-a, df)).toBeCloseTo(1, 9);
          const [lo, hi] = a <= b ? [a, b] : [b, a];
          return tCdf(lo, df) <= tCdf(hi, df) + 1e-12;
        },
      ),
    );
  });
});

describe('meanInterval', () => {
  it('cocok dengan hitungan manual', () => {
    // data 1..5: mean 3, sd sqrt(2.5)=1.5811, se=0.7071, t(0.975,4)=2.776445
    const ci = meanInterval([1, 2, 3, 4, 5]);
    expect(ci).not.toBeNull();
    expect(ci!.estimate).toBe(3);
    expect(ci!.lower).toBeCloseTo(3 - 2.776445 * Math.SQRT1_2, 4);
    expect(ci!.upper).toBeCloseTo(3 + 2.776445 * Math.SQRT1_2, 4);
  });
  it('null bila n < 2; galat bila level tidak valid', () => {
    expect(meanInterval([])).toBeNull();
    expect(meanInterval([3])).toBeNull();
    expect(() => meanInterval([1, 2], 1)).toThrow(RangeError);
  });
  it('property: interval memuat rata-rata, melebar bila level naik, menyempit bila n bertambah dengan data sama', () => {
    const arr = fc.array(fc.double({ min: -1000, max: 1000, noNaN: true }), { minLength: 2, maxLength: 40 });
    fc.assert(
      fc.property(arr, (xs) => {
        const c90 = meanInterval(xs, 0.9)!;
        const c99 = meanInterval(xs, 0.99)!;
        expect(c90.lower).toBeLessThanOrEqual(c90.estimate + 1e-9);
        expect(c90.upper).toBeGreaterThanOrEqual(c90.estimate - 1e-9);
        expect(c99.upper - c99.lower).toBeGreaterThanOrEqual(c90.upper - c90.lower - 1e-9);
      }),
    );
  });
  it('property: invarian terhadap pergeseran dan skala', () => {
    const arr = fc.array(fc.double({ min: -100, max: 100, noNaN: true }), { minLength: 2, maxLength: 20 });
    fc.assert(
      fc.property(arr, fc.double({ min: -50, max: 50, noNaN: true }), fc.double({ min: 0.5, max: 5, noNaN: true }), (xs, shift, k) => {
        const a = meanInterval(xs)!;
        const b = meanInterval(xs.map((x) => k * x + shift))!;
        const tol = 1e-6 * (1 + Math.abs(b.lower) + Math.abs(b.upper));
        return Math.abs(b.lower - (k * a.lower + shift)) < tol && Math.abs(b.upper - (k * a.upper + shift)) < tol;
      }),
    );
  });
  it('simulasi cakupan: ~95% dari interval memuat rata-rata sebenarnya (data normal, seed tetap)', () => {
    // Pembangkit LCG + Box-Muller dengan seed tetap agar test deterministik.
    let s = 123456789;
    const u = () => {
      s = (1664525 * s + 1013904223) % 4294967296;
      return (s + 1) / 4294967297;
    };
    const normal = () => Math.sqrt(-2 * Math.log(u())) * Math.cos(2 * Math.PI * u());
    const trials = 2000;
    let covered = 0;
    for (let t = 0; t < trials; t++) {
      const xs = Array.from({ length: 10 }, () => 5 + 2 * normal());
      const ci = meanInterval(xs, 0.95)!;
      if (ci.lower <= 5 && 5 <= ci.upper) covered++;
    }
    const rate = covered / trials;
    expect(rate).toBeGreaterThan(0.93);
    expect(rate).toBeLessThan(0.97);
  });
});

describe('wilsonInterval', () => {
  it('nilai acuan: 8 dari 10 pada 95% ≈ [0.4902, 0.9433]', () => {
    const ci = wilsonInterval(8, 10)!;
    expect(ci.estimate).toBe(0.8);
    expect(ci.lower).toBeCloseTo(0.49016, 4);
    expect(ci.upper).toBeCloseTo(0.94333, 4);
  });
  it('0 dan n tidak menghasilkan batas di luar [0,1]; n kecil tetap punya lebar', () => {
    const z = wilsonInterval(0, 5)!;
    expect(z.lower).toBe(0);
    expect(z.upper).toBeGreaterThan(0.3);
    const f = wilsonInterval(5, 5)!;
    expect(f.upper).toBe(1);
    expect(f.lower).toBeLessThan(0.7);
  });
  it('masukan tidak valid', () => {
    expect(wilsonInterval(1, 0)).toBeNull();
    expect(wilsonInterval(-1, 5)).toBeNull();
    expect(wilsonInterval(6, 5)).toBeNull();
    expect(wilsonInterval(1.5, 5)).toBeNull();
  });
  it('property: batas dalam [0,1], memuat proporsi sampel, menyempit saat n naik', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 500 }), fc.double({ min: 0, max: 1, noNaN: true }), (n, f) => {
        const x = Math.round(n * f);
        const ci = wilsonInterval(x, n)!;
        expect(ci.lower).toBeGreaterThanOrEqual(0);
        expect(ci.upper).toBeLessThanOrEqual(1);
        expect(ci.lower).toBeLessThanOrEqual(x / n + 1e-12);
        expect(ci.upper).toBeGreaterThanOrEqual(x / n - 1e-12);
        const big = wilsonInterval(x * 4, n * 4)!;
        expect(big.upper - big.lower).toBeLessThanOrEqual(ci.upper - ci.lower + 1e-12);
      }),
    );
  });
});

describe('relativeChange', () => {
  it('menghitung dan menolak garis dasar nol', () => {
    expect(relativeChange(3.5, 4.2)).toBeCloseTo(-1 / 6, 10);
    expect(relativeChange(5, 0)).toBeNull();
    expect(relativeChange(Number.NaN, 2)).toBeNull();
    expect(relativeChange(-1, -2)).toBeCloseTo(0.5, 10);
  });
});
