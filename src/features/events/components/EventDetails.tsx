"use client";

import { useState } from "react";
import { CalendarDays, MapPin, User } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { eventTypes } from "@/config/event-types";
import type { TeamEvent } from "../types/event.types";
import { formatEventWhen } from "../utils";

interface EventDetailsProps {
  event: TeamEvent;
  canDelete: boolean;
  onDelete: () => Promise<void>;
  onClose: () => void;
}

export function EventDetails({ event, canDelete, onDelete, onClose }: EventDetailsProps) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const type = eventTypes[event.type];

  async function handleDelete() {
    setError(null);
    setDeleting(true);
    try {
      await onDelete();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete the event");
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-lg font-semibold leading-snug">{event.title}</h3>
        <div className="mt-2">
          <Badge variant={type.variant}>{type.label}</Badge>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm text-muted">
        <span className="inline-flex items-center gap-2">
          <CalendarDays size={16} className="shrink-0" />
          {formatEventWhen(event.start_at, event.end_at)}
        </span>
        {event.location && (
          <span className="inline-flex items-center gap-2">
            <MapPin size={16} className="shrink-0" />
            {event.location}
          </span>
        )}
        {event.organizer && (
          <span className="inline-flex items-center gap-2">
            <User size={16} className="shrink-0" />
            Organized by {event.organizer.full_name || "Unnamed"}
          </span>
        )}
      </div>

      {event.description && (
        <p className="whitespace-pre-wrap text-sm">{event.description}</p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between gap-2">
        {canDelete ? (
          confirming ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Delete this event?</span>
              <Button variant="destructive" size="sm" loading={deleting} onClick={handleDelete}>
                Yes, delete
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                No
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
              Delete event
            </Button>
          )
        ) : (
          <span />
        )}
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
