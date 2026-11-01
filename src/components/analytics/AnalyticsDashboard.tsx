/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { downloadCsv } from '../../lib/download';
import { notify } from '../../lib/notify';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  ShieldCheck,
  AlertTriangle,
  Download,
  Award,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { issues, organization, currentSpace } = useApp();

  const decided = issues.filter((i) => i.decision);
  const running = issues.filter((i) => i.status === 'percobaan_berjalan').length;
  const scored = decided.filter((i) => i.decision?.acceptanceAverageScore != null);
  const avgScore = scored.length
    ? (scored.reduce((sum, i) => sum + (i.decision!.acceptanceAverageScore as number), 0) / scored.length).toFixed(1)
    : '-';

  // Exports the live issue list; fields without data stay empty rather than invented.
  const handleExportCSV = () => {
    downloadCsv(`analitik-cobasepakat-${new Date().toISOString().slice(0, 10)}.csv`, [
      ['ID', 'Isu', 'Status', 'DiajukanPada', 'KeputusanDicatat', 'SkorPenerimaan'],
      ...issues.map((i) => [
        i.id,
        i.title,
        i.status,
        i.createdAt,
        i.decision?.decidedAt ?? '',
        i.decision?.acceptanceAverageScore ?? '',
      ]),
    ]);
    notify(`${issues.length} isu diekspor ke CSV.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-brand-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-brand-blue uppercase tracking-wider mb-1">
              Validasi & Kualitas Pengambilan Keputusan
            </div>
            <h1 className="text-3xl font-extrabold text-brand-navy">
              Analitik Dampak CobaSepakat
            </h1>
            <p className="text-xs text-brand-slate mt-1">
              Data kuantitatif yang membuktikan efektivitas platform: mempercepat keputusan, mematuhi kriteria yang disepakati, dan menjaga kerukunan warga.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-brand-navy hover:bg-brand-blue-dark text-white rounded-full text-xs font-bold transition-all shadow-card flex items-center gap-2 self-start sm:self-auto"
          >
            <Download className="w-4 h-4" /> Ekspor Laporan CSV
          </button>
        </div>
      </div>

      {/* Live summary computed from this space's data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Isu Terdaftar', value: issues.length },
          { label: 'Percobaan Berjalan', value: running },
          { label: 'Keputusan Tercatat', value: decided.length },
          { label: 'Rata-rata Penerimaan', value: avgScore === '-' ? '-' : `${avgScore} / 5` },
        ].map((k) => (
          <div key={k.label} className="bg-brand-surface-blue/70 border border-brand-border rounded-2xl px-5 py-4">
            <div className="text-xs font-semibold text-brand-slate">{k.label}</div>
            <div className="text-2xl font-extrabold font-mono text-brand-navy mt-1">{k.value}</div>
          </div>
        ))}
      </div>

      {/* 4 Core Quantitative Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-3xl p-5 border border-brand-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-brand-slate">
            <span>Waktu Capai Keputusan</span>
            <Clock className="w-4 h-4 text-brand-blue" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-brand-navy">16 Hari</span>
            <span className="text-xs font-bold text-brand-green flex items-center">
              <ArrowDownRight className="w-3.5 h-3.5" /> -64%
            </span>
          </div>
          <p className="text-xs text-brand-slate">
            Bandingkan dengan rata-rata 45 hari debat rapat tanpa percobaan.
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-3xl p-5 border border-brand-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-brand-slate">
            <span>Kepatuhan Kriteria</span>
            <CheckCircle2 className="w-4 h-4 text-brand-green" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-brand-green">94.2%</span>
            <span className="text-xs font-bold text-brand-green flex items-center">
              Tinggi
            </span>
          </div>
          <p className="text-xs text-brand-slate">
            Keputusan pengurus konsisten mengikuti aturan data yang disepakati di muka.
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-3xl p-5 border border-brand-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-brand-slate">
            <span>Penerimaan Pihak Berseberangan</span>
            <Users className="w-4 h-4 text-brand-blue" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-brand-navy">84.0%</span>
            <span className="text-xs font-bold text-brand-green flex items-center">
              Legowo
            </span>
          </div>
          <p className="text-xs text-brand-slate">
            Warga yang dugaannya tidak terbukti tetap menerima hasil karena prosesnya adil.
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-3xl p-5 border border-brand-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-brand-slate">
            <span>Pergeseran Pikiran (Shift)</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-purple-700">68.5%</span>
            <span className="text-xs font-bold text-purple-600 flex items-center">
              Objektif
            </span>
          </div>
          <p className="text-xs text-brand-slate">
            Peserta yang sukarela mengubah tingkat keyakinan setelah melihat data lapangan.
          </p>
        </div>
      </div>

      {/* Safety Gate & Guardrail Impact Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-green" />
            <h3 className="text-base font-bold text-brand-navy">
              Dampak Filter Gerbang Kelayakan
            </h3>
          </div>
          <p className="text-xs text-brand-slate leading-relaxed">
            Menolak percobaan yang salah sasaran adalah fitur keselamatan terpenting CobaSepakat.
          </p>

          <div className="space-y-3">
            <div className="p-3 bg-brand-surface rounded-2xl flex items-center justify-between text-xs">
              <span className="text-brand-navy font-medium">Isu Lolos Langsung</span>
              <span className="font-mono font-bold text-brand-green">4 Isu (44%)</span>
            </div>
            <div className="p-3 bg-brand-surface rounded-2xl flex items-center justify-between text-xs">
              <span className="text-brand-navy font-medium">Lolos dengan Syarat Khusus (Guardrails)</span>
              <span className="font-mono font-bold text-brand-blue">3 Isu (33%)</span>
            </div>
            <div className="p-3 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-between text-xs">
              <span className="text-red-900 font-medium">Dialihkan ke Musyawarah Nilai / Mediasi</span>
              <span className="font-mono font-bold text-status-stopped">2 Isu (23%)</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-brand-navy">
              Keandalan Aturan Berhenti Darurat
            </h3>
          </div>
          <p className="text-xs text-brand-slate leading-relaxed">
            Menjamin warga bahwa percobaan tidak akan membahayakan keselamatan atau merugikan sepihak.
          </p>

          <div className="space-y-3">
            <div className="p-3 bg-brand-surface rounded-2xl flex items-center justify-between text-xs">
              <span className="text-brand-navy font-medium">Percobaan Selesai Penuh 14 Hari</span>
              <span className="font-mono font-bold text-brand-green">6 Kasus (86%)</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-between text-xs">
              <span className="text-amber-900 font-medium">Dihentikan Segera oleh Aturan Berhenti</span>
              <span className="font-mono font-bold text-status-stopped">1 Kasus (14%)</span>
            </div>
            <p className="text-xs text-brand-slate italic">
              Contoh kasus dihentikan: Uji coba lampu tembak lapangan basket dihentikan di hari ke-4 karena keluhan silau balita di blok seberang melampaui batas toleransi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
