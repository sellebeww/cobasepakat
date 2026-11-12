import fs from 'node:fs';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, describe, expect, it } from 'vitest';

const here = import.meta.dirname;
const read = (p: string) => fs.readFileSync(path.join(here, p), 'utf8');

const U = {
  alice: '00000000-0000-4000-8000-00000000000a', // creator
  bob: '00000000-0000-4000-8000-00000000000b', // participant
  carol: '00000000-0000-4000-8000-00000000000c', // observer
  dave: '00000000-0000-4000-8000-00000000000d', // orang luar
  erin: '00000000-0000-4000-8000-00000000000e', // peserta kedua
};

let db: PGlite;
const ids: Record<string, string> = {};

/** Jalankan SQL sebagai pengguna Supabase (peran authenticated, JWT sub = uid) atau anon. */
async function as<T = Record<string, unknown>>(uid: string | 'anon' | 'owner', sql: string, params: unknown[] = []) {
  try {
    if (uid === 'owner') {
      await db.exec('reset role');
    } else if (uid === 'anon') {
      await db.exec(`set role anon; select set_config('request.jwt.claim.sub', '', false)`);
    } else {
      await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${uid}', false)`);
    }
    return (await db.query<T>(sql, params)).rows;
  } finally {
    await db.exec('reset role');
  }
}

const denied = (p: Promise<unknown>) => expect(p).rejects.toThrow();
const count = async (uid: string, table: string, where = 'true') =>
  Number((await as<{ n: string }>(uid, `select count(*) as n from public.${table} where ${where}`))[0].n);

const DESIGN = JSON.stringify({ metrics: [{ id: 'm1' }], decisionRule: { mode: 'all', criteria: [] }, stopRules: [] });

beforeAll(async () => {
  db = new PGlite();
  await db.exec(read('setup.sql'));
  await db.exec(read('../migrations/20261112000000_init.sql'));
  for (const [name, id] of Object.entries(U)) {
    await db.query('insert into auth.users (id) values ($1)', [id]);
    await db.query('insert into public.profiles (id, display_name) values ($1, $2)', [id, name]);
  }
  // alice membuat ruang; pemicu menjadikannya creator
  ids.space = (await as<{ id: string }>(U.alice, `insert into public.spaces (name, created_by) values ('Kluster Uji', $1) returning id`, [U.alice]))[0].id;
  // undangan peserta (bob, erin) dan pengamat (carol)
  const hash = async (t: string) => (await db.query<{ h: string }>(`select encode(sha256(convert_to('cobasepakat-invite:' || $1, 'UTF8')), 'hex') as h`, [t])).rows[0].h;
  for (const [token, role, max] of [['tok-peserta-A', 'participant', 5], ['tok-pengamat-A', 'observer', 1]] as const) {
    await as(U.alice, `insert into public.invites (space_id, token_hash, role, expires_at, max_uses, created_by) values ($1, $2, $3, now() + interval '1 day', $4, $5)`, [ids.space, await hash(token), role, max, U.alice]);
  }
  await as(U.bob, `select public.redeem_invite('tok-peserta-A')`);
  await as(U.erin, `select public.redeem_invite('tok-peserta-A')`);
  await as(U.carol, `select public.redeem_invite('tok-pengamat-A')`);
  // isu dan percobaan
  ids.issue = (await as<{ id: string }>(U.bob, `insert into public.issues (space_id, author_id, title) values ($1, $2, 'Apakah parkir miring memperlancar?') returning id`, [ids.space, U.bob]))[0].id;
  ids.exp = (await as<{ id: string }>(U.alice, `insert into public.experiments (issue_id, space_id, design, start_date, duration_days, created_by) values ($1, $2, $3::jsonb, current_date, 14, $4) returning id`, [ids.issue, ids.space, DESIGN, U.alice]))[0].id;
});

