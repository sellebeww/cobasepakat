-- CobaSepakat: skema bersama, RLS, dan buku besar berantai hash.
-- Peran akses tingkat ruang: creator (pembuat), participant (peserta), observer (pengamat).
-- Catatan: kebijakan diuji otomatis dengan PGlite (supabase/tests/rls.test.ts).

-- ---------------------------------------------------------------------------
-- Tabel inti

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  created_at timestamptz not null default now()
);

create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  description text not null default '',
  quorum_percentage int not null default 70 check (quorum_percentage between 1 and 100),
  max_experiment_days int not null default 30 check (max_experiment_days between 1 and 90),
  budget_ceiling bigint not null default 2500000 check (budget_ceiling >= 0),
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.memberships (
  space_id uuid not null references public.spaces (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('creator', 'participant', 'observer')),
  created_at timestamptz not null default now(),
  primary key (space_id, user_id)
);

create table public.invites (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete cascade,
  -- Hanya hash token yang disimpan. Token mentah hanya ada di tautan undangan.
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  role text not null check (role in ('participant', 'observer')),
  expires_at timestamptz not null,
  max_uses int not null default 1 check (max_uses between 1 and 1000),
  used_count int not null default 0 check (used_count >= 0),
  revoked_at timestamptz,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.issues (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete cascade,
  author_id uuid not null references public.profiles (id),
  title text not null check (char_length(title) between 5 and 300),
  context text not null default '',
  status text not null default 'isu_dibuka',
  created_at timestamptz not null default now()
);

create table public.claims (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues (id) on delete cascade,
  user_id uuid not null references public.profiles (id),
  stance text not null check (stance in ('pro', 'kontra', 'netral')),
  statement text not null,
  initial_confidence int not null check (initial_confidence between 0 and 100),
  post_confidence int check (post_confidence between 0 and 100),
  mind_changing_evidence text not null default '',
  updated_at timestamptz not null default now(),
  unique (issue_id, user_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues (id) on delete cascade,
  user_id uuid not null references public.profiles (id),
  kind text not null check (kind in ('fakta', 'dugaan', 'nilai', 'pertanyaan')),
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create table public.experiments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues (id) on delete cascade,
  space_id uuid not null references public.spaces (id) on delete cascade,
  status text not null default 'menunggu_persetujuan'
    check (status in ('draf', 'menunggu_persetujuan', 'berjalan', 'dihentikan', 'evaluasi', 'selesai')),
  -- Desain terstruktur (metrik, kriteria, aturan berhenti). Terkunci sejak status berjalan.
  design jsonb not null,
  start_date date not null,
  duration_days int not null check (duration_days >= 1),
  created_by uuid not null references public.profiles (id),
  stopped_reason text,
  stopped_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.approvals (
  experiment_id uuid not null references public.experiments (id) on delete cascade,
  user_id uuid not null references public.profiles (id),
  stance text not null check (stance in ('setuju', 'setuju_dengan_catatan', 'keberatan')),
  note text not null default '',
  signed_at timestamptz not null default now(),
  primary key (experiment_id, user_id)
);

create table public.data_entries (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid not null references public.experiments (id) on delete cascade,
  metric_id text not null,
  value double precision not null check (value not in ('NaN', 'Infinity', '-Infinity')),
  day int not null check (day >= 1),
  notes text,
  recorded_by uuid not null references public.profiles (id),
  recorded_at timestamptz not null default now(),
  verified_by uuid references public.profiles (id),
  flagged boolean not null default false
);
create index data_entries_experiment_idx on public.data_entries (experiment_id, metric_id, day);

create table public.acceptance_responses (
  experiment_id uuid not null references public.experiments (id) on delete cascade,
  user_id uuid not null references public.profiles (id),
  score int not null check (score between 1 and 5),
  accepts boolean not null,
  stance_initial text not null default 'netral' check (stance_initial in ('pro', 'kontra', 'netral')),
  comment text,
  created_at timestamptz not null default now(),
  primary key (experiment_id, user_id)
);

-- Buku besar berantai hash per ruang. Hanya bisa ditulis lewat append_ledger().
create table public.ledger_entries (
  space_id uuid not null references public.spaces (id) on delete cascade,
  idx int not null check (idx >= 0),
  prev_hash text not null,
  hash text not null,
  actor uuid not null references public.profiles (id),
  type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  primary key (space_id, idx)
);

-- ---------------------------------------------------------------------------
-- Fungsi bantu (security definer agar kebijakan tidak rekursif)

create function public.member_role(p_space uuid) returns text
language sql stable security definer set search_path = public as $$
  select role from public.memberships where space_id = p_space and user_id = auth.uid()
$$;

create function public.is_member(p_space uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.memberships where space_id = p_space and user_id = auth.uid())
$$;

-- creator atau participant (boleh menulis)
create function public.can_write(p_space uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.member_role(p_space) in ('creator', 'participant'), false)
$$;

create function public.is_creator(p_space uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.member_role(p_space) = 'creator', false)
$$;

create function public.space_of_issue(p_issue uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select space_id from public.issues where id = p_issue
$$;

create function public.space_of_experiment(p_exp uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select space_id from public.experiments where id = p_exp
$$;

create function public.experiment_status(p_exp uuid) returns text
language sql stable security definer set search_path = public as $$
  select status from public.experiments where id = p_exp
$$;

-- Pengguna yang berbagi ruang dengan pengguna saat ini (untuk melihat nama tampilan).
create function public.shares_space_with(p_user uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.memberships a
    join public.memberships b on a.space_id = b.space_id
    where a.user_id = auth.uid() and b.user_id = p_user
  )
$$;

-- ---------------------------------------------------------------------------
-- Pemicu

-- Pembuat ruang otomatis menjadi creator.
create function public.on_space_created() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.memberships (space_id, user_id, role) values (new.id, new.created_by, 'creator');
  return new;
end $$;
create trigger spaces_creator_membership after insert on public.spaces
  for each row execute function public.on_space_created();

-- Desain tidak bisa diubah setelah disepakati (berlaku juga untuk peran yang melewati RLS).
create function public.experiments_guard() returns trigger
language plpgsql set search_path = public as $$
begin
  if old.status not in ('draf', 'menunggu_persetujuan') then
    if new.design is distinct from old.design
       or new.start_date is distinct from old.start_date
       or new.duration_days is distinct from old.duration_days
       or new.issue_id is distinct from old.issue_id
       or new.space_id is distinct from old.space_id then
      raise exception 'Desain percobaan terkunci sejak disepakati' using errcode = 'check_violation';
    end if;
  end if;
  return new;
end $$;
create trigger experiments_lock before update on public.experiments
  for each row execute function public.experiments_guard();

-- Kuorum dihitung di server: ceil(pemilih * persen / 100), pemilih = creator + participant.
create function public.required_votes(p_space uuid) returns int
language sql stable security definer set search_path = public as $$
  select case when v.n = 0 then 0 else greatest(1, least(v.n, ((v.n * s.quorum_percentage) + 99) / 100)) end
  from public.spaces s,
       lateral (select count(*)::int as n from public.memberships m
                where m.space_id = s.id and m.role in ('creator', 'participant')) v
  where s.id = p_space
$$;

create function public.on_approval_changed() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  sp uuid;
  agree int;
  need int;
begin
  select space_id into sp from public.experiments where id = new.experiment_id;
  select count(*) into agree from public.approvals
    where experiment_id = new.experiment_id and stance <> 'keberatan';
  need := public.required_votes(sp);
  if need > 0 and agree >= need then
    update public.experiments set status = 'berjalan'
      where id = new.experiment_id and status = 'menunggu_persetujuan';
  end if;
  return null;
end $$;
create trigger approvals_quorum after insert or update on public.approvals
  for each row execute function public.on_approval_changed();

-- Buku besar: tidak pernah boleh diubah atau dihapus (juga oleh pemilik tabel).
create function public.ledger_immutable() returns trigger
language plpgsql as $$
begin
  raise exception 'Buku besar hanya bisa ditambah, tidak bisa diubah atau dihapus' using errcode = 'restrict_violation';
end $$;
create trigger ledger_no_update before update or delete on public.ledger_entries
  for each row execute function public.ledger_immutable();
create trigger ledger_no_truncate before truncate on public.ledger_entries
  for each statement execute function public.ledger_immutable();

-- ---------------------------------------------------------------------------
-- Fungsi aksi

-- Hash entri: sha256(idx|prev_hash|actor|type|payload::text). Format ini milik server;
-- verifikasi memakai verify_ledger(). (Rantai demo di klien memakai JSON kanonik sendiri.)
create function public.ledger_entry_hash(p_idx int, p_prev text, p_actor uuid, p_type text, p_payload jsonb)
returns text language sql immutable as $$
  select encode(sha256(convert_to(p_idx::text || '|' || p_prev || '|' || p_actor::text || '|' || p_type || '|' || p_payload::text, 'UTF8')), 'hex')
$$;

create function public.append_ledger(p_space uuid, p_type text, p_payload jsonb) returns public.ledger_entries
language plpgsql security definer set search_path = public as $$
declare
  last_row public.ledger_entries;
  new_row public.ledger_entries;
  prev text := repeat('0', 64);
  next_idx int := 0;
begin
  if auth.uid() is null or not public.can_write(p_space) then
    raise exception 'Tidak berwenang menulis riwayat' using errcode = 'insufficient_privilege';
  end if;
  if p_type = 'keputusan' and not public.is_creator(p_space) then
    raise exception 'Hanya pembuat yang boleh mencatat keputusan' using errcode = 'insufficient_privilege';
  end if;
  -- Serialisasi penulisan per ruang agar indeks tidak bentrok.
  perform pg_advisory_xact_lock(hashtextextended(p_space::text, 0));
  select * into last_row from public.ledger_entries where space_id = p_space order by idx desc limit 1;
  if found then
    prev := last_row.hash;
    next_idx := last_row.idx + 1;
  end if;
  insert into public.ledger_entries (space_id, idx, prev_hash, hash, actor, type, payload)
  values (p_space, next_idx, prev, public.ledger_entry_hash(next_idx, prev, auth.uid(), p_type, p_payload), auth.uid(), p_type, p_payload)
  returning * into new_row;
  return new_row;
end $$;

create type public.ledger_check as (valid boolean, broken_at int, head text, length int);

create function public.verify_ledger(p_space uuid) returns public.ledger_check
language plpgsql stable security definer set search_path = public as $$
declare
  r public.ledger_entries;
  prev text := repeat('0', 64);
  expected_idx int := 0;
  n int := 0;
begin
  if not public.is_member(p_space) then
    raise exception 'Bukan anggota ruang' using errcode = 'insufficient_privilege';
  end if;
  for r in select * from public.ledger_entries where space_id = p_space order by idx loop
    if r.idx <> expected_idx or r.prev_hash <> prev
       or r.hash <> public.ledger_entry_hash(r.idx, r.prev_hash, r.actor, r.type, r.payload) then
      return (false, r.idx, prev, n)::public.ledger_check;
    end if;
    prev := r.hash; expected_idx := expected_idx + 1; n := n + 1;
  end loop;
  return (true, null::int, prev, n)::public.ledger_check;
end $$;

-- Tebus undangan: membuat keanggotaan bila token valid. Atomik terhadap used_count.
create function public.redeem_invite(p_token text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  inv public.invites;
  h text := encode(sha256(convert_to('cobasepakat-invite:' || p_token, 'UTF8')), 'hex');
begin
  if auth.uid() is null then
    raise exception 'Harus masuk dulu' using errcode = 'insufficient_privilege';
  end if;
  select * into inv from public.invites where token_hash = h for update;
  if not found or inv.revoked_at is not null or inv.expires_at <= now() or inv.used_count >= inv.max_uses then
    raise exception 'Undangan tidak valid' using errcode = 'invalid_parameter_value';
  end if;
  if exists (select 1 from public.memberships where space_id = inv.space_id and user_id = auth.uid()) then
    return inv.space_id; -- sudah anggota; tidak menurunkan atau menaikkan peran, tidak memakai kuota
  end if;
  insert into public.memberships (space_id, user_id, role) values (inv.space_id, auth.uid(), inv.role);
  update public.invites set used_count = used_count + 1 where id = inv.id;
  return inv.space_id;
end $$;

-- Hentikan percobaan (hak setiap peserta dan pembuat, tanpa voting ulang).
create function public.stop_experiment(p_exp uuid, p_reason text) returns void
language plpgsql security definer set search_path = public as $$
declare sp uuid; st text;
begin
  select space_id, status into sp, st from public.experiments where id = p_exp;
  if sp is null or not public.can_write(sp) then
    raise exception 'Tidak berwenang' using errcode = 'insufficient_privilege';
  end if;
  if st <> 'berjalan' then
    raise exception 'Percobaan tidak sedang berjalan' using errcode = 'invalid_parameter_value';
  end if;
  if p_reason is null or btrim(p_reason) = '' then
    raise exception 'Alasan wajib diisi' using errcode = 'invalid_parameter_value';
  end if;
  update public.experiments set status = 'dihentikan', stopped_reason = p_reason, stopped_at = now() where id = p_exp;
end $$;

-- Verifikasi dan penandaan data: pencatat tidak boleh memverifikasi entrinya sendiri.
create function public.verify_entry(p_entry uuid) returns void
language plpgsql security definer set search_path = public as $$
declare e public.data_entries; sp uuid;
begin
  select * into e from public.data_entries where id = p_entry;
  if not found then raise exception 'Entri tidak ada' using errcode = 'invalid_parameter_value'; end if;
  sp := public.space_of_experiment(e.experiment_id);
  if not public.can_write(sp) then raise exception 'Tidak berwenang' using errcode = 'insufficient_privilege'; end if;
  if e.recorded_by = auth.uid() then
    raise exception 'Pencatat tidak boleh memverifikasi entrinya sendiri' using errcode = 'insufficient_privilege';
  end if;
  update public.data_entries set verified_by = auth.uid(), flagged = false where id = p_entry;
end $$;

create function public.flag_entry(p_entry uuid, p_flagged boolean) returns void
language plpgsql security definer set search_path = public as $$
declare e public.data_entries; sp uuid;
begin
  select * into e from public.data_entries where id = p_entry;
  if not found then raise exception 'Entri tidak ada' using errcode = 'invalid_parameter_value'; end if;
  sp := public.space_of_experiment(e.experiment_id);
  if not public.can_write(sp) then raise exception 'Tidak berwenang' using errcode = 'insufficient_privilege'; end if;
  update public.data_entries set flagged = p_flagged, verified_by = case when p_flagged then null else verified_by end where id = p_entry;
end $$;

-- ---------------------------------------------------------------------------
-- Row Level Security

alter table public.profiles enable row level security;
alter table public.spaces enable row level security;
alter table public.memberships enable row level security;
alter table public.invites enable row level security;
alter table public.issues enable row level security;
alter table public.claims enable row level security;
alter table public.comments enable row level security;
alter table public.experiments enable row level security;
alter table public.approvals enable row level security;
alter table public.data_entries enable row level security;
alter table public.acceptance_responses enable row level security;
alter table public.ledger_entries enable row level security;

-- profiles
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.shares_space_with(id));
create policy profiles_insert on public.profiles for insert to authenticated with check (id = auth.uid());
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- spaces
create policy spaces_select on public.spaces for select to authenticated
  using (public.is_member(id) or created_by = auth.uid()); -- created_by: agar INSERT ... RETURNING berfungsi sebelum pemicu keanggotaan
create policy spaces_insert on public.spaces for insert to authenticated with check (created_by = auth.uid());
create policy spaces_update on public.spaces for update to authenticated
  using (public.is_creator(id)) with check (public.is_creator(id));
create policy spaces_delete on public.spaces for delete to authenticated using (public.is_creator(id));

-- memberships: pembuat mengelola; anggota boleh keluar (kecuali pembuat)
create policy memberships_select on public.memberships for select to authenticated using (public.is_member(space_id));
create policy memberships_update on public.memberships for update to authenticated
  using (public.is_creator(space_id) and user_id <> auth.uid())
  with check (public.is_creator(space_id) and user_id <> auth.uid());
create policy memberships_delete on public.memberships for delete to authenticated
  using ((public.is_creator(space_id) and user_id <> auth.uid()) or (user_id = auth.uid() and role <> 'creator'));
-- Tidak ada kebijakan INSERT: keanggotaan dibuat oleh pemicu ruang atau redeem_invite().

-- invites: hanya pembuat
create policy invites_select on public.invites for select to authenticated using (public.is_creator(space_id));
create policy invites_insert on public.invites for insert to authenticated
  with check (public.is_creator(space_id) and created_by = auth.uid() and used_count = 0 and revoked_at is null);
create policy invites_update on public.invites for update to authenticated
  using (public.is_creator(space_id)) with check (public.is_creator(space_id));

-- issues
create policy issues_select on public.issues for select to authenticated using (public.is_member(space_id));
create policy issues_insert on public.issues for insert to authenticated
  with check (public.can_write(space_id) and author_id = auth.uid());
create policy issues_update on public.issues for update to authenticated
  using (public.can_write(space_id) and (author_id = auth.uid() or public.is_creator(space_id)))
  with check (public.can_write(space_id));
create policy issues_delete on public.issues for delete to authenticated using (public.is_creator(space_id));

-- claims
create policy claims_select on public.claims for select to authenticated
  using (public.is_member(public.space_of_issue(issue_id)));
create policy claims_insert on public.claims for insert to authenticated
  with check (public.can_write(public.space_of_issue(issue_id)) and user_id = auth.uid());
create policy claims_update on public.claims for update to authenticated
  using (user_id = auth.uid() and public.can_write(public.space_of_issue(issue_id)))
  with check (user_id = auth.uid());

-- comments
create policy comments_select on public.comments for select to authenticated
  using (public.is_member(public.space_of_issue(issue_id)));
create policy comments_insert on public.comments for insert to authenticated
  with check (public.can_write(public.space_of_issue(issue_id)) and user_id = auth.uid());

-- experiments: hanya pembuat membuat/mengubah desain, dan hanya sebelum disepakati
create policy experiments_select on public.experiments for select to authenticated using (public.is_member(space_id));
create policy experiments_insert on public.experiments for insert to authenticated
  with check (
    public.is_creator(space_id) and created_by = auth.uid()
    and status in ('draf', 'menunggu_persetujuan')
    and public.space_of_issue(issue_id) = space_id
  );
create policy experiments_update on public.experiments for update to authenticated
  using (public.is_creator(space_id) and status in ('draf', 'menunggu_persetujuan'))
  with check (public.is_creator(space_id) and status in ('draf', 'menunggu_persetujuan'));

-- approvals: suara sendiri, hanya sebelum desain terkunci
create policy approvals_select on public.approvals for select to authenticated
  using (public.is_member(public.space_of_experiment(experiment_id)));
create policy approvals_insert on public.approvals for insert to authenticated
  with check (
    user_id = auth.uid()
    and public.can_write(public.space_of_experiment(experiment_id))
    and public.experiment_status(experiment_id) in ('draf', 'menunggu_persetujuan')
  );
create policy approvals_update on public.approvals for update to authenticated
  using (user_id = auth.uid() and public.experiment_status(experiment_id) in ('draf', 'menunggu_persetujuan'))
  with check (user_id = auth.uid());

-- data_entries: hanya saat berjalan; tidak bisa diubah/dihapus langsung (lihat verify_entry/flag_entry)
create policy data_entries_select on public.data_entries for select to authenticated
  using (public.is_member(public.space_of_experiment(experiment_id)));
create policy data_entries_insert on public.data_entries for insert to authenticated
  with check (
    recorded_by = auth.uid()
    and verified_by is null and flagged = false
    and public.can_write(public.space_of_experiment(experiment_id))
    and public.experiment_status(experiment_id) = 'berjalan'
  );

-- acceptance_responses: setelah percobaan selesai (keputusan dicatat)
create policy acceptance_select on public.acceptance_responses for select to authenticated
  using (public.is_member(public.space_of_experiment(experiment_id)));
create policy acceptance_insert on public.acceptance_responses for insert to authenticated
  with check (
    user_id = auth.uid()
    and public.can_write(public.space_of_experiment(experiment_id))
    and public.experiment_status(experiment_id) = 'selesai'
  );
create policy acceptance_update on public.acceptance_responses for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ledger: hanya baca; penulisan lewat append_ledger()
create policy ledger_select on public.ledger_entries for select to authenticated using (public.is_member(space_id));

-- ---------------------------------------------------------------------------
-- Hak akses tabel (RLS tetap menjadi penjaga utama)

revoke all on all tables in schema public from anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
revoke insert, update, delete on public.ledger_entries from authenticated;
revoke insert on public.memberships from authenticated;
revoke delete, update on public.data_entries from authenticated;
revoke all on all functions in schema public from public;
grant execute on function
  public.member_role(uuid), public.is_member(uuid), public.can_write(uuid), public.is_creator(uuid),
  public.space_of_issue(uuid), public.space_of_experiment(uuid), public.experiment_status(uuid),
  public.shares_space_with(uuid), public.append_ledger(uuid, text, jsonb), public.verify_ledger(uuid),
  public.redeem_invite(text), public.stop_experiment(uuid, text), public.verify_entry(uuid),
  public.flag_entry(uuid, boolean), public.required_votes(uuid)
  to authenticated;

-- Realtime (hanya bila publikasi ada, mis. pada Supabase)
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.data_entries, public.approvals, public.experiments, public.comments, public.claims;
  end if;
end $$;
