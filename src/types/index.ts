/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { DecisionRule, StopTrigger } from '../core/types';

export type UserRole =
  | 'anggota'
  | 'pengusul'
  | 'fasilitator'
  | 'pengurus'
  | 'pemantau_independen'
  | 'pengelola_kawasan'
  | 'admin_platform';

export interface User {
  id: string;
  name: string;
  displayName?: string;
  email: string;
  phone?: string;
  avatarUrl: string;
  unitLabel: string; // e.g. "Blok B-12"
  role: UserRole;
  isAnonymousDisplayName?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  type: 'kawasan' | 'koperasi' | 'ormawa' | 'komunitas';
  logoUrl?: string;
  plan: 'standar' | 'profesional' | 'enterprise';
}

export interface SpaceRules {
  quorumPercentage: number; // e.g. 70 (%)
  commentPeriodDays: number; // e.g. 7
  budgetCeilingWithoutBoard: number; // e.g. 2500000 (IDR)
  maxExperimentDays: number; // e.g. 30
}

export interface Space {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  unitCount: number;
  activeMemberCount: number;
  rules: SpaceRules;
}

export type IssueStatus =
  | 'isu_dibuka'
  | 'dugaan_terkumpul'
  | 'pengecekan_kelayakan'
  | 'desain_percobaan'
  | 'menunggu_persetujuan'
  | 'percobaan_berjalan'
  | 'evaluasi_hasil'
  | 'keputusan_tercatat'
  | 'dialihkan_ke_musyawarah';

export type CommentKind = 'fakta' | 'dugaan' | 'nilai' | 'pertanyaan';

export interface Comment {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userUnit?: string;
  kind: CommentKind;
  body: string;
  createdAt: string;
}

export interface Claim {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  userUnit?: string;
  stance: 'pro' | 'kontra' | 'netral';
  statement: string; // "Jika X dilakukan, maka Y akan terjadi"
  initialConfidence: number; // 0 - 100%
  postConfidence?: number; // 0 - 100% after evaluation
  mindChangingEvidence: string; // "Bukti apa yang dapat mengubah pikiran saya?"
  updatedAt: string;
}

export interface FeasibilityCheckItem {
  id: string;
  questionNumber: number;
  question: string;
  description: string;
  isAbsoluteBlocker?: boolean; // questions 2 & 3
  answer?: 'ya' | 'tidak' | 'belum_tahu';
  reason?: string;
}

export interface FeasibilityOutcome {
  status: 'layak' | 'layak_dengan_syarat' | 'tidak_layak';
  conditionNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  redirectSuggestion?: string;
}

export type MetricType = 'hitungan' | 'durasi' | 'skala_survei' | 'ya_tidak' | 'angka_bebas';

export interface Metric {
  id: string;
  name: string;
  unit: string;
  method: string;
  frequency: string;
  responsibleRole: string;
  baselineValue: number;
  thresholdValue: number;
  direction: 'naik_lebih_baik' | 'turun_lebih_baik' | 'rentang_tetap';
  type: MetricType;
  currentValue?: number;
}

export interface BudgetItem {
  id: string;
  label: string;
  amount: number;
  fundingSource: string;
  isApproved: boolean;
}

export interface StopRule {
  id: string;
  conditionDescription: string;
  metricTriggerId?: string;
  thresholdLimit?: number;
  /**
   * Pemicu otomatis dari data lapangan (dievaluasi oleh src/core/stopRules).
   * Tanpa trigger, aturan bersifat manual: dinilai orang lewat tombol "Hentikan Sekarang".
   */
  trigger?: StopTrigger;
  severity: 'waspada' | 'kritis_henti';
  notifyRoles: UserRole[];
  triggered: boolean;
  triggerReason?: string;
  triggeredAt?: string;
}

export interface Approval {
  id: string;
  userId: string;
  userName: string;
  userUnit: string;
  stance: 'setuju' | 'setuju_dengan_catatan' | 'keberatan';
  note?: string;
  commitmentSigned: boolean;
  signedAt: string;
}