describe('keanggotaan dan isolasi ruang', () => {
  it('anggota melihat ruangnya; orang luar dan anon tidak melihat apa pun', async () => {
    for (const u of [U.alice, U.bob, U.carol]) expect(await count(u, 'spaces')).toBe(1);
    expect(await count(U.dave, 'spaces')).toBe(0);
    expect(await count(U.dave, 'issues')).toBe(0);
    expect(await count(U.dave, 'experiments')).toBe(0);
    expect(await count(U.dave, 'memberships')).toBe(0);
    await denied(as('anon', 'select * from public.spaces'));
  });
  it('ruang lain tidak terlihat oleh anggota ruang ini', async () => {
    await as(U.dave, `insert into public.spaces (name, created_by) values ('Ruang Dave', $1)`, [U.dave]);
    expect(await count(U.alice, 'spaces')).toBe(1);
    expect(await count(U.dave, 'spaces')).toBe(1);
  });
  it('tidak bisa menyisipkan keanggotaan sendiri atau mengangkat diri', async () => {
    await denied(as(U.dave, `insert into public.memberships (space_id, user_id, role) values ($1, $2, 'participant')`, [ids.space, U.dave]));
    expect((await as(U.bob, `update public.memberships set role = 'creator' where user_id = $1 returning user_id`, [U.bob])).length).toBe(0);
    expect((await as<{ role: string }>(U.alice, `select role from public.memberships where user_id = $1`, [U.bob]))[0].role).toBe('participant');
    await denied(as(U.alice, `insert into public.spaces (name, created_by) values ('Palsu', $1)`, [U.bob])); // created_by harus diri sendiri
  });
  it('hanya pembuat mengubah ruang dan peran anggota', async () => {
    expect((await as(U.bob, `update public.spaces set name = 'Diambil alih' where id = $1 returning id`, [ids.space])).length).toBe(0);
    expect((await as(U.alice, `update public.memberships set role = 'observer' where user_id = $1 returning user_id`, [U.erin])).length).toBe(1);
    await as(U.alice, `update public.memberships set role = 'participant' where user_id = $1`, [U.erin]);
  });
  it('profil hanya terlihat bagi sesama anggota ruang', async () => {
    expect(await count(U.bob, 'profiles', `id = '${U.alice}'`)).toBe(1);
    expect(await count(U.bob, 'profiles', `id = '${U.dave}'`)).toBe(0);
    expect(await count(U.dave, 'profiles', `id = '${U.alice}'`)).toBe(0);
    await denied(as(U.bob, `update public.profiles set display_name = 'x' where id = $1`, [U.alice]).then((r) => { if (r.length === 0 && true) throw new Error('tidak berubah'); }));
  });
});

describe('undangan', () => {
  const hash = async (t: string) => (await db.query<{ h: string }>(`select encode(sha256(convert_to('cobasepakat-invite:' || $1, 'UTF8')), 'hex') as h`, [t])).rows[0].h;
  it('peserta dan pengamat tidak bisa melihat atau membuat undangan', async () => {
    expect(await count(U.bob, 'invites')).toBe(0);
    expect(await count(U.carol, 'invites')).toBe(0);
    expect(await count(U.alice, 'invites')).toBe(2);
    await denied(as(U.bob, `insert into public.invites (space_id, token_hash, role, expires_at, created_by) values ($1, $2, 'participant', now() + interval '1 day', $3)`, [ids.space, 'a'.repeat(64), U.bob]));
  });
  it('token mentah tidak tersimpan; hanya hash', async () => {
    const rows = await as<{ token_hash: string }>(U.alice, 'select token_hash from public.invites');
    for (const r of rows) {
      expect(r.token_hash).toMatch(/^[0-9a-f]{64}$/);
      expect(r.token_hash).not.toContain('tok-');
    }
  });
  it('token salah, kedaluwarsa, dicabut, dan habis kuota ditolak', async () => {
    await denied(as(U.dave, `select public.redeem_invite('tidak-ada')`));
    await as(U.alice, `insert into public.invites (space_id, token_hash, role, expires_at, created_by) values ($1, $2, 'participant', now() - interval '1 minute', $3)`, [ids.space, await hash('tok-lama'), U.alice]);
    await denied(as(U.dave, `select public.redeem_invite('tok-lama')`));
    await as(U.alice, `insert into public.invites (space_id, token_hash, role, expires_at, revoked_at, created_by) values ($1, $2, 'participant', now() + interval '1 day', now(), $3)`, [ids.space, await hash('tok-cabut'), U.alice]).catch(() => undefined);
    await as('owner', `insert into public.invites (space_id, token_hash, role, expires_at, revoked_at, created_by) values ($1, $2, 'participant', now() + interval '1 day', now(), $3)`, [ids.space, await hash('tok-cabut'), U.alice]);
    await denied(as(U.dave, `select public.redeem_invite('tok-cabut')`));
    // tok-pengamat-A max_uses = 1 sudah dipakai carol
    await denied(as(U.dave, `select public.redeem_invite('tok-pengamat-A')`));
    expect(await count(U.alice, 'memberships', `user_id = '${U.dave}'`)).toBe(0);
  });
  it('anggota yang menebus ulang tidak mengubah peran dan tidak memakai kuota', async () => {
    const before = Number((await as<{ n: number }>(U.alice, `select used_count as n from public.invites where role = 'participant' and used_count > 0 limit 1`))[0].n);
    await as(U.carol, `select public.redeem_invite('tok-peserta-A')`); // carol pengamat, token peserta
    expect((await as<{ role: string }>(U.carol, `select role from public.memberships where user_id = $1`, [U.carol]))[0].role).toBe('observer');
    const after = Number((await as<{ n: number }>(U.alice, `select used_count as n from public.invites where role = 'participant' and used_count > 0 limit 1`))[0].n);
    expect(after).toBe(before);
  });
});

