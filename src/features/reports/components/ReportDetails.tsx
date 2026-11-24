"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { formatTaskId } from "@/features/tasks/utils";
import type { Report } from "../types/report.types";
import { authorName, formatWeekRange } from "../utils";
import { ReportStatusBadge } from "./ReportStatusBadge";
import { ReportSummary } from "./ReportSummary";

function Field({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm">{value}</p>
    </div>
  );
}

interface ReportDetailsProps {
  report: Report;
  canReview: boolean;
  onReview: (feedback: string) => Promise<void>;
  onClose: () => void;
}

export function ReportDetails({ report, canReview, onReview, onClose }: ReportDetailsProps) {
  const [feedback, setFeedback] = useState(report.review_feedback ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const notesByTask = new Map(report.task_updates.map((u) => [u.task_id, u.note]));

  async function handleReview() {
    setError(null);
    setSaving(true);
    try {
      await onReview(feedback);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the review");
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm text-muted">{authorName(report)}</p>
        <h3 className="text-lg font-semibold">
          Week of {formatWeekRange(report.week_start)}
        </h3>
        <div className="mt-2">
          <ReportStatusBadge report={report} />
        </div>
      </div>

      {report.snapshot ? (
        <ReportSummary
          snapshot={report.snapshot}
          renderTaskExtra={(task) => {
            const note = notesByTask.get(task.id);
            return note ? (
              <p className="mt-1.5 rounded-md bg-surface-secondary/60 px-2.5 py-1.5 text-xs">
                {note}
              </p>
            ) : null;
          }}
        />
      ) : (
        report.task_updates.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Task updates
            </p>
            <ul className="mt-1 flex flex-col gap-2">
              {report.task_updates.map((u) => (
                <li key={u.id} className="text-sm">
                  <span className="font-medium">
                    {u.task ? `${formatTaskId(u.task.task_number)} ${u.task.title}` : "Task"}
                  </span>
                  <span className="text-muted">: {u.note}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      )}

      <Field label="Notes and highlights" value={report.accomplished} />
      <Field label="Blockers" value={report.blockers} />
      <Field label="Help needed" value={report.help_needed} />
      <Field label="Challenges" value={report.challenges} />
      <Field label="Plan for next week" value={report.next_week} />

      {canReview ? (
        <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
          <Textarea
            label="Your feedback"
            rows={3}
            placeholder="Optional"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end">
            <Button onClick={handleReview} loading={saving}>
              {report.status === "reviewed" ? "Update review" : "Mark as reviewed"}
            </Button>
          </div>
        </div>
      ) : (
        report.review_feedback && (
          <div className="rounded-lg border border-border p-4">
            <Field label="Reviewer feedback" value={report.review_feedback} />
          </div>
        )
      )}

      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
