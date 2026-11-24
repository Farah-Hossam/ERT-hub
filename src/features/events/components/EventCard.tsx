import { CalendarDays, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { eventTypes } from "@/config/event-types";
import type { TeamEvent } from "../types/event.types";
import { formatEventWhen } from "../utils";

interface EventCardProps {
  event: TeamEvent;
  onOpen: () => void;
}

export function EventCard({ event, onOpen }: EventCardProps) {
  const type = eventTypes[event.type];

  return (
    <Card
      interactive
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-semibold leading-snug">{event.title}</h2>
        <Badge variant={type.variant}>{type.label}</Badge>
      </div>

      <div className="flex flex-col gap-1.5 text-sm text-muted">
        <span className="inline-flex items-center gap-2">
          <CalendarDays size={15} className="shrink-0" />
          {formatEventWhen(event.start_at, event.end_at)}
        </span>
        {event.location && (
          <span className="inline-flex items-center gap-2">
            <MapPin size={15} className="shrink-0" />
            {event.location}
          </span>
        )}
      </div>
    </Card>
  );
}
