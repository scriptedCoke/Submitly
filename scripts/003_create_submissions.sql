-- Create submissions table for file uploads
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  submitbox_id uuid not null references public.submitboxes(id) on delete cascade,
  submitter_user_id uuid references auth.users(id) on delete set null,
  submitter_name text not null,
  file_url text not null,
  file_name text not null,
  file_size bigint not null,
  file_type text not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.submissions enable row level security;

-- RLS Policies for submissions
-- Submitbox creators can view submissions to their submitboxes
create policy "submissions_select_by_creator"
  on public.submissions for select
  using (
    exists (
      select 1 from public.submitboxes
      where submitboxes.id = submissions.submitbox_id
      and submitboxes.creator_id = auth.uid()
    )
  );

-- Authenticated users can view their own submissions
create policy "submissions_select_own"
  on public.submissions for select
  using (auth.uid() = submitter_user_id);

-- Anyone can insert submissions (public submission form)
create policy "submissions_insert_public"
  on public.submissions for insert
  with check (true);

-- Submitbox creators can delete submissions to their submitboxes
create policy "submissions_delete_by_creator"
  on public.submissions for delete
  using (
    exists (
      select 1 from public.submitboxes
      where submitboxes.id = submissions.submitbox_id
      and submitboxes.creator_id = auth.uid()
    )
  );

-- Create indexes for faster lookups
create index if not exists submissions_submitbox_id_idx on public.submissions(submitbox_id);
create index if not exists submissions_submitter_user_id_idx on public.submissions(submitter_user_id);
create index if not exists submissions_created_at_idx on public.submissions(created_at desc);
