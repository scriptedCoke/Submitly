-- Create profiles table for user data and subscription management
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamp with time zone default now(),
  subscription_tier text not null default 'basic' check (subscription_tier in ('basic', 'unlimited')),
  stripe_customer_id text,
  stripe_subscription_id text,
  total_storage_bytes bigint not null default 0,
  total_submissions integer not null default 0
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS Policies for profiles
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- Create index for faster lookups
create index if not exists profiles_stripe_customer_id_idx on public.profiles(stripe_customer_id);
