/**
 * Undangan mode demo (lokal). Memakai logika yang sama dengan server (src/core/invite):
 * hanya hash token yang disimpan, ada kedaluwarsa, kuota pemakaian, dan pencabutan.
 * Di mode tim, tabel `invites` dan fungsi `redeem_invite` di Supabase menggantikan penyimpanan ini.
 */
import { type InviteRecord, type InviteRole, type InviteState, createInviteToken, hashInviteToken, inviteState } from '../core';

const KEY = 'cobasepakat_invites_v1';

function read(): InviteRecord[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
function write(list: InviteRecord[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* penyimpanan penuh atau diblokir */
  }
}

export async function createLocalInvite(role: InviteRole, days: number, maxUses: number, now = new Date()) {
  const token = createInviteToken();
  const rec: InviteRecord = {
    tokenHash: await hashInviteToken(token),
    role,
    expiresAt: new Date(now.getTime() + days * 86_400_000).toISOString(),
    maxUses,
    usedCount: 0,
  };
  write([rec, ...read()]);
  return { token, record: rec };
}

export async function checkLocalInvite(token: string, now = new Date()): Promise<{ state: InviteState | 'tidak_dikenal'; role?: InviteRole }> {
  const h = await hashInviteToken(token);
  const rec = read().find((r) => r.tokenHash === h);
  if (!rec) return { state: 'tidak_dikenal' };
  return { state: inviteState(rec, now.toISOString()), role: rec.role };
}

export async function redeemLocalInvite(token: string, now = new Date()): Promise<{ ok: boolean; state: InviteState | 'tidak_dikenal'; role?: InviteRole }> {
  const h = await hashInviteToken(token);
  const list = read();
  const rec = list.find((r) => r.tokenHash === h);
  if (!rec) return { ok: false, state: 'tidak_dikenal' };
  const state = inviteState(rec, now.toISOString());
  if (state !== 'valid') return { ok: false, state, role: rec.role };
  rec.usedCount += 1;
  write(list);
  return { ok: true, state: 'valid', role: rec.role };
}

export function revokeAllLocalInvites(now = new Date()) {
  write(read().map((r) => (r.revokedAt ? r : { ...r, revokedAt: now.toISOString() })));
}
