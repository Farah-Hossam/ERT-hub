import { createClient } from "@/lib/supabase/client";
import type {
  ActiveMember,
  Report,
  ReportFormData,
  ReportSnapshot,
} from "../types/report.types";

const REPORT_SELECT =
  "*, author:profiles!author_id(id, full_name, email), task_updates:report_task_updates(id, task_id, note, task:tasks(task_number, title))";

export async function getReports(): Promise<Report[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reports")
    .select(REPORT_SELECT)
    .order("week_start", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Report[];
}

interface SaveReportInput {
  id?: string; // the draft being edited, if any
  week_start: string;
  data: ReportFormData;
  snapshot: ReportSnapshot; // the automatic summary taken now
  submit: boolean;
}

// Saves a draft (new or existing) and, if asked, submits it
export async function saveReport({
  id,
  week_start,
  data,
  snapshot,
  submit,
}: SaveReportInput): Promise<void> {
  const supabase = createClient();
  const content = {
    accomplished: data.accomplished.trim(),
    challenges: data.challenges.trim(),
    blockers: data.blockers.trim(),
    help_needed: data.help_needed.trim(),
    next_week: data.next_week.trim(),
    snapshot,
  };

  let reportId: string;

  if (id) {
    reportId = id;
    const { data: rows, error } = await supabase
      .from("reports")
      .update(content)
      .eq("id", id)
      .select("id");
    if (error) throw new Error(error.message);
    if (!rows || rows.length === 0) throw new Error("You can't edit this report");
  } else {
    const { data: row, error } = await supabase
      .from("reports")
      .insert({ week_start, ...content })
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") {
        throw new Error("You already have a report for this week");
      }
      throw new Error(error.message);
    }
    reportId = row.id as string;
  }

  // Replace the task notes with what the form now says
  const cleared = await supabase
    .from("report_task_updates")
    .delete()
    .eq("report_id", reportId);
  if (cleared.error) throw new Error(cleared.error.message);

  const updates = Object.entries(data.task_notes)
    .map(([task_id, note]) => ({ report_id: reportId, task_id, note: note.trim() }))
    .filter((u) => u.note.length > 0);

  if (updates.length > 0) {
    const inserted = await supabase.from("report_task_updates").insert(updates);
    if (inserted.error) throw new Error(inserted.error.message);
  }

  if (submit) {
    const { data: rows, error } = await supabase
      .from("reports")
      .update({ status: "submitted" })
      .eq("id", reportId)
      .select("id");
    if (error) throw new Error(error.message);
    if (!rows || rows.length === 0) throw new Error("Could not submit the report");
  }
}

export async function reviewReport(id: string, feedback: string): Promise<void> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reports")
    .update({ status: "reviewed", review_feedback: feedback.trim() || null })
    .eq("id", id)
    .select("id");

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    throw new Error("You don't have permission to review this report");
  }
}

// Used to find who has not reported. This will move to the team feature
// when we build teams.
export async function getActiveMembers(): Promise<ActiveMember[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("is_active", true)
    .order("full_name");

  if (error) throw new Error(error.message);
  return (data ?? []) as ActiveMember[];
}
