"use client";

import { Columns3, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export type TaskView = "cards" | "board";

const options: { value: TaskView; label: string; icon: typeof LayoutGrid }[] = [
  { value: "cards", label: "Cards", icon: LayoutGrid },
  { value: "board", label: "Board", icon: Columns3 },
];

interface TaskViewToggleProps {
  value: TaskView;
  onChange: (view: TaskView) => void;
}

export function TaskViewToggle({ value, onChange }: TaskViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="Task view"
      className="flex items-center gap-0.5 rounded-lg border border-border bg-surface-secondary p-0.5"
    >
      {options.map(({ value: option, label, icon: Icon }) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={value === option}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            value === option
              ? "bg-surface text-brand shadow-sm"
              : "text-muted hover:text-foreground"
          )}
        >
          <Icon size={15} />
          {label}
        </button>
      ))}
    </div>
  );
}
