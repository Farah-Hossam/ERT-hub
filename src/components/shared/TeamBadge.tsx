import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamBadgeProps {
  team: { name: string; color: string };
  lead?: boolean;
  className?: string;
}

// A team's name with its color. The name is always written out,
// so the color is never the only clue.
export function TeamBadge({ team, lead, className }: TeamBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-xs font-medium",
        className
      )}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: team.color }}
        aria-hidden
      />
      {team.name}
      {lead && <Star size={11} className="fill-current text-amber-500" aria-label="Team lead" />}
    </span>
  );
}
