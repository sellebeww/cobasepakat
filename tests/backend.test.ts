import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { backendConfig } from '../src/backend/config';
import { BackendError, createTeamBackend, entryFromRow } from '../src/backend/teamBackend';
import { hashInviteToken } from '../src/core';

describe('backendConfig', () => {
  it('nonaktif tanpa URL/kunci atau dengan URL tidak aman', () => {
    expect(backendConfig({})).toBeNull();
    expect(backendConfig({ VITE_SUPABASE_URL: 'https://x.supabase.co' })).toBeNull();
    expect(backendConfig({ VITE_SUPABASE_URL: 'http://x.example.com', VITE_SUPABASE_ANON_KEY: 'k' })).toBeNull();
    expect(backendConfig({ VITE_SUPABASE_URL: 'bukan url', VITE_SUPABASE_ANON_KEY: 'k' })).toBeNull();
  });
  it('aktif dengan https atau localhost', () => {
    expect(backendConfig({ VITE_SUPABASE_URL: ' https://x.supabase.co ', VITE_SUPABASE_ANON_KEY: ' k ' })).toEqual({ url: 'https://x.supabase.co', anonKey: 'k' });
    expect(backendConfig({ VITE_SUPABASE_URL: 'http://localhost:54321', VITE_SUPABASE_ANON_KEY: 'k' })).not.toBeNull();
  });
});

/** Klien tiruan berantai: mencatat panggilan dan mengembalikan hasil yang diatur. */
function fakeClient(result: { data: unknown; error: { message: string; code?: string } | null }, user: string | null = 'u1') {
  const calls: { op: string; args: unknown[] }[] = [];
  const chain: Record<string, unknown> = {};
  for (const m of ['select', 'eq', 'order', 'insert', 'upsert', 'single']) {
    chain[m] = (...args: unknown[]) => {
      calls.push({ op: m, args });
      return chain;
    };
  }
  // biome-ignore lint/suspicious/noThenProperty: klien Supabase asli juga thenable
  chain.then = (resolve: (v: unknown) => unknown) => resolve(result);
  const client = {
    auth: {
      getUser: async () => ({ data: { user: user ? { id: user } : null }, error: null }),
      signInWithOtp: vi.fn(async () => ({ error: null })),
      signOut: vi.fn(async () => ({ error: null })),
    },
    from: (t: string) => {
      calls.push({ op: 'from', args: [t] });
      return chain;
    },
    rpc: async (fn: string, args: unknown) => {
      calls.push({ op: 'rpc', args: [fn, args] });
      return result;
    },
    channel: () => ({ on: () => ({ subscribe: () => 'ch' }) }),
    removeChannel: vi.fn(),
  };
  return { client: client as unknown as SupabaseClient, calls, raw: client };
}

describe('teamBackend', () => {
  it('pemetaan baris entri', () => {
    expect(entryFromRow({ id: 'a', experiment_id: 'e', metric_id: 'm', value: 3.2, day: 2, recorded_by: 'u', recorded_at: 't', verified_by: null, flagged: false })).toEqual({
      id: 'a', experimentId: 'e', metricId: 'm', value: 3.2, day: 2, recordedBy: 'u', recordedAt: 't', verifiedBy: null, flagged: false,
    });
  });
  it('createInvite menyimpan hash, bukan token', async () => {
    const { client, calls } = fakeClient({ data: null, error: null });
    const token = await createTeamBackend(client).createInvite('space1', 'participant', 7, 3);
    const insert = calls.find((c) => c.op === 'insert')!.args[0] as Record<string, unknown>;
    expect(insert.token_hash).toBe(await hashInviteToken(token));
    expect(JSON.stringify(insert)).not.toContain(token);
    expect(insert).toMatchObject({ space_id: 'space1', role: 'participant', max_uses: 3, created_by: 'u1' });
  });
  it('addDataEntry mengirim recorded_by dari sesi, bukan dari masukan', async () => {
    const row = { id: 'a', experiment_id: 'e', metric_id: 'm', value: 1, day: 1, recorded_by: 'u1', recorded_at: 't', verified_by: null, flagged: false };
    const { client, calls } = fakeClient({ data: row, error: null });
    const e = await createTeamBackend(client).addDataEntry({ experimentId: 'e', metricId: 'm', value: 1, day: 1 });
    expect(e.recordedBy).toBe('u1');
    expect((calls.find((c) => c.op === 'insert')!.args[0] as Record<string, unknown>).recorded_by).toBe('u1');
  });
  it('error server menjadi BackendError dengan pesan dan kode', async () => {
    const { client } = fakeClient({ data: null, error: { message: 'new row violates row-level security policy', code: '42501' } });
    await expect(createTeamBackend(client).addDataEntry({ experimentId: 'e', metricId: 'm', value: 1, day: 1 })).rejects.toMatchObject({ name: 'BackendError', code: '42501' });
    await expect(createTeamBackend(client).redeemInvite('x')).rejects.toBeInstanceOf(BackendError);
  });
  it('belum masuk ditolak sebelum menyentuh server', async () => {
    const { client, calls } = fakeClient({ data: [], error: null }, null);
    await expect(createTeamBackend(client).listSpaces()).rejects.toThrow('Belum masuk');
    expect(calls.length).toBe(0);
  });
  it('listSpaces meratakan relasi', async () => {
    const { client } = fakeClient({ data: [{ role: 'creator', spaces: { id: 's1', name: 'A' } }, { role: 'observer', spaces: [{ id: 's2', name: 'B' }] }, { role: 'participant', spaces: null }], error: null });
    expect(await createTeamBackend(client).listSpaces()).toEqual([{ id: 's1', name: 'A', role: 'creator' }, { id: 's2', name: 'B', role: 'observer' }]);
  });
  it('verifyLedger memetakan hasil RPC; subscribe mengembalikan fungsi berhenti', async () => {
    const { client, raw } = fakeClient({ data: { valid: false, broken_at: 4, head: 'h', length: 9 }, error: null });
    const b = createTeamBackend(client);
    expect(await b.verifyLedger('s')).toEqual({ valid: false, brokenAt: 4, head: 'h', length: 9 });
    const off = b.subscribeDataEntries('e', () => undefined);
    off();
    expect(raw.removeChannel).toHaveBeenCalled();
  });
});
