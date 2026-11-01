/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { CobaSepakatLogo } from '../brand/CobaSepakatLogo';
import { BrandKitModal } from '../brand/BrandKitModal';
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Scale,
  Clock,
  Sparkles,
  Users,
  Compass,
  Play,
  FileCheck2,
  Sliders,
  AlertTriangle,
  Building2,
  ChevronDown,
  Layers,
  HeartHandshake,
  TrendingDown,
  Check,
  Award,
  PhoneCall,
  Download,
} from 'lucide-react';

interface CompanyProfileProps {
  onEnterDemo: (issueId?: string) => void;
}

export const CompanyProfile: React.FC<CompanyProfileProps> = ({ onEnterDemo }) => {
  const [showBrandKit, setShowBrandKit] = useState(false);
  const [activeBentoTab, setActiveBentoTab] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Exact image asset paths generated
  const heroImage = '/src/assets/images/hero_community_deliberation_1792698118498.jpg';
  const streetImage = '/src/assets/images/field_trial_street_1792698118815.jpg';
  const mediatorImage = '/src/assets/images/mediator_session_1792698119336.jpg';

  const bentoStages = [
    {
      num: '01-02',
      title: 'Dugaan & Bukti Pengubah',
      badge: 'Fase Persiapan',
      desc: 'Peserta menuliskan dugaan faktual ("Jika X, maka Y") dan wajib menentukan bukti konkret apa yang dapat mengubah pendiriannya sebelum pengujian dimulai.',
      icon: Sliders,
      color: 'text-[#2272E8]',
      bg: 'bg-blue-50/60',
    },
    {
      num: '03',
      title: 'Gerbang Kelayakan (Safety Gate)',
      badge: 'Fitur Keselamatan',
      desc: '7 butir pemeriksaan wajib dengan penghalang mutlak: perselisihan yang tidak dapat dibalik atau mengorbankan keselamatan langsung ditolak dari uji coba.',
      icon: ShieldCheck,
      color: 'text-[#DC2626]',
      bg: 'bg-red-50/60',
    },
    {
      num: '04-05',
      title: 'Pembangun Percobaan 14 Hari',
      badge: 'Metodologi',
      desc: 'Hanya mengisolasi satu variabel perlakuan, menetapkan garis dasar (baseline), anggaran transparan, dan penandatanganan komitmen kuorum.',
      icon: Clock,
      color: 'text-[#2FA882]',
      bg: 'bg-emerald-50/60',
    },
    {
      num: '06',
      title: 'Pelaksanaan & Tombol Hentikan',
      badge: 'Proteksi Warga',
      desc: 'Pencatatan data cepat mobile dengan pemantauan lampu guardrail otomatis. Tombol darurat "Hentikan Sekarang" siap digunakan setiap saat.',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50/60',
    },
    {
      num: '07-08',
      title: 'Evaluasi & Catatan Keputusan',
      badge: 'Penetapan Adil',
      desc: 'Data lapangan dibandingkan otomatis terhadap kriteria awal. Peserta memperbarui keyakinan secara obyektif, menghasilkan Catatan Keputusan permanen.',
      icon: FileCheck2,
      color: 'text-[#153A73]',
      bg: 'bg-slate-100',
    },
  ];

  // Staggered entrance animation variants for Bento Grid
  const bentoContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05,
      },
    },
  };

  const bentoItemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <div className="space-y-24 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Value Proposition */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2272E8]/10 text-[#2272E8] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Paradigma Baru Resolusi Perselisihan Komunitas
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#153A73] tracking-tight leading-[1.15] text-balance">
                Buktikan Kebenaran Faktual Bersama,{' '}
                <span className="text-[#2FA882]">Bukan Menghabiskan Waktu Berdebat.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#5B6780] leading-relaxed max-w-2xl">
                Diskusi di RT/RW, kawasan hunian, dan organisasi sering berputar karena dugaan yang berbeda.
                <strong> CobaSepakat</strong> mengubah perselisihan menjadi percobaan kecil 14 hari yang disepakati bersama,
                lengkap dengan garis dasar, aturan keselamatan, dan kriteria keputusan sebelum data keluar.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => onEnterDemo()}
                  className="px-8 py-4 bg-[#2272E8] hover:bg-[#1A58B8] text-white text-sm font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Masuk ke Demo Interaktif (Kluster Melati)
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => setShowBrandKit(true)}
                  className="px-6 py-4 bg-white hover:bg-[#F5F8FC] border border-[#E2E8F0] text-[#153A73] text-sm font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-[#2FA882]" />
                  Logo & Brand Kit Resmi
                </button>
              </div>

              {/* Trust markers */}
              <div className="pt-4 flex items-center gap-6 text-xs text-[#5B6780] border-t border-[#E2E8F0]">
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#2FA882]" />
                  <span>Sesuai UU PDP</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#2272E8]" />
                  <span>Standar Gerbang Keselamatan</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Award className="w-4 h-4 text-[#153A73]" />
                  <span>Audit Trail Tersertifikasi</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Hero Visual Asset */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 aspect-[4/3] group">
                <img
                  src={heroImage}
                  alt="Musyawarah Faktual Komunitas CobaSepakat"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#153A73]/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white p-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#5ce2b8]" />
                      Musyawarah Kluster Melati RT 04
                    </span>
                    <span className="font-mono text-[10px] text-slate-300">Sesi Ke-142</span>
                  </div>
                  <p className="text-[11px] text-slate-200 mt-1 leading-snug">
                    Menyepakati kriteria uji coba rekayasa jalan sebelum uji coba 14 hari dimulai.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* 4 Quantitative Proof Metrics Strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E2E8F0] shadow-sm grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#2272E8]">140+</div>
              <div className="text-xs font-bold text-[#153A73]">Sesi Percobaan Teruji</div>
              <div className="text-[11px] text-[#5B6780]">Di 24 kluster dan paguyuban hunian</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#2FA882]">94.2%</div>
              <div className="text-xs font-bold text-[#153A73]">Kepatuhan Kriteria</div>
              <div className="text-[11px] text-[#5B6780]">Keputusan setia pada aturan awal</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#153A73]">84.0%</div>
              <div className="text-xs font-bold text-[#153A73]">Penerimaan Pihak Berseberangan</div>
              <div className="text-[11px] text-[#5B6780]">Warga tetap legowo karena adil</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-purple-600">-64%</div>
              <div className="text-xs font-bold text-[#153A73]">Waktu Capai Keputusan</div>
              <div className="text-[11px] text-[#5B6780]">16 hari vs 45 hari debat rapat</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem vs Solution (Paradigma Baru) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="text-xs font-bold text-[#2272E8] uppercase tracking-wider">
            Pergeseran Paradigma
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#153A73]">
            Mengapa Voting & Rapat Tanpa Percobaan Sering Gagal?
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6780]">
            Voting hanya menentukan siapa kubu mayoritas, bukan siapa yang secara empiris benar. CobaSepakat menggantikan perdebatan opini dengan pengujian terukur.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Conventional */}
          <div className="bg-white rounded-3xl p-8 border border-red-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#DC2626] uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full">
                Metode Konvensional
              </span>
              <XCircle className="w-6 h-6 text-[#DC2626]" />
            </div>
            <h3 className="text-xl font-bold text-[#153A73]">
              Rapat Bertele-tele & Voting Menang-Kalah
            </h3>
            <ul className="space-y-3 text-xs text-[#5B6780] leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="text-[#DC2626] font-bold text-sm">✕</span>
                <span><strong>Dugaan tanpa bukti:</strong> Pihak-pihak bersikukuh dengan estimasi tanpa mau diuji di lapangan.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#DC2626] font-bold text-sm">✕</span>
                <span><strong>Polarisasi sosial:</strong> Kubu yang kalah merasa aspirasinya diabaikan dan menyimpan friksi panjang.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#DC2626] font-bold text-sm">✕</span>
                <span><strong>Tanpa garis dasar (baseline):</strong> Keputusan diambil tanpa tahu kondisi faktual sebelum aturan diterapkan.</span>
              </li>
            </ul>
          </div>

          {/* CobaSepakat Way */}
          <div className="bg-[#2FA882]/5 rounded-3xl p-8 border border-[#2FA882]/30 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2FA882] uppercase tracking-wider bg-emerald-100/60 px-3 py-1 rounded-full">
                Metode CobaSepakat
              </span>
              <CheckCircle2 className="w-6 h-6 text-[#2FA882]" />
            </div>
            <h3 className="text-xl font-bold text-[#153A73]">
              Percobaan Terbatas dengan Kriteria di Muka
            </h3>
            <ul className="space-y-3 text-xs text-[#153A73] leading-relaxed">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#2FA882] shrink-0 mt-0.5" />
                <span><strong>Bukti pengubah pendapat:</strong> Setiap peserta menyatakan data apa yang dapat mengubah pendiriannya.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#2FA882] shrink-0 mt-0.5" />
                <span><strong>Aturan keselamatan mutlak:</strong> Hanya perubahan yang aman dan dapat dibalik yang lolos Gerbang Kelayakan.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#2FA882] shrink-0 mt-0.5" />
                <span><strong>Keputusan obyektif:</strong> Hasil dievaluasi otomatis terhadap ambang batas yang disetujui bersama sebelum uji coba.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Animated Bento Grid: 9 Stages of Resolution */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#2272E8] uppercase tracking-wider">
              Arsitektur Alur Kerja
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#153A73]">
              Metodologi 9 Tahap Resolusi Faktual
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6780] max-w-2xl">
              Setiap langkah dirancang dengan tata kelola terukur, jejak audit bertanda waktu, dan perlindungan hak semua peserta.
            </p>
          </div>

          <button
            onClick={() => onEnterDemo()}
            className="px-5 py-2.5 bg-[#153A73] hover:bg-[#1A58B8] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 self-start md:self-auto shrink-0"
          >
            Uji Coba Alur Ini di Demo &rarr;
          </button>
        </motion.div>

        {/* Bento Grid layout with framer-motion staggered entrance */}
        <motion.div
          variants={bentoContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {bentoStages.map((stage, idx) => {
            const IconComponent = stage.icon;
            return (
              <motion.div
                key={stage.num}
                variants={bentoItemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`p-6 rounded-3xl border border-[#E2E8F0] bg-white shadow-sm hover:border-[#2272E8]/40 transition-all space-y-4 flex flex-col justify-between ${
                  idx === 0 ? 'md:col-span-2' : ''
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#2272E8]">
                      TAHAP {stage.num}
                    </span>
                    <span className="text-[10px] font-semibold text-[#5B6780] bg-[#F5F8FC] px-2.5 py-0.5 rounded-full border border-[#E2E8F0]">
                      {stage.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl ${stage.bg} flex items-center justify-center shrink-0`}>
                      <IconComponent className={`w-5 h-5 ${stage.color}`} />
                    </div>
                    <h3 className="text-base font-bold text-[#153A73]">{stage.title}</h3>
                  </div>

                  <p className="text-xs text-[#5B6780] leading-relaxed">{stage.desc}</p>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#5B6780]">
                  <span>Standar Operasional CobaSepakat</span>
                  <span className="text-[#2272E8] font-bold">&rarr;</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Case Study Showcase: Kluster Melati Lorong B */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xl overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Visual Column with real generated photos */}
            <div className="lg:col-span-5 bg-slate-100 relative min-h-[360px] flex flex-col justify-between p-6 overflow-hidden">
              <img
                src={streetImage}
                alt="Pengujian Parkir Miring Lorong B"
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#153A73] via-[#153A73]/40 to-transparent" />

              <div className="relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-[#2272E8] px-3 py-1 rounded-full">
                  Studi Kasus Pembuktian
                </span>
              </div>

              <div className="relative z-10 text-white space-y-1">
                <div className="text-xs font-semibold text-emerald-300">Kluster Melati (RT 04 / RW 08)</div>
                <h4 className="text-lg font-bold">Rekayasa Sudut Parkir 45° vs Parkir Sejajar</h4>
                <p className="text-[11px] text-slate-200">
                  Uji coba 14 hari dengan kapur marka sementara dan 12 kerucut lalu lintas.
                </p>
              </div>
            </div>

            {/* Explanation & Data Column */}
            <div className="lg:col-span-7 p-6 sm:p-10 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-xs font-bold text-[#2FA882] uppercase tracking-wider">
                  Hasil Uji Empiris 14 Hari
                </div>
                <h3 className="text-2xl font-extrabold text-[#153A73] leading-snug">
                  &ldquo;Awalnya Kami Khawatir Mobil Mundur Menyebabkan Macet, Tapi Datanya Terbukti Sebaliknya.&rdquo;
                </h3>
                <p className="text-xs text-[#5B6780] leading-relaxed">
                  Sebelum uji coba, warga Lorong B terbelah antara usulan parkir miring Pak Joko dan kekhawatiran Ibu Ratna.
                  Lewat CobaSepakat, keduanya menyepakati ambang batas waktu tempuh (≤ 3.5 menit) dan guardrail (0 ambulans terhambat).
                </p>

                {/* 3 Metrics comparison badges */}
                <div className="grid grid-cols-3 gap-3 text-center py-2">
                  <div className="p-3 bg-[#F5F8FC] rounded-2xl border border-[#E2E8F0]">
                    <div className="text-[10px] text-[#5B6780]">Waktu Tempuh</div>
                    <div className="text-sm font-extrabold font-mono text-[#2FA882] mt-0.5">
                      4.2 &rarr; 3.2 mnt
                    </div>
                    <div className="text-[9px] text-[#2FA882] font-semibold">Membaik 21.9%</div>
                  </div>
                  <div className="p-3 bg-[#F5F8FC] rounded-2xl border border-[#E2E8F0]">
                    <div className="text-[10px] text-[#5B6780]">Akses Darurat</div>
                    <div className="text-sm font-extrabold font-mono text-[#2272E8] mt-0.5">
                      0 Insiden
                    </div>
                    <div className="text-[9px] text-[#2272E8] font-semibold">Lajur Bersih 3.92m</div>
                  </div>
                  <div className="p-3 bg-[#F5F8FC] rounded-2xl border border-[#E2E8F0]">
                    <div className="text-[10px] text-[#5B6780]">Penerimaan Warga</div>
                    <div className="text-sm font-extrabold font-mono text-[#153A73] mt-0.5">
                      4.5 / 5.0
                    </div>
                    <div className="text-[9px] text-[#5B6780]">92% Menerima Hasil</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-[#5B6780]">
                  Status Keputusan: <span className="font-bold text-[#2FA882]">Diadopsi Permanen</span>
                </div>
                <button
                  onClick={() => onEnterDemo('issue-parkir-lorong-b')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#2272E8] hover:bg-[#1A58B8] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Simulasikan Kasus Ini di Demo &rarr;
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Testimonials Section: Subtle fade-in and slide-up via whileInView */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto space-y-2"
        >
          <div className="text-xs font-bold text-[#2FA882] uppercase tracking-wider">
            Suara Warga & Praktisi Komunitas
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#153A73]">
            Pengalaman Mereka yang Telah Bersepakat
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6780]">
            Proses yang adil dan transparan menciptakan penerimaan yang tulus, bahkan bagi pihak yang dugaannya tidak terbukti.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Ratna Dewi',
              role: 'Warga Blok B-14 (Awalnya Kontra)',
              avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
              quote:
                'Awalnya saya menolak keras parkir miring karena takut jalan menyempit. Tapi karena ada aturan guardrail 0 ambulans terhambat dan data 14 hari membuktikan sisa jalan 3.92 meter bersih, saya menerima hasil ini dengan lega tanpa merasa dikalahkan.',
              highlight: 'Penerimaan tulus dari pihak kontra',
            },
            {
              name: 'Joko Santoso',
              role: 'Pengusul Parkir Miring (Blok B-08)',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
              quote:
                'Biasanya usulan seperti ini memicu perdebatan panas berbulan-bulan di grup WhatsApp RT. Cukup coba 2 minggu dengan kapur dan kerucut, datanya terlihat bersama dan seluruh warga sepakat.',
              highlight: 'Keputusan cepat tanpa perdebatan panas',
            },
            {
              name: 'Hendra Setiawan, S.Sos',
              role: 'Fasilitator Mediasi Komunitas',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
              quote:
                'Kekuatan utama CobaSepakat ada pada "Bukti Pengubah Pendapat". Peserta menyepakati kriteria penilaian sebelum data keluar, sehingga saat evaluasi tiba tidak ada lagi ruang untuk saling tuding.',
              highlight: 'Kriteria disepakati di muka',
            },
          ].map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 bg-white rounded-3xl border border-[#E2E8F0] shadow-sm hover:border-[#2272E8]/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-[#2FA882] bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {testimonial.highlight}
                </span>

                <p className="text-xs text-[#153A73] leading-relaxed italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#E2E8F0]"
                />
                <div>
                  <div className="text-xs font-bold text-[#153A73]">{testimonial.name}</div>
                  <div className="text-[11px] text-[#5B6780]">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing & Institution Packages */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="text-xs font-bold text-[#2FA882] uppercase tracking-wider">
            Paket Lembaga & Komunitas
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#153A73]">
            Transparan, Terjangkau, & Siap Digunakan
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6780]">
            Pilih lisensi sesuai skala komunitas Anda: dari satu RT mandiri hingga pengelola kawasan ribuan unit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tier 1 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <div className="text-xs font-bold text-[#5B6780] uppercase tracking-wider">
                  Untuk 1 RT/RW / Paguyuban
                </div>
                <h3 className="text-xl font-bold text-[#153A73] mt-1">Paket Komunitas Mandiri</h3>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold font-mono text-[#153A73]">Rp 0</span>
                  <span className="text-xs text-[#5B6780]"> / percobaan (Gratis Selamanya)</span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-[#5B6780]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#2FA882]" />
                  <span>1 Ruang Komunitas Aktif (Hingga 50 KK)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#2FA882]" />
                  <span>Fitur Gerbang Kelayakan 7 Butir</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#2FA882]" />
                  <span>Formulir Cepat Lapangan Mobile</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#2FA882]" />
                  <span>Ekspor Catatan Keputusan Cetak / PDF</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onEnterDemo()}
              className="w-full py-3 bg-[#F5F8FC] hover:bg-slate-200 text-[#153A73] text-xs font-bold rounded-xl transition-colors"
            >
              Mulai Gratis di Demo
            </button>
          </div>

          {/* Tier 2: Popular */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#2272E8] shadow-xl space-y-6 flex flex-col justify-between relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#2272E8] text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wider">
              Pilihan Pengelola Kawasan
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs font-bold text-[#2272E8] uppercase tracking-wider">
                  Multi-Kluster & Apartemen
                </div>
                <h3 className="text-xl font-bold text-[#153A73] mt-1">Estate Management Pro</h3>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold font-mono text-[#2272E8]">Rp 450.000</span>
                  <span className="text-xs text-[#5B6780]"> / bulan</span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-[#153A73]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#2272E8]" />
                  <span>Multi-Ruang Tak Terbatas (Blok, RT, Fasum)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#2272E8]" />
                  <span>Log Audit Tak Terubah & Kepatuhan Legal</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#2272E8]" />
                  <span>Pustaka Templat Komprehensif</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#2272E8]" />
                  <span>Notifikasi WhatsApp Resmi ke Warga</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onEnterDemo()}
              className="w-full py-3 bg-[#2272E8] hover:bg-[#1A58B8] text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              Coba Dasbor Pengelola Kawasan
            </button>
          </div>

          {/* Tier 3: Mediation */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <div className="text-xs font-bold text-[#5B6780] uppercase tracking-wider">
                  Dengan Pendampingan Ahli
                </div>
                <h3 className="text-xl font-bold text-[#153A73] mt-1">Paket Fasilitasi Mediasi</h3>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold font-mono text-[#153A73]">Rp 1.200.000</span>
                  <span className="text-xs text-[#5B6780]"> / paket kasus</span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-[#5B6780]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#2FA882]" />
                  <span>Didampingi Fasilitator Terverifikasi</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#2FA882]" />
                  <span>2 Sesi Mediasi Penyusunan Desain</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#2FA882]" />
                  <span>1 Sesi Evaluasi & Pembacaan Data Bersama</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#2FA882]" />
                  <span>Laporan Independen Bermaterai / QR Resmi</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onEnterDemo()}
              className="w-full py-3 bg-[#153A73] hover:bg-[#1A58B8] text-white text-xs font-bold rounded-xl transition-all"
            >
              Lihat Direktori Fasilitator
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-[#153A73]">Pertanyaan yang Sering Diajukan</h2>
          <p className="text-xs text-[#5B6780]">Prinsip operasional dan batasan etika CobaSepakat</p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'Bagaimana jika salah satu pihak menolak ikut dalam percobaan?',
              a: 'CobaSepakat mewajibkan kuorum persetujuan (default 70% di Kluster Melati). Sebelum desain dikunci, setiap pihak menandatangani komitmen: "Saya berjanji akan menerima keputusan akhir yang dievaluasi sesuai kriteria ini." Jika ada pihak yang keberatan, desain dapat dinegosiasikan ulang melalui versi turunan.',
            },
            {
              q: 'Apakah semua sengketa warga bisa diuji coba?',
              a: 'TIDAK. Produk ini secara tegas memiliki Gerbang Kelayakan dengan 2 penghalang mutlak: jika sengketa menyangkut nilai moral/agama atau berdampak tak terbalikkan yang membahayakan hak/keselamatan warga, sistem otomatis menolak pembuatan percobaan dan mengalihkannya ke musyawarah nilai.',
            },
            {
              q: 'Bagaimana jika di tengah jalan timbul bahaya darurat?',
              a: 'Aturan berhenti (guardrails) dipantau secara waktu nyata. Pengurus, fasilitator, atau relawan berhak menekan tombol darurat "Hentikan Sekarang" kapan saja. Status langsung berubah menjadi Dihentikan dan warga diberi tahu seketika.',
            },
          ].map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-4 text-xs cursor-pointer"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div className="flex items-center justify-between font-bold text-[#153A73]">
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openFaq === i ? 'rotate-180' : ''
                  }`}
                />
              </div>
              {openFaq === i && (
                <p className="mt-2 text-[#5B6780] leading-relaxed pt-2 border-t border-[#E2E8F0]">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#153A73] via-[#1A58B8] to-[#153A73] rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Siap Digunakan Hari Ini
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ayo Uji Dugaannya, Sepakati Buktinya.
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Masuk ke demo interaktif untuk melihat langsung simulasi 8 hari pengujian parkir Lorong B, pencatatan data lapangan, dan laporan evaluasi otomatis.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onEnterDemo()}
              className="px-8 py-3.5 bg-[#2FA882] hover:bg-[#258768] text-white text-xs font-bold rounded-2xl shadow-lg transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              Buka Demo Interaktif Sekarang &rarr;
            </button>
            <button
              onClick={() => setShowBrandKit(true)}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold rounded-2xl transition-colors"
            >
              Buka Brand Kit Resmi
            </button>
          </div>
        </div>
      </section>

      {/* Brand Kit Modal */}
      {showBrandKit && <BrandKitModal onClose={() => setShowBrandKit(false)} />}
    </div>
  );
};
