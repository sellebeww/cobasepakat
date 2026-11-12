/**
 * Laporan PDF percobaan dan keputusan. Dibangun penuh di peramban (jsPDF dimuat saat dibutuhkan).
 * Font bawaan PDF hanya mendukung Latin dasar, jadi simbol khusus ditulis sebagai teks biasa.
 */
import { type AcceptanceSummary, type RuleResult, METHOD_LIMITATIONS } from '../core';
import type { Decision, Experiment, Issue } from '../types';
import { describeMeasured } from '../components/results/format';

export interface ReportInput {
  spaceName: string;
  issue: Issue;
  experiment: Experiment;
  result: RuleResult;
  ruleDerived: boolean;
  stopStatus: { description: string; triggered: boolean; reason?: string }[];
  decision?: Decision;
  acceptance?: AcceptanceSummary;
  ledgerHead?: string;
  generatedAt: string;
  isDemo: boolean;
}

const ascii = (s: string) =>
  [...s.replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-')]
    .map((ch) => {
      const c = ch.charCodeAt(0);
      return c === 9 || c === 10 || c === 13 || (c >= 32 && c <= 126) || (c >= 160 && c <= 255) ? ch : '?';
    })
    .join('');

export async function buildReportPdf(input: ReportInput): Promise<Uint8Array> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  const M = 16;
  let y = M;
  const ensure = (h: number) => {
    if (y + h > 285) {
      doc.addPage();
      y = M;
    }
  };
  const text = (s: string, size = 10, bold = false, gap = 1.5) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(ascii(s), W - 2 * M) as string[];
    for (const l of lines) {
      ensure(size * 0.45);
      doc.text(l, M, y);
      y += size * 0.45;
    }
    y += gap;
  };
  const h = (s: string) => {
    y += 2;
    ensure(10);
    text(s, 12, true, 1);
  };

  text('Laporan Percobaan CobaSepakat', 17, true, 2);
  if (input.isDemo) text('DATA DEMO FIKTIF. Dokumen ini hanya contoh dan tidak mewakili kejadian nyata.', 10, true, 2);
  text(`Ruang: ${input.spaceName}`);
  text(`Dibuat: ${new Date(input.generatedAt).toLocaleString('id-ID')}`);

  h('Pertanyaan keputusan');
  text(input.issue.title);

  h('Desain percobaan');
  const e = input.experiment;
  text(`Perlakuan: ${e.treatment}`);
  text(`Lingkup: ${e.scope}`);
  text(`Periode: ${e.startDate} s/d ${e.endDate} (${e.durationDays} hari). Status: ${e.status}.`);
  text(`Aturan keputusan (disepakati di muka): ${e.decisionRule}`);
  if (input.ruleDerived) text('Catatan: kriteria diturunkan otomatis dari ambang metrik karena belum ada kriteria terstruktur.', 9);

  h('Hasil terhadap kriteria (dengan ketidakpastian)');
  text(`Kesimpulan data: ${input.result.verdict.replace(/_/g, ' ')}. ${input.result.summary}`);
  for (const c of input.result.criteria) {
    const unit = e.metrics.find((m) => m.id === c.criterion.metricId)?.unit ?? '';
    const d = describeMeasured(c, unit);
    text(`- ${c.metricName}: taksiran ${d.value}; interval 95% ${d.interval}; syarat ${d.target}; sampel ${c.days} hari / ${c.observations} data; status ${c.verdict.replace(/_/g, ' ')}.`, 9.5);
  }

  h('Aturan berhenti');
  for (const s of input.stopStatus) text(`- ${s.description}: ${s.triggered ? `TERPICU${s.reason ? ` (${s.reason})` : ''}` : 'tidak terpicu'}`, 9.5);
  if (e.stoppedReason) text(`Percobaan dihentikan: ${e.stoppedReason}`, 10, true);

  if (input.decision) {
    h('Keputusan resmi');
    const d = input.decision;
    text(d.title, 10.5, true);
    text(`Hasil: ${d.outcome.replace(/_/g, ' ')}. Dicatat ${new Date(d.decidedAt).toLocaleString('id-ID')} oleh ${d.decidedBy}.`);
    text(`Alasan: ${d.reason}`);
    text(`Pernyataan: ${d.officialStatement}`);
    if (d.ledgerHash) text(`Hash catatan di riwayat berantai: ${d.ledgerHash}`, 8.5);
  }

  if (input.acceptance) {
    h('Penerimaan warga');
    text(input.acceptance.note);
    if (input.acceptance.n > 0 && input.acceptance.acceptShare !== null) {
      const iv = input.acceptance.acceptInterval;
      text(`Skor rata-rata ${input.acceptance.meanScore?.toFixed(1)}/5; menerima ${Math.round(input.acceptance.acceptShare * 100)}% (interval 95% ${iv ? `${Math.round(iv.lower * 100)}-${Math.round(iv.upper * 100)}%` : '-'}; n = ${input.acceptance.n}).`);
    }
  }

  h('Batasan metode');
  for (const l of METHOD_LIMITATIONS) text(`- ${l}`, 9);
  if (input.ledgerHead) {
    h('Jangkar integritas');
    text(`Hash ujung riwayat saat laporan dibuat: ${input.ledgerHead}`, 8.5);
  }
  text('Hash bukan tanda tangan digital. Simpan nilai ini di tempat lain agar pemotongan riwayat dapat terdeteksi.', 8.5);

  return new Uint8Array(doc.output('arraybuffer'));
}

export function downloadPdf(filename: string, bytes: Uint8Array) {
  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
