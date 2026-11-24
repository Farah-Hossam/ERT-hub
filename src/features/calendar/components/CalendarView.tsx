"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { parseDateKey, toDateKey } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { CalendarItem } from "../types/calendar.types";
import { groupByDate } from "../utils";
import { AgendaView } from "./AgendaView";
import { CalendarItemRow } from "./CalendarItemRow";
import { MonthView } from "./MonthView";

type View = "month" | "agenda";

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
        active
          ? "border-brand bg-brand/10 text-brand"
          : "border-border text-muted hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export function CalendarView({ items }: { items: CalendarItem[] }) {
  // Set after the page loads, so the server and the browser never disagree
  // about what "today" is.
  const [monthStart, setMonthStart] = useState<Date | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [view, setView] = useState<View>("month");
  const [showTasks, setShowTasks] = useState(true);
  const [showEvents, setShowEvents] = useState(true);

  useEffect(() => {
    const now = new Date();
    setMonthStart(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedKey(toDateKey(now));
  }, []);

  const itemsByDate = useMemo(
    () =>
      groupByDate(
        items.filter((i) => (i.kind === "task" ? showTasks : showEvents))
      ),
    [items, showTasks, showEvents]
  );

  if (!monthStart) {
    return <p className="text-sm text-muted">Loading...</p>;
  }

  const todayKey = toDateKey(new Date());
  const selectedItems = selectedKey ? itemsByDate.get(selectedKey) ?? [] : [];

  function goToMonth(offset: number) {
    setMonthStart((prev) =>
      prev ? new Date(prev.getFullYear(), prev.getMonth() + offset, 1) : prev
    );
  }

  function goToToday() {
    const now = new Date();
    setMonthStart(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedKey(toDateKey(now));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" aria-label="Previous month" onClick={() => goToMonth(-1)}>
            <ChevronLeft size={16} />
          </Button>
          <h2 className="min-w-40 text-center text-lg font-semibold">
            {monthStart.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
          </h2>
          <Button variant="outline" size="sm" aria-label="Next month" onClick={() => goToMonth(1)}>
            <ChevronRight size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>

        <div
          role="group"
          aria-label="Calendar view"
          className="flex items-center gap-0.5 rounded-lg border border-border bg-surface-secondary p-0.5"
        >
          {(["month", "agenda"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setView(option)}
              aria-pressed={view === option}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                view === option ? "bg-surface text-brand shadow-sm" : "text-muted hover:text-foreground"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip active={showTasks} onClick={() => setShowTasks(!showTasks)}>
          Task deadlines
        </FilterChip>
        <FilterChip active={showEvents} onClick={() => setShowEvents(!showEvents)}>
          Events
        </FilterChip>
      </div>

      {view === "month" ? (
        <>
          <MonthView
            monthStart={monthStart}
            itemsByDate={itemsByDate}
            selectedKey={selectedKey}
            onSelect={setSelectedKey}
          />
          {selectedKey && (
            <Card>
              <h3 className="text-sm font-semibold">
                {parseDateKey(selectedKey).toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              {selectedItems.length === 0 ? (
                <p className="mt-2 text-sm text-muted">Nothing on this day.</p>
              ) : (
                <ul className="mt-1 divide-y divide-border">
                  {selectedItems.map((item) => (
                    <CalendarItemRow key={item.id} item={item} />
                  ))}
                </ul>
              )}
            </Card>
          )}
        </>
      ) : (
        <AgendaView itemsByDate={itemsByDate} fromKey={todayKey} />
      )}
    </div>
  );
}
