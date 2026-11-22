-- ERT Hub: tasks

-- Helper: does the signed-in user have one of these roles?
create function public.has_role(allowed public.user_role[])
returns boolean
language sql stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = any(allowed)
  );
$$;

revoke execute on function public.has_role(public.user_role[]) from public, anon;
grant execute on function public.has_role(public.user_role[]) to authenticated;

-- Allowed values
create type public.task_status as enum (
  'backlog', 'todo', 'in_progress', 'under_review', 'completed', 'blocked'
);
create type public.task_priority as enum ('low', 'medium', 'high', 'urgent');

-- Tasks
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  task_number bigint generated always as identity unique,
  title text not null check (length(trim(title)) > 0),
  description text,
  status public.task_status not null default 'todo',
  priority public.task_priority not null default 'medium',
  assignee_id uuid references public.profiles(id) on delete set null,
  created_by uuid not null references public.profiles(id) default auth.uid(),
  department_id uuid references public.departments(id),
  start_date date,
  due_date date,
  progress integer not null default 0 check (progress between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (due_date is null or start_date is null or due_date >= start_date)
);

create index tasks_assignee_idx on public.tasks (assignee_id);
create index tasks_status_idx on public.tasks (status);
create index tasks_due_date_idx on public.tasks (due_date);

-- Security
alter table public.tasks enable row level security;

create policy "Signed-in users can read tasks"
  on public.tasks for select to authenticated
  using (true);

create policy "Managers can create tasks"
  on public.tasks for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and public.has_role(array['department_head','operations','admin']::public.user_role[])
  );

create policy "Assignees, creators and managers can update tasks"
  on public.tasks for update to authenticated
  using (
    assignee_id = (select auth.uid())
    or created_by = (select auth.uid())
    or public.has_role(array['department_head','operations','admin']::public.user_role[])
  )
  with check (
    assignee_id = (select auth.uid())
    or created_by = (select auth.uid())
    or public.has_role(array['department_head','operations','admin']::public.user_role[])
  );

create policy "Operations and admins can delete tasks"
  on public.tasks for delete to authenticated
  using (public.has_role(array['operations','admin']::public.user_role[]));

-- A plain assignee may change only status and progress.
-- Also keeps updated_at current.
create function public.tasks_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null
     and old.created_by is distinct from (select auth.uid())
     and not public.has_role(array['department_head','operations','admin']::public.user_role[])
  then
    if (new.title, new.description, new.priority, new.assignee_id,
        new.department_id, new.start_date, new.due_date, new.created_by)
       is distinct from
       (old.title, old.description, old.priority, old.assignee_id,
        old.department_id, old.start_date, old.due_date, old.created_by)
    then
      raise exception 'You can only change the status and progress of tasks assigned to you';
    end if;
  end if;

  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_before_update
  before update on public.tasks
  for each row execute function public.tasks_before_update();