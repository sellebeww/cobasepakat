import { dateToDayNumber } from './dates';
import type { ExperimentDesign, MetricDef, SpaceLimits } from './types';

export type IssueSeverity = 'error' | 'warning';

export interface DesignIssue {
  severity: IssueSeverity;
  code: string;
  message: string;
  /** Rujukan opsional ke metrik/kriteria/aturan yang bermasalah. */
  ref?: string;
}

/** Apakah ambang berada di sisi "membaik" dari garis dasar. rentang_tetap selalu dianggap koheren. */
export function thresholdIsImprovement(m: Pick<MetricDef, 'direction' | 'baselineValue' | 'thresholdValue'>): boolean {
  if (m.direction === 'naik_lebih_baik') return m.thresholdValue > m.baselineValue;
  if (m.direction === 'turun_lebih_baik') return m.thresholdValue < m.baselineValue;
  return m.thresholdValue >= 0;
}

/**
 * Validasi desain percobaan. Kesalahan (error) menghalangi pengajuan; peringatan (warning)
 * ditampilkan tetapi tidak menghalangi. Fungsi ini murni dan tidak memodifikasi masukan.
 */
export function validateDesign(design: ExperimentDesign, limits: SpaceLimits): DesignIssue[] {
  const out: DesignIssue[] = [];
  const err = (code: string, message: string, ref?: string) => out.push({ severity: 'error', code, message, ref });
  const warn = (code: string, message: string, ref?: string) => out.push({ severity: 'warning', code, message, ref });

  if (dateToDayNumber(design.startDate) === null) err('start_date_invalid', 'Tanggal mulai tidak valid (format YYYY-MM-DD).');
  if (!Number.isInteger(design.durationDays) || design.durationDays < 1) {
    err('duration_invalid', 'Durasi harus bilangan bulat minimal 1 hari.');
  } else if (design.durationDays > limits.maxExperimentDays) {
    err('duration_too_long', `Durasi ${design.durationDays} hari melebihi batas ruang (${limits.maxExperimentDays} hari).`);
  }

  if (design.metrics.length === 0) err('no_metrics', 'Belum ada metrik ukuran hasil.');
  const metricIds = new Set<string>();
  for (const m of design.metrics) {
    if (metricIds.has(m.id)) err('duplicate_metric', `Metrik "${m.name}" memiliki ID ganda.`, m.id);
    metricIds.add(m.id);
    if (!Number.isFinite(m.baselineValue)) err('baseline_invalid', `Garis dasar metrik "${m.name}" bukan angka.`, m.id);
    if (!Number.isFinite(m.thresholdValue)) err('threshold_invalid', `Ambang metrik "${m.name}" bukan angka.`, m.id);
    if (Number.isFinite(m.baselineValue) && Number.isFinite(m.thresholdValue)) {
      if (!thresholdIsImprovement(m)) {
        warn(
          'threshold_not_improvement',
          `Ambang metrik "${m.name}" tidak berada di sisi yang membaik dari garis dasar. Pastikan ini disengaja (misalnya batas toleransi).`,
          m.id,
        );
      }
      if (m.direction === 'rentang_tetap' && m.thresholdValue < 0) {
        err('band_negative', `Selisih maksimum metrik "${m.name}" tidak boleh negatif.`, m.id);
      }
    }
    if (m.kind === 'ya_tidak' && (m.baselineValue < 0 || m.baselineValue > 1)) {
      err('proportion_baseline', `Garis dasar metrik ya/tidak "${m.name}" harus antara 0 dan 1.`, m.id);
    }
  }

  const { decisionRule } = design;
  if (decisionRule.criteria.length === 0) {
    err('no_criteria', 'Aturan keputusan belum memiliki kriteria terukur. Kunci kriteria sebelum data masuk.');
  }
  const criterionIds = new Set<string>();
  for (const c of decisionRule.criteria) {
    if (criterionIds.has(c.id)) err('duplicate_criterion', 'Ada kriteria dengan ID ganda.', c.id);
    criterionIds.add(c.id);
    if (!metricIds.has(c.metricId)) err('criterion_unknown_metric', 'Kriteria merujuk metrik yang tidak ada.', c.id);
    if (!Number.isFinite(c.value)) err('criterion_value_invalid', 'Nilai kriteria bukan angka.', c.id);
    if (c.minDays !== undefined && (!Number.isInteger(c.minDays) || c.minDays < 1)) {
      err('criterion_min_days', 'Jumlah hari minimum kriteria harus bilangan bulat >= 1.', c.id);
    } else if (c.minDays !== undefined && Number.isInteger(design.durationDays) && c.minDays > design.durationDays) {
      err('criterion_min_days_exceeds', 'Jumlah hari minimum kriteria melebihi durasi percobaan.', c.id);
    }
  }
  if (decisionRule.mode === 'k_of_n') {
    const n = decisionRule.criteria.length;
    if (!Number.isInteger(decisionRule.k) || (decisionRule.k ?? 0) < 1 || (decisionRule.k ?? 0) > n) {
      err('k_out_of_range', `Nilai k harus bilangan bulat antara 1 dan ${n}.`);
    }
  }

  if (design.stopRules.length === 0) {
    err('no_stop_rules', 'Wajib ada minimal satu aturan berhenti darurat.');
  } else if (!design.stopRules.some((r) => r.severity === 'kritis_henti')) {
    warn('no_critical_stop_rule', 'Tidak ada aturan berhenti berstatus kritis. Pertimbangkan menambah satu.');
  }
  for (const r of design.stopRules) {
    if (r.trigger.kind === 'metric') {
      if (!metricIds.has(r.trigger.metricId)) err('stop_unknown_metric', 'Aturan berhenti merujuk metrik yang tidak ada.', r.id);
      if (!Number.isFinite(r.trigger.limit)) err('stop_limit_invalid', 'Batas aturan berhenti bukan angka.', r.id);
      if (!Number.isInteger(r.trigger.consecutive) || r.trigger.consecutive < 1) {
        err('stop_consecutive_invalid', 'Jumlah pengamatan berturut-turut harus bilangan bulat >= 1.', r.id);
      }
    }
  }

  if (design.budgetTotal !== undefined && design.budgetTotal > limits.budgetCeilingWithoutBoard) {
    warn(
      'budget_over_ceiling',
      `Anggaran melebihi plafon tanpa persetujuan pengurus (Rp ${limits.budgetCeilingWithoutBoard.toLocaleString('id-ID')}).`,
    );
  }
  return out;
}

export function hasErrors(issues: readonly DesignIssue[]): boolean {
  return issues.some((i) => i.severity === 'error');
}
