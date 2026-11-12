import { FileDown } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';
import { summarizeAcceptance } from '../../core';
import { acceptanceToCore, analyzeExperiment } from '../../lib/coreAdapter';
import { notify } from '../../lib/notify';
import type { Experiment, Issue } from '../../types';

/** Ekspor laporan PDF (dibuat di peramban; pustaka PDF dimuat saat tombol ditekan). */
export function ReportButton({ experiment, issue, className = '' }: { experiment: Experiment; issue: Issue; className?: string }) {
  const { acceptance, verifyLedger, spaces } = useApp();
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      const [{ buildReportPdf, downloadPdf }, chain] = await Promise.all([import('../../lib/report'), verifyLedger()]);
      const a = analyzeExperiment(experiment);
      const bytes = await buildReportPdf({
        spaceName: spaces.find((s) => s.id === issue.spaceId)?.name ?? issue.spaceName,
        issue,
        experiment,
        result: a.result,
        ruleDerived: a.ruleDerived,
        stopStatus: experiment.stopRules.map((r) => ({ description: r.conditionDescription, triggered: r.triggered, reason: r.triggerReason })),
        decision: issue.decision,
        acceptance: issue.decision ? summarizeAcceptance(acceptanceToCore(acceptance.filter((r) => r.decisionId === issue.decision?.id))) : undefined,
        ledgerHead: chain.head,
        generatedAt: new Date().toISOString(),
        isDemo: true,
      });
      downloadPdf(`laporan-${experiment.id}.pdf`, bytes);
      notify('Laporan PDF dibuat.');
    } catch {
      notify('Gagal membuat PDF.', 'warning');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={run}
      disabled={busy}
      className={`px-4 py-2.5 bg-white hover:bg-brand-surface text-brand-navy border border-brand-border rounded-full text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 ${className}`}
    >
      <FileDown className="w-4 h-4" aria-hidden="true" />
      {busy ? t('report.busy') : t('report.button')}
    </button>
  );
}
