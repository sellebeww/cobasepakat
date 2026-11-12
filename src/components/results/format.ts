import type { CriterionResult, MetricEstimate } from '../../core';

export function fmt(n: number | null | undefined, digits = 2): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '-';
  return n.toLocaleString('id-ID', { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}

export function fmtPct(n: number | null | undefined, digits = 0): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '-';
  const v = n * 100;
  return `${v > 0 ? '+' : ''}${v.toLocaleString('id-ID', { maximumFractionDigits: digits })}%`;
}

export function fmtInterval(i: { lower: number; upper: number } | null, digits = 2): string {
  return i ? `${fmt(i.lower, digits)} sampai ${fmt(i.upper, digits)}` : 'belum dapat dihitung';
}

/** Nilai terukur kriteria dalam satuan yang sesuai (persen untuk perubahan relatif). */
export function describeMeasured(r: CriterionResult, unit: string): { value: string; interval: string; target: string } {
  if (r.criterion.kind === 'relative_change') {
    return {
      value: fmtPct(r.measured, 1),
      interval: r.measuredInterval ? `${fmtPct(r.measuredInterval.lower, 1)} sampai ${fmtPct(r.measuredInterval.upper, 1)}` : 'belum dapat dihitung',
      target: `${r.criterion.comparator === 'lte' ? '≤' : '≥'} ${fmtPct(r.criterion.value, 1)}`,
    };
  }
  if (r.criterion.kind === 'within_band') {
    return {
      value: `${fmt(r.measured)} ${unit}`,
      interval: r.measuredInterval ? `${fmt(r.measuredInterval.lower)} sampai ${fmt(r.measuredInterval.upper)} ${unit}` : 'belum dapat dihitung',
      target: `selisih dari garis dasar ≤ ${fmt(r.criterion.value)} ${unit}`,
    };
  }
  return {
    value: `${fmt(r.measured)} ${unit}`,
    interval: r.measuredInterval ? `${fmt(r.measuredInterval.lower)} sampai ${fmt(r.measuredInterval.upper)} ${unit}` : 'belum dapat dihitung',
    target: `${r.criterion.comparator === 'lte' ? '≤' : '≥'} ${fmt(r.criterion.value)} ${unit}`,
  };
}

export function methodLabel(m: MetricEstimate['method']): string {
  if (m === 'rata_rata_harian_t') return 'rata-rata harian, interval t 95%';
  if (m === 'proporsi_wilson') return 'proporsi, interval Wilson 95%';
  return 'belum ada interval';
}
