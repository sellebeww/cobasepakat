/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CobaSepakatLogo } from '../brand/CobaSepakatLogo';
import { HeroIllustration } from './HeroIllustration';
import { BrandKitModal } from '../brand/BrandKitModal';
import {
  ArrowRight,
  Binoculars,
  Building2,
  Check,
  ChevronDown,
  CirclePlay,
  Clock,
  Coins,
  FlaskConical,
  House,
  Instagram,
  Mail,
  Settings,
  ShieldCheck,
  Star,
  Users,
  Youtube,
} from 'lucide-react';

interface CompanyProfileProps {
  onEnterDemo: (issueId?: string) => void;
}

const reasons = [
  {
    icon: FlaskConical,
    iconColor: 'text-brand-blue',
    title: 'Uji Ide dengan Data Nyata',
    desc: 'Ubah pendapat menjadi percobaan sederhana dengan metrik yang jelas.',
  },
  {
    icon: Users,
    iconColor: 'text-brand-green-light',
    title: 'Libatkan Semua Anggota',
    desc: 'Dari usulan hingga keputusan, setiap suara berarti.',
  },
  {
    icon: ShieldCheck,
    iconColor: 'text-brand-blue',
    title: 'Keputusan Lebih Adil',
    desc: 'Didasarkan pada hasil percobaan, bukan opini semata.',
  },
];

const steps = [
  { title: 'Isu Dibuka', desc: 'Anggota mengajukan isu yang ingin diselesaikan.' },
  { title: 'Dugaan Terkumpul', desc: 'Tulis klaim "Jika X dilakukan, maka Y terjadi" beserta tingkat keyakinan awal.' },
  { title: 'Pengecekan Kelayakan', desc: 'Pastikan isu layak diuji dengan pertanyaan yang jelas.' },
  { title: 'Desain Percobaan', desc: 'Tentukan metrik, anggaran, dan aturan henti.' },
  { title: 'Menunggu Persetujuan', desc: 'Dapatkan persetujuan dari komunitas (setuju, setuju dengan catatan, atau keberatan).' },
  { title: 'Percobaan Berjalan', desc: 'Lakukan percobaan sesuai rencana.' },
  { title: 'Evaluasi Hasil', desc: 'Bandingkan keyakinan sebelum dan sesudah.' },
  { title: 'Keputusan Tercatat', desc: 'Simpan hasil sebagai keputusan bersama.' },
];

const audiences = [
  { icon: House, label: 'Anggota', color: 'text-brand-blue', bg: 'bg-brand-surface-blue' },
  { icon: Star, label: 'Pengusul', color: 'text-brand-gold', bg: 'bg-amber-50' },
  { icon: Users, label: 'Fasilitator', color: 'text-brand-green-light', bg: 'bg-brand-mint/60' },
  { icon: ShieldCheck, label: 'Pengurus', color: 'text-brand-green', bg: 'bg-brand-mint/60' },
  { icon: Binoculars, label: 'Pemantau Independen', color: 'text-brand-blue', bg: 'bg-brand-surface-blue' },
  { icon: Building2, label: 'Pengelola Kawasan', color: 'text-brand-blue', bg: 'bg-brand-surface-blue' },
  { icon: Settings, label: 'Admin Platform', color: 'text-brand-blue', bg: 'bg-brand-surface-blue' },
];

const faqs = [
  {
    q: 'Bagaimana jika salah satu pihak menolak ikut dalam percobaan?',
    a: 'CobaSepakat memakai kuorum persetujuan (default 70% di Kluster Melati). Sebelum desain dikunci, setiap pihak menyatakan akan menerima keputusan yang dievaluasi sesuai kriteria. Jika ada keberatan, desain dapat dinegosiasikan ulang.',
  },
  {
    q: 'Apakah semua perselisihan bisa diuji coba?',
    a: 'Tidak. Gerbang Kelayakan memiliki 2 penghalang mutlak: perselisihan soal nilai moral atau agama, dan perubahan yang tidak dapat dibalik atau membahayakan keselamatan, dialihkan ke musyawarah biasa.',
  },
  {
    q: 'Bagaimana jika di tengah jalan timbul bahaya?',
    a: 'Aturan henti dipantau selama percobaan. Pengurus, fasilitator, atau relawan dapat menekan tombol "Hentikan Sekarang" kapan saja, dan warga diberi tahu seketika.',
  },
];

