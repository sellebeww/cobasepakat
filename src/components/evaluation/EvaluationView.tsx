/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Experiment, Issue, Claim } from '../../types';
import {
  CheckCircle2,
  XCircle,
  TrendingDown,
  TrendingUp,
  Scale,
  Award,
  Users,
  AlertCircle,
  FileText,
  ArrowRight,
  ShieldCheck,
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

  // Evaluation math
  const metricEvaluations = experiment.metrics.map((m) => {
    const currentVal = m.currentValue ?? m.baselineValue;
    const diff = currentVal - m.baselineValue;
    const percentDiff =
      m.baselineValue !== 0 ? Math.round((diff / m.baselineValue) * 100) : 0;

    const thresholdMet =
      m.direction === 'turun_lebih_baik'
        ? currentVal <= m.thresholdValue
        : currentVal >= m.thresholdValue;

    return {
      metric: m,
      currentVal,
      diff,
      percentDiff,
      thresholdMet,
    };
  });

  const metCount = metricEvaluations.filter((me) => me.thresholdMet).length;
  const isOverallCriteriaMet = metCount >= 3; // e.g. 3 of 4 met

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E2E8F0] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-[#2272E8] uppercase tracking-wider mb-1">
              Tahap 7 dari 9 · Laporan Evaluasi Bersama
            </div>
            <h2 className="text-2xl font-extrabold text-[#153A73]">
              Evaluasi Hasil Percobaan & Pergeseran Pendapat
            </h2>
            <p className="text-xs text-[#5B6780] mt-1">
              Data empiris dibandingkan terhadap garis dasar dan kriteria keputusan yang telah disepakati di muka.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBackToDashboard}
              className="px-4 py-2 bg-[#F5F8FC] hover:bg-slate-200 text-[#153A73] text-xs font-semibold rounded-xl transition-colors"
            >
              &larr; Kembali ke Dasbor
            </button>
            {(currentUser.role === 'pengurus' || currentUser.role === 'pengelola_kawasan') && (
              <button
                onClick={onProceedToDecision}
                className="px-5 py-2.5 bg-[#2FA882] hover:bg-[#258768] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" /> Catat Keputusan Resmi &rarr;
              </button>
            )}
          </div>
        </div>

        {/* Algorithmic Criteria Evaluation Verdict */}
        <div
          className={`p-5 rounded-2xl border flex items-start gap-4 ${
            isOverallCriteriaMet
              ? 'bg-[#2FA882]/10 border-[#2FA882] text-[#153A73]'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              isOverallCriteriaMet ? 'bg-[#2FA882] text-white' : 'bg-amber-500 text-white'
            }`}
          >
            <Scale className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-[#2FA882]">
              Hasil Pengujian Terhadap Kriteria Keputusan
            </div>
            <div className="text-base font-bold">
              {isOverallCriteriaMet
                ? 'Kriteria Adopsi Terpenuhi Secara Signifikan'
                : 'Sebagian Kriteria Belum Terpenuhi'}
            </div>
            <p className="text-xs leading-relaxed text-[#5B6780]">
              Aturan Awal: &ldquo;{experiment.decisionRule}&rdquo;.
              Dari {experiment.metrics.length} metrik yang diukur, {metCount} metrik mencapai ambang batas keberhasilan yang disepakati.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Baseline Comparison Table */}
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[#153A73]">
          Perbandingan Rinci Tiap Metrik vs Garis Dasar
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#5B6780]">
                <th className="py-3 px-3 font-semibold">Ukuran Hasil (Metrik)</th>
                <th className="py-3 px-3 font-semibold">Garis Dasar</th>
                <th className="py-3 px-3 font-semibold">Hasil Percobaan</th>
                <th className="py-3 px-3 font-semibold">Perubahan</th>
                <th className="py-3 px-3 font-semibold">Ambang Sepakat</th>
                <th className="py-3 px-3 font-semibold text-center">Status Kriteria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {metricEvaluations.map((me) => (
                <tr key={me.metric.id} className="hover:bg-[#F5F8FC]">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-[#153A73]">{me.metric.name}</div>
                    <div className="text-[10px] text-[#5B6780]">{me.metric.method}</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[#153A73]">
                    {me.metric.baselineValue} {me.metric.unit}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-[#153A73]">
                    {me.currentVal} {me.metric.unit}
                  </td>
                  <td className="py-3.5 px-3 font-mono">
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        me.thresholdMet ? 'text-[#2FA882]' : 'text-amber-700'
                      }`}
                    >
                      {me.percentDiff > 0 ? `+${me.percentDiff}%` : `${me.percentDiff}%`}
                      {me.percentDiff <= 0 ? (
                        <TrendingDown className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingUp className="w-3.5 h-3.5" />
                      )}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[#2272E8]">
                    {me.metric.direction === 'turun_lebih_baik' ? '≤ ' : '≥ '}
                    {me.metric.thresholdValue} {me.metric.unit}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {me.thresholdMet ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2FA882] bg-[#2FA882]/10 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Terpenuhi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                        <AlertCircle className="w-3.5 h-3.5" /> Belum Terpenuhi
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mind-Shifting Section (Pergeseran Pikiran & Keyakinan Warga) */}
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#153A73] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#2272E8]" />
            Pergeseran Pikiran Berdasarkan Bukti Nyata (Mind-Shifting)
          </h3>
          <p className="text-xs text-[#5B6780] mt-0.5">
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
                className="p-5 bg-[#F5F8FC] rounded-2xl border border-[#E2E8F0] space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#153A73]">{claim.userName}</h4>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        claim.stance === 'pro'
                          ? 'text-[#2272E8]'
                          : claim.stance === 'kontra'
                          ? 'text-[#F59E0B]'
                          : 'text-slate-500'
                      }`}
                    >
                      Dugaan Awal ({claim.stance})
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-[#5B6780] block">Perubahan Keyakinan</span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        diff > 0 ? 'text-[#2FA882]' : diff < 0 ? 'text-[#2272E8]' : 'text-slate-500'
                      }`}
                    >
                      {claim.initialConfidence}% &rarr; {currentConf}% ({diff >= 0 ? `+${diff}%` : `${diff}%`})
                    </span>
                  </div>
                </div>

                <div className="text-xs text-[#153A73] italic bg-white p-3 rounded-xl border border-[#E2E8F0]">
                  &ldquo;{claim.statement}&rdquo;
                </div>

                <div className="text-[11px] text-[#5B6780]">
                  <span className="font-semibold text-[#153A73]">Bukti Pengubah Pendapat:</span>{' '}
                  {claim.mindChangingEvidence}
                </div>

                {/* Slider for updating confidence */}
                <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0]">
                  <div className="flex justify-between text-xs font-semibold text-[#153A73]">
                    <span>Keyakinan Pasca-Evaluasi:</span>
                    <span className="font-mono text-[#2272E8]">{currentConf}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={currentConf}
                    onChange={(e) => handleConfidenceChange(claim.id, Number(e.target.value))}
                    className="w-full accent-[#2272E8] cursor-pointer"
                  />
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] text-[#5B6780]">0% (Sangat Ragu)</span>
                    <button
                      onClick={() => handleSaveConfidence(claim.id)}
                      className="px-3 py-1 bg-white hover:bg-slate-100 text-[#153A73] text-[11px] font-semibold border border-[#E2E8F0] rounded-lg transition-colors"
                    >
                      {isSavedMap[claim.id] ? 'Tersimpan ✓' : 'Perbarui Keyakinan'}
                    </button>
                    <span className="text-[10px] text-[#5B6780]">100% (Sangat Yakin)</span>
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
