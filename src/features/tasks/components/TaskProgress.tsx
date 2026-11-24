"use client";

interface TaskProgressProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

// Slider for setting a task's progress (manual progress for now)
export function TaskProgress({ value, onChange, disabled }: TaskProgressProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Progress</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Progress"
        className="w-full accent-brand disabled:opacity-50"
      />
    </div>
  );
}
