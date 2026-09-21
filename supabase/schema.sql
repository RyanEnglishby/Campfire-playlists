-- Campfire Groups -- one-time setup.
--
-- Run this once in your Supabase project's SQL editor (Database > SQL
-- Editor > New query). It creates the single table this feature needs and
-- locks it down so the feature works with no user accounts and no server of
-- its own, while still making "only the host can control playback" a real
-- guarantee instead of something the client just promises to respect:
--
--   * No lyrics/chords/song content is stored here -- only a room's join
--     code, which song id is selected, and play/pause timing. Every client
--     already has the full song data locally (see script.js).
--   * host_secret is a random token the host's browser generates when it
--     creates the room. Column-level privileges (not just RLS) make sure
--     no other participant can ever read it back, and the one function
--     that's allowed to change playback state requires it to match before
--     writing anything.
--   * The Supabase anon key this site uses is meant to be public (like this
--     table's row-level security is the actual protection, not the key
--     being secret) -- same trust model as any other Supabase static-site
--     setup.

create extension if not exists pgcrypto;

create table if not exists campfire_rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  host_secret text not null,
  song_id text,
  status text not null default 'idle' check (status in ('idle', 'playing', 'paused')),
  start_at timestamptz,
  paused_at_sec numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table campfire_rooms enable row level security;

-- Anyone with a join code may read a room (to join it, or to resync) -- but
-- see the column grants below: host_secret is never part of what "anyone"
-- can actually select, regardless of this policy.
create policy "campfire_rooms are readable" on campfire_rooms
  for select using (true);

-- Anyone may create a room; creating one doesn't require reading the secret
-- back since the creating browser already generated it locally.
create policy "anyone can create a campfire_room" on campfire_rooms
  for insert with check (true);

-- Nobody updates this table directly -- see update_campfire_room() below,
-- the only permitted write path once a room exists.

revoke select on campfire_rooms from anon, authenticated;
grant select (id, code, song_id, status, start_at, paused_at_sec, created_at)
  on campfire_rooms to anon, authenticated;
grant insert on campfire_rooms to anon, authenticated;

-- The only way to change a room's playback state. Requires the caller to
-- present the matching host_secret, checked here server-side -- a
-- participant's client structurally never has this value (it's generated
-- once in the host's browser and never included in any select), so it
-- can't be forged just by reading the table.
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
  matched boolean := false;
begin
  update campfire_rooms
  set song_id = p_song_id,
      status = p_status,
      start_at = p_start_at,
      paused_at_sec = p_paused_at_sec
  where code = p_code and host_secret = p_secret;

  get diagnostics matched = row_count;
  return matched > 0;
end;
$$;

grant execute on function update_campfire_room(text, text, text, text, timestamptz, numeric)
  to anon, authenticated;

-- Realtime: turn on postgres_changes events for this table so every joined
-- client sees UPDATEs the moment update_campfire_room() succeeds.
alter publication supabase_realtime add table campfire_rooms;

-- Expiry: there's no scheduled cleanup here on purpose (that would need
-- pg_cron or an Edge Function, extra moving parts this MVP doesn't need).
-- groups.js already refuses to join anything older than a few hours based
-- on created_at. If you want rows actually deleted later, the simplest
-- addition is a pg_cron job running:
--   delete from campfire_rooms where created_at < now() - interval '24 hours';
