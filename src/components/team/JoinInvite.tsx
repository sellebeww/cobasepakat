import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n';
import { useApp } from '../../context/AppContext';
import type { InviteRole, InviteState } from '../../core';
import { checkLocalInvite, redeemLocalInvite } from '../../lib/invites';
import { notify } from '../../lib/notify';

const MESSAGE: Record<InviteState | 'tidak_dikenal', string> = {
  valid: 'Undangan valid.',
  kedaluwarsa: 'Undangan ini sudah kedaluwarsa. Minta tautan baru kepada pembuat ruang.',
  dicabut: 'Undangan ini sudah dicabut oleh pembuat ruang.',
  habis: 'Kuota pemakaian undangan ini sudah habis.',
  tidak_dikenal: 'Undangan tidak dikenal di peramban ini. Di mode demo, undangan hanya berlaku di peramban tempat tautan dibuat.',
};

const ROLE_LABEL: Record<InviteRole, string> = { participant: 'peserta', observer: 'pengamat (hanya baca)' };

export function JoinInvite({ token }: { token: string }) {
  const { t } = useI18n();
  const { users, setCurrentUser, setAppMode, setActiveTab } = useApp();
  const [state, setState] = useState<InviteState | 'tidak_dikenal' | null>(null);
  const [role, setRole] = useState<InviteRole | undefined>();

  useEffect(() => {
    let live = true;
    checkLocalInvite(token).then((r) => {
      if (!live) return;
      setState(r.state);
      setRole(r.role);
    });
    return () => {
      live = false;
    };
  }, [token]);

  const join = async () => {
    const r = await redeemLocalInvite(token);
    if (!r.ok) {
      setState(r.state);
      return;
    }
    const persona = users.find((u) => u.role === (r.role === 'observer' ? 'pemantau_independen' : 'anggota'));
    if (persona) setCurrentUser(persona);
    notify(`Bergabung sebagai ${ROLE_LABEL[r.role ?? 'participant']}.`);
    window.location.hash = '#/demo/beranda';
    setAppMode('demo');
    setActiveTab('beranda');
  };

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center gap-4 px-4 py-10" data-testid="join-page">
      <h1 className="text-2xl font-extrabold text-brand-navy">{t('join.title')}</h1>
      {state === null ? (
        <p role="status" className="text-sm text-brand-slate">Memeriksa undangan...</p>
      ) : (
        <>
          <p role="status" className="text-sm text-brand-navy" data-testid="join-status">
            {MESSAGE[state]}
            {state === 'valid' && role ? ` Anda diundang sebagai ${ROLE_LABEL[role]}.` : ''}
          </p>
          {state === 'valid' && (
            <button type="button" onClick={join} className="rounded-full bg-brand-blue py-3 text-sm font-bold text-white">
              {t('join.button')}
            </button>
          )}
          <p className="text-xs text-brand-slate">
            Mode demo memakai data fiktif di peramban ini dan memilih persona contoh sesuai peran undangan. Pada mode tim (Supabase), tautan yang sama ditebus lewat server setelah Anda masuk dengan email.
          </p>
        </>
      )}
    </main>
  );
}
