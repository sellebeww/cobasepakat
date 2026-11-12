import { mean } from './stats';
import type { Observation } from './types';

export interface DailyPoint {
  day: number;
  /** Rata-rata pengamatan pada hari itu. */
  value: number;
  /** Jumlah pengamatan mentah pada hari itu. */
  count: number;
}

export interface SeriesSummary {
  /** Jumlah pengamatan mentah (tanpa yang ditandai). */
  observations: number;
  /** Jumlah hari berbeda yang punya data. */
  days: number;
  daily: DailyPoint[];
  values: number[];
  /** Pengamatan yang dikeluarkan karena ditandai atau bukan angka hingga. */
  excluded: number;
}

/**
 * Kelompokkan pengamatan satu metrik per hari. Pengamatan dalam satu hari saling terkait
 * (orang, cuaca, jam yang sama), sehingga satuan analisis adalah rata-rata harian.
 * Pengamatan tanpa `day` dikelompokkan menurut tanggal UTC dari `recordedAt`.
 */
export function summarizeSeries(observations: readonly Observation[], metricId: string): SeriesSummary {
  const byDay = new Map<number, number[]>();
  let excluded = 0;
  let observationsCount = 0;
  const values: number[] = [];
  for (const o of observations) {
    if (o.metricId !== metricId) continue;
    if (o.flagged || !Number.isFinite(o.value)) {
      excluded++;
      continue;
    }
    const day = o.day ?? Math.floor(Date.parse(o.recordedAt) / 86_400_000);
    if (Number.isNaN(day)) {
      excluded++;
      continue;
    }
    observationsCount++;
    values.push(o.value);
    const bucket = byDay.get(day);
    if (bucket) bucket.push(o.value);
    else byDay.set(day, [o.value]);
  }
  const daily = [...byDay.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([day, vs]) => ({ day, value: mean(vs), count: vs.length }));
  return { observations: observationsCount, days: daily.length, daily, values, excluded };
}
