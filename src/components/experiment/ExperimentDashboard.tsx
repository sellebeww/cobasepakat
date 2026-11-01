/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Experiment, Issue, Metric } from '../../types';
import {
  Calendar,
  Clock,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Plus,
  Camera,
  Activity,
  TrendingDown,
  TrendingUp,
  FileText,
  UserCheck,
  Send,
  Flag,
  Info,
} from 'lucide-react';

interface ExperimentDashboardProps {
  experiment: Experiment;
  issue: Issue;
  onOpenEvaluation: () => void;
  onOpenDecision: () => void;
}

export const ExperimentDashboard: React.FC<ExperimentDashboardProps> = ({
  experiment,
  issue,
  onOpenEvaluation,
  onOpenDecision,
}) => {
  const {
    currentUser,
    addDataEntry,
    verifyDataEntry,
    triggerEmergencyStop,
    submitApproval,
  } = useApp();

  // Mobile quick entry states
  const [selectedMetricId, setSelectedMetricId] = useState<string>(
    experiment.metrics[0]?.id || ''
  );
  const [entryValue, setEntryValue] = useState<number | ''>('');
  const [entryNotes, setEntryNotes] = useState<string>('');
  const [showStopModal, setShowStopModal] = useState<boolean>(false);
  const [stopReason, setStopReason] = useState<string>('');
  const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false);
  const [approvalStance, setApprovalStance] = useState<'setuju' | 'setuju_dengan_catatan' | 'keberatan'>('setuju');
  const [approvalNote, setApprovalNote] = useState<string>('');

  const currentMetric = experiment.metrics.find((m) => m.id === selectedMetricId) || experiment.metrics[0];

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (entryValue === '' || isNaN(Number(entryValue))) return;
    addDataEntry(experiment.id, selectedMetricId, Number(entryValue), entryNotes);
    setEntryValue('');
    setEntryNotes('');
  };

  const handleStopTrial = () => {
    if (!stopReason.trim()) return;
    triggerEmergencyStop(experiment.id, stopReason);
    setShowStopModal(false);
  };

  const handleVoteDesign = () => {
    submitApproval(experiment.id, approvalStance, approvalNote);
    setShowApprovalModal(false);
  };

  // Quorum calculation
  const approvedCount = experiment.approvals.filter(
    (a) => a.stance === 'setuju' || a.stance === 'setuju_dengan_catatan'
  ).length;
  const userHasApproved = experiment.approvals.some((a) => a.userId === currentUser.id);

  // Status badge styling
  const isStopped = experiment.status === 'dihentikan';
  const isDone = experiment.status === 'selesai';
  const isPendingApproval = experiment.status === 'menunggu_persetujuan';

  return (
    <div className="space-y-6">
      {/* Top Banner / Emergency Stop Notice if stopped */}
      {isStopped && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 text-red-900 flex items-start gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0 text-[#DC2626]">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="font-bold text-base text-[#DC2626]">
              Percobaan Dihentikan Segera (Aturan Berhenti Terpicu)
            </h3>
            <p className="text-xs text-red-800">
              Penyebab: &ldquo;{experiment.stoppedReason}&rdquo;
            </p>
            <div className="text-[11px] text-red-600 font-mono">
              Waktu Penghentian: {experiment.stoppedAt ? new Date(experiment.stoppedAt).toLocaleString('id-ID') : 'Baru saja'}
            </div>
            <div className="pt-2">
              <button
                onClick={onOpenEvaluation}
                className="px-4 py-1.5 bg-[#DC2626] text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition-colors"
              >
                Buka Evaluasi & Tinjauan Insiden &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Primary Header Card with Days Progress & Stop Button */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E2E8F0] shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#5B6780] mb-1">
              <span>Percobaan Versi {experiment.version}</span>
              <span>·</span>
              <span className="font-mono">{experiment.startDate} s/d {experiment.endDate}</span>
              <span>·</span>
              <span className="capitalize text-[#2272E8] font-bold">
                {experiment.status.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-[#153A73] leading-snug">
              {experiment.treatment}
            </h2>
            <p className="text-xs text-[#5B6780] mt-1">
              Ruang Lingkup: <span className="font-semibold text-[#153A73]">{experiment.scope}</span>
            </p>
          </div>

          {/* Action cluster */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Panic Stop Button */}
            {!isStopped && !isDone && (
              <button
                onClick={() => setShowStopModal(true)}
                className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-[#DC2626] border border-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                title="Hentikan percobaan detik ini juga jika keselamatan terancam"
              >
                <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
                Hentikan Sekarang
              </button>
            )}

            {/* Quick Link to Evaluation or Decision */}
            <button
              onClick={onOpenEvaluation}
              className="px-4 py-2.5 bg-[#153A73] hover:bg-[#1A58B8] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Activity className="w-4 h-4" />
              Laporan Evaluasi
            </button>

            {(currentUser.role === 'pengurus' || currentUser.role === 'pengelola_kawasan') && (
              <button
                onClick={onOpenDecision}
                className="px-4 py-2.5 bg-[#2FA882] hover:bg-[#258768] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                Catat Keputusan
              </button>
            )}
          </div>
        </div>

        {/* Day tracker and progress bar */}
        <div className="bg-[#F5F8FC] rounded-2xl p-4 border border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-[#153A73] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#2272E8]" />
              Progres Percobaan: Hari ke-{isDone ? experiment.durationDays : 8} dari {experiment.durationDays} Hari
            </span>
            <span className="font-mono text-[#5B6780] font-semibold">
              {Math.round(((isDone ? experiment.durationDays : 8) / experiment.durationDays) * 100)}% Berjalan
            </span>
          </div>
          <div className="w-full bg-[#E2E8F0] h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isStopped ? 'bg-[#DC2626]' : 'bg-[#2272E8]'
              }`}
              style={{
                width: `${Math.min(100, Math.round(((isDone ? experiment.durationDays : 8) / experiment.durationDays) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* Pre-Agreed Decision Rule Banner */}
        <div className="border-l-2 border-[#2FA882] pl-4 py-1">
          <div className="text-[11px] font-bold text-[#2FA882] uppercase tracking-wider">
            Aturan Keputusan yang Disepakati di Muka (Pre-Agreed Rule)
          </div>
          <div className="text-xs text-[#153A73] font-medium mt-0.5">
            &ldquo;{experiment.decisionRule}&rdquo;
          </div>
        </div>
      </div>

      {/* Middle Grid: Metrics Display & Stop-Rule Guardrails */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Real-Time Metrics & Charts */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#153A73] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#2272E8]" />
              Metrik Lapangan vs Garis Dasar (Baseline)
            </h3>
            <span className="text-xs text-[#5B6780]">
              {experiment.dataEntries.length} entri tercatat
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {experiment.metrics.map((met) => {
              const currentVal = met.currentValue ?? met.baselineValue;
              const isImproved =
                met.direction === 'turun_lebih_baik'
                  ? currentVal <= met.thresholdValue
                  : currentVal >= met.thresholdValue;

              const percentDiff =
                met.baselineValue !== 0
                  ? Math.round(((currentVal - met.baselineValue) / met.baselineValue) * 100)
                  : 0;

              return (
                <div
                  key={met.id}
                  className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#153A73] line-clamp-1">{met.name}</h4>
                      <p className="text-[10px] text-[#5B6780]">{met.frequency}</p>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isImproved
                          ? 'bg-[#2FA882]/10 text-[#2FA882]'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {isImproved ? 'Target Tercapai' : 'Di Bawah Target'}
                    </span>
                  </div>

                  {/* Value comparison strip */}
                  <div className="grid grid-cols-3 gap-2 text-center py-2 bg-[#F5F8FC] rounded-xl">
                    <div>
                      <div className="text-[10px] text-[#5B6780]">Garis Dasar</div>
                      <div className="text-xs font-mono font-bold text-[#153A73]">
                        {met.baselineValue}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#5B6780]">Saat Ini</div>
                      <div
                        className={`text-sm font-mono font-extrabold ${
                          isImproved ? 'text-[#2FA882]' : 'text-amber-600'
                        }`}
                      >
                        {currentVal}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#5B6780]">Ambang Target</div>
                      <div className="text-xs font-mono font-bold text-[#2272E8]">
                        {met.thresholdValue}
                      </div>
                    </div>
                  </div>

                  {/* Visual delta indicator */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#5B6780]">Selisih vs Garis Dasar:</span>
                    <span
                      className={`font-mono font-bold flex items-center gap-0.5 ${
                        isImproved ? 'text-[#2FA882]' : 'text-amber-700'
                      }`}
                    >
                      {percentDiff > 0 ? `+${percentDiff}%` : `${percentDiff}%`}
                      {percentDiff <= 0 ? (
                        <TrendingDown className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingUp className="w-3.5 h-3.5" />
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Data Logger Card (Mobile-First / Field Logger) */}
          <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#153A73] uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#2272E8]" />
                  Pencatatan Cepat Lapangan (Mobile Fast Entry)
                </h4>
                <p className="text-[11px] text-[#5B6780]">
                  Siap digunakan petugas jaga, relawan RT, atau pemantau dari ponsel.
                </p>
              </div>
              <span className="text-[10px] text-[#2FA882] bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                Sinkron Otomatis (Offline-Ready)
              </span>
            </div>

            <form onSubmit={handleQuickSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-[#153A73] mb-1">
                    Pilih Metrik:
                  </label>
                  <select
                    value={selectedMetricId}
                    onChange={(e) => setSelectedMetricId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F8FC] text-[#153A73] font-medium outline-none"
                  >
                    {experiment.metrics.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-[#153A73] mb-1">
                    Nilai Terukur ({currentMetric.unit}):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={`Contoh: ${currentMetric.baselineValue}`}
                    value={entryValue}
                    onChange={(e) => setEntryValue(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E2E8F0] font-mono text-[#153A73] outline-none"
                    required
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-[#153A73] mb-1">
                    Catatan Kondisi / Waktu:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Jam 07.15 cerah"
                    value={entryNotes}
                    onChange={(e) => setEntryNotes(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E2E8F0] text-[#153A73] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="text-[11px] text-[#5B6780] flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-slate-400" />
                  <span>Foto bukti & cap waktu otomatis disematkan</span>
                </div>
                <button
                  type="submit"
                  disabled={entryValue === ''}
                  className="px-5 py-2 bg-[#2272E8] hover:bg-[#1A58B8] disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Simpan Entri Data
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Column 3: Stop-Rule Guardrails & Verification Stream */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#153A73] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2FA882]" />
                Status Aturan Berhenti (Guardrails)
              </h4>
              <span className="text-[10px] font-bold text-[#2FA882] bg-emerald-50 px-2 py-0.5 rounded-full">
                {experiment.stopRules.filter((s) => !s.triggered).length}/{experiment.stopRules.length} Aman
              </span>
            </div>

            <div className="space-y-2.5">
              {experiment.stopRules.map((sr, idx) => (
                <div
                  key={sr.id}
                  className={`p-3 rounded-2xl border text-xs transition-all ${
                    sr.triggered
                      ? 'bg-red-50 border-red-300 text-red-900'
                      : 'bg-[#F5F8FC] border-[#E2E8F0] text-[#153A73]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                        sr.triggered ? 'bg-[#DC2626] animate-ping' : 'bg-[#2FA882]'
                      }`}
                    />
                    <div>
                      <div className="font-semibold">{sr.conditionDescription}</div>
                      <div className="text-[10px] text-[#5B6780] mt-0.5">
                        Status: {sr.triggered ? 'TERPICU - Percobaan Berhenti' : 'Aman (Belum pernah terpicu)'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 text-[11px] text-[#153A73] leading-relaxed">
              <span className="font-bold">Komitmen Bersama:</span> Jika salah satu dari aturan berhenti di atas
              terpenuhi, setiap pihak berhak menekan tombol &ldquo;Hentikan Sekarang&rdquo; tanpa perlu voting ulang.
            </div>
          </div>

          {/* Quorum Approval Status */}
          <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#153A73] uppercase tracking-wider">
                Kesepakatan Desain & Kuorum
              </h4>
              <span className="text-[10px] font-bold text-[#2272E8]">
                {approvedCount} Disetujui
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {experiment.approvals.map((app) => (
                <div
                  key={app.id}
                  className="p-2.5 bg-[#F5F8FC] rounded-xl border border-[#E2E8F0] text-[11px]"
                >
                  <div className="flex items-center justify-between font-semibold text-[#153A73]">
                    <span>{app.userName}</span>
                    <span
                      className={`text-[10px] ${
                        app.stance === 'setuju'
                          ? 'text-[#2FA882]'
                          : app.stance === 'setuju_dengan_catatan'
                          ? 'text-[#F59E0B]'
                          : 'text-[#DC2626]'
                      }`}
                    >
                      {app.stance === 'setuju'
                        ? 'Setuju'
                        : app.stance === 'setuju_dengan_catatan'
                        ? 'Setuju Catatan'
                        : 'Keberatan'}
                    </span>
                  </div>
                  {app.note && <p className="text-[#5B6780] mt-0.5 text-[10px]">{app.note}</p>}
                </div>
              ))}
            </div>

            {!userHasApproved && (
              <button
                onClick={() => setShowApprovalModal(true)}
                className="w-full py-2 bg-[#2272E8] hover:bg-[#1A58B8] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Beri Suara Kesepakatan Desain
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Stop Confirmation Modal */}
      {showStopModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-red-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#DC2626] flex items-center justify-center">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-900">
                Konfirmasi Hentikan Percobaan Segera
              </h3>
              <p className="text-xs text-red-700 mt-1">
                Fitur darurat ini akan mengubah status percobaan menjadi &ldquo;Dihentikan&rdquo;,
                mengirimkan notifikasi darurat kepada seluruh pengurus dan warga, serta memicu tahap evaluasi insiden.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#153A73] mb-1">
                Alasan Penghentian (Wajib Diisi):
              </label>
              <textarea
                rows={3}
                value={stopReason}
                onChange={(e) => setStopReason(e.target.value)}
                placeholder="Contoh: Terjadi 1 kali ambulans kesulitan bermanuver di tikungan B-08..."
                className="w-full text-xs p-3 rounded-xl border border-red-200 focus:ring-2 focus:ring-[#DC2626] outline-none text-[#153A73]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowStopModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#153A73] text-xs font-semibold rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!stopReason.trim()}
                onClick={handleStopTrial}
                className="px-5 py-2 bg-[#DC2626] hover:bg-red-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Hentikan Percobaan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quorum Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <h3 className="text-base font-bold text-[#153A73]">
              Beri Persetujuan Desain Percobaan
            </h3>
            <p className="text-xs text-[#5B6780]">
              Sebelum percobaan dimulai, setiap pihak menyepakati cara menilai dan berkomitmen menghormati hasil akhir.
            </p>

            <div className="space-y-2">
              {[
                { val: 'setuju', label: 'Setuju Sepenuhnya', color: 'text-[#2FA882]' },
                { val: 'setuju_dengan_catatan', label: 'Setuju dengan Catatan', color: 'text-[#F59E0B]' },
                { val: 'keberatan', label: 'Keberatan (Wajib Usul Perubahan)', color: 'text-[#DC2626]' },
              ].map((opt) => (
                <label
                  key={opt.val}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                    approvalStance === opt.val
                      ? 'border-[#2272E8] bg-blue-50/50'
                      : 'border-[#E2E8F0] bg-[#F5F8FC]'
                  }`}
                >
                  <input
                    type="radio"
                    name="stance"
                    checked={approvalStance === opt.val}
                    onChange={() => setApprovalStance(opt.val as any)}
                    className="text-[#2272E8]"
                  />
                  <span className={opt.color}>{opt.label}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#153A73] mb-1">
                Catatan Tambahan (Opsional):
              </label>
              <textarea
                rows={2}
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                placeholder="Tuliskan catatan khusus atau syarat pendukung..."
                className="w-full text-xs p-2.5 rounded-xl border border-[#E2E8F0] outline-none"
              />
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-[11px] text-emerald-900">
              <span className="font-bold">Pernyataan Komitmen:</span> &ldquo;Saya berjanji akan menerima keputusan akhir yang dievaluasi sesuai kriteria yang disepakati bersama ini.&rdquo;
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 bg-slate-100 text-xs font-semibold rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleVoteDesign}
                className="px-5 py-2 bg-[#2FA882] hover:bg-[#258768] text-white text-xs font-bold rounded-xl shadow-md"
              >
                Tandatangani & Kirim Suara
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
