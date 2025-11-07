-- Fix foreign key constraint in submissions table after rename
-- Drop the old foreign key constraint
alter table if exists public.submissions 
  drop constraint if exists submissions_submitbox_id_fkey;

-- Add the new foreign key constraint with correct table name
alter table if exists public.submissions
  add constraint submissions_inbox_id_fkey
  foreign key (inbox_id)
  references public.inboxes(id)
  on delete cascade;

-- Update RLS policies for submissions to reference inboxes table
drop policy if exists "submissions_select_by_creator" on public.submissions;
drop policy if exists "submissions_delete_by_creator" on public.submissions;

-- Recreate policies with correct table references
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
