/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Issue, CommentKind } from '../../types';
import { FeasibilityGateModal } from '../feasibility/FeasibilityGateModal';
import { ExperimentWizardModal } from '../wizard/ExperimentWizardModal';
import { ExperimentDashboard } from '../experiment/ExperimentDashboard';
import { EvaluationView } from '../evaluation/EvaluationView';
import { DecisionModal } from '../decision/DecisionModal';
import {
  HelpCircle,
  ShieldCheck,
  Sparkles,
  Play,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Send,
  Plus,
  Users,
  Compass,
  ArrowRight,
  Sliders,
  Scale,
  FileCheck2,
} from 'lucide-react';

interface IssueDetailProps {
  issue: Issue;
  onBack?: () => void;
}

export const IssueDetail: React.FC<IssueDetailProps> = ({ issue, onBack }) => {
  const {
    currentUser,
    addClaim,
    addComment,
    currentExperiment,
    setActiveTab,
  } = useApp();

  // Modal and view controllers
  const [showFeasibilityModal, setShowFeasibilityModal] = useState<boolean>(false);
  const [showWizardModal, setShowWizardModal] = useState<boolean>(false);
  const [showDecisionModal, setShowDecisionModal] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'isu' | 'percobaan' | 'evaluasi'>('isu');

  // New claim form
  const [showClaimForm, setShowClaimForm] = useState<boolean>(false);
  const [claimStatement, setClaimStatement] = useState<string>('');
  const [claimEvidence, setClaimEvidence] = useState<string>('');
  const [claimConfidence, setClaimConfidence] = useState<number>(75);
  const [claimStance, setClaimStance] = useState<'pro' | 'kontra' | 'netral'>('pro');

  // Comment input
  const [commentBody, setCommentBody] = useState<string>('');
  const [commentKind, setCommentKind] = useState<CommentKind>('fakta');

  // 9 stages definition
  const STAGES = [
    { id: 'isu_dibuka', num: 1, label: 'Isu Dibuka' },
    { id: 'dugaan_terkumpul', num: 2, label: 'Dugaan & Bukti' },
    { id: 'pengecekan_kelayakan', num: 3, label: 'Gerbang Kelayakan' },
    { id: 'desain_percobaan', num: 4, label: 'Desain Percobaan' },
    { id: 'menunggu_persetujuan', num: 5, label: 'Kesepakatan Desain' },
    { id: 'percobaan_berjalan', num: 6, label: 'Pelaksanaan (14 Hari)' },
    { id: 'evaluasi_hasil', num: 7, label: 'Evaluasi Hasil' },
    { id: 'keputusan_tercatat', num: 8, label: 'Keputusan Resmi' },
    { id: 'tinjauan_lanjutan', num: 9, label: 'Tinjauan Lanjutan' },
  ];

  const getStageIndex = (status: string) => {
    switch (status) {
      case 'isu_dibuka':
        return 0;
      case 'dugaan_terkumpul':
        return 1;
      case 'pengecekan_kelayakan':
        return 2;
      case 'desain_percobaan':
        return 3;
      case 'menunggu_persetujuan':
        return 4;
      case 'percobaan_berjalan':
        return 5;
      case 'evaluasi_hasil':
        return 6;
      case 'keputusan_tercatat':
        return 7;
      default:
        return 5;
    }
  };

  const currentStageIndex = getStageIndex(issue.status);

  const handleAddClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimStatement.trim() || !claimEvidence.trim()) return;
    addClaim(issue.id, claimStatement, claimEvidence, claimConfidence, claimStance);
    setClaimStatement('');
    setClaimEvidence('');
    setShowClaimForm(false);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    addComment(issue.id, commentBody, commentKind);
    setCommentBody('');
  };

  const valueCommentsCount = issue.comments.filter((c) => c.kind === 'nilai').length;
  const valueRatio = issue.comments.length > 0 ? Math.round((valueCommentsCount / issue.comments.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 9-Stage Progress Stepper Bar */}
      <div className="bg-white rounded-3xl p-4 md:p-6 border border-[#E2E8F0] shadow-sm overflow-x-auto">
        <div className="flex items-center min-w-[760px] justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#E2E8F0] -translate-y-1/2 z-0" />
          {STAGES.map((stg, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <div key={stg.id} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-[#2FA882] text-white shadow-sm'
                      : isCurrent
                      ? 'bg-[#2272E8] text-white ring-4 ring-[#2272E8]/20 shadow-md'
                      : 'bg-white text-[#5B6780] border border-[#E2E8F0]'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : stg.num}
                </div>
                <span
                  className={`text-[10px] whitespace-nowrap mt-1.5 font-medium ${
                    isCurrent ? 'text-[#153A73] font-bold' : 'text-[#5B6780]'
                  }`}
                >
                  {stg.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* View Switcher Tabs (Detail Isu vs Percobaan Berjalan vs Evaluasi) */}
      {currentExperiment && (
        <div className="flex items-center gap-2 p-1 bg-[#E2E8F0]/50 rounded-2xl w-fit">
          <button
            onClick={() => setViewMode('isu')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              viewMode === 'isu' ? 'bg-white text-[#153A73] shadow-sm' : 'text-[#5B6780] hover:text-[#153A73]'
            }`}
          >
            Pertanyaan & Dugaan
          </button>
          <button
            onClick={() => setViewMode('percobaan')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              viewMode === 'percobaan'
                ? 'bg-white text-[#2272E8] shadow-sm'
                : 'text-[#5B6780] hover:text-[#153A73]'
            }`}
          >
            Dasbor Percobaan ({currentExperiment.status.replace('_', ' ')})
          </button>
          <button
            onClick={() => setViewMode('evaluasi')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              viewMode === 'evaluasi'
                ? 'bg-white text-[#2FA882] shadow-sm'
                : 'text-[#5B6780] hover:text-[#153A73]'
            }`}
          >
            Hasil & Evaluasi
          </button>
        </div>
      )}

      {/* Render Active View Mode */}
      {viewMode === 'percobaan' && currentExperiment ? (
        <ExperimentDashboard
          experiment={currentExperiment}
          issue={issue}
          onOpenEvaluation={() => setViewMode('evaluasi')}
          onOpenDecision={() => setShowDecisionModal(true)}
        />
      ) : viewMode === 'evaluasi' && currentExperiment ? (
        <EvaluationView
          experiment={currentExperiment}
          issue={issue}
          onProceedToDecision={() => setShowDecisionModal(true)}
          onBackToDashboard={() => setViewMode('percobaan')}
        />
      ) : (
        /* Default: Stage 1 to 3 View (Issue, Claims, Feasibility) */
        <div className="space-y-6">
          {/* Issue Header Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E2E8F0] shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 text-xs text-[#5B6780]">
                  <span>{issue.spaceName}</span>
                  <span>·</span>
                  <span>Diajukan oleh {issue.authorName}</span>
                  <span>·</span>
                  <span>{new Date(issue.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
                <h1 className="text-xl md:text-2xl font-extrabold text-[#153A73] leading-snug">
                  {issue.title}
                </h1>
                <p className="text-xs md:text-sm text-[#5B6780] leading-relaxed">
                  {issue.context}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#153A73]">
                  <span className="font-semibold">Lokasi:</span>
                  <span className="bg-[#F5F8FC] px-2.5 py-1 rounded-lg border border-[#E2E8F0]">
                    {issue.location}
                  </span>
                  <span className="font-semibold ml-2">Pihak Terdampak:</span>
                  {issue.affectedParties.map((p, i) => (
                    <span
                      key={i}
                      className="bg-[#F5F8FC] px-2.5 py-1 rounded-lg border border-[#E2E8F0] text-[11px]"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons for Next Stages */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                <button
                  onClick={() => setShowFeasibilityModal(true)}
                  className="px-4 py-2.5 bg-white hover:bg-[#F5F8FC] text-[#2272E8] border border-[#2272E8] rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {issue.feasibilityOutcome ? 'Status Kelayakan' : 'Gerbang Kelayakan'}
                </button>

                {issue.feasibilityOutcome?.status !== 'tidak_layak' && (
                  <button
                    onClick={() => {
                      if (currentExperiment) {
                        setViewMode('percobaan');
                      } else {
                        setShowWizardModal(true);
                      }
                    }}
                    className="px-4 py-2.5 bg-[#2272E8] hover:bg-[#1A58B8] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    {currentExperiment ? (
                      <>
                        <Play className="w-4 h-4" /> Buka Dasbor Percobaan
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Susun Percobaan (Wizard)
                      </>
                    )}
                  </button>
                )}

                {issue.decision && (
                  <button
                    onClick={() => setShowDecisionModal(true)}
                    className="px-4 py-2.5 bg-[#2FA882] hover:bg-[#258768] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <FileCheck2 className="w-4 h-4" /> Catatan Keputusan
                  </button>
                )}
              </div>
            </div>

            {/* Feasibility Result Indicator Banner */}
            {issue.feasibilityOutcome && (
              <div
                className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                  issue.feasibilityOutcome.status === 'tidak_layak'
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : issue.feasibilityOutcome.status === 'layak_dengan_syarat'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="space-y-0.5 flex-1">
                  <div className="font-bold uppercase tracking-wider text-[11px]">
                    Hasil Gerbang Kelayakan: {issue.feasibilityOutcome.status.replace(/_/g, ' ')}
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {issue.feasibilityOutcome.conditionNote ||
                      'Memenuhi seluruh syarat faktual, keselamatan, dan reversibilitas.'}
                  </p>
                  <div className="text-[10px] text-slate-500 font-mono pt-1">
                    Ditinjau oleh: {issue.feasibilityOutcome.reviewedBy}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dual Claims Section (Dugaan & Bukti Pengubah Pendapat) */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E2E8F0] shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#153A73] flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#2272E8]" />
                  Dugaan Berbeda & Bukti Pengubah Pendapat
                </h2>
                <p className="text-xs text-[#5B6780]">
                  Alih-alih berdebat tanpa batas, tiap pihak menyatakan dugaannya dan bukti spesifik yang dapat mengubah pendiriannya.
                </p>
              </div>

              <button
                onClick={() => setShowClaimForm(!showClaimForm)}
                className="px-3.5 py-2 bg-[#F5F8FC] hover:bg-slate-200 text-[#153A73] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5 text-[#2272E8]" />
                {showClaimForm ? 'Tutup Formulir' : 'Beri Dugaan Anda'}
              </button>
            </div>

            {/* New Claim Input Form */}
            {showClaimForm && (
              <form
                onSubmit={handleAddClaim}
                className="p-5 bg-[#F5F8FC] rounded-2xl border border-[#E2E8F0] space-y-4"
              >
                <div className="text-xs font-bold text-[#153A73]">
                  Pernyataan Dugaan oleh {currentUser.displayName || currentUser.name} ({currentUser.unitLabel})
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#153A73] mb-1">
                      Sikap Pendirian:
                    </label>
                    <select
                      value={claimStance}
                      onChange={(e) => setClaimStance(e.target.value as any)}
                      className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] bg-white"
                    >
                      <option value="pro">Mendukung Perubahan (Pro)</option>
                      <option value="kontra">Menolak / Khawatir (Kontra)</option>
                      <option value="netral">Netral / Mengamati</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#153A73] mb-1">
                      Tingkat Keyakinan Awal: <span className="font-mono text-[#2272E8] font-bold">{claimConfidence}%</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={claimConfidence}
                      onChange={(e) => setClaimConfidence(Number(e.target.value))}
                      className="w-full accent-[#2272E8] cursor-pointer mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#153A73] mb-1">
                    Dugaan Anda (&ldquo;Jika X dilakukan, maka Y akan terjadi&rdquo;):
                  </label>
                  <textarea
                    rows={2}
                    value={claimStatement}
                    onChange={(e) => setClaimStatement(e.target.value)}
                    placeholder="Contoh: Jika parkir diatur miring 45 derajat, maka kapasitas slot bertambah..."
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E2E8F0] bg-white outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#153A73] mb-1">
                    Bukti Apa yang Dapat Mengubah Pikiran Anda? (Wajib):
                  </label>
                  <textarea
                    rows={2}
                    value={claimEvidence}
                    onChange={(e) => setClaimEvidence(e.target.value)}
                    placeholder="Contoh: Jika waktu tempuh rata-rata jam sibuk justru bertambah > 20% selama 14 hari..."
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E2E8F0] bg-white outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowClaimForm(false)}
                    className="px-3 py-1.5 text-xs text-[#5B6780]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#2272E8] text-white text-xs font-semibold rounded-xl"
                  >
                    Kirim Dugaan
                  </button>
                </div>
              </form>
            )}

            {/* Dual Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {issue.claims.map((claim) => (
                <div
                  key={claim.id}
                  className="p-5 rounded-2xl border border-[#E2E8F0] bg-[#F5F8FC] space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-[#153A73]">{claim.userName}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            claim.stance === 'pro'
                              ? 'text-[#2272E8]'
                              : claim.stance === 'kontra'
                              ? 'text-[#F59E0B]'
                              : 'text-slate-500'
                          }`}
                        >
                          Dugaan {claim.stance}
                        </span>
                        <span className="text-[10px] text-[#5B6780]">· {claim.userUnit}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#5B6780] block">Keyakinan Awal</span>
                      <span className="text-xs font-mono font-bold text-[#153A73]">
                        {claim.initialConfidence}%
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-xs text-[#153A73] leading-relaxed font-medium">
                    &ldquo;{claim.statement}&rdquo;
                  </div>

                  <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-100 text-xs text-[#153A73]">
                    <div className="font-semibold text-[#2272E8] text-[11px] mb-1">
                      Bukti yang Dapat Mengubah Pikiran Saya:
                    </div>
                    <p className="italic text-[#5B6780]">{claim.mindChangingEvidence}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Position Summary & Common Ground (Titik Temu) */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-1.5">
              <div className="text-xs font-bold text-[#2FA882] flex items-center gap-1.5 uppercase tracking-wider">
                <Compass className="w-4 h-4" /> Ringkasan Posisi & Titik Temu Bersama
              </div>
              <p className="text-xs text-[#153A73] leading-relaxed">
                Kedua belah pihak sama-sama menginginkan kelancaran jalan saat jam sibuk dan sepakat bahwa akses kendaraan darurat tidak boleh terganggu. Titik temu ini menjadi dasar perancangan metrik keberhasilan percobaan 14 hari.
              </p>
            </div>
          </div>

          {/* Categorized Comment Stream (Fakta, Dugaan, Nilai, Pertanyaan) */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E2E8F0] shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-[#153A73] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#2272E8]" />
                  Diskusi Berpenanda Jenis (Fakta vs Dugaan vs Nilai)
                </h3>
                <p className="text-xs text-[#5B6780]">
                  Penanda jenis membantu Gerbang Kelayakan mendeteksi apakah diskusi berputar pada data atau konflik nilai.
                </p>
              </div>

              {valueRatio > 25 && (
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  Perhatian: {valueRatio}% komentar bernada nilai
                </span>
              )}
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {issue.comments.map((cm) => (
                <div
                  key={cm.id}
                  className="p-3.5 bg-[#F5F8FC] rounded-2xl border border-[#E2E8F0] space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-[#153A73]">
                      <span>{cm.userName}</span>
                      <span className="text-[10px] text-[#5B6780]">({cm.userUnit})</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          cm.kind === 'fakta'
                            ? 'bg-blue-100 text-[#2272E8]'
                            : cm.kind === 'dugaan'
                            ? 'bg-purple-100 text-purple-700'
                            : cm.kind === 'nilai'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-[#2FA882]'
                        }`}
                      >
                        {cm.kind}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(cm.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[#153A73] leading-relaxed">{cm.body}</p>
                </div>
              ))}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="pt-2 space-y-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-[11px] font-semibold text-[#5B6780]">Jenis Komentar:</span>
                {(['fakta', 'dugaan', 'nilai', 'pertanyaan'] as CommentKind[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setCommentKind(k)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                      commentKind === k
                        ? 'bg-[#153A73] text-white shadow-sm'
                        : 'bg-[#F5F8FC] text-[#5B6780] hover:bg-slate-200'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Tulis masukan berjenis ${commentKind.toUpperCase()}...`}
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  className="flex-1 text-xs p-2.5 rounded-xl border border-[#E2E8F0] bg-white outline-none focus:ring-2 focus:ring-[#2272E8]"
                />
                <button
                  type="submit"
                  disabled={!commentBody.trim()}
                  className="px-4 py-2.5 bg-[#2272E8] hover:bg-[#1A58B8] disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Kirim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      {showFeasibilityModal && (
        <FeasibilityGateModal issue={issue} onClose={() => setShowFeasibilityModal(false)} />
      )}
      {showWizardModal && (
        <ExperimentWizardModal issue={issue} onClose={() => setShowWizardModal(false)} />
      )}
      {showDecisionModal && currentExperiment && (
        <DecisionModal
          experiment={currentExperiment}
          issue={issue}
          onClose={() => setShowDecisionModal(false)}
        />
      )}
    </div>
  );
};
