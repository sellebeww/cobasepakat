/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Facilitator } from '../../types';
import {
  Star,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export const FacilitatorDirectory: React.FC = () => {
  const { facilitators, currentSpace, requestFacilitator } = useApp();
  const [selectedFacilitator, setSelectedFacilitator] = useState<Facilitator | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [pkg, setPkg] = useState('Paket A: Penyusunan Desain & Gerbang Kelayakan (2 Sesi)');
  const [note, setNote] = useState('');

  const handleBook = (f: Facilitator) => {
    setSelectedFacilitator(f);
    setBookingSuccess(false);
    setNote('');
  };

  const confirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFacilitator) requestFacilitator(selectedFacilitator.name, pkg, note.trim());
    setBookingSuccess(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-brand-border shadow-sm space-y-3">
        <div className="text-xs font-bold text-brand-green uppercase tracking-wider">
          Pendampingan Ahli Netral
        </div>
        <h1 className="text-3xl font-extrabold text-brand-navy">
          Layanan Fasilitasi Mediasi & Percobaan
        </h1>
        <p className="text-xs md:text-sm text-brand-slate max-w-3xl leading-relaxed">
          Butuh pihak ketiga yang netral untuk memandu penyusunan Gerbang Kelayakan, merumuskan hipotesis yang adil,
          dan memimpin rapat evaluasi? Hubungi fasilitator terverifikasi CobaSepakat.
        </p>
      </div>

      {/* Facilitator Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {facilitators.map((fac) => (
          <div
            key={fac.id}
            className="bg-white rounded-3xl p-6 border border-brand-border shadow-sm hover:border-brand-blue transition-all flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={fac.avatarUrl}
                  alt={fac.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-brand-border shrink-0"
                />
                <div>
                  <h3 className="text-sm font-bold text-brand-navy">{fac.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{fac.rating}</span>
                    <span className="text-brand-slate font-normal text-xs">
                      ({fac.completedTrials} percobaan selesai)
                    </span>
                  </div>
                  <div className="text-xs text-brand-green font-semibold flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3 h-3" /> Terakreditasi sejak {fac.certifiedSince}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="font-semibold text-brand-navy">{fac.title}</div>
                <div className="text-xs text-brand-blue bg-blue-50/60 p-2 rounded-xl border border-blue-100">
                  Spesialisasi: {fac.specialization}
                </div>
                <p className="text-brand-slate text-xs leading-relaxed pt-1">{fac.bio}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-brand-border flex items-center justify-between">
              <div>
                <div className="text-xs text-brand-slate">Tarif Pendampingan:</div>
                <div className="font-mono font-bold text-xs text-brand-navy">{fac.hourlyRate}</div>
              </div>
              <button type="button"
                onClick={() => handleBook(fac)}
                className="px-4 py-2 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-full text-xs font-bold transition-all shadow-card"
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-brand-border space-y-4">
            <h3 className="text-base font-bold text-brand-navy">
              Ajukan Permintaan Fasilitasi
            </h3>
            <div className="text-xs text-brand-slate">
              Untuk mendampingi musyawarah di: <span className="font-bold text-brand-navy">{currentSpace.name}</span>
            </div>

            {!bookingSuccess ? (
              <form onSubmit={confirmBooking} className="space-y-3">
                <div className="p-3 bg-brand-surface rounded-xl flex items-center gap-3">
                  <img
                    src={selectedFacilitator.avatarUrl}
                    alt={selectedFacilitator.name}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <div className="text-xs font-bold text-brand-navy">{selectedFacilitator.name}</div>
                    <div className="text-xs text-brand-slate">{selectedFacilitator.hourlyRate}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-navy mb-1">
                    Pilih Paket Pendampingan:
                  </label>
                  <select
                    value={pkg}
                    onChange={(e) => setPkg(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-brand-border bg-white text-brand-navy"
                  >
                    <option value="Paket A: Penyusunan Desain & Gerbang Kelayakan (2 Sesi)">Paket A: Penyusunan Desain & Gerbang Kelayakan (2 Sesi)</option>
                    <option value="Paket B: Pendampingan Penuh + Rapat Evaluasi 14 Hari (4 Sesi)">Paket B: Pendampingan Penuh + Rapat Evaluasi 14 Hari (4 Sesi)</option>
                    <option value="Paket C: Konsultasi Darurat (1 Sesi)">Paket C: Konsultasi Darurat (1 Sesi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-navy mb-1">
                    Catatan Kasus Singkat:
                  </label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ceritakan isu yang ingin dibantu fasilitasi..."
                    className="w-full text-xs p-2.5 rounded-xl border border-brand-border outline-none"
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
                    className="px-5 py-2 bg-brand-green hover:bg-[#0B5F4A] text-white text-xs font-bold rounded-full shadow-card"
                  >
                    Kirim Permintaan
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-brand-green flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-navy">
                    Permintaan Berhasil Terkirim!
                  </h4>
                  <p className="text-xs text-brand-slate mt-1">
                    {selectedFacilitator.name} akan menghubungi pengurus ruang melalui email dan nomor WhatsApp terdaftar dalam 1x24 jam.
                  </p>
                </div>
                <button type="button"
                  onClick={() => setSelectedFacilitator(null)}
                  className="px-5 py-2 bg-brand-navy text-white text-xs font-semibold rounded-full"
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
