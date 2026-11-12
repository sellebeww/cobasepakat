import type { Observation, StopComparator, StopRuleDef, StopSeverity } from './types';

export type StopStatus = 'aman' | 'terpicu';

export interface StopRuleResult {
  ruleId: string;
  severity: StopSeverity;
  status: StopStatus;
  /** 'otomatis' dari data, 'manual' bila dipicu orang, 'tercatat' bila sudah terpicu sebelumnya. */
  source: 'otomatis' | 'manual' | 'tercatat' | 'belum';
  triggeredAt?: string;
  /** Pengamatan yang memicu aturan. */
  triggeredByObservationId?: string;
  reason?: string;
  /** Panjang rentetan pelanggaran terbaru (untuk peringatan dini). */
  currentStreak: number;
  required: number;
}

export function breaches(value: number, comparator: StopComparator, limit: number): boolean {
  switch (comparator) {
    case 'gt':
      return value > limit;
    case 'gte':
      return value >= limit;
    case 'lt':
      return value < limit;
    case 'lte':
      return value <= limit;
  }
}

function chronological(observations: readonly Observation[]): Observation[] {
  return observations
    .map((o, i) => ({ o, i, t: Date.parse(o.recordedAt) }))
    .filter((x) => !x.o.flagged && Number.isFinite(x.o.value))
    .sort((a, b) => {
      const ta = Number.isNaN(a.t) ? 0 : a.t;
      const tb = Number.isNaN(b.t) ? 0 : b.t;
      return ta - tb || a.i - b.i;
    })
    .map((x) => x.o);
}

/**
 * Evaluasi aturan berhenti terhadap data. Sifat yang dijamin (dan diuji dengan property test):
 * - Latching: aturan yang sudah terpicu (`triggeredAt`) tidak pernah kembali aman.
 * - Monoton: menambah pengamatan tidak pernah mengubah 'terpicu' menjadi 'aman'.
 * - Aturan manual tidak pernah terpicu otomatis.
 * - Hanya pengamatan metrik yang dirujuk yang diperhitungkan.
 * Pengamatan yang ditandai (flagged) diabaikan, supaya data keliru tidak menghentikan percobaan.
 * Sebaliknya, hentikan manual selalu tersedia lewat `markManualStop`.
 */
export function evaluateStopRules(
  rules: readonly StopRuleDef[],
  observations: readonly Observation[],
): StopRuleResult[] {
  const ordered = chronological(observations);
  return rules.map((rule): StopRuleResult => {
    const required = rule.trigger.kind === 'metric' ? Math.max(1, Math.trunc(rule.trigger.consecutive)) : 0;
    if (rule.triggeredAt) {
      return {
        ruleId: rule.id,
        severity: rule.severity,
        status: 'terpicu',
        source: 'tercatat',
        triggeredAt: rule.triggeredAt,
        currentStreak: 0,
        required,
      };
    }
    if (rule.trigger.kind === 'manual') {
      return {
        ruleId: rule.id,
        severity: rule.severity,
        status: 'aman',
        source: 'belum',
        currentStreak: 0,
        required,
      };
    }
    const { metricId, comparator, limit } = rule.trigger;
    let streak = 0;
    for (const o of ordered) {
      if (o.metricId !== metricId) continue;
      if (breaches(o.value, comparator, limit)) {
        streak++;
        if (streak >= required) {
          return {
            ruleId: rule.id,
            severity: rule.severity,
            status: 'terpicu',
            source: 'otomatis',
            triggeredAt: o.recordedAt,
            triggeredByObservationId: o.id,
            reason: `Nilai ${o.value} melanggar batas (${comparatorLabel(comparator)} ${limit}) ${required} kali berturut-turut.`,
            currentStreak: streak,
            required,
          };
        }
      } else {
        streak = 0;
      }
    }
    return {
      ruleId: rule.id,
      severity: rule.severity,
      status: 'aman',
      source: 'belum',
      currentStreak: streak,
      required,
    };
  });
}

function comparatorLabel(c: StopComparator): string {
  return { gt: '>', gte: '>=', lt: '<', lte: '<=' }[c];
}

/** Percobaan harus berhenti bila ada aturan kritis yang terpicu. 'waspada' hanya memberi peringatan. */
export function shouldHalt(results: readonly StopRuleResult[]): boolean {
  return results.some((r) => r.status === 'terpicu' && r.severity === 'kritis_henti');
}

export function warnings(results: readonly StopRuleResult[]): StopRuleResult[] {
  return results.filter((r) => r.status === 'terpicu' && r.severity === 'waspada');
}

/**
 * Pemicuan manual ("Hentikan Sekarang") hanya mengunci aturan manual atau aturan yang dipilih,
 * bukan semua aturan sekaligus.
 */
export function markManualStop(
  rules: readonly StopRuleDef[],
  now: string,
  ruleIds?: readonly string[],
): StopRuleDef[] {
  return rules.map((r) => {
    if (r.triggeredAt) return r;
    const selected = ruleIds ? ruleIds.includes(r.id) : r.trigger.kind === 'manual';
    return selected ? { ...r, triggeredAt: now } : r;
  });
}

/** Kunci aturan yang terpicu otomatis agar tetap terpicu walau pengamatan kemudian diubah/ditandai. */
export function latchTriggered(rules: readonly StopRuleDef[], results: readonly StopRuleResult[]): StopRuleDef[] {
  const triggered = new Map(results.filter((r) => r.status === 'terpicu').map((r) => [r.ruleId, r.triggeredAt]));
  return rules.map((r) => {
    if (r.triggeredAt) return r;
    const t = triggered.get(r.id);
    return t ? { ...r, triggeredAt: t } : r;
  });
}
