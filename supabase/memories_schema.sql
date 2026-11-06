-- Synced Memories -- one-time setup.
--
-- Run this once in your Supabase project's SQL editor (Database > SQL
-- Editor > New query) -- the same project supabase/schema.sql already set
-- up for Campfire Groups. It creates the table a signed-in visitor's
-- Memories sync to, so the same photos/captions show up on every device
-- they sign into.
--
-- Signed-out visitors are completely unaffected: Memories still works the
-- same as before, stored only in that browser's localStorage. This table
-- only comes into play once someone signs in (see auth.js / memories.js).
--
--   * Each row belongs to exactly one auth.users row (user_id). Row-level
--     security means a signed-in visitor can only ever see or change their
--     own memories -- there is no query that can read anyone else's.
--   * photo is the same compressed JPEG data URL memories.js already builds
--     client-side before saving locally (resized, re-encoded, usually well
--     under half a megabyte) -- stored as-is, no separate file/object
--     storage involved.
--
-- Also run this once in the Auth settings: Authentication > URL
-- Configuration > Redirect URLs -- add this site's account page (e.g.
-- https://ryanenglishby.github.io/Campfire-playlists/account.html) so
-- sign-up confirmation and password-reset emails (see account_schema.sql
-- and auth.js) can actually redirect back here. Without that step,
-- clicking either emailed link will fail or land on the wrong page.
--
-- Safe to re-run: every statement below is idempotent.

create table if not exists memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  song_title text not null,
  caption text,
  memory_date date,
  photo text not null,
  created_at timestamptz not null default now()
);

create index if not exists memories_user_id_idx on memories(user_id);

alter table memories enable row level security;

-- Row-level security restricts which *rows* a policy lets through, but
-- Postgres still checks ordinary table privileges first -- without this
-- grant, every query from PostgREST would fail with a permission error
-- before RLS ever gets a say. Only authenticated (signed-in) visitors get
-- any access at all; anon gets nothing, there being no legitimate
-- not-signed-in use of this table.
grant select, insert, delete on memories to authenticated;

drop policy if exists "memories are only visible to their owner" on memories;
create policy "memories are only visible to their owner" on memories
  for select using (auth.uid() = user_id);

drop policy if exists "users can add their own memories" on memories;
create policy "users can add their own memories" on memories
  for insert with check (auth.uid() = user_id);

drop policy if exists "users can delete their own memories" on memories;
create policy "users can delete their own memories" on memories
  for delete using (auth.uid() = user_id);

-- No update policy -- memories.js only ever adds or deletes, never edits a
-- saved memory in place, so there's no write path that needs one.

-- No realtime needed here (unlike campfire_rooms) -- this is private,
-- single-visitor data with no live cross-device sync requirement beyond a
-- normal reload/re-sign-in.
