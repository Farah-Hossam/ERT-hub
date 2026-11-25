import { createClient } from "@/lib/supabase/client";
import type {
  Task,
  TaskFormData,
  TaskMember,
  TaskStatus,
} from "../types/task.types";

// Fetch each task together with its assignee's name
const TASK_SELECT =
  "*, assignee:profiles!assignee_id(id, full_name), team:teams(id, name, color)";

export async function getTasks(): Promise<Task[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_SELECT)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Task[];
}

export async function createTask(input: TaskFormData): Promise<void> {
  const supabase = createClient();
  // created_by is filled in by the database from the logged-in user
  const { error } = await supabase.from("tasks").insert({
    title: input.title.trim(),
    description: input.description.trim() || null,
    priority: input.priority,
    assignee_id: input.assignee_id || null,
    team_id: input.team_id || null,
    start_date: input.start_date || null,
    due_date: input.due_date || null,
  });

  if (error) throw new Error(error.message);
}

export async function updateTaskProgress(
  id: string,
  changes: { status: TaskStatus; progress: number }
): Promise<void> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update({ status: changes.status, progress: changes.progress })
    .eq("id", id)
    .select("id");

  if (error) throw new Error(error.message);
  // When the security rules block an update, Supabase returns no rows
  // instead of an error, so we check for that ourselves.
  if (!data || data.length === 0) {
    throw new Error("You don't have permission to change this task");
  }
}

export async function getAssignableMembers(): Promise<TaskMember[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, memberships:team_memberships(team_id)")
    .eq("is_active", true)
    .order("full_name");

  if (error) throw new Error(error.message);

  type Row = {
    id: string;
    full_name: string;
    email: string | null;
    memberships: { team_id: string }[] | null;
  };
  return ((data ?? []) as unknown as Row[]).map((row) => ({
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    team_ids: (row.memberships ?? []).map((m) => m.team_id),
  }));
}
export async function deleteTask(id: string): Promise<void> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) throw new Error(error.message);
  // Blocked deletes return no rows instead of an error
  if (!data || data.length === 0) {
    throw new Error("You don't have permission to delete this task");
  }
}
