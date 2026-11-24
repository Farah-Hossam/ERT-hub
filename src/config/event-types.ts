import type { BadgeVariant } from "@/config/task-status";
import type { EventType } from "@/features/events/types/event.types";

export const eventTypes: Record<
  EventType,
  { label: string; variant: BadgeVariant }
> = {
  meeting: { label: "Meeting", variant: "info" },
  workshop: { label: "Workshop", variant: "brand" },
  training: { label: "Training", variant: "success" },
  recruitment: { label: "Recruitment", variant: "warning" },
  competition: { label: "Competition", variant: "danger" },
  other: { label: "Other", variant: "neutral" },
};
