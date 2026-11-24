import { createClient } from "@/lib/supabase/client";
import type { EventFormData, TeamEvent } from "../types/event.types";

const EVENT_SELECT = "*, organizer:profiles!organizer_id(id, full_name)";

export async function getEvents(): Promise<TeamEvent[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .order("start_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as TeamEvent[];
}

export async function createEvent(input: EventFormData): Promise<void> {
  const supabase = createClient();
  // The form gives local time text; toISOString turns it into a real moment
  const { error } = await supabase.from("events").insert({
    title: input.title.trim(),
    description: input.description.trim() || null,
    type: input.type,
    location: input.location.trim() || null,
    start_at: new Date(input.start).toISOString(),
    end_at: input.end ? new Date(input.end).toISOString() : null,
  });

  if (error) throw new Error(error.message);
}

export async function deleteEvent(id: string): Promise<void> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    throw new Error("You don't have permission to delete this event");
  }
}
