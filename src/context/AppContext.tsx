/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type {
  User,
  Organization,
  Space,
  Issue,
  Experiment,
  Claim,
  Comment,
  DataEntry,
  FeasibilityOutcome,
  DecisionOutcome,
  TemplateBlueprint,
  Facilitator,
  AuditLog,
} from '../types';
import {
  SEED_ORGANIZATION,
  SEED_SPACES,
  SEED_USERS,
  INITIAL_ISSUES,
  INITIAL_EXPERIMENTS,
  SEED_TEMPLATES,
  SEED_FACILITATORS,
  INITIAL_AUDIT_LOGS,
} from '../data/seedData';
import { notify, type ToastTone } from '../lib/notify';

export type NavigationTab =
  | 'beranda'
  | 'isu'
  | 'percobaan'
  | 'pustaka'
  | 'templat'
  | 'analitik'
  | 'fasilitator'
  | 'audit';

interface AppContextType {
  currentUser: User;
  users: User[];
  setCurrentUser: (user: User) => void;
  organization: Organization;
  spaces: Space[];
  currentSpace: Space;
  setCurrentSpaceId: (id: string) => void;
  issues: Issue[];
  currentIssue: Issue | null;
  activeIssueId: string | null;
  setActiveIssueId: (id: string | null) => void;
  experiments: Record<string, Experiment>;
  currentExperiment: Experiment | null;
  templates: TemplateBlueprint[];
  facilitators: Facilitator[];
  auditLogs: AuditLog[];
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  appMode: 'company_profile' | 'demo';
  setAppMode: (mode: 'company_profile' | 'demo') => void;
  showMobileMenu: boolean;
  setShowMobileMenu: (show: boolean) => void;

  // Actions
  addIssue: (issueData: Partial<Issue>) => Issue;
  addClaim: (issueId: string, statement: string, mindChangingEvidence: string, initialConfidence: number, stance: 'pro' | 'kontra' | 'netral') => void;
  updateClaimConfidence: (issueId: string, claimId: string, confidence: number, isPost?: boolean) => void;
  addComment: (issueId: string, body: string, kind: 'fakta' | 'dugaan' | 'nilai' | 'pertanyaan') => void;
  updateFeasibilityItem: (issueId: string, questionNumber: number, answer: 'ya' | 'tidak' | 'belum_tahu', reason: string) => void;
  finalizeFeasibility: (issueId: string, outcome: FeasibilityOutcome) => void;
  createExperimentForIssue: (issueId: string, expData: Partial<Experiment>) => string;
  submitApproval: (experimentId: string, stance: 'setuju' | 'setuju_dengan_catatan' | 'keberatan', note?: string) => void;
  addDataEntry: (experimentId: string, metricId: string, value: number, notes?: string) => void;
  verifyDataEntry: (experimentId: string, entryId: string) => void;
  triggerEmergencyStop: (experimentId: string, reason: string) => void;
  recordDecision: (experimentId: string, outcome: DecisionOutcome, title: string, reason: string, statement: string) => void;
  submitAcceptanceRating: (decisionId: string, score: number, accepts: boolean, comment?: string) => void;
  applyTemplateToCreateIssue: (template: TemplateBlueprint) => string;
  resetAllData: () => void;
  requestFacilitator: (facilitatorName: string, pkg: string, note: string) => void;
}

const STORAGE_KEY = 'cobasepakat_state_v1';

// Storage can throw (private mode, quota) or hold stale/corrupt JSON; fall back to seed data.
function load<T>(key: string, fallback: T, valid: (v: unknown) => boolean): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (valid(parsed)) return parsed as T;
    }
  } catch { /* use fallback */ }
  return fallback;
}

function save(key: string, value: unknown) {
  try { localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(value)); } catch { /* ignore */ }
}

const isObject = (v: unknown) => typeof v === 'object' && v !== null && !Array.isArray(v);

