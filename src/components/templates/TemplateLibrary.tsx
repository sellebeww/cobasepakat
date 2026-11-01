/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { TemplateBlueprint } from '../../types';
import {
  Layers,
  Clock,
  Activity,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Building2,
  CheckCircle,
} from 'lucide-react';

export const TemplateLibrary: React.FC = () => {
  const { templates, applyTemplateToCreateIssue, currentSpace } = useApp();

  const handleApply = (tpl: TemplateBlueprint) => {
    if (confirm(`Gunakan templat "${tpl.title}" untuk membuat isu percobaan baru di ${currentSpace.name}?`)) {
      applyTemplateToCreateIssue(tpl);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E2E8F0] shadow-sm space-y-3">
        <div className="text-xs font-bold text-[#2272E8] uppercase tracking-wider">
          Pustaka Desain Percobaan Teruji
        </div>
        <h1 className="text-2xl font-extrabold text-[#153A73]">
          Templat Uji Coba Komunitas Siap Pakai
        </h1>
        <p className="text-xs md:text-sm text-[#5B6780] max-w-3xl leading-relaxed">
          Jangan mulai dari nol. Pilih templat rancangan percobaan yang telah dilengkapi indikator ukuran hasil,
          garis dasar umum, dan aturan berhenti keselamatan. Disesuaikan untuk dinamika RT/RW, koperasi, dan kawasan perumahan.
        </p>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm hover:border-[#2272E8] transition-all flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#2272E8] bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {tpl.category.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-[#5B6780] flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Rekomendasi {tpl.recommendedDuration} Hari
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#153A73] leading-snug">
                {tpl.title}
              </h3>

              <p className="text-xs text-[#5B6780] leading-relaxed">
                {tpl.summary}
              </p>

              <div className="p-3 bg-[#F5F8FC] rounded-2xl border border-[#E2E8F0] space-y-1 text-xs">
                <div className="text-[10px] font-bold text-[#153A73] uppercase tracking-wider">
                  Contoh Pertanyaan Keputusan:
                </div>
                <p className="text-[#153A73] italic">&ldquo;{tpl.sampleQuestion}&rdquo;</p>
              </div>

              {/* Metrics preview */}
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-[#153A73]">Metrik Rekomendasi:</div>
                <div className="flex flex-wrap gap-1.5">
                  {tpl.recommendedMetrics.map((m, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-white border border-[#E2E8F0] text-[#153A73] px-2.5 py-1 rounded-lg"
                    >
                      {m.name} ({m.unit})
                    </span>
                  ))}
                </div>
              </div>

              {/* Guardrails preview */}
              <div className="text-[11px] text-[#DC2626] flex items-start gap-1.5 bg-red-50/50 p-2.5 rounded-xl border border-red-100">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Guardrail Utama: {tpl.recommendedStopRules[0]}</span>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
              <span className="text-[11px] text-[#5B6780]">
                Ruang: <span className="font-semibold text-[#153A73]">{currentSpace.name}</span>
              </span>
              <button
                onClick={() => handleApply(tpl)}
                className="px-4 py-2 bg-[#2272E8] hover:bg-[#1A58B8] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
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