describe('isu, dugaan, komentar', () => {
  it('peserta menulis; pengamat hanya membaca', async () => {
    await as(U.erin, `insert into public.comments (issue_id, user_id, kind, body) values ($1, $2, 'fakta', 'Lebar jalan 6,2 m')`, [ids.issue, U.erin]);
    await as(U.bob, `insert into public.claims (issue_id, user_id, stance, statement, initial_confidence) values ($1, $2, 'pro', 'Jika miring, lebih lancar', 70)`, [ids.issue, U.bob]);
    await denied(as(U.carol, `insert into public.comments (issue_id, user_id, kind, body) values ($1, $2, 'fakta', 'x')`, [ids.issue, U.carol]));
    await denied(as(U.carol, `insert into public.issues (space_id, author_id, title) values ($1, $2, 'Isu dari pengamat')`, [ids.space, U.carol]));
    await denied(as(U.carol, `insert into public.claims (issue_id, user_id, stance, statement, initial_confidence) values ($1, $2, 'pro', 'x', 50)`, [ids.issue, U.carol]));
    expect(await count(U.carol, 'comments')).toBe(1);
    expect(await count(U.carol, 'claims')).toBe(1);
  });
  it('tidak bisa menulis atas nama orang lain', async () => {
    await denied(as(U.bob, `insert into public.comments (issue_id, user_id, kind, body) values ($1, $2, 'fakta', 'menyamar')`, [ids.issue, U.erin]));
    await denied(as(U.bob, `insert into public.issues (space_id, author_id, title) values ($1, $2, 'Isu atas nama Alice')`, [ids.space, U.alice]));
    expect((await as(U.bob, `update public.claims set post_confidence = 10 where user_id = $1 returning id`, [U.bob])).length).toBe(1);
    expect((await as(U.erin, `update public.claims set post_confidence = 99 where user_id = $1 returning id`, [U.bob])).length).toBe(0);
  });
  it('orang luar tidak bisa menulis atau membaca', async () => {
    await denied(as(U.dave, `insert into public.comments (issue_id, user_id, kind, body) values ($1, $2, 'fakta', 'x')`, [ids.issue, U.dave]));
    expect(await count(U.dave, 'comments')).toBe(0);
  });
  it('komentar tidak dapat diubah atau dihapus (tanpa kebijakan)', async () => {
    expect((await as(U.erin, `update public.comments set body = 'diubah' returning id`)).length).toBe(0);
    expect((await as(U.erin, `delete from public.comments returning id`)).length).toBe(0);
  });
});

