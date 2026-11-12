import { describe, expect, it } from 'vitest';
import { evaluateRule } from '../src/core';
import { analyzeExperiment } from '../src/lib/coreAdapter';
import { buildReportPdf } from '../src/lib/report';
import { INITIAL_EXPERIMENTS, INITIAL_ISSUES } from '../src/data/seedData';

describe('laporan PDF', () => {
  it('menghasilkan PDF valid dengan konten ringkas', async () => {
    const exp = INITIAL_EXPERIMENTS['exp-parkir-01'];
    const issue = INITIAL_ISSUES[0];
    const a = analyzeExperiment(exp);
    const bytes = await buildReportPdf({
      spaceName: 'Ruang Uji',
      issue,
      experiment: exp,
      result: a.result,
      ruleDerived: a.ruleDerived,
      stopStatus: exp.stopRules.map((r) => ({ description: r.conditionDescription, triggered: r.triggered })),
      generatedAt: '2026-11-12T00:00:00Z',
      isDemo: true,
      ledgerHead: 'a'.repeat(64),
    });
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe('%PDF-');
    expect(bytes.length).toBeGreaterThan(2000);
    expect(evaluateRule(a.rule, [], []).verdict).toBe('belum_dapat_disimpulkan');
  });
});