const journey = [
  { done: true },
  { done: true },
  { n: 3 },
  { n: 4 },
  { n: 5 },
];

// The app routes with location.hash, so in-page links scroll instead of using #anchors.
export const scrollToSection = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export const CompanyProfile: React.FC<CompanyProfileProps> = ({ onEnterDemo }) => {
  const [showBrandKit, setShowBrandKit] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const heroStagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
  };
  const heroItem = {
    hidden: { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
  };

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  };

  return (
    <div className="relative overflow-hidden">
      {/* Soft background blobs, as in the mockup */}
      <motion.img
        src="/assets/landing/blue-green-blob.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 right-[-12%] w-[70%] max-w-[900px] rotate-12 opacity-70"
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.img
        src="/assets/landing/blue-green-blob.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute top-[48%] -left-[20%] w-[60%] max-w-[800px] -rotate-6 opacity-50"
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative space-y-20 sm:space-y-24 pb-10">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 items-center">
            <motion.div
              variants={heroStagger}
              initial="hidden"
              animate="show"
              className="space-y-6"
            >
              <motion.div variants={heroItem} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-sky/60 text-brand-navy text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-brand-green-light" />
                Dari Diskusi, Menuju Keputusan Nyata
              </motion.div>

              <motion.h1 variants={heroItem} className="text-4xl sm:text-5xl lg:text-[2.3rem] xl:text-[2.65rem] font-extrabold text-brand-navy tracking-tight leading-[1.15] text-balance">
                Selesaikan <br className="hidden lg:block" />
                Perselisihan Komunitas <br className="hidden lg:block" />
                <span className="text-brand-green">dengan Percobaan</span>, <br className="hidden lg:block" />
                bukan Debat Tanpa Ujung.
              </motion.h1>

              <motion.p variants={heroItem} className="text-base sm:text-lg text-brand-slate leading-relaxed max-w-lg">
                CobaSepakat adalah aplikasi web untuk menguji ide, mengolah data nyata, dan menemukan keputusan
                terbaik bersama komunitas.
              </motion.p>

              <motion.div variants={heroItem} className="flex flex-wrap items-center gap-5 pt-1">
                <button type="button"
                  onClick={() => onEnterDemo()}
                  className="px-7 py-3.5 bg-brand-navy hover:bg-brand-blue-dark text-white text-sm font-bold rounded-full shadow-card transition-colors flex items-center gap-2 group"
                >
                  Mulai Sekarang
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button type="button"
                  onClick={() => scrollToSection('cara-kerja')}
                  className="text-sm font-bold text-brand-blue hover:text-brand-blue-dark transition-colors flex items-center gap-2"
                >
                  Pelajari Lebih Lanjut
                  <CirclePlay className="w-5 h-5" />
                </button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex justify-center lg:justify-end"
            >
              <HeroIllustration className="w-full max-w-[600px] h-auto" />
            </motion.div>
          </div>
        </section>

        {/* Kenapa CobaSepakat */}
        <section id="fitur" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy">
              Kenapa <span className="text-brand-blue">Coba</span>
              <span className="text-brand-green">Sepakat</span>?
            </h2>
            <p className="text-sm sm:text-base text-brand-slate">
              Karena setiap isu di komunitas bisa diuji dengan cara yang lebih objektif, terstruktur, dan transparan.
            </p>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            {reasons.map((r, i) => (
              <motion.div
                key={r.title}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="bg-brand-surface-blue/70 hover:bg-white border border-brand-border hover:border-brand-blue/40 rounded-3xl shadow-card hover:shadow-xl transition-colors p-8 text-center space-y-3.5"
              >
                <motion.span
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="mx-auto w-16 h-16 rounded-2xl bg-white shadow-card flex items-center justify-center"
                >
                  <r.icon className={`w-8 h-8 ${r.iconColor}`} strokeWidth={2.25} aria-hidden="true" />
                </motion.span>
                <h3 className="text-lg font-bold text-brand-navy">{r.title}</h3>
                <p className="text-sm sm:text-base text-brand-slate leading-relaxed">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Cara kerja */}
        <section id="cara-kerja" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
          <motion.div {...fadeUp} className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy">
              Bagaimana <span className="text-brand-green">Cara Kerjanya</span>?
            </h2>
            <p className="text-sm sm:text-base text-brand-slate">Ikuti alur yang jelas, dari isu hingga keputusan akhir.</p>
          </motion.div>

          <ol className="mt-10 grid grid-cols-1 md:grid-flow-col md:grid-rows-4 gap-x-10 gap-y-3">
            {steps.map((s, i) => (
              <motion.li
                key={s.title}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: (i % 4) * 0.06 }}
                whileHover={{ x: 4 }}
                className={`relative flex items-start gap-4 bg-white/80 hover:bg-white border border-brand-border hover:border-brand-blue/40 rounded-2xl px-4 py-4 shadow-card transition-colors ${i % 4 !== 3 ? 'md:after:absolute md:after:left-[31px] md:after:top-[3.4rem] md:after:-bottom-6 md:after:w-0.5 md:after:bg-brand-blue/30 md:after:-z-0' : ''}`}
              >
                <motion.span
                  aria-hidden="true"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 400, damping: 14, delay: 0.15 + (i % 4) * 0.06 }}
                  className="w-8 h-8 shrink-0 rounded-full bg-brand-blue text-white text-sm font-bold flex items-center justify-center"
                >
                  {i + 1}
                </motion.span>
                <div>
                  <h3 className="text-base font-bold text-brand-navy">
                    <span className="sr-only">Langkah {i + 1}: </span>
                    {s.title}
                  </h3>
                  <p className="text-sm text-brand-slate leading-relaxed mt-0.5">{s.desc}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </section>

        {/* Contoh komunitas */}
        <section id="tentang" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-sky to-brand-mint/70 p-6 sm:p-10"
          >
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-5">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-brand-blue text-xs font-bold">
                  <House className="w-4 h-4" aria-hidden="true" />
                  Contoh Komunitas
                </span>
                <h2 className="text-3xl font-extrabold text-brand-navy leading-tight">
                  Kluster Melati RT 04 Harmoni Asri
                </h2>
                <p className="text-base text-brand-navy/80 leading-relaxed max-w-sm">
                  Dari masalah lingkungan hingga aturan bersama, semua bisa diselesaikan lewat percobaan yang terukur.
                </p>
                <button type="button"
                  onClick={() => onEnterDemo()}
                  className="px-6 py-3 bg-brand-navy hover:bg-brand-blue-dark text-white text-sm font-bold rounded-full shadow-card transition-colors flex items-center gap-2 group"
                >
                  Coba Demo Sekarang
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="bg-white rounded-3xl shadow-card p-6 space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-bold text-brand-navy">
                    <span className="w-2 h-2 rounded-full bg-brand-green-light" />
                    Isu Saat Ini
                  </span>
                  <span className="text-xs font-bold text-brand-green bg-brand-mint px-3 py-1 rounded-full flex items-center gap-1.5">
                    <span className="relative flex w-2 h-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-brand-green-light opacity-60 motion-safe:animate-ping" />
                      <span className="relative inline-flex w-2 h-2 rounded-full bg-brand-green-light" />
                    </span>
                    Sedang Berjalan
                  </span>
                </div>

                <h3 className="text-lg font-bold text-brand-navy leading-snug">
                  Apakah perlu menambah jam operasional pos keamanan?
                </h3>

                <ol className="flex items-center" aria-label="Tahap 2 dari 5">
                  {journey.map((j, i) => (
                    <li key={i} className="flex items-center flex-1 last:flex-none">
                      <motion.span
                        initial={{ scale: 0.4, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 380, damping: 16, delay: 0.3 + i * 0.25 }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          j.done ? 'bg-brand-blue text-white' : 'bg-brand-border text-brand-slate'
                        }`}
                      >
                        {j.done ? <Check className="w-4 h-4" aria-hidden="true" /> : j.n}
                      </motion.span>
                      {i < journey.length - 1 && (
                        <span className="h-1 flex-1 mx-1 rounded-full bg-brand-border overflow-hidden">
                          <motion.span
                            className="block h-full bg-brand-blue origin-left"
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: j.done && journey[i + 1].done ? 1 : j.done ? 0.5 : 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.5 + i * 0.25, ease: 'easeOut' }}
                          />
                        </span>
                      )}
                    </li>
                  ))}
                </ol>

                <div className="flex items-center gap-5 pt-1">
                  <div className="flex items-center gap-3 flex-1">
                    <Clock className="w-7 h-7 text-brand-blue shrink-0" aria-hidden="true" />
                    <div>
                      <div className="text-xs text-brand-slate">Sisa Waktu</div>
                      <div className="text-base font-bold text-brand-navy">2 hari</div>
                    </div>
                  </div>
                  <div className="w-px self-stretch bg-brand-border" />
                  <div className="flex items-center gap-3 flex-1">
                    <Coins className="w-7 h-7 text-brand-gold shrink-0" aria-hidden="true" />
                    <div>
                      <div className="text-xs text-brand-slate">Anggaran</div>
                      <div className="text-base font-bold text-brand-navy">Rp 500.000</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Untuk siapa */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy">
              Untuk Siapa <span className="text-brand-green">Saja</span>?
            </h2>
            <p className="text-sm sm:text-base text-brand-slate">CobaSepakat dirancang untuk berbagai jenis komunitas.</p>
          </motion.div>

          <ul className="mt-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {audiences.map((a, i) => (
              <motion.li
                key={a.label}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.05 }}
                whileHover={{ y: -6, scale: 1.03 }}
                className={`${a.bg} border border-brand-border hover:shadow-card rounded-3xl py-6 px-2 flex flex-col items-center justify-center gap-3 text-center`}
              >
                <motion.span whileHover={{ rotate: [0, -12, 12, 0] }} transition={{ duration: 0.5 }}>
                  <a.icon className={`w-9 h-9 ${a.color}`} aria-hidden="true" />
                </motion.span>
                <span className="text-sm font-bold text-brand-navy leading-tight">{a.label}</span>
              </motion.li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 space-y-8">
          <motion.div {...fadeUp} className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy">
              Pertanyaan <span className="text-brand-green">Umum</span>
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div key={faq.q} className="bg-white rounded-2xl border border-brand-border shadow-card">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={`faq-panel-${i}`}
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 text-sm sm:text-base font-bold text-brand-navy rounded-2xl"
                    >
                      {faq.q}
                      <ChevronDown
                        aria-hidden="true"
                        className={`w-4 h-4 shrink-0 text-brand-slate transition-transform ${open ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        id={`faq-panel-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-4 text-sm sm:text-base text-brand-slate leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden rounded-[2rem] bg-brand-blue-dark text-white px-6 sm:px-12 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <motion.img
              src="/assets/landing/cta-ribbon.svg"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute right-0 top-0 h-full w-auto"
              animate={{ x: [0, -14, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="relative flex items-center gap-5">
              <motion.span
                initial={{ scale: 0, rotate: -30 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.2 }}
                className="hidden sm:block shrink-0"
              >
                <Check className="w-14 h-14 text-brand-green-light" strokeWidth={3} aria-hidden="true" />
              </motion.span>
              <div className="space-y-1.5">
                <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                  Saatnya membuat keputusan bersama dengan lebih baik.
                </h2>
                <p className="text-base text-white/90">Mulai perjalanan komunitas Anda di CobaSepakat sekarang!</p>
              </div>
            </div>
            <button type="button"
              onClick={() => onEnterDemo()}
              className="relative shrink-0 self-start md:self-auto px-7 py-3.5 bg-white hover:bg-brand-surface-blue text-brand-navy text-sm font-bold rounded-full shadow-card transition-colors flex items-center gap-2"
            >
              Mulai Sekarang
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-5">
              <CobaSepakatLogo variant="horizontal" size="sm" showTagline={false} />
              <span className="hidden sm:block h-8 w-px bg-brand-border" />
              <span className="text-sm text-brand-navy">Uji. Sepakat. Maju Bersama.</span>
            </div>
            <div className="flex items-center gap-5 text-brand-navy">
              <button type="button"
                onClick={() => setShowBrandKit(true)}
                className="text-xs font-semibold text-brand-slate hover:text-brand-navy transition-colors"
              >
                Brand Kit
              </button>
              {/* shortcut: placeholder hrefs, replace with real social/contact URLs before launch */}
              <a href="#/" aria-label="Instagram CobaSepakat" className="hover:text-brand-blue transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#/" aria-label="YouTube CobaSepakat" className="hover:text-brand-blue transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#/" aria-label="Email CobaSepakat" className="hover:text-brand-blue transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </footer>
      </div>

      {showBrandKit && <BrandKitModal onClose={() => setShowBrandKit(false)} />}
    </div>
  );
};
