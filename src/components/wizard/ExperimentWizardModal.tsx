/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Issue, Metric, BudgetItem, StopRule } from '../../types';
import {
  Sparkles,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Calendar,
  X,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface ExperimentWizardModalProps {
  issue: Issue;
  onClose: () => void;
}

export const ExperimentWizardModal: React.FC<ExperimentWizardModalProps> = ({
  issue,
  onClose,
}) => {
  const { createExperimentForIssue, currentSpace, currentUser } = useApp();

  const [step, setStep] = useState<number>(1);

  // Form State
  const [treatment, setTreatment] = useState(
    'Marka parkir miring 45 derajat menggunakan cat kapur sementara (chalk spray) dan 12 kerucut lalu lintas oranye'
  );
  const [scope, setScope] = useState(issue.location || 'Lorong B (depan rumah B-01 s/d B-22)');
  const [durationDays, setDurationDays] = useState<number>(14);
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );

  // Metrics
  const [metrics, setMetrics] = useState<Metric[]>([
    {
      id: 'm-1',
      name: 'Waktu tempuh kendaraan jam sibuk (06.30 - 08.00)',
      unit: 'menit',
      method: 'Pengukuran stopwatch dari ujung B-01 ke B-22',
      frequency: 'Harian (hari kerja)',
      responsibleRole: 'Relawan Warga & Dr. Agus',
      baselineValue: 4.2,
      thresholdValue: 3.5,
      direction: 'turun_lebih_baik',
      type: 'durasi',
    },
    {
      id: 'm-2',
      name: 'Jumlah slot mobil tertampung rapi',
      unit: 'slot',
      method: 'Pencatatan visual malam hari pukul 19.30',
      frequency: 'Harian',
      responsibleRole: 'Petugas Jaga Malam',
      baselineValue: 14,
      thresholdValue: 20,
      direction: 'naik_lebih_baik',
      type: 'hitungan',
    },
  ]);

  // Budget
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    {
      id: 'b-1',
      label: '12 Kerucut Lalu Lintas (Traffic Cone 70cm)',
      amount: 720000,
      fundingSource: 'Kas Warga RT',
      isApproved: true,
    },
    {
      id: 'b-2',
      label: 'Cat Kapur Semprot Sementara (6 Kaleng)',
      amount: 360000,
      fundingSource: 'Iuran Pengusul & Donatur',
      isApproved: true,
    },
  ]);

  // Stop rules
  const [stopRules, setStopRules] = useState<StopRule[]>([
    {
      id: 'sr-1',
      conditionDescription: 'Satu insiden kendaraan darurat (ambulans/damkar) terhalang melintas',
      severity: 'kritis_henti',
      notifyRoles: ['pengurus', 'fasilitator', 'pengelola_kawasan'],
      triggered: false,
    },
    {
      id: 'sr-2',
      conditionDescription: 'Terjadi senggolan kendaraan atau cedera fisik akibat manuver parkir',
      severity: 'kritis_henti',
      notifyRoles: ['pengurus', 'pengusul'],
      triggered: false,
    },
    {
      id: 'sr-3',
      conditionDescription: 'Lebih dari 40% responden survei tengah masa menyatakan sangat terganggu',
      severity: 'kritis_henti',
      notifyRoles: ['pengurus', 'fasilitator'],
      triggered: false,
    },
  ]);

  const [decisionRule, setDecisionRule] = useState<string>(
    'Adopsi permanen bila: Waktu tempuh membaik minimal 15% (turun dari garis dasar 4.2 menit ke ≤ 3.5 menit) DAN jumlah keluhan warga tidak naik lebih dari 10% dibanding garis dasar.'
  );

  // New metric draft
  const [newMetricName, setNewMetricName] = useState('');
  const [newMetricBaseline, setNewMetricBaseline] = useState<number>(0);
  const [newMetricThreshold, setNewMetricThreshold] = useState<number>(0);
  const [newMetricUnit, setNewMetricUnit] = useState('');

  // Add metric helper
  const handleAddMetric = () => {
    if (!newMetricName.trim()) return;
    const item: Metric = {
      id: `m-${Date.now()}`,
      name: newMetricName,
      unit: newMetricUnit || 'satuan',
      method: 'Pencatatan lapangan terjadwal',
      frequency: 'Harian',
      responsibleRole: 'Pencatat Ditunjuk',
      baselineValue: newMetricBaseline,
      thresholdValue: newMetricThreshold,
      direction: 'naik_lebih_baik',
      type: 'hitungan',
    };
    setMetrics((prev) => [...prev, item]);
    setNewMetricName('');
    setNewMetricUnit('');
    setNewMetricBaseline(0);
    setNewMetricThreshold(0);
  };

  // Add budget helper
  const [newBudgetLabel, setNewBudgetLabel] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState<number>(0);
  const handleAddBudget = () => {
    if (!newBudgetLabel.trim() || newBudgetAmount <= 0) return;
    setBudgetItems((prev) => [
      ...prev,
      {
        id: `b-${Date.now()}`,
        label: newBudgetLabel,
        amount: newBudgetAmount,
        fundingSource: 'Kas Warga',
        isApproved: true,
      },
    ]);
    setNewBudgetLabel('');
    setNewBudgetAmount(0);
  };

  // Add stop rule helper
  const [newStopRuleDesc, setNewStopRuleDesc] = useState('');
  const handleAddStopRule = () => {
    if (!newStopRuleDesc.trim()) return;
    setStopRules((prev) => [
      ...prev,
      {
        id: `sr-${Date.now()}`,
        conditionDescription: newStopRuleDesc,
        severity: 'kritis_henti',
        notifyRoles: ['pengurus', 'fasilitator'],
        triggered: false,
      },
    ]);
    setNewStopRuleDesc('');
  };

  const totalBudget = budgetItems.reduce((acc, curr) => acc + curr.amount, 0);
  const isBudgetOverCeiling = totalBudget > currentSpace.rules.budgetCeilingWithoutBoard;

  // Quality checks
  const qualityIssues: string[] = [];
  if (metrics.length === 0) qualityIssues.push('Belum ada metrik ukuran hasil.');
  if (metrics.some((m) => m.baselineValue === undefined))
    qualityIssues.push('Setiap metrik wajib memiliki nilai garis dasar (baseline) sebelum uji coba.');
  if (stopRules.length === 0)
    qualityIssues.push('Wajib menentukan minimal 1 aturan berhenti darurat (guardrail).');
  if (!decisionRule.trim())
    qualityIssues.push('Aturan keputusan akhir wajib disepakati di muka sebelum percobaan berjalan.');

  const handleSaveAndSubmit = () => {
    createExperimentForIssue(issue.id, {
      treatment,
      scope,
      durationDays,
      startDate,
      endDate,
      metrics,
      budget: budgetItems,
      stopRules,
      decisionRule,
      evaluationDate: new Date(new Date(endDate).getTime() + 86400000).toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl border border-brand-border my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-brand-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-brand-navy">Pembangun Percobaan (Wizard)</h2>
              <p className="text-xs text-brand-slate">
                Rancang eksperimen terbatas 14 hari dengan metrik terukur dan aturan keselamatan.
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

        {/* Step Indicator */}
        <div className="grid grid-cols-5 gap-2 py-3 border-b border-brand-border text-xs font-semibold shrink-0">
          {[
            { n: 1, label: '1. Perlakuan' },
            { n: 2, label: '2. Ukuran Metrik' },
            { n: 3, label: '3. Anggaran' },
            { n: 4, label: '4. Aturan Berhenti' },
            { n: 5, label: '5. Aturan Keputusan' },
          ].map((s) => (
            <button
              key={s.n}
              onClick={() => setStep(s.n)}
              className={`py-1.5 text-center rounded-lg transition-colors truncate px-1 ${
                step === s.n
                  ? 'bg-brand-blue text-white'
                  : step > s.n
                  ? 'bg-brand-green/10 text-brand-green'
                  : 'bg-brand-surface text-brand-slate'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Wizard Steps */}
        <div className="py-5 overflow-y-auto flex-1 space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-navy mb-1">
                  Satu Perlakuan Utama yang Diubah:
                </label>
                <p className="text-xs text-brand-slate mb-2">
                  Aturan metodologis: Hanya boleh satu perubahan variabel per percobaan agar hasil jelas disebabkan oleh apa.
                </p>
                <textarea
                  rows={3}
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue outline-none text-brand-navy"
                  placeholder="Deskripsikan perlakuan fisik/kebijakan sementara secara spesifik..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-navy mb-1">
                    Ruang Lingkup (Lokasi & Pihak):
                  </label>
                  <input
                    type="text"
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-brand-border text-brand-navy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-navy mb-1">
                    Durasi Percobaan (Maks {currentSpace.rules.maxExperimentDays} Hari):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={7}
                      max={currentSpace.rules.maxExperimentDays}
                      value={durationDays}
                      onChange={(e) => setDurationDays(Number(e.target.value))}
                      className="w-24 text-xs p-2.5 rounded-xl border border-brand-border font-mono text-brand-navy"
                    />
                    <span className="text-xs text-brand-slate">Hari Kalender (Default: 14 hari)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-navy mb-1">
                    Tanggal Mulai:
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-brand-border font-mono text-brand-navy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-navy mb-1">
                    Tanggal Selesai:
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-brand-border font-mono text-brand-navy"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-brand-navy">Ukuran Hasil (Metrik)</h3>
                  <p className="text-xs text-brand-slate">
                    Tiap metrik wajib memiliki garis dasar (kondisi sebelum uji) dan ambang batas yang disepakati.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {metrics.map((m, idx) => (
                  <div
                    key={m.id}
                    className="p-3.5 bg-brand-surface rounded-2xl border border-brand-border flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="font-semibold text-xs text-brand-navy">
                        {idx + 1}. {m.name} ({m.unit})
                      </div>
                      <button
                        onClick={() => setMetrics((prev) => prev.filter((item) => item.id !== m.id))}
                        className="text-slate-400 hover:text-status-stopped"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-brand-slate">
                      <div>
                        <span className="block font-medium">Garis Dasar:</span>
                        <span className="font-mono text-brand-navy font-bold">
                          {m.baselineValue} {m.unit}
                        </span>
                      </div>
                      <div>
                        <span className="block font-medium">Ambang Target:</span>
                        <span className="font-mono text-brand-green font-bold">
                          {m.thresholdValue} {m.unit}
                        </span>
                      </div>
                      <div>
                        <span className="block font-medium">Arah:</span>
                        <span>{m.direction === 'turun_lebih_baik' ? 'Turun lebih baik' : 'Naik lebih baik'}</span>
                      </div>
                      <div>
                        <span className="block font-medium">Frekuensi:</span>
                        <span>{m.frequency}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Metric Form */}
              <div className="border border-dashed border-brand-border p-4 rounded-3xl bg-white space-y-3">
                <div className="text-xs font-bold text-brand-navy flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-brand-blue" /> Tambah Ukuran Hasil Baru
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nama metrik (contoh: Jumlah antrean mobil)"
                    value={newMetricName}
                    onChange={(e) => setNewMetricName(e.target.value)}
                    className="text-xs p-2 rounded-xl border border-brand-border"
                  />
                  <input
                    type="text"
                    placeholder="Satuan (mobil, menit, skor 1-5)"
                    value={newMetricUnit}
                    onChange={(e) => setNewMetricUnit(e.target.value)}
                    className="text-xs p-2 rounded-xl border border-brand-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Nilai Garis Dasar (baseline)"
                    value={newMetricBaseline || ''}
                    onChange={(e) => setNewMetricBaseline(Number(e.target.value))}
                    className="text-xs p-2 rounded-xl border border-brand-border font-mono"
                  />
                  <input
                    type="number"
                    placeholder="Ambang Target Berhasil"
                    value={newMetricThreshold || ''}
                    onChange={(e) => setNewMetricThreshold(Number(e.target.value))}
                    className="text-xs p-2 rounded-xl border border-brand-border font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddMetric}
                  className="px-3 py-1.5 bg-brand-surface hover:bg-slate-200 text-brand-navy rounded-xl text-xs font-semibold transition-colors"
                >
                  Tambahkan ke Daftar Metrik
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-brand-navy">Rincian Anggaran Percobaan</h3>
                <p className="text-xs text-brand-slate">
                  Batas anggaran tanpa persetujuan pengurus ruang:{' '}
                  <span className="font-mono font-bold text-brand-navy">
                    Rp {currentSpace.rules.budgetCeilingWithoutBoard.toLocaleString('id-ID')}
                  </span>
                </p>
              </div>

              <div className="space-y-2">
                {budgetItems.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 bg-brand-surface rounded-xl border border-brand-border flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-brand-navy">{b.label}</div>
                      <div className="text-xs text-brand-slate">Sumber: {b.fundingSource}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-brand-navy">
                        Rp {b.amount.toLocaleString('id-ID')}
                      </span>
                      <button
                        onClick={() => setBudgetItems((prev) => prev.filter((item) => item.id !== b.id))}
                        className="text-slate-400 hover:text-status-stopped"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-white border border-brand-border rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-brand-navy">Total Anggaran:</span>
                <span
                  className={`font-mono font-bold text-sm ${
                    isBudgetOverCeiling ? 'text-status-stopped' : 'text-brand-green'
                  }`}
                >
                  Rp {totalBudget.toLocaleString('id-ID')}
                </span>
              </div>

              {isBudgetOverCeiling && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Total anggaran melampaui batas mandiri ruang (Rp{' '}
                    {currentSpace.rules.budgetCeilingWithoutBoard.toLocaleString('id-ID')}). Wajib persetujuan Pengurus RT.
                  </span>
                </div>
              )}

              {/* Add budget item */}
              <div className="border border-dashed border-brand-border p-3 rounded-2xl flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Kebutuhan (contoh: Banner edukasi)"
                  value={newBudgetLabel}
                  onChange={(e) => setNewBudgetLabel(e.target.value)}
                  className="text-xs p-2 rounded-xl border border-brand-border flex-1"
                />
                <input
                  type="number"
                  placeholder="Nominal (Rp)"
                  value={newBudgetAmount || ''}
                  onChange={(e) => setNewBudgetAmount(Number(e.target.value))}
                  className="text-xs p-2 rounded-xl border border-brand-border font-mono w-32"
                />
                <button
                  type="button"
                  onClick={handleAddBudget}
                  className="px-3 py-2 bg-brand-blue text-white rounded-full text-xs font-semibold shrink-0"
                >
                  Tambah
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-brand-navy">Aturan Berhenti Darurat (Guardrails)</h3>
                <p className="text-xs text-brand-slate">
                  Kondisi yang otomatis atau segera menghentikan percobaan untuk mencegah risiko bahaya atau kerugian.
                </p>
              </div>

              <div className="space-y-2">
                {stopRules.map((sr, idx) => (
                  <div
                    key={sr.id}
                    className="p-3 bg-red-50/50 border border-red-200 rounded-2xl flex items-start justify-between text-xs text-status-stopped"
                  >
                    <div className="flex items-start gap-2">
                      <span className="font-bold">{idx + 1}.</span>
                      <span className="font-medium text-brand-navy">{sr.conditionDescription}</span>
                    </div>
                    <button
                      onClick={() => setStopRules((prev) => prev.filter((item) => item.id !== sr.id))}
                      className="text-slate-400 hover:text-status-stopped ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add stop rule */}
              <div className="border border-dashed border-brand-border p-3 rounded-2xl flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Kondisi penghenti (contoh: 2 keluhan bau menyengat berturut-turut)..."
                  value={newStopRuleDesc}
                  onChange={(e) => setNewStopRuleDesc(e.target.value)}
                  className="text-xs p-2 rounded-xl border border-brand-border flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddStopRule}
                  className="px-3 py-2 bg-status-stopped text-white rounded-xl text-xs font-semibold shrink-0"
                >
                  Tambah Guardrail
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-brand-navy">Aturan Keputusan & Kriteria Adopsi</h3>
                <p className="text-xs text-brand-slate">
                  Kriteria tertulis di muka: Bagaimana data akan dibaca setelah 14 hari selesai.
                </p>
              </div>

              <div>
                <textarea
                  rows={3}
                  value={decisionRule}
                  onChange={(e) => setDecisionRule(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue outline-none text-brand-navy"
                  placeholder="Contoh: Adopsi bila metrik A membaik minimal 15% dan keluhan tidak bertambah..."
                />
              </div>

              {/* Quality Checker Box */}
              <div className="bg-brand-surface border border-brand-border rounded-2xl p-4">
                <div className="text-xs font-bold text-brand-navy flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-brand-green" /> Pemeriksa Kualitas Desain
                </div>
                {qualityIssues.length === 0 ? (
                  <div className="text-xs text-brand-green flex items-center gap-1.5 font-medium">
                    <CheckCircle className="w-4 h-4" /> Desain percobaan lengkap, terukur, dan memenuhi standar CobaSepakat!
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {qualityIssues.map((qi, i) => (
                      <li key={i} className="text-xs text-amber-700 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {qi}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-brand-border pt-4 flex items-center justify-between gap-3 shrink-0">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-2 bg-brand-surface hover:bg-slate-200 text-brand-navy text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Sebelumnya
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="px-5 py-2.5 bg-brand-navy hover:bg-brand-blue-dark text-white text-xs font-semibold rounded-full flex items-center gap-1.5 transition-colors"
              >
                Lanjutkan <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={qualityIssues.length > 0}
                onClick={handleSaveAndSubmit}
                className="px-6 py-2.5 bg-brand-green hover:bg-[#258768] disabled:bg-slate-300 text-white text-xs font-bold rounded-full shadow-card transition-all flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" /> Ajukan ke Kuorum Persetujuan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
