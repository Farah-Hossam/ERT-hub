import { cn } from "@/lib/utils";
import type { CalendarItem } from "../types/calendar.types";

export function CalendarItemRow({ item }: { item: CalendarItem }) {
  return (
    <li className="flex items-start gap-3 py-2.5">
      <span
        className={cn(
          "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
          item.kind === "event" ? "bg-violet-500" : item.overdue ? "bg-red-600" : "bg-blue-500"
        )}
        aria-hidden
      />
      <div className="min-w-0">
        <p className={cn("text-sm font-medium", item.done && "text-muted line-through")}>
          {item.title}
        </p>
        <p className="text-xs text-muted">
          {item.kind === "event" ? "Event" : "Task deadline"}
          {item.timeLabel ? `, ${item.timeLabel}` : ""}
          {item.subtitle ? `, ${item.subtitle}` : ""}
          {item.overdue ? ", overdue" : ""}
        </p>
      </div>
    </li>
  );
}
