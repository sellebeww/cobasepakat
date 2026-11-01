/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Clock, Search, UserCheck } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E2E8F0] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-[#153A73] uppercase tracking-wider mb-1">
              Integritas & Kepatuhan Tata Kelola
            </div>
            <h1 className="text-2xl font-extrabold text-[#153A73]">
              Log Audit & Rekam Jejak Tak Terubah
            </h1>
            <p className="text-xs text-[#5B6780] mt-1">
              Setiap persetujuan kuorum, penguncian desain, penghentian darurat, dan pencatatan keputusan dicatat dengan cap waktu permanen.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari log..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F5F8FC] focus:bg-white outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#5B6780]">
                <th className="py-3 px-3 font-semibold">Waktu (WIB)</th>
                <th className="py-3 px-3 font-semibold">Pelaku & Peran</th>
                <th className="py-3 px-3 font-semibold">Aksi Sistem</th>
                <th className="py-3 px-3 font-semibold">Objek Target</th>
                <th className="py-3 px-3 font-semibold">Rincian Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F5F8FC]">
                  <td className="py-3 px-3 font-mono text-[#5B6780] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('id-ID', {
                      dateStyle: 'short',
                      timeStyle: 'medium',
                    })}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-[#153A73]">{log.userName}</div>
                    <div className="text-[10px] text-[#2272E8] capitalize">
                      {log.userRole.replace(/_/g, ' ')}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-[#153A73] bg-[#F5F8FC] px-2 py-0.5 rounded-lg border border-[#E2E8F0]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#5B6780] font-medium">{log.target}</td>
                  <td className="py-3 px-3 text-[#5B6780] max-w-xs">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