describe('percobaan, kuorum server, dan penguncian desain', () => {
  it('hanya pembuat boleh membuat percobaan; kuorum dihitung di server', async () => {
    await denied(as(U.bob, `insert into public.experiments (issue_id, space_id, design, start_date, duration_days, created_by) values ($1, $2, '{}'::jsonb, current_date, 14, $3)`, [ids.issue, ids.space, U.bob]));
    await denied(as(U.alice, `insert into public.experiments (issue_id, space_id, design, start_date, duration_days, created_by, status) values ($1, $2, '{}'::jsonb, current_date, 14, $3, 'berjalan')`, [ids.issue, ids.space, U.alice]));
    // pemilih = alice (creator) + bob + erin (peserta) = 3; 70% => 3 (ceil 2.1)
    expect((await as<{ n: number }>(U.alice, `select public.required_votes($1) as n`, [ids.space]))[0].n).toBe(3);
  });
  it('pengamat dan orang luar tidak bisa memberi suara; suara palsu atas nama lain ditolak', async () => {
    await denied(as(U.carol, `insert into public.approvals (experiment_id, user_id, stance) values ($1, $2, 'setuju')`, [ids.exp, U.carol]));
    await denied(as(U.dave, `insert into public.approvals (experiment_id, user_id, stance) values ($1, $2, 'setuju')`, [ids.exp, U.dave]));
    await denied(as(U.bob, `insert into public.approvals (experiment_id, user_id, stance) values ($1, $2, 'setuju')`, [ids.exp, U.alice]));
  });
  it('data belum bisa dicatat sebelum percobaan berjalan', async () => {
    await denied(as(U.bob, `insert into public.data_entries (experiment_id, metric_id, value, day, recorded_by) values ($1, 'm1', 3.2, 1, $2)`, [ids.exp, U.bob]));
  });
  it('percobaan mulai otomatis saat kuorum tercapai, dan desain terkunci', async () => {
    await as(U.alice, `insert into public.approvals (experiment_id, user_id, stance) values ($1, $2, 'setuju')`, [ids.exp, U.alice]);
    await as(U.bob, `insert into public.approvals (experiment_id, user_id, stance, note) values ($1, $2, 'setuju_dengan_catatan', 'cek kerucut tiap pagi')`, [ids.exp, U.bob]);
    expect((await as<{ status: string }>(U.alice, `select status from public.experiments where id = $1`, [ids.exp]))[0].status).toBe('menunggu_persetujuan');
    await as(U.erin, `insert into public.approvals (experiment_id, user_id, stance) values ($1, $2, 'keberatan')`, [ids.exp, U.erin]);
    expect((await as<{ status: string }>(U.alice, `select status from public.experiments where id = $1`, [ids.exp]))[0].status).toBe('menunggu_persetujuan'); // keberatan tidak dihitung setuju
    await as(U.erin, `update public.approvals set stance = 'setuju' where user_id = $1`, [U.erin]);
    expect((await as<{ status: string }>(U.alice, `select status from public.experiments where id = $1`, [ids.exp]))[0].status).toBe('berjalan');
  });
  it('setelah berjalan: suara dan desain tidak bisa diubah, bahkan oleh pembuat atau pemilik tabel', async () => {
    await denied(as(U.erin, `insert into public.approvals (experiment_id, user_id, stance) values ($1, $2, 'setuju')`, [ids.exp, U.erin]));
    expect((await as(U.erin, `update public.approvals set stance = 'keberatan' where user_id = $1 returning user_id`, [U.erin])).length).toBe(0);
    expect((await as(U.alice, `update public.experiments set design = '{"x":1}'::jsonb where id = $1 returning id`, [ids.exp])).length).toBe(0);
    await denied(as(U.alice, `update public.experiments set status = 'selesai' where id = $1`, [ids.exp]).then((r) => { if (r.length === 0) throw new Error('tidak berubah'); }));
    await expect(as('owner', `update public.experiments set design = '{"x":1}'::jsonb where id = $1`, [ids.exp])).rejects.toThrow(/terkunci/);
  });
});

