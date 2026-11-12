/** Utilitas tanggal murni. Semua fungsi menerima `now` agar deterministik. */

const DAY_MS = 86_400_000;

/** Ubah 'YYYY-MM-DD' menjadi nomor hari sejak epoch (UTC). Null bila format salah. */
export function dateToDayNumber(date: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = Date.UTC(y, mo - 1, d);
  const check = new Date(t);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) return null;
  return Math.floor(t / DAY_MS);
}

/**
 * Hari ke-N percobaan (hari pertama = 1) untuk sebuah cap waktu ISO.
 * `utcOffsetMinutes` adalah selisih zona waktu lokal dari UTC (WIB = 420), supaya
 * catatan pukul 06.30 WIB tidak jatuh ke hari sebelumnya. Hasil <= 0 berarti sebelum mulai.
 */
export function dayIndex(startDate: string, timestamp: string, utcOffsetMinutes = 0): number | null {
  const start = dateToDayNumber(startDate);
  const t = Date.parse(timestamp);
  if (start === null || Number.isNaN(t)) return null;
  const local = t + utcOffsetMinutes * 60_000;
  return Math.floor(local / DAY_MS) - start + 1;
}

export type TrialPhase = 'belum_mulai' | 'berjalan' | 'selesai';

export interface TrialProgress {
  phase: TrialPhase;
  /** Hari ke-N, dijepit ke 0..totalDays. 0 berarti belum mulai. */
  day: number;
  totalDays: number;
  /** 0..1 */
  fraction: number;
}

export function trialProgress(
  startDate: string,
  durationDays: number,
  now: string,
  utcOffsetMinutes = 0,
): TrialProgress | null {
  const raw = dayIndex(startDate, now, utcOffsetMinutes);
  if (raw === null || !Number.isInteger(durationDays) || durationDays <= 0) return null;
  if (raw <= 0) return { phase: 'belum_mulai', day: 0, totalDays: durationDays, fraction: 0 };
  if (raw > durationDays) return { phase: 'selesai', day: durationDays, totalDays: durationDays, fraction: 1 };
  return { phase: 'berjalan', day: raw, totalDays: durationDays, fraction: raw / durationDays };
}

/** Tanggal akhir (inklusif) untuk percobaan yang dimulai pada startDate. */
export function endDateFor(startDate: string, durationDays: number): string | null {
  const s = dateToDayNumber(startDate);
  if (s === null || !Number.isInteger(durationDays) || durationDays <= 0) return null;
  return new Date((s + durationDays - 1) * DAY_MS).toISOString().slice(0, 10);
}
