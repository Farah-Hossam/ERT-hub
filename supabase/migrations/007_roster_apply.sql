-- ERT Hub: apply the member_roster table to real profiles
-- (Run after 001 to 006, and after importing members_import.csv into member_roster.)
--
-- When a person signs up with an email that is in member_roster, their profile
-- automatically gets the right role, department, job title and team.
-- Nothing is changed for emails that are not in the roster.
--
-- To change someone later: edit their row in member_roster, then run
--   select public.apply_roster_to_profile(id) from public.profiles;

create or replace function public.apply_roster_to_profile(p_id uuid)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  r record;
  v_current public.user_role;
  v_role public.user_role;
  v_teams text[];
  v_dept uuid;
  v_lead boolean;
begin
  select ro.* into r
  from public.member_roster ro
  join public.profiles p on lower(trim(p.email)) = lower(trim(ro.email))
  where p.id = p_id;

  if not found then
    return;
  end if;

  select role into v_current from public.profiles where id = p_id;

  -- Role
  v_role := case r."position"
    when 'Chairperson' then 'leadership'
    when 'Treasurer' then 'leadership'
    when 'Head of Technical Departments' then 'department_head'
    when 'Head of Operations and Logistics' then 'operations'
    when 'Vice Head of Operations and Logistics' then 'operations'
    else 'member'
  end::public.user_role;

  -- Never demote an existing admin
  if v_current = 'admin' then
    v_role := 'admin';
  end if;

  -- Teams (names must match the teams table)
  v_teams := case
    when r."position" = 'Head of Mechanical Team'
      then array['Mechanical Dynamics Team', 'Mechanical Statics Team']
    when r."position" = 'Head of Dynamic Systems'
      then array['Mechanical Dynamics Team']
    when r."position" = 'Head of Static Systems'
      then array['Mechanical Statics Team']
    when r."position" in ('Head of Electrical Department', 'Vice Head of Electrical Department')
      then array['Electrical Team']
    when r."position" in ('Head of Digital Marketing and Social Media',
                          'Vice Head of Digital Marketing and Social Media')
      then array['Media Team']
    when r."position" = 'Head of OC'
      then array['Organizing Team']
    when r."position" = 'Member' and r.team = 'Mechanical' and r.subteam = 'Dynamic Systems'
      then array['Mechanical Dynamics Team']
    when r."position" = 'Member' and r.team = 'Mechanical' and r.subteam = 'Static Systems'
      then array['Mechanical Statics Team']
    when r."position" = 'Member' and r.team = 'Electrical'
      then array['Electrical Team']
    when r."position" = 'Member' and r.team = 'Media'
      then array['Media Team']
    when r."position" = 'Member' and r.team = 'OC'
      then array['Organizing Team']
    else array[]::text[]
  end;

  -- Anyone with a position other than plain "Member" leads their team(s)
  v_lead := r."position" <> 'Member';

  -- Department: the Technical head is set directly, everyone else follows their team
  if r."position" = 'Head of Technical Departments' then
    select id into v_dept from public.departments where name = 'Technical';
  elsif array_length(v_teams, 1) > 0 then
    select department_id into v_dept from public.teams where name = v_teams[1];
  end if;

  update public.profiles
  set full_name = case when full_name = '' then r.full_name else full_name end,
      role = v_role,
      department_id = coalesce(v_dept, department_id),
      job_title = case when r."position" = 'Member' then job_title else r."position" end
  where id = p_id;

  insert into public.team_memberships (team_id, profile_id, is_lead)
  select t.id, p_id, v_lead
  from public.teams t
  where t.name = any(v_teams)
  on conflict (team_id, profile_id) do update set is_lead = excluded.is_lead;
end;
$$;

-- Run automatically for every new profile. If anything goes wrong here, the
-- sign-up must still succeed, so errors are swallowed.
create or replace function public.apply_roster_on_new_profile()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  begin
    perform public.apply_roster_to_profile(new.id);
  exception when others then
    null;
  end;
  return new;
end;
$$;

create trigger apply_roster_on_profile_insert
  after insert on public.profiles
  for each row execute function public.apply_roster_on_new_profile();

-- Only the database itself and the SQL editor may run these, not app users.
revoke execute on function public.apply_roster_to_profile(uuid) from public, anon, authenticated;
revoke execute on function public.apply_roster_on_new_profile() from public, anon, authenticated;

-- Apply to everyone who already has a profile (right now that is only you).
select public.apply_roster_to_profile(id) from public.profiles;
