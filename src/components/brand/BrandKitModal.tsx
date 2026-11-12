/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { useState } from 'react';
import { CobaSepakatLogo } from './CobaSepakatLogo';
import { X, Download, Copy, Check, Palette, Sparkles, } from 'lucide-react';

interface BrandKitModalProps {
  onClose: () => void;
}

export const BrandKitModal: React.FC<BrandKitModalProps> = ({ onClose }) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const colors = [
    { name: 'Brand Navy', hex: '#153A73', role: 'Warna teks utama, judul, & centang komitmen' },
    { name: 'Brand Blue', hex: '#2272E8', role: 'Warna primer, tombol utama, & status berjalan' },
    { name: 'Brand Green', hex: '#2FA882', role: 'Aksen sepakat, keberhasilan, & harmoni' },
    { name: 'Brand Surface', hex: '#F5F8FC', role: 'Latar belakang kanvas sejuk & netral' },
    { name: 'Status Waspada', hex: '#F59E0B', role: 'Indikator peringatan batas' },
    { name: 'Status Henti', hex: '#DC2626', role: 'Indikator aturan berhenti kritis' },
  ];

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const _handleDownloadLogo = () => {
    const a = document.createElement('a');
    a.href = '/brand/cobasepakat-logo.png';
    a.download = 'CobaSepakat_Embrace_Check_Logo.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl border border-brand-border my-8 max-h-[92vh] flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-brand-border pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-brand-navy">Logo & Brand Kit Resmi CobaSepakat</h2>
              <p className="text-xs text-brand-slate">
                Aset identitas visual, filosofi logo, dan token desain standar WCAG AA.
              </p>
            </div>
          </div>
          <button type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-600 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 space-y-6 pr-1">
          {/* Logo Showcase Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Light canvas */}
            <div className="p-6 bg-brand-surface rounded-2xl border border-brand-border flex flex-col items-center justify-center gap-3 text-center">
              <span className="text-xs font-bold text-brand-slate uppercase tracking-wider">
                Emblem Terpotong Rapat (Tightly Cropped, No-BG)
              </span>
              <div className="p-2 bg-white/60 rounded-2xl border border-dashed border-brand-border">
                <CobaSepakatLogo variant="icon" size="xl" />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                <a
                  href="/brand/cobasepakat-emblem-nobg.png"
                  download="cobasepakat-emblem-nobg.png"
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-brand-border text-brand-navy rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-brand-blue" /> Unduh Emblem (No-BG)
                </a>
                <a
                  href="/brand/cobasepakat-horizontal-nobg.png"
                  download="cobasepakat-horizontal-nobg.png"
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-brand-border text-brand-navy rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-brand-green" /> Horizontal (No-BG)
                </a>
              </div>
            </div>

            {/* Dark canvas */}
            <div className="p-6 bg-brand-navy rounded-2xl border border-brand-navy flex flex-col items-center justify-center gap-3 text-center text-white">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Versi Kontras / Gelap (No-BG)
              </span>
              <div className="p-2 bg-white/10 rounded-2xl border border-white/20">
                <CobaSepakatLogo variant="white" size="lg" showTagline={true} />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                <a
                  href="/brand/cobasepakat-emblem-white-nobg.png"
                  download="cobasepakat-emblem-white-nobg.png"
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-300" /> Emblem Putih (No-BG)
                </a>
                <a
                  href="/brand/cobasepakat-logo-nobg.png"
                  download="cobasepakat-logo-nobg.png"
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-blue-300" /> Full Logo (No-BG)
                </a>
              </div>
            </div>
          </div>

          {/* Logo Philosophy */}
          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-1.5 text-xs text-brand-navy">
            <div className="font-bold text-brand-blue uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Makna Filosofis Logo
            </div>
            <p className="leading-relaxed">
              Dua sosok sederhana—satu <strong>Biru</strong> (#2272E8) dan satu <strong>Hijau</strong> (#2FA882)—saling merangkul membentuk lingkaran harmoni, dengan tanda centang <strong>Navy</strong> (#153A73) di tengahnya. Maknanya: dua pihak dengan pandangan berbeda dirangkul oleh satu kesepakatan yang teruji secara faktual. Wordmark tanpa spasi: <span className="font-bold text-brand-navy">Coba</span> dan <span className="font-bold text-brand-green">Sepakat</span>.
            </p>
          </div>

          {/* Color Palette Tokens */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-brand-navy">Design Token & Palet Warna</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {colors.map((c) => (
                <div
                  key={c.hex}
                  role="button"
                  tabIndex={0}
                  aria-label={`Salin warna ${c.name} ${c.hex}`}
                  onClick={() => copyColor(c.hex)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      copyColor(c.hex);
                    }
                  }}
                  className="p-3 rounded-2xl border border-brand-border hover:border-brand-blue cursor-pointer bg-white transition-all space-y-2 group"
                >
                  <div
                    className="h-10 rounded-xl w-full border border-black/5 shadow-inner"
                    style={{ backgroundColor: c.hex }}
                  />
                  <div>
                    <div className="text-xs font-bold text-brand-navy group-hover:text-brand-blue transition-colors flex items-center justify-between">
                      <span>{c.name}</span>
                      {copiedHex === c.hex ? (
                        <Check className="w-3.5 h-3.5 text-brand-green" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-600 group-hover:text-brand-navy" />
                      )}
                    </div>
                    <div className="text-xs font-mono font-semibold text-slate-500">{c.hex}</div>
                    <div className="text-xs text-brand-slate line-clamp-1 mt-0.5">{c.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography Spec */}
          <div className="p-4 bg-brand-surface rounded-2xl border border-brand-border space-y-2 text-xs">
            <div className="font-bold text-brand-navy">Standar Tipografi CobaSepakat</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-brand-slate block">Judul & Isi Teks</span>
                <span className="font-bold text-sm text-brand-navy">Plus Jakarta Sans</span>
                <p className="text-xs text-brand-slate">Sans-serif geometris membulat, hangat dan ramah.</p>
              </div>
              <div>
                <span className="text-xs text-brand-slate block">Data & Metrik Angka</span>
                <span className="font-mono font-bold text-sm text-brand-navy">JetBrains Mono</span>
                <p className="text-xs text-brand-slate">Tabular numerals akurat untuk grafik & durasi stopwatch.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-brand-border flex justify-end shrink-0">
          <button type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-brand-navy hover:bg-brand-blue-dark text-white text-xs font-semibold rounded-xl"
          >
            Tutup Brand Kit
          </button>
        </div>
      </div>
    </div>
  );
};
