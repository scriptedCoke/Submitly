-- Auto-create profile when user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, subscription_tier)
  values (
    new.id,
    new.email,
    'basic'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger to auto-create profile
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
