/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type {
  User,
  Organization,
  Space,
  Issue,
  Experiment,
  Decision,
  Claim,
  Comment,
  DataEntry,
  FeasibilityOutcome,
  DecisionOutcome,
  TemplateBlueprint,
  Facilitator,
  AuditLog,
  AcceptanceResponse,
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
  INITIAL_ACCEPTANCE,
} from '../data/seedData';
import { notify, type ToastTone } from '../lib/notify';
import {
  appendEntry,
  computeQuorum,
  dayIndex,
  markManualStop,
  shouldHalt,
  latchTriggered,
  verifyChain,
  type ChainVerification,
  type LedgerEntry,
  type QuorumResult,
} from '../core';
import { analyzeExperiment, localUtcOffsetMinutes, stopRuleToCore } from '../lib/coreAdapter';

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
  ledger: LedgerEntry[];
  verifyLedger: () => Promise<ChainVerification>;
  /** Hanya untuk demo: mengubah satu entri tanpa menghitung ulang hash, untuk memperlihatkan deteksi. */
  tamperLedgerForDemo: () => void;
  acceptance: AcceptanceResponse[];
  quorumFor: (experimentId: string) => QuorumResult | null;
  flagDataEntry: (experimentId: string, entryId: string, flagged: boolean) => void;
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
  const [acceptance, setAcceptance] = useState<AcceptanceResponse[]>(() =>
    load('acceptance', INITIAL_ACCEPTANCE, Array.isArray),
  );
  // Riwayat audit dan keputusan = buku besar berantai hash (lihat src/core/ledger.ts).
  const [ledger, setLedger] = useState<LedgerEntry[]>(() => load('ledger', [] as LedgerEntry[], Array.isArray));
  const ledgerRef = useRef<LedgerEntry[]>(ledger);
  const queueRef = useRef<Promise<unknown>>(Promise.resolve());

  const enqueue = useCallback(
    (inputs: { timestamp: string; actor: string; type: string; payload: unknown }[], after?: (added: LedgerEntry[]) => void) => {
      queueRef.current = queueRef.current
        .then(async () => {
          let chain = ledgerRef.current;
          for (const input of inputs) chain = await appendEntry(chain, input);
          ledgerRef.current = chain;
          setLedger(chain);
          after?.(chain.slice(chain.length - inputs.length));
        })
        .catch(() => notify('Gagal menulis ke riwayat berantai.', 'warning'));
    },
    [],
  );

  // Bibit awal: log audit contoh dimasukkan ke rantai sekali, urut dari yang terlama.
  useEffect(() => {
    if (ledgerRef.current.length > 0) return;
    enqueue(
      [...INITIAL_AUDIT_LOGS].reverse().map((l) => ({
        timestamp: l.timestamp,
        actor: l.userName,
        type: 'audit',
        payload: { action: l.action, target: l.target, details: l.details, userRole: l.userRole },
      })),
    );
  }, [enqueue]);

  const auditLogs = useMemo<AuditLog[]>(
    () =>
      [...ledger].reverse().map((e) => {
        const p = (e.payload ?? {}) as Record<string, string>;
        return {
          id: `led-${e.index}`,
          index: e.index,
          hash: e.hash,
          prevHash: e.prevHash,
          timestamp: e.timestamp,
          userName: e.actor,
          userRole: (p.userRole as AuditLog['userRole']) ?? 'anggota',
          action: e.type === 'keputusan' ? 'Mencatat Keputusan Akhir' : (p.action ?? e.type),
          target: p.target ?? '',
          details: p.details ?? '',
        };
      }),
    [ledger],
  );

  const verifyLedger = useCallback(() => verifyChain(ledgerRef.current), []);
  const tamperLedgerForDemo = useCallback(() => {
    const chain = ledgerRef.current;
    if (chain.length < 2) return;
    const i = Math.floor(chain.length / 2);
    const next = chain.map((e, k) => (k === i ? { ...e, payload: { ...(e.payload as object), details: 'DIUBAH DIAM-DIAM' } } : e));
    ledgerRef.current = next;
    setLedger(next);
  }, []);

  // Save changes to localStorage
  useEffect(() => save('issues', issues), [issues]);
  useEffect(() => save('experiments', experiments), [experiments]);
  useEffect(() => save('ledger', ledger), [ledger]);
  useEffect(() => save('acceptance', acceptance), [acceptance]);
  useEffect(() => save('user', currentUser), [currentUser]);

  const currentSpace = spaces.find((s) => s.id === currentSpaceId) || spaces[0];
  const currentIssue = issues.find((i) => i.id === activeIssueId) || null;
  const currentExperiment = currentIssue?.activeExperimentId
    ? experiments[currentIssue.activeExperimentId] || null
    : null;

  const logAudit = (action: string, target: string, details: string) => {
    enqueue([
      {
        timestamp: new Date().toISOString(),
        actor: currentUser.name,
        type: 'audit',
        payload: { action, target, details, userRole: currentUser.role },
      },
    ]);
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

  const eligibleVoters = users.filter((u) => u.role !== 'pemantau_independen').length;

  const quorumFor = (experimentId: string): QuorumResult | null => {
    const exp = experiments[experimentId];
    if (!exp) return null;
    const issue = issues.find((i) => i.id === exp.issueId);
    const space = spaces.find((sp) => sp.id === issue?.spaceId) ?? currentSpace;
    return computeQuorum({
      eligibleVoters,
      quorumPercentage: space.rules.quorumPercentage,
      votes: exp.approvals.map((a) => ({ userId: a.userId, stance: a.stance })),
    });
  };

  const submitApproval = (
    experimentId: string,
    stance: 'setuju' | 'setuju_dengan_catatan' | 'keberatan',
    note?: string
  ) => {
    const exp = experiments[experimentId];
    if (!exp) return;
    if (exp.status !== 'menunggu_persetujuan' && exp.status !== 'draf') {
      notify('Desain sudah dikunci; suara tidak dapat diubah.', 'warning');
      return;
    }

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
    const updatedApprovals = [...exp.approvals.filter((a) => a.userId !== currentUser.id), newApproval];

    const issue = issues.find((i) => i.id === exp.issueId);
    const space = spaces.find((sp) => sp.id === issue?.spaceId) ?? currentSpace;
    const quorum = computeQuorum({
      eligibleVoters,
      quorumPercentage: space.rules.quorumPercentage,
      votes: updatedApprovals.map((a) => ({ userId: a.userId, stance: a.stance })),
    });
    const starts = quorum.reached && exp.status === 'menunggu_persetujuan';

    setExperiments((prev) => ({
      ...prev,
      [experimentId]: { ...exp, approvals: updatedApprovals, status: starts ? 'berjalan' : exp.status },
    }));

    if (starts) {
      setIssues((prev) => prev.map((i) => (i.id === exp.issueId ? { ...i, status: 'percobaan_berjalan' } : i)));
      logAudit('Persetujuan Desain & Memulai Percobaan', `Percobaan #${experimentId}`, `Kuorum tercapai (${quorum.agree} dari ${quorum.required} suara setuju yang dibutuhkan). Desain dikunci dan percobaan dimulai.`);
    } else {
      logAudit('Memberikan Suara Desain', `Percobaan #${experimentId}`, `Sikap: ${stance.toUpperCase()} oleh ${currentUser.name} (${quorum.agree}/${quorum.required} setuju)`);
    }
  };

  /** Terapkan evaluasi aturan berhenti (core) ke percobaan: kunci yang terpicu, hentikan bila ada yang kritis. */
  const applyStopEvaluation = (exp: Experiment): { exp: Experiment; halted: boolean; reason?: string } => {
    const { stop } = analyzeExperiment(exp);
    const latched = latchTriggered(exp.stopRules.map(stopRuleToCore), stop);
    const byId = new Map(latched.map((r) => [r.id, r.triggeredAt]));
    let next: Experiment = {
      ...exp,
      stopRules: exp.stopRules.map((r) => {
        const t = byId.get(r.id);
        if (!t || r.triggered) return r;
        const res = stop.find((x) => x.ruleId === r.id);
        return { ...r, triggered: true, triggeredAt: t, triggerReason: res?.reason ?? r.triggerReason };
      }),
    };
    const halted = shouldHalt(stop) && exp.status === 'berjalan';
    let reason: string | undefined;
    if (halted) {
      const first = stop.find((r) => r.status === 'terpicu' && r.severity === 'kritis_henti');
      reason = first?.reason ?? 'Aturan berhenti kritis terpicu.';
      const now = new Date().toISOString();
      next = {
        ...next,
        status: 'dihentikan',
        stoppedReason: reason,
        stoppedAt: now,
        events: [
          {
            id: `ev-stop-${Date.now()}`,
            experimentId: exp.id,
            type: 'dihentikan',
            title: 'Percobaan Dihentikan Otomatis (Aturan Berhenti Terpicu)',
            description: reason,
            occurredAt: now,
            authorName: 'Sistem (aturan berhenti)',
          },
          ...next.events,
        ],
      };
    }
    return { exp: next, halted, reason };
  };

  const addDataEntry = (experimentId: string, metricId: string, value: number, notes?: string) => {
    const exp = experiments[experimentId];
    if (!exp) return;
    if (exp.status !== 'berjalan') {
      notify('Data hanya dapat dicatat saat percobaan berjalan.', 'warning');
      return;
    }
    if (!Number.isFinite(value)) {
      notify('Nilai harus berupa angka.', 'warning');
      return;
    }
    const nowIso = new Date().toISOString();
    const day = dayIndex(exp.startDate, nowIso, localUtcOffsetMinutes());
    if (day === null || day < 1) {
      notify('Percobaan belum dimulai menurut tanggal.', 'warning');
      return;
    }
    if (day > exp.durationDays) {
      notify('Masa percobaan yang disepakati sudah lewat; data baru tidak diterima.', 'warning');
      return;
    }

    const metric = exp.metrics.find((m) => m.id === metricId);
    const newEntry: DataEntry = {
      id: `de-${Date.now()}`,
      experimentId,
      metricId,
      metricName: metric ? metric.name : 'Metrik',
      unit: metric ? metric.unit : '',
      value,
      recordedBy: currentUser.displayName || currentUser.name,
      recordedAt: nowIso,
      dayNumber: day,
      notes,
      verifiedBy: currentUser.role === 'pemantau_independen' ? currentUser.name : undefined,
    };

    const withEntry: Experiment = { ...exp, dataEntries: [...exp.dataEntries, newEntry] };
    const { exp: finalExp, halted, reason } = applyStopEvaluation(withEntry);
    setExperiments((prev) => ({ ...prev, [experimentId]: finalExp }));
    if (halted) {
      setIssues((prev) => prev.map((i) => (i.id === exp.issueId ? { ...i, status: 'evaluasi_hasil' } : i)));
      logAudit('Penghentian Otomatis (Aturan Berhenti)', `Percobaan #${experimentId}`, `PENGHENTIAN OTOMATIS: ${reason}`);
      notify('Aturan berhenti kritis terpicu. Percobaan dihentikan otomatis.', 'warning');
    }
    logAudit('Pencatatan Data Lapangan', `Metrik: ${metric?.name}`, `Nilai: ${value} ${metric?.unit} (hari ke-${day}) dicatat oleh ${currentUser.name}`);
  };

  const verifyDataEntry = (experimentId: string, entryId: string) => {
    const exp = experiments[experimentId];
    if (!exp) return;
    const entry = exp.dataEntries.find((e) => e.id === entryId);
    if (!entry) return;
    if (entry.recordedBy === (currentUser.displayName || currentUser.name) || entry.recordedBy === currentUser.name) {
      notify('Pencatat tidak dapat memverifikasi entrinya sendiri.', 'warning');
      return;
    }
    const updated = exp.dataEntries.map((e) => (e.id === entryId ? { ...e, verifiedBy: currentUser.name, flagged: false } : e));
    setExperiments((prev) => ({ ...prev, [experimentId]: { ...exp, dataEntries: updated } }));
    logAudit('Verifikasi Data Independen', `Entri #${entryId}`, `Diverifikasi sah oleh ${currentUser.name}`);
  };

  const flagDataEntry = (experimentId: string, entryId: string, flagged: boolean) => {
    const exp = experiments[experimentId];
    if (!exp) return;
    const updated = exp.dataEntries.map((e) => (e.id === entryId ? { ...e, flagged, verifiedBy: flagged ? undefined : e.verifiedBy } : e));
    setExperiments((prev) => ({ ...prev, [experimentId]: { ...exp, dataEntries: updated } }));
    logAudit(flagged ? 'Menandai Data Bermasalah' : 'Menghapus Tanda Data', `Entri #${entryId}`, `${flagged ? 'Dikeluarkan dari analisis' : 'Kembali dipakai dalam analisis'} oleh ${currentUser.name}`);
  };

  const triggerEmergencyStop = (experimentId: string, reason: string) => {
    const exp = experiments[experimentId];
    if (!exp) return;
    const now = new Date().toISOString();
    // Hanya aturan manual yang dikunci; aturan otomatis dinilai dari data, bukan dari tombol.
    const marked = markManualStop(exp.stopRules.map(stopRuleToCore), now);
    const markedIds = new Map(marked.map((r) => [r.id, r.triggeredAt]));
    const updatedStopRules = exp.stopRules.map((sr) =>
      !sr.triggered && markedIds.get(sr.id) ? { ...sr, triggered: true, triggerReason: reason, triggeredAt: now } : sr,
    );

    const stopEvent = {
      id: `ev-stop-${Date.now()}`,
      experimentId,
      type: 'dihentikan' as const,
      title: 'Percobaan Dihentikan Segera (Hentikan Sekarang)',
      description: `Alasan penghentian darurat: "${reason}". Dilakukan oleh ${currentUser.name} (${currentUser.role}).`,
      occurredAt: now,
      authorName: currentUser.name,
    };

    setExperiments((prev) => ({
      ...prev,
      [experimentId]: { ...exp, status: 'dihentikan', stoppedReason: reason, stoppedAt: now, stopRules: updatedStopRules, events: [stopEvent, ...exp.events] },
    }));
    setIssues((prev) => prev.map((i) => (i.id === exp.issueId ? { ...i, status: 'evaluasi_hasil' } : i)));
    logAudit('Hentikan Sekarang (Manual)', `Percobaan #${experimentId}`, `PENGHENTIAN DARURAT: ${reason}`);
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
    const existing = issues.find((i) => i.id === exp.issueId);
    if (existing?.decision) {
      notify('Keputusan sudah dicatat dan tidak dapat diubah. Buat catatan tinjauan baru bila perlu.', 'warning');
      return;
    }
    const { result } = analyzeExperiment(exp);
    const now = new Date().toISOString();
    const decision: Decision = {
      id: `dec-${Date.now()}`,
      experimentId,
      outcome,
      title,
      reason,
      officialStatement: statement,
      decidedBy: `${currentUser.name} (${currentUser.role})`,
      decidedAt: now,
      reviewDate1Month: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      reviewDate3Month: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      ruleVerdictAtDecision: result.verdict,
    };

    setExperiments((prev) => ({ ...prev, [experimentId]: { ...exp, status: 'selesai' } }));
    setIssues((prev) => prev.map((iss) => (iss.id === exp.issueId ? { ...iss, status: 'keputusan_tercatat', decision } : iss)));

    // Catat keputusan ke buku besar berantai, lalu simpan hash entrinya pada keputusan.
    enqueue([{ timestamp: now, actor: currentUser.name, type: 'keputusan', payload: { decision, issueId: exp.issueId } }], ([entry]) => {
      setIssues((prev) => prev.map((iss) => (iss.decision?.id === decision.id ? { ...iss, decision: { ...iss.decision, ledgerHash: entry.hash } } : iss)));
    });
  };

  const submitAcceptanceRating = (
    decisionId: string,
    score: number,
    accepts: boolean,
    comment?: string
  ) => {
    const issue = issues.find((i) => i.decision?.id === decisionId);
    if (!issue) {
      notify('Keputusan belum tercatat; survei penerimaan belum dapat diisi.', 'warning');
      return;
    }
    const claim = issue.claims.find((c) => c.userId === currentUser.id);
    const response: AcceptanceResponse = {
      id: `acc-${Date.now()}`,
      decisionId,
      userId: currentUser.id,
      userName: currentUser.displayName || currentUser.name,
      stanceInitial: claim?.stance ?? 'netral',
      score,
      acceptsOutcome: accepts,
      comment,
      createdAt: new Date().toISOString(),
    };
    setAcceptance((prev) => [...prev.filter((r) => !(r.decisionId === decisionId && r.userId === currentUser.id)), response]);
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
    localStorage.removeItem(`${STORAGE_KEY}_ledger`);
    localStorage.removeItem(`${STORAGE_KEY}_acceptance`);
    localStorage.removeItem(`${STORAGE_KEY}_user`);
    setIssues(INITIAL_ISSUES);
    setExperiments(INITIAL_EXPERIMENTS);
    setAcceptance(INITIAL_ACCEPTANCE);
    ledgerRef.current = [];
    setLedger([]);
    enqueue(
      [...INITIAL_AUDIT_LOGS].reverse().map((l) => ({
        timestamp: l.timestamp,
        actor: l.userName,
        type: 'audit',
        payload: { action: l.action, target: l.target, details: l.details, userRole: l.userRole },
      })),
    );
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
        ledger,
        verifyLedger,
        tamperLedgerForDemo,
        acceptance,
        quorumFor,
        flagDataEntry: withToast(flagDataEntry, 'Tanda data diperbarui.'),
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