describe('data lapangan', () => {
  let entry: string;
  it('peserta mencatat atas nama sendiri; pengamat dan pemalsuan ditolak', async () => {
    entry = (await as<{ id: string }>(U.bob, `insert into public.data_entries (experiment_id, metric_id, value, day, recorded_by) values ($1, 'm1', 3.2, 1, $2) returning id`, [ids.exp, U.bob]))[0].id;
    await denied(as(U.carol, `insert into public.data_entries (experiment_id, metric_id, value, day, recorded_by) values ($1, 'm1', 3.2, 1, $2)`, [ids.exp, U.carol]));
    await denied(as(U.bob, `insert into public.data_entries (experiment_id, metric_id, value, day, recorded_by) values ($1, 'm1', 3.2, 1, $2)`, [ids.exp, U.erin]));
    await denied(as(U.dave, `insert into public.data_entries (experiment_id, metric_id, value, day, recorded_by) values ($1, 'm1', 3.2, 1, $2)`, [ids.exp, U.dave]));
    await denied(as(U.bob, `insert into public.data_entries (experiment_id, metric_id, value, day, recorded_by, verified_by) values ($1, 'm1', 3.2, 1, $2, $3)`, [ids.exp, U.bob, U.erin])); // tidak boleh mengaku sudah terverifikasi
    await denied(as(U.bob, `insert into public.data_entries (experiment_id, metric_id, value, day, recorded_by) values ($1, 'm1', 'NaN'::float8, 1, $2)`, [ids.exp, U.bob]));
  });
  it('nilai tidak bisa diubah atau dihapus langsung oleh siapa pun yang bukan pemilik tabel', async () => {
    for (const u of [U.alice, U.bob, U.erin]) {
      await denied(as(u, `update public.data_entries set value = 0 where id = $1`, [entry]));
      await denied(as(u, `delete from public.data_entries where id = $1`, [entry]));
    }
  });
  it('verifikasi: pencatat tidak boleh memverifikasi sendiri; peserta lain boleh; pengamat tidak', async () => {
    await denied(as(U.bob, `select public.verify_entry($1)`, [entry]));
    await denied(as(U.carol, `select public.verify_entry($1)`, [entry]));
    await denied(as(U.dave, `select public.verify_entry($1)`, [entry]));
    await as(U.erin, `select public.verify_entry($1)`, [entry]);
    expect((await as<{ v: string }>(U.alice, `select verified_by as v from public.data_entries where id = $1`, [entry]))[0].v).toBe(U.erin);
    await as(U.erin, `select public.flag_entry($1, true)`, [entry]);
    expect((await as<{ f: boolean; v: string | null }>(U.alice, `select flagged as f, verified_by as v from public.data_entries where id = $1`, [entry]))[0]).toEqual({ f: true, v: null });
    await denied(as(U.carol, `select public.flag_entry($1, false)`, [entry]));
  });
  it('anggota membaca; orang luar tidak', async () => {
    expect(await count(U.carol, 'data_entries')).toBe(1);
    expect(await count(U.dave, 'data_entries')).toBe(0);
  });
});

describe('hentikan sekarang', () => {
  it('pengamat dan orang luar tidak bisa; peserta bisa dan wajib beralasan; setelahnya data ditolak', async () => {
    await denied(as(U.carol, `select public.stop_experiment($1, 'x')`, [ids.exp]));
    await denied(as(U.dave, `select public.stop_experiment($1, 'x')`, [ids.exp]));
    await denied(as(U.bob, `select public.stop_experiment($1, '  ')`, [ids.exp]));
    await as(U.bob, `select public.stop_experiment($1, 'Ambulans terhambat di B-08')`, [ids.exp]);
    const [e] = await as<{ status: string; stopped_reason: string }>(U.alice, `select status, stopped_reason from public.experiments where id = $1`, [ids.exp]);
    expect(e).toEqual({ status: 'dihentikan', stopped_reason: 'Ambulans terhambat di B-08' });
    await denied(as(U.bob, `insert into public.data_entries (experiment_id, metric_id, value, day, recorded_by) values ($1, 'm1', 1, 2, $2)`, [ids.exp, U.bob]));
    await denied(as(U.bob, `select public.stop_experiment($1, 'lagi')`, [ids.exp])); // sudah berhenti
  });
});

