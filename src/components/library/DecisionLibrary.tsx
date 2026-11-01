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
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-brand-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-brand-green uppercase tracking-wider mb-1">
              Arsip & Memori Kolektif Komunitas
            </div>
            <h1 className="text-3xl font-extrabold text-brand-navy">
              Pustaka Keputusan & Pembelajaran
            </h1>
            <p className="text-xs text-brand-slate mt-1">
              Catatan riwayat percobaan faktual yang pernah dijalankan. Pelajari data sebelumnya agar komunitas tidak mengulang perdebatan yang sama.
            </p>
          </div>

          <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-3 shrink-0">
            <Sparkles className="w-5 h-5 text-brand-blue shrink-0" />
            <div className="text-xs text-brand-navy">
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
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-brand-border bg-brand-surface focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none text-brand-navy"
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
                    ? 'bg-brand-navy text-white'
                    : 'bg-brand-surface text-brand-slate hover:bg-slate-200'
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
              className="bg-white rounded-3xl p-6 border border-brand-border shadow-sm hover:border-brand-blue/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-brand-slate">
                    <Building2 className="w-3.5 h-3.5 text-brand-blue" />
                    <span>{iss.spaceName}</span>
                    <span>·</span>
                    <span className="font-mono">{new Date(iss.createdAt).toLocaleDateString('id-ID')}</span>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
                      iss.decision?.outcome === 'adopsi'
                        ? 'bg-brand-green/10 text-brand-green'
                        : iss.decision?.outcome === 'ubah_coba_lagi'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-blue-50 text-brand-blue'
                    }`}
                  >
                    {hasDecision ? iss.decision?.outcome.replace(/_/g, ' ') : iss.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="text-base font-bold text-brand-navy leading-snug">
                  {iss.title}
                </h3>

                <p className="text-xs text-brand-slate line-clamp-3 leading-relaxed">
                  {iss.context}
                </p>

                {hasDecision && (
                  <div className="p-3.5 bg-brand-surface rounded-2xl border border-brand-border space-y-1 text-xs">
                    <div className="text-xs font-bold uppercase tracking-wider text-brand-green">
                      Keputusan Akhir:
                    </div>
                    <div className="font-bold text-brand-navy">{iss.decision?.title}</div>
                    <p className="text-brand-slate line-clamp-2 text-xs">{iss.decision?.reason}</p>
                    <div className="text-xs font-mono text-slate-500 pt-1">
                      Skor Penerimaan Warga: {iss.decision?.acceptanceAverageScore}/5.0 ({iss.decision?.acceptancePercentage}% Menerima)
                    </div>
                  </div>
                )}

                {!hasDecision && (
                  <div className="p-3.5 rounded-2xl border border-dashed border-brand-border space-y-1 text-xs">
                    <div className="text-xs font-bold uppercase tracking-wider text-brand-blue">
                      Keputusan Belum Tercatat
                    </div>
                    <p className="text-brand-slate">
                      Percobaan masih berjalan. Hasil dan keputusan akan muncul di sini setelah rapat evaluasi.
                    </p>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-brand-border flex items-center justify-between">
                <div className="text-xs text-brand-slate">
                  Lokasi: <span className="font-medium text-brand-navy">{iss.location}</span>
                </div>
                <button
                  onClick={() => {
                    setActiveIssueId(iss.id);
                    setActiveTab('isu');
                  }}
                  className="px-4 py-1.5 bg-brand-surface hover:bg-brand-blue hover:text-white text-brand-navy rounded-xl text-xs font-semibold transition-all"
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
