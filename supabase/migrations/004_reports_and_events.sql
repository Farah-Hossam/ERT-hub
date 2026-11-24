-- ERT Hub: weekly reports and events

-- ---------- Weekly reports ----------

create type public.report_status as enum ('draft', 'submitted', 'reviewed');

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  week_start date not null,
  accomplished text not null default '',
  challenges text not null default '',
  blockers text not null default '',
  help_needed text not null default '',
  next_week text not null default '',
  status public.report_status not null default 'draft',
  submitted_at timestamptz,
  reviewer_id uuid references public.profiles(id) on delete set null,
  review_feedback text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (author_id, week_start)
);

create index reports_week_idx on public.reports (week_start);

-- Which tasks a report talks about, with a note for each
create table public.report_task_updates (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  note text not null check (length(trim(note)) > 0),
  unique (report_id, task_id)
);

alter table public.reports enable row level security;
alter table public.report_task_updates enable row level security;

-- Drafts are private. Reviewers see submitted reports only.
create policy "Read own reports, or submitted reports as a reviewer"
  on public.reports for select to authenticated
  using (
    author_id = (select auth.uid())
    or (
      status <> 'draft'
      and public.has_role(array['department_head','operations','leadership','admin']::public.user_role[])
    )
  );

create policy "Authors create their own draft reports"
  on public.reports for insert to authenticated
  with check (author_id = (select auth.uid()) and status = 'draft');

create policy "Authors edit own reports, reviewers review submitted ones"
  on public.reports for update to authenticated
  using (
    author_id = (select auth.uid())
    or (
      status <> 'draft'
      and public.has_role(array['department_head','operations','admin']::public.user_role[])
    )
  )
  with check (
    author_id = (select auth.uid())
    or public.has_role(array['department_head','operations','admin']::public.user_role[])
  );

create policy "Read task updates of reports you can see"
  on public.report_task_updates for select to authenticated
  using (exists (select 1 from public.reports r where r.id = report_id));

create policy "Authors manage task updates of their drafts"
  on public.report_task_updates for all to authenticated
  using (
    exists (
      select 1 from public.reports r
      where r.id = report_id and r.author_id = (select auth.uid()) and r.status = 'draft'
    )
  )
  with check (
    exists (
      select 1 from public.reports r
      where r.id = report_id and r.author_id = (select auth.uid()) and r.status = 'draft'
    )
  );

-- Rules the policies cannot express:
--  * authors can edit only while a report is a draft, and cannot review it
--  * reviewers can only add feedback, never change what the author wrote
create function public.reports_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  -- Changes made directly in the Supabase dashboard have no user
  if uid is null then
    return new;
  end if;

  if (new.author_id, new.week_start) is distinct from (old.author_id, old.week_start) then
    raise exception 'The author and the week of a report cannot be changed';
  end if;

  if uid = old.author_id then
    if old.status <> 'draft' then
      raise exception 'A submitted report can no longer be edited';
    end if;
    if new.status = 'reviewed' then
      raise exception 'You cannot review your own report';
    end if;
    new.reviewer_id := null;
    new.review_feedback := null;
    new.reviewed_at := null;
    if new.status = 'submitted' then
      new.submitted_at := now();
    end if;
  else
    if (new.accomplished, new.challenges, new.blockers, new.help_needed, new.next_week, new.submitted_at)
       is distinct from
       (old.accomplished, old.challenges, old.blockers, old.help_needed, old.next_week, old.submitted_at) then
      raise exception 'Reviewers can only add feedback';
    end if;
    new.status := 'reviewed';
    new.reviewer_id := uid;
    new.reviewed_at := now();
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger reports_before_update
  before update on public.reports
  for each row execute function public.reports_before_update();

grant select, insert, update on public.reports to authenticated;
grant select, insert, update, delete on public.report_task_updates to authenticated;

-- ---------- Events ----------

create type public.event_type as enum (
  'meeting', 'workshop', 'training', 'recruitment', 'competition', 'other'
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  description text,
  type public.event_type not null default 'meeting',
  location text,
  start_at timestamptz not null,
  end_at timestamptz,
  organizer_id uuid default auth.uid() references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  check (end_at is null or end_at >= start_at)
);

create index events_start_idx on public.events (start_at);

alter table public.events enable row level security;

create policy "Signed-in users can read events"
  on public.events for select to authenticated
  using (true);

create policy "Managers can create events"
  on public.events for insert to authenticated
  with check (public.has_role(array['department_head','operations','admin']::public.user_role[]));

create policy "Managers can update events"
  on public.events for update to authenticated
  using (public.has_role(array['department_head','operations','admin']::public.user_role[]))
  with check (public.has_role(array['department_head','operations','admin']::public.user_role[]));

create policy "Managers can delete events"
  on public.events for delete to authenticated
  using (public.has_role(array['department_head','operations','admin']::public.user_role[]));

grant select, insert, update, delete on public.events to authenticated;
