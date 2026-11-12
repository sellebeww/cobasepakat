import { Copy, Link2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useI18n } from '../../i18n';
import { buildInviteUrl, type InviteRole } from '../../core';
import { createLocalInvite } from '../../lib/invites';
import { notify } from '../../lib/notify';

export function InviteModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [role, setRole] = useState<InviteRole>('participant');
  const [days, setDays] = useState(7);
  const [maxUses, setMaxUses] = useState(5);
  const [url, setUrl] = useState('');
  const urlRef = useRef<HTMLInputElement>(null);

  const create = async () => {
    const { token } = await createLocalInvite(role, days, maxUses);
    setUrl(buildInviteUrl(window.location.origin, token));
  };
  const copy = () =>
    navigator.clipboard
      .writeText(url)
      .then(() => notify('Tautan undangan disalin.'))
      .catch(() => {
        urlRef.current?.select();
        notify('Salin manual dari kolom tautan.', 'warning');
      });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="invite-title">
      <div className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <h2 id="invite-title" className="flex items-center gap-2 text-lg font-extrabold text-brand-navy">
            <Link2 className="h-5 w-5" aria-hidden="true" /> {t('invite.title')}
          </h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="rounded-lg p-1 hover:bg-brand-surface">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-xs text-brand-slate">
          Tautan berisi token acak 192 bit. Hanya hash token yang disimpan. Di mode demo, undangan hanya berlaku di peramban ini; di mode tim, server yang memeriksa dan menebusnya.
        </p>
        <div>
          <label htmlFor="inv-role" className="mb-1 block text-xs font-bold text-brand-navy">Peran</label>
          <select id="inv-role" value={role} onChange={(e) => setRole(e.target.value as InviteRole)} className="w-full rounded-xl border border-brand-border p-2.5 text-sm">
            <option value="participant">Peserta (menulis dugaan, memberi suara, mencatat data)</option>
            <option value="observer">Pengamat (hanya membaca)</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="inv-days" className="mb-1 block text-xs font-bold text-brand-navy">Berlaku (hari)</label>
            <input id="inv-days" type="number" min={1} max={30} value={days} onChange={(e) => setDays(Math.min(30, Math.max(1, Number(e.target.value) || 1)))} className="w-full rounded-xl border border-brand-border p-2.5 text-sm" />
          </div>
          <div>
            <label htmlFor="inv-uses" className="mb-1 block text-xs font-bold text-brand-navy">Maks. pemakaian</label>
            <input id="inv-uses" type="number" min={1} max={100} value={maxUses} onChange={(e) => setMaxUses(Math.min(100, Math.max(1, Number(e.target.value) || 1)))} className="w-full rounded-xl border border-brand-border p-2.5 text-sm" />
          </div>
        </div>
        <button type="button" onClick={create} className="w-full rounded-full bg-brand-blue py-2.5 text-sm font-bold text-white">
          {t('invite.create')}
        </button>
        {url && (
          <div className="space-y-2">
            <label htmlFor="inv-url" className="block text-xs font-bold text-brand-navy">Tautan undangan</label>
            <div className="flex gap-2">
              <input id="inv-url" ref={urlRef} readOnly value={url} data-testid="invite-url" className="min-w-0 flex-1 rounded-xl border border-brand-border bg-brand-surface p-2.5 font-mono text-xs" />
              <button type="button" onClick={copy} aria-label="Salin tautan" className="rounded-xl bg-brand-navy px-3 text-white">
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