export interface DataEntry {
  id: string;
  experimentId: string;
  metricId: string;
  metricName: string;
  unit: string;
  value: number;
  recordedBy: string;
  recordedAt: string;
  dayNumber: number;
  notes?: string;
  photoUrl?: string;
  verifiedBy?: string;
  flagged?: boolean;
}

export interface ExperimentEvent {
  id: string;
  experimentId: string;
  type: 'mulai' | 'catatan_fasilitator' | 'keluhan_warga' | 'inspeksi' | 'peringatan_aturan' | 'dihentikan' | 'selesai';
  title: string;
  description: string;
  occurredAt: string;
  authorName: string;
}

export type DecisionOutcome =
  | 'adopsi'
  | 'ubah_coba_lagi'
  | 'kembalikan_ke_semula'
  | 'naikkan_ke_musyawarah';

export interface Decision {
  id: string;
  experimentId: string;
  outcome: DecisionOutcome;
  title: string;
  reason: string;
  officialStatement: string;
  decidedBy: string;
  decidedAt: string;
  reviewDate1Month: string;
  reviewDate3Month: string;
  /**
   * Hasil evaluasi kriteria pada saat keputusan dicatat (dari src/core/results).
   * Dipakai untuk menilai keselarasan keputusan dengan data. Kosong untuk keputusan lama.
   */
  ruleVerdictAtDecision?: 'terpenuhi' | 'tidak_terpenuhi' | 'belum_dapat_disimpulkan';
  /** Hash entri buku besar yang mencatat keputusan ini (rantai tak bisa diubah diam-diam). */
  ledgerHash?: string;
}

export interface AcceptanceResponse {
  id: string;
  decisionId: string;
  userId: string;
  userName: string;
  stanceInitial: 'pro' | 'kontra' | 'netral';
  score: number; // 1 - 5
  acceptsOutcome: boolean;
  comment?: string;
  createdAt?: string;
}

export interface Experiment {
  id: string;
  issueId: string;
  version: number;
  status:
    | 'draf'
    | 'menunggu_persetujuan'
    | 'disepakati'
    | 'berjalan'
    | 'dihentikan'
    | 'evaluasi'
    | 'selesai';
  treatment: string; // What single change is tested
  scope: string; // Where and who
  startDate: string;
  endDate: string;
  durationDays: number;
  decisionRule: string; // Pre-agreed criteria for decision (teks untuk manusia)
  /** Kriteria terstruktur yang dievaluasi mesin. Bila kosong, diturunkan dari ambang metrik. */
  criteria?: DecisionRule;
  evaluationDate: string;
  metrics: Metric[];
  budget: BudgetItem[];
  stopRules: StopRule[];
  approvals: Approval[];
  dataEntries: DataEntry[];
  events: ExperimentEvent[];
  stoppedReason?: string;
  stoppedAt?: string;
}

export interface Issue {
  id: string;
  spaceId: string;
  spaceName: string;
  authorId: string;
  authorName: string;
  title: string; // Neutral decision question
  context: string;
  location: string;
  affectedParties: string[];
  status: IssueStatus;
  createdAt: string;
  attachmentUrl?: string;
  claims: Claim[];
  comments: Comment[];
  feasibilityChecks: FeasibilityCheckItem[];
  feasibilityOutcome?: FeasibilityOutcome;
  activeExperimentId?: string;
  decision?: Decision;
}

export interface TemplateBlueprint {
  id: string;
  title: string;
  category: 'parkir_lalin' | 'kebersihan' | 'fasilitas_bersama' | 'keamanan_jam_malam' | 'lingkungan';
  summary: string;
  sampleQuestion: string;
  recommendedDuration: number;
  recommendedMetrics: Omit<Metric, 'id'>[];
  recommendedStopRules: string[];
  recommendedDecisionRule: string;
}

export interface Facilitator {
  id: string;
  name: string;
  avatarUrl: string;
  title: string;
  specialization: string;
  rating: number;
  completedTrials: number;
  hourlyRate: string;
  bio: string;
  certifiedSince: string;
}

export interface AuditLog {
  id: string;
  /** Posisi dalam rantai hash (buku besar). */
  index?: number;
  hash?: string;
  prevHash?: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  target: string;
  details: string;
}
