-- Camp Chord accounts -- one-time setup.
--
-- Run this once in your Supabase project's SQL editor, after schema.sql and
-- memories_schema.sql. It adds everything a signed-in Camp Chord account
-- needs beyond Memories (which memories_schema.sql already covers):
-- synced preferences, "heard" tracking, favourites, learning-progress
-- status, practice history, and Campfire Groups host/participant history.
--
--   * Every new table here follows the same shape memories_schema.sql
--     already established and had verified: a `user_id` column referencing
--     auth.users, row-level security restricted to auth.uid() = user_id,
--     and an explicit grant to `authenticated` only -- anon gets no access
--     to any of these at all, there being no legitimate signed-out use.
--   * campfire_rooms itself is only ever extended, never narrowed: Campfire
--     Groups keeps working exactly as before with no account at all. The
--     new host_user_id column is purely additive context for a signed-in
--     host, and campfire_room_participants is a separate, optional record
--     of a signed-in visitor's own join history -- it has no bearing on
--     who can actually control or read a room, which stays governed by
--     host_secret and the existing policies in schema.sql.
--
-- Safe to re-run: every statement below is idempotent.

-- ============================================================================
-- user_preferences -- synced settings (e.g. campfire-mode on/off)
-- ============================================================================
create table if not exists user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  campfire_mode_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table user_preferences enable row level security;

drop policy if exists "users can read their own preferences" on user_preferences;
create policy "users can read their own preferences" on user_preferences
  for select using (auth.uid() = user_id);

drop policy if exists "users can set their own preferences" on user_preferences;
create policy "users can set their own preferences" on user_preferences
  for insert with check (auth.uid() = user_id);

-- Unlike memories (insert/delete only, never edited in place), preferences
-- are a single row that gets updated repeatedly -- this needs an update
-- policy memories never required.
drop policy if exists "users can update their own preferences" on user_preferences;
create policy "users can update their own preferences" on user_preferences
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update on user_preferences to authenticated;

-- ============================================================================
-- heard_songs -- synced "heard" toggle (mark / unmark, not a log)
-- ============================================================================
create table if not exists heard_songs (
  user_id uuid not null references auth.users(id) on delete cascade,
  song_title text not null,
  heard_at timestamptz not null default now(),
  primary key (user_id, song_title)
);

alter table heard_songs enable row level security;

drop policy if exists "users can read their own heard songs" on heard_songs;
create policy "users can read their own heard songs" on heard_songs
  for select using (auth.uid() = user_id);

drop policy if exists "users can mark their own heard songs" on heard_songs;
create policy "users can mark their own heard songs" on heard_songs
  for insert with check (auth.uid() = user_id);

drop policy if exists "users can unmark their own heard songs" on heard_songs;
create policy "users can unmark their own heard songs" on heard_songs
  for delete using (auth.uid() = user_id);

grant select, insert, delete on heard_songs to authenticated;

-- ============================================================================
-- favourites -- same shape/semantics as heard_songs
-- ============================================================================
create table if not exists favourites (
  user_id uuid not null references auth.users(id) on delete cascade,
  song_title text not null,
  favourited_at timestamptz not null default now(),
  primary key (user_id, song_title)
);

alter table favourites enable row level security;

drop policy if exists "users can read their own favourites" on favourites;
create policy "users can read their own favourites" on favourites
  for select using (auth.uid() = user_id);

drop policy if exists "users can add their own favourites" on favourites;
create policy "users can add their own favourites" on favourites
  for insert with check (auth.uid() = user_id);

drop policy if exists "users can remove their own favourites" on favourites;
create policy "users can remove their own favourites" on favourites
  for delete using (auth.uid() = user_id);

grant select, insert, delete on favourites to authenticated;

-- ============================================================================
-- learning_progress -- per-song status (learning / comfortable / mastered)
-- ============================================================================
create table if not exists learning_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  song_title text not null,
  status text not null check (status in ('learning', 'comfortable', 'mastered')),
  updated_at timestamptz not null default now(),
  primary key (user_id, song_title)
);

