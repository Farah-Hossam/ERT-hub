-- ERT Hub: teams, memberships and team-based visibility
-- (Run after 001 to 005.)
--
-- Who sees a task:
--   * its assignee and its creator
--   * operations, leadership and admins (the top board): every task
--   * the head of the department a team belongs to: that team's tasks
--   * a team's leads: that team's tasks
--   * a team's members: that team's tasks, unless the team is set to
--     "members see only their own tasks"

-- ---------- Tables ----------

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(trim(name)) > 0),
  color text not null default '#D62832' check (color ~ '^#[0-9a-fA-F]{6}$'),
  department_id uuid references public.departments(id) on delete set null,
  members_see_team_tasks boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.team_memberships (
  team_id uuid not null references public.teams(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  is_lead boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (team_id, profile_id)
);

create index team_memberships_profile_idx on public.team_memberships (profile_id);

alter table public.tasks
  add column team_id uuid references public.teams(id) on delete set null;

create index tasks_team_idx on public.tasks (team_id);

-- ---------- Helper functions ----------
-- They run with the owner's rights so the security rules can look at
-- memberships without running into themselves.

create function public.is_top_board()
returns boolean
language sql stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role in ('operations', 'leadership', 'admin')
  );
$$;

create function public.is_team_lead(p_team uuid)
returns boolean
language sql stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.team_memberships
    where team_id = p_team and profile_id = (select auth.uid()) and is_lead
  );
$$;

create function public.is_team_member(p_team uuid)
returns boolean
language sql stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.team_memberships
    where team_id = p_team and profile_id = (select auth.uid())
  );
$$;

-- Is the signed-in person the head of the department this team belongs to?
create function public.heads_team_department(p_team uuid)
returns boolean
language sql stable
security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    join public.teams t on t.department_id = p.department_id
    where p.id = (select auth.uid())
      and p.role = 'department_head'
      and t.id = p_team
  );
$$;

-- Create and edit tasks for this team, and review its members' reports
create function public.can_manage_team(p_team uuid)
returns boolean
language sql stable
security definer set search_path = ''
as $$
  select public.has_role(array['operations','admin']::public.user_role[])
      or public.heads_team_department(p_team)
      or public.is_team_lead(p_team);
$$;

-- Add and remove this team's members
create function public.can_assign_team(p_team uuid)
returns boolean
language sql stable
security definer set search_path = ''
as $$
  select public.has_role(array['operations','admin']::public.user_role[])
      or public.heads_team_department(p_team);
$$;

create function public.can_view_team_tasks(p_team uuid)
returns boolean
language sql stable
security definer set search_path = ''
as $$
  select public.is_top_board()
      or public.can_manage_team(p_team)
      or (
        public.is_team_member(p_team)
        and exists (
          select 1 from public.teams t
          where t.id = p_team and t.members_see_team_tasks
        )
      );
$$;

-- Does the signed-in person manage at least one team this person belongs to?
create function public.manages_member(p_member uuid)
returns boolean
language sql stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.team_memberships m
    where m.profile_id = p_member and public.can_manage_team(m.team_id)
  );
$$;

revoke execute on function
  public.is_top_board(),
  public.is_team_lead(uuid),
  public.is_team_member(uuid),
  public.heads_team_department(uuid),
  public.can_manage_team(uuid),
  public.can_assign_team(uuid),
  public.can_view_team_tasks(uuid),
  public.manages_member(uuid)
from public, anon;

grant execute on function
  public.is_top_board(),
  public.is_team_lead(uuid),
  public.is_team_member(uuid),
  public.heads_team_department(uuid),
  public.can_manage_team(uuid),
  public.can_assign_team(uuid),
  public.can_view_team_tasks(uuid),
  public.manages_member(uuid)
to authenticated;

-- ---------- Teams and memberships ----------

alter table public.teams enable row level security;
alter table public.team_memberships enable row level security;

create policy "Signed-in users can read teams"
  on public.teams for select to authenticated using (true);

create policy "Operations and admins can create teams"
  on public.teams for insert to authenticated
  with check (public.has_role(array['operations','admin']::public.user_role[]));

create policy "Operations and admins can edit teams"
  on public.teams for update to authenticated
  using (public.has_role(array['operations','admin']::public.user_role[]))
  with check (public.has_role(array['operations','admin']::public.user_role[]));

create policy "Operations and admins can delete teams"
  on public.teams for delete to authenticated
  using (public.has_role(array['operations','admin']::public.user_role[]));

create policy "Signed-in users can see who is in which team"
  on public.team_memberships for select to authenticated using (true);

create policy "Add members to teams you assign"
  on public.team_memberships for insert to authenticated
  with check (public.can_assign_team(team_id));

create policy "Change memberships of teams you assign"
  on public.team_memberships for update to authenticated
  using (public.can_assign_team(team_id))
  with check (public.can_assign_team(team_id));

create policy "Remove members from teams you assign"
  on public.team_memberships for delete to authenticated
  using (public.can_assign_team(team_id));

