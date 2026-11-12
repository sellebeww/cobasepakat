import { summarizeSeries, type SeriesSummary } from './aggregate';
import { meanInterval, relativeChange, wilsonInterval, DEFAULT_LEVEL } from './stats';
import type { Criterion, DecisionRule, MetricDef, Observation, Verdict } from './types';

export const DEFAULT_MIN_DAYS = 3;

/** Batasan metode yang selalu menyertai hasil. Jangan dihapus dari tampilan. */
export const METHOD_LIMITATIONS: readonly string[] = [
  'Satuan analisis adalah rata-rata harian; dianggap independen antar hari. Tren, hari kerja versus akhir pekan, dan cuaca dapat melanggar anggapan ini.',
  'Garis dasar diperlakukan sebagai angka tetap tanpa ketidakpastian, sehingga interval perubahan relatif cenderung terlalu sempit.',
  'Tidak ada kelompok pembanding paralel: perubahan tidak bisa dipisahkan dari faktor lain yang ikut berubah.',
  'Beberapa metrik dinilai sekaligus tanpa koreksi perbandingan ganda.',
  'Hasil ini membantu musyawarah dan bukan bukti pasti. Interval berarti rentang yang masuk akal menurut data yang ada, bukan jaminan.',
];

export interface MetricEstimate {
  metric: MetricDef;
  series: SeriesSummary;
  /** Rata-rata keseluruhan dari rata-rata harian (atau proporsi untuk ya_tidak). Null bila tidak ada data. */
  estimate: number | null;
  /** Interval kepercayaan. Null bila data belum cukup untuk menaksir sebaran. */
  interval: { lower: number; upper: number; level: number } | null;
  /** Dasar interval, untuk ditampilkan apa adanya. */
  method: 'rata_rata_harian_t' | 'proporsi_wilson' | 'tidak_ada';
  /** Perubahan relatif titik terhadap garis dasar (0.1 = +10%). Null bila tak terdefinisi. */
  changeVsBaseline: number | null;
}

export function estimateMetric(
  metric: MetricDef,
  observations: readonly Observation[],
  level = DEFAULT_LEVEL,
): MetricEstimate {
  const series = summarizeSeries(observations, metric.id);
  if (series.observations === 0) {
    return { metric, series, estimate: null, interval: null, method: 'tidak_ada', changeVsBaseline: null };
  }
  if (metric.kind === 'ya_tidak') {
    const successes = series.values.filter((v) => v === 1).length;
    const valid = series.values.every((v) => v === 0 || v === 1);
    const ci = valid ? wilsonInterval(successes, series.values.length, level) : null;
    const est = valid ? successes / series.values.length : null;
    return {
      metric,
      series,
      estimate: est,
      interval: ci ? { lower: ci.lower, upper: ci.upper, level } : null,
      method: ci ? 'proporsi_wilson' : 'tidak_ada',
      changeVsBaseline: est === null ? null : relativeChange(est, metric.baselineValue),
    };
  }
  const dailyValues = series.daily.map((d) => d.value);
  const ci = meanInterval(dailyValues, level);
  const est = dailyValues.reduce((a, b) => a + b, 0) / dailyValues.length;
  return {
    metric,
    series,
    estimate: est,
    interval: ci ? { lower: ci.lower, upper: ci.upper, level } : null,
    method: ci ? 'rata_rata_harian_t' : 'tidak_ada',
    changeVsBaseline: relativeChange(est, metric.baselineValue),
  };
}

export interface CriterionResult {
  criterion: Criterion;
  metricName: string;
  verdict: Verdict;
  /** Apakah estimasi titik saja memenuhi kriteria (tanpa memperhitungkan ketidakpastian). Null bila tak ada data. */
  pointEstimateMeets: boolean | null;
  /** Nilai yang dibandingkan (skala sesuai jenis kriteria) dan intervalnya. */
  measured: number | null;
  measuredInterval: { lower: number; upper: number } | null;
  /** Ambang yang dipakai. */
  target: number;
  days: number;
  observations: number;
  reason: string;
  /** Kode alasan stabil untuk terjemahan di UI. */
  reasonCode: ReasonCode;
}

