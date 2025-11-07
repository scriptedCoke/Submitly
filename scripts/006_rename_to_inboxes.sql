-- Rename submitboxes table to inboxes
alter table if exists public.submitboxes rename to inboxes;

-- Rename column in submissions table
alter table if exists public.submissions rename column submitbox_id to inbox_id;

-- Drop old indexes
drop index if exists public.submitboxes_creator_id_idx;
drop index if exists public.submitboxes_slug_idx;
drop index if exists public.submissions_submitbox_id_idx;

-- Create new indexes with updated names
create index if not exists inboxes_creator_id_idx on public.inboxes(creator_id);
create index if not exists inboxes_slug_idx on public.inboxes(slug);
create index if not exists submissions_inbox_id_idx on public.submissions(inbox_id);

-- Add is_paused column for Unlimited plan feature
alter table public.inboxes add column if not exists is_paused boolean default false;

-- Update RLS policy names (drop old ones and recreate with new names)
drop policy if exists "submitboxes_select_own" on public.inboxes;
drop policy if exists "submitboxes_select_public" on public.inboxes;
drop policy if exists "submitboxes_insert_own" on public.inboxes;
drop policy if exists "submitboxes_update_own" on public.inboxes;
drop policy if exists "submitboxes_delete_own" on public.inboxes;

-- Recreate RLS policies with new names
create policy "inboxes_select_own"
on public.inboxes for select
using (auth.uid() = creator_id);

create policy "inboxes_select_public"
on public.inboxes for select
using (is_active = true);

create policy "inboxes_insert_own"
on public.inboxes for insert
with check (auth.uid() = creator_id);

create policy "inboxes_update_own"
on public.inboxes for update
using (auth.uid() = creator_id);

create policy "inboxes_delete_own"
on public.inboxes for delete
using (auth.uid() = creator_id);
