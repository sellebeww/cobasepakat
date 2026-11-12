/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { useApp } from '../../context/AppContext';
import type { TemplateBlueprint } from '../../types';
import {
  Clock,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export const TemplateLibrary: React.FC = () => {
  const { templates, applyTemplateToCreateIssue, currentSpace } = useApp();

  // Creating an issue is non-destructive and announces itself with a toast, so no browser confirm().
  const handleApply = (tpl: TemplateBlueprint) => applyTemplateToCreateIssue(tpl);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-brand-border shadow-sm space-y-3">
        <div className="text-xs font-bold text-brand-blue uppercase tracking-wider">
          Pustaka Desain Percobaan Teruji
        </div>
        <h1 className="text-3xl font-extrabold text-brand-navy">
          Templat Uji Coba Komunitas Siap Pakai
        </h1>
        <p className="text-xs md:text-sm text-brand-slate max-w-3xl leading-relaxed">
          Jangan mulai dari nol. Pilih templat rancangan percobaan yang telah dilengkapi indikator ukuran hasil,
          garis dasar umum, dan aturan berhenti keselamatan. Disesuaikan untuk dinamika RT/RW, koperasi, dan kawasan perumahan.
        </p>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white rounded-3xl p-6 border border-brand-border shadow-sm hover:border-brand-blue transition-all flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-blue bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {tpl.category.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-brand-slate flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-600" />
                  Rekomendasi {tpl.recommendedDuration} Hari
                </span>
              </div>

              <h3 className="text-lg font-bold text-brand-navy leading-snug">
                {tpl.title}
              </h3>

              <p className="text-xs text-brand-slate leading-relaxed">
                {tpl.summary}
              </p>

              <div className="p-3 bg-brand-surface rounded-2xl border border-brand-border space-y-1 text-xs">
                <div className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                  Contoh Pertanyaan Keputusan:
                </div>
                <p className="text-brand-navy italic">&ldquo;{tpl.sampleQuestion}&rdquo;</p>
              </div>

              {/* Metrics preview */}
              <div className="space-y-1">
                <div className="text-xs font-semibold text-brand-navy">Metrik Rekomendasi:</div>
                <div className="flex flex-wrap gap-1.5">
                  {tpl.recommendedMetrics.map((m, i) => (
                    <span
                      key={i}
                      className="text-xs bg-white border border-brand-border text-brand-navy px-2.5 py-1 rounded-lg"
                    >
                      {m.name} ({m.unit})
                    </span>
                  ))}
                </div>
              </div>

              {/* Guardrails preview */}
              <div className="text-xs text-status-stopped flex items-start gap-1.5 bg-red-50/50 p-2.5 rounded-xl border border-red-100">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Guardrail Utama: {tpl.recommendedStopRules[0]}</span>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-3 border-t border-brand-border flex items-center justify-between">
              <span className="text-xs text-brand-slate">
                Ruang: <span className="font-semibold text-brand-navy">{currentSpace.name}</span>
              </span>
              <button type="button"
                onClick={() => handleApply(tpl)}
                className="px-4 py-2 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-full text-xs font-bold transition-all shadow-card flex items-center gap-1.5"
              >
                Gunakan Templat Ini <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
