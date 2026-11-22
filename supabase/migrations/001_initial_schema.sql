-- ERT Hub: initial schema (departments, roles, profiles)

-- 1. Departments (rows, not hardcoded, so we can add sub-teams later)
create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

insert into public.departments (name) values ('Technical'), ('Non-technical');

-- 2. User roles
create type public.user_role as enum (
  'member', 'department_head', 'operations', 'leadership', 'admin'
);

-- 3. Profiles: one row per person who can log in
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  department_id uuid references public.departments(id),
  role public.user_role not null default 'member',
  job_title text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 4. Automatically create a profile whenever someone signs up
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Security: Row Level Security
alter table public.departments enable row level security;
alter table public.profiles enable row level security;

create policy "Signed-in users can read departments"
  on public.departments for select to authenticated using (true);

create policy "Signed-in users can read profiles"
  on public.profiles for select to authenticated using (true);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- People may edit only these columns of their own profile.
-- Without this, someone could make themselves an admin.
revoke update on public.profiles from authenticated;
grant update (full_name, avatar_url, job_title) on public.profiles to authenticated;