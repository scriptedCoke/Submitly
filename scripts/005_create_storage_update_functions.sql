-- Function to update profile storage and submission counts
create or replace function public.update_profile_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  creator_id uuid;
begin
  -- Get the creator_id from the submitbox
  select submitboxes.creator_id into creator_id
  from public.submitboxes
  where submitboxes.id = new.submitbox_id;

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

-- Create trigger to update stats when submission is created
drop trigger if exists on_submission_created on public.submissions;

create trigger on_submission_created
  after insert on public.submissions
  for each row
  execute function public.update_profile_stats();

-- Function to decrease profile stats when submission is deleted
create or replace function public.decrease_profile_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  creator_id uuid;
begin
  -- Get the creator_id from the submitbox
  select submitboxes.creator_id into creator_id
  from public.submitboxes
  where submitboxes.id = old.submitbox_id;

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

-- Create trigger to decrease stats when submission is deleted
drop trigger if exists on_submission_deleted on public.submissions;

create trigger on_submission_deleted
  after delete on public.submissions
  for each row
  execute function public.decrease_profile_stats();