export type ReasonCode =
  | 'no_metric'
  | 'no_data'
  | 'baseline_zero'
  | 'min_days'
  | 'no_interval'
  | 'ci_met'
  | 'ci_failed'
  | 'ci_straddle';

function passesPoint(c: Criterion, value: number): boolean {
  if (c.kind === 'within_band') return Math.abs(value) <= c.value;
  return c.comparator === 'lte' ? value <= c.value : value >= c.value;
}

/** Kriteria terpenuhi pasti bila seluruh interval ada di sisi lolos; gagal pasti bila seluruhnya di sisi gagal. */
function intervalVerdict(c: Criterion, lower: number, upper: number): Verdict {
  if (c.kind === 'within_band') {
    // |x| <= v untuk semua x di [lower, upper]  <=>  lower >= -v dan upper <= v
    if (lower >= -c.value && upper <= c.value) return 'terpenuhi';
    // gagal pasti bila seluruh interval berada di luar [-v, v]
    if (lower > c.value || upper < -c.value) return 'tidak_terpenuhi';
    return 'belum_dapat_disimpulkan';
  }
  if (c.comparator === 'lte') {
    if (upper <= c.value) return 'terpenuhi';
    if (lower > c.value) return 'tidak_terpenuhi';
    return 'belum_dapat_disimpulkan';
  }
  if (lower >= c.value) return 'terpenuhi';
  if (upper < c.value) return 'tidak_terpenuhi';
  return 'belum_dapat_disimpulkan';
}

export function evaluateCriterion(
  criterion: Criterion,
  metric: MetricDef | undefined,
  observations: readonly Observation[],
  level = DEFAULT_LEVEL,
): CriterionResult {
  const base = {
    criterion,
    metricName: metric?.name ?? criterion.metricId,
    target: criterion.value,
  };
  if (!metric) {
    return {
      ...base,
      verdict: 'belum_dapat_disimpulkan',
      pointEstimateMeets: null,
      measured: null,
      measuredInterval: null,
      days: 0,
      observations: 0,
      reason: 'Metrik yang dirujuk kriteria tidak ditemukan.',
      reasonCode: 'no_metric',
    };
  }
  const est = estimateMetric(metric, observations, level);
  const minDays = criterion.minDays ?? DEFAULT_MIN_DAYS;
  const days = est.series.days;
  const noData = {
    ...base,
    pointEstimateMeets: null,
    measured: null,
    measuredInterval: null,
    days,
    observations: est.series.observations,
  };
  if (est.estimate === null) {
    return { ...noData, verdict: 'belum_dapat_disimpulkan', reason: 'Belum ada data.', reasonCode: 'no_data' };
  }

  // Ubah rata-rata dan intervalnya ke skala kriteria.
  const transform = (x: number): number | null => {
    if (criterion.kind === 'absolute') return x;
    if (criterion.kind === 'within_band') return x - metric.baselineValue;
    return relativeChange(x, metric.baselineValue);
  };
  const measured = transform(est.estimate);
  if (measured === null) {
    return {
      ...noData,
      verdict: 'belum_dapat_disimpulkan',
      reason: 'Perubahan relatif tidak terdefinisi karena garis dasar bernilai nol.',
      reasonCode: 'baseline_zero',
    };
  }
  const pointEstimateMeets = passesPoint(criterion, measured);
  let measuredInterval: { lower: number; upper: number } | null = null;
  if (est.interval) {
    const a = transform(est.interval.lower);
    const b = transform(est.interval.upper);
    if (a !== null && b !== null) measuredInterval = { lower: Math.min(a, b), upper: Math.max(a, b) };
  }
  const common = { ...base, pointEstimateMeets, measured, measuredInterval, days, observations: est.series.observations };

  if (days < minDays) {
    return {
      ...common,
      verdict: 'belum_dapat_disimpulkan',
      reason: `Baru ${days} hari berdata; kriteria ini baru dinilai setelah minimal ${minDays} hari.`,
      reasonCode: 'min_days',
    };
  }
  if (!measuredInterval) {
    return {
      ...common,
      verdict: 'belum_dapat_disimpulkan',
      reason: 'Interval ketidakpastian tidak dapat dihitung dari data yang ada.',
      reasonCode: 'no_interval',
    };
  }
  const verdict = intervalVerdict(criterion, measuredInterval.lower, measuredInterval.upper);
  const reason =
    verdict === 'terpenuhi'
      ? 'Seluruh interval kepercayaan berada di sisi yang memenuhi kriteria.'
      : verdict === 'tidak_terpenuhi'
        ? 'Seluruh interval kepercayaan berada di sisi yang tidak memenuhi kriteria.'
        : 'Interval kepercayaan melintasi ambang, jadi data belum cukup untuk menyimpulkan.';
  const reasonCode: ReasonCode = verdict === 'terpenuhi' ? 'ci_met' : verdict === 'tidak_terpenuhi' ? 'ci_failed' : 'ci_straddle';
  return { ...common, verdict, reason, reasonCode };
}

