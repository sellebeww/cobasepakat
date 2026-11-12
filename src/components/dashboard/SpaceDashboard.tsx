/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plus,
  Clock,
  Building2,
  Activity,
} from 'lucide-react';

interface SpaceDashboardProps {
  onOpenNewIssueModal: () => void;
}

export const SpaceDashboard: React.FC<SpaceDashboardProps> = ({
  onOpenNewIssueModal,
}) => {
  const {
    currentSpace,
    issues,
    currentUser,
    setActiveIssueId,
    setActiveTab,
    experiments,
  } = useApp();

  const spaceIssues = issues.filter((i) => i.spaceId === currentSpace.id);
  const activeTrialIssue = spaceIssues.find((i) => i.status === 'percobaan_berjalan');
  const activeExp = activeTrialIssue?.activeExperimentId
    ? experiments[activeTrialIssue.activeExperimentId]
    : null;

  return (
    <div className="space-y-6">
      {/* Space Hero Welcome Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-brand-border shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-brand-slate">
              <Building2 className="w-3.5 h-3.5 text-brand-blue" />
              <span className="font-semibold text-brand-navy">{currentSpace.name}</span>
              <span>·</span>
              <span className="whitespace-nowrap">{currentSpace.unitCount} Unit Hunian</span>
              <span>·</span>
              <span className="whitespace-nowrap">{currentSpace.activeMemberCount} Warga Aktif</span>
            </div>
            <h1 className="text-3xl font-extrabold text-brand-navy">
              Musyawarah Berbasis Percobaan Terukur
            </h1>
            <p className="text-xs text-brand-slate max-w-2xl">
              Selamat datang, <span className="font-semibold text-brand-navy">{currentUser.name}</span>.
              Selesaikan perbedaan pendapat dengan menguji dugaannya secara langsung selama 14 hari dengan kriteria yang disepakati di muka.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button type="button"
              onClick={onOpenNewIssueModal}
              className="px-4 py-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-full text-xs font-bold transition-all shadow-card flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Buka Isu Keputusan Baru
            </button>
          </div>
        </div>

        {/* 4 Quick Stat Strips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-brand-surface rounded-2xl border border-brand-border">
            <div className="text-xs text-brand-slate font-medium">Percobaan Berjalan</div>
            <div className="text-lg font-extrabold font-mono text-brand-blue mt-0.5">
              {spaceIssues.filter((i) => i.status === 'percobaan_berjalan').length} Aktif
            </div>
          </div>
          <div className="p-3 bg-brand-surface rounded-2xl border border-brand-border">
            <div className="text-xs text-brand-slate font-medium">Kuorum Persetujuan</div>
            <div className="text-lg font-extrabold font-mono text-brand-green mt-0.5">
              {currentSpace.rules.quorumPercentage}% Wajib
            </div>
          </div>
          <div className="p-3 bg-brand-surface rounded-2xl border border-brand-border">
            <div className="text-xs text-brand-slate font-medium">Durasi Maksimum</div>
            <div className="text-lg font-extrabold font-mono text-brand-navy mt-0.5">
              {currentSpace.rules.maxExperimentDays} Hari
            </div>
          </div>
          <div className="p-3 bg-brand-surface rounded-2xl border border-brand-border">
            <div className="text-xs text-brand-slate font-medium">Plafon Anggaran Mandiri</div>
            <div className="text-lg font-extrabold font-mono text-brand-navy mt-0.5">
              Rp {currentSpace.rules.budgetCeilingWithoutBoard.toLocaleString('id-ID')}
            </div>
          </div>
        </div>
      </div>

      {/* Spotlight: Active Experiment Running Right Now */}
      {activeTrialIssue && activeExp && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-brand-blue/40 shadow-md space-y-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold text-brand-blue flex items-center gap-1.5">
                <Activity className="w-4 h-4" /> Uji Coba Terjadwal 14 Hari
              </div>
              <span className="inline-flex items-center gap-1.5 bg-brand-blue/10 text-brand-blue text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                Sedang Berjalan di Lapangan
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-brand-navy leading-snug">
              {activeTrialIssue.title}
            </h2>
            <p className="text-xs text-brand-slate leading-relaxed">
              Perlakuan: <span className="text-brand-navy font-medium">{activeExp.treatment}</span>
            </p>
          </div>

          {/* Quick Metrics: label on top, value pinned to the bottom so every tile lines up */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {activeExp.metrics.map((m) => {
              const current = m.currentValue ?? m.baselineValue;
              const lowerIsBetter = m.direction === 'turun_lebih_baik';
              const onTarget = lowerIsBetter ? current <= m.thresholdValue : current >= m.thresholdValue;
              return (
                <div
                  key={m.id}
                  className="flex flex-col justify-between gap-3 p-4 bg-brand-surface rounded-2xl border border-brand-border"
                >
                  <span className="text-xs text-brand-slate leading-snug">{m.name}</span>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-xl font-mono font-extrabold ${onTarget ? 'text-brand-green' : 'text-amber-600'}`}>
                        {current}
                      </span>
                      <span className="text-xs text-brand-slate">{m.unit}</span>
                    </div>
                    <div className="text-xs text-brand-slate space-y-0.5">
                      <div>
                        Garis Dasar <span className="font-mono font-semibold text-brand-navy">{m.baselineValue}</span>
                      </div>
                      <div className="whitespace-nowrap">
                        Target {lowerIsBetter ? '≤' : '≥'}{' '}
                        <span className="font-mono font-semibold text-brand-navy">{m.thresholdValue}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="text-xs text-brand-slate flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-blue" />
              <span>Hari ke-8 dari 14 Hari · Rapat Evaluasi: {activeExp.evaluationDate}</span>
            </div>

            <button type="button"
              onClick={() => {
                setActiveIssueId(activeTrialIssue.id);
                setActiveTab('isu');
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-full text-xs font-bold transition-all shadow-card flex items-center justify-center gap-2"
            >
              Buka Pusat Kendali & Catat Data Lapangan &rarr;
            </button>
          </div>
        </div>
      )}

      {/* List of Community Issues */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-brand-navy">
            Daftar Isu & Perbedaan Pendapat Komunitas
          </h2>
          <span className="text-xs text-brand-slate">{spaceIssues.length} Isu Terdaftar</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {spaceIssues.map((iss) => (
            <div
              key={iss.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                setActiveIssueId(iss.id);
                setActiveTab('isu');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveIssueId(iss.id);
                  setActiveTab('isu');
                }
              }}
              className="bg-white rounded-3xl p-5 border border-brand-border hover:border-brand-blue transition-all cursor-pointer shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-brand-slate">
                  <span className="font-semibold text-brand-navy">{iss.location}</span>
                  <span>·</span>
                  <span className="whitespace-nowrap">{iss.claims.length} Dugaan Terkumpul</span>
                  <span>·</span>
                  <span className="whitespace-nowrap">{iss.comments.length} Komentar</span>
                </div>

                <h3 className="text-base font-bold text-brand-navy hover:text-brand-blue transition-colors">
                  {iss.title}
                </h3>

                <p className="text-xs text-brand-slate line-clamp-2">{iss.context}</p>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${
                    iss.status === 'percobaan_berjalan'
                      ? 'bg-blue-50 text-brand-blue border border-blue-200'
                      : iss.status === 'keputusan_tercatat'
                      ? 'bg-emerald-50 text-brand-green border border-emerald-200'
                      : 'bg-brand-surface text-brand-slate'
                  }`}
                >
                  {iss.status.replace(/_/g, ' ')}
                </span>
                <span className="text-xs font-semibold text-brand-blue flex items-center gap-1">
                  Lihat Detail &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
