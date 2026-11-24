"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { CalendarView } from "@/features/calendar/components/CalendarView";
import { buildCalendarItems } from "@/features/calendar/utils";
import { useEvents } from "@/features/events/hooks/useEvents";
import { useTasks } from "@/features/tasks/hooks/useTasks";

export default function CalendarPage() {
  const { tasks, error: tasksError } = useTasks();
  const { events, error: eventsError } = useEvents();

  const items = useMemo(() => buildCalendarItems(tasks, events), [tasks, events]);
  const error = tasksError ?? eventsError;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-sm text-muted">Task deadlines and events in one place.</p>
      </div>

      {error && (
        <Card>
          <p className="text-sm text-red-600">Could not load everything: {error}</p>
        </Card>
      )}

      <CalendarView items={items} />
    </div>
  );
}
