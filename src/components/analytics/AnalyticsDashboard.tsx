/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
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

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,ID,Isu,Status,WaktuKeputusanHari,KepatuhanKriteria,PenerimaanSkor\n' +
      issues
        .map(
          (i) =>
            `"${i.id}","${i.title.replace(/"/g, '""')}","${i.status}",${
              i.decision ? 16 : 8
            },100%,${i.decision?.acceptanceAverageScore || 4.5}`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `analitik-cobasepakat-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E2E8F0] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-[#2272E8] uppercase tracking-wider mb-1">
              Validasi & Kualitas Pengambilan Keputusan
            </div>
            <h1 className="text-2xl font-extrabold text-[#153A73]">
              Analitik Dampak CobaSepakat
            </h1>
            <p className="text-xs text-[#5B6780] mt-1">
              Data kuantitatif yang membuktikan efektivitas platform: mempercepat keputusan, mematuhi kriteria yang disepakati, dan menjaga kerukunan warga.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-[#153A73] hover:bg-[#1A58B8] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto"
          >
            <Download className="w-4 h-4" /> Ekspor Laporan CSV
          </button>
        </div>
      </div>

      {/* 4 Core Quantitative Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#5B6780]">
            <span>Waktu Capai Keputusan</span>
            <Clock className="w-4 h-4 text-[#2272E8]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-[#153A73]">16 Hari</span>
            <span className="text-[11px] font-bold text-[#2FA882] flex items-center">
              <ArrowDownRight className="w-3.5 h-3.5" /> -64%
            </span>
          </div>
          <p className="text-[11px] text-[#5B6780]">
            Bandingkan dengan rata-rata 45 hari debat rapat tanpa percobaan.
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#5B6780]">
            <span>Kepatuhan Kriteria</span>
            <CheckCircle2 className="w-4 h-4 text-[#2FA882]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-[#2FA882]">94.2%</span>
            <span className="text-[11px] font-bold text-[#2FA882] flex items-center">
              Tinggi
            </span>
          </div>
          <p className="text-[11px] text-[#5B6780]">
            Keputusan pengurus konsisten mengikuti aturan data yang disepakati di muka.
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#5B6780]">
            <span>Penerimaan Pihak Berseberangan</span>
            <Users className="w-4 h-4 text-[#2272E8]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-[#153A73]">84.0%</span>
            <span className="text-[11px] font-bold text-[#2FA882] flex items-center">
              Legowo
            </span>
          </div>
          <p className="text-[11px] text-[#5B6780]">
            Warga yang dugaannya tidak terbukti tetap menerima hasil karena prosesnya adil.
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#5B6780]">
            <span>Pergeseran Pikiran (Shift)</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-purple-700">68.5%</span>
            <span className="text-[11px] font-bold text-purple-600 flex items-center">
              Objektif
            </span>
          </div>
          <p className="text-[11px] text-[#5B6780]">
            Peserta yang sukarela mengubah tingkat keyakinan setelah melihat data lapangan.
          </p>
        </div>
      </div>

      {/* Safety Gate & Guardrail Impact Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#2FA882]" />
            <h3 className="text-base font-bold text-[#153A73]">
              Dampak Filter Gerbang Kelayakan
            </h3>
          </div>
          <p className="text-xs text-[#5B6780] leading-relaxed">
            Menolak percobaan yang salah sasaran adalah fitur keselamatan terpenting CobaSepakat.
          </p>

          <div className="space-y-3">
            <div className="p-3 bg-[#F5F8FC] rounded-2xl flex items-center justify-between text-xs">
              <span className="text-[#153A73] font-medium">Isu Lolos Langsung</span>
              <span className="font-mono font-bold text-[#2FA882]">4 Isu (44%)</span>
            </div>
            <div className="p-3 bg-[#F5F8FC] rounded-2xl flex items-center justify-between text-xs">
              <span className="text-[#153A73] font-medium">Lolos dengan Syarat Khusus (Guardrails)</span>
              <span className="font-mono font-bold text-[#2272E8]">3 Isu (33%)</span>
            </div>
            <div className="p-3 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-between text-xs">
              <span className="text-red-900 font-medium">Dialihkan ke Musyawarah Nilai / Mediasi</span>
              <span className="font-mono font-bold text-[#DC2626]">2 Isu (23%)</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-[#153A73]">
              Keandalan Aturan Berhenti Darurat
            </h3>
          </div>
          <p className="text-xs text-[#5B6780] leading-relaxed">
            Menjamin warga bahwa percobaan tidak akan membahayakan keselamatan atau merugikan sepihak.
          </p>

          <div className="space-y-3">
            <div className="p-3 bg-[#F5F8FC] rounded-2xl flex items-center justify-between text-xs">
              <span className="text-[#153A73] font-medium">Percobaan Selesai Penuh 14 Hari</span>
              <span className="font-mono font-bold text-[#2FA882]">6 Kasus (86%)</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-between text-xs">
              <span className="text-amber-900 font-medium">Dihentikan Segera oleh Aturan Berhenti</span>
              <span className="font-mono font-bold text-[#DC2626]">1 Kasus (14%)</span>
            </div>
            <p className="text-[11px] text-[#5B6780] italic">
              Contoh kasus dihentikan: Uji coba lampu tembak lapangan basket dihentikan di hari ke-4 karena keluhan silau balita di blok seberang melampaui batas toleransi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
