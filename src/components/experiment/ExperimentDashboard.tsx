/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ResultsPanel } from '../results/ResultsPanel';
import { ReportButton } from '../results/ReportButton';
import { trialProgress } from '../../core';
import { analyzeExperiment, localUtcOffsetMinutes } from '../../lib/coreAdapter';
import type { Experiment, Issue, } from '../../types';
import {
  Clock,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Plus,
  Camera,
  Activity,
  FileText,
  Send,
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
    quorumFor,
  } = useApp();
  const [showAllEntries, setShowAllEntries] = useState(false);
  // Recorders cannot verify their own entries, so switching persona is part of the demo flow.
  const canVerify = ['pengurus', 'fasilitator', 'pemantau_independen', 'pengelola_kawasan'].includes(currentUser.role);

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
    if (entryValue === '' || Number.isNaN(Number(entryValue))) return;
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

  const isDone = experiment.status === 'selesai';
  const progress = trialProgress(experiment.startDate, experiment.durationDays, new Date().toISOString(), localUtcOffsetMinutes());
  const shownDay = isDone ? experiment.durationDays : (progress?.day ?? 0);
  const analysis = useMemo(() => analyzeExperiment(experiment), [experiment]);
  const quorum = quorumFor(experiment.id);

  // Status badge styling
  const isStopped = experiment.status === 'dihentikan';
  const _isPendingApproval = experiment.status === 'menunggu_persetujuan';

  return (
    <div className="space-y-6">
      {/* Top Banner / Emergency Stop Notice if stopped */}
      {isStopped && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 text-red-900 flex items-start gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0 text-status-stopped">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="font-bold text-base text-status-stopped">
              Percobaan Dihentikan Segera (Aturan Berhenti Terpicu)
            </h3>
            <p className="text-xs text-red-800">
              Penyebab: &ldquo;{experiment.stoppedReason}&rdquo;
            </p>
            <div className="text-xs text-red-600 font-mono">
              Waktu Penghentian: {experiment.stoppedAt ? new Date(experiment.stoppedAt).toLocaleString('id-ID') : 'Baru saja'}
            </div>
            <div className="pt-2">
              <button type="button"
                onClick={onOpenEvaluation}
                className="px-4 py-1.5 bg-status-stopped text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition-colors"
              >
                Buka Evaluasi & Tinjauan Insiden &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Primary Header Card with Days Progress & Stop Button */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-brand-border shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-slate mb-1">
              <span>Percobaan Versi {experiment.version}</span>
              <span>·</span>
              <span className="font-mono">{experiment.startDate} s/d {experiment.endDate}</span>
              <span>·</span>
              <span className="capitalize text-brand-blue font-bold">
                {experiment.status.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-brand-navy leading-snug">
              {experiment.treatment}
            </h2>
            <p className="text-xs text-brand-slate mt-1">
              Ruang Lingkup: <span className="font-semibold text-brand-navy">{experiment.scope}</span>
            </p>
          </div>

          {/* Action cluster */}
          <div className="flex flex-wrap items-center gap-2 md:shrink-0">
            {/* Panic Stop Button */}
            {!isStopped && !isDone && (
              <button type="button"
                onClick={() => setShowStopModal(true)}
                className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-status-stopped border border-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                title="Hentikan percobaan detik ini juga jika keselamatan terancam"
              >
                <AlertTriangle className="w-4 h-4 text-status-stopped" />
                Hentikan Sekarang
              </button>
            )}

            <ReportButton experiment={experiment} issue={issue} />

            {/* Quick Link to Evaluation or Decision */}
            <button type="button"
              onClick={onOpenEvaluation}
              className="px-4 py-2.5 bg-brand-navy hover:bg-brand-blue-dark text-white rounded-full text-xs font-bold transition-all shadow-card flex items-center gap-1.5"
            >
              <Activity className="w-4 h-4" />
              Laporan Evaluasi
            </button>

            {(currentUser.role === 'pengurus' || currentUser.role === 'pengelola_kawasan') && (
              <button type="button"
                onClick={onOpenDecision}
                className="px-4 py-2.5 bg-brand-green hover:bg-[#258768] text-white rounded-full text-xs font-bold transition-all shadow-card flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                Catat Keputusan
              </button>
            )}
          </div>
        </div>

        {/* Day tracker and progress bar */}
        <div className="bg-brand-surface rounded-2xl p-4 border border-brand-border">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-brand-navy flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-blue" />
              Progres Percobaan: Hari ke-{shownDay} dari {experiment.durationDays} Hari
            </span>
            <span className="font-mono text-brand-slate font-semibold">
              {Math.round(((shownDay) / experiment.durationDays) * 100)}% Berjalan
            </span>
          </div>
          <div className="w-full bg-brand-border h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isStopped ? 'bg-status-stopped' : 'bg-brand-blue'
              }`}
              style={{
                width: `${Math.min(100, Math.round(((shownDay) / experiment.durationDays) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* Pre-Agreed Decision Rule Banner */}
        <div className="border-l-2 border-brand-green pl-4 py-1">
          <div className="text-xs font-bold text-brand-green uppercase tracking-wider">
            Aturan Keputusan yang Disepakati di Muka (Pre-Agreed Rule)
          </div>
          <div className="text-xs text-brand-navy font-medium mt-0.5">
            &ldquo;{experiment.decisionRule}&rdquo;
          </div>
        </div>
      </div>

      {/* Middle Grid: Metrics Display & Stop-Rule Guardrails */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Real-Time Metrics & Charts */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-brand-navy flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-blue" />
              Metrik Lapangan vs Garis Dasar (Baseline)
            </h3>
            <span className="text-xs text-brand-slate">
              {experiment.dataEntries.length} entri tercatat
            </span>
          </div>

          <ResultsPanel experiment={experiment} />

          {/* Quick Data Logger Card (Mobile-First / Field Logger) */}
          <div className="bg-white rounded-3xl p-5 border border-brand-border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-4 h-4 text-brand-blue" />
                  Pencatatan Cepat Lapangan (Mobile Fast Entry)
                </h4>
                <p className="text-xs text-brand-slate">
                  Siap digunakan petugas jaga, relawan RT, atau pemantau dari ponsel.
                </p>
              </div>
              <span className="text-xs text-brand-green bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                Sinkron Otomatis (Offline-Ready)
              </span>
            </div>

            <form onSubmit={handleQuickSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-brand-navy mb-1">
                    Pilih Metrik:
                  </label>
                  <select
                    value={selectedMetricId}
                    onChange={(e) => setSelectedMetricId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-brand-border bg-brand-surface text-brand-navy font-medium outline-none"
                  >
                    {experiment.metrics.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-brand-navy mb-1">
                    Nilai Terukur ({currentMetric.unit}):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={`Contoh: ${currentMetric.baselineValue}`}
                    value={entryValue}
                    onChange={(e) => setEntryValue(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-brand-border font-mono text-brand-navy outline-none"
                    required
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-brand-navy mb-1">
                    Catatan Kondisi / Waktu:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Jam 07.15 cerah"
                    value={entryNotes}
                    onChange={(e) => setEntryNotes(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-brand-border text-brand-navy outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="text-xs text-brand-slate flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-slate-400" />
                  <span>Foto bukti & cap waktu otomatis disematkan</span>
                </div>
                <button
                  type="submit"
                  disabled={entryValue === ''}
                  className="px-5 py-2 bg-brand-blue hover:bg-brand-blue-dark disabled:bg-slate-300 text-white rounded-full text-xs font-bold transition-all shadow-card flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Simpan Entri Data
                </button>
              </div>
            </form>
          </div>

          {/* Field entry history, newest first, with independent verification */}
          <div className="bg-white rounded-3xl p-5 border border-brand-border shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                Riwayat Entri Data Lapangan
              </h4>
              <span className="text-xs text-brand-slate">
                {experiment.dataEntries.filter((e) => !e.verifiedBy).length} menunggu verifikasi
              </span>
            </div>

            {experiment.dataEntries.length === 0 ? (
              <p className="py-6 text-center text-sm text-brand-slate">
                Belum ada entri. Catat data pertama lewat formulir di atas.
              </p>
            ) : (
              <>
                <ul className="divide-y divide-brand-border">
                  {[...experiment.dataEntries]
                    .sort((x, y) => y.recordedAt.localeCompare(x.recordedAt))
                    .slice(0, showAllEntries ? undefined : 6)
                    .map((entry) => (
                      <li key={entry.id} className="py-3 flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-0.5">
                          <div className="text-sm font-bold text-brand-navy">
                            {entry.metricName}:{' '}
                            <span className="font-mono">
                              {entry.value} {entry.unit}
                            </span>
                            <span className="text-xs font-normal text-brand-slate"> · Hari ke-{entry.dayNumber}</span>
                          </div>
                          {entry.notes && <p className="text-xs text-brand-slate break-words">{entry.notes}</p>}
                          <p className="text-xs text-brand-slate">
                            Dicatat {entry.recordedBy} ·{' '}
                            {new Date(entry.recordedAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                          </p>
                        </div>
                        {entry.verifiedBy ? (
                          <span className="shrink-0 text-xs font-semibold text-brand-green bg-brand-mint px-2.5 py-1 rounded-full">
                            Terverifikasi · {entry.verifiedBy}
                          </span>
                        ) : canVerify && entry.recordedBy !== currentUser.name ? (
                          <button type="button"
                            onClick={() => verifyDataEntry(experiment.id, entry.id)}
                            className="shrink-0 px-3 py-1.5 bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-bold rounded-lg"
                          >
                            Verifikasi
                          </button>
                        ) : (
                          <span className="shrink-0 text-xs text-brand-slate bg-brand-surface px-2.5 py-1 rounded-full">
                            {canVerify ? 'Menunggu pihak lain' : 'Belum diverifikasi'}
                          </span>
                        )}
                      </li>
                    ))}
                </ul>
                {experiment.dataEntries.length > 6 && (
                  <button type="button"
                    onClick={() => setShowAllEntries((v) => !v)}
                    className="text-xs font-bold text-brand-blue hover:text-brand-blue-dark"
                  >
                    {showAllEntries ? 'Tampilkan lebih sedikit' : `Tampilkan semua (${experiment.dataEntries.length})`}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Column 3: Stop-Rule Guardrails & Verification Stream */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-brand-border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-green" />
                Status Aturan Berhenti (Guardrails)
              </h4>
              <span className="text-xs font-bold text-brand-green bg-emerald-50 px-2 py-0.5 rounded-full">
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
                      : 'bg-brand-surface border-brand-border text-brand-navy'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                        sr.triggered ? 'bg-status-stopped animate-ping' : 'bg-brand-green'
                      }`}
                    />
                    <div>
                      <div className="font-semibold">{sr.conditionDescription}</div>
                      <div className="text-xs text-brand-slate mt-0.5">
                        {(() => {
                          const st = analysis.stop.find((x) => x.ruleId === sr.id);
                          if (sr.triggered) return `TERPICU${sr.triggerReason ? `: ${sr.triggerReason}` : ''}`;
                          if (!sr.trigger) return 'Aturan manual: dinilai orang, tidak dipantau otomatis';
                          return `Dipantau otomatis · rentetan pelanggaran ${st?.currentStreak ?? 0}/${st?.required ?? 1}`;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs text-brand-navy leading-relaxed">
              <span className="font-bold">Komitmen Bersama:</span> Jika salah satu dari aturan berhenti di atas
              terpenuhi, setiap pihak berhak menekan tombol &ldquo;Hentikan Sekarang&rdquo; tanpa perlu voting ulang.
            </div>
          </div>

          {/* Quorum Approval Status */}
          <div className="bg-white rounded-3xl p-5 border border-brand-border shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                Kesepakatan Desain & Kuorum
              </h4>
              <span className="text-xs font-bold text-brand-blue">
                {quorum ? `${quorum.agree} dari ${quorum.required} suara setuju dibutuhkan` : `${approvedCount} Disetujui`}
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {experiment.approvals.map((app) => (
                <div
                  key={app.id}
                  className="p-2.5 bg-brand-surface rounded-xl border border-brand-border text-xs"
                >
                  <div className="flex items-center justify-between font-semibold text-brand-navy">
                    <span>{app.userName}</span>
                    <span
                      className={`text-xs ${
                        app.stance === 'setuju'
                          ? 'text-brand-green'
                          : app.stance === 'setuju_dengan_catatan'
                          ? 'text-status-warning'
                          : 'text-status-stopped'
                      }`}
                    >
                      {app.stance === 'setuju'
                        ? 'Setuju'
                        : app.stance === 'setuju_dengan_catatan'
                        ? 'Setuju Catatan'
                        : 'Keberatan'}
                    </span>
                  </div>
                  {app.note && <p className="text-brand-slate mt-0.5 text-xs">{app.note}</p>}
                </div>
              ))}
            </div>

            {!userHasApproved && (
              <button type="button"
                onClick={() => setShowApprovalModal(true)}
                className="w-full py-2 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl text-xs font-bold transition-all shadow-sm"
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
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-status-stopped flex items-center justify-center">
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
              <label className="block text-xs font-semibold text-brand-navy mb-1">
                Alasan Penghentian (Wajib Diisi):
              </label>
              <textarea
                rows={3}
                value={stopReason}
                onChange={(e) => setStopReason(e.target.value)}
                placeholder="Contoh: Terjadi 1 kali ambulans kesulitan bermanuver di tikungan B-08..."
                className="w-full text-xs p-3 rounded-xl border border-red-200 focus:ring-2 focus:ring-status-stopped outline-none text-brand-navy"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowStopModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-brand-navy text-xs font-semibold rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!stopReason.trim()}
                onClick={handleStopTrial}
                className="px-5 py-2 bg-status-stopped hover:bg-red-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-md"
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-brand-border space-y-4">
            <h3 className="text-base font-bold text-brand-navy">
              Beri Persetujuan Desain Percobaan
            </h3>
            <p className="text-xs text-brand-slate">
              Sebelum percobaan dimulai, setiap pihak menyepakati cara menilai dan berkomitmen menghormati hasil akhir.
            </p>

            <div className="space-y-2">
              {[
                { val: 'setuju', label: 'Setuju Sepenuhnya', color: 'text-brand-green' },
                { val: 'setuju_dengan_catatan', label: 'Setuju dengan Catatan', color: 'text-status-warning' },
                { val: 'keberatan', label: 'Keberatan (Wajib Usul Perubahan)', color: 'text-status-stopped' },
              ].map((opt) => (
                <label
                  key={opt.val}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                    approvalStance === opt.val
                      ? 'border-brand-blue bg-blue-50/50'
                      : 'border-brand-border bg-brand-surface'
                  }`}
                >
                  <input
                    type="radio"
                    name="stance"
                    checked={approvalStance === opt.val}
                    onChange={() => setApprovalStance(opt.val as any)}
                    className="text-brand-blue"
                  />
                  <span className={opt.color}>{opt.label}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-navy mb-1">
                Catatan Tambahan (Opsional):
              </label>
              <textarea
                rows={2}
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                placeholder="Tuliskan catatan khusus atau syarat pendukung..."
                className="w-full text-xs p-2.5 rounded-xl border border-brand-border outline-none"
              />
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900">
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
                className="px-5 py-2 bg-brand-green hover:bg-[#258768] text-white text-xs font-bold rounded-full shadow-card"
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
