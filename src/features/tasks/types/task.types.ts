export type TaskStatus =
  | "backlog"
  | "todo"
  | "in_progress"
  | "under_review"
  | "completed"
  | "blocked";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  task_number: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  // Old single-assignee fields, kept for now. They hold the first assignee.
  assignee_id: string | null;
  created_by: string;
  department_id: string | null;
  team_id: string | null;
  start_date: string | null;
  due_date: string | null;
  progress: number;
  created_at: string;
  updated_at: string;
  assignee: { id: string; full_name: string } | null;
  // Everyone the task is assigned to
  assignees: { id: string; full_name: string }[];
  team: { id: string; name: string; color: string } | null;
}

// What the "New task" form collects (all values are text from form fields)
export interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  assignee_ids: string[];
  team_id: string;
  start_date: string;
  due_date: string;
}

// A person who can be assigned a task
export interface TaskMember {
  id: string;
  full_name: string;
  email: string | null;
  team_ids: string[]; // the teams this person belongs to
}
