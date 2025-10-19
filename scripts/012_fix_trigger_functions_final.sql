-- Drop existing triggers and functions
drop trigger if exists on_submission_created on public.submissions;
drop trigger if exists on_submission_deleted on public.submissions;
drop function if exists public.update_profile_stats();
drop function if exists public.decrease_profile_stats();

-- Recreate function to update profile storage and submission counts
create or replace function public.update_profile_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  creator_id uuid;
begin
  -- Get the creator_id from the inbox (renamed from submitbox)
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

-- Recreate trigger to update stats when submission is created
create trigger on_submission_created
  after insert on public.submissions
  for each row
  execute function public.update_profile_stats();

-- Recreate function to decrease profile stats when submission is deleted
create or replace function public.decrease_profile_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  creator_id uuid;
begin
  -- Get the creator_id from the inbox (renamed from submitbox)
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

-- Recreate trigger to decrease stats when submission is deleted
create trigger on_submission_deleted
  after delete on public.submissions
  for each row
  execute function public.decrease_profile_stats();
