-- Fix all references from submitboxes to inboxes in triggers, functions, and policies

-- Drop old triggers
drop trigger if exists on_submission_created on public.submissions;
drop trigger if exists on_submission_deleted on public.submissions;

-- Drop old functions
drop function if exists public.update_profile_stats();
drop function if exists public.decrease_profile_stats();

-- Recreate function to update profile storage and submission counts with correct table name
create or replace function public.update_profile_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  creator_id uuid;
begin
  -- Updated to reference inboxes instead of submitboxes
  select inboxes.creator_id into creator_id
  from public.inboxes
  where inboxes.id = new.inbox_id;

  -- Update the creator's profile stats
  if creator_id is not null then
    update public.profiles
    set 
      total_storage_bytes = total_storage_bytes + new.file_size,
      total_submissions = total_submissions + 1
    where id = creator_id;
  end if;

  return new;
end;
$$;

-- Recreate function to decrease profile stats with correct table name
create or replace function public.decrease_profile_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  creator_id uuid;
begin
  -- Updated to reference inboxes instead of submitboxes
  select inboxes.creator_id into creator_id
  from public.inboxes
  where inboxes.id = old.inbox_id;

  -- Decrease the creator's profile stats
  if creator_id is not null then
    update public.profiles
    set 
      total_storage_bytes = greatest(0, total_storage_bytes - old.file_size),
      total_submissions = greatest(0, total_submissions - 1)
    where id = creator_id;
  end if;

  return old;
end;
$$;

-- Recreate triggers
create trigger on_submission_created
  after insert on public.submissions
  for each row
  execute function public.update_profile_stats();

create trigger on_submission_deleted
  after delete on public.submissions
  for each row
  execute function public.decrease_profile_stats();

-- Drop old RLS policies that reference submitboxes
drop policy if exists "submissions_select_by_creator" on public.submissions;
drop policy if exists "submissions_delete_by_creator" on public.submissions;

-- Recreate RLS policies with correct table name
-- Updated policies to reference inboxes instead of submitboxes
create policy "submissions_select_by_creator"
  on public.submissions for select
  using (
    exists (
      select 1 from public.inboxes
      where inboxes.id = submissions.inbox_id
      and inboxes.creator_id = auth.uid()
    )
  );

create policy "submissions_delete_by_creator"
  on public.submissions for delete
  using (
    exists (
      select 1 from public.inboxes
      where inboxes.id = submissions.inbox_id
      and inboxes.creator_id = auth.uid()
    )
  );
