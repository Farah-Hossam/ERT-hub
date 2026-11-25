import { Check } from "lucide-react";
import { teamColors } from "@/config/team-colors";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">Color</span>
      <div role="radiogroup" aria-label="Team color" className="flex flex-wrap gap-2">
        {teamColors.map((color) => {
          const selected = color.hex.toLowerCase() === value.toLowerCase();
          return (
            <button
              key={color.hex}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={color.name}
              title={color.name}
              onClick={() => onChange(color.hex)}
              style={{ backgroundColor: color.hex }}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-white transition-transform hover:scale-110",
                selected && "ring-2 ring-foreground ring-offset-2 ring-offset-surface"
              )}
            >
              {selected && <Check size={16} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
