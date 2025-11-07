-- Add full_name column to profiles table
alter table public.profiles
add column if not exists full_name text;

-- Update the handle_new_user function to extract full name from metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, subscription_tier)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    'basic'
  )
  on conflict (id) do update
  set full_name = coalesce(
    excluded.full_name,
    profiles.full_name,
    split_part(excluded.email, '@', 1)
  );

  return new;
end;
$$;
