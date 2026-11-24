import { Badge } from "@/components/ui/Badge";
import type { BadgeVariant } from "@/config/task-status";
import type { Report, ReportStatus } from "../types/report.types";
import { isLate } from "../utils";

const statuses: Record<ReportStatus, { label: string; variant: BadgeVariant }> = {
  draft: { label: "Draft", variant: "neutral" },
  submitted: { label: "Submitted", variant: "info" },
  reviewed: { label: "Reviewed", variant: "success" },
};

export function ReportStatusBadge({
  report,
}: {
  report: Pick<Report, "status" | "submitted_at" | "week_start">;
}) {
  const { label, variant } = statuses[report.status];

  return (
    <span className="inline-flex items-center gap-1.5">
      <Badge variant={variant}>{label}</Badge>
      {isLate(report) && <Badge variant="warning">Late</Badge>}
    </span>
  );
}
