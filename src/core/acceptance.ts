import { wilsonInterval } from './stats';

export interface AcceptanceResponse {
  userId: string;
  /** Skor 1..5. */
  score: number;
  accepts: boolean;
  stanceInitial?: 'pro' | 'kontra' | 'netral';
}

export interface AcceptanceSummary {
  /** Jumlah responden valid. */
  n: number;
  meanScore: number | null;
  acceptShare: number | null;
  acceptInterval: { lower: number; upper: number; level: number } | null;
  /** Penerimaan di antara pihak yang awalnya kontra (null bila tidak ada). */
  opposingN: number;
  opposingAcceptShare: number | null;
  opposingInterval: { lower: number; upper: number; level: number } | null;
  note: string;
}

/**
 * Ringkasan survei penerimaan. Tanpa responden, semua angka null; tidak ada nilai bawaan
 * (sebelumnya aplikasi menulis skor tetap 4.5 dan 90%, yang kini dihapus).
 * Satu jawaban per pengguna (yang terakhir dipakai). Skor di luar 1..5 dibuang.
 */
export function summarizeAcceptance(responses: readonly AcceptanceResponse[]): AcceptanceSummary {
  const last = new Map<string, AcceptanceResponse>();
  for (const r of responses) {
    if (Number.isFinite(r.score) && r.score >= 1 && r.score <= 5) last.set(r.userId, r);
  }
  const valid = [...last.values()];
  const n = valid.length;
  const opposing = valid.filter((r) => r.stanceInitial === 'kontra');
  const share = (rs: AcceptanceResponse[]) => {
    if (rs.length === 0) return { s: null, ci: null };
    const ci = wilsonInterval(rs.filter((r) => r.accepts).length, rs.length);
    return {
      s: rs.filter((r) => r.accepts).length / rs.length,
      ci: ci ? { lower: ci.lower, upper: ci.upper, level: ci.level } : null,
    };
  };
  const all = share(valid);
  const opp = share(opposing);
  return {
    n,
    meanScore: n === 0 ? null : valid.reduce((a, r) => a + r.score, 0) / n,
    acceptShare: all.s,
    acceptInterval: all.ci,
    opposingN: opposing.length,
    opposingAcceptShare: opp.s,
    opposingInterval: opp.ci,
    note:
      n === 0
        ? 'Belum ada jawaban survei penerimaan.'
        : `Berdasarkan ${n} jawaban sukarela. Responden tidak dipilih acak, jadi angka ini tidak mewakili seluruh warga.`,
  };
}

export interface BeliefShift {
  userId: string;
  initial: number;
  post: number;
}

export interface BeliefShiftSummary {
  n: number;
  /** Jumlah yang mengubah keyakinan (selisih tak nol). */
  changed: number;
  meanChange: number | null;
}

/** Pergeseran keyakinan hanya dihitung dari klaim yang sudah punya pasca-keyakinan. Tidak ada angka bawaan. */
export function summarizeBeliefShift(items: readonly { initial: number; post?: number }[]): BeliefShiftSummary {
  const done = items.filter(
    (i): i is { initial: number; post: number } =>
      typeof i.post === 'number' && Number.isFinite(i.post) && Number.isFinite(i.initial),
  );
  if (done.length === 0) return { n: 0, changed: 0, meanChange: null };
  const diffs = done.map((i) => i.post - i.initial);
  return {
    n: done.length,
    changed: diffs.filter((d) => d !== 0).length,
    meanChange: diffs.reduce((a, b) => a + b, 0) / diffs.length,
  };
}
