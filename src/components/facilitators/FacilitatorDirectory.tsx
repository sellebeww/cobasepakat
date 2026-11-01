/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Facilitator } from '../../types';
import {
  Users,
  Star,
  Award,
  CheckCircle2,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export const FacilitatorDirectory: React.FC = () => {
  const { facilitators, currentSpace } = useApp();
  const [selectedFacilitator, setSelectedFacilitator] = useState<Facilitator | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleBook = (f: Facilitator) => {
    setSelectedFacilitator(f);
    setBookingSuccess(false);
  };

  const confirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E2E8F0] shadow-sm space-y-3">
        <div className="text-xs font-bold text-[#2FA882] uppercase tracking-wider">
          Pendampingan Ahli Netral
        </div>
        <h1 className="text-2xl font-extrabold text-[#153A73]">
          Layanan Fasilitasi Mediasi & Percobaan
        </h1>
        <p className="text-xs md:text-sm text-[#5B6780] max-w-3xl leading-relaxed">
          Butuh pihak ketiga yang netral untuk memandu penyusunan Gerbang Kelayakan, merumuskan hipotesis yang adil,
          dan memimpin rapat evaluasi? Hubungi fasilitator terverifikasi CobaSepakat.
        </p>
      </div>

      {/* Facilitator Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {facilitators.map((fac) => (
          <div
            key={fac.id}
            className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm hover:border-[#2272E8] transition-all flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={fac.avatarUrl}
                  alt={fac.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-[#E2E8F0] shrink-0"
                />
                <div>
                  <h3 className="text-sm font-bold text-[#153A73]">{fac.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{fac.rating}</span>
                    <span className="text-[#5B6780] font-normal text-[11px]">
                      ({fac.completedTrials} percobaan selesai)
                    </span>
                  </div>
                  <div className="text-[10px] text-[#2FA882] font-semibold flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3 h-3" /> Terakreditasi sejak {fac.certifiedSince}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="font-semibold text-[#153A73]">{fac.title}</div>
                <div className="text-[11px] text-[#2272E8] bg-blue-50/60 p-2 rounded-xl border border-blue-100">
                  Spesialisasi: {fac.specialization}
                </div>
                <p className="text-[#5B6780] text-[11px] leading-relaxed pt-1">{fac.bio}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#5B6780]">Tarif Pendampingan:</div>
                <div className="font-mono font-bold text-xs text-[#153A73]">{fac.hourlyRate}</div>
              </div>
              <button
                onClick={() => handleBook(fac)}
                className="px-4 py-2 bg-[#2272E8] hover:bg-[#1A58B8] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Pilih Fasilitator
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedFacilitator && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <h3 className="text-base font-bold text-[#153A73]">
              Ajukan Permintaan Fasilitasi
            </h3>
            <div className="text-xs text-[#5B6780]">
              Untuk mendampingi musyawarah di: <span className="font-bold text-[#153A73]">{currentSpace.name}</span>
            </div>

            {!bookingSuccess ? (
              <form onSubmit={confirmBooking} className="space-y-3">
                <div className="p-3 bg-[#F5F8FC] rounded-xl flex items-center gap-3">
                  <img
                    src={selectedFacilitator.avatarUrl}
                    alt={selectedFacilitator.name}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#153A73]">{selectedFacilitator.name}</div>
                    <div className="text-[10px] text-[#5B6780]">{selectedFacilitator.hourlyRate}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#153A73] mb-1">
                    Pilih Paket Pendampingan:
                  </label>
                  <select className="w-full text-xs p-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[#153A73]">
                    <option>Paket A: Penyusunan Desain & Gerbang Kelayakan (2 Sesi)</option>
                    <option>Paket B: Pendampingan Penuh + Rapat Evaluasi 14 Hari (4 Sesi)</option>
                    <option>Paket C: Konsultasi Darurat (1 Sesi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#153A73] mb-1">
                    Catatan Kasus Singkat:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ceritakan isu yang ingin dibantu fasilitasi..."
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E2E8F0] outline-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFacilitator(null)}
                    className="px-4 py-2 bg-slate-100 text-xs font-semibold rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#2FA882] hover:bg-[#258768] text-white text-xs font-bold rounded-xl shadow-md"
                  >
                    Kirim Permintaan
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#2FA882] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#153A73]">
                    Permintaan Berhasil Terkirim!
                  </h4>
                  <p className="text-xs text-[#5B6780] mt-1">
                    {selectedFacilitator.name} akan menghubungi pengurus ruang melalui email dan nomor WhatsApp terdaftar dalam 1x24 jam.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFacilitator(null)}
                  className="px-5 py-2 bg-[#153A73] text-white text-xs font-semibold rounded-xl"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
