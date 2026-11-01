/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Experiment, Issue, DecisionOutcome } from '../../types';
import { CobaSepakatLogo } from '../brand/CobaSepakatLogo';
import {
  FileCheck2,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Printer,
  Share2,
  X,
  Star,
  Calendar,
  AlertCircle,
  Award,
} from 'lucide-react';

interface DecisionModalProps {
  experiment: Experiment;
  issue: Issue;
  onClose: () => void;
}

export const DecisionModal: React.FC<DecisionModalProps> = ({
  experiment,
  issue,
  onClose,
}) => {
  const { recordDecision, submitAcceptanceRating, currentUser } = useApp();

  const [outcome, setOutcome] = useState<DecisionOutcome>('adopsi');
  const [title, setTitle] = useState<string>(
    'Adopsi Resmi: Parkir Miring 45 Derajat Diterapkan Permanen di Lorong B'
  );
  const [reason, setReason] = useState<string>(
    'Berdasarkan pengujian 14 hari, waktu tempuh kendaraan membaik 21.9% (dari garis dasar 4.2 menit menjadi rata-rata 3.28 menit), keluhan warga turun 58%, dan tidak ada insiden ambulans/damkar terhalang. Ambang kriteria kesepakatan awal terbukti terpenuhi.'
  );
  const [statement, setStatement] = useState<string>(
    'Pengurus RT 04 bersama warga Kluster Melati menetapkan penataan parkir miring 45 derajat secara permanen dengan pengecatan marka standar dan pemasangan rambu resmi pada 1 November 2026.'
  );

  const [isSaved, setIsSaved] = useState<boolean>(!!issue.decision);
  const [acceptanceScore, setAcceptanceScore] = useState<number>(5);
  const [userAccepts, setUserAccepts] = useState<boolean>(true);
  const [acceptanceComment, setAcceptanceComment] = useState<string>('');
  const [surveySubmitted, setSurveySubmitted] = useState<boolean>(false);

  const handleSaveDecision = () => {
    recordDecision(experiment.id, outcome, title, reason, statement);
    setIsSaved(true);
  };

  const handleSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitAcceptanceRating(
      issue.decision?.id || 'dec-active',
      acceptanceScore,
      userAccepts,
      acceptanceComment
    );
    setSurveySubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl border border-[#E2E8F0] my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E2E8F0] pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2FA882]/10 text-[#2FA882] flex items-center justify-center shrink-0">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#153A73]">
                {isSaved ? 'Catatan Keputusan Permanen' : 'Pencatatan Keputusan Akhir'}
              </h2>
              <p className="text-xs text-[#5B6780]">
                Penetapan resmi hasil uji coba berdasarkan fakta dan komitmen bersama.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-5 overflow-y-auto flex-1 space-y-6">
          {!isSaved ? (
            /* Decision Maker Form (Pengurus only) */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#153A73] mb-2">
                  Pilihan Hasil Keputusan:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      val: 'adopsi',
                      label: 'Adopsi Permanen',
                      desc: 'Kriteria berhasil tercapai, perlakuan dijadikan aturan tetap.',
                      color: 'text-[#2FA882]',
                    },
                    {
                      val: 'ubah_coba_lagi',
                      label: 'Ubah Lalu Coba Lagi',
                      desc: 'Perlu sedikit modifikasi variabel lalu diuji coba ulang.',
                      color: 'text-[#2272E8]',
                    },
                    {
                      val: 'kembalikan_ke_semula',
                      label: 'Kembalikan ke Semula',
                      desc: 'Data tidak membuktikan manfaat atau muncul dampak negatif.',
                      color: 'text-slate-700',
                    },
                    {
                      val: 'naikkan_ke_musyawarah',
                      label: 'Naikkan ke Musyawarah Nilai',
                      desc: 'Perselisihan terbukti bukan soal fakta, butuh dewan musyawarah.',
                      color: 'text-[#F59E0B]',
                    },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setOutcome(opt.val as any)}
                      className={`text-left p-3.5 rounded-2xl border transition-all ${
                        outcome === opt.val
                          ? 'border-[#2FA882] bg-[#2FA882]/5 ring-2 ring-[#2FA882]/20'
                          : 'border-[#E2E8F0] bg-[#F5F8FC] hover:bg-slate-100'
                      }`}
                    >
                      <div className={`font-bold text-xs ${opt.color}`}>{opt.label}</div>
                      <div className="text-[11px] text-[#5B6780] mt-1">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#153A73] mb-1">
                  Judul Keputusan:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E2E8F0] font-semibold text-[#153A73]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#153A73] mb-1">
                  Alasan & Dasar Pertimbangan Empiris:
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[#E2E8F0] text-[#153A73]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#153A73] mb-1">
                  Pernyataan Keputusan Resmi (Untuk Warga):
                </label>
                <textarea
                  rows={2}
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[#E2E8F0] text-[#153A73]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-[#F5F8FC] p-3 rounded-2xl border border-[#E2E8F0]">
                <div>
                  <span className="text-[#5B6780] block text-[10px]">Tinjauan Ulang 1 Bulan:</span>
                  <span className="font-mono font-bold text-[#153A73]">30 Hari Pasca Penetapan</span>
                </div>
                <div>
                  <span className="text-[#5B6780] block text-[10px]">Tinjauan Ulang 3 Bulan:</span>
                  <span className="font-mono font-bold text-[#153A73]">90 Hari Pasca Penetapan</span>
                </div>
              </div>
            </div>
          ) : (
            /* Official Printable Decision Record View */
            <div className="space-y-6">
              <div
                id="printable-record"
                className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-5"
              >
                {/* Official Letterhead */}
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                  <CobaSepakatLogo variant="horizontal" size="sm" showTagline={true} />
                  <div className="text-right text-[11px] text-[#5B6780]">
                    <div className="font-bold text-[#153A73]">CATATAN KEPUTUSAN RESMI</div>
                    <div className="font-mono">NO: CS/DEC/{issue.id.slice(-6).toUpperCase()}</div>
                    <div>{new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</div>
                  </div>
                </div>

                {/* Outcome Highlight */}
                <div className="bg-[#2FA882]/10 border border-[#2FA882] rounded-2xl p-4 text-center">
                  <div className="text-xs uppercase font-bold text-[#2FA882]">Hasil Penetapan Akhir</div>
                  <h3 className="text-lg font-extrabold text-[#153A73] mt-1">{title}</h3>
                </div>

                {/* Issue & Facts Overview */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-[#153A73]">Pertanyaan Keputusan:</span>{' '}
                    <span className="text-[#5B6780]">{issue.title}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#153A73]">Lokasi & Komunitas:</span>{' '}
                    <span className="text-[#5B6780]">{issue.location} · {issue.spaceName}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#153A73]">Dasar Pertimbangan Fakta:</span>
                    <p className="text-[#5B6780] mt-0.5 leading-relaxed bg-[#F5F8FC] p-3 rounded-xl border border-[#E2E8F0]">
                      {reason}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-[#153A73]">Pernyataan Resmi:</span>
                    <p className="text-[#153A73] font-medium mt-0.5 leading-relaxed bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                      &ldquo;{statement}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Metric Summary Grid */}
                <div>
                  <div className="text-[11px] font-bold text-[#153A73] mb-2 uppercase tracking-wider">
                    Ringkasan Metrik Terverifikasi:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    {experiment.metrics.map((m) => (
                      <div key={m.id} className="p-2.5 bg-[#F5F8FC] rounded-xl border border-[#E2E8F0]">
                        <div className="text-[10px] text-[#5B6780] truncate">{m.name}</div>
                        <div className="font-mono font-bold text-[#2FA882] mt-0.5">
                          {m.currentValue ?? m.baselineValue} {m.unit}
                        </div>
                        <div className="text-[9px] text-[#5B6780]">Basis: {m.baselineValue}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Signatures & Schedule */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E2E8F0] text-center text-xs">
                  <div>
                    <div className="text-[10px] text-[#5B6780]">Ditetapkan Oleh:</div>
                    <div className="font-bold text-[#153A73] mt-6">{currentUser.name}</div>
                    <div className="text-[10px] text-[#5B6780]">Ketua RT / Pengurus</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#5B6780]">Fasilitator Independen:</div>
                    <div className="font-bold text-[#153A73] mt-6">Hendra Setiawan, S.Sos</div>
                    <div className="text-[10px] text-[#5B6780]">Mitra Fasilitasi</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#5B6780]">Pemantau Netral:</div>
                    <div className="font-bold text-[#153A73] mt-6">Dr. Agus Pratama</div>
                    <div className="text-[10px] text-[#5B6780]">Pemantau Independen</div>
                  </div>
                </div>
              </div>

              {/* Acceptance Survey for Participants */}
              <div className="bg-[#F5F8FC] rounded-2xl p-5 border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#153A73] uppercase tracking-wider">
                      Survei Penerimaan Pasca-Keputusan
                    </h4>
                    <p className="text-[11px] text-[#5B6780]">
                      Mengukur penerimaan warga, termasuk oleh pihak yang dugaannya berbeda.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#2FA882]">
                    Rata-rata: 4.5 / 5.0 (90% Menerima)
                  </span>
                </div>

                {!surveySubmitted ? (
                  <form onSubmit={handleSurveySubmit} className="space-y-3 pt-2">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-semibold text-[#153A73]">Skor Penerimaan:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setAcceptanceScore(star)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= acceptanceScore
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-xs font-semibold text-[#153A73]">
                        Apakah Anda menerima keputusan ini?
                      </label>
                      <button
                        type="button"
                        onClick={() => setUserAccepts(true)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          userAccepts ? 'bg-[#2FA882] text-white' : 'bg-white border text-slate-600'
                        }`}
                      >
                        Ya, Menerima
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserAccepts(false)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          !userAccepts ? 'bg-[#DC2626] text-white' : 'bg-white border text-slate-600'
                        }`}
                      >
                        Tidak Menerima
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Umpan balik singkat tentang proses uji coba..."
                        value={acceptanceComment}
                        onChange={(e) => setAcceptanceComment(e.target.value)}
                        className="text-xs p-2 rounded-xl border border-[#E2E8F0] flex-1 bg-white"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#153A73] hover:bg-[#1A58B8] text-white text-xs font-semibold rounded-xl"
                      >
                        Kirim Umpan Balik
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-xs text-[#2FA882] font-semibold py-2">
                    ✓ Terima kasih! Umpan balik penerimaan Anda telah dicatat secara anonim untuk riset kualitas keputusan bersama.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#E2E8F0] pt-4 flex items-center justify-between gap-3 shrink-0">
          <div>
            {isSaved && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#F5F8FC] hover:bg-slate-200 text-[#153A73] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak / Unduh PDF
                </button>
                <button
                  onClick={() => alert('Tautan dokumen resmi disalin ke papan klip!')}
                  className="px-3 py-2 bg-[#F5F8FC] hover:bg-slate-200 text-[#153A73] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" /> Bagikan WhatsApp
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isSaved ? (
              <button
                type="button"
                onClick={handleSaveDecision}
                className="px-6 py-2.5 bg-[#2FA882] hover:bg-[#258768] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Simpan & Kunci Catatan Keputusan
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-[#153A73] hover:bg-[#1A58B8] text-white text-xs font-semibold rounded-xl"
              >
                Selesai
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
