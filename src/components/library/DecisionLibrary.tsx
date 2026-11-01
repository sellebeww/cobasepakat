/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Issue } from '../../types';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  RotateCcw,
  Scale,
  Calendar,
  Building2,
  FileText,
  Share2,
  Sparkles,
} from 'lucide-react';

export const DecisionLibrary: React.FC = () => {
  const { issues, setActiveIssueId, setActiveTab } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOutcomeFilter, setSelectedOutcomeFilter] = useState<string>('all');

  const filteredIssues = issues.filter((iss) => {
    const matchesSearch =
      iss.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      iss.context.toLowerCase().includes(searchQuery.toLowerCase()) ||
      iss.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedOutcomeFilter === 'all') return true;
    if (selectedOutcomeFilter === 'adopsi')
      return iss.decision?.outcome === 'adopsi';
    if (selectedOutcomeFilter === 'ubah')
      return iss.decision?.outcome === 'ubah_coba_lagi';
    if (selectedOutcomeFilter === 'berjalan')
      return iss.status === 'percobaan_berjalan';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E2E8F0] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-[#2FA882] uppercase tracking-wider mb-1">
              Arsip & Memori Kolektif Komunitas
            </div>
            <h1 className="text-2xl font-extrabold text-[#153A73]">
              Pustaka Keputusan & Pembelajaran
            </h1>
            <p className="text-xs text-[#5B6780] mt-1">
              Catatan riwayat percobaan faktual yang pernah dijalankan. Pelajari data sebelumnya agar komunitas tidak mengulang perdebatan yang sama.
            </p>
          </div>

          <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-3 shrink-0">
            <Sparkles className="w-5 h-5 text-[#2272E8] shrink-0" />
            <div className="text-xs text-[#153A73]">
              <span className="font-bold">Fitur &ldquo;Pernah Dicoba&rdquo;:</span> Otomatis mencocokkan isu baru dengan rekam jejak ruang lain.
            </div>
          </div>
        </div>

        {/* Search and Filter bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berdasarkan topik (parkir, jam malam, gerbang, sampah, kebisingan)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F8FC] focus:bg-white focus:ring-2 focus:ring-[#2272E8] outline-none text-[#153A73]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'all', label: 'Semua Status' },
              { id: 'adopsi', label: 'Adopsi Tetap' },
              { id: 'ubah', label: 'Ubah & Coba Lagi' },
              { id: 'berjalan', label: 'Sedang Berjalan' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedOutcomeFilter(f.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedOutcomeFilter === f.id
                    ? 'bg-[#153A73] text-white'
                    : 'bg-[#F5F8FC] text-[#5B6780] hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredIssues.map((iss) => {
          const hasDecision = !!iss.decision;

          return (
            <div
              key={iss.id}
              className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm hover:border-[#2272E8]/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#5B6780]">
                    <Building2 className="w-3.5 h-3.5 text-[#2272E8]" />
                    <span>{iss.spaceName}</span>
                    <span>·</span>
                    <span className="font-mono">{new Date(iss.createdAt).toLocaleDateString('id-ID')}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                      iss.decision?.outcome === 'adopsi'
                        ? 'bg-[#2FA882]/10 text-[#2FA882]'
                        : iss.decision?.outcome === 'ubah_coba_lagi'
                        ? 'bg-blue-50 text-[#2272E8]'
                        : 'bg-purple-50 text-purple-700'
                    }`}
                  >
                    {hasDecision ? iss.decision?.outcome.replace(/_/g, ' ') : iss.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#153A73] leading-snug">
                  {iss.title}
                </h3>

                <p className="text-xs text-[#5B6780] line-clamp-3 leading-relaxed">
                  {iss.context}
                </p>

                {hasDecision && (
                  <div className="p-3.5 bg-[#F5F8FC] rounded-2xl border border-[#E2E8F0] space-y-1 text-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#2FA882]">
                      Keputusan Akhir:
                    </div>
                    <div className="font-bold text-[#153A73]">{iss.decision?.title}</div>
                    <p className="text-[#5B6780] line-clamp-2 text-[11px]">{iss.decision?.reason}</p>
                    <div className="text-[10px] font-mono text-slate-500 pt-1">
                      Skor Penerimaan Warga: {iss.decision?.acceptanceAverageScore}/5.0 ({iss.decision?.acceptancePercentage}% Menerima)
                    </div>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                <div className="text-[11px] text-[#5B6780]">
                  Lokasi: <span className="font-medium text-[#153A73]">{iss.location}</span>
                </div>
                <button
                  onClick={() => {
                    setActiveIssueId(iss.id);
                    setActiveTab('isu');
                  }}
                  className="px-4 py-1.5 bg-[#F5F8FC] hover:bg-[#2272E8] hover:text-white text-[#153A73] rounded-xl text-xs font-semibold transition-all"
                >
                  Buka Detail & Rekam Jejak &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
