-- ERT Hub: automatic report summaries
-- A report now stores a "snapshot" of the member's tasks, completion and nearby
-- events, taken when the report is saved. It stays as it was, even after the
-- tasks change later. (Run 004_reports_and_events.sql first.)

alter table public.reports add column snapshot jsonb;

alter table public.reports
  add constraint reports_snapshot_size
  check (snapshot is null or octet_length(snapshot::text) <= 200000);

-- Same rules as before, plus: reviewers cannot change the snapshot either.
create or replace function public.reports_before_update()
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
    if (new.accomplished, new.challenges, new.blockers, new.help_needed, new.next_week,
        new.submitted_at, new.snapshot)
       is distinct from
       (old.accomplished, old.challenges, old.blockers, old.help_needed, old.next_week,
        old.submitted_at, old.snapshot) then
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
