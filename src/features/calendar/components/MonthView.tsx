import { cn } from "@/lib/utils";
import { toDateKey } from "@/lib/dates";
import type { CalendarItem } from "../types/calendar.types";
import { getMonthGrid } from "../utils";

const MAX_VISIBLE = 2;

function pillStyle(item: CalendarItem): string {
  if (item.kind === "event") return "bg-violet-500/15 text-violet-700 dark:text-violet-300";
  if (item.done) return "bg-surface-secondary text-muted line-through";
  if (item.overdue) return "bg-red-500/15 text-red-700 dark:text-red-400";
  return "bg-blue-500/15 text-blue-700 dark:text-blue-400";
}

function dotStyle(item: CalendarItem): string {
  if (item.kind === "event") return "bg-violet-500";
  if (item.overdue) return "bg-red-600";
  return "bg-blue-500";
}

interface MonthViewProps {
  monthStart: Date;
  itemsByDate: Map<string, CalendarItem[]>;
  selectedKey: string | null;
  onSelect: (dateKey: string) => void;
}

export function MonthView({ monthStart, itemsByDate, selectedKey, onSelect }: MonthViewProps) {
  const days = getMonthGrid(monthStart);
  const todayKey = toDateKey(new Date());

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="grid grid-cols-7 border-b border-border bg-surface-secondary/60">
        {days.slice(0, 7).map((day) => (
          <div
            key={day.getDay()}
            className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted"
          >
            {day.toLocaleDateString("en-GB", { weekday: "short" })}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = toDateKey(day);
          const items = itemsByDate.get(key) ?? [];
          const inMonth = day.getMonth() === monthStart.getMonth();
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              aria-label={`${day.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}, ${items.length} items`}
              aria-pressed={isSelected}
              className={cn(
                "flex min-h-16 flex-col gap-1 border-b border-r border-border p-1.5 text-left transition-colors hover:bg-surface-secondary sm:min-h-24",
                !inMonth && "bg-surface-secondary/40 text-muted",
                isSelected && "ring-2 ring-inset ring-brand"
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                  isToday && "bg-brand text-white"
                )}
              >
                {day.getDate()}
              </span>

              {/* Small screens: dots. Larger screens: short labels. */}
              <div className="flex flex-wrap gap-1 sm:hidden">
                {items.slice(0, 4).map((item) => (
                  <span key={item.id} className={cn("h-1.5 w-1.5 rounded-full", dotStyle(item))} />
                ))}
              </div>
              <div className="hidden flex-col gap-1 sm:flex">
                {items.slice(0, MAX_VISIBLE).map((item) => (
                  <span
                    key={item.id}
                    className={cn("truncate rounded px-1.5 py-0.5 text-xs", pillStyle(item))}
                  >
                    {item.title}
                  </span>
                ))}
                {items.length > MAX_VISIBLE && (
                  <span className="px-1 text-xs text-muted">
                    +{items.length - MAX_VISIBLE} more
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
