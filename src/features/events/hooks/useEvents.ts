"use client";

import { useCallback, useEffect, useState } from "react";
import { createEvent, deleteEvent, getEvents } from "../services/eventService";
import type { EventFormData, TeamEvent } from "../types/event.types";

export function useEvents() {
  const [events, setEvents] = useState<TeamEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setEvents(await getEvents());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addEvent = useCallback(
    async (input: EventFormData) => {
      await createEvent(input);
      await refresh();
    },
    [refresh]
  );

  const removeEvent = useCallback(
    async (id: string) => {
      await deleteEvent(id);
      await refresh();
    },
    [refresh]
  );

  return { events, loading, error, refresh, addEvent, removeEvent };
}