alter table learning_progress enable row level security;

drop policy if exists "users can read their own learning progress" on learning_progress;
create policy "users can read their own learning progress" on learning_progress
  for select using (auth.uid() = user_id);

drop policy if exists "users can set their own learning progress" on learning_progress;
create policy "users can set their own learning progress" on learning_progress
  for insert with check (auth.uid() = user_id);

-- A status gets changed in place (learning -> comfortable -> mastered), so
-- this needs an update policy the same way user_preferences does.
drop policy if exists "users can update their own learning progress" on learning_progress;
create policy "users can update their own learning progress" on learning_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update on learning_progress to authenticated;

-- ============================================================================
-- practice_sessions -- append-only log; stats are computed client-side from
-- these rows rather than maintained as a separate running total
-- ============================================================================
create table if not exists practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  song_title text not null,
  started_at timestamptz not null,
  duration_seconds integer not null check (duration_seconds >= 0),
  created_at timestamptz not null default now()
);

create index if not exists practice_sessions_user_id_idx on practice_sessions(user_id);

alter table practice_sessions enable row level security;

drop policy if exists "users can read their own practice sessions" on practice_sessions;
create policy "users can read their own practice sessions" on practice_sessions
  for select using (auth.uid() = user_id);

drop policy if exists "users can log their own practice sessions" on practice_sessions;
create policy "users can log their own practice sessions" on practice_sessions
  for insert with check (auth.uid() = user_id);

grant select, insert on practice_sessions to authenticated;

-- ============================================================================
-- campfire_rooms -- additive host linkage (Groups keeps working with no
-- account at all; this is purely optional context for a signed-in host)
-- ============================================================================
alter table campfire_rooms add column if not exists host_user_id uuid references auth.users(id) on delete set null;

-- schema.sql's own grant is a *named column list*, not `select *` --
-- Postgres checks column-level grants before row-level security ever runs,
-- so without re-issuing that grant to include the new column, any query
-- that reads host_user_id (including the "campfires I've hosted" read this
-- enables) would fail with a permission error even though the table-level
-- policy allows it.
revoke select on campfire_rooms from anon, authenticated;
grant select (id, code, song_id, status, start_at, paused_at_sec, mode, votes, voting_open, created_at, host_user_id)
  on campfire_rooms to anon, authenticated;

-- Tightened from schema.sql's original `with check (true)`: still lets
-- anyone create a room (unchanged, no account required), but no longer
-- lets a crafted request attribute a room to someone else's account. Real
-- host *authority* was never based on this column -- it's still 100% gated
-- by host_secret, exactly as before -- this closes a cosmetic spoofing gap,
-- not a functional one.
drop policy if exists "anyone can create a campfire_room" on campfire_rooms;
create policy "anyone can create a campfire_room" on campfire_rooms
  for insert with check (host_user_id is null or host_user_id = auth.uid());

-- ============================================================================
-- campfire_room_participants -- a signed-in visitor's own join history.
-- Entirely separate from the live realtime-presence roster (the "Firefly
-- 42" guest list every joiner already sees) -- that stays exactly as-is,
-- fully anonymous, for every participant whether signed in or not. This
-- table only ever reflects what a signed-in user can see about themself.
-- ============================================================================
create table if not exists campfire_room_participants (
  room_id uuid not null references campfire_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

alter table campfire_room_participants enable row level security;

drop policy if exists "users can read their own campfire join history" on campfire_room_participants;
create policy "users can read their own campfire join history" on campfire_room_participants
  for select using (auth.uid() = user_id);

drop policy if exists "users can record their own campfire joins" on campfire_room_participants;
create policy "users can record their own campfire joins" on campfire_room_participants
  for insert with check (auth.uid() = user_id);

grant select, insert on campfire_room_participants to authenticated;
