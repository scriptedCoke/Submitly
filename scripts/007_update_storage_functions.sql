-- Drop old functions
drop function if exists public.update_storage_on_submission_insert();
drop function if exists public.update_storage_on_submission_delete();
drop trigger if exists update_storage_after_submission_insert on public.submissions;
drop trigger if exists update_storage_after_submission_delete on public.submissions;

-- Recreate storage update function for inserts with updated table name
create or replace function public.update_storage_on_submission_insert()
returns trigger as $$
declare
  creator_id uuid;
begin
  -- Get the creator_id from the inbox
  select inboxes.creator_id into creator_id
  from public.inboxes
  where inboxes.id = new.inbox_id;

  -- Update the creator's storage usage
  update public.profiles
  set storage_used = storage_used + new.file_size
  where id = creator_id;

  return new;
end;
$$ language plpgsql security definer;

-- Recreate storage update function for deletes with updated table name
create or replace function public.update_storage_on_submission_delete()
returns trigger as $$
declare
  creator_id uuid;
begin
  -- Get the creator_id from the inbox
  select inboxes.creator_id into creator_id
  from public.inboxes
  where inboxes.id = old.inbox_id;

  -- Update the creator's storage usage
  update public.profiles
  set storage_used = greatest(0, storage_used - old.file_size)
  where id = creator_id;

  return old;
end;
$$ language plpgsql security definer;

-- Recreate triggers
create trigger update_storage_after_submission_insert
after insert on public.submissions
for each row
execute function public.update_storage_on_submission_insert();

create trigger update_storage_after_submission_delete
after delete on public.submissions
for each row
execute function public.update_storage_on_submission_delete();
