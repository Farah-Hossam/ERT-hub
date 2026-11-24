import { Card } from "@/components/ui/Card";
import type { Report } from "../types/report.types";
import { authorName } from "../utils";

// Blockers and requests for help reported this week
export function BlockersWidget({ reports }: { reports: Report[] }) {
  const flagged = reports.filter(
    (r) => r.blockers.trim() !== "" || r.help_needed.trim() !== ""
  );

  return (
    <Card>
      <h2 className="mb-2 font-semibold">Blockers and requests for help</h2>
      {flagged.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted">Nothing reported.</p>
      ) : (
        <ul className="divide-y divide-border">
          {flagged.map((r) => (
            <li key={r.id} className="flex flex-col gap-1 py-3 text-sm">
              <span className="font-medium">{authorName(r)}</span>
              {r.blockers.trim() && (
                <span className="text-muted">
                  <span className="font-medium text-foreground">Blocker: </span>
                  {r.blockers}
                </span>
              )}
              {r.help_needed.trim() && (
                <span className="text-muted">
                  <span className="font-medium text-foreground">Needs help: </span>
                  {r.help_needed}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
