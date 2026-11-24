"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { EventCard } from "@/features/events/components/EventCard";
import { EventDetails } from "@/features/events/components/EventDetails";
import { EventForm } from "@/features/events/components/EventForm";
import { useEvents } from "@/features/events/hooks/useEvents";
import { isUpcoming } from "@/features/events/utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// Matches the database rules
const MANAGER_ROLES = ["department_head", "operations", "admin"];

export default function EventsPage() {
  const { events, loading, error, addEvent, removeEvent } = useEvents();
  const { profile } = useCurrentUser();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const canManage = !!profile && MANAGER_ROLES.includes(profile.role);
  const upcoming = events.filter(isUpcoming);
  const past = events.filter((e) => !isUpcoming(e)).reverse();
  const selected = events.find((e) => e.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-sm text-muted">
            {loading ? "Loading..." : `${upcoming.length} upcoming`}
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={16} />
            New event
          </Button>
        )}
      </div>

      {error && (
        <Card>
          <p className="text-sm text-red-600">Could not load events: {error}</p>
        </Card>
      )}

      {!loading && !error && events.length === 0 && (
        <Card>
          <p className="text-sm text-muted">No events yet.</p>
        </Card>
      )}

      {upcoming.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Upcoming
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} onOpen={() => setSelectedId(event.id)} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Past
          </h2>
          <div className="grid gap-4 opacity-75 md:grid-cols-2 xl:grid-cols-3">
            {past.map((event) => (
              <EventCard key={event.id} event={event} onOpen={() => setSelectedId(event.id)} />
            ))}
          </div>
        </section>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New event"
        closeOnBackdrop={false}
      >
        <EventForm
          onCancel={() => setCreateOpen(false)}
          onSubmit={async (data) => {
            await addEvent(data);
            setCreateOpen(false);
          }}
        />
      </Modal>

      <Modal open={!!selected} onClose={() => setSelectedId(null)} title="Event">
        {selected && (
          <EventDetails
            key={selected.id}
            event={selected}
            canDelete={canManage}
            onClose={() => setSelectedId(null)}
            onDelete={async () => {
              await removeEvent(selected.id);
              setSelectedId(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}
