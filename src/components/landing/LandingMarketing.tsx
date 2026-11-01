/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { CobaSepakatLogo } from '../brand/CobaSepakatLogo';
import {
  ShieldCheck,
  Scale,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Compass,
  Clock,
  Building2,
  Check,
  HelpCircle,
} from 'lucide-react';

export const LandingMarketing: React.FC = () => {
  const { setActiveTab } = useApp();

  return (
    <div className="space-y-16 py-6 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-8 pb-4 px-4">
        <div className="inline-flex items-center justify-center mb-2">
          <CobaSepakatLogo variant="full" size="xl" showTagline={false} />
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-navy tracking-tight leading-tight">
            Ubah Perdebatan Komunitas Menjadi{' '}
            <span className="text-brand-green">Percobaan Bersama</span>
          </h1>
          <p className="text-base sm:text-lg text-brand-slate leading-relaxed">
            Daripada berdebat berminggu-minggu tentang siapa yang benar, nyatakan dugaan Anda, tentukan bukti pengubah pendapat, dan uji coba selama dua minggu dengan kriteria yang disepakati di muka.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setActiveTab('beranda')}
            className="w-full sm:w-auto px-8 py-3.5 bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            Masuk ke Dasbor Komunitas <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('pustaka')}
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-brand-surface text-brand-navy border border-brand-border text-sm font-semibold rounded-2xl transition-colors"
          >
            Lihat Contoh Kasus Nyata
          </button>
        </div>

        {/* 5-Step Concept Strip */}
        <div className="pt-8">
          <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-sm max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-center">
              {[
                { n: '01', title: 'Dugaan Faktual', desc: 'Nyatakan estimasi akibat secara terukur' },
                { n: '02', title: 'Bukti Pengubah', desc: 'Sebut data apa yang akan mengubah pikiran' },
                { n: '03', title: 'Gerbang Aman', desc: 'Hanya yang dapat dibalik dan aman yang diuji' },
                { n: '04', title: 'Uji 14 Hari', desc: 'Jalankan dengan garis dasar dan guardrail' },
                { n: '05', title: 'Sepakati Hasil', desc: 'Patuhi aturan keputusan yang disetujui di muka' },
              ].map((step, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-xs font-mono font-bold text-brand-blue">{step.n}</div>
                  <div className="text-xs font-bold text-brand-navy">{step.title}</div>
                  <div className="text-xs text-brand-slate leading-tight">{step.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem vs Solution */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        <div className="bg-white rounded-3xl p-8 border border-brand-border shadow-sm space-y-4">
          <div className="text-xs font-bold text-red-600 uppercase tracking-wider">
            Masalah Perdebatan Tradisional
          </div>
          <h3 className="text-xl font-bold text-brand-navy">
            Rapat Berputar & Voting Menghasilkan Kubu Menang-Kalah
          </h3>
          <ul className="space-y-3 text-xs text-brand-slate leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-status-stopped font-bold">✕</span>
              <span>Debat berasumsi siapa yang paling vokal atau paling banyak pengikut adalah yang benar.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-status-stopped font-bold">✕</span>
              <span>Voting memutuskan siapa yang menang, tetapi tidak menjawab siapa yang benar secara faktual.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-status-stopped font-bold">✕</span>
              <span>Pihak yang kalah merasa tersisih dan menyimpan dendam di lingkungan warga.</span>
            </li>
          </ul>
        </div>

        <div className="bg-brand-green/5 rounded-3xl p-8 border border-brand-green/20 shadow-sm space-y-4">
          <div className="text-xs font-bold text-brand-green uppercase tracking-wider">
            Pendekatan CobaSepakat
          </div>
          <h3 className="text-xl font-bold text-brand-navy">
            Fakta Berbicara Lewat Percobaan Kecil yang Terukur
          </h3>
          <ul className="space-y-3 text-xs text-brand-navy leading-relaxed">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
              <span>Semua pihak menyepakati metrik dan ambang batas SEBELUM hasil pengujian keluar.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
              <span>Aturan berhenti (guardrail) menjamin percobaan langsung disetop bila ada risiko bahaya.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
              <span>Penerimaan warga mencapai 84% bahkan di kalangan pihak yang dugaannya tidak terbukti.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Safety Boundaries / Gerbang Kelayakan */}
      <section className="bg-white rounded-3xl p-8 md:p-10 border border-brand-border shadow-sm space-y-6 mx-4">
        <div className="max-w-2xl space-y-2">
          <div className="text-xs font-bold text-brand-blue uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Batasan Penggunaan Wajib (Anti-Penyalahgunaan)
          </div>
          <h2 className="text-2xl font-bold text-brand-navy">
            Tidak Semua Perselisihan Boleh Diuji Coba
          </h2>
          <p className="text-xs text-brand-slate leading-relaxed">
            CobaSepakat secara tegas menolak memaksakan konflik nilai, hak asasi, atau sengketa kekuasaan menjadi percobaan. Produk menerapkan Gerbang Kelayakan sebagai pagar nyata.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-brand-surface rounded-2xl border border-brand-border space-y-1.5">
            <div className="font-bold text-brand-navy">1. Hanya Fakta yang Dapat Diuji</div>
            <p className="text-brand-slate text-xs">
              Dilarang untuk konflik nilai moral, agama, atau hak dasar. Hanya untuk estimasi konsekuensi empiris.
            </p>
          </div>
          <div className="p-4 bg-brand-surface rounded-2xl border border-brand-border space-y-1.5">
            <div className="font-bold text-brand-navy">2. Wajib Dapat Dibalik (Reversible)</div>
            <p className="text-brand-slate text-xs">
              Perubahan harus bisa dikembalikan ke kondisi semula dalam waktu singkat tanpa beban biaya besar.
            </p>
          </div>
          <div className="p-4 bg-brand-surface rounded-2xl border border-brand-border space-y-1.5">
            <div className="font-bold text-brand-navy">3. Nol Kompromi Keselamatan</div>
            <p className="text-brand-slate text-xs">
              Akses darurat ambulans/damkar dan hak lansia/disabilitas tidak boleh dikorbankan demi uji coba apa pun.
            </p>
          </div>
        </div>
      </section>

      {/* For Whom */}
      <section className="space-y-6 px-4">
        <div className="text-center space-y-2">
          <div className="text-xs font-bold text-brand-green uppercase tracking-wider">
            Dirancang Khusus Untuk Komunitas
          </div>
          <h2 className="text-2xl font-bold text-brand-navy">Siapa yang Membutuhkan CobaSepakat?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Pengurus RT/RW & Paguyuban',
              desc: 'Selesaikan sengketa parkir lorong, portal malam, sampah, dan kebersihan tanpa pecah kongsi.',
            },
            {
              title: 'Koperasi & Ormawa',
              desc: 'Uji aturan jam operasional, sistem antrean, dan fasilitas bersama berdasarkan data nyata.',
            },
            {
              title: 'Pengelola Kawasan & Apartemen',
              desc: 'Kelola ratusan unit hunian secara transparan dengan standar baku keputusan yang terdokumentasi.',
            },
            {
              title: 'Fasilitator & Mediator',
              desc: 'Gunakan perangkat lunak profesional untuk mendampingi penyusunan desain dan evaluasi terstruktur.',
            },
          ].map((item, i) => (
            <div key={i} className="p-5 bg-white rounded-3xl border border-brand-border shadow-sm space-y-2">
              <h4 className="font-bold text-sm text-brand-navy">{item.title}</h4>
              <p className="text-xs text-brand-slate leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-brand-navy text-white rounded-3xl p-8 md:p-12 text-center space-y-5 mx-4">
        <h2 className="text-2xl md:text-3xl font-extrabold max-w-xl mx-auto">
          &ldquo;Kita belum sepakat soal akibatnya. Ayo coba dua minggu dan lihat bersama.&rdquo;
        </h2>
        <p className="text-xs md:text-sm text-slate-300 max-w-lg mx-auto">
          Mulai uji coba perbedaan pendapat komunitas Anda hari ini dengan CobaSepakat.
        </p>
        <button
          onClick={() => setActiveTab('beranda')}
          className="px-8 py-3 bg-brand-green hover:bg-[#258768] text-white text-xs font-bold rounded-2xl shadow-lg transition-all"
        >
          Buka Ruang Komunitas Kluster Melati &rarr;
        </button>
      </section>
    </div>
  );
};
