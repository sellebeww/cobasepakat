import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { dateToDayNumber, dayIndex, endDateFor, trialProgress } from '../src/core/dates';

describe('dates', () => {
  it('dateToDayNumber menolak format/tanggal tidak valid', () => {
    expect(dateToDayNumber('2026-10-15')).not.toBeNull();
    expect(dateToDayNumber('2026-02-30')).toBeNull();
    expect(dateToDayNumber('15-10-2026')).toBeNull();
    expect(dateToDayNumber('')).toBeNull();
  });
  it('dayIndex memakai zona waktu lokal: 06.30 WIB masih hari yang sama', () => {
    // 2026-10-16 06:30 WIB = 2026-10-15 23:30 UTC
    const ts = '2026-10-15T23:30:00Z';
    expect(dayIndex('2026-10-15', ts, 0)).toBe(1);
    expect(dayIndex('2026-10-15', ts, 420)).toBe(2);
    expect(dayIndex('2026-10-16', ts, 420)).toBe(1);
  });
  it('dayIndex <= 0 sebelum mulai; null untuk masukan rusak', () => {
    expect(dayIndex('2026-10-15', '2026-10-14T12:00:00Z')).toBe(0);
    expect(dayIndex('2026-10-15', 'bukan-tanggal')).toBeNull();
    expect(dayIndex('salah', '2026-10-14T12:00:00Z')).toBeNull();
  });
  it('trialProgress: sebelum, selama, sesudah', () => {
    expect(trialProgress('2026-10-15', 14, '2026-10-10T00:00:00Z')).toMatchObject({ phase: 'belum_mulai', day: 0, fraction: 0 });
    expect(trialProgress('2026-10-15', 14, '2026-10-22T10:00:00Z')).toMatchObject({ phase: 'berjalan', day: 8 });
    expect(trialProgress('2026-10-15', 14, '2026-10-28T23:00:00Z')).toMatchObject({ phase: 'berjalan', day: 14, fraction: 1 });
    expect(trialProgress('2026-10-15', 14, '2026-11-20T00:00:00Z')).toMatchObject({ phase: 'selesai', day: 14, fraction: 1 });
    expect(trialProgress('2026-10-15', 0, '2026-10-22T10:00:00Z')).toBeNull();
  });
  it('endDateFor inklusif', () => {
    expect(endDateFor('2026-10-15', 14)).toBe('2026-10-28');
    expect(endDateFor('2026-10-15', 1)).toBe('2026-10-15');
    expect(endDateFor('xx', 3)).toBeNull();
  });
  it('property: hari terakhir (endDate) selalu berindeks durasi', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 60 }), fc.date({ min: new Date('2024-01-01'), max: new Date('2030-12-31'), noInvalidDate: true }), (d, date) => {
        const start = date.toISOString().slice(0, 10);
        const end = endDateFor(start, d)!;
        expect(dayIndex(start, `${end}T12:00:00Z`)).toBe(d);
        expect(dayIndex(start, `${start}T12:00:00Z`)).toBe(1);
      }),
    );
  });
});
