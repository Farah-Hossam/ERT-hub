grant usage on schema public to authenticated;

grant select on public.departments to authenticated;
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;