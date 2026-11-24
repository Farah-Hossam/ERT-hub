"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { TeamEvent } from "@/features/events/types/event.types";
import type { Task } from "@/features/tasks/types/task.types";
import { formatTaskId } from "@/features/tasks/utils";
import {
  validateReportForm,
  type ReportFormErrors,
} from "@/lib/validators/report.validator";
import { buildReportSnapshot } from "../snapshot";
import type {
  Report,
  ReportFormData,
  ReportSnapshot,
} from "../types/report.types";
import { formatWeekRange } from "../utils";
import { ReportSummary } from "./ReportSummary";

interface ReportFormProps {
  report: Report | null; // the draft being continued, or null for a new report
  weekStart: string;
  userId: string;
  tasks: Task[]; // every task the member can see
  events: TeamEvent[];
  previous: ReportSnapshot | null; // the member's previous report, for progress changes
  onSubmit: (
    data: ReportFormData,
    snapshot: ReportSnapshot,
    submit: boolean
  ) => Promise<void>;
  onCancel: () => void;
}

export function ReportForm({
  report,
  weekStart,
  userId,
  tasks,
  events,
  previous,
  onSubmit,
  onCancel,
}: ReportFormProps) {
  const [form, setForm] = useState<ReportFormData>({
    accomplished: report?.accomplished ?? "",
    challenges: report?.challenges ?? "",
    blockers: report?.blockers ?? "",
    help_needed: report?.help_needed ?? "",
    next_week: report?.next_week ?? "",
    task_notes: Object.fromEntries(
      (report?.task_updates ?? []).map((u) => [u.task_id, u.note])
    ),
  });
  const [errors, setErrors] = useState<ReportFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState<"draft" | "submit" | null>(null);

  // What the report will contain, worked out from the member's tasks right now
  const preview = useMemo(
    () => buildReportSnapshot({ tasks, events, userId, weekStart, previous }),
    [tasks, events, userId, weekStart, previous]
  );

  function updateText(
    key: Exclude<keyof ReportFormData, "task_notes">,
    value: string
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateNote(taskId: string, value: string) {
    setForm((prev) => ({
      ...prev,
      task_notes: { ...prev.task_notes, [taskId]: value },
    }));
  }

  async function handle(submit: boolean) {
    setSubmitError(null);
    const found = validateReportForm(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // Take the summary again at the moment of saving, so it is up to date
    const snapshot = buildReportSnapshot({ tasks, events, userId, weekStart, previous });
    const shownTaskIds = new Set(snapshot.tasks.map((t) => t.id));
    const task_notes = Object.fromEntries(
      Object.entries(form.task_notes).filter(([id]) => shownTaskIds.has(id))
    );

    setSaving(submit ? "submit" : "draft");
    try {
      await onSubmit({ ...form, task_notes }, snapshot, submit);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not save the report");
      setSaving(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted">Week of {formatWeekRange(weekStart)}</p>

      <section className="flex flex-col gap-3">
        <div>
          <h3 className="font-semibold">Automatic summary</h3>
          <p className="text-xs text-muted">
            Built from your tasks and the team calendar. It is saved with the report
            when you submit it, so it stays as it was this week.
          </p>
        </div>
        <ReportSummary
          snapshot={preview}
          renderTaskExtra={(task) => (
            <div className="mt-2">
              <Input
                aria-label={`Note for ${formatTaskId(task.task_number)}`}
                placeholder="Add a note about this task (optional)"
                value={form.task_notes[task.id] ?? ""}
                onChange={(e) => updateNote(task.id, e.target.value)}
              />
            </div>
          )}
        />
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h3 className="font-semibold">Notes (optional)</h3>
          <p className="text-xs text-muted">
            Only write something if there is something the summary does not show.
          </p>
        </div>
        <Textarea
          label="Notes and highlights"
          rows={3}
          value={form.accomplished}
          onChange={(e) => updateText("accomplished", e.target.value)}
          error={errors.accomplished}
        />
        <Textarea
          label="Blockers"
          rows={3}
          placeholder="Anything stopping you from moving forward?"
          value={form.blockers}
          onChange={(e) => updateText("blockers", e.target.value)}
          error={errors.blockers}
        />
        <Textarea
          label="Help needed"
          rows={3}
          value={form.help_needed}
          onChange={(e) => updateText("help_needed", e.target.value)}
          error={errors.help_needed}
        />
      </section>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <div className="flex flex-wrap justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} disabled={saving !== null}>
          Cancel
        </Button>
        <Button
          variant="secondary"
          onClick={() => handle(false)}
          loading={saving === "draft"}
          disabled={saving === "submit"}
        >
          Save draft
        </Button>
        <Button
          onClick={() => handle(true)}
          loading={saving === "submit"}
          disabled={saving === "draft"}
        >
          Submit report
        </Button>
      </div>
    </div>
  );
}
