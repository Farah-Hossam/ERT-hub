export type EventType =
  | "meeting"
  | "workshop"
  | "training"
  | "recruitment"
  | "competition"
  | "other";

export interface TeamEvent {
  id: string;
  title: string;
  description: string | null;
  type: EventType;
  location: string | null;
  start_at: string;
  end_at: string | null;
  organizer_id: string | null;
  created_at: string;
  organizer: { id: string; full_name: string } | null;
}

// What the "New event" form collects. start and end are text from
// <input type="datetime-local">, for example "2026-12-01T18:00".
export interface EventFormData {
  title: string;
  description: string;
  type: EventType;
  location: string;
  start: string;
  end: string;
}
