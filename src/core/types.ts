/**
 * Tipe domain murni untuk logika keputusan. Sengaja terpisah dari `src/types`
 * (tipe UI/penyimpanan) supaya modul core tidak bergantung pada React atau DOM.
 */

export type Direction = 'naik_lebih_baik' | 'turun_lebih_baik' | 'rentang_tetap';
export type MetricKind = 'hitungan' | 'durasi' | 'skala_survei' | 'ya_tidak' | 'angka_bebas';

export interface MetricDef {
  id: string;
  name: string;
  unit: string;
  kind: MetricKind;
  direction: Direction;
  baselineValue: number;
  /**
   * Ambang kesepakatan. naik_lebih_baik: rata-rata harus >= ambang.
   * turun_lebih_baik: rata-rata harus <= ambang.
   * rentang_tetap: |rata-rata - garis dasar| harus <= ambang (ambang = selisih maksimum).
   */
  thresholdValue: number;
}

export interface Observation {
  id?: string;
  metricId: string;
  value: number;
  /** Cap waktu ISO 8601. */
  recordedAt: string;
  /** Hari ke-N percobaan (1..durasi). Bila ada, dipakai untuk pengelompokan harian. */
  day?: number;
  /** Entri ditandai bermasalah dan dikeluarkan dari analisis. */
  flagged?: boolean;
}

export type Comparator = 'lte' | 'gte';

export type CriterionKind = 'absolute' | 'relative_change' | 'within_band';

export interface Criterion {
  id: string;
  metricId: string;
  kind: CriterionKind;
  /**
   * absolute: rata-rata <=/>= value.
   * relative_change: (rata-rata - garis dasar)/|garis dasar| <=/>= value (0.1 = 10%).
   * within_band: |rata-rata - garis dasar| <= value (comparator diabaikan).
   */
  comparator: Comparator;
  value: number;
  /** Jumlah hari berdata minimum sebelum kriteria boleh dinilai. Default 3. */
  minDays?: number;
}

export type RuleMode = 'all' | 'any' | 'k_of_n';

export interface DecisionRule {
  mode: RuleMode;
  /** Wajib untuk k_of_n. */
  k?: number;
  criteria: Criterion[];
}

export type StopSeverity = 'waspada' | 'kritis_henti';

export type StopComparator = 'gt' | 'gte' | 'lt' | 'lte';

export type StopTrigger =
  | { kind: 'manual' }
  | {
      kind: 'metric';
      metricId: string;
      comparator: StopComparator;
      limit: number;
      /** Jumlah pengamatan berturut-turut yang melanggar sebelum terpicu (>= 1). */
      consecutive: number;
    };

export interface StopRuleDef {
  id: string;
  severity: StopSeverity;
  trigger: StopTrigger;
  /** Sudah terpicu sebelumnya (latching). */
  triggeredAt?: string;
}

export interface ExperimentDesign {
  startDate: string;
  durationDays: number;
  metrics: MetricDef[];
  decisionRule: DecisionRule;
  stopRules: StopRuleDef[];
  budgetTotal?: number;
}

export interface SpaceLimits {
  maxExperimentDays: number;
  budgetCeilingWithoutBoard: number;
}

export type Verdict = 'terpenuhi' | 'tidak_terpenuhi' | 'belum_dapat_disimpulkan';
