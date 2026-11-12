/**
 * Adapter Supabase untuk mode tim. Hanya memakai kunci anon; keamanan data bergantung pada RLS di
 * supabase/migrations. Klien disuntik agar dapat diuji tanpa jaringan.
 *
 * Batas: adapter ini diuji dengan klien tiruan dan skemanya diuji dengan PGlite, tetapi belum
 * dijalankan terhadap proyek Supabase sungguhan (tanpa kredensial di lingkungan pengembangan ini).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { hashInviteToken, createInviteToken } from '../core';

export type SpaceRole = 'creator' | 'participant' | 'observer';

export interface TeamSpace {
  id: string;
  name: string;
  role: SpaceRole;
}

export interface TeamDataEntry {
  id: string;
  experimentId: string;
  metricId: string;
  value: number;
  day: number;
  recordedBy: string;
  recordedAt: string;
  verifiedBy: string | null;
  flagged: boolean;
}

export class BackendError extends Error {
  constructor(message: string, readonly code?: string) {
    super(message);
    this.name = 'BackendError';
  }
}

function unwrap<T>(res: { data: T | null; error: { message: string; code?: string } | null }): T {
  if (res.error) throw new BackendError(res.error.message, res.error.code);
  if (res.data === null) throw new BackendError('Respons kosong dari server');
  return res.data;
}

interface EntryRow {
  id: string;
  experiment_id: string;
  metric_id: string;
  value: number;
  day: number;
  recorded_by: string;
  recorded_at: string;
  verified_by: string | null;
  flagged: boolean;
}

export const entryFromRow = (r: EntryRow): TeamDataEntry => ({
  id: r.id,
  experimentId: r.experiment_id,
  metricId: r.metric_id,
  value: r.value,
  day: r.day,
  recordedBy: r.recorded_by,
  recordedAt: r.recorded_at,
  verifiedBy: r.verified_by,
  flagged: r.flagged,
});

export function createTeamBackend(client: SupabaseClient) {
  const userId = async (): Promise<string> => {
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) throw new BackendError('Belum masuk');
    return data.user.id;
  };

  return {
    /** Masuk tanpa kata sandi: tautan sekali pakai dikirim ke email. */
    async signInWithEmail(email: string, redirectTo: string): Promise<void> {
      const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
      if (error) throw new BackendError(error.message, error.code);
    },

    async signOut(): Promise<void> {
      await client.auth.signOut();
    },

    async listSpaces(): Promise<TeamSpace[]> {
      const me = await userId();
      const rows = unwrap(
        await client.from('memberships').select('role, spaces(id, name)').eq('user_id', me),
      ) as unknown as { role: SpaceRole; spaces: { id: string; name: string } | { id: string; name: string }[] }[];
      return rows.flatMap((r) => {
        const sp = Array.isArray(r.spaces) ? r.spaces[0] : r.spaces;
        return sp ? [{ id: sp.id, name: sp.name, role: r.role }] : [];
      });
    },

    /** Membuat undangan. Token mentah dikembalikan sekali dan tidak disimpan di server (hanya hash). */
    async createInvite(spaceId: string, role: 'participant' | 'observer', days: number, maxUses: number): Promise<string> {
      const me = await userId();
      const token = createInviteToken();
      const res = await client.from('invites').insert({
        space_id: spaceId,
        token_hash: await hashInviteToken(token),
        role,
        expires_at: new Date(Date.now() + days * 86_400_000).toISOString(),
        max_uses: maxUses,
        created_by: me,
      });
      if (res.error) throw new BackendError(res.error.message, res.error.code);
      return token;
    },

    async redeemInvite(token: string): Promise<string> {
      return unwrap(await client.rpc('redeem_invite', { p_token: token })) as unknown as string;
    },

    async addDataEntry(input: { experimentId: string; metricId: string; value: number; day: number; notes?: string }): Promise<TeamDataEntry> {
      const me = await userId();
      const row = unwrap(
        await client
          .from('data_entries')
          .insert({ experiment_id: input.experimentId, metric_id: input.metricId, value: input.value, day: input.day, notes: input.notes ?? null, recorded_by: me })
          .select()
          .single(),
      ) as unknown as EntryRow;
      return entryFromRow(row);
    },

    async listDataEntries(experimentId: string): Promise<TeamDataEntry[]> {
      const rows = unwrap(await client.from('data_entries').select('*').eq('experiment_id', experimentId).order('recorded_at')) as unknown as EntryRow[];
      return rows.map(entryFromRow);
    },

    /** Langganan Realtime atas entri baru. Mengembalikan fungsi untuk berhenti berlangganan. */
    subscribeDataEntries(experimentId: string, onInsert: (e: TeamDataEntry) => void): () => void {
      const channel = client
        .channel(`data_entries:${experimentId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'data_entries', filter: `experiment_id=eq.${experimentId}` }, (payload) =>
          onInsert(entryFromRow(payload.new as EntryRow)),
        )
        .subscribe();
      return () => {
        void client.removeChannel(channel);
      };
    },

    async vote(experimentId: string, stance: 'setuju' | 'setuju_dengan_catatan' | 'keberatan', note = ''): Promise<void> {
      const me = await userId();
      const res = await client.from('approvals').upsert({ experiment_id: experimentId, user_id: me, stance, note });
      if (res.error) throw new BackendError(res.error.message, res.error.code);
    },

    async stopExperiment(experimentId: string, reason: string): Promise<void> {
      const res = await client.rpc('stop_experiment', { p_exp: experimentId, p_reason: reason });
      if (res.error) throw new BackendError(res.error.message, res.error.code);
    },

    async verifyEntry(entryId: string): Promise<void> {
      const res = await client.rpc('verify_entry', { p_entry: entryId });
      if (res.error) throw new BackendError(res.error.message, res.error.code);
    },

    async appendLedger(spaceId: string, type: string, payload: unknown): Promise<void> {
      const res = await client.rpc('append_ledger', { p_space: spaceId, p_type: type, p_payload: payload });
      if (res.error) throw new BackendError(res.error.message, res.error.code);
    },

    async verifyLedger(spaceId: string): Promise<{ valid: boolean; brokenAt: number | null; head: string; length: number }> {
      const r = unwrap(await client.rpc('verify_ledger', { p_space: spaceId })) as unknown as {
        valid: boolean;
        broken_at: number | null;
        head: string;
        length: number;
      };
      return { valid: r.valid, brokenAt: r.broken_at, head: r.head, length: r.length };
    },
  };
}

export type TeamBackend = ReturnType<typeof createTeamBackend>;
