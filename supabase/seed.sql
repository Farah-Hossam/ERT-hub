insert into public.tasks
  (title, description, status, priority, assignee_id, created_by,
   department_id, start_date, due_date, progress)
select
  v.title, v.description,
  v.status::public.task_status, v.priority::public.task_priority,
  p.id, p.id,
  (select id from public.departments where name = v.dept),
  current_date + v.days - 7, current_date + v.days, v.progress
from (select id from public.profiles order by created_at limit 1) p,
(values
  ('Design the steering column', 'Draft the first geometry and check packaging.', 'in_progress', 'high', 'Technical', 5, 30),
  ('Weld the chassis jig', 'Build the fixture for the main frame.', 'todo', 'medium', 'Technical', 12, 0),
  ('Order battery cells', 'Waiting for the supplier quote.', 'blocked', 'urgent', 'Technical', -2, 40),
  ('Prepare the sponsor deck', 'First version for the sponsorship meeting.', 'under_review', 'high', 'Non-technical', 3, 90),
  ('Book the workshop room', 'Reserve the room for the training session.', 'completed', 'low', 'Non-technical', -5, 100),
  ('Plan the recruitment campaign', 'Outline channels and dates.', 'backlog', 'medium', 'Non-technical', 30, 0)
) as v(title, description, status, priority, dept, days, progress);

