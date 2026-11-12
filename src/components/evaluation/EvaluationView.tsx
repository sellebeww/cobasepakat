/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ResultsPanel } from '../results/ResultsPanel';
import type { Experiment, Issue, } from '../../types';
import {
  Users,
  FileText,
} from 'lucide-react';

interface EvaluationViewProps {
  experiment: Experiment;
  issue: Issue;
  onProceedToDecision: () => void;
  onBackToDashboard: () => void;
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({
  experiment,
  issue,
  onProceedToDecision,
  onBackToDashboard,
}) => {
  const { updateClaimConfidence, currentUser } = useApp();

  const [postConfidences, setPostConfidences] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    issue.claims.forEach((c) => {
      map[c.id] = c.postConfidence ?? c.initialConfidence;
    });
    return map;
  });

  const [isSavedMap, setIsSavedMap] = useState<Record<string, boolean>>({});

  const handleConfidenceChange = (claimId: string, val: number) => {
    setPostConfidences((prev) => ({ ...prev, [claimId]: val }));
    setIsSavedMap((prev) => ({ ...prev, [claimId]: false }));
  };

  const handleSaveConfidence = (claimId: string) => {
    updateClaimConfidence(issue.id, claimId, postConfidences[claimId], true);
    setIsSavedMap((prev) => ({ ...prev, [claimId]: true }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-brand-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-brand-blue uppercase tracking-wider mb-1">
              Tahap 7 dari 9 · Laporan Evaluasi Bersama
            </div>
            <h2 className="text-2xl font-extrabold text-brand-navy">
              Evaluasi Hasil Percobaan & Pergeseran Pendapat
            </h2>
            <p className="text-xs text-brand-slate mt-1">
              Data empiris dibandingkan terhadap garis dasar dan kriteria keputusan yang telah disepakati di muka.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button type="button"
              onClick={onBackToDashboard}
              className="px-4 py-2 bg-brand-surface hover:bg-slate-200 text-brand-navy text-xs font-semibold rounded-xl transition-colors"
            >
              &larr; Kembali ke Dasbor
            </button>
            {(currentUser.role === 'pengurus' || currentUser.role === 'pengelola_kawasan') && (
              <button type="button"
                onClick={onProceedToDecision}
                className="px-5 py-2.5 bg-brand-green hover:bg-[#0B5F4A] text-white text-xs font-bold rounded-full transition-all shadow-card flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" /> Catat Keputusan Resmi &rarr;
              </button>
            )}
          </div>
        </div>

      </div>

      <ResultsPanel experiment={experiment} />

      {/* Mind-Shifting Section (Pergeseran Pikiran & Keyakinan Warga) */}
      <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-brand-navy flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-blue" />
            Pergeseran Pikiran Berdasarkan Bukti Nyata (Mind-Shifting)
          </h3>
          <p className="text-xs text-brand-slate mt-0.5">
            Salah satu kekuatan CobaSepakat: peserta menuliskan bukti apa yang dapat mengubah keyakinan mereka,
            lalu memperbarui tingkat keyakinan (0-100%) setelah melihat data bersama.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {issue.claims.map((claim) => {
            const currentConf = postConfidences[claim.id] ?? claim.initialConfidence;
            const diff = currentConf - claim.initialConfidence;

            return (
              <div
                key={claim.id}
                className="p-5 bg-brand-surface rounded-2xl border border-brand-border space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-brand-navy">{claim.userName}</h4>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        claim.stance === 'pro'
                          ? 'text-brand-blue'
                          : claim.stance === 'kontra'
                          ? 'text-status-warning'
                          : 'text-slate-500'
                      }`}
                    >
                      Dugaan Awal ({claim.stance})
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-brand-slate block">Perubahan Keyakinan</span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        diff > 0 ? 'text-brand-green' : diff < 0 ? 'text-brand-blue' : 'text-slate-500'
                      }`}
                    >
                      {claim.initialConfidence}% &rarr; {currentConf}% ({diff >= 0 ? `+${diff}%` : `${diff}%`})
                    </span>
                  </div>
                </div>

                <div className="text-xs text-brand-navy italic bg-white p-3 rounded-xl border border-brand-border">
                  &ldquo;{claim.statement}&rdquo;
                </div>

                <div className="text-xs text-brand-slate">
                  <span className="font-semibold text-brand-navy">Bukti Pengubah Pendapat:</span>{' '}
                  {claim.mindChangingEvidence}
                </div>

                {/* Slider for updating confidence */}
                <div className="space-y-1.5 pt-2 border-t border-brand-border">
                  <div className="flex justify-between text-xs font-semibold text-brand-navy">
                    <span>Keyakinan Pasca-Evaluasi:</span>
                    <span className="font-mono text-brand-blue">{currentConf}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={currentConf}
                    onChange={(e) => handleConfidenceChange(claim.id, Number(e.target.value))}
                    className="w-full accent-brand-blue cursor-pointer"
                  />
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-xs text-brand-slate">0% (Sangat Ragu)</span>
                    <button type="button"
                      onClick={() => handleSaveConfidence(claim.id)}
                      className="px-3 py-1 bg-white hover:bg-slate-100 text-brand-navy text-xs font-semibold border border-brand-border rounded-lg transition-colors"
                    >
                      {isSavedMap[claim.id] ? 'Tersimpan ✓' : 'Perbarui Keyakinan'}
                    </button>
                    <span className="text-xs text-brand-slate">100% (Sangat Yakin)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
