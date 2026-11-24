import { Card } from "@/components/ui/Card";
import { parseDateKey } from "@/lib/dates";
import type { CalendarItem } from "../types/calendar.types";
import { CalendarItemRow } from "./CalendarItemRow";

interface AgendaViewProps {
  itemsByDate: Map<string, CalendarItem[]>;
  fromKey: string; // only days from this date onwards are shown
}

// A plain list of what is coming up, day by day
export function AgendaView({ itemsByDate, fromKey }: AgendaViewProps) {
  const days = [...itemsByDate.keys()].filter((key) => key >= fromKey).sort();

  if (days.length === 0) {
    return (
      <Card>
        <p className="text-sm text-muted">Nothing coming up.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {days.map((key) => (
        <Card key={key}>
          <h3 className="text-sm font-semibold">
            {parseDateKey(key).toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h3>
          <ul className="mt-1 divide-y divide-border">
            {(itemsByDate.get(key) ?? []).map((item) => (
              <CalendarItemRow key={item.id} item={item} />
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
