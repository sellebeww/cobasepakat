/**
 * Jembatan antara tipe aplikasi (src/types) dan modul murni src/core.
 * Semua logika keputusan ada di core; berkas ini hanya memetakan bentuk data.
 */
import {
  type Criterion,
  type DecisionRule,
  type MetricDef,
  type Observation,
  type RuleResult,
  type StopRuleDef,
  type StopRuleResult,
  evaluateRule,
  evaluateStopRules,
} from '../core';
import type { AcceptanceResponse as CoreAcceptance } from '../core';
import type { AcceptanceResponse, DataEntry, Experiment, Metric, StopRule } from '../types';

export function metricToCore(m: Metric): MetricDef {
  return {
    id: m.id,
    name: m.name,
    unit: m.unit,
    kind: m.type,
    direction: m.direction,
    baselineValue: m.baselineValue,
    thresholdValue: m.thresholdValue,
  };
}

export function entryToObservation(e: DataEntry): Observation {
  return {
    id: e.id,
    metricId: e.metricId,
    value: e.value,
    recordedAt: e.recordedAt,
    day: e.dayNumber,
    flagged: e.flagged,
  };
}

export function stopRuleToCore(r: StopRule): StopRuleDef {
  return {
    id: r.id,
    severity: r.severity,
    trigger: r.trigger ?? { kind: 'manual' },
    triggeredAt: r.triggered ? (r.triggeredAt ?? 'tercatat') : undefined,
  };
}

/** Kriteria turunan dari ambang tiap metrik, dipakai bila percobaan lama belum punya kriteria terstruktur. */
export function deriveRuleFromMetrics(metrics: readonly Metric[]): DecisionRule {
  const criteria: Criterion[] = metrics.map((m) =>
    m.direction === 'rentang_tetap'
      ? { id: `auto-${m.id}`, metricId: m.id, kind: 'within_band', comparator: 'lte', value: m.thresholdValue }
      : {
          id: `auto-${m.id}`,
          metricId: m.id,
          kind: 'absolute',
          comparator: m.direction === 'turun_lebih_baik' ? 'lte' : 'gte',
          value: m.thresholdValue,
        },
  );
  return { mode: 'all', criteria };
}

export interface ExperimentAnalysis {
  rule: DecisionRule;
  /** true bila kriteria diturunkan otomatis dari ambang metrik (bukan dikunci eksplisit). */
  ruleDerived: boolean;
  result: RuleResult;
  stop: StopRuleResult[];
}

export function analyzeExperiment(exp: Experiment): ExperimentAnalysis {
  const metrics = exp.metrics.map(metricToCore);
  const observations = exp.dataEntries.map(entryToObservation);
  const ruleDerived = !exp.criteria;
  const rule = exp.criteria ?? deriveRuleFromMetrics(exp.metrics);
  return {
    rule,
    ruleDerived,
    result: evaluateRule(rule, metrics, observations),
    stop: evaluateStopRules(exp.stopRules.map(stopRuleToCore), observations),
  };
}

/** Selisih zona waktu lokal dari UTC dalam menit (WIB = 420). */
export function localUtcOffsetMinutes(now = new Date()): number {
  return -now.getTimezoneOffset();
}

/** Kunci pengguna mencakup keputusan, supaya satu orang boleh menjawab survei untuk keputusan berbeda. */
export function acceptanceToCore(rs: readonly AcceptanceResponse[]): CoreAcceptance[] {
  return rs.map((r) => ({
    userId: `${r.decisionId}:${r.userId}`,
    score: r.score,
    accepts: r.acceptsOutcome,
    stanceInitial: r.stanceInitial,
  }));
}
