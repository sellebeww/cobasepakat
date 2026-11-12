import { describe, expect, it } from 'vitest';
import { hasErrors, thresholdIsImprovement, validateDesign } from '../src/core/design';
import type { ExperimentDesign, SpaceLimits } from '../src/core/types';

const limits: SpaceLimits = { maxExperimentDays: 30, budgetCeilingWithoutBoard: 2_500_000 };

const base = (): ExperimentDesign => ({
  startDate: '2026-10-15',
  durationDays: 14,
  metrics: [{ id: 'm1', name: 'Waktu', unit: 'menit', kind: 'durasi', direction: 'turun_lebih_baik', baselineValue: 4.2, thresholdValue: 3.5 }],
  decisionRule: { mode: 'all', criteria: [{ id: 'c1', metricId: 'm1', kind: 'absolute', comparator: 'lte', value: 3.5 }] },
  stopRules: [{ id: 's1', severity: 'kritis_henti', trigger: { kind: 'manual' } }],
});

const codes = (d: ExperimentDesign) => validateDesign(d, limits).map((i) => i.code);

describe('validateDesign', () => {
  it('desain sehat tidak punya error', () => {
    expect(hasErrors(validateDesign(base(), limits))).toBe(false);
    expect(codes(base())).toEqual([]);
  });
  it('durasi: tidak valid dan melebihi batas ruang', () => {
    expect(codes({ ...base(), durationDays: 0 })).toContain('duration_invalid');
    expect(codes({ ...base(), durationDays: 31 })).toContain('duration_too_long');
    expect(codes({ ...base(), durationDays: 30 })).not.toContain('duration_too_long');
    expect(codes({ ...base(), startDate: '2026-13-01' })).toContain('start_date_invalid');
  });
  it('metrik: kosong, ID ganda, bukan angka, proporsi di luar 0..1', () => {
    expect(codes({ ...base(), metrics: [] })).toContain('no_metrics');
    const m = base().metrics[0];
    expect(codes({ ...base(), metrics: [m, m] })).toContain('duplicate_metric');
    expect(codes({ ...base(), metrics: [{ ...m, baselineValue: Number.NaN }] })).toContain('baseline_invalid');
    expect(codes({ ...base(), metrics: [{ ...m, thresholdValue: Number.POSITIVE_INFINITY }] })).toContain('threshold_invalid');
    expect(codes({ ...base(), metrics: [{ ...m, kind: 'ya_tidak', baselineValue: 4 }] })).toContain('proportion_baseline');
  });
  it('ambang di sisi yang tidak membaik hanya peringatan', () => {
    const m = { ...base().metrics[0], baselineValue: 1, thresholdValue: 3 };
    const issues = validateDesign({ ...base(), metrics: [m] }, limits);
    expect(issues.find((i) => i.code === 'threshold_not_improvement')?.severity).toBe('warning');
    expect(hasErrors(issues)).toBe(false);
    expect(thresholdIsImprovement({ direction: 'naik_lebih_baik', baselineValue: 14, thresholdValue: 20 })).toBe(true);
    expect(thresholdIsImprovement({ direction: 'naik_lebih_baik', baselineValue: 14, thresholdValue: 10 })).toBe(false);
  });
  it('kriteria: kosong, merujuk metrik tak ada, k di luar rentang, minDays melebihi durasi', () => {
    const d = base();
    expect(codes({ ...d, decisionRule: { mode: 'all', criteria: [] } })).toContain('no_criteria');
    expect(codes({ ...d, decisionRule: { mode: 'all', criteria: [{ ...d.decisionRule.criteria[0], metricId: 'x' }] } })).toContain('criterion_unknown_metric');
    expect(codes({ ...d, decisionRule: { mode: 'k_of_n', k: 2, criteria: d.decisionRule.criteria } })).toContain('k_out_of_range');
    expect(codes({ ...d, decisionRule: { mode: 'k_of_n', criteria: d.decisionRule.criteria } })).toContain('k_out_of_range');
    expect(codes({ ...d, decisionRule: { mode: 'all', criteria: [{ ...d.decisionRule.criteria[0], minDays: 99 }] } })).toContain('criterion_min_days_exceeds');
    expect(codes({ ...d, decisionRule: { mode: 'all', criteria: [{ ...d.decisionRule.criteria[0], minDays: 0 }] } })).toContain('criterion_min_days');
    expect(codes({ ...d, decisionRule: { mode: 'all', criteria: [d.decisionRule.criteria[0], d.decisionRule.criteria[0]] } })).toContain('duplicate_criterion');
  });
  it('aturan berhenti: wajib ada, rujukan metrik, batas, consecutive', () => {
    const d = base();
    expect(codes({ ...d, stopRules: [] })).toContain('no_stop_rules');
    expect(codes({ ...d, stopRules: [{ id: 's', severity: 'waspada', trigger: { kind: 'manual' } }] })).toContain('no_critical_stop_rule');
    const bad = { id: 's', severity: 'kritis_henti' as const, trigger: { kind: 'metric' as const, metricId: 'x', comparator: 'gte' as const, limit: Number.NaN, consecutive: 0 } };
    const c = codes({ ...d, stopRules: [bad] });
    expect(c).toEqual(expect.arrayContaining(['stop_unknown_metric', 'stop_limit_invalid', 'stop_consecutive_invalid']));
  });
  it('anggaran melebihi plafon: peringatan', () => {
    const i = validateDesign({ ...base(), budgetTotal: 3_000_000 }, limits);
    expect(i.find((x) => x.code === 'budget_over_ceiling')?.severity).toBe('warning');
  });
  it('tidak memodifikasi masukan', () => {
    const d = base();
    const snap = JSON.stringify(d);
    validateDesign(d, limits);
    expect(JSON.stringify(d)).toBe(snap);
  });
});
