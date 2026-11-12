/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

// Blob URLs (not data: URIs) so '#' or newlines in cell text can't truncate the file.
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = `﻿${rows.map((r) => r.map(cell).join(',')).join('\r\n')}`;
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
