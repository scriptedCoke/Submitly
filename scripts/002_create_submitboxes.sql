-- Create submitboxes table for submission forms
create table if not exists public.submitboxes (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.submitboxes enable row level security;

-- RLS Policies for submitboxes
-- Creators can view their own submitboxes
create policy "submitboxes_select_own"
  on public.submitboxes for select
  using (auth.uid() = creator_id);

-- Anyone can view active submitboxes by slug (for public submission form)
create policy "submitboxes_select_public"
  on public.submitboxes for select
  using (is_active = true);

-- Creators can insert their own submitboxes
create policy "submitboxes_insert_own"
  on public.submitboxes for insert
  with check (auth.uid() = creator_id);

-- Creators can update their own submitboxes
create policy "submitboxes_update_own"
  on public.submitboxes for update
  using (auth.uid() = creator_id);

-- Creators can delete their own submitboxes
create policy "submitboxes_delete_own"
  on public.submitboxes for delete
  using (auth.uid() = creator_id);

-- Create indexes for faster lookups
create index if not exists submitboxes_creator_id_idx on public.submitboxes(creator_id);
create index if not exists submitboxes_slug_idx on public.submitboxes(slug);
