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
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl border border-[#E2E8F0] my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2272E8]/10 text-[#2272E8] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#153A73]">Gerbang Kelayakan (Safety Gate)</h2>
              <p className="text-xs text-[#5B6780]">
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
        <div className="flex items-center gap-1.5 overflow-x-auto py-3 border-b border-[#E2E8F0] shrink-0">
          {issue.feasibilityChecks.map((item, idx) => {
            const currentAns = selectedAnswers[item.questionNumber]?.answer;
            const isItemActive = idx === activeItemIndex;
            return (
              <button
                key={item.id}
                onClick={() => setActiveItemIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isItemActive
                    ? 'bg-[#153A73] text-white shadow-sm'
                    : 'bg-[#F5F8FC] text-[#5B6780] hover:bg-slate-200'
                }`}
              >
                <span>{item.questionNumber}.</span>
                {item.isAbsoluteBlocker && <span className="text-amber-400 font-bold">*</span>}
                {currentAns === 'ya' && <CheckCircle2 className="w-3.5 h-3.5 text-[#2FA882]" />}
                {currentAns === 'tidak' && <XCircle className="w-3.5 h-3.5 text-[#DC2626]" />}
                {currentAns === 'belum_tahu' && <HelpCircle className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            );
          })}
        </div>

        {/* Current Question Body */}
        <div className="py-5 overflow-y-auto flex-1 space-y-4">
          <div className="bg-[#F5F8FC] rounded-2xl p-4 border border-[#E2E8F0]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#2272E8]">
                Butir {currentCheck.questionNumber} dari 7
              </span>
              {currentCheck.isAbsoluteBlocker && (
                <span className="text-[11px] font-semibold text-[#DC2626] bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                  Penghalang Mutlak (Absolute Blocker)
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-[#153A73]">{currentCheck.question}</h3>
            <p className="text-xs text-[#5B6780] mt-1">{currentCheck.description}</p>
          </div>

          {/* Answer choices */}
          <div>
            <label className="block text-xs font-semibold text-[#153A73] mb-2">
              Jawaban Penilaian:
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleAnswerChange('ya')}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  selectedAnswers[currentCheck.questionNumber]?.answer === 'ya'
                    ? 'bg-[#2FA882]/10 border-[#2FA882] text-[#2FA882]'
                    : 'border-[#E2E8F0] bg-white text-[#5B6780] hover:bg-slate-50'
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
                    ? 'bg-[#DC2626]/10 border-[#DC2626] text-[#DC2626]'
                    : 'border-[#E2E8F0] bg-white text-[#5B6780] hover:bg-slate-50'
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
                    : 'border-[#E2E8F0] bg-white text-[#5B6780] hover:bg-slate-50'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                Belum Tahu
              </button>
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-semibold text-[#153A73] mb-1">
              Catatan & Alasan Penilaian:
            </label>
            <textarea
              rows={2}
              value={selectedAnswers[currentCheck.questionNumber]?.reason || ''}
              onChange={(e) => handleReasonChange(e.target.value)}
              placeholder="Tuliskan data, fakta lapangan, atau pertimbangan fasilitator..."
              className="w-full text-xs p-3 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#2272E8] focus:border-transparent outline-none bg-white text-[#153A73]"
            />
          </div>

          {/* Absolute Blocker Warning if answer is Tidak */}
          {currentCheck.isAbsoluteBlocker &&
            selectedAnswers[currentCheck.questionNumber]?.answer === 'tidak' && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-[#DC2626] flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Penghalang Mutlak Terpicu:</span> Perubahan yang tidak dapat dibalik
                  atau mengorbankan hak/keselamatan TIDAK BOLEH dijadikan percobaan. Isu ini harus dialihkan ke musyawarah nilai
                  atau mediasi, bukan diuji coba di lapangan.
                </div>
              </div>
            )}

          {/* Condition note when passing with condition */}
          <div className="border-t border-[#E2E8F0] pt-3">
            <label className="block text-xs font-semibold text-[#153A73] mb-1">
              Catatan Syarat Khusus (Bila Lolos dengan Syarat):
            </label>
            <input
              type="text"
              value={conditionNote}
              onChange={(e) => setConditionNote(e.target.value)}
              placeholder="Contoh: Wajib ada pemantau independen atau lajur damkar minimal 3.8 meter..."
              className="w-full text-xs p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F8FC] focus:bg-white focus:ring-2 focus:ring-[#2272E8] outline-none text-[#153A73]"
            />
          </div>
        </div>

        {/* Footer & Finalize */}
        <div className="border-t border-[#E2E8F0] pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#5B6780]">Hasil Kesimpulan:</span>
            {computedOutcome === 'layak' && (
              <span className="text-xs font-bold text-[#2FA882] flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Layak Dicoba
              </span>
            )}
            {computedOutcome === 'layak_dengan_syarat' && (
              <span className="text-xs font-bold text-[#F59E0B] flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Layak dengan Syarat
              </span>
            )}
            {computedOutcome === 'tidak_layak' && (
              <span className="text-xs font-bold text-[#DC2626] flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Tidak Layak (Dialihkan)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {activeItemIndex < issue.feasibilityChecks.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveItemIndex((prev) => prev + 1)}
                className="w-full sm:w-auto px-4 py-2 bg-[#F5F8FC] hover:bg-slate-200 text-[#153A73] text-xs font-semibold rounded-xl transition-colors"
              >
                Butir Berikutnya &rarr;
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleFinalize}
              className={`w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-xl text-white transition-all shadow-sm ${
                computedOutcome === 'tidak_layak'
                  ? 'bg-[#DC2626] hover:bg-red-700'
                  : 'bg-[#2272E8] hover:bg-[#1A58B8]'
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