export interface RuleResult {
  verdict: Verdict;
  criteria: CriterionResult[];
  satisfied: number;
  failed: number;
  undecided: number;
  /** Ringkasan satu kalimat yang hati-hati. Tidak pernah memakai kata "pasti" atau "signifikan". */
  summary: string;
  limitations: readonly string[];
}

export function combineVerdicts(rule: Pick<DecisionRule, 'mode' | 'k'>, verdicts: readonly Verdict[]): Verdict {
  const n = verdicts.length;
  if (n === 0) return 'belum_dapat_disimpulkan';
  const satisfied = verdicts.filter((v) => v === 'terpenuhi').length;
  const failed = verdicts.filter((v) => v === 'tidak_terpenuhi').length;
  if (rule.mode === 'all') {
    if (failed > 0) return 'tidak_terpenuhi';
    return satisfied === n ? 'terpenuhi' : 'belum_dapat_disimpulkan';
  }
  if (rule.mode === 'any') {
    if (satisfied > 0) return 'terpenuhi';
    return failed === n ? 'tidak_terpenuhi' : 'belum_dapat_disimpulkan';
  }
  const k = Math.min(Math.max(Math.trunc(rule.k ?? n), 1), n);
  if (satisfied >= k) return 'terpenuhi';
  if (failed > n - k) return 'tidak_terpenuhi';
  return 'belum_dapat_disimpulkan';
}

const SUMMARY: Record<Verdict, string> = {
  terpenuhi:
    'Menurut data yang terkumpul, kriteria yang disepakati terpenuhi. Ini taksiran dengan ketidakpastian, bukan bukti pasti.',
  tidak_terpenuhi:
    'Menurut data yang terkumpul, kriteria yang disepakati tidak terpenuhi. Ini taksiran dengan ketidakpastian, bukan bukti pasti.',
  belum_dapat_disimpulkan:
    'Data belum cukup untuk menyimpulkan apakah kriteria terpenuhi. Pertimbangkan memperpanjang pengumpulan data atau memutuskan dengan catatan ketidakpastian.',
};

export function evaluateRule(
  rule: DecisionRule,
  metrics: readonly MetricDef[],
  observations: readonly Observation[],
  level = DEFAULT_LEVEL,
): RuleResult {
  const byId = new Map(metrics.map((m) => [m.id, m]));
  const criteria = rule.criteria.map((c) => evaluateCriterion(c, byId.get(c.metricId), observations, level));
  const verdict = combineVerdicts(rule, criteria.map((c) => c.verdict));
  return {
    verdict,
    criteria,
    satisfied: criteria.filter((c) => c.verdict === 'terpenuhi').length,
    failed: criteria.filter((c) => c.verdict === 'tidak_terpenuhi').length,
    undecided: criteria.filter((c) => c.verdict === 'belum_dapat_disimpulkan').length,
    summary: SUMMARY[verdict],
    limitations: METHOD_LIMITATIONS,
  };
}