grant select, insert, update, delete on public.teams to authenticated;
grant select, insert, update, delete on public.team_memberships to authenticated;

-- ---------- Tasks: visibility and who can manage ----------

drop policy "Signed-in users can read tasks" on public.tasks;
drop policy "Managers can create tasks" on public.tasks;
drop policy "Assignees, creators and managers can update tasks" on public.tasks;

create policy "See tasks that are yours or belong to your teams"
  on public.tasks for select to authenticated
  using (
    assignee_id = (select auth.uid())
    or created_by = (select auth.uid())
    or public.is_top_board()
    or (team_id is not null and public.can_view_team_tasks(team_id))
  );

create policy "Create tasks for teams you manage"
  on public.tasks for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and (
      public.has_role(array['operations','admin']::public.user_role[])
      or (team_id is not null and public.can_manage_team(team_id))
    )
  );

create policy "Update tasks you are involved in or manage"
  on public.tasks for update to authenticated
  using (
    assignee_id = (select auth.uid())
    or created_by = (select auth.uid())
    or public.has_role(array['operations','admin']::public.user_role[])
    or (team_id is not null and public.can_manage_team(team_id))
  )
  with check (
    assignee_id = (select auth.uid())
    or created_by = (select auth.uid())
    or public.has_role(array['operations','admin']::public.user_role[])
    or (team_id is not null and public.can_manage_team(team_id))
  );

-- Same idea as before, now with teams: someone who only has the task assigned
-- to them may change its status and progress, nothing else. A task can only be
-- moved to a team you manage.
create or replace function public.tasks_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  is_manager boolean;
begin
  if uid is not null then
    is_manager :=
      public.has_role(array['operations','admin']::public.user_role[])
      or (old.team_id is not null and public.can_manage_team(old.team_id));

    if new.team_id is distinct from old.team_id
       and not (
         public.has_role(array['operations','admin']::public.user_role[])
         or (new.team_id is not null and public.can_manage_team(new.team_id))
       ) then
      raise exception 'You can only move a task to a team you manage';
    end if;

    if old.created_by is distinct from uid and not is_manager then
      if (new.title, new.description, new.priority, new.assignee_id, new.department_id,
          new.team_id, new.start_date, new.due_date, new.created_by)
         is distinct from
         (old.title, old.description, old.priority, old.assignee_id, old.department_id,
          old.team_id, old.start_date, old.due_date, old.created_by)
      then
        raise exception 'You can only change the status and progress of tasks assigned to you';
      end if;
    end if;
  end if;

  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Reports: reviewers see their own people ----------

drop policy "Read own reports, or submitted reports as a reviewer" on public.reports;
drop policy "Authors edit own reports, reviewers review submitted ones" on public.reports;

create policy "Read own reports, and submitted reports of people you oversee"
  on public.reports for select to authenticated
  using (
    author_id = (select auth.uid())
    or (
      status <> 'draft'
      and (public.is_top_board() or public.manages_member(author_id))
    )
  );

create policy "Authors edit own reports, reviewers review submitted ones"
  on public.reports for update to authenticated
  using (
    author_id = (select auth.uid())
    or (
      status <> 'draft'
      and (
        public.has_role(array['operations','admin']::public.user_role[])
        or public.manages_member(author_id)
      )
    )
  )
  with check (
    author_id = (select auth.uid())
    or public.has_role(array['operations','admin']::public.user_role[])
    or public.manages_member(author_id)
  );

-- ---------- Editing people ----------
-- People cannot edit their own role or department (we locked those columns).
-- Operations and admins do it through this function instead.

create function public.admin_update_profile(
  p_id uuid,
  p_full_name text,
  p_role public.user_role,
  p_department_id uuid,
  p_job_title text,
  p_is_active boolean
)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  v_caller public.user_role;
  v_target public.user_role;
begin
  select role into v_caller from public.profiles where id = (select auth.uid());
  if v_caller is null or v_caller not in ('operations', 'admin') then
    raise exception 'Only operations and admins can edit people';
  end if;

  select role into v_target from public.profiles where id = p_id;
  if v_target is null then
    raise exception 'Person not found';
  end if;

  if p_role is distinct from v_target and v_caller <> 'admin' then
    raise exception 'Only admins can change roles';
  end if;

  if p_id = (select auth.uid()) and v_caller = 'admin'
     and (p_role <> 'admin' or not p_is_active) then
    raise exception 'You cannot remove your own admin access';
  end if;

  update public.profiles
  set full_name = coalesce(nullif(trim(p_full_name), ''), full_name),
      role = p_role,
      department_id = p_department_id,
      job_title = nullif(trim(p_job_title), ''),
      is_active = p_is_active
  where id = p_id;
end;
$$;

revoke execute on function public.admin_update_profile(uuid, text, public.user_role, uuid, text, boolean) from public, anon;
grant execute on function public.admin_update_profile(uuid, text, public.user_role, uuid, text, boolean) to authenticated;
