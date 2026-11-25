-- ERT Hub: more than one assignee per task
-- (Run after 001 to 007.)
--
-- Assignees now live in their own table, one row per person per task.
-- The old tasks.assignee_id column is left in place for now so nothing breaks
-- while the app is updated. The security rules accept either.

create table public.task_assignees (
  task_id uuid not null references public.tasks(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (task_id, profile_id)
);

create index task_assignees_profile_idx on public.task_assignees (profile_id);

-- Keep everyone who is already assigned
insert into public.task_assignees (task_id, profile_id)
select id, assignee_id from public.tasks where assignee_id is not null
on conflict do nothing;

-- ---------- Helper functions ----------

create function public.is_task_assignee(p_task uuid)
returns boolean
language sql stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.task_assignees
    where task_id = p_task and profile_id = (select auth.uid())
  );
$$;

-- Same people who may edit a task: its creator, operations/admin, and managers of its team
create function public.can_manage_task(p_task uuid)
returns boolean
language sql stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.tasks t
    where t.id = p_task
      and (
        t.created_by = (select auth.uid())
        or public.has_role(array['operations','admin']::public.user_role[])
        or (t.team_id is not null and public.can_manage_team(t.team_id))
      )
  );
$$;

revoke execute on function public.is_task_assignee(uuid), public.can_manage_task(uuid)
  from public, anon;
grant execute on function public.is_task_assignee(uuid), public.can_manage_task(uuid)
  to authenticated;

-- ---------- Security for the new table ----------

alter table public.task_assignees enable row level security;

create policy "See assignees of tasks you can see"
  on public.task_assignees for select to authenticated
  using (exists (select 1 from public.tasks t where t.id = task_id));

create policy "Managers add assignees"
  on public.task_assignees for insert to authenticated
  with check (public.can_manage_task(task_id));

create policy "Managers remove assignees"
  on public.task_assignees for delete to authenticated
  using (public.can_manage_task(task_id));

grant select, insert, delete on public.task_assignees to authenticated;

-- ---------- Tasks: every assignee can see and update their task ----------

drop policy "See tasks that are yours or belong to your teams" on public.tasks;
drop policy "Update tasks you are involved in or manage" on public.tasks;

create policy "See tasks that are yours or belong to your teams"
  on public.tasks for select to authenticated
  using (
    assignee_id = (select auth.uid())
    or public.is_task_assignee(id)
    or created_by = (select auth.uid())
    or public.is_top_board()
    or (team_id is not null and public.can_view_team_tasks(team_id))
  );

create policy "Update tasks you are involved in or manage"
  on public.tasks for update to authenticated
  using (
    assignee_id = (select auth.uid())
    or public.is_task_assignee(id)
    or created_by = (select auth.uid())
    or public.has_role(array['operations','admin']::public.user_role[])
    or (team_id is not null and public.can_manage_team(team_id))
  )
  with check (
    assignee_id = (select auth.uid())
    or public.is_task_assignee(id)
    or created_by = (select auth.uid())
    or public.has_role(array['operations','admin']::public.user_role[])
    or (team_id is not null and public.can_manage_team(team_id))
  );
