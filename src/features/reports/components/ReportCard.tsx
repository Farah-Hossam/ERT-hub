import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Report } from "../types/report.types";
import { authorName, formatWeekRange } from "../utils";
import { ReportStatusBadge } from "./ReportStatusBadge";

interface ReportCardProps {
  report: Report;
  showAuthor?: boolean;
  onOpen: () => void;
}

export function ReportCard({ report, showAuthor, onOpen }: ReportCardProps) {
  const hasBlockers = report.blockers.trim() !== "" || report.help_needed.trim() !== "";
  const snapshot = report.snapshot;
  const overdue = snapshot?.counts?.overdue ?? 0;
  const blocked = snapshot?.counts?.blocked ?? 0;

  return (
    <Card
      interactive
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {showAuthor && (
            <p className="truncate text-xs text-muted">{authorName(report)}</p>
          )}
          <h2 className="font-semibold leading-snug">
            Week of {formatWeekRange(report.week_start)}
          </h2>
        </div>
        <ReportStatusBadge report={report} />
      </div>

      {snapshot && snapshot.completion !== null ? (
        <div className="flex flex-col gap-1.5">
          <ProgressBar value={snapshot.completion} label="Completion" />
          <p className="text-xs text-muted">
            {snapshot.counts?.total ?? 0} tasks
            {overdue > 0 ? `, ${overdue} overdue` : ""}
            {blocked > 0 ? `, ${blocked} blocked` : ""}
          </p>
        </div>
      ) : (
        <p className="line-clamp-2 text-sm text-muted">
          {report.accomplished.trim() ||
            (snapshot ? "No tasks were assigned this week." : "Nothing written yet.")}
        </p>
      )}

      {hasBlockers && (
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
          <AlertTriangle size={14} />
          Mentions a blocker or needs help
        </p>
      )}
    </Card>
  );
}
