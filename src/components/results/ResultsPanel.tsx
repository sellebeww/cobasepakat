import { useMemo } from 'react';
import { type MessageKey, useI18n } from '../../i18n';
import { estimateMetric } from '../../core';
import { analyzeExperiment, entryToObservation, metricToCore } from '../../lib/coreAdapter';
import type { Experiment } from '../../types';
import { MetricChart } from './MetricChart';
import { VerdictBadge } from './VerdictBadge';
import { describeMeasured, fmt, fmtPct, methodLabel } from './format';

/** Hasil jujur satu percobaan: estimasi, interval, ukuran sampel, verdict kriteria, dan batasan metode. */
export function ResultsPanel({ experiment, showCharts = true }: { experiment: Experiment; showCharts?: boolean }) {
  const { t } = useI18n();
  const analysis = useMemo(() => analyzeExperiment(experiment), [experiment]);
  const estimates = useMemo(() => {
    const obs = experiment.dataEntries.map(entryToObservation);
    return experiment.metrics.map((m) => estimateMetric(metricToCore(m), obs));
  }, [experiment]);
  const { result, ruleDerived } = analysis;
  const modeText = t(`results.mode.${analysis.rule.mode}`, { k: analysis.rule.k ?? '?' });

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-brand-border bg-white p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h3 className="text-base font-bold text-brand-navy">{t('results.title')}</h3>
          <VerdictBadge verdict={result.verdict} />
        </div>
        <p className="text-sm text-brand-navy">{t(`summary.${result.verdict}`)}</p>
        <p className="mt-1 text-xs text-brand-slate">
          {t('results.rule', { mode: modeText, s: result.satisfied, f: result.failed, u: result.undecided })}
          {ruleDerived && ` ${t('results.derived')}`}
        </p>

        <div className="mt-3 overflow-x-auto" role="region" aria-label="Tabel hasil per kriteria" tabIndex={0}>
          <table className="w-full min-w-[560px] text-left text-sm">
            <caption className="sr-only">Hasil per kriteria</caption>
            <thead>
              <tr className="border-b border-brand-border text-xs text-brand-slate">
                <th scope="col" className="py-2 pr-3">{t('results.col.criterion')}</th>
                <th scope="col" className="py-2 pr-3">{t('results.col.estimate')}</th>
                <th scope="col" className="py-2 pr-3">{t('results.col.interval')}</th>
                <th scope="col" className="py-2 pr-3">{t('results.col.requirement')}</th>
                <th scope="col" className="py-2 pr-3">{t('results.col.sample')}</th>
                <th scope="col" className="py-2">{t('results.col.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {result.criteria.map((c) => {
                const metric = experiment.metrics.find((m) => m.id === c.criterion.metricId);
                const d = describeMeasured(c, metric?.unit ?? '');
                return (
                  <tr key={c.criterion.id}>
                    <th scope="row" className="py-2 pr-3 font-semibold text-brand-navy">
                      {c.metricName}
                      <span className="block text-xs font-normal text-brand-slate">{t(`reason.${c.reasonCode}`, { days: c.days, minDays: c.criterion.minDays ?? 3 })}</span>
                    </th>
                    <td className="py-2 pr-3 font-mono">{d.value}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{d.interval}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{d.target}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{t('results.sample', { days: c.days, n: c.observations })}</td>
                    <td className="py-2"><VerdictBadge verdict={c.verdict} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <aside className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950" aria-label="Batasan metode">
          <p className="font-bold">{t('results.limitations')}</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {result.limitations.map((l, i) => (
              <li key={l}>{t(`limit.${i + 1}` as MessageKey)}</li>
            ))}
          </ul>
        </aside>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {estimates.map((est) => {
          const m = est.metric;
          return (
            <section key={m.id} className="space-y-2 rounded-2xl border border-brand-border bg-white p-4" aria-label={m.name}>
              <h4 className="text-sm font-bold text-brand-navy">{m.name}</h4>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs sm:grid-cols-4">
                <div><dt className="text-brand-slate">{t('results.baseline')}</dt><dd className="font-mono font-bold">{fmt(m.baselineValue)} {m.unit}</dd></div>
                <div><dt className="text-brand-slate">{t('results.estimate')}</dt><dd className="font-mono font-bold">{est.estimate === null ? t('results.nodata') : `${fmt(est.estimate)} ${m.unit}`}</dd></div>
                <div><dt className="text-brand-slate">{t('results.threshold')}</dt><dd className="font-mono font-bold">{fmt(m.thresholdValue)} {m.unit}</dd></div>
                <div><dt className="text-brand-slate">{t('results.change')}</dt><dd className="font-mono font-bold">{fmtPct(est.changeVsBaseline, 1)}</dd></div>
              </dl>
              <p className="text-xs text-brand-slate">
                {t('results.interval')}: {est.interval ? `${fmt(est.interval.lower)} - ${fmt(est.interval.upper)} ${m.unit}` : t('results.interval.none')} · {methodLabel(est.method)}
              </p>
              {showCharts && <MetricChart est={est} />}
            </section>
          );
        })}
      </div>
    </div>
  );
}
