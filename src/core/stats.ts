/**
 * Statistik dasar, murni dan tanpa dependensi.
 *
 * Batas penting (lihat docs/IMPROVEMENT-PLAN.md bagian 4):
 * - Interval t mengandaikan pengamatan independen dan kira-kira normal.
 * - Tidak ada koreksi untuk autokorelasi, tren, atau perbandingan ganda.
 */

export const DEFAULT_LEVEL = 0.95;

export function mean(xs: readonly number[]): number {
  if (xs.length === 0) return Number.NaN;
  let sum = 0;
  for (const x of xs) sum += x;
  return sum / xs.length;
}

/** Varians sampel (penyebut n-1). NaN bila n < 2. */
export function sampleVariance(xs: readonly number[]): number {
  const n = xs.length;
  if (n < 2) return Number.NaN;
  const m = mean(xs);
  let ss = 0;
  for (const x of xs) ss += (x - m) * (x - m);
  return ss / (n - 1);
}

export function sampleSd(xs: readonly number[]): number {
  return Math.sqrt(sampleVariance(xs));
}

// ---------------------------------------------------------------------------
// Fungsi khusus

/** log Gamma (aproksimasi Lanczos, g=7, n=9). Akurat ~1e-14 untuk x > 0. */
function logGamma(x: number): number {
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  const xx = x - 1;
  let a = c[0];
  const t = xx + 7.5;
  for (let i = 1; i < 9; i++) a += c[i] / (xx + i);
  return 0.5 * Math.log(2 * Math.PI) + (xx + 0.5) * Math.log(t) - t + Math.log(a);
}

/** Fraksi lanjutan untuk beta tak lengkap (Lentz). */
function betaContinuedFraction(a: number, b: number, x: number): number {
  const MAX_ITER = 300;
  const EPS = 3e-16;
  const FPMIN = 1e-300;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAX_ITER; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

/** Beta tak lengkap teregularisasi I_x(a, b). */
export function regularizedIncompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lbeta = logGamma(a + b) - logGamma(a) - logGamma(b);
  const front = Math.exp(lbeta + a * Math.log(x) + b * Math.log(1 - x));
  if (x < (a + 1) / (a + b + 2)) return (front * betaContinuedFraction(a, b, x)) / a;
  return 1 - (front * betaContinuedFraction(b, a, 1 - x)) / b;
}

/** CDF distribusi t Student dengan df derajat bebas (df > 0). */
export function tCdf(t: number, df: number): number {
  if (Number.isNaN(t) || !(df > 0)) return Number.NaN;
  if (t === 0) return 0.5;
  if (!Number.isFinite(df)) return normalCdf(t);
  const x = df / (df + t * t);
  const tail = 0.5 * regularizedIncompleteBeta(x, df / 2, 0.5);
  return t > 0 ? 1 - tail : tail;
}

/** Kuantil distribusi t: nilai t sehingga P(T <= t) = p. Bisekt monoton, akurat ~1e-12. */
export function tQuantile(p: number, df: number): number {
  if (!(p > 0 && p < 1) || !(df > 0)) return Number.NaN;
  if (p === 0.5) return 0;
  if (!Number.isFinite(df)) return normalQuantile(p);
  if (p < 0.5) return -tQuantile(1 - p, df);
  let lo = 0;
  let hi = 1;
  while (tCdf(hi, df) < p) {
    hi *= 2;
    if (hi > 1e12) return Number.POSITIVE_INFINITY;
  }
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (tCdf(mid, df) < p) lo = mid;
    else hi = mid;
    if (hi - lo < 1e-13 * Math.max(1, hi)) break;
  }
  return (lo + hi) / 2;
}

/** CDF normal baku lewat I_x (stabil dan tanpa aproksimasi erf berorde rendah). */
export function normalCdf(z: number): number {
  if (Number.isNaN(z)) return Number.NaN;
  if (z === 0) return 0.5;
  // Phi(z) = 0.5 * (1 + erf(z / sqrt(2))); erf(x) = sign(x) * P(1/2, x^2)
  const x2 = (z * z) / 2;
  const p = regularizedLowerGamma(0.5, x2);
  return z > 0 ? 0.5 + 0.5 * p : 0.5 - 0.5 * p;
}

/** Gamma tak lengkap bawah teregularisasi P(a, x): deret + fraksi lanjutan. */
function regularizedLowerGamma(a: number, x: number): number {
  if (x <= 0) return 0;
  const gln = logGamma(a);
  if (x < a + 1) {
    let ap = a;
    let sum = 1 / a;
    let del = sum;
    for (let n = 0; n < 500; n++) {
      ap += 1;
      del *= x / ap;
      sum += del;
      if (Math.abs(del) < Math.abs(sum) * 1e-16) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - gln);
  }
  const FPMIN = 1e-300;
  let b = x + 1 - a;
  let c = 1 / FPMIN;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i <= 500; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = b + an / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-16) break;
  }
  return 1 - Math.exp(-x + a * Math.log(x) - gln) * h;
}

/** Kuantil normal baku. Bisekt atas normalCdf agar konsisten dengan CDF di atas. */
export function normalQuantile(p: number): number {
  if (!(p > 0 && p < 1)) return Number.NaN;
  if (p === 0.5) return 0;
  if (p < 0.5) return -normalQuantile(1 - p);
  let lo = 0;
  let hi = 1;
  while (normalCdf(hi) < p) hi *= 2;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (normalCdf(mid) < p) lo = mid;
    else hi = mid;
    if (hi - lo < 1e-14 * Math.max(1, hi)) break;
  }
  return (lo + hi) / 2;
}

// ---------------------------------------------------------------------------
// Interval

export interface Interval {
  n: number;
  estimate: number;
  lower: number;
  upper: number;
  level: number;
}

function assertLevel(level: number) {
  if (!(level > 0 && level < 1)) throw new RangeError('level harus di antara 0 dan 1 (eksklusif)');
}

/**
 * Interval kepercayaan rata-rata (t Student). Mengembalikan null bila n < 2
 * karena simpangan baku tidak dapat diestimasi.
 */
export function meanInterval(xs: readonly number[], level = DEFAULT_LEVEL): Interval | null {
  assertLevel(level);
  const n = xs.length;
  if (n < 2) return null;
  const m = mean(xs);
  const se = sampleSd(xs) / Math.sqrt(n);
  const q = tQuantile(1 - (1 - level) / 2, n - 1);
  const half = q * se;
  return { n, estimate: m, lower: m - half, upper: m + half, level };
}

/**
 * Interval Wilson untuk proporsi. Lebih baik daripada Wald untuk n kecil
 * dan proporsi dekat 0 atau 1. Mengandaikan percobaan Bernoulli independen.
 */
export function wilsonInterval(successes: number, n: number, level = DEFAULT_LEVEL): Interval | null {
  assertLevel(level);
  if (!Number.isInteger(successes) || !Number.isInteger(n) || n <= 0 || successes < 0 || successes > n) {
    return null;
  }
  const z = normalQuantile(1 - (1 - level) / 2);
  const p = successes / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const center = (p + z2 / (2 * n)) / denom;
  const half = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / denom;
  return {
    n,
    estimate: p,
    lower: Math.max(0, center - half),
    upper: Math.min(1, center + half),
    level,
  };
}

/** Perubahan relatif terhadap garis dasar. Null bila garis dasar nol atau tidak hingga. */
export function relativeChange(value: number, baseline: number): number | null {
  if (!Number.isFinite(value) || !Number.isFinite(baseline) || baseline === 0) return null;
  return (value - baseline) / Math.abs(baseline);
}