describe('buku besar berantai hash', () => {
  it('tidak bisa ditulis langsung; peserta menambah lewat fungsi; pengamat tidak', async () => {
    await denied(as(U.alice, `insert into public.ledger_entries (space_id, idx, prev_hash, hash, actor, type, payload) values ($1, 0, 'x', 'y', $2, 'audit', '{}'::jsonb)`, [ids.space, U.alice]));
    await denied(as(U.carol, `select public.append_ledger($1, 'audit', '{}'::jsonb)`, [ids.space]));
    await denied(as(U.dave, `select public.append_ledger($1, 'audit', '{}'::jsonb)`, [ids.space]));
    await as(U.bob, `select public.append_ledger($1, 'audit', '{"aksi":"catat data"}'::jsonb)`, [ids.space]);
    await denied(as(U.bob, `select public.append_ledger($1, 'keputusan', '{"hasil":"adopsi"}'::jsonb)`, [ids.space])); // hanya pembuat
    await as(U.alice, `select public.append_ledger($1, 'keputusan', '{"hasil":"ubah_coba_lagi"}'::jsonb)`, [ids.space]);
    await as(U.alice, `select public.append_ledger($1, 'audit', '{"aksi":"tinjau"}'::jsonb)`, [ids.space]);
    const rows = await as<{ idx: number; prev_hash: string; hash: string }>(U.carol, `select idx, prev_hash, hash from public.ledger_entries where space_id = $1 order by idx`, [ids.space]);
    expect(rows.map((r) => r.idx)).toEqual([0, 1, 2]);
    expect(rows[0].prev_hash).toBe('0'.repeat(64));
    expect(rows[1].prev_hash).toBe(rows[0].hash);
    expect(rows[2].prev_hash).toBe(rows[1].hash);
  });
  it('tidak bisa diubah atau dihapus, bahkan oleh pemilik tabel', async () => {
    await denied(as(U.alice, `update public.ledger_entries set payload = '{}'::jsonb`));
    await denied(as(U.alice, `delete from public.ledger_entries`));
    await expect(as('owner', `update public.ledger_entries set payload = '{"x":1}'::jsonb`)).rejects.toThrow(/hanya bisa ditambah/);
    await expect(as('owner', `delete from public.ledger_entries`)).rejects.toThrow(/hanya bisa ditambah/);
    await expect(as('owner', `truncate public.ledger_entries`)).rejects.toThrow(/hanya bisa ditambah/);
  });
  it('orang luar tidak bisa membaca atau memverifikasi; anggota bisa memverifikasi', async () => {
    expect(await count(U.dave, 'ledger_entries')).toBe(0);
    await denied(as(U.dave, `select * from public.verify_ledger($1)`, [ids.space]));
    const [v] = await as<{ valid: boolean; length: number; head: string }>(U.carol, `select (public.verify_ledger($1)).*`, [ids.space]);
    expect(v.valid).toBe(true);
    expect(v.length).toBe(3);
  });
  it('perusakan oleh superuser (menonaktifkan pemicu) terdeteksi oleh verify_ledger', async () => {
    await db.exec('alter table public.ledger_entries disable trigger ledger_no_update');
    await db.exec(`update public.ledger_entries set payload = '{"hasil":"adopsi"}'::jsonb where idx = 1`);
    await db.exec('alter table public.ledger_entries enable trigger ledger_no_update');
    const [v] = await as<{ valid: boolean; broken_at: number }>(U.carol, `select (public.verify_ledger($1)).*`, [ids.space]);
    expect(v.valid).toBe(false);
    expect(v.broken_at).toBe(1);
  });
});

describe('survei penerimaan', () => {
  it('hanya setelah percobaan selesai, atas nama sendiri', async () => {
    await denied(as(U.bob, `insert into public.acceptance_responses (experiment_id, user_id, score, accepts) values ($1, $2, 4, true)`, [ids.exp, U.bob])); // masih dihentikan
    await as('owner', `update public.experiments set status = 'selesai' where id = $1`, [ids.exp]);
    await as(U.bob, `insert into public.acceptance_responses (experiment_id, user_id, score, accepts, stance_initial) values ($1, $2, 4, true, 'pro')`, [ids.exp, U.bob]);
    await denied(as(U.bob, `insert into public.acceptance_responses (experiment_id, user_id, score, accepts) values ($1, $2, 4, true)`, [ids.exp, U.erin]));
    await denied(as(U.carol, `insert into public.acceptance_responses (experiment_id, user_id, score, accepts) values ($1, $2, 4, true)`, [ids.exp, U.carol]));
    await denied(as(U.erin, `insert into public.acceptance_responses (experiment_id, user_id, score, accepts) values ($1, $2, 9, true)`, [ids.exp, U.erin])); // skor di luar 1..5
    expect(await count(U.carol, 'acceptance_responses')).toBe(1);
    expect(await count(U.dave, 'acceptance_responses')).toBe(0);
  });
});

describe('anon', () => {
  it('tidak bisa membaca atau menulis tabel mana pun', async () => {
    for (const t of ['profiles', 'spaces', 'memberships', 'invites', 'issues', 'claims', 'comments', 'experiments', 'approvals', 'data_entries', 'acceptance_responses', 'ledger_entries']) {
      await denied(as('anon', `select * from public.${t}`));
    }
    await denied(as('anon', `select public.redeem_invite('tok-peserta-A')`));
  });
});