// Hash routes: "#/" = company profile, "#/demo/<tab>[/<issueId>]" = workspace.
// Hash (not path) routing keeps this working on static hosts without rewrite rules.
const TABS: NavigationTab[] = ['beranda', 'isu', 'percobaan', 'pustaka', 'templat', 'analitik', 'fasilitator', 'audit'];
const DEFAULT_ISSUE_ID = 'issue-parkir-lorong-b';

function parseHash() {
  const [, mode, tab, id] = window.location.hash.split('/');
  const demo = mode === 'demo';
  return {
    appMode: demo ? ('demo' as const) : ('company_profile' as const),
    activeTab: demo && TABS.includes(tab as NavigationTab) ? (tab as NavigationTab) : ('beranda' as NavigationTab),
    activeIssueId: id ? decodeURIComponent(id) : DEFAULT_ISSUE_ID,
  };
}

function buildHash(appMode: string, tab: NavigationTab, issueId: string | null) {
  if (appMode !== 'demo') return '#/';
  const withIssue = (tab === 'isu' || tab === 'percobaan') && issueId;
  return `#/demo/${tab}${withIssue ? `/${encodeURIComponent(issueId)}` : ''}`;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from local storage if exists, otherwise seeds
  const [users] = useState<User[]>(SEED_USERS);
  // Hendra Setiawan (Fasilitator) default for full oversight
  const [currentUser, setCurrentUser] = useState<User>(() =>
    load('user', SEED_USERS[3], (v) => isObject(v) && SEED_USERS.some((u) => u.id === (v as User).id)),
  );

  const [organization] = useState<Organization>(SEED_ORGANIZATION);
  const [spaces] = useState<Space[]>(SEED_SPACES);
  const [currentSpaceId, setCurrentSpaceId] = useState<string>('space-melati');

  const [issues, setIssues] = useState<Issue[]>(() =>
    load('issues', INITIAL_ISSUES, (v) => Array.isArray(v) && v.length > 0),
  );

  const [experiments, setExperiments] = useState<Record<string, Experiment>>(() =>
    load('experiments', INITIAL_EXPERIMENTS, isObject),
  );

  const [activeIssueId, setActiveIssueId] = useState<string | null>(() => parseHash().activeIssueId);
  const [activeTab, setActiveTab] = useState<NavigationTab>(() => parseHash().activeTab);
  const [appMode, setAppMode] = useState<'company_profile' | 'demo'>(() => parseHash().appMode);

  // State -> URL
  useEffect(() => {
    const hash = buildHash(appMode, activeTab, activeIssueId);
    if (window.location.hash !== hash) window.location.hash = hash;
  }, [appMode, activeTab, activeIssueId]);

  // URL -> state (back/forward, manual edits)
  useEffect(() => {
    const onHashChange = () => {
      const next = parseHash();
      setAppMode(next.appMode);
      setActiveTab(next.activeTab);
      setActiveIssueId(next.activeIssueId);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [templates] = useState<TemplateBlueprint[]>(SEED_TEMPLATES);
  const [facilitators] = useState<Facilitator[]>(SEED_FACILITATORS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    load('audit', INITIAL_AUDIT_LOGS, Array.isArray),
  );

  // Save changes to localStorage
  useEffect(() => save('issues', issues), [issues]);
  useEffect(() => save('experiments', experiments), [experiments]);
  useEffect(() => save('audit', auditLogs), [auditLogs]);
  useEffect(() => save('user', currentUser), [currentUser]);

  const currentSpace = spaces.find((s) => s.id === currentSpaceId) || spaces[0];
  const currentIssue = issues.find((i) => i.id === activeIssueId) || null;
  const currentExperiment = currentIssue?.activeExperimentId
    ? experiments[currentIssue.activeExperimentId] || null
    : null;

  const logAudit = (action: string, target: string, details: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      target,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addIssue = (issueData: Partial<Issue>): Issue => {
    const newId = `issue-${Date.now()}`;
    const defaultFeasibility = [
      {
        id: 'f-1',
        questionNumber: 1,
        question: 'Apakah perselisihan ini tentang akibat yang dapat diukur (fakta), bukan tentang nilai atau siapa yang berhak?',
        description: 'Pastikan perselisihan terkait estimasi konsekuensi empiris, bukan sengketa moral/prinsip hidup.',
      },
      {
        id: 'f-2',
        questionNumber: 2,
        question: 'Apakah perubahan ini dapat dibalik sepenuhnya dalam waktu singkat tanpa biaya besar?',
        description: 'Penghalang mutlak: jika perubahan bersifat permanen atau destruktif, tidak boleh diuji coba.',
        isAbsoluteBlocker: true,
      },
      {
        id: 'f-3',
        questionNumber: 3,
        question: 'Apakah percobaan tidak mengorbankan hak, keselamatan, atau akses pihak mana pun (termasuk akses darurat dan disabilitas)?',
        description: 'Penghalang mutlak: hak mendasar dan keselamatan warga tidak dapat dikorbankan.',
        isAbsoluteBlocker: true,
      },
      {
        id: 'f-4',
        questionNumber: 4,
        question: 'Apakah ada ukuran hasil yang disepakati semua pihak sebagai adil?',
        description: 'Kedua pihak menyepakati metrik yang obyektif sebelum pengujian dimulai.',
      },
      {
        id: 'f-5',
        questionNumber: 5,
        question: 'Apakah durasi dan ukuran percobaan cukup kecil untuk risiko yang wajar?',
        description: 'Maksimum 30 hari dalam lingkup ruang terbatas.',
      },
      {
        id: 'f-6',
        questionNumber: 6,
        question: 'Apakah ada pihak dengan kekuasaan lebih besar yang bisa mengabaikan hasil?',
        description: 'Peringatan bila pengurus atau pemilik lahan berpotensi membatalkan sepihak.',
      },
      {
        id: 'f-7',
        questionNumber: 7,
        question: 'Apakah peraturan atau izin yang berlaku mengizinkan percobaan ini?',
        description: 'Memastikan tidak melanggar perda atau tata tertib hunian utama.',
      },
    ];

    const newIssue: Issue = {
      id: newId,
      spaceId: currentSpace.id,
      spaceName: currentSpace.name,
      authorId: currentUser.id,
      authorName: currentUser.name,
      title: issueData.title || 'Isu Baru',
      context: issueData.context || '',
      location: issueData.location || 'Wilayah Komunitas',
      affectedParties: issueData.affectedParties || ['Warga Lingkungan'],
      status: 'isu_dibuka',
      createdAt: new Date().toISOString(),
      claims: [],
      comments: [],
      feasibilityChecks: defaultFeasibility,
    };

    setIssues((prev) => [newIssue, ...prev]);
    setActiveIssueId(newId);
    setActiveTab('isu');
    logAudit('Membuka Isu Baru', newIssue.title, `Dibuka oleh ${currentUser.name}`);
    return newIssue;
  };

  const addClaim = (
    issueId: string,
    statement: string,
    mindChangingEvidence: string,
    initialConfidence: number,
    stance: 'pro' | 'kontra' | 'netral'
  ) => {
    const newClaim: Claim = {
      id: `claim-${Date.now()}`,
      issueId,
      userId: currentUser.id,
      userName: currentUser.displayName || currentUser.name,
      userUnit: currentUser.unitLabel,
      stance,
      statement,
      initialConfidence,
      mindChangingEvidence,
      updatedAt: new Date().toISOString(),
    };

    setIssues((prev) =>
      prev.map((iss) => {
        if (iss.id !== issueId) return iss;
        const updatedClaims = [...iss.claims.filter((c) => c.userId !== currentUser.id), newClaim];
        const nextStatus = updatedClaims.length >= 2 ? 'dugaan_terkumpul' : iss.status;
        return {
          ...iss,
          claims: updatedClaims,
          status: nextStatus,
        };
      })
    );

    logAudit('Menyatakan Dugaan Faktual', `Isu #${issueId}`, `Pernyataan dan bukti pengubah pikiran dicatat dengan keyakinan ${initialConfidence}%`);
  };

  const updateClaimConfidence = (issueId: string, claimId: string, confidence: number, isPost = true) => {
    setIssues((prev) =>
      prev.map((iss) => {
        if (iss.id !== issueId) return iss;
        return {
          ...iss,
          claims: iss.claims.map((c) => {
            if (c.id !== claimId) return c;
            return isPost ? { ...c, postConfidence: confidence } : { ...c, initialConfidence: confidence };
          }),
        };
      })
    );
    logAudit('Memperbarui Tingkat Keyakinan', `Klaim #${claimId}`, `Keyakinan pasca-evaluasi diubah menjadi ${confidence}%`);
  };

  const addComment = (issueId: string, body: string, kind: 'fakta' | 'dugaan' | 'nilai' | 'pertanyaan') => {
    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      issueId,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userUnit: currentUser.unitLabel,
      kind,
      body,
      createdAt: new Date().toISOString(),
    };

    setIssues((prev) =>
      prev.map((iss) => {
        if (iss.id !== issueId) return iss;
        return {
          ...iss,
          comments: [...iss.comments, newComment],
        };
      })
    );
  };

  const updateFeasibilityItem = (
    issueId: string,
    questionNumber: number,
    answer: 'ya' | 'tidak' | 'belum_tahu',
    reason: string
  ) => {
    setIssues((prev) =>
      prev.map((iss) => {
        if (iss.id !== issueId) return iss;
        const checks = iss.feasibilityChecks.map((item) =>
          item.questionNumber === questionNumber ? { ...item, answer, reason } : item
        );
        return { ...iss, feasibilityChecks: checks };
      })
    );
  };

  const finalizeFeasibility = (issueId: string, outcome: FeasibilityOutcome) => {
    setIssues((prev) =>
      prev.map((iss) => {
        if (iss.id !== issueId) return iss;
        return {
          ...iss,
          feasibilityOutcome: outcome,
          status:
            outcome.status === 'tidak_layak'
              ? 'dialihkan_ke_musyawarah'
              : 'desain_percobaan',
        };
      })
    );
    logAudit(
      'Menyelesaikan Gerbang Kelayakan',
      `Isu #${issueId}`,
      `Hasil: ${outcome.status.toUpperCase()} oleh ${currentUser.name}`
    );
  };

  const createExperimentForIssue = (issueId: string, expData: Partial<Experiment>): string => {
    const expId = `exp-${Date.now()}`;
    const newExperiment: Experiment = {
      id: expId,
      issueId,
      version: 1,
      status: 'menunggu_persetujuan',
      treatment: expData.treatment || 'Satu perlakuan terukur yang disepakati bersama',
      scope: expData.scope || 'Area spesifik komunitas',
      startDate: expData.startDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      endDate: expData.endDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      durationDays: expData.durationDays || 14,
      decisionRule: expData.decisionRule || 'Adopsi jika metrik utama membaik minimal 15%.',
      evaluationDate: expData.evaluationDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      metrics: expData.metrics || [],
      budget: expData.budget || [],
      stopRules: expData.stopRules || [],
      approvals: [
        {
          id: `app-init-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          userUnit: currentUser.unitLabel,
          stance: 'setuju',
          note: 'Komitmen awal penyusunan desain',
          commitmentSigned: true,
          signedAt: new Date().toISOString(),
        },
      ],
      dataEntries: [],
      events: [
        {
          id: `ev-init-${Date.now()}`,
          experimentId: expId,
          type: 'mulai',
          title: 'Desain Percobaan Disusun',
          description: `Disusun oleh ${currentUser.name} (${currentUser.role}) dan diajukan ke kuorum persetujuan.`,
          occurredAt: new Date().toISOString(),
          authorName: currentUser.name,
        },
      ],
    };

    setExperiments((prev) => ({ ...prev, [expId]: newExperiment }));
    setIssues((prev) =>
      prev.map((iss) =>
        iss.id === issueId
          ? { ...iss, activeExperimentId: expId, status: 'menunggu_persetujuan' }
          : iss
      )
    );
    logAudit('Menyusun Desain Percobaan', `Percobaan #${expId}`, `Perlakuan: ${newExperiment.treatment}`);
    return expId;
  };

  const submitApproval = (
    experimentId: string,
    stance: 'setuju' | 'setuju_dengan_catatan' | 'keberatan',
    note?: string
  ) => {
    const exp = experiments[experimentId];
    if (!exp) return;

    const newApproval = {
      id: `app-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.displayName || currentUser.name,
      userUnit: currentUser.unitLabel,
      stance,
      note: note || '',
      commitmentSigned: true,
      signedAt: new Date().toISOString(),
    };

    const existingFiltered = exp.approvals.filter((a) => a.userId !== currentUser.id);
    const updatedApprovals = [...existingFiltered, newApproval];

    // Check quorum: e.g. 70% of active members
    const _quorumTarget = Math.ceil(currentSpace.activeMemberCount * 0.7);
    const agreeCount = updatedApprovals.filter(
      (a) => a.stance === 'setuju' || a.stance === 'setuju_dengan_catatan'
    ).length;

    // Check if auto-locks and starts
    const hasEnoughApprovals = agreeCount >= 4; // minimum 4 stakeholders in prototype
    const newStatus = hasEnoughApprovals ? 'berjalan' : exp.status;

    setExperiments((prev) => ({
      ...prev,
      [experimentId]: {
        ...exp,
        approvals: updatedApprovals,
        status: newStatus,
      },
    }));

    if (hasEnoughApprovals && exp.status !== 'berjalan') {
      setIssues((prev) =>
        prev.map((i) =>
          i.id === exp.issueId ? { ...i, status: 'percobaan_berjalan' } : i
        )
      );
      logAudit('Persetujuan Desain & Memulai Percobaan', `Percobaan #${experimentId}`, `Kuorum tercapai (${agreeCount} persetujuan). Percobaan resmi dimulai.`);
    } else {
      logAudit('Memberikan Suara Desain', `Percobaan #${experimentId}`, `Sikap: ${stance.toUpperCase()} oleh ${currentUser.name}`);
    }
  };

  const addDataEntry = (experimentId: string, metricId: string, value: number, notes?: string) => {
    const exp = experiments[experimentId];
    if (!exp) return;

    const metric = exp.metrics.find((m) => m.id === metricId);
    const newEntry: DataEntry = {
      id: `de-${Date.now()}`,
      experimentId,
      metricId,
      metricName: metric ? metric.name : 'Metrik',
      unit: metric ? metric.unit : '',
      value,
      recordedBy: currentUser.displayName || currentUser.name,
      recordedAt: new Date().toISOString(),
      dayNumber: Math.min(exp.durationDays, (exp.dataEntries.length % exp.durationDays) + 1),
      notes,
      verifiedBy: currentUser.role === 'pemantau_independen' ? currentUser.name : undefined,
    };

    // Update current metric value with latest
    const updatedMetrics = exp.metrics.map((m) =>
      m.id === metricId ? { ...m, currentValue: value } : m
    );

    setExperiments((prev) => ({
      ...prev,
      [experimentId]: {
        ...exp,
        metrics: updatedMetrics,
        dataEntries: [...exp.dataEntries, newEntry],
      },
    }));

    logAudit('Pencatatan Data Lapangan', `Metrik: ${metric?.name}`, `Nilai: ${value} ${metric?.unit} dicatat oleh ${currentUser.name}`);
  };

  const verifyDataEntry = (experimentId: string, entryId: string) => {
    const exp = experiments[experimentId];
    if (!exp) return;

    const updated = exp.dataEntries.map((e) =>
      e.id === entryId
        ? { ...e, verifiedBy: currentUser.name, flagged: false }
        : e
    );

    setExperiments((prev) => ({
      ...prev,
      [experimentId]: { ...exp, dataEntries: updated },
    }));

    logAudit('Verifikasi Data Independen', `Entri #${entryId}`, `Diverifikasi sah oleh ${currentUser.name}`);
  };

  const triggerEmergencyStop = (experimentId: string, reason: string) => {
    const exp = experiments[experimentId];
    if (!exp) return;

    const updatedStopRules = exp.stopRules.map((sr) => ({
      ...sr,
      triggered: true,
      triggerReason: reason,
      triggeredAt: new Date().toISOString(),
    }));

    const stopEvent = {
      id: `ev-stop-${Date.now()}`,
      experimentId,
      type: 'dihentikan' as const,
      title: 'Percobaan Dihentikan Segera (Aturan Berhenti Terpicu)',
      description: `Alasan penghentian darurat: "${reason}". Dilakukan oleh ${currentUser.name} (${currentUser.role}).`,
      occurredAt: new Date().toISOString(),
      authorName: currentUser.name,
    };

    setExperiments((prev) => ({
      ...prev,
      [experimentId]: {
        ...exp,
        status: 'dihentikan',
        stoppedReason: reason,
        stoppedAt: new Date().toISOString(),
        stopRules: updatedStopRules,
        events: [stopEvent, ...exp.events],
      },
    }));

    setIssues((prev) =>
      prev.map((i) =>
        i.id === exp.issueId ? { ...i, status: 'evaluasi_hasil' } : i
      )
    );

    logAudit('Hentikan Sekarang (Aturan Berhenti)', `Percobaan #${experimentId}`, `PENGHENTIAN DARURAT: ${reason}`);
  };

  const recordDecision = (
    experimentId: string,
    outcome: DecisionOutcome,
    title: string,
    reason: string,
    statement: string
  ) => {
    const exp = experiments[experimentId];
    if (!exp) return;

    const decision = {
      id: `dec-${Date.now()}`,
      experimentId,
      outcome,
      title,
      reason,
      officialStatement: statement,
      decidedBy: `${currentUser.name} (${currentUser.role})`,
      decidedAt: new Date().toISOString(),
      reviewDate1Month: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      reviewDate3Month: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      acceptanceAverageScore: 4.5,
      acceptancePercentage: 90,
    };

    setExperiments((prev) => ({
      ...prev,
      [experimentId]: { ...exp, status: 'selesai' },
    }));

    setIssues((prev) =>
      prev.map((iss) =>
        iss.id === exp.issueId
          ? { ...iss, status: 'keputusan_tercatat', decision }
          : iss
      )
    );

    logAudit('Mencatat Keputusan Akhir', `Isu #${exp.issueId}`, `Hasil: ${outcome.toUpperCase()} - "${title}"`);
  };

  const submitAcceptanceRating = (
    decisionId: string,
    score: number,
    accepts: boolean,
    comment?: string
  ) => {
    logAudit('Survei Penerimaan Pasca-Keputusan', `Keputusan #${decisionId}`, `Skor: ${score}/5, Menerima: ${accepts ? 'Ya' : 'Tidak'}`);
  };

  const applyTemplateToCreateIssue = (template: TemplateBlueprint): string => {
    const newIssue = addIssue({
      title: template.sampleQuestion,
      context: `Diinisiasi menggunakan templat CobaSepakat: "${template.title}". ${template.summary}`,
      location: 'Area Pengaturan Kluster',
      affectedParties: ['Warga Penghuni', 'Pengelola Lingkungan'],
    });

    // Auto prepopulate experiment draft
    const expId = `exp-tpl-${Date.now()}`;
    const generatedMetrics = template.recommendedMetrics.map((m, idx) => ({
      ...m,
      id: `met-tpl-${idx + 1}`,
      currentValue: m.baselineValue,
    }));

    const generatedStopRules = template.recommendedStopRules.map((sr, idx) => ({
      id: `sr-tpl-${idx + 1}`,
      conditionDescription: sr,
      severity: 'kritis_henti' as const,
      notifyRoles: ['pengurus' as const, 'fasilitator' as const],
      triggered: false,
    }));

    const newExp: Experiment = {
      id: expId,
      issueId: newIssue.id,
      version: 1,
      status: 'draf',
      treatment: template.title,
      scope: 'Wilayah Kluster Melati',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + template.recommendedDuration * 86400000).toISOString().split('T')[0],
      durationDays: template.recommendedDuration,
      decisionRule: template.recommendedDecisionRule,
      evaluationDate: new Date(Date.now() + (template.recommendedDuration + 1) * 86400000).toISOString().split('T')[0],
      metrics: generatedMetrics,
      budget: [
        {
          id: 'b-tpl-1',
          label: 'Perlengkapan dan Penanda Sementara',
          amount: 500000,
          fundingSource: 'Kas Warga',
          isApproved: true,
        },
      ],
      stopRules: generatedStopRules,
      approvals: [],
      dataEntries: [],
      events: [],
    };

    setExperiments((prev) => ({ ...prev, [expId]: newExp }));
    setIssues((prev) =>
      prev.map((i) => (i.id === newIssue.id ? { ...i, activeExperimentId: expId } : i))
    );

    setActiveIssueId(newIssue.id);
    setActiveTab('isu');
    return newIssue.id;
  };

  const resetAllData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_issues`);
    localStorage.removeItem(`${STORAGE_KEY}_experiments`);
    localStorage.removeItem(`${STORAGE_KEY}_audit`);
    localStorage.removeItem(`${STORAGE_KEY}_user`);
    setIssues(INITIAL_ISSUES);
    setExperiments(INITIAL_EXPERIMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentUser(SEED_USERS[3]);
    setActiveIssueId('issue-parkir-lorong-b');
    setActiveTab('beranda');
  };

  const requestFacilitator = (facilitatorName: string, pkg: string, note: string) => {
    logAudit('Permintaan Fasilitasi', facilitatorName, `${pkg}. Catatan: ${note}`);
    notify(`Permintaan fasilitasi ke ${facilitatorName} terkirim.`);
  };

  // Every user-facing action confirms itself with a toast so no click feels dead.
  const withToast = <A extends unknown[], R>(fn: (...args: A) => R, message: string, tone: ToastTone = 'success') =>
    (...args: A): R => {
      const result = fn(...args);
      notify(message, tone);
      return result;
    };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        setCurrentUser,
        organization,
        spaces,
        currentSpace,
        setCurrentSpaceId,
        issues,
        currentIssue,
        activeIssueId,
        setActiveIssueId,
        experiments,
        currentExperiment,
        templates,
        facilitators,
        auditLogs,
        activeTab,
        setActiveTab,
        appMode,
        setAppMode,
        showMobileMenu,
        setShowMobileMenu,
        addIssue: withToast(addIssue, "Isu baru dibuka. Mulai kumpulkan dugaan dari anggota."),
        addClaim: withToast(addClaim, "Dugaan Anda tersimpan."),
        updateClaimConfidence: withToast(updateClaimConfidence, "Tingkat keyakinan diperbarui."),
        addComment: withToast(addComment, "Komentar terkirim."),
        updateFeasibilityItem,
        finalizeFeasibility: withToast(finalizeFeasibility, "Hasil Gerbang Kelayakan ditetapkan."),
        createExperimentForIssue: withToast(createExperimentForIssue, "Desain percobaan diajukan ke kuorum persetujuan."),
        submitApproval: withToast(submitApproval, "Suara Anda tercatat."),
        addDataEntry: withToast(addDataEntry, "Entri data lapangan disimpan."),
        verifyDataEntry: withToast(verifyDataEntry, "Entri data diverifikasi."),
        triggerEmergencyStop: withToast(triggerEmergencyStop, "Percobaan dihentikan. Warga diberi tahu.", 'warning'),
        recordDecision: withToast(recordDecision, "Catatan keputusan dikunci secara permanen."),
        submitAcceptanceRating: withToast(submitAcceptanceRating, "Terima kasih, umpan balik penerimaan tercatat."),
        applyTemplateToCreateIssue: withToast(applyTemplateToCreateIssue, "Isu baru dibuat dari templat."),
        requestFacilitator,
        resetAllData: withToast(resetAllData, "Data demo dikembalikan ke kondisi awal."),
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
