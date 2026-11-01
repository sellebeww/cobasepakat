/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HelpCircle, X, ShieldAlert, Sparkles, Plus } from 'lucide-react';

interface NewIssueModalProps {
  onClose: () => void;
}

export const NewIssueModal: React.FC<NewIssueModalProps> = ({ onClose }) => {
  const { addIssue, currentSpace, templates, applyTemplateToCreateIssue } = useApp();

  const [mode, setMode] = useState<'custom' | 'template'>('custom');
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [location, setLocation] = useState('');
  const [affectedPartiesInput, setAffectedPartiesInput] = useState('');

  // Neutral language checker
  const aggressiveWords = ['pasti', 'harus', 'salah', 'bodoh', 'maksa', 'egois', 'kriminal'];
  // whole-word match so "kesalahan" or "dipastikan" is not flagged
  const detectedBiasedWords = aggressiveWords.filter((w) =>
    new RegExp(`(^|[^\\p{L}])${w}($|[^\\p{L}])`, 'u').test(title.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parties = affectedPartiesInput
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    addIssue({
      title,
      context,
      location: location || 'Area Komunitas',
      affectedParties: parties.length > 0 ? parties : ['Warga Penghuni'],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-brand-border my-8 space-y-5">
        <div className="flex items-start justify-between border-b border-brand-border pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-brand-navy">Buka Isu Perbedaan Pendapat Baru</h2>
            <p className="text-xs text-brand-slate">
              Ruang: <span className="font-semibold text-brand-navy">{currentSpace.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-2 p-1 bg-brand-surface rounded-xl border border-brand-border">
          <button
            type="button"
            onClick={() => setMode('custom')}
            aria-pressed={mode === 'custom'}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'custom' ? 'bg-white text-brand-navy shadow-sm' : 'text-brand-slate'
            }`}
          >
            Tulis Isu Mandiri
          </button>
          <button
            type="button"
            onClick={() => setMode('template')}
            aria-pressed={mode === 'template'}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'template' ? 'bg-white text-brand-blue shadow-sm' : 'text-brand-slate'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-blue" /> Pilih dari Templat Siap Pakai
          </button>
        </div>

        {mode === 'custom' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="issue-title" className="block text-xs font-bold text-brand-navy mb-1">
                Pertanyaan Keputusan (Wajib Bernada Netral):
              </label>
              <p className="text-xs text-brand-slate mb-2">
                Rumuskan dalam bentuk &ldquo;Apakah [tindakan] akan [akibat yang diuji]?&rdquo;. Hindari nada menyudutkan salah satu pihak.
              </p>
              <input
                id="issue-title"
                type="text"
                placeholder="Contoh: Apakah mengubah parkir sejajar menjadi parkir miring di Lorong B akan memperlancar jalan?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue outline-none text-brand-navy font-medium"
                required
              />

              {detectedBiasedWords.length > 0 && (
                <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Peringatan Pemeriksa Kata: Terdeteksi kata bermuatan asumsi (&ldquo;{detectedBiasedWords.join(', ')}&rdquo;). Mohon gunakan kalimat netral agar dapat diterima kedua pihak.
                  </span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="issue-context" className="block text-xs font-bold text-brand-navy mb-1">
                Latar Belakang & Konteks Perselisihan:
              </label>
              <textarea
                id="issue-context"
                rows={3}
                placeholder="Jelaskan situasi saat ini dan mengapa ada dua pandangan berbeda..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue outline-none text-brand-navy"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="issue-location" className="block text-xs font-bold text-brand-navy mb-1">
                  Lokasi / Objek yang Diperselisihkan:
                </label>
                <input
                  id="issue-location"
                  type="text"
                  placeholder="Contoh: Lorong B RT 04"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-brand-border"
                  required
                />
              </div>

              <div>
                <label htmlFor="issue-parties" className="block text-xs font-bold text-brand-navy mb-1">
                  Pihak Terdampak (Pisahkan dengan Koma):
                </label>
                <input
                  id="issue-parties"
                  type="text"
                  placeholder="Penghuni Lorong B, Mobil Ambulans, Pengemudi"
                  value={affectedPartiesInput}
                  onChange={(e) => setAffectedPartiesInput(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-brand-border"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-brand-navy text-xs font-semibold rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-5 py-2.5 bg-brand-blue hover:bg-brand-blue-dark disabled:bg-slate-300 text-white text-xs font-bold rounded-full shadow-card transition-all"
              >
                Buka Isu & Kumpulkan Dugaan
              </button>
            </div>
          </form>
        ) : (
          /* Template Picker inside Modal */
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-4 bg-brand-surface hover:bg-white rounded-3xl border border-brand-border hover:border-brand-blue transition-all space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-navy text-sm">{tpl.title}</span>
                  <span className="text-xs text-brand-blue font-mono font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                    {tpl.recommendedDuration} Hari
                  </span>
                </div>
                <p className="text-brand-slate text-xs">{tpl.summary}</p>
                <button
                  type="button"
                  onClick={() => {
                    applyTemplateToCreateIssue(tpl);
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-brand-blue text-white font-semibold rounded-full text-xs hover:bg-brand-blue-dark transition-colors"
                >
                  Terapkan Templat Ini &rarr;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
