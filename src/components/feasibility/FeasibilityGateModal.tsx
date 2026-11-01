/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Issue, FeasibilityCheckItem } from '../../types';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Info,
  X,
} from 'lucide-react';

interface FeasibilityGateModalProps {
  issue: Issue;
  onClose: () => void;
}

export const FeasibilityGateModal: React.FC<FeasibilityGateModalProps> = ({
  issue,
  onClose,
}) => {
  const { updateFeasibilityItem, finalizeFeasibility, currentUser } = useApp();

  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, { answer: 'ya' | 'tidak' | 'belum_tahu'; reason: string }>>(() => {
    const map: Record<number, { answer: 'ya' | 'tidak' | 'belum_tahu'; reason: string }> = {};
    issue.feasibilityChecks.forEach((c) => {
      map[c.questionNumber] = {
        answer: c.answer || 'belum_tahu',
        reason: c.reason || '',
      };
    });
    return map;
  });

  const [conditionNote, setConditionNote] = useState(
    issue.feasibilityOutcome?.conditionNote ||
      'Syarat khusus: Akses kendaraan darurat tetap wajib selebar minimal 3.8 meter setiap saat.'
  );

  const currentCheck = issue.feasibilityChecks[activeItemIndex];

  const handleAnswerChange = (ans: 'ya' | 'tidak' | 'belum_tahu') => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentCheck.questionNumber]: {
        ...prev[currentCheck.questionNumber],
        answer: ans,
      },
    }));
    updateFeasibilityItem(
      issue.id,
      currentCheck.questionNumber,
      ans,
      selectedAnswers[currentCheck.questionNumber]?.reason || ''
    );
  };

  const handleReasonChange = (reason: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentCheck.questionNumber]: {
        ...prev[currentCheck.questionNumber],
        reason,
      },
    }));
    updateFeasibilityItem(
      issue.id,
      currentCheck.questionNumber,
      selectedAnswers[currentCheck.questionNumber]?.answer || 'belum_tahu',
      reason
    );
  };

  // Evaluate outcome based on answers
  const isBlockerTriggered =
    selectedAnswers[2]?.answer === 'tidak' || selectedAnswers[3]?.answer === 'tidak';

  const hasAnyNo = Object.values(selectedAnswers).some((a) => a.answer === 'tidak');
  const hasAnyUnknown = Object.values(selectedAnswers).some((a) => a.answer === 'belum_tahu');

  let computedOutcome: 'layak' | 'layak_dengan_syarat' | 'tidak_layak' = 'layak';
  if (isBlockerTriggered) {
    computedOutcome = 'tidak_layak';
  } else if (hasAnyNo || hasAnyUnknown || conditionNote.trim().length > 0) {
    computedOutcome = 'layak_dengan_syarat';
  }

  const handleFinalize = () => {
    finalizeFeasibility(issue.id, {
      status: computedOutcome,
      conditionNote: computedOutcome === 'layak_dengan_syarat' ? conditionNote : undefined,
      reviewedBy: `${currentUser.displayName || currentUser.name} (${currentUser.role})`,
      reviewedAt: new Date().toISOString(),
      redirectSuggestion:
        computedOutcome === 'tidak_layak'
          ? 'Perselisihan menyangkut nilai atau dampak tak terbalikkan. Dialihkan ke Musyawarah Nilai / Mediasi Komprehensif.'
          : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl border border-brand-border my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-brand-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-brand-navy">Gerbang Kelayakan (Safety Gate)</h2>
              <p className="text-xs text-brand-slate">
                Fitur keselamatan wajib: hanya perselisihan faktual yang dapat dibalik dan aman yang boleh diuji coba.
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

        {/* 7 Check Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-3 border-b border-brand-border shrink-0">
          {issue.feasibilityChecks.map((item, idx) => {
            const currentAns = selectedAnswers[item.questionNumber]?.answer;
            const isItemActive = idx === activeItemIndex;
            return (
              <button
                key={item.id}
                onClick={() => setActiveItemIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isItemActive
                    ? 'bg-brand-navy text-white shadow-sm'
                    : 'bg-brand-surface text-brand-slate hover:bg-slate-200'
                }`}
              >
                <span>{item.questionNumber}.</span>
                {item.isAbsoluteBlocker && <span className="text-amber-400 font-bold">*</span>}
                {currentAns === 'ya' && <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />}
                {currentAns === 'tidak' && <XCircle className="w-3.5 h-3.5 text-status-stopped" />}
                {currentAns === 'belum_tahu' && <HelpCircle className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            );
          })}
        </div>

        {/* Current Question Body */}
        <div className="py-5 overflow-y-auto flex-1 space-y-4">
          <div className="bg-brand-surface rounded-2xl p-4 border border-brand-border">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-brand-blue">
                Butir {currentCheck.questionNumber} dari 7
              </span>
              {currentCheck.isAbsoluteBlocker && (
                <span className="text-xs font-semibold text-status-stopped bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                  Penghalang Mutlak (Absolute Blocker)
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-brand-navy">{currentCheck.question}</h3>
            <p className="text-xs text-brand-slate mt-1">{currentCheck.description}</p>
          </div>

          {/* Answer choices */}
          <div>
            <label className="block text-xs font-semibold text-brand-navy mb-2">
              Jawaban Penilaian:
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleAnswerChange('ya')}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  selectedAnswers[currentCheck.questionNumber]?.answer === 'ya'
                    ? 'bg-brand-green/10 border-brand-green text-brand-green'
                    : 'border-brand-border bg-white text-brand-slate hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Ya (Lolos)
              </button>
              <button
                type="button"
                onClick={() => handleAnswerChange('tidak')}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  selectedAnswers[currentCheck.questionNumber]?.answer === 'tidak'
                    ? 'bg-status-stopped/10 border-status-stopped text-status-stopped'
                    : 'border-brand-border bg-white text-brand-slate hover:bg-slate-50'
                }`}
              >
                <XCircle className="w-4 h-4" />
                Tidak (Gagal)
              </button>
              <button
                type="button"
                onClick={() => handleAnswerChange('belum_tahu')}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  selectedAnswers[currentCheck.questionNumber]?.answer === 'belum_tahu'
                    ? 'bg-amber-50 border-amber-300 text-amber-700'
                    : 'border-brand-border bg-white text-brand-slate hover:bg-slate-50'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                Belum Tahu
              </button>
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-semibold text-brand-navy mb-1">
              Catatan & Alasan Penilaian:
            </label>
            <textarea
              rows={2}
              value={selectedAnswers[currentCheck.questionNumber]?.reason || ''}
              onChange={(e) => handleReasonChange(e.target.value)}
              placeholder="Tuliskan data, fakta lapangan, atau pertimbangan fasilitator..."
              className="w-full text-xs p-3 rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none bg-white text-brand-navy"
            />
          </div>

          {/* Absolute Blocker Warning if answer is Tidak */}
          {currentCheck.isAbsoluteBlocker &&
            selectedAnswers[currentCheck.questionNumber]?.answer === 'tidak' && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-status-stopped flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Penghalang Mutlak Terpicu:</span> Perubahan yang tidak dapat dibalik
                  atau mengorbankan hak/keselamatan TIDAK BOLEH dijadikan percobaan. Isu ini harus dialihkan ke musyawarah nilai
                  atau mediasi, bukan diuji coba di lapangan.
                </div>
              </div>
            )}

          {/* Condition note when passing with condition */}
          <div className="border-t border-brand-border pt-3">
            <label className="block text-xs font-semibold text-brand-navy mb-1">
              Catatan Syarat Khusus (Bila Lolos dengan Syarat):
            </label>
            <input
              type="text"
              value={conditionNote}
              onChange={(e) => setConditionNote(e.target.value)}
              placeholder="Contoh: Wajib ada pemantau independen atau lajur damkar minimal 3.8 meter..."
              className="w-full text-xs p-2.5 rounded-xl border border-brand-border bg-brand-surface focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none text-brand-navy"
            />
          </div>
        </div>

        {/* Footer & Finalize */}
        <div className="border-t border-brand-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-brand-slate">Hasil Kesimpulan:</span>
            {computedOutcome === 'layak' && (
              <span className="text-xs font-bold text-brand-green flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Layak Dicoba
              </span>
            )}
            {computedOutcome === 'layak_dengan_syarat' && (
              <span className="text-xs font-bold text-status-warning flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Layak dengan Syarat
              </span>
            )}
            {computedOutcome === 'tidak_layak' && (
              <span className="text-xs font-bold text-status-stopped flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Tidak Layak (Dialihkan)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {activeItemIndex < issue.feasibilityChecks.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveItemIndex((prev) => prev + 1)}
                className="w-full sm:w-auto px-4 py-2 bg-brand-surface hover:bg-slate-200 text-brand-navy text-xs font-semibold rounded-xl transition-colors"
              >
                Butir Berikutnya &rarr;
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleFinalize}
              className={`w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-xl text-white transition-all shadow-sm ${
                computedOutcome === 'tidak_layak'
                  ? 'bg-status-stopped hover:bg-red-700'
                  : 'bg-brand-blue hover:bg-brand-blue-dark'
              }`}
            >
              Simpan & Tetapkan Kelayakan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
