-- ERT Hub: keep the member roster private
-- member_roster holds people's names and emails. The app never reads it, and
-- nobody who logs in should be able to. Only the database itself (the roster
-- functions) and you, in the SQL editor, need it.
-- Safe to run more than once.

alter table public.member_roster enable row level security;
revoke all on public.member_roster from anon, authenticated;
