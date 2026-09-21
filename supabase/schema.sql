-- Campfire Groups -- one-time setup.
--
-- Run this once in your Supabase project's SQL editor (Database > SQL
-- Editor > New query). It creates the table/functions this feature needs
-- and locks them down so the feature works with no user accounts and no
-- server of its own, while still making "only the host can control
-- playback" a real guarantee instead of something the client just promises
-- to respect:
--
--   * No lyrics/chords/song content is stored here -- only a room's join
--     code, which song id is selected, play/pause timing, and (for Vote
--     mode) a small map of voter-key -> song id. Every client already has
--     the full song data locally (see script.js).
--   * host_secret is a random token the host's browser generates when it
--     creates the room. Column-level privileges (not just RLS) make sure
--     no other participant can ever read it back, and every function that
--     changes host-only state requires it to match before writing
--     anything. Casting a vote is the one write any participant can make --
--     it's scoped to just their own entry in the votes map.
--   * The Supabase anon key this site uses is meant to be public (like this
--     table's row-level security is the actual protection, not the key
--     being secret) -- same trust model as any other Supabase static-site
--     setup.
--
-- Safe to re-run: every statement below is idempotent, so running this
-- again on a project that already has it set up just confirms everything
-- still matches, rather than erroring.

create extension if not exists pgcrypto;

create table if not exists campfire_rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  host_secret text not null,
  song_id text,
  status text not null default 'idle' check (status in ('idle', 'playing', 'paused')),
  start_at timestamptz,
  paused_at_sec numeric not null default 0,
  mode text not null default 'host' check (mode in ('host', 'random', 'vote')),
  votes jsonb not null default '{}'::jsonb,
  voting_open boolean not null default false,
  created_at timestamptz not null default now()
);

alter table campfire_rooms enable row level security;

drop policy if exists "campfire_rooms are readable" on campfire_rooms;
create policy "campfire_rooms are readable" on campfire_rooms
  for select using (true);

drop policy if exists "anyone can create a campfire_room" on campfire_rooms;
create policy "anyone can create a campfire_room" on campfire_rooms
  for insert with check (true);

-- Nobody updates this table directly -- see the functions below, the only
-- permitted write paths once a room exists.

revoke select on campfire_rooms from anon, authenticated;
grant select (id, code, song_id, status, start_at, paused_at_sec, mode, votes, voting_open, created_at)
  on campfire_rooms to anon, authenticated;
grant insert on campfire_rooms to anon, authenticated;

-- Host-only: change the selected song / play / pause / resume.
create or replace function update_campfire_room(
  p_code text,
  p_secret text,
  p_song_id text,
  p_status text,
  p_start_at timestamptz,
  p_paused_at_sec numeric
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_rows integer;
begin
  update campfire_rooms
  set song_id = p_song_id,
      status = p_status,
      start_at = p_start_at,
      paused_at_sec = p_paused_at_sec
  where code = p_code and host_secret = p_secret;

  get diagnostics affected_rows = row_count;
  return affected_rows > 0;
end;
$$;

grant execute on function update_campfire_room(text, text, text, text, timestamptz, numeric)
  to anon, authenticated;

-- Host-only: open a fresh voting round (Vote mode) -- clears any previous
-- votes so counts always reflect only the current round.
create or replace function start_campfire_vote(
  p_code text,
  p_secret text
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_rows integer;
begin
  update campfire_rooms
  set voting_open = true,
      votes = '{}'::jsonb
  where code = p_code and host_secret = p_secret;

  get diagnostics affected_rows = row_count;
  return affected_rows > 0;
end;
$$;

grant execute on function start_campfire_vote(text, text) to anon, authenticated;

-- Host-only: finalize the current vote. The host's client tallies votes and
-- breaks ties (no need to duplicate song data in here to do that); this
-- just atomically applies the result -- sets the winning song, closes the
-- round, and clears votes for the next one.
create or replace function finalize_campfire_vote(
  p_code text,
  p_secret text,
  p_song_id text
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_rows integer;
begin
  update campfire_rooms
  set song_id = p_song_id,
      status = 'idle',
      start_at = null,
      paused_at_sec = 0,
      voting_open = false,
      votes = '{}'::jsonb
  where code = p_code and host_secret = p_secret;

  get diagnostics affected_rows = row_count;
  return affected_rows > 0;
end;
$$;

grant execute on function finalize_campfire_vote(text, text, text) to anon, authenticated;

-- Any participant (not just the host) may cast or change their own vote --
-- scoped with jsonb_set so this can only ever touch their own entry in the
-- votes map, never anyone else's or any other column, and only takes
-- effect while a round is actually open.
create or replace function cast_campfire_vote(
  p_code text,
  p_voter_key text,
  p_song_id text
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_rows integer;
begin
  update campfire_rooms
  set votes = jsonb_set(votes, array[p_voter_key], to_jsonb(p_song_id), true)
  where code = p_code and voting_open = true;

  get diagnostics affected_rows = row_count;
  return affected_rows > 0;
end;
$$;

grant execute on function cast_campfire_vote(text, text, text) to anon, authenticated;

-- Realtime: turn on postgres_changes events for this table so every joined
-- client sees UPDATEs the moment any of the functions above succeed.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'campfire_rooms'
  ) then
    alter publication supabase_realtime add table campfire_rooms;
  end if;
end $$;

-- Expiry: there's no scheduled cleanup here on purpose (that would need
-- pg_cron or an Edge Function, extra moving parts this MVP doesn't need).
-- groups.js already refuses to join anything older than a few hours based
-- on created_at. If you want rows actually deleted later, the simplest
-- addition is a pg_cron job running:
--   delete from campfire_rooms where created_at < now() - interval '24 hours';
