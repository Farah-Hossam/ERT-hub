"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { eventTypes } from "@/config/event-types";
import {
  validateEventForm,
  type EventFormErrors,
} from "@/lib/validators/event.validator";
import type { EventFormData, EventType } from "../types/event.types";

const emptyForm: EventFormData = {
  title: "",
  description: "",
  type: "meeting",
  location: "",
  start: "",
  end: "",
};

const typeOptions = Object.entries(eventTypes).map(([value, { label }]) => ({
  value,
  label,
}));

interface EventFormProps {
  onSubmit: (data: EventFormData) => Promise<void>;
  onCancel: () => void;
}

export function EventForm({ onSubmit, onCancel }: EventFormProps) {
  const [form, setForm] = useState<EventFormData>(emptyForm);
  const [errors, setErrors] = useState<EventFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof EventFormData>(key: K, value: EventFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const found = validateEventForm(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not save the event");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label="Event name"
        placeholder="Chassis design workshop"
        required
        value={form.title}
        onChange={(e) => update("title", e.target.value)}
        error={errors.title}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Type"
          options={typeOptions}
          value={form.type}
          onChange={(e) => update("type", e.target.value as EventType)}
        />
        <Input
          label="Location"
          placeholder="Workshop room"
          value={form.location}
          onChange={(e) => update("location", e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Starts"
          type="datetime-local"
          required
          value={form.start}
          onChange={(e) => update("start", e.target.value)}
          error={errors.start}
        />
        <Input
          label="Ends"
          type="datetime-local"
          value={form.end}
          onChange={(e) => update("end", e.target.value)}
          error={errors.end}
        />
      </div>

      <Textarea
        label="Description"
        placeholder="What is this event about?"
        value={form.description}
        onChange={(e) => update("description", e.target.value)}
      />

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          Create event
        </Button>
      </div>
    </form>
  );
}
