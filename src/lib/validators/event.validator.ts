import type { EventFormData } from "@/features/events/types/event.types";

export type EventFormErrors = Partial<Record<keyof EventFormData, string>>;

export function validateEventForm(data: EventFormData): EventFormErrors {
  const errors: EventFormErrors = {};

  const title = data.title.trim();
  if (!title) {
    errors.title = "Give the event a name";
  } else if (title.length > 120) {
    errors.title = "Keep the name under 120 characters";
  }

  if (!data.start) {
    errors.start = "Choose when the event starts";
  }

  // "YYYY-MM-DDTHH:mm" text compares correctly as text
  if (data.start && data.end && data.end < data.start) {
    errors.end = "The end can't be before the start";
  }

  return errors;
}
