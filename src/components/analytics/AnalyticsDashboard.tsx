/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertTriangle, CheckCircle2, Clock, Download, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import type React from 'react';
import { useApp } from '../../context/AppContext';
import { acceptanceToCore } from '../../lib/coreAdapter';
import { summarizeAcceptance, summarizeBeliefShift } from '../../core';
import { downloadCsv } from '../../lib/download';
import { notify } from '../../lib/notify';

const pct = (x: number | null) => (x === null ? '-' : `${Math.round(x * 100)}%`);

/** Setiap angka di halaman ini dihitung dari catatan di ruang ini. Tanpa data, tampil "belum ada data". */
export const AnalyticsDashboard: React.FC = () => {
  const { issues, experiments, acceptance } = useApp();

  const decided = issues.filter((i) => i.decision);
  const running = issues.filter((i) => i.status === 'percobaan_berjalan').length;

  // 1. Waktu dari isu dibuka sampai keputusan dicatat
  const durations = decided
    .map((i) => (Date.parse(i.decision!.decidedAt) - Date.parse(i.createdAt)) / 86_400_000)
    .filter((d) => Number.isFinite(d) && d >= 0);
  const meanDays = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : null;

  // 2. Keselarasan keputusan dengan hasil evaluasi saat dicatat
  const withVerdict = decided.filter((i) => i.decision?.ruleVerdictAtDecision);
  const aligned = withVerdict.filter((i) => {
    const d = i.decision!;
    const v = d.ruleVerdictAtDecision;
    return (
      (d.outcome === 'adopsi' && v === 'terpenuhi') ||
      (d.outcome === 'kembalikan_ke_semula' && v === 'tidak_terpenuhi') ||
      (d.outcome === 'ubah_coba_lagi' && v !== 'terpenuhi') ||
      d.outcome === 'naikkan_ke_musyawarah'
    );
  });

  // 3. Penerimaan, khususnya pihak yang awalnya berseberangan
  const acc = summarizeAcceptance(acceptanceToCore(acceptance));

  // 4. Pergeseran keyakinan
  const shift = summarizeBeliefShift(issues.flatMap((i) => i.claims.map((c) => ({ initial: c.initialConfidence, post: c.postConfidence }))));

  // Gerbang kelayakan
  const gate = {
    layak: issues.filter((i) => i.feasibilityOutcome?.status === 'layak').length,
    syarat: issues.filter((i) => i.feasibilityOutcome?.status === 'layak_dengan_syarat').length,
    tidak: issues.filter((i) => i.feasibilityOutcome?.status === 'tidak_layak').length,
  };
  const gateTotal = gate.layak + gate.syarat + gate.tidak;

  // Aturan berhenti
  const exps = Object.values(experiments);
  const finished = exps.filter((e) => e.status === 'selesai').length;
  const stopped = exps.filter((e) => e.status === 'dihentikan').length;

  const handleExportCSV = () => {
    downloadCsv(`analitik-cobasepakat-${new Date().toISOString().slice(0, 10)}.csv`, [
      ['ID', 'Isu', 'Status', 'DiajukanPada', 'KeputusanDicatat', 'VerdictSaatKeputusan'],
      ...issues.map((i) => [i.id, i.title, i.status, i.createdAt, i.decision?.decidedAt ?? '', i.decision?.ruleVerdictAtDecision ?? '']),
    ]);
    notify(`${issues.length} isu diekspor ke CSV.`);
  };

  const cards: { label: string; value: string; note: string; Icon: typeof Clock }[] = [
    {
      label: 'Waktu dari isu dibuka ke keputusan',
      value: meanDays === null ? 'Belum ada data' : `${meanDays.toFixed(1)} hari`,
      note: `Rata-rata dari ${durations.length} keputusan tercatat. Tidak ada pembanding "tanpa percobaan" yang diukur, jadi tidak ada klaim percepatan.`,
      Icon: Clock,
    },
    {
      label: 'Keputusan selaras dengan hasil evaluasi',
      value: withVerdict.length === 0 ? 'Belum ada data' : `${aligned.length} dari ${withVerdict.length}`,
      note: `Hanya keputusan yang menyimpan hasil evaluasi saat dicatat yang dihitung (${decided.length - withVerdict.length} lainnya tidak punya).`,
      Icon: CheckCircle2,
    },
    {
      label: 'Penerimaan oleh pihak yang awalnya kontra',
      value: acc.opposingN === 0 ? 'Belum ada data' : `${pct(acc.opposingAcceptShare)} (n = ${acc.opposingN})`,
      note: acc.opposingInterval
        ? `Interval 95%: ${pct(acc.opposingInterval.lower)} sampai ${pct(acc.opposingInterval.upper)}. Sampel kecil dan sukarela, tidak mewakili seluruh warga.`
        : 'Menunggu jawaban survei penerimaan dari pihak kontra.',
      Icon: Users,
    },
    {
      label: 'Pergeseran keyakinan setelah data',
      value: shift.n === 0 ? 'Belum ada data' : `${shift.changed} dari ${shift.n} mengubah`,
      note: shift.meanChange === null ? 'Menunggu pembaruan keyakinan pasca-evaluasi.' : `Rata-rata selisih ${shift.meanChange.toFixed(1)} poin persentase pada skala 0-100.`,
      Icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-brand-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-brand-blue uppercase tracking-wider mb-1">Kualitas Pengambilan Keputusan</div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-brand-navy">Analitik Dampak CobaSepakat</h1>
            <p className="text-sm text-brand-slate mt-1">
              Ringkasan dihitung dari catatan di ruang ini, lengkap dengan ukuran sampel. Data di mode demo adalah contoh fiktif.
              Angka ini menggambarkan proses, bukan membuktikan bahwa platform menyebabkan hasil tertentu.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-brand-navy hover:bg-brand-blue-dark text-white rounded-full text-xs font-bold transition-all shadow-card flex items-center gap-2 self-start sm:self-auto"
          >
            <Download className="w-4 h-4" /> Ekspor Laporan CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Isu Terdaftar', value: issues.length },
          { label: 'Percobaan Berjalan', value: running },
          { label: 'Keputusan Tercatat', value: decided.length },
          { label: 'Jawaban Survei Penerimaan', value: acc.n },
        ].map((k) => (
          <div key={k.label} className="bg-brand-surface-blue/70 border border-brand-border rounded-2xl px-5 py-4">
            <div className="text-xs font-semibold text-brand-slate">{k.label}</div>
            <div className="text-2xl font-extrabold font-mono text-brand-navy mt-1">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, note, Icon }) => (
          <div key={label} className="bg-white rounded-3xl p-5 border border-brand-border shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-brand-slate">
              <span>{label}</span>
              <Icon className="w-4 h-4 text-brand-blue" aria-hidden="true" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-brand-navy">{value}</div>
            <p className="text-xs text-brand-slate">{note}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-green" aria-hidden="true" />
            <h2 className="text-base font-bold text-brand-navy">Hasil Gerbang Kelayakan</h2>
          </div>
          {gateTotal === 0 ? (
            <p className="text-sm text-brand-slate">Belum ada isu yang melewati gerbang kelayakan.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              <li className="p-3 bg-brand-surface rounded-2xl flex justify-between"><span>Layak</span><span className="font-mono font-bold">{gate.layak} isu</span></li>
              <li className="p-3 bg-brand-surface rounded-2xl flex justify-between"><span>Layak dengan syarat</span><span className="font-mono font-bold">{gate.syarat} isu</span></li>
              <li className="p-3 bg-red-50 rounded-2xl flex justify-between"><span>Dialihkan ke musyawarah nilai atau mediasi</span><span className="font-mono font-bold">{gate.tidak} isu</span></li>
            </ul>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" aria-hidden="true" />
            <h2 className="text-base font-bold text-brand-navy">Akhir Percobaan</h2>
          </div>
          {finished + stopped === 0 ? (
            <p className="text-sm text-brand-slate">Belum ada percobaan yang berakhir.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              <li className="p-3 bg-brand-surface rounded-2xl flex justify-between"><span>Selesai sampai evaluasi</span><span className="font-mono font-bold">{finished} percobaan</span></li>
              <li className="p-3 bg-amber-50 rounded-2xl flex justify-between"><span>Dihentikan oleh aturan berhenti</span><span className="font-mono font-bold">{stopped} percobaan</span></li>
            </ul>
          )}
          <p className="text-xs text-brand-slate">Jumlah kecil: persentase tidak ditampilkan karena menyesatkan pada sampel sekecil ini.</p>
        </div>
      </div>
    </div>
  );
};
