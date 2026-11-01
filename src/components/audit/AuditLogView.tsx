/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Download, Search } from 'lucide-react';
import { downloadCsv } from '../../lib/download';
import { notify } from '../../lib/notify';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useApp();
  const [filterQuery, setFilterQuery] = useState('');

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(filterQuery.toLowerCase()) ||
      l.userName.toLowerCase().includes(filterQuery.toLowerCase()) ||
      l.target.toLowerCase().includes(filterQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleExport = () => {
    downloadCsv(`log-audit-cobasepakat-${new Date().toISOString().slice(0, 10)}.csv`, [
      ['Waktu', 'Pelaku', 'Peran', 'Aksi', 'Target', 'Rincian'],
      ...filteredLogs.map((l) => [l.timestamp, l.userName, l.userRole, l.action, l.target, l.details]),
    ]);
    notify(`${filteredLogs.length} entri log diekspor ke CSV.`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-brand-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-brand-navy uppercase tracking-wider mb-1">
              Integritas & Kepatuhan Tata Kelola
            </div>
            <h1 className="text-2xl font-extrabold text-brand-navy">
              Log Audit & Rekam Jejak Tak Terubah
            </h1>
            <p className="text-xs text-brand-slate mt-1">
              Setiap persetujuan kuorum, penguncian desain, penghentian darurat, dan pencatatan keputusan dicatat dengan cap waktu permanen.
            </p>
          </div>

          <div className="flex w-full sm:w-auto items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              aria-label="Cari log audit"
              placeholder="Cari log..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-brand-border bg-brand-surface focus:bg-white outline-none"
            />
          </div>
          <button
            onClick={handleExport}
            disabled={filteredLogs.length === 0}
            className="shrink-0 px-3.5 py-2 bg-brand-navy hover:bg-brand-blue-dark disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Ekspor
          </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-border text-brand-slate">
                <th className="py-3 px-3 font-semibold">Waktu (WIB)</th>
                <th className="py-3 px-3 font-semibold">Pelaku & Peran</th>
                <th className="py-3 px-3 font-semibold">Aksi Sistem</th>
                <th className="py-3 px-3 font-semibold">Objek Target</th>
                <th className="py-3 px-3 font-semibold">Rincian Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-brand-surface">
                  <td className="py-3 px-3 font-mono text-brand-slate whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('id-ID', {
                      dateStyle: 'short',
                      timeStyle: 'medium',
                    })}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-brand-navy">{log.userName}</div>
                    <div className="text-xs text-brand-blue capitalize">
                      {log.userRole.replace(/_/g, ' ')}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-brand-navy bg-brand-surface px-2 py-0.5 rounded-lg border border-brand-border">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-brand-slate font-medium">{log.target}</td>
                  <td className="py-3 px-3 text-brand-slate max-w-xs">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
            <p className="py-10 text-center text-sm text-brand-slate">
              Tidak ada log yang cocok dengan &ldquo;{filterQuery}&rdquo;.
            </p>
          )}
          <p className="pt-3 text-xs text-brand-slate">
            Menampilkan {filteredLogs.length} dari {auditLogs.length} entri.
          </p>
        </div>
      </div>
    </div>
  );
};
