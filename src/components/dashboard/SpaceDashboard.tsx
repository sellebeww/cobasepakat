/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plus,
  Play,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  FileText,
  Activity,
  Layers,
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
            <div className="flex items-center gap-2 text-xs text-brand-slate">
              <Building2 className="w-3.5 h-3.5 text-brand-blue" />
              <span className="font-semibold text-brand-navy">{currentSpace.name}</span>
              <span>·</span>
              <span>{currentSpace.unitCount} Unit Hunian</span>
              <span>·</span>
              <span>{currentSpace.activeMemberCount} Warga Aktif</span>
            </div>
            <h1 className="text-2xl font-extrabold text-brand-navy">
              Musyawarah Berbasis Percobaan Terukur
            </h1>
            <p className="text-xs text-brand-slate max-w-2xl">
              Selamat datang, <span className="font-semibold text-brand-navy">{currentUser.name}</span>.
              Selesaikan perbedaan pendapat dengan menguji dugaannya secara langsung selama 14 hari dengan kriteria yang disepakati di muka.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenNewIssueModal}
              className="px-4 py-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
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
        <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-brand-blue/40 shadow-md space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-brand-blue text-white text-xs font-bold px-4 py-1 rounded-bl-2xl uppercase tracking-wider">
            Sedang Berjalan di Lapangan
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold text-brand-blue flex items-center gap-1.5">
              <Activity className="w-4 h-4" /> Uji Coba Terjadwal 14 Hari
            </div>
            <h2 className="text-xl font-bold text-brand-navy leading-snug">
              {activeTrialIssue.title}
            </h2>
            <p className="text-xs text-brand-slate">
              Perlakuan: <span className="text-brand-navy font-medium">{activeExp.treatment}</span>
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-brand-surface p-4 rounded-2xl border border-brand-border">
            {activeExp.metrics.map((m) => (
              <div key={m.id} className="text-center">
                <span className="text-xs text-brand-slate block leading-snug">{m.name}</span>
                <span className="text-sm font-mono font-bold text-brand-green">
                  {m.currentValue ?? m.baselineValue} {m.unit}
                </span>
                <span className="text-xs text-brand-slate block">Garis Dasar: {m.baselineValue}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-xs text-brand-slate flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-blue" />
              <span>Hari ke-8 dari 14 Hari · Rapat Evaluasi: {activeExp.evaluationDate}</span>
            </div>

            <button
              onClick={() => {
                setActiveIssueId(activeTrialIssue.id);
                setActiveTab('isu');
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
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
              onClick={() => {
                setActiveIssueId(iss.id);
                setActiveTab('isu');
              }}
              className="bg-white rounded-2xl p-5 border border-brand-border hover:border-brand-blue transition-all cursor-pointer shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 text-xs text-brand-slate">
                  <span className="font-semibold text-brand-navy">{iss.location}</span>
                  <span>·</span>
                  <span>{iss.claims.length} Dugaan Terkumpul</span>
                  <span>·</span>
                  <span>{iss.comments.length} Komentar</span>
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
